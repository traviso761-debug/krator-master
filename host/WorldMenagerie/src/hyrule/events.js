// ---------- what happens in Hyrule ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own. Every minute or two
// one of these comes round on its own (src/core/happenings.js: the notice, Go and look, the Events panel;
// #event=<name> fires one on arrival).
//
//   bloodmoon  the Blood Moon: a huge red moon comes up, the sky and the haze go crimson, and embers of malice drift
//              up out of the ground all over the country
//   beasts     the four Divine Beasts turn their lights from orange to blue and fire on Hyrule Castle, and Ganon's
//              rings flare
//   tower      a Sheikah tower is activated: its lights go from orange to blue, a column of light goes up, and a
//              ring spreads out over the land round it
//   glider     someone in green paraglides down from a tower; the camera follows
//   storm      a thunderstorm: rain, lightning striking the high ground, the sky flashing
//   korok      a Korok pops up somewhere with a sparkle, and is gone
//   dinraal    the fire dragon flies its circuit over Akkala, Eldin and Tabantha, shedding embers
//   naydra     the ice dragon coils round Mount Lanayru, snow falling from it
//   farosh     the lightning dragon runs from Faron to the Gerudo Highlands, sparks and the odd bolt to the ground
//   guardian   the camera finds a Guardian Stalker out in the fields and walks alongside it a while
import { createHappenings } from '../core/happenings.js';
import { makeDragon } from './dragons.js';

export function events(api){
  const {THREE,ctx,scene,groundH}=api;
  const PL=ctx.plan;if(!PL)return;const S=PL.sites;
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const look=(x,y,z,dx,dy,dz,ty)=>()=>[x+dx,y+dy,z+dz,x,y+(ty||0),z];
  const ease=u=>u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const glow=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,transparent:true,depthWrite:false},o||{}));

  // ---- one pool of sparks for embers, flashes and sparkles ----
  const MAXP=5000,ppos=new Float32Array(MAXP*3),pcol=new Float32Array(MAXP*3),pv=new Float32Array(MAXP*3),plife=new Float32Array(MAXP),pgrav=new Float32Array(MAXP);
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(ppos,3));pg.setAttribute('color',new THREE.BufferAttribute(pcol,3));
  // a soft round point, not a square: a white dot fading at its edge, tinted by each spark's colour
  const dot=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.4,'rgba(255,255,255,0.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);})();
  const sparks=new THREE.Points(pg,new THREE.PointsMaterial({size:4,map:dot,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  sparks.frustumCulled=false;sparks.userData.noFingerprint=true;sparks.userData.noWire=true;scene.add(sparks);
  for(let i=0;i<MAXP;i++)ppos[i*3+1]=-9999;let pnext=0;
  const emit=(x,y,z,vx,vy,vz,col,life,grav)=>{const i=pnext;pnext=(pnext+1)%MAXP;const c=new THREE.Color(col);ppos[i*3]=x;ppos[i*3+1]=y;ppos[i*3+2]=z;pv[i*3]=vx;pv[i*3+1]=vy;pv[i*3+2]=vz;pcol[i*3]=c.r;pcol[i*3+1]=c.g;pcol[i*3+2]=c.b;plife[i]=life;pgrav[i]=grav||0;};
  const burst=(x,y,z,n,sp,col,life,grav)=>{for(let k=0;k<n;k++){const u=R()*2-1,a=R()*Math.PI*2,r=Math.sqrt(1-u*u),s=sp*(0.5+R()*0.5);emit(x,y,z,Math.cos(a)*r*s,u*s,Math.sin(a)*r*s,col,life*(0.7+R()*0.6),grav);}};
  api.animHooks.push((()=>{let last=performance.now();return now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let any=false;
    for(let i=0;i<MAXP;i++){if(plife[i]<=0)continue;any=true;plife[i]-=dt;if(plife[i]<=0){ppos[i*3+1]=-9999;continue;}
      pv[i*3+1]-=pgrav[i]*dt;ppos[i*3]+=pv[i*3]*dt;ppos[i*3+1]+=pv[i*3+1]*dt;ppos[i*3+2]+=pv[i*3+2]*dt;}
    if(any){pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;}};})());

  // ---- a tint over everything: a huge sphere round the world, seen from inside, for the Blood Moon and the storm ----
  const tintM=glow(0x7a0a1a,{opacity:0,side:THREE.BackSide,fog:false});
  // sized from the camera's far plane and kept round the camera, or it is clipped away and never seen
  const far0=api.camera&&api.camera.far?api.camera.far:20000;
  const tint=new THREE.Mesh(new THREE.SphereGeometry(far0*0.6,24,12),tintM);tint.userData.noFingerprint=true;tint.userData.noWire=true;tint.renderOrder=-0.5;scene.add(tint);
  api.animHooks.push(()=>{if(api.camera)tint.position.copy(api.camera.position);});

  // ---- the Blood Moon ----
  function bloodmoon(){
    const moonM=new THREE.MeshBasicMaterial({color:0xd81a2a,transparent:true,opacity:0,fog:false});
    const moon=new THREE.Mesh(new THREE.SphereGeometry(far0*0.035,24,16),moonM);moon.userData.noFingerprint=true;scene.add(moon);
    const fog=scene.fog,fogC=fog?fog.color.clone():null,fogD=fog&&fog.density;let t=0;const UP=10,HOLD=40,DOWN=10;
    tintM.color.set(0x7a0a1a);
    notice('The Blood Moon','is rising. When it is full, every monster Calamity Ganon has destroyed comes back.',()=>[S.castle.x+4200,1400,S.castle.z+5200,S.castle.x-3000,1800,S.castle.z-14000]);
    run((now,dt)=>{t+=dt;const u=t<UP?ease(t/UP):t<UP+HOLD?1:t<UP+HOLD+DOWN?1-ease((t-UP-HOLD)/DOWN):0;
      // low in the north-west sky, inside the far plane, rising as it comes on
      const cam=api.camera?api.camera.position:new THREE.Vector3(),D=far0*0.45;moon.position.set(cam.x-D*0.45,cam.y+D*(0.1+0.22*u),cam.z-D*0.85);moonM.opacity=u;tintM.opacity=0.42*u;
      if(fog){fog.color.copy(fogC).lerp(new THREE.Color(0x8a1a2a),u*0.8);fog.density=fogD*(1+u*0.8);}
      // embers of malice drifting up out of the ground everywhere near the camera
      if(u>0.3){for(let k=0;k<8;k++){const x=cam.x+(R()-0.5)*1600,z=cam.z+(R()-0.5)*1600,y=groundH(x,z);emit(x,y+1,z,(R()-0.5)*2,6+R()*6,(R()-0.5)*2,R()<0.5?0xff2a3a:0xff6a1a,4,0);}}
      if(t>=UP+HOLD+DOWN){scene.remove(moon);tintM.opacity=0;if(fog){fog.color.copy(fogC);fog.density=fogD;}return false;}});}

  // ---- the Divine Beasts fire on the castle ----
  function beasts(){
    const target=new THREE.Vector3(S.castle.x+8,groundH(S.castle.x,S.castle.z)+300,S.castle.z-18);
    const from=[S.ruta,S.rudania,S.medoh,S.naboris].map(s=>s);let t=0;const beams=[];
    const pink=glow(0xff7ab8,{opacity:0,blending:THREE.AdditiveBlending});
    for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(6,6,1,10,1,true),pink);b.userData.noFingerprint=true;scene.add(b);beams.push(b);}
    // where each beast is now: their own groups move (beasts.js), so the landmark's group is found by name
    const beastPos=k=>{const names=['Vah Ruta','Vah Rudania','Vah Medoh','Vah Naboris'];let p=null;scene.traverse(o=>{if(!p&&o.isGroup&&o.userData.info&&o.userData.info.name===names[k]){const c=o.children[0]||o;p=new THREE.Vector3();c.getWorldPosition(p);p.y+=60;}});
      return p||new THREE.Vector3(from[k].x,from[k].y+80,from[k].z);};
    notice('The Divine Beasts','have been freed. One by one their lights turn blue, and they turn to face Hyrule Castle.',()=>[S.castle.x+2600,900,S.castle.z+3400,S.castle.x,250,S.castle.z]);
    run((now,dt)=>{t+=dt;
      for(const m of (ctx.beastGlows||[])){m.color.lerp(new THREE.Color(0x6ad8ff),Math.min(1,dt*0.6));m.emissive.lerp(new THREE.Color(0x2aa8ff),Math.min(1,dt*0.6));}
      if(t>8&&t<22){pink.opacity=Math.min(0.85,(t-8)*0.6);beams.forEach((b,k)=>{const a=beastPos(k),d=target.clone().sub(a),L=d.length();b.scale.set(1+Math.sin(t*20+k)*0.2,L,1+Math.sin(t*20+k)*0.2);b.position.copy(a).addScaledVector(d,0.5);b.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());});
        if(ctx.ganon)ctx.ganon.scale.setScalar(1+Math.sin(t*6)*0.08);if(R()<0.6)burst(target.x,target.y,target.z,20,60,0xff9ad0,1.4,0);}
      if(t>=22){pink.opacity=Math.max(0,pink.opacity-dt);if(ctx.ganon)ctx.ganon.scale.setScalar(1);}
      if(t>=9&&t-dt<9)notice('Fire','Four beams of light from the four Divine Beasts, into the castle. Calamity Ganon reels.',()=>[S.castle.x+1400,600,S.castle.z+1800,S.castle.x,280,S.castle.z]);
      if(t>25){for(const b of beams)scene.remove(b);return false;}});}

  // ---- a Sheikah tower is activated ----
  let nextTower=0;
  function tower(){
    const glows=ctx.towerGlows||[];const order=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    let k=order.find(i=>glows[i]&&!glows[i].userData.on);if(k==null){for(const g of glows)if(g){g.userData.on=false;g.color.set(0xffa04a);g.emissive.set(0xff7a1a);}k=0;}
    const T=PL.towers[k],g=glows[k],y0=groundH(T.x,T.z);
    const colM=glow(0x7ae0ff,{opacity:0,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const col=new THREE.Mesh(new THREE.CylinderGeometry(6,6,3000,16,1,true),colM);col.position.set(T.x,y0+1500,T.z);col.userData.noFingerprint=true;scene.add(col);
    const ringM=glow(0x7ae0ff,{opacity:0,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.96,1,64).rotateX(-Math.PI/2),ringM);ring.position.set(T.x,y0+6,T.z);ring.userData.noFingerprint=true;scene.add(ring);
    let t=0;
    notice(T.name,'has been activated. Its lights turn from orange to blue, and the map of the region fills in.',look(T.x,y0+60,T.z,260,80,320,40));
    run((now,dt)=>{t+=dt;
      if(g&&t>1){g.color.lerp(new THREE.Color(0x7ae0ff),Math.min(1,dt*2));g.emissive.lerp(new THREE.Color(0x3ac8ff),Math.min(1,dt*2));g.userData.on=true;}
      colM.opacity=t<1?0:t<3?(t-1)*0.35:Math.max(0,0.7-(t-3)*0.12);
      const u=Math.max(0,(t-1.5)/8);ring.scale.setScalar(20+u*2400);ringM.opacity=u<1?0.6*(1-u):0;ring.position.y=y0+6+u*40;
      if(t>10){scene.remove(col,ring);return false;}});}

  // ---- paragliding down from a tower ----
  function glider(){if(!ctx.launchGlider)return;const f=ctx.launchGlider();const G=ctx.glider;
    notice('Paragliding','Someone in green has jumped from '+f.T.name+' and is gliding down over the country.',()=>{const p=G.position;return [p.x-40,p.y+15,p.z+50,p.x,p.y,p.z];},()=>G.visible?G.position:null);}

  // ---- the dragons: one comes over, and the camera flies behind its head ----
  const DRAGONS={dinraal:['Dinraal','The fire dragon is flying over Akkala and Eldin. Embers fall where it passes; a scale from it is worth a great deal.'],
    naydra:['Naydra','The ice dragon is coiling round the heights of Mount Lanayru, and snow falls out of a clear sky under it.'],
    farosh:['Farosh','The lightning dragon is running from Faron toward the Gerudo Highlands, crackling, striking the ground now and then.']};
  function dragon(kind){const D=makeDragon(api,kind,emit);let t=0;D.update(0.016);
    notice(DRAGONS[kind][0],DRAGONS[kind][1],()=>{const h=D.head,d=D.dir;return [h.x-d.x*150-d.z*60,h.y+55,h.z-d.z*150+d.x*60,h.x+d.x*30,h.y,h.z+d.z*30];},()=>t<80?D.head:null);
    run((now,dt)=>{t+=dt;D.update(dt);if(t>90){D.remove();return false;}});}

  // ---- alongside a Guardian Stalker ----
  function guardian(){const L=ctx.stalkers;if(!L||!L.length)return;const s=L[Math.floor(R()*L.length)],t0=performance.now();
    notice('A Guardian Stalker','One of the Guardians the Calamity turned, still walking the fields round the castle, its eye sweeping the ground.',
      ()=>{const p=s.g.position,a=s.g.rotation.y;return [p.x-Math.cos(a)*26+Math.sin(a)*22,p.y+16,p.z+Math.sin(a)*26+Math.cos(a)*22,p.x,p.y+7,p.z];},
      ()=>performance.now()-t0<40000?s.g.position:null);}

  // ---- a thunderstorm ----
  function storm(){
    const N=3000,pos=new Float32Array(N*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const rain=new THREE.Points(g,new THREE.PointsMaterial({color:0xaabbd0,size:1.2,transparent:true,opacity:0.6,depthWrite:false}));rain.frustumCulled=false;rain.userData.noFingerprint=true;scene.add(rain);
    const boltM=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0});let bolt=null,t=0,nextBolt=3;
    const fog=scene.fog,fogC=fog?fog.color.clone():null,fogD=fog&&fog.density;tintM.color.set(0x1a2230);
    notice('A thunderstorm','is coming over. Lightning goes for the high ground - and for anyone carrying metal.',()=>{const c=api.camera.position;return [c.x,c.y,c.z,c.x+200,c.y-60,c.z-200];});
    run((now,dt)=>{t+=dt;const u=t<6?t/6:t<46?1:Math.max(0,1-(t-46)/6);
      tintM.opacity=0.35*u;if(fog){fog.color.copy(fogC).lerp(new THREE.Color(0x4a5260),u*0.8);fog.density=fogD*(1+u*1.5);}
      const cam=api.camera.position;for(let i=0;i<N;i++){let y=pos[i*3+1]-dt*60;if(y<cam.y-80||y===0){pos[i*3]=cam.x+(R()-0.5)*300;pos[i*3+2]=cam.z+(R()-0.5)*300;y=cam.y+60+R()*40;}pos[i*3+1]=y;}
      g.attributes.position.needsUpdate=true;rain.material.opacity=0.6*u;
      if(t>nextBolt&&u>0.8){nextBolt=t+2+R()*4;if(bolt)scene.remove(bolt);
        // a strike on high ground near the camera: a jagged line from the cloud down
        let best=null;for(let k=0;k<20;k++){const x=cam.x+(R()-0.5)*2000,z=cam.z+(R()-0.5)*2000,y=groundH(x,z);if(!best||y>best[1])best=[x,y,z];}
        const pts=[];let x=best[0],z=best[2];for(let y=best[1]+900;y>best[1];y-=60){pts.push(new THREE.Vector3(x,y,z));x+=(R()-0.5)*40;z+=(R()-0.5)*40;}pts.push(new THREE.Vector3(best[0],best[1],best[2]));
        bolt=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),boltM);bolt.userData.noFingerprint=true;scene.add(bolt);boltM.opacity=1;tintM.opacity=0.05;
        burst(best[0],best[1]+2,best[2],120,20,0xfff6c0,0.8,10);}
      boltM.opacity=Math.max(0,boltM.opacity-dt*3);
      if(t>52){scene.remove(rain);if(bolt)scene.remove(bolt);tintM.opacity=0;if(fog){fog.color.copy(fogC);fog.density=fogD;}return false;}});}

  // ---- a Korok ----
  function korok(){
    const T=PL.shrines[Math.floor(R()*PL.shrines.length)],x=T.x+(R()-0.5)*80,z=T.z+(R()-0.5)*80,y=groundH(x,z);
    const g=new THREE.Group(),body=new THREE.MeshLambertMaterial({color:0x8a6a3a}),leaf=new THREE.MeshLambertMaterial({color:0x5aa040,side:THREE.DoubleSide});
    g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.6,10,8),body)));
    const face=new THREE.Mesh(new THREE.CircleGeometry(0.62,12),leaf);face.position.z=0.5;g.add(face);
    for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),new THREE.MeshBasicMaterial({color:0x101010}));e.position.set(s*0.2,0.1,0.62);g.add(e);}
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.8),body);stem.position.y=0.9;g.add(stem);
    const top=new THREE.Mesh(new THREE.CircleGeometry(0.4,8),leaf);top.position.y=1.3;top.rotation.x=-0.4;g.add(top);
    g.scale.setScalar(2.4);g.traverse(o=>{o.userData.noFingerprint=true;});scene.add(g);let t=0;
    notice('Yahaha!','A Korok has popped up. You found it!',look(x,y,z,14,6,18,2));
    run((now,dt)=>{t+=dt;const hop=Math.max(0,Math.sin(t*3))*1.4;g.position.set(x,y+1.4+hop,z);g.rotation.y=t*0.8;
      if(R()<0.4)emit(x+(R()-0.5)*3,y+2+R()*3,z+(R()-0.5)*3,0,2,0,0xfff6a0,1.2,0);
      if(t>14){burst(x,y+2,z,80,6,0xfff6a0,1.2,2);scene.remove(g);return false;}});}

  H=createHappenings(api,{events:{bloodmoon:['The Blood Moon',bloodmoon],beasts:['The Divine Beasts fire',beasts],tower:['A tower activates',tower],
      glider:['Paraglide',glider],storm:['Thunderstorm',storm],korok:['A Korok',korok],guardian:['A Guardian Stalker',guardian],dinraal:['Dinraal, the fire dragon',()=>dragon('dinraal')],naydra:['Naydra, the ice dragon',()=>dragon('naydra')],farosh:['Farosh, the lightning dragon',()=>dragon('farosh')]},
    order:['tower','dinraal','glider','guardian','farosh','korok','storm','naydra','beasts','bloodmoon'],first:25000,every:[55000,100000]});
}
