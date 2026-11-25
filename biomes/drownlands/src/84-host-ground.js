/* ==================== HOST — ground, KGROUND (4 layers), KSTRATA, KDRAWN & KTAGS/KHAZ (PLAN.md sections 3, 6) ==================== */
/* <= 4 KGROUND library layers per station (keeping total linked shader samplers <= 11, well under the 15-sampler survey gate):
   - shoal   : ground.sand, ground.brucite, ground.serp, ground.laterite
   - bar     : ground.shingle, ground.sponge, ground.sand, ground.laterite
   - drowned : ground.mud, ground.peat, ground.coal, ground.shells
   - skerry  : ground.serp, ground.laterite, ground.gossan, ground.sand
   Registers drawn ground triangles in KDRAWN.add(KDRAWN.grid(...)) for camera/eye clearance checks. */

const GQ=new URLSearchParams(location.search);
const USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 if(SKEY==='drowned'){
  return KSTRATA.create({
   seed:5710,range:[-25,60],
   formations:[{recipe:'drown-coal-measure',base:-25,top:60}],
   dip:[0.85,0.18,0.035],warp:[3.2,1.4]
  });
 }
 if(SKEY==='bar'){
  return KSTRATA.create({
   seed:5711,range:[-45,130],
   formations:[
    {recipe:'drown-serpentinite',base:-45,top:18},
    {recipe:'drown-ophiolite',base:18,top:130}
   ],
   dip:[0.7,0.3,0.025],warp:[4.0,1.6]
  });
 }
 if(SKEY==='skerry'){
  return KSTRATA.create({
   seed:5712,range:[-90,220],
   formations:[
    {recipe:'drown-serpentinite',base:-90,top:48},
    {recipe:'drown-laterite-cuirasse',base:48,top:220}
   ],
   dip:[0.75,0.25,0.02],warp:[3.8,1.5]
  });
 }
 return KSTRATA.create({
  seed:5713,range:[-90,35],
  formations:[
   {recipe:'drown-serpentinite',base:-90,top:8.5},
   {recipe:'drown-laterite-cuirasse',base:8.5,top:35}
  ],
  dip:[0.8,0.2,0.02],warp:[3.0,1.3]
 });
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='drowned'?0x686256:0x364a42}):null;

function masksAt(x,z,h,out){
 if(SKEY==='bar'){
  const sh=L.SHINGLE(x,z),sp=L.SPONGE(x,z)*(1-0.6*sh),lt=L.LATERITE(x,z)*(1-0.5*sh);
  const sd=clamp(1-0.7*sh-0.65*sp-0.7*lt,0.08,1);
  out[0]=sh;out[1]=sp;out[2]=sd;out[3]=lt;
  return out;
 }
 if(SKEY==='drowned'){
  const cl=L.COAL(x,z),pt=L.PEAT(x,z)*(1-0.65*cl),shl=clamp(L.SAND(x,z)+0.4*smooth(2.2,-0.8,Math.abs(h-0.4)),0,1)*(1-0.5*cl);
  const mud=clamp(1-0.7*cl-0.55*pt-0.55*shl,0.12,1);
  out[0]=mud;out[1]=pt;out[2]=cl;out[3]=shl;
  return out;
 }
 if(SKEY==='skerry'){
  const lt=L.LATERITE(x,z),gs=L.GOSSAN(x,z),sd=L.SAND(x,z)*(1-lt);
  const srp=clamp((1-0.85*lt)*(1-0.65*sd),0.08,1);
  out[0]=srp;out[1]=lt*(1-0.55*gs);out[2]=gs;out[3]=sd;
  return out;
 }
 /* Station 1 default: shoal */
 const br=L.BRUCITE(x,z),lt=L.LATERITE(x,z),sd=L.SAND(x,z);
 const srp=clamp((1-0.75*br)*(1-0.7*sd)*(1-0.75*lt),0.10,1);
 out[0]=sd;out[1]=br;out[2]=srp;out[3]=lt;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const C_SAND=K(0x9ab8ae),C_BRUC=K(0xe2eeec),C_SERP=K(0x2d463c),C_LAT=K(0x8c4430);
 const C_SHING=K(0x525c58),C_SPONGE=K(0x9e7c44),C_MUD=K(0x4c5e54),C_PEAT=K(0x363028),C_COAL=K(0x1e1e22),C_SHELL=K(0xc4c6bc),C_GOSS=K(0x743424);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const n=KRAND.fbm(x/28,0.5,y/28,2,701)-0.5,hh=FC.at(FC.a.h,wx,wz);
  masksAt(wx,wz,hh,m);
  if(SKEY==='bar'){
   c.copy(C_SAND).lerp(C_SHING,m[0]*0.85).lerp(C_SPONGE,m[1]*0.78).lerp(C_LAT,m[3]*0.82);
  }else if(SKEY==='drowned'){
   c.copy(C_MUD).lerp(C_PEAT,m[1]*0.78).lerp(C_COAL,m[2]*0.92).lerp(C_SHELL,m[3]*0.74);
  }else if(SKEY==='skerry'){
   c.copy(C_SERP).lerp(C_LAT,m[1]*0.86).lerp(C_GOSS,m[2]*0.84).lerp(C_SAND,m[3]*0.78);
  }else{
   c.copy(C_SERP).lerp(C_SAND,m[0]*0.84).lerp(C_BRUC,m[1]*0.90).lerp(C_LAT,m[3]*0.80);
  }
  const k=1+n*0.08;
  d[i]=clamp(c.r*255*k,0,255);
  d[i+1]=clamp(c.g*255*k,0,255);
  d[i+2]=clamp(c.b*255*k,0,255);
  d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdce0dc,roughness:0.90,metalness:0})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdce0dc});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.24,0.58,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.38;'
   +(USE_KG?'\n/*KGROUND*/\n':'')
   +(STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.86);':'')
   +'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.64,0.66,0.62),vWet);}');
};

if(USE_KG){
 const layers=SKEY==='bar'?[
  KGROUND.layer('drownlands','ground.shingle',{w:'vGL.x',amt:0.90,gain:1.0,tint:'vec3(1.0)',name:'imbricated serpentinite and nephrite cobble chevron'}),
  KGROUND.layer('drownlands','ground.sponge',{w:'vGL.y',amt:0.88,gain:1.0,tint:'_gT',name:'intertidal ochre-turquoise sponge-coral pavement'}),
  KGROUND.layer('drownlands','ground.sand',{w:'vGL.z',amt:0.86,gain:1.0,tint:'_gT',name:'olivine-carbonate swash sand'}),
  KGROUND.layer('drownlands','ground.laterite',{w:'vGL.w',amt:0.88,gain:1.0,tint:'vec3(1.0)',name:'leeward nickel-laterite phytomining bench'})
 ]:SKEY==='drowned'?[
  KGROUND.layer('drownlands','ground.mud',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',name:'subsided lagoon seagrass silt'}),
  KGROUND.layer('drownlands','ground.peat',{w:'vGL.y',amt:0.86,gain:1.0,tint:'vec3(1.0)',name:'drowned valley forest peat floor'}),
  KGROUND.layer('drownlands','ground.coal',{w:'vGL.z',amt:0.92,gain:1.0,tint:'vec3(1.0)',name:'jet-black coal = 214 bituminous seam bench'}),
  KGROUND.layer('drownlands','ground.shells',{w:'vGL.w',amt:0.86,gain:1.05,tint:'vec3(1.0)',name:'visor-oyster shell bank and detachment spit'})
 ]:SKEY==='skerry'?[
  KGROUND.layer('drownlands','ground.serp',{w:'vGL.x',amt:0.90,gain:1.0,tint:'_gT',name:'wave-scoured < +48 m green serpentinite scarp'}),
  KGROUND.layer('drownlands','ground.laterite',{w:'vGL.y',amt:0.88,gain:1.0,tint:'vec3(1.0)',name:'un-swept >= +48 m brick-red nickel-laterite crown'}),
  KGROUND.layer('drownlands','ground.gossan',{w:'vGL.z',amt:0.88,gain:1.0,tint:'vec3(1.0)',name:'summit iron-cuirasse cap (>= +72 m)'}),
  KGROUND.layer('drownlands','ground.sand',{w:'vGL.w',amt:0.86,gain:1.0,tint:'_gT',name:'sheltered cove carbonate sand'})
 ]:[
  KGROUND.layer('drownlands','ground.sand',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',name:'sunlit turquoise carbonate-olivine shoal sand'}),
  KGROUND.layer('drownlands','ground.brucite',{w:'vGL.y',amt:0.92,gain:1.05,tint:'vec3(1.0)',name:'chalk-white brucite-aragonite sinter apron (pH 11.4)'}),
  KGROUND.layer('drownlands','ground.serp',{w:'vGL.z',amt:0.90,gain:1.0,tint:'_gT',name:'slickensided dark-green serpentinite skerry pavement'}),
  KGROUND.layer('drownlands','ground.laterite',{w:'vGL.w',amt:0.86,gain:1.0,tint:'vec3(1.0)',name:'high skerry rust-red nickel-laterite pocket'})
 ];
 KGROUND.hook(MAT_GROUND,{key:'drown-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:0.06,cavity:0.72,mesh:1}:null,layers});
}

const GROUND=(function(){
 const N=256,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),hGrid=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);
  hGrid[k]=y;
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
  uv[k*2]=x/S+0.5;uv[k*2+1]=0.5-z/S;
  masksAt(x,z,y,m4);
  gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
 }
 const idx=new Uint32Array(N*N*6);
 let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const a=j*nx+i,b=a+nx,c=b+1,d=a+1;
  idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
 g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;
 m.userData.probeSkip=true;
 m.userData.inspectLabel=SITE.name;
 scene.add(m);
 if(typeof KDRAWN!=='undefined'&&KDRAWN.add){
  KDRAWN.add(KDRAWN.grid({x0:-S/2,z0:-S/2,dx:cs,dz:cs,nx:N,nz:N,h:hGrid}));
 }
 return m;
})();

/* ==================== registered KTAGS places, reserves, resources & KHAZ hazards ==================== */
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-30,r:320,h:140,ground:true});

if(SITE.reserves){
 SITE.reserves.forEach(rv=>{
  REGISTER({
   cls:'landmark',kind:'reserve',key:rv.id,
   name:rv.name,
   x:rv.x,z:rv.z,y:terrainH(rv.x,rv.z)-4,r:rv.r,h:45,ground:true,
   tags:{landmark:true,role:'settlement-reserve',destination:rv.id}
  });
 });
}

/* Data-driven KHAZ hazard volumes (PLAN.md section 6.2) */
if(typeof KHAZ!=='undefined'){
 const regHaz=(key,name,x,z,r,h,spec,extraTags)=>{
  const hz=KHAZ.make(spec);
  REGISTER({
   name:name,key:key,kind:'hazard',
   x:x,z:z,y:terrainH(x,z)-3,r:r,h:h,ground:true,
   tags:Object.assign({hazard:hz},extraTags||{})
  });
 };

 /* Over-wash tsunami bore hazard across < trimElevM archipelago benches (Stations 1-4) */
 regHaz('drownlands:bore','Drownlands Megatsunami Bore Over-Wash Zone (< +'+TRIM_ELEV.toFixed(0)+' m)',0,0,260,TRIM_ELEV,
  {kind:'drown',effect:'drown',danger:0.84,dose:0.42,falloff:'linear'});

 if(SKEY==='shoal'){
  SITE.brucitePools.forEach(bp=>{
   regHaz('drownlands:alkalipool:'+bp.key,bp.name,bp.x,bp.z,bp.r*1.15,4,
    {kind:'acid',effect:'corrode',danger:0.65,dose:0.30,falloff:'smooth'},
    {role:'gather:alkali-sinter'});
  });
  regHaz('drownlands:tidalrace',SITE.tidalChute.name,45,48,48,8,
   {kind:'drown',effect:'drown',danger:0.56,dose:0.24,falloff:'smooth'});
 }else if(SKEY==='drowned'){
  regHaz('drownlands:snagreef','Submerged Silicified Snag and Oyster Reef Hazard',-15,10,165,6,
   {kind:'crush',effect:'bleed',danger:0.62,dose:0.28,falloff:'linear'});
  regHaz('drownlands:tidalrace',SITE.detachmentGut.name,158,35,44,8,
   {kind:'drown',effect:'drown',danger:0.54,dose:0.22,falloff:'smooth'});
 }else if(SKEY==='skerry'){
  regHaz('drownlands:tidalrace',SITE.leeChannel.name,-285,-15,52,12,
   {kind:'drown',effect:'drown',danger:0.58,dose:0.25,falloff:'smooth'});
 }
}
