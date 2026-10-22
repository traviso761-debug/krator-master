// ================================================================= THE PODIUM — skins, materials, the faceted head
// Procedural until the library sets arrive (core/materials/PROMPTS-NEEDED.md §8: stone.onyx, stone.alabaster,
// metal.titanium, patterns/eternian/*). Every painter draws from KRAND (h3/fbm on the lattice), not the sin hash.
//
//   kind 0  the DRUM WALL: a 24 x 16 m tile, four bays by four storeys of 4 m, each storey a tall round-headed window
//           (the owner's third picture's slots) in the Ancients' white panel. KEPT: the same openings glazed in onyx,
//           a bronze frame, a mullion and two pointed lancets under an oculus: Gothic bar tracery, done by masons who
//           could not make the Ancients' glass
//   kind 1  the POD BAND: an 8 x 4 m storey of continuous glazing over a white spandrel. KEPT: onyx panes in bronze
//   kind 2  PLATE GLASS for the bays: 4 m panes on a 16 m tile, thin dark frames
//   kind 3  ONYX for the bays' tracery: a 4 m tile, banded honey and cream, the bars are geometry
//   kind 4  the PODIUM: a 24 x 10 m tile, two 5 m work storeys of ribbon glazing between fluted piers
function snH(x,y,s){return KRAND.h3(x,y,0,s);}
function snN(x,y,s,o){return KRAND.fbm(x,y,0,o||3,s);}
function snOnyx(x,y,s){const n=snN(x/46,y/120,s,3),m=snN(x/9,y/24,s+17,2);
 const t=.5+.5*Math.sin(y/17+n*9+m*2.2);
 let r=lerp(186,242,t),g=lerp(142,226,t),b=lerp(86,190,t);
 if(Math.abs(Math.sin(x/31+n*12))<.06){r=lerp(r,250,.6);g=lerp(g,244,.6);b=lerp(b,232,.6);}
 return [r,g,b,t];}
function snSkin(kind,kept,emis){const W=512,Hh=512;
 return canvasTex(W,Hh,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const NB=kind===0?4:1,NF=kind===0?4:kind===4?2:1,bw=w/NB,fh=h/NF;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),fi=Math.floor(y/fh),px=x-bi*bw,py=y-fi*fh,cr=snH(bi*7+kind,fi*13+kept,12131),c2=snH(bi*3+1,fi*5+2,12132);
   let r=0,gg=0,b=0,a=0,ac=0;
   if(kind===0){
    const hw=.2*bw,cx=.5*bw,cy=.14*fh+hw,sill=.86*fh;
    const inO=py>cy?(Math.abs(px-cx)<hw&&py<sill):(Math.hypot(px-cx,py-cy)<hw);
    const dO=py>cy?Math.max(Math.abs(px-cx)-hw,py-sill):Math.hypot(px-cx,py-cy)-hw;
    if(inO){
     if(kept){const o=snOnyx(x,y,12133);r=o[0];gg=o[1];b=o[2];
      let bar=Math.abs(px-cx)<2.2&&py>cy-hw*.05;                                         // the mullion
      // the two pointed lancets under the round head: each half of each lancet an arc of radius .75hw centred
      // across from its spring, drawn only between its spring and the lancet's apex
      const rr0=hw*.75;
      for(const Lc of [[cx-hw,cx],[cx,cx+hw]]){const mid=(Lc[0]+Lc[1])/2;if(py>cy+1)continue;
       const c=px<mid?Lc[0]+rr0:Lc[1]-rr0;if(px>=Lc[0]&&px<=Lc[1]&&Math.abs(Math.hypot(px-c,py-cy)-rr0)<1.6)bar=true;}
      if(Math.abs(Math.hypot(px-cx,py-(cy-hw*.78))-hw*.15)<1.5)bar=true;                   // the oculus
      if(bar){r=156;gg=122;b=60;}
      else if(cr<.30)a=.36+o[3]*.3;else if(cr>.94)ac=.55;}
     else{const vg=1-py/fh*.3;if(cr<.25){r=112;gg=92;b=66;a=.5+c2*.4;}else{const k=(34+c2*22)*vg;r=k*.82;gg=k*.95;b=k*1.15;}
      if(Math.abs(px-cx)<1.4){r*=.5;gg*=.5;b*=.5;}}}
    else{let v=226+(snN(x/40,y/40,12134,3)-.5)*14;
     if(kept&&dO<4.5){r=156;gg=122;b=60;}                                                 // the bronze frame
     else{if(px<1.5||py<1.5)v-=18;if(py>sill&&py<sill+5)v-=16;r=v;gg=v*.985;b=v*.95;}}}
   else if(kind===1){const sp=y>h*.78,mul=(x%64)<(kept?6:4);
    if(sp){const v=224+(snN(x/30,y/30,12135,2)-.5)*12;r=v;gg=v*.98;b=v*.94;if(y<h*.79+3)r=gg=b=170;}
    else if(mul){if(kept){r=156;gg=122;b=60;}else{r=gg=b=70;}}
    else{const pc=snH(Math.floor(x/64),3,12136);
     if(kept){const o=snOnyx(x,y,12137);r=o[0];gg=o[1];b=o[2];if(pc<.45)a=.3+o[3]*.3;}
     else{const k=40+30*(y/h);r=k*.8;gg=k*.95;b=k*1.15;if(pc<.35){r=110;gg=92;b=66;a=.55;}}}}
   else if(kind===2){const f=(x%128)<3||(y%128)<3;
    if(f){r=gg=b=48;}else{const n=snN(x/90,y/60,12138,2),k=56+n*40+(y/h)*22;r=k*.78;gg=k*.94;b=k*1.12;
     if(snH(Math.floor(x/128),Math.floor(y/128),12139)<.4&&(y%128)>70){a=.22;}}}
   else if(kind===3){const o=snOnyx(x,y,12140);r=o[0];gg=o[1];b=o[2];a=.25+o[3]*.45;}
   else if(kind===4){const pier=(x%128)<18,ribbon=py>.22*fh&&py<.64*fh;
    if(pier){const f=Math.cos(((x%128)/18)*Math.PI*3);const v=214+f*16;r=v;gg=v*.98;b=v*.94;}
    else if(ribbon){if((x%32)<2){r=gg=b=60;}else{const k=48+(py/fh)*30;r=k*.82;gg=k*.95;b=k*1.12;if(cr<.4&&snH(Math.floor(x/32),fi,12141)<.5){r=112;gg=94;b=68;a=.45;}}}
    else{const v=206+(snN(x/40,y/40,12142,3)-.5)*14;r=v;gg=v*.98;b=v*.93;if(py>.64*fh&&py<.64*fh+4)r=gg=b=150;}}
   if(emis){D[i]=clamp(255*a+57*ac,0,255);D[i+1]=clamp(196*a+214*ac,0,255);D[i+2]=clamp(130*a+232*ac,0,255);D[i+3]=255;continue;}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.snWall=snSkin(0,0,0);TEX.snWallE=snSkin(0,0,1);TEX.snWallK=snSkin(0,1,0);TEX.snWallKE=snSkin(0,1,1);
TEX.snPod=snSkin(1,0,0);TEX.snPodE=snSkin(1,0,1);TEX.snPodK=snSkin(1,1,0);TEX.snPodKE=snSkin(1,1,1);
TEX.snPlate=snSkin(2,0,0);TEX.snPlateE=snSkin(2,0,1);TEX.snOnyx=snSkin(3,1,0);TEX.snOnyxE=snSkin(3,1,1);
TEX.snPodium=snSkin(4,0,0);TEX.snPodiumE=snSkin(4,0,1);

// ---- the talking heads: an Ancient terminal's face, cyan line art on dark glass. Calm faces are closed-eyed; the
// deranged one has an eye open, its lines doubled and slipping (patterns/eternian/talking-heads replaces these)
function snFaceTex(v,der){return canvasTex(256,256,(g,w,h)=>{g.fillStyle='#0b1215';g.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=4){g.fillStyle='rgba(57,214,232,.035)';g.fillRect(0,y,w,1);}
 const L=(pts,off)=>{g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0]+(off||0),p[1]));g.stroke();};
 const wv=[0,10,-8,6][v%4],lv=[0,6,-4,10][v%4];
 const draw=off=>{g.strokeStyle='rgba(57,214,232,.95)';g.lineWidth=3;
  L([[128,34-lv],[176+wv,60],[188+wv,118],[176+wv*.5,176],[148,214],[128,222],[108,214],[80-wv*.5,176],[68-wv,118],[80-wv,60],[128,34-lv]],off);
  L([[86-wv,62],[100,40-lv],[128,30-lv],[156,40-lv],[170+wv,62]],off);                        // the stepped headdress line
  L([[96,106],[118,104]],off);L([[138,104],[160,106]],off);                                     // the brows
  if(der&&off){g.beginPath();g.arc(150+off,122,9,0,TAU);g.stroke();}
  else{g.beginPath();g.arc(108+off,118,11,.15*Math.PI,.85*Math.PI);g.stroke();}
  g.beginPath();g.arc(150+(off||0),118,11,.15*Math.PI,.85*Math.PI);g.stroke();               // the closed lids
  L([[128,124],[122,160],[132,162]],off);L([[112,186],[128,190],[144,186]],off);
  L([[128,222],[128,250]],off);L([[40,250],[96,236],[128,250],[160,236],[216,250]],off);};
 draw(0);if(der){g.globalAlpha=.6;draw(9);g.globalAlpha=1;
  for(let k=0;k<5;k++){const y=40+k*44+(v*13)%20;g.drawImage(g.canvas,0,y,w,6,(k%2?14:-10),y,w,6);}}
 g.strokeStyle='rgba(57,214,232,.5)';g.lineWidth=2;g.strokeRect(8,8,w-16,h-16);g.strokeRect(16,16,w-32,h-32);});}
TEX.snFace=[0,1,2,3].map(v=>snFaceTex(v,0));TEX.snFaceX=snFaceTex(1,1);
// ---- the sign: a gold face with its eyes closed on black, green highlights (patterns/eternian/sign replaces it)
TEX.snBanner=canvasTex(128,512,(g,w,h)=>{g.fillStyle='#141416';g.fillRect(0,0,w,h);
 g.strokeStyle='#d8b24a';g.lineWidth=2;g.strokeRect(5,5,w-10,h-10);
 g.fillStyle='#d8b24a';g.beginPath();[[64,52],[96,74],[102,118],[92,160],[64,182],[36,160],[26,118],[32,74]].forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]));g.fill();
 g.fillStyle='#b8952e';g.beginPath();g.moveTo(64,52);g.lineTo(96,74);g.lineTo(64,96);g.fill();
 g.strokeStyle='#3f8a5a';g.lineWidth=3;g.beginPath();g.arc(50,120,9,.1*Math.PI,.9*Math.PI);g.stroke();g.beginPath();g.arc(78,120,9,.1*Math.PI,.9*Math.PI);g.stroke();
 g.beginPath();g.moveTo(36,100);g.lineTo(58,96);g.moveTo(70,96);g.lineTo(92,100);g.stroke();
 g.strokeStyle='#141416';g.lineWidth=2;g.beginPath();g.moveTo(64,124);g.lineTo(60,146);g.lineTo(68,148);g.moveTo(54,164);g.lineTo(74,164);g.stroke();
 g.fillStyle='#d8b24a';[[40,40],[52,30],[64,26],[76,30],[88,40]].forEach(p=>g.fillRect(p[0]-5,p[1]-4,10,8));
 g.strokeStyle='#d8b24a';g.lineWidth=2;let x=64,y=200;g.beginPath();g.moveTo(x,y);
 for(let k=0;k<26;k++){const s=snH(k,1,12150)<.5?-1:1;x=clamp(x+s*12,44,84);g.lineTo(x,y);y+=11;g.lineTo(x,y);}g.stroke();
 g.strokeStyle='#3f8a5a';g.lineWidth=2;g.strokeRect(12,h-26,w-24,10);});

const snStd=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:1,metalness:0,side:DS},o));
const snGlow=(map,em,k,o)=>snStd(Object.assign({map:map,emissive:0xffffff,emissiveMap:em,emissiveIntensity:k},o||{}));
MAT.snWall=snGlow(TEX.snWall,TEX.snWallE,.5,{roughnessMap:TEX.concreteRM});
MAT.snWallK=snGlow(TEX.snWallK,TEX.snWallKE,.6,{roughnessMap:TEX.concreteRM});
MAT.snPod=snGlow(TEX.snPod,TEX.snPodE,.55);MAT.snPodK=snGlow(TEX.snPodK,TEX.snPodKE,.6);
MAT.snPlate=snGlow(TEX.snPlate,TEX.snPlateE,.4,{roughness:.22,metalness:.15});
MAT.snOnyx=snGlow(TEX.snOnyx,TEX.snOnyxE,.55,{roughness:.35});
MAT.snPodium=snGlow(TEX.snPodium,TEX.snPodiumE,.45,{roughnessMap:TEX.concreteRM});
// the Ancients' white, a darker deck (a deck is walked on: without the split no terrace reads), painted shade (nothing
// here casts a shadow), the stairs' pale stone, the kept court's paving, the moat, the gunmetal coping
MAT.snWhite=snStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xe8e3d8});
MAT.snDeck=snStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x8f8a7e});
MAT.snPave=snStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xbdb5a4});
MAT.snLawn=snStd({map:TEX.concrete,color:0x5d7a3c});
MAT.snShade=snStd({map:TEX.concrete,color:0x57534b});
MAT.snStone=snStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd6cebd});
MAT.snWater=snStd({color:0x2e4848,roughness:.12,metalness:.25});
MAT.snGun=snStd({map:TEX.concrete,color:0x4a5058,roughness:.6});
MAT.snBronze=snStd({color:0x8c6a34,metalness:.45,roughness:.36});
MAT.snCyan=new THREE.MeshBasicMaterial({color:0x39d6e8});
MAT.snDead=snStd({color:0x3a4046,roughness:.4,metalness:.3});
MAT.snDomeG=snStd({color:0x9fb6c2,roughness:.12,metalness:.25,emissive:0x302418,emissiveIntensity:1});
// instanced: white kit pieces tinted per instance, and metal tinted by rank (gold, silver, bronze, gunmetal, titanium)
MAT.snKit=snStd({map:TEX.concrete,color:0xffffff});
MAT.snMetal=snStd({color:0xffffff,metalness:.35,roughness:.42,flatShading:true});
MAT.snBanner=snStd({map:TEX.snBanner,roughness:.9});

// ---- the delivered library sets (core/materials/PROMPTS-NEEDED.md section 8, delivered 2026-10-20) --------------------
// Each key is a family in kits/ancients/materials.json (`own`: the Podium's alone); KMAT.bindMat swaps in the set's maps
// when the pack has it, and ?mat=proc keeps the procedural stand-ins above. `tile` is how many metres one UV unit is
// where the drawing writes metre-based UVs (8aq3); the bands, the frieze and the banner write UVs in tiles already.
MAT.snAlab=snGlow(TEX.snOnyx,TEX.snOnyxE,.5,{roughness:.35,color:0xf6f1e8});
MAT.snTitan=snStd({color:0x9aa1a8,metalness:.55,roughness:.35});
MAT.snScreen=snStd({color:0x9c7a3c,metalness:.5,roughness:.4,alphaTest:.5});MAT.snScreenB=MAT.snScreen.clone();
MAT.snFrieze=snStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd8d0bf});
MAT.snMaze=snStd({color:0xd8b24a,roughness:.8});MAT.snMazeB=MAT.snMaze.clone();MAT.snMazeC=MAT.snMaze.clone();
KMAT.bindMat('ancients',MAT,{tile:{snOnyx:4,snAlab:4,snTitan:44,snScreen:2,snScreenB:2}});
for(const k of ['snOnyx','snAlab'])if(MAT[k].userData.lib){MAT[k].emissiveMap=MAT[k].map;MAT[k].emissiveIntensity=.42;MAT[k].color.set(0xffffff);}
for(const k of ['snMaze','snMazeB','snMazeC'])if(MAT[k].userData.lib)MAT[k].color.set(0xd8b24a);   /* gold on black: the court's band */
for(const k of ['snScreen','snScreenB'])if(MAT[k].userData.lib){MAT[k].color.set(0xffffff);MAT[k].alphaTest=.5;MAT[k].side=DS;}
MAT.snFrieze.color.set(0xd8d0bf);
/* the kit has no environment map for a metal to reflect: the titanium keeps a little metalness so its planes read */
MAT.snTitan.metalness=.22;MAT.snTitan.roughness=.42;
const SN_SCREENS_LIB=!!MAT.snScreen.userData.lib;
// the terminal faces: nine cells of the owner's sheet (the eighth, the bottom row's middle, answers deranged), or the
// procedural four and the deranged one when the pack lacks it
const SN_FACE_DERANGED=7,SN_FACE_CALM=[0,1,2,3,4,5,6,8];
/* one shared texture (it decodes after this runs, so a clone would keep the empty placeholder); each face's plane maps
   its own cell instead */
const SN_FACE_SHEET=(function(){const L=KMAT.mode==='lib'?KMAT.packed('ancients','snFaces'):null;return L?KMAT.textures(L,{aniso:8}).map:null;})();
function snCellGeo(c){const g=new THREE.PlaneGeometry(1,1),uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(c%3+uv.getX(i))/3,(2-Math.floor(c/3)+uv.getY(i))/3);return g;}
MAT.snFaceM=[];for(let c=0;c<9;c++)MAT.snFaceM.push(new THREE.MeshBasicMaterial({map:SN_FACE_SHEET||(c===SN_FACE_DERANGED?TEX.snFaceX:TEX.snFace[c%4]),side:DS}));

// ---- the faceted heads ----------------------------------------------------------------------------------------------
// The Eternian kit's generator (kits/eternian/src/42-et-head.js, read in place by build.py: TARGET_READS): the Deco-
// cubist head built from planes, the closed eyes the default and the rule (LORE.md 6.19: the city is mostly closed
// eyes). SN_HEADS variants, each a seeded face with its own headdress (step, fan, ring, none in turn), instanced; a head
// takes the variant its record's id hashes to (8aq3: snHeadKey). The neck's foot sits at y 0, the chin at .16, the crown
// at 1.16 before the headdress. The colossus has its own (titanium, the stepped headdress); the ridges' face-stones are
// mask shells (a flat back).
const SN_HEADS=12,SN_HEAD_DRESS=['step','fan','ring','none'];
function snGeoOf(G,lift){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(G.uv,2));if(lift)g.translate(0,lift,0);g.computeVertexNormals();return g;}
function snHeadGeo(seed,o){return snGeoOf(etHeadGeo(etHeadParams(seed,o)),o&&o.mask?0:.16);}

kdef('snBox',new THREE.BoxGeometry(1,1,1),MAT.snKit);
kdef('snBar',new THREE.BoxGeometry(1,1,1),MAT.snMetal);
for(let i=0;i<SN_HEADS;i++)kdef('snHead'+i,snHeadGeo(KRAND.hash(0x5a9c7,i),{headdress:SN_HEAD_DRESS[i%4]}),MAT.snMetal);
kdef('snMask',snHeadGeo(KRAND.hash(0x5a9c7,99),{mask:true}),MAT.snMetal);
kdef('snVeil',snGeoOf(etVeilGeo({seed:KRAND.hash(0x5a9c7,77)}),.16),MAT.snMetal);   /* the generator's draped veil (kits/eternian 42-et-head.js) */
kdef('snRoof4',new THREE.ConeGeometry(.7071,1,4,1).rotateY(Math.PI/4).translate(0,.5,0),MAT.snMetal);
kdef('snDome',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2),MAT.snMetal);
kdef('snDomeG',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2),MAT.snDomeG);
kdef('snCyl',new THREE.CylinderGeometry(1,1,1,12).translate(0,.5,0),MAT.snKit);
for(let c=0;c<9;c++)kdef('snFace'+c,SN_FACE_SHEET?snCellGeo(c):new THREE.PlaneGeometry(1,1),MAT.snFaceM[c]);
kdef('snBanner',new THREE.PlaneGeometry(1,1).translate(0,-.5,0),MAT.snBanner);
/* the colossus in titanium: its own head and shoulders, so the library metal maps once over 44 m */
kdef('snHeadTi',snHeadGeo(KRAND.hash(0x5a9c7,44),{headdress:'step',long:.7,broad:.6}),MAT.snTitan);kdef('snBoxTi',new THREE.BoxGeometry(1,1,1),MAT.snTitan);
