/**
 * AURA DENTAL CLINIC & PATIENT BOOKING PORTAL
 * Patient Dashboard Controller (dashboard.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

function initDashboard() {
  setupTabRouting();
  renderDashboardOverview();
  renderAppointmentsList();
  setupAppointmentModals();
  setupProfileForm();
  setupSettingsForm();
}

/**
 * Tab Navigation Router inside Patient Dashboard
 */
function setupTabRouting() {
  const navItems = document.querySelectorAll('.dash-nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.dash-tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.style.display = 'none');

      item.classList.add('active');
      const activePane = document.getElementById(`tab-${tabId}`);
      if (activePane) {
        activePane.style.display = 'block';
      }

      // Re-render relevant components
      if (tabId === 'appointments') {
        renderAppointmentsList();
      } else if (tabId === 'overview') {
        renderDashboardOverview();
      }
    });
  });

  // Quick Action Buttons router
  const quickLinks = document.querySelectorAll('[data-switch-tab]');
  quickLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-switch-tab');
      const targetNav = document.querySelector(`.dash-nav-item[data-tab="${targetTab}"]`);
      if (targetNav) targetNav.click();
    });
  });
}

/**
 * Render Overview Tab Cards (Upcoming Appointment, Next Checkup, Recent Treatment)
 */
function renderDashboardOverview() {
  const appointments = getStoredAppointments();
  const upcomingAppts = appointments.filter(a => a.status === 'Confirmed');
  
  // Update sidebar badge
  const badgeEl = document.getElementById('dashApptCount');
  if (badgeEl) {
    badgeEl.textContent = upcomingAppts.length;
    badgeEl.style.display = upcomingAppts.length > 0 ? 'inline-block' : 'none';
  }

  const upcomingCardContainer = document.getElementById('overviewUpcomingCard');
  if (upcomingCardContainer) {
    if (upcomingAppts.length > 0) {
      const nextAppt = upcomingAppts[0];
      upcomingCardContainer.innerHTML = `
        <div class="card" style="border-left: 4px solid var(--color-accent);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="badge-status badge-confirmed"><i class="bi bi-check-circle-fill"></i> ${nextAppt.status}</span>
              <h3 style="margin-top: 0.5rem; font-size: 1.35rem;">${nextAppt.service}</h3>
            </div>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Ref: #${nextAppt.id}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase;">Attending Specialist</div>
              <strong style="color: var(--color-text-main); font-size: 0.95rem;">${nextAppt.doctor}</strong>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase;">Date & Time</div>
              <strong style="color: var(--color-text-main); font-size: 0.95rem;">${formatDisplayDate(nextAppt.date)} at ${nextAppt.time}</strong>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase;">Location</div>
              <strong style="color: var(--color-text-main); font-size: 0.95rem;">Suite 400 • Operatory A</strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="openRescheduleModal('${nextAppt.id}')">
              <i class="bi bi-calendar3"></i> Reschedule
            </button>
            <button class="btn btn-secondary btn-sm" style="color: #94A3B8 !important; border-color: var(--color-border);" onclick="openCancelModal('${nextAppt.id}')">
              <i class="bi bi-x-circle"></i> Cancel
            </button>
            <button class="btn btn-primary btn-sm" onclick="openDetailsModal('${nextAppt.id}')">
              <i class="bi bi-file-earmark-text"></i> View Preparation Guide
            </button>
          </div>
        </div>
      `;
    } else {
      upcomingCardContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 2.5rem 1.5rem;">
          <i class="bi bi-calendar-check" style="font-size: 2.5rem; color: var(--color-accent); margin-bottom: 0.75rem; display: inline-block;"></i>
          <h3 style="margin-bottom: 0.5rem;">No Active Upcoming Appointments</h3>
          <p style="color: var(--color-text-muted); max-width: 420px; margin: 0 auto 1.5rem auto; font-size: 0.95rem;">You are completely up to date with your dental visits. Schedule a routine checkup or hygiene session whenever you are ready.</p>
          <a href="booking.html" class="btn btn-primary"><i class="bi bi-calendar-plus"></i> Schedule New Appointment</a>
        </div>
      `;
    }
  }
}

/**
 * Render Complete Appointments List (Table & Card View)
 */
function renderAppointmentsList(filter = 'all') {
  const tableBody = document.getElementById('appointmentsTableBody');
  const emptyState = document.getElementById('appointmentsEmpty');
  if (!tableBody) return;

  const appointments = getStoredAppointments();
  let filtered = appointments;
  if (filter !== 'all') {
    filtered = appointments.filter(a => a.status.toLowerCase() === filter.toLowerCase());
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = filtered.map(appt => {
    let badgeClass = 'badge-confirmed';
    if (appt.status === 'Completed') badgeClass = 'badge-completed';
    if (appt.status === 'Cancelled') badgeClass = 'badge-cancelled';

    return `
      <tr>
        <td>
          <strong style="color: var(--color-text-main);">${appt.id}</strong>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--color-text-main);">${appt.service}</div>
          <small style="color: var(--color-text-muted);">${appt.notes || 'Routine consultation'}</small>
        </td>
        <td>
          <div style="color: var(--color-text-main); font-weight: 500;">${appt.doctor}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--color-text-main);">${formatDisplayDate(appt.date)}</div>
          <small style="color: var(--color-text-muted);">${appt.time}</small>
        </td>
        <td>
          <span class="badge-status ${badgeClass}">
            <i class="bi ${appt.status === 'Confirmed' ? 'bi-check-circle-fill' : (appt.status === 'Completed' ? 'bi-check-all' : 'bi-x-circle')}"></i>
            ${appt.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" title="View Details" onclick="openDetailsModal('${appt.id}')">
              <i class="bi bi-eye"></i>
            </button>
            ${appt.status === 'Confirmed' ? `
              <button class="btn btn-secondary btn-sm" title="Reschedule" onclick="openRescheduleModal('${appt.id}')">
                <i class="bi bi-calendar-range"></i>
              </button>
              <button class="btn btn-secondary btn-sm" title="Cancel Appointment" style="color: #94A3B8 !important;" onclick="openCancelModal('${appt.id}')">
                <i class="bi bi-x-lg"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter Buttons on Appointments Tab
 */
const filterBtns = document.querySelectorAll('.appt-filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter') || 'all';
    renderAppointmentsList(filter);
  });
});

/**
 * Modals Management (Details, Reschedule, Cancel)
 */
function setupAppointmentModals() {
  const modalCloseBtns = document.querySelectorAll('.modal-close-trigger');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    });
  });

  // Reschedule Form Submission
  const rescheduleForm = document.getElementById('formReschedule');
  if (rescheduleForm) {
    rescheduleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const apptId = document.getElementById('rescheduleApptId').value;
      const newDate = document.getElementById('rescheduleDate').value;
      const newTime = document.getElementById('rescheduleTime').value;

      if (!newDate || !newTime) {
        window.showToast('Please select a valid date and time.', 'error');
        return;
      }

      updateAppointment(apptId, { date: newDate, time: newTime });
      document.getElementById('modalReschedule').classList.remove('active');
      window.showToast(`Appointment #${apptId} successfully rescheduled to ${formatDisplayDate(newDate)} at ${newTime}!`, 'success');
      renderDashboardOverview();
      renderAppointmentsList();
    });
  }

  // Cancel Confirmation Button
  const confirmCancelBtn = document.getElementById('btnConfirmCancel');
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', () => {
      const apptId = document.getElementById('cancelApptId').value;
      updateAppointment(apptId, { status: 'Cancelled' });
      document.getElementById('modalCancel').classList.remove('active');
      window.showToast(`Appointment #${apptId} has been cancelled.`, 'info');
      renderDashboardOverview();
      renderAppointmentsList();
    });
  }
}

function openDetailsModal(apptId) {
  const appointments = getStoredAppointments();
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return;

  const modal = document.getElementById('modalDetails');
  const body = document.getElementById('detailsModalContent');

  if (body) {
    body.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <span class="badge-status ${appt.status === 'Confirmed' ? 'badge-confirmed' : 'badge-completed'}">${appt.status}</span>
        <h3 style="margin-top: 0.5rem; font-size: 1.35rem;">${appt.service}</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">Appointment Reference: <strong>#${appt.id}</strong></p>
      </div>

      <div style="background: var(--color-bg-alt); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="margin-bottom: 0.75rem;">
          <small style="color: var(--color-text-muted); text-transform: uppercase; font-size: 0.75rem; font-weight: 700;">Specialist</small>
          <div style="color: var(--color-text-main); font-weight: 600;">${appt.doctor}</div>
        </div>
        <div style="margin-bottom: 0.75rem;">
          <small style="color: var(--color-text-muted); text-transform: uppercase; font-size: 0.75rem; font-weight: 700;">Date & Time</small>
          <div style="color: var(--color-accent); font-weight: 700;">${formatDisplayDate(appt.date)} at ${appt.time}</div>
        </div>
        <div style="margin-bottom: 0.75rem;">
          <small style="color: var(--color-text-muted); text-transform: uppercase; font-size: 0.75rem; font-weight: 700;">Patient Notes</small>
          <div style="color: var(--color-text-body); font-size: 0.9rem;">${appt.notes || 'None provided.'}</div>
        </div>
        <div>
          <small style="color: var(--color-text-muted); text-transform: uppercase; font-size: 0.75rem; font-weight: 700;">Clinic Location</small>
          <div style="color: var(--color-text-body); font-size: 0.9rem;">Aura Dental Studio • Floor 4, Suite 400 • Free Valet Parking</div>
        </div>
      </div>

      <div style="border-top: 1px solid var(--color-border); padding-top: 1rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.4rem;"><i class="bi bi-info-circle text-accent"></i> Preparation Instructions:</h4>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">Please arrive 10 minutes before your slot. Bring your dental insurance card and a list of any current medications.</p>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function openRescheduleModal(apptId) {
  const appointments = getStoredAppointments();
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return;

  document.getElementById('rescheduleApptId').value = apptId;
  const dateInput = document.getElementById('rescheduleDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = appt.date;
  }

  const timeSelect = document.getElementById('rescheduleTime');
  if (timeSelect) timeSelect.value = appt.time;

  const modal = document.getElementById('modalReschedule');
  if (modal) modal.classList.add('active');
}

function openCancelModal(apptId) {
  document.getElementById('cancelApptId').value = apptId;
  const modal = document.getElementById('modalCancel');
  if (modal) modal.classList.add('active');
}

window.openDetailsModal = openDetailsModal;
window.openRescheduleModal = openRescheduleModal;
window.openCancelModal = openCancelModal;

/**
 * LocalStorage Helpers
 */
function getStoredAppointments() {
  try {
    return JSON.parse(localStorage.getItem('aura_appointments') || '[]');
  } catch (e) {
    return [];
  }
}

function updateAppointment(id, updates) {
  const appointments = getStoredAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));
  }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Profile & Settings Form handlers
 */
function setupProfileForm() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('profName')?.value || 'Sarah Jenkins';
    const email = document.getElementById('profEmail')?.value || 'sarah.jenkins@example.com';
    const phone = document.getElementById('profPhone')?.value || '(555) 234-5678';

    const profileData = { fullName, email, phone };
    localStorage.setItem('aura_patient_profile', JSON.stringify(profileData));

    const nameDisplay = document.querySelector('.patient-meta-text h4');
    if (nameDisplay) nameDisplay.textContent = fullName;

    window.showToast('Profile information successfully saved!', 'success');
  });
}

function setupSettingsForm() {
  const settingsForm = document.getElementById('settingsForm');
  if (!settingsForm) return;

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.showToast('Account & notification preferences updated!', 'success');
  });
}
