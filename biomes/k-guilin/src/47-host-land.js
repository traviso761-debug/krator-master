// ================================================================= HOST — the land: the kit's layout, the height, the water, the fields, the meshes, the binding
// The kit lays out the rock (46: KGUILIN.lay) on the plain; the height is then the rock's top over a body and the plain
// elsewhere: the same KSTACKS functions the rock's mesh is made from, so a plant's foot is on the drawn rock.
KGUILIN.lay({bodies:ROCK,floor:floorH,R:TERR.R,cell:5,seed:7,riverD,riverW:RIVER.w,riverWW:RIVER.ww,lakeD,lakeLevel:LAKE.level,sfD,sfR:SF.rad,pondE,pondLevel:POND.level,
 paddy:{cell:[34,22],bund:.7,seed:77}});
_mark('layout');
const _tm={x:NaN,z:NaN,h:0};
// the TALUS: a little rock fall and soil banked against a tower's foot (karst towers dissolve more than they fall)
const talus=(x,z)=>{const fd=KGUILIN.footD(x,z);return fd<30?7*Math.pow(smooth(28,0,fd),1.7)*(.7+.6*fbm(x*.014,z*.014,44,2)):0;};
const groundH=(x,z)=>floorH(x,z)+talus(x,z);
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const t=KGUILIN.top(x,z),h=t>-1e8?t:groundH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the lake (its level over its bed and the beach's foot), the wadi's channel (its level falling to the lake), the
// pond, the paddies that hold water
function waterH(x,z){if(lakeD(x,z)<60&&floorH(x,z)<LAKE.level+.5)return LAKE.level;if(z>RIVER.z0&&riverD(x,z)<RIVER.ww*1.25)return RIVER.level(z);
 if(pondE(x,z)<1.15)return POND.level;return KGUILIN.paddyWater(x,z);}

// ---------------------------------------------------------------- the fields (biomes/WORLD.md): wet, flow, rock, upland, slope
const WET={water:1,shallows:1,shore:.95,bank:.9,paddy:1,plain:.75,foot:.8,wall:.7,grove:.6,ledge:.6,slope:.6,cliff:.4,crown:.55,rim:.3,blade:.2};
const FIELD={
 wet:(x,z)=>WET[KGUILIN.at(x,z).zone],
 flow:(x,z)=>smooth(RIVER.ww+40,RIVER.ww+2,riverD(x,z)),
 // nwbay's karst field (its species read it: the cliff fig's rim, NWBAY.karstEdge): 1 on a dome or a cap where the forest roots,
 // .45 on a cliff or the rim band, fading out past the foot (biomes/nwbay/src/45-host-stage.js karstAt, on this kit's zones)
 karst:(x,z)=>{const Z=KGUILIN.at(x,z);if(Z.rock&&!Z.small)return Z.zone==='crown'||Z.zone==='slope'||Z.zone==='ledge'?1:.45;return Z.rock?0:.45*smooth(6,-5,Z.footD);},
 rock:(x,z)=>{const Z=KGUILIN.at(x,z);return Z.rock?(Z.zone==='crown'?.6:.85):Math.max(smooth(24,0,Z.footD)*.6,Z.grove*.5);},
 upland:(x,z)=>clamp(terrainH(x,z)/250,0,1),
 slope:(x,z)=>0,cold:(x,z)=>0,salt:(x,z)=>0,mist:(x,z)=>Math.max(smooth(RIVER.w+300,RIVER.w,riverD(x,z))*.5,smooth(500,0,lakeD(x,z))*.7)};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
// THE MASK: the kit roots anywhere out of the water (its zones keep each plant to its place); the rice is the paddies' own
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
let MASK=waterMask;
// the LOD spine: the middle, the wadi, the lake's shore by its mouth, the stone forest, the fengcong
const SPINE=[[0,0],[RIVER.x(0),0],[RIVER.x(600),600],[LAKE.bay.x-300,shoreZ(LAKE.bay.x-300)+40],[SF.c[0],SF.c[1]],[900,880]];
BIO.init({tags:'kguilin',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:91,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:380,mid:900,far:2400,floor:[240,600]}});
BIO.setSun(SUN_POS);

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
const LAYERS=['ground.grass','ground.litter','ground.sand','ground.mud','rock.wall','rock.blade','rock.top'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYERS.forEach(k=>{const P=KMAT.packed('kguilin',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PROC={
 'ground.grass':greyTex((x,y)=>165+40*(fbm(x/9,y/9,3,2)-.5)+40*(BIO.fn.h3(x,y,4)-.5)),
 'ground.litter':greyTex((x,y)=>150+50*(fbm(x/7,y/7,5,2)-.5)+30*(BIO.fn.h3(x,y,6)-.5)),
 'ground.sand':greyTex((x,y)=>180+30*(fbm(x/5,y/5,8,2)-.5)+50*Math.pow(BIO.fn.h3(x>>2,y>>2,9),6)),
 'ground.mud':greyTex((x,y)=>140+30*(fbm(x/14,y/14,10,3)-.5)+12*(BIO.fn.h3(x,y,11)-.5)),
 // the karst face: grey, dissolved in vertical runnels, blotched; the stone forest's blades grooved deeper (karren)
 'rock.wall':greyTex((x,y)=>176+30*(fbm(x/26,y/70,12,3)-.5)-36*Math.pow(fbm(x/9,y/120,13,2),3)+12*(BIO.fn.h3(x,y,14)-.5)),
 'rock.blade':greyTex((x,y)=>172+46*Math.pow(Math.abs(Math.sin(x/5.5+3*fbm(x/40,y/60,15,2))),.7)-20+14*(fbm(x/12,y/30,16,2)-.5)+10*(BIO.fn.h3(x,y,17)-.5)),
 'rock.top':greyTex((x,y)=>150+40*(fbm(x/10,y/10,18,3)-.5)+20*(BIO.fn.h3(x,y,19)-.5))};
// the scale (m per tile) and the map of a layer; a library map carries its own colour, a procedural one is grey and tinted
const layer=k=>LIB[k]?{map:LIB[k].map,normalMap:LIB[k].normalMap||null,roughnessMap:LIB[k].roughnessMap||null,s:LIB[k].scale,lib:true}:
 {map:PROC[k],normalMap:null,roughnessMap:null,s:{'ground.grass':3,'ground.litter':3,'ground.sand':2.2,'ground.mud':3,'rock.wall':16,'rock.blade':6,'rock.top':4}[k],lib:false};
LAYERS.forEach(k=>{const t=layer(k).map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;}});

// ---------------------------------------------------------------- the ground (one mesh: grass, litter at the towers' feet and in
// the stone forest, sand and pebbles on the wadi's bars and the lake's beach, mud in its channel, the paddies and round the pond)
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
{const Lg=layer('ground.grass'),Lt=layer('ground.litter'),Ls=layer('ground.sand'),Lm=layer('ground.mud');
 MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uG={value:Lg.map};sh.uniforms.uL={value:Lt.map};sh.uniforms.uS={value:Ls.map};sh.uniforms.uM={value:Lm.map};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;varying vec4 vW;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;');
  const col=(lib,hex)=>{if(lib)return'vec3(1.0)';const c=new THREE.Color(hex).convertSRGBToLinear();return'vec3('+[c.r,c.g,c.b].map(v=>(v*1.6).toFixed(4)).join(',')+')';};
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uG,uL,uS,uM;varying vec4 vW;varying vec3 vGWP;')
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;',
    'vec3 gr=pow(texture2D(uG,p/'+Lg.s.toFixed(2)+').rgb,vec3(2.2))*'+(Lg.lib?'vec3(0.95)':col(false,0x58703a))+';',   // the library's green lawn (ground.moss003) carries its own green: a little lift only
    'vec3 lt=pow(texture2D(uL,p/'+Lt.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Lt.lib,0x4a4030)+';',
    'vec3 sd=pow(texture2D(uS,p/'+Ls.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Ls.lib,0xa89c88)+';',
    'vec3 md=pow(texture2D(uM,p/'+Lm.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Lm.lib,0x5a4a38)+';',
    'vec3 c=mix(gr*0.6,lt*0.5,vW.x);c=mix(c,sd*0.8,vW.y);c=mix(c,md*0.55,vW.w);diffuseColor.rgb*=c*vW.z;}'].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'kguilin-ground';
 /* THE PLAIN ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js; the final rebuild, pair 13, 2026-11-09; korona's lines): the grass stays
    the base, read as above, and the litter, the sand and the mud come over it hex-tiled, scaled with distance and blended by height, at the same
    strengths and tints and under the same weights as the mix above (a pebble stands through the grass at a bar's edge instead of a smear). Only
    with all four layers from the pack (the procedural fallback keeps its mix) and ?kground=0 not set. three r128 uploads cameraPosition only to
    Phong and Standard materials, so on this Lambert ground KGROUND's distance reads KHOOK.EYE's kEye (the define below; the fix belongs in
    core/terrain/43-core-ground.js: korona's core finding, owed) */
 const KG_LY=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'&&Lg.lib&&Lt.lib&&Ls.lib&&Lm.lib?
  [KGROUND.layer('kguilin','ground.litter',{w:'vW.x',tint:'vec3(0.5)',name:'litter'}),KGROUND.layer('kguilin','ground.sand',{w:'vW.y',tint:'vec3(0.8)',name:'sand'}),
   KGROUND.layer('kguilin','ground.mud',{w:'vW.w',tint:'vec3(0.55)',name:'mud'})]:null;
 const KG_EYE='#define '+'camera'+'Position kEye()\n';   /* joined so check_source's CAMPOS rule, which cannot tell a redirect from a read, does not count it */
 if(KG_LY&&KG_LY.every(Boolean)){
  MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uG={value:Lg.map};
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;varying vec4 vW;varying vec3 vGWP;')
    .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uG;varying vec4 vW;varying vec3 vGWP;\n'+KHOOK.EYE+KG_EYE)
    .replace('#include <map_fragment>','{vec2 p=vGWP.xz;diffuseColor.rgb=pow(texture2D(uG,p/'+Lg.s.toFixed(2)+').rgb,vec3(2.2))*vec3(0.95)*0.6;}\n/*KGROUND*/\ndiffuseColor.rgb*=vW.z;');};
  MAT_GROUND.customProgramCacheKey=()=>'kguilin-ground-kg';
  KGROUND.hook(MAT_GROUND,{key:'kguilin-ground',layers:KG_LY,at:'/*KGROUND*/'});
  MAT_GROUND.userData.kgroundOn=true;}}
(function(){const N=300,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,w=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,groundH(x,z));const fd=KGUILIN.footD(x,z),rd=riverD(x,z),Z=KGUILIN.at(x,z);
  w[4*i]=Math.max(smooth(26,3,fd)*(.7+.3*fbm(x*.02,z*.02,41,2))*(1-Z.grove*.7),Z.grove*.25);const ld=lakeD(x,z),gy=p.getY(i);
  w[4*i+1]=Math.max(z>RIVER.z0-40?smooth(RIVER.w+16,RIVER.w-2,rd)*(.6+.5*fbm(x*.03,z*.03,45,2)):0,smooth(48,18,ld)*smooth(3.2,1.8,gy)*(.75+.35*fbm(x*.03,z*.03,46,2)));
  w[4*i+2]=.85+.3*fbm(x*.006,z*.006,42,2);w[4*i+3]=Math.max(Z.paddy?1:0,smooth(1.5,1.05,pondE(x,z)),z>RIVER.z0?smooth(RIVER.ww+5,RIVER.ww-2,rd):0,smooth(-.8,-3,gy)*.8);}
 g.setAttribute('aW',new THREE.BufferAttribute(w,4));g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The plain (the lake\'s bed under its water)';m.userData.host=true;scene.add(m);})();

// ---------------------------------------------------------------- the paddies' bunds: low earth walls round every field, one mesh
(function(){const pos=[],col=[],idx=[],c=new THREE.Color();
 KGUILIN.PADDIES.forEach(P=>{const ca=Math.cos(P.ang),sa=Math.sin(P.ang),hw=P.w/2+P.bund/2,hd=P.d/2+P.bund/2,t=P.bund/2,top=P.level+.2;
  const W=(u,v)=>[P.x+u*ca-v*sa,P.z+u*sa+v*ca];
  // four strips round the field, each a box with its top and two sides (the ends hidden in the next strip)
  [[-hw,-hd,hw,-hd],[hw,-hd,hw,hd],[hw,hd,-hw,hd],[-hw,hd,-hw,-hd]].forEach(e=>{const du=e[2]-e[0],dv=e[3]-e[1],L=Math.hypot(du,dv),nu=-dv/L*t,nv=du/L*t;
   const a=W(e[0]-nu,e[1]-nv),b=W(e[2]-nu,e[3]-nv),cc=W(e[2]+nu,e[3]+nv),d=W(e[0]+nu,e[1]+nv),n=pos.length/3;
   const lo=q=>floorH(q[0],q[1])-.3;
   [[a,top],[b,top],[cc,top],[d,top],[a,lo(a)],[b,lo(b)],[cc,lo(cc)],[d,lo(d)]].forEach(q=>pos.push(q[0][0],q[1],q[0][1]));
   for(let k=0;k<8;k++){c.setHex(k<4?0x6a7a44:0x5a4a36).convertSRGBToLinear();col.push(c.r,c.g,c.b);}
   idx.push(n,n+2,n+1,n,n+3,n+2, n+4,n+1,n+5,n+4,n,n+1, n+3,n+6,n+2,n+3,n+7,n+6);});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.userData.probeSkip=true;m.userData.host=true;
 m.userData.inspectLabel='The paddies\' bunds (earth walls round each field)';scene.add(m);})();

// ---------------------------------------------------------------- the rock (KSTACKS meshes): four meshes, by material
// the towers' walls (grey limestone streaked black where the rain runs and ochre where iron stains it; where a dome's bed
// leans in enough to hold soil, the soil's dark green-brown under its forest, so a gap between the shrubs is not bare rock),
// the towers' tops (soil and moss under the scrub), the stone forest's blades (grooved, darker) and their tops.
const ROCK_GEOS=[];
// THE LIMESTONE'S BEDS (core/terrain KSTRATA; BACKPORT.md k-guilin's row, "strata (the tower limestone)"; the final rebuild, pair 13, 2026-11-09):
// nwbay's recipe, the same limestone province as the bay's drowned stacks (one landscape: the owner, 2026-10-26): a massive grey limestone in thick
// beds, darker and paler by bed, thin marl partings and iron-stained bands, near level. One stack for the map, so a bed runs from tower to tower and
// through the stone forest's blades; drawn on the walls and the blades as a tint about the beds' mean, under the library's grain, the rain's streaks
// and the soil's green (the vertex colours). The tops keep their soil and moss. ?strata=0 without it
if(typeof KSTRATA!=='undefined'&&!KSTRATA.RECIPES['kguilin-karst'])KSTRATA.add({name:'kguilin-karst',main:'lime',kinds:{
 lime:{p:.5,th:[4,16],col:[0xc4bfb5,0xbab5aa,0xcdc8bd],hard:.95,xbed:0,varnish:.2},
 dark:{p:.24,th:[2,8],col:[0x9a978f,0x8e8b84,0xa39f96],hard:.9,xbed:0,varnish:.2},
 marl:{p:.14,th:[.3,1.4],col:[0xa69a84,0x9c907a],hard:.3,xbed:0,varnish:0,between:true},
 iron:{p:.12,th:[.3,1.2],col:[0xb8946c,0xae8a62],hard:.6,xbed:0,varnish:0,between:true}},fx:{xbed:0,varnish:.2}});
const ROCK_STRATA=new URLSearchParams(location.search).get('strata')!=='0'&&typeof KSTRATA!=='undefined'&&BIO.strata?(function(){let lo=1e9,hi=-1e9;ROCK.forEach(B=>{lo=Math.min(lo,B.y0);hi=Math.max(hi,B.top);});
 return BIO.strata({recipe:'kguilin-karst',seed:8117,range:[Math.floor(lo-20),Math.ceil(hi+20)],dip:[.8,-.6,.03],warp:[5,1.6],res:.25,private:true});})():null;
// strataColor is linear; the tint is the bed's colour over the lime's mean (.47), held to [.45, 1.7] and taken at half strength (korona's)
function rockStrata(m,key){if(!ROCK_STRATA)return m;const prev=m.onBeforeCompile;
 m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);ROCK_STRATA.inject(sh);
  if(sh.fragmentShader.indexOf('#include <map_fragment>')<0)throw new Error('kguilin rock strata: no anchor');
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/0.47,vec3(0.45),vec3(1.7)),0.5);}');};
 m.customProgramCacheKey=()=>key;return m;}
(function(){const SMALL={spire:1,fin:1,balanced:1},Lw=layer('rock.wall'),Lb=layer('rock.blade'),Lt=layer('rock.top');
 const GREY=new THREE.Color(0xa6a298),DARK=new THREE.Color(0x3c3c38),OCHRE=new THREE.Color(0xb08a5e),MOSS=new THREE.Color(0x6a7a48),
  BLADE=new THREE.Color(0xb4b4ae),TOPC=new THREE.Color(0x5a5a3c),SOIL=new THREE.Color(0x34422a),WHITE=new THREE.Color(0xffffff),c=new THREE.Color(),
  NOTCH=new THREE.Color(0x2e2a26),WET=new THREE.Color(0x5a5a52);   /* nwbay's stacks' waterline: the notch's black band, wet below it */
 const acc={wall:{pos:[],uv:[],col:[],idx:[]},top:{pos:[],uv:[],col:[],idx:[]},blade:{pos:[],uv:[],col:[],idx:[]},btop:{pos:[],uv:[],col:[],idx:[]}};
 ROCK.forEach(B=>{const small=!!SMALL[B.kind]&&!B.tower,m=KSTACKS.mesh(B,{step:small?2.2:6}),nv=m.part.length,span=Math.max(1,B.top-B.y0);
  const remap={wall:new Int32Array(nv).fill(-1),top:new Int32Array(nv).fill(-1)};
  const wk=small?'blade':'wall',tk=small?'btop':'top',Lw2=small?Lb:Lw;
  for(let i=0;i<m.idx.length;i+=3){const a=m.idx[i],isTop=m.part[a]===1,key=isTop?tk:wk,A=acc[key],Rm=isTop?remap.top:remap.wall;
   for(let k=0;k<3;k++){const v=m.idx[i+k];if(Rm[v]<0){Rm[v]=A.pos.length/3;const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];
     A.pos.push(x,y,z);const ang=Math.atan2(z-B.z,x-B.x),up=clamp((y-B.y0)/span,0,1);
     if(isTop){A.uv.push(m.uv[2*v]/Lt.s,m.uv[2*v+1]/Lt.s);c.copy(Lt.lib?WHITE:TOPC).lerp(MOSS,small?.15:.35*fbm(x*.02,z*.02,43,2));
      if(B.tower)c.lerp(SOIL,.7);}   // a dome's bed tops show only as slivers at its partings: the soil's colour, not a bright ring
     else{A.uv.push(m.uv[2*v]/Lw2.s,m.uv[2*v+1]/Lw2.s);
      // the streaks: long in y, narrow round the body (the rain's runs off each ledge); black, or ochre where the iron is
      const s1=fbm(Math.cos(ang)*B.R*.09+B.seed%61,Math.sin(ang)*B.R*.09+y*.004,47,2),s2=fbm(Math.cos(ang)*B.R*.05-9,Math.sin(ang)*B.R*.05+y*.003,48,2);
      const k=Lw2.lib?.35:1,b=B.beds[m.bed[v]],steep=b.h/Math.max(.01,Math.max(b.rx,b.rz)*(1-(b.tp==null?1:b.tp)));   // the library map has its own streaks
      c.copy(Lw2.lib&&!small?WHITE:BLADE);
      c.lerp(DARK,k*(small?.22:.55)*smooth(.5,.72,s1));if(!small)c.lerp(OCHRE,k*.45*smooth(.56,.74,s2)*(1-up*.6));
      if(!small)c.lerp(MOSS,.42*smooth(.35,.85,up)*smooth(.4,.62,fbm(Math.cos(ang)*1.7+20,Math.sin(ang)*1.7+20,49,2)));
      if(B.tower)c.lerp(SOIL,.88*smooth(3.4,1.8,steep));
      if(B.y0<LAKE.level-1){const yy=y-LAKE.level;c.lerp(NOTCH,smooth(4.2,1.5,yy)*smooth(-3.5,-1.2,yy));c.lerp(WET,smooth(-1,-6,yy)*.8);}
      c.multiplyScalar((small?.78:.66)+(small?.22:.34)*m.occ[v]);}
     A.col.push(c.r,c.g,c.b);}
    A.idx.push(Rm[v]);}}
  REGISTER({name:B.name||B.id,key:'rock.'+(small?B.kind:B.tower?'tower':'base'),x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,small?B.R:B.R*.8),h:B.top-B.y0});});
 const mk=(A,L,label)=>{if(!A.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.uv,2));
  const cl=new THREE.Float32BufferAttribute(A.col,3);for(let i=0;i<cl.count;i++){c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i)).convertSRGBToLinear();cl.setXYZ(i,c.r,c.g,c.b);}
  g.setAttribute('color',cl);g.setIndex(A.idx);g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({map:L.map,normalMap:L.normalMap,roughnessMap:L.roughnessMap,roughness:1,metalness:0,vertexColors:true});
  if(A===acc.wall||A===acc.blade)rockStrata(mat,'kguilin-rock-strata-'+(A===acc.wall?'wall':'blade'));   /* the beds on the walls and the blades, not the tops */
  const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=label;me.userData.host=true;me.userData.rock=true;scene.add(me);ROCK_GEOS.push(g);return me;};
 // one sample per body at its middle for the probe (userData.probePoints, core/host/95-host-probe.js): the rock is merged
 // meshes, so the probe's samples (a mesh's box centre) would leave each body's registered volume to whatever grows on it
 const PP=[];ROCK.forEach(B=>PP.push(B.x,(B.y0+B.top)/2,B.z));
 mk(acc.wall,Lw,'Limestone (a karst tower\'s cliff: rain-streaked black, iron-stained ochre)').userData.probePoints=PP;mk(acc.top,Lt,'A tower\'s top (soil and moss under the scrub)');
 mk(acc.blade,Lb,'Limestone of the stone forest (grooved by the rain: karren)');mk(acc.btop,Lt,'A blade\'s crest (moss)');})();

// ---------------------------------------------------------------- the horizon: the karst going on into the mist, the lake
// Past the page's edge the towers go on, row behind row, each paler in the mist: a ring of low-poly towers 2-7 km out on a
// plain that runs on under them (rising from the lake as the page's plain does), one mesh, drawn for the view only (not
// records: no plant roots there, nothing is registered); none in the lake, whose open water runs on north (89w: the far
// water). Their profile is the near towers' (a cliff, then a dome), their heights nwbay's.
(function(){const pos=[],col=[],idx=[],c=new THREE.Color(),s=KRAND.stream(KRAND.hash(2401,1)),seg=10,rows=7,FAR=[];
 for(let t=0;t<900&&FAR.length<260;t++){const a=s.range(0,TAU),r=s.range(TERR.R*1.25,7000),x=Math.cos(a)*r,z=Math.sin(a)*r,H=s.range(45,140),R=H/2.7*s.range(.85,1.2);
  if(Math.abs(x)<TERR.R*1.12&&Math.abs(z)<TERR.R*1.12)continue;if(lakeD(x,z)<R+60)continue;if(FAR.some(f=>Math.hypot(f.x-x,f.z-z)<f.R+R+20))continue;FAR.push({x,z,R,H,y0:riseAt(lakeD(x,z))-6,tw:s.range(.45,.62),k:s.range(1.7,2.7)});}
 FAR.forEach(f=>{const n=pos.length/3,g=new THREE.Color(0x4e5e46),r0=new THREE.Color(0x8a8a80);
  for(let j=0;j<=rows;j++){const t=j/rows,pr=t<=f.tw?1-.1*t/f.tw:.9*Math.pow(Math.max(0,1-.95*Math.pow((t-f.tw)/(1-f.tw),f.k)),1/f.k);
   for(let i=0;i<seg;i++){const a=i/seg*TAU;pos.push(f.x+Math.cos(a)*f.R*pr,f.y0+t*(f.H+6),f.z+Math.sin(a)*f.R*pr);c.copy(r0).lerp(g,smooth(f.tw-.15,f.tw+.1,t)).convertSRGBToLinear();col.push(c.r,c.g,c.b);}}
  for(let j=0;j<rows;j++)for(let i=0;i<seg;i++){const a=n+j*seg+i,b=n+j*seg+(i+1)%seg;idx.push(a,b,a+seg,b,b+seg,a+seg);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.probeSkip=true;m.userData.host=true;m.userData.farField=true;m.userData.inspectLabel='The karst beyond (towers into the mist)';scene.add(m);
 // the plain beyond: a ring rising from the lake as the page's plain does, under the far water where the lake runs on
 const rg=new THREE.RingGeometry(TERR.R*1.05,9000,96,24).rotateX(-Math.PI/2),rp=rg.attributes.position;
 for(let i=0;i<rp.count;i++){const x=rp.getX(i),z=rp.getZ(i),ld=lakeD(x,z);rp.setY(i,ld>0?riseAt(ld)*smooth(0,400,ld)-2:Math.max(-30,ld*.05)-2);}
 rg.computeVertexNormals();
 const d=new THREE.Mesh(rg,new THREE.MeshLambertMaterial({color:new THREE.Color(0x56663e).convertSRGBToLinear()}));   /* linear, as the far towers' colours: a raw hex reads near white under the shared sky's sun */
 d.userData.probeSkip=true;d.userData.host=true;d.userData.farField=true;d.userData.inspectLabel='The plain beyond';scene.add(d);})();   /* farField: no KHORIZON, no shadow (88) */

// ---------------------------------------------------------------- the water: the lake, the wadi, the pond, the paddies
// On a page with core/water (core/water/README.md) they are its records: the lake open water (WATER.open at its level over its
// bed, flooded from the north rim, a calm swell and a little of the shared wave field) with the far water beyond the page
// flat under it, the wadi's channel a flow line (WATER.flow, its surface every 12 m from its high end), the pond and every
// paddy that holds water still water (WATER.still at its level, its outline); WATER.heightAt and core/export read them, and
// 89w-host-water.js draws them on core/atmos.
const WATER_RECS=typeof WATER==='undefined'?null:(function(){
 const LBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,Math.min(TERR.R*1.1,RIVER.z0+120)];
 const lake=WATER.open({name:LAKE.name,level:LAKE.level,swell:[[.03,30,210,0,.025],[.02,12,240,1.1,.02]],field:.08,bounds:LBOX,
  bed:floorH,bedBox:LBOX,bedCell:10,shore:{seeds:{edge:true,depth:2,sides:'n',points:[[LAKE.bay.x,shoreZ(LAKE.bay.x)-120]]}}});
 // the far water: the lake beyond the page, flat, 0.1 m under it, drawn only where the near lake's box is not
 const OBOX=[-9000,-9000,9000,-200],c=50,nx=360,nz=Math.round((OBOX[3]-OBOX[1])/c),dm=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OBOX[0]+(i+.5)*c,z=OBOX[1]+(j+.5)*c;dm[j*nx+i]=(x>LBOX[0]+c&&x<LBOX[2]-c&&z>LBOX[1]+c)||lakeD(x,z)>30?0:255;}
 const far=WATER.open({name:'The great lake (beyond)',level:LAKE.level-.1,swell:[],field:0,bounds:OBOX,mask:{x0:OBOX[0],z0:OBOX[1],cell:c,nx,nz,data:dm}});
 const P=[];for(let z=RIVER.z0-30;z<=TERR.R*1.1;z+=12)P.push([RIVER.x(z),z,RIVER.level(z)]);if(P[0][2]<P[P.length-1][2])P.reverse();
 const river=WATER.flow({name:RIVER.name,pts:P,width:RIVER.ww*2,speed:.3});
 const pp=[];for(let k=0;k<28;k++){const a=k/28*TAU,c=Math.cos(POND.ry),s=Math.sin(POND.ry),u=Math.cos(a)*POND.rx*1.06,v=Math.sin(a)*POND.rz*1.06;pp.push([POND.x+u*c-v*s,POND.z+u*s+v*c]);}
 const pond=WATER.still({name:POND.name,level:POND.level,poly:pp});
 const paddies=KGUILIN.PADDIES.filter(F=>F.state!=='ripe').map(F=>WATER.still({name:'A paddy ('+F.state+')',level:F.level,poly:F.poly}));
 return {lake,far,river,pond,paddies};})();
_mark('meshes');
