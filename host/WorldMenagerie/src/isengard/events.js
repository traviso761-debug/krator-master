// ---------- what happens at Isengard ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// Saruman's Isengard is always working - the furnaces going, the files of orcs on the roads, the hosts on the
// Isen Road - but these are the things that happen, every minute or two on their own or from the Events button
// (src/core/happenings.js; #event=<name> in the address; #evspeed=N to watch one through fast). They are
// Saruman's Isengard's: the Treegarth stops them and takes away what they left.
//
//   uruks     Saruman speaks from the balcony of Orthanc to a host drawn up in column on the Way of the Gate,
//             and it marches - out through the tunnel and south down the Isen Road, torches and white banners
//   ents      the Ents come out of Fangorn and across the valley, and batter the Ring-wall; then they loose the
//             Isen, and the Ring floods until the furnaces go out in steam. It stays drowned, with the Ents
//             standing round it, until the page goes to the Treegarth
//   nazgul    a winged Nazgul comes to Orthanc, circles the horns, and goes
//   palantir  a red light in the high window: Saruman is looking in the Stone
//   felling   orcs cutting at the eaves of Fangorn, and the trees coming down
import { mkRng } from '../core/rng.js';
import { createHappenings } from '../core/happenings.js';
import { createDust } from '../core/dust.js';
import { makeEnt } from './treegarth.js';
import { RI,RO,GATE_A,FLOOR,plainY } from './plan.js';
import { fangornEdge } from './fangorn.js';

export function events(api){
  const {THREE,ctx,scene,groundH,hemi,ambient,ROADS,joinChains,polyLen,polyAt}=api;
  const R=mkRng(Date.now()%100000),D=new THREE.Object3D();
  const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const own=o=>{o.traverse(q=>{q.userData.noFingerprint=true;});scene.add(o);return o;};
  const dust=createDust(api,{max:9000,size:30,color:0x6e6558,drag:0.5,gravity:1.2,wind:[3,0,1.5]});
  const steam=createDust(api,{max:6000,size:26,color:0xdcdad4,drag:0.5,gravity:-1.6,wind:[2,0,1]});
  const spray=createDust(api,{max:5000,size:5,color:0xcfd8dc,drag:1.0,gravity:5,wind:[0,0,0]});
  const embers=createDust(api,{max:2000,size:2,color:0xffa446,drag:0.9,gravity:-0.8,wind:[2,0,1]});
  let H=null;
  const go=(fn,end)=>H.run((now,dt)=>{if(ctx.war===false){end&&end();return false;}const r=fn(now,dt);if(r===false&&end)end();return r;});
  const O=ctx.orthanc,Rg=ctx.ring;
  const fireLight=new THREE.PointLight(0xff8a30,0,220,1.3);scene.add(fireLight);
  const redLight=new THREE.PointLight(0xff3010,0,160,1.4);scene.add(redLight);

  // a figure: a robe, a head, and for Saruman a staff. Built facing +z.
  const figure=(col,scale,staff)=>{const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:col,flatShading:true});
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.4,1.5,7).translate(0,0.75,0),m));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6).translate(0,1.62,0),new THREE.MeshLambertMaterial({color:0xd8d6d0})));
    let orb=null;if(staff){g.add(new THREE.Mesh(new THREE.BoxGeometry(0.05,2.1,0.05).translate(0.34,1.05,0.1),new THREE.MeshLambertMaterial({color:0x1a1a1c})));
      orb=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),new THREE.MeshBasicMaterial({color:0xf4f6ff}));orb.position.set(0.34,2.15,0.1);g.add(orb);}
    g.scale.setScalar(scale);return {g,orb};};

  // ---- the Uruk-hai go to war ----
  // The column stands on the Way of the Gate from the foot of Orthanc to the gate, eight abreast, and marches along
  // one line: up the Way, through the tunnel, and down the Isen Road. Each rank is a distance along that line, so
  // moving the column is adding to one number.
  let marching=false;
  function uruks(){
    if(marching||!O)return;marching=true;
    const road=[];for(const r of ROADS)if(/Isen Road/.test(r.name||''))road.push(r.pts);
    let south=joinChains(road,40)[0]||[[0,RO+10],[0,RO+3000]];
    if(south[0][1]>south[south.length-1][1])south=south.slice().reverse();      // it runs south, from the gate
    const way=[[0,150],[0,RO+5],...south];
    const path=polyLen({pts:way});
    const FILE=8,STEP=1.7,N=3200,RANKS=Math.ceil(N/FILE),s0=RO+5-150;       // the front rank starts at the gate
    const uruk=new THREE.MeshLambertMaterial({color:0x221e1b,flatShading:true});
    const bodies=own(new THREE.InstancedMesh(new THREE.BoxGeometry(0.85,2.0,0.6).translate(0,1.0,0),uruk,N));
    const pikes=own(new THREE.InstancedMesh(new THREE.BoxGeometry(0.1,3.8,0.1).translate(0.4,1.9,0),new THREE.MeshLambertMaterial({color:0x3a3530}),N));
    const handM=new THREE.MeshLambertMaterial({color:0xece8e0,side:THREE.DoubleSide});
    const NB=24,banners=own(new THREE.InstancedMesh(new THREE.PlaneGeometry(2.2,2.8).translate(1.1,6.6,0),handM,NB));
    const torchM=new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:0.95,depthWrite:false,blending:THREE.AdditiveBlending});
    const NT=180,torches=own(new THREE.InstancedMesh(new THREE.SphereGeometry(0.45,6,5),torchM,NT));
    for(const m of [bodies,pikes,banners,torches])m.frustumCulled=false;
    const sar=figure(0xf2f2f0,1.4,true);own(sar.g);
    const [bx,by,bz]=O.balcony;sar.g.position.set(bx,by,bz);sar.g.rotation.y=Math.atan2(bx-O.x,bz-O.z);
    let t=0,s=0,said=0,alive=true;const V=5.5,T0=16;
    H.notice('Saruman speaks','- from the balcony of Orthanc, to the host drawn up on the Way of the Gate below him: ten thousand Uruk-hai, and the White Hand on their shields.',
      // from the east, over the column, with the balcony at the edge of the picture
      ()=>[O.x+150,O.base+75,O.z+70,O.x,O.base+8,O.z+330]);
    const end=()=>{alive=false;marching=false;for(const o of [bodies,pikes,banners,torches,sar.g])scene.remove(o);};
    const front=()=>{const [x,z]=polyAt(path,s0+s);return [x,groundH(x,z),z];};
    go((now,dt)=>{t+=dt;
      // he raises his staff, and the host roars; then the front rank moves off
      const raise=clamp((t-3)/2,0,1)*(1-clamp((t-12)/2,0,1));sar.orb.scale.setScalar(1+raise*4);sar.orb.material.color.setScalar(1);
      hemi.intensity*=1+raise*0.15*Math.max(0,Math.sin(t*9));
      if(t>T0){s+=V*dt;if(said<1){said=1;H.notice('The host marches','- out of the Ring through the tunnel under the southern wall, and down the Isen Road towards the Fords and the Deep, with torches.',
        ()=>{const [x,,z]=front();return [x+140,groundH(x,z)+90,z-60,x,groundH(x,z)+4,z+40];},()=>alive?front():null);}}
      const roar=t>6&&t<T0?Math.abs(Math.sin(t*5)):0;
      let n=0,bi=0,ti=0,gone=0;
      for(let rk=0;rk<RANKS;rk++){const sr=s0+s-rk*STEP;
        if(sr>path.len-40){gone+=FILE;continue;}
        const [x,z]=polyAt(path,sr),[x2,z2]=polyAt(path,sr+2),hd=Math.atan2(x2-x,z2-z),cx=Math.cos(hd),sx=Math.sin(hd);
        for(let f=0;f<FILE&&n<N;f++){const off=(f-(FILE-1)/2)*1.8,px=x+cx*off,pz=z-sx*off,py=groundH(px,pz)+(t>T0?Math.abs(Math.sin(t*6+rk*0.7))*0.12:roar*0.25);
          D.position.set(px,py,pz);D.rotation.set(0,hd,0);D.scale.setScalar(1.15);D.updateMatrix();bodies.setMatrixAt(n,D.matrix);pikes.setMatrixAt(n,D.matrix);n++;
          if(f===FILE-1&&rk%16===4&&bi<NB){banners.setMatrixAt(bi++,D.matrix);}
          if((f===0||f===FILE-1)&&rk%3===1&&ti<NT){D.position.y+=2.6;D.position.x+=0.3;D.updateMatrix();torches.setMatrixAt(ti++,D.matrix);}}}
      bodies.count=pikes.count=n;banners.count=bi;torches.count=ti;
      for(const m of [bodies,pikes,banners,torches])m.instanceMatrix.needsUpdate=true;
      if(t>T0+5&&R()<0.5){const [x,,z]=front();dust.emit(x+(R()-0.5)*10,groundH(x,z)+1,z+(R()-0.5)*10,(R()-0.5)*2,1+R()*2,(R()-0.5)*2,6,24);}
      if(n===0&&t>T0)return false;
    },end);}

  // ---- the Ents ----
  let entsOut=null,flood=null;
  function drain(){if(flood){scene.remove(flood.mesh);flood=null;}if(entsOut){for(const e of entsOut)scene.remove(e.g);entsOut=null;}if(ctx.works)ctx.works.quench(0);}
  (ctx.onWar=ctx.onWar||[]).push(()=>drain());
  function ents(){
    if(entsOut||!Rg)return;
    const N=26;entsOut=[];
    for(let i=0;i<N;i++){const e=makeEnt(THREE,R,10+R()*6);own(e.g);
      const z0=-900+(i/N-0.5)*1600+(R()-0.5)*80,x0=fangornEdge(z0)-60-R()*120;
      // where it goes: a place at the foot of the wall on the east side, facing it
      const a=-1.05+2.1*(i+0.5)/N,tx=Math.cos(a)*(RO+12),tz=Math.sin(a)*(RO+12);
      entsOut.push({...e,x0,z0,tx,tz,a,ph:R()*6.28,v:32+R()*8,hit:R()*6.28});}
    // and five more to the dam above the Ring, to break it when the others are at the walls
    const Dm=ctx.dam,damEnts=[];
    if(Dm)for(let i=0;i<5;i++){const e=makeEnt(THREE,R,12+R()*5);own(e.g);const z0=Dm.z+(R()-0.5)*300,x0=2600+R()*400;
      const e2={...e,dam:true,x0,z0,tx:Dm.x+(i-2)*16,tz:Dm.z+2,ph:R()*6.28,v:34+R()*6,hit:R()*6.28};entsOut.push(e2);damEnts.push(e2);}
    // the flood wave runs down the Isen's own course, from the dam to the grating in the Ring
    const ipts=ctx.isen&&ctx.isen.pts,icum=[0];let iDam=0,iRing=0;
    if(ipts&&Dm){for(let i=1;i<ipts.length;i++)icum.push(icum[i-1]+Math.hypot(ipts[i][0]-ipts[i-1][0],ipts[i][1]-ipts[i-1][1]));
      let bd=1e9,br=1e9;ipts.forEach(([x,z],i)=>{const d1=Math.hypot(x-Dm.x,z-Dm.z);if(d1<bd){bd=d1;iDam=i;}const d2=Math.abs(Math.hypot(x,z)-RO);if(z<0&&d2<br){br=d2;iRing=i;}});}
    let damT=-1,damAt=-1,waveS=-1,floodGo=false;
    let t=0,said=0,arrive=0;const dead=()=>!entsOut;
    const lead=entsOut[Math.floor(N/2)];
    H.notice('The Ents','- out of the eaves of Fangorn and across the valley, more of them than anyone has ever seen together, and angry. Their going shakes the ground.',
      ()=>{const p=lead.g.position;return [p.x-140,p.y+70,p.z+180,p.x+40,p.y+8,p.z];},()=>entsOut?lead.g.position:null);
    go((now,dt)=>{t+=dt;if(dead())return false;
      let arrived=0;
      for(const e of entsOut){const dx=e.tx-e.x0,dz=e.tz-e.z0,L=Math.hypot(dx,dz),s=Math.min(L,t*e.v),k=s/L;
        const x=e.x0+dx*k,z=e.z0+dz*k;
        if(e.dam){if(k<1){e.g.position.set(x,groundH(x,z),z);e.g.rotation.y=Math.atan2(dx,dz);e.stride(t*2.2+e.ph);}
          else{e.at=1;e.g.position.set(e.tx,damT<0?Dm.crest+1.5:Dm.crest+1.5-Math.min(30,(t-damT)*6),e.tz);e.g.rotation.y=Math.PI;
            if(damT<0){const sw=Math.sin(t*2.6+e.hit);e.stride(sw*1.2);if(sw>0.97&&R()<0.5)for(let k2=0;k2<10;k2++)dust.emit(e.tx,Dm.crest,e.tz+(R()-0.5)*8,(R()-0.5)*8,R()*6,(R()-0.5)*8,4,12);}
            else e.stride(Math.sin(t*0.6+e.ph)*0.2);}
          continue;}
        if(k<1){e.g.position.set(x,groundH(x,z),z);e.g.rotation.y=Math.atan2(dx,dz);e.stride(t*2.2+e.ph);if(R()<0.05)dust.emit(x,groundH(x,z)+1,z,(R()-0.5)*3,1+R()*2,(R()-0.5)*3,4,16);}
        else{arrived++;e.g.position.set(e.tx,groundH(e.tx,e.tz),e.tz);e.g.rotation.y=Math.atan2(-Math.cos(e.a),-Math.sin(e.a));
          // battering the wall: the arms swing, and rock and dust come off it
          if(!flood){const sw=Math.sin(t*2.6+e.hit);e.stride(sw*1.2);
            // long enough at one place and it comes down: the segment of wall it is at is torn to a stump
            e.batter=(e.batter||0)+dt;if(!e.broke&&e.batter>9+e.hit*2){e.broke=1;if(ctx.ring.breach(ctx.ring.segAt(e.a))){
              const wx=Math.cos(e.a)*RO,wz=Math.sin(e.a)*RO;for(let k2=0;k2<220;k2++){const a2=e.a+(R()-0.5)*0.12;
                dust.emit(Math.cos(a2)*(RO+(R()-0.5)*40),Rg.base+R()*45,Math.sin(a2)*(RO+(R()-0.5)*40),(R()-0.5)*14,R()*10,(R()-0.5)*14,5+R()*5,24+R()*18);}
              if(said<0.5){said=0.5;H.notice('The wall breaks','- a whole length of the Ring comes down, the black rock splitting like bark; they go on to the next.',
                ()=>[wx+Math.cos(e.a)*260,Rg.base+110,wz+Math.sin(e.a)*260,wx,Rg.base+20,wz]);}}}
            if(sw>0.97&&R()<0.5){const wx=Math.cos(e.a)*(RO+1),wz=Math.sin(e.a)*(RO+1),wy=Rg.base+10+R()*30;
              for(let k2=0;k2<14;k2++)dust.emit(wx,wy,wz,Math.cos(e.a)*(4+R()*8)+(R()-0.5)*6,R()*8,Math.sin(e.a)*(4+R()*8)+(R()-0.5)*6,4+R()*3,14+R()*10);}}
          else e.stride(Math.sin(t*0.6+e.ph)*0.2);}}
      if(arrived>N*0.7&&!arrive){arrive=t;H.notice('At the walls','- they are at the Ring, tearing at the rock with their hands; stones as big as a man come away like crusts of bread.',
        ()=>[lead.tx+300,Rg.base+120,lead.tz-120,lead.tx,Rg.base+20,lead.tz]);}
      // then the dam: when the others are at the walls, the ones on the dam tear its middle out, and the whole of
      // the reservoir goes down the glen - a wave running down the Isen's course to the grating in the Ring
      if(Dm&&damAt<0&&damEnts.length&&damEnts.every(e=>e.at))damAt=t;
      if(Dm&&damT<0&&damAt>=0&&arrive&&t>Math.max(damAt+8,arrive+12)){damT=t;Dm.breakIt();waveS=icum[iDam];
        H.notice('The dam breaks','- the Ents on Saruman\'s dam tear the middle out of it, and the whole of the water behind it goes down the glen in one wave, towards the Ring.',
          ()=>[Dm.x+420,Dm.crest+140,Dm.z+380,Dm.x,Dm.crest-10,Dm.z+120]);}
      if(waveS>=0&&!floodGo){waveS+=dt*45;let i=iDam;while(i<icum.length-1&&icum[i]<waveS)i++;const [wx,wz]=ipts[i],wy=ctx.isen.ys[i];
        for(let k2=0;k2<26;k2++)spray.emit(wx+(R()-0.5)*40,wy+1+R()*3,wz+(R()-0.5)*40,(R()-0.5)*8,3+R()*8,(R()-0.5)*8,1.5+R(),4);
        for(let k2=0;k2<4;k2++)steam.emit(wx+(R()-0.5)*30,wy+2,wz+(R()-0.5)*30,(R()-0.5)*3,2+R()*3,(R()-0.5)*3,5,22);
        if(i>=iRing)floodGo=true;}
      if(!flood&&(floodGo||(!Dm&&arrive&&t>arrive+22))){
        H.notice('The Isen is loosed','- the wave comes down the glen and in at the grating under the wall, and the plain goes under. Where it meets the fires there is steam in columns.',
          ()=>[O.x+420,O.base+160,O.z-360,O.x,O.base+10,O.z]);
        const g=new THREE.CircleGeometry(RI-1,120).rotateX(-Math.PI/2);
        const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0x4d5a54,specular:0xc8d4d8,shininess:60,transparent:true,opacity:0.9}));
        m.receiveShadow=true;own(m);flood={mesh:m,t0:t,level:plainY(0)-1};}
      if(flood){const u=clamp((t-flood.t0)/45,0,1);flood.level=lerp(plainY(0)-1,FLOOR+9,ease(u));flood.mesh.position.set(Rg.x,flood.level+0.4*Math.sin(t*0.8),Rg.z);
        if(ctx.works){ctx.works.quench(u*1.2);
          // steam where the water reaches the vents and chimneys
          for(const v of ctx.works.vents)if(v.y<flood.level+3&&v.y>flood.level-4&&R()<0.2)steam.emit(v.x,flood.level+1,v.z,(R()-0.5)*2,6+R()*6,(R()-0.5)*2,6+R()*6,20+R()*16);
          if(R()<0.6){const s2=ctx.works.stacks[Math.floor(R()*ctx.works.stacks.length)];if(s2)steam.emit(s2.x,s2.y,s2.z,(R()-0.5)*2,8+R()*6,(R()-0.5)*2,8+R()*6,26);}}
        // the torrent at the grating
        const ia=-Math.PI/4;for(let k2=0;k2<(u<1?8:2);k2++)spray.emit(Math.cos(ia)*(RI-4)+(R()-0.5)*10,flood.level+1,Math.sin(ia)*(RI-4)+(R()-0.5)*10,-Math.cos(ia)*(6+R()*10),3+R()*6,-Math.sin(ia)*(6+R()*10),1.5+R(),3);
        if(u>=1&&said<1){said=1;H.notice('Drowned','- the fires are out, and Orthanc stands up out of a lake. The Ents stand round the Ring and watch the tower; nothing comes out of it.',null);return false;}}
      if(t>400)return false;},()=>{/* the Ents and the water stay until the Treegarth */});}

  // ---- a Nazgul at Orthanc ----
  function makeBeast(S){const g=new THREE.Group(),M=new THREE.MeshLambertMaterial({color:0x2c2a30,flatShading:true,side:THREE.DoubleSide});
    const m=(geo,x,y,z)=>{const q=new THREE.Mesh(geo,M);q.position.set(x,y,z);g.add(q);return q;};
    m(new THREE.SphereGeometry(S*0.2,10,7),0,0,0).scale.set(0.9,0.8,2.0);m(new THREE.CylinderGeometry(S*0.05,S*0.1,S*0.7,6).rotateX(Math.PI/2),0,S*0.08,S*0.5);
    m(new THREE.ConeGeometry(S*0.08,S*0.3,6).rotateX(Math.PI/2),0,S*0.12,S*0.95);m(new THREE.ConeGeometry(S*0.09,S*1.3,6).rotateX(-Math.PI/2),0,0,-S*0.9);
    const wings=[];for(const sd of [-1,1]){const w=new THREE.Group();w.position.set(sd*S*0.12,S*0.05,0);g.add(w);
      const v=[[0,0,S*0.3],[sd*S*0.6,0,S*0.38],[sd*S*1.2,0,-S*0.1],[sd*S*0.7,0,-S*0.45],[0,0,-S*0.35]];
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,1,4,1,3,4,1,2,3].map(i=>v[i]).flat(),3));geo.computeVertexNormals();
      w.add(new THREE.Mesh(geo,M));wings.push({w,sd});}
    return {g,flap(now,k){const b=Math.sin(now*0.004);for(const q of wings)q.w.rotation.z=q.sd*b*k;}};}
  function nazgul(){
    if(!O)return;const b=makeBeast(22);own(b.g);const top=O.top;
    const pts=[[4200,1400,-3800],[1200,700,-900],[180,top[1]+60,0],[0,top[1]+70,-180],[-180,top[1]+60,0],[0,top[1]+50,180],[150,top[1]+45,0],[0,top[1]+40,-150],[-900,900,1200],[-5000,1800,4000]];
    const curve=new THREE.CatmullRomCurve3(pts.map(([x,y,z])=>new THREE.Vector3(x,y,z)));
    const T=46;let t=0;const P0=new THREE.Vector3(),P1=new THREE.Vector3();
    H.notice('A Nazgul','- a winged shadow out of the east, coming down on Orthanc. It circles the horns of the tower twice, and the plain goes quiet under it.',
      // not followed: a flyer dragged the camera down through the ground with it
      ()=>[O.x+320,O.base+220,O.z+260,O.x,top[1],O.z]);
    go((now,dt)=>{t+=dt;const u=t/T;if(u>=1){scene.remove(b.g);return false;}
      curve.getPointAt(u,P0);curve.getPointAt(Math.min(1,u+0.004),P1);b.g.position.copy(P0);b.g.lookAt(P1);b.g.rotateZ(u>0.25&&u<0.75?-0.3:0);
      b.flap(now,u>0.25&&u<0.75?0.3:0.65);
      const k=clamp(1-Math.abs(u-0.5)/0.25,0,1)*0.35;hemi.intensity*=1-k;ambient.intensity*=1-k;
    },()=>scene.remove(b.g));}

  // ---- the palantir ----
  function palantir(){
    if(!O)return;const w=O.palantir,mat=w.material,base=mat.color.clone();const p=w.position;
    H.notice('The palantir','- a red light in the high window of Orthanc. Saruman is looking in the Stone, and something is looking back.',
      ()=>[p.x+80,p.y+10,p.z+110,p.x,p.y,p.z]);
    let t=0;
    go((now,dt)=>{t+=dt;const k=clamp(t/3,0,1)*clamp((24-t)/3,0,1),pulse=k*(0.6+0.4*Math.sin(t*3.1)+0.2*Math.sin(t*7.7));
      mat.color.setRGB(0.16+pulse*0.84,0.05+pulse*0.25,0.02+pulse*0.04);redLight.position.set(p.x,p.y,p.z);redLight.intensity=pulse*2.4;
      if(t>24){mat.color.copy(base);redLight.intensity=0;return false;}},()=>{mat.color.copy(base);redLight.intensity=0;});}

  // ---- felling at the eaves ----
  function felling(){
    const z0=-640+(R()-0.5)*600,x0=fangornEdge(z0)-20;
    const bark=new THREE.MeshLambertMaterial({color:0x3e3328,flatShading:true}),leaf=new THREE.MeshLambertMaterial({color:0x33492a,flatShading:true});
    const trees=[];for(let i=0;i<14;i++){const g=new THREE.Group(),h=16+R()*12;
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.1,h*0.65,6).translate(0,h*0.32,0),bark));
      const c=new THREE.Mesh(new THREE.IcosahedronGeometry(h*0.33,1),leaf);c.position.y=h*0.72;g.add(c);
      const x=x0-10-R()*60,z=z0+(R()-0.5)*160;g.position.set(x,groundH(x,z),z);g.rotation.order='YXZ';g.rotation.y=R()*6;own(g);
      trees.push({g,t:6+i*3.5+R()*2,fall:0,dir:R()<0.5?-1:1});}
    const orcM=new THREE.MeshLambertMaterial({color:0x2b2621,flatShading:true}),crew=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),orcM,40);
    for(let i=0;i<40;i++){const x=x0-30-R()*80,z=z0+(R()-0.5)*180;D.position.set(x,groundH(x,z),z);D.rotation.set(0,R()*6,0);D.scale.setScalar(1.15);D.updateMatrix();crew.setMatrixAt(i,D.matrix);}
    crew.frustumCulled=false;own(crew);
    const fx=x0-90,fz=z0;let t=0,said=0;
    H.notice('Felling at the eaves','- orcs with axes at the edge of Fangorn, cutting for the furnaces, and fires to burn out what they cannot drag away. The trees are coming down one after another.',
      ()=>[x0-260,groundH(x0,z0)+80,z0+220,x0-20,groundH(x0,z0)+10,z0]);
    const end=()=>{for(const q of trees)scene.remove(q.g);scene.remove(crew);fireLight.intensity=0;};
    go((now,dt)=>{t+=dt;
      for(const q of trees)if(t>q.t){q.fall=Math.min(1,q.fall+dt*(0.2+q.fall*1.6));q.g.rotation.x=q.dir*Math.PI/2*0.96*q.fall;
        if(q.fall>=1&&!q.down){q.down=1;const p=q.g.position;for(let k=0;k<30;k++)dust.emit(p.x+(R()-0.5)*20,p.y+1,p.z+(R()-0.5)*20,(R()-0.5)*6,1+R()*3,(R()-0.5)*6,4,18);}}
      // the fire where they burn the brash
      fireLight.position.set(fx,groundH(fx,fz)+6,fz);fireLight.intensity=1.8*clamp(t/4,0,1)*clamp((70-t)/4,0,1)*(0.8+0.2*Math.sin(t*9));
      if(R()<0.7)dust.emit(fx+(R()-0.5)*8,groundH(fx,fz)+3,fz+(R()-0.5)*8,(R()-0.5),4+R()*3,(R()-0.5),10,20);
      if(R()<0.5)embers.emit(fx+(R()-0.5)*6,groundH(fx,fz)+2,fz+(R()-0.5)*6,(R()-0.5)*3,4+R()*5,(R()-0.5)*3,2,2);
      if(t>50&&said<1){said=1;H.notice('Fangorn','- and something in the wood behind them is moving that is not wind.',null);}
      if(t>74)return false;},end);}

  H=createHappenings(api,{
    events:{uruks:['The Uruk-hai go to war',uruks],ents:['The Ents',ents],nazgul:['A Nazgul',nazgul],palantir:['The palantir',palantir],felling:['Felling at the eaves',felling]},
    order:['palantir','felling','uruks','nazgul','felling','ents','palantir','uruks'],
    active:()=>ctx.war!==false,
    colours:{bg:'rgba(16,16,18,.9)',fg:'#e8e6e0',edge:'#6a6862',btn:'rgba(40,40,44,.92)',btnEdge:'#9a968e'}});
  ctx.details=Object.assign(ctx.details||{},{events:5});
}
