// ================================================================= HOST — the land: the layout, the height, the water, the fields, the meshes, the binding
// The same fragment for every station: 45 (the stage) says what the station is in STAGE (its rock as KSTACKS records,
// its floor function, its wind, where the soil is rich, which layers the floor wears, its pools and carvings); this
// fragment lays the necanyons zones over the rock (46, read in place: NECANYONS.lay), makes the height, the water,
// Korona's fields, the meshes, and binds the biome core.
// THE RIMS WEATHERED ROUND (the owner, 2026-10-19: 20 to 30 degrees off the vertical at the edge): each tier's top bed curves in
// over its top fifth by rimCh of its radius (.05: ~23 degrees on the table), the partings notch a little deeper
STAGE.bodies.forEach(B=>{if(B.kind!=='mesa'&&B.kind!=='butte')return;B.beds.forEach((b,i)=>{const nx=B.beds[i+1],top=!nx||nx.tier!==b.tier;b.ch=Math.max(b.ch,top?(STAGE.rimCh==null?.06:STAGE.rimCh):.012);b.nt=Math.max(b.nt,.01);});});
// a station's extra relief on the tops (the hoar table's knolls): KSTACKS.topH is the one top function, so the beds' tops and
// the drawn mesh move together when it is wrapped here, before the layout and the meshes read it
if(STAGE.topExtra){const _topH=KSTACKS.topH;KSTACKS.topH=function(b,x,z){return _topH(b,x,z)+STAGE.topExtra(x,z);};}
NECANYONS.lay({bodies:STAGE.bodies,floor:STAGE.floor,R:STAGE.R,capY:STAGE.capY,cell:5,seed:STAGE.seed});
_mark('layout');
const _tm={x:NaN,z:NaN,h:0};
// the TALUS: the floor rises against a wall's foot, the rock's fall banked up (the wall goes down into it)
const talus=(x,z)=>{const fd=NECANYONS.footD(x,z);return fd<60?STAGE.talusH*Math.pow(smooth(55,0,fd),1.6)*(.75+.5*fbm(x*.012,z*.012,44,2)):0;};
const groundH=(x,z)=>STAGE.floor(x,z)+talus(x,z);
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const t=NECANYONS.top(x,z),h=t>-1e8?t:groundH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the stream (its bed + depth), the rain pools on the tops, the station's own pools (the hollow's)
const STREAM_=STAGE.stream||null;
const streamBed=z=>STAGE.floor(STREAM_.x(z),z);
const poolAt=(x,z)=>{const P=STAGE.pools;for(let i=0;i<P.length;i++){const p=P[i];if(Math.abs(x-p.x)<p.r&&Math.abs(z-p.z)<p.r&&Math.hypot(x-p.x,z-p.z)<p.r)return p;}return null;};
function waterH(x,z){if(STREAM_&&STAGE.streamD(x,z)<STREAM_.w*1.3)return streamBed(z)+STREAM_.depth;
 const q=NECANYONS.potholeAt(x,z);if(q)return q.y;const p=poolAt(x,z);return p?p.y:-1e9;}
STAGE.pools.forEach(p=>{if(p.y!=null)return;let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,terrainH(p.x+Math.cos(a)*p.r*1.15,p.z+Math.sin(a)*p.r*1.15));}p.y=lo-.25;});

// ---------------------------------------------------------------- the fields (biomes/WORLD.md; BIOME-API.md): wet, flow, rock, poor, rich, warm, upland
// read off the necanyons zones (46) and the station's say (45). poor is THE RULE (NOTES.md): where the ground is bare rock
// or leached sand and no silt has come, nothing feeds a plant but what it catches; carnivory follows poor x wet x warm.
const WET={floor:1,foot:.92,wall:.9,ledge:.85,rim:.4,bench:.6,cap:.45,stack:.3};
const flowAt=(x,z)=>STREAM_?smooth(STREAM_.w+26,STREAM_.w+2,STAGE.streamD(x,z)):0;
const rockAt=(x,z,Z)=>{Z=Z||NECANYONS.at(x,z);return Z.rock?(Z.zone==='bench'?.6:.88):smooth(32,0,Z.footD)*.65+(STAGE.rockExtra?STAGE.rockExtra(x,z):0);};
const wetAt=(x,z,Z)=>{Z=Z||NECANYONS.at(x,z);const w=STAGE.windward(x,z);
 return clamp(WET[Z.zone]*mix(.22,1,w)+.3*Z.seep+(Z.rock?.35*STAGE.bogAt(x,z):.25*flowAt(x,z))+(STAGE.wetExtra?STAGE.wetExtra(x,z):0)*(Z.rock?0:1),0,1);};
const richAt=(x,z)=>clamp(STAGE.rich(x,z),0,1);
const poorAt=(x,z,Z)=>{Z=Z||NECANYONS.at(x,z);const r=rockAt(x,z,Z),w=wetAt(x,z,Z);
 return clamp(.85*r+(Z.rock?.15:0)+.3*w*smooth(.15,.5,r)+(STAGE.poorExtra?STAGE.poorExtra(x,z):0)-.95*richAt(x,z),0,1);};
const FIELD={
 wet:(x,z)=>wetAt(x,z),flow:flowAt,rock:(x,z)=>clamp(rockAt(x,z),0,1),poor:(x,z)=>poorAt(x,z),rich:richAt,warm:(x,z)=>clamp(STAGE.warm(x,z),0,1),
 upland:(x,z)=>clamp((terrainH(x,z)-STAGE.bodies[0].y0)/Math.max(1,STAGE.capY-STAGE.bodies[0].y0),0,1),
 slope:(x,z)=>0,cold:(x,z)=>0,mist:(x,z)=>0};
if(STAGE.fields)Object.assign(FIELD,STAGE.fields);   /* a station's own fields (the gorge: canyon, oasis, dune for the desert kit) */
// the hell: where the man-eaters grow (57 reads it; the inspector shows it)
const hellAt=(x,z)=>{const Z=NECANYONS.at(x,z);return poorAt(x,z,Z)*wetAt(x,z,Z)*clamp(STAGE.warm(x,z),0,1);};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
// THE MASK is swapped per kit by the build (88): the necanyons kit and this one root anywhere out of the water (their
// zones and fields keep each plant to its place); the hyperjungle only on the floor, off the walls' feet and the stream
const OBSTACLES=[];
const waterMask0=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
const waterMask=STAGE.bare?(x,z)=>waterMask0(x,z)*(1-STAGE.bare(x,z)):waterMask0;   /* bare: ground the station bars from every kit (the salt crust) */
const jungleMask=(x,z)=>{if(NECANYONS.rockAt(x,z))return 0;const fd=NECANYONS.footD(x,z);if(fd<26)return 0;
 return smooth(26,58,fd)*(STREAM_?smooth(STREAM_.w+10,STREAM_.w+40,STAGE.streamD(x,z)):1)*waterMask(x,z)*(STAGE.jungle?STAGE.jungle(x,z):1)*(1-.8*smooth(.55,.9,poorAt(x,z)));};
const desertMask=(x,z)=>{if(NECANYONS.rockAt(x,z))return 0;const fd=NECANYONS.footD(x,z);return smooth(4,14,fd)*waterMask(x,z)*(STAGE.desert?STAGE.desert(x,z):0);};
const highMask=(x,z)=>NECANYONS.rockAt(x,z)?waterMask(x,z)*(STAGE.high?STAGE.high(x,z):0):0;
/* the ecotones (NOTES.md, "The life"): the nwlowlands kit on a lake shore (the basin: STAGE.shore), the nhighlands kit on a
   dry crest (the trenches: STAGE.crest); both off the rock and the walls' feet, out of the water, where the station says */
const shoreMask=(x,z)=>{if(NECANYONS.rockAt(x,z))return 0;const fd=NECANYONS.footD(x,z);return smooth(4,14,fd)*waterMask(x,z)*(STAGE.shore?STAGE.shore(x,z):0);};
const crestMask=(x,z)=>{if(NECANYONS.rockAt(x,z))return 0;const fd=NECANYONS.footD(x,z);return smooth(4,14,fd)*waterMask(x,z)*(STAGE.crest?STAGE.crest(x,z):0);};
let MASK=waterMask;
const SPINE=STAGE.spine;
BIO.init({tags:'korona',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:97,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:420,mid:950,far:2400,floor:[260,650]},windows:STAGE.windows||{}});
BIO.setSun(SUN_POS);
// the station's say, through the host for the kit (BIOME-API.md): the summit's bogs, the plants' density bias, the safe path, the pools
BIO.host.bogAt=(x,z)=>STAGE.bogAt(x,z);BIO.host.korona={bias:STAGE.bias||{},path:STAGE.path||null,pools:STAGE.pools};

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
const LAYER_KEYS=['ground.litter','ground.talus','ground.sand','ground.bog','ground.peat','ground.bladder','ground.snow','ground.redsoil','rock.wall','rock.top','carving','ice'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYER_KEYS.forEach(k=>{const P=KMAT.packed('korona',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PROC={
 'ground.litter':greyTex((x,y)=>150+50*(fbm(x/7,y/7,3,2)-.5)+30*(BIO.fn.h3(x,y,4)-.5)),
 'ground.talus':greyTex((x,y)=>170+40*(fbm(x/9,y/9,5,2)-.5)+44*(BIO.fn.h3(x,y,6)-.5)),
 'ground.sand':greyTex((x,y)=>185+20*(fbm(x/5,y/5,8,2)-.5)+30*(BIO.fn.h3(x,y,9)-.5)),
 'ground.bog':greyTex((x,y)=>160+50*(fbm(x/4,y/4,21,3)-.5)+20*(BIO.fn.h3(x,y,22)-.5)),
 'ground.peat':greyTex((x,y)=>120+50*(fbm(x/6,y/6,23,3)-.5)+30*(BIO.fn.h3(x,y,24)-.5)),
 'ground.bladder':greyTex((x,y)=>150+60*smooth(.6,.75,fbm(x/5,y/5,25,2))+20*(BIO.fn.h3(x,y,26)-.5)),
 'ground.snow':greyTex((x,y)=>236+14*(fbm(x/9,y/9,28,2)-.5)+8*(BIO.fn.h3(x,y,29)-.5)),
 'ground.redsoil':greyTex((x,y)=>165+30*(fbm(x/8,y/8,30,3)-.5)+36*(BIO.fn.h3(x,y,31)-.5)),
 'ice':greyTex((x,y)=>205+40*(fbm(x/6,y/30,32,3)-.5)-50*smooth(.62,.7,fbm(x/3,y/40,33,2))),
 'rock.wall':greyTex((x,y,w,h)=>165+30*(fbm(x/40,y/5,10,3)-.5)-70*Math.pow(fbm(x/9,y/120,11,2),2.5)+12*(BIO.fn.h3(x,y,12)-.5)),
 'rock.top':greyTex((x,y)=>175+26*(fbm(x/12,y/12,15,3)-.5)-70*smooth(.56,.66,fbm(x/26,y/26,16,2))+10*(BIO.fn.h3(x,y,17)-.5)),
 'carving':greyTex((x,y,w,h)=>{const row=Math.floor(y/(h/5)),yy=y-row*(h/5),line=Math.abs(yy-h/10)<1.5?-50:0,g=((x*7+row*31)%97<40&&Math.abs(yy-h/10-(((x*13+row*7)%3)-1)*h/25)<2)?-60:0;return 150+line+g+10*(BIO.fn.h3(x,y,27)-.5);})};
const SCALE={'ground.litter':3,'ground.talus':2.4,'ground.sand':2,'ground.bog':2.2,'ground.peat':2.6,'ground.bladder':2.2,'ground.snow':3,'ground.redsoil':2.6,'rock.wall':16,'rock.top':5,'carving':6,'ice':6};
const layer=k=>LIB[k]?{map:LIB[k].map,normalMap:LIB[k].normalMap||null,roughnessMap:LIB[k].roughnessMap||null,s:LIB[k].scale,lib:true}:
 {map:PROC[k],normalMap:null,roughnessMap:null,s:SCALE[k],lib:false};
LAYER_KEYS.forEach(k=>{const t=layer(k).map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;}});
const col3=(lib,hex,k)=>{if(lib)return'vec3(1.0)';const c=new THREE.Color(hex).convertSRGBToLinear();return'vec3('+[c.r,c.g,c.b].map(v=>(v*(k||1.6)).toFixed(4)).join(',')+')';};

// ---------------------------------------------------------------- the floor (one mesh: three layers by vertex weight, the station's)
// DITHERED SAMPLING (the owner, 2026-10-19, twice: the plateau tiled visibly; then the meadows read as furrows and the sand
// as stripes from the default views). A map is read through a HEX-CELL BOMB: the plane is cut into triangles ~2 tiles
// across, each corner turns and shifts the tile by its own hash, and a point blends the three corners' reads (weights
// cubed, so most of a cell is one read: no ghosting), so no two cells show the tile the same way up and no repeat can line
// up. That is done at the map's scale and again at a third of it (the leaves and grains three times larger) and the two
// mixed by a value noise, with a second, coarser noise over the lot for the ground's own light and dark (48 m and 140 m:
// the mottle no longer reads as one flat field close to). The walls keep their beds level (kditherW: the shift only, the
// turn a few degrees). GLSL ES 1.0 (three r128); the hash is Hoskins' fract hash, not a sine.
const DITHER=[
 'vec2 kh2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}',
 'float kvn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(kh2(i).x,kh2(i+vec2(1.0,0.0)).x,f.x),mix(kh2(i+vec2(0.0,1.0)).x,kh2(i+vec2(1.0,1.0)).x,f.x),f.y);}',
 'float kfbm(vec2 p){return 0.6*kvn(p)+0.3*kvn(p*2.3+7.1)+0.1*kvn(p*5.1+3.7);}',
 'vec4 ksamp(sampler2D m,vec2 p,vec2 v,float sd,float rot){vec2 h=kh2(v*0.37+sd);float a=(h.x-0.5)*6.2831853*rot,ca=cos(a),sa=sin(a);return texture2D(m,vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y)+h*13.0);}',
 'vec4 kbomb(sampler2D m,vec2 p,float cell,float sd,float rot){vec2 st=p/cell;vec2 sk=vec2(st.x-st.y*0.57735027,st.y*1.1547005);vec2 b=floor(sk),f=fract(sk);vec2 v1,v2,v3;vec3 w;',
 ' if(f.x+f.y<1.0){v1=b;v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(1.0-f.x-f.y,f.x,f.y);}else{v1=b+vec2(1.0,1.0);v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);}',
 ' w=w*w*w;w/=(w.x+w.y+w.z);return ksamp(m,p,v1,sd,rot)*w.x+ksamp(m,p,v2,sd,rot)*w.y+ksamp(m,p,v3,sd,rot)*w.z;}',
 'vec4 kdither2(sampler2D m,vec2 p,float rot){vec4 a=kbomb(m,p,1.9,0.0,rot);vec4 b=kbomb(m,p*0.33+vec2(2.3,5.1),1.4,7.0,rot);float n=kfbm(p*0.055+vec2(1.7,9.2));return mix(a,b,0.2+0.6*smoothstep(0.3,0.7,n));}',
 'vec4 kdither(sampler2D m,vec2 p){return kdither2(m,p,1.0);}',
 'vec4 kditherW(sampler2D m,vec2 p){return kdither2(m,p,0.08);}',
 'vec3 kmacro(vec2 p){float mv=kfbm(p*0.021+vec2(4.2,1.3)),mh=kfbm(p*0.0072+vec2(9.1,3.3));return (0.76+0.48*mv)*mix(vec3(0.93,0.9,0.86),vec3(1.05,1.04,0.97),mh);}',
 ''].join('\n');
// a station may tint a layer (STAGE.layerMul: [r,g,b] per layer, on the library's own colour too; the trenches green their
// windward litter) and may wear a FOURTH layer (STAGE.layers.d, its weight the third the station's weights() returns)
const mul3=i=>{const m=STAGE.layerMul&&STAGE.layerMul[i];return m?'*vec3('+m.map(v=>(+v).toFixed(3)).join(',')+')':'';};
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
{const La=layer(STAGE.layers.a),Lb=layer(STAGE.layers.b),Lc=layer(STAGE.layers.c),Ld=STAGE.layers.d?layer(STAGE.layers.d):null,LC=STAGE.layerCol;
 MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uL={value:La.map};sh.uniforms.uR={value:Lb.map};sh.uniforms.uS={value:Lc.map};if(Ld)sh.uniforms.uD={value:Ld.map};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aW;varying vec3 vW;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL,uR,uS'+(Ld?',uD':'')+';varying vec3 vW;varying vec3 vGWP;\n'+DITHER)
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;',
    'vec3 lt=pow(kdither(uL,p/'+La.s.toFixed(2)+').rgb,vec3(2.2))*'+col3(La.lib,LC[0])+mul3(0)+';',
    'vec3 rd=pow(kdither(uR,p/'+Lb.s.toFixed(2)+').rgb,vec3(2.2))*'+col3(Lb.lib,LC[1])+mul3(1)+';',
    'vec3 sd=pow(kdither(uS,p/'+Lc.s.toFixed(2)+').rgb,vec3(2.2))*'+col3(Lc.lib,LC[2])+mul3(2)+';',
    'vec3 c=mix(lt*0.46,rd*0.8,vW.x);c=mix(c,sd*0.78,vW.y);',
    Ld?'vec3 dd=pow(kdither(uD,p/'+Ld.s.toFixed(2)+').rgb,vec3(2.2))*'+col3(Ld.lib,LC[3]==null?0x5a6a30:LC[3])+mul3(3)+';c=mix(c,dd*0.8,vW.z);':'',
    'diffuseColor.rgb*=c*kmacro(p);}'].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'korona-ground-'+STAGE.layers.a+STAGE.layers.b+STAGE.layers.c+(STAGE.layers.d||'')+JSON.stringify(STAGE.layerMul||0);}
(function(){const N=440,S=STAGE.R*2.2,   /* 8 m cells: the talus is steep and a plant stands on the function's height (the owner, 2026-10-19: plants floated at 16 m) */
 g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,w=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,groundH(x,z));const W=STAGE.weights(x,z);
  w[3*i]=clamp(W[0],0,1);w[3*i+1]=clamp(W[1],0,1);w[3*i+2]=clamp(W[2]==null?0:W[2],0,1);}
 g.setAttribute('aW',new THREE.BufferAttribute(w,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel=STAGE.floorLabel||'The gorge floor';m.userData.host=true;scene.add(m);})();

// ---------------------------------------------------------------- the rock (KSTACKS meshes): the walls and the tops
// walls (quartzite, black-streaked) and tops (the summit pavement, with sphagnum where the station's bogAt says: aB).
// Vertex colours: the beds' banding (greys and pinks) and the notch's shade; the procedural fallback tints by them.
const ROCK_GEOS=[];
const MAT_TOP=(function(){const Lt=layer('rock.top'),Lb=layer('ground.bog'),Ls=layer('ground.snow');
 const m=new THREE.MeshStandardMaterial({map:Lt.map,normalMap:Lt.normalMap,roughnessMap:Lt.roughnessMap,roughness:1,metalness:0,vertexColors:true});
 m.onBeforeCompile=sh=>{sh.uniforms.uB={value:Lb.map};sh.uniforms.uBS={value:Lt.s/Lb.s};sh.uniforms.uSn={value:Ls.map};sh.uniforms.uSS={value:Lt.s/Ls.s};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aB;attribute float aS;varying float vB;varying float vS;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvB=aB;vS=aS;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uB,uSn;uniform float uBS,uSS;varying float vB;varying float vS;\n'+DITHER)
   .replace('#include <map_fragment>','{vec4 tc=kdither(map,vUv);vec4 tb=kdither(uB,vUv*uBS)*vec4('+(Lb.lib?'1.0,1.0,1.0':'0.55,0.6,0.3')+',1.0);vec4 t=mix(tc,tb,vB);vec4 ts=kdither(uSn,vUv*uSS);t=mix(t,ts,vS);t=mapTexelToLinear(t);diffuseColor*=t;}');};
 m.customProgramCacheKey=()=>'korona-top';return m;})();
(function(){const SMALL={spire:1,fin:1,balanced:1},Lw=layer('rock.wall'),Lt=layer('rock.top'),RC=STAGE.rockCol;
 const BAND=RC.band.map(h=>new THREE.Color(h)),WHITE=new THREE.Color(0xffffff),TOPC=new THREE.Color(RC.top),SOIL=new THREE.Color(RC.soil),c=new THREE.Color();
 const acc={wall:{pos:[],uv:[],col:[],idx:[],b:[],s:[]},top:{pos:[],uv:[],col:[],idx:[],b:[],s:[]}};
 // a top that carries the station's own relief (STAGE.topExtra: the hoar table's knolls and its tarn's basin) is drawn on
 // many more rings and segments, so the drawn pavement follows the field the plants stand on (the owner, 2026-10-19)
 STAGE.bodies.forEach(B=>{const small=!!SMALL[B.kind],relief=!small&&!!STAGE.topExtra,m=KSTACKS.mesh(B,relief?{step:7,topRings:150,segMax:1200}:{step:small?2.5:7}),nv=m.part.length;
  const remap={wall:new Int32Array(nv).fill(-1),top:new Int32Array(nv).fill(-1)};
  for(let i=0;i<m.idx.length;i+=3){const a=m.idx[i],part=m.part[a],key=part===1?'top':'wall',A=acc[key],R=remap[key];
   for(let k=0;k<3;k++){const v=m.idx[i+k];if(R[v]<0){R[v]=A.pos.length/3;const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2],b=B.beds[m.bed[v]];
     A.pos.push(x,y,z);
     if(key==='top'){A.uv.push(m.uv[2*v]/Lt.s,m.uv[2*v+1]/Lt.s);const bog=small?0:STAGE.bogAt(x,z);A.b.push(bog);A.s.push(small||!STAGE.snowAt?0:STAGE.snowAt(x,z));
      c.copy(Lt.lib?WHITE:TOPC).lerp(SOIL,(!small&&y<STAGE.capY)?.3+.3*fbm(x*.01,z*.01,43,2):.05);}
     else{A.uv.push(m.uv[2*v]/Lw.s,m.uv[2*v+1]/Lw.s);const h=KRAND.hash(B.seed,b.k,77)%BAND.length;
      const ang=Math.atan2(z-B.z,x-B.x),streak=small?1:.74+.26*smooth(.3,.7,fbm(ang*9+B.seed%13,y*.012,46,3));
      c.copy(Lw.lib?WHITE:BAND[h]).lerp(BAND[h],Lw.lib?.14:0).multiplyScalar((small?.84+.16*m.occ[v]:.62+.38*m.occ[v])*streak);A.b.push(0);A.s.push(0);}
     A.col.push(c.r,c.g,c.b);}
    A.idx.push(R[v]);}}
  REGISTER({name:B.name||B.id,key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,small?B.R:B.R*.8),h:B.top-B.y0});});
 const mk=(A,mat,label)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.uv,2));
  const cl=new THREE.Float32BufferAttribute(A.col,3);for(let i=0;i<cl.count;i++){c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i)).convertSRGBToLinear();cl.setXYZ(i,c.r,c.g,c.b);}
  g.setAttribute('color',cl);g.setAttribute('aB',new THREE.Float32BufferAttribute(A.b,1));g.setAttribute('aS',new THREE.Float32BufferAttribute(A.s,1));g.setIndex(A.idx);g.computeVertexNormals();
  const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=label;me.userData.host=true;me.userData.rock=true;scene.add(me);ROCK_GEOS.push(g);return me;};
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),STAGE.bodies.length),M4=new THREE.Matrix4();
  STAGE.bodies.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}
 const MAT_WALL=new THREE.MeshStandardMaterial({map:Lw.map,normalMap:Lw.normalMap,roughnessMap:Lw.roughnessMap,roughness:1,metalness:0,vertexColors:true});
 MAT_WALL.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+DITHER).replace('#include <map_fragment>','{vec4 t=kditherW(map,vUv);t=mapTexelToLinear(t);diffuseColor*=t;}');};MAT_WALL.customProgramCacheKey=()=>'korona-wall';
 mk(acc.wall,MAT_WALL,'Quartzite (a tepui\'s wall: pale beds streaked black by the rain\'s algae and lichen)');
 mk(acc.top,MAT_TOP,'The pavement (a top: bare quartzite crusted black, sphagnum in its hollows)');})();

// ---------------------------------------------------------------- THE CARVINGS (LORE.md 6.18): a strip on a bed's face
// One groove a syllable, above or below a guide line: the Hum as the tepui's tribe cuts it, read by anyone who whistles
// it. A band of the carving pattern wrapped on the bed's wall (KSTACKS: the wall's radius at each angle and height),
// registered as a record of its own (key carving) for the inspector and the game.
const CARVINGS=[];
if(STAGE.carvings){const Cv=STAGE.carvings,B=STAGE.bodies.find(b=>b.id===Cv.body)||STAGE.bodies[0],K=KSTACKS;
 // the strip stands Cv.y0 (eye height: 1.6) above the highest DRAWN ground along its arc at the face (the talus banks up
 // to STAGE.talusH against a wall, the apron more: the owner, 2026-10-19, found carvings behind the slope), on whichever
 // bed of the face's tier holds that height (Cv.tier picks the face: 0 the foot of the body, 1 a shoulder's wall)
 const Lc=layer('carving'),tierBeds=B.beds.filter(b=>b.tier===(Cv.tier==null?0:Cv.tier)),b0=tierBeds[0]||B.beds[0];
 let gy=-1e9;for(let i=0;i<=24;i++){const a=Cv.a0+(Cv.a1-Cv.a0)*i/24,q=NECANYONS.wall(B,b0,a,.05),px=q.x+q.nx*1.2,pz=q.z+q.nz*1.2,t=terrainH(px,pz);if(t<b0.y+b0.h*4&&t>gy)gy=t;}
 if(gy<-1e8)gy=b0.y;
 const base=gy+(Cv.y0==null?1.6:Cv.y0);let bed=tierBeds.find(b=>base>=b.y-.01&&base+Cv.h<=b.y+b.h-.5)||tierBeds.find(b=>b.y+b.h-.5>=base+Cv.h)||tierBeds[tierBeds.length-1]||b0;
 let y0b=clamp(base-bed.y,.5,Math.max(.5,bed.h-Cv.h-.5));
 if(Cv.bed!=null){bed=B.beds[Cv.bed];y0b=Cv.y0;}   /* an explicit bed keeps y0 above that bed's foot (the hoar table's rim marks) */
 const u0=y0b/bed.h,u1=(y0b+Cv.h)/bed.h,n=Math.max(24,Math.round((Cv.a1-Cv.a0)*K.footR(bed,(Cv.a0+Cv.a1)/2)/2.5));
 const pos=[],uv=[],idx=[];let arc=0,prev=null;
 for(let i=0;i<=n;i++){const a=Cv.a0+(Cv.a1-Cv.a0)*i/n;
  const lo=NECANYONS.wall(B,bed,a,u0),hi=NECANYONS.wall(B,bed,a,u1),off=.09;
  if(prev)arc+=Math.hypot(lo.x-prev.x,lo.z-prev.z);prev=lo;
  pos.push(lo.x+lo.nx*off,lo.y,lo.z+lo.nz*off,hi.x+hi.nx*off,hi.y,hi.z+hi.nz*off);uv.push(arc/Lc.s,0,arc/Lc.s,Cv.h/Lc.s);
  if(i>0){const k=2*i;idx.push(k-2,k,k-1,k-1,k,k+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const tint=new THREE.Color(STAGE.rockCol.band[0]).multiplyScalar(Lc.lib?1.25:1);
 const mat=new THREE.MeshStandardMaterial({map:Lc.map,normalMap:Lc.normalMap,roughnessMap:Lc.roughnessMap,color:tint,roughness:1,metalness:0,side:THREE.DoubleSide});
 const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=Cv.name;me.userData.host=true;me.userData.rock=true;scene.add(me);
 const am=(Cv.a0+Cv.a1)/2,mid=NECANYONS.wall(B,bed,am,(u0+u1)/2);
 const wallR=K.footR(bed,am)*K.prof(bed,(u0+u1)/2),wallD=Math.hypot(mid.x-bed.cx,mid.z-bed.cz)-wallR;
 const rec={name:Cv.name,key:'carving',kind:'carving',culture:'korona-tepui',x:mid.x,z:mid.z,y:mid.y-Cv.h,r:Math.max(12,arc/2*.35),h:Cv.h*2,hum:true,wallD};
 REGISTER(rec);CARVINGS.push(Object.assign({arc,n,body:B.id,bed:bed.k,groundY:gy,baseY:bed.y+y0b},rec));}

// ---------------------------------------------------------------- THE ICEFALLS (the hoar table): the hanging gardens frozen
// On the high cold table a seep line (NECANYONS.SEEPS: where a bed's parting weeps) hangs no garden but a fall of ice: a
// strip down the bed's face below the parting, on the wall's own profile (NECANYONS.wall, as the carvings are), a hand's
// width off it, narrowing to its foot; the ice map dithered, tinted blue-white. STAGE.icefalls {min (the seep strength
// a fall needs), len(seep) (metres), w(seep) (metres across), every (1: every seep point, 2: every other)}
const ICEFALLS=[];
if(STAGE.icefalls&&LIB['ice']||STAGE.icefalls&&PROC['ice']){const IF=STAGE.icefalls,Li=layer('ice'),pos=[],uv=[],idx=[],K=KSTACKS,every=IF.every==null?2:IF.every,minS=IF.min==null?.45:IF.min;
 (NECANYONS.SEEPS||[]).forEach((sp,i)=>{if(sp.seep<minS||i%every)return;const B=STAGE.bodies[sp.body],bed=B.beds[sp.bed];if(!bed)return;
  const L=Math.min(bed.h*.92,IF.len?IF.len(sp.seep):18+30*sp.seep),w=IF.w?IF.w(sp.seep):5+8*sp.seep,R=K.footR(bed,sp.a),da=w/2/Math.max(8,R),rows=8,NC=5,base=pos.length/3;
  /* NC columns across so the strip follows the wall's flutes, each column's own length (a ragged foot of icicles: hashed
     from the seep's index and the column, core/rand), a hand and a half off the rock */
  const colL=[];for(let c=0;c<NC;c++)colL.push(.55+.45*(KRAND.hash(STAGE.seed,i,c,61)%1000)/1000*(c===0||c===NC-1?.7:1));
  for(let r=0;r<=rows;r++){const t=r/rows,ww=1-.4*t;
   for(let c=0;c<NC;c++){const s=c/(NC-1)*2-1,a=sp.a+s*da*ww,u=1-t*L*colL[c]/bed.h,q=NECANYONS.wall(B,bed,a,u),off=.45;pos.push(q.x+q.nx*off,q.y,q.z+q.nz*off);uv.push((s*w*ww/2)/Li.s,(t*L*colL[c])/Li.s);}
   if(r>0)for(let c=0;c<NC-1;c++){const k=base+r*NC+c,j=k-NC;idx.push(j,j+1,k,j+1,k+1,k);}}
  ICEFALLS.push({x:sp.x,y:sp.y,z:sp.z,len:L,w,seep:sp.seep});});
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({map:Li.map,normalMap:Li.normalMap,roughnessMap:Li.roughnessMap,color:Li.lib?0xbcd6e6:0xa8c8dc,roughness:.3,metalness:.1,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+DITHER).replace('#include <map_fragment>','{vec4 t=kditherW(map,vUv);t=mapTexelToLinear(t);float v=kfbm(vUv*2.3);diffuseColor*=t*mix(vec4(0.72,0.84,0.96,1.0),vec4(1.0),v);}');};
  mat.customProgramCacheKey=()=>'korona-icefall';
  const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=IF.label||'An icefall (a seep line frozen: the hanging garden of the high cold)';me.userData.host=true;me.userData.rock=true;scene.add(me);
  /* tag records only (BIO.record), not the probe's volumes: the falls are one merged mesh, and the probe samples a mesh once */
  ICEFALLS.forEach(f=>BIO.record({name:'An icefall',key:'icefall',x:f.x,z:f.z,y:f.y-f.len,r:Math.max(3,f.w/2),h:f.len}));}}

// ---------------------------------------------------------------- the water: the stream's ribbon, the rain pools, the station's pools
// the stream and the standing water are core/water's since 2026-10-19 (89w-host-water.js: a record each, their drawing);
// here only the page's own surfaces: the ice over a frozen pool, the sucking pools' beds
(function(){
 // A FROZEN POOL (a pool record with ice: the hoar table's tarn; the owner, 2026-10-19: it did not read as a tarn): an
 // opaque plate of ice, pale blue-white on the snow map (dithered), a little sheen, a frost rim of its own
 const ice=STAGE.pools.filter(p=>p.ice);if(ice.length){const Ls=layer('ground.snow'),ip=[],iu=[];
  ice.forEach(p=>{const n=Math.max(24,Math.round(p.r*1.4)),y=p.y+.06;for(let k=0;k<n;k++){const a0=-k/n*TAU,a1=-(k+1)/n*TAU;
   [[p.x,p.z],[p.x+Math.cos(a0)*p.r*1.08,p.z+Math.sin(a0)*p.r*1.08],[p.x+Math.cos(a1)*p.r*1.08,p.z+Math.sin(a1)*p.r*1.08]].forEach(q=>{ip.push(q[0],y,q[1]);iu.push(q[0]/Ls.s/2.2,q[1]/Ls.s/2.2);});}});
  const ig=new THREE.BufferGeometry();ig.setAttribute('position',new THREE.Float32BufferAttribute(ip,3));ig.setAttribute('uv',new THREE.Float32BufferAttribute(iu,2));ig.computeVertexNormals();
  const im=new THREE.MeshStandardMaterial({map:Ls.map,color:Ls.lib?0xa8c8dc:0x9cc0d4,roughness:.16,metalness:.12,envMapIntensity:1});
  im.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+DITHER).replace('#include <map_fragment>','{vec4 t=kdither(map,vUv);t=mapTexelToLinear(t);float v=kfbm(vUv*3.1),w=kfbm(vUv*0.7+vec2(5.0,2.0));diffuseColor*=t*mix(vec4(0.55,0.74,0.92,1.0),vec4(1.0),v*0.5+w*0.5);}');};
  im.customProgramCacheKey=()=>'korona-ice';
  const me=new THREE.Mesh(ig,im);me.userData.probeSkip=true;me.userData.inspectLabel=STAGE.iceLabel||'The frozen tarn (ice over the melt, snow blown on it)';me.userData.host=true;scene.add(me);}})();
// THE SUCKING POOLS' BED (the hollow): the bladder bed shows through the water where the station has pools of that kind
if(STAGE.pools.some(p=>p.bed)){const Lb=layer('ground.bladder'),mat=new THREE.MeshLambertMaterial({map:Lb.map,color:Lb.lib?0xffffff:0x5a7a40});
 const pos=[],uv=[];STAGE.pools.filter(p=>p.bed).forEach(p=>{const n=Math.max(14,Math.round(p.r*1.2)),y=p.y-.35;for(let k=0;k<n;k++){const a0=-k/n*TAU,a1=-(k+1)/n*TAU;
  [[p.x,p.z],[p.x+Math.cos(a0)*p.r*1.06,p.z+Math.sin(a0)*p.r*1.06],[p.x+Math.cos(a1)*p.r*1.06,p.z+Math.sin(a1)*p.r*1.06]].forEach(q=>{pos.push(q[0],y,q[1]);uv.push(q[0]/Lb.s,q[1]/Lb.s);});}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);m.userData.probeSkip=true;m.userData.inspectLabel='The bed of a sucking pool (bladders under the water)';m.userData.host=true;scene.add(m);}
_mark('meshes');
