// Mega-City One's landmarks: the Hall of Justice and the Statue of Judgement. Fan work in the spirit of Judge
// Dredd's city, which belongs to Rebellion; every shape is this project's own. Only this city has them, so they
// travel with this page rather than with the shared engine; src/megacity/main.js hands them over as ctx.models.

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {THREE,animHooks,nightF,hour,box,group,gh}=api;
  return {
  hallofjustice(L,x,z){   // the seat of the Judges: a bunker the size of a district, with a shield front and a crest over the doors
    const H=L.height||260,W=L.width||460,D=L.depth||300,g0=gh(x,z),A=L.turn||0,parts=[];
    const stone=new THREE.MeshPhongMaterial({color:0x8a8478,specular:0x2a2926,shininess:8,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x5f5c55,specular:0x24231f,shininess:6,flatShading:true});
    const gold=new THREE.MeshBasicMaterial({color:0xd8a642});
    const at=(ox,oz)=>[x+ox*Math.cos(A)-oz*Math.sin(A),z+ox*Math.sin(A)+oz*Math.cos(A)];
    // the body: a broad plinth, the mass above it, and the buttresses down the flanks
    {const [bx,bz]=at(0,0);const p=box(bx,g0,bz,W,26,D,dark);p.rotation.y=-A;parts.push(p);
     const b=box(bx,g0+26,bz,W*0.86,H*0.62,D*0.82,stone);b.rotation.y=-A;parts.push(b);}
    for(let k=-4;k<=4;k++){const [px,pz]=at(k*W*0.095,-D*0.41);
      const bt=box(px,g0+26,pz,26,H*0.66,22,dark);bt.rotation.y=-A;parts.push(bt);}
    // the shield: a curved frontage standing proud of the building, which is the bit everyone photographs
    {const shieldR=W*0.34;
     for(let k=0;k<11;k++){const t=(k/10-0.5)*1.5,[px,pz]=at(Math.sin(t)*shieldR,-D*0.45-Math.cos(t)*shieldR*0.34+shieldR*0.34);
       const sl=box(px,g0+20,pz,shieldR*0.24,H*0.78*(1-Math.abs(t)*0.34),20,stone);sl.rotation.y=-A-t*0.5;parts.push(sl);}}
    // the crest over the doors: a spine with wings swept back from it
    {const [cx2,cz2]=at(0,-D*0.52),cy=g0+H*0.52;
     parts.push(box(cx2,cy,cz2,9,52,7,gold));
     for(const sd of [-1,1])for(let k=0;k<4;k++){const wgt=box(cx2+sd*(16+k*15)*Math.cos(A),cy+30-k*9,cz2+sd*(16+k*15)*Math.sin(A),12,7+k*3,6,gold);
       wgt.rotation.set(0,-A,sd*0.22);parts.push(wgt);}}
    // the towers either end, and the halls behind
    for(const sd of [-1,1]){const [tx,tz]=at(sd*W*0.44,0);
      const t=box(tx,g0+26,tz,74,H*1.25,74,stone);t.rotation.y=-A;parts.push(t);
      const cap=box(tx,g0+26+H*1.25,tz,86,16,86,dark);cap.rotation.y=-A;parts.push(cap);
      const m=box(tx,g0+42+H*1.25,tz,7,H*0.3,7,dark);parts.push(m);}
    {const [rx,rz]=at(0,D*0.3);const r=box(rx,g0+26,rz,W*0.5,H*0.9,D*0.4,stone);r.rotation.y=-A;parts.push(r);}
    const lit=new THREE.MeshBasicMaterial({color:0xffca6a,transparent:true,opacity:0.7});
    for(let k=-6;k<=6;k++){const [px,pz]=at(k*W*0.062,-D*0.415);const w2=box(px,g0+30,pz,12,H*0.5,2,lit);w2.rotation.y=-A;parts.push(w2);}
    const g=group(L,parts);
    animHooks.push(()=>{const n=nightF(hour());lit.opacity=0.2+0.6*n;gold.color.setRGB(0.85,0.65+0.12*n,0.26);});
    return g;},
  judgement(L,x,z){   // the Statue of Judgement: helmet, shoulders, and an arm out over the plaza
    const H=L.height||150,g0=gh(x,z),A=L.turn||0,parts=[];
    const bronze=new THREE.MeshPhongMaterial({color:0x6d5f47,specular:0x322c22,shininess:14,flatShading:true});
    const stone=new THREE.MeshPhongMaterial({color:0x7d7768,specular:0x24231f,shininess:6,flatShading:true});
    const S=H/150;
    parts.push(box(x,g0,z,52*S,26*S,52*S,stone),box(x,g0+26*S,z,36*S,16*S,36*S,stone));
    const base=g0+42*S;
    // legs, torso, shoulders: kept blocky, because at this size it is architecture and not a figure
    for(const sd of [-1,1]){const lg=new THREE.Mesh(new THREE.CylinderGeometry(5.5*S,7*S,46*S,7).translate(0,23*S,0),bronze);
      lg.position.set(x+sd*8*S*Math.cos(A),base,z+sd*8*S*Math.sin(A));parts.push(lg);}
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(15*S,11*S,44*S,8).translate(0,22*S,0),bronze);
    torso.position.set(x,base+46*S,z);torso.rotation.y=A;parts.push(torso);
    const sh=box(x,base+82*S,z,42*S,9*S,20*S,bronze);sh.rotation.y=-A;parts.push(sh);
    for(const sd of [-1,1]){const pad=new THREE.Mesh(new THREE.SphereGeometry(11*S,10,7),bronze);
      pad.scale.set(1,0.75,1);pad.position.set(x+sd*21*S*Math.cos(A),base+86*S,z+sd*21*S*Math.sin(A));parts.push(pad);}
    // the head, and the visor across it
    const head=new THREE.Mesh(new THREE.SphereGeometry(11*S,12,9),bronze);head.scale.set(1,1.2,1.05);
    head.position.set(x,base+102*S,z);parts.push(head);
    const visor=box(x-Math.sin(A)*10*S,base+100*S,z+Math.cos(A)*10*S,17*S,4*S,3*S,new THREE.MeshBasicMaterial({color:0x2a2c30}));
    visor.rotation.y=-A;parts.push(visor);
    const crest=box(x,base+112*S,z,4*S,11*S,20*S,bronze);crest.rotation.y=-A;parts.push(crest);
    // the arm, held out over the plaza
    {const arm=new THREE.Mesh(new THREE.CylinderGeometry(6*S,5*S,50*S,7),bronze);
     arm.position.set(x-Math.sin(A)*26*S,base+92*S,z+Math.cos(A)*26*S);arm.rotation.set(Math.cos(A)*1.1,0,Math.sin(A)*1.1+0.55);parts.push(arm);
     const fist=new THREE.Mesh(new THREE.SphereGeometry(8*S,9,7),bronze);
     fist.position.set(x-Math.sin(A)*48*S,base+96*S,z+Math.cos(A)*48*S);parts.push(fist);}
    return group(L,parts);},
  };
}
