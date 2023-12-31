# Responsively Lazy

**Probably the best lazy loading implementation available.**

- Perfect for responsive images
- Truly lazy (absolutely no unnecessary requests)
- **SEO friendly** (valid HTML)
- Supports [WebP](https://en.wikipedia.org/wiki/WebP) and [AVIF](https://en.wikipedia.org/wiki/AVIF)
- Customizable load threshold
- Lazy load background images
- Lazy load HTML

<p align="center">
<img src="https://ivopetkov.github.io/responsively-lazy-v3/poster.jpg" style="max-width:100%;">
</p>

You can find a demo at [ivopetkov.github.io/responsively-lazy-v3/](https://ivopetkov.github.io/responsively-lazy-v3/) and learn how the magic works at [ivopetkov.com/responsively-lazy/](https://ivopetkov.com/responsively-lazy/)

## Download and install

Download the minified [JS file](https://raw.githubusercontent.com/ivopetkov/responsively-lazy/master/responsively-lazy.min.js) or install via [npm](https://www.npmjs.com/package/responsively-lazy).
```
npm install responsively-lazy
```

The library does not have any dependencies, and it's just 2.5kb when gzipped and minified.

## Usage

* Include the JS file in the head of the document
```html
<script async src="responsively-lazy.min.js"></script>
```

* Add the following code for each image
```html
<img
    src="images/2500.jpg"
    style="width:100%;aspect-ratio:400/274;"
    srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    data-responsively-lazy="images/400.jpg 400w, images/600.jpg 600w, images/800.jpg 800w, images/1000.jpg 1000w"
/>
```
Values to customize:

**aspect-ratio**

The aspect ratio of the image (width/height) to reserve space. Skip if you don't know it.

**src**

The default (largest) image size. Will be used by very old browsers, search engines, social networks, etc.

**data-responsively-lazy** (the star of the show)

Must contain a list of image versions separated by commas. Each version must contain a path to the image and its size. Optionaly you can specify the file type (webp or avif). The first supported format for the selected width is used.

```html
data-responsively-lazy="images/400.avif 400w avif, images/400.webp 400w webp, images/400.jpg 400w, ..."
```

**data-responsively-lazy-threshold**

Specify how close to the viewport an image should be to start loading.
```html
data-responsively-lazy-threshold="500px" // can use percents too
```

**data-responsively-lazy-type=html**

Lazy load HTML. Can contain JavaScript.

```html
<div
    data-responsively-lazy-type="html"
    data-responsively-lazy="hello world"
></div>
```

**data-responsively-lazy-type=background**

Lazy load image as a background image.

```html
<div
    data-responsively-lazy-type="background"
    data-responsively-lazy="images/400.jpg 400w, images/600.jpg 600w, images/800.jpg 800w, images/1000.jpg 1000w"
></div>
```

**data-on-responsively-lazy-load**

Run JavaScript code when the image is loaded.
```html
data-on-responsively-lazy-load="..."
```

## A new concept

Responsively Lazy is very different from the other lazy loading libraries. Others make you break your HTML by removing the `src` attribute, or make you put some tiny version there, or make you use `<noscript>` to make your images appear in search engines (like Google Images). The following code has worked for ages: 
```html
<img src="image.jpg" />
```
Let's not break it when we can enhance it.
```html
<img src="image.jpg" data-responsively-lazy="image-200.jpg 200w, image-400.jpg 400w" srcset="..." />
```

## Browser support

The lazy loading works in browsers supporting the srcset attribute and JavaScript. As of December 2023 that's [97.6%](https://caniuse.com/#feat=srcset). Unsupported browsers, search engines and social networks will load the image in the src attribute. Make sure it's high resolution.

## DOM changes

The library will listen for DOM changes and you can also request loading by calling `responsivelyLazy.run()`.

## License
Free to use under the [MIT license](https://opensource.org/licenses/MIT).

## Got questions?
You can find me at [@IvoPetkovCom](https://twitter.com/IvoPetkovCom) and [ivopetkov.com](https://ivopetkov.com)
