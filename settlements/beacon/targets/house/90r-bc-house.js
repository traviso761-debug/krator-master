// ================================================================= THE BEACON - the build: the house and the fort on their levels (the build's step 1)
// Everything is drawn from the layout (src/30-bc-layout.js as 89b0: BEACON_LAYOUT), on the site's levels (89zs: BC):
//   - the Sultan's watch fort (kits/xanadu 80g xa_fort_watch, read in place) on the knoll's crown, turned half round so its gate
//     faces north to the order, its keep's place on the lamp (0,0); the keep drawn as the LAMP PLINTH by a shim on 80g's xfKeep
//     (bcPlinth: the keep's footing, three white storeys, the Chapel of the Beacon in the gold spoke's yellow with its gilt
//     corners and finial, the lamp's ring and yoke on the roof) until 80g takes beacon:'ancient' (KNOWN_ISSUES.md);
//   - the Yellow Monastery: the Qiblai kit's great monastery in the gold dress (qb_monastery, o.v 2), its gate south to the lamp;
//   - the order's other buildings (bc_block: a stack per layout part, its storeys, windows, door, parapet roof), the precinct wall
//     and Gyantse's two walls (bc_wall: 80g's xfCurtain), the Lamp Stair, the courts and the kora garden, the Chorten of the
//     Keepers, the oil pit, the cable's channel;
//   - the lamp head (a stand-in for kits/ancients' anc_beacon_lamp, B5) and its beam, live, turned by the lamp's night
//     (src/40-bc-lamp.js as 89b2: BEACON_LAMP.state) at the page's hour.
// [web]: three.js.
const BC_B0=performance.now();
const BCL=BEACON_LAYOUT,BCD=BCL.draw,BC_SP=QSPOKE[BCD.spoke];
const BC_GRP=new THREE.Group();BC_GRP.name='The Beacon';scene.add(BC_GRP);
const bcPart=id=>BCL.parts.find(p=>p.id===id);
const bcMid=b=>[(b[2]+b[3])/2,(b[0]+b[1])/2];   /* a layout box's middle on the page: [x (v), z (u)] */
const XTAG_BC=(type,more)=>Object.assign({type:[type],wealth:'civic',lit:true},more||{});
// ---------------------------------------------------------------- the plinth: the keep's place of the watch fort (a shim on 80g's xfKeep)
let BC_PLINTH=false;const bcKeep0=xfKeep;
xfKeep=function(b,C,o){return BC_PLINTH&&!(o&&o.ruined)?bcPlinth(b,C,o):bcKeep0(b,C,o);};
function bcPlinth(b,C,o){const x=b.at[0],z=b.at[1],w=b.w,d=b.d,P=BCD.plinth,M=BCD.mount,lit=xLit()?'lit':'glass',trim=xC(xPick(XPAL.trim));
 const gold=xC(BC_SP.wall),band=xC(BC_SP.band),gilt=xC(xPick(XPAL.gold));
 xnWall(x,0,z,w+1.2,1.2,d+1.2,0,C.stone,'dressed');
 const hs=[P.storeys[0]-1.2].concat(P.storeys.slice(1)),S=xnStack(x,1.2,z,w,d,0,hs,C.wash,'wash');
 let yy=1.2;for(let k=0;k<hs.length;k++){const f=Math.pow(.96,k),n=3;
  for(let i=0;i<n;i++)for(const s of[-1,1]){const u=-w*f/2+w*f*(i+.5)/n;if(s>0&&k===0&&Math.abs(u)<1.8)continue;
   xnTibWin(x+u,yy+hs[k]*.36,z+s*(d*f/2-.06),s>0?0:Math.PI,.8,1.1,lit,trim,{noVal:true});xnTibWin(x+s*(w*f/2-.06),yy+hs[k]*.36,z+u,s*Math.PI/2,.8,1.1,lit,trim,{noVal:true});}
  yy+=hs[k];}
 xnDoorway(x,1.2,z+d/2+.02,0,1.8,2.6,{c:C.tim});xnFlight(x,0,z+d/2+.6+Math.round(1.2/.17)*.34,0,2.4,1.2,'vStone',C.stone);
 vB('xBandB',x,S.y-.7,z,S.w+.1,.5,S.d+.1,0,C.maroon);   /* the maroon band under the chapel */
 /* the Chapel of the Beacon: the plinth's top storey in the gold spoke's yellow, its windows saffron, its roof's corners gilt */
 const Ch=xnStack(x,S.y,z,S.w,S.d,0,[P.chapel],gold,'wash');
 for(const s of[-1,1])for(const u of[-2.2,2.2]){xnTibWin(x+u,S.y+1.3,z+s*(S.d/2-.06),s>0?0:Math.PI,.9,1.4,lit,xC(XPAL.saffron),{valC:xC(XPAL.saffron)});xnTibWin(x+s*(S.w/2-.06),S.y+1.3,z+u,s*Math.PI/2,.9,1.4,lit,xC(XPAL.saffron),{valC:xC(XPAL.saffron)});}
 const top=qnRoof(x,Ch.y,z,Ch.w,Ch.d,0,gold,{band,gold:true,corner:'gold',parapet:.9});
 const fx=x+Ch.w/2-1,fz=z+Ch.d/2-1;vB('vIron',fx,Ch.y,fz,.14,P.finial,.14,0,gilt);vBall('xGold',fx,Ch.y+P.finial,fz,.3,gilt);   /* the gilt finial (the forts' gold: the chapel) */
 /* the lamp's mount on the roof: the slewing ring and the yoke (the head is the live stand-in, BC_LAMP) */
 kput('xDrumE',[x,Ch.y,z],null,[M.ring,M.h,M.ring],C.iron);for(const s of[-1,1])vB('vIron',x+s*1.05,Ch.y+M.h,z,.18,M.yoke,.34,0,C.iron);
 BC.plinthTop=Ch.y;BC.parapetTop=top;}
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
function bcPlace(key,x,z,ry,o,type){TSTAT.cur=(type||key)+'/0';const r0=REG.length,g=VERN.place(BC_GRP,key,x,z,ry,o);for(let i=r0;i<REG.length;i++)REG[i].type=type||key;TSTAT.cur=null;BC_PLACED[key]=(BC_PLACED[key]|0)+1;return g;}
/* the fort: its keep's place on the lamp, turned half round (its gate north), on the crown */
BC_PLINTH=true;BC.fortG=bcPlace('xa_fort_watch',0,-6.6,Math.PI,{v:0,y:BC.F,seed:20261123});BC_PLINTH=false;
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
// ---------------------------------------------------------------- the lamp head (the stand-in) and its beam, turned by the lamp's night
const BC_LAMP=(function(){const g=new THREE.Group();g.name='the lamp head (a stand-in for kits/ancients anc_beacon_lamp)';g.rotation.order='YXZ';
 g.position.set(0,BC.F+BCD.plinth.h+BCD.mount.h+BCD.mount.yoke,0);
 const white=new THREE.MeshStandardMaterial({color:0xdfe1e2,metalness:.55,roughness:.32}),iron=new THREE.MeshStandardMaterial({color:0x2e2a26,metalness:.4,roughness:.6});
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,2.2,28),white);body.rotation.x=Math.PI/2;g.add(body);
 for(const z of[-.6,.55]){const s=new THREE.Mesh(new THREE.CylinderGeometry(.84,.84,.12,28),iron);s.rotation.x=Math.PI/2;s.position.z=z;g.add(s);}   /* the Xanadui iron straps */
 for(let k=0;k<6;k++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.04,28),white);f.rotation.x=Math.PI/2;f.position.z=-1.05+k*.08;g.add(f);}   /* the cooling fins at its back */
 const tr=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,2.2,10),iron);tr.rotation.z=Math.PI/2;g.add(tr);   /* the trunnions on the yoke */
 const face=new THREE.Mesh(new THREE.CircleGeometry(.72,28),new THREE.MeshBasicMaterial({color:0x3a3a36}));face.position.z=1.111;g.add(face);
 const L=2600,w0=.7,w1=46,near=[1,.9,.66].map(v=>v*.55),pos=[],colr=[],idx=[];
 const quad=(a,b,c,d)=>{const i0=pos.length/3;[a,b,c,d].forEach((p,k)=>{pos.push(...p);colr.push(...(k<2?near:[0,0,0]));});idx.push(i0,i0+1,i0+2,i0,i0+2,i0+3);};
 quad([0,-w0,1.1],[0,w0,1.1],[0,w1,L],[0,-w1,L]);quad([-w0,0,1.1],[w0,0,1.1],[w1,0,L],[-w1,0,L]);
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));bg.setIndex(idx);
 const beam=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 beam.name='the beam';beam.userData.probeSkip=true;beam.userData.lodSkip=true;beam.frustumCulled=false;g.add(beam);
 g.userData.probeSkip=true;scene.add(g);return{g,face,beam};})();
const BC_ENV={night:t=>{const h=((t/3600)%24+24)%24;return h>=18||h<6;},engines:()=>true};
function bcLampTick(){const t=BC_SKY.hour*3600+(performance.now()-BC_B0)/1000,s=BEACON_LAMP.state(t,BC_ENV),on=s.lit&&s.shutter;
 BC_LAMP.beam.visible=on;BC_LAMP.face.material.color.setHex(on?0xfff3cf:0x3a3a36);
 if(s.bearing!=null){BC_LAMP.g.rotation.y=Math.PI-s.bearing*Math.PI/180;BC_LAMP.g.rotation.x=-(s.elevation||0)*Math.PI/180;}
 window._beaconLamp={lit:s.lit,mode:s.mode,bearing:s.bearing==null?null:Math.round(s.bearing*10)/10,station:s.station,keepers:s.keepers};}
FRAME_HOOKS.push(bcLampTick);bcLampTick();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._buildMs=Math.round(performance.now()-BC_B0);
/* the page's record (the verify's): what was placed, the levels under the fort's and the precinct's corners, the plinth's top, the rules */
window._beacon=Object.assign({},window._beaconSite,{placed:BC_PLACED,fort:!!BC.fortG,monastery:!!BC.monG,plinthTop:BC.plinthTop==null?null:Math.round((BC.F+BC.plinthTop)*100)/100,
 lampY:Math.round(BC_LAMP.g.position.y*100)/100,
 fortGround:[[-28,-28],[28,-28],[28,14],[-28,14],[0,0]].map(p=>Math.round(terrainH(p[0],p[1])*100)/100),
 precinctGround:[[-58,-238],[58,-238],[58,-70],[-58,-70],[0,-160]].map(p=>Math.round(terrainH(p[0],p[1])*100)/100),
 rules:BEACON.checks(BCL).filter(c=>!c.pass).map(c=>c.name+': '+c.detail),forts:(window._xaForts||[]).length});
