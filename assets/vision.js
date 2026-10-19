(function(){
  window.AIIS_VISION=function(canvas){
    const ctx=canvas?.getContext('2d');
    if(!ctx)return {render(){},destroy(){}};
    let time=0,scene=0;
    const W=560,H=340;
    function resize(){if(!canvas.clientWidth||!canvas.clientHeight)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvas.clientWidth*dpr);canvas.height=Math.round(canvas.clientHeight*dpr);draw();}
    function project(x,y,z){return [280+(x-z)*29,176+(x+z)*13-y*28];}
    function polygon(points,fill,stroke='#749d8a',alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}ctx.restore();}
    function line(a,b,color='#8da99b',width=1,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.restore()}
    function box(x,y,z,dx,dy,dz,fill=['#d9e7df','#aec8b9','#c6dbcf'],stroke='#86a793'){
      const a=project(x,y,z),b=project(x+dx,y,z),c=project(x+dx,y,z+dz),d=project(x,y,z+dz),e=project(x,y+dy,z),f=project(x+dx,y+dy,z),g=project(x+dx,y+dy,z+dz),h=project(x,y+dy,z+dz);
      polygon([a,b,f,e],fill[1],stroke);polygon([b,c,g,f],fill[2],stroke);polygon([e,f,g,h],fill[0],stroke);
    }
    function circle(x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore()}
    function path(points,color,width=1,dash=[]){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([])}
    function movingDot(points,phase){let lengths=[],total=0;for(let i=1;i<points.length;i++){const len=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(len);total+=len;}let d=(phase%1)*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]){const ratio=d/lengths[i];const x=points[i][0]+(points[i+1][0]-points[i][0])*ratio,y=points[i][1]+(points[i+1][1]-points[i][1])*ratio;circle(x,y,7,'#267f69',.1);circle(x,y,2.5,'#1e7461');return;}d-=lengths[i];}}
    function machine(x,z,tall,offset){
      box(x,0,z,1.25,.22,1.2,['#c7d9ce','#8ea999','#abc4b5']);
      box(x+.12,.22,z+.12,1,.12,1,['#edf4ef','#bacfc1','#ccdcd1']);
      [[x+.12,z+.12],[x+1.05,z+.12],[x+1.05,z+1.05],[x+.12,z+1.05]].forEach(([xx,zz])=>box(xx,.34,zz,.07,tall,.07,['#718f7d','#6b8b78','#aec4b4'],'#7c9b88'));
      box(x+.12,.34+tall,z+.12,1,.12,1,['#d8e7dc','#a7c0af','#bed2c4']);
      const headX=x+.35+.25*Math.sin(time*.9+offset);
      box(headX,tall+.15,z+.48,.22,.22,.22,['#3b7961','#285f4b','#4e8c72'],'#326d57');
      line(project(headX+.11,tall+.12,z+.59),project(headX+.11,.65,z+.59),'#31795b',1.5,.6);
      for(let k=0;k<5;k++){box(x+.38,.35+k*.06,z+.37,.5,.04,.47,['#c1d7c9','#9cbdab','#bdd4c6'],'#9cbba8');}
      const p=project(x+.68,.36,z+.6);circle(p[0],p[1],6+Math.sin(time*1.4+offset)*2,'#81b296',.25);
    }
    function draw(){
      if(!ctx||!canvas.width)return;
      ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.clearRect(0,0,W,H);
      ctx.save();
      // The illustration is conceptual. It displays no measured production data.
      ctx.save();ctx.translate(280,251);ctx.scale(1,.32);ctx.beginPath();ctx.ellipse(0,0,168,72,0,0,Math.PI*2);ctx.fillStyle='#5b826411';ctx.fill();ctx.restore();
      box(-3.2,-.3,-2.5,6.5,.25,5.25,['#e8f0e9','#b6cbbd','#cfdfd2'],'#b2c7b9');
      for(let i=-3;i<=3;i++){line(project(i,0,-2.4),project(i,0,2.6),'#d1dfd4',.6);}
      for(let i=-2;i<=2;i++){line(project(-3.1,0,i),project(3.2,0,i),'#d1dfd4',.6);}
      const route=[project(-2.8,.12,1.7),project(-.1,.12,1.7),project(-.1,.12,-1.6),project(2.5,.12,-1.6),project(2.5,.12,1.8)];
      path(route,'#b1cbbc',12);path(route,'#f0f5ef',8);path(route,'#93b6a1',.7);
      for(let i=0;i<5;i++)movingDot(route,time*.055+i*.2);
      machine(-2.45,-1.75,1.65,0);machine(.8,-1.6,1.9,2);machine(.65,1,1.45,4);
      // A translucent learning layer above the physical production line.
      const nodes=[];
      for(let col=0;col<4;col++)for(let row=0;row<(col===0||col===3?2:3);row++)nodes.push({col,row,x:165+col*75,y:34+row*22+(col===0||col===3?11:0)});
      ctx.globalAlpha=scene===1?.95:.43;
      nodes.forEach(a=>nodes.filter(b=>b.col===a.col+1).forEach(b=>line([a.x,a.y],[b.x,b.y],'#73a78b',.7,.55)));
      nodes.forEach((n,i)=>{circle(n.x,n.y,4.2,'#d5e6da');circle(n.x,n.y,2.2,'#2f785b',.55+.4*Math.sin(time*.9+i));});ctx.globalAlpha=1;
      const connections=[[[165,67],[126,96],project(-1.8,2.15,-1.1)],[[390,67],[443,105],project(1.5,2.4,-1)],[[315,89],[360,117],project(1.2,2.02,1.7)]];
      connections.forEach((points,i)=>{path(points,'#91b29d',.85,[3,5]);movingDot(scene===2?[...points].reverse():points,time*.1+i*.25)});
      ctx.font='8px Arial';ctx.letterSpacing='1px';ctx.fillStyle='#527a63';ctx.textAlign='center';ctx.fillText('LEARNING + DECISION',280,17);
      if(scene===0){const x=105+((time*.12)%1)*350;const g=ctx.createLinearGradient(x-30,0,x+30,0);g.addColorStop(0,'#6ba88900');g.addColorStop(.5,'#6ba88915');g.addColorStop(1,'#6ba88900');ctx.fillStyle=g;ctx.fillRect(x-30,104,60,178)}
      ctx.restore();
    }
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    return {render(seconds){time=seconds;scene=Math.floor(time/6.5)%3;draw();},destroy(){observer.disconnect();}};
  };
})();
