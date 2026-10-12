// ---------- the people: Romans on the pavements, tourists at the sites ----------
// Pedestrians walk the pavements of every street they may use - along its edge, or down the middle of a pedestrian
// street - at a walking pace, turning back where it ends; some walk in twos, side by side. Tourists gather where
// tourists gather: round the Trevi, in Navona and the Pantheon's piazza, on the Spanish Steps, round the Colosseum, in
// St Peter's Square, on Piazza Venezia, in Campo de' Fiori; standing, looking, strolling, holding up a phone or a
// camera, in brighter clothes, some in sun hats. The sites come from the config (C.crowds.sites: [lat, lon,
// radius, count, keep-clear radius]); a tourist stands on open ground - inside a mapped piazza where there is one,
// never in a building, the river, or a fountain's basin (C.crowds.keepOut).
//
// A figure is a body (clothes, skin, hair) and two legs, each leg its own instance so it can swing: a walker's legs
// swing with the distance walked, so the feet do not slide. One material serves them all: what is white in a model
// takes the person's clothing colour, what is marked as skin or hair takes a tone chosen by the instance's number.
// Only those within C.crowds.far metres of the camera are drawn: they are packed at the front of the instance
// lists each frame and the draw counts set to them.
import {mkRng} from './rng.js';
import {joinFast} from './chains.js';

export function crowds(api){
  const {THREE,C,scene,ROADS,AREAS,groundH,buildingsAt,inPoly,inWater,joinChains,animHooks,camera,P}=api;const K=C.crowds;if(!K)return;
  const R=mkRng(K.seed||1990),FAR=K.far||700;
  const SKIN='#ff00ff',HAIR='#00ffff',W='#ffffff';
  function body(ps){const pos=[],nor=[],col=[];for(const [g0,c,x,y,z,rz=0,rx=0] of ps){const g=g0.toNonIndexed();if(rz)g.rotateZ(rz);if(rx)g.rotateX(rx);g.translate(x,y,z);const p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const Cy=(r0,r1,h,s=6)=>new THREE.CylinderGeometry(r1,r0,h,s),Sp=(r,a=6,b=4)=>new THREE.SphereGeometry(r,a,b),Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  // along +x, the feet at y=0; the legs are separate (LEG), hung from the hip at y=0.86
  const torso=[[Cy(0.2,0.17,0.62),W,0,1.16,0],[Sp(0.2,6,3),W,0,1.45,0],[Cy(0.06,0.06,0.1,6),SKIN,0,1.58,0],[Sp(0.115),SKIN,0,1.7,0],[Sp(0.12,6,3),HAIR,-0.02,1.74,0]];
  const armsDown=[[Bx(0.1,0.58,0.1),W,0,1.17,0.25,0.06],[Bx(0.1,0.58,0.1),W,0,1.17,-0.25,-0.06]];
  const hat=[[Cy(0.24,0.24,0.03,10),'#e8dcc0',0,1.81,0],[Cy(0.13,0.12,0.12,10),'#e8dcc0',0,1.86,0]];
  const bag=[[Bx(0.12,0.3,0.32),'#3a3028',-0.2,1.18,0]];
  // holding up a phone or a camera: the forearms raised before the face
  const snap=[[Bx(0.09,0.3,0.09),W,0.1,1.38,0.2],[Bx(0.09,0.3,0.09),W,0.1,1.38,-0.2],[Bx(0.3,0.08,0.08),W,0.25,1.52,0.13,1.35],[Bx(0.3,0.08,0.08),W,0.25,1.52,-0.13,1.35],[Bx(0.05,0.12,0.16),'#1e1e22',0.42,1.62,0]];
  const LOCALB=body([...torso,...armsDown,...bag]),BAREB=body([...torso,...armsDown]),TOURB=body([...torso,...armsDown,...hat]),SNAPB=body([...torso,...snap,...hat]);
  const LEG=body([[Cy(0.085,0.075,0.84,6).translate(0,-0.42,0),W,0,0,0],[Bx(0.24,0.08,0.11),'#2a2522',0.06,-0.82,0]]);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  // white takes the instance (clothing) colour; the skin and hair markers take a tone by the instance's number
  mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <color_vertex>',`#include <color_vertex>
    #ifdef USE_INSTANCING_COLOR
    { float h=fract(sin(float(gl_InstanceID)*12.9898)*43758.5453);
      if(color.r>0.99&&color.b>0.99&&color.g<0.01) vColor.rgb = h<0.45?vec3(0.87,0.68,0.53):h<0.75?vec3(0.72,0.52,0.38):h<0.9?vec3(0.48,0.33,0.24):vec3(0.95,0.8,0.68);
      else if(color.g>0.99&&color.b>0.99&&color.r<0.01) vColor.rgb = h<0.3?vec3(0.12,0.09,0.07):h<0.55?vec3(0.3,0.2,0.12):h<0.7?vec3(0.75,0.6,0.35):h<0.85?vec3(0.55,0.53,0.5):vec3(0.06,0.05,0.05);
      else if(color.r+color.g+color.b<2.97) vColor.rgb = color.rgb; }
    #endif`);};
  const LOCAL=['#3a3a40','#5a4a3e','#2a3a5a','#7a2a2a','#e0dcd2','#4a5a4a','#8a7a6a','#1e1e22','#b8a888','#6a7a8a','#f0ece4'].map(c=>new THREE.Color(c));
  const VISIT=['#e84a3a','#f0c030','#3a8ae0','#ffffff','#5ac06a','#f08ac0','#e8e0d0','#ff8a2a','#40c0c8','#9a6ad0'].map(c=>new THREE.Color(c));
  const TROUS=['#2a3348','#3a3a3e','#c8bca0','#4a3e30','#1e2430','#8a8478','#e8e2d6'].map(c=>new THREE.Color(c));
  const KEEP=(K.keepOut||[]).map(([la,lo,r])=>[...P([la,lo]),r]);   // the basins of the fountains: people stand round them, not in them
  const free=(x,z)=>!inWater(x,z)&&!KEEP.some(([kx,kz,r])=>(x-kx)**2+(z-kz)**2<r*r)&&!buildingsAt(x,z,0).some(b=>inPoly(x,z,b.ring)&&!(b.holes||[]).some(h=>inPoly(x,z,h)));
  // ---- pedestrians on chains of walkable ways, at the edge of the street (or down a pedestrian one) ----
  const WALK=new Set(['residential','unclassified','living_street','pedestrian','tertiary','secondary','primary','trail']);
  const chop=(pts,max)=>{const out=[];let cur=[pts[0]],run=0;for(let i=1;i<pts.length;i++){run+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cur.push(pts[i]);if(run>max&&i<pts.length-1){out.push(cur);cur=[pts[i]];run=0;}}out.push(cur);return out;};
  // a pedestrian street is joined apart from the rest (it is busier: K.pedestrianMul), its people down the middle
  // each point: x, z, the offset from the centre line, and the deck height where the way is a bridge (else 0)
  const lines=(f,off)=>ROADS.filter(f).map(r=>r.pts.map((p,i)=>[p[0],p[1],off(r),r.ys?r.ys[i]:0])),PED=r=>r.c==='pedestrian'||r.c==='living_street'||r.c==='trail';
  const chs=[...joinFast(lines(r=>WALK.has(r.c)&&!PED(r),r=>r.w/2+1.4),2.5).map(p=>(p.ped=false,p)),...joinFast(lines(PED,()=>0),2.5).map(p=>(p.ped=true,p))].flatMap(p=>chop(p,K.piece||300).map(q=>(q.ped=p.ped,q))).filter(p=>p.length>1).map(pts=>{const cum=[0];for(let i=0;i+1<pts.length;i++)cum.push(cum[i]+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]));let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return {pts,cum,len:cum[cum.length-1],x0,x1,z0,z1,ped:pts.ped};}).filter(c=>c.len>40);
  // busier in the historic centre (K.centre: [lat, lon, radius m, multiplier]), fading out to the edge of it
  const [CX,CZ]=K.centre?P(K.centre):[0,0],CR=K.centre?K.centre[2]:1,CM=K.centre?K.centre[3]:1;
  const walkers=[],pick=a=>a[Math.floor(R()*a.length)],MAXW=K.maxPedestrians||6000;
  // what each chain would have; then, if that is more than the cap, every chain scaled down alike (a companion counts)
  const want=chs.map(c=>{const mx=(c.x0+c.x1)/2,mz=(c.z0+c.z1)/2,f=Math.max(0,1-Math.hypot(mx-CX,mz-CZ)/CR);return c.len/1000*(K.pedestrians||40)*(1+(CM-1)*f)*(c.ped?(K.pedestrianMul||2.5):1);});
  const scale=Math.min(1,MAXW/(want.reduce((a,b)=>a+b,0)*(1+(K.couples||0.3))||1));
  for(let ci=0;ci<chs.length;ci++){const c=chs[ci],n=Math.round(want[ci]*scale+R()*0.999-0.5);
    for(let k=0;k<n&&walkers.length<MAXW;k++){const w={c,s:R()*c.len,dir:R()<0.5?-1:1,v:1.0+R()*0.6,side:R()<0.5?-1:1,lane:0,col:pick(LOCAL),leg:pick(TROUS),ph:R()*6,sc:0.92+R()*0.14};walkers.push(w);
      if(R()<(K.couples||0.3)&&walkers.length<MAXW)walkers.push({...w,lane:0.62,col:pick(LOCAL),leg:pick(TROUS),ph:R()*6,sc:0.9+R()*0.14});}}   // a companion, at the same pace, a step to the side
  // ---- tourists at the sites: on open ground, inside a mapped piazza where there is one ----
  const tourists=[];
  // rmin: keep out of the middle (the Colosseum is a model, not a mapped building)
  for(const [la,lo,rad,n,rmin=0] of K.sites||[]){const [cx,cz]=P([la,lo]),pz=rmin?[]:AREAS.filter(a=>a.kind==='plaza'&&a.bb.x1>cx-rad&&a.bb.x0<cx+rad&&a.bb.z1>cz-rad&&a.bb.z0<cz+rad);
    for(let k=0,tries=0;k<n&&tries<n*30;tries++){const a=R()*Math.PI*2,r=rmin+Math.sqrt(R())*(rad-rmin),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
      if(!free(x,z))continue;if(pz.length&&!pz.some(q=>inPoly(x,z,q.o)))continue;k++;
      // facing the middle of the site, more or less (that is what they came to see)
      const face=Math.atan2(cz-z,cx-x)+(R()-0.5)*1.4,walk=R()<(K.strollers||0.35);
      tourists.push({x,z,h:face,col:pick(VISIT),leg:pick(TROUS),ph:R()*6,v:walk?0.45+R()*0.4:0,hx:x,hz:z,snap:!walk&&R()<(K.photographers||0.18),bare:R()<(K.hatless||0.5),sc:0.9+R()*0.15,walked:0});}}
  const nSnap=tourists.filter(t=>t.snap).length,nBare=tourists.filter(t=>!t.snap&&t.bare).length;
  const mk=(g,n)=>{const m=new THREE.InstancedMesh(g,mat,Math.max(1,n));m.frustumCulled=false;m.setColorAt(0,LOCAL[0]);scene.add(m);return m;};
  const wm=mk(LOCALB,walkers.length),tm=mk(TOURB,tourists.length-nSnap-nBare),bm=mk(BAREB,nBare),sm=mk(SNAPB,nSnap),lm=mk(LEG,(walkers.length+tourists.length)*2);
  // ---- every frame: walk them, place the ones in range, pack them at the front ----
  // upload only the slots drawn this frame: marking the whole buffer sends every instance, used or not
  const pushRange=(im,n)=>{if(!n&&!im._wasN)return;im._wasN=n;im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=Math.max(1,n)*16;im.instanceMatrix.needsUpdate=true;
    if(im.instanceColor){im.instanceColor.updateRange.offset=0;im.instanceColor.updateRange.count=Math.max(1,n)*3;im.instanceColor.needsUpdate=true;}};
  const d=new THREE.Object3D();d.rotation.order='YXZ';let last=0,nl=0;
  // a body and its two legs: (x, z) on the ground, facing yaw, the stride phase (radians), swing amplitude, scale
  function figure(im,i,x,z,yaw,col,leg,swing,amp,sc,y){d.position.set(x,y,z);d.rotation.set(0,yaw,0);d.scale.setScalar(sc);d.updateMatrix();im.setMatrixAt(i,d.matrix);im.setColorAt(i,col);
    const sx=Math.sin(yaw),cx=Math.cos(yaw);   // the body's +z (its left) in the world is (sin yaw, cos yaw)
    for(const s of [-1,1]){d.position.set(x+sx*0.1*s*sc,y+0.86*sc,z+cx*0.1*s*sc);d.rotation.set(0,yaw,Math.sin(swing)*amp*s);d.updateMatrix();lm.setMatrixAt(nl,d.matrix);lm.setColorAt(nl,leg);nl++;}}
  function at(c,s,o){s=Math.max(0,Math.min(c.len,s));let lo=0,hi=c.cum.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(c.cum[m]<=s)lo=m;else hi=m-1;}
    const a=c.pts[lo],b=c.pts[lo+1],L=c.cum[lo+1]-c.cum[lo]||1,t=(s-c.cum[lo])/L;o.x=a[0]+(b[0]-a[0])*t;o.z=a[1]+(b[1]-a[1])*t;o.dx=(b[0]-a[0])/L;o.dz=(b[1]-a[1])/L;o.off=a[2];o.y=(a[3]||0)+((b[3]||0)-(a[3]||0))*t;return o;}
  const o={};
  const TF=K.touristFar||600;
  let ms=0;animHooks.push(now=>{const T0=performance.now();const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;const cx=camera.position.x,cz=camera.position.z,F2=FAR*FAR,T2=TF*TF,t=now/1000;let i=0;nl=0;
    // a chain wholly out of range: its walkers only move along it (no lookup, no drawing)
    for(const c of chs){const dx=Math.max(c.x0-cx,0,cx-c.x1),dz=Math.max(c.z0-cz,0,cz-c.z1);c.near=dx*dx+dz*dz<F2;}
    for(const w of walkers){w.s+=w.v*w.dir*dt;if(w.s>w.c.len){w.s=w.c.len;w.dir=-1;}else if(w.s<0){w.s=0;w.dir=1;}
      if(!w.c.near)continue;at(w.c,w.s,o);const fx=o.dx*w.dir,fz=o.dz*w.dir,off=o.off*w.side+w.lane*w.dir,x=o.x-fz*off,z=o.z+fx*off;if((x-cx)**2+(z-cz)**2>F2)continue;
      const sw=w.s*2.6+w.ph;figure(wm,i,x,z,Math.atan2(-fz,fx),w.col,w.leg,sw,0.42,w.sc,Math.max(groundH(x,z),o.y)+Math.abs(Math.cos(sw))*0.03);i++;}   // over a bridge, on its deck
    wm.count=i;pushRange(wm,i);let it=0,is=0,ib=0;
    for(const p of tourists){if((p.x-cx)**2+(p.z-cz)**2>T2)continue;let swing=0,amp=0;
      if(p.v){// strolling: a slow wander round where they started, turning gently, turning back at the edge of it or at anything in the way
        p.h+=Math.sin(t*0.27+p.ph)*dt*0.5;const nx=p.x+Math.cos(p.h)*p.v*dt,nz=p.z+Math.sin(p.h)*p.v*dt;
        if(Math.hypot(nx-p.hx,nz-p.hz)<14&&free(nx,nz)){p.x=nx;p.z=nz;p.walked+=p.v*dt;}else p.h+=Math.PI*0.6;swing=p.walked*2.6+p.ph;amp=0.36;}
      const yaw=p.v?-p.h:-p.h+Math.sin(t*0.4+p.ph)*0.35,y=groundH(p.x,p.z);
      if(p.snap)figure(sm,is++,p.x,p.z,yaw,p.col,p.leg,0,0,p.sc,y);else if(p.bare)figure(bm,ib++,p.x,p.z,yaw,p.col,p.leg,swing,amp,p.sc,y);else figure(tm,it++,p.x,p.z,yaw,p.col,p.leg,swing,amp,p.sc,y);}
    tm.count=it;pushRange(tm,it);bm.count=ib;pushRange(bm,ib);sm.count=is;pushRange(sm,is);lm.count=nl;pushRange(lm,nl);
    ms=ms*0.95+(performance.now()-T0)*0.05;api.ctx.details.crowdMs=+ms.toFixed(2);api.ctx.details.crowdDrawn=wm.count+tm.count+sm.count;});
  // ---- pigeons (C.crowds.pigeons: [[lat, lon, radius, how many]]): pecking about the paving, heads bobbing, now and
  // then a short hop; drawn within 120 m ----
  let nPig=0;if(K.pigeons&&K.pigeons.length){const PG=[];for(const [la,lo,rad,n] of K.pigeons){const [cx,cz]=P([la,lo]);
      for(let k=0,tries=0;k<n&&tries<n*20;tries++){const a=R()*Math.PI*2,r=Math.sqrt(R())*rad,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(!free(x,z))continue;k++;PG.push({x,z,h:R()*6.28,ph:R()*6.28,hop:0});}}
    nPig=PG.length;const pb=[[new THREE.SphereGeometry(0.13,6,4),'#8a8c94',0,0.16,0],[new THREE.SphereGeometry(0.07,6,4),'#6a6c78',0.13,0.27,0],[new THREE.BoxGeometry(0.16,0.03,0.2),'#7a7c86',-0.12,0.18,0]];
    const pm=new THREE.InstancedMesh(body(pb),new THREE.MeshLambertMaterial({vertexColors:true}),Math.max(1,PG.length));pm.frustumCulled=false;scene.add(pm);let pl=0;
    animHooks.push(now=>{const dt=pl?Math.min(0.1,(now-pl)/1000):0;pl=now;const cx=camera.position.x,cz=camera.position.z,t=now/1000;let i=0;
      for(const p of PG){if((p.x-cx)**2+(p.z-cz)**2>14400)continue;
        if(p.hop>0){p.hop-=dt;p.x+=Math.cos(p.h)*dt*1.6;p.z+=Math.sin(p.h)*dt*1.6;}else if(Math.sin(t*0.7+p.ph*13)>0.995){p.hop=0.35;p.h+=(Math.sin(p.ph+t)-0.0)*1.5;}
        const bob=Math.max(0,Math.sin(t*7+p.ph))*0.06;d.position.set(p.x,groundH(p.x,p.z)+(p.hop>0?Math.sin(p.hop/0.35*Math.PI)*0.25:0),p.z);d.rotation.set(0,-p.h,-bob*3);d.scale.setScalar(1);d.updateMatrix();pm.setMatrixAt(i++,d.matrix);}
      pm.count=i;pushRange(pm,i);});}
  api.ctx.details=Object.assign(api.ctx.details||{},{pigeons:nPig,pedChains:chs.filter(c=>c.ped).length,pedStreetWalkers:walkers.filter(w=>w.c.ped).length,pedestrians:walkers.length,tourists:tourists.length,photographers:nSnap});
}
