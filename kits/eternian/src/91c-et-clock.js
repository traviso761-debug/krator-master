// ================================================================= THE CLOCK'S PARADE (the host side of et_clock, P4)
// et_clock (62-et-machine.js) leaves its parade on its record as data (`clock`: the dial, the track, the figures); this
// draws it with the head generator's figures and runs it: the ancestors come out of the left door, cross the balcony and
// go in at the right, one parade a minute on the sheet (the page will tie it to its hour); the hands keep the sky's hour.
// Browser side only: a Godot importer reads the same record and animates it in its own way.
const ET_CLOCKS=[];
function etClockMat(metal){const k=ET_METALS[metal]||'bronze',src=MAT[k];
 return new THREE.MeshStandardMaterial({vertexColors:true,map:src&&src.map||null,metalness:src?src.metalness:.5,roughness:src?src.roughness:.4});}
function etClockGeo(G,col){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));
 if(G.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(G.uv,2));g.computeVertexNormals();
 const n=G.pos.length/3,c=new Float32Array(n*3);for(let i=0;i<n;i++){c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g;}
function etClockDraw(world){ET_CLOCKS.length=0;
 for(const r of REG){const C=r.clock;if(!C)continue;
  const figs=C.figures.map(f=>{const m=new THREE.Mesh(etClockGeo(etFigureGeo({pose:'stand',seed:f.seed}),etMetalCol(f.metal)),etClockMat(f.metal));
   m.scale.setScalar(C.figureH);m.castShadow=true;m.userData.probeSkip=true;world.add(m);return m;});
  const piv=new THREE.Object3D(),N=new THREE.Vector3().fromArray(C.normal);piv.position.fromArray(C.dial);piv.lookAt(piv.position.clone().add(N));world.add(piv);
  const hand=(len,w)=>{const G=new THREE.BoxGeometry(w,len,.05).translate(0,len/2-.15,.05),n=G.attributes.position.count,c=new Float32Array(n*3).fill(1);
   G.setAttribute('color',new THREE.BufferAttribute(c,3));const m=new THREE.Mesh(G,etClockMat('gold'));piv.add(m);return m;};
  const T=C.track.map(p=>new THREE.Vector3().fromArray(p)),L=[0];for(let i=1;i<T.length;i++)L.push(L[i-1]+T[i].distanceTo(T[i-1]));
  ET_CLOCKS.push({C,figs,T,L,hour:hand(C.radius*.55,.16),min:hand(C.radius*.82,.1)});}}
{const _etBuild=buildWorld;buildWorld=function(){const w=_etBuild.apply(this,arguments);etClockDraw(w||WORLD);return w;};}
/* where a figure is a fraction u of the way along the track, and which way it faces */
function etClockAt(K,u,out){const s=Math.max(0,Math.min(1,u))*K.L[K.L.length-1];let i=1;while(i<K.L.length-1&&K.L[i]<s)i++;
 const f=(s-K.L[i-1])/Math.max(1e-6,K.L[i]-K.L[i-1]);out.lerpVectors(K.T[i-1],K.T[i],f);return Math.atan2(K.T[i].x-K.T[i-1].x,K.T[i].z-K.T[i-1].z);}
FRAME_HOOKS.push(()=>{const t=ANIM.t,h=SKY.hour;
 for(const K of ET_CLOCKS){const ph=t%K.C.period;
  K.figs.forEach((m,i)=>{const u=(ph-i*2.4)/18;m.rotation.y=etClockAt(K,u,m.position);m.visible=u>-.02&&u<1.02;});
  K.hour.rotation.z=-(h%12)/12*TAU;K.min.rotation.z=-(h%1)*TAU;}});
