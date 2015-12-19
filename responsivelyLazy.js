/*
 * Responsively Lazy
 * http://ivopetkov.com/b/lazy-load-responsive-images/
 * Copyright 2015, Ivo Petkov
 * Free to use under the MIT license.
*/

if (typeof responsivelyLazy === 'undefined') {
    var responsivelyLazy = {};
    responsivelyLazy.hasChange = true;
    responsivelyLazy.hasWebPSupport = false;

    responsivelyLazy.isVisible = function (container) {
        var rect = container.getBoundingClientRect();
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var containerTop = rect.top;
        var containerLeft = rect.left;
        var containerWidth = rect.width;
        var containerHeight = rect.height;
        return containerTop < windowHeight && containerTop + containerHeight > 0 && containerLeft < windowWidth && containerLeft + containerWidth > 0;
    };

    responsivelyLazy.run = function () {

        var update = function (elements, unknownHeight) {
            var elementsCount = elements.length;
            for (var i = 0; i < elementsCount; i++) {
                var element = elements[i];
                var container = unknownHeight ? element : element.parentNode;
                if (!responsivelyLazy.isVisible(container)) {
                    continue;
                }
                var options = element.getAttribute('data-srcset');
                if (options !== null) {
                    options = options.split(',');
                    var temp = [];
                    var optionsCount = options.length;
                    for (var j = 0; j < optionsCount; j++) {
                        var option = options[j].trim();
                        var spaceIndex = option.lastIndexOf(' ');
                        if (spaceIndex === -1) {
                            var optionImage = option;
                            var optionWidth = 999998;
                        } else {
                            var optionImage = option.substr(0, spaceIndex);
                            var optionWidth = parseInt(option.substr(spaceIndex + 1, option.length - spaceIndex - 2), 10);
                        }
                        var add = false;
                        if (optionImage.indexOf('.webp', optionImage.length - 5) !== -1) {
                            if (responsivelyLazy.hasWebPSupport) {
                                add = true;
                            }
                        } else {
                            add = true;
                        }
                        if (add) {
                            temp.push([optionImage, optionWidth]);
                        }
                    }
                    temp.sort(function (a, b) {
                        if (a[1] < b[1]) {
                            return -1;
                        }
                        if (a[1] > b[1]) {
                            return 1;
                        }
                        if (a[1] === b[1]) {
                            if (b[0].indexOf('.webp', b[0].length - 5) !== -1) {
                                return 1;
                            }
                            if (a[0].indexOf('.webp', a[0].length - 5) !== -1) {
                                return -1;
                            }
                        }
                        return 0;
                    });
                    options = temp;
                } else {
                    options = [];
                }
                var containerWidth = container.offsetWidth * window.devicePixelRatio;

                var bestSelectedOption = null;
                var optionsCount = options.length;
                for (var j = 0; j < optionsCount; j++) {
                    var optionData = options[j];
                    if (optionData[1] >= containerWidth) {
                        bestSelectedOption = optionData;
                        break;
                    }
                }

                if (bestSelectedOption === null) {
                    bestSelectedOption = [element.getAttribute('src'), 999999];
                }

                if (typeof container.lastSetOption === 'undefined') {
                    container.lastSetOption = ['', 0];
                }
                if (container.lastSetOption[1] < bestSelectedOption[1]) {
                    container.lastSetOption = bestSelectedOption;
                    element.setAttribute('srcset', bestSelectedOption[0]);
                }

            }
        };

        update(document.querySelectorAll('.responsively-lazy > img'), false);
        update(document.querySelectorAll('img.responsively-lazy'), true);

    };

    if ('srcset' in document.createElement('img') && typeof window.devicePixelRatio !== 'undefined' && typeof window.addEventListener !== 'undefined' && typeof document.querySelectorAll !== 'undefined') {

        var requestAnimationFrameFunction = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };

        var runIfHasChange = function () {
            if (responsivelyLazy.hasChange) {
                responsivelyLazy.hasChange = false;
                responsivelyLazy.run();
            }
            requestAnimationFrameFunction.call(null, runIfHasChange);
        };
        var setChanged = function () {
            responsivelyLazy.hasChange = true;
        }

        var image = new Image();
        image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEADMDOJaQAA3AA/uuuAAA=';
        image.onload = image.onerror = function () {
            responsivelyLazy.hasWebPSupport = image.width === 2;

            runIfHasChange();

            window.addEventListener('resize', setChanged);
            window.addEventListener('scroll', setChanged);
            window.addEventListener('load', setChanged);

        };
    }
}