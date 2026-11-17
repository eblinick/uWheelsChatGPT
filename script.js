'use strict';

// All five 2027 hero photographs; deal_ and 2026 images are intentionally excluded.
const vehicles = [
  { name: '2027 Corvette', file: '2027 Corvette.JPG', alt: '2027 Corvette, orange sports car' },
  { name: '2027 Honda Civic Hybrid', file: '2027 Honda Civic Hybrid.JPG', alt: '2027 Honda Civic Hybrid' },
  { name: '2027 Hyundai Kona', file: '2027 Hyundai Kona.JPG', alt: '2027 Hyundai Kona' },
  { name: '2027 Kia Seltos', file: '2027 Kia Seltos.webp', alt: '2027 Kia Seltos' },
  { name: '2027 Nissan Armada', file: '2027 Nissan Armada.JPG', alt: '2027 Nissan Armada' }
];
const slider = document.querySelector('.vehicle-slider');
const image = document.getElementById('hero-image');
const title = document.getElementById('vehicle-name');
const number = document.getElementById('slide-number');
const status = document.getElementById('slider-status');
const pauseButton = document.getElementById('slider-pause');
const dotsContainer = document.querySelector('.slide-dots');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;
let paused = motionPreference.matches;
let hovered = false;
let focused = false;
let timer;

const dots = vehicles.map((vehicle, index) => {
  const button = document.createElement('button');
  button.className = 'slide-dot';
  button.type = 'button';
  button.setAttribute('aria-label', `Show ${vehicle.name}`);
  button.setAttribute('aria-current', String(index === 0));
  button.addEventListener('click', () => showSlide(index, true));
  dotsContainer.append(button);
  // Preload other slides so transitions do not show an empty image.
  const preload = new Image();
  preload.src = `img/${encodeURIComponent(vehicle.file)}`;
  return button;
});

function scheduleSlide() {
  window.clearTimeout(timer);
  if (!paused && !hovered && !focused && !document.hidden) {
    timer = window.setTimeout(() => showSlide(activeSlide + 1), 6000);
  }
}

function showSlide(index, announce = false) {
  activeSlide = (index + vehicles.length) % vehicles.length;
  const vehicle = vehicles[activeSlide];
  image.src = `img/${encodeURIComponent(vehicle.file)}`;
  image.alt = vehicle.alt;
  title.textContent = vehicle.name;
  number.textContent = String(activeSlide + 1).padStart(2, '0');
  dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === activeSlide)));
  if (announce) status.textContent = `${vehicle.name}, vehicle ${activeSlide + 1} of ${vehicles.length}`;
  scheduleSlide();
}

function updatePauseButton() {
  pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.textContent = paused ? '▷' : 'Ⅱ';
  scheduleSlide();
}

document.getElementById('slider-prev').addEventListener('click', () => showSlide(activeSlide - 1, true));
document.getElementById('slider-next').addEventListener('click', () => showSlide(activeSlide + 1, true));
pauseButton.addEventListener('click', () => { paused = !paused; updatePauseButton(); });
slider.addEventListener('mouseenter', () => { hovered = true; scheduleSlide(); });
slider.addEventListener('mouseleave', () => { hovered = false; scheduleSlide(); });
slider.addEventListener('focusin', () => { focused = true; scheduleSlide(); });
slider.addEventListener('focusout', event => {
  focused = slider.contains(event.relatedTarget);
  scheduleSlide();
});
slider.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showSlide(activeSlide + (event.key === 'ArrowRight' ? 1 : -1), true);
  }
});
let touchStartX = null;
let touchStartY = null;
slider.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });
slider.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showSlide(activeSlide + (dx < 0 ? 1 : -1), true);
  touchStartX = touchStartY = null;
}, { passive: true });
document.addEventListener('visibilitychange', scheduleSlide);
motionPreference.addEventListener('change', event => { paused = event.matches; updatePauseButton(); });
updatePauseButton();

const menu = document.getElementById('main-nav');
const menuToggle = document.querySelector('.menu-toggle');
function closeMenu() {
  menu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuToggle.focus(); }
});
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);

// Highlight the section at the reading position, including short placeholders.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...menu.querySelectorAll('a')];
let scrollQueued = false;
function updateActiveSection() {
  const marker = document.querySelector('.site-header').getBoundingClientRect().height + 120;
  let current = sections[0].id;
  for (const section of sections) if (section.getBoundingClientRect().top <= marker) current = section.id;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) current = 'contact';
  navLinks.forEach(link => {
    if (link.getAttribute('href') === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateActiveSection); }
}, { passive: true });
window.addEventListener('resize', updateActiveSection);
updateActiveSection();
document.getElementById('year').textContent = String(new Date().getFullYear());

const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(contactForm);
  const subject = fields.get('subject').trim() || 'Ultimate Wheels 2U enquiry';
  const name = fields.get('name').trim();
  const email = fields.get('email').trim();
  const message = fields.get('message').trim();
  const body = `Name: ${name}\r\nEmail: ${email}\r\n\r\n${message.replace(/\r?\n/g, '\r\n')}`;
  window.location.href = `mailto:info@ultimatewheels2u.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
contactForm.querySelector('button[type="submit"]').disabled = false;

document.querySelectorAll('.team-portrait img').forEach(portrait => {
  const showInitials = () => { portrait.hidden = true; };
  portrait.addEventListener('error', showInitials);
  if (portrait.complete && portrait.naturalWidth === 0) showInitials();
});
