(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const tiltSelectors = [
    '.flip-card', '.flip-card-wrap', '.role-card', '.rule-card', '.phase',
    '.research-node', '.building-card', '.sim-card', '.trait-card',
    '.stat-card', '.noble-card', '.champ-card', '.element-card'
  ];

  const shimmerSelectors = [
    '.flip-front', '.role-card', '.rule-card', '.phase-header', '.bnav-item',
    '.top-nav-links a', '.ee-genalpha-button', '.btn-primary', '.btn-ghost',
    '.back-cta a', 'button'
  ];

  const revealSelectors = [
    '.section-wrap', '.stats-band', '.cards-grid > *', '.role-card', '.rule-card',
    '.phase', '.tip-box', '.ee-home-footer-banner'
  ];

  function uniqueElements(selectors) {
    return [...new Set(selectors.flatMap(selector => [...document.querySelectorAll(selector)]))];
  }

  function addClasses() {
    uniqueElements(tiltSelectors).forEach(el => el.classList.add('ga-tilt'));
    uniqueElements(shimmerSelectors).forEach(el => el.classList.add('ga-shimmer'));

    document.querySelectorAll('.section-wrap, .cards-grid, .ee-home-footer-banner')
      .forEach(el => el.classList.add('ga-pointer-glow'));

    uniqueElements(revealSelectors).forEach((el, index) => {
      el.classList.add(el.classList.contains('ga-tilt') ? 'ga-reveal-soft' : 'ga-reveal');
      el.style.setProperty('--ga-delay', `${Math.min((index % 8) * 55, 330)}ms`);
    });
  }

  function setupTilt() {
    if (!finePointer || reducedMotion) return;

    document.querySelectorAll('.ga-tilt').forEach(el => {
      let frame = 0;
      const max = el.matches('.flip-card,.flip-card-wrap') ? 5.2 : 4.2;

      const update = event => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;
          const ry = (px - .5) * max * 2;
          const rx = (.5 - py) * max * 2;
          el.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`);
          el.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`);
          el.classList.add('ga-hovering');
        });
      };

      const reset = () => {
        cancelAnimationFrame(frame);
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
        el.classList.remove('ga-hovering');
      };

      el.addEventListener('pointermove', update, { passive: true });
      el.addEventListener('pointerleave', reset, { passive: true });
      el.addEventListener('pointercancel', reset, { passive: true });
    });
  }

  function setupPointerGlow() {
    if (!finePointer || reducedMotion) return;
    document.querySelectorAll('.ga-pointer-glow').forEach(el => {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--local-x', `${event.clientX - rect.left}px`);
        el.style.setProperty('--local-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.ga-reveal,.ga-reveal-soft');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('ga-visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ga-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: .08 });

    elements.forEach(el => observer.observe(el));
  }

  function setupFooterParallax() {
    const footer = document.querySelector('.ee-home-footer-banner');
    const image = footer?.querySelector('img');
    if (!footer || !image || !finePointer || reducedMotion) return;

    footer.addEventListener('pointermove', event => {
      const rect = footer.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 4;
      image.style.setProperty('--footer-x', `${x.toFixed(2)}px`);
      image.style.setProperty('--footer-y', `${y.toFixed(2)}px`);
    }, { passive: true });

    footer.addEventListener('pointerleave', () => {
      image.style.setProperty('--footer-x', '0px');
      image.style.setProperty('--footer-y', '0px');
    }, { passive: true });
  }

  function spawnSparkles(event) {
    if (reducedMotion) return;
    const target = event.target.closest('button,a,.flip-card,.flip-card-wrap');
    if (!target) return;

    for (let i = 0; i < 4; i += 1) {
      const sparkle = document.createElement('span');
      sparkle.className = 'ga-sparkle';
      sparkle.style.left = `${event.clientX}px`;
      sparkle.style.top = `${event.clientY}px`;
      sparkle.style.setProperty('--sx', `${(Math.random() - .5) * 55}px`);
      sparkle.style.setProperty('--sy', `${(Math.random() - .7) * 55}px`);
      document.body.appendChild(sparkle);
      sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
    }
  }

  function setupDynamicViews() {
    // Existing SPA swaps views without reloading. Newly-visible content is refreshed gently.
    const views = document.querySelectorAll('.view');
    if (!views.length || !('MutationObserver' in window)) return;

    const observer = new MutationObserver(() => {
      document.querySelectorAll('.view.active .ga-reveal,.view.active .ga-reveal-soft').forEach(el => el.classList.add('ga-visible'));
    });
    views.forEach(view => observer.observe(view, { attributes: true, attributeFilter: ['class'] }));
  }

  function init() {
    addClasses();
    setupTilt();
    setupPointerGlow();
    setupReveal();
    setupFooterParallax();
    setupDynamicViews();
    document.addEventListener('pointerdown', spawnSparkles, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
