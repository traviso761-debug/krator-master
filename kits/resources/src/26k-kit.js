// ================================================================= THE KIT: its identity and palette
// The Resources kit (2026-10-15): world content that is no culture's: the ore nodes (iron, copper, gold in three grades) the
// building kits' mines work. It runs on the Scyvoi kit's engine, read IN PLACE from kits/scyvoi/src (build.py), so any kit on
// that engine (kits/islanders, the nomads, Zeijani) reads its fragments in place the same way. Everything that is this kit's
// own is here, in 42r-res-ore.js (the rule, [G data]) and 44r-res-nodes.js (the nodes).
//   KIT          ids, names, the ground and fog colours
//   SV_LIB       MAT key -> pack family (materials.json): the boulder rock and the packed earth; the veins are vertex colours
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
const KIT={id:'resources',title:'Resources Kit',pack:'resources',culture:'generic',faction:'none',band:'none',
 frag:'kits/resources',ground:0x8a8a6e,groundProc:0x7e7e62,fog:0xccd2d0,furnDetail:.6};
const SV_LIB={stone:'stone',earth:'earth',sand:'sand',sulphur:'sulphur',coal:'coal',tar:'tar',efflor:'efflor',malachite:'malachite',quartz:'quartz',cassiterite:'cassiterite',galena:'galena',gossan:'gossan',pegmatite:'pegmatite',wood:'wood',rope:'rope',iron:'iron'};   /* stone and earth are library sets (materials.json); the rest draw flat */
const SV_TILE0={stone:2.6,earth:3,sand:4,sulphur:1.6,coal:1.5,tar:3,efflor:2,malachite:1.5,quartz:1.5,cassiterite:1.5,galena:1.5,gossan:2,pegmatite:1.5,wood:1.6,rope:.3,iron:.8};
const SV_CLOTH={flag:1};
const SV_CUT={};
const KIT_FALLBACK=[];
const SVPAL={
 stone:[0x8e8a80,0x86827a,0x969288,0x7e7a72],stoneD:[0x5e5a54,0x56524c],earth:[0x8a6a4a,0x7a5c40],
 wood:[0x7a5a3a,0x6e5034],woodD:[0x3a2a20,0x32241a],rope:[0xa08050,0x94764a],iron:[0x3a3632,0x2e2a26],brass:[0xc89a3a,0xb88a2e],
 flame:[0xffb04a],ember:[0xff6a1a]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
