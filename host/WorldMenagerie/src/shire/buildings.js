// ---------- what stands above ground ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// Not every hobbit lives in a hole. Tolkien's watercolour of Hobbiton has houses too: long and low,
// whitewashed, under red tile or thatch, with round windows - hobbits like round windows wherever they are.
// And three buildings he paints or names that everybody knows:
//
//   the Mill      a square tower of yellow stone with a red hipped roof and round windows, a lower wing beside
//                 it, and a wheel in the Water; "based on the mill at Sarehole". Its wheel turns.
//   the Grange    the Old Grange above the mill: a long whitewashed range under red tiles, with the ricks
//                 standing beside it like thatched beehives
//   the Green Dragon  at Bywater, "the building nearest to Hobbiton" on the Bywater Road
//
// and the bridge over the Water at the foot of the Hill, with the sign at the end of it pointing WEST.

export function buildings(api){
  const {THREE,ctx,scene,groundH,mergeParts,animHooks}=api;
  const V=ctx.plan;if(!V)return;
  const R=mkR(2941);
  const mats={};const matOf=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c,flatShading:true}));
  const byMat=new Map();
  const add=(m)=>{if(!byMat.has(m.material))byMat.set(m.material,[]);byMat.get(m.material).push(m);return m;};
  // a frame: origin (x, z), ground y, turned by `rot` (local u along the house, w across it)
  const frame=(x,z,y,rot)=>{const c=Math.cos(rot),s=Math.sin(rot);
    const P=(u,w)=>[x+c*u-s*w,z+s*u+c*w];
    const B=(u,yy,w,lu,h,lw,col,ry)=>{const [px,pz]=P(u,w);const m=new THREE.Mesh(new THREE.BoxGeometry(lu,h,lw).translate(0,h/2,0),matOf(col));m.position.set(px,y+yy,pz);m.rotation.y=-rot+(ry||0);return add(m);};
    const G=(geo,col,u,yy,w,ry,rx)=>{const [px,pz]=P(u,w);const m=new THREE.Mesh(geo,matOf(col));m.position.set(px,y+yy,pz);m.rotation.set(rx||0,-rot+(ry||0),0,'YXZ');return add(m);};
    return {P,B,G,rot};};
  const WHITE=0xefe9dc,TILE=0xb04a30,TILE2=0x9e4430,THATCH=0xc8a860,STONE=0xcdbf9e,YELLOW=0xd9b87a,TIMBER=0x5e4633,GLASS=0x2a2a26;
  const DOORS=[0x2f6a34,0xb8423a,0x2f5f8a,0xd4a73a,0x3a7a6a];
  // a gable over lu x lw at height y: a prism, ridge along u
  const gable=(F,col,u,y,w,lu,lw,pitch,over)=>{const o=over===undefined?0.5:over,h=(lw/2+o)*pitch;
    const sh=new THREE.Shape();sh.moveTo(-(lw/2+o),0);sh.lineTo(lw/2+o,0);sh.lineTo(0,h);sh.lineTo(-(lw/2+o),0);
    const g=new THREE.ExtrudeGeometry(sh,{depth:lu+o*2,bevelEnabled:false});g.translate(0,0,-(lu+o*2)/2);g.rotateY(Math.PI/2);F.G(g,col,u,y-0.05,w);return h;};
  // thatch: a fat rounded roof, a half-cylinder squashed and swollen at the eaves
  const thatch=(F,u,y,w,lu,lw,hh)=>{const g=new THREE.CylinderGeometry(1,1,1,14,1,false,0,Math.PI).rotateZ(Math.PI/2);
    const m=F.G(g,THATCH,u,y,w);m.scale.set(lu+1.2,hh,lw/2+0.8);return hh;};
  const roundWin=(F,u,y,w,r,face)=>{const g=new THREE.CylinderGeometry(r,r,0.12,18).rotateX(Math.PI/2);F.G(g,GLASS,u,y,w,face);F.G(new THREE.TorusGeometry(r+0.04,0.07,5,18),TIMBER,u,y,w,face);};
  const pick=[];

  // ---- houses, farmhouses and barns ----
  for(const h of V.houses){
    const F=frame(h.x,h.z,h.y,h.rot),w=h.w,d=h.d;
    if(h.kind==='barn'){F.B(0,-0.4,0,w,4.6,d,0x6a4a32);F.B(0,0,d/2+0.02,4,3.2,0.1,0x4a3424);gable(F,TILE2,0,4.2,0,w,d,0.95);continue;}
    const tall=h.kind==='farmhouse'?4.8:2.8;
    F.B(0,-0.6,0,w+0.3,0.8,d+0.3,STONE);F.B(0,0,0,w,tall,d,WHITE);
    const fs=h.roof==='thatch';
    if(fs)thatch(F,0,tall,0,w,d,2.6);else gable(F,R()<0.5?TILE:TILE2,0,tall,0,w,d,0.85);
    // the door, round, in the middle of the long side facing out; round windows either side
    F.G(new THREE.CylinderGeometry(0.75,0.75,0.12,20).rotateX(Math.PI/2),DOORS[Math.floor(R()*DOORS.length)],0,0.85,d/2+0.02,0);
    for(const u of [-w*0.3,w*0.3])roundWin(F,u,1.4,d/2+0.03,0.42,0);
    if(tall>3)for(const u of [-w*0.3,0,w*0.3])roundWin(F,u,3.6,d/2+0.03,0.36,0);
    for(const u of [-w*0.25,w*0.25])roundWin(F,u,1.4,-d/2-0.03,0.38,Math.PI);
    F.B(w/2-1.2,tall-0.2,-0.6,0.8,(fs?3.4:d*0.5)+1.2,0.8,0x9a5a42);                          // chimney
    ctx.shireSmoke=(ctx.shireSmoke||[]);{const [x,z]=F.P(w/2-1.2,-0.6);ctx.shireSmoke.push([x,h.y+tall+(fs?3.4:d*0.5)+1.4,z]);}
  }

  // ---- the farmyards: between the farmhouse and its barn (at 26 m along the house, turned square to it), in
  //      front of the house - a fenced yard with a well, a granary on staddle stones, ricks, a cart, a pigsty,
  //      a hen house and hens; behind the house the kitchen garden in rows. Each piece sits on its own ground.
  const at=(F0,u,w)=>{const [x,z]=F0.P(u,w);return frame(x,z,groundH(x,z),F0.rot);};
  for(const fm of (V.farms||[])){const [fx,fz,frot]=fm;if(frot===undefined)continue;const F0=frame(fx,fz,0,frot);
    // the fence: posts and rails round three sides of the yard
    const fence=(u0,w0,u1,w1)=>{const L=Math.hypot(u1-u0,w1-w0),n=Math.max(1,Math.round(L/2.5));
      for(let i=0;i<=n;i++){const t=i/n,F=at(F0,u0+(u1-u0)*t,w0+(w1-w0)*t);F.B(0,0,0,0.14,1.2,0.14,TIMBER);
        if(i<n){const um=u0+(u1-u0)*(t+0.5/n),wm=w0+(w1-w0)*(t+0.5/n),G=at(F0,um,wm);
          const ang=Math.atan2(w1-w0,u1-u0);for(const hh of [0.5,0.95])G.G(new THREE.BoxGeometry(L/n+0.1,0.1,0.07),0x7a5a3a,0,hh,0,-ang);}}};
    fence(-11,7,-11,25);fence(-11,25,20,25);fence(20,25,20,7);
    {const F=at(F0,8,9);F.G(new THREE.CylinderGeometry(0.9,1,0.9,10).translate(0,0.45,0),STONE,0,0,0);          // the well
     for(const d of [-0.8,0.8])F.B(d,0,0,0.12,2.1,0.12,TIMBER);gable(F,TILE2,0,2.1,0,1.6,1.8,0.8,0.2);}
    {const F=at(F0,-4,17);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const u=-1.6+i*1.6,w=-1.2+j*1.2;          // the granary on staddle stones
       F.G(new THREE.CylinderGeometry(0.12,0.22,0.8,6).translate(0,0.4,0),STONE,u,0,w);F.G(new THREE.CylinderGeometry(0.4,0.4,0.12,8),STONE,u,0.86,w);}
     F.B(0,0.92,0,4.2,2.4,3.2,0x7a5a3a);gable(F,TILE,0,3.32,0,4.2,3.2,0.9,0.3);}
    for(const [u,w] of [[13,20],[17.5,15]]){const F=at(F0,u,w);F.G(new THREE.CylinderGeometry(2.2,2.4,2.4,12).translate(0,1.2,0),THATCH,0,0,0);   // ricks
      F.G(new THREE.SphereGeometry(2.5,12,8,0,Math.PI*2,0,Math.PI/2).scale(1,1.3,1),0xd8b860,0,2.3,0);}
    {const F=at(F0,4,15);F.B(0,0.9,0,1.6,0.5,2.8,0x8a6a48);                                              // a cart, shafts down
     for(const d of [-0.95,0.95])F.G(new THREE.CylinderGeometry(0.7,0.7,0.1,12).rotateZ(Math.PI/2),0x4a3a2a,d,0.7,0.2);
     for(const d of [-0.45,0.45])F.G(new THREE.BoxGeometry(0.08,0.08,2.4),0x6a4a2a,d,0.45,-2.3,0,0.35);}
    {const F=at(F0,-15,3);F.B(0,0,-2,5,0.9,0.3,STONE);F.B(0,0,2,5,0.9,0.3,STONE);F.B(-2.5,0,0,0.3,0.9,4,STONE);F.B(2.5,0,0,0.3,0.9,4,STONE);  // the sty
     F.B(-1.4,0,0.6,2,1.4,2.6,0x7a5a3a);gable(F,TILE2,-1.4,1.4,0.6,2,2.6,0.6,0.2);
     for(let k=0;k<3;k++)F.B(0.6+k*0.5,0,-1.2+k*0.9,1.0,0.55,0.55,0xe0a090,k);}
    {const F=at(F0,2,21);for(const [u,w] of [[-0.7,-0.5],[0.7,-0.5],[-0.7,0.5],[0.7,0.5]])F.B(u,0,w,0.1,0.7,0.1,TIMBER);   // hen house
     F.B(0,0.7,0,1.8,1.1,1.4,0x8a6a48);gable(F,TILE2,0,1.8,0,1.8,1.4,0.7,0.15);
     for(let k=0;k<8;k++)F.B(-3+R()*6,0,-3+R()*6,0.3,0.28,0.2,R()<0.7?0xf0ece0:0xa8683a,R()*6);}
    for(let r=0;r<5;r++)for(let c=0;c<9;c++){const F=at(F0,-8+c*2,-8-r*1.6);                               // the kitchen garden
      F.G(new THREE.SphereGeometry(r%2?0.32:0.26,6,5).scale(1,0.8,1),[0x5f9a3a,0x4a8a34,0x7aa040,0x6a9a4a,0x5a8a3a][r],0,0.12,0);}
  }

  // ---- the Mill ----
  let wheel=null;
  // It stands on the bank with its river wall in the water, on a stone footing, and the wheel in the stream. The
  // generator levels a yard for it; here it is set against the river as water.js actually drew it (with its
  // meander), so the wheel is always in the water: `w` in the mill's frame points across the river.
  {const S=V.sites.mill,st=(ctx.shireWater&&ctx.shireWater.stations)||[];
   let k0=0,bd=1e9;st.forEach((p,i)=>{const d=Math.hypot(p[0]-S.x,p[1]-S.z);if(d<bd){bd=d;k0=i;}});
   let cx=S.x,cz=S.z,rot=S.turn,hw=4.6;
   if(st.length>2){const p=st[k0],a0=st[Math.max(0,k0-2)],b0=st[Math.min(st.length-1,k0+2)];let dx=b0[0]-a0[0],dz=b0[1]-a0[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
     let nx=-dz,nz=dx;if(nx*(S.x-p[0])+nz*(S.z-p[1])<0){nx=-nx;nz=-nz;}                    // the normal, towards the bank the mill is on
     hw=p[3];cx=p[0]+nx*(hw+2.8);cz=p[1]+nz*(hw+2.8);rot=Math.atan2(nx,-nz);}
   const y=S.y+0.8,F=frame(cx,cz,y,rot);
   F.B(0,-2.6,0,7.8,3.0,7.8,STONE);F.B(0,0,0,7,12.5,7,YELLOW);
   F.B(9.4,-2.6,0.4,12.2,3.0,8.0,STONE);                                                     // the wing's footing
   // the weir upstream, a low stone sill across the stream, and the white water coming over it
   F.B(-17,-2.6,hw+2.8,1.4,2.05,2*hw+5,STONE);F.B(-15.6,-0.72,hw+2.8,1.6,0.06,2*hw+1,0xdfe8e6);
   // and a sluice gate beside the wheel, on its own posts
   for(const w of [3.9,6.6])F.B(-4.6,-1.6,w,0.3,4.6,0.3,TIMBER);F.B(-4.6,1.2,5.25,0.2,1.2,2.7,TIMBER);
   // the hipped roof, red
   {const c=new THREE.ConeGeometry(Math.SQRT2/2,1,4,1).rotateY(Math.PI/4);c.scale(8.4,4.4,8.4);c.translate(0,2.2,0);F.G(c,TILE,0,12.5,0);}
   for(const yy of [4.2,8.4])roundWin(F,0,yy,3.53,0.5,0);
   F.B(0,1.6,3.51,1.6,2.4,0.1,TIMBER);                                                        // the arched door, square here
   // the wing, lower, beside it
   F.B(9.4,0,0.4,11.8,6.2,7.6,YELLOW);gable(F,TILE2,9.4,6.2,0.4,11.8,7.6,0.8);
   roundWin(F,7,3.2,4.22,0.45,0);roundWin(F,11.5,3.2,4.22,0.45,0);
   // the wheel: on the river side, turning
   wheel=new THREE.Group();const wm=matOf(0x6a5038);
   const rim=new THREE.Mesh(new THREE.TorusGeometry(3.3,0.16,6,28),wm);wheel.add(rim);
   const rim2=rim.clone();rim2.position.z=1.1;wheel.add(rim2);
   for(let k=0;k<12;k++){const a=k/12*Math.PI*2;
     const sp=new THREE.Mesh(new THREE.BoxGeometry(0.14,3.3,0.14).translate(0,1.65,0),wm);sp.rotation.z=a;wheel.add(sp);
     const pd=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.08,1.2),wm);pd.position.set(Math.cos(a+Math.PI/2)*3.4,Math.sin(a+Math.PI/2)*3.4,0.55);pd.rotation.z=a;wheel.add(pd);}
   wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,1.8,10).rotateX(Math.PI/2).translate(0,0,0.55),matOf(0x3a3a3a)));
   const [wx,wz]=F.P(-1.2,4.9);wheel.position.set(wx,S.y+2.5,wz);wheel.rotation.y=-rot;
   scene.add(wheel);
   pick.push({x:cx,z:cz,r:14,info:{name:'The Mill',info:'The old mill on the Water at the foot of the Hill, with its wheel turning: a square tower of yellow stone under a red roof, round windows, and a lower wing beside it. Tolkien put it in the foreground of his painting of Hobbiton; it is the mill at Sarehole, where he lived as a boy.'}});}

  // ---- the Old Grange, and its ricks ----
  {const S=V.sites.grange,F=frame(S.x,S.z,S.y,0.22);
   F.B(0,-0.6,0,38,0.8,10.4,STONE);F.B(0,0,0,38,4.4,10,WHITE);gable(F,TILE,0,4.4,0,38,10,0.9);
   for(let u=-15;u<=15;u+=5)roundWin(F,u,2.3,5.03,0.45,0);
   F.B(-19.8,0,-4,6,3.4,5,WHITE);gable(F,TILE2,-19.8,3.4,-4,6,5,0.9);
   for(let k=0;k<3;k++){const u=-8+k*7.5,w=-11;F.G(new THREE.CylinderGeometry(2.4,2.6,2.6,12).translate(0,1.3,0),THATCH,u,0,w);
     F.G(new THREE.SphereGeometry(2.7,12,8,0,Math.PI*2,0,Math.PI/2).scale(1,1.4,1),0xd8b860,u,2.5,w);F.G(new THREE.ConeGeometry(0.2,0.8,5),0x8a6a3a,u,6.1,w);}
   pick.push({x:S.x,z:S.z,r:24,info:{name:'The Old Grange',info:'Above the mill on the lane up to the Hill: a long whitewashed range under red tiles, with round windows, and the ricks beside it thatched like beehives. It is in the middle of Tolkien\'s painting, with a chestnut in flower in front of it.'}});}

  // ---- the Green Dragon ----
  {const S=V.sites.greenDragon,F=frame(S.x,S.z,S.y,0.55);
   F.B(0,-0.8,0,22.4,1,12.4,STONE);F.B(0,0,0,22,3.4,12,STONE);F.B(0,3.4,0,22,2.8,12,WHITE);
   for(let u=-10;u<=10;u+=3.3)F.B(u,3.4,6.02,0.3,2.8,0.1,TIMBER);
   thatch(F,0,6.2,0,22,12,3.6);
   for(const u of [-7,-3.5,3.5,7])roundWin(F,u,1.8,6.04,0.55,0);
   for(const u of [-6,-2,2,6])roundWin(F,u,4.6,6.04,0.42,0);
   F.G(new THREE.CylinderGeometry(0.9,0.9,0.12,20).rotateX(Math.PI/2),0x2f6a34,0,1.1,6.05,0);
   // the sign: a green board on a bracket
   // the sign: a board hung from a bracket, and on it a green dragon, rampant
   F.B(0,4.6,7.2,0.12,0.12,2.4,TIMBER);F.B(0,3.2,8.2,1.7,1.3,0.1,0xe8dcc0);F.B(0,3.95,8.2,0.08,0.3,0.08,TIMBER);
   for(const [du,dy,lu,lh] of [[0,3.55,0.9,0.28],[-0.3,3.85,0.3,0.4],[0.42,3.4,0.32,0.18],[-0.1,3.35,0.18,0.26],[0.22,3.33,0.18,0.24],[0.1,3.9,0.5,0.12]])F.B(du,dy,8.14,lu,lh,0.06,0x2f7a3a);
   // lanterns either side of the door, and ivy up the walls
   for(const u of [-1.6,1.6]){F.B(u,2.3,6.3,0.3,0.4,0.3,0xf0d890);const [lx,lz]=F.P(u,6.3);(ctx.shireLamps=ctx.shireLamps||[]).push([lx,S.y+2.5,lz]);}
   for(let k=0;k<9;k++){const u=-10+R()*20;F.B(u,0,6.08,1.2+R()*1.6,2+R()*3,0.12,0x3f6a30);}
   for(let k=0;k<3;k++){const u=-7+k*7;F.B(u,0,12,2.2,0.8,1.1,TIMBER);F.B(u,0,13.2,2.2,0.45,0.4,TIMBER);F.B(u,0,10.8,2.2,0.45,0.4,TIMBER);}
   for(const u of [-4,4])F.B(u,0,8.5,2.6,0.5,0.6,TIMBER);                                    // benches outside
   F.B(10.6,3.4,-2,1.2,6,1.2,0x9a5a42);{const [x,z]=F.P(10.6,-2);(ctx.shireSmoke=ctx.shireSmoke||[]).push([x,S.y+9.6,z]);}
   pick.push({x:S.x,z:S.z,r:16,info:{name:'The Green Dragon',info:'The inn at Bywater, on the Bywater Road a mile south-east of the bridge: the building nearest to Hobbiton, where the talk is of what happened to other people.'}});}

  // ---- the bridge over the Water, and the sign pointing WEST ----
  const plankBridge=(x,z,y,ang,len)=>{const F=frame(x,z,y,ang);
    F.B(0,-0.3,0,len,0.35,2.8,0x9a8260);
    for(const w of [-1.3,1.3]){for(let u=-len/2;u<=len/2;u+=1.4)F.B(u,0,w,0.14,1.1,0.14,0x8a7050);F.B(0,1.0,w,len,0.12,0.14,0x8a7050);}
    for(const u of [-len/2+0.6,len/2-0.6])F.B(u,-2.4,0,1.4,2.2,3.2,STONE);};
  {const S=V.sites.bridge,W=V.water;
   // across the river where it is: square to the line of the water there
   let k=0,best=1e9;for(let i=0;i<W.length;i++){const d=Math.hypot(W[i][0]-S.x,W[i][1]-S.z);if(d<best){best=d;k=i;}}
   const a=W[Math.max(0,k-1)],b=W[Math.min(W.length-1,k+1)],ang=Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2;
   // the films' double-arched stone bridge: two arches and a pier in the stream, low walls for parapets
   {const len=22,wid=3.6,deck=S.y+3.2,F=frame(S.x,S.z,deck,ang);
    // the side elevation, with the two arch openings cut in it as holes, extruded the width of the bridge
    const holeShape=cx=>{const hs=new THREE.Path();hs.moveTo(cx-4.2,-5);hs.lineTo(cx-4.2,-2.8);hs.absellipse(cx,-2.8,4.2,2.6,Math.PI,0,true);hs.lineTo(cx+4.2,-5);hs.lineTo(cx-4.2,-5);return hs;};
    const sh2=new THREE.Shape();sh2.moveTo(-len/2,-5);sh2.lineTo(-len/2,0.6);sh2.quadraticCurveTo(0,1.6,len/2,0.6);sh2.lineTo(len/2,-5);sh2.lineTo(-len/2,-5);
    sh2.holes.push(holeShape(-len/4-0.2),holeShape(len/4+0.2));
    const g=new THREE.ExtrudeGeometry(sh2,{depth:wid,bevelEnabled:false,curveSegments:10});g.translate(0,0,-wid/2);
    F.G(g,0xb8ae98,0,0,0);
    // the parapets: a low wall along each side
    for(const w of [-wid/2+0.2,wid/2-0.2]){const p2=new THREE.Shape();p2.moveTo(-len/2,0.6);p2.quadraticCurveTo(0,1.6,len/2,0.6);p2.lineTo(len/2,1.4);p2.quadraticCurveTo(0,2.4,-len/2,1.4);p2.lineTo(-len/2,0.6);
      const pg=new THREE.ExtrudeGeometry(p2,{depth:0.4,bevelEnabled:false});pg.translate(0,0,-0.2);F.G(pg,0xa89e88,0,0,w);}}
   const F=frame(S.x,S.z,groundH(S.x+Math.cos(ang)*-10,S.z+Math.sin(ang)*-10),ang);
   F.B(-10,0,-2.2,0.18,2.4,0.18,TIMBER);F.B(-10.4,1.9,-2.2,1.2,0.3,0.08,0xe8e0c8);            // WEST
   pick.push({x:S.x,z:S.z,r:10,info:{name:'The bridge',info:'Over the Water at the foot of the Hill, by the mill: the way from Hobbiton to Bywater and the Road. A sign at the end of it points WEST.'}});}
  // the plank bridge where the lane west crosses the Water
  {const lw=V.lanes.find(l=>l.n==='The lane west'),W=V.water;
   if(lw){outer:for(let i=0;i+1<lw.p.length;i++)for(let j=0;j+1<W.length;j++){const p=seg(lw.p[i],lw.p[i+1],W[j],W[j+1]);
     if(p&&Math.hypot(p[0],p[1])>200){const ang=Math.atan2(lw.p[i+1][1]-lw.p[i][1],lw.p[i+1][0]-lw.p[i][0]);plankBridge(p[0],p[1],W[j][2]+1.1,ang,12);break outer;}}}}

  const group=new THREE.Group();group.name='buildings';
  for(const [m,list] of byMat){const g=mergeParts(list,m);if(g){g.castShadow=true;g.receiveShadow=true;group.add(g);}}
  scene.add(group);
  animHooks.push(now=>{if(wheel)wheel.rotation.z=-now/1000*0.8;});
  ctx.shireCards=(ctx.shireCards||[]).concat(pick);
  ctx.details=Object.assign(ctx.details||{},{houses:V.houses.length});
}

// where two segments cross, or null
function seg(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;
  const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;
  return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+r[0]*t,a[1]+r[1]*t]:null;}
function mkR(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
