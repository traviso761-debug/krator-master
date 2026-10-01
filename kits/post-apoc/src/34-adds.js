// ---------------------------------------------------------------- additions and recycled-material constructions
// Small builders for the things lashed onto a reclaimed core: sheet-metal lean-tos, tyre and bottle walls, plank rooms, decks, stairs, doors,
// windows, chimneys, solar panels, barrels, fences. All draw in the CURRENT frame; facing is +z unless a ry argument turns them.
// ---- openings, applied to a surface facing +z at (x,y,z): y is the sill / threshold
/* every door() call leaves an invisible record (world position, outward direction, size): place() picks the building's FRONT DOOR from them */
let DOORS_CUR=[];
function doorNote(x,y,z,w,h){const p=new THREE.Vector3(x,y,z+.03).applyMatrix4(CM);const dv=new THREE.Vector3(0,0,1).transformDirection(CM);DOORS_CUR.push({wx:p.x,wy:p.y,wz:p.z,dx:dv.x,dz:dv.z,w:w,h:h});}
/* an entrance with no leaf (an open container front or service counter, a gate gap in a fence, a roll-up door opening, a doorway with a curtain):
   draws nothing, leaves the same record as door(), so place() can pick it as the building's FRONT DOOR. Same frame: on a surface facing +z, y = threshold */
function entry(x,y,z,w,h){doorNote(x,y,z,w,h||2.0);}
function door(x,y,z,w,h,o){o=o||{};doorNote(x,y,z,w,h);const c=o.col===undefined?jc(pick([0x7a2e28,0x2f5f8f,0x3b7f6e,0x8a5a30,0xc99a2e,0x4d6f3c]),.06):jc(o.col,.05);const fr=jc(o.frame||0x4a3a2c,.05);
 const dk=c.clone().multiplyScalar(.7);   /* leaf in unweathered paint (plank would be rusted toward the wall colour), with inset panels and a dark surround so it reads as a door, not as more wall */
 box('plain',x,y,z+.03,w-.1,h-.05,.06,c);
 for(const py of [.1,.56])for(const sx of [-1,1])box('plain',x+sx*(w/4-.01),y+h*py+.06,z+.065,w/2-.16,h*.4,.02,dk);
 box('iron',x,y+h-.06,z+.06,w+.24,.14,.12,fr);for(const sx of [-1,1])box('iron',x+sx*(w/2+.04),y,z+.06,.14,h,.12,fr);
 box('iron',x+w/2-.16,y+h*.45,z+.08,.05,.05,.06,jc(0xb8a060,.05));if(o.step!==false)box('conc',x,y-.02,z+.28,w+.3,.06,.5,jc(0x8a8478,.05));}
function win(x,y,z,w,h,o){o=o||{};const fr=jc(o.frame||0x4a3a2c,.05);const lit=o.lit;
 box('iron',x,y-.06,z+.05,w+.2,.08,.16,fr);box('iron',x,y+h,z+.05,w+.2,.08,.12,fr);for(const sx of [-1,1])box('iron',x+sx*(w/2+.05),y,z+.05,.08,h,.1,fr);
 box(lit?'glow':'glass',x,y,z+.03,w,h,.04,lit?jc(0xf2c26a,.05):jc(pick(PAL.glass),.06));
 if(o.bars){for(let k=1;k<4;k++)box('iron',x-w/2+k*w/4,y,z+.09,.03,h,.03,jc(0x2a2826,.03));}
 else if(o.mullion!==false){box('iron',x,y,z+.08,.04,h,.04,fr);box('iron',x,y+h/2,z+.08,w,.04,.04,fr);}
 if(o.shutters){for(const sx of [-1,1])box('plank',x+sx*(w/2+.32),y,z+.08,.6,h,.05,jc(pick(PAL.wood),.06),sx*.25*(o.open||0));}}
function porthole(x,y,z,r,o){o=o||{};tire(x,y,z+.06,r+.06,.06,jc(0x4a4038,.05),0,PI/2,0);cylH('glass',x,y,z+.03,r,.05,jc(pick(PAL.glass),.06),'z',12);}
// ---- wall builders. ry turns them about (x,z). All are boxes of a recycled material.
// patchwork wall: planks with sheet-metal patches nailed over the gaps
function patchWall(x,y,z,w,h,ry,o){o=o||{};W(x,y,z,ry||0,()=>{box('plank',0,0,0,w,h,.1,o.col===undefined?P('wood'):jc(o.col,.05));
 const n=Math.max(1,Math.round(w*h/3.2));for(let k=0;k<n;k++){const pw=rr(.5,1.4),ph=rr(.4,1.1);const px=rr(-w/2+pw/2,w/2-pw/2),py=rr(0,Math.max(0,h-ph));box(pick(['sheet','corr','cont']),px,py,.07,pw,ph,.03,pick([P('galv'),P('rust'),P('paint')]),0,0,rr(-.06,.06));}});}
function plankWall(x,y,z,w,h,ry,o){o=o||{};W(x,y,z,ry||0,()=>{box('plank',0,0,0,w,h,o.th||.12,o.col===undefined?P('wood'):jc(o.col,.05));
 if(o.posts!==false){const n=Math.max(1,Math.round(w/2));for(let k=0;k<=n;k++)box('plank',-w/2+k*w/n,0,.02,.12,h,.16,jc(0x5c4630,.06));}});}
function sheetWall(x,y,z,w,h,ry,o){o=o||{};W(x,y,z,ry||0,()=>{const c=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);box(o.mat||'corr',0,0,0,w,h,o.th||.06,c);
 if(o.frame!==false){box('plank',0,0,-.05,w,.1,.06,jc(0x5c4630,.05));box('plank',0,h-.1,-.05,w,.1,.06,jc(0x5c4630,.05));}});}
function bottleWall(x,y,z,w,h,ry,o){o=o||{};W(x,y,z,ry||0,()=>{const th=o.th||.32;box('bottle',0,0,0,w,h,th,null);
 if(o.frame!==false){box('plank',0,0,th/2-.02,w+.2,.14,.14,jc(0x6a5238,.06));box('plank',0,h-.14,th/2-.02,w+.2,.14,.14,jc(0x6a5238,.06));for(const sx of [-1,1])box('plank',sx*(w/2+.02),0,th/2-.02,.14,h,.14,jc(0x6a5238,.06));}});}
// ---- tyre walls: tyres laid flat in running-bond courses, earth-packed. Real tori for the silhouette, a plastered earth core between them.
const TYR={R:.36,t:.12,H:.22};        // one tyre: 0.72 m across, 0.24 m tall
function tireWall(x0,z0,x1,z1,courses,o){o=o||{};const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.3)return;const d=TYR.R*2*.98;const y0=o.y||0;
 const ry=Math.atan2(-dz,dx);W((x0+x1)/2,y0,(z0+z1)/2,ry,()=>{box('earth',0,0,0,L,courses*TYR.H,d*.62,jc(0xb0a088,.05));
  for(let c=0;c<courses;c++){for(let x=-L/2+d/2+(c%2)*d/2;x<=L/2-d/2+1e-6;x+=d)tire(x+rr(-.02,.02),c*TYR.H+.12,rr(-.02,.02),TYR.R,TYR.t,undefined,rng()*TAU);}
  if(o.cap!==false)box('earth',0,courses*TYR.H,0,L,.06,d*.9,jc(0xa89880,.05));});}
// circular tyre wall (hut, well, planter): centre, radius, courses, arc a0..a1 (default the whole ring; give an arc to leave a doorway)
function tireRing(cx,cz,R,courses,a0,a1,o){o=o||{};a0=a0===undefined?0:a0;a1=a1===undefined?TAU:a1;const full=a1-a0>=TAU-.01;const d=TYR.R*2*.98;const n=Math.max(3,Math.round((a1-a0)*R/d));const step=(a1-a0)/n;
 for(let c=0;c<courses;c++){const half=(c%2)?.5:0;for(let k=0;k<n;k++){const a=a0+(k+(full?half:.5+half*.99))*step;if(a>a1)continue;tire(cx+Math.cos(a)*R,c*TYR.H+.12,cz+Math.sin(a)*R,TYR.R,TYR.t,undefined,rng()*TAU);}}
 sector('earth',cx,cz,R-.24,R+.24,a0,a1,0,courses*TYR.H,jc(0xb0a088,.05));}
// ---- roofs and shades
// gable roof of corrugated/sheet panels over a w x d footprint centred at (x,z), eave height y, rise, along x ridge. Returns the ridge height.
function gableRoof(x,y,z,w,d,rise,o){o=o||{};const ov=o.ov===undefined?.4:o.ov,m=o.mat||'corr';const c1=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);const c2=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):c1;
 const hw=w/2+ov,hd=d/2+ov*.7;roofP(m,x-hw,x+hw,z+hd,y,z,y+rise,.07,c1);roofP(m,x-hw,x+hw,z-hd,y,z,y+rise,.07,c2);
 if(o.gables!==false){for(const sx of [-1,1]){poly('plank',[[x+sx*(w/2),y,z-d/2],[x+sx*(w/2),y,z+d/2],[x+sx*(w/2),y+rise*(d/2)/(d/2+ov*.7),z]].map((p,i)=>p),jc(pick(PAL.wood),.06),true);}}
 box('iron',x,y+rise-.02,z,w+ov*2,.1,.16,jc(0x5a4a3c,.05));return y+rise;}
// single-slope lean-to roof: from the wall (high, at z=zw) sloping out to z=zw+out, low edge yLow, high edge yHigh. w wide centred at x.
function leanRoof(x,zw,w,out,yHigh,yLow,o){o=o||{};const c=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);roofP(o.mat||'corr',x-w/2,x+w/2,zw+out,yLow,zw,yHigh,.06,c);
 if(o.posts!==false){const n=Math.max(2,Math.round(w/2.6)+1);for(let k=0;k<n;k++){const px=x-w/2+.1+k*(w-.2)/(n-1);beam('wood',[px,0,zw+out-.1],[px,yLow,zw+out-.1],.11,jc(0x5c4630,.06));}
  beam('wood',[x-w/2,yLow-.02,zw+out],[x+w/2,yLow-.02,zw+out],.1,jc(0x5c4630,.06));}}
// a tarp or sheet stretched over poles at a slope: centre (x,y,z), w across x, d deep toward +z, drop toward the front
function tarp(x,y,z,w,d,drop,col,o){o=o||{};const c=col===undefined?P('tarp'):(typeof col==='number'?jc(col,.05):col);
 withCloth(clothTarp(x,z,w,d),()=>plane4('cloth',[x-w/2,y,z],[x+w/2,y,z],[x-w/2,y-drop,z+d],[x+w/2,y-drop,z+d],.02,c));   /* flutters: 93-anim.js */
 if(o.poles!==false){for(const sx of [-1,1])beam('wood',[x+sx*w/2,y-drop-.4,z+d],[x+sx*w/2,y-drop+.05,z+d],.07,jc(0x5c4630,.06),true,6);}}
// ---- platforms, stairs, ladders, rails
function deck(x,y,z,w,d,o){o=o||{};const th=.12;box('plank',x,y-th,z,w,th,d,o.col===undefined?P('wood'):jc(o.col,.05));
 if(y>.5&&o.posts!==false){for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[x+sx*(w/2-.15),0,z+sz*(d/2-.15)],[x+sx*(w/2-.15),y-th,z+sz*(d/2-.15)],.13,jc(0x5c4630,.06));}
 if(o.rail){const sides=o.rail;const h=1.0;const rc=jc(0x5c4630,.06);
  const seg=(a,b)=>{beam('wood',[a[0],y+h,a[1]],[b[0],y+h,b[1]],.06,rc);const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.max(1,Math.round(L/1.2));for(let k=0;k<=n;k++){const t=k/n;beam('wood',[a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,y+h,a[1]+(b[1]-a[1])*t],.05,rc,true,5);}};
  const cs=[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];const names=['b','r','f','l'];
  for(let i=0;i<4;i++)if(sides.indexOf(names[i])>=0)seg(cs[i],cs[(i+1)%4]);}}
// stair from a foot point to a top point (x,y,z each), width w: treads on two stringers
function stairs(ax,ay,az,bx,by,bz,w,o){o=o||{};if(o.steel)return stStairs(ax,ay,az,bx,by,bz,w,o);   // steel: stStairs() below (o.steel keeps old call sites working)
 const dx=bx-ax,dz=bz-az,dy=by-ay;const run=Math.hypot(dx,dz);const n=Math.max(2,Math.round(dy/.2));const ang=Math.atan2(dx,dz);
 const wc=jc(0x5c4630,.06),ic=jc(0x4a4038,.05);
 W(ax,ay,az,ang,()=>{const nx=[-w/2,w/2];
  {for(const sx of nx)beam('iron',[sx,0,0],[sx,dy,run],.07,ic);
   for(let k=1;k<=n;k++){box('plank',0,dy*k/n-.05,run*(k-.5)/n,w,.05,run/n+.04,jc(pick(PAL.wood),.07));}
   if(o.rail!==false)for(const sx of nx){beam('wood',[sx,1.0,0],[sx,dy+1.0,run],.05,wc);beam('wood',[sx,0,0],[sx,1.0,0],.05,wc,true,5);beam('wood',[sx,dy,run],[sx,dy+1.0,run],.05,wc,true,5);}}});}
// ---- STEEL access: stairs, landings and pipe railings for container and steel builds (stacks, tank towers, catwalks). Same frames and heights as
//      stairs()/deck(): a flight from a foot point to a top point ends with its top tread level with, and against the edge of, a landing whose top is y.
//      Materials: 'iron' (heavy rust weathering) for the frame, stringers, grating and rails; 'steel' (light weathering) for checker-plate treads.
const STC={frame:0x4a4038,grate:0x5a5550,rail:0x5a524a,plate:0x8a8680};
// floor panel, TOP at y, centred (x,z), w along x, d along z. o.floor: 'grate' (default: bearing bars along the long side, cross rods, edge frame) or 'plate' (checker plate)
function stFloor(x,y,z,w,d,o){o=o||{};const fc=jc(STC.frame,.05);
 if(o.floor==='plate'){box('steel',x,y-.04,z,w,.04,d,jc(STC.plate,.06));return;}
 const gc=jc(STC.grate,.06),alongX=w>=d,L=alongX?w:d,S=alongX?d:w,nb=Math.max(2,Math.round(S/.12)),nr=Math.max(1,Math.round(L/.6));
 for(let k=0;k<=nb;k++){const t=-S/2+.03+k*(S-.06)/nb;if(alongX)box('iron',x,y-.045,z+t,L-.04,.045,.022,gc);else box('iron',x+t,y-.045,z,.022,.045,L-.04,gc);}
 for(let k=1;k<nr;k++){const t=-L/2+k*L/nr;if(alongX)box('iron',x+t,y-.03,z,.014,.014,S-.04,gc);else box('iron',x,y-.03,z+t,S-.04,.014,.014,gc);}
 for(const s of [-1,1]){box('iron',x,y-.06,z+s*(d/2-.025),w,.06,.05,fc);box('iron',x+s*(w/2-.025),y-.06,z,.05,.06,d-.1,fc);}}
// pipe handrail along a->b ([x,z] pairs) standing on a floor at y: round posts every ~1.4 m, top rail at h (1.0), knee rail, toe plate
function stRail(a,b,y,o){o=o||{};const h=o.h||1.0,c=o.col===undefined?jc(STC.rail,.05):jc(o.col,.05);const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.1)return;const n=Math.max(1,Math.round(L/1.4));
 for(let k=0;k<=n;k++){const t=k/n;beam('iron',[a[0]+dx*t,y,a[1]+dz*t],[a[0]+dx*t,y+h,a[1]+dz*t],.045,c,true,6);}
 beam('iron',[a[0],y+h,a[1]],[b[0],y+h,b[1]],.05,c,true,6);beam('iron',[a[0],y+h*.5,a[1]],[b[0],y+h*.5,b[1]],.032,c,true,5);
 if(o.toe!==false)W((a[0]+b[0])/2,y,(a[1]+b[1])/2,Math.atan2(-dz,dx),()=>box('iron',0,0,0,L,.1,.012,c));}
// landing / balcony: deck() with a steel floor (o.floor), a channel frame under the edge, square-tube posts to the ground when y>.5 (o.posts:false for
// wall-bracketed ones), pipe rails on the named sides (o.rail: 'b','r','f','l' = -z, +x, +z, -x)
function stLanding(x,y,z,w,d,o){o=o||{};const fc=jc(STC.frame,.05);stFloor(x,y,z,w,d,o);
 for(const s of [-1,1]){box('iron',x,y-.2,z+s*(d/2-.05),w,.14,.1,fc);box('iron',x+s*(w/2-.05),y-.2,z,.1,.14,d-.2,fc);}
 if(y>.5&&o.posts!==false){for(const sx of [-1,1])for(const sz of [-1,1]){const px=x+sx*(w/2-.1),pz=z+sz*(d/2-.1);beam('iron',[px,0,pz],[px,y-.2,pz],.11,fc);box('iron',px,0,pz,.26,.03,.26,fc);}}
 if(o.rail){const cs=[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]],names=['b','r','f','l'];
  for(let i=0;i<4;i++)if(o.rail.indexOf(names[i])>=0)stRail(cs[i],cs[(i+1)%4],y,{h:o.h});}}
// steel stair, foot (ax,ay,az) -> top (bx,by,bz), width w: channel stringers (web + flanges), checker-plate treads with a nosing angle (o.tread:'grate' for
// open grating), pipe handrails with posts (o.rail:false drops them). The top tread's top is at by and its back edge at the top point.
function stStairs(ax,ay,az,bx,by,bz,w,o){o=o||{};const dx=bx-ax,dz=bz-az,dy=by-ay;const run=Math.hypot(dx,dz);const n=Math.max(2,Math.round(dy/.2));const ang=Math.atan2(dx,dz);
 const fc=jc(STC.frame,.05),rc=jc(STC.rail,.05),tc=jc(o.tread==='grate'?STC.grate:STC.plate,.06),td=run/n;
 W(ax,ay,az,ang,()=>{
  for(const sx of [-w/2-.035,w/2+.035]){plane4('iron',[sx,-.16,0],[sx,dy-.16,run],[sx,.08,0],[sx,dy+.08,run],.025,fc);
   for(const sy of [-.16,.08])beam('iron',[sx,sy,0],[sx,dy+sy,run],.05,fc);}
  for(let k=1;k<=n;k++){const y=dy*k/n,z=td*(k-.5);
   if(o.tread==='grate'){for(let q=0;q<5;q++)box('iron',0,y-.04,z-td/2+.02+q*(td-.04)/4,w,.04,.018,tc);for(const sx of [-1,1])box('iron',sx*(w/2-.02),y-.05,z,.04,.05,td,fc);}
   else box('steel',0,y-.035,z,w,.035,td+.02,tc);
   box('iron',0,y-.07,z-td/2+.02,w,.07,.04,fc);}
  if(o.rail!==false)for(const s of [-1,1]){const xs=s*(w/2+.09);beam('iron',[xs,1.0,0],[xs,dy+1.0,run],.045,rc,true,6);beam('iron',[xs,.5,0],[xs,dy+.5,run],.03,rc,true,5);
   const np=Math.max(2,Math.round(run/1.4)+1);for(let k=0;k<np;k++){const t=k/(np-1);beam('iron',[xs,dy*t,run*t],[xs,dy*t+1.0,run*t],.045,rc,true,6);}}});}
function ladder(x,y,z,h,ry,o){o=o||{};W(x,y,z,ry||0,()=>{const c=jc(0x5a5048,.05);beam('iron',[-.22,0,0],[-.22,h,0],.05,c);beam('iron',[.22,0,0],[.22,h,0],.05,c);for(let k=1;k*.32<h;k++)beam('iron',[-.22,k*.32,0],[.22,k*.32,0],.035,c,true,5);});}
// ---- roof and yard furniture
function stovepipe(x,y,z,h,o){o=o||{};const r=o.r||.09;const c=jc(pick([0x4a4038,0x5a4a3c,0x6a5a4c]),.05);cyl('iron',x,y,z,r,h,c,8);cyl('iron',x,y+h,z,r*1.5,.06,c,8);cone('iron',x,y+h+.06,z,r*2.2,.16,jc(0x3a3430,.05),8);smokeAt(x,y+h+.3,z,{r:r*2.4,kind:'stove'});
}
function solar(x,y,z,w,d,ry,tilt,o){o=o||{};W(x,y,z,ry||0,()=>{const t=tilt===undefined?.5:tilt;plane4('glass',[-w/2,0,-d/2*Math.cos(t)],[w/2,0,-d/2*Math.cos(t)],[-w/2,d*Math.sin(t),d/2*Math.cos(t)],[w/2,d*Math.sin(t),d/2*Math.cos(t)],.05,jc(0x1a2a4a,.05));
  beam('iron',[-w/2,0,-d/2*Math.cos(t)],[w/2,0,-d/2*Math.cos(t)],.05,jc(0x8a8a86,.05));const n=Math.round(w/1.6);for(let k=0;k<=n;k++){const px=-w/2+k*w/n;beam('iron',[px,-.05,-d/2*Math.cos(t)],[px,d*Math.sin(t),d/2*Math.cos(t)],.05,jc(0x8a8a86,.04));}
  for(const sx of [-1,1])beam('iron',[sx*w/2*.8,-y,d/4],[sx*w/2*.8,d*Math.sin(t)*.6,d/4*.4],.06,jc(0x4a4038,.05));});}
// YARD FURNITURE: master-catalog pieces placed through FURNISH (91f-furnish.js), not drawn here. Each helper keeps its name and
// arguments, so no builder changed, and still draws the random numbers its old drawing drew (rngSkip), so the structure a builder
// draws after it keeps its random stream (colours, patches, jitter). Keys: the pieces harvested from this kit (catalog scrap file).
function rngSkip(n){for(let i=0;i<n;i++)rng();}
function barrel(x,y,z,col,o){o=o||{};rngSkip(col===undefined?9:typeof col==='number'?8:6);return FURNISH('pa_drum',x,y,z,0,{v:o.open?1:0});}
function crate(x,y,z,s,ry,col){s=s||.6;rngSkip(col===undefined?5:4);return FURNISH('pa_crate',x,y,z,ry||0,{v:s>.7?1:0});}   /* the catalog's crates: 0.6 and 0.8 m */
function sacks(x,y,z,n,ry){rngSkip(4*n);return FURNISH('pa_sacks',x,y,z,ry||0,{v:n>3?1:0});}
function pallet(x,y,z,w,d,ry){rngSkip(3);return FURNISH('pa_pallet_load',x,y,z,ry||0,{v:0});}
/* a lamp post: the catalog's (3.2 or 3.8 m, arm toward +x, turned for a negative o.arm). A lamp under 2 m is a bracket light fixed to a
   structure (a mast, a crane deck, a lookout rail), not a post: it stays drawn here */
function lamp(x,y,z,h,o){o=o||{};h=h||3.2;if(h>=2){rngSkip(8);return FURNISH('pa_lamp_post',x,y,z,(o.arm||.35)<0?PI:0,{v:h>=3.5?1:0,ax:-.23});}
 beam('iron',[x,y,z],[x,y+h,z],.05,jc(0x4a4038,.05),true,6);beam('iron',[x,y+h,z],[x+(o.arm||.35),y+h-.05,z],.04,jc(0x4a4038,.05),true,5);cone('iron',x+(o.arm||.35),y+h-.3,z,.16,.2,jc(0x5a4a3c,.05),8);sph('glow',x+(o.arm||.35),y+h-.34,z,.09,jc(0xffd890,.03));}
/* a camp fire (the catalog's, r 0.5): the smoke stays the kit's (93-anim.js) */
function fire(x,y,z,r){r=r||.5;rngSkip(41);FURNISH('pa_camp_fire',x,y,z,0,{v:0});smokeAt(x,y+r*1.6,z,{r:r*.9,kind:'fire'});}
/* a stack of loose tyres (2, 3 or 5 in the catalog). o.fixed: tyres that carry something (a tank's cradle) are structure and stay drawn */
function tireStack(x,z,n,o){o=o||{};if(o.fixed){for(let k=0;k<n;k++)tire(x+rr(-.03,.03),.12+k*.24,z+rr(-.03,.03),o.R||TYR.R,o.t||TYR.t,undefined,rng()*TAU);return null;}
 rngSkip(3*n);return FURNISH('pa_tyre_stack',x,o.y||0,z,0,{v:n<=2?0:n===3?1:2});}
/* a junk pile (the catalog's small r 1.0 or large r 1.4); the skip replays the old draw: three numbers per item, then what its kind drew */
function junkPile(x,z,r,n,o){o=o||{};for(let k=0;k<n;k++){rng();rng();const t=rng();rngSkip(t<.3?13:t<.5?8:t<.65?3:t<.8?7:t<.9?9:8);}
 return FURNISH('pa_junk_pile',x,o.y||0,z,0,{v:r>=1.3?1:0});}
function antenna(x,y,z,h){beam('iron',[x,y,z],[x,y+h,z],.03,jc(0x8a8a86,.05),true,5);for(let k=1;k<4;k++)beam('iron',[x-.5+k*.05,y+h*(.35+k*.14),z],[x+.5-k*.05,y+h*(.35+k*.14),z],.02,jc(0x8a8a86,.05),true,4);}
function fenceRun(x0,z0,x1,z1,h,o){o=o||{};h=h||1.6;const L=Math.hypot(x1-x0,z1-z0);if(L<.2)return;const n=Math.max(1,Math.round(L/2.4));const ang=Math.atan2(-(z1-z0),x1-x0);
 for(let k=0;k<=n;k++){const t=k/n;const px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;beam('wood',[px,0,pz],[px,h+.15,pz],.09,jc(0x5c4630,.06),true,6);}
 const mx=(x0+x1)/2,mz=(z0+z1)/2;if(o.type==='pickets'){for(let k=0;k<Math.round(L/.2);k++){const t=(k+.5)/Math.round(L/.2);box('plank',x0+(x1-x0)*t,0,z0+(z1-z0)*t,.14,h*rr(.85,1),.03,P('wood'),ang);}}
 else if(o.type==='sheet'){W(mx,0,mz,ang,()=>{box('corr',0,.1,0,L,h-.1,.05,pick([P('galv'),P('rust'),P('paint')]));});}
 else{W(mx,0,mz,ang,()=>{quad('chain',0,h/2,0,L,h,jc(0xb4b8b8,.05));box('iron',0,h,0,L,.04,.04,jc(0x8a8a86,.05));});
  if(o.barbed){W(mx,0,mz,ang,()=>{for(let k=0;k<3;k++)box('iron',0,h+.1+k*.1,0,L,.012,.012,jc(0x3a3430,.05));});}}}
// a bottle hung on a string / a string of bottles and cans (wind chimes, shaman trappings)
function bottleString(a,b,n,o){o=o||{};for(let k=0;k<n;k++){const t=(k+.5)/n;const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*PI)*.25,z=a[2]+(b[2]-a[2])*t;const len=rr(.25,.6);
 beam('plain',[x,y,z],[x,y-len,z],.006,jc(0x6a5a44,.05),true,3);const cl=pick([0x3f9a52,0xc98a2a,0x2f62b8,0xd5ecea,0xa04a2a]);cyl('glass',x,y-len-.26,z,.05,.24,jc(cl,.05),6);cyl('glass',x,y-len-.02,z,.02,.1,jc(cl,.05),6);}
 beam('plain',a,[(a[0]+b[0])/2,(a[1]+b[1])/2-.25,(a[2]+b[2])/2],.008,jc(0x6a5a44,.05),true,3);beam('plain',[(a[0]+b[0])/2,(a[1]+b[1])/2-.25,(a[2]+b[2])/2],b,.008,jc(0x6a5a44,.05),true,3);}
// water butt on stilts: a small tank + legs + downpipe
/* the catalog's (tank on a 1.4 or a 1.1 m stand), standing on the ground (or on o.base: a deck); y was the old stand's height */
function waterButt(x,y,z,r,h,o){o=o||{};rngSkip(o.col===undefined?15:14);return FURNISH('pa_water_butt',x,o.base||0,z,0,{v:y<1.25?1:0});}

// ---------------------------------------------------------------- PLACEHOLDER FLORA
// Buildings never model plants as part of themselves (README rule: a plant is its own tagged object, placed). Anything green a building wants
// (crop rows, planter fill, a kitchen garden, a shrub by the door, moss, vines, a shade tree) is a call to plant(kind, x,y,z, opts). The default
// draws a low-poly PLACEHOLDER; the host swaps in real biome flora by setting PLANTS.draw = function(slot){ plantFrame(slot,()=>{...}) } and every
// plant in every building follows, with no building edited. window._api.plants() lists the slots for a swap or an audit.
//   kind (the ROLE, the biome picks the species): 'crop' (one crop plant, o.h tall) 'crop-tall' (corn/sunflower class, o.h) 'crop-vine' (beans/vines up a support, o.h)
//        'groundcover' (a mat filling a planter or bed, o.r radius) 'shrub' (o.r) 'flower' (o.r) 'tree' (o.h, o.r crown) 'vine-wall' (climber on a wall, o.h) 'grass' (tuft) 'moss'
//   opts: s (scale), h, r, ry, moisture 'arid'|'mild'|'wet' (what it needs), riparian (bool), cultivated (default true), tags {..}
const PLANTS={list:[],draw:null};
function plantsReset(){PLANTS.list.length=0;}
function plantFrame(slot,fn){const keep=CMS.slice();CMS.length=0;CMS.push(slot.m.clone());CM=CMS[0];try{fn();}finally{CMS.length=0;for(const m of keep)CMS.push(m);CM=CMS[CMS.length-1];}}
const PLANT_PH=[0x5a7a3c,0x6a8a44,0x4e6e38];   // placeholder greens: muted, one family, obviously stand-ins
function plantPlaceholder(sl){const c=jc(pick(PLANT_PH),.08),h=sl.h||1,r=sl.r||.3,k=sl.kind;
 if(k==='crop')sph('plain',0,.2*sl.s,0,(r||.2)*sl.s,c,.75);
 else if(k==='crop-tall'){beam('plain',[0,0,0],[0,h,0],.05*sl.s,jc(0x7a9a3c,.06),true,5);sph('plain',0,h*.85,0,.2*sl.s,c,1.4);}
 else if(k==='crop-vine'){beam('plain',[0,0,0],[0,h*.9,0],.03*sl.s,c,true,4);sph('plain',0,h*.6,0,.16*sl.s,c,1.6);}
 else if(k==='groundcover'){sph('plain',0,0,0,r*sl.s,c,.35);}
 else if(k==='shrub'||k==='flower'){sph('plain',0,r*.6*sl.s,0,r*sl.s,c,.8);}
 else if(k==='tree'){cyl('wood',0,0,0,.14*sl.s,h*.55,jc(0x6a5238,.06),6);sph('plain',0,h*.55+r*.6,0,r,c,.9);}
 else if(k==='vine-wall'){box('plain',0,0,0,r*2,h,.08,c);}
 else if(k==='grass'||k==='moss'){cone('plain',0,0,0,(r||.15)*sl.s,(h||.3)*sl.s,c,5);}
 else sph('plain',0,.2,0,.2,c,1);}
function plant(kind,x,y,z,o){o=o||{};const sl={kind,key:CURKEY,m:CM.clone().multiply(TF(x,y,z,o.ry||0)),s:o.s||1,h:o.h||0,r:o.r||0,
 tags:Object.assign({class:'flora',role:kind,biome:'placeholder (swap for local flora)',moisture:o.moisture||'mild',riparian:!!o.riparian,cultivated:o.cultivated!==false},o.tags||{})};
 PLANTS.list.push(sl);
 // draw: the host's biome plant if one is installed, else the placeholder (both draw in the slot's own frame)
 plantFrame(sl,()=>{(PLANTS.draw||plantPlaceholder)(sl);});return sl;}

// ---------------------------------------------------------------- TYRE FURNITURE (stools, chairs, tables): stacked tyres, woven cord, timber frames
// After the reference photos: two tyres stacked make a seat with a lattice of cord over the hole; a chair adds a tyre standing on edge as the backrest
// (cord net inside it) in a timber frame with arms; a table is a tyre with a round wooden top. Cords stay in muted rope colours (ochre, olive, faded orange, dirty white).
// All draw in the current frame, facing +z, base on y; pass ry to turn them. o: {n: tyres in the seat stack, wood: hex, cord: hex}
const TYRE_CORDS=[0xa8892a,0x6a7a3a,0x9a5a2a,0xb8b0a0];
/* the catalog's tyre stool (two or three tyres), armchair and table (one or two tyres); the skips are the old draws (cord, tyre turns, colours) */
function tireStool(x,y,z,o){o=o||{};const n=o.n||2;rngSkip(n+4+(o.cord?0:1));return FURNISH('pa_tyre_stool',x,y,z,o.ry||0,{v:n>=3?1:0});}
function tireChair(x,y,z,ry,o){o=o||{};const n=o.n||2;rngSkip(n+6+(o.wood?2:3)+(o.cord?0:1));return FURNISH('pa_tyre_chair',x,y,z,ry||0);}
function tireTable(x,y,z,o){o=o||{};const n=o.n||1;rngSkip(2+n);return FURNISH('pa_tyre_table',x,y,z,0,{v:n>=2?1:0});}
