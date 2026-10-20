// ================================================================= THE COIL — skins, materials, the faceted head
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
function coH(x,y,s){return KRAND.h3(x,y,0,s);}
function coN(x,y,s,o){return KRAND.fbm(x,y,0,o||3,s);}
function coOnyx(x,y,s){const n=coN(x/46,y/120,s,3),m=coN(x/9,y/24,s+17,2);
 const t=.5+.5*Math.sin(y/17+n*9+m*2.2);
 let r=lerp(186,242,t),g=lerp(142,226,t),b=lerp(86,190,t);
 if(Math.abs(Math.sin(x/31+n*12))<.06){r=lerp(r,250,.6);g=lerp(g,244,.6);b=lerp(b,232,.6);}
 return [r,g,b,t];}
function coSkin(kind,kept,emis){const W=512,Hh=512;
 return canvasTex(W,Hh,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const NB=kind===0?4:1,NF=kind===0?4:kind===4?2:1,bw=w/NB,fh=h/NF;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),fi=Math.floor(y/fh),px=x-bi*bw,py=y-fi*fh,cr=coH(bi*7+kind,fi*13+kept,12131),c2=coH(bi*3+1,fi*5+2,12132);
   let r=0,gg=0,b=0,a=0,ac=0;
   if(kind===0){
    const hw=.2*bw,cx=.5*bw,cy=.14*fh+hw,sill=.86*fh;
    const inO=py>cy?(Math.abs(px-cx)<hw&&py<sill):(Math.hypot(px-cx,py-cy)<hw);
    const dO=py>cy?Math.max(Math.abs(px-cx)-hw,py-sill):Math.hypot(px-cx,py-cy)-hw;
    if(inO){
     if(kept){const o=coOnyx(x,y,12133);r=o[0];gg=o[1];b=o[2];
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
    else{let v=226+(coN(x/40,y/40,12134,3)-.5)*14;
     if(kept&&dO<4.5){r=156;gg=122;b=60;}                                                 // the bronze frame
     else{if(px<1.5||py<1.5)v-=18;if(py>sill&&py<sill+5)v-=16;r=v;gg=v*.985;b=v*.95;}}}
   else if(kind===1){const sp=y>h*.78,mul=(x%64)<(kept?6:4);
    if(sp){const v=224+(coN(x/30,y/30,12135,2)-.5)*12;r=v;gg=v*.98;b=v*.94;if(y<h*.79+3)r=gg=b=170;}
    else if(mul){if(kept){r=156;gg=122;b=60;}else{r=gg=b=70;}}
    else{const pc=coH(Math.floor(x/64),3,12136);
     if(kept){const o=coOnyx(x,y,12137);r=o[0];gg=o[1];b=o[2];if(pc<.45)a=.3+o[3]*.3;}
     else{const k=40+30*(y/h);r=k*.8;gg=k*.95;b=k*1.15;if(pc<.35){r=110;gg=92;b=66;a=.55;}}}}
   else if(kind===2){const f=(x%128)<3||(y%128)<3;
    if(f){r=gg=b=48;}else{const n=coN(x/90,y/60,12138,2),k=56+n*40+(y/h)*22;r=k*.78;gg=k*.94;b=k*1.12;
     if(coH(Math.floor(x/128),Math.floor(y/128),12139)<.4&&(y%128)>70){a=.22;}}}
   else if(kind===3){const o=coOnyx(x,y,12140);r=o[0];gg=o[1];b=o[2];a=.25+o[3]*.45;}
   else if(kind===4){const pier=(x%128)<18,ribbon=py>.22*fh&&py<.64*fh;
    if(pier){const f=Math.cos(((x%128)/18)*Math.PI*3);const v=214+f*16;r=v;gg=v*.98;b=v*.94;}
    else if(ribbon){if((x%32)<2){r=gg=b=60;}else{const k=48+(py/fh)*30;r=k*.82;gg=k*.95;b=k*1.12;if(cr<.4&&coH(Math.floor(x/32),fi,12141)<.5){r=112;gg=94;b=68;a=.45;}}}
    else{const v=206+(coN(x/40,y/40,12142,3)-.5)*14;r=v;gg=v*.98;b=v*.93;if(py>.64*fh&&py<.64*fh+4)r=gg=b=150;}}
   if(emis){D[i]=clamp(255*a+57*ac,0,255);D[i+1]=clamp(196*a+214*ac,0,255);D[i+2]=clamp(130*a+232*ac,0,255);D[i+3]=255;continue;}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.coWall=coSkin(0,0,0);TEX.coWallE=coSkin(0,0,1);TEX.coWallK=coSkin(0,1,0);TEX.coWallKE=coSkin(0,1,1);
TEX.coPod=coSkin(1,0,0);TEX.coPodE=coSkin(1,0,1);TEX.coPodK=coSkin(1,1,0);TEX.coPodKE=coSkin(1,1,1);
TEX.coPlate=coSkin(2,0,0);TEX.coPlateE=coSkin(2,0,1);TEX.coOnyx=coSkin(3,1,0);TEX.coOnyxE=coSkin(3,1,1);
TEX.coPodium=coSkin(4,0,0);TEX.coPodiumE=coSkin(4,0,1);

// ---- the talking heads: an Ancient terminal's face, cyan line art on dark glass. Calm faces are closed-eyed; the
// deranged one has an eye open, its lines doubled and slipping (patterns/eternian/talking-heads replaces these)
function coFaceTex(v,der){return canvasTex(256,256,(g,w,h)=>{g.fillStyle='#0b1215';g.fillRect(0,0,w,h);
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
TEX.coFace=[0,1,2,3].map(v=>coFaceTex(v,0));TEX.coFaceX=coFaceTex(1,1);
// ---- the sign: a gold face with its eyes closed on black, green highlights (patterns/eternian/sign replaces it)
TEX.coBanner=canvasTex(128,512,(g,w,h)=>{g.fillStyle='#141416';g.fillRect(0,0,w,h);
 g.strokeStyle='#d8b24a';g.lineWidth=2;g.strokeRect(5,5,w-10,h-10);
 g.fillStyle='#d8b24a';g.beginPath();[[64,52],[96,74],[102,118],[92,160],[64,182],[36,160],[26,118],[32,74]].forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]));g.fill();
 g.fillStyle='#b8952e';g.beginPath();g.moveTo(64,52);g.lineTo(96,74);g.lineTo(64,96);g.fill();
 g.strokeStyle='#3f8a5a';g.lineWidth=3;g.beginPath();g.arc(50,120,9,.1*Math.PI,.9*Math.PI);g.stroke();g.beginPath();g.arc(78,120,9,.1*Math.PI,.9*Math.PI);g.stroke();
 g.beginPath();g.moveTo(36,100);g.lineTo(58,96);g.moveTo(70,96);g.lineTo(92,100);g.stroke();
 g.strokeStyle='#141416';g.lineWidth=2;g.beginPath();g.moveTo(64,124);g.lineTo(60,146);g.lineTo(68,148);g.moveTo(54,164);g.lineTo(74,164);g.stroke();
 g.fillStyle='#d8b24a';[[40,40],[52,30],[64,26],[76,30],[88,40]].forEach(p=>g.fillRect(p[0]-5,p[1]-4,10,8));
 g.strokeStyle='#d8b24a';g.lineWidth=2;let x=64,y=200;g.beginPath();g.moveTo(x,y);
 for(let k=0;k<26;k++){const s=coH(k,1,12150)<.5?-1:1;x=clamp(x+s*12,44,84);g.lineTo(x,y);y+=11;g.lineTo(x,y);}g.stroke();
 g.strokeStyle='#3f8a5a';g.lineWidth=2;g.strokeRect(12,h-26,w-24,10);});

const coStd=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:1,metalness:0,side:DS},o));
const coGlow=(map,em,k,o)=>coStd(Object.assign({map:map,emissive:0xffffff,emissiveMap:em,emissiveIntensity:k},o||{}));
MAT.coWall=coGlow(TEX.coWall,TEX.coWallE,.5,{roughnessMap:TEX.concreteRM});
MAT.coWallK=coGlow(TEX.coWallK,TEX.coWallKE,.6,{roughnessMap:TEX.concreteRM});
MAT.coPod=coGlow(TEX.coPod,TEX.coPodE,.55);MAT.coPodK=coGlow(TEX.coPodK,TEX.coPodKE,.6);
MAT.coPlate=coGlow(TEX.coPlate,TEX.coPlateE,.4,{roughness:.22,metalness:.15});
MAT.coOnyx=coGlow(TEX.coOnyx,TEX.coOnyxE,.55,{roughness:.35});
MAT.coPodium=coGlow(TEX.coPodium,TEX.coPodiumE,.45,{roughnessMap:TEX.concreteRM});
// the Ancients' white, a darker deck (a deck is walked on: without the split no terrace reads), painted shade (nothing
// here casts a shadow), the stairs' pale stone, the kept court's paving, the moat, the gunmetal coping
MAT.coWhite=coStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xe8e3d8});
MAT.coDeck=coStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x8f8a7e});
MAT.coPave=coStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xbdb5a4});
MAT.coLawn=coStd({map:TEX.concrete,color:0x5d7a3c});
MAT.coShade=coStd({map:TEX.concrete,color:0x57534b});
MAT.coStone=coStd({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd6cebd});
MAT.coWater=coStd({color:0x2e4848,roughness:.12,metalness:.25});
MAT.coGun=coStd({map:TEX.concrete,color:0x4a5058,roughness:.6});
MAT.coBronze=coStd({color:0x8c6a34,metalness:.45,roughness:.36});
MAT.coCyan=new THREE.MeshBasicMaterial({color:0x39d6e8});
MAT.coDead=coStd({color:0x3a4046,roughness:.4,metalness:.3});
MAT.coDomeG=coStd({color:0x9fb6c2,roughness:.12,metalness:.25,emissive:0x302418,emissiveIntensity:1});
// instanced: white kit pieces tinted per instance, and metal tinted by rank (gold, silver, bronze, gunmetal, titanium)
MAT.coKit=coStd({map:TEX.concrete,color:0xffffff});
MAT.coMetal=coStd({color:0xffffff,metalness:.35,roughness:.42,flatShading:true});
MAT.coFaceM=TEX.coFace.map(t=>new THREE.MeshBasicMaterial({map:t,side:DS}));
MAT.coFaceX=new THREE.MeshBasicMaterial({map:TEX.coFaceX,side:DS});
MAT.coBannerM=coStd({map:TEX.coBanner,roughness:.9});

// ---- the faceted head ----------------------------------------------------------------------------------------------
// A face built from planes, the Deco-cubist head the brief chose because a generator can make a hundred of them:
// ten rings from chin (y 0) to crown (y 1), fourteen points round, front at +z, the features pushed into the front
// points (nose, brows, the CLOSED lids as flat planes, lips, chin), drawn flat-shaded so every plane reads. A stepped
// Deco headdress (three blocks) sits on top. Scale [width, height, depth] in metres; the closed eyes are the default
// and the rule (LORE.md §6.19: the city is mostly closed eyes).
function coHeadGeo(){
 // rings: [y, half-width, half-depth]; points round at uneven angles so the face is a few broad planes: the front
 // ridge, the cheek plane, the side, the back corner, the back
 const R=[[0,.15,.17],[.1,.3,.30],[.22,.36,.36],[.34,.4,.4],[.46,.42,.41],[.56,.42,.42],[.68,.41,.41],[.82,.36,.37],[.93,.24,.27],[1,.05,.05]];
 const PH=[0,.5,1.25,2.1,Math.PI,2*Math.PI-2.1,2*Math.PI-1.25,2*Math.PI-.5],NP=PH.length,F={};
 const bump=(row,j,dz,dx)=>{const k=row+','+j;F[k]=F[k]||[0,0];F[k][0]+=dz;F[k][1]+=dx||0;};
 const both=(row,j,dz,dx)=>{bump(row,j,dz,dx);bump(row,NP-j,dz,dx);};
 bump(3,0,.2);bump(4,0,.12);bump(5,0,.05);                                       // the nose: a wedge, tip low
 bump(2,0,.02);both(2,1,-.04);bump(1,0,.06);                                      // the lips set back, the chin forward
 both(4,1,-.1);both(5,1,.06);both(6,1,.02);                                       // the closed lids: a deep flat plane under the brow
 both(3,1,.03,.04);both(3,2,0,.05);both(1,2,0,.04);                                // the cheekbones and the jaw's corner
 const P=[];for(let i=0;i<R.length;i++){const row=[];for(let j=0;j<NP;j++){const ph=PH[j],y=R[i][0],a=R[i][1],b=R[i][2]*(Math.cos(ph)<0?.92:1);
  const f=F[i+','+j]||[0,0],sx=Math.sin(ph);row.push([(a+f[1])*sx,y,b*Math.cos(ph)+f[0]]);}P.push(row);}
 const pos=[];const tri=(a,b,c)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
 for(let i=0;i<R.length-1;i++)for(let j=0;j<NP;j++){const a=P[i][j],b=P[i][(j+1)%NP],c=P[i+1][(j+1)%NP],e=P[i+1][j];tri(a,b,c);tri(a,c,e);}
 const bot=[0,0,0];for(let j=0;j<NP;j++)tri(bot,P[0][(j+1)%NP],P[0][j]);
 // the headdress: three stepped blocks behind the brow
 const box=(x0,x1,y0,y1,z0,z1)=>{const v=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
  for(const f of [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]]){tri(v[f[0]],v[f[1]],v[f[2]]);tri(v[f[0]],v[f[2]],v[f[3]]);}};
 box(-.34,.34,.86,.98,-.28,.2);box(-.24,.24,.98,1.1,-.22,.12);box(-.12,.12,1.1,1.2,-.16,.04);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;}

kdef('coBox',new THREE.BoxGeometry(1,1,1),MAT.coKit);
kdef('coBar',new THREE.BoxGeometry(1,1,1),MAT.coMetal);
kdef('coHead',coHeadGeo(),MAT.coMetal);
kdef('coVeil',new THREE.SphereGeometry(1,10,6,0,TAU,0,Math.PI/2).scale(1,1,1),MAT.coMetal);
kdef('coRoof4',new THREE.ConeGeometry(.7071,1,4,1).rotateY(Math.PI/4).translate(0,.5,0),MAT.coMetal);
kdef('coDome',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2),MAT.coMetal);
kdef('coDomeG',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2),MAT.coDomeG);
kdef('coCyl',new THREE.CylinderGeometry(1,1,1,12).translate(0,.5,0),MAT.coKit);
kdef('coFace0',new THREE.PlaneGeometry(1,1),MAT.coFaceM[0]);kdef('coFace1',new THREE.PlaneGeometry(1,1),MAT.coFaceM[1]);
kdef('coFace2',new THREE.PlaneGeometry(1,1),MAT.coFaceM[2]);kdef('coFace3',new THREE.PlaneGeometry(1,1),MAT.coFaceM[3]);
kdef('coFaceX',new THREE.PlaneGeometry(1,1),MAT.coFaceX);
kdef('coBanner',new THREE.PlaneGeometry(1,1).translate(0,-.5,0),MAT.coBannerM);
