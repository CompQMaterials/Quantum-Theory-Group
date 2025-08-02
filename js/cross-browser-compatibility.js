/**
 * Cross-Browser Compatibility and Feature Detection
 * Ensures consistent behavior across modern browsers
 */

class CrossBrowserCompatibility {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.features = this.detectFeatures();
        this.init();
    }

    init() {
        this.addBrowserClasses();
        this.setupPolyfills();
        this.handleBrowserSpecificIssues();
        this.setupFallbacks();
        this.logCompatibilityInfo();
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        
        let browser = 'unknown';
        let version = 'unknown';
        
        // Chrome
        if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
            browser = 'chrome';
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
        }
        // Firefox
        else if (/Firefox/.test(userAgent)) {
            browser = 'firefox';
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
        }
        // Safari
        else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
            browser = 'safari';
            version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
        }
        // Edge
        else if (/Edg/.test(userAgent)) {
            browser = 'edge';
            version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
        }
        // Internet Explorer (legacy support)
        else if (/Trident/.test(userAgent)) {
            browser = 'ie';
            version = userAgent.match(/rv:(\d+)/)?.[1] || 'unknown';
        }

        return { browser, version: parseInt(version) };
    }

    detectFeatures() {
        return {
            // CSS Features
            cssGrid: CSS.supports('display', 'grid'),
            cssFlexbox: CSS.supports('display', 'flex'),
            cssCustomProperties: CSS.supports('--test', 'value'),
            cssClamp: CSS.supports('width', 'clamp(1rem, 2vw, 3rem)'),
            
            // JavaScript Features
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            webp: this.supportsWebP(),
            avif: this.supportsAVIF(),
            
            // Touch and Interaction
            touchEvents: 'ontouchstart' in window,
            pointerEvents: 'onpointerdown' in window,
            
            // Performance APIs
            performanceObserver: 'PerformanceObserver' in window,
            requestIdleCallback: 'requestIdleCallback' in window,
            
            // Modern JavaScript
            es6Modules: 'noModule' in HTMLScriptElement.prototype,
            asyncAwait: this.supportsAsyncAwait(),
            
            // Accessibility
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
        };
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    supportsAVIF() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        try {
            return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        } catch (e) {
            return false;
        }
    }

    supportsAsyncAwait() {
        try {
            return (async () => {})().constructor === (async () => {}).constructor;
        } catch (e) {
            return false;
        }
    }

    addBrowserClasses() {
        const html = document.documentElement;
        
        // Add browser class
        html.classList.add(`browser-${this.browserInfo.browser}`);
        html.classList.add(`browser-${this.browserInfo.browser}-${this.browserInfo.version}`);
        
        // Add feature classes
        Object.entries(this.features).forEach(([feature, supported]) => {
            html.classList.add(supported ? `supports-${feature}` : `no-${feature}`);
        });
        
        // Add device type classes
        if (this.features.touchEvents) {
            html.classList.add('touch-device');
        } else {
            html.classList.add('no-touch');
        }
        
        // Add accessibility preference classes
        if (this.features.reducedMotion) {
            html.classList.add('reduced-motion');
        }
        
        if (this.features.highContrast) {
            html.classList.add('high-contrast');
        }
        
        if (this.features.darkMode) {
            html.classList.add('dark-mode');
        }
    }

    setupPolyfills() {
        // IntersectionObserver polyfill for older browsers
        if (!this.features.intersectionObserver) {
            this.loadPolyfill('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver');
        }
        
        // CSS Custom Properties polyfill for IE
        if (!this.features.cssCustomProperties && this.browserInfo.browser === 'ie') {
            this.loadPolyfill('https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2');
        }
        
        // Object.assign polyfill for older browsers
        if (!Object.assign) {
            Object.assign = function(target, ...sources) {
                sources.forEach(source => {
                    if (source) {
                        Object.keys(source).forEach(key => {
                            target[key] = source[key];
                        });
                    }
                });
                return target;
            };
        }
        
        // Array.from polyfill
        if (!Array.from) {
            Array.from = function(arrayLike) {
                return Array.prototype.slice.call(arrayLike);
            };
        }
        
        // requestAnimationFrame polyfill
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                return setTimeout(callback, 1000 / 60);
            };
        }
        
        // requestIdleCallback polyfill
        if (!this.features.requestIdleCallback) {
            window.requestIdleCallback = function(callback) {
                const start = Date.now();
                return setTimeout(() => {
                    callback({
                        didTimeout: false,
                        timeRemaining() {
                            return Math.max(0, 50 - (Date.now() - start));
                        }
                    });
                }, 1);
            };
        }
    }

    loadPolyfill(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.head.appendChild(script);
    }

    handleBrowserSpecificIssues() {
        // Safari-specific fixes
        if (this.browserInfo.browser === 'safari') {
            this.fixSafariIssues();
        }
        
        // Firefox-specific fixes
        if (this.browserInfo.browser === 'firefox') {
            this.fixFirefoxIssues();
        }
        
        // Edge-specific fixes
        if (this.browserInfo.browser === 'edge') {
            this.fixEdgeIssues();
        }
        
        // Chrome-specific optimizations
        if (this.browserInfo.browser === 'chrome') {
            this.optimizeForChrome();
        }
    }

    fixSafariIssues() {
        // Fix Safari's handling of CSS Grid in older versions
        if (this.browserInfo.version < 12) {
            document.documentElement.classList.add('safari-old-grid');
        }
        
        // Fix Safari's viewport height issue
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        
        // Fix Safari's smooth scrolling
        if (CSS.supports('scroll-behavior', 'smooth')) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    fixFirefoxIssues() {
        // Firefox-specific CSS fixes
        document.documentElement.classList.add('firefox-fixes');
        
        // Fix Firefox's handling of flexbox gaps in older versions
        if (this.browserInfo.version < 63) {
            document.documentElement.classList.add('firefox-no-gap');
        }
    }

    fixEdgeIssues() {
        // Edge-specific fixes
        document.documentElement.classList.add('edge-fixes');
        
        // Fix Edge's CSS Grid issues in older versions
        if (this.browserInfo.version < 16) {
            document.documentElement.classList.add('edge-old-grid');
        }
    }

    optimizeForChrome() {
        // Chrome-specific optimizations
        if (this.browserInfo.version >= 88) {
            // Enable aspect-ratio support
            document.documentElement.classList.add('chrome-aspect-ratio');
        }
    }

    setupFallbacks() {
        // CSS Grid fallback
        if (!this.features.cssGrid) {
            this.setupGridFallback();
        }
        
        // CSS Custom Properties fallback
        if (!this.features.cssCustomProperties) {
            this.setupCustomPropertiesFallback();
        }
        
        // WebP fallback
        if (!this.features.webp) {
            this.setupImageFallbacks();
        }
    }

    setupGridFallback() {
        // Add flexbox fallback for CSS Grid
        const gridElements = document.querySelectorAll('.grid, .members-grid, .projects-grid');
        gridElements.forEach(element => {
            element.classList.add('grid-fallback');
        });
    }

    setupCustomPropertiesFallback() {
        // Provide fallback values for CSS custom properties
        const fallbackStyles = `
            .site-header { background-color: #ffffff; }
            .site-logo a { color: #1e3a8a; }
            .nav-menu a { color: #0f172a; }
            .nav-menu a:hover { color: #1e3a8a; }
            .member-card { background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        `;
        
        const style = document.createElement('style');
        style.textContent = fallbackStyles;
        document.head.appendChild(style);
    }

    setupImageFallbacks() {
        // Replace WebP images with fallback formats
        const images = document.querySelectorAll('img[src*=".webp"], img[data-src*=".webp"]');
        images.forEach(img => {
            const webpSrc = img.src || img.dataset.src;
            const fallbackSrc = webpSrc.replace('.webp', '.jpg');
            
            if (img.src) {
                img.src = fallbackSrc;
            } else if (img.dataset.src) {
                img.dataset.src = fallbackSrc;
            }
        });
    }

    logCompatibilityInfo() {
        if (console && console.group) {
            console.group('🌐 Cross-Browser Compatibility Report');
            console.log('Browser:', `${this.browserInfo.browser} ${this.browserInfo.version}`);
            console.log('User Agent:', navigator.userAgent);
            console.log('Supported Features:', this.features);
            console.log('Screen:', `${screen.width}x${screen.height}`);
            console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
            console.log('Device Pixel Ratio:', window.devicePixelRatio);
            console.log('Touch Support:', this.features.touchEvents);
            console.log('Reduced Motion:', this.features.reducedMotion);
            console.groupEnd();
        }
    }

    // Public method to check if a feature is supported
    isSupported(feature) {
        return this.features[feature] || false;
    }

    // Public method to get browser info
    getBrowserInfo() {
        return this.browserInfo;
    }
}

// Initialize cross-browser compatibility
document.addEventListener('DOMContentLoaded', () => {
    window.CrossBrowserCompatibility = new CrossBrowserCompatibility();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossBrowserCompatibility;
}