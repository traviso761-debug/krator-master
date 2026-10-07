// ---------------------------------------------------------------- CULTURE SYMBOLS (shared: core/sockets/38-symbols.js)
// The emblem of every culture as a 2D canvas drawing: (g, cx, cy, R, ink, ink2) draws inside a box of half-size R. Pure canvas, no engine:
// core/sockets/80-cultures.js draws them on banners, flags and plates; kits/catalog's furniture kit draws the same ones on tapestries,
// banners, friezes and scrolls (vendored there as kits/catalog/krator-symbols.js, build.py --vendor-check), so a dressed building and the
// furniture in it carry one emblem. A new culture adds one function here. SYMBOL_OF names each pack's symbol for anyone without a pack.
const SYM_TAU = Math.PI * 2, SYM_PI = Math.PI;
function drawTriskele(g,cx,cy,R,cols,lw){g.lineCap='round';g.lineWidth=lw;for(let k=0;k<3;k++){g.strokeStyle=cols[k%cols.length];g.beginPath();const a0=k*SYM_TAU/3-SYM_PI/2;
 for(let i=0;i<=24;i++){const t=i/24;const a=a0+t*2.5;const r=R*(.12+.86*t);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  const ae=a0+2.5;g.fillStyle=cols[k%cols.length];g.beginPath();g.arc(cx+Math.cos(ae)*R*.98,cy+Math.sin(ae)*R*.98,lw*.75,0,SYM_TAU);g.fill();}}
// ------------------------------------------------------------------ symbols: each draws in the box (cx,cy,R) with two ink colours
const SYMBOLS={
 sun:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.92,0,SYM_TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.54,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.24,0,SYM_TAU);g.fill();
  for(let k=0;k<12;k++){const a=k*SYM_TAU/12;g.fillStyle=c1;g.beginPath();g.moveTo(cx+Math.cos(a-.11)*R*.98,cy+Math.sin(a-.11)*R*.98);g.lineTo(cx+Math.cos(a)*R*1.18,cy+Math.sin(a)*R*1.18);g.lineTo(cx+Math.cos(a+.11)*R*.98,cy+Math.sin(a+.11)*R*.98);g.fill();}},
 triskele:(g,cx,cy,R,c1,c2)=>{drawTriskele(g,cx,cy,R*.82,[c1,c2,'#c9963a'],Math.max(3,R*.27));},
 diamond:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.11);g.lineJoin='round';g.beginPath();g.moveTo(cx,cy-R);g.lineTo(cx+R*.75,cy);g.lineTo(cx,cy+R);g.lineTo(cx-R*.75,cy);g.closePath();g.stroke();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.16,0,SYM_TAU);g.fill();},
 // hyperboloid of one sheet: the cooling-tower profile with its ruling lines (Yuni)
 hyperboloid:(g,cx,cy,R,c1,c2)=>{const a=R*.4,hh=R*.92,b=hh*.55;const xw=t=>a*Math.sqrt(1+(t*hh/b)*(t*hh/b));const rx=xw(1),ry=R*.13;
  g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.05);
  for(let k=0;k<7;k++){const th=k*SYM_TAU/7;g.beginPath();g.moveTo(cx+Math.cos(th)*rx,cy-hh+Math.sin(th)*ry);g.lineTo(cx+Math.cos(th+1.05)*rx,cy+hh+Math.sin(th+1.05)*ry);g.stroke();}
  g.lineWidth=Math.max(2.5,R*.1);for(const sx of [-1,1]){g.beginPath();for(let i=0;i<=28;i++){const t=-1+2*i/28;const x=cx+sx*xw(t),y=cy+t*hh;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}
  for(const [yy,r_x] of [[cy-hh,rx],[cy,a],[cy+hh,rx]]){g.beginPath();g.ellipse(cx,yy,r_x,ry*(r_x===a?.8:1),0,0,SYM_TAU);g.stroke();}},
 // three parallel talon slashes (Beast Riders)
 claw:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(let k=-1;k<=1;k++){const x0=cx+k*R*.5;g.beginPath();g.moveTo(x0-R*.2,cy-R*.95);g.quadraticCurveTo(x0+R*.62,cy-R*.15,x0+R*.08,cy+R*1.0);g.quadraticCurveTo(x0+R*.2,cy-R*.05,x0-R*.2,cy-R*.95);g.closePath();g.fill();}},
 // a half sun rising over three waves (Hykkousoi; the hexareme's sail in kits/ringsea): c1 the sun, c2 the waves
 wavesun:(g,cx,cy,R,c1,c2)=>{const y0=cy-R*.1;g.fillStyle=c1;g.beginPath();g.arc(cx,y0,R*.5,Math.PI,0);g.fill();g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.07);
  for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.62,y0+Math.sin(a)*R*.62);g.lineTo(cx+Math.cos(a)*R*.9,y0+Math.sin(a)*R*.9);g.stroke();}
  g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.1);for(let k=0;k<3;k++){g.beginPath();for(let i=0;i<=24;i++){const x=-R+2*R*i/24,y=y0+R*.12+k*R*.24+Math.sin(x/R*SYM_TAU)*R*.07;if(i)g.lineTo(cx+x,y);else g.moveTo(cx+x,y);}g.stroke();}},
 // the eight-spoked wheel (Xanadu; the carrack's sails): c1 rim and spokes, c2 the hub
 wheel:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.12);g.beginPath();g.arc(cx,cy,R*.78,0,SYM_TAU);g.stroke();g.lineWidth=Math.max(2,R*.07);
  for(let i=0;i<8;i++){const a=i/8*SYM_TAU;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.18,cy+Math.sin(a)*R*.18);g.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);g.stroke();}
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.2,0,SYM_TAU);g.fill();},
 // the white moon of the islands (the oruwa's sail): a full disc, a thin ring round it
 moon:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.62,0,SYM_TAU);g.fill();g.strokeStyle=c1;g.lineWidth=Math.max(1.5,R*.04);g.beginPath();g.arc(cx,cy,R*.86,0,SYM_TAU);g.stroke();},
};
// ---- symbols added for the furniture sets (cultures without a socket pack yet; a pack that arrives later picks its symbol from here)
Object.assign(SYMBOLS, {
 // a coiled serpent, head out (Lizardmen)
 serpent:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.16);g.beginPath();for(let i=0;i<=60;i++){const t=i/60,a=t*SYM_TAU*1.75,r=R*(.15+.72*t);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  const ae=SYM_TAU*1.75,hx=cx+Math.cos(ae)*R*.87,hy=cy+Math.sin(ae)*R*.87;g.fillStyle=c1;g.beginPath();g.ellipse(hx,hy,R*.2,R*.13,ae,0,SYM_TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(hx+Math.cos(ae+1.3)*R*.07,hy+Math.sin(ae+1.3)*R*.07,R*.035,0,SYM_TAU);g.fill();},
 // an eight-pointed star of two squares, a disc at the heart (East Abyss)
 star:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(const rot of [0,SYM_PI/4]){g.beginPath();for(let k=0;k<4;k++){const a=rot+k*SYM_PI/2;g.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);}g.closePath();g.fill();}
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.3,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.12,0,SYM_TAU);g.fill();},
 // a pair of curling ram's horns over a disc (Eastern Nomads)
 horns:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.17);for(const s of [-1,1]){g.beginPath();for(let i=0;i<=30;i++){const t=i/30,a=-SYM_PI/2+s*t*SYM_PI*1.15,r=R*(.9-.55*t);const x=cx+s*R*.1+Math.cos(a)*r,y=cy+R*.1+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}
  g.fillStyle=c2;g.beginPath();g.arc(cx,cy+R*.15,R*.24,0,SYM_TAU);g.fill();},
 // a fir tree on a mountain line (Rustic Highlanders)
 fir:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(let k=0;k<3;k++){const y=cy-R*.9+k*R*.42,w=R*(.35+k*.25);g.beginPath();g.moveTo(cx,y);g.lineTo(cx+w,y+R*.55);g.lineTo(cx-w,y+R*.55);g.closePath();g.fill();}
  g.fillRect(cx-R*.08,cy+R*.4,R*.16,R*.35);g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.08);g.beginPath();g.moveTo(cx-R,cy+R*.95);g.lineTo(cx-R*.5,cy+R*.6);g.lineTo(cx-R*.25,cy+R*.85);g.moveTo(cx+R*.25,cy+R*.85);g.lineTo(cx+R*.5,cy+R*.6);g.lineTo(cx+R,cy+R*.95);g.stroke();},
 // a formline raven's head: the ovoid eye in a beaked outline (Painted Men)
 raven:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.moveTo(cx-R*.9,cy);g.quadraticCurveTo(cx-R*.9,cy-R*.85,cx,cy-R*.8);g.quadraticCurveTo(cx+R*.7,cy-R*.75,cx+R*.98,cy-R*.1);g.lineTo(cx+R*.3,cy+R*.2);g.quadraticCurveTo(cx+R*.5,cy+R*.75,cx-R*.1,cy+R*.8);g.quadraticCurveTo(cx-R*.9,cy+R*.8,cx-R*.9,cy);g.closePath();g.fill();
  g.fillStyle=c2;g.beginPath();g.ellipse(cx-R*.25,cy-R*.1,R*.36,R*.26,0,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.ellipse(cx-R*.25,cy-R*.1,R*.14,R*.12,0,0,SYM_TAU);g.fill();g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.06);g.beginPath();g.moveTo(cx+R*.2,cy-R*.05);g.lineTo(cx+R*.85,cy-R*.1);g.stroke();},
 // a fish in a ring of reeds (Reed Lake)
 fish:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c2;g.lineWidth=Math.max(2,R*.06);for(let k=0;k<12;k++){const a=k*SYM_TAU/12;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.78,cy+Math.sin(a)*R*.78);g.lineTo(cx+Math.cos(a)*R*.98,cy+Math.sin(a)*R*.98);g.stroke();}
  g.fillStyle=c1;g.beginPath();g.ellipse(cx-R*.08,cy,R*.5,R*.24,0,0,SYM_TAU);g.fill();g.beginPath();g.moveTo(cx+R*.35,cy);g.lineTo(cx+R*.68,cy-R*.3);g.lineTo(cx+R*.68,cy+R*.3);g.closePath();g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx-R*.38,cy-R*.05,R*.06,0,SYM_TAU);g.fill();},
 // a skull, teeth and all (Screamers)
 skull:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy-R*.15,R*.62,0,SYM_TAU);g.fill();g.fillRect(cx-R*.4,cy+R*.2,R*.8,R*.5);g.fillStyle=c2;for(const s of [-1,1]){g.beginPath();g.ellipse(cx+s*R*.26,cy-R*.15,R*.17,R*.2,0,0,SYM_TAU);g.fill();}
  g.beginPath();g.moveTo(cx,cy+R*.05);g.lineTo(cx-R*.1,cy+R*.28);g.lineTo(cx+R*.1,cy+R*.28);g.closePath();g.fill();for(let k=0;k<5;k++)g.fillRect(cx-R*.36+k*R*.16,cy+R*.42,R*.06,R*.26);},
 // a spiral sinking into a stepped arch: the way in (Zeijani): c1 the stepped stone and the spiral, c2 the dark of the opening
 spiralarch:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.moveTo(cx-R*.95,cy+R*.95);
  for(const [x,y] of [[-.95,-.35],[-.72,-.35],[-.72,-.6],[-.48,-.6],[-.48,-.85],[.48,-.85],[.48,-.6],[.72,-.6],[.72,-.35],[.95,-.35],[.95,.95]])g.lineTo(cx+x*R,cy+y*R);g.closePath();g.fill();
  const ow=R*.42,oy=cy-R*.12;g.fillStyle=c2;g.beginPath();g.moveTo(cx-ow,cy+R*.95);g.lineTo(cx-ow,oy);g.arc(cx,oy,ow,SYM_PI,0);g.lineTo(cx+ow,cy+R*.95);g.closePath();g.fill();
  g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.08);g.beginPath();const sx=cx,sy=cy+R*.3;for(let i=0;i<=60;i++){const t=i/60,a=-SYM_PI/2+t*SYM_TAU*2.1,r=R*.34*(1-t*.92);const x=sx+Math.cos(a)*r,y=sy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  g.fillStyle=c1;g.beginPath();g.arc(sx,sy,R*.05,0,SYM_TAU);g.fill();},
 // a toothed gear (post-apoc salvage and scrap)
 gear:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();for(let k=0;k<32;k++){const a=k*SYM_TAU/32,r=(k%4<2)?R*.95:R*.75;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.45,0,SYM_TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.2,0,SYM_TAU);g.fill();},
});
// the symbol each culture pack draws (mkCulture's `sym`), for code that has a culture key and no pack
const SYMBOL_OF = { iziz:'sun', republic:'triskele', voth:'diamond', yuni:'hyperboloid', 'beast-rider':'claw', hykkousoi:'wavesun', xanadu:'wheel',
 'ringsea-islander':'moon', lizardmen:'serpent', eastabyss:'star', nomad:'horns', rustic:'fir', painted:'raven', reedlake:'fish', screamer:'skull', 'post-apoc':'gear', scrap:'gear',
 zeijani:'spiralarch' };
