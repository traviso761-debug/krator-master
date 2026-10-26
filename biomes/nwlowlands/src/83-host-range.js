// ================================================================= HOST — the Inner Wall range and its foothill pillars (far field)
// KNOWN_ISSUES 2026-10-26: the Inner Wall was only painted on the sky dome. This is its geometry, beyond the planted map and
// the 6.6 km ground square, cheap (three draw calls, ~0.1M triangles, all of it held and drawn) and fogged:
//   THE RANGE: one vertex-coloured mesh on a 103 m grid (the ground square's edge, +-3300, falls on a grid line) over the land
//     side of the map out to ~10 km, skipping the square itself. Its height is terrainH carried on past the map (the foothills'
//     own formula, so it meets the ground's edge), plus the range: a front ridge rising over s 4300 .. 6200 (s runs NW -> SE)
//     and the higher wall behind it, ridged noise along it for peaks and gullies, eased in from the square's edge so the edge
//     matches. It runs NE-SW like the painted wall, so toward the NE and the SW it sinks into the open country.
//     Its fog is thinned (FOGK) so it reads as the near, high range, not as haze.
//   THE FOOTHILL PILLARS: rock pillars with crag pines on their heads (NOTES.md, "Next"), on the far field's foothills (s 2600 ..
//     5600, outside the planted square), one instanced column and one instanced crown blob; each pillar is a registered volume.
// Placement is KRAND's, seeded by lattice cell (never by draw order). The sky dome still paints its own wall behind (the shared
// sky rollout owns the dome): from here the painted one reads as the farther, higher crest.
(function(){
const SEED=KRAND.child(23,'nwlow-innerwall'),EDGE=TERR.R*1.1,CELL=EDGE/32,EXT=CELL*96,FOGK=.62;
const wallW=(x,z)=>smooth(0,700,Math.max(Math.abs(x),Math.abs(z))-EDGE);   // 0 at the ground's edge, 1 past 700 m out
const ridged=(x,z,o,sd)=>{const f=KRAND.fbm(x,0,z,o,sd);return 1-Math.abs(2*f-1);};
function rangeAdd(x,z){const s=sOf(x,z);const k=smooth(4300,6200,s),k2=smooth(6000,8600,s);if(k<=0)return 0;
 const r1=ridged(x/1100,z/1100,4,SEED),r2=ridged(x/380,z/380,2,SEED+7),pk=Math.pow(Math.max(0,KRAND.fbm(x/1800,0,z/1800,2,SEED+11)-.42)/.58,1.6);
 return k*(420+720*r1*r1+180*r2+600*pk)+k2*(500+420*r1);}
function farH(x,z){return Math.max(terrainH(x,z),.8)+wallW(x,z)*rangeAdd(x,z);}
NWLOW.farH=farH;
// ---------------------------------------------------------------- the range
const N=Math.round(EXT/CELL);
/* colours are written as sRGB and taken to linear, then GAIN folds in the light rig (sun + hemisphere render an albedo about twice as bright: the kit's bark uGain) */
const GAIN=.5,lin=h=>new THREE.Color(h).convertSRGBToLinear().multiplyScalar(GAIN);
const ROCK=lin(0x5a6370),ROCK2=lin(0x767a82),SCRUB=lin(0x5c6244),GOLD=lin(0x8e8458),c=new THREE.Color();
const keep=(x,z)=>sOf(x,z)>-700&&Math.hypot(x,z)<EXT*1.02;
// THE RANGE ON KFAR (core/terrain/44-core-farfield.js, 2026-10-26: HEIGHT-RESEARCH item 3 made core): the same lattice
// (lines i*CELL, i -N..N), the same cells skipped (the ground square, the lake side, past EXT), the same heights and colours
// per vertex, made in the same order (x outer, z inner): the mesh is the one this fragment drew by hand before
const RANGE=KFAR.grid({cell:CELL,n:N,
 h:(x,z)=>{const inside=Math.abs(x)<=EDGE&&Math.abs(z)<=EDGE;let y=farH(x,z)-(inside?0:120*smooth(-250,-700,sOf(x,z)));if(inside)y-=3;return y;},   /* toward the lake the band's open end slopes down out of sight; the square's edge: a hand under the ground, so the two meshes never fight */
 skip:(x0,z0,x1,z1)=>(x0>=-EDGE&&x1<=EDGE&&z0>=-EDGE&&z1<=EDGE)||!keep((x0+x1)/2,(z0+z1)/2),   /* the ground square has its own mesh */
 color:(x,z,y,q)=>{const add=wallW(x,z)*rangeAdd(x,z),hn=KRAND.h3(q.i-N,q.j-N,0,SEED+3);
  c.copy(GOLD).lerp(SCRUB,clamp(.35+hn*.5,0,1)).lerp(ROCK,smooth(90,500,add)).lerp(ROCK2,smooth(1000,1800,add)*.6);c.multiplyScalar(.9+hn*.18);return [c.r,c.g,c.b];}});
const thinFog=m=>KFAR.fogThin(m,FOGK,'nwl-farfog');
const range=KFAR.mesh(RANGE,{fogK:FOGK,fogKey:'nwl-farfog',name:'innerwall-range',label:'The Inner Wall range (far field)'}),MAT_RANGE=range.material,IDX={length:RANGE.idx.length};scene.add(range);
{const bb=new THREE.Box3().setFromObject(range),cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2;
 REGISTER({name:'The Inner Wall range (far field)',type:'far field',x:cx,z:cz,y:bb.min.y,r:Math.hypot(bb.max.x-cx,bb.max.z-cz),h:bb.max.y-bb.min.y});}
// ---------------------------------------------------------------- the foothill pillars
// a pillar: an 8-sided column, waisted and leaning a little, its rings jittered (one geometry; scale and turn per instance)
const PG=(function(){const S=8,RN=7,P=[],I=[],C=[];
 for(let r=0;r<=RN;r++){const t=r/RN,rad=(1-.42*t)*(1+.12*Math.sin(t*7.3))*(r===RN?.82:1);
  for(let k=0;k<S;k++){const a=k/S*TAU,j=.82+.36*KRAND.h3(r,k,1,SEED+5);P.push(Math.cos(a)*rad*j,t,Math.sin(a)*rad*j);const v=.78+.3*t+.08*KRAND.h3(r,k,2,SEED+5);C.push(v,v,v);}}
 for(let r=0;r<RN;r++)for(let k=0;k<S;k++){const a=r*S+k,b=r*S+(k+1)%S,d=a+S,e=b+S;I.push(a,d,b,b,d,e);}
 const top=P.length/3;P.push(0,1.04,0);C.push(1.05,1.05,1.05);for(let k=0;k<S;k++)I.push(RN*S+k,top,RN*S+(k+1)%S);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();return g;})();
const CG=new THREE.IcosahedronGeometry(1,0);
const PIL=[],CRW=[],PC=140;
for(let i=Math.floor(-EXT/PC);i<=EXT/PC;i++)for(let j=Math.floor(-EXT/PC);j<=EXT/PC;j++){
 const h=KRAND.hash(SEED,i,j,1),x=(i+KRAND.unit(KRAND.hash(SEED,i,j,2)))*PC,z=(j+KRAND.unit(KRAND.hash(SEED,i,j,3)))*PC;
 if(Math.abs(x)<=EDGE-350&&Math.abs(z)<=EDGE-350)continue;   /* outside the planted square (R 2850) only */
 const s=sOf(x,z);if(s<2600||s>5600||Math.hypot(x,z)>EXT)continue;
 const clump=KRAND.fbm(x/900,0,z/900,2,SEED+13),p=.55*smooth(2600,3300,s)*smooth(5600,4800,s)*smooth(.42,.62,clump);
 if(KRAND.unit(h)>=p)continue;
 const u=KRAND.unit(KRAND.hash(SEED,i,j,4)),H=40+110*u*u+40*smooth(3000,5200,s),R=H*(.09+.05*KRAND.unit(KRAND.hash(SEED,i,j,5))),y0=farH(x,z)-6;
 const ry=KRAND.unit(KRAND.hash(SEED,i,j,6))*TAU,lean=(KRAND.unit(KRAND.hash(SEED,i,j,7))-.5)*.12;
 const M=new THREE.Matrix4().compose(new THREE.Vector3(x,y0,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(lean,ry,lean*.5)),new THREE.Vector3(R,H,R)),top=new THREE.Vector3(0,1,0).applyMatrix4(M);
 PIL.push({x,z,y0,H,R,M});
 const nc=2+Math.floor(KRAND.unit(KRAND.hash(SEED,i,j,8))*4);
 for(let k=0;k<nc;k++){const a=KRAND.unit(KRAND.hash(SEED,i,j,10+k))*TAU,d=R*.55*KRAND.unit(KRAND.hash(SEED,i,j,20+k)),cr=R*(.35+.3*KRAND.unit(KRAND.hash(SEED,i,j,30+k)));
  CRW.push([top.x+Math.cos(a)*d,top.y+cr*.2,top.z+Math.sin(a)*d,cr,KRAND.unit(KRAND.hash(SEED,i,j,40+k))]);}}
const MAT_PILLAR=thinFog(new THREE.MeshLambertMaterial({vertexColors:true}));
const MAT_CROWN=thinFog(new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}));
const pm=new THREE.InstancedMesh(PG,MAT_PILLAR,Math.max(1,PIL.length)),cm=new THREE.InstancedMesh(CG,MAT_CROWN,Math.max(1,CRW.length));
const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e3=new THREE.Euler(),v3=new THREE.Vector3(),s3=new THREE.Vector3(),tint=new THREE.Color(),WARM=lin(0x9a8268),PINE=lin(0x3e4a32);
PIL.forEach((P,k)=>{pm.setMatrixAt(k,P.M);
 tint.copy(lin(0x8a8070)).lerp(WARM,KRAND.h3(k,0,0,SEED+17)*.6);pm.setColorAt(k,tint);
 REGISTER({name:'Foothill pillar (far field)',type:'far field',x:P.x,z:P.z,y:P.y0,r:P.R*1.3,h:P.H*1.1});});
CRW.forEach((C,k)=>{q.setFromEuler(e3.set(0,C[4]*TAU,0));m4.compose(v3.set(C[0],C[1],C[2]),q,s3.set(C[3],C[3]*.42,C[3]));cm.setMatrixAt(k,m4);
 cm.setColorAt(k,tint.copy(lin(0x26321f)).lerp(PINE,C[4]*.7));});
pm.count=PIL.length;cm.count=CRW.length;
[[pm,'innerwall-pillars','Foothill rock pillars (far field)'],[cm,'innerwall-cragpines','Crag pines on the pillars (far field)']].forEach(([m,n,l])=>{m.name=n;m.userData.farField=true;m.userData.inspectLabel=l;
 m.frustumCulled=false;   /* r128 culls an InstancedMesh by its unit geometry's sphere: the instances span kilometres */
 m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;scene.add(m);});
NWLOW.FARFIELD={range,pillars:pm,crowns:cm,count:{pillars:PIL.length,crowns:CRW.length,rangeTris:IDX.length/3,tris:IDX.length/3+PIL.length*PG.index.count/3+CRW.length*20}};
})();
