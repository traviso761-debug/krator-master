// ================================================================= PAINTED SHEETS: the Islanders' motifs, drawn on canvases (STAND-INS)
// The gable paintings, the carved-and-painted band, the storyboard panels, the East's woven facade and the white island moon
// are the owner's sheets in the material library (2026-10-14: patterns/islander/*, packed by materials.json). Without the
// pack (?mat=proc) each is drawn here on a 512 px canvas, deterministically, in the culture's colours, and used
// as the map of its MAT key. When a sheet of that name is packed (materials.json, tools/textures/pack.py), the library set
// wins and the canvas is never drawn (KIT_HAS). The motifs (the owner's "motifs" references): Batak gorga spirals and
// lozenges on red (patGableW), Ede and Sumba woven chevrons and nested diamonds (patGableE, patWeave), a Maori kowhaiwhai
// koru scroll (patBand), a Palauan bai storyboard of fish, canoes, birds and moons (patStory), the white moon (medMoon).
// Browser only (a canvas): [B host] in PORT.md. Godot takes the owner's sheets as textures instead.
const ISP_C={red:'#9a2a1e',redD:'#6e1a12',black:'#1e1a18',white:'#efe6d2',ochre:'#c8922e',teal:'#2a7a7a',tealD:'#1c5656',sand:'#c49a5a',bark:'#8a5a32',cream:'#e6d8b8'};
function ispRand(s){let a=s>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function ispCanvas(fn,w,h){const c=document.createElement('canvas');c.width=w||512;c.height=h||512;const g=c.getContext('2d');g.lineCap='round';g.lineJoin='round';fn(g,c.width,c.height);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=TEXANISO;return t;}
/* an Archimedean spiral of `turns` from radius r0 out to r1 about (x,y), starting at angle a0, turning dir (1 or -1) */
function ispSpiral(g,x,y,r0,r1,turns,a0,dir){g.beginPath();const n=Math.ceil(turns*36);for(let i=0;i<=n;i++){const t=i/n,a=a0+dir*t*turns*TAU,r=r0+(r1-r0)*t;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i)g.lineTo(px,py);else g.moveTo(px,py);}g.stroke();}
function ispDiamond(g,x,y,rw,rh){g.beginPath();g.moveTo(x,y-rh);g.lineTo(x+rw,y);g.lineTo(x,y+rh);g.lineTo(x-rw,y);g.closePath();}
/* WEST GABLE (Batak gorga): a red field, pairs of interlocking black spirals edged white, white lozenges, toothed bands */
function ispGableW(g,W,H){g.fillStyle=ISP_C.red;g.fillRect(0,0,W,H);const C=W/2;
 for(let j=0;j<2;j++){const y0=j*C;
  for(const [yy,col] of [[y0+4,ISP_C.white],[y0+12,ISP_C.black],[y0+C-16,ISP_C.black],[y0+C-8,ISP_C.white]]){g.fillStyle=col;g.fillRect(0,yy,W,6);}
  g.fillStyle=ISP_C.black;for(let x=0;x<W;x+=32){g.beginPath();g.moveTo(x,y0+18);g.lineTo(x+16,y0+34);g.lineTo(x+32,y0+18);g.fill();g.beginPath();g.moveTo(x,y0+C-22);g.lineTo(x+16,y0+C-38);g.lineTo(x+32,y0+C-22);g.fill();}
  for(let i=0;i<2;i++){const cx=i*C+C/2,cy=y0+C/2;
   for(const [lw,col] of [[15,ISP_C.white],[9,ISP_C.black]]){g.lineWidth=lw;g.strokeStyle=col;ispSpiral(g,cx-46,cy,4,52,2.3,0,1);ispSpiral(g,cx+46,cy,4,52,2.3,PI,1);}
   g.fillStyle=ISP_C.white;ispDiamond(g,cx,cy,26,40);g.fill();g.lineWidth=5;g.strokeStyle=ISP_C.black;ispDiamond(g,cx,cy,26,40);g.stroke();
   g.fillStyle=ISP_C.black;ispDiamond(g,cx,cy,10,16);g.fill();
   g.fillStyle=ISP_C.white;for(const s of [-1,1]){g.beginPath();g.arc(cx+s*(C/2-10),cy,7,0,TAU);g.fill();}}}}
/* EAST GABLE (Ede, Sumba): a cream woven field in bands of nested diamonds and triple zigzags, dark brown and ochre */
function ispGableE(g,W,H){g.fillStyle=ISP_C.cream;g.fillRect(0,0,W,H);const B=H/4;
 for(let j=0;j<4;j++){const y0=j*B;g.fillStyle=ISP_C.black;g.fillRect(0,y0,W,4);g.fillRect(0,y0+B-4,W,3);
  if(j%2===0){for(let i=0;i<4;i++){const cx=i*W/4+W/8,cy=y0+B/2;for(let k=0;k<4;k++){g.lineWidth=5;g.strokeStyle=k%2?ISP_C.ochre:ISP_C.black;ispDiamond(g,cx,cy,52-k*12,48-k*11);g.stroke();}
    g.fillStyle=ISP_C.redD;ispDiamond(g,cx,cy,6,6);g.fill();}}
  else{for(let k=0;k<3;k++){g.lineWidth=6;g.strokeStyle=k===1?ISP_C.ochre:ISP_C.black;g.beginPath();const yy=y0+B*.3+k*18;for(let x=0;x<=W;x+=32){const py=yy+((x/32)%2?22:0);if(x)g.lineTo(x,py);else g.moveTo(x,py);}g.stroke();}}}
 const R=ispRand(77);g.globalAlpha=.08;g.fillStyle=ISP_C.black;for(let i=0;i<1800;i++)g.fillRect(R()*W,R()*H,1+R()*3,1);g.globalAlpha=1;}
/* THE BAND (kowhaiwhai): a red field, rows of white koru scrolls outlined in black, each hooked to the next */
function ispBand(g,W,H){g.fillStyle=ISP_C.red;g.fillRect(0,0,W,H);const S=W/4,R=H/4;
 for(let j=0;j<4;j++)for(let i=0;i<4;i++){const cx=i*S+S/2,cy=j*R+R/2,f=(i+j)%2?1:-1;
  for(const [lw,col] of [[16,ISP_C.black],[8,ISP_C.white]]){g.lineWidth=lw;g.strokeStyle=col;ispSpiral(g,cx+f*16,cy,3,30,1.2,f>0?PI:0,f);
   g.beginPath();g.moveTo(cx-f*16,cy+28);g.quadraticCurveTo(cx-f*S*.5,cy+28,cx-f*S*.5,cy);g.stroke();}
  g.fillStyle=ISP_C.black;g.beginPath();g.arc(cx+f*16,cy,6,0,TAU);g.fill();}}
/* THE STORYBOARD (Palau bai): an ochre field in two registers between black and white bands: canoes with paddlers, fish,
   frigate birds, moons; outlines black, fills white and red */
function ispStory(g,W,H){g.fillStyle=ISP_C.ochre;g.fillRect(0,0,W,H);const RH=H/2;
 for(let j=0;j<2;j++){const y0=j*RH;g.fillStyle=ISP_C.black;g.fillRect(0,y0,W,10);g.fillStyle=ISP_C.white;g.fillRect(0,y0+10,W,5);
  g.fillStyle=ISP_C.black;for(let x=0;x<W;x+=24){g.beginPath();g.moveTo(x,y0+15);g.lineTo(x+12,y0+27);g.lineTo(x+24,y0+15);g.fill();}
  const cy=y0+RH*.58;g.lineWidth=5;g.strokeStyle=ISP_C.black;
  if(j===0){/* a canoe with five paddlers under a moon, two fish */
   g.fillStyle=ISP_C.red;g.beginPath();g.moveTo(60,cy+20);g.quadraticCurveTo(256,cy+70,452,cy+20);g.lineTo(470,cy-6);g.lineTo(430,cy+18);g.lineTo(82,cy+18);g.lineTo(42,cy-6);g.closePath();g.fill();g.stroke();
   for(let k=0;k<5;k++){const x=150+k*52;g.fillStyle=ISP_C.black;g.beginPath();g.arc(x,cy-34,9,0,TAU);g.fill();g.fillRect(x-5,cy-26,10,40);g.beginPath();g.moveTo(x+4,cy-14);g.lineTo(x+26,cy+40);g.stroke();}
   g.fillStyle=ISP_C.white;g.beginPath();g.arc(420,y0+62,22,0,TAU);g.fill();g.stroke();}
  else{/* fish and frigate birds */
   for(let k=0;k<3;k++){const x=90+k*165;g.fillStyle=k%2?ISP_C.white:ISP_C.red;g.beginPath();g.ellipse(x,cy+8,46,18,0,0,TAU);g.fill();g.stroke();
    g.beginPath();g.moveTo(x+44,cy+8);g.lineTo(x+70,cy-12);g.lineTo(x+70,cy+28);g.closePath();g.fill();g.stroke();g.fillStyle=ISP_C.black;g.beginPath();g.arc(x-28,cy+4,4,0,TAU);g.fill();}
   for(let k=0;k<4;k++){const x=50+k*130,y=y0+60;g.beginPath();g.moveTo(x-30,y+6);g.quadraticCurveTo(x-14,y-12,x,y+4);g.quadraticCurveTo(x+14,y-12,x+30,y+6);g.stroke();}}}}
/* THE EAST'S WOVEN WALL: split bamboo in a twill, light and dark strips stepping into diamonds */
function ispWeave(g,W,H){const N=32,s=W/N;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const d=Math.abs(((i+j)%16)-8)+Math.abs(((i-j+64)%16)-8);const dark=((i+2*j)%4<2)!==(d<5);
  g.fillStyle=dark?'#6a5236':'#d8c294';g.fillRect(i*s,j*s,s,s);g.fillStyle=dark?'rgba(0,0,0,.18)':'rgba(255,255,255,.14)';g.fillRect(i*s,j*s,s,2);}}
/* THE WHITE ISLAND MOON: a sea-teal disc, the full moon in white with its seas, a ring of shell dots, black and ochre rims */
function ispMoon(g,W,H){const c=W/2;g.fillStyle=ISP_C.black;g.fillRect(0,0,W,H);g.fillStyle=ISP_C.ochre;g.beginPath();g.arc(c,c,c-4,0,TAU);g.fill();
 g.fillStyle=ISP_C.black;g.beginPath();g.arc(c,c,c-22,0,TAU);g.fill();g.fillStyle=ISP_C.teal;g.beginPath();g.arc(c,c,c-32,0,TAU);g.fill();
 g.fillStyle=ISP_C.white;for(let i=0;i<24;i++){const a=i/24*TAU;g.beginPath();g.arc(c+Math.cos(a)*(c-58),c+Math.sin(a)*(c-58),9,0,TAU);g.fill();}
 g.fillStyle='#f6f0e2';g.beginPath();g.arc(c,c,c*.5,0,TAU);g.fill();g.fillStyle='rgba(120,130,140,.28)';
 for(const [x,y,r] of [[-.16,-.12,.16],[.14,.02,.12],[-.04,.2,.1],[.2,-.2,.06]]){g.beginPath();g.arc(c+x*W,c+y*W,r*W*.5,0,TAU);g.fill();}}
/* the materials: a canvas stand-in for every painted key the pack lacks */
const ISP_SHEETS={patGableW:[ispGableW,2.4],patGableE:[ispGableE,2.2],patBand:[ispBand,1.2],patStory:[ispStory,3.2],patWeave:[ispWeave,2.4],medMoon:[ispMoon,1],
 patGableW2:[ispGableW,2.4],patGableE2:[ispGableE,2.2],patHinggi:[ispGableE,2],patMat:[ispWeave,1.6]};   /* the variants, the hinggi and the plaited mat draw as their kin */
const ISP_STANDIN=[];
for(const k in ISP_SHEETS){if(KIT_HAS(k))continue;   /* ?mat=proc still shows the motifs: they are the culture, not a surface detail */
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:0,map:ispCanvas(ISP_SHEETS[k][0]),side:THREE.DoubleSide});
 MAT[k]=m;TILE[k]=ISP_SHEETS[k][1];ISP_STANDIN.push(k);}
svAnimHooks();   /* the cut-away and flutter hooks on the new materials (matHook skips a hook a material already has) */
