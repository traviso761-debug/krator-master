// What is built in Beach City. Fan work — every shape is this project's own low-poly geometry, and nothing
// from the show is used. Steven Universe belongs to Rebecca Sugar and Cartoon Network.
//
// The town itself is the engine's: the streets, the houses and the shops along the avenue come out of
// tools/make-beachcity.py like any city's buildings. What is here is what makes it this town and not another
// one on the same coast: the temple in the sea cliff and the house on the sand at its feet, the lighthouse on
// the headland, the Big Donut with its donut, the shops on the boardwalk with their signs, Funland and its wheel,
// the car wash, and the fishing pier.
//
// The plan (data/cities/beachcity-plan.json) says where each stands, in metres; the landmarks in the city file
// say what each is called. The sea is east (+x), so everything on the front faces +x.

export function landmarks(api){
  const {THREE,ctx,group,gh,animHooks}=api;
  const P=ctx.plan||{sites:{}},S=P.sites;
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;

  const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const M={
    rock:mat(0xd8d0cc),        // the temple's stone: paler than the cliff it is cut from, as if it had been dressed
    rock2:mat(0xb89c94),
    hair:mat(0x6e6870),        // dark stone: on the map the statue is grey all over, her hair darker
    lips:mat(0xc89a9a),
    pad:new THREE.MeshLambertMaterial({color:0xd8f0f4,emissive:0x5ab0c8,emissiveIntensity:0.2,flatShading:true}),
    star:new THREE.MeshLambertMaterial({color:0xf0a8c0,emissive:0x602040,flatShading:true}),
    board:mat(0xe8d6ae),       // painted weatherboard
    trim:mat(0xf6f2ea),
    roof:mat(0xb4584e),
    deck:mat(0x9a7452),
    post:mat(0x6e5440),
    white:mat(0xf4f2ee),
    red:mat(0xc8343a),
    glass:mat(0x2c3a44),
    lamp:new THREE.MeshBasicMaterial({color:0xfff2b0}),
    dough:mat(0xd6a565),
    icing:mat(0xf08cb4),
    steel:mat(0xb8bcc2),
    cream:mat(0xf2e8d8),
  };
  const glow=[];   // materials that light up after dark: [material, strength]
  animHooks.push(()=>{const n=nightF();for(const [m,k] of glow)m.emissiveIntensity=0.15+k*n;});

  // ---- small helpers ----
  const mesh=(geo,m,x,y,z,ry)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;return o;};
  // a box standing on y (its bottom), centred on x and z: lx along x, lz along z
  const blk=(x,y,z,lx,h,lz,m)=>mesh(new THREE.BoxGeometry(lx,h,lz).translate(0,h/2,0),m,x,y,z);
  // a round bar from a to b
  const UP=new THREE.Vector3(0,1,0);
  function limb(a,b,r0,r1,m,segs){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1===undefined?r0:r1,r0,L,segs||8),m);o.position.copy(A).addScaledVector(d,0.5);
    o.quaternion.setFromUnitVectors(UP,d.normalize());return o;}
  const ball=(x,y,z,r,m,sx,sy,sz)=>{const o=mesh(new THREE.SphereGeometry(r,12,9),m,x,y,z);o.scale.set(sx||1,sy||1,sz||1);return o;};
  // A sign: lettering drawn on a canvas, on a plane facing +x (the sea, the boardwalk). It glows after dark.
  // `art`, if given, draws a picture on the board first and the lettering goes underneath it.
  function sign(text,w,h,bg,fg,x,y,z,ry,lit,art){
    const c=document.createElement('canvas');c.width=512;c.height=Math.max(64,Math.round(512*h/w));const g=c.getContext('2d');
    g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);if(art)art(g,c.width,c.height);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
    let fs=c.height*(art?0.24:0.62);g.font='bold '+fs+'px sans-serif';while(g.measureText(text).width>c.width*0.9&&fs>8){fs-=2;g.font='bold '+fs+'px sans-serif';}
    g.fillText(text,c.width/2,art?c.height*0.84:c.height/2+fs*0.04);
    const t=new THREE.CanvasTexture(c);t.anisotropy=4;
    const m=new THREE.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0.15});if(lit!==false)glow.push([m,0.8]);
    const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h).rotateY(Math.PI/2),m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;return o;}
  // a five-pointed star in the y-z plane, facing +x
  function starGeo(r,depth){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?r*0.42:r;
      const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?s.lineTo(px,py):s.moveTo(px,py);}
    return new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false}).rotateY(Math.PI/2);}
  // a gable roof with its ridge along z (or along x), eaves at y
  function gable(x,y,z,lx,lz,rise,m,alongX){const s=new THREE.Shape(),hw=(alongX?lz:lx)/2;s.moveTo(-hw,0);s.lineTo(hw,0);s.lineTo(0,rise);s.lineTo(-hw,0);
    const L=alongX?lx:lz,g=new THREE.ExtrudeGeometry(s,{depth:L,bevelEnabled:false});g.translate(0,0,-L/2);if(alongX)g.rotateY(Math.PI/2);
    return mesh(g,m,x,y,z);}
  // a striped awning, sloping down towards +x
  function awning(x,y,z,depth,width,a,b){const out=[],n=Math.max(2,Math.round(width/1.2));
    for(let i=0;i<n;i++){const o=new THREE.Mesh(new THREE.BoxGeometry(depth,0.12,width/n),i%2?a:b);o.position.set(x+depth/2,y,z-width/2+(i+0.5)*width/n);o.rotation.z=-0.32;out.push(o);}
    return out;}
  const shadows=g=>{g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});return g;};
  // Models are drawn facing +x (east, the sea at the temple). A site with `ang` faces elsewhere: its parts go in a
  // group turned about the site, so the Big Donut faces the boardwalk and Funland's gate faces the town.
  // Static pieces are merged into one mesh per material, so a cliff of a hundred columns is a handful of draw calls.
  // Left alone: anything with children, anything textured (the signs), and anything marked noMerge (what moves).
  function solid(parts){
    const keep=[],buckets=new Map();
    for(const p of parts){if(p.isMesh&&!p.children.length&&!Array.isArray(p.material)&&!p.material.map&&!p.userData.noMerge){
        if(!buckets.has(p.material))buckets.set(p.material,[]);buckets.get(p.material).push(p);}else keep.push(p);}
    for(const [m,list] of buckets){if(list.length<3){keep.push(...list);continue;}keep.push(api.mergeParts(list,m));}
    return keep;
  }
  const build=(L,parts)=>group(L,solid(parts));
  function place(L,parts,D){
    if(!D||!D.ang)return build(L,parts);
    const g=new THREE.Group();g.position.set(D.x,0,D.z);g.rotation.y=D.ang;
    for(const p of parts){p.position.x-=D.x;p.position.z-=D.z;}   // into the turned frame (what moves sets its own place)
    for(const p of solid(parts))g.add(p);
    shadows(g);return group(L,[g]);
  }

  return {
  // ================================================================ the temple
  // The statue in the sea cliff is a fusion of the Gems who live there: she rises out of the sand to the top of
  // the rock, her long hair falling either side of her, a second, mask-like face on her forehead, and eight arms.
  // Four close round the door at her navel, which is where the beach house is built. The other four spread out
  // and down into the sand in front of her; three of them end in broken stumps, and only the top-right one still
  // has its hand, lying palm up on the beach - with a washer and a dryer on it, and a warp pad. She sits in a slot
  // in the cliff, whose face is jointed slabs of pink-brown rock. Cut in big flat facets, as stone is.
  temple(L,x,z){
    const T=S.temple||{x,z,z0:z-150,z1:z+150},fx=T.face||x,cz=T.z,parts=[];
    const y0=gh(fx+30,cz),topAt=zz=>gh(fx-30,zz);
    // ---- the cliff's face across the cove: slabs of rock, jointed, each its own height; a slot where she sits ----
    const hz=v=>{const t=Math.sin(v*12.9898)*43758.5453;return t-Math.floor(t);};
    const cliffM=[mat(0x8e8a8c),mat(0x7a7678),mat(0x9a9496)];   // the same grey rock as the cliff along the park's ocean side
    for(let zz=T.z0+18;zz<T.z1-18;zz+=7.5){
      if(Math.abs(zz-cz)<30)continue;
      const r=hz(zz),h=Math.max(4,topAt(zz)-y0-1-((r*7)%1)*7),d=7+r*5;   // tops at different heights, below the grass
      parts.push(blk(fx-6+d/2-1.5,y0-1,zz,d-3,h+1,7.8,cliffM[Math.floor(r*3)%3]),mesh(new THREE.CylinderGeometry(3.9,4.4,h+1,6,1,false,0,Math.PI).translate(0,(h+1)/2,0),cliffM[(Math.floor(r*5)+1)%3],fx-6+d-1.5,y0-1,zz));   // fluted: a rounded column at the front of each slab
      if(r>0.55)parts.push(blk(fx-6+d+1,y0-1,zz+1.5,2.4,h*(0.25+r*0.3),4.5,cliffM[(Math.floor(r*7))%3]));   // a fallen block, a buttress
    }
    parts.push(blk(fx-10,y0-1,cz,8,topAt(cz)-y0+2,62,mat(0x55525a)));          // the back of the slot, in shadow
    // ---- the figure, drawn for a 46 m cliff and scaled to this one about the foot of the slot ----
    const fig=[],F=(dx,dy,dz)=>[fx+dx,y0+dy,cz+dz];
    const rock=(p,r,m,sx,sy,sz)=>{const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),m||M.rock);o.position.set(...p);o.scale.set(sx||1,sy||1,sz||1);return o;};
    const bar=(a,b,r0,r1,m)=>limb(a,b,r0,r1,m||M.rock,6);
    // ---- the body, rising out of the sand ----
    // turned on a lathe: hips, a waist, the chest and broad shoulders, closing to the neck; flattened front to back,
    // since she is cut out of the cliff and only the front of her stands out of it
    const prof=[[13.5,0],[13.2,5],[11,11],[10.4,15],[11.8,19],[14.2,24],[15.8,27.5],[15,30],[9,32.4],[4.6,33.6],[0.01,34]].map(([r,y])=>new THREE.Vector2(r,y));
    const torso=new THREE.Mesh(new THREE.LatheGeometry(prof,12),M.rock);torso.scale.set(0.55,1,1);torso.position.set(...F(0.5,-2,0));fig.push(torso);
    for(const s of [-1,1])fig.push(rock(F(2,28.5,s*15.5),5.6,M.rock,0.8,0.85,1.05));        // the shoulders
    fig.push(limb(F(1.5,31,0),F(3.5,36.5,0),4.4,3.7,M.rock,8));                              // the neck
    // the hair: a great mass behind the head, a ring of curls round it, and long falls of curls either side of her
    // down to the sand, as the map draws her
    fig.push(rock(F(-2,41,0),15.5,M.hair,0.5,1.12,1.25));
    for(let k=0;k<11;k++){const a=-1.75+k*0.35,r=14.5;fig.push(rock(F(1.5,41+Math.cos(a)*r,Math.sin(a)*r),4.2+((k*7)%3)*0.5,M.hair,0.7,1,1));}
    for(const s of [-1,1])for(let k=0;k<8;k++){const y=31-k*4.6;fig.push(rock(F(1.2+(k%2)*0.8,y,s*(20.5+Math.sin(k*1.3)*1.6)),4.3-k*0.12,M.hair,0.72,1.05,0.95));}
    for(const s of [-1,1])fig.push(rock(F(0.5,1.5,s*21.5),5.4,M.hair,0.8,0.55,1.15));
    // the head, turned to the sea, with a jaw and cheeks
    fig.push(rock(F(4,40.6,0),8.4,M.rock,0.85,1.15,0.86));
    fig.push(rock(F(6.8,35.4,0),4.2,M.rock,0.85,0.7,1.15));
    for(const s of [-1,1])fig.push(rock(F(9.2,38.2,s*3.6),2.4,M.rock,0.6,0.8,0.9));
    // her face: a ridge of a nose, closed eyes as curved lids under brows, and lips
    const nose=new THREE.Mesh(new THREE.ConeGeometry(1.1,4.4,4).rotateY(Math.PI/4),M.rock);nose.scale.set(1.3,1,0.8);nose.position.set(...F(11.1,38.4,0));nose.rotation.z=-0.22;fig.push(nose);
    for(const s of [-1,1]){
      const lid=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.28,5,10,Math.PI).rotateY(Math.PI/2).rotateX(Math.PI),M.rock2);lid.position.set(...F(11.1,40.5,s*3.1));fig.push(lid);
      const brow=limb(F(10.7,42.6,s*1.4),F(10.3,42.2,s*5),0.32,0.26,M.rock2,5);fig.push(brow);}
    fig.push(rock(F(10.7,35.3,0),0.9,M.lips,0.45,0.42,1.9),rock(F(10.5,34.4,0),0.85,M.lips,0.45,0.42,1.6));
    // the mask on her forehead, a smaller face of its own: a plate, its own closed eyes, a nose and a closed mouth
    fig.push(rock(F(9.3,45.6,0),4.4,M.rock,0.32,0.78,1.05));
    for(const s of [-1,1]){const l=new THREE.Mesh(new THREE.TorusGeometry(0.8,0.18,4,8,Math.PI).rotateY(Math.PI/2).rotateX(Math.PI),M.rock2);l.position.set(...F(10.7,46.6,s*1.7));fig.push(l);}
    fig.push(rock(F(10.8,45.4,0),0.55,M.rock,0.8,1.4,0.7),limb(F(10.6,44.1,-1.1),F(10.6,44.1,1.1),0.22,0.22,M.rock2,5));
    // a hand: palm, four jointed fingers curling forward, and a thumb; c the palm's middle, d along the fingers,
    // w across the knuckles, curl how far the fingers bend down
    const V3=(a)=>new THREE.Vector3(...a);
    function hand(c,d,w,s,curl){const C=V3(c),D=V3(d).normalize(),W=V3(w).normalize(),N=new THREE.Vector3().crossVectors(D,W).normalize();
      const P=v=>[v.x,v.y,v.z];
      const palm=rock(c,2.3*s,M.rock,1,1,1);palm.scale.set(1.15,0.6,1.05);palm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),N);fig.push(palm);
      for(let k=0;k<4;k++){const len=[2.2,2.5,2.4,1.9][k]*s,b=C.clone().addScaledVector(D,1.9*s).addScaledVector(W,(k-1.5)*0.95*s);
        const m=b.clone().addScaledVector(D,len*0.55).addScaledVector(N,-len*0.25*curl),t=m.clone().addScaledVector(D,len*0.35*(1-curl*0.4)).addScaledVector(N,-len*0.55*curl);
        fig.push(limb(P(b),P(m),0.42*s,0.38*s,M.rock,6),limb(P(m),P(t),0.38*s,0.32*s,M.rock,6),rock(P(t),0.32*s,M.rock));}
      const tb=C.clone().addScaledVector(W,-2*s).addScaledVector(D,0.4*s),tt=tb.clone().addScaledVector(D,1.6*s).addScaledVector(W,-0.9*s).addScaledVector(N,-0.6*s);
      fig.push(limb(P(tb),P(tt),0.5*s,0.4*s,M.rock,6));}
    // four arms closing round the door at her navel: the house is built in among them, the hands curled towards it
    for(const s of [-1,1]){
      const a=[F(2,26,s*15),F(9,16,s*20),F(15,9,s*11)],b=[F(2,21,s*13),F(9,8,s*17),F(14,3,s*9)];
      fig.push(rock(a[1],3.9),limb(a[0],a[1],4,3.5,M.rock,8),limb(a[1],a[2],3.5,3,M.rock,8));
      hand(a[2],[1.2,-0.4,-s*1],[0,1,0].map((v,i)=>i===2?-s*0.2:v).map((v,i)=>i===0?0.3:v),1.25,0.55);
      fig.push(rock(b[1],3.6),limb(b[0],b[1],3.7,3.2,M.rock,8),limb(b[1],b[2],3.2,2.8,M.rock,8));
      hand(b[2],[1,-0.2,-s*1],[0.2,1,0],1.1,0.6);
    }
    // four arms spread out. The top-right one (on her right, +z, to the south) is whole: it comes out from the rock
    // and holds its hand up at half her height, palm up, with a washer, a dryer and a warp pad on it. The other three
    // end in stumps in the sand.
    for(const s of [-1,1]){
      const lo=[F(1,22,s*17),F(8,13,s*31),F(20,-0.5,s*34)];
      fig.push(rock(lo[1],4),bar(lo[0],lo[1],4,3.6),bar(lo[1],lo[2],3.6,3.2),rock(lo[2],3.8,M.rock2,1.2,0.5,1.2));   // a stump, broken off in the sand
    }
    {const up=[F(1,29,-19),F(4,25,-37),F(16,0.4,-45)];
     fig.push(rock(up[1],4.4),bar(up[0],up[1],4.4,4),bar(up[1],up[2],4,3.5),rock(up[2],4,M.rock2,1.2,0.5,1.2));}
    const sh=F(1,30,19),el=F(5,22,37),wr=F(15,17.5,41);
    fig.push(rock(sh,5),rock(el,4.4),bar(sh,el,4.4,4),bar(el,wr,4,3.4));
    {const hx=fx+19,hz2=cz+42,hy=y0+16.4;
     fig.push(blk(hx,hy,hz2,10,2.4,9,M.rock));
     for(let i=0;i<4;i++)fig.push(blk(hx+8.2,hy+0.6,hz2-3.4+i*2.25,6.8,1.8,1.8,M.rock),rock(F(hx-fx+11.8,hy-y0+2.4,hz2-cz-3.4+i*2.25),1.05,M.rock));   // the fingers, curled up at the ends
     fig.push(blk(hx+2,hy+0.6,hz2+6,5.4,1.8,2,M.rock));                               // the thumb
     fig.push(blk(hx-1.6,hy+2.4,hz2-1.6,1.3,1.4,1.3,M.white),blk(hx-1.6,hy+2.4,hz2-3.1,1.3,1.4,1.3,M.white));   // the washer and the dryer
     fig.push(mesh(new THREE.CylinderGeometry(1.9,2.1,0.35,6).translate(0,0.18,0),M.pad,hx+2,hy+2.4,hz2+0.6));    // the warp pad
     fig.push(limb([hx+10.8,hy+2.6,hz2-3.4],[hx+10.8,hy+4.6,hz2-3.4],0.06,0.06,M.post),limb([hx+10.8,hy+2.6,hz2+3.35],[hx+10.8,hy+4.6,hz2+3.35],0.06,0.06,M.post),
              limb([hx+10.8,hy+4.5,hz2-3.4],[hx+10.8,hy+4.5,hz2+3.35],0.03,0.03,M.white));   // a washing line between the fingers
     for(let i=0;i<3;i++)fig.push(blk(hx+10.8,hy+3.7,hz2-2+i*1.8,0.05,0.8,0.9,[M.red,M.pad,M.icing][i]));}
    // what is left of the other hands: two broken pillars of stone standing in the sand by the house, and a hand
    // sticking up out of the beach further along
    for(const [a,b,h] of [[34,-30,12],[44,-46,8],[30,-58,5]]){fig.push(bar(F(a,-1,b),F(a+0.6,h,b+0.4),3,2.6,M.rock2),rock(F(a+0.6,h,b+0.4),2.8,M.rock2,1,0.6,1));}
    {const hx=fx+62,hz2=cz+70;fig.push(blk(hx,y0-1,hz2,3.4,4,3,M.rock2));
     for(let i=0;i<4;i++)fig.push(bar(F(hx-fx-0.8+i*0.55,3,hz2-cz-1.2+i*0.8),F(hx-fx-1+i*0.6,6.5+(i===1||i===2?1:0),hz2-cz-1.4+i*0.9),0.55,0.45,M.rock2));}
    const sc=Math.max(0.6,Math.min(2.2,(topAt(cz)-y0)/46)),o=new THREE.Vector3(fx,y0,cz);
    for(const p of fig){p.position.sub(o).multiplyScalar(sc).add(o);p.scale.multiplyScalar(sc);parts.push(p);}
    ctx.navel=y0+Math.min(7*sc,9);   // the house's floor: at her navel, but a house on posts, not on stilts
    return build(L,parts);
  },

  // ================================================================ the beach house
  // Built over the temple's door, at the statue's navel, among her closing arms: one big room under a pitched
  // roof with a loft over the back of it, a deck across the front with a table and an umbrella, all on tall posts,
  // and a long stair down the side to the sand. The door inside the back wall opens into the temple.
  beachhouse(L,x,z){
    const H=S.house||{x,z},hx=H.x,hz=H.z,parts=[];
    const y0=gh(hx+14,hz),fl=ctx.navel||y0+6.5;
    const bx=hx-1;   // the middle of the house; its back is against her, its front faces the sea
    // the posts and the floor
    for(let i=-1;i<=2;i++)for(let j=-2;j<=2;j++)parts.push(blk(bx+i*4.4,y0-1,hz+j*3.2,0.45,fl-y0+1,0.45,M.post));
    parts.push(blk(bx+3,fl-0.35,hz,17,0.35,14,M.deck));
    // the house: one room, the door, windows, the roof; the loft over the back, with its own little roof
    parts.push(blk(bx-1.5,fl,hz,9,4.8,12,M.board));
    parts.push(blk(bx+3.05,fl,hz+2.6,0.12,2.6,1.4,M.red));                        // the front door
    for(const w of [-3.6,-1.2])parts.push(blk(bx+3.05,fl+1,hz+w,0.1,1.5,1.8,M.glass));
    for(const s of [-1,1])parts.push(blk(bx-1.5,fl+1.2,hz+s*6.05,2,1.4,0.1,M.glass));
    parts.push(gable(bx-1.5,fl+4.8,hz,10.2,13.2,3.4,M.roof,true));
    parts.push(blk(bx-4.6,fl+4.8,hz-2.5,3.2,3.4,6.2,M.board),gable(bx-4.6,fl+8.2,hz-2.5,3.8,6.8,1.6,M.roof));
    parts.push(blk(bx-3.05,fl+5.8,hz-2.5,0.1,1.2,2.2,M.glass));
    // the deck: a rail round it, a table under a striped umbrella
    for(const [ax,az,bx2,bz] of [[11.4,-6.9,11.4,6.9],[3,-6.9,11.4,-6.9],[3,6.9,8.6,6.9]]){
      const cx=(ax+bx2)/2,cz2=(az+bz)/2,lx=Math.max(0.12,Math.abs(bx2-ax)),lz=Math.max(0.12,Math.abs(bz-az));
      parts.push(blk(bx+cx,fl+0.95,hz+cz2,lx,0.12,lz,M.trim));}
    for(const [a,b] of [[11.4,-6.9],[11.4,0],[11.4,6.9],[3,-6.9],[7,-6.9]])parts.push(blk(bx+a,fl,hz+b,0.16,1,0.16,M.trim));
    parts.push(blk(bx+7,fl,hz-3,1.4,0.8,1.4,M.white),limb([bx+7,fl,hz-3],[bx+7,fl+2.6,hz-3],0.05,0.05,M.post));
    parts.push(mesh(new THREE.ConeGeometry(1.8,0.7,8).translate(0,0.35,0),M.icing,bx+7,fl+2.3,hz-3));
    // the stair: down the south side of the deck to the sand, a long flight
    const n=Math.max(6,Math.round((fl-y0)/0.22));
    for(let k=0;k<n;k++)parts.push(blk(bx+9.6+k*0.3,fl-(fl-y0)*(k+1)/n,hz+8.2,0.34,0.16,2,M.deck));
    parts.push(limb([bx+9.6,fl+0.9,hz+9.2],[bx+9.6+n*0.3,y0+0.9,hz+9.2],0.05,0.05,M.trim));
    return build(L,parts);
  },

  // ================================================================ the lighthouse
  // On the hill above the statue's head, with a fence along the top of the cliff (put up after someone fell off
  // it), and a round window over the door with a star in it.
  lighthouse(L,x,z){
    const T=S.lighthouse||{x,z},lx=T.x,lz=T.z,y0=gh(lx,lz),parts=[];
    parts.push(blk(lx,y0-0.5,lz,8,1.2,8,M.rock2));
    const tw=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3.4,22,16).translate(0,11,0),M.white);tw.position.set(lx,y0+0.6,lz);parts.push(tw);
    for(const [a,b] of [[7,8.6],[15,16.6]]){const r=new THREE.Mesh(new THREE.CylinderGeometry(3.4-0.9*b/22+0.05,3.4-0.9*a/22+0.05,b-a,16).translate(0,(a+b)/2,0),M.red);r.position.set(lx,y0+0.6,lz);parts.push(r);}
    // the door, facing the sea, and the star window over it
    parts.push(blk(lx+3.25,y0+0.6,lz,0.3,2.4,1.3,M.post));
    parts.push(mesh(new THREE.CylinderGeometry(0.9,0.9,0.2,16).rotateZ(Math.PI/2),M.white,lx+3.2,y0+4.4,lz),mesh(starGeo(0.65,0.12),M.star,lx+3.28,y0+4.4,lz));
    glow.push([M.star,0.9]);
    const yt=y0+22.6;
    parts.push(mesh(new THREE.CylinderGeometry(3.6,3.6,0.4,16),M.post,lx,yt+0.2,lz));                 // the gallery
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;parts.push(blk(lx+Math.cos(a)*3.5,yt+0.4,lz+Math.sin(a)*3.5,0.1,1,0.1,M.post));}
    const lampM=new THREE.MeshLambertMaterial({color:0xfff2c0,emissive:0xffe08a,emissiveIntensity:0.2,transparent:true,opacity:0.85});glow.push([lampM,1.4]);
    parts.push(mesh(new THREE.CylinderGeometry(1.8,1.8,3,12).translate(0,1.5,0),lampM,lx,yt+0.4,lz));
    parts.push(mesh(new THREE.ConeGeometry(2.3,2.4,12).translate(0,1.2,0),M.red,lx,yt+3.4,lz));
    parts.push(mesh(new THREE.SphereGeometry(0.4,8,6),M.post,lx,yt+6,lz));
    // the fence along the top of the cliff, from one end of the cove to the other
    const Tm=S.temple;if(Tm){const fxx=(Tm.face||18)-7;let prev=null;
      for(let zz=Tm.z0+30;zz<=Tm.z1-30;zz+=4){const y=gh(fxx,zz);parts.push(blk(fxx,y,zz,0.14,1.2,0.14,M.post));
        if(prev)parts.push(limb([fxx,prev+1.05,zz-4],[fxx,y+1.05,zz],0.04,0.04,M.post));prev=y;}}
    glow.push([M.pad,0.8]);   // the warp pad on the hand below glows a little at night too
    const g=build(L,parts);
    // the beam: two long faint cones, turning, after dark
    const bm=new THREE.MeshBasicMaterial({color:0xfff4c8,transparent:true,opacity:0.08,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const beam=new THREE.Group();beam.position.set(lx,yt+1.9,lz);beam.userData.noWire=true;beam.userData.noFingerprint=true;
    for(const s of [1,-1]){const c=new THREE.Mesh(new THREE.ConeGeometry(5,260,16,1,true).translate(0,-130,0).rotateZ(s*Math.PI/2),bm);c.userData.noFingerprint=true;beam.add(c);}
    api.scene.add(beam);
    animHooks.push(now=>{const n=nightF();beam.visible=n>0.3;if(beam.visible){beam.rotation.y=now/1000*0.7;bm.opacity=0.08*n;}});
    return g;
  },

  // ================================================================ the water tower, up on the hill
  watertower(L,x,z){
    const D=S.watertower||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[],leg=mat(0x9aa4ac);
    for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;parts.push(limb([px+Math.cos(a)*6,y0,pz+Math.sin(a)*6],[px+Math.cos(a)*4,y0+18,pz+Math.sin(a)*4],0.35,0.3,leg));}
    for(const h of [6,12])for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,b=a+Math.PI/2,r=6-2*h/18;
      parts.push(limb([px+Math.cos(a)*r,y0+h,pz+Math.sin(a)*r],[px+Math.cos(b)*r,y0+h,pz+Math.sin(b)*r],0.12,0.12,leg));}
    parts.push(mesh(new THREE.CylinderGeometry(6,6,7,20).translate(0,3.5,0),mat(0xdfe8ee),px,y0+18,pz));
    parts.push(mesh(new THREE.ConeGeometry(6.4,3,20).translate(0,1.5,0),mat(0xc8d4dc),px,y0+25,pz));
    parts.push(sign('BEACH CITY',9,2,'#dfe8ee','#3a78b0',px+6.05,y0+21.5,pz,0,false));
    return build(L,parts);
  },

  // ================================================================ Brooding Hill
  // The other cliff, at the far end of town from the temple: nothing on it but grass, a bench and the view.
  brooding(L,x,z){
    const D=S.brooding||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0+0.45,pz,0.6,0.12,2.6,M.deck),blk(px-0.3,y0+0.45,pz,0.12,0.7,2.6,M.deck));
    for(const s of [-1,1])parts.push(blk(px,y0,pz+s*1.1,0.5,0.45,0.12,M.post));
    return build(L,parts);
  },

  // ================================================================ the Big Donut
  // A donut shop on the boardwalk: muted violet-brown walls, a roof in blue and pink, deep pink and brown striped
  // awnings with the name on them, a table under a pink umbrella by the door, the parking lot behind - and on the
  // roof the donut, with chocolate icing and pink, green and blue sprinkles.
  donut(L,x,z){
    const D=S.donut||{x,z},dx=D.x,dz=D.z,y0=gh(dx,dz),parts=[];
    const wall=mat(0x8c6c76),pink=mat(0xe0508a),blue=mat(0x5a9ad0),brown=mat(0x6a4a3a);
    parts.push(blk(dx,y0,dz,11,4.6,15,wall));
    parts.push(blk(dx+5.55,y0+0.5,dz,0.1,2.6,10,M.glass));
    for(let i=0;i<8;i++)parts.push(blk(dx-5.5+i*11/8+11/16,y0+4.6,dz,11/8,0.6,15.4,i%2?pink:blue));   // the roof, in bands
    parts.push(...awning(dx+5.5,y0+3.3,dz,1.7,13,pink,brown));
    parts.push(sign('BIG DONUT',8,1.1,'#e0508a','#fff2f6',dx+5.75,y0+4.1,dz));
    // the table and the umbrella by the door
    parts.push(blk(dx+9,y0,dz-4.5,1.1,0.75,1.1,M.white),limb([dx+9,y0,dz-4.5],[dx+9,y0+2.4,dz-4.5],0.05,0.05,M.white));
    parts.push(mesh(new THREE.ConeGeometry(1.6,0.6,8).translate(0,0.3,0),pink,dx+9,y0+2.1,dz-4.5));
    for(const s of [-1,1])parts.push(blk(dx+9,y0,dz-4.5+s*1.1,0.5,0.45,0.5,M.white));
    // the donut on the roof: standing on edge, facing the sea
    const R=4.4,r=2,cy=y0+5.2+R+r+0.4;
    parts.push(blk(dx-0.5,y0+5.2,dz-2.5,0.4,cy-y0-5.2-R+0.4,0.4,M.steel),blk(dx-0.5,y0+5.2,dz+2.5,0.4,cy-y0-5.2-R+0.4,0.4,M.steel));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(R,r,12,32).rotateY(Math.PI/2),M.dough);ring.position.set(dx,cy,dz);parts.push(ring);
    const ice=new THREE.Mesh(new THREE.TorusGeometry(R,r*1.04,12,32).rotateY(Math.PI/2),mat(0x5a3422));ice.scale.set(0.62,1,1);ice.position.set(dx+0.8,cy,dz);parts.push(ice);
    const sm=[0xf06aa0,0x6ad070,0x5aa8f0].map(c=>mat(c));
    for(let i=0;i<46;i++){const a=i*2.399,rr=R+(((i*37)%10)/10-0.5)*r*1.4,py=cy+Math.sin(a)*rr,pz=dz+Math.cos(a)*rr;
      const s=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.75,0.2),sm[i%3]);s.position.set(dx+0.8+r*0.62,py,pz);s.rotation.x=a*1.7;parts.push(s);}
    return place(L,parts,D);
  },

  // ================================================================ the shops on the boardwalk
  tshirts(L,x,z){
    const D=S.tshirts||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,9,4,9,mat(0x9ad0d8)),blk(px,y0+4,pz,9.4,0.4,9.4,M.white));
    parts.push(blk(px+4.55,y0+0.4,pz,0.1,2.4,6,M.glass),sign('T-SHIRTS',7,1,'#ffffff','#e04a6a',px+4.65,y0+3.3,pz));
    const cols=[0xe8504a,0xf6c84a,0x48a8e0,0x7ac860,0xc070e0];
    for(let i=0;i<5;i++)parts.push(blk(px+5.6,y0+1,pz-3+i*1.5,0.12,1,1,mat(cols[i])));
    parts.push(blk(px+5.6,y0+2,pz,0.08,0.08,7.6,M.steel));
    return place(L,parts,D);
  },
  // Fish Stew Pizza: a white building under a slanted roof striped brick red and light green, with large windows,
  // a pizza on its sign with the name, and a sign that just says PIZZA.
  pizza(L,x,z){
    const D=S.pizza||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,13,5.4,13,M.white));
    for(const w of [-4,0,4])parts.push(blk(px+6.55,y0+0.8,pz+w,0.1,2.6,2.8,M.glass));
    const red=mat(0xa8423a),green=mat(0x9ad08a),n=8;
    for(let i=0;i<n;i++){const g=gable(px,y0+5.4,pz-6.9+(i+0.5)*13.8/n,14,13.8/n,3.6,i%2?green:red);parts.push(g);}
    // the sign: a pizza and the name, over the door; and PIZZA on a board on the roof
    parts.push(mesh(new THREE.CylinderGeometry(1.5,1.5,0.2,16).rotateZ(Math.PI/2),mat(0xf2c64a),px+6.7,y0+4.1,pz-4.2));
    for(const [a,b] of [[0.5,0.3],[-0.5,-0.4],[0.1,0.7]])parts.push(mesh(new THREE.CylinderGeometry(0.28,0.28,0.1,8).rotateZ(Math.PI/2),M.red,px+6.82,y0+4.1+b,pz-4.2+a));
    parts.push(sign('FISH STEW PIZZA',8,1.2,'#ffffff','#a8423a',px+6.7,y0+4.1,pz+1.4));
    parts.push(blk(px+2,y0+7,pz,0.3,2.6,0.3,M.steel),sign('PIZZA',5,1.6,'#a8423a','#ffffff',px+2.2,y0+9.4,pz,0,true));
    return place(L,parts,D);
  },
  // Beach Citywalk Fries: a rectangular white building with many windows, and a big wooden sign shaped like a
  // white box of fries.
  fries(L,x,z){
    const D=S.fries||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,11,4.4,12,M.white),blk(px,y0+4.4,pz,11.4,0.4,12.4,M.trim));
    for(let i=0;i<5;i++)parts.push(blk(px+5.55,y0+1.2,pz-4.8+i*2.4,0.1,1.8,1.8,M.glass));
    for(const s of [-1,1])for(let i=0;i<3;i++)parts.push(blk(px-3+i*3,y0+1.2,pz+s*6.05,1.8,1.8,0.1,M.glass));
    // the sign: a wooden frame on two posts, the fry box white with a red band, fries standing out of it
    const wood=mat(0x9a6a40);parts.push(blk(px+3,y0+4.8,pz-2.6,0.4,3,0.4,wood),blk(px+3,y0+4.8,pz+2.6,0.4,3,0.4,wood));
    const bx=new THREE.Mesh(new THREE.CylinderGeometry(2.6,1.8,4,4,1).rotateY(Math.PI/4),M.white);bx.scale.set(0.5,1,1.4);bx.position.set(px+3.2,y0+9.6,pz);parts.push(bx);
    parts.push(blk(px+3.9,y0+8.6,pz,0.2,0.9,4.4,M.red));
    parts.push(sign('BEACH CITYWALK FRIES',9,1.1,'#9a6a40','#fff4dc',px+5.75,y0+3.6,pz));
    const fy=mat(0xf6d24a);for(let i=0;i<14;i++){const a=(i*0.8)%2.2-1.1,b=((i*1.3)%2.6)-1.3,h=2.2+((i*7)%5)*0.3;
      const f=new THREE.Mesh(new THREE.BoxGeometry(0.4,h,0.4),fy);f.position.set(px+3.2+a*0.45,y0+11.4+h/2,pz+b*1.3);f.rotation.z=a*0.12;f.rotation.x=b*0.1;parts.push(f);}
    return place(L,parts,D);
  },
  arcade(L,x,z){
    const D=S.arcade||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,16,7.4,20,mat(0x6a5aa8)),blk(px,y0+7.4,pz,16.4,0.6,20.4,mat(0xf0d860)));
    parts.push(blk(px+8.05,y0,pz,0.1,3.4,8,M.glass));
    parts.push(sign('FUNLAND ARCADE',15,2.2,'#20184a','#ff7ad0',px+8.25,y0+5.2,pz));
    const neon=new THREE.MeshLambertMaterial({color:0x6ae0ff,emissive:0x40c8ff,emissiveIntensity:0.2});glow.push([neon,1.5]);
    for(const s of [-1,1])parts.push(blk(px+8.2,y0+0.2,pz+s*10.1,0.2,7.4,0.3,neon));
    return place(L,parts,D);
  },

  // ================================================================ Funland
  // A park the size of a city block: the wheel you can see from everywhere in town, a carousel, a drop tower,
  // a ring of stalls under striped awnings, and the gate onto the boardwalk.
  funland(L,x,z){
    const F=S.funland||{x,z},fx=F.x,fz=F.z,y0=F.deck||gh(fx,fz),parts=[];
    // the pier it stands on, out over the bay: a deck on piles, and the walk to the shore from the gate
    if(F.deck){const wood=mat(0x9a7452),pile=mat(0x6e5440);
      parts.push(blk(fx-3,y0-0.5,fz,108,0.5,148,wood),blk(fx+76,y0-0.5,fz,52,0.5,9,wood));
      for(let a=-54;a<=50;a+=10)for(let b=-72;b<=72;b+=12)parts.push(blk(fx+a,-5,fz+b,0.5,y0-0.5+5,0.5,pile));
      for(let a=56;a<=100;a+=8)for(const b of [-4,4])parts.push(blk(fx+a,-5,fz+b,0.45,y0-0.5+5,0.45,pile));
      for(const b of [-74,74])parts.push(blk(fx-3,y0,fz+b,108,1,0.15,M.trim));}
    const cols=[0xe8504a,0x48a8e0,0xf6c84a,0x7ac860,0xc070e0,0xf08cb4].map(c=>mat(c));
    // the wheel: turning on an axle that points out to sea, so the town sees it face on
    const wx=fx+18,wz=fz-14,R=17,hub=y0+R+4;
    for(const s of [-1,1])for(const t of [-1,1])parts.push(limb([wx+s*5,y0,wz+t*9],[wx+s*1.2,hub,wz],0.45,0.35,M.steel));
    parts.push(limb([wx-1.6,hub,wz],[wx+1.6,hub,wz],0.6,0.6,M.steel));
    const wheel=new THREE.Group();wheel.position.set(wx,hub,wz);
    for(const s of [-0.9,0.9]){const rim=new THREE.Mesh(new THREE.TorusGeometry(R,0.28,6,48).rotateY(Math.PI/2),M.white);rim.position.x=s;wheel.add(rim);}
    const N=16,cars=[];
    for(let i=0;i<N;i++){const a=i/N*Math.PI*2;
      for(const s of [-0.9,0.9])wheel.add(limb([s,0,0],[s,Math.sin(a)*R,Math.cos(a)*R],0.12,0.12,M.white));
      const car=new THREE.Group();car.position.set(0,Math.sin(a)*R,Math.cos(a)*R);
      car.add(blk(0,-2.6,0,1.9,1.6,1.9,cols[i%cols.length]),blk(0,-1.0,0,2.1,0.2,2.1,M.white),limb([0,-1,0],[0,0,0],0.06,0.06,M.steel));
      wheel.add(car);cars.push(car);}
    const lights=new THREE.MeshLambertMaterial({color:0xfff0c0,emissive:0xffd070,emissiveIntensity:0.2});glow.push([lights,1.6]);
    for(let i=0;i<N*2;i++){const a=i/(N*2)*Math.PI*2;wheel.add(mesh(new THREE.SphereGeometry(0.32,6,4),lights,1.1,Math.sin(a)*(R+0.2),Math.cos(a)*(R+0.2)));}
    shadows(wheel);parts.push(wheel);
    animHooks.push(now=>{const a=now/1000*0.09;wheel.rotation.x=a;for(const c of cars)c.rotation.x=-a;});
    // the carousel: a striped canopy over a turning platform
    const cx=fx-18,cz=fz-34,car=new THREE.Group();car.position.set(cx,y0,cz);
    car.add(mesh(new THREE.CylinderGeometry(8,8,0.8,24).translate(0,0.4,0),M.white,0,0,0));
    car.add(mesh(new THREE.CylinderGeometry(0.5,0.5,6,8).translate(0,3,0),mat(0xf6c84a),0,0,0));
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,c=new THREE.Mesh(new THREE.ConeGeometry(8.6,3.2,2,1,false,a,Math.PI/6).translate(0,7.4,0),i%2?M.red:M.white);car.add(c);
      const hx=Math.cos(a+0.26)*5.6,hz=Math.sin(a+0.26)*5.6;car.add(limb([hx,0.8,hz],[hx,5.8,hz],0.06,0.06,M.steel),blk(hx,2+(i%3)*0.5,hz,0.6,1,1.6,cols[i%cols.length]));}
    shadows(car);parts.push(car);
    animHooks.push(now=>{car.rotation.y=-now/1000*0.35;});
    // the drop tower, its car going up slowly and coming down fast
    const tx=fx-26,tz=fz+36;
    parts.push(blk(tx,y0,tz,2.4,44,2.4,M.steel),mesh(new THREE.ConeGeometry(2.2,3,4).translate(0,1.5,0).rotateY(Math.PI/4),M.red,tx,y0+44,tz));
    const ringM=cols[1],ring=mesh(new THREE.CylinderGeometry(3.6,3.6,1.6,12,1,true),ringM,tx,y0+4,tz);ring.userData.noMerge=true;ring.material=ringM.clone();ring.material.side=THREE.DoubleSide;parts.push(ring);
    animHooks.push(now=>{const t=(now/1000/14)%1,h=t<0.75?t/0.75:1-((t-0.75)/0.25)**2;ring.position.y=y0+3+h*36;});
    // the roller coaster: a closed circuit on trestles in the south-east corner, a train going round it
    {const ox=fx+20,oz=fz+34,pts=[];
     for(let i=0;i<48;i++){const t=i/48*Math.PI*2;pts.push(new THREE.Vector3(ox+Math.cos(t)*20+Math.cos(3*t)*3,y0+3+7.5*(1+Math.sin(t*2+0.6))+(i<6?4:0),oz+Math.sin(t)*14));}
     const curve=new THREE.CatmullRomCurve3(pts,true),track=mat(0xe8504a);
     parts.push(new THREE.Mesh(new THREE.TubeGeometry(curve,160,0.35,5,true),track));
     for(let i=0;i<48;i+=2){const p=pts[i];parts.push(blk(p.x,y0,p.z,0.3,p.y-y0,0.3,M.white));}
     // the train is in the park's own frame (place() turns the park to face the town), so it is placed relative to it
     const cars=[];for(let k=0;k<4;k++){const c=blk(0,0,0,1.6,1.1,2.6,cols[k%cols.length]);c.userData.noFingerprint=true;c.userData.noMerge=true;parts.push(c);cars.push(c);}
     const tmp=new THREE.Vector3(),ox0=F.ang?fx:0,oz0=F.ang?fz:0;
     animHooks.push(now=>{const u0=(now/1000/22)%1;cars.forEach((c,k)=>{const u=(u0+1-k*0.012)%1;curve.getPointAt(u,c.position);c.position.x-=ox0;c.position.z-=oz0;c.position.y+=0.3;
       curve.getTangentAt(u,tmp);c.rotation.set(0,Math.atan2(tmp.x,tmp.z),0);});});}
    // the teacups: five cups on a turning platform, each turning on its own
    {const tx2=fx-20,tz2=fz+2,plat=new THREE.Group();plat.position.set(tx2,y0,tz2);
     plat.add(mesh(new THREE.CylinderGeometry(7.5,7.5,0.6,24).translate(0,0.3,0),M.white,0,0,0));
     const cups=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2,cup=new THREE.Group();cup.position.set(Math.cos(a)*4.6,0.6,Math.sin(a)*4.6);
       cup.add(mesh(new THREE.CylinderGeometry(1.4,1.0,1.3,12,1,true).translate(0,0.65,0),cols[i],0,0,0),mesh(new THREE.CylinderGeometry(1.0,1.0,0.1,12),cols[i],0,0.05,0));
       cup.children[0].material=cols[i].clone();cup.children[0].material.side=THREE.DoubleSide;plat.add(cup);cups.push(cup);}
     shadows(plat);parts.push(plat);
     animHooks.push(now=>{const t=now/1000;plat.rotation.y=t*0.4;cups.forEach((c,i)=>c.rotation.y=-t*(1.2+i*0.2));});}
    // the bumper cars: a floor under a roof on posts, and the cars
    {const bx2=fx-6,bz2=fz-58;parts.push(blk(bx2,y0,bz2,18,0.3,11,mat(0x5a6068)),blk(bx2,y0+4,bz2,19,0.4,12,cols[4]));
     for(const [a,b] of [[-9,-5.5],[9,-5.5],[-9,5.5],[9,5.5]])parts.push(blk(bx2+a,y0,bz2+b,0.3,4,0.3,M.steel));
     const bumpers=[],ox1=F.ang?fx:0,oz1=F.ang?fz:0;for(let i=0;i<6;i++){const c=blk(0,y0+0.3,0,1.8,0.7,1.2,cols[i%cols.length]);c.userData.noFingerprint=true;c.userData.noMerge=true;parts.push(c);bumpers.push({c,ph:i*1.7});}
     animHooks.push(now=>{const t=now/1000;for(const b of bumpers){b.c.position.x=bx2-ox1+Math.sin(t*0.5+b.ph)*6.5;b.c.position.z=bz2-oz1+Math.sin(t*0.37+b.ph*1.3)*3.6;b.c.rotation.y=t*0.6+b.ph;}});}
    // the stalls round the edge
    for(let i=0;i<7;i++){const sx=fx-38+i*11,sz=fz+60;parts.push(blk(sx,y0,sz,6,2.6,4,M.cream),...awning(sx-3,y0+2.8,sz,0.01,6,cols[i%cols.length],M.white));}
    for(let i=0;i<4;i++){const sz=fz-50+i*12;parts.push(blk(fx-44,y0,sz,4,2.6,6,M.cream));}
    // the gate onto the boardwalk side
    const gx=fx+46;
    for(const s of [-1,1])parts.push(blk(gx,y0,fz+s*7,1.2,7.4,1.2,cols[0]));
    parts.push(blk(gx,y0+7.4,fz,1.4,2.2,15.4,cols[2]),sign('FUNLAND',13,1.8,'#e8504a','#fff8e0',gx+0.75,y0+8.5,fz));
    return place(L,parts,F);
  },

  // ================================================================ It's a Wash
  // It's a Wash: an L of a building - the wash bay, and the office joined to it - and a sign with an elephant on
  // it, giving itself a shower.
  carwash(L,x,z){
    const D=S.carwash||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    const wall=mat(0x7ab8c8);
    // the bay, open at both ends, and the office wing turned at right angles to it
    parts.push(blk(px,y0,pz-5.2,15,4.6,0.5,wall),blk(px,y0,pz+1.2,15,4.6,0.5,wall),blk(px,y0+4.6,pz-2,15.6,0.5,7.4,M.white));
    parts.push(blk(px-4.5,y0,pz+7,6,3.8,11,M.cream),blk(px-4.5,y0+3.8,pz+7,6.4,0.4,11.4,wall));
    parts.push(blk(px-1.45,y0+0.6,pz+8,0.1,2.2,4,M.glass),blk(px-1.45,y0,pz+11,0.1,2.4,1.2,M.red));
    for(let i=0;i<3;i++){const b=mesh(new THREE.CylinderGeometry(0.9,0.9,3.2,10),mat(i%2?0x4a8ae0:0xf06aa0),px-4+i*4,y0+2.1,pz-2);parts.push(b);}
    // the sign on its pole: the elephant and the name
    const elephant=(g,w,h)=>{g.fillStyle='#8a96a6';g.beginPath();g.ellipse(w*0.47,h*0.4,w*0.17,h*0.2,0,0,6.3);g.fill();
      g.beginPath();g.ellipse(w*0.66,h*0.3,w*0.09,h*0.13,0,0,6.3);g.fill();g.beginPath();g.ellipse(w*0.6,h*0.32,w*0.06,h*0.12,0,0,6.3);g.fillStyle='#a8b2c0';g.fill();
      g.fillStyle='#8a96a6';for(const fx2 of [0.36,0.44,0.52,0.58])g.fillRect(w*fx2,h*0.5,w*0.05,h*0.14);
      g.strokeStyle='#8a96a6';g.lineWidth=h*0.05;g.lineCap='round';g.beginPath();g.moveTo(w*0.72,h*0.36);g.quadraticCurveTo(w*0.8,h*0.2,w*0.74,h*0.06);g.stroke();
      g.fillStyle='#5ab4f0';for(let i=0;i<9;i++){g.beginPath();g.arc(w*(0.66-i*0.03),h*(0.06+0.02*i*i/3),h*0.022,0,6.3);g.fill();}
      g.fillStyle='#ffffff';g.beginPath();g.arc(w*0.68,h*0.27,h*0.022,0,6.3);g.fill();};
    parts.push(blk(px+11,y0,pz+6,0.5,8.6,0.5,M.steel),sign("IT'S A WASH",6,4.2,'#ffffff','#2a7ab8',px+11.3,y0+10.6,pz+6,0,true,elephant));
    parts.push(blk(px+11,y0+8.4,pz+6,0.4,4.6,6.4,M.white));
    // the van out the back
    parts.push(blk(px-14,y0+0.4,pz-2,5.2,2.2,2.2,mat(0xe8e2d4)),blk(px-11.8,y0+0.4,pz-2,1,1.4,2.2,mat(0xe8e2d4)));
    for(const [a,b] of [[-15.6,1.05],[-15.6,-1.05],[-12.4,1.05],[-12.4,-1.05]])parts.push(mesh(new THREE.CylinderGeometry(0.45,0.45,0.3,10).rotateX(Math.PI/2),M.post,px+a,y0+0.45,pz-2+b));
    return place(L,parts,D);
  },


  // ================================================================ the cliff along the park's ocean side
  // Grey rock, in slabs, from the foot of the hill above the town round to the temple's cliff: the beach runs
  // along under it.
  southcliff(L,x,z){
    // Tall and fluted, as on the map: rounded lobes of grey rock side by side, like drapery, each its own height
    // and depth, a lip of grass hanging over the top of each and the odd fallen block at the foot. Low at the town
    // end and taller towards the temple on the ocean side; a lower run of the same on the bay side.
    const D=S.southcliff,parts=[];if(!D||!D.line)return build(L,parts);
    const rm=[mat(0x8e8a8c),mat(0x7a7678),mat(0x9a9496),mat(0x86828a)],lip=mat(0x7fa05a),hz=v=>{const t=Math.sin(v*78.233)*43758.5453;return t-Math.floor(t);};
    const face=(line,dir)=>{for(const [cx,cz] of line){const top=gh(cx,cz-dir*16),bot=gh(cx,cz+dir*10);if(top-bot<3)continue;
      const r=hz(cx*1.3+dir),h=top-bot+0.4+r*1.8,rad=4.2+r*2.4,hl=h+1-r*4;
      parts.push(blk(cx,bot-1,cz-dir*5,7.4,h+1,9,rm[Math.floor(r*4)%4]));
      // the lobe: half a column bulging out of the face, with a lower, fatter one at its foot
      parts.push(mesh(new THREE.CylinderGeometry(rad*0.85,rad,hl,7,1,false,dir>0?-Math.PI/2:Math.PI/2,Math.PI).translate(0,hl/2,0),rm[(Math.floor(r*9)+1)%4],cx,bot-1,cz+dir*(-0.6+r*2)));
      if(r>0.35)parts.push(mesh(new THREE.CylinderGeometry(rad*1.1,rad*1.25,hl*0.35,7,1,false,dir>0?-Math.PI/2:Math.PI/2,Math.PI).translate(0,hl*0.175,0),rm[Math.floor(r*5)%4],cx+2,bot-1,cz+dir*(1+r*2)));
      // the grass over the edge
      parts.push(blk(cx,top-0.2,cz+dir*(r*1.5-1.5),7.8,0.7,6+r*3,lip));
      if(r>0.72)parts.push(blk(cx+1,bot-1,cz+dir*(5+r*3),3.4,1.5+r*2.5,3,rm[Math.floor(r*7)%4]));}};
    face(D.line,1);if(D.north)face(D.north,-1);
    return build(L,parts);
  },

  // ================================================================ the old docks, wrecked, in the bay
  olddocks(L,x,z){
    const D=S.olddocks||{x,z},px=D.x,pz=D.z,parts=[],pile=mat(0x5e4a3a),wood=mat(0x8a6a4c);
    const hz=v=>{const t=Math.sin(v*12.9898)*43758.5453;return t-Math.floor(t);};
    for(let i=0;i<14;i++)for(const s of [-1,1]){const r=hz(i*3.1+s),h=1+r*3;if(r<0.25)continue;
      const p=blk(px-40+i*7,-3,pz+s*3,0.5,h+3,0.5,pile);p.rotation.z=(r-0.5)*0.4;parts.push(p);}
    for(let i=0;i<4;i++){const b=blk(px-36+i*16,1.6,pz,7,0.25,7,wood);b.rotation.x=(hz(i)-0.5)*0.5;b.rotation.z=(hz(i+9)-0.5)*0.3;parts.push(b);}
    return build(L,parts);
  },

  // ================================================================ the visitor center and Cone 'N' Son
  visitor(L,x,z){
    const D=S.visitor||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,10,4.2,12,mat(0xe8dcc0)),gable(px,y0+4.2,pz,11,13,2.6,mat(0x5a7a9a)));
    parts.push(blk(px+5.05,y0,pz+3,0.1,2.4,1.4,M.glass),blk(px+5.05,y0+1,pz-2,0.1,1.6,3.4,M.glass));
    parts.push(sign('?',1.6,1.6,'#f6c84a','#3a3a3a',px+5.2,y0+5.2,pz-2),sign('VISITOR CENTER',6,0.9,'#ffffff','#3a5a7a',px+5.15,y0+3.4,pz+0.5));
    return place(L,parts,D);
  },
  cone(L,x,z){
    const D=S.cone||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,8,3.6,8,mat(0xf6e8f0)),blk(px,y0+3.6,pz,8.4,0.4,8.4,mat(0xf08cb4)));
    parts.push(blk(px+4.05,y0+1,pz,0.1,1.6,4,M.glass),...awning(px+4,y0+2.9,pz,1.2,7,mat(0xf08cb4),M.white));
    parts.push(mesh(new THREE.ConeGeometry(1.3,4,10).rotateX(Math.PI),mat(0xd8a868),px,y0+6.2,pz));
    parts.push(mesh(new THREE.SphereGeometry(1.5,12,9),mat(0xf6d0e0),px,y0+8.5,pz),mesh(new THREE.SphereGeometry(1.2,12,9),mat(0x8a5a3a),px,y0+10.3,pz));
    parts.push(sign("CONE 'N' SON",6,0.8,'#ffffff','#d8457a',px+4.25,y0+3.2,pz));
    return place(L,parts,D);
  },
  // ================================================================ U-Stor, the Mayor's house, Dewey Park
  ustor(L,x,z){
    const D=S.ustor||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[],wall=mat(0xe2d6b8),door=mat(0xd8783a);
    parts.push(blk(px,y0,pz,22,4.6,40,wall),blk(px,y0+4.6,pz,22.6,0.4,40.6,mat(0xb8ae98)));
    for(let i=0;i<8;i++)parts.push(blk(px+11.05,y0,pz-16.5+i*4.7,0.12,3,3.4,door));
    parts.push(blk(px+16,y0,pz-14,0.4,7,0.4,M.steel),sign('U-STOR',6,1.6,'#2a5a8a','#ffffff',px+16.25,y0+7.4,pz-14,0,true),
               sign('SELF STORAGE',6,0.7,'#ffffff','#2a5a8a',px+16.25,y0+6.1,pz-14,0,false));
    return place(L,parts,D);
  },
  mayor(L,x,z){
    const D=S.mayor||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[];
    parts.push(blk(px,y0,pz,12,6.4,16,mat(0xf2ece0)),gable(px,y0+6.4,pz,13.2,17.2,4.4,mat(0x3e4a5a)));
    parts.push(blk(px+6.6,y0,pz,2.6,3.2,8,M.white),blk(px+6.6,y0+3.2,pz,3,0.3,8.6,mat(0x3e4a5a)));   // the porch
    for(const w of [-5,-2,2,5])parts.push(blk(px+6.05,y0+3.8,pz+w,0.1,1.6,1.4,M.glass));
    parts.push(blk(px+6.05,y0,pz+0.5,0.12,2.6,1.4,M.red));
    // the flag
    const fx=px+11,fz=pz+8;parts.push(limb([fx,y0,fz],[fx,y0+9,fz],0.08,0.06,M.white));
    const flag=document.createElement('canvas');flag.width=190;flag.height=100;const g=flag.getContext('2d');
    for(let i=0;i<13;i++){g.fillStyle=i%2?'#ffffff':'#b22234';g.fillRect(0,i*100/13,190,100/13+1);}
    g.fillStyle='#3c3b6e';g.fillRect(0,0,76,54);g.fillStyle='#ffffff';for(let i=0;i<5;i++)for(let j=0;j<6;j++)g.fillRect(6+j*12,5+i*10,3,3);
    const fm=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(flag),side:THREE.DoubleSide});
    const f=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.4).translate(1.3,0,0),fm);f.position.set(fx,y0+8.2,fz);parts.push(f);
    return place(L,parts,D);
  },
  deweypark(L,x,z){
    // a block of grass between Main Street and Boardwalk Street: paths crossing it, a round plaza in the middle with
    // a statue of the town's founder on a plinth, benches and trees
    const D=S.deweypark||{x,z},px=D.x,pz=D.z,y0=gh(px,pz),parts=[],path=mat(0xd8d0bc),stone=mat(0xc8c0b0),bronze=mat(0x6a8a6a);
    parts.push(blk(px,y0+0.02,pz,118,0.1,3.2,path),blk(px,y0+0.02,pz,3.2,0.1,90,path));
    parts.push(mesh(new THREE.CylinderGeometry(10,10,0.14,24).translate(0,0.07,0),path,px,y0,pz));
    parts.push(mesh(new THREE.CylinderGeometry(2.4,2.8,2.6,8).translate(0,1.3,0),stone,px,y0,pz));
    parts.push(limb([px,y0+2.6,pz],[px,y0+5,pz],0.7,0.8,bronze),mesh(new THREE.SphereGeometry(0.6,8,6),bronze,px,y0+5.5,pz),
               mesh(new THREE.CylinderGeometry(0.75,0.75,0.4,8),bronze,px,y0+6.1,pz),limb([px,y0+4.6,pz],[px+0.9,y0+5.9,pz+0.6],0.18,0.15,bronze));   // the captain, with his telescope
    for(const [a,b,r] of [[13,0,0],[-13,0,Math.PI],[0,13,-Math.PI/2],[0,-13,Math.PI/2]])parts.push(blk(px+a,y0+0.45,pz+b,1.8,0.12,0.7,M.deck));
    const leaf=mat(0x4a7a42),trunk=mat(0x6a5040);
    for(const [a,b] of [[-40,-28],[40,-28],[-40,28],[40,28],[-22,-34],[22,34]]){parts.push(limb([px+a,y0,pz+b],[px+a,y0+3,pz+b],0.3,0.25,trunk),mesh(new THREE.IcosahedronGeometry(3.2,0),leaf,px+a,y0+5,pz+b));}
    return build(L,parts);
  },
  };
}
