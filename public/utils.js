// Utility functions for API calls, loading states, and error handling

const Utils = {
  // Show loading spinner
  showLoading(container, message = 'Loading...') {
    container.innerHTML = `
      <div class="loading-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #64748b;
      ">
        <div class="spinner" style="
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 0.8s linear infinite;
        "></div>
        <p style="margin-top: 1rem; font-size: 0.95rem;">${message}</p>
      </div>
    `;
  },

  // Show error message
  showError(container, message = 'An error occurred', retry = null) {
    const retryButton = retry ? `
      <button onclick="${retry}" style="
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.9rem;
      ">Try Again</button>
    ` : '';

    container.innerHTML = `
      <div class="error-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #ef4444;
        text-align: center;
      ">
        <svg style="width: 48px; height: 48px; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p style="font-weight: 500; font-size: 1.1rem;">${message}</p>
        ${retryButton}
      </div>
    `;
  },

  // Show empty state
  showEmpty(container, message = 'No data available', action = null) {
    const actionButton = action ? `
      <button onclick="${action.handler}" style="
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.9rem;
      ">${action.label}</button>
    ` : '';

    container.innerHTML = `
      <div class="empty-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #64748b;
        text-align: center;
      ">
        <svg style="width: 48px; height: 48px; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p style="font-weight: 500; font-size: 1.1rem;">${message}</p>
        ${actionButton}
      </div>
    `;
  },

  // API request wrapper with error handling
  async apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(endpoint, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Request failed:', endpoint, error);
      return { success: false, error: error.message };
    }
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Format time
  formatTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Debounce function for search inputs
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
  },

  // Show toast notification
  showToast(message, type = 'success') {
    // Announce to screen readers
    this.announceToScreenReader(message);

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${bgColor};
      color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
      font-size: 0.95rem;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Announce messages to screen readers
  announceToScreenReader(message) {
    let announcer = document.getElementById('aria-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'aria-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcer);
    }

    // Clear and set new message
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  },

  // Focus trap for modals
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element
    setTimeout(() => firstFocusable?.focus(), 100);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => element.removeEventListener('keydown', handleKeyDown);
  },

  // Confirm dialog
  async confirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        max-width: 400px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      `;

      modal.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600; color: #1e293b;">${title}</h3>
        <p style="margin: 0 0 1.5rem 0; color: #64748b;">${message}</p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button id="cancelBtn" style="
            padding: 0.5rem 1rem;
            background: #e2e8f0;
            color: #475569;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
          ">Cancel</button>
          <button id="confirmBtn" style="
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
          ">Confirm</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      modal.querySelector('#confirmBtn').onclick = () => {
        overlay.remove();
        resolve(true);
      };

      modal.querySelector('#cancelBtn').onclick = () => {
        overlay.remove();
        resolve(false);
      };

      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(false);
        }
      };
    });
  }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Offline detection
let isOnline = navigator.onLine;
const offlineBar = document.createElement('div');
offlineBar.id = 'offline-indicator';
offlineBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ef4444;
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  z-index: 10000;
  display: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;
offlineBar.textContent = '⚠️ No internet connection. Some features may not work.';
document.body.appendChild(offlineBar);

window.addEventListener('online', () => {
  isOnline = true;
  offlineBar.style.display = 'none';
  Utils.showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
  isOnline = false;
  offlineBar.style.display = 'block';
  Utils.showToast('No internet connection', 'error');
});

// Check connection on load
if (!navigator.onLine) {
  offlineBar.style.display = 'block';
}

// Make Utils available globally
window.Utils = Utils;
