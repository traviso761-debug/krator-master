// ---------- townsfolk: walk the streets and plazas, duck into doors, come back out; shuttles fly the spaceport–palace run ----------
const cData=GROUND_IMG.data;
function walkable(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<1||iz<1||ix>=CS-1||iz>=CS-1)return false;const i=(iz*CS+ix)*4;const r=cData[i],gg=cData[i+1],b=cData[i+2];
  const gray=Math.abs(r-gg)<14&&Math.abs(gg-b)<14&&r>55&&r<150,sand=r>150&&gg>110&&r-b>55;if(!(gray||sand))return false;const ex=(x-ARENA.x)/44,ez=(z-ARENA.z)/36;if(ex*ex+ez*ez<1)return false;const p=polar(x,z);return p.r<wallR(p.t)+190;}
const NP=340,ag=[];
const bodyG=new THREE.CylinderGeometry(0.28,0.42,1,6);bodyG.translate(0,0.5,0);const headG=new THREE.SphereGeometry(0.27,6,5);
const bodies=new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial({color:0xffffff}),NP),heads=new THREE.InstancedMesh(headG,new THREE.MeshLambertMaterial({color:0xd9b58a}),NP);
const ROBES=[0xe8d9b8,0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030,0x3b4a8a,0xd9d1b0,0x8a6a3a,0x9c2d2d,0x4c7a4a];
let tries=0;while(ag.length<NP&&tries++<60000){const x=rr(-235,235),z=rr(-235,235);const p=polar(x,z);if(p.r>wallR(p.t)-8)continue;if(!walkable(x,z))continue;ag.push({x,z,h:rr(0,6.28),v:rr(2.6,4.6),st:0,t:0,tx:0,tz:0,dry:0});}
for(let i=0;i<NP;i++)bodies.setColorAt(i,col.set(pick(ROBES)));
bodies.count=heads.count=ag.length;bodies.userData.noShadow=heads.userData.noShadow=true;bodies.userData.life=heads.userData.life=true;scene.add(bodies,heads);
const dgrid=new Map();for(let i=0;i<doors.length;i+=4){const k=Math.floor(doors[i]/20)+'_'+Math.floor(doors[i+2]/20);(dgrid.get(k)||dgrid.set(k,[]).get(k)).push(i);}
function nearDoor(x,z){const cx=Math.floor(x/20),cz=Math.floor(z/20);let best=null,bd=13;for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){const cell=dgrid.get((cx+ox)+'_'+(cz+oz));if(!cell)continue;for(const i of cell){const d=Math.hypot(doors[i]-x,doors[i+2]-z);if(d<bd){bd=d;best=i;}}}return best;}
ctx.life={agents:ag.length,doors:doors.length/4};ctx.agents=ag;ctx.people={bodyG,headG,ROBES};ctx.walkable=walkable;
// walking inside the walls: every few tenths of a second pick the most open heading near the current one
let NAVW=null;   // set once the navigation grid exists
function navOpen(x,z){const f=NAVW.free(x,z);return f<0?walkable(x,z):f===1;}
const MARKETS=[[-125,60],[60,150],[-70,-140],[TEMPLE.x,TEMPLE.z+52]],FESTIVE=[[0,0,24],[TEMPLE.x,TEMPLE.z+40,20],[-125,60,14]];
function pickGoal(a,h){const f=ctx.totalHours?festF(ctx.totalHours):0;
  if(f>0.5){const q=FESTIVE[Math.floor(Math.random()*FESTIVE.length)];const t=Math.random()*6.28,r=q[2]*Math.sqrt(Math.random());return [q[0]+Math.cos(t)*r,q[1]+Math.sin(t)*r,12];}
  if(marketF(h)>0.5){let best=null,bd=170;for(const m of MARKETS){const d=Math.hypot(m[0]-a.x,m[1]-a.z);if(d<bd){bd=d;best=m;}}if(best)return [best[0]+(Math.random()-0.5)*20,best[1]+(Math.random()-0.5)*20,10];}
  return null;}
function walkNav(a,dt){a.nt=(a.nt||0)-dt;
  if(!navOpen(a.x,a.z)){const k=NAVW.nearestFree(a.x,a.z);if(k){const dx=k[0]-a.x,dz=k[1]-a.z,d=Math.hypot(dx,dz);if(d>0.05){a.h=Math.atan2(dx,dz);const st=Math.min(d,a.v*dt);a.x+=dx/d*st;a.z+=dz/d*st;}}return;}
  const aheadOk=navOpen(a.x+Math.sin(a.h)*0.8,a.z+Math.cos(a.h)*0.8);
  if(a.nt<=0||!aheadOk){a.nt=0.25+((a.x*7.3+a.z*3.1)%1+1)%1*0.25;let best=null,bs=-1e9;
    for(const d of [0,0.35,-0.35,0.7,-0.7,1.2,-1.2,1.9,-1.9,Math.PI]){const hh=a.h+d,s1=Math.sin(hh),c1=Math.cos(hh);
      if(!navOpen(a.x+s1*1.2,a.z+c1*1.2))continue;const far=navOpen(a.x+s1*2.8,a.z+c1*2.8);
      let sc=(far?2:0)+Math.min(NAVW.clear(a.x+s1*2.8,a.z+c1*2.8),6)*0.15-Math.abs(d)*0.8+(d===0?0.3:0);
      if(a.goal){const gx=a.goal[0]-a.x,gz=a.goal[1]-a.z,gd=Math.hypot(gx,gz)||1;sc+=1.3*(s1*gx+c1*gz)/gd;}
      if(sc>bs){bs=sc;best=hh;}}
    if(best===null)a.h+=Math.PI;else a.h=best;}
  if(navOpen(a.x+Math.sin(a.h)*0.8,a.z+Math.cos(a.h)*0.8)){a.x+=Math.sin(a.h)*a.v*dt;a.z+=Math.cos(a.h)*a.v*dt;}}
// ground height under a walker: the rope bridge deck where there is one, otherwise the rendered terrain
ctx.walkerGround=(x,z)=>walkerGround(x,z);
function groundAt(x,z){const b=ctx.bridgeY?ctx.bridgeY(x,z):null;if(b!==null)return b;
  if(LAKE.harbor&&Math.abs(x-LAKE.harbor.S[0])<80&&Math.abs(z-LAKE.harbor.S[1])<80){const H=LAKE.harbor,dx=x-H.S[0],dz=z-H.S[1],uu=dx*H.u[0]+dz*H.u[1],vv=dx*H.v[0]+dz*H.v[1];   // quay and pier decks
    if((uu>-6.5&&uu<6.5&&Math.abs(vv)<29)||(uu>6&&uu<58&&Math.abs(vv)<2.2))return Math.max(LAKE.L+0.95,meshH(x,z));}
  for(const g of GATES){const along=x*Math.cos(g)+z*Math.sin(g),perp=Math.abs(-x*Math.sin(g)+z*Math.cos(g)),R=wallR(g);if(perp<7.5&&along>R+2&&along<R+52)return PLATEAU;}   // gate bridge decks
  if(STAIRS.top){const i=Math.floor((x-STAIRS.O)/STAIRS.G),j=Math.floor((z-STAIRS.O)/STAIRS.G);if(i>=0&&j>=0&&i<STAIRS.N&&j<STAIRS.N){const t=STAIRS.top[j*STAIRS.N+i];if(t===t)return t;}}
  return meshH(x,z);}
ctx.groundAt=groundAt;
function walkerGround(x,z){return groundAt(x,z);}
// the tower elevator: 14-second loop — 3 s at the foot, 4 s up, 3 s at the deck, 4 s down. Agents board during the dwells.
const ND=ctx.needle;const DECK=ND.y+ND.H+7,NDOOR=[ND.x,ND.z+9.6];
function cabin(now){const t=(now/1000)%14;const e=u=>u*u*(3-2*u);if(t<3)return {ph:0,f:0};if(t<7)return {ph:1,f:e((t-3)/4)};if(t<10)return {ph:2,f:1};return {ph:3,f:1-e((t-10)/4)};}
let riders=0;
let last=performance.now();
let walkFrame=0;
animHooks.push(now=>{const dt0=Math.min(0.05,(now-last)/1000);last=now;walkFrame++;const camP=camera.position;
  const cb=cabin(now);const cabY=ND.y+cb.f*(ND.H+7);if(ctx.needleCab)ctx.needleCab.position.y=cb.f*(ND.H+7);
  for(let i=0;i<ag.length;i++){const a=ag[i];
    if(a.st===0&&Math.abs(a.x-camP.x)+Math.abs(a.z-camP.z)>340&&(i+walkFrame)%3){a.acc=(a.acc||0)+dt0;continue;}   // far away: every third frame
    const dt=dt0+(a.acc||0);a.acc=0;
    if(a.st===0){if(rnd()<0.012)a.h+=rr(-0.6,0.6);
      if(a.goal&&Math.hypot(a.goal[0]-a.x,a.goal[1]-a.z)<a.goal[2])a.goal=null;
      if(!a.goal&&Math.random()<0.004*dt*60)a.goal=pickGoal(a,ctx.hour||0);
      if(NAVW&&NAVW.domain(a.x,a.z))walkNav(a,dt);
      else{const ax=a.x+Math.sin(a.h)*1.5,az=a.z+Math.cos(a.h)*1.5;
      if(walkable(ax,az)){a.x+=Math.sin(a.h)*a.v*dt;a.z+=Math.cos(a.h)*a.v*dt;}
      else{let ok=false;for(const d of [0.5,-0.5,1,-1,1.6,-1.6,2.4,-2.4]){const hh=a.h+d;if(walkable(a.x+Math.sin(hh)*1.5,a.z+Math.cos(hh)*1.5)){a.h=hh;ok=true;break;}}if(!ok)a.h+=Math.PI;}}
      if(rnd()<0.002&&Math.hypot(a.x-TEMPLE.x,a.z-TEMPLE.z)<50&&ctx.templeStair){a.st=3;a.tx=TEMPLE.x;a.tz=TEMPLE.z+ctx.templeStair.foot[2];}
      else if(rnd()<0.003&&Math.hypot(a.x-ND.x,a.z-ND.z)<40&&riders<6){a.st=7;a.tx=NDOOR[0]+rr(-1.5,1.5);a.tz=NDOOR[1]+2;riders++;}
      else if(rnd()<0.0035*(1+4*smooth(17.5,19,ctx.hour||0)*(1-smooth(22.5,23.5,ctx.hour||0))*(1-(ctx.totalHours?festF(ctx.totalHours):0)))){const di=nearDoor(a.x,a.z);if(di!==null){a.st=1;a.tx=doors[di]+Math.sin(doors[di+3])*1.1;a.tz=doors[di+2]+Math.cos(doors[di+3])*1.1;a.dry=doors[di+3];}}}
    else if(a.st===1){const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);if(d<0.35){a.st=2;a.goal=null;a.t=rr(5,16)*(nightF(ctx.hour||0)>0.6&&!(ctx.totalHours&&festF(ctx.totalHours)>0.5)?4:1);}else{a.h=Math.atan2(dx,dz);a.x+=dx/d*a.v*dt;a.z+=dz/d*a.v*dt;}}
    else if(a.st===2){a.t-=dt;if(a.t<=0){a.st=0;a.h=a.dry+rr(-0.7,0.7);}}
    else if(a.st===3){const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);if(d<0.5){a.st=4;a.u=0;}else{a.h=Math.atan2(dx,dz);a.x+=dx/d*a.v*dt;a.z+=dz/d*a.v*dt;}}
    else if(a.st===4||a.st===6){a.u+=(a.st===4?1:-1)*dt*0.05;const TS=ctx.templeStair;if(TS){const u=Math.max(0,Math.min(1,a.u));a.x=TEMPLE.x;a.z=TEMPLE.z+TS.foot[2]+(TS.top[2]-TS.foot[2])*u;a.yo=TS.y0+TS.foot[1]+(TS.top[1]-TS.foot[1])*u+0.6;a.h=a.st===4?Math.PI:0;}
      if(a.st===4&&a.u>=1){a.st=5;a.t=rr(3,5);a.h=Math.PI;}if(a.st===6&&a.u<=0){a.st=0;a.yo=undefined;a.h=rr(0,6.28);}}
    else if(a.st===5){a.t-=dt;if(a.t<=0){a.st=6;}}
    else if(a.st===7){const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);if(d<0.5){a.st=8;}else{a.h=Math.atan2(dx,dz);a.x+=dx/d*a.v*dt;a.z+=dz/d*a.v*dt;}}   // to the elevator door
    else if(a.st===8){a.h=Math.PI;if(cb.ph===0){a.st=9;a.ox=rr(-0.7,0.7);a.oz=rr(-0.6,0.6);}}                                                   // wait for the cabin at the foot
    else if(a.st===9){a.x=ND.x+a.ox;a.z=ND.z+5.2+a.oz;a.yo=cabY+0.2;if(cb.ph===2){a.st=10;a.ang=Math.PI/2+rr(-0.4,0.4);a.t=rr(10,24);a.dir=rnd()<0.5?1:-1;}}   // riding up
    else if(a.st===10){a.ang+=a.dir*dt*0.12;a.t-=dt;a.x=ND.x+16*Math.cos(a.ang);a.z=ND.z+16*Math.sin(a.ang);a.yo=DECK;a.h=a.ang+a.dir*Math.PI/2;if(a.t<=0)a.st=11;}   // strolling the balcony
    else if(a.st===11){const tx=ND.x,tz=ND.z+7.5;const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);a.yo=DECK;if(d<0.6){if(cb.ph===2){a.st=12;a.ox=rr(-0.7,0.7);a.oz=rr(-0.6,0.6);}}else{a.h=Math.atan2(dx,dz);a.x+=dx/d*a.v*dt;a.z+=dz/d*a.v*dt;}}   // back to the cabin
    else if(a.st===12){a.x=ND.x+a.ox;a.z=ND.z+5.2+a.oz;a.yo=cabY+0.2;if(cb.ph===0){a.st=0;a.yo=undefined;a.x=NDOOR[0];a.z=NDOOR[1]+3;a.h=rr(0,6.28);riders--;}}   // riding down
    const vis=a.st!==2,y=(a.yo!==undefined?a.yo:walkerGround(a.x,a.z))-0.3,bob=vis?Math.abs(Math.sin(now*0.011+i*1.7))*0.09:0,sc=vis?1:0.0001;
    dm.position.set(a.x,y+bob,a.z);dm.scale.set(sc,sc*1.55,sc);dm.rotation.set(0,a.h,0);dm.updateMatrix();bodies.setMatrixAt(i,dm.matrix);
    dm.position.set(a.x,y+bob+1.78,a.z);dm.scale.set(sc,sc,sc);dm.updateMatrix();heads.setMatrixAt(i,dm.matrix);}
  bodies.instanceMatrix.needsUpdate=true;heads.instanceMatrix.needsUpdate=true;});
