// ================================================================= HOST — the land: the kit's layout, the height, the water, the fields, the meshes, the binding
// The kit lays out the rock (46: NECANYONS.lay) on the floor; the height is then the rock's top over a body and the floor
// elsewhere: the same KSTACKS functions the rock's mesh is made from, so a plant's foot is on the drawn rock.
// Another world reads this fragment in place (settlements/pinnacle-rock) and says what differs in a LAND object its host
// stage defines: {capY, spine (the LOD origins), tags, creek:false (no creek ribbon), clear:(x,z)=>0..1 (cleared ground:
// the hyperjungle thinned by it), talus:{h:(x,z,fd)=>m, w} (the debris slope round a wall's foot and its width), groundN (the
// floor mesh's cells a side), wallStep (m: the rock walls' segments)}. Without one, this page's own values.
const LANDO=typeof LAND==='undefined'?{}:LAND;
// the final rebuild's terrain and rock (2026-10-27): on this page, and on a world that asks (LAND.rebuild); a world reading the
// fragment in place without it keeps its land and rock as they were (below: the talus, the water works, the rock's beds and wear)
const NEWROCK=typeof LAND==='undefined'||!!LANDO.rebuild,RQ=new URLSearchParams(location.search);
NECANYONS.lay({bodies:ROCK,floor:floorH,R:TERR.R,capY:LANDO.capY==null?330:LANDO.capY,cell:5,seed:7,
 footMax:LANDO.talus?LANDO.talus.w+10:null});   // a wide debris slope needs its foot distance measured that far out
_mark('layout');
const _tm={x:NaN,z:NaN,h:0};
// the TALUS: the floor rises against a wall's foot, the rock's fall and sand banked up (the wall goes down into it)
const TALW=LANDO.talus?LANDO.talus.w:55;
/* the creek's bed (its water: + CREEK.depth). GRADED (2026-11-02; WATER.audit on the fine strip: the water rose downstream by up to 4 m and ran under the
   savanna's talus): the floor's line every 12 m (the water's own points), the running minimum from the high end, so the water never climbs */
const creekBed=(function(){const raw=z=>floorH(CREEK.x(z),z);if(!NEWROCK||LANDO.creek===false)return raw;
 const z0=-TERR.R*1.1,n=Math.floor(TERR.R*2.2/12)+1,Y=[];for(let i=0;i<n;i++)Y.push(raw(z0+i*12));
 if(Y[0]>=Y[n-1]){for(let i=1;i<n;i++)Y[i]=Math.min(Y[i],Y[i-1]);}else{for(let i=n-2;i>=0;i--)Y[i]=Math.min(Y[i],Y[i+1]);}
 return z=>{const u=Math.max(0,Math.min(n-1,(z-z0)/12)),i=Math.min(n-2,Math.floor(u));return Y[i]+(Y[i+1]-Y[i])*(u-i);};})();
/* the channel on that bed: within w + 8 m the ground is this section (the bed at the middle, the water's level just past the ribbon's edge, then a bank of 1 in 4), so
   water and ground meet where the ribbon ends whatever the floor's cross slope; out to w + 30 m nothing stands over the section (a talus cut through) */
const creekGround=!NEWROCK||LANDO.creek===false?(x,z,h)=>h:(x,z,h)=>{const d=creekD(x,z),w=CREEK.w;if(d>=w+30)return h;const o=w+.8,b=creekBed(z)+(d<o?CREEK.depth*d*d/(o*o):CREEK.depth+(d-o)*.25),c=h+(Math.min(h,b)-h)*smooth(w+30,w+12,d);return c+(b-c)*smooth(w+8,w+2,d);};
/* the default talus is core/terrain's (KRELIEF.talus, lifted from Korona: the same apron, 18 m high, 55 m out) where the page
   rebuilds its land; the kit's own copy of it otherwise */
const talus=LANDO.talus?(x,z)=>{const fd=NECANYONS.footD(x,z);return fd<TALW?LANDO.talus.h(x,z,fd):0;}:
 NEWROCK&&typeof KRELIEF!=='undefined'&&KRELIEF.talus?KRELIEF.talus({footD:NECANYONS.footD,h:18,reach:55,curve:1.6,rough:.5,scale:.012,seed:44}):
 (x,z)=>{const fd=NECANYONS.footD(x,z);return fd<60?18*Math.pow(smooth(55,0,fd),1.6)*(.75+.5*fbm(x*.012,z*.012,44,2)):0;};
const ground0=(x,z)=>creekGround(x,z,floorH(x,z)+talus(x,z));
/* THE WATER WORKS AT THE SEEPS (2026-10-27, the final rebuild; BACKPORT.md's row: karst springs at the seeps, tall falls where the
   streams drop, a confluence where they meet; ?springs=0 without them). Where the High Cap's spring line comes out of its eastern face
   nearest the creek, the seep runs as a TALL FALL down the wall (core/water drawFall with plungeR and footK, 89w) on to the talus, into
   its plunge pool, and on as a stream to the creek, which it joins in a CONFLUENCE (core/water ext/55: one water over the mouth). At the
   Bench's two wettest seeps on the floor's side the water wells up out of the talus as KARST SPRINGS (ext/54: a blue-green pool, the
   boil at its vent, a short clear run). The ground is carved under them: bowls under the pools, the stream's channel to the creek,
   only ever lower (the plants then keep off them: waterH answers them) */
const WORKS=(function(){if(!NEWROCK||RQ.get('springs')==='0'||!NECANYONS.SEEPS)return null;
 const out={fall:null,springs:[],chan:null,chans:[]};
 const outFoot=(S,fd)=>{let x=S.x,z=S.z;for(let k=0;k<400;k++){x+=S.nx;z+=S.nz;if(!NECANYONS.rockAt(x,z)&&NECANYONS.footD(x,z)>=fd)break;}return [x,z];};
 const rimMin=(x,z,r)=>{let m=1e9;for(let i=0;i<16;i++){const a=i/16*TAU;m=Math.min(m,ground0(x+Math.cos(a)*r,z+Math.sin(a)*r));}return m;};
 // the fall: the High Cap's (body 1) seep, on its lower tier, nearest the creek
 /* which bodies carry them: station 1's High Cap and Bench; a station names its own (LAND.works {fall, springs}: body ids) or none (false) */
 const WB=LANDO.works===false?null:Object.assign({fall:'highcap',springs:'bench'},LANDO.works||{}),bix=id=>ROCK.findIndex(B=>B.id===id);if(!WB)return null;
 const fB=bix(WB.fall),sB=bix(WB.springs);
 const hc=NECANYONS.SEEPS.filter(S=>S.body===fB&&S.seep>.12).sort((a,b)=>creekD(a.x,a.z)-creekD(b.x,b.z))[0];
 if(hc){const F=outFoot(hc,2),P=outFoot(hc,16),r=6.5,lvl=rimMin(P[0],P[1],r)-.15;
  // the stream: from the pool's outlet straight to the creek's edge, never climbing (each point the lowest ground so far less .25)
  const cz=P[1],cx=CREEK.x(cz),dx=cx-P[0],dz=cz-P[1],dl=Math.hypot(dx,dz),ux=dx/dl,uz=dz/dl,run=Math.max(10,dl-CREEK.w*.6),pts=[];let yc=lvl;
  for(let k=0;k<=16;k++){const t=k/16,x=P[0]+ux*(r*.8+t*(run-r*.8)),z=P[1]+uz*(r*.8+t*(run-r*.8));yc=Math.min(yc,ground0(x,z)-.25,k===16?creekBed(z)+CREEK.depth:1e9);pts.push([x,z,yc]);}
  out.fall={seep:hc,lip:[hc.x,hc.z,hc.y],dir:[hc.nx,hc.nz],foot:[F[0],F[1]],pool:{x:P[0],z:P[1],r,level:lvl},dir2:[ux,uz]};
  out.chan={pts,w:2.2,depth:.7};out.chans.push(out.chan);}
 // the springs: the Bench's (body 0) two wettest seeps whose foot is on the floor, 400 m apart
 const bs=NECANYONS.SEEPS.filter(S=>S.body===sB&&S.seep>.3).sort((a,b)=>b.seep-a.seep);
 for(const S of bs){if(out.springs.length>=2)break;const P=outFoot(S,30);if(creekD(P[0],P[1])<60)continue;
  if(out.springs.some(q=>Math.hypot(q.x-P[0],q.z-P[1])<400))continue;const r=5,lvl=rimMin(P[0],P[1],r)-.12,line=[];let yc=lvl;
  /* its run: 40 m out from the wall, a channel a metre and a half wide, never climbing */
  for(let k=0;k<=10;k++){const t=k/10,x=P[0]+S.nx*(r*.8+t*40),z=P[1]+S.nz*(r*.8+t*40);yc=Math.min(yc,ground0(x,z)-.2);line.push([x,z,yc]);}
  out.springs.push({x:P[0],z:P[1],r,level:lvl,dir:[S.nx,S.nz],seep:S,line});out.chans.push({pts:line,w:1.4,depth:.45});}
 return out;})();
const segD=(x,z,a,b)=>{const ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1,t=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1);return [Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t),a[2]+(b[2]-a[2])*t];};
/* the nearest channel of the works (the fall's stream, the springs' runs): its distance, its water's level there, its half width and depth */
const chanAt=(x,z)=>{if(!WORKS)return null;let bd=1e9,by=0,bc=null;for(const C of WORKS.chans)for(let i=0;i<C.pts.length-1;i++){const r=segD(x,z,C.pts[i],C.pts[i+1]);if(r[0]-C.w<bd){bd=r[0]-C.w;by=r[1];bc=C;}}
 return bc?{d:bd+bc.w,y:by,w:bc.w,depth:bc.depth}:null;};
const groundH=!WORKS?ground0:(x,z)=>{let h=ground0(x,z);
 const bowl=(P,deep)=>{const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.7)h=Math.min(h,mix(P.level-deep,h,smooth(P.r*.8,P.r*1.7,d)));};
 if(WORKS.fall)bowl(WORKS.fall.pool,1.6);WORKS.springs.forEach(P=>bowl(P,1.2));
 const c=chanAt(x,z);if(c&&c.d<c.w*2.6)h=Math.min(h,mix(c.y-c.depth,h,smooth(c.w*.6,c.w*2.6,c.d)));
 return h;};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const t=NECANYONS.top(x,z),h=t>-1e8?t:groundH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the creek (its bed + depth) and the rain pools on the caps
function waterH(x,z){if(creekD(x,z)<CREEK.w*1.3)return creekBed(z)+CREEK.depth;const p=NECANYONS.potholeAt(x,z);if(p)return p.y;
 if(WORKS){const P=WORKS.fall&&WORKS.fall.pool;if(P&&Math.hypot(x-P.x,z-P.z)<P.r*1.2)return P.level;for(const S of WORKS.springs)if(Math.hypot(x-S.x,z-S.z)<S.r*1.2)return S.level;
  const c=chanAt(x,z);if(c&&c.d<c.w*1.2)return c.y;}
 return -1e9;}

// ---------------------------------------------------------------- the fields (biomes/WORLD.md): wet, flow, rock, upland, slope
// read off the kit's zones (46); the kit reads its own zones directly (NECANYONS.at)
const WET={floor:1,foot:.92,wall:.9,ledge:.85,rim:.4,bench:.55,cap:.2,stack:.3};
const FIELD={
 wet:(x,z)=>{const Z=NECANYONS.at(x,z);return clamp(WET[Z.zone]+.3*Z.seep,0,1);},
 flow:(x,z)=>smooth(CREEK.w+26,CREEK.w+2,creekD(x,z)),
 rock:(x,z)=>{const Z=NECANYONS.at(x,z);return Z.rock?(Z.zone==='bench'?.55:.85):smooth(30,0,Z.footD)*.6;},
 upland:(x,z)=>clamp(terrainH(x,z)/450,0,1),
 slope:(x,z)=>0,cold:(x,z)=>0,mist:(x,z)=>0};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
// THE MASK is swapped per kit by the build (88): this kit roots anywhere out of the water (its zones keep each plant to
// its place); the hyperjungle only on the floor, off the walls' feet and the creek, thinning northward toward Korona
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
const jungleMask=(x,z)=>{if(NECANYONS.rockAt(x,z))return 0;const fd=NECANYONS.footD(x,z);if(fd<28)return 0;
 return smooth(28,60,fd)*smooth(CREEK.w+10,CREEK.w+40,creekD(x,z))*(.55+.45*smooth(-1400,600,z))*waterMask(x,z)*(LANDO.clear?LANDO.clear(x,z):1);};
let MASK=waterMask;
// the LOD spine: the middle, the bodies, the creek
const SPINE=LANDO.spine||[[0,0],[300,0],[-60,560],[CREEK.x(400),400]];
BIO.init({tags:LANDO.tags||'necanyons',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:83,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:420,mid:950,far:2400,floor:[260,650]}});
BIO.setSun(SUN_POS);

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 ['ground.litter','ground.talus','ground.sand','rock.wall','rock.stack','rock.top','rock.red','rock.bed','rock.cap','rock.tepui'].forEach(k=>{const P=KMAT.packed('necanyons',k);
  if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PROC={
 'ground.litter':greyTex((x,y)=>150+50*(fbm(x/7,y/7,3,2)-.5)+30*(BIO.fn.h3(x,y,4)-.5)),
 'ground.talus':greyTex((x,y)=>165+40*(fbm(x/11,y/11,5,2)-.5)+40*(BIO.fn.h3(x,y,6)-.5)),
 'ground.sand':greyTex((x,y)=>185+20*(fbm(x/5,y/5,8,2)-.5)+30*(BIO.fn.h3(x,y,9)-.5)),
 'rock.wall':greyTex((x,y,w,h)=>175+28*(fbm(x/40,y/6,10,3)-.5)-40*Math.pow(fbm(x/14,y/90,11,2),3)+12*(BIO.fn.h3(x,y,12)-.5)),
 'rock.stack':greyTex((x,y,w,h)=>180+30*Math.sin(y/9+fbm(x/30,y/30,13,2)*5)+12*(BIO.fn.h3(x,y,14)-.5)),
 'rock.top':greyTex((x,y)=>185+26*(fbm(x/12,y/12,15,3)-.5)-60*smooth(.62,.7,fbm(x/24,y/24,16,2))+10*(BIO.fn.h3(x,y,17)-.5))};
// the scale (m per tile) and the map of a layer; a library map carries its own colour, a procedural one is grey and tinted
const layer=k=>LIB[k]?{map:LIB[k].map,normalMap:LIB[k].normalMap||null,roughnessMap:LIB[k].roughnessMap||null,s:LIB[k].scale,lib:true}:
 {map:PROC[k],normalMap:null,roughnessMap:null,s:{'ground.litter':3,'ground.talus':2.6,'ground.sand':2,'rock.wall':20,'rock.stack':12,'rock.top':4,'rock.red':14,'rock.bed':10,'rock.cap':4}[k],lib:false};
['ground.litter','ground.talus','ground.sand','rock.wall','rock.stack','rock.top','rock.red','rock.bed','rock.cap','rock.tepui'].forEach(k=>{if(!LIB[k]&&!PROC[k])return;const t=layer(k).map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;}});

// ---------------------------------------------------------------- the floor (one mesh: litter, talus at the walls' feet, sand by the creek)
/* THE FLOOR'S LIGHT PER PIXEL (2026-11-04, the ground catch-up; core/terrain/GROUND.md): where the page lists KGROUND the floor is
   MeshStandard, so the relief's bump and cavities reach the light (r128's Lambert lights per vertex, here on 16 m cells); ?kground=0,
   or a world reading this fragment without KGROUND, keeps the Lambert. ?kgrelief=0 drops the relief (the before-and-after) */
const KG_ON=typeof KGROUND!=='undefined'&&RQ.get('kground')!=='0',KG_RELIEF=KG_ON&&RQ.get('kgrelief')!=='0';
const MAT_GROUND=KG_ON?new THREE.MeshStandardMaterial({color:0xffffff,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({color:0xffffff});
{const Lt=layer('ground.litter'),Lr=layer('ground.talus'),Ls=layer('ground.sand');
 MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uL={value:Lt.map};sh.uniforms.uR={value:Lr.map};sh.uniforms.uS={value:Ls.map};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aW;varying vec3 vW;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;');
  const col=(lib,hex)=>{if(lib)return'vec3(1.0)';const c=new THREE.Color(hex).convertSRGBToLinear();return'vec3('+[c.r,c.g,c.b].map(v=>(v*1.6).toFixed(4)).join(',')+')';};
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL,uR,uS;varying vec3 vW;varying vec3 vGWP;')
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;',
    'vec3 lt=pow(texture2D(uL,p/'+Lt.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Lt.lib,0x3a3020)+';',
    'vec3 rd=pow(texture2D(uR,p/'+Lr.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Lr.lib,0x8a5236)+';',
    'vec3 sd=pow(texture2D(uS,p/'+Ls.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Ls.lib,0xa87a5a)+';',
    'vec3 c=mix(lt*0.42,rd*0.8,vW.x);c=mix(c,sd*0.75,vW.y);diffuseColor.rgb*=c*vW.z;}'].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'necanyons-ground';
 /* THE FLOOR ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js; 2026-10-27, the final rebuild; BACKPORT.md's row, "clast on
    the scree"): the same three layers at the same strengths (the litter at .42, the talus at .8 by the walls' feet, the creek's sand at
    .75), hex-tiled and scaled with distance, blended by height so the talus's stones stand through the litter at its edge; and on the
    talus's steeper, nearer half a CLAST layer: the rock's fall as blocks of the stacks' red sandstone, 0.3-1 m, packed in a matrix of
    red soil. Only where the page lists KGROUND (a world reading this fragment in place keeps its mix above) and ?kground=0 is not set */
 if(typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'){
  /* a station's floor (LAND.ground): its base layer (the savanna's red soil for the litter) and a DESERT PAVEMENT, small clasts packed
     where its field (KRELIEF.pavement, by vertex: aP) says the wind has taken the fines */
  const GO=LANDO.ground||{},PAVE=typeof GO.pave==='function';
  /* THE MOTTLE (the owner, 2026-10-27: "too yellow, needs green mottling"; the savanna "too brown/orange, more yellow mottling"): two
     octaves of value noise on the world position (patches of ~45 m and ~11 m) tint the floor after its layers, toward the moss and the
     jungle's green (or a station's own: LAND.ground.mottle {tint, amt}); the base litter itself a little less yellow. ?mottle=0 */
  const MOT=RQ.get('mottle')==='0'?null:Object.assign({tint:'vec3(0.42,0.88,0.36)',amt:.85},GO.mottle||{});
  const LY=[KGROUND.layer('necanyons',GO.base||'ground.litter',{w:'1.0',tint:GO.baseTint||(MOT?'vec3(0.36,0.41,0.42)':'vec3(0.42)'),name:'base'}),
   KGROUND.layer('necanyons','ground.talus',{w:'vW.x',tint:'vec3(0.8)',name:'talus'}),
   KGROUND.layer('necanyons','rock.red',{kind:'clast',w:'smoothstep(0.45,0.85,vW.x)',amt:.7,proj:'xz',size:.7,jitter:.9,matrix:.1,sub:.22,fleck:0,
    matrixColor:0x6b3a26,tint:'vec3(0.85)',seed:KRAND.hash(4747,0,1,7)%997,name:'scree'}),
   KGROUND.layer('necanyons','ground.sand',{w:'vW.y',tint:'vec3(0.75)',name:'sand'}),
   PAVE?KGROUND.layer('necanyons','rock.red',{kind:'clast',w:'vP',amt:.85,proj:'xz',size:.14,jitter:.9,matrix:.14,sub:0,fleck:0,matrixColor:GO.paveMatrix||0x9a6a4a,
    tint:'vec3(0.7)',seed:KRAND.hash(4747,0,2,7)%997,name:'pavement'}):null];
  if(LY[0]&&LY[1]&&LY[3]){MAT_GROUND.onBeforeCompile=sh=>{
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aW;varying vec3 vW;varying vec3 vMW;'+(PAVE?'attribute float aP;varying float vP;':'')).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvW=aW;vMW=(modelMatrix*vec4(transformed,1.0)).xyz;'+(PAVE?'vP=aP;':''));
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vW;varying vec3 vMW;'+(PAVE?'varying float vP;':'')+
     'float ncH(vec2 p){p=fract(p*vec2(0.1031,0.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}'+
     'float ncN(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(ncH(i),ncH(i+vec2(1,0)),u.x),mix(ncH(i+vec2(0,1)),ncH(i+vec2(1,1)),u.x),u.y);}').replace('#include <map_fragment>','#include <map_fragment>\n/*KGROUND*/\ndiffuseColor.rgb*=vW.z;'+
     (MOT?'{float m=0.65*ncN(vMW.xz/45.0)+0.35*ncN(vMW.xz/11.0+17.3);m=smoothstep(0.42,0.72,m)*(1.0-vW.x)*(1.0-vW.y);diffuseColor.rgb*=mix(vec3(1.0),'+MOT.tint+','+MOT.amt.toFixed(3)+'*m);}':''));};
   KGROUND.hook(MAT_GROUND,{key:'necanyons-ground-kg'+(MOT?'-m':''),layers:LY,at:'/*KGROUND*/',
    relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});   /* the relief (no texture unit) and the mesh's hollows (aKGAO below); no tri: 2% of the
    floor's vertices are past tri's onset (1-|n.y| .35, measured 2026-11-04), at the talus's top; the walls are the rock's meshes */}}}
(function(){const N=LANDO.groundN||220,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,w=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,groundH(x,z));const fd=NECANYONS.footD(x,z),cd=creekD(x,z);
  w[3*i]=smooth(LANDO.talus?TALW*.88:48,4,fd)*(.7+.3*fbm(x*.02,z*.02,41,2));w[3*i+1]=smooth(CREEK.w+16,CREEK.w+2,cd);w[3*i+2]=.85+.3*fbm(x*.006,z*.006,42,2);}
 g.setAttribute('aW',new THREE.BufferAttribute(w,3));
 const paveF=LANDO.ground&&typeof LANDO.ground.pave==='function'?LANDO.ground.pave:null;
 if(paveF){const ap=new Float32Array(p.count);for(let i=0;i<p.count;i++)ap[i]=paveF(p.getX(i),p.getZ(i));g.setAttribute('aP',new THREE.BufferAttribute(ap,1));}
 /* FINE PATCHES UNDER THE WATER WORKS (2026-10-27): the floor's cells are ~16 m, wider than a spring's bowl or the stream's channel, so
    the cells over each work's box are cut out of the floor and the box drawn again at ~1.5 m from groundH, its edge rows on the coarse
    floor's own edges (heights interpolated between its vertices: no crack). The coarse mesh is the same without works */
 const C=S/N,boxes=[],FINE=11,STRIP=4;   /* sub-cells a coarse cell: ~1.45 m under the works, 4 m along the creek */
 const pad=(x0,z0,x1,z1,K)=>{const s=v=>Math.max(0,Math.min(N,v));boxes.push([s(Math.floor((x0+S/2)/C)),s(Math.floor((z0+S/2)/C)),s(Math.ceil((x1+S/2)/C)),s(Math.ceil((z1+S/2)/C)),K]);};
 if(WORKS){const P=WORKS.fall&&WORKS.fall.pool;if(P)pad(P.x-P.r*2.2,P.z-P.r*2.2,P.x+P.r*2.2,P.z+P.r*2.2,FINE);WORKS.springs.forEach(S2=>pad(S2.x-S2.r*2.2,S2.z-S2.r*2.2,S2.x+S2.r*2.2,S2.z+S2.r*2.2,FINE));
  for(const CH of WORKS.chans){const c=CH.pts;for(let i=0;i<c.length-1;i++){const a=c[i],b=c[i+1],r=CH.w*3;pad(Math.min(a[0],b[0])-r,Math.min(a[1],b[1])-r,Math.max(a[0],b[0])+r,Math.max(a[1],b[1])+r,FINE);}}}
 /* THE CREEK'S STRIP (core/water/PRACTICE.md, "Make the ground mesh finer than the narrowest channel"; 2026-11-02): the channel is 18 m of water
    in a carve that closes over 26 m, on 16 m cells: the banks were mush and the water's edge wandered with the cells. The cells over the carve,
    a row at a time, are drawn again at 4 m. ?creekstrip=0 */
 if(NEWROCK&&LANDO.creek!==false&&RQ.get('creekstrip')!=='0')for(let iy=0;iy<N;iy++){const z0=-S/2+iy*C,xa=CREEK.x(z0),xb=CREEK.x(z0+C),r=CREEK.w+26;pad(Math.min(xa,xb)-r,z0,Math.max(xa,xb)+r,z0+C-1e-6,STRIP);}
 /* THE FLOOR'S HOLLOWS (KGROUND.cavity, relief.mesh) on the whole coarse grid before its cells are cut, so the fine patches read the
    same field (bilinear from the coarse vertices: exact on their shared edges, no seam in the shade) */
 let CAV=null;if(KG_RELIEF){g.computeVertexNormals();CAV=KGROUND.cavity({pos:p.array,index:g.index.array,normal:g.attributes.normal.array,count:p.count});g.setAttribute('aKGAO',new THREE.BufferAttribute(CAV,1));}
 const cavAt=(x,z)=>{const u=(x+S/2)/C,v=(z+S/2)/C,i=Math.max(0,Math.min(N-1,Math.floor(u))),j=Math.max(0,Math.min(N-1,Math.floor(v))),fu=u-i,fv=v-j,k=j*(N+1)+i;
  return (CAV[k]*(1-fu)+CAV[k+1]*fu)*(1-fv)+(CAV[k+N+1]*(1-fu)+CAV[k+N+2]*fu)*fv;};
 const cov=new Map();boxes.forEach(B=>{for(let iy=B[1];iy<B[3];iy++)for(let ix=B[0];ix<B[2];ix++)cov.set(iy*N+ix,Math.max(cov.get(iy*N+ix)||0,B[4]));});
 if(cov.size){const I=g.index.array,keep=[];for(let iy=0;iy<N;iy++)for(let ix=0;ix<N;ix++){if(cov.has(iy*N+ix))continue;const o=6*(iy*N+ix);for(let k=0;k<6;k++)keep.push(I[o+k]);}g.setIndex(keep);}
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The canyon floor';m.userData.host=true;scene.add(m);
 if(cov.size){const pos=[],ww=[],idx=[],pp=[],cc=[];
  cov.forEach((K,key)=>{const iy=key/N|0,ix=key%N,x0=-S/2+ix*C,z0=-S/2+iy*C,o=pos.length/3;
   /* a vertex on an edge shared with a coarser cell lies on that cell's line (its own samples, heights between them: no crack) */
   const Kof=(dx,dy)=>ix+dx<0||iy+dy<0||ix+dx>=N||iy+dy>=N?1:cov.get((iy+dy)*N+ix+dx)||1;
   const line=(Kn,xa,za,xb,zb,u)=>{const t=u*Kn,i=Math.min(Kn-1,Math.floor(t)),f=t-i,h=q=>groundH(xa+(xb-xa)*q/Kn,za+(zb-za)*q/Kn);return h(i)*(1-f)+(f>0?h(i+1)*f:0);};
   const edgeOf=(i,j)=>{const u=i/K,v=j/K,x1=x0+C,z1=z0+C;let n;
    if(j===0&&(n=Kof(0,-1))<K)return line(n,x0,z0,x1,z0,u);if(j===K&&(n=Kof(0,1))<K)return line(n,x0,z1,x1,z1,u);
    if(i===0&&(n=Kof(-1,0))<K)return line(n,x0,z0,x0,z1,v);if(i===K&&(n=Kof(1,0))<K)return line(n,x1,z0,x1,z1,v);return null;};
   for(let j=0;j<=K;j++)for(let i=0;i<=K;i++){const x=x0+i/K*C,z=z0+j/K*C,e=edgeOf(i,j);pos.push(x,e==null?groundH(x,z):e,z);
    const fd=NECANYONS.footD(x,z),cd=creekD(x,z);ww.push(smooth(LANDO.talus?TALW*.88:48,4,fd)*(.7+.3*fbm(x*.02,z*.02,41,2)),smooth(CREEK.w+16,CREEK.w+2,cd),.85+.3*fbm(x*.006,z*.006,42,2));if(paveF)pp.push(paveF(x,z));if(CAV)cc.push(cavAt(x,z));}
   for(let j=0;j<K;j++)for(let i=0;i<K;i++){const a=o+j*(K+1)+i,b=a+1,c=a+K+1,d=c+1;idx.push(a,c,b,b,c,d);}});
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));pg.setAttribute('aW',new THREE.Float32BufferAttribute(ww,3));if(paveF)pg.setAttribute('aP',new THREE.Float32BufferAttribute(pp,1));if(CAV)pg.setAttribute('aKGAO',new THREE.Float32BufferAttribute(cc,1));
  pg.setIndex(idx);pg.computeVertexNormals();
  /* each cell has its own vertices: their normals are welded, or the grid of cells shows in the light */
  {const nr=pg.attributes.normal,sum=new Map(),keyOf=i=>Math.round(pos[3*i]*4)+','+Math.round(pos[3*i+2]*4);
   for(let i=0;i<nr.count;i++){const k=keyOf(i),q=sum.get(k)||[0,0,0];q[0]+=nr.getX(i);q[1]+=nr.getY(i);q[2]+=nr.getZ(i);sum.set(k,q);}
   for(let i=0;i<nr.count;i++){const q=sum.get(keyOf(i)),l=Math.hypot(q[0],q[1],q[2])||1;nr.setXYZ(i,q[0]/l,q[1]/l,q[2]/l);}}
  const pm=new THREE.Mesh(pg,MAT_GROUND);pm.userData.probeSkip=true;pm.userData.inspectLabel='The canyon floor (by the creek, the springs and the stream)';pm.userData.host=true;scene.add(pm);}})();

// ---------------------------------------------------------------- the rock (KSTACKS meshes): three meshes, by material
// walls of the mesas, buttes and towers (desert varnish), walls of the stacks (cross-bedded), and every top (slickrock).
// Vertex colours: the beds' banding (brick, salmon, buff) and the notch's shade; a bench's top reddened by its soil.
const ROCK_GEOS=[];
/* THE ROCK, REBUILT (2026-10-27, the final rebuild; BACKPORT.md's row: the strata showcase). On this page (a world reading the
   fragment in place sets LAND, and keeps the rock as it was unless it asks: LAND.rebuild) the drawn rock takes:
   - THE CANYON'S BEDS (core/terrain KSTRATA, the `canyon` recipe: thick cross-bedded red sands, thin shale and mudstone partings,
     bleached beds and the odd green reduction band, near level with a slight dip to the north-east), one stack for the map, so a
     bed runs from mesa to tower to fin; drawn on every wall as a tint about the sand's colour, under the library's grain. ?strata=0
   - KSTACKS.contour (37b) on the stacks and towers: the spires' and fins' profiles thinning in and out, their vertical joints and
     a split spire's cleft; on the mesas and buttes only the joints, so their rims (where the hanging gardens and the figs are
     placed from the records) stay within a few metres of the drawn rock. ?contour=0
   - KSTACKS.weather on every body: two grains of KRAND noise, the feet kept on the ground. ?weather=0
   The records (ROCK) keep the unworn bodies: terrainH, the zones and the plants read them as before */
const ROCK_STRATA=NEWROCK&&RQ.get('strata')!=='0'&&typeof KSTRATA!=='undefined'&&BIO.strata?
 BIO.strata(Object.assign({recipe:'canyon',seed:4751,range:[-80,600],dip:[.6,-.8,.008],warp:[6,1.8],res:.25,private:true},LANDO.strata||{})):null;   /* a station's own recipe (LAND.strata) */
const SAND_LIN=(function(){const c=new THREE.Color(LANDO.strataMean||0xb5643a).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';})();
function rockStrata(m,key){if(!ROCK_STRATA)return m;const prev=m.onBeforeCompile;
 m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);ROCK_STRATA.inject(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/'+SAND_LIN+',vec3(0.45),vec3(1.7)),0.55);}');};
 m.customProgramCacheKey=()=>key;return m;}
const ROCK_CONTOUR=NEWROCK&&RQ.get('contour')!=='0'&&typeof KSTACKS.contour==='function',ROCK_WEATHER=NEWROCK&&RQ.get('weather')!=='0';
function wearRock(B,m){
 if(B.kind==='arch'&&KSTACKS.archRound&&ROCK_CONTOUR)KSTACKS.archRound(B,m);   /* the opening bent from its box to an ellipse (37b) */
 if(ROCK_CONTOUR&&B.kind!=='arch'){
  if(B.kind==='spire')KSTACKS.contour(B,m,{profile:.14,crown:.22,wander:1.2,joints:[3,6],jointW:[.5,1.4],jointD:[1,3]});
  else if(B.kind==='fin')KSTACKS.contour(B,m,{profile:.1,crown:.12,wander:.8,joints:[4,7],jointW:[.5,1.2],jointD:[.8,2.2],cleft:false});
  else if(/^tower/.test(B.id))KSTACKS.contour(B,m,{profile:.07,flare:.08,crown:0,wander:1.5,joints:[6,9],jointW:[1,2.5],jointD:[2.5,6],cleft:false});
  else if(B.kind==='mesa'||B.kind==='butte')KSTACKS.contour(B,m,{profile:0,flare:0,crown:0,wander:0,joints:[10,16],jointW:[1.2,3],jointD:[2,5],cleft:false});}
 if(ROCK_WEATHER)KSTACKS.weather(B,m,{ground:groundH,amp:B.kind==='balanced'?.8:1.6,pit:.5});
 return m;}
(function(){const SMALL={spire:1,fin:1,balanced:1,arch:1},Lw=layer('rock.wall'),Lk=layer('rock.stack'),Lt=layer('rock.top'),Lr=layer('rock.red'),Lb=layer('rock.bed'),Lc=layer('rock.cap');
 const BAND=[0xa8503a,0xc98468,0xd9b091,0xb4603e].map(h=>new THREE.Color(h)),WHITE=new THREE.Color(0xffffff),TOPC=new THREE.Color(0xc9906e),SOIL=new THREE.Color(0x9c5a40),c=new THREE.Color();
 const acc={wallT:{pos:[],uv:[],col:[],idx:[]},wall:{pos:[],uv:[],col:[],idx:[]},stack:{pos:[],uv:[],col:[],idx:[]},top:{pos:[],uv:[],col:[],idx:[]},wallR:{pos:[],uv:[],col:[],idx:[]},stackB:{pos:[],uv:[],col:[],idx:[]},topC:{pos:[],uv:[],col:[],idx:[]}};
 ROCK.forEach(B=>{const small=!!SMALL[B.kind],m=wearRock(B,KSTACKS.mesh(B,{step:small?2.5:(LANDO.wallStep||6)})),nv=m.part.length;
  const remap={wall:new Int32Array(nv).fill(-1),stack:null,top:new Int32Array(nv).fill(-1)};
  // a third of the bodies take the library's other red sandstones (2026-10-19): the bedded red (rock.sandstone.bedded.red) for a
  // mesa's walls (its courses read as great beds at 20 m), the layered red (rock.sandstone.red) for a spire's or a stack's, and another third the cracked
  // sandstone (rock.sandstone_cracks) for a mesa's top; the rest keep the varnish, the Navajo and the slickrock
  const hv=KRAND.hash(B.seed,6151)%3;
  /* a record may name its own wall set (B.wallLib: station 2's tepui tables, 'rock.tepui', the quartzite) */
  const wk=B.wallLib==='rock.tepui'&&LIB['rock.tepui']?'wallT':small?(hv===0&&LIB['rock.red']?'stackB':'stack'):(hv===0&&LIB['rock.bed']?'wallR':'wall'),tk=!small&&hv===1&&LIB['rock.cap']?'topC':'top',
   Lw2=wk==='wallT'?layer('rock.tepui'):wk==='stack'?Lk:wk==='stackB'?Lr:wk==='wallR'?Lb:Lw,Lt2=tk==='topC'?Lc:Lt;
  for(let i=0;i<m.idx.length;i+=3){const a=m.idx[i],part=m.part[a],isTop=part===1,key=isTop?tk:wk,A=acc[key],R=isTop?remap.top:remap.wall;
   for(let k=0;k<3;k++){const v=m.idx[i+k];if(R[v]<0){R[v]=A.pos.length/3;const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2],b=B.beds[m.bed[v]];
     A.pos.push(x,y,z);
     if(isTop){A.uv.push(m.uv[2*v]/Lt2.s,m.uv[2*v+1]/Lt2.s);const bench=!small&&y<NECANYONS.capY();
      c.copy(Lt2.lib?WHITE:TOPC).lerp(SOIL,bench?.35+.3*fbm(x*.01,z*.01,43,2):.05);}
     else{A.uv.push(m.uv[2*v]/Lw2.s,m.uv[2*v+1]/Lw2.s);const h=KRAND.hash(B.seed,b.k,77)%4;
      c.copy(Lw2.lib?WHITE:BAND[h]).lerp(BAND[h],Lw2.lib?(small?.05:.1):0).multiplyScalar(small?.82+.18*m.occ[v]:.62+.38*m.occ[v]);}
     A.col.push(c.r,c.g,c.b);}
    A.idx.push(R[v]);}}
  REGISTER({name:B.name||B.id,key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,small?B.R:B.R*.8),h:B.top-B.y0});});
 const mk=(A,L,label)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.uv,2));
  const cl=new THREE.Float32BufferAttribute(A.col,3);for(let i=0;i<cl.count;i++){c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i)).convertSRGBToLinear();cl.setXYZ(i,c.r,c.g,c.b);}
  g.setAttribute('color',cl);g.setIndex(A.idx);g.computeVertexNormals();
  /* both sides on the rebuilt rock (the owner, 2026-10-27: "transparency on rock formations viewed from below"): a bed's lip, worn and
     notched, leaves back faces toward an eye under it, which culled to the sky */
  let mat=new THREE.MeshStandardMaterial({map:L.map,normalMap:L.normalMap,roughnessMap:L.roughnessMap,roughness:1,metalness:0,vertexColors:true,side:NEWROCK?THREE.DoubleSide:THREE.FrontSide});
  if(A!==acc.top&&A!==acc.topC)mat=rockStrata(mat,'necanyons-rock-'+label.length);   /* the walls take the beds; the tops are slickrock */
  const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=label;me.userData.host=true;me.userData.rock=true;scene.add(me);ROCK_GEOS.push(g);return me;};
 // one anchor per body at its middle (an invisible instance): the rock is three merged meshes, so the probe's samples
 // (a mesh's box centre) would leave each body's registered volume to whatever grows on it
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),ROCK.length),M4=new THREE.Matrix4();
  ROCK.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}
 const mkIf=(A,L,label)=>{if(A.idx.length)mk(A,L,label);};
 if(acc.wallT.idx.length)mk(acc.wallT,layer('rock.tepui'),'Quartzite (a tepui table\'s wall: grey and black, streaked with algae)');
 mkIf(acc.wallR,Lb,'Bedded red sandstone (a mesa wall, in courses)');mkIf(acc.stackB,Lr,'Layered red sandstone (a stack)');mkIf(acc.topC,Lc,'Cracked sandstone (a mesa top)');
 mk(acc.wall,Lw,'Red sandstone (a mesa\'s wall, streaked with desert varnish)');mk(acc.stack,Lk,'Red sandstone (a stack, cross-bedded)');mk(acc.top,Lt,'Slickrock (a top: bare sandstone, black crust, lichen)');})();

// ---------------------------------------------------------------- the water: the creek and the rain pools
// On a page with core/water (core/water/README.md) they are its records: the creek a flow line down the canyon (WATER.flow,
// its surface the bed plus its depth every 12 m, from its high end), each rain pool on the slickrock still water
// (WATER.still at the pool's level, its disc); WATER.heightAt and core/export read them, and the page's own water fragment
// draws them on core/atmos (necanyons' and Pinnacle Rock's 89w-host-water.js). The page's own ribbon and MAT_WATER are gone (2026-10-25).
const WATER_RECS=typeof WATER==='undefined'?null:(function(){
 let creek=null;if(LANDO.creek!==false){const P=[];for(let z=-TERR.R*1.1;z<=TERR.R*1.1;z+=12)P.push([CREEK.x(z),z,creekBed(z)+CREEK.depth]);
  if(P[0][2]<P[P.length-1][2])P.reverse();creek=WATER.flow({name:CREEK.name,pts:P,width:CREEK.w*2,speed:.6});}
 const pools=NECANYONS.POTHOLES.map((p,i)=>{const poly=[];for(let k=0;k<14;k++){const a=k/14*TAU;poly.push([p.x+Math.cos(a)*p.r,p.z+Math.sin(a)*p.r]);}
  return WATER.still({name:'A rain pool on the slickrock ('+i+')',level:p.y,poly});});
 /* the water works (WORKS above): the fall's record (its lip on the seep, 'face' the drawn wall's line below it), its plunge pool (a
    still), its stream (a flow, joined to the creek by WATER.join), and each karst spring (ext/54: a pool and its run) */
 /* made when 89w draws them: core/water's ext fragments (54, 55) load after this one */
 const mkWorks=()=>{let works=null;
 if(WORKS&&WATER.karstSpring){works={springs:[]};const Fw=WORKS.fall;
  if(Fw){const P=Fw.pool,drop=Fw.lip[2]-P.level;
   /* the lip 3 m wide across the seep, 1.5 m out from the record's face (the drawn wall is worn up to ~2 m about it); the curtain
      follows the ground from the wall's foot (face: the talus) and lands in its pool (fit: the arc's speed set by the run) */
   const lx=Fw.lip[0]+Fw.dir[0]*1.5,lz=Fw.lip[1]+Fw.dir[1]*1.5,px=-Fw.dir[1],pz=Fw.dir[0];
   works.fall=WATER.fall({name:"The High Cap's spring fall (a seep line under its cap rock)",lip:[[lx-px*1.5,lz-pz*1.5,Fw.lip[2]],[lx+px*1.5,lz+pz*1.5,Fw.lip[2]]],
    dir:Fw.dir,speed:.9,drop,foot:[P.x,P.z,P.level],fit:true,face:(x,z)=>NECANYONS.rockAt(x,z)?Fw.lip[2]:groundH(x,z)});
   const poly=[];for(let k=0;k<18;k++){const a=k/18*TAU;poly.push([P.x+Math.cos(a)*P.r,P.z+Math.sin(a)*P.r]);}
   works.pool=WATER.still({name:"The fall's plunge pool",level:P.level,poly});
   let pts=WORKS.chan.pts.map(q=>[q[0],q[1],q[2]]);
   if(creek&&WATER.join){const main=creek.pts.map(q=>[q[0]!=null?q[0]:q.x,q[1]!=null?q[1]:q.z,q[2]!=null?q[2]:q.y]);const J=WATER.join(pts,main,{w:CREEK.w,tuck:1});if(J&&J.pts&&J.pts.length>1)pts=J.pts;}
   works.stream=WATER.flow({name:"The fall's stream (to the creek)",pts,width:WORKS.chan.w*2,speed:.8});}
  WORKS.springs.forEach((S,i)=>{const line=S.line.map(q=>[q[0],q[1],q[2]+.05]);
   works.springs.push(WATER.karstSpring({name:"A karst spring under the Bench's seep line ("+(i+1)+")",at:[S.x,S.z,S.level],r:S.r,dir:S.dir,line,width:2.6,speed:.6,seed:4790+i}));});}
 return works;};
 return {creek,pools,works:null,mkWorks};})();
_mark('meshes');

