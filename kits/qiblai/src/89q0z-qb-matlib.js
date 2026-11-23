// ================================================================= QIBLAI — the material library on Qiblai's own materials
// kits/qiblai/materials.json names a library set per Qiblai MAT key; tools/textures/pack.py packs them into kits/qiblai/tex/
// and settlements/xanadu/build.py --kit inlines them as KMAT.pack('qiblai') (88x2-kit-matlib-pack.js). This makes the keys
// and binds them in place, as kits/pylon's 88yp does, so one tile of each world-UV map becomes one tile of its set; the
// Xanadu kit's materials Qiblai draws in are bound by Xanadu's own pack (88y). ?mat=proc binds nothing.
// qAshlar: the dressed ashlar (plinths, terrace platforms, the ring walls' base courses), a 3 m tile, tinted by QSTONE.
MAT.qAshlar=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.85,metalness:0,side:DS});vWorldUV(MAT.qAshlar,1/3);
kdef('qAshB',VBOX,MAT.qAshlar);kdef('qCubeA98',QBAT98,MAT.qAshlar);kdef('qCubeA96',XBAT96,MAT.qAshlar);
// the city's ground (settlements/qiblai): the Af country's grass, the blocks' made ground, the lay streets' cobbles, the
// avenues' and the kora's flagstones; the city's ground shader samples their maps in world metres (no kit item draws them)
for(const k of['qGrass','qDirt','qCobble','qFlag']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
// the rooms (89q5, the owner, 2026-11-15: "make sure textures are wired appropriately to all furniture and floor, ceiling and
// walls of rooms"): the gilt (the sanctum's shrine, the wheels, the butter lamps; hammered gold, tinted by the piece's gold),
// the lacquer (the columns and the painted ceilings; red lacquered wood, tinted by the piece's colour: a pillar takes its
// monastery's), the sanctum's marble mosaic floor, the halls' floorboards, the council's runner (a wool rug, tinted red)
const QB_IXMAT={qGilt:[1.5,.45,.35],qLacq:[2,.6,0],qMarble:[3,.5,0],qPlank:[2.5,.8,0],qRug:[2,.95,0]};   /* [tile m, roughness, metalness] */
for(const k in QB_IXMAT){const [t,r,m]=QB_IXMAT[k];MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:r,metalness:m,side:DS});vWorldUV(MAT[k],1/t);}
kdef('qGiltB',VBOX,MAT.qGilt);kdef('qGiltBall',VBALL,MAT.qGilt);kdef('qGiltDisc',XDISC,MAT.qGilt);kdef('qGiltBulb',XBULB,MAT.qGilt);
kdef('qLacqB',VBOX,MAT.qLacq);kdef('qLacqArm',XARM,MAT.qLacq);kdef('qMarbleB',VBOX,MAT.qMarble);kdef('qPlankB',VBOX,MAT.qPlank);kdef('qRugB',VBOX,MAT.qRug);
// the Xanadu kit's columns (xnCol: porticoes, cloisters, arcades) drawn on Qiblai's pages in the lacquer, shaft, capital tiers
// and brackets (the owner, 2026-11-16: "those columns seem textureless"): the same draws in the same order as the kit's, so
// nothing else moves; the set is greyscale (keep 0), so each keeps its painted colour
xnCol=function(x,y,z,h,r,ry,c,capC){c=c||xC(xPick(XPAL.red));capC=capC||xC(xPick([XPAL.blue,XPAL.turquoise,XPAL.saffron]));r=r==null?.18:r;ry=ry==null?0:ry;
 vB('vStone',x,y-.05,z,r*3,.16,r*3,ry,xC(xPick(XPAL.stone)));vB('qLacqB',x,y+.1,z,r*2,h-.72,r*2,ry,c);
 vB('qLacqB',x,y+h-.62,z,r*3.2,.2,r*2.2,ry,capC);vB('qLacqB',x,y+h-.42,z,r*5.2,.24,r*2.4,ry,c);vB('qLacqB',x,y+h-.18,z,r*7.2,.18,r*2.6,ry,capC);
 for(const s of[-1,1]){const p=loc(x,z,s*r*2.6,0,ry);xnBracket(p[0],y+h-.42,p[1],ry+s*Math.PI/2,r*1.6,.24,r*2.2,capC,'qLacqArm',true);}};
const QB_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('qiblai',MAT):{};
