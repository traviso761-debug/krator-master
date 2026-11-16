/* ================================================================= SCRAP XANADU: materials and kit items (prefix xs)
   The owner, 2026-11-11: Xanadu buildings in reclaimed materials, "nothing ramshackle about them": the Ancients' panels,
   glazing, girders, cable and bronze, set in ordered Xanadui compositions (kits/xanadu/PLAN-SCRAP.md). The package is
   opt-in (xanadu.py SCRAP): the kit's FILES do not list it.
   The reclaimed stuff IS the Ancients' material, so the items draw with core/materials' own: MAT.white (the seamed white
   shell sheet), MAT.verdigris (the copper skin), MAT.glass (the shaped glazing). New here: one geometry whose UVs show
   exactly ONE Ancient sheet (a whole panel, its groove and its four fasteners), the I-girder, and the bronze. */

/* one Ancient sheet per box: TEX.panel holds PANW x PANH px sheets on a 512 px canvas (core/materials 20-textures.js),
   so a face's 0..1 UV is squeezed into one sheet, a hair inside its groove */
const XS_SHEET=(function(){const g=new THREE.BoxGeometry(1,1,1),uv=g.attributes.uv,su=PANW/512,sv=PANH/512;
 for(let i=0;i<uv.count;i++)uv.setXY(i,.004+uv.getX(i)*(su-.008),.004+uv.getY(i)*(sv-.008));uv.needsUpdate=true;return g;})();
/* the I-girder: flanges 1 wide, web between, along +y, centred (column); XS_GIRDERX the same along +x (lintel, beam) */
function xsGirderGeo(){const s=new THREE.Shape(),f=.16,wb=.07;
 s.moveTo(-.5,-.5);s.lineTo(.5,-.5);s.lineTo(.5,-.5+f);s.lineTo(wb,-.5+f);s.lineTo(wb,.5-f);s.lineTo(.5,.5-f);s.lineTo(.5,.5);
 s.lineTo(-.5,.5);s.lineTo(-.5,.5-f);s.lineTo(-wb,.5-f);s.lineTo(-wb,-.5+f);s.lineTo(-.5,-.5+f);s.lineTo(-.5,-.5);
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}).translate(0,0,-.5);}
const XS_GIRDER=xsGirderGeo().rotateX(-Math.PI/2);
const XS_GIRDERX=xsGirderGeo().rotateY(Math.PI/2);

MAT.xsBronze=xStd({roughness:.34,metalness:.55});    /* reclaimed bronze and brass: tinted XS.bronze per instance */
MAT.xsSteel=xStd({roughness:.5,metalness:.3});       /* a dressed girder: cleaned, painted, its flanges sharp */
MAT.xsCable=xStd({roughness:.42,metalness:.6});      /* the Ancients' cable, drawn taut */

kdef('xsPanel',XS_SHEET,MAT.white);kdef('xsPanelV',VBOX,MAT.verdigris);   /* the copper skin shows its whole patina map per panel: one sheet's crop of it reads brown */
kdef('xsShellB',VBOX,MAT.white);kdef('xsVerdB',VBOX,MAT.verdigris);
kdef('xsGlassB',VBOX,MAT.glass);kdef('xsGlassDome',XDOME,MAT.glass);
kdef('xsDomeV',XDOME,MAT.verdigris);kdef('xsDomeW',XDOME,MAT.white);kdef('xsDrumV',XDRUM,MAT.verdigris);kdef('xsDrumW',XDRUM,MAT.white);
kdef('xsArchW',XARCH,MAT.white);
kdef('xsGirder',XS_GIRDER,MAT.xsSteel);kdef('xsGirderX',XS_GIRDERX,MAT.xsSteel);
kdef('xsCable',new THREE.CylinderGeometry(1,1,1,5),MAT.xsCable);
kdef('xsBronzeB',VBOX,MAT.xsBronze);kdef('xsBronzeC',XCOL,MAT.xsBronze);kdef('xsBronzeOct',XOCT,MAT.xsBronze);
kdef('xsBulbB',XBULB,MAT.xsBronze);kdef('xsBall',VBALL,MAT.xsBronze);kdef('xsConeB',VCONE,MAT.xsBronze);
kdef('xsRing',new THREE.TorusGeometry(1,.035,5,28),MAT.xsBronze);
/* the poor tier (87v): the hull's vault lived in as found (a half cylinder along z, open ended, standing on y 0), the
   mud end wall that closes it (a half disc facing +z), bottle ends set in mud (a short cylinder facing +z), the glinting
   cone, the round glass of a porthole (a disc facing +z) */
MAT.xsBottle=xStd({roughness:.12,metalness:.35});    /* glass bottle ends and can lids: tinted per instance, they catch the sun */
kdef('xsVault',new THREE.CylinderGeometry(1,1,1,18,1,true,-Math.PI/2,Math.PI).rotateX(-Math.PI/2),MAT.white);
kdef('xsVaultV',new THREE.CylinderGeometry(1,1,1,18,1,true,-Math.PI/2,Math.PI).rotateX(-Math.PI/2),MAT.verdigris);
kdef('xsMudHalf',new THREE.CircleGeometry(1,18,0,Math.PI),MAT.xEarth);
kdef('xsBottle',new THREE.CylinderGeometry(1,1,1,6).rotateX(Math.PI/2),MAT.xsBottle);
kdef('xsConeW',VCONE,MAT.white);
kdef('xsGlassDisc',new THREE.CylinderGeometry(1,1,1,16).rotateX(Math.PI/2),MAT.glass);
