/**
 * AURA DENTAL CLINIC & PATIENT BOOKING PORTAL
 * Main JavaScript Engine (main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initRtlEngine();
  initMobileDrawer();
  initCounterAnimations();
  highlightActiveNav();
});

/**
 * Theme Engine (Light / Dark mode) with System Preference & LocalStorage Persistence
 */
function initThemeEngine() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const storedTheme = localStorage.getItem('aura_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = storedTheme ? storedTheme : (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    });
  });

  // Listen for system theme changes if not overridden
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('aura_theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('aura_theme', theme);

  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill';
        btn.setAttribute('aria-label', 'Switch to Light Mode');
        btn.setAttribute('title', 'Switch to Light Mode');
      } else {
        icon.className = 'bi bi-moon-stars';
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
        btn.setAttribute('title', 'Switch to Dark Mode');
      }
    }
  });
}

/**
 * RTL Engine
 */
function initRtlEngine() {
  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
  const storedRtl = localStorage.getItem('aura_rtl');

  if (storedRtl === 'true') {
    document.documentElement.setAttribute('dir', 'rtl');
  }

  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      if (isRtl) {
        document.documentElement.removeAttribute('dir');
        localStorage.setItem('aura_rtl', 'false');
        showToast('Direction: Left-to-Right (LTR)', 'info');
      } else {
        document.documentElement.setAttribute('dir', 'rtl');
        localStorage.setItem('aura_rtl', 'true');
        showToast('Direction: Right-to-Left (RTL)', 'info');
      }
    });
  });
}

/**
 * Mobile Drawer / Offcanvas Navigation
 */
function initMobileDrawer() {
  const hamburgerBtns = document.querySelectorAll('.hamburger-btn');
  const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtns = document.querySelectorAll('.drawer-close-btn');

  if (!drawer) return;

  function openDrawer() {
    drawer.classList.add('active');
    if (drawerOverlay) drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtns.forEach(btn => btn.addEventListener('click', openDrawer));
  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/**
 * Smooth Animated Number Counter
 */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-count'), 10);
        const suffix = target.getAttribute('data-suffix') || '';
        if (isNaN(countTo)) return;

        let current = 0;
        const duration = 1500;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = countTo / totalSteps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= countTo) {
            target.textContent = countTo.toLocaleString() + suffix;
            clearInterval(timer);
          } else {
            target.textContent = Math.floor(current).toLocaleString() + suffix;
          }
        }, stepTime);

        obs.unobserve(target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Highlight Active Navigation Link based on current URL
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const linkFile = href.split('/').pop();
      if (linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')) {
        link.classList.add('active');
      }
    }
  });
}

/**
 * Global Toast Notification Utility
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  
  let icon = 'bi-info-circle-fill';
  if (type === 'success') icon = 'bi-check-circle-fill';
  if (type === 'error') icon = 'bi-exclamation-triangle-fill';

  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.showToast = showToast;
