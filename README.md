# Sophie’s World

A static exhibition index with an About section, plus separate pages for Travel, Kitchen, and Library. Open `index.html` in your browser to preview. When you are ready to publish, commit your changes and push them to `main`. GitHub Pages serves the repository root at [fenghq27.github.io](https://fenghq27.github.io/).

## Add your content

Put your images in `assets/photos/` and reference them with paths such as `assets/photos/kyoto.jpg`. The starter records are examples. Remove `sample: true` when replacing them with your own records.

### Travel map

In `data/travel.js`, add an object inside the array. Separate objects with commas. Use decimal coordinates, with negative longitude west of Greenwich and negative latitude south of the equator. The array order sets the pin numbers and the order in which the thread connects them.

```js
{
  id: 'kyoto',
  city: 'Kyoto',
  region: 'Japan',
  lat: 35.01,
  lon: 135.77,
  photos: [{ src: 'assets/photos/kyoto.jpg', alt: 'Describe your photo', caption: 'Your caption' }],
  stories: [{ title: 'An afternoon in Kyoto', text: 'Your story goes here.' }]
}
```

The first image previews on hover or keyboard focus. Add an optional `note` to a photo to show an annotation when it expands. Clicking a pin or city opens all its photos and stories. Use `\n\n` in a story string for a paragraph break. Both arrays can be empty. The map outlines are from [Natural Earth](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/).

### Cooking

Copy an object in `data/cooking.js` and change its title, category, and note. Add an optional `image` with `src` and `alt`. Use an optional `ingredients` array for a short ingredient list. Category filters update from the records.

### Books and movies

Copy an object in `data/shelf.js`. Use `Book` or `Movie` for its medium and `Saved` or `Finished` for its status. Finished books display as Read and finished movies as Watched. Add your thoughts in the note field. Set an optional `rating` out of five and add cover or poster art through `image: { src, alt }`. Items without artwork use a typeset cover.
