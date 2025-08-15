/**
 * Member Cards JavaScript
 * Handles image loading, fallbacks, and interactions for member cards
 */

// Start loading images as early as possible
(function() {
    function startEarly() {
        if (document.readyState === 'loading') {
            // Try to initialize as soon as possible
            if (document.body) {
                initializeMemberCards();
            } else {
                document.addEventListener('DOMContentLoaded', initializeMemberCards);
            }
        } else {
            // DOM is already ready
            initializeMemberCards();
        }
    }
    
    // Start immediately if possible, otherwise wait for DOM
    if (document.readyState !== 'loading') {
        startEarly();
    } else {
        document.addEventListener('DOMContentLoaded', startEarly);
        // Also try on readystatechange as a backup
        document.addEventListener('readystatechange', function() {
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                startEarly();
            }
        });
    }
})();

function initializeMemberCards() {
    // Force immediate image loading
    forceImageLoading();
    
    // Handle image loading errors
    setupErrorHandling();
    
    // Add loading states
    addImageLoadingStates();
    
    // Handle single-member sections
    handleSingleMemberSections();
}

function handleSingleMemberSections() {
    const memberGrids = document.querySelectorAll('.members-grid');
    
    memberGrids.forEach(grid => {
        const memberCards = grid.querySelectorAll('.member-card');
        
        if (memberCards.length === 1) {
            grid.classList.add('single-member');
        } else {
            grid.classList.remove('single-member');
        }
    });
}

function forceImageLoading() {
    const memberImages = document.querySelectorAll('.member-photo img');
    
    memberImages.forEach((img, index) => {
        const photoContainer = img.closest('.member-photo');
        
        // Remove any lazy loading attributes
        img.removeAttribute('loading');
        img.removeAttribute('data-src');
        
        // Add loading state immediately
        if (photoContainer) {
            photoContainer.classList.add('loading');
        }
        
        // Force the browser to start loading the image immediately
        const originalSrc = img.src;
        
        // Create a promise for each image load
        const imageLoadPromise = new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            tempImg.onload = function() {
                // Image loaded successfully
                img.src = originalSrc;
                img.style.opacity = '1';
                if (photoContainer) {
                    photoContainer.classList.remove('loading');
                    photoContainer.classList.add('loaded');
                }
                resolve(img);
            };
            
            tempImg.onerror = function() {
                // Image failed to load
                if (photoContainer) {
                    photoContainer.classList.remove('loading');
                }
                handleImageError(img);
                reject(new Error(`Failed to load image: ${originalSrc}`));
            };
            
            // Start loading with a slight delay to prevent overwhelming the browser
            setTimeout(() => {
                tempImg.src = originalSrc;
            }, index * 50); // Stagger loading by 50ms per image
        });
        
        // Set initial opacity to 0 for smooth fade-in
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease-in-out';
    });
}

function setupErrorHandling() {
    const memberImages = document.querySelectorAll('.member-photo img');
    
    memberImages.forEach(img => {
        // Set up error handling
        img.addEventListener('error', function() {
            handleImageError(this);
        }, { once: true });
        
        // Check if image is already broken
        if (img.complete && img.naturalWidth === 0) {
            handleImageError(img);
        }
    });
}

function handleImageError(img) {
    const photoContainer = img.closest('.member-photo');
    if (photoContainer) {
        // Hide the broken image
        img.style.display = 'none';
        
        // Add placeholder if it doesn't exist
        if (!photoContainer.querySelector('.member-photo-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'member-photo-placeholder';
            photoContainer.appendChild(placeholder);
        }
    }
}

function addImageLoadingStates() {
    const memberImages = document.querySelectorAll('.member-photo img');
    
    memberImages.forEach(img => {
        const photoContainer = img.closest('.member-photo');
        
        // Remove loading state when image loads
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            if (photoContainer) {
                photoContainer.classList.remove('loading');
                photoContainer.classList.add('loaded');
            }
        }, { once: true });
        
        // Remove loading state on error too
        img.addEventListener('error', function() {
            if (photoContainer) {
                photoContainer.classList.remove('loading');
            }
        }, { once: true });
        
        // If image is already loaded and visible
        if (img.complete && img.naturalWidth > 0) {
            img.style.opacity = '1';
            if (photoContainer) {
                photoContainer.classList.remove('loading');
                photoContainer.classList.add('loaded');
            }
        }
    });
}

// Utility function to create member card HTML
function createMemberCard(memberData) {
    const {
        name,
        title,
        description,
        image,
        email,
        personalPage,
        type = 'member'
    } = memberData;
    
    return `
        <div class="member-card" data-member-type="${type}">
            <div class="member-photo">
                <img src="${image || ''}" alt="${name}" loading="lazy">
            </div>
            <div class="member-content">
                <h3 class="member-name">${name}</h3>
                <p class="member-title">${title}</p>
                ${description ? `<div class="member-description">${description}</div>` : ''}
                <div class="member-links">
                    ${email ? `<a href="mailto:${email}" class="member-link">Contact ${name.split(' ')[0]}</a>` : ''}
                    ${personalPage ? `<a href="${personalPage}" class="member-link">Personal webpage</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMemberCard, initializeMemberCards };
}