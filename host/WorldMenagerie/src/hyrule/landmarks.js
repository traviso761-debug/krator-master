// What is built in Hyrule. Fan work: The Legend of Zelda: Breath of the Wild belongs to Nintendo; every shape here
// is this project's own low-poly geometry and nothing from the game is used.
//
// The plan (data/cities/hyrule-plan.json, from tools/make-hyrule.py) says where each thing stands; the landmarks in
// the city file say what each is called. Hyrule Castle in the middle; the fifteen Sheikah towers and the shrines; the
// stables with their horse heads; the Great Plateau with the Temple of Time, its wall, the Shrine of Resurrection and
// the old man's cabin; the villages - Kakariko, Hateno and its laboratory, Rito Village on its pillar of rock, Zora's
// Domain, Goron City, Gerudo Town, Lurelin; the Great Deku Tree; the Lomei Labyrinths; Akkala's citadel and its
// spiral; Hylia Bridge; Fort Hateno; and the decayed Guardians lying in the fields. The Divine Beasts and Calamity
// Ganon are beasts.js.

import { guardianKit } from './guardian.js';

export function landmarks(api){
  const {THREE,ctx,group,gh,animHooks}=api;
  const PL=ctx.plan||{sites:{}},S=PL.sites;
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;
  const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const glowM=(c,k)=>{const m=new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:0.6,flatShading:true});glows.push([m,k||1]);return m;};
  const glows=[];animHooks.push(()=>{const n=nightF();for(const [m,k] of glows)m.emissiveIntensity=(0.45+0.9*n)*k;});
  const M={stone:mat(0xbab2a2),stone2:mat(0x9c9486),stone3:mat(0x7e776c),slate:mat(0x4a5a74),slate2:mat(0x3c4a62),gold:mat(0xc8a050),
    wood:mat(0x8a6440),wood2:mat(0x6a4a30),thatch:mat(0xb89a5a),plaster:mat(0xe8e0cc),rock:mat(0x8a8276),rock2:mat(0x6c665e),
    sheikah:mat(0x4a4642),sheikah2:mat(0x5e5a54),cloth:mat(0xe8dcc0),red:mat(0xa83a2a),moss:mat(0x5a7a3a),guardian:mat(0x7c7a72),
    sand:mat(0xe0c08a),sand2:mat(0xc8a46a),blue:mat(0x6aa8c8),pale:mat(0xd8e8ee),leaf:mat(0x4a7a36),leaf2:mat(0x5c8c40),
    trunk:mat(0x6a5038),pink:mat(0xe890b0),black:mat(0x1a1418),white:mat(0xf4f2ec)};
  const malice=glowM(0xb0185a,1.2),eyeM=glowM(0xff9a2a,1.4);
  const mesh=(g,m,x,y,z,ry)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;return o;};
  const blk=(x,y,z,lx,h,lz,m,ry)=>mesh(new THREE.BoxGeometry(lx,h,lz).translate(0,h/2,0),m,x,y,z,ry);
  const cyl=(x,y,z,r0,r1,h,m,seg)=>mesh(new THREE.CylinderGeometry(r1,r0,h,seg||10).translate(0,h/2,0),m,x,y,z);
  const cone=(x,y,z,r,h,m,seg)=>mesh(new THREE.ConeGeometry(r,h,seg||10).translate(0,h/2,0),m,x,y,z);
  const sph=(x,y,z,r,m,sx,sy,sz)=>{const o=mesh(new THREE.IcosahedronGeometry(r,1),m,x,y,z);o.scale.set(sx||1,sy||1,sz||1);return o;};
  const UP=new THREE.Vector3(0,1,0);
  const limb=(a,b,r0,r1,m,seg)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,seg||8),m);o.position.copy(A).addScaledVector(d,0.5);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;};
  // one mesh per material for everything that does not move or glow on its own
  function solid(parts){const keep=[],b=new Map();
    for(const p of parts){if(p.isMesh&&!p.children.length&&!Array.isArray(p.material)&&!p.material.map&&!p.userData.noMerge){if(!b.has(p.material))b.set(p.material,[]);b.get(p.material).push(p);}else keep.push(p);}
    for(const [m,l] of b){if(l.length<3){keep.push(...l);continue;}keep.push(api.mergeParts(l,m));}return keep;}
  const build=(L,parts)=>group(L,solid(parts));
  const hz=v=>{const t=Math.sin(v*12.9898)*43758.5453;return t-Math.floor(t);};

  // a decayed Guardian (guardian.js): sunk to its drum, the head tipped or fallen off, legs folded or gone, moss on it
  const GK=guardianKit(THREE);
  function deadGuardian(parts,x,z,s,yaw){GK.fallen(parts,x,gh(x,z),z,yaw||0,Math.floor(Math.abs(x*7.3+z*3.1))%997);}

  return {
  // ================================================================ Hyrule Castle
  // On its hill inside the moat: an outer wall with round towers, terraces climbing to the main keep, the Sanctum's
  // tall tower in the middle with a spire, slim towers round it under blue-slate cones. Malice on the walls.
  castle(L,x,z){
    const C=S.castle,cx=C.x,cz=C.z,y0=gh(cx,cz),parts=[];
    // the outer wall, an irregular ring, with round towers at its corners and a gate to the south
    const ring=[];for(let k=0;k<10;k++){const a=k/10*Math.PI*2,r=330+hz(k)*30;ring.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r*0.85]);}
    for(let k=0;k<ring.length;k++){const [ax,az]=ring[k],[bx,bz]=ring[(k+1)%ring.length],L_=Math.hypot(bx-ax,bz-az),y=Math.min(gh(ax,az),gh(bx,bz));
      if(k===2)continue;   // the south gate
      parts.push(blk((ax+bx)/2,y-2,(az+bz)/2,L_,20,7,M.stone2,-Math.atan2(bz-az,bx-ax)));
      parts.push(cyl(ax,gh(ax,az)-2,az,9,8,32,M.stone),cone(ax,gh(ax,az)+30,az,10,14,M.slate));}
    // the terraces, one on another: built round the centre and then scaled up together, so the castle stands as
    // big in its moat as it does in the game
    const core=[],P_=parts;{const parts=core;
    parts.push(blk(cx,y0-4,cz,250,22,200,M.stone2,0.1),blk(cx+5,y0+18,cz-5,180,24,140,M.stone,0.1),blk(cx+5,y0+42,cz-10,110,20,85,M.stone2,0.1));
    // the main keep: a long hall under a slate roof, buttressed
    parts.push(blk(cx+5,y0+62,cz-12,90,34,46,M.stone,0.1));
    {const r=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4),M.slate);r.scale.set(70,26,36);r.position.set(cx+5,y0+96+13,cz-12);r.rotation.y=0.1;parts.push(r);}
    // the Sanctum's tower, rising out of the keep, and its spire
    parts.push(blk(cx+5,y0+62,cz-12,26,120,26,M.stone,0.1),blk(cx+5,y0+182,cz-12,30,8,30,M.stone2,0.1));
    parts.push(cone(cx+5,y0+190,cz-12,18,70,M.slate2,8),cone(cx+5,y0+258,cz-12,1.2,12,M.gold,6));
    for(const [a,b] of [[-14,-14],[14,-14],[-14,14],[14,14]]){parts.push(cyl(cx+5+a,y0+150,cz-12+b,4.5,4,38,M.stone),cone(cx+5+a,y0+188,cz-12+b,5.5,16,M.slate,8));}
    // the slim towers round it
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2+0.4,r=95+hz(k+3)*40,tx=cx+Math.cos(a)*r,tz=cz+Math.sin(a)*r*0.8,ty=gh(tx,tz),h=55+hz(k+9)*55;
      parts.push(cyl(tx,ty-2,tz,7,6,h,M.stone),cone(tx,ty+h-2,tz,8,22,M.slate,8),cyl(tx,ty+h*0.6,tz,7.6,7.6,2,M.stone2));}
    }
    const K=1.55;for(const p of core){p.position.x=cx+(p.position.x-cx)*K;p.position.z=cz+(p.position.z-cz)*K;p.position.y=y0+(p.position.y-y0)*K;p.scale.multiplyScalar(K);P_.push(p);}
    // bridges over the moat, and the road in
    for(const a of [Math.PI/2,-0.3,Math.PI+0.5]){const r0=(PL.moats&&PL.moats[0])?PL.moats[0].r0-10:360,r1=(PL.moats&&PL.moats[0])?PL.moats[0].r1+10:470,
        ax=cx+Math.cos(a)*r0,az=cz+Math.sin(a)*r0,bx=cx+Math.cos(a)*r1,bz=cz+Math.sin(a)*r1,y=Math.max(gh(ax,az),gh(bx,bz))+1;
      parts.push(blk((ax+bx)/2,y-3,(az+bz)/2,Math.hypot(bx-ax,bz-az),3,12,M.stone2,-a));}
    // malice: the red-black goo on the walls and terraces, with its eyes
    for(let k=0;k<18;k++){const a=hz(k*3.1)*Math.PI*2,r=60+hz(k*7.7)*230,mx=cx+Math.cos(a)*r,mz=cz+Math.sin(a)*r*0.85,my=gh(mx,mz)+(r<140?20+hz(k)*40:0);
      const b=sph(mx,my,mz,8+hz(k*2.3)*10,malice,1.4,0.35,1.1);b.userData.noMerge=true;parts.push(b);if(k%3===0){parts.push(sph(mx,my+3,mz,2.2,M.white),sph(mx+1.6,my+3.2,mz,1.1,eyeM));}}
    return build(L,parts);
  },

  // ================================================================ Castle Town, in ruins
  castletown(L,x,z){
    const C=S.castletown,parts=[];
    for(let k=0;k<70;k++){const a=hz(k*1.7)*Math.PI*2,r=40+hz(k*5.3)*200,bx=C.x+Math.cos(a)*r,bz=C.z+Math.sin(a)*r*0.7,y=gh(bx,bz),w=8+hz(k)*10,d=6+hz(k+1)*8,h=3+hz(k+2)*9;
      parts.push(blk(bx,y-1,bz,w,h,1.4,M.stone2,a),blk(bx+Math.sin(a)*d/2,y-1,bz-Math.cos(a)*d/2,1.4,h*0.7,d,M.stone3,a));
      if(k%9===0)deadGuardian(parts,bx+12,bz+8,1,a);}
    return build(L,parts);
  },

  // ================================================================ the Sheikah towers
  // A hundred metres of dark stone frame on a mound of roots and rock, braced, glowing along its legs, a platform at
  // the top with the pedestal. They glow orange until they are activated, and blue after (events.js: the towers).
  tower(L,x,z){
    const T=(PL.towers||[])[L.index||0];if(!T)return build(L,[]);
    const tx=T.x,tz=T.z,y0=gh(tx,tz),parts=[],H=100;
    const glow=new THREE.MeshLambertMaterial({color:0xffa04a,emissive:0xff7a1a,emissiveIntensity:0.6,flatShading:true});glows.push([glow,1]);
    ctx.towerGlows=ctx.towerGlows||[];ctx.towerGlows[L.index||0]=glow;
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2,r=12+hz(k+tx)*5;parts.push(sph(tx+Math.cos(a)*r,y0,tz+Math.sin(a)*r,6+hz(k)*4,M.rock2,1,0.7,1));}
    parts.push(cyl(tx,y0-2,tz,16,11,12,M.rock));
    const corner=[[-1,-1],[1,-1],[1,1],[-1,1]];
    for(const [a,b] of corner){parts.push(limb([tx+a*10,y0+8,tz+b*10],[tx+a*5,y0+H,tz+b*5],1.6,1.1,M.sheikah,6));
      const g=limb([tx+a*10.9,y0+12,tz+b*10.9],[tx+a*5.7,y0+H-6,tz+b*5.7],0.4,0.3,glow,4);g.userData.noMerge=true;parts.push(g);}
    for(let h=20;h<H;h+=18){const s=10-5*h/H;for(let k=0;k<4;k++){const [a,b]=corner[k],[c,d]=corner[(k+1)%4];
      parts.push(limb([tx+a*s,y0+h,tz+b*s],[tx+c*s,y0+h,tz+d*s],0.7,0.7,M.sheikah2,4));
      parts.push(limb([tx+a*s,y0+h,tz+b*s],[tx+c*(s-2.6),y0+h+16,tz+d*(s-2.6)],0.45,0.45,M.sheikah2,4));}}
    // the upper body: a narrower block with glowing panels, then the platform and the pedestal
    parts.push(blk(tx,y0+H-22,tz,9,18,9,M.sheikah));
    for(const [a,b] of corner){const p=blk(tx+a*4.6,y0+H-18,tz+b*4.6,0.3,10,0.3,glow);p.userData.noMerge=true;parts.push(p);}
    parts.push(blk(tx,y0+H-4,tz,17,2.4,17,M.sheikah2),cyl(tx,y0+H-1.6,tz,1.2,1.4,2.2,M.sheikah));
    const eye=mesh(new THREE.CylinderGeometry(1.6,1.6,0.3,16),glow,tx,y0+H+0.8,tz);eye.userData.noMerge=true;parts.push(eye);
    for(const [a,b] of corner)parts.push(blk(tx+a*7.6,y0+H-1.6,tz+b*7.6,1.6,4,1.6,M.sheikah));
    return build(L,parts);
  },

  // ================================================================ the shrines, all of them
  // A small dark dome on a raised octagon, its lines glowing - orange if it has not been done, blue if it has
  shrines(L,x,z){
    const parts=[],orange=glowM(0xff8a2a,1),blue=glowM(0x4ad8ff,1);
    for(const s of (PL.shrines||[])){const y=gh(s.x,s.z),g=s.blue?blue:orange;
      parts.push(cyl(s.x,y-1,s.z,6,5.5,2.5,M.sheikah2,8),cyl(s.x,y+1.5,s.z,3.4,3.2,3.5,M.sheikah,8),sph(s.x,y+5,s.z,3.3,M.sheikah,1,0.75,1));
      parts.push(mesh(new THREE.TorusGeometry(3.45,0.18,4,16).rotateX(Math.PI/2),g,s.x,y+3.2,s.z),mesh(new THREE.TorusGeometry(2.4,0.15,4,16).rotateX(Math.PI/2),g,s.x,y+6.6,s.z),
                 cyl(s.x,y+1.4,s.z,0.5,0.5,2.2,g,6));}
    return build(L,parts);
  },

  // ================================================================ the stables
  // A big canvas tent with a horse's head over the door, a paddock beside it
  stables(L,x,z){
    const parts=[],tan=mat(0xc89a62),mane=mat(0x8a3a2a);
    for(const s of (PL.stables||[])){const y=gh(s.x,s.z),a=hz(s.x)*Math.PI;
      const c=Math.cos(a),sn=Math.sin(a),P=(u,w)=>[s.x+c*u-sn*w,s.z+sn*u+c*w];
      const tent=new THREE.Mesh(new THREE.CylinderGeometry(9,9,22,10,1,false,0,Math.PI).rotateZ(Math.PI/2),M.cloth);tent.position.set(s.x,y+1,s.z);tent.rotation.y=-a;parts.push(tent);
      const [hx,hz_]=P(11.5,0);parts.push(blk(hx,y,hz_,2,6,3,M.wood2,-a));
      const head=new THREE.Mesh(new THREE.BoxGeometry(3,8,4),tan);head.position.set(hx+c*1.5,y+11,hz_+sn*1.5);head.rotation.set(0,-a,0.45);parts.push(head);
      const muzzle=new THREE.Mesh(new THREE.BoxGeometry(5,3,3.2),tan);muzzle.position.set(hx+c*3.8,y+13,hz_+sn*3.8);muzzle.rotation.y=-a;parts.push(muzzle);
      parts.push(blk(hx-c*0.4,y+14,hz_-sn*0.4,1.2,4,4.4,mane,-a));
      for(const w of [-1.2,1.2]){const [ex,ez]=P(12.5,w);parts.push(cone(ex,y+15,ez,0.6,2.2,tan,5));}
      // the paddock
      const [px,pz]=P(-2,22);for(let k=0;k<12;k++){const u=-12+k*2.4;for(const w of [-8,8]){const [fx,fz]=P(u-2,22+w);parts.push(blk(fx,gh(fx,fz),fz,0.3,1.4,0.3,M.wood));}}
      for(const w of [-8,8]){const [fx,fz]=P(-2,22+w);parts.push(blk(fx,y+1.1,fz,28,0.2,0.2,M.wood,-a));}}
    return build(L,parts);
  },

  // ================================================================ the Great Plateau
  // The Temple of Time, a broken church with its tower; a ruined wall along the plateau's rim with gates; the cave
  // of the Shrine of Resurrection; the old man's cabin
  plateau(L,x,z){
    const parts=[],T=S.temple_of_time,ty=gh(T.x,T.z);
    // the nave: walls with the tall windows open, one end fallen, buttresses, and the tower with its broken spire
    for(const s of [-1,1]){for(let k=0;k<6;k++){if(s>0&&k===4)continue;parts.push(blk(T.x-25+k*10,ty-1,T.z+s*12,9,20+(k%2)*3,2.4,M.stone));
        parts.push(blk(T.x-25+k*10+4.5,ty-1,T.z+s*13.6,2,14,2.4,M.stone2));}}
    parts.push(blk(T.x-31,ty-1,T.z,2.4,26,24,M.stone),blk(T.x+30,ty-1,T.z+5,2.4,12,10,M.stone2));
    parts.push(blk(T.x-40,ty-1,T.z,14,48,14,M.stone),cone(T.x-40,ty+47,T.z,10,12,M.slate,4),blk(T.x-40,ty+20,T.z-7.2,4,8,0.5,M.black));
    parts.push(cyl(T.x+18,ty,T.z,2.2,2,3,M.stone2),sph(T.x+18,ty+5.5,T.z,1.4,M.stone),blk(T.x+18,ty+3,T.z,2.2,4,1.4,M.stone));   // the goddess
    for(let k=0;k<20;k++)parts.push(blk(T.x-30+hz(k)*60,ty-0.5,T.z-25+hz(k+5)*50,2+hz(k+1)*3,1+hz(k+2)*2,2+hz(k+3)*3,M.stone2,hz(k+4)*3));
    // the wall round the rim of the plateau, with gaps where it has fallen and gates
    const P0=S.plateau;for(let k=0;k<64;k++){if(k%9===4||k%13===0)continue;const a=k/64*Math.PI*2,a2=(k+1)/64*Math.PI*2,r=640,rz=530;
      const ax=P0.x+Math.cos(a)*r,az=P0.z+Math.sin(a)*rz,bx=P0.x+Math.cos(a2)*r,bz=P0.z+Math.sin(a2)*rz,y=Math.min(gh(ax,az),gh(bx,bz));
      parts.push(blk((ax+bx)/2,y-2,(az+bz)/2,Math.hypot(bx-ax,bz-az)+1,9+hz(k)*4,3,M.stone2,-Math.atan2(bz-az,bx-ax)));
      if(k%8===0)parts.push(cyl(ax,y-2,az,4,3.6,16,M.stone));}
    // the Shrine of Resurrection: a doorway into the hillside, blue inside
    const R_=S.resurrection,ry=gh(R_.x,R_.z),blueGlow=glowM(0x4ad8ff,1.2);
    parts.push(sph(R_.x,ry,R_.z,16,M.rock2,1.2,0.6,1),blk(R_.x,ry,R_.z+12,8,8,4,M.sheikah),blk(R_.x,ry+0.5,R_.z+14.1,5,6,0.2,blueGlow));
    // the old man's cabin, with its chimney
    const O=S.oldman,oy=gh(O.x,O.z);parts.push(blk(O.x,oy,O.z,8,4,6,M.wood),blk(O.x,oy+4,O.z,9,0.6,7,M.thatch),blk(O.x+3,oy+4,O.z-2,1.2,3,1.2,M.stone2));
    {const r=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4),M.thatch);r.scale.set(7,3,5.5);r.position.set(O.x,oy+5.6,O.z);parts.push(r);}
    return build(L,parts);
  },

  // ================================================================ Kakariko Village
  // In its valley: Impa's house, big, under curved roofs; the gate; lanterns; the Great Fairy's bud
  kakariko(L,x,z){
    const K=S.kakariko,ky=gh(K.x,K.z),parts=[],lamp=glowM(0xffc070,1.2);
    const roof=(x0,y,z0,w,d,h,m)=>{const r=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4),m);r.scale.set(w*0.78,h,d*0.78);r.position.set(x0,y+h/2,z0);return r;};
    parts.push(blk(K.x,ky,K.z-30,26,7,18,M.wood),roof(K.x,ky+7,K.z-30,34,24,7,M.slate2),blk(K.x,ky+10,K.z-30,18,5,12,M.wood),roof(K.x,ky+15,K.z-30,24,17,6,M.slate2));
    parts.push(blk(K.x,ky,K.z-42,20,2,4,M.stone2));
    for(const s of [-1,1])parts.push(blk(K.x+s*8,ky,K.z+40,1.6,9,1.6,M.wood2));
    parts.push(blk(K.x,ky+8,K.z+40,22,1.4,2,M.wood2),blk(K.x,ky+9.4,K.z+40,25,0.8,2.6,M.slate2));
    for(let k=0;k<26;k++){const a=k/26*Math.PI*2,r=60+hz(k)*70,lx=K.x+Math.cos(a)*r,lz=K.z+Math.sin(a)*r,ly=gh(lx,lz);
      parts.push(blk(lx,ly,lz,0.3,2.4,0.3,M.wood2));const l=blk(lx,ly+2.4,lz,0.9,1.1,0.9,lamp);l.userData.noMerge=true;parts.push(l);}
    const F=[K.x+110,K.z-90],fy=gh(F[0],F[1]);parts.push(sph(F[0],fy+6,F[1],8,M.pink,1,1.3,1),sph(F[0],fy+2,F[1],10,M.leaf,1.3,0.4,1.3));
    return build(L,parts);
  },

  // ================================================================ Hateno, its laboratory, Fort Hateno
  hateno(L,x,z){
    const parts=[],T=S.techlab,ty=gh(T.x,T.z),blueFlame=glowM(0x4adfff,1.6);
    parts.push(blk(T.x,ty,T.z,14,7,10,M.plaster),blk(T.x,ty+7,T.z,15,0.6,11,M.slate2));
    {const r=new THREE.Mesh(new THREE.ConeGeometry(1,1,4).rotateY(Math.PI/4),M.slate2);r.scale.set(11,5,8);r.position.set(T.x,ty+9.8,T.z);parts.push(r);}
    parts.push(limb([T.x+3,ty+11,T.z],[T.x+12,ty+17,T.z-2],1.2,1.6,M.stone2),cyl(T.x-9,ty,T.z+6,0.5,0.5,5,M.stone2));
    const f=sph(T.x-9,ty+6,T.z+6,1.4,blueFlame,1,1.6,1);f.userData.noMerge=true;parts.push(f);
    // Fort Hateno: the long wall across the way in, and the Guardians that died against it
    const F=S.fort_hateno;for(let k=-8;k<=8;k++){const fx=F.x+k*12,fz=F.z+k*6,fy=gh(fx,fz);parts.push(blk(fx,fy-2,fz,13,12,5,M.stone2,-0.46));if(k%4===0)parts.push(cyl(fx,fy-2,fz,5,4.6,18,M.stone),cone(fx,fy+16,fz,5.5,6,M.slate2,8));}
    for(let k=0;k<9;k++)deadGuardian(parts,F.x-60+hz(k)*120-40,F.z+30+hz(k+3)*60,1,hz(k+7)*6);
    return build(L,parts);
  },

  // ================================================================ Rito Village
  // A pillar of rock standing out of a lake, a walkway spiralling up it, the Rito's huts under pointed roofs
  rito(L,x,z){
    const R_=S.rito,parts=[],lake=(PL.lakes||[]).find(l=>/Rito/.test(l.name)),base=lake?lake.level-4:gh(R_.x,R_.z),H=150;
    const rockA=mat(0xb0a28c),rockB=mat(0x9a8c78),deck=mat(0x9a7044),rail=mat(0x6a4a30);
    const cloth=[mat(0xd84a3a),mat(0x3a7ad8),mat(0xe8c040),mat(0x4aa060),mat(0xe07ab0)];
    // the pillar: pale rock in tapering drums, each a little off the last, ledges where they meet
    for(let k=0;k<6;k++){const r0=34-k*3.6,r1=r0-3.2,h=H/6,ox=Math.sin(k*1.7)*2.5,oz=Math.cos(k*2.3)*2.5;
      parts.push(mesh(new THREE.CylinderGeometry(r1,r0,h,11).translate(0,h/2,0),k%2?rockA:rockB,R_.x+ox,base+k*h,R_.z+oz));
      parts.push(cyl(R_.x+ox,base+k*h+h-1.2,R_.z+oz,r1+1.5,r1+1.5,1.6,rockB,11));}
    parts.push(sph(R_.x,base+H+2,R_.z,15,rockA,1,0.45,1));
    // the walkway, spiralling up the outside on brackets, with a rail
    for(let k=0;k<96;k++){const t=k/96,a=t*Math.PI*2*3.4,y=base+8+t*(H-6),r=(34-21*t)+5.5;
      const px=R_.x+Math.cos(a)*r,pz=R_.z+Math.sin(a)*r;parts.push(blk(px,y,pz,6.4,0.7,4.6,deck,-a));
      parts.push(blk(R_.x+Math.cos(a)*(r+2.6),y+0.7,R_.z+Math.sin(a)*(r+2.6),6.4,1.1,0.25,rail,-a));
      if(k%4===0)parts.push(limb([R_.x+Math.cos(a)*(r-2.5),y-4,R_.z+Math.sin(a)*(r-2.5)],[px,y,pz],0.35,0.35,rail,4));}
    // the platforms: broad round decks out from the rock at five heights, each with huts under bright pointed roofs
    for(let lv=0;lv<5;lv++){const t=(lv+0.5)/5,y=base+12+t*(H-20),a0=lv*1.9,r=(34-21*t)+12;
      for(let h=0;h<3;h++){const a=a0+h*0.9,px=R_.x+Math.cos(a)*r,pz=R_.z+Math.sin(a)*r;
        parts.push(cyl(px,y-0.8,pz,9,9,0.8,deck,10),limb([R_.x+Math.cos(a)*(r-8),y-7,R_.z+Math.sin(a)*(r-8)],[px,y-0.8,pz],0.7,0.7,rail,5));
        if(h!==1){parts.push(cyl(px,y,pz,4.6,4.6,4,deck,10),cone(px,y+4,pz,6.4,7,cloth[(lv+h)%cloth.length],10));}
        else parts.push(blk(px,y,pz,6,1,0.3,rail,-a));}}
    // the top: a wide deck and the elder's big hut
    parts.push(cyl(R_.x,base+H+6,R_.z,18,18,1,deck,14),cyl(R_.x,base+H+7,R_.z,7,7,5,deck,12),cone(R_.x,base+H+12,R_.z,10,10,cloth[0],12));
    if(lake)for(const a of [0.4,2.6]){const bx=R_.x+Math.cos(a)*36,bz=R_.z+Math.sin(a)*36,ex=R_.x+Math.cos(a)*170,ez=R_.z+Math.sin(a)*130;
      parts.push(blk((bx+ex)/2,lake.level+3,(bz+ez)/2,Math.hypot(ex-bx,ez-bz),1,5,deck,-Math.atan2(ez-bz,ex-bx)));}
    return build(L,parts);
  },

  // ================================================================ Zora's Domain
  // On its height by the reservoir: a round plaza of pale stone, the palace's tower in layered discs, glowing blue,
  // curved bridges
  zora(L,x,z){
    const Z=S.zora,zy=gh(Z.x,Z.z),parts=[],lum=glowM(0x9ae8ff,1.1);
    parts.push(cyl(Z.x,zy-2,Z.z,60,58,4,M.pale,24),cyl(Z.x,zy+2,Z.z,30,30,1.2,M.blue,24));
    for(let k=0;k<6;k++){const r=24-k*3.4,h=10;parts.push(cyl(Z.x,zy+2+k*h,Z.z,r,r*0.9,h,k%2?M.pale:M.blue,16));}
    parts.push(cone(Z.x,zy+62,Z.z,8,34,M.pale,12));
    const sp=mesh(new THREE.SphereGeometry(3.4,12,8),lum,Z.x,zy+98,Z.z);sp.userData.noMerge=true;parts.push(sp);
    for(let k=0;k<10;k++){const a=k/10*Math.PI*2,lx=Z.x+Math.cos(a)*55,lz=Z.z+Math.sin(a)*55;parts.push(cyl(lx,zy,lz,1.2,1,10,M.pale,6));const g=sph(lx,zy+11,lz,1.6,lum);g.userData.noMerge=true;parts.push(g);}
    for(const a of [0.3,2.2,4.1]){const pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector3(Z.x+Math.cos(a)*(60+t*90),zy+6+Math.sin(t*Math.PI)*14,Z.z+Math.sin(a)*(60+t*90)));}
      parts.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,2.4,5),M.pale));}
    return build(L,parts);
  },

  // ================================================================ Goron City, on Death Mountain
  goron(L,x,z){
    const G=S.goron,parts=[],lamp=glowM(0xff8a3a,1.3);
    for(let k=0;k<22;k++){const a=hz(k)*Math.PI*2,r=20+hz(k+4)*90,gx=G.x+Math.cos(a)*r,gz=G.z+Math.sin(a)*r,gy=gh(gx,gz);
      parts.push(sph(gx,gy+2,gz,6+hz(k+2)*4,M.rock2,1.1,0.7,1),blk(gx+5,gy,gz,2.2,3,0.3,M.black));
      if(k%2===0){const l=sph(gx,gy+8,gz,0.9,lamp);l.userData.noMerge=true;parts.push(l);}}
    for(let k=0;k<6;k++){const a=k*1.1,mx=G.x+Math.cos(a)*120,mz=G.z+Math.sin(a)*120;parts.push(blk(mx,gh(mx,mz),mz,3,2,2,M.wood2,a));}
    return build(L,parts);
  },

  // ================================================================ Gerudo Town
  // A walled town of sandstone in the desert, the palace in the middle, palms at the gate
  gerudo(L,x,z){
    const G=S.gerudo_town,gy=gh(G.x,G.z),parts=[];
    for(let k=0;k<32;k++){if(k===8)continue;const a=k/32*Math.PI*2,a2=(k+1)/32*Math.PI*2,r=160;
      const ax=G.x+Math.cos(a)*r,az=G.z+Math.sin(a)*r,bx=G.x+Math.cos(a2)*r,bz=G.z+Math.sin(a2)*r;parts.push(blk((ax+bx)/2,gh(ax,az)-2,(az+bz)/2,Math.hypot(bx-ax,bz-az)+1,16,4,M.sand2,-Math.atan2(bz-az,bx-ax)));
      if(k%4===0)parts.push(cyl(ax,gh(ax,az)-2,az,5,4.4,22,M.sand));}
    parts.push(blk(G.x,gy,G.z,40,18,30,M.sand),blk(G.x,gy+18,G.z,26,10,20,M.sand2),sph(G.x,gy+30,G.z,9,M.gold,1,0.8,1));
    for(let k=0;k<10;k++){const px=G.x+Math.cos(1.57)*180+(k-5)*8,pz=G.z+Math.sin(1.57)*180+hz(k)*20,py=gh(px,pz);
      parts.push(limb([px,py,pz],[px+1.5,py+10,pz],0.4,0.3,M.trunk,5));for(let f=0;f<5;f++){const a=f/5*Math.PI*2;parts.push(limb([px+1.5,py+10,pz],[px+1.5+Math.cos(a)*4,py+8.5,pz+Math.sin(a)*4],0.5,0.1,M.leaf,4));}}
    return build(L,parts);
  },

  // ================================================================ Lurelin, on the coast
  lurelin(L,x,z){
    const V=S.lurelin,parts=[];
    for(let k=0;k<14;k++){const a=hz(k)*Math.PI*2,r=30+hz(k+1)*80,px=V.x+Math.cos(a)*r,pz=V.z+Math.sin(a)*r,py=gh(px,pz);
      parts.push(limb([px,py,pz],[px+1.5,py+11,pz+0.5],0.4,0.3,M.trunk,5));for(let f=0;f<5;f++){const b=f/5*Math.PI*2;parts.push(limb([px+1.5,py+11,pz+0.5],[px+1.5+Math.cos(b)*4.4,py+9.5,pz+0.5+Math.sin(b)*4.4],0.5,0.1,M.leaf2,4));}}
    return build(L,parts);
  },

  // ================================================================ the Great Deku Tree, and the Master Sword
  korok(L,x,z){
    const K=S.korok,ky=gh(K.x,K.z),parts=[],swordGlow=glowM(0x9ad8ff,1.4);
    parts.push(cyl(K.x,ky-2,K.z,26,16,70,M.trunk,12));
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;parts.push(limb([K.x+Math.cos(a)*14,ky+8,K.z+Math.sin(a)*14],[K.x+Math.cos(a)*34,ky-2,K.z+Math.sin(a)*34],6,3,M.trunk,6));}
    for(let k=0;k<9;k++){const a=k/9*Math.PI*2;parts.push(sph(K.x+Math.cos(a)*30,ky+78+hz(k)*12,K.z+Math.sin(a)*30,22,k%2?M.leaf:M.leaf2,1,0.7,1));}
    parts.push(sph(K.x,ky+96,K.z,30,M.leaf,1,0.7,1));
    parts.push(blk(K.x+8,ky+30,K.z+20,2,2,1,M.black),blk(K.x-8,ky+30,K.z+20,2,2,1,M.black),blk(K.x,ky+22,K.z+21,5,1.4,1,M.black));   // the face in the bark
    const S2=[K.x,K.z+60],sy=gh(S2[0],S2[1]);parts.push(cyl(S2[0],sy,S2[1],2.2,2.2,0.8,M.stone2,8),blk(S2[0],sy+0.8,S2[1],0.3,2.6,0.1,M.pale),blk(S2[0],sy+3.4,S2[1],1.2,0.3,0.3,M.blue));
    const sw=sph(S2[0],sy+2,S2[1],1.6,swordGlow,1,1.6,1);sw.userData.noMerge=true;parts.push(sw);
    return build(L,parts);
  },

  // ================================================================ the Lomei Labyrinths
  // A square maze of dark walls, walked out by a seeded depth-first search
  lomei(L,x,z){
    const parts=[],dark=mat(0x3a3836);
    for(const key of ['lomei_north','lomei_south','lomei_island']){const C=S[key];if(!C)continue;
      const N=13,cs=9,y=Math.max(gh(C.x,C.z),1.2),seen=new Set(),walls=new Set();let seed=Math.floor(C.x*7+C.z*3);const rnd=()=>{seed=(seed*16807)%2147483647;return (seed&0xffff)/0x10000;};
      for(let i=0;i<=N;i++)for(let j=0;j<N;j++){walls.add('v'+i+','+j);walls.add('h'+j+','+i);}
      const stack=[[0,0]];seen.add('0,0');
      while(stack.length){const [i,j]=stack[stack.length-1],nb=[[i+1,j,'v'+(i+1)+','+j],[i-1,j,'v'+i+','+j],[i,j+1,'h'+i+','+(j+1)],[i,j-1,'h'+i+','+j]].filter(([a,b])=>a>=0&&b>=0&&a<N&&b<N&&!seen.has(a+','+b));
        if(!nb.length){stack.pop();continue;}const [a,b,w]=nb[Math.floor(rnd()*nb.length)];walls.delete(w);seen.add(a+','+b);stack.push([a,b]);}
      walls.delete('v0,'+Math.floor(N/2));walls.delete('v'+N+','+Math.floor(N/2));
      const o=-N*cs/2;for(const w of walls){const [i,j]=w.slice(1).split(',').map(Number);
        if(w[0]==='v')parts.push(blk(C.x+o+i*cs,y,C.z+o+j*cs+cs/2,1.4,7,cs+1.4,dark));else parts.push(blk(C.x+o+i*cs+cs/2,y,C.z+o+j*cs,cs+1.4,7,1.4,dark));}}
    return build(L,parts);
  },

  // ================================================================ Akkala: the citadel's ruins, the spiral, Tarrey Town
  akkala(L,x,z){
    const parts=[],A=S.akkala_citadel,ay=gh(A.x,A.z);
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2,r=70;const tx=A.x+Math.cos(a)*r,tz=A.z+Math.sin(a)*r*0.8,ty=gh(tx,tz);
      parts.push(blk(tx,ty-1,tz,30,10+hz(k)*12,5,M.stone2,-a-Math.PI/2));if(k%3===0)parts.push(cyl(tx,ty-1,tz,6,5.4,18+hz(k+1)*16,M.stone));}
    parts.push(blk(A.x,ay,A.z,30,24,26,M.stone2),blk(A.x+6,ay+24,A.z,12,10,12,M.stone3));
    for(let k=0;k<6;k++)deadGuardian(parts,A.x-60+hz(k)*120,A.z+60+hz(k+2)*50,1,hz(k+9)*6);
    // the spiral: a curl of rock out in the sea, as on the map
    const Sp=S.spiral;for(let k=0;k<90;k++){const t=k/90,a=t*Math.PI*2*2.6,r=10+t*95,sx=Sp.x+Math.cos(a)*r,sz=Sp.z+Math.sin(a)*r;
      parts.push(blk(sx,-4,sz,10,10-t*3,8,M.rock,-a));}
    return build(L,parts);
  },

  // ================================================================ Hylia Bridge, over Lake Hylia
  bridge(L,x,z){
    const B=S.hylia_bridge,lake=(PL.lakes||[]).find(l=>/Hylia/.test(l.name)),lv=lake?lake.level:12,parts=[];
    const a0=[B.x-20,B.z-360],a1=[B.x+40,B.z+360],dx=a1[0]-a0[0],dz=a1[1]-a0[1],Lg=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
    parts.push(blk((a0[0]+a1[0])/2,lv+14,(a0[1]+a1[1])/2,Lg,2.5,12,M.stone,yaw));
    for(let k=0;k<=14;k++){const t=k/14,px=a0[0]+dx*t,pz=a0[1]+dz*t;parts.push(blk(px,lv-4,pz,4,18,10,M.stone2,yaw));}
    const nx=-dz/Lg,nz=dx/Lg;   // across the deck
    for(const s of [-1,1])parts.push(blk((a0[0]+a1[0])/2+nx*s*5.8,lv+16.5,(a0[1]+a1[1])/2+nz*s*5.8,Lg,1.4,0.6,M.stone2,yaw));
    return build(L,parts);
  },

  // ================================================================ the Tabantha Great Bridge, over the canyon
  tabantha(L,x,z){
    const B=S.tabantha_bridge,parts=[],u=[0.707,0.707],half=170;   // across the canyon, which runs north-east
    const a0=[B.x-u[0]*half,B.z-u[1]*half],a1=[B.x+u[0]*half,B.z+u[1]*half],y=Math.max(gh(...a0),gh(...a1))+2,yaw=-Math.atan2(a1[1]-a0[1],a1[0]-a0[0]);
    parts.push(blk(B.x,y-1,B.z,half*2,1.6,8,M.wood,yaw));
    for(const s_ of [-1,1]){const nx=-u[1]*s_*4,nz=u[0]*s_*4;parts.push(blk(B.x+nx,y+0.6,B.z+nz,half*2,1.2,0.3,M.wood2,yaw));
      for(let k=0;k<=12;k++){const t=k/12,px=a0[0]+(a1[0]-a0[0])*t+nx,pz=a0[1]+(a1[1]-a0[1])*t+nz,gy=gh(px,pz);
        if(y-gy>6)parts.push(limb([px,gy,pz],[px,y-1,pz],1.2,0.9,M.wood2,6));}}
    for(const e of [a0,a1])parts.push(blk(e[0],gh(...e),e[1],10,y-gh(...e)+6,10,M.stone2,yaw));
    return build(L,parts);
  },

  // ================================================================ waterfalls
  // Wherever a river comes down off high ground in a short way - off Zora's Domain, out of the hills - a fall of
  // water, white, with mist at its foot. Found from the rivers' own levels, so they are where the land puts them.
  falls(L,x,z){
    const parts=[],sheetM=new THREE.MeshLambertMaterial({color:0xeaf6ff,transparent:true,opacity:0.85,side:THREE.DoubleSide,emissive:0x203038});
    const found=[];
    for(const Rv of (PL.rivers||[])){for(let k=0;k+1<Rv.pts.length;k++){const [ax,az,ay]=Rv.pts[k],[bx,bz,by]=Rv.pts[k+1],L_=Math.hypot(bx-ax,bz-az),drop=ay-by;
        if(drop>25&&drop/L_>0.06)found.push({ax,az,ay,bx,bz,by,w:Rv.width*0.9});}}
    for(const f of found){const mx=(f.ax+f.bx)/2,mz=(f.az+f.bz)/2,top=Math.max(f.ay,gh(f.ax,f.az)),bot=Math.min(f.by,gh(f.bx,f.bz)),yaw=-Math.atan2(f.bz-f.az,f.bx-f.ax)+Math.PI/2;
      const sh=new THREE.Mesh(new THREE.PlaneGeometry(f.w,top-bot+4).translate(0,(top-bot)/2,0),sheetM);sh.position.set(mx,bot,mz);sh.rotation.y=yaw;sh.rotation.x=-0.25;sh.userData.noMerge=true;parts.push(sh);
      parts.push(sph(f.bx,bot+2,f.bz,f.w*0.5,M.white,1,0.25,1));}
    ctx.falls=found;
    return build(L,parts);
  },

  // ================================================================ the Guardians that fell in the fields
  guardians(L,x,z){
    const parts=[],C=S.castle;
    for(let k=0;k<34;k++){const a=hz(k*2.2)*Math.PI*2,r=520+hz(k*3.9)*1600,gx=C.x+Math.cos(a)*r,gz=C.z+300+Math.sin(a)*r*0.8;
      if(gh(gx,gz)<3)continue;deadGuardian(parts,gx,gz,1,hz(k)*6);}
    return build(L,parts);
  },
  };
}
