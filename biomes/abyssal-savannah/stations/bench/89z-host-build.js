// ================================================================= HOST — the bench's build
// The order station 1 follows (src/89z-host-build.js): the ground (80), the sky, the air and the water, then the kits, then one bake. What the
// bench's edge changes, page-local (PLAN.md section 8):
//   NOTHING ON THE FACES   every tree pass is gated off the cliffs' and the faults' faces (the slope, from the drawn ground): a tree stands
//                          on a ledge, the talus or a ravine's floor, never on a sheer face (the feedback "No trees on cliffs")
//   THE PLATEAU'S FLORA    ebadlands read in place (47d: EBADLANDS.make / grow, one tree alone): pinyon and juniper on the fault blocks and the
//                          relay ramp, junipers along the cliffs' rim, chaparral yucca on the blocks and thinly on the bench; the savannah's
//                          umbrella trees and stub lycopsids thin out where the plateau's woodland comes in
//   KOPJES, NO CAPROCK     the bench's granite tors go to the kit (their piles, their figs); the cliffs are KRELIEF's scarp, so the kit's
//                          caprock blocks (made for station 1's riser, its talus thrown 30-190 m down a gentle face) are not drawn
// THE WATER AS FIELDS (core/water ext/60; core/biome 41), as station 1. THE SUN'S SHADOWS (core/shadow, KSHADOW): off at load, ?shadow=1 on
const WATER_F=WATER.fields({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&FAR_STILLS.indexOf(q)<0)});
const WATER_FN=WATER.fieldFns(WATER_F);
const WET_SHORE=(x,z)=>smooth(16,1,WATER_FN.shore(x,z));
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),salt:(x,z)=>FIELD.salt(x,z),bands:{upland:[-660,340],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{if(!inMap(x,z))return W0(x,z);const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z),.95*smooth(30,3,s)),0,1);};
 FIELD.flow=(x,z)=>{if(!inMap(x,z))return F0(x,z);const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z),smooth(26,4,d)),0,1);};}
if(GROUND_MESH){const a=GROUND_MESH.geometry.attributes.aWet,p=GROUND_MESH.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;
const IMP_GAIN=2.6;
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
// the cliffs' rim band: 0..1 over the 160 m of bench behind the rim line (junipers lean out over edges)
const rimK=(x,z)=>{const d=x-rimX(z);return smooth(-20,15,d)*smooth(170,40,d);};
// the faces: 0 on ground a tree may stand on, 1 on a sheer face (the drawn ground's slope)
const faceK=(x,z)=>smooth(.62,.95,slopeAt(x,z));
// THE PLATEAU'S FLORA, read in place (ebadlands, biomes/ebadlands/BIOME-API.md: EBADLANDS.SPECIES, make, grow): its passes on ABSAV.cells (each cell
// seeded from core/rand), keep-clear on core/space and off the savannah's trees (ABSAV.blocked); P the plateau's blocks (plateauK, 45)
const BENCH={thin:{0:.82,2:.85},bunchCap:500000,
 bunchWhy:'the bench\'s edge is BSh steppe from the cliffs\' rim to the plateau (station 3, PLAN.md section 15): paired tussocks a 4.5 m cell near, 9 m mid, 18 m far',eb:[
 {sp:0,key:'pinyon',salt:3801,cell:62,pad:3,accept:(Z,x,z,P)=>P*.5*(1-Z.rock)},
 {sp:1,key:'juniper',salt:3802,cell:56,pad:2.5,accept:(Z,x,z,P)=>(P*.42+.32*rimK(x,z)+.02*Z.steppe*(1-P))*(1-.6*Z.rock)},
 {sp:10,key:'yucca',salt:3803,cell:40,pad:1.2,accept:(Z,x,z,P)=>P*.24+.03*Z.steppe*(1-P)}]};
function buildEb(st){if(typeof EBADLANDS==='undefined'||!EBADLANDS.make||!EBADLANDS.grow)return st;
 const L=BIO.radii(),S=KSPACE.create({cell:20}),box=[-TERR.X,-TERR.Z,TERR.X,TERR.Z];ABSAV.EBTREES=[];
 BENCH.eb.forEach(P=>{st[P.key]=0;
  ABSAV.cells(P.salt,P.cell,box,(x,z)=>{const Z=ABSAV.zones(x,z);return P.accept(Z,x,z,plateauK(x,z))*(1-faceK(x,z))*smooth(-20,15,x-rimX(z));   /* the plateau's flora stops at the rim */},(x,y,z)=>{
   if(BIO.depth(x,z)>-.3)return false;if(ABSAV.SHORE){const sh=ABSAV.SHORE(x,z);if(sh===sh&&sh<.65)return false;}
   if(ABSAV.blocked(x,z,P.pad)||!BIO.clearOf(x,z,P.pad+1))return false;
   if(S.some(x,z,P.pad+6,o=>Math.hypot(x-o.x,z-o.z)<o.r+P.pad))return false;
   const d=BIO.lodD(x,z),lv=d<L.hero?2:d<L.mid?1:0;
   const T=EBADLANDS.make(P.sp,x,y,z);T.eb=true;EBADLANDS.grow(T,lv);T.lv=lv;S.insert({x,z,r:T.rb*1.4+1},x,z,T.rb*1.4+1);ABSAV.EBTREES.push(T);st[P.key]++;},   /* its heroes register themselves (its builders' regTree) */
   {patch:.5,patchScale:.006});});
 return st;}
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search);
 if(Q.get('diet')==='0')ABSAV.IMPOSTORS=false;
 if(Q.get('fields')!=='0')ABSAV.SHORE=(x,z)=>inMap(x,z)?WATER_FN.shore(x,z):NaN;
 /* every tree pass off the faces; the savannah's umbrella trees and stubs thinning where the plateau's woodland comes in */
 /* the bunchgrass is the page: the bench and the fault blocks are steppe from the rim to the east edge (BIO.def's cap, declared here) */
 {const D=BIO.kits['abyssal-savannah']&&BIO.kits['abyssal-savannah'].defs.bunch;if(D){D.cap=BENCH.bunchCap;D.capWhy=BENCH.bunchWhy;}}
 ABSAV.PASSES.forEach(P=>{const a0=P.accept,th=P.k!=null&&BENCH.thin[P.k]!=null?BENCH.thin[P.k]:0;P.accept=(Z,x,z)=>a0(Z,x,z)*(1-faceK(x,z))*(1-th*plateauK(x,z));});
 try{window._biome=ABSAV.build({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],quality:1,kopjes:KOPJES,rim:null});}catch(e){reportErr('biome: '+e.stack);}
 try{BIO.cur='ebadlands/trees';window._biome.eb=buildEb({});BIO.cur=null;}catch(e){reportErr('ebadlands: '+e.stack);}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 if(BIO.setA2C)BIO.setA2C(renderer);
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);if(GROUND_MESH)window._shadow.cast(GROUND_MESH,{cast:false});if(FAR_F)FAR_F.mesh.castShadow=FAR_F.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 try{cloudShadeScene();}catch(e){reportErr('cloud shade: '+e.stack);}
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The bench\'s edge (the abyssal savannah, station 3)',x:CENTER[0],z:CENTER[1],r:TERR.X,h:1100});
 {const z=0,x=rimX(z)-200;REGISTER({name:'The cliffs (the rim breaking: 360 m)',kind:'feature',x,z,y:terrainH(x-220,z)-10,r:320,h:420,tags:{biome:'abyssal-savannah',feature:'escarpment'}});}
 REGISTER({name:'The middle ravine',kind:'feature',x:RAV.x-RAV.nx*-200,z:RAV.z,y:terrainH(CH.mouth[0],CH.mouth[1])-6,r:RAV.w*1.6,h:400});
 {const x=1900,z=0;REGISTER({name:'The relay ramp (between the two fault scarps)',kind:'feature',x,z,y:terrainH(x,z)-30,r:420,h:220,tags:{biome:'abyssal-savannah',feature:'relay'}});}
 REGISTER({name:SAG.name,kind:'feature',x:SAG.x,z:SAG.z,y:SAG.level-4,r:SAG.r,h:10});
})();
