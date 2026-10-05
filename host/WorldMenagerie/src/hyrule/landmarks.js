// What is built in Hyrule. Fan work: The Legend of Zelda: Breath of the Wild belongs to Nintendo; every shape here
// is this project's own low-poly geometry and nothing from the game is used.
//
// The plan (data/cities/hyrule-plan.json, from tools/make-hyrule.py) says where each thing stands; the landmarks in
// the city file say what each is called. Here: the fifteen Sheikah towers; Rito Village on its pillar of rock; the
// Great Deku Tree and the Master Sword; the Lomei Labyrinths; the Akkala Citadel and its spiral; Hylia Bridge and the
// Tabantha Great Bridge; the waterfalls; the decayed Guardians lying in the fields. Elsewhere: Hyrule Castle, Castle
// Town and the Great Plateau (castle.js); Kakariko, Hateno, Lurelin, Tarrey Town (villages.js); Zora's Domain, Goron
// City, Gerudo Town (peoples.js); the shrines and stables (wayside.js); the Divine Beasts (divine.js); Calamity Ganon
// and Death Mountain's fire (beasts.js). The shared solids and roofs are kit.js.

import { guardianKit } from './guardian.js';
import { kit } from './kit.js';

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
  const KT=kit(api),windows=KT.windows,lathe_=(prof,m,x,y,z)=>KT.lathe(prof,m,x,y,z,16);
  function deadGuardian(parts,x,z,s,yaw){GK.fallen(parts,x,gh(x,z),z,yaw||0,Math.floor(Math.abs(x*7.3+z*3.1))%997);}

  return {
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
    // the spire: the rock goes on up past the village, slender and leaning, to an anvil of rock overhanging the
    // lake - the shape the village is known by from far off
    {let sx=R_.x+9,sz=R_.z-4,sy=base+H-4;const n=9;
      for(let k=0;k<n;k++){const t=k/n,r0=10-t*4.4,r1=10-(t+1/n)*4.4,h=14,ox=Math.sin(k*0.9)*2.2+t*3,oz=Math.cos(k*1.3)*1.6;
        parts.push(mesh(new THREE.CylinderGeometry(r1,r0,h,9).translate(0,h/2,0),k%2?rockA:rockB,sx+ox,sy+k*h,sz+oz));}
      const ty=sy+n*14,tx=sx+Math.sin(n*0.9)*2.2+3;parts.push(sph(tx+8,ty+3,sz,1,rockA,22,6.5,10),sph(tx+18,ty+4.5,sz+1,1,rockB,12,4.5,7));}
    // the top: a wide deck and the elder's big hut
    parts.push(cyl(R_.x,base+H+6,R_.z,18,18,1,deck,14),cyl(R_.x,base+H+7,R_.z,7,7,5,deck,12),cone(R_.x,base+H+12,R_.z,10,10,cloth[0],12));
    if(lake)for(const a of [0.4,2.6]){const bx=R_.x+Math.cos(a)*36,bz=R_.z+Math.sin(a)*36,ex=R_.x+Math.cos(a)*170,ez=R_.z+Math.sin(a)*130;
      parts.push(blk((bx+ex)/2,lake.level+3,(bz+ez)/2,Math.hypot(ex-bx,ez-bz),1,5,deck,-Math.atan2(ez-bz,ex-bx)));}
    return build(L,parts);
  },

  // ================================================================ the Great Deku Tree, and the Master Sword
  // A vast old tree in the middle of the forest: a flared trunk on a spread of roots, a face in the bark under heavy
  // brows with a beard of moss, thick limbs holding up a broad dome of leaves; before him, in the clearing, the
  // Master Sword in its pedestal on a round stone dais
  korok(L,x,z){
    const K=S.korok,ky=gh(K.x,K.z)-1,parts=[],swordGlow=glowM(0x9ad8ff,1.4),bark=mat(0x5e4a36),bark2=mat(0x4a3a2a);
    const leafs=[M.leaf,M.leaf2,mat(0x6a9a46),mat(0x3e6a2e)];
    parts.push(mesh(new THREE.LatheGeometry([[36,0],[27,6],[20,15],[17,32],[16,52],[19,66],[24,74],[0.1,76]].map(([r,h])=>new THREE.Vector2(r,h)),18),bark,K.x,ky,K.z));
    for(let k=0;k<11;k++){const a=k/11*Math.PI*2+0.2,r1=34+hz(k)*10;
      parts.push(limb([K.x+Math.cos(a)*16,ky+12,K.z+Math.sin(a)*16],[K.x+Math.cos(a)*30,ky+2,K.z+Math.sin(a)*30],6.5,4.5,bark2,7),
        limb([K.x+Math.cos(a)*30,ky+2,K.z+Math.sin(a)*30],[K.x+Math.cos(a+0.12)*r1*1.5,ky-3,K.z+Math.sin(a+0.12)*r1*1.5],4.5,1.6,bark2,6));}
    // the limbs, and the dome of leaves they hold up
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.4,ex=K.x+Math.cos(a)*(40+hz(k+3)*14),ez=K.z+Math.sin(a)*(40+hz(k+3)*14),ey=ky+88+hz(k+5)*12;
      parts.push(limb([K.x+Math.cos(a)*12,ky+64,K.z+Math.sin(a)*12],[ex,ey,ez],6,2.6,bark,7));
      parts.push(sph(ex,ey+6,ez,18+hz(k+7)*6,leafs[k%4],1.15,0.7,1.15));}
    for(let k=0;k<14;k++){const a=k/14*Math.PI*2,r=18+hz(k+20)*30;parts.push(sph(K.x+Math.cos(a)*r,ky+100+hz(k+30)*16,K.z+Math.sin(a)*r,16+hz(k+40)*8,leafs[(k+1)%4],1.1,0.75,1.1));}
    parts.push(sph(K.x,ky+114,K.z,30,M.leaf,1.25,0.6,1.25));
    // the face, toward the clearing (+z): brows, hollow eyes, a nose, the mouth, the beard of moss hanging below
    const fz=K.z+16.4;for(const s of [-1,1]){parts.push(limb([K.x+s*2,ky+40,fz+1.5],[K.x+s*11,ky+44,fz-1],2.2,1.4,bark2,6),sph(K.x+s*6.4,ky+36,fz,2.6,M.black,1,0.7,0.5));}
    parts.push(sph(K.x,ky+31,fz+1.4,2.6,bark,0.8,1.3,1),blk(K.x,ky+24,fz+0.6,9,1.2,1.2,M.black));
    for(let k=0;k<7;k++){const u=(k-3)*2.6;parts.push(sph(K.x+u,ky+18-Math.abs(u)*0.4,fz+0.8,2.6+hz(k)*1.2,M.moss,0.8,2.2,0.7));}
    // the Master Sword in the clearing: the dais, the pedestal, the blade, the guard's wings, the grip
    const Sx=K.x,Sz=K.z+60,sy=gh(Sx,Sz);
    parts.push(lathe_([[7,0],[7,0.6],[5.6,0.6],[5.6,1.2],[4.2,1.2],[4.2,1.8],[0.1,1.8]],M.stone2,Sx,sy-0.3,Sz),blk(Sx,sy+1.5,Sz,1.6,0.9,1.2,M.stone));
    parts.push(blk(Sx,sy+2.4,Sz,0.24,2.4,0.08,M.white),blk(Sx,sy+4.8,Sz,0.1,1.2,0.1,M.blue),blk(Sx,sy+4.8,Sz,1.6,0.22,0.22,M.blue));
    for(const s of [-1,1]){const w=mesh(new THREE.BoxGeometry(0.7,0.5,0.12),M.blue,Sx+s*0.95,sy+5,Sz);w.rotation.z=s*0.5;parts.push(w);}
    parts.push(sph(Sx,sy+6.1,Sz,0.22,M.gold));
    const sw=sph(Sx,sy+3.6,Sz,1.4,swordGlow,1,2.2,1);sw.userData.noMerge=true;parts.push(sw);
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
    const parts=[],A=S.akkala_citadel,ay=gh(A.x,A.z)-0.5;
    // the citadel: an outer wall of eight lengths with gaps where it fell, round towers at its turns (their tops
    // broken off), the gatehouse; the keep, square, its top broken into steps; the hall against it, roofless; the
    // tall round watchtower, broken; rubble, and the Guardians that took it
    const ring=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.2,r=88+hz(k+1)*16;ring.push([A.x+Math.cos(a)*r,A.z+Math.sin(a)*r*0.85]);}
    for(let k=0;k<8;k++){const a=ring[k],b=ring[(k+1)%8],L_=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]);
      for(let i=0;i<6;i++){if(hz(k*7+i)<0.18)continue;const t0=i/6,t1=(i+1)/6,h=10+hz(k*3+i)*10,mx=a[0]+(b[0]-a[0])*(t0+t1)/2,mz=a[1]+(b[1]-a[1])*(t0+t1)/2;
        parts.push(blk(mx,gh(mx,mz)-2,mz,L_/6+0.6,h,5,M.stone2,yaw));if(hz(k+i*5)<0.6)parts.push(blk(mx,gh(mx,mz)-2+h,mz,1.8,1.6,5.2,M.stone2,yaw));}
      const th=18+hz(k+9)*16;parts.push(cyl(a[0],gh(...a)-2,a[1],7,6.4,th,M.stone,12));
      for(let i=0;i<5;i++){const b2=i/5*Math.PI*2;parts.push(blk(a[0]+Math.cos(b2)*5.6,gh(...a)-2+th,a[1]+Math.sin(b2)*5.6,2,1+hz(k+i)*3,2,M.stone,-b2));}}
    // the keep, the hall, the watchtower
    parts.push(blk(A.x,ay,A.z,34,34,34,M.stone2));
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){const h=hz(i*4+j+50)*14;if(h>2)parts.push(blk(A.x-12.75+i*8.5,ay+34,A.z-12.75+j*8.5,8.5,h,8.5,M.stone2));}
    for(const s of [-1,1]){windows(parts,[A.x-14,A.z+s*17.1],[A.x+14,A.z+s*17.1],ay+12,4,2,5,0);windows(parts,[A.x+s*17.1,A.z-14],[A.x+s*17.1,A.z+14],ay+22,4,2,4,0);}
    for(const s of [-1,1])parts.push(blk(A.x+40,ay,A.z+s*11,46,16+hz(s+3)*6,2.4,M.stone,0));
    parts.push(blk(A.x+63,ay,A.z,2.4,18,22,M.stone,0));
    parts.push(cyl(A.x-30,ay,A.z-34,8,7,56,M.stone,14));for(let i=0;i<6;i++){const b2=i/6*Math.PI*2;parts.push(blk(A.x-30+Math.cos(b2)*6.4,ay+56,A.z-34+Math.sin(b2)*6.4,2.4,1+hz(i+70)*5,2.4,M.stone,-b2));}
    for(let k=0;k<40;k++){const rx=A.x+(hz(k+100)-0.5)*170,rz=A.z+(hz(k+200)-0.5)*150;parts.push(blk(rx,gh(rx,rz)-0.5,rz,2+hz(k+300)*4,1+hz(k+400)*2.4,2+hz(k+500)*4,hz(k)<0.5?M.stone2:M.stone,hz(k+600)*3));}
    for(let k=0;k<9;k++)deadGuardian(parts,A.x-80+hz(k)*160,A.z-70+hz(k+2)*140,1,hz(k+9)*6);
    // the spiral: a curl of rock out in the sea, as on the map
    const Sp=S.spiral;for(let k=0;k<90;k++){const t=k/90,a=t*Math.PI*2*2.6,r=10+t*95,sx=Sp.x+Math.cos(a)*r,sz=Sp.z+Math.sin(a)*r;
      parts.push(blk(sx,-4,sz,10,10-t*3,8,M.rock,-a));}
    return build(L,parts);
  },

  // ================================================================ Hylia Bridge, over Lake Hylia
  bridge(L,x,z){
    const B=S.hylia_bridge,lake=(PL.lakes||[]).find(l=>/Hylia/.test(l.name)),lv=lake?lake.level:12,parts=[];
    const a0=[B.x-120,B.z-340],a1=[B.x+120,B.z+340],dx=a1[0]-a0[0],dz=a1[1]-a0[1],Lg=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
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
