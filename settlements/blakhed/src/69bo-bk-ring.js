// ================================================================= BLAKHED — the steadings, the Stairhead and the hamlet network on core/hamlet (records)
// [G data] PLAN.md sections 0, 3.2 and 3.2a (step B4's first pass). Every village is core/hamlet's (KHAMLET.village) on the Fellgang
// row, extended here (BK_ROW) with the works its own row lacks, from the Tungang kit's keys: farming (barns, smokehouses, pens),
// ranch (pens, barns), quarry (the slate sledges' sheds, a store) and the Stairhead's own focus `stair` (rope houses, a store, the
// sledge sheds where loads are broken down). KHAMLET.village takes a row as well as a row's name, so no other world's villages move
// (Kirstabal's fishingRow is the same move).
//   the steadings     four of ~150 on the river within 10 km, two above the town and two below (part of the 5,000: drawn)
//   the Stairhead     ~150 at the falls' lip, 24 km down the river, on the right bank (the stair road's side): the Stairmen's
//                     hamlet; Dalab's toll post beside the stair's head (the Dalab set: the watch tower, the toll store, the
//                     genepriest's house, the toll-men's compound); the gin wheels at the edge; the stair's first switchbacks
//   the hamlets       twelve of ~150, 13-24 km out (PLAN.md 3.2a): records for the open world; those inside the page's country drawn
//   BK_RING.make({dims, world}) -> {steadings, stairhead, hamlets, toll, hoists, stair, row}
var BK_RING=(function(){
 const G=BK_GROUND,R=G.river,D0=(x,d)=>x==null?d:x;
 const fg=()=>KHAMLET.CULTURES.fellgang;
 /* the Fellgang row from core/hamlet/fellgang/22-hamlet-fellgang.js, adding dugout ice-houses on Blakhed's bench ice ponds */
 const ROW=()=>{const X=fg();return Object.assign({},X,{
  works:Object.assign({},X.works,{
   ice:[{key:'fg-icehouse',jobs:6,share:.55},{key:'fg-dugout-icehouse',jobs:5,share:.25},{key:'fg-sledgeshed',jobs:4,share:.2}]})});};
 const STEADINGS=[['bk.stead.upriver','Upbeck (the upper steading)',-4300,300,'farming'],['bk.stead.millrace','Millrace',-2300,260,'farming'],
  ['bk.stead.lowbeck','Lowbeck',3200,320,'ranch'],['bk.stead.benchend','Benchend',5600,280,'farming']];
 const HAMLETS=[['bk.h.highgarth','Highgarth',439,1392,'farming'],['bk.h.beckfoot','Beckfoot',443,1393,'farming'],['bk.h.pondhead','Pondhead',451,1397,'ice'],
  ['bk.h.fallsfield','Fallsfield',450,1398,'farming'],['bk.h.cragfold','Cragfold',449,1404,'ranch'],['bk.h.hayfell','Hayfell',445,1411,'ranch'],
  ['bk.h.slatebank','Slatebank',443,1409,'quarry'],['bk.h.highbyre','Highbyre',438,1406,'ranch'],['bk.h.peatmoss','Peatmoss',434,1403,'farming'],
  ['bk.h.coldwater','Coldwater',430,1398,'ice'],['bk.h.drovers-rest','Drovers\' Rest',432,1392,'ranch'],['bk.h.tarnside','Tarnside',434,1391,'farming']];
 const okOn=h=>(x,z)=>{const e=6,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);if(gx*gx+gz*gz>=.2*.2)return false;const n=R.near(x,z);return!n||n.d>n.w/2+25;};
 /* the country the page draws (90b: the country mesh) */
 const C=G.grids.country,inCountry=(x,z)=>x>C.x0+200&&x<C.x1-200&&z>C.z0+200&&z<C.z1-200;
 function village(id,name,focus,site,link,people,o,extra){
  const V=KHAMLET.village(Object.assign({id,world:o.world,culture:ROW(),focus,site,link,popMax:Math.min(people,KHAMLET.POP_MAX),dims:o.dims,ground:{ok:okOn(G.h)}},extra||{}));
  return Object.assign({id,name,focus,people,px:G.toPx(site.x,site.z).map(v=>+v.toFixed(2))},V,{records:(V.records||[]).map(r=>Object.assign({},r,{y:G.h(r.x,r.z)}))});}
 /* the edge of the falls' face: from the Stairhead downstream along the right bank, the first point where the ground falls 8 m in
    40 m toward the river's foot */
 function make(o){o=o||{};o.world=o.world==null?44160:o.world;const out={row:ROW()};
  out.steadings=STEADINGS.map(([id,name,ds,off,focus])=>{const a=R.along(R.sPin+ds,off),b=R.along(R.sPin+ds,off-120);
   return Object.assign(village(id,name,focus,{x:a.x,z:a.z},{x:b.x,z:b.z},150,o),{kind:'steading',drawn:true});});
  // ---- the Stairhead
  const sH=R.sLip-650,hc=R.along(sH,300),hl=R.along(sH+120,120);
  out.stairhead=Object.assign(village('bk.stairhead','The Stairhead (the Stairmen\'s hamlet)','stair',{x:hc.x,z:hc.z},{x:hl.x,z:hl.z},150,o),{kind:'stairhead',drawn:true});
  /* Dalab's toll post: on the stair road where it reaches the head, between the hamlet and the edge; each piece's front to the road */
  const road=R.along(R.sLip-200,170),tx=road.tx,tz=road.tz,nx=road.nx,nz=road.nz,at=(a,b)=>[road.x+tx*a+nx*b,road.z+tz*a+nz*b],face=Math.atan2(-nx,-nz);
  out.toll=[{key:'dalab_watchtower',at:at(-40,46),name:'Dalab\'s toll post: the watch tower'},{key:'dalab_warehouse',at:at(10,58),name:'Dalab\'s toll post: the toll store (a tenth of what goes down)'},
   {key:'dalab_priest_house',at:at(-62,-52),name:'Dalab\'s toll post: the genepriest\'s house (who judges the ice for the gene stores)'},
   {key:'dalab_compound',at:at(-14,-58),name:'Dalab\'s toll post: the toll-men\'s compound'}]
   .map((t,i)=>({id:'bk.toll.'+i,key:t.key,set:'dalab',x:t.at[0],z:t.at[1],ry:i<2?face:face+Math.PI,name:t.name,kind:'toll',quarter:'stairhead',people:[4,0,5,16][i]}));
  /* the stair: from the head down the face on the right bank, switchbacks every 90 m of the river, 70 m across; the gin wheels at
     the edge where the loads are lowered past the first pitches */
  const S=[];let k=0;for(let s=R.sLip-260;s<=R.sLip+2400;s+=45,k++){const off=150+((k>>1)&1?70:0)+(k&1?35:0)*((k>>1)&1?-1:1);const a=R.along(s,off);S.push([a.x,a.z]);}
  out.stair={pts:S.map(p=>[p[0],p[1],G.h(p[0],p[1])]),w:2.6,name:'The gorge stair (a switchback beast path with roped pitches: PLAN.md question 3, proposed)'};
  out.hoists=[0,1].map(i=>{const a=R.along(R.sLip+20+i*60,95+i*14);return{id:'bk.hoist.'+i,key:'fg-stair-hoist',set:'piece',x:a.x,z:a.z,y:G.h(a.x,a.z),ry:Math.atan2(a.nx,a.nz),v:i,quarter:'stairhead',name:'A gin wheel and lowering frame over the falls\' first pitch (fg-stair-hoist)'};});
  /* the toll post's pieces stay off the hamlet's buildings */
  const hr=out.stairhead.records||[];out.toll=out.toll.filter(t=>!hr.some(r=>Math.hypot(r.x-t.x,r.z-t.z)<Math.hypot(D0(r.w,10),D0(r.d,10))/2+16));
  // ---- the hamlets
  out.hamlets=HAMLETS.map(([id,name,px,py,focus])=>{const [x,z]=G.fromPx(px,py);return Object.assign(village(id,name,focus,{x,z},{x:x*.98,z:z*.98},150,o,focus==='ice'?{resource:{x:x+150,z,workers:40}}:{}),{kind:'hamlet',drawn:inCountry(x,z)});});
  return out;}
 return{make,STEADINGS,HAMLETS,ROW};
})();
