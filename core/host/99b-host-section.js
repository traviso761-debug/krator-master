// ================================================================= CORE HOST — the cut-away's additions: caps, decks, the band, the section
// [web] core/host/99b-host-section.js (core/host/UNDERGROUND.md; kits/tungang/PLAN.md section 6.3, views 2 and 3). OPT-IN BY FILE: a
// build lists it (host.py UNDERGROUND) beside 99-host-cutaway.js; a page without it draws exactly as before. It shares 99's five
// planes when 99 is on the page (a deck cut is 99's unit cut), and makes its own when it is not (a cave with no decks).
//
//   o.cutaway = {units?, ...99's options...,
//     caps: true | {color: '#2c2622', hatch: true, match(mesh) (default: userData.rock or userData.cap)},
//                       the cut rock drawn solid: each matched mesh gets a child of the same geometry, its BACK faces in a flat section
//                       colour with a faint screen hatch, under the same planes (a cut looks into rock, not through a hollow shell).
//                       A DoubleSide rock material is drawn FrontSide while a cut is on (one recompile), so its back faces do not fight
//     decks: {of(object) -> deck index | null (default userData.deck), fog: {color: '#0a0908', opacity: .5} | false},
//                       with a unit cut at storey i: everything of deck > i hidden (by visibility, the deck's own objects, no shader),
//                       and under the storey's floor a dark sheet so the decks below read darker (Dwarf Fortress's lower levels)
//     band: true | {above: 3, soft: 1, r: 0 (0: everywhere; else a box of that half-width round the eye), key: 'u'},
//                       a cut relative to the eye for caves without decks: everything over (eye + above + soft) goes; with
//                       core/shader/aids (KFADE) on a material the last metre dithers out instead of ending hard
//     section: true | {key: 'c', offset: 0, slab: 6},
//                       C a vertical plane through the target facing the camera (the half toward the camera goes: the ant-farm view);
//                       Shift+C a slab: only the slab metres round the target stay (two planes; union clipping, one recompile each way)
//   }
//   KHOST.section: {mode: null | 'band' | 'section' | 'slab' | 'unit', set(mode), off(), planes, clipped(x, y, z) (a pick's filter:
//     three's Raycaster ignores clipping), caps(), decks(i), badge}
// The badge (#khost-cutmode) is up whenever any cut is on, and says which (Timberborn's lesson: a cut must always say it is on).
// The plane count stays five whatever the mode (three recompiles a material when it changes); only the slab changes how they combine.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
const BIG=1e9;
K.onTake(function sectionTake(H){
 const o=H.o,CO=o.cutaway;if(!CO||!(CO.caps||CO.decks||CO.band||CO.section))return;
 const THREE=o.THREE||root.THREE,C=K.cam,CUT=K.cut||null;
 const S=K.section={mode:null,planes:null,inter:true};
 const capO=CO.caps===true?{}:CO.caps||null,deckO=CO.decks===true?{}:CO.decks||null,bandO=CO.band===true?{}:CO.band||null,secO=CO.section===true?{}:CO.section||null;
 // ---------------------------------------------------------------- the planes: 99's when it is here, else our own five
 const N0=[[0,-1,0],[-1,0,0],[1,0,0],[0,0,-1],[0,0,1]];   /* 99's normals, put back before every unit cut */
 function planes(){if(S.planes)return S.planes;
  S.planes=CUT?CUT.ensure():N0.map(n=>new THREE.Plane(new THREE.Vector3(n[0],n[1],n[2]),BIG));H.renderer.localClippingEnabled=true;return S.planes;}
 function normals(){const P=planes();N0.forEach((n,i)=>P[i].normal.set(n[0],n[1],n[2]));}
 /* a plane that clips everywhere (intersection: it never vetoes) or nowhere (union: it never clips) */
 function idle(p,inter){p.normal.set(0,1,0);p.constant=inter?-BIG:BIG;}
 function offAll(){const P=planes();normals();P.forEach(p=>p.constant=BIG);}
 const mats=new Set();
 function patch(){const P=planes();let n=0;
  H.scene.traverse(q=>{if(q.userData&&q.userData.khost&&q.userData.khost!=='cap')return;const ms=q.material?(Array.isArray(q.material)?q.material:[q.material]):[];
   ms.forEach(m=>{if(m.isShaderMaterial&&!m.clipping)return;if(m.clippingPlanes!==P||m.clipIntersection!==S.inter){m.clippingPlanes=P;m.clipIntersection=S.inter;m.clipShadows=true;m.needsUpdate=true;n++;}mats.add(m);});});
  return n;}
 function combine(inter){if(S.inter===inter)return;S.inter=inter;mats.forEach(m=>{if(m.clippingPlanes===S.planes){m.clipIntersection=inter;m.needsUpdate=true;}});}
 // ---------------------------------------------------------------- caps
 const capMat=capO?new THREE.MeshBasicMaterial({color:new THREE.Color(capO.color||'#2c2622'),side:THREE.BackSide}):null;
 if(capMat&&capO.hatch!==false&&root.KHOOK)root.KHOOK.add(capMat,'khost-cap-hatch',{fragment:{at:[{at:'dithering_fragment',after:'{float kh=mod(gl_FragCoord.x+gl_FragCoord.y,9.);if(kh<1.4)gl_FragColor.rgb*=1.45;}'}]}});
 const capMatch=capO&&(capO.match||(m=>m.userData&&(m.userData.rock||m.userData.cap)));
 const capped=[],dbl=new Map();let capP=null;
 /* the caps' own planes. In a deck or band cut they show only inside the cut's box and under its top (the cut's box inverted, joined:
    union), so the voids outside the box, seen from a camera standing in the rock, are not painted as silhouettes. In a section or
    slab they take the main planes: the far side's voids are behind rock, and a flat cap over them is the true picture */
 function syncCaps(){if(!capMat||!S.planes)return;const P=S.planes,box=S.mode==='unit'||S.mode==='band';
  if(!capP)capP=P.map(()=>new THREE.Plane(new THREE.Vector3(0,1,0),BIG));
  if(box){capP[0].copy(P[0]);for(let i=1;i<5;i++){capP[i].normal.copy(P[i].normal).negate();capP[i].constant=-P[i].constant;}}
  const want=box?capP:P,inter=box?false:S.inter;if(capMat.clippingPlanes!==want||capMat.clipIntersection!==inter){capMat.clippingPlanes=want;capMat.clipIntersection=inter;capMat.needsUpdate=true;}}
 S.syncCaps=syncCaps;
 function caps(on){if(!capMat)return 0;planes();syncCaps();
  if(on)H.scene.traverse(q=>{if(!q.isMesh||q.userData.khostCap||q.userData.khost)return;if(!capMatch(q))return;
   const c=new THREE.Mesh(q.geometry,capMat);c.userData.khost='cap';c.userData.probeSkip=true;c.castShadow=false;c.receiveShadow=false;c.name='cap of '+(q.name||'rock');c.renderOrder=q.renderOrder;
   q.add(c);q.userData.khostCap=c;capped.push(c);const m=q.material;if(m&&m.side===THREE.DoubleSide&&!dbl.has(m))dbl.set(m,m.side);});
  capped.forEach(c=>c.visible=on);dbl.forEach((side,m)=>{const s=on?THREE.FrontSide:side;if(m.side!==s){m.side=s;m.needsUpdate=true;}});
  return capped.length;}
 S.caps=caps;
 // ---------------------------------------------------------------- decks: above hidden, below darkened
 const deckOf=deckO&&(deckO.of||(q=>q.userData&&q.userData.deck!=null?q.userData.deck:null));const hid=[];let fog=null;
 function decks(i,unit){hid.forEach(q=>q.visible=true);hid.length=0;if(fog)fog.visible=false;if(!deckO||i==null)return 0;
  H.scene.traverse(q=>{if(q.userData&&q.userData.khost)return;const d=deckOf(q);if(d!=null&&d>i&&q.visible){q.visible=false;hid.push(q);}});
  if(deckO.fog!==false&&unit&&unit.levels&&unit.levels[i]){const F=deckO.fog||{};
   if(!fog){fog=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:new THREE.Color(F.color||'#0a0908'),transparent:true,opacity:F.opacity==null?.5:F.opacity,depthWrite:false,side:THREE.DoubleSide}));
    fog.rotation.x=-Math.PI/2;fog.renderOrder=5;fog.userData.khost='cutfog';fog.userData.probeSkip=true;fog.name='the decks below, darkened';fog.frustumCulled=false;H.scene.add(fog);}
   const w=(unit.r!=null?unit.r*2:Math.max(unit.w==null?0:unit.w,unit.d==null?0:unit.d))+40;fog.scale.set(w,w,1);fog.position.set(unit.x,unit.levels[i].y-.35,unit.z);fog.visible=i>0;}
  return hid.length;}
 S.decks=decks;
 // ---------------------------------------------------------------- the modes
 const fw=new THREE.Vector3();
 function eyeY(){const c=C.ctl;return c.target.y;}
 function placeBand(){const P=S.planes,B=bandO,above=B.above==null?3:B.above,soft=B.soft==null?1:B.soft,r=B.r==null?0:B.r,t=C.ctl.target,y=eyeY()+above;
  normals();P[0].constant=y+soft;
  if(r>0){P[1].constant=t.x-r;P[2].constant=-(t.x+r);P[3].constant=t.z-r;P[4].constant=-(t.z+r);}else{P[1].constant=-BIG;P[2].constant=-BIG;P[3].constant=-BIG;P[4].constant=-BIG;}
  if(root.KFADE&&root.KFADE.band)root.KFADE.band(y,soft);syncCaps();}
 function placeSection(){const P=S.planes,t=C.ctl.target,cp=H.camera.position;fw.set(t.x-cp.x,0,t.z-cp.z);if(fw.lengthSq()<1e-6)fw.set(-Math.sin(C.ctl.theta),0,-Math.cos(C.ctl.theta));fw.normalize();
  const off=secO.offset==null?0:secO.offset,s=fw.x*t.x+fw.z*t.z+off;
  if(S.mode==='section'){P[1].normal.set(fw.x,0,fw.z);P[1].constant=-s;[0,2,3,4].forEach(i=>idle(P[i],true));}
  else{const half=(secO.slab==null?6:secO.slab)/2;P[1].normal.set(fw.x,0,fw.z);P[1].constant=-(s-half);P[2].normal.set(-fw.x,0,-fw.z);P[2].constant=s+half;[0,3,4].forEach(i=>idle(P[i],false));}syncCaps();}
 S.set=function(mode){if(mode===S.mode&&mode!=='unit'){S.off();return;}
  if(mode!=='unit'&&CUT&&CUT.on)CUT.off();
  S.mode=mode;planes();
  if(mode==='slab')combine(false);else combine(true);
  patch();caps(true);
  if(mode==='band')placeBand();else if(mode==='section'||mode==='slab')placeSection();
  if(mode!=='band'&&root.KFADE&&root.KFADE.band)root.KFADE.band(null);
  paint();return mode;};
 S.off=function(){const was=S.mode;S.mode=null;if(was==='unit'&&CUT&&CUT.on)CUT.off();offAll();combine(true);caps(false);decks(null);if(root.KFADE&&root.KFADE.band)root.KFADE.band(null);paint();};
 /* a picked point the planes hide (three's Raycaster ignores clipping: a pick filters its hits through this) */
 S.clipped=function(x,y,z){if(!S.planes||(!S.mode&&!(CUT&&CUT.on)))return false;const P=S.planes;let all=true,any=false;
  for(let i=0;i<P.length;i++){const v=P[i].normal.x*x+P[i].normal.y*y+P[i].normal.z*z+P[i].constant;if(v<0)any=true;else all=false;}return S.inter?all:any;};
 // ---------------------------------------------------------------- 99's unit cut: the normals put back first, the decks and caps after
 if(CUT){const to=CUT.to,off=CUT.off;
  CUT.to=function(u,storey){if(S.mode&&S.mode!=='unit'){S.mode=null;if(root.KFADE&&root.KFADE.band)root.KFADE.band(null);}
   planes();normals();combine(true);to(u,storey);if(!CUT.on)return;S.mode='unit';patch();caps(true);decks(CUT.storey,CUT.unit);paint();};
  CUT.off=function(){off();if(S.mode==='unit'){S.mode=null;caps(false);decks(null);}paint();};}
 // the band and the section follow the eye and the view every frame; new rock (a streamed chunk) is capped every half second
 let capT=0;
 K.on(function sectionFrame(){if(!S.mode)return;
  if(S.mode==='band')placeBand();else if(S.mode==='section'||S.mode==='slab')placeSection();
  const now=performance.now();if(now-capT>500){capT=now;patch();caps(true);}},'view');
 // ---------------------------------------------------------------- the badge: a cut always says it is on
 const badge=S.badge=doc.createElement('div');badge.id='khost-cutmode';badge.className='khost-chrome';
 badge.style.cssText='position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:14;display:none;padding:4px 10px;background:rgba(120,30,20,.88);border:1px solid rgba(255,200,160,.6);border-radius:3px;font:12px/1.4 system-ui,sans-serif;color:#fff2e6';
 doc.body.appendChild(badge);
 function paint(){const m=S.mode;if(!m){badge.style.display='none';return;}let t='';
  if(m==='unit'&&CUT&&CUT.unit){const u=CUT.unit,L=u.levels[CUT.storey];t='CUT · '+(u.name||u.id)+' · deck '+(CUT.storey+1)+' of '+u.levels.length+(L&&L.name?' ('+L.name+')':'')+(hid.length?' · '+hid.length+' above hidden':'');}
  else if(m==='band')t='CUT · everything over '+(bandO.above==null?3:bandO.above)+' m above you'+(bandO.r?' within '+bandO.r+' m':'')+' · '+(bandO.key||'u').toUpperCase()+' to close';
  else if(m==='section')t='SECTION · the near half is cut away · '+(secO.key||'c').toUpperCase()+' to close';
  else if(m==='slab')t='SLAB · '+(secO.slab==null?6:secO.slab)+' m round the target · '+(secO.key||'c').toUpperCase()+' to close';
  badge.innerHTML=t;badge.style.display='block';}
 S.paint=paint;
 // ---------------------------------------------------------------- keys and buttons
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 const bk=bandO?String(bandO.key||'u').toLowerCase():null,sk=secO?String(secO.key||'c').toLowerCase():null,own=k=>o.keys&&o.keys[k];
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
  if(bk&&k===bk&&!own(bk)){S.set('band');e.preventDefault();}
  else if(sk&&k===sk&&!own(sk)){S.set(e.shiftKey?'slab':'section');e.preventDefault();}});
 if(K.ui){if(bandO){const b=doc.createElement('button');b.textContent='band cut ('+bk.toUpperCase()+')';b.id='khost-band-btn';b.onclick=()=>S.set('band');K.ui.appendChild(b);}
  if(secO){const b=doc.createElement('button');b.textContent='section ('+sk.toUpperCase()+')';b.id='khost-section-btn';b.onclick=()=>S.set('section');K.ui.appendChild(b);}}
});
})(typeof window!=='undefined'?window:globalThis);
