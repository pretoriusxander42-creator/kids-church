/**
 * Mobile Touch Gestures Module
 * Handles swipe gestures, pull-to-refresh, and mobile interactions
 */

const MobileGestures = (() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let swipeThreshold = 50; // minimum distance for swipe
    let velocityThreshold = 0.3;

    /**
     * Initialize swipe-to-delete on list items
     */
    function initSwipeToDelete(selector, onDelete) {
        const items = document.querySelectorAll(selector);
        
        items.forEach(item => {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let deleteTriggered = false;
            
            const deleteButton = document.createElement('div');
            deleteButton.className = 'swipe-delete-button';
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            `;
            item.style.position = 'relative';
            item.style.overflow = 'hidden';
            item.appendChild(deleteButton);

            item.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                deleteTriggered = false;
                item.style.transition = 'none';
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                
                // Only allow left swipe
                if (diff < 0) {
                    item.style.transform = `translateX(${diff}px)`;
                    deleteButton.style.opacity = Math.min(Math.abs(diff) / 100, 1);
                }
            }, { passive: true });

            item.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                
                const diff = currentX - startX;
                item.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                
                if (diff < -100 && !deleteTriggered) {
                    // Trigger delete
                    deleteTriggered = true;
                    item.style.transform = 'translateX(-100%)';
                    item.style.opacity = '0';
                    
                    setTimeout(() => {
                        if (onDelete) {
                            onDelete(item);
                        }
                    }, 300);
                } else {
                    // Reset position
                    item.style.transform = 'translateX(0)';
                    deleteButton.style.opacity = '0';
                }
            });
        });
    }

    /**
     * Initialize horizontal swipe navigation
     */
    function initSwipeNavigation(container, onSwipeLeft, onSwipeRight) {
        if (!container) return;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            handleSwipe(onSwipeLeft, onSwipeRight);
        }, { passive: true });
    }

    function handleSwipe(onSwipeLeft, onSwipeRight) {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Check if horizontal swipe is dominant
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > swipeThreshold && onSwipeRight) {
                onSwipeRight();
            } else if (deltaX < -swipeThreshold && onSwipeLeft) {
                onSwipeLeft();
            }
        }
    }

    /**
     * Initialize pull-to-refresh
     */
    function initPullToRefresh(container, onRefresh) {
        if (!container) return;

        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        let refreshTriggered = false;

        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-refresh-indicator';
        refreshIndicator.innerHTML = `
            <div class="spinner spinner-sm"></div>
            <span>Pull to refresh</span>
        `;
        container.insertBefore(refreshIndicator, container.firstChild);

        container.addEventListener('touchstart', (e) => {
            if (container.scrollTop === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
                refreshTriggered = false;
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isPulling || container.scrollTop > 0) return;
            
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0 && diff < 150) {
                e.preventDefault();
                refreshIndicator.style.transform = `translateY(${diff}px)`;
                refreshIndicator.style.opacity = Math.min(diff / 100, 1);
                
                if (diff > 80) {
                    refreshIndicator.querySelector('span').textContent = 'Release to refresh';
                }
            }
        });

        container.addEventListener('touchend', () => {
            if (!isPulling) return;
            isPulling = false;
            
            const diff = currentY - startY;
            
            if (diff > 80 && !refreshTriggered) {
                refreshTriggered = true;
                refreshIndicator.style.transform = 'translateY(60px)';
                refreshIndicator.querySelector('span').textContent = 'Refreshing...';
                
                if (onRefresh) {
                    onRefresh().then(() => {
                        refreshIndicator.style.transform = 'translateY(-60px)';
                        refreshIndicator.style.opacity = '0';
                        setTimeout(() => {
                            refreshIndicator.querySelector('span').textContent = 'Pull to refresh';
                        }, 300);
                    });
                }
            } else {
                refreshIndicator.style.transform = 'translateY(-60px)';
                refreshIndicator.style.opacity = '0';
            }
        });
    }

    /**
     * Add haptic feedback (if supported)
     */
    function hapticFeedback(style = 'light') {
        if (navigator.vibrate) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                success: [10, 50, 10],
                error: [20, 50, 20, 50, 20]
            };
            navigator.vibrate(patterns[style] || patterns.light);
        }
    }

    /**
     * Initialize mobile sidebar drawer
     */
    function initSidebarDrawer() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';
        document.body.appendChild(overlay);

        // Create mobile menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.id = 'mobileMenuBtn';
        menuBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        document.body.appendChild(menuBtn);

        // Toggle sidebar
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            hapticFeedback('light');
        });

        // Close on overlay click
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close on nav item click (mobile)
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    setTimeout(() => {
                        sidebar.classList.remove('open');
                        overlay.classList.remove('active');
                    }, 200);
                });
            });
        }
    }

    /**
     * Initialize accordion functionality
     */
    function initAccordion(selector = '.accordion-card') {
        const accordions = document.querySelectorAll(selector);
        
        accordions.forEach(accordion => {
            const header = accordion.querySelector('.accordion-header');
            if (!header) return;
            
            header.addEventListener('click', () => {
                const isExpanded = accordion.classList.contains('expanded');
                
                // Close all other accordions (optional)
                // accordions.forEach(a => a.classList.remove('expanded'));
                
                if (isExpanded) {
                    accordion.classList.remove('expanded');
                } else {
                    accordion.classList.add('expanded');
                }
                
                hapticFeedback('light');
            });
        });
    }

    /**
     * Initialize all mobile gestures
     */
    function init() {
        if (window.innerWidth <= 768) {
            initSidebarDrawer();
            initAccordion();
            
            // Add viewport meta tag if not present
            if (!document.querySelector('meta[name="viewport"]')) {
                const meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                document.head.appendChild(meta);
            }
        }
    }

    // Public API
    return {
        init,
        initSwipeToDelete,
        initSwipeNavigation,
        initPullToRefresh,
        initAccordion,
        hapticFeedback
    };
})();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MobileGestures.init);
} else {
    MobileGestures.init();
}

// Make available globally
window.MobileGestures = MobileGestures;
