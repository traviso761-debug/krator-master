// ---------- Sarajevo: the minarets ----------
// Sarajevo's skyline is minarets: the map carries sixty-odd mosques, and the engine extrudes each as a block with a
// roof like any other. Here every one the landmarks do not model gets what makes it a mosque. A big one (the
// classical kind, a hall under a dome) gets its lead dome on a low drum and a stone pencil minaret at a corner;
// a small one, a mahala's mesdžid, keeps its hipped roof and gets the slender minaret of whitewashed wood with its
// dark cone that stands over every quarter on the hills. At night their balconies are lit.
//
// Read from api.FOOTPRINTS (each drawn footprint's ring, type, top and ground). Merged by material: a few meshes
// for the lot.
import {hash3} from '../core/rng.js';

export function mosques(api){
  const {THREE,C,scene,FOOTPRINTS,mergeParts,animHooks,nightF,P}=api;const K=C.mosques;if(!K||!FOOTPRINTS)return;
  const modelled=(C.landmarks||[]).filter(l=>l.model==='mosque').map(l=>P(l.at));
  const M={stone:[],lead:[],white:[],dark:[],gold:[]},lights=[];
  const put=(k,g,x,y,z,ry=0)=>{const m=new THREE.Mesh(g);m.position.set(x,y,z);m.rotation.y=ry;M[k].push(m);};
  const cyl=(r0,r1,h,seg)=>new THREE.CylinderGeometry(r1,r0,h,seg).translate(0,h/2,0);
  let nBig=0,nSmall=0;
  for(const f of FOOTPRINTS){if(f.t!=='mosque')continue;const r=f.ring,n=r.length;if(n<3)continue;
    let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=n;cz/=n;
    if(modelled.some(([x,z])=>Math.hypot(x-cx,z-cz)<(K.skip||30)))continue;
    // the footprint's own axes: its longest edge sets them
    let best=0,ux=1,uz=0;for(let i=0;i<n;i++){const [ax,az]=r[i],[bx,bz]=r[(i+1)%n],l=Math.hypot(bx-ax,bz-az);if(l>best){best=l;ux=(bx-ax)/l;uz=(bz-az)/l;}}
    let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const [x,z] of r){const a=(x-cx)*ux+(z-cz)*uz,b=-(x-cx)*uz+(z-cz)*ux;a0=Math.min(a0,a);a1=Math.max(a1,a);b0=Math.min(b0,b);b1=Math.max(b1,b);}
    const w=a1-a0,d=b1-b0,mx=cx+ux*(a0+a1)/2-uz*(b0+b1)/2,mz=cz+uz*(a0+a1)/2+ux*(b0+b1)/2,top=f.h,g=f.g,ry=Math.atan2(ux,uz),hs=hash3(cx,cz,K.seed||1461);
    // the minaret at one of the four corners, outside the wall
    const sa=hs<0.5?1:-1,sb=(hs*7)%1<0.5?1:-1,px=mx+ux*sa*(w/2+1.2)-uz*sb*(d/2-1.5),pz=mz+uz*sa*(w/2+1.2)+ux*sb*(d/2-1.5);
    const big=w*d>=170&&Math.min(w,d)>=10;
    if(big){nBig++;const R=Math.min(7,Math.min(w,d)*0.36);
      put('stone',cyl(R*1.12,R*1.12,1.6,8),mx,top-0.4,mz,ry+Math.PI/8);
      put('lead',new THREE.SphereGeometry(R,18,8,0,Math.PI*2,0,Math.PI/2).scale(1,0.9,1),mx,top+1.2,mz);
      put('gold',cyl(0.07,0.07,1.5,5),mx,top+1.2+R*0.9,mz);
      const H=Math.max(24,Math.min(40,(top-g)*2.6)),rr=1.0,bal=g+H*0.68;
      put('stone',new THREE.BoxGeometry(rr*2.5,4,rr*2.5).translate(0,2,0),px,g,pz,ry);put('stone',cyl(rr,rr*0.9,H*0.8-4,12),px,g+4,pz);
      put('stone',cyl(rr*0.9,rr*1.6,0.9,12),px,bal-0.9,pz);put('stone',cyl(rr*1.65,rr*1.65,1.0,12),px,bal,pz);
      put('lead',new THREE.ConeGeometry(rr*0.95,H*0.2,12).translate(0,H*0.1,0),px,g+H*0.8,pz);put('gold',cyl(0.05,0.05,1.2,5),px,g+H,pz);
      lights.push([px,bal+0.6,pz,rr*1.9]);}
    else{nSmall++;
      // the wooden minaret of a mesdžid: square, whitewashed, a little gallery, a tall dark cone
      const H=Math.max(13,Math.min(20,(top-g)+9)),s=1.3;
      put('white',new THREE.BoxGeometry(s,H*0.72,s).translate(0,H*0.36,0),px,g,pz,ry);
      put('dark',new THREE.BoxGeometry(s*1.7,0.25,s*1.7).translate(0,0,0),px,g+H*0.6,pz,ry);
      for(const [ox,oz] of [[1,1],[-1,1],[1,-1],[-1,-1]])put('dark',new THREE.BoxGeometry(0.1,0.9,0.1).translate(0,0.45,0),px+(ox*ux-oz*uz)*s*0.8,g+H*0.6,pz+(ox*uz+oz*ux)*s*0.8);
      put('dark',new THREE.ConeGeometry(s*0.85,H*0.28,4).rotateY(Math.PI/4).translate(0,H*0.14,0),px,g+H*0.72,pz,ry);put('gold',cyl(0.04,0.04,0.9,5),px,g+H,pz);
      lights.push([px,g+H*0.6+0.5,pz,s*1.2]);}}
  const COL={stone:0xd9d2c2,lead:0x7a8286,white:0xece8de,dark:0x3a3634,gold:0xcaa13c};
  const grp=new THREE.Group();grp.name='mosques';
  for(const k in M)if(M[k].length){const m=mergeParts(M[k],new THREE.MeshLambertMaterial({color:COL[k]}));m.castShadow=m.receiveShadow=true;grp.add(m);}
  // the balconies' lights after dark: a ring of small lamps round each
  if(lights.length){const pos=[];for(const [x,y,z,r] of lights)for(let i=0;i<10;i++){const a=i/10*Math.PI*2;pos.push(x+Math.cos(a)*r,y,z+Math.sin(a)*r);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    const pm=new THREE.PointsMaterial({color:0xfff0c0,size:2.2,sizeAttenuation:true,transparent:true,opacity:0,depthWrite:false});const pts=new THREE.Points(g,pm);pts.frustumCulled=false;grp.add(pts);
    animHooks.push(()=>{const nf=nightF&&api.hour?nightF(api.hour()):0;pm.opacity=Math.min(1,nf*1.3);pts.visible=nf>0.05;});}
  grp.traverse(o=>{o.userData.noFingerprint=true;});scene.add(grp);
  api.ctx.details=Object.assign(api.ctx.details||{},{mosques:{domed:nBig,mesdzid:nSmall}});
}
