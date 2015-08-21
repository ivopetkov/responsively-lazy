# responsivelyLazy

**The best lazy loading implementation available.**

It's the best because it's responsive, truly lazy (absolutely no unnecessary requests) and **SEO friendly**.

<p align="center">
<img src="http://ivopetkov.github.io/responsivelyLazy/poster.jpg" style="max-width:100%;">
</p>

You can find a demo at [http://ivopetkov.github.io/responsivelyLazy/](http://ivopetkov.github.io/responsivelyLazy/) and learn how the magic works at [http://ivopetkov.com/b/lazy-load-responsive-images/](http://ivopetkov.com/b/lazy-load-responsive-images/)

## Download and install

Download the minified [css](https://raw.githubusercontent.com/ivopetkov/responsively-lazy/master/responsivelyLazy.min.css) and [js](https://raw.githubusercontent.com/ivopetkov/responsively-lazy/master/responsivelyLazy.min.js) files or install through npm and bower
```
npm install responsively-lazy
bower install responsively-lazy
```

## How to use

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
    <img alt="" src="images/2500.jpg" data-srcset="images/600.jpg 600w, images/400.jpg 400w, images/800.jpg 800w, images/1500.jpg 1500w, images/1000.jpg 1000w, images/2000.jpg 2000w" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
</div>
```
The things to customize are the **padding-bottom** style, and the values of the **src** and **data-srcset** attributes. If you don't know the image aspect ratio you can skip the div tag and move the responsively-lazy class to te img tag:
```
<img class="responsively-lazy" alt="" src="images/2500.jpg" data-srcset="images/600.jpg 600w, images/400.jpg 400w, images/800.jpg 800w, images/1500.jpg 1500w, images/1000.jpg 1000w, images/2000.jpg 2000w" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
```

## Browser support

The lazy loading works in browsers supporting the srcset attribute. As of August 2015 that's [62.78%](http://caniuse.com/#feat=srcset). Unsupported browsers will load the image in the src attribute.

## License
Free to use under the [MIT license](http://opensource.org/licenses/MIT).

## Got questions?
You can find me at [@IvoPetkovCom](https://twitter.com/IvoPetkovCom) and [ivopetkov.com](http://ivopetkov.com)