// Dashboard navigation and enhanced features

const DashboardNav = {
  init() {
    this.createNavigation();
    this.bindEvents();
    this.loadDashboardStats();
    this.startAutoRefresh();
  },

  createNavigation() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;

    const navHTML = `
      <div class="dashboard-nav">
        <button class="nav-tab active" data-view="overview">Overview</button>
        <button class="nav-tab" data-view="checkin">Check-in</button>
        <button class="nav-tab" data-view="checkout">Check-out</button>
        <button class="nav-tab" data-view="classes">Classes</button>
        <button class="nav-tab" data-view="ftv">FTV Board</button>
        <button class="nav-tab" data-view="special-needs">Special Needs</button>
        <button class="nav-tab" data-view="reports">Reports</button>
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
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    // Stop auto-refresh when leaving overview
    if (view !== 'overview') {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }

    // Load view content
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    switch(view) {
      case 'overview':
        this.loadOverview(content);
        break;
      case 'checkin':
        this.loadCheckinView(content);
        break;
      case 'checkout':
        this.loadCheckoutView(content);
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
      case 'reports':
        this.loadReports(content);
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
    content.innerHTML = `
      <div class="overview-section">
        <div class="section-header">
          <h2>Today's Activity</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-secondary" onclick="DashboardNav.showChildRegistrationModal()">+ Add Child</button>
            <button class="btn-secondary" onclick="DashboardNav.showParentRegistrationModal()">+ Add Parent</button>
            <button class="btn-secondary" onclick="DashboardNav.showManageChildrenModal()">Manage Children</button>
          </div>
        </div>
        <div class="activity-cards">
          <div class="activity-card">
            <h3>Currently Checked In</h3>
            <p class="big-number" id="currentlyCheckedIn">Loading...</p>
          </div>
          <div class="activity-card">
            <h3>Total Check-ins Today</h3>
            <p class="big-number" id="todayTotal">Loading...</p>
          </div>
        </div>
        <div class="recent-activity">
          <h3>Recent Check-ins</h3>
          <div id="recentCheckIns">Loading...</div>
        </div>
      </div>
    `;
    this.loadRecentCheckIns();
  },

  async loadRecentCheckIns() {
    const container = document.getElementById('recentCheckIns');
    if (!container) return;

    Utils.showLoading(container, 'Loading recent check-ins...');

    const today = new Date().toISOString().split('T')[0];
    const result = await Utils.apiRequest(`/api/checkins?date=${today}`);

    if (result.success) {
      const checkIns = result.data;
      
      if (checkIns.length === 0) {
        Utils.showEmpty(container, 'No check-ins yet today');
        return;
      }

      container.innerHTML = checkIns.slice(0, 10).map(ci => `
        <div class="checkin-item">
          <span>${ci.children?.first_name} ${ci.children?.last_name}</span>
          <span>${Utils.formatTime(ci.check_in_time)}</span>
          <span class="status ${ci.check_out_time ? 'checked-out' : 'checked-in'}">
            ${ci.check_out_time ? 'Checked Out' : 'Checked In'}
          </span>
        </div>
      `).join('');
    } else {
      Utils.showError(container, 'Failed to load recent check-ins', 'DashboardNav.loadRecentCheckIns()');
    }
  },

  loadCheckinView(content) {
    content.innerHTML = `
      <div class="checkin-section">
        <div class="section-header">
          <h2>Child Check-in</h2>
          <button class="btn-secondary" onclick="DashboardNav.showChildRegistrationModal()">+ Add New Child</button>
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
            
            <div class="form-group" style="margin-top: 1rem;">
              <label>Assign to Class <span class="required">*</span></label>
              <select id="classSelect" required>
                <option value="">Loading classes...</option>
              </select>
              <div id="classCapacityInfo" style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;"></div>
            </div>
            
            <button type="submit" class="btn-primary">Check In</button>
          </div>
        </form>
      </div>
    `;
    this.setupChildSearch();
    this.loadClassesForCheckIn();
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
        const children = result.data || [];

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

    // Get first parent if available, otherwise create a temporary one
    const parentResult = await Utils.apiRequest('/api/parents');
    let parentId = null;
    
    if (parentResult.success && parentResult.data.data && parentResult.data.data.length > 0) {
      parentId = parentResult.data.data[0].id;
    }

    const user = window.currentUser;
    
    const result = await Utils.apiRequest('/api/checkins', {
      method: 'POST',
      body: JSON.stringify({
        child_id: child.id,
        parent_id: parentId,
        checked_in_by: user.id,
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
        <button class="btn-secondary" onclick="DashboardNav.showClassModal()">+ Create Class</button>
      </div>
      <div id="classList"></div>
    `;
    
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
        <div class="class-card">
          <h3>${cls.name}</h3>
          <p>${cls.description || ''}</p>
          <p><strong>Type:</strong> ${cls.type}</p>
          <p><strong>Capacity:</strong> ${cls.capacity || 'Unlimited'}</p>
          <p><strong>Location:</strong> ${cls.room_location || 'TBD'}</p>
          <button class="btn-secondary" onclick="DashboardNav.viewClassDetails('${cls.id}')">View Details</button>
        </div>
      `).join('');
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
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
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
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'} Class</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('classForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveClass(classData?.id);
    });
  },

  async saveClass(classId = null) {
    const submitBtn = event.target.querySelector('button[type="submit"]');
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
      document.querySelector('.modal-overlay').remove();
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
        <h2>First Time Visitors (FTV) Board</h2>
        <p class="subtitle">Children visiting for the first time today</p>
        <div id="ftvList"></div>
      </div>
    `;
    this.loadFTVChildren();
  },

  async loadFTVChildren() {
    const container = document.getElementById('ftvList');
    Utils.showLoading(container, 'Loading first-time visitors...');

    const today = new Date().toISOString().split('T')[0];
    const result = await Utils.apiRequest(`/api/checkins?date=${today}`);

    if (result.success) {
      const checkIns = result.data;
      const ftvChildren = checkIns.filter(ci => 
        ci.children?.class_assignment === 'ftv_board'
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
          <p><strong>Parent Contact:</strong> ${ci.parents?.phone_number || 'N/A'}</p>
        </div>
      `).join('');
    } else {
      Utils.showError(container, 'Failed to load first-time visitors', 'DashboardNav.loadFTVChildren()');
    }
  },

  loadSpecialNeedsBoard(content) {
    content.innerHTML = `
      <div class="special-needs-board">
        <div class="section-header">
          <h2>Special Needs Board</h2>
          <button class="btn-secondary" onclick="DashboardNav.showSpecialNeedsFormModal()">+ Add Special Needs Form</button>
        </div>
        <p class="subtitle">Children with special needs currently checked in</p>
        <div id="specialNeedsList"></div>
      </div>
    `;
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
          <button class="btn-secondary" onclick="DashboardNav.viewSpecialNeedsForm('${ci.children.id}')">View Form</button>
        </div>
      `).join('');
    } else {
      Utils.showError(container, 'Failed to load special needs children', 'DashboardNav.loadSpecialNeedsChildren()');
    }
  },

  loadReports(content) {
    const today = new Date().toISOString().split('T')[0];
    content.innerHTML = `
      <div class="reports-section">
        <h2>Reports</h2>
        <div class="report-cards">
          <div class="report-card">
            <h3>Attendance CSV Export</h3>
            <p>Download attendance between two dates (inclusive).</p>
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
          <div class="report-card">
            <h3>FTV Report</h3>
            <p>First-time visitor tracking and follow-up (coming soon)</p>
            <button class="btn-secondary" disabled>Generate Report</button>
          </div>
          <div class="report-card">
            <h3>Special Needs Report</h3>
            <p>Special needs statistics and forms (coming soon)</p>
            <button class="btn-secondary" disabled>Generate Report</button>
          </div>
        </div>
      </div>
    `;

    const btn = document.getElementById('downloadAttendanceCsv');
    btn?.addEventListener('click', () => {
      const start = document.getElementById('attStart').value || today;
      const end = document.getElementById('attEnd').value || start;
      const url = `/api/statistics/attendance/export.csv?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      window.open(url, '_blank');
    });
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

  showChildRegistrationModal() {
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
              <input type="checkbox" id="childSpecialNeeds">
              This child has special needs
            </label>
          </div>

          <div class="form-group" id="specialNeedsDetails" style="display:none;">
            <label>Special Needs Details</label>
            <textarea id="childSpecialNeedsDetails" rows="3" placeholder="Describe special needs..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn-primary">Register Child</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Toggle special needs details
    document.getElementById('childSpecialNeeds').addEventListener('change', (e) => {
      document.getElementById('specialNeedsDetails').style.display = 
        e.target.checked ? 'block' : 'none';
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

    const childData = {
      first_name: document.getElementById('childFirstName').value.trim(),
      last_name: document.getElementById('childLastName').value.trim(),
      date_of_birth: document.getElementById('childDOB').value,
      gender: document.getElementById('childGender').value || null,
      allergies: document.getElementById('childAllergies').value.trim() || null,
      medical_notes: document.getElementById('childMedicalNotes').value.trim() || null,
      special_needs: document.getElementById('childSpecialNeeds').checked,
      special_needs_details: document.getElementById('childSpecialNeeds').checked 
        ? document.getElementById('childSpecialNeedsDetails').value.trim() || null
        : null
    };

    const result = await Utils.apiRequest('/api/children', {
      method: 'POST',
      body: JSON.stringify(childData)
    });

    if (result.success) {
      Utils.showToast('Child registered successfully!', 'success');
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
        <div class="form-group">
          <input 
            type="text" 
            id="manageChildSearch" 
            placeholder="Search by child name..." 
            style="width: 100%;"
          >
        </div>
        <div id="childrenList" style="margin-top: 1rem;">
          Loading children...
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Load children
    await this.loadChildrenForManagement();

    // Search functionality
    document.getElementById('manageChildSearch').addEventListener('input', (e) => {
      this.filterChildrenList(e.target.value);
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
      <div class="child-manage-item" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${child.first_name} ${child.last_name}</strong>
          <span style="color: #6b7280; margin-left: 1rem;">DOB: ${child.date_of_birth}</span>
          ${child.special_needs ? '<span style="margin-left: 1rem; padding: 0.25rem 0.5rem; background: #fef3c7; border-radius: 4px; font-size: 0.75rem;">Special Needs</span>' : ''}
        </div>
        <button 
          class="btn-secondary" 
          onclick="DashboardNav.showParentLinkingModal('${child.id}', '${child.first_name} ${child.last_name}')"
          style="white-space: nowrap;"
        >
          Manage Parents
        </button>
      </div>
    `).join('');
  },

  filterChildrenList(query) {
    if (!this.allChildren) return;
    
    const filtered = this.allChildren.filter(child => 
      `${child.first_name} ${child.last_name}`.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderChildrenList(filtered);
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
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
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
          class="btn-secondary" 
          style="background: #fee2e2; color: #991b1b;"
          onclick="DashboardNav.unlinkParent('${parent.id}', '${childId}')"
        >
          Unlink
        </button>
      </div>
    `).join('');
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
        this.loadRecentCheckIns();
      }
    }, 30000); // 30 seconds
  },

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
};
