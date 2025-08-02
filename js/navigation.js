/**
 * Modern Navigation Component
 * Handles mobile menu toggle, keyboard navigation, and accessibility
 */

class Navigation {
  constructor() {
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    this.isMenuOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.navToggle || !this.navMenu) return;
    
    // Bind event listeners
    this.bindEvents();
    
    // Set initial ARIA attributes
    this.setInitialAriaAttributes();
    
    // Set active page
    this.setActivePage();
  }
  
  bindEvents() {
    // Mobile menu toggle
    this.navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });
    
    // Close menu when clicking nav links on mobile
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 767) {
          this.closeMobileMenu();
        }
      });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
        this.navToggle.focus();
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Keyboard navigation for menu items
    this.navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        this.handleKeyboardNavigation(e, index);
      });
    });
  }
  
  setInitialAriaAttributes() {
    // Set ARIA attributes for mobile menu toggle
    this.navToggle.setAttribute('aria-label', 'Toggle navigation menu');
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.navToggle.setAttribute('aria-controls', 'main-navigation');
    this.navToggle.setAttribute('type', 'button');
    
    // Set ARIA attributes for navigation menu
    this.navMenu.setAttribute('id', 'main-navigation');
    this.navMenu.setAttribute('role', 'navigation');
    this.navMenu.setAttribute('aria-label', 'Main navigation');
    
    // Ensure all navigation links have proper roles
    this.navLinks.forEach((link, index) => {
      link.setAttribute('role', 'menuitem');
      link.setAttribute('tabindex', '0');
    });
  }
  
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.isMenuOpen = true;
    this.navToggle.classList.add('active');
    this.navMenu.classList.add('active');
    this.navToggle.setAttribute('aria-expanded', 'true');
    
    // Focus first menu item for keyboard users
    setTimeout(() => {
      const firstLink = this.navMenu.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    }, 100);
    
    // Prevent body scroll on mobile when menu is open
    document.body.style.overflow = 'hidden';
  }
  
  closeMobileMenu() {
    this.isMenuOpen = false;
    this.navToggle.classList.remove('active');
    this.navMenu.classList.remove('active');
    this.navToggle.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
  
  handleKeyboardNavigation(e, currentIndex) {
    const totalLinks = this.navLinks.length;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % totalLinks;
        this.navLinks[nextIndex].focus();
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + totalLinks) % totalLinks;
        this.navLinks[prevIndex].focus();
        break;
        
      case 'Home':
        e.preventDefault();
        this.navLinks[0].focus();
        break;
        
      case 'End':
        e.preventDefault();
        this.navLinks[totalLinks - 1].focus();
        break;
    }
  }
  
  setActivePage() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    this.navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      link.classList.remove('active');
      
      if (linkPath === currentPage || 
          (currentPage === '' && linkPath === 'index.html') ||
          (currentPage === 'index.html' && linkPath === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});

// Handle smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update focus for accessibility
        targetElement.focus();
      }
    });
  });
});