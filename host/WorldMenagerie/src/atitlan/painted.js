// ---------- Lake Atitlán: the painted town ----------
// Since 2016 the houses of Santa Catarina Palopó have been painted, one after another, in the designs of the
// town's own huipil, the women's woven blouse: turquoise and blue, purple and green, white, in bands of diamonds,
// zigzags, birds and flowers, so the whole town on its slope reads as a piece of weaving from the water. C.painted:
// the footprints inside `zones` ([lat, lon, radius]) under `maxH`, each wall at least `minWall` long, get one of the
// patterns over its face (a share of houses, `share`). The patterns are drawn here on a canvas, in the palette of
// `colours`: they are designs, not a photographed surface. Four meshes, one a pattern; none in the fingerprint.
import {hash3} from '../core/rng.js';

export function painted(api){
  const {THREE,C,scene,FOOTPRINTS,P}=api;const K=C.painted;if(!K||!FOOTPRINTS)return;
  const ZONES=(K.zones||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];}),inZone=(x,z)=>ZONES.some(([zx,zz,r])=>(x-zx)**2+(z-zz)**2<r*r);
  const PAL=K.colours||['#1fa0b0','#2a4aa8','#6a3a9a','#2a8a5a','#f2f0ea','#c83a5a','#e8b830'];
  // a band pattern 256 px wide = `metres` of wall, 256 px high = one storey band, in the town's colours
  const pattern=(kind,seed)=>{const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    const col=()=>PAL[Math.floor(R()*PAL.length)],bg=PAL[seed%2?0:1];c.fillStyle=bg;c.fillRect(0,0,256,256);
    const band=(y,h,fn)=>{c.save();c.beginPath();c.rect(0,y,256,h);c.clip();fn(y,h);c.restore();};
    if(kind===0){// diamonds in rows, framed by bands
      band(0,40,(y,h)=>{c.fillStyle=col();c.fillRect(0,y,256,h);c.fillStyle='#f2f0ea';for(let x=0;x<256;x+=32){c.beginPath();c.moveTo(x,y+h/2);c.lineTo(x+16,y+4);c.lineTo(x+32,y+h/2);c.lineTo(x+16,y+h-4);c.fill();}});
      band(40,176,(y,h)=>{for(let r=0;r<4;r++){c.fillStyle=col();for(let x=-32;x<288;x+=64){const cx=x+(r%2)*32,cy=y+22+r*44;c.beginPath();c.moveTo(cx-26,cy);c.lineTo(cx,cy-20);c.lineTo(cx+26,cy);c.lineTo(cx,cy+20);c.fill();c.fillStyle=col();c.fillRect(cx-5,cy-5,10,10);}}});
      band(216,40,(y,h)=>{c.fillStyle=col();c.fillRect(0,y,256,h);c.fillStyle='#f2f0ea';for(let x=0;x<256;x+=16)c.fillRect(x,y+h/2-3,8,6);});}
    else if(kind===1){// zigzags, stacked in colours
      for(let r=0;r<8;r++){c.strokeStyle=col();c.lineWidth=14;c.beginPath();for(let x=0;x<=256;x+=32)c.lineTo(x,16+r*32+(x/32%2?-12:12));c.stroke();}}
    else if(kind===2){// birds (the huipil's quetzales and ducks of the lake) in a grid, in white and colour
      c.fillStyle=col();c.fillRect(0,0,256,256);for(let j=0;j<4;j++)for(let i=0;i<4;i++){const x=i*64+32,y=j*64+32;c.fillStyle=(i+j)%2?'#f2f0ea':col();
        c.beginPath();c.moveTo(x-22,y+6);c.lineTo(x-6,y-10);c.lineTo(x+4,y-10);c.lineTo(x+12,y-20);c.lineTo(x+20,y-14);c.lineTo(x+12,y-6);c.lineTo(x+22,y+12);c.lineTo(x-14,y+14);c.closePath();c.fill();
        c.fillRect(x-4,y+14,3,10);c.fillRect(x+4,y+14,3,10);}}
    else{// flowers and stripes: the vertical bands of the skirt's corte
      for(let x=0;x<256;x+=32){c.fillStyle=col();c.fillRect(x,0,32,256);c.fillStyle='#f2f0ea';c.fillRect(x+30,0,2,256);}
      for(let j=0;j<4;j++)for(let i=0;i<4;i++){const x=i*64+32,y=j*64+32;c.fillStyle=col();for(let a=0;a<6;a++){c.beginPath();c.ellipse(x+Math.cos(a)*11,y+Math.sin(a)*11,8,5,a,0,Math.PI*2);c.fill();}c.fillStyle='#e8b830';c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.fill();}}
    const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;};
  const M=K.metres||4,KINDS=4,buf=[...Array(KINDS)].map(()=>({p:[],u:[]}));let n=0;
  for(const f of FOOTPRINTS){const r=f.ring;if(!r||r.length<3)continue;const H=f.h-f.g;if(H>(K.maxH||12))continue;
    let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;if(!inZone(cx,cz)||hash3(cx,cz,71)>(K.share===undefined?0.8:K.share))continue;
    const kind=Math.floor(hash3(cx,cz,72)*KINDS),b=buf[kind];let A=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];A+=p[0]*q[1]-q[0]*p[1];}const sg=A>0?1:-1;n++;
    let s=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<(K.minWall||2)){s+=L;continue;}
      const nx=(q[1]-p[1])/L*sg*0.06,nz=-(q[0]-p[0])/L*sg*0.06,y0=f.g+0.15,y1=f.h-0.25,u0=s/M,u1=(s+L)/M,v0=0,v1=(y1-y0)/(K.band||3);s+=L;
      const a=[p[0]+nx,y0,p[1]+nz],bb=[q[0]+nx,y0,q[1]+nz],c2=[q[0]+nx,y1,q[1]+nz],d=[p[0]+nx,y1,p[1]+nz];
      b.p.push(...a,...bb,...c2,...a,...c2,...d);b.u.push(u0,v0,u1,v0,u1,v1,u0,v0,u1,v1,u0,v1);}}
  const grp=new THREE.Group();grp.name='painted';
  buf.forEach((b,k)=>{if(!b.p.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:pattern(k,97+k*31),side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));m.receiveShadow=true;m.userData.noFingerprint=true;grp.add(m);});
  scene.add(grp);api.ctx.details=Object.assign(api.ctx.details||{},{painted:n});
}
