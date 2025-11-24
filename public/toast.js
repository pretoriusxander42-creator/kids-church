/**
 * Toast Notification System
 * Provides beautiful, animated toast notifications
 */

const Toast = (() => {
    let container = null;
    let toastId = 0;

    function init() {
        // Create toast container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    function show(options) {
        init();

        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            dismissible = true
        } = options;

        const id = `toast-${++toastId}`;
        const toast = createToastElement(id, type, title, message, dismissible);
        
        container.appendChild(toast);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, duration);
        }

        return id;
    }

    function createToastElement(id, type, title, message, dismissible) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = id;

        const icon = getIconForType(type);
        
        toast.innerHTML = `
            <div class="toast-icon">
                ${icon}
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            ${dismissible ? `
                <button class="toast-close" onclick="Toast.dismiss('${id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            ` : ''}
            <div class="toast-progress"></div>
        `;

        return toast;
    }

    function getIconForType(type) {
        const icons = {
            success: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `,
            error: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `,
            warning: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            `,
            info: `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            `
        };

        return icons[type] || icons.info;
    }

    function dismiss(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    function success(message, title = 'Success') {
        return show({ type: 'success', title, message });
    }

    function error(message, title = 'Error') {
        return show({ type: 'error', title, message });
    }

    function warning(message, title = 'Warning') {
        return show({ type: 'warning', title, message });
    }

    function info(message, title = 'Info') {
        return show({ type: 'info', title, message });
    }

    // Public API
    return {
        show,
        dismiss,
        success,
        error,
        warning,
        info
    };
})();

// Make available globally
window.Toast = Toast;
