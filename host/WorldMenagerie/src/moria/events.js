// ---------- what happens in Moria ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// In Moria's dark (not in Khazad-dum as it was), every minute or two on their own or from the Events button
// (src/core/happenings.js; #event=<name>; #evspeed=N):
//
//   watcher   the Watcher in the Water: long arms out of the pool before the Walls, groping along the shore, and
//             the hollies torn down and rock brought down across the Doors, which stay blocked
//   drums     drums in the deep: orcs pouring through the great hall and the Second Hall towards Mazarbul, with
//             torches, and the drum-beats shaking the dust down
//   balrog    Durin's Bane: fire up out of the chasm, and the Balrog coming across the Second Hall to the Bridge,
//             where Gandalf stands with his light; the Bridge breaks under it, and both are gone into the fire.
//             The Bridge stays broken
//   peak      the Battle of the Peak: lightning and fire round Durin's Tower on Zirakzigil, until the tower breaks
//             and something burning falls down the face of the mountain
//   caradhras the snow on Caradhras: a storm on the Redhorn Pass, and stones coming down
//   light     Gandalf's light in the Dwarrowdelf, held up for a moment, showing the whole hall
//
// Whatever they break stays broken until the page goes to Khazad-dum (ctx.onWar mends it).
import { mkRng } from '../core/rng.js';
import { createHappenings } from '../core/happenings.js';
import { createDust } from '../core/dust.js';
import { HALLS,BRIDGE,FLOOR,SEVENTH,WGATE,TOMB } from './plan.js';

export function events(api){
  const {THREE,ctx,scene,groundH,hemi,ambient,sun,camera}=api;
  const R=mkRng(Date.now()%100000),D=new THREE.Object3D();
  const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const own=o=>{o.traverse(q=>{q.userData.noFingerprint=true;});scene.add(o);return o;};
  const dust=createDust(api,{max:6000,size:14,color:0x7a7266,drag:0.7,gravity:1.5,wind:[0.5,0,0.3]});
  const fireDust=createDust(api,{max:6000,size:10,color:0xff6a20,drag:0.8,gravity:-3,wind:[0,0,0]});
  const smoke=createDust(api,{max:5000,size:22,color:0x1c1816,drag:0.5,gravity:-2,wind:[0.5,0,0.2]});
  const snowP=createDust(api,{max:9000,size:4,color:0xf2f5f8,drag:0.4,gravity:2.2,wind:[-14,0,5]});
  const spray=createDust(api,{max:3000,size:4,color:0xb8c4c8,drag:1,gravity:6,wind:[0,0,0]});
  let H=null;
  const go=(fn,end)=>H.run((now,dt)=>{if(ctx.war===false){end&&end();return false;}const r=fn(now,dt);if(r===false&&end)end();return r;});
  const fireLight=new THREE.PointLight(0xff6020,0,300,1.2);scene.add(fireLight);
  const whiteLight=new THREE.PointLight(0xe8f0ff,0,900,1.0);scene.add(whiteLight);
  const flameM=new THREE.MeshBasicMaterial({color:0xff7a28,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending});
  const figure=(col,s)=>{const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:col,flatShading:true});
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.4,1.5,7).translate(0,0.75,0),m));g.add(new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6).translate(0,1.62,0),m));g.scale.setScalar(s);return g;};

  // ---- the Watcher in the Water ----
  let blocked=null;
  (ctx.onWar=ctx.onWar||[]).push(()=>{if(blocked){scene.remove(blocked);blocked=null;}const W=ctx.westgate;if(W)for(const h of W.hollies){h.rotation.set(0,0,0);h.visible=true;}
    if(ctx.moria&&ctx.moria.bridge)for(const m of ctx.moria.bridge){m.visible=true;m.position.set(0,0,0);m.rotation.set(0,0,0);}});
  function watcher(){
    const W=ctx.westgate;if(!W||blocked)return;
    const skin=new THREE.MeshLambertMaterial({color:0x3a4a3a,flatShading:true});
    const arms=[];for(let i=0;i<16;i++){const g=new THREE.Group(),segs=[];let par=g;
      for(let k=0;k<14;k++){const s=new THREE.Group();if(k)s.position.y=2.4;par.add(s);s.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35*(1-k/16),0.55*(1-k/16),2.6,6).translate(0,1.3,0),skin));segs.push(s);par=s;}
      const a=R()*Math.PI*0.9-Math.PI*0.45,r=40+R()*140;g.position.set(W.x-120-Math.cos(a)*r*0.8,WGATE.y-8,W.z+Math.sin(a)*r);g.rotation.y=Math.atan2(W.x-g.position.x,W.z-g.position.z);
      own(g);arms.push({g,segs,ph:R()*6.28,rise:R()*6,reach:R()});}
    let t=0,said=0;
    H.notice('The Watcher in the Water','- the pool before the Walls is moving. Long sinuous arms come up out of it, pale-green and wet, feeling along the shore towards the Doors.',
      ()=>[W.x-240,WGATE.y+50,W.z-160,W.x-40,WGATE.y+8,W.z]);
    const end=()=>{for(const q of arms)scene.remove(q.g);};
    go((now,dt)=>{t+=dt;
      for(const q of arms){const up=clamp((t-q.rise)/5,0,1)*(1-clamp((t-34)/5,0,1));q.g.position.y=WGATE.y-8-10*(1-up);
        q.segs.forEach((s,k)=>{s.rotation.x=up*(0.12+q.reach*0.1)+Math.sin(t*1.3+q.ph+k*0.5)*0.12*up;s.rotation.z=Math.sin(t*0.9+q.ph+k*0.4)*0.1;});
        if(up>0.2&&R()<0.1)spray.emit(q.g.position.x,WGATE.y-6,q.g.position.z,(R()-0.5)*4,2+R()*4,(R()-0.5)*4,1.5,3);}
      // the hollies wrenched over, and the rock of the cliff brought down across the Doors
      if(t>20){const k=ease(clamp((t-20)/2,0,1));W.hollies.forEach((h,i)=>{h.rotation.z=(i?1:-1)*k*1.4;});}
      if(t>24&&!blocked){blocked=new THREE.Group();const rock=new THREE.MeshLambertMaterial({color:0x6a655d,flatShading:true});
        for(let k=0;k<60;k++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(1+R()*3,0),rock);m.position.set(W.x-3-R()*14,WGATE.y+R()*9,W.z+(R()-0.5)*18);m.rotation.set(R()*3,R()*3,R()*3);blocked.add(m);}
        own(blocked);for(let k=0;k<200;k++)dust.emit(W.x-6,WGATE.y+R()*30,W.z+(R()-0.5)*24,-R()*6,R()*4,(R()-0.5)*6,5+R()*4,16);
        if(said<1){said=1;H.notice('The Doors are shut','- slammed, and the hollies thrown down across them, and the rock of the cliff brought down after: the West-gate is blocked. There is no way now but through.',null);}}
      if(t>40)return false;},end);}

  // ---- drums in the deep ----
  function drums(){
    const N=900,orc=new THREE.MeshLambertMaterial({color:0x2a2520,flatShading:true});
    const bodies=own(new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.7,0.6).translate(0,0.85,0),orc,N));bodies.frustumCulled=false;
    const tM=new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:0.95,depthWrite:false,blending:THREE.AdditiveBlending});
    const torches=own(new THREE.InstancedMesh(new THREE.SphereGeometry(0.4,6,5),tM,90));torches.frustumCulled=false;
    // the way they come: out of the west end of the great hall and along it, up the stair to the Seventh Level,
    // through the Twenty-first Hall to the door of Mazarbul
    const path=[[3710,0,FLOOR],[4560,0,FLOOR],[4560,-180,FLOOR],[4560,-352,SEVENTH],[4560,-360,SEVENTH],[4700,-360,SEVENTH],[4935,-360,SEVENTH]];
    const cum=[0];for(let i=1;i<path.length;i++)cum.push(cum[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
    const at=s=>{s=clamp(s,0,cum[cum.length-1]);let i=1;while(i<cum.length-1&&cum[i]<s)i++;const k=(s-cum[i-1])/(cum[i]-cum[i-1]);
      return [lerp(path[i-1][0],path[i][0],k),lerp(path[i-1][1],path[i][1],k),lerp(path[i-1][2],path[i][2],k),Math.atan2(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1])];};
    const Q=[];for(let i=0;i<N;i++)Q.push({lag:i*0.9+R()*2,off:(R()-0.5)*(i%3?20:8),v:5+R()*2});
    let t=0,beat=0,said=0;const LEN=cum[cum.length-1];
    H.notice('Drums in the deep','- doom, doom, far off, like great hands on a hollow drum; and then the orcs, pouring out of the west end of the great hall with torches, making for the stair up to the Chamber of Mazarbul.',
      // not followed: indoors, following slid the camera through the walls into the rock
      ()=>[4660,FLOOR+22,60,4150,FLOOR+4,-10]);
    const end=()=>{scene.remove(bodies);scene.remove(torches);};
    go((now,dt)=>{t+=dt;
      // the beat: a shudder in the light and dust off the roof
      if(Math.floor(t*1.25)!==beat){beat=Math.floor(t*1.25);hemi.intensity*=1.4;
        for(let k=0;k<12;k++){const x=3800+R()*1300,z=(R()-0.5)*200;dust.emit(x,FLOOR+60,z,0,-1,0,5,10);}}
      let n=0,ti=0,arrived=0;
      for(const q of Q){const s=(t-q.lag*0.25)*q.v;if(s<0)continue;if(s>LEN){arrived++;continue;}
        const [x,z,y,yaw]=at(s),wide=s<cum[1]?1:s>cum[5]?0.6:0.2,side=Math.abs(Math.cos(yaw))>0.5;
        D.position.set(x+(side?q.off*wide:0),y+Math.abs(Math.sin(t*8+q.off))*0.15,z+(side?0:q.off*wide));D.rotation.set(0,yaw,0);D.scale.setScalar(1.15);D.updateMatrix();bodies.setMatrixAt(n++,D.matrix);
        if(n%10===0&&ti<90){D.position.y+=2.2;D.updateMatrix();torches.setMatrixAt(ti++,D.matrix);}}
      bodies.count=n;torches.count=ti;bodies.instanceMatrix.needsUpdate=true;torches.instanceMatrix.needsUpdate=true;
      if(arrived>N*0.3&&said<1){said=1;H.notice('At the door of Mazarbul','- they are at the door of the chamber, and in the dark behind them something bigger is coming.',null);}
      if(arrived>=N)return false;if(t>200)return false;},end);}

  // ---- Durin's Bane ----
  function makeBalrog(){
    const g=new THREE.Group(),dark=new THREE.MeshLambertMaterial({color:0x100c0a,flatShading:true});
    const body=new THREE.Group();g.add(body);
    body.add(new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.4,7,7).translate(0,8,0),dark));
    body.add(new THREE.Mesh(new THREE.SphereGeometry(1.6,8,6).translate(0,12.6,0.4),dark));
    for(const sd of [-1,1]){const horn=new THREE.Mesh(new THREE.ConeGeometry(0.4,2.6,5).translate(0,1.3,0),dark);horn.position.set(sd*1,13.6,0.2);horn.rotation.z=-sd*0.6;body.add(horn);
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.7,1.1,5,6).translate(0,-2.5,0),dark);leg.position.set(sd*1.2,5,0);body.add(leg);
      const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.7,6,6).translate(0,-3,0),dark);arm.position.set(sd*2.2,11,0);arm.rotation.z=sd*0.5;body.add(arm);}
    // the wings: of shadow, and huge
    const wm=new THREE.MeshBasicMaterial({color:0x080606,transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false});
    const wings=[];for(const sd of [-1,1]){const w=new THREE.Group();w.position.set(sd*1.4,11,-0.8);body.add(w);
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,sd*12,5,-3,sd*10,-5,-2, 0,0,0,sd*10,-5,-2,sd*4,-7,-1],3));geo.computeVertexNormals();
      w.add(new THREE.Mesh(geo,wm));wings.push({w,sd});}
    // the fire in it: flames all over it, and a mane
    const flames=[];for(let k=0;k<26;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(0.6+R()*0.8,2+R()*3,6).translate(0,1,0),flameM);f.position.set((R()-0.5)*3,4+R()*10,(R()-0.5)*2.4);body.add(f);flames.push({f,ph:R()*6.28});}
    const whip=[];for(let k=0;k<16;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.35,5,4),flameM);g.add(m);whip.push(m);}
    return {g,wings,flames,whip};}
  function balrog(){
    const br=ctx.moria&&ctx.moria.bridge;if(!br||!br[0].visible)return;
    const B=makeBalrog();own(B.g);const gand=figure(0xf2f4f8,1.6);own(gand);
    const mid=(BRIDGE.x0+BRIDGE.x1)/2;gand.position.set(mid+1.5,FLOOR+BRIDGE.rise,0);gand.rotation.y=-Math.PI/2;
    const staff=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),new THREE.MeshBasicMaterial({color:0xeef4ff}));staff.position.set(0,3.6,0.4);gand.add(staff);
    let t=0,said=0,x=4800,fallT=-1,snap=-1;
    H.notice('Durin\'s Bane','- fire leaps up out of the chasm, and out of the dark at the far end of the Second Hall comes something like a great shadow, with fire in it, and a whip of many thongs. Gandalf is on the Bridge.',
      // from the First Hall, across the Bridge, with Gandalf's back to you and the Second Hall beyond him; not
      // followed (indoors, following slid the camera into the rock)
      ()=>[BRIDGE.x1+34,FLOOR+9,6,BRIDGE.x0-30,FLOOR+8,0]);
    const end=()=>{scene.remove(B.g);scene.remove(gand);fireLight.intensity=0;whiteLight.intensity=0;};
    go((now,dt)=>{t+=dt;
      // the fire in the chasm rises, and it comes
      if(t<30){x=lerp(4800,BRIDGE.x0-2,ease(t/30));B.g.position.set(x,FLOOR,0);B.g.rotation.y=Math.PI/2;}
      else if(fallT<0){B.g.position.set(BRIDGE.x0+2,FLOOR+1,0);}
      for(let k=0;k<8;k++)fireDust.emit(BRIDGE.x0+R()*(BRIDGE.x1-BRIDGE.x0),FLOOR-380+R()*40,(R()-0.5)*300,(R()-0.5)*3,20+R()*20,(R()-0.5)*3,3+R()*2,6);
      B.flames.forEach(q=>{const k=0.8+0.4*Math.sin(t*9+q.ph);q.f.scale.set(k,k*(1+0.3*Math.sin(t*13+q.ph)),k);});
      B.wings.forEach(q=>{q.w.rotation.y=q.sd*(0.4+0.35*Math.sin(t*1.2))*(t>28?1.6:1);});
      const p=B.g.position;fireLight.position.set(p.x,p.y+10,p.z);fireLight.intensity=2.5+0.6*Math.sin(t*11);
      for(let k=0;k<3;k++)smoke.emit(p.x+(R()-0.5)*4,p.y+10+R()*6,p.z+(R()-0.5)*4,(R()-0.5)*2,2+R()*2,(R()-0.5)*2,5,10);
      // "You cannot pass": the staff is raised, and the light of it; the Bridge breaks under the Balrog
      const raise=clamp((t-30)/2,0,1);staff.position.y=3.6+raise*1.2;whiteLight.position.set(gand.position.x,gand.position.y+6,0);whiteLight.intensity=raise*(t<36?2.6:0.8);
      if(t>30&&said<1){said=1;H.notice('You cannot pass','- he stands in the middle of the Bridge with his staff raised, and the light of it; the Balrog comes on to the Bridge, and he strikes the stone in front of him.',null);}
      if(t>36&&snap<0){snap=t;for(let k=0;k<200;k++)dust.emit(BRIDGE.x0+1+R()*6,FLOOR+R()*3,(R()-0.5)*3,(R()-0.5)*8,R()*6,(R()-0.5)*8,4,8);}
      if(snap>=0){const u=t-snap;br[0].position.y=-u*u*6;br[0].rotation.z=u*0.2;if(u>0.3&&fallT<0)fallT=t;
        if(u>6)br[0].visible=false;}
      if(fallT>=0){const u=t-fallT;B.g.position.y=FLOOR+1-u*u*7;B.g.rotation.z=u*0.3;
        // the whip, lashing up round Gandalf's knees, and him dragged over
        const wx=B.g.position.x,wy=B.g.position.y+11;B.whip.forEach((m,k)=>{const f=k/(B.whip.length-1);m.position.set(lerp(wx,gand.position.x,f)-wx,lerp(wy,gand.position.y+1,f)-B.g.position.y+Math.sin(f*Math.PI)*3,0);m.position.x+=0;});
        if(u>1.8){const v=u-1.8;gand.position.y=FLOOR+BRIDGE.rise-v*v*7;gand.position.x=lerp(mid+1.5,BRIDGE.x0+2,clamp(v,0,1));gand.rotation.z=v*0.8;
          if(said<2){said=2;H.notice('Fly, you fools','- the Balrog falls, and the whip takes him about the knees, and he is dragged to the brink, and is gone.',null);}}
        if(u>9)return false;}
      else B.whip.forEach((m,k)=>{m.position.set(Math.sin(t*3+k*0.4)*k*0.6,11-k*0.5,Math.cos(t*2+k*0.3)*k*0.3);});
    },end);}

  // ---- the Battle of the Peak ----
  function peak(){
    const T=ctx.durinsTower;if(!T||T.broken)return;
    const boltM=new THREE.MeshBasicMaterial({color:0xe8eeff,transparent:true,opacity:0,depthWrite:false});
    const bolt=new THREE.Group();{let bx=0;for(let k=0;k<7;k++){const nx=(R()-0.5)*14,seg=new THREE.Mesh(new THREE.BoxGeometry(0.8,24,0.8),boltM);seg.position.set(bx+nx/2,160-k*23,0);seg.rotation.z=-nx/24;bolt.add(seg);bx+=nx;}}
    own(bolt);bolt.position.set(T.x,T.y,T.z);let t=0,flash=0,said=0,fall=-1;
    H.notice('The Battle of the Peak','- on the summit of Zirakzigil, at the top of the Endless Stair: thunder, and lightning striking the peak again and again, and tongues of fire; the snow about the tower going up in steam.',
      ()=>[T.x+260,T.y+90,T.z+180,T.x,T.y+10,T.z]);
    const end=()=>{scene.remove(bolt);fireLight.intensity=0;};
    go((now,dt)=>{t+=dt;
      if(t<24&&R()<0.05){flash=1;bolt.rotation.y=R()*6;}flash*=Math.exp(-dt*7);boltM.opacity=flash;hemi.intensity*=1+flash*1.5;sun.intensity*=1+flash;
      fireLight.position.set(T.x,T.y+14,T.z);fireLight.intensity=(t<26?1.5+Math.sin(t*9):0)*2;
      if(t<26){for(let k=0;k<3;k++)fireDust.emit(T.x+(R()-0.5)*14,T.y+10+R()*8,T.z+(R()-0.5)*14,(R()-0.5)*4,4+R()*6,(R()-0.5)*4,1.5,4);
        for(let k=0;k<3;k++)smoke.emit(T.x+(R()-0.5)*40,T.y+R()*10,T.z+(R()-0.5)*40,(R()-0.5)*3,4+R()*4,(R()-0.5)*3,8,26);}
      // the tower breaks, and the Balrog falls down the mountainside in ruin
      if(t>24&&fall<0){fall=t;T.breakIt();for(let k=0;k<200;k++)dust.emit(T.x+(R()-0.5)*16,T.y+R()*18,T.z+(R()-0.5)*16,(R()-0.5)*12,R()*10,(R()-0.5)*12,4,14);
        H.notice('The tower breaks','- and the Balrog is cast down, and falls from the high place, and breaks the mountain-side where it smites it in its ruin.',
          ()=>[T.x+900,T.y-200,T.z+700,T.x+200,T.y-500,T.z]);}
      if(fall>=0){const u=t-fall,x=T.x+u*40,z=T.z+u*14,y=Math.max(groundH(x,z)+4,T.y-u*u*12);
        for(let k=0;k<5;k++)fireDust.emit(x+(R()-0.5)*6,y+(R()-0.5)*6,z+(R()-0.5)*6,(R()-0.5)*4,R()*4,(R()-0.5)*4,2+R()*2,8);smoke.emit(x,y,z,0,3,0,8,24);
        if(u>14)return false;}
    },end);}

  // ---- the snow on Caradhras ----
  function caradhras(){
    const cx=-3200,cz=-3900;let t=0;
    H.notice('Caradhras','- the Redhorn is against them: a storm off the mountain, snow driving so thick on the pass the path is gone, and stones falling out of the dark with the wind.',
      ()=>[cx+900,groundH(cx,cz)+400,cz+900,cx,groundH(cx,cz)+120,cz]);
    go((now,dt)=>{t+=dt;const k=clamp(t/6,0,1)*clamp((60-t)/6,0,1);
      for(let n=0;n<Math.floor(80*k);n++){const x=cx+(R()-0.5)*1600,z=cz+(R()-0.5)*1600;snowP.emit(x,groundH(x,z)+40+R()*300,z,-10+(R()-0.5)*6,-3,4,8+R()*4,3+R()*3);}
      if(R()<0.05*k){const x=cx+(R()-0.5)*600,z=cz-400+R()*300;for(let q=0;q<30;q++)dust.emit(x,groundH(x,z)+20,z,(R()-0.5)*8,-2,20+R()*10,6,22);}
      hemi.intensity*=1-0.4*k;sun.intensity*=1-0.7*k;
      if(t>62)return false;});}

  // ---- Gandalf's light ----
  function light(){
    const [x0,x1]=HALLS.dwarrowdelf,cx=(x0+x1)/2;let t=0;
    H.notice('A little more light','- Gandalf holds up his staff, and for a moment the light of it fills the great hall: pillars and pillars, going away into the dark, and the roof somewhere up above them. Behold the great realm and dwarf-city of the Dwarrowdelf.',
      ()=>[x0+60,FLOOR+30,110,cx,FLOOR+24,-30]);
    go((now,dt)=>{t+=dt;const k=clamp(t/1.5,0,1)*clamp((14-t)/3,0,1);whiteLight.position.set(x0+140,FLOOR+22,20);whiteLight.intensity=k*3.2;whiteLight.distance=900;
      ambient.intensity*=1+k*2.5;if(t>14){whiteLight.intensity=0;return false;}},()=>{whiteLight.intensity=0;});}

  H=createHappenings(api,{
    events:{watcher:['The Watcher in the Water',watcher],drums:['Drums in the deep',drums],balrog:['Durin\'s Bane',balrog],peak:['The Battle of the Peak',peak],caradhras:['Caradhras',caradhras],light:['A little more light',light]},
    order:['light','caradhras','drums','watcher','light','balrog','peak','drums'],
    active:()=>ctx.war!==false,
    colours:{bg:'rgba(10,10,12,.9)',fg:'#e6e2d8',edge:'#5e5a52',btn:'rgba(34,32,30,.92)',btnEdge:'#8e887c'}});
  ctx.details=Object.assign(ctx.details||{},{events:6});
}
