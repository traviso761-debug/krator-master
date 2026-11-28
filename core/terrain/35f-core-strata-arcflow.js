// ================================================================= CORE — strata: Arcflow ophiolite & Baltic-Klint kukersite recipes  [G data]
// Opt-in extension to KSTRATA (35-core-strata.js) for biomes/arcflow and northern Arch-foredeep stations, keeping pages that
// load 35-core-strata.js alone byte-identical (same pattern as 35e-core-strata-skarn.js and 39b2-core-speleo-cleft.js).
// Plain maths of (x, y, z): no THREE, no DOM, no Math.random, no Math.sin/cos/exp. Tested by node core/terrain/test-strata-arcflow.js.
//
//   'arch-ophiolite'   waxy dark blue-green sheared lizardite/antigorite serpentinite laced with snow-white chrysotile &
//                      magnesite mesh-veins, vivid apple-green garnierite nickel-silicate lenses, and rhythmic jet-black
//                      chromitite (Cr-Fe-PGE), bronze orthopyroxenite, and bone-white anorthosite cumulate beds
//   'klint-kukersite'  columnar arch-rift-basalt & serpentinite caprock overhanging golden-tan kerogen oil-shale (kukersite),
//                      dark merevaik amber-lignite seams, and soft recessed slate-blue glauconitic clay (carving the 35-80 m
//                      undercut horseshoe waterfall scarp of the Southern Kulaneva-Klint)
//   'klint-foredeep'   the lower foredeep oil-shale, amber-lignite, and glauconitic blue-clay package on its own, for stacking
//                      under an 'arch-rift-basalt' or 'arch-ophiolite' cap formation in KSTRATA.create({formations:[...]})
(function(root){
  'use strict';
  var KS=root.KSTRATA;
  if(!KS||!KS.create||!KS.add)throw new Error('core/terrain 35f-core-strata-arcflow.js: load 35-core-strata.js first (KSTRATA)');
  if(KS.RECIPES['arch-ophiolite']&&KS.RECIPES['klint-kukersite'])return;

  var RECS=[
    {
      name:'arch-ophiolite',
      main:'serpentinite',
      noRepeat:true,
      kinds:{
        serpentinite:{p:0.34,th:[2.0,6.0],col:[0x21382d,0x294437,0x1b2e25],hard:0.68,xbed:0.22,varnish:0.20,jit:0.05},
        harzburgite:{p:0.16,th:[2.4,6.8],col:[0x333c2a,0x3d4732,0x2b3324],hard:0.88,xbed:0.15,varnish:0.25,jit:0.05},
        chromitite:{p:0.14,th:[0.35,1.35],col:[0x16171b,0x1e2026,0x121317],hard:0.96,xbed:0.10,varnish:0.15,irid:1,jit:0.03},
        pyroxenite:{p:0.12,th:[0.8,2.6],col:[0x5c4a32,0x68543a,0x4f3f2b],hard:0.90,xbed:0.20,varnish:0.20,jit:0.04},
        anorthosite:{p:0.12,th:[0.4,1.5],col:[0xe4dfd4,0xede8de,0xd8d2c6],hard:0.86,xbed:0.15,varnish:0.12,jit:0.03},
        chrysotile:{p:0.07,th:[0.12,0.45],col:[0xebeef0,0xdde3e6,0xf2f4f5],hard:0.36,xbed:0.0,varnish:0.08,between:true,jit:0.03},
        garnierite:{p:0.05,th:[0.18,0.65],col:[0x469e54,0x54b062,0x3b8a48],hard:0.42,xbed:0.0,varnish:0.10,between:true,jit:0.05}
      },
      fx:{sheen:1,joints:1,varnish:0.20,xbed:0.20}
    },
    {
      name:'klint-kukersite',
      main:'kukersite',
      noRepeat:true,
      kinds:{
        basaltcap:{p:0.26,th:[3.5,8.5],col:[0x20232a,0x282c34,0x1c1f25],hard:0.94,xbed:0.10,varnish:0.18,jit:0.04},
        kukersite:{p:0.32,th:[1.4,4.2],col:[0xba8c42,0xc89b4f,0xad7f38],hard:0.30,xbed:0.35,varnish:0.12,jit:0.05},
        glauconite:{p:0.24,th:[1.2,3.8],col:[0x526875,0x465b68,0x5f7684],hard:0.14,xbed:0.08,varnish:0.05,jit:0.04},
        amberlignite:{p:0.10,th:[0.22,0.85],col:[0x4a2e1a,0x5c3920,0x3b2415],hard:0.24,xbed:0.0,varnish:0.15,between:true,jit:0.05},
        serplens:{p:0.08,th:[0.45,1.6],col:[0x243b30,0x2e483b,0x1d3027],hard:0.62,xbed:0.18,varnish:0.15,between:true,jit:0.04}
      },
      fx:{columns:1,sheen:0.75,xbed:0.30,varnish:0.15,regolith:0.45,wash:1.4}
    },
    {
      name:'klint-foredeep',
      main:'kukersite',
      noRepeat:true,
      kinds:{
        kukersite:{p:0.44,th:[1.2,3.8],col:[0xba8c42,0xc89b4f,0xad7f38],hard:0.30,xbed:0.35,varnish:0.12,jit:0.05},
        glauconite:{p:0.36,th:[1.4,4.4],col:[0x526875,0x465b68,0x5f7684],hard:0.14,xbed:0.08,varnish:0.05,jit:0.04},
        amberlignite:{p:0.12,th:[0.20,0.80],col:[0x4a2e1a,0x5c3920,0x3b2415],hard:0.22,xbed:0.0,varnish:0.15,between:true,jit:0.05},
        marl:{p:0.08,th:[0.35,1.2],col:[0xd4ccb6,0xc8bfa8],hard:0.38,xbed:0.0,varnish:0.08,between:true,jit:0.03}
      },
      fx:{xbed:0.30,varnish:0.10,regolith:0.55,wash:1.6}
    }
  ];

  for(var i=0;i<RECS.length;i++){
    if(!KS.RECIPES[RECS[i].name])KS.add(RECS[i]);
  }
})(typeof window!=='undefined'?window:globalThis);
