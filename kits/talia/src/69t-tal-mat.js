// ================================================================= 69t. TALIA: the palette (kits/talia/PLAN.md section 2)
// The kit draws in the Vernacular's kit items (69b: vPlaster, vStone, vWood, vIron, vCopperB ...), painted near-grey and
// tinted per instance with vC(hex), plus its own (prefix ta) below. Orange is the Vernacular's own (VPAL.orange,
// VPAL.trim): one orange for the three kits (settlements/iziz/VASSAL-KITS.md section 2). The whites sit one value step
// above the Vernacular's sand plaster. Gilt only on rich and civic work (the owner, 2026-10-17); never on poor or middle.
const TAPAL={
 white:[0xf4f1ea,0xf2efe6,0xf6f3ec,0xf1ede4],     // lime white: the wash of the housing, the marble's cream cousin
 marble:[0xe8dcc6,0xece2cf,0xe4d8c2],             // marble cream: columns, civic and rich walls
 orange:VPAL.orange,                              // the accent: arch bands, reveals, doors, vaults, stair treads
 trim:VPAL.trim,
 burnt:[0xd2601e,0xc85a1c,0xd8682a],              // burnt orange: the orange quarter's render, deep reveals
 tile:[0xc0583a,0xb8523a,0xc66040],               // terracotta: hip roofs, ribbed domes
 ochre:[0xdda23a,0xd69a34],                       // civic ground storeys
 gilt:[0xd9a040,0xe0a848,0xd09a3a],               // capitals, collars, ribs, finials: rich and civic only
 cobalt:[0x2f5fb8,0x2a56a8],                      // temple glass
 iron:[0x2a2624,0x302a26],                        // rails
 walnut:[0x6e3a22,0x6a3a22,0x7a4428],             // door leaves, shutters on the rich
 stone:[0xd6d0c4,0xcfc9bc],                       // steps, plinths: a pale grey stone
};

// ---------------------------------------------------------------- materials and kit items (prefix ta)
// marble: the plaster map at a lower roughness (a faint sheen) tinted cream; no library set yet (KNOWN_ISSUES.md)
MAT.taMarble=MAT.plaster.clone();MAT.taMarble.roughness=.6;vWorldUV(MAT.taMarble,.5);
// gilt: a bare metal, tinted TAPAL.gilt; the only metal that shines on the sheet
MAT.taGilt=new THREE.MeshStandardMaterial({color:0xffffff,metalness:.85,roughness:.32});
// tile: the shingle map (its courses read as tiles at this scale) tinted terracotta, on domes, hips and cones
MAT.taTile=MAT.shingle.clone();vWorldUV(MAT.taTile,.5);
// cobalt glass: a deep blue pane with a little metal in it
MAT.taCobalt=new THREE.MeshStandardMaterial({color:0x2f5fb8,metalness:.35,roughness:.3});
// the lit pane and the glass, double-sided, for the pointed wedges
MAT.taLit=MAT.warmPane.clone();MAT.taLit.side=THREE.DoubleSide;MAT.taGlass=MAT.darkGlass.clone();MAT.taGlass.side=THREE.DoubleSide;
MAT.taVoid=MAT.void.clone();MAT.taVoid.side=THREE.DoubleSide;
// a disc: a smooth cylinder whose axis is local z, centred (scale [r, r, depth]); the round head of an arch, a medallion
const TADISC=new THREE.CylinderGeometry(1,1,1,28).rotateX(Math.PI/2);
// (arch bands are boxes in segments: tanArcBand in 69u, so a band keeps its width on any span)
// a quarter arc from +x to +y: a dome's rib, turned about y by its meridian
const TARIB=new THREE.TorusGeometry(1,.05,6,10,Math.PI/2);
// a flat ring (torus in the xz plane, facing up): mosaic ring medallions, column collars (scale [r, r, r]; tube 10%)
const TARING=new THREE.TorusGeometry(1,.1,6,28).rotateX(Math.PI/2);
// the column shaft: a lathe with entasis, base at y = 0, height 1, radius 1 at the foot and .82 at the neck
const TACOL=new THREE.LatheGeometry([[1,0],[1,.05],[.98,.2],[1,.38],[.97,.6],[.9,.82],[.83,.97],[.82,1]].map(p=>new THREE.Vector2(p[0],p[1])),14);
// a baluster: a vase on a plinth, base at y = 0, height 1, its widest .34
const TABAL=new THREE.LatheGeometry([[.3,0],[.3,.07],[.13,.09],[.13,.24],[.3,.4],[.34,.52],[.3,.64],[.16,.8],[.17,.92],[.3,.94],[.3,1]].map(p=>new THREE.Vector2(p[0],p[1])),8);
// an echinus: a flared drum, base at y = 0 (a Doric capital, a column base upside down)
const TAECH=new THREE.CylinderGeometry(1,.78,1,14).translate(0,.5,0);
// a bell: a Corinthian capital's core, flaring wider (top radius 1.3, bottom .8), base at y = 0
const TABELL=new THREE.CylinderGeometry(1.3,.8,1,14).translate(0,.5,0);
// an egg dome: the hemisphere drawn taller and pinched toward the top (a lathe), base at y = 0, radius 1, height 1
const TAEGG=new THREE.LatheGeometry([[0,1],[.3,.97],[.56,.88],[.78,.74],[.92,.56],[1,.36],[1,.12],[.98,0]].map(p=>new THREE.Vector2(p[0],p[1])),20);
// an onion: a bulb that necks in under its point, base at y = 0, radius 1 at the belly, height 1
const TAONION=new THREE.LatheGeometry([[0,1],[.08,.94],[.3,.84],[.62,.72],[.9,.56],[1,.4],[.94,.22],[.78,.08],[.7,0]].map(p=>new THREE.Vector2(p[0],p[1])),16);
// a tile cone: the turret's roof (base at y = 0)
const TACONE=new THREE.ConeGeometry(1,1,16).translate(0,.5,0);
// a barrel vault: the upper half of a cylinder lying along z, open below (its springing at y = 0), radius 1, length 1
const TAVAULT=new THREE.CylinderGeometry(1,1,1,20,1,true,0,Math.PI).rotateZ(Math.PI/2).rotateY(Math.PI/2);
kdef('taMarble',VBOX,MAT.taMarble);kdef('taGilt',VBOX,MAT.taGilt);kdef('taTileB',VBOX,MAT.taTile);kdef('taCobalt',VBOX,MAT.taCobalt);
kdef('taDisc',TADISC,MAT.plaster);kdef('taDiscM',TADISC,MAT.taMarble);kdef('taDiscD',TADISC,MAT.void);kdef('taDiscG',TADISC,MAT.darkGlass);kdef('taDiscL',TADISC,MAT.warmPane);kdef('taDiscC',TADISC,MAT.taCobalt);kdef('taDiscGi',TADISC,MAT.taGilt);
kdef('taRib',TARIB,MAT.plaster);kdef('taRibGi',TARIB,MAT.taGilt);kdef('taRibCu',TARIB,MAT.verdigris);
kdef('taRing',TARING,MAT.plaster);kdef('taRingGi',TARING,MAT.taGilt);kdef('taRingM',TARING,MAT.taMarble);
kdef('taCol',TACOL,MAT.taMarble);kdef('taColP',TACOL,MAT.plaster);kdef('taBaluster',TABAL,MAT.taMarble);kdef('taBalusterP',TABAL,MAT.plaster);
kdef('taEchinus',TAECH,MAT.taMarble);kdef('taEchinusP',TAECH,MAT.plaster);kdef('taBell',TABELL,MAT.taMarble);kdef('taBellGi',TABELL,MAT.taGilt);
kdef('taDome',VDOME,MAT.taTile);kdef('taDomeM',VDOME,MAT.taMarble);kdef('taDomeP',VDOME,MAT.plaster);kdef('taDomeGi',VDOME,MAT.taGilt);
kdef('taEgg',TAEGG,MAT.plaster);kdef('taEggT',TAEGG,MAT.taTile);kdef('taOnion',TAONION,MAT.taGilt);kdef('taOnionT',TAONION,MAT.taTile);kdef('taOnionCu',TAONION,MAT.verdigris);
kdef('taCone',TACONE,MAT.taTile);kdef('taConeCu',TACONE,MAT.verdigris);
kdef('taVault',TAVAULT,MAT.plaster);kdef('taVaultT',TAVAULT,MAT.taTile);
kdef('taGiltBall',VBALL,MAT.taGilt);kdef('taGiltPost',VPOSTB,MAT.taGilt);kdef('taBallM',VBALL,MAT.taMarble);
// the pointed heads: wedges in the fill materials, double-sided (the wedge's faces are wound for roofs)
kdef('taGableD',VGABLE,MAT.taVoid);kdef('taGableG',VGABLE,MAT.taGlass);kdef('taGableL',VGABLE,MAT.taLit);kdef('taGableM',VGABLE,MAT.taMarble);kdef('taGableTile',VGABLE,MAT.taTile);
kdef('taHipTile',VHIP,MAT.taTile);kdef('taPyrTile',VPYR,MAT.taTile);

// ---------------------------------------------------------------- the owner's delivery of 2026-10-18 (materials.json, 88yt)
// Full-colour sets (keep 1, the set's own brightness): the orange honeycomb mosaic (1.2 m tile) on the paving medallions
// (taDiscMo, a disc: uv 0..1 spans its 2r, so K is doubled) and on boxes and vaults (taMosaicB, taVaultMo: the trumpet
// vaults of the interiors); the meander band (a 3:1 strip, .9 x .3 m: a .3 m border strip, u along its length) on the
// paving borders; the worn orange render of the tenements (2 m). The cut-outs (the jali lattices, the rose window) are
// alpha cards (alphaTest .5, double-sided); the rose window takes no world UV (one card is one disc).
MAT.taMosaic=MAT.plaster.clone();vWorldUV(MAT.taMosaic,1/1.2);
MAT.taMosaicD=MAT.plaster.clone();vWorldUV(MAT.taMosaicD,2/1.2);
MAT.taMeander=MAT.plaster.clone();vWorldUV(MAT.taMeander,1/.9,1/.3);
MAT.taRenderW=MAT.plaster.clone();vWorldUV(MAT.taRenderW,.5);
const taCard=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8,metalness:0,alphaTest:.5,side:THREE.DoubleSide});
MAT.taJaliA=taCard();vWorldUV(MAT.taJaliA,1);MAT.taJaliG=taCard();vWorldUV(MAT.taJaliG,1);MAT.taRose=taCard();
kdef('taMosaicB',VBOX,MAT.taMosaic);kdef('taDiscMo',TADISC,MAT.taMosaicD);kdef('taVaultMo',TAVAULT,MAT.taMosaic);
kdef('taMeanderB',VBOX,MAT.taMeander);kdef('taRenderW',VBOX,MAT.taRenderW);
kdef('taJaliA',VPLANE,MAT.taJaliA);kdef('taJaliG',VPLANE,MAT.taJaliG);kdef('taRose',VPLANE,MAT.taRose);

// ---------------------------------------------------------------- P4: the University and the civic set
// a round drum (24 sides, base at y = 0): the big drums (library, temple, anatomy theatre, observatory), where the
// Vernacular's eight-sided post reads as an octagon
const TADRUM=new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0);
kdef('taDrum',TADRUM,MAT.plaster);kdef('taDrumM',TADRUM,MAT.taMarble);
// a plaster cone (the memorial's lathe spire, the chapel's rib spire)
kdef('taConeP',TACONE,MAT.plaster);
// glasshouse glass: a pale green-grey pane with a sheen, opaque (no sorting in the batch); tinted per instance
MAT.taPane=new THREE.MeshStandardMaterial({color:0xffffff,metalness:.15,roughness:.05,side:THREE.DoubleSide,transparent:true,opacity:.28,depthWrite:false});
kdef('taDomeGl',VDOME,MAT.taPane);kdef('taDiscP',TADISC,MAT.taPane);kdef('taVaultGl',TAVAULT,MAT.taPane);kdef('taPaneB',VBOX,MAT.taPane);
kdef('taRibI',TARIB,MAT.iron);
// the cobalt glass carries its own colour (TAPAL.cobalt: no arch tints its fill); a double-sided copy for the pointed heads
MAT.taCobaltDS=MAT.taCobalt.clone();MAT.taCobaltDS.side=THREE.DoubleSide;kdef('taGableC',VGABLE,MAT.taCobaltDS);
// the column's small parts at low poly (its base torus and its capital's volutes: a column carries several of each)
const TARINGS=new THREE.TorusGeometry(1,.1,4,12).rotateX(Math.PI/2),TANUB=new THREE.SphereGeometry(1,6,4);
kdef('taRingMs',TARINGS,MAT.taMarble);kdef('taRingGiS',new THREE.TorusGeometry(1,.1,4,12),MAT.taGilt);kdef('taGiltNub',TANUB,MAT.taGilt);
// P5: a verdigris melon dome for the palace's pavilions (the copper alternative to the orange tile, PLAN.md section 5)
kdef('taDomeCu',VDOME,MAT.verdigris);

// ---------------------------------------------------------------- real openings (the owner, 2026-10-19: no dark voids)
// Talia's pane: the dark glass lifted to a sky grey (Pylon's pyPane, the same values), so a window reads as glass, not a
// hole; double-sided for the pointed heads. Timber leaves for the doors' arched and pointed heads (white, tinted walnut).
MAT.taWinPane=MAT.darkGlass.clone();MAT.taWinPane.color.set(0x7d97a3);MAT.taWinPane.roughness=.15;MAT.taWinPane.metalness=.55;
MAT.taWinPaneDS=MAT.taWinPane.clone();MAT.taWinPaneDS.side=THREE.DoubleSide;
kdef('taWinB',VBOX,MAT.taWinPane);kdef('taWinDisc',TADISC,MAT.taWinPane);kdef('taWinGable',VGABLE,MAT.taWinPaneDS);
