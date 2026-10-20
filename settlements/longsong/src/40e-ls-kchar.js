// ================================================================= LONGSONG — each person as a core/charactermodels record (PLAN.md P5b)
// [G data] Who each of LS.PEOPLE looks like and wears: KCHAR.stranger(seed, kit, people) on the person's own seed, so the
// same person looks the same on every load, in tools/kchar_people.js and in Godot. The Order (the Historians) in its
// standing's set (LSK.TIER: the novice's shirt and skirt; the monk's saffron robe, which the wardens wear too; the
// elder's robe, shawl and crested hat, for the elders, the masters of arms and the keepers; the field agent's coat for
// the operatives); the town in Xanadu's townsfolk dress; the scholars, the traders, the caravan and the pilgrims as
// Xanadu's shares fall (a fifth of them wealthy, turbaned). The body (man or woman) by the seed. The face, the build and
// the ancestry are KCHAR.stranger's draw within the people's ranges (data/peoples.json): that is the randomness.
// The kit is cut to these two peoples (LSK.trimKit; build.py's _kchar cuts the page's copy by the same rule).
const LSK=(function(){const O={};
 O.PEOPLES=['historians','xanadu'];
 O.BEARDS={mpfb_male:['grinsegold_full_beard','wdg_scruffy_beard','grinsegold_moustache','Goatee'],mpfb_female:[]};
 O.ORDER={monk:1,novice:1,elder:1,operative:1,master:1,keeper:1,warden:1};
 O.TIER={monk:'monk',warden:'monk',novice:'novice',elder:'elder',master:'elder',keeper:'elder',operative:'agent',servant:'town',artisan:'town'};
 // the kit as the page holds it: the two peoples' clothes, the hair their styles name, the beards above
 O.trimKit=function(kit,peoples,body){const sty=new Set();peoples.forEach(p=>(p.styles[body.replace(/^mpfb_/,'')]||[]).forEach(x=>sty.add(x)));
  return Object.assign({},kit,{items:kit.items.filter(it=>O.PEOPLES.indexOf(it.culture)>=0||(it.slot==='hair'&&sty.has(it.id))||(it.slot==='beard'&&O.BEARDS[body].indexOf(it.id)>=0))});};
 O.bodyOf=P=>KRAND.unit(KRAND.hash(P.seed,11))<.5?'mpfb_male':'mpfb_female';
 // the record: data = {peoples, bodies:{<body>:{kit}}} (the page's LS_KCHAR)
 O.record=function(P,data){const pid=O.ORDER[P.role]?'historians':'xanadu',b=O.bodyOf(P);let people=data.peoples.find(q=>q.id===pid);
  if(O.TIER[P.role])people=Object.assign({},people,{tiers:[[O.TIER[P.role],1]]});   // a standing draws its tier alone
  const r=KCHAR.stranger(P.seed,data.bodies[b].kit,people);r.seed=P.seed;return r;};
 return O;})();
