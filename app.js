const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  mobileNav.hidden = isOpen;
});
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function activateTab(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); activateTab(target, true); }
  });
});

const dialog = document.querySelector('#brief-dialog');
const form = document.querySelector('#brief-form');
const serviceField = document.querySelector('#service-field');
const result = document.querySelector('#brief-result');
const preview = document.querySelector('#brief-preview');
const copyStatus = document.querySelector('#copy-status');
let opener;
document.querySelectorAll('[data-brief]').forEach(button => {
  button.addEventListener('click', () => {
    opener = button;
    serviceField.value = button.dataset.brief;
    form.hidden = false;
    result.hidden = true;
    copyStatus.textContent = '';
    closeMenu();
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.scrollTop = 0;
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (opener) opener.focus(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const body = [
    'Здравствуйте, команда Relevant!',
    '',
    'Интересует: ' + data.get('service'),
    'Имя: ' + data.get('name').trim(),
    'Контакт для связи: ' + data.get('contact').trim(),
    data.get('company').trim() ? 'Компания / профиль: ' + data.get('company').trim() : '',
    '',
    data.get('task').trim() ? 'Задача:\n' + data.get('task').trim() : 'Хочу обсудить возможности продвижения бизнеса на Авито.'
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join('\n');
  preview.textContent = body;
  document.querySelector('#mailto-result').href = 'mailto:info@relevant.ru?subject=' + encodeURIComponent('Авито — ' + data.get('service')) + '&body=' + encodeURIComponent(body);
  form.hidden = true;
  result.hidden = false;
  dialog.scrollTop = 0;
  document.querySelector('#mailto-result').focus();
});
document.querySelector('#edit-brief').addEventListener('click', () => { result.hidden = true; form.hidden = false; serviceField.focus(); });
document.querySelector('#copy-brief').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(preview.textContent);
    copyStatus.textContent = 'Текст скопирован. Отправьте его на info@relevant.ru.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    copyStatus.textContent = 'Выделили текст обращения. Скопируйте его и отправьте на info@relevant.ru.';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelector('.hero-video').pause();

const captureDialog = document.querySelector('#capture-dialog');
const captureFull = document.querySelector('#capture-full');
const captureTitle = document.querySelector('#capture-title');
const captureDownload = document.querySelector('#capture-download');
const captureSource = document.querySelector('#capture-source');
let captureOpener;
document.querySelectorAll('[data-capture]').forEach(button => {
  button.addEventListener('click', () => {
    captureOpener = button;
    captureFull.src = button.dataset.capture;
    captureFull.alt = button.dataset.caption;
    captureTitle.textContent = button.dataset.caption;
    captureDownload.href = button.dataset.capture;
    captureDownload.download = button.dataset.capture.split('/').pop();
    captureSource.hidden = !button.dataset.source;
    if (button.dataset.source) {
      captureSource.href = button.dataset.source;
      captureSource.textContent = 'Источник: ' + button.dataset.sourceLabel;
    } else {
      captureSource.removeAttribute('href');
      captureSource.textContent = '';
    }
    captureDialog.showModal();
    document.body.classList.add('modal-open');
    captureDialog.scrollTop = 0;
  });
});
captureDialog.querySelector('.capture-close').addEventListener('click', () => captureDialog.close());
captureDialog.addEventListener('click', event => {
  if (event.target === captureDialog) {
    const rect = captureDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) captureDialog.close();
  }
});
captureDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (captureOpener) captureOpener.focus();
});

// Small, viewport-driven animations. Screenshots remain the no-JS fallback.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const number = new Intl.NumberFormat('ru-RU');
  const dailyViews = [174,203,232,222,251,271,261,290,329,309,338,367,358,406,396,425,445,435,464,483,503,542,561,532,600,619,580,658,640,586];
  const svgNS = 'http://www.w3.org/2000/svg';
  const sceneElements = Array.from(document.querySelectorAll('[data-listing-scene]'));
  const chartElements = Array.from(document.querySelectorAll('[data-motion-chart]'));
  const route = document.querySelector('[data-promotion-route]');
  const routeSteps = route ? Array.from(route.querySelectorAll('.route-step')) : [];
  const observers = [];
  let manualPause = false;
  let enabled = false;
  let scrollFrame = 0;

  function svgElement(tag, attributes = {}) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  chartElements.forEach(chart => {
    const expenses = chart.dataset.motionChart === 'expenses';
    const values = expenses ? dailyViews.map(value => value * 5) : dailyViews;
    const maximum = expenses ? 4000 : 800;
    const overlay = chart.querySelector('.chart-motion');
    overlay.innerHTML = `<span class="chart-top"><span>${expenses ? 'Все расходы' : 'Просмотры'}</span><strong>${expenses ? '62 400 ₽' : '12 480'}</strong></span><span class="chart-period">19 октября — 17 ноября · по дням</span><span class="chart-plot"><span class="chart-axis"><span>${number.format(maximum)}</span><span>${number.format(maximum / 2)}</span><span>0</span></span><span class="chart-drawing"></span></span><span class="chart-dates"><span>19 окт</span><span>26 окт</span><span>2 нояб</span><span>9 нояб</span><span>17 нояб</span></span><span class="chart-foot"></span>`;
    const svg = svgElement('svg', { viewBox: '0 0 600 210', preserveAspectRatio: 'none' });
    [0,105,209].forEach(y => svg.append(svgElement('line', { x1:0, x2:600, y1:y, y2:y, class:'chart-guide' })));
    values.forEach((value, index) => {
      const group = svgElement('g', { class:'chart-column', style:`--bar-delay:${index * 18}ms` });
      const title = svgElement('title');
      const date = new Date(Date.UTC(2026, 9, 19 + index));
      title.textContent = `${date.toLocaleDateString('ru-RU', {day:'numeric',month:'short',timeZone:'UTC'})}: ${number.format(value)}${expenses ? ' ₽' : ' просмотров'}`;
      group.append(title);
      const height = value / maximum * 209;
      const x = index * 20 + 3;
      if (expenses) {
        const promotion = height * 36000 / 62400;
        const placement = height * 21600 / 62400;
        const tools = height - promotion - placement;
        group.append(svgElement('rect',{x,y:209-promotion,width:14,height:promotion,fill:'#38d96b'}));
        group.append(svgElement('rect',{x,y:209-promotion-placement,width:14,height:placement,fill:'#40bdf1'}));
        group.append(svgElement('rect',{x,y:209-height,width:14,height:tools,fill:'#cfc4ad'}));
      } else {
        group.append(svgElement('rect',{x,y:209-height,width:14,height,rx:4,fill:'#40bdf1'}));
      }
      svg.append(group);
    });
    overlay.querySelector('.chart-drawing').append(svg);
    const foot = overlay.querySelector('.chart-foot');
    if (expenses) {
      foot.innerHTML = '<span class="chart-legend-item" style="--legend-color:#38d96b"><span>Продвижение</span><strong>36 000 ₽</strong></span><span class="chart-legend-item" style="--legend-color:#40bdf1"><span>Размещения</span><strong>21 600 ₽</strong></span><span class="chart-legend-item" style="--legend-color:#cfc4ad"><span>Инструменты</span><strong>4 800 ₽</strong></span>';
    } else {
      foot.innerHTML = '<span class="chart-summary"><span class="chart-summary-dot"></span>Интерес к объявлениям за 30 дней</span>';
    }
    chart.classList.add('chart-ready');
  });

  const scenes = sceneElements.map(element => {
    const steps = Array.from(element.querySelectorAll('[data-assembly-step]'));
    const replay = element.querySelector('[data-assembly-replay]');
    let timers = [];
    let played = false;
    let awaitingImage = false;
    function cancel() { timers.forEach(clearTimeout); timers = []; }
    function stage(value) {
      element.dataset.stage = String(value);
      steps.forEach(step => {
        const index = Number(step.dataset.assemblyStep);
        step.classList.toggle('is-current', index === value);
        step.classList.toggle('is-complete', index < value);
      });
    }
    function finish() { cancel(); stage(4); element.classList.remove('is-assembling'); }
    function play() {
      if (!enabled || document.hidden) { finish(); return; }
      const image = element.querySelector('.assembly-viewport>img');
      if (image && !image.complete) {
        if (!awaitingImage) {
          awaitingImage = true;
          image.addEventListener('load', () => {
            awaitingImage = false;
            const rect = element.getBoundingClientRect();
            if (rect.width && rect.bottom > 0 && rect.top < window.innerHeight) play();
          }, {once:true});
        }
        return;
      }
      cancel(); played = true;
      element.classList.add('is-assembling'); stage(1);
      timers.push(setTimeout(() => stage(2), 1000));
      timers.push(setTimeout(() => stage(3), 2100));
      timers.push(setTimeout(finish, 3400));
    }
    replay?.addEventListener('click', play);
    element.querySelector('[data-capture]')?.addEventListener('click', finish);
    return { element, replay, finish, play, get played() { return played; } };
  });

  const revealElements = Array.from(document.querySelectorAll('.section-intro,.creative-copy,.creative-format,.creative-process>li,.expert-comment,.journey-rich>article,.audit-copy,.audit-report,.scope-grid>article,.process-grid>li,.price-card,.route-heading'));
  revealElements.forEach(element => {
    element.classList.add('motion-reveal');
    const siblings = Array.from(element.parentElement.children);
    element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element) % 3, 2) * 65}ms`);
  });

  const motionToggle = document.createElement('button');
  motionToggle.type = 'button';
  motionToggle.className = 'page-motion-toggle';
  motionToggle.setAttribute('aria-pressed', 'false');
  const footer = document.querySelector('.footer-bottom');
  footer?.insertBefore(motionToggle, footer.querySelector('.back-top'));
  const chartReplay = document.querySelector('[data-chart-replay]');

  function drawCharts() {
    if (!enabled) return;
    chartElements.forEach(chart => chart.classList.remove('is-drawn'));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      chartElements.forEach(chart => chart.classList.add('is-drawn'));
    }));
  }
  chartReplay?.addEventListener('click', drawCharts);

  function updateRoute() {
    scrollFrame = 0;
    if (!route) return;
    const rect = route.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    measureRoute();
    const progress = enabled ? Math.min(1, Math.max(0, (window.innerHeight * .83 - rect.top) / (window.innerHeight * .66))) : 1;
    route.style.setProperty('--route-progress', progress.toFixed(3));
    const current = Math.min(3, Math.floor(progress * 4));
    routeSteps.forEach((step, index) => {
      step.classList.toggle('is-current', enabled && index === current);
      step.classList.toggle('is-complete', !enabled || index < current);
      if (enabled && index === current) step.setAttribute('aria-current','step');
      else step.removeAttribute('aria-current');
    });
  }
  function scheduleRoute() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateRoute);
  }

  function measureRoute() {
    if (!route) return;
    const path = route.querySelector('.route-path').getBoundingClientRect();
    const first = routeSteps[0].querySelector('.route-node').getBoundingClientRect();
    const last = routeSteps[3].querySelector('.route-node').getBoundingClientRect();
    const vertical = window.matchMedia('(max-width: 680px)').matches;
    const track = route.querySelector('.route-track');
    route.dataset.vertical = String(vertical);
    Object.assign(track.style, {
      left: `${first.left + first.width / 2 - path.left}px`,
      top: `${first.top + first.height / 2 - path.top}px`,
      width: vertical ? '2px' : `${last.left - first.left}px`,
      height: vertical ? `${last.top - first.top}px` : '2px'
    });
    route.classList.add('route-ready');
  }

  function configureMotion() {
    observers.forEach(observer => observer.disconnect()); observers.length = 0;
    scenes.forEach(scene => scene.finish());
    window.removeEventListener('scroll', scheduleRoute);
    window.removeEventListener('resize', scheduleRoute);
    if (scrollFrame) cancelAnimationFrame(scrollFrame); scrollFrame = 0;
    enabled = !reducedMotion.matches && !manualPause && 'IntersectionObserver' in window;
    const hero = document.querySelector('.hero-video');
    if (!enabled) hero?.pause();
    else if (hero && !document.hidden) hero.play().catch(() => {});
    document.body.classList.toggle('motion-enabled', enabled);
    document.body.dataset.motion = enabled ? 'on' : 'off';
    motionToggle.textContent = enabled ? 'Отключить анимацию' : 'Включить анимацию';
    motionToggle.setAttribute('aria-pressed', String(!enabled));
    motionToggle.hidden = reducedMotion.matches || !('IntersectionObserver' in window);
    scenes.forEach(scene => { if (scene.replay) scene.replay.hidden = !enabled; });
    if (chartReplay) chartReplay.hidden = !enabled;
    if (!enabled) {
      revealElements.forEach(element => element.classList.add('is-visible'));
      chartElements.forEach(chart => chart.classList.add('is-drawn'));
      if (route) {
        measureRoute();
        route.style.setProperty('--route-progress','1');
        routeSteps.forEach(step => { step.classList.add('is-complete'); step.classList.remove('is-current'); step.removeAttribute('aria-current'); });
      }
      return;
    }
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      });
    }, {threshold:.08,rootMargin:'0px 0px 30px 0px'});
    revealElements.filter(element => !element.classList.contains('is-visible')).forEach(element => revealObserver.observe(element));
    observers.push(revealObserver);
    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const scene = scenes.find(item => item.element === entry.target);
        if (entry.isIntersecting && !scene.played) scene.play();
        else if (!entry.isIntersecting && scene.played) scene.finish();
      });
    }, {threshold:.3});
    scenes.forEach(scene => sceneObserver.observe(scene.element)); observers.push(sceneObserver);
    const chartObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-drawn'); chartObserver.unobserve(entry.target); }
      });
    }, {threshold:.2});
    chartElements.filter(chart => !chart.classList.contains('is-drawn')).forEach(chart => chartObserver.observe(chart)); observers.push(chartObserver);
    window.addEventListener('scroll', scheduleRoute, {passive:true});
    window.addEventListener('resize', scheduleRoute, {passive:true});
    updateRoute();
  }
  motionToggle.addEventListener('click', () => { manualPause = !manualPause; configureMotion(); });
  reducedMotion.addEventListener('change', () => {
    configureMotion();
  });
  document.addEventListener('focusin', event => {
    event.target.closest?.('.motion-reveal')?.classList.add('is-visible');
  });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('motion-paused', document.hidden);
    if (document.hidden) scenes.forEach(scene => scene.finish());
    else scheduleRoute();
  });
  configureMotion();
})();
