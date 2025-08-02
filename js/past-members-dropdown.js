/**
 * Past Members Dropdown Functionality
 * Handles collapsible sections for past members categories
 */

class PastMembersDropdown {
    constructor() {
        this.toggles = document.querySelectorAll('.past-members-toggle');
        this.init();
    }

    init() {
        if (this.toggles.length === 0) return;
        
        this.bindEvents();
        this.setupInitialState();
    }

    bindEvents() {
        this.toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSection(toggle);
            });

            // Keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleSection(toggle);
                }
            });
        });
    }

    setupInitialState() {
        // All sections start collapsed
        this.toggles.forEach(toggle => {
            const targetId = toggle.getAttribute('aria-controls');
            const targetList = document.getElementById(targetId);
            
            if (targetList) {
                targetList.classList.add('collapsed');
                targetList.classList.remove('expanded');
            }
            
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    toggleSection(toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const targetId = toggle.getAttribute('aria-controls');
        const targetList = document.getElementById(targetId);
        
        if (!targetList) return;

        if (isExpanded) {
            // Collapse
            toggle.setAttribute('aria-expanded', 'false');
            targetList.classList.remove('expanded');
            targetList.classList.add('collapsed');
            
            // Announce to screen readers
            this.announceChange(toggle, 'collapsed');
        } else {
            // Expand
            toggle.setAttribute('aria-expanded', 'true');
            targetList.classList.remove('collapsed');
            targetList.classList.add('expanded');
            
            // Announce to screen readers
            this.announceChange(toggle, 'expanded');
        }
    }

    announceChange(toggle, state) {
        const categoryName = toggle.querySelector('h3').textContent;
        const announcement = `${categoryName} section ${state}`;
        
        // Create temporary announcement for screen readers
        const announcement_element = document.createElement('div');
        announcement_element.setAttribute('aria-live', 'polite');
        announcement_element.setAttribute('aria-atomic', 'true');
        announcement_element.className = 'sr-only';
        announcement_element.textContent = announcement;
        
        document.body.appendChild(announcement_element);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement_element);
        }, 1000);
    }

    // Public method to expand all sections
    expandAll() {
        this.toggles.forEach(toggle => {
            if (toggle.getAttribute('aria-expanded') === 'false') {
                this.toggleSection(toggle);
            }
        });
    }

    // Public method to collapse all sections
    collapseAll() {
        this.toggles.forEach(toggle => {
            if (toggle.getAttribute('aria-expanded') === 'true') {
                this.toggleSection(toggle);
            }
        });
    }
}

// Initialize dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    window.PastMembersDropdown = new PastMembersDropdown();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PastMembersDropdown;
}