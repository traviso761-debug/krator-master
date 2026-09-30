// ---------------------------------------------------------------- the reclaimed large objects
// Each core draws in the CURRENT frame, centred on the origin with its base on y=0. Enter a frame with W(x,y,z,ry,()=>core(...)).
// Sizes are real: ISO container 2.44 wide x 2.59 high, 6.06 (20 ft) or 12.19 m (40 ft) long; a school bus 11 m; a grain bin 3-8 m radius.
const CT={W:2.44,H:2.59,L20:6.06,L40:12.19};
// horizontal cylinder along x (axis 'x') or z (axis 'z'), centred at (x,y,z); wrap = ribs follow the surface
function cylH(mk,x,y,z,r,L,col,axis,seg,wrap){seg=seg||14;const tl=TILE[mk]||1;const m=TF(x,y,z,0,axis==='z'?PI/2:0,axis==='x'?PI/2:0);m.scale(new THREE.Vector3(r,L,r));
 const g=_G['cylc'+seg]||(_G['cylc'+seg]=(()=>{const g0=new THREE.CylinderGeometry(1,1,1,seg,1);return g0;})());emit(mk,g,m,col,wrap?{su:TAU*r/tl,sv:L/tl}:undefined);}
// wall with rectangular openings, in the local frame: along x centred at x, from y to y+h, thickness th (along z at z). ops: [{x0,x1,y0,y1}] with local x/y, not overlapping in x
function wallOpen(mk,x,y,z,w,h,th,ops,col,ry){W(x,0,z,ry||0,()=>{const L=-w/2;let cur=L;const o=ops.slice().sort((a,b)=>a.x0-b.x0);
 const seg=(a,b,y0,y1)=>{if(b-a>.02&&y1-y0>.02)box(mk,(a+b)/2,y0,0,b-a,y1-y0,th,jc(col,.03));};
 for(const p of o){seg(cur,p.x0-x,y,y+h);seg(p.x0-x,p.x1-x,y,p.y0);seg(p.x0-x,p.x1-x,p.y1,y+h);cur=p.x1-x;}seg(cur,w/2,y,y+h);});}
// ---- shipping container. Long axis x; the +z long side is the "front"; door end at +x. o:{len,hi,col,open:'front'|'end'|'',wear,doorEnd:false}
function container(o){o=o||{};const L=o.len||CT.L20,Wd=CT.W,H=o.hi?2.9:CT.H;const c=o.col===undefined?PAINT():(typeof o.col==='number'?jc(o.col,.05):o.col);
 const dark=jc(0x3a3532,.05),rail=jc(0x4a4038,.05),t=.07;
 if(o.open==='front'){ // three walls + floor + roof: an open-fronted shop or shelter
  box('cont',0,.16,-Wd/2+t/2,L,H-.16,t,c);box('cont',-L/2+t/2,.16,0,t,H-.16,Wd,c);box('cont',L/2-t/2,.16,0,t,H-.16,Wd,c);
  box('cont',0,H-t,0,L,t,Wd,c);box('plank',0,.1,0,L-.1,.08,Wd-.1,jc(0x6a5a44,.08));box('iron',0,0,0,L,.16,Wd,rail);
  box('conc',0,0,-Wd/2+.1,L-.2,.02,.02,dark);
 }else{box('cont',0,.16,0,L,H-.16,Wd,c);box('iron',0,0,0,L,.16,Wd,rail);}
 // frame: 4 corner posts, top and bottom side rails, in dark steel
 for(const sx of [-1,1])for(const sz of [-1,1]){box('iron',sx*(L/2-.08),0,sz*(Wd/2-.08),.16,H,.16,rail);}
 for(const sz of [-1,1]){box('iron',0,H-.1,sz*(Wd/2-.05),L,.1,.1,rail);}
 if(!o.open||o.open!=='front'){box('iron',0,H-.05,0,L+.02,.06,Wd+.02,jc(0x5a4a3c,.06));}
 // door end (+x): two doors with vertical locking bars and handles
 if(o.open!=='end'&&o.doorEnd!==false){const x=L/2+.02;for(const k of [-1,1]){box('iron',x,.35,k*.45,.05,H-.75,.03,dark);box('iron',x+.03,.5,k*.85,.05,H-1.05,.04,jc(0x8a8a86,.05));}
  box('iron',x,.16,0,.04,H-.3,.03,dark);}
 // horizontal container rib bulge on the roof + a rain-streak wear panel
 return {L:L,W:Wd,H:H};}
// ---- grain bin / silo. Vertical corrugated cylinder with a conical roof. o:{r,h,col,roof:0xhex|'rust',door:true,ladder:true,rings:true}
function silo(o){const r=o.r||3,h=o.h||9;const c=o.col===undefined?P('galv'):(typeof o.col==='number'?jc(o.col,.04):o.col);const roofC=o.roofCol!==undefined?jc(o.roofCol,.05):jc(pick([0xc45a30,0xb0522e,0x9a4a2a,0x8a8a84]),.06);
 cyl('conc',0,0,0,r+.18,.45,jc(0xa8a498,.05),18);cyl('corrH',0,.4,0,r,h-.4,c,20,r,true);
 // lap seams: vertical straps
 for(let k=0;k<10;k++){const a=k/10*TAU;box('iron',Math.cos(a)*(r+.03),.4,Math.sin(a)*(r+.03),.1,h-.4,.05,jc(0x6a6a66,.05),-a+PI/2);}
 for(const yy of [h*.33,h*.66]){cyl('iron',0,yy,0,r+.05,.12,jc(0x5a5a56,.05),20);}
 // eave ring + cone roof + vent
 cyl('iron',0,h-.06,0,r+.12,.14,jc(0x6a5a4c,.05),20);
 const rh=r*(o.rise||.42);cyl('sheet',0,h,0,r+.38,rh,roofC,20,r*.16);cyl('iron',0,h+rh-.05,0,r*.2,.25,jc(0x4a4038,.05),10);cone('iron',0,h+rh+.15,0,r*.26,.35,jc(0x5a4a3c,.05),10);
 for(let k=0;k<16;k++){const a=k/16*TAU;beam('iron',[Math.cos(a)*(r+.3),h+.02,Math.sin(a)*(r+.3)],[Math.cos(a)*r*.17,h+rh-.03,Math.sin(a)*r*.17],.05,jc(0x3a3430,.05));}
 return {r:r,h:h,roofH:rh};}
// ---- storage tank: vertical (default) or lying ('h', axis x). o:{r,h|L,col,dome}
function tankV(o){const r=o.r||3,h=o.h||6;const c=o.col===undefined?jc(pick([0x9a9a92,0x8a8f8a,0x7a6a58,0x6a7a78]),.05):jc(o.col,.04);
 cyl('conc',0,0,0,r+.15,.3,jc(0x8a8880,.05),20);cyl('sheet',0,.3,0,r,h,c,20,r,true);for(const f of [.25,.5,.75])cyl('iron',0,.3+h*f,0,r+.04,.1,jc(0x4a4038,.05),20);
 cyl('iron',0,.3+h,0,r+.08,.16,jc(0x4a4038,.05),20);cyl('sheet',0,.3+h+.16,0,r,r*.14,jc(c,.03),20,r*.6);cyl('iron',0,.3+h+.16+r*.14,0,r*.25,.28,jc(0x3a3430,.05),10);
 return {r:r,h:h+.3+r*.14};}
function tankH(o){const r=o.r||1.6,L=o.L||7;const c=o.col===undefined?jc(pick([0x7a6a58,0x8a8f8a,0x5a6a68,0x9a6a3a]),.05):jc(o.col,.04);
 cylH('sheet',0,r+.35,0,r,L-r*.7,c,'x',18,true);for(const sx of [-1,1])sph('sheet',sx*(L/2-r*.35),r+.35,0,r,c,1);   // domed ends: spheres scaled below
 for(const sx of [-1,1])for(const sz of [-.55,.55])box('conc',sx*L*.28,0,sz*r,.5,.45+.15,.5,jc(0x8a8880,.05));
 for(const f of [-.3,0,.3])cylH('iron',f*L,r+.35,0,r+.04,.12,jc(0x4a4038,.05),'x',18);box('iron',0,r*2+.3,0,1.1,.16,.9,jc(0x4a4038,.05));
 return {r:r,L:L,h:2*r+.35};}
// ---- school bus / coach. Long axis x, front at +x. o:{len,col,windows:true}
function bus(o){o=o||{};const L=o.len||10.6,Wd=2.4,H=2.35;const c=o.col===undefined?jc(pick([0xd8a020,0xc99a2e,0x9a3a2c,0x3b7f8e,0xb8b0a0]),.06):jc(o.col,.04);const ink=jc(0x2a2826,.03);
 box('sheet',-.4,.75,0,L-2.2,H-.75,Wd,c);box('sheet',L/2-1.05,.75,0,2.0,1.3,Wd-.1,c);            // body + bonnet
 box('iron',0,.5,0,L-.1,.3,Wd-.1,jc(0x3a3532,.05));                                              // chassis
 box('sheet',-.4,H,0,L-2.2,.1,Wd-.1,jc(c,.04));
 for(const sz of [-1,1]){ // window band and pillars
  const n=Math.floor((L-3.6)/1.05);for(let k=0;k<n;k++){const x=-L/2+1.0+k*1.05;box('glass',x+.4,1.45,sz*(Wd/2+.02),.86,.72,.04,jc(0x6a9a94,.06));}
  box('iron',-.4,1.1,sz*(Wd/2+.015),L-2.2,.06,.04,ink);box('iron',-.4,2.02,sz*(Wd/2+.015),L-2.2,.06,.04,ink);}
 box('glass',L/2-2.2,1.5,0,.05,.85,Wd-.3,jc(0x6a9a94,.06),0,0,-.25);                            // windscreen
 for(const wx of [-L*.33,L*.32])for(const sz of [-1,1]){tire(wx,.5,sz*(Wd/2-.05),.5,.2,undefined,0,PI/2,0);cylH('iron',wx,.5,sz*(Wd/2+.13),.22,.06,jc(0x8a8a86,.06),'z',10);}
 box('iron',L/2+.02,.4,0,.1,.2,Wd,jc(0x6a6a66,.06));return {L:L,W:Wd,H:H};}
// ---- semi truck: cab + long trailer. front at +x. o:{trailer:true,col,tcol}
function semi(o){o=o||{};const L=o.trailer===false?0:13.4;const c=o.col===undefined?jc(pick([0x9a3a2c,0x2f5f8f,0xb8b0a0,0x4d6f3c]),.06):jc(o.col,.04);
 const off=L?-1.6:0;W(off,0,0,0,()=>{box('sheet',L/2+.4,.7,0,2.6,1.7,2.4,c);box('sheet',L/2+1.3,.7,0,1.2,1.0,2.3,jc(c,.05));box('glass',L/2+.2,1.85,0,.05,.65,2.0,jc(0x6a9a94,.06),0,0,-.2);
  box('iron',L/2-.5,.5,0,7,.3,1.0,jc(0x3a3532,.05));cyl('iron',L/2+1.9,1.3,.75,.06,1.5,jc(0x8a8a86,.05),8);cyl('iron',L/2+1.9,1.3,-.75,.06,1.5,jc(0x8a8a86,.05),8);
  for(const wx of [L/2-.3,L/2+1.5])for(const sz of [-1,1])tire(wx,.5,sz*1.1,.5,.2,undefined,0,PI/2,0);
  if(L){container({len:12.19,col:o.tcol,doorEnd:true,hi:true});}});
 if(L)for(const wx of [-L/2+1.2,-L/2+2.5,-L/2+3.8])for(const sz of [-1,1])W(off,0,0,0,()=>tire(wx,.5,sz*1.1,.5,.2,undefined,0,PI/2,0));return {L:L+3.5};}
// ---- arcology bulkhead: a slab of the Ancients' white ceramic with a great round hatch or a rectangular doorway. Faces +z.
// o:{w,h,th,hatch:'round'|'door'|null,curve:false}
function bulkhead(o){const w=o.w||9,h=o.h||7,th=o.th||.9;const c=jc(pick(PAL.conc),.03);const trim=jc(0x6a6660,.04);
 if(o.hatch==='door'){wallOpen('conc',0,.3,0,w,h-.3,th,[{x0:-1.1,x1:1.1,y0:.3,y1:3.4}],c);}else box('conc',0,.3,0,w,h-.3,th,c);
 box('conc',0,0,.05,w+.5,.3,th+.5,jc(0xb0aca2,.04));box('conc',0,h,0,w+.4,.3,th+.35,jc(0xb8b4aa,.04));
 const n=Math.max(2,Math.round(w/3));for(let k=0;k<=n;k++){const x=-w/2+k*w/n;box('conc',x,.3,th/2+.08,.42,h-.3,.16,jc(0xc8c4ba,.03));}
 for(let k=0;k<3;k++){box('iron',0,h*.25+k*h*.25,th/2+.02,w-.8,.06,.05,trim);}
 if(o.hatch==='round'){const R=Math.min(w,h)*.3;const hy=h*.5;tire(0,hy,th/2+.05,R+.25,.22,jc(0x4a4640,.03),0,PI/2,0);
  W(0,hy,th/2+.12,0,()=>{cylH('iron',0,0,0,R,.12,jc(0x5a5650,.04),'z',22);for(let k=0;k<4;k++){const a=k*PI/4;beam('iron',[Math.cos(a)*R*.85,Math.sin(a)*R*.85,.1],[-Math.cos(a)*R*.85,-Math.sin(a)*R*.85,.1],.09,jc(0x3a3632,.04));}
   cylH('iron',0,0,.08,R*.18,.16,jc(0x8a5a2a,.06),'z',12);});}
 if(o.hatch==='door'){box('iron',0,3.4,th/2+.05,2.5,.16,.22,trim);for(const sx of [-1,1])box('iron',sx*1.2,.3,th/2+.04,.16,3.1,.2,trim);}
 // hazard band along the foot: alternating dark / ochre blocks
 for(let k=0;k<Math.floor(w/.6);k++){box('iron',-w/2+.3+k*.6,.32,th/2+.04,.3,.28,.03,k%2?jc(0x2a2826,.03):jc(0xc0902a,.05));}
 return {w:w,h:h,th:th};}
