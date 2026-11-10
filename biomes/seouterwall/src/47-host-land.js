// ================================================================= HOST — the land: the brook, the baked ground, the heaps, the fields, the binding, the meshes
// Forked from biomes/wouterwall's (its gullies, terraces, cave houses and pillars left out; the moraines, the meltwater gully, the crags'
// rock on KSTRATA and the rockfall heaps on KRUBBLE in). The station's ground is the model's plus its relief (45, 44s), the brook's
// channel cut in, then BAKED once on core/terrain's KFIELD over the near box (NEAR.step m): the near ground's mesh is that grid, and
// terrainH reads the field there, so a plant's foot is on the drawn ground and the export carries the same heights (BIO.init field).
// Beyond the box the mid ground (to 20 km) reads the function itself.

// ---------------------------------------------------------------- the near box and a coarse look at the ground
const NEAR={S:Math.round(SITE.R*1.15/10)*10,step:SITE.step==null?10:SITE.step};NEAR.box=[-NEAR.S,-NEAR.S,NEAR.S,NEAR.S];
const COARSE=(function(){const st=20,n=Math.ceil(NEAR.S*2.2/st)+1,x0=-NEAR.S*1.1,H=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=baseH(x0+i*st,x0+j*st);
 const h=(x,z)=>KFIELD.bilinear(H,n,n,clamp((x-x0)/st,0,n-1.0001),clamp((z-x0)/st,0,n-1.0001));
 return {h,grade(x,z){const hx=(h(x+st,z)-h(x-st,z))/(2*st),hz=(h(x,z+st)-h(x,z-st))/(2*st),g=Math.hypot(hx,hz);return {g,sunny:g>.005?hz/g:0};}};})();
_mark('coarse');

// ---------------------------------------------------------------- the brook (its line, its water level never climbing downstream)
const STREAM=(function(){const S=SITE_STREAM,P=S?S.pts():[];if(P.length<2)return null;
 // the gully's floor (KRELIEF.wadi: never climbing downstream), its water a few decimetres over it, resampled every ~10 m
 const pts=[],L=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10));
  for(let k=0;k<n;k++){const t=k/n;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);L.push(a[2]+(b[2]-a[2])*t+.2);}}
 const e=P[P.length-1];pts.push([e[0],e[1]]);L.push(e[2]+.2);for(let i=1;i<L.length;i++)L[i]=Math.min(L[i],L[i-1]-.01);
 const idx=KSPACE.create({cell:40});for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];idx.insert(i,(a[0]+b[0])/2,(a[1]+b[1])/2,10*.6+S.width*3);}
 // the nearest point on the line: {d, y (the water's level there), i}
 const near=(x,z,pad)=>{let best=1e18,by=0,bi=-1;idx.query(x,z,pad,[]).forEach(i=>{const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,
  t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z,d2=qx*qx+qz*qz;if(d2<best){best=d2;by=L[i]+(L[i+1]-L[i])*t;bi=i;}});return {d:Math.sqrt(best),y:by,i:bi};};
 return {name:S.name,pts,level:L,w:S.width,near};})();
// the ground with the brook's channel cut in: a bed ~0.4 m under the water across the brook's width, its banks eased
function cutH(x,z){const h=groundH(x,z);if(!STREAM)return h;const n=STREAM.near(x,z,Math.max(STREAM.w*2.5,NEAR.step*2));if(n.i<0)return h;
 const k=smooth(Math.max(STREAM.w*2.2,NEAR.step*1.7),Math.max(STREAM.w*.6,NEAR.step*.7),n.d);   /* at least the ground grid's cells: a narrower cut is not drawn */return k>0?Math.min(h,h+(n.y-.4-h)*k):h;}
// THE BAKED GROUND: the near box on KFIELD (the mesh's grid); terrainH reads it there and the function beyond
const FIELD=KFIELD.bake(cutH,NEAR.box,NEAR.step,{name:'seouterwall.'+SITE.name});
_mark('bake-ground');
const inNear=(x,z)=>x>=NEAR.box[0]&&x<=NEAR.box[2]&&z>=NEAR.box[1]&&z<=NEAR.box[3];
function terrainH(x,z){return inNear(x,z)?FIELD.h(x,z):groundH(x,z);}

// ---------------------------------------------------------------- the water: the brook (the tarns are stations 2-6)
function waterH(x,z){
 if(STREAM){const n=STREAM.near(x,z,STREAM.w*1.6);if(n.i>=0&&n.d<STREAM.w*1.3)return n.y;}
 return -1e9;}

const OBSTACLES=[];   // cylinders nothing grows inside (the heaps; the trees after the build: 89z)
// ---------------------------------------------------------------- the rockfall heaps (core/terrain KRUBBLE: PLAN.md section 2.4)
// The freeze-thaw prises blocks off the north slope's crags every noon; they pile at the slope's foot in heaps of megabreccia blocks.
// Each heap stands where the ground first rises SITE.heaps.foot m over the flat, walking north from the divide, its foot set under the
// lowest ground round it (a heap on a slope is buried on its upper side, never floating on its lower)
const HEAPS=(function(){const T=SITE.heaps;if(!T||typeof KRUBBLE==='undefined')return [];const L=[],n=T.n;
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<16;i++){const a=i/16*TAU;for(const k of [.4,.8,1.05])m=Math.min(m,terrainH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-.3;};
 for(let k=0;k<n;k++){const u=KRAND.unit(KRAND.hash(T.seed,k,1)),x=T.x[0]+(T.x[1]-T.x[0])*(k+.2+.6*u)/n;
  const want=T.foot[0]+(T.foot[1]-T.foot[0])*KRAND.unit(KRAND.hash(T.seed,k,2));let z=-500;for(;z>-NEAR.S+80;z-=10){if(terrainH(x,z)>=want)break;}
  if(z<=-NEAR.S+80)continue;
  const rx=T.rx[0]+(T.rx[1]-T.rx[0])*KRAND.unit(KRAND.hash(T.seed,k,3)),rz=rx*(.55+.3*KRAND.unit(KRAND.hash(T.seed,k,4)));
  const H=KRUBBLE.heap({id:'heap'+k,x,z,y0:footY(x,z,rx),rx,rz,ry:(KRAND.unit(KRAND.hash(T.seed,k,5))-.5)*.6,h:rx*.32,lumps:6,blocks:16,size:[1.2,4.5],seed:KRAND.hash(T.seed,k,6)});
  H.name='A rockfall heap (megabreccia blocks off the crags, '+(rx*2).toFixed(0)+' m across)';L.push(H);}
 return L;})();
SITE_HEAPS=HEAPS;
const heapAt=HEAPS.length?(x,z)=>{for(const H of HEAPS){if(Math.abs(x-H.x)>H.rx+2||Math.abs(z-H.z)>H.rx+2)continue;if(KRUBBLE.heightAt(H,x,z)>.25)return 1;}return 0;}:()=>0;
HEAPS.forEach(H=>OBSTACLES.push({x:H.x,z:H.z,r:Math.max(H.rx,H.rz)+1.5,y0:H.y0,y1:H.y0+H.h+2}));

// ---------------------------------------------------------------- the wind's exposure (the God-Bore: PLAN.md section 2.1)
// 0 a lee .. 1 the open col and the crests: how far a point stands over the ground round it (a ring at 200 m), less the shelter of the
// ground upwind (SEOW.FROM: north-north-west) rising over it within 140 m (a moraine's lee, a crag's). On the drawn ground (terrainH)
function windAt(x,z,y){let m=0;for(let i=0;i<8;i++){const a=i/8*TAU;m+=terrainH(x+Math.cos(a)*200,z+Math.sin(a)*200);}m/=8;
 const U=SEOW.FROM;let rise=0;for(const d of [30,70,140]){rise=Math.max(rise,terrainH(x+U[0]*d,z+U[1]*d)-y-d*.06);}
 return clamp(.55+(y-m)/45-.75*smooth(0,9,rise),0,1);}

// ---------------------------------------------------------------- the fields (biomes/WORLD.md; BIOME-API.md)
// One record a point (memo of the last): the height, the grade and aspect off the baked field, the climate (the mean with the aspect's
// degree and a half), the site's crags, moraines and meltwater gully, the wind's exposure, the heaps, the brook's distance
const _fm={x:NaN,z:NaN,F:null};
function fieldsAt(x,z){if(x===_fm.x&&z===_fm.z)return _fm.F;
 const y=terrainH(x,z),e=inNear(x,z)?NEAR.step:20,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),g=Math.hypot(hx,hz);
 const sunny=g>.005?hz/g:0,slope=clamp(g/1.1,0,1),mean=meanAt(y)+1.5*sunny*smooth(.02,.15,g);
 const P=sitePoint(x,z),n=STREAM?STREAM.near(x,z,140):{d:1e9,i:-1},streamD=n.i>=0?n.d:1e9;
 const water=waterH(x,z)>y+.05,heap=heapAt(x,z)>.5;
 const F={y,g,slope,sunny,mean,perma:SEOW.climate(mean).perma,water,streamD,heap,melt:P.melt,fan:P.fan,cobble:P.cobble,moraine:P.moraine,crag:P.crag,
  wind:windAt(x,z,y),
  // what the NW outer wall's passes read (nwouterwall's 55: no tree in a field, in water, on the aufeis or in a pocket)
  field:false,aufeis:false,pocket:false,rock:heap?1:smooth(.75,1.1,g),gully:0};
 _fm.x=x;_fm.z=z;_fm.F=F;return F;}
if(SITE.amp)SEOW.AMP=SITE.amp;
SEOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
// THE NW OUTER WALL'S FLORA, read in place (PLAN.md section 7.1; build.py slots its layout and its passes): its passes ask NWOW for the
// fields and the zone; they get this page's fields, its swing, and each SEOW zone as the nwouterwall zone that grows there (SEOW.ZONES' nw)
NWOW.AMP=SEOW.AMP;NWOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
NWOW.larchK=SITE.larch==null?.3:SITE.larch;   /* the larch only in a lee, and thin there: the col is the God-Bore's (PLAN.md section 2.1) */
// the core's fields for any kit on the page (BIO.field): wet, flow, cold, rock, upland, slope, and this kit's own
const FIELDS={
 wet:(x,z)=>{const F=fieldsAt(x,z);return clamp(Math.max(smooth(25,3,F.streamD),F.melt?.4:0,F.fan*.3),.08,1);},
 flow:(x,z)=>smooth(STREAM?STREAM.w*6:0,STREAM?STREAM.w:0,fieldsAt(x,z).streamD),
 cold:(x,z)=>clamp((2-fieldsAt(x,z).mean)/12,0,1),rock:(x,z)=>fieldsAt(x,z).rock,
 upland:(x,z)=>clamp((fieldsAt(x,z).y+200)/400,0,1),slope:(x,z)=>fieldsAt(x,z).slope,
 sunny:(x,z)=>fieldsAt(x,z).sunny,mean:(x,z)=>fieldsAt(x,z).mean,wind:(x,z)=>fieldsAt(x,z).wind,moraine:(x,z)=>fieldsAt(x,z).moraine};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
// the LOD spine: the divide, the gully, the fan and the west moraine's lee; the floor's dense band round each point
const SPINE=SITE.spine||[[-150,-60],SITE_MELT_AT(.4),SITE_FAN(),[-1250,-300]];
BIO.init({tags:'seouterwall',THREE:THREE,scene:scene,terrainH:terrainH,field:FIELD,waterH:waterH,mask:(x,z)=>waterMask(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed,origin:SPINE,center:[0,0],fields:FIELDS,register:REGISTER,err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],
 lod:{hero:400,mid:950,far:SITE.R*1.2,floor:[260,600]}});
BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
_mark('init');

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
// the ground's seven: the puna's bunchgrass (its base), the larch's needle litter, cobble (the meltwater gully and its fan), the
// megabreccia (the crags and the walls), gravel (the moraines' till, the scree), tundra (the moraines' turf, the krummholz's ground)
// and the lichen crust (the exposed crests, the fellfield)
const LAYERS=['ground.puna','ground.needles','ground.cobble','rock.megabreccia','ground.gravel','ground.tundra','ground.lichen'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYERS.forEach(k=>{const P=KMAT.packed('seouterwall',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PN=(x,y,s,sd)=>KRAND.fbm(x/s,y/s,0,2,sd);
const PROC={'ground.puna':greyTex((x,y)=>165+60*(PN(x,y,6,11)-.5)),'ground.needles':greyTex((x,y)=>140+60*(PN(x,y,5,12)-.5)),
 'ground.cobble':greyTex((x,y)=>160+80*(PN(x,y,4,13)-.5)),'rock.megabreccia':greyTex((x,y)=>150+70*(PN(x,y,10,14)-.5)+30*(PN(x,y,3,18)-.5)),
 'ground.gravel':greyTex((x,y)=>165+70*(PN(x,y,3,15)-.5)),'ground.tundra':greyTex((x,y)=>150+50*(PN(x,y,6,16)-.5)),
 'ground.lichen':greyTex((x,y)=>160+60*(PN(x,y,5,17)-.5))};
const PSCALE={'ground.puna':2.4,'ground.needles':2,'ground.cobble':2,'rock.megabreccia':4,'ground.gravel':2.5,'ground.tundra':2.2,'ground.lichen':2};
const layer=k=>LIB[k]?{map:LIB[k].map,s:LIB[k].scale,lib:true}:{map:PROC[k],s:PSCALE[k],lib:false};
LAYERS.forEach(k=>{const t=layer(k).map;if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
// THE SEASON'S GROUND (sRGB tints over each layer's map): the puna straw-gold in autumn, a thin green-gold in summer, frost-grey in winter;
// the larch litter gold under the autumn larch; the cobble and the gravel grey all year (darker wet in the spring melt)
const TINT={
 autumn:{puna:0xd0bc94,needles:0xa48a66,cobble:0xb8b2a8,rock:0xd8d4cc,gravel:0xb4aea4,tundra:0xa49078,lichen:0xb4b0a0},
 summer:{puna:0xbab48a,needles:0x9a8466,cobble:0xb4aea4,rock:0xd8d4cc,gravel:0xb0aca2,tundra:0x929a6a,lichen:0xb8b2a0},
 winter:{puna:0xc0b8a8,needles:0x7a6a58,cobble:0xa8a49e,rock:0xd0ccc6,gravel:0xa8a49c,tundra:0x8a8274,lichen:0xa8a69e},
 spring:{puna:0xb2a88a,needles:0x8e7a62,cobble:0x9e9a92,rock:0xc8c4bc,gravel:0xa09c94,tundra:0x8a8264,lichen:0xaca898}}[SEASON];

// ---------------------------------------------------------------- the ground material (one shader for the near and the mid ground)
// THE DITHER (nwouterwall's, from Korona's ground): each layer's map read through a hex-cell bomb, a layer's edges pushed through a noise
// threshold, a coarse mottle. Each read is decoded from sRGB where it is sampled (nsamp), so the bomb's blend is linear.
// GLSL ES 1.0 (three r128); the hash is Hoskins' fract hash, not a sine.
const GROUND_DITHER=[
 'vec2 nh2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}',
 'float nvn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(nh2(i).x,nh2(i+vec2(1.0,0.0)).x,f.x),mix(nh2(i+vec2(0.0,1.0)).x,nh2(i+vec2(1.0,1.0)).x,f.x),f.y);}',
 'float nfbm(vec2 p){return 0.6*nvn(p)+0.3*nvn(p*2.3+7.1)+0.1*nvn(p*5.1+3.7);}',
 'vec4 nsamp(sampler2D m,vec2 p,vec2 v,float sd){vec2 h=nh2(v*0.37+sd);float a=(h.x-0.5)*6.2831853,ca=cos(a),sa=sin(a);return pow(texture2D(m,vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y)+h*13.0),vec4(2.2));}',
 'vec4 nbomb(sampler2D m,vec2 p,float cell,float sd){vec2 st=p/cell;vec2 sk=vec2(st.x-st.y*0.57735027,st.y*1.1547005);vec2 b=floor(sk),f=fract(sk);vec2 v1,v2,v3;vec3 w;',
 ' if(f.x+f.y<1.0){v1=b;v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(1.0-f.x-f.y,f.x,f.y);}else{v1=b+vec2(1.0,1.0);v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);}',
 ' w=w*w*w;w/=(w.x+w.y+w.z);return nsamp(m,p,v1,sd)*w.x+nsamp(m,p,v2,sd)*w.y+nsamp(m,p,v3,sd)*w.z;}',
 'vec3 ndither(sampler2D m,vec2 p){vec4 a=nbomb(m,p,1.9,0.0);vec4 b=nbomb(m,p*0.33+vec2(2.3,5.1),1.4,7.0);float n=nfbm(p*0.055+vec2(1.7,9.2));return mix(a,b,0.2+0.6*smoothstep(0.3,0.7,n)).rgb;}',
 'float nedge(float w,vec2 x,float sd){if(w<=0.001)return 0.0;if(w>=0.999)return 1.0;float n=0.55*nfbm(x*0.35+sd)+0.45*nfbm(x*1.7+sd*3.1);return smoothstep(n-0.12,n+0.12,w);}',
 ''].join('\n');
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
// THE ROCK'S COLUMN (core/terrain KSTRATA; PLAN.md section 1.2): the cordillera's `megabreccia` (blocks of every rock, at every angle, in
// a grey matrix flecked with impact glass), and the Godthrone's `tibasalt` (thin black flows, orange glass-bead horizons) as its LATERAL
// stack, taking over to the west across the Godsgate's corridor (7.5 km west of the station: section 7.2), so the corridor's west wall is
// black and its east wall the patchwork. Read on the rock as a tint over the megabreccia layer's own colour (its ratio to the recipe's
// matrix), by the rock's weight; the beds are flat (the dip's default), no KSTRATA.vary (its drape is CPU-only)
const ROCK_SH=typeof KSTRATA!=='undefined'&&KSTRATA.shade?KSTRATA.shade(KSTRATA.create({seed:KRAND.hash(SITE.seed,0x5E0B),formations:[{recipe:'megabreccia'}],range:[-500,4300],
 lateral:{formations:[{recipe:'tibasalt'}],dir:[-1,0],at:[-7500,0],d0:-450,d1:450}}),{res:.5}):null;
const ROCK_REF=(()=>{const c=new THREE.Color(0x6d6a66).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';})();
const BEDS=ROCK_SH?'{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/'+ROCK_REF+',vec3(0.28),vec3(1.6)),vW2.w*0.9);}':
 'diffuseColor.rgb*=1.0-vW2.w*0.25*smoothstep(0.5,0.8,nvn(vGWP.xz*0.04));';
{const U={},Ls=LAYERS.map(layer);LAYERS.forEach((k,i)=>U['uL'+i]={value:Ls[i].map});
 const T=Object.values(TINT).map(h=>{const c=new THREE.Color(h).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';});
 const tex=i=>'ndither(uL'+i+',p/'+Ls[i].s.toFixed(2)+')*'+(Ls[i].lib?'1.0':'0.75')+'*'+T[i];
 const over=(i,w,sd)=>'{float k=nedge('+w+',p,'+sd.toFixed(1)+');if(k>0.0)c=mix(c,'+tex(i)+',k);}';
 // the weights: aW [needles, cobble, rock, gravel], aW2 [tundra, lichen, brightness, the rock's column (KSTRATA's tint)]
 MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);if(ROCK_SH)ROCK_SH.inject(sh);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D '+LAYERS.map((k,i)=>'uL'+i).join(',')+';varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER)
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;vec3 c='+tex(0)+';',
    over(4,'vW.w',1.3),over(1,'vW.x',2.9),over(5,'vW2.x',4.1),over(6,'vW2.y',5.7),over(2,'vW.y',6.3),
    '{vec2 p=vec2(vGWP.x+vGWP.z,vGWP.y*1.3);float k=nedge(vW.z,vGWP.xz,8.9);if(k>0.0)c=mix(c,'+tex(3)+',k);}',   /* the crags: read from the side */
    'float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));c*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh);',
    'diffuseColor.rgb*=c*vW2.z*1.25;}',
    BEDS].join('\n'));};   /* the rock's column (KSTRATA) */
 MAT_GROUND.customProgramCacheKey=()=>'seouterwall-ground-dither';
 /* THE GROUND ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js), as the other outer walls': the puna's bunchgrass, the base, stays
    dithered (ndither), and the six layers over it come hex-tiled, scaled with distance and blended by height, each at its weight and the
    season's tint; and TRIPLANAR SIDES (o.tri): on the steep each layer is read from the side as well, so the crags are not smeared down the
    slope. Only with every layer from the pack (the procedural fallback keeps its mix) and ?kground=0 not set. three r128 uploads
    cameraPosition only to Phong and Standard materials, so on this Lambert ground KGROUND's distance takes the eye from the view matrix */
 const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'&&Ls.every(L=>L.lib);
 const KG_LY=KG_ON?[[4,'vW.w'],[1,'vW.x'],[5,'vW2.x'],[6,'vW2.y'],[2,'vW.y'],[3,'vW.z']].map(([i,w])=>KGROUND.layer('seouterwall',LAYERS[i],{w,tint:T[i],name:LAYERS[i]})):null;
 if(KG_LY&&KG_LY.every(Boolean)){
  const KG_EYE='#define '+'camera'+'Position kEye()\n';   /* joined so check_source's CAMPOS rule, which cannot tell a redirect from a read, does not count it */
  MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uL0:U.uL0});if(ROCK_SH)ROCK_SH.inject(sh);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
    .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL0;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER+KHOOK.EYE+KG_EYE)
    .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;diffuseColor.rgb='+tex(0)+';}','/*KGROUND*/',
     '{vec2 p=vGWP.xz;float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));diffuseColor.rgb*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh)*vW2.z*1.25;',
     '}',BEDS].join('\n'));};
  MAT_GROUND.customProgramCacheKey=()=>'seouterwall-ground-kg';
  KGROUND.hook(MAT_GROUND,{key:'seouterwall-ground',layers:KG_LY,at:'/*KGROUND*/',tri:{from:.3,to:.65,far:400}});
  MAT_GROUND.userData.kgroundOn=true;}}
// the weights at a point: [needles, cobble, rock, gravel], [tundra, lichen, brightness, the rock's column]
function groundW(F,x,z){const shade=SEOW.shadeOf(F),warm=F.mean+SEOW.AMP.warm,hi=smooth(8.5,6.5,warm),fell=smooth(4,1.5,warm);
 const lee=1-smooth(.4,.62,F.wind);
 const needles=.85*smooth(.06,.32,shade)*lee*(1-hi)*(1-smooth(.55,.85,F.g))*(F.melt?0:1);
 const melt=F.melt==='floor'||F.melt==='bar'||F.melt==='pool'?.95:F.melt==='bank'?.45:0;
 const cobble=Math.max(melt,F.fan*.9,F.melt==='fan'?.5:0,smooth(STREAM?STREAM.w*3:0,STREAM?STREAM.w:0,F.streamD));
 const rock=Math.max(smooth(.62,.95,F.g),F.crag>10?.55*smooth(.3,.55,F.g):0);   /* the crags' faces; a rib's crest on a lesser slope */
 const gravel=Math.max(smooth(.32,.6,F.g)*(1-rock)*.9,smooth(3,10,F.moraine)*.5,F.heap?1:0);
 const tun=Math.max(hi*.7,smooth(1,7,F.moraine)*.45,shade>.18&&F.wind>=SEOW.EXPOSED?.4:0);
 const lich=Math.max(fell,smooth(.62,.9,F.wind)*.35,smooth(.45,.7,F.g)*.3);
 let br=.8+.32*KRAND.fbm(x*.0045,z*.0045,0,3,6197)+.1*(KRAND.vnoise(x*.06,z*.06,0,6192)-.5)-.1*needles;
 return [[needles,cobble,rock,gravel],[tun,lich,br,rock]];}

// ---------------------------------------------------------------- the near ground: the baked field's own grid, one mesh
// THE ZONE RASTER: each grid point's zone (46) kept as it is worked out here, so the passes read a candidate's zone at the nearest grid
// point (SEOW.zoneAt; and NWOW.zoneAt, the nwouterwall zone it grows as) and work out the full fields only for the candidates they accept
const ZONE_IDS=Object.keys(SEOW.ZONES),ZR=new Uint8Array(FIELD.nx*FIELD.nz);
SEOW.zoneAt=(x,z)=>{if(!inNear(x,z))return SEOW.at(x,z).zone;const i=Math.round((x-FIELD.x0)/FIELD.step),j=Math.round((z-FIELD.z0)/FIELD.step);return ZONE_IDS[ZR[j*FIELD.nx+i]];};
NWOW.zoneAt=(x,z)=>SEOW.nwZone(SEOW.zoneAt(x,z));
(function(){const f=FIELD,nx=f.nx,nz=f.nz,pos=new Float32Array(nx*nz*3),w1=new Float32Array(nx*nz*4),w2=new Float32Array(nx*nz*4),idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=f.x0+i*f.step,z=f.z0+j*f.step;pos[3*k]=x;pos[3*k+1]=f.at(i,j);pos[3*k+2]=z;
  const F=fieldsAt(x,z);const W=groundW(F,x,z);w1.set(W[0],4*k);w2.set(W[1],4*k);ZR[k]=ZONE_IDS.indexOf(SEOW.zoneOf(F));}
 // the crags and the heaps widened by one grid point in the raster: the passes read the nearest point's zone, so a candidate on a crag's
 // face could take its neighbour's larch or tundra (the W outer wall's finding, 2026-11-09); nothing roots within a cell of a face
 {const CRAG=ZONE_IDS.indexOf('crag'),HEAP=ZONE_IDS.indexOf('heap'),WATER=ZONE_IDS.indexOf('water'),Z0=ZR.slice();
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(Z0[k]===CRAG||Z0[k]===WATER||Z0[k]===HEAP)continue;
   for(const q of [k-1,k+1,k-nx,k+nx,k-nx-1,k-nx+1,k+nx-1,k+nx+1]){if(Z0[q]===CRAG){ZR[k]=CRAG;break;}if(Z0[q]===HEAP){ZR[k]=HEAP;break;}}}}
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aW',new THREE.BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ground (the scale model\'s with the station\'s crags, moraines and meltwater gully, baked: core/terrain KFIELD)';m.userData.host=true;m.name='ground:near';scene.add(m);})();
_mark('ground-near');

// ---------------------------------------------------------------- the mid ground: the model's country to 20 km, the near box cut out
(function(){const R2=20000,N=180,st=R2*2/N,n1=N+1,H=new Float32Array(n1*n1),pos=[],w1=[],w2=[],idx=[];
 const inner=NEAR.S-NEAR.step*2;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)H[j*n1+i]=baseH(-R2+i*st,-R2+j*st);
 const h=(i,j)=>H[clamp(j,0,N)*n1+clamp(i,0,N)];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-R2+i*st,z=-R2+j*st,ax=Math.abs(x),az=Math.abs(z);
  const y=h(i,j)-(ax<inner&&az<inner?30:2.5*smooth(NEAR.S*1.6,NEAR.S,Math.max(ax,az)));pos.push(x,y,z);
  const hx=(h(i+1,j)-h(i-1,j))/(2*st),hz=(h(i,j+1)-h(i,j-1))/(2*st),g=Math.hypot(hx,hz),sunny=g>.005?hz/g:0;
  const F={g,slope:clamp(g/1.1,0,1),sunny,mean:meanAt(y)+1.5*sunny*smooth(.02,.15,g),melt:null,fan:0,moraine:0,crag:g>.45?20:0,heap:false,wind:.6,streamD:1e9};
  const W=groundW(F,x,z);W[1][2]-=.22*W[0][0];   /* the larch from afar: a lee's wood reads darker than its litter alone (the mid ground has no trees) */
  w1.push(...W[0]);w2.push(...W[1]);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R2+(i+.5)*st,z=-R2+(j+.5)*st;if(Math.abs(x)<NEAR.S-st&&Math.abs(z)<NEAR.S-st)continue;
  const a=j*n1+i,b=a+1,c=a+n1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:mid';
 m.userData.inspectLabel='The cordillera to 20 km (the scale model 5.1, 1 km a cell: the Godsgate\'s corridor to the west, the walls to 7 km)';scene.add(m);})();
_mark('ground-mid');

// ---------------------------------------------------------------- the heaps' mesh (KRUBBLE.mesh): one mesh, the heaps and their blocks
(function(){if(!HEAPS.length)return;const pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),L=LIB['rock.megabreccia']||null,
  BASEC=new THREE.Color(L?0xe8e4dc:0x8a8680),BLK=new THREE.Color(L?0xd4cec4:0x777370);
 HEAPS.forEach(H=>{const m=KRUBBLE.mesh(H,{cell:3}),n0=pos.length/3;
  for(let v=0;v<m.pos.length/3;v++){const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];pos.push(x,y,z);uv.push(m.uv[2*v]/(L?L.scale:4),m.uv[2*v+1]/(L?L.scale:4));
   c.copy(m.part[v]===0?BASEC:BLK).multiplyScalar(.82+.3*KRAND.h3(Math.floor(x),Math.floor(y),Math.floor(z),6194));
   c.multiplyScalar(.55+.45*(m.occ?m.occ[v]:1));c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);
  REGISTER({name:H.name,key:'landform.rockfall',x:H.x,z:H.z,y:H.y0,r:Math.max(H.rx,H.rz)*.8,h:H.h+2});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({map:L?L.map:null,normalMap:L?L.normalMap||null:null,roughnessMap:L?L.roughnessMap||null:null,roughness:1,metalness:0,vertexColors:true});
 [mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
 const me=new THREE.Mesh(g,mat);me.userData.inspectLabel='Rockfall heaps (megabreccia blocks off the north slope\'s crags: core/terrain KRUBBLE)';me.userData.host=true;me.userData.rock=true;me.name='rock:heaps';
 const PP=[];HEAPS.forEach(H=>PP.push(H.x,H.y0+H.h*.5,H.z));me.userData.probePoints=PP;scene.add(me);})();
// the landforms registered (the inspector names them; the probe finds them): the moraines at their middles, the gully, the fan, the divide
SITE.moraines.forEach(m=>{const x=(m.a[0]+m.b[0])/2,z=(m.a[1]+m.b[1])/2;REGISTER({name:m.name+' ('+m.h+' m of till)',key:'landform.moraine',x,z,y:terrainH(x,z)-m.h-3,r:m.w*.9,h:m.h*2+8});});
if(STREAM)REGISTER({name:'The meltwater\'s head (the north slope\'s late snow feeds it)',key:'landform.spring',
 x:STREAM.pts[0][0],z:STREAM.pts[0][1],y:terrainH(STREAM.pts[0][0],STREAM.pts[0][1])-3,r:14,h:8});
{const F=SITE_FAN();REGISTER({name:'The meltwater fan (the brook sinks into its gravel on the outwash flat)',key:'landform.fan',x:F[0],z:F[1],y:terrainH(F[0],F[1])-3,r:120,h:12});}

// ---------------------------------------------------------------- the hazards (core/hazard: tags.hazard records; PLAN.md section 2)
// core/tags records the hazard module reads (KHAZ.list, KHAZ.at, the export's `hazards`), not the inspector's volumes. THE GOD-BORE: the
// night's katabatic gale across the col (80-130 km/h at -15 °C: convective hypothermia in the open), on the day's clock (t: seconds from
// midnight): its tell from 19:00, rising from 20:00, full from 21:00 to 05:00, falling by 06:00. The ROCKFALL: each heap lies under a
// chute that discharges at noon as the sun melts the ice cement (steady here: the noon peak is a later refinement, KNOWN_ISSUES.md)
const HAZARDS=[];
HAZARDS.push(BIO.record({name:'The God-Bore (the night\'s katabatic gale across the col: 80-130 km/h at -15 °C)',x:0,z:0,y:terrainH(0,0)-20,r:SITE.R,h:120,
 tags:{hazard:{kind:'cold',danger:.45,dose:.35,cycle:{period:86400,warn:3600,ramp:3600,on:8*3600,after:0,offset:86400-19*3600},
  tell:{colour:'#bfe6ff',fx:'spindrift',sound:'wind'}}}}));
HEAPS.forEach(H=>HAZARDS.push(BIO.record({name:'Rockfall (the chute above '+H.name.replace(/^A /,'a ')+')',x:H.x,z:H.z-H.rz*.5,y:H.y0-2,r:Math.max(H.rx,H.rz)*1.3,h:H.h+30,
 tags:{hazard:{kind:'crush',danger:.6}}})));

// ---------------------------------------------------------------- the water records (core/water): the meltwater brook
const WATER_RECS=typeof WATER==='undefined'?null:(function(){const out={};
 if(STREAM){const P=STREAM.pts.map((p,i)=>[p[0],p[1],STREAM.level[i]]);out.stream=WATER.flow({name:STREAM.name,pts:P,width:STREAM.w*2,speed:.7});}
 return out;})();
_mark('meshes');
