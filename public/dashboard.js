// Dashboard navigation and enhanced features

const DashboardNav = {
  init() {
    this.createNavigation();
    this.bindEvents();
    this.loadDashboardStats();
    this.startAutoRefresh();
    // Load overview by default
    setTimeout(() => {
      this.switchView('overview');
    }, 100);
  },

  createNavigation() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;

    const navHTML = `
      <div class="dashboard-nav">
        <button class="nav-tab active" data-view="overview">Overview</button>
        <button class="nav-tab" data-view="classrooms">Select Classroom</button>
        <button class="nav-tab" data-view="ftv">FTV Board</button>
        <button class="nav-tab" data-view="special-needs">Special Needs</button>
        <button class="nav-tab" data-view="manage-children">Manage Children</button>
      </div>
      <div id="dashboardContent" class="dashboard-content"></div>
    `;

    const welcomeBanner = dashboardSection.querySelector('.welcome-banner');
    if (welcomeBanner && welcomeBanner.nextSibling) {
      welcomeBanner.insertAdjacentHTML('afterend', navHTML);
    }
  },

  bindEvents() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });
  },

  switchView(view) {
    console.log('[DashboardNav] switchView called with:', view);
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    // Get references to dashboard elements
    const welcomeBanner = document.querySelector('.welcome-banner');
    const statsGrid = document.querySelector('.stats-grid');
    const content = document.getElementById('dashboardContent');
    
    console.log('[DashboardNav] Elements found:', {
      welcomeBanner: !!welcomeBanner,
      statsGrid: !!statsGrid,
      content: !!content
    });
    
    if (!content) {
      console.error('[DashboardNav] dashboardContent not found');
      return;
    }

    // Show/hide welcome banner and stats based on view
    if (view === 'overview') {
      console.log('[DashboardNav] Overview view - showing stats');
      // Show stats on overview
      if (welcomeBanner) {
        welcomeBanner.style.display = 'block';
        console.log('[DashboardNav] Welcome banner display set to block');
      }
      if (statsGrid) {
        statsGrid.style.display = 'grid';
        console.log('[DashboardNav] Stats grid display set to grid');
      }
      this.startAutoRefresh();
      // Refresh stats when returning to overview
      this.loadDashboardStats();
    } else {
      console.log('[DashboardNav] Non-overview view - hiding stats');
      // Hide stats on other views
      if (welcomeBanner) {
        welcomeBanner.style.display = 'none';
        console.log('[DashboardNav] Welcome banner hidden');
      }
      if (statsGrid) {
        statsGrid.style.display = 'none';
        console.log('[DashboardNav] Stats grid hidden');
      }
      this.stopAutoRefresh();
    }

    // Load view content
    console.log('[DashboardNav] Loading content for view:', view);
    switch(view) {
      case 'overview':
        this.loadOverview(content);
        break;
      case 'classrooms':
        this.loadClassroomSelection(content);
        break;
      case 'checkin':
        this.loadCheckinView(content);
        break;
      case 'classes':
        this.loadClassesView(content);
        break;
      case 'ftv':
        this.loadFTVBoard(content);
        break;
      case 'special-needs':
        this.loadSpecialNeedsBoard(content);
        break;
      case 'manage-children':
        this.loadChildManagement(content);
        break;
    }
  },

  async loadDashboardStats() {
    try {
      const result = await Utils.apiRequest('/api/statistics/dashboard');
      
      if (result.success) {
        this.updateStatsDisplay(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  updateStatsDisplay(stats) {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
      statNumbers[0].textContent = stats.totalChildren || 0;
      statNumbers[1].textContent = stats.todayCheckIns || 0;
      statNumbers[2].textContent = stats.weekCheckIns || 0;
      statNumbers[3].textContent = stats.totalParents || 0;
    }
  },

  loadOverview(content) {
    // Get today's date for the date picker default
    const today = new Date().toISOString().split('T')[0];
    
    content.innerHTML = `
      <div class="overview-section">
        <div class="section-header">
          <h2>Overview</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-secondary" id="exportDataBtn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem;">
                <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M4.667 6.667L8 10m0 0l3.333-3.333M8 10V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Export Data
            </button>
            <button class="btn-secondary" id="addChildBtn">+ Add Child</button>
            <button class="btn-secondary" id="addParentBtn">+ Add Parent</button>
            <button class="btn-secondary" id="manageChildrenBtn">Manage Children</button>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div class="activity-card">
            <h3>Total Child Membership</h3>
            <p class="big-number" id="totalMembership">Loading...</p>
            <div id="membershipByClass" style="margin-top: 1rem; font-size: 0.9rem;"></div>
          </div>
          <div class="activity-card" style="padding: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #111827;">Check-ins for Selected Sunday</h3>
            <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.9rem;">Select a date to view attendance details</p>
            <div style="margin-bottom: 1.5rem;">
              <input type="date" id="sundayDatePicker" value="${today}" 
                     style="width: 100%; padding: 0.625rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; background: white;">
            </div>
            
            <div id="checkInsLoadingState" style="display: flex; align-items: center; justify-content: center; padding: 2rem; color: #6b7280;">
              <div class="spinner" style="width: 24px; height: 24px; border-width: 2px; margin-right: 0.75rem;"></div>
              <span>Loading check-ins...</span>
            </div>
            
            <div id="checkInsContent" style="display: none;">
              <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
                <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem; font-weight: 500;">TOTAL CHECK-INS</div>
                <div style="font-size: 2.5rem; font-weight: 700; color: #3b82f6;" id="sundayCheckIns">0</div>
              </div>
              
              <div id="checkInsByClass"></div>
            </div>
          </div>
        </div>

        <div class="activity-card" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem;">Membership Distribution by Classroom</h3>
          <div style="position: relative; height: 400px; max-width: 600px; margin: 0 auto;">
            <canvas id="membershipPieChart"></canvas>
          </div>
        </div>
      </div>
    `;
    
    // Use setTimeout to ensure DOM is ready after innerHTML update
    setTimeout(() => {
      // Attach event listeners to quick action buttons
      const exportDataBtn = document.getElementById('exportDataBtn');
      const addChildBtn = document.getElementById('addChildBtn');
      const addParentBtn = document.getElementById('addParentBtn');
      const manageChildrenBtn = document.getElementById('manageChildrenBtn');
      
      if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => this.showExportModal());
      }
      if (addChildBtn) {
        addChildBtn.addEventListener('click', () => this.showChildRegistrationModal());
      }
      if (addParentBtn) {
        addParentBtn.addEventListener('click', () => this.showParentRegistrationModal());
      }
      if (manageChildrenBtn) {
        manageChildrenBtn.addEventListener('click', () => this.showManageChildrenModal());
      }

      // Date picker event listener
      const datePicker = document.getElementById('sundayDatePicker');
      if (datePicker) {
        datePicker.addEventListener('change', (e) => {
          this.loadCheckInsForDate(e.target.value);
        });
      }

      // Load initial data
      this.loadMembershipStats();
      this.loadCheckInsForDate(today);
    }, 0);
  },

  async loadMembershipStats() {
    const totalElement = document.getElementById('totalMembership');
    const byClassElement = document.getElementById('membershipByClass');
    
    if (!totalElement) return;

    try {
      const result = await Utils.apiRequest('/api/statistics/classes/membership');
      
      console.log('Membership API response:', result);
      
      if (result.success) {
        // The API returns { classes: [...], totalMembers: N } directly in result.data
        const totalMembers = result.data.totalMembers;
        const classes = result.data.classes;
        
        console.log('Total members:', totalMembers);
        console.log('Classes data:', classes);
        
        // Update total
        totalElement.textContent = totalMembers || 0;
        
        // Update breakdown by class
        if (byClassElement && classes && classes.length > 0) {
          const classesWithMembers = classes.filter(c => c.memberCount > 0);
          
          if (classesWithMembers.length > 0) {
            byClassElement.innerHTML = classesWithMembers
              .map(c => `
                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                  <span style="color: #6b7280;">${c.name}:</span>
                  <span style="font-weight: 600;">${c.memberCount}</span>
                </div>
              `).join('');
          } else {
            byClassElement.innerHTML = '<div style="color: #9ca3af; font-size: 0.85rem; text-align: center;">No children assigned to classrooms</div>';
          }
        } else {
          if (byClassElement) {
            byClassElement.innerHTML = '<div style="color: #9ca3af; font-size: 0.85rem; text-align: center;">No classrooms found</div>';
          }
        }

        // Create pie chart
        this.createMembershipPieChart(classes);
      } else {
        totalElement.textContent = 'Error';
        if (byClassElement) {
          byClassElement.innerHTML = `<div style="color: #ef4444; font-size: 0.85rem;">${result.error || 'Failed to load data'}</div>`;
        }
        console.error('Failed to load membership stats:', result);
      }
    } catch (error) {
      totalElement.textContent = 'Error';
      if (byClassElement) {
        byClassElement.innerHTML = `<div style="color: #ef4444; font-size: 0.85rem;">Network error</div>`;
      }
      console.error('Failed to load membership stats:', error);
    }
  },

  createMembershipPieChart(classes) {
    const canvas = document.getElementById('membershipPieChart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (this.membershipChart) {
      this.membershipChart.destroy();
    }

    // Filter out classes with no members
    const classesWithMembers = classes.filter(c => c.memberCount > 0);

    if (classesWithMembers.length === 0) {
      canvas.parentElement.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No membership data available</p>';
      return;
    }

    // Generate colors for each classroom
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
      '#6366f1', // indigo
      '#84cc16', // lime
    ];

    const data = {
      labels: classesWithMembers.map(c => c.name),
      datasets: [{
        label: 'Members',
        data: classesWithMembers.map(c => c.memberCount),
        backgroundColor: colors.slice(0, classesWithMembers.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    };

    const config = {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: {
                size: 13,
                family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return {
                      text: `${label} (${value})`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} children (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.membershipChart = new Chart(canvas, config);
  },

  async loadCheckInsForDate(date) {
    const totalElement = document.getElementById('sundayCheckIns');
    const byClassElement = document.getElementById('checkInsByClass');
    const loadingState = document.getElementById('checkInsLoadingState');
    const content = document.getElementById('checkInsContent');
    
    if (!totalElement) return;

    // Show loading state
    if (loadingState) loadingState.style.display = 'flex';
    if (content) content.style.display = 'none';

    try {
      const result = await Utils.apiRequest(`/api/statistics/checkins/by-date?date=${date}`);
      
      if (result.success) {
        const { totalCheckIns, byClass } = result.data;
        
        // Hide loading, show content
        if (loadingState) loadingState.style.display = 'none';
        if (content) content.style.display = 'block';
        
        // Update total with animation
        totalElement.textContent = totalCheckIns;
        
        // Format the selected date
        const selectedDate = new Date(date + 'T00:00:00');
        const formattedDate = selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Update breakdown by class with professional styling
        if (byClassElement && byClass && byClass.length > 0) {
          const hasCheckIns = byClass.some(c => c.checkInCount > 0);
          
          if (hasCheckIns) {
            byClassElement.innerHTML = `
              <div style="margin-bottom: 0.75rem;">
                <div style="font-size: 0.85rem; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Breakdown by Classroom</div>
                <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 0.25rem;">${formattedDate}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${byClass
                  .filter(c => c.checkInCount > 0)
                  .sort((a, b) => b.checkInCount - a.checkInCount)
                  .map((c, index) => {
                    const percentage = totalCheckIns > 0 ? ((c.checkInCount / totalCheckIns) * 100).toFixed(1) : 0;
                    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#6366f1', '#14b8a6', '#f97316'];
                    const color = colors[index % colors.length];
                    
                    return `
                      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.875rem; transition: all 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                          <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
                            <span style="font-weight: 600; color: #111827; font-size: 0.95rem;">${c.name}</span>
                          </div>
                          <span style="font-size: 1.25rem; font-weight: 700; color: ${color};">${c.checkInCount}</span>
                        </div>
                        <div style="background: #f3f4f6; border-radius: 4px; height: 6px; overflow: hidden;">
                          <div style="background: ${color}; height: 100%; width: ${percentage}%; transition: width 0.5s ease;"></div>
                        </div>
                        <div style="margin-top: 0.375rem; font-size: 0.8rem; color: #6b7280; text-align: right;">
                          ${percentage}% of total
                        </div>
                      </div>
                    `;
                  }).join('')}
              </div>
            `;
          } else {
            byClassElement.innerHTML = `
              <div style="text-align: center; padding: 2rem;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #d1d5db;">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p style="color: #6b7280; font-weight: 600; margin: 0 0 0.25rem 0;">No Check-ins</p>
                <p style="color: #9ca3af; font-size: 0.9rem; margin: 0;">No children were checked in on ${formattedDate}</p>
              </div>
            `;
          }
        }
      } else {
        // Show error state
        if (loadingState) loadingState.style.display = 'none';
        if (content) content.style.display = 'block';
        totalElement.textContent = 'Error';
        if (byClassElement) {
          byClassElement.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #ef4444;">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p style="color: #ef4444; font-weight: 600;">Error loading check-ins</p>
            </div>
          `;
        }
        console.error('Failed to load check-ins:', result.error);
      }
    } catch (error) {
      if (loadingState) loadingState.style.display = 'none';
      if (content) content.style.display = 'block';
      totalElement.textContent = 'Error';
      if (byClassElement) {
        byClassElement.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #ef4444;">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="color: #ef4444; font-weight: 600;">Error loading check-ins</p>
          </div>
        `;
      }
      console.error('Failed to load check-ins:', error);
    }
  },

  async loadClassroomSelection(content) {
    content.innerHTML = `
      <div class="classrooms-section">
        <div class="section-header">
          <div>
            <h2>Select a Classroom</h2>
            <p style="color: #64748b; margin-top: 0.5rem;">Choose a classroom to begin check-in</p>
          </div>
          <button class="btn-primary" id="createClassBtn" data-action="create-class" style="position: relative; z-index: 9999;" onclick="alert('BUTTON CLICKED! onclick fired'); console.log('[ONCLICK] Button clicked!'); if (window.DashboardNav) { window.DashboardNav.showCreateClassModal(); } else { alert('ERROR: DashboardNav not found on window'); } return false;">+ Create New Class</button>
        </div>
        <div id="classroomsList" class="classrooms-grid">
          <p style="text-align: center; color: #6b7280;">Loading classrooms...</p>
        </div>
      </div>
    `;

    // Remove existing event listener if it exists
    if (content._createClassHandler) {
      content.removeEventListener('click', content._createClassHandler, true);
    }

    // Create and store the event handler
    const self = this;
    content._createClassHandler = function(e) {
      console.log('[CLICK EVENT] Captured click on:', e.target);
      console.log('[CLICK EVENT] Target tagName:', e.target.tagName);
      console.log('[CLICK EVENT] Target id:', e.target.id);
      console.log('[CLICK EVENT] Target className:', e.target.className);
      
      // Check if clicked element or any parent is the button
      let target = e.target;
      while (target && target !== content) {
        console.log('[CHECKING] Current element:', target.tagName, 'id:', target.id, 'class:', target.className);
        if (target.id === 'createClassBtn' || target.getAttribute('data-action') === 'create-class') {
          console.log('[SUCCESS] Found button! Calling showCreateClassModal()');
          e.preventDefault();
          e.stopPropagation();
          self.showCreateClassModal();
          return;
        }
        target = target.parentElement;
      }
      console.log('[NO MATCH] Button not found in click path');
    };

    // Attach the event listener with capture phase
    content.addEventListener('click', content._createClassHandler, true);
    console.log('[SETUP] Event listener attached to content element');

    // ALSO add a direct click handler to the button after a short delay
    setTimeout(() => {
      const btn = document.getElementById('createClassBtn');
      if (btn) {
        console.log('[DIRECT SETUP] Found button, attaching direct click listener');
        btn.onclick = function(e) {
          console.log('[DIRECT ONCLICK] Direct button click handler fired!');
          alert('DIRECT CLICK HANDLER FIRED!');
          e.preventDefault();
          self.showCreateClassModal();
          return false;
        };
        
        // Also test if button is actually clickable
        console.log('[BUTTON CHECK] Button exists:', btn);
        console.log('[BUTTON CHECK] Button visible:', btn.offsetParent !== null);
        console.log('[BUTTON CHECK] Button disabled:', btn.disabled);
        console.log('[BUTTON CHECK] Pointer events:', window.getComputedStyle(btn).pointerEvents);
      } else {
        console.error('[DIRECT SETUP] Button with id createClassBtn NOT FOUND!');
      }
    }, 100);

    const container = document.getElementById('classroomsList');
    const result = await Utils.apiRequest('/api/classes');

    if (result.success) {
      const classes = result.data || [];
      
      if (classes.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <p style="color: #6b7280; margin-bottom: 1rem;">No classrooms available.</p>
            <button class="btn-primary" onclick="DashboardNav.showCreateClassModal()">Create Your First Classroom</button>
          </div>
        `;
        return;
      }

      container.innerHTML = classes.map(cls => `
        <div class="classroom-card" data-class-id="${cls.id}" data-class-name="${cls.name}" data-class-type="${cls.type}">
          <div class="classroom-icon">
            ${cls.logo_url ? 
              `<img src="${cls.logo_url}" alt="${cls.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div style="display: none; width: 100%; height: 100%; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; align-items: center; justify-content: center; color: #9ca3af; font-size: 0.875rem; text-align: center; padding: 0.5rem;">No Image</div>` 
              : 
              `<div style="width: 100%; height: 100%; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 0.875rem; text-align: center; padding: 0.5rem;">No Image</div>`
            }
          </div>
          <h3>${cls.name}</h3>
          <p class="classroom-type">${this.getClassTypeLabel(cls.type)}</p>
          ${cls.capacity ? `<p class="classroom-capacity">Capacity: ${cls.capacity}</p>` : ''}
          ${cls.room_location ? `<p class="classroom-location">📍 ${cls.room_location}</p>` : ''}
          <div class="classroom-actions">
            <button class="btn-primary classroom-select-btn">Select Room</button>
            <button class="btn-icon classroom-edit-btn" data-class-id="${cls.id}" title="Edit classroom">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="btn-icon btn-icon-danger classroom-delete-btn" data-class-id="${cls.id}" data-class-name="${cls.name}" title="Delete classroom">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H3.33333H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66699 7.33337V11.3334" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.33301 7.33337V11.3334" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      `).join('');

      // Attach click events
      container.querySelectorAll('.classroom-card').forEach(card => {
        const selectBtn = card.querySelector('.classroom-select-btn');
        selectBtn.addEventListener('click', () => {
          const classId = card.dataset.classId;
          const className = card.dataset.className;
          const classType = card.dataset.classType;
          this.showClassroomOptions(classId, className, classType);
        });

        const editBtn = card.querySelector('.classroom-edit-btn');
        editBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const classId = editBtn.dataset.classId;
          await this.showEditClassModal(classId);
        });

        const deleteBtn = card.querySelector('.classroom-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const classId = deleteBtn.dataset.classId;
          const className = deleteBtn.dataset.className;
          this.deleteClass(classId, className);
        });
      });
    } else {
      Utils.showError(container, 'Failed to load classrooms');
    }
  },

  getClassroomIcon(type) {
    const icons = {
      'regular': '👶',
      'ftv': '🌟',
      'special': '💙',
      'event': '🎉'
    };
    return icons[type] || '🏫';
  },

  getClassTypeLabel(type) {
    const labels = {
      'regular': 'Regular Class',
      'ftv': 'First Time Visitors',
      'special': 'Special Needs',
      'event': 'Special Event'
    };
    return labels[type] || type;
  },

  showClassroomOptions(classId, className, classType) {
    // Store selected classroom context
    this.selectedClassroom = { id: classId, name: className, type: classType };

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>🏫 ${className}</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="classroom-options">
          <h3 style="margin-bottom: 1.5rem; color: #64748b;">What would you like to do?</h3>
          
          <div class="option-card" id="regularCheckinOption">
            <div class="option-icon">🔍</div>
            <h4>Search & Check-in</h4>
            <p>Search for an existing child and check them into this classroom</p>
          </div>

          <div class="option-card" id="ftvCheckinOption">
            <div class="option-icon">🌟</div>
            <h4>New FTV Check-in</h4>
            <p>Register a first-time visitor and check them into this classroom</p>
          </div>

          ${classType === 'special' ? `
          <div class="option-card" id="specialNeedsOption">
            <div class="option-icon">💙</div>
            <h4>Special Needs Form</h4>
            <p>Fill out special needs information for a child</p>
          </div>
          ` : ''}

          <div class="option-card" id="viewClassBoardOption">
            <div class="option-icon">📋</div>
            <h4>View Class Board</h4>
            <p>See all children currently checked into this classroom</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close button
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Option handlers
    document.getElementById('regularCheckinOption').addEventListener('click', () => {
      modal.remove();
      this.loadCheckinViewForClassroom(classId, className);
    });

    document.getElementById('ftvCheckinOption').addEventListener('click', () => {
      modal.remove();
      this.showFTVRegistrationForm(classId, className);
    });

    const specialNeedsOption = document.getElementById('specialNeedsOption');
    if (specialNeedsOption) {
      specialNeedsOption.addEventListener('click', () => {
        modal.remove();
        this.showSpecialNeedsForm();
      });
    }

    document.getElementById('viewClassBoardOption').addEventListener('click', () => {
      modal.remove();
      this.viewClassBoard(classId, className);
    });
  },

  loadCheckinViewForClassroom(classId, className) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
      <div class="checkin-section">
        <div class="section-header">
          <h2>🏫 ${className} - Check-in</h2>
          <button class="btn-secondary" id="backToClassrooms">← Back to Classrooms</button>
        </div>
        <form id="checkinForm" class="form">
          <div class="form-group">
            <label>Search for Child</label>
            <input type="text" id="childSearch" placeholder="Type child's name...">
            <div id="childResults" class="search-results"></div>
          </div>
          <div id="selectedChild" class="selected-child" style="display:none;">
            <h3>Selected Child</h3>
            <div id="childInfo"></div>
            
            <input type="hidden" id="selectedClassId" value="${classId}">
            
            <button type="submit" class="btn-primary" style="margin-top: 1rem;">Check In to ${className}</button>
          </div>
        </form>
      </div>
    `;

    // Back button
    setTimeout(() => {
      document.getElementById('backToClassrooms').addEventListener('click', () => {
        this.switchView('classrooms');
      });
    }, 0);

    this.setupChildSearchForClassroom(classId);
  },

  setupChildSearchForClassroom(classId) {
    const searchInput = document.getElementById('childSearch');
    const resultsDiv = document.getElementById('childResults');
    let selectedChild = null;

    const debouncedSearch = Utils.debounce(async (query) => {
      if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
      }

      Utils.showLoading(resultsDiv, 'Searching...');

      const result = await Utils.apiRequest(`/api/children/search?query=${encodeURIComponent(query)}&limit=10`);

      if (result.success) {
        const children = result.data.data || [];

        if (children.length === 0) {
          Utils.showEmpty(resultsDiv, 'No children found');
          return;
        }

        resultsDiv.innerHTML = children.map(child => `
          <div class="result-item" data-child='${JSON.stringify(child)}'>
            <strong>${child.first_name} ${child.last_name}</strong>
            <span>${child.date_of_birth}</span>
          </div>
        `).join('');

        resultsDiv.querySelectorAll('.result-item').forEach(item => {
          item.addEventListener('click', () => {
            selectedChild = JSON.parse(item.dataset.child);
            this.displaySelectedChild(selectedChild);
            resultsDiv.innerHTML = '';
            searchInput.value = '';
          });
        });
      } else {
        Utils.showError(resultsDiv, 'Search failed');
      }
    }, 300);

    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      debouncedSearch(query);
    });

    const form = document.getElementById('checkinForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (selectedChild) {
        await this.performCheckInToClassroom(selectedChild, classId);
      }
    });
  },

  async performCheckInToClassroom(child, classId) {
    // Get parents for this specific child
    const parentResult = await Utils.apiRequest(`/api/children/${child.id}/parents`);
    let parentId = null;
    
    if (parentResult.success && parentResult.data && parentResult.data.length > 0) {
      const primaryParent = parentResult.data.find(p => p.is_primary_contact) || parentResult.data[0];
      parentId = primaryParent.parent_id;
    } else {
      Utils.showToast('This child has no linked parent. Please add a parent first.', 'error');
      if (confirm('Would you like to register a parent for this child now?')) {
        this.showParentRegistrationModal(child);
      }
      return;
    }

    const user = window.currentUser;
    
    const result = await Utils.apiRequest('/api/checkins', {
      method: 'POST',
      body: JSON.stringify({
        child_id: child.id,
        parent_id: parentId,
        checked_in_by: user?.id,
        class_attended: classId,
      })
    });

    if (result.success) {
      this.showSecurityCodeModal(result.data, child);
      setTimeout(() => {
        this.switchView('classrooms');
      }, 3000);
    } else {
      Utils.showToast(`Check-in failed: ${result.error}`, 'error');
    }
  },

  showFTVRegistrationForm(classId, className) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2>🌟 New First-Time Visitor - ${className}</h2>
          <button class="close-btn">&times;</button>
        </div>
        <form id="ftvRegForm" class="form">
          <h3 style="margin-bottom: 1rem; color: #2563eb;">Child Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>First Name <span class="required">*</span></label>
              <input type="text" id="ftvChildFirstName" required>
            </div>
            <div class="form-group">
              <label>Last Name <span class="required">*</span></label>
              <input type="text" id="ftvChildLastName" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Date of Birth <span class="required">*</span></label>
              <input type="date" id="ftvChildDOB" required>
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select id="ftvChildGender">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Allergies</label>
            <textarea id="ftvChildAllergies" rows="2" placeholder="List any allergies..."></textarea>
          </div>

          <h3 style="margin: 1.5rem 0 1rem 0; color: #2563eb;">Parent/Guardian Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>First Name <span class="required">*</span></label>
              <input type="text" id="ftvParentFirstName" required>
            </div>
            <div class="form-group">
              <label>Last Name <span class="required">*</span></label>
              <input type="text" id="ftvParentLastName" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Phone Number <span class="required">*</span></label>
              <input type="tel" id="ftvParentPhone" required placeholder="(555) 123-4567">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="ftvParentEmail" placeholder="parent@example.com">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary cancel-ftv-btn">Cancel</button>
            <button type="submit" class="btn-primary">Register & Check-in</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-ftv-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById('ftvRegForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.processFTVRegistration(classId, modal);
    });
  },

  async processFTVRegistration(classId, modal) {
    const submitBtn = modal.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // 1. Create parent
    const parentData = {
      first_name: document.getElementById('ftvParentFirstName').value.trim(),
      last_name: document.getElementById('ftvParentLastName').value.trim(),
      phone_number: document.getElementById('ftvParentPhone').value.trim(),
      email: document.getElementById('ftvParentEmail').value.trim() || null,
    };

    const parentResult = await Utils.apiRequest('/api/parents', {
      method: 'POST',
      body: JSON.stringify(parentData)
    });

    if (!parentResult.success) {
      Utils.showToast(`Failed to register parent: ${parentResult.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register & Check-in';
      return;
    }

    const parentId = parentResult.data.data.id;

    // 2. Create child
    const childData = {
      first_name: document.getElementById('ftvChildFirstName').value.trim(),
      last_name: document.getElementById('ftvChildLastName').value.trim(),
      date_of_birth: document.getElementById('ftvChildDOB').value,
      gender: document.getElementById('ftvChildGender').value || null,
      allergies: document.getElementById('ftvChildAllergies').value.trim() || null,
    };

    const childResult = await Utils.apiRequest('/api/children', {
      method: 'POST',
      body: JSON.stringify(childData)
    });

    if (!childResult.success) {
      Utils.showToast(`Failed to register child: ${childResult.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register & Check-in';
      return;
    }

    const childId = childResult.data.data.id;

    // 3. Link parent and child
    const linkResult = await Utils.apiRequest('/api/parents/link-child', {
      method: 'POST',
      body: JSON.stringify({
        parent_id: parentId,
        child_id: childId,
        relationship_type: 'parent',
        is_primary_contact: true
      })
    });

    if (!linkResult.success) {
      Utils.showToast(`Warning: Failed to link parent and child: ${linkResult.error}`, 'warning');
    }

    // 4. Check-in the child
    const user = window.currentUser;
    const checkinResult = await Utils.apiRequest('/api/checkins', {
      method: 'POST',
      body: JSON.stringify({
        child_id: childId,
        parent_id: parentId,
        checked_in_by: user?.id,
        class_attended: classId,
      })
    });

    if (checkinResult.success) {
      modal.remove();
      this.showSecurityCodeModal(checkinResult.data, childResult.data.data);
      Utils.showToast('First-time visitor registered and checked in successfully!', 'success');
      setTimeout(() => {
        this.switchView('classrooms');
      }, 3000);
    } else {
      Utils.showToast(`Check-in failed: ${checkinResult.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register & Check-in';
    }
  },

  showSpecialNeedsForm() {
    Utils.showToast('Special needs form coming soon!', 'info');
  },

  loadCheckinView(content) {
    content.innerHTML = `
      <div class="checkin-section">
        <div class="section-header" style="margin-bottom: 1.5rem;">
          <div>
            <h2 style="margin: 0 0 0.25rem 0;">Check-In System</h2>
            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Select a class to begin check-in</p>
          </div>
        </div>

        <div id="classSelectionView">
          <div class="form-group">
            <label>Select Class for Today's Service <span class="required">*</span></label>
            <select id="classSelect" style="font-size: 1.1rem; padding: 1rem;">
              <option value="">Choose a class...</option>
            </select>
          </div>
        </div>

        <div id="classCheckinView" style="display: none;">
          <div class="checkin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: #f0fdfa; border: 2px solid #14b8a6; border-radius: 8px;">
            <div>
              <h3 id="selectedClassName" style="margin: 0; color: #0f766e; font-size: 1.2rem;"></h3>
              <p id="classChildrenCount" style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.9rem;"></p>
            </div>
            <button class="btn-secondary" id="changeClassBtn">Change Class</button>
          </div>

          <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="form-group" style="flex: 1; margin: 0;">
              <input type="text" id="childSearch" placeholder="Search children in this class..." style="width: 100%; font-size: 1rem;">
            </div>
            <button class="btn-primary" id="addFTVBtn" style="white-space: nowrap;">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem;">
                <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add FTV
            </button>
          </div>

          <div id="classChildrenList" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="padding: 2rem; text-align: center; color: #6b7280;">
              Loading children...
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.loadClassesForCheckIn();
    
    // Setup event listeners
    setTimeout(() => {
      const classSelect = document.getElementById('classSelect');
      const changeClassBtn = document.getElementById('changeClassBtn');
      const addFTVBtn = document.getElementById('addFTVBtn');
      const childSearch = document.getElementById('childSearch');

      if (classSelect) {
        classSelect.addEventListener('change', (e) => {
          if (e.target.value) {
            this.showClassCheckinView(e.target.value);
          }
        });
      }

      if (changeClassBtn) {
        changeClassBtn.addEventListener('click', () => {
          document.getElementById('classSelectionView').style.display = 'block';
          document.getElementById('classCheckinView').style.display = 'none';
          classSelect.value = '';
        });
      }

      if (addFTVBtn) {
        addFTVBtn.addEventListener('click', () => {
          const classId = classSelect.value;
          this.showFTVCheckInModalForClass(classId);
        });
      }

      if (childSearch) {
        childSearch.addEventListener('input', (e) => {
          this.filterClassChildren(e.target.value);
        });
      }
    }, 0);
  },

  async showClassCheckinView(classId) {
    const classSelect = document.getElementById('classSelect');
    const selectedOption = classSelect.options[classSelect.selectedIndex];
    const className = selectedOption.text;

    document.getElementById('classSelectionView').style.display = 'none';
    document.getElementById('classCheckinView').style.display = 'block';
    
    document.getElementById('selectedClassName').textContent = className;
    
    await this.loadChildrenForClassCheckin(classId);
  },

  async loadChildrenForClassCheckin(classId) {
    const container = document.getElementById('classChildrenList');
    this.currentCheckinClassId = classId;
    
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #6b7280;">Loading children...</div>';

    try {
      // Get all children assigned to this class
      const result = await Utils.apiRequest(`/api/classes/${classId}/children`);
      
      if (!result.success) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #ef4444;">Failed to load children</div>';
        return;
      }

      const children = result.data || [];
      this.currentClassChildren = children;

      document.getElementById('classChildrenCount').textContent = `${children.length} ${children.length === 1 ? 'child' : 'children'} assigned to this class`;

      if (children.length === 0) {
        container.innerHTML = `
          <div style="padding: 3rem; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #9ca3af;">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="color: #6b7280; font-weight: 600;">No children assigned to this class</p>
            <p style="color: #9ca3af; font-size: 0.9rem;">Children need to be assigned to classes in the Manage Children tab</p>
          </div>
        `;
        return;
      }

      // Get today's check-ins
      const today = new Date().toISOString().split('T')[0];
      const checkinsResult = await Utils.apiRequest(`/api/checkins?date=${today}&classId=${classId}`);
      const checkIns = checkinsResult.success ? checkinsResult.data : [];
      
      // Create lookup map for checked-in children
      const checkedInMap = {};
      checkIns.forEach(ci => {
        checkedInMap[ci.child_id] = ci;
      });

      this.renderClassChildrenList(children, checkedInMap);
    } catch (error) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #ef4444;">Error loading children</div>';
    }
  },

  renderClassChildrenList(children, checkedInMap) {
    const container = document.getElementById('classChildrenList');
    
    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.9rem;">Child Name</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.9rem;">Age</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.9rem;">Allergies</th>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151; font-size: 0.9rem;">Status</th>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #374151; font-size: 0.9rem;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${children.map(child => {
            const age = child.date_of_birth ? this.calculateAge(child.date_of_birth) : 'N/A';
            const isCheckedIn = checkedInMap[child.id];
            const statusColor = isCheckedIn ? '#10b981' : '#6b7280';
            const statusText = isCheckedIn ? 'Checked In' : 'Not Checked In';
            
            return `
              <tr class="child-row" data-child-id="${child.id}" data-child-name="${child.first_name} ${child.last_name}" style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 1rem;">
                  <div style="font-weight: 600; color: #111827;">${child.first_name} ${child.last_name}</div>
                  ${child.special_needs ? '<div style="font-size: 0.75rem; color: #8b5cf6; margin-top: 0.25rem;">⭐ Special Needs</div>' : ''}
                </td>
                <td style="padding: 1rem; color: #6b7280;">${age} years</td>
                <td style="padding: 1rem;">
                  ${child.allergies 
                    ? `<span style="color: #dc2626; font-weight: 500;">⚠️ ${child.allergies}</span>`
                    : `<span style="color: #9ca3af;">None</span>`
                  }
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white; background: ${statusColor};">
                    ${statusText}
                  </span>
                </td>
                <td style="padding: 1rem; text-align: center;">
                  ${!isCheckedIn 
                    ? `<button class="btn-primary checkin-btn" data-child-id="${child.id}" data-child-name="${child.first_name} ${child.last_name}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Check In</button>`
                    : `<button class="btn-secondary" disabled style="padding: 0.5rem 1rem; font-size: 0.9rem; opacity: 0.6; cursor: not-allowed;">Checked In</button>`
                  }
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Attach click handlers to check-in buttons
    setTimeout(() => {
      document.querySelectorAll('.checkin-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const childId = e.target.dataset.childId;
          const childName = e.target.dataset.childName;
          await this.performCheckIn(childId, childName);
        });
      });
    }, 0);
  },

  async performCheckIn(childId, childName) {
    const classId = this.currentCheckinClassId;
    
    const confirmed = confirm(`Check in ${childName}?`);
    if (!confirmed) return;

    try {
      Utils.showToast('Checking in...', 'info');

      const result = await Utils.apiRequest('/api/checkins', {
        method: 'POST',
        body: { childId, classId }
      });

      if (result.success) {
        Utils.showToast(`${childName} checked in successfully!`, 'success');
        // Reload the children list
        await this.loadChildrenForClassCheckin(classId);
      } else {
        Utils.showToast(result.error || 'Check-in failed', 'error');
      }
    } catch (error) {
      Utils.showToast('Check-in failed', 'error');
    }
  },

  filterClassChildren(query) {
    const rows = document.querySelectorAll('.child-row');
    const lowerQuery = query.toLowerCase();

    rows.forEach(row => {
      const childName = row.dataset.childName.toLowerCase();
      if (childName.includes(lowerQuery)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  },

  async showFTVCheckInModalForClass(classId) {
    // Similar to showFTVCheckInModal but pre-selects the class
    const classesResult = await Utils.apiRequest('/api/classes');
    const ftvClasses = classesResult.success 
      ? classesResult.data.filter(cls => cls.type === 'ftv')
      : [];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Check-In First Time Visitor</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        
        <form id="ftvCheckInFormClass" class="form">
          <div class="form-group">
            <label>Child's First Name <span class="required">*</span></label>
            <input type="text" id="ftvFirstNameClass" required>
          </div>

          <div class="form-group">
            <label>Child's Last Name <span class="required">*</span></label>
            <input type="text" id="ftvLastNameClass" required>
          </div>

          <div class="form-group">
            <label>Date of Birth <span class="required">*</span></label>
            <input type="date" id="ftvDOBClass" required>
          </div>

          <div class="form-group">
            <label>Gender</label>
            <select id="ftvGenderClass">
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div class="form-group">
            <label>Parent/Guardian Name <span class="required">*</span></label>
            <input type="text" id="ftvParentNameClass" required>
          </div>

          <div class="form-group">
            <label>Parent Phone Number <span class="required">*</span></label>
            <input type="tel" id="ftvParentPhoneClass" required>
          </div>

          <div class="form-group">
            <label>Parent Email</label>
            <input type="email" id="ftvParentEmailClass">
          </div>

          <div class="form-group">
            <label>Allergies/Medical Notes</label>
            <textarea id="ftvAllergiesClass" rows="3" placeholder="Any allergies or medical conditions we should know about..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">Check-In FTV</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('ftvCheckInFormClass').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitFTVCheckInForClass(classId);
    });
  },

  async submitFTVCheckInForClass(classId) {
    const firstName = document.getElementById('ftvFirstNameClass').value;
    const lastName = document.getElementById('ftvLastNameClass').value;
    const dob = document.getElementById('ftvDOBClass').value;
    const gender = document.getElementById('ftvGenderClass').value;
    const parentName = document.getElementById('ftvParentNameClass').value;
    const parentPhone = document.getElementById('ftvParentPhoneClass').value;
    const parentEmail = document.getElementById('ftvParentEmailClass').value;
    const allergies = document.getElementById('ftvAllergiesClass').value;

    Utils.showToast('Processing FTV check-in...', 'info');

    try {
      // 1. Create parent
      const [parentFirstName, ...parentLastNameParts] = parentName.split(' ');
      const parentLastName = parentLastNameParts.join(' ') || parentFirstName;

      const parentResult = await Utils.apiRequest('/api/parents', {
        method: 'POST',
        body: {
          first_name: parentFirstName,
          last_name: parentLastName,
          phone_number: parentPhone,
          email: parentEmail || null
        }
      });

      if (!parentResult.success) {
        throw new Error(parentResult.error || 'Failed to create parent');
      }

      const parentId = parentResult.data.id;

      // 2. Create child
      const childResult = await Utils.apiRequest('/api/children', {
        method: 'POST',
        body: {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: gender || null,
          allergies: allergies || null,
          is_ftv: true
        }
      });

      if (!childResult.success) {
        throw new Error(childResult.error || 'Failed to register child');
      }

      const childId = childResult.data.id;

      // 3. Link parent to child
      await Utils.apiRequest('/api/children/link-parent', {
        method: 'POST',
        body: {
          childId,
          parentId,
          relationshipType: 'parent',
          authorizedPickup: true
        }
      });

      // 4. Assign to class
      await Utils.apiRequest('/api/classes/assign', {
        method: 'POST',
        body: {
          classId,
          childId
        }
      });

      // 5. Check-in the child
      const checkInResult = await Utils.apiRequest('/api/checkins', {
        method: 'POST',
        body: {
          childId,
          classId
        }
      });

      if (!checkInResult.success) {
        throw new Error(checkInResult.error || 'Failed to check-in');
      }

      Utils.showToast('FTV checked in successfully!', 'success');
      document.querySelector('.modal-overlay').remove();
      // Reload the children list
      await this.loadChildrenForClassCheckin(classId);
    } catch (error) {
      Utils.showToast(error.message || 'Failed to process FTV check-in', 'error');
    }
  },

  setupChildSearch() {
    const searchInput = document.getElementById('childSearch');
    const resultsDiv = document.getElementById('childResults');
    let selectedChild = null;

    const debouncedSearch = Utils.debounce(async (query) => {
      if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
      }

      Utils.showLoading(resultsDiv, 'Searching...');

      // Use optimized search endpoint
      const result = await Utils.apiRequest(`/api/children/search?query=${encodeURIComponent(query)}&limit=10`);

      if (result.success) {
        const children = result.data.data || [];

        if (children.length === 0) {
          Utils.showEmpty(resultsDiv, 'No children found');
          return;
        }

        resultsDiv.innerHTML = children.map(child => `
          <div class="result-item" data-child='${JSON.stringify(child)}'>
            <strong>${child.first_name} ${child.last_name}</strong>
            <span>${child.date_of_birth}</span>
          </div>
        `).join('');

        // Bind click events
        resultsDiv.querySelectorAll('.result-item').forEach(item => {
          item.addEventListener('click', () => {
            selectedChild = JSON.parse(item.dataset.child);
            this.displaySelectedChild(selectedChild);
            resultsDiv.innerHTML = '';
            searchInput.value = '';
          });
        });
      } else {
        Utils.showError(resultsDiv, 'Search failed');
      }
    }, 300);

    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      debouncedSearch(query);
    });

    const form = document.getElementById('checkinForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (selectedChild) {
        await this.performCheckIn(selectedChild);
      }
    });
  },

  displaySelectedChild(child) {
    const selectedDiv = document.getElementById('selectedChild');
    const childInfo = document.getElementById('childInfo');
    
    if (selectedDiv && childInfo) {
      childInfo.innerHTML = `
        <p><strong>Name:</strong> ${child.first_name} ${child.last_name}</p>
        <p><strong>DOB:</strong> ${child.date_of_birth}</p>
        ${child.allergies ? `<p class="warning"><strong>Allergies:</strong> ${child.allergies}</p>` : ''}
        ${child.medical_notes ? `<p class="warning"><strong>Medical Notes:</strong> ${child.medical_notes}</p>` : ''}
      `;
      selectedDiv.style.display = 'block';
    }
  },

  async loadClassesForCheckIn() {
    const classSelect = document.getElementById('classSelect');
    if (!classSelect) return;

    const result = await Utils.apiRequest('/api/statistics/classes/capacity');

    if (!result.success) {
      classSelect.innerHTML = '<option value="">Failed to load classes</option>';
      return;
    }

    const classes = result.data.classes || [];

    if (classes.length === 0) {
      classSelect.innerHTML = '<option value="">No classes available</option>';
      return;
    }

    // Store classes data for capacity display
    this.classesData = classes;

    classSelect.innerHTML = '<option value="">Select a class...</option>' +
      classes.map(cls => {
        const isFull = cls.capacity && cls.current >= cls.capacity;
        const statusText = cls.capacity 
          ? ` (${cls.current}/${cls.capacity}${isFull ? ' - FULL' : ''})` 
          : ` (${cls.current} checked in)`;
        
        return `<option value="${cls.id}" ${isFull ? 'disabled' : ''}>
          ${cls.name}${statusText}
        </option>`;
      }).join('');

    // Update capacity info when selection changes
    classSelect.addEventListener('change', (e) => {
      this.updateClassCapacityInfo(e.target.value);
    });
  },

  updateClassCapacityInfo(classId) {
    const infoDiv = document.getElementById('classCapacityInfo');
    if (!infoDiv || !this.classesData) return;

    if (!classId) {
      infoDiv.innerHTML = '';
      return;
    }

    const selectedClass = this.classesData.find(c => c.id === classId);
    if (!selectedClass) return;

    const percentFull = selectedClass.percentFull || 0;
    const color = percentFull >= 90 ? '#ef4444' : percentFull >= 70 ? '#f59e0b' : '#10b981';

    infoDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: ${color}; font-weight: 600;">
          ${selectedClass.current} of ${selectedClass.capacity || '∞'} spots filled
        </span>
        ${selectedClass.capacity ? `
          <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; background: ${color}; width: ${Math.min(percentFull, 100)}%;"></div>
          </div>
        ` : ''}
      </div>
    `;
  },

  loadCheckoutView(content) {
    content.innerHTML = `
      <div class="checkout-section">
        <h2>Child Check-out</h2>
        <form id="checkoutForm" class="form">
          <div class="form-group">
            <label>Enter Security Code <span class="required">*</span></label>
            <input 
              type="text" 
              id="securityCode" 
              placeholder="Enter 6-digit code" 
              maxlength="6"
              pattern="[0-9]{6}"
              required
              style="font-size: 2rem; text-align: center; letter-spacing: 0.5em; font-weight: 600;"
            >
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
              Enter the 6-digit security code provided at check-in
            </p>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%;">Check Out Child</button>
        </form>
        <div id="checkoutResult" style="margin-top: 2rem;"></div>
      </div>
    `;
    
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.performCheckout();
    });
  },

  async performCheckout() {
    const securityCode = document.getElementById('securityCode').value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const resultDiv = document.getElementById('checkoutResult');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking out...';

    // Find the check-in by security code
    const today = new Date().toISOString().split('T')[0];
    const checkInsResult = await Utils.apiRequest(`/api/checkins?date=${today}`);

    if (!checkInsResult.success) {
      Utils.showToast('Failed to verify security code', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Check Out Child';
      return;
    }

    const checkIn = checkInsResult.data.find(ci => 
      ci.security_code === securityCode && !ci.check_out_time
    );

    if (!checkIn) {
      resultDiv.innerHTML = `
        <div class="error-message" style="padding: 1rem; background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; color: #991b1b;">
          <strong>Invalid Security Code</strong>
          <p>No active check-in found with this security code. Please verify the code and try again.</p>
        </div>
      `;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Check Out Child';
      return;
    }

    // Perform checkout
    const user = window.currentUser;
    const checkoutResult = await Utils.apiRequest(`/api/checkins/${checkIn.id}/checkout`, {
      method: 'POST',
      body: JSON.stringify({
        security_code: securityCode,
        checked_out_by: user.id
      })
    });

    if (checkoutResult.success) {
      resultDiv.innerHTML = `
        <div class="success-message" style="padding: 1.5rem; background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; color: #065f46; text-align: center;">
          <h3 style="margin: 0 0 0.5rem 0;">✓ Check-out Successful!</h3>
          <p style="margin: 0; font-size: 1.1rem;">
            <strong>${checkIn.children?.first_name} ${checkIn.children?.last_name}</strong> has been checked out.
          </p>
        </div>
      `;
      document.getElementById('securityCode').value = '';
      Utils.showToast('Check-out successful!', 'success');
      
      // Refresh overview after 2 seconds
      setTimeout(() => this.switchView('overview'), 2000);
    } else {
      Utils.showToast(`Check-out failed: ${checkoutResult.error}`, 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Check Out Child';
  },

  async performCheckIn(child) {
    const classSelect = document.getElementById('classSelect');
    const classId = classSelect ? classSelect.value : null;

    if (!classId) {
      Utils.showToast('Please select a class', 'error');
      return;
    }

    // Get parents for this specific child
    const parentResult = await Utils.apiRequest(`/api/children/${child.id}/parents`);
    let parentId = null;
    
    if (parentResult.success && parentResult.data && parentResult.data.length > 0) {
      // Use the first parent (or primary contact if available)
      const primaryParent = parentResult.data.find(p => p.is_primary_contact) || parentResult.data[0];
      parentId = primaryParent.parent_id;
    } else {
      // No parent found - show error and prompt to add parent
      Utils.showToast('This child has no linked parent. Please add a parent first.', 'error');
      
      // Optionally show parent registration modal
      if (confirm('Would you like to register a parent for this child now?')) {
        this.showParentRegistrationModal(child);
      }
      return;
    }

    const user = window.currentUser;
    
    const result = await Utils.apiRequest('/api/checkins', {
      method: 'POST',
      body: JSON.stringify({
        child_id: child.id,
        parent_id: parentId,
        checked_in_by: user?.id,
        class_attended: classId,
      })
    });

    if (result.success) {
      this.showSecurityCodeModal(result.data, child);
      // Refresh the check-in view
      setTimeout(() => {
        this.switchView('overview');
      }, 3000);
    } else {
      Utils.showToast(`Check-in failed: ${result.error}`, 'error');
    }
  },

  showSecurityCodeModal(checkInData, child) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.innerHTML = `
      <div class="modal-content security-tag-print" style="max-width: 500px; text-align: center;">
        <div class="modal-header" style="border: none; padding-bottom: 0;">
          <h2 id="modal-title" style="width: 100%;">Check-in Successful! ✓</h2>
        </div>
        <div style="padding: 2rem 0;">
          <p class="child-name" style="font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-primary); font-weight: 600;">
            ${child.first_name} ${child.last_name}
          </p>
          <div style="background: #f1f5f9; padding: 2rem; border-radius: 12px; margin: 1.5rem 0; border: 2px dashed var(--border-color);">
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
              Security Code
            </p>
            <p class="security-code-display" style="font-size: 3rem; font-weight: 700; color: var(--primary-color); letter-spacing: 0.1em; margin: 0;" aria-label="Security code ${checkInData.security_code}">
              ${checkInData.security_code}
            </p>
          </div>
          <p class="instructions" style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Please keep this code to check out your child.
          </p>
          <button onclick="this.closest('.modal-overlay').remove()" class="btn-primary" style="width: 100%;" aria-label="Close and return to dashboard">
            Done
          </button>
          <button onclick="window.print()" class="btn-secondary" style="width: 100%; margin-top: 0.75rem;" aria-label="Print security tag">
            Print Security Tag
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Trap focus in modal
    const cleanup = Utils.trapFocus(modal);

    // Clean up when modal is closed
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
        modal.remove();
      }
    });

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  },

  async loadClassesView(content) {
    content.innerHTML = `
      <div class="section-header">
        <h2>Classes</h2>
        <button class="btn-secondary" id="createClassBtnClassesView">+ Create Class</button>
      </div>
      <div id="classList"></div>
    `;
    
    // Attach event listener for create class button
    setTimeout(() => {
      const createBtn = document.getElementById('createClassBtnClassesView');
      if (createBtn) {
        createBtn.addEventListener('click', () => this.showClassModal());
      }
    }, 0);
    
    const container = document.getElementById('classList');
    Utils.showLoading(container, 'Loading classes...');

    const result = await Utils.apiRequest('/api/classes');

    if (result.success) {
      const classes = result.data;
      
      if (classes.length === 0) {
        Utils.showEmpty(container, 'No classes available');
        return;
      }

      container.innerHTML = classes.map(cls => `
        <div class="class-card" style="cursor: pointer; position: relative;" data-class-id="${cls.id}">
          <button class="btn-danger delete-class-btn" style="position: absolute; top: 10px; right: 10px; padding: 5px 10px; font-size: 0.875rem;" 
                  data-class-id="${cls.id}" data-class-name="${cls.name}">
            Delete
          </button>
          <div class="class-card-content">
            <h3>${cls.name}</h3>
            <p>${cls.description || ''}</p>
            <p><strong>Type:</strong> ${cls.type}</p>
            <p><strong>Capacity:</strong> ${cls.capacity || 'Unlimited'}</p>
            <p><strong>Location:</strong> ${cls.room_location || 'TBD'}</p>
            <p style="margin-top: 10px; font-size: 0.875rem; color: #6b7280;">
              Click to view children in this class
            </p>
          </div>
        </div>
      `).join('');

      // Attach event listeners after HTML is rendered
      container.querySelectorAll('.delete-class-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const classId = btn.dataset.classId;
          const className = btn.dataset.className;
          this.deleteClass(classId, className);
        });
      });

      container.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // Don't trigger if clicking the delete button
          if (e.target.closest('.delete-class-btn')) return;
          
          const classId = card.dataset.classId;
          const className = card.querySelector('h3').textContent;
          this.viewClassBoard(classId, className);
        });
      });
    } else {
      Utils.showError(container, 'Failed to load classes', 'DashboardNav.loadClassesView(content)');
    }
  },

  showClassModal(classData = null) {
    const isEdit = !!classData;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>${isEdit ? 'Edit Class' : 'Create New Class'}</h2>
          <button class="close-btn">&times;</button>
        </div>
        <form id="classForm" class="form">
          <div class="form-group">
            <label>Class Name <span class="required">*</span></label>
            <input type="text" id="className" required value="${classData?.name || ''}">
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea id="classDescription" rows="2">${classData?.description || ''}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Type <span class="required">*</span></label>
              <select id="classType" required>
                <option value="">Select type...</option>
                <option value="regular" ${classData?.type === 'regular' ? 'selected' : ''}>Regular</option>
                <option value="special" ${classData?.type === 'special' ? 'selected' : ''}>Special</option>
                <option value="ftv" ${classData?.type === 'ftv' ? 'selected' : ''}>FTV</option>
                <option value="event" ${classData?.type === 'event' ? 'selected' : ''}>Event</option>
              </select>
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input type="number" id="classCapacity" min="1" value="${classData?.capacity || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Age Min</label>
              <input type="number" id="classAgeMin" min="0" max="18" value="${classData?.age_min || ''}">
            </div>
            <div class="form-group">
              <label>Age Max</label>
              <input type="number" id="classAgeMax" min="0" max="18" value="${classData?.age_max || ''}">
            </div>
          </div>

          <div class="form-group">
            <label>Room Location</label>
            <input type="text" id="classLocation" value="${classData?.room_location || ''}">
          </div>

          <div class="form-group">
            <label>Schedule</label>
            <textarea id="classSchedule" rows="2" placeholder="e.g., Sundays 9:00 AM - 10:30 AM">${classData?.schedule || ''}</textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary cancel-btn">Cancel</button>
            <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'} Class</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Attach close button event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Form submission
    document.getElementById('classForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveClass(classId, modal);
    });
  },

  async saveClass(classId = null, modal = null) {
    const form = document.getElementById('classForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = classId ? 'Updating...' : 'Creating...';

    const classData = {
      name: document.getElementById('className').value.trim(),
      description: document.getElementById('classDescription').value.trim() || null,
      type: document.getElementById('classType').value,
      capacity: parseInt(document.getElementById('classCapacity').value) || null,
      age_min: parseInt(document.getElementById('classAgeMin').value) || null,
      age_max: parseInt(document.getElementById('classAgeMax').value) || null,
      room_location: document.getElementById('classLocation').value.trim() || null,
      schedule: document.getElementById('classSchedule').value.trim() || null
    };

    const url = classId ? `/api/classes/${classId}` : '/api/classes';
    const method = classId ? 'PUT' : 'POST';

    const result = await Utils.apiRequest(url, {
      method,
      body: JSON.stringify(classData)
    });

    if (result.success) {
      Utils.showToast(`Class ${classId ? 'updated' : 'created'} successfully!`, 'success');
      if (modal) {
        modal.remove();
      } else {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();
      }
      this.loadClassesView(document.getElementById('dashboardContent'));
    } else {
      Utils.showToast(`Operation failed: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = classId ? 'Update Class' : 'Create Class';
    }
  },

  loadFTVBoard(content) {
    content.innerHTML = `
      <div class="ftv-board">
        <div class="section-header" style="margin-bottom: 1.5rem;">
          <div>
            <h2 style="margin: 0 0 0.25rem 0;">First Time Visitors (FTV) Board</h2>
            <p class="subtitle" style="margin: 0; color: #6b7280; font-size: 0.9rem;">Children visiting for the first time today</p>
          </div>
          <button class="btn-primary" id="addFTVBtn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem;">
              <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Add FTV
          </button>
        </div>
        <div id="ftvList"></div>
      </div>
    `;
    
    // Add event listener for the Add FTV button
    setTimeout(() => {
      const addFTVBtn = document.getElementById('addFTVBtn');
      if (addFTVBtn) {
        addFTVBtn.addEventListener('click', () => this.showFTVCheckInModal());
      }
    }, 0);
    
    this.loadFTVChildren();
  },

  async loadFTVChildren() {
    const container = document.getElementById('ftvList');
    Utils.showLoading(container, 'Loading first-time visitors...');

    const today = new Date().toISOString().split('T')[0];
    const result = await Utils.apiRequest(`/api/checkins?date=${today}`);

    if (result.success) {
      const checkIns = result.data;
      
      // Get all class IDs from check-ins
      const classIds = [...new Set(checkIns
        .filter(ci => ci.class_attended)
        .map(ci => ci.class_attended))];
      
      // Fetch class details to determine types
      const classesResult = await Utils.apiRequest('/api/classes');
      const classes = classesResult.success ? classesResult.data : [];
      
      // Create lookup map for class types
      const classTypesMap = {};
      classes.forEach(cls => {
        classTypesMap[cls.id] = cls.type;
      });
      
      // Filter for FTV children (classes with type='ftv')
      const ftvChildren = checkIns.filter(ci => 
        ci.class_attended && classTypesMap[ci.class_attended] === 'ftv'
      );

      if (ftvChildren.length === 0) {
        Utils.showEmpty(container, 'No first-time visitors today');
        return;
      }

      container.innerHTML = ftvChildren.map(ci => `
        <div class="ftv-card">
          <h3>${ci.children.first_name} ${ci.children.last_name}</h3>
          <p><strong>Age:</strong> ${this.calculateAge(ci.children.date_of_birth)} years</p>
          <p><strong>Checked in:</strong> ${Utils.formatTime(ci.check_in_time)}</p>
          <p><strong>Parent Contact:</strong> ${ci.parents?.phone_number || ci.parents?.email || 'N/A'}</p>
        </div>
      `).join('');
    } else {
      Utils.showError(container, 'Failed to load first-time visitors', 'DashboardNav.loadFTVChildren()');
    }
  },

  async showFTVCheckInModal() {
    // Get FTV classes
    const classesResult = await Utils.apiRequest('/api/classes');
    const ftvClasses = classesResult.success 
      ? classesResult.data.filter(cls => cls.type === 'ftv')
      : [];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Check-In First Time Visitor</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        
        <form id="ftvCheckInForm" class="form">
          <div class="form-group">
            <label>Child's First Name <span class="required">*</span></label>
            <input type="text" id="ftvFirstName" required>
          </div>

          <div class="form-group">
            <label>Child's Last Name <span class="required">*</span></label>
            <input type="text" id="ftvLastName" required>
          </div>

          <div class="form-group">
            <label>Date of Birth <span class="required">*</span></label>
            <input type="date" id="ftvDOB" required>
          </div>

          <div class="form-group">
            <label>Gender</label>
            <select id="ftvGender">
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div class="form-group">
            <label>FTV Class <span class="required">*</span></label>
            <select id="ftvClass" required>
              <option value="">Select FTV class...</option>
              ${ftvClasses.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Parent/Guardian Name <span class="required">*</span></label>
            <input type="text" id="ftvParentName" required>
          </div>

          <div class="form-group">
            <label>Parent Phone Number <span class="required">*</span></label>
            <input type="tel" id="ftvParentPhone" required>
          </div>

          <div class="form-group">
            <label>Parent Email</label>
            <input type="email" id="ftvParentEmail">
          </div>

          <div class="form-group">
            <label>Allergies/Medical Notes</label>
            <textarea id="ftvAllergies" rows="3" placeholder="Any allergies or medical conditions we should know about..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">Check-In FTV</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('ftvCheckInForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitFTVCheckIn();
    });
  },

  async submitFTVCheckIn() {
    const firstName = document.getElementById('ftvFirstName').value;
    const lastName = document.getElementById('ftvLastName').value;
    const dob = document.getElementById('ftvDOB').value;
    const gender = document.getElementById('ftvGender').value;
    const classId = document.getElementById('ftvClass').value;
    const parentName = document.getElementById('ftvParentName').value;
    const parentPhone = document.getElementById('ftvParentPhone').value;
    const parentEmail = document.getElementById('ftvParentEmail').value;
    const allergies = document.getElementById('ftvAllergies').value;

    Utils.showToast('Processing FTV check-in...', 'info');

    try {
      // 1. Create parent first
      const [parentFirstName, ...parentLastNameParts] = parentName.split(' ');
      const parentLastName = parentLastNameParts.join(' ') || parentFirstName;

      const parentResult = await Utils.apiRequest('/api/parents', {
        method: 'POST',
        body: {
          first_name: parentFirstName,
          last_name: parentLastName,
          phone_number: parentPhone,
          email: parentEmail || null
        }
      });

      if (!parentResult.success) {
        throw new Error(parentResult.error || 'Failed to create parent');
      }

      const parentId = parentResult.data.id;

      // 2. Create child
      const childResult = await Utils.apiRequest('/api/children', {
        method: 'POST',
        body: {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: gender || null,
          allergies: allergies || null,
          is_ftv: true
        }
      });

      if (!childResult.success) {
        throw new Error(childResult.error || 'Failed to register child');
      }

      const childId = childResult.data.id;

      // 3. Link parent to child
      await Utils.apiRequest('/api/children/link-parent', {
        method: 'POST',
        body: {
          childId,
          parentId,
          relationshipType: 'parent',
          authorizedPickup: true
        }
      });

      // 4. Assign to FTV class
      await Utils.apiRequest('/api/classes/assign', {
        method: 'POST',
        body: {
          classId,
          childId
        }
      });

      // 5. Check-in the child
      const checkInResult = await Utils.apiRequest('/api/checkins', {
        method: 'POST',
        body: {
          childId,
          classId
        }
      });

      if (!checkInResult.success) {
        throw new Error(checkInResult.error || 'Failed to check-in');
      }

      Utils.showToast('FTV checked in successfully!', 'success');
      document.querySelector('.modal-overlay').remove();
      this.loadFTVChildren(); // Refresh the list
    } catch (error) {
      Utils.showToast(error.message || 'Failed to process FTV check-in', 'error');
    }
  },

  loadSpecialNeedsBoard(content) {
    content.innerHTML = `
      <div class="special-needs-board">
        <div class="section-header" style="margin-bottom: 1.5rem;">
          <div>
            <h2 style="margin: 0 0 0.25rem 0;">Special Needs Board</h2>
            <p class="subtitle" style="margin: 0; color: #6b7280; font-size: 0.9rem;">Children with special needs currently checked in</p>
          </div>
          <button class="btn-primary" id="addSpecialFriendBtn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem;">
              <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Add New Special Friend
          </button>
        </div>
        <div id="specialNeedsList"></div>
      </div>
    `;
    
    // Attach event listener to Add New Special Friend button
    setTimeout(() => {
      const addBtn = document.getElementById('addSpecialFriendBtn');
      if (addBtn) {
        addBtn.addEventListener('click', () => this.showChildRegistrationModal(true));
      }
    }, 0);
    
    this.loadSpecialNeedsChildren();
  },

  async loadSpecialNeedsChildren() {
    const container = document.getElementById('specialNeedsList');
    Utils.showLoading(container, 'Loading special needs children...');

    const today = new Date().toISOString().split('T')[0];
    const result = await Utils.apiRequest(`/api/checkins?date=${today}&status=checked_in`);

    if (result.success) {
      const checkIns = result.data;
      const specialNeedsChildren = checkIns.filter(ci => ci.children?.special_needs);

      if (specialNeedsChildren.length === 0) {
        Utils.showEmpty(container, 'No children with special needs currently checked in');
        return;
      }

      container.innerHTML = specialNeedsChildren.map(ci => `
        <div class="special-needs-card">
          <h3>${ci.children.first_name} ${ci.children.last_name}</h3>
          <p class="warning"><strong>Special Needs:</strong> Yes</p>
          ${ci.children.special_needs_details ? `<p>${ci.children.special_needs_details}</p>` : ''}
          <p><strong>Class:</strong> ${ci.class_attended}</p>
          <button class="btn-secondary view-special-needs-form" data-child-id="${ci.children.id}">View Form</button>
        </div>
      `).join('');
      
      // Attach event listeners to all View Form buttons
      setTimeout(() => {
        document.querySelectorAll('.view-special-needs-form').forEach(btn => {
          btn.addEventListener('click', () => {
            const childId = btn.getAttribute('data-child-id');
            this.viewSpecialNeedsForm(childId);
          });
        });
      }, 0);
    } else {
      Utils.showError(container, 'Failed to load special needs children', 'DashboardNav.loadSpecialNeedsChildren()');
    }
  },

  async loadReports(content) {
    const today = new Date().toISOString().split('T')[0];
    content.innerHTML = `
      <div class="reports-section">
        <h2>Reports & Statistics</h2>
        
        <!-- Overall Statistics -->
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 2rem;" id="totalChildrenStat">...</h3>
            <p style="margin: 0; opacity: 0.9;">Total Children</p>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 2rem;" id="totalParentsStat">...</h3>
            <p style="margin: 0; opacity: 0.9;">Total Parents</p>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 2rem;" id="totalClassesStat">...</h3>
            <p style="margin: 0; opacity: 0.9;">Total Classes</p>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 2rem;" id="todayCheckinsStat">...</h3>
            <p style="margin: 0; opacity: 0.9;">Today's Check-ins</p>
          </div>
        </div>

        <!-- Today's Activity -->
        <div class="report-card" style="margin-bottom: 2rem;">
          <h3>Today's Check-ins by Class</h3>
          <div id="todayByClass" style="margin-top: 1rem;">
            <p style="text-align: center; color: #6b7280;">Loading...</p>
          </div>
        </div>

        <!-- Recent Check-ins Table -->
        <div class="report-card" style="margin-bottom: 2rem;">
          <h3>Recent Check-ins (Last 20)</h3>
          <div id="recentCheckinsTable" style="margin-top: 1rem; overflow-x: auto;">
            <p style="text-align: center; color: #6b7280;">Loading...</p>
          </div>
        </div>

        <!-- Export Options -->
        <div class="report-card">
          <h3>Export Data</h3>
          <p>Download attendance data between two dates (CSV format)</p>
          <div class="form-row" style="margin-top: 0.75rem;">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="attStart" value="${today}">
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" id="attEnd" value="${today}">
            </div>
          </div>
          <button id="downloadAttendanceCsv" class="btn-primary" style="margin-top: 0.5rem;">Download CSV</button>
        </div>
      </div>
    `;

    // Load all statistics
    this.loadReportsStatistics();

    // Setup CSV download
    setTimeout(() => {
      const btn = document.getElementById('downloadAttendanceCsv');
      if (btn) {
        btn.addEventListener('click', () => {
          const start = document.getElementById('attStart').value || today;
          const end = document.getElementById('attEnd').value || start;
          const url = `/api/statistics/attendance/export.csv?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
          window.open(url, '_blank');
        });
      }
    }, 0);
  },

  async loadReportsStatistics() {
    try {
      // Load overall stats
      const statsResult = await Utils.apiRequest('/api/statistics/dashboard');
      if (statsResult.success) {
        const stats = statsResult.data;
        document.getElementById('totalChildrenStat').textContent = stats.totalChildren || 0;
        document.getElementById('totalParentsStat').textContent = stats.totalParents || 0;
        document.getElementById('totalClassesStat').textContent = stats.totalClasses || 0;
        document.getElementById('todayCheckinsStat').textContent = stats.currentlyCheckedIn || 0;
      }

      // Load today's check-ins by class
      const today = new Date().toISOString().split('T')[0];
      const checkinsResult = await Utils.apiRequest(`/api/checkins?date=${today}`);
      
      if (checkinsResult.success) {
        const checkIns = checkinsResult.data || [];
        
        // Group by class
        const byClass = {};
        checkIns.forEach(ci => {
          const className = ci.classes?.name || 'Unassigned';
          if (!byClass[className]) {
            byClass[className] = [];
          }
          byClass[className].push(ci);
        });

        const todayByClassDiv = document.getElementById('todayByClass');
        if (Object.keys(byClass).length === 0) {
          todayByClassDiv.innerHTML = '<p style="text-align: center; color: #6b7280;">No check-ins today</p>';
        } else {
          todayByClassDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
              ${Object.keys(byClass).map(className => `
                <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center;">
                  <div style="font-size: 2rem; font-weight: bold; color: #2563eb;">${byClass[className].length}</div>
                  <div style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">${className}</div>
                </div>
              `).join('')}
            </div>
          `;
        }

        // Recent check-ins table
        const recentTableDiv = document.getElementById('recentCheckinsTable');
        if (checkIns.length === 0) {
          recentTableDiv.innerHTML = '<p style="text-align: center; color: #6b7280;">No check-ins today</p>';
        } else {
          recentTableDiv.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6; text-align: left;">
                  <th style="padding: 0.75rem; border-bottom: 2px solid #e5e7eb;">Child Name</th>
                  <th style="padding: 0.75rem; border-bottom: 2px solid #e5e7eb;">Class</th>
                  <th style="padding: 0.75rem; border-bottom: 2px solid #e5e7eb;">Check-in Time</th>
                  <th style="padding: 0.75rem; border-bottom: 2px solid #e5e7eb;">Security Code</th>
                </tr>
              </thead>
              <tbody>
                ${checkIns.slice(0, 20).map(ci => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 0.75rem;">${ci.children?.first_name} ${ci.children?.last_name}</td>
                    <td style="padding: 0.75rem;">${ci.classes?.name || 'N/A'}</td>
                    <td style="padding: 0.75rem;">${Utils.formatTime(ci.check_in_time)}</td>
                    <td style="padding: 0.75rem; font-weight: 600; color: #2563eb;">${ci.security_code}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }
    } catch (error) {
      console.error('Error loading reports statistics:', error);
    }
  },

  calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  async deleteClass(classId, className) {
    if (!confirm(`Are you sure you want to delete the class "${className}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const result = await Utils.apiRequest(`/api/classes/${classId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        alert(`Class "${className}" has been deleted successfully.`);
        // Reload classes view
        this.loadClassesView(document.getElementById('dashboardContent'));
      } else {
        alert(`Failed to delete class: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete class error:', error);
      alert('An error occurred while deleting the class.');
    }
  },

  async viewClassBoard(classId, className) {
    // Switch to full-page view
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    content.innerHTML = `
      <div class="class-board-view">
        <div class="class-board-header">
          <div class="header-left">
            <button class="btn-secondary" id="backFromClassBoard">← Back to Classrooms</button>
            <h2>${className} - Class Board</h2>
          </div>
          <div class="header-right">
            <div class="board-stats" id="boardStats">
              <span class="stat-badge">Loading...</span>
            </div>
            <button class="btn-secondary" id="exportToCSV">Export to CSV</button>
            <button class="btn-secondary" id="printClassBoard">Print Board</button>
          </div>
        </div>
        
        <div class="board-filters" style="background: white; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <label style="font-weight: 600; color: #374151;">View:</label>
            <select id="boardViewType" class="form-control" style="width: auto; min-width: 150px;">
              <option value="today">Today Only</option>
              <option value="alltime" selected>All Time Check-ins</option>
              <option value="daterange">Date Range</option>
            </select>
            
            <div id="dateRangeInputs" style="display: none; gap: 1rem; align-items: center;">
              <label style="color: #6b7280;">From:</label>
              <input type="date" id="startDate" class="form-control" style="width: auto;">
              <label style="color: #6b7280;">To:</label>
              <input type="date" id="endDate" class="form-control" style="width: auto;">
              <button class="btn-primary" id="applyDateRange" style="padding: 0.5rem 1rem;">Apply</button>
            </div>
          </div>
        </div>
        
        <div class="class-board-table-container">
          <p style="text-align: center; color: #6b7280; padding: 2rem;">Loading children...</p>
        </div>
      </div>
    `;

    // Back button
    setTimeout(() => {
      document.getElementById('backFromClassBoard')?.addEventListener('click', () => {
        this.switchView('classrooms');
      });
      
      // View type selector
      const viewTypeSelect = document.getElementById('boardViewType');
      const dateRangeInputs = document.getElementById('dateRangeInputs');
      
      viewTypeSelect?.addEventListener('change', (e) => {
        if (e.target.value === 'daterange') {
          dateRangeInputs.style.display = 'flex';
        } else {
          dateRangeInputs.style.display = 'none';
          this.loadClassBoardData(classId, className, e.target.value);
        }
      });
      
      // Date range apply button
      document.getElementById('applyDateRange')?.addEventListener('click', () => {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        if (startDate && endDate) {
          this.loadClassBoardData(classId, className, 'daterange', startDate, endDate);
        } else {
          Utils.showToast('Please select both start and end dates', 'error');
        }
      });
    }, 0);

    // Load all-time data by default
    this.loadClassBoardData(classId, className, 'alltime');
  },

  async loadClassBoardData(classId, className, viewType = 'alltime', startDate = null, endDate = null) {
    const container = document.querySelector('.class-board-table-container');
    const statsDiv = document.getElementById('boardStats');
    
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Loading children...</p>';

    try {
      // First, get all children assigned to this class
      const childrenResult = await Utils.apiRequest('/api/children?limit=1000');
      // The API returns { data: [...], pagination: {...} }, so we need childrenResult.data.data
      const allChildren = childrenResult.success && childrenResult.data?.data ? childrenResult.data.data : [];
      const classChildren = allChildren.filter(child => child.default_class_id === classId);

      // Then, get check-ins based on view type
      let apiUrl = '/api/checkins';
      let params = new URLSearchParams();
      
      if (viewType === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('date', today);
      } else if (viewType === 'daterange' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      // For 'alltime', don't add any date filters
      
      const queryString = params.toString();
      const result = await Utils.apiRequest(queryString ? `${apiUrl}?${queryString}` : apiUrl);

      if (result.success) {
        const checkIns = result.data || [];
        // Filter for this class
        const classCheckIns = checkIns.filter(ci => 
          ci.class_attended === classId
        );

        // For "today" view, show all class children with their check-in status
        if (viewType === 'today') {
          // Create a map of child_id to check-in data
          const checkInMap = new Map();
          classCheckIns.forEach(ci => {
            checkInMap.set(ci.child_id, ci);
          });

          // Build display data: all children in class with check-in status
          const displayData = classChildren.map(child => {
            const checkIn = checkInMap.get(child.id);
            return {
              child: child,
              checkIn: checkIn || null,
              isCheckedIn: !!checkIn,
              isCheckedOut: checkIn?.check_out_time ? true : false
            };
          });

          // Calculate stats
          const currentlyHere = displayData.filter(d => d.isCheckedIn && !d.isCheckedOut).length;
          const checkedOut = displayData.filter(d => d.isCheckedOut).length;
          const notCheckedIn = displayData.filter(d => !d.isCheckedIn).length;
          
          const statsHTML = `
            <span class="stat-badge stat-success">${currentlyHere} Currently Here</span>
            <span class="stat-badge stat-warning">${checkedOut} Checked Out</span>
            <span class="stat-badge stat-secondary" style="background: #94a3b8;">${notCheckedIn} Not Checked In</span>
            <span class="stat-badge stat-primary">${displayData.length} Total in Class</span>
            <span class="stat-badge">Today: ${new Date().toLocaleDateString()}</span>
          `;
          
          if (statsDiv) {
            statsDiv.innerHTML = statsHTML;
          }

          if (displayData.length === 0) {
            container.innerHTML = `
              <div style="text-align: center; padding: 4rem;">
                <p style="font-size: 1.2rem; color: #6b7280;">No children assigned to this classroom</p>
                <p style="margin-top: 10px; font-size: 0.875rem; color: #9ca3af;">
                  Assign children to this class from the Member Management page.
                </p>
              </div>
            `;
            return;
          }

          // Sort: checked in first, then by name
          displayData.sort((a, b) => {
            if (a.isCheckedIn && !b.isCheckedIn) return -1;
            if (!a.isCheckedIn && b.isCheckedIn) return 1;
            return (a.child.first_name || '').localeCompare(b.child.first_name || '');
          });

          // Create table for today view
          container.innerHTML = `
            <div class="spreadsheet-table">
              <table>
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th style="width: 150px;">Status</th>
                    <th style="width: 180px;">Child Name</th>
                    <th style="width: 80px;">Age</th>
                    <th style="width: 120px;">Date of Birth</th>
                    <th style="width: 120px;">Check-in Time</th>
                    <th style="width: 120px;">Check-out Time</th>
                    <th style="width: 120px;">Security Code</th>
                    <th style="width: 180px;">Parent/Guardian</th>
                    <th style="width: 150px;">Phone</th>
                    <th style="width: 200px;">Allergies</th>
                    <th style="width: 200px;">Medical Notes</th>
                    <th style="width: 150px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${displayData.map((item, index) => {
                    const child = item.child;
                    const ci = item.checkIn;
                    const parent = ci?.parents;
                    
                    const age = child.date_of_birth ? this.calculateAge(child.date_of_birth) : 'N/A';
                    
                    let statusBadge = '';
                    let rowClass = '';
                    if (!item.isCheckedIn) {
                      statusBadge = '<span class="status-badge" style="background: #94a3b8; color: white;">Not Checked In</span>';
                      rowClass = 'row-not-checked-in';
                    } else if (item.isCheckedOut) {
                      statusBadge = '<span class="status-badge status-checked-out">Checked Out</span>';
                      rowClass = 'row-checked-out';
                    } else {
                      statusBadge = '<span class="status-badge status-checked-in">Present</span>';
                      rowClass = '';
                    }
                    
                    return `
                      <tr data-checkin-id="${ci?.id || ''}" data-child-id="${child.id}" class="${rowClass}">
                        <td class="row-number">${index + 1}</td>
                        <td>${statusBadge}</td>
                        <td class="child-name">
                          <strong>${child.first_name} ${child.last_name}</strong>
                          ${child.special_needs ? '<span class="badge badge-special">Special Needs</span>' : ''}
                        </td>
                        <td>${age}</td>
                        <td>${child.date_of_birth || 'N/A'}</td>
                        <td>${ci?.check_in_time ? Utils.formatTime(ci.check_in_time) : '-'}</td>
                        <td>${ci?.check_out_time ? Utils.formatTime(ci.check_out_time) : '-'}</td>
                        <td class="security-code">${ci?.security_code || '-'}</td>
                        <td>${parent ? `${parent.first_name} ${parent.last_name}` : '-'}</td>
                        <td>${parent?.phone_number || '-'}</td>
                        <td class="allergies-cell ${child.allergies ? 'has-allergies' : ''}">
                          ${child.allergies || '-'}
                        </td>
                        <td class="medical-cell ${child.medical_notes ? 'has-medical' : ''}">
                          ${child.medical_notes || '-'}
                        </td>
                        <td class="actions-cell">
                          ${ci ? `
                            <button class="action-btn print-btn" data-checkin-data='${JSON.stringify({ child, code: ci.security_code })}' title="Print Security Tag">
                              Print Tag
                            </button>
                            <button class="action-btn info-btn" data-child='${JSON.stringify(child).replace(/'/g, "&#39;")}' title="View Child Details">
                              Details
                            </button>
                          ` : '-'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;

          // Attach event listeners to action buttons
          this.attachClassBoardActions(displayData.filter(d => d.checkIn).map(d => d.checkIn));
          
          // Export CSV functionality - pass displayData for today view
          document.getElementById('exportToCSV')?.addEventListener('click', () => {
            this.exportClassBoardToCSV(displayData, className);
          });

          // Print functionality
          document.getElementById('printClassBoard')?.addEventListener('click', () => {
            this.printClassBoard(className);
          });
        } else {
          // For "all time" and "date range" views, show check-in history
          const classChildren = classCheckIns;

          // Calculate stats based on view type
          let statsHTML = '';
          if (viewType === 'alltime') {
            const uniqueChildren = new Set(classChildren.map(ci => ci.child_id));
            const totalCheckIns = classChildren.length;
            statsHTML = `
              <span class="stat-badge stat-primary">${uniqueChildren.size} Unique Children</span>
              <span class="stat-badge stat-info">${totalCheckIns} Total Check-ins</span>
              <span class="stat-badge">All Time Records</span>
            `;
          } else if (viewType === 'daterange') {
            const uniqueChildren = new Set(classChildren.map(ci => ci.child_id));
            statsHTML = `
              <span class="stat-badge stat-primary">${uniqueChildren.size} Unique Children</span>
              <span class="stat-badge stat-info">${classChildren.length} Total Check-ins</span>
              <span class="stat-badge">${startDate} to ${endDate}</span>
            `;
          }
          
          if (statsDiv) {
            statsDiv.innerHTML = statsHTML;
          }

          if (classChildren.length === 0) {
            const viewMessage = viewType === 'alltime'
              ? 'No check-in history found for this classroom'
              : 'No check-ins found for the selected date range';
              
            container.innerHTML = `
              <div style="text-align: center; padding: 4rem;">
                <p style="font-size: 1.2rem; color: #6b7280;">${viewMessage}</p>
                <p style="margin-top: 10px; font-size: 0.875rem; color: #9ca3af;">
                  Children will appear here once they are checked in and assigned to this classroom.
                </p>
              </div>
            `;
            return;
          }

          // Sort by check-in date (newest first)
          classChildren.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));

          // Create spreadsheet-style table
          container.innerHTML = `
          <div class="spreadsheet-table">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th style="width: 120px;">Check-in Date</th>
                  <th style="width: 100px;">Status</th>
                  <th style="width: 180px;">Child Name</th>
                  <th style="width: 80px;">Age</th>
                  <th style="width: 120px;">Date of Birth</th>
                  <th style="width: 120px;">Check-in Time</th>
                  <th style="width: 120px;">Check-out Time</th>
                  <th style="width: 120px;">Security Code</th>
                  <th style="width: 180px;">Parent/Guardian</th>
                  <th style="width: 150px;">Phone</th>
                  <th style="width: 200px;">Allergies</th>
                  <th style="width: 200px;">Medical Notes</th>
                  <th style="width: 150px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${classChildren.map((ci, index) => {
                  const child = ci.children;
                  const parent = ci.parents;
                  const age = child.date_of_birth ? this.calculateAge(child.date_of_birth) : 'N/A';
                  const isCheckedOut = !!ci.check_out_time;
                  const statusClass = isCheckedOut ? 'status-checked-out' : 'status-checked-in';
                  const statusText = isCheckedOut ? 'Checked Out' : 'Present';
                  const checkInDate = new Date(ci.check_in_time).toLocaleDateString();
                  
                  return `
                    <tr data-checkin-id="${ci.id}" data-child-id="${child.id}" class="${isCheckedOut ? 'row-checked-out' : ''}">
                      <td class="row-number">${index + 1}</td>
                      <td>${checkInDate}</td>
                      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                      <td class="child-name">
                        <strong>${child.first_name} ${child.last_name}</strong>
                        ${child.special_needs ? '<span class="badge badge-special">Special Needs</span>' : ''}
                      </td>
                      <td>${age}</td>
                      <td>${child.date_of_birth || 'N/A'}</td>
                      <td>${Utils.formatTime(ci.check_in_time)}</td>
                      <td>${ci.check_out_time ? Utils.formatTime(ci.check_out_time) : '-'}</td>
                      <td class="security-code">${ci.security_code}</td>
                      <td>${parent ? `${parent.first_name} ${parent.last_name}` : 'N/A'}</td>
                      <td>${parent?.phone_number || 'N/A'}</td>
                      <td class="allergies-cell ${child.allergies ? 'has-allergies' : ''}">
                        ${child.allergies || '-'}
                      </td>
                      <td class="medical-cell ${child.medical_notes ? 'has-medical' : ''}">
                        ${child.medical_notes || '-'}
                      </td>
                      <td class="actions-cell">
                        <button class="action-btn print-btn" data-checkin-data='${JSON.stringify({ child, code: ci.security_code })}' title="Print Security Tag">
                          Print Tag
                        </button>
                        <button class="action-btn info-btn" data-child='${JSON.stringify(child).replace(/'/g, "&#39;")}' title="View Child Details">
                          Details
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;

          // Attach event listeners to action buttons
          this.attachClassBoardActions(classChildren);

          // Export CSV functionality
          document.getElementById('exportToCSV')?.addEventListener('click', () => {
            this.exportClassBoardToCSV(classChildren, className);
          });

          // Print functionality
          document.getElementById('printClassBoard')?.addEventListener('click', () => {
            this.printClassBoard(className);
          });
        }
      } else {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem;">
            <p style="font-size: 1.2rem; color: #ef4444;">Failed to load children</p>
            <p style="margin-top: 10px; font-size: 0.875rem; color: #9ca3af;">${result.error || 'Unknown error'}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading class board:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
          <p style="font-size: 1.2rem; color: #ef4444;">Error loading data</p>
          <p style="margin-top: 10px; font-size: 0.875rem; color: #9ca3af;">${error.message || 'Unknown error'}</p>
        </div>
      `;
    }
  },

  attachClassBoardActions(classChildren) {
    // Checkout buttons
    document.querySelectorAll('.checkout-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const checkinId = btn.dataset.checkinId;
        const securityCode = btn.dataset.code;
        await this.quickCheckout(checkinId, securityCode);
      });
    });

    // Print buttons
    document.querySelectorAll('.print-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const data = JSON.parse(btn.dataset.checkinData);
        this.showSecurityCodeModal({ security_code: data.code }, data.child);
      });
    });

    // Info buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const child = JSON.parse(btn.dataset.child);
        this.showChildDetailsModal(child);
      });
    });
  },

  async quickCheckout(checkinId, securityCode) {
    if (!confirm('Are you sure you want to check out this child?')) {
      return;
    }

    const result = await Utils.apiRequest(`/api/checkins/${checkinId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ security_code: securityCode })
    });

    if (result.success) {
      Utils.showToast('Child checked out successfully!', 'success');
      // Remove the row from the table
      const row = document.querySelector(`tr[data-checkin-id="${checkinId}"]`);
      if (row) {
        row.style.opacity = '0';
        row.style.transition = 'opacity 0.3s';
        setTimeout(() => row.remove(), 300);
        
        // Update count
        const statsDiv = document.getElementById('boardStats');
        if (statsDiv) {
          const currentRows = document.querySelectorAll('.spreadsheet-table tbody tr').length - 1;
          statsDiv.querySelector('.stat-primary').textContent = `${currentRows} Checked In`;
        }
      }
    } else {
      Utils.showToast(`Checkout failed: ${result.error}`, 'error');
    }
  },

  showChildDetailsModal(child) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>👶 ${child.first_name} ${child.last_name}</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="child-details">
          <div class="detail-row">
            <span class="detail-label">Full Name:</span>
            <span class="detail-value">${child.first_name} ${child.last_name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date of Birth:</span>
            <span class="detail-value">${child.date_of_birth || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Age:</span>
            <span class="detail-value">${child.date_of_birth ? this.calculateAge(child.date_of_birth) + ' years old' : 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Gender:</span>
            <span class="detail-value">${child.gender || 'Not specified'}</span>
          </div>
          ${child.allergies ? `
            <div class="detail-row alert-row">
              <span class="detail-label">⚠️ Allergies:</span>
              <span class="detail-value">${child.allergies}</span>
            </div>
          ` : ''}
          ${child.medical_notes ? `
            <div class="detail-row alert-row">
              <span class="detail-label">🏥 Medical Notes:</span>
              <span class="detail-value">${child.medical_notes}</span>
            </div>
          ` : ''}
          ${child.special_needs ? `
            <div class="detail-row alert-row">
              <span class="detail-label">💙 Special Needs:</span>
              <span class="detail-value">${child.special_needs_details || 'Yes'}</span>
            </div>
          ` : ''}
        </div>
        <div class="form-actions" style="margin-top: 1.5rem;">
          <button class="btn-primary" id="editChildBtn">Edit Details</button>
          <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    modal.querySelector('#editChildBtn').addEventListener('click', () => {
      modal.remove();
      this.showEditChildModal(child);
    });
  },

  exportClassBoardToCSV(classChildren, className) {
    // Check if classChildren is the new format (objects with child/checkIn properties)
    // or the old format (check-in objects)
    const isNewFormat = classChildren.length > 0 && classChildren[0].hasOwnProperty('child');
    
    const headers = ['#', 'Status', 'Child Name', 'Age', 'Date of Birth', 'Check-in Time', 'Check-out Time', 'Security Code', 'Parent/Guardian', 'Phone', 'Allergies', 'Medical Notes', 'Special Needs'];
    
    const rows = classChildren.map((item, index) => {
      let child, ci, parent, age, checkInTime, checkOutTime, securityCode, status;
      
      if (isNewFormat) {
        // New format: { child, checkIn, isCheckedIn, isCheckedOut }
        child = item.child;
        ci = item.checkIn;
        parent = ci?.parents;
        age = child.date_of_birth ? this.calculateAge(child.date_of_birth) : 'N/A';
        checkInTime = ci?.check_in_time ? Utils.formatTime(ci.check_in_time) : '-';
        checkOutTime = ci?.check_out_time ? Utils.formatTime(ci.check_out_time) : '-';
        securityCode = ci?.security_code || '-';
        
        if (!item.isCheckedIn) {
          status = 'Not Checked In';
        } else if (item.isCheckedOut) {
          status = 'Checked Out';
        } else {
          status = 'Present';
        }
      } else {
        // Old format: check-in object
        child = item.children;
        parent = item.parents;
        age = child.date_of_birth ? this.calculateAge(child.date_of_birth) : 'N/A';
        checkInTime = Utils.formatTime(item.check_in_time);
        checkOutTime = item.check_out_time ? Utils.formatTime(item.check_out_time) : '-';
        securityCode = item.security_code;
        status = item.check_out_time ? 'Checked Out' : 'Present';
      }
      
      return [
        index + 1,
        status,
        `${child.first_name} ${child.last_name}`,
        age,
        child.date_of_birth || 'N/A',
        checkInTime,
        checkOutTime,
        securityCode,
        parent ? `${parent.first_name} ${parent.last_name}` : 'N/A',
        parent?.phone_number || 'N/A',
        child.allergies || '-',
        child.medical_notes || '-',
        child.special_needs ? 'Yes' : 'No'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Utils.showToast('Class board exported to CSV!', 'success');
  },

  printClassBoard(className) {
    window.print();
  },

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  viewClassDetails(classId) {
    console.log('View class details:', classId);
    // TODO: Implement class details modal
  },

  viewSpecialNeedsForm(childId) {
    this.showSpecialNeedsFormModal(childId);
  },

  showSpecialNeedsFormModal(childId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2>Special Needs Form</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <form id="specialNeedsForm" class="form">
          ${!childId ? `
          <div class="form-group">
            <label>Select Child <span class="required">*</span></label>
            <select id="specialNeedsChildId" required>
              <option value="">Loading children...</option>
            </select>
          </div>
          ` : `<input type="hidden" id="specialNeedsChildId" value="${childId}">`}

          <div class="form-group">
            <label>Diagnosis</label>
            <input type="text" id="diagnosis" placeholder="e.g., Autism, ADHD, Down Syndrome">
          </div>

          <div class="form-group">
            <label>Medications</label>
            <textarea id="medications" rows="2" placeholder="List any medications and dosages..."></textarea>
          </div>

          <div class="form-group">
            <label>Triggers</label>
            <textarea id="triggers" rows="2" placeholder="What situations or stimuli might cause distress?"></textarea>
          </div>

          <div class="form-group">
            <label>Calming Techniques</label>
            <textarea id="calmingTechniques" rows="2" placeholder="What helps calm the child when upset?"></textarea>
          </div>

          <div class="form-group">
            <label>Communication Methods</label>
            <textarea id="communicationMethods" rows="2" placeholder="How does the child communicate? (verbal, sign language, pictures, etc.)"></textarea>
          </div>

          <div class="form-group">
            <label>Emergency Procedures</label>
            <textarea id="emergencyProcedures" rows="3" placeholder="What should staff do in case of emergency or severe distress?"></textarea>
          </div>

          <div class="form-group">
            <label>Additional Notes</label>
            <textarea id="additionalNotes" rows="3" placeholder="Any other information staff should know..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">Submit Form</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Load children for dropdown if needed
    if (!childId) {
      this.loadChildrenDropdown();
    }

    document.getElementById('specialNeedsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitSpecialNeedsForm();
    });
  },

  async loadChildrenDropdown() {
    const select = document.getElementById('specialNeedsChildId');
    if (!select) return;

    const result = await Utils.apiRequest('/api/children');
    
    if (result.success) {
      const children = result.data.data || [];
      select.innerHTML = '<option value="">Select a child...</option>' + 
        children.map(child => 
          `<option value="${child.id}">${child.first_name} ${child.last_name}</option>`
        ).join('');
    } else {
      select.innerHTML = '<option value="">Failed to load children</option>';
    }
  },

  async submitSpecialNeedsForm() {
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const user = window.currentUser;
    
    const formData = {
      child_id: document.getElementById('specialNeedsChildId').value,
      diagnosis: document.getElementById('diagnosis').value.trim() || null,
      medications: document.getElementById('medications').value.trim() || null,
      triggers: document.getElementById('triggers').value.trim() || null,
      calming_techniques: document.getElementById('calmingTechniques').value.trim() || null,
      communication_methods: document.getElementById('communicationMethods').value.trim() || null,
      emergency_procedures: document.getElementById('emergencyProcedures').value.trim() || null,
      additional_notes: document.getElementById('additionalNotes').value.trim() || null,
      submitted_by: user.id
    };

    const result = await Utils.apiRequest('/api/special-needs', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (result.success) {
      Utils.showToast('Special needs form submitted successfully!', 'success');
      document.querySelector('.modal-overlay').remove();
    } else {
      Utils.showToast(`Submission failed: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Form';
    }
  },

  showExportModal() {
    const today = new Date().toISOString().split('T')[0];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h2>Export Attendance Data</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div style="padding: 1.5rem;">
          <p style="margin-bottom: 1.5rem; color: #6b7280;">Download attendance data between two dates in CSV format.</p>
          
          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Start Date</label>
            <input type="date" id="exportStartDate" value="${today}" style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label>End Date</label>
            <input type="date" id="exportEndDate" value="${today}" style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px;">
          </div>
          
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn-primary" id="downloadCsvBtn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem;">
                <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M4.667 6.667L8 10m0 0l3.333-3.333M8 10V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Download CSV
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add download handler
    setTimeout(() => {
      const downloadBtn = document.getElementById('downloadCsvBtn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const start = document.getElementById('exportStartDate').value || today;
          const end = document.getElementById('exportEndDate').value || start;
          
          // Get token from localStorage
          const token = localStorage.getItem('token');
          
          // Create a download link with authentication
          const url = `/api/statistics/attendance/export.csv?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
          
          // Use fetch with authentication header
          fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to download CSV');
            }
            return response.blob();
          })
          .then(blob => {
            // Create a download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `attendance_${start}_to_${end}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            // Close modal
            modal.remove();
            Utils.showToast('CSV downloaded successfully!', 'success');
          })
          .catch(error => {
            console.error('Download error:', error);
            Utils.showToast('Failed to download CSV: ' + error.message, 'error');
          });
        });
      }
    }, 0);
  },

  showChildRegistrationModal(autoOpenSpecialNeeds = false) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Register New Child</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <form id="childRegForm" class="form">
          <div class="form-row">
            <div class="form-group">
              <label>First Name <span class="required">*</span></label>
              <input type="text" id="childFirstName" required>
            </div>
            <div class="form-group">
              <label>Last Name <span class="required">*</span></label>
              <input type="text" id="childLastName" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Date of Birth <span class="required">*</span></label>
              <input type="date" id="childDOB" required>
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select id="childGender">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Allergies</label>
            <textarea id="childAllergies" rows="2" placeholder="List any allergies..."></textarea>
          </div>

          <div class="form-group">
            <label>Medical Notes</label>
            <textarea id="childMedicalNotes" rows="2" placeholder="Any medical conditions or notes..."></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="childSpecialNeeds" ${autoOpenSpecialNeeds ? 'checked' : ''}>
              This child has special needs
            </label>
          </div>

          <!-- Special Needs Form Fields (shown when checkbox is checked) -->
          <div id="specialNeedsFormFields" style="display:${autoOpenSpecialNeeds ? 'block' : 'none'}; border: 2px solid #14b8a6; border-radius: 8px; padding: 1.5rem; margin-top: 1rem; background: #f0fdfa;">
            <h3 style="margin: 0 0 1rem 0; color: #14b8a6; font-size: 1.1rem;">Special Needs Information</h3>
            
            <div class="form-group">
              <label>Diagnosis</label>
              <input type="text" id="childDiagnosis" placeholder="e.g., Autism, ADHD, Down Syndrome">
            </div>

            <div class="form-group">
              <label>Medications</label>
              <textarea id="childMedications" rows="2" placeholder="List any medications and dosages..."></textarea>
            </div>

            <div class="form-group">
              <label>Triggers</label>
              <textarea id="childTriggers" rows="2" placeholder="What situations or stimuli might cause distress?"></textarea>
            </div>

            <div class="form-group">
              <label>Communication Methods</label>
              <textarea id="childCommunication" rows="2" placeholder="How does the child communicate? Any specific techniques?"></textarea>
            </div>

            <div class="form-group">
              <label>Behavioral Support</label>
              <textarea id="childBehavioral" rows="2" placeholder="Strategies that help manage behavior..."></textarea>
            </div>

            <div class="form-group">
              <label>Sensory Needs</label>
              <textarea id="childSensory" rows="2" placeholder="Any sensory sensitivities or requirements..."></textarea>
            </div>

            <div class="form-group">
              <label>Emergency Procedures</label>
              <textarea id="childEmergency" rows="2" placeholder="What to do in case of an emergency or crisis..."></textarea>
            </div>

            <div class="form-group">
              <label>Additional Notes</label>
              <textarea id="childAdditionalNotes" rows="2" placeholder="Any other important information..."></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">Register Child</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Toggle special needs form fields
    document.getElementById('childSpecialNeeds').addEventListener('change', (e) => {
      const specialNeedsFields = document.getElementById('specialNeedsFormFields');
      if (e.target.checked) {
        specialNeedsFields.style.display = 'block';
        // Smooth scroll to show the fields
        setTimeout(() => {
          specialNeedsFields.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        specialNeedsFields.style.display = 'none';
      }
    });

    // Handle form submission
    document.getElementById('childRegForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.registerChild();
    });
  },

  async registerChild() {
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const specialNeedsChecked = document.getElementById('childSpecialNeeds').checked;

    const childData = {
      first_name: document.getElementById('childFirstName').value.trim(),
      last_name: document.getElementById('childLastName').value.trim(),
      date_of_birth: document.getElementById('childDOB').value,
      gender: document.getElementById('childGender').value || null,
      allergies: document.getElementById('childAllergies').value.trim() || null,
      medical_notes: document.getElementById('childMedicalNotes').value.trim() || null,
      special_needs: specialNeedsChecked
    };

    // If special needs is checked, collect all special needs form data
    let specialNeedsData = null;
    if (specialNeedsChecked) {
      specialNeedsData = {
        diagnosis: document.getElementById('childDiagnosis')?.value.trim() || null,
        medications: document.getElementById('childMedications')?.value.trim() || null,
        triggers: document.getElementById('childTriggers')?.value.trim() || null,
        communication_methods: document.getElementById('childCommunication')?.value.trim() || null,
        behavioral_support: document.getElementById('childBehavioral')?.value.trim() || null,
        sensory_needs: document.getElementById('childSensory')?.value.trim() || null,
        emergency_procedures: document.getElementById('childEmergency')?.value.trim() || null,
        additional_notes: document.getElementById('childAdditionalNotes')?.value.trim() || null
      };
    }

    const result = await Utils.apiRequest('/api/children', {
      method: 'POST',
      body: JSON.stringify(childData)
    });

    if (result.success) {
      const childId = result.data.id;
      
      // If special needs data was collected, submit it separately
      if (specialNeedsData && childId) {
        specialNeedsData.child_id = childId;
        const specialNeedsResult = await Utils.apiRequest('/api/special-needs', {
          method: 'POST',
          body: JSON.stringify(specialNeedsData)
        });
        
        if (!specialNeedsResult.success) {
          console.warn('Child registered but special needs form submission failed:', specialNeedsResult.error);
          Utils.showToast('Child registered, but special needs form had an issue. Please update it from the child\'s profile.', 'warning');
        } else {
          Utils.showToast('Child and special needs information registered successfully!', 'success');
        }
      } else {
        Utils.showToast('Child registered successfully!', 'success');
      }
      document.querySelector('.modal-overlay').remove();
      this.loadCheckinView(document.getElementById('dashboardContent'));
    } else {
      Utils.showToast(`Registration failed: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register Child';
    }
  },

  showParentRegistrationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Register New Parent/Guardian</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <form id="parentRegForm" class="form">
          <div class="form-row">
            <div class="form-group">
              <label>First Name <span class="required">*</span></label>
              <input type="text" id="parentFirstName" required>
            </div>
            <div class="form-group">
              <label>Last Name <span class="required">*</span></label>
              <input type="text" id="parentLastName" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="parentEmail" placeholder="parent@example.com">
            </div>
            <div class="form-group">
              <label>Phone Number <span class="required">*</span></label>
              <input type="tel" id="parentPhone" required placeholder="(555) 123-4567">
            </div>
          </div>

          <div class="form-group">
            <label>Address</label>
            <textarea id="parentAddress" rows="2" placeholder="Street address, city, state, zip..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <input type="text" id="emergencyName" placeholder="Full name">
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <input type="tel" id="emergencyPhone" placeholder="(555) 123-4567">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">Register Parent</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('parentRegForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.registerParent();
    });
  },

  async registerParent() {
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const parentData = {
      first_name: document.getElementById('parentFirstName').value.trim(),
      last_name: document.getElementById('parentLastName').value.trim(),
      email: document.getElementById('parentEmail').value.trim() || null,
      phone_number: document.getElementById('parentPhone').value.trim(),
      address: document.getElementById('parentAddress').value.trim() || null,
      emergency_contact_name: document.getElementById('emergencyName').value.trim() || null,
      emergency_contact_phone: document.getElementById('emergencyPhone').value.trim() || null
    };

    const result = await Utils.apiRequest('/api/parents', {
      method: 'POST',
      body: JSON.stringify(parentData)
    });

    if (result.success) {
      Utils.showToast('Parent registered successfully!', 'success');
      document.querySelector('.modal-overlay').remove();
    } else {
      Utils.showToast(`Registration failed: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register Parent';
    }
  },

  async showManageChildrenModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>Manage Children & Parents</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <div class="form-group" style="flex: 1; margin: 0;">
            <input 
              type="text" 
              id="manageChildSearch" 
              placeholder="Search by child name..." 
              style="width: 100%;"
            >
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button id="selectAllBtn" class="btn-secondary" style="white-space: nowrap;">Select All</button>
            <button id="deselectAllBtn" class="btn-secondary" style="white-space: nowrap;">Deselect All</button>
          </div>
        </div>

        <div id="bulkActionsBar" style="display: none; padding: 1rem; background: #f0fdfa; border: 2px solid #14b8a6; border-radius: 8px; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <span id="selectedCount" style="font-weight: 600; color: #0f766e;">0 children selected</span>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <select id="bulkClassSelect" class="form-control" style="width: auto; min-width: 150px;">
                <option value="">Assign to Class...</option>
              </select>
              <button id="bulkAssignBtn" class="btn-primary" style="white-space: nowrap;">Assign Selected</button>
              <button id="bulkExportBtn" class="btn-secondary" style="white-space: nowrap;">Export Selected</button>
              <button id="bulkDeleteBtn" class="btn-danger" style="white-space: nowrap; background: #dc2626; color: white;">Delete Selected</button>
            </div>
          </div>
        </div>

        <div id="childrenList" style="margin-top: 1rem;">
          Loading children...
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Initialize selected children set
    this.selectedChildren = new Set();

    // Load children
    await this.loadChildrenForManagement();

    // Load classes for bulk assignment
    await this.loadClassesForBulkActions();

    // Search functionality
    document.getElementById('manageChildSearch').addEventListener('input', (e) => {
      this.filterChildrenList(e.target.value);
    });

    // Select all button
    document.getElementById('selectAllBtn').addEventListener('click', () => {
      this.selectAllChildren();
    });

    // Deselect all button
    document.getElementById('deselectAllBtn').addEventListener('click', () => {
      this.deselectAllChildren();
    });

    // Bulk actions
    document.getElementById('bulkAssignBtn').addEventListener('click', () => {
      this.bulkAssignToClass();
    });

    document.getElementById('bulkExportBtn').addEventListener('click', () => {
      this.bulkExportChildren();
    });

    document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
      this.bulkDeleteChildren();
    });
  },

  async loadChildrenForManagement() {
    const container = document.getElementById('childrenList');
    Utils.showLoading(container, 'Loading children...');

    const result = await Utils.apiRequest('/api/children?limit=100');

    if (!result.success) {
      Utils.showError(container, 'Failed to load children');
      return;
    }

    const children = result.data.data || [];
    
    if (children.length === 0) {
      Utils.showEmpty(container, 'No children registered');
      return;
    }

    this.allChildren = children;
    this.renderChildrenList(children);
  },

  renderChildrenList(children) {
    const container = document.getElementById('childrenList');
    
    container.innerHTML = children.map(child => `
      <div class="child-manage-item" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; background: white;">
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
          <input 
            type="checkbox" 
            class="child-checkbox" 
            data-child-id="${child.id}"
            style="width: 18px; height: 18px; cursor: pointer;"
            ${this.selectedChildren && this.selectedChildren.has(child.id) ? 'checked' : ''}
          >
          <div>
            <strong style="color: #1e293b; font-size: 1.1rem;">${child.first_name} ${child.last_name}</strong>
            <span style="color: #64748b; margin-left: 1rem; font-size: 0.9rem;">DOB: ${child.date_of_birth}</span>
            ${child.special_needs ? '<span style="margin-left: 1rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">Special Needs</span>' : ''}
          </div>
        </div>
        <button 
          class="btn-secondary manage-parents-btn" 
          data-child-id="${child.id}"
          data-child-name="${child.first_name} ${child.last_name}"
          style="white-space: nowrap;"
        >
          Manage Parents
        </button>
      </div>
    `).join('');
    
    // Attach event listeners to checkboxes
    document.querySelectorAll('.child-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const childId = e.target.getAttribute('data-child-id');
        if (e.target.checked) {
          this.selectedChildren.add(childId);
        } else {
          this.selectedChildren.delete(childId);
        }
        this.updateBulkActionsBar();
      });
    });

    // Attach event listeners to all Manage Parents buttons
    document.querySelectorAll('.manage-parents-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const childId = btn.getAttribute('data-child-id');
        const childName = btn.getAttribute('data-child-name');
        this.showParentLinkingModal(childId, childName);
      });
    });
  },

  filterChildrenList(query) {
    if (!this.allChildren) return;
    
    const filtered = this.allChildren.filter(child => 
      `${child.first_name} ${child.last_name}`.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderChildrenList(filtered);
  },

  updateBulkActionsBar() {
    const bulkBar = document.getElementById('bulkActionsBar');
    const countSpan = document.getElementById('selectedCount');
    const count = this.selectedChildren.size;

    if (count > 0) {
      bulkBar.style.display = 'block';
      countSpan.textContent = `${count} ${count === 1 ? 'child' : 'children'} selected`;
    } else {
      bulkBar.style.display = 'none';
    }
  },

  selectAllChildren() {
    if (!this.allChildren) return;
    
    this.allChildren.forEach(child => {
      this.selectedChildren.add(child.id);
    });
    
    document.querySelectorAll('.child-checkbox').forEach(cb => {
      cb.checked = true;
    });
    
    this.updateBulkActionsBar();
  },

  deselectAllChildren() {
    this.selectedChildren.clear();
    
    document.querySelectorAll('.child-checkbox').forEach(cb => {
      cb.checked = false;
    });
    
    this.updateBulkActionsBar();
  },

  async loadClassesForBulkActions() {
    const result = await Utils.apiRequest('/api/classes');
    
    if (result.success) {
      const select = document.getElementById('bulkClassSelect');
      const classes = result.data.data || [];
      
      classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        select.appendChild(option);
      });
    }
  },

  async bulkAssignToClass() {
    const classId = document.getElementById('bulkClassSelect').value;
    
    if (!classId) {
      Utils.showToast('Please select a class', 'error');
      return;
    }

    if (this.selectedChildren.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const confirmed = confirm(`Assign ${this.selectedChildren.size} children to this class?`);
    if (!confirmed) return;

    Utils.showToast('Assigning children...', 'info');

    let successCount = 0;
    let errorCount = 0;

    for (const childId of this.selectedChildren) {
      try {
        const result = await Utils.apiRequest('/api/classes/assign', {
          method: 'POST',
          body: { classId, childId }
        });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      Utils.showToast(`Successfully assigned ${successCount} children`, 'success');
    }
    
    if (errorCount > 0) {
      Utils.showToast(`Failed to assign ${errorCount} children`, 'error');
    }

    // Clear selection
    this.deselectAllChildren();
  },

  bulkExportChildren() {
    if (this.selectedChildren.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const selectedData = this.allChildren.filter(child => 
      this.selectedChildren.has(child.id)
    );

    // Create CSV
    const headers = ['First Name', 'Last Name', 'Date of Birth', 'Gender', 'Special Needs', 'Allergies', 'Medical Notes'];
    const rows = selectedData.map(child => [
      child.first_name || '',
      child.last_name || '',
      child.date_of_birth || '',
      child.gender || '',
      child.special_needs ? 'Yes' : 'No',
      child.allergies || '',
      child.medical_notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-children-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Utils.showToast(`Exported ${this.selectedChildren.size} children`, 'success');
  },

  async bulkDeleteChildren() {
    if (this.selectedChildren.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING: This will permanently delete ${this.selectedChildren.size} children and all their related data.\n\n` +
      `This action cannot be undone. Are you sure?`
    );
    
    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirm = confirm(
      `Please confirm again: Delete ${this.selectedChildren.size} children permanently?`
    );
    
    if (!doubleConfirm) return;

    Utils.showToast('Deleting children...', 'info');

    let successCount = 0;
    let errorCount = 0;

    for (const childId of this.selectedChildren) {
      try {
        const result = await Utils.apiRequest(`/api/children/${childId}`, {
          method: 'DELETE'
        });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      Utils.showToast(`Successfully deleted ${successCount} children`, 'success');
    }
    
    if (errorCount > 0) {
      Utils.showToast(`Failed to delete ${errorCount} children`, 'error');
    }

    // Reload the list
    await this.loadChildrenForManagement();
    this.deselectAllChildren();
  },

  // Tab-specific bulk action methods
  updateBulkActionsBarTab() {
    const bulkBar = document.getElementById('bulkActionsBarTab');
    const countSpan = document.getElementById('selectedCountTab');
    const count = this.selectedChildrenTab ? this.selectedChildrenTab.size : 0;

    if (count > 0) {
      bulkBar.style.display = 'block';
      countSpan.textContent = `${count} ${count === 1 ? 'child' : 'children'} selected`;
    } else {
      bulkBar.style.display = 'none';
    }
  },

  selectAllChildrenTab() {
    if (!this.currentChildren) return;
    
    this.currentChildren.forEach(child => {
      this.selectedChildrenTab.add(child.id);
    });
    
    document.querySelectorAll('.child-checkbox-tab').forEach(cb => {
      cb.checked = true;
    });
    
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = true;
    
    this.updateBulkActionsBarTab();
  },

  deselectAllChildrenTab() {
    this.selectedChildrenTab.clear();
    
    document.querySelectorAll('.child-checkbox-tab').forEach(cb => {
      cb.checked = false;
    });
    
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    
    this.updateBulkActionsBarTab();
  },

  async loadClassesForBulkActionsTab() {
    const result = await Utils.apiRequest('/api/classes');
    
    if (result.success) {
      const select = document.getElementById('bulkClassSelectTab');
      if (!select) return;
      
      const classes = result.data.data || [];
      
      classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        select.appendChild(option);
      });
    }
  },

  async bulkAssignToClassTab() {
    const classId = document.getElementById('bulkClassSelectTab').value;
    
    if (!classId) {
      Utils.showToast('Please select a class', 'error');
      return;
    }

    if (this.selectedChildrenTab.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const confirmed = confirm(`Assign ${this.selectedChildrenTab.size} children to this class?`);
    if (!confirmed) return;

    Utils.showToast('Assigning children...', 'info');

    let successCount = 0;
    let errorCount = 0;

    for (const childId of this.selectedChildrenTab) {
      try {
        const result = await Utils.apiRequest('/api/classes/assign', {
          method: 'POST',
          body: { classId, childId }
        });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      Utils.showToast(`Successfully assigned ${successCount} children`, 'success');
    }
    
    if (errorCount > 0) {
      Utils.showToast(`Failed to assign ${errorCount} children`, 'error');
    }

    // Clear selection
    this.deselectAllChildrenTab();
  },

  bulkExportChildrenTab() {
    if (this.selectedChildrenTab.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const selectedData = this.currentChildren.filter(child => 
      this.selectedChildrenTab.has(child.id)
    );

    // Create CSV
    const headers = ['First Name', 'Last Name', 'Date of Birth', 'Gender', 'Special Needs', 'Allergies', 'Medical Notes'];
    const rows = selectedData.map(child => [
      child.first_name || '',
      child.last_name || '',
      child.date_of_birth || '',
      child.gender || '',
      child.special_needs ? 'Yes' : 'No',
      child.allergies || '',
      child.medical_notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-children-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Utils.showToast(`Exported ${this.selectedChildrenTab.size} children`, 'success');
  },

  async bulkArchiveChildrenTab() {
    if (this.selectedChildrenTab.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const reason = prompt(`Why are you archiving ${this.selectedChildrenTab.size} children?\n\n(e.g., moved away, switched churches, etc.)`);
    if (reason === null) return; // User cancelled

    Utils.showToast('Archiving children...', 'info');

    let successCount = 0;
    let errorCount = 0;

    for (const childId of this.selectedChildrenTab) {
      try {
        const result = await Utils.apiRequest(`/api/children/${childId}/archive`, {
          method: 'POST',
          body: { reason: reason || 'No reason provided' }
        });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      Utils.showToast(`Successfully archived ${successCount} children`, 'success');
    }
    
    if (errorCount > 0) {
      Utils.showToast(`Failed to archive ${errorCount} children`, 'error');
    }

    // Reload the table and clear selection
    await this.loadChildrenTable();
    this.deselectAllChildrenTab();
  },

  async bulkDeleteChildrenTab() {
    if (this.selectedChildrenTab.size === 0) {
      Utils.showToast('No children selected', 'error');
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING: This will permanently delete ${this.selectedChildrenTab.size} children and all their related data.\n\n` +
      `This action cannot be undone. Are you sure?`
    );
    
    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirm = confirm(
      `Please confirm again: Delete ${this.selectedChildrenTab.size} children permanently?`
    );
    
    if (!doubleConfirm) return;

    Utils.showToast('Deleting children...', 'info');

    let successCount = 0;
    let errorCount = 0;

    for (const childId of this.selectedChildrenTab) {
      try {
        const result = await Utils.apiRequest(`/api/children/${childId}`, {
          method: 'DELETE'
        });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      Utils.showToast(`Successfully deleted ${successCount} children`, 'success');
    }
    
    if (errorCount > 0) {
      Utils.showToast(`Failed to delete ${errorCount} children`, 'error');
    }

    // Reload the table and clear selection
    await this.loadChildrenTable();
    this.deselectAllChildrenTab();
  },

  async showParentLinkingModal(childId, childName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2>Manage Parents for ${childName}</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Linked Parents/Guardians</h3>
          <div id="linkedParents">Loading...</div>
        </div>

        <div>
          <h3 style="margin-bottom: 1rem;">Link New Parent/Guardian</h3>
          <form id="linkParentForm" class="form">
            <div class="form-group">
              <label>Select Parent <span class="required">*</span></label>
              <select id="parentSelect" required>
                <option value="">Loading parents...</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Relationship Type <span class="required">*</span></label>
              <select id="relationshipType" required>
                <option value="">Select relationship...</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" id="authorizedPickup" checked>
                <span>Authorized for pickup</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">Link Parent</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Load linked parents and available parents
    await Promise.all([
      this.loadLinkedParents(childId),
      this.loadAvailableParents()
    ]);

    // Handle form submission
    document.getElementById('linkParentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.linkParentToChild(childId, childName);
    });
  },

  async loadLinkedParents(childId) {
    const container = document.getElementById('linkedParents');
    Utils.showLoading(container, 'Loading linked parents...');

    // Get relationships for this child
    const result = await Utils.apiRequest(`/api/parents`);
    
    if (!result.success) {
      Utils.showError(container, 'Failed to load parents');
      return;
    }

    const allParents = result.data;
    
    // Get all relationships and filter for this child
    const relResult = await Utils.apiRequest(`/api/children/${childId}`);
    
    if (!relResult.success) {
      Utils.showEmpty(container, 'No parents linked yet');
      return;
    }

    // Fetch parent-child relationships via a custom query
    // Since we don't have a direct endpoint, we'll query through parent's children endpoint
    const linkedParentsData = [];
    
    for (const parent of allParents) {
      const childrenResult = await Utils.apiRequest(`/api/parents/${parent.id}/children`);
      if (childrenResult.success) {
        const hasChild = childrenResult.data.some(rel => rel.child_id === childId);
        if (hasChild) {
          const rel = childrenResult.data.find(r => r.child_id === childId);
          linkedParentsData.push({
            ...parent,
            relationship_type: rel.relationship_type,
            is_authorized_pickup: rel.is_authorized_pickup
          });
        }
      }
    }

    if (linkedParentsData.length === 0) {
      Utils.showEmpty(container, 'No parents linked yet');
      return;
    }

    container.innerHTML = linkedParentsData.map(parent => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${parent.first_name} ${parent.last_name}</strong>
          <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
            <span>${parent.relationship_type || 'Guardian'}</span>
            ${parent.phone_number ? ` • ${parent.phone_number}` : ''}
            ${parent.is_authorized_pickup ? ' • <span style="color: #10b981;">✓ Authorized Pickup</span>' : ''}
          </div>
        </div>
        <button 
          class="btn-secondary unlink-parent-btn" 
          style="background: #fee2e2; color: #991b1b;"
          data-parent-id="${parent.id}"
          data-child-id="${childId}"
        >
          Unlink
        </button>
      </div>
    `).join('');
    
    // Attach event listeners to all Unlink buttons
    setTimeout(() => {
      document.querySelectorAll('.unlink-parent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const parentId = btn.getAttribute('data-parent-id');
          const childId = btn.getAttribute('data-child-id');
          this.unlinkParent(parentId, childId);
        });
      });
    }, 0);
  },

  async loadAvailableParents() {
    const select = document.getElementById('parentSelect');
    
    const result = await Utils.apiRequest('/api/parents');
    
    if (!result.success) {
      select.innerHTML = '<option value="">Failed to load parents</option>';
      return;
    }

    const parents = result.data;
    
    if (parents.length === 0) {
      select.innerHTML = '<option value="">No parents available - register one first</option>';
      return;
    }

    select.innerHTML = '<option value="">Select a parent...</option>' +
      parents.map(parent => `
        <option value="${parent.id}">
          ${parent.first_name} ${parent.last_name} ${parent.phone_number ? `(${parent.phone_number})` : ''}
        </option>
      `).join('');
  },

  async linkParentToChild(childId, childName) {
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const parentId = document.getElementById('parentSelect').value;
    const relationshipType = document.getElementById('relationshipType').value;
    const isAuthorizedPickup = document.getElementById('authorizedPickup').checked;

    if (!parentId) {
      Utils.showToast('Please select a parent', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Linking...';

    const result = await Utils.apiRequest(`/api/parents/${parentId}/children/${childId}`, {
      method: 'POST',
      body: JSON.stringify({
        relationship_type: relationshipType,
        is_authorized_pickup: isAuthorizedPickup
      })
    });

    if (result.success) {
      Utils.showToast('Parent linked successfully!', 'success');
      // Reload the linked parents list
      await this.loadLinkedParents(childId);
      // Reset form
      document.getElementById('linkParentForm').reset();
    } else {
      Utils.showToast(`Failed to link parent: ${result.error}`, 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Link Parent';
  },

  async unlinkParent(parentId, childId) {
    if (!confirm('Are you sure you want to unlink this parent?')) {
      return;
    }

    const result = await Utils.apiRequest(`/api/parents/${parentId}/children/${childId}`, {
      method: 'DELETE'
    });

    if (result.success) {
      Utils.showToast('Parent unlinked successfully!', 'success');
      // Reload the linked parents list
      await this.loadLinkedParents(childId);
    } else {
      Utils.showToast(`Failed to unlink parent: ${result.error}`, 'error');
    }
  },

  startAutoRefresh() {
    // Clear existing interval if any
    this.stopAutoRefresh();

    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      const activeTab = document.querySelector('.nav-tab.active');
      if (activeTab && activeTab.dataset.view === 'overview') {
        this.loadDashboardStats();
        // loadRecentCheckIns removed - Recent Check-ins section no longer exists
      }
    }, 30000); // 30 seconds
  },

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  // Create Class Modal
  showCreateClassModal() {
    console.log('[MODAL] showCreateClassModal() called');
    try {
      const modal = document.createElement('div');
      console.log('[MODAL] Created modal div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
          <h3>Create New Classroom</h3>
          <form id="createClassForm" class="form-section">
            <div class="form-group">
              <label for="className">Classroom Name *</label>
              <input type="text" id="className" required placeholder="e.g., Toddlers Room A">
            </div>
            
            <div class="form-group">
              <label for="classType">Type *</label>
              <select id="classType" required>
                <option value="">Select type...</option>
                <option value="regular">Regular Class</option>
                <option value="ftv">First Time Visitors</option>
                <option value="special">Special Needs</option>
                <option value="event">Special Event</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="classLogoUrl">Logo/Image URL</label>
              <input type="url" id="classLogoUrl" placeholder="https://example.com/logo.jpg">
              <small style="color: #6b7280; font-size: 0.875rem;">Enter a URL to an image for this classroom</small>
            </div>
            
            <div class="form-group">
              <label for="classAgeRange">Age Range</label>
              <input type="text" id="classAgeRange" placeholder="e.g., 2-4 years">
            </div>
            
            <div class="form-group">
              <label for="classCapacity">Maximum Capacity</label>
              <input type="number" id="classCapacity" min="1" placeholder="e.g., 20">
            </div>
            
            <div class="form-group">
              <label for="classRoomNumber">Room Number</label>
              <input type="text" id="classRoomNumber" placeholder="e.g., 101">
            </div>
            
            <div class="form-group">
              <label for="classRoomLocation">Room Location</label>
              <input type="text" id="classRoomLocation" placeholder="e.g., Building A, First Floor">
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">Create Classroom</button>
              <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            </div>
          </form>
        </div>
      `;
      
      console.log('[MODAL] About to append modal to body');
      document.body.appendChild(modal);
      console.log('[MODAL] Modal appended successfully');
      
      const form = document.getElementById('createClassForm');
      console.log('[MODAL] Found form:', form);
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.createClass(modal);
      });
      console.log('[MODAL] Form submit listener attached');
    } catch (error) {
      console.error('[MODAL ERROR]', error);
      alert('Error opening modal: ' + error.message);
    }
  },

  async createClass(modal) {
    const form = document.getElementById('createClassForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const classData = {
      name: document.getElementById('className').value,
      type: document.getElementById('classType').value,
      logo_url: document.getElementById('classLogoUrl').value || null,
      age_range: document.getElementById('classAgeRange').value || null,
      capacity: parseInt(document.getElementById('classCapacity').value) || null,
      room_number: document.getElementById('classRoomNumber').value || null,
      room_location: document.getElementById('classRoomLocation').value || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    const result = await Utils.apiRequest('/api/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });

    if (result.success) {
      Utils.showToast('Classroom created successfully!', 'success');
      modal.remove();
      // Reload classroom list
      const content = document.getElementById('dashboardContent');
      if (content) {
        await this.loadClassroomSelection(content);
      }
    } else {
      Utils.showToast(`Failed to create classroom: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Classroom';
    }
  },

  async deleteClass(classId, className) {
    if (!confirm(`Are you sure you want to delete "${className}"?\n\nThis action cannot be undone. All check-in history for this class will be preserved.`)) {
      return;
    }

    const result = await Utils.apiRequest(`/api/classes/${classId}`, {
      method: 'DELETE'
    });

    if (result.success) {
      Utils.showToast('Classroom deleted successfully!', 'success');
      // Reload classroom list
      const content = document.getElementById('dashboardContent');
      if (content) {
        await this.loadClassroomSelection(content);
      }
    } else {
      Utils.showToast(`Failed to delete classroom: ${result.error || result.message}`, 'error');
    }
  },

  async showEditClassModal(classId) {
    // Fetch current class data
    const result = await Utils.apiRequest(`/api/classes/${classId}`);
    
    if (!result.success) {
      Utils.showToast('Failed to load classroom data', 'error');
      return;
    }

    const classData = result.data;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <h3>Edit Classroom</h3>
        <form id="editClassForm" class="form-section">
          <div class="form-group">
            <label for="editClassName">Classroom Name *</label>
            <input type="text" id="editClassName" required placeholder="e.g., Toddlers Room A" value="${classData.name || ''}">
          </div>
          
          <div class="form-group">
            <label for="editClassType">Type *</label>
            <select id="editClassType" required>
              <option value="">Select type...</option>
              <option value="regular" ${classData.type === 'regular' ? 'selected' : ''}>Regular Class</option>
              <option value="ftv" ${classData.type === 'ftv' ? 'selected' : ''}>First Time Visitors</option>
              <option value="special" ${classData.type === 'special' ? 'selected' : ''}>Special Needs</option>
              <option value="event" ${classData.type === 'event' ? 'selected' : ''}>Special Event</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="editClassLogoUrl">Logo/Image URL</label>
            <input type="url" id="editClassLogoUrl" placeholder="https://example.com/logo.jpg" value="${classData.logo_url || ''}">
            <small style="color: #6b7280; font-size: 0.875rem;">Enter a URL to an image for this classroom</small>
          </div>
          
          <div class="form-group">
            <label for="editClassDescription">Description</label>
            <textarea id="editClassDescription" placeholder="Description" rows="3">${classData.description || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label for="editClassCapacity">Maximum Capacity</label>
            <input type="number" id="editClassCapacity" min="1" placeholder="e.g., 20" value="${classData.capacity || ''}">
          </div>
          
          <div class="form-group">
            <label for="editClassRoomLocation">Room Location</label>
            <input type="text" id="editClassRoomLocation" placeholder="e.g., Building A, First Floor" value="${classData.room_location || ''}">
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Update Classroom</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = document.getElementById('editClassForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.updateClass(classId, modal);
    });
  },

  async updateClass(classId, modal) {
    const form = document.getElementById('editClassForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const classData = {
      name: document.getElementById('editClassName').value,
      type: document.getElementById('editClassType').value,
      logo_url: document.getElementById('editClassLogoUrl').value || null,
      description: document.getElementById('editClassDescription').value || null,
      capacity: parseInt(document.getElementById('editClassCapacity').value) || null,
      room_location: document.getElementById('editClassRoomLocation').value || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    const result = await Utils.apiRequest(`/api/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(classData)
    });

    if (result.success) {
      Utils.showToast('Classroom updated successfully!', 'success');
      modal.remove();
      // Reload classroom list
      const content = document.getElementById('dashboardContent');
      if (content) {
        await this.loadClassroomSelection(content);
      }
    } else {
      Utils.showToast(`Failed to update classroom: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Classroom';
    }
  },

  // Child Management View
  async loadChildManagement(content) {
    content.innerHTML = `
      <div class="child-management-section">
        <div class="section-header" style="margin-bottom: 1.5rem;">
          <div>
            <h2 style="margin: 0 0 0.25rem 0;">Child Management</h2>
            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">View, search, and manage all registered children</p>
          </div>
          <button class="btn-primary" id="addNewChildBtn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 0.5rem;">
              <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Add New Child
          </button>
        </div>

        <div class="management-filters" style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <div style="flex: 1; min-width: 250px;">
            <input type="text" id="childSearchBox" placeholder="Search by name..." 
                   style="width: 100%; padding: 0.625rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem;">
          </div>
          
          <select id="inactivityFilter" style="padding: 0.625rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; background: white;">
            <option value="">All Children</option>
            <option value="30">Inactive 30+ days</option>
            <option value="60">Inactive 60+ days</option>
            <option value="90">Inactive 90+ days</option>
          </select>

          <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
            <input type="checkbox" id="showArchived" style="width: 16px; height: 16px; cursor: pointer;">
            <span style="font-size: 0.95rem; color: #374151;">Show Archived</span>
          </label>

          <button id="selectAllChildrenBtn" class="btn-secondary" style="white-space: nowrap;">Select All</button>
          <button id="deselectAllChildrenBtn" class="btn-secondary" style="white-space: nowrap;">Deselect All</button>
        </div>

        <div id="bulkActionsBarTab" style="display: none; padding: 1rem; background: #f0fdfa; border: 2px solid #14b8a6; border-radius: 8px; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <span id="selectedCountTab" style="font-weight: 600; color: #0f766e;">0 children selected</span>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <select id="bulkClassSelectTab" class="form-control" style="width: auto; min-width: 150px;">
                <option value="">Assign to Class...</option>
              </select>
              <button id="bulkAssignBtnTab" class="btn-primary" style="white-space: nowrap;">Assign Selected</button>
              <button id="bulkExportBtnTab" class="btn-secondary" style="white-space: nowrap;">Export Selected</button>
              <button id="bulkArchiveBtnTab" class="btn-secondary" style="white-space: nowrap;">Archive Selected</button>
              <button id="bulkDeleteBtnTab" class="btn-danger" style="white-space: nowrap; background: #dc2626; color: white;">Delete Selected</button>
            </div>
          </div>
        </div>
        
        <div id="childManagementStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <!-- Stats will be loaded here -->
        </div>

        <div id="childManagementTable" class="management-table-container" style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: center; padding: 3rem; color: #6b7280;">
            <div style="text-align: center;">
              <div class="spinner" style="margin: 0 auto 1rem;"></div>
              <p>Loading children...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    setTimeout(() => {
      const addNewChildBtn = document.getElementById('addNewChildBtn');
      const searchBox = document.getElementById('childSearchBox');
      const archivedCheckbox = document.getElementById('showArchived');
      const inactivityFilter = document.getElementById('inactivityFilter');

      if (addNewChildBtn) {
        addNewChildBtn.addEventListener('click', () => this.showChildRegistrationModal());
      }

      if (searchBox) {
        searchBox.addEventListener('input', () => this.filterChildrenTable());
      }
      
      if (archivedCheckbox) {
        archivedCheckbox.addEventListener('change', () => this.loadChildrenTable());
      }
      
      if (inactivityFilter) {
        inactivityFilter.addEventListener('change', () => this.loadChildrenTable());
      }

      // Bulk action buttons
      const selectAllBtn = document.getElementById('selectAllChildrenBtn');
      const deselectAllBtn = document.getElementById('deselectAllChildrenBtn');
      const bulkAssignBtn = document.getElementById('bulkAssignBtnTab');
      const bulkExportBtn = document.getElementById('bulkExportBtnTab');
      const bulkArchiveBtn = document.getElementById('bulkArchiveBtnTab');
      const bulkDeleteBtn = document.getElementById('bulkDeleteBtnTab');

      if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => this.selectAllChildrenTab());
      }
      if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => this.deselectAllChildrenTab());
      }
      if (bulkAssignBtn) {
        bulkAssignBtn.addEventListener('click', () => this.bulkAssignToClassTab());
      }
      if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', () => this.bulkExportChildrenTab());
      }
      if (bulkArchiveBtn) {
        bulkArchiveBtn.addEventListener('click', () => this.bulkArchiveChildrenTab());
      }
      if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteChildrenTab());
      }
    }, 0);

    // Initialize selected children set for tab
    this.selectedChildrenTab = new Set();

    await this.loadChildrenTable();
    await this.loadClassesForBulkActionsTab();
  },

  async loadChildrenTable() {
    const container = document.getElementById('childManagementTable');
    const statsContainer = document.getElementById('childManagementStats');
    const showArchived = document.getElementById('showArchived')?.checked;
    const inactivityDays = document.getElementById('inactivityFilter')?.value;
    
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; padding: 3rem; color: #6b7280;">
        <div style="text-align: center;">
          <div class="spinner" style="margin: 0 auto 1rem;"></div>
          <p>Loading children...</p>
        </div>
      </div>
    `;

    try {
      let result;
      if (inactivityDays) {
        result = await Utils.apiRequest(`/api/children/inactive/${inactivityDays}`);
      } else {
        result = await Utils.apiRequest(`/api/children?limit=1000&include_archived=${showArchived}`);
      }

      if (!result.success) {
        container.innerHTML = `
          <div style="padding: 3rem; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #ef4444;">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">Failed to load children</p>
            <p style="color: #6b7280; font-size: 0.9rem;">${result.error || 'Unknown error occurred'}</p>
            <button class="btn-secondary" onclick="DashboardNav.loadChildrenTable()" style="margin-top: 1rem;">Try Again</button>
          </div>
        `;
        return;
      }

      // Handle different response formats
      let children = [];
      if (Array.isArray(result.data)) {
        children = result.data;
      } else if (result.data && Array.isArray(result.data.children)) {
        children = result.data.children;
      } else if (result.data && typeof result.data === 'object') {
        // If data is an object, try to extract an array from it
        const possibleArrays = Object.values(result.data).filter(v => Array.isArray(v));
        if (possibleArrays.length > 0) {
          children = possibleArrays[0];
        }
      }

      // Ensure children is an array
      if (!Array.isArray(children)) {
        console.error('Invalid data format received:', result);
        container.innerHTML = `
          <div style="padding: 3rem; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #ef4444;">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">Invalid data format</p>
            <p style="color: #6b7280; font-size: 0.9rem;">The server returned an unexpected data format</p>
            <button class="btn-secondary" onclick="DashboardNav.loadChildrenTable()" style="margin-top: 1rem;">Try Again</button>
          </div>
        `;
        return;
      }
      
      // Calculate stats
      const now = new Date();
      const stats = {
        total: children.length,
        active: 0,
        inactive30: 0,
        inactive60: 0,
        inactive90: 0,
        neverCheckedIn: 0,
        archived: 0
      };

      children.forEach(child => {
        if (child.is_archived) {
          stats.archived++;
        } else if (!child.last_check_in) {
          stats.neverCheckedIn++;
        } else {
          const lastCheckin = new Date(child.last_check_in);
          const daysSince = Math.floor((now - lastCheckin) / (24 * 60 * 60 * 1000));
          
          if (daysSince > 90) stats.inactive90++;
          else if (daysSince > 60) stats.inactive60++;
          else if (daysSince > 30) stats.inactive30++;
          else stats.active++;
        }
      });

      // Display stats
      if (statsContainer && !inactivityDays) {
        statsContainer.innerHTML = `
          <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Total Children</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: #111827;">${stats.total}</div>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Active</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: #10b981;">${stats.active}</div>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Never Checked In</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: #f59e0b;">${stats.neverCheckedIn}</div>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">Inactive 90+ days</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: #ef4444;">${stats.inactive90}</div>
          </div>
        `;
      }

      if (children.length === 0) {
        container.innerHTML = `
          <div style="padding: 3rem; text-align: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #9ca3af;">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;">No children found</p>
            <p style="color: #9ca3af; font-size: 0.9rem;">Try adjusting your filters or add a new child</p>
          </div>
        `;
        return;
      }
      
      // Store children for later use
      this.currentChildren = children;
      
      container.innerHTML = `
        <div style="overflow-x: auto;">
          <table class="modern-table" id="childrenTable" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 0.75rem 1rem; text-align: center; font-weight: 600; color: #374151; font-size: 0.85rem; width: 40px;">
                  <input type="checkbox" id="selectAllCheckbox" style="width: 18px; height: 18px; cursor: pointer;">
                </th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">#</th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">Name</th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">Parents</th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">Date of Birth</th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">Age</th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">Last Check-in</th>
                <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.85rem;">Status</th>
                <th style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; color: #374151; font-size: 0.85rem;">Actions</th>
              </tr>
            </thead>
            <tbody id="childrenTableBody">
              ${children.map((child, idx) => {
                const dob = child.date_of_birth ? new Date(child.date_of_birth) : null;
                const age = dob ? Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A';
                const lastCheckin = child.last_check_in ? new Date(child.last_check_in) : null;
                const daysSinceCheckin = lastCheckin ? Math.floor((now - lastCheckin) / (24 * 60 * 60 * 1000)) : null;
                
                let statusBadge = '';
                let statusColor = '';
                
                if (child.is_archived) {
                  statusBadge = 'Archived';
                  statusColor = '#6b7280';
                } else if (!lastCheckin) {
                  statusBadge = 'Never Checked In';
                  statusColor = '#f59e0b';
                } else if (daysSinceCheckin > 90) {
                  statusBadge = `Inactive ${daysSinceCheckin}d`;
                  statusColor = '#ef4444';
                } else if (daysSinceCheckin > 60) {
                  statusBadge = `Inactive ${daysSinceCheckin}d`;
                  statusColor = '#f97316';
                } else if (daysSinceCheckin > 30) {
                  statusBadge = `Inactive ${daysSinceCheckin}d`;
                  statusColor = '#f59e0b';
                } else {
                  statusBadge = 'Active';
                  statusColor = '#10b981';
                }
                
                const lastCheckinText = lastCheckin 
                  ? lastCheckin.toLocaleDateString()
                  : 'Never';
                
                return `
                  <tr data-child-id="${child.id}" data-child-name="${child.first_name} ${child.last_name}" 
                      style="border-bottom: 1px solid #f3f4f6; transition: background-color 0.15s;"
                      onmouseover="this.style.backgroundColor='#f9fafb'" 
                      onmouseout="this.style.backgroundColor='white'">
                    <td style="padding: 1rem; text-align: center;">
                      <input type="checkbox" class="child-checkbox-tab" data-child-id="${child.id}" 
                             style="width: 18px; height: 18px; cursor: pointer;"
                             ${this.selectedChildrenTab && this.selectedChildrenTab.has(child.id) ? 'checked' : ''}>
                    </td>
                    <td style="padding: 1rem; color: #6b7280; font-size: 0.9rem;">${idx + 1}</td>
                    <td style="padding: 1rem;">
                      <div style="font-weight: 600; color: #111827;">${child.first_name} ${child.last_name}</div>
                      ${child.special_needs ? '<div style="font-size: 0.75rem; color: #8b5cf6; margin-top: 0.25rem;">⭐ Special Needs</div>' : ''}
                    </td>
                    <td style="padding: 1rem; color: #6b7280; font-size: 0.9rem;" id="parents-cell-${child.id}">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
                        <span style="font-size: 0.85rem;">Loading...</span>
                      </div>
                    </td>
                    <td style="padding: 1rem; color: #6b7280; font-size: 0.9rem;">${dob ? dob.toLocaleDateString() : 'N/A'}</td>
                    <td style="padding: 1rem; color: #6b7280; font-size: 0.9rem;">${age} ${age !== 'N/A' ? 'years' : ''}</td>
                    <td style="padding: 1rem; color: #6b7280; font-size: 0.9rem;">${lastCheckinText}</td>
                    <td style="padding: 1rem;">
                      <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: white; background: ${statusColor};">
                        ${statusBadge}
                      </span>
                    </td>
                    <td style="padding: 1rem; text-align: right;">
                      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn-icon manage-parents-btn" title="Manage Parents" data-child-id="${child.id}" data-child-name="${child.first_name} ${child.last_name}">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10.6667 14V12.6667C10.6667 11.9594 10.3857 11.2811 9.88562 10.781C9.38552 10.281 8.70725 10 8 10H3.33333C2.62609 10 1.94781 10.281 1.44772 10.781C0.947633 11.2811 0.666666 11.9594 0.666666 12.6667V14M13.3333 5.33333V9.33333M15.3333 7.33333H11.3333M8.16667 4.66667C8.16667 6.13943 6.97276 7.33333 5.5 7.33333C4.02724 7.33333 2.83333 6.13943 2.83333 4.66667C2.83333 3.19391 4.02724 2 5.5 2C6.97276 2 8.16667 3.19391 8.16667 4.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button class="btn-icon info-btn" title="View Details" data-id="${child.id}">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 7.33334V11.3333M8 5.33334H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33334 11.6819 1.33334 8C1.33334 4.3181 4.3181 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.3181 14.6667 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button class="btn-icon child-edit-btn" title="Edit Child" data-id="${child.id}">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.66634 14.3334L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        ${child.is_archived 
                          ? `<button class="btn-icon unarchive-btn" title="Unarchive" data-id="${child.id}">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2.66666 5.33334V13.3333C2.66666 13.687 2.80714 14.0261 3.05719 14.2762C3.30724 14.5262 3.64638 14.6667 4 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2762C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V5.33334M10.6667 8L8 5.33334M8 5.33334L5.33333 8M8 5.33334V10.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            </button>`
                          : `<button class="btn-icon archive-btn" title="Archive" data-id="${child.id}">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2.66666 5.33334H13.3333M2.66666 5.33334V13.3333C2.66666 13.687 2.80714 14.0261 3.05719 14.2762C3.30724 14.5262 3.64638 14.6667 4 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2762C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V5.33334M2.66666 5.33334L4 1.33334H12L13.3333 5.33334M6.66666 8V11.3333M9.33333 8V11.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            </button>`
                        }
                        <button class="btn-icon btn-icon-danger delete-btn" title="Delete" data-id="${child.id}">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H3.33333H14M5.33333 4V2.66667C5.33333 2.48986 5.40357 2.32029 5.5286 2.19526C5.65362 2.07024 5.82319 2 6 2H10C10.1768 2 10.3464 2.07024 10.4714 2.19526C10.5964 2.32029 10.6667 2.48986 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.5101 12.5964 13.6797 12.4714 13.8047C12.3464 13.9298 12.1768 14 12 14H4C3.82319 14 3.65362 13.9298 3.5286 13.8047C3.40357 13.6797 3.33333 13.5101 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.attachChildManagementActions();
    } catch (error) {
      console.error('Error loading children:', error);
      container.innerHTML = `
        <div style="padding: 3rem; text-align: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 1rem; color: #ef4444;">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">Error Loading Children</p>
          <p style="color: #6b7280; font-size: 0.9rem;">${error.message || 'An unexpected error occurred'}</p>
          <button class="btn-secondary" onclick="DashboardNav.loadChildrenTable()" style="margin-top: 1rem;">Try Again</button>
        </div>
      `;
    }
  },

  attachChildManagementActions() {
    const archiveBtns = document.querySelectorAll('.archive-btn');
    const unarchiveBtns = document.querySelectorAll('.unarchive-btn');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const infoBtns = document.querySelectorAll('.info-btn');
    const editBtns = document.querySelectorAll('.child-edit-btn');
    const manageParentsBtns = document.querySelectorAll('.manage-parents-btn');

    archiveBtns.forEach(btn => {
      btn.addEventListener('click', () => this.archiveChild(btn.dataset.id));
    });

    unarchiveBtns.forEach(btn => {
      btn.addEventListener('click', () => this.unarchiveChild(btn.dataset.id));
    });

    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => this.deleteChild(btn.dataset.id));
    });

    editBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await Utils.apiRequest(`/api/children/${btn.dataset.id}`);
        if (result.success) {
          this.showEditChildModal(result.data);
        }
      });
    });

    infoBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await Utils.apiRequest(`/api/children/${btn.dataset.id}`);
        if (result.success) {
          this.showChildDetailsModal(result.data);
        }
      });
    });

    manageParentsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const childId = btn.dataset.childId;
        const childName = btn.dataset.childName;
        this.showParentLinkingModal(childId, childName);
      });
    });

    // Attach checkbox event listeners
    const checkboxes = document.querySelectorAll('.child-checkbox-tab');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const childId = e.target.getAttribute('data-child-id');
        if (e.target.checked) {
          this.selectedChildrenTab.add(childId);
        } else {
          this.selectedChildrenTab.delete(childId);
        }
        this.updateBulkActionsBarTab();
      });
    });

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        checkboxes.forEach(cb => {
          cb.checked = isChecked;
          const childId = cb.getAttribute('data-child-id');
          if (isChecked) {
            this.selectedChildrenTab.add(childId);
          } else {
            this.selectedChildrenTab.delete(childId);
          }
        });
        this.updateBulkActionsBarTab();
      });
    }

    // Load parents for all children
    this.loadParentsForChildren();
  },

  async archiveChild(childId) {
    const row = document.querySelector(`tr[data-child-id="${childId}"]`);
    const childName = row?.dataset.childName || 'this child';
    
    const reason = prompt(`Why are you archiving ${childName}?\n\n(e.g., moved away, switched churches, etc.)`);
    if (reason === null) return; // User cancelled

    const result = await Utils.apiRequest(`/api/children/${childId}/archive`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'No reason provided' })
    });

    if (result.success) {
      Utils.showToast('Child archived successfully!', 'success');
      await this.loadChildrenTable();
    } else {
      Utils.showToast(`Failed to archive child: ${result.error}`, 'error');
    }
  },

  async loadParentsForChildren() {
    // Get all children from the currentChildren array
    if (!this.currentChildren || this.currentChildren.length === 0) {
      return;
    }

    // Fetch parents for each child in parallel
    const parentsPromises = this.currentChildren.map(child => 
      Utils.apiRequest(`/api/children/${child.id}/parents`)
    );

    try {
      const parentsResults = await Promise.all(parentsPromises);
      
      // Update each parent cell
      this.currentChildren.forEach((child, index) => {
        const cell = document.getElementById(`parents-cell-${child.id}`);
        if (!cell) return;

        const result = parentsResults[index];
        
        // Check if request was successful and extract the data array
        if (result && result.success && result.data) {
          const parentsData = result.data;
          
          if (Array.isArray(parentsData) && parentsData.length > 0) {
            const parentNames = parentsData.map(rel => {
              const parent = rel.parents;
              const relationshipBadge = rel.relationship_type 
                ? `<span style="font-size: 0.7rem; color: #6b7280; margin-left: 0.25rem;">(${rel.relationship_type})</span>`
                : '';
              return `${parent.first_name} ${parent.last_name}${relationshipBadge}`;
            }).join('<br>');
            
            cell.innerHTML = `
              <div style="font-size: 0.85rem; line-height: 1.4;">
                ${parentNames}
              </div>
            `;
          } else {
            cell.innerHTML = `<span style="color: #9ca3af; font-size: 0.85rem; font-style: italic;">No parents linked</span>`;
          }
        } else {
          cell.innerHTML = `<span style="color: #9ca3af; font-size: 0.85rem; font-style: italic;">No parents linked</span>`;
        }
      });
    } catch (error) {
      console.error('Error loading parents:', error);
      // If there's an error, just show a placeholder
      this.currentChildren.forEach(child => {
        const cell = document.getElementById(`parents-cell-${child.id}`);
        if (cell) {
          cell.innerHTML = `<span style="color: #9ca3af; font-size: 0.85rem;">-</span>`;
        }
      });
    }
  },


  async unarchiveChild(childId) {
    const result = await Utils.apiRequest(`/api/children/${childId}/unarchive`, {
      method: 'POST'
    });

    if (result.success) {
      Utils.showToast('Child unarchived successfully!', 'success');
      await this.loadChildrenTable();
    } else {
      Utils.showToast(`Failed to unarchive child: ${result.error}`, 'error');
    }
  },

  async deleteChild(childId) {
    const row = document.querySelector(`tr[data-child-id="${childId}"]`);
    const childName = row?.dataset.childName || 'this child';
    
    if (!confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete ${childName}?\n\nThis will:\n- Delete the child record\n- Delete ALL check-in history\n- Delete ALL parent relationships\n\nThis action CANNOT be undone!\n\nType "DELETE" in the prompt to confirm.`)) {
      return;
    }

    const confirmation = prompt(`Type "DELETE" to confirm permanent deletion of ${childName}:`);
    if (confirmation !== 'DELETE') {
      Utils.showToast('Deletion cancelled', 'info');
      return;
    }

    const result = await Utils.apiRequest(`/api/children/${childId}`, {
      method: 'DELETE'
    });

    if (result.success) {
      Utils.showToast('Child deleted permanently', 'success');
      await this.loadChildrenTable();
    } else {
      Utils.showToast(`Failed to delete child: ${result.error}`, 'error');
    }
  },

  async showEditChildModal(child) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <h3>Edit Child Details</h3>
        <form id="editChildForm" class="form-section">
          <div class="form-group">
            <label for="editChildFirstName">First Name *</label>
            <input type="text" id="editChildFirstName" required value="${child.first_name || ''}">
          </div>
          
          <div class="form-group">
            <label for="editChildLastName">Last Name *</label>
            <input type="text" id="editChildLastName" required value="${child.last_name || ''}">
          </div>
          
          <div class="form-group">
            <label for="editChildDOB">Date of Birth</label>
            <input type="date" id="editChildDOB" value="${child.date_of_birth || ''}">
          </div>
          
          <div class="form-group">
            <label for="editChildGender">Gender</label>
            <select id="editChildGender">
              <option value="">Not specified</option>
              <option value="male" ${child.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${child.gender === 'female' ? 'selected' : ''}>Female</option>
              <option value="other" ${child.gender === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="editChildAllergies">Allergies</label>
            <textarea id="editChildAllergies" rows="2" placeholder="Any known allergies">${child.allergies || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label for="editChildMedicalNotes">Medical Notes</label>
            <textarea id="editChildMedicalNotes" rows="3" placeholder="Important medical information">${child.medical_notes || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="checkbox" id="editChildSpecialNeeds" ${child.special_needs ? 'checked' : ''}>
              <span>Special Needs</span>
            </label>
          </div>
          
          <div class="form-group" id="editSpecialNeedsDetailsGroup" style="display: ${child.special_needs ? 'block' : 'none'};">
            <label for="editChildSpecialNeedsDetails">Special Needs Details</label>
            <textarea id="editChildSpecialNeedsDetails" rows="3" placeholder="Describe special needs">${child.special_needs_details || ''}</textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Update Child</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Toggle special needs details visibility
    const specialNeedsCheckbox = modal.querySelector('#editChildSpecialNeeds');
    const specialNeedsDetailsGroup = modal.querySelector('#editSpecialNeedsDetailsGroup');
    specialNeedsCheckbox.addEventListener('change', () => {
      specialNeedsDetailsGroup.style.display = specialNeedsCheckbox.checked ? 'block' : 'none';
    });
    
    const form = document.getElementById('editChildForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.updateChild(child.id, modal);
    });
  },

  async updateChild(childId, modal) {
    const form = document.getElementById('editChildForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const childData = {
      first_name: document.getElementById('editChildFirstName').value,
      last_name: document.getElementById('editChildLastName').value,
      date_of_birth: document.getElementById('editChildDOB').value || null,
      gender: document.getElementById('editChildGender').value || null,
      allergies: document.getElementById('editChildAllergies').value || null,
      medical_notes: document.getElementById('editChildMedicalNotes').value || null,
      special_needs: document.getElementById('editChildSpecialNeeds').checked,
      special_needs_details: document.getElementById('editChildSpecialNeedsDetails').value || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    const result = await Utils.apiRequest(`/api/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(childData)
    });

    if (result.success) {
      Utils.showToast('Child updated successfully!', 'success');
      modal.remove();
      // Reload the current view
      await this.loadChildrenTable();
    } else {
      Utils.showToast(`Failed to update child: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Child';
    }
  },

  filterChildrenTable() {
    const searchTerm = document.getElementById('childSearchBox')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#childrenTable tbody tr');

    rows.forEach(row => {
      const name = row.querySelector('.child-name')?.textContent.toLowerCase() || '';
      row.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  },

  async showEditParentModal(parentId) {
    // Fetch current parent data
    const result = await Utils.apiRequest(`/api/parents/${parentId}`);
    
    if (!result.success) {
      Utils.showToast('Failed to load parent data', 'error');
      return;
    }

    const parent = result.data;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <h3>Edit Parent Details</h3>
        <form id="editParentForm" class="form-section">
          <div class="form-group">
            <label for="editParentFirstName">First Name *</label>
            <input type="text" id="editParentFirstName" required value="${parent.first_name || ''}">
          </div>
          
          <div class="form-group">
            <label for="editParentLastName">Last Name *</label>
            <input type="text" id="editParentLastName" required value="${parent.last_name || ''}">
          </div>
          
          <div class="form-group">
            <label for="editParentEmail">Email</label>
            <input type="email" id="editParentEmail" value="${parent.email || ''}">
          </div>
          
          <div class="form-group">
            <label for="editParentPhone">Phone Number *</label>
            <input type="tel" id="editParentPhone" required value="${parent.phone_number || ''}">
          </div>
          
          <div class="form-group">
            <label for="editParentAddress">Address</label>
            <textarea id="editParentAddress" rows="2" placeholder="Home address">${parent.address || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label for="editParentEmergencyName">Emergency Contact Name</label>
            <input type="text" id="editParentEmergencyName" value="${parent.emergency_contact_name || ''}">
          </div>
          
          <div class="form-group">
            <label for="editParentEmergencyPhone">Emergency Contact Phone</label>
            <input type="tel" id="editParentEmergencyPhone" value="${parent.emergency_contact_phone || ''}">
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Update Parent</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = document.getElementById('editParentForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.updateParent(parentId, modal);
    });
  },

  async updateParent(parentId, modal) {
    const form = document.getElementById('editParentForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const parentData = {
      first_name: document.getElementById('editParentFirstName').value,
      last_name: document.getElementById('editParentLastName').value,
      email: document.getElementById('editParentEmail').value || null,
      phone_number: document.getElementById('editParentPhone').value,
      address: document.getElementById('editParentAddress').value || null,
      emergency_contact_name: document.getElementById('editParentEmergencyName').value || null,
      emergency_contact_phone: document.getElementById('editParentEmergencyPhone').value || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    const result = await Utils.apiRequest(`/api/parents/${parentId}`, {
      method: 'PUT',
      body: JSON.stringify(parentData)
    });

    if (result.success) {
      Utils.showToast('Parent updated successfully!', 'success');
      modal.remove();
    } else {
      Utils.showToast(`Failed to update parent: ${result.error}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Parent';
    }
  }
};

// Make DashboardNav available globally for onclick handlers
window.DashboardNav = DashboardNav;
