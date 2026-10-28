// ---------- Lake Atitlán: obra gris, the houses that are never finished ----------
// A house round the lake is built a floor at a time, as the money comes: a concrete frame filled with block, a flat
// slab roof, and the columns' rebar left standing out of the roof for the next floor, rusting, sometimes with a
// plastic bottle on each bar against the rain. On the roof the black water tank (the tinaco), a washing line, a
// satellite dish. C.obraGris: on the flat roofs (the engine gave no gable) of footprints under `maxH`, in `zones`
// ([lat, lon, radius]): `rebar` a share with the bars at the corners and along the walls every `every` m, half of
// them with column stubs; `tanks` a share with a tinaco on its stand; `lines` a share with a washing line hung with
// clothes. Instanced, built per 400 m tile as the camera comes within `near`; none of it in the fingerprint.
import {hash3} from '../core/rng.js';

export function obragris(api){
  const {THREE,C,scene,FOOTPRINTS,P,animHooks,camera,groundH}=api;const K=C.obraGris;if(!K||!FOOTPRINTS)return;
  const TILE=400,NEAR=K.near||600,EVERY=K.every||3.6,MAXH=K.maxH||13;
  const ZONES=(K.zones||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];}),inZone=(x,z)=>!ZONES.length||ZONES.some(([zx,zz,r])=>(x-zx)**2+(z-zz)**2<r*r);
  const tiles=new Map();
  for(const f of FOOTPRINTS){if(f.gable||!f.ring||f.ring.length<3)continue;const H=f.h-f.g;if(H>MAXH||H<2.5)continue;
    let cx=0,cz=0;for(const [x,z] of f.ring){cx+=x;cz+=z;}cx/=f.ring.length;cz/=f.ring.length;if(!inZone(cx,cz))continue;
    const k=Math.floor(cx/TILE)+','+Math.floor(cz/TILE);if(!tiles.has(k))tiles.set(k,{cx:(Math.floor(cx/TILE)+0.5)*TILE,cz:(Math.floor(cz/TILE)+0.5)*TILE,list:[],g:null});tiles.get(k).list.push([f,cx,cz]);}
  const BAR=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),TANK=new THREE.CylinderGeometry(0.6,0.55,1.25,12).translate(0,0.62,0),CLOTH=new THREE.PlaneGeometry(1,1).translate(0,-0.5,0);
  const mat=new THREE.MeshLambertMaterial({color:0xffffff}),cmat=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  const RUST=new THREE.Color('#6a3a24'),CONC=new THREE.Color('#9a968e'),BLACK=new THREE.Color('#1e1e20'),STAND=new THREE.Color('#5a5a5c'),LINE=new THREE.Color('#d8d8d0'),
    CLOTHES=['#c83a3a','#2a4ab8','#e8e2d6','#3a8a5a','#d8a02a','#7a3a8a','#1fa0b0','#e86a8a'].map(c=>new THREE.Color(c));
  const o=new THREE.Object3D();let nBars=0,nTanks=0,nLines=0;
  function build(T){const B=[],TK=[],CL=[];   // [x,y,z,sx,sy,sz,ry,colour]
    for(const [f,cx,cz] of T.list){const r=f.ring,top=f.h,h1=hash3(cx,cz,61),h2=hash3(cx,cz,62),h3=hash3(cx,cz,63);
      if(h1<(K.rebar===undefined?0.45:K.rebar)){nBars++;const stubs=h2<0.5;
        for(let i=0;i<r.length;i++){const [ax,az]=r[i],[bx,bz]=r[(i+1)%r.length],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/EVERY));
          for(let k=0;k<n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n,ix=x+(cx-x)*0.25/Math.max(1,Math.hypot(cx-x,cz-z))*1,iz=z+(cz-z)*0.25/Math.max(1,Math.hypot(cx-x,cz-z));
            const sh=stubs&&hash3(x,z,64)<0.6?0.4+hash3(x,z,65)*0.9:0;if(sh)B.push([ix,top,iz,0.3,sh,0.3,0,CONC]);
            for(const [dx,dz] of [[-0.08,-0.08],[0.08,-0.08],[-0.08,0.08],[0.08,0.08]])B.push([ix+dx,top+sh,iz+dz,0.025,0.6+hash3(x+dx,z,66)*0.7,0.025,0,RUST]);}}}
      if(h2>1-(K.tanks===undefined?0.5:K.tanks)){nTanks++;const a=hash3(cx,cz,67)*6.28,d=Math.min(2,Math.sqrt(Math.abs(f.ring.reduce((s,p,i)=>{const q=f.ring[(i+1)%f.ring.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2)*0.25),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
        B.push([x,top,z,1.3,0.5,1.3,a,STAND]);TK.push([x,top+0.5,z,1,1,1,a,BLACK]);}
      if(h3<(K.lines===undefined?0.25:K.lines)){nLines++;const [ax,az]=r[0],[bx,bz]=r[Math.floor(r.length/2)],L=Math.hypot(bx-ax,bz-az)*0.6,ry=Math.atan2(bx-ax,bz-az),mx=(ax+bx)/2,mz=(az+bz)/2;if(L<2)continue;
        B.push([mx,top+1.6,mz,0.02,0.02,L,ry,LINE]);for(const s of [-1,1])B.push([mx+Math.sin(ry)*s*L/2,top,mz+Math.cos(ry)*s*L/2,0.06,1.65,0.06,0,STAND]);
        for(let k=0;k<Math.floor(L/0.7);k++){const u=-L/2+0.35+k*0.7,c=CLOTHES[Math.floor(hash3(mx,u,68)*CLOTHES.length)];CL.push([mx+Math.sin(ry)*u,top+1.58,mz+Math.cos(ry)*u,0.55,0.5+hash3(u,mz,69)*0.4,1,ry+Math.PI/2,c]);}}}
    const grp=new THREE.Group();grp.name='obragris';
    const fill=(list,geo,m,cast)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,m,list.length);
      list.forEach(([x,y,z,sx,sy,sz,ry,c],i)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.set(sx,sy,sz);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,c);});
      im.instanceColor.needsUpdate=true;im.castShadow=cast;im.userData.noFingerprint=true;grp.add(im);};
    fill(B,BAR,mat,true);fill(TK,TANK,mat,true);fill(CL,CLOTH,cmat,false);scene.add(grp);T.g=grp;}
  let next=0;
  animHooks.push(now=>{if(now<next)return;next=now+300;const p=camera.position,hh=p.y-groundH(p.x,p.z);let built=false;
    for(const T of tiles.values()){const near=Math.hypot(p.x-T.cx,p.z-T.cz)<NEAR+TILE*0.7&&hh<NEAR*1.4;
      if(near&&!T.g&&!built){build(T);built=true;api.ctx.details.obraGris={tiles:tiles.size,rebar:nBars,tanks:nTanks,lines:nLines};}
      if(T.g)T.g.visible=near;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{obraGris:{tiles:tiles.size,rebar:0,tanks:0,lines:0}});
}
