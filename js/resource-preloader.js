/**
 * Resource Preloader
 * Preloads critical resources and optimizes loading order
 */

class ResourcePreloader {
    constructor() {
        this.criticalResources = [
            // Critical images that should be preloaded
            './images/group/group_2024.png',
            // Add other critical resources here
        ];
        
        this.init();
    }

    init() {
        this.preloadCriticalResources();
        this.setupIntersectionObserver();
        this.optimizeResourceHints();
    }

    preloadCriticalResources() {
        this.criticalResources.forEach(resource => {
            this.preloadResource(resource, this.getResourceType(resource));
        });
    }

    preloadResource(href, as = 'image') {
        // Check if already preloaded
        if (document.querySelector(`link[href="${href}"]`)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (as === 'image') {
            link.type = this.getImageType(href);
        }
        
        // Add error handling
        link.onerror = () => {
            console.warn(`Failed to preload resource: ${href}`);
        };
        
        document.head.appendChild(link);
    }

    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'webp':
            case 'avif':
                return 'image';
            case 'css':
                return 'style';
            case 'js':
                return 'script';
            case 'woff':
            case 'woff2':
                return 'font';
            default:
                return 'fetch';
        }
    }

    getImageType(url) {
        const extension = url.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'webp':
                return 'image/webp';
            case 'avif':
                return 'image/avif';
            default:
                return 'image/jpeg';
        }
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        // Preload resources when they're about to come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Preload next carousel image
                    if (element.classList.contains('carousel-slide')) {
                        this.preloadNextCarouselImage(element);
                    }
                    
                    // Preload member images
                    if (element.classList.contains('member-card')) {
                        this.preloadMemberImage(element);
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px', // Start preloading 100px before element comes into view
            threshold: 0.1
        });

        // Observe carousel slides
        document.querySelectorAll('.carousel-slide').forEach(slide => {
            observer.observe(slide);
        });

        // Observe member cards
        document.querySelectorAll('.member-card').forEach(card => {
            observer.observe(card);
        });
    }

    preloadNextCarouselImage(currentSlide) {
        const carousel = currentSlide.closest('.modern-carousel');
        if (!carousel) return;

        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const currentIndex = slides.indexOf(currentSlide);
        const nextIndex = (currentIndex + 1) % slides.length;
        const nextSlide = slides[nextIndex];

        if (nextSlide) {
            const img = nextSlide.querySelector('img[data-src]');
            if (img) {
                this.preloadResource(img.dataset.src, 'image');
            }
        }
    }

    preloadMemberImage(memberCard) {
        const img = memberCard.querySelector('img[data-src]');
        if (img) {
            this.preloadResource(img.dataset.src, 'image');
        }
    }

    optimizeResourceHints() {
        // Add DNS prefetch for external domains
        this.addDNSPrefetch([
            '//fonts.googleapis.com',
            '//fonts.gstatic.com'
        ]);

        // Add preconnect for critical external resources
        this.addPreconnect([
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ]);
    }

    addDNSPrefetch(domains) {
        domains.forEach(domain => {
            if (!document.querySelector(`link[href="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = domain;
                document.head.appendChild(link);
            }
        });
    }

    addPreconnect(urls) {
        urls.forEach(url => {
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = url;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }

    // Method to preload resources for a specific page
    preloadForPage(page) {
        const pageResources = {
            'members': [
                './images/members/phawrylak_2015.jpg',
                './images/members/ppotasz.png'
                // Add other critical member images
            ],
            'projects': [
                './images/graphene_qdots.jpg',
                './images/wave_function.jpeg'
                // Add other project images
            ]
        };

        const resources = pageResources[page];
        if (resources) {
            resources.forEach(resource => {
                this.preloadResource(resource, 'image');
            });
        }
    }

    // Method to prefetch next page resources
    prefetchNextPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const pageOrder = ['index.html', 'news.html', 'projects.html', 'software.html', 'members.html'];
        const currentIndex = pageOrder.indexOf(currentPage);
        
        if (currentIndex !== -1 && currentIndex < pageOrder.length - 1) {
            const nextPage = pageOrder[currentIndex + 1];
            
            // Prefetch the next page
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = nextPage;
            document.head.appendChild(link);
            
            // Preload resources for the next page
            this.preloadForPage(nextPage.replace('.html', ''));
        }
    }
}

// Initialize resource preloader
document.addEventListener('DOMContentLoaded', () => {
    const preloader = new ResourcePreloader();
    
    // Prefetch next page after a delay
    setTimeout(() => {
        preloader.prefetchNextPage();
    }, 2000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourcePreloader;
}