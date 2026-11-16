// ================================================================= HOST — ground and water
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('xanadu',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// One ground mesh painted by the map's classes and the field cache, a tiled
// detail texture for the grain, and the cliffs' strata drawn in the shader by
// world height (a top-down paint cannot show a cliff face's banding): the
// rock here is the colour of petrified wood, ochre, rust, violet-grey and
// cream, and so is the wood of the Vale's trees. The lake is a plane at y=0;
// the sacred river is its own ribbon following the descending bed, with foam
// where it drops.
const LAKECOL=new THREE.Color().setHSL(XANADU_LAKE.hue,.55,.45);
const TEX_GROUND=BIO.canvasTex(2048,2048,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0;
 const c=new THREE.Color(),t=new THREE.Color();
 const MEAD=new THREE.Color(0x6e8c3c),MEAD2=new THREE.Color(0x86984a),GOLD=new THREE.Color(0xb0a058),LUSH=new THREE.Color(0x4e7a36),
  LIT=new THREE.Color(0x4a3c28),LIT2=new THREE.Color(0x6a4a2c),MOSS=new THREE.Color(0x45662e),
  SAND=new THREE.Color(0xc8bc98),PEB=new THREE.Color(0xa8a494),
  ROSSA=new THREE.Color(0x9a5a3a),ROSSA2=new THREE.Color(0xb07048),LIME=new THREE.Color(0xcfc4a6),SCRUB=new THREE.Color(0x7a8050),
  ROCK=new THREE.Color(0x8a8078),ROCK2=new THREE.Color(0x6e6670),ROCK3=new THREE.Color(0xa89880),SCREE=new THREE.Color(0xb4aca0),SNOW=new THREE.Color(0xe8ecf0),
  GRAV=new THREE.Color(0xbab2a2),SILT=new THREE.Color(0x8a8a6a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=TERR.X0+(x+.5)/w*SX,wz=TERR.Z0+(y+.5)/h*SZ;
  const n=(BIO.fn.h3(x,y,3)-.5),n3=fbm(wx*.004,wz*.004,4.1,2)-.5;
  const wet=FC.at(FC.a.wet,wx,wz),up=FC.at(FC.a.up,wx,wz),mist=FC.at(FC.a.mist,wx,wz),flow=FC.at(FC.a.flow,wx,wz),sd=FC.at(FC.a.sd,wx,wz),sl=FC.at(FC.a.slope,wx,wz),hh=FC.at(FC.a.h,wx,wz);
  // the vale: meadow, going gold where it is drier, lush by the water
  c.copy(MEAD).lerp(MEAD2,clamp(.5+n3*2.2,0,1)).lerp(GOLD,smooth(.62,.46,wet)*.75).lerp(LUSH,smooth(.72,.9,wet)*.6);
  // flower drifts in the vale's glades, painted so the meadow reads as a riot from afar
  {const fd=smooth(.55,.7,fbm(wx*.011-5,wz*.011+2,3131,2))*smooth(.2,.08,up)*smooth(.8,.6,wet)*smooth(20,80,sd);
   if(fd>0&&BIO.fn.h3(x,y,11)<.35){const hh2=BIO.fn.h3(x>>2,y>>2,12);t.setHSL(hh2,.75,.62);c.lerp(t,fd*.28);}}
  // the forested flanks: litter and moss under the canopy
  const fk=smooth(.64,.78,wet)*smooth(.3,.12,up)*smooth(0,120,sd)*smooth(.2,.55,fbm(wx*.0026+2,wz*.0026-5,93,2)+.2);
  t.copy(LIT).lerp(LIT2,clamp(.5+n3*2,0,1)).lerp(MOSS,smooth(.8,.95,wet)*.5);c.lerp(t,fk*.8);
  // the uplands: terra rossa, limestone and olive scrub
  const bk=smooth(.18,.36,up)*smooth(.8,.6,up);
  t.copy(ROSSA).lerp(ROSSA2,clamp(.5+n3*2,0,1)).lerp(LIME,smooth(.56,.7,fbm(wx*.009,wz*.009,7,2))*.8).lerp(SCRUB,smooth(.4,.65,fbm(wx*.006+3,wz*.006,8,2))*.45);
  c.lerp(t,bk);
  // the cliffs and the mountains: rock, scree, a little snow on the high tops
  const rk=Math.max(smooth(.55,.8,up),smooth(.7,1.2,sl)*smooth(.1,.3,up));
  t.copy(ROCK).lerp(ROCK2,clamp(.5+n3*2.4,0,1)).lerp(ROCK3,smooth(.55,.7,fbm(wx*.011,wz*.004,9,2))).lerp(SCREE,smooth(.5,.3,sl)*smooth(.8,1,up)*.5);
  c.lerp(t,rk);c.lerp(SNOW,smooth(LAND.snowH,LAND.snowH+100,hh+40*n3)*smooth(.9,.5,sl)*.85);
  // the mist: moss on everything
  c.lerp(MOSS,mist*smooth(.9,.5,sl)*.55);
  // the shore and the river banks
  c.lerp(SAND.clone().lerp(PEB,clamp(.5+n3*3,0,1)),smooth(70,6,sd)*smooth(-8,4,sd)*.85);
  c.lerp(SILT,smooth(0,-20,sd));
  c.lerp(GRAV,smooth(.55,.95,flow)*.75);
  const k=1+n*.08;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// THE GROUND ON KGROUND (core/terrain 43; BACKPORT.md's ground row, the final rebuild 2026-11-03): the library's four sets (materials.json ground.shore,
// ground.pebble, ground.gravel, rock.marble; 2026-10-19) hex-tiled, scaled with distance and blended by height over the painted ground, in place of the
// page's own two-tile mix. Each weight is a DOCUMENTED MASK of a vertex (the checklist's line: "ground layers driven by documented masks"):
//   aGL.x  shore sand      the lake's beach band: LAND.sd within 6-70 m of the shore, less the pebble patches
//   aGL.y  shore pebbles   the same band where a 1/80 m noise puts the pale stones
//   aGL.z  river gravel    the river's bed and bars: the flow field over .55 (FIELD.flow; 89z moves it onto WATER.fieldAt's flow distance)
//   aGL.w  marble          the high crags: upland over .6, and on the cliffs the hard beds of the strata (KSTRATA's hardness, below)
//   aGM.x  exposed rock    BIO.ENV's slope band [.6, 1.2] (the strata's shader share)
//   aGM.y  the wet band    the water's own shore (WATER.fieldAt, filled by 89z): 1 at the edge, gone by 40 m; it darkens the ground
// Standard under KGROUND (roughness high, as dry ground is), so the rain's gloss and the puddles show; ?kground=0 for the old floor and its two-tile mix.
const USE_KG=typeof KGROUND!=='undefined'&&XQ_ON('kground');
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=n=>KMAT.packed('xanadu',n);
 const a=P('ground.shore'),b=P('ground.pebble'),c=P('ground.gravel'),d=P('rock.marble');if(!a||!b||!c||!d)return null;
 const T=x=>KMAT.textures(x,{aniso:8}).map;
 return{shore:T(a),shoreK:1/a.scale[0],peb:T(b),pebK:1/b.scale[0],grav:T(c),gravK:1/c.scale[0],marb:T(d),marbK:1/d.scale[0],marbM:Math.pow(d.tint&&d.tint.mean!=null?d.tint.mean:.7,2.2)};})();
const OLDLAY=USE_KG?null:GLAY;
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0x9a9890,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};if(GLAY)sh.uniforms.uLMarb={value:GLAY.marb};if(OLDLAY){sh.uniforms.uLShore={value:GLAY.shore};sh.uniforms.uLPeb={value:GLAY.peb};sh.uniforms.uLGrav={value:GLAY.grav};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute vec2 aGM;varying vec2 vGM;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGM=aGM;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying vec2 vGM;'+(GLAY?'uniform sampler2D uLMarb;':'')+(OLDLAY?'uniform sampler2D uLShore,uLPeb,uLGrav;':''))
  .replace('#include <map_fragment>',['#include <map_fragment>',
   '{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);',
   // ?kground=0: the page's old mix of the shore sand, pebbles and the river's cobbles (each on two tiles, one turned, blended by a slow wave)
   OLDLAY?['{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(-0.3,0.3,sin(p.x*0.017+2.0*sin(p.y*0.011))*sin(p.y*0.013+1.3));',
    'vec3 ts=mix(pow(texture2D(uLShore,p*'+GLAY.shoreK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uLShore,q*'+(GLAY.shoreK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);',
    'vec3 tp=mix(pow(texture2D(uLPeb,p*'+GLAY.pebK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uLPeb,q*'+(GLAY.pebK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);',
    'vec3 tg=mix(pow(texture2D(uLGrav,p*'+GLAY.gravK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uLGrav,q*'+(GLAY.gravK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);',
    'diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,diffuse*ts*1.3,0.8),vGL.x);diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,diffuse*tp*1.3,0.8),vGL.y);',
    'diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,diffuse*tg*1.3,0.8),vGL.z);}'].join('\n'):'',
   '/*KGROUND*/',
   // the strata: bands by height, wandering a little, in the petrified palette (the map is sRGB-decoded, so these are linear); the kit's own GLSL bands,
   // kept over KSTRATA's shade (no texture: the page is at the 16-unit limit with the rain cover, the horizon and the shadow map)
   ' float steep=1.0-clamp(vGWN.y,0.0,1.0); float y=vGWP.y+6.0*sin(vGWP.x*0.004+vGWP.z*0.003)+2.0*sin(vGWP.x*0.031);',
   ' float b1=0.5+0.5*sin(y*0.21), b2=smoothstep(0.6,0.95,sin(y*0.07+1.3)), b3=smoothstep(0.75,1.0,sin(y*0.13+vGWP.x*0.001));',
   ' vec3 st=mix(vec3(0.30,0.24,0.20),vec3(0.42,0.26,0.14),b1); st=mix(st,vec3(0.24,0.20,0.28),b2*0.8); st=mix(st,vec3(0.55,0.49,0.38),b3*0.7);',
   ' st*=0.85+0.3*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r;',
   // the marble on the high crags: its veining is the relief of the strata's colour (faces by their height, flats by the ground plane)
   GLAY?' {vec3 mb=pow(texture2D(uLMarb,mix(vGWP.xz,vec2(vGWP.x+vGWP.z*0.7,vGWP.y),smoothstep(0.3,0.7,steep))*'+GLAY.marbK.toFixed(4)+').rgb,vec3(2.2))/'+GLAY.marbM.toFixed(4)+';st*=mix(vec3(1.0),mb,vGL.w);}':'',
   ' diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,st,0.30+0.25*texture2D(uDetail,vGWP.xz*0.004).r),max(smoothstep(0.45,0.8,steep),vGM.x*0.6));',
   ' diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vGM.y*0.8);}'].join('\n'));};
// THE RELIEF (KGROUND's opt-in relief, core/terrain/GROUND.md; the ground catch-up 2026-11-04): the layers' height bumps the lit normal near the eye,
// the low of it and the mesh's hollows (aKGAO, KGROUND.cavityMesh on the mesh below) lose sky light. No side planes (tri): ?relief=0 none
const KG_REL=XQ_ON('relief')?{bump:.075,cavity:.8,mesh:1}:null;
if(USE_KG&&GLAY)KGROUND.hook(MAT_GROUND,{key:'xanadu-ground',at:'/*KGROUND*/',relief:KG_REL,layers:[KGROUND.layer('xanadu','ground.shore',{w:'vGL.x',amt:.8,gain:1.3,tint:'diffuse'}),
 KGROUND.layer('xanadu','ground.pebble',{w:'vGL.y',amt:.8,gain:1.3,tint:'diffuse'}),
 KGROUND.layer('xanadu','ground.gravel',{w:'vGL.z',amt:.75,gain:1.3,tint:'diffuse'})]});
/* THE BEDDED ROCK AS DATA (core/terrain 35, KSTRATA; BACKPORT.md xanadu's row "strata"): the cliffs' petrified-wood beds as a stack the placement reads
   (the checklist's line: "strata and scour feed placement"): a hard bed stands as a ledge the crag plants root on (XANADU's crag zone, 87-host-ledges.js),
   a soft one sheds talus at the cliff's foot (KRELIEF.talus there). The look stays the kit's GLSL bands above, which run on the same 0.21 / 0.07 / 0.13
   wavelengths as these beds' thickness. ?strata=0: no ledges, no talus */
const STRATA=(typeof KSTRATA!=='undefined'&&XQ_ON('strata'))?KSTRATA.create({seed:2311,formations:[{recipe:'canyon',tint:[1.05,.86,.72]}],range:[-60,1400],dip:[.6,.8,.004],warp:[6,2]}):null;
(function(){const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,NXg=700,NZg=660,g=new THREE.PlaneGeometry(SX,SZ,NXg,NZg);g.rotateX(-Math.PI/2);g.translate((TERR.X0+TERR.X1)/2,0,(TERR.Z0+TERR.Z1)/2);
 const p=g.attributes.position,lay=new Float32Array(p.count*4),gm=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=terrainH(x,z);p.setY(i,h);
  // the documented masks above
  const sd=FC.at(FC.a.sd,x,z),shore=smooth(70,6,sd)*smooth(-8,4,sd),peb=smooth(.42,.62,fbm(x*.012+4,z*.012-1,617,2)),sl=FC.at(FC.a.slope,x,z);
  lay[i*4]=shore*(1-peb);lay[i*4+1]=shore*peb;lay[i*4+2]=smooth(.55,.95,FC.at(FC.a.flow,x,z));
  lay[i*4+3]=Math.max(smooth(.6,.88,FC.at(FC.a.up,x,z)),STRATA&&sl>.6?smooth(.55,.8,STRATA.hardnessAt(x,h,z))*smooth(.6,1,sl):0);
  gm[i*2]=smooth(.6,1.2,sl);}
 g.setAttribute('aGL',new THREE.BufferAttribute(lay,4));g.setAttribute('aGM',new THREE.BufferAttribute(gm,2));
 // PlaneGeometry's uv runs v up the plane; the canvas's y runs down it (z south): match them
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,(p.getX(i)-TERR.X0)/SX,1-(p.getZ(i)-TERR.Z0)/SZ);}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.seat='ground';m.userData.inspectLabel=LAND.label;if(USE_KG&&GLAY&&KG_REL)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});   /* aKGAO: relief.mesh */scene.add(m);window._groundMesh=m;
 GROUND_SEAT=KSEAT.tris(p.array,g.index.array,{id:'ground',cls:'ground'});})();   /* the drawn ground: what drawnH and the probe's contact sweep read */

// ---------------------------------------------------------------- the lake
const WATER_SHALLOW=new THREE.Color().setHSL(XANADU_LAKE.hue,.50,.55),WATER_MID=new THREE.Color().setHSL(XANADU_LAKE.hue+.02,.58,.34),WATER_DEEP=new THREE.Color().setHSL(XANADU_LAKE.hue+.05,.60,.15),WATER_PALE=new THREE.Color().setHSL(XANADU_LAKE.hue-.02,.45,.70);
function lakeColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,-h);
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2);
 out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.5,.68,shoal)*smooth(3,.4,d),smooth(.9,.1,d)*.6)).lerp(WATER_MID,smooth(1.5,6,d)).lerp(WATER_DEEP,smooth(8,30,d));return out;}
// the lake and the river are drawn by core/water: the records here (RIV, terrainH, lakeColorAt) and src/89w-host-water.js (2026-10-25)
