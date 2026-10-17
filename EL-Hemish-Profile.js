let servicesSwiper = null; // holds the Swiper instance so language toggle can sync direction

document.addEventListener('DOMContentLoaded', async function () {

  /* ---------- Sticky navbar shrink-on-scroll ---------- */
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    var onScroll = function () {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll-reveal for .fade-up elements ---------- */
  var revealEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('visible'); // kept for CSS that targets .visible instead of .is-visible
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: no IntersectionObserver support — just show everything
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
      el.classList.add('visible');
    });
  }

  /* ---------- Animated stat counters (8+, 15+, 100%) ---------- */
  var statEls = document.querySelectorAll('.stat-num');
  var animateCount = function (el) {
    var raw = el.textContent.trim();
    var suffix = raw.replace(/[0-9]/g, ''); // keep "+" or "%" etc.
    var target = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target)) return;

    var duration = 1200;
    var startTime = null;

    var step = function (timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
        el.setAttribute('data-counted', 'true');
      }
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && statEls.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- Respect reduced motion: skip JS-driven animation ---------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
      el.classList.add('visible');
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', function () {
    var current = '';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 80) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(function (a) {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) a.classList.add('active');
    });
  });

  /* ---------- i18n / RTL ---------- */
  var currentLang = localStorage.getItem('language') || 'en';
  await loadLanguage(currentLang);

  var translateBtn = document.getElementById('translateBtn');
  if (translateBtn) {
    translateBtn.addEventListener('click', async function () {
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      await loadLanguage(currentLang);
      translateBtn.textContent = currentLang === 'en' ? 'عربي' : 'English';
    });
  }

  async function loadLanguage(lang) {
    try {
      const response = await fetch(`./Assets/Lang/${lang}.json`);
      const translations = await response.json();

      document.querySelectorAll('[data-i18n]').forEach(function (element) {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
          element.textContent = translations[key];
        }
      });
    } catch (err) {
      console.warn(`Could not load language file for "${lang}":`, err);
    }

    // RTL support
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem('language', lang);

    // Keep the carousel in sync with direction changes made AFTER init
    // (e.g. user toggling the language button).
    if (servicesSwiper) {
      servicesSwiper.changeDirection(dir);
      servicesSwiper.update();
    }
  }

  /* ---------- Services carousel ---------- */
  var servicesSwiperEl = document.querySelector('.servicesSwiper');
  if (servicesSwiperEl && window.Swiper) {
    servicesSwiper = new Swiper(servicesSwiperEl, {
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 20,
      loop: true,
      dir: document.documentElement.dir || 'ltr', // match the language already applied above
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

});