// ================================================================= STRONGBOW TODAY — the trades census (records)
// The owner (2026-11-11): about 7,000 people in the whole place, half in the arcology up to its third terrace and half in a town of
// rings and spokes round its foot; a budget of trades within the arcology against those in the town; "also give me a trades
// census". settlements/strongbow/PLAN.md sections 6 and 8 are the budget; this is the same budget trade by trade, with its
// workplaces, the buildings that hold them and the households, so core/simulation can take it as roles and workplaces later.
//
// [G data]: no three.js, no DOM. Plain records keyed by stable ids (sb.trade.<id>). Every number is a proposal for the owner to
// correct; test-census.js checks the sums against the plan. `in` is the arcology (the foot, the lower and middle Spine, the
// galleries), `out` the town; `per` is the workers a workplace holds; `where` names the arcology's rooms or the town's ring;
// `keys` are the scrap Xanadu set's buildings (kits/xanadu, PLAN-SCRAP.md) the trade works in, or a room in the arcology's layout.
const SB_CENSUS={version:1,
 // the people (PLAN.md section 6): the Sultan's census, and the two peoples outside it
 people:{arcology:{foot:900,lowerSpine:1400,middleSpine:800,face:100},upperSpine:200,order:100,town:3500,
  household:5,children:.35,elders:.07},
 sectors:[
  {id:'salvage',name:'Salvage',budget:[380,60]},{id:'caravan',name:'Caravans',budget:[160,175]},{id:'trade',name:'Trade',budget:[220,120]},
  {id:'hullcraft',name:'Crafts from the hull',budget:[240,60]},{id:'craft',name:'Other crafts',budget:[40,200]},
  {id:'food',name:'Food',budget:[70,80]},{id:'farm',name:'Farming and herding',budget:[90,570]},{id:'build',name:'Building',budget:[40,120]},
  {id:'guard',name:'The garrison and the watch',budget:[150,55]},{id:'govern',name:'Government',budget:[50,20]},
  {id:'lift',name:'The lift crews',budget:[122,0]},{id:'care',name:'Care',budget:[30,40]},{id:'faith',name:'Faith',budget:[10,15]},
  {id:'fuel',name:'Fuel',budget:[0,60]}],
 trades:[
  // salvage: the Salvagers' Guild quarries the hull (the upper Spine under the outcasts' eye, the fallen lower hull, the foot's dead floors)
  {id:'cutter',sector:'salvage',name:'hull cutters',in:160,out:60,per:10,where:'the salvagers\' yards in the foot\'s east wing; the quarry on the fallen lower hull',keys:['xa_scrap_guild_salvage']},
  {id:'hauler',sector:'salvage',name:'haulers and sorters',in:120,out:0,per:12,where:'the salvagers\' yards; the lift heads',keys:['xa_scrap_store']},
  {id:'glasspuller',sector:'salvage',name:'glass pullers',in:60,out:0,per:6,where:'the upper Spine\'s working faces (by lift L3)',keys:[]},
  {id:'guildclerk',sector:'salvage',name:'the guild\'s clerks and licence keepers',in:40,out:0,per:20,where:'the Salvagers\' Guildhall in the east wing',keys:['xa_scrap_guild_salvage']},
  // caravans: the valley road from Longsong ends on the plaza (the line is abandoned)
  {id:'seraikeeper',sector:'caravan',name:'serai keepers and grooms',in:90,out:0,per:30,where:'the terminus serai, built over the hall\'s ruin',keys:['xa_scrap_serai']},
  {id:'porter',sector:'caravan',name:'porters',in:70,out:0,per:35,where:'the plaza and the lobby',keys:[]},
  {id:'drover',sector:'caravan',name:'drovers and carters',in:0,out:100,per:5,where:'the road spoke; the outer ring\'s yards',keys:['xa_scrap_silos']},
  {id:'innkeeper',sector:'caravan',name:'innkeepers',in:0,out:50,per:10,where:'the road spoke',keys:['xa_scrap_court']},
  {id:'lipyard',sector:'caravan',name:'stablemen at the lip',in:0,out:25,per:25,where:'the Sultanate\'s caravan yard at the lip, where the valley road from Longsong ends',keys:['xa_scrap_serai']},
  // trade
  {id:'stallkeeper',sector:'trade',name:'the bazaar\'s stallkeepers',in:150,out:0,per:2,where:'the lobby\'s floor and galleries',keys:[]},
  {id:'changer',sector:'trade',name:'money changers',in:30,out:0,per:2,where:'the lobby\'s first gallery',keys:[]},
  {id:'merchant',sector:'trade',name:'merchants of the guild',in:40,out:0,per:4,where:'the Merchants\' Guildhall on the plaza',keys:['xa_scrap_guild_hall']},
  {id:'shopkeeper',sector:'trade',name:'shopkeepers',in:0,out:100,per:2,where:'the Girder Arcades on the road spoke and the middle ring',keys:['xa_scrap_bazaar']},
  {id:'pedlar',sector:'trade',name:'pedlars',in:0,out:20,per:1,where:'the rings',keys:[]},
  // crafts from the hull: what the salvagers cut, worked into the town's goods
  {id:'glazier',sector:'hullcraft',name:'glaziers',in:80,out:20,per:5,where:'the lower Spine\'s workshop floors',keys:[]},
  {id:'panelwright',sector:'hullcraft',name:'panel-cutters and fitters',in:70,out:20,per:5,where:'the lower Spine; sheds on the quarry spoke',keys:[]},
  {id:'bronzesmith',sector:'hullcraft',name:'bronze-smiths',in:50,out:10,per:4,where:'the foot\'s east wing',keys:[]},
  {id:'cablemaker',sector:'hullcraft',name:'cable-makers',in:40,out:10,per:5,where:'the lower Spine',keys:[]},
  // other crafts
  {id:'smith',sector:'craft',name:'blacksmiths',in:10,out:40,per:4,where:'the middle ring',keys:[]},
  {id:'potter',sector:'craft',name:'potters',in:0,out:30,per:3,where:'the outer ring',keys:[]},
  {id:'weaver',sector:'craft',name:'weavers and felters (wool, yak hair)',in:20,out:60,per:3,where:'the middle ring; the drums',keys:[]},
  {id:'tanner',sector:'craft',name:'tanners',in:0,out:25,per:5,where:'the outer ring, downwind',keys:[]},
  {id:'dyer',sector:'craft',name:'dyers',in:0,out:15,per:3,where:'the middle ring',keys:[]},
  {id:'carpenter',sector:'craft',name:'carpenters',in:10,out:30,per:3,where:'the middle ring',keys:[]},
  // food
  {id:'miller',sector:'food',name:'millers',in:0,out:15,per:3,where:'the fields spoke',keys:[]},
  {id:'baker',sector:'food',name:'bakers',in:20,out:25,per:3,where:'the lower Spine; the middle ring',keys:[]},
  {id:'brewer',sector:'food',name:'brewers (barley beer)',in:10,out:15,per:3,where:'the middle ring',keys:[]},
  {id:'butcher',sector:'food',name:'butchers',in:10,out:15,per:2,where:'the middle ring; the lobby',keys:[]},
  {id:'cook',sector:'food',name:'cookshops',in:30,out:10,per:2,where:'the lobby\'s galleries; the road spoke',keys:[]},
  // farming and herding at 2,568 m: barley, peas, roots; yak and sheep
  {id:'gardener',sector:'farm',name:'terrace gardeners',in:90,out:0,per:6,where:'the second and third terraces',keys:[]},
  {id:'farmer',sector:'farm',name:'farmers (crops owed: the foot\'s climate on the scarp)',in:0,out:300,per:4,where:'the fields beyond the rings',keys:['xa_scrap_farm']},
  {id:'herder',sector:'farm',name:'herders (beasts owed: the foot\'s climate)',in:0,out:220,per:5,where:'the scarp\'s pastures',keys:['xa_scrap_farm']},
  {id:'fodder',sector:'farm',name:'fodder cutters',in:0,out:50,per:5,where:'the fields spoke',keys:['xa_scrap_granary']},
  // building
  {id:'scrapbuilder',sector:'build',name:'scrap builders',in:30,out:90,per:6,where:'yards on the quarry spoke',keys:[]},
  {id:'mason',sector:'build',name:'masons',in:10,out:30,per:5,where:'yards on the quarry spoke',keys:[]},
  // the garrison and the watch
  {id:'soldier',sector:'guard',name:'the Sultan\'s garrison',in:150,out:0,per:150,where:'the barracks in the foot\'s west wing; the guard on lift L3',keys:['xa_scrap_gate']},
  {id:'watch',sector:'guard',name:'the town watch and the lip\'s guard',in:0,out:55,per:10,where:'the watch towers on the rings; the toll post at the lip',keys:['xa_scrap_tower','xa_scrap_gate']},
  // government
  {id:'governor',sector:'govern',name:'the governor\'s household and officials',in:15,out:0,per:15,where:'the west wing',keys:[]},
  {id:'customs',sector:'govern',name:'customs (the elevator\'s tolls)',in:25,out:0,per:25,where:'the serai\'s gate on the plaza; the lobby\'s lift hall',keys:[]},
  {id:'lippost',sector:'govern',name:'the toll post at the lip',in:0,out:10,per:10,where:'the Sultanate\'s post at the lip',keys:['xa_scrap_gate']},
  {id:'scribe',sector:'govern',name:'scribes',in:10,out:0,per:2,where:'the lobby\'s first gallery',keys:[]},
  {id:'headman',sector:'govern',name:'the town headmen\'s clerks',in:0,out:10,per:5,where:'the inner ring',keys:[]},
  // the lifts and bridges (PLAN.md section 5): with the wall lifts, the elevator between Xanadu and the Oidong Valley
  {id:'capstan',sector:'lift',name:'capstan crews',in:110,out:0,per:14,where:'the capstan houses of L1 to L3 and the wall lifts W1 to W5 (the elevator to the lip)',keys:[]},
  {id:'bridgewarden',sector:'lift',name:'bridge wardens',in:12,out:0,per:6,where:'the girder bridges to the east galleries',keys:['xa_scrap_bridge']},
  // care
  {id:'healer',sector:'care',name:'healers',in:10,out:15,per:3,where:'the lower Spine; the inner ring',keys:[]},
  {id:'teacher',sector:'care',name:'teachers',in:10,out:15,per:3,where:'the drums; the shrine schools',keys:[]},
  {id:'bath',sector:'care',name:'bath attendants',in:10,out:10,per:10,where:'the bathhouse on the inner ring; the cistern pavilion',keys:['xa_scrap_bath','xa_scrap_pavilion']},
  // faith (the Decree)
  {id:'priest',sector:'faith',name:'priests of the Decree',in:10,out:15,per:5,where:'the Wheel shrines on the plaza and in the town',keys:['xa_scrap_shrine']},
  // fuel
  {id:'dung',sector:'fuel',name:'dung and charcoal gatherers',in:0,out:40,per:4,where:'the outer ring',keys:[]},
  {id:'woodcarter',sector:'fuel',name:'wood carters',in:0,out:20,per:4,where:'the fields spoke',keys:[]}],
 // the two peoples outside the Sultan's census (PLAN.md section 2, the owner's answers)
 others:[
  {id:'order',name:'the Order of History Monks',people:100,where:'the tower\'s upper storeys and the crown; the Nock',
   work:[{name:'archivists and scholars',n:60},{name:'the balloon and signal crews on the Nock',n:12},{name:'the house\'s keepers',n:28}]},
  {id:'outcasts',name:'the outcasts of the upper Spine',people:200,where:'the soundest drums above the third terrace; their rope ways',
   work:[{name:'scavengers (salvage traded down at night)',n:60},{name:'gardeners of the wild terraces',n:20},{name:'rope-way keepers',n:10}]}]};

// sums the census: workers, workplaces and households in the arcology and in the town; the Sultan's people by age
SB_CENSUS.tally=function(C){C=C||SB_CENSUS;const P=C.people,A=P.arcology,t={in:0,out:0,places:{in:0,out:0},bySector:{}};
 for(const s of C.sectors)t.bySector[s.id]={in:0,out:0};
 for(const r of C.trades){t.in+=r.in;t.out+=r.out;t.places.in+=r.in?Math.ceil(r.in/r.per):0;t.places.out+=r.out?Math.ceil(r.out/r.per):0;
  t.bySector[r.sector].in+=r.in;t.bySector[r.sector].out+=r.out;}
 const arc=A.foot+A.lowerSpine+A.middleSpine+A.face,sultan=arc+P.town;
 t.people={arcology:arc,town:P.town,sultan,all:sultan+P.upperSpine+P.order};
 t.households={arcology:Math.round(arc/P.household),town:Math.round(P.town/P.household)};
 t.ages={children:Math.round(sultan*P.children),elders:Math.round(sultan*P.elders)};
 t.ages.adults=sultan-t.ages.children-t.ages.elders;t.workers=t.in+t.out;t.idleAdults=t.ages.adults-t.workers;
 return t;};
