// Minas Tirith: the three things on the top of the rock that the whole city is arranged around. Fan work -
// every shape is this project's own low-poly geometry, modelled from the description, and no assets from any
// book, film or game are used. Tolkien's world belongs to the Tolkien Estate.
//
// None of this appears in any other city, so it travels with this page rather than living in the shared
// engine, and src/minastirith/main.js hands it to build() as ctx.models.
import { mkRng, makeNoise } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  keel(L,x,z){
    // ---- the rock the city is built round ----
    // "A vast pier of rock whose huge out-thrust bulk divided in two all the circles of the City save the
    // first... a towering bastion of stone, its edge sharp as a ship-keel facing east. Up it rose, even to the
    // level of the topmost circle, and there was crowned by a battlement; so that those in the Citadel might,
    // like mariners in a mountainous ship, look from its peak sheer down upon the Gate seven hundred feet
    // below." (The Return of the King, v.1.)
    //
    // So: in plan it is a ship's bow - wide where it comes out of the Citadel, drawing in along a curve to a
    // point, so that what faces east is an edge and not an end. Its top is the Citadel's own pavement carried
    // out to that point, with a battlement along both edges that meets at it. The stem leans out over its
    // own foot, so the point hangs over the court behind the Great Gate. It rises out of the Citadel; the
    // western circles back onto the mountain, not onto the rock.
    //
    // Earlier versions got the one thing wrong that matters: the east end was a thirty-metre wall with a
    // platform on it, so from the Pelennor it read as a causeway; the faces were boxes stood against a slab,
    // which read as a row of grey skyscrapers; and the rock ran a kilometre west as a wall across open ground,
    // cutting the western circles in two a hundred and fifty metres over their roofs.
    // Now the faces are one mesh, fluted and weathered by displacement and vertex colour rather than by
    // things stood in front of it, and the plan is keel_half in tools/make-minastirith.py, exactly.
    const A=L.turn||0, TOP=L.top||286, HALF=(L.width||120)/2, EAST=L.east||450, ROOT=L.root||160,
      WEST=L.west||-160, LEAN=L.lean||60;
    const parts=[], KR=mkRng(1447);
    const stone=new THREE.MeshLambertMaterial({color:0xe6e0cd,flatShading:true});
    const shadow=new THREE.MeshLambertMaterial({color:0x2e2c29});
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];

    // half the width of the top, along the run (keel_half); the foot is battered out an eighth past it
    const HW=u=>{if(u>EAST||u<WEST)return 0;
      if(u>ROOT){const t=(u-ROOT)/(EAST-ROOT);return HALF*(1-t*t);}
      return HALF;};
    const BAT=1.15;
    // the lean of the stem: over the last hundred and sixty metres the top stands out past the foot
    const OVER=u=>{const t=Math.max(0,Math.min(1,(u-(EAST-160))/160));return LEAN*t*t;};
    const CREST=()=>TOP;

    // ---- the faces, as one mesh ----
    // Columns along the run, rows down the face. Every vertex between the top edge and the foot is pushed in
    // or out along the face: mostly by waves that run up and down it, which is what a cliff of this stuff
    // looks like and what gives it its scale, with a little bedding across. The top row is not moved, so the
    // battlement sits on a clean edge, and the displacement dies away towards the stem, where the two faces
    // meet and would otherwise go through each other.
    const rows=12, cols=[];
    for(let u=WEST;u<EAST;u+=u>ROOT?3:4.5)cols.push(u);cols.push(EAST);
    // Noise stretched sixfold up the face, so it runs in irregular flutes rather than in the regular ribs a
    // sum of sines gave, which read as corrugated sheet.
    const NZ=makeNoise(mkRng(4012));
    const flute=(u,sd,y)=>7*(NZ.fbm(u/10+sd*50,y/62)-0.44)+1.6*(NZ.vn(u/2.6+sd*9,y/22)-0.5);
    const P=[],CL=[],IDX=[];
    const base=new THREE.Color(0xb3ada1),dark=new THREE.Color(0x6f6a61),pale=new THREE.Color(0xd8d2c4),grime=new THREE.Color(0x5b5750),c=new THREE.Color();
    const footY=u=>{const w=HW(u)*BAT+2;return Math.min(gh(...at(u,w,0).filter((_,q)=>q!==1)),gh(...at(u,-w,0).filter((_,q)=>q!==1)))-14;};
    const idx=[[],[]];
    for(const [s,sd] of [[0,-1],[1,1]]){
      for(let i=0;i<cols.length;i++){
        const u=cols[i],w=HW(u),fy=Math.min(footY(u),TOP-20),col=[];
        const damp=Math.min(1,w/14);
        for(let r=0;r<=rows;r++){
          const k=r/rows;                                   // 0 at the top edge, 1 at the foot
          const y=TOP+(fy-TOP)*k, uu=u+OVER(u)*(1-k), ww=w+(w*BAT-w)*k;
          const d=(r===0?0:1)*damp*(flute(u,sd,y)*(0.5+0.5*Math.min(1,k*3))+0.9*Math.sin(y*0.37+u*0.02)*k);
          const [px,py,pz]=at(uu,sd*(ww+d),y);P.push(px,py,pz);
          // colour: pale near the top, where the weather washes it; stained in streaks down from the parapet;
          // bedded; and grimed at the foot where the city's smoke and the street's dirt reach it
          const streak=Math.max(0,NZ.fbm(u/7+sd*30,y/90)*2.2-1.05);
          const bed=0.5+0.5*Math.sin(y*0.21+Math.sin(u*0.013)*2);
          c.copy(base).lerp(pale,0.35*(1-k)*(1-streak)).lerp(dark,0.22*streak*(0.3+k)+0.08*bed)
            .lerp(grime,0.45*Math.max(0,(k-0.72)/0.28));
          c.multiplyScalar(0.92+0.14*NZ.vn(u/3+sd*20,y/5));
          CL.push(c.r,c.g,c.b);col.push(P.length/3-1);}
        idx[s].push(col);}}
    for(let s=0;s<2;s++){const C2=idx[s];
      for(let i=0;i<C2.length-1;i++)for(let r=0;r<rows;r++){
        const a=C2[i][r],b=C2[i+1][r],c2=C2[i+1][r+1],d2=C2[i][r+1];
        if(s===0)IDX.push(a,b,c2,a,c2,d2);else IDX.push(a,c2,b,a,d2,c2);}}
    // the top: the Citadel's pavement carried out to the point, paler than the faces
    {const top0=P.length/3;
     const pave=new THREE.Color(0xcbc5b5);
     for(let i=0;i<cols.length;i++)for(const s of [0,1]){const v=idx[s][i][0];P.push(P[v*3],P[v*3+1],P[v*3+2]);
       CL.push(pave.r,pave.g,pave.b);}
     for(let i=0;i<cols.length-1;i++){const l0=top0+i*2,r0=l0+1,l1=l0+2,r1=l0+3;IDX.push(l0,r0,r1,l0,r1,l1);}
     // and the end under the shoulder, which nobody sees but which keeps the solid closed
     const a=idx[0][0],b=idx[1][0];IDX.push(a[0],a[rows],b[rows],a[0],b[rows],b[0]);}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(CL,3));
    g.setIndex(IDX);g.computeVertexNormals();
    const face=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}));
    face.castShadow=true;face.receiveShadow=true;face.userData.wireCat='landmark';

    // ---- the battlement ----
    // Along both edges of the top from where the rock leaves the Citadel to the point, where the two meet:
    // a parapet with merlons, set a metre and a half in from the edge.
    const edge=(u0,u1)=>{
      for(const sd of [-1,1]){let prev=null;
        for(let u=u0;u<=u1+0.01;u+=4){const uu=Math.min(u,EAST),w=Math.max(0,HW(uu)-1.5);
          const p=at(uu+OVER(uu),sd*w,TOP);
          if(prev){const dx=p[0]-prev[0],dz=p[2]-prev[2],len=Math.hypot(dx,dz);if(len>0.3){
            const m=new THREE.Mesh(new THREE.BoxGeometry(len+0.4,1.5,1.1),stone);
            m.position.set((p[0]+prev[0])/2,TOP+0.75,(p[2]+prev[2])/2);m.rotation.y=-Math.atan2(dz,dx);parts.push(m);
            const me=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.2,1.2),stone);
            me.position.set(p[0],TOP+2.1,p[2]);me.rotation.y=-Math.atan2(dz,dx);parts.push(me);}}
          prev=p;}}};
    edge(ROOT,EAST);
    // a turret where the battlement meets at the point
    {const [tx,,tz]=at(EAST+OVER(EAST)-5,0,0);
     const t=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.6,4,8),stone);t.position.set(tx,TOP+2,tz);parts.push(t);}

    // ---- the tunnels ----
    // Where the Way goes through, at the level of the tier it belongs to, on the face at that height.
    for(const [u,tier] of (L.tunnels||[])){
      const y=(L.base||76)+tier*(L.lift||30), fy=footY(u), k=Math.max(0,Math.min(1,(y-TOP)/(fy-TOP))), w=HW(u)*(1+(BAT-1)*k);
      for(const sd of [-1,1]){
        const [px,py,pz]=at(u+OVER(u)*(1-k),sd*(w+1),y);
        const mouth=new THREE.Mesh(new THREE.CylinderGeometry(6,6,10,10,1,true).rotateZ(Math.PI/2),shadow);
        mouth.position.set(px,py+6,pz);mouth.rotation.y=-A+Math.PI/2;parts.push(mouth);
        const arch=new THREE.Mesh(new THREE.BoxGeometry(4,17,17),stone);
        arch.position.set(px+Math.sin(A)*sd*0.5,py+8.5,pz);arch.rotation.y=-A+Math.PI/2;parts.push(arch);
      }
    }

    // scree at the foot, sparse: the rock is dressed where the city is built against it
    const screeM=new THREE.MeshLambertMaterial({color:0x8f897e,flatShading:true});
    for(let k=0;k<70;k++){
      const u=ROOT+(EAST-ROOT)*KR(), w=HW(u)*BAT, sd=KR()<0.5?-1:1, sz=1.5+KR()*4;
      const [px,,pz]=at(u,sd*(w+1.5+KR()*5),0);
      const m=new THREE.Mesh(new THREE.DodecahedronGeometry(sz,0),screeM);
      m.position.set(px,gh(px,pz)+sz*0.3,pz);m.rotation.set(KR()*3,KR()*3,KR()*3);parts.push(m);
    }

    // what an event needs to put somebody on top of it (src/minastirith/events.js)
    ctx.keel={x,z,A,EAST,TOP,HW,CREST,OVER,at,tip:EAST+OVER(EAST)};

    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[face];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  whitetower(L,x,z){
    // ---- the Tower of Ecthelion ----
    // "Shining like a spike of pearl and silver, tall and fair and shapely, and its pinnacle glittered as if it
    // were wrought of crystals": fifty fathoms of white stone on the Citadel, which is seven hundred feet over the
    // Pelennor, so the standard at the top stands a thousand feet above the fields. What makes it read at any
    // distance is that it is far taller than it is wide and whiter than anything else on the hill - and that it
    // does not stop flat: a stepped plinth, a shaft in courses with pilasters up its angles and lancets in its
    // faces, a machicolated gallery near the top, a lighter belfry stage with pinnacles at its corners, and a
    // spire to a silver point.
    const H=L.height||91,base=L.base!==undefined?L.base:gh(x,z),parts=[];
    const RW=L.width||7.6;                              // the shaft's radius at its foot
    const white=new THREE.MeshLambertMaterial({color:0xf5f1e6});
    const shade=new THREE.MeshLambertMaterial({color:0xddd7c6});
    const dark=new THREE.MeshLambertMaterial({color:0x1b1a1f});
    const lead=new THREE.MeshLambertMaterial({color:0x6c7278});
    const silver=new THREE.MeshPhongMaterial({color:0xe4ebf2,specular:0xffffff,shininess:140,emissive:0x2a2e34});
    const k=H/91;                                       // everything below is laid out for fifty fathoms
    const oct=(r,h,mat,y)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8,1).rotateY(Math.PI/8).translate(0,h/2,0),mat);m.position.set(x,base+y,z);parts.push(m);return m;};
    const taper=(r0,r1,h,mat,y)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,h,8,1).rotateY(Math.PI/8).translate(0,h/2,0),mat);m.position.set(x,base+y,z);parts.push(m);return m;};
    const ring=(n,r,fn)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2;fn(a,x+Math.cos(a)*r,z+Math.sin(a)*r);}};
    const face=(m,a)=>{m.rotation.y=-a;return m;};

    // the plinth, in three steps
    oct(RW*1.9,2*k,shade,0);oct(RW*1.62,3*k,white,2*k);oct(RW*1.36,3.5*k,shade,5*k);
    // the shaft: tapering a little, in courses
    const S0=8.5*k,SH=56*k;
    taper(RW*1.08,RW*0.94,SH,white,S0);
    for(let c=1;c<6;c++)oct(RW*(1.1-0.14*c/6)+0.25,0.7*k,shade,S0+SH*c/6);
    // pilasters up the eight angles, and lancets in the faces between them, rising in tiers
    ring(8,RW*1.02,(a,px,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1.1*k,SH,1.1*k).translate(0,SH/2,0),white);
      m.position.set(px,base+S0,pz);face(m,a);parts.push(m);});
    ring(8,RW*1.0,(a0,_x,_z)=>{const a=a0+Math.PI/8;
      for(let t=0;t<6;t++){if((t+Math.round(a0*4/Math.PI))%2)continue;
        const y=S0+SH*(0.08+t*0.155),rr=RW*(1.07-0.12*t/6);
        const w=new THREE.Mesh(new THREE.BoxGeometry(0.5,4.2*k,1.0*k),dark);w.position.set(x+Math.cos(a)*rr,base+y,z+Math.sin(a)*rr);face(w,a);parts.push(w);
        const arch=new THREE.Mesh(new THREE.ConeGeometry(0.62*k,1.1*k,4).rotateY(Math.PI/4),dark);arch.scale.set(0.5,1,1);
        arch.position.set(x+Math.cos(a)*rr,base+y+2.6*k,z+Math.sin(a)*rr);face(arch,a);parts.push(arch);}});
    // the gallery: corbels under a projecting walk, and a battlement round it
    const G0=S0+SH;
    ring(16,RW*1.02,(a,px,pz)=>{for(let c=0;c<3;c++){const m=new THREE.Mesh(new THREE.BoxGeometry(1.2+c*0.9,0.9*k,0.9*k),shade);
      m.position.set(x+Math.cos(a)*(RW*0.98+0.4+c*0.45),base+G0-2.4*k+c*0.8*k,z+Math.sin(a)*(RW*0.98+0.4+c*0.45));face(m,a);parts.push(m);}});
    oct(RW*1.36,1.3*k,white,G0);
    ring(24,RW*1.3,(a,px,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1.5*k,1.9*k,0.8*k),white);m.position.set(px,base+G0+1.3*k+0.95*k,pz);face(m,a+Math.PI/2);parts.push(m);});
    // the belfry stage: set back, open in each face, pinnacles at its angles
    const B0=G0+1.3*k,BH=10*k;
    oct(RW*0.9,BH,white,B0);
    ring(8,RW*0.9,(a0)=>{const a=a0+Math.PI/8,rr=RW*0.87;const w=new THREE.Mesh(new THREE.BoxGeometry(0.5,6*k,2.2*k),dark);
      w.position.set(x+Math.cos(a)*rr,base+B0+4.6*k,z+Math.sin(a)*rr);face(w,a);parts.push(w);});
    oct(RW*0.98,0.9*k,shade,B0+BH);
    ring(8,RW*0.92,(a,px,pz)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(0.6*k,5*k,6).translate(0,2.5*k,0),white);m.position.set(px,base+B0+BH+0.9*k,pz);parts.push(m);
      const f=new THREE.Mesh(new THREE.SphereGeometry(0.28*k,6,4),silver);f.position.set(px,base+B0+BH+6*k,pz);parts.push(f);});
    // the spire, and its point
    const P0=B0+BH+0.9*k,PH=H-P0-3*k;
    {const m=new THREE.Mesh(new THREE.ConeGeometry(RW*0.8,PH,8).rotateY(Math.PI/8).translate(0,PH/2,0),white);m.position.set(x,base+P0,z);parts.push(m);}
    ring(8,RW*0.42,(a,px,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(0.35*k,PH*0.8,0.35*k).translate(0,PH*0.4,0),shade);m.position.set(px,base+P0,pz);
      m.rotation.set(Math.sin(a)*0.18,0,-Math.cos(a)*0.18);parts.push(m);});
    {const m=new THREE.Mesh(new THREE.OctahedronGeometry(1.1*k,0),silver);m.scale.set(1,2.2,1);m.position.set(x,base+H-1.8*k,z);parts.push(m);}
    const staffTop=H+9*k;
    {const s=box(x,base+H,z,0.3*k,9*k,0.3*k,lead);parts.push(s);}

    // the banner: black, because Denethor is Steward and there is no king to fly a white tree
    const flagM=new THREE.MeshLambertMaterial({color:0x14131a,side:THREE.DoubleSide});
    const FW=H*0.09,FH=H*0.05;
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH,6,1),flagM);
    flag.position.set(x+FW/2,base+staffTop-FH/2-0.3,z);scene.add(flag);
    const pos=flag.geometry.attributes.position,base0=pos.array.slice();
    // the events swap it for the King's banner in peace, and break it out at the coronation (events.js)
    ctx.towerFlag={mesh:flag,mat:flagM,FW,FH};

    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    const g=group(L,merged);
    animHooks.push(now=>{
      const t=now*0.0016;
      for(let i=0;i<pos.count;i++){const px=base0[i*3];
        pos.array[i*3+2]=base0[i*3+2]+Math.sin(t+px*0.55)*Math.max(0,px+FW/2)*0.16;}
      pos.needsUpdate=true;
    });
    return g;},

  kingshall(L,x,z){
    // ---- the Hall of the Kings ----
    // In the book the hall is inside the Tower; every picture since has put it at the Tower's foot, and so
    // does this: a long hall against the Tower's west face, its door on the Court of the Fountain. Inside,
    // "tall pillars of black marble" and the kings in stone between them, and at the far end the throne under
    // its canopy with the Steward's black chair on the lowest step. From outside that is: a high nave under a
    // lead roof with a clerestory, lower aisles either side lit by deep windows between buttresses, and a
    // portico of six columns under a pediment at the west end, with the great doors behind it.
    const base=L.base!==undefined?L.base:gh(x,z),A=L.turn||0,LEN=L.length||56,NW=L.nave||14,AW=L.aisle||8;
    const parts=[];
    const white=new THREE.MeshLambertMaterial({color:0xefeadd});
    const shade=new THREE.MeshLambertMaterial({color:0xd6d0bf});
    const dark=new THREE.MeshLambertMaterial({color:0x1d1c21});
    const lead=new THREE.MeshLambertMaterial({color:0x5f666d,flatShading:true});
    const doorM=new THREE.MeshPhongMaterial({color:0x3a3a40,specular:0xaab0b8,shininess:40});
    // u runs east along the hall (towards the Tower), v across it
    const at=(u,v)=>[x+u*Math.cos(A)-v*Math.sin(A),z+u*Math.sin(A)+v*Math.cos(A)];
    const blk=(u,v,y,lu,h,lv,mat)=>{const [px,pz]=at(u,v);const m=new THREE.Mesh(new THREE.BoxGeometry(lu,h,lv).translate(0,h/2,0),mat);m.position.set(px,base+y,pz);m.rotation.y=-A;parts.push(m);return m;};
    const W0=-LEN/2,W1=LEN/2;
    // podium and steps up to the portico
    blk(0,0,0,LEN+4,1.6,NW+2*AW+4,shade);
    for(let s=0;s<4;s++)blk(W0-4-s*1.6,0,0,1.6,1.6-s*0.4,NW+6,shade);
    // the aisles, their windows and buttresses
    const AH=13,NH=23;
    for(const sd of [-1,1]){
      blk(0,sd*(NW/2+AW/2),1.6,LEN,AH,AW,white);
      blk(0,sd*(NW/2+AW/2),1.6+AH,LEN+0.8,0.8,AW+0.8,shade);
      for(let i=0;i<7;i++){const u=W0+LEN*(i+0.5)/7;
        blk(u,sd*(NW/2+AW+0.3),3.4,1.6,8.6,0.3,dark);
        if(i<6)blk(W0+LEN*(i+1)/7,sd*(NW/2+AW+0.9),1.6,1.6,AH-1,1.8,shade);}
      // the lean-to roof over the aisle
      const [rx,rz]=at(0,sd*(NW/2+AW/2));const r=new THREE.Mesh(new THREE.BoxGeometry(LEN+1,0.6,AW*1.1),lead);
      r.position.set(rx,base+1.6+AH+2.3,rz);r.rotation.set(0,-A,0);r.rotateX(-sd*0.42);parts.push(r);}
    // the nave, its clerestory windows, and the roof over it
    blk(0,0,1.6,LEN,NH,NW,white);
    blk(0,0,1.6+NH,LEN+0.8,0.9,NW+0.8,shade);
    for(const sd of [-1,1])for(let i=0;i<9;i++){const u=W0+LEN*(i+0.5)/9;blk(u,sd*(NW/2+0.15),1.6+AH+2.8,1.3,5,0.3,dark);}
    {const RH=6.5,rw=Math.hypot(NW/2+1,RH);
     for(const sd of [-1,1]){const [rx,rz]=at(0,sd*(NW/4+0.25));const r=new THREE.Mesh(new THREE.BoxGeometry(LEN+1.4,0.7,rw),lead);
       r.position.set(rx,base+1.6+NH+0.9+RH/2,rz);r.rotation.set(0,-A,0);r.rotateX(sd*Math.atan2(RH,NW/2+1));parts.push(r);}
     // the gable over the portico, as a solid wedge
     const shape=new THREE.Shape();shape.moveTo(-(NW/2+AW*0.6),0);shape.lineTo(NW/2+AW*0.6,0);shape.lineTo(0,RH+1.2);shape.lineTo(-(NW/2+AW*0.6),0);
     const ped=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:2.2,bevelEnabled:false}),white);
     const [px,pz]=at(W0-7.2,0);ped.position.set(px,base+1.6+NH-4.2,pz);ped.rotation.y=-A-Math.PI/2;parts.push(ped);}
    // the portico: six columns, an entablature, and the doors behind
    blk(W0-4.6,0,1.6+NH-5.6,9.2,1.6,NW+AW*1.2,shade);
    for(let c=0;c<6;c++){const v=(c-2.5)*(NW+AW*1.1)/5.5;const [px,pz]=at(W0-8,v);
      const col=new THREE.Mesh(new THREE.CylinderGeometry(0.85,1.0,NH-6.4,12).translate(0,(NH-6.4)/2,0),white);col.position.set(px,base+1.6+0.4,pz);parts.push(col);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,2.4),shade);cap.position.set(px,base+1.6+NH-6.2,pz);parts.push(cap);
      const bs=new THREE.Mesh(new THREE.BoxGeometry(2.3,0.5,2.3),shade);bs.position.set(px,base+1.8,pz);parts.push(bs);}
    blk(W0-0.3,0,1.6,0.8,12,7.5,doorM);
    blk(W0-0.6,0,1.6+12,0.9,2.4,9,shade);
    // the east end runs into the Tower, and a lower range behind the aisles on either side of it
    blk(W1+2,0,1.6,4,NH-2,NW+2*AW,white);

    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat){const g2=mergeParts(list,mat);g2.castShadow=true;g2.receiveShadow=true;merged.push(g2);}
    return group(L,merged);},

  whitetree(L,x,z){
    // ---- the Court of the Fountain ----
    // "A sweet fountain played in the morning sun, and a sward of bright green lay about it; but in the midst,
    // drooping over the pool, stood a dead tree." The court in front of the Hall's door: a paved square, the
    // sward laid in it, the pool with its jet, the tree leaning out over the water, benches, and the guard of
    // the Citadel in black and silver at the Hall's door and by the tree.
    const base=L.base!==undefined?L.base:gh(x,z),A=L.turn||0,parts=[],TR=mkRng(2931);
    const S=L.size||[92,88];
    const pave=new THREE.MeshLambertMaterial({color:0xe2dccb});
    const joint=new THREE.MeshLambertMaterial({color:0xcfc8b5});
    const white=new THREE.MeshLambertMaterial({color:0xefe9da});
    const bone=new THREE.MeshLambertMaterial({color:0xd9d3c4});
    const sward=new THREE.MeshLambertMaterial({color:0x5c7a44});
    const waterM=new THREE.MeshPhongMaterial({color:0x9cc0d2,specular:0xffffff,shininess:90,transparent:true,opacity:0.85});
    const at=(u,v)=>[x+u*Math.cos(A)-v*Math.sin(A),z+u*Math.sin(A)+v*Math.cos(A)];
    const blk=(u,v,y,lu,h,lv,mat)=>{const [px,pz]=at(u,v);const m=new THREE.Mesh(new THREE.BoxGeometry(lu,h,lv).translate(0,h/2,0),mat);m.position.set(px,base+y,pz);m.rotation.y=-A;parts.push(m);return m;};
    // the paving, with a border and a joint grid that gives it its scale
    blk(0,0,0,S[0],0.5,S[1],pave);
    for(let i=-4;i<=4;i++){blk(i*S[0]/9,0,0.5,0.35,0.06,S[1],joint);blk(0,i*S[1]/9,0.5,S[0],0.06,0.35,joint);}
    // the sward, square, with the pool in the midst of it
    const SW=S[1]*0.58;
    blk(0,0,0.5,SW,0.35,SW,sward);
    blk(0,0,0.5,SW+1.6,0.55,1.2,white);blk(0,0,0.5,1.2,0.55,SW+1.6,white);        // the paths across it, and its kerb
    for(const sd of [-1,1]){blk(0,sd*(SW/2+0.4),0.5,SW+1.6,0.6,0.8,white);blk(sd*(SW/2+0.4),0,0.5,0.8,0.6,SW+1.6,white);}
    // the pool and the jet
    const [cx,cz]=at(0,0);
    {const rim=new THREE.Mesh(new THREE.CylinderGeometry(7,7.4,1.1,8).rotateY(Math.PI/8),white);rim.position.set(cx,base+0.9,cz);parts.push(rim);
     const water=new THREE.Mesh(new THREE.CylinderGeometry(6.3,6.3,0.3,8).rotateY(Math.PI/8),waterM);water.position.set(cx,base+1.35,cz);parts.push(water);
     const bowl=new THREE.Mesh(new THREE.CylinderGeometry(1.8,0.6,1.2,10),white);bowl.position.set(cx,base+2.6,cz);parts.push(bowl);
     const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.6,1.6,8),white);stem.position.set(cx,base+1.7,cz);parts.push(stem);}
    const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.45,4.2,8),waterM);jet.position.set(cx,base+5,cz);scene.add(jet);
    // benches round the sward
    for(const sd of [-1,1])for(let i=-2;i<=2;i++){if(!i)continue;blk(i*SW/5,sd*(SW/2+4),0.5,4.5,0.9,1.2,white);blk(sd*(SW/2+4),i*SW/5,0.5,1.2,0.9,4.5,white);}
    // the tree: dead, white, and leaning out over the water
    const [tx,tz]=at(3,-8);
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.8,2.0,15,7).translate(0,7.5,0),bone);
    trunk.position.set(tx,base+0.8,tz);trunk.rotation.set(0.28,0,-0.06);parts.push(trunk);
    const top=new THREE.Vector3(0,15,0).applyEuler(trunk.rotation).add(trunk.position);
    const limbs=[],tips=[];
    const grow=(px,py,pz,ax,ay,az,len,rad,depth)=>{
      const m=new THREE.Mesh(new THREE.CylinderGeometry(rad*0.45,rad,len,6).translate(0,len/2,0),bone);
      m.position.set(px,py,pz);m.rotation.set(ax,ay,az);limbs.push(m);
      const e=new THREE.Vector3(0,len*0.92,0).applyEuler(m.rotation).add(m.position);
      if(depth<=0){tips.push([e.x,e.y,e.z]);return;}
      for(let k2=0;k2<2;k2++)grow(e.x,e.y,e.z,ax+(TR()-0.5)*0.9,ay+(TR()-0.5)*1.4,az+(TR()-0.5)*1.0,len*(0.62+TR()*0.16),rad*0.6,depth-1);
    };
    // it droops: the limbs lean out over the pool, towards +v
    for(let k2=0;k2<4;k2++)grow(top.x,top.y,top.z,0.35+(TR()-0.5)*0.5,TR()*6.28,(TR()-0.5)*0.8,8,1.1,3);
    parts.push(...limbs);
    // ---- and what it does when the war is over ----
    // The tree is dead and left standing because nobody will cut it down; it comes into flower when the
    // King comes back. The page's peace mode is as close to that as this model gets, so the blossom is
    // built here and hidden, and src/minastirith/war.js turns it on. Leaves under it, because a tree in
    // flower with bare wood under the blossom reads as snow on a dead tree.
    {
      const blossomM=new THREE.MeshLambertMaterial({color:0xfdf6ee,emissive:0x2a2426,flatShading:true});
      const leafM=new THREE.MeshLambertMaterial({color:0x6f8f52,flatShading:true});
      const bl=[];
      for(const [bx,by,bz] of tips){
        for(let k2=0;k2<7;k2++){
          const r=0.55+TR()*0.8;
          const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),TR()<0.72?blossomM:leafM);
          m.position.set(bx+(TR()-0.5)*4.5,by+(TR()-0.5)*4.2,bz+(TR()-0.5)*4.5);
          m.rotation.set(TR()*3,TR()*3,TR()*3);bl.push(m);
        }
      }
      const byB=new Map();
      for(const m of bl){let a=byB.get(m.material);if(!a){a=[];byB.set(m.material,a);}a.push(m);}
      const P2=ctx.peaceParts=ctx.peaceParts||[];
      for(const [mat,list] of byB){const g2=mergeParts(list,mat);g2.visible=false;scene.add(g2);P2.push(g2);}
    }
    // the guard of the Citadel: two at the Hall's door, two by the tree, in black with the silver of the tree
    const mail=new THREE.MeshLambertMaterial({color:0x24262d}),argent=new THREE.MeshLambertMaterial({color:0xc9ced6});
    const guard=(u,v)=>{blk(u,v,0.5,0.7,1.9,1.0,mail);blk(u,v,2.4,0.55,0.35,0.6,argent);blk(u+0.2,v+0.6,0.5,0.14,3.6,0.14,mail);};
    guard(S[0]/2-2,-5);guard(S[0]/2-2,5);guard(1,-15);guard(-4,-14);
    // where it all is, for the coronation (events.js)
    ctx.court={x,z,A,base,S,SW,tree:[top.x,top.y+6,top.z],pool:[cx,cz]};

    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    const g=group(L,merged);
    animHooks.push(now=>{const t=now*0.002;jet.scale.y=0.9+0.14*Math.sin(t);jet.position.y=base+5+0.3*Math.sin(t);});
    return g;},

  greatgate(L,x,z){   // the gate in the first wall: black stone, and steel doors - shut in the siege, open in peace
    const H=L.height||34,a=L.turn||0,g0=gh(x,z),parts=[];
    const black=new THREE.MeshLambertMaterial({color:0x3c3b3f});
    const steel=new THREE.MeshPhongMaterial({color:0x585f66,specular:0xaab0b8,shininess:40,flatShading:true});
    const ux=Math.cos(a),uz=Math.sin(a);           // out through the gate
    const vx=-uz,vz=ux;                            // along the wall
    // the two towers either side of the opening, and the arch over it
    for(const s of [-1,1]){
      const tx=x+vx*s*17,tz=z+vz*s*17;
      const t=box(tx,g0-6,tz,22,H+14,20,black);t.rotation.y=-a;parts.push(t);
      const cap=box(tx,g0+H+8,tz,26,4,24,black);cap.rotation.y=-a;parts.push(cap);
      for(let k=0;k<5;k++){const m=box(tx+vx*s*(k-2)*4.6,g0+H+12,tz+vz*s*(k-2)*4.6,3,4,3,black);
        m.rotation.y=-a;parts.push(m);}
    }
    const lintel=box(x,g0+H-6,z,14,10,20,black);lintel.rotation.y=-a;parts.push(lintel);
    // In peace the doors are thrown back against the wall inside. In the siege they are shut - it is what the
    // whole host is outside for - and each leaf is its own object on a pivot at its foot, so that it can be
    // broken in (src/minastirith/events.js); ctx.onWar puts it back up whenever the page goes to war again.
    const PEACE=ctx.peaceParts=ctx.peaceParts||[],WAR=ctx.warParts=ctx.warParts||[];
    for(const s of [-1,1]){
      const dx=x-ux*7+vx*s*8.5,dz=z-uz*7+vz*s*8.5;
      const d=new THREE.Mesh(new THREE.BoxGeometry(1.6,H-8,15).translate(0,(H-8)/2,0),steel);
      d.position.set(dx,g0,dz);d.rotation.y=-a+s*0.5;scene.add(d);PEACE.push(d);
    }
    const leaves=[];
    for(const s of [-1,1]){
      const p=new THREE.Group();p.rotation.order='YXZ';p.position.set(x-ux*1.5+vx*s*3.5,g0,z-uz*1.5+vz*s*3.5);
      const m=new THREE.Mesh(new THREE.BoxGeometry(1.6,H-8,6.9).translate(0,(H-8)/2,0),steel);
      for(let k=0;k<4;k++){const band=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.1,7.1),black);band.position.y=4+k*(H-12)/3.4;p.add(band);}
      p.add(m);p.rotation.y=-a;scene.add(p);WAR.push(p);leaves.push({p,s,home:p.position.clone()});
    }
    const gate=ctx.gate={x,z,a,g0,H,ux,uz,vx,vz,leaves,broken:false,
      reset(){for(const q of leaves){q.p.position.copy(q.home);q.p.rotation.set(0,-a,0);}gate.broken=false;}};
    (ctx.onWar=ctx.onWar||[]).push(()=>gate.reset());
    return group(L,parts);},

  };
}
