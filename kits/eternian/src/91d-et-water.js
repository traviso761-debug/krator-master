// ================================================================= THE SPILLWAY'S WATER (the host side of et_spillway, P6)
// et_spillway (71-et-harbour.js) leaves its fall on its record as data (`spill`: the lip at the mouth, the foot in the
// basin, the width); this draws a sheet of water from the one to the other, curved like a nappe, its streaks running
// down, and a little spray at the foot. Browser side only: a Godot importer reads the same record.
const ET_SPILLS=[];
const ET_SPILL_TEX=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
 g.fillStyle='#3e6a70';g.fillRect(0,0,64,256);for(let i=0;i<90;i++){const x=(i*37)%64,y=(i*101)%256,l=20+(i*13)%60;
  g.fillStyle='rgba(220,236,240,'+(.25+((i*7)%10)/20)+')';g.fillRect(x,y,1+(i%2),l);}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
function etSpillDraw(world){ET_SPILLS.length=0;
 for(const r of REG){const S=r.spill;if(!S)continue;const A=new THREE.Vector3().fromArray(S.lip),B=new THREE.Vector3().fromArray(S.foot);
  const out=new THREE.Vector3(B.x-A.x,0,B.z-A.z).normalize(),side=new THREE.Vector3(-out.z,0,out.x).multiplyScalar(S.width/2);
  const N=12,pos=[],uv=[],idx=[];for(let i=0;i<=N;i++){const t=i/N,p=A.clone().lerp(B,t);p.y=A.y+(B.y-A.y)*t*t;   /* a falling arc */
   p.addScaledVector(out,Math.sin(t*Math.PI)*.3);for(const s of [-1,1]){const q=p.clone().addScaledVector(side,s);pos.push(q.x,q.y,q.z);uv.push(s<0?0:1,t*3);}}
  for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+1,a+3,a,a+3,a+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({map:ET_SPILL_TEX.clone(),transparent:true,opacity:.85,roughness:.15,side:THREE.DoubleSide,depthWrite:false});m.map.needsUpdate=true;
  const mesh=new THREE.Mesh(g,m);mesh.userData.probeSkip=true;world.add(mesh);
  smokeAt(B.x,B.y+.2,B.z);ET_SPILLS.push({m});}}
{const _etBuildW=buildWorld;buildWorld=function(){const w=_etBuildW.apply(this,arguments);etSpillDraw(w||WORLD);return w;};}
FRAME_HOOKS.push(()=>{for(const S of ET_SPILLS)S.m.map.offset.y=-(ANIM.t*1.4)%1;});
