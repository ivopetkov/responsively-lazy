/**!
 * Responsively Lazy
 * http://ivopetkov.com/b/lazy-load-responsive-images/
 * 
 * @license
 * Copyright 2015-2017, Ivo Petkov Free to use under the MIT license.
 */
(function(w,d) {
    w.responsivelyLazyConfig = w.responsivelyLazyConfig || {};
    w.responsivelyLazy = w.responsivelyLazy || (function (config) {

        let hasWebPSupport = false;
        let hasSrcSetSupport = false;
        let mutationObserverIsDisabled = false;
        const doneElements = []; // elements that should never be updated again
    
        // request polyfills, if needed
        (function () {
            const polyFillsNeeded = [];
            if (w.MutationObserver === void 0) {
                polyFillsNeeded.push('MutationObserver');
            }
    
            if (w.IntersectionObserver === void 0) {
                polyFillsNeeded.push('IntersectionObserver');
            }
    
            if (polyFillsNeeded.length) {
                const polyFillRequest = d.createElement('script');
                polyFillRequest.async = 1;
                polyFillRequest.src = `https://polyfill.io/v2/polyfill.min.js?features=${polyFillsNeeded.join(',')}`;
                const firstScript = d.getElementsByTagName('script')[0];
                firstScript.parentNode.insertBefore(polyFillRequest, firstScript);
            }
        })();
    
        function evalScripts(scripts, startIndex) {
            for (let i = startIndex; i < scripts.length; i++) {
                let breakAfterThisScript = false;
                let script = scripts[i];
                const evScript = d.createElement('script');
                const type = script.getAttribute('type');
                if (type !== null) {
                    evScript.setAttribute("type", type);
                }
                const src = script.getAttribute('src');
                if (src !== null) {
                    evScript.setAttribute("src", src);
                    if ((script.async === void 0 || script.async === false) && i + 1 < scripts.length) {
                        breakAfterThisScript = true;
                        // jshint -W083
                        evScript.addEventListener('load', () => {
                            evalScripts(scripts, i + 1);
                        });
                    }
                }
                evScript.innerHTML = script.innerHTML;
                script.parentNode.replaceChild(evScript, script);
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
    
            const containerWidth = container.getBoundingClientRect().width * (w.devicePixelRatio !== void 0 ? w.devicePixelRatio : 1);
    
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
                const url = bestSelectedOption[0];
                if (container.responsivelyLazyEventsAttached === void 0) {
                    container.responsivelyLazyEventsAttached = true;
                    element.addEventListener('load', () => {
                        const handler = container.getAttribute('data-onlazyload');
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
    
        function updateElement(element) {
    
            if (doneElements.indexOf(element) !== -1) {
                return;
            }
    
            const lazyContent = element.getAttribute('data-lazycontent');
            if (lazyContent !== null) {
                doneElements.push(element);
                mutationObserverIsDisabled = true;
                element.innerHTML = lazyContent;
                const scripts = element.querySelectorAll('script');
                if (scripts.length > 0) {
                    evalScripts(scripts, 0);
                }
                mutationObserverIsDisabled = false;
                return;
            }
    
            if (!hasSrcSetSupport) {
                return;
            }
    
            if (element.tagName.toLowerCase() === 'img') { // image with unknown height
                updateImage(element, element);
                return;
            }
    
            const imageElement = element.querySelector('img');
            if (imageElement !== null) { // image with parent container
                updateImage(element, imageElement);
            }
        }
    
        if (w.addEventListener !== void 0 && d.querySelectorAll !== void 0) {
            const image = new Image();
            image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEADMDOJaQAA3AA/uuuAAA=';
            image.onload = image.onerror = () => {
                w.responsivelyLazy.hasWebPSupport = hasWebPSupport = image.width === 2;
                w.responsivelyLazy.hasSrcSetSupport = hasSrcSetSupport = 'srcset' in d.createElement('img');

                let intersectionObserver;
    
                function updateIntersectionObservers() {
                    d.querySelectorAll('.responsively-lazy')
                        .forEach(element => {
                            if (element.responsivelyLazyObserverAttached) {
                                return;
                            }
                            element.responsivelyLazyObserverAttached = true;
                            intersectionObserver.observe(element);
                        });
                }
    
                config = Object.assign({}, config);
                if (config.root && !config.root.nodeType) {
                    config.root = d.querySelector(config.root);
                }
    

                function installIntersectionObserver() {
                    if (w.IntersectionObserver === void 0) {
                        setTimeout(installIntersectionObserver, 50);
                        return;
                    }

                    intersectionObserver = new IntersectionObserver(entries => {
                        entries.forEach(entry => {
                            if (entry.intersectionRatio > 0) {
                                updateElement(entry.target);
                            }
                        });
                    }, config);
        
                    if (config.hasOwnProperty('POLL_INTERVAL')) {
                        intersectionObserver.POLL_INTERVAL = config.POLL_INTERVAL;
                    }
        
                    if (config.hasOwnProperty('USE_MUTATION_OBSERVER')) {
                        intersectionObserver.USE_MUTATION_OBSERVER = config.USE_MUTATION_OBSERVER;
                    }
    
                    function initialize() {
                        updateIntersectionObservers();
                        const observer = new MutationObserver(() => {
                            if (mutationObserverIsDisabled) {
                                return;
                            }
                            updateIntersectionObservers();
                        });
                        observer.observe(d.querySelector('body'), {
                            childList: true,
                            subtree: true
                        });
                    }
        
                    if (d.readyState === 'loading') {
                        d.addEventListener('DOMContentLoaded', initialize);
                        return;
                    }
        
                    initialize();
                }
                installIntersectionObserver();
            };

            return {
                hasWebPSupport,
                hasSrcSetSupport,
                doneElements,
                config: Object.apply({}, w.responsivelyLazyConfig)
            };
        }
    }(w.responsivelyLazyConfig));
}(window, window.document));
