/**
 * Smooth Micro-Interactions and Hover Effects
 * Enhances user experience with subtle animations and feedback
 */

class MicroInteractions {
    constructor() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupFocusEffects();
        this.setupLoadingAnimations();
        this.setupParallaxEffects();
        this.setupSmoothTransitions();
        this.setupButtonRippleEffects();
        this.setupImageHoverEffects();
        this.setupTextAnimations();
    }

    setupScrollAnimations() {
        if (this.reducedMotion) return;

        // Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animateElements = document.querySelectorAll(
            '.member-card, .project-card, .publication-item, .introduction-section, .meeting-info'
        );

        animateElements.forEach((element, index) => {
            element.style.setProperty('--animation-delay', `${index * 100}ms`);
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    }

    setupHoverEffects() {
        // Enhanced card hover effects
        const cards = document.querySelectorAll('.member-card, .project-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                if (this.reducedMotion) return;
                
                this.createHoverGlow(e.target);
                this.animateCardContent(e.target);
            });

            card.addEventListener('mouseleave', (e) => {
                if (this.reducedMotion) return;
                
                this.removeHoverGlow(e.target);
                this.resetCardContent(e.target);
            });

            // Add mouse move effect for subtle tilt
            card.addEventListener('mousemove', (e) => {
                if (this.reducedMotion) return;
                this.addCardTilt(e, card);
            });

            card.addEventListener('mouseleave', () => {
                if (this.reducedMotion) return;
                this.removeCardTilt(card);
            });
        });

        // Navigation link hover effects
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                if (this.reducedMotion) return;
                this.animateNavLink(e.target, 'enter');
            });

            link.addEventListener('mouseleave', (e) => {
                if (this.reducedMotion) return;
                this.animateNavLink(e.target, 'leave');
            });
        });
    }

    setupFocusEffects() {
        // Enhanced focus effects for better accessibility
        const focusableElements = document.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', (e) => {
                this.createFocusRing(e.target);
            });

            element.addEventListener('blur', (e) => {
                this.removeFocusRing(e.target);
            });
        });
    }

    setupLoadingAnimations() {
        // Skeleton loading animations
        const loadingElements = document.querySelectorAll('.loading, .member-photo.loading');
        
        loadingElements.forEach(element => {
            this.createSkeletonAnimation(element);
        });

        // Image loading animations
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.classList.add('loading');
                
                img.addEventListener('load', () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                    this.animateImageLoad(img);
                });

                img.addEventListener('error', () => {
                    img.classList.remove('loading');
                    img.classList.add('error');
                });
            }
        });
    }

    setupParallaxEffects() {
        if (this.reducedMotion) return;

        // Subtle parallax for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            window.addEventListener('scroll', this.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroSection.style.transform = `translateY(${rate}px)`;
            }, 16));
        }
    }

    setupSmoothTransitions() {
        // Add smooth transitions to elements that don't have them
        const elements = document.querySelectorAll(
            '.member-link, .carousel-control, .carousel-indicator, .nav-toggle'
        );

        elements.forEach(element => {
            if (!element.style.transition) {
                element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
    }

    setupButtonRippleEffects() {
        if (this.reducedMotion) return;

        const buttons = document.querySelectorAll('button, .btn, .member-link');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });
        });
    }

    setupImageHoverEffects() {
        if (this.reducedMotion) return;

        const memberPhotos = document.querySelectorAll('.member-photo');
        
        memberPhotos.forEach(photo => {
            photo.addEventListener('mouseenter', () => {
                const img = photo.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.05)';
                    img.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                }
            });

            photo.addEventListener('mouseleave', () => {
                const img = photo.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
        });
    }

    setupTextAnimations() {
        if (this.reducedMotion) return;

        // Typewriter effect for main heading (subtle)
        const mainHeading = document.querySelector('.site-logo a');
        if (mainHeading) {
            this.addTextShimmer(mainHeading);
        }

        // Highlight effect for important text
        const importantText = document.querySelectorAll('.meeting-announcement');
        importantText.forEach(text => {
            this.addTextHighlight(text);
        });
    }

    // Helper methods for animations
    createHoverGlow(element) {
        element.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.1)';
        element.style.transform = 'translateY(-4px)';
    }

    removeHoverGlow(element) {
        element.style.boxShadow = '';
        element.style.transform = '';
    }

    animateCardContent(card) {
        const content = card.querySelector('.member-content, .project-content');
        if (content) {
            content.style.transform = 'translateY(-2px)';
            content.style.transition = 'transform 0.3s ease';
        }
    }

    resetCardContent(card) {
        const content = card.querySelector('.member-content, .project-content');
        if (content) {
            content.style.transform = '';
        }
    }

    addCardTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    }

    removeCardTilt(card) {
        card.style.transform = '';
    }

    animateNavLink(link, state) {
        if (state === 'enter') {
            link.style.transform = 'translateY(-2px)';
            link.style.textShadow = '0 2px 4px rgba(0,0,0,0.1)';
        } else {
            link.style.transform = '';
            link.style.textShadow = '';
        }
    }

    createFocusRing(element) {
        element.style.outline = '3px solid rgba(59, 130, 246, 0.5)';
        element.style.outlineOffset = '2px';
        element.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 4px rgba(59, 130, 246, 0.3)';
    }

    removeFocusRing(element) {
        // Don't remove outline as it's important for accessibility
        // Just ensure it's properly styled
    }

    createSkeletonAnimation(element) {
        element.style.background = 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)';
        element.style.backgroundSize = '200% 100%';
        element.style.animation = 'skeleton-loading 1.5s infinite';
    }

    animateImageLoad(img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        
        requestAnimationFrame(() => {
            img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        });
    }

    createRippleEffect(e, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addTextShimmer(element) {
        element.addEventListener('mouseenter', () => {
            element.style.background = 'linear-gradient(90deg, #1e3a8a, #3b82f6, #1e3a8a)';
            element.style.backgroundSize = '200% 100%';
            element.style.webkitBackgroundClip = 'text';
            element.style.backgroundClip = 'text';
            element.style.webkitTextFillColor = 'transparent';
            element.style.animation = 'text-shimmer 2s ease-in-out';
        });

        element.addEventListener('mouseleave', () => {
            element.style.background = '';
            element.style.webkitBackgroundClip = '';
            element.style.backgroundClip = '';
            element.style.webkitTextFillColor = '';
            element.style.animation = '';
        });
    }

    addTextHighlight(element) {
        element.addEventListener('mouseenter', () => {
            element.style.background = 'linear-gradient(120deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)';
            element.style.backgroundSize = '100% 0.2em';
            element.style.backgroundRepeat = 'no-repeat';
            element.style.backgroundPosition = '0 88%';
            element.style.transition = 'background-size 0.25s ease-in';
        });

        element.addEventListener('mouseleave', () => {
            element.style.backgroundSize = '0 0.2em';
        });
    }

    // Utility methods
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
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
}

// Add CSS animations via JavaScript for better control
const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes skeleton-loading {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        
        @keyframes text-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes animate-in {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
            transition-delay: var(--animation-delay, 0ms);
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .animate-on-scroll,
            .animate-in {
                opacity: 1 !important;
                transform: none !important;
                transition: none !important;
                animation: none !important;
            }
        }
        
        /* Enhanced focus styles */
        .enhanced-focus {
            outline: 3px solid rgba(59, 130, 246, 0.5) !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
        }
        
        /* Smooth transitions for all interactive elements */
        a, button, .member-card, .project-card, .carousel-control, .carousel-indicator {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Image loading states */
        img.loading {
            opacity: 0.5;
            filter: blur(2px);
        }
        
        img.loaded {
            opacity: 1;
            filter: none;
        }
        
        img.error {
            opacity: 0.3;
            filter: grayscale(100%);
        }
    `;
    
    document.head.appendChild(style);
};

// Initialize micro-interactions
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    new MicroInteractions();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroInteractions;
}