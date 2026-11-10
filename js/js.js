   (() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 861px)');
  const hasIO = 'IntersectionObserver' in window;

  const header = document.getElementById('siteHeader');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]:not(.nav-cta)'));
  const progress = document.querySelector('.scroll-progress');

  /* ---------- Separar texto em letras, por palavra ---------- */
  const splitChars = (el) => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;

    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();

          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;

            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
              return;
            }

            const word = document.createElement('span');
            word.className = 'word';

            [...part].forEach((ch) => {
              const span = document.createElement('span');
              span.className = 'char';
              span.setAttribute('aria-hidden', 'true');
              span.style.setProperty('--i', i++);
              span.textContent = ch;
              word.appendChild(span);
            });

            frag.appendChild(word);
          });

          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };

    walk(el);
  };

  if (!reduceMotion) {
    document.querySelectorAll('.slide-title').forEach(splitChars);
  }

  /* ---------- Menu móvel ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => {
    setMenu(!nav.classList.contains('is-open'));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  isDesktop.addEventListener('change', (event) => {
    if (event.matches) {
      setMenu(false);
    }
  });

  /* ---------- Ao rolar: cabeçalho e progresso ---------- */
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('is-scrolled', y > 40);

    if (progress) {
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Slider ---------- */
  const hero = document.querySelector('[data-slider]');
  const slides = Array.from(hero.querySelectorAll('.slide'));
  const thumbs = Array.from(hero.querySelectorAll('.thumb'));
  const bar = hero.querySelector('.bar i');
  const currentEl = hero.querySelector('.current');
  let current = 0;

  const pad = (n) => String(n + 1).padStart(2, '0');

  const restartProgress = () => {
    hero.classList.remove('is-running');
    if (reduceMotion) return;
    void bar.offsetWidth;
    hero.classList.add('is-running');
  };

  const show = (n) => {
    const total = slides.length;
    const target = (n + total) % total;

    slides.forEach((slide, i) => {
      const active = i === target;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });

    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === target);
      thumb.setAttribute('aria-selected', String(i === target));
    });

    currentEl.textContent = pad(target);
    current = target;
    restartProgress();
  };

  bar.addEventListener('animationend', (event) => {
    if (event.animationName === 'fillBar') {
      show(current + 1);
    }
  });

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => show(i));
  });

  hero.querySelector('.prev').addEventListener('click', () => show(current - 1));
  hero.querySelector('.next').addEventListener('click', () => show(current + 1));

  hero.addEventListener('pointerenter', () => hero.classList.add('is-paused'));
  hero.addEventListener('pointerleave', () => hero.classList.remove('is-paused'));

  document.addEventListener('keydown', (event) => {
    if (nav.classList.contains('is-open')) return;

    const rect = hero.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight * 0.5;
    if (!inView) return;

    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'ArrowLeft') show(current - 1);
  });

  let startX = null;

  hero.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
  });

  hero.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 60) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });

  show(0);

  /* ---------- Animação ao aparecer ---------- */
  const revealElements = document.querySelectorAll('.reveal');

  if (hasIO && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Ligação ativa no menu ---------- */
  if (hasIO) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px'
    });

    sections.forEach((section) => activeObserver.observe(section));
  }
})();