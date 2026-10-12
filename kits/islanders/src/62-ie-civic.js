// prefix: ie
// ================================================================= KAUTOA'S CIVIC BUILDINGS: the village hall, the ceremonial square, the school
// The East's public buildings speak the houses' language (60-ie-east.js) at a larger scale: golden reed thatch, the tower
// rising out of a skirt to a short ridge with carved finials, carved ancestor posts in natural timber, woven facades in
// nested diamonds, megaliths, buffalo horns and the white moon. The village hall follows the owner's "plaza" picture (a
// great hall lifted on massive carved pillars and arches, a carved balcony round it, swooping horned roofs, here in the
// East's golden thatch crossed and crowned by its spire); the ceremonial square his "sumba - square" (a paved court shut
// in by long colonnaded galleries, a tall spire tower at each corner, the great tusks on a stepped platform in the middle).
// The HELPERS below serve every Kautoa fragment (62-65):
//   ieRoofE(o)        the East's roof on its own: a skirt (o.hw, o.hd at the eave o.eY) and towers out of it (ieHouse's roof)
//   ieFinial(k,sp,s)  the finials at a tower ridge's ends ('figure' | 'horns' | 'moon' | 'none')
//   ieShed(o)         an open shed: a platform, posts round the edge (carved at the front), optional walls, ieRoofE over it
//   ieCutWith(x,z,y,fn) draw fn with the cut-away centred on a sub-building of a compound (local x, z; its floor y)
//   ieArch(...)       a carved arch between two pillars, its spandrel filled up to a beam
//   ieRoofY(rf,x,z)   the underside of an isSaddle roof over (x, z) (where a post meets it)
//   ieFurn(list)      FURNISH a list of [key, x, y, z, ry, opts]
// Frame: origin on the ground at the plot centre, +z the front.
/* o: hw, hd (the eave's half-size), eY (the eave's height), skirtH, skirtS, towerH (0: a plain hip), towerS, topSx, topSz, sq,
   mk, col, patch, th, nu, towers [[x, z, scale]], facade (a sheet woven up the towers' fronts), finial */
function ieRoofE(o){const R=Object.assign({skirtH:1.5,skirtS:.5,towerH:7,towerS:.42,topSx:.2,topSz:.05,sq:7,mk:'thatchR',th:.32,finial:'figure'},o),col=R.col||P('thatchE');
 const hw=R.hw,hd=R.hd,eY=R.eY,sk=eY+R.skirtH,towers=R.towers||(R.towerH>0?[[0,0,1]]:[]);let towerTop=sk+.9;
 isSpire({hw,hd,sq:R.sq,mk:R.mk,col,patch:R.patch,th:R.th,cap:!towers.length,nu:R.nu,
  prof:towers.length?[[1,1,eY],[R.skirtS,R.skirtS,sk],[R.skirtS*.62,R.skirtS*.6,sk+.6]]:[[1,1,eY],[R.skirtS*.5,R.skirtS*.15,sk+.9]]});
 for(const [tx,tz,ts] of towers)W(tx,0,tz,0,()=>{const th_=R.towerH*ts,bs=R.towerS*ts;
  const sp=isSpire({hw,hd,sq:R.sq,mk:R.mk,col,patch:R.patch?R.patch*.5:0,th:R.th,nu:R.tnu||28,sub:4,
   prof:[[bs*1.05,bs*1.05,sk-.4],[bs,bs*.92,sk+.3],[bs*.72,bs*.6,sk+th_*.4],[bs*.5,bs*.34,sk+th_*.75],[R.topSx*ts,R.topSz*ts+.02,sk+th_]]});
  towerTop=Math.max(towerTop,sp.top);
  if(R.facade)psurf(R.facade,(u,v)=>{const y=sk+.5+v*(th_*.32),t=(y-(sk+.3))/(th_*.4-.3),sx=lerp(bs,bs*.72,clamp(t,0,1))*hw*.86,sz=lerp(bs*.92,bs*.6,clamp(t,0,1))*hd+R.th*.3+.05;
   return [(u-.5)*2*sx*(1-v*.25),y,sz];},4,6,WHITE,{flip:false});
  ieFinial(R.finial,sp,R.finS||1);});
 return {sk,towerTop,hw,hd};}
/* the finials at both ends of a spire's ridge (sp: isSpire's handle) */
function ieFinial(kind,sp,s){s=s||1;for(const k of [-1,1]){const fx=k*sp.topW*.85,fy=sp.top+.15;
 if(kind==='horns')isHorns(fx,fy,0,k>0?-PI/2:PI/2,1.0*s);else if(kind==='moon'){if(k>0)isMoonDisc(0,fy+.6*s,0,0,.5*s);}
 else if(kind==='figure')isFigure(fx,fy,0,0,.9*s,{mk:'carved'});}}
/* an open shed. o: w, d (the post grid), plat (a platform's height; o.platMk), postH, step (the post spacing), carved (the front
   row carved pou), inner (posts inside the grid too), walls {front|back|left|right: a MAT key or 'patch'} (o.wallH, o.opens[side]),
   over (the roof's overhang), roof (ieRoofE's options). Returns {top, sk, towerTop}. */
function ieShed(o){const w=o.w,d=o.d,py=o.plat||0,ph=o.postH||2.6,top=py+ph,st=o.step||3,ov=o.over===undefined?.9:o.over;
 const pc=k=>k==='coral'?P('coral'):k==='bamboo'||k==='mat'?P('bamboo'):k==='earth'?P('earth'):k==='stone'?P('stone'):k==='reclaimed'||k==='planks'?P('planks'):P('rust');
 if(py>0){isCutFloor(py);box(o.platMk||'stone',0,0,0,w+.7,py,d+.7,pc(o.platMk||'stone'));}
 const xs=isSpan(-w/2,w/2,Math.max(2,Math.round(w/st)+1)),zs=isSpan(-d/2,d/2,Math.max(2,Math.round(d/st)+1));
 isNoCut(()=>{for(const x of xs)for(const z of zs){const edge=Math.abs(Math.abs(x)-w/2)<.01||Math.abs(Math.abs(z)-d/2)<.01;if(!edge&&!o.inner)continue;
   if(o.carved&&z>d/2-.01)isPou(x,py,z,ph,.15,{mk:'carved',n:2});else cyl('wood',x,py,z,.12,ph,P('wood'),8);}
  for(const s of [-1,1]){box('wood',0,top-.22,s*d/2,w+.3,.22,.2,P('woodD'));box('wood',s*w/2,top-.22,0,.2,.22,d+.3,P('woodD'));}});
 const wh=o.wallH||ph;
 for(const [side,x,z,ry,L] of [['front',0,d/2,0,w],['back',0,-d/2,PI,w],['right',w/2,0,PI/2,d],['left',-w/2,0,-PI/2,d]]){const mk=o.walls&&o.walls[side];if(!mk)continue;
  W(x,0,z,ry,()=>{if(mk==='patch')isPatchWall(L,py,wh,{});else isWall(L,py,wh,mk,pc(mk),(o.opens&&o.opens[side])||[],{frame:P('woodD'),shutMk:'bamboo',shutCol:P('bamboo')});});}
 const r=ieRoofE(Object.assign({hw:w/2+ov,hd:d/2+ov,eY:top-.05},o.roof||{}));
 return Object.assign({top},r);}
/* draw fn with the cut-away centred on local (x, z) and opening above y (a house inside a compound opens about itself) */
function ieCutWith(x,z,y,fn){const keep=CUTC;if(CUTC[3]){const p=new THREE.Vector3(x,y||0,z).applyMatrix4(CM);CUTC=[p.x,p.z,p.y,1];}try{fn();}finally{CUTC=keep;}}
/* a carved arch from x0 to x1 along local x at z = 0, springing at ys and rising `rise`, its spandrel filled up to yTop, dz deep,
   a moulded roll on both faces */
function ieArch(x0,x1,ys,rise,yTop,dz,mk,col){const cx=(x0+x1)/2,hw=(x1-x0)/2,ax=u=>cx-Math.cos(PI*u)*hw,ay=u=>ys+Math.sin(PI*u)*rise;
 for(const s of [-1,1]){psurf(mk,(u,v)=>[ax(u),lerp(ay(u),yTop,v),s*dz/2],10,2,col,{flip:s<0});
  tube(mk,u=>[ax(u),ay(u)+.05,s*(dz/2+.02)],()=>[.08,.08],12,5,col);}
 psurf(mk,(u,v)=>[ax(u),ay(u),lerp(-dz/2,dz/2,v)],10,1,col);}
/* the underside of an isSaddle roof (rf) above local (x, z): the nearest sample of its sheet */
function ieRoofY(rf,x,z){const f=rf.F(z<0?-1:1);let best=1e9,y=0;for(let i=0;i<=40;i++)for(let j=0;j<=20;j++){const p=f(i/40,j/20),dd=(p[0]-x)*(p[0]-x)+(p[2]-z)*(p[2]-z);if(dd<best){best=dd;y=p[1];}}return y-rf.th;}
/* a solid flight of stone steps from the ground (at local z = run, outward) up to y1 (at z = 0), w wide, at (x, z) turned ry:
   each step a block down to the ground, carved balustrades along both sides ending in posts. Returns the run. */
function ieSteps(x,z,ry,y1,w,o){o=o||{};const n=Math.max(2,Math.ceil(y1/.2)),rise=y1/n,go=o.go||.32,run=n*go,cv=P('carvN');
 W(x,0,z,ry,()=>{for(let i=0;i<n;i++)box('stone',0,0,run-go*(i+.5),w,rise*(i+1),go+.02,P('stone'));
  if(o.rail!==false)for(const s of [-1,1]){beam('carved',[s*(w/2+.13),.45+.5,run],[s*(w/2+.13),y1+.5,0],.26,cv,false,undefined,1.0);box('carved',s*(w/2+.13),0,run,.4,1.25,.4,cv);
   box('stone',s*(w/2+.13),0,run/2,.26,.45,run,P('stone'));}});return run;}
/* FURNISH a list: [key, x, y, z, ry, opts] */
function ieFurn(list){for(const e of list)FURNISH(e[0],e[1],e[2],e[3],e[4]||0,e[5]);}
/* ---------------------------------------------------------------- the village hall */
defBuilding({key:'ie-hall',name:'Village hall (Kautoa)',seed:6101,cut:true,w:29,d:24.5,h:25,budget:400000,
 tags:{types:['civic'],wealth:'rich',style:'east',role:'village hall'},
 note:'the village hall (the owner\'s "plaza" picture): a great hall lifted on massive carved pillars and arches, a carved and painted balcony running round it, two horned saddle roofs of golden thatch crossing over it and the spire rising where they meet; a grand stone stair between carved posts, boulders round the pillars',
 build(o){const FY=3.6,DW=20,DD=14,RW=14,RD=8,WH=3.0,top=FY+WH,col=P('thatchE'),cv=P('carvN');
  isCutFloor(FY);
  /* the undercroft: pillars round the deck's edge with arches between them, plain posts inside, the deck on girders */
  const xs=isSpan(-DW/2+.6,DW/2-.6,6),zs=isSpan(-DD/2+.6,DD/2-.6,4),xe=DW/2-.6,ze=DD/2-.6,yG=FY-.42;
  const colossal=(x,z)=>Math.abs(Math.abs(z)-ze)<.01&&(Math.abs(Math.abs(x)-xe)<.01||(z>0&&Math.abs(x)<2));
  isNoCut(()=>{
   for(const x of xs)for(const z of zs){const edge=Math.abs(Math.abs(x)-xe)<.01||Math.abs(Math.abs(z)-ze)<.01;
    if(!edge){cyl('wood',x,0,z,.2,yG,P('wood'),10);continue;}
    sph('stone',x,.1,z,.75,P('stone'),.35,10);
    if(!colossal(x,z))isPou(x,0,z,yG,.42,{mk:'carved',n:2,col:cv});}
   for(const [fx,fz,ry,L,ps] of [[0,ze,0,DW,xs],[0,-ze,PI,DW,xs],[xe,0,PI/2,DD,zs],[-xe,0,-PI/2,DD,zs]])W(fx,0,fz,ry,()=>{
    for(let i=0;i<ps.length-1;i++){const a=ps[i]+.42,b=ps[i+1]-.42;ieArch(a,b,1.5,Math.min((b-a)/2,yG-1.5-.25),yG,.7,'carved',cv);}
    box('wood',0,yG,0,L+.6,.34,.5,P('woodD'));});
   for(const z of zs)box('wood',0,yG,z,DW,.3,.3,P('woodD'));
   isDeck(DW,DD,FY,{col:P('planks'),beam:false});
   /* the floor's carved edge: a corbelled band under the balcony all round */
   for(const [fx,fz,ry,L] of [[0,DD/2,0,DW],[0,-DD/2,PI,DW],[DW/2,0,PI/2,DD],[-DW/2,0,-PI/2,DD]])W(fx,0,fz,ry,()=>{box('carved',0,FY-.9,.12,L+.24,.5,.24,cv);box('patGableE',0,FY-.84,.25,L,.38,.02,WHITE);});
   /* the balcony's parapet: thick carved timber with rounded corners, woven panels on its face, a gap for the stair */
   const PH=1.05,Rc=1.4,pt=.3,xr=DW/2-Rc,zr=DD/2-Rc;
   const run=(x0,x1,z,ry)=>W(0,0,0,ry,()=>{const L=x1-x0,cx=(x0+x1)/2;box('carved',cx,FY,z-pt/2,L,PH,pt,cv);box('wood',cx,FY+PH,z-pt/2,L+.04,.1,pt+.14,P('woodD'));
    box('patGableE',cx,FY+.18,z+.01,L-.3,PH-.38,.02,WHITE);});
   run(-xr,-1.4,DD/2,0);run(1.4,xr,DD/2,0);run(-xr,xr,DD/2,PI);run(-zr,zr,DW/2,PI/2);run(-zr,zr,DW/2,-PI/2);
   for(const [sx,sz,a0] of [[1,1,0],[-1,1,PI/2],[-1,-1,PI],[1,-1,PI*1.5]]){sector('carved',sx*xr,sz*zr,Rc-pt,Rc,a0,a0+PI/2,FY,FY+PH,cv,6);sector('wood',sx*xr,sz*zr,Rc-pt-.07,Rc+.07,a0,a0+PI/2,FY+PH,FY+PH+.1,P('woodD'),6);}
   for(const s of [-1,1])isPou(s*1.4,FY,DD/2-.15,PH+.5,.16,{mk:'carved',n:1,top:'figure'});});
  /* the hall: plank walls, two doors to the balcony, woven panels */
  isWalls(RW,RD,FY,WH,'planks',P('woodL'),{front:[{x:-2.4,w:1.4,h:2.4,door:true},{x:2.4,w:1.4,h:2.4,door:true},{x:-5.2,w:.9,y:1,h:1.1},{x:5.2,w:.9,y:1,h:1.1}],
   back:[{x:-4,w:.9,y:1,h:1.1},{x:4,w:.9,y:1,h:1.1}],left:[{x:-2,w:.9,y:1,h:1.1},{x:2,w:.9,y:1,h:1.1}],right:[{x:-2,w:.9,y:1,h:1.1},{x:2,w:.9,y:1,h:1.1}],frame:P('woodD'),shutMk:'carved',shutCol:cv});
  for(const [fx,fz,ry,L] of [[0,RD/2+.07,0,RW],[0,-RD/2-.07,PI,RW],[RW/2+.07,0,PI/2,RD],[-RW/2-.07,0,-PI/2,RD]])W(fx,0,fz,ry,()=>box('patGableE',0,top-.62,0,L,.5,.02,WHITE));
  W(0,0,RD/2+.07,0,()=>{box('patGableE',0,FY+.1,0,2.2,2.2,.02,WHITE);for(const s of [-1,1])box('patGableE',s*6.3,FY+.1,0,1.2,2.2,.02,WHITE);});
  /* the colossal pillars: from the ground through the balcony to the eave, a flared capital under the roof */
  const rf=isSaddle({L:RW+2,W:RD+2,eaveY:top-.05,ridgeY:top+4.6,sag:.6,hornRise:4.2,hornOut:3.0,taper:.3,over:2.4,p:3.5,mk:'thatchR',col,th:.34,nu:36,concave:.35});
  for(const s of [-1,1])rf.gable(s*(RW/2+.02),top,RD/2+.02,'patGableE',{});
  isNoCut(()=>{for(const x of xs)for(const z of [-ze,ze]){if(!colossal(x,z))continue;const yt=ieRoofY(rf,x,z);sph('stone',x,.1,z,.85,P('stone'),.35,10);
   isPou(x,0,z,yt-.75,.5,{mk:'carved',n:Math.max(3,Math.round((yt-.75)/1.3)),col:cv});beam('carved',[x,yt-.8,z],[x,yt,z],.5,cv,true,10,.85);}});
  /* the cross roof (its gables to the front and back) and the spire where the two meet */
  W(0,0,0,-PI/2,()=>{const cr=isSaddle({L:RD+3,W:8,eaveY:top+.9,ridgeY:top+7.2,sag:.5,hornRise:3.8,hornOut:2.6,taper:.3,over:1.3,p:3.5,mk:'thatchR',col,th:.34,nu:30,concave:.35});
   for(const s of [-1,1])cr.gable(s*(RD/2+.02),top+.9,4,'patGableE',{});
   for(const s of [-1,1]){const t=cr.R(s);isMoonDisc(t[0]*.97,t[1]+.55,0,s>0?PI/2:-PI/2,.5);}});
  const sp=isSpire({hw:3.2,hd:3.2,sq:6,mk:'thatchR',col,th:.3,nu:28,sub:4,prof:[[1,1,top+2.8],[.92,.88,top+5.4],[.66,.52,top+8.9],[.42,.26,top+12.9],[.24,.06,top+16.2]]});
  psurf('patGableE',(u,v)=>{const y=top+6+v*3.0,t=(y-(top+5.4))/3.5,sx=lerp(.9,.66,clamp(t,0,1))*3.2*.8,sz=lerp(.86,.52,clamp(t,0,1))*3.2+.12;return [(u-.5)*2*sx*(1-v*.2),y,sz];},4,6,WHITE,{flip:false});
  ieFinial('figure',sp,1);
  /* the grand stair between carved posts, boulders round the pillars, the moon's flags */
  isNoCut(()=>{ieSteps(0,DD/2+.02,0,FY,2.4);for(const s of [-1,1]){isPou(s*1.9,0,DD/2+5.4,3.2,.22,{mk:'carved',top:'horns',col:cv});isFlag(s*8.5,DD/2+3,9,{ry:s>0?0:PI});}
   for(let i=0;i<14;i++){const a=i/14*TAU+rr(-.15,.15),x=Math.cos(a)*rr(11,13),z=Math.sin(a)*rr(8,9.8);if(z>6&&Math.abs(x)<4)continue;sph('stone',x,0,z,rr(.35,.6),P('stone'),rr(.6,.9),8);}});
  /* the hall's furniture: the chief's seat under the tapestries, benches down both sides, the kava bowls, statues, lamps */
  ieFurn([['islander_court_throne',0,FY,-RD/2+.6,0],['islander_court_tapestry',-2.6,FY,-RD/2+.14,0],['islander_court_tapestry',2.6,FY,-RD/2+.14,0],
   ['islander_court_carpet',0,FY,.4,0],['islander_common_kava_bowl',0,FY,.4,0],['islander_common_kava_bowl',-3.6,FY,1,0],['islander_common_kava_bowl',3.6,FY,1,0],
   ['islander_court_statue',-RW/2+.6,FY,-RD/2+.6,PI/4],['islander_court_statue',RW/2-.6,FY,-RD/2+.6,-PI/4],
   ['islander_common_banner',-4.2,FY,RD/2-.16,PI],['islander_common_banner',4.2,FY,RD/2-.16,PI]]);
  for(const s of [-1,1])for(const z of [-2.2,0,2.2])FURNISH('islander_common_bench',s*(RW/2-.35),FY,z,s<0?PI/2:-PI/2,{v:z>0?1:0});
  for(const x of [-3.2,3.2])FURNISH_HANG('islander_court_hanging',x,top+1.4,.4,0);
  for(const s of [-1,1])FURNISH('islander_common_bench',s*5,FY,DD/2-1.1,0);}});
/* ---------------------------------------------------------------- the ceremonial square */
/* a colonnaded gallery L long, gd deep, along local x, its open side +z (the court): a stone plinth, a coral back wall with
   a painted band, posts with carved capitals, a gable roof of golden thatch; o.ends [-1, 1] closes those ends with gables */
function ieGallery(L,gd,o){o=o||{};const ph=o.postH||2.9,pl=.38,cv=P('carvN');
 box('stone',0,0,0,L,pl,gd,P('stone'));box('coral',0,pl,-gd/2+.25,L,ph+.12,.5,P('coral'));box('patGableE',0,pl+ph-.85,-gd/2+.51,L-.4,.6,.02,WHITE);
 for(const x of isSpan(-L/2+.45,L/2-.45,Math.max(2,Math.round(L/2.8)+1))){cyl('wood',x,pl,gd/2-.32,.15,ph,P('wood'),8);box('carved',x,pl+ph-.55,gd/2-.32,.46,.46,.46,cv);sph('stone',x,pl,gd/2-.32,.24,P('stone'),.5,8);}
 box('wood',0,pl+ph-.08,gd/2-.32,L,.26,.26,P('woodD'));
 const rf=isGabled({L:L-1.2,W:gd,eaveY:pl+ph+.12,ridgeY:pl+ph+2.2,over:.7,mk:'thatchR',col:P('thatchE'),th:.24,nu:Math.max(8,Math.round(L/1.5)),nv:3});
 for(const s of o.ends||[])rf.gable(s*(L/2-.62),pl+ph+.12,gd/2,'patGableE',{});}
/* a corner tower: a coral-stone block s x 2 square, bh tall, a painted band, a dark door on the court side, a tall spire */
function ieSpireTower(s,bh,towerH,doorRy){box('coral',0,0,0,2*s,bh,2*s,P('coral'));box('stone',0,bh,0,2*s+.3,.2,2*s+.3,P('stone'));
 for(let k=0;k<4;k++)W(0,0,0,k*PI/2,()=>box('patGableE',0,bh-1.5,s+.01,2*s-.8,1.0,.02,WHITE));
 W(0,0,0,doorRy,()=>{box('plain',0,0,s+.01,1.1,2.1,.02,P('black'));box('wood',0,2.1,s+.04,1.5,.2,.08,P('woodD'));});
 return ieRoofE({hw:s+.7,hd:s+.7,eY:bh+.15,skirtH:1.1,skirtS:.62,towerH,towerS:.56,topSx:.14,topSz:.1,sq:4,th:.26,finial:'horns',facade:'patGableE',tnu:24});}
defBuilding({key:'ie-square',name:'Ceremonial square (Kautoa)',seed:6102,w:58,d:50,h:24,budget:400000,front:{x:0,z:22.5,yaw:0},
 tags:{types:['plaza','religious','civic'],wealth:'rich',style:'east',role:'ceremonial square'},
 note:'the ceremonial square (the owner\'s "sumba - square" picture): a paved court shut in by long colonnaded galleries under golden thatch, a tall spire tower at each corner, a gate with carved posts, and in the middle the great tusks rising over a gilded shrine on a stepped stone platform',
 build(o){const CW=44,CD=36,GD=4.5,gx=CW/2+GD/2,gz=CD/2+GD/2,cv=P('carvN');
  /* the pavement: stone, crossed by coral causeways from the gate and the side doors to the platform */
  box('stone',0,0,0,CW+2*GD,.1,CD+2*GD,P('stone'));box('coral',0,.1,CD/4+1.5,3,.03,CD/2-3,P('coral'));box('coral',0,.1,0,CW-1,.03,2.4,P('coral'));
  /* the galleries */
  W(gx,0,0,-PI/2,()=>ieGallery(CD-2.6,GD));W(-gx,0,0,PI/2,()=>ieGallery(CD-2.6,GD));W(0,0,-gz,0,()=>ieGallery(CW-3,GD));
  for(const s of [-1,1])W(s*(CW/4+1.25-.5),0,gz,PI,()=>ieGallery(CW/2-3.5-1.5,GD,{ends:[s>0?1:-1]}));
  /* the corner towers */
  for(const [sx,sz] of [[1,1],[-1,1],[1,-1],[-1,-1]])W(sx*gx,0,sz*gz,sz>0?PI:0,()=>ieSpireTower(3.5,5.5,15,0));
  /* the gate: carved posts, a lintel with figures, a small spire over it */
  W(0,0,gz,0,()=>{for(const s of [-1,1]){isPou(s*2.6,0,GD/2-.2,4.2,.3,{mk:'carved',n:3,top:'figure',col:cv});isPou(s*2.6,0,-GD/2+.4,4.2,.3,{mk:'carved',n:3,col:cv});}
   box('carved',0,4.2,GD/2-.2,6,.5,.6,cv);box('carved',0,4.2,-GD/2+.4,6,.5,.6,cv);box('patGableE',0,4.25,GD/2+.11,5.2,.4,.02,WHITE);
   ieRoofE({hw:3.6,hd:3.2,eY:4.7,skirtH:1.0,skirtS:.6,towerH:6.5,towerS:.42,topSx:.2,topSz:.06,sq:6,th:.24,finial:'moon',facade:'patGableE'});
   door(0,0,GD/2,0,4.6);});
  /* the monument: three stone steps, the gilded shrine under a small spire, the great tusks arching over it, menhirs round it */
  const ty=1.35;for(let k=0;k<3;k++){const s=12-k*2.6;box(k===1?'coral':'stone',0,k*.45,0,s,.45,s,P(k===1?'coral':'stone'));}
  box('carved',0,ty,0,2.6,1.1,1.8,cv);box('brass',0,ty+1.1,0,2.9,.12,2.1,P('brass'));for(const s of [-1,1])box('brass',0,ty+.3,s*.91,2.2,.5,.02,P('brass'));
  isSpire({hw:1.5,hd:1.1,sq:5,mk:'thatchR',col:P('thatchE'),th:.12,nu:20,sub:2,prof:[[1,1,ty+1.22],[.5,.42,ty+2.1],[.18,.08,ty+3.5]]});
  pole('wood',[0,ty+3.4,0],[0,ty+4.2,0],.05,P('woodD'),6);isMoonDisc(0,ty+4.8,0,0,.6);
  for(const s of [-1,1]){tube('bone',t=>[s*(2.9-2.4*t*t),ty+.1+t*8.2,-.9*Math.sin(PI*t)],t=>{const r=.46*(1-.74*t);return [r,r];},18,10,P('bone'),{caps:true});
   cyl('brass',s*2.9,ty,0,.52,.4,P('brass'),12);cyl('brass',s*2.88,ty+.75,-.09,.49,.14,P('brass'),12);}
  for(const [x,z] of [[-5.3,-5.3],[5.3,-5.3],[-5.3,5.3],[5.3,5.3]])isMenhir(x,z,2.4,.32);
  for(const s of [-1,1]){isPou(s*7.5,0,7.5,3.6,.22,{mk:'carved',top:'horns',col:cv});isTomb(s*12,-8,0,{s:1,figures:true});isFlag(s*7.5,-7.5,10,{ry:s>0?0:PI});}
  /* the galleries' furniture: benches along the walls, market stalls on feast days, the banners */
  for(const s of [-1,1]){for(const z of [-10,-4,4,10])FURNISH('islander_common_bench',s*(gx+GD/2-.8),.38,z,s>0?-PI/2:PI/2,{v:z>0?1:0});
   FURNISH('generic_trade_stall',s*(gx-.4),.38,-14.5,s>0?-PI/2:PI/2);FURNISH('islander_common_banner',s*14,.38,-gz-GD/2+.65,0);}
  FURNISH('islander_common_kava_bowl',0,1.35,2.2,0,{setting:'outdoor'});FURNISH('generic_trade_altar',0,1.35,-2.4,0,{setting:'outdoor'});}});
/* ---------------------------------------------------------------- the school */
defBuilding({key:'ie-school',name:'School (Kautoa)',seed:6103,cut:true,w:22,d:13.5,h:13.5,budget:150000,
 tags:{types:['civic'],wealth:'middle',style:'east',role:'school'},
 note:'the village school: a long woven room on piles under a skirt of golden thatch and one spire, windows all round, benches facing the teacher\'s board, books on the teacher\'s desk; a flag and a shade tree in the yard',
 build(o){const w=9,d=6,fy=1.3;
  ieHouse({w,d,floorY:fy,wallH:2.3,ver:.9,verFront:1.6,roof:{over:.8,skirtH:1.5,skirtS:.55,towerH:6.2,towerS:.3,topSx:.18,topSz:.05,sq:8},
   front:[{x:0,w:1.2,h:1.9,door:true},{x:-2.9,w:1.2,y:.8,h:1.0},{x:2.9,w:1.2,y:.8,h:1.0}],back:[{x:-2.4,w:1.2,y:.8,h:1.0},{x:2.4,w:1.2,y:.8,h:1.0}],
   left:[{x:0,w:1.2,y:.8,h:1.0}],right:[{x:0,w:1.2,y:.8,h:1.0}],wallMk:'bamboo',facade:'patWeave',towerFacade:true,stair:'stair',stairW:1.4,finial:'moon'});
  /* the room: rows of benches facing the board on the back wall, the teacher's desk with the books, a bookcase */
  const bh=svfH('islander_common_desk',0,1.1);
  ieFurn([['islander_common_board',0,fy,-d/2+.12,0],['islander_common_desk',-2.6,fy,-1.75,0],['islander_common_books',-2.8,fy+bh,-1.75,0],['islander_common_books',-2.3,fy+bh,-1.8,.3],
   ['islander_common_bookcase',w/2-.34,fy,-1.2,-PI/2],['islander_common_stool',-2.6,fy,-2.55,0],['islander_common_books',w/2-.4,fy,1.6,-PI/2]]);
  for(const z of [-.6,.6,1.8])for(const x of [-1.6,1.6])FURNISH('islander_common_bench',x,fy,z,PI);
  FURNISH_HANG('islander_common_hanging',0,fy+2.3+.9,0,0);
  isNoCut(()=>{isFlag(-7.2,6.5,8.5,{ry:PI});place('fl-breadfruit',8.5,-1,.6,{});});}});
