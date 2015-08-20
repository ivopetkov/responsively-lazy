/*
 * Responsively Lazy
 * http://ivopetkov.com/b/lazy-load-responsive-images/
 * Copyright 2015, Ivo Petkov
 * Free to use under the MIT license.
*/

if (typeof responsivelyLazy === 'undefined') {
    var responsivelyLazy = {};
    responsivelyLazy.hasChange = true;

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
                        temp.push([option.substr(0, spaceIndex), parseInt(option.substr(spaceIndex + 1, option.length - spaceIndex - 2), 10)]);
                    }
                    temp.sort(function (a, b) {
                        if (a[1] < b[1]) {
                            return -1;
                        }
                        if (a[1] > b[1]) {
                            return 1;
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
                    if (unknownHeight) {
                        element.style.height = "auto";
                    }
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

        runIfHasChange();

        window.addEventListener('resize', setChanged);
        window.addEventListener('scroll', setChanged);
        window.addEventListener('load', setChanged);
    }
}