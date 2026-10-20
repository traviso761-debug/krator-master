// ================================================================= LONGSONG — its part of core/export (Godot)
// [web] core/export/README.md ("Iziz" is the template; settlements/iziz/targets/city/94-city-export.js): the page's own
// meshes in the krator-world container, beside the biome core's flora (items), its ground (terrain: sampled from the
// page's terrainH, 45) and stage (KSTAGE), and the registry (core/tags, every REGISTER). Runs at export time
// only (EXPORT.world): nothing is drawn or changed; it reads the three.js scene.
//   buckets    the plain meshes (ARCH's merged meshes: the palaces, the ward, the stair, the depths, the culture marks; the
//              villages' Xanadu kit buildings merged by material, 85h; the interiors' floors when they are built), one
//              bucket per material: the triangles whose centroid lies in the box, in world space; `recordIds` the
//              registered volumes their centroids stand in (compacted as EXPORT.compact does: only the vertices the kept triangles use; `compacted` counts them)
//   materials  one per material: colour, roughness, metal, the library family it draws (Longsong's pack: tex/pack.json,
//              its maps by reference), vertex colours; the depths' own shader (lit by their lamps alone, 66) is exported
//              plain with its family and a note (Godot has no twin of it yet: KNOWN_ISSUES.md)
//   textures   a library map by reference to Longsong's pack, a canvas map (the marks' banners and signs) as a PNG
// The ward and the depths need neither core/city nor core/terrain's cavern for this (the owner, 2026-10-20: exempt when
// the export carries them): the buildings are the plan's records drawn as meshes, the depths closed rooms under the rock.
(function(){
'use strict';
if(typeof EXPORT==='undefined')return;
const BY={by:'longsong'},P=a=>EXPORT.pack(a),hex=c=>'#'+c.getHexString();
const lodCopy=o=>{for(let p=o;p;p=p.parent)if(p.userData&&p.userData.lodCopy)return true;return false;};
// the depths' keys (66: ARCH 'v-*') to the library family each takes
const VFAM={'v-stone':'vault','v-paving':'paving','v-wood':'wood','v-gilt':'gilt','v-lead':'lead','v-mandala':'mandala'};
// ---- owners: the registered volumes on a 40 m hash (REG: x, z, r, y to y + h, 1 m slack; flora and life are not owners)
function owners(){const H=new Map(),C=40;
 for(const r of REG){if(!REG_ID.has(r)||!r.cls||r.cls==='flora'||r.cls==='life')continue;
  const v={id:REG_ID.get(r),x:r.x,z:r.z,r:Math.max(r.r||0,.5),y0:(r.y||0)-1,y1:(r.y||0)+(r.h||0)+1};
  for(let i=Math.floor((v.x-v.r)/C);i<=Math.floor((v.x+v.r)/C);i++)for(let j=Math.floor((v.z-v.r)/C);j<=Math.floor((v.z+v.r)/C);j++){const k=i+','+j;(H.get(k)||H.set(k,[]).get(k)).push(v);}}
 return (x,y,z)=>{const L=H.get(Math.floor(x/C)+','+Math.floor(z/C));if(!L)return null;let best=null;
  for(const v of L){const dx=x-v.x,dz=z-v.z;if(dx*dx+dz*dz<=v.r*v.r&&y>=v.y0&&y<=v.y1&&(!best||v.r<best.r))best=v;}return best?best.id:null;};}
// ---- materials and textures
function collect(){const mats=[],texs=[],sig=new Map(),texBy=new Map(),dropped={};const drop=k=>{dropped[k]=(dropped[k]||0)+1;};
 const png=t=>{const im=t&&t.image;if(!im)return null;try{const w=im.width,h=im.height;if(!w||!h)return null;const s=Math.min(1,512/Math.max(w,h)),cv=document.createElement('canvas');
   cv.width=Math.max(1,Math.round(w*s));cv.height=Math.max(1,Math.round(h*s));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);return {png:cv.toDataURL('image/png'),size:[cv.width,cv.height]};}catch(e){return null;}};
 const libTex=(fam,slot)=>{const key='lib:'+fam+':'+slot;if(texBy.has(key))return texBy.get(key);
  const L=typeof KMAT!=='undefined'?KMAT.packed('longsong',fam):null;if(!L)return null;
  const r={id:'tex:longsong:'+fam+':'+slot,from:'library',pack:'longsong',family:fam,slot,lib:L.lib,wrap:['repeat','repeat'],repeat:[1,1],offset:[0,0],flipY:true};
  texs.push(r);texBy.set(key,r.id);return r.id;};
 const pngTex=t=>{if(!t)return null;const key='tex:'+t.uuid;if(texBy.has(key))return texBy.get(key);const p=png(t);
  const r={id:'tex:longsong:png'+texs.length,from:p?'png':'none',png:p?p.png:undefined,size:p?p.size:undefined,wrap:['clamp','clamp'],repeat:[1,1],offset:[0,0],flipY:t.flipY!==false};
  if(!p)r.error='no drawable image';texs.push(r);texBy.set(key,r.id);return r.id;};
 const matOf=(o,m)=>{const key=(o.name||'').replace(/^longsong:/,'')||null,vault=!!(o.userData&&o.userData.vault),shader=m.isShaderMaterial;
  const fam=vault?(VFAM[key]||null):(key&&typeof KMAT!=='undefined'&&KMAT.packed('longsong',key)?key:null);
  const s=[key,m.type,m.color?m.color.getHex():'',m.map?m.map.uuid:'',m.roughness,m.metalness,m.side,!!m.vertexColors,vault].join('|');if(sig.has(s))return sig.get(s);
  const L=fam&&typeof KMAT!=='undefined'?KMAT.packed('longsong',fam):null;
  const r={id:'longsong:'+(key||m.type)+'~'+mats.length,name:key||m.type,family:fam||key||m.type,source:'longsong',kind:m.isMeshBasicMaterial?'basic':'standard',
   colour:m.color?hex(m.color):'#ffffff',roughness:m.roughness==null?.9:m.roughness,metal:m.metalness||0,specular:L&&L.specular!=null?L.specular:.5,
   emissive:m.emissive&&m.emissiveIntensity>0&&m.emissive.getHex()?hex(m.emissive):null,emissiveIntensity:m.emissiveIntensity||0,
   doubleSided:m.side===THREE.DoubleSide,transparent:!!m.transparent,opacity:m.opacity==null?1:m.opacity,alphaTest:m.alphaTest||0,
   vertexColours:!!m.vertexColors||shader,tint:true,unlit:!!m.isMeshBasicMaterial,hook:L&&L.breakup?'breakup':null,
   scale:L?L.scale.slice():[1,1],lib:L?L.lib:null,breakup:L&&L.breakup?L.breakup:null,normalScale:m.normalScale?m.normalScale.x:1,
   map:L?libTex(fam,'map'):(!shader&&m.map?pngTex(m.map):null),normalMap:L&&L.normalMap?libTex(fam,'normalMap'):null,roughnessMap:L&&L.roughnessMap?libTex(fam,'roughnessMap'):null};
  if(shader){r.note='the depths\' own shader (66: lit by their lamps alone): exported plain, its vertex colours and its library family';drop('the depths\' shader, exported plain');}
  mats.push(r);sig.set(s,r.id);return r.id;};
 return {mats,texs,matOf,dropped,drop};}
// ---- the buckets: the plain meshes, one per material, triangles by centroid
function assemble(ctx){const C=collect(),own=owners(),T=KTAGS.page,box=ctx.box,inBox=ctx.inBox,out={buckets:[]};
 scene.updateMatrixWorld(true);const meshes=[];scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)meshes.push(o);});
 const groups=new Map(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),nm=new THREE.Matrix3(),nv=new THREE.Vector3();
 for(const o of meshes){const u=o.userData||{};
  if(!(u.arch||u.vault||u.interiors||u.hamlet)||o.isInstancedMesh||lodCopy(o)||o.isSkinnedMesh)continue;
  if(u.interiors&&!o.visible){C.drop('an interiors floor not shown');continue;}
  const m0=Array.isArray(o.material)?o.material[0]:o.material;if(!m0||m0.blending===THREE.AdditiveBlending){C.drop('additive');continue;}
  const g=o.geometry,Pp=g.attributes.position,I=g.index;if(!g.boundingBox)g.computeBoundingBox();
  const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);if(box&&(bb.max.x<box[0]||bb.min.x>=box[2]||bb.max.z<box[1]||bb.min.z>=box[3]))continue;
  const W0=o.matrixWorld;nm.getNormalMatrix(W0);const tris=I?I.count/3:Pp.count/3,vi=t=>I?I.getX(t):t,kept=[];
  for(let t=0;t<tris;t++){a.fromBufferAttribute(Pp,vi(t*3)).applyMatrix4(W0);b.fromBufferAttribute(Pp,vi(t*3+1)).applyMatrix4(W0);c.fromBufferAttribute(Pp,vi(t*3+2)).applyMatrix4(W0);
   const cx=(a.x+b.x+c.x)/3,cz=(a.z+b.z+c.z)/3;if(inBox(cx,cz))kept.push(t,cx,(a.y+b.y+c.y)/3,cz);}
  if(!kept.length)continue;const mid=C.matOf(o,m0);
  const G=groups.get(mid)||(groups.set(mid,{pos:[],nor:[],uv:[],col:[],idx:[],hasUv:false,hasCol:false,meshes:0,src:0,owners:new Map(),names:new Set()}).get(mid));
  G.meshes++;G.src+=Pp.count;G.names.add(o.name||'?');const map=new Map(),N=g.attributes.normal,U=g.attributes.uv,Cc=g.attributes.color;if(U)G.hasUv=true;if(Cc)G.hasCol=true;
  for(let q=0;q<kept.length;q+=4){const t=kept[q],id=own(kept[q+1],kept[q+2],kept[q+3]);if(id)G.owners.set(id,(G.owners.get(id)||0)+1);
   for(let s=0;s<3;s++){const iv=vi(t*3+s);let j=map.get(iv);
    if(j===undefined){j=G.pos.length/3;map.set(iv,j);a.fromBufferAttribute(Pp,iv).applyMatrix4(W0);G.pos.push(a.x,a.y,a.z);
     if(N){nv.fromBufferAttribute(N,iv).applyMatrix3(nm).normalize();G.nor.push(nv.x,nv.y,nv.z);}else G.nor.push(0,1,0);
     G.uv.push(U?U.getX(iv):0,U?U.getY(iv):0);G.col.push(Cc?Cc.getX(iv):1,Cc?Cc.getY(iv):1,Cc?Cc.getZ(iv):1);}
    G.idx.push(j);}}}
 for(const [mid,G] of groups){const nvx=G.pos.length/3,ids=Array.from(G.owners.keys()).sort();
  const gg={position:P(new Float32Array(G.pos)),normal:P(new Float32Array(G.nor)),index:P(nvx<65535?Uint16Array.from(G.idx):Uint32Array.from(G.idx))};
  if(G.hasUv)gg.uv=P(new Float32Array(G.uv));if(G.hasCol)gg.color=P(new Float32Array(G.col));
  out.buckets.push({id:'longsong/bucket:'+mid.replace(/^longsong:/,''),name:mid.replace(/^longsong:/,''),kit:'longsong',label:Array.from(G.names).slice(0,8).join(', '),
   material:mid,lod:null,triangles:G.idx.length/3,geometry:gg,recordIds:ids,records:ids.map(id=>{const r=T&&T.get(id);return r?r.uid:null;}),
   compacted:box?{vertices:nvx,dropped:G.src-nvx}:null,
   pieces:{meshes:G.meshes,rule:'a triangle by its centroid (x0 <= x < x1, z0 <= z < z1); recordIds the volumes the centroids stand in',byRecord:Object.fromEntries(G.owners)}});}
 out.materials=C.mats;out.textures=C.texs;out.dropped=C.dropped;return out;}
const B=ctx=>ctx.memo('longsong',()=>assemble(ctx));
EXPORT.register('buckets',ctx=>B(ctx).buckets,BY);
EXPORT.register('materials',ctx=>B(ctx).materials,BY);
EXPORT.register('textures',ctx=>B(ctx).textures,BY);
window.LONGSONG_EXPORT={collect:ctx=>assemble(ctx||{box:null,inBox:()=>true})};
})();
