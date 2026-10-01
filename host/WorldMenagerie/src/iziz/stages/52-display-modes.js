// ---------- display modes: wireframe (edges or triangles) over solid, hidden lines or x-ray; clay; districts; hiding life ----------
// layers: 0 solid, 1 wire, 2 solid life, 3 wire life. Lights see every layer.
const DISPLAY={wire:'off',under:'solid',colour:'textured',life:true};
renderer.setClearColor(0x0d0b2e);
scene.traverse(o=>{let life=false;for(let q=o;q;q=q.parent)if(q.userData.life){life=true;break;}if(o.isLight)o.layers.mask=0xffffffff|0;else if(life)o.layers.set(2);});
const WIRE={built:false,items:[],inst:[]};
const WCOL={ground:0x5f7f5a,water:0x3d6fd0,structure:0xf2d9a8,city:0xe8a85a,veg:0x62d68a,life:0xff7ab8,light:0xffe36a};
const wireMats={};for(const k in WCOL)wireMats[k]=new THREE.MeshBasicMaterial({color:WCOL[k],wireframe:true});
const CITY_IMS=new Set([boxes,frusts,domes,tyrells,wedges,pents,hepts,gables,cornices,roofBits,strips,vigas,awnings,lights,neons]);
function isLifeObj(o){for(let q=o;q;q=q.parent)if(q.userData.life)return true;return false;}
function catOf(o){for(let q=o;q;q=q.parent)if(q.userData.cat)return q.userData.cat;if(isLifeObj(o))return 'life';if(CITY_IMS.has(o))return 'city';
  const m=o.material;if(m){if(m.isMeshBasicMaterial)return 'light';const t=m.userData&&m.userData.tex;if(t==='leaf'||t==='canopy'||t==='bark')return 'veg';}return 'structure';}
const edgeCache=new Map();
function edgeGeo(g){const key=g.userData.edgeOf||g.uuid;if(edgeCache.has(key))return edgeCache.get(key);const eg=new THREE.EdgesGeometry(g,20),a=eg.attributes.position.array;let e=null;
  if(a.length){const out=new Float32Array(a.length/6*9);for(let i=0,j=0;i<a.length;i+=6,j+=9){out[j]=a[i];out[j+1]=a[i+1];out[j+2]=a[i+2];out[j+3]=a[i+3];out[j+4]=a[i+4];out[j+5]=a[i+5];out[j+6]=a[i+3];out[j+7]=a[i+4];out[j+8]=a[i+5];}
    e=new THREE.BufferGeometry();e.setAttribute('position',new THREE.BufferAttribute(out,3));}   // each edge as a degenerate triangle, so wireframe mode draws just the edge
  eg.dispose();edgeCache.set(key,e);return e;}
function terrainLattice(step){const pts=[],S=TSEG+1,P=(i,j)=>{const k=j*S+i;return [TPOS.getX(k),TPOS.getY(k)+0.05,TPOS.getZ(k)];};
  for(let j=0;j<=TSEG;j+=step)for(let i=0;i<TSEG;i++){const a=P(i,j),b=P(i+1,j);pts.push(...a,...b,...b);}
  for(let i=0;i<=TSEG;i+=step)for(let j=0;j<TSEG;j++){const a=P(i,j),b=P(i,j+1);pts.push(...a,...b,...b);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return g;}
function buildWire(){const list=[];scene.traverse(o=>{if(o.isMesh&&!o.userData.isWire&&!o.userData.noWire&&o!==sky&&!(o.material&&o.material.blending===THREE.AdditiveBlending))list.push(o);});
  for(const o of list){const cat=o===terrainMesh?'ground':catOf(o),life=isLifeObj(o),eg=o===terrainMesh?terrainLattice(3):(edgeGeo(o.geometry)||o.geometry);
    let w;if(o.isInstancedMesh){w=new THREE.InstancedMesh(eg,wireMats[cat],o.instanceMatrix.array.length/16);w.instanceMatrix=o.instanceMatrix;w.count=o.count;w.frustumCulled=false;WIRE.inst.push([w,o]);}
    else{w=new THREE.Mesh(eg,wireMats[cat]);w.frustumCulled=o.frustumCulled;}
    w.userData.isWire=true;w.userData.geo={edges:eg,tris:o.geometry};w.layers.set(life?3:1);w.castShadow=w.receiveShadow=false;o.add(w);WIRE.items.push(w);}
  WIRE.built=true;}
animHooks.push(()=>{if(DISPLAY.wire==='off')return;for(const [w,o] of WIRE.inst)w.count=o.count;});
// clay and districts swap materials; the originals are kept on each mesh
let SOLIDS=null;const matState=new Map(),clayCache={};
function splitMixed(){const use=new Map();scene.traverse(o=>{if(!o.isInstancedMesh||o.userData.isWire)return;let u=use.get(o.material);if(!u){u={c:[],n:[]};use.set(o.material,u);}(o.instanceColor?u.c:u.n).push(o);});
  let n=0;for(const [m,u] of use){if(!u.c.length||!u.n.length)continue;const alt=m.clone(),k=m.customProgramCacheKey.bind(m);alt.customProgramCacheKey=()=>k()+'|nocol';for(const o of u.n)o.material=alt;n++;}
  return n;}
ctx.splitMaterials=splitMixed();
function collectSolids(){SOLIDS=[];scene.traverse(o=>{if(o.isMesh&&!o.userData.isWire&&o!==sky){o.userData.mat0=o.material;SOLIDS.push(o);}});}
// r128 keeps one compiled program per material and does not notice when a shared material moves between instanced meshes with and without
// per-instance colours, so coloured and uncoloured meshes always get separate materials
function clayFor(m,kind,coloured){const side=m.side||THREE.FrontSide,key=kind+side+(coloured?'c':'n');if(clayCache[key])return clayCache[key];
  const c=new THREE.MeshLambertMaterial({color:kind==='gray'?0x9d978e:kind==='dist'?0xffffff:0xd9d2c5,side});setEnv(c,{id:'clay'+key});
  if(kind!=='dist'){const f=c.onBeforeCompile;c.onBeforeCompile=sh=>{f(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','');};}   // ignore instance colours
  clayCache[key]=c;return c;}
const isFxMesh=o=>{const m=o.userData.mat0;return o.userData.noWire||(m&&(m.alphaTest>0||m.blending===THREE.AdditiveBlending));};
function touch(m){if(!matState.has(m))matState.set(m,{cw:m.colorWrite,po:m.polygonOffset,pf:m.polygonOffsetFactor,pu:m.polygonOffsetUnits});}
function applyDisplay(){
  if(!SOLIDS)collectSolids();
  const wireOn=DISPLAY.wire!=='off',plain=DISPLAY.colour!=='textured';
  if(wireOn&&!WIRE.built)buildWire();
  for(const w of WIRE.items)w.geometry=DISPLAY.wire==='triangles'?w.userData.geo.tris:w.userData.geo.edges;
  // colour mode
  for(const o of SOLIDS){const m0=o.userData.mat0;
    if(o.userData.fxHidden!==undefined){o.visible=o.userData.fxHidden;delete o.userData.fxHidden;}
    if(!plain){o.material=m0;continue;}
    if(isFxMesh(o)){o.userData.fxHidden=o.visible;o.visible=false;continue;}
    const col=!!(o.isInstancedMesh&&o.instanceColor);
    if(DISPLAY.colour==='clay')o.material=clayFor(m0,'clay',col);
    else o.material=o.userData.dcol&&col?clayFor(m0,'dist',true):clayFor(m0,'gray',col);}
  for(const o of SOLIDS){const d=o.userData.dcol;if(!d||!o.instanceColor)continue;const want=DISPLAY.colour==='districts';
    if(want&&!o.userData.icol0){o.userData.icol0=o.instanceColor.array.slice();o.instanceColor.array.set(d.subarray(0,o.instanceColor.array.length));o.instanceColor.needsUpdate=true;}
    else if(!want&&o.userData.icol0){o.instanceColor.array.set(o.userData.icol0);delete o.userData.icol0;o.instanceColor.needsUpdate=true;}}
  // what sits beneath the lines
  const used=new Set();for(const o of SOLIDS)used.add(o.material);
  for(const [m,st] of matState){m.colorWrite=st.cw;m.polygonOffset=st.po;m.polygonOffsetFactor=st.pf;m.polygonOffsetUnits=st.pu;}
  if(wireOn)for(const m of used){touch(m);if(!m.polygonOffset){m.polygonOffset=true;m.polygonOffsetFactor=1;m.polygonOffsetUnits=1;}if(DISPLAY.under==='hidden')m.colorWrite=false;}
  let mask=0;const solid=!wireOn||DISPLAY.under!=='xray';
  if(solid)mask|=1;if(wireOn)mask|=2;if(DISPLAY.life){if(solid)mask|=4;if(wireOn)mask|=8;}
  camera.layers.mask=mask;sun.shadow.camera.layers.mask=mask|1;
  const fxOn=!(wireOn&&DISPLAY.under!=='solid'),lit=fxOn&&!plain,FXP=(ctx.fx||{}).particles||{};
  sky.visible=fxOn;sunSprite.visible=sunSprite.visible&&fxOn;ctx.skyAllowed=fxOn;CONST.grp.visible=fxOn;moonSprite.visible=fxOn;
  if(ctx.fx&&ctx.fx.glow)ctx.fx.glow.visible=lit;
  for(const k of ['smoke','mist','fireflies'])if(FXP[k])FXP[k].visible=lit;
  FXP.rainOff=!fxOn;
  if(ctx.frCab)ctx.frCab.visible=DISPLAY.life;
  document.getElementById('legend').classList.toggle('on',DISPLAY.colour==='districts');
}
ctx.display=DISPLAY;ctx.applyDisplay=applyDisplay;ctx._setView=(...a)=>setView(...a);ctx.wire=WIRE;ctx.weather=WEATHER;ctx.env=ENV;
