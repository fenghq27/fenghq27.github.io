# Sophie’s World

A static personal scrapbook for [fenghq27.github.io](https://fenghq27.github.io/). The site uses HTML, CSS, and vanilla JavaScript. It has no build step or external dependencies.

## Preview locally

Open `index.html` in a browser for a quick preview. To preview over HTTP, open Terminal in the project folder and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/) and press Control-C in Terminal when finished.

## Project structure

| File or folder | Purpose |
| --- | --- |
| `index.html`, `thoughts.html`, `gallery.html`, `treasures.html`, `made.html`, `about.html` | The six main pages |
| `data/thoughts.js` | Thoughts, ideas, and optional images |
| `data/photos.js` | Gallery images, captions, alt text, and categories |
| `data/collections.js` | Favorite things and creative projects |
| `assets/photos/` | Replaceable illustrated placeholders and your future photos |
| `assets/style.css` | Layout, typography, palette, and responsive styles |
| `assets/site.js` | Rendering, shop interactions, filters, and photo lightbox |
| `.nojekyll` | Serves the repository as plain static files on GitHub Pages |

## Add a thought or idea

Place your image in `assets/photos/` and add an object inside the brackets in `data/thoughts.js`. Put a comma between objects. Cards appear in the order you write them.

```js
{
  title: 'A small idea',
  body: ['Write your first paragraph here.', 'Add another paragraph if you like.'],
  image: { src: 'assets/photos/your-image.jpg', alt: 'Describe the image here' }
}
```

You can omit the image field for a text-only card.

## Upload or replace photos

Put your JPG, WebP, or PNG files in `assets/photos/`. You can also use **Add file → Upload files** inside that folder on GitHub. Copy an object in `data/photos.js`, update `src` to match the filename exactly, and fill in `title`, `alt`, `category`, and `caption`. The category filters update automatically. Remove `sample: true` for real photos.

Use short, descriptive alt text and resize large photos before uploading. Consider removing GPS metadata from personal photos before publishing.

## Customize the scrapbook

- Edit the welcome text in `index.html` and the letter in `about.html`.
- Edit `data/collections.js` to add favorites and projects. Add a `url` and optional `linkLabel` for items you want to link.
- Edit the color and font variables at the top of `assets/style.css` to change the palette and typography.
- The home page uses `assets/stationery-window.jpg`. To replace the image, update its path and alt text in `index.html`. The original storefront illustration is listed separately in `data/collections.js`.

## Publish on GitHub Pages

1. Create or open the public repository `fenghq27/fenghq27.github.io`.
2. Commit and push the site files to the repository root on `main`. If the repository already has commits, clone it first and copy these site files into that clone. Include `.nojekyll` and preserve the `assets/` and `data/` folders.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save.
4. Once GitHub reports the deployment is live, open [Sophie’s World](https://fenghq27.github.io/). Push subsequent edits to the same branch to update the site.
