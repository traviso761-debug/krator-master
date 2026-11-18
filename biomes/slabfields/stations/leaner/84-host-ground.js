// ================================================================= HOST — the ground: station 2, the Leaner (station 1's src/84; PLAN.md sections 6 and 16)
// One ground mesh painted from the fields, on KGROUND (43-core-ground.js) with four library layers, each on its documented mask, and every steep face in
// the flood basalt's own beds (41: SLAB_STRATA through KSTRATA, 35 + host/35 shade: strataColor), tilted with the slab:
//   aGL.x  RUBBLE   rock.rubble.sturzstrom: the apron and its spill into the patera (FIELD.apron, the spill's fan)
//   aGL.y  STEPPE   ground.steppe: the corridor's dry ground and the ramp's soil pockets (235 mm, BSk)
//   aGL.z  SEEP     ground.reedbed: the lake's shore, the live springs and the ponds' wet ends
//   aGL.w  LICHEN   ground.lichen.crust: the ramp's old flow tops behind the rim
// The paint carries what the library has no layer for here (KNOWN_ISSUES.md): the shelf's pale lake marl and the strandlines' berms, the travertine
// and sulfur round the springs, the ponds' dry ends with their old shores, the road's track
//   aFr    the fresh scar (KRELIEF.at(...).fresh off the slab's plateau): paler, bare of lichen and steppe
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
/* the beds: the slab's 1.25 km of flows over the corridor (2.1 km) to its crest (3.36 km); they rise NNW 0.1175 a metre (the ramp's 6.7 degrees SSE) */
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4130+SITE.station,recipe:'slab-floodbasalt',range:[SITE.base-600,SITE.slab.crest+200],
 dip:[-.5,-.8660254,SITE.slab.dip],warp:[22,7]});   /* warped: the flows thicken and pinch along the face, not ruled lines */
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x8a7e70}):null;
/* THE SCAR: the fresh collapse's face and its skirt, from KRELIEF.at's fresh (38d); paler, unweathered, bare of lichen (aFr) */
const SCAR_S=SITE.apron.s0;   /* 45: the scar sits on the rim over the apron's axis */
function freshAt(x,z){if(Math.abs(L.toS(x,z)-SCAR_S)>1400)return 0;const a=KRELIEF.at(L.W,x,z);return a&&a.part&&a.part!=='plateau'?clamp(a.fresh*1.4,0,1):0;}
/* the spill's fan: the share of the pit's floor the apron's rubble covers */
const spillAt=(x,z)=>{const sp=L.spill(x,z);return sp<-1e8?0:smooth(-2,4,sp-L.land0(x,z)+3);};
function masksAt(x,z,h,out){const wet=FC.at(FC.a.wet,x,z),rock=FC.at(FC.a.rock,x,z),ap=Math.max(FC.at(FC.a.rim,x,z),spillAt(x,z)),behind=L.toV(x,z)-L.rimV(L.toS(x,z));
 const rub=clamp(ap*1.2,0,1)*(1-smooth(.6,.85,rock)*.5);
 const seep=clamp(smooth(.45,.75,wet)*(1-rub*.6),0,1);
 const lich=clamp(Math.max(smooth(0,120,behind),.6*smooth(.55,.75,fbm(x*.004,z*.004,81,2))*(1-ap))*(1-seep),0,1);
 const step=clamp((1-ap)*(1-smooth(-40,60,behind))*(1-seep)*(1-rock*.8),0,1);
 const fr=freshAt(x,z);marksAt(x,z,h,MKM);const bare=clamp(Math.max(MKM.marl,MKM.trav,MKM.mud,MKM.road),0,1);
 out[0]=rub*(1-fr*.7)*(1-MKM.road);out[1]=step*(1-fr)*(1-bare);out[2]=seep*(1-MKM.trav*.6);out[3]=lich*(1-fr)*(1-bare);return out;}
const MKM={};
// THE PAINT: the macro colour under the layers
const PAINT={base:0x8e8264,dry:0x9e9070,rub:0x5a524c,lich:0x7a7670,seep:0x5e6e42,snow:0xe8ecf2,rock:0x4a4440,
 marl:0xc4bca6,berm:0xd8d0bc,trav:0xe4dccb,sulfur:0xd8c040,mud:0xb0a488,road:0xa89a80};
/* THE SHELF'S MARKS (0..1 each): marl the lake's old bed between the water and the highest strandline, berm on a strandline, trav and sulfur round a
   spring (a dead one keeps its sulfur, its travertine greyed), mud a pond's dry end, oldshore the pale line across it, road the track */
function marksAt(x,z,y,o){o.marl=0;o.berm=0;o.trav=0;o.sulfur=0;o.mud=0;o.old=0;o.road=0;
 const PT=SITE.patera,TL=SITE.tilt,r=L.pr(x,z);
 if(r<PT.r&&y>PT.level-.3&&y<PT.level+8){const s=L.toS(x,z),top=PT.level+L.strandH(TL.strands.length-1,s);o.marl=smooth(top+.6,top-.4,y)*smooth(PT.level-.3,PT.level+.2,y);
  for(let k=0;k<TL.strands.length;k++)o.berm=Math.max(o.berm,Math.exp(-Math.pow((y-PT.level-L.strandH(k,s))/.18,2)));}
 for(const q of L.SPRINGS){const d=Math.hypot(x-q.x,z-q.z);if(d>q.r*5)continue;o.trav=Math.max(o.trav,smooth(q.r*4.5,q.r*1.2,d)*(q.dead?.5:1));
  o.sulfur=Math.max(o.sulfur,smooth(q.r*1.9,q.r*.9,d)*smooth(q.r*.5,q.r*.9,d)*(q.dead?.9:.7));}
 for(const p of L.PONDS){const dx=x-p.x,dz=z-p.z;if(dx*dx+dz*dz>(p.r*1.6)*(p.r*1.6))continue;const w=waterH(x,z);if(w>-1e8&&w>=y-.02)continue;
  const dd=Math.hypot(dx,dz);if(y<p.old+.05&&dd<p.r*1.1){o.mud=Math.max(o.mud,.85);o.old=Math.max(o.old,Math.exp(-Math.pow((y-p.old)/.07,2)));}}
 const rd=L.nearRoad(x,z).d;o.road=smooth(SITE.road.w*.75,SITE.road.w*.35,rd);return o;}
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const MK={},MARL=K(PAINT.marl),BERM=K(PAINT.berm),TRAV=K(PAINT.trav),SULF=K(PAINT.sulfur),MUD=K(PAINT.mud),ROAD=K(PAINT.road);
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),RUB=K(PAINT.rub),LICH=K(PAINT.lich),SEEP=K(PAINT.seep),SNOW=K(PAINT.snow),ROCK=K(PAINT.rock);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.4,.15,wet)*.6+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  c.lerp(RUB,m[0]*.85).lerp(LICH,m[3]*.55).lerp(SEEP,m[2]*.8);
  c.lerp(ROCK,smooth(.55,.8,rock)*.55);
  c.lerp(SNOW,smooth(SITE.snow[0],SITE.snow[1],hh)*smooth(.25,.7,fbm(x/14,y/14,1.7,3))*(1-smooth(.6,.85,rock)*.85));
  marksAt(wx,wz,hh,MK);c.lerp(MARL,MK.marl*.7).lerp(BERM,MK.berm*.65).lerp(MUD,MK.mud*.6).lerp(BERM,MK.old*.8).lerp(TRAV,MK.trav*.85).lerp(SULF,MK.sulfur*.75).lerp(ROAD,MK.road*.8);
  const k=1+n*.1;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;attribute float aFr;varying float vFr;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;vFr=aFr;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;varying float vFr;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.92);':'')+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.42,1.38,1.32)+vec3(0.05,0.045,0.04),vFr);'+   /* the scar: fresh rock, paler and unweathered */
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'slabfields-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.08,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('slabfields','rock.rubble.sturzstrom',{w:'vGL.x',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'the apron\'s rubble'}),
 KGROUND.layer('slabfields','ground.steppe',{w:'vGL.y',amt:.75,gain:1.0,tint:'_gT',name:'the bench\'s steppe'}),
 KGROUND.layer('slabfields','ground.reedbed',{w:'vGL.z',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'the spring line'}),
 KGROUND.layer('slabfields','ground.lichen.crust',{w:'vGL.w',amt:.7,gain:1.0,tint:'vec3(1.0)',name:'lichen crust'}),
 {kind:'clast',w:'gSteep*0.85',amt:.7,proj:'tri',size:1.1,matrix:.12,matrixColor:0x4e4844,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0x4a4440,0x5a524c,0x3e3a36,0x6a5a50,0x7a4a3a],seed:513,name:'talus'}]});
const GROUND=(function(){const N=640,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),fr=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=landH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];fr[k]=freshAt(x,z);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));g.setAttribute('aFr',new THREE.BufferAttribute(fr,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// the places, as records the inspector and the export read; the hazards on them (core/hazard reads the tags; PLAN.md section 11)
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
{const SL=SITE.slab,PT=SITE.patera,c=L.xz(0,L.rimV(0)-SL.run*.5);
 REGISTER({name:'The Leaner\'s cliff (1.25 km of flood basalt; its crest 3,355 m, 1.05 atm)',x:c[0],z:c[1],y:SITE.base-20,r:1400,h:SL.h+200,
  tags:{hazard:{kind:'fall',danger:1,tell:{sign:'the edge: a sheer drop of over a kilometre'}}}});
 /* the rockfall belt: the talus under the face, in 500 m lengths; the swarms bring blocks down at any hour (the quake's crack, then the roar) */
 for(let s=-2500;s<=2500;s+=500){const vf=L.footV(s)-SL.talus.reach*.4,[x,z]=L.xz(s,vf),[x2,z2]=L.xz(s,L.footV(s)-SL.talus.reach),lo=Math.min(landH(x,z),landH(x2,z2));
  if(Math.hypot(x,z)>TERR.R+200)continue;
  REGISTER({name:'Rockfall under the Leaner\'s face (fresh scree; the quake swarms bring blocks down at any hour)',x,z,y:lo-40,r:240,h:460,
   tags:{hazard:{kind:'crush',danger:.65,falloff:'smooth',tell:{sign:'fresh scree, pale scars on the face, the ground shivering a moment before'}}}});}
 /* the tension cracks behind the lip: a fall into each (PLAN.md section 11: the crest's tell of the next collapse) */
 L.CRACKS.forEach(K=>{const [x,z]=L.xz(K.s,L.rimV(K.s)+K.back);if(Math.hypot(x,z)>TERR.R)return;
  REGISTER({name:'An open crack behind the Leaner\'s lip ('+Math.round(K.w)+' m wide, '+Math.round(K.d)+' m deep; it widens with each swarm)',x,z,y:landH(x,z)-K.d-6,r:K.len/2,h:K.d+14,ground:true,
   tags:{hazard:{kind:'fall',danger:.8,falloff:'none',shape:{type:'cyl',r:K.len/2,h:K.d+4},tell:{sign:'a dark line across the ramp, fresh soil fallen in at its lips'}}}});});
 const a0=L.xz(SITE.apron.s0,(L.footV(SITE.apron.s0)+L.rimAtS(SITE.apron.s0))/2);
 REGISTER({name:'The Leaner\'s apron (an old collapse of crushed basalt, spilling over the patera\'s rim)',x:a0[0],z:a0[1],y:SITE.base-10,r:1500,h:SITE.apron.foot+80});
 const pw=L.xz(PT.c[0],L.rimAtS(PT.c[0]));
 REGISTER({name:'The patera\'s wall (a sheer drop of a hundred metres to its bench and shelf)',x:pw[0],z:pw[1],y:PT.shelf-5,r:700,h:130,
  tags:{hazard:{kind:'fall',danger:.9,tell:{sign:'the plain ends at an edge; the lake below'}}}});
 const ps=L.xz(PT.c[0],PT.c[1]+PT.shore+300);
 REGISTER({name:'The patera\'s shelf (the lake\'s old bed: marl, the strandlines it left as it drifted north)',x:ps[0],z:ps[1],y:PT.level-2,r:900,h:16});
 /* the patera's quake swarm: small, frequent, the shelf and the spill (PLAN.md section 11: crush near the cliff, slip on the loess) */
 REGISTER({name:'The Leaner\'s quake swarm (small quakes, days of them; the shelf and the spill shake)',x:ps[0],z:ps[1],y:PT.level-4,r:1600,h:200,
  tags:{hazard:{kind:'slip',danger:.25,falloff:'smooth',tell:{sign:'a shiver underfoot, ripples on a still pond, pebbles trickling on the spill'}}}});
 L.SPRINGS.forEach(q=>{if(q.dead){REGISTER({name:'A dead spring on the shelf (a dry crater ringed with sulfur: the outlet moved down the shore)',x:q.x,z:q.z,y:q.y0-2,r:q.r*2.2,h:5,ground:true});return;}
  REGISTER({name:'A warm spring on the shelf ('+Math.round(q.temp)+' degC; CO2 and H2S: the smell of eggs, sulfur on its rim)',x:q.x,z:q.z,y:q.y0-2,r:q.r*2.4,h:6,ground:true});});
 /* the gas: CO2 and H2S off the springs, pooling in their hollows on still nights (core/hazard 21: shape.pool) */
 L.SPRINGS.filter(q=>!q.dead).slice(0,SITE.gas.springs).forEach(q=>REGISTER({name:'A spring\'s hollow where CO2 and H2S settle on still nights',x:q.x,z:q.z,y:q.y0-2,r:q.r*2.5,h:5,
  tags:{hazard:{kind:'gas',danger:.6,falloff:'none',shape:{type:'cyl',r:q.r*2.5,h:3,pool:1.5},tell:{sign:'the smell of rotten eggs, then none (H2S deadens the nose); dead birds by the pool'}}}}));
 L.PONDS.forEach(p=>REGISTER({name:'A tilted pond on the ramp (its water drifted to the low end; the old shore across its dry floor)',x:p.x,z:p.z,y:p.floor-2,r:p.r*1.2,h:6}));
 REGISTER({name:'The corridor road (Spindle Fan to Ostrukh-on-Water): along the apron\'s toe, down the spill, along the shelf',x:L.RL[L.RL.length*.42|0][0],z:L.RL[L.RL.length*.42|0][1],y:landH(L.RL[L.RL.length*.42|0][0],L.RL[L.RL.length*.42|0][1])-20,r:40,h:40,ground:true});}
