/**
 * AURA DENTAL CLINIC & PATIENT BOOKING PORTAL
 * Interactive Multi-Step Booking Engine (booking.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingWizard();
});

const DEFAULT_APPOINTMENTS = [
  {
    id: 'APT-1082',
    patientName: 'Sarah Jenkins',
    patientEmail: 'sarah.jenkins@example.com',
    patientPhone: '(555) 234-5678',
    service: 'Cosmetic Dentistry & Smile Design',
    doctor: 'Dr. Eleanor Vance, DDS',
    date: '2026-08-28',
    time: '10:00 AM',
    status: 'Confirmed',
    notes: 'Routine shade verification and composite consultation.',
    created: '2026-08-10'
  },
  {
    id: 'APT-1049',
    patientName: 'Sarah Jenkins',
    patientEmail: 'sarah.jenkins@example.com',
    patientPhone: '(555) 234-5678',
    service: 'Comprehensive Dental Cleaning & Hygiene',
    doctor: 'Dr. Marcus Hayes, DMD',
    date: '2026-06-14',
    time: '02:30 PM',
    status: 'Completed',
    notes: 'Routine ultrasonic prophylaxis and fluoride treatment. Zero cavities noted.',
    created: '2026-06-01'
  }
];

// Initialize default storage if empty
if (!localStorage.getItem('aura_appointments')) {
  localStorage.setItem('aura_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
}

function initBookingWizard() {
  const wizardForm = document.getElementById('bookingWizardForm');
  if (!wizardForm) return;

  let currentStep = 1;
  const totalSteps = 4;

  // Booking State
  const bookingState = {
    service: 'Cosmetic Dentistry',
    doctor: 'Dr. Eleanor Vance, DDS (Lead Prosthodontist)',
    date: getTomorrowDateString(),
    time: '10:00 AM',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientDob: '',
    patientType: 'New Patient',
    notes: ''
  };

  // Pre-fill date input
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    dateInput.min = getTodayDateString();
    dateInput.value = bookingState.date;
  }

  // URL query params auto-selection (e.g. ?service=implants or ?doctor=vance)
  const urlParams = new URLSearchParams(window.location.search);
  const paramService = urlParams.get('service');
  const paramDoctor = urlParams.get('doctor');

  const serviceSelect = document.getElementById('bookingService');
  const doctorSelect = document.getElementById('bookingDoctor');

  if (serviceSelect && paramService) {
    for (let opt of serviceSelect.options) {
      if (opt.value.toLowerCase().includes(paramService.toLowerCase())) {
        serviceSelect.value = opt.value;
        bookingState.service = opt.value;
        break;
      }
    }
  }

  if (doctorSelect && paramDoctor) {
    for (let opt of doctorSelect.options) {
      if (opt.value.toLowerCase().includes(paramDoctor.toLowerCase())) {
        doctorSelect.value = opt.value;
        bookingState.doctor = opt.value;
        break;
      }
    }
  }

  // Bind live listeners
  setupLiveInputListeners(bookingState);
  setupTimeSlotSelection(bookingState);
  setupStepNavigation(bookingState);
  updateSummarySidebar(bookingState);
}

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function setupLiveInputListeners(state) {
  const serviceEl = document.getElementById('bookingService');
  const doctorEl = document.getElementById('bookingDoctor');
  const dateEl = document.getElementById('bookingDate');
  const nameEl = document.getElementById('patientName');
  const emailEl = document.getElementById('patientEmail');
  const phoneEl = document.getElementById('patientPhone');
  const notesEl = document.getElementById('bookingNotes');
  const typeRadios = document.querySelectorAll('input[name="patientType"]');

  if (serviceEl) {
    serviceEl.addEventListener('change', (e) => {
      state.service = e.target.value;
      updateSummarySidebar(state);
    });
  }

  if (doctorEl) {
    doctorEl.addEventListener('change', (e) => {
      state.doctor = e.target.value;
      updateSummarySidebar(state);
    });
  }

  if (dateEl) {
    dateEl.addEventListener('change', (e) => {
      state.date = e.target.value;
      updateSummarySidebar(state);
    });
  }

  if (nameEl) {
    nameEl.addEventListener('input', (e) => {
      state.patientName = e.target.value;
      updateSummarySidebar(state);
    });
  }

  if (emailEl) {
    emailEl.addEventListener('input', (e) => {
      state.patientEmail = e.target.value;
    });
  }

  if (phoneEl) {
    phoneEl.addEventListener('input', (e) => {
      state.patientPhone = e.target.value;
    });
  }

  if (notesEl) {
    notesEl.addEventListener('input', (e) => {
      state.notes = e.target.value;
    });
  }

  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.patientType = e.target.value;
    });
  });
}

function setupTimeSlotSelection(state) {
  const slotBtns = document.querySelectorAll('.time-slot-btn');
  slotBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      slotBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.time = btn.getAttribute('data-time') || btn.textContent.trim();
      updateSummarySidebar(state);
    });
  });
}

function setupStepNavigation(state) {
  const nextBtns = document.querySelectorAll('.btn-step-next');
  const prevBtns = document.querySelectorAll('.btn-step-prev');
  const confirmBtn = document.getElementById('btnConfirmAppointment');

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentStepNum = parseInt(btn.getAttribute('data-next-from'), 10);
      if (validateStep(currentStepNum, state)) {
        goToStep(currentStepNum + 1, state);
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentStepNum = parseInt(btn.getAttribute('data-prev-from'), 10);
      goToStep(currentStepNum - 1, state);
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      finalizeBooking(state);
    });
  }
}

function validateStep(stepNum, state) {
  if (stepNum === 1) {
    if (!state.service || !state.doctor) {
      window.showToast('Please select both a dental service and specialist.', 'error');
      return false;
    }
    return true;
  }

  if (stepNum === 2) {
    if (!state.date || !state.time) {
      window.showToast('Please select your preferred date and time slot.', 'error');
      return false;
    }
    return true;
  }

  if (stepNum === 3) {
    const name = document.getElementById('patientName')?.value.trim();
    const email = document.getElementById('patientEmail')?.value.trim();
    const phone = document.getElementById('patientPhone')?.value.trim();

    if (!name || !email || !phone) {
      window.showToast('Please fill in your name, email, and phone number.', 'error');
      return false;
    }

    state.patientName = name;
    state.patientEmail = email;
    state.patientPhone = phone;
    state.patientDob = document.getElementById('patientDob')?.value || '';
    state.notes = document.getElementById('bookingNotes')?.value.trim() || 'No special notes.';

    updateReviewStep(state);
    return true;
  }

  return true;
}

function goToStep(stepNum, state) {
  // Update step indicators
  const stepItems = document.querySelectorAll('.wizard-step-item');
  stepItems.forEach(item => {
    const stepVal = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (stepVal === stepNum) {
      item.classList.add('active');
    } else if (stepVal < stepNum) {
      item.classList.add('completed');
    }
  });

  // Switch step panels
  const panels = document.querySelectorAll('.wizard-step-panel');
  panels.forEach(panel => {
    panel.style.display = 'none';
  });

  const targetPanel = document.getElementById(`stepPanel${stepNum}`);
  if (targetPanel) {
    targetPanel.style.display = 'block';
    targetPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  updateSummarySidebar(state);
}

function updateReviewStep(state) {
  const revService = document.getElementById('revService');
  const revDoctor = document.getElementById('revDoctor');
  const revDateTime = document.getElementById('revDateTime');
  const revPatient = document.getElementById('revPatient');
  const revContact = document.getElementById('revContact');
  const revNotes = document.getElementById('revNotes');

  if (revService) revService.textContent = state.service;
  if (revDoctor) revDoctor.textContent = state.doctor;
  if (revDateTime) revDateTime.textContent = `${formatDisplayDate(state.date)} at ${state.time}`;
  if (revPatient) revPatient.textContent = `${state.patientName} (${state.patientType})`;
  if (revContact) revContact.textContent = `${state.patientEmail} • ${state.patientPhone}`;
  if (revNotes) revNotes.textContent = state.notes || 'None provided.';
}

function updateSummarySidebar(state) {
  const sumService = document.getElementById('summaryService');
  const sumDoctor = document.getElementById('summaryDoctor');
  const sumDate = document.getElementById('summaryDate');
  const sumTime = document.getElementById('summaryTime');
  const sumPatient = document.getElementById('summaryPatient');

  if (sumService) sumService.textContent = state.service || 'Not selected';
  if (sumDoctor) sumDoctor.textContent = state.doctor ? state.doctor.split('(')[0].trim() : 'Any Specialist';
  if (sumDate) sumDate.textContent = state.date ? formatDisplayDate(state.date) : 'Pending';
  if (sumTime) sumTime.textContent = state.time || 'Pending';
  if (sumPatient) sumPatient.textContent = state.patientName || 'Guest Patient';
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function finalizeBooking(state) {
  const newAppointment = {
    id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: state.patientName,
    patientEmail: state.patientEmail,
    patientPhone: state.patientPhone,
    patientDob: state.patientDob,
    service: state.service,
    doctor: state.doctor.split('(')[0].trim(),
    date: state.date,
    time: state.time,
    status: 'Confirmed',
    notes: state.notes,
    created: getTodayDateString()
  };

  // Retrieve existing appointments and prepend new appointment
  const existing = JSON.parse(localStorage.getItem('aura_appointments') || '[]');
  existing.unshift(newAppointment);
  localStorage.setItem('aura_appointments', JSON.stringify(existing));

  // Show confirmation screen in the wizard
  const wizardCard = document.querySelector('.wizard-card');
  if (wizardCard) {
    wizardCard.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="width: 70px; height: 70px; background: var(--color-accent-subtle); color: var(--color-accent-text); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.5rem auto;">
          <i class="bi bi-check2-circle"></i>
        </div>
        <span class="section-tag" style="margin-bottom: 0.5rem;"><i class="bi bi-shield-check"></i> Booking Confirmed</span>
        <h2 style="margin-bottom: 0.75rem;">Appointment Successfully Scheduled!</h2>
        <p style="max-width: 500px; margin: 0 auto 2rem auto; color: var(--color-text-body);">
          Thank you, <strong>${state.patientName}</strong>. Your appointment reference is <strong>#${newAppointment.id}</strong>. A confirmation email has been dispatched to <strong>${state.patientEmail}</strong>.
        </p>

        <div style="background: var(--color-bg-alt); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem; max-width: 500px; margin: 0 auto 2.5rem auto; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem;">
            <span style="color: var(--color-text-muted);">Specialist:</span>
            <strong style="color: var(--color-text-main);">${newAppointment.doctor}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem;">
            <span style="color: var(--color-text-muted);">Service:</span>
            <strong style="color: var(--color-text-main);">${newAppointment.service}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
            <span style="color: var(--color-text-muted);">Scheduled Time:</span>
            <strong style="color: var(--color-accent);">${formatDisplayDate(newAppointment.date)} at ${newAppointment.time}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem;">
          <a href="dashboard.html" class="btn btn-primary">
            <i class="bi bi-person-badge"></i> Open Patient Dashboard
          </a>
          <a href="booking.html" class="btn btn-secondary">
            <i class="bi bi-plus-circle"></i> Book Another Appointment
          </a>
        </div>
      </div>
    `;
  }

  window.showToast('Appointment successfully scheduled and synced to your dashboard!', 'success');
}
