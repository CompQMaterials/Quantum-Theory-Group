/**
 * Member Cards JavaScript
 * Handles image loading, fallbacks, and interactions for member cards
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeMemberCards();
});

function initializeMemberCards() {
    // Preload all member images immediately
    preloadMemberImages();
    
    // Handle image loading errors
    const memberImages = document.querySelectorAll('.member-photo img');
    
    memberImages.forEach(img => {
        // Set up error handling
        img.addEventListener('error', function() {
            handleImageError(this);
        });
        
        // Check if image is already broken
        if (!img.complete || img.naturalWidth === 0) {
            handleImageError(img);
        }
    });
    
    // Add loading states
    addImageLoadingStates();
}

function preloadMemberImages() {
    const memberImages = document.querySelectorAll('.member-photo img');
    
    memberImages.forEach(img => {
        // Remove lazy loading for member photos to ensure immediate loading
        img.removeAttribute('loading');
        
        // Force immediate loading by creating a new image element
        const preloader = new Image();
        const photoContainer = img.closest('.member-photo');
        
        if (photoContainer) {
            photoContainer.classList.add('loading');
        }
        
        preloader.onload = function() {
            // Image loaded successfully, update the original img
            img.src = this.src;
            if (photoContainer) {
                photoContainer.classList.remove('loading');
                photoContainer.classList.add('loaded');
            }
        };
        
        preloader.onerror = function() {
            // Image failed to load
            if (photoContainer) {
                photoContainer.classList.remove('loading');
            }
            handleImageError(img);
        };
        
        // Start preloading
        preloader.src = img.src;
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
        
        // Add loading state
        photoContainer.classList.add('loading');
        
        // Remove loading state when image loads
        img.addEventListener('load', function() {
            photoContainer.classList.remove('loading');
        });
        
        // Remove loading state on error too
        img.addEventListener('error', function() {
            photoContainer.classList.remove('loading');
        });
        
        // If image is already loaded
        if (img.complete) {
            photoContainer.classList.remove('loading');
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