// ---------------------------------------------------------------- ring sea textures (surfaces)
// All near-white or mid-grey so the vertex colour carries the hue. World tiles: plank 4 m (hull),
// 3 m (deck); thatch and tile 2 m; the turtle's hex plate and the chitin scale 3 m.
function rsSpeckle(g,W,H,n,a,dark){for(let i=0;i<n;i++){const x=h3(i,1.3,7)*W,y=h3(i,5.1,2)*H;g.fillStyle=`rgba(${dark?0:255},${dark?0:255},${dark?0:255},${a*h3(i,9,9)})`;g.fillRect(x,y,1+h3(i,2,4)*2,1+h3(i,4,2)*2);}}
TEX.rsPlank=canvasTex(512,512,(g,W,H)=>{g.fillStyle='#d9d2c6';g.fillRect(0,0,W,H);const n=16,sh=H/n;
 for(let r=0;r<n;r++){const y=r*sh,t=h3(r,3,1);g.fillStyle=`rgb(${200+t*40|0},${192+t*38|0},${178+t*36|0})`;g.fillRect(0,y,W,sh);
  for(let k=0;k<7;k++){const yy=y+h3(r,k,2)*sh;g.strokeStyle=`rgba(90,70,50,${.06+.08*h3(r,k,5)})`;g.lineWidth=1;g.beginPath();g.moveTo(0,yy);
   for(let x=0;x<=W;x+=32)g.lineTo(x,yy+Math.sin(x*.02+k+r)*1.6);g.stroke();}
  const bx=(h3(r,7,7)*W)|0;g.fillStyle='rgba(40,28,18,.55)';g.fillRect(bx,y,2,sh);g.fillRect((bx+W/2)%W,y,2,sh);
  g.fillStyle='rgba(30,20,12,.55)';g.fillRect(0,y,W,2);g.fillStyle='rgba(255,250,235,.25)';g.fillRect(0,y+2,W,1);
  for(const x of[bx+12,(bx+W/2)%W+12]){g.fillStyle='rgba(40,30,20,.6)';g.fillRect(x%W,y+sh*.3,3,3);g.fillRect(x%W,y+sh*.65,3,3);}}
 rsSpeckle(g,W,H,1800,.12,true);});
TEX.rsGrain=canvasTex(256,256,(g,W,H)=>{g.fillStyle='#e8e4dc';g.fillRect(0,0,W,H);for(let k=0;k<40;k++){const y=h3(k,1,3)*H;g.strokeStyle=`rgba(80,70,60,${.05+.06*h3(k,2,2)})`;g.beginPath();g.moveTo(0,y);for(let x=0;x<=W;x+=16)g.lineTo(x,y+Math.sin(x*.03+k)*2);g.stroke();}rsSpeckle(g,W,H,900,.08,true);});
TEX.rsCloth=canvasTex(256,256,(g,W,H)=>{g.fillStyle='#e9e3d6';g.fillRect(0,0,W,H);for(let i=0;i<W;i+=3){g.fillStyle=`rgba(0,0,0,${.04+.04*h3(i,1,1)})`;g.fillRect(i,0,1,H);g.fillRect(0,i,W,1);}rsSpeckle(g,W,H,600,.1,true);});
TEX.rsThatch=canvasTex(256,256,(g,W,H)=>{g.fillStyle='#b8a67c';g.fillRect(0,0,W,H);for(let r=0;r<8;r++){const y=r*H/8;for(let i=0;i<260;i++){const x=h3(i,r,3)*W,l=H/8*(1.1+h3(i,r,1)*.5),c=150+h3(i,r,7)*90|0;
 g.strokeStyle=`rgb(${c},${c*.88|0},${c*.6|0})`;g.lineWidth=1+h3(i,r,2);g.beginPath();g.moveTo(x,y);g.lineTo(x+(h3(i,r,9)-.5)*6,y+l);g.stroke();}g.fillStyle='rgba(40,30,10,.35)';g.fillRect(0,y+H/8-3,W,3);}});
TEX.rsTile=canvasTex(256,256,(g,W,H)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,W,H);const rows=8,cols=10,rh=H/rows,cw=W/cols;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=c*cw+(r%2)*cw/2,y=r*rh,t=h3(r,c,4);const gr=g.createLinearGradient(x,0,x+cw,0);
  gr.addColorStop(0,`rgb(${150+t*40|0},${150+t*40|0},${150+t*40|0})`);gr.addColorStop(.5,`rgb(${225+t*30|0},${225+t*30|0},${225+t*30|0})`);gr.addColorStop(1,`rgb(${140+t*40|0},${140+t*40|0},${140+t*40|0})`);
  g.fillStyle=gr;g.fillRect(x%W,y,cw-2,rh-2);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x%W,y+rh-4,cw-2,3);}});
TEX.rsHex=canvasTex(512,512,(g,W,H)=>{g.fillStyle='#b8b4ac';g.fillRect(0,0,W,H);const R=W/8,hx=R*Math.sqrt(3);
 for(let r=-1;r<H/(R*1.5)+1;r++)for(let c=-1;c<W/hx+1;c++){const cx=c*hx+(r%2?hx/2:0),cy=r*R*1.5,t=h3(r,c,8);g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*R*.92,cy+Math.sin(a)*R*.92);}g.closePath();
  const gr=g.createRadialGradient(cx-R*.2,cy-R*.3,1,cx,cy,R);gr.addColorStop(0,`rgb(${235+t*20|0},${230+t*20|0},${222|0})`);gr.addColorStop(1,`rgb(${150+t*30|0},${145+t*30|0},${140})`);g.fillStyle=gr;g.fill();
  g.lineWidth=3;g.strokeStyle='rgba(30,26,22,.7)';g.stroke();g.fillStyle='rgba(40,34,30,.8)';g.beginPath();g.arc(cx,cy,R*.13,0,TAU);g.fill();}});
// wrap-safe: the hex grid above is 8 cells across 512 px with a period of hx=R*sqrt3; exact wrap is not needed at 3 m tiles on a shell seen from 10 m+.
TEX.rsChitin=canvasTex(512,512,(g,W,H)=>{g.fillStyle='#6a6048';g.fillRect(0,0,W,H);const rows=6,cols=5,rh=H/rows,cw=W/cols;
 for(let r=rows;r>=-1;r--)for(let c=-1;c<=cols;c++){const x=c*cw+(r%2)*cw/2,y=r*rh,t=h3(r,c,3);const gr=g.createRadialGradient(x+cw*.5,y+rh*.2,2,x+cw*.5,y+rh*.6,cw*.8);
  gr.addColorStop(0,`rgb(${240},${232},${200+t*30|0})`);gr.addColorStop(.6,`rgb(${190+t*30|0},${176+t*20|0},${140})`);gr.addColorStop(1,'rgb(90,80,60)');g.fillStyle=gr;
  g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+cw*.5,y-rh*.25,x+cw,y);g.lineTo(x+cw,y+rh*.9);g.quadraticCurveTo(x+cw*.5,y+rh*1.35,x,y+rh*.9);g.closePath();g.fill();g.strokeStyle='rgba(30,24,16,.6)';g.lineWidth=2;g.stroke();}});
TEX.rsWater=canvasTex(512,512,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=x/W,v=y/H;const f=(a,b,s)=>{let t=0,A=1;for(let o=0;o<4;o++){t+=A*(Math.sin((u*a+v*b)*TAU*s*(o+1)+o*1.7+Math.sin(v*TAU*(o+2))*1.3));A*=.5;}return t;};
  const hx=f(3,1,1)+f(-1,2,2)*.6,hy=f(1,-3,1)+f(2,1,2)*.6;const i=(y*W+x)*4;d[i]=128+hx*22;d[i+1]=128+hy*22;d[i+2]=255;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.rsWater.encoding=THREE.LinearEncoding;

// ---------------------------------------------------------------- ring sea materials
rsDefMat('wood',new THREE.MeshStandardMaterial({map:TEX.rsPlank,vertexColors:true,roughness:.82,side:DS}));
rsDefMat('paint',new THREE.MeshStandardMaterial({map:TEX.rsGrain,vertexColors:true,roughness:.62,side:DS}));
rsDefMat('metal',new THREE.MeshStandardMaterial({vertexColors:true,metalness:.8,roughness:.36,side:DS}));
rsDefMat('rope',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:DS}));
rsDefMat('cloth',new THREE.MeshStandardMaterial({map:TEX.rsCloth,vertexColors:true,roughness:.95,side:DS}));
rsDefMat('thatch',new THREE.MeshStandardMaterial({map:TEX.rsThatch,vertexColors:true,roughness:1,side:DS}));
rsDefMat('tile',new THREE.MeshStandardMaterial({map:TEX.rsTile,vertexColors:true,roughness:.7,side:DS}));
rsDefMat('hex',new THREE.MeshStandardMaterial({map:TEX.rsHex,vertexColors:true,metalness:.55,roughness:.5,side:DS}));
rsDefMat('chitin',new THREE.MeshStandardMaterial({map:TEX.rsChitin,vertexColors:true,metalness:.15,roughness:.32,side:DS}));
rsDefMat('glow',new THREE.MeshBasicMaterial({vertexColors:true,side:DS}));
rsDefMat('ancient',MAT.white);rsDefMat('bronze',MAT.verdigris);rsDefMat('rust',MAT.rust);
// the oars and paddles are InstancedMeshes: r128 caches one program per material, so they get their own clone (threejs-pitfalls)
rsDefMat('woodI',RSMAT.wood.clone());

// ---------------------------------------------------------------- sail textures
// A sail is drawn in its OWN plane: the canvas is the bounding box of the sail's 2D outline and the
// draw function receives that outline in canvas pixels, so a border or a motif can follow the real
// edges (the Dalab key-border, the Voth roundels). rsSailMat caches one material per key.
function rsSailMat(key,W,H,draw,outline){const mk='sail:'+key;if(RSMAT[mk])return mk;
 const t=canvasTex(W,H,(g,w,h)=>draw(g,w,h,outline));t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
 rsDefMat(mk,new THREE.MeshStandardMaterial({map:t,roughness:.92,side:DS,alphaTest:.5}));return mk;}   // alphaTest: a painter may cut the cloth (the crab-claw's hollow leech)
// helpers the sail painters share
function rsPolyPath(g,P){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();}
function rsInset(P,d){let cx=0,cy=0;for(const p of P){cx+=p[0];cy+=p[1];}cx/=P.length;cy/=P.length;return P.map(p=>{const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;return[p[0]-dx/l*d,p[1]-dy/l*d];});}
function rsCloth(g,W,H,base,seams,dir){g.fillStyle=base;g.fillRect(0,0,W,H);const n=seams||10;g.strokeStyle='rgba(0,0,0,.13)';g.lineWidth=2;
 for(let i=1;i<n;i++){const t=i/n;g.beginPath();if(dir==='h'){g.moveTo(0,t*H);g.lineTo(W,t*H);}else{g.moveTo(t*W,0);g.lineTo(t*W,H);}g.stroke();}
 for(let i=0;i<2200;i++){g.fillStyle=`rgba(${h3(i,1,1)>.5?255:0},${h3(i,1,1)>.5?255:0},${h3(i,1,1)>.5?240:0},${.04*h3(i,2,2)})`;g.fillRect(h3(i,3,3)*W,h3(i,4,4)*H,3,3);}}
function rsCentroid(P){let x=0,y=0;for(const p of P){x+=p[0];y+=p[1];}return[x/P.length,y/P.length];}
// ---------------------------------------------------------------- culture symbols and liveries
// Copied from core/sockets/80-cultures.js (SYMBOLS and the mkCulture packs, on main): the same marks and
// colours the buildings carry, so a ship reads as the same faction as its port. Re-copy if the packs change.
const RS_CULT={iziz:{field:'#e07a2a',edge:'#2f8f8a',band:'#f2a24a',ink:'#f3e2c0',ink2:'#e07a2a'},
 voth:{field:'#24487a',edge:'#182e4d',band:'#3a5f8f',ink:'#d8cdb4'}};
function rsSymSun(g,cx,cy,R,c1,c2){g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.92,0,TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.54,0,TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.24,0,TAU);g.fill();
 for(let k=0;k<12;k++){const a=k*TAU/12;g.fillStyle=c1;g.beginPath();g.moveTo(cx+Math.cos(a-.11)*R*.98,cy+Math.sin(a-.11)*R*.98);g.lineTo(cx+Math.cos(a)*R*1.18,cy+Math.sin(a)*R*1.18);g.lineTo(cx+Math.cos(a+.11)*R*.98,cy+Math.sin(a+.11)*R*.98);g.fill();}}
function rsSymDiamond(g,cx,cy,R,c1){g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.11);g.lineJoin='round';g.beginPath();g.moveTo(cx,cy-R);g.lineTo(cx+R*.75,cy);g.lineTo(cx,cy+R);g.lineTo(cx-R*.75,cy);g.closePath();g.stroke();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.16,0,TAU);g.fill();}
// a faction sail: field, edge bands along the outline, the symbol at the centroid (sym: 'sun' | 'diamond')
function rsFactionSail(g,W,H,P,C,sym,rk){rsCloth(g,W,H,C.field,8,'h');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle=C.edge;g.lineWidth=W*.06;rsPolyPath(g,P);g.stroke();
 g.strokeStyle=C.band;g.lineWidth=W*.018;rsPolyPath(g,rsInset(P,W*.05));g.stroke();const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*(rk||.17);
 if(sym==='sun')rsSymSun(g,cx,cy,R,C.ink,C.ink2);else rsSymDiamond(g,cx,cy,R,C.ink);g.restore();}
// vertex colours are linear: pass a faction hex through this to see the hex as picked
const rsLin=h=>new THREE.Color(h).convertSRGBToLinear();
