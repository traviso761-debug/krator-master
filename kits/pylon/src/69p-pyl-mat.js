// ================================================================= 69p. PYLON: the palette (kits/pylon/PLAN.md section 2)
// The kit draws in the Vernacular's kit items (69b: vPlaster, vStone, vWood, vCorr, vPanelB ...), painted near-grey and
// tinted per instance with vC(hex). Orange is the Vernacular's own (VPAL.orange, VPAL.trim): one orange for the three kits
// (settlements/iziz/VASSAL-KITS.md section 2). The whites sit one value step above the Vernacular's sand plaster.
const PYPAL={
 white:[0xeeebe5,0xece8e0,0xf0ede6],            // Ancient white, and the render that copies it
 cream:[0xe3d9c8,0xe6dccb],                      // weathered white, plaster
 orange:VPAL.orange,                             // the paint: niche linings, canopies, cornice bands, reveals
 trim:VPAL.trim,
 saffron:[0xe3a02e,0xe2a21a],                    // Ancient structure only: fins, buttress legs
 formwork:[0x8e8b86,0x8c8a86,0x96928c],          // board-formed concrete
 slot:[0x2a2b30],                                // dark slots, recesses, glass in shade
 gunmetal:[0x4a5058,0x3a3a3a],                   // pipes, grilles, rails
 rust:[0xb8652a,0xc8701e],                       // salvage tanks and plate
 stoneGrey:[0x9a948a,0xa39d92],                  // plinths
 walnut:[0x6e3a22,0x6a3a22],                     // doors and inside
};

// ---------------------------------------------------------------- materials and kit items (prefix py)
// Board-formed concrete: the Ancients core's concrete map in world units (the shared MAT.concrete has none, so a
// scaled box would stretch it), white so PYPAL.formwork tints it.
MAT.pyConc=MAT.concrete.clone();MAT.pyConc.color.set(0xffffff);vWorldUV(MAT.pyConc,.25);
// a disc: a smooth cylinder whose axis is local z, centred (scale [r, r, depth]); the round ends of the profiles
const PYDISC=new THREE.CylinderGeometry(1,1,1,28).rotateX(Math.PI/2);
// a ring: a torus in the xy plane facing z (scale [r, r, r]); the tube is 12% of the radius: porthole bezels, reused hoops
const PYRING=new THREE.TorusGeometry(1,.12,6,28);
// a half-vault: a solid half-disc prism, the flat on y = 0, axis local z, centred (scale [half-span, rise, length])
const PYHALF=(()=>{const s=new THREE.Shape();s.moveTo(-1,0);s.absarc(0,0,1,Math.PI,0,true);s.lineTo(-1,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:18});g.translate(0,0,-.5);return g;})();
// a hexagonal prism, axis local z, centred, a flat side down (scale [r, r, length]): the honeycomb pods
const PYHEX=new THREE.CylinderGeometry(1,1,1,6).rotateX(Math.PI/2).rotateZ(Math.PI/6);
kdef('pyConc',VBOX,MAT.pyConc);
kdef('pyDisc',PYDISC,MAT.plaster);kdef('pyDiscC',PYDISC,MAT.pyConc);kdef('pyDiscG',PYDISC,MAT.darkGlass);kdef('pyDiscD',PYDISC,MAT.void);kdef('pyDiscR',PYDISC,MAT.rust);
kdef('pyRing',PYRING,MAT.plaster);kdef('pyRingI',PYRING,MAT.iron);
kdef('pyHalf',PYHALF,MAT.plaster);kdef('pyHalfC',PYHALF,MAT.pyConc);
kdef('pyHex',PYHEX,MAT.plaster);kdef('pyHexR',PYHEX,MAT.rust);kdef('pyHexD',PYHEX,MAT.void);kdef('pyHexG',PYHEX,MAT.darkGlass);
// the gable wedge's faces are wound for double-sided roof materials: the void and glass wedges take double-sided copies
MAT.pyVoid=MAT.void.clone();MAT.pyVoid.side=THREE.DoubleSide;MAT.pyGlass=MAT.darkGlass.clone();MAT.pyGlass.side=THREE.DoubleSide;
kdef('pyGableG',VGABLE,MAT.pyGlass);kdef('pyGableD',VGABLE,MAT.pyVoid);kdef('pyGableC',VGABLE,MAT.pyConc);
kdef('pyDomeR',VDOME,MAT.rust);
// a smooth render cylinder standing on y = 0 (scale [r, h, r]): the palace's round pavilions and the dome's drum
kdef('pyCyl',new THREE.CylinderGeometry(1,1,1,36).translate(0,.5,0),MAT.plaster);
// lit glass (MAT.warmPane, the electric window: rich, civic and the Ancients' amber glow), double-sided for the wedges
MAT.pyLit=MAT.warmPane.clone();MAT.pyLit.side=THREE.DoubleSide;kdef('pyDiscL',PYDISC,MAT.pyLit);kdef('pyGableL',VGABLE,MAT.pyLit);

// ---------------------------------------------------------------- the owner's delivery of 2026-10-18 (materials.json, 88yp)
// The hex tile (grey ceramic, a 1.2 m tile, a grey detail map the instance colour tints) on a box: the courts and forecourts
// (pyHexTile, pynHexPave); the hex grille, a cut-out card (alphaTest .5, double-sided, a .8 m tile): a flat panel (pyGrille,
// pynGrille) and a disc for the portholes (pyGrilleD: a disc's uv 0..1 spans its 2r, so K is doubled; same family).
MAT.pyHexTile=MAT.plaster.clone();vWorldUV(MAT.pyHexTile,1/1.2);
const pyCard=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7,metalness:.3,alphaTest:.5,side:THREE.DoubleSide});
MAT.pyGrille=pyCard();vWorldUV(MAT.pyGrille,1/.8);MAT.pyGrilleD=pyCard();vWorldUV(MAT.pyGrilleD,2/.8);
kdef('pyHexTile',VBOX,MAT.pyHexTile);kdef('pyGrille',VPLANE,MAT.pyGrille);kdef('pyGrilleD',new THREE.CircleGeometry(1,24),MAT.pyGrilleD);
