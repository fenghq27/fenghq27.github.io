'use strict';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(label, href, className) {
  const anchor = element('a', label, className);
  anchor.href = href;
  return anchor;
}

function image(src, alt) {
  const img = element('img');
  img.src = src;
  img.alt = alt;
  return img;
}

function renderShelves() {
  const cards = [
    ['01 · The postcard rack', '✎', 'Thoughts & Ideas', 'Little observations and ideas, alongside pictures.', 'thoughts.html'],
    ['02 · The photo box', '▣', 'Gallery', 'A handful of moments tucked into a shoebox.', 'gallery.html'],
    ['03 · The keepsake drawer', '✦', 'Little Treasures', 'Favorite stories, songs, places, and pocket-sized finds.', 'treasures.html'],
    ['04 · The craft table', '✂', 'Things I’ve Made', 'Paper scraps and experiments from the craft table.', 'made.html'],
    ['05 · A little letter', '♡', 'About', 'A note from the person behind the counter.', 'about.html']
  ];
  const bell = document.querySelector('.bell');
  const note = document.querySelector('#bell-note');
  bell.hidden = false;
  bell.addEventListener('click', () => {
    note.hidden = !note.hidden;
    bell.setAttribute('aria-expanded', String(!note.hidden));
  });

  const fortuneButton = document.querySelector('#fortune-button');
  const fortune = document.querySelector('#fortune');
  const slips = [
    'Something small will make you smile today.',
    'Take the scenic route when you have time.',
    'Write down the good bit before you forget.',
    'A quiet afternoon counts as a good day.'
  ];
  let nextSlip = Math.floor(Math.random() * slips.length);
  fortuneButton.hidden = false;
  fortuneButton.addEventListener('click', () => {
    fortune.textContent = '✿ ' + slips[nextSlip];
    nextSlip = (nextSlip + 1) % slips.length;
  });

  const shelf = document.querySelector('#shelf-links');
  for (const [number, symbol, title, description, href] of cards) {
    const card = link('', href, 'shelf-card');
    const icon = element('span', symbol, 'shelf-icon');
    icon.setAttribute('aria-hidden', 'true');
    card.append(element('span', number, 'eyebrow'), icon, element('span', title, 'shelf-title'), element('p', description));
    shelf.append(card);
  }
}

function renderThoughts() {
  const rack = document.querySelector('#thoughts');
  if (!thoughts.length) rack.append(element('p', 'A little space for thoughts, ideas, and the pictures that go with them.', 'note'));
  for (const thought of thoughts) {
    const card = element('article', '', 'note thought-card');
    if (thought.image) {
      const picture = image(thought.image.src, thought.image.alt);
      picture.loading = 'lazy';
      card.append(picture);
    }
    card.append(element('h2', thought.title));
    for (const paragraph of thought.body) card.append(element('p', paragraph));
    rack.append(card);
  }
}

function renderGallery() {
  const filters = document.querySelector('#filters');
  const grid = document.querySelector('#photos');
  const status = document.querySelector('#photo-status');
  const dialog = document.querySelector('#lightbox');
  const enlarged = document.querySelector('#lightbox-image');
  const title = document.querySelector('#lightbox-title');
  const caption = document.querySelector('#lightbox-caption');
  const close = dialog.querySelector('.close');
  const categories = [...new Set(photos.map(photo => photo.category))];
  let opener;

  function showPhotos(category) {
    const visible = category === null ? photos : photos.filter(photo => photo.category === category);
    grid.replaceChildren();
    for (const photo of visible) {
      const card = element('button', '', 'polaroid');
      card.type = 'button';
      card.setAttribute('aria-label', 'Enlarge ' + photo.title);
      const thumbnail = image(photo.src, photo.alt);
      thumbnail.loading = 'lazy';
      card.append(thumbnail, element('span', photo.title));
      if (photo.sample) card.append(element('small', 'Sample image · ' + photo.category));
      card.addEventListener('click', () => {
        opener = card;
        enlarged.src = photo.src;
        enlarged.alt = photo.alt;
        title.textContent = photo.title;
        caption.textContent = photo.caption;
        dialog.showModal();
        close.focus();
      });
      grid.append(card);
    }
    status.textContent = visible.length + (visible.length === 1 ? ' photo shown' : ' photos shown');
    if (!visible.length) grid.append(element('p', 'The photo box is empty.'));
  }

  for (const category of [null, ...categories]) {
    const button = element('button', category ?? 'All photos');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category === null));
    button.addEventListener('click', () => {
      for (const filter of filters.children) filter.setAttribute('aria-pressed', String(filter === button));
      showPhotos(category);
    });
    filters.append(button);
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
  showPhotos(null);
}

function renderCollection(selector, items) {
  const grid = document.querySelector(selector);
  for (const item of items) {
    const card = element('article', '', 'collection');
    card.append(element('p', item.category, 'eyebrow'), element('h2', item.title));
    if (item.sample) card.append(element('span', 'Sample item', 'label'));
    card.append(element('p', item.description));
    if (item.url) card.append(link(item.linkLabel || 'More about ' + item.title, item.url));
    grid.append(card);
  }
}

switch (document.body.dataset.page) {
  case 'index': renderShelves(); break;
  case 'thoughts': renderThoughts(); break;
  case 'gallery': renderGallery(); break;
  case 'treasures': renderCollection('#treasures', treasures); break;
  case 'made': renderCollection('#projects', projects); break;
}
