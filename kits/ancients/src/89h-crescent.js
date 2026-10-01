// ================================================================= THE CRESCENT — the terraced moon
// A crescent moon a kilometre and a tenth tall, standing upright in the x-y
// plane with its concave mouth to the WEST (toward the sun, which in this scene
// comes from the west and above). It rises out of the plain on its LOWER horn,
// whose tip lies on the ground like a ramp, swells to a belly 320 m thick on the
// east, and curves up and over so the UPPER horn cantilevers 190 m out past the
// lower horn's tip, 885 m over the forecourt.
//
// THE FIGURE is two curves, built from one outer circle:
//   OUTER EDGE  a pure arc of radius R1 = 590 about (0, CY = 522): the silhouette,
//               a clean shell with nothing on it but seams, faint hoop ribs and a
//               gilt filigree painted into the skin.
//   INNER EDGE  the same arc pulled in by a thickness TH(s) that is zero at both
//               horns and 320 m at the belly, so the two edges are non-concentric
//               and the horns come to points.
// s runs 0 at the lower horn tip to 1 at the upper horn tip along the arc; every
// surface in this file is written in s, so the terraces, the shell, the side
// faces and the break in the ruin cannot drift apart.
//
// THE CROSS-SECTION at any s is XS(s,u,v): u across the depth (0 north, 1
// south), v from the inner edge (0) to the outer shell (1). The two side faces
// are u = 0 and u = 1, the shell is v = 1 (rounded into the side faces, so the
// section is a pillow and not a box), the horn soffit is v = 0. A cut at any
// surface s = S(u,v) is XS(S(u,v),u,v) — which is how the ruin's fracture face
// matches the shell, both side faces and the soffit exactly along a jagged line.
//
// THE INNER EDGE IS WHERE THE TRIANGLES GO. From the lower horn tip to 70 m
// short of the peak of the concave, the inner curve is replaced by a STAIRCASE
// of 15 m levels (four storeys each): a riser at the curve's x at mid-level,
// and between each pair a horizontal plate that is a TERRACE where the upper
// level steps back (the lower limb, where the curve faces up) and a SOFFIT where
// it steps out (the upper concave, where the levels corbel out over each other
// like the stacked decks of the reference). The side faces follow the staircase
// exactly, so the terraced edge IS the silhouette in side elevation. Dwellings
// are a zero-triangle window-wall texture; real geometry goes on balconies,
// set-back blocks, domes, pools, gardens, jutting platforms and brackets.
//
// INTACT: dark bronze with gilt filigree, warm glazed galleries, pale stone
// decks, gilt and jade domes. RUINED: the bronze has gone to verdigris, the
// upper horn has snapped just above the terraces and lies in three pieces across
// the forecourt, shell plates are gone in patches showing the hoop ribs and the
// floor plates, the top terraces have collapsed in cascades onto the decks
// below, domes are cracked open, the windows are dead and the terraces are moss.

// ---------------------------------------------------------------- the skins
// Truchet quarter-arcs: every cell carries two arcs joining the midpoints of its
// edges, so the lines run on across cells and across the tile seam without a
// break whichever way each cell is turned. At 8 cells a tile it reads as the
// meandering gilt line of the reference.
function crTruchet(g,w,N,lw,style,sd){g.save();g.lineWidth=lw;g.strokeStyle=style;g.lineCap='round';const c=w/N;
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x0=i*c,y0=j*c,o=h3(i*1.31+sd,j*2.17,sd*.73)<.5;
  const A=o?[[x0,y0,0],[x0+c,y0+c,2]]:[[x0+c,y0,1],[x0,y0+c,3]];
  for(const a of A){g.beginPath();g.arc(a[0],a[1],c*.5,a[2]*Math.PI/2,(a[2]+1)*Math.PI/2);g.stroke();}}
 g.restore();}
TEX.crShell=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const n=fbm(x/60,y/60,31.7,3),pn=h3(Math.floor(x/128)*1.3,Math.floor(y/128)*2.1,9.1);
  let v=.86+(n-.5)*.28+(pn-.5)*.10;
  const sx=x%128,sy=y%128;if(sx<2||sy<2)v*=.6;                     // plate seams, 18 m
  D[i]=104*v;D[i+1]=76*v;D[i+2]=50*v;D[i+3]=255;}
 g.putImageData(id,0,0);crTruchet(g,w,8,4.6,'rgba(232,190,116,.92)',3.3);});
// the same filigree on black, for the emissive map: a faint gilt glow by day,
// the drawing of the whole shell at night
TEX.crShellE=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);crTruchet(g,w,8,2.6,'rgb(255,178,96)',3.3);});
TEX.crShellRM=canvasTex(256,256,(g,w,h)=>{g.fillStyle='rgb(0,128,105)';g.fillRect(0,0,w,h);crTruchet(g,w,8,2.4,'rgb(0,64,150)',3.3);});
TEX.crShellRM.encoding=THREE.LinearEncoding;
// Five thousand years on: the bronze has gone to verdigris, the gilt survives
// only as a paler ghost of the line, and the runs are dark.
TEX.crShellR=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const p=fbm(x/46,y/46,41.3,3),q=fbm(x/9,y/9,43.1,2),run=fbm(x/7,y/110,44.7,2);
  const a=clamp((p-.30)*2.3,0,1);
  let r=lerp(74,78,a),gg=lerp(62,142,a),b=lerp(46,118,a);
  const m=.82+(q-.5)*.36-clamp((run-.52)*2.2,0,1)*.32;
  const sx=x%128,sy=y%128;const s=(sx<2||sy<2)?.55:1;
  D[i]=r*m*s;D[i+1]=gg*m*s;D[i+2]=b*m*s;D[i+3]=255;}
 g.putImageData(id,0,0);crTruchet(g,w,8,4.6,'rgba(170,214,188,.30)',3.3);});
TEX.crShellRRM=rmTex(128,128,(x,y)=>[.82+(fbm(x/20,y/20,45.1,2)-.5)*.2,.10]);

// The dwelling grid, zero triangles a window. kind 0 is the side-face wall, a
// 30 m tile of eight 3.75 m storeys by eight 3.75 m bays with a pilaster every
// fourth bay; kind 1 is the glazed gallery on the terrace risers, a 24 x 15 m
// tile of four storeys, nearly all glass behind a thin bronze frame and a pale
// floor band, which is the glazed concave face of the reference.
function crWallTex(kind,dec,emis){const NB=8,NF=kind?4:8,S=512;
 return canvasTex(emis?256:S,emis?256:S,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const bw=w/NB,fh=h/NF;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),fi=Math.floor(y/fh),bx=x-bi*bw,by=y-fi*fh;
   const cr=h3(bi*3.17+kind*1.9,fi*7.71,5.2),c2=h3(bi*1.1+kind,fi*3.3,6.4);
   const sp=kind?fh*.13:fh*.26, mu=kind?bw*.05:(bi%4===0?bw*.24:bw*.08);
   const inWin=by>sp&&bx>mu*.5&&bx<bw-mu*.5;
   // the side wall is dark glass with a light in one window in eight; the
   // gallery glows warm along its whole length, brighter in a third of its rooms
   const glow=kind?(cr<.26?.40+cr*.8:.20+c2*.14):(cr<.13?.45+cr*2:0);
   if(emis){const a=inWin?glow:0;D[i]=255*a;D[i+1]=172*a;D[i+2]=92*a;D[i+3]=255;continue;}
   let r,gg,b;
   if(inWin){const vg=1-by/fh*.25;
    if(dec){const k2=cr<.16?40+c2*20:7+cr*10;r=k2;gg=k2+2;b=k2+3;}            // dead, some panes out
    else if(kind){const f=.7+glow*.6;r=86*f*vg;gg=62*f*vg;b=40*f*vg;}          // amber glass
    else{const k2=(22+c2*16)*vg;r=k2*.85;gg=k2;b=k2*1.2;if(glow>0){r=150;gg=108;b=62;}}
    if(bx%(bw/2)<1.2&&kind){r*=.6;gg*=.6;b*=.6;}                                 // the mullion
   }else{
    const n=fbm(x/40,y/40,kind+8.1,2);
    if(kind&&by<=sp){r=lerp(200,166,n);gg=lerp(188,156,n);b=lerp(160,128,n);}   // the pale floor band
    else{r=lerp(118,90,n);gg=lerp(86,64,n);b=lerp(54,40,n);                      // bronze frame
     if(!kind&&by<2.5){r*=1.35;gg*=1.3;b*=1.25;}}                                // lit edge of the floor line
    if(dec){const st=fbm(x/6,y/60,kind+9.3,2),pa=fbm(x/30,y/30,kind+11.7,2);
     const a=clamp((pa-.32)*2.4,0,1);
     r=lerp(r*.5,72,a);gg=lerp(gg*.55,128,a);b=lerp(b*.55,104,a);                 // verdigris over the bronze
     if(kind&&by<=sp){r=lerp(96,120,n);gg=lerp(102,116,n);b=lerp(88,96,n);}
     if(st>.55){r*=.62;gg*=.62;b*=.62;}}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.crSide=crWallTex(0,0,0);TEX.crSideR=crWallTex(0,1,0);TEX.crSideE=crWallTex(0,0,1);
TEX.crGal=crWallTex(1,0,0);TEX.crGalR=crWallTex(1,1,0);TEX.crGalE=crWallTex(1,0,1);

MAT.crShell =new THREE.MeshStandardMaterial({map:TEX.crShell,roughnessMap:TEX.crShellRM,metalnessMap:TEX.crShellRM,metalness:1,roughness:1,
 emissive:0xffffff,emissiveMap:TEX.crShellE,emissiveIntensity:.34,side:DS});
MAT.crShellR=new THREE.MeshStandardMaterial({map:TEX.crShellR,roughnessMap:TEX.crShellRRM,metalnessMap:TEX.crShellRRM,metalness:1,roughness:1,side:DS});
MAT.crSide  =new THREE.MeshStandardMaterial({map:TEX.crSide,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.crSideE,emissiveIntensity:.66,roughness:1,metalness:0,side:DS});
MAT.crSideR =new THREE.MeshStandardMaterial({map:TEX.crSideR,roughnessMap:TEX.concreteRM,roughness:1,metalness:0,side:DS});
MAT.crGal   =new THREE.MeshStandardMaterial({map:TEX.crGal,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.crGalE,emissiveIntensity:1.0,roughness:1,metalness:0,side:DS});
MAT.crGalR  =new THREE.MeshStandardMaterial({map:TEX.crGalR,roughnessMap:TEX.concreteRM,roughness:1,metalness:0,side:DS});
// Decks are paler than anything round them and soffits far darker: SHADE IS
// PAINTED, NOT LIT. Nothing here casts a shadow, so a corbelled level seen from
// below comes back sunlit unless its underside is on a dark material.
MAT.crDeck  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd2c4a6,roughness:1,metalness:0,side:DS});
MAT.crDeckR =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6d6f58,roughness:1,metalness:0,side:DS});
MAT.crShade =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x3b3027,roughness:1,metalness:0,side:DS});
MAT.crShadeR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x282a20,roughness:1,metalness:0,side:DS});
// what is inside a broken shell and behind a collapsed terrace
MAT.crGuts  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x39352f,roughness:1,metalness:0,side:DS});
// A fracture face in section: the floor plates as pale lines every 3.75 m with
// the dark of the rooms between them and a partition every so often. UVs are in
// the building's own height, so on a fallen piece the floors still line up with
// the floors of the stump it broke from.
TEX.crSect=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const fy=y%64,cx=Math.floor(x/37),fi=Math.floor(y/64);
  const n=fbm(x/14,y/14,47.3,2);let v;
  if(fy<9)v=118+n*50-(fy<2?30:0);                                   // the slab, edge on
  else if(h3(cx,fi,48.1)<.3&&x%37<5)v=70+n*30;                       // a partition
  else v=22+n*26+(fy<16?-10:0);                                       // the room behind
  D[i]=v*1.02;D[i+1]=v;D[i+2]=v*.92;D[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.crSect  =new THREE.MeshStandardMaterial({map:TEX.crSect,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.crLawn  =new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x5d7a3c,roughness:1,metalness:0,side:DS});
MAT.crLawnR =new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x3f5a2c,roughness:1,metalness:0,side:DS});
MAT.crVoid  =new THREE.MeshStandardMaterial({color:0x0b0b0c,roughness:1,metalness:0,side:DS});
MAT.crKit   =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
// gilt, jade and bronze: smooth metal, coloured per instance
MAT.crMetal =new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:.38,side:DS});
MAT.crWater =new THREE.MeshStandardMaterial({color:0x2a4c58,roughness:.10,metalness:.25,side:DS});
MAT.crWaterR=new THREE.MeshStandardMaterial({color:0x34402a,roughness:.75,metalness:0,side:DS});
MAT.crPave  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x8c7c64,roughness:1,metalness:0,side:DS});
MAT.crPaveR =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x575a45,roughness:1,metalness:0,side:DS});

// Instanced pieces are modelled in the cell qFacing(normal) hands back: +z out
// of the wall, +x along it, +y up — a scale is [frontage, height, projection].
kdef('crBox',new THREE.BoxGeometry(1,1,1),MAT.crKit);
kdef('crDim',new THREE.BoxGeometry(1,1,1),MAT.crVoid);
kdef('crDome',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2),MAT.crMetal);
// the ruin's dome: the same hemisphere with a wedge and the crown gone
kdef('crDomeB',gridSurface((u,v)=>{const th=u*TAU,ph=v*Math.PI/2;
  return[Math.cos(th)*Math.cos(ph),Math.sin(ph),Math.sin(th)*Math.cos(ph)];},20,8,
 {hole:(u,v)=>(u>.06&&u<.36&&v>.18+.34*fbm(u*9,1.7,9730.5,2))||(v>.70&&fbm(u*7,v*5,9731.5,2)>.40)||fbm(u*11,v*7,9732.5,2)>.70}),MAT.crMetal);
kdef('crDrum',new THREE.CylinderGeometry(1,1,1,20),MAT.crKit);
kdef('crSpike',new THREE.CylinderGeometry(0,1,1,6).translate(0,.5,0),MAT.crMetal);
kdef('crBalc',plymQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],
  [-.5,0,1, .5,0,1, .5,1,1, -.5,1,1],
  [-.5,0,0, -.5,0,1, -.5,1,1, -.5,1,0],
  [ .5,0,0, .5,1,0, .5,1,1, .5,0,1]],2,1),MAT.crKit);
kdef('crPane',new THREE.PlaneGeometry(1,1),MAT.dot);
kdef('crPaneD',new THREE.PlaneGeometry(1,1),MAT.winDead);
kdef('crPool',new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),MAT.crWater);

// gridSurface with UVs from a function, so a wall's storey lines can be laid in
// world height whatever its parameterisation is
function crGrid(fn,nu,nv,uvf,hole){const pos=[],uv=[],idx=[],cols=nu+1;
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv,p=fn(u,v);pos.push(p[0],p[1],p[2]);const t=uvf(u,v,p);uv.push(t[0],t[1]);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(hole&&hole((i+.5)/nu,(j+.5)/nv))continue;
  const a=j*cols+i,b=a+1,c=a+cols,e=c+1;idx.push(a,c,b,b,c,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}

// Presets are DERIVED from this: targets/crescent/91z-views.js runs after
// 90-scene.js, so both builders have left their dimensions here.
const CR_SITE={};

function buildCrescent(scene,gx,gz,d){reseed(9730+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;

 // ---- the figure ---------------------------------------------------------------
 const R1=590,CY=522,TMX=320,DMX=200,DMN=10,SKW=.92;
 const A0=-Math.PI+Math.asin((CY+3)/R1);   // the lower horn tip, 3 m under the plain
 const A1=142*Math.PI/180;                  // the upper horn tip, 885 m up
 const SPAN=A1-A0,ARC=R1*SPAN;              // 259 degrees, 2 670 m of outer edge
 const AN=s=>A0+SPAN*s;
 const PR=s=>Math.sin(Math.PI*Math.pow(clamp(s,0,1),SKW));
 const TH=s=>TMX*Math.pow(PR(s),.85);       // radial thickness: 0 at the horns
 const DP=s=>DMN+(DMX-DMN)*Math.pow(PR(s),.6);  // depth across the plane
 const RRo=s=>Math.min(DP(s)*.25,TH(s)*.4); // how far the shell rounds into the sides
 const PT=(s,r)=>{const a=AN(s);return[r*Math.cos(a),CY+r*Math.sin(a)];};
 const INN=s=>PT(s,R1-TH(s));
 const SHL=(s,u)=>{const ps=lerp(-Math.PI/2,Math.PI/2,u),r=R1-RRo(s)*(1-Math.cos(ps)),p=PT(s,r);
  return[p[0],p[1],DP(s)*.5*Math.sin(ps)];};
 const XS=(s,u,v)=>{const i=INN(s),o=SHL(s,u);
  return[lerp(i[0],o[0],v),lerp(i[1],o[1],v),lerp((u-.5)*DP(s),o[2],v)];};
 const TAN=s=>{const a=AN(s);return[-Math.sin(a),Math.cos(a),0];};
 const SHN=(s,u)=>{const a=AN(s),ps=lerp(-Math.PI/2,Math.PI/2,u);
  return[Math.cos(a)*Math.cos(ps),Math.sin(a)*Math.cos(ps),Math.sin(ps)];};

 // ---- the staircase --------------------------------------------------------------
 let SPK=0,YPK=-1e9;
 for(let i=0;i<=1600;i++){const s=i/1600,y=INN(s)[1];if(y>YPK){YPK=y;SPK=s;}}
 const sAtY=y=>{let lo=0,hi=SPK;for(let i=0;i<48;i++){const m=(lo+hi)*.5;if(INN(m)[1]<y)lo=m;else hi=m;}return(lo+hi)*.5;};
 const PLH=4,LH=15;
 const K=Math.floor((YPK-70-PLH)/LH);
 const LY=k=>PLH+k*LH;
 const LS=[],XF=[];
 for(let k=0;k<=K;k++)LS.push(sAtY(LY(k)));
 // THE TIERS. Levels go in stacks of two to five, and each stack is pushed out
 // past the curve, or held back from it, by one amount: 0, 16, 30 or 48 m out,
 // or 10 m in. The cascade is therefore not a smooth stepped cone but blocks of
 // stacked decks of different reach, which is what the inner edge of the
 // reference is, and what makes the terracing read in the side elevation of a
 // figure 1 100 m tall — a 3 m step is two pixels there, a 36 m block is thirty.
 const TIER=[];
 for(let k=0,t=0;k<K;t++){const g=2+Math.floor(h3(t*1.9,2.2,9737)*4),hh=h3(t*3.7,1.3,9737);
  const o=k===0?0:hh<.2?0:hh<.42?-16:hh<.64?-30:hh<.84?-48:10;
  for(let i=0;i<g&&k<K;i++,k++)TIER.push({t:t,o:o,top:i===g-1||k===K-1});}
 for(let k=0;k<K;k++)XF.push(INN(sAtY(LY(k)+LH*.5))[0]+(h3(k*1.71,3.3,9737)-.5)*4+TIER[k].o);
 XF.push(INN(LS[K])[0]);
 const SK0=LS[K];                           // the terraces stop; the horn soffit begins

 // ---- materials and merge lists --------------------------------------------------
 const shM=dd?MAT.crShellR:MAT.crShell,sdM=dd?MAT.crSideR:MAT.crSide,glM=dd?MAT.crGalR:MAT.crGal;
 const dkM=dd?MAT.crDeckR:MAT.crDeck,sfM=dd?MAT.crShadeR:MAT.crShade,pvM=dd?MAT.crPaveR:MAT.crPave;
 const wtM=dd?MAT.crWaterR:MAT.crWater;
 const SHELL=[],SIDE=[],GAL=[],DECK=[],SHD=[],GUTS=[],SECT=[],PAVE=[],WATER=[],LAWN=[];

 // ---- the palette ----------------------------------------------------------------
 const WG=new THREE.Color(0xffc478);
 const stone=()=>new THREE.Color().setHSL(rr(.08,.12),rr(.08,.22),dd?rr(.20,.30):rr(.64,.80));
 const bronze=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.35,.5),dd?rr(.15,.2):rr(.30,.40));
 const patina=()=>new THREE.Color().setHSL(rr(.40,.46),rr(.22,.36),rr(.20,.30));
 const domeC=()=>dd?patina():(rng()<.55?new THREE.Color().setHSL(rr(.10,.12),rr(.55,.72),rr(.52,.62))
                                       :new THREE.Color().setHSL(rr(.38,.44),rr(.14,.26),rr(.70,.80)));
 const leafC=()=>new THREE.Color().setHSL(rr(.18,.32),rr(.18,.45),dd?rr(.16,.30):rr(.24,.38));
 const QZ=qEuler(0,Math.PI/2,0);            // local x onto z: a run across the depth
 const lit=(p,q,s)=>{if(!dd)kput('strip',p,q,s,WG);};
 const pane=(p,q,s,pl)=>{if(!dd&&rng()<pl)kput('crPane',p,q,s,WG.clone().multiplyScalar(rr(.45,.9)));
  else kput('crPaneD',p,q,s,null);};
 const person=(x,y,z,force)=>{if(dd&&!force)return;
  kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const plant=(x,y,z,h)=>{kput('trunk',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.74,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.26,.38);
  kput('leafCard',[x+rr(-.08,.08)*h,y+h*.72,z+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());};
 const moss=(x,y,z,s)=>kput('moss',[x,y+s*.2,z],qEuler(0,rng()*TAU,0),[s*rr(1,1.7),s*rr(.24,.44),s*rr(1,1.7)],
   new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.06,.13)));
 const rubble=(x,y,z,s)=>kput('rubble',[x,y+s*.35,z],qEuler(rng()*3,rng()*3,rng()*3),
   [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],rng()<.4?new THREE.Color().setHSL(rr(.40,.46),rr(.18,.3),rr(.12,.2)):new THREE.Color().setHSL(rr(.07,.11),rr(.05,.14),rr(.10,.18)));
 // rubble banked against what it fell from: radius biased hard toward rMin
 const heap=(cx,cz,r0,r1,n,sm)=>{for(let i=0;i<n;i++){const a=rng()*TAU,q=Math.pow(rng(),2.2),r=r0+(r1-r0)*q;
  rubble(cx+Math.cos(a)*r,(1-q)*(1-q)*sm*.5,cz+Math.sin(a)*r,rr(.8,sm)*(1.2-.6*q));}};
 const dome=(x,y,z,r)=>{const dh=r*.42;
  kput('crDrum',[x,y+dh*.5,z],null,[r*1.04,dh,r*1.04],stone());
  kput('crBox',[x,y+dh-.3,z],qEuler(0,.3,0),[r*2.2,1,r*2.2],stone());          // the cornice
  kput(dd?'crDomeB':'crDome',[x,y+dh,z],qEuler(0,rng()*TAU,0),[r,r*1.08,r],domeC());
  if(dd)kput('crDim',[x,y+dh*.9,z],null,[r*1.7,1,r*1.7],null);                  // dark inside the break
  else{kput('crDrum',[x,y+dh+r*1.06,z],null,[r*.13,r*.2,r*.13],stone());
   kput('crSpike',[x,y+dh+r*1.16,z],null,[r*.05,r*.34,r*.05],domeC());}
  for(let i=0;i<12;i++){const a=i/12*TAU;
   pane([x+Math.cos(a)*r*1.05,y+dh*.52,z+Math.sin(a)*r*1.05],qFacing([Math.cos(a),0,Math.sin(a)]),[r*.3,dh*.5,1],.85);}
  if(dd)for(let i=0;i<8;i++)rubble(x+rr(-r,r)*.8,y+dh*.9,z+rr(-r,r)*.8,rr(1.5,r*.18));};

 // ---- the ruin's dials --------------------------------------------------------------
 // The break: a jagged surface just above the top terrace, the same S(u,v) for
 // the shell, both sides, the soffit and the fracture face between them.
 const SB=SK0+.02;
 const JAG=(o,u,v)=>o+.022*(fbm(u*3.1+o*40,v*2.3,9738,3)-.5)*2+.008*(fbm(u*13+o*9,v*11,9739,2)-.5)*2;
 const SE=(u,v)=>JAG(SB,u,v);
 const S1=SB+.095,S2=SB+.175;               // where the fallen horn broke again
 // shell plates gone in clusters, keyed to a 28 m plate so a hole is plate-shaped
 const plateGone=(s,u)=>{if(!dd)return false;const al=s*ARC,pi=Math.floor(al/28),pj=Math.floor(clamp(u,0,.999)*6);
  const patch=fbm(pi*.13,pj*.27,9743,2)+(s>SK0-.10?.10:0)-(s<.3?.06:0);
  return patch>.55?h3(pi*.71,pj*1.9,9744)<.78:h3(pi*.71,pj*1.9,9745)<.03;};
 // terrace collapse zones: level ranges and a band across the depth
 const CZ=dd?[{k0:K-9,k1:K,u0:.06,u1:.80},{k0:Math.round(K*.55),k1:Math.round(K*.55)+7,u0:.52,u1:.94},
             {k0:Math.round(K*.34),k1:Math.round(K*.34)+5,u0:.06,u1:.44},{k0:Math.round(K*.16),k1:Math.round(K*.16)+3,u0:.58,u1:.90}]:[];
 const inCZ=(k,u)=>CZ.some(c=>k>=c.k0&&k<c.k1&&u>c.u0&&u<c.u1);

 // ---- the registry ----------------------------------------------------------------
 const ST=STATE(d);
 REGISTER({name:'The Crescent ('+ST+')',x:0,z:0,r:640,h:CY+R1+20});
 REGISTER({name:'The Crescent — the belly',x:450,z:0,r:150,y:180,h:700});
 REGISTER({name:'The Crescent — the terraces',x:40,z:0,r:260,y:0,h:LY(K)+10});
 REGISTER({name:'The Crescent — the lower horn',x:-200,z:0,r:110,y:0,h:60});
 if(!dd)REGISTER({name:'The Crescent — the upper horn',x:-330,z:0,r:160,y:820,h:240});

 // ============================================================ THE OUTER SHELL
 // One arc, rounded into the side faces, with nothing on it but its seams, the
 // hoop ribs and the gilt. Quads wholly under the plain are dropped.
 const shellUV=(s,u)=>[s*ARC/72,(u-.5)*Math.PI*.5*(DP(s)*.5+RRo(s))/72];
 const END=dd?(u,v)=>SE(u,v):()=>1;
 const shellPart=(s0,Sb,nu,L,holes)=>{L.push(crGrid((t,u)=>SHL(lerp(s0,Sb(u,1),t),u),nu,22,
   (t,u)=>shellUV(lerp(s0,Sb(u,1),t),u),
   (t,u)=>{const s=lerp(s0,Sb(u,1),t);return SHL(s,u)[1]<-6||(holes&&plateGone(s,u));}));};
 shellPart(0,()=>SK0,Math.round(SK0*ARC/10),SHELL,1);
 // the liner behind a missing plate, 12 m in, and the plate's own floors
 if(dd){const nu=Math.round(SK0*ARC/10);
  const liner=(s0,Sb,nu2)=>GUTS.push(crGrid((t,u)=>{const s=lerp(s0,Sb(u,1),t);return XS(s,u,1-12/Math.max(TH(s),30));},nu2,22,
   (t,u)=>shellUV(lerp(s0,Sb(u,1),t),u),
   (t,u)=>{const s=lerp(s0,Sb(u,1),t),ds=1.2/nu2*(Sb(u,1)-s0);
    return !(plateGone(s,u)||plateGone(s+ds,u)||plateGone(s-ds,u)||plateGone(s,u+.07)||plateGone(s,u-.07))||XS(s,u,1)[1]<-6;}));
  liner(0,()=>SK0,nu);liner(SK0,(u,v)=>SE(u,v),Math.round((SB-SK0)*ARC/10)+4);
  // hoop ribs on every plate line that borders a hole, and floor plates behind
  const npl=Math.floor(SB*ARC/28);
  for(let pi=1;pi<npl;pi++){const s=pi*28/ARC;
   for(let pj=0;pj<6;pj++){const ua=pj/6,ub=(pj+1)/6,um=(ua+ub)*.5;
    const g0=plateGone(s-.001,um),g1=plateGone(s+.001,um);
    if(!(g0||g1))continue;
    const pa=XS(s,ua,1-3/TH(s)),pb=XS(s,ub,1-3/TH(s));
    if(pa[1]<0&&pb[1]<0)continue;
    beam('crBox',pa,pb,2.2,3.2,new THREE.Color().setHSL(.1,.25,rr(.14,.2)));
    if(g1)for(let f=0;f<4;f++){const sf=s+(f+.5)/4*28/ARC,p=XS(sf,um,1-8/TH(sf));
     const zs=Math.min(DP(sf)/6*.9,2*(DP(sf)*.5-Math.abs(p[2]))-4);
     if(p[1]<2||zs<3)continue;
     kput('crBox',[p[0],p[1],p[2]],null,[6,1.2,zs],new THREE.Color().setHSL(.09,.1,rr(.18,.28)));}}}}
 // the hoop ribs of the intact shell: faint, 0.5 m proud, every 56 m of arc
 for(let al=40;al<ARC-30;al+=56){const s=al/ARC;if(dd&&s>SB-.01)break;
  for(let j=0;j<8;j++){const ua=j/8,ub=(j+1)/8;
   if(plateGone(s,(ua+ub)*.5))continue;
   const pa=SHL(s,ua),pb=SHL(s,ub);if(pa[1]<0&&pb[1]<0)continue;
   const na=SHN(s,ua),nb=SHN(s,ub);
   beam('crBox',[pa[0]+na[0]*.3,pa[1]+na[1]*.3,pa[2]+na[2]*.3],[pb[0]+nb[0]*.3,pb[1]+nb[1]*.3,pb[2]+nb[2]*.3],1.1,1.4,bronze());}}
 // sparse ports in the shell
 for(let i=0;i<150;i++){const s=rr(.06,dd?SB-.02:.97),u=rr(.2,.8);
  if(plateGone(s,u))continue;const p=SHL(s,u);if(p[1]<8)continue;const n=SHN(s,u);
  pane([p[0]+n[0]*.4,p[1]+n[1]*.4,p[2]+n[2]*.4],qFacing(n),[4,2.2,1],.9);}

 // ============================================================ THE STAIRCASE
 const sideUV=(u,v,p)=>[p[0]/30,p[1]/30];
 const galUV=k=>(u,v,p)=>[p[2]/24,(p[1]-LY(k))/15];
 const RF=.75;                                  // the riser's share of a side patch
 for(let k=0;k<K;k++){
  const y0=LY(k),y1=LY(k+1),xf=XF[k],xn=XF[k+1],s0=LS[k],s1=LS[k+1];
  // the two side faces, following the staircase exactly
  for(const sd of [-1,1])SIDE.push(crGrid((u,v)=>{let ix,iy,s;
    if(u<=RF+1e-6){const t=u/RF;ix=xf;iy=lerp(y0,y1,t);s=lerp(s0,s1,t);}
    else{const t=(u-RF)/(1-RF);ix=lerp(xf,xn,t);iy=y1;s=s1;}
    const o=PT(s,R1-RRo(s));return[lerp(ix,o[0],v),lerp(iy,o[1],v),sd*DP(s)*.5];},4,6,sideUV));
  // the riser: a glazed gallery four storeys tall across the whole depth
  GAL.push(crGrid((u,v)=>{const s=lerp(s0,s1,v),D=DP(s);return[xf,lerp(y0,y1,v),(u-.5)*D];},8,3,galUV(k),
   (u,v)=>inCZ(k,u)));
  // and the plate at the top of it: a terrace if the next level steps back, a
  // soffit if it steps out
  const D1=DP(s1);
  (xn>xf?DECK:SHD).push(crGrid((u,v)=>[lerp(xf,xn,u),y1,(v-.5)*D1],3,8,(u,v,p)=>[p[0]/14,p[2]/14],
   (u,v)=>inCZ(k,v)||inCZ(k+1,v)));}

 // ============================================================ THE HORN
 // From the top terrace to the tip (or to the break): shell, soffit, two sides,
 // and a fracture face wherever a piece ends short of the tip.
 const hornPiece=(Sa,Sb,capA,capB,L)=>{
  const ns=Math.max(6,Math.ceil((Sb(.5,.5)-Sa(.5,.5))*ARC/11));
  L.SHELL.push(crGrid((t,u)=>SHL(lerp(Sa(u,1),Sb(u,1),t),u),ns,22,(t,u)=>shellUV(lerp(Sa(u,1),Sb(u,1),t),u),
   L.holes?(t,u)=>plateGone(lerp(Sa(u,1),Sb(u,1),t),u):null));
  L.SOFF.push(crGrid((t,u)=>XS(lerp(Sa(u,0),Sb(u,0),t),u,0),ns,6,
   (t,u,p)=>[p[2]/24,lerp(Sa(u,0),Sb(u,0),t)*ARC*.55/15]));
  for(const uu of [0,1])L.SIDE.push(crGrid((t,v)=>XS(lerp(Sa(uu,v),Sb(uu,v),t),uu,v),ns,8,sideUV));
  const cuv=(u,v,p)=>[(p[0]+p[2])/15,p[1]/15];
  if(capA)L.SECT.push(crGrid((u,v)=>XS(Sa(u,v),u,v),14,12,cuv));
  if(capB)L.SECT.push(crGrid((u,v)=>XS(Sb(u,v),u,v),14,12,cuv));};
 hornPiece(()=>SK0,END,0,dd,{SHELL,SOFF:dd?SHD:GAL,SIDE,GUTS,SECT,holes:dd});
 // the horn's glazed underside, ribbed across its depth every 7.5 m of arc
 {const sEnd=dd?SB-.02:.985;
  for(let sv=SK0+.004;sv<sEnd;sv+=7.5/(ARC*.62)){const a=AN(sv),n=[-Math.cos(a)*1.3,-Math.sin(a)*1.3];
   const pa=XS(sv,.03,0),pb=XS(sv,.97,0);if(dd&&rng()<.35)continue;
   beam('crBox',[pa[0]+n[0],pa[1]+n[1],pa[2]],[pb[0]+n[0],pb[1]+n[1],pb[2]],.9,2.6,bronze());}}
 // the beacons on the tips
 if(!dd){const t=INN(.995);kput('strip',[t[0]+2,t[1]-1,0],QZ,[6,16,16],WG);}

 // ---- the break, dressed ------------------------------------------------------------
 // floor plates standing out of the fracture face, and rebar
 const capDress=(Sf,dir,n)=>{for(let i=0;i<n;i++){const u=rr(.05,.95),v=rr(.05,.95),s=Sf(u,v),p=XS(s,u,v),tg=TAN(s);
  if(rng()<.6){const L=rr(4,22);
   const yy=Math.round(p[1]/3.75)*3.75,hs=Math.sign(tg[0]*dir)||1;
   kput('crBox',[p[0]+hs*L*.35,yy,p[2]],qEuler(rr(-.06,.06),rr(-.3,.3),rr(-.1,.1)),
    [L,1.1,rr(5,18)],new THREE.Color().setHSL(.09,.08,rr(.26,.38)));}
  else{const L=rr(6,26);beam('crBox',p,[p[0]+tg[0]*dir*L+rr(-4,4),p[1]+tg[1]*dir*L+rr(-5,3),p[2]+rr(-5,5)],.7,.7,
   new THREE.Color().setHSL(.07,.3,rr(.10,.16)));}}};
 if(dd){capDress(SE,1,170);
  REGISTER({name:'The Crescent — the stump',x:XS(SB,.5,.5)[0],z:0,r:170,y:XS(SB,.5,0)[1]-40,h:280});}

 // ============================================================ TERRACE DRESSING
 const PLATK=[];                                // levels that carry a jutting platform
 for(const yy of [230,315,395,470,545,615,690,760]){let best=-1,bd=1e9;
  // on a level whose next four levels up do not reach out over it, so the dome
  // stands in open air and not under a corbelled tier
  // a level of its own, three clear of any other platform; where the tiers above
  // corbel out over it the deck is simply run out past them (below)
  for(let k=3;k<K-4;k++){if(PLATK.some(q=>Math.abs(q-k)<3))continue;
   const e=Math.abs(LY(k)-yy);if(e<bd){bd=e;best=k;}}
  if(best>0)PLATK.push(best);}
 const PLATS=[];
 for(let k=0;k<K;k++){
  const y0=LY(k),y1=LY(k+1),xf=XF[k],xn=XF[k+1],s0=LS[k],s1=LS[k+1];
  const Dm=DP((s0+s1)*.5),D1=DP(s1),dl=xn-xf;
  const zoneOf=z=>inCZ(k,z/Dm+.5);
  // ---- balconies on the riser, and stains down it in the ruin
  for(let z=-Dm*.5+4;z<Dm*.5-3;z+=7){if(zoneOf(z))continue;
   if(h3(k*.37,z*.11,9739)<.5)for(let f=1;f<4;f++){if(dd&&rng()<.45)continue;
    kput('crBalc',[xf,y0+f*3.75-.2,z],qFacing([-1,0,0]),[5.6,1.1,rr(1.8,3)],stone());}
   // a bronze fin between every pair of bays, the full four storeys
   if(!dd||rng()<.6)kput('crBox',[xf-.7,(y0+y1)*.5,z+3.5],null,[1.4,LH-.4,.6],bronze());
   if(dd&&rng()<.22)kput('stain',[xf-.25,y1-rr(4,9),z],qFacing([-1,0,0]),[rr(3,7),rr(8,18),1],null);}
  // ---- a terrace: the level above steps back
  if(dl>1.5){
   for(let z=-D1*.5+1;z<D1*.5-1;z+=12){const zz=Math.min(z+6,D1*.5-1)-6;if(inCZ(k,(zz)/D1+.5))continue;
    kput('crBox',[xf+.5,y1+.6,zz],null,[1,1.2,12],stone());}
   lit([xf-.4,y1-.9,0],QZ,[D1*.95,9,9]);
   // set-back blocks against the riser behind
   let z=-D1*.5+2;
   while(z<D1*.5-6){const bw=rr(8,24),zc=z+bw*.5;z+=bw+rr(1,5);
    if(zc+bw*.5>D1*.5-1)break;
    const u=zc/D1+.5;if(inCZ(k,u)||inCZ(k+1,u))continue;
    if(rng()<.28)continue;
    const bdp=Math.min(dl*.5,rr(5,15));let bh=LH*rr(.3,1.15);
    const tower=dl>14&&rng()<.12;if(tower)bh=LH*rr(2,4.5);
    if(dd&&rng()<.35)bh*=.45;
    kput('crBox',[xn-bdp*.5,y1+bh*.5,zc],null,[bdp,bh,bw],stone());
    // stepped massing: a smaller block on a third of them, a roof garden on others
    if(!tower&&bh>6&&rng()<.35){const b2=bh*rr(.35,.6);
     kput('crBox',[xn-bdp*.3,y1+bh+b2*.5,zc],null,[bdp*.6,b2,bw*.7],stone());
     pane([xn-bdp*.6-.15,y1+bh+b2*.5,zc],qFacing([-1,0,0]),[bw*.5,b2*.5,1],.6);}
    else if(!tower&&rng()<.5)for(let i=0;i<2;i++)plant(xn-bdp+rr(1,bdp-1),y1+bh,zc+rr(-bw,bw)*.35,rr(2.5,5));
    if(bh>8&&rng()<.5)for(let i=0;i<Math.floor(bw/7);i++)
     kput('crBalc',[xn-bdp,y1+bh*.55,zc-bw*.5+3.5+i*7],qFacing([-1,0,0]),[5.4,1.1,2.2],stone());
    pane([xn-bdp-.15,y1+Math.min(bh*.5,LH*.4),zc],qFacing([-1,0,0]),[bw*.8,Math.min(bh*.55,LH*.5),1],.6);
    if(tower&&!dd){kput('crSpike',[xn-bdp*.5,y1+bh,zc],null,[Math.min(bdp,bw)*.3,bh*.35,Math.min(bdp,bw)*.3],domeC());
     lit([xn-bdp-.4,y1+bh-1,zc],QZ,[bw*.9,9,9]);}}
   // the field between the lip and the back band
   const fx0=xf+3,fx1=xn-16,fw=fx1-fx0,band=u=>inCZ(k,u);
   if(fw>12){
    const hk=h3(k*1.3,7.7,9740);
    if(fw>22&&D1>46&&hk<.62){const r=clamp(Math.min(fw,D1-14)*.36,7,34);
     const zc=(h3(k,1.1,9741)-.5)*Math.max(0,D1-2*r-14);
     if(!band(zc/D1+.5))dome((fx0+fx1)*.5,y1,zc,r);
     for(const e of [-1,1]){const zz=zc+e*(r+6);if(Math.abs(zz)<D1*.5-4)plant((fx0+fx1)*.5+rr(-r,r)*.6,y1,zz,rr(6,11));}}
    else if(hk<.85){const pw=fw*.6,pd=Math.min(D1-16,rr(18,40)),zc=(h3(k,2.3,9742)-.5)*(D1-pd-16);
     if(!band(zc/D1+.5)){kput('crPool',[(fx0+fx1)*.5,y1+.3,zc],null,[pw,1,pd],dd?new THREE.Color(0x6f7a4a):null);
      for(const e of [-1,1]){kput('crBox',[(fx0+fx1)*.5,y1+.4,zc+e*pd*.5],null,[pw+2,.8,1.2],stone());
       kput('crBox',[(fx0+fx1)*.5+e*pw*.5,y1+.4,zc],null,[1.2,.8,pd],stone());}
      if(!dd)for(let i=0;i<4;i++)person((fx0+fx1)*.5+rr(-pw,pw)*.55,y1+.2,zc+(rng()<.5?-1:1)*(pd*.5+2));}}
    else{const n=Math.round(fw*D1/900)+1;                 // a pavilion court
     for(let i=0;i<n;i++){const px=rr(fx0+5,fx1-5),pz=rr(-D1*.5+8,D1*.5-8);if(band(pz/D1+.5))continue;
      const pw=rr(8,16);kput('crBox',[px,y1+6.5,pz],null,[pw,1.2,pw],stone());
      for(const a of [[-1,-1],[1,-1],[1,1],[-1,1]])kput('crDrum',[px+a[0]*pw*.42,y1+3,pz+a[1]*pw*.42],null,[.5,6,.5],stone());}}
    // gardens
    const nt=Math.round(fw*D1/(dd?220:300));
    for(let i=0;i<nt;i++){const px=rr(fx0,fx1+8),pz=rr(-D1*.5+3,D1*.5-3);if(band(pz/D1+.5))continue;plant(px,y1,pz,rr(5,dd?14:10));}
    const np=Math.round(fw*D1/360);for(let i=0;i<np;i++)person(rr(fx0,fx1),y1,rr(-D1*.5+3,D1*.5-3));}
   else if(dl>5){for(let z2=-D1*.5+5;z2<D1*.5-4;z2+=9){if(inCZ(k,z2/D1+.5))continue;
     if(rng()<.5)plant(xf+2+rr(0,dl*.4),y1,z2,rr(3,6));if(rng()<.12)person(xf+rr(1,dl-1),y1,z2);}}
   // a stair up the riser from the terrace below
   if(k===0||XF[k]-XF[k-1]>26){const zs=((k%2)?1:-1)*D1*.22;
    beam('crBox',[xf-LH*1.45,y0+.8,zs],[xf+.3,y1+.1,zs],1.6,8,stone());
    for(const e of [-1,1])beam('crBox',[xf-LH*1.45,y0+1.9,zs+e*4.2],[xf+.3,y1+1.2,zs+e*4.2],.5,.5,bronze());}
   // the ruin: moss over everything, trees in the cracks
   if(dd){const nm=Math.min(110,Math.round(dl*D1/26));
    for(let i=0;i<nm;i++){const px=rr(xf+1,xn-1),pz=rr(-D1*.5+1,D1*.5-1);moss(px,y1,pz,rr(1.6,dl>20?9:Math.max(2,dl*.7)));}
    for(let i=0;i<Math.round(D1/16);i++)plant(xf+rr(1,Math.max(1.5,dl-1)),y1,rr(-D1*.5+2,D1*.5-2),rr(3,dl>12?12:6));
    for(let i=0;i<Math.round(D1/12);i++)kput('vine',[xf-rr(.2,1),y1,rr(-D1*.5+2,D1*.5-2)],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),
     [rr(1,2.2),rr(5,Math.min(LH*1.6,y1-1)),rr(1,2.2)],null);}}
  // ---- a soffit: the level above corbels out over this one
  else if(dl<-1.5){
   kput('crBox',[xn+.4,y1-1.2,0],null,[1.4,2.4,D1*.98],stone());     // the fascia
   lit([xn-.4,y1-2.7,0],QZ,[D1*.95,9,9]);
   if(-dl>3)for(let z=-D1*.5+10;z<D1*.5-8;z+=22){if(inCZ(k+1,z/D1+.5))continue;
    beam('crBox',[xf,y1-Math.min(LH*.75,-dl*1.3),z],[xn+1.6,y1-2.4,z],1.8,1.8,stone());}
   if(dd)for(let i=0;i<Math.round(D1/9);i++)kput('vine',[xn+rr(.2,1),y1-2.4,rr(-D1*.5+2,D1*.5-2)],
    qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[rr(1,2.2),rr(6,30),rr(1,2.2)],null);}
  // ---- a thin deck jutting from the riser, with a mast on some
  if(k>6&&k<K-2&&h3(k*2.9,4.4,9746)<.22&&PLATK.indexOf(k)<0&&PLATK.indexOf(k-1)<0&&PLATK.indexOf(k+1)<0){
   const zc=(h3(k,5.5,9747)-.5)*Dm*.5,w=Dm*rr(.25,.45),L=rr(14,30),x0=Math.min(xf,xn)-L;
   if(!inCZ(k+1,zc/Dm+.5)){
    kput('crBox',[x0+L*.5+1,y1-1.2,zc],null,[L+2,2.4,w],stone());
    kput('crBox',[x0+.4,y1+.5,zc],null,[.8,1.4,w],bronze());
    beam('crBox',[xf,y0+2,zc],[x0+L*.35,y1-2.4,zc],1.4,1.4,stone());
    lit([x0-.2,y1-1.6,zc],QZ,[w*.9,8,8]);
    if(h3(k,6.6,9748)<.5){const mh=rr(20,48);
     kput('crSpike',[x0+L*.4,y1,zc],null,[1.2,mh,1.2],bronze());
     if(!dd)kput('strip',[x0+L*.4,y1+mh,zc],null,[2,14,14],WG);}
    else for(let i=0;i<3;i++)person(x0+rr(2,L-2),y1,zc+rr(-w,w)*.4);}}}

 // ---- the jutting platforms: a dome on a deck hung out over the concave --------------
 for(let pi=0;pi<PLATK.length;pi++){const k=PLATK[pi];
  const y=LY(k),xb=Math.max(XF[k],XF[k-1])+2,D=DP(LS[k])*.82;
  // the deck reaches PL past whatever overhangs it in the next three levels, so
  // the dome on it stands in open air
  const xf=Math.min(XF[k],XF[k+1],XF[k+2],XF[k+3]);
  const PL=[50,70,58,86,64,78,56,48][pi],x0=xf-PL,xc=(x0+xb)*.5,w=xb-x0;
  const broken=dd&&(pi===7||pi===6||pi===3);                    // the top one went with the horn
  if(broken){for(let i=0;i<5;i++)kput('crBox',[xf-rr(2,14),y-rr(2,6),rr(-D,D)*.4],qEuler(rr(-.4,.4),rr(-.3,.3),rr(-.6,.6)),
    [rr(8,18),rr(2,4),rr(6,16)],stone());continue;}
  kput('crBox',[xc,y-3,0],null,[w,6,D],stone());
  kput('crDim',[xc,y-6.25,0],null,[w*.99,.5,D*.97],null);   // painted shade under it
  const kb=Math.max(0,k-3);
  for(const z of [-D*.36,0,D*.36]){beam('crBox',[XF[kb],LY(kb)+LH*.5,z],[x0+PL*.35,y-6,z],3.2,3.2,stone());
   beam('crBox',[XF[kb],LY(kb)+LH*.5,z],[x0+4,y-6,z],2.2,2.2,stone());}
  kput('crBox',[x0+.6,y+.7,0],null,[1,1.4,D],bronze());
  for(const e of [-1,1])kput('crBox',[xc,y+.7,e*D*.5],null,[w,1.4,1],bronze());
  lit([x0-.4,y-1.2,0],QZ,[D*.95,11,11]);
  const r=Math.min(PL*.36,D*.36);
  dome(x0+PL*.46,y,0,r);
  for(const e of [-1,1]){kput('crBox',[x0+PL*.5,y+4.5,e*(r+10)],null,[PL*.5,9,10],stone());
   pane([x0+PL*.25-.2,y+4.5,e*(r+10)],qFacing([-1,0,0]),[8,5,1],.8);}
  if(pi===PLATK.length-1){kput('crSpike',[x0+6,y,D*.4],null,[1.5,40,1.5],bronze());lit([x0+6,y+40,D*.4],null,[2,16,16]);}
  for(let i=0;i<10;i++)person(rr(x0+3,x0+PL-3),y,rr(-D,D)*.45);
  if(dd)for(let i=0;i<30;i++)moss(rr(x0+2,xb-2),y,rr(-D,D)*.45,rr(1,4));
  PLATS.push({x:x0+PL*.46,y:y,z:0,r:r,PL:PL,D:D});
  REGISTER({name:'The Crescent — dome platform '+(pi+1),x:xc,z:0,r:Math.max(w,D)*.55,y:y-12,h:r*1.6+20});}

 // ---- the collapse zones: cavities, broken floors, and the cascade below them ------
 for(const c of CZ){
  const zc=(k)=>((c.u0+c.u1)*.5-.5)*DP(LS[k]);
  for(let k=c.k0;k<c.k1;k++){const Dm=DP((LS[k]+LS[k+1])*.5),xf=XF[k],dl=XF[k+1]-xf;
   const zw=Math.min((c.u1-c.u0+.14)*Dm,Dm-2),z0=clamp(zc(k),-Dm*.5+zw*.5+1,Dm*.5-zw*.5-1);
   const W=Math.max(34,dl+8);
   kput('crDim',[xf+10+W*.5,LY(k)+(LH-3)*.5,z0],null,[W,LH-3,zw],null);
   kput('crDim',[xf+5,LY(k)+.2,z0],null,[12,.4,zw],null);
   for(let i=0;i<3;i++)kput('crBox',[xf+rr(-3,6),LY(k)+rr(1,LH-2),z0+rr(-zw,zw)*.35],
    qEuler(rr(-.3,.3),rr(-.2,.2),rr(-.8,.8)),[rr(8,20),1.4,rr(6,14)],new THREE.Color().setHSL(.1,.1,rr(.35,.5)));
   for(let i=0;i<10;i++)rubble(xf+rr(0,12),LY(k),z0+rr(-zw,zw)*.4,rr(1.5,4.5));}
  // what came down lands on every exposed terrace below the zone, heaped against
  // the riser behind it and spilling over the lip
  for(let k=0;k<c.k1;k++){const xf=XF[k],xn=XF[k+1],dl=xn-xf;if(dl<3)continue;
   const D1=DP(LS[k+1]),zz=zc(k+1),zw=(c.u1-c.u0)*D1;
   const fall=k>=c.k0?1:clamp(1-(c.k0-k)/14,.15,1);
   const n=Math.round(Math.min(90,dl*zw/22)*fall);
   for(let i=0;i<n;i++){const q=Math.pow(rng(),1.8);
    rubble(lerp(xn-1,xf+.5,q),LY(k+1)+(1-q)*4,zz+rr(-zw,zw)*.5,rr(1.2,5.5)*(1.2-.6*q));}}}

 // ============================================================ THE FOOTING AND THE FORECOURT
 const FX0=-310,FX1=330,FZ=112;
 for(let i=0;i<3;i++){const e=(2-i)*9;
  kput('crBox',[(FX0+FX1)*.5,(i+.5)*PLH/3,0],null,[FX1-FX0+2*e,PLH/3,2*(FZ+e)],stone());}
 // portals in both side faces at the foot of the belly
 for(const sd of [-1,1])for(let j=0;j<4;j++){const px=20+j*44;
  const sp=(Math.atan2(PLH+10-CY,px)-A0)/SPAN,zf=sd*DP(sp)*.5;
  kput('crDim',[px,PLH+10,zf],qFacing([0,0,sd]),[16,20,1.2],null);
  lit([px,PLH+21,zf+sd*1.5],null,[16,10,10]);}
 // the plaza, and the basin under the cantilevered horn
 const BXC=-640,BRX=230,BRZ=330,PCX=-120,PRX=830,PRZ=560;
 const inBasin=(x,z)=>((x-BXC)/BRX)**2+(z/BRZ)**2<1;
 const inFoot=(x,z)=>x>FX0-20&&x<FX1+20&&Math.abs(z)<FZ+20;
 PAVE.push(crGrid((u,v)=>{const a=u*TAU,r=Math.sqrt(v);return[PCX+Math.cos(a)*PRX*r,.28,Math.sin(a)*PRZ*r];},72,14,
  (u,v,p)=>[p[0]/16,p[2]/16],(u,v)=>{const a=u*TAU,r=Math.sqrt(v),x=PCX+Math.cos(a)*PRX*r,z=Math.sin(a)*PRZ*r;
   return dd&&!inBasin(x,z)&&fbm(x*.01,z*.01,9749,2)>.62;}));
 WATER.push(crGrid((u,v)=>{const a=u*TAU,r=v;return[BXC+Math.cos(a)*BRX*r,2.6,Math.sin(a)*BRZ*r];},48,6,(u,v,p)=>[p[0]/20,p[2]/20]));
 for(let i=0;i<96;i++){const a=(i+.5)/96*TAU,x=BXC+Math.cos(a)*BRX,z=Math.sin(a)*BRZ;
  const tx=-Math.sin(a)*BRX,tz=Math.cos(a)*BRZ,L=Math.hypot(tx,tz)*TAU/96;
  if(dd&&rng()<.25)continue;
  kput('crBox',[x,1.7,z],qEuler(0,-Math.atan2(tz,tx),0),[L*1.02,3.4,3],stone());}
 REGISTER({name:'The Crescent — the basin',x:BXC,z:0,r:BRZ,y:0,h:6});
 // eight paths out from the footing, lit
 for(let j=0;j<8;j++){const a=j/8*TAU+.2,x0=Math.cos(a)*340,z0=Math.sin(a)*150;
  const x1=PCX+Math.cos(a)*PRX*.97,z1=Math.sin(a)*PRZ*.97;
  if(inBasin((x0+x1)*.5,(z0+z1)*.5))continue;
  const L=Math.hypot(x1-x0,z1-z0),yaw=-Math.atan2(z1-z0,x1-x0);
  kput('crBox',[(x0+x1)*.5,.6,(z0+z1)*.5],qEuler(0,yaw,0),[L,.6,9],new THREE.Color().setHSL(.08,.1,dd?.2:.42));
  for(let t=.05;t<1;t+=.08){const x=lerp(x0,x1,t),z=lerp(z0,z1,t);
   if(dd&&rng()<.5)continue;
   for(const e of [-1,1]){const ox=Math.sin(-yaw)*e*7,oz=Math.cos(-yaw)*e*7;
    kput('crDrum',[x+ox,3,z+oz],null,[.18,6,.18],bronze());
    lit([x+ox,6.2,z+oz],null,[.8,4,4]);}}}
 // a colonnade round the rim of the plaza: 9 m columns and an architrave, which
 // is where a person-sized thing stands against the whole kilometre of it
 {const n=360;let prev=null;
  for(let i=0;i<n;i++){const a=i/n*TAU,x=PCX+Math.cos(a)*PRX*.965,z=Math.sin(a)*PRZ*.965;
   if(dd&&rng()<.4){if(rng()<.5)kput('crDrum',[x+rr(-4,4),1.4,z+rr(-4,4)],qEuler(Math.PI/2,rng()*TAU,0),[.9,9,.9],stone());prev=null;continue;}
   kput('crDrum',[x,5.2,z],null,[.8,9,.8],stone());
   if(prev){const L=Math.hypot(x-prev[0],z-prev[1]);
    kput('crBox',[(x+prev[0])*.5,10.2,(z+prev[1])*.5],qEuler(0,-Math.atan2(z-prev[1],x-prev[0]),0),[L+.4,1.4,2.2],stone());
    if(!dd&&i%6===0)lit([(x+prev[0])*.5,9.2,(z+prev[1])*.5],qEuler(0,-Math.atan2(z-prev[1],x-prev[0]),0),[L*.8,6,6]);}
   prev=[x,z];}}
 // gardens round the rim
 for(let i=0;i<(dd?160:110);i++){const a=rng()*TAU,r=rr(.74,1.02);
  const x=PCX+Math.cos(a)*PRX*r,z=Math.sin(a)*PRZ*r;if(inBasin(x,z))continue;plant(x,.3,z,rr(7,dd?20:14));}
 // people at the foot, where a person stands next to the whole kilometre of it
 if(!dd){for(let i=0;i<220;i++){const x=rr(-560,420),z=rr(-420,420);
   if(inBasin(x,z)||inFoot(x,z))continue;person(x,.3,z);}
  figures(-300,160,40,40);figures(-330,-150,30,40);
  for(let i=0;i<60;i++)person(rr(FX0+6,XF[0]-6),PLH,rr(-FZ+6,FZ-6));}
 else{figures(-330,330,7,6);                         // a party of explorers under the stump
  for(let i=0;i<5;i++)person(-230+rr(-6,6),PLH,rr(60,80),1);}

 // ============================================================ THE RUIN ON THE PLAIN
 let FALL=null;
 if(dd){
  // ---- the fallen horn, in three pieces --------------------------------------------
  const J1=(u,v)=>JAG(S1,u,v),J2=(u,v)=>JAG(S2,u,v);
  const PIECES=[{a:SE,b:J1,cb:1,x:-600,z:150,yaw:.35,roll:.14},
                {a:J1,b:J2,cb:1,x:-930,z:330,yaw:-.55,roll:-.3},
                {a:J2,b:()=>1,cb:0,x:-1200,z:170,yaw:.95,roll:.42}];
  FALL=[];
  for(const P of PIECES){
   const L={SHELL:[],SOFF:[],SIDE:[],GUTS:[],SECT:[],holes:0};
   hornPiece(P.a,P.b,1,P.cb,L);
   const sm=(P.a(.5,.5)+P.b(.5,.5))*.5,c=XS(sm,.5,.5);
   const q=qEuler(0,P.yaw,0).multiply(qEuler(Math.PI/2+P.roll,0,0));
   const T0=new THREE.Matrix4().makeTranslation(-c[0],-c[1],-c[2]);
   let M=new THREE.Matrix4().compose(new THREE.Vector3(P.x,0,P.z),q,new THREE.Vector3(1,1,1)).multiply(T0);
   // settle it: lowest sample 5 m into the plain
   let ymin=1e9;const v3=new THREE.Vector3();
   for(let i=0;i<=10;i++)for(let j=0;j<=6;j++)for(const vv of [0,1]){const s=lerp(P.a(.5,.5),Math.min(P.b(.5,.5),.999),i/10);
    const p=vv?SHL(s,j/6):XS(s,j/6,0);v3.set(p[0],p[1],p[2]).applyMatrix4(M);ymin=Math.min(ymin,v3.y);}
   M=new THREE.Matrix4().compose(new THREE.Vector3(P.x,-ymin-5,P.z),q,new THREE.Vector3(1,1,1)).multiply(T0);
   for(const g of L.SHELL){g.applyMatrix4(M);SHELL.push(g);}
   for(const g of L.SOFF){g.applyMatrix4(M);SHD.push(g);}
   for(const g of L.SIDE){g.applyMatrix4(M);SIDE.push(g);}
   for(const g of L.SECT){g.applyMatrix4(M);SECT.push(g);}
   // QA (arcC): the piece is bedded in what it crushed: its own fragments piled
   // along every line where it meets the plain (krSeam, 89d-arcube.js), and the
   // plaza under it torn up into a dark skirt of broken paving and grit
   krSeam(L.SHELL.concat(L.SIDE,L.SECT),8,5,(x,y,z)=>{if(rng()<.55)return;rubble(x+rr(-6,6),Math.max(0,y)*.4,z+rr(-6,6),rr(2,9));});
   {const cw0=new THREE.Vector3(c[0],c[1],c[2]).applyMatrix4(M),n=18,R0=rr(150,200),ph=rng()*9;
    const rq=a=>R0*(1+.25*Math.sin(a*2+ph)+.12*Math.sin(a*5+ph*3));
    for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([cw0.x,.6,cw0.z,
      cw0.x+Math.cos(a1)*rq(a1),.6,cw0.z+Math.sin(a1)*rq(a1),cw0.x+Math.cos(a0)*rq(a0),.6,cw0.z+Math.sin(a0)*rq(a0)],3));
     g.setAttribute('uv',new THREE.Float32BufferAttribute([cw0.x/16,cw0.z/16,(cw0.x+Math.cos(a1)*rq(a1))/16,(cw0.z+Math.sin(a1)*rq(a1))/16,
      (cw0.x+Math.cos(a0)*rq(a0))/16,(cw0.z+Math.sin(a0)*rq(a0))/16],2));g.computeVertexNormals();GUTS.push(g);}}
   // and the bronze skin that burst off it: torn plates of shell thrown clear
   for(let j=0;j<12;j++){const w=rr(10,30),l=rr(14,40),t=rr(2.5,6);
    const SH=krShard({w:w,l:l,t:t,layers:2,brk:[1,1,1,j%2],bite:.26,tile:16,seg:8});
    const a=rng()*TAU,r=rr(120,260),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;
    const qS=qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3));
    const MS=new THREE.Matrix4().compose(new THREE.Vector3(x,-SH.low(qS)-t*.3,z),qS,new THREE.Vector3(1,1,1));
    if(SH.top)SHELL.push(SH.top.applyMatrix4(MS));if(SH.side)SHELL.push(SH.side.applyMatrix4(MS));
    if(SH.bot)GUTS.push(SH.bot.applyMatrix4(MS));if(SH.brk)SECT.push(SH.brk.applyMatrix4(MS));
    heap(x,z,Math.max(w,l)*.3,Math.max(w,l)*.8,16,4);}
   KXF={m:M,q:q};capDress(P.a,-1,40);if(P.cb)capDress(P.b,1,40);endGroupXF();
   const cw=new THREE.Vector3(c[0],c[1],c[2]).applyMatrix4(M);
   FALL.push({x:cw.x,y:cw.y,z:cw.z});
   REGISTER({name:'The Crescent — the fallen horn, piece '+FALL.length,x:cw.x,z:cw.z,r:210,y:0,h:170});
   heap(cw.x,cw.z,110,300,200,7);
   for(let i=0;i<60;i++)moss(cw.x+rr(-160,160),.3,cw.z+rr(-160,160),rr(2,7));}
  // debris from the break down the terraces and across the forecourt
  heap(-360,40,60,420,300,9);
  // QA (arcC): these were fifty green boxes. Torn slabs of the horn's floors now
  // (krShard): section on the tear, shell on what was the outside
  for(let i=0;i<50;i++){const w=rr(8,28),l=rr(6,22),t=rr(3,9);
   const SH=krShard({w:w,l:l,t:t,layers:Math.max(1,Math.round(t/3.5)),brk:[1,1,rng()<.5?1:0,1],bite:.24,tile:16,seg:7});
   const qS=qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),x=rr(-1100,-420),z=rr(-80,420);
   const MS=new THREE.Matrix4().compose(new THREE.Vector3(x,-SH.low(qS)-t*.25,z),qS,new THREE.Vector3(1,1,1));
   if(SH.top)(rng()<.5?SHELL:DECK).push(SH.top.applyMatrix4(MS));if(SH.side)SHELL.push(SH.side.applyMatrix4(MS));
   if(SH.bot)GUTS.push(SH.bot.applyMatrix4(MS));if(SH.brk)SECT.push(SH.brk.applyMatrix4(MS));}
  heap(0,0,300,560,220,7);
  for(let i=0;i<160;i++){const x=rr(-700,500),z=rr(-420,420);if(inFoot(x,z)&&rng()<.7)continue;moss(x,.3,z,rr(2,8));}
  }
 // the plain beyond the plaza: an orchard intact, a wood in the ruin
 for(let i=0;i<(dd?150:70);i++){const a=rng()*TAU,r=rr(900,1500),x=PCX+Math.cos(a)*r,z=Math.sin(a)*r*.8;
  if(FALL&&FALL.some(f=>Math.hypot(x-f.x,z-f.z)<230))continue;plant(x,0,z,rr(7,dd?18:12));}


 // ============================================================ THE SIDE FACES, IN RELIEF
 // The window wall is zero triangles; what it cannot do is catch the light. A
 // ledge runs along every eighth floor line (30 m) across both faces, from the
 // staircase to the rounded edge of the shell, so the two biggest surfaces on
 // the building read as floors in a slab and not as wallpaper on a card.
 const onSide=(x,y)=>{const dy=y-CY,r=Math.hypot(x,dy),a=Math.atan2(dy,x);
  if(a<A0||a>A1)return -1;const s=(a-A0)/SPAN;
  if(dd&&s>SB-.03)return -1;
  if(r>R1-RRo(s)-1.5)return -1;
  if(y<LY(K)){const k=Math.floor((y-PLH)/LH);if(k<0||x<XF[k]+1.5||r<R1-TH(s)-45)return -1;return s;}
  return r>R1-TH(s)+1.5?s:-1;};
 const ledgeRun=(x0,x1,y,mj)=>{const n=Math.max(1,Math.ceil((x1-x0)/16));
  for(let i=0;i<n;i++){const xa=lerp(x0,x1,i/n),xb=lerp(x0,x1,(i+1)/n),xc=(xa+xb)*.5,sc=onSide(xc,y);
   if(sc<0||(dd&&rng()<.22))continue;const D=DP(sc);
   for(const sd of [-1,1])kput('crBox',[xc,y,sd*(D*.5+(mj?.55:.35))],null,[xb-xa+.2,mj?1.1:.55,mj?1.1:.7],
    dd?new THREE.Color().setHSL(rr(.36,.44),rr(.12,.26),rr(.18,.28)):new THREE.Color().setHSL(.085,.4,rr(.34,.42)));}};
 for(let y=PLH+16.5;y<CY+R1-8;y+=15){let x0=null,xl=0;const mj=Math.round((y-PLH-1.5)/15)%2===0;
  for(let x=-640;x<=640;x+=2){const on=onSide(x,y)>=0;
   if(on){if(x0===null)x0=x;xl=x;}else if(x0!==null){if(xl-x0>6)ledgeRun(x0,xl,y,mj);x0=null;}}
  if(x0!==null&&xl-x0>6)ledgeRun(x0,xl,y,mj);}
 // QA (arcC): and a grain the other way. At 2 km the ledges alone were a fine
 // stripe on a flat card; pilasters on every 30 m window tile between them make
 // the face a grid of bays, and about one bay in four carries a stack of real
 // balconies — a neighbourhood's worth, decided per bay so they cluster — which
 // is what the hero and the side elevation see as the grain of a city.
 for(let y=PLH+1.5;y<CY+R1-20;y+=15)for(let x=-630;x<=630;x+=30){const ym=y+7.5,sp=onSide(x,ym);
  if(sp>=0&&!(dd&&rng()<.3))for(const sd of [-1,1])kput('crBox',[x,ym,sd*(DP(sp)*.5+.6)],null,[1.3,15.1,1.2],
   dd?new THREE.Color().setHSL(rr(.36,.44),rr(.1,.22),rr(.2,.3)):new THREE.Color().setHSL(.085,.35,rr(.36,.44)));
  const hv=h3(Math.floor(x/30)+40,Math.floor(y/15),9733.7);if(hv<.74)continue;
  for(const sd of [-1,1])for(let f=hv<.87?1:0;f<4;f++)for(let b=0;b<5;b++){const bx=x+3+b*6,by=y+f*3.75+.25,sb=onSide(bx,by+1);
   if(sb<0||onSide(bx,by+3)<0||(dd&&rng()<.55))continue;
   kput('crBalc',[bx,by,sd*DP(sb)*.5],qFacing([0,0,sd]),[5.4,1.1,rr(1.6,2.4)],stone());
   if(!dd&&rng()<.08)kput('leafCard',[bx+rr(-1.5,1.5),by+1,sd*(DP(sb)*.5+1.3)],qEuler(0,rng()*TAU,0),[rr(1.2,2),rr(1,1.6),rr(1.2,2)],
    new THREE.Color().setHSL(rr(.2,.3),rr(.25,.45),rr(.22,.32)));}}
 // five thousand years of runs down both faces
 if(dd)for(let i=0;i<300;i++){const sd=rng()<.5?-1:1,sv=rr(.1,SB-.03),v=rr(.12,.95),p=XS(sv,sd>0?1:0,v);
  if(p[1]<30)continue;const L=rr(30,110);
  kput('stain',[p[0],p[1]-L*.35,sd*(DP(sv)*.5+.35)],qFacing([0,0,sd]),[rr(8,22),L,1],null);}

 // ---- lawns on the plaza --------------------------------------------------------------
 for(const Lw of [[-150,330,200,110],[-150,-330,200,110],[330,300,170,120],[330,-300,170,120],[600,0,110,210]]){
  LAWN.push(crGrid((u,v)=>{const a=u*TAU;return[Lw[0]+Math.cos(a)*Lw[2]*v,1.5,Lw[1]+Math.sin(a)*Lw[3]*v];},32,4,
   (u,v,p)=>[p[0]/9,p[2]/9]));
  // a raised bed: 1.5 m of kerb, which also keeps it clear of the paving in the
  // depth buffer from 3 km up
  for(let i=0;i<40;i++){const a=(i+.5)/40*TAU,tx=-Math.sin(a)*Lw[2],tz=Math.cos(a)*Lw[3];
   kput('crBox',[Lw[0]+Math.cos(a)*Lw[2],.85,Lw[1]+Math.sin(a)*Lw[3]],qEuler(0,-Math.atan2(tz,tx),0),
    [Math.hypot(tx,tz)*TAU/40*1.03,1.7,1.2],stone());}
  const n=dd?30:14;for(let i=0;i<n;i++){const a=rng()*TAU,r=Math.sqrt(rng())*.9;
   plant(Lw[0]+Math.cos(a)*Lw[2]*r,1.5,Lw[1]+Math.sin(a)*Lw[3]*r,rr(6,dd?17:11));}
  if(!dd)for(let i=0;i<24;i++){const a=rng()*TAU,r=Math.sqrt(rng())*.9;person(Lw[0]+Math.cos(a)*Lw[2]*r,1.5,Lw[1]+Math.sin(a)*Lw[3]*r);}}

 // ---- what the presets are derived from ---------------------------------------------
 const ptop=INN(1);
 CR_SITE[d]={x:gx,z:gz,d:d,dd:dd,R1:R1,CY:CY,HT:CY+R1,K:K,LH:LH,PLH:PLH,TOPY:LY(K),
  XF:XF.slice(),LY:XF.map((x,k)=>LY(k)),HORN:[ptop[0],ptop[1]],LOWTIP:INN(0),
  BELLY:PT(.5,R1),SB:SB,BRK:XS(SB,.5,.5),BRKO:XS(SB,.5,1),PLATS:PLATS,BASIN:[BXC,0,BRX,BRZ],
  FALL:FALL,DMID:DP(.5),
  PT:(s,r)=>PT(s,r),INN:s=>INN(s),DP:s=>DP(s),sAtY:y=>sAtY(y)};

 // ---- merge ---------------------------------------------------------------------------
 meshMerged(SHELL,shM,G);
 meshMerged(SIDE,sdM,G);
 meshMerged(GAL,glM,G);
 meshMerged(DECK,dkM,G);
 meshMerged(SHD,sfM,G);
 meshMerged(GUTS,MAT.crGuts,G);
 meshMerged(SECT,MAT.crSect,G);
 meshMerged(LAWN,dd?MAT.crLawnR:MAT.crLawn,G);
 meshMerged(PAVE,pvM,G);
 meshMerged(WATER,wtM,G);
 KOFF=[0,0,0];return G;}
