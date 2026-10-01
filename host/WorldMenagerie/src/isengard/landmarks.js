// Isengard: the Ring and the tower in the middle of it. Fan work - every shape here is this project's own
// low-poly geometry, modelled from the description; nothing from any book, film or game is used. Tolkien's world
// belongs to the Tolkien Estate.
//
// Neither is in the heightfield. A fifty-metre grid cannot hold a cliff (the lesson of Minas Tirith's keel), so
// both are closed solids with their feet below the ground, and the ground is just the plain and the valley.
import { mkRng, makeNoise } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,scene,animHooks,gh,box,group,mergeParts}=api;
  const byMat=parts=>{const m=new Map();for(const p of parts){let a=m.get(p.material);if(!a){a=[];m.set(p.material,a);}a.push(p);}
    const out=[];for(const [mat,list] of m){const g=mergeParts(list,mat);g.castShadow=true;g.receiveShadow=true;out.push(g);}return out;};
  return {

  ringwall(L,x,z){
    // ---- the Ring of Isengard ----
    // "A great ring-wall of stone, like towering cliffs": black rock, a mile across inside, with one entrance -
    // "a great arch delved in the southern wall, and through it a long tunnel hewn in the black rock, closed at
    // either end with mighty doors of iron". On its inner side "chambers, halls and passages, cut and tunnelled
    // back into the walls, so that all the open circle was overlooked by countless windows and dark doors". The
    // Isen comes in under it at the north-east through a grating and goes out beside the gate.
    //
    // One mesh, like the keel of Minas Tirith: columns round the circle, rows down each face, pushed in and out by
    // noise stretched up the face so it reads as cliff, and dark with a little stain. Where there is an opening
    // (the tunnel, the culverts) the columns across it stop at the top of the arch, and the passage is lined.
    const RI=L.inner||790,RO=L.outer||860,H=L.height||55,base=L.base!==undefined?L.base:gh(x,z)+ (L.lift||0);
    const OPEN=(L.openings||[]).map(([a,w,top,kind])=>({a,w,top,kind}));
    const NZ=makeNoise(mkRng(1331)),R=mkRng(1332),parts=[];
    const rockDark=new THREE.Color(0x232326),rockMid=new THREE.Color(0x35353a),rockLight=new THREE.Color(0x4a4a50),c=new THREE.Color();
    const at=(a,r)=>[x+Math.cos(a)*r,z+Math.sin(a)*r];
    const opening=a=>{for(const o of OPEN){const d=Math.abs(((a-o.a)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);if(d<o.w)return o;}return null;};
    // ---- the wall, in segments ----
    // Forty-eight of them round the circle, each built twice: whole, and broken - its top torn down to a jagged
    // stump in the middle and tapering back to the full height at its ends, so that no cut face ever shows. The
    // Ents break them (events.js, ctx.ring.breach), and the Treegarth has the wall thrown down in ten places; a
    // segment with the gate or a grating in it is never broken.
    const N=1440,ROWS=9,SEG=48,PER=N/SEG;
    const vmat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide});
    const foot=(a,r)=>{const [px,pz]=at(a,r);return Math.min(gh(px,pz),base)-12;};
    // how far down a broken segment is torn at column i of its PER+1, as a fraction of the wall's height
    const tear=(seg,i)=>{const u=i/PER,w=Math.min(1,Math.max(0,Math.min(u,1-u)/0.22)),ww=w*w*(3-2*w);
      const k=0.45+0.18*NZ.vn(seg*7.3+u*9,3.1)+0.1*NZ.vn(seg*3.1+u*31,8.7);return ww*k;};   // never lower than a quarter: the flood must not spill out
    const buildSeg=(seg,broken)=>{const P=[],CL=[],IDX=[],faces=[[],[]],tops=[];
      for(let side=0;side<2;side++){const r0=side?RO:RI,sd=side?1:-1;
        for(let ii=0;ii<=PER;ii++){const i=seg*PER+ii,a=i/N*Math.PI*2,o=opening(a),fy=o?base+o.top:foot(a,r0),col=[];
          const topY=base+H*(broken?1-tear(seg,ii):1)+(broken?4*(NZ.vn(a*900,side)-0.5)*tear(seg,ii):0);tops[ii]=topY;
          for(let r=0;r<=ROWS;r++){const k=r/ROWS,y=topY+(fy-topY)*k;
            const d=r===0?(broken?2*(NZ.vn(a*700,side+4)-0.5):0):(side?1:0.35)*(6*(NZ.fbm(a*140+side*40,y/40)-0.45)+1.5*(NZ.vn(a*420,y/12)-0.5));
            const [px,pz]=at(a,r0+sd*d);P.push(px,y,pz);
            const st=Math.max(0,NZ.fbm(a*90+side*7,y/70)*2-0.9);
            c.copy(rockMid).lerp(rockLight,0.25*(1-k)).lerp(rockDark,0.5*st+0.25*k);if(broken&&r<2)c.lerp(rockLight,0.35);c.multiplyScalar(0.9+0.2*NZ.vn(a*300,y/6));
            CL.push(c.r,c.g,c.b);col.push(P.length/3-1);}
          faces[side].push(col);}}
      for(let sd=0;sd<2;sd++)for(let i=0;i<PER;i++)for(let r=0;r<ROWS;r++){const A=faces[sd],a=A[i][r],b=A[i+1][r],c2=A[i+1][r+1],d=A[i][r+1];
        if(sd===0)IDX.push(a,b,c2,a,c2,d);else IDX.push(a,c2,b,a,d,c2);}
      // the top: rough rock; broken, the raw rock of the break, paler
      const t0=P.length/3;for(let ii=0;ii<=PER;ii++){const i=seg*PER+ii,a=i/N*Math.PI*2;for(const r0 of [RI,RO]){const [px,pz]=at(a,r0);
          P.push(px,tops[ii]+(broken?0:3*(NZ.vn(a*200,r0)-0.5)),pz);c.copy(rockLight).multiplyScalar((broken?1.15:0.85)+0.2*NZ.vn(a*500,1));CL.push(c.r,c.g,c.b);}}
      for(let ii=0;ii<PER;ii++){const a=t0+ii*2;IDX.push(a,a+1,a+3,a,a+3,a+2);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(CL,3));
      g.setIndex(IDX);g.computeVertexNormals();const m=new THREE.Mesh(g,vmat);m.castShadow=m.receiveShadow=true;m.userData.wireCat='landmark';return m;};
    const segOpen=seg=>{for(let ii=0;ii<=PER;ii++)if(opening((seg*PER+ii)/N*Math.PI*2))return true;return false;};
    const segs=[];const wallGroup=new THREE.Group();
    const rockBits=new THREE.MeshLambertMaterial({color:0x34343a,flatShading:true});
    for(let seg=0;seg<SEG;seg++){const whole=buildSeg(seg,false);wallGroup.add(whole);
      const q={whole,broken:null,rubble:null,open:segOpen(seg),isBroken:false,a:(seg+0.5)/SEG*Math.PI*2};
      if(!q.open){q.broken=buildSeg(seg,true);q.broken.visible=false;wallGroup.add(q.broken);
        // what came off it: boulders in a fan on both sides of the break
        const bits=[];for(let k=0;k<60;k++){const u=0.2+R()*0.6,a=(seg+u)/SEG*Math.PI*2,out=R()<0.5,r0=out?RO+2+R()*30:RI-2-R()*30,[px,pz]=at(a,r0),sz=1.5+R()*4.5;
          const b=new THREE.Mesh(new THREE.DodecahedronGeometry(sz,0),rockBits);b.position.set(px,Math.max(gh(px,pz),out?-1e9:base-14)+sz*0.4,pz);b.rotation.set(R()*3,R()*3,R()*3);bits.push(b);}
        q.rubble=mergeParts(bits,rockBits);q.rubble.visible=false;wallGroup.add(q.rubble);}
      segs.push(q);}
    const wall=wallGroup;
    // ---- the openings: the tunnel, and the culverts ----
    const dark=new THREE.MeshLambertMaterial({color:0x121214}),iron=new THREE.MeshPhongMaterial({color:0x2e3034,specular:0x777d86,shininess:30,flatShading:true});
    const lining=new THREE.MeshLambertMaterial({color:0x2a2a2e,flatShading:true});
    const doors=[];
    for(const o of OPEN){const len=RO-RI+2,cr=(RI+RO)/2,[cx,cz]=at(o.a,cr),w=Math.sin(o.w)*cr*2,ht=o.top;
      // the barrel of the passage: two walls and a vault, along the radius
      const rot=-o.a;
      for(const sd of [-1,1]){const m=new THREE.Mesh(new THREE.BoxGeometry(len,ht+2,1.2).translate(0,(ht+2)/2,0),lining);
        m.position.set(cx-Math.sin(o.a)*sd*w/2,base-2,cz+Math.cos(o.a)*sd*w/2);m.rotation.y=rot;parts.push(m);}
      const vault=new THREE.Mesh(new THREE.CylinderGeometry(w/2,w/2,len,12,1,true,0,Math.PI).rotateZ(Math.PI/2).rotateX(Math.PI/2),lining);
      vault.position.set(cx,base+ht-w/2,cz);vault.rotation.y=rot;vault.material=lining;parts.push(vault);
      const floor=new THREE.Mesh(new THREE.BoxGeometry(len,1,w),o.kind==='water'?dark:lining);floor.position.set(cx,base-(o.kind==='water'?5.5:0.4),cz);floor.rotation.y=rot;parts.push(floor);
      // the mouth: a dark arch-shape set in each face, round what is left of the face above it
      for(const r0 of [RI-0.6,RO+0.6]){const [mx,mz]=at(o.a,r0);
        const lintel=new THREE.Mesh(new THREE.BoxGeometry(3,3.4,w+6),iron);lintel.position.set(mx,base+ht+0.2,mz);lintel.rotation.y=rot;parts.push(lintel);
        if(o.kind==='water'){ // the grating the river comes in by
          for(let b=-3;b<=3;b++){const bar=new THREE.Mesh(new THREE.BoxGeometry(0.5,ht+6,0.5),iron);const off=b/3.5*w/2;
            bar.position.set(mx-Math.sin(o.a)*off,base-5+(ht+6)/2,mz+Math.cos(o.a)*off);parts.push(bar);}
          const rail=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,w),iron);rail.position.set(mx,base+ht*0.5,mz);rail.rotation.y=rot;parts.push(rail);}
        else{ // the doors of iron, standing open against the walls of the passage
          for(const sd of [-1,1]){const p=new THREE.Group();p.position.set(mx-Math.sin(o.a)*sd*w/2,base,mz+Math.cos(o.a)*sd*w/2);
            const leaf=new THREE.Mesh(new THREE.BoxGeometry(1.2,ht-1,w/2).translate(0,(ht-1)/2,-sd*w/4),iron);p.add(leaf);
            for(let s=0;s<5;s++){const st=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,w/2+0.2).translate(0,2+s*(ht-4)/4,-sd*w/4),dark);p.add(st);}
            p.rotation.y=rot+(r0<cr?1:-1)*sd*1.35;scene.add(p);doors.push({p,sd,r0,rot,open:rot+(r0<cr?1:-1)*sd*1.35,shut:rot});}}}}

    // ---- the chambers in the inner face ----
    // Rows of windows and doors all round the inside of the wall: dark slots, instanced. The bottom row are doors.
    const winSeg=[],winMat=[],litSeg=[],litMat=[];let win=null,lit=null;
    {const n=2600,D=new THREE.Object3D();win=new THREE.InstancedMesh(new THREE.BoxGeometry(0.6,1,1),dark,n);let k=0;
     for(let i=0;i<n*1.4&&k<n;i++){const a=R()*Math.PI*2;if(opening(a))continue;const row=Math.floor(R()*6),door=row===0;
       const y=base+(door?1.6:6+row*8+R()*2),h=door?3.4:1.6+R()*0.8,w=door?2.2:0.9+R()*0.5;const [px,pz]=at(a,RI-0.35);
       D.position.set(px,y,pz);D.rotation.set(0,-a,0);D.scale.set(1,h,w);D.updateMatrix();win.setMatrixAt(k,D.matrix);
       winSeg[k]=Math.floor(a/(Math.PI*2)*SEG)%SEG;winMat[k]=D.matrix.clone();k++;}
     win.count=k;win.frustumCulled=false;scene.add(win);
     // some of them lit, at night: Saruman's servants are in there
     const litM=new THREE.MeshBasicMaterial({color:0xffb45a,transparent:true,opacity:0});lit=new THREE.InstancedMesh(win.geometry,litM,380);let j=0;
     for(let i=0;i<380;i++){const a=R()*Math.PI*2;if(opening(a))continue;const row=1+Math.floor(R()*5),[px,pz]=at(a,RI-0.45);
       D.position.set(px,base+6+row*8,pz);D.rotation.set(0,-a,0);D.scale.set(1,1.8,1.1);D.updateMatrix();lit.setMatrixAt(j,D.matrix);
       litSeg[j]=Math.floor(a/(Math.PI*2)*SEG)%SEG;litMat[j]=D.matrix.clone();j++;}
     lit.count=j;lit.frustumCulled=false;scene.add(lit);(ctx.warParts=ctx.warParts||[]).push(lit);
     animHooks.push(()=>{litM.opacity=0.15+0.8*api.nightF(api.hour());});}

    // breaking and mending: the whole segment swapped for its broken form and its rubble, and the windows that
    // were in it gone with it
    const ZERO=new THREE.Matrix4().makeScale(0,0,0);
    const refreshWindows=()=>{for(let k=0;k<winSeg.length;k++)win.setMatrixAt(k,segs[winSeg[k]].isBroken?ZERO:winMat[k]);win.instanceMatrix.needsUpdate=true;
      for(let k=0;k<litSeg.length;k++)lit.setMatrixAt(k,segs[litSeg[k]].isBroken?ZERO:litMat[k]);lit.instanceMatrix.needsUpdate=true;};
    const setBroken=(i,b)=>{const q=segs[i];if(!q||q.open||q.isBroken===b)return false;q.isBroken=b;q.whole.visible=!b;q.broken.visible=b;q.rubble.visible=b;return true;};
    // the Treegarth's breaches: most on the east, where the Ents came at it, and a few round the rest
    const TG=[1,3,4,6,44,46,47,9,17,31].filter(i=>!segs[i].open);
    ctx.ring={x,z,RI,RO,H,base,openings:OPEN,doors,SEG,segs,
      segAt(a){return Math.floor((((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*SEG)%SEG;},
      breach(i){const ch=setBroken(i,true);if(ch)refreshWindows();return ch;},
      mend(){let ch=false;for(let i=0;i<SEG;i++)ch=setBroken(i,false)||ch;if(ch)refreshWindows();},
      setDoors(open){for(const d of doors)d.p.rotation.y=open?d.open:d.shut;}};
    (ctx.onWar=ctx.onWar||[]).push(on=>{ctx.ring.mend();if(!on){for(const i of TG)setBroken(i,true);refreshWindows();}});
    return group(L,[wall,...byMat(parts)]);},

  orthanc(L,x,z){
    // ---- Orthanc ----
    // "A peak and island of stone, black and gleaming hard: four mighty piers of many-sided stone were welded into
    // one, but near the summit they opened into gaping horns, their pinnacles sharp as the points of spears,
    // keen-edged as knives. Between them was a narrow space, and there upon a floor of polished stone, written with
    // strange signs, a man might stand five hundred feet above the plain." The book's five hundred feet is the
    // default; the page raises it (isengard.json), because against a Ring a mile across it read as a stump. At its foot a stair of twenty-seven
    // broad steps up to its one door, and above the door a window with a balcony, where Saruman comes out.
    //
    // Four prisms, many-sided and ribbed up their angles, set close enough that they read as one tower, each
    // going on above the platform as a horn that curves outward and comes to a point. Black, with a hard shine.
    const H=L.height||152,base=L.base!==undefined?L.base:gh(x,z),A=L.turn||0,parts=[];
    const stone=new THREE.MeshPhongMaterial({color:0x17181c,specular:0x566070,shininess:70,flatShading:true});
    const edge=new THREE.MeshPhongMaterial({color:0x22242a,specular:0x7a8494,shininess:90,flatShading:true});
    const polished=new THREE.MeshPhongMaterial({color:0x2a2c33,specular:0xb0b8c8,shininess:140});
    const dark=new THREE.MeshLambertMaterial({color:0x060607});
    const PR=L.pier||12.5,OFF=L.spread||9.5,SIDES=7,PH=H*0.78;   // the piers, and how far each stands off the middle
    const at=(u,v)=>[x+u*Math.cos(A)-v*Math.sin(A),z+u*Math.sin(A)+v*Math.cos(A)];
    const piers=[[1,1],[1,-1],[-1,1],[-1,-1]];
    for(const [su,sv] of piers){
      const [px,pz]=at(su*OFF,sv*OFF);
      // the pier: its foot flared out like a root into the rock of the plain, then in three lengths, each a
      // little narrower - which is what keeps it from reading as a bundle of pencils
      {const m=new THREE.Mesh(new THREE.CylinderGeometry(PR*1.02,PR*1.55,PH*0.16,SIDES,1).translate(0,PH*0.08,0),stone);
       m.position.set(px+su*2.5,base-1,pz+sv*2.5);m.rotation.y=Math.atan2(sv,su);parts.push(m);}
      const segs=[[PH*0.15,PH*0.42,1.02,0.95],[PH*0.42,PH*0.72,0.95,0.88],[PH*0.72,PH,0.88,0.84]];
      for(const [y0,y1,r0,r1] of segs){const m=new THREE.Mesh(new THREE.CylinderGeometry(PR*r1,PR*r0,y1-y0,SIDES,1).translate(0,(y1-y0)/2,0),stone);
        m.position.set(px,base+y0,pz);m.rotation.y=Math.atan2(sv,su);parts.push(m);}
      // the ribs up its angles
      for(let k=0;k<SIDES;k++){const a=k/SIDES*Math.PI*2+Math.atan2(sv,su),rr=PR*0.93;
        const rib=new THREE.Mesh(new THREE.BoxGeometry(1.1,PH*0.98,1.1).translate(0,PH*0.49,0),edge);
        rib.position.set(px+Math.cos(a)*rr,base,pz+Math.sin(a)*rr);rib.rotation.y=-a;rib.rotation.z=0;parts.push(rib);}
      // the horn: out and up from the top of the pier, in lengths that lean further out as they go, to a point
      let hx=px,hy=base+PH,hz=pz,r=PR*0.84;const out=Math.atan2(pz-z,px-x);
      // longer than the drop to the platform, and splaying further at each length: claws, not a crown
      const HN=6,HL=(H-PH)*1.9/HN;
      for(let k=0;k<HN;k++){const tilt=0.1+k*0.15,nr=r*(k===HN-1?0.02:0.8);
        const m=new THREE.Mesh(new THREE.CylinderGeometry(nr,r,HL,SIDES,1).translate(0,HL/2,0),k%2?edge:stone);
        m.position.set(hx,hy,hz);m.rotation.set(0,0,0);m.rotateOnWorldAxis(new THREE.Vector3(-Math.sin(out),0,Math.cos(out)),-tilt);parts.push(m);
        const up=new THREE.Vector3(0,HL,0).applyEuler(m.rotation);hx+=up.x;hy+=up.y;hz+=up.z;r=nr;}}
    // the core the piers are welded round, so there is no daylight between them
    {const m=new THREE.Mesh(new THREE.CylinderGeometry(OFF*1.25,OFF*1.4,PH,12).translate(0,PH/2,0),stone);m.position.set(x,base,z);parts.push(m);}
    // the floor between the horns, polished, and the signs written on it
    {const m=new THREE.Mesh(new THREE.CylinderGeometry(OFF*1.6,OFF*1.4,1.4,12),polished);m.position.set(x,base+PH+0.7,z);parts.push(m);}
    // the stair: twenty-seven broad steps up the south face to the door
    const [dx,dz]=at(0,0);const face=L.face!==undefined?L.face:Math.PI/2;       // the door faces the gate, south
    const fx=Math.cos(face),fz=Math.sin(face),rx=-fz,rz=fx;
    const STEPS=27,RISE=0.6,TREAD=1.0,DOOR_R=OFF+PR*0.95;
    for(let s=0;s<STEPS;s++){const out=DOOR_R+(STEPS-s)*TREAD,w=14-s*0.12;
      const m=new THREE.Mesh(new THREE.BoxGeometry(TREAD+0.1,(s+1)*RISE,w).translate(0,(s+1)*RISE/2,0),stone);
      m.position.set(dx+fx*out,base,dz+fz*out);m.rotation.y=-face;parts.push(m);}
    const DOOR_Y=STEPS*RISE;
    {const m=new THREE.Mesh(new THREE.BoxGeometry(1.2,9,5.2).translate(0,4.5,0),dark);m.position.set(dx+fx*(DOOR_R+0.2),base+DOOR_Y,dz+fz*(DOOR_R+0.2));m.rotation.y=-face;parts.push(m);}
    // the window above the door, and its balcony
    const BAL_Y=DOOR_Y+26;
    {const w=new THREE.Mesh(new THREE.BoxGeometry(1.2,7,4).translate(0,3.5,0),dark);w.position.set(dx+fx*(DOOR_R+0.2),base+BAL_Y,dz+fz*(DOOR_R+0.2));w.rotation.y=-face;parts.push(w);
     const slab=new THREE.Mesh(new THREE.BoxGeometry(4.5,0.9,9),edge);slab.position.set(dx+fx*(DOOR_R+2.2),base+BAL_Y-0.45,dz+fz*(DOOR_R+2.2));slab.rotation.y=-face;parts.push(slab);
     for(let b=-4;b<=4;b++){const bar=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.2,0.15),edge);bar.position.set(dx+fx*(DOOR_R+4.3)+rx*b,base+BAL_Y+0.6,dz+fz*(DOOR_R+4.3)+rz*b);parts.push(bar);}
     const rail=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,9),edge);rail.position.set(dx+fx*(DOOR_R+4.3),base+BAL_Y+1.2,dz+fz*(DOOR_R+4.3));rail.rotation.y=-face;parts.push(rail);}
    // the high window, where the palantir is: it glows when it is being looked in (events.js)
    const pal=new THREE.Mesh(new THREE.BoxGeometry(1,3,2),new THREE.MeshBasicMaterial({color:0x2a0c06}));
    pal.position.set(dx+fx*(OFF+PR*0.86),base+PH*0.86,dz+fz*(OFF+PR*0.86));pal.rotation.y=-face;scene.add(pal);
    // the court round its foot: polished black flags
    {const m=new THREE.Mesh(new THREE.CylinderGeometry(OFF+PR+34,OFF+PR+36,0.8,40),polished);m.position.set(x,base-0.3,z);parts.push(m);}
    ctx.orthanc={x,z,base,H,PH,face,OFF,PR,SIDES,door:[dx+fx*(DOOR_R+1),base+DOOR_Y,dz+fz*(DOOR_R+1)],balcony:[dx+fx*(DOOR_R+2.4),base+BAL_Y,dz+fz*(DOOR_R+2.4)],
      top:[x,base+PH+1.4,z],palantir:pal};
    return group(L,byMat(parts));},

  };
}
