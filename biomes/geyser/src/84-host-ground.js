// ================================================================= HOST — the ground (the geyser basin)
// Three meshes, one material: the map at 5 m, the basin's floor at 2 m and the Stair at 0.8 m (the terraces' rims are a
// metre wide) as base steps, each mesh adaptive by tile (the meshes, below), the coarse one with holes where the fine ones
// lie and the fine ones skirted so no seam shows. Each vertex
// carries the kit's thermal record (GEYSER.at) in byte attributes: heat, sinter, film (the run-off's sheet of water),
// acid, the flow's direction, dead, mud, terrace, sand, steam vents, meadow; and its macro colour and how rocky it is.
// The shader lays the library's ground layers by those (materials.json: litter under the jungle, the thermal meadow's
// grass and moss, rock on the walls, black sand on the beach, the sinter, the Stair's travertine, the acid field's clay,
// the mud) through a stochastic sampler (GEYSER.GLSL_LAY), then the THERMOPHILE MATS by the temperature: none over
// ~73 degC (the sinter bare and wet), yellow-green to ~63, orange to ~52, orange-brown, then brown-olive as the water
// cools, in streamers drawn out along the flow (and fanned out round the springs). The film shines and ripples down the
// flow; on the Stair each vertex carries its pool's level, which darkens the floor under the pool (the water itself is
// core/water's: 89w-host-water.js) and the water sheets down the curtains between them.
REGISTER({name:BASIN.name,x:BASIN.x,z:BASIN.z,y:typeof STATION_GROUND!=='undefined'?landH(BASIN.x,BASIN.z)-20:20,r:Math.max(BASIN.rx,BASIN.rz),h:120});   /* a station's field on its own ground */
LAYOUT.flats.forEach(f=>{if(f.key==='neck'||f.key==='acidflat')return;REGISTER({name:f.name,x:f.x,z:f.z,y:landH(f.x,f.z)-6,r:Math.max(f.rx,f.rz)*.9,h:80,flat:f.key});});
LAYOUT.dead.forEach(d=>REGISTER({name:d.name,x:d.x,z:d.z,y:landH(d.x,d.z)-6,r:d.r*.8,h:60,dead:d.key}));
// A STATION ON OTHER GROUND (stations/field, PLAN-STATIONS.md stations 2-5) hands this fragment STATION_GROUND: {patches (the fine meshes, in place of the
// basin floor's and the Stair's), paint(x, z, y, g, c, GA) (after the kit's paint: may change the colour c and the channels; on a station the `sand`
// channel carries its cover (snow, ice, salt, needles) and `grass` its warm turf), layers [[slot, GLSL weight, tint, name], ...] (in place of the ten),
// mats (a GLSL body for _matCol(h): the run-off's colours by heat)}. Without it, the showcase as it was
const SG=typeof STATION_GROUND!=='undefined'?STATION_GROUND:null;
if(!STAIR.none){const z=(STAIR.z0+shoreZ(STAIR.x0))/2;REGISTER({name:STAIR.name,x:stairX(z),z,y:-4,r:(shoreZ(STAIR.x0)-STAIR.z0)/2,h:60,stair:true});}

// ---------------------------------------------------------------- the paint (per vertex)
const K=hx=>new THREE.Color(hx);
const PAINT={LITTER:K(0x3a3426),LITTER2:K(0x2e2a1e),MEADOW:K(0x5e5a36),ROCK:K(0x5e5a52),SAND:K(0x302e2c),SEABED:K(0x3c3a32),GRAVEL:K(0x6a6252),
 DEAD:K(0xb4b0a4),CLAY:K(0xe4dccc),OCHRE:K(0xc89448)};
const _c=new THREE.Color();
const GA={};   // scratch for one vertex's attributes
function paintAt(x,z,y,slope){const g=GEYSER.at(x,z,landH(x,z)),c=creekAt(x,z),sz=shoreZ(x),fl=Math.max(basinK(x,z),stairK(x,z));
 const n=fbm(x*.02,z*.02,4701,2)-.5,n2=fbm(x*.004,z*.004,4702,2);
 _c.copy(PAINT.LITTER).lerp(PAINT.LITTER2,clamp(.5+n*1.6,0,1));
 const meadow=smooth(.3,.6,fl)*(1-g.sinter)*(1-g.acid)*(1-g.dead)*(1-g.terr),sand=Math.max(smooth(sz-34,sz-12,z)*smooth(3,.3,y),z>sz?1:0);
 if(meadow>0)_c.lerp(PAINT.MEADOW,meadow*(.7+.3*n2));
 const rock=smooth(.55,.8,slope)*(1-sand);
 _c.lerp(PAINT.ROCK,rock);
 const bed=smooth(c.w+3,c.w-1,c.d);if(bed>0)_c.lerp(PAINT.GRAVEL,bed*.8);
 if(sand>0)_c.lerp(y<-.5?PAINT.SEABED:PAINT.SAND,sand);
 if(g.dead>0)_c.lerp(PAINT.DEAD,g.dead*.6);
 if(g.acid>0)_c.lerp(_c.clone().copy(PAINT.CLAY).lerp(PAINT.OCHRE,smooth(-.1,.25,n+(n2-.5)*.6)),g.acid*.9);
 GA.r=_c.r;GA.g=_c.g;GA.b=_c.b;GA.rock=rock;
 GA.heat=g.heat;GA.sinter=g.sinter*(1-sand);GA.film=g.film;GA.acid=g.acid;GA.dx=g.dx;GA.dz=g.dz;GA.dead=g.dead;GA.mud=g.mud;
 GA.terr=g.terr;GA.sand=Math.max(sand,bed*.7);GA.vent=g.vent;GA.grass=meadow*(1-rock);GA.pl=g.pl;
 if(SG&&SG.paint)SG.paint(x,z,y,g,_c,GA,slope);
 return GA;}

// ---------------------------------------------------------------- the layers (the library, or procedural without it)
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2),c=fbm(x/5,y/5,7.5,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=c*255;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
// key: the layer; [procedural colour (sRGB), how strongly the detail map shows]
const GL_KEYS={litter:[0x3a3426,.6],grass:[0x5a6034,.5],moss:[0x4a6a2a,.45],rock:[0x5e5a52,.7],sand:[0x2e2c2a,.4],sinter:[0xdcd8cc,.35],
 tufa:[0xe8e4da,.4],clay:[0xe0d6c4,.35],mud:[0x6a6052,.4],mat:[0xc87a30,.3]};
// THE LIBRARY LAYERS ON KGROUND (core/terrain 43; BACKPORT.md's ground row, the final rebuild, pair 7, 2026-11-03): the nine surfaces the paint mixed in by
// its zone weights (litter, the meadow's grass and moss, rock, the beach's black sand, the dead forest's and the flats' sinter, the Stair's travertine, the acid
// field's clay, the mud) are KGROUND layers now, in the same order with the same weights and tints: hex-tiled, scaled with distance and blended by height in
// place of the kit's two-read sampler (GEYSER.GLSL_LAY). The mats' own sampler (the 'mat' set, under the temperature ramp) stays the kit's: it is a term on top
// of the layers, as the vents, the film and the Stair's pools are. ?kground=0 for the old mix
const USE_KG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k in GL_KEYS){const P=KMAT.packed('geyser','ground.'+k);if(P)o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const GRU={uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xc8d4d4)},uLight:{value:1}};
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
const KG_LAYERS=USE_KG&&GLAY?(SG&&SG.layers?SG.layers:[['litter','0.65'],['grass','grass*0.9','mix(vec3(1.0),base*3.0,0.3)'],
 ['moss','grass*smoothstep(0.03,0.09,heat)*(1.0-smoothstep(0.2,0.32,heat))*0.8'],['rock','rock'],['sand','sand','mix(vec3(1.0),base*4.0,0.25)'],
 ['sinter','dead*0.7','vec3(0.78,0.76,0.72)','dead sinter'],['sinter','sin_','mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk)'],
 ['tufa','terr','vec3(1.04,1.02,0.98)'],['clay','acid*0.9','mix(vec3(1.0),base*1.4,0.6)'],['mud','mud*0.95']])
 .map(L=>KGROUND.layer('geyser',/^st\./.test(L[0])?L[0]:'ground.'+L[0],{w:L[1],tint:L[2]||'vec3(1.0)',amt:1,gain:1,name:L[3]||L[0]})).filter(Boolean):[];
const KG_ON=KG_LAYERS.length>0&&KG_LAYERS.length===(SG&&SG.layers?SG.layers.length:10);
// THE STAIR'S CURTAINS LAID DOWN IN COUPLETS (core/terrain 35b, KSTRATA.lamina; BACKPORT.md's row, "strata in the sinter terraces"; the final rebuild, pair 7):
// travertine grows a couplet a day, a paler band each wet season, so a terrace wall reads in bands across its face (cream and an iron buff) from afar and
// in its couplets close to. One column from the flight's top down (depth = the top's height less the fragment's); the curtains' own ribs and drip
// stripes stay on top. ~0.8 mm a day (Mammoth's fast terraces): the 35 m flight is ~120 years of it. ?lamina=0 for the plain curtains
const STAIR_LAM=(function(){if(STAIR.none||typeof KSTRATA==='undefined'||!KSTRATA.lamina||!KSTRATA.laminaShade||new URLSearchParams(location.search).get('lamina')==='0')return null;
 const col={a:'#ece4d2',b:'#c4ae86',wet:'#f8f3e8'},H=STAIR_TOP+8,L=KSTRATA.lamina({seed:5303,H,rate:.0008,colours:col}),S=KSTRATA.laminaShade(L,{THREE,res:.01});
 const lin=h=>Math.pow(parseInt(h.slice(1,3),16)/255,2.2)*.3+Math.pow(parseInt(h.slice(3,5),16)/255,2.2)*.59+Math.pow(parseInt(h.slice(5,7),16)/255,2.2)*.11;
 S.H=H;S.k=1/((lin(col.a)+lin(col.b))/2);S.L=L;return S;})();
window._lamina=STAIR_LAM?{H:STAIR_LAM.H,years:Math.round(STAIR_LAM.H/(.0008*365))}:null;   /* all or none: a page missing a set keeps the old mix whole */
MAT_GROUND.onBeforeCompile=sh=>{if(STAIR_LAM)Object.assign(sh.uniforms,STAIR_LAM.uniforms);sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uMacro={value:TEX_MACRO};Object.assign(sh.uniforms,GRU);
 const lib=k=>GLAY&&GLAY[k]&&(!KG_ON||k==='mat');   /* on KGROUND only the mats' set is the kit's sampler */
 for(const k in GL_KEYS)if(lib(k))sh.uniforms['uG_'+k]={value:GLAY[k].map};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aC,aT,aU,aW;attribute vec2 aPL;varying vec4 vC,vT,vU,vW;varying vec2 vPL;varying vec3 vGWP;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vC=aC;vT=aT;vU=aU;vW=aW;vPL=aPL;');
 const libKeys=Object.keys(GL_KEYS).filter(lib);
 const L=k=>{const P=GL_KEYS[k];if(lib(k))return'_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt)';const c=new THREE.Color(P[0]).convertSRGBToLinear();
  return'(vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')*mix(1.0,dt.r*1.08,'+P[1].toFixed(2)+'))';};
 let decl='uniform sampler2D uDetail,uMacro;uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec4 vC,vT,vU,vW;varying vec2 vPL;varying vec3 vGWP;'+
  (libKeys.length?'uniform sampler2D '+libKeys.map(k=>'uG_'+k).join(',')+';':'')+GEYSER.GLSL_LAY+(STAIR_LAM?STAIR_LAM.glsl:'')+
  // the mats' colour by the heat (0..1 of 33..100 degC): clear water over ~73, yellow-green, orange, orange-brown, brown-olive
  (SG&&SG.mats?'vec3 _matCol(float h){'+SG.mats+'}':'vec3 _matCol(float h){vec3 c=vec3(0.36,0.32,0.14);c=mix(c,vec3(0.56,0.3,0.1),smoothstep(0.1,0.17,h));c=mix(c,vec3(0.85,0.46,0.12),smoothstep(0.25,0.32,h));'+
  'c=mix(c,vec3(0.86,0.72,0.2),smoothstep(0.42,0.47,h));c=mix(c,vec3(0.66,0.74,0.36),smoothstep(0.5,0.55,h));return pow(c,vec3(2.2));}');
 const body='vec3 _E=vec3(0.0);{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);vec3 dt=texture2D(uDetail,p*0.13).rgb;'+
  'float rock=vC.a,heat=vT.x,sin_=vT.y,film=vT.z,acid=vT.w,dead=vU.z,mud=vU.w,terr=vW.x,sand=vW.y,vent=vW.z,grass=vW.w;'+
  'vec3 base=pow(vC.rgb,vec3(2.2));float _sk=smoothstep(0.25,0.75,texture2D(uMacro,p*0.011).g+dt.r*0.2-0.1);'+(KG_ON?'vec3 c=base;diffuseColor.rgb=c;\n/*KGROUND*/\nc=diffuseColor.rgb;':'vec3 c=mix('+L('litter')+',base,0.35);'+
  'c=mix(c,'+L('grass')+'*mix(vec3(1.0),base*3.0,0.3),grass*0.9);'+
  'c=mix(c,'+L('moss')+',grass*smoothstep(0.03,0.09,heat)*(1.0-smoothstep(0.2,0.32,heat))*0.8);'+
  'c=mix(c,'+L('rock')+',rock);c=mix(c,'+L('sand')+'*mix(vec3(1.0),base*4.0,0.25),sand);'+
  'c=mix(c,'+L('sinter')+'*vec3(0.78,0.76,0.72),dead*0.7);c=mix(c,'+L('sinter')+'*mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk),sin_);'+
  'c=mix(c,'+L('tufa')+'*vec3(1.04,1.02,0.98),terr);'+
  'c=mix(c,'+L('clay')+'*mix(vec3(1.0),base*1.4,0.6),acid*0.9);c=mix(c,'+L('mud')+',mud*0.95);')+
  // a steam vent's ground: sulphur yellow, rust round it
  'c=mix(c,mix(vec3(0.42,0.12,0.03),vec3(0.75,0.6,0.08),smoothstep(0.5,0.9,vent)),smoothstep(0.08,0.4,vent)*0.75);'+
  // THE MATS: where the warm water lies or runs; streamers drawn out along the flow (fanned out round a spring)
  '{vec2 fd=vU.xy*2.0-1.0;float fl=length(fd);vec2 d=fl>0.05?fd/fl:vec2(1.0,0.0),pp=vec2(-d.y,d.x);float s=dot(p,d),t=dot(p,pp);'+
  'float st=texture2D(uMacro,vec2(t*0.21,s*0.012)).b*0.7+texture2D(uMacro,vec2(t*0.06,s*0.004)).g*0.6-0.65;'+
  'float h=heat+st*0.09*smoothstep(0.05,0.3,fl);float w=max(film,terr*0.3)*(1.0-smoothstep(0.55,0.62,h))*smoothstep(0.015,0.06,h)*(0.75+0.25*fl);'+
  'vec3 m=_matCol(h)*(0.75+0.5*texture2D(uMacro,vec2(t*0.5,s*0.03)).b)'+(lib('mat')?'*mix(vec3(1.0),'+L('mat')+'*2.2,0.45)':'')+';'+
  'c=mix(c,m,clamp(w*1.5,0.0,1.0)*0.94);'+
  // the film: wet, dark, shining, rippling down the flow; the hottest a little blue-white
  'float wet=clamp(film,0.0,1.0)*(1.0-sand);c*=1.0-0.25*wet;c=mix(c,pow(vec3(0.62,0.78,0.82),vec3(2.2)),wet*smoothstep(0.55,0.75,heat)*0.35);'+
  'vec3 V=normalize(cameraPosition-vGWP);float rp=sin(s*3.1-uT*5.0+t*0.7)*0.5+sin(s*7.3-uT*8.0)*0.25;vec3 N=normalize(vec3(d.x*rp*0.08,1.0,d.y*rp*0.08));'+
  'float sp=pow(max(dot(N,normalize(uSun+V)),0.0),90.0);float fr=pow(1.0-max(V.y,0.0),4.0);_E+=wet*(sp*0.55*vec3(1.0,0.95,0.85)+fr*0.12*uSky)*uLight;}'+
  // THE STAIR's pools: the band this fragment lies in and its pool's level; under it, water (turquoise where hot, greener
  // as it cools) over the floor; on a curtain, the water sheeting down
  'if(terr>0.97){float lev=vPL.x,spread=vPL.y-lev*lev,dep=vPL.x>-50.0?lev-vGWP.y:-1.0;vec3 V=normalize(cameraPosition-vGWP);'+
  ' vec3 fn=normalize(cross(dFdx(vGWP),dFdy(vGWP)));if(fn.y<0.0)fn=-fn;float steep=1.0-fn.y;'+
  // a pool: the triangle wholly in one pool (no spread of level across it) and under that pool's level
  ' if(dep>0.0&&spread<0.02){vec3 wc=mix(vec3(0.2,0.48,0.36),vec3(0.18,0.56,0.62),smoothstep(0.05,0.25,heat));wc=mix(wc,vec3(0.3,0.7,0.8),smoothstep(0.3,0.5,heat));'+
  '  float a=smoothstep(0.0,0.35,dep);c=mix(c*0.55,pow(wc,vec3(2.2))*0.5,a*0.9);vec3 N=normalize(vec3(0.02*sin(p.x*1.3+uT*1.1)+0.015*sin(p.y*2.1-uT*0.9),1.0,0.02*cos(p.y*1.1+uT)));'+
  '  }'+
  // a wall: fluted, draped with drip ridges running down it (stripes across the face, none down it), the water sheeting over
  ' else if(steep>0.35){float fl=smoothstep(0.35,0.7,steep),k=dot(p,normalize(vec2(-fn.z,fn.x)));float fx=texture2D(uMacro,vec2(k*0.21,vGWP.y*0.004)).b;'+
  '  float rib=0.5+0.5*sin(k*7.0+fx*9.0),rib2=0.5+0.5*sin(k*23.0+fx*17.0);c=mix(c,vec3(0.8,0.79,0.76)*(0.82+0.18*rib),fl*0.65);c*=mix(1.0,0.78+0.3*rib*rib2+0.1*rib,fl);'+
  '  c=mix(c,c*vec3(0.8,0.7,0.58),fl*smoothstep(0.62,0.85,fx)*(1.0-smoothstep(0.1,0.35,heat))*0.7);'+
  (STAIR_LAM?'  {float ld='+STAIR_LAM.H.toFixed(3)+'-vGWP.y;c*=mix(vec3(1.0),laminaColor(ld,max(fwidth(vGWP.y),1e-4))*'+STAIR_LAM.k.toFixed(4)+',fl*0.7);}':'')+
  '  float str=smoothstep(0.6,1.0,texture2D(uMacro,vec2(k*0.35,vGWP.y*0.08+uT*0.12)).b+0.15*sin(vGWP.y*9.0+uT*7.0));_E+=fl*str*0.12*vec3(0.95,0.98,1.0)*uLight;}}'+
'diffuseColor.rgb=c;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=_E;');};
if(KG_ON)KGROUND.hook(MAT_GROUND,{key:'geyser-ground',at:'/*KGROUND*/',layers:KG_LAYERS});
TICKS.push(dt=>{GRU.uT.value+=dt;});
_onLight.push(m=>{GRU.uLight.value=m==='night'?.2:1;});

// ---------------------------------------------------------------- the meshes
// Three meshes, one material: the map at 5 m, the basin floor at 2 m, the Stair at 0.8 m (the base steps), the map with holes where the
// patches lie and the patches skirted 1.5 m down so no seam shows. Each is ADAPTIVE (2026-10-26; it was 1.1M vertices at the base steps):
// cut into tiles of 16 base cells, a tile takes the coarsest step (16, 8, 4, 2 or 1 cells) whose bilinear fit of its base grid keeps the
// height within the patch's tol and the paint (the thermal record, the macro colour) within a few byte steps, the pools' level exactly; so
// the plateau, the sea floor and the plain meadow drop to 10-80 m cells while the terraces, the rims, the run-off and the mats keep the base
// step. Tiles over a spring's rim or a pool geyser's pool go finer than the base (fine: 1 m on the basin floor), so the disc meets its lip.
// A finer tile's vertices along a coarser neighbour's side are laid on that side's line (no T-junction gap); the normals are the base grid's.
const PATCHES=SG&&SG.patches?SG.patches:[{name:'The basin floor',x0:-680,z0:-680,x1:680,z1:330,cs:2,tol:.04,fine:true},{name:'The Stair',x0:-200,z0:330,x1:320,z1:870,cs:.8,tol:.035}];
// where a tile goes finer than its base: an annulus [r0, r1] round a point (the springs' rims, the pool geysers' pools)
const FINE_RINGS=LAYOUT.springs.map(s=>[s.x,s.z,Math.max(0,s.r*.8-2),s.r*1.15+4]).concat(LAYOUT.geysers.filter(g=>g.kind!=='cone').map(g=>[g.x,g.z,0,(g.pool||2)*1.2+4]));
const GTILE=16,GSTEPS=[16,8,4,2,1];
const GSTAT={verts:0,tris:0,tiles:{}};
function groundMesh(P,label,hole,skirt){const x0=P.x0,z0=P.z0,cs=P.cs,nx=Math.round((P.x1-x0)/cs),nz=Math.round((P.z1-z0)/cs),W=nx+1,NV=W*(nz+1),tol=P.tol==null?.1:P.tol;
 // the base grid: height, normal and paint at every base vertex
 const H=new Float32Array(NV);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)H[j*W+i]=terrainH(x0+i*cs,z0+j*cs);
 const hAt=(i,j)=>(i>=0&&i<=nx&&j>=0&&j<=nz)?H[j*W+i]:terrainH(x0+i*cs,z0+j*cs);
 const BN=new Float32Array(NV*3),BA=new Uint8Array(NV*16),BPL=new Float32Array(NV);
 const b=v=>Math.round(clamp(v,0,1)*255);
 const paintInto=(A8,o,PL,po,x,z,y,slope)=>{const A=paintAt(x,z,y,slope);
  A8[o]=b(A.r);A8[o+1]=b(A.g);A8[o+2]=b(A.b);A8[o+3]=b(A.rock);A8[o+4]=b(A.heat);A8[o+5]=b(A.sinter);A8[o+6]=b(A.film);A8[o+7]=b(A.acid);
  A8[o+8]=b(A.dx*.5+.5);A8[o+9]=b(A.dz*.5+.5);A8[o+10]=b(A.dead);A8[o+11]=b(A.mud);A8[o+12]=b(A.terr);A8[o+13]=b(A.sand);A8[o+14]=b(A.vent);A8[o+15]=b(A.grass);PL[po]=A.pl;};
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*W+i,hx=hAt(i+1,j)-hAt(i-1,j),hz=hAt(i,j+1)-hAt(i,j-1),l=Math.hypot(hx,2*cs,hz);
  BN[k*3]=-hx/l;BN[k*3+1]=2*cs/l;BN[k*3+2]=-hz/l;paintInto(BA,k*16,BPL,k,x0+i*cs,z0+j*cs,H[k],clamp(Math.hypot(hx,hz)/(2*cs),0,1));}
 // the tiles: hole cells (the map under a patch), the step each takes
 const TX=Math.ceil(nx/GTILE),TZ=Math.ceil(nz/GTILE),step=new Float32Array(TX*TZ),part=new Uint8Array(TX*TZ);
 const isHole=(i,j)=>hole&&hole(x0+i*cs,z0+j*cs,x0+(i+1)*cs,z0+(j+1)*cs);
 // the error of a step s over a tile: the base vertices against the bilinear fit of the step's grid (height, paint, pool level)
 const fits=(i0,j0,i1,j1,s)=>{for(let j=j0;j<=j1;j++){const ja=j0+Math.floor((j-j0)/s)*s,jb=Math.min(j1,ja+s),fv=jb>ja?(j-ja)/(jb-ja):0;
   for(let i=i0;i<=i1;i++){const ia=i0+Math.floor((i-i0)/s)*s,ib=Math.min(i1,ia+s),fu=ib>ia?(i-ia)/(ib-ia):0;if(fu===0&&fv===0)continue;
    const k=j*W+i,a=ja*W+ia,bq=ja*W+ib,c=jb*W+ia,d=jb*W+ib,w0=(1-fu)*(1-fv),w1=fu*(1-fv),w2=(1-fu)*fv,w3=fu*fv;
    if(Math.abs(H[a]*w0+H[bq]*w1+H[c]*w2+H[d]*w3-H[k])>tol)return false;
    if(BPL[a]!==BPL[k]||BPL[bq]!==BPL[k]||BPL[c]!==BPL[k]||BPL[d]!==BPL[k])return false;
    const film=BA[k*16+6]/255;
    for(let q=0;q<16;q++){if((q===8||q===9)&&film<.04)continue;const e=Math.abs(BA[a*16+q]*w0+BA[bq*16+q]*w1+BA[c*16+q]*w2+BA[d*16+q]*w3-BA[k*16+q]);if(e>(q<3?10:14))return false;}}}
  return true;};
 const fineHit=(xa,za,xb,zb)=>P.fine&&FINE_RINGS.some(R=>{const dx=Math.max(xa-R[0],0,R[0]-xb),dz=Math.max(za-R[1],0,R[1]-zb),dn=Math.hypot(dx,dz),
  df=Math.hypot(Math.max(Math.abs(xa-R[0]),Math.abs(xb-R[0])),Math.max(Math.abs(za-R[1]),Math.abs(zb-R[1])));return dn<=R[3]&&df>=R[2];});
 for(let tj=0;tj<TZ;tj++)for(let ti=0;ti<TX;ti++){const i0=ti*GTILE,j0=tj*GTILE,i1=Math.min(nx,i0+GTILE),j1=Math.min(nz,j0+GTILE),t=tj*TX+ti;
  let nh=0;if(hole)for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++)if(isHole(i,j))nh++;
  if(nh===(i1-i0)*(j1-j0)){step[t]=-1;continue;}
  if(nh){step[t]=1;part[t]=1;continue;}
  if(fineHit(x0+i0*cs,z0+j0*cs,x0+i1*cs,z0+j1*cs)){step[t]=.5;continue;}
  let s=1;for(const q of GSTEPS){if((i1-i0)%q||(j1-j0)%q)continue;if(q===1||fits(i0,j0,i1,j1,q)){s=q;break;}}step[t]=s;}
 // the vertices: a base vertex is copied, one off the base grid (a fine tile) is sampled, one on a coarser neighbour's side is laid on its line
 const pos=[],nor=[],att=[],pl=[],idx=[];let nv=0;
 const tmpA=new Uint8Array(16),tmpPL=new Float32Array(1);
 const emitBase=(k,dy)=>{pos.push(x0+(k%W)*cs,H[k]+(dy||0),z0+Math.floor(k/W)*cs);nor.push(BN[k*3],BN[k*3+1],BN[k*3+2]);for(let q=0;q<16;q++)att.push(BA[k*16+q]);pl.push(BPL[k]);return nv++;};
 const emitLerp=(ka,kb,f)=>{const g=1-f;pos.push(x0+((ka%W)*g+(kb%W)*f)*cs,H[ka]*g+H[kb]*f,z0+(Math.floor(ka/W)*g+Math.floor(kb/W)*f)*cs);
  let n0=BN[ka*3]*g+BN[kb*3]*f,n1=BN[ka*3+1]*g+BN[kb*3+1]*f,n2=BN[ka*3+2]*g+BN[kb*3+2]*f;const l=Math.hypot(n0,n1,n2)||1;nor.push(n0/l,n1/l,n2/l);
  for(let q=0;q<16;q++)att.push(Math.round(BA[ka*16+q]*g+BA[kb*16+q]*f));pl.push(f<.5?BPL[ka]:BPL[kb]);return nv++;};
 const emitFresh=(fi,fj)=>{const x=x0+fi*cs,z=z0+fj*cs,y=terrainH(x,z),e=cs*.5,hx=terrainH(x+e,z)-terrainH(x-e,z),hz=terrainH(x,z+e)-terrainH(x,z-e),l=Math.hypot(hx,2*e,hz);
  pos.push(x,y,z);nor.push(-hx/l,2*e/l,-hz/l);paintInto(tmpA,0,tmpPL,0,x,z,y,clamp(Math.hypot(hx,hz)/(2*e),0,1));for(let q=0;q<16;q++)att.push(tmpA[q]);pl.push(tmpPL[0]);return nv++;};
 const stepAt=(ti,tj)=>(ti<0||tj<0||ti>=TX||tj>=TZ)?-1:step[tj*TX+ti];
 for(let tj=0;tj<TZ;tj++)for(let ti=0;ti<TX;ti++){const t=tj*TX+ti,s=step[t];if(s<0)continue;GSTAT.tiles[s]=(GSTAT.tiles[s]||0)+1;
  const i0=ti*GTILE,j0=tj*GTILE,i1=Math.min(nx,i0+GTILE),j1=Math.min(nz,j0+GTILE),cu=Math.round((i1-i0)/s),cv=Math.round((j1-j0)/s),VW=cu+1;
  const sW=stepAt(ti-1,tj),sE=stepAt(ti+1,tj),sN=stepAt(ti,tj-1),sS=stepAt(ti,tj+1);
  // one vertex at tile grid (u, v): base index (fi, fj) = (i0 + u s, j0 + v s)
  const V=new Int32Array(VW*(cv+1));
  for(let v=0;v<=cv;v++)for(let u=0;u<=cu;u++){const fi=i0+u*s,fj=j0+v*s;let k=-1;
   // a side shared with a coarser neighbour: on its line
   const side=(u===0&&sW>s)?['j',sW]:(u===cu&&sE>s)?['j',sE]:(v===0&&sN>s)?['i',sN]:(v===cv&&sS>s)?['i',sS]:null;
   if(side){const sn=side[1],tt=side[0]==='j'?fj:fi,lo=Math.floor(tt/sn+1e-9)*sn,hi=Math.min(side[0]==='j'?nz:nx,lo+sn),f=hi>lo?(tt-lo)/(hi-lo):0;
    if(f>1e-6&&f<1-1e-6){const ka=side[0]==='j'?lo*W+fi:fj*W+lo,kb=side[0]==='j'?hi*W+fi:fj*W+hi;k=emitLerp(ka,kb,f);}}
   if(k<0)k=(fi%1===0&&fj%1===0)?emitBase(fj*W+fi):emitFresh(fi,fj);V[v*VW+u]=k;}
  for(let v=0;v<cv;v++)for(let u=0;u<cu;u++){if(part[t]&&isHole(i0+u,j0+v))continue;const a=V[v*VW+u],bb=V[(v+1)*VW+u],c=V[(v+1)*VW+u+1],d=V[v*VW+u+1];idx.push(a,bb,d,bb,c,d);}
  // the patch's border: a skirt 1.5 m down, the sides in the order the ring ran (j0 east-going, i1 south-going, j1 west-going, i0 north-going)
  if(skirt){const strip=L=>{const S=L.map(q=>{const k=q;pos.push(pos[k*3],pos[k*3+1]-1.5,pos[k*3+2]);nor.push(nor[k*3],nor[k*3+1],nor[k*3+2]);for(let c2=0;c2<16;c2++)att.push(att[k*16+c2]);pl.push(-100);return nv++;});
     for(let r=0;r<L.length-1;r++)idx.push(L[r],S[r],L[r+1],L[r+1],S[r],S[r+1]);};
   if(j0===0){const L=[];for(let u=0;u<=cu;u++)L.push(V[u]);strip(L);}
   if(i1===nx){const L=[];for(let v=0;v<=cv;v++)L.push(V[v*VW+cu]);strip(L);}
   if(j1===nz){const L=[];for(let u=cu;u>=0;u--)L.push(V[cv*VW+u]);strip(L);}
   if(i0===0){const L=[];for(let v=cv;v>=0;v--)L.push(V[v*VW]);strip(L);}}}
 const N=nv,posA=new Float32Array(pos),norA=new Float32Array(nor),aC=new Uint8Array(N*4),aT=new Uint8Array(N*4),aU=new Uint8Array(N*4),aW=new Uint8Array(N*4),aPL=new Float32Array(N*2);
 for(let k=0;k<N;k++){for(let q=0;q<4;q++){aC[k*4+q]=att[k*16+q];aT[k*4+q]=att[k*16+4+q];aU[k*4+q]=att[k*16+8+q];aW[k*4+q]=att[k*16+12+q];}const p=pl[k];aPL[k*2]=p;aPL[k*2+1]=p===-100?1e4:p*p;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(posA,3));g.setAttribute('normal',new THREE.BufferAttribute(norA,3));
 g.setAttribute('aC',new THREE.BufferAttribute(aC,4,true));g.setAttribute('aT',new THREE.BufferAttribute(aT,4,true));g.setAttribute('aU',new THREE.BufferAttribute(aU,4,true));
 g.setAttribute('aW',new THREE.BufferAttribute(aW,4,true));g.setAttribute('aPL',new THREE.BufferAttribute(aPL,2));
 g.setIndex(N>65535?new THREE.BufferAttribute(new Uint32Array(idx),1):idx);
 GSTAT.verts+=N;GSTAT.tris+=idx.length/3;
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel=label;scene.add(m);return m;}
const GROUND=(function(){const S=TERR.R*2.2,inP=(a,b,c,d)=>PATCHES.some(P=>a>=P.x0-.01&&b>=P.z0-.01&&c<=P.x1+.01&&d<=P.z1+.01);
 const out=[groundMesh({x0:-S/2,z0:-S/2,x1:S/2,z1:S/2,cs:5,tol:.1},'The Steampits: the jungle plateau and the coast',inP,false)];
 PATCHES.forEach(P=>out.push(groundMesh(P,P.name,null,true)));return out;})();
window._ground=GSTAT;
_mark('ground');
