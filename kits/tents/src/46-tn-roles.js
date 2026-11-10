// prefix: tn
// ================================================================= THE ROLES: the gear outside, the rooms inside, the tags
// A tent's role (core/camp's: family, sleeping, chief, council, workshop by trade, supply, trade, guard, mess, stable, latrine)
// does not change its form; it changes what stands round it and what it is furnished with. Both come from the catalog
// (kits/catalog) in the dress's furniture culture, with fallbacks:
//   tnGearKey(cands)            the first catalog key that exists of cands, '{c}' the dress's furniture culture and '{t}'
//                               its trade-set prefix (the Beast Riders' is 'br'); null when none does
//   TN_GEAR[role | trade]       the pieces outside: [{k: cands, at: [dx, dz] (dz from the front of the cover, out), ry, v}]
//   tnGear(role, trade, zf)     places them through FURNISH (core/furnish), in the def's frame
//   tnTags(role, trade, D)      the record's core/tags (culture from the dress, types and job from the role)
//   tnInterior(key, role, trade, D) the rooms of kits/interiors/sets/tents.js at this placement, the role's room kind and the
//                               dress's culture, every piece registered in core/tags as the tent's child before it is drawn,
//                               the floors and walls into core/walk (KWALK); the summary lands on the def's record
const TN_GEAR={
 smith:[{k:['{t}_trade_trough','generic_trade_trough'],at:[1.6,1.1],ry:PI},{k:['{t}_trade_grindstone','generic_trade_grindstone'],at:[2.9,1.6],ry:PI*.8},
  {k:['{t}_trade_anvil','generic_trade_anvil'],at:[-1.7,1.4],ry:PI}],
 hide:[{k:['{c}_hide_frame','nomad_hide_frame','scyvoi_hide_frame'],at:[1.7,1.2],ry:PI},{k:['{c}_hide_frame','nomad_hide_frame','scyvoi_hide_frame'],at:[3.1,1.0],ry:PI*.85},
  {k:['{c}_tanning_vat','nomad_tanning_vat','scyvoi_tanning_vat','{t}_trade_vat','generic_trade_vat'],at:[-1.7,1.4],ry:PI},
  {k:['{c}_works_meat_rack','nomad_works_meat_rack','scyvoi_works_meat_rack','ashnomad_works_meat_rack'],at:[-3,1.2],ry:PI,v:1}],
 seer:[{k:['{c}_spirit_pole','scyvoi_spirit_pole'],at:[1.5,1.0],ry:PI},{k:['{c}_herb_bundles','ashnomad_herb_bundles','scyvoi_herb_bundles'],at:[-1.5,.9],ry:PI},
  {k:['{c}_incense_burner','nomad_incense_burner'],at:[1.5,2.1],ry:PI}],
 weaver:[{k:['{c}_ground_loom','nomad_ground_loom','{c}_common_loom','scyvoi_common_loom'],at:[2,1.6],ry:PI}],
 chief:[{k:['{c}_fire_pit','scyvoi_fire_pit','ashnomad_fire_pit'],at:[-2,1.8],ry:0},{k:['{c}_tying_post','scyvoi_tying_post','nomad_hobble_post','nomad_tying_stone'],at:[2.2,1.4],ry:PI}],
 family:[{k:['{c}_water_jars','nomad_water_jars','{c}_water_gourds','ashnomad_water_gourds','{c}_water_skins','scyvoi_water_skins'],at:[1.3,.8],ry:PI},
  {k:['{c}_works_churn','nomad_works_churn','scyvoi_works_churn'],at:[-1.4,.9],ry:PI}],
 supply:[{k:['{c}_supply_bales','scyvoi_supply_bales','nomad_supply_bales','ashnomad_supply_bales'],at:[1.7,1.0],ry:PI},
  {k:['{c}_grain_sacks','nomad_grain_sacks'],at:[-1.7,1.0],ry:PI}],
 trade:[{k:['{t}_trade_display','generic_trade_display'],at:[-.75,-1.6],ry:0,under:true},{k:['{t}_trade_display','generic_trade_display'],at:[.85,-1.6],ry:0,v:1,under:true}],
 guard:[{k:['{t}_trade_weapon_rack','generic_trade_weapon_rack'],at:[1.3,.8],ry:PI},{k:['{c}_training_training_dummy','generic_training_training_dummy'],at:[2.6,1.8],ry:PI}],
 mess:[{k:['{c}_fire_pit','scyvoi_fire_pit','ashnomad_fire_pit'],at:[2.4,1.7],ry:0},{k:['{c}_water_jars','nomad_water_jars','{c}_water_gourds','ashnomad_water_gourds'],at:[-1.6,.9],ry:PI}],
 stable:[{k:['{t}_trade_hayrack','generic_trade_hayrack'],at:[0,-2.1],ry:0,under:true},{k:['{t}_trade_trough','generic_trade_trough'],at:[-1.2,-.4],ry:PI/2,under:true},
  {k:['{c}_tying_post','scyvoi_tying_post','nomad_hobble_post','nomad_tying_stone'],at:[1.6,.9],ry:PI}],
 sleeping:[],council:[],latrine:[],workshop:[]
};
function tnGearKey(cands){const D=TN_CUR.dress,c=D.furn,t=c==='beast-rider'?'br':c;
 for(const k0 of cands){const k=k0.replace('{c}',c).replace('{t}',t);if(KratorFurniture.has(k))return k;}return null;}
function tnGear(role,trade,zf){const L=(trade&&TN_GEAR[trade])||TN_GEAR[role]||[];let n=0;
 for(const g of L){const k=tnGearKey(g.k);if(!k)continue;const x=g.at[0],z=g.under?g.at[1]:zf+g.at[1];
  if(FURNISH(k,x,tnGroundY(x,z),z,g.ry==null?0:g.ry,{v:g.v|0,setting:'outdoor'}))n++;}
 return n;}
function tnTags(role,trade,D,form){const R=TN_ROLES[role]||TN_ROLES.family,T=trade&&TN_TRADES[trade],w=tnWealthOf(role,D);
 const t={culture:D.culture,types:(T&&T.types)||R.types,role:trade?role+':'+trade:role,style:TN_FORMS[form].style,wealth:w<.35?'poor':w<.7?'middle':'rich'};
 const job=(T&&T.job)||R.job;if(job)t.job=job;return t;}
/* the furniture wealth a role keeps (the catalog's tiers: poor < .35 < common < .7 < court), moved by the dress */
const TN_WEALTH={chief:.85,council:.72,trade:.6,family:.5,supply:.45,workshop:.45,mess:.45,sleeping:.35,guard:.3,stable:.3,latrine:.2};
function tnWealthOf(role,D){let w=TN_WEALTH[role]==null?.45:TN_WEALTH[role];if(D.key==='postapoc'||D.key==='generic')w-=.15;if(D.key==='xanadu')w+=.1;return clamp(w,.12,.95);}
/* the interior: the set's room for this def, as the role's kind, in the dress's furniture culture */
const TN_INTERIORS=[];
function tnInterior(key,role,trade,D){if(PLACE_DRY||GTARGET!==GB||!CURREC||typeof KratorInteriors==='undefined')return null;
 const IX=KratorInteriors,set=IX.sets.byName.tents;if(!set||!IX.TENTS)return null;const base=set.byKey[key];if(!base||base.skip)return null;
 const R=TN_ROLES[role]||TN_ROLES.family,T=trade&&TN_TRADES[trade],kind=T?T.kind:R.kind;if(!kind)return null;
 const rec=CURREC,item=IX.TENTS.item(key,{kind,culture:D.furn,wealth:tnWealthOf(role,D)});
 const seed=KRAND.hash(0x7e57,Math.round(rec.x*10),Math.round(rec.z*10),TN_KEYS.indexOf(key));
 const inst=IX.sets.instantiate(item,rec.x,rec.z,rec.ry,{baseY:rec.y,prefix:'tn.'+rec.tid+'.',register:false,seed,walk:typeof KWALK!=='undefined'?KWALK:null});
 const plans={},missing=[];let pieces=0;
 for(const Rm of inst.rooms){const P=furnishRoom(Rm,SVF.adapter,{seed});plans[Rm.id]=P;
  for(const m of P.report.missing)missing.push(m.need);
  for(const p of P.placements){const t=SVTAGS.child(rec.tid,{'class':'furniture',kind:p.type||null,key:p.key,name:p.key,at:[p.x,p.y,p.z],ry:p.ry,size:[p.w,p.d,p.h],
    tags:{culture:p.culture,setting:'indoor',room:Rm.kind},note:'interior: kits/interiors/sets/tents.js',frag:'kits/interiors'});p.tid=t.id;pieces++;}
  IX.buildRoom(P,SVF.adapter,Rm);}
 const res=IX.sets.auditResidence(inst,plans);
 const sum={key,role,trade:trade||null,kind,culture:D.furn,rooms:inst.rooms.length,pieces,missing,residence:res.residence,fails:res.fails,walkTag:'built:'+inst.id,
  floors:inst.walkRecords?inst.walkRecords.floors|0:0};
 rec.interior=sum;TN_INTERIORS.push(Object.assign({tid:rec.tid,x:rec.x,z:rec.z,ry:rec.ry,y:rec.y},sum));
 return sum;}
