// ================================================================ PORT KIT
// Shared port items, all through the instancing kit (kdef/kput), all prefixed
// `pk`. Instance colour multiplies each item's material, so one kdef serves
// every paint job. Sizes are real: a person is 1.75 m.
//
// Pivot conventions (what kput's position means):
//   containers, bollards, lamps, sheds, stalls: BOTTOM CENTRE, standing on y
//   fenders, ladders, vines: TOP, hanging down (scale y = length)
//   rail track, sleepers: BOTTOM CENTRE of a 20 m length along local +x
//   skiff, buoy: ON THE WATERLINE (put them at y = 0)
// ---------------------------------------------------------------- materials
TEX.pkRib=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // container side: 10 ribs per 3 m tile
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const rib=Math.cos(x/w*TAU*10);
  let v=205+rib*26+(fbm(x/14,y/14,2.5,2)-.5)*18;if(y<3||y>h-4)v-=40;d[i]=v;d[i+1]=v;d[i+2]=v-3;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.pkRibR=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;  // the same, rusting through
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const rib=Math.cos(x/w*TAU*10);
  let v=190+rib*24;const ru=clamp((fbm(x/9,y/34,4.4,3)-.38)*2.4,0,1)*clamp(y/h*1.3+.2,0,1);
  const dk=clamp((fbm(x/20,y/20,1.7,2)-.55)*3,0,1)*.35;
  d[i]=lerp(v,128+rib*14,ru)*(1-dk);d[i+1]=lerp(v,66+rib*8,ru)*(1-dk);d[i+2]=lerp(v-4,40,ru)*(1-dk);d[i+3]=255;}
 g.putImageData(id,0,0);});
// Paving: 4 m slabs with dark joints, 16 m tile. The ruined one is stained,
// cracked and green in the joints.
function pkPaveTex(ruin){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const sx=Math.floor(x/64),sy=Math.floor(y/64),fx=x%64,fy=y%64;
  let v=196+(h3(sx*1.3,sy*2.1,ruin?3:1)-.5)*20+(fbm(x/9,y/9,3.1,2)-.5)*22+(fbm(x/2.5,y/2.5,5.5,1)-.5)*10;
  const j=Math.min(fx,63-fx,fy,63-fy);let r,gg,b;
  if(j<1.2)v-=60;else if(j<2.2)v-=18;
  r=v;gg=v-2;b=v-8;
  if(ruin){const st=clamp((fbm(x/30,y/30,7.7,3)-.45)*2.2,0,1);r*=1-st*.42;gg*=1-st*.36;b*=1-st*.34;
   const cr=Math.abs(fbm(x/16,y/16,2.2,3)-.5)<.012;if(cr){r*=.55;gg*=.55;b*=.55;}
   if(j<2.5&&fbm(x/5,y/5,1.1,2)>.45){r=r*.5+30;gg=gg*.5+62;b=b*.5+20;}}
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});}
TEX.pkPave=pkPaveTex(false);TEX.pkPaveR=pkPaveTex(true);
// A paving sheet lies 3 cm over ground flattened to the same height; the
// polygon offset stops the two fighting at a distance.
MAT.pkPave=new THREE.MeshStandardMaterial({map:TEX.pkPave,color:0xd2ccc2,roughness:.92,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
MAT.pkPaveR=new THREE.MeshStandardMaterial({map:TEX.pkPaveR,color:0xa89e90,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
MAT.pkCont=new THREE.MeshStandardMaterial({map:TEX.pkRib,color:0xffffff,roughness:.62,metalness:.28});
MAT.pkContR=new THREE.MeshStandardMaterial({map:TEX.pkRibR,color:0xffffff,roughness:.85,metalness:.2});
MAT.pkIron=new THREE.MeshStandardMaterial({color:0x2c2e32,roughness:.55,metalness:.45});
MAT.pkRubber=new THREE.MeshStandardMaterial({color:0x1a1a1b,roughness:.9,metalness:0});
MAT.pkPaint=new THREE.MeshStandardMaterial({color:0xe9e8e4,roughness:.42,metalness:.3});      // painted white steel
MAT.pkSteel=new THREE.MeshStandardMaterial({color:0x8a8e92,roughness:.5,metalness:.5});
MAT.pkConc=new THREE.MeshStandardMaterial({color:0xcfcbc2,roughness:.9,metalness:0});          // plain cast concrete
MAT.pkCope=new THREE.MeshStandardMaterial({color:0xf0ede6,roughness:.7,metalness:.05});        // white coping stone
MAT.pkTide=new THREE.MeshStandardMaterial({color:0x2e3a26,roughness:1,metalness:0});           // weed and slime at the tide line
MAT.pkHull=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7,metalness:.05,side:DS});
MAT.pkSolarM=new THREE.MeshStandardMaterial({color:0x1b2c4e,roughness:.25,metalness:.6});
MAT.pkCloth=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,side:DS});
MAT.pkGlow=new THREE.MeshBasicMaterial({color:0xffffff});
TEX.pkAwn=canvasTex(64,64,(g,w,h)=>{for(let x=0;x<w;x+=8){g.fillStyle=(x/8)%2?'#f4f0e6':'#c9c2b4';g.fillRect(x,0,8,h);}});
MAT.pkAwn=new THREE.MeshStandardMaterial({map:TEX.pkAwn,color:0xffffff,roughness:.9,side:DS});

// ---------------------------------------------------------------- geometry
function pkBoxB(w,h,dp,tile){return boxUV(w,h,dp,tile).translate(0,h/2,0);}    // bottom-centred world-UV box
// ISO containers, length along local +x: 20 ft 6.06 x 2.59 x 2.44, 40 ft 12.19.
kdef('pkCont20',pkBoxB(6.06,2.59,2.44,3),MAT.pkCont);kdef('pkCont40',pkBoxB(12.19,2.59,2.44,3),MAT.pkCont);
kdef('pkCont20R',pkBoxB(6.06,2.59,2.44,3),MAT.pkContR);kdef('pkCont40R',pkBoxB(12.19,2.59,2.44,3),MAT.pkContR);
// cast-iron mooring bollard, 0.8 m, mushroom head
kdef('pkBollard',new THREE.LatheGeometry([[0,0],[.3,0],[.26,.08],[.2,.5],[.24,.58],[.36,.64],[.36,.74],[.2,.8],[0,.8]].map(p=>new THREE.Vector2(p[0],p[1])),10),MAT.pkIron);
// cylindrical rubber fender, hangs from its top, 1 m per unit y
kdef('pkFender',new THREE.CylinderGeometry(.45,.45,1,10).translate(0,-.5,0),MAT.pkRubber);
// a tyre (reclaimed fenders), axis along local z
kdef('pkTyre',new THREE.TorusGeometry(.5,.22,6,12),MAT.pkRubber);
// coping block, unit cube centred - scale it
kdef('pkCope',new THREE.BoxGeometry(1,1,1),MAT.pkCope);
// 10 m steel ladder hanging from its top: two stiles and rungs every 0.3 m
kdef('pkLadder',pkMergeGeo((()=>{const a=[new THREE.BoxGeometry(.07,10,.07).translate(-.24,-5,0),new THREE.BoxGeometry(.07,10,.07).translate(.24,-5,0)];
 for(let y=.15;y<10;y+=.3)a.push(new THREE.BoxGeometry(.48,.035,.035).translate(0,-y,0));
 a.push(new THREE.BoxGeometry(.07,1.1,.07).translate(-.24,.55,-.35),new THREE.BoxGeometry(.07,1.1,.07).translate(.24,.55,-.35));   // grab rails over the coping
 return a;})()),MAT.pkSteel);
// lamp mast, 14 m: tapered pole, an arm toward local +z, the housing
kdef('pkLamp',pkMergeGeo([new THREE.CylinderGeometry(.14,.26,14,8).translate(0,7,0),new THREE.CylinderGeometry(.34,.34,.5,8).translate(0,.25,0),
 new THREE.BoxGeometry(.18,.18,2.6).translate(0,13.8,1.2),new THREE.BoxGeometry(.7,.34,1.1).translate(0,13.8,2.6)]),MAT.pkPaint);
kdef('pkLampGlow',new THREE.BoxGeometry(.6,.08,.9).translate(0,13.6,2.6),MAT.pkGlow);
// rail track, 20 m along local +x: two rails 1.435 m gauge; sleepers separate (concrete)
kdef('pkRail',pkMergeGeo([new THREE.BoxGeometry(20,.16,.08).translate(0,.22,-.72),new THREE.BoxGeometry(20,.16,.08).translate(0,.22,.72)]),MAT.pkSteel);
kdef('pkSleepers',pkMergeGeo((()=>{const a=[];for(let x=-9.75;x<10;x+=.65)a.push(new THREE.BoxGeometry(.26,.14,2.5).translate(x,.07,0));return a;})()),MAT.pkConc);
// mooring buoy: float, cone, ring; on the waterline
kdef('pkBuoy',pkMergeGeo([new THREE.CylinderGeometry(1.1,1.25,1.6,12).translate(0,.1,0),new THREE.ConeGeometry(.5,1,8).translate(0,1.4,0),
 new THREE.TorusGeometry(.35,.07,5,10).rotateX(Math.PI/2).translate(0,1.95,0)]),MAT.pkHull);
// a 6 m skiff / rowboat on the waterline: an open double-ended hull (DoubleSide
// so its inside shows), two thwarts. Length along local +z.
kdef('pkSkiff',pkMergeGeo([gridSurface((u,v)=>{const s=v*2-1,L=6.2;const b=.92*Math.pow(Math.sin(Math.PI*clamp(u,0,1)),.6);
  const sheer=.42+.22*Math.pow(Math.abs(u*2-1),3);const dep=.72*Math.pow(Math.sin(Math.PI*clamp(u,0,1)),.35);
  return[b*s,sheer-(sheer+.3)*(dep/.72)*Math.pow(1-s*s,.7),(u-.5)*L];},14,8,{uS:2,vS:1}),
 new THREE.BoxGeometry(1.5,.05,.28).translate(0,.2,-.6),new THREE.BoxGeometry(1.2,.05,.28).translate(0,.2,1.3)]),MAT.pkHull);
// solar panel, 1 x 1.7 m, centred; tilt it with the quaternion
kdef('pkSolar',new THREE.BoxGeometry(1,.05,1.7),MAT.pkSolarM);
// small dish on a stub, facing local +z and up
kdef('pkDish',pkMergeGeo([new THREE.LatheGeometry([0,.25,.5,.75,1].map(r=>new THREE.Vector2(r*.9,r*r*.3)),10).rotateX(-Math.PI/2.6).translate(0,1.2,0),
 new THREE.CylinderGeometry(.05,.05,1.2,5).translate(0,.6,0)]),MAT.pkPaint);
// awning / cloth / line
kdef('pkAwn',new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),MAT.pkAwn);     // horizontal unit sheet, tilt it
kdef('pkCloth',new THREE.PlaneGeometry(1,1).translate(0,-.5,0),MAT.pkCloth);  // hangs from its top edge
kdef('pkLine',new THREE.BoxGeometry(1,.035,.035),MAT.pkRubber);               // rope / wire along local +x
// guard rail, 5 m along local +x: posts and two rails, bottom centre
kdef('pkGuard',pkMergeGeo([new THREE.BoxGeometry(5,.06,.06).translate(0,1.05,0),new THREE.BoxGeometry(5,.05,.05).translate(0,.55,0),
 new THREE.BoxGeometry(.07,1.1,.07).translate(-2.45,.55,0),new THREE.BoxGeometry(.07,1.1,.07).translate(0,.55,0)]),MAT.pkSteel);
// plain concrete column, unit radius and height, bottom at 0
kdef('pkCol',new THREE.CylinderGeometry(1,1,1,10).translate(0,.5,0),MAT.pkConc);
// timber stilt / pile
kdef('pkPile',new THREE.CylinderGeometry(1,1,1,6).translate(0,.5,0),MAT.timber);
// a flight of 8 timber steps, 2 m rise, 2.4 m going, along local +z, bottom at 0
kdef('pkStair',pkMergeGeo((()=>{const a=[];for(let i=0;i<8;i++)a.push(new THREE.BoxGeometry(1,.06,.34).translate(0,(i+1)*.25,i*.3+.15));
 a.push(new THREE.BoxGeometry(.06,.06,2.9).rotateX(-Math.atan2(2,2.4)).translate(-.5,1.1,1.2),new THREE.BoxGeometry(.06,.06,2.9).rotateX(-Math.atan2(2,2.4)).translate(.5,1.1,1.2));return a;})()),MAT.timber);
// a steel door and a window frame for container houses (unit, centred)
kdef('pkDoor',new THREE.BoxGeometry(1,1,.08),MAT.pkIron);
