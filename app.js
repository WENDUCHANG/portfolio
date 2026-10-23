(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const grid = document.querySelector('#project-grid');
  const projectDialog = document.querySelector('#project-dialog');
  const indexDialog = document.querySelector('#index-dialog');
  let activeProject = 0, activeSlide = 0;
  const el = (selector) => document.querySelector(selector);

  if (!projects.length) {
    grid.innerHTML = '<p class="load-error">项目数据没有加载出来。多半是 <code>projects.js</code> 里的语法错误，常见原因：少了逗号、引号没有闭合、括号不成对。</p>';
  }

  for (const [i, project] of projects.entries()) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.id = project.id;
    card.dataset.category = project.category;
    card.style.setProperty('--card-bg', project.color);
    card.innerHTML = `<button type="button" aria-label="Explore ${project.title}"><div class="project-image"><span class="image-index">0${i + 1} / PROJECT</span><img src="assets/${project.id}-cover.webp" alt="${project.title} — selected design outcome" loading="lazy" width="800" height="620"><span class="image-action" aria-hidden="true">↗</span></div><div class="project-meta"><span>${project.label}</span><span>0${i + 1}</span></div><h3 class="project-title">${project.title}</h3><p class="project-summary">${project.short}</p></button>`;
    card.querySelector('button').addEventListener('click', () => openProject(i));
    grid.append(card);

    const row = document.createElement('button');
    row.type = 'button'; row.className = 'index-row';
    row.innerHTML = `<span class="mono">0${i + 1}</span><span class="index-name">${project.title}</span><span class="mono index-category">${project.category.toUpperCase()}</span><span aria-hidden="true">↗</span>`;
    row.addEventListener('click', () => { indexDialog.close(); openProject(i); });
    el('#index-list').append(row);
  }

  // Keep the counts in the nav, toolbar and index in sync with the data file.
  const total = String(projects.length).padStart(2, '0');
  el('#project-count').textContent = `${total} PROJECTS`;
  const navCount = document.querySelector('.nav nav a[href="#work"] sup');
  if (navCount) navCount.textContent = total;
  const indexNote = document.querySelector('.index-note');
  if (indexNote) indexNote.textContent = `${total} PROJECTS / CLICK A TITLE TO EXPLORE`;

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      let count = 0;
      document.querySelectorAll('.project-card').forEach(card => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) count++;
      });
      el('#project-count').textContent = `${count} PROJECT${count !== 1 ? 'S' : ''}`;
    });
  });

  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function openProject(index) {
    activeProject = index; activeSlide = 0;
    const p = projects[index];
    el('#dialog-file').textContent = `${p.id}.project`;
    el('#dialog-category').textContent = p.label;
    el('#dialog-title').textContent = p.title;
    el('#dialog-subtitle').textContent = p.cn;
    el('#dialog-description').textContent = p.description;
    el('#project-position').textContent = `PROJECT 0${index + 1} / 0${projects.length}`;
    el('#case-thumbnails').replaceChildren();
    p.captions.forEach((caption, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `View image ${i + 1}: ${caption}`);
      button.innerHTML = `<img src="assets/${p.id}-${i + 1}.webp" alt="" loading="lazy">`;
      button.addEventListener('click', () => { activeSlide = i; updateSlide(); });
      el('#case-thumbnails').append(button);
    });
    updateSlide(); showDialog(projectDialog); projectDialog.scrollTop = 0;
  }
  function updateSlide() {
    const p = projects[activeProject];
    const image = el('#case-image');
    image.src = `assets/${p.id}-${activeSlide + 1}.webp`;
    image.alt = `${p.title}: ${p.captions[activeSlide]}`;
    el('#case-caption').textContent = p.captions[activeSlide];
    el('#slide-status').textContent = `0${activeSlide + 1} / 0${p.captions.length}`;
    el('#prev-slide').disabled = activeSlide === 0;
    el('#next-slide').disabled = activeSlide === p.captions.length - 1;
    el('#case-thumbnails').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === activeSlide)));
  }
  el('#prev-slide').addEventListener('click', () => { if (activeSlide > 0) { activeSlide--; updateSlide(); } });
  el('#next-slide').addEventListener('click', () => { if (activeSlide < projects[activeProject].captions.length - 1) { activeSlide++; updateSlide(); } });
  el('#next-project').addEventListener('click', () => openProject((activeProject + 1) % projects.length));
  [el('#index-open'), el('#archive-open')].forEach(button => button.addEventListener('click', () => showDialog(indexDialog)));
  [projectDialog, indexDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!projectDialog.open && !indexDialog.open) document.body.classList.remove('modal-open');
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  projectDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && activeSlide > 0) { event.preventDefault(); activeSlide--; updateSlide(); }
    if (event.key === 'ArrowRight' && activeSlide < projects[activeProject].captions.length - 1) { event.preventDefault(); activeSlide++; updateSlide(); }
  });
  el('#year').textContent = new Date().getFullYear();

  // A point-cloud torus: original, browser-rendered artwork with no external dependency.
  const canvas = el('#particle-art');
  const ctx = canvas.getContext('2d');
  if (!ctx) { el('#art-caption').textContent = 'A STUDY IN CONNECTION'; el('#motion-toggle').hidden = true; return; }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches, visible = true, width = 0, height = 0;
  let time = 0, previousTime = 0, frame = null, pointerX = 0, pointerY = 0;
  const points = [];
  let seed = 74;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 6200; i++) {
    const u = random() * Math.PI * 2, v = random() * Math.PI * 2;
    const r = .45 + .11 * Math.cos(u * 3);
    const radius = 1.03 + r * Math.cos(v);
    points.push({x:radius * Math.cos(u), y:radius * Math.sin(u), z:r * Math.sin(v) + .24 * Math.sin(u * 3), size:.35 + random() * .85});
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const ax = -.7 + pointerY * .25, ay = time * .16 + pointerX * .35, az = -.4;
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
    const scale = Math.min(width * .22, height * .24);
    const projected = points.map(p => {
      const y = p.y * cx - p.z * sx, z = p.y * sx + p.z * cx;
      const x = p.x * cy + z * sy, depth = -p.x * sy + z * cy;
      return {x:x * cz - y * sz, y:x * sz + y * cz, z:depth, size:p.size};
    }).sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const perspective = 4.5 / (4.5 - p.z);
      const opacity = .20 + ((p.z + 1.8) / 3.6) * .68;
      ctx.fillStyle = `rgba(23,25,23,${opacity.toFixed(2)})`;
      const size = p.size * perspective * 1.35;
      ctx.fillRect(width * .49 + p.x * scale * perspective, height * .44 + p.y * scale * perspective, size, size);
    }
    ctx.strokeStyle = '#626951';ctx.lineWidth = .65;
    const ox = width * .49, oy = height * .44;
    ctx.beginPath();ctx.moveTo(ox - 8, oy);ctx.lineTo(ox + 8, oy);ctx.moveTo(ox, oy - 8);ctx.lineTo(ox, oy + 8);ctx.stroke();
  }
  function tick(now) {
    frame = null;
    if (paused || !visible || document.hidden) return;
    if (now - previousTime >= 32) { time += Math.min((now - previousTime) / 1000, .06); previousTime = now; draw(); }
    frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    el('#motion-toggle').setAttribute('aria-pressed', String(paused));
    el('#motion-toggle').textContent = paused ? '▷ PLAY' : 'Ⅱ PAUSE';
    el('#motion-toggle').setAttribute('aria-label', paused ? 'Play particle animation' : 'Pause particle animation');
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; previousTime = performance.now();
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  canvas.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    const rect = canvas.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / width - .5; pointerY = (event.clientY - rect.top) / height - .5;
    if (paused) draw();
  });
  canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; if (paused) draw(); });
  el('#motion-toggle').addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMotion(); }).observe(canvas);
  resize(); syncMotion();
})();
