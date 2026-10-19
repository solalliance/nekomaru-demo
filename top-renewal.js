(() => {
  const root = document.querySelector('.nekomaru-top');
  const header = root.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
  const menuButton = root.querySelector('.menu-toggle');
  const menu = root.querySelector('#mobile-menu');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'メニューを開く'); root.classList.remove('menu-open'); }
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く'); root.classList.toggle('menu-open', open); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); menuButton.focus(); } });
  matchMedia('(min-width:761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  const video = root.querySelector('video');
  const control = root.querySelector('#video-toggle');
  function updateControl() { control.textContent = video.paused ? '▷' : 'Ⅱ'; control.setAttribute('aria-label', video.paused ? '動画を再生' : '動画を一時停止'); }
  control.addEventListener('click', async () => { if (video.paused) { try { await video.play(); } catch {} } else video.pause(); updateControl(); });
  video.addEventListener('play', updateControl); video.addEventListener('pause', updateControl);
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  function respectMotion() { if (reduced.matches) { video.pause(); control.hidden = true; } else { control.hidden = false; } }
  reduced.addEventListener('change', respectMotion); respectMotion();
  // Reveal once, in small groups. Never hide content from reduced-motion users.
  let revealObserver;
  const revealTargets = root.querySelectorAll('.concept-text, .concept-image, .section-heading, .style-card, .price-copy, .cat-grid article, .model-image, .model-copy, .spec-links a, .contact > .eyebrow, .contact > h2, .contact > p:not(.eyebrow), .contact-links');
  function enableReveals() {
    if (reduced.matches || !('IntersectionObserver' in window)) {
      root.classList.remove('motion-ready');
      revealObserver?.disconnect();
      return;
    }
    root.classList.add('motion-ready');
    revealObserver?.disconnect();
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    revealTargets.forEach(el => {
      el.classList.add('reveal');
      const group = el.parentElement;
      if (group.matches('.style-grid, .cat-grid, .spec-links')) {
        const index = [...group.children].indexOf(el);
        const columns = group.matches('.style-grid, .spec-links') ? 3 : 4;
        el.style.setProperty('--reveal-delay', `${(index % columns) * 70}ms`);
      }
      revealObserver.observe(el);
    });
  }
  enableReveals();
  reduced.addEventListener('change', enableReveals);
  root.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      const target = hash === '#' ? root : document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      closeMenu();
      const top = hash === '#' ? 0 : target.getBoundingClientRect().top + window.scrollY - 90;
      history.pushState(null, '', hash);
      window.scrollTo({ top: Math.max(0, top), behavior: reduced.matches ? 'instant' : 'smooth' });
      if (hash !== '#') {
        const hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  });
})();
