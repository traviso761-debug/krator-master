// ================================================================= HOST — the ground model: THE RILLE (station 2)
// PLAN.md sections 1 ("The tubes and the rilles"), 2, 4 and 7 (station 2) on scale model 5.1. The page's frame: x east, z south, origin at
// 5.1 px 902,1140 on tube_god_07's mapped path; DOWN the path's bearing (ENE, downstream from the vent pit), ACROSS to its right. Every form
// is a core/terrain record:
//   THE PLAIN    the head step's ponded plain as the model draws it (REGION: 5.1's relief, ~2,990 m here, the Godthrone's foot rising to the
//                south-east corner), with low swells
//   THE TUBE'S LINE  one KRELIEF.meander along the mapped path, the whole map's length: upstream of LINE.end it is the rille, downstream the tube
//   THE RILLE    KRELIEF.rille (core's canyon): ~1 km rim to rim, ~120 m deep, its floor never climbing downstream; its walls the ponded
//                flows' colonnades stepping back at each flow's top (the rille's `tops` are the strata's flow tops: one stack), a broad
//                talus apron of fallen columns below; it ends in a rounded head wall where the roof still stands
//   THE TUBE     KRELIEF.tube past the rille's end: tube_god_07's record (48 m wide, its crown 55 m under the plain; KRELIEF.tube makes it
//                1.7 r high, so its roof argument is set to put the floor 83 m down: the crown of the record's 28 m bore is then 55 m down),
//                its pit chain (collapses and skylights); KRELIEF.tubeRille on it: one fresh collapse by hand (a trench to the floor) and
//                the skylights where its roof is thin enough to read through. One skylight is THE WALKED ONE (WALK): the Talovolci's way
//                down into the tube, drawn by KCAVERN (87-host-tube.js); no pit of the chain stands within 200 m of it
//   THE SPRING   at a palagonite parting in the rille's north-west wall (the partings are the aquitards that carry the Godthrone's melt
//                under the plain: PLAN.md section 2), its stream down the talus to the floor and along it to the head wall's talus, where it
//                sinks; core/water's flow (WATER.flow, drawn in 89w) is made here so the fields and the kit's pass read the same line
//   THE FIELDS   the Talovolci's red stalk fields on the floor under the spring, either side of the stream: polygons painted on a core/mask
//                canvas (KMASK: rasterised as data, the same bytes in Godot), read back for the field class and the stalks' rows
//   THE PATH     the Talovolci's way: from the fields up the head wall's talus to the plain, along the tube's line to the walked skylight
// THE ROCK is one stack of ponded flows (KSTRATA formations, 'godstep-ponded'), their tops the rille's benches.
const DOWN=[.8395,-.5432],ACROSS=[.5432,.8395];
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
// THE PLAIN
const plainH=(x,z)=>(REGION?REGION.y0+REGION.h(x,z):2990)+4*(fb(x*.0004,z*.0004,2,WORLD+30)-.5)+1.2*(vn(x*.02,z*.02,WORLD+31)-.5);
// THE ROCK: the flows of the head step, bottom up (18-45 m each, KRAND by index), the plain's skin on top
const TOPS=(function(){const T=[];let y=2560;for(let k=0;y<3030;k++){y+=18+27*KR.unit(KR.hash(WORLD,k,2,0x70B5));T.push(Math.round(y*10)/10);}return T;})();
const STRATA=(function(){const F=[];let prev=2400;F.push({recipe:'godstep-ponded',base:prev,top:2560});prev=2560;
 for(const t of TOPS){F.push({recipe:'godstep-ponded',base:prev,top:t});prev=t;}F.push({recipe:'godstep-thin',base:prev,top:prev+600});
 return KSTRATA.create({seed:KR.hash(WORLD,0,2,0x57A7),formations:F,range:[2400,prev+600],dip:[DOWN[0],DOWN[1],0],warp:[0,0],wash:{m:2},regolith:.4,dust:0x2e2a26});})();
// THE TUBE'S LINE: d from -6400 to +6400 along DOWN on the mapped path (it passes 1.38 km to the north-west of the frame's origin: a = LINE.a),
// the rille upstream of LINE.end (d), the roofed tube from LINE.tube0 (past the head wall)
const LINE=(function(){const a=Math.round(aOf((902-902)*2000,(1145-11*9/17-1140)*2000));
 const P=KRELIEF.meander(xzDA(-6400,a),xzDA(6400,a),{amp:140,wave:2600,seed:KR.hash(WORLD,2,1,0x3EA)});return{P,a,end:-40,tube0:640};})();
const RILLE=KRELIEF.rille({pts:LINE.P.filter(p=>dOf(p[0],p[1])<=LINE.end),ground:plainH,w:520,depth:118,floorW:.25,talus:.36,talusA:30,face:74,bench:10,
 tops:TOPS,seed:KR.hash(WORLD,2,2,0x5111)});
// THE TUBE (tube_god_07): r 24 (48 m wide); KRELIEF.tube's height is 1.7 r (40.8 m), so roof 42.2 puts its floor 83 m under the plain: the
// record's 28 m bore (KCAVERN, 87) then has its crown 55 m down, as the record says
const TUBE_REC={id:'tube_god_07',w:48,h:28,roofDown:55,name:'tube_god_07, the Godstep and Pluton master tube (48 m wide, 28 m high, its crown 55 m down)'};
const TUBE=KRELIEF.tube({pts:LINE.P.filter(p=>dOf(p[0],p[1])>=LINE.tube0),ground:plainH,r:24,roof:42.2,ridge:1.6,every:330,p:.5,sky:.4,seed:KR.hash(WORLD,2,3,0x70BE)});
// arc length along the tube's line, and a point at s (x, z, the floor y)
const TLINE=(function(){const P=TUBE.pts,S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z));
 const at=s=>{s=clamp(s,0,S[S.length-1]);let i=0;while(i<S.length-2&&S[i+1]<s)i++;const t=(s-S[i])/((S[i+1]-S[i])||1),a=P[i],b=P[i+1];
  return{x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),y:lerp(a.y,b.y,t),dx:(b.x-a.x)/((S[i+1]-S[i])||1),dz:(b.z-a.z)/((S[i+1]-S[i])||1)};};
 return{S,L:S[S.length-1],at};})();
// THE WALKED SKYLIGHT: 900 m down the roofed tube; its shaft 15 m across at the top (the cavern's), the rim the ground's hole
const WALK=(function(){const s=900,p=TLINE.at(s);return{s,x:p.x,z:p.z,d:[p.dx,p.dz],floor:p.y,r:15,rim:3,name:'The walked skylight (a Tubomoudos: the Talovolci\'s way down into tube_god_07)'};})();
TUBE.pits=TUBE.pits.map(q=>q&&Math.abs(q.s-WALK.s)<200?null:q);   // no pit of the chain beside the walked one (its records stay core's shape)
// THE FRESH COLLAPSE and the skylights (KRELIEF.tubeRille): a span fallen to the floor by hand, skylights where the roof reads thin
const TRIL=KRELIEF.tubeRille(TUBE,{ground:plainH,id:'tube_god_07:collapse',thin:21,spans:[[2050,2260]],widen:1.25,skylight:{every:300,p:.55,under:70},seed:KR.hash(WORLD,2,4,0x5C1)});
TRIL.skylights=TRIL.skylights.filter(q=>Math.abs(q.s-WALK.s)>200);
// THE SPRING: on the north-west wall (ACROSS < 0) at a flow top 50-100 m over the floor (over the talus: on the colonnade), ~1.5 km up the rille from its end
const rilleFloorAt=d=>{let best=null;for(const p of RILLE.pts){const e=Math.abs(dOf(p.x,p.z)-d);if(!best||e<best.e)best={e,p};}return best.p;};
const SPRING=(function(){const d=-1500,c=rilleFloorAt(d),a0=aOf(c.x,c.z),fy=c.y,top=TOPS.filter(t=>t>fy+50&&t<fy+100)[0]||fy+60;let a=a0,y=fy;
 for(let q=0;q<520;q+=1){const p=xzDA(d,a0-q),h=KRELIEF.shape(RILLE,p[0],p[1],plainH(p[0],p[1]));if(h>=top-1){a=a0-q;y=h;break;}}
 const p=xzDA(d,a);return{d,a,x:p[0],z:p[1],y,top,name:'The spring at a palagonite parting (the Godthrone\'s melt, carried under the plain, breaking out of the rille\'s wall)'};})();
const ground0=(x,z)=>{const g=plainH(x,z);return KRELIEF.shape(TRIL,x,z,KRELIEF.shape(TUBE,x,z,KRELIEF.shape(RILLE,x,z,g)));};
// THE STREAM: down the talus from the spring to the floor's middle, then down the floor to the head wall's talus, never climbing
const STREAM=(function(){const pts=[],c0=rilleFloorAt(SPRING.d);const a1=aOf(c0.x,c0.z);
 for(let a=SPRING.a+3;a<a1-14;a+=12){const p=xzDA(SPRING.d+(a-SPRING.a)*.15,a);pts.push([p[0],p[1],ground0(p[0],p[1])]);}
 for(const p of RILLE.pts){const d=dOf(p.x,p.z);if(d<=SPRING.d+30||d>LINE.end-260)continue;pts.push([p.x,p.z,p.y+.1]);}
 /* densify the floor run (every ~40 m) and keep it falling */
 const out=[];for(let i=0;i<pts.length;i++){const a=pts[i];out.push(a);const b=pts[i+1];if(!b)break;const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(L/40);
  for(let k=1;k<n;k++){const t=k/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);out.push([x,z,Math.min(lerp(a[2],b[2],t),ground0(x,z)+.1)]);}}
 for(let i=1;i<out.length;i++)out[i][2]=Math.min(out[i][2],out[i-1][2]-.02);
 return{pts:out,name:'The spring\'s stream (down the talus and the rille\'s floor, sinking into the head wall\'s talus)'};})();
const streamD=(function(){const P=STREAM.pts;return(x,z)=>{let best=1e9;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],dx=P[i+1][0]-ax,dz=P[i+1][1]-az,l2=dx*dx+dz*dz;
 const t=l2?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0,e=Math.hypot(x-ax-dx*t,z-az-dz*t);if(e<best)best=e;}return best;};})();
// the stream as core/water's record (drawn by 89w); its wet field (WATER.fields) is the kit's pass's, made when the pass runs (55)
const STREAM_FLOW=WATER.flow({name:STREAM.name,pts:STREAM.pts,width:STREAM.pts.map((p,i)=>1.6+1.8*smooth(0,STREAM.pts.length,i)),
 speed:STREAM.pts.map((p,i)=>.5+1.6*smooth(.03,.3,i+1<STREAM.pts.length?(p[2]-STREAM.pts[i+1][2])/12:0)),rapids:[.05,.3]});
// THE FIELDS on a core/mask canvas (2 m a pixel over their box): rectangles along the floor, either side of the stream, 70-130 m long
const FIELDS=(function(){const polys=[];let k=0;
 for(let d=SPRING.d+120;d<LINE.end-420;d+=150){for(const side of [-1,1]){const h=KR.hash(WORLD,k++,2,0xF1E1),u=q=>KR.unit(KR.hash(h,q));if(u(1)<.18)continue;
  const c=rilleFloorAt(d+40),ac=aOf(c.x,c.z),L=70+60*u(2),W=26+30*u(3),a0=ac+side*(14+4*u(4)),a1=a0+side*W,d0=d+10*u(5),d1=d0+L;
  polys.push([xzDA(d0,a0),xzDA(d1,a0),xzDA(d1,a1),xzDA(d0,a1)]);}}
 let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;polys.forEach(P=>P.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}));
 x0-=20;z0-=20;x1+=20;z1+=20;const px=2,w=Math.ceil((x1-x0)/px),h=Math.ceil((z1-z0)/px),cv=KMASK.canvas(w,h),g=cv.getContext('2d');
 g.fillStyle='#fff';polys.forEach(P=>{g.beginPath();P.forEach((p,i)=>{const X=(p[0]-x0)/px,Z=(p[1]-z0)/px;if(i)g.lineTo(X,Z);else g.moveTo(X,Z);});g.closePath();g.fill();});
 /* read back through core/mask's own distance transform (0 inside a field): never a canvas's pixels */
 const DT=KMASK.distance(cv,{channel:0,threshold:128});
 const at=(x,z)=>{const i=Math.floor((x-x0)/px),j=Math.floor((z-z0)/px);return i>=0&&j>=0&&i<w&&j<h&&DT.d2[j*w+i]===0;};
 return{polys,at,hash:KMASK.hash(cv),box:[x0,z0,x1,z1],name:'The Talovolci\'s red stalk fields (on the rille\'s floor under the spring)'};})();
STN.exportBox=(function(){const P=FIELDS.polys[Math.floor(FIELDS.polys.length/2)],c=P[0];return[Math.round(c[0]-150),Math.round(c[1]-150),Math.round(c[0]+150),Math.round(c[1]+150)];})();
// THE PATH: from the fields up the head wall's talus to the plain, then along the tube's line to the walked skylight and on to the next pit
const PATH=(function(){const c=rilleFloorAt(LINE.end-500),pts=[[c.x,c.z],xzDA(LINE.end-150,aOf(c.x,c.z)+60),xzDA(LINE.end+280,LINE.a+90),xzDA(LINE.end+620,LINE.a+40)];
 for(let s=40;s<=WALK.s+700;s+=120){const p=TLINE.at(s);pts.push([p.x+(-p.dz)*45,p.z+p.dx*45]);}
 return{pts,name:'The Talovolci\'s way (cairned): out of the rille and along the tube\'s line to the walked skylight'};})();
function pathD(x,z){let best=1e9;const P=PATH.pts;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
 const t=l2?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0,e=Math.hypot(x-ax-dx*t,z-az-dz*t);if(e<best)best=e;}return best;}
// THE GROUND: the plain, the rille, the tube's swell and pits, the fresh collapse; the fields levelled a little and banked
function localH(x,z){let y=ground0(x,z);if(FIELDS.at(x,z))y-=.25;return y;}
function baseH(x,z){const g=localH(x,z);return REGION?REGION.blend(g,x,z,5300,9600,REGION.y0):g;}
// what the kit asks of a point (45c caches them on its 20 m lattice)
const inWalk=(x,z,pad)=>Math.hypot(x-WALK.x,z-WALK.z)<WALK.r+WALK.rim+(pad||0);
const MODEL={fieldsAt(x,z,sl,hollow,o,y,north){const g=plainH(x,z),c=KRELIEF.at(RILLE,x,z,g),part=c?c.part:'plain';
  o.face=smooth(.6,1.05,sl);
  /* talus: the rille's apron (its fallen columns), the pits' and the collapse's feet */
  o.talus=clamp((part==='talus'?smooth(.06,.3,sl)+.35:0)+(part==='bench'?.6:0)+smooth(.25,.5,sl)*(1-o.face)*.6,0,1);
  const sd=streamD(x,z),inF=FIELDS.at(x,z);
  o.stream=1-smooth(2,10,sd);
  o.field=inF?1:0;
  /* the seep: the wall wet below the spring, a stain down the colonnades and the talus to the stream */
  const ds=Math.hypot(x-SPRING.x,z-SPRING.z);o.seep=clamp(smooth(70,8,ds)*(y<SPRING.y+3?1:0)+.6*(1-smooth(3,14,sd))*smooth(.15,.4,sl),0,1);
  /* moss: bright where the spring's water keeps the ground wet (under the spring, along the stream), none on the fields */
  o.moss=clamp(smooth(90,10,ds)*(y<SPRING.y+2?1:0)*.9+(1-smooth(4,26,sd))*.75,0,1)*(inF?0:1);
  o.skin=clamp(part==='plain'?.25+.3*vn(x*.004,z*.004,WORLD+64):0,0,1);
  o.palag=clamp(smooth(.58,.78,fb(x*.009,z*.009,2,WORLD+61))*smooth(.6,.2,sl)*(1-o.field)*(.6+.4*(1-o.skin)),0,1)*.75;
  o.soil=clamp(((part==='floor'?.55:0)+(.25+.6*hollow)*smooth(.5,.15,sl))*(1-o.field),0,1);
  o.lichen=clamp(smooth(.55,.25,sl)*smooth(.35,.7,vn(x*.012,z*.012,WORLD+62))*(part==='plain'?.8:.4)*(1-o.field)*(1-o.moss),0,1)*.6;
  o.snow=0;o.sand=0;o.cone=0;o.flow=0;o.age=0;
  /* the walked skylight's hole and the fields keep the loose stuff off (the kit's passes read playa as "bare of stones") */
  o.hole=inWalk(x,z,6)?1:0;o.playa=clamp(o.hole+o.field+o.stream,0,1);
  o.path=Math.exp(-Math.pow(pathD(x,z)/2.6,2));
  o.part=part;return o;},
 coreFields(F){F.wet=(x,z)=>clamp(F.stream(x,z)*.9+F.seep(x,z)*.7+F.field(x,z)*.6+F.moss(x,z)*.4,0,1);
  F.rock=(x,z)=>smooth(.6,1.2,F.slope(x,z));},
 farColor(x,z,h,sl,c,K){return c;},
 after(){}};
