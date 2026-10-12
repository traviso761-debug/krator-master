// ---------- a compass and a map, for any page on the shared engine ----------
// The compass sits in the corner and its needle points at true north whichever way the camera turns; click it and
// the view swings round to face north. The Map button opens a plan of the whole map, drawn once when the page opens
// from what the engine built - the land, the parks, the water, every footprint and every road, the landmarks with
// their names - and over it, live, an arrow where you are and a wedge for what you are looking at. Click anywhere on
// the plan and the camera flies there, keeping its height and heading.
//
// A page turns it on by listing it among its extras: {name:'navmap', fn:navmap}. The landmarks labelled are those
// with a model, unless the city file lists its own (C.navmap.labels: [names]).
export function navmap(api){
  const {THREE,C,B,ROADS,AREAS,FOOTPRINTS,inWater,animHooks,P}=api;const N=C.navmap||{};
  const css=document.createElement('style');css.textContent=`
#compass{position:fixed;top:12px;right:12px;width:62px;height:62px;border-radius:50%;background:rgba(14,18,24,.78);border:1px solid rgba(255,255,255,.35);cursor:pointer;z-index:7;box-shadow:0 2px 8px rgba(0,0,0,.35)}
#compass svg{width:100%;height:100%;display:block}
#navmap{position:fixed;top:84px;right:12px;width:min(420px,calc(100vw - 24px));display:none;z-index:7;background:rgba(14,18,24,.9);border:1px solid rgba(255,255,255,.3);border-radius:4px;padding:6px;box-sizing:border-box}
#navmap.open{display:block}#navmap canvas{width:100%;display:block;cursor:crosshair;border-radius:2px}
#navmap .cap{font:12px Helvetica,Arial,sans-serif;color:#e8e4dc;padding:4px 2px 0;display:flex;justify-content:space-between}`;
  document.head.appendChild(css);

  // the map opens under the clock column, wherever its bottom is, and no taller than the window leaves
  function placePanel(){const sd=document.getElementById('side');if(!sd)return;const b=sd.getBoundingClientRect(),top=Math.round(b.bottom+8);
    panel.style.top=top+'px';panel.style.maxHeight=`calc(100vh - ${top+70}px)`;panel.style.overflow='auto';}
  // ---- the compass: a dial and a needle, the needle turned to north as the camera turns ----
  const cp=document.createElement('div');cp.id='compass';cp.title='North. Click to face north.';cp.setAttribute('role','button');
  cp.innerHTML=`<svg viewBox="-50 -50 100 100"><circle r="44" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
    <g id="cmp-rose">${[0,90,180,270].map(a=>`<line x1="0" y1="-44" x2="0" y2="-36" stroke="rgba(255,255,255,.6)" stroke-width="2" transform="rotate(${a})"/>`).join('')}
    <path d="M0,-34 L7,0 L0,6 L-7,0 Z" fill="#d8402e"/><path d="M0,34 L7,0 L0,-6 L-7,0 Z" fill="#e8e4dc"/>
    <text x="0" y="-22" text-anchor="middle" font-size="13" font-family="Helvetica,Arial" font-weight="700" fill="#fff">N</text></g></svg>`;
  // in the top-right column with the clock (#side), above the time bar, so neither covers the other; a page
  // without one keeps it in the corner
  const side=document.getElementById('side');
  if(side){cp.style.position='static';cp.style.pointerEvents='auto';cp.style.flex='none';side.insertBefore(cp,side.firstChild);}else document.body.appendChild(cp);
  const rose=cp.querySelector('#cmp-rose');
  // the camera's heading: it looks from target + (dist, az, el) back at the target
  const heading=()=>{const c=api.ctl,fx=-Math.cos(c.az),fz=-Math.sin(c.az);return Math.atan2(fx,-fz);};   // radians east of north
  cp.addEventListener('click',e=>{e.stopPropagation();const c=api.ctl,t=c.target,az=Math.PI/2,el=c.el,d=c.dist;
    api.setView(t.x+Math.cos(el)*Math.cos(az)*d,t.y+Math.sin(el)*d,t.z+Math.cos(el)*Math.sin(az)*d,t.x,t.y,t.z);});

  // ---- the plan, drawn once ----
  const W=840,H=Math.round(W*B.d/B.w),sx=W/B.w,sz=H/B.d,X=x=>(x-B.x0)*sx,Z=z=>(z-B.z0)*sz;
  const base=document.createElement('canvas');base.width=W;base.height=H;const g=base.getContext('2d');
  g.fillStyle=N.land||'#dccfb6';g.fillRect(0,0,W,H);
  const fillRing=(ring,col)=>{if(!ring||ring.length<3)return;g.fillStyle=col;g.beginPath();g.moveTo(X(ring[0][0]),Z(ring[0][1]));for(let i=1;i<ring.length;i++)g.lineTo(X(ring[i][0]),Z(ring[i][1]));g.closePath();g.fill();};
  const GREEN=new Set(['park','garden','grass','wood','cemetery','pitch','reserve','golf','zoo','recreation_ground']);
  for(const a of AREAS||[])if(GREEN.has(a.kind))fillRing(a.o,N.green||'#b3c495');else if(a.kind==='plaza')fillRing(a.o,N.plaza||'#e9e1d2');
  // the water, sampled (the engine keeps its water as a test, not a list)
  {const cell=Math.max(B.w,B.d)/360;g.fillStyle=N.water||'#8fb4c6';for(let z=B.z0;z<B.z1;z+=cell)for(let x=B.x0;x<B.x1;x+=cell)if(inWater(x+cell/2,z+cell/2))g.fillRect(X(x),Z(z),cell*sx+0.6,cell*sz+0.6);}
  // the buildings from the map data itself: a city that builds its blocks only near the camera has few footprints yet
  if(api.OSM&&api.OSM.buildings&&api.dec){for(const b of api.OSM.buildings)fillRing(api.dec(b.p),N.buildings||'rgba(176,122,84,.78)');}
  else for(const f of FOOTPRINTS||[])fillRing(f.ring,N.buildings||'rgba(176,122,84,.78)');
  const RW={motorway:4,trunk:3.6,primary:3.2,secondary:2.8,tertiary:2.4,residential:1.6,unclassified:1.6,living_street:1.4,pedestrian:1.6,alley:1,trail:0.8};
  for(const pass of [0,1])for(const r of ROADS||[]){const w=RW[r.c]||1.2;if((pass===0)!==(w<2.2))continue;g.strokeStyle=r.c==='trail'?'rgba(120,110,90,.6)':'#fbf7ee';g.lineWidth=w;g.lineCap='round';g.beginPath();
    r.pts.forEach(([x,z],i)=>i?g.lineTo(X(x),Z(z)):g.moveTo(X(x),Z(z)));g.stroke();}
  // the landmarks: a dot each, names for the ones that matter
  const LBL=new Set(N.labels||[]),marks=[];
  for(const L of C.landmarks||[]){if(!L.at)continue;const [x,z]=P(L.at);const named=LBL.size?LBL.has(L.name):!!L.model&&!['cupola','stonebridge','campanile','obelisk'].includes(L.model);marks.push([X(x),Z(z),named?L.name:null]);}
  g.font='bold 13px Helvetica,Arial,sans-serif';g.textBaseline='middle';
  for(const [x,y,name] of marks){g.fillStyle=name?'#b8232a':'rgba(120,40,30,.6)';g.beginPath();g.arc(x,y,name?4:2.4,0,Math.PI*2);g.fill();
    if(name){g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.85)';g.strokeText(name,x+6,y);g.fillStyle='#2a1c14';g.fillText(name,x+6,y);}}
  // north arrow and scale on the plan itself
  g.fillStyle='#2a1c14';g.font='bold 14px Helvetica,Arial,sans-serif';g.fillText('N ↑',W-34,16);
  {const m=1000,px=m*sx;g.fillRect(12,H-16,px,3);g.font='11px Helvetica,Arial,sans-serif';g.fillText('1 km',12,H-26);}

  // ---- the panel: the plan, and live over it, where you are ----
  const panel=document.createElement('div');panel.id='navmap';const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cap=document.createElement('div');cap.className='cap';
  cap.innerHTML='<span>Click the plan to go there</span><span>'+(C.name||'')+'</span>';panel.append(cv,cap);document.body.appendChild(panel);const ctx2=cv.getContext('2d');
  // the whole city (C.navmap.regions: [{name, box: [s, w, n, e], status: 'built' | 'planned'}]): what is built so far
  // against what is to come, drawn schematically on a box round all of them; a tab switches the plan and this
  let mode='here';const REG=N.regions||[];
  function drawAll(){const all=REG.map(r=>r.box);let s=1e9,w=1e9,n=-1e9,e=-1e9;for(const b of all){s=Math.min(s,b[0]);w=Math.min(w,b[1]);n=Math.max(n,b[2]);e=Math.max(e,b[3]);}
    const pad=0.01;s-=pad;w-=pad;n+=pad;e+=pad;const k=Math.cos((s+n)/2*Math.PI/180),sc=Math.min(W/((e-w)*k),H/(n-s)),ox=(W-(e-w)*k*sc)/2,oy=(H-(n-s)*sc)/2,LX=lo=>ox+(lo-w)*k*sc,LY=la=>oy+(n-la)*sc;
    ctx2.fillStyle='#e9e2d2';ctx2.fillRect(0,0,W,H);ctx2.font='bold 13px Helvetica,Arial,sans-serif';ctx2.textBaseline='middle';
    for(const r of REG){const [a,b,c2,d]=r.box,x0=LX(b),y0=LY(c2),x1=LX(d),y1=LY(a),built=r.status==='built';
      ctx2.fillStyle=built?'rgba(176,122,84,.75)':'rgba(120,120,120,.12)';ctx2.fillRect(x0,y0,x1-x0,y1-y0);ctx2.setLineDash(built?[]:[6,4]);ctx2.strokeStyle=built?'#7a4a2a':'#6a6a6a';ctx2.lineWidth=2;ctx2.strokeRect(x0,y0,x1-x0,y1-y0);ctx2.setLineDash([]);
      ctx2.lineWidth=3;ctx2.strokeStyle='rgba(255,255,255,.9)';ctx2.strokeText(r.name,x0+6,y0+12);ctx2.fillStyle=built?'#3a1c0c':'#555';ctx2.fillText(r.name,x0+6,y0+12);
      if(!built){ctx2.font='11px Helvetica,Arial,sans-serif';ctx2.fillText('to come',x0+6,y0+28);ctx2.font='bold 13px Helvetica,Arial,sans-serif';}}
    for(const [la,lo,name] of N.allLabels||[]){const x=LX(lo),y=LY(la);ctx2.fillStyle='#b8232a';ctx2.beginPath();ctx2.arc(x,y,3.5,0,7);ctx2.fill();ctx2.lineWidth=3;ctx2.strokeStyle='rgba(255,255,255,.85)';ctx2.strokeText(name,x+6,y);ctx2.fillStyle='#2a1c14';ctx2.fillText(name,x+6,y);}
    const t=api.ctl.target,[tla,tlo]=api.toLatLon?api.toLatLon(t.x,t.z):[0,0];ctx2.fillStyle='#d8402e';ctx2.beginPath();ctx2.arc(LX(tlo),LY(tla),6,0,7);ctx2.fill();
    ctx2.fillStyle='#2a1c14';ctx2.font='bold 14px Helvetica,Arial,sans-serif';ctx2.fillText('N ↑',W-34,16);}
  if(REG.length){const tabs=document.createElement('span');tabs.innerHTML='<button data-m="here">This map</button> <button data-m="all">All '+(C.name||'')+'</button>';
    tabs.querySelectorAll('button').forEach(b=>{b.style.cssText='font:12px Helvetica,Arial;margin-left:4px;cursor:pointer';b.addEventListener('click',e=>{e.stopPropagation();mode=b.dataset.m;drawLive();});});cap.lastChild.replaceWith(tabs);}
  // live layers any stage may add (api.MAP_LAYERS: {draw(ctx, X, Z, sx)}): what is built so far, and the like
  const drawLive=()=>{if(mode==='all')return drawAll();ctx2.drawImage(base,0,0);for(const L of api.MAP_LAYERS||[])try{L.draw(ctx2,X,Z,sx);}catch(e){}const c=api.ctl,t=c.target,h=heading(),px=X(t.x),pz=Z(t.z);
    // the wedge of the view, out to a distance that grows with the camera's
    const reach=Math.min(Math.max(c.dist*1.4,120),B.w*0.4)*sx,fov=(api.camera.fov||55)*Math.PI/180*0.6;
    ctx2.fillStyle='rgba(216,64,46,.18)';ctx2.beginPath();ctx2.moveTo(px,pz);ctx2.arc(px,pz,reach,h-Math.PI/2-fov,h-Math.PI/2+fov);ctx2.closePath();ctx2.fill();
    ctx2.save();ctx2.translate(px,pz);ctx2.rotate(h);ctx2.fillStyle='#d8402e';ctx2.strokeStyle='#fff';ctx2.lineWidth=2;ctx2.beginPath();ctx2.moveTo(0,-11);ctx2.lineTo(7,8);ctx2.lineTo(0,4);ctx2.lineTo(-7,8);ctx2.closePath();ctx2.fill();ctx2.stroke();ctx2.restore();};
  cv.addEventListener('click',e=>{e.stopPropagation();if(mode==='all')return;const r=cv.getBoundingClientRect(),x=B.x0+(e.clientX-r.left)/r.width*B.w,z=B.z0+(e.clientY-r.top)/r.height*B.d,c=api.ctl,t=c.target,
      dx=api.camera.position.x-t.x,dy=api.camera.position.y-t.y,dz=api.camera.position.z-t.z,gy=api.groundH(x,z)+Math.max(2,t.y-api.groundH(t.x,t.z));
    api.setView(x+dx,gy+dy,z+dz,x,gy,z);});
  ['pointerdown','wheel'].forEach(ev=>panel.addEventListener(ev,e=>e.stopPropagation()));
  // for the test tools (tools/probe.py screenshots the 3D canvas only): with 'uishot' in the address, a screenshot
  // has the compass and the open plan drawn over it, where they sit on the page
  if(/uishot/.test(api.HASH0||''))animHooks.push(()=>{const el=api.renderer&&api.renderer.domElement;if(!el||el._navShot)return;el._navShot=true;const raw=el.toDataURL.bind(el);
    el.toDataURL=(...a)=>{drawLive();const o=document.createElement('canvas');o.width=el.width;o.height=el.height;const q=o.getContext('2d'),k=el.width/innerWidth;q.drawImage(el,0,0);
      const put=(node,src)=>{const r=node.getBoundingClientRect();if(r.width)q.drawImage(src,r.left*k,r.top*k,r.width*k,r.height*k);};
      if(panel.classList.contains('open'))put(cv,cv);
      {const r=cp.getBoundingClientRect(),cx=(r.left+r.width/2)*k,cy=(r.top+r.height/2)*k,R=r.width/2*k;q.fillStyle='rgba(14,18,24,.78)';q.beginPath();q.arc(cx,cy,R,0,7);q.fill();
       q.save();q.translate(cx,cy);q.rotate(-heading());q.fillStyle='#d8402e';q.beginPath();q.moveTo(0,-R*0.68);q.lineTo(R*0.14,0);q.lineTo(-R*0.14,0);q.fill();q.fillStyle='#e8e4dc';q.beginPath();q.moveTo(0,R*0.68);q.lineTo(R*0.14,0);q.lineTo(-R*0.14,0);q.fill();
       q.fillStyle='#fff';q.font=`bold ${Math.round(R*0.3)}px Helvetica`;q.textAlign='center';q.fillText('N',0,-R*0.38);q.restore();}
      return o.toDataURL(...a);};});
  // ---- every frame: the needle; while the plan is open, the arrow ----
  let last=0;animHooks.push(now=>{rose.setAttribute('transform',`rotate(${(-heading()*180/Math.PI).toFixed(1)})`);if(panel.classList.contains('open')&&now-last>100){last=now;drawLive();}});
  api.onUI(({ui,mkBtn})=>{const b=mkBtn('Map',ui,()=>{const o=!panel.classList.contains('open');panel.classList.toggle('open',o);b.setAttribute('aria-pressed',String(o));if(o){placePanel();drawLive();}});
    b.setAttribute('aria-pressed','false');b.title='A plan of the whole map, where you are on it, and click to go';
    if(/(^|&)map(all)?(&|=|$)/.test(api.HASH0||'')){if(/mapall/.test(api.HASH0)&&REG.length)mode='all';panel.classList.add('open');b.setAttribute('aria-pressed','true');requestAnimationFrame(placePanel);drawLive();}});   // #map in the address opens it
}
