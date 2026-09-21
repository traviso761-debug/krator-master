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
import {lathe,tube,sweep,discHull,windowRing,windowRow,bussard,SECT,flipV} from '../starship/parts.js';

export function model(api){
  const {THREE,scene,animHooks,fold,palette}=api;
  const m=palette({});
  const G=new THREE.Group();
  const parts=[];

  const LEN=642.5;

  // ---------- the saucer ----------
  // A figure of revolution, 464 m across, with its aft end cut off square at x = -197. `TOP` and `BOT` are
  // the profile measured against the true radius, so the hull is the same thickness 200 m forward as it is
  // 200 m abeam - which the station-and-section version was not: it stood 14 m tall one way and 25 m the
  // other, and had a 140 m flat plateau across the middle where the dome should be.
  const SR=232, CUT=-197;
  const TOP=[[0,30.0],[38,29.6],[78,28.6],[114,27.0],[145,24.8],[172,22.0],[194,18.6],[210,15.2],
             [221,12.2],[228,10.0],[232,8.5]];
  const BOT=[[0,-26.0],[50,-25.9],[95,-25.4],[135,-24.2],[168,-22.0],[193,-18.8],[211,-14.8],
             [223,-11.4],[229,-9.5],[232,-8.5]];
  const sampleAt=(tbl,r)=>{
    if(r<=tbl[0][0])return tbl[0][1];
    for(let i=0;i<tbl.length-1;i++)if(r<=tbl[i+1][0]){
      const t=(r-tbl[i][0])/(tbl[i+1][0]-tbl[i][0]);
      return tbl[i][1]+(tbl[i+1][1]-tbl[i][1])*t;
    }
    return tbl[tbl.length-1][1];
  };
  const SAUCER=discHull(THREE,m.hull,{R:SR,cut:CUT,top:TOP,bot:BOT,seg:132,rings:26});
  parts.push(SAUCER.mesh);
  const OUT=SAUCER.outline;

  // The rim. Two rows of windows with a recessed sensor groove between them - the upper row is deck 9,
  // which is Ten Forward and an unusually tall deck, and the lower is deck 10. None of it runs across the
  // transom, because the transom is the impulse deck and is half as tall again as the rim.
  for(let a=0;a<OUT.length;a++){
    const p=OUT[a],q=OUT[(a+1)%OUT.length];
    if(p.cut||q.cut)continue;
    const ang=-Math.atan2(q.z-p.z,q.x-p.x);
    const len=Math.hypot(q.x-p.x,q.z-p.z);
    const mid=(p.yT+p.yB)/2;
    if(a%2===0){
      const gr=new THREE.Mesh(new THREE.BoxGeometry(len*2.1,3.0,1.5),m.dark);
      gr.position.set((p.x+q.x)/2,mid,(p.z+q.z)/2*0.997);gr.rotation.y=ang;parts.push(gr);
    }
    if(a%3===0&&((a*7)%13)!==0){
      for(const [y,h] of [[mid+4.6,2.4],[mid-4.4,1.8]]){
        const w=new THREE.Mesh(new THREE.BoxGeometry(3.0,h,1.3),m.lit);
        w.position.set(p.x,y,p.z*1.004);w.rotation.y=ang;parts.push(w);
      }
    }
    // the lifeboat hatches, in a line just above and below the rim band
    if(a%4===0){
      for(const y of [p.yT-1.6,p.yB+1.6]){
        const h=new THREE.Mesh(new THREE.BoxGeometry(11,1.0,3.0),m.panelB);
        h.position.set(p.x*0.995,y,p.z*0.995);h.rotation.y=ang;parts.push(h);
      }
    }
  }

  // the phaser strips: long shallow arcs let into the upper and lower saucer a little inboard of the rim
  for(let a=0;a<OUT.length;a++){
    const p=OUT[a],q=OUT[(a+1)%OUT.length];
    if(p.cut||q.cut)continue;
    const f=0.89;
    const ang=-Math.atan2(q.z-p.z,q.x-p.x);
    const len=Math.hypot(q.x*f-p.x*f,q.z*f-p.z*f);
    for(const up of [1,-1]){
      const y=up>0?sampleAt(TOP,p.r*f):sampleAt(BOT,p.r*f);
      const st=new THREE.Mesh(new THREE.BoxGeometry(len*1.6,1.1,5.0),m.strip);
      st.position.set(p.x*f,y,p.z*f);st.rotation.y=ang;
      st.rotation.z=up>0?-0.30:0.30;parts.push(st);
    }
  }

  // the underside: two rings of windows well inboard of the rim, and the panel joins between them
  for(const [f,n,sz] of [[0.62,60,2.6],[0.40,38,2.6]]){
    for(let k=0;k<n;k++){
      const a=Math.round(k/n*OUT.length)%OUT.length, p=OUT[a];
      if(((k*53)%9)===0)continue;
      const w=new THREE.Mesh(new THREE.BoxGeometry(sz,1.3,sz),m.lit);
      w.position.set(p.x*f,sampleAt(BOT,p.r*f)+0.4,p.z*f);parts.push(w);
    }
  }
  for(const f of [0.50,0.74]){
    for(let k=0;k<52;k++){
      const a=Math.round(k/52*OUT.length)%OUT.length, p=OUT[a];
      const pl=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.8,22),m.panelA);
      pl.position.set(p.x*f,sampleAt(BOT,p.r*f)+0.3,p.z*f);pl.rotation.y=-p.th;parts.push(pl);
    }
  }

  // the two long pennant panels on the saucer roof, which are structure rather than paint
  for(const sd of [-1,1]){
    for(let i=0;i<16;i++){
      const x=110-i*13, z=sd*(102+i*0.9);
      const r=Math.hypot(x,z);
      if(r>222)continue;
      const pn=new THREE.Mesh(new THREE.BoxGeometry(15,0.9,20),m.pennant);
      pn.position.set(x,sampleAt(TOP,r)+0.25,z);pn.rotation.y=sd*0.055;
      pn.rotation.z=-(sampleAt(TOP,r+7)-sampleAt(TOP,r-7))/14*Math.sign(x);parts.push(pn);
    }
  }

  // ---------- the bridge ----------
  {
    const b=lathe(THREE,[[0.001,48.6],[10,47.6],[17,45.4],[21,41.2],[22,35.6],[22,30.6],[0.001,30.0]],48,m.hull);
    parts.push(b);
    const d=lathe(THREE,[[0.001,34.6],[28,33.8],[35,32.0],[37,30.2],[0.001,29.8]],48,m.panelB);
    parts.push(d);
    windowRing(THREE,parts,m.lit,41.2,21.2,21.2,26,[1.3,2.0,1.3]);
    // the main sensor dome, on the other end of the same axis
    const sd=lathe(THREE,[[0.001,-47.6],[15,-45.8],[24,-41.0],[27,-34.6],[0.001,-26.2]],48,m.trim);
    parts.push(sd);
    const lens=new THREE.Mesh(new THREE.SphereGeometry(14,20,12),m.deflector);
    lens.position.set(0,-45.1,0);lens.scale.set(1,0.4,1);parts.push(lens);
    const y1=lathe(THREE,[[0.001,0],[12,-2.0],[24,-4.2],[31,-7.2],[28,-10.6],[14,-12.8],[0.001,-13.4]],26,m.trim);
    y1.rotation.y=Math.PI/2;y1.scale.set(2.0,1,1);y1.position.set(-96,-25.2,0);parts.push(y1);
    for(let k=0;k<7;k++){
      const w=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,1.6),m.lit);
      w.position.set(-150+k*18,-29.6,0);parts.push(w);
    }
  }

  // ---------- the impulse engines ----------
  for(const sd of [-1,1]){
    const r=Math.hypot(CUT,62), y=(sampleAt(TOP,r)+sampleAt(BOT,r))/2;
    const box=new THREE.Mesh(new THREE.BoxGeometry(20,15,56),m.panelA);
    box.position.set(CUT+6,y,sd*62);parts.push(box);
    const glow=new THREE.Mesh(new THREE.BoxGeometry(3.4,11,48),m.impulse);
    glow.position.set(CUT-3.5,y,sd*62);parts.push(glow);
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
    {x: 124, ry:20, rz:23, cy: -98, ryb:19},
    {x: 112, ry:26, rz:31, cy: -99, ryb:25},
    {x:  92, ry:31, rz:38, cy:-100, ryb:30},
    {x:  56, ry:36, rz:47, cy:-101, ryb:36},
    {x:   8, ry:41, rz:56, cy:-102, ryb:42},
    {x: -56, ry:43, rz:60, cy:-101, ryb:44},
    {x:-126, ry:42, rz:59, cy: -99, ryb:43},
    {x:-196, ry:39, rz:55, cy: -98, ryb:40},
    {x:-260, ry:35, rz:48, cy: -96, ryb:36},
    {x:-316, ry:28, rz:39, cy: -95, ryb:29},
    {x:-356, ry:21, rz:29, cy: -94, ryb:21},
    {x:-378, ry:14, rz:20, cy: -94, ryb:14},
  ];
  {
    parts.push(tube(THREE,ENG,0,m.hull,true,true,SECT.slabS(11)));
    const engAt=x=>{
      let a=ENG[0],b=ENG[ENG.length-1];
      for(let i=0;i<ENG.length-1;i++)if(x<=ENG[i].x&&x>ENG[i+1].x){a=ENG[i];b=ENG[i+1];break;}
      const t=(a.x-x)/((a.x-b.x)||1);
      return {ry:a.ry+(b.ry-a.ry)*t, rz:a.rz+(b.rz-a.rz)*t, cy:a.cy+(b.cy-a.cy)*t,
              ryb:a.ryb+(b.ryb-a.ryb)*t};
    };
    for(const sd of [-1,1])for(const [f,n] of [[0.55,24],[0.10,22],[-0.42,18]])
      for(let i=0;i<n;i++){
        const x=30-i*(330/n), g=engAt(x);
        if(((i*37)%7)===0)continue;
        const w=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.5,1.5),m.lit);
        w.position.set(x,g.cy+f*g.ry,sd*(g.rz+1.2)*Math.sqrt(Math.max(0,1-f*f*0.55)));parts.push(w);
      }
    // The dorsal: a raised spine running aft from the foot of the neck, with the upper shuttlebay let into
    // it. Without this the engineering hull is a featureless egg, which is what it has been all along.
    for(let i=0;i<14;i++){
      const x=-136-i*17, g=engAt(x);
      const sp=new THREE.Mesh(new THREE.BoxGeometry(18,9,30-i*0.9),m.panelB);
      sp.position.set(x,g.cy+g.ry-2.5,0);parts.push(sp);
    }
    const ub=new THREE.Mesh(new THREE.BoxGeometry(30,5,26),m.dark);
    ub.position.set(-318,engAt(-318).cy+engAt(-318).ry+1.6,0);parts.push(ub);
    const ubl=new THREE.Mesh(new THREE.BoxGeometry(22,2,18),m.lit);
    ubl.position.set(-318,engAt(-318).cy+engAt(-318).ry+3.4,0);parts.push(ubl);
    // the main shuttlebay in the stern, and the light out of it
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
    // two strakes down each flank and a phaser strip along the belly
    for(const sd of [-1,1])for(const f of [-0.72,-0.16]){
      for(let i=0;i<13;i++){
        const x=60-i*33, g=engAt(x);
        const st=new THREE.Mesh(new THREE.BoxGeometry(30,2.4,2.0),m.panelA);
        st.position.set(x,g.cy+f*g.ryb,sd*(g.rz+0.8)*Math.sqrt(Math.max(0,1-f*f*0.7)));parts.push(st);
      }
    }
    for(let i=0;i<13;i++){
      const x=40-i*30, g=engAt(x);
      const belly=new THREE.Mesh(new THREE.BoxGeometry(28,1.2,5.0),m.strip);
      belly.position.set(x,g.cy-g.ryb+0.5,0);parts.push(belly);
    }
  }

  // ---------- the deflector ----------
  {
    const ring=lathe(THREE,[[18,0],[32,-2.4],[37,-9],[36,-18],[28,-25],[18,-27]],48,m.dark);
    ring.rotation.z=-Math.PI/2;ring.position.set(124,-98,0);parts.push(ring);
    const dish=lathe(THREE,[[0.001,-5],[12,-6.4],[21,-10.4],[28,-16],[33,-23]],48,m.deflector);
    dish.rotation.z=-Math.PI/2;dish.position.set(129,-98,0);parts.push(dish);
    const glow=new THREE.PointLight(0xc8a24a,0.9,700);
    glow.position.set(180,-98,0);scene.add(glow);
    animHooks.push(now=>{glow.intensity=0.6+0.25*Math.sin(now*0.0013);});
  }

  // ---------- the pylons and the nacelles ----------
  // 248 m of nacelle, with the cap on the ship's stern at x = -408.5, which puts the collector end at
  // -160.5 - forward of the saucer's trailing edge and tucked under it. That overlap is not a mistake: it
  // is why a Galaxy looks short for its length from above.
  const NX0=-286.5, NY0=-46, NZ0=158;
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
      const x=-190-t*102, y=-74+t*28, z=sd*(44+t*114);
      path.push({p:[x,y,z],dir:[-0.660,0.181,sd*0.729],ry:34-t*18,rz:9-t*4.5});
    }
    parts.push(sweep(THREE,path,0,m.hull,SECT.aerofoil));
    // No trim along the leading edge. Two attempts at it now: boxes laid out in world axes came out as a
    // staircase up the side, and boxes laid out in the sweep's frame sat proud of the surface and read in
    // plan as a second pylon drawn a few metres above the first. A Galaxy pylon is a plain swept blade and
    // it is better plain than fringed.

    const n=tube(THREE,NST,0,m.hull,true,true,SECT.slabS(10));
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
  for(const [x,y,z,mat] of [[231,0,0,m.lit],[-201,0,0,m.lit],[0,49.2,0,m.nav],[0,-47.8,0,m.nav],
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
