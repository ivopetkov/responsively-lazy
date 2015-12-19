# Responsively Lazy

**The best lazy loading implementation available.**

- Handles responsive images
- Truly lazy (absolutely no unnecessary requests)
- **SEO friendly** (valid HTML)
- Supports [WebP](https://en.wikipedia.org/wiki/WebP)

<p align="center">
<img src="http://ivopetkov.github.io/responsivelyLazy/poster.jpg" style="max-width:100%;">
</p>

You can find a demo at [http://ivopetkov.github.io/responsivelyLazy/](http://ivopetkov.github.io/responsivelyLazy/) and learn how the magic works at [http://ivopetkov.com/b/lazy-load-responsive-images/](http://ivopetkov.com/b/lazy-load-responsive-images/)

## Download and install

Download the minified [css](https://raw.githubusercontent.com/ivopetkov/responsively-lazy/master/responsivelyLazy.min.css) and [js](https://raw.githubusercontent.com/ivopetkov/responsively-lazy/master/responsivelyLazy.min.js) files or install through [npm](https://www.npmjs.com/) and [bower](http://bower.io/)
```
npm install responsively-lazy
```
```
bower install responsively-lazy
```

The library does not have any dependencies, and it's just 1.1kb gzipped and minified.

## Usage

* Include the css file in the head tag
```
<link rel="stylesheet" href="responsivelyLazy.min.css">
```

* Include the js file right before the end of the body tag 
```
<script async src="responsivelyLazy.min.js"></script>
```

* Add the following code for each image
```
<div class="responsively-lazy" style="padding-bottom:68.44%;">
    <img alt="" src="images/2500.jpg" data-srcset="images/400.jpg 400w, images/400.webp 400w, images/600.jpg 600w, images/1000.jpg 1000w" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
</div>
```
The things to customize are the **padding-bottom** style, and the values of the **src** and **data-srcset** attributes. If you don't know the image aspect ratio you can skip the div tag and move the responsively-lazy class to te img tag:
```
<img class="responsively-lazy" alt="" src="images/2500.jpg" data-srcset="images/400.jpg 400w, images/400.webp 400w, images/600.jpg 600w, images/1000.jpg 1000w" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
```
You can list image versions in the [WebP format](https://en.wikipedia.org/wiki/WebP) which will be used if the browser supports it.

## A new concept

Responsively Lazy is very different from the other lazy loading libraries. They make you break your HTML by removing the `src` attribute, or make you put tiny version there or make you use `<noscript>` to make your images appear in Google Images. The following code has worked for ages: 
```
<img src="image.jpg" />
```
Let's not break it when we can enhance it.
```
<img src="image.jpg" data-src="image-200.jpg 200w, image-400.jpg 400w" srcset="..." />
```

## Browser support

The lazy loading works in browsers supporting the srcset attribute. As of December 2015 that's [66.47%](http://caniuse.com/#feat=srcset). Unsupported browsers will load the image in the src attribute. That's the image search engines and social networks will find, so it's better to make it high resolution.

## License
Free to use under the [MIT license](http://opensource.org/licenses/MIT).

## Got questions?
You can find me at [@IvoPetkovCom](https://twitter.com/IvoPetkovCom) and [ivopetkov.com](http://ivopetkov.com)