/**
 * Modern Image Carousel Implementation
 * Features: Touch/swipe support, lazy loading, smooth animations, accessibility
 */

class ModernCarousel {
    constructor(element, options = {}) {
        this.carousel = element;
        this.options = {
            autoPlay: options.autoPlay !== false,
            interval: options.interval || 4000,
            pauseOnHover: options.pauseOnHover !== false,
            showIndicators: options.showIndicators !== false,
            showControls: options.showControls !== false,
            swipeThreshold: options.swipeThreshold || 50,
            transitionDuration: options.transitionDuration || 500,
            ...options
        };

        this.currentSlide = 0;
        this.slides = [];
        this.indicators = [];
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.setupCarousel();
        this.createControls();
        this.createIndicators();
        this.setupEventListeners();
        this.setupLazyLoading();
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }

        // Show first slide
        this.showSlide(0);
    }

    setupCarousel() {
        // Get all slide elements
        this.slides = Array.from(this.carousel.querySelectorAll('.carousel-slide'));
        
        // Set up carousel container
        this.carousel.setAttribute('role', 'region');
        this.carousel.setAttribute('aria-label', 'Group photos carousel');
        this.carousel.setAttribute('aria-live', 'polite');
        this.carousel.setAttribute('tabindex', '0');

        // Create slides container
        const slidesContainer = document.createElement('div');
        slidesContainer.className = 'carousel-slides';
        
        // Move slides into container
        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${this.slides.length}`);
            slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
            slide.style.transform = `translateX(${index * 100}%)`;
            
            // Ensure images have proper alt text
            const img = slide.querySelector('img');
            if (img && !img.getAttribute('alt')) {
                img.setAttribute('alt', `Group photo ${index + 1}`);
            }
            
            slidesContainer.appendChild(slide);
        });

        this.carousel.appendChild(slidesContainer);
        this.slidesContainer = slidesContainer;
    }

    createControls() {
        if (!this.options.showControls || this.slides.length <= 1) return;

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'carousel-controls';

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-control carousel-control-prev';
        prevButton.setAttribute('aria-label', 'Go to previous slide');
        prevButton.setAttribute('type', 'button');
        prevButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            <span class="sr-only">Previous</span>
        `;
        prevButton.addEventListener('click', () => this.previousSlide());

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-control carousel-control-next';
        nextButton.setAttribute('aria-label', 'Go to next slide');
        nextButton.setAttribute('type', 'button');
        nextButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="9,6 15,12 9,18"></polyline>
            </svg>
            <span class="sr-only">Next</span>
        `;
        nextButton.addEventListener('click', () => this.nextSlide());

        controlsContainer.appendChild(prevButton);
        controlsContainer.appendChild(nextButton);
        this.carousel.appendChild(controlsContainer);

        this.prevButton = prevButton;
        this.nextButton = nextButton;
    }

    createIndicators() {
        if (!this.options.showIndicators || this.slides.length <= 1) return;

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'carousel-indicators';
        indicatorsContainer.setAttribute('role', 'tablist');
        indicatorsContainer.setAttribute('aria-label', 'Slide indicators');

        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('role', 'tab');
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            indicator.addEventListener('click', () => this.goToSlide(index));
            
            indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        });

        this.carousel.appendChild(indicatorsContainer);
    }

    setupEventListeners() {
        // Touch events for swipe support
        this.carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.carousel.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Mouse events for drag support on desktop
        this.carousel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.carousel.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.carousel.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.carousel.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Keyboard navigation
        this.carousel.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Pause on hover
        if (this.options.pauseOnHover) {
            this.carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.carousel.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Handle visibility change (pause when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.options.autoPlay) {
                this.resumeAutoPlay();
            }
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    setupLazyLoading() {
        // Handle all carousel images
        this.slides.forEach((slide, index) => {
            const images = slide.querySelectorAll('img');
            images.forEach(img => {
                // Add error handling for all images
                img.addEventListener('error', () => {
                    console.warn(`Failed to load carousel image: ${img.src}`);
                    img.style.display = 'none';
                    const caption = slide.querySelector('.carousel-caption');
                    if (caption) {
                        caption.textContent += ' (Image not available)';
                    }
                }, { once: true });

                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                    img.classList.add('loaded');
                    console.log(`Loaded carousel image: ${img.src}`);
                }, { once: true });

                // If image is already loaded, mark it as loaded
                if (img.complete && img.naturalWidth > 0) {
                    img.style.opacity = '1';
                    img.classList.add('loaded');
                }
            });
        });
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.touchStartX = e.clientX;
        this.carousel.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.touchEndX = e.clientX;
        this.carousel.style.cursor = '';
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > this.options.swipeThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.slides.length - 1);
                break;
        }
    }

    showSlide(index, direction = 'next') {
        if (this.isTransitioning || index === this.currentSlide) return;

        this.isTransitioning = true;
        const previousSlide = this.currentSlide;
        this.currentSlide = index;

        // Preload current slide image if not loaded
        this.preloadSlideImage(index);

        // Preload next slide image for smoother transitions
        const nextIndex = (index + 1) % this.slides.length;
        this.preloadSlideImage(nextIndex);

        // Update slides positions
        this.slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${(i - this.currentSlide) * 100}%)`;
            slide.style.transition = `transform ${this.options.transitionDuration}ms ease-in-out`;
        });

        // Update indicators
        this.updateIndicators();

        // Update controls state
        this.updateControlsState();

        // Update ARIA attributes
        this.slides[previousSlide]?.setAttribute('aria-hidden', 'true');
        this.slides[this.currentSlide]?.setAttribute('aria-hidden', 'false');

        // Reset transition flag after animation
        setTimeout(() => {
            this.isTransitioning = false;
            this.slides.forEach(slide => {
                slide.style.transition = '';
            });
        }, this.options.transitionDuration);
    }

    preloadSlideImage(index) {
        if (index >= 0 && index < this.slides.length) {
            const slide = this.slides[index];
            const img = slide.querySelector('img[data-src]');
            if (img) {
                // Add error handling for failed image loads
                img.addEventListener('error', () => {
                    console.warn(`Failed to load carousel image: ${img.dataset.src}`);
                    img.style.display = 'none';
                }, { once: true });

                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                }, { once: true });

                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        }
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
            indicator.setAttribute('aria-selected', index === this.currentSlide ? 'true' : 'false');
        });
    }

    updateControlsState() {
        // For infinite carousel, don't disable buttons
        if (this.prevButton) {
            this.prevButton.disabled = false;
        }
        if (this.nextButton) {
            this.nextButton.disabled = false;
        }
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
        }
    }

    startAutoPlay() {
        if (!this.options.autoPlay || this.slides.length <= 1) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.options.interval);
    }

    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    resumeAutoPlay() {
        if (this.options.autoPlay && !this.autoPlayTimer) {
            this.startAutoPlay();
        }
    }

    handleResize() {
        // Recalculate slide positions on resize
        this.slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${(i - this.currentSlide) * 100}%)`;
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners and clean up
        this.carousel.innerHTML = '';
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const carouselElement = document.querySelector('.modern-carousel');
    if (carouselElement) {
        console.log('Initializing carousel with', carouselElement.querySelectorAll('.carousel-slide').length, 'slides');
        const carousel = new ModernCarousel(carouselElement, {
            autoPlay: true,
            interval: 5000,
            pauseOnHover: true,
            showIndicators: true,
            showControls: true
        });
        
        // Make carousel globally accessible for debugging
        window.carousel = carousel;
    } else {
        console.error('Carousel element not found');
    }
});