/*
 * Responsively Lazy
 * http://ivopetkov.com/b/lazy-load-responsive-images/
 * Copyright 2015-2016, Ivo Petkov
 * Free to use under the MIT license.
 */

responsivelyLazy = (function () {

    var hasChange = true;
    var hasWebPSupport = false;
    var windowWidth = null;
    var windowHeight = null;

    var isVisible = function (element) {
        if (windowWidth === null) {
            return false;
        }
        var rect = element.getBoundingClientRect();
        var elementTop = rect.top;
        var elementLeft = rect.left;
        var elementWidth = rect.width;
        var elementHeight = rect.height;
        return elementTop < windowHeight && elementTop + elementHeight > 0 && elementLeft < windowWidth && elementLeft + elementWidth > 0;
    };

    var run = function () {
        var update = function (elements, unknownHeight) {
            var elementsCount = elements.length;
            for (var i = 0; i < elementsCount; i++) {
                var element = elements[i];
                var container = unknownHeight ? element : element.parentNode;
                if (!isVisible(container)) {
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
                            if (hasWebPSupport) {
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

    var setChanged = function () {
        hasChange = true;
    };

    var updateWindowSize = function () {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    };

    var updateParentNodesScrollListeners = function () {
        var elements = document.querySelectorAll('.responsively-lazy');
        var elementsCount = elements.length;
        for (var i = 0; i < elementsCount; i++) {
            var parentNode = elements[i].parentNode;
            while (parentNode && parentNode.tagName.toLowerCase() !== 'html') {
                if (typeof parentNode.responsivelyLazyAttached === 'undefined') {
                    parentNode.responsivelyLazyAttached = true;
                    parentNode.addEventListener('scroll', setChanged);
                }
                parentNode = parentNode.parentNode;
            }
        }
    };

    if ('srcset' in document.createElement('img') && typeof window.devicePixelRatio !== 'undefined' && typeof window.addEventListener !== 'undefined' && typeof document.querySelectorAll !== 'undefined') {

        var requestAnimationFrameFunction = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };

        var runIfHasChange = function () {
            if (hasChange) {
                hasChange = false;
                run();
            }
            requestAnimationFrameFunction.call(null, runIfHasChange);
        };

        var image = new Image();
        image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEADMDOJaQAA3AA/uuuAAA=';
        image.onload = image.onerror = function () {
            hasWebPSupport = image.width === 2;
            updateWindowSize();
            runIfHasChange();
            var attachEvents = function () {
                window.addEventListener('resize', function () {
                    updateWindowSize();
                    setChanged();
                });
                window.addEventListener('scroll', setChanged);
                window.addEventListener('load', setChanged);
                updateParentNodesScrollListeners();
                if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function () {
                        updateParentNodesScrollListeners();
                        setChanged();
                    });
                    observer.observe(document.querySelector('body'), {childList: true, subtree: true});
                }
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', attachEvents);
            } else {
                attachEvents();
            }
        };
    }

    return {
        'run': run,
        'isVisible': isVisible
    };

}());
