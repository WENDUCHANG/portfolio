(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const groups = [
    { id: 'software', cn: '软件设计', en: 'SOFTWARE & INTERFACE', note: 'Interactive work, interfaces and digital systems' },
    { id: 'poster', cn: '海报', en: 'POSTER & PRINT', note: 'Printed matter, poster systems and image-making' },
    { id: 'type', cn: '字体', en: 'TYPEFACE & LETTERING', note: 'Letterforms, typefaces and typographic systems' },
    { id: 'object', cn: '实体', en: 'PUBLICATION & OBJECT', note: 'Books, packaging and material experiments' },
  ];
  const archive = document.querySelector('#project-archive');
  const projectDialog = document.querySelector('#project-dialog');
  const indexDialog = document.querySelector('#index-dialog');
  const zoomDialog = document.querySelector('#zoom-dialog');
  let activeProject = 0;
  const el = (selector) => document.querySelector(selector);
  const groupOf = (id) => groups.find(group => group.id === id);
  const indexOf = (id) => projects.findIndex(project => project.id === id);
  const pad = (n) => String(n).padStart(2, '0');

  if (!projects.length) {
    archive.innerHTML = '<p class="load-error">项目数据没有加载出来。多半是 <code>projects.js</code> 里的语法错误，常见原因：少了逗号、引号没有闭合、括号不成对。</p>';
  }

  for (const [g, group] of groups.entries()) {
    const primary = projects.filter(project => project.primary === group.id);
    const crossRefs = projects.filter(project => project.also.includes(group.id));
    if (!primary.length && !crossRefs.length) continue;

    const section = document.createElement('section');
    section.className = 'discipline';
    section.id = `discipline-${group.id}`;
    section.innerHTML = `
      <div class="discipline-head">
        <div class="discipline-title">
          <span class="mono discipline-index">[0${g + 1}]</span>
          <h3>${group.cn}<span>${group.en}</span></h3>
        </div>
        <div class="discipline-aside">
          <p class="discipline-note">${group.note}</p>
          <span class="mono discipline-count">${pad(primary.length)} PROJECT${primary.length === 1 ? '' : 'S'}</span>
        </div>
      </div>`;

    const grid = document.createElement('div');
    grid.className = 'project-grid';
    grid.dataset.count = String(primary.length);
    for (const project of primary) {
      const i = indexOf(project.id);
      const card = document.createElement('article');
      card.className = 'project-card';
      card.dataset.id = project.id;
      card.style.setProperty('--card-bg', project.color);
      card.innerHTML = `<button type="button" aria-label="Explore ${project.title}"><div class="project-image"><span class="image-index">${pad(i + 1)} / PROJECT</span><img src="assets/${project.id}-cover.webp" alt="${project.title} — final outcome" loading="lazy" width="800" height="620"><span class="image-action" aria-hidden="true">↗</span></div><div class="project-text"><div class="project-meta"><span>${project.label}</span><span>${pad(i + 1)}</span></div><h3 class="project-title">${project.title}</h3><p class="project-summary">${project.short}</p></div></button>`;
      card.querySelector('button').addEventListener('click', () => openProject(i));
      grid.append(card);
    }
    section.append(grid);

    if (crossRefs.length) {
      const list = document.createElement('ul');
      list.className = 'also-list';
      list.setAttribute('aria-label', `Also filed under ${group.en}`);
      for (const project of crossRefs) {
        const i = indexOf(project.id);
        const item = document.createElement('li');
        item.innerHTML = `<span class="mono">ALSO</span><button type="button">${project.title}<span aria-hidden="true">↗</span></button><span class="mono also-meta">${project.label}</span>`;
        item.querySelector('button').addEventListener('click', () => openProject(i));
        list.append(item);
      }
      section.append(list);
    }

    archive.append(section);
  }

  el('#project-count').textContent = `${pad(projects.length)} PROJECTS`;

  for (const [i, project] of projects.entries()) {
    const row = document.createElement('button');
    row.type = 'button'; row.className = 'index-row';
    row.innerHTML = `<span class="mono">${pad(i + 1)}</span><span class="index-name">${project.title}</span><span class="mono index-category">${groupOf(project.primary).en}</span><span aria-hidden="true">↗</span>`;
    row.addEventListener('click', () => { indexDialog.close(); openProject(i); });
    el('#index-list').append(row);
  }

  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }

  function openZoom(src, alt) {
    el('#zoom-image').src = src;
    el('#zoom-image').alt = alt;
    if (!zoomDialog.open) zoomDialog.showModal();
    document.body.classList.add('modal-open');
  }

  function renderFilm(project) {
    const slot = el('#film-slot');
    slot.replaceChildren();
    if (!project.video) return;
    const figure = document.createElement('figure');
    figure.className = 'film';
    figure.innerHTML = `<div class="figure-head mono"><span>FILM</span><span>CLICK TO PLAY</span></div><button type="button" class="film-facade"><img src="assets/${project.id}-cover.webp" alt=""><span class="film-play" aria-hidden="true">▶</span></button>`;
    figure.querySelector('button').addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = project.video;
      frame.title = `${project.title} — film`;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      figure.replaceChildren(frame);
    });
    slot.append(figure);
  }

  function openProject(index) {
    activeProject = index;
    const p = projects[index];
    el('#dialog-file').textContent = `${p.id}.project`;
    el('#dialog-category').textContent = p.label;
    el('#dialog-title').textContent = p.title;
    el('#dialog-subtitle').textContent = p.cn;
    el('#dialog-description').textContent = p.description;
    el('#project-position').textContent = `PROJECT ${pad(index + 1)} / ${pad(projects.length)}`;

    el('#dialog-tags').textContent = [p.primary, ...p.also].map(id => groupOf(id).en).join(' · ');
    const toolsBlock = el('#dialog-tools-block');
    if (p.tools && p.tools.length) {
      el('#dialog-tools').textContent = p.tools.join(', ');
      toolsBlock.hidden = false;
    } else {
      el('#dialog-tools').textContent = '';
      toolsBlock.hidden = true;
    }

    const outcomeSrc = `assets/${p.id}-cover.webp`;
    el('#outcome-image').src = outcomeSrc;
    el('#outcome-image').alt = `${p.title} — final outcome`;
    el('#outcome-caption').textContent = p.outcome;
    el('#outcome-button').onclick = () => openZoom(outcomeSrc, `${p.title} — final outcome`);

    const list = el('#process-list');
    list.replaceChildren();
    el('#process-range').textContent = `PROCESS 01 — ${pad(p.process.length)}`;
    p.process.forEach((caption, i) => {
      const src = `assets/${p.id}-${i + 1}.webp`;
      const figure = document.createElement('figure');
      figure.className = 'process-item';
      figure.innerHTML = `<button type="button" class="zoom-target"><img src="${src}" alt="${p.title}: ${caption}" loading="lazy"></button><figcaption class="mono"><span>${pad(i + 1)}</span>${caption}</figcaption>`;
      figure.querySelector('button').addEventListener('click', () => openZoom(src, `${p.title}: ${caption}`));
      list.append(figure);
    });

    renderFilm(p);
    showDialog(projectDialog);
    projectDialog.scrollTop = 0;
  }

  el('#next-project').addEventListener('click', () => openProject((activeProject + 1) % projects.length));
  [el('#index-open'), el('#archive-open')].forEach(button => button.addEventListener('click', () => showDialog(indexDialog)));
  [projectDialog, indexDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!projectDialog.open && !indexDialog.open && !zoomDialog.open) document.body.classList.remove('modal-open');
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  zoomDialog.addEventListener('click', () => zoomDialog.close());
  zoomDialog.addEventListener('close', () => {
    if (!projectDialog.open && !indexDialog.open) document.body.classList.remove('modal-open');
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
