// ================================================================ SEGMENT: hbMarina - recreational boat harbour
// A 110 m marina (seeds 20410-20414; the boat kit and the reclaimed-life
// helpers are in 85-hb-1-fish.js). The land apron is a PROMENADE (planted
// trees, benches, lamps, a guard rail along the quay) with the white Ancient
// CLUBHOUSE - three stacked stadium-shaped tiers, each a band of glass under a
// white slab lip, stepping back from the sea as planted terraces with
// parasols - and a BOAT YARD of yachts on cradles. In the basin two FLOATING
// PONTOON spines on white piles run out from gangways, finger pontoons every
// 5.5 m with service pedestals, yachts and motor cruisers berthed stern-to;
// the east spine's T-head is the FUEL PONTOON (pumps under a white shell
// canopy, a kiosk), the west one takes the big boats alongside. A floating
// wave attenuator closes the basin at z 174.
//   d=0 intact   every berth lit, cyan light strips on the clubhouse lips
//   d=1 ruined   pontoons broken loose, tilted, half sunk; boats sunk at their
//                berths (masts out of the water), capsized, thrown onto the
//                promenade and off their cradles; the basin silted with sand
//                bars; the clubhouse gutted (glass gone, top tier fallen)
//   d=3 reclaimed a floating village: hulls turned into houses, shacks and
//                gardens on rafts and pontoon heads, stilt houses, rope
//                bridges over the lost sections, the clubhouse lived in
const HBM={LAND:60,SEA:190,SX:[-24,24],SZ0:13,SZ1:150,FW:1,FL:9,FS:5.5,AZ:174,AX0:-38,AX1:46,CX:-14,CZ:-34,PY:.05};
function hbMarinaStamps(o){const d=o.d,h=o.W/2,D=PORT.DECK;
 const s=[{kind:'flat',x0:-h,z0:-HBM.LAND,x1:h,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:HBM.SEA,y:d===1?-1.8:-5,soft:30}];
 if(d===1)for(const [P,top,pt] of [[[[-52,90],[-40,70],[-30,96],[-34,150],[-48,160],[-54,130]],.2,'sand'],
   [[[-6,40],[6,34],[12,70],[4,120],[-8,110],[-12,70]],-.2,'sand'],[[[30,120],[46,110],[52,150],[40,170],[28,160]],.1,'mud']]){
  const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cz=P.reduce((a,p)=>a+p[1],0)/P.length;
  [[1.15,-1.2],[.95,-.5],[.62,top]].forEach(([k,y],i)=>s.push({kind:'fill',poly:P.map(p=>[clamp(cx+(p[0]-cx)*k,-h,h),cz+(p[1]-cz)*k]),y,paint:i===2?pt:'sand'}));}
 return s.concat(portEdgeStamps(o,{LAND:HBM.LAND,SEA:HBM.SEA}));}

// A floating pontoon section: concrete float body and a timber deck, len along
// local z, turned by yaw and tilted by pitch/roll (ruined), top at y+0.5.
function hbPont(G,x,y,z,w,len,yaw,d,o){o=o||{};const m=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(o.pitch||0,yaw,o.roll||0,'YXZ'));
 const b=boxUV(w,.8,len,4);b.applyMatrix4(m);b.translate(x,y,z);pbAdd(b,d===1?MAT.concreteR:MAT.pkConc,G,true);
 const t=boxUV(w-.08,.1,len-.08,4).translate(0,.45,0);t.applyMatrix4(m);t.translate(x,y,z);pbAdd(t,MAT.timber,G,true);}
// white piles holding a pontoon (d=1: leaning, some snapped)
function hbPile(x,z,d,top){const gy=portH(x,z)-1;top=top||4.6;
 if(d===1&&rng()<.3){kput('postR',[x,gy+(top-gy)*.2,z],qEuler(rr(-.15,.15),0,rr(-.15,.15)),[.28,(top-gy)*.4,.28],null);return;}
 kput(d===1?'postR':'postW',[x,(gy+top)/2,z],d===1?qEuler(rr(-.08,.08),0,rr(-.08,.08)):null,[.28,top-gy,.28],d>=3?new THREE.Color(0xc8beb0):null);
 if(d!==1)kput('slab',[x,top+.05,z],null,[.34,.1,.34],d===0?null:new THREE.Color(0x9a9288));}
// The clubhouse: stacked stadium tiers (glass band under a white lip), each
// set back toward the land so its roof is a terrace facing the sea.
function hbStadium(w,dp,r){const s=new THREE.Shape(),x=w/2,z=dp/2;r=Math.min(r,x,z);
 s.moveTo(-x+r,-z);s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);s.lineTo(x,z-r);s.quadraticCurveTo(x,z,x-r,z);
 s.lineTo(-x+r,z);s.quadraticCurveTo(-x,z,-x,z-r);s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);return s;}
function hbSlabGeo(w,dp,r,h,x,y,z){const g=new THREE.ExtrudeGeometry(hbStadium(w,dp,r),{depth:h,bevelEnabled:false,curveSegments:6});
 g.rotateX(-Math.PI/2);g.translate(x,y,z);return g;}
function hbClub(G,cx,cz,d){const D=PORT.DECK,T=[[44,22,0,4.6],[35,17,-2.6,4.2],[24,11,-5.2,3.8]];let y=D;
 const lipC=SHELL(d);
 T.forEach(([w,dp,oz,h],i)=>{const z=cz+oz,gone=d===1&&i===2;
  if(gone){for(let k=0;k<4;k++){const g=boxUV(rr(4,9),.45,rr(3,6),8);g.rotateX(rr(-.4,.4));g.rotateZ(rr(-.4,.4));g.translate(cx+rr(-10,10),y+rr(.3,1.2),z+rr(-4,3));pbAdd(g,lipC,G);}
   portRubble(cx,y,z,8,22);return;}
  pbAdd(hbSlabGeo(w-1.4,dp-1.4,dp/2-.7,h,cx,y,z),WIN(d),G);                                  // the glass drum
  pbAdd(hbSlabGeo(w,dp,dp/2,.5,cx,y+h,z),lipC,G);                                         // the white lip over it
  pbAdd(hbSlabGeo(w-1,dp-1,dp/2-.5,.35,cx,y+h-.35,z),lipC,G);                             // a soffit under the lip
  const pts=hbStadium(w-1.3,dp-1.3,dp/2-.65).getSpacedPoints(Math.round((w+dp)*1.1));
  pts.forEach((p,k)=>{if(k===pts.length-1)return;if(d===1&&rng()<.35)return;
   kput(d>0?'strutR':'strutW',[cx+p.x,y+h/2,z-p.y],null,[.16,h,.16],null);});
  if(d===0){const lp=hbStadium(w+.08,dp+.08,dp/2+.04).getSpacedPoints(Math.round((w+dp)*.7));
   for(let k=0;k<lp.length-1;k++){const a=lp[k],b=lp[k+1];kput('strip',[cx+(a.x+b.x)/2,y+h+.28,z-(a.y+b.y)/2],qEuler(0,Math.atan2(b.y-a.y,b.x-a.x),0),[Math.hypot(b.x-a.x,b.y-a.y),.5,.5],CYAN);}}
  if(d>0)for(let k=0;k<Math.round(w/4);k++){const p=pts[(rng()*pts.length)|0];kput('vine',[cx+p.x*1.03,y+h+.3,z-p.y*1.03],null,[rr(.8,1.4),rr(1.5,h),rr(.8,1.4)],null);}
  REGISTER({name:'Marina clubhouse',x:cx-w/4,z,r:Math.max(w/4,dp/2)+.5,h:h+.6,y});REGISTER({name:'Marina clubhouse',x:cx+w/4,z,r:Math.max(w/4,dp/2)+.5,h:h+.6,y});
  y+=h+.5;
  // the terrace ring on this roof, in front of the next tier: hedges, parasols, tables
  const nx=T[i+1];if(!nx)return;
  const tp=hbStadium(w-2.2,dp-2.2,dp/2-1.1).getSpacedPoints(Math.round((w+dp)*.5));
  tp.forEach((p,k)=>{if(k===tp.length-1||p.y>dp*.1)return;              // the sea-facing half only
   if(d===1&&rng()<.5)return;kput('hedge',[cx+p.x,y+.4,z-p.y],qEuler(0,rng()*TAU,0),[1.3,.8,1.3],d===1?new THREE.Color(0x3a5a2a):new THREE.Color(0x4a7a3a));});
  if(d===0){for(let k=0;k<Math.round(w/8);k++){const x=cx+(k+.5-w/16)*8,zz=z+dp/2-3.2;if(Math.abs(x-cx)>w/2-7)continue;
    kput('hbParasol',[x,y,zz],null,1,new THREE.Color().setHSL(rng()<.5?.55:.08,.4,.85));kput('plank',[x,y+.75,zz],null,[1.1,.06,1.1],new THREE.Color(0xf0eee8));}
   portFigures(cx,y,z+dp/2-3,Math.round(w/5),w/2-4);}
  if(d===1){portWeeds(cx-w/2+3,z+dp/2-6,cx+w/2-3,z+dp/2-1,24,y);VEG.tree(cx+rr(-w/3,w/3),y,z+dp/2-3,1,rr(3,6));}});
 // a flag mast on the top tier
 if(d!==1){const top=y;kput('pkCol',[cx+8,top,cz-5.2],null,[.12,9,.12],new THREE.Color(0xf4f2ec));
  for(let k=0;k<3;k++)kput('pkCloth',[cx+8.05,top+8.8-k*.1,cz-5.2+.6],qEuler(0,Math.PI/2,0),[1.6,1,1],new THREE.Color().setHSL(k*.33,.55,.5));
  kput('dot',[cx+8,top+9.1,cz-5.2],null,[.3,.3,.3],d===0?CYAN:WARM);}
 if(d===0)portFigures(cx,D,cz+13,10,18);
 return y;}
// a gangway from the quay top down to a pontoon: a plank ramp and hand rails
function hbGangway(x,z0,z1,y0,y1,d,fallen){if(fallen){beam('plank',[x+.4,y0-.4,z0+.4],[x+1.2,-1.4,z0+5],1.4,.12,new THREE.Color(0x7a6650));return;}
 beam('plank',[x,y0,z0],[x,y1+.55,z1],1.4,.12,null);
 for(const s of [-.72,.72]){beam(d>0?'strutR':'strutW',[x+s,y0+1,z0],[x+s,y1+1.55,z1],.06,.06,null);
  for(let t=0;t<=1.001;t+=.25)kput(d>0?'strutR':'strutW',[x+s,lerp(y0,y1+.55,t)+.5,lerp(z0,z1,t)],null,[.05,1,.05],null);}}

function buildHbMarina(scene,gx,gz,d,opt){reseed(20410+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,M=HBM,PY=M.PY;
 portPaving(G,-h,-M.LAND,h,-1.2,d);
 const qw=portQuayWall(G,-h,0,h,0,d,{ladders:30,bollards:15,fenders:10});
 portSideClose(G,opt.nb,d,{z0:-M.LAND,z1:0});
 // ---- the promenade: guard rail (open at the gangways), trees, benches, lamps
 for(let x=-h+2.5;x<h;x+=5){if(M.SX.some(sx=>Math.abs(x-sx)<3))continue;if(d===1&&rng()<.4)continue;
  kput('pkGuard',[x,D,-.9],null,1,d>0?new THREE.Color(0x8a6a4a):null);}
 for(let x=-h+10;x<=h-10;x+=14){const z=-9;
  kput('planter',[x,D+.35,z],null,[2.2,.7,2.2],null);
  VEG.tree(x,D+.6,z,d===1?(rng()*3)|0:1,d===1?rr(7,11):rr(5,7));
  if(d!==1)kput('plank',[x+5,D+.45,z],null,[2.2,.08,.6],null);}
 for(let x=-h+17;x<h;x+=28)portLamp(x,D,-4,0,d);
 REGISTER({name:'Promenade',x:-30,z:-8,r:10,h:10,y:D});REGISTER({name:'Promenade',x:30,z:-8,r:10,h:10,y:D});
 // ---- the clubhouse
 hbClub(G,M.CX,M.CZ,d);
 // ---- the boat yard: boats on cradles behind a rail
 const YD=[[22,-40,0],[30,-40,0],[38,-40,0],[26,-24,Math.PI/2],[40,-25,Math.PI/2]];
 for(let x=16;x<=45;x+=5)kput('pkGuard',[x+2.5,D,-51],null,1,d>0?new THREE.Color(0x8a6a4a):null);
 YD.forEach(([x,z,yw],i)=>{const t=i<3?'Yacht':'Motor';
  for(const s of [-2.5,2.5]){const p=hbAt(x,z,yw,0,s);kput('plank',[p[0],D+.6,p[1]],qEuler(0,yw,0),[2.6,1.2,.3],null);}
  if(d===1&&rng()<.6)hbBoat(t,x+rr(-1,1),D+(t==='Yacht'?.9:.6),z,yw+rr(-.2,.2),d,{roll:rr(1.1,1.3)*(rng()<.5?1:-1),noRig:rng()<.5});
  else hbBoat(t,x,D+(t==='Yacht'?2.35:1.5),z,yw,d,{noRig:d===1});});
 REGISTER({name:'Boat yard',x:30,z:-38,r:9,h:12,y:D});REGISTER({name:'Boat yard',x:34,z:-24,r:9,h:12,y:D});
 // ---- pontoons: gangways, spines, fingers, piles, pedestals, and the boats
 const berths=[];
 M.SX.forEach((sx,si)=>{
  hbGangway(sx,-.2,M.SZ0,D,PY,d,d===1&&si===0);
  const nS=Math.round((M.SZ1-M.SZ0)/12),sl=(M.SZ1-M.SZ0)/nS;
  for(let k=0;k<nS;k++){const zm=M.SZ0+(k+.5)*sl;
   if(d===1){const r=rng();if(r<.2)continue;
    if(r<.55){hbPont(G,sx+rr(-3,3),PY-rr(.2,1),zm+rr(-2,2),2.6,sl-.4,rr(-.35,.35),d,{roll:rr(-.3,.3),pitch:rr(-.1,.1)});continue;}}
   if(d>=3&&k%4===2){hbRaft(sx,zm,2.8,sl-1,Math.PI/2,rng()<.5?'garden':'shack');continue;}   // a lost section replaced by a raft
   hbPont(G,sx,PY,zm,2.6,sl-.3,0,d);}
  for(let z=M.SZ0+6;z<M.SZ1;z+=24)for(const s of [-1,1])hbPile(sx+s*1.7,z,d);
  REGISTER({name:'Pontoon',x:sx,z:40,r:6,h:5,y:-2});REGISTER({name:'Pontoon',x:sx,z:110,r:6,h:5,y:-2});
  for(let z=M.SZ0+4;z+M.FS<M.SZ1-2;z+=M.FS)for(const s of [-1,1]){
   const fx=sx+s*(1.3+M.FL/2);berths.push([sx,s,z+M.FS/2]);
   if(d===1){if(rng()<.5)continue;hbPont(G,fx+rr(-1,1),PY-rr(0,.6),z+rr(-.5,.5),M.FW,M.FL,Math.PI/2+rr(-.3,.3),d,{roll:rr(-.25,.25)});continue;}
   if(d>=3&&rng()<.25)continue;
   hbPont(G,fx,PY-.05,z,M.FW,M.FL,Math.PI/2,d);
   if(d===0&&(z-M.SZ0)%(M.FS*2)<1){kput('hbPedestal',[sx+s*1.1,PY+.5,z],null,1,null);kput('dot',[sx+s*1.1,PY+1.52,z],null,[.22,.08,.22],CYAN);}
   }});
 // T-heads: west (big boats alongside), east (the fuel pontoon)
 hbPont(G,-24,PY,M.SZ1+1.6,3,32,Math.PI/2,d,d===1?{roll:.2,pitch:.05}:{});
 const fuelOK=d!==1;
 if(fuelOK){hbPont(G,26,PY,M.SZ1+1.6,3,36,Math.PI/2,d);}
 else hbPont(G,30,PY-.9,M.SZ1+8,3,20,Math.PI/2+.4,d,{roll:.35});
 hbPile(-38,M.SZ1+3.3,d);hbPile(-10,M.SZ1+3.3,d);hbPile(12,M.SZ1+3.3,d);hbPile(40,M.SZ1+3.3,d);
 REGISTER({name:'Pontoon head',x:-24,z:M.SZ1+1.6,r:12,h:5,y:-2});
 if(fuelOK){const fz=M.SZ1+1.6,fy=PY+.5;
  for(const x of [30,36])kput('boxW',[x,fy+.8,fz],null,[.7,1.6,.5],d>0?new THREE.Color(0xb8a898):null);
  // the white shell canopy over the pumps
  pbAdd(gridSurface((u,v)=>[26+u*14,fy+4+1.2*Math.sin(Math.PI*u),fz-2.5+v*5],10,3,{uS:2,vS:1}),SHELL(d),G);
  for(const x of [27,39])for(const s of [-1,1])kput(d>0?'postR':'postW',[x,fy+2,fz+s*2],null,[.14,4,.14],null);
  kput('boxW',[42,fy+1.2,fz],null,[3,2.4,2.4],d>0?new THREE.Color(0xa89888):null);kput(d===0?'pane':'paneD',[42,fy+1.5,fz+1.22],null,[2.2,1.1,1],null);
  if(d===0){kput('strip',[33,fy+3.9,fz+2.5],null,[14,.6,.6],CYAN);kput('strip',[33,fy+3.9,fz-2.5],null,[14,.6,.6],CYAN);}
  REGISTER({name:'Fuel pontoon',x:34,z:fz,r:10,h:7,y:-2});}
 // ---- the floating wave attenuator
 const AL=(M.AX1-M.AX0)/3;
 for(let k=0;k<3;k++){let xm=M.AX0+(k+.5)*AL,zm=M.AZ,yw=Math.PI/2,y=-.2,o={};
  if(d===1){if(k===1){xm+=6;zm-=16;yw+=.5;y=-.9;o={roll:.25};}else{xm+=rr(-3,3);zm+=rr(-6,-1);yw+=rr(-.2,.2);o={roll:rr(-.12,.12)};}}
  hbPont(G,xm,y,zm,4,AL-(d===1?2:1),yw,d,o);
  if(d!==1)pbBox(G,MAT.pkConc,xm,-1,M.AZ,AL-1,1.2,4.4,0,8,true);
  for(let t=-AL/2+3;t<AL/2-2;t+=6){const p=hbAt(xm,zm,yw,0,t);kput('pkBollard',[p[0],y+.5+(d===1&&k===1?t*Math.sin(.25)*0:0),p[1]],null,.6,d===1?new THREE.Color(0x7a4a32):null);}
  for(const t of [-AL/4,AL/4]){const p=hbAt(xm,zm,yw,0,t);REGISTER({name:'Wave attenuator',x:p[0],z:p[1],r:6.5,h:5,y:-3});}}
 for(const [x,c] of [[M.AX0+.8,0xff4a3a],[M.AX1-.8,0x5aff7a]]){hbPile(x,M.AZ+2.6,d,6.5);if(d!==1)kput('dot',[x,6.9,M.AZ+2.6],null,[.4,.4,.4],d===0?new THREE.Color(c):WARM);}
 const boatAt=(b,t,o)=>{const [sx,s,z]=b,L=HB_BT[t].L,x=sx+s*(1.3+.4+L/2),out=rng()<.7;return hbBoat(t,x,o&&o.y||0,z,out?s*Math.PI/2:-s*Math.PI/2,d,o);};
 // ---- intact
 if(d===0){
  for(const b of berths){if(rng()<.2)continue;const t=rng()<.55?'Yacht':'Motor';boatAt(b,t,{lit:1});}
  hbBoat('Motor',-31,0,M.SZ1+7.4,Math.PI/2,d,{lit:1});hbBoat('Yacht',-15,0,M.SZ1+7.8,-Math.PI/2,d,{lit:1});
  hbBoat('Motor',32,0,M.SZ1+7.4,-Math.PI/2,d,{lit:1});
  hbBoat('Yacht',-1,0,120,.3,d,{lit:1});hbBoat('Motor',0,0,184,-1.5,d,{lit:1});
  REGISTER({name:'Yacht under way',x:-1,z:120,r:7,h:18,y:-2});
  portFigures(0,D,-10,24,48);portFigures(-24,PY+.5,80,4,1);portFigures(24,PY+.5,60,4,1);portFigures(33,PY+.5,M.SZ1+1.6,4,5);
  portBuoy(-50,178);portBuoy(52,176);}
 // ---- ruined
 if(d===1){
  for(const b of berths){const r=rng();if(r<.35)continue;const t=rng()<.55?'Yacht':'Motor',T=HB_BT[t];
   if(r<.62)boatAt(b,t,{y:-rr(1.2,3.2),roll:rr(-.35,.35),pitch:rr(-.08,.08)});                        // sunk at the berth, the mast out
   else if(r<.78)boatAt(b,t,{y:-.2,roll:Math.PI+rr(-.2,.2),noRig:true});                               // capsized
   else boatAt(b,t,{y:-.3,roll:rr(-.2,.2)});}
  hbBoat('Yacht',-38,-.5,118,1.2,d,{roll:.95});REGISTER({name:'Yacht heeled on the sand',x:-38,z:118,r:7,h:12,y:-2});
  hbBoat('Motor',6,-.4,82,.4,d,{roll:-.5});hbBoat('Yacht',40,-.4,152,-.4,d,{roll:-.8,noRig:true});
  hbBoat('Motor',-24,D+.9,-14,.2,d,{roll:.45,pitch:.05});REGISTER({name:'Cruiser thrown onto the promenade',x:-24,z:-14,r:7,h:6,y:D});
  portWeeds(-h+4,-M.LAND+4,h-4,-3,150,D);portTrees(-h+10,-56,-40,-46,3,D,4,8);portTrees(20,-58,h-10,-52,2,D,4,7);
  portRubble(-30,D,-20,5,12);}
 // ---- reclaimed
 if(d>=3){
  let hs=0;for(const b of berths){const r=rng();if(r<.3)continue;const t=rng()<.5?'Yacht':'Motor';
   if(r<.72&&hs<24){const [sx,s,z]=b,L=HB_BT[t].L;hbBoatHouse(t,sx+s*(1.7+L/2),z,s*Math.PI/2,d,{noReg:hs%2===1});hs++;}
   else boatAt(b,t,{lit:rng()<.5?2:0});}
  // huts built on the spines themselves
  for(const sx of M.SX)for(let z=M.SZ0+14;z<M.SZ1-6;z+=26){const c=hbPick(HB_SHC),y=PY+.5;
   kput('shantyBox',[sx,y+1.15,z],qEuler(0,rr(-.05,.05),0),[2.3,2.3,3.2],c);kput('shantyRoof',[sx,y+2.4,z],qEuler(rr(-.1,.1),0,.12),[3,1,4],hbPick(HB_SHC));
   const lit=rng()<.6;kput(lit?'dot':'cellD',[sx+1.17,y+1.4,z],qEuler(0,Math.PI/2,0),lit?[.7,.5,.2]:[.9,.7,.2],lit?WARM:null);
   REGISTER({name:'Pontoon hut',x:sx,z,r:2.2,h:4,y:0});}
  // stilt houses along the fairway, rafts in the fairway, rope bridges over the gaps
  const S=[[-1,28],[0,62],[-1,104],[-2,168],[16,166]];
  S.forEach(([x,z])=>hbStilt(x,z,d,{w:rr(4.6,5.6),dp:rr(4,5),floor:3.8}));
  hbRope([-1,3.8,31],[0,3.8,59],1);hbRope([0,3.8,65],[-1,3.8,101],1.2);hbRope([-8,PY+.5,152],[-4,3.8,165.5],.6);
  hbRope([-2+3,3.8,168],[16-3,3.8,166],.8);
  hbRaft(0,45,6,4,.3,'garden');hbRaft(0,84,7,4.5,-.2,'garden');hbRaft(4,132,6,4,.1,'fish');hbRaft(-12,160,5,3.6,.4,'shack');
  hbRaft(34,166,6,4,0,'garden');
  for(let i=0;i<14;i++){const x=rr(-6,6),z=rr(16,150);portSkiff(x,z,rr(-.4,.4)+(rng()<.5?0:Math.PI));}
  // the attenuator, lived on: fish drying, a hut
  for(let x=M.AX0+6;x<M.AX1-6;x+=12)hbFishRack(x,.35,M.AZ,0,8,18);
  // the promenade: stalls, container houses, gardens; the clubhouse terraces planted
  for(let i=0;i<8;i++)portStall(-50+i*6.5,D,-15,Math.PI+rr(-.1,.1));
  portContainerHouse(G,-42,D,-48,.1,d,{levels:2,big:false});
  portGarden(14,D,-16,10,8,d);portGarden(-40,D,-24,10,6,d);
  portWashLine(-50,-3,-10,-3,8.4,10);portWashLine(10,-3,40,-3,8.4,8);
  portFigures(-10,D,-10,24,40);portFigures(-24,PY+.5,90,6,2);portFigures(24,PY+.5,60,6,2);
  portWeeds(-h+4,-M.LAND+4,h-4,-3,40,D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'hbMarina',name:'Marina',cls:'seg',W:110,LAND:HBM.LAND,SEA:HBM.SEA,decays:[0,1,3],stamps:hbMarinaStamps,build:buildHbMarina});
