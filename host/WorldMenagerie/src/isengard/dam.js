// ---------- Saruman's dam ----------
// Fan work from Tolkien.
//
// Above the Ring the Isen is held back behind a wall of stone across its glen, and the reservoir stands in the
// basin behind it: water for the furnaces and the wheels, let down through sluices in the face of the dam. When
// the Ents come they break it, and the whole of the water goes down the glen into the Ring (events.js).
//
// A gravity dam: its upstream face straight, its downstream face in steps, its ends built into the rock shoulders
// the generator leaves either side. It is built in seventeen lengths so that the middle three can be broken -
// swapped for their stumps and the rubble of them - and its water is a sheet at the reservoir's level that the
// ground hides wherever the banks stand higher, so draining it is lowering one number. In the Treegarth it is as
// the Ents left it: broken, and the basin empty.
import { mkRng } from '../core/rng.js';
import { createDust } from '../core/dust.js';
import { DAM } from './plan.js';

export function dam(api){
  const {THREE,ctx,scene,animHooks,groundH,mergeParts}=api;
  const R=mkRng(1702),D=DAM,parts=[],x0=D.x,z0=D.z;
  const stone=new THREE.MeshPhongMaterial({color:0x4d4943,specular:0x1c1c1c,shininess:10,flatShading:true});
  const dress=new THREE.MeshPhongMaterial({color:0x5f5a52,specular:0x222222,shininess:12,flatShading:true});
  const iron=new THREE.MeshPhongMaterial({color:0x2b2b2e,specular:0x6a6e76,shininess:40,flatShading:true});
  const box=(x,y,z,w,h,d,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(x,y,z);return b;};
  // the profile across the dam (z from the upstream face, y up), stepped down the downstream side
  const up=-7,top=D.crest,base=D.base,prof=[[up,base],[up,top+1.5],[5,top+1.5]];
  for(let k=0;k<7;k++){const zz=5+k*4.2,yy=top-5-k*8;prof.push([zz,yy+5],[zz,yy]);}prof.push([36,base]);
  const shape=new THREE.Shape();prof.forEach(([zz,yy],i)=>i?shape.lineTo(zz,yy-base):shape.moveTo(zz,yy-base));
  const N=17,L=D.span/N;
  const lengths=[];
  for(let i=0;i<N;i++){const xa=x0-D.span/2+i*L,g=new THREE.ExtrudeGeometry(shape,{depth:L+0.05,bevelEnabled:false});
    // extruded along +z; turn it so the length runs along x and the profile across z
    // turned this way; the other way round mirrors the profile and puts the steps on the water side
    g.rotateY(-Math.PI/2);g.translate(xa+L,base,z0);const m=new THREE.Mesh(g,stone);m.castShadow=m.receiveShadow=true;
    const mid=Math.abs(xa+L/2-x0)<L*1.6;lengths.push({m,mid,xa});scene.add(m);}
  // the crest: a road with a parapet both sides; the sluice towers on the water side; the machine-house in the
  // middle, with the great iron wheels that raise the gates
  for(const zz of [up+0.6,4.4]){for(let x=x0-D.span/2;x<x0+D.span/2;x+=4)parts.push(box(x+2,top+1.5,z0+zz,3.4,1.4,0.9,dress));}
  const towersX=[-150,-60,60,150];
  for(const tx of towersX){parts.push(box(x0+tx,base,z0+up-6,12,top+10-base,10,dress));parts.push(box(x0+tx,top+10,z0+up-6,14,1.2,12,stone));
    for(let k=0;k<4;k++)parts.push(box(x0+tx-5.5+k*3.6,top+11.2,z0+up-6-5.4,1.4,1.6,1.2,dress));}
  parts.push(box(x0,top+1.5,z0-1,26,9,11,dress));parts.push(box(x0,top+10.5,z0-1,28,1.4,13,stone));
  const wheels=[];for(const sd of [-1,1]){const w=new THREE.Mesh(new THREE.TorusGeometry(4,0.45,6,18),iron);w.position.set(x0+sd*17,top+6,z0-1);w.rotation.y=Math.PI/2;scene.add(w);
    for(let k=0;k<6;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(0.3,7.6,0.3),iron);sp.rotation.z=k/6*Math.PI;w.add(sp);}wheels.push(w);}
  // the sluices: three iron-framed mouths low on the downstream face, water spouting from them into a pool
  // on the face itself: at this height the stepped face stands about twenty metres out from the crest
  const sluices=[-55,0,55].map(sx=>{const y=base+26;parts.push(box(x0+sx,y-4,z0+19.5,9,8,2,iron));return [x0+sx,y,z0+21];});
  for(const [mat,list] of (()=>{const m=new Map();for(const p of parts){let a=m.get(p.material);if(!a){a=[];m.set(p.material,a);}a.push(p);}return m;})()){const mm=mergeParts(list,mat);mm.castShadow=mm.receiveShadow=true;scene.add(mm);}

  // ---- broken: the stumps of the middle, and the rubble thrown down the glen ----
  const broken=new THREE.Group();
  for(const q of lengths)if(q.mid){for(let k=0;k<5;k++){const h=6+R()*26,w=L/5;broken.add(box(q.xa+k*w+w/2,base,z0+10+R()*8,w*0.9,h,24+R()*8,stone));}}
  const rock=new THREE.MeshLambertMaterial({color:0x55504a,flatShading:true});
  for(let k=0;k<90;k++){const x=x0+(R()-0.5)*150,z=z0+40+R()*260,sz=1.5+R()*5;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(sz,0),rock);m.position.set(x,groundH(x,z)+sz*0.3,z);m.rotation.set(R()*3,R()*3,R()*3);broken.add(m);}
  broken.visible=false;scene.add(broken);

  // ---- the reservoir ----
  const [za,zb]=D.resZ;
  const water=new THREE.Mesh(new THREE.PlaneGeometry(D.resW,zb-za,24,16).rotateX(-Math.PI/2),
    new THREE.MeshPhongMaterial({color:0x3c5566,specular:0xb8ccd8,shininess:70,transparent:true,opacity:0.92}));
  water.position.set(x0,D.level,(za+zb)/2);water.receiveShadow=true;scene.add(water);
  const foam=createDust(api,{max:9000,size:2.2,color:0xe8eef0,drag:1.2,gravity:6,wind:[0,0,1]});
  const mist=createDust(api,{max:3000,size:16,color:0xd8e0e4,drag:0.6,gravity:-0.4,wind:[1,0,1]});
  let level=D.level,isBroken=false,draining=false;
  const set=b=>{isBroken=b;for(const q of lengths)if(q.mid)q.m.visible=!b;broken.visible=b;};
  animHooks.push(now=>{const t=now/1000;
    for(const w of wheels)w.rotation.x=isBroken?0:t*0.4;
    if(draining){level=Math.max(D.bed-3,level-0.9*(1/60));if(level<=D.bed-3)draining=false;}
    water.position.y=level;water.visible=level>D.bed-2;
    // the sluices spouting, while there is water behind them and the dam is whole
    if(!isBroken&&level>D.level-2&&ctx.war!==false)for(const [sx,sy,sz] of sluices){for(let k=0;k<8;k++)foam.emit(sx+(Math.random()-0.5)*5,sy+(Math.random()-0.5)*2,sz,(Math.random()-0.5)*1.5,1+Math.random(),7+Math.random()*3,2.2,1.6+Math.random()*1.4);
      if(Math.random()<0.3)mist.emit(sx,groundH(sx,sz+30)+3,sz+30,(Math.random()-0.5)*3,1,(Math.random()-0.5)*3,5,14);}
    // the breach, while the reservoir runs out through it
    if(isBroken&&draining)for(let k=0;k<30;k++){const x=x0+(Math.random()-0.5)*90;foam.emit(x,level-1,z0+6,(Math.random()-0.5)*4,-2,14+Math.random()*10,2.5,7);
      if(Math.random()<0.4)mist.emit(x,base+20+Math.random()*20,z0+50+Math.random()*60,(Math.random()-0.5)*4,3,6,6,22);}});
  ctx.dam={x:x0,z:z0,crest:top,base,get level(){return level;},get broken(){return isBroken;},
    breakIt(){if(isBroken)return false;set(true);draining=true;return true;},
    mend(){set(false);draining=false;level=D.level;}};
  // the Treegarth has it broken and empty; Saruman's Isengard has it whole and full
  (ctx.onWar=ctx.onWar||[]).push(on=>{if(on)ctx.dam.mend();else{set(true);draining=false;level=D.bed-3;}});
  ctx.details=Object.assign(ctx.details||{},{dam:'crest '+top+' m, reservoir at '+D.level+' m'});
}
