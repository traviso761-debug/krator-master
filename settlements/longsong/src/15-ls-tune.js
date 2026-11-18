// ================================================================= LONGSONG — the valley's economy: the Xanadu highland table (S2, S3)
// [G data] core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phases S2 and S3 (the owner, 2026-11-11). The culture table of
// the Xanadu highlands as Longsong's valley lives it, and the valley it builds for core/region's valley host
// (core/region/50-region-valley.js, H.simValley) from the open world's plan of the ring and the Order's houses (LS.RING, or
// openworld/oidong-highrift/plan/sites.json in node):
//   LS_TUNE.goods        every good, its unit (kg unless named), the crops behind the grain (kits/crops' ids, as 40b sows)
//   LS_TUNE.diet         what a person eats a day, by the kind of settlement (the house: a fifth of its food dairy, the
//                        valley folk's tsampa, the herders' butter tea, the rift's high diet: a third dairy)
//   LS_TUNE.farm         a farming household's year (the proposal's arithmetic: 1.5 ha in crop, 1.3 t/ha, a sixth kept
//                        for seed), the tithe (two thirds of the surplus), the yield on milder ground
//   LS_TUNE.herd         the dzo and yak: dairy an animal a day, by the season; the summer pasture's window
//   LS_TUNE.crafts       the Order's crafts: LIGHT CRAFTS FOR UPKEEP (the smithy mending tools from caravan iron, the
//                        bindery) and RELIC WORK (the lens house's crystal lenses, the reliquaries in gold and crystal),
//                        the scriptorium's books; NO HEAVY INDUSTRY (the owner, 2026-11-11): no smelter, furnace, foundry
//                        or mill heavier than Dar-ling's paper mill. LS_TUNE.heavy lists the kinds that may not appear
//   LS_TUNE.calendar     the year (core/clock's), its windows: the harvest at 2,000 m in late summer, the rift's later
//                        one, the summer pasture, the silk's season, the saffron's
//   LS_TUNE.caravan      the Xanadu caravan (monthly in each direction): salt, iron, tea and gold in; books, paper, silk,
//                        saffron and lenses out; never grain (568 km: the beasts would eat it)
//   LS_TUNE.fealty       the grant of fealty and the grants of esteem (the owner's answer 4): a fixed yearly bill each way,
//                        never priced, never answering scarcity
//   LS_TUNE.valley(P, o) the valley spec: P the region's plan (sites.json's shape), o {scale, ring (a subset of the
//                        ring's ids, for a negative)}
var LS_TUNE=(function(){'use strict';
const T={};
T.goods={grain:{unit:'kg',crops:['frostoat','emmer','basin-amaranth','helix-bean']},dairy:{unit:'kg'},wool:{unit:'kg'},salt:{unit:'kg'},
 iron:{unit:'kg'},tea:{unit:'kg'},gold:{unit:'kg'},tools:{unit:'kg'},paper:{unit:'kg'},silk:{unit:'kg'},saffron:{unit:'kg'},
 books:{unit:'volume'},lenses:{unit:'lens'},crystal:{unit:'kg'},sulfur:{unit:'kg'},coppersalt:{unit:'kg'},reliquaries:{unit:'piece'}};
const D=1/365;   /* a year's kilos a day */
T.diet={house:{grain:180*.8*D,dairy:180*.2*D,salt:5*D,tea:2*D,tools:.4*D},
 village:{grain:165*D,salt:5*D,tea:1*D,tools:.4*D},
 herders:{grain:110*D,dairy:70*D,salt:6*D,tea:2*D,tools:.3*D},
 rift:{grain:120*D,dairy:62*D,salt:5*D,tea:2*D,tools:.4*D},
 hospice:{grain:180*D,salt:5*D,tea:2*D,tools:.4*D}};
T.farm={inCropHa:1.5,yieldTHa:1.3,seed:1/6,tithe:2/3,startDays:140};
T.herd={dairyKgDay:.32,summer:1.4,winter:.6,ringAnimals:380,beckAnimals:400};   /* the herds sized to the diets' dairy (2026-11-12: a
   three-year run left Longsong a fifth short of its dairy with 300 head a village, the gjar short with 280 yaks) */
T.crafts={
 scriptorium:{kind:'scriptorium',name:'the scriptorium (copying the register)',crew:120,batch:{in:{paper:2},out:{books:1},hours:350}},
 lenshouse:{kind:'lens-house',name:'the lens house (grinding the gjar\'s crystal)',crew:30,batch:{in:{crystal:1},out:{lenses:3},hours:40}},
 relics:{kind:'relic-works',name:'the relic works (reliquaries in gilt and crystal)',crew:12,batch:{in:{gold:.05,crystal:.4},out:{reliquaries:1},hours:300}},
 smithy:{kind:'smithy',name:'the smithy (tools mended from the caravan\'s iron)',crew:16,batch:{in:{iron:1},out:{tools:1},hours:3}}};
T.heavy=['smelter','furnace','foundry','forge-works','ironworks','mill-heavy'];
T.calendar={windows:{harvest:[15,45],'rift-harvest':[25,50],'summer-pasture':[290,60],silk:[300,30],saffron:[60,80]}};
T.caravan={market:'xanadu-market',minutes:23*1440,carriers:2,stagger:15*1440,cap:4500,
 in:['salt','iron','tea','gold'],out:['books','paper','silk','saffron','lenses'],
 expect:{books:.12,paper:4,silk:.8,saffron:.02,lenses:.6},need:{iron:9,gold:.02,salt:130,tea:34},pool:{salt:1e6,iron:1e5,tea:1e5,gold:500}};
T.fealty={bill:{books:30,paper:400,silk:80,saffron:4,lenses:20},esteem:{gold:6,silk:40,tea:300},day:200,esteemDay:230};   /* after the harvest and the saffron (year days ~94 and ~124) */
/* the grain a farming household makes a year, net of seed (kg) */
T.netKgHH=k=>T.farm.inCropHa*T.farm.yieldTHa*1000*(1-T.farm.seed)*(k==null?1:k);
T.valley=function(P,o){o=o||{};const K=o.scale==null?10:o.scale,yr=365,win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const site=id=>P.sites.find(s=>s.id===id),L=site('sq80bzd7ep');
 /* a work's rate: its year's make over its crew's working hours in its window (12 an actor-day), the crew rounded as the
    host rounds it, so a year makes what the arithmetic says */
 const rate=(kgYr,crew,days)=>kgYr/(Math.max(1,Math.round(crew/K))*K*(days==null?yr:days)*12);
 const eats=(kind,n)=>{const d=T.diet[kind],o={};for(const g in d)o[g]=d[g];return o;};
 const S=[],R=[],ring=L.hamlets.filter(V=>!o.ring||o.ring.indexOf(V.id.split('/').pop())>=0);
 const farmV=(V,k,id,parent,win0)=>{const hh=V.census.households,made=hh*T.netKgHH(k),crew=Math.round(V.census.pop*.45);
  const own=V.census.pop*T.diet.village.grain*yr,share=Math.max(0,Math.min(.9,(made-own)*T.farm.tithe/made));
  S.push({id,name:V.name,faction:'order',parent,people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('village'),
   start:{grain:Math.round(own*T.farm.startDays/yr*1.15),salt:200,tea:40,tools:40},
   works:[{id:id+'.fields',kind:'farmstead',name:'the fields',crew,out:['grain'],rate:rate(made,crew,win(win0)),season:win0}]});
  return {made,share};};
 const herdV=(V,id,parent,animals)=>{const crew=Math.round(V.census.pop*.45),kgDay=T.herd.dairyKgDay;
  S.push({id,name:V.name,faction:'order',parent,people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('herders'),
   start:{grain:Math.round(V.census.pop*T.diet.herders.grain*T.farm.startDays),dairy:800,salt:200,tea:60,tools:30},
   works:[{id:id+'.byre',kind:'byre',name:'the byres',crew,herd:{out:['dairy'],rate:kgDay/24,animals,seasonRate:{summer:T.herd.summer,winter:T.herd.winter}},
    pasture:{id:id+'.pasture',window:'summer-pasture'}}]});};
 /* THE HOUSE: Longsong, the Order's 1,344; its own fields (about a tenth of its grain: 40b's), its crafts, its saffron */
 S.push({id:'sq80bzd7ep',name:'Longsong',faction:'order',people:1344,x:L.x,z:L.z,eats:eats('house'),keepDays:60,
  start:{grain:110000,dairy:6000,salt:3000,tea:900,tools:400,paper:900,crystal:120,gold:3,iron:300,books:20,lenses:10},
  works:[{id:'ls.granary',kind:'granary',name:'the house\'s fields and granary',crew:100,out:['grain'],rate:rate(24000,100,win('harvest')),season:'harvest'},
   {id:'ls.saffron',kind:'saffron-garden',name:'the saffron terraces',crew:20,out:['saffron'],rate:rate(24,20,win('saffron')),season:'saffron'}]
   .concat(Object.keys(T.crafts).map(k=>Object.assign({id:'ls.'+k},T.crafts[k])))});
 /* THE RING: twelve farming villages, two of herders, Dar-ling's silk and paper; a tithe road each */
 ring.forEach(V=>{const id=V.id.replace(/\//g,'.');
  if(V.focus==='farming'){const f=farmV(V,1,id,'sq80bzd7ep','harvest');R.push({id:'tithe.'+id,from:id,to:'sq80bzd7ep',minutes:Math.round(V.site&&Math.hypot(V.site.x-L.x,V.site.z-L.z)/1000*12*60/4)+120,cap:40000,share:{[id]:{grain:f.share}},goods:{sq80bzd7ep:['salt','tea','tools']}});}
  else if(V.focus==='ranch'){herdV(V,id,'sq80bzd7ep',T.herd.ringAnimals);R.push({id:'tithe.'+id,from:id,to:'sq80bzd7ep',minutes:240,cap:20000,share:{[id]:{dairy:.62}},goods:{sq80bzd7ep:['grain','salt','tea','tools']}});}
  else if(V.focus==='silk'){const crew=Math.round(V.census.pop*.45);
   S.push({id,name:V.name,faction:'order',parent:'sq80bzd7ep',people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('village'),
    start:{grain:Math.round(V.census.pop*T.diet.village.grain*60),salt:150,tea:30,tools:30},
    works:[{id:id+'.mill',kind:'paper-mill',name:'the paper mill (bamboo and chalice grass)',crew:Math.round(crew*.6),out:['paper'],rate:rate(5200,Math.round(crew*.6))},
     {id:id+'.silk',kind:'silk-house',name:'the mulberry and the reeling house',crew:Math.round(crew*.4),out:['silk'],rate:rate(700,Math.round(crew*.4),win('silk')),season:'silk'}]});
   R.push({id:'tithe.'+id,from:id,to:'sq80bzd7ep',minutes:300,cap:10000,share:{[id]:{paper:.9,silk:.9}},goods:{sq80bzd7ep:['grain','salt','tea','tools']}});}});
 /* THE ORDER'S HOUSES IN THE HIGH RIFT */
 const G=site('ssinggjar01'),M=site('smirrorgrange01'),Cl=site('scaldronhouse01'),part=(St,id)=>St.hamlets.find(h=>h.id.endsWith('/'+id));
 const gh=part(G,'house'),bf=part(G,'beck-fields'),vc=part(G,'vein-camp');
 S.push({id:'ssinggjar01',name:'The Singing Gjar',faction:'order',parent:'sq80bzd7ep',people:gh.census.pop,x:G.x,z:G.z,eats:eats('rift'),keepDays:25,
  start:{grain:Math.round(gh.census.pop*T.diet.rift.grain*150),dairy:3000,salt:600,tea:200,tools:80},
  works:[{id:'gj.listening',kind:'listening-hall',name:'the listening hall and its scribes',crew:120,out:['paper'],rate:0},
   {id:'gj.bindery',kind:'bindery',name:'the bindery (upkeep)',crew:6,batch:{in:{paper:1},out:{books:.2},hours:30}}]});
 farmV(bf,1,'gj.beck','ssinggjar01','rift-harvest');
 const BF=S[S.length-1];BF.eats=eats('rift');BF.works[0].crew=Math.round(bf.census.pop*.6);BF.works[0].rate=rate(bf.census.households*T.netKgHH(.75)*1.9,BF.works[0].crew,win('rift-harvest'));
 BF.works.push({id:'gj.beck.yaks',kind:'byre',name:'the yak herd on the plateau\'s tussock',crew:10,herd:{out:['dairy'],rate:T.herd.dairyKgDay/24,animals:T.herd.beckAnimals,seasonRate:{summer:T.herd.summer,winter:T.herd.winter}},
  pasture:{id:'gj.beck.pasture',window:'summer-pasture'}});
 /* the beck's tithe: its surplus over its own table, as the ring's (2026-11-12: a fixed .78 starved the fields once they grew to 180) */
 const bfMade=bf.census.households*T.netKgHH(.75)*1.9,bfOwn=bf.census.pop*T.diet.rift.grain*365,bfShare=Math.max(0,Math.min(.85,(bfMade-bfOwn)*.95/bfMade));
 R.push({id:'tithe.gj.beck',from:'gj.beck',to:'ssinggjar01',minutes:240,cap:30000,share:{'gj.beck':{grain:bfShare,dairy:.6}},goods:{ssinggjar01:['salt','tea','tools']}});
 S.push({id:'gj.vein',name:vc.name,faction:'order',parent:'ssinggjar01',people:vc.census.pop,x:vc.site.x,z:vc.site.z,eats:eats('rift'),
  start:{grain:Math.round(vc.census.pop*T.diet.rift.grain*90),dairy:500,salt:100,tea:30,tools:30},
  works:[{id:'gj.vein.adits',kind:'adit',name:'the dead fissures (optical quartz, chalcedony)',crew:24,out:['crystal'],rate:rate(420,24)},
   {id:'gj.vein.sinter',kind:'sorting-shed',name:'the vent\'s sinter (sulfur, copper salts)',crew:10,out:['sulfur','coppersalt'],rate:rate(3000,10)}]});
 R.push({id:'road.gj.vein',from:'gj.vein',to:'ssinggjar01',minutes:180,cap:5000,share:{'gj.vein':{crystal:1}},goods:{ssinggjar01:['grain','dairy','salt','tea','tools']}});
 const mh=part(M,'house'),mg=part(M,'growers'),mr=part(M,'herders');
 S.push({id:'smirrorgrange01',name:'The Mirror Grange',faction:'order',parent:'ssinggjar01',people:mh.census.pop,x:M.x,z:M.z,eats:eats('house'),keepDays:20,
  start:{grain:Math.round(mh.census.pop*T.diet.house.grain*150),dairy:600,salt:150,tea:40,tools:20},
  works:[{id:'mg.store',kind:'granary',name:'the grange\'s granary and seed store',crew:10,out:[],rate:0}]});
 const fg=farmV(mg,1.3,'mg.growers','smirrorgrange01','harvest');S[S.length-1].works[0].rate=rate(mg.census.households*T.netKgHH(1.3),S[S.length-1].works[0].crew,win('harvest'));
 R.push({id:'tithe.mg.growers',from:'mg.growers',to:'smirrorgrange01',minutes:120,cap:30000,share:{'mg.growers':{grain:Math.min(.6,fg.share*1.6)}},goods:{smirrorgrange01:['salt','tea','tools']}});
 herdV(mr,'mg.herders','smirrorgrange01',260);
 R.push({id:'tithe.mg.herders',from:'mg.herders',to:'smirrorgrange01',minutes:150,cap:20000,share:{'mg.herders':{dairy:.35}},goods:{smirrorgrange01:['grain','salt','tea','tools']}});
 const ch=part(Cl,'house'),cs=part(Cl,'shelf');
 S.push({id:'scaldronhouse01',name:'The Caldron House',faction:'order',parent:'sq80bzd7ep',people:ch.census.pop,x:Cl.x,z:Cl.z,eats:eats('hospice'),keepDays:20,
  start:{grain:Math.round(ch.census.pop*T.diet.hospice.grain*150),salt:100,tea:40,tools:20},works:[{id:'cl.store',kind:'granary',name:'the hospice\'s store',crew:6,out:[],rate:0}]});
 const fc=farmV(cs,1.1,'cl.shelf','scaldronhouse01','harvest');
 R.push({id:'tithe.cl.shelf',from:'cl.shelf',to:'scaldronhouse01',minutes:120,cap:20000,share:{'cl.shelf':{grain:Math.min(.6,fc.share*1.5)}},goods:{scaldronhouse01:['salt','tea','tools']}});
 /* the Order's road: the grange's grain up to the gjar, the gjar's crystal down to Longsong, Longsong's books and salt out */
 R.push({id:'order.grange-gjar',from:'smirrorgrange01',to:'ssinggjar01',minutes:Math.round(284/25*1440),cap:20000,keep:20,want:30,goods:{smirrorgrange01:['grain','dairy'],ssinggjar01:['grain','sulfur','coppersalt']}});   /* grain both ways: whichever house has the surplus feeds the other */
 R.push({id:'order.gjar-longsong',from:'ssinggjar01',to:'sq80bzd7ep',minutes:Math.round(777/25*1440),cap:3000,keep:0,want:70,goods:{ssinggjar01:['crystal'],sq80bzd7ep:['books','salt','tea','tools']},expect:{sq80bzd7ep:{crystal:1.2},ssinggjar01:{salt:9,tea:3,tools:1}}});   /* the crystal the gjar holds (the Vein Camp's), for the lens house's want: not a tithe (the gjar makes none itself) */
 R.push({id:'order.longsong-caldron',from:'sq80bzd7ep',to:'scaldronhouse01',minutes:Math.round(356/25*1440),cap:4000,carriers:2,stagger:7*1440,want:30,goods:{sq80bzd7ep:['grain','salt','tea','tools']},
  expect:{scaldronhouse01:{grain:190,salt:16,tea:5,tools:1.6}}});   /* a relay house asks for its dependants too: the shelf village and the grange's three */
 /* the valley's grain up the beck road (2026-11-12: Longsong's tithe outruns its table, the Order's houses in the rift went
    short from the second year): Longsong sends the Caldron House what it wants, and the Caldron House the grange */
 R.push({id:'order.caldron-grange',from:'scaldronhouse01',to:'smirrorgrange01',minutes:Math.round(137/25*1440),cap:4000,carriers:2,stagger:3*1440,want:15,goods:{scaldronhouse01:['grain','salt','tea','tools']},
  expect:{smirrorgrange01:{grain:100,salt:9,tea:3,tools:1}}});
 /* THE XANADU MARKET (off the map: the caravan's far end, Qiblai's bazaar) and the caravan */
 const C=T.caravan;
 S.push({id:C.market,name:'The Xanadu market (Qiblai, off the map)',faction:'xanadu',people:0,x:L.x-568000,z:L.z,eats:{},keepDays:0,start:Object.assign({},C.pool),
  works:[{id:'xm.bazaar',kind:'bazaar',name:'the bazaar',crew:0,out:[],rate:0}]});
 /* want: the days of use a load fills the far end to (the host's default, twice its 3 import days, is a week: on a road whose
    carriers come every three weeks the far end starves between them; 2026-11-12) */
 R.push({id:'caravan',from:'sq80bzd7ep',to:C.market,minutes:C.minutes,carriers:C.carriers,stagger:C.stagger,cap:C.cap,keep:60,want:35,
  goods:{sq80bzd7ep:C.out,[C.market]:C.in},expect:{[C.market]:C.expect,sq80bzd7ep:C.need}});   /* the house's planned use of iron and gold (a batch that waits on its input books no shortage, so it shows no want) */
 return{seed:20261111,scale:K,start:0,calendar:T.calendar,goods:T.goods,
  factions:[{id:'order',name:'The History Monks (the Order of Longsong)'},{id:'xanadu',name:'The Sultanate of Xanadu'}],
  relations:[{a:'order',b:'xanadu',stance:'friendly'},{a:'xanadu',b:'order',stance:'friendly'}],
  settlements:S,roads:R,
  transfers:[{id:'fealty',from:'sq80bzd7ep',to:C.market,goods:T.fealty.bill,first:T.fealty.day,every:365},
   {id:'esteem',from:C.market,to:'sq80bzd7ep',goods:T.fealty.esteem,first:T.fealty.esteemDay,every:365}]};};
return T;})();
