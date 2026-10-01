// ---------- what happens during the siege ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// The siege on this page is always going on - the engines throw, the arrows go both ways, Grond swings - but
// nothing in it ever happens. These are the things that do, every minute or two on their own or from the
// Events button (src/core/happenings.js; #event=<name> in the address). They are the siege's, so they only
// come in war: peace stops them, puts back anything they moved, and takes away anything they brought.
//
//   steward   the Steward on fire: out of the Citadel, along the top of the rock at a run, and off the point
//             of it, seven hundred feet over the first circle
//   charge    the horns of Rohan: the riders who have stood on the north of the field all this time come down
//             on the host at the gallop, the blocks in the way of it break, and they wheel and re-form
//   nazgul    a fellbeast stooping on the walls, low along the first circle, and the light going out of the
//             day as it passes
//   rider     Faramir's company falling back across the Pelennor with the Nazgul on them, and the White Rider
//             coming out of the Gate to meet them with a light that drives the Nazgul off
//   mumakil   the great beasts of Harad coming up out of the south with towers on their backs
//   ships     black sails on the Anduin: the Corsairs, coming up to the Harlond - until the first of them breaks
//             out a banner, and it is not theirs
//   gate      the Gate broken: Grond's three strokes, the doors bursting in at the third, the black rider under
//             the arch and one waiting for him there - and then horns in the north, and the Rohirrim charge
//   tower     a siege tower rolled up to the first wall, its bridge let down on the parapet, and then fired
//             from the walls until it burns and goes over
//   dead      the Dead Men of Dunharrow, off the black ships once they are in, across the Pelennor like a tide to
//             the Mumakil, which go down under them - and then, their oath kept, gone. The ships bring them
//
// And one in peace, from its own Events button: the coronation of the King in the Court of the Fountain.
//
// Whatever moves, "Go and look" follows (happenings.js). What they leave behind - a scorch where something
// burned - goes onto the war's decals (decals.js, ctx.decals).
import { mkRng } from '../core/rng.js';
import { createHappenings } from '../core/happenings.js';
import { createDust } from '../core/dust.js';

export function events(api){
  const {THREE,C,ctx,scene,groundH,roofAt,P,hemi,ambient,sun,mergeParts}=api;
  const R=mkRng(Date.now()%100000);
  const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const own=o=>{o.traverse(q=>{q.userData.noFingerprint=true;});scene.add(o);return o;};
  // A beast or a ship is thirty-odd pieces, and six of them is two hundred draw calls for something that moves
  // as one thing. What does not move on its own - everything that is a direct child mesh - is merged by
  // material; the legs, the trunk, the wings stay separate because they are groups.
  const fold=g=>{const by=new Map();
    for(const m of g.children.slice())if(m.isMesh&&!m.isInstancedMesh){let a=by.get(m.material);if(!a){a=[];by.set(m.material,a);}a.push(m);g.remove(m);}
    for(const [mat,list] of by)g.add(mergeParts(list,mat));return g;};
  const land=(x,z)=>Math.max(groundH(x,z),roofAt(x,z)||0);
  const smoke=createDust(api,{max:6000,size:16,color:0x2b2724,drag:0.6,gravity:-2.4,wind:[3,0,1]});
  const embers=createDust(api,{max:3000,size:2.4,color:0xffa446,drag:0.9,gravity:-0.8,wind:[2,0,1]});
  const dust=createDust(api,{max:9000,size:38,color:0x8c8266,drag:0.5,gravity:1.2,wind:[3,0,1.5]});
  let H=null;

  // Every event's per-frame work goes through here: if the page goes to peace while it is running, it stops
  // and `end` puts things back.
  const go=(fn,end)=>H.run((now,dt)=>{
    if(ctx.war===false){end&&end();return false;}
    const r=fn(now,dt);if(r===false&&end)end();return r;});

  // Two lights, there from the start at nothing. A light added while the page runs changes the light count
  // and every material on the page recompiles at once, which is a second's stall in the middle of the event.
  const fireLight=new THREE.PointLight(0xff8a30,0,160,1.4);scene.add(fireLight);
  const whiteLight=new THREE.PointLight(0xe8f0ff,0,700,1.2);scene.add(whiteLight);

  const flameM=new THREE.MeshBasicMaterial({color:0xff9a32,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending});
  const coreM=new THREE.MeshBasicMaterial({color:0xffe39a,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending});
  const ironM=new THREE.MeshLambertMaterial({color:0x2a2a2e,flatShading:true});
  const beastM=new THREE.MeshLambertMaterial({color:0x34313a,flatShading:true,side:THREE.DoubleSide});

  // ---- a fellbeast ----
  // Built facing +z so that lookAt points it where it is going. Wings are membranes rather than boards: a
  // triangle fan from the shoulder to the elbow to the tip, which is what reads as a wing against the sky.
  function makeBeast(S){
    const g=new THREE.Group();
    const m=(geo,x,y,z)=>{const q=new THREE.Mesh(geo,beastM);q.position.set(x,y,z);g.add(q);return q;};
    m(new THREE.SphereGeometry(S*0.2,10,7),0,0,0).scale.set(0.9,0.8,2.0);
    m(new THREE.CylinderGeometry(S*0.05,S*0.1,S*0.7,6).rotateX(Math.PI/2),0,S*0.08,S*0.5);
    m(new THREE.ConeGeometry(S*0.08,S*0.3,6).rotateX(Math.PI/2),0,S*0.12,S*0.95);
    m(new THREE.ConeGeometry(S*0.09,S*1.3,6).rotateX(-Math.PI/2),0,0,-S*0.9);
    const rider=m(new THREE.CylinderGeometry(S*0.05,S*0.09,S*0.34,6).translate(0,S*0.17,0),0,S*0.14,S*0.05);rider.material=ironM;
    const wings=[];
    for(const sd of [-1,1]){
      const w=new THREE.Group();w.position.set(sd*S*0.12,S*0.05,0);g.add(w);
      const v=[[0,0,S*0.3],[sd*S*0.6,0,S*0.38],[sd*S*1.2,0,-S*0.1],[sd*S*0.7,0,-S*0.45],[0,0,-S*0.35]];
      const tri=[0,1,4, 1,3,4, 1,2,3].map(i=>v[i]).flat();
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(tri,3));geo.computeVertexNormals();
      w.add(new THREE.Mesh(geo,beastM));wings.push({w,sd});}
    fold(g);
    return {g,flap(now,k){const b=Math.sin(now*0.004);for(const q of wings)q.w.rotation.z=q.sd*b*(k===undefined?0.55:k);}};}

  // ---- horsemen ----
  // A company as one object: instanced horses and riders in a local frame, facing +z, moved as a whole.
  function makeCompany(n,file,step,horseCol,manCol){
    const g=new THREE.Group(),D=new THREE.Object3D();
    const horse=new THREE.InstancedMesh(new THREE.BoxGeometry(0.95,1.5,2.7).translate(0,1.15,0),new THREE.MeshLambertMaterial({color:horseCol,flatShading:true}),n);
    const man=new THREE.InstancedMesh(new THREE.BoxGeometry(0.7,1.5,0.6).translate(0,0.75,0),new THREE.MeshLambertMaterial({color:manCol,flatShading:true}),n);
    for(let i=0;i<n;i++){const px=(i%file-(file-1)/2)*step+(R()-0.5)*0.8,pz=-Math.floor(i/file)*step*1.4+(R()-0.5)*0.8;
      D.position.set(px,0,pz);D.rotation.set(0,(R()-0.5)*0.2,0);D.updateMatrix();horse.setMatrixAt(i,D.matrix);
      D.position.set(px,1.55,pz-0.2);D.updateMatrix();man.setMatrixAt(i,D.matrix);}
    horse.frustumCulled=man.frustumCulled=false;g.add(horse,man);return g;}

  // ---- the Steward ----
  // The book burns him on a pyre in the House of the Stewards; this is the other telling, the one where he
  // comes out of the Citadel on fire and runs the length of the rock. The rock is ctx.keel (landmarks.js),
  // so he runs on its crest and goes off the parapet at the point. A man is two metres and the prow is half a
  // kilometre from anywhere you would watch it from, so he is drawn at more than twice that, and it is the fire
  // that you actually follow.
  function makeSteward(){
    const g=new THREE.Group();
    const robe=new THREE.MeshLambertMaterial({color:0x201b18,flatShading:true});
    const m=(geo,mat,par)=>{const q=new THREE.Mesh(geo,mat);(par||g).add(q);return q;};
    m(new THREE.CylinderGeometry(0.2,0.44,0.98,7).translate(0,0.96,0),robe);
    m(new THREE.SphereGeometry(0.17,8,6).translate(0,1.62,0),robe);
    const limb=(x,y,len)=>{const p=new THREE.Group();p.position.set(x,y,0);g.add(p);m(new THREE.BoxGeometry(0.13,len,0.13).translate(0,-len/2,0),robe,p);return p;};
    const arms=[limb(-0.28,1.38,0.66),limb(0.28,1.38,0.66)],legs=[limb(-0.12,0.72,0.72),limb(0.12,0.72,0.72)];
    const flames=[];
    for(let k=0;k<7;k++){const big=k===0;
      const f=m(new THREE.ConeGeometry(big?0.55:0.3,big?2.8:1.4,6).translate(0,big?1.4:0.7,0),k%3===2?coreM:flameM);
      f.position.set(big?0:(R()-0.5)*0.6,big?1.2:0.3+R()*1.2,big?0:(R()-0.5)*0.4);flames.push({f,ph:R()*6.28,s:1});}
    g.scale.setScalar(2.4);
    return {g,arms,legs,flames};}
  function steward(){
    const K=ctx.keel;if(!K)return;
    // down the middle of the top, where it narrows to the point, and over the battlement where it meets
    const u0=150,Z=0,TIP=K.tip-3;
    const top=()=>K.TOP+0.1;
    const s=makeSteward();own(s.g);s.g.rotation.y=Math.PI/2;
    let x=u0,y=top(u0),z=Z,v=0,vx=0,vy=0,t=0,phase='light',ph=0,tLand=0,fire=0;
    let alive=true;
    H.notice('The Steward','- Denethor, burning, out of the Citadel and running east along the top of the rock, towards the point of it and the drop over the Gate.',
      // from above and to the north: the battlement runs along both edges of the top, and from the side it
      // hides him the whole way
      ()=>[290,480,-300,420,225,0],()=>alive?s.g.position:null);
    const end=()=>{alive=false;scene.remove(s.g);fireLight.intensity=0;};
    go((now,dt)=>{t+=dt;
      if(phase==='light'){fire=Math.min(1,t/2.2);if(t>2.4)phase='run';}
      else if(phase==='run'){
        v=Math.min(12.5,v+dt*9);x+=v*dt;ph+=dt*v*0.95;
        z=Z+Math.sin(t*1.7)*1.2*Math.min(1,K.HW(Math.min(x,K.EAST))/8);y=top(x);
        s.legs[0].rotation.x=Math.sin(ph)*0.9;s.legs[1].rotation.x=-Math.sin(ph)*0.9;
        s.arms.forEach((a,i)=>{const sd=i?1:-1;a.rotation.x=-1.4+Math.sin(ph*1.3+i*2)*1.1;a.rotation.z=sd*(0.5+0.4*Math.sin(ph*0.9+i));});
        s.g.rotation.z=Math.sin(t*1.7)*0.12;
        if(x>=TIP){phase='fall';vx=9;vy=4.5;
          H.notice('Over the edge','- off the point of the rock, over the parapet, and down the whole height of the city.',null);}}
      else if(phase==='fall'){
        x+=vx*dt;vy-=9.8*dt;y+=vy*dt;s.g.rotation.x+=dt*1.6;
        s.arms.forEach((a,i)=>{a.rotation.x=-2.6;a.rotation.z=(i?1:-1)*1.2;});
        const L=land(x,z);
        if(y<=L){y=L;phase='down';tLand=t;s.g.rotation.set(Math.PI/2,Math.PI/2,0);
          for(let k=0;k<220;k++){const a=R()*Math.PI*2,sp=4+R()*14;embers.emit(x,y+1,z,Math.cos(a)*sp,6+R()*16,Math.sin(a)*sp,1.5+R()*2.5,2+R()*2);}
          for(let k=0;k<40;k++)smoke.emit(x+(R()-0.5)*6,y+2,z+(R()-0.5)*6,(R()-0.5)*4,2+R()*4,(R()-0.5)*4,6+R()*6,14+R()*10);
          if(ctx.decals)ctx.decals.scorch(x,y,z,7);}}
      else{fire=Math.max(0,1-(t-tLand)/16);if(fire<=0)return false;}
      s.g.position.set(x,y,z);
      // the fire on him: flickering, leaning back off him as he runs, and what comes off it
      const lean=-0.9*(v/12.5)*(phase==='run'?1:0);
      for(const q of s.flames){const k=fire*(0.75+0.35*Math.sin(now*0.02+q.ph)+0.2*Math.sin(now*0.031+q.ph*2));
        q.f.scale.set(k,k*(1.1+0.3*Math.sin(now*0.017+q.ph)),k);q.f.rotation.x=lean;}
      const wp=new THREE.Vector3(0,1.4,0);s.g.localToWorld(wp);
      if(fire>0.05){
        for(let k=0;k<3;k++)embers.emit(wp.x+(R()-0.5)*1.5,wp.y+(R()-0.5)*1.5,wp.z+(R()-0.5)*1.5,-v*0.3+(R()-0.5)*3,2+R()*4,(R()-0.5)*3,0.8+R()*1.4,1.6+R()*1.6);
        if(R()<0.5*fire+0.2)smoke.emit(wp.x,wp.y+2,wp.z,-v*0.2,2+R()*2,(R()-0.5),4+R()*4,6+R()*6);}
      fireLight.position.copy(wp);fireLight.intensity=fire*(2.2+0.6*Math.sin(now*0.025));
    },end);}

  // ---- the horns of Rohan ----
  // The riders are the ones hosts.js drew up on the north of the field (ctx.siege.riders), facing the city
  // along their own +z. They come down that line at a walk, a trot and then the gallop, and stop in the
  // middle of the host; the blocks near the front of it are pushed off the line, and when the riders wheel
  // and go back, the blocks close up again behind them.
  let charging=false;
  function charge(){
    const S=ctx.siege;if(!S||!S.riders||charging)return;
    const g=S.riders.g,hx=g.position.x,hz=g.position.z,ry=g.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);
    const D0=Math.max(600,Math.hypot(hx,hz)-1500),VMAX=38,W=270;
    const blocks=S.blocks.map(b=>({b,x:b.position.x,z:b.position.z,ox:0,oz:0}));
    charging=true;
    let t=0,s=0,v=0,phase='horns',turn=0,tp=0;
    const at=()=>[hx+fx*s,hz+fz*s];
    H.notice('The horns of Rohan','- the riders of the Mark have stood on the north of the field all this time. The horns go up, and six thousand of them come down on the flank of the host.',
      // Close, off their flank, and following: a horse is a metre and a half, and from a kilometre and a half
      // the whole six thousand are not there.
      ()=>{const [cx,cz]=at(),gy=groundH(cx,cz);return [cx-fz*420-fx*160,gy+130,cz+fx*420-fz*160,cx+fx*120,gy,cz+fz*120];},
      ()=>{if(!charging)return null;const [cx,cz]=at();return [cx,groundH(cx,cz),cz];});
    const put=()=>{const [cx,cz]=at();g.position.set(cx,groundH(cx,cz),cz);g.rotation.y=ry+turn;};
    const end=()=>{s=0;turn=0;put();for(const q of blocks)q.b.position.set(q.x,groundH(q.x,q.z),q.z);charging=false;};
    go((now,dt)=>{t+=dt;
      if(phase==='horns'){if(t>5)phase='charge';}
      else if(phase==='charge'){
        const left=D0-s;v=left<160?Math.max(2,VMAX*left/160):Math.min(VMAX,v+dt*(v<8?3:6));s=Math.min(D0,s+v*dt);
        if(left<220&&!tp){tp=1;H.notice('Into the host','- and the host breaks where they hit it. The blocks nearest the line of it are running.',null);}
        if(s>=D0-0.5){phase='hold';tp=t;}}
      else if(phase==='hold'){v=0;if(t-tp>14){phase='wheel';tp=t;
        H.notice('Re-forming','- the eoreds wheel and go back up the field to where they started, and the host closes up behind them.',null);}}
      else if(phase==='wheel'){turn=Math.PI*ease(clamp((t-tp)/9,0,1));if(t-tp>9){phase='back';tp=t;}}
      else if(phase==='back'){v=Math.min(26,v+dt*4);s=Math.max(0,s-v*dt);if(s<=0){phase='unwheel';tp=t;v=0;}}
      else if(phase==='unwheel'){turn=Math.PI*(1-ease(clamp((t-tp)/9,0,1)));if(t-tp>9){put();return false;}}
      put();
      // what the front throws up, across the whole width of it
      const [cx,cz]=at(),k=v/VMAX,dir=phase==='back'?-1:1;
      for(let n=0;n<Math.floor(12*k);n++){const off=(R()-0.5)*2*W,px=cx-fz*off-fx*R()*30*dir,pz=cz+fx*off-fz*R()*30*dir;
        dust.emit(px,groundH(px,pz)+2,pz,-fx*v*0.2*dir+(R()-0.5)*4,2+R()*4,-fz*v*0.2*dir+(R()-0.5)*4,4+R()*3,22+R()*14);}
      // the blocks in the way: pushed off the line while the riders are among them, and back when they go
      for(const q of blocks){
        if(phase==='charge'||phase==='hold'){const dx=q.x+q.ox-cx,dz=q.z+q.oz-cz,d=Math.hypot(dx,dz);
          if(d<520&&Math.hypot(q.ox,q.oz)<260){const p=dt*40*(1-d/520);q.ox+=dx/Math.max(1,d)*p;q.oz+=dz/Math.max(1,d)*p;}}
        else{q.ox*=1-dt*0.05;q.oz*=1-dt*0.05;}
        if(q.ox||q.oz){const bx=q.x+q.ox,bz=q.z+q.oz;q.b.position.set(bx,groundH(bx,bz),bz);}}
    },end);}

  // ---- a Nazgul on the walls ----
  // Out of the east high up, down in a stoop over the Pelennor, along the first circle at the height of its
  // parapet, and away up over the south of the city. While it is low the light goes out of everything: the
  // Black Breath is a thing done to the defenders rather than to the camera, but this is the camera's share.
  function nazgul(){
    const b=makeBeast(30);own(b.g);
    const gy=(x,z,h)=>groundH(x,z)+h;
    const pts=[[2800,-1700,1100],[1500,-900,560],[760,-420,150]];
    for(let a=-0.62;a<=0.62;a+=0.155)pts.push([Math.cos(a)*620,Math.sin(a)*620,120]);
    pts.push([820,560,260],[1500,1400,700],[2900,2600,1300]);
    const curve=new THREE.CatmullRomCurve3(pts.map(([x,z,h])=>new THREE.Vector3(x,h>600?h+groundH(x,z):gy(x,z,h),z)));
    const T=34;let t=0,said=false;
    H.notice('A Nazgul','- stooping out of the east on the walls. The men on the first circle throw themselves down behind the parapet; some of them let go of what they were holding.',
      // from the second circle looking out, so it is dark against the field rather than against the city
      ()=>[400,groundH(400,-140)+40,-140,760,groundH(760,-120)+60,-120]);
    const P0=new THREE.Vector3(),P1=new THREE.Vector3();
    go((now,dt)=>{t+=dt;const u=t/T;if(u>=1){scene.remove(b.g);return false;}
      curve.getPointAt(Math.min(1,u),P0);curve.getPointAt(Math.min(1,u+0.004),P1);
      b.g.position.copy(P0);b.g.lookAt(P1);
      const turnK=Math.sin(u*Math.PI);b.g.rotateZ(u>0.3&&u<0.7?-0.35:0.1*turnK);
      // wings folded in the stoop, beating on the pass and the climb
      b.flap(now,u<0.22?0.08:(u<0.7?0.3:0.7));
      const dark=clamp(1-Math.abs(u-0.5)/0.2,0,1)*0.55;
      hemi.intensity*=1-dark;ambient.intensity*=1-dark;sun.intensity*=1-dark*0.7;
      if(u>0.45&&!said){said=true;H.notice('The Black Breath','- the light goes out of the day as it passes, and comes back behind it.',null);}
    },()=>scene.remove(b.g));}

  // ---- the White Rider ----
  // Faramir's company comes back across the north of the field towards the Gate with three Nazgul stooping
  // on it; a rider comes out of the Gate to meet it, and where they meet there is a light, and the Nazgul
  // break off and climb away. Then they all come in together. The road in goes round Grond, which is where
  // it is in front of the Gate for the whole siege.
  function rider(){
    const path=[[1750,-1050],[1150,-640],[760,-240],[600,-60],[520,0]];
    const segs=[];let total=0;for(let i=1;i<path.length;i++){const l=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);segs.push(l);total+=l;}
    const along=s=>{s=clamp(s,0,total);for(let i=0;i<segs.length;i++){if(s<=segs[i]||i===segs.length-1){const k=s/segs[i],[ax,az]=path[i],[bx,bz]=path[i+1];return [lerp(ax,bx,k),lerp(az,bz,k),Math.atan2(bx-ax,bz-az)];}s-=segs[i];}};
    const co=makeCompany(28,7,3.4,0x4a3a2e,0x5c6470);co.scale.setScalar(1.6);own(co);
    const gm=new THREE.MeshLambertMaterial({color:0xf4f6fa,emissive:0x5a6068,flatShading:true});
    const gan=new THREE.Group();
    gan.add(new THREE.Mesh(new THREE.BoxGeometry(1.0,1.6,2.8).translate(0,1.2,0),gm));
    gan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.45,1.6,7).translate(0,2.7,-0.2),gm));
    const staff=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.6,0.1).translate(0.45,3.4,0),gm);gan.add(staff);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(0.9,10,8),coreM);orb.position.set(0.45,4.9,0);orb.visible=false;gan.add(orb);
    gan.scale.setScalar(2);own(gan);
    const flashM=new THREE.MeshBasicMaterial({color:0xf2f6ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    const flash=own(new THREE.Mesh(new THREE.SphereGeometry(1,16,12),flashM));
    const beam=own(new THREE.Mesh(new THREE.CylinderGeometry(3,9,500,12,1,true).translate(0,250,0),flashM));
    const beasts=[0,1,2].map(i=>{const b=makeBeast(18);own(b.g);return {b,ph:i*2.1,r:90+i*30,off:[0,0,0],gone:0};});
    const VC=22,VG=28,TG=4;
    let t=0,meet=-1,lit=-1,sc=0,gp=total;
    let alive=true;
    H.notice('The White Rider','- a company of Gondor falling back across the Pelennor to the Gate with the Nazgul on it, and one rider coming out of the Gate to meet them, white, with a light held up.',
      ()=>{const p=co.position;return [p.x+380,p.y+230,p.z+320,p.x-120,p.y+20,p.z+60];},()=>alive?co.position:null);
    const Pp=new THREE.Vector3();
    const end=()=>{alive=false;for(const o of [co,gan,flash,beam,...beasts.map(q=>q.b.g)])scene.remove(o);whiteLight.intensity=0;};
    go((now,dt)=>{t+=dt;
      sc=Math.min(total,sc+VC*dt);
      // he goes out until he meets them, turns, and comes back in behind them
      if(meet<0){if(t>TG)gp=Math.max(0,gp-VG*dt);if(gp<=sc+40){meet=t;lit=t;
        H.notice('The light','- held up where they meet, and the Nazgul will not come near it. They break off and climb away east.',null);}}
      else gp=Math.min(total,gp+VC*0.85*dt);        // turned, and letting them past him
      {const [x,z,h]=along(sc);co.position.set(x,groundH(x,z),z);co.rotation.y=h;}
      {const [x,z,h]=along(gp);gan.position.set(x,groundH(x,z),z);gan.rotation.y=meet<0?h+Math.PI:h;}
      // the light
      const L=lit<0?0:Math.max(0,1-(t-lit)/9);orb.visible=L>0.02||(meet<0&&t>TG);
      flashM.opacity=L*0.55;flash.position.copy(gan.position).y+=10;flash.scale.setScalar(20+(1-L)*220);
      beam.position.copy(gan.position);beam.scale.set(1+(1-L)*2,L,1+(1-L)*2);beam.visible=L>0.02;
      whiteLight.position.copy(gan.position).y+=30;whiteLight.intensity=L*3;
      // the Nazgul: circling the company and stooping on it, and after the light, away
      for(const q of beasts){
        const a=now*0.0007+q.ph,c=co.position;
        if(lit<0){Pp.set(c.x+Math.cos(a)*q.r,c.y+70+50*Math.sin(now*0.0011+q.ph)-40*Math.max(0,Math.sin(now*0.0017+q.ph*3)),c.z+Math.sin(a)*q.r);}
        else{q.gone+=dt;Pp.set(c.x+Math.cos(a)*q.r+q.gone*q.gone*6,c.y+70+q.gone*q.gone*4,c.z+Math.sin(a)*q.r-q.gone*q.gone*2);}
        q.b.g.lookAt(Pp);q.b.g.position.copy(Pp);q.b.g.visible=q.gone<22;q.b.flap(now,0.6);}
      if(meet>=0&&sc>=total&&gp>=total)return false;
    },end);}

  // ---- the mumakil ----
  function makeMumak(){
    const g=new THREE.Group(),skin=new THREE.MeshLambertMaterial({color:0x6d655b,flatShading:true});
    const ivory=new THREE.MeshLambertMaterial({color:0xe6dcc4,flatShading:true}),wood=new THREE.MeshLambertMaterial({color:0x4a3526,flatShading:true});
    const red=new THREE.MeshLambertMaterial({color:0x8e2a1c,flatShading:true,side:THREE.DoubleSide});
    const m=(geo,mat,x,y,z,par)=>{const q=new THREE.Mesh(geo,mat);q.position.set(x,y,z);(par||g).add(q);return q;};
    m(new THREE.SphereGeometry(1,12,9),skin,0,12.5,0).scale.set(4.6,4.4,7.4);
    m(new THREE.SphereGeometry(1,10,8),skin,0,13.6,8.2).scale.set(3,3.4,3.1);
    for(const sd of [-1,1]){m(new THREE.BoxGeometry(0.4,5,4.2),skin,sd*3.1,14,7.4).rotation.y=sd*0.5;
      for(const [dx,dy,len] of [[1.4,10.6,8],[2.4,11.6,5.5]]){const tk=m(new THREE.ConeGeometry(0.45,len,6).translate(0,len/2,0),ivory,sd*dx,dy,9.6);tk.rotation.set(1.15,0,sd*0.12);}}
    const trunk=new THREE.Group();trunk.position.set(0,11.8,11);g.add(trunk);
    let seg=trunk;const segs=[];
    for(let k=0;k<4;k++){const s=new THREE.Group();if(k)s.position.y=-2.1;seg.add(s);m(new THREE.CylinderGeometry(0.9-k*0.15,1.05-k*0.15,2.2,7).translate(0,-1.1,0),skin,0,0,0,s);segs.push(s);seg=s;}
    const legs=[];
    for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const p=new THREE.Group();p.position.set(sx*2.7,10,sz*4.4);g.add(p);
      m(new THREE.CylinderGeometry(1.5,1.3,10,8).translate(0,-5,0),skin,0,0,0,p);legs.push({p,ph:(sx*sz>0?0:Math.PI)});}
    m(new THREE.CylinderGeometry(0.15,0.3,5,5).translate(0,-2.5,0),skin,0,13,-7.2).rotation.x=0.4;
    // the tower on its back
    m(new THREE.BoxGeometry(6.4,0.6,9),wood,0,17.2,-0.5);
    for(const sx of [-1,1])for(const sz of [-1,1])m(new THREE.BoxGeometry(0.35,4.2,0.35).translate(0,2.1,0),wood,sx*3,17.4,sz*4.2-0.5);
    for(const sx of [-1,1])m(new THREE.BoxGeometry(0.2,1.2,8.6),wood,sx*3,18.4,-0.5);
    m(new THREE.BoxGeometry(7,0.4,9.6),red,0,21.6,-0.5);
    m(new THREE.BoxGeometry(0.2,5,0.2).translate(0,2.5,0),wood,0,21.8,-4);
    m(new THREE.PlaneGeometry(2.6,1.7),red,1.3,25.8,-4);
    fold(g);
    return {g,legs,segs};}
  // mumakHold keeps them standing while the Dead are on their way to them; a beast's `fell` is set when the
  // Dead have brought it down, and from then on it is falling over rather than walking
  let beasts=null,mumakHold=false;
  function mumakil(){
    if(beasts)return;
    const N=6;beasts=[];
    for(let i=0;i<N;i++){const b=makeMumak();own(b.g);const a=1.02+i*0.08+(R()-0.5)*0.03;
      beasts.push({...b,a,r0:2950+R()*200,r1:1900+R()*160,ph:R()*6.28,step:0});}
    const T1=72,T2=108,T3=116,T4=186;let t=0,said=false;
    const mid=beasts[3];
    H.notice('Mumakil','- out of the south, the great beasts of Harad, with towers on their backs and archers in the towers. Horses will not go near them.',
      ()=>{const {x,y,z}=mid.g.position;return [x-Math.sin(mid.a)*420+Math.cos(mid.a)*120,y+110,z+Math.cos(mid.a)*420+Math.sin(mid.a)*120,x,y+14,z];},
      ()=>beasts?mid.g.position:null);
    const end=()=>{for(const b of beasts)scene.remove(b.g);beasts=null;mumakHold=false;};
    go((now,dt)=>{t+=dt;if(mumakHold&&t>T2-1)t=T2-1;if(t>T4)return false;
      if(beasts.every(b=>b.fell>16))return false;
      for(const b of beasts){
        if(b.fell!==undefined){
          // down on its side, away from the side the Dead came up, and then sunk into the grass and gone
          b.fell+=dt;const u=ease(clamp(b.fell/3.2,0,1));
          b.g.rotation.z=b.fallSide*Math.PI/2*0.92*u;b.g.position.y=groundH(b.g.position.x,b.g.position.z)-2.5*u-Math.max(0,b.fell-8)*3;
          b.segs.forEach((sg,k)=>{sg.rotation.x=-0.9*(1-u)+0.2*u;});b.g.visible=b.fell<16;
          if(b.fell<3.5&&R()<0.8)dust.emit(b.g.position.x+(R()-0.5)*16,b.g.position.y+2,b.g.position.z+(R()-0.5)*16,(R()-0.5)*8,2+R()*4,(R()-0.5)*8,4+R()*4,22);
          continue;}
        let r,face=b.a+Math.PI,walk=0;
        if(t<T1){const u=t/T1;r=lerp(b.r0,b.r1,u);walk=1;}
        else if(t<T2){r=b.r1;}
        else if(t<T3){r=b.r1;face=b.a+Math.PI*(1-ease((t-T2)/(T3-T2)));walk=0.5;}
        else{r=lerp(b.r1,b.r0+400,(t-T3)/(T4-T3));face=b.a;walk=1;}
        const x=Math.cos(b.a)*r,z=Math.sin(b.a)*r,y=groundH(x,z);
        b.step+=dt*walk*2.6;
        const bob=walk?Math.abs(Math.sin(b.step))*0.5:0;
        b.g.position.set(x,y+bob,z);b.g.rotation.set(0,Math.atan2(Math.cos(face),Math.sin(face)),Math.sin(b.step)*0.03*walk+(walk?0:Math.sin(now*0.0008+b.ph)*0.02));
        for(const l of b.legs)l.p.rotation.x=walk?Math.sin(b.step+l.ph)*0.38:0;
        // the trunk: swinging as it walks, and up to trumpet when they stop
        const trump=(t>T1+2&&t<T1+9)?ease(clamp((t-T1-2)/2,0,1))*(1-ease(clamp((t-T1-7)/2,0,1))):0;
        b.segs.forEach((s,k)=>{s.rotation.x=-trump*(0.55+k*0.1)*(k?1:1.6)+Math.sin(now*0.0015+b.ph+k)*0.08;});
        if(walk&&R()<0.3)dust.emit(x+(R()-0.5)*10,y+1,z+(R()-0.5)*10,(R()-0.5)*3,1+R()*2,(R()-0.5)*3,4+R()*3,16+R()*10);}
      if(t>T1+2&&!said){said=true;H.notice('Mumakil','- they have stopped on the south of the field, and they are trumpeting.',null);}
    },end);}

  // ---- the black ships ----
  // The ships come up the middle of the Anduin (its waterway line, which the generator writes) from five
  // kilometres downstream to level with the Harlond, pull in to the near bank, and stay moored until the page
  // goes to peace or they come again - they are part of the war now.
  let riverPts;
  function river(){
    if(riverPts!==undefined)return riverPts;
    const L=(C.landmarks||[]).find(l=>/Harlond/.test(l.name)),W=(api.WATERWAYS||[]).find(w=>/Anduin/.test(w.name));
    if(!L||!W)return riverPts=null;
    const hz=P(L.at)[1];
    const pts=W.pts.filter(p=>p[1]>=hz-200&&p[1]<=hz+5000).sort((a,b)=>b[1]-a[1]);
    if(pts.length<4)return riverPts=null;
    const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    return riverPts={pts,cum,len:cum[cum.length-1]};}
  const onRiver=(rv,s)=>{s=clamp(s,0,rv.len);let i=1;while(i<rv.cum.length-1&&rv.cum[i]<s)i++;
    const k=(s-rv.cum[i-1])/Math.max(1,rv.cum[i]-rv.cum[i-1]),[ax,az]=rv.pts[i-1],[bx,bz]=rv.pts[i];
    return [lerp(ax,bx,k),lerp(az,bz,k),Math.atan2(bx-ax,bz-az)];};
  function bannerTex(){
    const c=document.createElement('canvas');c.width=128;c.height=192;const g=c.getContext('2d');
    g.fillStyle='#0c0c10';g.fillRect(0,0,128,192);g.strokeStyle=g.fillStyle='#f2efe6';
    // the tree: a trunk and branches, in flower
    g.lineWidth=5;g.beginPath();g.moveTo(64,160);g.lineTo(64,78);g.stroke();
    g.lineWidth=3;for(const [dx,y] of [[-30,84],[30,84],[-24,104],[24,104],[-18,124],[18,124]]){g.beginPath();g.moveTo(64,y+14);g.quadraticCurveTo(64+dx*0.4,y,64+dx,y-8);g.stroke();}
    for(let k=0;k<22;k++){const a=k/22*Math.PI,rr=22+(k%3)*6;g.beginPath();g.arc(64+Math.cos(a)*rr*1.3,92-Math.sin(a)*rr,2.6,0,7);g.fill();}
    // the seven stars, and the crown over them
    for(let k=0;k<7;k++){const a=Math.PI*(0.15+0.7*k/6);g.beginPath();g.arc(64-Math.cos(a)*44,58-Math.sin(a)*26,3.4,0,7);g.fill();}
    g.beginPath();g.moveTo(46,26);g.lineTo(50,12);g.lineTo(57,22);g.lineTo(64,8);g.lineTo(71,22);g.lineTo(78,12);g.lineTo(82,26);g.closePath();g.fill();
    return new THREE.CanvasTexture(c);}
  function makeShip(){
    const g=new THREE.Group(),hull=new THREE.MeshLambertMaterial({color:0x241c16,flatShading:true});
    const sail=new THREE.MeshLambertMaterial({color:0x121114,side:THREE.DoubleSide,flatShading:true});
    const m=(geo,mat,x,y,z,par)=>{const q=new THREE.Mesh(geo,mat);q.position.set(x,y,z);(par||g).add(q);return q;};
    m(new THREE.BoxGeometry(6,3,26),hull,0,1.2,0);
    m(new THREE.ConeGeometry(3.2,9,4).rotateX(Math.PI/2).rotateZ(Math.PI/4),hull,0,1.6,17).scale.set(0.95,0.7,1);
    m(new THREE.BoxGeometry(6.4,3,6),hull,0,3.8,-11);
    m(new THREE.CylinderGeometry(0.3,0.4,22,6).translate(0,11,0),hull,0,2,1);
    m(new THREE.BoxGeometry(15,0.4,0.4),hull,0,21,1.4);
    const s=m(new THREE.PlaneGeometry(14,11,4,3),sail,0,15.2,1.6);
    {const p=s.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,1.4*(1-Math.pow(p.getX(i)/7,2)));s.geometry.computeVertexNormals();}
    fold(g);
    // the oars, eleven a side, instanced: they all pull together, so one matrix each per frame
    const oars=new THREE.InstancedMesh(new THREE.BoxGeometry(7,0.18,0.3).translate(3.5,0,0),hull,22);oars.frustumCulled=false;g.add(oars);
    const D=new THREE.Object3D();
    const row=(a,k)=>{for(let i=0;i<22;i++){const sd=i<11?-1:1;D.position.set(sd*3.1,2.2,-9+(i%11)*1.9);
      // the port side is the starboard oar turned round: the dip is the same, the sweep is mirrored
      D.rotation.set(0,(sd<0?Math.PI:0)+sd*Math.sin(a)*0.35*k,-(0.15+Math.cos(a)*0.18*k));D.updateMatrix();oars.setMatrixAt(i,D.matrix);}
      oars.instanceMatrix.needsUpdate=true;};
    row(0,0);
    return {g,row};}
  let fleet=null,sailing=false,fleetMoored=false;
  function ships(){
    // not while the Dead are out: new ships would take away the ones they came off
    const rv=river();if(!rv||sailing||deadRunning)return;sailing=true;
    const WAR=ctx.warParts=ctx.warParts||[];
    if(fleet){for(const f of fleet){scene.remove(f.g);const i=WAR.indexOf(f.g);if(i>=0)WAR.splice(i,1);}}
    const N=7,SP=75,RUN=Math.min(2400,rv.len-N*SP),WY=(ctx.waterLevel||0)+0.2;
    let moored=false;fleetMoored=false;
    fleet=[];for(let i=0;i<N;i++){const f=makeShip();own(f.g);fleet.push({...f,end:rv.len-40-i*SP,side:(i%2?1:-1)*18});}
    // the lead ship's banner, furled at the masthead until it breaks out
    // on a staff above the yard, so the sail does not hide it from ahead
    const flagM=new THREE.MeshLambertMaterial({map:bannerTex(),side:THREE.DoubleSide,emissive:0x3a3a3a});
    const staff=new THREE.Mesh(new THREE.BoxGeometry(0.3,14,0.3).translate(0,7,0),ironM);staff.position.set(0,24,1);fleet[0].g.add(staff);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(8,12,6,1).rotateY(Math.PI/2).translate(0,-6,4),flagM);flag.position.set(0,37.5,1);flag.scale.set(1,0.02,1);flag.visible=false;fleet[0].g.add(flag);
    const T=RUN/30;let t=0,said=false;
    // from over the near bank, ahead of them, and following them up the river
    H.notice('Black sails','- on the Anduin, coming up from the south: the Corsairs of Umbar, with the wind behind them, making for the Harlond. Nobody on the walls says anything.',
      ()=>{const p=fleet[0].g.position;return [p.x-300,WY+120,p.z-240,p.x+20,WY+12,p.z+120];},()=>fleet&&!moored?fleet[0].g.position:null);
    const end=()=>{sailing=false;if(moored)return;if(fleet)for(const f of fleet)scene.remove(f.g);fleet=null;};
    go((now,dt)=>{t+=dt;const u=Math.min(1,t/T),row=u<1?1:0;
      fleet.forEach((f,i)=>{const s=f.end-RUN*(1-ease(u)*0.15-u*0.85),[x,z,h]=onRiver(rv,s);
        const lat=lerp(f.side,150,ease(clamp((u-0.7)/0.3,0,1))),ox=Math.cos(h)*lat,oz=-Math.sin(h)*lat;   // + is the near (west) bank
        f.g.position.set(x+ox,WY+Math.sin(now*0.0012+i)*0.15,z+oz);f.g.rotation.set(Math.sin(now*0.0009+i)*0.015,h,0);
        f.row(now*0.0028+i,row);});
      if(t>T*0.78&&!said){said=true;flag.visible=true;
        H.notice('A banner','- breaks out at the masthead of the first ship: a White Tree in flower, seven stars and a crown. Not the Corsairs. The King.',
          ()=>{const p=fleet[0].g.position;return [p.x-160,p.y+70,p.z-120,p.x,p.y+18,p.z];});}
      if(said)flag.scale.set(1,Math.min(1,flag.scale.y+dt*0.5),1);
      if(u>=1&&flag.scale.y>=1){moored=true;fleetMoored=true;for(const f of fleet)WAR.push(f.g);
        // and when they are in, what they brought comes off them
        setTimeout(()=>{if(ctx.war!==false)dead();},2500);return false;}
    },end);}

  // ---- the Dead ----
  // What the black ships brought up the river besides the King: the Dead Men of Dunharrow, the men of the
  // mountains who broke their oath to Isildur, called to fulfil it. They come off the ships grey and green and
  // more than can be counted, gather on the bank, and then go across the Pelennor faster than horses to where
  // the Mumakil are standing on the south of the field - and the beasts go down under them, one after another,
  // and the host of Harad breaks. Then their oath is kept, and they are gone.
  //
  // They are a tide rather than an army: two and a half thousand figures, instanced, each with its own place in
  // the surge, pale and additive so that where they are thick they glow and where they are thin you see the
  // field through them. The ships bring them (ships() calls this when they are moored); asked for with no ships
  // in, it sends the ships first. If there are no Mumakil on the field it sends for them, and holds them there.
  const ghostDust=createDust(api,{max:5000,size:30,color:0x8fe8bc,drag:0.8,gravity:-0.6,wind:[-2,0,0.5]});
  const deadLight=new THREE.PointLight(0x9ff5c8,0,500,1.2);scene.add(deadLight);
  let deadRunning=false;
  function dead(){
    if(deadRunning)return;
    if(!fleet||!fleetMoored){ships();return;}
    if(!beasts)mumakil();
    if(!beasts)return;
    deadRunning=true;mumakHold=true;
    const N=2500,D=new THREE.Object3D();
    const ghostM=new THREE.MeshBasicMaterial({color:0xa8f5d0,transparent:true,opacity:0.62,depthWrite:false,blending:THREE.AdditiveBlending});
    const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,2.0,0.6).translate(0,1.0,0),ghostM,N);
    mesh.frustumCulled=false;mesh.userData.noWire=true;own(mesh);
    const ships0=fleet.map(f=>f.g.position.clone());
    const ghosts=[];
    for(let i=0;i<N;i++){const sp=ships0[i%ships0.length];
      ghosts.push({sx:sp.x+(R()-0.5)*10,sz:sp.z+(R()-0.5)*24,
        // where it gathers on the bank: west of the ships, in a mass
        rx:sp.x-140-R()*260,rz:sp.z+(R()-0.5)*420,
        t0:(i/N)*9+R()*1.5,v:95+R()*40,lat:(R()-0.5)*2,ph:R()*6.28,tgt:null,ang:R()*6.28,rad:4+R()*18,hi:R(),x:sp.x,y:0,z:sp.z});}
    // the blocks of the host near the beasts, which break when the Dead come
    const blocks=((ctx.siege&&ctx.siege.blocks)||[]).map(b=>({b,x:b.position.x,z:b.position.z,ox:0,oz:0}));
    let t=0,phase='off',said=0,alive=true,fade=1,cx=ships0[0].x,cz=ships0[0].z,cy=0;
    const TS=12;                                          // when the surge goes
    const living=()=>(beasts||[]).filter(b=>b.fell===undefined);
    H.notice('The Dead','- off the black ships: the Dead Men of Dunharrow, the men of the mountains who broke their oath, grey and green and more than can be counted, following the King.',
      ()=>[cx-260,groundH(cx,cz)+140,cz-300,cx+60,groundH(cx,cz)+6,cz],()=>alive?[cx,cy,cz]:null);
    const end=()=>{alive=false;deadRunning=false;mumakHold=false;scene.remove(mesh);deadLight.intensity=0;
      for(const q of blocks)q.b.position.set(q.x,groundH(q.x,q.z),q.z);};
    go((now,dt)=>{t+=dt;
      const L=living();
      if(t>TS&&said<1){said=1;H.notice('Over the Pelennor','- faster than horses, over the fields and through the Rammas as if it were not there, to the south of the field where the Mumakil stand.',null);}
      let n=0,sx=0,sy=0,sz=0,cnt=0;
      const press=new Map();
      for(const q of ghosts){
        const lt=t-q.t0;if(lt<0)continue;
        if(lt<5){                                           // off the ship and up the bank
          const u=ease(lt/5);q.x=lerp(q.sx,q.rx,u);q.z=lerp(q.sz,q.rz,u);q.y=groundH(q.x,q.z);}
        else if(t<TS+q.t0*0.4){q.y=groundH(q.x,q.z);}      // gathered on the bank, waiting
        else{
          // a beast to go for, and a new one when that one is down
          if(!q.tgt||q.tgt.fell!==undefined)q.tgt=L.length?L[Math.floor(q.ph*97)%L.length]:null;
          if(q.tgt){const p=q.tgt.g.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);
            if(d>34){const step=Math.min(d,q.v*dt),nx=dx/d,nz=dz/d;
              q.x+=nx*step-nz*Math.sin(t*0.9+q.ph)*q.lat*8*dt;q.z+=nz*step+nx*Math.sin(t*0.9+q.ph)*q.lat*8*dt;q.y=groundH(q.x,q.z);}
            else{  // on it: round it and up it
              q.ang+=dt*(0.6+q.hi);const rr=q.rad+6;q.x=p.x+Math.cos(q.ang)*rr;q.z=p.z+Math.sin(q.ang)*rr;
              q.y=p.y+q.hi*22*Math.min(1,(t-(q.on||(q.on=t)))/4);press.set(q.tgt,(press.get(q.tgt)||0)+1);}}
          else{  // nothing left standing: on through the host to the west, and thinning
            q.x-=q.v*0.5*dt;q.z+=Math.sin(q.ph)*q.v*0.2*dt;q.y=groundH(q.x,q.z);}}
        D.position.set(q.x,q.y,q.z);D.rotation.set(0,q.ph,0);D.scale.setScalar(2.1);D.updateMatrix();mesh.setMatrixAt(n++,D.matrix);
        if(cnt<400&&(n&7)===0){sx+=q.x;sy+=q.y;sz+=q.z;cnt++;}
        if(R()<0.012)ghostDust.emit(q.x,q.y+2,q.z,(R()-0.5)*4,1+R()*2,(R()-0.5)*4,3+R()*3,20+R()*20);}
      mesh.count=n;mesh.instanceMatrix.needsUpdate=true;
      if(cnt){cx=sx/cnt;cy=sy/cnt;cz=sz/cnt;}
      // a beast with enough of them on it for long enough goes down
      for(const [b,c] of press){b.press=(b.press||0)+dt*c/120;
        if(b.press>5&&b.fell===undefined){b.fell=0;b.fallSide=R()<0.5?-1:1;
          if(said<2){said=2;H.notice('The Mumakil','- the great beasts go down under them one after another, towers and archers and all, and the host of Harad breaks and runs.',null);}}}
      // the host round the beasts breaks away from them
      for(const q of blocks){let near=null,best=700;
        for(const b of beasts||[]){const d=Math.hypot(q.x+q.ox-b.g.position.x,q.z+q.oz-b.g.position.z);if(d<best&&b.press>0.5){best=d;near=b;}}
        if(near&&Math.hypot(q.ox,q.oz)<300){const dx=q.x+q.ox-near.g.position.x,dz=q.z+q.oz-near.g.position.z,d=Math.max(1,Math.hypot(dx,dz));
          q.ox+=dx/d*dt*30;q.oz+=dz/d*dt*30;const bx=q.x+q.ox,bz=q.z+q.oz;q.b.position.set(bx,groundH(bx,bz),bz);}}
      // the light of them, and when it is done, the going
      deadLight.position.set(cx,cy+40,cz);deadLight.intensity=1.6*fade*Math.min(1,t/3);
      if(phase==='off'&&beasts&&beasts.length&&!L.length){phase='going';said=3;
        H.notice('Released','- their oath is kept. They go over the field like a grey tide and are gone, like mist in the wind, and the host of Harad with them.',null);}
      if(phase==='going'){fade-=dt/10;ghostM.opacity=0.62*Math.max(0,fade);if(fade<=0)return false;}
      if(t>240)return false;
    },end);}

  // ---- the Gate broken ----
  // The book's version, which is the whole of the siege in one place: Grond brought up to the Gate, the Captain
  // of the Nazgul behind it, three strokes, and at the third the doors burst in "as if stricken by some
  // blasting spell"; he rides in under the arch, and in the gateway there is one rider waiting, who has not
  // moved; and then somewhere in the city a cock crows, and horns answer it out of the north. The doors are
  // the landmark's own leaves (ctx.gate, landmarks.js) and they stay down until the page goes to peace.
  function makeRider(col,crown){
    const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:col,flatShading:true});
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.0,1.6,2.8).translate(0,1.2,0),m));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,1.2,0.7).translate(0,2.1,1.4),m));
    g.add(new THREE.Mesh(new THREE.ConeGeometry(0.55,2.4,7).translate(0,3.3,-0.2),m));
    if(crown){const c=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.07,5,10).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xd8e2ff}));c.position.set(0,4.35,-0.2);g.add(c);}
    g.scale.setScalar(2.2);return g;}
  function gatebreak(){
    const G=ctx.gate;if(!G||G.broken)return;
    const P3=(d,s,y)=>[G.x+G.ux*d+G.vx*s,y,G.z+G.uz*d+G.vz*s];
    const face=(o,d)=>{o.rotation.y=Math.atan2(G.ux*d,G.uz*d);};           // +z towards the Gate (d<0) or away (d>0)
    const cap=own(makeRider(0x0e0d11,true)),wiz=own(makeRider(0xf2f4f8,false));wiz.visible=false;
    let [cx,,cz]=P3(125,24,0);cap.position.set(cx,groundH(cx,cz),cz);face(cap,-1);
    {const [wx,,wz]=P3(-26,0,0);wiz.position.set(wx,groundH(wx,wz),wz);face(wiz,1);}
    const boltM=new THREE.MeshBasicMaterial({color:0xdfe8ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    const bolt=new THREE.Group();{let bx=0,by=0;for(let k=0;k<8;k++){const seg=new THREE.Mesh(new THREE.BoxGeometry(2.2,90,2.2),boltM);
      const nx=(R()-0.5)*40;seg.position.set(bx+nx/2,-(k+0.5)*85,0);seg.rotation.z=Math.atan2(nx,85)*-1;bolt.add(seg);bx+=nx;by-=85;}}
    {const [bx,,bz]=P3(2,0,0);bolt.position.set(bx,G.g0+690,bz);}own(bolt);
    let t=0,strokes=0,flash=0,fall=-1,said=0,horns=false;
    const shake=[0,0];
    H.notice('Grond at the Gate','- the great ram is up against the Great Gate, and behind it a rider in black, taller than the rest, with a crown on a head that is not there.',
      // not followed: all of this happens in one place, and following him in took the camera over the wall
      ()=>{const [px,,pz]=P3(95,-150,0),[tx,,tz]=P3(10,0,0);return [px,G.g0+70,pz,tx,G.g0+14,tz];});
    const end=()=>{for(const o of [cap,wiz,bolt])scene.remove(o);};
    go((now,dt)=>{t+=dt;
      // three strokes, six seconds apart; the third is the one
      if(strokes<3&&t>5+strokes*6){strokes++;flash=strokes===3?1:0.45;
        for(let k=0;k<(strokes===3?260:60);k++){const [dx,,dz]=P3(4+R()*6,(R()-0.5)*14,0),a2=R()*6.28;
          dust.emit(dx,G.g0+R()*20,dz,G.ux*(strokes===3?-18:6)*R()+Math.cos(a2)*4,2+R()*6,G.uz*(strokes===3?-18:6)*R()+Math.sin(a2)*4,5+R()*4,20+R()*16);}
        if(strokes===1)H.notice('Grond','- the first stroke. The Gate holds.',null);
        if(strokes===3){fall=0;G.broken=true;
          for(let k=0;k<160;k++){const [dx,,dz]=P3(0,(R()-0.5)*12,0);embers.emit(dx,G.g0+2+R()*20,dz,-G.ux*(8+R()*20)+(R()-0.5)*8,2+R()*10,-G.uz*(8+R()*20)+(R()-0.5)*8,1+R()*2,2+R()*2);}
          H.notice('The Gate is broken','- at the third stroke the doors burst inward as if a spell had struck them, and lie in ruin in the court. He rides in under the arch.',null);}}
      // the flash of each stroke, and the bolt on the last
      flash*=Math.exp(-dt*5);boltM.opacity=strokes===3&&flash>0.2?flash:0;
      hemi.intensity*=1+flash*2.5;ambient.intensity*=1+flash*2;
      // the leaves: a shudder at each stroke, and at the third, down flat into the court
      for(const q of G.leaves){
        if(fall<0){const k=flash*0.08*Math.sin(t*60);q.p.rotation.set(0,-G.a,Math.max(0,k));}
        else{const u=clamp(fall/0.9,0,1),th=Math.PI/2*0.97*u*u;q.p.rotation.set(0,-G.a+q.s*0.25*u,th);
          q.p.position.set(q.home.x-G.ux*5*u,q.home.y,q.home.z-G.uz*5*u);}}
      if(fall>=0)fall+=dt;
      // the Captain: up to the arch once it is open, and there he stops
      if(t>19&&t<30){const u=ease(clamp((t-19)/10,0,1)),[ax,,az]=P3(125,24,0),[bx,,bz]=P3(8,0,0);
        cx=lerp(ax,bx,u);cz=lerp(az,bz,u);cap.position.set(cx,groundH(cx,cz),cz);cap.rotation.y=Math.atan2(bx-ax,bz-az);}
      if(t>19)wiz.visible=true;
      if(t>30&&said<1){said=1;H.notice('In the gateway','- and there he stops. In the court behind the ruin of the doors one rider is waiting, on a white horse, and has not moved.',
        ()=>{const [px,,pz]=P3(-60,70,0),[tx,,tz]=P3(-10,0,0);return [px,G.g0+26,pz,tx,G.g0+8,tz];});}
      // and then the horns
      if(t>37&&!horns){horns=true;H.notice('Horns','- somewhere in the city a cock crows, and as if in answer, far away in the north, great horns. Rohan has come.',null);
        if(H.fire&&!charging)setTimeout(()=>H.fire('charge'),6000);}
      if(t>40){const u=clamp((t-40)/14,0,1),[ax,,az]=P3(8,0,0),[bx,,bz]=P3(420,-90,0);
        cx=lerp(ax,bx,u*u);cz=lerp(az,bz,u*u);cap.position.set(cx,groundH(cx,cz),cz);cap.rotation.y=Math.atan2(bx-ax,bz-az);
        if(u>=1)return false;}
    },end);}

  // ---- a siege tower ----
  // One of the towers is rolled up to the first wall with trolls behind it, lets its bridge down on the
  // parapet and puts its men across - and the wall throws fire into it until it burns and goes over backwards.
  let towering=false;
  function tower(){
    if(towering)return;towering=true;
    const a=-0.42+(R()-0.5)*0.25,wood=new THREE.MeshLambertMaterial({color:0x3a3027,flatShading:true}),hide=new THREE.MeshLambertMaterial({color:0x564838,flatShading:true});
    const g=new THREE.Group(),frame=new THREE.Group();g.add(frame);g.rotation.order='YXZ';
    const H2=33,WD=13,bits=[];
    for(let f=0;f<4;f++){const hh=H2/4,w2=WD*(1-f*0.05);
      const fl=new THREE.Mesh(new THREE.BoxGeometry(w2,1,w2),wood);fl.position.y=f*hh;bits.push(fl);
      for(const sx of [-1,1])for(const sz of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(1.2,hh,1.2).translate(0,hh/2,0),wood);p.position.set(sx*w2*0.44,f*hh,sz*w2*0.44);bits.push(p);}
      for(const sx of [-1,1]){const sd=new THREE.Mesh(new THREE.BoxGeometry(0.4,hh*0.9,w2*0.96),f<3?wood:hide);sd.position.set(sx*w2*0.5,f*hh+hh*0.45,0);bits.push(sd);}}
    {const fc=new THREE.Mesh(new THREE.BoxGeometry(WD*1.04,H2*0.96,0.6),hide);fc.position.set(0,H2*0.46,WD/2+0.3);bits.push(fc);}
    for(const sx of [-1,1])for(const sz of [-1,1]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,1.2,10).rotateZ(Math.PI/2),wood);wh.position.set(sx*(WD/2+0.4),2.2,sz*(WD/2-1.2));bits.push(wh);}
    for(const b of bits)frame.add(b);fold(frame);
    const bridge=new THREE.Group();bridge.position.set(0,H2,WD/2);frame.add(bridge);
    bridge.add(new THREE.Mesh(new THREE.BoxGeometry(WD*0.8,0.5,11).translate(0,0,5.5),wood));bridge.rotation.x=-Math.PI/2;
    // the trolls pushing, and the men going over
    const D=new THREE.Object3D(),fleshM=new THREE.MeshLambertMaterial({color:0x2e2822,flatShading:true});
    const pushers=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,5,2).translate(0,2.5,0),fleshM,14);
    for(let i=0;i<14;i++){D.position.set((i%7-3)*1.9,0,-WD/2-2-Math.floor(i/7)*3);D.rotation.set(0.25,0,0);D.updateMatrix();pushers.setMatrixAt(i,D.matrix);}
    pushers.frustumCulled=false;frame.add(pushers);
    const NM=40,men=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),fleshM,NM);men.frustumCulled=false;g.add(men);
    const flames=[];for(let k=0;k<12;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(2.2,7,6).translate(0,3.5,0),k%3?flameM:coreM);
      // on the outside of it, where the fire thrown from the wall lands and where it can be seen
      const side=k%4,along=(R()-0.5)*WD;f.position.set(side<2?(side?1:-1)*(WD/2+0.6):along,R()*H2*0.95,side<2?along:(side===2?1:-1)*(WD/2+0.9));
      f.scale.setScalar(0.001);frame.add(f);flames.push({f,ph:R()*6.28,at:R()});}
    own(g);
    const R0=980,R1=526+WD/2+0.5,ux=Math.cos(a),uz=Math.sin(a);
    const put=r=>{const x=ux*r,z=uz*r;g.position.set(x,groundH(x,z),z);g.rotation.y=Math.atan2(-ux,-uz);};put(R0);
    let t=0,tilt=0,said=0,alive=true;
    const T1=38;
    H.notice('A siege tower','- rolled up out of the host towards the first wall, trolls on the beams behind it and men packed on every floor.',
      ()=>{const p=g.position,sx=-uz,sz=ux;return [p.x+ux*120+sx*170,p.y+90,p.z+uz*120+sz*170,p.x-ux*20,p.y+18,p.z-uz*20];},()=>alive?g.position:null);
    const end=()=>{alive=false;towering=false;scene.remove(g);fireLight.intensity=0;};
    go((now,dt)=>{t+=dt;
      if(t<T1){put(lerp(R0,R1,ease(t/T1)*0.2+t/T1*0.8));frame.position.y=Math.abs(Math.sin(t*3))*0.25;
        if(R()<0.4){const p=g.position;dust.emit(p.x+(R()-0.5)*14,p.y+1,p.z+(R()-0.5)*14,(R()-0.5)*3,1+R()*2,(R()-0.5)*3,3+R()*3,14);}}
      // the bridge comes down, and they go over it
      if(t>T1&&t<T1+2.5)bridge.rotation.x=lerp(-Math.PI/2,0.12,ease((t-T1)/2.5));
      if(t>T1+2.5&&said<1){said=1;H.notice('The bridge is down','- on the parapet of the first wall, and they are going over it.',null);}
      {let n=0;if(t>T1+2.5&&t<T1+20){for(let i=0;i<NM;i++){const u=((t-T1-2.5)*0.35+i/NM)%1;
          if(u<0.9){D.position.set((i%5-2)*1.4,H2+0.3-u*2,WD/2+u*14);D.rotation.set(0,0,0);D.updateMatrix();men.setMatrixAt(n++,D.matrix);}}}
        men.count=n;men.instanceMatrix.needsUpdate=true;}
      // fire from the wall, catching, spreading up it, and then it goes over backwards
      const fk=clamp((t-(T1+12))/14,0,1);
      if(fk>0&&said<2){said=2;H.notice('Fire','- pitch and fire thrown down on it from the wall. The hides were soaked; the timber was not.',null);}
      for(const q of flames){const k=clamp(fk*1.6-q.at*0.6,0,1)*(0.8+0.3*Math.sin(now*0.013+q.ph));q.f.scale.set(k,k*(1+0.3*Math.sin(now*0.02+q.ph)),k);}
      if(fk>0){const p=new THREE.Vector3(0,H2*0.6,0);frame.localToWorld(p);fireLight.position.copy(p);fireLight.intensity=fk*2.4*(1-clamp((t-(T1+40))/8,0,1));
        for(let k=0;k<Math.floor(fk*5);k++)smoke.emit(p.x+(R()-0.5)*WD,p.y+(R()-0.5)*H2*0.6,p.z+(R()-0.5)*WD,(R()-0.5)*2,3+R()*4,(R()-0.5)*2,6+R()*6,12+R()*12);
        if(R()<fk)embers.emit(p.x+(R()-0.5)*WD,p.y,p.z+(R()-0.5)*WD,(R()-0.5)*6,4+R()*8,(R()-0.5)*6,1.5+R()*2,2);}
      if(t>T1+29){tilt=Math.min(Math.PI/2*0.92,tilt+dt*(0.15+tilt*1.6));g.rotation.x=-tilt;bridge.rotation.x=0.12+tilt*0.8;
        if(said<3){said=3;H.notice('It goes over','- backwards, into the host that pushed it up, and burns where it lies.',null);}
        if(tilt>=Math.PI/2*0.92&&said<4){said=4;const p=g.position;for(let k=0;k<200;k++){const a2=R()*6.28;dust.emit(p.x-ux*20+Math.cos(a2)*10,p.y+2,p.z-uz*20+Math.sin(a2)*10,Math.cos(a2)*12,3+R()*6,Math.sin(a2)*12,4+R()*4,20);}
          if(ctx.decals)ctx.decals.scorch(p.x-ux*18,p.y,p.z-uz*18,20);}}
      if(t>T1+52)return false;
    },end);}

  // ======================================================================================================
  // ---- peace: the coronation of the King ----
  // The page's peace mode is the war over and the King come back - the Tree is in flower - so its event is the
  // day he was crowned. Tolkien has it before the Gate; every telling since, and this model, has the Court of the
  // Fountain in front of the Hall. So: the people come up into the court and fill it, the Guard in black and
  // silver lines the way; the King comes through them "clad in black mail girt with silver, and a long mantle all
  // of pure white clasped at the throat with a great jewel of green" to the steps of the Hall, where the Steward
  // and the Ring-bearer and Mithrandir wait. The Ring-bearer takes the crown to Mithrandir; the King kneels; the
  // crown is set on his head - "Now come the days of the King" - and the King's banner breaks out on the Tower,
  // the Tree sheds its blossom over the court, and the people bow. Then they go back down into the city.
  //
  // It has its own Events button (only in peace), and its own notices; everything it makes it takes away.
  let H2=null;
  const goPeace=(fn,end)=>H2.run((now,dt)=>{if(ctx.war!==false){end&&end();return false;}const r=fn(now,dt);if(r===false&&end)end();return r;});
  // the King's banner on the Tower in peace, the Steward's black in war
  const kingTex=(()=>{const src=bannerTex().image,c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
    g.fillStyle='#0c0c10';g.fillRect(0,0,256,128);g.drawImage(src,128-42,0,84,128);return new THREE.CanvasTexture(c);})();
  const setBanner=king=>{const F=ctx.towerFlag;if(!F)return;F.mat.map=king?kingTex:null;F.mat.color.set(king?0xffffff:0x14131a);F.mat.needsUpdate=true;};
  setBanner(ctx.war===false);(ctx.onWar=ctx.onWar||[]).push(on=>setBanner(!on));
  const petals=createDust(api,{max:4000,size:0.9,color:0xfff3f3,drag:1.4,gravity:0.5,wind:[1.2,0,0.6]});
  const figure=(body,scale,cape)=>{
    const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:body,flatShading:true}),skin=new THREE.MeshLambertMaterial({color:0xcaa88a});
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.34,1.35,7).translate(0,0.7,0),m));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6).translate(0,1.55,0),skin));
    if(cape){const c=new THREE.Mesh(new THREE.BoxGeometry(0.62,1.4,0.06).translate(0,0.72,-0.24),new THREE.MeshLambertMaterial({color:cape}));g.add(c);}
    g.scale.setScalar(scale);return g;};
  function makeCrown(){const g=new THREE.Group(),m=new THREE.MeshPhongMaterial({color:0xe8eef4,specular:0xffffff,shininess:150,emissive:0x303640});
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.12,0.16,10,1,true),m));
    for(const sd of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.16,0.14),m);w.position.set(sd*0.15,0.1,0);w.rotation.z=-sd*0.5;g.add(w);}
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.04,0),new THREE.MeshBasicMaterial({color:0xffffff}));gem.position.set(0,0.05,0.14);g.add(gem);
    g.scale.setScalar(2.4);return g;}
  let crowning=false;
  function coronation(){
    const Ct=ctx.court;if(!Ct||crowning)return;crowning=true;
    const SC=1.25,B=Ct.base,cx=Ct.x,cz=Ct.z;
    const W=(u,v)=>[cx+u*Math.cos(Ct.A)-v*Math.sin(Ct.A),cz+u*Math.sin(Ct.A)+v*Math.cos(Ct.A)];
    const hw=Ct.S[0]/2,sw=Ct.SW/2;
    // the steps of the Hall, just past the east edge of the court: the King kneels on the top step between the
    // middle columns, and the others stand on the portico floor behind them, a metre and a half up
    const STEP_U=hw-1.2,FLOOR=1.5;
    const made=[];const add=o=>{o.traverse(q=>{q.userData.noFingerprint=true;});scene.add(o);made.push(o);return o;};
    // ---- the people ----
    const cols=[0x6b5a48,0x3f4a5c,0x7a6e5e,0x5a3d3a,0x8a8478,0x2f3a33,0x9a8f7c,0x4b3f52].map(h=>new THREE.Color(h));
    const spots=[];
    for(let tries=0;spots.length<620&&tries<6000;tries++){
      const u=(R()-0.5)*(Ct.S[0]-6),v=(R()<0.5?-1:1)*(3.2+R()*(Ct.S[1]/2-5));
      if(Math.hypot(u,v)<10)continue;                                 // the pool
      if(Math.hypot(u-3,v+8)<4)continue;                              // the tree
      if(u>hw-8&&Math.abs(v)<8)continue;                               // the way up to the steps
      spots.push({u,v,face:v>0?Math.PI:0,d:R()*14,col:cols[Math.floor(R()*cols.length)]});}
    const crowdG=new THREE.CylinderGeometry(0.22,0.33,1.5,6).translate(0,0.75,0);
    const crowd=new THREE.InstancedMesh(crowdG,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),spots.length);
    spots.forEach((p,i)=>crowd.setColorAt(i,p.col));crowd.frustumCulled=false;add(crowd);
    // ---- the Guard, lining the way ----
    const guardM=new THREE.MeshLambertMaterial({color:0x24262d,flatShading:true}),silverM=new THREE.MeshPhongMaterial({color:0xd0d6de,specular:0xffffff,shininess:80});
    const lane=[];for(let u=-hw+3;u<hw-2;u+=3.2){if(Math.abs(u)<13)continue;for(const sd of [-1,1])lane.push([u,sd*2.4,sd>0?Math.PI:0]);}
    const gb=new THREE.InstancedMesh(new THREE.BoxGeometry(0.72,1.55,0.5).translate(0,0.78,0),guardM,lane.length),gh2=new THREE.InstancedMesh(new THREE.ConeGeometry(0.27,0.62,6).translate(0,1.86,0),silverM,lane.length);
    const D=new THREE.Object3D();
    lane.forEach(([u,v,f],i)=>{const [x,z]=W(u,v);D.position.set(x,B+0.55,z);D.rotation.set(0,f,0);D.scale.setScalar(SC);D.updateMatrix();gb.setMatrixAt(i,D.matrix);gh2.setMatrixAt(i,D.matrix);});
    gb.frustumCulled=gh2.frustumCulled=false;add(gb);add(gh2);gb.visible=gh2.visible=false;
    // ---- the King, the Steward, the Ring-bearer, Mithrandir; and the crown ----
    const king=add(figure(0x1c1c22,SC*1.1,0xf4f2ec)),gand=add(figure(0xf2f4f8,SC*1.1)),fara=add(figure(0x22232a,SC,0xd8dde4)),frodo=add(figure(0x5c6b52,SC*0.7));
    {const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(0.07,0),new THREE.MeshBasicMaterial({color:0x3cd08a}));jewel.position.set(0,1.38,0.24);king.add(jewel);}
    const crown=add(makeCrown());
    const place=(o,u,v,y,f)=>{const [x,z]=W(u,v);o.position.set(x,B+y,z);o.rotation.y=f;};
    place(gand,STEP_U+3.2,0.6,FLOOR+0.1,-Math.PI/2);place(fara,STEP_U+2.6,-3,FLOOR+0.1,-Math.PI/2);place(frodo,STEP_U+2.2,3,FLOOR+0.1,-Math.PI/2);
    king.visible=false;
    const flash=add(new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshBasicMaterial({color:0xf4f8ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})));
    // the way the King comes: in at the west of the court, round the pool on the south, up to the steps
    const way=[[-hw-4,0],[-12,0],[-8,10],[0,11],[8,10],[12,0],[STEP_U-0.6,0]];
    const wl=[];let WL=0;for(let i=1;i<way.length;i++){const l=Math.hypot(way[i][0]-way[i-1][0],way[i][1]-way[i-1][1]);wl.push(l);WL+=l;}
    const along=s=>{s=clamp(s,0,WL);for(let i=0;i<wl.length;i++){if(s<=wl[i]||i===wl.length-1){const k=s/wl[i];return [lerp(way[i][0],way[i+1][0],k),lerp(way[i][1],way[i+1][1],k),Math.atan2(way[i+1][0]-way[i][0],way[i+1][1]-way[i][1])];}s-=wl[i];}};
    const F=ctx.towerFlag;if(F)F.mesh.scale.y=0.02;
    let t=0,said=0,ks=0,bow=0,alive=true;
    const T_KING=16,T_STEPS=T_KING+WL/2.3,T_CROWN=T_STEPS+9,T_GO=T_CROWN+22,T_END=T_GO+16;
    const kingAt=()=>alive&&king.visible?king.position:null;
    H2.notice('The Coronation','- the people of the City come up into the Court of the Fountain, and the Guard of the Citadel lines the way to the steps of the Hall. The King is coming.',
      ()=>{const [x,z]=W(-hw-24,-40);const [tx,tz]=W(8,0);return [x,B+42,z,tx,B+4,tz];});
    const end=()=>{alive=false;crowning=false;for(const o of made)scene.remove(o);if(F)F.mesh.scale.y=1;};
    goPeace((now,dt)=>{t+=dt;
      // the people: in from the west of the court to their places, then facing the steps and bowing, then going
      const leave=t>T_GO?clamp((t-T_GO)/12,0,1):0;
      spots.forEach((p,i)=>{
        const k=clamp((t-p.d)/12,0,1),e=ease(k);let u=lerp(-hw-6,p.u,e),v=lerp(p.v*0.3,p.v,e);
        if(leave){const l=ease(clamp(leave*1.4-p.d/40,0,1));u=lerp(p.u,-hw-8,l);v=lerp(p.v,p.v*0.3,l);}
        const [x,z]=W(u,v);let f=k<1?Math.PI/2:p.face;if(t>T_CROWN+3&&!leave)f=Math.PI/2+(p.face?-0.3:0.3);if(leave&&leave<1)f=-Math.PI/2;
        D.position.set(x,B+0.55+(k<1||leave?Math.abs(Math.sin(t*6+i))*0.08:0),z);D.rotation.set(0,f+Ct.A,0);D.rotateX(bow*0.5);D.scale.setScalar(SC*(0.9+0.2*((i*37)%10)/10));
        D.updateMatrix();crowd.setMatrixAt(i,D.matrix);});
      crowd.instanceMatrix.needsUpdate=true;crowd.visible=leave<1;
      gb.visible=gh2.visible=t>6&&leave<0.8;
      // the King
      if(t>T_KING&&said<1){said=1;king.visible=true;H2.notice('The King','- clad in black mail girt with silver, and a long mantle all of pure white clasped at the throat with a great jewel of green, between the ranks of the Guard to the steps of the Hall.',
        ()=>{const p=king.position;return [p.x-30,p.y+14,p.z-26,p.x+6,p.y+2,p.z];},kingAt);}
      if(t>T_KING&&t<T_STEPS){ks=Math.min(WL,ks+2.3*dt);const [u,v,h]=along(ks);place(king,u,v,u>STEP_U-6?FLOOR*clamp((u-(STEP_U-6))/5,0,1):0.55,h+Ct.A);}
      // the Ring-bearer takes the crown to Mithrandir, and the King kneels
      const cF=clamp((t-T_STEPS-1)/4,0,1);
      {const [u,v]=[lerp(STEP_U+2.2,STEP_U+2.8,cF),lerp(3,1.2,cF)];const [x,z]=W(u,v);frodo.position.set(x,B+FLOOR+0.1,z);
       if(t<T_STEPS+6){crown.position.set(x,B+FLOOR+1.15,z);}}
      if(t>T_STEPS&&said<2){said=2;H2.notice('The crown','- the Steward brings the crown of Earnur in its casket; the Ring-bearer carries it to Mithrandir, and the King kneels.',
        ()=>{const [x,z]=W(STEP_U-16,-10),[tx,tz]=W(STEP_U+1,0);return [x,B+9,z,tx,B+2.2,tz];});}
      if(t>T_STEPS+5)king.scale.y=SC*1.1*lerp(1,0.66,clamp((t-T_STEPS-5)/1.5,0,1)*(t<T_CROWN+1?1:1-clamp((t-T_CROWN-1)/1.5,0,1)));
      if(t>T_STEPS+6){const k2=ease(clamp((t-T_STEPS-6)/(T_CROWN-T_STEPS-6),0,1));
        const hx=king.position.x,hy=king.position.y+1.75*king.scale.y,hz=king.position.z;
        crown.position.set(lerp(gand.position.x,hx,k2),lerp(B+FLOOR+2.4,hy+0.1,k2)+Math.sin(k2*Math.PI)*0.8,lerp(gand.position.z,hz,k2));}
      // the crowning
      if(t>T_CROWN&&said<3){said=3;
        H2.notice('Now come the days of the King','- Mithrandir sets the crown on his head, and the King\'s banner breaks out on the Tower: the White Tree, the seven stars and the crown. "And may they be blessed while the thrones of the Valar endure!"',null);
        const [tx,ty,tz]=Ct.tree;for(let k=0;k<700;k++){const a=R()*6.28,r=R()*14;petals.emit(tx+Math.cos(a)*r,ty+R()*6,tz+Math.sin(a)*r,(R()-0.5)*3,R()*1.5,(R()-0.5)*3,6+R()*8,0.6+R()*0.6);}}
      if(t>T_CROWN){const f=clamp(1-(t-T_CROWN)/2.5,0,1);flash.position.copy(king.position).y+=2.2;flash.scale.setScalar(2+(1-f)*16);flash.material.opacity=f*0.7;
        if(F)F.mesh.scale.y=Math.min(1,F.mesh.scale.y+dt*0.6);
        const [tx,ty,tz]=Ct.tree;if(R()<0.9)for(let k=0;k<3;k++){const a=R()*6.28,r=R()*10;petals.emit(tx+Math.cos(a)*r,ty+R()*3,tz+Math.sin(a)*r,(R()-0.5)*1.5,0,(R()-0.5)*1.5,7+R()*6,0.5+R()*0.5);}}
      // he rises and turns to the people, and they bow
      if(t>T_CROWN+1.5&&t<T_GO)king.rotation.y=lerp(Math.PI/2,-Math.PI/2,ease(clamp((t-T_CROWN-1.5)/2.5,0,1)))+Ct.A;
      bow=t>T_CROWN+5&&t<T_GO-2?ease(clamp((t-T_CROWN-5)/1.5,0,1))*(1-ease(clamp((t-T_CROWN-11)/1.5,0,1))):0;
      if(t>T_CROWN+5&&said<4){said=4;H2.notice('The people bow','- the whole court, as far as the walls of the Citadel, and then the cheering, and the silver trumpets of the Tower.',null);}
      // and then into the Hall, and the court empties
      if(t>T_GO){const k3=clamp((t-T_GO)/6,0,1);for(const o of [king,gand,fara,frodo]){o.rotation.y=Math.PI/2+Ct.A;const [x,z]=W(STEP_U+2+k3*8,(o===king?0:o===gand?0.6:o===fara?-3:3)*(1-k3));o.position.x=x;o.position.z=z;o.visible=k3<1;}
        crown.position.set(king.position.x,king.position.y+1.75*king.scale.y+0.1,king.position.z);crown.visible=k3<1;}
      if(t>T_END)return false;
    },end);}

  H=createHappenings(api,{
    events:{steward:['The Steward',steward],charge:['The horns of Rohan',charge],nazgul:['A Nazgul on the walls',nazgul],
      rider:['The White Rider',rider],mumakil:['Mumakil',mumakil],ships:['Black sails',ships],
      gate:['The Gate broken',gatebreak],tower:['A siege tower',tower],dead:['The Dead',dead]},
    order:['nazgul','tower','rider','mumakil','steward','gate','ships','tower','nazgul','steward'],
    active:()=>ctx.war!==false,
    colours:{bg:'rgba(14,14,20,.88)',fg:'#ece8dc',edge:'#6c6a72',btn:'rgba(40,40,52,.92)',btnEdge:'#9c98a4'}});
  H2=createHappenings(api,{
    events:{coronation:['The Coronation',coronation]},order:['coronation'],first:20000,every:[150000,240000],
    active:()=>ctx.war===false,
    colours:{bg:'rgba(24,26,34,.88)',fg:'#f4f1e8',edge:'#b8b4a0',btn:'rgba(60,62,76,.92)',btnEdge:'#d8d2b8'}});
  ctx.details=Object.assign(ctx.details||{},{events:10});
}
