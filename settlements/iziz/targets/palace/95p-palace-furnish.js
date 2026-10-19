// ================================================================= 95p. THE PALACE CITADEL: ROOMS, CUTAWAY UNITS, FURNITURE
// [web] After the world is built (90-scene's kbake) and before the take (99-start): the layout's rooms (IZPAL_SITE.L, 78s)
// become core/tags records (class part, kind room: the blueprint's names, so the inspector names each room), each building
// a cutaway unit (X; ] [ its storeys: the core/host cutaway, through IZIX.units, which 99-start hands to the take), and the
// rooms are furnished (IZPALF, below). window._palace reports it.
// the page's budget: the furnished citadel is a heavy page (about 7 M triangles with every room furnished, the furniture at
// half detail); the showcase's 3 M is the vernacular sheet's (src/91-probe.js)
BUDGET.showcase.tris=Math.max(BUDGET.showcase.tris,9000000);
const IZPALX=(function(){
 const S={units:[],rooms:0,records:0,byKind:{},unreached:0,dropped:0,ms:0};
 const site=IZPAL_SITE;if(!site.L){window._palace={error:'the citadel was not built'};return S;}
 const t0=performance.now(),L=site.L,FR=site.FR;
 // the buildings' records (REG -> core/tags in 91t-iziz-tags.js)
 const regId=key=>{const r=REG.find(e=>e.key===key);return r&&typeof REG_ID!=='undefined'?REG_ID.get(r)||null:null;};
 const parentOf={palace:regId('trans_palace'),mesa:regId('iziz_palace_mech_gate')};
 L.buildings.forEach(B=>{if(B.rect)parentOf[B.id]=regId('iziz_palace_'+B.id);});
 L.buildings.forEach(B=>{
  // the unit: the building's footprint box in the frame, its storeys
  const box=B.id==='palace'?{u0:-22,u1:62,v0:-48,v1:48}:B.id==='mesa'?{u0:-70,u1:IZPAL.TUNNEL_END,v0:-60,v1:60}:B.rect;
  const c=FR.P((box.u0+box.u1)/2,(box.v0+box.v1)/2);
  S.units.push({id:B.id,name:B.name,x:c[0],z:c[1],ry:FR.ry,w:box.v1-box.v0+2,d:box.u1-box.u0+2,
   levels:B.storeys.map(St=>({y:FR.Y(St.y),h:St.h,name:St.name}))});
  B.storeys.forEach(St=>{S.unreached+=St.unreached.length;
   St.spaces.forEach(s=>{if(s.gone||s.void||!s.rect||s.kind==='corridor')return;const q=s.rect,p=FR.P((q.u0+q.u1)/2,(q.v0+q.v1)/2);
    S.rooms++;S.byKind[s.kind]=(S.byKind[s.kind]||0)+1;
    if(typeof KTAGS!=='undefined'&&KTAGS.page){const h=(s.ceilY?s.ceilY-St.y:St.h);
     const rec={'class':'part',kind:'room',key:'iziz_palace_room.'+s.kind,name:s.name,at:[p[0],FR.Y(St.y),p[1]],ry:FR.ry,size:[q.v1-q.v0,q.u1-q.u0,h],
      tags:{culture:'iziz-old',setting:'room',room:s.kind,style:'decor '+s.decor},note:(s.note||'')+(s.note?'; ':'')+St.name,frag:'95p-palace-furnish.js'};
     const r=parentOf[B.id]?KTAGS.page.child(parentOf[B.id],rec):KTAGS.page.add(Object.assign({prefix:'ixr'},rec));s.recId=r&&r.id;S.records++;}});});});
 S.dropped=L.dropped.length;
 // the units go to the take with the vernacular's (99-start reads IZIX.units)
 S.units.forEach(u=>IZIX.units.push(u));
 S.ms=Math.round(performance.now()-t0);
 window._palace={rooms:S.rooms,records:S.records,units:S.units.map(u=>u.id+':'+u.levels.length),unreached:S.unreached,dropped:L.dropped.map(d=>d.name),
  draw:site.stats,buildMs:site.ms,ms:S.ms,byKind:S.byKind};
 return S;})();
// ---------------------------------------------------------------- the furnishing: hero pieces, essentials, the dressing
// One fast pass of its own per room (SKILL.md 5j: "furnish in two passes"; the interiors placer finds little in a state room
// and costs seconds there, so the palace uses the dressing alone, with each room class's essentials placed first):
//  1. HEROES: the blueprint's unique pieces where the programme puts them (the imperial throne on the Aula's dais under its
//     baldachin, the altar of the House at the Lararium's end, the core, the shield emitter, the lift platform under the
//     shaft, a cradle in every mech bay, the bath pools, the map tables, the heliograph and the Ancient set, the armillary);
//  2. ESSENTIALS by class: a bed (under a baldachin where the decor is sumptuous) and a strongbox in every bedchamber,
//     bunks and lockers in rows in the dormitories, hearths and cauldrons in the kitchens, desks in the offices ...;
//  3. the WALLS: every few metres (3 m sumptuous, 3.8 rich, 5 fine, 7 plain) a hung piece (tapestries, painted hangings,
//     sun reliefs, busts in niches, mirrors, banners) and between them one against the wall (torcheres, statues, urns,
//     palms, cabinets, divans, standards, orbs on pedestals), clear of doors and windows; a piece in each corner;
//  4. the MIDDLE by class: seat groups round a low table on a carpet, banquet tables and couches, the council table, rows of
//     desks, of bookcases, of strongboxes, of relic cases, of bunks; the Aula's runner flanked by standards and torcheres;
//  5. the CEILING: great chandeliers (sumptuous), deco chandeliers (rich), pendants (fine); hoists in the bays;
//  6. the TOPS: ewers, bowls, candelabra and books on the tables and desks it laid.
// Nothing draws from a stream: every choice is a hash of the room's id and the slot (KRAND), so the palace furnishes the same
// every load. Each piece is a core/tags record (class furniture, its room as parent) and goes into the catalog's batch (one
// mesh per render family, with the library's detail maps: build.py TARGET_FURN). A key the bundle lacks is skipped and
// counted (window._palace.furniture.missing).
const IZPALF=(function(){
 const S={on:false,rooms:0,pieces:0,heroes:0,byKey:{},missing:{},byClass:{},empty:[],ms:0,group:null,decals:[],courtFinishes:0,courtDecals:0};
 const site=IZPAL_SITE,report=()=>{if(window._palace)window._palace.furniture={on:S.on,rooms:S.rooms,pieces:S.pieces,heroes:S.heroes,ms:S.ms,
  keys:Object.keys(S.byKey).length,missing:S.missing,plants:S.plants||0,empty:S.empty,byClass:S.byClass,courtFinishes:S.courtFinishes,courtDecals:S.courtDecals,
  talia:Object.keys(S.byKey).filter(k=>/^talia_/.test(k)).reduce((n,k)=>n+S.byKey[k],0)};};
 if(!site.L||typeof KratorFurniture==='undefined'||/[?&]interiors=0\b/.test(location.search)){report();return S;}
 S.on=true;const t0=performance.now(),KF=KratorFurniture,FR=site.FR,F0=FR.F,L=site.L;
 KF.setDetail(.5);
 const batch=KF.batch({indexed:true});
 const E=k=>KF.FURN_BY_KEY[k],has=k=>!!E(k),dims=(k,v)=>KF.entryDims(E(k),v|0);
 const H=(a,b)=>KRAND.hash(String(a),String(b));            // 0..2^32-1 from (room, slot)
 const pick=(arr,a,b)=>arr[H(a,b)%arr.length];
 const ryFace=(du,dv)=>Math.atan2(-du*F0.gx+dv*F0.gz,-du*F0.gz-dv*F0.gx);   // the yaw that turns a piece's front to (du, dv) in the frame
 /* ---------------------------------------------------------------- the room being dressed */
 let R=null;   // {s, St, B, q, y, h, ceil, grid, n, cap, wealth, cls, parent}
 const CELL=.25;
 function occ(u0,u1,v0,v1){const g=R.grid;const i0=Math.max(0,Math.floor((u0-R.q.u0)/CELL)),i1=Math.min(g.nu-1,Math.ceil((u1-R.q.u0)/CELL)-1),j0=Math.max(0,Math.floor((v0-R.q.v0)/CELL)),j1=Math.min(g.nv-1,Math.ceil((v1-R.q.v0)/CELL)-1);return[i0,i1,j0,j1];}
 function free(u0,u1,v0,v1){if(u0<R.q.u0-.01||u1>R.q.u1+.01||v0<R.q.v0-.01||v1>R.q.v1+.01)return false;const[i0,i1,j0,j1]=occ(u0,u1,v0,v1),g=R.grid;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)if(g.a[i*g.nv+j])return false;return true;}
 function mark(u0,u1,v0,v1,val){const[i0,i1,j0,j1]=occ(u0,u1,v0,v1),g=R.grid;for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)g.a[i*g.nv+j]=val||1;}
 // the footprint of a piece at (u, v) facing (du, dv) (one of the four axes), and its front clearance
 function foot(k,v,u,vv,du,dv,clr){const d=dims(k,v),c=clr==null?((E(k).clearance||{}).front||0):clr;
  const alongU=du!==0;const eu=alongU?d.d:d.w,ev=alongU?d.w:d.d;
  let u0=u-eu/2,u1=u+eu/2,v0=vv-ev/2,v1=vv+ev/2;
  if(du>0)u1+=c;if(du<0)u0-=c;if(dv>0)v1+=c;if(dv<0)v0-=c;return[u0,u1,v0,v1,d];}
 // place: key, variant, centre (u, v), facing (du, dv), y from the mesa top; opt {check, clr, keep (do not mark), y}
 function put(k,v,u,vv,du,dv,o){o=o||{};if(!has(k)){S.missing[k]=(S.missing[k]||0)+1;return null;}if(R.n>=R.cap){R.why.cap++;return null;}
  const f=foot(k,v,u,vv,du,dv,o.clr),d=f[4];if(d.h>R.h-.15&&E(k).anchor!=='ceiling'){R.why.h++;return null;}
  if(o.check!==false&&!free(f[0],f[1],f[2],f[3])){R.why.free++;return null;}
  if(!o.keep)mark(f[0],f[1],f[2],f[3]);
  const A=E(k),floorY=FR.Y(R.y);let y=o.y!=null?o.y:KF.furnAnchorY(A,v|0,{floorY,ceilingY:FR.Y(R.y+R.h)});
  // a carpet, rug, runner or kilim lies 1.5 cm over the floor (clear of the medallions) and 8 mm over each one it overlaps
  if(FLAT.test(k)&&o.y==null){let n=0;for(const c of R.flat)if(c[0]<f[1]&&c[1]>f[0]&&c[2]<f[3]&&c[3]>f[2])n++;y+=.015+.008*n;R.flat.push(f);}
  const p=FR.P(u,vv),ry=ryFace(du,dv),seed=H(R.s.id,k+':'+R.n)%100000+1;
  const t={setting:'room',room:R.s.kind};if(A.culture)t.culture=A.culture;if(A.tier)t.tier=A.tier;
  if(typeof KTAGS!=='undefined'&&KTAGS.page){const rec={'class':'furniture',kind:A.type||null,key:k,name:A.name||null,at:[p[0],y,p[1]],ry,size:[d.w,d.d,d.h],tags:t,frag:'95p-palace-furnish.js'};
   if(R.parent)KTAGS.page.child(R.parent,rec);else KTAGS.page.add(Object.assign({prefix:'ixf'},rec));}
  batch.place(k,p[0],y,p[1],ry,{variant:v|0,seed,wealth:R.wealth,setting:'indoor'});
  if(typeof COURT_DECALS!=='undefined'&&COURT_DECALS[k])S.decals.push({key:k,x:p[0],y,z:p[1],ry,variant:v|0});
  R.n++;S.pieces++;S.byKey[k]=(S.byKey[k]||0)+1;return{k,v,u,v2:vv,y,d,top:y+d.h};}
 // something on a top: a host's surface height is measured once per key (the interiors kit's IX.measureTop)
 const tops={};function topOf(k,v){const c=k+'|'+v;if(c in tops)return tops[c];const d=dims(k,v),B2=KF.batch(),g=new THREE.Group();B2.place(k,0,0,0,0,{variant:v|0});B2.flush(g);
  const t=KratorInteriors.measureTop?KratorInteriors.measureTop(g,d):d.h;g.traverse(o=>{if(o.geometry)o.geometry.dispose();});return tops[c]=t==null?d.h:t;}
 function onTop(host,keys,n){if(!host)return;const tt=topOf(host.k,host.v);for(let i=0;i<n;i++){const k=pick(keys,R.s.id,'top'+R.n+i);if(!has(k))continue;
   const off=(i-(n-1)/2)*Math.min(.6,host.d.w/(n+.5));put(k,0,host.u+(host.faceU?off:0),host.v2+(host.faceU?0:off),host.du||1,host.dv||0,{check:false,keep:true,y:FR.Y(R.y)+tt});}}
 const FLAT=/carpet|rug|runner|kilim/;
 /* ---------------------------------------------------------------- the room classes */
 const STATE={throne:1,reception:1,antechamber:1,vestibule:1,atrium:1,gallery:1,council:1,feast_private:1,hall_hangar:1,ancestors_hall:1,oratory:1,chapel:1,cabinet:1,library:1,music:1,trophy:1,bath:1,map_room:1,bedchamber:1,kin_chamber:1,guest_bed:1,lift_hall:1};
 const cls=s=>{const k=s.kind;if(R.B.ancient)return'ancient';if(k==='corridor'||k==='passage'||k==='hall')return'corridor';if(STATE[k]&&s.decor>=3)return'state';
  if(R.emb&&s.decor>=2&&k!=='corridor')return'embassy';
  if(['office','archive','ministry','chamber','school','signal','astronomers','infirmary','map_room','cabinet','library','council'].includes(k))return'office';
  if(['guard','armoury','barracks','drill','beacon'].includes(k))return'guard';return'service';};
 // the court's paintings (one of sixteen Izani canvases each, in a carved gilt frame: 95i COURT_DECALS) hang in every state
 // room and corridor; the envoys' rooms hang Talia's niches beside them
 const HUNG={state:['iziz_court_painting','iziz_court_tapestry','iziz_court_painting','iziz_court_sun_relief','iziz_court_painted_hanging','iziz_court_painting','iziz_court_wall_rug','iziz_court_art'],
  corridor:['iziz_court_painting','iziz_court_tapestry','iziz_court_sun_relief','iziz_court_painting','iziz_court_banner','iziz_court_painted_hanging'],
  office:['iziz_court_scroll','iziz_court_painting','iziz_common_board','iziz_common_art','iziz_common_scroll','iziz_court_frieze'],
  embassy:['iziz_court_painting','talia_common_wall_niche','iziz_court_wall_rug','iziz_court_painting','iziz_court_tapestry'],
  guard:['iziz_court_banner','iziz_trade_weapon_rack','iziz_common_pennants'],service:['iziz_common_wall_shelves','iziz_common_rack','iziz_common_pennants'],ancient:[]};
 const STAND={state:['iziz_court_torchere','iziz_court_statue','iziz_court_urn','iziz_court_palm_pot','iziz_court_cabinet','iziz_court_torchere','iziz_court_divan','iziz_court_orb_pedestal'],
  corridor:['iziz_court_torchere','iziz_court_statue','iziz_court_urn','iziz_court_palm_pot','iziz_court_bench_niche_x','iziz_court_statue'],
  office:['iziz_court_library_shelves','iziz_common_bookcase','iziz_court_cabinet','iziz_common_chest','iziz_court_palm_pot','iziz_common_lamp'],
  embassy:['talia_common_palm_planter','talia_court_brass_lantern','talia_common_jar_stand','talia_common_painted_chest','talia_court_white_sofa','talia_common_plaster_bench'],
  guard:['iziz_trade_armour_stand','iziz_trade_weapon_rack','iziz_common_drum_stand','iziz_common_chest','iziz_trade_locker'],
  service:['iziz_common_store','iziz_vern_barrel','iziz_common_chest','iziz_vern_crate','iziz_trade_larder','iziz_common_wall_shelves'],
  ancient:['iziz_ancient_light_column','iziz_ancient_terminal','iziz_depot_tool_cart','iziz_ancient_light_column','iziz_depot_munitions_stack']};
 const CORNER={state:['iziz_court_palm_pot','iziz_court_urn','iziz_court_statue','iziz_court_torchere'],corridor:['iziz_court_palm_pot','iziz_court_urn'],office:['iziz_court_palm_pot','iziz_common_lamp'],embassy:['talia_common_palm_planter','talia_court_brass_lantern'],
  guard:['iziz_common_drum_stand','iziz_trade_armour_stand'],service:['iziz_vern_barrel','iziz_vern_crate'],ancient:['iziz_ancient_light_column']};
 const SPACING=d=>d>=4?3:d===3?3.8:d===2?5:7;
 // the room's walls: [dir, line, t0, t1, inward du, dv] for the four sides of its rect, less the sides open to its own floor
 function walls(){const q=R.q,o=[['u',q.u0,q.v0,q.v1,1,0],['u',q.u1,q.v0,q.v1,-1,0],['v',q.v0,q.u0,q.u1,0,1],['v',q.v1,q.u0,q.u1,0,-1]];
  return o.filter(w=>{// a side another space's floor continues past with no wall is no wall
   const mid=(w[2]+w[3])/2,pu=w[0]==='u'?w[1]-w[4]*.4:mid,pv=w[0]==='u'?mid:w[1]-w[5]*.4,t=R.St.spaceAt(pu,pv);return!t||t===R.s?true:!(t.open&&R.s.open);});}
 // keep the doors and portals clear (1.8 m into the room, the door's width and 0.4 either side) and the windows' fronts
 function keepClear(){const s=R.s;s.doors.forEach(d=>{
   if(d.portal){for(const pt of[d.at]){mark(pt[0]-(d.w/2+1.6),pt[0]+(d.w/2+1.6),pt[1]-(d.w/2+1.6),pt[1]+(d.w/2+1.6),2);}return;}
   if(d.dir==='u')mark(d.line-1.9,d.line+1.9,d.t0-.4,d.t1+.4,2);else mark(d.t0-.4,d.t1+.4,d.line-1.9,d.line+1.9,2);});
  (s.windows||[]).forEach(w=>{if(w.ax==='u')mark(w.line-.9,w.line+.9,w.along-w.w/2-.1,w.along+w.w/2+.1,3);else mark(w.along-w.w/2-.1,w.along+w.w/2+.1,w.line-.9,w.line+.9,3);});
  // the stairs and the impluvium, the dais
  if(s.kind==='atrium'){const q=R.q,cu=(q.u0+q.u1)/2,cv=(q.v0+q.v1)/2,pu=(q.u1-q.u0)*.38,pv=(q.v1-q.v0)*.3;mark(cu-pu/2-1,cu+pu/2+1,cv-pv/2-1,cv+pv/2+1);}
  if(s.dais){mark(R.q.u1-5.6,R.q.u1,s.dais.v-7.2,s.dais.v+7.2);}
  // the Well's shaft and its rail at the lift hall
  if(s.kind==='lift_hall'&&!R.B.ancient)mark(9.6,20.4,-6.4,4.4);}
 // along each wall: hung pieces and standing pieces in turn; free wall only
 function dressWalls(c){const sp=SPACING(R.s.decor);if(R.s.decor<1&&c!=='ancient')return;
  walls().forEach((w,wi)=>{const[dir,line,t0,t1,du,dv]=w,len=t1-t0,n=Math.max(len>=2.8?1:0,Math.floor((len-1.2)/sp));
   for(let i=0;i<n;i++){const t=t0+(len)*(i+.5)/n,hungSlot=(i+wi)%2===0;
    const keys=hungSlot&&HUNG[c].length?HUNG[c]:STAND[c];const k0=pick(keys,R.s.id,'w'+wi+':'+i),k=k0==='iziz_court_bench_niche_x'?(R.s.decor>=4?'iziz_court_bust_niche':'iziz_court_urn'):k0;if(!has(k))continue;
    const d=dims(k,0),inset=.2+d.d/2,u=dir==='u'?line+du*inset:t,v=dir==='u'?t:line+dv*inset;
    const p=put(k,H(R.s.id,k)%(E(k).variants||1),u,v,du,dv);
    if(p&&(k==='iziz_court_cabinet'||k==='iziz_court_divan'))onTop({k,v:0,u,v2:v,d,du,dv,faceU:dv!==0},['iziz_court_candelabra','iziz_court_jug'],1);}});}
 function corners(c){if(R.s.decor<3&&c!=='ancient')return;const q=R.q,ks=CORNER[c];
  [[q.u0,q.v0,1,1],[q.u0,q.v1,1,-1],[q.u1,q.v0,-1,1],[q.u1,q.v1,-1,-1]].forEach((cn,i)=>{const k=pick(ks,R.s.id,'c'+i);if(!has(k))return;const d=dims(k,0),m=.25+Math.max(d.w,d.d)/2;
   put(k,0,cn[0]+cn[2]*m,cn[1]+cn[3]*m,cn[2],0);});}
 // a grid of slots over the free middle: cell size (cu, cv), the room's long axis first; fn(u, v, i) places one
 function grid(cu,cv,margin,fn,max){const q=R.q,lu=(q.u1-q.u0)>=(q.v1-q.v0),a0=(lu?q.u0:q.v0)+margin,a1=(lu?q.u1:q.v1)-margin,b0=(lu?q.v0:q.u0)+margin,b1=(lu?q.v1:q.u1)-margin;
  const ca=lu?cu:cv,cb=lu?cv:cu,na=Math.max(0,Math.floor((a1-a0)/ca)),nb=Math.max(0,Math.floor((b1-b0)/cb));let n=0;
  for(let i=0;i<na;i++)for(let j=0;j<nb;j++){if(max&&n>=max)return;const a=a0+(a1-a0)*(i+.5)/na,b=b0+(b1-b0)*(j+.5)/nb;if(fn(lu?a:b,lu?b:a,n,lu))n++;}}
 // the direction from (u, v) to the room's main door (a desk or a pew faces it), as one of the four axes
 function towardDoor(u,v){const d=R.s.doors[0];if(!d)return[1,0];const at=d.portal?d.at:d.dir==='u'?[d.line,(d.t0+d.t1)/2]:[(d.t0+d.t1)/2,d.line];
  const du=at[0]-u,dv=at[1]-v;return Math.abs(du)>Math.abs(dv)?[Math.sign(du)||1,0]:[0,Math.sign(dv)||1];}
 // the envoys' sitting groups: Talia's orange tub armchairs round a low brass table on a meander rug or a kilim, ottomans
 const taliaGroup=(u,v,i)=>{if(!free(u-2.4,u+2.4,v-2.4,v+2.4))return false;put(i%2?'talia_common_kilim':'talia_court_meander_rug',0,u,v,1,0,{check:false,keep:true});
  const tb=put('talia_court_brass_table',0,u,v,1,0,{check:false,clr:0});
  for(const[a,b]of[[-1.25,0],[1.25,0],[0,-1.25]])put('talia_common_tub_armchair',0,u+a,v+b,-Math.sign(a)||0,a?0:-Math.sign(b),{check:false,clr:0});
  put('talia_common_ottoman',0,u,v+1.25,0,-1,{check:false,clr:0});mark(u-2.4,u+2.4,v-2.4,v+2.4);
  if(tb)onTop(Object.assign(tb,{faceU:false,du:1,dv:0}),['iziz_court_jug','iziz_court_bowl','iziz_court_candelabra'],2);return true;};
 const seatGroup=(u,v,i)=>{if(R.emb)return taliaGroup(u,v,i);const car=R.s.decor>=4?'iziz_court_carpet':R.s.decor===3?'iziz_court_carpet':'iziz_common_rug';
  if(!free(u-2.6,u+2.6,v-2.2,v+2.2))return false;if(!R.carpeted)put(car,i%2,u,v,1,0,{check:false,keep:true});
  const tb=put(R.s.decor>=3?'iziz_court_low_table':'iziz_common_low_table',0,u,v,1,0,{check:false,clr:0});
  put(R.s.decor>=3?'iziz_court_divan':'iziz_common_bench',0,u-1.5,v,1,0,{check:false,clr:0});put(R.s.decor>=3?'iziz_court_divan':'iziz_common_bench',0,u+1.5,v,-1,0,{check:false,clr:0});
  if(R.s.decor>=4){put('iziz_court_kline',H(R.s.id,'kl'+i)%2,u,v-1.6,0,1,{check:false,clr:0});}
  mark(u-2.6,u+2.6,v-2.2,v+2.2);if(tb)onTop(Object.assign(tb,{faceU:false,du:1,dv:0}),['iziz_court_jug','iziz_court_bowl','iziz_court_candelabra'],2);return true;};
 /* ---------------------------------------------------------------- per kind: heroes, essentials, the middle */
 function middle(c){const s=R.s,k=s.kind,q=R.q,cu=(q.u0+q.u1)/2,cv=(q.v0+q.v1)/2,du=q.u1-q.u0,dv=q.v1-q.v0,lu=du>=dv;
  const back=()=>{// the wall farthest from the main door: its centre and inward direction
   const d=s.doors[0];const at=d?(d.portal?d.at:d.dir==='u'?[d.line,(d.t0+d.t1)/2]:[(d.t0+d.t1)/2,d.line]):[q.u0,cv];
   const cand=[[q.u0,cv,1,0],[q.u1,cv,-1,0],[cu,q.v0,0,1],[cu,q.v1,0,-1]];cand.sort((a,b)=>Math.hypot(b[0]-at[0],b[1]-at[1])-Math.hypot(a[0]-at[0],a[1]-at[1]));return cand[0];};
  const hero=(key,u,v,fu,fv,o)=>{const p=put(key,0,u,v,fu,fv,Object.assign({check:false},o||{}));if(p)S.heroes++;return p;};
  switch(k){
  case'throne':{const D=s.dais||{u:q.u1-2.2,v:cv,y:R.y+.9};
   hero('iziz_court_imperial_throne',D.u-.4,D.v,-1,0,{y:FR.Y(R.y+.9)});hero('iziz_court_baldachin',D.u-.4,D.v,-1,0,{y:FR.Y(R.y+.9),keep:true});
   for(const sd of[-1,1])hero('iziz_court_orb_pedestal',D.u-1.2,D.v+sd*3.4,-1,0,{y:FR.Y(R.y+.6)});
   for(const dv2 of[7.5,11.5])hero('iziz_court_mech_trophy',q.u1-1.6,D.v+dv2,-1,0);
   // the runner from the great door to the dais (on the door's axis), standards and torcheres either side of it
   for(let u=q.u0+.8;u<q.u1-6;u+=8.8){put('iziz_court_runner',0,u+4.4,D.v,1,0,{check:false,keep:true});}
   for(let u=q.u0+3;u<q.u1-6.5;u+=3.2)for(const sd of[-1,1]){put((Math.round(u)%2?'iziz_court_standard':'iziz_court_torchere'),H(s.id,'st'+u)%2,u,D.v+sd*2.6,0,-sd);}
   break;}
  case'ancestors_hall':case'oratory':case'chapel':{const b=back();hero('iziz_court_altar_of_the_house',b[0]+b[2]*1.4,b[1]+b[3]*1.4,b[2],b[3]);
   put('iziz_court_lectern',0,b[0]+b[2]*3.4,b[1]+b[3]*3.4+(b[2]?1.6:0),b[2],b[3]);
   grid(1.8,2.4,2.2,(u,v)=>{const f=[b[2],b[3]];return!!put('iziz_common_bench',1,u,v,f[0]?-f[0]:0,f[1]?-f[1]:0);},12);break;}
  case'bath':{hero('iziz_court_bath_pool',cu,cv,lu?1:0,lu?0:1);grid(3.2,3.2,1.4,(u,v,i)=>!!put(i%3?'iziz_court_bath_slab':'iziz_court_palm_pot',0,u,v,lu?0:1,lu?1:0),6);
   put('iziz_common_bath_basin',0,q.u0+.5,cv+2,1,0);put('iziz_court_mirror',0,q.u0+.25,cv-2,1,0);break;}
  case'map_room':{if(R.B.id==='palace'&&s.decor>=3)hero('iziz_court_map_table',cu,cv,1,0);if(du*dv>220){hero('iziz_court_map_table',cu-du/4,cv,1,0);}
   grid(3,3,1.6,(u,v,i)=>!!put(i%2?'talia_court_map_case':'iziz_court_standard',0,u,v,1,0),6);put('talia_court_globe',0,cu+2.2,cv+2.2,1,0);break;}
  case'council':{// the council table: court tables end to end down the room, chairs both sides
   const n=Math.max(1,Math.min(6,Math.floor(((lu?du:dv)-6)/2.4)));for(let i=0;i<n;i++){const a=(i-(n-1)/2)*2.42,u=lu?cu+a:cu,v=lu?cv:cv+a;
    const t=put('iziz_court_table',i%2,u,v,lu?0:1,lu?1:0,{check:false,clr:0});if(t)onTop(Object.assign(t,{faceU:!lu,du:lu?0:1,dv:lu?1:0}),['iziz_court_candelabra','iziz_court_jug','iziz_common_books'],1);
    for(const sd of[-1,1])for(const o of[-.6,.6]){put('iziz_common_chair',0,lu?u+o:u+sd*1.05,lu?v+sd*1.05:v+o,lu?0:-sd,lu?-sd:0,{check:false,clr:0});}}
   mark(lu?cu-n*1.25-.6:cu-1.8,lu?cu+n*1.25+.6:cu+1.8,lu?cv-1.8:cv-n*1.25-.6,lu?cv+1.8:cv+n*1.25+.6);
   const ends=lu?[[cu-n*1.25-1.1,cv,1,0],[cu+n*1.25+1.1,cv,-1,0]]:[[cu,cv-n*1.25-1.1,0,1],[cu,cv+n*1.25+1.1,0,-1]];put('iziz_court_throne',0,ends[0][0],ends[0][1],ends[0][2],ends[0][3]);
   if(R.B.id==='palace'&&s.decor>=4)hero('iziz_court_map_table',ends[1][0]+ends[1][2]*1.4,ends[1][1]+ends[1][3]*1.4,1,0);break;}
  case'feast_private':case'hall_hangar':{// klines round low tables (the triclinium), banquet tables down the hangar
   if(k==='hall_hangar'){const gd=(R.St.portals||[]).find(P=>/great door/.test(P.name)),av=gd?(gd.a[1]+gd.b[1])/2:cv;
    // the processional way from the terrace to the great door: kept clear, a runner down it, the mech trophies and orbs
    // either side of the door, potted palms and heliconias along the open front, the musicians in the front corner
    for(let u=q.u0+.4;u<q.u1-1.5;u+=8.8)put('iziz_court_runner',0,Math.min(u+4.4,q.u1-4.6),av,1,0,{check:false,keep:true});
    mark(q.u0,q.u1,av-1.4,av+1.4);
    for(const sd of[-1,1]){hero('iziz_court_mech_trophy',q.u1-1.8,av+sd*5.4,-1,0);put('iziz_court_orb_pedestal',0,q.u1-1.1,av+sd*2.6,-1,0);
     put('iziz_court_standard',H(s.id,'gs'+sd)%2,q.u1-.6,av+sd*3.9,-1,0);}
    for(const[v,i]of[[q.v0+1.2,0],[av-3.4,1],[av+3.4,2],[q.v1-1.2,3]])put(['iziz_court_palm_pot','br_aroid_heliconia','talia_common_palm_planter','iziz_court_palm_pot'][i],0,q.u0+1,v,1,0);
    put('iziz_court_harp',0,q.u0+3.2,q.v1-2.4,0,-1);put('iziz_common_drum_stand',0,q.u0+4.6,q.v1-1.6,0,-1);
    grid(6.2,3.4,2.2,(u,v,i,lu2)=>{const t=put('iziz_court_banquet_table',0,u,v,lu2?0:1,lu2?1:0,{clr:.2});if(!t)return false;
     onTop(Object.assign(t,{faceU:!lu2,du:lu2?0:1,dv:lu2?1:0}),['iziz_court_bowl','iziz_court_jug','iziz_court_candelabra','iziz_court_bowl'],4);
     for(const sd of[-1,1])put('iziz_court_kline',(i+sd)&1,lu2?u:u+sd*1.5,lu2?v+sd*1.5:v,lu2?0:-sd,lu2?-sd:0,{check:false,clr:0});return true;},8);
    grid(4,4,1,(u,v,i)=>!!put(i%2?'iziz_court_fire':'iziz_court_statue',0,u,v,1,0),6);}
   else grid(5.2,5.2,1.6,(u,v,i)=>{if(!free(u-2.4,u+2.4,v-2.4,v+2.4))return false;const t=put('iziz_court_low_table',0,u,v,1,0,{check:false,clr:0});
     put('iziz_court_carpet',i%2,u,v,1,0,{check:false,keep:true});
     for(const[a,b]of[[-1.4,0],[0,-1.4],[0,1.4]])put('iziz_court_kline',(i+a+b)&1,u+a,v+b,a?1:0,a?0:-Math.sign(b),{check:false,clr:0});mark(u-2.4,u+2.4,v-2.4,v+2.4);
     if(t)onTop(Object.assign(t,{faceU:false,du:1,dv:0}),['iziz_court_bowl','iziz_court_jug','iziz_court_candelabra'],3);return true;},6);break;}
  case'orangery':{// the beds run down the two long sides (78s); the fountain on the back wall, palms in tubs in its corners,
   // two benches facing across the middle with an urn of flowers between them
   const b=back(),al=b[2]?[0,1]:[1,0],L2=b[2]?dv:du,fw=dims('iziz_court_wall_fountain',0);
   hero('iziz_court_wall_fountain',b[0]+b[2]*(fw.d/2+.2),b[1]+b[3]*(fw.d/2+.2),b[2],b[3]);
   for(const sd of[-1,1]){const pk=sd<0?'talia_common_palm_planter':'iziz_court_palm_pot',pd=dims(pk,0),o=L2/2-pd.w/2-.1;
    put(pk,0,b[0]+b[2]*(pd.d/2+.15)+al[0]*sd*o,b[1]+b[3]*(pd.d/2+.15)+al[1]*sd*o,b[2],b[3],{check:false});
    put('talia_common_plaster_bench',0,cu-b[2]*.4+al[0]*sd*1.2,cv-b[3]*.4+al[1]*sd*1.2,-al[0]*sd,-al[1]*sd,{check:false,clr:0});}
   put('iziz_court_urn',0,cu-b[2]*.4,cv-b[3]*.4,b[2],b[3],{check:false,clr:0});break;}
  case'bedchamber':case'kin_chamber':case'guest_bed':{const b=back(),big=s.decor>=4,bed=big||s.decor>=3?'iziz_court_bed':'iziz_common_bed';
   // the bed's head to the back wall, under a baldachin in the sumptuous rooms; a strongbox at its foot; the rest
   const bd=dims(bed,0),bu=b[0]+b[2]*(.2+bd.d/2),bv=b[1]+b[3]*(.2+bd.d/2);
   if(big){put('iziz_court_baldachin',0,b[0]+b[2]*1.9,b[1]+b[3]*1.9,b[2],b[3],{check:false,keep:true});}
   const placed=put(bed,H(s.id,'bed')%2,bu,bv,b[2],b[3],{check:false});if(placed&&k!=='bedchamber'||placed)S.heroes+=0;
   const n2=s.kind==='bedchamber'&&/Children/.test(s.name)?3:1;for(let i=1;i<n2;i++){const off=i*(bd.w+1.4)*(i%2?1:-1);put(bed,0,bu+(b[2]?0:off),bv+(b[2]?off:0),b[2],b[3]);}
   put(big?'iziz_court_strongbox':'iziz_common_chest',1,bu+b[2]*(bd.d/2+.7),bv+b[3]*(bd.d/2+.7),b[2],b[3]);
   if(s.decor>=3){R.carpeted=!!put('iziz_court_carpet',0,cu,cv,b[2]||1,b[3],{keep:true});put('iziz_court_fan_screen',0,b[0]+b[2]*1.4+(b[2]?0:(bd.w/2+1.6)),b[1]+b[3]*1.4+(b[2]?(bd.w/2+1.6):0),b[2],b[3]);
    put('iziz_court_mirror',0,cu,cv,1,0);grid(4.2,4.2,1.6,seatGroup,1);}
   break;}
  case'reception':case'antechamber':case'vestibule':case'gallery':case'cabinet':case'music':case'trophy':case'lift_hall':case'atrium':{
   if(k==='cabinet'){const b=back();const dk=put('iziz_court_desk',0,b[0]+b[2]*.6,b[1]+b[3]*.6,b[2],b[3]);if(dk)onTop(Object.assign(dk,{faceU:!b[2],du:b[2],dv:b[3]}),['iziz_common_books','iziz_court_candelabra'],2);
    put('iziz_court_throne',0,b[0]+b[2]*1.6,b[1]+b[3]*1.6,-b[2],-b[3]);put('iziz_court_strongbox',0,b[0]+b[2]*.6+(b[2]?0:2.2),b[1]+b[3]*.6+(b[2]?2.2:0),b[2],b[3]);}
   if(k==='music'){put('iziz_court_harp',0,cu,cv,1,0);put('iziz_common_drum_stand',0,cu+1.6,cv+1.4,-1,0);}
   if(k==='trophy'){grid(2.6,2.6,1.6,(u,v,i)=>!!put(i%3?'iziz_court_standard':'iziz_court_mech_trophy',i&1,u,v,1,0),14);break;}
   if(k==='vestibule'){put('iziz_court_orb_pedestal',0,cu,cv,-1,0);}
   if(R.emb&&(k==='reception'||k==='antechamber')){const b=back();put('talia_court_aedicule',0,b[0]+b[2]*.4,b[1]+b[3]*.4,b[2],b[3]);}
   if(k==='music'){put('talia_common_easel',0,cu-2,cv-1.6,1,0);put('talia_common_modelling_stand',0,cu-2,cv+1.6,1,0);}
   grid(5.4,5.4,1.6,seatGroup,Math.ceil(R.s.area/60));break;}
  case'library':{grid(3,2.6,1.4,(u,v,i,lu2)=>{if(i%4===3){const t=put('iziz_court_table',0,u,v,lu2?0:1,lu2?1:0);if(t){onTop(Object.assign(t,{faceU:!lu2,du:0,dv:1}),['iziz_common_books','iziz_court_candelabra'],2);
     for(const sd of[-1,1])put('iziz_common_chair',0,lu2?u:u+sd*.95,lu2?v+sd*.95:v,lu2?0:-sd,lu2?-sd:0,{check:false,clr:0});}return!!t;}
    return!!put(i%4===1?'talia_common_bookcase':'iziz_court_library_shelves',0,u,v,lu2?0:1,lu2?1:0,{clr:.6});},18);put('iziz_court_lectern',0,cu,cv,1,0);
   put('talia_court_globe',0,cu-2,cv,1,0);put('talia_court_specimen_case',0,q.u0+.5,cv+2,1,0);put('talia_court_map_case',0,q.u1-.7,cv-2,-1,0);
   if(/Emperor|Palace/.test(s.name))put('iziz_court_armillary',0,cu+2,cv,1,0);if(/Music/.test(s.name))put('iziz_court_harp',0,cu,cv+2.4,1,0);break;}
  case'office':case'archive':case'ministry':case'chamber':case'school':case'infirmary':case'signal':case'astronomers':case'larder':case'wardrobe':{
   if(k==='signal'){const b=back();hero('iziz_court_heliograph',cu,cv,b[2],b[3]);hero('iziz_ancient_set',b[0]+b[2]*.6,b[1]+b[3]*.6+(b[2]?2:0),b[2],b[3]);}
   if(k==='astronomers'){hero('iziz_court_armillary',cu,cv,1,0);put('talia_court_globe',0,cu+2.4,cv,1,0);put('talia_court_specimen_case',0,q.u0+.5,cv,1,0);}
   if(k==='archive'){grid(2.4,2,1.2,(u,v,i,lu2)=>!!put(i%2?'iziz_court_library_shelves':(i%3?'talia_court_map_case':'iziz_common_bookcase'),0,u,v,lu2?0:1,lu2?1:0,{clr:.5}),16);break;}
   if(k==='wardrobe'){grid(2.2,2,1.2,(u,v,i,lu2)=>!!put(i%3?'iziz_court_cabinet':'iziz_court_mirror',0,u,v,lu2?0:1,lu2?1:0,{clr:.6}),12);break;}
   if(k==='chamber'||k==='infirmary'){const b=back();grid(2.8,2.6,1.2,(u,v,i)=>!!put(k==='infirmary'?'iziz_common_bed':(i%2?'iziz_common_bed':'iziz_common_chest'),0,u,v,b[2]||1,b[3]),k==='infirmary'?8:4);}
   // desks in rows facing the door, a chair at each
   if(k==='school'){put('talia_common_slate',0,q.u0+.2,cv,1,0);put('talia_common_easel',0,q.u1-1,cv-2,-1,0);put('talia_court_globe',0,q.u1-1,cv+2,-1,0);}
   grid(2.6,2.4,1.3,(u,v,i)=>{const f=towardDoor(u,v),dk=put(k==='school'?'talia_common_scholar_desk':s.decor>=3?'iziz_court_desk':'iziz_common_desk',0,u,v,f[0],f[1],{clr:.9});if(!dk)return false;
    put('iziz_common_chair',0,u-f[0]*.75,v-f[1]*.75,f[0],f[1],{check:false,clr:0});onTop(Object.assign(dk,{faceU:!f[0],du:f[0],dv:f[1]}),['iziz_common_books','iziz_common_candle','iziz_court_jug'],1);return true;},k==='school'?10:8);
   break;}
  case'treasury':case'treasury_vault':case'reliquary':{const key=k==='reliquary'?'iziz_relic_case':'iziz_court_strongbox';
   grid(2,2,1.3,(u,v,i,lu2)=>!!put(key,i%2,u,v,lu2?0:1,lu2?1:0,{clr:.6}),k==='reliquary'?14:24);
   if(k==='reliquary')grid(5,5,2,(u,v)=>!!put('iziz_court_orb_pedestal',0,u,v,1,0),2);break;}
  case'kitchen':case'servants_hall':{if(k==='kitchen'){const b=back();put('iziz_common_hearth',0,b[0]+b[2]*.6,b[1]+b[3]*.6,b[2],b[3]);put('iziz_bread_oven',0,b[0]+b[2]*1.1+(b[2]?0:4),b[1]+b[3]*1.1+(b[2]?4:0),b[2],b[3]);
    hero('iziz_common_cauldron',cu-2,cv,1,0);hero('iziz_common_spit',cu+2,cv,1,0);put('iziz_common_copper',0,q.u0+.7,cv+3,1,0);put('iziz_common_ice_box',0,q.u1-.5,cv-3,-1,0);}
   grid(3.4,2.6,1.0,(u,v,i,lu2)=>{const t=put('iziz_common_table',i&1,u,v,lu2?0:1,lu2?1:0,{clr:.3});if(!t)return false;
    for(const sd of[-1,1])put('iziz_common_bench',0,lu2?u:u+sd*.75,lu2?v+sd*.75:v,lu2?0:-sd,lu2?-sd:0,{check:false,clr:0});onTop(Object.assign(t,{faceU:!lu2,du:0,dv:1}),['iziz_common_bowl','iziz_common_jug'],2);return true;},k==='kitchen'?3:10);break;}
  case'dormitory':case'barracks':{const bed='iziz_trade_bunk',b=back(),al=b[2]?[0,1]:[1,0],L2=b[2]?dv:du,bd=dims(bed,0),n=Math.max(1,Math.floor((L2-.4)/(bd.w+.3)));
   // a row of bunks with their heads to the wall opposite the door (a contubernium's eight men in four), a locker at each
   // row's end, a table and benches in the middle; a long room fills on in rows
   for(let i=0;i<n;i++){const t=(i-(n-1)/2)*(bd.w+.3);put(bed,H(s.id,'b'+i)%2,b[0]+b[2]*(bd.d/2+.2)+al[0]*t,b[1]+b[3]*(bd.d/2+.2)+al[1]*t,b[2],b[3],{clr:.3});}
   for(const sd of[-1,1])put('iziz_trade_locker',0,b[0]+b[2]*(bd.d+.9)+al[0]*sd*(L2/2-.5),b[1]+b[3]*(bd.d+.9)+al[1]*sd*(L2/2-.5),-al[0]*sd,-al[1]*sd);
   const tb=put('iziz_common_table',0,cu+b[2]*.6,cv+b[3]*.6,al[0],al[1],{clr:.2});
   if(tb){for(const sd of[-1,1])put('iziz_common_bench',0,cu+b[2]*(.6+sd*.75),cv+b[3]*(.6+sd*.75),-b[2]*sd,-b[3]*sd,{check:false,clr:0});onTop(Object.assign(tb,{faceU:!!b[2],du:al[0],dv:al[1]}),['iziz_common_bowl','iziz_common_jug','iziz_common_candle'],2);}
   grid(1.6,3,.9,(u,v,i,lu2)=>!!put(bed,0,u,v,lu2?0:1,lu2?1:0,{clr:.6}),40);break;}
  case'store':case'cistern':{grid(1.8,2.2,1,(u,v,i,lu2)=>!!put(pick(['iziz_vern_crate','iziz_vern_barrel','iziz_common_store','iziz_vern_sacks','iziz_depot_munitions_stack'],s.id,'st'+i),H(s.id,i)%2,u,v,lu2?0:1,lu2?1:0,{clr:.4}),30);break;}
  case'guard':case'armoury':{const t=put('iziz_common_table',0,cu,cv,1,0);if(t)for(const sd of[-1,1])put('iziz_common_bench',0,cu,cv+sd*.85,0,-sd,{check:false,clr:0});
   grid(2,2,1.2,(u,v,i)=>!!put(i%2?'iziz_trade_armour_stand':'iziz_depot_shell_rack',0,u,v,1,0),k==='armoury'?16:2);break;}
  case'drill':{grid(3,3,2,(u,v,i)=>!!put(i%4?'iziz_training_training_dummy':'iziz_training_archery_butt',0,u,v,1,0),12);break;}
  case'stable':{grid(2.4,3.2,.2,(u,v,i,lu2)=>!!put(i%3===2?'iziz_trade_hayrack':'iziz_trade_stall',i&1,u,v,lu2?0:1,lu2?1:0,{clr:.8}),12);put('iziz_trade_trough',0,cu,cv,1,0);break;}
  // the Ancient levels
  case'core':hero('iziz_ancient_core',cu,cv,1,0);for(let i=0;i<8;i++){const a=i/8*TAU;put('iziz_ancient_light_column',0,cu+Math.cos(a)*8,cv+Math.sin(a)*8,1,0);}break;
  case'control_room':grid(3,2.6,1.6,(u,v,i)=>{const f=towardDoor(u,v);const c2=put(i%3===2?'iziz_ancient_terminal':'iziz_common_console',0,u,v,-f[0],-f[1],{clr:.9});if(c2&&i%3!==2)put('iziz_common_chair',0,u-f[0]*.85,v-f[1]*.85,-f[0],-f[1],{check:false,clr:0});return!!c2;},14);break;
  case'shield':hero('iziz_shield_emitter',cu,cv,1,0);grid(3,3,1.4,(u,v,i)=>!!put(i%2?'iziz_ancient_terminal':'iziz_cell_rack',0,u,v,1,0),8);break;
  case'cells':grid(2.4,2.2,1,(u,v,i,lu2)=>!!put('iziz_cell_rack',i&1,u,v,lu2?0:1,lu2?1:0,{clr:.7}),18);break;
  case'mech_bay':{const b=back();hero('iziz_mech_cradle',b[0]+b[2]*3.1,b[1]+b[3]*3.1,b[2],b[3]);
   put('iziz_mech_hoist',0,cu,cv,lu?0:1,lu?1:0,{check:false,keep:true});
   grid(2.6,2.6,1.2,(u,v,i)=>!!put(['iziz_depot_tool_cart','iziz_depot_plate_stack','iziz_common_workbench','iziz_depot_munitions_stack'][i%4],0,u,v,1,0),6);break;}
  case'repair_shop':case'forge':{put('iziz_mech_hoist',0,cu,cv,lu?0:1,lu?1:0,{check:false,keep:true});
   grid(3,3,1.4,(u,v,i)=>!!put(['iziz_trade_forge','iziz_trade_anvil','iziz_trade_lathe','iziz_depot_plate_stack','iziz_depot_tool_cart','iziz_trade_grindstone','iziz_common_workbench','iziz_trade_press'][i%8],0,u,v,1,0,{clr:.7}),22);break;}
  case'cell':{const b=back();for(let i=-2;i<=2;i++){const t=i*3.2;put('iziz_common_cell_grate',0,b[0]+b[2]*2.6+(b[2]?0:t),b[1]+b[3]*2.6+(b[2]?t:0),-b[2],-b[3],{check:false});
    put('iziz_common_manacles',0,b[0]+b[2]*.2+(b[2]?0:t),b[1]+b[3]*.2+(b[2]?t:0),b[2],b[3]);}break;}
  case'entrance':case'passage':{if(R.B.ancient)grid(4,4,1.5,(u,v,i)=>!!put('iziz_ancient_light_column',0,u,v,1,0),4);break;}
  case'beacon':grid(2,2,1,(u,v,i)=>!!put(i%2?'iziz_vern_barrel':'iziz_common_store',0,u,v,1,0),8);break;
  }}
 // the ceiling: chandeliers in a grid by decor; on the Ancient levels nothing (their light strips are the ceiling's)
 function ceiling(c){const s=R.s,d=s.decor;if(c==='ancient'||d<2)return;const key=d>=4?'iziz_court_great_chandelier':d===3?'iziz_court_hanging':'iziz_common_hanging';
  const sp=s.kind==='hall_hangar'?4.4:d>=4?(c==='corridor'?8:6.5):d===3?5:6;if(!has(key))return;const kh=dims(key,0).h;
  const q=R.q,nu=Math.max(1,Math.round((q.u1-q.u0)/sp)),nv=Math.max(1,Math.round((q.v1-q.v0)/sp));let n=0;
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){if(n>=12)return;const u=q.u0+(q.u1-q.u0)*(i+.5)/nu,v=q.v0+(q.v1-q.v0)*(j+.5)/nv;
   if(R.St.spaceAt(u,v)!==s)continue;const cy=s.ceilAt?s.ceilAt(u,v):R.y+R.h;if(cy-kh-.05<R.y+2.3)continue;
   if(put(key,0,u,v,1,0,{check:false,keep:true,y:FR.Y(cy)-kh-.05}))n++;}}
 /* ---------------------------------------------------------------- every room of every building */
 L.buildings.forEach(B=>B.storeys.forEach(St=>St.spaces.forEach(s=>{if(s.gone||s.void||s.stair||!s.rects||!s.rect)return;
  const rects=s.kind==='corridor'?s.rects.filter(r=>(r.u1-r.u0)*(r.v1-r.v0)>=12):[s.rect];
  rects.forEach((q0,ri)=>{const q={u0:q0.u0+.15,u1:q0.u1-.15,v0:q0.v0+.15,v1:q0.v1-.15};const h=(s.ceilY?s.ceilY-St.y:St.h-.4);
   const nu=Math.max(1,Math.ceil((q.u1-q.u0)/CELL)),nv=Math.max(1,Math.ceil((q.v1-q.v0)/CELL));
   R={s,St,B,q,y:St.y,h,grid:{nu,nv,a:new Uint8Array(nu*nv)},n:0,cap:Math.min(240,Math.round(20+(q.u1-q.u0)*(q.v1-q.v0)*.5)),wealth:Math.min(1,s.decor/4),parent:s.recId||null,
    emb:B.id==='embassies'||/Envoy|Embass|Treaty|Interpreter/.test(s.name)};
   R.flat=[];R.why={cap:0,h:0,free:0};(site.gardens||[]).forEach(g=>{if(Math.abs(g.y-St.y)<.3)mark(g.u0-.1,g.u1+.1,g.v0-.1,g.v1+.1,4);});{const g=R.grid;for(let i=0;i<g.nu;i++){const u=q.u0+(i+.5)*CELL;for(let j=0;j<g.nv;j++)if(St.spaceAt(u,q.v0+(j+.5)*CELL)!==s)g.a[i*g.nv+j]=4;}}
   const c=cls(s);S.rooms++;S.byClass[c]=(S.byClass[c]||0)+1;
   try{keepClear();if(s.kind!=='corridor'&&ri===0)middle(c);dressWalls(c);corners(c);ceiling(c);}catch(e){reportErr('palace furnish '+s.id+': '+((e&&e.stack)||e));}
   if(R.n<2&&s.kind!=='corridor'){let bl=0;for(const x of R.grid.a)if(x)bl++;S.empty.push(s.id+' '+s.kind+' '+R.n+' blocked '+(bl/R.grid.a.length).toFixed(2)+' '+JSON.stringify(R.why)+' h'+R.h.toFixed(2));}});})));
 R=null;
 /* ---------------------------------------------------------------- the roof gardens */
 // Each bed of 78s (site.gardens) planted along its long axis about every 2.6 m (1.5 m in a narrow bed): in the wide beds a tall plant on the middle
 // line every third place (palms, dragon trees, tree ferns: so no crown reaches out over the drop) and the low ones either
 // side of it; in the narrow beds the low ones only. Every choice a hash of the bed and the place.
 const PLANTING={palms:{tall:['iziz_palm','voth_park_dragon_tree','iziz_palm','voth_tree_fern'],low:['iziz_fern','yuni_oleander','br_aroid_heliconia','iziz_bush','br_giant_fern']},
  ferns:{tall:['voth_tree_fern','br_aroid_heliconia','iziz_spike'],low:['iziz_fern','br_giant_fern','br_undergrowth_shrub','iziz_bush']},
  flowers:{tall:null,low:['yuni_oleander','iziz_bush','iziz_fern','voth_shrub_cushion','yuni_oleander','voth_succulent_rosette']},
  succulents:{tall:['voth_park_dragon_tree','iziz_spike'],low:['yuni_agave_verge','voth_succulent_paddle','voth_succulent_finger','voth_succulent_barrel','voth_succulent_rosette']}};
 S.plants=0;
 (site.gardens||[]).forEach(g=>{const P=PLANTING[g.plant];if(!P)return;const lu=(g.u1-g.u0)>=(g.v1-g.v0),L2=lu?g.u1-g.u0:g.v1-g.v0,Wd=(lu?g.v1-g.v0:g.u1-g.u0)-.5;
  const reg=REG.find(e=>e.key==='iziz_palace_'+g.id),par=reg&&typeof REG_ID!=='undefined'?REG_ID.get(reg)||null:null,step=Wd<2?1.5:2.6,n=Math.max(1,Math.floor((L2-.8)/step));
  for(let i=0;i<n;i++){const t=(lu?g.u0:g.v0)+.4+(L2-.8)*(i+.5)/n,tall=P.tall&&Wd>=5&&i%3===1,ks=tall?P.tall:P.low;
   const k=pick(ks,g.id,'p'+i);if(!has(k))continue;const d=dims(k,0);
   const across=tall?0:Wd>=3.4?(i%2?1:-1)*Math.max(0,Wd/2-Math.max(d.w,d.d)/2*.6):0;if(!tall&&Math.min(d.w,d.d)*.4>Wd/2+.9)continue;
   const u=lu?t:(g.u0+g.u1)/2+across,v=lu?(g.v0+g.v1)/2+across:t,p=FR.P(u,v),y=FR.Y(g.top),ry=(H(g.id,'r'+i)%628)/100,va=H(g.id,'v'+i)%((E(k).variants)||1);
   if(typeof KTAGS!=='undefined'&&KTAGS.page){const rec={'class':'flora',kind:'plant',key:k,name:E(k).name||k,at:[p[0],y,p[1]],ry,size:[d.w,d.d,d.h],tags:{setting:'outdoor',climate:E(k).climate||null},frag:'95p-palace-furnish.js'};
    if(par)KTAGS.page.child(par,rec);else KTAGS.page.add(Object.assign({prefix:'ixp'},rec));}
   batch.place(k,p[0],y,p[1],ry,{variant:va,seed:H(g.id,k+i)%100000+1,wealth:.8,setting:'outdoor'});S.pieces++;S.plants++;S.byKey[k]=(S.byKey[k]||0)+1;}});
 S.group=new THREE.Group();S.group.name='palace-furniture';S.group.userData.inspectLabel='Furniture (the palace)';scene.add(S.group);
 const g=batch.flush(S.group);g.traverse(m=>{if(!m.isMesh)return;if(typeof KFURN!=='undefined'&&KFURN.linearColours)KFURN.linearColours(m.geometry);m.userData.inspectLabel='furniture (catalog)';m.userData.interiors=true;});
 // the court's finishes (marquetry, brocade, velvet, gold leaf, opus sectile) and pictures (paintings, book spines, vase glazes,
 // sun carpets) from Iziz's pack, as the vernacular's interiors lay them (95i-iziz-interiors.js, 2026-10-19)
 if(typeof courtFinish==='function'){try{S.courtFinishes=courtFinish(g);const D={decals:S.decals,group:S.group};courtDecals(D);S.courtDecals=D.courtDecals||0;}
  catch(e){reportErr('palace court finishes: '+((e&&e.stack)||e));}}
 S.ms=Math.round(performance.now()-t0);report();return S;})();
