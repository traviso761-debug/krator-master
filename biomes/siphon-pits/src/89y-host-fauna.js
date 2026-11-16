// ================================================================= HOST — the hexapods on the page (PLAN.md section 7, S8; kits/fauna fauna-lands.js)
// Each station is a land of FAUNALANDS (registered here, by the page: FAUNALANDS.land), its pool the kits/fauna animals tagged for the biome
// 'siphon-pits' (the `xeno` group) plus its `include`; the plan is KRAND by cell (a tile drawn alone gets the same herds), registered in core/tags
// before it is drawn, then drawn near the camera and animated on the host's clock. Where each role may stand is the station's own rule:
// The Ghaunt-Ox is tagged domestic, so a land takes it by name (`include`), wild or kept.
//   terraces  the Ghaunt-Ox in pairs on the fields round the farmsteads (domestic: included by name)
//   scarp     wild Ghaunt-Ox herds on the fan and the gentle ledges, off the road; a Flenser-Hound now and then on the steep ground
//   pitfloor  wild Ghaunt-Ox grazing the felt under the deck, off the hot ground and the camp; Pipe-Borers at their warrens
//   arete     Flenser-Hounds on the plateau at the pits' rims, where they wait for the trail's stragglers (their lairs: 89s)
// ?fauna=0 none.
const FAUNA=(function(){const Q=new URLSearchParams(location.search),out={land:'siphon-pits.'+SKEY,groups:0,animals:0,drawn:0,byRole:{}};
 if(Q.get('fauna')==='0'||typeof FAUNALANDS==='undefined'||typeof KratorFauna==='undefined'){out.off=true;return out;}
 const LANDS={
  terraces:{include:['ghaunt-ox'],exclude:['flenser-hound','pipe-borer'],density:{grazer:.9,predator:0,flyer:0,water:0},maxGroup:2,
   note:'the farms\' Ghaunt-Ox, yoked in pairs to the stone seed-drills'},
  scarp:{include:['ghaunt-ox'],exclude:['pipe-borer'],weight:{'ghaunt-ox':1},density:{grazer:.35,predator:.06,flyer:0,water:0},maxGroup:12,note:'wild Ghaunt-Ox on the ledges; a flenser now and then'},
  pitfloor:{include:['ghaunt-ox'],exclude:['flenser-hound'],weight:{'ghaunt-ox':2,'pipe-borer':1},density:{grazer:.6,predator:0,flyer:0,water:0},maxGroup:10,note:'wild Ghaunt-Ox on the felt; the Pipe-Borers\' warrens'},
  arete:{exclude:['ghaunt-ox','pipe-borer'],density:{grazer:0,predator:.02,flyer:0,water:0},maxGroup:2,note:'the Flenser-Hounds at the rims: about one a lair (89s: five), alone or a pair'}}[SKEY];
 FAUNALANDS.land(out.land,LANDS);
 const DRYk=(x,z)=>DRY(x,z)>0,slope=SLOPE_AT;
 const pitEdge=(x,z)=>{if(SKEY!=='arete')return false;const s=z<0?-1:1,cz=s*1253,dx=-x,dz=cz-z,L=Math.hypot(dx,dz)||1,px=x+dx/L*30,pz=z+dz/L*30;return terrainH(px,pz)<SITE.base-60;};
 const where={
  terraces:(role,x,z)=>role==='grazer'&&DRYk(x,z)&&slope(x,z)<.25&&PLAN.lot(x,z)>25&&PLAN.lot(x,z)<320,
  scarp:(role,x,z)=>role==='grazer'?slope(x,z)<.4&&L.ROAD.at(x,z).d>15:role==='predator'?slope(x,z)>.25&&slope(x,z)<.55:false,
  pitfloor:(role,x,z)=>role==='grazer'&&FIELD.deck(x,z)>.6&&HEAT_AT(x,z)<42&&FIELD.rock(x,z)<.3&&DRYk(x,z)&&(PLAN.camp?PLAN.camp(x,z)>40:true),
  arete:(role,x,z)=>role==='predator'&&slope(x,z)<.35&&Math.abs(z)>8&&pitEdge(x,z)}[SKEY];
 const cat=FAUNALANDS.catalog(KratorFauna.list().map(e=>KratorFauna.entry(e.key)));
 const plan=FAUNALANDS.plan({world:9800+SITE.zone,land:out.land,catalog:cat,box:[-TERR.R+150,-TERR.R+150,TERR.R-150,TERR.R-150],cell:SKEY==='arete'?250:400,ground:terrainH,where});
 const T=BIO.tagReg();if(T)FAUNALANDS.register(T,plan,{});
 out.groups=plan.groups.length;out.animals=plan.animals.length;out.missing=plan.missing;plan.animals.forEach(a=>{out.byRole[a.role]=(out.byRole[a.role]||0)+1;});
 out.keys=[...new Set(plan.animals.map(a=>a.key))].sort();
 const D=FAUNALANDS.draw(KratorFauna,scene,plan,{err:reportErr}),R2=900*900;out.drawn=D.list.length;
 D.list.forEach(it=>{it.g.userData.inspectLabel=it.a.name+(SKEY==='terraces'?' (a farm\'s yoke)':' (wild)');});
 tick((dt,t)=>{const c=camera.position;for(const it of D.list){const dx=it.a.at[0]-c.x,dz=it.a.at[2]-c.z;it.g.visible=dx*dx+dz*dz<R2;}D.tick(t);});
 out.plan=plan;out.first=plan.groups.length?{x:plan.groups[0].at[0],z:plan.groups[0].at[2]}:null;
 return out;})();
window._fauna={land:FAUNA.land,groups:FAUNA.groups,animals:FAUNA.animals,drawn:FAUNA.drawn,byRole:FAUNA.byRole,keys:FAUNA.keys,missing:FAUNA.missing};
// THE HEIGHT FOG ON WHAT CAME AFTER IT: 89a hooked the scene's materials (ATMOS.heightFogScene) before the sites (89s) and the animals (above)
// were drawn, and a lit material without the hook draws black under the deck. Run again: a material already hooked is skipped (KHOOK.add by name)
if(typeof ATMOS!=='undefined'&&ATMOS.heightFogScene&&ATMOS.U&&ATMOS.U.fogH)window._fauna.hfogLate=ATMOS.heightFogScene(scene);
