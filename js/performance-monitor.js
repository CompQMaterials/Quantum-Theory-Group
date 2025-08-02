/**
 * Performance Monitoring and Optimization
 * Tracks page performance metrics and provides optimization insights
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Wait for page to fully load
        if (document.readyState === 'complete') {
            this.measurePerformance();
        } else {
            window.addEventListener('load', () => this.measurePerformance());
        }

        // Monitor Core Web Vitals
        this.observeWebVitals();
        
        // Monitor resource loading
        this.observeResourceTiming();
    }

    measurePerformance() {
        if (!('performance' in window)) return;

        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return;

        this.metrics = {
            // Page Load Metrics
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            
            // Network Metrics
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart,
            
            // Rendering Metrics
            domProcessing: navigation.domComplete - navigation.domLoading,
            
            // Total Page Load Time
            totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
        };

        // Log performance metrics in development
        if (this.isDevelopment()) {
            console.group('🚀 Performance Metrics');
            console.log('Total Load Time:', this.metrics.totalLoadTime + 'ms');
            console.log('DOM Content Loaded:', this.metrics.domContentLoaded + 'ms');
            console.log('Server Response:', this.metrics.serverResponse + 'ms');
            console.log('DOM Processing:', this.metrics.domProcessing + 'ms');
            console.groupEnd();
        }

        // Send metrics to analytics (if configured)
        this.sendMetrics();
    }

    observeWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();
        
        // First Input Delay (FID)
        this.observeFID();
        
        // Cumulative Layout Shift (CLS)
        this.observeCLS();
    }

    observeLCP() {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.lcp = lastEntry.startTime;
                
                if (this.isDevelopment()) {
                    console.log('🎯 LCP:', lastEntry.startTime + 'ms');
                    if (lastEntry.startTime > 2500) {
                        console.warn('⚠️ LCP is slow (>2.5s). Consider optimizing images and critical resources.');
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Silently fail if not supported
        }
    }

    observeFID() {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    
                    if (this.isDevelopment()) {
                        console.log('⚡ FID:', this.metrics.fid + 'ms');
                        if (this.metrics.fid > 100) {
                            console.warn('⚠️ FID is slow (>100ms). Consider reducing JavaScript execution time.');
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            // Silently fail if not supported
        }
    }

    observeCLS() {
        if (!('PerformanceObserver' in window)) return;

        try {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.cls = clsValue;
                
                if (this.isDevelopment()) {
                    console.log('📐 CLS:', clsValue);
                    if (clsValue > 0.1) {
                        console.warn('⚠️ CLS is high (>0.1). Consider adding dimensions to images and avoiding dynamic content insertion.');
                    }
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            // Silently fail if not supported
        }
    }

    observeResourceTiming() {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    // Track slow resources
                    if (entry.duration > 1000) { // Resources taking more than 1 second
                        if (this.isDevelopment()) {
                            console.warn('🐌 Slow resource:', entry.name, entry.duration + 'ms');
                        }
                    }
                    
                    // Track large resources
                    if (entry.transferSize > 500000) { // Resources larger than 500KB
                        if (this.isDevelopment()) {
                            console.warn('📦 Large resource:', entry.name, (entry.transferSize / 1024).toFixed(2) + 'KB');
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            // Silently fail if not supported
        }
    }

    // Optimize images based on device capabilities
    optimizeImagesForDevice() {
        const images = document.querySelectorAll('img');
        const devicePixelRatio = window.devicePixelRatio || 1;
        const isSlowConnection = this.isSlowConnection();
        
        images.forEach(img => {
            // Skip if already optimized
            if (img.dataset.optimized) return;
            
            // Reduce quality for slow connections
            if (isSlowConnection && img.src.includes('.jpg')) {
                // This would require server-side support for dynamic image optimization
                // For now, we'll just add a class for CSS optimization
                img.classList.add('slow-connection');
            }
            
            // Mark as optimized
            img.dataset.optimized = 'true';
        });
    }

    // Detect slow connections
    isSlowConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType === 'slow-2g' || 
                   connection.effectiveType === '2g' ||
                   connection.saveData;
        }
        return false;
    }

    // Check if we're in development mode
    isDevelopment() {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.hostname.includes('dev') ||
               location.search.includes('debug=true');
    }

    // Send metrics to analytics service (placeholder)
    sendMetrics() {
        // This would send metrics to your analytics service
        // For now, we'll just store them locally for debugging
        if (this.isDevelopment()) {
            localStorage.setItem('performanceMetrics', JSON.stringify(this.metrics));
        }
    }

    // Public method to get current metrics
    getMetrics() {
        return { ...this.metrics };
    }

    // Method to generate performance report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: this.metrics,
            recommendations: this.generateRecommendations()
        };
        
        if (this.isDevelopment()) {
            console.group('📊 Performance Report');
            console.table(this.metrics);
            console.log('Recommendations:', report.recommendations);
            console.groupEnd();
        }
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.totalLoadTime > 3000) {
            recommendations.push('Consider optimizing images and reducing resource sizes');
        }
        
        if (this.metrics.serverResponse > 500) {
            recommendations.push('Server response time is slow, consider caching or CDN');
        }
        
        if (this.metrics.lcp > 2500) {
            recommendations.push('Largest Contentful Paint is slow, optimize critical resources');
        }
        
        if (this.metrics.cls > 0.1) {
            recommendations.push('Cumulative Layout Shift is high, add dimensions to images');
        }
        
        if (this.metrics.fid > 100) {
            recommendations.push('First Input Delay is high, reduce JavaScript execution time');
        }
        
        return recommendations;
    }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}