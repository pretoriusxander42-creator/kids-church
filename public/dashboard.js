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
            <button class="btn-secondary" id="addChildBtn">+ Add Child</button>
            <button class="btn-secondary" id="addParentBtn">+ Add Parent</button>
            <button class="btn-secondary" id="manageChildrenBtn">Manage Children</button>
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
    
    // Use setTimeout to ensure DOM is ready after innerHTML update
    setTimeout(() => {
      // Attach event listeners to quick action buttons
      const addChildBtn = document.getElementById('addChildBtn');
      const addParentBtn = document.getElementById('addParentBtn');
      const manageChildrenBtn = document.getElementById('manageChildrenBtn');
      
      if (addChildBtn) {
        addChildBtn.addEventListener('click', () => this.showChildRegistrationModal());
      }
      if (addParentBtn) {
        addParentBtn.addEventListener('click', () => this.showParentRegistrationModal());
      }
      if (manageChildrenBtn) {
        manageChildrenBtn.addEventListener('click', () => this.showManageChildrenModal());
      }
    }, 0);
    
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
          <button class="btn-secondary" id="addNewChildInCheckin">+ Add New Child</button>
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
    
    // Attach event listener to Add New Child button
    setTimeout(() => {
      const addNewChildBtn = document.getElementById('addNewChildInCheckin');
      if (addNewChildBtn) {
        addNewChildBtn.addEventListener('click', () => this.showChildRegistrationModal());
      }
    }, 0);
    
    this.setupChildSearch();
    
    // Load classes after DOM is ready
    setTimeout(() => {
      this.loadClassesForCheckIn();
    }, 100);
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
        <button class="btn-secondary" id="createClassBtn">+ Create Class</button>
      </div>
      <div id="classList"></div>
    `;
    
    // Attach event listener for create class button
    setTimeout(() => {
      const createBtn = document.getElementById('createClassBtn');
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

  loadSpecialNeedsBoard(content) {
    content.innerHTML = `
      <div class="special-needs-board">
        <div class="section-header">
          <h2>Special Needs Board</h2>
          <button class="btn-secondary" id="addSpecialNeedsFormBtn">+ Add Special Needs Form</button>
        </div>
        <p class="subtitle">Children with special needs currently checked in</p>
        <div id="specialNeedsList"></div>
      </div>
    `;
    
    // Attach event listener to Add Special Needs Form button
    setTimeout(() => {
      const addBtn = document.getElementById('addSpecialNeedsFormBtn');
      if (addBtn) {
        addBtn.addEventListener('click', () => this.showSpecialNeedsFormModal());
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
          <h2>📋 ${className} - Children Currently Checked In</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div id="classBoardContent" style="padding: 20px;">
          <p style="text-align: center; color: #6b7280;">Loading children...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Attach close button event listener
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Load children checked into this class
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await Utils.apiRequest(`/api/checkins?date=${today}`);

      const contentDiv = modal.querySelector('#classBoardContent');

      if (result.success) {
        const checkIns = result.data || [];
        // Filter for this class and currently checked in (no check_out_time)
        const classChildren = checkIns.filter(ci => 
          ci.class_id === classId && !ci.check_out_time
        );

        if (classChildren.length === 0) {
          contentDiv.innerHTML = `
            <div style="text-align: center; padding: 40px;">
              <p style="font-size: 1.2rem; color: #6b7280;">No children currently checked into this class</p>
              <p style="margin-top: 10px; font-size: 0.875rem; color: #9ca3af;">
                Children will appear here once they are checked in and assigned to this class.
              </p>
            </div>
          `;
          return;
        }

        contentDiv.innerHTML = `
          <div style="margin-bottom: 20px;">
            <p style="font-size: 1.1rem; font-weight: 600; color: #1e40af;">
              👥 ${classChildren.length} ${classChildren.length === 1 ? 'child' : 'children'} checked in
            </p>
          </div>
          <div style="display: grid; gap: 15px;">
            ${classChildren.map(ci => {
              const child = ci.children;
              return `
                <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                      <h3 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 1.1rem;">
                        ${child.first_name} ${child.last_name}
                      </h3>
                      <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 15px; font-size: 0.9rem;">
                        <span style="color: #6b7280; font-weight: 500;">Age:</span>
                        <span>${child.date_of_birth ? this.calculateAge(child.date_of_birth) + ' years old' : 'N/A'}</span>
                        
                        <span style="color: #6b7280; font-weight: 500;">DOB:</span>
                        <span>${child.date_of_birth || 'N/A'}</span>
                        
                        <span style="color: #6b7280; font-weight: 500;">Checked In:</span>
                        <span>${Utils.formatTime(ci.check_in_time)}</span>
                        
                        <span style="color: #6b7280; font-weight: 500;">Security Code:</span>
                        <span style="font-weight: 700; color: #2563eb; font-size: 1.1rem;">${ci.security_code}</span>
                        
                        ${child.allergies ? `
                          <span style="color: #dc2626; font-weight: 500;">⚠️ Allergies:</span>
                          <span style="color: #dc2626; font-weight: 600;">${child.allergies}</span>
                        ` : ''}
                        
                        ${child.medical_notes ? `
                          <span style="color: #ea580c; font-weight: 500;">🏥 Medical:</span>
                          <span style="color: #ea580c;">${child.medical_notes}</span>
                        ` : ''}
                        
                        ${child.emergency_contact_name ? `
                          <span style="color: #6b7280; font-weight: 500;">Emergency Contact:</span>
                          <span>${child.emergency_contact_name} - ${child.emergency_contact_phone || 'No phone'}</span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #ef4444;">
            <p>❌ Failed to load children</p>
            <p style="font-size: 0.875rem; margin-top: 10px;">${result.message || 'Unknown error'}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('View class board error:', error);
      const contentDiv = modal.querySelector('#classBoardContent');
      if (contentDiv) {
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #ef4444;">
            <p>❌ An error occurred</p>
            <p style="font-size: 0.875rem; margin-top: 10px;">${error.message}</p>
          </div>
        `;
      }
    }
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
          class="btn-secondary manage-parents-btn" 
          data-child-id="${child.id}"
          data-child-name="${child.first_name} ${child.last_name}"
          style="white-space: nowrap;"
        >
          Manage Parents
        </button>
      </div>
    `).join('');
    
    // Attach event listeners to all Manage Parents buttons
    setTimeout(() => {
      document.querySelectorAll('.manage-parents-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const childId = btn.getAttribute('data-child-id');
          const childName = btn.getAttribute('data-child-name');
          this.showParentLinkingModal(childId, childName);
        });
      });
    }, 0);
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

// Make DashboardNav available globally for onclick handlers
window.DashboardNav = DashboardNav;
