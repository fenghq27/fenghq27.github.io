'use strict';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function picture(photo) {
  const img = element('img');
  img.src = photo.src;
  img.alt = photo.alt;
  return img;
}

function photoFigure(photo) {
  const figure = element('figure');
  figure.append(picture(photo));
  if (photo.caption) figure.append(element('figcaption', photo.caption));
  return figure;
}

function button(label, className) {
  const control = element('button', label, className);
  control.type = 'button';
  return control;
}

function renderMap() {
  const map = document.querySelector('#map');
  const surface = document.querySelector('#globe-surface');
  const preview = document.querySelector('#preview');
  const list = document.querySelector('#places');
  const dialog = document.querySelector('#place-dialog');
  const content = document.querySelector('#place-content');
  let opener;

  document.querySelector('#place-count').textContent =
    places.length + (places.length === 1 ? ' PIN' : ' PINS');

  function showPreview(place) {
    preview.replaceChildren();
    const photo = place.photos?.[0];
    if (photo) preview.append(photoFigure(photo));
    preview.append(element('span', place.region + (place.sample ? ' · EXAMPLE' : ''), 'eyebrow'),
      element('h2', place.city));
    const open = button('Open postcard ↗', 'paper-button');
    open.addEventListener('click', () => openPlace(place, open));
    preview.append(open);
  }

  function openPlace(place, control) {
    opener = control;
    const heading = element('h2', place.city);
    heading.id = 'place-title';
    content.replaceChildren(element('p', place.region + (place.sample ? ' · EXAMPLE' : ''), 'eyebrow'), heading);
    if (place.photos?.length) {
      const photos = element('div', '', 'postcard-photos');
      for (const photo of place.photos) {
        const figure = photoFigure(photo);
        const detail = element('details', '', 'photo-note');
        const summary = element('summary');
        summary.append(figure, element('span', 'Look closer ↗', 'eyebrow'));
        detail.append(summary, element('p', photo.note || photo.caption || photo.alt));
        photos.append(detail);
      }
      content.append(photos);
    }
    for (const story of place.stories ?? []) {
      const article = element('article', '', 'story');
      article.append(element('h3', story.title));
      for (const paragraph of story.text.split('\n')) {
        if (paragraph.trim()) article.append(element('p', paragraph));
      }
      content.append(article);
    }
    if (!place.photos?.length && !place.stories?.length) {
      content.append(element('p', 'A postcard is still on its way.'));
    }
    dialog.showModal();
  }

  const radians = Math.PI / 180;
  const pins = [];
  const context = surface.getContext('2d');
  const texture = document.createElement('canvas');
  texture.width = 900;
  texture.height = 400;
  const textureContext = texture.getContext('2d');
  let pixels;
  let longitude = -85;
  let latitude = 32;
  let redrawPending = false;
  const size = surface.width;
  const radius = size / 2;
  const frame = context.createImageData(size, size);

  function draw() {
    redrawPending = false;
    const tilt = latitude * radians;
    const sinTilt = Math.sin(tilt);
    const cosTilt = Math.cos(tilt);
    for (const [place, pin] of pins) {
      const lat = place.lat * radians;
      const delta = (place.lon - longitude) * radians;
      const east = Math.cos(lat) * Math.sin(delta);
      const north = cosTilt * Math.sin(lat) - sinTilt * Math.cos(lat) * Math.cos(delta);
      const depth = sinTilt * Math.sin(lat) + cosTilt * Math.cos(lat) * Math.cos(delta);
      pin.hidden = depth < 0.02;
      pin.style.left = (50 + east * 50) + '%';
      pin.style.top = (50 - north * 50) + '%';
    }
    if (!pixels) return;
    for (let row = 0; row < size; row++) {
      const north = (radius - row - 0.5) / radius;
      for (let col = 0; col < size; col++) {
        const east = (col + 0.5 - radius) / radius;
        const length = east * east + north * north;
        if (length >= 1) continue;
        const depth = Math.sqrt(1 - length);
        const lat = Math.asin(Math.max(-1, Math.min(1, north * cosTilt + depth * sinTilt)));
        const lon = longitude + Math.atan2(east, depth * cosTilt - north * sinTilt) / radians;
        const x = Math.floor(((lon + 180) % 360 + 360) % 360 * texture.width / 360);
        const y = Math.min(texture.height - 1, Math.floor((90 - lat / radians) * texture.height / 180));
        const source = (y * texture.width + x) * 4;
        const target = (row * size + col) * 4;
        const shade = 0.84 + 0.16 * depth;
        for (let channel = 0; channel < 3; channel++) frame.data[target + channel] = pixels[source + channel] * shade;
        frame.data[target + 3] = 255;
      }
    }
    context.putImageData(frame, 0, 0);
  }

  function scheduleDraw() {
    if (redrawPending) return;
    redrawPending = true;
    requestAnimationFrame(draw);
  }

  const world = new Image();
  world.addEventListener('load', () => {
    textureContext.fillStyle = '#f6ebd5';
    textureContext.fillRect(0, 0, texture.width, texture.height);
    textureContext.drawImage(world, 0, 0, texture.width, texture.height);
    pixels = textureContext.getImageData(0, 0, texture.width, texture.height).data;
    scheduleDraw();
  });
  world.src = 'assets/world.svg';

  for (const place of places) {
    const pin = button('', 'pin');
    pin.title = place.city;
    pin.setAttribute('aria-label', 'Open postcard from ' + place.city);
    pin.addEventListener('pointerenter', () => showPreview(place));
    pin.addEventListener('focus', () => showPreview(place));
    pin.addEventListener('click', () => openPlace(place, pin));
    const stop = button(place.city, 'paper-button');
    stop.addEventListener('click', () => {
      longitude = place.lon;
      latitude = place.lat;
      showPreview(place);
      scheduleDraw();
      openPlace(place, stop);
    });
    pins.push([place, pin]);
    map.append(pin);
    list.append(stop);
  }

  for (const control of document.querySelectorAll('[data-turn]')) {
    control.addEventListener('click', () => {
      longitude += Number(control.dataset.turn) * 35;
      scheduleDraw();
    });
  }

  let drag;
  surface.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, longitude, latitude };
    surface.setPointerCapture(event.pointerId);
  });
  surface.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    longitude = drag.longitude - (event.clientX - drag.x) * 180 / surface.clientWidth;
    latitude = Math.max(-75, Math.min(75, drag.latitude + (event.clientY - drag.y) * 180 / surface.clientHeight));
    scheduleDraw();
  });
  surface.addEventListener('lostpointercapture', () => { drag = null; });
  scheduleDraw();
  if (places.length) showPreview(places[0]);
  else preview.append(element('p', 'The map is waiting for its first pin.'));
  dialog.addEventListener('close', () => opener?.focus());
}

function addFilters(container, allLabel, values, onChange) {
  for (const value of [null, ...values]) {
    const filter = button(value ?? allLabel, 'paper-button');
    filter.setAttribute('aria-pressed', String(value === null));
    filter.addEventListener('click', () => {
      for (const other of container.children) {
        other.setAttribute('aria-pressed', String(other === filter));
      }
      onChange(value);
    });
    container.append(filter);
  }
}

function renderKitchen() {
  const notebook = document.querySelector('#dishes');
  const categories = [...new Set(dishes.map(dish => dish.category))];
  function show(category) {
    notebook.replaceChildren();
    const matches = dishes.filter(dish => !category || dish.category === category);
    if (!matches.length) notebook.append(element('p', 'The notebook is still open to a blank page.'));
    for (const [index, dish] of matches.entries()) {
      const entry = element('details', '', 'dish');
      const summary = element('summary');
      const label = element('div', '', 'dish-label');
      label.append(element('p', `0${index + 1} / ${dish.category}` + (dish.sample ? ' · EXAMPLE' : ''), 'eyebrow'),
        element('h2', dish.title), element('span', 'Open notebook ↘', 'annotation'));
      if (dish.image) summary.append(photoFigure(dish.image));
      summary.append(label);
      const notes = element('div', '', 'dish-notes');
      if (dish.ingredients?.length) {
        const ingredients = element('ul');
        for (const ingredient of dish.ingredients) ingredients.append(element('li', ingredient));
        notes.append(element('h3', 'On the counter'), ingredients);
      }
      if (dish.note) notes.append(element('p', dish.note));
      entry.append(summary, notes);
      notebook.append(entry);
    }
  }
  addFilters(document.querySelector('#kitchen-filters'), 'All dishes', categories, show);
  show(null);
}

function renderShelf() {
  const film = document.querySelector('#film-roll');
  const book = document.querySelector('#book-spread');
  const previous = document.querySelector('#previous-spread');
  const next = document.querySelector('#next-spread');
  const pageCount = document.querySelector('#page-count');
  let books = [];
  let page = 0;

  function metadata(item) {
    const status = item.status === 'Saved' ? 'Planned' : item.medium === 'Book' ? 'Read' : 'Watched';
    return status + (item.sample ? ' / Example' : '');
  }

  function appendNotes(container, item) {
    if (item.creator) container.append(element('p', item.creator, 'byline'));
    if (item.rating != null) container.append(element('p', item.rating + ' / 5', 'eyebrow'));
    if (item.note) container.append(element('p', item.note, 'annotation'));
  }

  function turnPage() {
    book.replaceChildren();
    for (let offset = 0; offset < 2; offset++) {
      const item = books[page + offset];
      const leaf = element('article', '', 'book-leaf');
      if (item) {
        leaf.append(element('p', metadata(item), 'eyebrow'));
        if (item.image) leaf.append(picture(item.image));
        leaf.append(element('h3', item.title));
        appendNotes(leaf, item);
        leaf.append(element('small', String(page + offset + 1), 'folio'));
      } else if (offset === 0) {
        leaf.append(element('p', 'No books here yet.'));
      }
      book.append(leaf);
    }
    previous.disabled = page === 0;
    next.disabled = page + 2 >= books.length;
    const first = page + 1;
    const last = Math.min(page + 2, books.length);
    const range = first === last ? String(first) : `${first}–${last}`;
    pageCount.textContent = books.length ? `${range} / ${books.length}` : '0 books';
  }

  function show(status) {
    const matches = shelf.filter(item => !status || status === item.status);
    const films = matches.filter(item => item.medium === 'Movie' || item.medium === 'Show');
    film.replaceChildren();
    if (!films.length) film.append(element('p', 'No films or shows on this roll.'));
    for (const item of films) {
      const frame = element('details', '', 'film-frame');
      const summary = element('summary');
      if (item.image) summary.append(picture(item.image));
      else summary.append(element('span', '▷', 'frame-mark'));
      summary.append(element('span', item.title), element('small', metadata(item)));
      const notes = element('div', '', 'frame-notes');
      appendNotes(notes, item);
      if (!notes.childNodes.length) notes.append(element('p', 'No notes yet.'));
      frame.append(summary, notes);
      film.append(frame);
    }
    books = matches.filter(item => item.medium === 'Book');
    page = 0;
    turnPage();
  }

  previous.addEventListener('click', () => { page -= 2; turnPage(); if (previous.disabled && !next.disabled) next.focus(); });
  next.addEventListener('click', () => { page += 2; turnPage(); if (next.disabled && !previous.disabled) previous.focus(); });
  addFilters(document.querySelector('#status-filters'), 'All statuses', ['Saved', 'Finished'], show);
  show(null);
}

switch (document.body.dataset.page) {
  case 'travel': renderMap(); break;
  case 'cooking': renderKitchen(); break;
  case 'shelf': renderShelf(); break;
}
