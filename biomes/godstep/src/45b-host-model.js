// ================================================================= HOST — the ground model: THE STAIR (station 1)
// PLAN.md sections 1, 2, 4 and 7 (station 1) on scale model 5.1: front 1, where the head step (Virstostepos, ~3,120 m) falls ~700 m
// to step 2 (Secondostepos, ~2,430 m). On the model the fall is a 5 deg ramp ~12 km long; at the kit's scale it is THE TRAP STAIR,
// a staircase of ponded flow fronts, each flow a bench over its colonnade (PLAN.md section 1, "The fronts"). The page's frame:
// x east, z south, origin at 5.1 px 903,1116; DOWN the valley's axis (ENE, downstream), ACROSS to its right. Every form is a
// core/terrain record composed by KRELIEF.apply:
//   THE STAIR    KRELIEF.stair (core's form for this valley): the two steps' ponded floors, the front's lobate lip wandering across
//                the valley, terraced on its own flows' tops (flowTops), and its TONGUES: the old frozen lava falls where a flow
//                poured over the lip and ran on down the stair
//   THE TILT     the floors fall 1.8 m/km downstream (the model's sculpt), with low swells
//   THE CONES    three old scoria cones standing out of step 2's black sand (refs/08, Maelifell): moss on their north faces
//   THE FLOWS    four eruptions frozen by core's lava module AT BUILD TIME (KLAVA.bakeLayers: bake-flows.js, flows.json): two
//                lobes on the head step from upstream, two breakouts on step 2's floor from the tube's line; every flow is old
//                (the owner, 2026-11-03): their shape and order, no fresh glass
//   THE TUMULI   KRELIEF.tumuli on the bake's ponded lobes: tumuli and pressure ridges, each split by its axial crack
//   THE SAND     black sand on step 2's floor, in transverse dunes across the down-valley wind, round the cones and off the flows
//   THE PLAYA    a small pan behind a lobe on the head step (PLAN.md section 4: kit-scale ponds below the model's 2 km cell)
//   THE PATH     the procession's way (Godostera, PLAN.md section 5): cairned down the benches by the nearest frozen fall
// THE ROCK is the stair's own flows (KSTRATA formations on KRELIEF.stair's flowTops: each a ponded flow in colonnade and
// entablature), the bake's thin flows on top at the lip (KLAVA.column, core's owed item 1): a front's wall shows the flows the
// plain is made of. Under the dry-cold line, so every bead parting is palagonite.
/*FLOWS-INPUT-BEGIN: what the flows' bake reads (build.py runs bake-flows.js on this block when it changes) */
const DOWN=[.9611,-.2764],ACROSS=[.2764,.9611],ST={y1:3138,y2:2428,lip:-1600,tilt:.0018,slope:13.3};
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
const STAIR=KRELIEF.stair({a:xzDA(-6000,0),b:xzDA(6000,0),steps:[{y:ST.y1,at:6000+ST.lip},{y:ST.y2,at:6000+ST.lip+5000}],w:6000,
 lobes:{amp:420,wave:2300},slope:ST.slope,tongues:{per:.45,len:[350,900],w:[90,240]},flows:[18,62],riser:.1,colonnade:.42,wrinkle:1.2,seed:KR.hash(WORLD,1,0,0x5747)});
// the floors' tilt and swells (a few metres over kilometres: the ponded plains are nearly flat)
const swell=(x,z)=>-ST.tilt*dOf(x,z)+6*(fb(x*.00035,z*.00035,2,WORLD+30)-.5)+1.2*(vn(x*.02,z*.02,WORLD+31)-.5);
// THE OLD CONES on step 2's floor: [d, a, h, r]
const CONES=[[2950,-1750,95,520],[3850,950,62,360],[2350,2650,40,260]].map((v,i)=>{const p=xzDA(v[0],v[1]);
 return{i,x:p[0],z:p[1],h:v[2],r:v[3],name:'An old scoria cone in the black sand (moss on its north face)',
  f:KRELIEF.volcano({c:p,h:v[2],r:v[3],k:1.3,crater:{r:v[3]*.2,d:v[2]*.22},gullies:11,gully:.07,seed:KR.hash(WORLD,7,i,0x0C0)%997+1})};});
const flowH0=(x,z)=>{let y=KRELIEF.shape(STAIR,x,z,-1e9)+swell(x,z);for(const C of CONES)y+=C.f(x,z);return y;};
const FLOW_BAKE={box:[-5200,-5200,5200,5200],cell:40,seed:KR.hash(WORLD,10,0,0xF10),
 /* oldest first: two lobes on the head step from upstream (the vent's way), two breakouts on step 2's floor */
 eruptions:[[xzDA(-4300,-1500),260,86400],[xzDA(-4200,900),220,86400],[xzDA(1900,-2900),200,64800],[xzDA(1850,1900),170,64800]]
  .map(s=>({x:s[0][0],z:s[0][1],r:60,Q:s[1],duration:s[2],T:1420}))};
/*FLOWS-INPUT-END*/
// THE FLOWS (the committed bake, inlined as FLOWS_DATA; run here only on a page built without node, ~a minute)
const FLOWS=(function(){
 const B=typeof FLOWS_DATA!=='undefined'?(function(D){const u16=KFIELD.unb64(D.dh,Uint16Array),dh=new Float32Array(u16.length);for(let k=0;k<dh.length;k++)dh[k]=u16[k]/100;
   return{dh,age:KFIELD.unb64(D.age,Uint8Array),nx:D.nx,nz:D.nz,x0:D.x0,z0:D.z0,cell:D.cell,eruptions:D.eruptions,lip:D.lip||[],from:'flows.json'};})(FLOWS_DATA)
  :(function(){const b=KLAVA.bakeLayers(Object.assign({h:flowH0},FLOW_BAKE));b.lip=[];b.from='page';return b;})();
 const nx=B.nx,nz=B.nz,cell=B.cell;
 const bil=(A,x,z)=>{const u=clamp((x-B.x0)/cell,0,nx-1.001),v=clamp((z-B.z0)/cell,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+nx]*(1-fu)*fv+A[k+nx+1]*fu*fv;};
 const ageAt=(x,z)=>{const i=Math.round((x-B.x0)/cell),j=Math.round((z-B.z0)/cell);return i<0||j<0||i>=nx||j>=nz?0:B.age[j*nx+i];};
 return{B,dh:(x,z)=>bil(B.dh,x,z),age:ageAt,ms:0};})();
window._flowsMs=FLOWS.ms;
const flowGround=(x,z)=>flowH0(x,z)+FLOWS.dh(x,z);
// THE TUMULI (core/terrain 38b): on the bake's ponded lobes, pressure ridges at their margins
const TUMULI=KRELIEF.tumuli({field:FLOWS.B,world:WORLD,cell:70,p:.5,minDh:1.2,flat:.07,size:[12,38],height:[1.5,5]});
// THE LIP: where the head step's floor gives way to the front, on the axis (the station's first view stands on it)
const LIP=(function(){let d0=ST.lip-800;for(let d=ST.lip-800;d<ST.lip+800;d+=4){const p=xzDA(d,0),c=KRELIEF.at(STAIR,p[0],p[1],-1e9);if(c&&c.part!=='top'){d0=d;break;}}
 const p=xzDA(d0-14,0);return{x:p[0],z:p[1],d:d0-14,a:0};})();
// the front's extent along the axis at a cross-valley position a: [lip d, toe d] (the stair's own profile, probed)
function frontSpan(a){let lip=null,toe=null;for(let d=ST.lip-900;d<ST.lip+4400;d+=6){const p=xzDA(d,a),c=KRELIEF.at(STAIR,p[0],p[1],-1e9);
  if(c&&c.part!=='top'&&lip==null)lip=d;if(lip!=null&&c&&c.part==='top'&&c.step===1){toe=d;break;}}return[lip,toe];}
// THE SAND: black sand on step 2's floor, in transverse dunes across the down-valley wind (wind along DOWN), crests 140-220 m apart
const _toe=new Map();
function toeAt(a){const k=Math.round(a/100);let t=_toe.get(k);if(t==null){const sp=frontSpan(k*100);t=sp[1]==null?ST.lip+3200:sp[1];_toe.set(k,t);}return t;}
function sandAt(x,z){const c=KRELIEF.at(STAIR,x,z,-1e9);if(!c||c.part!=='top'||c.step!==1)return 0;const d=dOf(x,z),a=aOf(x,z),t=toeAt(a);
 let s=smooth(t+60,t+600,d)*smooth(.3,.6,fb(x*.0006,z*.0006,2,WORLD+50));
 for(const C of CONES){const r=Math.hypot(x-C.x,z-C.z)/C.r;s*=smooth(.7,1.25,r)+.35*smooth(1.6,1.0,r)*smooth(.7,1.0,r);}   /* banked against the cones' feet, none on them */
 return clamp(s*(1-smooth(.6,2.5,FLOWS.dh(x,z))),0,1);}
function duneH(x,z,s){if(s<=0)return 0;const d=dOf(x,z),a=aOf(x,z),ph=(d+70*(fb(a*.0011,d*.0004,2,WORLD+51)-.5)*2+30*Math.sin(a*.004))/180,f=ph-Math.floor(ph);
 const prof=f<.78?smooth(0,.78,f):1-smooth(.78,1,f);return s*(2.5+5*fb(x*.0008,z*.0008,2,WORLD+52))*prof;}
// THE PLAYA: a pan behind a lobe on the head step (its floor dry, a meltwater pond in its lowest part this late in the winter)
const PLAYA=(function(){const p=xzDA(-3350,1900),r=430;return{x:p[0],z:p[1],r,floor:null,name:'A small playa behind a lobe on the head step (its meltwater pond iced over)'};})();
function playaW(x,z){return smooth(1.05,.75,Math.hypot(x-PLAYA.x,z-PLAYA.z)/PLAYA.r);}
// THE PATH: the procession's way (Godostera), from the head step down the nearest frozen fall to step 2's floor, cairned
const PATH=(function(){const T=STAIR.steps[0].tongues.slice().sort((p,q)=>Math.abs(p.q-300)-Math.abs(q.q-300))[0],q=T?T.q:0,sp=frontSpan(q);
 const pts=[xzDA(-4300,-900),xzDA(-3000,-400),xzDA(sp[0]-160,q*.6),xzDA(sp[0]-20,q)];
 for(let d=sp[0]+120;d<(sp[1]||sp[0]+3000);d+=260)pts.push(xzDA(d,q+40*Math.sin(d*.01)));
 pts.push(xzDA((sp[1]||sp[0]+3000)+500,q+300),xzDA(4500,q+900));return{pts,q,name:'The procession\'s way (Godostera): cairned down the god\'s stair'};})();
function pathD(x,z){let best=1e9;const P=PATH.pts;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
 const t=l2?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0,e=Math.hypot(x-ax-dx*t,z-az-dz*t);if(e<best)best=e;}return best;}
// THE GROUND: the stair, the bake, the tumuli, the dunes, the pan
/* the tumuli filed in core/space (KSPACE) so a point reads only those over it, in KRELIEF.apply's order (the index keeps insertion order) */
const TUMSP=(function(){const S=KSPACE.create({cell:80});TUMULI.forEach(T=>S.insert(T,T.x,T.z,T.L/2+1));return S;})(),_tq=[];
const _g1=(x,z)=>{let g=flowGround(x,z);TUMSP.query(x,z,0,_tq);for(let i=0;i<_tq.length;i++)g=KRELIEF.shape(_tq[i],x,z,g);return g;};
PLAYA.floor=_g1(PLAYA.x,PLAYA.z)-3.2;
function localH(x,z){let y=_g1(x,z);const s=sandAt(x,z);if(s>0)y+=duneH(x,z,s);
 const w=playaW(x,z);if(w>0){const r=Math.hypot(x-PLAYA.x,z-PLAYA.z)/PLAYA.r;y=mix(y,Math.min(y,PLAYA.floor+5*smooth(.55,1.05,r)),w);}
 /* the lobe that dams it: a low tongue across its down-valley side */
 {const dd=dOf(x,z)-dOf(PLAYA.x,PLAYA.z)-PLAYA.r*1.05,aa=aOf(x,z)-aOf(PLAYA.x,PLAYA.z);y+=4.5*Math.exp(-dd*dd/9000)*smooth(PLAYA.r*1.6,PLAYA.r*.6,Math.abs(aa));}
 return y;}
/* past the map the scale model's own relief (src/region.json, 45a5-host-region.js): the far country is 5.1's (the Godthrone's mass to the
   south-west, the north arm, the valley falling on to step 3) */
function baseH(x,z){const g=localH(x,z);return REGION?REGION.blend(g,x,z,5300,9600,REGION.y0):g;}
// THE ROCK: the stair's flows as formations (each a ponded flow: tibasalt-ponded's colonnade and entablature), the bake's flows at the
// lip on top (KLAVA.column, from the bake), the older pile beneath; the beds dip with the floors' tilt
const STRATA=(function(){const F=[],T=STAIR.flowTops;let prev=STAIR.flowBase-600;F.push({recipe:'godstep-ponded',base:prev,top:STAIR.flowBase});prev=STAIR.flowBase;
 for(const t of T){if(t-prev<1)continue;F.push({recipe:'godstep-ponded',base:prev,top:t});prev=t;}
 for(const c of FLOWS.B.lip||[]){if(c.th<.3)continue;F.push({recipe:c.th>=4?'godstep-ponded':'godstep-thin',base:prev,top:prev+c.th});prev+=c.th;}
 F.push({recipe:'godstep-thin',base:prev,top:prev+400});
 return KSTRATA.create({seed:KR.hash(WORLD,0,1,0x57A7),formations:F,range:[STAIR.flowBase-600,prev+400],dip:[DOWN[0],DOWN[1],ST.tilt],warp:[0,0],wash:{m:2},regolith:.4,dust:0x2e2a26});})();
// what the kit asks of a point (45c caches them): the stair's part, the flow's age, the sand, the cones, the pan, the path
const MODEL={fieldsAt(x,z,sl,hollow,o,y,north){const c=KRELIEF.at(STAIR,x,z,-1e9),part=c?c.part:'top',step=c?c.step:0,d=dOf(x,z);
  const dh=FLOWS.dh(x,z),age=FLOWS.age(x,z),onFront=part==='front'||part==='tongue';
  o.face=onFront?smooth(.55,1.0,sl):0;
  /* talus: under every riser (the bench below a colonnade carries its fallen columns), heaviest at the front's toe */
  const up=baseH(x-DOWN[0]*40,z-DOWN[1]*40),rise=up-y;o.talus=clamp(smooth(10,34,rise)*smooth(.75,.35,sl)*(onFront||step===1?1:.3),0,1);
  let cone=0,coneN=0;for(const C of CONES){const r=Math.hypot(x-C.x,z-C.z)/C.r;if(r<1.05){cone=Math.max(cone,smooth(1.05,.85,r));}}
  o.sand=sandAt(x,z);o.cone=cone;
  /* moss skins: the cones' north faces (and their foot in the sand's lee), bright, nowhere else on this cold-desert floor (refs/08) */
  o.moss=clamp(cone*smooth(.08,.5,north)*smooth(.04,.18,sl)*(.55+.45*vn(x*.03,z*.03,WORLD+60)),0,1);
  /* the old flows' skin: the baked lobes darker (the ilmenite holds), older ground browner, orange palagonite rinds in patches */
  o.skin=clamp(smooth(.5,2.5,dh)*(1-o.sand),0,1);
  o.palag=clamp(smooth(.58,.78,fb(x*.009,z*.009,2,WORLD+61))*smooth(.6,.2,sl)*(1-o.sand)*(1-cone)*(.6+.4*(1-o.skin)),0,1)*.75;
  o.soil=clamp((.25+.6*hollow)*smooth(.5,.15,sl)*(1-o.skin*.7)*(1-o.sand)*(1-cone),0,1);
  o.lichen=clamp(smooth(.55,.25,sl)*(1-o.sand)*smooth(.35,.7,vn(x*.012,z*.012,WORLD+62))*(.5+.5*(1-o.skin)),0,1)*.6;
  /* late winter (the station's season): snow on the upper benches and the head step's hollows and lee, none below ~2,850 m */
  o.snow=clamp(smooth(2830,3020,y)*((onFront&&sl<.45?.6:.0)+.55*hollow+.25*smooth(.1,.6,north))*smooth(.85,.4,sl)*smooth(.15,.65,vn(x*.012,z*.012,WORLD+63)),0,1);
  o.playa=playaW(x,z);o.path=Math.exp(-Math.pow(pathD(x,z)/3.2,2));
  o.flow=dh;o.age=age;o.step=step;o.part=part;return o;},
 farColor(x,z,h,sl,c,K){return c;},
 after(){}};
