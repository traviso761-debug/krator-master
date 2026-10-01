// ---------- 7. walls, gates, bridges ----------
function tooth(x,y,z,r,H,sides,ry,mat,capMat){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;
  g.add(mesh(polyTower(sides,0.72),mat,0,0,0,r,H,r,0));                         // tapering shaft
  g.add(mesh(polyTower(sides,1),capMat,0,H-2.2,0,r*0.76,2.2,r*0.76,0));       // collar band
  g.add(mesh(polyTower(sides,0.62),mat,0,H,0,r*0.7,H*0.22,r*0.7,0));          // blunt crown
  g.add(mesh(polyTower(sides,1),capMat,0,H*1.22,0,r*0.46,1.2,r*0.46,0));
  for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2+Math.PI/sides;g.add(mesh(boxG,darkM,Math.cos(a)*r*0.86,H*0.55,Math.sin(a)*r*0.86,1.2,H*0.28,1.2,-a));}  // slit windows
  return g;
}
const skipOuter=t=>GATES.some(g=>angDiff(t,g)<0.075),skipPal=t=>PGATES.some(pg=>angDiff(t,pg)<0.16),palR=t=>62+3*Math.sin(5*t);
// the same chord segments buildWall makes, with their outward normal (n) and along-wall direction (u)
function wallSegs(rf,cx,cz,n,skip){const out=[];for(let i=0;i<n;i++){const t0=i/n*2*Math.PI,t1=(i+1)/n*2*Math.PI,tm=(t0+t1)/2;if(skip&&skip(tm))continue;
  const a=[cx+rf(t0)*Math.cos(t0),cz+rf(t0)*Math.sin(t0)],b=[cx+rf(t1)*Math.cos(t1),cz+rf(t1)*Math.sin(t1)];
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]),u=[(b[0]-a[0])/len,(b[1]-a[1])/len];
  out.push({i,t0,t1,tm,a,b,m:[(a[0]+b[0])/2,(a[1]+b[1])/2],len,ang,u,n:[u[1],-u[0]],base:Math.min(terrainH(a[0],a[1]),terrainH(b[0],b[1]))-3,ty:terrainH(a[0],a[1])-3});}return out;}
const wpt=(sg,along,out)=>[sg.m[0]+sg.u[0]*along+sg.n[0]*out,sg.m[1]+sg.u[1]*along+sg.n[1]*out];
function buildWall(rf,cx,cz,n,H,wb,wt,mat,towerMat,skipFn,towerEvery,polyTowers){
  const g=new THREE.Group();
  const segG=rectFrus(1,+(wt/wb).toFixed(4));   // trapezoid cross-section, unit length: scaled per segment so every segment shares one geometry
  for(let i=0;i<n;i++){
    const t0=i/n*2*Math.PI,t1=(i+1)/n*2*Math.PI;
    if(skipFn&&skipFn((t0+t1)/2))continue;
    const a=[cx+rf(t0)*Math.cos(t0),cz+rf(t0)*Math.sin(t0)],b=[cx+rf(t1)*Math.cos(t1),cz+rf(t1)*Math.sin(t1)];
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    const base=Math.min(terrainH(a[0],a[1]),terrainH(b[0],b[1]))-3;
    g.add(mesh(segG,mat,(a[0]+b[0])/2,base,(a[1]+b[1])/2,len+1.2,H,wb,-ang));
    // parapet band along the wall top
    g.add(mesh(boxG,polyTowers?gateTopM:sandLightM,(a[0]+b[0])/2,base+H-0.4,(a[1]+b[1])/2,len+1.2,1.4,wt+1.2,-ang));
    if(i%towerEvery===0){
      const ty=terrainH(a[0],a[1])-3;
      if(polyTowers){                         // tetragonal wedge tower: wide along the wall, pinched to a ridge, blank faces
        g.add(mesh(towerWedgeG,towerMat,a[0],ty,a[1],wt+22,H+22,wt+10,-ang));
        g.add(mesh(boxG,gateTopM,a[0],ty+H+22,a[1],(wt+22)*0.36+0.6,0.9,(wt+10)*0.28+0.6,-ang));}
      else{g.add(mesh(frusG(0.85),towerMat,a[0],ty,a[1],wt+9,H+11,wt+9,-t0));g.add(mesh(frusPyr,towerMat,a[0],ty+H+8,a[1],wt+6,5,wt+6,-t0));}
    }
  }
  return g;
}
// a small wedge-hulled craft, used parked at the spaceport and flying the palace run
const shipHullM=new THREE.MeshLambertMaterial({color:0xb9bcc2});shipHullM.userData.tex='metal';const shipDarkM=new THREE.MeshLambertMaterial({color:0x5c5a54});
function makeShip(){const ship=new THREE.Group();
  ship.add(mesh(wedgeG,shipHullM,0,2.2,0,9,3.8,20,0));ship.add(mesh(rectFrus(0.5,0.5),shipHullM,0,2.2,-2,6,2.4,9,0));ship.add(mesh(boxG,shipDarkM,0,5.2,-6,0.5,4,5,0));
  [-3,3].forEach(sx=>{ship.add(mesh(cyl(0.5,0.9,2.2,8),shipDarkM,sx,1.1,0,1,1,1,0));ship.add(mesh(boxG,glowM,sx,3.2,-10.2,1.4,1.4,0.4,0));});
  ship.add(mesh(boxG,lamC(0xe07a2a),0,4.2,3,2.2,0.4,6,0));return ship;}
await stage('walls');
section('walls',()=>{
const skipGates=t=>GATES.some(g=>angDiff(t,g)<0.075);
scene.add(buildWall(wallR,0,0,84,22,13,7,wallM,wallDarkM,skipGates,3,true));
scene.add(buildWall(t=>62+3*Math.sin(5*t),PALACE.x,PALACE.z,28,11,7,4,sandM,sandM,t=>PGATES.some(pg=>angDiff(t,pg)<0.16),5,false));
// gun tower: polygonal shaft, parapet, and a twin-barrel turret on top
function gunTower(x,y,z,r,H,facing,mat){const g=new THREE.Group();g.position.set(x,y,z);
  g.add(mesh(polyTower(8,0.86),mat,0,0,0,r,H,r,0));g.add(mesh(polyTower(8,1),gateTopM,0,H-1.2,0,r*0.95,1.4,r*0.95,0));
  g.add(mesh(polyTower(8,1),wallDarkM,0,H,0,r*0.7,1.2,r*0.7,0));
  const tur=new THREE.Group();tur.position.y=H+1.2;tur.rotation.y=facing;g.add(tur);
  tur.add(mesh(cyl(r*0.28,r*0.32,1.8,10),wallDarkM,0,0.9,0,1,1,1,0));tur.add(mesh(sph(r*0.2,10,6),wallDarkM,0,1.9,0,1,1,1,0));
  [-0.8,0.8].forEach(sx=>{const b=mesh(cyl(0.22,0.28,r*1.1,8),shipDarkM,sx,1.7,r*0.5,1,1,1,0);b.rotation.x=Math.PI/2-0.18;tur.add(b);});
  tur.add(mesh(boxG,glowM,0,2.6,0,0.4,0.4,0.4,0));tur.userData.turret=true;tur.userData.dynamic=true;scene.userData.turrets=(scene.userData.turrets||[]).concat([tur]);return g;}
for(const PG of PGATES){ // palace gatehouses with flanking gun towers
  const R=62+3*Math.sin(5*PG),gx=PALACE.x+R*Math.cos(PG),gz=PALACE.z+R*Math.sin(PG),gy=terrainH(gx,gz)-3;const gr=new THREE.Group();gr.position.set(gx,gy,gz);gr.rotation.y=-PG;
  gr.add(mesh(boxG,sandM,0,-10,0,13,10,24,0));   // plinth into the slope
  [-1,1].forEach(sd=>gr.add(mesh(rectFrus(0.86,0.9),sandM,0,0,sd*7.75,13,19,8.5,0)));gr.add(mesh(boxG,sandM,0,10,0,12,9,8,0));gr.add(mesh(frusG(0.9),gateTopM,0,19,0,11,4,20,0));
  [-1,1].forEach(sd=>gr.add(mesh(boxG,wallDarkM,0,0,sd*3.7,11,10,0.4,0)));
  {const door=mesh(boxG,new THREE.MeshLambertMaterial({color:0xa8622c}),0,10,0,1,10,6.8,0);door.material.userData.tex='metal';door.userData.dynamic=true;gr.add(door);scene.userData.gateDoors=(scene.userData.gateDoors||[]).concat([{door,ribs:[],small:true}]);}
  gr.add(mesh(boxG,gateTopM,6.9,10.2,0,1,1,10,0));gr.add(mesh(boxG,gateTopM,6.7,12,0,1,0.8,8,0));for(let i=-1;i<=1;i++)gr.add(mesh(boxG,glowM,7.1,14,i*3.2,0.4,1.8,0.6,0));
  scene.add(gr);gunTower(gx-Math.sin(PG)*19.5,gy,gz+Math.cos(PG)*19.5,6,26,Math.PI/2-PG,sandM);gunTower(gx+Math.sin(PG)*19.5,gy,gz-Math.cos(PG)*19.5,6,26,Math.PI/2-PG,sandM);
}
// outer gates: sloped gatehouse, deco lintel bands, wedge flankers with gun turrets, bridge on piers across the moat
for(const g of GATES){
  const R=wallR(g),gr=new THREE.Group();gr.position.set(R*Math.cos(g),PLATEAU,R*Math.sin(g));gr.rotation.y=-g; // local +x = outward
  // hollow gatehouse: two battered side masses, a lintel over a 13-wide, 22-tall throughway, dark interior facing, and a door that drops from the lintel at night
  [-1,1].forEach(sd=>gr.add(mesh(rectFrus(0.84,0.9),wallM,0,-2,sd*15.75,28,38,18.5,0)));
  gr.add(mesh(boxG,wallM,0,22,0,26,14,14,0));                                     // lintel
  gr.add(mesh(frusG(0.9),gateTopM,0,36,0,24,8,42,0));                             // top band (also houses the raised door)
  [-1,1].forEach(sd=>gr.add(mesh(boxG,wallDarkM,0,0,sd*6.7,24,22,0.5,0)));       // interior wall facing
  gr.add(mesh(boxG,wallDarkM,0,21.6,0,24,0.5,13.5,0));                            // ceiling
  {const door=mesh(boxG,new THREE.MeshLambertMaterial({color:0xa8622c}),0,21.5,0,1.4,21.5,12.6,0);door.material.userData.tex='metal';door.userData.dynamic=true;gr.add(door);
   for(let k=-2;k<=2;k++){const rib=mesh(boxG,gateTopM,0.9,21.5,k*2.5,0.3,21.5,0.5,0);rib.userData.doorRib=true;rib.userData.dynamic=true;gr.add(rib);}   // (gr.add returns gr, so the tag used to land on the gatehouse and the ribs never moved)
   scene.userData.gateDoors=(scene.userData.gateDoors||[]).concat([{door,ribs:[...gr.children.filter(c=>c.userData.doorRib)]}]);}
  if(Math.abs(g-315*Math.PI/180)<0.01)gr.add(mesh(boxG,darkM,-13.5,0,0,1,21.5,12.8,0));   // this gate runs into the hill: a void at the inner mouth
  gr.add(mesh(towerWedgeG,wallDarkM,-2,-2,34,22,52,30,0));gr.add(mesh(towerWedgeG,wallDarkM,-2,-2,-34,22,52,30,0));
  gr.add(mesh(boxG,gateTopM,-2,50,34,8.5,0.9,9,0));gr.add(mesh(boxG,gateTopM,-2,50,-34,8.5,0.9,9,0));
  [34,-34].forEach(sz=>{const tur=new THREE.Group();tur.position.set(-2,50.9,sz);tur.rotation.y=Math.PI/2;gr.add(tur);
    tur.add(mesh(cyl(2,2.3,1.8,10),wallDarkM,0,0.9,0,1,1,1,0));tur.add(mesh(sph(1.4,10,6),wallDarkM,0,1.9,0,1,1,1,0));
    [-0.9,0.9].forEach(sx=>{const b=mesh(cyl(0.25,0.32,7,8),shipDarkM,sx,1.8,3.2,1,1,1,0);b.rotation.x=Math.PI/2-0.15;tur.add(b);});
    tur.userData.dynamic=true;tur.add(mesh(boxG,glowM,0,2.8,0,0.4,0.4,0.4,0));scene.userData.turrets=(scene.userData.turrets||[]).concat([tur]);});
  gr.add(mesh(boxG,gateTopM,14.6,22,0,1,1.4,30,0));gr.add(mesh(boxG,gateTopM,14.4,25,0,1,1.2,26,0));gr.add(mesh(boxG,gateTopM,14.2,28,0,1,1,22,0));
  for(let i=-2;i<=2;i++){gr.add(mesh(boxG,glowM,14.8,30.5,i*6,0.4,2.6,0.8,0));}
  // foundations: solid ground under the whole gatehouse and bridge abutment, down past the water
  gr.add(mesh(boxG,wallDarkM,-1,-40,0,32,38.2,52,0));gr.add(mesh(boxG,wallDarkM,10,-40,0,12,38.2,22,0));
  // bridge across the chasm
  gr.add(mesh(boxG,sandM,26,-3.2,0,52,3.2,15,0));
  gr.add(mesh(boxG,sandLightM,26,0,7.2,52,2.2,1.4,0));gr.add(mesh(boxG,sandLightM,26,0,-7.2,52,2.2,1.4,0));
  for(let i=0;i<4;i++){gr.add(mesh(frusG(0.7),sandM,8+i*13,-16,0,6,14,17,0));}
  scene.add(gr);
}
});
await stage('wall-details');
section('wall-details',()=>{
const OUT=wallSegs(wallR,0,0,84,skipOuter),PALS=wallSegs(palR,PALACE.x,PALACE.z,28,skipPal);ctx.wallSegs={OUT,PALS};
// the outfall goes on the tower-free stretch of the far side that is furthest from every gate
{let bs=-1;for(const sg of OUT){if(sg.i%3!==1||Math.sin(sg.tm)>-0.5)continue;const d=Math.min(...GATES.map(g=>angDiff(sg.tm,g)));if(d>bs){bs=d;SEWER.sg=sg;}}}
const scarpG=rectFrus(1,+(13/18).toFixed(4)),tscarpG=rectFrus(1,+(17/22).toFixed(4)),lean=WALL_LEAN;
for(const sg of OUT){
  // battered footing that carries the wall's outer edge down into the moat
  scene.add(mesh(scarpG,wallDarkM,sg.m[0],-12,sg.m[1],sg.len+1.2,sg.base+12,18,-sg.ang));
  if(sg.i%3===0)scene.add(mesh(tscarpG,wallDarkM,sg.a[0],-12,sg.a[1],29,sg.ty+12,22,-sg.ang));
  // merlons along the outer edge of the parapet, clear of the towers
  const L=sg.len+1.2,cnt=Math.floor(L/2.6),top=sg.base+22+1.0;
  for(let k=0;k<cnt;k++){const lx=-L/2+(k+0.5)*L/cnt;if(sg.i%3===0&&lx+sg.len/2<15)continue;if(sg.i%3===2&&sg.len/2-lx<15)continue;
    const q=wpt(sg,lx,3.65);scene.add(mesh(boxG,gateTopM,q[0],top,q[1],1.3,1.5,0.9,-sg.ang));}
  // a lantern on the outer face of every other tower between the searchlights
  if(sg.i%6===0&&sg.i%12!==0){const q=[sg.a[0]+sg.n[0]*5.9,sg.a[1]+sg.n[1]*5.9],y=sg.ty+24,k=LANTERNS.length,lt=[17.8+k*0.05,29.65-k*0.03,-1];
    scene.add(mesh(boxG,wallDarkM,q[0]-sg.n[0]*0.4,y-0.6,q[1]-sg.n[1]*0.4,1.2,0.4,1.4,-sg.ang));
    const gl=mesh(boxG,glowM,q[0],y-0.2,q[1],0.7,1.1,0.7,-sg.ang);gl.userData.glowColor=[1,0.72,0.35];gl.userData.glowSize=8;gl.userData.sched=1;gl.userData.lightT=lt;scene.add(gl);
    LANTERNS.push({t:Math.atan2(q[1],q[0]),lt});}
}
for(const sg of PALS){const L=sg.len+1.2,cnt=Math.floor(L/2.2),top=sg.base+11+1.0;
  for(let k=0;k<cnt;k++){const lx=-L/2+(k+0.5)*L/cnt;if(sg.i%5===0&&lx+sg.len/2<7)continue;if(sg.i%5===4&&sg.len/2-lx<7)continue;
    const q=wpt(sg,lx,2.25);scene.add(mesh(boxG,sandLightM,q[0],top,q[1],1.0,1.1,0.7,-sg.ang));}}
// ivy: grows in clumps along the wall, heaviest on the far side; climbs the inner face, hangs in curtains over the outer parapet
const cov=(s,back,k)=>smooth(0.42,0.72,vn(s*0.9,k)*(0.55+0.65*back));
for(const sg of OUT){const back=0.5-0.5*Math.sin(sg.tm),L=sg.len,cnt=Math.max(2,Math.round(L/3.2));
  for(let k=0;k<cnt;k++){const lx=-L/2+(k+0.5)*L/cnt+xrr(-0.4,0.4),amt=cov(sg.i+(lx+L/2)/L,back,5.3);if(amt<=0.02)continue;
    const nearTower=(sg.i%3===0&&lx+L/2<15)||(sg.i%3===2&&L/2-lx<15);if(nearTower)continue;
    const pw=L/cnt*xrr(1.0,1.35),wallTop=sg.base+22;
    if(xr()<0.9){const p0=wpt(sg,lx,-7),gy=terrainH(p0[0],p0[1])-0.25,ph=Math.min((4+14*amt)*xrr(0.7,1.1),wallTop-gy-0.3);
      if(ph>1){const q=wpt(sg,lx,-(6.5-lean*(gy-sg.base)+0.1));ivyPanel(false,q[0],gy,q[1],pw,ph,Math.atan2(-sg.n[0],-sg.n[1]),-Math.atan(lean));
        if(ph>=wallTop-gy-0.5){const c=wpt(sg,lx,-3.3);ivyClump(c[0],wallTop+1.05,c[1],xrr(0.6,1.0));}}}
    if(amt>0.25&&sg!==SEWER.sg){const top=wallTop+0.95,len=Math.min((3+13*amt)*xrr(0.7,1.1),20),q=wpt(sg,lx,4.22);
      ivyPanel(true,q[0],top,q[1],pw,len,Math.atan2(sg.n[0],sg.n[1]),-Math.atan(lean));const c=wpt(sg,lx,3.4);ivyClump(c[0],top+0.1,c[1],xrr(0.5,0.9));}}
  if(sg.i%3===0){const amt=cov(sg.i,back,5.3);
    if(amt>0.4)for(const side of [-1,1]){if(xr()<0.35)continue;const tl=0.139;
      const gp=[sg.a[0]-sg.n[0]*9.5,sg.a[1]-sg.n[1]*9.5],yb=side<0?terrainH(gp[0],gp[1])-0.25:sg.ty;
      const ph=(8+16*amt)*xrr(0.6,1.0),faceW=29-(29-10.44)*((yb-sg.ty)+ph)/44,pw=Math.max(2,faceW*xrr(0.2,0.35)),off=8.5-tl*(yb-sg.ty)+0.1,lx=xrr(-3,3);
      const q=[sg.a[0]+sg.u[0]*lx+sg.n[0]*side*off,sg.a[1]+sg.u[1]*lx+sg.n[1]*side*off];
      ivyPanel(false,q[0],yb,q[1],pw,ph,Math.atan2(side*sg.n[0],side*sg.n[1]),-Math.atan(tl));}}
}
const BARR=[0.35,1.15,3.4,4.35],plean=1.5/11;
for(const sg of PALS){if(PGATES.some(pg=>angDiff(sg.tm,pg)<0.24)||BARR.some(a=>angDiff(sg.tm,a)<0.32))continue;const L=sg.len,cnt=Math.max(2,Math.round(L/3));
  for(let k=0;k<cnt;k++){const lx=-L/2+(k+0.5)*L/cnt,amt=smooth(0.45,0.75,vn((sg.i+(lx+L/2)/L)*1.1,9.1));if(amt<=0.02)continue;
    if((sg.i%5===0&&lx+L/2<7)||(sg.i%5===4&&L/2-lx<7))continue;
    for(const side of [-1,1]){if(xr()<0.4)continue;const p0=wpt(sg,lx,side*4.2),gy=terrainH(p0[0],p0[1])-0.25,top=sg.base+11;
      const ph=Math.min((2+7*amt)*xrr(0.7,1.1),top-gy-0.2);if(ph<0.8)continue;
      const q=wpt(sg,lx,side*(3.5-plean*(gy-sg.base)+0.1));
      ivyPanel(false,q[0],gy,q[1],L/cnt*xrr(1,1.3),ph,Math.atan2(side*sg.n[0],side*sg.n[1]),-Math.atan(plean));}}}
});
await stage('sewer');
section('sewer',()=>{
