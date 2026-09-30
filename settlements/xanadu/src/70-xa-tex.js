// ================================================================= XANADU — textures
// The Xanadu kit sits on the Iziz Vernacular helpers (69b/69c, vendored) and adds the surfaces of a rich, high,
// dry valley: rammed earth and whitewashed rubble in battered masses (the Tibetan body of the style), small glazed
// tiles and bulbous domes (the Persian note), carved timber corbels and jali screens (the Indian note), and — the
// thing that says "Xanadu" from across the valley — GOLD and COLOUR: gilded roofs, mosaic panels, painted frames,
// maroon bands, pennant lines.
//
// Two kinds of map, as in the vernacular set:
//  * near-grey + warm maps (earth, whitewash, tiles, twig band, rubble, rock, jali, valance) that the per-instance
//    colour tints — one tile map serves turquoise, lapis and white domes alike;
//  * COLOUR-CARRYING maps (the two mosaics, the frieze band) painted in their final palette and never tinted.
// Canvas sizes are 64 px per metre for the world-UV maps (vWorldUV K = tiles per metre).

// ---------------------------------------------------------------- the painted palette used inside colour maps
const XMOS={lapis:'#1e3f8a',turq:'#39b0b8',turqD:'#1f8a90',cream:'#f4efe4',gold:'#e0b040',maroon:'#6e2a2a',black:'#1a1614',red:'#a8382a'};

// ---------------------------------------------------------------- rammed earth: 2 m tile, lift lines every ~0.37 m
TEX.xEarth=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const LH=24;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/LH),fy=(y%LH)/LH;
  let v=182+(h3(row*1.3,0,4.4)-.5)*22+(fbm(x/14,y/14,2.2,3)-.5)*30+(fbm(x/3,y/3,5.5,1)-.5)*14;
  if(fy<.06)v-=34;else if(fy<.12)v-=10;                                        // the shadow line of each lift
  const pit=fbm(x/5,y/5,9.1,2);if(pit>.74)v-=(pit-.74)*140;                   // pitting where the rain got in
  d[i]=v;d[i+1]=v*.93;d[i+2]=v*.82;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- whitewash over rubble: 2 m tile
TEX.xWash=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=214+(fbm(x/26,y/26,3.1,3)-.5)*22+(fbm(x/6,y/6,7.3,2)-.5)*16+(fbm(x/12,y/12,1.7,2)-.5)*18;   // the stones show through the lime
  const drip=clamp((fbm(x/4,y/60,5.5,2)-.56)*4,0,1)*clamp(y/h*1.5,0,1);v-=drip*22;                   // rain streaks
  d[i]=v;d[i+1]=v*.97;d[i+2]=v*.92;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- small glazed tiles: 2 m tile, 0.25 m tiles with grout
TEX.xTiles=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const fx=x%S,fy=y%S,tx=Math.floor(x/S),ty=Math.floor(y/S);
  let v=196+(h3(tx*2.1,ty*1.3,3.3)-.5)*40+(fbm(x/3,y/3,4.4,1)-.5)*10;
  if(fx<2||fy<2)v=118;else if(fx<3||fy<3)v+=16;                                // grout, and the lit arris of each tile
  d[i]=v;d[i+1]=v;d[i+2]=v*1.03;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- the twig band (penbey): 1 m tile, bundled tamarisk twigs on end
TEX.xPenbey=canvasTex(64,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=150+(h3(Math.floor(x/2)*1.7,0,2.2)-.5)*70+(fbm(x/1.5,y/16,3.3,2)-.5)*30;
  if(y%32<2)v-=40;                                                              // the stitched joints between bundles
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fieldstone (rubble): 4 m tile
TEX.xRubble=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const pts=[];for(let k=0;k<70;k++){const px=h3(k,1.3,2.7)*w,py=h3(k,4.1,.7)*h;for(const ox of[-w,0,w])for(const oy of[-h,0,h])pts.push([px+ox,py+oy,k]);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let d1=1e9,d2=1e9,id1=0;
  for(const p of pts){const dx=(x-p[0])*.8,dy=y-p[1];const dd=dx*dx+dy*dy;if(dd<d1){d2=d1;d1=dd;id1=p[2];}else if(dd<d2)d2=dd;}
  const edge=Math.sqrt(d2)-Math.sqrt(d1);let v;
  if(edge<3.2)v=92+(fbm(x/3,y/3,2,1)-.5)*20;
  else{v=150+(h3(id1,7.7,1.1)-.5)*70+Math.min(20,edge*2)+(fbm(x/9,y/9,id1,2)-.5)*26;}
  const tint=h3(id1,2.2,9.9);d[i]=v*(1+(tint-.5)*.12);d[i+1]=v*.97;d[i+2]=v*(.92-(tint-.5)*.08);d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- valley rock (the hillsides): 8 m tile
TEX.xRock=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/40,y/22,1.7,4),n2=fbm(x/6,y/6,4.4,2);
  let v=136+(n-.5)*90+(n2-.5)*30;
  const crack=Math.abs(fbm(x/30,y/90,8.1,3)-.5);if(crack<.02)v-=60*(1-crack/.02);
  const strat=Math.abs(Math.sin((y/h*5+fbm(x/50,y/50,2,2)*1.4)*Math.PI));if(strat<.06)v-=40;
  d[i]=v*1.04;d[i+1]=v*.96;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- the valley floor: dry grass over pale earth
TEX.xMeadow=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/50,y/50,.7,3),n2=fbm(x/5,y/5,3.2,2),bare=clamp((fbm(x/36,y/36,5.5,2)-.6)*4,0,1);
  let r=118+(n-.5)*44+(n2-.5)*26,gg=124+(n-.5)*40+(n2-.5)*28,b=66+(n-.5)*20;
  r=lerp(r,156+n2*30,bare);gg=lerp(gg,138+n2*24,bare);b=lerp(b,104,bare);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- jali (pierced stone screen): 1 m tile, alpha-cut; tintable
TEX.xJali=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#e8e2d4';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-out';const n=4,c=w/n;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cx=(i+.5)*c,cy=(j+.5)*c;
  g.beginPath();g.moveTo(cx,cy-c*.34);g.lineTo(cx+c*.34,cy);g.lineTo(cx,cy+c*.34);g.lineTo(cx-c*.34,cy);g.closePath();g.fill();   // diamond
  g.beginPath();g.arc(i*c,j*c,c*.13,0,TAU);g.fill();}                                                                              // the circles at the joints
 g.beginPath();g.arc(w,0,c*.13,0,TAU);g.fill();g.beginPath();g.arc(0,h,c*.13,0,TAU);g.fill();g.beginPath();g.arc(w,h,c*.13,0,TAU);g.fill();
 g.globalCompositeOperation='source-over';});
// ---------------------------------------------------------------- window valance: pleated cloth, scalloped hem (alpha); 1 m x 0.5 m; tintable
TEX.xValance=canvasTex(128,64,(g,w,h)=>{g.clearRect(0,0,w,h);const P=8;
 for(let k=0;k<w/P;k++){g.fillStyle=k%2?'#e6e6e6':'#b4b4b4';g.fillRect(k*P,0,P,h*.68);}
 for(let k=0;k<w/(2*P);k++){const cx=(k+.5)*2*P;g.fillStyle=k%2?'#c8c8c8':'#d8d8d8';g.beginPath();g.arc(cx,h*.68,P,0,Math.PI);g.fill();}
 g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,0,w,3);});

// ---------------------------------------------------------------- colour-carrying: the Persian mosaics and the frieze band
function xmStar(g,cx,cy,R,r,n,col){g.beginPath();for(let k=0;k<2*n;k++){const a=k/(2*n)*TAU-Math.PI/2,rad=k%2?r:R;const px=cx+Math.cos(a)*rad,py=cy+Math.sin(a)*rad;if(k)g.lineTo(px,py);else g.moveTo(px,py);}g.closePath();g.fillStyle=col;g.fill();}
// A — star-and-cross: eight-pointed stars in turquoise and cream on lapis, gold bosses (the dome drums, the iwans)
TEX.xMosA=canvasTex(256,256,(g,w,h)=>{g.fillStyle=XMOS.lapis;g.fillRect(0,0,w,h);const n=4,c=w/n;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cx=(i+.5)*c,cy=(j+.5)*c;xmStar(g,cx,cy,c*.46,c*.3,8,XMOS.turq);xmStar(g,cx,cy,c*.26,c*.16,8,XMOS.cream);
  g.beginPath();g.arc(cx,cy,c*.07,0,TAU);g.fillStyle=XMOS.gold;g.fill();}
 for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const cx=i*c,cy=j*c;g.fillStyle=XMOS.cream;g.fillRect(cx-c*.05,cy-c*.16,c*.1,c*.32);g.fillRect(cx-c*.16,cy-c*.05,c*.32,c*.1);}   // the crosses between the stars
 g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;for(let k=0;k<=w;k+=16){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}});   // the tile grid
// B — arabesque: interlacing cream circles on turquoise, lapis lobes, gold dots (the panels over doors, the bath domes)
TEX.xMosB=canvasTex(256,256,(g,w,h)=>{g.fillStyle=XMOS.turq;g.fillRect(0,0,w,h);const n=4,c=w/n;
 for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const cx=i*c,cy=j*c;g.beginPath();g.arc(cx,cy,c*.5,0,TAU);g.fillStyle=XMOS.lapis;g.fill();}
 for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const cx=i*c,cy=j*c;g.beginPath();g.arc(cx,cy,c*.5,0,TAU);g.lineWidth=5;g.strokeStyle=XMOS.cream;g.stroke();
  g.beginPath();g.arc(cx,cy,c*.3,0,TAU);g.strokeStyle=XMOS.gold;g.lineWidth=3;g.stroke();}
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cx=(i+.5)*c,cy=(j+.5)*c;xmStar(g,cx,cy,c*.2,c*.09,4,XMOS.cream);g.beginPath();g.arc(cx,cy,c*.05,0,TAU);g.fillStyle=XMOS.gold;g.fill();}
 g.strokeStyle='rgba(0,0,0,.14)';g.lineWidth=1;for(let k=0;k<=w;k+=16){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}});
// the frieze band: gold lozenge chain with cream borders on maroon; 2 m x 0.6 m tile (xWorldUV .5 x 1.667)
TEX.xBand=canvasTex(256,80,(g,w,h)=>{g.fillStyle=XMOS.maroon;g.fillRect(0,0,w,h);g.fillStyle=XMOS.cream;g.fillRect(0,0,w,4);g.fillRect(0,h-4,w,4);
 g.fillStyle=XMOS.gold;g.fillRect(0,7,w,2);g.fillRect(0,h-9,w,2);const n=8,c=w/n;
 for(let k=0;k<n;k++){const cx=(k+.5)*c,cy=h/2;xmStar(g,cx,cy,h*.34,h*.14,4,XMOS.gold);g.beginPath();g.arc(cx,cy,h*.07,0,TAU);g.fillStyle=XMOS.turq;g.fill();
  g.beginPath();g.arc(k*c,cy,h*.08,0,TAU);g.fillStyle=XMOS.cream;g.fill();}});
// the sun-and-moon roundel (finials, the Sultan's emblem): a gold disc with a crescent and a rayed sun; 1:1
TEX.xSun=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);const c=w/2;g.beginPath();g.arc(c,c,c*.96,0,TAU);g.fillStyle=XMOS.gold;g.fill();
 g.beginPath();g.arc(c,c,c*.82,0,TAU);g.fillStyle=XMOS.maroon;g.fill();xmStar(g,c,c,c*.62,c*.34,12,XMOS.gold);
 g.beginPath();g.arc(c,c,c*.26,0,TAU);g.fillStyle=XMOS.cream;g.fill();g.beginPath();g.arc(c+c*.1,c-c*.06,c*.22,0,TAU);g.fillStyle=XMOS.maroon;g.fill();});
