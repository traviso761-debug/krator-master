// ---------- Sarajevo: the graveyards ----------
// Sarajevo's hills are white with graves. The mezarje, the Muslim graveyards, lie between the houses of every mahala,
// their nišani (slender white stones, a carved turban or fez on a man's, a plain pointed top on a woman's) standing at
// every lean; the siege filled the old ones and made new ones out of parks and the stadium's pitches. The city
// cemetery at Bare is all faiths, the Jewish cemetery on Kovačići lies in flat dark slabs, the Orthodox and Catholic
// ones have their crosses.
//
// Each mapped cemetery is filled the first time the camera comes within C.mezarje.near metres of it, its stones from
// a hash of their place (the same graves every visit), and is shown only while the camera is that close: a few
// instanced meshes per cemetery, nothing built at load.
import {hash3} from '../core/rng.js';

export function mezarje(api){
  const {THREE,C,scene,AREAS,groundH,inPoly,buildingsAt,roadsNear,inWater,animHooks,camera}=api;const K=C.mezarje;if(!K||!AREAS)return;
  const NEAR=K.near||650,SP=K.spacing||[2.6,3.4],KEEP=K.keep===undefined?0.72:K.keep,MAX=K.max||9000;
  // the stones, each a unit tall at its base: the instance scale sets its height
  const box=(w,h,d,y)=>new THREE.BoxGeometry(w,h,d).translate(0,y+h/2,0);
  const merge=gs=>{const out=api.mergeGeometries?api.mergeGeometries(gs.map(g=>g.toNonIndexed())):null;if(out)return out;
    const pos=[];for(const g of gs){const a=g.toNonIndexed().attributes.position.array;for(let i=0;i<a.length;i++)pos.push(a[i]);}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.computeVertexNormals();return ge;};
  const GEO={
    man:merge([box(0.2,0.86,0.13,0),new THREE.CylinderGeometry(0.075,0.09,0.07,6).translate(0,0.895,0),new THREE.SphereGeometry(0.15,6,3,0,Math.PI*2,0,Math.PI/2).scale(1,0.85,1).translate(0,0.92,0)]),   // the turban
    woman:merge([box(0.22,0.84,0.1,0),new THREE.ConeGeometry(0.155,0.18,4).rotateY(Math.PI/4).scale(1,1,0.45).translate(0,0.93,0)]),
    cross:merge([box(0.12,1,0.1,0),box(0.5,0.1,0.1,0.66)]),
    slab:merge([box(0.5,0.62,0.14,0),box(0.62,0.1,0.9,0).translate(0,-0.05,0.4)])};
  const MAT={white:new THREE.MeshLambertMaterial({color:0xeeebe2}),grey:new THREE.MeshLambertMaterial({color:0x8a8884}),dark:new THREE.MeshLambertMaterial({color:0x5a5650})};
  // what each cemetery holds: by its name, the mezarje (and every unnamed graveyard in the mahalas) nišani
  const mix=a=>{const n=a.name||'';
    if(/jevrej|jewish/i.test(n))return [['slab','dark',1]];
    if(/sv\.|crkv|pravoslav|katoli/i.test(n))return [['cross','grey',0.55],['slab','grey',0.45]];
    if(/bare|lav/i.test(n))return [['man','white',0.3],['woman','white',0.22],['cross','grey',0.2],['slab','grey',0.28]];
    return [['man','white',0.55],['woman','white',0.45]];};
  const yards=AREAS.filter(a=>a.kind==='cemetery').map(a=>{let cx=0,cz=0;for(const [x,z] of a.o){cx+=x;cz+=z;}cx/=a.o.length;cz/=a.o.length;
    return {a,cx,cz,r:Math.hypot(a.bb.x1-a.bb.x0,a.bb.z1-a.bb.z0)/2,g:null};});
  function fill(y){const a=y.a,kinds=mix(a),parts=kinds.map(()=>[]);
    // rows: the graves face the qibla, south-east, so the rows run across it
    const ang=K.qibla===undefined?2.39:K.qibla,ux=Math.cos(ang),uz=Math.sin(ang);
    const r=y.r;let n=0;
    for(let v=-r;v<=r&&n<MAX;v+=SP[1])for(let u=-r;u<=r&&n<MAX;u+=SP[0]){
      const h0=hash3(u+y.cx,v+y.cz,77);if(h0>KEEP)continue;
      const x=y.cx+u*ux-v*uz+(hash3(u,v,78)-0.5)*0.9,z=y.cz+u*uz+v*ux+(hash3(u,v,79)-0.5)*0.9;
      if(x<a.bb.x0||x>a.bb.x1||z<a.bb.z0||z>a.bb.z1||!inPoly(x,z,a.o)||a.i.some(h=>inPoly(x,z,h)))continue;
      if(inWater(x,z)||buildingsAt(x,z,2).some(b=>inPoly(x,z,b.ring))||roadsNear(x,z,1.5).length)continue;
      let pick=hash3(x,z,80),k=0;for(;k<kinds.length-1;k++){if(pick<kinds[k][2])break;pick-=kinds[k][2];}
      parts[k].push([x,z,hash3(x,z,81),hash3(x,z,82),hash3(x,z,83)]);n++;}
    const g=new THREE.Group();g.name='mezarje';const o=new THREE.Object3D();
    kinds.forEach(([geo,mat],k)=>{const P=parts[k];if(!P.length)return;const im=new THREE.InstancedMesh(GEO[geo],MAT[mat],P.length);
      P.forEach(([x,z,a1,a2,a3],i)=>{const s=geo==='slab'?0.9+a1*0.3:1+a1*0.9;   // the old nišani stand to nearly two metres
        o.position.set(x,groundH(x,z)-0.04,z);o.rotation.set((a2-0.5)*0.16,ang+(a3-0.5)*0.25,(a1-0.5)*0.12);   // and lean every way
        o.scale.set(1,s,1);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
      im.castShadow=false;im.receiveShadow=true;im.userData.noFingerprint=true;g.add(im);});
    g.traverse(q=>{q.userData.noFingerprint=true;});scene.add(g);y.g=g;y.n=n;}
  let next=0,built=0,stones=0;
  animHooks.push(now=>{if(now<next)return;next=now+400;const p=camera.position;
    for(const y of yards){const d=Math.hypot(p.x-y.cx,p.z-y.cz)-y.r,h=p.y-groundH(p.x,p.z),near=d<NEAR&&h<NEAR*1.2;
      if(near&&!y.g){fill(y);built++;stones+=y.n;api.ctx.details&&(api.ctx.details.mezarje={cemeteries:yards.length,filled:built,stones});return;}   // one per tick: no hitch
      if(y.g)y.g.visible=near;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{mezarje:{cemeteries:yards.length,filled:0,stones:0}});
}
