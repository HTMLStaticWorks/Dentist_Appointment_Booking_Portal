# Aura Dental Studio — Premium Dentist Appointment Booking Portal

A modern, trustworthy, and high-end Dental Clinic Website & Patient Portal built with semantic HTML5, Vanilla CSS3, and ES6+ JavaScript.

---

## Key Features

1. **Strict 3-Color Luxury Aesthetic**:
   - **Primary:** Deep Navy Blue (`#12304A`)
   - **Secondary:** Clean White (`#FFFFFF`)
   - **Accent:** Professional Teal (`#19A7A0`)
   - Fully compliant with **WCAG 2.1 AA** contrast standards across Light and Dark themes.

2. **Strict Section Counts**:
   - **`index.html` (Home 1):** Exactly 6 major sections
   - **`pages/home-2.html` (Home 2):** Exactly 6 major sections (Editorial split layout with mandatory subtext under H1)
   - **All other public pages:** Exactly 4 major sections (`about.html`, `services.html`, `service-details.html`, `dentists.html`, `dentist-details.html`, `gallery.html`, `booking.html`, `contact.html`)

3. **Multi-Step Interactive Booking Engine (`pages/booking.html`)**:
   - 4-step wizard with real-time slot selection, doctor/service auto-selection, live reactive summary card, and persistent `localStorage` synchronization.

4. **Patient Portal & Dashboard (`pages/dashboard.html`)**:
   - Tab switching: Overview, Appointments, Treatment History timeline, Reminders, Profile, and Settings.
   - Live appointment management (View Preparation Guide, Reschedule modal, Cancel modal).
   - Mobile-responsive table-to-card transformation.

5. **Authentication Suite & Utility Pages**:
   - `pages/login.html` (with instant demo access)
   - `pages/register.html` (complete patient fields and validation)
   - `pages/forgot-password.html`
   - `pages/404.html` ("This page needs a checkup.")
   - `pages/coming-soon.html` (live countdown timer)

6. **Accessibility & Internationalization**:
   - Automatic system preference detection for Dark/Light mode + manual toggle.
   - Built-in Right-to-Left (RTL) mode.
   - 100% responsive across 320px to 1920px viewports with zero horizontal scrolling.

---

## File Structure

```text
Dentist_Appointment_Booking_Portal/
├── index.html
├── pages/
│   ├── home-2.html
│   ├── about.html
│   ├── services.html
│   ├── service-details.html
│   ├── dentists.html
│   ├── dentist-details.html
│   ├── gallery.html
│   ├── booking.html
│   ├── contact.html
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── dashboard.html
│   ├── 404.html
│   └── coming-soon.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── dark-mode.css
│   │   └── rtl.css
│   ├── js/
│   │   ├── main.js
│   │   ├── booking.js
│   │   └── dashboard.js
│   └── images/
│       ├── hero-1.jpg
│       ├── hero-2.jpg
│       ├── clinic-lounge.jpg
│       ├── cosmetic-smile.jpg
│       ├── dentist-1.jpg
│       ├── dentist-2.jpg
│       ├── dentist-3.jpg
│       └── dentist-4.jpg
├── documentation/
│   └── index.html
└── README.md
```
