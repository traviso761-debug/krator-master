// ---------- the surfaces, painted on canvases ----------
// Nothing here is a photograph. Every texture is drawn when the page opens, from a seeded stream so it is the
// same every time, and each one is one repeat of the thing it is - a metre and a bit of wallpaper, a square of
// carpet, one ceiling tile - because the rooms go on for ever and a texture that goes on for ever has to be
// one that nobody can see the seam of.
//
// What a texture does NOT carry is dirt that belongs to a place: the stains on the carpet, the damp creeping up
// the wall. Those repeat every metre if they are painted in here, and a stain that repeats is a pattern. They go
// in the vertex colours instead (level.js), from noise over the world, so no two are alike.
import {mkRng} from '../core/rng.js';

function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
// fine grain over the whole canvas: every pixel nudged lighter or darker, which is what stops a flat colour
// reading as plastic
function grain(g,w,h,amt,rnd){const im=g.getImageData(0,0,w,h),d=im.data;
  for(let i=0;i<d.length;i+=4){const n=(rnd()-0.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n*0.8;}g.putImageData(im,0,0);}
function tex(THREE,c,aniso){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.anisotropy=aniso||4;t.needsUpdate=true;return t;}

// ---- Level 0 ----
// The wallpaper is the whole of the place, so it gets the most care. Mono-yellow, a shade off mustard, with
// a pattern so faint you only find it when you stop: pairs of pinstripes, and between them a little chevron
// motif stacked up the wall. A skirting board along the bottom, and a band of grime above it where the carpet
// has been wet against it for a very long time. One repeat is 1.2 m wide and 3 m tall (WALL_H).
function wallpaper(rnd){
  const W=256,H=640,px=H/3;const [c,g]=canvas(W,H);
  g.fillStyle='#c8b25e';g.fillRect(0,0,W,H);
  // a slow unevenness in the colour, as if the rolls came from different batches
  for(let i=0;i<40;i++){g.fillStyle=`rgba(${rnd()<0.5?'120,100,30':'230,210,130'},0.035)`;
    g.fillRect(rnd()*W-40,0,30+rnd()*60,H);}
  // the pinstripes, in pairs every 30 cm
  for(let x=0;x<W;x+=W/4){g.fillStyle='rgba(120,98,30,0.16)';g.fillRect(x+2,0,2,H);g.fillRect(x+8,0,1,H);}
  // the motif between them: small chevrons stacked up the wall, barely there
  g.strokeStyle='rgba(110,90,25,0.12)';g.lineWidth=2;
  for(let x=W/8;x<W;x+=W/4)for(let y=0;y<H;y+=36){
    g.beginPath();g.moveTo(x-9,y+8);g.lineTo(x,y);g.lineTo(x+9,y+8);g.stroke();
    g.beginPath();g.moveTo(x-5,y+22);g.lineTo(x,y+18);g.lineTo(x+5,y+22);g.stroke();}
  grain(g,W,H,14,rnd);
  // grime above the skirting: a soft brown band, stronger at the bottom
  const base=H-0.1*px;
  const gr=g.createLinearGradient(0,base-0.45*px,0,base);gr.addColorStop(0,'rgba(90,70,20,0)');gr.addColorStop(1,'rgba(90,65,20,0.28)');
  g.fillStyle=gr;g.fillRect(0,base-0.45*px,W,0.45*px);
  // the skirting board: a painted board with a lip, a shadow line where it meets the wall, scuffed
  g.fillStyle='#b8a676';g.fillRect(0,base,W,H-base);
  g.fillStyle='rgba(60,45,10,0.45)';g.fillRect(0,base-2,W,2);
  g.fillStyle='rgba(255,245,210,0.35)';g.fillRect(0,base+1,W,2);
  for(let i=0;i<14;i++){g.fillStyle='rgba(70,55,20,0.25)';g.fillRect(rnd()*W,base+4+rnd()*(H-base-8),4+rnd()*18,1+rnd()*2);}
  return c;
}
// the carpet: damp, mustard-beige, with a fibre you can see from standing height. The damp is the vertex colours.
function carpet(rnd){
  const W=256;const [c,g]=canvas(W,W);
  g.fillStyle='#9c8a55';g.fillRect(0,0,W,W);
  for(let i=0;i<9000;i++){const v=rnd();g.fillStyle=v<0.5?'rgba(70,58,25,0.22)':'rgba(205,188,130,0.18)';
    g.fillRect(rnd()*W,rnd()*W,1+rnd()*2,1);}
  // the loop pile makes faint rows
  for(let y=0;y<W;y+=4){g.fillStyle='rgba(60,50,20,0.06)';g.fillRect(0,y,W,1);}
  grain(g,W,W,22,rnd);return c;
}
// one drop-ceiling tile, 1.2 by 0.6 m: speckled acoustic board inside a painted T-bar grid
function ceilingTile(rnd,col,bar){
  const W=256,H=128;const [c,g]=canvas(W,H);
  g.fillStyle=col||'#d9d2b4';g.fillRect(0,0,W,H);
  for(let i=0;i<1400;i++){g.fillStyle=`rgba(90,80,50,${0.12+rnd()*0.25})`;g.fillRect(rnd()*W,rnd()*H,1+rnd()*1.5,1+rnd()*1.5);}
  grain(g,W,H,10,rnd);
  // water marks on a few, rings of brown
  if(rnd()<0.9){const x=rnd()*W,y=rnd()*H,r=10+rnd()*24;
    const gr=g.createRadialGradient(x,y,r*0.6,x,y,r);gr.addColorStop(0,'rgba(150,120,50,0.05)');gr.addColorStop(0.85,'rgba(130,100,40,0.18)');gr.addColorStop(1,'rgba(130,100,40,0)');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  g.fillStyle=bar||'#aaa38a';g.fillRect(0,0,W,4);g.fillRect(0,0,4,H);
  g.fillStyle='rgba(255,255,255,0.25)';g.fillRect(0,4,W,1);g.fillRect(4,0,1,H);
  return c;
}
// the lamp: a prismatic diffuser in a white steel frame. Drawn at full brightness; the shader dims it.
function panel(rnd,tint){
  const W=128,H=64;const [c,g]=canvas(W,H);
  g.fillStyle=tint||'#fffbea';g.fillRect(0,0,W,H);
  g.fillStyle='rgba(200,195,170,0.18)';for(let x=0;x<W;x+=3)g.fillRect(x,0,1,H);for(let y=0;y<H;y+=3)g.fillRect(0,y,W,1);
  // the two tubes behind the diffuser show as brighter bars
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.3,'rgba(255,255,255,0.35)');
  gr.addColorStop(0.5,'rgba(255,255,255,0)');gr.addColorStop(0.7,'rgba(255,255,255,0.35)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='#bdb8a8';g.lineWidth=5;g.strokeRect(2,2,W-4,H-4);
  return c;
}

// ---- Level 1: concrete ----
// Poured walls with the formwork showing, a painted band at hand height the way car parks have one, and the
// floor sealed concrete gone dark in patches where water stands. The ceiling is the slab itself.
function concreteWall(rnd){
  const W=256,H=854,px=H/4;const [c,g]=canvas(W,H);   // 1.2 m by 4 m
  g.fillStyle='#8e8b84';g.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){g.fillStyle=`rgba(${rnd()<0.5?'60,60,58':'170,168,160'},0.05)`;
    const r=10+rnd()*50;g.beginPath();g.arc(rnd()*W,rnd()*H,r,0,7);g.fill();}
  // form-tie holes and the joints between the shutters
  g.fillStyle='rgba(40,40,38,0.35)';for(let y=0.6*px;y<H;y+=1.2*px){g.fillRect(0,H-y,W,2);
    for(let x=W/4;x<W;x+=W/2){g.beginPath();g.arc(x,H-y-0.3*px,3,0,7);g.fill();}}
  g.fillRect(0,0,2,H);
  grain(g,W,H,26,rnd);
  // the painted band, 0.9 to 1.2 m, and the black-and-yellow kerb along the foot
  g.fillStyle='rgba(200,168,40,0.85)';g.fillRect(0,H-1.2*px,W,0.3*px);
  const kb=0.18*px;for(let x=-kb;x<W+kb;x+=kb*2){g.fillStyle='#d8b020';g.beginPath();g.moveTo(x,H);g.lineTo(x+kb,H);g.lineTo(x+kb*2,H-kb);g.lineTo(x+kb,H-kb);g.fill();}
  g.fillStyle='rgba(20,20,20,0.9)';for(let x=0;x<W;x+=kb*2){g.beginPath();g.moveTo(x,H);g.lineTo(x+kb,H-kb);g.lineTo(x,H-kb);g.lineTo(x-kb,H);g.fill();}
  return c;
}
function concreteFloor(rnd){
  const W=256;const [c,g]=canvas(W,W);
  g.fillStyle='#77746d';g.fillRect(0,0,W,W);
  for(let i=0;i<50;i++){g.fillStyle=`rgba(${rnd()<0.5?'50,50,48':'150,148,140'},0.06)`;g.beginPath();g.arc(rnd()*W,rnd()*W,6+rnd()*40,0,7);g.fill();}
  grain(g,W,W,30,rnd);
  g.strokeStyle='rgba(30,30,28,0.4)';g.lineWidth=1;g.beginPath();let x=rnd()*W,y=0;g.moveTo(x,y);
  while(y<W){x+=(rnd()-0.5)*18;y+=6+rnd()*10;g.lineTo(x,y);}g.stroke();
  g.fillStyle='rgba(30,30,28,0.5)';g.fillRect(0,0,W,2);   // the saw-cut joint
  return c;
}
function concreteCeiling(rnd){
  const W=256,H=128;const [c,g]=canvas(W,H);
  g.fillStyle='#8a8781';g.fillRect(0,0,W,H);grain(g,W,H,24,rnd);
  g.fillStyle='rgba(40,40,38,0.3)';g.fillRect(0,0,W,3);
  return c;
}

// ---- the Poolrooms ----
// Small square white tiles on every surface - floor, walls, ceiling - with pale grout, and each tile a hair
// different from the next, because that is the only thing that tells you how far away a wall is.
function tiles(rnd,base){
  const W=256,n=4,s=W/n;const [c,g]=canvas(W,W);   // 0.6 m, four tiles of 15 cm
  g.fillStyle='#b9c2c4';g.fillRect(0,0,W,W);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=Math.round((rnd()-0.5)*10);
    const [r,gg,b]=base||[232,238,238];g.fillStyle=`rgb(${r+v},${gg+v},${b+v})`;g.fillRect(i*s+2,j*s+2,s-4,s-4);
    const hl=g.createLinearGradient(i*s,j*s,i*s+s,j*s+s);hl.addColorStop(0,'rgba(255,255,255,0.25)');hl.addColorStop(1,'rgba(0,0,0,0.04)');
    g.fillStyle=hl;g.fillRect(i*s+2,j*s+2,s-4,s-4);}
  grain(g,W,W,6,rnd);return c;
}

export function makeTextures(THREE,seed,aniso){
  const rnd=mkRng(seed||9);
  return {
    0:{wall:tex(THREE,wallpaper(rnd),aniso),floor:tex(THREE,carpet(rnd),aniso),ceil:tex(THREE,ceilingTile(rnd),aniso),
       panel:tex(THREE,panel(rnd),aniso)},
    1:{wall:tex(THREE,concreteWall(rnd),aniso),floor:tex(THREE,concreteFloor(rnd),aniso),ceil:tex(THREE,concreteCeiling(rnd),aniso),
       panel:tex(THREE,panel(rnd,'#f4fbff'),aniso)},
    37:(()=>{const t=tex(THREE,tiles(rnd),aniso);return {wall:t,floor:tex(THREE,tiles(rnd,[226,234,236]),aniso),ceil:t,
       panel:tex(THREE,panel(rnd,'#f8feff'),aniso)};})(),
  };
}
