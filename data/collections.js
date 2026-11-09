// Add a url field when an item has a link. Items without a URL are text only.
const treasures = [
  { category: 'Books', title: 'The Secret Garden', description: 'For the image of a locked door with ivy growing over it.', sample: true },
  { category: 'Movies', title: 'Kiki’s Delivery Service', description: 'A bakery window, a seaside town, and the kind of quiet courage I like.', sample: true },
  { category: 'Music', title: 'Clair de lune', description: 'Something soft to play while the light goes out in the kitchen.', sample: true },
  { category: 'Places', title: 'The library window seat', description: 'The best spot to read three pages and watch the rain for half an hour.', sample: true },
  { category: 'Small discoveries', title: 'A leaf in a borrowed book', description: 'Pressed flat and almost transparent. I left it for the next reader.', sample: true }
];

const projects = [
  { category: 'Paper craft', title: 'A pocket-size zine', description: 'Eight tiny pages folded from a single sheet, with notes about a walk around the block.', sample: true },
  { category: 'Illustration', title: 'An imaginary storefront', description: 'A little shop with lit windows, a sage-green door, and shelves full of stories.', url: 'assets/storefront.svg', linkLabel: 'See the illustration', sample: true },
  { category: 'Scrapbook', title: 'Four little picture cards', description: 'A handful of illustrated placeholders for the photo box.', url: 'gallery.html', linkLabel: 'Open the photo box', sample: true }
];
