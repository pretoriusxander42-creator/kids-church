/**
 * Sidebar Navigation Module
 * Handles sidebar collapse/expand, navigation between sections,
 * and responsive mobile navigation
 */

const SidebarNav = (() => {
    let sidebar = null;
    let sidebarToggle = null;
    let navItems = null;
    let mobileNavItems = null;
    let sidebarNav = null;
    let sidebarUser = null;
    let mobileNav = null;
    let isCollapsed = false;

    function init() {
        // Get DOM elements
        sidebar = document.getElementById('sidebar');
        sidebarToggle = document.getElementById('sidebarToggle');
        sidebarNav = document.getElementById('sidebarNav');
        sidebarUser = document.getElementById('sidebarUser');
        mobileNav = document.getElementById('mobileNav');
        navItems = document.querySelectorAll('.nav-item');
        mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        
        if (!sidebar) {
            console.error('Sidebar not found');
            return;
        }

        // Show sidebar and navigation when logged in
        if (window.currentUser) {
            showSidebar();
        }

        // Load saved collapsed state
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            toggleSidebar(false);
        }

        // Event Listeners
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => toggleSidebar());
        }

        // Navigation item clicks
        navItems.forEach(item => {
            item.addEventListener('click', handleNavigation);
        });

        mobileNavItems.forEach(item => {
            item.addEventListener('click', handleNavigation);
        });

        // Handle responsive behavior
        handleResize();
        window.addEventListener('resize', handleResize);

        console.log('Sidebar navigation initialized');
    }

    function showSidebar() {
        if (sidebar) sidebar.style.display = 'flex';
        if (sidebarNav) sidebarNav.style.display = 'block';
        if (sidebarUser) sidebarUser.style.display = 'flex';
        
        // Update user info
        if (window.currentUser) {
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            if (userName) userName.textContent = window.currentUser.name || 'User';
            if (userEmail) userEmail.textContent = window.currentUser.email || '';
        }

        // Show mobile nav on mobile devices
        if (window.innerWidth <= 768) {
            if (mobileNav) mobileNav.style.display = 'flex';
        }
    }

    function hideSidebar() {
        if (sidebar) sidebar.style.display = 'none';
        if (mobileNav) mobileNav.style.display = 'none';
    }

    function toggleSidebar(animate = true) {
        isCollapsed = !isCollapsed;
        
        if (sidebar) {
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }

        // Save state
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    function handleNavigation(e) {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        
        console.log('[SidebarNav] Navigation clicked:', view);
        
        // Remove active class from all nav items
        navItems.forEach(item => item.classList.remove('active'));
        mobileNavItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked item
        e.currentTarget.classList.add('active');
        
        // Find corresponding desktop/mobile nav item and mark it active too
        const correspondingItems = document.querySelectorAll(`[data-view="${view}"]`);
        correspondingItems.forEach(item => item.classList.add('active'));

        // Close mobile menu if open
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
        }

        // Route to appropriate view
        navigateTo(view);
    }

    function navigateTo(view) {
        console.log('[SidebarNav] navigateTo:', view);
        
        // Get dashboard section
        const dashboardSection = document.getElementById('dashboardSection');
        const mainContent = document.getElementById('mainContent');
        const welcomeBanner = document.querySelector('.welcome-banner');
        const statsGrid = document.querySelector('.stats-grid');
        
        console.log('[SidebarNav] Elements found:', {
            dashboardSection: !!dashboardSection,
            mainContent: !!mainContent,
            welcomeBanner: !!welcomeBanner,
            statsGrid: !!statsGrid
        });
        
        if (!dashboardSection || !mainContent) {
            console.error('[SidebarNav] Missing required elements');
            return;
        }

        // Show dashboard section if hidden
        if (dashboardSection.style.display === 'none') {
            dashboardSection.style.display = 'block';
        }

        // Route based on view
        switch (view) {
            case 'home':
                console.log('[SidebarNav] Loading home view - showing welcome banner and stats');
                // Show welcome banner and stats for home view
                if (welcomeBanner) {
                    welcomeBanner.style.display = 'block';
                    console.log('[SidebarNav] Welcome banner shown');
                }
                if (statsGrid) {
                    statsGrid.style.display = 'grid';
                    console.log('[SidebarNav] Stats grid shown');
                }
                if (typeof DashboardNav !== 'undefined') {
                    DashboardNav.switchView('overview');
                } else {
                    console.error('[SidebarNav] DashboardNav not available');
                }
                break;
            case 'checkin-system':
                console.log('[SidebarNav] Loading checkin-system view - hiding welcome banner and stats');
                // Hide welcome banner and stats for other views
                if (welcomeBanner) welcomeBanner.style.display = 'none';
                if (statsGrid) statsGrid.style.display = 'none';
                if (typeof DashboardNav !== 'undefined') {
                    DashboardNav.switchView('classrooms');
                } else {
                    console.error('[SidebarNav] DashboardNav not available');
                }
                break;
            case 'member-management':
                console.log('[SidebarNav] Loading member-management view - hiding welcome banner and stats');
                if (welcomeBanner) welcomeBanner.style.display = 'none';
                if (statsGrid) statsGrid.style.display = 'none';
                if (typeof DashboardNav !== 'undefined') {
                    DashboardNav.switchView('manage-children');
                } else {
                    console.error('[SidebarNav] DashboardNav not available');
                }
                break;
            case 'administration':
                console.log('[SidebarNav] Loading administration view - hiding welcome banner and stats');
                if (welcomeBanner) welcomeBanner.style.display = 'none';
                if (statsGrid) statsGrid.style.display = 'none';
                loadAdministrationView(dashboardSection);
                break;
            default:
                console.log('[SidebarNav] Default case - loading home view');
                if (welcomeBanner) welcomeBanner.style.display = 'block';
                if (statsGrid) statsGrid.style.display = 'grid';
                if (typeof DashboardNav !== 'undefined') {
                    DashboardNav.switchView('overview');
                } else {
                    console.error('[SidebarNav] DashboardNav not available');
                }
        }
    }

    function loadHomeView(container) {
        // Not used anymore - kept for compatibility
    }

    function loadCheckinView(container) {
        // Not used anymore - kept for compatibility
    }

    function loadMemberManagementView(container) {
        // Not used anymore - kept for compatibility
    }

    function loadAdministrationView(container) {
        const contentArea = container.querySelector('#dashboardContent') || container;
        contentArea.innerHTML = `
            <div class="page-header">
                <h1>Administration</h1>
                <p class="page-subtitle">Manage system settings and preferences</p>
            </div>
            <div class="admin-content" style="padding: 0 2rem 2rem;">
                
                <!-- Church Information -->
                <div class="settings-section">
                    <h3 class="section-title">Church Information</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="churchName">Church Name</label>
                            <input type="text" id="churchName" class="form-control" value="CRC Kids Church" placeholder="Enter church name">
                            <small class="setting-description">Displayed on reports and printouts</small>
                        </div>
                        <div class="setting-item">
                            <label for="churchPhone">Contact Phone</label>
                            <input type="tel" id="churchPhone" class="form-control" placeholder="(555) 123-4567">
                            <small class="setting-description">Emergency contact number</small>
                        </div>
                        <div class="setting-item">
                            <label for="churchEmail">Contact Email</label>
                            <input type="email" id="churchEmail" class="form-control" placeholder="kids@church.org">
                            <small class="setting-description">For parent communications</small>
                        </div>
                        <div class="setting-item">
                            <label for="churchAddress">Address</label>
                            <textarea id="churchAddress" class="form-control" rows="2" placeholder="123 Main Street, City, State 12345"></textarea>
                            <small class="setting-description">Physical location of church</small>
                        </div>
                    </div>
                </div>

                <!-- Check-in Settings -->
                <div class="settings-section">
                    <h3 class="section-title">Check-in System</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="securityCodeLength">Security Code Length</label>
                            <select id="securityCodeLength" class="form-control">
                                <option value="3">3 digits</option>
                                <option value="4" selected>4 digits</option>
                                <option value="5">5 digits</option>
                                <option value="6">6 digits</option>
                            </select>
                            <small class="setting-description">Number of digits in security codes</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="requireSignature" checked>
                                <span>Require Parent Signature</span>
                            </label>
                            <small class="setting-description">Parent must sign during check-in</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="printTags" checked>
                                <span>Auto-Print Security Tags</span>
                            </label>
                            <small class="setting-description">Automatically print tags after check-in</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="enableSelfCheckout">
                                <span>Allow Self Check-out</span>
                            </label>
                            <small class="setting-description">Parents can check out without staff assistance</small>
                        </div>
                        <div class="setting-item">
                            <label for="autoCheckoutTime">Auto Check-out After</label>
                            <select id="autoCheckoutTime" class="form-control">
                                <option value="0">Disabled</option>
                                <option value="3">3 hours</option>
                                <option value="4" selected>4 hours</option>
                                <option value="5">5 hours</option>
                                <option value="6">6 hours</option>
                            </select>
                            <small class="setting-description">Automatically check out after this time</small>
                        </div>
                    </div>
                </div>

                <!-- Classroom Settings -->
                <div class="settings-section">
                    <h3 class="section-title">Classroom Management</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="defaultCapacity">Default Classroom Capacity</label>
                            <input type="number" id="defaultCapacity" class="form-control" value="20" min="5" max="100">
                            <small class="setting-description">Default max children per classroom</small>
                        </div>
                        <div class="setting-item">
                            <label for="capacityWarning">Capacity Warning Threshold</label>
                            <input type="number" id="capacityWarning" class="form-control" value="90" min="50" max="100">
                            <small class="setting-description">Alert when classroom is X% full</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="ageBasedAssignment" checked>
                                <span>Age-Based Auto Assignment</span>
                            </label>
                            <small class="setting-description">Automatically suggest classrooms by age</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="showCapacityWarnings" checked>
                                <span>Show Capacity Warnings</span>
                            </label>
                            <small class="setting-description">Alert staff when classrooms are full</small>
                        </div>
                    </div>
                </div>

                <!-- Notifications & Alerts -->
                <div class="settings-section">
                    <h3 class="section-title">Notifications & Alerts</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="emailReminders" checked>
                                <span>Email Attendance Reminders</span>
                            </label>
                            <small class="setting-description">Send weekly attendance summaries to parents</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="specialNeedsAlerts" checked>
                                <span>Special Needs Alerts</span>
                            </label>
                            <small class="setting-description">Highlight children with special needs during check-in</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="allergyWarnings" checked>
                                <span>Allergy Warnings</span>
                            </label>
                            <small class="setting-description">Show alerts for children with allergies</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="birthdayNotifications" checked>
                                <span>Birthday Notifications</span>
                            </label>
                            <small class="setting-description">Show upcoming birthdays in dashboard</small>
                        </div>
                    </div>
                </div>

                <!-- Reports & Data -->
                <div class="settings-section">
                    <h3 class="section-title">Reports & Data Management</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="reportPeriod">Default Report Period</label>
                            <select id="reportPeriod" class="form-control">
                                <option value="week">Last 7 days</option>
                                <option value="month" selected>Last 30 days</option>
                                <option value="quarter">Last 3 months</option>
                                <option value="year">Last year</option>
                            </select>
                            <small class="setting-description">Default time range for reports</small>
                        </div>
                        <div class="setting-item">
                            <label for="dataRetention">Data Retention Period</label>
                            <select id="dataRetention" class="form-control">
                                <option value="1">1 year</option>
                                <option value="2" selected>2 years</option>
                                <option value="3">3 years</option>
                                <option value="5">5 years</option>
                                <option value="10">10 years</option>
                            </select>
                            <small class="setting-description">How long to keep attendance records</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="autoBackup" checked>
                                <span>Automatic Daily Backups</span>
                            </label>
                            <small class="setting-description">Back up data every night at midnight</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="anonymizeData">
                                <span>Anonymize Exported Data</span>
                            </label>
                            <small class="setting-description">Remove personal info from exports for privacy</small>
                        </div>
                    </div>
                </div>

                <!-- Security & Privacy -->
                <div class="settings-section">
                    <h3 class="section-title">Security & Privacy</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="sessionTimeout">Session Timeout</label>
                            <select id="sessionTimeout" class="form-control">
                                <option value="30">30 minutes</option>
                                <option value="60" selected>1 hour</option>
                                <option value="120">2 hours</option>
                                <option value="240">4 hours</option>
                                <option value="0">Never</option>
                            </select>
                            <small class="setting-description">Auto-logout after inactivity</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="requirePhotoConsent" checked>
                                <span>Require Photo Consent</span>
                            </label>
                            <small class="setting-description">Parents must consent to photos before check-in</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="twoFactorAuth">
                                <span>Two-Factor Authentication</span>
                            </label>
                            <small class="setting-description">Require 2FA for admin accounts</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="auditLog" checked>
                                <span>Enable Audit Logging</span>
                            </label>
                            <small class="setting-description">Track all system changes and access</small>
                        </div>
                    </div>
                </div>

                <!-- Display Preferences -->
                <div class="settings-section">
                    <h3 class="section-title">Display Preferences</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="dateFormat">Date Format</label>
                            <select id="dateFormat" class="form-control">
                                <option value="MM/DD/YYYY" selected>MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                            <small class="setting-description">How dates are displayed</small>
                        </div>
                        <div class="setting-item">
                            <label for="timeFormat">Time Format</label>
                            <select id="timeFormat" class="form-control">
                                <option value="12" selected>12-hour (AM/PM)</option>
                                <option value="24">24-hour</option>
                            </select>
                            <small class="setting-description">How times are displayed</small>
                        </div>
                        <div class="setting-item">
                            <label for="themeColor">Theme Color</label>
                            <select id="themeColor" class="form-control">
                                <option value="teal" selected>Teal (Default)</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="orange">Orange</option>
                            </select>
                            <small class="setting-description">Primary color theme</small>
                        </div>
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" id="darkMode">
                                <span>Dark Mode</span>
                            </label>
                            <small class="setting-description">Use dark theme for the interface</small>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="settings-actions" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--color-gray-200); display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn-secondary" id="resetSettingsBtn">Reset to Defaults</button>
                    <button class="btn-primary" id="saveSettingsBtn">Save All Settings</button>
                </div>
            </div>
        `;

        // Attach event listeners and load existing settings
        setTimeout(() => {
            const saveBtn = document.getElementById('saveSettingsBtn');
            const resetBtn = document.getElementById('resetSettingsBtn');
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => saveAdminSettings());
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => resetAdminSettings());
            }
            
            // Load existing settings from database
            loadAdminSettings();
        }, 0);
    }

    async function saveAdminSettings() {
        // Collect all settings
        const settings = {
            church: {
                name: document.getElementById('churchName')?.value || '',
                phone: document.getElementById('churchPhone')?.value || '',
                email: document.getElementById('churchEmail')?.value || '',
                address: document.getElementById('churchAddress')?.value || ''
            },
            checkin: {
                securityCodeLength: parseInt(document.getElementById('securityCodeLength')?.value || '4'),
                requireSignature: document.getElementById('requireSignature')?.checked || false,
                printTags: document.getElementById('printTags')?.checked || false,
                enableSelfCheckout: document.getElementById('enableSelfCheckout')?.checked || false,
                autoCheckoutTime: parseInt(document.getElementById('autoCheckoutTime')?.value || '4')
            },
            classroom: {
                defaultCapacity: parseInt(document.getElementById('defaultCapacity')?.value || '20'),
                capacityWarning: parseInt(document.getElementById('capacityWarning')?.value || '90'),
                ageBasedAssignment: document.getElementById('ageBasedAssignment')?.checked || false,
                showCapacityWarnings: document.getElementById('showCapacityWarnings')?.checked || false
            },
            notifications: {
                emailReminders: document.getElementById('emailReminders')?.checked || false,
                specialNeedsAlerts: document.getElementById('specialNeedsAlerts')?.checked || false,
                allergyWarnings: document.getElementById('allergyWarnings')?.checked || false,
                birthdayNotifications: document.getElementById('birthdayNotifications')?.checked || false
            },
            reports: {
                reportPeriod: document.getElementById('reportPeriod')?.value || 'month',
                dataRetention: parseInt(document.getElementById('dataRetention')?.value || '2'),
                autoBackup: document.getElementById('autoBackup')?.checked || false,
                anonymizeData: document.getElementById('anonymizeData')?.checked || false
            },
            security: {
                sessionTimeout: parseInt(document.getElementById('sessionTimeout')?.value || '60'),
                requirePhotoConsent: document.getElementById('requirePhotoConsent')?.checked || false,
                twoFactorAuth: document.getElementById('twoFactorAuth')?.checked || false,
                auditLog: document.getElementById('auditLog')?.checked || false
            },
            display: {
                dateFormat: document.getElementById('dateFormat')?.value || 'MM/DD/YYYY',
                timeFormat: document.getElementById('timeFormat')?.value || '12',
                themeColor: document.getElementById('themeColor')?.value || 'teal',
                darkMode: document.getElementById('darkMode')?.checked || false
            }
        };

        try {
            console.log('Saving settings:', settings);
            
            // Save to API
            const result = await Utils.apiRequest('/api/settings', {
                method: 'PUT',
                body: JSON.stringify({ settings })
            });

            console.log('Save API response:', result);

            if (result.success) {
                // Also save to localStorage as backup
                localStorage.setItem('adminSettings', JSON.stringify(settings));
                
                // Show success message
                Utils.showToast('Settings saved successfully!', 'success');
                
                console.log('Settings saved successfully:', settings);
                
                // Apply settings immediately
                applySettings(settings);
            } else {
                throw new Error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            Utils.showToast('Failed to save settings: ' + error.message, 'error');
        }
    }

    async function resetAdminSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            try {
                // Reset via API
                const result = await Utils.apiRequest('/api/settings/reset', {
                    method: 'POST'
                });

                if (result.success) {
                    localStorage.removeItem('adminSettings');
                    Utils.showToast('Settings reset to defaults', 'success');
                    
                    // Reload the administration view
                    const dashboardSection = document.getElementById('dashboardSection');
                    if (dashboardSection) {
                        loadAdministrationView(dashboardSection);
                    }
                } else {
                    throw new Error(result.error || 'Failed to reset settings');
                }
            } catch (error) {
                console.error('Error resetting settings:', error);
                Utils.showToast('Failed to reset settings: ' + error.message, 'error');
            }
        }
    }

    async function loadAdminSettings() {
        try {
            // Load from API
            const result = await Utils.apiRequest('/api/settings');
            
            console.log('Settings API response:', result);
            
            if (result.success && result.data) {
                // The API response is wrapped by Utils.apiRequest, so we need result.data.data
                const settings = result.data.data;
                console.log('Settings object:', settings);
                console.log('settings.church:', settings.church);
                
                // Apply settings to form fields
                if (settings.church) {
                    if (settings.church.name) document.getElementById('churchName').value = settings.church.name;
                    if (settings.church.phone) document.getElementById('churchPhone').value = settings.church.phone;
                    if (settings.church.email) document.getElementById('churchEmail').value = settings.church.email;
                    if (settings.church.address) document.getElementById('churchAddress').value = settings.church.address;
                }
                
                if (settings.checkin) {
                    if (settings.checkin.securityCodeLength) document.getElementById('securityCodeLength').value = settings.checkin.securityCodeLength;
                    if (settings.checkin.requireSignature !== undefined) document.getElementById('requireSignature').checked = settings.checkin.requireSignature;
                    if (settings.checkin.printTags !== undefined) document.getElementById('printTags').checked = settings.checkin.printTags;
                    if (settings.checkin.enableSelfCheckout !== undefined) document.getElementById('enableSelfCheckout').checked = settings.checkin.enableSelfCheckout;
                    if (settings.checkin.autoCheckoutTime) document.getElementById('autoCheckoutTime').value = settings.checkin.autoCheckoutTime;
                }
                
                if (settings.classroom) {
                    if (settings.classroom.defaultCapacity) document.getElementById('defaultCapacity').value = settings.classroom.defaultCapacity;
                    if (settings.classroom.capacityWarning) document.getElementById('capacityWarning').value = settings.classroom.capacityWarning;
                    if (settings.classroom.ageBasedAssignment !== undefined) document.getElementById('ageBasedAssignment').checked = settings.classroom.ageBasedAssignment;
                    if (settings.classroom.showCapacityWarnings !== undefined) document.getElementById('showCapacityWarnings').checked = settings.classroom.showCapacityWarnings;
                }
                
                if (settings.notifications) {
                    if (settings.notifications.emailReminders !== undefined) document.getElementById('emailReminders').checked = settings.notifications.emailReminders;
                    if (settings.notifications.specialNeedsAlerts !== undefined) document.getElementById('specialNeedsAlerts').checked = settings.notifications.specialNeedsAlerts;
                    if (settings.notifications.allergyWarnings !== undefined) document.getElementById('allergyWarnings').checked = settings.notifications.allergyWarnings;
                    if (settings.notifications.birthdayNotifications !== undefined) document.getElementById('birthdayNotifications').checked = settings.notifications.birthdayNotifications;
                }
                
                if (settings.reports) {
                    if (settings.reports.reportPeriod) document.getElementById('reportPeriod').value = settings.reports.reportPeriod;
                    if (settings.reports.dataRetention) document.getElementById('dataRetention').value = settings.reports.dataRetention;
                    if (settings.reports.autoBackup !== undefined) document.getElementById('autoBackup').checked = settings.reports.autoBackup;
                    if (settings.reports.anonymizeData !== undefined) document.getElementById('anonymizeData').checked = settings.reports.anonymizeData;
                }
                
                if (settings.security) {
                    if (settings.security.sessionTimeout) document.getElementById('sessionTimeout').value = settings.security.sessionTimeout;
                    if (settings.security.requirePhotoConsent !== undefined) document.getElementById('requirePhotoConsent').checked = settings.security.requirePhotoConsent;
                    if (settings.security.twoFactorAuth !== undefined) document.getElementById('twoFactorAuth').checked = settings.security.twoFactorAuth;
                    if (settings.security.auditLog !== undefined) document.getElementById('auditLog').checked = settings.security.auditLog;
                }
                
                if (settings.display) {
                    if (settings.display.dateFormat) document.getElementById('dateFormat').value = settings.display.dateFormat;
                    if (settings.display.timeFormat) document.getElementById('timeFormat').value = settings.display.timeFormat;
                    if (settings.display.themeColor) document.getElementById('themeColor').value = settings.display.themeColor;
                    if (settings.display.darkMode !== undefined) document.getElementById('darkMode').checked = settings.display.darkMode;
                }
                
                // Apply settings to the app
                applySettings(settings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Fall back to localStorage if API fails
            const saved = localStorage.getItem('adminSettings');
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    // Apply cached settings (implementation similar to above)
                } catch (e) {
                    console.error('Failed to load cached settings:', e);
                }
            }
        }
    }
    
    function applySettings(settings) {
        // Apply theme color
        if (settings.display?.themeColor) {
            applyThemeColor(settings.display.themeColor);
        }
        
        // Apply dark mode
        if (settings.display?.darkMode !== undefined) {
            applyDarkMode(settings.display.darkMode);
        }
        
        // Store settings globally for other modules to access
        window.appSettings = settings;
        
        console.log('Settings applied:', settings);
    }
    
    function applyThemeColor(color) {
        const root = document.documentElement;
        const colorMap = {
            teal: { primary: '#14b8a6', primaryDark: '#0d9488' },
            blue: { primary: '#3b82f6', primaryDark: '#2563eb' },
            green: { primary: '#10b981', primaryDark: '#059669' },
            purple: { primary: '#8b5cf6', primaryDark: '#7c3aed' },
            orange: { primary: '#f97316', primaryDark: '#ea580c' }
        };
        
        const colors = colorMap[color] || colorMap.teal;
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-dark', colors.primaryDark);
        root.style.setProperty('--primary-color', colors.primary);
    }
    
    function applyDarkMode(enabled) {
        const root = document.documentElement;
        
        if (enabled) {
            // Dark mode colors - softer, more professional
            root.style.setProperty('--color-background', '#0f172a');
            root.style.setProperty('--color-surface', '#1e293b');
            root.style.setProperty('--color-text', '#f1f5f9');
            root.style.setProperty('--color-text-secondary', '#94a3b8');
            root.style.setProperty('--color-border', '#334155');
            root.style.setProperty('--color-gray-50', '#0f172a');
            root.style.setProperty('--color-gray-100', '#1e293b');
            root.style.setProperty('--color-gray-200', '#334155');
            root.style.setProperty('--color-gray-300', '#475569');
            root.style.setProperty('--color-gray-400', '#64748b');
            root.style.setProperty('--color-gray-500', '#94a3b8');
            root.style.setProperty('--color-gray-600', '#cbd5e1');
            root.style.setProperty('--color-gray-700', '#e2e8f0');
            root.style.setProperty('--color-gray-800', '#f1f5f9');
            root.style.setProperty('--color-gray-900', '#f8fafc');
            
            // Adjust shadows for dark mode
            root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.5)');
            
            // Add dark mode class to body
            document.body.classList.add('dark-mode');
        } else {
            // Light mode colors (reset to defaults)
            root.style.setProperty('--color-background', '#f8fafc');
            root.style.setProperty('--color-surface', '#ffffff');
            root.style.setProperty('--color-text', '#1e293b');
            root.style.setProperty('--color-text-secondary', '#64748b');
            root.style.setProperty('--color-border', '#e2e8f0');
            root.style.setProperty('--color-gray-50', '#f8fafc');
            root.style.setProperty('--color-gray-100', '#f1f5f9');
            root.style.setProperty('--color-gray-200', '#e2e8f0');
            root.style.setProperty('--color-gray-300', '#cbd5e1');
            root.style.setProperty('--color-gray-400', '#94a3b8');
            root.style.setProperty('--color-gray-500', '#64748b');
            root.style.setProperty('--color-gray-600', '#475569');
            root.style.setProperty('--color-gray-700', '#334155');
            root.style.setProperty('--color-gray-800', '#1e293b');
            root.style.setProperty('--color-gray-900', '#0f172a');
            
            // Reset shadows
            root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
            root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
            
            // Remove dark mode class from body
            document.body.classList.remove('dark-mode');
        }
    }

    function handleResize() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            // Mobile view
            if (sidebar) {
                sidebar.classList.remove('collapsed');
                isCollapsed = false;
            }
            if (mobileNav && window.currentUser) {
                mobileNav.style.display = 'flex';
            }
        } else {
            // Desktop view
            if (mobileNav) {
                mobileNav.style.display = 'none';
            }
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }
    }

    // Public API
    return {
        init,
        showSidebar,
        hideSidebar,
        navigateTo
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.currentUser) {
            SidebarNav.init();
        }
    });
} else {
    if (window.currentUser) {
        SidebarNav.init();
    }
}

// Make available globally
window.SidebarNav = SidebarNav;
