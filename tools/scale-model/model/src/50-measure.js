  // ---- distance ruler: map distance, distance over the terrain, climb/descent and a profile ----
  const measbar=$('measbar'), mTotal=$('mTotal'), mDetail=$('mDetail'), mProf=$('mProf'), bMeasure=$('bMeasure');
  function elevAt(x,y){   // bilinear, map px -> metres
    const u=Math.min(VW-1.001,Math.max(0,x/(OW-1)*(VW-1))), v=Math.min(VH-1.001,Math.max(0,y/(OH-1)*(VH-1)));
    const i=Math.floor(u), j=Math.floor(v), fu=u-i, fv=v-j;
    const a=elev[j*VW+i], b=elev[j*VW+i+1], c=elev[(j+1)*VW+i], d=elev[(j+1)*VW+i+1];
    return (a*(1-fu)+b*fu)*(1-fv)+(c*(1-fu)+d*fu)*fv;
  }
  const segKm=(p,q)=>Math.hypot(q[0]-p[0],q[1]-p[1])*PXKM;
  function routeStats(pts){
    let map=0, surf=0, up=0, down=0; const prof=[];
    for(let s=1;s<pts.length;s++){
      const p=pts[s-1], q=pts[s], L=segKm(p,q), n=Math.max(1,Math.ceil(L/PXKM*2));
      let h0=elevAt(p[0],p[1]); if(s===1) prof.push([0,h0]);
      for(let k=1;k<=n;k++){
        const t=k/n, h=elevAt(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t), dh=(h-h0)/1000;
        surf+=Math.hypot(L/n,dh); if(dh>0) up+=dh; else down-=dh; h0=h; prof.push([map+L*t,h]);
      }
      map+=L;
    }
    return {map,surf,up,down,prof};
  }
  const km=v=>v>=100?Math.round(v).toLocaleString()+' km':v.toFixed(1)+' km';
  function measReadout(){
    const pts=measCursor&&meas.length?meas.concat([measCursor]):meas;
    if(meas.length===0){ mTotal.textContent='0 km'; mDetail.textContent='Click the terrain to set a start point'; drawProfile([]); return; }
    const st=routeStats(pts), legs=pts.length-1;
    mTotal.textContent=km(st.map);
    if(legs<1){ mDetail.textContent='Start set · click to add the next point'; drawProfile([]); return; }
    const last=segKm(pts[pts.length-2],pts[pts.length-1]);
    mDetail.textContent=(legs===1?'1 leg':legs+' legs')+(measCursor&&last>=0.05?' · to cursor '+km(last):'')+'\nover terrain '+km(st.surf)+' · climb '+(st.up).toFixed(1)+' km · descent '+(st.down).toFixed(1)+' km';
    mDetail.style.whiteSpace='pre-line';
    drawProfile(st.prof);
  }
  function drawProfile(prof){
    const g=mProf.getContext('2d'), W=mProf.width, Hh=mProf.height; g.clearRect(0,0,W,Hh);
    if(prof.length<2) return;
    let lo=Infinity, hi=-Infinity; prof.forEach(p=>{lo=Math.min(lo,p[1]);hi=Math.max(hi,p[1]);});
    if(hi-lo<200){ const m=(hi+lo)/2; lo=m-100; hi=m+100; }
    const D=prof[prof.length-1][0]||1, padT=18, padB=16, X=d=>d/D*(W-4)+2, Y=h=>padT+(1-(h-lo)/(hi-lo))*(Hh-padT-padB);
    const cs=getComputedStyle(document.documentElement);
    g.beginPath(); prof.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));
    g.lineTo(X(D),Hh-padB); g.lineTo(X(0),Hh-padB); g.closePath(); g.fillStyle='rgba(201,128,60,.18)'; g.fill();
    g.beginPath(); prof.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));
    g.lineWidth=2.5; g.strokeStyle=cs.getPropertyValue('--copper').trim()||'#c9803c'; g.stroke();
    g.font='500 20px "IBM Plex Mono", ui-monospace, monospace'; g.fillStyle=cs.getPropertyValue('--mute').trim()||'#9aa79e';
    g.textBaseline='top'; g.textAlign='left'; g.fillText('max '+(hi/1000).toFixed(2)+' km',4,0);
    g.textBaseline='bottom'; g.fillText('min '+(lo/1000).toFixed(2)+' km',4,Hh);
    g.textAlign='right'; g.fillText(km(D),W-4,Hh);
  }
  function paintMeasure(){
    if(!measuring||!meas.length) return;
    const pts=measCursor?meas.concat([measCursor]):meas;
    og.save(); og.lineJoin='round'; og.lineCap='round';
    og.beginPath(); pts.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1]));
    og.lineWidth=10; og.strokeStyle='rgba(0,0,0,.65)'; og.stroke();
    og.lineWidth=5; og.strokeStyle='#ffd27a'; if(measCursor) og.setLineDash([]); og.stroke();
    if(measCursor&&meas.length){ const a=meas[meas.length-1]; og.beginPath(); og.moveTo(a[0],a[1]); og.lineTo(measCursor[0],measCursor[1]); og.setLineDash([10,7]); og.lineWidth=4; og.strokeStyle='#fff'; og.stroke(); og.setLineDash([]); }
    og.font='500 22px "IBM Plex Mono", ui-monospace, monospace'; og.textAlign='center'; og.textBaseline='middle';
    for(let s=1;s<pts.length;s++){
      const p=pts[s-1], q=pts[s], t=km(segKm(p,q)), mx=(p[0]+q[0])/2, my=(p[1]+q[1])/2-18;
      og.lineWidth=6; og.strokeStyle='rgba(0,0,0,.85)'; og.strokeText(t,mx,my); og.fillStyle='#ffe7b3'; og.fillText(t,mx,my);
    }
    meas.forEach((p,i)=>{ og.beginPath(); og.arc(p[0],p[1],i===0?8:6,0,Math.PI*2); og.fillStyle=i===0?'#ffd27a':'#fff'; og.fill(); og.lineWidth=2; og.strokeStyle='rgba(0,0,0,.7)'; og.stroke(); });
    og.restore();
  }
  function measAdd(p){ const l=meas[meas.length-1]; if(l&&l[0]===p[0]&&l[1]===p[1]) return; meas.push(p); paintOverlay(); measReadout(); }
  function measStart(){
    if(drawing) cancelDraw();
    measuring=true; meas=[]; measCursor=null; overlay.visible=true; document.body.classList.add('measuring');
    measbar.hidden=false; bMeasure.setAttribute('aria-pressed',true); measReadout(); paintOverlay();
  }
  function measStop(){
    measuring=false; meas=[]; measCursor=null; document.body.classList.remove('measuring'); measbar.hidden=true;
    bMeasure.setAttribute('aria-pressed',false);
    overlay.visible=anyLayer(); paintOverlay();
  }
  bMeasure.onclick=()=>measuring?measStop():measStart();
  $('mUndo').onclick=()=>{ meas.pop(); paintOverlay(); measReadout(); };
  $('mClear').onclick=()=>{ meas=[]; measCursor=null; paintOverlay(); measReadout(); };
  $('mDone').onclick=measStop;
  renderer.domElement.addEventListener('pointerleave',()=>{ if(measuring&&measCursor){ measCursor=null; paintOverlay(); measReadout(); } });
  addEventListener('keydown',e=>{
    if(isTyping(e)) return;
    if(e.key==='m'||e.key==='M'){ if(!drawing){ measuring?measStop():measStart(); } return; }
    if(!measuring) return;
    if(e.key==='Escape') measStop();
    else if(e.key==='Backspace'){ e.preventDefault(); meas.pop(); paintOverlay(); measReadout(); }
  });
  window.__measure={add:p=>measAdd(p),start:measStart,stop:measStop,stats:()=>routeStats(meas)};
