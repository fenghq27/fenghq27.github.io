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
      for (const photo of place.photos) photos.append(photoFigure(photo));
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

function renderCards(grid, items, metadata) {
  grid.replaceChildren();
  if (!items.length) grid.append(element('p', 'Nothing tucked here yet.', 'empty'));
  for (const item of items) {
    const card = element('article', '', 'paper-card');
    card.append(element('p', metadata(item) + (item.sample ? ' · EXAMPLE' : ''), 'eyebrow'));
    if (item.image) card.append(picture(item.image));
    card.append(element('h2', item.title));
    if (item.creator) card.append(element('p', item.creator, 'byline'));
    if (item.note) {
      const details = element('details');
      details.append(element('summary', 'Unfold note'), element('p', item.note));
      card.append(details);
    }
    grid.append(card);
  }
}

function renderKitchen() {
  const grid = document.querySelector('#dishes');
  const categories = [...new Set(dishes.map(dish => dish.category))];
  function show(category) {
    renderCards(grid, dishes.filter(dish => !category || dish.category === category), dish => dish.category);
  }
  addFilters(document.querySelector('#kitchen-filters'), 'All dishes', categories, show);
  show(null);
}

function renderShelf() {
  const grid = document.querySelector('#media');
  let medium = null;
  let status = null;
  function show() {
    const matches = shelf.filter(item => (!medium || medium === item.medium) && (!status || status === item.status));
    renderCards(grid, matches, item => item.medium + ' / ' +
      (item.status === 'Saved' ? 'Saved' : item.medium === 'Book' ? 'Read' : 'Watched'));
  }
  addFilters(document.querySelector('#medium-filters'), 'Books & movies', ['Book', 'Movie'], value => {
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
  case 'index': renderMap(); break;
  case 'cooking': renderKitchen(); break;
  case 'shelf': renderShelf(); break;
}
