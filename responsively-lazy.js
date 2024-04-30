/*
 * Responsively Lazy
 * https://ivopetkov.com/responsively-lazy/
 * Copyright (c) Ivo Petkov
 * Free to use under the MIT license.
 * 
 * Debug:
 * document.cookie = "ivopetkov-responsively-lazy=debug";
*/

var responsivelyLazy = typeof responsivelyLazy !== 'undefined' ? responsivelyLazy : (function () {

    if (typeof window.addEventListener !== 'undefined' && typeof document.querySelectorAll !== 'undefined') { // Check for old browsers

        var debug = document.cookie.indexOf('ivopetkov-responsively-lazy=debug') !== -1;

        var hasWebPSupport = null;
        var hasAVIFSupport = null;
        var hasSrcSetSupport = 'srcset' in document.createElement('img');
        var windowWidth = null;
        var windowHeight = null;
        var hasIntersectionObserverSupport = typeof IntersectionObserver !== 'undefined';
        var mutationObserverIsDisabled = false;

        var getVisibilityPriority = function (element) {
            var thresholdHorizontal = 0;
            var thresholdVertical = 0;
            var thresholdValue = element.getAttribute('data-responsively-lazy-threshold');
            if (thresholdValue !== null) {
                if (thresholdValue.substr(-2) === 'px') {
                    thresholdHorizontal = thresholdVertical = parseInt(thresholdValue.substr(0, thresholdValue.length - 2), 10);
                } else if (thresholdValue.substr(-1) === '%') {
                    var percent = parseInt(thresholdValue.substr(0, thresholdValue.length - 1), 10) / 100;
                    thresholdHorizontal = Math.floor(windowWidth * percent);
                    thresholdVertical = Math.floor(windowHeight * percent);
                }
            }
            var rect = element.getBoundingClientRect();
            var elementTop = rect.top;
            var elementLeft = rect.left;
            var elementWidth = rect.width;
            var elementHeight = rect.height;
            if (elementTop === 0 && elementLeft === 0 && elementWidth === 0 && elementHeight === 0) {
                return 0;
            }
            if (elementWidth === 0) {
                elementWidth = 1;
            }
            if (elementHeight === 0) {
                elementHeight = 1;
            }

            var getVisibleAreaSize = function (elementPoint, elementSize, windowSize) {
                return elementPoint < windowSize && elementPoint + elementSize > 0 ? Math.min(windowSize, elementPoint + elementSize) - Math.max(0, elementPoint) : 0;
            };

            return (getVisibleAreaSize(elementLeft - thresholdHorizontal, elementWidth + 2 * thresholdHorizontal, windowWidth) * getVisibleAreaSize(elementTop - thresholdVertical, elementHeight + 2 * thresholdVertical, windowHeight)) / ((elementWidth + 2 * thresholdHorizontal) * (elementHeight + 2 * thresholdVertical)) * 100;
        }

        var evalScripts = function (scripts, startIndex) {
            var scriptsCount = scripts.length;
            for (var i = startIndex; i < scriptsCount; i++) {
                var breakAfterThisScript = false;
                var script = scripts[i];
                var newScript = document.createElement('script');
                var type = script.getAttribute('type');
                if (type !== null) {
                    newScript.setAttribute("type", type);
                }
                var src = script.getAttribute('src');
                if (src !== null) {
                    newScript.setAttribute("src", src);
                    if ((typeof script.async === 'undefined' || script.async === false) && i + 1 < scriptsCount) {
                        breakAfterThisScript = true;
                        newScript.addEventListener('load', function () {
                            evalScripts(scripts, i + 1);
                        });
                    }
                }
                newScript.innerHTML = script.innerHTML;
                script.parentNode.insertBefore(newScript, script);
                script.parentNode.removeChild(script);
                if (breakAfterThisScript) {
                    break;
                }
            }
        };

        var loadImageQueue = [];

        var processLoadImageQueueLock = false;
        var processLoadImageQueue = function () {
            if (processLoadImageQueueLock) {
                return;
            }
            processLoadImageQueueLock = true;
            var maxConcurrentImages = 3;
            loadImageQueue = loadImageQueue.filter(function (item) { return item[2] !== 2 }); // Remove completed
            for (var i = 0; i < loadImageQueue.length; i++) { // Update visibility priority
                loadImageQueue[i][4] = getVisibilityPriority(loadImageQueue[i][1]);
            }
            loadImageQueue.sort(function (item1, item2) { // Sort by visibility priority
                return item2[4] - item1[4];
            });
            var currentlyLoadingCount = loadImageQueue.filter(function (item) { return item[3] === 1 }).length;
            for (var i = 0; i < loadImageQueue.length; i++) {
                if (currentlyLoadingCount >= maxConcurrentImages) {
                    break;
                }
                var item = loadImageQueue[i];
                if (item[3] === 0) {
                    item[3] = 1; // Status: loading
                    item[2](); // Call load()
                    currentlyLoadingCount++;
                }
            }
            processLoadImageQueueLock = false;
        };

        var loadImageCounter = 0;

        var loadImage = function (contextElement, url, callback) {
            loadImageCounter++;
            var key = 'i' + loadImageCounter;
            var timeout = null;
            var onDone = function () {
                clearTimeout(timeout);
                for (var i = 0; i < loadImageQueue.length; i++) {
                    var item = loadImageQueue[i];
                    if (item[0] === key) {
                        item[3] = 2; // Status: completed
                        break;
                    }
                }
                processLoadImageQueue();
            };
            var image = new Image();
            image.onload = function () {
                onDone();
                callback(true);
            };
            image.onerror = function () {
                onDone();
                callback(false);
            };
            var load = function () {
                image.src = url;
                timeout = setTimeout(onDone, 60000);
            };
            loadImageQueue.push([key, contextElement, load, 0, 0]); // key, element, on load function, status, visiblity priority
            processLoadImageQueue();
        };

        var updateImage = function (type, element) {
            var options = [];
            var value = element.getAttribute('data-responsively-lazy');
            var maxOptionWidth = null;
            if (value !== null) {
                value = value.trim();
                if (value.length > 0) {
                    value = value.split(',');
                    for (var j = 0; j < value.length; j++) {
                        var optionImage = null;
                        var optionWidth = 999998;
                        var skipOption = false;
                        var optionParts = value[j].trim().split(' ');
                        for (var k = 0; k < optionParts.length; k++) {
                            var optionPart = optionParts[k];
                            var optionPartLength = optionPart.length;
                            if (optionPartLength === 0) {
                                continue;
                            }
                            if (optionImage === null) {
                                optionImage = optionPart;
                            } else {
                                if (optionPart[optionPartLength - 1] === 'w') {
                                    optionWidth = parseInt(optionPart.substr(0, optionPartLength - 1), 10);
                                } else if (optionPart === 'webp' && !hasWebPSupport) {
                                    skipOption = true;
                                } else if (optionPart === 'avif' && !hasAVIFSupport) {
                                    skipOption = true;
                                }
                            }
                        }
                        if (skipOption) {
                            continue;
                        }
                        if ((optionImage.indexOf('%2F') !== -1 || optionImage.indexOf('%3F') !== -1) && optionImage.indexOf('/') === -1 && optionImage.indexOf('?') === -1) {// path is encoded
                            optionImage = decodeURIComponent(optionImage);
                        }
                        options.push([optionImage, optionWidth]);
                        if (maxOptionWidth < optionWidth) {
                            maxOptionWidth = optionWidth;
                        }
                    }
                    options.sort(function (a, b) {
                        return a[1] - b[1];
                    });
                    var temp = [];
                    for (var j = 0; j < options.length; j++) {
                        var option = options[j];
                        if (j > 0) {
                            if (option[1] === temp[temp.length - 1][1]) {
                                continue;
                            }
                        }
                        temp.push([option[0], option[1]]);
                    }
                    options = temp;
                }
            }
            var elementWidth = element.getBoundingClientRect().width * (typeof window.devicePixelRatio !== 'undefined' ? window.devicePixelRatio : 1);

            var bestSelectedOption = null;
            for (var j = 0; j < options.length; j++) {
                var option = options[j];
                if (option[1] >= elementWidth || option[1] === maxOptionWidth) { // Show the largest available option even if the element width is larger (can be webp or avif)
                    bestSelectedOption = option;
                    break;
                }
            }

            if (bestSelectedOption === null) {
                if (type === 'img') {
                    bestSelectedOption = [element.getAttribute('src'), 999999]; // No options found
                } else { // background
                    bestSelectedOption = [null, 999999];
                }
            }

            if (typeof element.responsivelyLazyOption === 'undefined') {
                element.responsivelyLazyOption = ['', 0];
            }

            if (element.responsivelyLazyOption[1] < bestSelectedOption[1]) {
                element.responsivelyLazyOption = bestSelectedOption;
                var url = bestSelectedOption[0];
                if (url === null) {
                    return;
                }

                loadImage(element, url, function (result) {
                    if (result && element.responsivelyLazyOption[0] === url) {
                        if (type === 'img') {
                            if (url === element.getAttribute('src')) {
                                element.removeAttribute('srcset');
                            } else {
                                element.setAttribute('srcset', url);
                            }
                        } else { // background
                            element.style.backgroundImage = 'url(' + url + ')';
                        }
                        if (typeof element.responsivelyLazyLoadDispached === 'undefined') {
                            element.responsivelyLazyLoadDispached = true;
                            var handler = element.getAttribute('data-on-responsively-lazy-load');
                            if (handler !== null) {
                                (new Function(handler).bind(element))();
                            }
                            if (typeof Event !== 'undefined') {
                                var event = new Event('responsively-lazy-load');
                                element.dispatchEvent(event);
                            }
                        }
                    } else {
                        element.responsivelyLazyOption = ['', 0];
                    }
                });
            }
        };

        var updateWindowSize = function () {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
        };

        var updateElement = function (element, options) {

            if (typeof element.responsivelyLazyDone !== 'undefined') {
                return;
            }

            var ignoreThreshold = typeof options.ignoreThreshold !== 'undefined' ? options.ignoreThreshold : false;

            if (!ignoreThreshold && getVisibilityPriority(element) === 0) {
                return;
            }

            var type = element.getAttribute('data-responsively-lazy-type');
            if (type !== 'background' && type !== 'html') {
                type = 'img';
            }

            if (type === 'html') {
                element.responsivelyLazyDone = true;
                mutationObserverIsDisabled = true;
                element.innerHTML = element.getAttribute('data-responsively-lazy');
                var scripts = element.querySelectorAll('script');
                if (scripts.length > 0) {
                    evalScripts(scripts, 0);
                }
                mutationObserverIsDisabled = false;
            } else if (type === 'img') {
                if (hasSrcSetSupport) {
                    updateImage(type, element);
                }
            } else { // background
                updateImage(type, element);
            }

        };

        var run = function (element, options) {
            if (hasWebPSupport === null) {
                return;
            }
            if (hasAVIFSupport === null) {
                return;
            }
            if (typeof options === 'undefined') {
                options = {};
            }
            if (debug) {
                var timerLabel = 'responsivelyLazy::run';
                console.time(timerLabel);
            }
            if (typeof element !== 'undefined' && element !== null) {
                if (element.getAttribute('data-responsively-lazy') !== null) {
                    updateElement(element, options);
                }
            } else {
                var elements = document.querySelectorAll('[data-responsively-lazy]');
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    updateElement(elements[i], options);
                }
            }
            if (debug) {
                console.timeEnd(timerLabel);
            }
        };

        var testImageSupport = function (base64, callback) {
            var image = new Image();
            image.onload = image.onerror = function () {
                callback(image);
            };
            image.src = 'data:image/webp;base64,' + base64;
        };

        var runIfAllTestsDone = function () {
            if (hasWebPSupport !== null && hasAVIFSupport !== null) {
                run();
            }
        };

        testImageSupport('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAD8D+JaQAA3AA/ua1AAA=', function (image) {
            hasWebPSupport = image.width === 1;
            runIfAllTestsDone();
        });

        testImageSupport('AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAACAAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgSAAAAAAABNjb2xybmNseAABAA0AAIAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAChtZGF0EgAKBzgABpAQ0AIyExAAAAAP+j9adAx6kYPdyoRe9BA=', function (image) {
            hasAVIFSupport = image.width === 1;
            runIfAllTestsDone();
        });

        updateWindowSize();

        var requestAnimationFrameFunction = window.requestAnimationFrame || function (callback) {
            window.setTimeout(callback, 20);
        };

        var hasChange = false;
        var process = function () {
            if (hasChange) {
                hasChange = false;
                run();
            }
            requestAnimationFrameFunction.call(null, process);
        };
        process();

        if (hasIntersectionObserverSupport) {
            var intersectionObserver = new IntersectionObserver(function (entries) {
                for (var i in entries) {
                    var entry = entries[i];
                    if (entry.intersectionRatio > 0) {
                        updateElement(entry.target, {});
                    }
                }
            });
            var updateIntersectionObservers = function () {
                var elements = document.querySelectorAll('[data-responsively-lazy]');
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (typeof element.responsivelyLazyObserver === 'undefined') {
                        element.responsivelyLazyObserver = true;
                        intersectionObserver.observe(element);
                    }
                }
            };
            var changeTimeout = null;
        }

        var setChanged = function () {
            if (hasIntersectionObserverSupport) {
                window.clearTimeout(changeTimeout);
                changeTimeout = window.setTimeout(function () {
                    hasChange = true;
                }, 50);
            } else {
                hasChange = true;
            }
        };

        var updateParentNodesScrollListeners = function () {
            var elements = document.querySelectorAll('[data-responsively-lazy]');
            for (var i = 0; i < elements.length; i++) {
                var parentNode = elements[i].parentNode;
                while (parentNode && parentNode.tagName.toLowerCase() !== 'html') {
                    if (typeof parentNode.responsivelyLazyScroll === 'undefined') {
                        parentNode.responsivelyLazyScroll = true;
                        parentNode.addEventListener('scroll', setChanged);
                    }
                    parentNode = parentNode.parentNode;
                }
            }
        };

        var initialized = false;
        var initialize = function () {
            if (initialized) {
                return;
            }
            initialized = true;
            window.addEventListener('resize', function () {
                updateWindowSize();
                setChanged();
            });
            window.addEventListener('scroll', setChanged);
            window.addEventListener('load', setChanged);
            window.addEventListener('orientationchange', function () {
                updateWindowSize();
                setChanged();
            });
            if (hasIntersectionObserverSupport) {
                updateIntersectionObservers();
            }
            updateParentNodesScrollListeners();
            if (typeof MutationObserver !== 'undefined') {
                var observer = new MutationObserver(function () {
                    if (!mutationObserverIsDisabled) {
                        if (hasIntersectionObserverSupport) {
                            updateIntersectionObservers();
                        }
                        updateParentNodesScrollListeners();
                        setChanged();
                    }
                });
                observer.observe(document.querySelector('body'), { childList: true, subtree: true });
            }
        };
        document.addEventListener('readystatechange', () => { // interactive or complete
            initialize();
            run();
        });
        if (document.readyState === 'complete') {
            initialize();
            run();
        }
    } else {
        var run = function () { };
    }

    return {
        'run': run
    };

}());
