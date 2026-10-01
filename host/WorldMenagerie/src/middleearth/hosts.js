// ---------- what moves in Mordor: the hosts marching the roads, the Nazgul over the plateau, and the lightning
// in the pall. Two pages march - Mordor and Minas Tirith, which is the same war seen from the other end - so it
// lives here, shared by both, rather than in either city's folder; and nothing is built unless the city config carries a
// "hosts" block. A host needs a road long enough to be on: minRoad, because Mordor's are ninety kilometres
// and the Causeway is nine. ----------
import { mkRng } from '../core/rng.js';

export function hosts(api){
  const {THREE,C,ctx,B,ROADS,scene,camera,animHooks,groundH,joinChains,polyAt,polyLen,mergeParts}=api;
  // Eighty trebuchets and fourteen siege towers built as groups of loose boxes came to three thousand draw
  // calls on their own. Everything static in one of these is merged, by material, the moment it is built:
  // the parts are positioned in the object's own local frame, so the merge bakes that frame and the object
  // still moves as one thing. Only what actually animates - a throwing arm, a ram on its chains - stays
  // separate.
  const fold=(g,parts)=>{
    const by=new Map();
    for(const m of parts){let a=by.get(m.material);if(!a){a=[];by.set(m.material,a);}a.push(m);}
    for(const [mat,list] of by)g.add(mergeParts(list,mat));
    return g;};

  const K=C.hosts;if(!K)return;
  // Everything this module puts in the world is war, and a page can ask for it to go away: the Minas
  // Tirith page has a peace mode, and what it hides is exactly this list.
  const WAR=ctx.warParts=ctx.warParts||[];
  const add=o=>{scene.add(o);WAR.push(o);return o;};
  const HR=mkRng(6626),D=new THREE.Object3D();
  const arrows=[],stones=[],engines=[],fires2=[],smoke2=[];
  let fireInst=null,smokeInst=null;
  const col2=h=>(typeof h==='string')?parseInt(h.replace('#',''),16):h;
  const ironM=new THREE.MeshLambertMaterial({color:0x1e1c1a});
  const fleshM=new THREE.MeshLambertMaterial({color:0x2b2621});
  const dustM=new THREE.MeshLambertMaterial({color:0x3a332b,transparent:true,opacity:0.16,depthWrite:false});
  // The fellbeasts are the same black as everything else in Mordor, which on a plain of black ash means
  // they cannot be seen at all. This is a shade lighter, and it is the difference between a Nazgul and
  // a missing feature.
  const beastM=new THREE.MeshLambertMaterial({color:0x453c35,flatShading:true});

  // the roads they use: the named ones, joined end to end
  const NAMED=new RegExp(K.roads||'Road|Gate|Sauron','i');
  const groups=new Map();
  for(const r of ROADS){if(!r.name||!NAMED.test(r.name))continue;let g=groups.get(r.name);if(!g){g=[];groups.set(r.name,g);}g.push(r);}
  const routes=[];
  for(const [name,rs] of groups)for(const pts of joinChains(rs.map(r=>r.pts),40)){
    const r=polyLen({pts});if(r.len<(K.minRoad||20000))continue;r.name=name;routes.push(r);}

  // ---- the hosts ----
  // Each army is built once in its own local frame and then moved as a single object: forty thousand
  // instance matrices rewritten every frame would cost more than the whole rest of the land put together.
  const armies=[];
  {const want=K.armies||0,per=K.perArmy||4000,FILE=K.file||62,STEP=K.step||1.9;
   for(let k=0;k<want&&routes.length;k++){
     const r=routes[k%routes.length];
     const g=new THREE.Group();
     const ranks=Math.ceil(per/FILE);
     const bodies=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),fleshM,per);
     const spears=new THREE.InstancedMesh(new THREE.BoxGeometry(0.13,3.6,0.13).translate(0,1.8,0),ironM,per);
     let n=0;
     for(let rk=0;rk<ranks&&n<per;rk++)for(let f=0;f<FILE&&n<per;f++){
       const x=(f-(FILE-1)/2)*STEP+(HR()-0.5)*0.5,z=-rk*STEP-(HR()-0.5)*0.4;
       D.position.set(x,0,z);D.rotation.set(0,0,0);D.scale.set(1,0.9+HR()*0.25,1);D.updateMatrix();
       bodies.setMatrixAt(n,D.matrix);
       D.position.set(x+0.35,1.1,z);D.rotation.set(0,0,(HR()-0.5)*0.22);D.updateMatrix();
       spears.setMatrixAt(n,D.matrix);n++;}
     bodies.count=spears.count=n;bodies.frustumCulled=spears.frustumCulled=false;
     g.add(bodies,spears);
     // ---- the trolls ----
     // Half again as tall as a man is nothing at this range; these are the ones that carry the engines, and
     // they are drawn at the size the stories give them - three times an orc and twice as wide - walking out
     // in front of the column and in a rank of their own down each flank.
     {const nt=K.trolls===undefined?0:K.trolls;
      if(nt>0){
        const tb=new THREE.InstancedMesh(new THREE.BoxGeometry(2.6,5.6,2.1).translate(0,2.8,0),fleshM,nt);
        const ta=new THREE.InstancedMesh(new THREE.BoxGeometry(0.9,4.4,0.9).translate(0,2.2,0),ironM,nt);
        for(let t2=0;t2<nt;t2++){
          const front=t2<nt*0.4;
          const x=front?(HR()-0.5)*FILE*STEP*0.7:(HR()<0.5?-1:1)*(FILE*STEP*0.5+3+HR()*5);
          const z=front?STEP*(6+HR()*10):-HR()*ranks*STEP;
          D.position.set(x,0,z);D.rotation.set(0,(HR()-0.5)*0.3,0);D.scale.set(1,0.9+HR()*0.3,1);D.updateMatrix();
          tb.setMatrixAt(t2,D.matrix);
          D.position.set(x+1.6,3.2,z);D.rotation.set(0,0,(HR()-0.5)*0.5);D.updateMatrix();
          ta.setMatrixAt(t2,D.matrix);}
        tb.count=ta.count=nt;tb.frustumCulled=ta.frustumCulled=false;g.add(tb,ta);}}
     // ---- the engines and the baggage ----
     // Siege towers and rams on rollers at the head of the column, and the wains strung out behind it: an army
     // this size is mostly not soldiers, and from a distance the train is longer than the host.
     {const ne=K.engines===undefined?0:K.engines;
      for(let e=0;e<ne;e++){
        const x=(HR()-0.5)*FILE*STEP*0.6,z=STEP*(14+HR()*22);
        const frame=new THREE.Mesh(new THREE.BoxGeometry(6,11,7).translate(0,5.5,0),ironM);
        frame.position.set(x,0,z);frame.rotation.y=(HR()-0.5)*0.2;
        const hide=new THREE.Mesh(new THREE.BoxGeometry(6.4,5,7.4).translate(0,2.5,0),fleshM);
        hide.position.set(x,0,z);hide.rotation.copy(frame.rotation);
        g.add(frame,hide);}
      const nw=K.wains===undefined?0:K.wains;
      for(let w2=0;w2<nw;w2++){
        const x=(HR()-0.5)*FILE*STEP*0.9,z=-ranks*STEP-STEP*(4+HR()*90);
        const bed=new THREE.Mesh(new THREE.BoxGeometry(4.4,2.2,2.4).translate(0,1.1,0),ironM);
        bed.position.set(x,0,z);bed.rotation.y=(HR()-0.5)*0.25;g.add(bed);
        const beast=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.2,1.4).translate(0,1.1,0),fleshM);
        beast.position.set(x,0,z+3.6);beast.rotation.copy(bed.rotation);g.add(beast);}}
     // banners over the column
     // a page can give its hosts their own colours (banner): Isengard's are white
     {const bits=[],flagM=new THREE.MeshLambertMaterial({color:K.banner?col2(K.banner):0x5a1712,side:THREE.DoubleSide});
      for(let b=0;b<6;b++){const bx=(HR()-0.5)*FILE*STEP*0.8,bz=-HR()*ranks*STEP;
        const pole=new THREE.Mesh(new THREE.BoxGeometry(0.22,9,0.22).translate(0,4.5,0),ironM);pole.position.set(bx,0,bz);
        const flag=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.2),flagM);
        flag.position.set(bx+1.7,8,bz);bits.push(pole,flag);}
      fold(g,bits);}
     add(g);
     // the dust it raises, trailing behind
     const dust=[];for(let d2=0;d2<7;d2++){const p=new THREE.Mesh(new THREE.SphereGeometry(17,9,6),dustM);
       p.userData.t=d2/7;add(p);dust.push(p);}
     armies.push({g,r,s:HR()*r.len,v:(K.pace||1.4)*(0.8+HR()*0.5),dir:HR()<0.5?-1:1,dust,ranks,STEP});}
   ctx.hosts=armies;   // the Black Gate watches these: it opens when one is on the road and shuts behind it
   // ---- the hosts that are not going anywhere ----
   // Round Barad-dur the army is not marching, it is standing: drawn up in squares on the plain under the
   // tower, waiting to be sent somewhere. Same ranks, same banners, no route - and built once, like the rest.
   for(const [cx,cz] of (K.camped||[])){
     const per=K.campedPer||4000,FILE2=K.file||62,STEP2=K.step||1.9;
     const g=new THREE.Group();
     const ranks=Math.ceil(per/FILE2);
     const bodies=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),fleshM,per);
     const spears=new THREE.InstancedMesh(new THREE.BoxGeometry(0.13,3.6,0.13).translate(0,1.8,0),ironM,per);
     let n=0;
     for(let rk=0;rk<ranks&&n<per;rk++)for(let f=0;f<FILE2&&n<per;f++){
       const px=(f-(FILE2-1)/2)*STEP2+(HR()-0.5)*0.6,pz=-rk*STEP2-(HR()-0.5)*0.5;
       D.position.set(px,0,pz);D.rotation.set(0,(HR()-0.5)*0.12,0);D.scale.set(1,0.9+HR()*0.25,1);D.updateMatrix();
       bodies.setMatrixAt(n,D.matrix);
       D.position.set(px+0.35,1.1,pz);D.rotation.set(0,0,(HR()-0.5)*0.3);D.updateMatrix();
       spears.setMatrixAt(n,D.matrix);n++;}
     bodies.count=spears.count=n;bodies.frustumCulled=spears.frustumCulled=false;
     g.add(bodies,spears);
     {const bits=[],flagM=new THREE.MeshLambertMaterial({color:0x5a1712,side:THREE.DoubleSide});
      for(let b=0;b<8;b++){const bx2=(HR()-0.5)*FILE2*STEP2*0.9,bz2=-HR()*ranks*STEP2;
        const pole=new THREE.Mesh(new THREE.BoxGeometry(0.22,10,0.22).translate(0,5,0),ironM);pole.position.set(bx2,0,bz2);
        const flag=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.4),flagM);
        flag.position.set(bx2+1.8,8.6,bz2);bits.push(pole,flag);}
      fold(g,bits);}
     g.position.set(cx,groundH(cx,cz),cz);g.rotation.y=HR()*6.28;
     add(g);
   }
   let last=performance.now();
   animHooks.push(now=>{if(ctx.war===false)return;const dt=Math.min(0.05,(now-last)/1000);last=now;
     for(const a of armies){a.s+=a.v*dt*a.dir;
       const [px,pz]=polyAt(a.r,a.s,true),[ax,az]=polyAt(a.r,a.s+a.dir*120,true);
       const head=Math.atan2(az-pz,ax-px),gy=groundH(px,pz);
       a.g.position.set(px,gy+Math.abs(Math.sin(now*0.004))*0.12,pz);a.g.rotation.y=-head+Math.PI/2;
       // Behind it. `head` is already the way it is going, whichever way along the road that is; multiplying
       // by dir again put the dust out in front of every army marching the road backwards - half of them.
       a.dust.forEach((p,i)=>{const t=((now*0.00004)+p.userData.t)%1,back=a.ranks*a.STEP*(0.6+t*2.2);
         p.position.set(px-Math.cos(head)*back,gy+8+t*34,pz-Math.sin(head)*back);
         p.scale.setScalar(0.7+t*3.2);});}
     if(ctx.details&&now-(ctx._hT||0)>1000){ctx._hT=now;
       ctx.details.hostAt=armies.slice(0,3).map(a=>Math.round(a.g.position.x)+','+Math.round(a.g.position.z)).join(' | ');}});}


  // ---- the siege ----
  // A war is not a column on a road. It is a ring of camps outside bowshot, blocks of troops drawn up
  // between the camps and the wall, engines behind them throwing, and arrows going both ways - and the
  // thing that makes it read as a siege rather than as a lot of scenery is that something is always in
  // the air. Everything here is built once, in local frames; the only per-frame work is what is flying.
  //
  // The arrows are drawn several times life size, for the same reason the fellbeasts are: a real arrow two
  // kilometres away is nothing at all, and a volley you cannot see is a volley that is not happening.
  const flying={blocks:0,camps:0,tents:0,engines:0,towers:0,riders:0,grond:0};
  if(K.siege){
    const S=K.siege,[ccx,ccz]=S.at||[0,0];
    const A0=S.arc?S.arc[0]:-1.2, A1=S.arc?S.arc[1]:1.2;
    const R0=S.r0||1300, R1=S.r1||2300;
    const canvasM=new THREE.MeshLambertMaterial({color:0x4a4136,flatShading:true});
    const woodM=new THREE.MeshLambertMaterial({color:0x332c25,flatShading:true});
    const emberM=new THREE.MeshBasicMaterial({color:0xff9a3c,transparent:true,opacity:0.85,depthWrite:false});
    const shaftM=new THREE.MeshLambertMaterial({color:0xcfc4a6});
    const aim=(x,z)=>-Math.atan2(ccz-z,ccx-x)+Math.PI/2;      // face whatever is being besieged
    // what a page's events move about: the blocks (which scatter) and the riders (who charge)
    ctx.siege={blocks:[],riders:null};

    // ---- the blocks, drawn up facing the wall ----
    {const NB=S.blocks||0,PER=S.per||1000,FL=S.file||42,ST=K.step||1.9;
     for(let b=0;b<NB;b++){
       const a=A0+(A1-A0)*((b+0.5)/NB)+(HR()-0.5)*0.06;
       const rr=R0+HR()*(R1-R0)*0.45;
       const bx=ccx+Math.cos(a)*rr, bz=ccz+Math.sin(a)*rr;
       const g=new THREE.Group(),ranks=Math.ceil(PER/FL);
       const bodies=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),fleshM,PER);
       const spears=new THREE.InstancedMesh(new THREE.BoxGeometry(0.13,3.6,0.13).translate(0,1.8,0),ironM,PER);
       let n=0;
       for(let rk=0;rk<ranks&&n<PER;rk++)for(let f=0;f<FL&&n<PER;f++){
         const px=(f-(FL-1)/2)*ST+(HR()-0.5)*0.5,pz=-rk*ST-(HR()-0.5)*0.4;
         D.position.set(px,0,pz);D.rotation.set(0,(HR()-0.5)*0.1,0);D.scale.set(1,0.9+HR()*0.25,1);D.updateMatrix();
         bodies.setMatrixAt(n,D.matrix);
         D.position.set(px+0.35,1.1,pz);D.rotation.set(0,0,(HR()-0.5)*0.26);D.updateMatrix();
         spears.setMatrixAt(n,D.matrix);n++;}
       bodies.count=spears.count=n;bodies.frustumCulled=spears.frustumCulled=false;g.add(bodies,spears);
       {const bits=[],flagM=new THREE.MeshLambertMaterial({color:S.colour?col2(S.colour):0x5a1712,side:THREE.DoubleSide});
        for(let q=0;q<5;q++){const qx=(HR()-0.5)*FL*ST*0.8,qz=-HR()*ranks*ST;
          const pole=new THREE.Mesh(new THREE.BoxGeometry(0.22,9,0.22).translate(0,4.5,0),ironM);pole.position.set(qx,0,qz);
          const flag=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.2),flagM);
          flag.position.set(qx+1.7,8,qz);bits.push(pole,flag);}
        fold(g,bits);}
       g.position.set(bx,groundH(bx,bz),bz);g.rotation.y=aim(bx,bz);
       add(g);ctx.siege.blocks.push(g);flying.blocks++;}}

    // ---- the camps, behind them ----
    // Tents in clumps round a fire, which is the only thing that makes a plain look occupied.
    {const NC=S.camps||0,TP=S.tentsPer||22;
     if(NC){
       const tent=new THREE.InstancedMesh(new THREE.ConeGeometry(3.6,4.4,5),canvasM,NC*TP);
       const ridge=new THREE.InstancedMesh(new THREE.BoxGeometry(0.2,0.2,9),woodM,NC*TP);
       let n=0;
       for(let c=0;c<NC;c++){
         const a=A0+(A1-A0)*HR(), rr=R1*(0.92+HR()*0.5);
         const ox=ccx+Math.cos(a)*rr, oz=ccz+Math.sin(a)*rr, oa=HR()*6.28;
         for(let t2=0;t2<TP;t2++){
           const tx=ox+(HR()-0.5)*190, tz=oz+(HR()-0.5)*190, gy=groundH(tx,tz);
           D.position.set(tx,gy+2.2,tz);D.rotation.set(0,oa+(HR()-0.5)*0.5,0);D.scale.set(1,0.8+HR()*0.5,1);
           D.updateMatrix();tent.setMatrixAt(n,D.matrix);
           D.position.set(tx,gy+0.1,tz);D.rotation.set(0,oa,0);D.scale.set(1,1,1);D.updateMatrix();
           ridge.setMatrixAt(n,D.matrix);n++;}
         // A fire and three puffs of smoke to a camp, and ninety camps is three hundred and sixty separate
         // meshes for something the size of a tent. They are instances: the animation writes matrices.
         fires2.push({x:ox,y:groundH(ox,oz),z:oz,ph:HR()*6.28});
         for(let d2=0;d2<3;d2++)smoke2.push({x:ox,y:groundH(ox,oz),z:oz,ph:(d2+HR())/3});
         flying.camps++;}
       tent.count=ridge.count=n;tent.frustumCulled=ridge.frustumCulled=false;
       add(tent,ridge);flying.tents=n;
       if(fires2.length){
         fireInst=new THREE.InstancedMesh(new THREE.ConeGeometry(2.2,5,6).translate(0,2.5,0),emberM,fires2.length);
         fireInst.count=fires2.length;fireInst.frustumCulled=false;fireInst.userData.noWire=true;add(fireInst);
         smokeInst=new THREE.InstancedMesh(new THREE.SphereGeometry(5,7,5),dustM,smoke2.length);
         smokeInst.count=smoke2.length;smokeInst.frustumCulled=false;smokeInst.userData.noWire=true;add(smokeInst);
       }}}

    // a wall tower near this angle on the circle of radius rr, not yet taken: the roof of the smallest, tallest
    // footprint the ring passes through - the towers are twelve metres square and stand eight over the wall
    const takenTowers=new Set();ctx.siege.engineSpots=[];
    const onTower=(cx0,cz0,rr,a)=>{
      for(let k=0;k<=200;k++){const da=(k%2?1:-1)*Math.ceil(k/2)*0.002;
        for(const off of [4,0]){const r=rr-off,x=cx0+Math.cos(a+da)*r,z=cz0+Math.sin(a+da)*r;
          let best=null;for(const b of api.buildingsAt(x,z,0))if(api.inPoly(x,z,b.ring)&&b.x1-b.x0<22&&b.z1-b.z0<22&&(!best||b.h>best.h))best=b;
          if(best&&!takenTowers.has(best)&&best.h>groundH(x,z)+12){takenTowers.add(best);
            const p=[(best.x0+best.x1)/2,best.h,(best.z0+best.z1)/2];ctx.siege.engineSpots.push(p);return p;}}}
      return null;};
    // ---- the engines ----
    // A counterweight trebuchet: two legs, a beam on a pivot with the weight on the short arm, and a base.
    // It winds down, hangs a moment, and throws; the stone leaves the sling at the top of the swing.
    //
    // They stand on both sides. The besiegers' are out on the plain throwing in; the city's own are up on
    // its circles throwing back, which is the half of a siege that a ring of engines round a silent city
    // leaves out. A defending engine is smaller - it has a wall to stand on, not a field - and it aims out
    // at whatever is in front of it.
    const mkEngine=(ex,ez,ey,ang,outward,scl)=>{
      const g=new THREE.Group(),k2=scl||1,bits=[];
      const base=new THREE.Mesh(new THREE.BoxGeometry(7*k2,1.6*k2,16*k2).translate(0,0.8*k2,0),woodM);bits.push(base);
      for(const sd of [-1,1]){
        const leg=new THREE.Mesh(new THREE.BoxGeometry(1.1*k2,15*k2,1.1*k2).translate(0,7.5*k2,0),woodM);
        leg.position.set(sd*2.6*k2,1.2*k2,0);leg.rotation.z=-sd*0.16;bits.push(leg);}
      fold(g,bits);
      const pivot=new THREE.Group();pivot.position.set(0,15*k2,0);g.add(pivot);
      const arm=[];
      const beam=new THREE.Mesh(new THREE.BoxGeometry(1.0*k2,1.0*k2,26*k2).translate(0,0,-7*k2),woodM);arm.push(beam);
      const wt=new THREE.Mesh(new THREE.BoxGeometry(3.6*k2,3.6*k2,3.6*k2),ironM);wt.position.set(0,-0.6*k2,5.5*k2);arm.push(wt);
      fold(pivot,arm);
      g.position.set(ex,ey,ez);g.rotation.y=-ang+(outward?Math.PI/2:-Math.PI/2);
      add(g);
      engines.push({pivot,x:ex,y:ey,z:ez,a:ang,out:!!outward,k:k2,next:HR()*9000,fired:false});flying.engines++;};
    {const NE=S.engines||0;
     for(let e=0;e<NE;e++){
       const a=A0+(A1-A0)*((e+0.5)/NE)+(HR()-0.5)*0.05;
       const rr=R0*(0.78+HR()*0.18);
       const ex=ccx+Math.cos(a)*rr, ez=ccz+Math.sin(a)*rr;
       mkEngine(ex,ez,groundH(ex,ez),a,false,1);}
     // the city's own, on the circles, throwing back
     const DF=S.defenders||0;
     for(let e=0;e<DF;e++){
       const a=A0+(A1-A0)*((e+0.5)/DF)+(HR()-0.5)*0.08;
       // on whichever circle it belongs to. The ground under a tier is already at that tier's height -
       // adding the lift again put the city's engines a hundred metres over their own walls.
       const ring=Math.floor(HR()*(S.rings||3));
       const rr=(S.wall||560)-40-ring*(S.ringStep||66);
       // A city whose walls have towers on them (defendOn: "towers") puts its engines up on the towers, which
       // is where they stood: the one nearest this angle on this circle that has not got one, on its roof,
       // throwing out. Placed at the foot of the circle instead, on the line of the wall, they stood half in
       // the wall and half in the air, because that is exactly where the ground steps up a tier.
       if(S.defendOn==='towers'&&api.buildingsAt){
         const spot=onTower(ccx,ccz,rr,a);
         if(spot){mkEngine(spot[0],spot[2],spot[1],Math.atan2(spot[2]-ccz,spot[0]-ccx),true,0.62);continue;}
         continue;}                                    // no tower free on this stretch: this one is not built
       const ex=ccx+Math.cos(a)*rr, ez=ccz+Math.sin(a)*rr;
       mkEngine(ex,ez,groundH(ex,ez)+(S.ringY||0),a,true,0.62);}}


    // ---- the siege towers ----
    // Timber, four storeys, hides nailed over the face that is going to be shot at, and a drawbridge at the
    // top waiting to come down on the parapet. They do not move: a tower that trundled would need the whole
    // ground to be right, and standing ones drawn up against the wall are what the pictures show anyway.
    {const NT=S.towers||0;
     const hideM=new THREE.MeshLambertMaterial({color:0x53463a,flatShading:true});
     for(let k=0;k<NT;k++){
       const a=A0+(A1-A0)*((k+0.5)/NT)+(HR()-0.5)*0.09;
       const rr=(S.wall||560)+50+HR()*90;
       const ex=ccx+Math.cos(a)*rr, ez=ccz+Math.sin(a)*rr, gy=groundH(ex,ez);
       const g=new THREE.Group(), bits=[], H2=30+HR()*14, WD=13;
       // four storeys of open timber with a floor between each, so it reads as a frame and not an obelisk
       for(let f=0;f<4;f++){
         const w2=WD*(1-f*0.05), hh=H2/4;
         const floor=new THREE.Mesh(new THREE.BoxGeometry(w2,1.1,w2),woodM);floor.position.y=f*hh;bits.push(floor);
         for(const sd of [-1,1])for(const fr of [-1,1]){
           const post=new THREE.Mesh(new THREE.BoxGeometry(1.3,hh,1.3).translate(0,hh/2,0),woodM);
           post.position.set(sd*w2*0.44,f*hh,fr*w2*0.44);bits.push(post);}
         for(const sd of [-1,1]){
           const br=new THREE.Mesh(new THREE.BoxGeometry(0.7,Math.hypot(hh,w2*0.88),0.7).translate(0,hh/2,0),woodM);
           br.position.set(sd*w2*0.44,f*hh,-w2*0.44);br.rotation.x=Math.atan2(w2*0.88,hh)*(f%2?1:-1);bits.push(br);}
         const side=new THREE.Mesh(new THREE.BoxGeometry(0.4,hh*0.9,w2*0.96),f<3?woodM:hideM);
         side.position.set(WD*0.5,f*hh+hh*0.45,0);bits.push(side);}
       for(const sd of [-1,1])for(const fr of [-1,1]){
         const wh=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,1.2,10).rotateZ(Math.PI/2),woodM);
         wh.position.set(sd*(WD/2+0.4),2.2,fr*(WD/2-1.2));bits.push(wh);}
       const face=new THREE.Mesh(new THREE.BoxGeometry(WD*1.04,H2*0.96,0.6),hideM);
       face.position.set(0,H2*0.46,-WD/2-0.3);bits.push(face);
       const bridge=new THREE.Mesh(new THREE.BoxGeometry(WD*0.8,0.5,10).translate(0,0,-5),woodM);
       bridge.position.set(0,H2,-WD/2);bridge.rotation.x=-0.5-HR()*0.5;bits.push(bridge);
       fold(g,bits);
       g.position.set(ex,gy,ez);g.rotation.y=aim(ex,ez);
       add(g);flying.towers++;}}

    // ---- Grond ----
    // The hammer of the underworld: a ram of black steel a hundred feet long, slung in chains under a frame
    // on wheels, with a wolf's head on the end of it, drawn up to the Great Gate. It swings back, comes
    // forward, and the whole thing shudders. Everything else in this scene is a crowd; this is one object,
    // and it gets built properly.
    if(S.grond){
      const G=S.grond, gx=G.at?G.at[0]:ccx+((S.wall||560)+110), gz=G.at?G.at[1]:ccz;
      const gy=groundH(gx,gz);
      const g=new THREE.Group();
      const steelM=new THREE.MeshLambertMaterial({color:0x17161a,flatShading:true});
      const emberM2=new THREE.MeshBasicMaterial({color:0xff5a1e,transparent:true,opacity:0.9,depthWrite:false});
      const L2=G.length||34, RAD=G.radius||2.4;
      // the carriage
      const bed=new THREE.Mesh(new THREE.BoxGeometry(11,2.2,L2*1.15).translate(0,1.1,0),woodM);g.add(bed);
      for(let w2=0;w2<8;w2++){const sd=w2%2?1:-1;
        const wh=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,1.8,12).rotateZ(Math.PI/2),woodM);
        wh.position.set(sd*5.6,3.4,(Math.floor(w2/2)-1.5)*L2*0.26);g.add(wh);}
      // the gantry it hangs from
      for(const fr of [-1,1])for(const sd of [-1,1]){
        const leg=new THREE.Mesh(new THREE.BoxGeometry(1.6,17,1.6).translate(0,8.5,0),woodM);
        leg.position.set(sd*4.6,2.2,fr*L2*0.3);leg.rotation.z=-sd*0.12;g.add(leg);}
      for(const fr of [-1,1]){
        const beam=new THREE.Mesh(new THREE.BoxGeometry(11,1.4,1.4),woodM);beam.position.set(0,19,fr*L2*0.3);g.add(beam);}
      // the ram itself, on its own pivot so it can swing
      const swing=new THREE.Group();swing.position.set(0,19,0);g.add(swing);
      for(const fr of [-1,1]){const ch=new THREE.Mesh(new THREE.BoxGeometry(0.4,8,0.4).translate(0,-4,0),ironM);
        ch.position.set(0,0,fr*L2*0.3);swing.add(ch);}
      const ram=new THREE.Group();ram.position.y=-8;swing.add(ram);
      const shaft=new THREE.Mesh(new THREE.CylinderGeometry(RAD,RAD*1.1,L2,12).rotateX(Math.PI/2),steelM);
      ram.add(shaft);
      for(let b2=0;b2<7;b2++){const band=new THREE.Mesh(new THREE.CylinderGeometry(RAD*1.14,RAD*1.14,0.7,12).rotateX(Math.PI/2),ironM);
        band.position.z=-L2/2+3+b2*(L2-6)/6;ram.add(band);}
      // the wolf's head
      const head=new THREE.Group();head.position.z=-L2/2-1.6;ram.add(head);
      const skull=new THREE.Mesh(new THREE.BoxGeometry(RAD*2.2,RAD*2.1,RAD*2.6),steelM);skull.position.z=-RAD*1.1;head.add(skull);
      const snout=new THREE.Mesh(new THREE.BoxGeometry(RAD*1.3,RAD*1.1,RAD*2.4).translate(0,0,-RAD*1.2),steelM);
      snout.position.set(0,-RAD*0.4,-RAD*2.2);head.add(snout);
      for(const sd of [-1,1]){
        const ear=new THREE.Mesh(new THREE.ConeGeometry(RAD*0.45,RAD*1.3,4),steelM);
        ear.position.set(sd*RAD*0.7,RAD*1.3,-RAD*0.6);head.add(ear);
        const eye=new THREE.Mesh(new THREE.SphereGeometry(RAD*0.26,7,5),emberM2);
        eye.position.set(sd*RAD*0.72,RAD*0.45,-RAD*2.1);eye.userData.noWire=true;head.add(eye);}
      for(let t2=0;t2<9;t2++){const tooth=new THREE.Mesh(new THREE.ConeGeometry(RAD*0.15,RAD*0.6,4),ironM);
        tooth.rotation.x=Math.PI;tooth.position.set((t2%5-2)*RAD*0.3,t2<5?-RAD*0.55:-RAD*1.0,-RAD*3.2);head.add(tooth);}
      // the trolls on the drag ropes
      const tb=new THREE.InstancedMesh(new THREE.BoxGeometry(2.6,5.6,2.1).translate(0,2.8,0),fleshM,G.trolls||34);
      for(let t2=0;t2<(G.trolls||34);t2++){
        const side=t2%2?1:-1;
        D.position.set(side*(7+HR()*5),0,L2*0.6+HR()*46);D.rotation.set(0,(HR()-0.5)*0.4,0);
        D.scale.set(1,0.9+HR()*0.3,1);D.updateMatrix();tb.setMatrixAt(t2,D.matrix);}
      tb.count=G.trolls||34;tb.frustumCulled=false;g.add(tb);
      g.position.set(gx,gy,gz);
      g.rotation.y=-Math.atan2(ccz-gz,ccx-gx)-Math.PI/2;    // the head points at the gate
      add(g);
      const dust=[];for(let d2=0;d2<6;d2++){const p=new THREE.Mesh(new THREE.SphereGeometry(7,7,5),dustM);
        p.userData.noWire=true;p.visible=false;add(p);dust.push(p);}
      let beat=0;
      animHooks.push(now=>{if(ctx.war===false)return;
        const T2=G.period||5200, u=((now%T2)/T2);
        // back slowly, forward fast, and a shudder through the frame on the stroke
        const sw=u<0.72?-0.5*Math.sin(u/0.72*Math.PI*0.5):-0.5+0.62*Math.sin((u-0.72)/0.28*Math.PI*0.5);
        swing.rotation.x=sw;
        const hitU=(u>0.96)?(u-0.96)/0.04:0;
        g.position.set(gx+(hitU?(HR()-0.5)*1.4:0),gy,gz);
        if(u>0.96&&beat!==Math.floor(now/T2)){beat=Math.floor(now/T2);
          dust.forEach((p,i)=>{p.visible=true;p.userData.t0=now+i*90;});}
        for(const p of dust){if(!p.visible)continue;const t3=(now-(p.userData.t0||0))/2600;
          if(t3<0)continue;if(t3>1){p.visible=false;continue;}
          const a2=Math.atan2(ccz-gz,ccx-gx);
          p.position.set(gx+Math.cos(a2)*(60+t3*40),gy+6+t3*26,gz+Math.sin(a2)*(60+t3*40));
          p.scale.setScalar(0.6+t3*3.4);}
      });
      flying.grond=1;
    }

    // ---- the Rohirrim ----
    // Six thousand riders drawn up on the north of the field, before the charge: still in their eoreds, a
    // wall of horses across the grass, with the host between them and the city. They are the one thing on
    // this field that is not Sauron's and the only reason the scene has a second colour in it.
    if(S.riders){
      const RD=S.riders, n=RD.n||6000, FL=RD.file||150, ST2=RD.step||3.6;
      const horseM=new THREE.MeshLambertMaterial({color:0x5a4434,flatShading:true});
      const mailM=new THREE.MeshLambertMaterial({color:0x8d8a84,flatShading:true});
      const g=new THREE.Group(), ranks=Math.ceil(n/FL);
      const horse=new THREE.InstancedMesh(new THREE.BoxGeometry(0.95,1.5,2.7).translate(0,1.15,0),horseM,n);
      const man=new THREE.InstancedMesh(new THREE.BoxGeometry(0.7,1.5,0.6).translate(0,0.75,0),mailM,n);
      const lance=new THREE.InstancedMesh(new THREE.BoxGeometry(0.11,4.4,0.11).translate(0,2.2,0),ironM,n);
      let m2=0;
      for(let rk=0;rk<ranks&&m2<n;rk++)for(let f=0;f<FL&&m2<n;f++){
        const px=(f-(FL-1)/2)*ST2+(HR()-0.5)*0.7, pz=-rk*ST2*1.5-(HR()-0.5)*0.6;
        D.position.set(px,0,pz);D.rotation.set(0,(HR()-0.5)*0.14,0);D.scale.set(1,1,1);D.updateMatrix();
        horse.setMatrixAt(m2,D.matrix);
        D.position.set(px,1.55,pz-0.2);D.updateMatrix();man.setMatrixAt(m2,D.matrix);
        D.position.set(px+0.42,1.9,pz-0.2);D.rotation.set(0,0,(HR()-0.5)*0.3-0.12);D.updateMatrix();
        lance.setMatrixAt(m2,D.matrix);m2++;}
      horse.count=man.count=lance.count=m2;
      horse.frustumCulled=man.frustumCulled=lance.frustumCulled=false;
      g.add(horse,man,lance);
      const rohanM=new THREE.MeshLambertMaterial({color:0x2e6a3a,side:THREE.DoubleSide});
      for(let b2=0;b2<14;b2++){const bx=(HR()-0.5)*FL*ST2*0.9,bz=-HR()*ranks*ST2*1.5;
        const pole=new THREE.Mesh(new THREE.BoxGeometry(0.2,10,0.2).translate(0,5,0),ironM);pole.position.set(bx,1.6,bz);
        const flag=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.4),rohanM);flag.position.set(bx+1.8,10.2,bz);
        g.add(pole,flag);}
      g.position.set(RD.at[0],groundH(RD.at[0],RD.at[1]),RD.at[1]);
      g.rotation.y=RD.facing!==undefined?RD.facing:(-Math.atan2(ccz-RD.at[1],ccx-RD.at[0])+Math.PI/2);
      add(g);ctx.siege.riders={g};flying.riders=m2;
    }

    // ---- what is in the air ----
    const NA=S.arrows===undefined?700:S.arrows;
    const shafts=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.22,7,4).rotateX(Math.PI/2),shaftM,NA);
    shafts.frustumCulled=false;shafts.count=NA;shafts.userData.noWire=true;add(shafts);
    for(let i=0;i<NA;i++)arrows.push({t:2});
    const NS=Math.max(1,((S.engines||0)+(S.defenders||0))*2);
    const rockM=new THREE.MeshLambertMaterial({color:0x5b554d,flatShading:true});
    const stoneMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.2,0),rockM,NS);
    stoneMesh.frustumCulled=false;stoneMesh.count=NS;add(stoneMesh);
    for(let i=0;i<NS;i++)stones.push({t:2});
    // The besiegers shoot fire. A stone wrapped in burning pitch is the whole point of throwing it into a
    // city roofed in timber and slate, and a lit one crossing the sky is the clearest possible signal that
    // the war is happening now rather than having happened. The flame rides the stone's own arc, a trail of
    // smoke comes off it, and where it lands something burns for a while.
    const flameM=new THREE.MeshBasicMaterial({color:0xffa23a,transparent:true,opacity:0.92,depthWrite:false,
      blending:THREE.AdditiveBlending});
    const fireMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(3.6,0),flameM,NS);
    fireMesh.frustumCulled=false;fireMesh.count=NS;fireMesh.userData.noWire=true;add(fireMesh);
    const trailM=new THREE.MeshBasicMaterial({color:0x201c19,transparent:true,opacity:0.3,depthWrite:false});
    const trails=[];
    for(let i=0;i<Math.min(110,NS*6);i++){const p=new THREE.Mesh(new THREE.SphereGeometry(4,6,5),trailM);
      p.visible=false;p.userData.noWire=true;add(p);trails.push(p);}
    const burnM=new THREE.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:0.9,depthWrite:false});
    const hits=[];
    for(let i=0;i<(S.hits||30);i++){const g=new THREE.Group();
      const f=new THREE.Mesh(new THREE.ConeGeometry(3.4,12,6),burnM);f.position.y=6;g.add(f);
      const sm=new THREE.Mesh(new THREE.SphereGeometry(7,7,5),trailM);sm.position.y=16;g.add(sm);
      g.visible=false;g.userData.noWire=true;add(g);hits.push({g,f,sm,t:2});}
    let hitN=0;

    const WALL=S.wall||560, WY=S.wallY||120;
    const launch=(pool,ax,ay,az,bx,by,bz,T,apex)=>{
      for(const q of pool)if(q.t>1){q.t=0;q.T=T;q.ax=ax;q.ay=ay;q.az=az;q.bx=bx;q.by=by;q.bz=bz;q.h=apex;
        q.fire=false;q.landed=false;return q;}
      return null;};
    const volley=(out,n)=>{
      const a=A0+(A1-A0)*HR();
      const wx=ccx+Math.cos(a)*WALL, wz=ccz+Math.sin(a)*WALL, wy=groundH(wx,wz)+WY;
      const r2=R0*(0.8+HR()*0.3), fx=ccx+Math.cos(a)*r2, fz=ccz+Math.sin(a)*r2, fy=groundH(fx,fz)+2;
      const j=()=>(HR()-0.5)*90;
      for(let i=0;i<n;i++){
        if(out)launch(arrows,wx+j()*0.3,wy,wz+j()*0.3,fx+j(),fy,fz+j(),2.6+HR()*0.8,120+HR()*60);
        else   launch(arrows,fx+j(),fy,fz+j(),wx+j()*0.4,wy,wz+j()*0.4,2.6+HR()*0.8,120+HR()*60);}};

    let nextV=0;
    animHooks.push(now=>{if(ctx.war===false)return;
      const dt=0.016;
      if(NA&&now>nextV){nextV=now+(S.volleyGap||1500)*(0.6+HR());volley(HR()<0.45,S.perVolley||70);}
      for(const q of engines){
        if(now>q.next){q.next=now+(S.reload||9000)*(0.7+HR()*0.8);q.t0=now;q.fired=false;}
        const u=q.t0===undefined?-1:(now-q.t0)/900;
        if(u>=0&&u<=1){q.pivot.rotation.x=-1.0+2.1*u*u;
          if(!q.fired&&u>0.72){q.fired=true;
            // out at the host on the plain, or in at the wall, depending which side it belongs to - and a city
            // can ask (overWall) for some of those to clear the wall and come down in its streets and on its
            // roofs, which is where a lit one does its work
            const over=!q.out&&HR()<(S.overWall||0);
            const rr=q.out?R0*(0.85+HR()*0.45):over?(S.cityR||WALL)*(0.25+HR()*0.7):(WALL-30);
            const tx=ccx+Math.cos(q.a+(over?(HR()-0.5)*0.5:0))*rr+(HR()-0.5)*(over?40:190), tz=ccz+Math.sin(q.a+(over?(HR()-0.5)*0.5:0))*rr+(HR()-0.5)*(over?40:190);
            const ty=over?Math.max(groundH(tx,tz),api.roofAt?api.roofAt(tx,tz)||0:0)+1:groundH(tx,tz)+(q.out?4:WY*0.8);
            const st=launch(stones,q.x,q.y+18*q.k,q.z,tx,ty,tz,3.4+HR(),200+HR()*90+(over?60:0));
            if(st)st.fire=!q.out&&HR()<(S.firePart===undefined?0.4:S.firePart);}}
        else q.pivot.rotation.x=-1.0;}
      const step=(pool,mesh,spin)=>{
        let i=0;
        for(const q of pool){
          if(q.t>1){D.position.set(0,-9999,0);D.scale.setScalar(0.0001);D.rotation.set(0,0,0);D.updateMatrix();mesh.setMatrixAt(i++,D.matrix);continue;}
          q.t+=dt/q.T;const u=Math.min(1,q.t);
          const x=q.ax+(q.bx-q.ax)*u, z=q.az+(q.bz-q.az)*u;
          const y=q.ay+(q.by-q.ay)*u+q.h*4*u*(1-u);
          const u2=Math.min(1,u+0.03);
          const x2=q.ax+(q.bx-q.ax)*u2, z2=q.az+(q.bz-q.az)*u2, y2=q.ay+(q.by-q.ay)*u2+q.h*4*u2*(1-u2);
          D.position.set(x,y,z);D.scale.setScalar(1);
          if(spin)D.rotation.set(q.t*9,q.t*7,0);else{D.rotation.set(0,0,0);D.lookAt(x2,y2,z2);}
          D.updateMatrix();mesh.setMatrixAt(i++,D.matrix);}
        mesh.instanceMatrix.needsUpdate=true;};
      step(arrows,shafts,false);step(stones,stoneMesh,true);
      {let i=0,ti=0;
       for(const q of stones){
         if(q.fire&&q.t>1&&!q.landed){q.landed=true;
           const h2=hits[hitN++%hits.length];h2.t=0;h2.g.position.set(q.bx,q.by,q.bz);h2.g.visible=true;
           if(ctx.onSiegeHit)ctx.onSiegeHit(q.bx,q.by,q.bz);}
         if(q.t>1||!q.fire){D.position.set(0,-9999,0);D.scale.setScalar(0.0001);D.rotation.set(0,0,0);}
         else{const u=Math.min(1,q.t),x=q.ax+(q.bx-q.ax)*u,z=q.az+(q.bz-q.az)*u,
                y=q.ay+(q.by-q.ay)*u+q.h*4*u*(1-u);
           D.position.set(x,y,z);D.rotation.set(now*0.004,now*0.003,0);
           D.scale.setScalar(0.8+0.35*Math.sin(now*0.02+q.t*9));
           if(ti<trails.length){const tr=trails[ti++];tr.visible=true;
             tr.position.set(x-(q.bx-q.ax)*0.014,y+4,z-(q.bz-q.az)*0.014);
             tr.scale.setScalar(0.7+q.t*2.4);}}
         D.updateMatrix();fireMesh.setMatrixAt(i++,D.matrix);}
       for(;ti<trails.length;ti++)trails[ti].visible=false;
       fireMesh.instanceMatrix.needsUpdate=true;}
      for(const q of hits){
        if(q.t>1)continue;
        q.t+=dt/(S.burnFor||22);
        if(q.t>1){q.g.visible=false;continue;}
        const f=1-q.t;
        q.f.scale.set(f*(0.8+0.3*Math.sin(now*0.01)),f*(0.9+0.4*Math.sin(now*0.013)),f);
        q.sm.scale.setScalar(0.8+q.t*3.4);q.sm.position.y=16+q.t*44;}
      const t=now/1000;
      if(fireInst){
        fires2.forEach((q,i)=>{D.position.set(q.x,q.y,q.z);D.rotation.set(0,0,0);
          D.scale.set(0.8+0.3*Math.sin(t*6+q.ph),0.8+0.5*Math.sin(t*9+q.ph),0.8+0.3*Math.cos(t*5+q.ph));
          D.updateMatrix();fireInst.setMatrixAt(i,D.matrix);});
        fireInst.instanceMatrix.needsUpdate=true;
        smoke2.forEach((q,i)=>{const u=((t*0.05)+q.ph)%1;
          D.position.set(q.x+u*26,q.y+4+u*40,q.z+u*9);D.rotation.set(0,0,0);D.scale.setScalar(0.4+u*2.2);
          D.updateMatrix();smokeInst.setMatrixAt(i,D.matrix);});
        smokeInst.instanceMatrix.needsUpdate=true;
      }
    });
  }

  // ---- the Nazgul, on their fellbeasts ----
  const riders=[];
  {const want=K.nazgul||0;
   for(let k=0;k<want;k++){
     const g=new THREE.Group(),S=K.wing||16;
     const body=new THREE.Mesh(new THREE.SphereGeometry(S*0.22,10,7),beastM);body.scale.set(2.0,0.8,0.9);g.add(body);
     const neck=new THREE.Mesh(new THREE.CylinderGeometry(S*0.05,S*0.11,S*0.7,6).rotateZ(Math.PI/2),beastM);
     neck.position.set(S*0.5,S*0.06,0);neck.rotation.z=0.25;g.add(neck);
     const head=new THREE.Mesh(new THREE.ConeGeometry(S*0.09,S*0.3,6).rotateZ(-Math.PI/2),beastM);
     head.position.set(S*0.86,S*0.13,0);g.add(head);
     const tail=new THREE.Mesh(new THREE.ConeGeometry(S*0.1,S*1.3,6).rotateZ(Math.PI/2),beastM);
     tail.position.set(-S*0.78,0,0);g.add(tail);
     const wings=[];
     for(const sd of [-1,1]){const w=new THREE.Group();
       const inner=new THREE.Mesh(new THREE.BoxGeometry(S*0.5,0.5,S*0.62).translate(0,0,sd*S*0.31),beastM);
       const outer=new THREE.Mesh(new THREE.BoxGeometry(S*0.32,0.4,S*0.66).translate(0,0,sd*S*0.33),beastM);
       outer.position.set(-S*0.06,0,sd*S*0.62);w.add(inner,outer);g.add(w);wings.push({w,sd});}
     const rider=new THREE.Mesh(new THREE.CylinderGeometry(S*0.06,S*0.09,S*0.34,6).translate(0,S*0.17,0),ironM);
     rider.position.set(0,S*0.16,0);g.add(rider);
     add(g);
     const around=K.circle||[0,0];
     riders.push({g,wings,cx:around[0]+(HR()-0.5)*(K.spread||120000),cz:around[1]+(HR()-0.5)*(K.spread||120000),
       r:(K.orbit||6000)*(0.5+HR()),y:(K.alt||900)+HR()*(K.altSpread||1800),
       a:HR()*6.28,v:(0.00016+HR()*0.00018)*(HR()<0.5?-1:1),ph:HR()*6.28,
       patrol:HR()<(K.patrol===undefined?0:K.patrol)});}
   // A fellbeast is about twenty metres across, and this map is six hundred and eighty kilometres wide. At
   // true size, from anywhere you would actually stand to look at Mordor, it is a fraction of a pixel - which
   // is why nobody could find them. So they are drawn at true size close up and grown with distance until
   // they hold a few pixels, the same bargain the mountains on the horizon make. minScreen is how many metres
   // of wing a page insists on seeing per kilometre of distance; a city-sized map leaves it at nought.
   const GROW=K.grow===undefined?(B.w>120000?3200:0):K.grow;
   animHooks.push(now=>{if(ctx.war===false)return;
     for(const q of riders){
       // Most of them patrol wherever anyone is standing, because that is the only way to see one. The land is
       // six hundred and eighty kilometres across; a fellbeast circling a fixed point is a pixel from anywhere
       // you would actually look at Mordor from, and half the time it is over the horizon. So their circles
       // drift after the camera, at a pace slow enough that you catch them arriving rather than find them
       // pinned overhead. The rest stay where they were put - over Barad-dur, over the plateau.
       if(q.patrol){const k=Math.min(1,0.00016*16.7);
         q.cx+=(camera.position.x-q.cx)*k;q.cz+=(camera.position.z-q.cz)*k;}
       const a=q.a+now*q.v,x=q.cx+Math.cos(a)*q.r,z=q.cz+Math.sin(a)*q.r;
       const y=groundH(x,z)+q.y+Math.sin(now*0.0004+q.ph)*60;
       q.g.position.set(x,y,z);
       q.g.rotation.set(0,-a-(q.v>0?Math.PI/2:-Math.PI/2),0.18*(q.v>0?1:-1));
       if(GROW){const d=camera.position.distanceTo(q.g.position);
         q.g.scale.setScalar(Math.min(K.growMax||14,Math.max(1,d/GROW)));}
       if(ctx.details&&q===riders[0]&&now-(ctx._nT||0)>1000){ctx._nT=now;
         ctx.details.nazgulAt=Math.round(x)+','+Math.round(y)+','+Math.round(z)+' x'+q.g.scale.x.toFixed(1);}
       const beat=Math.sin(now*0.0016+q.ph);
       for(const w of q.wings)w.w.rotation.x=w.sd*beat*0.55;}});}

  // ---- lightning in the pall ----
  if(K.lightning){
    const boltM=new THREE.MeshBasicMaterial({color:0xdfe6ff,transparent:true,opacity:0});
    const bolts=[];
    for(let k=0;k<4;k++){const g=new THREE.Group();
      let x=0,y=0;
      for(let s2=0;s2<9;s2++){const seg=new THREE.Mesh(new THREE.BoxGeometry(90,1400,90),boltM);
        x+=(HR()-0.5)*1400;y-=1400;seg.position.set(x,y,0);seg.rotation.z=(HR()-0.5)*0.4;g.add(seg);}
      g.visible=false;add(g);bolts.push(g);}
    const flashLight=new THREE.HemisphereLight(0xcfd8ff,0x40342c,0);add(flashLight);
    let next=0,active=null,t0=0;
    animHooks.push(now=>{if(ctx.war===false)return;
      if(now>next&&!active){next=now+(K.lightningGap||2600)*(0.5+HR()*1.6);
        active=bolts[Math.floor(HR()*bolts.length)];t0=now;
        const bx=B.cx+(HR()-0.5)*B.w*0.8,bz=B.cz+(HR()-0.5)*B.d*0.8;
        active.position.set(bx,groundH(bx,bz)+16000,bz);active.visible=true;}
      if(active){const u=(now-t0)/260;
        if(u>1){active.visible=false;active=null;boltM.opacity=0;flashLight.intensity=0;}
        else{const f=(u<0.12?1:Math.max(0,1-(u-0.12)/0.88))*(HR()<0.25?0.35:1);
          boltM.opacity=f;flashLight.intensity=f*(K.flash||0.55);}}});}

  ctx.hostAt=()=>armies.map(a=>[Math.round(a.g.position.x),Math.round(a.g.position.z)]);   // for aiming a camera
  ctx.details=Object.assign(ctx.details||{},{hostAt:armies.slice(0,2).map(a=>Math.round(a.g.position.x)+','+Math.round(a.g.position.z)).join(' | '),hosts:armies.length,
    hostStrength:armies.reduce((s,a)=>s+(K.perArmy||4000),0),camped:(K.camped||[]).length,
    campedStrength:(K.camped||[]).length*(K.campedPer||4000),trolls:(K.trolls||0)*armies.length,
    engines:(K.engines||0)*armies.length,wains:(K.wains||0)*armies.length,nazgul:riders.length,
    siegeBlocks:flying.blocks,siegeCamps:flying.camps,tents:flying.tents,siegeEngines:flying.engines,
    siegeTowers:flying.towers,rohirrim:flying.riders,grond:flying.grond});
}
