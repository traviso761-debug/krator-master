// ================================================================= PORTED — the Voth Embassy (a Voth clan compound in Iziz)
// Re-description of Voth's `voth_bldg_clan_compound` + the townhouse kinds (hlaalu / velothi / domed) against the
// Iziz kit. Voth is a Venice/Vivec-like Dunmer city: grey-brown ashlar (cooler than Iziz's orange sandstone), pale
// plaster upper walls, dark pantile roofs, gilded domes and finials, deep-red and dark-purple clan banners. The
// compound: a curtain wall with pilaster buttresses, four tapered corner bastions, a gatehouse; inside a Velothi
// tower (tapering octagonal drums, banded, domed), a hlaalu house (stacked, shrinking, corniced flat blocks), a
// domed hall, a paved court with a shrine obelisk, a well and an emperor-mushroom sapling in a stone planter.
// Shared `vp*` textures / materials / kit items for both ported buildings (75 + 76) live at the top of this file.

// ---------------------------------------------------------------- textures (near-grey, tinted per instance; 128 px = 2 m unless noted)
TEX.vpTile=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // pantile: courses 0.3 m, tiles 0.25 m, each tile rounded across
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/19),fy=y%19,off=(row%2)*8,fx=(x+off)%16,tx=Math.floor((x+off)/16);
  const curve=Math.sin(fx/16*Math.PI);let v=150+curve*46+(h3(tx*1.7,row*2.3,3.1)-.5)*30+(fbm(x/9,y/9,4.4,2)-.5)*14;
  if(fy>16)v-=55;else if(fy<1)v+=8;if(fx<1)v-=30;d[i]=v;d[i+1]=v*.92;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.vpBanco=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // hand-smoothed mud plaster: sweeping horizontal trowel strokes, fine grit
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let v=200+(fbm(x/40,y/9,5.1,3)-.5)*30+(fbm(x/6,y/6,2.7,2)-.5)*16+(fbm(x/2,y/2,8.8,1)-.5)*8;
  const band=Math.sin(y/128*Math.PI*7+fbm(x/30,0,1.3,2)*3);v+=band*5;const crack=fbm(x/14,y/14,6.2,2);if(Math.abs(crack-.5)<.005)v-=50;
  d[i]=v;d[i+1]=v*.95;d[i+2]=v*.88;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.vpMosaic=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // COLOUR texture: blue-and-white tesserae, 1 m per tile; a diamond lattice in the Order's blue
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const tx=Math.floor(x/8),ty=Math.floor(y/8),grout=(x%8<1)||(y%8<1);
  const u=(x/128)%.5,vv=(y/128);const diamond=Math.abs(u-.25)+Math.abs(vv-.5)<.24;const blue=diamond?(Math.abs(u-.25)+Math.abs(vv-.5)>.12):false;
  let r,gg,b;if(blue){r=42+h3(tx,ty,1)*30;gg=106+h3(tx,ty,2)*40;b=176+h3(tx,ty,3)*40;}else{r=236+h3(tx,ty,4)*14;gg=232+h3(tx,ty,5)*12;b=218+h3(tx,ty,6)*14;}
  if(diamond&&!blue){r=216;gg=150+h3(tx,ty,7)*30;b=48;}   // a warm gold heart in each diamond
  if(grout){r*=.55;gg*=.55;b*=.55;}d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.vpBanner=canvasTex(64,160,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // a hung banner: dark field (takes the tint), a pale device, a fringed foot
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const u=x/w-.5,v=y/h;let val=118+(fbm(x/6,y/6,2.2,2)-.5)*18+((x%3<1)?-6:0);
  const r=Math.hypot(u*1.9,(v-.42)*1.9);if(r<.36&&r>.28)val=240;if(Math.abs(u)<.03&&v>.2&&v<.64)val=240;if(Math.abs(v-.42)<.02&&Math.abs(u)<.22)val=240;   // ring + cross device
  if(v>.93&&((x%6)<3))val=0;if(v<.03)val=200;if(Math.abs(u)>.47)val*=.7;
  d[i]=val;d[i+1]=val;d[i+2]=val;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- materials
MAT.vpTile=new THREE.MeshStandardMaterial({map:TEX.vpTile,color:0xffffff,roughness:.9,metalness:0,side:DS});vWorldUV(MAT.vpTile,.5);
MAT.vpBanco=new THREE.MeshStandardMaterial({map:TEX.vpBanco,color:0xffffff,roughness:.98,metalness:0,side:DS});vWorldUV(MAT.vpBanco,.5);
MAT.vpMosaic=new THREE.MeshStandardMaterial({map:TEX.vpMosaic,color:0xffffff,roughness:.45,metalness:.05,side:DS});vWorldUV(MAT.vpMosaic,1);
MAT.vpGilt=new THREE.MeshStandardMaterial({color:0xd0a53c,roughness:.32,metalness:.75});
MAT.vpBanner=new THREE.MeshStandardMaterial({map:TEX.vpBanner,color:0xffffff,roughness:.9,metalness:0,side:DS});   // plain 0..1 UVs: the device must not tile
MAT.vpBrass=new THREE.MeshStandardMaterial({color:0xb08a3a,roughness:.4,metalness:.7});

// ---------------------------------------------------------------- geometry
const VPOCT=new THREE.CylinderGeometry(.86,1,1,8).translate(0,.5,0).rotateY(Math.PI/8);      // tapering octagonal drum, a FACE to the front
const VPOCTS=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0).rotateY(Math.PI/8);       // straight octagonal band
const VPDRUM=new THREE.CylinderGeometry(1,1,1,28).translate(0,.5,0);
const VPDISC=new THREE.CylinderGeometry(1,1,1,24).rotateX(Math.PI/2);                        // a disc facing ±z, thickness = scale z
const VPBANCO7=vnWedgeGeo(.93,.93), VPBANCO5=vnWedgeGeo(.55,.55), VPOBELISK=vnWedgeGeo(.42,.42);
// a wall slab W x H x T with a PARABOLIC opening ow x oh (Yuni's arch), base at y=0, centred in x and z
function vpArchGeo(W,H,T,ow,oh){const s=new THREE.Shape();s.moveTo(-W/2,0);s.lineTo(W/2,0);s.lineTo(W/2,H);s.lineTo(-W/2,H);s.lineTo(-W/2,0);
 const p=new THREE.Path();const n=18;p.moveTo(-ow/2,0);for(let i=1;i<n;i++){const x=-ow/2+ow*i/n;p.lineTo(x,oh*(1-Math.pow(2*x/ow,2)));}p.lineTo(ow/2,0);p.lineTo(-ow/2,0);s.holes.push(p);
 const g=new THREE.ExtrudeGeometry(s,{depth:T,bevelEnabled:false,curveSegments:8});g.translate(0,0,-T/2);g.computeVertexNormals();return g;}
// an ARCHIVOLT: the parabolic ring `t` thick round an opening ow x oh (a horseshoe polygon, so no hole touches the outline), extruded T
function vpArchRingGeo(ow,oh,t,T){const s=new THREE.Shape();const n=22,OW=ow+2*t,OH=oh+t;s.moveTo(-OW/2,0);for(let i=1;i<n;i++){const x=-OW/2+OW*i/n;s.lineTo(x,OH*(1-Math.pow(2*x/OW,2)));}s.lineTo(OW/2,0);s.lineTo(ow/2,0);
 for(let i=n-1;i>0;i--){const x=-ow/2+ow*i/n;s.lineTo(x,oh*(1-Math.pow(2*x/ow,2)));}s.lineTo(-ow/2,0);s.lineTo(-OW/2,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:T,bevelEnabled:false,curveSegments:8});g.translate(0,0,-T/2);g.computeVertexNormals();return g;}

// ---------------------------------------------------------------- kit items
kdef('vpTileB',VBOX,MAT.vpTile);kdef('vpTilePyr',VPYR,MAT.vpTile);kdef('vpTileHip',VHIP,MAT.vpTile);kdef('vpTileCone',VCONE,MAT.vpTile);
kdef('vpBancoB',VBOX,MAT.vpBanco);kdef('vpBanco7',VPBANCO7,MAT.vpBanco);kdef('vpBanco5',VPBANCO5,MAT.vpBanco);kdef('vpBancoCone',VCONE,MAT.vpBanco);
kdef('vpBancoPost',VPOST,MAT.vpBanco);kdef('vpDrumB',VPDRUM,MAT.vpBanco);kdef('vpDrumS',VPDRUM,MAT.stone);kdef('vpRingB',new THREE.TorusGeometry(1,.13,7,26),MAT.vpBanco);
kdef('vpDiscDark',VPDISC,MAT.void);kdef('vpDiscP',VPDISC,MAT.plaster);kdef('vpArchRingM',vpArchRingGeo(3.4,5.0,.55,.36),MAT.vpMosaic);kdef('vpArchRingB',vpArchRingGeo(3.4,5.0,.5,.3),MAT.vpBanco);kdef('vpDiscLit',VPDISC,MAT.warmPane);kdef('vpMosaicB',VBOX,MAT.vpMosaic);
kdef('vpGateArchB',vpArchGeo(7,6.5,1.6,3.4,5.0),MAT.vpBanco);kdef('vpBayArchB',vpArchGeo(3.2,4.0,.7,2.3,3.4),MAT.vpBanco);kdef('vpBayArchM',vpArchGeo(3.2,4.0,.7,2.3,3.4),MAT.vpMosaic);
kdef('vpOctS',VPOCT,MAT.stone);kdef('vpOctBand',VPOCTS,MAT.stone);kdef('vpObelisk',VPOBELISK,MAT.stone);
kdef('vpGilt',VBALL,MAT.vpGilt);kdef('vpGiltCone',VCONE,MAT.vpGilt);kdef('vpGiltDome',VDOME,MAT.vpGilt);kdef('vpBrassBell',new THREE.SphereGeometry(1,10,7,0,TAU,0,Math.PI*.62),MAT.vpBrass);
kdef('vpBanner',VPLANE,MAT.vpBanner);

// ---------------------------------------------------------------- local helpers (vp prefix)
// a hung banner: pole-less cloth `w` x `h` whose top edge is at y, facing `ry`, tinted
function vpHang(x,y,z,ry,w,h,c){kput('vpBanner',[x,y-h/2,z],vQ(ry,0,0),[w,h,1],c||null);}
// a banner on a pole: post, cross-arm, hung cloth turned across the arm
function vpBannerPole(x,y,z,ry,h,c){vPst('vPipe',x,y,z,.07,h,vC(0x3a2f22));const p=loc(x,z,.5,0,ry);vB('vIron',p[0],y+h-.25,p[1],1.0,.07,.07,ry,vC(0x3a2f22));vpHang(p[0],y+h-.3,p[1],ry+Math.PI/2,.85,2.6,c);}
// Voth window: a dark recess with a stone sill and a lintel; `lit` swaps the recess for a warm pane (electric)
function vpVWin(x,y,z,ry,w,h,c,lit){const f=loc(x,z,0,.04,ry);vB(lit?'vWinLit':'vDarkB',f[0],y,f[1],w,h,.12,ry);
 const s=loc(x,z,0,.16,ry);vB('vStone',s[0],y-.24,s[1],w+.55,.24,.42,ry,c);vB('vStone',s[0],y+h,s[1],w+.4,.2,.3,ry,c);
 if(lit){vB('vStone',f[0],y,f[1],.07,h,.14,ry,c);}}
// Voth door: recessed dark surround, leaf, stone lintel, one or two threshold steps, lamp if lit
function vpVDoor(x,y,z,ry,w,h,c,steps){const a=loc(x,z,0,.22,ry);vB('vStone',a[0],y,a[1],w+1.1,h+.8,.5,ry,c.clone().multiplyScalar(.82));
 const f=loc(x,z,0,.4,ry);vB('vDarkB',f[0],y,f[1],w,h,.2,ry);const l=loc(x,z,-w*.06,.5,ry);kput('vWood',[l[0],y+h/2,l[1]],vQ(ry,0,0).multiply(qEuler(0,.2,0)),[w*.9,h-.05,.07],vC(0x1c1a16));
 const t=loc(x,z,0,.3,ry);vB('vStone',t[0],y+h+.8,t[1],w+1.5,.35,.7,ry,c.clone().multiplyScalar(.8));
 for(let k=0;k<(steps||2);k++){const s=loc(x,z,0,.7+k*.4,ry);vB('vStone',s[0],y-(k+1)*.2,s[1],w+1.0-k*.2,.2,.8,ry,c.clone().multiplyScalar(.75));}
 if(vLit()){const q=loc(x,z,-(w/2+.9),0,ry);vnLamp(q[0],y+h+.3,q[1],ry);}}

// ---------------------------------------------------------------- the embassy
function buildVpEmbassy(G,o){reseed(7801+(o.v|0));
 const st=vC(vPick([0x8c8579,0x958e80,0x8b8069])),stD=st.clone().multiplyScalar(.78),cop=st.clone().multiplyScalar(.86),pl=vC(0xb8b0a2),tile=vC(vPick([0x5a4a48,0x4e4a52,0x6b5a58])),dome=vC(0xb08d3c),red=vC(0xa8241c),purple=vC(0x5a3586),timber=vC(0x4a3a28),iron=vC(0x3a2f22);
 const CW=34,CD=30,WT=1.0,WH=4.8,Y0=.35;
 vnReg('Voth Embassy',0,0,25.5,24,{role:'embassy'});
 // raised stone pad the whole compound stands on
 vB('vStone',0,0,0,CW+1.2,Y0,CD+1.2,0,stD);
 // ---- curtain wall: back, sides, front halves; coping; pilaster buttresses outside; a walkway ledge inside
 const hx=CW/2-WT/2,hz=CD/2-WT/2,GAP=5.2;
 vB('vStone',0,Y0,-hz,CW-2*WT,WH,WT,0,st);vB('vStone',0,Y0+WH-.1,-hz,CW-2*WT+.3,.3,WT+.3,0,cop);
 for(const s of[-1,1]){vB('vStone',s*hx,Y0,0,WT,WH,CD-2*WT,0,st);vB('vStone',s*hx,Y0+WH-.1,0,WT+.3,.3,CD-2*WT+.3,0,cop);
  const L=(CW-2*WT-GAP)/2,cx=s*(GAP/2+L/2);vB('vStone',cx,Y0,hz,L,WH,WT,0,st);vB('vStone',cx,Y0+WH-.1,hz,L+.3,.3,WT+.3,0,cop);}
 for(const s of[-1,1]){vB('vStone',0,Y0+2.5,s*(hz+.06),CW-2*WT,.22,WT+.12,0,cop);vB('vStone',s*(hx+.06),Y0+2.5,0,WT+.12,.22,CD-2*WT,0,cop);}   // string course
 for(const px of[-11,-5.5,0,5.5,11])for(const s of[-1,1]){if(s>0&&Math.abs(px)<8)continue;vB('vStone',px,Y0,s*(hz+.5),1.3,WH-.5,1.0,0,st.clone().multiplyScalar(.93));vB('vStone',px,Y0+WH-.5,s*(hz+.5),1.5,.25,1.2,0,cop);}
 for(const pz of[-9,-3,3,9])for(const s of[-1,1]){vB('vStone',s*(hx+.5),Y0,pz,1.0,WH-.5,1.3,0,st.clone().multiplyScalar(.93));vB('vStone',s*(hx+.5),Y0+WH-.5,pz,1.2,.25,1.5,0,cop);}
 // wall-walk inside: a corbelled ledge along the inner faces and a stone stair up to it beside the gate
 for(const s of[-1,1]){vB('vStone',s*(hx-WT/2-.45),Y0+3.5,0,.9,.3,CD-2*WT-1,0,cop);for(let k=0;k<5;k++)vB('vStone',s*(hx-WT/2-.45),Y0+3.1,-CD/2+4+k*5.5,.6,.4,.5,0,stD);}
 vB('vStone',0,Y0+3.5,-(hz-WT/2-.45),CW-2*WT-1,.3,.9,0,cop);for(let k=0;k<6;k++)vB('vStone',-CW/2+4+k*5.2,Y0+3.1,-(hz-WT/2-.45),.5,.4,.6,0,stD);
 for(let i=0;i<8;i++)vB('vStone',-(hx-WT/2-.7),Y0+i*.44,hz-WT/2-2.2-i*.75,1.4,.44,.8,0,st.clone().multiplyScalar(.9));
 // ---- corner bastions: tapered square towers oversailing the wall, cornice, cap, slits, a red clan banner on each
 for(const p of[[-1,-1],[1,-1],[-1,1],[1,1]]){const tx=p[0]*hx,tz=p[1]*hz,BH=9.4;kput('vBatterS',[tx,Y0,tz],null,[4.6,BH,4.6],st.clone().multiplyScalar(.96));
  vB('vStone',tx,Y0+BH-.05,tz,4.5,.4,4.5,0,cop);vB('vStone',tx,Y0+BH+.35,tz,3.9,.8,3.9,0,st);
  for(const s of[-1,1]){vB('vDarkB',tx+s*1.98,Y0+5.6,tz,.24,1.3,.5,0);vB('vDarkB',tx,Y0+5.6,tz+s*1.98,.5,1.3,.24,0);vB('vDarkB',tx+s*1.7,Y0+BH+.5,tz+p[1]*1.98,.5,.55,.2,0);}
  vpBannerPole(tx,Y0+BH+1.15,tz,p[0]>0?-Math.PI/2:Math.PI/2,3.6,red);}
 // ---- gatehouse: a block across the wall line, dark arched-lintel passage, iron-studded leaves half open, lamps, banners red + purple
 {const gz=hz,GW=9.2,GD=4.2,GH=8.2;for(const s of[-1,1])vB('vStone',s*(GW/4+.9),Y0,gz,GW/2-1.8,4.6,GD,0,st);vB('vStone',0,Y0+4.6,gz,GW,GH-4.6,GD,0,st);   // piers + the storey over the passage: a REAL opening
  vB('vFlag',0,Y0-.02,gz,3.6,.06,GD+.4,0,cop);vB('vStone',0,Y0+GH-.1,gz,GW+.4,.4,GD+.4,0,cop);vB('vStone',0,Y0+GH+.3,gz,GW-1.4,.9,GD-1.2,0,st.clone().multiplyScalar(.95));
  for(let k=-2;k<=2;k++)vB('vStone',k*2.0,Y0+GH+1.2,gz+GD/2-.4,1.0,.7,.6,0,st);   // merlons on the front parapet
  vB('vStone',0,Y0+4.6,gz+GD/2+.1,5.2,.55,.9,0,cop);vB('vStone',0,Y0+4.6,gz-GD/2-.1,5.2,.55,.9,0,cop);vB('vStone',0,Y0+5.15,gz+GD/2+.05,4.4,.25,.5,0,st);
  for(const s of[-1,1]){vB('vStone',s*2.25,Y0,gz+GD/2+.1,.9,4.8,.7,0,st.clone().multiplyScalar(.9));vB('vStone',s*2.25,Y0,gz-GD/2-.1,.9,4.8,.7,0,st.clone().multiplyScalar(.9));
   kput('vWood',[s*1.2,Y0+2.2,gz+GD/2-1.1],vQ(0,0,0).multiply(qEuler(0,s*.95,0)),[1.85,4.3,.12],vC(0x2a221a));   // gate leaves, swung inward, seen from the street
   for(const yy of[1.0,2.3,3.6])kput('vIron',[s*1.2,Y0+yy,gz+GD/2-1.1],vQ(0,0,0).multiply(qEuler(0,s*.95,0)),[1.7,.1,.16],iron);
   vpVWin(s*3.0,Y0+5.6,gz+GD/2,0,.8,1.4,st,false);vpVWin(s*3.0,Y0+5.6,gz-GD/2,Math.PI,.8,1.4,st,vLit());
   vpBannerPole(s*3.6,Y0+GH+1.2,gz-.6,0,4.2,s<0?red:purple);
   if(vLit()){vnLamp(s*2.9,Y0+4.3,gz+GD/2,0);vnLamp(s*2.9,Y0+4.3,gz-GD/2,Math.PI);}}
  vpHang(0,Y0+GH-.4,gz+GD/2+.12,0,2.2,3.0,purple);vpHang(0,Y0+GH-.4,gz-GD/2-.12,Math.PI,2.2,3.0,red);          // the embassy's colours on the gate itself
  vB('vStone',0,0,gz+GD/2+.5,4.6,.175,1.1,0,stD);                                                               // a step down to the street
  for(const s of[-1,1])vnLampPost(s*3.6,0,gz+GD/2+.8,3.6);}
 // ---- Velothi tower, back-left: base, three tapering octagonal drums with bands, a gilt dome; porch, slits, bracketed balcony
 {const tx=-10,tz=-8.5;let y=Y0;const apo=Math.cos(Math.PI/8);const drums=[[3.6,8.0],[3.0,6.4],[2.35,3.6]];
  kput('vpOctBand',[tx,y,tz],null,[3.9,1.0,3.9],stD);y+=1.0;
  const faceAt=(r,h,t)=>(r*(1-.14*t/h))*apo;const face0=[];
  drums.forEach((d,i)=>{kput('vpOctS',[tx,y,tz],null,[d[0],d[1],d[0]],st.clone().multiplyScalar(1+i*.03));face0.push(y);
   const rt=d[0]*.86;y+=d[1];kput('vpOctBand',[tx,y,tz],null,[rt+.12,.45,rt+.12],cop);y+=.45;});
  kput('vpOctBand',[tx,y,tz],null,[2.15,.5,2.15],st);y+=.5;kput('vDomeP',[tx,y,tz],null,[2.0,1.7,2.0],dome);vBall('vpGilt',tx,y+1.85,tz,.4);vPst('vPipe',tx,y+1.6,tz,.05,1.4,iron);vpHang(tx+.35,y+2.9,tz,Math.PI/2,.6,1.4,red);
  // slit windows round the drums on the flats (k*45°, face 0 = +z front)
  drums.forEach((d,i)=>{const yb=face0[i];const rows=i===0?[2.6,5.6]:[d[1]*.5];for(const yy of rows)for(let k=0;k<8;k++){if(i===0&&k===0)continue;if(i===2&&k%2===0)continue;const a=k*Math.PI/4;const r=faceAt(d[0],d[1],yy)+.02;
    const p=[tx+Math.sin(a)*r,tz+Math.cos(a)*r];vpVWin(p[0],yb+yy-.7,p[1],a,k%2?.6:.95,1.4,st,vLit()&&i<2&&k%2===0);}});
  // porch on the front flat of the first drum
  {const g0=faceAt(drums[0][0],drums[0][1],1.6);const pz=tz+g0;vpVDoor(tx,Y0+1.0,pz,0,1.7,2.7,st,2);
   for(const s of[-1,1]){vPst('vpDrumS',tx+s*1.75,Y0+1.0,pz+.9,.28,3.9,st.clone().multiplyScalar(.9));vB('vStone',tx+s*1.75,Y0+4.9,pz+.9,.8,.3,.8,0,cop);}
   vB('vStone',tx,Y0+5.2,pz+.45,4.4,.4,1.6,0,cop);}
  // bracketed balcony over the porch on the second drum's front flat
  {const yb=face0[1]+1.3;const b0=tz+faceAt(drums[1][0],drums[1][1],1.3);vB('vStone',tx,yb,b0+.8,4.6,.3,1.7,0,cop);
   for(const ox of[-1.7,1.7])vBeam([tx+ox,yb,b0],[tx+ox,yb-1.1,b0+1.4],.3,timber);
   vB('vWood',tx,yb+.3,b0+1.55,4.6,.8,.14,0,timber);for(const ox of[-2.25,2.25])vB('vWood',tx+ox,yb+.3,b0+.8,.14,.8,1.6,0,timber);}
  // external stair up the left flank to a first-floor door, and a stone buttress at the back
  {const sx=tx-faceAt(drums[0][0],drums[0][1],2)-.5;for(let i=0;i<7;i++)vB('vStone',sx+.08*i,Y0+i*.6,tz-3.2+i*.9,1.5,.6,1.0,0,st.clone().multiplyScalar(.9));
   const fx=tx-faceAt(drums[0][0],drums[0][1],4.5);vB('vStone',(sx+fx)/2,Y0+4.2,tz-5.3,fx-sx+.6,.3,2.0,0,cop);vB('vDarkB',fx-.1,Y0+4.5,tz-5.3,.3,2.2,1.3,0);vB('vStone',fx-.15,Y0+6.7,tz-5.3,.4,.3,1.9,0,cop);vBeam([sx-.2,Y0+.9,tz-3.2],[sx+.5,Y0+5.4,tz+3.8],.08,timber,'vIron');
   kput('vBatterS',[tx,Y0,tz-4.4],null,[1.5,6.4,1.5],st.clone().multiplyScalar(.95));vB('vStone',tx,Y0+6.4,tz-4.4,1.7,.4,1.7,0,cop);}}
 // ---- hlaalu house, back-right: stacked shrinking flat blocks (stone below, pale plaster above), cornices, balcony, chimney
 {const lev=[];let jx=7.2,jz=-8.6,y=Y0,fw=12.5,fd=9.2;const hs=[6.0,4.8,3.6];
  vB('vStone',jx,Y0,jz,fw+.8,.4,fd+.8,0,stD);y+=.4;
  hs.forEach((fh,i)=>{if(i>0){jx+=rr(-.5,.5);jz+=rr(-.4,.2);}const item=i===0?'vStone':'vPlaster',c=i===0?st:pl;vB(item,jx,y,jz,fw,fh,fd,0,c);
   if(i>0)for(const sx of[-1,1])for(const sz of[-1,1])vB('vStone',jx+sx*(fw/2-.35),y,jz+sz*(fd/2-.35),.7,fh,.7,0,st.clone().multiplyScalar(.9));   // stone quoins on the plaster storeys
   vB('vStone',jx,y+fh-.28,jz,fw+.4,.36,fd+.4,0,cop);lev.push({x:jx,z:jz,y,w:fw,d:fd,h:fh});y+=fh;fw*=.8;fd*=.8;});
  const L0=lev[0],L1=lev[1],L2=lev[2];vB('vStone',L2.x,y,L2.z,L2.w*.9,.7,L2.d*.9,0,cop);
  // openings on every elevation
  const row=(L,side,ys,n,spread,ww,wh,lit)=>{for(let i=0;i<n;i++){const u=n===1?0:-spread+2*spread*i/(n-1);
   if(side===0)vpVWin(L.x+u,L.y+ys,L.z+L.d/2,0,ww,wh,st,lit);else if(side===1)vpVWin(L.x+u,L.y+ys,L.z-L.d/2,Math.PI,ww,wh,st,lit);
   else if(side===2)vpVWin(L.x+L.w/2,L.y+ys,L.z+u,Math.PI/2,ww,wh,st,lit);else vpVWin(L.x-L.w/2,L.y+ys,L.z+u,-Math.PI/2,ww,wh,st,lit);}};
  const lit=vLit();row(L0,0,1.5,2,3.9,1.3,1.8,lit);row(L0,0,4.2,3,4.2,1.1,1.3,false);row(L0,2,1.6,2,2.6,1.2,1.7,lit);row(L0,3,1.6,2,2.6,1.2,1.7,lit);row(L0,1,1.6,3,3.6,1.1,1.6,false);
  row(L1,0,1.4,3,3.4,1.2,1.7,lit);row(L1,2,1.4,2,2.2,1.1,1.5,lit);row(L1,3,1.4,2,2.2,1.1,1.5,false);row(L1,1,1.4,2,2.6,1.0,1.4,false);
  row(L2,0,1.1,2,2.0,1.0,1.4,lit);row(L2,1,1.1,1,0,1.0,1.3,false);row(L2,2,1.1,1,0,.9,1.3,false);
  vpVDoor(L0.x-2.4,L0.y,L0.z+L0.d/2,0,1.7,2.8,st,2);
  // first-floor balcony on timber brackets across the front
  {const by=L0.y+L0.h-.1,bz=L0.z+L0.d/2;vB('vStone',L0.x,by,bz+.7,6.6,.3,1.5,0,cop);for(const ox of[-2.6,2.6])vBeam([L0.x+ox,by,bz],[L0.x+ox,by-1.2,bz+1.3],.32,timber);
   vB('vWood',L0.x,by+.3,bz+1.38,6.6,.8,.14,0,timber);for(const ox of[-3.25,3.25])vB('vWood',L0.x+ox,by+.3,bz+.7,.14,.8,1.5,0,timber);for(let k=-5;k<=5;k++)vB('vWood',L0.x+k*.6,by+.3,bz+1.38,.07,.8,.07,0,timber);}
  // roof furniture: chimney, a drain pipe, a small dome-capped stair turret on the top block
  {const cx=L1.x+L1.w/2-1.1,cz=L1.z-L1.d/2+1.1;vB('vStone',cx,L1.y+L1.h,cz,.85,2.8,.85,0,stD);vB('vStone',cx,L1.y+L1.h+2.8,cz,1.15,.5,1.15,0,cop);vPst('vPipe',cx,L1.y+L1.h+3.3,cz,.22,.5,iron);}
  vPst('vPipe',L0.x+L0.w/2+.2,Y0+.4,L0.z+L0.d/2-.6,.11,L0.h+L1.h-.3,st.clone().multiplyScalar(.7));
  vPst('vpDrumS',L2.x-L2.w/2+1.3,y+.7,L2.z,1.0,1.2,st);kput('vDomeP',[L2.x-L2.w/2+1.3,y+1.9,L2.z],null,[1.05,.8,1.05],dome);vBall('vpGilt',L2.x-L2.w/2+1.3,y+2.8,L2.z,.18);
  }
 // ---- service range (kitchen / stable) against the right wall: stone, dark pantile hip roof, chimney, stable door
 {const rx=13,rz=4,RW=5.6,RD=6.4,RH=3.4;vB('vStone',rx,Y0,rz,RW,RH,RD,0,st.clone().multiplyScalar(.95));vB('vStone',rx,Y0+RH-.1,rz,RW+.3,.28,RD+.3,0,cop);
  vnHipRoof('vpTileHip',rx,Y0+RH+.55,rz,RW,RD,2.0,0,tile,.8);vB('vStone',rx-1.8,Y0+RH,rz-2.2,.7,2.4,.7,0,stD);vB('vStone',rx-1.8,Y0+RH+2.4,rz-2.2,.95,.4,.95,0,cop);
  vB('vDarkB',rx-RW/2-.02,Y0,rz+1.2,.2,2.4,1.8,0);kput('vWood',[rx-RW/2-.1,Y0+1.2,rz+1.2],qEuler(0,Math.PI/2,0),[1.7,2.3,.08],vC(0x2a221a));vpVWin(rx-RW/2,Y0+1.6,rz-1.6,-Math.PI/2,.9,1.0,st,false);vpVWin(rx,Y0+1.6,rz+RD/2,0,.9,1.0,st,false);
  vnBarrel(rx-RW/2-1.0,Y0,rz-2.4,.38,.9,timber);vnCrate(rx-RW/2-1.2,Y0,rz+2.8,.8,.3,timber);} // ---- domed hall (the embassy's audience room), left of the court: corniced stone block, ribbed drum, gilt-ochre dome, lucarnes, corner urns
 {const hx2=-11,hz2=4.5,HW=8.4,HD=7.0,HH=5.6;vB('vStone',hx2,Y0,hz2,HW+.6,.4,HD+.6,0,stD);vB('vStone',hx2,Y0+.4,hz2,HW,HH,HD,0,st);
  vB('vStone',hx2,Y0+.4+HH*.5,hz2,HW+.3,.26,HD+.3,0,cop);vB('vStone',hx2,Y0+.4+HH-.2,hz2,HW+.4,.4,HD+.4,0,cop);vB('vStone',hx2,Y0+.4+HH+.2,hz2,HW-.8,.5,HD-.8,0,st.clone().multiplyScalar(.95));
  const dy=Y0+.4+HH+.7;vPst('vpDrumS',hx2,dy,hz2,2.7,2.4,st.clone().multiplyScalar(1.04));
  for(let i=0;i<8;i++){const a=i/8*TAU;vB('vStone',hx2+Math.sin(a)*2.7,dy,hz2+Math.cos(a)*2.7,.3,2.4,.3,-a,cop);if(i%2===0)vB(vLit()?'vWinLit':'vDarkB',hx2+Math.sin(a)*2.68,dy+.7,hz2+Math.cos(a)*2.68,.9,1.2,.3,-a);}
  vB('vStone',hx2,dy+2.4,hz2,5.9,.3,5.9,0,cop);kput('vDomeP',[hx2,dy+2.7,hz2],null,[2.85,2.5,2.85],dome);vBall('vpGilt',hx2,dy+5.3,hz2,.36);
  for(const p of[[-1,-1],[1,-1],[-1,1],[1,1]]){const ux=hx2+p[0]*(HW/2-.6),uz=hz2+p[1]*(HD/2-.6);vB('vStone',ux,Y0+.4+HH+.2,uz,.9,.9,.9,0,cop);vBall('vpGilt',ux,Y0+.4+HH+1.4,uz,.32);}
  vpVDoor(hx2+HW/2,Y0+.4,hz2,Math.PI/2,1.6,2.6,st,1);   // door faces the court
  vpVWin(hx2+HW/2,Y0+1.9,hz2-2.4,Math.PI/2,1.2,1.7,st,vLit());vpVWin(hx2+HW/2,Y0+1.9,hz2+2.4,Math.PI/2,1.2,1.7,st,vLit());
  for(const z of[-2.2,0,2.2])vpVWin(hx2-HW/2,Y0+1.9,hz2+z,-Math.PI/2,1.1,1.6,st,false);for(const x of[-2.4,0,2.4]){vpVWin(hx2+x,Y0+1.9,hz2+HD/2,0,1.1,1.6,st,vLit());vpVWin(hx2+x,Y0+1.9,hz2-HD/2,Math.PI,1.1,1.6,st,false);}
  // a corbelled projecting bay on the front, as the domed townhouse has
  vB('vStone',hx2+2.4,Y0+3.2,hz2+HD/2+.7,2.8,2.4,1.4,0,st.clone().multiplyScalar(1.03));vB('vStone',hx2+2.4,Y0+5.6,hz2+HD/2+.7,3.1,.3,1.7,0,cop);vBeam([hx2+2.4,Y0+3.2,hz2+HD/2],[hx2+2.4,Y0+2.0,hz2+HD/2+1.2],.45,timber);
  vB('vDarkB',hx2+2.4,Y0+3.8,hz2+HD/2+1.42,1.7,1.4,.1,0);}
 // ---- the court: paving, a paved way from the gate to the house, a shrine obelisk on a stepped base, a well, the emperor-mushroom sapling in a stone planter, lamps
 vnPaving(0,Y0+.02,2,26,22,0,st.clone().multiplyScalar(.9),40);
 vB('vFlag',0,Y0+.03,8.4,3.4,.1,9.6,0,cop);vB('vFlag',2.6,Y0+.03,-1.6,7.6,.1,2.6,0,cop);
 {const ox=0,oz=1.5;for(let k=0;k<3;k++)vB('vStone',ox,Y0+k*.3,oz,3.6-k*.8,.3,3.6-k*.8,0,k%2?st:stD);kput('vpObelisk',[ox,Y0+.9,oz],null,[1.15,6.2,1.15],st.clone().multiplyScalar(1.05));
  kput('vPyrS',[ox,Y0+7.1,oz],null,[.5,.5,.5],cop);vBall('vpGilt',ox,Y0+7.7,oz,.16);for(let k=0;k<4;k++){const a=k*Math.PI/2;vB('vDarkB',ox+Math.sin(a)*.55,Y0+2.2,oz+Math.cos(a)*.55,.3,1.4,.06,-a);}
  if(vLit())for(const s of[-1,1]){vPst('vPipe',ox+s*1.35,Y0+.6,oz,.04,.5,iron);vBall('vBulb',ox+s*1.35,Y0+1.2,oz,.1);}}
 {const wx=8.5,wz=6.5;vPst('vpDrumS',wx,Y0,wz,1.5,.9,stD);vPst('vpDrumS',wx,Y0+.9,wz,1.3,.2,cop);vB('vDarkB',wx,Y0+1.1,wz,1.8,.06,1.8,0);
  for(const s of[-1,1])vPst('vPipe',wx+s*1.35,Y0+.9,wz,.09,2.4,iron);vB('vIron',wx,Y0+3.2,wz,2.9,.1,.1,0,iron);vPst('vRope',wx,Y0+1.3,wz,.02,1.9,vC(0x8a7a5a));vnBarrel(wx+.5,Y0+1.1,wz+.4,.2,.32,timber);}
 {const px=-4,pz=8.5;vB('vStone',px,Y0,pz,3.2,.9,3.2,0,st);vB('vStone',px,Y0+.9,pz,3.5,.2,3.5,0,cop);vB('vClayB',px,Y0+1.0,pz,2.7,.12,2.7,0,vC(0x4a3a2c));
  const fungus=vC(0x9a8aa2),gill=vC(0xe8dce4,1.4);vPst('vPostB',px,Y0+1.0,pz,.42,4.6,vC(0xc8c0c8));kput('vDomeP',[px,Y0+5.4,pz],null,[3.4,1.5,3.4],fungus);kput('vpDiscP',[px,Y0+5.36,pz],qEuler(Math.PI/2,0,0),[3.25,3.25,.14],gill);
  kput('vDomeP',[px,Y0+6.9,pz],null,[1.3,.7,1.3],fungus.clone().multiplyScalar(1.1));vPst('vPostB',px+.9,Y0+1.0,pz-.6,.14,1.6,vC(0xc8c0c8));kput('vDomeP',[px+.9,Y0+2.55,pz-.6],null,[.9,.45,.9],fungus);
  vPst('vPostB',px-1.0,Y0+1.0,pz+.7,.1,1.1,vC(0xc8c0c8));kput('vDomeP',[px-1.0,Y0+2.05,pz+.7],null,[.6,.3,.6],fungus);}
 for(const s of[-1,1])vnLampPost(s*6,Y0,11.5,3.4);vnLampPost(-3,Y0,-2,3.4);
 for(const x of[-13,13])vB('vWood',x,Y0,11.5,.5,.45,3.0,0,timber);   // benches along the front wall
 vnFolk(1,6,4,3);vnFolk(0,CD/2+4,3,2);}

VERN.def({key:'port_voth_embassy',name:'Voth Embassy',family:'ported',tags:{culture:'voth',type:['civic'],wealth:'rich',lit:true,role:'embassy'},w:36,d:34,h:24,build:buildVpEmbassy});
