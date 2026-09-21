// ---------- Galaxy class ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// 642.5 m long, 463.7 across the saucer, 195 deep from the top of the bridge to the bottom of the
// engineering hull. Everything below is in metres at those figures. The saucer's mid-plane is y = 0 and the
// bow is towards +x, so the bow is at x = +234 and the nacelle caps are at x = -408.
//
// What makes this silhouette, and what a box-modeller gets wrong first, is that almost none of it is
// straight and none of it is round either. The saucer is a lens with a rim and a FLAT TRAILING EDGE, not a
// disc - cut off square where the impulse engines are, which is why it reads as a hull rather than as a
// flying saucer. The engineering hull is an egg that is widest a third of the way back. The pylons are
// swept in two planes at once and are aerofoils in section. The nacelles are flat-bottomed slabs with a
// rounded shoulder, and they are held WIDE - two-thirds of the saucer's radius outboard and well aft of it,
// which is the whole stance of the class and the thing that is hardest to get from memory.
//
// So every hull here is a table of cross-sections and a section profile, and the tables are the model.
import {lathe,tube,sweep,windowRing,windowRow,bussard,SECT,flipV} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  const m=palette({});
  const G=new THREE.Group();
  const parts=[];

  const LEN=642.5;

  // ---------- the saucer ----------
  // Stations from the bow aft. `rz` is the half-width, so the list of rz IS the plan outline; `ry` and
  // `ryb` are the half-depths above and below the mid-plane, so the list of those is the profile. The last
  // station is at x = -197 with the hull still 264 m across, and the cap the tube puts on it is the flat
  // trailing edge with the impulse engines in it.
  const SAU=[
    {x: 234, rz:  3, ry: 2.4, ryb: 2.2},
    {x: 230, rz: 40, ry: 6.4, ryb: 5.4},
    {x: 221, rz: 78, ry: 9.8, ryb: 8.2},
    {x: 206, rz:114, ry:13.2, ryb:11.0},
    {x: 185, rz:148, ry:16.6, ryb:13.8},
    {x: 158, rz:178, ry:20.0, ryb:16.6},
    {x: 124, rz:203, ry:23.4, ryb:19.4},
    {x:  84, rz:220, ry:26.6, ryb:22.2},
    {x:  40, rz:230, ry:29.4, ryb:24.6},
    {x:  -8, rz:232, ry:31.4, ryb:26.4},
    {x: -56, rz:227, ry:31.4, ryb:26.4},
    {x:-100, rz:216, ry:30.4, ryb:25.4},
    {x:-140, rz:199, ry:29.0, ryb:24.0},
    {x:-170, rz:177, ry:27.0, ryb:22.0},
    {x:-188, rz:154, ry:25.0, ryb:20.0},
    {x:-197, rz:132, ry:23.0, ryb:18.0},
  ];
  // where the top and bottom surfaces sit directly outboard, used by everything that has to lie ON the hull
  const topAt=s=>s.ry*0.80, botAt=s=>-s.ryb*0.80, sideAt=s=>s.rz*0.86;

  parts.push(tube(THREE,SAU,0,m.hull,true,true,SECT.saucer));

  // the rim: the band at the widest point is part of the section, so what goes on here is the windows in
  // it - three rows, following the outline rather than a circle, because the outline is not one
  for(let i=1;i<SAU.length-1;i++){
    const a=SAU[i],b=SAU[i+1];
    for(const sd of [-1,1]){
      const ang=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
      for(let k=0;k<5;k++){
        const t=(k+0.5)/5;
        if(((i*7+k)%11)===0)continue;              // a few of them are dark, because a few always are
        const x=a.x+(b.x-a.x)*t, rz=a.rz+(b.rz-a.rz)*t;
        const ry=a.ry+(b.ry-a.ry)*t, ryb=a.ryb+(b.ryb-a.ryb)*t;
        for(const y of [ry*0.30,-0.02*ry,-ryb*0.30]){
          const w=new THREE.Mesh(new THREE.BoxGeometry(3.0,1.7,1.4),m.lit);
          w.position.set(x,y,sd*rz*1.002);w.rotation.y=ang;parts.push(w);
        }
      }
      // the lifeboat hatches, in a line just above and below the rim band
      for(let k=0;k<3;k++){
        const t=(k+0.5)/3;
        const x=a.x+(b.x-a.x)*t, rz=a.rz+(b.rz-a.rz)*t;
        const ry=a.ry+(b.ry-a.ry)*t, ryb=a.ryb+(b.ryb-a.ryb)*t;
        for(const y of [ry*0.56,-ryb*0.58]){
          const h=new THREE.Mesh(new THREE.BoxGeometry(11,1.0,3.2),m.panelB);
          h.position.set(x,y,sd*rz*0.965);h.rotation.y=ang;parts.push(h);
        }
      }
    }
  }

  // the phaser strips: two long shallow arcs let into the upper saucer and two more underneath, following
  // the outline from one quarter round the bow to the other. They are the detail that reads at any
  // distance, and they are the reason there are no radiating panel ribs on this model any more - the ribs
  // made it look like a wheel and these make it look like a ship.
  for(let i=1;i<SAU.length-3;i++){
    const a=SAU[i],b=SAU[i+1];
    for(const sd of [-1,1]){
      const ang=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
      const len=Math.hypot(b.x-a.x,b.rz-a.rz);
      for(const up of [1,-1]){
        const s=new THREE.Mesh(new THREE.BoxGeometry(len*1.02,1.1,5.2),m.strip);
        s.position.set((a.x+b.x)/2, up>0?(topAt(a)+topAt(b))/2:(botAt(a)+botAt(b))/2,
                       sd*(sideAt(a)+sideAt(b))/2);
        s.rotation.y=ang;parts.push(s);
      }
    }
  }

  // the underside. Seen from below the saucer was one unbroken dish, which is the one angle where a
  // Galaxy has the MOST going on: two rings of windows well inboard of the rim, the ring of the lower
  // sensor platform, and the captain's yacht clamped flat against the hull aft of the dome.
  for(let ring=0;ring<2;ring++){
    const f=[0.62,0.40][ring], n=[54,34][ring];
    for(let k=0;k<n;k++){
      const th=k/n*Math.PI*2;
      if(((k*53)%9)===0)continue;
      // walk the outline to find the half-width at this station, then come inboard by `f`
      const x=Math.cos(th)*215*f-14, want=Math.abs(Math.sin(th));
      let st=SAU[0];
      for(let i=0;i<SAU.length-1;i++)if(x<=SAU[i].x&&x>SAU[i+1].x){
        const t=(SAU[i].x-x)/(SAU[i].x-SAU[i+1].x);
        st={rz:SAU[i].rz+(SAU[i+1].rz-SAU[i].rz)*t, ryb:SAU[i].ryb+(SAU[i+1].ryb-SAU[i].ryb)*t};break;}
      const z=Math.sign(Math.sin(th))*st.rz*f*want;
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.3,2.6),m.lit);
      w.position.set(x,-st.ryb*(0.99-0.30*f*f),z);parts.push(w);
    }
  }
  for(const r of [0.50,0.74]){
    for(let k=0;k<44;k++){
      const th=k/44*Math.PI*2;
      const x=Math.cos(th)*206*r-14;
      let st=SAU[1];
      for(let i=0;i<SAU.length-1;i++)if(x<=SAU[i].x&&x>SAU[i+1].x){
        const t=(SAU[i].x-x)/(SAU[i].x-SAU[i+1].x);
        st={rz:SAU[i].rz+(SAU[i+1].rz-SAU[i].rz)*t, ryb:SAU[i].ryb+(SAU[i+1].ryb-SAU[i].ryb)*t};break;}
      const z=Math.sin(th)*st.rz*r;
      const p=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.8,22),m.panelA);
      p.position.set(x,-st.ryb*(0.985-0.26*r*r),z);p.rotation.y=-th;parts.push(p);
    }
  }

  // the two long pennant panels on the saucer roof, which are structure rather than paint
  for(const sd of [-1,1]){
    const p=new THREE.Mesh(new THREE.BoxGeometry(186,0.9,21),m.pennant);
    p.position.set(28,27.4,sd*104);p.rotation.y=sd*0.055;parts.push(p);
  }

  // ---------- the bridge ----------
  {
    const b=lathe(THREE,[[0.001,50],[10,49],[17,46.8],[21,42.6],[22,37],[22,32],[0.001,31.4]],36,m.hull);
    parts.push(b);
    const d=lathe(THREE,[[0.001,36],[28,35.2],[35,33.4],[37,31.6],[0.001,31.2]],36,m.panelB);
    parts.push(d);
    windowRing(THREE,parts,m.lit,42.6,21.2,21.2,22,[1.3,2.0,1.3]);
    // the main sensor dome, on the other end of the same axis
    const sd=lathe(THREE,[[0.001,-48],[15,-46.2],[24,-41.4],[27,-35],[0.001,-26.6]],36,m.trim);
    parts.push(sd);
    const lens=new THREE.Mesh(new THREE.SphereGeometry(14,20,12),m.deflector);
    lens.position.set(0,-45.5,0);lens.scale.set(1,0.4,1);parts.push(lens);
    // the captain's yacht, clamped flat against the saucer's underside aft of the dome
    const y1=lathe(THREE,[[0.001,0],[12,-2.0],[24,-4.2],[31,-7.2],[28,-10.6],[14,-12.8],[0.001,-13.4]],26,m.trim);
    y1.rotation.y=Math.PI/2;y1.scale.set(2.0,1,1);y1.position.set(-96,-26,0);parts.push(y1);
    for(let k=0;k<7;k++){
      const w=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.6),m.lit);
      w.position.set(-150+k*18,-30.5,0);parts.push(w);
    }
  }

  // ---------- the impulse engines ----------
  // Two in the saucer's flat trailing edge, which is where they belong and where they say which way the
  // ship is pointing, and two more on the stern of the engineering hull.
  for(const sd of [-1,1]){
    const box=new THREE.Mesh(new THREE.BoxGeometry(18,14,54),m.panelA);
    box.position.set(-192,0,sd*62);parts.push(box);
    const glow=new THREE.Mesh(new THREE.BoxGeometry(3.4,11,46),m.impulse);
    glow.position.set(-201,0,sd*62);parts.push(glow);
  }

  // ---------- the neck ----------
  // A blade between the saucer's underside and the top of the engineering hull: thin across, deep
  // fore-and-aft, leaning about thirty-five degrees off vertical. The section is an aerofoil turned round,
  // so the blunt edge faces forward and the sharp one aft.
  {
    const path=[];
    for(let i=0;i<=8;i++){
      const t=i/8;
      path.push({p:[-116-t*62,-22-t*48,0],dir:[-0.55,-0.835,0],ry:42-t*6,rz:9.5+t*3.5});
    }
    parts.push(sweep(THREE,path,0,m.hull,flipV(SECT.aerofoil)));
    for(let i=0;i<7;i++){
      const t=i/6;
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.0,2.6),m.lit);
      w.position.set(-116-t*62+22,-24-t*46,0);parts.push(w);
    }
    // the forward torpedo launcher, in the shoulder where the neck meets the saucer
    const tl=new THREE.Mesh(new THREE.BoxGeometry(26,9,30),m.dark);
    tl.position.set(-104,-28,0);tl.rotation.z=0.16;parts.push(tl);
    const tg=new THREE.Mesh(new THREE.BoxGeometry(3,5.0,21),m.deflector);
    tg.position.set(-92,-26,0);tg.rotation.z=0.16;parts.push(tg);
  }

  // ---------- the engineering hull ----------
  // An egg, widest about a third of the way back, flat enough on top to take the pylon roots and the
  // shuttlebay doors. The deflector is in the nose at x = +105, tucked under the saucer's overhang, and the
  // stern is at -375, just short of the nacelle caps.
  const ENG=[
    {x: 106, ry:15, rz:17, cy:-104, ryb:14},
    {x:  84, ry:26, rz:29, cy:-106, ryb:25},
    {x:  46, ry:37, rz:44, cy:-108, ryb:37},
    {x:   0, ry:44, rz:55, cy:-109, ryb:45},
    {x: -62, ry:47, rz:60, cy:-108, ryb:48},
    {x:-132, ry:46, rz:59, cy:-106, ryb:47},
    {x:-200, ry:43, rz:55, cy:-104, ryb:44},
    {x:-262, ry:38, rz:48, cy:-102, ryb:39},
    {x:-318, ry:31, rz:39, cy:-101, ryb:32},
    {x:-358, ry:23, rz:29, cy:-100, ryb:23},
    {x:-375, ry:15, rz:20, cy:-100, ryb:15},
  ];
  {
    parts.push(tube(THREE,ENG,0,m.hull,true,true,SECT.nacelle));
    // three rows of windows down each side
    for(const sd of [-1,1])for(const [y,n] of [[-86,24],[-102,22],[-118,18]])
      windowRow(THREE,parts,m.lit,[30,y,sd*54],[-300,y,sd*40],n,[3.4,1.5,1.5],[0,0,sd*3],true);
    // the shuttlebay: doors in the stern, and the light out of them
    const bay=new THREE.Mesh(new THREE.BoxGeometry(8,32,50),m.dark);
    bay.position.set(-377,-96,0);parts.push(bay);
    const baylight=new THREE.Mesh(new THREE.BoxGeometry(2,24,40),m.lit);
    baylight.position.set(-381,-96,0);parts.push(baylight);
    // the impulse pair on the stern, above the bay
    for(const sd of [-1,1]){
      const g2=new THREE.Mesh(new THREE.BoxGeometry(4,9,22),m.impulse);
      g2.position.set(-379,-70,sd*24);parts.push(g2);
    }
    // the aft torpedo launcher, under the bay
    const at=new THREE.Mesh(new THREE.BoxGeometry(18,10,30),m.dark);
    at.position.set(-368,-124,0);parts.push(at);
    // the lateral sensor strake down each flank, and a phaser strip on the belly
    for(const sd of [-1,1]){
      const st=new THREE.Mesh(new THREE.BoxGeometry(300,3.0,2.4),m.panelA);
      st.position.set(-110,-128,sd*50);parts.push(st);
    }
    const belly=new THREE.Mesh(new THREE.BoxGeometry(210,1.2,5.0),m.strip);
    belly.position.set(-120,-154,0);parts.push(belly);
  }

  // ---------- the deflector ----------
  {
    const ring=lathe(THREE,[[15,0],[29,-2],[33,-8],[32,-16],[25,-22],[15,-24]],40,m.dark);
    ring.rotation.z=-Math.PI/2;ring.position.set(106,-104,0);parts.push(ring);
    const dish=lathe(THREE,[[0.001,-5],[10,-6],[18,-9.4],[25,-14.6],[29,-20.6]],40,m.deflector);
    dish.rotation.z=-Math.PI/2;dish.position.set(110,-104,0);parts.push(dish);
    const glow=new THREE.PointLight(0xc8a24a,0.8,600);
    glow.position.set(160,-104,0);scene.add(glow);
    animHooks.push(now=>{glow.intensity=0.6+0.25*Math.sin(now*0.0013);});
  }

  // ---------- the pylons and the nacelles ----------
  // The nacelles are the stance. They sit at z = +/-148 - about two-thirds of the saucer's radius outboard -
  // with their noses level with the saucer's trailing edge and their caps level with the stern, and their
  // centrelines a little below the saucer's underside. The pylon that holds each one leaves the engineering
  // hull's shoulder well forward and sweeps up, out and aft: an aerofoil, blunt edge forward.
  const NZ0=148, NY0=-30, NX0=-300;
  for(const sd of [-1,1]){
    const path=[];
    for(let i=0;i<=12;i++){
      const t=i/12;
      const x=-168-t*128, y=-76+t*47, z=sd*(40+t*(NZ0-40));
      path.push({p:[x,y,z],dir:[-0.62,0.235,sd*0.75],ry:60-t*24,rz:10-t*4.6});
    }
    parts.push(sweep(THREE,path,0,m.hull,SECT.aerofoil));
    // a trim strip along the pylon's leading edge, laid out in the sweep's own frame rather than guessed
    // at in world axes - the first attempt at this put a staircase of little boxes up the side of it
    {
      const d=[-0.62,0.235,sd*0.75],up=[0,1,0];
      const rx=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]];
      const rl=Math.hypot(rx[0],rx[1],rx[2]);
      const R=[rx[0]/rl,rx[1]/rl,rx[2]/rl];
      const U=[R[1]*d[2]-R[2]*d[1],R[2]*d[0]-R[0]*d[2],R[0]*d[1]-R[1]*d[0]];
      for(let i=0;i<12;i++){
        const t=(i+0.5)/12,q=path[i],r=path[i+1];
        const c=(60-t*24)*0.92;
        const a0=[q.p[0]+U[0]*c,q.p[1]+U[1]*c,q.p[2]+U[2]*c];
        const a1=[r.p[0]+U[0]*c,r.p[1]+U[1]*c,r.p[2]+U[2]*c];
        const len=Math.hypot(a1[0]-a0[0],a1[1]-a0[1],a1[2]-a0[2]);
        const e=new THREE.Mesh(new THREE.BoxGeometry(len*1.1,3.0,(10-t*4.6)*1.6),m.trim);
        e.position.set((a0[0]+a1[0])/2,(a0[1]+a1[1])/2,(a0[2]+a1[2])/2);
        e.rotation.y=-Math.atan2(a1[2]-a0[2],a1[0]-a0[0]);
        e.rotation.z=Math.asin(Math.max(-1,Math.min(1,(a1[1]-a0[1])/len)));
        parts.push(e);
      }
    }

    // the nacelle: 205 m long, flat underneath, rounded over the top
    const NST=[
      {x: 102, ry: 5, rz: 5,  ryb: 4},
      {x:  95, ry:13, rz:11,  ryb:10},
      {x:  82, ry:19, rz:15,  ryb:15},
      {x:  56, ry:22, rz:17,  ryb:18},
      {x:   0, ry:23, rz:18,  ryb:19},
      {x: -56, ry:22, rz:17,  ryb:18},
      {x: -88, ry:19, rz:15,  ryb:15},
      {x:-100, ry:13, rz:11,  ryb:10},
      {x:-105, ry: 6, rz: 6,  ryb: 5},
    ];
    const n=tube(THREE,NST,0,m.hull,true,true,SECT.nacelle);
    n.position.set(NX0,NY0,sd*NZ0);parts.push(n);
    bussard(THREE,parts,m,NX0+101,NY0+2,sd*NZ0,14.5,1);

    // the warp grille: a recessed strip down the forward two-thirds of each face
    for(const face of [-1,1]){
      const back=new THREE.Mesh(new THREE.BoxGeometry(140,17,2.2),m.dark);
      back.position.set(NX0+8,NY0+3,sd*NZ0+face*18.6);parts.push(back);
      for(let i=0;i<17;i++){
        const s=new THREE.Mesh(new THREE.BoxGeometry(3.4,10,2.6),m.warp);
        s.position.set(NX0+72-i*8.2,NY0+3,sd*NZ0+face*19.0);parts.push(s);
      }
      // the lips above and below the grille, so it is a slot in the hull rather than a stripe on it
      for(const lip of [1,-1]){
        const l=new THREE.Mesh(new THREE.BoxGeometry(142,4,3.2),m.trim);
        l.position.set(NX0+8,NY0+3+lip*10,sd*NZ0+face*18.4);parts.push(l);
      }
      // the flat panel aft of it, which is what stops the nacelle reading as a striped tube
      const pn=new THREE.Mesh(new THREE.BoxGeometry(62,20,1.4),m.panelA);
      pn.position.set(NX0-70,NY0+2,sd*NZ0+face*18.4);parts.push(pn);
    }
    // the endcap and the pylon fairing where the nacelle meets it
    const cap=new THREE.Mesh(new THREE.BoxGeometry(9,15,19),m.dark);
    cap.position.set(NX0-107,NY0,sd*NZ0);parts.push(cap);
    const fair=new THREE.Mesh(new THREE.BoxGeometry(94,14,34),m.hull);
    fair.position.set(NX0-6,NY0-17,sd*(NZ0-9));fair.rotation.x=sd*0.22;parts.push(fair);
  }

  // ---------- the running lights ----------
  // Small. A navigation light at this scale is a lamp, not a beacon, and the version of this model that
  // had them at three metres across put two red balloons over the saucer.
  const blinkers=[];
  for(const [x,y,z,mat] of [[233,0,0,m.lit],[-203,0,0,m.lit],[0,50.5,0,m.nav],[0,-48,0,m.nav],
                            [NX0-110,NY0+9,NZ0,m.navG],[NX0-110,NY0+9,-NZ0,m.nav],
                            [-378,-70,0,m.lit]]){
    const b=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),mat);
    b.position.set(x,y,z);b.userData.noWire=true;scene.add(b);blinkers.push(b);
  }
  animHooks.push(now=>{const on=(now%1900)<950;for(const b of blinkers)b.visible=on;});

  fold(G,parts);
  scene.add(G);
  return {radius:LEN*0.5, group:G};
}
