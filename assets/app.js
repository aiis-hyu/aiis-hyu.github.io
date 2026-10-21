(function(){
  const R=window.AIIS_RENDER,D=window.AIIS_CONTENT,P=window.AIIS_PUBLICATIONS;
  const page=document.body.dataset.page||'home';
  const params=new URLSearchParams(location.search);
  let remembered='ko';try{remembered=localStorage.getItem('aiis-system-language')||'ko';}catch{}
  let lang=['ko','en'].includes(params.get('lang'))?params.get('lang'):(['ko','en'].includes(remembered)?remembered:'ko');
  let pubState={kind:params.get('kind')||'journal',year:params.get('year')||'all',scope:params.get('scope')||'all',query:params.get('q')||''};
  if(!['journal','conference','all','working'].includes(pubState.kind))pubState.kind='journal';
  if(!['all','international','domestic'].includes(pubState.scope))pubState.scope='all';
  if(pubState.year!=='all'&&!P.some(p=>String(p.year)===pubState.year))pubState.year='all';
  let galleryIndex=0,newsCategory='all',motion,toastTimer,introState;
  function updateUrl(){const p=new URLSearchParams();p.set('lang',lang);if(page==='publications'){if(pubState.kind!=='journal')p.set('kind',pubState.kind);if(pubState.year!=='all')p.set('year',pubState.year);if(pubState.scope!=='all')p.set('scope',pubState.scope);if(pubState.query)p.set('q',pubState.query);}try{history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash);}catch{}}
  function metadata(){document.documentElement.lang=lang;document.title=(page==='home'?'AIIS Lab':R.pageNames[page][lang]+' · AIIS Lab')+' | Hanyang University ERICA';document.querySelector('meta[name="description"]').setAttribute('content',R.text(lang,'한양대학교 ERICA AIIS Lab. 산업 AI, 강화학습, 디지털 트윈, 적층제조를 연구합니다.','AIIS Lab at Hanyang University ERICA. Research in industrial AI, reinforcement learning, digital twins and additive manufacturing.'));}
  function render(){introState=motion?.getState?.()||introState;motion?.destroy();document.getElementById('app').innerHTML=R.render(page,lang,pubState);metadata();motion=window.AIIS_MOTION(lang,introState);if(page==='home'&&galleryIndex)updateGallery();if(page==='news'&&newsCategory!=='all')filterNews();bindDialog();}
  function toast(msg){const el=document.getElementById('site-toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
  function updatePublications(){document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===pubState.kind)));document.getElementById('publication-results').innerHTML=R.publicationResults(lang,pubState);const count=R.filterPublications(pubState).length;document.getElementById('pub-count').textContent=R.text(lang,count+'건의 연구 실적',count+' research output'+(count===1?'':'s'));updateUrl();}
  function updateGallery(){document.getElementById('home-gallery').innerHTML=R.galleryImage(galleryIndex,lang);document.getElementById('gallery-counter').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(D.gallery.length).padStart(2,'0');}
  function filterNews(){document.querySelectorAll('[data-news-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.newsFilter===newsCategory)));document.getElementById('news-results').innerHTML=R.newsResults(lang,newsCategory);}
  let lastPhotoTrigger;
  function openPhoto(src,caption,trigger){const dialog=document.getElementById('photo-dialog');lastPhotoTrigger=trigger;const image=document.getElementById('dialog-image');image.src='assets/'+src;image.alt=caption;document.getElementById('dialog-caption').textContent=caption;dialog.showModal();document.body.style.overflow='hidden';}
  function bindDialog(){const d=document.getElementById('photo-dialog');d.addEventListener('close',()=>{document.body.style.overflow='';lastPhotoTrigger?.focus();});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});}
  document.addEventListener('click',e=>{
    const language=e.target.closest('[data-language]');if(language){if(lang!==language.dataset.language){lang=language.dataset.language;try{localStorage.setItem('aiis-system-language',lang)}catch{}updateUrl();render();document.querySelector('[data-language="'+lang+'"]').focus();}return;}
    const menu=e.target.closest('.menu-toggle');if(menu){const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(expanded));menu.setAttribute('aria-label',expanded?'Close menu':'Open menu');document.getElementById('main-nav').classList.toggle('open',expanded);return;}
    const kind=e.target.closest('[data-kind]');if(kind){pubState.kind=kind.dataset.kind;updatePublications();return;}
    const reset=e.target.closest('[data-reset-pubs]');if(reset){pubState={kind:'journal',year:'all',scope:'all',query:''};render();updateUrl();return;}
    const step=e.target.closest('[data-gallery-step]');if(step){galleryIndex=(galleryIndex+Number(step.dataset.galleryStep)+D.gallery.length)%D.gallery.length;updateGallery();return;}
    const lightbox=e.target.closest('[data-lightbox]');if(lightbox){const g=D.gallery[Number(lightbox.dataset.lightbox)];openPhoto(g.image,g.caption[lang],lightbox);return;}
    const photo=e.target.closest('[data-news-photo]');if(photo){const n=D.news.find(n=>n.id===photo.dataset.newsPhoto);openPhoto(n.image,n.title[lang],photo);return;}
    const researchPhoto=e.target.closest('[data-research-photo]');if(researchPhoto){const m=window.AIIS_RESEARCH.flatMap(a=>a.media).find(m=>m.id===researchPhoto.dataset.researchPhoto);openPhoto(m.file,m.title[lang],researchPhoto);return;}
    const video=e.target.closest('[data-research-video]');if(video){const m=window.AIIS_RESEARCH.flatMap(a=>a.media).find(m=>m.id===video.dataset.researchVideo);if(location.protocol==='file:'){const url=m.type==='youtube'?'https://www.youtube.com/watch?v='+m.video:'https://drive.google.com/file/d/'+m.video+'/view';window.open(url,'_blank','noopener,noreferrer');return;}const frame=document.createElement('iframe');frame.src=m.type==='youtube'?'https://www.youtube.com/embed/'+m.video+'?autoplay=1':'https://drive.google.com/file/d/'+m.video+'/preview';frame.title=m.title[lang];frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';video.parentElement.replaceChildren(frame);frame.focus();return;}
    const close=e.target.closest('.dialog-close');if(close){document.getElementById('photo-dialog').close();return;}
    const nf=e.target.closest('[data-news-filter]');if(nf){newsCategory=nf.dataset.newsFilter;filterNews();}
  });
  document.addEventListener('input',e=>{if(e.target.id==='pub-search'){pubState.query=e.target.value;updatePublications();}});
  document.addEventListener('change',e=>{if(e.target.id==='pub-year'){pubState.year=e.target.value;updatePublications();}if(e.target.id==='pub-scope'){pubState.scope=e.target.value;updatePublications();}});
  function resolveHash(){if(!location.hash)return;const id=decodeURIComponent(location.hash.slice(1));if(page==='publications'){const target=P.find(p=>p.id===id);if(target){pubState={kind:target.kind,year:'all',scope:'all',query:''};render();}}if(page==='news'&&D.news.some(n=>n.id===id)&&newsCategory!=='all'){newsCategory='all';filterNews();}requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'}));}
  window.addEventListener('hashchange',resolveHash);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){const menu=document.querySelector('.menu-toggle');if(menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}}});
  render();resolveHash();
})();
