// ---------- Moria, or Khazad-dum ----------
// Fan work from Tolkien.
//
// The page opens on Moria as the Fellowship found it: dark, the halls empty but for orcs, bones in the passages,
// some of the great pillars thrown down. The switch goes back to Khazad-dum in Durin's day: the lamps of crystal
// lit on every pillar and all along the walls, the Doors of Durin standing open to the west, and Dwarves going
// about the halls. It is Minas Tirith's war switch under another name and drives the same flags (ctx.war is true
// for Moria), so everything shared that knows about ctx.war - the events - needs nothing new. #war=off opens on
// Khazad-dum.
import { mkRng } from '../core/rng.js';
import { HALLS,FLOOR,PASSAGES } from './plan.js';

export function realm(api){
  const {THREE,ctx,scene,animHooks,onUI,HASH0}=api;
  const R=mkRng(1981),D=new THREE.Object3D();
  const WAR=ctx.warParts=ctx.warParts||[],PEACE=ctx.peaceParts=ctx.peaceParts||[];
  const add=(o,list)=>{o.userData.noFingerprint=true;scene.add(o);list.push(o);return o;};
  const H=HALLS,pillars=(ctx.moria&&ctx.moria.pillars)||[];

  // ---- Khazad-dum: the lamps ----
  const lampM=new THREE.MeshBasicMaterial({color:0xd8ecff});
  const lampSpots=[];
  for(const [x,z,fl] of pillars){const r=fl>FLOOR?2.5:4.3;for(let k=0;k<4;k++){const a=k*Math.PI/2;lampSpots.push([x+Math.cos(a)*r,fl+10,z+Math.sin(a)*r]);}}
  for(const key of ['dwarrowdelf','second','first','passage','twentyfirst','mansions','forges','throne','delvings','cistern']){const [x0,x1,z0,z1,fl]=H[key];for(let x=x0+10;x<x1;x+=20)for(const z of [z0+0.6,z1-0.6])lampSpots.push([x,fl+8,z]);}
  for(const key in PASSAGES){const p=PASSAGES[key].p;for(let s=0;s+1<p.length;s++){const [ax,az,ay]=p[s],[bx,bz,by]=p[s+1],n=Math.max(2,Math.round(Math.hypot(bx-ax,bz-az)/40));
    for(let i=0;i<n;i++){const t=(i+0.5)/n;lampSpots.push([ax+(bx-ax)*t,ay+(by-ay)*t+6,az+(bz-az)*t]);}}}
  // and along the galleries of the great hall, level above level (and the terraces of the Mansions, which city.js adds to the same list), on the outer edge of each
  for(const [z,y,x0,x1,sd] of (ctx.moria&&ctx.moria.galleries)||[])for(let x=x0+26;x<x1;x+=24)lampSpots.push([x,y+2.2,z+sd*1.4]);
  const lamps=new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.55,0),lampM,lampSpots.length);
  lampSpots.forEach(([x,y,z],i)=>{D.position.set(x,y,z);D.rotation.set(0,0,0);D.scale.set(1,1.6,1);D.updateMatrix();lamps.setMatrixAt(i,D.matrix);});
  lamps.frustumCulled=false;add(lamps,PEACE);
  // a few lights of their own, so the lamps are seen to light the hall and not only to shine
  // Three lights serve both states - every light costs every material on the page - over the halls in
  // Khazad-dum, cool and bright, and at the orcs' fires in Moria, warm and low. The switch moves them.
  // Where they go is wherever you are: the city is too big for three lights to light it all, so each is moved,
  // a few times a second, to the nearest of the places a light belongs - the middle of a hall, the forges, the
  // pit - and in Moria, to the nearest of the orcs' fires.
  const M0=H.mansions,mid=(k,dy,d,c)=>[(H[k][0]+H[k][1])/2,H[k][4]+dy,(H[k][2]+H[k][3])/2,d,c||0xcfe4ff];
  const SPOTS=[[3950,FLOOR+40,0,500,0xcfe4ff],[4450,FLOOR+40,0,500,0xcfe4ff],mid('second',30,500),mid('first',15,300),mid('twentyfirst',20,300),mid('mazarbul',8,80),
    [3950,M0[4]+70,510,420,0xdce8ff],[4200,M0[4]+70,510,420,0xdce8ff],[4450,M0[4]+70,510,420,0xdce8ff],[4200,M0[4]+30,360,260,0xffd8a0],[4200,M0[4]+30,660,260,0xffd8a0],
    mid('forges',14,320,0xff9040),mid('delvings',30,380,0xb8d8ff),mid('throne',30,420),mid('cistern',30,420,0xb8d0e0)];
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight(0xcfe4ff,0,700,1.0);scene.add(l);return l;});
  let picked=0;

  // ---- Khazad-dum: the Dwarves ----
  const dwarfM=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true});
  const ND=260,dwarves=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35,0.55,1.35,6).translate(0,0.68,0),dwarfM,ND);
  const cols=[0x7a3a2a,0x3a4a6a,0x5a5a3a,0x6a4a2a,0x4a3a5a,0x8a7a4a].map(h=>new THREE.Color(h));
  const walkers=[];for(let i=0;i<ND;i++){const key=['dwarrowdelf','dwarrowdelf','mansions','mansions','mansions','second','first','twentyfirst','throne','forges'][Math.floor(R()*10)],[x0,x1,z0,z1,fl]=H[key];
    // in the Mansions they keep to the avenue; in the forges, to the aisle between the hearths
    const zz=key==='mansions'?(z0+z1)/2+(R()-0.5)*34:key==='forges'?410+(R()<0.5?-12:12):z0+6+R()*(z1-z0-12);
    walkers.push({x0:key==='mansions'?x0+60:x0,x1,z:zz,fl,ph:R(),v:(1.2+R()*0.6)/(x1-x0),dir:R()<0.5?1:-1});dwarves.setColorAt(i,cols[Math.floor(R()*cols.length)]);}
  dwarves.frustumCulled=false;add(dwarves,PEACE);

  // ---- Moria: orcs round their fires, bones, and the fallen pillars ----
  const orcM=new THREE.MeshLambertMaterial({color:0x2a2520,flatShading:true});
  const camps=[];for(let c=0;c<14;c++){const key=c<6?'dwarrowdelf':c<8?'second':c<9?'twentyfirst':c<11?'delvings':c<13?'throne':'first',[x0,x1,z0,z1,fl]=H[key];camps.push([x0+20+R()*(x1-x0-40),z0+15+R()*(z1-z0-30),fl]);}
  const NO=camps.length*14,orcs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.6,0.6).translate(0,0.8,0),orcM,NO);let n=0;
  for(const [cx,cz,fl] of camps)for(let k=0;k<14;k++){const a=k/14*Math.PI*2+R()*0.3,r=4+R()*3;D.position.set(cx+Math.cos(a)*r,fl,cz+Math.sin(a)*r);D.rotation.set(0,-a+Math.PI/2,0);D.scale.set(1.15,R()<0.5?0.7:1.15,1.15);D.updateMatrix();orcs.setMatrixAt(n++,D.matrix);}
  orcs.frustumCulled=false;add(orcs,WAR);
  const fireM=new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending});
  const fires=new THREE.InstancedMesh(new THREE.ConeGeometry(1.1,3,6).translate(0,1.5,0),fireM,camps.length);fires.frustumCulled=false;add(fires,WAR);

  const boneM=new THREE.MeshLambertMaterial({color:0xcfc6b0,flatShading:true});
  {const nb=900,bones=new THREE.InstancedMesh(new THREE.BoxGeometry(0.12,0.12,0.7),boneM,nb);
   // spread by floor area, so a small room is not paved with them - except Mazarbul, where Balin's folk made their last stand
   const KEYS=['dwarrowdelf','second','first','passage','twentyfirst','guard','mansions','forges','throne','delvings'],AREA=KEYS.map(k=>(H[k][1]-H[k][0])*(H[k][3]-H[k][2])),TOT=AREA.reduce((a,b)=>a+b,0);
   const pick=()=>{let r=R()*TOT;for(let k=0;k<KEYS.length;k++){r-=AREA[k];if(r<0)return KEYS[k];}return KEYS[0];};
   for(let i=0;i<nb;i++){const key=i<60?'mazarbul':pick(),[x0,x1,z0,z1,fl]=H[key];
     D.position.set(x0+2+R()*(x1-x0-4),fl+0.06,z0+2+R()*(z1-z0-4));D.rotation.set(0,R()*6,0);D.scale.setScalar(0.6+R()*0.8);D.updateMatrix();bones.setMatrixAt(i,D.matrix);}
   bones.frustumCulled=false;add(bones,WAR);}
  // pillars thrown down: lying across the floor of the great hall, with their rubble
  const pillarM=new THREE.MeshPhongMaterial({color:0x5a554e,specular:0x222222,shininess:12,flatShading:true});
  {const [x0,x1,z0,z1,fl,h]=H.dwarrowdelf,fallen=new THREE.InstancedMesh(new THREE.BoxGeometry(8,8,h*0.8),pillarM,6);
   for(let i=0;i<6;i++){D.position.set(x0+80+R()*(x1-x0-160),fl+4,z0+60+R()*(z1-z0-120));D.rotation.set(0,R()*6,0);D.scale.set(1,1,1);D.updateMatrix();fallen.setMatrixAt(i,D.matrix);}
   fallen.frustumCulled=false;add(fallen,WAR);}

  // ---- the switch ----
  const placeLights=()=>{picked=0;};
  const pickLights=glory=>{const p=api.camera.position,list=glory?SPOTS:camps.map(([x,z,fl])=>[x,fl+3,z,90,0xff9a40]);
    const near=list.map(q=>[q,(q[0]-p.x)**2+(q[1]-p.y)**2*4+(q[2]-p.z)**2]).sort((a,b)=>a[1]-b[1]).slice(0,3);
    lights.forEach((l,i)=>{const q=near[i]&&near[i][0];if(!q){l.visible=false;return;}l.visible=true;l.position.set(q[0],q[1],q[2]);l.distance=q[3];l.color.setHex(q[4]);});};
  const set=on=>{ctx.war=on;placeLights(!on);for(const o of ctx.warParts||[])o.visible=on;for(const o of ctx.peaceParts||[])o.visible=!on;
    if(ctx.details)ctx.details.mode=on?'moria':'khazad-dum';if(ctx.westgate)ctx.westgate.setOpen(!on);
    for(const f of ctx.onWar||[])try{f(on);}catch(e){api.report&&api.report('realm',e);}};
  set(!/(^|&)war=off/.test(HASH0||''));
  onUI(({mkBtn,ui})=>{const label=()=>ctx.war?'Moria':'Khazad-dûm';
    const b=mkBtn(label(),ui,()=>{set(!ctx.war);b.textContent=label();b.setAttribute('aria-pressed',String(!!ctx.war));});
    b.setAttribute('aria-pressed',String(!!ctx.war));b.title='Moria in the dark, as the Fellowship found it, or Khazad-dûm in Durin\'s day, the lamps lit';});

  let t0=performance.now();
  animHooks.push(now=>{const t=(now-t0)/1000,glory=ctx.war===false;
    if(now-picked>250){picked=now;pickLights(glory);}
    for(const l of lights)l.intensity=glory?1.35:1.2+0.4*Math.sin(t*9+l.position.x);
    if(glory){walkers.forEach((w,i)=>{const u=((t*w.v)+w.ph)%1,s=w.dir>0?u:1-u,x=w.x0+4+s*(w.x1-w.x0-8);
        D.position.set(x,w.fl+Math.abs(Math.sin(t*7+i))*0.05,w.z);D.rotation.set(0,w.dir>0?Math.PI/2:-Math.PI/2,0);D.scale.set(1.2,1.2,1.2);D.updateMatrix();dwarves.setMatrixAt(i,D.matrix);});
      dwarves.instanceMatrix.needsUpdate=true;}
    else{camps.forEach(([x,z,fl],i)=>{D.position.set(x,fl,z);D.rotation.set(0,0,0);D.scale.set(1,0.8+0.4*Math.sin(t*8+i),1);D.updateMatrix();fires.setMatrixAt(i,D.matrix);});fires.instanceMatrix.needsUpdate=true;}});
  ctx.details=Object.assign(ctx.details||{},{lamps:lampSpots.length,dwarves:ND,orcCamps:camps.length});
}
