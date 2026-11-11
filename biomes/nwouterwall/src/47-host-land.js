// ================================================================= HOST — the land: the stream, the landforms, the baked ground, the fields, the binding, the meshes
// The station's ground is the model's plus its relief (45, 44s), the landforms laid on it (KFROST: 44s's SITE.frost), the stream's
// channel cut in, then BAKED once on core/terrain's KFIELD over the near box (NEAR.step m): the near ground's mesh is that grid, and
// terrainH reads the field there, so a plant's foot is on the drawn ground and the export carries the same heights (BIO.init field).
// Beyond the box the mid ground (to 20 km) reads the function itself.

// ---------------------------------------------------------------- the near box and a coarse look at the ground (for the landforms' rules)
const NEAR={S:Math.round(SITE.R*1.15/10)*10,step:SITE.step||10};NEAR.box=[-NEAR.S,-NEAR.S,NEAR.S,NEAR.S];
const COARSE=(function(){const st=20,n=Math.ceil(NEAR.S*2.2/st)+1,x0=-NEAR.S*1.1,H=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=baseH(x0+i*st,x0+j*st);
 const h=(x,z)=>KFIELD.bilinear(H,n,n,clamp((x-x0)/st,0,n-1.0001),clamp((z-x0)/st,0,n-1.0001));
 return {h,grade(x,z){const hx=(h(x+st,z)-h(x-st,z))/(2*st),hz=(h(x,z+st)-h(x,z-st))/(2*st),g=Math.hypot(hx,hz);return {g,sunny:g>.005?hz/g:0};},
  mean(x,z){const G=this.grade(x,z);return meanAt(h(x,z))+1.5*G.sunny*smooth(.02,.15,G.g);}};})();
_mark('coarse');

// ---------------------------------------------------------------- the stream (its line, its water level never climbing downstream)
const STREAM=(function(){const S=SITE_STREAM,pts=[];if(!S)return null;
 for(let x=S.from;x<=S.to+1e-6;x+=S.step){const p=S.at(x);pts.push([p[0],p[1]]);}
 const L=pts.map(p=>baseH(p[0],p[1])+.25);for(let i=1;i<L.length;i++)L[i]=Math.min(L[i],L[i-1]-.002*S.step);
 const idx=KSPACE.create({cell:40});for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];idx.insert(i,(a[0]+b[0])/2,(a[1]+b[1])/2,S.step*.6+S.width*3);}
 // the nearest point on the line: {d, y (the water's level there), i}
 const near=(x,z,pad)=>{let best=1e18,by=0,bi=-1;idx.query(x,z,pad,[]).forEach(i=>{const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,
  t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z,d2=qx*qx+qz*qz;if(d2<best){best=d2;by=L[i]+(L[i+1]-L[i])*t;bi=i;}});return {d:Math.sqrt(best),y:by,i:bi};};
 return {name:S.name,pts,level:L,w:S.width,near};})();

// ---------------------------------------------------------------- the landforms (core/terrain/42-core-frost.js)
const FROST_CFG=SITE.frost({stream:STREAM?STREAM.pts:[],grade:(x,z)=>COARSE.grade(x,z),meanAt:(x,z)=>COARSE.mean(x,z)});   /* kept: the ground's patterned layer reads its polygons' where (KGROUND, below) */
NWOW.frost=KFROST.create(Object.assign({seed:SITE.seed,ground:baseH},FROST_CFG));
NWOW.frostH=(x,z)=>NWOW.frost.h(x,z);
_mark('frost');
// the ground with the stream's channel cut in: a bed ~0.6 m under the water across the stream's width, its banks eased
function cutH(x,z){const h=groundH(x,z);if(!STREAM)return h;const n=STREAM.near(x,z,Math.max(STREAM.w*2.5,NEAR.step*2));if(n.i<0)return h;
 const k=smooth(Math.max(STREAM.w*2.2,NEAR.step*1.7),Math.max(STREAM.w*.6,NEAR.step*.7),n.d);   /* at least the ground grid's cells: a narrower cut is not drawn */return k>0?Math.min(h,h+(n.y-.65-h)*k):h;}
// THE BAKED GROUND: the near box on KFIELD (the mesh's grid); terrainH reads it there and the function beyond
const FIELD=KFIELD.bake(cutH,NEAR.box,NEAR.step,{name:'nwouterwall.'+SITE.name});
_mark('bake-ground');
const inNear=(x,z)=>x>=NEAR.box[0]&&x<=NEAR.box[2]&&z>=NEAR.box[1]&&z<=NEAR.box[3];
function terrainH(x,z){return inNear(x,z)?FIELD.h(x,z):groundH(x,z);}

// ---------------------------------------------------------------- the water: the stream, the alas lakes, the model's lake
const ALAS_LAKES=NWOW.frost.alases.filter(a=>a.lake>0);
function waterH(x,z){
 if(STREAM){const n=STREAM.near(x,z,STREAM.w*1.6);if(n.i>=0&&n.d<STREAM.w*1.3)return n.y;}
 if(ALAS_LAKES.length){const S=NWOW.frost.sample(x,z,_ws);if(S.lake>0)return NWOW.frost.alasLevel(S.alasId);}
 if(MODEL_LAKE&&MODEL_LAKE.inside(x,z))return MODEL_LAKE.level;
 return -1e9;}
const _ws={};
// the model's lake (the Yeti Valley's frozen lake): its cells' outline and level, page metres (station 3; none elsewhere)
const MODEL_LAKE=(function(){if(!MODEL_WATER.length)return null;const G=NW_REGION.grid,lv=MODEL_WATER.reduce((a,w)=>a+w.level,0)/MODEL_WATER.length;
 const cells=new Set(NW_REGION.grid.water.map(w=>w[0]+','+w[1]));
 // inside: the model's water cell under the point (nearest cell centre), or the ground under the level next to one
 const inside=(x,z)=>{const i=Math.round((x-G.x0)/G.dx),j=Math.round((z-G.z0)/G.dz);if(cells.has(i+','+j))return true;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(cells.has((i+a)+','+(j+b))&&groundH(x,z)<lv-.2)return true;return false;};
 return {level:lv,inside,cells};})();

const OBSTACLES=[];   // cylinders nothing grows inside (the tors; the trees after the build: 88)
// ---------------------------------------------------------------- the tors (core/terrain KSTACKS: frost-shattered granite)
// PLAN.md section 6: frost-shattered tors on the plateau's crests. A tor is a KSTACKS pile of plates (Roraima's kind: thin beds each
// its own width, their partings weathered deep, the top rounded): granite split along its sheet joints by the frost. On the plateau
// above the valley's walls, where the ground is flat enough to hold one; its foot set under the lowest ground round it
const TORS=(function(){const T=SITE.tors;if(!T||typeof KSTACKS==='undefined')return [];const s=KRAND.stream(KRAND.hash(T.seed,1)),L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<16;i++){const a=i/16*TAU;for(const k of [.5,1.05])m=Math.min(m,groundH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-1.2;};
 for(let t=0;t<600&&L.length<T.n;t++){const a=s.range(0,TAU),d=s.range(T.ring[0],T.ring[1]),x=Math.cos(a)*d,z=Math.sin(a)*d,r=s.range(4,9),H=s.range(5,13);
  const G=COARSE.grade(x,z);if(G.g>(T.maxG==null?.12:T.maxG))continue;if(T.accept&&!T.accept(x,z))continue;if(L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+r+40))continue;
  const B=KSTACKS.make({id:'tor'+L.length,kind:'spire',x,z,y0:footY(x,z,r),seed:T.seed+L.length,H:H+1.2,r,e:s.range(1,1.7),ry:s.range(0,TAU),taper:.25,crown:.85,plates:[1.2,2.6]});
  B.name='A tor (frost-shattered granite, split along its sheet joints)';L.push(B);}
 return L;})();
NWOW.TORS=TORS;
NWOW.torAt=TORS.length?(x,z)=>{const f=KSTACKS.foot(TORS,x,z);return f&&f.d<1.5?smooth(1.5,-1,f.d):0;}:null;
TORS.forEach(B=>OBSTACLES.push({x:B.x,z:B.z,r:B.R+.5,y0:B.y0,y1:B.top}));

// ---------------------------------------------------------------- the fields (biomes/WORLD.md; BIOME-API.md)
// One record a point (memo of the last): the height, the grade and aspect off the baked field, the climate (the mean with the
// aspect's degree and a half), the landforms' sample, the site's gully, floor, burn, beds and pockets, the stream's distance
const _fm={x:NaN,z:NaN,F:null};
const BED=SITE.beds?(function(){const B=SITE.beds,c=Math.cos(B.ang),s=Math.sin(B.ang);return (x,z)=>{const dx=x-B.c[0],dz=z-B.c[1],u=dx*c+dz*s,v=-dx*s+dz*c;
 return Math.abs(u)<B.len/2&&Math.abs(v)<B.wid/2;};})():(x,z)=>false;
const POCKET=SITE.pockets?(x,z)=>Math.hypot(x-SITE.pockets.c[0],z-SITE.pockets.c[1])<SITE.pockets.rad*(.75+.5*KRAND.vnoise(x*.015,z*.015,0,4796)):(x,z)=>false;
function fieldsAt(x,z){if(x===_fm.x&&z===_fm.z)return _fm.F;
 const y=terrainH(x,z),e=inNear(x,z)?NEAR.step:20,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),g=Math.hypot(hx,hz);
 const sunny=g>.005?hz/g:0,slope=clamp(g/1.1,0,1),mean=meanAt(y)+1.5*sunny*smooth(.02,.15,g);
 const S=NWOW.frost.sample(x,z,{}),n=STREAM?STREAM.near(x,z,140):{d:1e9,i:-1},streamD=n.i>=0?n.d:1e9;
 const water=waterH(x,z)>y+.05,burnK=(SITE.burns||[]).reduce((m,b)=>Math.max(m,smooth(b.r*1.15,b.r*.8,Math.hypot(x-b.x,z-b.z)/(.8+.4*KRAND.vnoise(x*.02,z*.02,0,4799)))),0),burn=burnK>.5;
 const rock=Math.max(smooth(.75,1.1,g),NWOW.torAt?NWOW.torAt(x,z):0);
 const floor=typeof siteFloor==='function'?siteFloor(x,z):0;
 const F={y,g,slope,sunny,mean,perma:NWOW.climate(mean).perma,water,streamD,floor:floor>.5&&!water,aufeis:S.aufeis>.25,
  alas:S.alas>.5,lake:S.lake,meadow:S.meadow,pingo:S.pingo,poly:S.poly,lobe:S.lobe,front:S.front,rockG:S.rockG,
  gully:typeof siteGully==='function'?siteGully(x,z):0,burn,burnK,field:BED(x,z),pocket:POCKET(x,z),rock,frost:S};
 _fm.x=x;_fm.z=z;_fm.F=F;return F;}
if(SITE.amp)NWOW.AMP=SITE.amp;   /* the station's annual swing (46) */
NWOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
NWOW.larchK=SITE.larch;   /* the station's larch: the forest-steppe's shaded walls thick, the taiga's flats open */
// the alases and the pingos, registered (the inspector names them; the probe finds them)
NWOW.frost.alases.forEach(a=>REGISTER({name:'An alas (a thaw hollow, '+a.depth+' m deep'+(a.lake>0?', its lake shrinking into a meadow ring':', drained: a meadow')+')',key:'landform.alas',x:a.x,z:a.z,y:a.floorY-1,r:a.r,h:a.depth+4}));
NWOW.frost.pingos.forEach(p=>REGISTER({name:'A pingo (an ice-cored mound, its summit ruptured)',key:'landform.pingo',x:p.x,z:p.z,y:baseH(p.x,p.z)-1,r:p.r*.8,h:p.h+2}));
// the core's fields for any kit on the page (BIO.field): wet, flow, cold, rock, upland, slope, and this kit's own
const FIELDS={
 wet:(x,z)=>{const F=fieldsAt(x,z);return clamp(Math.max(smooth(40,4,F.streamD),F.alas?.9:0,F.meadow*.9,F.lake),.15,1);},
 flow:(x,z)=>smooth(STREAM?STREAM.w*6:0,STREAM?STREAM.w:0,fieldsAt(x,z).streamD),
 cold:(x,z)=>clamp((2-fieldsAt(x,z).mean)/12,0,1),rock:(x,z)=>fieldsAt(x,z).rock,
 upland:(x,z)=>clamp((fieldsAt(x,z).y+150)/400,0,1),slope:(x,z)=>fieldsAt(x,z).slope,
 sunny:(x,z)=>fieldsAt(x,z).sunny,mean:(x,z)=>fieldsAt(x,z).mean,perma:(x,z)=>fieldsAt(x,z).perma};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)

const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
const SPINE=SITE.spine||[[0,0]];
BIO.init({tags:'nwouterwall',THREE:THREE,scene:scene,terrainH:terrainH,field:FIELD,waterH:waterH,mask:(x,z)=>waterMask(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed,origin:SPINE,center:[0,0],fields:FIELDS,register:REGISTER,err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],
 lod:{hero:400,mid:950,far:SITE.R*1.2,floor:[300,750]}});
BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
_mark('init');

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
// the ground's seven: the steppe's grass (its base), the larch's needle litter, gravel (the floor, the scree), the polygon turf
// (patterned ground, the tundra), caribou moss (the taiga's floor), bog moss (the alases), the fellfield's lichen crust
const LAYERS=['ground.steppe','ground.needles','ground.gravel','ground.turf','ground.cladonia','ground.sphagnum','ground.lichen'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYERS.concat(['ice.aufeis','ice.lake','rock.tor']).forEach(k=>{const P=KMAT.packed('nwouterwall',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PN=(x,y,s,sd)=>KRAND.fbm(x/s,y/s,0,2,sd);
const PROC={'ground.steppe':greyTex((x,y)=>170+60*(PN(x,y,7,11)-.5)),'ground.needles':greyTex((x,y)=>140+60*(PN(x,y,5,12)-.5)),
 'ground.gravel':greyTex((x,y)=>165+70*(PN(x,y,3,13)-.5)),'ground.turf':greyTex((x,y)=>150+50*(PN(x,y,9,14)-.5)),
 'ground.cladonia':greyTex((x,y)=>190+50*(PN(x,y,4,15)-.5)),'ground.sphagnum':greyTex((x,y)=>150+50*(PN(x,y,6,16)-.5)),
 'ground.lichen':greyTex((x,y)=>160+60*(PN(x,y,5,17)-.5))};
const PSCALE={'ground.steppe':2.2,'ground.needles':2.5,'ground.gravel':2.5,'ground.turf':3.6,'ground.cladonia':1.2,'ground.sphagnum':2,'ground.lichen':2.5};
const layer=k=>LIB[k]?{map:LIB[k].map,s:LIB[k].scale,lib:true}:{map:PROC[k],s:PSCALE[k],lib:false};
LAYERS.forEach(k=>{const t=layer(k).map;if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
// THE SEASON'S GROUND (sRGB tints over each layer's map): the steppe straw-gold in autumn, green-gold in summer, winter-bleached in
// spring; the larch litter fresh gold under the autumn larch; the bog moss red in autumn
const TINT={
 autumn:{steppe:0xc4b494,needles:0xa48a66,gravel:0xb0aaa0,turf:0xa09078,cladonia:0xd0d2c4,sphagnum:0x9a6e56,lichen:0xb0ac9c},
 summer:{steppe:0xa8b078,needles:0x9a8466,gravel:0xb4aca0,turf:0x8e9466,cladonia:0xdcdcd0,sphagnum:0x8a9a52,lichen:0xb4ae9c},
 winter:{steppe:0xb8ae98,needles:0x7a6a58,gravel:0xa4a09a,turf:0x8a8070,cladonia:0xc8cac0,sphagnum:0x7a5a46,lichen:0xa4a29a},
 spring:{steppe:0xb0a688,needles:0x8e7a62,gravel:0xa8a49c,turf:0x8a8064,cladonia:0xd4d4c8,sphagnum:0x8a6a4a,lichen:0xa8a494}}[SEASON];

// ---------------------------------------------------------------- the ground material (one shader for the near and the mid ground)
// THE DITHER (the owner, 2026-10-26: "textures of ground need dithering"; the technique is Korona's ground, biomes/korona/src/
// 47-host-land.js): each layer's map is read through a HEX-CELL BOMB, the plane cut into triangles a couple of tiles across, each
// corner turning and shifting the tile by its own hash, a point blending its three corners' reads (weights cubed, so most of a
// cell is one read: no ghosting), so no repeat can line up; done at the map's scale and at a third of it, mixed by a value noise.
// The LAYERS' EDGES are dithered too: each layer's weight is pushed through a noise threshold (ndith), so a larch litter meets the
// steppe in ragged drifts, not a smooth gradient. A coarse mottle (48 m and 140 m) gives the ground its own light and dark. A layer
// whose weight is nil is not read at all. GLSL ES 1.0 (three r128); the hash is Hoskins' fract hash, not a sine.
const GROUND_DITHER=[
 'vec2 nh2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}',
 'float nvn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(nh2(i).x,nh2(i+vec2(1.0,0.0)).x,f.x),mix(nh2(i+vec2(0.0,1.0)).x,nh2(i+vec2(1.0,1.0)).x,f.x),f.y);}',
 'float nfbm(vec2 p){return 0.6*nvn(p)+0.3*nvn(p*2.3+7.1)+0.1*nvn(p*5.1+3.7);}',
 'vec4 nsamp(sampler2D m,vec2 p,vec2 v,float sd){vec2 h=nh2(v*0.37+sd);float a=(h.x-0.5)*6.2831853,ca=cos(a),sa=sin(a);return texture2D(m,vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y)+h*13.0);}',
 'vec4 nbomb(sampler2D m,vec2 p,float cell,float sd){vec2 st=p/cell;vec2 sk=vec2(st.x-st.y*0.57735027,st.y*1.1547005);vec2 b=floor(sk),f=fract(sk);vec2 v1,v2,v3;vec3 w;',
 ' if(f.x+f.y<1.0){v1=b;v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(1.0-f.x-f.y,f.x,f.y);}else{v1=b+vec2(1.0,1.0);v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);}',
 ' w=w*w*w;w/=(w.x+w.y+w.z);return nsamp(m,p,v1,sd)*w.x+nsamp(m,p,v2,sd)*w.y+nsamp(m,p,v3,sd)*w.z;}',
 'vec3 ndither(sampler2D m,vec2 p){vec4 a=nbomb(m,p,1.9,0.0);vec4 b=nbomb(m,p*0.33+vec2(2.3,5.1),1.4,7.0);float n=nfbm(p*0.055+vec2(1.7,9.2));return mix(a,b,0.2+0.6*smoothstep(0.3,0.7,n)).rgb;}',
 'float nedge(float w,vec2 x,float sd){if(w<=0.001)return 0.0;if(w>=0.999)return 1.0;float n=0.55*nfbm(x*0.35+sd)+0.45*nfbm(x*1.7+sd*3.1);return smoothstep(n-0.12,n+0.12,w);}',
 ''].join('\n');
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
{const U={},Ls=LAYERS.map(layer);LAYERS.forEach((k,i)=>U['uL'+i]={value:Ls[i].map});
 const T=Object.values(TINT).map(h=>{const c=new THREE.Color(h).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';});
 const tex=i=>'pow(ndither(uL'+i+',p/'+Ls[i].s.toFixed(2)+'),vec3(2.2))*'+(Ls[i].lib?'1.0':'0.75')+'*'+T[i];
 // a layer over the colour so far: its weight dithered at its edge, its map read only where it shows
 const over=(i,w,sd)=>'{float k=nedge('+w+',p,'+sd.toFixed(1)+');if(k>0.0)c=mix(c,'+tex(i)+',k);}';
 MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D '+LAYERS.map((k,i)=>'uL'+i).join(',')+';varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER)
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;vec3 c='+tex(0)+';',
    over(1,'vW.x',1.3),over(3,'vW.z',2.9),over(4,'vW.w',4.1),over(5,'vW2.x',5.7),over(6,'vW2.y',6.3),over(2,'vW.y',8.9),
    'float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));c*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh);',
    'diffuseColor.rgb*=c*vW2.z*1.25;}'].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'nwouterwall-ground-dither';
 /* THE GROUND ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js; the final rebuild, pair 11, 2026-11-09): the steppe's grass, the base,
    stays dithered (ndither, as judged), and the six layers over it (the larch's litter, the turf, caribou moss, bog moss, the lichen crust, the
    gravel) come over it hex-tiled, scaled with distance and blended by height (a stone stands through the moss at an edge instead of a smear),
    each at its weight and the season's tint as above. And the PATTERNED GROUND (BACKPORT.md's row: KGROUND's 'polygon' kind): sorted circles
    a few metres across, their troughs fine-earth dark and their rims sorted stones, wherever the frozen flats take KFROST's ice-wedge polygons
    (44s: SITE.frost's polygons' where; aW2.w), inside the 14-16 m polygons the ground's mesh already draws. Only with every layer from the pack
    (the procedural fallback keeps its mix) and ?kground=0 not set. Relief off (?kgrelief=1 shows it: each build times it on the GPU first). three
    r128 uploads cameraPosition only to Phong and Standard materials, so on this Lambert ground KGROUND's distance takes the eye from the view
    matrix (KHOOK.EYE's kEye; Korona's lines: the fix belongs in core/terrain/43-core-ground.js) */
 const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'&&Ls.every(L=>L.lib);
 const KG_LY=KG_ON?[[1,'vW.x'],[3,'vW.z'],[4,'vW.w'],[5,'vW2.x'],[6,'vW2.y'],[2,'vW.y']].map(([i,w])=>KGROUND.layer('nwouterwall',LAYERS[i],{w,tint:T[i],name:LAYERS[i]})):null;
 if(KG_LY&&KG_LY.every(Boolean)){
  KG_LY.push({kind:'polygon',w:'vW2.w',amt:.6,size:3,width:.07,edgeTint:'vec3(0.40,0.37,0.32)',warp:.16,rim:.06,rimTint:'vec3(0.56,0.54,0.50)',seed:KRAND.hash(SITE.seed,4799)%997,name:'sorted circles (patterned ground)'});
  const KG_EYE='#define '+'camera'+'Position kEye()\n';   /* joined so check_source's CAMPOS rule, which cannot tell a redirect from a read, does not count it */
  MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uL0:U.uL0});
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
    .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL0;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER+KHOOK.EYE+KG_EYE)
    .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;diffuseColor.rgb='+tex(0)+';}','/*KGROUND*/',
     '{vec2 p=vGWP.xz;float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));diffuseColor.rgb*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh)*vW2.z*1.25;}'].join('\n'));};
  MAT_GROUND.customProgramCacheKey=()=>'nwouterwall-ground-kg';
  KGROUND.hook(MAT_GROUND,{key:'nwouterwall-ground',layers:KG_LY,at:'/*KGROUND*/'});
  MAT_GROUND.userData.kgroundOn=true;}}
// the weights at a point: [needles, gravel, turf, cladonia], [sphagnum, lichen, shade, patterned ground]
function groundW(F,x,z){const shade=NWOW.shadeOf(F),warm=F.mean+NWOW.AMP.warm,hi=smooth(8.5,6.5,warm),fell=smooth(4,1.5,warm);
 const larch=Math.max(smooth(.06,.32,shade),smooth(10.6,9.6,warm)*smooth(-.6,-.2,shade))*(1-hi)*(F.floor?.2:1);
 const gravel=Math.max(F.floor?.85:0,smooth(.75,1.05,F.g)*.8,F.field?.7:0,F.pocket?.3*KRAND.vnoise(x*.08,z*.08,0,4793):0,F.rockG*.9,smooth(STREAM?STREAM.w*2.6:0,STREAM?STREAM.w:0,F.streamD));
 const turf=Math.max(F.poly*.9,hi*.7,F.lobe*.4,F.meadow*.85);   /* an alas's floor: sedge and hay meadow */
 const clad=Math.max(larch*smooth(-.5,-2,F.mean)*.75,hi*(1-fell)*.6*(.6+.8*(KRAND.vnoise(x*.03,z*.03,0,4798)-.5)));
 const sph=Math.max(F.alas?.35*(1-F.meadow):0,smooth(10,3,F.streamD)*.35,F.lake>0&&F.lake<1?.8:0);   /* bog moss at the lakes' rims and the alases' sides */
 const lich=Math.max(fell,F.rock*.9,F.rockG*.6);
 // the brightness: broad patches (the grass thick or thin, old snow's ground, a burn's soot), finer mottling, the lobes' risers
 const br=.78+.36*KRAND.fbm(x*.0045,z*.0045,0,3,4797)+.1*(KRAND.vnoise(x*.06,z*.06,0,4792)-.5)-.12*F.front-.22*(F.burnK||0)-.12*larch;
 const pat=F.pat||0;   /* the patterned ground's sorted circles (KGROUND 'polygon': the frozen flats' polygons' where; 0 on the mid ground) */
 return [[larch,gravel,turf,clad],[sph,lich,br,pat]];}

// ---------------------------------------------------------------- the near ground: the baked field's own grid, one mesh
// THE ZONE RASTER: each grid point's zone (46) kept as it is worked out here, so the kit's passes read a candidate's zone at the
// nearest grid point (NWOW.zoneAt) and work out the full fields only for the candidates it accepts
const PAT_W=FROST_CFG.polygons&&FROST_CFG.polygons.where?(x,z)=>clamp(FROST_CFG.polygons.where(x,z),0,1):null;   /* the patterned ground's weight */
const ZONE_IDS=Object.keys(NWOW.ZONES),ZR=new Uint8Array(FIELD.nx*FIELD.nz);
NWOW.zoneAt=(x,z)=>{if(!inNear(x,z))return NWOW.at(x,z).zone;const i=Math.round((x-FIELD.x0)/FIELD.step),j=Math.round((z-FIELD.z0)/FIELD.step);return ZONE_IDS[ZR[j*FIELD.nx+i]];};
(function(){const f=FIELD,nx=f.nx,nz=f.nz,pos=new Float32Array(nx*nz*3),w1=new Float32Array(nx*nz*4),w2=new Float32Array(nx*nz*4),idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=f.x0+i*f.step,z=f.z0+j*f.step;pos[3*k]=x;pos[3*k+1]=f.at(i,j);pos[3*k+2]=z;
  const F=fieldsAt(x,z);F.pat=PAT_W?PAT_W(x,z):0;const W=groundW(F,x,z);w1.set(W[0],4*k);w2.set(W[1],4*k);ZR[k]=ZONE_IDS.indexOf(NWOW.zoneOf(F));}
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx.push(a,c,b,b,c,d);}
 // a skirt round the edge, down 40 m, so the mid ground never shows through a seam
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aW',new THREE.BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ground (the scale model\'s, baked: core/terrain KFIELD)';m.userData.host=true;m.name='ground:near';scene.add(m);})();
_mark('ground-near');

// ---------------------------------------------------------------- the mid ground: the model's country to 20 km, the near box cut out
(function(){const R2=20000,N=180,st=R2*2/N,n1=N+1,H=new Float32Array(n1*n1),pos=[],w1=[],w2=[],idx=[];
 const inner=NEAR.S-NEAR.step*2;
 // the heights first (the model and the relief: the landforms are the near ground's), then each vertex's grade from its neighbours
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)H[j*n1+i]=baseH(-R2+i*st,-R2+j*st);
 const h=(i,j)=>H[clamp(j,0,N)*n1+clamp(i,0,N)];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-R2+i*st,z=-R2+j*st,ax=Math.abs(x),az=Math.abs(z);
  // a vertex inside the near box sinks under it (the near mesh covers it); the rows next to the box ease down a little
  const y=h(i,j)-(ax<inner&&az<inner?30:2.5*smooth(NEAR.S*1.6,NEAR.S,Math.max(ax,az)));pos.push(x,y,z);
  const hx=(h(i+1,j)-h(i-1,j))/(2*st),hz=(h(i,j+1)-h(i,j-1))/(2*st),g=Math.hypot(hx,hz),sunny=g>.005?hz/g:0;
  const F={g,slope:clamp(g/1.1,0,1),sunny,mean:meanAt(y)+1.5*sunny*smooth(.02,.15,g),floor:false,field:false,pocket:false,rockG:0,poly:0,lobe:0,front:0,meadow:0,alas:false,rock:smooth(.6,1,g),streamD:1e9};
  const W=groundW(F,x,z);W[1][2]-=.22*W[0][0];   /* the woods from afar: a larch slope reads darker than its litter alone (the mid ground has no trees) */
  w1.push(...W[0]);w2.push(...W[1]);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R2+(i+.5)*st,z=-R2+(j+.5)*st;if(Math.abs(x)<NEAR.S-st&&Math.abs(z)<NEAR.S-st)continue;
  const a=j*n1+i,b=a+1,c=a+n1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:mid';
 m.userData.inspectLabel='The High Country to 20 km (the scale model 4.22, ~4 km a cell, with the crags of its ranges)';scene.add(m);})();
_mark('ground-mid');

// ---------------------------------------------------------------- the tors' mesh (KSTACKS.mesh): one mesh, the granite's walls and tops
(function(){if(!TORS.length)return;const pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),L=LIB['rock.tor']||null,GR=new THREE.Color(0xb4aea4),LI=new THREE.Color(0x9a9a6a),WHITE=new THREE.Color(0xffffff);
 TORS.forEach(B=>{const m=KSTACKS.mesh(B,{step:1.6}),n0=pos.length/3;
  for(let v=0;v<m.pos.length/3;v++){const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];pos.push(x,y,z);uv.push(m.uv[2*v]/2.5,m.uv[2*v+1]/2.5);
   c.copy(L?WHITE:GR).lerp(LI,.35*smooth(.45,.75,KRAND.fbm(x*.15,y*.15,z*.15,2,4795))*(m.part[v]===1?1.4:1));c.multiplyScalar(.6+.4*m.occ[v]);
   c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);
  REGISTER({name:B.name,key:'rock.tor',x:B.x,z:B.z,y:B.y0,r:B.R*.8,h:B.top-B.y0});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({map:L?L.map:null,normalMap:L?L.normalMap||null:null,roughnessMap:L?L.roughnessMap||null:null,roughness:1,metalness:0,vertexColors:true});
 [mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
 const me=new THREE.Mesh(g,mat);me.userData.inspectLabel='Granite tors (frost-shattered, lichened)';me.userData.host=true;me.userData.rock=true;
 const PP=[];TORS.forEach(B=>PP.push(B.x,(B.y0+B.top)/2,B.z));me.userData.probePoints=PP;scene.add(me);})();

// ---------------------------------------------------------------- the aufeis: the ice's own surface over the floor (KFROST's sheets)
// The naled builds over the valley floor in winter as the stream overflows and freezes, layer on layer; a spring sheet is metres
// thick, flat across, blue-white and glossy; summer and autumn leave its remnants (44s: SITE.frost's cover by season)
const AUFEIS_MESH=(function(){const st=6,pos=[],uv=[],col=[],al=[],idx=[],S={};
 if(!NWOW.frost.aufeis.length)return null;
 NWOW.frost.aufeis.forEach(l=>{const b=[Math.max(l.box[0],NEAR.box[0]),Math.max(l.box[1],NEAR.box[1]),Math.min(l.box[2],NEAR.box[2]),Math.min(l.box[3],NEAR.box[3])];
  if(b[0]>=b[2]||b[1]>=b[3])return;const nx=Math.floor((b[2]-b[0])/st)+2,nz=Math.floor((b[3]-b[1])/st)+2,cov=new Float32Array(nx*nz),top=new Float32Array(nx*nz),vid=new Int32Array(nx*nz).fill(-1);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=b[0]+i*st,z=b[1]+j*st;NWOW.frost.sample(x,z,S);cov[j*nx+i]=S.aufeis;top[j*nx+i]=S.iceH;}
  const vert=(i,j)=>{const k=j*nx+i;if(vid[k]>=0)return vid[k];const x=b[0]+i*st,z=b[1]+j*st,e=smooth(0,.5,cov[k]);
   vid[k]=pos.length/3;pos.push(x,terrainH(x,z)+Math.max(.03,top[k]),z);uv.push(x,z);col.push(.8+.2*e,.86+.14*e,.92+.08*e);al.push(smooth(0,.35,cov[k]));return vid[k];};
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const k=j*nx+i;if(!(cov[k]>0||cov[k+1]>0||cov[k+nx]>0||cov[k+nx+1]>0))continue;   /* the sheet and one cell round it: the rim fades out (aIce) */
   const a=vert(i,j),c1=vert(i+1,j),c=vert(i,j+1),d=vert(i+1,j+1);idx.push(a,c,c1,c1,c,d);}});
 if(!idx.length)return null;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setAttribute('aIce',new THREE.Float32BufferAttribute(al,1));g.setIndex(idx);g.computeVertexNormals();
 const L=LIB['ice.aufeis'];const mat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.22,metalness:0,map:L?L.map:null,normalMap:L?L.normalMap||null:null,
  roughnessMap:L?L.roughnessMap||null:null,transparent:true,opacity:.97});
 // the rim fades: each vertex carries KFROST's coverage (aIce), so the sheet thins to nothing where the overflow stopped spreading
 mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aIce;varying float vIce;').replace('#include <begin_vertex>','#include <begin_vertex>\nvIce=aIce;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vIce;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vIce;');};
 mat.customProgramCacheKey=()=>'nwouterwall-aufeis';
 if(L){[mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/L.scale,1/L.scale);}});}
 const m=new THREE.Mesh(g,mat);m.userData.inspectLabel='Aufeis (naled): the winter\'s overflow ice on the valley floor ('+SEASON+')';m.userData.host=true;m.name='ice:aufeis';m.renderOrder=1;scene.add(m);
 // register the patches the mesh draws (a remnant shorter than the ice grid's cells draws nothing and is no landform on the page);
 // each one's sample point for the probe is its drawn ice nearest its middle (the mesh is one merged mesh)
 const P=g.attributes.position,PP=[];NWOW.AUFEIS_DRAWN=[];
 NWOW.frost.records().filter(r=>r.kind==='aufeis').forEach(r=>{const R2=Math.min(r.r,60);let best=-1,bd=1e18;
  for(let i=0;i<P.count;i++){const dx=P.getX(i)-r.x,dz=P.getZ(i)-r.z,d=dx*dx+dz*dz;if(d<bd){bd=d;best=i;}}
  if(best<0||bd>R2*R2*.5)return;NWOW.AUFEIS_DRAWN.push(r);const px=P.getX(best),py=P.getY(best),pz=P.getZ(best);PP.push(px,py,pz);
  REGISTER({name:'Aufeis (naled), '+r.thick.toFixed(1)+' m thick',key:'landform.aufeis',x:r.x,z:r.z,y:terrainH(r.x,r.z)-1,r:R2,h:r.thick+2});});
 m.userData.probePoints=PP;
 return m;})();
_mark('aufeis');

// ---------------------------------------------------------------- Leng on the horizon (a placeholder massing: no Leng build exists yet)
// LORE.md 6.19: Leng is a ruined Ancient arcology, held by the Yeti (PLAN.md section 1). The owner, 2026-10-26: "a far silhouette":
// a stepped ruin of the arcology's kind (a broad podium, a stack of set-back blocks, its upper storeys broken off) at the model's
// own bearing and distance, hazed by the air between. Its size is a guess, to be replaced by Leng's own plan; tagged a placeholder.
const LENG=(function(){const P=NW_REGION.places.find(p=>p.name==='Leng');if(!P||P.km>30)return null;
 const x=P.x,z=P.z,y0=groundH(x,z)-4,pos=[],col=[],idx=[],c=new THREE.Color();const s=KRAND.stream(KRAND.hash(SITE.seed,0x1E26));
 const box=(cx,cz,w,d,y,h,shade)=>{const n=pos.length/3,X=[cx-w/2,cx+w/2],Z=[cz-d/2,cz+d/2];
  for(let k=0;k<8;k++){pos.push(X[k&1],y+(k&4?h:0),Z[(k>>1)&1]);c.setRGB(shade,shade*1.01,shade*1.03);col.push(c.r,c.g,c.b);}
  [[0,2,6,0,6,4],[1,5,7,1,7,3],[0,4,5,0,5,1],[2,3,7,2,7,6],[4,6,7,4,7,5]].forEach(f=>f.forEach(q=>idx.push(n+q)));};
 // the podium and the stepped stack; the top broken into stubs of uneven height
 // weathered Ancient concrete, grey-brown, darkened by the Yeti's smoke and the lichen; the stack set back on its podium, its upper
 // storeys broken off into stubs and a leaning shard
 box(x,z,900,760,y0,70,.36);let w=640,d=560,y=y0+70;
 for(let k=0;k<5;k++){const h=s.range(70,110);box(x+s.range(-30,30),z+s.range(-30,30),w,d,y,h,.33+.025*k);y+=h;w*=.78;d*=.8;}
 for(let k=0;k<9;k++)box(x+s.range(-w*.7,w*.7),z+s.range(-d*.7,d*.7),s.range(30,110),s.range(30,100),y-20,s.range(20,170),s.range(.28,.36));
 box(x+w*.4,z-d*.3,60,50,y0+70,y-y0-40,.3);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.host=true;m.userData.placeholder=true;m.userData.noSnow=true;m.name='leng';
 m.userData.inspectLabel='Leng: a ruined Ancient arcology, held by the Yeti ('+P.km+' km; a placeholder massing until Leng has its own build)';scene.add(m);
 REGISTER({name:'Leng (ruined arcology, held by the Yeti; placeholder massing)',key:'place.leng',x,z,y:y0,r:500,h:y-y0+140,placeholder:true});
 return {x,z,y0,top:y,P};})();

// ---------------------------------------------------------------- the water records (core/water): the stream, the alas lakes, the model's lake
const WATER_RECS=typeof WATER==='undefined'?null:(function(){const out={};
 if(STREAM){const P=STREAM.pts.map((p,i)=>[p[0],p[1],STREAM.level[i]]);out.stream=WATER.flow({name:STREAM.name,pts:P,width:STREAM.w*2,speed:.6});}
 out.alases=ALAS_LAKES.map(a=>{const poly=[];for(let k=0;k<36;k++){const t=k/36*TAU,r=a.r*a.floor*a.lake*.98;poly.push([a.x+Math.cos(t)*r,a.z+Math.sin(t)*r]);}
  return WATER.still({name:'An alas lake ('+a.id+')',level:a.level,poly});});
 if(MODEL_LAKE){const G=NW_REGION.grid,poly=[];
  out.lake=WATER.still({name:'The frozen lake (the Yeti\'s capital stands by it)',level:MODEL_LAKE.level,
   poly:(function(){const xs=MODEL_WATER.map(w=>w.x),zs=MODEL_WATER.map(w=>w.z);return [[Math.min(...xs)-G.dx,Math.min(...zs)-G.dz],[Math.max(...xs)+G.dx,Math.min(...zs)-G.dz],
    [Math.max(...xs)+G.dx,Math.max(...zs)+G.dz],[Math.min(...xs)-G.dx,Math.max(...zs)+G.dz]];})()});}
 return out;})();
_mark('meshes');
