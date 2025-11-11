// Dashboard navigation and enhanced features

const DashboardNav = {
  init() {
    this.createNavigation();
    this.bindEvents();
    this.loadDashboardStats();
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/statistics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        this.updateStatsDisplay(stats);
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
        <h2>Today's Activity</h2>
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
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/checkins?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const checkIns = await response.json();
        const container = document.getElementById('recentCheckIns');
        if (container) {
          container.innerHTML = checkIns.slice(0, 10).map(ci => `
            <div class="checkin-item">
              <span>${ci.children?.first_name} ${ci.children?.last_name}</span>
              <span>${new Date(ci.check_in_time).toLocaleTimeString()}</span>
              <span class="status ${ci.check_out_time ? 'checked-out' : 'checked-in'}">
                ${ci.check_out_time ? 'Checked Out' : 'Checked In'}
              </span>
            </div>
          `).join('') || '<p>No check-ins yet today</p>';
        }
      }
    } catch (error) {
      console.error('Failed to load recent check-ins:', error);
    }
  },

  loadCheckinView(content) {
    content.innerHTML = `
      <div class="checkin-section">
        <h2>Child Check-in</h2>
        <form id="checkinForm" class="form">
          <div class="form-group">
            <label>Search for Child</label>
            <input type="text" id="childSearch" placeholder="Type child's name...">
            <div id="childResults" class="search-results"></div>
          </div>
          <div id="selectedChild" class="selected-child" style="display:none;">
            <h3>Selected Child</h3>
            <div id="childInfo"></div>
            <button type="submit" class="btn-primary">Check In</button>
          </div>
        </form>
      </div>
    `;
    this.setupChildSearch();
  },

  setupChildSearch() {
    const searchInput = document.getElementById('childSearch');
    const resultsDiv = document.getElementById('childResults');
    let selectedChild = null;

    searchInput?.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/children`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const children = data.data || [];
          const filtered = children.filter(child => 
            `${child.first_name} ${child.last_name}`.toLowerCase().includes(query.toLowerCase())
          );

          resultsDiv.innerHTML = filtered.map(child => `
            <div class="result-item" data-child='${JSON.stringify(child)}'>
              <strong>${child.first_name} ${child.last_name}</strong>
              <span>${child.date_of_birth}</span>
            </div>
          `).join('') || '<p>No children found</p>';

          // Bind click events
          resultsDiv.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
              selectedChild = JSON.parse(item.dataset.child);
              this.displaySelectedChild(selectedChild);
              resultsDiv.innerHTML = '';
              searchInput.value = '';
            });
          });
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
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

  async performCheckIn(child) {
    try {
      const token = localStorage.getItem('token');
      const user = currentUser; // From main app.js
      
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: child.id,
          parent_id: user.id, // This should be fetched properly
          checked_in_by: user.id,
          class_attended: child.class_assignment || 'general',
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Check-in successful! Security Code: ${result.security_code}`);
        this.switchView('overview');
      } else {
        const error = await response.json();
        alert('Check-in failed: ' + error.error);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Check-in failed. Please try again.');
    }
  },

  async loadClassesView(content) {
    content.innerHTML = '<h2>Classes</h2><div id="classList">Loading...</div>';
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const classes = await response.json();
        const container = document.getElementById('classList');
        if (container) {
          container.innerHTML = classes.map(cls => `
            <div class="class-card">
              <h3>${cls.name}</h3>
              <p>${cls.description || ''}</p>
              <p><strong>Type:</strong> ${cls.type}</p>
              <p><strong>Capacity:</strong> ${cls.capacity || 'Unlimited'}</p>
              <p><strong>Location:</strong> ${cls.room_location || 'TBD'}</p>
              <button class="btn-secondary" onclick="DashboardNav.viewClassDetails('${cls.id}')">View Details</button>
            </div>
          `).join('') || '<p>No classes available</p>';
        }
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  },

  loadFTVBoard(content) {
    content.innerHTML = `
      <div class="ftv-board">
        <h2>First Time Visitors (FTV) Board</h2>
        <p class="subtitle">Children visiting for the first time today</p>
        <div id="ftvList">Loading...</div>
      </div>
    `;
    this.loadFTVChildren();
  },

  async loadFTVChildren() {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/checkins?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const checkIns = await response.json();
        const ftvChildren = checkIns.filter(ci => 
          ci.children?.class_assignment === 'ftv_board'
        );

        const container = document.getElementById('ftvList');
        if (container) {
          container.innerHTML = ftvChildren.map(ci => `
            <div class="ftv-card">
              <h3>${ci.children.first_name} ${ci.children.last_name}</h3>
              <p><strong>Age:</strong> ${this.calculateAge(ci.children.date_of_birth)} years</p>
              <p><strong>Checked in:</strong> ${new Date(ci.check_in_time).toLocaleTimeString()}</p>
              <p><strong>Parent Contact:</strong> ${ci.parents?.phone_number || 'N/A'}</p>
            </div>
          `).join('') || '<p>No first-time visitors today</p>';
        }
      }
    } catch (error) {
      console.error('Failed to load FTV children:', error);
    }
  },

  loadSpecialNeedsBoard(content) {
    content.innerHTML = `
      <div class="special-needs-board">
        <h2>Special Needs Board</h2>
        <p class="subtitle">Children with special needs currently checked in</p>
        <div id="specialNeedsList">Loading...</div>
      </div>
    `;
    this.loadSpecialNeedsChildren();
  },

  async loadSpecialNeedsChildren() {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/checkins?date=${today}&status=checked_in`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const checkIns = await response.json();
        const specialNeedsChildren = checkIns.filter(ci => ci.children?.special_needs);

        const container = document.getElementById('specialNeedsList');
        if (container) {
          container.innerHTML = specialNeedsChildren.map(ci => `
            <div class="special-needs-card">
              <h3>${ci.children.first_name} ${ci.children.last_name}</h3>
              <p class="warning"><strong>Special Needs:</strong> Yes</p>
              ${ci.children.special_needs_details ? `<p>${ci.children.special_needs_details}</p>` : ''}
              <p><strong>Class:</strong> ${ci.class_attended}</p>
              <button class="btn-secondary" onclick="DashboardNav.viewSpecialNeedsForm('${ci.children.id}')">View Form</button>
            </div>
          `).join('') || '<p>No children with special needs currently checked in</p>';
        }
      }
    } catch (error) {
      console.error('Failed to load special needs children:', error);
    }
  },

  loadReports(content) {
    content.innerHTML = `
      <div class="reports-section">
        <h2>Reports</h2>
        <div class="report-cards">
          <div class="report-card">
            <h3>Attendance Report</h3>
            <p>View attendance by date, class, or child</p>
            <button class="btn-primary">Generate Report</button>
          </div>
          <div class="report-card">
            <h3>FTV Report</h3>
            <p>First-time visitor tracking and follow-up</p>
            <button class="btn-primary">Generate Report</button>
          </div>
          <div class="report-card">
            <h3>Special Needs Report</h3>
            <p>Special needs statistics and forms</p>
            <button class="btn-primary">Generate Report</button>
          </div>
        </div>
      </div>
    `;
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
    console.log('View special needs form for child:', childId);
    // TODO: Implement special needs form modal
  }
};

// Initialize dashboard navigation when dashboard is shown
const originalShowDashboard = showDashboard;
showDashboard = function() {
  originalShowDashboard();
  setTimeout(() => DashboardNav.init(), 100);
};
