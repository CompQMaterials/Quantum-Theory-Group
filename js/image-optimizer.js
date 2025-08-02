/**
 * Image Optimization and Lazy Loading
 * Handles image compression, lazy loading, and performance optimization
 */

class ImageOptimizer {
    constructor() {
        this.lazyImages = [];
        this.imageObserver = null;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.optimizeExistingImages();
        this.setupImageErrorHandling();
    }

    setupLazyLoading() {
        // Find all images with data-src attribute
        this.lazyImages = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            this.imageObserver =
 new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            this.lazyImages.forEach(img => {
                this.imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            this.lazyImages.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        // Add loading class for visual feedback
        img.classList.add('loading');
        
        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Image loaded successfully
            img.src = img.dataset.src;
            img.classList.remove('loading');
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        
        imageLoader.onerror = () => {
            // Image failed to load
            img.classList.remove('loading');
            img.classList.add('error');
            this.handleImageError(img);
        };
        
        // Start loading the image
        imageLoader.src = img.dataset.src;
    }

    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-src])');
        
        images.forEach(img => {
            // Add loading attribute for native lazy loading support
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Optimize image dimensions
            this.optimizeImageDimensions(img);
            
            // Add error handling
            img.addEventListener('error', () => this.handleImageError(img), { once: true });
        });
    }

    optimizeImageDimensions(img) {
        // Set explicit width and height to prevent layout shift
        if (!img.width && !img.height) {
            img.addEventListener('load', () => {
                const rect = img.getBoundingClientRect();
                if (rect.width && rect.height) {
                    img.setAttribute('width', Math.round(rect.width));
                    img.setAttribute('height', Math.round(rect.height));
                }
            }, { once: true });
        }
    }

    handleImageError(img) {
        const container = img.closest('.member-photo, .carousel-slide, .project-image');
        
        if (container) {
            // Hide broken image
            img.style.display = 'none';
            
            // Add placeholder if it doesn't exist
            if (!container.querySelector('.image-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.setAttribute('aria-label', 'Image not available');
                
                // Add appropriate icon based on context
                if (container.classList.contains('member-photo')) {
                    placeholder.innerHTML = '<span class="placeholder-icon">👤</span>';
                } else {
                    placeholder.innerHTML = '<span class="placeholder-icon">🖼️</span>';
                }
                
                container.appendChild(placeholder);
            }
        }
    }

    setupImageErrorHandling() {
        // Global error handler for all images
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    // Method to preload critical images
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical="true"]');
        
        criticalImages.forEach(img => {
            if (img.dataset.src) {
                this.loadImage(img);
            }
        });
    }

    // Method to compress images client-side (for future uploads)
    compressImage(file, quality = 0.8, maxWidth = 1200) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// CSS for image optimization (to be added to main.css)
const imageOptimizerCSS = `
/* Image loading states */
img.loading {
    opacity: 0.5;
    filter: blur(2px);
    transition: all 0.3s ease;
}

img.loaded {
    opacity: 1;
    filter: none;
}

img.error {
    display: none;
}

.image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-200) 100%);
    color: var(--color-gray-400);
    font-size: 2rem;
    width: 100%;
    height: 100%;
    min-height: 200px;
}

.placeholder-icon {
    font-size: 3rem;
    opacity: 0.6;
}

/* Responsive images */
img {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Prevent layout shift during image loading */
.member-photo,
.carousel-slide,
.project-image {
    position: relative;
    overflow: hidden;
}

.member-photo::before,
.carousel-slide::before,
.project-image::before {
    content: '';
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 75%; /* 4:3 aspect ratio */
    background: var(--color-gray-100);
}

.member-photo img,
.carousel-slide img,
.project-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
`;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageOptimizer();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageOptimizer;
}