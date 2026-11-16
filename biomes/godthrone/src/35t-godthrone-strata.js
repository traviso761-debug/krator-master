// ================================================================= GODTHRONE — its strata recipes beyond core's (KSTRATA.add)
// kits/resources/ROCK-PROPOSAL.md, "Where the biomes must change", 3 (tuff aprons): the Godthrone's DOWNWIND (south-east) flanks
// show pale ash beds and ignimbrite benches in their strata; the upwind flanks are bare flows (core's `tibasalt`). The summit's
// fountains and ash storms carried their glass and ash south-east on the prevailing wind: each eruption's ash a pale parting
// between the flows, the big ones welded into a buff ignimbrite that stands as a bench. Under the dry-cold line the ash alters as
// the beads do (palagonite). The stations downwind take `tibasalt-ash`: the high flank (2), the Red Gill (7), the Red ladder (8),
// the bloodfalls (6). Data only ([G data]).
(function(){const T=KSTRATA.recipe('tibasalt'),K={};for(const k in T.kinds)K[k]=Object.assign({},T.kinds[k]);
 K.flow.p=.5;K.bead.p=.13;K.beadblack.p=.08;
 K.ash={p:.12,th:[.3,3],col:[0xcfc3a8,0xd9cfb6,0xc4b79a],hard:.2,xbed:0,varnish:0,between:true};
 K.ignimbrite={p:.06,th:[2,12],col:[0xb8a080,0xc4ab88,0xa99272],hard:.7,xbed:0,varnish:0};
 KSTRATA.add({name:'tibasalt-ash',main:'flow',kinds:K,alter:[{kinds:['bead','beadblack','ash'],to:'palagonite',below:8500,band:400}],fx:Object.assign({},T.fx)});})();
// The orange belt's palagonite (PLAN.md section 4, "Palagonite ridges"; the orange belt station 3, the Red ladder station 8): under the
// dry-cold line the old glassy deposits (hyaloclastite: bead sand and glass shards from eruptions under the ice, pillow lavas in them)
// turned to palagonite, ochre to rust-orange and soft, the odd black pillow lens and a hard basalt sill. Its own beds are thin and
// soft, so the ledge pass makes knife-edged ridges and gullies of it, not ledges. Data only.
KSTRATA.add({name:'palagonite-tuff',main:'palag',kinds:{
 palag:{p:.55,th:[.5,6],col:[0xb8862f,0xc69a45,0xa8742a,0xb07a34],hard:.25,xbed:0,varnish:0},
 rust:{p:.16,th:[.3,3],col:[0x9a5a26,0x8e4e22,0xa5622c],hard:.3,xbed:0,varnish:0},
 shard:{p:.14,th:[.2,2],col:[0xcfa45a,0xd8b068],hard:.2,xbed:0,varnish:0,between:true},
 pillow:{p:.1,th:[1,5],col:[0x2a2622,0x332d28],hard:.8,xbed:0,varnish:0},
 sill:{p:.05,th:[2,8],col:[0x1e1d1f,0x25232a],hard:.95,xbed:0,varnish:0}},fx:{}});
