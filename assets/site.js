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
  const threads = document.querySelector('#threads');
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

  const points = [];
  for (const [index, place] of places.entries()) {
    const x = (place.lon + 180) / 360;
    const y = (90 - place.lat) / 180;
    points.push([x * 900, y * 400]);
    const pin = button(String(index + 1).padStart(2, '0'), 'pin');
    pin.setAttribute('aria-label', 'Open postcard from ' + place.city);
    pin.style.left = (x * 100) + '%';
    pin.style.top = (y * 100) + '%';
    const stop = button(place.city, 'paper-button');
    for (const control of [pin, stop]) {
      control.addEventListener('pointerenter', () => showPreview(place));
      control.addEventListener('focus', () => showPreview(place));
      control.addEventListener('click', () => openPlace(place, control));
    }
    map.append(pin);
    list.append(stop);
  }

  const thread = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i - 1];
    const [endX, endY] = points[i];
    if (Math.abs(x - endX) > 450) continue;
    const height = Math.min(y, endY) - Math.min(70, Math.abs(x - endX) / 3);
    thread.setAttribute('d', (thread.getAttribute('d') || '') +
      `M${x} ${y} Q${(x + endX) / 2} ${height} ${endX} ${endY} `);
  }
  threads.append(thread);
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
  const catalog = document.querySelector('#media');
  let medium = null;
  let status = null;
  let selected;
  function show() {
    const matches = shelf.filter(item => (!medium || medium === item.medium) && (!status || status === item.status));
    const index = element('div', '', 'catalog-index');
    const reading = element('article', '', 'catalog-reading');
    catalog.replaceChildren(index, reading);
    const controls = [];
    function select(item) {
      selected = item;
      for (const [record, control] of controls) control.setAttribute('aria-pressed', String(record === item));
      const cover = element('div', '', 'catalog-cover');
      cover.dataset.medium = item.medium;
      if (item.image) cover.append(picture(item.image));
      else cover.append(element('span', item.medium), element('strong', item.title), element('span', item.creator));
      const copy = element('div', '', 'catalog-copy');
      copy.append(element('p', item.medium + ' / ' + item.status + (item.sample ? ' · EXAMPLE' : ''), 'eyebrow'),
        element('h2', item.title));
      if (item.creator) copy.append(element('p', item.creator, 'byline'));
      if (item.rating != null) copy.append(element('p', item.rating + ' / 5', 'eyebrow'));
      if (item.note) copy.append(element('p', item.note, 'annotation'));
      reading.replaceChildren(cover, copy);
    }
    for (const item of matches) {
      const control = button('', 'catalog-entry');
      const label = item.status === 'Saved' ? 'Planned' : item.medium === 'Book' ? 'Read' : 'Watched';
      control.append(element('span', item.title), element('small', label));
      control.addEventListener('click', () => select(item));
      controls.push([item, control]);
      index.append(control);
    }
    if (matches.length) select(matches.includes(selected) ? selected : matches[0]);
    else index.append(element('p', 'Nothing filed under these filters.'));
  }
  addFilters(document.querySelector('#medium-filters'), 'Books & films', ['Book', 'Movie'], value => {
    medium = value;
    show();
  });
  addFilters(document.querySelector('#status-filters'), 'All statuses', ['Saved', 'Finished'], value => {
    status = value;
    show();
  });
  show();
}

switch (document.body.dataset.page) {
  case 'travel': renderMap(); break;
  case 'cooking': renderKitchen(); break;
  case 'shelf': renderShelf(); break;
}
