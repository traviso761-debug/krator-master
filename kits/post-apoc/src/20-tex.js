// ---------------------------------------------------------------- procedural textures
// Grayscale by design: vertex colours tint them (paint, rust, culture livery). Every texture tiles in WORLD units:
// TILE[matKey] is the metres one repeat covers, used by the geometry engine to write UVs.
function canvasTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
function gray(v,a){v=clamp(v|0,0,255);return a===undefined?`rgb(${v},${v},${v})`:`rgba(${v},${v},${v},${a})`;}
function speckle(g,w,h,n,amin,amax,dark){for(let i=0;i<n;i++){const x=rng()*w,y=rng()*h,s=rng()*2+.6;g.fillStyle=dark?`rgba(0,0,0,${rr(amin,amax)})`:`rgba(255,255,255,${rr(amin,amax)})`;g.fillRect(x,y,s,s);}}
// rust is COLOUR, not just darkness: orange-brown scale over the grey, dark pitting at its edges (vertex tints multiply into it)
function rustStreaks(g,w,h,n,vertical){for(let i=0;i<n;i++){const x=rng()*w,y=rng()*h,L=rr(h*.12,h*.7),th=rr(1,5);g.fillStyle=`rgba(${rr(110,150)|0},${rr(48,70)|0},${rr(18,32)|0},${rr(.25,.7)})`;if(vertical)g.fillRect(x,y,th,L);else g.fillRect(x,y,L,th);
 g.fillStyle=`rgba(40,20,10,${rr(.1,.3)})`;if(vertical)g.fillRect(x+th,y,1,L*.8);else g.fillRect(x,y+th,L*.8,1);}}
function blotches(g,w,h,n,rmin,rmax,a){for(let i=0;i<n;i++){const x=rng()*w,y=rng()*h,r=rr(rmin,rmax)*1.5;const gr=g.createRadialGradient(x,y,0,x,y,r);const c=`${rr(125,165)|0},${rr(58,84)|0},${rr(22,38)|0}`;gr.addColorStop(0,`rgba(${c},${Math.min(.9,rr(a*.9,a*1.8))})`);gr.addColorStop(.6,`rgba(${c},${a*.6})`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}}
const TILE={};
// corrugated sheet, ribs VERTICAL (vary along u). 8 ribs per repeat.
function texCorr(rot,ribs,W,H){reseed(9001+(rot?1:0)+ribs);return canvasTex(W||128,H||128,(g,w,h)=>{
 g.save();if(rot){g.translate(w/2,h/2);g.rotate(Math.PI/2);g.translate(-w/2,-h/2);}
 for(let x=0;x<w;x++){const t=x/w*ribs;const s=Math.sin(t*TAU);const v=186+58*s+(s>.7?18:0);g.fillStyle=gray(v);g.fillRect(x,0,1,h);}
 g.restore();   // rust is drawn in the un-rotated frame: rain-runs always run DOWN the sheet
 rustStreaks(g,w,h,54,true);blotches(g,w,h,17,8,28,.42);speckle(g,w,h,260,.05,.25,true);});}
TEX={};
TEX.corr=texCorr(false,8);TILE.corr=0.8;
TEX.corrH=texCorr(true,8);TILE.corrH=0.8;
// shipping container: wide ribs, 4 per 1.2 m; also the flat top/end panels are just this
TEX.cont=texCorr(false,4,256,128);TILE.cont=1.2;
// patchwork sheet: rivets, seams, blotches
reseed(9010);TEX.sheet=canvasTex(256,256,(g,w,h)=>{g.fillStyle=gray(178);g.fillRect(0,0,w,h);
 for(let i=0;i<9;i++){const x=rng()*w,y=rng()*h,pw=rr(50,120),ph=rr(40,100);g.fillStyle=gray(rr(150,215));g.fillRect(x,y,pw,ph);g.strokeStyle='rgba(30,25,20,.55)';g.lineWidth=1.5;g.strokeRect(x,y,pw,ph);
  g.fillStyle='rgba(20,15,10,.6)';for(let r=x+5;r<x+pw;r+=14){g.fillRect(r,y+3,2.2,2.2);g.fillRect(r,y+ph-5,2.2,2.2);}}
 blotches(g,w,h,22,12,40,.42);rustStreaks(g,w,h,50,true);speckle(g,w,h,300,.05,.2,true);});TILE.sheet=2;
// planks, horizontal courses: 8 boards per 1.6 m
reseed(9011);TEX.plank=canvasTex(256,256,(g,w,h)=>{   // 4 boards of ~0.5 m per 2 m repeat, staggered joints, soft grain: reads as weathered planking, not bamboo
 const n=4,bh=h/n;for(let i=0;i<n;i++){const y0=i*bh;const t=rr(165,205);g.fillStyle=gray(t);g.fillRect(0,y0,w,bh);
  for(let k=0;k<26;k++){g.fillStyle=`rgba(40,28,18,${rr(.03,.10)})`;const yy=y0+rng()*bh;g.fillRect(rng()*w*.3,yy,rr(w*.3,w),rr(.5,1.1));}
  for(let k=0;k<3;k++){const gx=rng()*w,gy=y0+rr(bh*.2,bh*.8);g.fillStyle='rgba(30,20,12,.22)';g.beginPath();g.ellipse(gx,gy,rr(3,7),rr(1.5,3),0,0,TAU);g.fill();}
  const cut=(i*97+rng()*40)%w;g.fillStyle='rgba(20,12,6,.32)';g.fillRect(cut,y0,1.4,bh);g.fillStyle='rgba(20,12,6,.38)';g.fillRect(0,y0,w,1.6);
  g.fillStyle='rgba(15,10,6,.5)';for(const nx of [cut-7,cut+8])g.fillRect(nx,y0+bh*.5-1,2,2);}
 blotches(g,w,h,5,8,22,.16);speckle(g,w,h,260,.04,.12,true);});TILE.plank=2;
reseed(9012);TEX.earth=canvasTex(256,256,(g,w,h)=>{g.fillStyle=gray(196);g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=fbm(x/22,y/22,1.3,3)*70+fbm(x/4,y/4,5,1)*38;const i=(y*w+x)*4;const v=150+n;d[i]=d[i+1]=d[i+2]=v;}
 g.putImageData(id,0,0);for(let i=0;i<14;i++){g.strokeStyle='rgba(40,30,20,.3)';g.lineWidth=1;g.beginPath();let x=rng()*w,y=rng()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=rr(-14,14);y+=rr(2,16);g.lineTo(x,y);}g.stroke();}});TILE.earth=3;
reseed(9013);TEX.conc=canvasTex(256,256,(g,w,h)=>{g.fillStyle=gray(225);g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=218+fbm(x/16,y/16,2.2,3)*26-13+fbm(x/3,y/3,9,1)*10;const i=(y*w+x)*4;d[i]=d[i+1]=d[i+2]=v;}g.putImageData(id,0,0);
 g.strokeStyle='rgba(50,50,55,.65)';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.lineWidth=1;g.stroke();
 for(let i=0;i<10;i++){const x=rng()*w;const gr=g.createLinearGradient(x,0,x,h);gr.addColorStop(0,'rgba(60,50,40,0)');gr.addColorStop(rr(.3,.6),`rgba(60,50,40,${rr(.06,.16)})`);gr.addColorStop(1,'rgba(60,50,40,0)');g.fillStyle=gr;g.fillRect(x,0,rr(3,10),h);}
 g.fillStyle='rgba(40,40,45,.6)';for(const [x,y] of [[8,8],[w-8,8],[8,h-8],[w-8,h-8],[w/2-8,h/2-8],[w/2+8,h/2+8]]){g.beginPath();g.arc(x,y,2.4,0,TAU);g.fill();}});TILE.conc=2;
reseed(9014);TEX.iron=canvasTex(128,128,(g,w,h)=>{g.fillStyle=gray(150);g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=158+fbm(x/10,y/10,3.1,3)*44-22+fbm(x/2.5,y/2.5,7,1)*12;const i=(y*w+x)*4;d[i]=d[i+1]=d[i+2]=v;}g.putImageData(id,0,0);rustStreaks(g,w,h,26,true);blotches(g,w,h,12,6,20,.45);});TILE.iron=1;
// timber (posts, beams, logs): vertical grain
reseed(9018);TEX.wood=canvasTex(128,128,(g,w,h)=>{g.fillStyle=gray(190);g.fillRect(0,0,w,h);for(let x=0;x<w;x++){const v=190+Math.sin(x*.9+fbm(x/6,0,1,2)*9)*16+rr(-10,10);g.fillStyle=gray(v);g.fillRect(x,0,1,h);}
 for(let i=0;i<10;i++){g.fillStyle=`rgba(40,28,18,${rr(.08,.24)})`;g.fillRect(rng()*w,rng()*h,rr(1,2),rr(10,50));}for(let i=0;i<2;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(30,20,12,.45)';g.beginPath();g.ellipse(x,y,3,6,0,0,TAU);g.fill();}});TILE.wood=1;
// bottle-glass wall: round bottle bottoms in hex packing, in mortar. Carries its own colour (tinted white).
reseed(9015);TEX.bottle=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8e8674';g.fillRect(0,0,w,h);speckle(g,w,h,600,.05,.16,true);
 const cols=[['#3f9a52','#8fe0a0'],['#c98a2a','#f5cf82'],['#2f62b8','#86b0f0'],['#d5ecea','#ffffff'],['#3f9a52','#8fe0a0'],['#a04a2a','#e0946a']];const R=9.2,dx=R*2.15,dy=R*1.86;
 for(let r=0;r*dy<h+dy;r++)for(let c=0;c*dx<w+dx;c++){const x=c*dx+(r%2?dx/2:0),y=r*dy;const cl=pick(cols);const gr=g.createRadialGradient(x-2.5,y-2.5,1,x,y,R);gr.addColorStop(0,cl[1]);gr.addColorStop(.55,cl[0]);gr.addColorStop(1,'rgba(20,20,20,.9)');
  g.fillStyle=gr;for(const ox of [0,w])for(const oy of [0,h]){}g.beginPath();g.arc(x%w,y%h,R,0,TAU);g.fill();if(x+R>w){g.beginPath();g.arc(x-w,y%h,R,0,TAU);g.fill();}if(y+R>h){g.beginPath();g.arc(x%w,y-h,R,0,TAU);g.fill();}}});TILE.bottle=1.28;
reseed(9016);TEX.weave=canvasTex(64,64,(g,w,h)=>{g.fillStyle=gray(215);g.fillRect(0,0,w,h);for(let i=0;i<w;i+=2){g.fillStyle=gray(rr(180,235),.6);g.fillRect(i,0,1,h);}for(let i=0;i<h;i+=2){g.fillStyle=gray(rr(180,235),.5);g.fillRect(0,i,w,1);}
 blotches(g,w,h,3,6,14,.2);});TILE.cloth=1.2;
// chain-link: alpha diamonds
TEX.chain=canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(215,215,215,1)';g.lineWidth=2.2;for(let i=-h;i<w+h;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i+h,0);g.lineTo(i,h);g.stroke();}});TILE.chain=1;
reseed(9017);TEX.dirt=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const n=fbm(x/48,y/48,.7,4),n2=fbm(x/7,y/7,4,1),i=(y*w+x)*4;const v=.7+.24*n+.16*n2;d[i]=(158*v)|0;d[i+1]=(126*v)|0;d[i+2]=(92*v)|0;d[i+3]=255;}g.putImageData(id,0,0);
 for(let i=0;i<260;i++){g.fillStyle=`rgba(${rr(70,120)|0},${rr(60,100)|0},${rr(45,80)|0},${rr(.3,.7)})`;g.fillRect(rng()*w,rng()*h,rr(1,4),rr(1,3));}});TILE.dirt=8;
