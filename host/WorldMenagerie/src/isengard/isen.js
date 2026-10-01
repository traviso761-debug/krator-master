// ---------- the Isen ----------
// Fan work from Tolkien.
//
// The engine draws water at one level, which is right for a river across a plain and wrong for one coming down a
// mountain, so the Isen's water is drawn here: a ribbon along the waterway the generator writes, its surface a
// metre and a half over the bed at every point, so it falls with the bed. Inside the Ring it runs in a stone cut,
// lined; outside it widens as it goes south.
import { RO } from './plan.js';

export function isen(api){
  const {THREE,ctx,scene,groundH,WATERWAYS,animHooks}=api;
  const W=(WATERWAYS||[]).find(w=>/Isen/.test(w.name));if(!W)return;
  // resample the course every 12 m so the surface follows the bed closely
  const pts=[];for(let i=0;i<W.pts.length-1;i++){const [ax,az]=W.pts[i],[bx,bz]=W.pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/12));
    for(let k=0;k<n;k++){const t=k/n;pts.push([ax+(bx-ax)*t,az+(bz-az)*t]);}}
  pts.push(W.pts[W.pts.length-1]);
  const width=(x,z)=>{const d=Math.hypot(x,z);return d<RO+40?6:(z<0?9+4*Math.min(1,(-z-RO)/2500):12+10*Math.min(1,(z-RO)/3000));};
  const P=[],UV=[],IDX=[];let along=0;
  // the surface: a little over the lowest ground across the bed, so it never floats over a bank
  const ys=pts.map(([x,z],i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz)||1,w=width(x,z);
    return Math.min(groundH(x,z),groundH(x-dz/n*w*0.5,z+dx/n*w*0.5),groundH(x+dz/n*w*0.5,z-dx/n*w*0.5))+1.5;});
  // and never higher downstream than up: water does not climb
  for(let i=1;i<ys.length;i++)ys[i]=Math.min(ys[i],ys[i-1]);
  pts.forEach(([x,z],i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz)||1,w=width(x,z);
    if(i)along+=Math.hypot(x-pts[i-1][0],z-pts[i-1][1]);
    P.push(x-dz/n*w,ys[i],z+dx/n*w, x+dz/n*w,ys[i],z-dx/n*w);UV.push(0,along/20,1,along/20);
    if(i<pts.length-1){const k=i*2;IDX.push(k,k+2,k+1,k+1,k+2,k+3);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(IDX);g.computeVertexNormals();
  const m=new THREE.MeshPhongMaterial({color:0x3e5566,specular:0x9fb8c8,shininess:80,transparent:true,opacity:0.88,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,side:THREE.DoubleSide});
  const water=new THREE.Mesh(g,m);water.receiveShadow=true;water.userData.noFingerprint=true;scene.add(water);
  animHooks.push(now=>{m.shininess=70+30*Math.sin(now*0.0012);});
  // the stone lining of the cut through the Ring
  const lin=new THREE.MeshLambertMaterial({color:0x2c2b2a,flatShading:true}),parts=[];
  pts.forEach(([x,z],i)=>{if(i%2||Math.hypot(x,z)>RO-60||i>=pts.length-1)return;const b=pts[i+1],dx=b[0]-x,dz=b[1]-z,n=Math.hypot(dx,dz)||1,w=width(x,z);
    for(const sd of [-1,1]){const px=x-dz/n*w*sd*1.15,pz=z+dx/n*w*sd*1.15,top=groundH(px,pz)+0.4;
      const s=new THREE.Mesh(new THREE.BoxGeometry(1.2,top-ys[i]+3,26).translate(0,(top-ys[i]+3)/2,0),lin);s.position.set(px,ys[i]-3,pz);s.rotation.y=Math.atan2(dx,dz);parts.push(s);}});
  if(parts.length){const merged=api.mergeParts(parts,lin);merged.userData.noFingerprint=true;scene.add(merged);}
  ctx.isen={pts,ys,water};
}
