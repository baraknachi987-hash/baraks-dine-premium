/* BARAKS DINE interactions. All booking/contact actions are front-end demos. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const config = window.BARAKS_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer;

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
  }
  function safeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Private browsing can disable storage. */ }
  }
  function readStore(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function formatMoney(kes, currency) {
    const rates = config.currencyRates || { KES: 1 };
    const amount = Number(kes) * (rates[currency] || 1);
    try {
      return new Intl.NumberFormat((config.currencyLocales || {})[currency] || 'en-KE', {
        style: 'currency', currency, maximumFractionDigits: currency === 'KES' ? 0 : 2
      }).format(amount);
    } catch (_) { return `${currency} ${Math.round(amount).toLocaleString()}`; }
  }

  // Initial page state and preloader.
  document.documentElement.classList.add('js-ready');
  const year = $('#current-year');
  if (year) year.textContent = new Date().getFullYear();
  const loader = $('#preloader'), progress = $('#preloader-progress'), number = $('#preloader-number');
  let count = 0;
  const loadTimer = setInterval(() => {
    count = Math.min(100, count + (count < 70 ? 11 : 5));
    if (progress) progress.style.width = `${count}%`;
    if (number) number.textContent = String(count).padStart(2, '0');
    if (count >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => {
        loader?.classList.add('is-hidden');
        $('#curtain')?.classList.add('is-away');
        animateHero();
      }, 180);
    }
  }, 35);
  window.addEventListener('load', () => {
    if (count < 100) count = 90;
  }, { once: true });

  function animateHero() {
    const title = $('#hero-title');
    if (!title || reducedMotion || !window.gsap) {
      if (title) title.style.opacity = '1';
      return;
    }
    const text = title.textContent.trim();
    title.innerHTML = [...text].map((char, i) => `<span class="char" style="transition-delay:${i * 35}ms">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    window.gsap.to($$('.char', title), { opacity: 1, y: 0, rotateX: 0, duration: .85, stagger: .055, ease: 'power3.out', delay: .1 });
  }

  // Smooth scrolling, scroll effects and animated entrances (optional CDN libraries).
  let lenis;
  if (!reducedMotion && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .9 });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(time => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    }
  }
  const header = $('.site-header'), scrollBar = $('#scroll-progress');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (scrollBar) scrollBar.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    header?.classList.toggle('is-scrolled', scrollY > 25);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (!reducedMotion && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    $$('.reveal-up').forEach(el => window.gsap.fromTo(el, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: .9, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    }));
    $$('.reveal-image').forEach(el => window.gsap.to(el, {
      clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 82%' }
    }));
  } else {
    $$('.reveal-up,.reveal-image').forEach(el => { el.style.opacity = '1'; el.style.clipPath = 'none'; el.style.transform = 'none'; });
  }

  // Mobile navigation.
  const navToggle = $('#nav-toggle'), nav = $('#primary-nav');
  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open') || false;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#primary-nav a').forEach(link => link.addEventListener('click', () => {
    nav?.classList.remove('is-open'); navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Theme switch.
  const themeButton = $('#theme-toggle');
  function applyTheme(theme) {
    document.body.classList.toggle('is-light', theme === 'light');
    document.documentElement.dataset.theme = theme;
    themeButton?.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    safeStore('baraks-theme', theme);
  }
  applyTheme(readStore('baraks-theme') || 'dark');
  themeButton?.addEventListener('click', () => applyTheme(document.body.classList.contains('is-light') ? 'dark' : 'light'));

  // Language switch for the primary navigation, hero and about content.
  const languageSelect = $('#language-select');
  const originalI18n = new Map();
  $$('[data-i18n]').forEach(el => originalI18n.set(el, el.innerHTML));
  function applyLanguage(language) {
    const dict = (config.translations || {})[language] || (config.translations || {}).en || {};
    $$('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.innerHTML = dict[key];
      else if (originalI18n.has(el)) el.innerHTML = originalI18n.get(el);
    });
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    safeStore('baraks-language', language);
  }
  const savedLanguage = readStore('baraks-language') || 'en';
  if (languageSelect) { languageSelect.value = savedLanguage; applyLanguage(savedLanguage); languageSelect.addEventListener('change', () => applyLanguage(languageSelect.value)); }

  // Currency switch uses clearly illustrative rates held in config.js.
  const currencySelect = $('#currency-select');
  function applyCurrency(currency) {
    $$('.price[data-kes]').forEach(el => { el.textContent = formatMoney(el.dataset.kes, currency); });
    safeStore('baraks-currency', currency);
  }
  const savedCurrency = readStore('baraks-currency') || 'KES';
  if (currencySelect) { currencySelect.value = savedCurrency; applyCurrency(savedCurrency); currencySelect.addEventListener('change', () => applyCurrency(currencySelect.value)); }

  // Reduced-motion preference toggle.
  const motionToggle = $('#motion-toggle');
  motionToggle?.addEventListener('click', () => {
    const active = motionToggle.getAttribute('aria-pressed') !== 'true';
    motionToggle.setAttribute('aria-pressed', String(active));
    document.body.classList.toggle('motion-reduced', active);
    toast(active ? 'Reduced motion enabled. Reload to apply to all animations.' : 'Reduced motion preference disabled.');
    safeStore('baraks-reduced-motion', String(active));
  });
  if (readStore('baraks-reduced-motion') === 'true') { motionToggle?.setAttribute('aria-pressed', 'true'); document.body.classList.add('motion-reduced'); }

  // Cursor and magnetic buttons on fine-pointer devices.
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (matchMedia('(pointer:fine)').matches && !reducedMotion) {
    addEventListener('mousemove', e => {
      if (dot) { dot.style.opacity = '1'; dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`; }
      if (ring) { ring.style.opacity = '1'; ring.style.left = `${e.clientX}px`; ring.style.top = `${e.clientY}px`; }
    }, { passive: true });
    $$('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => ring?.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring?.classList.remove('is-hover'));
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px,${(e.clientY - r.top - r.height / 2) * .12}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // Video controls: sound toggle is user-initiated to respect autoplay rules.
  const heroVideo = $('#hero-video'), soundToggle = $('#sound-toggle'), musicToggle = $('#music-toggle');
  if (heroVideo && matchMedia('(min-width: 700px)').matches && !reducedMotion) {
    const attempt = heroVideo.play(); if (attempt?.catch) attempt.catch(() => {});
  }
  soundToggle?.addEventListener('click', () => {
    if (!heroVideo) return;
    heroVideo.muted = !heroVideo.muted;
    soundToggle.setAttribute('aria-pressed', String(!heroVideo.muted));
    const label = $('span:last-child', soundToggle); if (label) label.textContent = heroVideo.muted ? 'VIDEO SOUND OFF' : 'VIDEO SOUND ON';
  });
  musicToggle?.addEventListener('click', () => toast('No background-music track is configured in this demo. Add a licensed audio file to enable ambience.'));
  $$('.venue-card').forEach(card => {
    const video = $('video', card);
    card.addEventListener('mouseenter', () => { if (video) { const p = video.play(); p?.catch?.(() => {}); } });
    card.addEventListener('mouseleave', () => { if (video) { video.pause(); video.currentTime = 0; } });
  });

  // Room image slider: click one of the three dots on each card.
  $$('.image-slider').forEach(slider => {
    const images = (slider.dataset.images || '').split('|').filter(Boolean);
    const image = $('img', slider), dots = $$('.slider-dots button', slider);
    dots.forEach((button, index) => button.addEventListener('click', () => {
      if (!images[index] || !image) return;
      image.style.opacity = '.35';
      const next = new Image();
      next.onload = () => { image.src = images[index]; image.style.opacity = '1'; };
      next.onerror = () => { image.style.opacity = '1'; toast('That sample image could not be loaded.'); };
      next.src = images[index];
      dots.forEach(dotButton => dotButton.classList.remove('is-active'));
      button.classList.add('is-active');
      const counter = $('.room-card__number', slider);
      if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    }));
  });
  // Subtle tilt effect, only on pointer devices.
  if (matchMedia('(pointer:fine)').matches && !reducedMotion) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // Dining menu popup.
  const menus = {
    fine: { title: 'The Signature — Fine Dining', copy: 'A seasonal tasting selection. Sample prices in KES.', items: [['Garden in Bloom','1,800'],['Coastal Reverie','3,600'],['Ember & Earth','4,200'],['Golden Hour','1,500']] },
    roof: { title: 'Above It All — Rooftop Lounge', copy: 'Small plates and evening favourites. Sample prices in KES.', items: [['Crisp Calamari','2,200'],['Citrus Prawns','2,800'],['Sunset Mezze','1,900'],['House Mocktail','850']] },
    steak: { title: 'Fire & Flavour — Steakhouse', copy: 'Open-fire signatures. Sample prices in KES.', items: [['Ribeye 300g','5,800'],['Fillet 250g','5,200'],['Charred Seasonal Greens','1,100'],['Truffle Mash','950']] },
    cafe: { title: 'Slow Mornings — Café & Bakery', copy: 'Freshly baked and brewed. Sample prices in KES.', items: [['Butter Croissant','550'],['Almond Danish','650'],['Single-Origin Coffee','450'],['Seasonal Tart','700']] }
  };
  const menuDialog = $('#menu-dialog');
  $$('.menu-open').forEach(btn => btn.addEventListener('click', () => {
    const menu = menus[btn.dataset.venue]; if (!menu || !menuDialog) return;
    $('#menu-dialog-title').textContent = menu.title;
    $('#menu-dialog-copy').textContent = menu.copy;
    $('#menu-dialog-items').innerHTML = menu.items.map(([name, price]) => `<div class="dialog-menu-item"><strong>${name}</strong><span>KES ${price}</span></div>`).join('');
    if (menuDialog.showModal) menuDialog.showModal(); else toast(menu.title);
  }));

  // Signature dish category filter.
  $$('.filter-button').forEach(button => button.addEventListener('click', () => {
    $$('.filter-button').forEach(b => b.classList.toggle('is-active', b === button));
    const filter = button.dataset.filter;
    $$('.dish-card').forEach(card => card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter));
  }));

  // Gallery lightbox.
  const lightbox = $('#lightbox');
  $$('.gallery-item').forEach(button => button.addEventListener('click', () => {
    const full = button.dataset.full, image = $('#lightbox-image');
    if (!full || !image || !lightbox) return;
    image.src = full; image.alt = $('img', button)?.alt || 'Gallery photograph';
    $('#lightbox-caption').textContent = $('span', button)?.textContent || '';
    if (lightbox.showModal) lightbox.showModal();
  }));
  $$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
  [menuDialog, lightbox].forEach(dialog => dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }));

  // Chef flip cards can be activated by keyboard or touch.
  $$('.chef-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); } });
  });

  // Testimonial carousel.
  const testimonials = $$('.testimonial'), testimonialDots = $$('.testimonial-dots button');
  let testimonialIndex = 0;
  function showTestimonial(index) {
    if (!testimonials.length) return;
    testimonialIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle('is-active', i === testimonialIndex));
    testimonialDots.forEach((item, i) => item.classList.toggle('is-active', i === testimonialIndex));
  }
  $('#testimonial-prev')?.addEventListener('click', () => showTestimonial(testimonialIndex - 1));
  $('#testimonial-next')?.addEventListener('click', () => showTestimonial(testimonialIndex + 1));
  testimonialDots.forEach((dotButton, i) => dotButton.addEventListener('click', () => showTestimonial(i)));

  // Booking tab switch and date minimums/validation.
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const todayString = today.toISOString().slice(0, 10);
  ['#checkin', '#checkout', '#dine-date'].forEach(selector => { const input = $(selector); if (input) input.min = todayString; });
  $('#checkin')?.addEventListener('change', e => { const out = $('#checkout'); if (out) { out.min = e.target.value; if (out.value && out.value <= e.target.value) out.value = ''; } });
  $$('[data-booking-tab]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.bookingTab;
    $$('[data-booking-tab]').forEach(tab => { const active = tab === button; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
    $('#room-booking')?.classList.toggle('is-active', type === 'rooms');
    $('#table-booking')?.classList.toggle('is-active', type === 'table');
  }));
  $('#room-booking')?.addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const checkin = $('#checkin').value, checkout = $('#checkout').value;
    if (!checkin || !checkout || checkout <= checkin) { toast('Check-out date must be later than check-in.'); $('#checkout')?.focus(); return; }
    const details = new URLSearchParams({ type: 'Room enquiry', checkin, checkout, guests: $('#room-guests').value, room: $('#room-type').value });
    toast('Demo request validated. No booking has been made.');
    console.info('[BARAKS DINE demo booking]', details.toString());
  });
  $('#table-booking')?.addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return;
    toast('Demo table request validated. No table has been reserved.');
    console.info('[BARAKS DINE demo table request]', Object.fromEntries(new FormData(form)));
  });
  $('#contact-form')?.addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return;
    toast('Thank you. This demo does not send messages yet. Connect an email/CRM endpoint.');
    console.info('[BARAKS DINE demo contact]', Object.fromEntries(new FormData(form)));
    form.reset();
  });
  $('#newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return;
    toast('Thanks for your interest. Newsletter delivery is not connected yet.'); form.reset();
  });

  // Sample campaign countdown, seven days from first visit.
  const campaignKey = 'baraks-campaign-end';
  let campaignEnd = Number(readStore(campaignKey));
  if (!campaignEnd || !Number.isFinite(campaignEnd) || campaignEnd < Date.now()) {
    campaignEnd = Date.now() + 7 * 24 * 60 * 60 * 1000; safeStore(campaignKey, String(campaignEnd));
  }
  function updateCountdown() {
    const remain = Math.max(0, campaignEnd - Date.now());
    const days = Math.floor(remain / 86400000), hours = Math.floor(remain / 3600000) % 24, mins = Math.floor(remain / 60000) % 60, secs = Math.floor(remain / 1000) % 60;
    [['count-days', days], ['count-hours', hours], ['count-minutes', mins], ['count-seconds', secs]].forEach(([id, val]) => { const el = $(`#${id}`); if (el) el.textContent = String(val).padStart(2, '0'); });
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  // WhatsApp: only compose a real destination when a verified number is configured.
  const wa = $('#whatsapp-link');
  if (wa && config.whatsappNumber) wa.href = `https://wa.me/${String(config.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent('Hello BARAKS DINE, I have an enquiry.')}`;
  else wa?.addEventListener('click', e => { e.preventDefault(); toast('Add the verified WhatsApp number in js/config.js before launch.'); });

  // Chat widget is a local visual demo, not a connected agent.
  const chatPanel = $('#chat-panel'), chatLaunch = $('#chat-launch');
  function setChat(open) { if (chatPanel) chatPanel.hidden = !open; chatLaunch?.setAttribute('aria-expanded', String(open)); }
  chatLaunch?.addEventListener('click', () => setChat(chatPanel?.hidden));
  $('#chat-close')?.addEventListener('click', () => setChat(false));
  $('#chat-form')?.addEventListener('submit', e => {
    e.preventDefault(); const input = $('#chat-message'), value = input?.value.trim(); if (!value) return;
    const messages = $('#chat-messages'); const bubble = document.createElement('p'); bubble.className = 'chat-bubble chat-bubble--user'; bubble.textContent = value; messages?.append(bubble); input.value = '';
    const answer = document.createElement('p'); answer.className = 'chat-bubble chat-bubble--agent'; answer.textContent = 'Thank you for your message. This sample concierge is not connected yet. Please use the contact form or configured WhatsApp channel.'; messages?.append(answer); messages.scrollTop = messages.scrollHeight;
  });

  // Cookie banner stores the user's preference locally.
  const cookieBanner = $('#cookie-banner');
  if (!readStore('baraks-cookie-choice')) setTimeout(() => { if (cookieBanner) cookieBanner.hidden = false; }, 1500);
  ['cookie-accept', 'cookie-reject'].forEach(id => $(`#${id}`)?.addEventListener('click', () => {
    safeStore('baraks-cookie-choice', id === 'cookie-accept' ? 'accepted' : 'declined'); if (cookieBanner) cookieBanner.hidden = true;
  }));
})();
