// ================================================================= ANIMATION: the clock, smoke, and the material table for the export
// uTime drives the cloth flutter and the glow flicker (27-mat.js); ?t=SECONDS pins it for repeatable screenshots.
// Smoke: a few soft puffs rise and fade above every smoke source (funnels, galley fires) recorded while building.
const ANIM={t:0,pin:qs.has('t')?+qs.get('t'):null,smoke:null,N:6};
const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
 gr.addColorStop(0,'rgba(200,196,190,.55)');gr.addColorStop(1,'rgba(200,196,190,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const smokeMat=new THREE.PointsMaterial({size:1.6,map:smokeTex,transparent:true,depthWrite:false,opacity:.5,sizeAttenuation:true,color:0xb8b0a6});
function animRebuild(){if(ANIM.smoke){scene.remove(ANIM.smoke);ANIM.smoke.geometry.dispose();ANIM.smoke=null;}if(!SMOKES.length)return;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(SMOKES.length*ANIM.N*3),3));
 ANIM.smoke=new THREE.Points(g,smokeMat);ANIM.smoke.frustumCulled=false;ANIM.smoke.userData.probeSkip=true;ANIM.smoke.raycast=()=>{};scene.add(ANIM.smoke);}
FRAME_HOOKS.push((dt)=>{ANIM.t=ANIM.pin!==null?ANIM.pin:ANIM.t+dt;ANIMU.uTime.value=ANIM.t;
 if(ANIM.smoke){const a=ANIM.smoke.geometry.attributes.position.array;let k=0;for(let i=0;i<SMOKES.length;i++){const s=SMOKES[i];
  for(let j=0;j<ANIM.N;j++){const ph=((ANIM.t*.22+j/ANIM.N+h3(i,j,1))%1);a[k++]=s.x+Math.sin(ph*5+i)*ph*.8+ph*1.2;a[k++]=s.y+ph*6;a[k++]=s.z+Math.cos(ph*4+i)*ph*.6;}}
  ANIM.smoke.geometry.attributes.position.needsUpdate=true;}});
animRebuild();
// ---- the material records for the export (core/materials/record): every MAT key as one record, window._materials
(function(){const recs={};for(const k in MAT){const fam=NR_LIB[k],L=fam&&KMAT.mode==='lib'?KMAT.packed('noahs-regret',fam):null;
 recs[k]={id:'noahs-regret.'+k,family:k,scale:[TILE[k]||1,TILE[k]||1],tint:true,roughness:MAT[k].roughness===undefined?1:MAT[k].roughness,metal:MAT[k].metalness||0,
  specular:L?L.specular:.5,breakup:L?(L.breakup||null):null,lib:L?L.lib:null,doubleSided:MAT[k].side===THREE.DoubleSide,
  hook:[SV_CLOTH[k]?'cloth-flutter':null,'deck-cut',k==='glow'?'unlit flicker':null].filter(Boolean).join('+')||null,
  note:L?'library set, tint keep '+L.tint:'vertex colour only'};}
 KMAT.adapter('noahs-regret',recs);window._materials=KMAT.table('noahs-regret');})();
