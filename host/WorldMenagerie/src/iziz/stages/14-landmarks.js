// ---------- 2. landmark massing ----------
const PALWIN=[];   // palace windows, built as one instanced set once the window material exists
// Palace fortress — terraced keep with the stepped watchtower from the painting
{
  const y0=terrainH(PALACE.x,PALACE.z)-3;const g=new THREE.Group();g.position.set(PALACE.x,y0,PALACE.z);
  g.add(mesh(frusG(0.93),sandM,0,0,0,96,14,84,0));
  g.add(mesh(frusG(0.9),sandM,4,14,-4,68,14,58,0));
  g.add(mesh(frusG(0.88),sandM,8,28,-8,46,22,40,0));
  g.add(mesh(frusG(0.85),sandM,16,50,-10,20,30,20,0));           // tower shaft
  g.add(mesh(frusG(0.85),sandLightM,16,80,-10,14,11,14,0));      // tower cap
  g.add(mesh(frusG(0.6),sandM,16,91,-10,8,7,8,0));
  g.add(mesh(frusPyr,sandLightM,16,98,-10,5,6,5,0));
  // stepped cornices at each terrace top (Mayan banding)
  g.add(mesh(boxG,sandLightM,0,12.6,0,91,1.5,80,0));
  g.add(mesh(boxG,sandLightM,4,26.6,-4,63,1.5,54,0));
  g.add(mesh(boxG,sandLightM,8,48.6,-8,42,1.5,37,0));
  g.add(mesh(boxG,sandLightM,16,78.8,-10,18.5,1.4,18.5,0));
  // window rows on every face; each row sits on the tapered face at that height
  const pw=(X,Y,Z,sx,sy,sz)=>{const hx=hash3(X,Y,Z);PALWIN.push([PALACE.x+X,y0+Y,PALACE.z+Z,sx,sy,sz,17.55+(Y/100)*0.5+0.12*hx,hash3(Z,X,Y)<0.6?29.4+0.6*hx:23+2*hx]);};   // lower terraces light first; most stay lit all night
  const windows=(cx,cz,w,d,taper,h,y0,rowY,n,ww,wh,skipFront)=>{const f=(rowY-y0)/h,hw=w/2*(1-(1-taper)*f),hd=d/2*(1-(1-taper)*f);
    for(let i=0;i<n;i++){const u=((i+0.5)/n-0.5)*1.7;
      if(!(skipFront&&skipFront(cx+u*hw)))pw(cx+u*hw,rowY,cz+hd,ww,wh,0.8);pw(cx+u*hw,rowY,cz-hd,ww,wh,0.8);
      pw(cx+hw,rowY,cz+u*hd,0.8,wh,ww);pw(cx-hw,rowY,cz+u*hd,0.8,wh,ww);}};
  windows(0,0,96,84,0.93,14,0,7,9,3,4);          // terrace 1
  windows(4,-4,68,58,0.9,14,14,20,6,3,4);        // terrace 2
  windows(8,-8,46,40,0.88,22,28,34,6,2.2,4,x=>x<13);   // keep; lower row routes around the hangar on the front face
  windows(8,-8,46,40,0.88,22,28,43,6,2.2,3);
  // hangar bay: deep dark opening in the keep's front face, jambs, lintel, lit sill, and a small pad on the terrace before it
  g.add(mesh(boxG,darkM,-2,28,10.5,24,11,5,0));
  g.add(mesh(boxG,darkM,-2,28,4,20,10,10,0));
  g.add(mesh(boxG,sandLightM,-2,39.2,12.2,26,1.4,2.2,0));
  g.add(mesh(boxG,sandLightM,-15.2,28,12.4,2,11.5,1.6,0));g.add(mesh(boxG,sandLightM,11.2,28,12.4,2,11.5,1.6,0));
  for(let i=-5;i<=5;i++)g.add(mesh(boxG,glowM,-2+i*2.2,28.05,13.3,1.2,0.25,0.5,0));
  g.add(mesh(cyl(4.5,4.5,0.35,20),new THREE.MeshLambertMaterial({color:0x8c7a5a}),-2,28.2,17.5,1,1,1,0));
  {const ring=mesh(torus(4.6,0.18,6,24),glowM,-2,28.45,17.5,1,1,1,0);ring.rotation.x=Math.PI/2;g.add(ring);}
  for(let i=0;i<3;i++)windows(16,-10,20,20,0.85,30,50,56+i*8,2,3,3);   // tower
  // pyramidal roofs and pavilions, all on their terrace tops
  [[-36,14,-30],[36,14,-32],[-38,14,-12],[22,28,14],[-6,50,-20]].forEach(p=>g.add(mesh(frusPyr,sandLightM,p[0],p[1],p[2],10,9,10,0)));
  [[-19,28,-14],[26,28,-16],[-38,14,4],[-4,50,4]].forEach(p=>g.add(mesh(boxG,sandM,p[0],p[1],p[2],10,8,8,0)));
  g.add(mesh(boxG,glowM,16,104,-10,1.4,2,1.4,0));                   // beacon
  scene.add(g);
}
// Temple — an elevated stepped pyramid carried on four buttress legs that taper to the ground, leaving an arched opening on every face; assembly hall beneath
{
  const y0=terrainH(TEMPLE.x,TEMPLE.z)-1;const g=new THREE.Group();g.position.set(TEMPLE.x,y0,TEMPLE.z);
  const tm=new THREE.MeshLambertMaterial({color:0xd9924a}),tmD=new THREE.MeshLambertMaterial({color:0xb8742e});tm.userData.tex='ashlar';tmD.userData.tex='ashlar';
  const LEG=18,BASE=52;
  // legs: wide at the top where they meet the pyramid corners, narrow at the foot
  const legG=rectFrus(2.6,2.6);
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(c=>{g.add(mesh(legG,tmD,c[0]*24,0,c[1]*24,7,LEG,7,0));g.add(mesh(boxG,tmD,c[0]*24,-0.5,c[1]*24,9,1.2,9,0));});
  // ring beam at the underside edge, with a soffit slab the pyramid sits on
  g.add(mesh(boxG,tmD,0,LEG-2.2,0,BASE+10,2.26,BASE+10,0));
  g.add(mesh(boxG,tm,0,LEG,0,BASE+6,1.26,BASE+6,0));
  for(let i=-3;i<=3;i++){g.add(mesh(boxG,glowM,i*7,LEG-2.3,BASE/2+4.9,2.2,0.3,0.3,0));g.add(mesh(boxG,glowM,BASE/2+4.9,LEG-2.3,i*7,0.3,0.3,2.2,0));}
  // the pyramid itself, lifted onto the slab
  let w=BASE,y=LEG+1.2;for(let i=0;i<4;i++){g.add(mesh(frusG(0.82),tm,0,y,0,w,8,w,0));g.add(mesh(boxG,sandLightM,0,y+6.96,0,w*0.82+1.5,1.1,w*0.82+1.5,0));y+=8;w*=0.8;}
  g.add(mesh(boxG,sandLightM,0,y+0.04,0,11,9,11,0));g.add(mesh(boxG,darkM,0,y+1,5.2,4,6,1,0));g.add(mesh(boxG,sandLightM,0,y+8.66,0,13,1,13,0));
  // assembly hall under the pyramid: paved floor, dais with a lit orb, low benches in rings
  g.add(mesh(cyl(24,24,0.5,24),sandLightM,0,0.4,0,1,1,1,0));
  g.add(mesh(polyTower(8,0.85),tmD,0,0.9,0,9,2.4,9,0));g.add(mesh(polyTower(8,0.85),tm,0,3.3,0,6,1.6,6,0));
  g.add(mesh(sph(1.6,12,8),glowM,0,6.5,0,1,1,1,0));
  g.add(mesh(cyl(0.3,0.3,2,6),tmD,0,5,0,1,1,1,0));
  for(let r=12;r<=20;r+=4)for(let i=0;i<Math.round(r*1.3);i++){const t=i/Math.round(r*1.3)*Math.PI*2;g.add(mesh(boxG,tmD,r*Math.cos(t),0.9,r*Math.sin(t),2.4,0.7,1,-t));}
  // grand stair from the plaza to the shrine, passing under the front ring beam and up the face
  {const footY=terrainH(TEMPLE.x,TEMPLE.z+52)-0.4-y0;const top=[0,LEG+1.2+32,11.5],bot=[0,footY,52];const rise=top[1]-bot[1],run=bot[2]-top[2],th=Math.atan2(rise,run),L=Math.hypot(rise,run);
   const st=new THREE.Mesh(boxG,sandLightM);st.scale.set(10,1.6,L);st.position.set(0,footY+rise/2,top[2]+run/2);st.rotation.x=th;g.add(st);
   [-6,6].forEach(sx=>{const b=new THREE.Mesh(boxG,tm);b.scale.set(1.6,3,L);b.position.set(sx,footY+rise/2,top[2]+run/2);b.rotation.x=th;g.add(b);});
   for(const f of [0.3,0.55,0.8]){const z=bot[2]-run*f,yy=footY+rise*f-1.2;const base=(z<BASE/2+5)?LEG:footY;if(yy>base+1)g.add(mesh(boxG,tmD,0,base,z,3,yy-base,3,0));}   // struts
   g.add(mesh(boxG,sandLightM,0,top[1]-0.2,top[2]+1.5,12,1.2,6,0));   // top landing
   g.add(mesh(boxG,sandLightM,0,footY-1,54,14,1.6,6,0));   // landing at the foot
   ctx.templeStair={y0:y0,foot:[0,footY,55],top:[0,top[1]+1,top[2]+1],platform:[0,top[1]+1,7]};}
  scene.add(g);
}
// Observation tower (the flared needle): steel shaft on a tripod, windowed drum with a railed balcony, beacon spire, exterior elevator
{const x=NEEDLE.x,z=NEEDLE.z,y=terrainH(x,z),H=NEEDLE_H;const g=new THREE.Group();g.position.set(x,y,z);
  const steel=new THREE.MeshLambertMaterial({color:0xc4c8cc});steel.userData.tex='metal';const steelD=new THREE.MeshLambertMaterial({color:0x6e7378});steelD.userData.tex='metal';const glass=new THREE.MeshLambertMaterial({color:0x2a3a4a});
  g.add(mesh(cyl(2.6,4.4,1,12),steel,0,H/2,0,1,H,1,0));                                    // shaft
  for(let k=0;k<3;k++){const t=k*Math.PI*2/3;const leg=mesh(cyl(0.9,1.6,1,8),steelD,7*Math.cos(t),9,7*Math.sin(t),1,20,1,0);leg.rotation.z=-Math.cos(t)*0.32;leg.rotation.x=Math.sin(t)*0.32;g.add(leg);}   // tripod
  for(let k=1;k<8;k++){const rg=mesh(torus(2.6+(4.4-2.6)*(1-k/8)+0.1,0.18,6,16),steelD,0,k*H/8,0,1,1,1,0);rg.rotation.x=Math.PI/2;g.add(rg);}
  g.add(mesh(cyl(15,9,1,24),steel,0,H+0.5,0,1,3.5,1,0));                                     // drum underside (flared)
  g.add(mesh(cyl(15,15,1,24),glass,0,H+4.5,0,1,3.6,1,0));                                    // window band
  for(let k=0;k<24;k++){const t=k/24*Math.PI*2;g.add(mesh(boxG,steelD,15.05*Math.cos(t),H+2.7,15.05*Math.sin(t),0.35,3.6,0.6,-t));}   // mullions
  g.add(mesh(cyl(16.5,15,1,24),steel,0,H+6.6,0,1,0.8,1,0));                                  // balcony deck (walk surface at H+7)
  {const rail=mesh(torus(16.3,0.12,6,48),steelD,0,H+8.2,0,1,1,1,0);rail.rotation.x=Math.PI/2;g.add(rail);}   // rail
  for(let k=0;k<32;k++){const t=k/32*Math.PI*2;g.add(mesh(boxG,steelD,16.3*Math.cos(t),H+7,16.3*Math.sin(t),0.15,1.2,0.15,0));}
  g.add(mesh(cyl(6,9,1,16),steel,0,H+7,0,1,3,1,0));g.add(mesh(hemiG,steel,0,H+10,0,6,4,6,0));   // cap
  g.add(mesh(cyl(0.25,0.5,1,6),steelD,0,H+14+6,0,1,12,1,0));const bc=mesh(sph(0.7,8,6),glowM,0,H+26.5,0,1,1,1,0);bc.userData.glowColor=[1,0.25,0.2];bc.userData.glowSize=10;bc.userData.sched=0;g.add(bc);
  // elevator: two rails on the +z side, a glazed cabin that the life system moves; entrance kiosk at the foot
  [-1.5,1.5].forEach(sx=>g.add(mesh(boxG,steelD,sx,0,5.2,0.3,H+7,0.3,0)));
  const cab=mesh(boxG,steel,0,0,5.2,2.6,3.2,2.4,0);g.add(cab);cab.add(mesh(boxG,glass,0,0.5,0.5,0.85,0.55,0.15,0));ctx.needleCab=cab;cab.userData.dynamic=true;
  g.add(mesh(boxG,sandM,0,0,7.6,4.6,3,2.4,0));const kd=mesh(boxG,darkM,0,0,8.9,1.8,2.6,0.3,0);g.add(kd);
  // a small plaza: paving ring, four lamp columns, benches
  const colM=new THREE.MeshLambertMaterial({color:0xe2b676});colM.userData.tex='sand';
  for(let k=0;k<4;k++){const t=k*Math.PI/2+Math.PI/4;const px2=18*Math.cos(t),pz2=18*Math.sin(t);g.add(mesh(cyl(0.5,0.7,6,8),colM,px2,3,pz2,1,1,1,0));const gl=mesh(sph(0.5,8,6),glowM,px2,6.6,pz2,1,1,1,0);gl.userData.glowSize=8;gl.userData.sched=1;g.add(gl);
    g.add(mesh(boxG,sandM,13*Math.cos(t+0.5),0,13*Math.sin(t+0.5),3.2,0.8,1.1,-(t+0.5)+Math.PI/2));}
  scene.add(g);ctx.needle={x,z,y,H};}
// Dome hall (the bullet-shaped dome)
{const x=25,z=40,y=terrainH(x,z);const g=new THREE.Group();g.position.set(x,y,z);
  g.add(mesh(cyl(16,17,1,20),sandM,0,7,0,1,14,1,0));
  g.add(mesh(hemiG,sandLightM,0,14,0,16,24,16,0));scene.add(g);}
// Crowned spire (the yellow flame-crowned pinnacle)
{const x=SPIRE.x,z=SPIRE.z,y=terrainH(x,z);const g=new THREE.Group();g.position.set(x,y,z);
  g.add(mesh(frusG(0.7),sandM,0,0,0,9,52,9,0));
  g.add(mesh(cone(1,1,5),glowM,0,58,0,4,12,4,0));
  [[3.5,0],[-3.5,0],[0,3.5],[0,-3.5]].forEach(p=>g.add(mesh(cone(1,1,4),glowM,p[0],55,p[1],1.6,6,1.6,0)));scene.add(g);}
