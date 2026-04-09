(function () {
  'use strict';

  // ---------- LANGUAGE SWITCHER ----------
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langLabel = document.getElementById('langLabel');
  const langOptions = document.querySelectorAll('.lang-switcher__option');
  const htmlLang = document.documentElement.lang;
  const defaultLang = htmlLang === 'en' ? 'en' : htmlLang === 'es' ? 'es' : 'pt';
  let currentLang = defaultLang;

  function applyLang(lang) {
    currentLang = lang;
    langLabel.textContent = lang.toUpperCase();

    // Update active state
    langOptions.forEach((o) => o.classList.remove('active'));
    const activeOption = document.querySelector('.lang-switcher__option[data-lang="' + lang + '"]');
    if (activeOption) activeOption.classList.add('active');

    // Update all translatable elements
    document.querySelectorAll('[data-' + lang + ']').forEach((el) => {
      const text = el.getAttribute('data-' + lang);
      if (text) {
        if (el.tagName === 'A' || el.tagName === 'BUTTON') {
          // Preserve icon inside buttons/links
          const icon = el.querySelector('i');
          if (icon) {
            el.textContent = '';
            el.appendChild(icon);
            el.append(' ' + text);
          } else {
            el.textContent = text;
          }
        } else {
          el.textContent = text;
        }
      }
    });

    // Update HTML lang attribute
    const langMap = { pt: 'pt-BR', en: 'en', es: 'es' };
    document.documentElement.lang = langMap[lang] || lang;

    // Update page title if a per-language title is defined
    const titleAttr = document.documentElement.getAttribute('data-title-' + lang);
    if (titleAttr) document.title = titleAttr;
  }

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    langDropdown.classList.remove('open');
  });

  function getLangUrl(targetLang) {
    const path = window.location.pathname;
    const slugs = ['casa-redonda', 'casa-alto-astral', 'casa-montanha', 'casinha'];

    // Find current page slug
    const slug = slugs.find(s => path.includes('/' + s + '/') || path.endsWith('/' + s)) || '';

    // Strip language prefix (/en or /es) to get site root
    let root = path.replace(/\/(en|es)(\/.*)?$/, '');

    // If no lang prefix was stripped, strip slug + filename (PT pages)
    if (root === path) {
      if (slug) {
        root = path.replace(new RegExp('/' + slug + '.*$'), '');
      } else {
        root = path.replace(/\/[^/]*$/, '');
      }
    }

    const page = slug ? '/' + slug + '/index.html' : '/index.html';

    if (targetLang === 'pt') return root + page;
    if (targetLang === 'en') return root + '/en' + page;
    if (targetLang === 'es') return root + '/es' + page;
  }

  langOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      if (lang === currentLang) return;
      langDropdown.classList.remove('open');
      const url = getLangUrl(lang);
      if (url) window.location.href = url;
    });
  });

  // Apply default language on load if not Portuguese
  if (defaultLang !== 'pt') applyLang(defaultLang);

  // ---------- HEADER SCROLL ----------
  const header = document.getElementById('header');

  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ---------- MOBILE NAV ----------
  const mobileToggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('nav');

  mobileToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const icon = mobileToggle.querySelector('i');
    if (nav.classList.contains('open')) {
      icon.className = 'ri-close-line';
    } else {
      icon.className = 'ri-menu-3-line';
    }
  });

  // Close mobile nav on link click
  nav.querySelectorAll('.header__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      mobileToggle.querySelector('i').className = 'ri-menu-3-line';
    });
  });

  // ---------- HERO SCROLL BUTTON ----------
  const scrollBtn = document.querySelector('.hero__scroll');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const gallery = document.getElementById('galeria');
      if (gallery) {
        gallery.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ---------- GALLERY ----------
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');

  if (galleryTrack && galleryPrev && galleryNext) {
    const scrollAmount = 400;

    galleryPrev.addEventListener('click', () => {
      galleryTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    galleryNext.addEventListener('click', () => {
      galleryTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Touch/drag scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    galleryTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      galleryTrack.style.cursor = 'grabbing';
      startX = e.pageX - galleryTrack.offsetLeft;
      scrollLeft = galleryTrack.scrollLeft;
    });

    galleryTrack.addEventListener('mouseleave', () => {
      isDown = false;
      galleryTrack.style.cursor = '';
    });

    galleryTrack.addEventListener('mouseup', () => {
      isDown = false;
      galleryTrack.style.cursor = '';
    });

    galleryTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - galleryTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      galleryTrack.scrollLeft = scrollLeft - walk;
    });
  }

  // ---------- LIGHTBOX ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const galleryImages = document.querySelectorAll('.gallery__img');
  let currentImageIndex = 0;

  function openLightbox(index) {
    currentImageIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt;
    lightboxCounter.textContent = (index + 1) + ' / ' + galleryImages.length;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;
    currentImageIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt;
    lightboxCounter.textContent = (index + 1) + ' / ' + galleryImages.length;
  }

  galleryImages.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentImageIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentImageIndex + 1));

  // Close lightbox on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
  });

  // ---------- SCROLL REVEAL ANIMATIONS ----------
  const revealElements = document.querySelectorAll(
    '.porque__card, .espaco__room, .comodidades__item, .localizacao__attraction, ' +
    '.avaliacoes__testimonial, .info__item, .anfitria__content, .avaliacoes__overview'
  );

  revealElements.forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Stagger animation delays for grid items
  document.querySelectorAll('.porque__grid, .comodidades__grid, .info__grid, .avaliacoes__testimonials, .localizacao__attractions-grid').forEach((grid) => {
    const children = grid.children;
    for (let i = 0; i < children.length; i++) {
      children[i].style.transitionDelay = (i * 0.08) + 's';
    }
  });

  // ---------- SMOOTH SCROLL for NAV LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = header.offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();
