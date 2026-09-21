// Mordor's landmarks: Orodruin in eruption, Barad-dur and the Eye, the Black Gate across the Udun, Minas
// Morgul in its valley and Cirith Ungol over its pass. Fan work from Tolkien, whose world belongs to the Tolkien
// Estate; every shape is this project's own. Nothing else on the site uses them, so they travel with this page
// rather than with the shared engine; src/mordor/main.js hands them to build() as ctx.models.

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {ctx,THREE,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {
  orodruin(L,x,z){   // Mount Doom, in eruption, which is its normal condition
    const g0=gh(x,z),parts=[],R0=L.crater||1100,SC=L.scale||1;
    const rock=new THREE.MeshPhongMaterial({color:0x211e1b,specular:0x3a342c,shininess:6,flatShading:true});
    const lavaM=new THREE.MeshBasicMaterial({color:0xff6a12,transparent:true,opacity:0.95});
    const emberM=new THREE.MeshBasicMaterial({color:0xffb03a,transparent:true,opacity:0.85});
    const ashM=new THREE.MeshLambertMaterial({color:0x2a2622,transparent:true,opacity:0.5,depthWrite:false});
    // the crater: a broken rim, and the fire sitting in it
    for(let k=0;k<13;k++){const a=k/13*Math.PI*2,r=R0*(0.92+((k*37)%5)*0.05);
      const b=new THREE.Mesh(new THREE.BoxGeometry(R0*0.42,R0*(0.24+((k*29)%4)*0.09),R0*0.3),rock);
      b.position.set(x+Math.cos(a)*r,g0+R0*0.1,z+Math.sin(a)*r);b.rotation.set(0,-a,((k*19)%5-2)*0.08);parts.push(b);}
    const pool=new THREE.Mesh(new THREE.CircleGeometry(R0*0.82,24).rotateX(-Math.PI/2),lavaM);
    pool.position.set(x,g0+R0*0.06,z);parts.push(pool);
    // the fountain standing out of the pool, and the lava running down the flanks
    const jets=[];for(let k=0;k<7;k++){const a=k/7*Math.PI*2+0.4,r=R0*(0.2+((k*31)%4)*0.13);
      const j=new THREE.Mesh(new THREE.ConeGeometry(R0*0.13,R0*0.9,6).translate(0,R0*0.45,0),emberM);
      j.position.set(x+Math.cos(a)*r,g0+R0*0.06,z+Math.sin(a)*r);parts.push(j);jets.push({j,ph:k*0.9});}
    const flows=[],SLOPE=L.slope||0.33;   // the angle of the cone's flank, in radians
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2+0.7,len=(L.flow||9000)*(0.6+((k*29)%5)*0.16);
      const arm=new THREE.Group();arm.position.set(x,g0+R0*0.05,z);arm.rotation.y=-a;
      const fl=new THREE.Mesh(new THREE.BoxGeometry(len,26,R0*(0.16+((k*17)%3)*0.07)).translate(len/2,0,0),lavaM);
      fl.position.set(R0*0.9,0,0);fl.rotation.z=-SLOPE;arm.add(fl);
      scene.add(arm);flows.push({fl,ph:k*1.3});}
    const g=group(L,parts);
    // the plume: it does not stop, and it leans downwind
    const puffs=[],N=L.puffs||44,TOP=(L.plume||9000),DRIFT=(L.drift||26000);
    for(let k=0;k<N;k++){const p=new THREE.Mesh(new THREE.SphereGeometry(R0*0.55,8,6),ashM);
      p.userData.t=k/N;scene.add(p);puffs.push(p);}
    const lamp=new THREE.PointLight(0xff5a10,0,R0*7);lamp.position.set(x,g0+R0*0.9,z);scene.add(lamp);
    const glow=new THREE.Mesh(new THREE.SphereGeometry(R0*2.4,14,10),new THREE.MeshBasicMaterial({color:0xff5e12,transparent:true,opacity:0.18,depthWrite:false}));
    glow.position.set(x,g0+R0*0.3,z);glow.userData.noShadow=true;scene.add(glow);
    animHooks.push(now=>{const n=nightF(hour());
      const surge=0.62+0.38*Math.sin(now*0.00043)+0.16*Math.sin(now*0.0017);
      lavaM.opacity=Math.min(1,0.8+0.2*surge);emberM.opacity=0.6+0.35*surge;
      glow.material.opacity=(0.12+0.16*n)*surge;glow.scale.setScalar(0.85+0.3*surge);
      lamp.intensity=(0.45+0.85*n)*surge;
      for(const q of jets){const k=0.5+0.6*Math.abs(Math.sin(now*0.0021+q.ph));q.j.scale.set(0.8+0.3*k,k*(0.7+0.9*surge),0.8+0.3*k);}
      for(const q of flows){const k=0.75+0.25*Math.sin(now*0.0009+q.ph);q.fl.scale.set(1,1,0.8+0.4*k);}
      // every puff climbs, spreads and leans away, then starts again at the crater
      for(let i=0;i<puffs.length;i++){const p=puffs[i];
        const t=((now*0.0000075)+p.userData.t)%1;
        const rise=Math.pow(t,0.85);
        p.position.set(x+DRIFT*t*t*0.9+Math.sin(i*2.3+t*5)*R0*1.4,
                       g0+R0*0.4+TOP*rise,
                       z+DRIFT*t*t*0.35+Math.cos(i*1.7+t*4)*R0*1.4);
        p.scale.setScalar(0.5+6.5*t);p.material=ashM;}
      ashM.opacity=0.46;});
    return g;},
  baraddur(L,x,z){   // Barad-dur, and the Eye. At the scale of the whole land the tower is a splinter, so the Eye is lit to carry.
    const H=L.height||1500,g0=gh(x,z),parts=[],A=L.turn||0.4;
    const iron=new THREE.MeshPhongMaterial({color:0x20211f,specular:0x44403a,shininess:10,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x171817,specular:0x33302c,shininess:8,flatShading:true});
    // the foundation: walls and lesser towers on the spur, a fortress in its own right
    const baseR=L.base||520;
    for(let k=0;k<9;k++){const a=A+k/9*Math.PI*2,r=baseR*(0.72+((k*37)%4)*0.1);
      const w=new THREE.Mesh(new THREE.BoxGeometry(baseR*0.52,H*0.16+((k*53)%4)*H*0.03,baseR*0.3).translate(0,0,0),dark);
      w.position.set(x+Math.cos(a)*r,g0+H*0.08,z+Math.sin(a)*r);w.rotation.y=-a;parts.push(w);}
    for(let k=0;k<5;k++){const a=A+k/5*Math.PI*2+0.5,r=baseR*0.62;
      const t=new THREE.Mesh(new THREE.CylinderGeometry(26,40,H*0.34,6).translate(0,H*0.17,0),iron);
      t.position.set(x+Math.cos(a)*r,g0,z+Math.sin(a)*r);parts.push(t);
      const sp=new THREE.Mesh(new THREE.ConeGeometry(30,H*0.1,6).translate(0,H*0.05,0),dark);
      sp.position.set(x+Math.cos(a)*r,g0+H*0.34,z+Math.sin(a)*r);parts.push(sp);}
    // ---- the outworks ----
    // Barad-dur is not a tower on a hill, it is a tower in the middle of a fortress the size of a town: two
    // wards of curtain wall round it, a gate on the road side with a barbican in front of it, a causeway up
    // to that across the ditch, and lesser towers along every wall. The tower on its own read as a spike
    // someone had pushed into the ground.
    const WARD=[[baseR*3.4,H*0.10,15],[baseR*2.1,H*0.13,11]];
    const GATE_A=A+2.3;                                  // the side the road comes in on
    for(const [rr,wh,nt] of WARD){
      const n=Math.max(24,Math.round(rr/70));
      for(let k=0;k<n;k++){
        const a=A+k/n*Math.PI*2;
        // the gate: a gap in the outer ward only
        if(rr===WARD[0][0]&&Math.abs(((a-GATE_A+Math.PI)%(Math.PI*2))-Math.PI)<0.10)continue;
        const seg=rr*Math.PI*2/n*1.12;
        const w=new THREE.Mesh(new THREE.BoxGeometry(seg,wh*(0.9+((k*29)%5)*0.05),baseR*0.16).translate(0,wh/2,0),dark);
        w.position.set(x+Math.cos(a)*rr,g0,z+Math.sin(a)*rr);w.rotation.y=-a+Math.PI/2;parts.push(w);
      }
      for(let k=0;k<nt;k++){
        const a=A+k/nt*Math.PI*2+0.21;
        const t=new THREE.Mesh(new THREE.CylinderGeometry(baseR*0.11,baseR*0.16,wh*1.9,6).translate(0,wh*0.95,0),iron);
        t.position.set(x+Math.cos(a)*rr,g0,z+Math.sin(a)*rr);parts.push(t);
        const sp=new THREE.Mesh(new THREE.ConeGeometry(baseR*0.12,wh*0.5,6).translate(0,wh*0.25,0),dark);
        sp.position.set(x+Math.cos(a)*rr,g0+wh*1.9,z+Math.sin(a)*rr);parts.push(sp);
      }
    }
    // the gatehouse, the barbican in front of it, and the causeway out across the ditch
    {
      const rr=WARD[0][0];
      for(const sd of [-1,1]){
        const a=GATE_A+sd*0.12;
        const t=new THREE.Mesh(new THREE.BoxGeometry(baseR*0.3,H*0.22,baseR*0.34).translate(0,H*0.11,0),iron);
        t.position.set(x+Math.cos(a)*rr,g0,z+Math.sin(a)*rr);t.rotation.y=-a;parts.push(t);
        const sp=new THREE.Mesh(new THREE.ConeGeometry(baseR*0.17,H*0.1,5).translate(0,H*0.05,0),dark);
        sp.position.set(x+Math.cos(a)*rr,g0+H*0.22,z+Math.sin(a)*rr);parts.push(sp);
      }
      for(let k=0;k<9;k++){
        const d=rr+120+k*110;
        const c=new THREE.Mesh(new THREE.BoxGeometry(baseR*0.44,H*0.03,220),dark);
        c.position.set(x+Math.cos(GATE_A)*d,g0+H*0.02,z+Math.sin(GATE_A)*d);c.rotation.y=-GATE_A;parts.push(c);
        if(k%3===0)for(const sd of [-1,1]){
          const p=new THREE.Mesh(new THREE.BoxGeometry(30,H*0.06,30).translate(0,H*0.03,0),iron);
          p.position.set(x+Math.cos(GATE_A)*d-Math.sin(GATE_A)*sd*baseR*0.24,g0+H*0.03,
                         z+Math.sin(GATE_A)*d+Math.cos(GATE_A)*sd*baseR*0.24);parts.push(p);}
      }
    }
    // the shaft: black iron, battered, gathering inwards as it climbs
    const wid=t=>t<0.08?180-560*t:t<0.62?135-70*(t-0.08)/0.54:t<0.86?65+28*Math.sin((t-0.62)/0.24*Math.PI):Math.max(16,93-380*(t-0.86));
    const SEG=26;
    for(let k=0;k<SEG;k++){const t0=k/SEG,t1=(k+1)/SEG,w=(wid(t0)+wid(t1))/2,hh=H/SEG*1.03;
      const b=new THREE.Mesh(new THREE.CylinderGeometry(w*0.94,w,hh,7).translate(0,hh/2,0),k%2?iron:dark);
      b.position.set(x,g0+H*t0,z);b.rotation.y=A+k*0.06;parts.push(b);}
    // the buttresses and the iron horns that carry the crown
    for(let f=0;f<7;f++){const a=A+f/7*Math.PI*2;
      for(let k=0;k<5;k++){const t0=0.06+k*0.12,t1=t0+0.12,w=(wid(t0)+wid(t1))/2,hh=H*(t1-t0)*1.04;
        const bt=new THREE.Mesh(new THREE.BoxGeometry(24,hh,16).translate(0,hh/2,0),dark);
        bt.position.set(x+Math.cos(a)*w,g0+H*t0,z+Math.sin(a)*w);bt.rotation.y=-a;parts.push(bt);}}
    for(let k=0;k<6;k++){const a=A+k/6*Math.PI*2+0.3,r=wid(0.9)*1.5,len=H*0.2;
      const horn=new THREE.Mesh(new THREE.ConeGeometry(15,len,5).translate(0,len/2,0),dark);
      horn.position.set(x+Math.cos(a)*r,g0+H*0.9,z+Math.sin(a)*r);
      horn.rotation.set(Math.sin(a)*0.5,0,-Math.cos(a)*0.5);parts.push(horn);}
    const g=group(L,parts);
    // ---- the Eye ----
    const EY=g0+H*1.02,SC=L.eyeScale||1;
    const fireM=new THREE.MeshBasicMaterial({color:0xffb23a,transparent:true,opacity:0.95});
    const glowM=new THREE.MeshBasicMaterial({color:0xff8a1e,transparent:true,opacity:0.34,depthWrite:false});
    const haloM=new THREE.MeshBasicMaterial({color:0xff7a12,transparent:true,opacity:0.08,depthWrite:false});
    const slitM=new THREE.MeshBasicMaterial({color:0x180a04});
    const eye=new THREE.Group();eye.position.set(x,EY,z);scene.add(eye);
    const ball=new THREE.Mesh(new THREE.SphereGeometry(58*SC,20,14),fireM);ball.scale.set(1.5,0.78,0.5);eye.add(ball);
    const slit=new THREE.Mesh(new THREE.SphereGeometry(20*SC,12,10),slitM);slit.scale.set(0.34,0.92,0.6);slit.position.z=30*SC;eye.add(slit);
    // the flame around it, and a glow big enough to be seen from the far side of Gorgoroth
    const lash=[];for(let k=0;k<11;k++){const a=k/11*Math.PI*2;
      const f=new THREE.Mesh(new THREE.ConeGeometry(17*SC,90*SC,5).translate(0,45*SC,0),fireM);
      f.position.set(Math.cos(a)*62*SC,Math.sin(a)*40*SC,0);f.rotation.z=-a+Math.PI/2;eye.add(f);lash.push({f,ph:k*0.7});}
    const glow=new THREE.Mesh(new THREE.SphereGeometry(230*SC,16,12),glowM);glow.scale.set(1.4,1,1);eye.add(glow);
    // the halo is deliberately out of scale: the tower is a splinter from a hundred miles off, the Eye is not
    const halo=new THREE.Mesh(new THREE.SphereGeometry((L.haloR||1800),22,16),haloM);halo.scale.set(1.3,0.9,1.3);
    halo.position.set(x,EY,z);halo.userData.noShadow=true;scene.add(halo);
    const bloomM=new THREE.MeshBasicMaterial({color:0xff6a10,transparent:true,opacity:0.035,depthWrite:false});
    const bloom=new THREE.Mesh(new THREE.SphereGeometry((L.haloR||1800)*2.4,18,12),bloomM);
    bloom.scale.set(1.25,0.8,1.25);bloom.position.set(x,EY,z);bloom.userData.noShadow=true;scene.add(bloom);
    // the searching beam, sweeping the plain
    const beamM=new THREE.MeshBasicMaterial({color:0xffb861,transparent:true,opacity:0.08,side:THREE.DoubleSide,depthWrite:false});
    const swivel=new THREE.Group();swivel.position.set(x,EY,z);scene.add(swivel);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(2600,(L.beam||150000),12,1,true).rotateZ(Math.PI/2).translate((L.beam||150000)/2,0,0),beamM);
    beam.rotation.z=-0.10;swivel.add(beam);
    const lamp=new THREE.PointLight(0xff8c22,0,40000);lamp.position.set(x,EY,z);scene.add(lamp);
    animHooks.push(now=>{const n=nightF(hour());
      const fl=0.7+0.3*Math.sin(now*0.0027)+0.16*Math.sin(now*0.0091);
      fireM.opacity=Math.min(1,0.8+0.2*fl);glowM.opacity=(0.4+0.28*n)*fl;haloM.opacity=(0.08+0.09*n)*fl;
      ball.scale.set(1.5+0.09*fl,0.78+0.05*fl,0.5);
      for(const q of lash){const k=0.6+0.5*Math.sin(now*0.006+q.ph);q.f.scale.set(0.8+0.3*k,k,0.8+0.3*k);}
      const sweep=now*0.000045;eye.rotation.y=sweep;swivel.rotation.y=sweep;
      lamp.intensity=(1.4+1.6*n)*fl;beamM.opacity=(0.05+0.07*n)*fl;bloomM.opacity=(0.03+0.035*n)*fl;});
    return g;},
  blackgate(L,x,z){
    // The Morannon. It closes the slot of Cirith Gorgor and nothing else gets through: rock to the left,
    // rock to the right, and between them a wall of iron ribs with the Towers of the Teeth standing on the
    // shoulders either side. The wall is built as columns rather than a slab because that is what it is in
    // every shot of it - vertical members set side by side, banded across, and a palisade of spikes along
    // the whole top edge. Everything here merges down to a handful of meshes.
    const H=L.height||900,W=L.width||7600,A=(typeof L.turn==='number')?L.turn:-0.7854,parts=[];
    const iron=new THREE.MeshPhongMaterial({color:0x22211d,specular:0x3a3630,shininess:9,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x161614,specular:0x2e2b27,shininess:6,flatShading:true});
    const rock=new THREE.MeshPhongMaterial({color:0x2c2822,specular:0x201d19,shininess:3,flatShading:true});
    const ux=Math.cos(A),uz=Math.sin(A);
    const at=(u,v)=>[x+ux*u-uz*v,z+uz*u+ux*v];          // u along the wall, +v inward towards Udun
    const bx=(u,v,y,w,h,d,m)=>{const [px,pz]=at(u,v),b=box(px,y,pz,w,h,d,m);b.rotation.y=-A;return b;};
    const GY=gh(x,z);                                   // the floor of the pass, which is flat by construction
    const DOOR=W*0.125, THK=240;                        // the opening, and how thick the wall stands
    const hull=[],trim=[],spike=[],crag=[];

    // ---- the wall: ribs, set side by side, each one a little different from the last ----
    const bays=Math.round(W/46);
    for(let k=0;k<bays;k++){
      const u=(k/(bays-1)-0.5)*W;
      if(Math.abs(u)<DOOR/2)continue;
      const s=Math.abs(u)/(W/2), n=((k*37)%7)/7;
      const hh=H*(0.9+n*0.16)*(1-0.12*s*s);             // it falls away a little towards the rock
      hull.push(bx(u,0,GY,W/bays*0.92,hh,THK,k%2?iron:dark));
      if(k%4===0)hull.push(bx(u,-THK*0.34,GY,W/bays*0.5,hh*1.06,THK*0.5,dark));   // the heavier members
      // the palisade: a spike to every rib, and every third one twice the length
      const tall=(k%3===0)?1.9:1;
      const sp=new THREE.Mesh(new THREE.ConeGeometry(W/bays*0.2,H*0.2*tall,4).translate(0,H*0.1*tall,0),dark);
      const [sx,sz]=at(u,-THK*0.18);sp.position.set(sx,GY+hh,sz);sp.rotation.set(-0.16,A,0);spike.push(sp);
    }
    // the banding: courses run the whole length and are the only horizontal thing on it
    for(const f of [0.34,0.62,0.86])trim.push(bx(0,-THK*0.06,GY+H*f,W,H*0.035,THK*1.1,iron));
    trim.push(bx(0,-THK*0.05,GY+H*0.99,W,H*0.05,THK*1.16,dark));        // the parapet

    // ---- the rampart ----
    // What a wall this size actually carries: a walk along the top wide enough to move a company on, corbels
    // and machicolations under it so the ground at the foot can be reached, a stair every few hundred metres
    // up from the inside, and a brazier between every second pair of teeth.
    {
      trim.push(bx(0,-THK*0.62,GY+H*0.9,W,H*0.045,THK*0.5,iron));          // the walk, corbelled out inside
      for(let k=0;k<Math.round(W/120);k++){
        const u=(k/(Math.round(W/120)-1)-0.5)*W;
        if(Math.abs(u)<DOOR/2)continue;
        trim.push(bx(u,-THK*0.55,GY+H*0.83,60,H*0.07,THK*0.34,dark));      // the corbels under it
        if(k%2===0)trim.push(bx(u,-THK*0.72,GY+H*0.4,70,H*0.42,THK*0.36,dark));   // buttresses on the inside face
      }
      // stairs up the inside face
      for(let k=0;k<8;k++){
        const u=(k/7-0.5)*W*0.86;
        if(Math.abs(u)<DOOR)continue;
        for(let j=0;j<12;j++)
          trim.push(bx(u+j*26,-THK*0.75-j*14,GY+H*0.075*j,26,H*0.07,120,iron));
      }
    }
    // ---- the ground in front of it ----
    // A ditch, the spoil from it thrown up as a bank, and the road brought across on a causeway that can be
    // seen from the parapet for its whole length. Nothing comes at this wall without being looked at.
    {
      for(let k=0;k<Math.round(W/300);k++){
        const u=(k/(Math.round(W/300)-1)-0.5)*W*1.06;
        crag.push(bx(u,THK*4.2,GY-40,320,80,520,rock));                    // the bank
        crag.push(bx(u,THK*2.6,GY-150,320,120,420,dark));                  // and the ditch behind it
      }
      for(let k=0;k<7;k++){
        crag.push(bx(0,THK*(1.4+k*0.9),GY-4,DOOR*0.8,40,THK*0.9,iron));    // the causeway
        for(const sd of [-1,1])
          trim.push(bx(sd*DOOR*0.45,THK*(1.4+k*0.9),GY+H*0.04,50,H*0.08,50,dark));
      }
    }
    // ---- the gate: two leaves, ribbed the same way, and they open ----
    // The Morannon is a gate, and a gate that never moves is a wall with a pattern on it. Each leaf is built
    // in its own frame, hinged on its jamb, and swung back against the inside face when a host comes up the
    // road - which is what the thing is for: nothing gets through except what Barad-dur sends through.
    const leaves=[];
    for(const sd of [-1,1]){
      const g=new THREE.Group();
      const [px,pz]=at(sd*DOOR*0.5,-THK*0.12);
      g.position.set(px,GY,pz);g.rotation.y=-A;          // local x runs along the wall, local z inward
      for(let k=0;k<8;k++){
        const u=-sd*(k+0.5)*(DOOR*0.5/8);
        const rib=new THREE.Mesh(new THREE.BoxGeometry(DOOR*0.5/8*0.86,H*(1.02+((k*13)%3)*0.02),THK*0.8)
          .translate(0,H*(1.02+((k*13)%3)*0.02)/2,0),k%2?dark:iron);
        rib.position.set(u,0,0);g.add(rib);
        if(k%3===0){const band=new THREE.Mesh(new THREE.BoxGeometry(DOOR*0.5/8,H*0.05,THK*0.9),iron);
          band.position.set(u,H*0.62,0);g.add(band);}
      }
      // the boss and the pull-ring, so the leaf reads as a door rather than as more wall
      const boss=new THREE.Mesh(new THREE.CylinderGeometry(DOOR*0.05,DOOR*0.05,THK*0.3,8).rotateX(Math.PI/2),iron);
      boss.position.set(-sd*DOOR*0.22,H*0.5,-THK*0.5);g.add(boss);
      scene.add(g);leaves.push({g,sd});
      hull.push(bx(sd*DOOR*0.52,-THK*0.12,GY,DOOR*0.06,H*1.16,THK*1.05,dark));   // the jamb it hangs on
    }
    trim.push(bx(0,-THK*0.1,GY+H*1.1,DOOR*1.18,H*0.14,THK*1.05,dark));           // the lintel over them
    for(let k=0;k<9;k++){const u=(k/8-0.5)*DOOR*1.1;                             // and its own spikes
      const sp=new THREE.Mesh(new THREE.ConeGeometry(DOOR*0.022,H*0.3,4).translate(0,H*0.15,0),dark);
      const [sx,sz]=at(u,-THK*0.22);sp.position.set(sx,GY+H*1.24,sz);sp.rotation.set(-0.2,A,0);spike.push(sp);}

    // ---- the Towers of the Teeth, Carchost and Narchost, on the shoulders ----
    for(const sd of [-1,1]){
      const u=sd*W*0.33,[px,pz]=at(u,THK*0.3),gy=gh(px,pz);
      const TH=H*3.4;
      for(let k=0;k<9;k++){                             // a tapering stack, each drum turned off the last
        const t=k/9,w=W*0.026*(1-t*0.56);
        const d=new THREE.Mesh(new THREE.CylinderGeometry(w*0.86,w,TH/9*1.04,6).translate(0,TH/9*0.52,0),k%2?dark:iron);
        d.position.set(px,gy+TH*t,pz);d.rotation.y=A+k*0.19;hull.push(d);
      }
      const spire=new THREE.Mesh(new THREE.ConeGeometry(W*0.015,TH*0.34,6).translate(0,TH*0.17,0),dark);
      spire.position.set(px,gy+TH,pz);spire.rotation.y=A;hull.push(spire);
      for(let k=0;k<8;k++){                             // the fringe of teeth below the spire
        const a=A+k/8*Math.PI*2,r=W*0.018;
        const t2=new THREE.Mesh(new THREE.ConeGeometry(W*0.005,TH*0.24,4).translate(0,TH*0.12,0),dark);
        t2.position.set(px+Math.cos(a)*r,gy+TH*0.92,pz+Math.sin(a)*r);
        t2.rotation.set(Math.sin(a)*0.34,0,-Math.cos(a)*0.34);spike.push(t2);
      }
      // the rock the tower stands on, and the buttress running back into the mountain
      for(let k=0;k<7;k++){
        const cu=u+sd*(W*0.085+k*W*0.036),[cx2,cz2]=at(cu,(((k*17)%5)-2)*THK*0.6);
        const c2=box(cx2,gh(cx2,cz2)-40,cz2,W*0.05+k*W*0.012,H*(1.6+k*0.46),W*0.045+k*W*0.01,rock);
        c2.rotation.y=A+k*0.4;crag.push(c2);
      }
    }

    // ---- the causeway: the only way up to the doors, out on the Dagorlad side ----
    for(let k=0;k<10;k++){
      const v=-THK*0.6-k*W*0.030,w=DOOR*(1.4+k*0.12),y=H*0.10*(1-k/10);
      const [cx2,cz2]=at(0,v);
      const step=box(cx2,gh(cx2,cz2)-40,cz2,w,y+40,W*0.032,rock);
      step.rotation.y=-A;trim.push(step);
      for(const sd of [-1,1]){                          // the parapet either side of it
        const [ex,ez]=at(sd*w*0.52,v);
        const r2=box(ex,gh(ex,ez)-40,ez,W*0.012,y+H*0.05+40,W*0.032,rock);r2.rotation.y=-A;trim.push(r2);
      }
    }

    for(const [set,mat] of [[hull.filter(m=>m.material===iron),iron],[hull.filter(m=>m.material===dark),dark],
                            [trim.filter(m=>m.material===iron),iron],[trim.filter(m=>m.material===dark),dark],
                            [trim.filter(m=>m.material===rock),rock],[spike,dark],[crag,rock]]){
      if(set.length)parts.push(mergeParts(set,mat));
    }
    // ---- the braziers, and the gate working ----
    // Fires on the parapet and on both Teeth, because the only light in this corner of the land is what
    // somebody lit. They flicker; the gate does not, it grinds.
    const fireM=new THREE.MeshBasicMaterial({color:0xff7a22,transparent:true,opacity:0.9,depthWrite:false});
    const fires=[];
    for(let k=0;k<11;k++){
      const u=(k/10-0.5)*W*0.86;if(Math.abs(u)<DOOR*0.8)continue;
      const [fx,fz]=at(u,-THK*0.25);
      const pan=box(fx,GY+H*1.02,fz,W*0.012,H*0.03,W*0.012,iron);pan.rotation.y=-A;group(L,[pan]);
      const fl=new THREE.Mesh(new THREE.ConeGeometry(W*0.009,H*0.09,6),fireM);
      fl.position.set(fx,GY+H*1.08,fz);scene.add(fl);fires.push({fl,ph:k*1.7});
    }
    let open=0,last=0;
    animHooks.push(now=>{
      const dt=Math.min(0.08,(now-(last||now))/1000);last=now;
      // what the gate is for: it opens when a host is on the road, and shuts behind it
      let want=0;const hs=ctx.hosts;
      if(hs&&hs.length){let best=1e9;
        for(const a of hs){const d=Math.hypot(a.g.position.x-x,a.g.position.z-z);if(d<best)best=d;}
        want=best<(L.openAt||14000)?1:0;}
      else want=((now%120000)<40000)?1:0;    // nothing marching: open on a slow cycle, so it is seen to work
      open+=(want-open)*Math.min(1,dt*(want>open?0.16:0.22));
      for(const q of leaves)q.g.rotation.y=-A+q.sd*open*1.62;
      if(ctx.details)ctx.details.blackGate=open>0.9?'open':open<0.1?'shut':(open>0.5?'opening':'closing');
      const f=0.7+0.3*Math.sin(now*0.006);
      fireM.opacity=0.7+0.25*f;
      for(const q of fires)q.fl.scale.set(0.8+0.3*Math.sin(now*0.005+q.ph),0.75+0.45*Math.sin(now*0.009+q.ph),0.8+0.3*Math.cos(now*0.004+q.ph));
    });
    return group(L,parts);},
  windingstair(L,x,z){
    // ---- the Straight Stair and the Winding Stair ----
    // The way over the Ephel Duath that is not the Morannon. A one-kilometre height grid draws this range as
    // a swell, so the face the stair is cut into is built here: a continuous wall of rock a couple of
    // kilometres long, and the stair a pale ledge zig-zagging up it with nothing at all on the outside edge.
    // The first version laid steps on the open hillside and came out as a dark clump the size of a house.
    const A=L.turn||0,g0=gh(x,z),TOP=L.top||900,parts=[];
    const rock=new THREE.MeshPhongMaterial({color:0x272420,specular:0x1a1815,shininess:3,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x1b1916,flatShading:true});
    const step=new THREE.MeshLambertMaterial({color:0x6a635a,flatShading:true});   // cut stone, pale against the face
    const worn=new THREE.MeshLambertMaterial({color:0x585149,flatShading:true});
    const ux=Math.cos(A),uz=Math.sin(A),vx=-uz,vz=ux;      // u: into the mountain, v: along the face
    const at=(u,v,y)=>[x+ux*u+vx*v,y,z+uz*u+vz*v];
    const SPAN=L.span||2600, W=L.width||34;
    // The face is battered: each course of it stands back twenty-six metres on every hundred of height, so
    // anything cut into the face has to follow the same line or it ends up inside the mountain - which is
    // where the first version of the stair was.
    const faceU=y=>0.26*(y-g0)-16;

    // ---- the face ----
    // Built as a stack of courses rather than one slab, each one standing back a little from the one below,
    // so the wall has a batter and a skyline instead of being a rectangle.
    {
      const CO=9;
      for(let c=0;c<CO;c++){
        const hh=TOP/CO, y=g0+c*hh, back=c*26;
        for(let i=0;i<22;i++){
          const v=(i/21-0.5)*SPAN, len=SPAN/21*1.25;
          const d=170+90*Math.sin(i*1.7+c)+40*Math.sin(i*0.6);
          const m=new THREE.Mesh(new THREE.BoxGeometry(len,hh*1.06,d).translate(0,hh/2,0),
            (((i*7+c*3)%11)<3)?dark:rock);
          const [px,py,pz]=at(back+d*0.5+30*Math.sin(i*2.1+c*1.3),v,y);
          m.position.set(px,py,pz);m.rotation.set(0,-A+Math.PI/2+(i%2?0.03:-0.03),0);parts.push(m);
        }
      }
      // the talus at the foot of it
      for(let k=0;k<70;k++){
        const v=(Math.random()-0.5)*SPAN, sz=14+Math.random()*46;
        const [px,py,pz]=at(-40+Math.random()*90,v,g0+Math.random()*60);
        const m=new THREE.Mesh(new THREE.BoxGeometry(sz*1.5,sz,sz*1.2),Math.random()<0.5?dark:rock);
        m.position.set(px,py,pz);m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);parts.push(m);
      }
    }

    // ---- the Straight Stair ----
    // Driven at the face, not across it: "so narrow that the climber groped as he climbed, and felt on
    // either side the sheer bare walls". It goes straight up a cut in the rock for the first third.
    {
      const v0=-SPAN*0.42, n=46, rise=TOP*0.34;
      for(let k=0;k<n;k++){
        const y=g0+rise*(k/n), u=faceU(y);
        const [px,py,pz]=at(u,v0,y);
        const b=box(px,py,pz,W*0.8,rise/n*1.6,W*0.7,k%4===0?worn:step);b.rotation.y=-A;parts.push(b);
        if(k%6===0){                                   // the walls either side of the cut
          for(const sd of [-1,1]){
            const [wx,wy,wz]=at(u,v0+sd*W*0.9,y-40);
            const w=box(wx,wy,wz,W*0.9,110,W*0.8,rock);w.rotation.y=-A;parts.push(w);}
        }
      }
    }

    // ---- the Winding Stair ----
    // Switchbacks up the face above it, each flight shorter than the last, each turn cut back into the rock
    // with the drop on the other side and nothing between.
    {
      let y0=g0+TOP*0.34, v0=-SPAN*0.42, dir=1;
      for(let f=0;f<8;f++){
        const len=(L.flight||300)*(1-f*0.06), rise=TOP*0.082, n=Math.max(10,Math.round(len/13));
        for(let k=0;k<n;k++){
          const v=v0+dir*(k/n)*len, y=y0+rise*(k/n), u=faceU(y);
          const [px,py,pz]=at(u,v,y);
          const b=box(px,py,pz,len/n*1.5,rise/n*2.2,W*0.75,k%5===0?worn:step);
          b.rotation.y=-A;parts.push(b);
          // the ledge it sits on, standing out of the face
          if(k%3===0){const [lx,ly,lz]=at(u+16,v,y-14);
            const l=box(lx,ly,lz,len/n*4,16,W*1.5,rock);l.rotation.y=-A;parts.push(l);}
          // and a kerb on the outside, worn away in places
          if(k%2===0&&Math.random()<0.7){const [kx,ky,kz]=at(u+W*0.45,v,y+3);
            parts.push(box(kx,ky,kz,len/n*1.4,6,4,worn));}
        }
        // the turn: a landing cut back into the rock
        {const [tx,ty,tz]=at(faceU(y0+rise),v0+dir*len,y0+rise);
         const t2=box(tx,ty,tz,W*1.4,10,W*1.4,worn);t2.rotation.y=-A;parts.push(t2);}
        v0+=dir*len;y0+=rise;dir=-dir;
      }
      // ---- the cleft at the head of it ----
      // Two horns of rock with the way through between them, and the dark of the tunnel behind.
      const uTop=faceU(y0);
      for(const sd of [-1,1]){
        const [wx,wy,wz]=at(uTop+60,v0+sd*W*2.4,y0-120);
        const w=new THREE.Mesh(new THREE.BoxGeometry(150,TOP*0.42,190).translate(0,TOP*0.21,0),rock);
        w.position.set(wx,wy,wz);w.rotation.set(0,-A+sd*0.22,-sd*0.05);parts.push(w);
        const cap=new THREE.Mesh(new THREE.ConeGeometry(70,180,5),dark);
        cap.position.set(wx,wy+TOP*0.42,wz);parts.push(cap);
      }
      {const [cx2,cy2,cz2]=at(uTop+150,v0,y0);
       const hole=new THREE.Mesh(new THREE.CylinderGeometry(46,52,90,8,1,true).rotateZ(Math.PI/2),
         new THREE.MeshBasicMaterial({color:0x050405,side:THREE.DoubleSide}));
       hole.position.set(cx2,cy2+46,cz2);hole.rotation.y=-A+Math.PI/2;parts.push(hole);
       const lintel=box(cx2,cy2+92,cz2,150,40,150,rock);lintel.rotation.y=-A;parts.push(lintel);}
    }
    return group(L,parts);},

  shelob(L,x,z){
    // Torech Ungol: the mouth of it in the cliff, the webs across the way in, and what is left of what has
    // come this way before. Nothing is modelled of what lives here - it is a hole that smells, and the point
    // of it is that you cannot see in.
    const g0=gh(x,z),A=L.turn||0,parts=[];
    const rock=new THREE.MeshPhongMaterial({color:0x272420,specular:0x1a1815,shininess:3,flatShading:true});
    const dark=new THREE.MeshBasicMaterial({color:0x050405});
    const webM=new THREE.MeshLambertMaterial({color:0xb9b2a4,transparent:true,opacity:0.42,side:THREE.DoubleSide,depthWrite:false});
    const boneM=new THREE.MeshLambertMaterial({color:0xa9a294});
    const R0=L.size||120;
    const ux=Math.cos(A),uz=Math.sin(A);
    // the cliff it is cut into, and the arch of the mouth
    for(let k=0;k<9;k++){const a=(k/8)*Math.PI,r=R0*1.25;
      const b=box(x+Math.cos(A+Math.PI/2)*((k/8-0.5)*R0*2.6),g0-40,z+Math.sin(A+Math.PI/2)*((k/8-0.5)*R0*2.6),
        R0*0.5,R0*(1.6+0.5*Math.sin(k*1.7)),R0*0.9,rock);
      b.rotation.y=-A+((k%3)-1)*0.18;parts.push(b);}
    const mouth=new THREE.Mesh(new THREE.CylinderGeometry(R0*0.52,R0*0.62,R0*0.9,7,1,true).rotateX(Math.PI/2),dark);
    mouth.position.set(x+ux*R0*0.35,g0+R0*0.45,z+uz*R0*0.35);mouth.rotation.y=-A;parts.push(mouth);
    const back=new THREE.Mesh(new THREE.CircleGeometry(R0*0.5,10),dark);
    back.position.set(x+ux*R0*0.78,g0+R0*0.45,z+uz*R0*0.78);back.rotation.y=-A+Math.PI/2;parts.push(back);
    // the webs: sheets across the opening, and cables of it anchored to the rock either side
    const webs=[];
    for(let k=0;k<5;k++){
      const w=new THREE.Mesh(new THREE.PlaneGeometry(R0*(1.1-k*0.12),R0*(1.0-k*0.1),3,3),webM);
      w.position.set(x+ux*R0*(0.05+k*0.16),g0+R0*(0.42+0.03*k),z+uz*R0*(0.05+k*0.16));
      w.rotation.y=-A+Math.PI/2;scene.add(w);webs.push({w,ph:k*1.3});
    }
    for(let k=0;k<14;k++){
      const a=k/14*Math.PI*2,len=R0*(0.8+(k%4)*0.3);
      const c=new THREE.Mesh(new THREE.CylinderGeometry(R0*0.012,R0*0.006,len,4).translate(0,len/2,0),webM);
      c.position.set(x+ux*R0*0.2+Math.cos(a)*R0*0.4,g0+R0*0.45+Math.sin(a)*R0*0.4,z+uz*R0*0.2+Math.sin(a)*R0*0.4);
      c.rotation.set(Math.PI/2+Math.sin(a)*0.5,-A+Math.cos(a)*0.4,0);parts.push(c);
    }
    // bones, outside, where they were dropped
    for(let k=0;k<26;k++){
      const a=A+(Math.random()-0.5)*2.2,r=R0*(0.9+Math.random()*2.2);
      const bx2=x+Math.cos(a)*r,bz2=z+Math.sin(a)*r,len=R0*(0.05+Math.random()*0.12);
      const b=new THREE.Mesh(new THREE.CylinderGeometry(R0*0.012,R0*0.015,len,4),boneM);
      b.position.set(bx2,gh(bx2,bz2)+R0*0.02,bz2);b.rotation.set(Math.PI/2,Math.random()*3,Math.random()*3);
      parts.push(b);
    }
    const g=group(L,parts);
    animHooks.push(now=>{const t=now*0.0009;
      for(const q of webs){q.w.scale.set(1+0.03*Math.sin(t+q.ph),1+0.04*Math.sin(t*1.3+q.ph),1);
        q.w.material.opacity=0.34+0.1*Math.sin(t*0.7+q.ph);}});
    return g;},

  morgul(L,x,z){   // Minas Morgul: a tower city in its valley, lit the wrong colour
    const H=L.height||420,g0=gh(x,z),parts=[],A=L.turn||0;
    const pale=new THREE.MeshPhongMaterial({color:0x6f7a72,specular:0x9fb0a6,shininess:24,flatShading:true});
    const glowM=new THREE.MeshBasicMaterial({color:0x8affc4,transparent:true,opacity:0.5});
    for(let k=0;k<7;k++){const a=A+k/7*Math.PI*2,r=180+((k*31)%4)*50;
      const w=box(x+Math.cos(a)*r,gh(x+Math.cos(a)*r,z+Math.sin(a)*r),z+Math.sin(a)*r,150,H*0.28,60,pale);
      w.rotation.y=-a;parts.push(w);}
    const body=new THREE.Mesh(new THREE.CylinderGeometry(52,96,H*0.7,8).translate(0,H*0.35,0),pale);
    body.position.set(x,g0,z);parts.push(body);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(40,58,H*0.3,8).translate(0,H*0.15,0),pale);
    top.position.set(x,g0+H*0.7,z);top.rotation.y=0.4;parts.push(top);
    const crown=new THREE.Mesh(new THREE.ConeGeometry(46,H*0.22,8).translate(0,H*0.11,0),pale);
    crown.position.set(x,g0+H,z);parts.push(crown);
    const lit=new THREE.Mesh(new THREE.SphereGeometry(40,14,10),glowM);lit.position.set(x,g0+H*0.82,z);parts.push(lit);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(320,14,10),new THREE.MeshBasicMaterial({color:0x7affbe,transparent:true,opacity:0.08,depthWrite:false}));
    halo.position.set(x,g0+H*0.8,z);scene.add(halo);
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hour()),k=0.7+0.3*Math.sin(now*0.0011);
      glowM.opacity=(0.3+0.35*n)*k;halo.material.opacity=(0.05+0.07*n)*k;});
    return g;},
  watchtower2(L,x,z){   // Cirith Ungol: a tower of three tiers on its shoulder of rock, watching its own pass
    const H=L.height||260,g0=gh(x,z),parts=[],A=L.turn||0;
    const stone=new THREE.MeshPhongMaterial({color:0x2e2c28,specular:0x46423c,shininess:8,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x201f1d,specular:0x34302b,shininess:6,flatShading:true});
    for(let k=0;k<3;k++){const w=120-k*30,hh=H*(0.34-k*0.04);
      const t=new THREE.Mesh(new THREE.CylinderGeometry(w*0.86,w,hh,6).translate(0,hh/2,0),k%2?stone:dark);
      t.position.set(x,g0+H*(k*0.3),z);t.rotation.y=A+k*0.4;parts.push(t);}
    const horn=new THREE.Mesh(new THREE.ConeGeometry(52,H*0.3,6).translate(0,H*0.15,0),dark);
    horn.position.set(x,g0+H*0.9,z);parts.push(horn);
    for(let k=0;k<5;k++){const a=A+k/5*Math.PI*2,r=140;
      const w=box(x+Math.cos(a)*r,gh(x+Math.cos(a)*r,z+Math.sin(a)*r),z+Math.sin(a)*r,110,H*0.16,50,stone);
      w.rotation.y=-a;parts.push(w);}
    const fire=new THREE.MeshBasicMaterial({color:0xff7a2a,transparent:true,opacity:0.8});
    const brazier=new THREE.Mesh(new THREE.ConeGeometry(16,44,6).translate(0,22,0),fire);brazier.position.set(x,g0+H*0.92,z);parts.push(brazier);
    const g=group(L,parts);
    animHooks.push(now=>{fire.opacity=(0.4+0.45*nightF(hour()))*(0.7+0.3*Math.sin(now*0.008));});
    return g;},
  };
}
