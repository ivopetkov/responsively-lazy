/**!
 * Responsively Lazy
 * http://ivopetkov.com/b/lazy-load-responsive-images/
 * 
 * @license
 * Copyright 2015-2017, Ivo Petkov Free to use under the MIT license.
 */
var responsivelyLazy = responsivelyLazy || (function () {

    let hasWebPSupport = false;
    let hasSrcSetSupport = false;
    let windowWidth = null;
    let windowHeight = null;
    let mutationObserverIsDisabled = false;
    const hasIntersectionObserverSupport = IntersectionObserver !== void 0;
    const doneElements = []; // elements that should never be updated again

    function isVisible(element) {
        if (windowWidth === null) {
            return false;
        }

        const {
            top: elementTop,
            left: elementLeft,
            width: elementWidth,
            height: elementHeight
        } = element.getBoundingClientRect();

        return elementTop < windowHeight && elementTop + elementHeight > 0 && elementLeft < windowWidth && elementLeft + elementWidth > 0;
    }

    function evalScripts(scripts, startIndex) {
        for (let i = startIndex; i < scripts.length; i++) {
            let breakAfterThisScript = false;
            let script = scripts[i];
            const newScript = document.createElement('script');
            const type = script.getAttribute('type');
            if (type !== null) {
                newScript.setAttribute("type", type);
            }
            var src = script.getAttribute('src');
            if (src !== null) {
                newScript.setAttribute("src", src);
                if ((script.async === void 0 || script.async === false) && i + 1 < scripts.length) {
                    breakAfterThisScript = true;
                    // jshint -W083
                    newScript.addEventListener('load', () => {
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
    }

    function isWebPImage(candidate) {
        return candidate.indexOf('.webp', candidate.length - 5) !== -1;
    }

    function updateImage(container, element) {
        const options = (element.getAttribute('data-srcset') || '')
            .trim()
            .split(',')
            .map(item => {
                item = item.trim();
                if (item.length === 0) {
                    return false;
                }

                let optionImage = item;
                let optionWidth = 999998;
                const spaceIndex = item.lastIndexOf(' ');
                if (spaceIndex !== -1) {
                    optionImage = item.substr(0, spaceIndex);
                    optionWidth = parseInt(item.substr(spaceIndex + 1, item.length - spaceIndex - 2), 10);
                }

                if (isWebPImage(optionImage) ? hasWebPSupport : true) {
                    return [optionImage, optionWidth];
                }

                return false;
            })
            .filter(item => Array.isArray(item));

        options.sort((a, b) => {
            if (a[1] === b[1]) {

                if (isWebPImage(b[0])) {
                    return 1;
                }

                if (isWebPImage(a[0])) {
                    return -1;
                }

                return 0;
            }

            return (a[1] < b[1]) ? -1 : 1;
        });

        const containerWidth = container.getBoundingClientRect().width * (window.devicePixelRatio !== void 0 ? window.devicePixelRatio : 1);

        let bestSelectedOption = null;
        for (let optionData of options) {
            if (optionData[1] >= containerWidth) {
                bestSelectedOption = optionData;
                break;
            }
        }

        if (bestSelectedOption === null) {
            bestSelectedOption = [element.getAttribute('src'), 999999];
        }

        if (container.responsivelyLazyLastSetOption === void 0) {
            container.responsivelyLazyLastSetOption = ['', 0];
        }

        if (container.responsivelyLazyLastSetOption[1] < bestSelectedOption[1]) {
            container.responsivelyLazyLastSetOption = bestSelectedOption;
            var url = bestSelectedOption[0];
            if (container.responsivelyLazyEventsAttached === void 0) {
                container.responsivelyLazyEventsAttached = true;
                element.addEventListener('load', () => {
                    var handler = container.getAttribute('data-onlazyload');
                    if (handler !== null) {
                        // jshint -W054
                        (new Function(handler).bind(container))();
                    }
                }, false);
                element.addEventListener('error', () => {
                    container.responsivelyLazyLastSetOption = ['', 0];
                }, false);
            }

            if (url === element.getAttribute('src')) {
                element.removeAttribute('srcset');
                return;
            }

            element.setAttribute('srcset', url);
        }
    }

    function updateWindowSize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    }

    function updateElement(element) {

        if (doneElements.indexOf(element) !== -1) {
            return;
        }

        if (!isVisible(element)) {
            return;
        }

        var lazyContent = element.getAttribute('data-lazycontent');
        if (lazyContent !== null) {
            doneElements.push(element);
            mutationObserverIsDisabled = true;
            element.innerHTML = lazyContent;
            var scripts = element.querySelectorAll('script');
            if (scripts.length > 0) {
                evalScripts(scripts, 0);
            }
            mutationObserverIsDisabled = false;
            return;
        }

        if (hasSrcSetSupport) {
            if (element.tagName.toLowerCase() === 'img') { // image with unknown height
                updateImage(element, element);
                return;
            }

            var imageElement = element.querySelector('img');
            if (imageElement !== null) { // image with parent container
                updateImage(element, imageElement);
                return;
            }
        }
    }

    function run() {
        var elements = document.querySelectorAll('.responsively-lazy');
        var elementsCount = elements.length;
        for (var i = 0; i < elementsCount; i++) {
            updateElement(elements[i]);
        }
    }

    if (window.addEventListener !== void 0 && document.querySelectorAll !== void 0) {

        updateWindowSize();

        var image = new Image();
        image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEADMDOJaQAA3AA/uuuAAA=';
        image.onload = image.onerror = () => {
            hasWebPSupport = image.width === 2;
            hasSrcSetSupport = 'srcset' in document.createElement('img');

            const requestAnimationFrameFunction = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

            let hasChange = true;

            function runIfHasChange() {
                if (hasChange) {
                    hasChange = false;
                    run();
                }
                requestAnimationFrameFunction.call(null, runIfHasChange);
            }

            runIfHasChange();

            let setChanged = () => {
                hasChange = true;
            };

            if (hasIntersectionObserverSupport) {
                let changeTimeout = null;

                setChanged = () => {
                    window.clearTimeout(changeTimeout);
                    changeTimeout = window.setTimeout(() => {
                        hasChange = true;
                    }, 300);
                };

                const updateIntersectionObservers = () => {
                    const elements = document.querySelectorAll('.responsively-lazy');
                    elements.forEach(element => {
                        if (element.responsivelyLazyObserverAttached === void 0) {
                            element.responsivelyLazyObserverAttached = true;
                            intersectionObserver.observe(element);
                        }
                    });
                };

                const intersectionObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.intersectionRatio > 0) {
                            updateElement(entry.target);
                        }
                    });
                });
            }

            function updateParentNodesScrollListeners() {
                const elements = document.querySelectorAll('.responsively-lazy');
                elements.forEach(element => {
                    let parentNode = element.parentNode;
                    while (parentNode && parentNode.tagName.toLowerCase() !== 'html') {
                        if (parentNode.responsivelyLazyScrollAttached === void 0) {
                            parentNode.responsivelyLazyScrollAttached = true;
                            parentNode.addEventListener('scroll', setChanged);
                        }
                        parentNode = parentNode.parentNode;
                    }
                });
            }

            function initialize() {
                window.addEventListener('resize', () => {
                    updateWindowSize();
                    setChanged();
                });
                window.addEventListener('scroll', setChanged);
                window.addEventListener('load', setChanged);

                if (hasIntersectionObserverSupport) {
                    updateIntersectionObservers();
                }
                updateParentNodesScrollListeners();
                if (MutationObserver !== void 0) {
                    const observer = new MutationObserver(() => {
                        if (mutationObserverIsDisabled) {
                            return;
                        }

                        if (hasIntersectionObserverSupport) {
                            updateIntersectionObservers();
                        }
                        updateParentNodesScrollListeners();
                        setChanged();
                    });
                    observer.observe(document.querySelector('body'), {
                        childList: true,
                        subtree: true
                    });
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initialize);
                return;
            }

            initialize();
        };
    }

    return {
        run,
        isVisible
    };

}());
