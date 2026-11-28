// ================================================================= HIGHLANDS — textures
// The Highlands kit sits on top of the Iziz Vernacular helpers (69b/69c, vendored) and adds the materials of a
// temperate, wooden, mountain culture: round logs, split shingle and fish-scale slate, fieldstone socles, turf,
// bamboo, and — the signature of the style — PAINTED CARVING: formline crests, totem columns and fretwork lace.
//
// Two kinds of map, as in the vernacular set:
//  * near-grey + warm maps (logs, scale, rubble, turf, bamboo, lace) that the per-instance colour tints — one
//    log map serves raw pine, tarred spruce and red-painted boards;
//  * COLOUR-CARRYING maps (formline, totem, clock, wing) painted in their final palette and never tinted: the
//    black / red / teal of the carving is what it is, like salvage in the vernacular set.
// Canvas sizes are chosen at 64 px per metre for the world-UV maps (vWorldUV K = tiles per metre).

// ---------------------------------------------------------------- Slavic rospis' & Carpathian woodcarving palette
const HFORM={black:'#221814',red:'#b83224',teal:'#2f6d4c',tealD:'#1f4e36',blue:'#2d5894',white:'#f3ead8',cedar:'#b8824c',cedarD:'#7e4e2c',ochre:'#d89e32'};

// ---------------------------------------------------------------- wood: round logs (horizontal), 2 m tile, 6 courses
TEX.logs=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const LH=w/6;   /* ~0.33 m logs */
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/LH),fy=(y%LH)/LH;
  const round=Math.sin(Math.PI*fy);                                        /* rounded log: lit crown, dark top/bottom */
  let v=112+round*92+(h3(row*3.1,0,2.2)-.5)*30;
  v+=(fbm(x/26,y/2.2,row*1.7,2)-.5)*30;                                    /* grain along the log */
  if(fy<.08||fy>.94)v=58+(fbm(x/4,y/4,1,1)-.5)*16;                          /* chinking (moss/clay) between courses */
  const check=fbm(x/40,y/1.2,row*3.3,2);if(check>.7&&fy>.3&&fy<.6)v-=(check-.7)*140;   /* drying checks */
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.78;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fish-scale shingle / slate: 2 m tile, 0.25 m scales
TEX.scale=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/S),off=(row%2)*S/2;const sx=Math.floor((x+off)/S);
  const fx=((x+off)%S)/S-.5,fy=(y%S)/S;const r=Math.hypot(fx,(fy-.35)*1.1);   /* round bottom of each scale */
  let v=176+(h3(sx*2.3,row*1.9,4.1)-.5)*48+(fbm(x/4,y/4,2.2,1)-.5)*14;
  if(r>.46&&fy>.45)v-=70;else if(r>.4&&fy>.4)v-=26;                          /* the shadowed rim of the scale above */
  if(fy<.08)v-=30;
  d[i]=v;d[i+1]=v;d[i+2]=v*1.02;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fieldstone (rubble) socle: 4 m tile
TEX.rubble=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const pts=[];for(let k=0;k<70;k++){const px=h3(k,1.3,2.7)*w,py=h3(k,4.1,.7)*h;for(const ox of[-w,0,w])for(const oy of[-h,0,h])pts.push([px+ox,py+oy,k]);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let d1=1e9,d2=1e9,id1=0;
  for(const p of pts){const dx=(x-p[0])*.8,dy=y-p[1];const dd=dx*dx+dy*dy;if(dd<d1){d2=d1;d1=dd;id1=p[2];}else if(dd<d2)d2=dd;}
  const edge=Math.sqrt(d2)-Math.sqrt(d1);let v;
  if(edge<3.2)v=92+(fbm(x/3,y/3,2,1)-.5)*20;                                 /* deep mortar */
  else{v=150+(h3(id1,7.7,1.1)-.5)*70+Math.min(20,edge*2)+(fbm(x/9,y/9,id1,2)-.5)*26;}
  const tint=h3(id1,2.2,9.9);d[i]=v*(1+(tint-.5)*.12);d[i+1]=v*.97;d[i+2]=v*(.92-(tint-.5)*.08);d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- turf (sod roofs): 2 m tile
TEX.turf=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/14,y/14,3.3,3),n2=fbm(x/2,y/5,7.1,2);
  const bare=clamp((fbm(x/30,y/30,9.1,2)-.58)*5,0,1);
  let r=90+n*50+n2*30,gg=120+n*60+n2*40,b=60+n*20;
  r=lerp(r,120+n2*30,bare);gg=lerp(gg,100+n2*20,bare);b=lerp(b,70,bare);
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- bamboo: culm (vertical, nodes every ~0.45 m) and woven mat
TEX.bambooV=canvasTex(64,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const fy=(y%29)/29;
  let v=196+(fbm(x/2,y/30,1.3,2)-.5)*30+Math.sin(x/w*TAU*4)*6;
  if(fy<.07)v=120;else if(fy<.14)v=222;                                      /* node ring + its lit swelling */
  d[i]=v*.96;d[i+1]=v*.93;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.bmat=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;   /* 0.25 m weave */
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const cx=Math.floor(x/S),cy=Math.floor(y/S);const over=(cx+cy)%2;
  const f=over?(x%S)/S:(y%S)/S;let v=180+Math.sin(f*Math.PI)*40+(fbm(x/3,y/3,5,1)-.5)*20;
  const e=over?(y%S):(x%S);if(e<1||e>S-2)v-=60;
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- Slavic / Rus' / Carpathian woodcarving & rospis' primitives
function hlMirror(g,w,h,cx,fn){g.save();fn(g);g.restore();g.save();g.translate(2*cx,0);g.scale(-1,1);fn(g);g.restore();}
function hlCedar(g,w,h,base,vert){
 g.fillStyle=base||HFORM.cedar;g.fillRect(0,0,w,h);
 const n=vert?Math.max(16,w>>2):Math.max(16,h>>2);
 for(let i=0;i<n;i++){
  const t=(i+.5)/n,v=h3(i*1.7,vert?1:2,5.3);
  g.fillStyle=v>.5?'rgba(255,235,200,'+(0.04+(v-.5)*.14).toFixed(3)+')':'rgba(38,20,10,'+(0.05+(.5-v)*.18).toFixed(3)+')';
  if(vert)g.fillRect(t*w-1.5,0,2.5,h);else g.fillRect(0,t*h-1.5,w,2.5);
 }
 const planks=vert?4:5;g.fillStyle='rgba(26,14,8,0.22)';
 for(let k=1;k<planks;k++){if(vert)g.fillRect(Math.round(w*k/planks),0,1.5,h);else g.fillRect(0,Math.round(h*k/planks),w,1.5);}
}
function hlGround(g,w,h,white){if(white){g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);}else hlCedar(g,w,h,HFORM.cedar,false);}
function hlIn(g,x,y,w,h,uw,uh,fn){g.save();g.translate(x,y);g.scale(w/uw,h/uh);fn(g);g.restore();}
function hlFill(g,col){g.fillStyle=col;g.fill();}
function hlLine(g,col,lw){g.lineWidth=lw;g.strokeStyle=col;g.lineJoin='round';g.stroke();}

/* 6- or 8-petal Slavic compass-rose solar rosette (rozetka / gromovoy znak thunder-wheel) with chip-carved notched rim */
function hlRozetka(g,cx,cy,R,petals,col1,col2,bgCol){
 const n=petals==null?6:petals,c1=col1||HFORM.red,c2=col2||HFORM.ochre;
 g.beginPath();g.arc(cx,cy,R,0,TAU);hlFill(g,bgCol||HFORM.white);hlLine(g,HFORM.black,Math.max(1.6,R*.07));
 for(let k=0;k<24;k++){const a=k/24*TAU,a2=(k+.5)/24*TAU;
  g.beginPath();g.moveTo(cx+Math.cos(a)*R*.97,cy+Math.sin(a)*R*.97);
  g.lineTo(cx+Math.cos((a+a2)/2)*R*.84,cy+Math.sin((a+a2)/2)*R*.84);
  g.lineTo(cx+Math.cos(a2)*R*.97,cy+Math.sin(a2)*R*.97);g.closePath();
  hlFill(g,k%2?c1:c2);}
 g.beginPath();g.arc(cx,cy,R*.82,0,TAU);hlFill(g,bgCol||HFORM.white);hlLine(g,HFORM.black,Math.max(1.4,R*.05));
 for(let k=0;k<n;k++){const a=k/n*TAU-Math.PI/2,b=a+Math.PI/n;
  g.save();g.translate(cx,cy);g.rotate(b);
  g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(R*.24,-R*.36,0,-R*.76);g.quadraticCurveTo(-R*.24,-R*.36,0,0);
  hlFill(g,c2);hlLine(g,HFORM.black,Math.max(1,R*.035));g.restore();}
 for(let k=0;k<n;k++){const a=k/n*TAU-Math.PI/2;
  g.save();g.translate(cx,cy);g.rotate(a);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(R*.3,-R*.28,R*.28,-R*.66,0,-R*.8);g.bezierCurveTo(-R*.28,-R*.66,-R*.3,-R*.28,0,0);
  hlFill(g,c1);hlLine(g,HFORM.black,Math.max(1.2,R*.04));g.restore();}
 g.beginPath();g.arc(cx,cy,R*.16,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,Math.max(1.2,R*.04));
 g.beginPath();g.arc(cx,cy,R*.06,0,TAU);hlFill(g,HFORM.white);
}

/* 8-arm curved Slavic solar kolovrat wheel */
function hlKolovrat(g,cx,cy,R,arms,col){
 const n=arms==null?8:arms,c=col||HFORM.red;
 g.beginPath();g.arc(cx,cy,R,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,Math.max(1.8,R*.07));
 g.beginPath();g.arc(cx,cy,R*.84,0,TAU);hlFill(g,HFORM.white);hlLine(g,HFORM.black,Math.max(1.4,R*.05));
 for(let k=0;k<n;k++){const a=k/n*TAU;g.save();g.translate(cx,cy);g.rotate(a);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(R*.12,-R*.38,R*.42,-R*.68,R*.68,-R*.52);
  g.quadraticCurveTo(R*.48,-R*.78,R*.14,-R*.78);g.quadraticCurveTo(-R*.04,-R*.44,0,0);
  hlFill(g,k%2?HFORM.ochre:c);hlLine(g,HFORM.black,Math.max(1,R*.035));g.restore();}
 g.beginPath();g.arc(cx,cy,R*.18,0,TAU);hlFill(g,c);hlLine(g,HFORM.black,Math.max(1.2,R*.045));
}

/* Novgorodian two-strand braided pletenka interlace band */
function hlPletenka(g,x0,y0,w,h,c1,c2){
 const N=Math.max(4,Math.round(w/(h*.9))),A=h*.3,cy=y0+h/2,lw=Math.max(2,h*.22);
 for(const k of[0,1]){
  g.beginPath();
  for(let i=0;i<=N*12;i++){const t=i/(N*12),x=x0+t*w,y=cy+Math.sin(t*N*Math.PI+k*Math.PI)*A;i?g.lineTo(x,y):g.moveTo(x,y);}
  g.lineWidth=lw+Math.max(2,lw*.45);g.strokeStyle=HFORM.black;g.lineCap='round';g.stroke();
  g.lineWidth=lw;g.strokeStyle=k?(c2||HFORM.ochre):(c1||HFORM.red);g.stroke();
 }
 for(let m=0;m<N;m++){const xm=x0+(m+.5)*w/N;g.beginPath();g.arc(xm,cy,h*.09,0,TAU);hlFill(g,HFORM.white);hlLine(g,HFORM.black,1.2);}
}

/* Gorodets / Boretskaya rospis' floral berry-and-leaf S-scrollwork */
function hlRospisVine(g,x0,y0,w,h){
 g.save();g.translate(x0,y0);
 g.beginPath();g.moveTo(w*.04,h*.72);g.bezierCurveTo(w*.28,h*.12,w*.68,h*.88,w*.94,h*.26);
 g.lineWidth=Math.max(2.5,h*.07);g.strokeStyle=HFORM.teal;g.lineCap='round';g.stroke();
 for(const [lx,ly,ang,s] of[[.22,.36,-.6,1],[.46,.54,.7,.95],[.72,.44,-.5,1],[.34,.68,.9,.8],[.82,.64,.5,.85]]){
  g.save();g.translate(w*lx,h*ly);g.rotate(ang);
  g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(h*.22*s,-h*.14*s,h*.36*s,0);g.quadraticCurveTo(h*.22*s,h*.14*s,0,0);
  hlFill(g,HFORM.teal);hlLine(g,HFORM.black,1.5);
  g.beginPath();g.moveTo(h*.05*s,0);g.lineTo(h*.28*s,0);hlLine(g,HFORM.white,1.1);g.restore();}
 for(const [bx,by,r,c] of[[.28,.3,.18,HFORM.red],[.58,.62,.2,HFORM.ochre],[.84,.28,.16,HFORM.red],[.14,.62,.13,HFORM.blue]]){
  const R=h*r;g.beginPath();g.arc(w*bx,h*by,R,0,TAU);hlFill(g,c);hlLine(g,HFORM.black,1.8);
  g.beginPath();g.arc(w*bx-R*.24,h*by-R*.24,R*.34,0,TAU);hlFill(g,HFORM.white);
  for(let k=0;k<5;k++){const a=k/5*TAU;g.beginPath();g.arc(w*bx+Math.cos(a)*R*.52,h*by+Math.sin(a)*R*.52,R*.14,0,TAU);hlFill(g,c===HFORM.red?HFORM.ochre:HFORM.red);}}
 g.restore();
}

/* Heraldic Rus' solar horse (kon'), box 200 x 100, facing +x */
function hlSlavicHorse(g){
 g.beginPath();g.moveTo(46,72);g.bezierCurveTo(38,52,52,36,84,36);g.bezierCurveTo(108,36,126,32,136,18);
 g.quadraticCurveTo(144,6,158,10);g.lineTo(178,20);g.quadraticCurveTo(182,28,170,30);g.lineTo(156,28);
 g.quadraticCurveTo(150,42,144,54);g.lineTo(164,84);g.lineTo(154,90);g.lineTo(134,62);
 g.quadraticCurveTo(106,66,76,62);g.lineTo(60,90);g.lineTo(48,88);g.lineTo(58,64);g.closePath();
 hlFill(g,HFORM.red);hlLine(g,HFORM.black,3.5);
 g.beginPath();g.moveTo(46,48);g.bezierCurveTo(22,34,8,54,18,78);g.bezierCurveTo(26,64,32,56,48,56);
 hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,2.8);
 for(let k=0;k<5;k++){const t=k/4,mx=lerp(126,148,t),my=lerp(32,10,t);
  g.beginPath();g.arc(mx-6,my-4,5,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,1.6);}
 hlRozetka(g,106,49,12,6,HFORM.ochre,HFORM.white,HFORM.blue);
 g.beginPath();g.arc(158,17,3.2,0,TAU);hlFill(g,HFORM.white);g.beginPath();g.arc(159,17,1.5,0,TAU);hlFill(g,HFORM.black);
}

/* Slavic Firebird / Petushok solar rooster, frontal, box 200 x 100 */
function hlFirebird(g){
 hlMirror(g,200,100,100,g2=>{
  for(let k=0;k<6;k++){const a=-.22-k*.19,L=78-k*5;g2.save();g2.translate(100,58);g2.rotate(a);
   g2.beginPath();g2.moveTo(-8,0);g2.quadraticCurveTo(-L*.55,-22,-L,-6);g2.quadraticCurveTo(-L*.6,12,-8,6);g2.closePath();
   hlFill(g2,k%2?HFORM.ochre:HFORM.red);hlLine(g2,HFORM.black,2.4);
   g2.beginPath();g2.arc(-L*.82,-3,4.2,0,TAU);hlFill(g2,HFORM.white);g2.restore();}
  g2.beginPath();g2.moveTo(92,76);g2.lineTo(82,94);hlLine(g2,HFORM.ochre,3.2);});
 g.beginPath();g.ellipse(100,56,22,26,0,0,TAU);hlFill(g,HFORM.red);hlLine(g,HFORM.black,3.4);
 hlRozetka(g,100,58,15,8,HFORM.ochre,HFORM.white,HFORM.blue);
 g.beginPath();g.arc(100,24,12,0,TAU);hlFill(g,HFORM.red);hlLine(g,HFORM.black,3);
 for(let k=-2;k<=2;k++){const a=k*.32-Math.PI/2;g.beginPath();g.arc(100+Math.cos(a)*15,24+Math.sin(a)*15,4.2,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,1.5);}
 g.beginPath();g.moveTo(88,22);g.lineTo(74,26);g.lineTo(88,30);g.closePath();hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,2);
 g.beginPath();g.arc(96,23,3,0,TAU);hlFill(g,HFORM.white);g.beginPath();g.arc(95.5,23,1.4,0,TAU);hlFill(g,HFORM.black);
}

/* Novgorodian woodland bear (medved') with oak-leaf scroll, box 200 x 100 */
function hlBear(g){
 g.beginPath();g.moveTo(38,44);g.bezierCurveTo(58,20,118,18,148,30);g.quadraticCurveTo(158,24,170,30);g.lineTo(192,42);
 g.quadraticCurveTo(188,52,174,52);g.quadraticCurveTo(158,54,150,60);g.lineTo(154,92);g.lineTo(136,92);g.lineTo(132,68);
 g.quadraticCurveTo(100,74,68,68);g.lineTo(64,92);g.lineTo(46,92);g.lineTo(42,64);g.quadraticCurveTo(28,56,38,44);g.closePath();
 hlFill(g,HFORM.cedarD);hlLine(g,HFORM.black,3.6);
 g.beginPath();g.arc(158,26,6.5,0,TAU);hlFill(g,HFORM.cedarD);hlLine(g,HFORM.black,2);
 hlRozetka(g,102,48,15,6,HFORM.ochre,HFORM.red,HFORM.white);
 for(const x of[60,138]){g.beginPath();g.arc(x,48,7,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,1.8);}
 g.beginPath();g.arc(170,38,3.6,0,TAU);hlFill(g,HFORM.white);g.beginPath();g.arc(171,38,1.6,0,TAU);hlFill(g,HFORM.black);
}

// ---------------------------------------------------------------- Slavic carved & painted boards (plane UV 0..1)
// FORM_A: twin Rus' solar horses flanking an 8-petal gromovoy znak rosette on warm larch boards
TEX.formA=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,false);
 hlMirror(g,w,h,w/2,g2=>hlIn(g2,w*.02,h*.16,w*.38,h*.68,200,100,hlSlavicHorse));
 hlRozetka(g,w/2,h*.5,h*.34,8,HFORM.red,HFORM.ochre,HFORM.white);
 hlPletenka(g,h*.04,h*.04,w-h*.08,h*.1,HFORM.red,HFORM.ochre);hlPletenka(g,h*.04,h*.86,w-h*.08,h*.1,HFORM.ochre,HFORM.red);
 g.lineWidth=h*.03;g.strokeStyle=HFORM.black;g.strokeRect(h*.015,h*.015,w-h*.03,h-h*.03);});
// FORM_W: Gorodets / Khokhloma floral rospis' & 6-petal solar rozetka on birch-white ground
TEX.formW=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,true);
 hlMirror(g,w,h,w/2,g2=>hlRospisVine(g2,w*.03,h*.1,w*.36,h*.68));
 hlRozetka(g,w/2,h*.44,h*.32,6,HFORM.red,HFORM.blue,HFORM.ochre);
 hlPletenka(g,w*.03,h*.8,w*.94,h*.15,HFORM.red,HFORM.teal);
 g.lineWidth=h*.03;g.strokeStyle=HFORM.red;g.strokeRect(h*.015,h*.015,w-h*.03,h-h*.03);});
// FORM_V: tall Slavic pilaster board (1:4) — stacked 6/8-petal solar rozetki & braided pletenka links
TEX.formV=canvasTex(128,512,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedarD,true);
 for(let k=0;k<4;k++){const cy=h*(k+.5)/4;
  hlRozetka(g,w/2,cy-h*.02,w*.38,k%2?8:6,k%2?HFORM.ochre:HFORM.red,HFORM.white,k%2?HFORM.blue:HFORM.teal);
  hlPletenka(g,w*.08,cy+h*.075,w*.84,h*.04,HFORM.ochre,HFORM.red);}
 g.lineWidth=4;g.strokeStyle=HFORM.black;g.strokeRect(2,2,w-4,h-4);});
// FORM_T: gable tympanum Slavic Firebird (Zhar-Ptitsa) & solar kolovrat sun-crest
TEX.formT=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,false);hlIn(g,w*.04,h*.04,w*.92,h*.88,200,100,hlFirebird);
 hlPletenka(g,w*.04,h*.86,w*.92,h*.1,HFORM.red,HFORM.ochre);});
// FORM_B: Novgorodian woodland bear & solar rozetki guild board
TEX.formB=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,false);hlIn(g,w*.12,h*.08,w*.76,h*.82,200,100,hlBear);
 hlRozetka(g,w*.1,h*.5,h*.2,6,HFORM.ochre,HFORM.red,HFORM.white);hlRozetka(g,w*.9,h*.5,h*.2,6,HFORM.ochre,HFORM.red,HFORM.white);
 g.lineWidth=h*.03;g.strokeStyle=HFORM.black;g.strokeRect(h*.015,h*.015,w-h*.03,h-h*.03);});
// FORM_F: carved Slavic eave & belt frieze (4:1, repeats along x) — alternating rozetka sun-wheels and pletenka braid
TEX.formF=canvasTex(256,64,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedarD,false);
 for(let k=0;k<4;k++){const cx=w*(k+.5)/4;
  if(k%2===0)hlRozetka(g,cx,h*.5,h*.38,6,HFORM.red,HFORM.ochre,HFORM.white);
  else hlKolovrat(g,cx,h*.5,h*.36,8,HFORM.red);}
 g.fillStyle=HFORM.red;g.fillRect(0,0,w,h*.1);g.fillRect(0,h*.9,w,h*.1);
 g.fillStyle=HFORM.ochre;for(let k=0;k<16;k++)g.fillRect(k*w/16+2,h*.02,w/32,h*.06);});

// ---------------------------------------------------------------- Slavic turned kubyshka & stolbets column wrap (cylinder UV)
function hlStolbetsTex(cols){return canvasTex(256,1024,(g,w,h)=>{hlCedar(g,w,h,cols.base,true);
 for(const [y0,hh,c] of[[.03,.05,HFORM.red],[.28,.08,HFORM.ochre],[.64,.08,HFORM.red],[.92,.05,HFORM.ochre]]){
  g.fillStyle=c;g.fillRect(0,h*y0,w,h*hh);hlPletenka(g,0,h*y0,w,h*hh,HFORM.white,cols.accent);}
 for(const [cy,pet] of[[.18,6],[.46,8],[.79,6]]){
  hlRozetka(g,w/2,h*cy,w*.34,pet,HFORM.red,HFORM.ochre,HFORM.white);
  hlRozetka(g,0,h*cy,w*.2,6,cols.accent,HFORM.ochre,HFORM.white);hlRozetka(g,w,h*cy,w*.2,6,cols.accent,HFORM.ochre,HFORM.white);}});}
TEX.totem=hlStolbetsTex({base:HFORM.cedar,accent:HFORM.teal});
TEX.totemP=hlStolbetsTex({base:HFORM.white,accent:HFORM.blue});
// Carved Slavic okhlupen' / konyok horse-head & solar crest finial (alpha-tested)
TEX.wing=canvasTex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);
 g.beginPath();g.moveTo(0,h*.82);g.quadraticCurveTo(w*.18,h*.14,w*.56,h*.08);g.quadraticCurveTo(w*.88,h*.06,w*.98,h*.28);
 g.quadraticCurveTo(w*.92,h*.42,w*.76,h*.38);g.quadraticCurveTo(w*.66,h*.56,w*.84,h*.78);g.lineTo(0,h*.92);g.closePath();
 hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,4);
 g.save();g.clip();
 for(let k=0;k<5;k++){g.beginPath();g.arc(w*(.22+k*.11),h*(.26-k*.02),h*.12,0,TAU);hlFill(g,k%2?HFORM.red:HFORM.white);hlLine(g,HFORM.black,2);}
 hlRozetka(g,w*.34,h*.62,h*.24,6,HFORM.red,HFORM.white,HFORM.blue);g.restore();});

// ---------------------------------------------------------------- pierced Slavic prichelina / nalichnik fretwork lace (alpha-tested)
TEX.laceV=canvasTex(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(0,0,w,h*.46);
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;g.beginPath();g.arc(cx,h*.46,w/16,0,Math.PI);g.fill();
  g.beginPath();g.moveTo(cx-5,h*.52);g.lineTo(cx,h*.98);g.lineTo(cx+5,h*.52);g.closePath();g.fill();}
 g.globalCompositeOperation='destination-out';
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;
  for(let p=0;p<6;p++){const a=p/6*TAU;g.beginPath();g.arc(cx+Math.cos(a)*h*.08,h*.24+Math.sin(a)*h*.08,h*.042,0,TAU);g.fill();}
  g.beginPath();g.arc(cx,h*.24,h*.05,0,TAU);g.fill();
  const dx=cx+w/16;g.beginPath();g.moveTo(dx,h*.08);g.lineTo(dx+6,h*.22);g.lineTo(dx,h*.36);g.lineTo(dx-6,h*.22);g.closePath();g.fill();}
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,h*.02,w,2);});
// LACE_B: Carpathian / Rus' pierced baluster boards — heart, trefoil and diamond cut-outs; repeats along x.
TEX.laceB=canvasTex(128,64,(g,w,h)=>{g.clearRect(0,0,w,h);const n=4,bw=w/n;
 for(let k=0;k<n;k++){const x0=k*bw;g.fillStyle='#fff';g.fillRect(x0+1,0,bw-2,h);
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x0+bw-2,0,1,h);}
 g.globalCompositeOperation='destination-out';
 for(let k=0;k<n;k++){const cx=k*bw+bw;
  g.beginPath();g.moveTo(cx,h*.22);g.bezierCurveTo(cx-bw*.48,h*.08,cx-bw*.48,h*.48,cx,h*.74);g.bezierCurveTo(cx+bw*.48,h*.48,cx+bw*.48,h*.08,cx,h*.22);g.fill();
  const mx=k*bw+bw*.5;g.beginPath();g.moveTo(mx,h*.1);g.lineTo(mx+4,h*.18);g.lineTo(mx,h*.26);g.lineTo(mx-4,h*.18);g.closePath();g.fill();}
 g.globalCompositeOperation='source-over';});
// ---------------------------------------------------------------- clock face (colour-carrying)
TEX.clock=canvasTex(256,256,(g,w,h)=>{const c=w/2;g.fillStyle='#1c1a1c';g.fillRect(0,0,w,h);
 g.beginPath();g.arc(c,c,c*.96,0,TAU);g.fillStyle='#c9a043';g.fill();g.beginPath();g.arc(c,c,c*.84,0,TAU);g.fillStyle='#f1e8d2';g.fill();
 g.strokeStyle='#1c1a1c';for(let k=0;k<60;k++){const a=k/60*TAU,L=k%5?c*.05:c*.13;g.lineWidth=k%5?2:6;g.beginPath();g.moveTo(c+Math.sin(a)*c*.8,c-Math.cos(a)*c*.8);g.lineTo(c+Math.sin(a)*(c*.8-L),c-Math.cos(a)*(c*.8-L));g.stroke();}
 g.beginPath();g.arc(c,c,c*.06,0,TAU);g.fillStyle='#b3322a';g.fill();});
// ---------------------------------------------------------------- cliff rock (fractured grey granite, strata and streaks): 8 m tile
TEX.rock=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/40,y/22,1.7,4),n2=fbm(x/6,y/6,4.4,2);
  let v=128+(n-.5)*90+(n2-.5)*30;
  const crack=Math.abs(fbm(x/30,y/90,8.1,3)-.5);if(crack<.02)v-=60*(1-crack/.02);                        // vertical joints
  const strat=Math.abs(Math.sin((y/h*5+fbm(x/50,y/50,2,2)*1.4)*Math.PI));if(strat<.06)v-=40;               // bedding planes
  const streak=clamp((fbm(x/5,y/70,6.6,2)-.55)*3,0,1);v-=streak*30;                                          // water streaks
  const lichen=clamp((fbm(x/12,y/12,3.9,2)-.62)*4,0,1);
  d[i]=v*(1-lichen*.1);d[i+1]=v*(1+lichen*.12);d[i+2]=v*(.98-lichen*.2);d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- meadow ground for the showcase: 8 m tile
TEX.meadow=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/50,y/50,.7,3),n2=fbm(x/5,y/5,3.2,2),bare=clamp((fbm(x/36,y/36,5.5,2)-.62)*4,0,1);
  let r=86+(n-.5)*40+(n2-.5)*26,gg=112+(n-.5)*46+(n2-.5)*30,b=58+(n-.5)*20;
  r=lerp(r,112+n2*30,bare);gg=lerp(gg,94+n2*24,bare);b=lerp(b,68,bare);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
