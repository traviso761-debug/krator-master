// ================================================================= THE KIT: its identity, its library families, its palette, the set registry
// The Tungang kit (PLAN.md): one kit, three sets on one salvage foundation. Built so far: the Fellgang set (`fg`), the fell
// villages of PLAN.md section 3.3.1 (the Fowlers, the Ice-cutters), keyed and boxed as riftrim's stand-ins. The engine is
// core/engine, read in place; everything that makes this kit its own is here and in 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens (the ice and its packing stay)
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
//   TG           the kit's registry by set: TG.fg (the Fellgang set: its boxes, its host API in 80-fg-host.js)
// The look (PLAN.md sections 1.3, 2.1, 3.3): drystone of the rim's stone under turf on bell-fir poles, low and long; salvage
// LASHED and SPIKED on (Ancient white plate doors on cable hinges, rusted plate patches, fan blades, spikes on the gables), its
// edges raw; slogans daubed over the doors (the union's words kept: NO SKABS). Careful work, tidy houses, paint and pride.
const KIT={id:'tungang',title:'Tungang Kit',pack:'tungang',culture:'fellgang',faction:'Fellgangs',band:'the rim and the fells',
 frag:'kits/tungang',ground:0x6e7454,groundProc:0x5e6646,fog:0xc4ccd0,furnDetail:.6};
/* the library families (materials.json); iron and wood are the engine's door keys (36o-open.js) */
const SV_LIB={stone:'stone',stoneD:'stone',turf:'turf',pole:'pole',wood:'wood',plate:'plate',rust:'rust',scrap:'scrap',paint:'paint',
 tin:'tin',iron:'iron',cable:'iron',rope:'rope',cord:'cord',hide:'hide',fur:'fur',horn:'horn',skull:'skull',tyre:'tyre',ice:'ice',straw:'straw',
 /* single-sided takes of the hide for roofs (a double-sided cloth key self-shadows at a grazing sun) */
 hideW:'hide',
 /* the Glaziers' set (gz, src/62-69): whitewash on the carved fronts, the scarp's hewn basalt, gilt, the carpets, celadon,
    the Register's enamel, potch (the common opal), carved timber, silk */
 wash:'wash',hewn:'hewn',gilt:'gilt',carpet:'carpet',celadon:'celadon',enamel:'enamel',potch:'potch',carved:'carved',silk:'silk'};
const SV_TILE0={stone:2.4,stoneD:1.6,turf:2.2,pole:1.2,wood:1.6,plate:1.4,rust:1.4,scrap:1.6,paint:1.2,tin:1.4,iron:.8,cable:.6,rope:.3,cord:.3,
 hide:1.4,fur:1,horn:.7,skull:.6,tyre:.8,ice:1.2,straw:1,hideW:1.4,
 wash:2,hewn:2.2,gilt:.6,carpet:1.6,celadon:.4,enamel:.8,potch:.6,carved:.8,silk:1.2};
const SV_CLOTH={hide:1,flag:1};
const SV_CUT={stone:1,stoneD:1,turf:1,pole:1,wood:1,plate:1,rust:1,scrap:1,paint:1,tin:1,iron:1,rope:1,cord:1,hide:1,fur:1,horn:1,skull:1,tyre:1,hideW:1,
 flag:1,plain:1,brass:1,bone:1,glass:1,wash:1,hewn:1,gilt:1,carpet:1,celadon:1,enamel:1,potch:1,carved:1,silk:1};
const KIT_FALLBACK=[];
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 /* the rim's stone (grey-brown gneiss and schist, lichen-flecked), the slate of the tallies, the turf (green in summer, brown
    on the north slope), the bell fir's silvered poles, the plank of a door frame */
 stone:[0x8a8274,0x7e786c,0x948c7c,0x857d70],stoneD:[0x5a5650,0x4e4b46],slate:[0x3e4246,0x464a4e,0x383c40],
 turf:[0x8e9c5e,0x86945a,0x98a666,0x7e8c54],turfB:[0x9a8a5e,0x8e7e56],turfG:[0x86a052,0x7e9a4c,0x8ea85a],turfBr:[0xa89064,0x9c8660,0xb09a6c],pole:[0x9a9284,0x8e8678,0xa69e8e],wood:[0x7a6248,0x6e5840,0x846a4e],
 /* the salvage: the Ancients' white plate (old ivory now), rusted plate, scrap, tin; the painted colours of the slogans and
    the family marks (red, ochre, white, black, a blue from signal paint) */
 plate:[0xd8d4c8,0xcec9bc,0xe0dcd0],rust:[0x8a5a3a,0x7e5234,0x946240],scrap:[0x7a7266,0x6e675c],tin:[0x8e8a80,0x84807a],iron:[0x3e3a36,0x46423c],
 red:[0xa8321e,0x9a2c1a],ochre:[0xc8902e,0xbe8628],white:[0xe8e2d4],black:[0x1c1a18],blue:[0x2e5a8a,0x34628e],
 /* the soft goods: hide, fur, horn, skull; rope (lobe-larch bark cordage) and the Ancients' cable */
 hide:[0x8a6a48,0x7e6040,0x96744e],fur:[0x6a5a48,0x5e5040],horn:[0xb8a47c,0xa89470],skull:[0xdcd2b8,0xd0c6aa],
 rope:[0x8a7656,0x7e6c4e,0x947e5c],cable:[0x4a4a48,0x54524e],tyre:[0x2a2826,0x302e2a],
 /* the cold things: the ice blocks, the snow and sawdust they are packed in; fire and the lantern lobelia's faint blue */
 ice:[0xbcdcea,0xc4e2ee,0xb2d4e4],snow:[0xe8eef2,0xdfe6ec],sawdust:[0xc8a878,0xbea070],straw:[0xc8b070,0xbea666],peat:[0x3a2e24,0x32281e],
 ember:[0xff7a2a],flame:[0xffb04a],lobelia:[0x7ab4ff],dark:[0x1c1814]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
/* ---------------------------------------------------------------- the set registry: TG.<set>. 80-fg-host.js fills TG.fg's host API */
/* THE CONTRACT (PLAN.md section 3.3.1, the owner 2026-11-11): riftrim's stand-in keys and boxes, so the Fowlers' and the
   Ice-cutters' stations swap stand-ins for the kit with no layout change. w x d x h in metres, h from the floor to the ridge;
   form is the stand-in's (house, round, shed, pen, barrow). The defs (50-56) declare these boxes and verify.py asserts the
   measured box within 0.5 m of each. */
const TG={version:1,SCALE:.94,sets:{fg:'fellgang',tg:'tungang',gz:'glazier'},fg:{
 BOX:{
  'fg-hut':{w:6,d:5,h:4.2,form:'house',what:'a one-room drystone hut under turf'},
  'fg-house':{w:9,d:6,h:4.8,form:'house',what:'a two-hearth house'},
  'fg-longhouse':{w:15,d:6.5,h:5.2,form:'house',what:'a longhouse (byre at the low end)'},
  'fg-headhouse':{w:13,d:8,h:5.8,form:'house',what:'the head\'s house'},
  'fg-meethall':{w:18,d:10,h:7,form:'house',what:'the meeting hall (the one large room: the meeting, the votes)'},
  'fg-cairnhall':{w:7,d:7,h:6,form:'round',what:'the cairn house (the dead\'s names, the old rules said aloud)'},
  'fg-store':{w:8,d:6,h:4.5,form:'house',what:'the store'},
  'fg-smokehouse':{w:6,d:5,h:4.5,form:'house',what:'the smokehouse'},
  'fg-barn':{w:12,d:7,h:5.5,form:'house',what:'the barn'},
  'fg-ropehouse':{w:20,d:5,h:4,form:'shed',what:'a rope walk and rope house (each family\'s ropes kept and spliced here)'},
  'fg-eggstore':{w:6,d:6,h:4.5,form:'round',what:'an egg and honey store (cool, round, stone)'},
  'fg-pens':{w:14,d:12,h:1.4,form:'pen',what:'drystone pens'},
  'fg-icehouse':{w:12,d:9,h:4.5,form:'barrow',what:'an ice house: a barrow of turf over a stone vault, the blocks packed in sawdust and snow'},
  'fg-sledgeshed':{w:16,d:7,h:4.2,form:'shed',what:'the sledge shed'}}}};
