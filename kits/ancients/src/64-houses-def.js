// ================================================================= DOMESTIC HELPERS (QA round 2, 2026-10-01)
// Glass shards for the domestic group's curtain walls and arched openings,
// which are meshes rather than the kit windows `civWin` wraps. An opening is
// cut into panes (`bays` across, `paneH` up to its own height `hFn(x)`), and
// about `frac` of the panes keep a few teeth of glass, chosen by position
// hash like civWin (no rng draw, so nothing else moves). c is the opening's
// bottom centre, q faces out of it; both in KOFF space.
function domShards(c,q,bays,hFn,paneH,frac){const rt=new THREE.Vector3(1,0,0).applyQuaternion(q);
 for(const b of bays){const H=hFn(b[0]);for(let y=0;y<H-.3;y+=paneH){const ph=Math.min(paneH,H-y);if(ph<.6)continue;
  const p=[c[0]+rt.x*b[0],c[1]+y+ph/2,c[2]+rt.z*b[0]];const h=h3(p[0]*.173+.3,p[1]*.291+.7,p[2]*.117+.1);if(h>frac)continue;
  civShardAt(p,q,b[1]*.94,ph*.94,.06,h);}}}
// Furnishing behind an opening, for the domestic types whose openings looked
// onto a flat dark liner: a ceiling light strip (mostly dead in a ruin), a
// cabinet or machine silhouette against the back, now and then a touch panel
// and a conduit drop. p is a point on the floor just inside the skin, n the
// outward normal, `deep` how far back the room goes, `ht` its height. Kit
// instances only; choice by hash, so no rng draw.
function domRoom(p,n,deep,ht,d,seed){const th=Math.atan2(n[2],n[0]);const hh=h3(p[0]*.071+seed,p[1]*.13,p[2]*.057);
 const at=f=>[p[0]-n[0]*deep*f,p[1],p[2]-n[2]*deep*f];
 const s=at(.45);const lit=d>0?hh<.12:hh<.85;
 kput('strip',[s[0],p[1]+ht-.5,s[2]],qEuler(0,-th-Math.PI/2,0),[Math.min(4,deep*1.6),1,1],lit?(d>0?WARM:CYAN):DEAD);
 if(hh<.6){const w=1+hh*2.4,hg=Math.min(ht-1,1.2+hh*2.2),b=at(.88);kput('boxD',[b[0],p[1]+.2+hg/2,b[2]],qEuler(0,-th,0),[Math.min(deep*.3,1+hh),hg,w],null);}
 if(hh>.78){const on=!(d>0&&hh<.92),b=at(.96);kput(on?'cell':'cellD',[b[0],p[1]+1.5,b[2]],qFacing(n),[.5,.7,1],on?CYAN:null);}
 if(hh>.4&&hh<.5){const b=at(.8);kput('tube',[b[0]+n[2]*.6,p[1]+ht/2,b[2]-n[0]*.6],null,[.2,ht,.2],null);}}

// MOULDING: a bone-like roll swept along a path that lies in a wall (wn is the
// wall's outward normal), thickening into knuckles at the ends and at `knots`
// evenly spaced joints, the way Gaudí's bone-work swells at its joints.
// pathFn(t) -> [x,y,z] for t in 0..1. Returns a geometry for the caller to
// merge into a mesh it already draws, so a moulding costs no draw call.
// Now a round section through the shared moulding() (38-helpers2.js): the
// vertices are the same to the bit.
function domMould(pathFn,wn,r,knots,nu){
 const rad=t=>{const e=Math.min(t,1-t);const k=knots?Math.pow(Math.abs(Math.cos(t*Math.PI*knots)),12):0;return r*(1+.55*Math.exp(-e*e*400)+.3*k);};
 return moulding(MOULD.round(8),pathFn,{wn,nu:nu||40,scale:rad});}

// ================================================================= HOUSES D/E/F
function buildHouses2(scene,gx,gz,d){reseed(9410+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 // SPACING. D, E and F sat at x=0, 60 and 130 on a row whose sites are 120
 // apart, so the intact House F stood in the rehabilitated House D. They now sit
 // at 25, 65 and 105 (the presets aim at 65); D moves by its own group and KOFF.
 const DX=25;
 // D — apse house (Arcosanti): concrete quarter-sphere open to +z, glass front wall
 {KOFF=[gx+DX,0,gz];const Dg=new THREE.Group();Dg.position.x=DX;G.add(Dg);REGISTER({name:'House D — apse house ('+STATE(d)+')',x:0,z:0,r:14,h:12});kput(SLABC(d),[0,.3,0],null,[12,.6,12],null);
  const R=9;mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:48,nv:16,hole:(u,y)=>Math.sin(u*TAU)>.05||(d>0&&fbm(u*6,y*.3,150,2)<.3)||(Math.hypot(u-.75,y/R-.5)<.07)}),CONC(d),Dg,0,.6,0);
  mesh(lathe({rFn:y=>R*.94*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:24,nv:8,hole:(u,y)=>Math.sin(u*TAU)>.05}),MAT.dark,Dg,0,.6,0);
  if(d===0)mesh(gridSurface((u,v)=>{const x=(u-.5)*R*1.9;const y=v*R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));return[x,.6+y,0];},20,6,{}),MAT.glass,Dg);
  for(let k=-3;k<=3;k++){const x=k*2.4;const h=R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));kput(d>0?'mullR':'mullW',[x,.6+h/2,0],null,[.6,h,.6],null);}
  // round 2: a bone roll along the apse's open edge, knuckled at five joints
  mesh(domMould(t=>[R*1.005*Math.cos(Math.PI*(1-t)),.6+R*1.005*Math.sin(Math.PI*(1-t)),0],[0,0,1],.42,4,48),CONC(d),Dg);
  kput('archOpen',[3,2.2,.1],qFacing([0,0,1]),[.35,.45,1],null);kput(SLABC(d),[3,.2,8],null,[2.5,.4,2.5],null);
  // ruin: teeth of the glass front left in the bays between the mullions (not the door bay)
  if(d>0)domShards([0,.6,0],qFacing([0,0,1]),[[-6,2.4],[-3.6,2.4],[-1.2,2.4],[1.2,2.4],[6,2.4]],x=>R*.95*Math.sqrt(clamp(1-Math.pow((Math.abs(x)+1.2)/R,2),0,1)),2.4,.5);
  // the transoms the teeth hang from (the front had mullions only, so a tooth
  // at a pane's head hung in mid-air)
  if(d>0)for(let j=1;j<4;j++){const y=j*2.4,w=1.9*R*Math.sqrt(clamp(1-Math.pow(y/(R*.95),2),0,1));kput('mullR',[0,.6+y,0],qEuler(0,0,Math.PI/2),[.4,w,.4],null);}
  kput(BOXC(d),[-7,1.6,3],null,[4,.5,5],null);for(let k=0;k<6;k++){const a=Math.PI+(k+.5)/6*Math.PI;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*4.5,5,Math.sin(a)*4.5],qEuler(0,-a,0),[2,1,1],lit?CYAN:DEAD);}if(d>0){mossOnRing(0,.7,0,9,14,1.2);vinesOnRing(0,7,0,5,6,6);}KOFF=[gx,0,gz];}
 // E — bridge house: a glass box spanning two concrete piers
 {const bx=65;REGISTER({name:'House E — bridge house ('+STATE(d)+')',x:bx,z:0,r:16,h:12});
  for(const s of [-1,1]){mesh(lathe({rFn:y=>2.6*Math.sqrt(1+1.2*Math.pow((y-4)/4,2)),H:8,nu:20,nv:6,hole:holeFn(d*.5,160+s,null,3)}),CONC(d),G,bx+s*9,0,0);}
  // In the ruin the span has failed west of the middle: the floor has broken
  // off the stub still sitting on the west pier and hinged down to the ground,
  // the roof over it has come down beside the house, and the glass box is only
  // the east half. It used to be the intact box with dark glass.
  if(d===0){kput(BOXC(d),[bx,8.3,0],null,[26,.7,8],null);kput(BOXC(d),[bx,12.2,0],null,[27,.7,9],null);}
  else{kput(BOXC(d),[bx+6.5,8.3,0],null,[13,.7,8],null);kput(BOXC(d),[bx+5.5,12.2,0],null,[16,.7,9],null);
   kput(BOXC(d),[bx-9.5,8.3,0],null,[7,.7,8],null);
   const L=Math.hypot(6.5,7.4),an=Math.atan2(7.4,6.5);kput(BOXC(d),[bx-2.75,4.6,.3],qEuler(0,.05,-an),[L,.7,8],null);
   kput(BOXC(d),[bx-8,.9,9],qEuler(.08,.35,-.12),[11,.7,8],null);}
  if(d===0){for(const s of [-1,1])kput('pane',[bx,10.2,s*4],null,[24,3.2,1],null);for(const s of [-1,1])kput('pane',[bx+s*12.5,10.2,0],qEuler(0,Math.PI/2,0),[8,3.2,1],null);}
  else{kput('boxD',[bx+6,10.2,0],null,[11,3,6],null);
   // what is left of the glass box: teeth in the east bays, front and back
   for(const s of [-1,1])domShards([bx+6,8.65,s*4.1],qFacing([0,0,s]),[[-3,5.6],[3,5.6]],()=>3.2,3.2,.6);}
  for(let k=-2;k<=2;k++){if(d>0&&k<0)continue;kput(d>0?'mullR':'mullW',[bx+k*6,10.2,4.1],null,[.5,3.4,.5],null);}
  // stair up the east pier, door at the top
  for(let k=0;k<8;k++){const a=Math.PI/2-(7-k)*.7;kput(BOXC(d),[bx+9+4.5*Math.cos(a),k*1.05+.5,4.5*Math.sin(a)],qEuler(0,-a,0),[3,.4,1.6],null);}kput(BOXC(d),[bx+9,8.7,4.6],null,[3,.4,1.6],null);kput('archOpen',[bx+9,9.9,4.3],qFacing([0,0,1]),[.3,.36,1],null);
  stripRing(bx,11.6,0,3,d,8);if(d>0){mossOnRing(bx,.3,0,10,10,1.2);vinesOnRing(bx+6,12.5,0,6,8,8);}}
 // F — terrace house: three stepped concrete trays into a slope, glass fronts, planters
 {const fx=105;REGISTER({name:'House F — terrace house ('+STATE(d)+')',x:fx,z:0,r:16,h:12});
  mesh(lathe({rFn:y=>16-1.4*y,H:9,nu:6,nv:2}),MAT.rock,G,fx,0,-8);
  for(let t=0;t<3;t++){const y=t*3.6,z=6-t*5,w=16-t*3;
   // in the ruin the top tray has gone: its roof slab has slumped onto the tray
   // below and only a stub of its back wall stands
   if(d>0&&t===2){kput(BOXC(d),[fx+1.5,y+.9,z+1.5],qEuler(.22,.25,.12),[w,.5,7],null);kput('brick',[fx-w/4,y+1,z-3.6],null,[w/2,2,.5],null);continue;}
   kput(BOXC(d),[fx,y+.3,z],null,[w,.6,9],null);kput(BOXC(d),[fx,y+3.4,z-1],null,[w+1,.5,8],null);
   if(d===0)kput('pane',[fx,y+1.9,z+3.8],null,[w-2,2.6,1],null);else{kput('boxD',[fx,y+1.9,z+1],null,[w-3,2.6,5],null);
    domShards([fx,y+.6,z+3.8],qFacing([0,0,1]),[[-(w/4-.75),w/2-2],[w/4-.75,w/2-2]],()=>2.6,2.6,.6);}
   for(let k=-1;k<=1;k++)kput(d>0?'mullR':'mullW',[fx+k*(w/2-1.5),y+1.9,z+3.9],null,[.5,2.8,.5],null);
   kput('brick',[fx,y+1.9,z-3.6],null,[w,2.8,.5],null);for(const s of [-1,1])kput('brick',[fx+s*(w/2-.25),y+1.9,z],null,[.5,2.8,8.4],null);kput(BOXC(d),[fx-w/2+1.5,y+3.9,z+3],null,[3,.8,2],null);
   for(let k=0;k<3;k++)kput('moss',[fx-w/2+1+k*.8,y+4.4,z+3],null,[1,.5,1],new THREE.Color().setHSL(.28,.5,.2));}
  kput('archOpen',[fx+4,1.9,10.6],qFacing([0,0,1]),[.3,.36,1],null);for(let k=0;k<4;k++)kput(BOXC(d),[fx-7,1.2+k*.9,9-k*1.4],null,[2,.3,1.4],null);
  stripRing(fx,3,6,4,d,8);if(d>0){mossOnRing(fx,.6,6,8,14,1.3);}}
 figures(45,14,4,4);KOFF=[0,0,0];return G;}

