// ================================================================= SOUTHERN HIGHLANDS — STATION 3: THE SPIRAL FELLFIELD (plants, items, floor)  [web]
// PLAN-STATIONS.md station 3: "fellfield and glacier: cushion plants that grow as spiral domes, sorted-stone circles laid as spirals by frost (a
// ground pattern, not a plant), coiled lichen rosettes, snail-shell rosettes in the scree, an icefall whose crevasses curve; the Whorl Stone's
// theme carried onto a summit tor." Read after 60 (it is 62), before 70. No tree grows here (the passes are empty); the floor is the station's own:
//   SPIRAL CUSHIONS   domes of a cushion plant whose rosettes are packed in the two crossing spiral families (89 of them, the golden angle), the
//                     library's cushion skin over them (surface.cushion)
//   SNAIL ROSETTES    in the scree: leaves wound up a narrowing cone, a turn every four leaves, so each plant is a snail's shell of leaves
//   COILED LICHENS    the kit's rosette lichen on the stones, the boulders and the fellfield
//   SORTED SPIRALS    stones set on the arms the ground's shader draws (STATION_SORTED, 44s-host-land.js), near the eye
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=SHIGH.C,GOLD=SHIGH.GOLD,{shade,bright,vary,tint}=BIO.col;
const {leafCol,blocked}=SHIGH.TOOLS;
const PAL=SHIGH.PAL;
Object.assign(PAL,{dome:[0x6a8a3a,0x7a9a42,0x8a8a3a,0x5e7e36],domeRed:[0x9a5a3a,0x8a4a34],snail:[0x8aa898,0x9ab4a4,0x7a9a8a],snailRed:[0xb86a5a,0xa85a50],
 fellStone:[0x8a8478,0x7a766e,0x96907e,0x6e6a64]});
SHIGH.KOPPEN=Object.assign({},SHIGH.KOPPEN,{ET:.48,Dfc:.35,EF:.07});
SHIGH.STATION='fellfield';
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('shigh',n):null;
// THE SPIRAL CUSHION: a dome (the upper half of a sphere, radius .5, foot at 0) bossed by 89 rosettes at the golden angle: each vertex lifted by
// the nearest rosette's bump, so the two spiral families (8 and 13, 13 and 21) read across it as on a real cushion
function domeGeo(nu,nv,n){const g=new T3.SphereGeometry(.5,nu,nv,0,TAU,0,Math.PI/2),p=g.attributes.position,uv=g.attributes.uv,R=[];
 for(let k=0;k<n;k++){const t=(k+.5)/n,ph=Math.acos(1-t*.98),th=k*GOLD;R.push([Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)]);}
 for(let i=0;i<p.count;i++){const x=p.getX(i)*2,y=p.getY(i)*2,z=p.getZ(i)*2;let best=0;
  for(const r of R){const d=(x-r[0])*(x-r[0])+(y-r[1])*(y-r[1])+(z-r[2])*(z-r[2]);best=Math.max(best,Math.exp(-d/.012));}
  const k=1+.07*best;p.setXYZ(i,x*.5*k,y*.5*k*.75,z*.5*k);uv.setXY(i,uv.getX(i)*4,uv.getY(i)*2);}
 g.computeVertexNormals();return g;}
const cushionL=LIBP('surface.cushion'),cushionMap=cushionL?KMAT.textures(cushionL,{aniso:4}).map:null;
if(cushionMap)cushionMap.wrapS=cushionMap.wrapT=T3.RepeatWrapping;
const MDOME=BIO.solidMat(cushionMap,0xffffff);
BIO.def('sdome',domeGeo(28,10,89),MDOME,{label:'Spiral cushions'});
BIO.def('sdomelo',domeGeo(12,5,34),MDOME,{label:'Spiral cushions (mid distance)'});
// THE SNAIL ROSETTE: the kit's whorl (50's G.whorl) wound a quarter-turn and a little a leaf, its leaves climbing and closing toward the top:
// a cone of leaves that reads as a snail's shell
BIO.def('snail',SHIGH.G.whorl({uv:1,n:30,div:TAU*.27,len:t=>1-.75*t,wid:t=>.34,wid0:.55,el:t=>mix(.15,1.5,Math.pow(t,.8)),curl:.55,cB:[.6,.7,.62],cM:[.8,.9,.82],cT:[.95,.97,.92]}),SHIGH.MAT.gsilver,{label:'Snail-shell rosettes'});
const PK=(name,c,a,r,kp,spiral,items,notes)=>({name,tags:{climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,spiral,harvest:{wood:'none',edible:[],medicinal:false,notes:notes||'',fruit:null}},items});
Object.assign(SHIGH.PLANTS,{
 dome:PK('Spiral cushion','alpine','subhumid','no',['ET','Dfc'],'whorl',['sdome','sdomelo'],'A dome of thousands of rosettes packed in crossing spirals; a century to grow a metre.'),
 snail:PK('Snail-shell rosette','alpine','subhumid','no',['ET','Dfc'],'shell',['snail'],'Its leaves wind up a narrowing cone and close over the bud at night.'),
});
SHIGH.PASSES=[];   /* above the trees */

function zonesF(x,z){const F=n=>BIO.field(n,x,z),rock=F('rock'),slope=F('slope'),snow=F('snow'),scree=F('scree'),sorted=F('sorted'),ice=F('ice');
 const cliff=smooth(.8,.95,slope)*smooth(.3,.6,rock),live=(1-cliff)*(1-ice),crag=smooth(.35,.65,rock)*live,bed=smooth(.4,.65,snow);
 return{rock,slope,snow,bed,scree:scree*live*(1-crag),sorted:sorted*live,ice,cliff,crag,fell:(1-scree)*(1-crag)*(1-bed)*live};}
SHIGH.zonesF=zonesF;

const {stone,boulder,rosette,around,rockTint}=SHIGH.small;
const Y=(x,z)=>BIO.terrainH(x,z);
const lichen=(x,y,z,s)=>BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),s,leafCol(PAL.lichen,1.1,.02));
function dome(x,y,z,lv,st){const R=rr(.35,1.1),c=rng()<.15?pick(PAL.domeRed):pick(PAL.dome);
 BIO.put(lv===2?'sdome':'sdomelo',[x,Y(x,z)-.06,z],qEuler(0,rr(0,TAU),0),[R*2,R*2*rr(.8,1.1),R*2],bright(vary(C(c),.02,.06,.05),1.1));st.domes++;}
function snail(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.3,.9,(px,pz)=>{const s=rr(.14,.3);BIO.put('snail',[px,Y(px,pz)-.02,pz],qEuler(0,rr(0,TAU),0),[s,s*1.2,s],leafCol(rng()<.2?PAL.snailRed:PAL.snail,1.1,.02,.05,.05));st.snails++;});}
SHIGH.buildFloor=function(R,q){reseed(600347);q=q==null?1:q;R=R==null?2500:R;
 const st={domes:0,snails:0,lichen:0,rosettes:0,stones:0,boulders:0,sorted:0,sortedCells:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6)||BIO.mask(x,z)<=0)return;const W=zonesF(x,z);if(W.cliff>.6||W.ice>.3)return;const t=rng();
  if(W.bed>.6){if(W.snow<.72&&t<.2){rosette(x,y,z,PAL.silver,.8,lv);st.rosettes++;}return;}
  if(W.crag>.5){if(t<.35)stone(x,y,z,lv,st,1.1,false);else if(t<.65){lichen(x,y,z,rr(.3,.7));st.lichen++;}return;}
  if(W.scree>.45){if(t<.35)snail(x,y,z,lv,st);else if(t<.75)stone(x,y,z,lv,st,1.3,false);else if(t<.85){lichen(x,y,z,rr(.2,.4));st.lichen++;}return;}
  if(W.sorted>.5){if(t<.12)dome(x,y,z,lv,st);return;}   /* the treads: the spirals' stones are set below; a cushion between */
  if(t<.3)dome(x,y,z,lv,st);else if(t<.48){lichen(x,y,z,rr(.3,.8));st.lichen++;}else if(t<.6){rosette(x,y,z,PAL.silver,.9,lv);st.rosettes++;}else if(t<.72)stone(x,y,z,lv,st,.9,false);else if(t<.78)snail(x,y,z,lv,st);}
 const L=BIO.LOD(),bands=[[7,L.floor[0],0],[14,L.floor[1],L.floor[0]],[28,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .75*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.5,patchScale:.012,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the tors' boulders, lichened
 BIO.grid(11,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const W=zonesF(x,z);return (W.crag*.5+smooth(.15,.35,W.rock)*(1-W.crag)*.25)*q*(1-W.ice);},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;boulder(x,y,z,lv,st,rr(1.1,2),false);},{patch:.3,pad:1});
 // THE SORTED SPIRALS' STONES (STATION_SORTED): every 8 m cell of the treads near the eye whose centre's `sorted` weight is over .5 gets its
 // arms laid in stones, a stone every ~.3 m from .6 m to 3.6 m out; sizes and turns from KRAND by (cell, stone), never by draw order
 if(typeof STATION_SORTED!=='undefined'){const S=STATION_SORTED,c=S.cell,BX=BIO.originBox(Math.min(150,L.floor[0])),u=(ix,iz,k,j)=>KRAND.unit(KRAND.hash(600391,ix,iz,k*4096+j));
  for(let iz=Math.floor(BX[1]/c);iz<=Math.ceil(BX[3]/c);iz++)for(let ix=Math.floor(BX[0]/c);ix<=Math.ceil(BX[2]/c);ix++){
   const cx=(ix+.5)*c,cz=(iz+.5)*c;if(Math.hypot(cx,cz)>R||BIO.lodD(cx,cz)>=Math.min(150,L.floor[0]))continue;
   if(BIO.field('sorted',cx,cz)<.5||BIO.mask(cx,cz)<=0)continue;
   const ph=S.phase(ix,iz),arms=S.arms(ix,iz);st.sortedCells++;let j=0;
   for(let a=0;a<arms;a++)for(let r=.6;r<=S.rMax;r+=.3,j++){const th=((r/S.pitch-ph)+a)*TAU/arms,x=cx+Math.cos(th)*r,z=cz+Math.sin(th)*r;
    if(BIO.mask(x,z)<=0)continue;const s=(.09+.1*u(ix,iz,1,j))*(1+.4*r/S.rMax);
    BIO.put('stone',[x,Y(x,z)+s*.15,z],qEuler(u(ix,iz,2,j)*.6-.3,u(ix,iz,3,j)*TAU,u(ix,iz,4,j)*.6-.3),[s*(1+.4*u(ix,iz,5,j)),s*.6,s*(1+.4*u(ix,iz,6,j))],rockTint(PAL.fellStone,.55+.2*u(ix,iz,7,j)));st.sorted++;}}}
 return{under:st};};
})();
