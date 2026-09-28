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

// ---------------------------------------------------------------- formline palette (NW-coast inspired)
const HFORM={black:'#171311',red:'#b3322a',teal:'#2e9488',tealD:'#1f6f68',white:'#efe7d6',cedar:'#b27a4c',cedarD:'#8a5634',ochre:'#d19a3a'};

// ---------------------------------------------------------------- wood: round logs (horizontal), 2 m tile, 6 courses
TEX.logs=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const LH=w/6;   // ~0.33 m logs
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/LH),fy=(y%LH)/LH;
  const round=Math.sin(Math.PI*fy);                                        // rounded log: lit crown, dark top/bottom
  let v=112+round*92+(h3(row*3.1,0,2.2)-.5)*30;
  v+=(fbm(x/26,y/2.2,row*1.7,2)-.5)*30;                                    // grain along the log
  if(fy<.08||fy>.94)v=58+(fbm(x/4,y/4,1,1)-.5)*16;                          // chinking (moss/clay) between courses
  const check=fbm(x/40,y/1.2,row*3.3,2);if(check>.7&&fy>.3&&fy<.6)v-=(check-.7)*140;   // drying checks
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.78;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fish-scale shingle / slate: 2 m tile, 0.25 m scales
TEX.scale=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/S),off=(row%2)*S/2;const sx=Math.floor((x+off)/S);
  const fx=((x+off)%S)/S-.5,fy=(y%S)/S;const r=Math.hypot(fx,(fy-.35)*1.1);   // round bottom of each scale
  let v=176+(h3(sx*2.3,row*1.9,4.1)-.5)*48+(fbm(x/4,y/4,2.2,1)-.5)*14;
  if(r>.46&&fy>.45)v-=70;else if(r>.4&&fy>.4)v-=26;                          // the shadowed rim of the scale above
  if(fy<.08)v-=30;
  d[i]=v;d[i+1]=v;d[i+2]=v*1.02;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fieldstone (rubble) socle: 4 m tile
TEX.rubble=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const pts=[];for(let k=0;k<70;k++){const px=h3(k,1.3,2.7)*w,py=h3(k,4.1,.7)*h;for(const ox of[-w,0,w])for(const oy of[-h,0,h])pts.push([px+ox,py+oy,k]);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let d1=1e9,d2=1e9,id1=0;
  for(const p of pts){const dx=(x-p[0])*.8,dy=y-p[1];const dd=dx*dx+dy*dy;if(dd<d1){d2=d1;d1=dd;id1=p[2];}else if(dd<d2)d2=dd;}
  const edge=Math.sqrt(d2)-Math.sqrt(d1);let v;
  if(edge<3.2)v=92+(fbm(x/3,y/3,2,1)-.5)*20;                                 // deep mortar
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
  if(fy<.07)v=120;else if(fy<.14)v=222;                                      // node ring + its lit swelling
  d[i]=v*.96;d[i+1]=v*.93;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.bmat=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;   // 0.25 m weave
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const cx=Math.floor(x/S),cy=Math.floor(y/S);const over=(cx+cy)%2;
  const f=over?(x%S)/S:(y%S)/S;let v=180+Math.sin(f*Math.PI)*40+(fbm(x/3,y/3,5,1)-.5)*20;
  const e=over?(y%S):(x%S);if(e<1||e>S-2)v-=60;
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- the painted carving: formline primitives
// A formline design is built from a few units — OVOID, U-FORM, SPLIT-U, TRIGON negative spaces — joined by a
// heavy black primary line that swells and tapers, with red secondary and teal tertiary fills. These helpers draw
// them on a 2D canvas in canvas units (y down). Everything is symmetric: draw the left half, then hlMirror().
function hlOvoidPath(g,cx,cy,w,h){g.beginPath();
 g.moveTo(cx-w/2,cy+h*.1);
 g.bezierCurveTo(cx-w/2,cy-h*.62,cx+w/2,cy-h*.62,cx+w/2,cy+h*.1);             // domed top
 g.bezierCurveTo(cx+w/2,cy+h*.55,cx+w*.22,cy+h*.52,cx,cy+h*.36);             // concave underside rises to the centre
 g.bezierCurveTo(cx-w*.22,cy+h*.52,cx-w/2,cy+h*.55,cx-w/2,cy+h*.1);g.closePath();}
function hlOvoid(g,cx,cy,w,h,line,fill,lw){hlOvoidPath(g,cx,cy,w,h);if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=lw||Math.max(2,w*.14);g.strokeStyle=line;g.stroke();}}
function hlUForm(g,cx,cy,w,h,col,lw){g.beginPath();g.moveTo(cx-w/2,cy-h/2);g.bezierCurveTo(cx-w/2,cy+h*.7,cx+w/2,cy+h*.7,cx+w/2,cy-h/2);
 g.lineWidth=lw||w*.22;g.strokeStyle=col;g.lineCap='round';g.stroke();g.lineCap='butt';}
function hlSplitU(g,cx,cy,w,h,col,lw){hlUForm(g,cx,cy,w,h,col,lw);g.beginPath();g.moveTo(cx,cy-h/2);g.lineTo(cx,cy+h*.12);g.lineWidth=(lw||w*.22)*.7;g.strokeStyle=HFORM.white;g.stroke();}
function hlEye(g,cx,cy,w,h,socket){   // eye socket (teal or red), lid ovoid in black, white eyeball, black pupil ovoid
 hlOvoid(g,cx,cy,w,h,HFORM.black,socket||HFORM.teal,w*.12);
 hlOvoid(g,cx,cy+h*.06,w*.64,h*.5,HFORM.black,HFORM.white,w*.07);
 hlOvoid(g,cx,cy+h*.08,w*.34,h*.3,null,HFORM.black);}
function hlSwoop(g,pts,col,lw){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i+2<pts.length+1;i+=3)g.bezierCurveTo(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],pts[i+2][0],pts[i+2][1]);
 g.lineWidth=lw;g.strokeStyle=col;g.lineCap='round';g.stroke();g.lineCap='butt';}
function hlTrigon(g,x,y,s,col){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+s*.5,y+s*.1,x+s,y);g.quadraticCurveTo(x+s*.6,y+s*.4,x+s*.5,y+s);g.quadraticCurveTo(x+s*.4,y+s*.4,x,y);g.fillStyle=col;g.fill();}
// draw fn(g) on the left half, then mirror it onto the right half
function hlMirror(g,w,h,cx,fn){g.save();fn(g);g.restore();g.save();g.translate(2*cx,0);g.scale(-1,1);fn(g);g.restore();}
// wood grain under a painted design (cedar), vertical or horizontal
function hlCedar(g,w,h,base,vert){g.fillStyle=base||HFORM.cedar;g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=vert?fbm(x/2.5,y/40,3.3,2):fbm(x/40,y/2.5,3.3,2);const k=.82+n*.34;d[i]*=k;d[i+1]*=k;d[i+2]*=k;}
 g.putImageData(id,0,0);}
// A crest face: the core of every panel, pole and mask. o: {beak, teeth, ears, tongue, socket, brow, cheek}
function hlFace(g,cx,cy,W,H,o){o=o||{};const S=W/2;
 hlMirror(g,W,H,cx,g=>{
  // head outline: heavy black formline around the face, open at the chin
  hlSwoop(g,[[cx,cy-H*.5],[cx-S*.55,cy-H*.52],[cx-S*.98,cy-H*.36],[cx-S*.96,cy-H*.02],[cx-S*.95,cy+H*.25],[cx-S*.78,cy+H*.44],[cx-S*.5,cy+H*.48]],HFORM.black,W*.05);
  if(o.ears!==false){hlUForm(g,cx-S*.7,cy-H*.46,S*.36,H*.18,HFORM.red,S*.08);hlOvoid(g,cx-S*.7,cy-H*.5,S*.16,H*.08,null,HFORM.black);}
  // brow: a thick black arch over the eye
  hlSwoop(g,[[cx-S*.08,cy-H*.2],[cx-S*.22,cy-H*.34],[cx-S*.62,cy-H*.36],[cx-S*.8,cy-H*.18]],HFORM.black,H*.06);
  hlEye(g,cx-S*.43,cy-H*.1,S*.56,H*.2,o.socket);
  // cheek: red U-form under the eye, teal trigon in the cheek
  hlUForm(g,cx-S*.46,cy+H*.08,S*.5,H*.12,o.cheek||HFORM.red,S*.08);
  hlTrigon(g,cx-S*.82,cy+H*.02,S*.18,HFORM.teal);
  // flank: a small ovoid joint in the outer cheek
  hlOvoid(g,cx-S*.8,cy+H*.24,S*.2,H*.12,HFORM.black,HFORM.red,S*.04);
 });
 // nose / beak (on the axis)
 if(o.beak){g.beginPath();g.moveTo(cx-S*.16,cy-H*.12);g.quadraticCurveTo(cx+S*.02,cy+H*.02,cx+S*.02,cy+H*.4);g.quadraticCurveTo(cx-S*.02,cy+H*.46,cx-S*.08,cy+H*.38);
  g.quadraticCurveTo(cx,cy+H*.1,cx-S*.16,cy-H*.12);g.fillStyle=HFORM.black;g.fill();
  g.beginPath();g.moveTo(cx+S*.16,cy-H*.12);g.quadraticCurveTo(cx+S*.02,cy+H*.02,cx+S*.02,cy+H*.4);g.lineWidth=S*.05;g.strokeStyle=HFORM.black;g.stroke();
  hlSplitU(g,cx,cy-H*.02,S*.22,H*.14,HFORM.red,S*.06);}
 else{hlSplitU(g,cx,cy+H*.02,S*.3,H*.16,HFORM.red,S*.09);
  hlOvoid(g,cx-S*.1,cy+H*.14,S*.12,H*.07,null,HFORM.black);hlOvoid(g,cx+S*.1,cy+H*.14,S*.12,H*.07,null,HFORM.black);}
 // mouth: red lips around a black mouth, white teeth
 const mw=S*(o.beak?.6:.95),my=cy+H*.32;
 g.beginPath();g.ellipse(cx,my,mw*.62,H*.09,0,0,TAU);g.fillStyle=HFORM.red;g.fill();
 g.beginPath();g.ellipse(cx,my,mw*.5,H*.055,0,0,TAU);g.fillStyle=HFORM.black;g.fill();
 if(o.teeth!==false){g.fillStyle=HFORM.white;const n=6;for(let k=0;k<n;k++){const tx=cx-mw*.42+mw*.84*(k+.5)/n;g.fillRect(tx-mw*.05,my-H*.045,mw*.1,H*.03);g.fillRect(tx-mw*.05,my+H*.015,mw*.1,H*.03);}}
 if(o.tongue){g.beginPath();g.moveTo(cx-S*.06,my);g.quadraticCurveTo(cx,my+H*.22,cx+S*.06,my);g.fillStyle=HFORM.red;g.fill();}}

// ---------------------------------------------------------------- crest panels (colour-carrying, plane UV 0..1)
// FORM_A: a wide crest (2:1) — central face flanked by profile heads, on cedar. Façades, gables, lintels.
TEX.formA=canvasTex(512,256,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedar,false);
 hlFace(g,w/2,h*.52,h*.95,h*.92,{});
 hlMirror(g,w,h,w/2,g=>{   // flanking profile creature: an ovoid head with one eye, a long formline body sweeping out
  hlSwoop(g,[[w*.33,h*.2],[w*.2,h*.02],[w*.04,h*.1],[w*.04,h*.42],[w*.04,h*.78],[w*.2,h*.94],[w*.33,h*.84]],HFORM.black,h*.05);
  hlEye(g,w*.14,h*.36,h*.3,h*.2,HFORM.teal);
  hlUForm(g,w*.2,h*.66,h*.24,h*.16,HFORM.red,h*.045);hlUForm(g,w*.11,h*.72,h*.12,h*.1,HFORM.black,h*.03);
  hlSplitU(g,w*.27,h*.2,h*.12,h*.1,HFORM.red,h*.03);hlTrigon(g,w*.06,h*.84,h*.08,HFORM.teal);});
 g.lineWidth=h*.03;g.strokeStyle=HFORM.black;g.strokeRect(h*.015,h*.015,w-h*.03,h-h*.03);});
// FORM_W: the same crest on white — the bold painted house-fronts of the tribes and the Republic's guild boards
TEX.formW=canvasTex(512,256,(g,w,h)=>{g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);
 hlFace(g,w/2,h*.52,h*.95,h*.92,{socket:HFORM.teal,tongue:true});
 hlMirror(g,w,h,w/2,g=>{hlSwoop(g,[[w*.34,h*.12],[w*.18,h*.0],[w*.02,h*.2],[w*.05,h*.52],[w*.08,h*.86],[w*.24,h*.96],[w*.34,h*.86]],HFORM.red,h*.06);
  hlEye(g,w*.15,h*.4,h*.32,h*.22,HFORM.red);hlUForm(g,w*.16,h*.72,h*.26,h*.16,HFORM.black,h*.05);hlTrigon(g,w*.26,h*.62,h*.1,HFORM.teal);});});
// FORM_V: a tall board (1:4) — a stack of ovoids and U-forms, for pilasters, door jambs, columns-as-boards
TEX.formV=canvasTex(128,512,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedarD,true);
 for(let k=0;k<4;k++){const cy=h*(k+.5)/4;
  hlOvoid(g,w/2,cy-h*.03,w*.78,h*.12,HFORM.black,k%2?HFORM.teal:HFORM.red,w*.08);
  hlOvoid(g,w/2,cy-h*.02,w*.4,h*.06,HFORM.black,HFORM.white,w*.05);
  hlUForm(g,w/2,cy+h*.075,w*.7,h*.05,k%2?HFORM.red:HFORM.black,w*.08);}});
// FORM_T: a gable crest (triangle-ready, 2:1) — the thunderbird, wings spread across the gable, head on the axis
TEX.formT=canvasTex(512,256,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedar,false);
 hlMirror(g,w,h,w/2,g=>{for(let k=0;k<5;k++){const x=w*.08+k*w*.075,y=h*.55+k*h*.05;   // feathers: U-forms stepping up the wing
   hlUForm(g,x,y,w*.07,h*.28,k%2?HFORM.red:HFORM.black,w*.018);}
  hlSwoop(g,[[w*.02,h*.9],[w*.12,h*.3],[w*.3,h*.25],[w*.44,h*.38]],HFORM.black,h*.05);
  hlEye(g,w*.3,h*.45,w*.1,h*.16,HFORM.teal);});
 hlFace(g,w/2,h*.46,h*.62,h*.66,{beak:true,ears:false,teeth:false});});
// FORM_F: frieze (4:1, repeats along x) — alternating ovoid and split-U, for eave boards and lintels
TEX.formF=canvasTex(256,64,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedarD,false);
 for(let k=0;k<4;k++){const cx=w*(k+.5)/4;if(k%2){hlOvoid(g,cx,h*.52,w*.18,h*.6,HFORM.black,HFORM.teal,w*.02);hlOvoid(g,cx,h*.55,w*.08,h*.26,null,HFORM.black);}
  else{hlSplitU(g,cx,h*.4,w*.16,h*.52,HFORM.red,w*.035);}}
 g.fillStyle=HFORM.black;g.fillRect(0,0,w,h*.08);g.fillRect(0,h*.92,w,h*.08);});

// ---------------------------------------------------------------- totem column (colour-carrying, wraps a cylinder)
// u runs round the pole with u=0.5 at the FRONT (hTotem instances are yawed so this faces the street), v up.
// Three crest figures stacked: bird (beak) at the top, bear (teeth, tongue) in the middle, frog/man at the foot.
function hlTotemTex(seed,cols){return canvasTex(256,1024,(g,w,h)=>{hlCedar(g,w,h,cols.base,true);
 // back of the pole: shallow adze-carved grooves only
 const figs=[{beak:true,ears:false,teeth:false},{teeth:true,tongue:true},{ears:false,teeth:true}];
 for(let k=0;k<3;k++){const cy=h*(1-(k+.5)/3);   // v=1 top (canvas y 0): figure 0 at the top
  hlFace(g,w/2,h*(k+.5)/3,w*.5,h*.3,Object.assign({socket:k===1?HFORM.red:cols.socket},figs[(k+seed)%3]));
  // wings / arms: a pair of U-forms at the sides of each figure, wrapping round the pole
  hlMirror(g,w,h,w/2,g=>{hlUForm(g,w*.2,h*(k+.62)/3,w*.1,h*.07,HFORM.black,w*.025);hlOvoid(g,w*.2,h*(k+.44)/3,w*.08,h*.04,HFORM.black,cols.socket,w*.012);});
  g.fillStyle=HFORM.black;g.fillRect(0,h*(k+1)/3-h*.006,w,h*.012);}});}
TEX.totem=hlTotemTex(0,{base:HFORM.cedar,socket:HFORM.teal});
TEX.totemP=hlTotemTex(1,{base:'#d8cdb4',socket:HFORM.teal});   // painted ground (the Painted Men)
// a spread wing (thunderbird) with alpha, for crossarms and gable finials
TEX.wing=canvasTex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);
 g.beginPath();g.moveTo(0,h*.2);g.quadraticCurveTo(w*.5,-h*.1,w,h*.35);g.lineTo(w,h*.6);for(let k=0;k<6;k++){const x=w-(k+1)*w/6;g.quadraticCurveTo(x+w/12,h*(.95-k*.04),x,h*(.62-k*.03));}g.closePath();
 g.fillStyle=HFORM.white;g.fill();g.save();g.clip();
 for(let k=0;k<6;k++){const x=w-(k+.5)*w/6;hlUForm(g,x,h*.62,w*.13,h*.46,k%2?HFORM.red:HFORM.black,w*.03);}
 hlSwoop(g,[[0,h*.3],[w*.3,h*.05],[w*.7,h*.1],[w,h*.4]],HFORM.black,h*.1);hlEye(g,w*.16,h*.32,w*.14,h*.24,HFORM.teal);g.restore();});

// ---------------------------------------------------------------- fretwork lace (alpha-tested, tinted)
// LACE_V: carved valance — the Russian prichelina / nalichnik: a band with pierced holes and scalloped drops.
TEX.laceV=canvasTex(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(0,0,w,h*.42);
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;g.beginPath();g.arc(cx,h*.42,w/16,0,Math.PI);g.fill();                    // scallops
  g.beginPath();g.moveTo(cx-3,h*.5);g.lineTo(cx,h*.98);g.lineTo(cx+3,h*.5);g.fill();}                                 // drops
 g.globalCompositeOperation='destination-out';
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;g.beginPath();g.arc(cx,h*.22,h*.09,0,TAU);g.fill();g.beginPath();g.arc(cx,h*.5,h*.06,0,TAU);g.fill();
  g.beginPath();g.moveTo(cx+w/16,h*.08);g.lineTo(cx+w/16+5,h*.22);g.lineTo(cx+w/16,h*.36);g.lineTo(cx+w/16-5,h*.22);g.closePath();g.fill();}
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,h*.02,w,2);});
// LACE_B: alpine cut-out balustrade boards — each 0.2 m board carries a tulip/heart cut-out; repeats along x.
TEX.laceB=canvasTex(128,64,(g,w,h)=>{g.clearRect(0,0,w,h);const n=4,bw=w/n;
 for(let k=0;k<n;k++){const x0=k*bw;g.fillStyle='#fff';g.beginPath();g.moveTo(x0+1,0);g.lineTo(x0+bw-1,0);g.lineTo(x0+bw-1,h);g.lineTo(x0+1,h);g.fill();
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x0+bw-2,0,1,h);}
 g.globalCompositeOperation='destination-out';
 for(let k=0;k<n;k++){const cx=k*bw+bw;   // cut-outs straddle the joint, so two boards make one shape
  g.beginPath();g.moveTo(cx,h*.22);g.bezierCurveTo(cx-bw*.5,h*.1,cx-bw*.5,h*.5,cx,h*.78);g.bezierCurveTo(cx+bw*.5,h*.5,cx+bw*.5,h*.1,cx,h*.22);g.fill();}
 g.globalCompositeOperation='source-over';});
// ---------------------------------------------------------------- clock face (colour-carrying)
TEX.clock=canvasTex(256,256,(g,w,h)=>{const c=w/2;g.fillStyle='#1c1a1c';g.fillRect(0,0,w,h);
 g.beginPath();g.arc(c,c,c*.96,0,TAU);g.fillStyle='#c9a043';g.fill();g.beginPath();g.arc(c,c,c*.84,0,TAU);g.fillStyle='#f1e8d2';g.fill();
 g.strokeStyle='#1c1a1c';for(let k=0;k<60;k++){const a=k/60*TAU,L=k%5?c*.05:c*.13;g.lineWidth=k%5?2:6;g.beginPath();g.moveTo(c+Math.sin(a)*c*.8,c-Math.cos(a)*c*.8);g.lineTo(c+Math.sin(a)*(c*.8-L),c-Math.cos(a)*(c*.8-L));g.stroke();}
 g.lineCap='round';g.lineWidth=10;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.sin(5.2)*c*.42,c-Math.cos(5.2)*c*.42);g.stroke();
 g.lineWidth=6;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.sin(2.1)*c*.66,c-Math.cos(2.1)*c*.66);g.stroke();
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
