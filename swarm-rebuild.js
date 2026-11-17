(() => {
  const root = document.querySelector('[data-swarm-demo]');
  if (!root) return;
  const surface = root.querySelector('.swarm-surface');
  const overlay = root.querySelector('.swarm-overlay');
  const guide = root.querySelector('.swarm-guide');
  const controls = root.querySelector('.swarm-controls');
  const playButton = root.querySelector('.swarm-play');
  const restartButton = root.querySelector('.swarm-restart');
  const status = root.querySelector('.swarm-status');
  const time = root.querySelector('.swarm-time');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const parts = Object.fromEntries(Array.from(root.querySelectorAll('[data-piece]')).map(e => [e.dataset.piece,e]));
  const duration = 9200;
  let animations = [], frame = 0, elapsed = duration, last = 0, state = 'finished';
  let parentEnabled = true, visible = window.parent === window, played = false, autoPaused = false;
  let lastSize = 0, resizeTimer = 0, lastWidth = innerWidth, assetsReady = false;
  root.dataset.state=state;
  const plan = [
    ['nav',250,600,'wipe'],['breadcrumb',700,500,'text'],['title',1100,1200,'text'],
    ['photo',1750,1250,'photo'],['price',2300,650,'text'],['price-note',2700,450,'text'],
    ['thumbs',3400,650,'wipe'],['actions',3900,750,'wipe'],['shop',4600,650,'wipe'],
    ['specs',5400,650,'wipe'],['copy',6100,1450,'text'],['note',7400,700,'text']
  ];
  const actors = [
    {name:'Дизайн',color:'#0647ee',path:[[0,'title',.5,.5],[.08,'nav',.12,.5],[.17,'breadcrumb',.3,.5],[.28,'photo',.02,.02],[.4,'photo',.98,.98],[.7,'specs',.4,.5],[1,'copy',.6,.5]]},
    {name:'Текст',color:'#9a60f4',path:[[0,'title',.6,.5],[.13,'title',.03,.5],[.26,'title',.94,.5],[.53,'copy',.04,.1],[.75,'copy',.9,.75],[1,'copy',.95,.95]]},
    {name:'Фото',color:'#00ad9b',path:[[0,'photo',.5,.1],[.2,'photo',.02,.02],[.34,'photo',.9,.9],[.46,'thumbs',.12,.5],[.57,'thumbs',.8,.5],[1,'photo',.55,.65]]},
    {name:'Оформление',color:'#ed737c',path:[[0,'title',.8,.5],[.25,'price',.03,.5],[.36,'price',.8,.5],[.44,'actions',.02,.02],[.56,'actions',.96,.92],[.65,'shop',.4,.5],[1,'shop',.7,.8]]},
    {name:'Детали',color:'#d39b22',path:[[0,'title',.7,.3],[.5,'shop',.1,.1],[.6,'shop',.95,.9],[.65,'specs',.03,.5],[.75,'specs',.94,.5],[.88,'note',.9,.7],[1,'note',.94,.95]]}
  ];
  function isEnabled() { return parentEnabled && !reduced.matches; }
  function addAnimation(element, keyframes, timing) {
    const animation = element.animate(keyframes, {...timing,fill:'both'});
    animations.push(animation); return animation;
  }
  function cancelAnimations() {
    cancelAnimationFrame(frame); frame=0;
    animations.forEach(animation => animation.cancel()); animations=[];
    overlay.replaceChildren();
  }
  function updateControls() {
    const running = state === 'running';
    playButton.setAttribute('aria-label',running ? 'Приостановить сборку страницы' : state === 'paused' ? 'Продолжить сборку страницы' : 'Повторить сборку страницы');
    playButton.querySelector('path').setAttribute('d',running ? 'M3 2h4v12H3ZM10 2h4v12h-4Z' : 'm4 2 9 6-9 6Z');
    playButton.querySelector('span').textContent=running ? 'Пауза' : state === 'paused' ? 'Продолжить' : 'Повторить';
    playButton.disabled=restartButton.disabled=!isEnabled()||!assetsReady;
    time.textContent=`0:${String(Math.min(9,Math.floor(elapsed/1000))).padStart(2,'0')}`;
  }
  function finish() {
    cancelAnimations(); state='finished'; elapsed=duration;
    root.dataset.state=state;
    status.textContent='Пример собран'; updateControls();
  }
  function reportSize() {
    const height=Math.ceil(document.body.getBoundingClientRect().height);
    if(height!==lastSize && window.parent!==window) {
      lastSize=height;
      try { if(window.frameElement)window.frameElement.style.height=`${Math.max(400,Math.min(1500,height))}px`; } catch {}
      window.parent.postMessage({type:'relevant-swarm:size',height},location.origin);
    }
  }
  function pause(automatic=false) {
    if(state!=='running') return;
    state='paused';autoPaused=automatic;root.dataset.state=state;
    cancelAnimationFrame(frame);frame=0;
    animations.forEach(animation=>animation.pause());
    status.textContent='Сборка на паузе';updateControls();
  }
  function tick(now) {
    if(state!=='running') return;
    elapsed+=now-last;last=now;
    const label=elapsed<1600?'Собираем каркас':elapsed<4000?'Добавляем фото':elapsed<6100?'Оформляем детали':elapsed<8500?'Пишем описание':'Завершаем сборку';
    if(status.textContent!==label) status.textContent=label;
    time.textContent=`0:${String(Math.min(9,Math.floor(elapsed/1000))).padStart(2,'0')}`;
    if(elapsed>=duration) finish();else frame=requestAnimationFrame(tick);
  }
  function resume() {
    if(state!=='paused'||!isEnabled()||document.hidden) return;
    state='running';autoPaused=false;root.dataset.state=state;
    animations.forEach(animation=>animation.play());last=performance.now();frame=requestAnimationFrame(tick);updateControls();
  }
  function play() {
    if(!isEnabled()) {finish();return;}
    if(!assetsReady) return;
    if(document.hidden) return;
    cancelAnimations();played=true;state='running';elapsed=0;autoPaused=false;root.dataset.state=state;
    plan.forEach(([key,delay,length,kind])=>{
      const element=parts[key];
      const from=kind==='photo'?{opacity:0,clipPath:'inset(0 0 100% 0)',transform:'translateY(0)'}:kind==='text'?{opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translateY(0)'}:{opacity:0,clipPath:'inset(0 0 0 0)',transform:'translateY(13px) scale(.98)'};
      addAnimation(element,[from,{opacity:1,clipPath:'inset(0 0 0 0)',transform:'translateY(0) scale(1)'}],{delay,duration:length,easing:kind==='text'?'steps(22,end)':'cubic-bezier(.18,.75,.2,1)'});
    });
    addAnimation(guide,[{opacity:0},{opacity:.6,offset:.15},{opacity:.6,offset:.8},{opacity:0}],{duration});
    const bounds=surface.getBoundingClientRect();
    actors.forEach((actor,index)=>{
      const element=document.createElement('div');element.className='swarm-actor';element.style.setProperty('--actor-color',actor.color);
      element.innerHTML=`<i class="swarm-pulse"></i><svg viewBox="0 0 24 28"><path d="M2 2 3 21 8 15 12 25 17 22 12 13 21 12Z"/></svg><span>${actor.name}</span>`;
      overlay.append(element);
      const points=actor.path.map(([offset,key,x,y])=>{
        const rect=parts[key].getBoundingClientRect();
        return {offset,transform:`translate(${rect.left-bounds.left+rect.width*x}px,${rect.top-bounds.top+rect.height*y}px)`,opacity:offset===0||offset===1?0:1};
      });
      // Additional opacity keyframes keep the cursor readable between its tasks.
      addAnimation(element,points,{duration,easing:'cubic-bezier(.35,.05,.2,1)'});
      addAnimation(element.querySelector('.swarm-pulse'),[{opacity:0,transform:'scale(.2)'},{opacity:.7,offset:.2},{opacity:0,transform:'scale(1.9)'}],{delay:700+index*350,duration:650});
    });
    [['photo',1450,2350,'#00ad9b'],['title',850,1600,'#9a60f4'],['actions',3600,1450,'#ed737c'],['shop',4400,1450,'#d39b22']].forEach(([key,delay,length,color])=>{
      const rect=parts[key].getBoundingClientRect();const box=document.createElement('span');box.className='swarm-draw-box';
      Object.assign(box.style,{left:`${rect.left-bounds.left}px`,top:`${rect.top-bounds.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});box.style.setProperty('--actor-color',color);
      const badge=document.createElement('span');badge.className='swarm-measure';badge.textContent=`${Math.round(rect.width)} × ${Math.round(rect.height)}`;box.append(badge);overlay.append(box);
      addAnimation(box,[{opacity:0,transform:'scale(.02,.02)'},{opacity:.85,transform:'scale(1,1)',offset:.35},{opacity:.85,offset:.8},{opacity:0,transform:'scale(1,1)'}],{delay,duration:length,easing:'ease-out'});
    });
    last=performance.now();frame=requestAnimationFrame(tick);updateControls();
  }
  function updateVisibility(value) {
    visible=value;
    if(!visible) pause(true);
    else if(isEnabled()&&!played) play();
    else if(autoPaused) resume();
  }
  playButton.addEventListener('click',()=>state==='running'?pause():state==='paused'?resume():play());
  restartButton.addEventListener('click',play);
  window.addEventListener('message',event=>{
    if(event.source!==window.parent||event.origin!==location.origin) return;
    if(event.data?.type==='relevant-swarm:settings') {
      parentEnabled=Boolean(event.data.enabled);
      if(!isEnabled()) finish();else if(visible&&!played) play();else updateControls();
      lastSize=0;reportSize();
    }
    if(event.data?.type==='relevant-swarm:visibility') updateVisibility(Boolean(event.data.visible));
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) pause(true);
    else if(visible&&!played&&isEnabled())play();
    else if(visible&&autoPaused)resume();
  });
  reduced.addEventListener('change',()=>{if(!isEnabled())finish();else updateControls();});
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
      if(innerWidth!==lastWidth){lastWidth=innerWidth;if(state==='running'||state==='paused')finish();}
      reportSize();
    },150);
  });
  controls.hidden=false;updateControls();
  if('ResizeObserver' in window)new ResizeObserver(reportSize).observe(root);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>updateVisibility(entries[0].isIntersecting),{threshold:.08}).observe(root);
  const productImage = parts.photo.querySelector('img');
  Promise.all([document.fonts.ready,productImage.decode().catch(()=>{})]).then(()=>{
    assetsReady=true;reportSize();updateControls();
    if(visible&&isEnabled()&&!played)play();
  });
  document.querySelectorAll('img').forEach(image=>image.addEventListener('load',reportSize,{once:true}));
  reportSize();
})();
