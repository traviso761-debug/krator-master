// prefix: cp
// ---------------------------------------------------------------- WALLED COMPOUND (infrastructure + civic). Gate faces +z. Declared w x d includes the walls.
// Walls of MIXED reclaimed segments (stacked containers, earth-filled tyre wall with timber cap + sheet fence, corrugated sheet on posts, wrecked-car bastions),
// an inner wall-walk gantry, a bulkhead-style container gate tower with two hinged leaves, four corner towers (silo, water tank on stilts, scaffold lookout,
// container tower). The interior takes buildings modularly: cpSlots(w,d) -> slot rectangles, cpFit(def,slot) -> yaw or null; o.slots = list of def keys.
defBuilding({key:'compound',name:'Walled compound',seed:5410,tags:{type:['infrastructure','civic'],size:'large',core:'shipping container',materials:['containers','earth-filled tyres','corrugated sheet','wrecked cars','timber','scaffold']},w:64,d:54,h:15,budget:240000,build:cpBuild});
function cpGeom(v){const Wc=v===1?44:64,Dc=v===1?38:54;return {v:v,w:Wc,d:Dc,xr:Wc/2-3.4,zb:-(Dc/2-3.4),zf:Dc/2-4.9};}
// ---- slots: rectangles inside the walls (world x,z of the centre; w along x, d along z; facing = yaw that turns a building's +z front toward the yard)
function cpSlots(w,d){const v=(w<50)?1:0;const S=[];const PIH=Math.PI/2;
 if(v===0){   // interior clear x +-26, z -21..19.5; yard x +-10, z -3.5..7.5; road x +-3.5 from the gate
  S.push({x:-15.25,z:-13,w:21.5,d:16,facing:0,name:'back-left'});
  S.push({x:15.25,z:-13,w:21.5,d:16,facing:0,name:'back-right'});
  S.push({x:-19,z:2.5,w:14,d:12,facing:PIH,name:'west'});
  S.push({x:19,z:2.5,w:14,d:12,facing:-PIH,name:'east'});
  S.push({x:-18.25,z:14.5,w:15.5,d:10,facing:Math.PI,name:'front-left'});
  S.push({x:16.5,z:14.5,w:19,d:10,facing:Math.PI,name:'front-right'});
  S.push({x:0,z:-16.5,w:8.5,d:9,facing:0,name:'back-mid'});
 }else{       // interior clear x +-16, z -13..11.5
  S.push({x:-8.25,z:-7,w:15.5,d:12,facing:0,name:'back-left'});
  S.push({x:8.25,z:-7,w:15.5,d:12,facing:0,name:'back-right'});
  S.push({x:10.75,z:5.75,w:10.5,d:11.5,facing:-PIH,name:'east'});
 }
 return S;}
// the yaw at which the def's declared footprint (w x d) fits the slot: try the slot's facing, then the other three quarter turns
function cpFit(def,slot){const f=slot.facing||0;const tries=[0,PI/2,-PI/2,PI];
 for(const t of tries){const swap=Math.abs(t)===PI/2;const bw=swap?def.d:def.w,bd=swap?def.w:def.d;if(bw<=slot.w+1e-6&&bd<=slot.d+1e-6)return f+t;}return null;}
// ---- small helpers
function cpTire(x,y,z,R,col,ry,rx,rz){if(!_G.cpTor){const g=new THREE.TorusGeometry(.67,.33,4,9);g.rotateX(PI/2);_G.cpTor=g;}
 const m=TF(x,y,z,ry,rx,rz);m.scale(new THREE.Vector3(R,R,R));emit('rubber',_G.cpTor,m,col===undefined?jc(0x252220,.05):col);}
function cpCol(){return rng()<.45?PAINT():jc(cpBright(),.05);}
function cpBright(){return pick([0xc45a30,0xd8a020,0x3b7f8e,0x4d6f3c,0x9a3a2c,0xd8d0c0,0x2f5f8f,0x8a6a3a]);}
function cpPole(x,y0,y1,z,r,col){beam('wood',[x,y0,z],[x,y1,z],r||.07,col||jc(0x5c4630,.06),true,6);}
// rail along a segment a->b (x,z pairs) at deck level y: posts, top and mid rails
function cpRail(a,b,y,h,col){h=h||1.05;col=col||jc(0x5c4630,.06);const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.1)return;const n=Math.max(1,Math.round(L/1.6));
 for(let k=0;k<=n;k++){const t=k/n;beam('wood',[a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,y+h,a[1]+(b[1]-a[1])*t],.045,col,true,5);}
 beam('wood',[a[0],y+h,a[1]],[b[0],y+h,b[1]],.05,col);beam('wood',[a[0],y+h*.5,a[1]],[b[0],y+h*.5,b[1]],.035,col);}
function cpRailBox(cx,y,cz,w,d,skip,h){const c=[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2],[cx+w/2,cz+d/2],[cx-w/2,cz+d/2]];for(let i=0;i<4;i++){if(skip&&skip.indexOf(i)>=0)continue;cpRail(c[i],c[(i+1)%4],y,h);}}
// spikes along a wall top (local x from -L/2..L/2 at depth z, top y), leaning outward (-z)
function cpSpikes(L,y,z,gap){gap=gap||.95;const n=Math.floor(L/gap);const c=jc(0x2e2a28,.05);for(let k=0;k<n;k++){const x=-L/2+(k+.5)*L/n;beam('iron',[x,y,z],[x+rr(-.06,.06),y+.55,z-.28],.028,c,true,4);}
 beam('iron',[-L/2,y+.28,z-.14],[L/2,y+.28,z-.14],.014,c);}
// a chain-link swag hung from the top on the outside
function cpChain(L,y,z,drop){quad('chain',0,y-drop/2,z,L,drop,jc(0xb4b8b8,.05));for(let k=0;k<Math.round(L/2.2);k++){const x=-L/2+.5+k*2.2;beam('iron',[x,y,z],[x,y-drop*rr(.8,1.1),z],.012,jc(0x6a6a66,.05),true,3);}}
// ---- a wrecked car (x long, front +x); base at y
function cpCar(x,y,z,ry,col,o){o=o||{};W(x,y,z,ry,()=>{if(o.flip)pushM(TF(0,0,0,0,PI,0));
 const dk=jc(0x2a2826,.03),c=col,c2=jc(col,.06),gl=jc(0x6a9a94,.06);
 box('iron',0,.3,0,4.2,.14,1.5,dk);                                                     // floor pan / chassis
 box('sheet',0,.38,0,4.3,.6,1.8,c);                                                    // lower body 0.38..0.98
 box('iron',2.17,.42,0,.14,.2,1.86,jc(0x8a8a86,.06));box('iron',-2.17,.42,0,.14,.2,1.86,jc(0x8a8a86,.06));   // bumpers
 box('sheet',1.6,.98,0,1.1,.07,1.7,c2,0,0,-.08);box('sheet',-1.65,.98,0,.8,.07,1.7,c2,0,0,.07);              // bonnet, boot
 for(const sz of [-1,1]){box('glow',2.14,.62,sz*.6,.06,.16,.3,jc(0xd8d0b0,.03));box('plain',-2.14,.62,sz*.6,.06,.14,.28,jc(0x9a2a20,.04));}
 // cabin: four pillars, roof, glass
 for(const sx of [-1,1])for(const sz of [-1,1])box('sheet',-.15+sx*1.1,.98,sz*.8,.08,.55,.08,c2);
 box('sheet',-.15,1.53,0,2.5,.06,1.74,c2);
 if(!o.noGlass){for(const sz of [-1,1])box('glass',-.15,1.06,sz*.82,2.1,.44,.03,gl);box('glass',1.0,1.06,0,.03,.44,1.5,gl,0,0,.5);box('glass',-1.25,1.06,0,.03,.44,1.5,gl,0,0,-.5);}
 // doors: seams and handles on both flanks; one door may hang open
 for(const sz of [-1,1]){const openHere=(o.open&&sz===o.open);
  for(const sx of [-.75,.45])box('iron',sx,.42,sz*.905,.03,.55,.02,dk);
  if(!openHere){box('iron',.3,.85,sz*.915,.16,.03,.03,jc(0x8a8a86,.05));}
  else W(.45,.4,sz*.9,sz*.95,()=>{box('sheet',-.6,0,0,1.2,.6,.05,c2);box('glass',-.6,.6,0,1.0,.4,.03,gl);});}
 // axles, wheels with hubs
 for(const wx of [-1.4,1.4]){beam('iron',[wx,.34,-.86],[wx,.34,.86],.05,dk,true,6);for(const sz of [-1,1]){if(o.noWheel&&o.noWheel[0]===wx&&o.noWheel[1]===sz){cyl('iron',wx,.0,sz*.86,.1,.04,jc(0x8a8a86,.05),8);continue;}
   cpTire(wx,.34,sz*.9,.34,undefined,0,PI/2,0);cylH('iron',wx,.34,sz*(.9+.09),.13,.05,jc(0x8a8a86,.05),'z',8);}}
 if(o.flip)popM();});}
// ---------------------------------------------------------------- wall segments. Frame: x along the wall (centred), z>0 = interior, wall occupies z in [-th,0]
const cpSeg={
 cont(L,s){const pcs=s.pcs;let x=-L/2;let i=0;for(const p of pcs){for(let k=0;k<2;k++){W(x+p/2+(k?rr(-.12,.12):0),k*CT.H,-CT.W/2,0,()=>container({len:p,doorEnd:false,col:cpCol()}));}
   if(i%2===0)door(x+p/2-p*.2,.16,0,.95,2.0,{step:false});
   for(let q=0;q<2;q++){const pw=rr(.8,1.6),ph=rr(.6,1.2);box(pick(['sheet','corr']),x+p/2+rr(-p/2+pw/2,p/2-pw/2),rr(.3,4.0),-CT.W-.02,pw,ph,.03,jc(cpBright(),.06),0,0,rr(-.05,.05));}
   x+=p;i++;}
  cpSpikes(L,CT.H*2,-CT.W+.25);if(rng()<.6)cpChain(L,CT.H*2,-CT.W-.03,1.5);
  ladder(-L/2+1.0,0,.05,CT.H*2,0);},
 tyre(L,s){const th=.9,C=10,ch=TYR.H;box('earth',0,0,-th/2,L,C*ch,th*.6,jc(0x9a7a58,.05));
  for(let c=0;c<C;c++){for(let x=-L/2+.36+(c%2)*.36;x<=L/2-.36+1e-6;x+=.72){const paint=rng()<.12;cpTire(x,c*ch+.12,-th/2+rr(-.03,.03),.36,paint?jc(cpBright(),.06):undefined,rng()*TAU);}}
  box('earth',0,C*ch,-th/2,L,.08,th*.92,jc(0xa89880,.05));box('wood',0,C*ch+.08,-th/2,L,.14,.55,jc(0x6a5238,.06));
  const y0=C*ch+.22,H=2.1;const n=Math.max(1,Math.ceil(L/2.4));
  for(let i=0;i<n;i++){const xm=-L/2+(i+.5)*L/n,pw=L/n-.05;const c1=pick([P('galv'),P('rust'),P('paint')]);box(pick(['corr','sheet']),xm,y0,-.28,pw,rr(1.0,1.3),.05,c1);box('corr',xm,y0+1.25,-.28,pw,H-1.25,.05,pick([P('galv'),P('paint'),P('rust')]));}
  for(let i=0;i<=n;i++){const x=-L/2+i*L/n;beam('wood',[x,y0-.2,-.22],[x,y0+H+.1,-.22],.08,jc(0x5c4630,.06),true,6);}
  box('plank',0,y0+.9,-.2,L,.09,.09,jc(0x5c4630,.06));box('plank',0,y0+H,-.2,L,.09,.12,jc(0x5c4630,.06));
  cpSpikes(L,y0+H+.1,-.3);},
 sheet(L,s){const n=Math.max(1,Math.ceil(L/2.4));const H=rr(4.3,4.7);
  for(let i=0;i<n;i++){const xm=-L/2+(i+.5)*L/n,pw=L/n-.04;const h1=rr(1.9,2.6);box(pick(['corr','corr','sheet']),xm,0,-.16,pw,h1,.05,pick([P('galv'),P('rust'),P('paint'),jc(cpBright(),.08)]),0,0,rr(-.012,.012));
   box('corr',xm+rr(-.05,.05),h1-.1,-.12,pw,H-h1+.1,.05,pick([P('galv'),P('paint'),P('rust')]));}
  for(let i=0;i<=n;i++){const x=-L/2+i*L/n;beam('wood',[x,0,-.02],[x,H+.15,-.02],.09,jc(0x5c4630,.06),true,6);if(i%2===1)beam('wood',[x,3.6,-.25],[x,0,-2.6],.07,jc(0x5c4630,.06));}
  for(const y of [.7,2.3,H-.1])box('plank',0,y,-.24,L,.1,.08,jc(0x5c4630,.06));
  cpSpikes(L,H+.15,-.18);if(rng()<.5)cpChain(L,H,-.26,1.3);},
 car(L,s){const n=Math.max(1,Math.floor(L/4.7));const step=L/n;const RT=1.56,FL=RT*2;
  const cols=()=>jc(pick([0x9a3a2c,0x3b7f8e,0xc99a2e,0x6a7a78,0xb8b0a0,0x2f5f8f,0xc45a30,0x4d6f3c]),.08);
  const pos0=[];for(let i=0;i<n;i++)pos0.push(-L/2+step*(i+.5));
  const pos1=n>1?pos0.slice(0,n-1).map((x)=>x+step/2):[pos0[0]+(step>5.2?.5:0)];
  const zc=-1.0;
  pos0.forEach((x,i)=>cpCar(x,0,zc+rr(-.05,.05),i%2?PI:0,cols(),{open:rng()<.5?(rng()<.5?1:-1):0,noGlass:rng()<.3,noWheel:rng()<.25?[pick([-1.4,1.4]),pick([-1,1])]:undefined}));
  pos1.forEach((x,i)=>{cpCar(x,FL,zc+rr(-.05,.05),i%2?0:PI,cols(),{flip:true,open:rng()<.4?1:0,noGlass:rng()<.5});
   cpCar(x+rr(-.08,.08),FL,zc+rr(-.05,.05),rng()<.5?0:PI,cols(),{open:rng()<.4?-1:0,noGlass:rng()<.5});});
  // chains lashing the stack and outward props
  for(const x of [-L/2+.6,L/2-.6]){beam('iron',[x,.3,-2.05],[x,4.3,-2.05],.02,jc(0x6a6a66,.05),true,3);beam('wood',[x,3.4,-1.9],[x,0,-3.2],.07,jc(0x5c4630,.06));}
  cpSpikes(L,FL+RT+.05,-1.6);}
};
const cpSegTop={cont:5.2,tyre:4.6,sheet:4.6,car:4.8};
function cpRun(x0,z0,x1,z1,spec){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,ry=Math.atan2(-uz,ux);let fixed=0,nf=0;
 for(const s of spec){if(s.pcs)s.len=s.pcs.reduce((a,c)=>a+c,0);if(s.len)fixed+=s.len;else nf++;}
 const flex=nf?(L-fixed)/nf:0;let p=0;for(const s of spec){const len=s.len||flex;const c=p+len/2;W(x0+ux*c,0,z0+uz*c,ry,()=>cpSeg[s.t](len,s));p+=len;}}
// wall-walk gantry along a run: deck 1.3 wide on the interior side at y, posts, rails, lamps; gaps = [[centre,width]] where the rail is left open
function cpGantry(x0,z0,x1,z1,y,gaps){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,ry=Math.atan2(-uz,ux);if(L<2)return;
 W(x0+ux*L/2,0,z0+uz*L/2,ry,()=>{box('plank',0,y-.12,.65,L,.12,1.3,jc(0x6a5a44,.06));box('iron',0,y-.3,.15,L,.18,.08,jc(0x4a4038,.05));box('iron',0,y-.3,1.15,L,.18,.08,jc(0x4a4038,.05));
  const n=Math.max(1,Math.round(L/3.2));for(let k=0;k<=n;k++){const x=-L/2+k*L/n;beam('wood',[x,0,1.2],[x,y-.12,1.2],.06,jc(0x5c4630,.06),true,6);beam('wood',[x,y-.8,1.2],[x,y-.12,.1],.05,jc(0x5c4630,.06));}
  // rail on the inner edge, broken where a stair meets it
  let a=-L/2;const g=(gaps||[]).map(q=>[(q[0]-x0)*ux+(q[1]-z0)*uz-L/2,q[2]]).sort((p,q)=>p[0]-q[0]);for(const q of g){const b=q[0]-q[1]/2;if(b>a)cpRail([a,1.25],[b,1.25],y,1.05);a=q[0]+q[1]/2;}if(L/2>a)cpRail([a,1.25],[L/2,1.25],y,1.05);
  for(let k=0;k<Math.floor(L/13);k++){lamp(-L/2+L/(Math.floor(L/13)+1)*(k+1),y,1.2,2.4,{arm:-.35});}});}
// stair beside a gantry: foot (fx,fz) -> top (tx,tz) at height y, with a small landing
function cpStair(fx,fz,tx,tz,y){stairs(fx,0,fz,tx,y,tz,1.0);}
// ---------------------------------------------------------------- the gate tower (container piers, hinged leaves, wall-walk deck, guard cabin)
function cpGate(G,o){const zf=G.zf,zc=zf+1.43,open=(o.v===1)?.06:.6;const wc=jc(0x5c4630,.06);
 for(const sx of [-1,1]){const px=sx*4.52;for(let k=0;k<2;k++)W(px,k*CT.H,zc,PI/2,()=>container({len:6.06,doorEnd:false,col:cpCol()}));
  box('iron',sx*3.28,0,zf+4.5,.16,5.2,.16,jc(0x3a3532,.04));box('iron',sx*3.28,0,zf-1.5,.16,5.2,.16,jc(0x3a3532,.04));
  ladder(sx*4.5,0,zf-1.66,CT.H*2+.9,0);
  // outer corner posts: flag pole
  cpPole(sx*5.55,0,10.3,zf+4.66,.07);box('iron',sx*5.55,.0,zf+4.6,.28,.4,.28,jc(0x5a4a3c,.05));
  sock('flag',sx*5.55,10.4,zf+4.66,0,{w:1.5,h:.7});sock('banner',sx*5.55,9.4,zf+4.78,0,{w:1.05,h:3.4});
  lamp(sx*7.1,0,zf+3.4,3.6,{arm:sx*-.35});}
 // hinged leaves: corrugated sheet in iron frames, braced, hung on the pier inner faces
 for(const sx of [-1,1]){const hx=sx*3.3,hz=zf+2.0;const ry=sx<0?-open:PI+open;W(hx,0,hz,ry,()=>{const lh=3.85,lw=3.16;
   box('corr',lw/2,.12,0,lw-.06,lh,.07,jc(pick([0x8a3a2c,0x3b7f6e,0xc99a2e,0x7a7a72]),.05));box('iron',lw/2,.06,0,lw,.14,.16,jc(0x3a3532,.04));box('iron',lw/2,lh+.02,0,lw,.14,.16,jc(0x3a3532,.04));
   box('iron',.06,.06,0,.14,lh+.1,.16,jc(0x3a3532,.04));box('iron',lw-.06,.06,0,.14,lh+.1,.16,jc(0x3a3532,.04));box('iron',lw/2,lh*.5,0,lw,.1,.14,jc(0x3a3532,.04));
   beam('iron',[.15,.25,.06],[lw-.15,lh-.1,.06],.06,jc(0x3a3532,.04));beam('iron',[.15,lh-.1,-.06],[lw-.15,.25,-.06],.06,jc(0x3a3532,.04));
   for(let k=0;k<3;k++)box('sheet',rr(.4,2.2),rr(.4,2.8),.05,rr(.6,1.1),rr(.5,.9),.03,pick([P('rust'),P('galv'),jc(cpBright(),.06)]));
   for(const y of [.6,3.2])cylH('iron',.02,y,0,.11,.3,jc(0x2a2826,.03),'z',8);
   if(sx<0)sock('paint',lw/2,2.0,.06,0,{w:2.6,h:3});else sock('paint',lw/2,2.0,-.06,PI,{w:2.6,h:3});});}
 // lintel + deck (wall-walk over the gate)
 box('sheet',0,3.95,zf+4.34,6.7,1.23,.14,jc(0x6a6a66,.04));box('iron',0,3.9,zf+4.3,6.8,.12,.3,jc(0x3a3532,.04));sock('emblem',0,4.55,zf+4.43,0,{w:.95,h:.95});
 box('iron',0,CT.H*2-.42,zc,11.6,.4,.3,jc(0x3a3532,.04));for(let k=0;k<6;k++)box('iron',-5.2+k*2.08,CT.H*2-.2,zc,.16,.2,6.0,jc(0x3a3532,.04));
 box('plank',0,CT.H*2,zc,11.9,.14,6.2,jc(0x6a5a44,.06));const dy=CT.H*2+.14;
 // guard cabin on the interior half, open walkway with a sheet parapet on the outer half
 const cx0=-3.4,cx1=3.4,cz0=zf-1.35,cz1=zf+1.3,ch=2.3;
 wallOpen('plank',0,dy,cz1,cx1-cx0,ch,.12,[{x0:-2.6,x1:2.6,y0:dy+.9,y1:dy+1.8}],jc(0x8a6a3a,.05));
 wallOpen('plank',0,dy,cz0,cx1-cx0,ch,.12,[{x0:-1.0,x1:1.0,y0:dy+.9,y1:dy+1.7}],jc(0x8a6a3a,.05));
 for(const sx of [-1,1])wallOpen('plank',sx*3.4,dy,(cz0+cz1)/2,cz1-cz0,ch,.12,[],jc(0x7a5a38,.05),sx*PI/2);
 box('glass',0,dy+.9,cz1+.05,5.2,.9,.03,jc(0x6a9a94,.06));
 roofP('corr',cx0-.4,cx1+.4,cz1+.9,dy+ch+.1,cz0-.3,dy+ch+.55,.07,pick([P('galv'),P('rust')]));
 for(const sx of [-1,1])beam('wood',[sx*3.6,dy,cz1+.85],[sx*3.6,dy+ch+.1,cz1+.85],.08,wc,true,6);
 sock('awning',0,dy+ch+.1,cz1+.05,0,{w:5.4,d:.9,drop:.35,h:2.05});
 // parapet: sheet panels with spikes on the outer face, rails on the other three
 box('corr',0,dy,zf+4.3,11.6,1.15,.06,jc(0x8a7a6a,.05));for(let k=0;k<7;k++)box('wood',-5.7+k*1.9,dy,zf+4.34,.1,1.3,.1,wc);
 W(0,0,0,0,()=>cpSpikes(11.6,dy+1.15,zf+4.34));
 cpRail([-5.85,zc+3.0],[-5.85,zf-1.55],dy);cpRail([5.85,zc+3.0],[5.85,zf-1.55],dy);cpRail([-5.85,zf-1.55],[-1.6,zf-1.55],dy);cpRail([1.6,zf-1.55],[5.85,zf-1.55],dy);
 // searchlight on the cabin roof
 cylH('iron',2.6,dy+ch+.75,zf-.2,.24,.5,jc(0x3a3430,.05),'z',10);sph('glow',2.6,dy+ch+.75,zf+.08,.16,jc(0xfff2c0,.03));beam('iron',[2.6,dy+ch+.4,zf-.2],[2.6,dy+ch+.6,zf-.2],.05,jc(0x3a3430,.05),true,5);}
// ---------------------------------------------------------------- corner towers. Each returns nothing; all sockets declared (banner, flag, emblem)
// local frame: +z faces the compound centre (silo, tank: round). ry given per tower.
function cpTowerSilo(){const r=2.55,h=8.0;silo({r:r,h:h,roofCol:0x3b7f8e});
 W(0,0,r+.02,0,()=>{door(0,.45,0,1.0,2.0,{step:true});});
 for(const [a,y] of [[.9,3.0],[-.9,3.0],[.9,5.2]])W(Math.sin(a)*(r+.02),0,Math.cos(a)*(r+.02),a,()=>{win(0,y,0,.8,.8,{bars:true});});
 // gallery ring at y=6.3 with rails, brackets, ladder
 const gy=6.3;sector('plank',0,0,r+.02,r+1.15,0,TAU,gy-.14,gy,jc(0x6a5a44,.06),24);
 for(let k=0;k<12;k++){const a=k/12*TAU;beam('iron',[Math.cos(a)*(r+.02),gy-1.5,Math.sin(a)*(r+.02)],[Math.cos(a)*(r+1.1),gy-.14,Math.sin(a)*(r+1.1)],.05,jc(0x4a4038,.05));
  beam('wood',[Math.cos(a)*(r+1.08),gy,Math.sin(a)*(r+1.08)],[Math.cos(a)*(r+1.08),gy+1.05,Math.sin(a)*(r+1.08)],.045,jc(0x5c4630,.06),true,5);}
 sector('wood',0,0,r+1.04,r+1.12,0,TAU,gy+1.0,gy+1.08,jc(0x5c4630,.06),24);sector('wood',0,0,r+1.05,r+1.11,0,TAU,gy+.5,gy+.55,jc(0x5c4630,.06),24);
 const la=PI*.62;ladder(Math.cos(la)*(r+.06),0,Math.sin(la)*(r+.06),gy+1.0,PI/2-la);
 // searchlight and tyre bank at the foot, barrels
 const sa=-PI/2;cylH('iron',Math.cos(sa)*(r+.9),gy+1.3,Math.sin(sa)*(r+.9),.22,.5,jc(0x3a3430,.05),'z',10);sph('glow',Math.cos(sa)*(r+.9),gy+1.3,Math.sin(sa)*(r+.9)-.28,.15,jc(0xfff2c0,.03));
 beam('iron',[Math.cos(sa)*(r+.9),gy,Math.sin(sa)*(r+.9)],[Math.cos(sa)*(r+.9),gy+1.1,Math.sin(sa)*(r+.9)],.05,jc(0x3a3430,.05),true,5);
 tireRing(0,0,r+.85,3,.3,1.4);barrel(-1.4,0,r+.5);barrel(-1.9,0,r+.2);
 const apex=h+r*.42+.5;sock('flag',0,apex+.15,0,0,{w:1.5,h:.7});
 sock('banner',Math.cos(PI/2)*(r+1.1),gy+1.05,Math.sin(PI/2)*(r+1.1)+.05,0,{w:1.0,h:1.9});
 sock('emblem',Math.sin(-.55)*(r+.03),4.3,Math.cos(-.55)*(r+.03),-.55,{w:1.1,h:1.1});}
function cpTowerTank(){const r=2.2,y0=6.4;const lc=jc(0x4a4038,.05);
 const R=(y)=>2.75-.65*(y/y0);
 for(let k=0;k<6;k++){const a=k/6*TAU+PI/6;beam('iron',[Math.cos(a)*2.75,0,Math.sin(a)*2.75],[Math.cos(a)*2.1,y0-.2,Math.sin(a)*2.1],.11,lc,true,6);box('conc',Math.cos(a)*2.75,0,Math.sin(a)*2.75,.5,.3,.5,jc(0x8a8880,.05));}
 for(const y of [1.6,3.6,5.5])for(let k=0;k<6;k++){const a=k/6*TAU+PI/6,b=(k+1)/6*TAU+PI/6;const ra=R(y);beam('iron',[Math.cos(a)*ra,y,Math.sin(a)*ra],[Math.cos(b)*ra,y,Math.sin(b)*ra],.05,lc);}
 for(const [ya,yb] of [[.2,3.6],[3.6,5.6]])for(let k=0;k<6;k++){const a=k/6*TAU+PI/6,b=(k+1)/6*TAU+PI/6;beam('iron',[Math.cos(a)*R(ya),ya,Math.sin(a)*R(ya)],[Math.cos(b)*R(yb),yb,Math.sin(b)*R(yb)],.03,jc(0x5a5048,.05),true,4);}
 cyl('plank',0,y0-.2,0,3.05,.2,jc(0x6a5a44,.06),18);
 W(0,y0,0,0,()=>tankV({r:r,h:3.0,col:pick([0x6a7a78,0x3a6a8a,0x9a6a3a])}));
 for(let k=0;k<12;k++){const a=k/12*TAU;beam('wood',[Math.cos(a)*2.95,y0,Math.sin(a)*2.95],[Math.cos(a)*2.95,y0+1.05,Math.sin(a)*2.95],.045,jc(0x5c4630,.06),true,5);}
 sector('wood',0,0,2.91,2.99,0,TAU,y0+1.0,y0+1.08,jc(0x5c4630,.06),24);sector('wood',0,0,2.92,2.98,0,TAU,y0+.5,y0+.55,jc(0x5c4630,.06),24);
 const la=PI*.4;ladder(Math.cos(la)*(R(3)+.08),0,Math.sin(la)*(R(3)+.08),y0+1.0,PI/2-la);
 pipe('iron',[[2.2,y0+.8,0],[3.3,y0+.8,0],[3.3,1.1,0],[3.6,1.0,0]],.07,jc(0x4a4038,.05));cylH('iron',3.7,.85,0,.05,.2,jc(0x8a5a2a,.06),'x',6);barrel(3.3,0,.6);barrel(3.3,0,-.5);
 tireRing(0,0,3.6,3,-1.0,.0);
 const top=y0+.3+3.0+.16+r*.14+.28;sock('flag',0,top+.1,0,0,{w:1.5,h:.7});
 sock('banner',Math.cos(PI/2)*2.95,y0+1.05,Math.sin(PI/2)*2.95+.05,0,{w:1.0,h:1.9});
 sock('emblem',Math.sin(.5)*(r+.03),y0+2.3,Math.cos(.5)*(r+.03),.5,{w:1.2,h:1.2});}
function cpTowerScaffold(){const s=2.15,lv=[3.8,7.6,10.6];const pc=jc(0x8a8a86,.05);
 for(const sx of [-1,1])for(const sz of [-1,1]){beam('iron',[sx*s,0,sz*s],[sx*s,lv[2]+1.1,sz*s],.06,pc,true,6);box('conc',sx*s-.2,0,sz*s-.2,.4,.2,.4,jc(0x8a8880,.05));}
 for(const y of [0,...lv])for(const [a,b] of [[[-s,-s],[s,-s]],[[s,-s],[s,s]],[[s,s],[-s,s]],[[-s,s],[-s,-s]]])if(y>0||true)beam('iron',[a[0],y+.6,a[1]],[b[0],y+.6,b[1]],.04,pc,true,5);
 const ys=[0,...lv];for(let i=0;i<3;i++)for(const [a,b] of [[[-s,-s],[s,-s]],[[s,-s],[s,s]],[[s,s],[-s,s]],[[-s,s],[-s,-s]]]){beam('iron',[a[0],ys[i]+.6,a[1]],[b[0],ys[i+1]+.6,b[1]],.03,pc,true,4);}
 for(const y of lv){box('plank',0,y-.1,0,s*2+.5,.1,s*2+.5,jc(0x6a5a44,.06));}
 cpRailBox(0,lv[0],0,s*2+.5,s*2+.5,[],1.0);cpRailBox(0,lv[1],0,s*2+.5,s*2+.5,[],1.0);
 ladder(-1.2,0,s+.32,lv[0]+1.0,0);ladder(1.2,lv[0],s+.32,lv[1]-lv[0]+1.0,0);ladder(-1.2,lv[1],s+.32,lv[2]-lv[1]+1.0,0);
 // the lookout cabin on the top level
 const y=lv[2],hw=1.6,hh=2.2;
 wallOpen('plank',0,y,hw,hw*2,hh,.1,[{x0:-1.2,x1:1.2,y0:y+.9,y1:y+1.8}],jc(0x8a5a30,.05));wallOpen('plank',0,y,-hw,hw*2,hh,.1,[{x0:-.8,x1:.8,y0:y+.9,y1:y+1.7}],jc(0x8a5a30,.05));
 for(const sx of [-1,1])wallOpen('plank',sx*hw,y,0,hw*2,hh,.1,[{x0:sx*hw-.8,x1:sx*hw+.8,y0:y+.9,y1:y+1.7}],jc(0x7a5a38,.05),sx*PI/2);
 roofP('corr',-hw-.5,hw+.5,hw+.7,y+hh,-hw-.3,y+hh+.6,.07,pick([P('rust'),P('paint')]));
 cylH('iron',s-.3,y+hh+.9,-s+.3,.25,.5,jc(0x3a3430,.05),'z',10);sph('glow',s-.3,y+hh+.9,-s+.3+.28,.16,jc(0xfff2c0,.03));beam('iron',[s-.3,y+hh+.25,-s+.3],[s-.3,y+hh+.7,-s+.3],.05,jc(0x3a3430,.05),true,5);
 antenna(-1.0,y+hh+.5,-1.0,2.6);
 cpPole(1.0,y+hh+.3,y+hh+3.2,-.6,.05,jc(0x4a4038,.05));sock('flag',1.0,y+hh+3.3,-.6,0,{w:1.4,h:.65});
 sock('banner',0.0,lv[1]+1.0,s+.6+.05,0,{w:1.0,h:2.0});cpPole(-.5,lv[1],lv[1]+1.02,s+.6,.03,pc);cpPole(.5,lv[1],lv[1]+1.02,s+.6,.03,pc);
 sock('emblem',0,y+1.3,hw+.06,0,{w:.9,h:.9});
 // water butt and junk at the foot
 waterButt(-s-.9,1.1,-s,.55,.9);barrel(s+.9,0,s+.2);crate(s+1.0,0,-s+.4,.6,.3);tireStack(-s-.8,s+.5,3);}
function cpTowerBox(){const L=CT.L20;
 W(0,0,0,0,()=>container({len:L,doorEnd:false,col:cpCol()}));W(0,CT.H,0,PI/2,()=>container({len:L,doorEnd:false,col:cpCol()}));W(-.7,CT.H*2,0,0,()=>container({len:L,doorEnd:false,col:cpCol()}));
 const ty=CT.H*3;
 door(-1.0,.16,CT.W/2,1.0,2.0,{step:true});porthole(1.6,1.3,CT.W/2,.28);win(-.4,CT.H+.7,L/2,.7,.8);
 box('plank',-.7,ty,0,L-.2,.14,CT.W+1.2,jc(0x6a5a44,.06));
 cpRailBox(-.7,ty+.14,0,L+.4,CT.W+1.5,[],1.05);
 // lookout shelter: three planked sides + lean roof
 wallOpen('plank',1.0,ty+.14,-.9,2.6,2.0,.1,[],jc(0x8a5a30,.05));for(const sx of [-1,1])wallOpen('plank',1.0+sx*1.3,ty+.14,0,1.8,2.0,.1,[],jc(0x7a5a38,.05),sx*PI/2);
 roofP('corr',-.6,2.6,1.1,ty+2.15,-1.2,ty+2.55,.07,pick([P('galv'),P('rust')]));
 ladder(-2.0,0,CT.W/2+.02,CT.H+.9,0);ladder(-CT.W/2-.04,CT.H,-.7,CT.H+.9,PI/2);ladder(.5,CT.H*2,CT.W/2+.02,CT.H+.9,0);
 cpPole(-2.8,ty+.14,ty+3.7,-.8,.05,jc(0x4a4038,.05));sock('flag',-2.8,ty+3.8,-.8,0,{w:1.4,h:.65});
 sock('banner',-.7,ty+1.15,CT.W/2+.75+.06,0,{w:1.0,h:1.9});sock('emblem',-.7,CT.H*.5+1.2,CT.W/2+.02,0,{w:.9,h:.9});
 waterButt(-3.3,ty+.14+.45,.5,.5,.8);barrel(3.0,0,CT.W/2+.5);tireStack(-3.9,1.4,4);crate(3.5,0,1.7,.6,.2);}
// ---------------------------------------------------------------- the ground plan
function cpGround(G,placed){const zf=G.zf,zb=G.zb,xr=G.xr,v=G.v,zm=(zb+zf)/2;
 box('earth',0,.02,zm,xr*2,.04,zf-zb,jc(0x9c8768,.03));
 // the yard: paved with reclaimed slabs; the road runs from the gate to it
 const yx=v?5:10,yz0=v?1:-3.5,yz1=v?6:7.5,yzc=(yz0+yz1)/2;
 box('earth',0,.04,(yz0+yz1)/2,yx*2,.03,yz1-yz0,jc(0x7a6448,.04));
 for(let i=0;i<Math.round(yx*2/2.2);i++)for(let j=0;j<Math.round((yz1-yz0)/2.2);j++){if(rng()<.7)box('conc',-yx+1.1+i*2.2,.05,yz0+1.1+j*2.2,rr(1.6,2.1),.03,rr(1.6,2.1),jc(pick([0x8a7a66,0x7a7264,0x94826a,0x6f6a5e]),.05));}
 box('earth',0,.04,(yz1+zf+.4)/2,6.8,.03,zf+.4-yz1,jc(0x8a7458,.04));
 // gate approach: mud fan outside, tyre tracks that carry inside
 poly('plain',[[-3.4,.03,zf],[3.4,.03,zf],[G.xr*.5,.03,zf+5.0-(v?2.2:0)],[-G.xr*.5,.03,zf+5.0-(v?2.2:0)]].map(p=>[p[0],p[1],p[2]]),jc(0x5a4632,.05),true);
 const z1=zf+(v?3.2:5.0),zt0=(yz1+zf)/2;
 for(const tx of [-2.1,-1.0,1.0,2.1]){const n=Math.round((z1-yz1)/.42);for(let k=0;k<n;k++){const z=yz1+k*.42+.2;const x=tx+(z>zf+2?(tx>0?1:-1)*(z-zf-2)*.5:0)+Math.sin(k*.35+tx)*.08;box('plain',x,.06,z,.36,.012,.1,jc(0x2a2118,.04),rr(-.15,.15));box('plain',x,.062,z,.05,.012,.42,jc(0x2a2118,.04));}}
 for(const [px,pz,pr] of [[-4.4,zf+3.0,.9],[3.9,zf+3.7,.7],[0,zf+(v?2.9:4.4),.6],[-7.5,zf+1.8,.5]])cyl('water',px,.05,pz,pr,.012,jc(0x3a4a48,.03),12);
 // pads under the placed buildings
 for(const p of placed){W(p.slot.x,0,p.slot.z,p.yaw,()=>{box('conc',0,.05,0,p.def.w+1.4,.04,p.def.d+1.4,jc(0x7a7264,.05));});}
 // yard furniture: fire pit with tyre seats, well, flagpole, lamps
 fire(0,.05,yzc,.6);for(let k=0;k<5;k++){const a=k/5*TAU+.3;cpTire(Math.cos(a)*1.9,.14,yzc+Math.sin(a)*1.9,.36,undefined,rng()*TAU);cpTire(Math.cos(a)*1.9,.32,yzc+Math.sin(a)*1.9,.36,undefined,rng()*TAU);}
 const wx=v?-3.2:-6.2,wz=yz1-1.6;tireRing(wx,wz,.95,3,0,TAU);cyl('water',wx,.5,wz,.7,.02,jc(0x2a3a3a,.03),10);beam('wood',[wx-.9,0,wz],[wx-.9,2.2,wz],.06,jc(0x5c4630,.06),true,6);beam('wood',[wx+.9,0,wz],[wx+.9,2.2,wz],.06,jc(0x5c4630,.06),true,6);beam('wood',[wx-.9,2.2,wz],[wx+.9,2.2,wz],.06,jc(0x5c4630,.06));
 const fpz=v?2.2:-8.5,fpx=v?-3.6:0;cpPole(fpx,0,9.6,fpz,.09,jc(0x4a4038,.05));box('conc',fpx-.4,0,fpz-.4,.8,.3,.8,jc(0x8a8880,.05));sock('flag',fpx,9.7,fpz,0,{w:1.8,h:.9});
 for(const [lx,lz] of v?[[-4.6,1.2],[4.6,5.8],[-2.6,8.5]]:[[-9.2,-3.2],[9.2,-3.2],[-9.2,7.2],[9.2,7.2],[-3.8,15],[3.8,15],[-3.8,10],[3.8,10]])lamp(lx,0,lz,3.6,{arm:lx>0?-.35:.35});
 // gate-side toll stall and notice board (a fixture, outside every slot)
 const sx0=v?-7:-8.0,sz0=zf-2.6;box('plank',sx0,0,sz0,3.0,.1,2.2,jc(0x6a5a44,.06));
 for(const px of [-1.4,1.4])for(const pz of [-1.0,1.0])beam('wood',[sx0+px,0,sz0+pz],[sx0+px,2.3,sz0+pz],.07,jc(0x5c4630,.06),true,6);
 roofP('corr',sx0-1.7,sx0+1.7,sz0+1.3,2.15,sz0-1.2,2.6,.07,pick([P('galv'),P('paint')]));box('plank',sx0,.1,sz0-1.0,3.0,.9,.1,jc(0x8a6a3a,.05));box('plank',sx0,1.0,sz0+.9,3.0,.08,.5,jc(0x6a5a44,.06));
 sock('awning',sx0,2.5,sz0+1.35,0,{w:3.0,d:.9,drop:.35,h:2.2});
 barrel(sx0+2.0,0,sz0+.6);crate(sx0-2.0,0,sz0+.9,.6,.2);
 // scattered yard junk against the walls where no slot claims them
 junkPile(-xr+1.5,zf-1.5,1.4,6);junkPile(xr-1.8,zb+3.2,1.4,6);}
// vacant plots get a claim-stake ring of tyres and a few crates so an empty slot is not a blank
function cpVacant(s){W(s.x,0,s.z,s.facing||0,()=>{const w=Math.min(s.w,10),d=Math.min(s.d,8);for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]){tireStack(x,z,2);}
 crate(-w*.2,0,-d*.2,.7,.3);crate(-w*.2+.8,0,-d*.2+.2,.6,.6);pallet(w*.2,0,d*.1,1.2,.8,.4);barrel(w*.3,0,-d*.2);sacks(0,0,d*.3,4,.2);});}
// ---------------------------------------------------------------- the builder
function cpBuild(o){const v=o.v===1?1:0;const G=cpGeom(v);const xr=G.xr,zb=G.zb,zf=G.zf;
 // 1. assignment (no rng): each requested def goes into the first free slot it fits
 const slots=cpSlots(G.w,G.d);const want=(o.slots&&o.slots.length)?o.slots.slice():['smithy','shop-general','dw-silo','gen-fuel','dw-box','mess','shop-food','lg-stack'].filter(k=>DEFS[k]).slice(0,v?3:4);
 const placed=[],rejected=[],used=new Set();
 for(const key of want){const def=DEFS[key];if(!def||key==='compound'){rejected.push({key,reason:'no such def'});continue;}
  let done=false;for(let i=0;i<slots.length;i++){if(used.has(i))continue;const yaw=cpFit(def,slots[i]);if(yaw!==null){used.add(i);placed.push({key,slot:slots[i],slotIndex:i,yaw:yaw,def:def});done=true;break;}}
  if(!done)rejected.push({key,reason:'no free slot fits '+def.w+'x'+def.d});}
 // 2. ground plan, walls, gantry, towers, gate
 cpGround(G,placed);
 if(v===0){
  cpRun(-xr,zb,xr,zb,[{t:'cont',pcs:[CT.L40,CT.L40]},{t:'car'},{t:'sheet'},{t:'tyre'}]);
  cpRun(xr,zb,xr,zf,[{t:'sheet'},{t:'cont',pcs:[CT.L40,CT.L20]},{t:'tyre'},{t:'car'}]);
  cpRun(-xr,zf,-xr,zb,[{t:'tyre'},{t:'cont',pcs:[CT.L40]},{t:'sheet'},{t:'car'}]);
  cpRun(xr,zf,5.74,zf,[{t:'car'},{t:'cont',pcs:[CT.L40]},{t:'tyre'}]);
  cpRun(-5.74,zf,-xr,zf,[{t:'tyre'},{t:'cont',pcs:[CT.L40]},{t:'sheet'}]);
 }else{
  cpRun(-xr,zb,xr,zb,[{t:'cont',pcs:[CT.L40]},{t:'tyre'},{t:'car'}]);
  cpRun(xr,zb,xr,zf,[{t:'sheet'},{t:'cont',pcs:[CT.L40]},{t:'tyre'}]);
  cpRun(-xr,zf,-xr,zb,[{t:'tyre'},{t:'cont',pcs:[CT.L20,CT.L20]},{t:'car'},{t:'sheet'}]);
  cpRun(xr,zf,5.74,zf,[{t:'tyre'},{t:'cont',pcs:[CT.L20]}]);
  cpRun(-5.74,zf,-xr,zf,[{t:'cont',pcs:[CT.L20]},{t:'sheet'}]);}
 const gy=3.4,te=v?2.9:2.9;
 const bsx=v?-8:-8.75,frx=xr-te-4-(v?0:2),flx=-xr+te+4+(v?0:2);cpGantry(-xr+te,zb,xr-te,zb,gy,[[bsx+2.2,zb,3.2]]);cpGantry(xr,zb+te,xr,zf-te,gy,[]);cpGantry(-xr,zf-te,-xr,zb+te,gy,[]);
 cpGantry(xr-te,zf,5.74,zf,gy,[[frx-2.2,zf,3.2]]);cpGantry(-5.74,zf,-xr+te,zf,gy,[[flx+2.2,zf,3.2]]);
 // stairs running along the gantry in the free strip beside it
 {const sx=bsx;stairs(sx-3.4,0,zb+1.8,sx+3.0,gy,zb+1.8,1.0);box('plank',sx+3.3,gy-.12,zb+1.8,1.0,.12,1.0,jc(0x6a5a44,.06));}
 {const fx=frx;stairs(fx+3.4,0,zf-1.8,fx-3.0,gy,zf-1.8,1.0);box('plank',fx-3.3,gy-.12,zf-1.8,1.0,.12,1.0,jc(0x6a5a44,.06));}
 {const fx=flx;stairs(fx-3.4,0,zf-1.8,fx+3.0,gy,zf-1.8,1.0);box('plank',fx+3.3,gy-.12,zf-1.8,1.0,.12,1.0,jc(0x6a5a44,.06));}
 cpGate(G,o);
 // corner towers: NW silo, NE water tank, SE scaffold lookout, SW container tower
 W(-xr-.1,0,zb-.1,PI/4,()=>cpTowerSilo());
 W(xr+.1,0,zb-.1,-PI/4,()=>cpTowerTank());
 W(xr+.3,0,zf+.4,PI,()=>cpTowerScaffold());
 W(-xr-.3,0,zf+.4,PI,()=>cpTowerBox());
 // 3. the buildings (last, so the wall drawing never depends on their random use), then vacant plots
 const res=[];for(const p of placed){const r=place(p.key,p.slot.x,p.slot.z,p.yaw,{});res.push({key:p.key,slot:p.slot.name});}
 reseed(5499);for(let i=0;i<slots.length;i++)if(!used.has(i))cpVacant(slots[i]);
 window._compound={placed:res,rejected:rejected,slots:slots.length};}
