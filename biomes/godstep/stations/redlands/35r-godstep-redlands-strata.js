// ================================================================= GODSTEP — the redlands' rock: the relict laterite profile (KSTRATA.add)  [G data]
// PLAN.md section 2, "Laterite": step 4 is hot steppe now, too dry to make laterite, so its red breakaways are RELICT: the flows' oldest
// surface, weathered when the country was wetter, left standing as hardpan cliffs over pale kaolinite slopes (Western Australia's
// breakaways over their salt lakes, refs/05). The profile from the top: the HARDPAN (ferricrete: red, with dark pisolite bands; hard, so
// the ledge pass stands it as a cliff), the MOTTLED ZONE and the pale KAOLIN (the pallid zone: soft, gullied), then the old basalt flows
// (godstep-ponded, 35g) under it all. Two recipes beside core's; data only.
KSTRATA.add({name:'godstep-hardpan',main:'hardpan',kinds:{
 hardpan:{p:.72,th:[.6,2.4],col:[0x8e3a22,0xa0482a,0x7e321e,0x94401f],hard:.92,xbed:0,varnish:.15},
 pisolite:{p:.28,th:[.2,.8],col:[0x5a2616,0x6a2e1a,0x4e2214],hard:.8,xbed:0,varnish:.1,between:true}},fx:{}});
KSTRATA.add({name:'godstep-kaolin',main:'kaolin',kinds:{
 kaolin:{p:.6,th:[.8,4],col:[0xe6ddcc,0xdcd0bc,0xeee6d8],hard:.12,xbed:0,varnish:0},
 mottled:{p:.4,th:[.4,2.5],col:[0xd6a07e,0xc88a68,0xe0b898],hard:.18,xbed:0,varnish:0}},fx:{}});
