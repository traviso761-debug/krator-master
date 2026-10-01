// What is built in Rivendell. Fan work — every shape is this project's own low-poly geometry, and no assets
// from any book, film or game are used. Tolkien's world belongs to the Tolkien Estate.
//
// Tolkien drew the house more than once, and it is not a castle or a palace: it is a house, "unfortified in
// its valley" - a long range of two storeys under a steep red roof, a square tower with a hipped roof at one
// end of it, a loggia of columns and gently curved arches along the front, outbuildings, all standing in trees
// on a green shelf above the river. The text adds the rest: a porch on the east side onto the gardens, where
// the Council met; the Hall of Fire, "a fire in it year-round with carven pillars on either side of the
// hearth"; terraces above the loud-flowing Bruinen; stables, and a forge.
//
// The film's design (Alan Lee's) is later and its own, but two things of its spirit are used here because the
// valley reads better with them: pavilions on slender columns at the edges of things, with domed roofs gone
// green; and curves - the brackets under the eaves, the arches - where a plain house would have straight lines.
//
// Everything is built in the house's own frame: u along the valley (east), w towards the river (south). The
// plan (data/cities/rivendell-valley.json, from tools/make-rivendell.py) says where the house, the bridge,
// the stair and the pavilions are; the landmarks in the city file say what each is called.

export function landmarks(api){
  const {THREE,ctx,box,group,gh}=api;
  const V=ctx.valley;

  const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const M={
    stone:mat(0xd4ccbb),       // pale dressed stone, the ground storey and the terraces
    stone2:mat(0xbdb4a2),      // the plinths and copings
    plaster:mat(0xebe2cc),     // the upper storey between the timbers
    timber:mat(0x5e4633),      // dark oak framing
    roof:mat(0xa9472f),        // Tolkien's red roofs
    roof2:mat(0x94402c),
    copper:mat(0x6a9a86),      // the pavilions' domes, gone green
    gilt:new THREE.MeshPhongMaterial({color:0xc9a652,specular:0xfff0c0,shininess:60,flatShading:true}),
    glass:mat(0x2c3336),       // an opening, seen from outside in daylight
    lamp:new THREE.MeshBasicMaterial({color:0xffd58a}),
    hedge:mat(0x3f6130),
    flower:[mat(0xc8506a),mat(0xe8c85a),mat(0x9a6ac8),mat(0xf0f0e8)],
    water:mat(0x7fa8b0),
  };

  // ---- the house's frame ----
  function frame(ox,oz,oy,A){
    const c=Math.cos(A),s=Math.sin(A);
    // local (u, w) to world (x, z): u along the valley, w towards the river
    const P=(u,w)=>[ox+c*u-s*w,oz+s*u+c*w];
    const parts=[];
    const add=(m)=>{parts.push(m);return m;};
    // a box in the frame: centre (u, y, w) above oy, size (lu, h, lw), turned with the house
    const B=(u,y,w,lu,h,lw,m,rot)=>{const [x,z]=P(u,w);const b=new THREE.Mesh(new THREE.BoxGeometry(lu,h,lw),m);b.position.set(x,oy+y+h/2,z);b.rotation.y=-A+(rot||0);return add(b);};
    const G=(geo,m,u,y,w,ry)=>{const [x,z]=P(u,w);const o=new THREE.Mesh(geo,m);o.position.set(x,oy+y,z);o.rotation.y=-A+(ry||0);return add(o);};
    return {P,B,G,parts,A};
  }

  // A steep gabled roof: ridge along u, over a rectangle lu x lw, eaves at height y. Built as one prism.
  function gable(F,m,u,y,w,lu,lw,pitch,over){
    const o=over===undefined?0.9:over,h=(lw/2+o)*pitch;
    const sh=new THREE.Shape();sh.moveTo(-(lw/2+o),0);sh.lineTo(lw/2+o,0);sh.lineTo(0,h);sh.lineTo(-(lw/2+o),0);
    const g=new THREE.ExtrudeGeometry(sh,{depth:lu+o*2,bevelEnabled:false});g.translate(0,0,-(lu+o*2)/2);g.rotateY(Math.PI/2);
    F.G(g,m,u,y-0.2,w);
    return h;
  }
  // A hipped roof: four slopes to a point (or a short ridge), over lu x lw.
  function hipped(F,m,u,y,w,lu,lw,h){
    const g=new THREE.ConeGeometry(Math.SQRT2/2,1,4,1).rotateY(Math.PI/4);g.scale(lu+1.6,h,lw+1.6);g.translate(0,h/2,0);F.G(g,m,u,y,w);
  }
  // A bell dome, for the pavilions: a lathe with a flare at the eave and a waist below the top.
  function bell(r,h){const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector2(Math.max(0.02,r*(1.08-0.12*t-0.96*Math.pow(t,2.2))+r*0.12*Math.sin(t*Math.PI)),h*t));}
    return new THREE.LatheGeometry(pts,12);}
  // A gently curved arch between two columns: the spandrel as a flat plate with an elliptic soffit.
  function archPlate(span,rise,depth,thick){
    const s=new THREE.Shape();s.moveTo(-span/2,0);s.lineTo(-span/2,rise+thick);s.lineTo(span/2,rise+thick);s.lineTo(span/2,0);
    s.absellipse(0,0,span/2,rise,0,Math.PI,false);
    const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:10});g.translate(0,0,-depth/2);return g;
  }
  // The gable end's dress: a king post and a tie beam in the triangle, and a gilt finial above the ridge -
  // the decoration is on the gable, and it is what reads at two hundred metres. (u, w) is the middle of the
  // gable face; the face is square to u.
  function gableDress(F,u,y,w,lw,h){
    F.B(u,y,w,0.3,h*0.92,0.34,M.timber);
    F.B(u,y+h*0.32,w,0.3,0.34,lw*0.66,M.timber);
    F.G(new THREE.ConeGeometry(0.28,2.4,6),M.gilt,u,y+h+1.1,w);F.G(new THREE.SphereGeometry(0.34,8,6),M.gilt,u,y+h+0.2,w);
  }
  // a timber-framed wall face: posts every `bay` metres and a rail at mid-height, on the face at w (or u)
  function framing(F,u0,u1,y,h,w,out){for(let u=u0;u<=u1+0.01;u+=3.2)F.B(u,y,w+out*0.12,0.34,h,0.25,M.timber);F.B((u0+u1)/2,y+h*0.52,w+out*0.12,u1-u0,0.3,0.25,M.timber);F.B((u0+u1)/2,y+h-0.2,w+out*0.12,u1-u0,0.35,0.28,M.timber);}
  function windows(F,u0,u1,y,h,w,out,every,tall){for(let u=u0;u<=u1+0.01;u+=every)F.B(u,y,w+out*0.06,1.1,tall?h:h*0.55,0.2,M.glass);}

  return {

  // ================================================================ the Last Homely House
  house(L,x,z){
    const S=V.sites.house,y0=S.y,A=S.turn;
    const F=frame(S.x,S.z,y0,A),B=F.B;
    // ---- the long range: 70 m of it, two storeys, the loggia along the river side ----
    const LU=70,LW=16;
    B(0,-2,0,LU+1,2.2,LW+1,M.stone2);                                   // plinth, down into the slope
    B(0,0,0,LU,5.4,LW,M.stone);                                         // the ground storey: stone
    B(0,5.4,0,LU,4.8,LW,M.plaster);                                     // the upper: plaster between timbers
    framing(F,-LU/2+1,LU/2-1,5.4,4.8,LW/2,1);framing(F,-LU/2+1,LU/2-1,5.4,4.8,-LW/2,-1);
    windows(F,-LU/2+3,LU/2-3,6.4,2.8,LW/2,1,3.2,false);windows(F,-LU/2+3,LU/2-3,6.4,2.8,-LW/2,-1,3.2,false);
    windows(F,-LU/2+4,LU/2-4,1.0,3.6,-LW/2,-1,4.8,true);
    const rh=gable(F,M.roof,0,10.2,0,LU,LW,1.15);
    gableDress(F,-LU/2-0.9,10.2,0,LW,rh,true);gableDress(F,LU/2+0.9,10.2,0,LW,rh,true);
    // dormers on the river slope, and chimneys along the ridge
    for(const du of [-18,-4,10,24]){B(du,10.2,LW/2-2.4,4,3.4,3.2,M.plaster);windows(F,du,du,10.8,2.2,LW/2-0.8,1,5,false);
      gable(F,M.roof2,du,13.4,LW/2-2.4,3.2,4.2,1.1,0.4);}
    for(const cu of [-26,-6,16,30])B(cu,10.2,-2.5,2.2,rh+3.2,2.2,M.stone2);
    // ---- the loggia: slender columns and gently curved arches along the river front ----
    const bays=14,span=LU/bays;
    B(0,-0.2,LW/2+3.2,LU,0.5,6.4,M.stone2);                              // its floor
    for(let i=0;i<=bays;i++){const u=-LU/2+i*span;
      F.G(new THREE.CylinderGeometry(0.26,0.3,5,8).translate(0,2.5,0),M.stone,u,0.3,LW/2+6);
      F.G(new THREE.CylinderGeometry(0.45,0.45,0.35,8),M.stone2,u,5.2,LW/2+6);}
    for(let i=0;i<bays;i++){const u=-LU/2+(i+0.5)*span;F.G(archPlate(span-0.52,1.3,0.5,0.6).translate(0,3.8,0),M.stone,u,0.3,LW/2+6);}
    B(0,5.45,LW/2+3.2,LU+0.6,0.4,6.8,M.stone2);
    {const g=new THREE.BoxGeometry(LU+1.2,0.35,7.6);const m=F.G(g,M.roof2,0,6.5,LW/2+3.6);m.rotateX(0.22);}   // its lean-to roof
    // curved brackets under the eaves of the upper storey (the film's curve, Tolkien's house)
    for(let u=-LU/2+2;u<=LU/2-2;u+=3.2){const t=new THREE.TorusGeometry(0.9,0.14,4,8,Math.PI/2);F.G(t,M.timber,u,9.4,LW/2+0.1,Math.PI/2).rotateZ(Math.PI);}
    // ---- the tower, at the west end: square, taller than anything, a hipped roof ----
    const TU=-LU/2-2.5,TW=0,TS=9.5,TH=25;
    B(TU,-2,TW,TS+1,2.2,TS+1,M.stone2);B(TU,0,TW,TS,15,TS,M.stone);B(TU,15,TW,TS,TH-15,TS,M.plaster);
    framing(F,TU-TS/2+0.5,TU+TS/2-0.5,15,TH-15,TW+TS/2,1);
    for(const [du,dw] of [[0,TS/2],[0,-TS/2]]){F.B(TU+du,5,TW+dw+(dw>0?0.08:-0.08),1.2,3.4,0.2,M.glass);F.B(TU+du,11,TW+dw+(dw>0?0.08:-0.08),1.2,3.2,0.2,M.glass);F.B(TU+du,18.5,TW+dw+(dw>0?0.08:-0.08),1.6,3.4,0.2,M.glass);}
    B(TU,TH-0.2,TW,TS+1.2,0.6,TS+1.2,M.timber);
    hipped(F,M.roof,TU,TH+0.3,TW,TS,TS,8.5);
    F.G(new THREE.ConeGeometry(0.3,3,6),M.gilt,TU,TH+8.6,TW);F.G(new THREE.SphereGeometry(0.4,8,6),M.gilt,TU,TH+8.3,TW);
    B(TU,17.5,TW+TS/2+1.2,TS-1,0.35,2.4,M.stone2);                        // its balcony over the valley
    for(let i=0;i<5;i++)B(TU-(TS-1)/2+i*(TS-1)/4,17.8,TW+TS/2+2.3,0.14,1,0.14,M.stone2);
    // ---- the Hall of Fire: a wing to the north, one tall room, a hearth at each end ----
    const HU=20,HW=-LW/2-8,HL=26,HWd=15;
    B(HU,-1,HW,HL+1,1.2,HWd+1,M.stone2);B(HU,0,HW,HL,9,HWd,M.stone);
    windows(F,HU-HL/2+3,HU+HL/2-3,1.5,6.5,HW-HWd/2,-1,4.4,true);
    const hh=gable(F,M.roof,HU,9,HW,HL,HWd,1.1);
    gableDress(F,HU-HL/2-0.9,9,HW,HWd,hh,true);gableDress(F,HU+HL/2+0.9,9,HW,HWd,hh,true);
    for(const e of [-1,1]){B(HU+e*(HL/2+0.9),0,HW,2.2,9+hh+4,4.2,M.stone2);B(HU+e*(HL/2+0.9),9+hh+4,HW,2.8,0.6,4.8,M.stone);}
    // ---- the porch on the east side, onto the gardens: four columns and a gable ----
    const EU=LU/2+5;
    B(EU,-0.2,0,8,0.5,11,M.stone2);
    for(const dw of [-4.2,-1.4,1.4,4.2])F.G(new THREE.CylinderGeometry(0.28,0.32,6,8).translate(0,3,0),M.stone,EU+3,0.3,dw);
    B(EU+1.5,6.3,0,5,0.5,11,M.stone2);
    {const ph=gable(F,M.roof2,EU+1.5,6.8,0,5,10.6,0.95,0.5);gableDress(F,EU+4.4,6.8,0,10.6,ph,true);}
    F.G(archPlate(4.4,1.2,0.5,0.5).rotateY(Math.PI/2).translate(0,4.2,0),M.stone,EU+3,0.3,0);
    // ---- the terrace in front, to the edge of the shelf, and the stair down the bluff to the river ----
    B(0,-0.3,LW/2+14,LU+10,0.45,16,M.stone2);
    for(let u=-LU/2-4;u<=LU/2+4;u+=2.4)B(u,0.15,LW/2+21.8,0.24,1.0,0.24,M.stone);   // a balustrade along the edge
    B(0,1.05,LW/2+21.8,LU+8,0.22,0.4,M.stone);
    // the stair: flights down the face of the bluff to the river walk
    {const top=0,drop=V.sites.house.y-V.river.reduce((b,q)=>Math.abs(q[0]-S.x)<Math.abs(b[0]-S.x)?q:b,V.river[0])[2]-3;
     let yy=top,uu=-LU/2+6,dir=1,w0=LW/2+22.4;
     for(let f=0;f<4&&yy>-drop;f++){for(let k=0;k<14&&yy>-drop;k++){B(uu,yy-0.45,w0+1.4,1.7,0.45,2.2,M.stone2);uu+=0.42*dir;yy-=0.45;}
       B(uu+dir*0.9,yy-0.4,w0+1.4,2.2,0.4,2.4,M.stone2);dir=-dir;w0+=0;}}
    // ---- the east garden: lawns in beds, hedges, flowers, a fountain ----
    const GU=EU+26;
    for(let i=0;i<4;i++)for(let j=0;j<3;j++){const u=GU-12+i*8,w=-9+j*9;
      B(u,0,w,6.6,0.9,0.7,M.hedge);B(u,0,w+6,6.6,0.9,0.7,M.hedge);
      for(let k=0;k<5;k++)B(u-2.6+k*1.3,0,w+3,1.1,0.35,4.4,M.flower[(i+j+k)%4]);}
    F.G(new THREE.CylinderGeometry(3.2,3.4,0.8,16),M.stone2,GU,0,0);F.G(new THREE.CylinderGeometry(2.8,2.8,0.12,16),M.water,GU,0.75,0);
    F.G(new THREE.CylinderGeometry(0.3,0.5,2.4,8).translate(0,1.2,0),M.stone,GU,0.6,0);F.G(new THREE.SphereGeometry(0.7,10,6),M.stone,GU,3.2,0);
    // ---- the stables and the forge, behind the house to the north-east ----
    const SU=55,SW=-26;
    B(SU,-0.5,SW,34,0.8,10,M.stone2);B(SU,0,SW,34,4.2,9,M.plaster);framing(F,SU-16,SU+16,0,4.2,SW+4.5,1);
    for(let u=SU-14;u<=SU+14;u+=4)F.B(u,0.5,SW+4.62,2.4,2.8,0.2,M.timber);
    const sh=gable(F,M.roof2,SU,4.2,SW,34,9,1.0);gableDress(F,SU+17.9,4.2,SW,9,sh,true);
    const FU=SU+26,FW=SW+4;B(FU,0,FW,10,4.6,8,M.stone);gable(F,M.roof,FU,4.6,FW,10,8,1.0);B(FU+3,4.6,FW-1.5,1.6,6.5,1.6,M.stone2);
    // ---- statues in the garden: tall robed figures on stepped plinths ----
    for(const [u,w] of [[GU-18,12],[GU+16,12],[-LU/2-12,14]]){
      F.B(u,0,w,2.6,0.6,2.6,M.stone2);F.B(u,0.6,w,1.8,0.6,1.8,M.stone2);
      const fig=new THREE.LatheGeometry([0.02,0.45,0.42,0.3,0.22,0.26,0.2,0.02].map((r,i)=>new THREE.Vector2(r,[0,0.2,1.2,2.4,2.8,3.0,3.3,3.45][i])),8);
      F.G(fig,M.stone,u,1.2,w);}
    // where the smoke comes from: the chimneys on the ridge, the two hearths of the Hall of Fire, the forge
    const top=(u,w,y)=>{const [x,z]=F.P(u,w);return [x,y0+y,z];};
    ctx.rivSmoke=[...[-26,-6,16,30].map(cu=>top(cu,-2.5,10.2+rh+3.2)),top(HU-HL/2-0.9,HW,9+hh+4.6),top(HU+HL/2+0.9,HW,9+hh+4.6),top(FU+3,FW-1.5,11.1)];
    ctx.rivHouse=F;
    return group(L,F.parts);
  },

  // ================================================================ the bridge
  // "a narrow bridge of stone without a parapet, as narrow as a pony could well walk on": one arch.
  bridge(L,x,z){
    const S=V.sites.bridge,parts=[];
    const zS=S.zS,zN=S.zN,span=Math.abs(zS-zN),mid=(zS+zN)/2,wl=S.y;
    const yS=gh(S.x,zS),yN=gh(S.x,zN),crown=Math.max(yS,yN)+2.4;
    // the deck: an arc from bank to bank, and the arch under it
    const s=new THREE.Shape(),n=16,half=span/2+4;
    const deck=t=>{const u=-half+t*2*half;const a=Math.min(yS,yN),b=crown;return a+(b-a)*(1-Math.pow(u/half,2))+(u<0?(yS-a):(yN-a))*Math.pow(Math.abs(u)/half,4);};
    s.moveTo(-half,wl-2);
    for(let i=0;i<=n;i++){const t=i/n;s.lineTo(-half+t*2*half,deck(t));}
    s.lineTo(half,wl-2);
    s.absellipse(0,wl-0.6,span/2*0.92,Math.max(2.5,crown-wl-2.4),0,Math.PI,false);
    s.lineTo(-half,wl-2);
    const g=new THREE.ExtrudeGeometry(s,{depth:1.7,bevelEnabled:false,curveSegments:14});g.translate(0,0,-0.85);g.rotateY(-Math.PI/2);
    // after the turn the shape's x runs along +z: across the river, south to north
    // mirrored so that its south end is at the south bank: double-sided, since a mirror turns every face inside out
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xb9b0a0,flatShading:true,side:THREE.DoubleSide}));
    m.position.set(S.x,0,mid);if(zN<zS)m.scale.z=-1;
    parts.push(m);
    return group(L,parts);
  },

  // ================================================================ the stair cut into the rock
  // On the way in from the Ford the path goes over a rock "by means of stairs carved into the stone".
  stair(L,x,z){
    const parts=[],road=(api.ROADS||[]).find(r=>/Ford/.test(r.name));if(!road)return group(L,parts);
    const cm=new THREE.MeshLambertMaterial({color:0xa9a294,flatShading:true});
    const p=road.pts;
    for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1];if(Math.max(ax,bx)<-760||Math.min(ax,bx)>-430)continue;
      const L2=Math.hypot(bx-ax,bz-az),ang=Math.atan2(bz-az,bx-ax);
      for(let s=0;s<L2;s+=0.9){const t=s/L2,x2=ax+(bx-ax)*t,z2=az+(bz-az)*t,y=gh(x2,z2),y2=gh(x2+(bx-ax)/L2*0.9,z2+(bz-az)/L2*0.9);
        if(Math.abs(y2-y)<0.18)continue;
        const st=new THREE.Mesh(new THREE.BoxGeometry(0.95,0.5,3.2),cm);st.position.set(x2,Math.max(y,y2)-0.2,z2);st.rotation.y=-ang;parts.push(st);}}
    return group(L,parts);
  },

  // ================================================================ a pavilion
  // Eight slender columns on a round base, a ring beam, a bell dome gone green, a gilt finial, and a seat
  // round the inside. Where the shelf ends over the bluff, for looking at the water from.
  pavilion(L,x,z){
    const idx=(L.index|0),S=V.sites.pavilions[idx]||{x,z,y:gh(x,z)},parts=[],y=S.y;
    const r=3.6;
    const add=(g,m,px,py,pz)=>{const o=new THREE.Mesh(g,m);o.position.set(px,py,pz);parts.push(o);return o;};
    add(new THREE.CylinderGeometry(r+0.8,r+1.1,1.6,16),M.stone2,S.x,y-0.4,S.z);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;add(new THREE.CylinderGeometry(0.16,0.2,4.6,8).translate(0,2.3,0),M.stone,S.x+Math.cos(a)*r,y+0.4,S.z+Math.sin(a)*r);
      const ag=archPlate(2.6,0.7,0.26,0.28);const o=add(ag,M.stone,S.x+Math.cos(a+Math.PI/8)*r*0.93,y+4.1,S.z+Math.sin(a+Math.PI/8)*r*0.93);o.rotation.y=-(a+Math.PI/8)+Math.PI/2;}
    add(new THREE.TorusGeometry(r,0.28,5,16).rotateX(Math.PI/2),M.stone2,S.x,y+5.2,S.z);
    add(bell(r+0.6,4.4),M.copper,S.x,y+5.3,S.z);
    add(new THREE.ConeGeometry(0.16,1.8,6),M.gilt,S.x,y+10.3,S.z);add(new THREE.SphereGeometry(0.3,8,6),M.gilt,S.x,y+9.5,S.z);
    add(new THREE.TorusGeometry(r-0.8,0.3,4,16,Math.PI*1.6).rotateX(Math.PI/2),M.timber,S.x,y+0.9,S.z);
    return group(L,parts);
  },

  // ================================================================ the Ford of Bruinen
  // The road goes through the water here. Low stones mark the crossing, and a pair of standing stones the
  // edge of Elrond's country on the far side.
  ford(L,x,z){
    const S=V.sites.ford,parts=[],sm=new THREE.MeshLambertMaterial({color:0x9a9385,flatShading:true});
    const road=(api.ROADS||[]).find(r=>/East Road/.test(r.name));
    if(road){const p=road.pts;for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1];if(Math.hypot((ax+bx)/2-S.x,(az+bz)/2-S.z)>260)continue;
      const L2=Math.hypot(bx-ax,bz-az);for(let s=0;s<L2;s+=5){const t=s/L2,px=ax+(bx-ax)*t,pz=az+(bz-az)*t;if(Math.hypot(px-S.x,pz-S.z)>60)continue;
        for(const sd of [-1,1]){const nx=-(bz-az)/L2,nz=(bx-ax)/L2;const st=new THREE.Mesh(new THREE.DodecahedronGeometry(0.7,0),sm);st.position.set(px+nx*sd*5,Math.max(gh(px,pz),S.y)+0.1,pz+nz*sd*5);parts.push(st);}}}}
    for(const sd of [-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(1.4,4.2,0.9),sm);st.position.set(S.x+60,gh(S.x+60,S.z+sd*14)+2,S.z+sd*14);st.rotation.set(0.04*sd,0.3,0);parts.push(st);}
    return group(L,parts);
  },
  };
}
