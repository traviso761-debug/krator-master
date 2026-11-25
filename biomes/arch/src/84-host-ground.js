// ================================================================= HOST — the ground (PLAN.md section 6)
// One ground mesh painted from the chemistry and the heat (45: L.APRON, L.ACIDG; 48: HEAT_AT), on KGROUND (43-core-ground.js) with four library layers,
// each on its documented mask, and every steep face in the band's own rock (KSTRATA: two of core's recipes, `arch-serpentinite` under
// `arch-laterite`). Started from biomes/highrift's ground.
//   aGL.x  TRAVERTINE  ground.travertine.white: the springs' aprons, the terraces' ridges, the pool's rim, the alkaline bank (pH over 9.5)
//   aGL.y  ACID        ground.travertine.acid: the acid stream's banks, the solfatara's bleached ground, the right bank and the mixed water's
//   aGL.z  LATERITE    ground.redsoil: the red earth over the serpentinite everywhere else (the maquis's floor)
//   aGL.w  SULPHUR     ground.sulphur: the solfatara's core (KTHERM over ~55 degC)
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
/* KGROUND's relief (core/terrain/GROUND.md): the bump from the layers' height and the ground mesh's hollows (KGROUND.cavityMesh); ?kgrelief=0 */
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
/* THE BAND'S ROCK (PLAN.md section 6): serpentinite (green-black, white veins, buff peridotite rind, dunite) under the laterite (red, mottled, a green
   garnierite seam at its base, an iron crust): core's recipes `arch-serpentinite` and `arch-laterite` (core/terrain/35-core-strata.js) */
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create(SKEY==='cove'?{
 seed:4306,range:[-120,320],
 formations:[
  {recipe:'drown-ophiolite',base:-120,top:7.5},
  {recipe:'arch-rift-basalt',base:7.5,top:108},
  {recipe:'arch-serpentinite',base:108,top:132},
  {recipe:'arch-laterite',base:132,top:320}
 ],
 faults:[{a:L.XZ(-1200,0),b:L.XZ(2200,0),'throw':18,w:45}],
 dip:[L.VX[0],L.VX[1],.016],warp:[5,1.8]}:{seed:4300,range:[SITE.base-400,SITE.base+600],
 formations:[{recipe:'arch-serpentinite',base:SITE.base-400,top:SITE.base-12},{recipe:'arch-laterite',base:SITE.base-12,top:SITE.base+600}],dip:[.7,.7,.02],warp:[6,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='cove'?0x6e4e38:0x8a5a3a}):null;
function setStones(){}
const MIRROR_AT=(x,z)=>SKEY==='cove'?L.APRON(x,z)*.92:0;
function masksAt(x,z,h,out){if(SKEY==='coast'){const rock=FC.at(FC.a.rock,x,z),sa=L.SAND(x,z),pl=L.PLAT(x,z),tu=L.TUFF(x,z)*(1-sa)*(1-pl);let warm=0;for(const v of L.WARM)warm=Math.max(warm,smooth(v.r*1.5,v.r*.4,Math.hypot(x-v.x,z-v.z)));
  out[0]=sa*(1-pl);out[1]=pl;out[2]=clamp(tu*(1-.5*rock),0,1);out[3]=clamp(Math.max(tu*rock,warm),0,1);return out;}
 if(SKEY==='sound'){const lv=L.LAVA(x,z)!=null?1:0,sh=(1-lv)*smooth(2.2,.6,h),rock=FC.at(FC.a.rock,x,z);
  out[0]=lv;out[1]=sh;out[2]=clamp((1-lv)*(1-sh)*(1-.6*rock),0,1);out[3]=lv*.35*smooth(.45,.6,fbm(x*.02,z*.02,7.7,2));return out;}
 if(SKEY==='cove'){const rock=FC.at(FC.a.rock,x,z),ap=L.APRON(x,z),wb=L.WEST_BASALT(x,z),it=L.INTERTIDAL(x,z);
  const trav=clamp(ap,0,1),pil=clamp((1-trav)*Math.max(smooth(14,-6,h),wb*(.45+.45*rock)),0,1);
  const lat=clamp((1-trav)*(1-wb)*smooth(104,138,h)*(1-.65*rock),0,1);
  const barn=clamp((1-trav)*it*smooth(-2.5,1.2,h)*smooth(6.8,4.2,h)*(.55+.45*smooth(.35,.65,fbm(x*.03,z*.03,8.3,2))),0,1);
  out[0]=trav;out[1]=pil;out[2]=lat;out[3]=barn;return out;}
 const T=HEAT_AT(x,z),rock=FC.at(FC.a.rock,x,z),ap=L.APRON?L.APRON(x,z):0,ac=L.ACIDG?L.ACIDG(x,z):0;
 const trav=clamp(ap*(1-.5*rock),0,1),acid=clamp(ac*(1-trav)*(1-.4*rock),0,1),sul=clamp(smooth(50,70,T)*(1-trav),0,1);
 out[0]=trav;out[1]=Math.max(acid,sul*.5);out[2]=clamp((1-trav)*(1-acid)*(1-sul)*(1-.7*rock),0,1);out[3]=sul;return out;}
// THE PAINT: the macro colour under the layers: red laterite and the maquis's dark green over it, the serpentinite's green-black on the steeps
const PAINT={base:0x9a4a2a,dry:0xa85a34};
const TEX_GROUND=BIO.canvasTex(SKEY==='cove'?1024:1536,SKEY==='cove'?1024:1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),SCRUB=K(0x3e5232),TRAV=K(0xe8ece6),ACID=K(0xc8843a),SUL=K(0xd8cc58),ROCK=K(0x2e3a30);
 const BASALT=K(0x2d3238),WFOREST=K(0x2e4a2e),SERP=K(0x283e33),KELP=K(0x384624),CORAL=K(0xc8aeb2),BARN=K(0xd4d2c8),SPLASH=K(0x1b1e22);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.5,.25,wet)*.5+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  c.lerp(SCRUB,m[2]*(.35+.4*smooth(.35,.65,fbm(x/9,y/9,1.3,2))));   /* the maquis's patchy dark green over the red */
  c.lerp(ROCK,smooth(.3,.65,rock)*.7);
  if(L.RIM){c.lerp(K(0xc87a48),L.FLOOR(wx,wz)*.55);c.lerp(K(0x6a8a5a),L.RIM(wx,wz)*.5*smooth(.35,.65,fbm(x/11,y/11,2.7,2)));}   /* the lavaka: mottled floors, garnierite green on the walls */
  if(L.SHEAR)c.lerp(K(0x8a9a6a),L.SHEAR(wx,wz)*.55*smooth(.3,.7,fbm(x/7,y/7,4.1,2)));   /* the shear zone: scaly green rock with pale chrysotile */
  if(SKEY==='coast'){c.lerp(K(0x2a2a2c),m[0]*.9);c.lerp(K(0x343230),m[1]*.9);c.lerp(K(0xa08a62),m[2]*.8);c.lerp(K(0xb07a3a),m[3]*.7);}
  else if(SKEY==='sound'){c.lerp(K(0x2a2826),m[0]*.92);c.lerp(K(0x3a3632),m[1]*.8);c.lerp(K(0xd8dcd4),m[3]*.8);}
  else if(SKEY==='cove'){
   const wb=L.WEST_BASALT(wx,wz),it=L.INTERTIDAL(wx,wz);
   if(wb){c.copy(BASALT).lerp(WFOREST,(1-smooth(.38,.72,rock))*smooth(7.5,14,hh)*(.55+.35*smooth(.3,.7,fbm(x/10,y/10,3.1,2))));}
   else{const serp=smooth(78,108,hh)*smooth(142,118,hh);c.lerp(SERP,serp*.72);c.lerp(BASALT,smooth(112,72,hh)*(1-m[2])*.78);}
   if(hh<7.2&&L.S_OF(wx,wz)<1075){c.lerp(BASALT,smooth(7.5,-2,hh)*.85);
    if(it){c.lerp(KELP,smooth(-1.5,-5.5,hh)*.75);c.lerp(CORAL,smooth(-2.4,-.4,hh)*smooth(1.6,.2,hh)*.72);
     c.lerp(BARN,smooth(1.0,2.2,hh)*smooth(5.0,3.6,hh)*.74);c.lerp(SPLASH,smooth(4.4,5.6,hh)*smooth(7.4,6.4,hh)*.82);}}
   c.lerp(TRAV,m[0]*.94);}
  else{c.lerp(TRAV,m[0]*.9);c.lerp(ACID,m[1]*.75);c.lerp(SUL,m[3]*.7);}
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const COVE_GND_U=SKEY==='cove'?{uTideLv:{value:0},uTideWetTop:{value:.55}}:null;
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};if(COVE_GND_U)Object.assign(sh.uniforms,COVE_GND_U);
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aMir;varying float vMir;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vMir=aMir;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;'+(COVE_GND_U?'uniform float uTideLv;uniform float uTideWetTop;':'')+'varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vMir;varying float vWet;float gSteep;float gTideWet;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?(SKEY==='cove'?'float _stW=gSteep*(1.0-vMir)*0.9;if(_stW>0.01)diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),_stW);':'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*(1.0-vMir)*0.9);'):'')+
  (COVE_GND_U?'gTideWet=vGWP.y<7.8?max(vWet*0.42,smoothstep(uTideWetTop+1.1,uTideLv-0.25,vGWP.y)*0.95):vWet;diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.55,0.52),clamp(gTideWet,0.0,1.0));':'gTideWet=vWet;diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);')+'}');
 if(COVE_GND_U&&USE_KG)sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,clamp(gTideWet,0.0,1.0)*0.82);');};
if(USE_KG){const KG_LAYERS=SKEY==='coast'?[
 KGROUND.layer('arch','ground.sand.black',{w:'vGL.x',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'black sand'}),
 KGROUND.layer('arch','rock.basalt.vesicular',{w:'vGL.y',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'pillow lava (stand-in: rock.basalt.pillow is owed)'}),
 KGROUND.layer('arch','rock.tuff',{w:'vGL.z',amt:.8,gain:1.0,tint:'vec3(1.0)',name:'the tuff cone'}),
 KGROUND.layer('arch','rock.palagonite',{w:'vGL.w',amt:.8,gain:1.0,tint:'vec3(1.0)',name:'palagonite (stand-in for rock.hyaloclastite, owed); the warm ground'})]:SKEY==='sound'?[
 KGROUND.layer('arch','ground.lava.aa',{w:'vGL.x',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'the last flow (61 years)'}),
 KGROUND.layer('arch','ground.sand.black',{w:'vGL.y',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'black sand and tidal mud'}),
 KGROUND.layer('arch','ground.redsoil',{w:'vGL.z',amt:.75,gain:1.0,tint:'_gT',name:'laterite (washed down from the horsts)'}),
 KGROUND.layer('arch','ground.lichen.crust',{w:'vGL.w',amt:.8,gain:1.0,tint:'vec3(1.0)',name:'Stereocaulon lichen on the flow'})]:SKEY==='cove'?[
 KGROUND.layer('arch','ground.travertine.white',{w:'vGL.x',amt:.94,gain:1.06,tint:'vec3(1.0)',name:'travertine and brucite-carbonate curtains (Type II pH > 11 seeps)'}),
 KGROUND.layer('arch','rock.basalt.vesicular',{w:'vGL.y',amt:.84,gain:1.0,tint:'_gT',name:'pillow basalt intertidal ledges and western basalt headland'}),
 KGROUND.layer('arch','ground.redsoil',{w:'vGL.z',amt:.76,gain:1.0,tint:'_gT',name:'eastern nickel-laterite maquis plateau'}),
 KGROUND.layer('arch','ground.lichen.crust',{w:'vGL.w',amt:.82,gain:1.0,tint:'vec3(1.0)',name:'macrotidal barnacle and coralline encrustation'})]:[
 KGROUND.layer('arch','ground.travertine.white',{w:'vGL.x',amt:.9,gain:1.05,tint:'vec3(1.0)',name:'travertine (the alkaline aprons)'}),
 KGROUND.layer('arch','ground.travertine.acid',{w:'vGL.y',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'acid crust'}),
 KGROUND.layer('arch','ground.redsoil',{w:'vGL.z',amt:.75,gain:1.0,tint:'_gT',name:'laterite (red earth)'}),
 KGROUND.layer('arch','ground.sulphur',{w:'vGL.w',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'sulphur'})];
 KGROUND.hook(MAT_GROUND,{key:'arch-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:KG_LAYERS});
 MAT_GROUND.uniforms={};KG_LAYERS.forEach((l,i)=>{if(l&&l.map)MAT_GROUND.uniforms['uKG'+i]={value:l.map};});}
const GROUND=(function(){const N=SKEY==='cove'?512:560,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),mir=new Float32Array(nx*nx),ghArr=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;ghArr[k]=y;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];mir[k]=MIRROR_AT(x,z);}
 if(typeof KDRAWN!=='undefined'){KDRAWN.clear();KDRAWN.add(KDRAWN.grid({x0:-S/2,z0:-S/2,dx:cs,dz:cs,nx:N,nz:N,h:ghArr}));}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aMir',new THREE.BufferAttribute(mir,1));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// the places, as records the inspector and the export read
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
if(SKEY==='confluence'){const S=SITE;
 REGISTER({name:'The dome\'s foot (serpentinite, a core complex: bare mantle under red laterite)',x:-1300,z:-1300,y:terrainH(-1300,-1300)-30,r:900,h:200});
 REGISTER({name:'The graben\'s edge fault (30 m: serpentinite under laterite)',x:1300*S2+600,z:1300*S2-600,y:terrainH(1500,1100)-10,r:500,h:60});
 S.springs.forEach((sp,i)=>REGISTER({name:'Type II spring '+(i+1)+' (Ca-OH, pH ~11.5, hydrogen; '+sp.flow+' L/s)',x:sp.x,z:sp.z,y:terrainH(sp.x,sp.z)-4,r:sp.r+4,h:10}));
 REGISTER({name:'The alkaline pool (milky turquoise, pH ~11) and its white rim',x:S.pool.x,z:S.pool.z,y:L.POOL_LV-4,r:S.pool.r+14,h:8});
 L.TER.forEach((T,i)=>REGISTER({name:'Travertine terraces from spring '+(i+1)+' ('+T.levels.length+' treads)',x:(T.F.A[0]+T.F.B[0])/2,z:(T.F.A[1]+T.F.B[1])/2,y:T.levels[T.levels.length-1]-5,r:T.F.L/2,h:T.levels[0]-T.levels[T.levels.length-1]+12}));
REGISTER({name:'The meet: alkaline (pH '+L.MEET.alk.pH.toFixed(1)+') against acid (pH '+L.MEET.acid.pH.toFixed(1)+'): '+ARCH.gradient(L.MEET.alk.pH,L.MEET.acid.pH,30).toFixed(0)+' mV',x:S.meet.x,z:S.meet.z,y:terrainH(S.meet.x,S.meet.z)-4,r:40,h:12});}
if(SKEY==='dome'){const S=SITE;
 REGISTER({name:'The dome (a core complex: mantle pulled up along a detachment, corrugated along the opening direction)',x:0,z:0,y:terrainH(0,0)-60,r:1500,h:200});
 S.springs.forEach((sp,i)=>REGISTER({name:'Type II spring '+(i+1)+' at a trough\'s head (Ca-OH, pH ~11.5, hydrogen; '+sp.flow+' L/s)',x:sp.x,z:sp.z,y:terrainH(sp.x,sp.z)-4,r:sp.r+14,h:10}));
 L.TER.forEach((T,i)=>REGISTER({name:'Travertine terraces down trough '+(i+1)+' ('+T.levels.length+' treads)',x:(T.F.A[0]+T.F.B[0])/2,z:(T.F.A[1]+T.F.B[1])/2,y:T.levels[T.levels.length-1]-5,r:T.F.L/2,h:T.levels[0]-T.levels[T.levels.length-1]+12}));}
if(SKEY==='barrens')L.LV.forEach((k,i)=>REGISTER({name:'A lavaka (the laterite slumped away to its mottled zone and the green garnierite: the richest nickel)',x:k.x+k.dir[0]*k.len*.3,z:k.z+k.dir[1]*k.len*.3,y:terrainH(k.x,k.z)-5,r:k.r+k.len*.3,h:k.depth+30}));
if(SKEY==='sound'){const S=SITE;
 REGISTER({name:'The last flow (segment 9\'s episode, '+L.AGE.toFixed(0)+' years before game start; '+L.EP.opening.toFixed(1)+' m of opening)',x:0,z:0,y:-10,r:1800,h:40});
 {const a=L.XZ(S.fissure.al[0],S.fissure.w),b=L.XZ(S.fissure.al[1],S.fissure.w);REGISTER({name:'The eruptive fissure and its spatter ramparts (rifting episodes every ~'+L.EP.recur.toFixed(0)+' years)',x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:-12,r:Math.hypot(b[0]-a[0],b[1]-a[1])/2,h:30,tags:{hazard:{kind:'fall',danger:.6}}});}
 L.CONES.forEach(c=>REGISTER({name:'A rootless cone (the lava boiled the wet flats under it)',x:c.x,z:c.z,y:terrainH(c.x,c.z)-c.h-4,r:c.r*2.4,h:c.h*2+8}));
 L.GJ.forEach(g=>{const m=g.F.p(g.F.L/2,0);REGISTER({name:'A gja (an open fissure: clear water filtered through the rock, '+g.wd+' m wide)',x:m[0],z:m[1],y:-14,r:g.F.L/2,h:24,tags:{hazard:{kind:'drown',danger:.6}}});});
 REGISTER({name:'A gas hollow (CO2 pools here in still air: Dieng, 1979) and its rim',x:L.HP[0],z:L.HP[1],y:terrainH(L.HP[0],L.HP[1])-2,r:S.hollow.r*2,h:S.hollow.depth+8,tags:{hazard:{kind:'gas',danger:.85}}});
 L.STACKS.forEach((k,i)=>REGISTER({name:'One of the White Stacks (a brucite and carbonate chimney: alkaline water meeting the sea)',x:k.x,z:k.z,y:terrainH(k.x,k.z)-1,r:k.r*1.6,h:k.h-terrainH(k.x,k.z)+4}));}
if(SKEY==='coast'){const S=SITE;
 REGISTER({name:'A tuff cone (a satellite of the island\'s caldera: phreatomagmatic ash, palagonitised)',x:L.CP[0],z:L.CP[1],y:terrainH(L.CP[0],L.CP[1])-10,r:S.cone.r*1.2,h:S.cone.rim+40});
 {const P=S.platform,m=L.XZ((P.al[0]+P.al[1])/2,(P.w[0]+P.w[1])/2);REGISTER({name:'A platform of old pillow lava at the tide line, with tide pools',x:m[0],z:m[1],y:-3,r:(P.al[1]-P.al[0])/2,h:6});}
 {const m=L.XZ(0,-200);REGISTER({name:'The black sand beach (the seamounts\' tephra)',x:m[0],z:m[1],y:-2,r:900,h:10});}
 {const m=L.XZ(0,S.steam.w);REGISTER({name:'The Surtseyan caldera\'s steam and discoloured water (the vent 3 km offshore, its rim 18 m under the sea: base surges, tsunamis)',x:m[0],z:m[1],y:-2,r:520,h:60,tags:{hazard:{kind:'heat',danger:.9}}});}}
if(SKEY==='cove'){const S=SITE,pw=L.PROW,py=terrainH(pw.x,pw.z);
 REGISTER({cls:'landmark',kind:'site',key:pw.id,name:'Arcoforte cliff-prow bastion site (eastern ophiolite spur overlooking sill and sanctuary basin)',
  x:pw.x,y:py,z:pw.z,r:pw.r,h:48,ground:true,tags:{landmark:true,role:'settlement-reserve',destination:'fleetborn-cove'}});
 {const p=L.XZ(120,L.centerA(120));REGISTER({name:'The inner sanctuary basin (-45 to -59 m calm drowned-gjar fjord)',x:p[0],z:p[1],y:-62,r:420,h:70,ground:true});}
 {const p=L.XZ(S.sill.s,L.centerA(S.sill.s));REGISTER({name:'The NNW pillow-lava and serpentinite sill (-9 to -14 m shoal; 4-6 m/s tidal race)',x:p[0],z:p[1],y:-18,r:240,h:28,ground:true,tags:{hazard:{kind:'drown',danger:.65}}});}
 {const p=L.XZ(120,L.centerA(120)+L.hwE(120)+260);REGISTER({name:'The eastern ophiolite gorge wall (pillow basalt, sheeted dykes, serpentinite bench, +246 m nickel-laterite rim)',x:p[0],z:p[1],y:-8,r:680,h:270});}
 {const p=L.XZ(-160,L.centerA(-160)-L.hwW(-160)-340);REGISTER({name:'The western basalt and gabbro headland (+48..+156 m coastal spine and NNW sea cliffs)',x:p[0],z:p[1],y:0,r:640,h:175});}
 {const p=L.XZ(1480,L.centerA(1480));REGISTER({name:'The southern gjar fissure neck (+7..+22 m tectonic rift saddle and seep stream)',x:p[0],z:p[1],y:4,r:420,h:90,ground:true});}
 L.WEEPS.forEach((w,i)=>{const m=w.F.p(w.F.L*.5,0);REGISTER({name:'Travertine and brucite-carbonate cliff curtain '+(i+1)+' (Type II Ca-OH seep, pH '+w.chem.pH.toFixed(1)+')',x:m[0],z:m[1],y:-3,r:w.F.L*.55+14,h:terrainH(w.x,w.z)+12});});
 L.STACKS.forEach((k,i)=>REGISTER({name:'Brucite-carbonate White Stack '+(i+1)+' (Lost-City alkaline seep chimney on shallow fault ledge)',x:k.x,z:k.z,y:k.bedY-1.5,r:k.r*2.4+2,h:k.h-k.bedY+4}));}
