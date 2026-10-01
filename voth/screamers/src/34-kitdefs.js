// ---------------------------------------------------------------- kit definitions (shared geometry)
kdef('winI',arcWindowGeo(2.2,4.2,.7),MAT.winIntact); kdef('winD',arcWindowGeo(2.2,4.2,.7),MAT.winDead);
kdef('winBigI',arcWindowGeo(3,3.6,.7),MAT.winIntact); kdef('winBigD',arcWindowGeo(3,3.6,.7),MAT.winDead);
kdef('ovalI',new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2),MAT.winIntact); kdef('ovalD',new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2),MAT.winDead);
kdef('archOpen',arcWindowGeo(6,9,1.2),MAT.dark);
kdef('mullW',new THREE.BoxGeometry(.5,1,.5),MAT.white); kdef('mullR',new THREE.BoxGeometry(.5,1,.5),MAT.rust);
kdef('finW',new THREE.BoxGeometry(1,1,1),MAT.dark);kdef('pierW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('pierR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('dot',new THREE.BoxGeometry(1.4,.7,.4),MAT.dot);
kdef('strip',new THREE.BoxGeometry(1,.18,.18),MAT.strip);
kdef('colW',hyperGeo(1,1,1.6),MAT.white); kdef('colR',hyperGeo(1,1,1.6),MAT.rust);
kdef('arch',arcShape(16,27,2.2,4),MAT.white); kdef('archR',arcShape(16,27,2.2,4),MAT.rust);
kdef('vaultRib',arcShape(92,56,2.6,3),MAT.white); kdef('vaultRibR',arcShape(92,56,2.6,3),MAT.rust);
kdef('pipe',new THREE.CylinderGeometry(1,1,1,10),MAT.pipe); kdef('pipeR',new THREE.CylinderGeometry(1,1,1,10),MAT.pipeRust);
kdef('slab',new THREE.CylinderGeometry(1,1,1,48),MAT.slab);
// The decorative bands read as a copper/bronze alloy, so their ruined form is
// the one part of the kit that goes verdigris. Everything else rusts. Keeping
// patina off the steel is the whole reason verdigris became its own material.
kdef('ringW',new THREE.TorusGeometry(1,.09,6,40),MAT.white); kdef('ringR',new THREE.TorusGeometry(1,.09,6,40),MAT.verdigris);
kdef('stain',new THREE.PlaneGeometry(1,1),MAT.stain);
kdef('moss',new THREE.IcosahedronGeometry(1,1),MAT.moss);
kdef('vine',new THREE.CylinderGeometry(.05,.16,1,5).translate(0,-.5,0),MAT.vine);
kdef('rubble',new THREE.DodecahedronGeometry(1,0),MAT.rubble);
// Eight-sided, not six: a six-sided bole is visibly a hexagonal prism from
// anywhere near it, and trunks are the one instanced thing you walk right up
// to. Two extra triangles per tree buys a round tree.
kdef('trunk',new THREE.CylinderGeometry(.16,.4,1,8).translate(0,.5,0),MAT.vine);
kdef('figB',new THREE.CylinderGeometry(.24,.2,1.5,6).translate(0,.75,0),MAT.fig);
kdef('figH',new THREE.SphereGeometry(.13,6,5).translate(0,1.62,0),MAT.fig);
kdef('finial',new THREE.IcosahedronGeometry(1,0),MAT.glass);

