/* =========================================================
   Pushpendra Pal — Portfolio interactions
   Vanilla JS. No dependencies. Reduced-motion aware.
   ========================================================= */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- 1. Scroll reveals ---------- */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 2. Nav: stuck state + mobile menu ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  const menuBtn = $('#navMenu');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__links a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- 3. Side rail progress (0 -> 100) ---------- */
  const railFill = $('#railFill');
  const railNum  = $('#railNum');
  const updateRail = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    if (railFill) railFill.style.height = (p * 100).toFixed(1) + '%';
    if (railNum)  railNum.textContent = String(Math.round(p * 100)).padStart(2, '0');
  };
  updateRail();
  window.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);

  /* ---------- 4. Hero plot: build the 0 -> 100 trajectory ---------- */
  // data points (x 0..460, y where 320=0 value, 20=peak). Career climb.
  const pts = [
    { x: 20,  y: 270, label: 'Bhoomicam' },
    { x: 150, y: 220, label: 'ISB' },
    { x: 300, y: 120, label: 'NxtWave' },
    { x: 440, y: 34,  label: 'DapplePot', peak: true }
  ];
  const line = $('#plotLine');
  const area = $('#plotArea');
  const nodesG = $('#plotNodes');
  if (line && area && nodesG) {
    // smooth-ish path via catmull-rom -> bezier
    const d = smoothPath(pts);
    line.setAttribute('d', d);
    area.setAttribute('d', `${d} L ${pts[pts.length-1].x} 320 L ${pts[0].x} 320 Z`);
    nodesG.innerHTML = ''; // clear static no-JS fallback nodes before animating
    pts.forEach((p, i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', p.peak ? 7 : 5);
      c.setAttribute('class', p.peak ? 'plot__node plot__node--peak' : 'plot__node');
      c.style.opacity = '0';
      nodesG.appendChild(c);
      if (!reduce) {
        setTimeout(() => { c.style.transition = 'opacity .4s'; c.style.opacity = '1'; }, 900 + i * 350);
      } else { c.style.opacity = '1'; }
    });
    // draw the line when hero is visible
    const drawLine = () => {
      const len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = reduce ? 0 : len;
      if (!reduce) {
        requestAnimationFrame(() => {
          line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.2,.7,.2,1)';
          line.style.strokeDashoffset = 0;
        });
      }
    };
    drawLine();
  }

  function smoothPath(p) {
    if (p.length < 2) return '';
    let d = `M ${p[0].x} ${p[0].y}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  /* ---------- 5. Climb line draw on view ---------- */
  const climbLine = $('#climbLine');
  if (climbLine) {
    if (reduce) {
      climbLine.style.strokeDashoffset = 0;
    } else if ('IntersectionObserver' in window) {
      const len = climbLine.getTotalLength();
      climbLine.style.strokeDasharray = len;
      climbLine.style.strokeDashoffset = len;
      const cObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            climbLine.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.2,.7,.2,1)';
            climbLine.style.strokeDashoffset = 0;
            obs.disconnect();
          }
        });
      }, { threshold: 0.15 });
      cObs.observe($('.climb'));
    }
  }

  /* ---------- 6. Count-up stats ---------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1400, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (k === 1 ? suffix : '');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); cIo.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => cIo.observe(c));
  } else {
    counters.forEach(runCount);
  }

  /* ---------- 7. Project modal ---------- */
  const modal = $('#pModal');
  if (modal) {
    const pmBanner = $('#pmBanner');
    const pmIdx = $('#pmIdx');
    const pmTitle = $('#pmTitle');
    const pmDesc = $('#pmDesc');
    const pmLinks = $('#pmLinks');
    let lastFocus = null;

    const openModal = (project) => {
      const img = project.querySelector('.project__media img');
      const idx = project.querySelector('.project__idx');
      const title = project.querySelector('.project__title');
      const data = project.querySelector('.project__data'); // <template>
      const content = data ? data.content.cloneNode(true) : null;

      // banner
      if (img) {
        pmBanner.innerHTML = `<img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt') || ''}" />`;
        pmBanner.classList.add('has-img');
      } else {
        pmBanner.innerHTML = '';
        pmBanner.classList.remove('has-img');
      }
      pmIdx.textContent = idx ? idx.textContent : '';
      pmTitle.textContent = title ? title.textContent : '';
      pmDesc.innerHTML = '';
      pmLinks.innerHTML = '';
      if (content) {
        const desc = content.querySelector('.pm-desc');
        const links = content.querySelector('.pm-links');
        if (desc) pmDesc.append(...desc.childNodes);
        if (links) [...links.querySelectorAll('a')].forEach((a) => pmLinks.appendChild(a));
      }

      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-lock');
      modal.querySelector('.modal__x').focus();
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-lock');
      modal.querySelector('.modal__dialog').scrollTop = 0;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    $$('.project__open').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.closest('.project')));
    });
    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  /* ---------- 8. Active nav link on scroll ---------- */
  const sections = ['journey', 'work', 'cases', 'reading', 'contact']
    .map((id) => document.getElementById(id)).filter(Boolean);
  const navLinks = new Map($$('.nav__links a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window && sections.length) {
    const sIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = navLinks.get(e.target.id);
        if (link) link.style.color = e.isIntersecting ? 'var(--accent)' : '';
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => sIo.observe(s));
  }

  /* ---------- 9. Source favicons for reading links (with letter fallback) ---------- */
  $$('#reading a.pill[href]').forEach((a) => {
    let host;
    try { host = new URL(a.href).hostname.replace(/^www\./, ''); } catch (e) { return; }
    const wrap = document.createElement('span');
    wrap.className = 'pill__ico';
    const letter = document.createElement('span');
    letter.className = 'pill__ico-fallback';
    letter.textContent = (host[0] || '•').toUpperCase();
    const ico = document.createElement('img');
    ico.src = `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
    ico.alt = '';
    ico.loading = 'lazy';
    ico.addEventListener('load', () => { if (ico.naturalWidth > 1) letter.style.display = 'none'; });
    ico.addEventListener('error', () => { ico.remove(); });
    wrap.appendChild(letter);
    wrap.appendChild(ico);
    a.insertBefore(wrap, a.firstChild);
  });
})();
