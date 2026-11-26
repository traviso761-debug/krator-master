// ================================================================= HOST — build (riftrim's 89z, 2026-11-09)
// The order a world follows: the water's fields first (the flora reads the water's own numbers, so the surfaces exist before the first plant),
// then the trees (the neighbours' kin: 87-host-kin.js, every tree a record in GSTEP.TREES), then the kit's floor under them, then a station's own
// placement (Tallwalls' site record), then one bake. Greenstep grows no tree of its own, so there are no variants (riftrim's 86): the kin are
// drawn by the core's runtime LOD (merge, fade, cull) and their own far forms.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the flora, the ground's wet band and the audit. ?fields=0 for the old lines
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q.kind!=='ice'&&!q.seasonal)});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 30 m */
const WET_SHORE=(x,z)=>smooth(30,1,WATER_FN.shore(x,z));
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[0,6000],flow:60}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),.95*smooth(60,6,s)),0,1);};
 FIELD.flow=(x,z)=>{const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z)*smooth(-1,3,WATER_FN.shore(x,z)),smooth(48,7,d)),0,1);};}
{const m=GROUND,a=m.geometry.attributes.aGM,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setZ(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;window._dress=null;
const SHADOW_Q=new URLSearchParams(location.search).get('shadow');
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(typeof growKin==='function'){try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}}   /* the trees: the neighbours' species (87-host-kin.js) */
 try{window._biome=GSTEP.build({R:TERR.R-150,quality:q});}catch(e){reportErr('biome: '+e.stack);}
 /* THE EXPORT BOX (verify.py --assert, core/export "Profiles"): a 300 m cell holding a borrowed tree and the floor's items, the one nearest the LOD
    spine with water in it; a station names its own (LAND.exportBox) */
 if(!LAND.exportBox){let best=null,bd=1e9;const wet=(x,z)=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const px=x+i*70,pz=z+j*70;if(waterH(px,pz)>terrainH(px,pz))return true;}return false;};
  for(const r of REG){if(!r.label||r.label.indexOf('read in place')<0)continue;const d=BIO.lodD(r.x,r.z)+(RIVERS.length&&!wet(r.x,r.z)?1e5:0);if(d<bd){bd=d;best=r;}}
  if(best)LAND.exportBox=[Math.round(best.x-150),Math.round(best.z-150),Math.round(best.x+150),Math.round(best.z+150)];}
 if(LAND.build){try{window._station=LAND.build();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own records (Tallwalls' site) */
 /* an invisible anchor in each published site (as the rock bodies have, 45): a site is kept clear of flora, so the probe's registered-volume check
    finds this in it; the site's record is data for the settlement build, its volume where the settlement will stand */
 {const S=REG.filter(r=>r.kind==='site');if(S.length){const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),S.length),M4=new THREE.Matrix4();
  S.forEach((r,i)=>{M4.makeTranslation(r.x,(r.y||0)+Math.min(8,r.h/2),r.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='site anchors';A.frustumCulled=false;scene.add(A);}}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* R7; R5: the floor's cover takes the ground's colour at its root */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&!m.userData.cavern&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW: toggleable and OFF by default; core's panel button or ?shadow=1 turns it on, ?shadow=0 none of it) */
 if(typeof KSHADOW!=='undefined'&&KSHADOW.attach&&SHADOW_Q!=='0'){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(typeof FAR!=='undefined'&&FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  }catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground: its lowest point to its highest, on a 100 m lattice */
 {const R=LAND.region;if(R.y==null){let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}R.y=Math.floor(lo-10);R.h=Math.ceil(hi-lo+60);}REGISTER(R);}
})();
