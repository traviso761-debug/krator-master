// ================================================================= PINNACLE ROCK — the Beast Riders' table (S4, S7)
// [G data] core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phases S4 and S7 (the owner, 2026-11-11). The culture table of the
// Beast Riders as Pinnacle Rock and its bands live it, read by core/camp (50-camp-beasts.js: the beasts' rules; 60: the
// world tick) and core/region's valley host (50-region-valley.js), as Longsong's table (settlements/longsong/src/15-ls-tune.js)
// is read:
//   PR_TUNE.beasts     every mount kind of kits/beast-riders BR_CAMP (one row a tribe: its `beast`, its size) and the kept
//                      herd: body mass, diet, pack and pace; the appetite by diet (kg a day per kg^0.75: a predator of a
//                      raptor's 300 kg eats ~4 kg of meat a day); and the owner's LOW-GRAVITY PAYOFF: every appetite cut by
//                      a third (lowG 2/3: the raptor's ~4 kg is ~2.7). The meat-eaters eat both the wild hunt and the kept
//                      herds (the owner's answer 3): `meatFrom`. The kept herd's species is not named in the lore yet: it is
//                      a jungle browser of ~80 kg here, a row to rename when it is
var PR_TUNE=(function(){'use strict';
const T={};
T.beasts={lowG:2/3,
 appetite:{meat:.055,graze:.12,litter:.08,browse:.11},
 eats:{meat:'meat',graze:'fodder',litter:'fodder',browse:'fodder'},
 graze:['graze','litter','browse'],
 meatFrom:{hunt:.6,herd:.4},
 /* mass (kg) from BR_CAMP's size (length, height) and the animal it is; pack: kg carried besides the rider (the grazers and
    the crawler are the bands' draught and pack beasts); pace: km a day on a road, with rests */
 rows:{
  raptor:{beast:'ridge-raptor',mass:300,diet:'meat',pack:40,pace:45,mount:true},
  tiger:{beast:'arena-tiger',mass:420,diet:'meat',pack:40,pace:40,mount:true},
  spider:{beast:'giant-spider',mass:280,diet:'meat',pack:60,pace:30,mount:true},
  dragonfly:{beast:'giant-dragonfly',mass:70,diet:'meat',pack:10,pace:90,mount:true},
  quetzal:{beast:'quetzalcoatlus',mass:250,diet:'meat',pack:30,pace:120,mount:true},
  wingclaw:{beast:'giant-archaeopteryx',mass:180,diet:'meat',pack:25,pace:110,mount:true},
  nightwing:{beast:'giant-bat',mass:45,diet:'meat',pack:8,pace:100,mount:true},
  threehorn:{beast:'tricorn',mass:2000,diet:'graze',pack:350,pace:22,mount:true},
  hardshell:{beast:null,mass:1500,diet:'graze',pack:260,pace:15,mount:true},
  mammoth:{beast:null,mass:6000,diet:'graze',pack:900,pace:25,mount:true},
  staghorn:{beast:'staghorn-beetle',mass:250,diet:'litter',pack:120,pace:25,mount:true},
  longcrawler:{beast:'draught-millipede',mass:500,diet:'litter',pack:300,pace:20,mount:true},
  herd:{beast:null,mass:80,diet:'browse',pack:0,pace:20,offtake:.35}},
 herd:{kind:'herd'}};
return T;})();
