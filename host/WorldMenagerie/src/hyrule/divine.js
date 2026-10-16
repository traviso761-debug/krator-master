// ---------- the four Divine Beasts ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own, built from turned hulls,
// limbs, plates and rings, and nothing from the game.
//
// Each is a giant machine of carved stone: a turned hull of a body banded with seams, jointed limbs, plates, and
// lines and spirals that glow (orange while Ganon holds them; the Divine Beasts event turns them blue, events.js).
//   Vah Ruta      an elephant standing in the East Reservoir: pillar legs with knee rings and toed feet, great round
//                 ears with a spiral in each (they fan), tusks, a pavilion on its back, a jointed trunk that sprays
//   Vah Rudania   a salamander crawling round Death Mountain: a broad flat body with a domed shell and a row of
//                 plates down its spine, a wide head with big round eyes, splayed legs with spread fingers, a long
//                 jointed tail that sways
//   Vah Medoh     a bird circling over Rito Village: a hull with a deck and a tower on its back, a beak and a crest,
//                 wings of long feather panels with the primaries swept out at the tips, a fanned tail
//   Vah Naboris   a camel walking the Gerudo Desert: very tall jointed legs on round pads, two humps with a spire on
//                 the first, a long neck rising to the head
// Every moving part is merged by material inside itself, so each Beast is a few dozen draw calls, not hundreds.

export function divine(api){
  const {THREE,ctx,group,gh,animHooks,scene}=api;
  const PL=ctx.plan||{sites:{}},S=PL.sites;
  const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
  const dark=mat(0x4a4642),ivory=mat(0xe8e2d4);
  const lineM=()=>{const m=new THREE.MeshLambertMaterial({color:0xff9a3a,emissive:0xff7a1a,emissiveIntensity:0.9});(ctx.beastGlows=ctx.beastGlows||[]).push(m);return m;};
  const UP=new THREE.Vector3(0,1,0);
  const mesh=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);return o;};
  const ball=(r,m,x,y,z,sx,sy,sz)=>{const o=mesh(new THREE.IcosahedronGeometry(r,2),m,x,y,z);o.scale.set(sx||1,sy||1,sz||1);return o;};
  const box=(lx,ly,lz,m,x,y,z,rx,ry,rz)=>{const o=mesh(new THREE.BoxGeometry(lx,ly,lz),m,x,y,z);o.rotation.set(rx||0,ry||0,rz||0);return o;};
  const cyl=(r0,r1,h,m,x,y,z,seg)=>mesh(new THREE.CylinderGeometry(r1,r0,h,seg||14).translate(0,h/2,0),m,x,y,z);
  const limb=(a,b,r0,r1,m,seg)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,seg||10),m);o.position.copy(A).addScaledVector(d,0.5);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;};
  // a ring: TorusGeometry lies in its XY plane (faces z); rx/ry turn it
  const ring=(r,t,m,x,y,z,rx,ry,sx,sy)=>{const o=mesh(new THREE.TorusGeometry(r,t,5,32),m,x,y,z);o.rotation.set(rx||0,ry||0,0);o.scale.set(sx||1,sy||1,1);return o;};
  // a turned hull along x: prof is [[x, radius]...], squashed by sy and sz
  const hull=(prof,sy,sz,m,x,y,z)=>{const pts=[new THREE.Vector2(0,prof[0][0])].concat(prof.map(([px,r])=>new THREE.Vector2(r,px)),[new THREE.Vector2(0,prof[prof.length-1][0])]);
    const g=new THREE.LatheGeometry(pts,28).rotateZ(-Math.PI/2);const o=mesh(g,m,x,y,z);o.scale.set(1,sy,sz);return o;};
  const rAt=(prof,x)=>{for(let i=0;i+1<prof.length;i++){const [a,ra]=prof[i],[b,rb]=prof[i+1];if(x>=a&&x<=b)return ra+(rb-ra)*(x-a)/(b-a);}return 0;};
  // a band round a hull at x: a seam standing a little proud
  const band=(prof,sy,sz,x,y,t,m)=>ring(rAt(prof,x)+t*0.4,t,m,x,y,0,0,Math.PI/2,sz,sy);
  // the spiral that marks them all, flat in its XY plane (faces z)
  const spiral=(r,turns,t,m,x,y,z,rx,ry)=>{const pts=[];for(let i=0;i<=80;i++){const u=i/80,a=u*turns*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r*(0.12+0.88*u),Math.sin(a)*r*(0.12+0.88*u),0));}
    const o=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,t,4,false),m,x,y,z);o.rotation.set(rx||0,ry||0,0);return o;};
  // merge each group's own meshes by material, in that group's frame
  const bake=G=>{const gs=[];G.traverse(o=>{if(o.isGroup||o===G)gs.push(o);});
    for(const P of gs){const by=new Map();for(const c of P.children)if(c.isMesh&&!c.userData.keep){if(!by.has(c.material))by.set(c.material,[]);by.get(c.material).push(c);}
      for(const [m,l] of by){if(l.length<2)continue;for(const c of l)P.remove(c);P.add(api.mergeParts(l,m));}}
    G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return G;};

  return {
  // ================================================================ Vah Ruta, the elephant
  ruta(L,x,z){
    const R_=S.ruta,lake=(PL.lakes||[]).find(l=>/Reservoir/.test(l.name)),wl=lake?lake.level:gh(R_.x,R_.z),g=new THREE.Group(),glow=lineM();
    const st=mat(0xa2a6a4),st2=mat(0x7f8583),st3=mat(0x93968f);
    g.position.set(R_.x,wl,R_.z);g.scale.setScalar(2);   // the size the game gives them: they tower over the land
    // drawn facing +x. The body: a turned hull, seams round it, a glowing line and a spiral on each flank
    const B=[[-32,0],[-30,9],[-22,15],[-8,18],[8,18],[22,16],[30,12],[33,0]],BY=38;
    g.add(hull(B,1.05,0.88,st,0,BY,0));
    for(const bx of [-20,-6,8,22])g.add(band(B,1.05,0.88,bx,BY,0.8,st2));
    for(const s of [-1,1]){g.add(box(30,0.9,0.6,glow,0,BY+5,s*15.9),box(30,0.9,0.6,glow,0,BY-6,s*15.7),spiral(6,2.5,0.45,glow,0,BY-0.5,s*16.0,0,s<0?Math.PI:0));
      for(const px of [-14,14])g.add(box(9,7,1.2,st3,px,BY-0.5,s*15.3));}
    // the legs: pillars with a ring at the knee, a glowing band, a wide foot with three toes
    for(const [a,b] of [[18,10],[18,-10],[-18,10],[-18,-10]]){
      g.add(limb([a,30,b],[a,13,b],6.2,5.4,st2,12),ring(5.8,0.9,st,a,13,b,Math.PI/2),ring(6.0,0.35,glow,a,16,b,Math.PI/2),limb([a,13,b],[a,-1,b],5.4,6.4,st2,12));
      g.add(cyl(7.6,7.2,3.2,st,a,-4,b,16));for(const k of [-1,0,1])g.add(ball(1.9,ivory,a+6.6,-2.6,b+k*3.4,1,0.7,1));}
    // the head, with its face plate, brow and eyes, and a ring of light round the face
    g.add(ball(1,st,36,47,0,11,12,10.5),box(5,11,14,st3,43.5,51,0,0,0,-0.25),box(4,2,16,st2,45,55.5,0,0,0,-0.4));
    g.add(ball(1.6,glow,46,49.5,5),ball(1.6,glow,46,49.5,-5),ring(7.5,0.4,glow,44.5,47,0,0,Math.PI/2));
    // tusks: three bends each, down, forward and up
    for(const s of [-1,1]){const P=[[42,39,s*6],[49,33,s*8],[56,32,s*9],[61,36,s*9.5]];for(let k=0;k<3;k++)g.add(limb(P[k],P[k+1],1.7-k*0.4,1.3-k*0.4,ivory,8));}
    // the ears: great discs with a rim and a spiral, angled back; they fan
    const ears=[];for(const s of [-1,1]){const e=new THREE.Group();e.position.set(32,50,s*11);
      const disc=mesh(new THREE.CylinderGeometry(15,15,1.6,26).rotateX(Math.PI/2),st3,-6,0,s*1.2);disc.scale.set(0.85,1.1,1);e.add(disc);
      e.add(ring(15,0.8,st2,-6,0,s*1.2,0,0,0.85,1.1),spiral(10,2.2,0.45,glow,-6,0,s*2.2,0,s<0?Math.PI:0));g.add(e);ears.push([e,s]);}
    // the pavilion on its back
    g.add(cyl(13,12,2.4,st2,0,57,0,24),ring(12.8,0.45,glow,0,58.4,0,Math.PI/2),cyl(7,6.5,8,st,0,59,0,16),ball(6.6,st3,0,67,0,1,0.7,1),cyl(0.8,0.3,6,dark,0,71,0,6));
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.add(cyl(0.7,0.7,5,st,Math.cos(a)*11,59,Math.sin(a)*11,6));}
    g.add(limb([-31,42,0],[-38,30,0],1.6,0.9,st2,6),ball(1.6,dark,-38.5,29,0));
    // the trunk: six joints, a seam at each, a flared mouth at the tip
    const trunk=new THREE.Group();trunk.position.set(44,42,0);g.add(trunk);
    let parent=trunk;const segs=[];
    for(let k=0;k<6;k++){const j=new THREE.Group();if(k)j.position.y=-6;parent.add(j);const r0=3.8-k*0.45,r1=3.5-k*0.45;
      j.add(limb([0,0,0],[0,-6,0],r0,r1,st,10),ring(r0+0.15,0.4,k%2?glow:st2,0,-0.3,0,Math.PI/2));segs.push(j);parent=j;}
    const tip=new THREE.Group();tip.position.y=-6;parent.add(tip);tip.add(cyl(1.4,2.6,2.5,st2,0,-2.5,0,10));
    // the spray: a fountain of drops from the trunk's tip, arcing out over the reservoir
    const N=400,pos=new Float32Array(N*3),vel=new Float32Array(N*3),life=new Float32Array(N);
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const spray=new THREE.Points(pg,new THREE.PointsMaterial({color:0xdff4ff,size:1.6,transparent:true,opacity:0.8,depthWrite:false}));spray.frustumCulled=false;spray.userData.noFingerprint=true;scene.add(spray);
    bake(g);const grp=group(L,[g]);
    const v=new THREE.Vector3(),d=new THREE.Vector3();let next=0;
    animHooks.push(now=>{const t=now/1000;
      segs.forEach((j,k)=>{j.rotation.z=k===0?0.15+Math.sin(t*0.6)*0.12:0.2+Math.sin(t*0.6+k*0.5)*0.14;});
      for(const [e,s] of ears)e.rotation.y=s*(0.45+Math.sin(t*0.9+s)*0.18);
      g.rotation.y=Math.sin(t*0.05)*0.4;
      tip.getWorldPosition(v);d.set(1,0.6,0).applyAxisAngle(UP,g.rotation.y);
      for(let i=0;i<N;i++){if(life[i]<=0){if(t<next)continue;next=t+0.004;life[i]=2.4;pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;
          vel[i*3]=d.x*40+(Math.random()-0.5)*7;vel[i*3+1]=30+Math.random()*10;vel[i*3+2]=d.z*40+(Math.random()-0.5)*7;}
        life[i]-=0.016;vel[i*3+1]-=9.8*0.016;pos[i*3]+=vel[i*3]*0.016;pos[i*3+1]+=vel[i*3+1]*0.016;pos[i*3+2]+=vel[i*3+2]*0.016;if(pos[i*3+1]<wl)life[i]=0;}
      pg.attributes.position.needsUpdate=true;});
    return grp;
  },

  // ================================================================ Vah Rudania, the salamander
  rudania(L,x,z){
    const D=S.deathmountain,g=new THREE.Group(),glow=lineM(),legs=[],st=mat(0xa28c7a),st2=mat(0x7e6a5c),st3=mat(0x93806e);
    g.scale.setScalar(2);
    const B=[[-36,0],[-34,7],[-20,12],[0,13],[20,12],[34,8],[37,0]];
    g.add(hull(B,0.5,1,st,0,6,0));
    for(const bx of [-24,-8,8,24])g.add(band(B,0.5,1,bx,6,0.6,st2));
    // the shell on its back, a spiral on top, and a row of plates down the spine
    g.add(ball(1,st3,-2,9.5,0,21,5.5,12.5),ring(12.4,0.5,glow,-2,10.5,0,Math.PI/2,0,1.68,1),spiral(9,2.6,0.45,glow,-2,15.1,0,-Math.PI/2));
    for(let k=0;k<9;k++){const px=-34+k*8.5;if(Math.abs(px+2)<16)continue;g.add(box(6,3,8-Math.abs(px)/8,st2,px,10.5-Math.abs(px)/12,0,0,0,0.25));}
    for(const s of [-1,1])g.add(box(56,0.6,0.6,glow,0,6,s*13.1));
    // the head: broad and flat, a wide jaw, big round eyes on top at the sides
    g.add(ball(1,st,44,7.5,0,12,5.5,12),ball(1,st2,46,4,0,11,3,11),box(14,0.6,18,dark,48,5.4,0));
    for(const s of [-1,1])g.add(ring(3.3,0.7,st2,47,10.5,s*7,-Math.PI/2+0.5*s*0,0),ball(2.8,glow,47,10.6,s*7,1,0.75,1),ball(0.6,dark,55.5,8,s*2.5));
    // the legs: out sideways, an elbow, down to a flat hand with four spread fingers
    for(const [a,b] of [[18,1],[18,-1],[-18,1],[-18,-1]]){const l=new THREE.Group();l.position.set(a,5,b*11);
      l.add(limb([0,0,0],[4,1,b*14],3.4,2.8,st2),ball(3.1,st,4,1,b*14),ring(3.0,0.4,glow,4,1,b*14,0,Math.PI/2),limb([4,1,b*14],[7,-7,b*18],2.8,2.2,st2));
      l.add(box(9,1.6,8,st,8,-8,b*19));
      for(let f=0;f<4;f++){const fa=-0.9+f*0.6,tx=8+Math.cos(fa)*9,tz=b*(19+Math.sin(fa+0.9)*5+2);l.add(limb([8+Math.cos(fa)*3,-8,b*(19+1)],[tx,-8.4,tz],0.9,0.7,st2,6),ball(1.4,st3,tx,-8.4,tz));}
      g.add(l);legs.push(l);}
    // the tail: six joints, swaying
    const tail=new THREE.Group();tail.position.set(-34,5.5,0);g.add(tail);let parent=tail;const tsegs=[];
    for(let k=0;k<6;k++){const j=new THREE.Group();if(k)j.position.x=-12;parent.add(j);const r0=6.5-k*0.9,r1=5.6-k*0.9;
      j.add(limb([0,0,0],[-12,0,0],r0,r1,st,10),ring(r0+0.1,0.45,k%2?glow:st2,-0.4,0,0,0,Math.PI/2));tsegs.push(j);parent=j;}
    bake(g);const grp=group(L,[g]);
    // round the mountain on its upper slope, nose first, keeping to the ground
    const r=760;
    // laid on the slope: pitched to the ground ahead and behind, rolled to the ground either side (yaw, then pitch, then roll)
    g.rotation.order='YZX';
    animHooks.push(now=>{const t=now/1000,a=t*0.006+1.2,px=D.x+Math.cos(a)*r,pz=D.z+Math.sin(a)*r*0.85,ry=-(a+Math.PI/2);
      const fx=Math.cos(ry),fz=-Math.sin(ry),sx=Math.sin(ry),sz=Math.cos(ry);
      const hF=gh(px+fx*80,pz+fz*80),hB=gh(px-fx*80,pz-fz*80),hL=gh(px+sx*40,pz+sz*40),hR=gh(px-sx*40,pz-sz*40),h0=gh(px,pz);
      g.position.set(px,Math.max(h0,(hF+hB+hL+hR)/4)+3,pz);g.rotation.set(-Math.atan2(hL-hR,80),ry,Math.atan2(hF-hB,160));
      legs.forEach((l,k)=>{l.rotation.y=Math.sin(t*1.4+(k%2?Math.PI:0)+(k>1?Math.PI/2:0))*0.35;});
      tsegs.forEach((j,k)=>{j.rotation.y=Math.sin(t*1.4-k*0.6)*0.14;});});
    return grp;
  },

  // ================================================================ Vah Medoh, the bird
  medoh(L,x,z){
    const R_=S.rito,g=new THREE.Group(),glow=lineM(),wings=[],st=mat(0xb2ac9e),st2=mat(0x8c867a),st3=mat(0xa09a8c),beak=mat(0xd8b060);
    g.scale.setScalar(2.2);
    const B=[[-30,0],[-28,5],[-14,9],[4,10],[20,8],[30,5],[33,0]];
    g.add(hull(B,0.85,1,st,0,0,0));
    for(const bx of [-18,-4,12])g.add(band(B,0.85,1,bx,0,0.5,st2));
    // the deck on its back, its rail of light, a tower in the middle
    g.add(box(40,1.6,17,st2,-2,7.6,0),box(40,0.5,0.5,glow,-2,8.6,8.4),box(40,0.5,0.5,glow,-2,8.6,-8.4));
    g.add(cyl(4,3.4,7,st3,-4,8.4,0,12),ball(3.6,st,-4,15.4,0,1,0.8,1),cyl(0.5,0.2,4,dark,-4,18,0,6));
    // the head: beak, eyes, a crest swept back
    g.add(ball(1,st,34,4,0,7,6,5.5),mesh(new THREE.ConeGeometry(2.6,12,10).rotateZ(-Math.PI/2),beak,45,3,0));
    for(const s of [-1,1])g.add(ball(1.4,glow,38.5,6,s*4));
    for(const [dy,len] of [[0,11],[2,13],[4,10]])g.add(limb([33,8+dy*0.4,0],[33-len,10+dy,0],1.4,0.4,st2,6));
    // the wings: a spar, the covert panel, long feathers trailing, the primaries swept out at the tip; a spiral on each
    for(const s of [-1,1]){const w=new THREE.Group();w.position.set(6,3,s*8);
      w.add(limb([0,0,0],[-6,0,s*95],2.8,1.2,st2,8),box(18,2,90,st,-6,0,s*47,0,s*0.06,0),box(1,0.6,90,glow,0,1.6,s*47,0,s*0.06,0));
      for(let k=0;k<9;k++){const len=24+k*3.2,f=new THREE.Mesh(new THREE.BoxGeometry(len,1,8.4).translate(-len/2,0,0),k%2?st3:st);f.position.set(-12,-0.4,s*(12+k*9.4));f.rotation.y=s*(-0.03*k);w.add(f);}
      for(let j=0;j<4;j++){const f=new THREE.Mesh(new THREE.BoxGeometry(7,0.9,30).translate(0,0,s*15),j%2?st3:st);f.position.set(-8-j*5,-0.2,s*92);f.rotation.y=s*(0.15+0.22*j);w.add(f);}
      w.add(spiral(8,2.3,0.4,glow,-8,1.1,s*30,-Math.PI/2));g.add(w);wings.push([w,s]);}
    // the tail fan, and the feet tucked up
    for(let k=-2;k<=2;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(30,1,7).translate(-15,0,0),k%2?st3:st);f.position.set(-27,1,0);f.rotation.y=k*0.22;g.add(f);}
    for(const s of [-1,1])g.add(limb([4,-7,s*4],[-6,-9,s*4],1.6,1,st2,6),ball(1.5,dark,-7,-9,s*4));
    bake(g);const grp=group(L,[g]);
    const alt=Math.max(R_.y,500)+620;
    animHooks.push(now=>{const t=now/1000,a=t*0.035;g.position.set(R_.x+Math.cos(a)*700,alt+Math.sin(t*0.3)*20,R_.z+Math.sin(a)*700);
      g.rotation.set(0,-(a+Math.PI/2),0);g.rotateX(-0.25);
      for(const [w,s] of wings)w.rotation.x=s*Math.sin(t*0.8)*0.12;});
    return grp;
  },

  // ================================================================ Vah Naboris, the camel
  naboris(L,x,z){
    const N=S.naboris,g=new THREE.Group(),glow=lineM(),legs=[],st=mat(0xbcab8a),st2=mat(0x958668),st3=mat(0xa89878);
    g.scale.setScalar(2);
    const B=[[-38,0],[-36,8],[-20,13],[0,14],[20,13],[36,10],[40,0]],BY=62;
    g.add(hull(B,0.9,0.95,st,0,BY,0));
    for(const bx of [-24,0,24])g.add(band(B,0.9,0.95,bx,BY,0.7,st2));
    for(const s of [-1,1])g.add(spiral(8,2.5,0.45,glow,-12,BY-1,s*13.6,0,s<0?Math.PI:0),spiral(6,2.2,0.4,glow,14,BY-1,s*13.2,0,s<0?Math.PI:0),box(60,0.7,0.6,glow,0,BY-8,s*12.2));
    // the humps: the big one behind with a ring of light, the smaller in front with a spire
    g.add(ball(1,st2,-14,72,0,14,11,11),ring(10,0.6,glow,-14,78,0,Math.PI/2,0,1.3,1),ball(1,st3,-14,82.5,0,5,2.5,5));
    g.add(ball(1,st2,14,71,0,10,8,9),cyl(2.6,0.4,13,st3,14,77,0,8),ring(3,0.4,glow,14,80,0,Math.PI/2));
    // the neck, rising in four lengths with a seam at each, and the head
    const NP=[[34,66,0],[42,78,0],[46,90,0],[48,98,0]];for(let k=0;k<3;k++){g.add(limb(NP[k],NP[k+1],6-k*0.8,5.2-k*0.8,st,10),ball(5.6-k*0.8,st2,...NP[k+1]));}
    g.add(ball(1,st,53,101,0,8,5,5),ball(1,st2,60,99.5,0,5,3.4,4),box(5,0.5,6,dark,61.5,98,0));
    for(const s of [-1,1])g.add(ball(1.3,glow,55.5,103,s*4),mesh(new THREE.ConeGeometry(1.4,5,6),st2,49,106.5,s*3));
    g.add(limb([-38,66,0],[-44,50,0],1.4,0.6,st2,6),ball(2,dark,-44.5,48.5,0));
    // the legs: thigh, knee, a long shin with a glowing line, the ankle ring, a round pad split in front
    for(const [a,b] of [[24,8],[24,-8],[-24,8],[-24,-8]]){const l=new THREE.Group();l.position.set(a,58,b);const f=a>0?3:-3;
      l.add(limb([0,0,0],[f,-26,0],4,2.9,st2,10),ball(3.5,st,f,-26,0),limb([f,-26,0],[0,-52,0],2.7,2.2,st2,10),ring(2.6,0.6,st,0,-52,0,Math.PI/2));
      l.add(limb([f*0.5+1.9,-29,0],[1.9,-50,0],0.35,0.35,glow,4),cyl(6,5.6,4,st,0,-58,0,16),box(5,4.2,0.6,dark,3.5,-57.9,0));
      g.add(l);legs.push(l);}
    bake(g);const grp=group(L,[g]);
    // walking back and forth along the desert, slowly, legs swinging in pairs
    animHooks.push(now=>{const t=now/1000,u=Math.sin(t*0.004),px=N.x+u*900,pz=N.z+Math.sin(t*0.003)*260,dir=Math.cos(t*0.004)>=0?0:Math.PI;
      g.position.set(px,gh(px,pz),pz);g.rotation.y=dir;
      legs.forEach((l,k)=>{l.rotation.z=Math.sin(t*0.9+(k===0||k===3?0:Math.PI))*0.22;});});
    return grp;
  },
  };
}
