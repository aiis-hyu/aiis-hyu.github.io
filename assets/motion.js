(function(){
  window.AIIS_MOTION=function(lang,saved){
    const root=document.querySelector('.intro-carousel');
    if(!root)return {destroy(){},getState(){return saved;}};
    const slides=[...root.querySelectorAll('.intro-slide')],segments=[...root.querySelectorAll('[data-intro-slide]')],names=['Title','Research Framework','Contact'];
    const frameworkIndex=slides.findIndex(slide=>slide.classList.contains('slide-framework'));
    const total=20000,duration=total/slides.length,stageDuration=duration/4;
    let motionPreference=null;
    try{const value=localStorage.getItem('aiis-visual-motion');if(value==='on'||value==='off')motionPreference=value==='on';}catch{}
    let index=Math.min(slides.length-1,Math.max(0,saved?.slide??0)),elapsed=saved?.elapsed??0,playing=saved?.playing??true;
    // Autoplay is the site default; retain a visitor's explicit Motion Off choice.
    let visualPlaying=saved?.visualPlaying??motionPreference??true,last=0,frame=0,visible=true;
    const play=root.querySelector('#intro-play'),motion=root.querySelector('#intro-motion'),clock=root.querySelector('#intro-time'),announce=root.querySelector('#intro-announcement');
    const loop=root.querySelector('.intelligence-loop'),stages=window.AIIS_RENDER.loopStages,loopButtons=[...loop.querySelectorAll('[data-loop-stage]')],loopPlay=loop.querySelector('#loop-play');
    let loopIndex=saved?.loopIndex??0,loopElapsed=saved?.loopElapsed??0,loopPlaying=saved?.loopPlaying??true;
    const format=ms=>'00:'+String(Math.floor(ms/1000)).padStart(2,'0');
    function paint(){
      slides.forEach((slide,i)=>{slide.hidden=i!==index;slide.classList.toggle('is-active',i===index);});
      segments.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===index));button.querySelector('.segment-fill').style.transform='scaleX('+(i<index?1:i===index?elapsed/duration:0)+')';});
      root.querySelector('#intro-count').textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
      clock.textContent=format(index*duration+elapsed)+' / '+format(total);root.dataset.slide=String(index);
    }
    function paintLoop(){
      const stage=stages[loopIndex];loop.dataset.stage=stage.key;
      loopButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===loopIndex)));
      loop.querySelector('#loop-index').textContent='0'+(loopIndex+1)+' / 04';
      loop.querySelector('#loop-description').textContent=stage.description[lang];
      loop.querySelector('#loop-research-link').href=window.AIIS_RENDER.href('research.html',lang,stage.research);
    }
    function visualControls(){
      motion.setAttribute('aria-pressed',String(visualPlaying));motion.setAttribute('aria-label',lang==='ko'?(visualPlaying?'모션 끄기':'모션 켜기'):(visualPlaying?'Turn motion off':'Turn motion on'));
      motion.lastElementChild.textContent=visualPlaying?'Motion On':'Motion Off';
      root.classList.toggle('motion-enabled',visualPlaying);
      root.classList.toggle('motion-paused',!visualPlaying||!visible||document.hidden);
      const loopActive=visualPlaying&&loopPlaying;
      loop.classList.toggle('is-paused',!loopActive);loopPlay.setAttribute('aria-pressed',String(loopActive));
      loopPlay.setAttribute('aria-label',lang==='ko'?(loopActive?'순환 애니메이션 일시정지':'순환 애니메이션 재생'):(loopActive?'Pause loop animation':'Play loop animation'));
      loopPlay.firstElementChild.textContent=loopActive?'Ⅱ':'▷';
      loop.querySelector('#loop-play-label').textContent=lang==='ko'?(loopActive?'일시정지':'재생'):(loopActive?'Pause':'Play');
    }
    function setMotion(next){
      visualPlaying=next;motionPreference=next;
      try{localStorage.setItem('aiis-visual-motion',next?'on':'off');}catch{}
      last=0;visualControls();
    }
    function playback(){play.setAttribute('aria-pressed',String(playing));play.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow');play.textContent=playing?'Ⅱ':'▷';root.classList.toggle('slideshow-paused',!playing);visualControls();}
    function tick(now){
      const dt=last?Math.min(now-last,100):0;last=now;
      if(visible&&!document.hidden){
        if(playing){elapsed+=dt;if(elapsed>=duration){index=(index+1)%slides.length;elapsed%=duration;if(index===frameworkIndex){loopIndex=0;loopElapsed=0;paintLoop();}}paint();}
        if(visualPlaying){
          if(index===frameworkIndex&&loopPlaying){loopElapsed+=dt;if(loopElapsed>=stageDuration){loopIndex=(loopIndex+1)%stages.length;loopElapsed%=stageDuration;paintLoop();}}
        }
      }
      frame=requestAnimationFrame(tick);
    }
    function go(next,manual=true){index=(next+slides.length)%slides.length;elapsed=0;if(manual){playing=false;announce.textContent=names[index]+', '+(index+1)+' of '+slides.length;}paint();playback();}
    function click(e){
      const tab=e.target.closest('[data-intro-slide]'),step=e.target.closest('[data-intro-step]'),node=e.target.closest('[data-loop-stage]');
      if(tab){go(Number(tab.dataset.introSlide));return;}
      if(step){go(index+Number(step.dataset.introStep));return;}
      if(node){loopIndex=stages.findIndex(s=>s.key===node.dataset.loopStage);loopElapsed=0;loopPlaying=false;paintLoop();visualControls();announce.textContent=stages[loopIndex][lang]+'. '+stages[loopIndex].description[lang];return;}
      if(e.target.closest('#loop-play')){if(visualPlaying&&loopPlaying)loopPlaying=false;else{loopPlaying=true;setMotion(true);}last=0;visualControls();return;}
      if(e.target.closest('#intro-motion')){setMotion(!visualPlaying);return;}
      if(e.target.closest('#intro-play')){playing=!playing;if(playing&&motionPreference!==false)setMotion(true);last=0;playback();return;}
      if(e.target.closest('#intro-restart')){playing=true;setMotion(true);loopIndex=0;loopElapsed=0;loopPlaying=true;paintLoop();go(0,false);last=0;}
    }
    function key(e){
      if(e.target.closest('.intelligence-loop'))return;
      if(e.key==='ArrowRight'){e.preventDefault();go(index+1);}
      if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}
      if(e.key==='Home'){e.preventDefault();go(0);}
    }
    function focus(e){if(e.target.closest('.intro-playback'))return;playing=false;playback();}
    function visibility(){last=0;visualControls();}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;visualControls();},{threshold:.1});observer.observe(root);
    document.addEventListener('visibilitychange',visibility);root.addEventListener('click',click);root.addEventListener('keydown',key);root.addEventListener('focusin',focus);
    paint();paintLoop();playback();frame=requestAnimationFrame(tick);
    return {getState(){return {slide:index,elapsed,playing,visualPlaying,loopIndex,loopElapsed,loopPlaying};},destroy(){cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);root.removeEventListener('click',click);root.removeEventListener('keydown',key);root.removeEventListener('focusin',focus);}};
  };
})();
