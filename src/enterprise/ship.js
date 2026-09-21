// ---------- Galaxy class ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// here is this project's own geometry, built from the published dimensions and the silhouette.
//
// The numbers this model is cut to, and where they come from:
//
//   overall length   642.5 m      bow of the saucer to the aft end of the nacelles
//   beam             463.7 m      across the saucer, which is the widest part of the ship
//   height           195.3 m      top of the bridge to the bottom of the engineering hull, 42 decks
//   nacelle          248 m long, 57 m wide and 32 m tall at its widest, 38 by 19 at the collector end
//                                 (Rick Sternbach's blueprint figures)
//
// So the bow is at x = +234, the nacelle caps are at x = -408.5, the bridge is at y = +50 and the bottom of
// the engineering hull at y = -145. The saucer's mid-plane is y = 0 and the bow is towards +x.
//
// Three things about this shape are counter-intuitive and all three were wrong the first time:
//
//   - The saucer is a lens with a rim and a FLAT TRAILING EDGE, cut off square where the impulse engines
//     are. A disc reads as a flying saucer; this reads as a hull.
//   - The nacelles are long. At 248 m they are nearly two-fifths of the whole ship, and because the caps
//     have to land on the stern that puts their collector ends UNDER the saucer's aft quarter, which is
//     why the class looks so compact from above.
//   - A nacelle is wider than it is tall - 57 by 32 - not the other way round. It is a flattened slab with
//     the grilles on its vertical faces, not an upright tube.
//
// Every hull here is a table of cross-sections and a section profile, and the tables are the model.
import {lathe,tube,sweep,windowRing,windowRow,bussard,SECT,flipV} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  const m=palette({});
  const G=new THREE.Group();
  const parts=[];

  const LEN=642.5;

  // ---------- the saucer ----------
  // `rz` is the half-width, so the list of rz IS the plan outline; `ry` and `ryb` are the half-depths above
  // and below the mid-plane, so the list of those is the profile. The last station is at x = -197 with the
  // hull still 264 m across, and the cap the tube puts on it is the flat trailing edge.
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
  const topAt=s=>s.ry*0.80, botAt=s=>-s.ryb*0.80, sideAt=s=>s.rz*0.86;

  parts.push(tube(THREE,SAU,0,m.hull,true,true,SECT.saucer));

  // The rim. The band at the widest point is part of the section, so what goes on it is what is actually
  // there: TWO rows of windows with a recessed sensor groove between them - the upper row is deck 9, which
  // is Ten Forward and is an unusually tall deck, and the lower is deck 10. The first pass put three even
  // rows round it, which is a Constitution refit's rim, not this one.
  for(let i=1;i<SAU.length-1;i++){
    const a=SAU[i],b=SAU[i+1];
    for(const sd of [-1,1]){
      const ang=-Math.atan2(sd*(b.rz-a.rz),b.x-a.x);
      const len=Math.hypot(b.x-a.x,b.rz-a.rz);
      // the groove first, so the windows sit either side of it
      const gr=new THREE.Mesh(new THREE.BoxGeometry(len*1.04,3.4,1.6),m.dark);
      gr.position.set((a.x+b.x)/2,-0.5,sd*(a.rz+b.rz)/2*0.992);
      gr.rotation.y=ang;parts.push(gr);
      for(let k=0;k<5;k++){
        const t=(k+0.5)/5;
        if(((i*7+k)%11)===0)continue;              // a few of them are dark, because a few always are
        const x=a.x+(b.x-a.x)*t, rz=a.rz+(b.rz-a.rz)*t;
        const ry=a.ry+(b.ry-a.ry)*t, ryb=a.ryb+(b.ryb-a.ryb)*t;
        for(const [y,h] of [[ry*0.26,2.3],[-ryb*0.28,1.7]]){
          const w=new THREE.Mesh(new THREE.BoxGeometry(3.0,h,1.4),m.lit);
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
  // the outline from one quarter round the bow to the other
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

  // the underside: two rings of windows well inboard of the rim, the panel joins between them, and the
  // captain's yacht clamped flat against the hull aft of the sensor dome
  const underAt=(x)=>{
    let st=SAU[1];
    for(let i=0;i<SAU.length-1;i++)if(x<=SAU[i].x&&x>SAU[i+1].x){
      const t=(SAU[i].x-x)/(SAU[i].x-SAU[i+1].x);
      st={rz:SAU[i].rz+(SAU[i+1].rz-SAU[i].rz)*t, ryb:SAU[i].ryb+(SAU[i+1].ryb-SAU[i].ryb)*t};break;}
    return st;
  };
  for(let ring=0;ring<2;ring++){
    const f=[0.62,0.40][ring], n=[54,34][ring];
    for(let k=0;k<n;k++){
      const th=k/n*Math.PI*2;
      if(((k*53)%9)===0)continue;
      const x=Math.cos(th)*215*f-14, st=underAt(x);
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.3,2.6),m.lit);
      w.position.set(x,-st.ryb*(0.99-0.30*f*f),Math.sin(th)*st.rz*f);parts.push(w);
    }
  }
  for(const r of [0.50,0.74]){
    for(let k=0;k<44;k++){
      const th=k/44*Math.PI*2;
      const x=Math.cos(th)*206*r-14, st=underAt(x);
      const p=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.8,22),m.panelA);
      p.position.set(x,-st.ryb*(0.985-0.26*r*r),Math.sin(th)*st.rz*r);p.rotation.y=-th;parts.push(p);
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
    const y1=lathe(THREE,[[0.001,0],[12,-2.0],[24,-4.2],[31,-7.2],[28,-10.6],[14,-12.8],[0.001,-13.4]],26,m.trim);
    y1.rotation.y=Math.PI/2;y1.scale.set(2.0,1,1);y1.position.set(-96,-26,0);parts.push(y1);
    for(let k=0;k<7;k++){
      const w=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.6),m.lit);
      w.position.set(-150+k*18,-30.5,0);parts.push(w);
    }
  }

  // ---------- the impulse engines ----------
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
      path.push({p:[-116-t*58,-22-t*44,0],dir:[-0.55,-0.835,0],ry:42-t*6,rz:9.5+t*3.5});
    }
    parts.push(sweep(THREE,path,0,m.hull,flipV(SECT.aerofoil)));
    for(let i=0;i<7;i++){
      const t=i/6;
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.0,2.6),m.lit);
      w.position.set(-116-t*58+22,-24-t*42,0);parts.push(w);
    }
    const tl=new THREE.Mesh(new THREE.BoxGeometry(26,9,30),m.dark);
    tl.position.set(-104,-28,0);tl.rotation.z=0.16;parts.push(tl);
    const tg=new THREE.Mesh(new THREE.BoxGeometry(3,5.0,21),m.deflector);
    tg.position.set(-92,-26,0);tg.rotation.z=0.16;parts.push(tg);
  }

  // ---------- the engineering hull ----------
  // An egg, widest about a third of the way back. Its lowest point is y = -145, which with the bridge at
  // +50 is the 195 m the class is quoted at; the first pass had it 10 m too deep and the whole ship came
  // out taller than it should be.
  const ENG=[
    {x: 106, ry:14, rz:17, cy: -98, ryb:13},
    {x:  84, ry:24, rz:29, cy:-100, ryb:23},
    {x:  46, ry:34, rz:44, cy:-101, ryb:34},
    {x:   0, ry:40, rz:55, cy:-102, ryb:41},
    {x: -62, ry:43, rz:60, cy:-101, ryb:44},
    {x:-132, ry:42, rz:59, cy: -99, ryb:43},
    {x:-200, ry:39, rz:55, cy: -98, ryb:40},
    {x:-262, ry:35, rz:48, cy: -96, ryb:36},
    {x:-318, ry:28, rz:39, cy: -95, ryb:29},
    {x:-358, ry:21, rz:29, cy: -94, ryb:21},
    {x:-378, ry:14, rz:20, cy: -94, ryb:14},
  ];
  {
    parts.push(tube(THREE,ENG,0,m.hull,true,true,SECT.nacelle));
    for(const sd of [-1,1])for(const [y,n] of [[-80,24],[-95,22],[-110,18]])
      windowRow(THREE,parts,m.lit,[30,y,sd*54],[-300,y,sd*40],n,[3.4,1.5,1.5],[0,0,sd*3],true);
    const bay=new THREE.Mesh(new THREE.BoxGeometry(8,30,48),m.dark);
    bay.position.set(-380,-92,0);parts.push(bay);
    const baylight=new THREE.Mesh(new THREE.BoxGeometry(2,22,38),m.lit);
    baylight.position.set(-384,-92,0);parts.push(baylight);
    for(const sd of [-1,1]){
      const g2=new THREE.Mesh(new THREE.BoxGeometry(4,9,22),m.impulse);
      g2.position.set(-382,-66,sd*24);parts.push(g2);
    }
    const at=new THREE.Mesh(new THREE.BoxGeometry(18,10,30),m.dark);
    at.position.set(-370,-118,0);parts.push(at);
    for(const sd of [-1,1]){
      const st=new THREE.Mesh(new THREE.BoxGeometry(300,3.0,2.4),m.panelA);
      st.position.set(-110,-120,sd*50);parts.push(st);
    }
    const belly=new THREE.Mesh(new THREE.BoxGeometry(210,1.2,5.0),m.strip);
    belly.position.set(-120,-145,0);parts.push(belly);
  }

  // ---------- the deflector ----------
  {
    const ring=lathe(THREE,[[15,0],[29,-2],[33,-8],[32,-16],[25,-22],[15,-24]],40,m.dark);
    ring.rotation.z=-Math.PI/2;ring.position.set(106,-98,0);parts.push(ring);
    const dish=lathe(THREE,[[0.001,-5],[10,-6],[18,-9.4],[25,-14.6],[29,-20.6]],40,m.deflector);
    dish.rotation.z=-Math.PI/2;dish.position.set(110,-98,0);parts.push(dish);
    const glow=new THREE.PointLight(0xc8a24a,0.8,600);
    glow.position.set(160,-98,0);scene.add(glow);
    animHooks.push(now=>{glow.intensity=0.6+0.25*Math.sin(now*0.0013);});
  }

  // ---------- the pylons and the nacelles ----------
  // 248 m of nacelle, with the cap on the ship's stern at x = -408.5, which puts the collector end at
  // -160.5 - forward of the saucer's trailing edge and tucked under it. That overlap is not a mistake: it
  // is why a Galaxy looks short for its length from above.
  const NX0=-284.5, NY0=-46, NZ0=158;
  const NST=[
    {x: 124, rz:  5,  ry: 4.0, ryb: 3.5},
    {x: 117, rz: 13,  ry: 7.5, ryb: 6.5},
    {x: 104, rz: 18,  ry: 9.5, ryb: 8.5},
    {x:  76, rz: 20,  ry:10.5, ryb: 9.5},
    {x:  26, rz: 23,  ry:12.5, ryb:11.5},
    {x: -30, rz: 26,  ry:14.5, ryb:13.5},
    {x: -80, rz: 28.5,ry:16.0, ryb:15.0},
    {x:-110, rz: 26,  ry:14.0, ryb:13.0},
    {x:-122, rz: 17,  ry: 8.5, ryb: 7.5},
    {x:-124, rz:  8,  ry: 4.0, ryb: 3.5},
  ];
  // the nacelle's half-width and half-height at any station along it, so the grille and the trim sit ON
  // the hull instead of hovering a few metres off it wherever the taper has moved on
  const nacAt=x=>{
    let a=NST[0],b=NST[NST.length-1];
    for(let i=0;i<NST.length-1;i++)if(x<=NST[i].x&&x>NST[i+1].x){a=NST[i];b=NST[i+1];break;}
    const t=(a.x-x)/((a.x-b.x)||1);
    return {rz:a.rz+(b.rz-a.rz)*t, ry:a.ry+(b.ry-a.ry)*t};
  };

  for(const sd of [-1,1]){
    const path=[];
    for(let i=0;i<=12;i++){
      const t=i/12;
      const x=-176-t*120, y=-90+t*44, z=sd*(46+t*112);
      path.push({p:[x,y,z],dir:[-0.702,0.257,sd*0.655],ry:66-t*36,rz:10-t*5});
    }
    parts.push(sweep(THREE,path,0,m.hull,SECT.aerofoil));
    // No trim along the leading edge. Two attempts at it now: boxes laid out in world axes came out as a
    // staircase up the side, and boxes laid out in the sweep's frame sat proud of the surface and read in
    // plan as a second pylon drawn a few metres above the first. A Galaxy pylon is a plain swept blade and
    // it is better plain than fringed.

    const n=tube(THREE,NST,0,m.hull,true,true,SECT.nacelle);
    n.position.set(NX0,NY0,sd*NZ0);parts.push(n);
    bussard(THREE,parts,m,NX0+122,NY0+1,sd*NZ0,13,1);

    // The warp grille: a recessed slot down each vertical face, following the taper. It runs along the
    // middle half of the nacelle and no further - run the full length, as the first two passes did, and
    // the nacelle stops being a hull with a slot in it and becomes a blue tube.
    for(const face of [-1,1]){
      for(let i=0;i<16;i++){
        const x=40-i*7.6, g=nacAt(x);
        const sl=new THREE.Mesh(new THREE.BoxGeometry(3.4,g.ry*0.66,2.4),m.warp);
        sl.position.set(NX0+x,NY0+2,sd*NZ0+face*(g.rz+0.9));parts.push(sl);
      }
      for(let i=0;i<16;i++){
        const x=42-i*8.0, g=nacAt(x);
        for(const lip of [1,-1]){
          const l=new THREE.Mesh(new THREE.BoxGeometry(8,1.8,2.4),m.trim);
          l.position.set(NX0+x,NY0+2+lip*g.ry*0.50,sd*NZ0+face*(g.rz+0.4));parts.push(l);
        }
      }
      // the flat panel aft of the grille, which is what stops the nacelle reading as a striped tube
      for(let i=0;i<7;i++){
        const x=-66-i*9, g=nacAt(x);
        const pn=new THREE.Mesh(new THREE.BoxGeometry(7,g.ry*1.1,1.4),m.panelA);
        pn.position.set(NX0+x,NY0+1,sd*NZ0+face*(g.rz+0.5));parts.push(pn);
      }
    }
    const cap=new THREE.Mesh(new THREE.BoxGeometry(9,15,24),m.dark);
    cap.position.set(NX0-126,NY0,sd*NZ0);parts.push(cap);
    // the fairing where the pylon meets the nacelle's underside
    const fair=new THREE.Mesh(new THREE.BoxGeometry(104,16,40),m.hull);
    fair.position.set(NX0-14,NY0-15,sd*(NZ0-11));fair.rotation.x=sd*0.2;parts.push(fair);
  }

  // ---------- the running lights ----------
  // Small. A navigation light at this scale is a lamp, not a beacon.
  const blinkers=[];
  for(const [x,y,z,mat] of [[233,0,0,m.lit],[-203,0,0,m.lit],[0,50.5,0,m.nav],[0,-48,0,m.nav],
                            [NX0-129,NY0+10,NZ0,m.navG],[NX0-129,NY0+10,-NZ0,m.nav],
                            [-381,-66,0,m.lit]]){
    const b=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),mat);
    b.position.set(x,y,z);b.userData.noWire=true;scene.add(b);blinkers.push(b);
  }
  animHooks.push(now=>{const on=(now%1900)<950;for(const b of blinkers)b.visible=on;});

  fold(G,parts);
  scene.add(G);
  return {radius:LEN*0.5, group:G};
}
