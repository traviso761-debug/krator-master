// ================================================================= GODSTEP — the redlands' ground classes and the steppe's shrubs (station 4)
// PLAN.md sections 2, 3 and 4: the hot steppe's pale red-tan ground and its stony pavement, the relict LATERITE hardpan (red gravel on the
// breakaways' caps and the plateau), the pale KAOLIN slopes under them, the old lake's SILT and strandlines, the SALT crust of the pan.
// THE SHRUBS are the sedesert kit's (read in place: biomes/sedesert's floor, its zones from the host's fields), on the steppe and the
// slopes; none on the pan (its `abyss` field); its salt-tolerant ones (the saltbush, dry grass, a stone) in a ring round the pan's edge
// (its `oasis` field: the floor's oasis mix is this page's salt-edge mix, a table the kit publishes as data, SEDESERT.FLOOR_MIX).
Object.assign(GSTEP.GROUND,{
 steppe:{col:0xa27e60,k:.85,name:'The hot steppe\'s red-tan ground (step 4, Vourdostepos)'},
 pavement:{col:0x6e5444,k:.55,name:'Stony pavement (the steppe\'s gravel, varnished)'},
 laterite:{col:0x8a4428,k:.8,name:'Laterite hardpan (relict: the breakaways\' red cap, ironstone gravel)'},
 kaolin:{col:0xddd2bf,k:.8,name:'Kaolin (the pale gullied slopes under the breakaways)'},
 silt:{col:0xcfc2ac,k:.8,name:'The old lake\'s pale silt and its strandlines'},
 pan:{col:0xf3f1ea,k:.98,name:'The salt crust (the playa: polygon-cracked white)'}});
GSTEP.CLASSES.push('steppe','pavement','laterite','kaolin','silt','pan');   /* 'pan' the salt crust (the field of the same name) */
{const ga=GSTEP.groundAt;GSTEP.groundAt=function(x,z,o){o=ga(x,z,o);const F=BIO.host.fields;
 /* the steppe's ground under everything that is not the stair's basalt: where the laterite profile is the surface (its classes' sum) */
 o.steppe=Math.min(1,(F.laterite?F.laterite(x,z):0)*2+(F.kaolin?F.kaolin(x,z):0)+(F.pavement?F.pavement(x,z):0)*1.4)*(1-o.pan);o.path=0;return o;};}   /* no procession's way here (45b lends its field to the steppe) */
GSTEP.PASSES.push({name:'redlands',fn(R,q,box){const F=BIO.host.fields,MIX=SEDESERT.FLOOR_MIX;if(!SEDESERT.buildFloor||!MIX)return{};
 /* the salt edge's mix: the saltbush, dry grass and a stone, taken from the kit's own rows (its scrub's saltbush, its dune's grass and stone) */
 MIX.oasis=[[.62,MIX.scrub[3][1]],[.28,MIX.dune[0][1]],[.10,MIX.dune[1][1]]];
 /* no creosote: its near tier (rods in the kit's bucket, its cards on their tips) fails core's one-LOD-key audit on this page (2 of 61 tall
    cards reach past their rods' range); left out of the steppe's and the rim's mixes here until the sedesert kit's turn (KNOWN_ISSUES.md) */
 MIX.scrub[2][0]=0;MIX.rim[0][0]=0;
 /* at .6 of the page's quality: the kit's own floor is drawn for a 3 km map at 1, this one is 9.6 km */
 let edge=0;const put0=BIO.put;BIO.put=function(n,p){if(F.edge(p[0],p[2])>.3)edge++;return put0.apply(this,arguments);};
 let st;try{BIO.cur='desert/floor';st=SEDESERT.buildFloor(R,q*.6);}finally{BIO.put=put0;}st=st&&st.under||st||{};
 return{shrubs:st.shrubs,tufts:st.tufts,hummocks:st.hummocks,rosettes:st.rosettes,cacti:st.cacti,desertStones:st.stones,desertBoulders:st.boulders,edge};}});
