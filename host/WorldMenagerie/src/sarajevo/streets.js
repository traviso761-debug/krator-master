// ---------- Sarajevo: on the pavement ----------
// Two things the city keeps underfoot.
//   The Sarajevo roses: where a mortar shell struck the pavement and killed someone in the siege, its scar was filled
//   with red resin, a splash like a flower. A few hundred were made; the ones that are left are kept up. Here they are
//   on the old town's and the centre's streets, each from a hash of its place (C.streets.roses: how many, and the box).
//   The Meeting of Cultures: across Ferhadija where it becomes Sarači, a line in the paving with "Sarajevo - Meeting
//   of Cultures" on it, the Austrian city on the one side and the Ottoman on the other (C.streets.line).
// Merged into one mesh each; flat on the ground, offset so they never fight with it.
import {hash3} from '../core/rng.js';

export function streets(api){
  const {THREE,C,scene,ROADS,P,groundH,inWater,mergeParts}=api;const K=C.streets;if(!K)return;
  const grp=new THREE.Group();grp.name='streets';
  const flat=(col,extra={})=>new THREE.MeshPhongMaterial(Object.assign({color:col,shininess:40,specular:0x442222,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8},extra));
  // ---- the roses: a jagged splash, a dark heart, splinters thrown out from it
  let nRoses=0;
  if(K.roses){const R=K.roses,[s,w,n,e]=R.box,[x0,z1]=P([s,w]),[x1,z0]=P([n,e]),classes=new Set(R.classes||['pedestrian','living_street','primary','secondary','tertiary','residential']);
    const ways=ROADS.filter(r=>classes.has(r.c)&&r.pts.some(([x,z])=>x>=x0&&x<=x1&&z>=z0&&z<=z1));
    let len=0;const cum=ways.map(r=>(len+=r.len));
    const parts=[];
    for(let i=0;i<(R.count||40)*40&&nRoses<(R.count||40);i++){
      let t=hash3(i,R.seed||1992,1)*len,k=0;while(cum[k]<t)k++;const r=ways[k];let u=t-(k?cum[k-1]:0);
      let j=0;for(;j+1<r.pts.length;j++){const L=Math.hypot(r.pts[j+1][0]-r.pts[j][0],r.pts[j+1][1]-r.pts[j][1]);if(u<=L)break;u-=L;}
      if(j+1>=r.pts.length)continue;const [ax,az]=r.pts[j],[bx,bz]=r.pts[j+1],L=Math.hypot(bx-ax,bz-az)||1;
      const off=(hash3(i,2,3)-0.5)*Math.max(0,r.w-2),x=ax+(bx-ax)*u/L-(bz-az)/L*off,z=az+(bz-az)*u/L+(bx-ax)/L*off;
      if(x<x0||x>x1||z<z0||z>z1||inWater(x,z))continue;
      // the splash: a ring of uneven petals round the crater
      const sh=new THREE.Shape(),N=22,base=0.45+hash3(x,z,4)*0.25;
      for(let q=0;q<=N;q++){const a=q/N*Math.PI*2,rr=base*(q%2?0.55+hash3(x,z,10+q)*0.35:0.9+hash3(x,z,40+q)*0.9);q?sh.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):sh.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}
      const g=new THREE.ShapeGeometry(sh).rotateX(-Math.PI/2);
      // splinters: little streaks thrown out from it
      const gs=[g];for(let q=0;q<9;q++){const a=hash3(x,z,70+q)*Math.PI*2,d=base*1.5+hash3(x,z,80+q)*base*2.2;gs.push(new THREE.PlaneGeometry(0.05+hash3(x,z,90+q)*0.06,0.16+hash3(x,z,95+q)*0.25).rotateX(-Math.PI/2).rotateY(-a+Math.PI/2).translate(Math.cos(a)*d,0,Math.sin(a)*d));}
      for(const q of gs){const m=new THREE.Mesh(q);m.position.set(x,groundH(x,z)+0.07,z);m.rotation.y=hash3(x,z,5)*6.28;parts.push(m);}
      nRoses++;}
    if(parts.length){const m=mergeParts(parts,flat(0x9a1c24));m.receiveShadow=true;grp.add(m);}}
  // ---- the line across Ferhadija, and the words on it
  if(K.line){const [ax,az]=P(K.line.from),[bx,bz]=P(K.line.to),L=Math.hypot(bx-ax,bz-az),ry=Math.atan2(bx-ax,bz-az),y=Math.max(groundH(ax,az),groundH(bx,bz))+0.14;
    const cv=document.createElement('canvas');cv.width=1024;cv.height=64;const c=cv.getContext('2d');c.fillStyle='#d8d2c4';c.fillRect(0,0,1024,64);
    c.fillStyle='#4a4038';c.font='bold 34px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('SARAJEVO  ·  MEETING OF CULTURES',512,34);
    const tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.6,L).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    tex.center.set(0.5,0.5);tex.rotation=Math.PI/2;m.position.set((ax+bx)/2,y,(az+bz)/2);m.rotation.y=ry;m.receiveShadow=true;grp.add(m);}
  grp.traverse(o=>{o.userData.noFingerprint=true;});scene.add(grp);
  api.ctx.details=Object.assign(api.ctx.details||{},{roses:nRoses,cultureLine:!!K.line});
}
