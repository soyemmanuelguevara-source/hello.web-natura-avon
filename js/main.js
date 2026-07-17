(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ LOADING SCREEN ============ */
  const loadingScreen = document.getElementById('loading-screen');
  const hideLoadingScreen = () => loadingScreen && loadingScreen.classList.add('loaded');
  window.addEventListener('load', () => setTimeout(hideLoadingScreen, 400));
  // Red lenta o una imagen que nunca termina de cargar no debe dejar
  // el overlay bloqueando el sitio para siempre.
  setTimeout(hideLoadingScreen, 4000);

  /* ============ HEADER SCROLL STATE ============ */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ============ ALTO REAL DEL HEADER ============
     El menú siempre visible puede ocupar 1, 2 o 3 filas según el
     ancho de pantalla; el hero y el scroll a anclas usan esta
     variable en vez de un valor fijo para no quedar tapados. */
  const setHeaderHeightVar = () => {
    document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  };
  setHeaderHeightVar();
  window.addEventListener('load', setHeaderHeightVar);
  let headerResizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(headerResizeTimeout);
    headerResizeTimeout = setTimeout(setHeaderHeightVar, 150);
  });

  /* ============ FOOTER YEAR ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ============ HERO TITLE: TYPEWRITER + COLOR CYCLE ============ */
  const heroLines = document.querySelectorAll('.hero-line');
  if (heroLines.length) {
    if (prefersReducedMotion) {
      heroLines.forEach((line) => { line.textContent = line.dataset.text || ''; });
    } else {
      let globalIndex = 0;
      const typeLine = (line, done) => {
        const text = line.dataset.text || '';
        let i = 0;
        const step = () => {
          if (i >= text.length) { done(); return; }
          const char = text[i];
          const span = document.createElement('span');
          span.className = 'letter' + (char === ' ' ? ' is-space' : '');
          span.textContent = char === ' ' ? ' ' : char;
          span.style.animationDelay = `${i * 0.035}s, ${globalIndex * 0.09}s`;
          line.appendChild(span);
          i += 1;
          globalIndex += 1;
          setTimeout(step, 42);
        };
        step();
      };
      const lines = Array.from(heroLines);
      const typeAll = (idx) => {
        if (idx >= lines.length) return;
        typeLine(lines[idx], () => typeAll(idx + 1));
      };
      setTimeout(() => typeAll(0), 500);
    }
  }

  /* ============ HERO ROTATING WORD ============ */
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const words = ['ganar en grande', 'ser tu propia jefa', 'lograr libertad financiera', 'crecer sin límites'];
    if (prefersReducedMotion) {
      typewriterEl.textContent = words[0];
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const current = words[wordIndex];
        if (!deleting) {
          charIndex += 1;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, 1800);
            return;
          }
          setTimeout(tick, 65);
        } else {
          charIndex -= 1;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(tick, 400);
            return;
          }
          setTimeout(tick, 35);
        }
      };
      setTimeout(tick, 2200);
    }
  }

  /* ============ HERO PARTICLES ============ */
  const canvas = document.getElementById('particles-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const colors = ['rgba(236,0,140,0.55)', 'rgba(107,44,145,0.5)', 'rgba(247,148,29,0.45)'];
    let particles = [];
    let width, height, rafId;

    const resize = () => {
      const hero = canvas.closest('.hero');
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    };

    const createParticles = () => {
      const count = Math.min(70, Math.round((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        createParticles();
        draw();
      }, 200);
    });
  }
})();
