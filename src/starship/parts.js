// ---------- the pieces every hull here is made of ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// on these pages is this project's own geometry, built from the published dimensions and the silhouette.
//
// There are no textures anywhere in this project, so everything that would be a decal on a real model has
// to be geometry: the windows are little boxes, the warp grilles are stacks of slats, the pennants and the
// registry are panels of a different colour let into the hull. That sounds like a limitation and mostly is
// not - at the size a ship occupies on screen, a row of forty lit boxes reads as a row of windows better
// than any texture would, and it survives the wireframe, which a texture does not.
//
// The one thing that does suffer is lettering. There is none. A hull number would have to be forty separate
// extrusions to be legible and would be four pixels tall from anywhere you would actually look at the ship.

// A body of revolution from a profile. This is the single most useful shape here: a saucer, a deflector
// dish, a Bussard collector, a docking clamp and a station core are all one profile turned round an axis,
// and a lathe gets the subtle double curve of a saucer section in a way stacked cylinders never do.
export function lathe(THREE, profile, seg, mat, cap){
  // three.js winds a lathe from the order of the profile points, so a profile written DOWN the y axis
  // comes out inside-out: the faces you can see are the inside of the far wall and everything inside the
  // shape shows through. Most of the profiles in this project are written top-down, because that is how
  // you think about a dome, so they are turned round here rather than at forty call sites. The surface of
  // revolution is identical either way; only the winding changes.
  const prof=(profile.length>1&&profile[profile.length-1][1]<profile[0][1])?profile.slice().reverse():profile;
  const pts=prof.map(([r,y])=>new THREE.Vector2(Math.max(0.0001,r),y));
  const g=new THREE.LatheGeometry(pts,seg||48);
  if(cap===false)g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);
  return m;
}

// The same, squashed across one axis: a Galaxy-class saucer is not round, it is an ellipse a little longer
// than it is wide, and every hull section here is flattened or stretched somewhere.
export function ellipsoidLathe(THREE, profile, seg, mat, sx, sz){
  const m=lathe(THREE,profile,seg,mat);
  m.scale.set(sx===undefined?1:sx,1,sz===undefined?1:sz);
  return m;
}

// A hull that runs fore-and-aft rather than round an axis: a list of cross-sections along x, each one an
// ellipse with its own size and its own offset, joined up into a skin. An engineering hull, a nacelle, a
// warp pylon, a docking arm and a neck are all this shape with different numbers in the table, and writing
// them as tables rather than as stacks of cylinders is the difference between a hull and a pile of tins.
export function tube(THREE, stations, seg, mat, capFront, capBack, section){
  const N=stations.length, sec=section||SECT.ring(seg||24), S=sec.length;
  const pos=[],idx=[];
  for(const st of stations){
    for(let j=0;j<S;j++){
      const u=sec[j][0],v=sec[j][1];
      // ry is the half-depth above the station's centreline and ryb the half-depth below it, so a hull can
      // have a domed top and a flat bottom - which almost every hull on these three pages does.
      const r=v>=0?st.ry:(st.ryb===undefined?st.ry:st.ryb);
      pos.push(st.x,(st.cy||0)+v*r,(st.cz||0)+u*st.rz);
    }
  }
  // Which way round the skin has to be wound depends on which way the stations run, and this got it
  // wrong for two months. Every table in this project is written bow to stern - down x - because that is
  // the order you think a hull in, and with the skin wound the other way every hull on every one of
  // these pages was INSIDE OUT: back-face culling threw away the near wall, so you looked straight
  // through the saucer at the inside of the far one and at anything parked between them. The end caps
  // were wound for bow-to-stern and the skin for stern-to-bow, so the two never agreed and neither
  // ordering gave a solid hull.
  const rev=stations[N-1].x<stations[0].x;
  for(let i=0;i<N-1;i++)for(let j=0;j<S;j++){
    const a=i*S+j, b=i*S+(j+1)%S, c=(i+1)*S+j, d=(i+1)*S+(j+1)%S;
    if(rev)idx.push(a,b,c, b,d,c); else idx.push(a,c,b, b,c,d);
  }
  const cap=(i,flip)=>{
    const st=stations[i], base=pos.length/3;
    pos.push(st.x,st.cy||0,st.cz||0);
    for(let j=0;j<S;j++){
      const a=i*S+j, b=i*S+(j+1)%S;
      if(flip)idx.push(base,b,a); else idx.push(base,a,b);
    }
  };
  if(capFront!==false)cap(0,rev);
  if(capBack!==false)cap(N-1,!rev);
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// ---------- the cross-sections themselves ----------
// The shape of the section is as much of the design language as the table of sizes is. A Starfleet hull is
// an ellipse or a lens with a rim; a nacelle is a flat-bottomed slab with a rounded shoulder; a pylon is an
// aerofoil with a blunt leading edge and a sharp trailing one; and everything Cardassian is a hexagon with
// hard bevels, which is why the station reads as built by somebody else even in silhouette.
//
// Each is a list of [u, v] on the unit circle-ish, counter-clockwise, u across the hull and v up it. The
// station's `rz` scales u and its `ry` (or `ryb` below the centreline) scales v.
export const SECT={
  ring(n){const N=n||24,o=[];for(let j=0;j<N;j++){const a=j/N*Math.PI*2;o.push([Math.cos(a),Math.sin(a)]);}return o;},
  // A rim band at the widest point and a smooth dome either side of it. Generated rather than listed,
  // because a listed one is only as smooth as the patience of whoever typed it and the first version had
  // three points across the whole top - which is where the saucer plateau came from.
  lens(n,rim,pt,pb){
    const N=n||14, r=rim===undefined?0.30:rim, a=pt===undefined?0.62:pt, b=pb===undefined?0.78:pb;
    const o=[[1,-r],[1,r]];
    for(let i=1;i<N;i++){const u=Math.cos(i/N*Math.PI);o.push([u,r+(1-r)*Math.pow(1-u*u,a)]);}
    o.push([-1,r],[-1,-r]);
    for(let i=1;i<N;i++){const u=-Math.cos(i/N*Math.PI);o.push([u,-(r+(1-r)*Math.pow(1-u*u,b))]);}
    return o;
  },
  // Flat underside, slab sides, rounded shoulder: a nacelle, and the secondary hull of anything modern.
  // `flat` is how much of the side stays vertical before the shoulder starts.
  slabS(n,flat){
    const N=n||10, f=flat===undefined?0.26:flat;
    const o=[[1,-0.44],[1,f]];
    for(let i=1;i<N;i++){const u=Math.cos(i/N*Math.PI);o.push([u,f+(1-f)*Math.pow(1-u*u,0.46)]);}
    o.push([-1,f],[-1,-0.44]);
    for(let i=1;i<N;i++){const u=-Math.cos(i/N*Math.PI);o.push([u,-(0.44+0.56*Math.pow(1-u*u,0.30))]);}
    return o;
  },
  // blunt leading edge, sharp trailing edge: a pylon or a neck, thin across and long along the chord
  aerofoil:[[0,1],[-0.55,0.86],[-0.85,0.55],[-1,0.10],[-0.90,-0.35],[-0.60,-0.72],[-0.25,-0.93],[0,-1],
            [0.25,-0.93],[0.60,-0.72],[0.90,-0.35],[1,0.10],[0.85,0.55],[0.55,0.86]],
  // hard bevels on every corner: Cardassian
  hex:[[1,-0.52],[1,0.52],[0.46,1],[-0.46,1],[-1,0.52],[-1,-0.52],[-0.46,-1],[0.46,-1]],
  // the same, squarer, for a ring segment or a crossover bridge
  slab:[[1,-0.78],[1,0.78],[0.78,1],[-0.78,1],[-1,0.78],[-1,-0.78],[-0.78,-1],[0.78,-1]],
};

// The same section upside down. A neck and a pylon are both aerofoils, but a pylon leans aft going up and
// a neck leans aft going DOWN, so one of the two wants its blunt edge on the other side of the chord.
export const flipV=sec=>sec.map(p=>[p[0],-p[1]]).reverse();

// The same thing bent: the stations follow a path in (x, y) rather than a straight line, which is what a
// warp pylon and a station's docking arm both are.
export function sweep(THREE, path, seg, mat, section){
  const sec=section||SECT.ring(seg||16), S=sec.length, N=path.length;
  const pos=[],idx=[];
  for(const st of path){
    // the frame at this station: along the path, and the two axes across it
    const dir=st.dir||[1,0,0];
    const up=[0,1,0];
    const rx=[dir[1]*up[2]-dir[2]*up[1],dir[2]*up[0]-dir[0]*up[2],dir[0]*up[1]-dir[1]*up[0]];
    const rl=Math.hypot(rx[0],rx[1],rx[2])||1;
    const R=[rx[0]/rl,rx[1]/rl,rx[2]/rl];
    const U=[R[1]*dir[2]-R[2]*dir[1],R[2]*dir[0]-R[0]*dir[2],R[0]*dir[1]-R[1]*dir[0]];
    for(let j=0;j<S;j++){
      const cx=sec[j][0]*st.rz, cy=sec[j][1]*st.ry;
      pos.push(st.p[0]+R[0]*cx+U[0]*cy, st.p[1]+R[1]*cx+U[1]*cy, st.p[2]+R[2]*cx+U[2]*cy);
    }
  }
  for(let i=0;i<N-1;i++)for(let j=0;j<S;j++){
    const a=i*S+j, b=i*S+(j+1)%S, c=(i+1)*S+j, d=(i+1)*S+(j+1)%S;
    idx.push(a,c,b, b,c,d);
  }
  const cap=(i,flip)=>{
    const base=pos.length/3,o=[0,0,0];
    for(let j=0;j<S;j++){o[0]+=pos[(i*S+j)*3];o[1]+=pos[(i*S+j)*3+1];o[2]+=pos[(i*S+j)*3+2];}
    pos.push(o[0]/S,o[1]/S,o[2]/S);
    for(let j=0;j<S;j++){const a=i*S+j,b=i*S+(j+1)%S;if(flip)idx.push(base,b,a);else idx.push(base,a,b);}
  };
  cap(0,false);cap(N-1,true);   // outward is BACK down the path at the start and on along it at the end
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// A Bussard collector. The mistake to make here is a bright sphere stuck on the front of the nacelle: it
// reads as a ball, because it is one. The real thing is a dome sunk INSIDE a cowl, so what you see is a lit
// disc in a shadowed ring, and the cowl is what gives the nacelle its nose rather than the glow.
export function bussard(THREE, parts, m, x, y, z, r, faceX){
  const f=faceX===undefined?1:faceX;
  // the cowl: a short flared ring, open towards the bow
  const cowl=lathe(THREE,[[r*0.80,0],[r*1.00,-r*0.26],[r*1.05,-r*0.62],[r*0.98,-r*1.05],[r*0.74,-r*1.40]],22,m.dark);
  cowl.rotation.z=-f*Math.PI/2;cowl.position.set(x,y,z);parts.push(cowl);
  // the dome, set back inside it
  const dome=lathe(THREE,[[0.0001,0],[r*0.34,-r*0.10],[r*0.58,-r*0.26],[r*0.72,-r*0.48],[r*0.78,-r*0.78]],20,m.bussard);
  dome.rotation.z=-f*Math.PI/2;dome.position.set(x-f*r*0.30,y,z);parts.push(dome);
  // the three ribs across the opening, which is the detail that says it is a grille and not a lamp
  for(let k=0;k<3;k++){
    const b=new THREE.Mesh(new THREE.BoxGeometry(r*0.20,r*1.9,r*0.16),m.dark);
    b.position.set(x-f*r*0.05,y,z);b.rotation.x=k/3*Math.PI;parts.push(b);
  }
}

// ---------- a primary hull ----------
// A saucer is NOT a table of cross-sections. It is a figure of revolution - an oblate lens - with its aft
// end cut off square, and the height of a point on it depends only on how far that point is from the
// centre. Built the other way, as stations along x with a fixed section scaled to each one, two things go
// wrong and both of them are why the first three passes at this never looked right:
//
//   - The hull comes out STRETCHED. At 200 m from the centre the old saucer stood 14 m tall measured
//     forward along the keel and 25 m tall measured out abeam. It was a lens in one axis and a fat lens in
//     the other, so it read wrong from every angle except dead ahead and dead above.
//   - A fixed section has a flat top, so the saucer got a 140-metre PLATEAU across the middle of it. No
//     saucer has one; the bridge sits on a continuous dome.
//
// So: `top` and `bot` are [radius, y] tables read against the true radius, `R` is the full radius, `k`
// squashes the z axis, and `cut` is the x of the transom - the aft end is a chord through the lens, which
// is why the trailing edge is thicker than the rim and why the impulse engines fit in it.
//
// Returns the mesh and the outline: one entry per angle giving where the rim is and how tall it is there,
// so windows, hatches and phaser strips can be put ON the hull instead of near it.
export function discHull(THREE, mat, o){
  const R=o.R, k=o.k===undefined?1:o.k, cut=(o.cut===undefined?null:o.cut);
  const NA=o.seg||96, NR=o.rings||20, bulge=o.bulge===undefined?1.006:o.bulge;
  const sample=(tbl,r)=>{
    if(r<=tbl[0][0])return tbl[0][1];
    for(let i=0;i<tbl.length-1;i++)if(r<=tbl[i+1][0]){
      const t=(r-tbl[i][0])/((tbl[i+1][0]-tbl[i][0])||1);
      return tbl[i][1]+(tbl[i+1][1]-tbl[i][1])*t;
    }
    return tbl[tbl.length-1][1];
  };
  // how far the hull reaches along a ray: the full radius, unless the transom gets in the way first
  const reach=th=>{
    const c=Math.cos(th);
    if(cut===null||c>=-1e-6)return R;
    return Math.min(R,cut/c);
  };
  const pos=[],idx=[];
  const V=(x,y,z)=>{pos.push(x,y,z);return pos.length/3-1;};
  const ths=[],rs=[];
  for(let a=0;a<NA;a++){const th=a/NA*Math.PI*2;ths.push(th);rs.push(reach(th));}
  const ring=(tbl)=>{
    const rows=[];
    for(let i=1;i<=NR;i++){
      const row=[];
      for(let a=0;a<NA;a++){
        const r=rs[a]*i/NR;
        row.push(V(Math.cos(ths[a])*r,sample(tbl,r),Math.sin(ths[a])*r*k));
      }
      rows.push(row);
    }
    return rows;
  };
  const tApex=V(0,sample(o.top,0),0), topRows=ring(o.top);
  const bApex=V(0,sample(o.bot,0),0), botRows=ring(o.bot);
  // the rim, carried a little proud so the widest point of the ship is the rim itself and not the
  // shoulder just above it
  const rimMid=[];
  for(let a=0;a<NA;a++){
    const r=rs[a]*bulge, yT=sample(o.top,rs[a]), yB=sample(o.bot,rs[a]);
    rimMid.push(V(Math.cos(ths[a])*r,(yT+yB)/2,Math.sin(ths[a])*r*k));
  }
  const NX=a=>(a+1)%NA;
  for(let a=0;a<NA;a++){
    idx.push(tApex,topRows[0][NX(a)],topRows[0][a]);
    idx.push(bApex,botRows[0][a],botRows[0][NX(a)]);
  }
  for(let i=0;i<NR-1;i++)for(let a=0;a<NA;a++){
    const A=topRows[i][a],B=topRows[i][NX(a)],C=topRows[i+1][a],D=topRows[i+1][NX(a)];
    idx.push(A,B,C, B,D,C);
    const e=botRows[i][a],f=botRows[i][NX(a)],g=botRows[i+1][a],h=botRows[i+1][NX(a)];
    idx.push(e,g,f, f,g,h);
  }
  for(let a=0;a<NA;a++){
    const T=topRows[NR-1][a],T2=topRows[NR-1][NX(a)];
    const M=rimMid[a],M2=rimMid[NX(a)];
    const B=botRows[NR-1][a],B2=botRows[NR-1][NX(a)];
    idx.push(T,T2,M, T2,M2,M);
    idx.push(M,M2,B, M2,B2,B);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  const outline=ths.map((th,a)=>({th,r:rs[a],x:Math.cos(th)*rs[a],z:Math.sin(th)*rs[a]*k,
                                  yT:sample(o.top,rs[a]),yB:sample(o.bot,rs[a]),
                                  cut:rs[a]<R-0.5}));
  return {mesh:new THREE.Mesh(g,mat), outline};
}

// A flat band lying ON a surface: a strip of quads through a list of [inner, outer] vertex pairs.
//
// This is what a phaser strip is, and it is why the first version of them came out as a ring of gear
// teeth round the saucer. A strip was a row of little boxes, each rotated to guess at the local slope; a
// box is a solid with a thickness, so on a curved hull one edge of it always buries itself and the other
// always lifts off, and overlapping them to close the gaps turned the lifted edges into a sawtooth. A
// ribbon has no thickness and follows whatever points it is given exactly.
export function ribbon(THREE, mat, rows, o){
  const k=o||{}, N=rows.length, closed=k.closed!==false, up=k.up!==false;
  const pos=[],idx=[];
  for(const r of rows){pos.push(r[0][0],r[0][1],r[0][2], r[1][0],r[1][1],r[1][2]);}
  const lim=closed?N:N-1;
  for(let i=0;i<lim;i++){
    const j=(i+1)%N, a=i*2, b=i*2+1, c=j*2, d=j*2+1;
    if(up)idx.push(a,c,b, b,c,d); else idx.push(a,b,c, b,d,c);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// A deflector dish. The thing to get right is that it is CONCAVE and faces forward: the rim is the
// furthest-forward part of it and the emitter sits at the bottom of the bowl. Built the other way round -
// which is how this started, as a cone with its apex forward - it reads as a nose cone, and because a
// lathe's faces point away from its axis you are looking at the back of it anyway, so what actually
// showed was a blank grey disc.
//
// `x` is where the rim sits, the bowl is `depth` deep behind it, and the dish is drawn in two zones
// because that is what gives it a centre: an amber bowl with a pale core at the bottom of it.
// NOTE on fitting one of these: the hull it sits in must END just behind the bowl's apex, because there
// is no boolean subtraction here and a recess cannot be cut into anything. Two passes were lost to that.
// First the hull's own front cap - a `tube` caps its first station by default - sat straight across the
// mouth of the housing and read as the dish: a blank lit disc filling the middle two-thirds of it. Then,
// with the cap taken off, the hull's SKIN pushed through the bowl from behind, because a bowl narrows
// going aft and the hull does not, and that showed as a pale crescent across the amber. The fix is the
// obvious one: stop the hull short, and let the housing skirt flare back over the join.
export function deflector(THREE, parts, m, x, y, z, R, depth, o){
  const k=o||{}, f=k.faceX===undefined?1:k.faceX, seg=k.seg||56;
  const bowl=(r0,r1,y0,y1,n)=>{                 // a slice of the bowl, as a lathe profile
    const p=[];
    for(let i=0;i<=n;i++){
      const t=i/n, r=r0+(r1-r0)*t;
      p.push([Math.max(0.0001,r), y0+(y1-y0)*Math.pow(t,1.7)]);
    }
    return p;
  };
  // the housing: a skirt that flares from the lip back over whatever hull this is mounted in
  const house=lathe(THREE,[[R*1.13,depth*0.12],[R*1.13,-depth*0.30],[R*0.86,-depth*1.05],
                           [R*0.56,-depth*1.75]],seg,m.dark);
  house.rotation.z=-f*Math.PI/2;house.position.set(x,y,z);parts.push(house);
  // the collar: a bevelled lip round the mouth
  const collar=lathe(THREE,[[R*0.99,-depth*0.10],[R*1.09,-depth*0.02],[R*1.10,depth*0.10],
                            [R*1.01,depth*0.17]],seg,m.trim);
  collar.rotation.z=-f*Math.PI/2;collar.position.set(x,y,z);parts.push(collar);
  // the bowl itself, in two zones, closed at the apex so nothing behind it can show through
  const outer=lathe(THREE,bowl(R*0.28,R*0.99,-depth*0.80,0,9),seg,m.deflector);
  outer.rotation.z=-f*Math.PI/2;outer.position.set(x,y,z);parts.push(outer);
  const inner=lathe(THREE,bowl(0.0001,R*0.28,-depth,-depth*0.80,5),seg,m.deflCore);
  inner.rotation.z=-f*Math.PI/2;inner.position.set(x,y,z);parts.push(inner);
  // the emitter at the bottom of the bowl
  const boss=new THREE.Mesh(new THREE.SphereGeometry(R*0.13,18,12),m.lit);
  boss.position.set(x-f*depth*0.92,y,z);boss.scale.set(0.55,1,1);parts.push(boss);
}

// A row of lit windows, as instances, following a line. `n` windows between `a` and `b`, standing off the
// hull along `out`, all of them the same little box. Two decks means calling it twice.
export function windowRow(THREE, parts, mat, a, b, n, size, out, jitter){
  const A=new THREE.Vector3().fromArray(a), B=new THREE.Vector3().fromArray(b);
  const O=new THREE.Vector3().fromArray(out||[0,0,0]);
  for(let i=0;i<n;i++){
    const t=n===1?0.5:i/(n-1);
    const p=A.clone().lerp(B,t).add(O);
    if(jitter&&((i*37)%7)===0)continue;         // a few of them are dark, because a few of them always are
    const w=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),mat);
    w.position.copy(p);
    parts.push(w);
  }
}

// Windows round an ellipse: the saucer rim, the station's promenade, the docking ring. `phase` skips the
// stretch where the hull is doing something else.
export function windowRing(THREE, parts, mat, y, rx, rz, n, size, from, to, cx){
  const a0=from===undefined?0:from, a1=to===undefined?Math.PI*2:to, x0=cx||0;
  for(let i=0;i<n;i++){
    const a=a0+(a1-a0)*(i/n);
    if(((i*53)%11)===0)continue;
    const w=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),mat);
    w.position.set(x0+Math.cos(a)*rx,y,Math.sin(a)*rz);
    w.rotation.y=-a;
    parts.push(w);
  }
}

// A warp grille: a stack of slats behind a recessed face. The glow is the whole point of a nacelle and it
// is the one thing on the ship that is allowed to be a flat emissive colour.
export function grille(THREE, parts, glowMat, frameMat, x, y, z, len, h, d, slats, A){
  const holder=[];
  for(let i=0;i<slats;i++){
    const t=(i+0.5)/slats;
    const s=new THREE.Mesh(new THREE.BoxGeometry(len/slats*0.62,h*0.86,d),glowMat);
    s.position.set(x+(t-0.5)*len,y,z);
    holder.push(s);
  }
  const back=new THREE.Mesh(new THREE.BoxGeometry(len*1.04,h,d*0.5),frameMat);
  back.position.set(x,y,z-d*0.4);
  holder.push(back);
  if(A){for(const m of holder){m.position.applyAxisAngle(new THREE.Vector3(0,1,0),A);m.rotation.y=A;}}
  for(const m of holder)parts.push(m);
}

// Merge a pile of static meshes into one buffer per material. The same trick the engine uses and for the
// same reason: a hull is six hundred little boxes and a page should not pay six hundred draw calls for it.
export function mergeParts(THREE, meshes, mat){
  const pos=[],nor=[],nm=new THREE.Matrix3(),v=new THREE.Vector3(),vn=new THREE.Vector3();
  for(const m of meshes){
    m.updateMatrix();
    const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
    const p=g.attributes.position,n=g.attributes.normal;
    nm.getNormalMatrix(m.matrix);
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(m.matrix);pos.push(v.x,v.y,v.z);
      vn.fromBufferAttribute(n,i).applyNormalMatrix(nm).normalize();nor.push(vn.x,vn.y,vn.z);
    }
    if(g!==m.geometry)g.dispose();
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// Fold everything that shares a material into one mesh and hang the lot on a group.
export function fold(THREE, group, parts){
  const by=new Map();
  for(const m of parts){let a=by.get(m.material);if(!a){a=[];by.set(m.material,a);}a.push(m);}
  for(const [mat,list] of by)group.add(mergeParts(THREE,list,mat));
  return group;
}

// The hull palette. Starfleet grey is not grey: it is a very pale blue-green that goes warm where the light
// hits it, and the panels are the same colour at slightly different values, which is why a hull reads as
// panelled rather than painted.
export function hullPalette(THREE, o){
  const k=o||{};
  // How shiny the hull is is half of who built it. Starfleet hulls are close to matt with a cool sheen;
  // Cardassian ones are duller still and what little they reflect is warm. Left on the Starfleet defaults
  // the station came out the colour of a biscuit however dark its base colour was, because the specular
  // was doing most of the lighting.
  const sp=k.specular===undefined?0x3a4048:k.specular, sh=k.shininess===undefined?22:k.shininess;
  const flat=!!k.flat;
  const P=(c,s2,h2,f)=>new THREE.MeshPhongMaterial({color:c,specular:s2===undefined?sp:s2,
    shininess:h2===undefined?sh:h2,flatShading:f===undefined?flat:f});
  return {
    hull:P(k.hull||0xc8ccc6),
    panelA:P(k.panelA||0xbcc2be,undefined,sh*0.8,true),
    panelB:P(k.panelB||0xd2d6cf,undefined,sh*0.8,true),
    dark:P(k.dark||0x565c62,0x22262a,14,true),
    trim:P(k.trim||0x8e949a,undefined,sh*1.3,true),
    glass:P(k.glass||0x1e2a34,0xbfd4e4,80,false),
    lit:new THREE.MeshBasicMaterial({color:k.lit||0xffe9b8}),
    warp:new THREE.MeshBasicMaterial({color:k.warp||0x6ea6ee}),
    bussard:new THREE.MeshBasicMaterial({color:k.bussard||0xff6a4a,transparent:true,opacity:0.92}),
    impulse:new THREE.MeshBasicMaterial({color:k.impulse||0xff8a3a,transparent:true,opacity:0.9}),
    // Opaque, and double-sided because a bowl is an open surface seen from its concave side. At 92 per
    // cent the open rim of the hull nose showed through the dish as a crescent.
    deflector:new THREE.MeshBasicMaterial({color:k.deflector||0xc8a24a,side:THREE.DoubleSide}),
    deflCore:new THREE.MeshBasicMaterial({color:k.deflCore||0xdfeaff,side:THREE.DoubleSide}),
    nav:new THREE.MeshBasicMaterial({color:0xff4030}),
    navG:new THREE.MeshBasicMaterial({color:0x40ff70}),
    pennant:P(k.pennant||0x9aa2a8,undefined,sh*0.9,true),
    // a phaser strip is not lit: it is a dull copper-amber band let into the hull, and it only shows
    // because it is darker and warmer than everything round it
    strip:P(k.strip||0x7a6044,0x463828,22,true),
  };
}
