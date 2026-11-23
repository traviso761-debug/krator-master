// ================================================================= THE BEACON - the build: the house and the fort on their levels (the build's step 1)
// Everything is drawn from the layout (src/30-bc-layout.js as 89b0: BEACON_LAYOUT), on the site's levels (89zs: BC):
//   - the Sultan's watch fort (kits/xanadu 80g xa_fort_watch, read in place) on the knoll's crown, turned half round so its gate
//     faces north to the order, its keep's place on the lamp (0,0), placed with beacon:'ancient': 80g draws the keep as the LAMP
//     PLINTH (the keep's footing, three white storeys, the Chapel of the Beacon in yellow with its gilt corners and finial, the
//     lamp's ring and yoke on the roof) and records the lamp's centre in window._xaBeacons;
//   - the Yellow Monastery: the Qiblai kit's great monastery in the gold dress (qb_monastery, o.v 2), its gate south to the lamp;
//   - the order's other buildings (bc_block: a stack per layout part, its storeys, windows, door, parapet roof), the precinct wall
//     and Gyantse's two walls (bc_wall: 80g's xfCurtain), the Lamp Stair, the courts and the kora garden, the Chorten of the
//     Keepers, the oil pit, the cable's channel;
//   - the lamp head (kits/ancients' anc_beacon_lamp, B5, mounted by 80g on the plinth's yoke) and its beam, turned by the lamp's night
//     (src/40-bc-lamp.js as 89b2: BEACON_LAMP.state) at the page's hour.
// [web]: three.js.
const BC_B0=performance.now();
const BCL=BEACON_LAYOUT,BCD=BCL.draw,BC_SP=QSPOKE[BCD.spoke];
const BC_GRP=new THREE.Group();BC_GRP.name='The Beacon';scene.add(BC_GRP);
const bcPart=id=>BCL.parts.find(p=>p.id===id);
const bcMid=b=>[(b[2]+b[3])/2,(b[0]+b[1])/2];   /* a layout box's middle on the page: [x (v), z (u)] */
const XTAG_BC=(type,more)=>Object.assign({type:[type],wealth:'civic',lit:true},more||{});
// ---------------------------------------------------------------- the order's buildings, walls, stair and grounds as defs (registered in core/tags as they draw)
const BC_HOLY=['hall_of_lights','butter_lamps','lamp_school','refectory','chamber'],BC_EARTH=['generator','workshop'];
function bcBlockBuild(G,o){const p=bcPart(o.part),i=BCL.parts.indexOf(p);reseed(34100+i);
 const w=p.box[3]-p.box[2],d=p.box[1]-p.box[0],n=p.storeys==null?1:p.storeys,gate=p.kind==='gatehouse',hs=[];for(let k=0;k<n;k++)hs.push(gate&&k===0?5.2:BCD.storey);
 const H=hs.reduce((a,b)=>a+b,0),holy=BC_HOLY.indexOf(p.kind)>=0,earth=BC_EARTH.indexOf(p.kind)>=0,lab=p.kind==='labrang';
 const col=earth?xC(xPick(XPAL.earth)):holy?xC(BC_SP.wall).multiplyScalar(rr(.96,1.02)):xC(xPick(XPAL.wash)),band=holy||lab||gate?xC(BC_SP.band):xC(xPick(XPAL.maroon));
 vnReg(p.name,0,0,Math.max(w,d)/2,H+1.5,{part:p.kind});
 const P0=qnPlinth(0,0,w,d,.6,0,xC(xPick(QSTONE))),S=qnStack(0,P0,0,w-.4,d-.4,0,hs,col,earth?'earth':'wash',xC(XPAL.white));
 /* the door: on the face toward the precinct's axis (v 0) for a side building, else south; a gatehouse through both faces */
 const [mx]=bcMid(p.box),face=gate?'z':Math.abs(mx)>18?(mx>0?'-x':'+x'):'+z';
 qnWins(0,P0,0,w-.4,d-.4,0,hs,S.k,{pitch:lab?2.4:3,trim:xC(XPAL.red),kind:xLit()?'lit':'glass',skip:face==='+z'||face==='z'?[[-2,2]]:[],skipBack:face==='z'?[[-2,2]]:[],val:holy||lab?'all':true});
 const door=(fz,fx,ry)=>qnDoor(fx*((w-.4)/2+.04),P0,fz*((d-.4)/2+.04),ry,gate?3.2:1.7,gate?3.6:2.5,{c:xC(XPAL.red)});
 if(face==='z'){door(1,0,0);door(-1,0,Math.PI);}else if(face==='+z')door(1,0,0);else if(face==='+x')door(0,1,Math.PI/2);else door(0,-1,-Math.PI/2);
 qnRoof(0,S.y,0,S.w,S.d,0,col,{band,gold:holy||lab,corner:holy||lab?'gold':undefined,parapet:.7});
 if(lab)vB('xBandB',0,S.y-BCD.storey+.2,S.d/2+.05,S.w*.9,.4,.12,0,xC(xPick(XPAL.gold)));   /* the Window of Light's gilt sill, south */
 if(p.kind==='generator'){for(const s of[-1,1])vB('vIron',s*w*.25,S.y,-d*.2,.45,4.5,.45,0,xC(0x2e2a26));}}   /* the engines' exhausts */
XA.def({key:'bc_block',name:'The Beacon - a building of the order',family:'The Beacon',tags:XTAG_BC('religious'),w:24,d:24,h:18,nv:1,build:bcBlockBuild});
function bcWallBuild(G,o){reseed(34300+(o.n|0));const C=xfCols('march'),c={id:'bc.wall',a:o.a,b:o.b,t:o.t,out:o.out};
 vnReg(o.name,(o.a[0]+o.b[0])/2,(o.a[1]+o.b[1])/2,Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1])/2,o.h+1.3,{part:'wall'});xfCurtain(c,0,1,o.h,C,{merlons:!!o.merlons});}
XA.def({key:'bc_wall',name:'The Beacon - a wall of the order',family:'The Beacon',tags:XTAG_BC('religious'),w:20,d:4,h:8,nv:1,build:bcWallBuild});
function bcStairBuild(G,o){reseed(34400);const n=Math.max(2,Math.round(o.rise/.17)),tr=o.run/n,st=xC(xPick(QSTONE));
 vnReg('The Lamp Stair',0,o.run/2,o.run/2,o.rise,{part:'stair'});
 for(let k=0;k<n;k++)vB('vStone',0,0,(k+.5)*tr,o.w,o.rise*(k+1)/n,tr+.01,0,st);
 for(const s of[-1,1])for(let k=0;k<n;k+=6)vB('vStone',s*(o.w/2+.25),0,(k+.5)*tr,.5,o.rise*(k+1)/n+.6,tr*6,0,st.clone().multiplyScalar(.92));}   /* the low side walls */
XA.def({key:'bc_stair',name:'The Beacon - the Lamp Stair',family:'The Beacon',tags:XTAG_BC('infrastructure'),w:6,d:26,h:10,nv:1,build:bcStairBuild});
function bcGroundBuild(G,o){const p=bcPart(o.part),i=BCL.parts.indexOf(p);reseed(34500+i);const w=p.box[3]-p.box[2],d=p.box[1]-p.box[0];
 vnReg(p.name,0,0,Math.max(w,d)/2,1,{part:p.kind});
 /* the garden's trees as xnTree's own fallback draws them (a trunk, five leaf puffs), not through the biome's plants: those
    register plant volumes the biome fills elsewhere, empty on this page */
 const tree=(x,z,h)=>{vPst('vPostB',x,0,z,.14,h*.5,xC(0x5a4632));const c=xC(xPick(XPAL.leaf));for(let i=0;i<5;i++)kput('xLeaf',[x+rr(-.7,.7),h*.62+rr(-.3,.5),z+rr(-.7,.7)],qEuler(rng(),rng(),0),[rr(.9,1.4),rr(.8,1.1),rr(.9,1.4)],c.clone().multiplyScalar(rr(.85,1.1)));};
 if(p.kind==='garden'){vB('vStone',0,0,0,w,.06,d,0,xC(0x6f7a4a));for(let k=0;k<6;k++)tree(-w*.35+w*.7*(k%3)/2,(k<3?-1:1)*d*.28,rr(5,7));
  for(let k=-3;k<=3;k++)kput('xDrumE',[k*w/8,0,0],null,[.7,1.4,.7],xC(XPAL.red));}   /* the kora's arcade of prayer wheels across the garden */
 else if(p.kind==='oil_pit'){const r=xC(xPick(XPAL.rubble));vB('xRubB',0,-1.6,0,w-1.2,.1,d-1.2,0,xC(0x1c1a18));for(const e of[[0,d/2,w,.6],[0,-d/2,w,.6],[w/2,0,.6,d],[-w/2,0,.6,d]])vB('xRubB',e[0],0,e[1],e[2],.8,e[3],0,r);}
 else if(p.kind==='chorten'){qnChorten(0,0,0,.9);}
 else vB('vStone',0,0,0,w,.07,d,0,xC(p.kind==='yard'?0x9a8a6c:0xb8ae98));}   /* courts and the plaza paved, the novices' yard beaten earth */
XA.def({key:'bc_ground',name:'The Beacon - a court of the order',family:'The Beacon',tags:XTAG_BC('infrastructure'),w:20,d:20,h:2,nv:1,build:bcGroundBuild});
function bcCableBuild(G,o){reseed(34600);const P=BCL.cable.pts,c=xC(0x3a3632);
 {const xs=P.map(p=>p[1]),zs=P.map(p=>p[0]),mx=(Math.min(...xs)+Math.max(...xs))/2,mz=(Math.min(...zs)+Math.max(...zs))/2,r=Math.max(...P.map(p=>Math.hypot(p[1]-mx,p[0]-mz)));
  vnReg('the cable\'s channel',mx,mz,r,Math.max(...o.y0)-o.y+.4,{part:'cable'});}   /* a volume round the whole run, from the channel's lowest point */
 for(let i=0;i+1<P.length;i++){const a=[P[i][1],P[i][0]],b=[P[i+1][1],P[i+1][0]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1]);
  vB('vStone',(a[0]+b[0])/2,(o.y0[i]+o.y0[i+1])/2-o.y,(a[1]+b[1])/2,.6,.12,L,ry,c);}}
XA.def({key:'bc_cable',name:'The Beacon - the cable\'s channel',family:'The Beacon',tags:XTAG_BC('infrastructure'),w:4,d:40,h:1,nv:1,build:bcCableBuild});
// ---------------------------------------------------------------- placing
const BC_PLACED={};
/* the buildings that hold rooms (B8, 90w): while each draws, kits/qiblai's QB_SHELLREC lists its storey stacks (qnStack, and the
   fort's xnStack), in its own frame; 90w plans its interior on them */
const BC_IXREC=[];
function bcPlace(key,x,z,ry,o,type){TSTAT.cur=(type||key)+'/0';const r0=REG.length,rec=key==='bc_block'||key==='xa_fort_watch'?[]:null;QB_SHELLREC.cur=rec;
 let g;try{g=VERN.place(BC_GRP,key,x,z,ry,o);}finally{QB_SHELLREC.cur=null;}
 if(rec)BC_IXREC.push({key,part:o&&o.part||(key==='xa_fort_watch'?'plinth':null),x,z,ry,y:o&&o.y,list:rec});for(let i=r0;i<REG.length;i++)REG[i].type=type||key;TSTAT.cur=null;BC_PLACED[key]=(BC_PLACED[key]|0)+1;return g;}
/* the fort: its keep's place on the lamp, turned half round (its gate north), on the crown */
{const n0=(window._xaBeacons||[]).length;BC.fortG=bcPlace('xa_fort_watch',0,-6.6,Math.PI,{v:0,y:BC.F,seed:20261123,beacon:'ancient'});
 /* the plinth's record (80g xfPlinth, pushed as the fort drew): the lamp's centre in the world, and its roof (the chapel's top) under it */
 BC.lampRec=(window._xaBeacons||[])[n0]||null;}
if(BC.lampRec)BC.plinthTop=BC.lampRec.at[1]-(BC.lampRec.lampH-BC.lampRec.roof);
/* the Yellow Monastery on the saddle, its gate south to the lamp */
{const m=bcPart('monastery'),[mx,mz]=bcMid(m.box);BC.monG=bcPlace('qb_monastery',mx,mz,0,{v:m.host.v,y:BC.level(mz)});}
/* the order's buildings, courts and pits */
const BC_BLOCKS=['gatehouse','guest_hall','store','labrang','kitchen','novices','chamber','infirmary','lamp_school','hall_of_lights','butter_lamps','refectory','generator','workshop'];
const BC_GROUNDS=['court','garden','yard','oil_pit','chorten'];
BCL.parts.forEach(p=>{if(p.zone!=='precinct'&&p.zone!=='lampward')return;const [x,z]=bcMid(p.box);
 if(BC_BLOCKS.indexOf(p.kind)>=0)bcPlace('bc_block',x,z,0,{part:p.id,y:BC.level(z)});else if(BC_GROUNDS.indexOf(p.kind)>=0)bcPlace('bc_ground',x,z,0,{part:p.id,y:BC.level(z)});});
/* the walls: the precinct's (no walk; its gates' gaps) and Gyantse's two (with walks), stepped down the lamp ward's slope */
{const W=id=>BCL.walls.find(w=>w.id===id),PW=BCD.precinctWall,JW=BCD.joinWall,G=id=>BCL.gates.find(g=>g.id===id),pg=(a)=>[a[1],a[0]];let n=0;
 const run=(a,b,h,t,out,merlons,name)=>{const y=Math.min(BC.level(a[1]),BC.level(b[1]));bcPlace('bc_wall',0,0,0,{a,b,h:h+(Math.max(BC.level(a[1]),BC.level(b[1]))-y),t,out,merlons,name,n:n++,y});};
 const cut=(w,out,merlons,gap,h,t)=>{const a=pg(w.a),b=pg(w.b),L=Math.hypot(b[0]-a[0],b[1]-a[1]);let s=[[0,1]];
  if(gap){const g=gap,ga=pg(g.at),f=((ga[0]-a[0])*(b[0]-a[0])+(ga[1]-a[1])*(b[1]-a[1]))/(L*L),hw=(g.half)/L;s=[[0,f-hw],[f+hw,1]];}
  s.forEach(([u0,u1])=>{const steps=w.join?5:1;for(let k=0;k<steps;k++){const v0=u0+(u1-u0)*k/steps,v1=u0+(u1-u0)*(k+1)/steps;
   run([a[0]+(b[0]-a[0])*v0,a[1]+(b[1]-a[1])*v0],[a[0]+(b[0]-a[0])*v1,a[1]+(b[1]-a[1])*v1],h,t,out,merlons,w.id);}});};
 cut(W('precinct.n'),[0,-1],false,{at:G('gate.road').at,half:7},PW.h,PW.t);
 cut(W('precinct.e'),[1,0],false,null,PW.h,PW.t);
 cut(W('precinct.w'),[-1,0],false,null,PW.h,PW.t);
 cut(W('precinct.s'),[0,1],false,{at:G('gate.lamp').at,half:5},PW.h,PW.t);
 /* Gyantse's walls: the normal away from the lamp ward (west for the west wall, east for the east) */
 for(const id of['join.w','join.e']){const w=W(id),a=pg(w.a),b=pg(w.b),dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
  const out=id==='join.w'?[-dz/L,dx/L]:[dz/L,-dx/L];
  cut(w,out,true,id==='join.w'?{at:G('gate.ward').at,half:2.5}:null,JW.h,JW.t);}}
/* the Lamp Stair: up the knoll's north face from the Gate of the Lamp to the gate plaza */
{const s=bcPart('stair'),z0=s.box[0],z1=s.box[1];bcPlace('bc_stair',0,z0,0,{y:BC.level(z0),w:s.box[3]-s.box[2],run:z1-z0,rise:BC.level(z1)-BC.level(z0)});}
/* the cable in its stone channel, from the engines to the plinth under the fort's gate */
{const P=BCL.cable.pts,y0=P.map(p=>terrainH(p[1],p[0])+.05),y=Math.min(...y0);bcPlace('bc_cable',0,0,0,{y,y0});}
kbake(BC_GRP);if(typeof xaDoorsBind==='function')xaDoorsBind();
// ---------------------------------------------------------------- the lamp head (kits/ancients anc_beacon_lamp, B5), driven by the lamp's night
/* 80g's plinth mounts ANC_BEACON_LAMP on its yoke (kits/ancients/pieces/89p, on the page through kit.json): the handle is the
   record's lamp. The page holds it ('hold') on the bearing BEACON_LAMP.state gives each frame (its sweep, its signal slots), its
   shutters on the signal book's flashes, its beam on the lamp's night. A compass bearing b is the head's yaw pi - b in the world,
   less the fort's own yaw (the fort turned half round: -b) */
const BC_LAMP=BC.lampRec&&BC.lampRec.lamp||null;
const BC_FORTYAW=(function(){if(!BC_LAMP)return 0;BC_LAMP.root.updateWorldMatrix(true,false);const q=new THREE.Quaternion();BC_LAMP.root.getWorldQuaternion(q);return new THREE.Euler().setFromQuaternion(q,'YXZ').y;})();
/* the lamp's night is core/atmos's evening (ATMOS.night: dusk 17.2-18.8 h, dawn 5.5-7.2 h): lit while it is half dark or more,
   about 18:00 to 06:21; the engines run (the sim's oil, when the house is on the open world: B7) */
const BC_ENV={night:t=>ATMOS.night(bcHourAt(t))>=.5,engines:()=>true};
const bcClock=bcClockS;
function bcLampTick(){const t=bcClock(),s=BEACON_LAMP.state(t,BC_ENV);
 if(BC_LAMP){const o={on:s.lit,shutter:s.lit&&s.shutter?0:1,mode:'hold',night:()=>BC_ENV.night(bcClock())};
  if(s.bearing!=null){o.bearing=Math.PI-s.bearing*Math.PI/180-BC_FORTYAW;o.tilt=(s.elevation||0)*Math.PI/180;}BC_LAMP.set(o);}
 window._beaconLamp={lit:s.lit,mode:s.mode,bearing:s.bearing==null?null:Math.round(s.bearing*10)/10,station:s.station,keepers:s.keepers,shutter:!!s.shutter};}
FRAME_HOOKS.push(bcLampTick);bcLampTick();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
Object.defineProperty(window,'_registered',{get:()=>REG.length,configurable:true});   /* live: 90-scene's count was taken before the house, the grounds and the Rim Post registered */
window._buildMs=Math.round(performance.now()-BC_B0);
/* the page's record (the verify's): what was placed, the levels under the fort's and the precinct's corners, the plinth's top, the rules */
window._beacon=Object.assign({},window._beaconSite,{placed:BC_PLACED,fort:!!BC.fortG,monastery:!!BC.monG,plinthTop:BC.plinthTop==null?null:Math.round(BC.plinthTop*100)/100,lampAt:BC.lampRec?BC.lampRec.at.map(v=>Math.round(v*100)/100):null,
 lampY:BC.lampRec?Math.round(BC.lampRec.at[1]*100)/100:null,head:!!BC_LAMP,
 fortGround:[[-28,-28],[28,-28],[28,14],[-28,14],[0,0]].map(p=>Math.round(terrainH(p[0],p[1])*100)/100),
 precinctGround:[[-58,-238],[58,-238],[58,-70],[-58,-70],[0,-160]].map(p=>Math.round(terrainH(p[0],p[1])*100)/100),
 rules:BEACON.checks(BCL).filter(c=>!c.pass).map(c=>c.name+': '+c.detail),forts:(window._xaForts||[]).length});
