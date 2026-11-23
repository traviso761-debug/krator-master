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
 const libTex=(fam,slot,rep)=>{const rx=rep?rep[0]:1,ry=rep?rep[1]:1,key='lib:'+fam+':'+slot+(rx!==1||ry!==1?':'+rx+','+ry:'');if(texBy.has(key))return texBy.get(key);
  const L=typeof KMAT!=='undefined'?KMAT.packed('longsong',fam):null;if(!L)return null;
  const r={id:'tex:longsong:'+fam+':'+slot+(rx!==1||ry!==1?'~'+texs.length:''),from:'library',pack:'longsong',family:fam,slot,lib:L.lib,wrap:['repeat','repeat'],repeat:[rx,ry],offset:[0,0],flipY:true};
  texs.push(r);texBy.set(key,r.id);return r.id;};
 const pngTex=t=>{if(!t)return null;const key='tex:'+t.uuid;if(texBy.has(key))return texBy.get(key);const p=png(t);
  const r={id:'tex:longsong:png'+texs.length,from:p?'png':'none',png:p?p.png:undefined,size:p?p.size:undefined,wrap:['clamp','clamp'],repeat:[1,1],offset:[0,0],flipY:t.flipY!==false};
  if(!p)r.error='no drawable image';texs.push(r);texBy.set(key,r.id);return r.id;};
 const matOf=(o,m)=>{const raw=o.name||'',isInt=raw.indexOf('interiors:')===0||!!(o.userData&&o.userData.interiors),key=raw.replace(/^(?:longsong|interiors):/,'')||null,vault=!!(o.userData&&o.userData.vault),shader=m.isShaderMaterial;
  const vAdd=vault&&shader&&m.blending===THREE.AdditiveBlending,vBand=!!(vAdd&&m.uniforms&&m.uniforms.uMap&&m.uniforms.uMap.value),vField=!!(vAdd&&!vBand&&m.uniforms&&m.uniforms.uCol&&m.uniforms.uCol.value);
  if(vBand||vField){const ak=vBand?'v-glyphband':'v-field',asig='add|'+ak;if(sig.has(asig))return sig.get(asig);
   const ar={id:'longsong:'+ak+'~'+mats.length,name:ak,family:vBand?'glyphband':ak,source:'longsong',kind:'basic',blending:'additive',
    colour:vBand?'#ff9e38':hex(m.uniforms.uCol.value),roughness:1,metal:0,specular:0,emissive:null,emissiveIntensity:1,
    doubleSided:true,transparent:true,opacity:vBand?1:.22,alphaTest:0,vertexColours:false,tint:true,unlit:true,hook:null,
    scale:[1,1],lib:null,breakup:null,normalScale:1,map:vBand?(libTex('glyphband','map',[3,1])||pngTex(m.uniforms.uMap.value)):null,normalMap:null,roughnessMap:null};
   mats.push(ar);sig.set(asig,ar.id);return ar.id;}
  const fam=vault?(VFAM[key]||null):(key&&typeof KMAT!=='undefined'&&KMAT.packed('longsong',key)?key:null);
  const s=[key,isInt,m.type,m.color?m.color.getHex():'',m.map?m.map.uuid:'',m.roughness,m.metalness,m.side,!!m.vertexColors,vault,m.transparent,m.opacity].join('|');if(sig.has(s))return sig.get(s);
  const L=fam&&typeof KMAT!=='undefined'?KMAT.packed('longsong',fam):null;
  const emI=m.emissiveIntensity==null?1:m.emissiveIntensity,rough=m.roughness==null?.9:m.roughness,metal=m.metalness==null?0:m.metalness,alphaT=m.alphaTest==null?0:m.alphaTest;
  const r={id:'longsong:'+(isInt?'interiors:':'')+(key||m.type)+'~'+mats.length,name:(isInt?'interiors:':'')+(key||m.type),family:fam||key||m.type,source:'longsong',kind:m.isMeshBasicMaterial?'basic':'standard',
   interior:isInt,
   colour:m.color?hex(m.color):'#ffffff',roughness:rough,metal:metal,specular:L&&L.specular!=null?L.specular:.5,
   emissive:m.emissive&&emI>0&&m.emissive.getHex()?hex(m.emissive):null,emissiveIntensity:emI,
   doubleSided:m.side===THREE.DoubleSide,transparent:!!m.transparent,opacity:m.opacity==null?1:m.opacity,alphaTest:alphaT,
   vertexColours:!!m.vertexColors||shader,tint:true,unlit:!!m.isMeshBasicMaterial,hook:L&&L.breakup?'breakup':null,
   scale:L?L.scale.slice():[1,1],lib:L?L.lib:null,breakup:L&&L.breakup?L.breakup:null,normalScale:m.normalScale?m.normalScale.x:1,
   map:L?libTex(fam,'map'):(!shader&&m.map?pngTex(m.map):null),normalMap:L&&L.normalMap?libTex(fam,'normalMap'):null,roughnessMap:L&&L.roughnessMap?libTex(fam,'roughnessMap'):null};
  if(shader){r.note='the depths\' own shader (66: lit by their lamps alone): exported plain, its vertex colours and its library family';drop('the depths\' shader, exported plain');}
  mats.push(r);sig.set(s,r.id);return r.id;};
 return {mats,texs,matOf,dropped,drop};}
let fullInteriors=false;
const RUGS={xanadu_common_rug:1,xanadu_court_carpet:1},CASES={xanadu_common_bookcase:1,xanadu_court_bookcase:1};
const s2l=v=>{const u=v/255;return u<=.04045?u/12.92:Math.pow((u+.055)/1.055,2.4);};
function packGeo(g){
 const f3=a=>{if(!a)return null;const k=a.normalized&&a.array instanceof Uint8Array?1/255:1;
  if(k===1&&a.array instanceof Float32Array&&!a.isInterleavedBufferAttribute)return a.array.slice(0,a.count*3);
  const o=new Float32Array(a.count*3);for(let i=0;i<a.count;i++){o[i*3]=a.getX(i)*k;o[i*3+1]=a.getY(i)*k;o[i*3+2]=a.getZ(i)*k;}return o;};
 const col3=a=>{if(!a)return null;const u8=a.normalized&&a.array instanceof Uint8Array;
  if(!u8&&a.array instanceof Float32Array&&!a.isInterleavedBufferAttribute)return a.array.slice(0,a.count*3);
  const o=new Float32Array(a.count*3);for(let i=0;i<a.count;i++){
   o[i*3]=u8?s2l(a.getX(i)):a.getX(i);o[i*3+1]=u8?s2l(a.getY(i)):a.getY(i);o[i*3+2]=u8?s2l(a.getZ(i)):a.getZ(i);}return o;};
 const f2=a=>{if(!a)return null;const k=a.normalized&&a.array instanceof Uint8Array?1/255:1;
  if(k===1&&a.array instanceof Float32Array&&!a.isInterleavedBufferAttribute)return a.array.slice(0,a.count*2);
  const o=new Float32Array(a.count*2);for(let i=0;i<a.count;i++){o[i*2]=a.getX(i)*k;o[i*2+1]=a.getY(i)*k;}return o;};
 const out={position:P(f3(g.attributes.position))};
 if(g.attributes.normal)out.normal=P(f3(g.attributes.normal));
 if(g.attributes.uv)out.uv=P(f2(g.attributes.uv));
 if(g.attributes.color)out.color=P(col3(g.attributes.color));
 if(g.index){const I=g.index.array,nv=g.attributes.position.count;
  out.index=P(nv<65535&&I instanceof Uint16Array?I.slice():nv<65535?Uint16Array.from(I):I instanceof Uint32Array?I.slice():Uint32Array.from(I));}
 return out;}
function assembleFurnItems(ctx,C,own,out){
 if(!fullInteriors||typeof LSIX==='undefined'||!LSIX.on||typeof KratorFurniture==='undefined'||typeof LSIXD==='undefined')return;
 const protos=new Map();
 for(const r of LS.ROOMS.list){
  if(!LSIXD.drawn(r))continue;
  const R=LSIX.record(r.id);if(!R)continue;
  const wb=Math.round((r.wealth==null?.5:r.wealth)*2)/2;
  for(const p of R.pieces){
   if(!r.outdoor&&(RUGS[p.key]||CASES[p.key]))continue;
   if(!ctx.inBox(p.x,p.z))continue;
   const v=p.v==null?0:p.v,pk=p.key+'|'+v+'|'+wb;
   let info=protos.get(pk);
   if(!info){info={key:p.key,v:v,wb:wb,seed:p.seed==null?1:p.seed,list:[]};protos.set(pk,info);}
   info.list.push({x:p.x,y:p.y,z:p.z,ry:p.ry==null?0:p.ry,own:own(p.x,p.y+.4,p.z)});}}
 for(const [pk,info] of protos){
  const bt=KratorFurniture.batch({indexed:true});
  bt.place(info.key,0,0,0,0,{variant:info.v,seed:info.seed,wealth:info.wb,setting:'indoor'});
  const grp=new THREE.Group();bt.flush(grp);
  const n=info.list.length,mats=new Float32Array(n*16),owners=new Array(n);
  for(let i=0;i<n;i++){const q=info.list[i],cs=Math.cos(q.ry),sn=Math.sin(q.ry),o=i*16;
   mats[o]=cs;mats[o+2]=-sn;mats[o+5]=1;mats[o+8]=sn;mats[o+10]=cs;mats[o+12]=q.x;mats[o+13]=q.y;mats[o+14]=q.z;mats[o+15]=1;owners[i]=q.own;}
  const packedM=P(mats),fmeta=KratorFurniture.get&&KratorFurniture.get(info.key),title=(fmeta&&fmeta.name)||info.key;
  let si=0;
  grp.traverse(sm=>{if(!sm.isMesh||!sm.geometry||!sm.geometry.attributes.position)return;
   const m0=Array.isArray(sm.material)?sm.material[0]:sm.material;if(!m0)return;
   const mid=C.matOf(sm,m0),gg=packGeo(sm.geometry),subNm=(sm.name||'part').replace(/^furniture:/,'');
   out.items.push({id:'longsong/furn:'+pk+':'+si,name:'furn/'+info.key+'~'+info.v+'~'+info.wb+'~'+si,kit:'furniture',
    label:title+' ('+subNm+')',material:mid,lod:null,count:n,dynamic:false,visible:true,owners:owners,geometry:gg,matrices:packedM,colours:null,extras:{}});
   si++;sm.geometry.dispose();});}}
// ---- the buckets: the plain meshes, one per material, triangles by centroid
function assemble(ctx){const C=collect(),own=owners(),T=KTAGS.page,box=ctx.box,inBox=ctx.inBox,out={items:[],buckets:[]};
 assembleFurnItems(ctx,C,own,out);
 scene.updateMatrixWorld(true);const meshes=[];scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)meshes.push(o);});
 const groups=new Map(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),nm=new THREE.Matrix3(),nv=new THREE.Vector3();
 for(const o of meshes){const u=o.userData||{};
  if(!(u.arch||u.vault||u.interiors||u.hamlet)||o.isInstancedMesh||lodCopy(o)||o.isSkinnedMesh)continue;
  if(u.interiors&&!o.visible){C.drop('an interiors floor not shown');continue;}
  const m0=Array.isArray(o.material)?o.material[0]:o.material;
  if(!m0||(m0.blending===THREE.AdditiveBlending&&!(u.vault&&m0.isShaderMaterial))){C.drop('additive');continue;}
  const g=o.geometry,Pp=g.attributes.position,I=g.index;if(!g.boundingBox)g.computeBoundingBox();
  const bb=g.boundingBox.clone().applyMatrix4(o.matrixWorld);if(box&&(bb.max.x<box[0]||bb.min.x>=box[2]||bb.max.z<box[1]||bb.min.z>=box[3]))continue;
  const W0=o.matrixWorld;nm.getNormalMatrix(W0);const tris=I?I.count/3:Pp.count/3,vi=t=>I?I.getX(t):t,kept=[];
  for(let t=0;t<tris;t++){a.fromBufferAttribute(Pp,vi(t*3)).applyMatrix4(W0);b.fromBufferAttribute(Pp,vi(t*3+1)).applyMatrix4(W0);c.fromBufferAttribute(Pp,vi(t*3+2)).applyMatrix4(W0);
   const cx=(a.x+b.x+c.x)/3,cz=(a.z+b.z+c.z)/3;if(inBox(cx,cz))kept.push(t,cx,(a.y+b.y+c.y)/3,cz);}
  if(!kept.length)continue;const mid=C.matOf(o,m0);
  const G=groups.get(mid)||(groups.set(mid,{pos:[],nor:[],uv:[],col:[],idx:[],hasUv:false,hasCol:false,meshes:0,src:0,owners:new Map(),names:new Set()}).get(mid));
  G.meshes++;G.src+=Pp.count;G.names.add(o.name||'?');const map=new Map(),N=g.attributes.normal,U=g.attributes.uv,Cc=g.attributes.color;if(U)G.hasUv=true;if(Cc)G.hasCol=true;
  const cu8=!!(Cc&&Cc.normalized&&Cc.array instanceof Uint8Array);
  for(let q=0;q<kept.length;q+=4){const t=kept[q],id=own(kept[q+1],kept[q+2],kept[q+3]);if(id)G.owners.set(id,(G.owners.get(id)||0)+1);
   for(let s=0;s<3;s++){const iv=vi(t*3+s);let j=map.get(iv);
    if(j===undefined){j=G.pos.length/3;map.set(iv,j);a.fromBufferAttribute(Pp,iv).applyMatrix4(W0);G.pos.push(a.x,a.y,a.z);
     if(N){nv.fromBufferAttribute(N,iv).applyMatrix3(nm).normalize();G.nor.push(nv.x,nv.y,nv.z);}else G.nor.push(0,1,0);
     G.uv.push(U?U.getX(iv):0,U?U.getY(iv):0);
     G.col.push(Cc?(cu8?s2l(Cc.getX(iv)):Cc.getX(iv)):1,Cc?(cu8?s2l(Cc.getY(iv)):Cc.getY(iv)):1,Cc?(cu8?s2l(Cc.getZ(iv)):Cc.getZ(iv)):1);}
    G.idx.push(j);}}}
 for(const [mid,G] of groups){const nvx=G.pos.length/3,ids=Array.from(G.owners.keys()).sort();
  const gg={position:P(new Float32Array(G.pos)),normal:P(new Float32Array(G.nor)),index:P(nvx<65535?Uint16Array.from(G.idx):Uint32Array.from(G.idx))};
  if(G.hasUv)gg.uv=P(new Float32Array(G.uv));if(G.hasCol)gg.color=P(new Float32Array(G.col));
  out.buckets.push({id:'longsong/bucket:'+mid.replace(/^longsong:/,''),name:mid.replace(/^longsong:/,''),kit:'longsong',label:Array.from(G.names).slice(0,8).join(', '),
   material:mid,lod:null,triangles:G.idx.length/3,geometry:gg,recordIds:ids,records:ids.map(id=>{const r=T&&T.get(id);return r?r.uid:null;}),
   compacted:box?{vertices:nvx,dropped:G.src-nvx}:null,
   pieces:{meshes:G.meshes,rule:'a triangle by its centroid (x0 <= x < x1, z0 <= z < z1); recordIds the volumes the centroids stand in',byRecord:Object.fromEntries(G.owners)}});}
 out.materials=C.mats;out.textures=C.texs;out.dropped=C.dropped;return out;}
function exportMetadata(){
 const R2=v=>Math.round(v*100)/100,views=[],addV=(label,kind,v,room)=>{if(!v||v.length<6)return;
  views.push({label,kind,eye:[R2(v[0]),R2(v[1]),R2(v[2])],target:[R2(v[3]),R2(v[4]),R2(v[5])],room:room||null});};
 const V=typeof VIEWS!=='undefined'?VIEWS:{};
 [['The White Palace from the avenue','monastery_ext'],['The Debate Court','monastery_ext'],
  ['The roof: the gilded roofs and the Hall of Hours','monastery_ext'],['The Garden of Held Water','monastery_ext'],
  ['The Hall of Forms (the School)','monastery_ext'],['The Printing House (a small Archive)','monastery_ext']].forEach(([k,kd])=>addV(k,kd,V[k]));
 [['Inside the Great Assembly Hall (the skylight columns)','wp.assembly'],['The Hall of the Founders (the chortens)','rp.k0.founders'],
  ['The Chapel of the Lost Monastery','rp.k0.lost-chapel'],['Archive Stacks I: the Peoples','rp.k2.stacks-peoples'],
  ['The Catalogue of the Archive','rp.k0.catalogue'],['A lecture hall of the School (the Cataclysm)','wp.k0.w.out.cataclysm'],
  ['A monk\'s cell','wp.k1.cells-w.a06'],['The Library\'s reading rooms','wp.k2.library'],['The refectory','wp.k1.refectory'],
  ['The Council of the Order','rp.k5.council.council'],['The Chronicle Hall','rp.k7.chronicle'],['The Hall of Hours (the clocks)','lr.hours']].forEach(([k,rm])=>addV(k,'interior',V[k],rm));
 {const pl=LS.ROOMS.byId['base.k-1.pillars'];if(pl)addV('The Hall of Pillars (40 painted lotus columns)','interior',[-22,pl.y+2,14.9,18,pl.y+1.6,14.9],pl.id);
  const sw=LS.ROOMS.byId['ward.hall-of-forms.slow-water'];if(sw)addV('The Room of Slow Water (held droplets)','interior',[sw.x0+1.4,sw.y+2.2,sw.z0+2.4,(sw.x0+sw.x1)/2,sw.y+1.5,(sw.z0+sw.z1)/2],sw.id);}
 [['Through the Warden\'s gate into the open vault','lv.wardens-gate'],['The open vault (the forbidden depths)','lv.open-vault'],
  ['Down the Long Stair\'s foot into the hall','lv.procrastinator'],['The Procrastinator','lv.procrastinator'],
  ['The Procrastinator from below','lv.procrastinator']].forEach(([k,rm])=>addV(k,'vault',V[k],rm));
 const rooms=[],tableRooms=[];
 LS.ROOMS.list.forEach(r=>{if(r.roof||r.furnish==='vault')return;
  tableRooms.push(r);
  if(r.outdoor)return;
  const drs=(r.doors||[]).map(d=>({to:d.to||d.room||null,out:!!d.out,x:R2(d.x),z:R2(d.z),w:R2(d.w==null?1.2:d.w)}));
  const o={id:r.id,vault:false,box:[R2(r.x0),R2(r.y),R2(r.z0),R2(r.x1),R2(r.y+r.h),R2(r.z1)],doors:drs};
  if(r.circle)o.circle=[R2(r.circle.x),R2(r.circle.z),R2(r.circle.r)];rooms.push(o);});
 if(typeof VAULT_ROOMS!=='undefined')VAULT_ROOMS.forEach(r=>{
  const vo={id:'lv.'+r.id,vault:true,shaft:!!r.shaft,box:[R2(r.x0),R2(r.y0),R2(r.z0),R2(r.x1),R2(r.y0+r.h),R2(r.z1)],doors:[]};
  rooms.push(vo);tableRooms.push(vo);});
 {const Q=LS.PROCRASTINATOR,po={id:'lv.procrastinator',vault:true,box:[R2(Q.x-Q.hallR),R2(Q.y0),R2(Q.z-Q.hallR),R2(Q.x+Q.hallR),R2(Q.y0+Q.hallH),R2(Q.z+Q.hallR)],circle:[R2(Q.x),R2(Q.z),R2(Q.hallR)],doors:[]};
  rooms.push(po);tableRooms.push(po);}
 const vlights=(typeof VLIGHTS!=='undefined'?VLIGHTS:[]).map(L=>{
  const mx=Math.max(L.c[0],L.c[1],L.c[2],.01),col=new THREE.Color(L.c[0]/mx,L.c[1]/mx,L.c[2]/mx).convertLinearToSRGB();
  return [R2(L.p[0]),R2(L.p[1]),R2(L.p[2]),'#'+col.getHexString(),R2(mx),R2(L.r)];});
 const lamps=[],wins=[],winSeen=new Set();
 LS.ROOMS.list.forEach(r=>{if(r.outdoor||r.roof||r.furnish==='vault')return;
  if(typeof LSIX!=='undefined'&&LSIX.on){const rec=LSIX.record(r.id);if(rec&&rec.lights)rec.lights.forEach(l=>lamps.push([R2(l[0]),R2(l[1]),R2(l[2]),R2(l[3]==null?1:l[3]),R2(l[4]==null?8:l[4]),r.id]));}
  if(typeof LSIXD!=='undefined'){LSIXD.windowsOf(r).forEach(w=>{const wx=w.x+w.nx*1.35,wz=w.z+w.nz*1.35,gk=r.id+':'+Math.round(wx/2.5)+','+Math.round(w.y/2)+','+Math.round(wz/2.5);
   if(!winSeen.has(gk)){winSeen.add(gk);wins.push([R2(wx),R2(w.y),R2(wz),r.id]);}});}});
 const room_table=typeof KROOMLIGHT!=='undefined'?KROOMLIGHT.buildTable({
  rooms:tableRooms,
  windowsOf:r=>(!r.vault&&!r.outdoor&&typeof LSIXD!=='undefined')?LSIXD.windowsOf(r):[],
  lampsOf:r=>(!r.vault&&!r.outdoor&&typeof LSIX!=='undefined'&&LSIX.on&&LSIX.record(r.id))?LSIX.record(r.id).lights:[]
 }):null;
 const ds=LS.VAULT[0];
 return {format:'krator-longsong-interiors',version:2,deep_stair:ds?[ds.x0,ds.z0,ds.x1,ds.z1]:null,views,rooms,room_table,lights:{vault:vlights,lamps,windows:wins}};}
const B=ctx=>ctx.memo('longsong',()=>assemble(ctx));
EXPORT.register('items',ctx=>B(ctx).items,BY);
EXPORT.register('buckets',ctx=>B(ctx).buckets,BY);
EXPORT.register('materials',ctx=>B(ctx).materials,BY);
EXPORT.register('textures',ctx=>B(ctx).textures,BY);
window.LONGSONG_EXPORT={
 prepareFullInteriors:()=>{fullInteriors=true;return typeof LSIXD!=='undefined'?LSIXD.buildShellsForExport():{floors:0};},
 metadata:exportMetadata,
 collect:ctx=>assemble(ctx||{box:null,inBox:()=>true})};
})();
