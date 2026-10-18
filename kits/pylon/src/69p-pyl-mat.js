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
