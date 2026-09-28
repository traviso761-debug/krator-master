// ================================================================= HIGHLANDS — the motif library (round 2)
// Travis, round 2: keep the formline murals for the Tribes, but give the Republic and the Rustic villages a wider,
// more Norse and Celtic repertoire painted in the SAME palette (black / red / teal / ochre on cedar or white):
// Celtic knots and plaits, braided rings, the triskelion, the tree of life, Celtic cats, wolves, Thor's hammer,
// grain, rockets, moths, warriors, sun / moon / star and the gas giant — and the Republic's own emblem, three
// arms holding swords in a triskelion. Every shop gets a sign with its trade's symbol; totems outside the tribes
// become carved PILLARS showing the same repertoire stacked like a totem.
//
// Everything is drawn procedurally into canvases (colour-carrying, never tinted), in unit boxes placed with
// hlIn(g, x,y,w,h, uw,uh, fn) — see 70-hl-tex.js. Kit items (planes unless noted), all prefix hM:
//   hM_w_<name>  wide mural 2:1        hM_g_<name>  gable crest 2:1        hM_t_<name>  tall board 1:4
//   hM_d_<name>  roundel (alpha disc)  hM_sign_<symbol>  shop-sign roundel  hM_p_<k>  carved pillar (BOX, 1:4 faces)
//   hM_banner    Republic banner (cloth)
// Pick lists for the helpers are in HMOTIF.

// ---------------------------------------------------------------- Celtic drawing kit
// A ribbon: whatever path draw() builds, stroked black and then filled narrower in the strand colour.
function hlRibbon(g,draw,w,fill,edge){g.save();g.lineCap='round';g.lineJoin='round';draw();g.strokeStyle=edge||HFORM.black;g.lineWidth=w+Math.max(2,w*.5);g.stroke();
 g.strokeStyle=fill;g.lineWidth=w;g.stroke();g.restore();}
// PLAIT: knotwork in a c x r cell rectangle (cell s) — billiard strands at 45° bouncing off the border, woven
// over / under alternately along every strand. The traditional basis of Celtic interlace.
function hlPlait(g,x0,y0,c,r,s,w,fill,edge){const W=c*s,H=r*s,seen=new Set(),key=(x,y)=>Math.round(x*8)+','+Math.round(y*8);
 const starts=[];for(let k=0;k<c;k++){starts.push([s/2+k*s,0,1,1]);}for(let k=0;k<r;k++){starts.push([0,s/2+k*s,1,1]);}
 const loops=[];
 for(const st of starts){if(seen.has(key(st[0],st[1])))continue;let px=st[0],py=st[1],dx=st[2],dy=st[3];if(py===0)dy=1;if(px===0)dx=1;
  const pts=[];for(let n=0;n<400;n++){pts.push([px,py]);seen.add(key(px,py));const tx=dx>0?W-px:px,ty=dy>0?H-py:py,t=Math.min(tx,ty);px+=dx*t;py+=dy*t;
   if(tx<=ty+1e-6)dx=-dx;if(ty<=tx+1e-6)dy=-dy;if(Math.abs(px-st[0])<1e-6&&Math.abs(py-st[1])<1e-6)break;}
  loops.push(pts);}
 const rad=s*.42;g.save();g.translate(x0,y0);
 const pathOf=pts=>{g.beginPath();const n=pts.length;const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s0=m(pts[0],pts[1]);g.moveTo(s0[0],s0[1]);
  for(let i=1;i<=n;i++){const v=pts[i%n],nx=pts[(i+1)%n];g.arcTo(v[0],v[1],nx[0],nx[1],rad);}g.closePath();};
 for(const L of loops)hlRibbon(g,()=>pathOf(L),w,fill,edge);
 // over-crossings: redraw the over strand across every crossing (alternating along each strand)
 const e=Math.max(2,w*.5)/2,hb=(w/2+e)*1.25,hf=hb+w*.35;
 for(let i=1;i<2*c;i++)for(let j=1;j<2*r;j++){if((i-j)%2===0)continue;const x=i*s/2,y=j*s/2;const up=(i%2===0);const d=up?[1,1]:[1,-1];const k=Math.SQRT1_2;
  g.lineCap='butt';g.strokeStyle=edge||HFORM.black;g.lineWidth=w+e*2;g.beginPath();g.moveTo(x-d[0]*k*hb,y-d[1]*k*hb);g.lineTo(x+d[0]*k*hb,y+d[1]*k*hb);g.stroke();
  g.strokeStyle=fill;g.lineWidth=w;g.beginPath();g.moveTo(x-d[0]*k*hf,y-d[1]*k*hf);g.lineTo(x+d[0]*k*hf,y+d[1]*k*hf);g.stroke();}
 g.restore();}
// Braided ring: two strands round a circle, woven — the border of roundels and the tree of life.
function hlBraidRing(g,cx,cy,R,A,n,w,f1,f2){const S=(k,t)=>{const r=R+A*Math.sin(n*t+k*Math.PI);return[cx+r*Math.cos(t),cy+r*Math.sin(t)];};
 for(const k of[0,1])hlRibbon(g,()=>{g.beginPath();for(let i=0;i<=240;i++){const p=S(k,i/240*TAU);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.closePath();},w,k?f2:f1);
 for(let m=0;m<2*n;m++){const t0=m*Math.PI/n,k=m%2;const e=Math.max(2,w*.5)/2;
  for(const [lw,col,span] of[[w+e*2,HFORM.black,.16],[w,k?f2:f1,.24]]){g.beginPath();for(let i=0;i<=8;i++){const p=S(k,t0+(i/8-.5)*span*Math.PI/n*2);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.lineWidth=lw;g.strokeStyle=col;g.lineCap='butt';g.stroke();}}}
// A spiral (for triskeles, cats' haunches, hammer heads)
function hlSpiral(g,cx,cy,r,turns,col,lw,a0,dir){g.beginPath();const N=60;for(let i=0;i<=N;i++){const t=i/N,a=(a0||0)+(dir||1)*t*turns*TAU,rr2=r*(.12+.88*t);const x=cx+Math.cos(a)*rr2,y=cy+Math.sin(a)*rr2;i?g.lineTo(x,y):g.moveTo(x,y);}
 g.lineWidth=lw;g.strokeStyle=col;g.lineCap='round';g.stroke();}
function hlStar4(g,x,y,r,col){g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,q=i%2?r*.3:r;i?g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):g.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}g.closePath();g.fillStyle=col;g.fill();}
function hlCircle(g,x,y,r,fill,line,lw){g.beginPath();g.arc(x,y,r,0,TAU);if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=lw||2;g.strokeStyle=line;g.stroke();}}

// ---------------------------------------------------------------- motifs (unit box 100 x 100 unless noted)
function hlTriskele(g,cols){cols=cols||[HFORM.red,HFORM.teal,HFORM.ochre];
 for(let k=0;k<3;k++){const a=k*TAU/3-Math.PI/2,cx=50+Math.cos(a)*20,cy=50+Math.sin(a)*20;
  hlRibbon(g,()=>{g.beginPath();const N=50;for(let i=0;i<=N;i++){const t=i/N,ang=a+Math.PI*.2+t*2.3*Math.PI,r=2+t*17;const x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;i?g.lineTo(x,y):g.moveTo(x,y);}
   const b=a+TAU/3;g.quadraticCurveTo(50+Math.cos(b)*14,50+Math.sin(b)*14,50,50);},7,cols[k]);}
 hlCircle(g,50,50,6,HFORM.black);hlCircle(g,50,50,2.6,HFORM.white);}
function hlTreeOfLife(g){hlBraidRing(g,50,50,42,3.2,9,4.2,HFORM.red,HFORM.teal);
 const br=(pts,w)=>hlRibbon(g,()=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);},w,HFORM.cedarD);
 for(const s of[-1,1]){for(const [a,c1] of[[-.25,.5],[-.55,.4],[-.9,.25]]){const ta=-Math.PI/2+s*(Math.PI/2+a*Math.PI/2)*.9;const ex=50+Math.cos(ta)*40,ey=50+Math.sin(ta)*40;br([[50,48],[50+s*6,30],[ex-s*10,ey+8],[ex,ey]],4.2);}
  for(const a of[.3,.6]){const ta=Math.PI/2-s*a*Math.PI/2;const ex=50+Math.cos(ta)*40,ey=50+Math.sin(ta)*40;br([[50,62],[50+s*4,74],[ex-s*6,ey-6],[ex,ey]],4);}}
 hlRibbon(g,()=>{g.beginPath();g.moveTo(50,86);g.lineTo(50,40);},9,HFORM.cedarD);
 for(let i=0;i<22;i++){const a=-Math.PI*(.12+.76*h3(i,2,3)),r=16+22*h3(i,5,1);hlOvoid(g,50+Math.cos(a)*r,50+Math.sin(a)*r,6,4.6,HFORM.black,i%3?HFORM.teal:HFORM.ochre,1.2);}}
function hlCat(g){   // Celtic cat sitting, facing +x, tail curling into a spiral knot
 hlRibbon(g,()=>{g.beginPath();g.moveTo(34,88);g.bezierCurveTo(6,92,2,62,18,56);g.bezierCurveTo(32,50,34,70,22,72);g.bezierCurveTo(14,73,14,64,20,63);},5,HFORM.red);
 g.beginPath();g.moveTo(30,90);g.bezierCurveTo(22,70,26,48,44,40);g.quadraticCurveTo(52,34,56,30);g.lineTo(58,10);g.lineTo(65,19);g.lineTo(72,19);g.lineTo(79,10);g.lineTo(80,30);
 g.quadraticCurveTo(82,40,72,44);g.quadraticCurveTo(70,62,74,86);g.lineTo(76,92);g.lineTo(64,92);g.lineTo(62,70);g.quadraticCurveTo(56,82,52,92);g.closePath();hlFill(g,HFORM.black);
 hlSpiral(g,42,72,11,1.6,HFORM.red,3,0,1);hlOvoid(g,62,52,12,9,HFORM.red,HFORM.teal,2);hlUForm(g,50,56,10,8,HFORM.red,2.4);
 g.beginPath();g.ellipse(74,27,4,2.4,0,0,TAU);hlFill(g,HFORM.ochre);g.beginPath();g.ellipse(74,27,1,2.2,0,0,TAU);hlFill(g,HFORM.black);
 for(const s of[-1,1]){g.beginPath();g.moveTo(80,34);g.lineTo(92,32+s*3);hlLine(g,HFORM.white,.8);}}
function hlWolf(g){   // wolf loping, facing +x, box 200 x 100: long legs, deep chest, bushy tail held low
 g.beginPath();g.moveTo(48,40);g.bezierCurveTo(74,28,116,28,140,34);g.quadraticCurveTo(150,28,158,26);g.lineTo(162,10);g.lineTo(170,22);g.lineTo(176,22);g.lineTo(198,34);g.lineTo(194,38);g.lineTo(178,40);g.lineTo(188,46);
 g.lineTo(170,48);g.quadraticCurveTo(160,50,154,58);g.lineTo(168,88);g.lineTo(176,90);g.lineTo(174,95);g.lineTo(158,94);g.lineTo(140,62);g.quadraticCurveTo(106,64,80,58);
 g.lineTo(62,84);g.lineTo(40,92);g.lineTo(36,88);g.lineTo(52,78);g.lineTo(56,56);g.quadraticCurveTo(48,52,48,46);g.bezierCurveTo(30,50,18,62,8,76);g.bezierCurveTo(22,74,36,64,50,54);g.closePath();hlFill(g,HFORM.black);
 hlOvoid(g,146,44,20,15,HFORM.red,HFORM.teal,2.5);hlOvoid(g,66,46,20,15,HFORM.red,HFORM.teal,2.5);hlUForm(g,106,42,26,11,HFORM.red,3.5);hlUForm(g,156,74,7,12,HFORM.red,2.4);hlUForm(g,58,70,7,12,HFORM.red,2.4);
 hlOvoid(g,172,28,8,6,null,HFORM.white);hlOvoid(g,173,28.5,4,3,null,HFORM.black);g.beginPath();g.moveTo(184,42);g.lineTo(195,37);hlLine(g,HFORM.red,2);
 hlSplitU(g,26,64,7,12,HFORM.red,2.4);}
function hlHammer(g){   // Mjölnir with a plaited handle and spiral head
 g.save();g.beginPath();g.moveTo(42,54);g.lineTo(20,54);g.quadraticCurveTo(10,54,9,64);g.lineTo(12,82);g.quadraticCurveTo(30,74,50,94);g.quadraticCurveTo(70,74,88,82);g.lineTo(91,64);g.quadraticCurveTo(90,54,80,54);g.lineTo(58,54);
 g.lineTo(58,16);g.lineTo(42,16);g.closePath();hlFill(g,HFORM.black);g.clip();hlPlait(g,40,14,1,5,8.4,3.2,HFORM.ochre);g.restore();
 hlSpiral(g,22,66,9,1.5,HFORM.red,3,Math.PI,1);hlSpiral(g,78,66,9,1.5,HFORM.red,3,0,-1);hlOvoid(g,50,70,14,10,HFORM.ochre,HFORM.teal,2);
 hlRibbon(g,()=>{g.beginPath();g.arc(50,10,6,0,TAU);},3,HFORM.red);}
function hlGrain(g){   // a wheat sheaf tied with a red band
 for(let k=-3;k<=3;k++){const tx=50+k*9,ty=18+Math.abs(k)*4;g.beginPath();g.moveTo(50+k*2,86);g.quadraticCurveTo(50+k*2.5,60,tx,ty+14);hlLine(g,HFORM.black,2.2);
  for(let i=0;i<6;i++){const y=ty+i*4.4;for(const s of[-1,1]){g.beginPath();g.ellipse(tx+s*3,y+2,2.6,4.4,s*.5,0,TAU);g.fillStyle=HFORM.ochre;g.fill();g.lineWidth=1;g.strokeStyle=HFORM.black;g.stroke();}}
  g.beginPath();g.moveTo(tx,ty);g.lineTo(tx+k*.6,ty-10);hlLine(g,HFORM.black,1);}
 g.beginPath();g.ellipse(50,68,14,5,0,0,TAU);hlFill(g,HFORM.red);hlLine(g,HFORM.black,2);g.beginPath();g.moveTo(40,68);g.lineTo(60,68);hlLine(g,HFORM.ochre,1.4);}
function hlRocket(g){   // a rocket climbing among stars — Raketstad's own sign
 for(const [x,y,r] of[[14,18,5],[84,24,6],[20,60,4],[86,70,5],[12,86,3]])hlStar4(g,x,y,r,HFORM.ochre);
 g.beginPath();g.moveTo(50,4);g.bezierCurveTo(64,16,64,40,62,70);g.lineTo(38,70);g.bezierCurveTo(36,40,36,16,50,4);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
 g.beginPath();g.moveTo(50,4);g.bezierCurveTo(58,10,60,16,61,22);g.lineTo(39,22);g.bezierCurveTo(40,16,42,10,50,4);hlFill(g,HFORM.red);hlLine(g,HFORM.black,2);
 for(const s of[-1,1]){g.beginPath();g.moveTo(50+s*11,52);g.quadraticCurveTo(50+s*24,62,50+s*24,80);g.lineTo(50+s*12,70);g.closePath();hlFill(g,HFORM.teal);hlLine(g,HFORM.black,2);}
 hlCircle(g,50,36,6.5,HFORM.teal,HFORM.black,3);hlCircle(g,50,36,2.6,HFORM.white);hlUForm(g,50,56,12,8,HFORM.red,2.6);
 g.beginPath();g.moveTo(40,70);g.quadraticCurveTo(50,100,60,70);hlFill(g,HFORM.ochre);g.beginPath();g.moveTo(44,70);g.quadraticCurveTo(50,90,56,70);hlFill(g,HFORM.red);}
function hlMoth(g){   // symmetric moth, formline eyespots
 hlMirror(g,100,100,50,g=>{g.beginPath();g.moveTo(48,38);g.bezierCurveTo(34,20,12,12,4,22);g.bezierCurveTo(2,34,8,46,47,54);g.closePath();hlFill(g,HFORM.teal);hlLine(g,HFORM.black,3);
  g.beginPath();g.moveTo(47,54);g.bezierCurveTo(24,56,12,70,20,82);g.bezierCurveTo(30,90,44,80,48,62);g.closePath();hlFill(g,HFORM.red);hlLine(g,HFORM.black,3);
  hlEye(g,24,32,16,11,HFORM.ochre);hlUForm(g,30,70,10,10,HFORM.black,2.4);hlTrigon(g,10,24,6,HFORM.white);
  g.beginPath();g.moveTo(48,26);g.quadraticCurveTo(44,10,34,6);hlLine(g,HFORM.black,1.6);hlCircle(g,34,6,1.8,HFORM.black);});
 g.beginPath();g.ellipse(50,52,4.5,24,0,0,TAU);hlFill(g,HFORM.black);hlCircle(g,50,26,5,HFORM.black);for(let i=0;i<4;i++){g.beginPath();g.moveTo(46,44+i*6);g.lineTo(54,44+i*6);hlLine(g,HFORM.ochre,1.4);}}
function hlWarrior(g,flip){   // a Norse warrior in profile: helm, round shield (triskele), spear — no face drawn
 g.save();if(flip){g.translate(100,0);g.scale(-1,1);}
 g.beginPath();g.moveTo(58,6);g.lineTo(58,94);hlLine(g,HFORM.black,2.4);g.beginPath();g.moveTo(58,2);g.lineTo(55,10);g.lineTo(58,14);g.lineTo(61,10);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,1.2);
 g.beginPath();g.moveTo(40,92);g.lineTo(46,62);g.lineTo(52,92);hlLine(g,HFORM.black,5);
 g.beginPath();g.moveTo(34,64);g.lineTo(38,34);g.lineTo(56,32);g.lineTo(60,64);g.closePath();hlFill(g,HFORM.red);hlLine(g,HFORM.black,2.4);
 g.beginPath();g.moveTo(38,34);g.quadraticCurveTo(20,50,24,74);g.lineTo(36,64);hlFill(g,HFORM.teal);hlLine(g,HFORM.black,2);
 g.beginPath();g.moveTo(55,40);g.lineTo(60,46);hlLine(g,HFORM.black,5);
 g.beginPath();g.arc(47,22,9,Math.PI,0);g.lineTo(56,28);g.lineTo(38,28);g.closePath();hlFill(g,HFORM.black);g.fillStyle=HFORM.ochre;g.fillRect(38,21,18,2.4);g.fillRect(52,21,2.4,9);
 g.beginPath();g.ellipse(47,31,7,5,0,0,Math.PI);hlFill(g,HFORM.cedarD);
 g.save();g.translate(42,50);g.scale(.36,.36);g.translate(-50,-50);hlCircle(g,50,50,48,HFORM.white,HFORM.black,6);hlTriskele(g,[HFORM.red,HFORM.teal,HFORM.black]);g.restore();
 g.restore();}
function hlSun(g){for(let i=0;i<16;i++){const a=i/16*TAU;g.save();g.translate(50,50);g.rotate(a);
  if(i%2){g.beginPath();g.moveTo(-6,-30);g.lineTo(0,-49);g.lineTo(6,-30);g.closePath();hlFill(g,HFORM.red);hlLine(g,HFORM.black,1.6);}
  else{hlUForm(g,0,-38,8,12,HFORM.ochre,2.6);}g.restore();}
 hlCircle(g,50,50,27,HFORM.ochre,HFORM.black,3.4);hlCircle(g,50,50,19,HFORM.black);hlCircle(g,50,50,15,HFORM.ochre);
 g.save();g.translate(50,50);g.scale(.26,.26);g.translate(-50,-50);hlTriskele(g,[HFORM.red,HFORM.teal,HFORM.red]);g.restore();}
// crescent path: the part of circle (cx,cy,R) outside circle (ox,oy,r)
function hlCrescent(g,cx,cy,R,ox,oy,r){const dx=ox-cx,dy=oy-cy,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d;const a=(R*R-r*r+d*d)/(2*d),hh=Math.sqrt(Math.max(0,R*R-a*a));
 const bx=cx+ux*a,by=cy+uy*a,p1=[bx-uy*hh,by+ux*hh],p2=[bx+uy*hh,by-ux*hh];const t1=Math.atan2(p1[1]-cy,p1[0]-cx),t2=Math.atan2(p2[1]-cy,p2[0]-cx);
 const s1=Math.atan2(p1[1]-oy,p1[0]-ox),s2=Math.atan2(p2[1]-oy,p2[0]-ox);
 g.beginPath();g.arc(cx,cy,R,t2,t1,true);g.arc(ox,oy,r,s1,s2,false);g.closePath();}
function hlMoon(g){for(const [x,y,r] of[[78,22,6],[86,52,4],[70,82,5],[20,14,3]])hlStar4(g,x,y,r,HFORM.ochre);
 hlCrescent(g,44,50,38,62,40,31);hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
 g.save();hlCrescent(g,44,50,38,62,40,31);g.clip();hlSplitU(g,17,56,9,14,HFORM.teal,2.6);hlUForm(g,32,80,12,8,HFORM.red,2.6);hlOvoid(g,16,38,7,5,HFORM.black,HFORM.teal,1.4);g.restore();}
function hlStar8(g){g.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU-Math.PI/2,r=i%2?26:46;const x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);
 for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2;g.save();g.translate(50+Math.cos(a)*30,50+Math.sin(a)*30);g.rotate(a+Math.PI/2);hlUForm(g,0,0,7,8,HFORM.red,2);g.restore();}
 hlCircle(g,50,50,17,HFORM.teal,HFORM.black,3);hlStar4(g,50,50,12,HFORM.white);}
function hlGasGiant(g){for(const [x,y,r] of[[10,12,4],[90,16,5],[86,86,4],[14,84,3],[62,8,3]])hlStar4(g,x,y,r,HFORM.ochre);
 const ring=(back)=>{g.beginPath();g.ellipse(50,52,46,11,-.28,back?Math.PI:0,back?TAU:Math.PI);g.lineWidth=5;g.strokeStyle=HFORM.black;g.stroke();g.lineWidth=2.6;g.strokeStyle=HFORM.ochre;g.stroke();};
 ring(true);g.save();g.beginPath();g.arc(50,52,30,0,TAU);g.clip();const B=['#9cc4a4','#5f927a','#c3dcb8',HFORM.teal,'#7aa888','#b4d0a4','#4f7e68','#8fb896'];   // the giant is greenish, as it hangs in the sky
 for(let i=0;i<B.length;i++){g.fillStyle=B[i];g.beginPath();const y0=22+i*7.6;g.moveTo(10,y0);for(let x=10;x<=90;x+=4)g.lineTo(x,y0+Math.sin(x*.14+i)*1.6);g.lineTo(90,y0+9);g.lineTo(10,y0+9);g.fill();}
 hlOvoid(g,62,60,10,6,HFORM.black,HFORM.tealD,1.4);g.restore();hlCircle(g,50,52,30,null,HFORM.black,3);ring(false);
 hlCircle(g,16,40,5,HFORM.white,HFORM.black,1.6);hlCircle(g,84,74,3.4,HFORM.teal,HFORM.black,1.4);}
// THE REPUBLIC: three arms in a triskelion. Each upper arm runs out from the centre, bends 90° at the elbow, and the
// fist holds its sword at a right angle to the forearm, blade out toward the rim (Travis's crest reference).
function hlEmblem(g,bg){hlCircle(g,50,50,48,bg||HFORM.ochre,HFORM.black,4);hlBraidRing(g,50,50,43,2.2,12,2.6,HFORM.red,HFORM.black);
 for(let k=0;k<3;k++){g.save();g.translate(50,50);g.rotate(k*TAU/3);g.scale(.86,.86);
  // sword first (the fist closes over the grip): blade radial, outward; guard across it; pommel below the fist
  g.fillStyle=HFORM.white;g.beginPath();g.moveTo(13.3,-25);g.lineTo(13.3,-43);g.lineTo(16,-48);g.lineTo(18.7,-43);g.lineTo(18.7,-25);g.closePath();g.fill();g.lineWidth=1.6;g.strokeStyle=HFORM.black;g.stroke();
  g.beginPath();g.moveTo(16,-27);g.lineTo(16,-42);hlLine(g,'#9aa6a8',1);
  g.fillStyle=HFORM.ochre;g.beginPath();g.moveTo(8,-26.5);g.quadraticCurveTo(16,-24,24,-26.5);g.lineTo(24,-23.5);g.quadraticCurveTo(16,-21,8,-23.5);g.closePath();g.fill();g.lineWidth=1.2;g.stroke();
  hlCircle(g,16,-14.5,2.6,HFORM.ochre,HFORM.black,1.2);
  hlRibbon(g,()=>{g.beginPath();g.moveTo(0,-2);g.lineTo(0,-20);g.lineTo(11,-20);},8.5,HFORM.red);                  // upper arm out, forearm bent 90°
  g.fillStyle=HFORM.teal;g.fillRect(8.5,-24.6,3.4,9.2);g.lineWidth=1.2;g.strokeStyle=HFORM.black;g.strokeRect(8.5,-24.6,3.4,9.2);   // cuff
  g.beginPath();g.ellipse(16,-20,4.6,5.4,0,0,TAU);hlFill(g,'#e8d2a8');hlLine(g,HFORM.black,1.6);                    // fist round the grip
  for(let i=0;i<3;i++){g.beginPath();g.moveTo(17.5,-23+i*2.6);g.lineTo(20.2,-23+i*2.6);hlLine(g,HFORM.black,.8);}
  g.restore();}
 hlCircle(g,50,50,8,HFORM.black);hlCircle(g,50,50,4,HFORM.ochre);}

// ---------------------------------------------------------------- shop-sign symbols (unit 100, drawn inside a roundel)
const HSIGN={
 tankard:g=>{g.beginPath();g.rect(28,30,34,50);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);g.beginPath();g.arc(66,54,12,-Math.PI/2,Math.PI/2);hlLine(g,HFORM.black,5);
  g.beginPath();g.moveTo(26,32);for(let i=0;i<5;i++)g.arc(30+i*8,28,5,Math.PI,0);g.lineTo(64,34);hlFill(g,HFORM.white);hlLine(g,HFORM.black,2);for(const y of[44,68]){g.fillStyle=HFORM.red;g.fillRect(28,y,34,4);}},
 key:g=>{hlRibbon(g,()=>{g.beginPath();g.arc(30,50,14,0,TAU);},6,HFORM.ochre);hlRibbon(g,()=>{g.beginPath();g.moveTo(44,50);g.lineTo(84,50);g.moveTo(74,50);g.lineTo(74,62);g.moveTo(82,50);g.lineTo(82,60);},6,HFORM.ochre);hlCircle(g,30,50,4,HFORM.red);},
 bread:g=>{g.beginPath();g.ellipse(50,56,36,20,0,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);for(const x of[32,44,56,68]){g.beginPath();g.moveTo(x-5,48);g.lineTo(x+5,62);hlLine(g,HFORM.cedarD,3);}hlStar4(g,50,24,6,HFORM.red);},
 anvil:g=>{g.beginPath();g.moveTo(14,40);g.lineTo(80,40);g.quadraticCurveTo(90,40,88,50);g.lineTo(64,54);g.lineTo(60,68);g.lineTo(70,80);g.lineTo(30,80);g.lineTo(40,68);g.lineTo(36,54);g.quadraticCurveTo(18,52,14,40);hlFill(g,HFORM.black);
  g.save();g.translate(58,26);g.rotate(-.5);g.fillStyle=HFORM.red;g.fillRect(-4,-4,30,7);g.fillStyle=HFORM.ochre;g.fillRect(-12,-10,12,18);g.restore();},
 axe:g=>{g.beginPath();g.moveTo(30,86);g.lineTo(62,18);hlLine(g,HFORM.cedarD,6);g.beginPath();g.moveTo(52,20);g.quadraticCurveTo(76,6,86,26);g.quadraticCurveTo(76,34,64,40);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
  g.save();g.translate(50,60);g.rotate(.6);g.fillStyle=HFORM.teal;g.fillRect(-30,-4,60,9);for(let i=0;i<10;i++){g.beginPath();g.moveTo(-30+i*6,5);g.lineTo(-27+i*6,10);g.lineTo(-24+i*6,5);hlFill(g,HFORM.black);}g.restore();},
 wheel:g=>{hlCircle(g,50,50,34,null,HFORM.black,9);hlCircle(g,50,50,34,null,HFORM.ochre,4);for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(50,50);g.lineTo(50+Math.cos(a)*32,50+Math.sin(a)*32);hlLine(g,HFORM.black,4);}hlCircle(g,50,50,8,HFORM.red,HFORM.black,3);},
 barrel:g=>{g.beginPath();g.moveTo(30,18);g.quadraticCurveTo(20,50,30,82);g.lineTo(70,82);g.quadraticCurveTo(80,50,70,18);g.closePath();hlFill(g,HFORM.cedar);hlLine(g,HFORM.black,3);
  for(const y of[28,72]){g.beginPath();g.moveTo(26,y);g.lineTo(74,y);hlLine(g,HFORM.black,5);}for(const x of[40,50,60]){g.beginPath();g.moveTo(x,20);g.lineTo(x,80);hlLine(g,HFORM.cedarD,1.5);}hlOvoid(g,50,50,14,10,HFORM.black,HFORM.teal,2);},
 scales:g=>{g.beginPath();g.moveTo(50,12);g.lineTo(50,80);g.moveTo(20,26);g.lineTo(80,26);g.moveTo(34,82);g.lineTo(66,82);hlLine(g,HFORM.black,4);
  for(const s of[-1,1]){g.beginPath();g.moveTo(50+s*30,26);g.lineTo(50+s*20,52);g.moveTo(50+s*30,26);g.lineTo(50+s*40,52);hlLine(g,HFORM.black,1.6);g.beginPath();g.arc(50+s*30,52,11,0,Math.PI);hlFill(g,s<0?HFORM.red:HFORM.teal);hlLine(g,HFORM.black,2);}},
 horse:g=>{g.beginPath();g.moveTo(34,88);g.quadraticCurveTo(30,50,46,30);g.lineTo(50,14);g.lineTo(56,26);g.quadraticCurveTo(72,30,86,56);g.lineTo(80,64);g.quadraticCurveTo(68,58,62,52);g.quadraticCurveTo(66,72,72,88);g.closePath();hlFill(g,HFORM.black);
  hlOvoid(g,60,38,8,6,null,HFORM.white);hlOvoid(g,61,38.5,4,3,null,HFORM.black);hlRibbon(g,()=>{g.beginPath();g.moveTo(44,32);g.quadraticCurveTo(30,50,34,80);},3,HFORM.red);hlUForm(g,54,66,10,10,HFORM.teal,2.6);},
 sack:g=>{g.beginPath();g.moveTo(40,24);g.quadraticCurveTo(18,50,26,82);g.lineTo(74,82);g.quadraticCurveTo(82,50,60,24);g.closePath();hlFill(g,'#d9b48a');hlLine(g,HFORM.black,3);
  g.beginPath();g.moveTo(38,24);g.lineTo(62,24);hlLine(g,HFORM.red,5);g.beginPath();g.moveTo(44,22);g.lineTo(40,10);g.moveTo(56,22);g.lineTo(60,10);hlLine(g,HFORM.black,2.4);hlStar4(g,50,58,10,HFORM.red);},
 gear:g=>{g.beginPath();for(let i=0;i<24;i++){const a=i/24*TAU,r=(i%2)?30:38;const x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);
  hlCircle(g,50,50,18,HFORM.teal,HFORM.black,3);hlCircle(g,50,50,6,HFORM.black);},
 flask:g=>{g.beginPath();g.moveTo(44,14);g.lineTo(44,40);g.quadraticCurveTo(20,52,24,72);g.quadraticCurveTo(30,90,50,90);g.quadraticCurveTo(70,90,76,72);g.quadraticCurveTo(80,52,56,40);g.lineTo(56,14);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
  g.save();g.clip();g.fillStyle=HFORM.red;g.fillRect(0,62,100,40);g.restore();hlCircle(g,40,72,3,HFORM.ochre);hlCircle(g,56,78,4,HFORM.ochre);hlStar4(g,76,22,10,HFORM.ochre);hlStar4(g,24,26,6,HFORM.red);},
 sheaf:g=>hlGrain(g),
 swords:g=>{for(const s of[-1,1]){g.save();g.translate(50,52);g.rotate(s*.7);g.fillStyle=HFORM.white;g.beginPath();g.moveTo(-3,-38);g.lineTo(0,-44);g.lineTo(3,-38);g.lineTo(3,20);g.lineTo(-3,20);g.closePath();g.fill();g.lineWidth=1.6;g.strokeStyle=HFORM.black;g.stroke();
  g.fillStyle=HFORM.ochre;g.fillRect(-10,20,20,4);g.fillStyle=HFORM.cedarD;g.fillRect(-2.5,24,5,12);hlCircle(g,0,38,3.4,HFORM.red,HFORM.black,1);g.restore();}},
 boot:g=>{g.beginPath();g.moveTo(34,14);g.lineTo(58,14);g.lineTo(58,60);g.quadraticCurveTo(84,62,86,80);g.lineTo(30,80);g.closePath();hlFill(g,HFORM.cedarD);hlLine(g,HFORM.black,3);g.fillStyle=HFORM.black;g.fillRect(28,78,60,7);g.fillStyle=HFORM.red;g.fillRect(34,22,24,5);},
 shears:g=>{for(const s of[-1,1]){g.save();g.translate(50,54);g.rotate(s*.35);g.beginPath();g.moveTo(-3,0);g.lineTo(0,-44);g.lineTo(4,0);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,1.6);hlRibbon(g,()=>{g.beginPath();g.arc(0,16,8,0,TAU);},4,s<0?HFORM.red:HFORM.teal);g.restore();}},
 fish:g=>hlIn(g,4,22,92,56,200,80,hlSalmon),
 pig:g=>{g.beginPath();g.ellipse(46,54,32,20,0,0,TAU);hlFill(g,'#e0a898');hlLine(g,HFORM.black,3);g.beginPath();g.ellipse(80,50,8,9,0,0,TAU);hlFill(g,'#e0a898');hlLine(g,HFORM.black,2.4);
  for(const x of[28,40,56,66]){g.fillStyle=HFORM.black;g.fillRect(x,70,5,12);}g.beginPath();g.moveTo(68,36);g.lineTo(72,24);g.lineTo(76,38);hlFill(g,HFORM.red);hlOvoid(g,70,44,5,4,null,HFORM.black);hlSpiral(g,12,46,5,1.2,HFORM.black,2);},
 candle:g=>{g.fillStyle=HFORM.white;g.fillRect(40,38,20,48);g.lineWidth=3;g.strokeStyle=HFORM.black;g.strokeRect(40,38,20,48);g.beginPath();g.moveTo(50,14);g.quadraticCurveTo(62,28,50,36);g.quadraticCurveTo(38,28,50,14);hlFill(g,HFORM.ochre);hlLine(g,HFORM.red,2);g.fillStyle=HFORM.red;g.fillRect(34,84,32,6);},
 book:g=>{for(const s of[-1,1]){g.beginPath();g.moveTo(50,30);g.quadraticCurveTo(50+s*20,22,50+s*40,28);g.lineTo(50+s*40,78);g.quadraticCurveTo(50+s*20,72,50,80);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
  for(let i=0;i<4;i++){g.beginPath();g.moveTo(50+s*8,40+i*8);g.lineTo(50+s*32,38+i*8);hlLine(g,i%2?HFORM.red:HFORM.teal,2);}}},
 mortar:g=>{g.beginPath();g.moveTo(22,46);g.lineTo(78,46);g.quadraticCurveTo(76,80,50,82);g.quadraticCurveTo(24,80,22,46);hlFill(g,HFORM.teal);hlLine(g,HFORM.black,3);g.beginPath();g.moveTo(52,46);g.lineTo(76,14);hlLine(g,HFORM.black,8);hlLine(g,HFORM.ochre,4);
  for(const s of[-1,1]){g.beginPath();g.ellipse(50+s*16,32,8,4,s*.5,0,TAU);hlFill(g,'#5f9a4a');hlLine(g,HFORM.black,1.4);}},
 hammer:g=>hlHammer(g),
 rocket:g=>hlRocket(g),
 star:g=>hlStar8(g),
 salvage:g=>{g.beginPath();g.moveTo(22,24);g.lineTo(70,18);g.lineTo(78,64);g.lineTo(30,74);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);   // an Ancient panel, a crowbar across it
  for(const [x,y] of[[28,30],[64,25],[71,58],[34,66]])hlCircle(g,x,y,2.2,HFORM.teal,HFORM.black,1);g.beginPath();g.moveTo(40,34);g.lineTo(62,31);g.moveTo(42,48);g.lineTo(66,44);hlLine(g,'#9aa6a8',2);
  g.save();g.translate(50,56);g.rotate(-.7);g.fillStyle=HFORM.red;g.fillRect(-36,-3.5,64,7);g.lineWidth=2;g.strokeStyle=HFORM.black;g.strokeRect(-36,-3.5,64,7);g.beginPath();g.moveTo(28,-3.5);g.quadraticCurveTo(40,-6,38,8);g.lineTo(32,6);g.quadraticCurveTo(33,2,28,3.5);hlFill(g,HFORM.red);hlLine(g,HFORM.black,2);g.restore();},
 bed:g=>{g.fillStyle=HFORM.cedarD;g.fillRect(14,52,72,18);g.fillRect(14,36,8,44);g.fillRect(78,46,8,34);g.fillStyle=HFORM.white;g.fillRect(24,44,20,10);g.fillStyle=HFORM.red;g.fillRect(40,46,38,8);hlStar4(g,70,22,8,HFORM.ochre);g.beginPath();g.arc(32,20,9,.5,5.5);g.arc(36,17,8,5.2,.9,true);hlFill(g,HFORM.white);},
};

// ---------------------------------------------------------------- composing the textures
const HMOTIF={wide:[],gable:[],tall:[],disc:[],sign:{},pillar:[]};
function hlMakeTex(w,h,fn,alpha){const t=canvasTex(w,h,(g,W,H)=>{if(alpha)g.clearRect(0,0,W,H);fn(g,W,H);});return t;}
function hlMotifItem(kind,name,tex,alpha,box){const m=hStd({map:tex,roughness:.8});if(alpha){m.alphaTest=.5;}const k='hM_'+kind+'_'+name;MAT[k]=m;kdef(k,box?VBOX:VPLANE,m);return k;}
const HBG={cedar:(g,w,h)=>hlCedar(g,w,h,HFORM.cedar,false),cedarV:(g,w,h)=>hlCedar(g,w,h,HFORM.cedar,true),white:(g,w,h)=>{g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);},
 pale:(g,w,h)=>{g.fillStyle='#bfd9d2';g.fillRect(0,0,w,h);},dark:(g,w,h)=>hlCedar(g,w,h,HFORM.cedarD,false)};
const hlFrame=(g,w,h)=>{g.lineWidth=h*.035;g.strokeStyle=HFORM.black;g.strokeRect(h*.018,h*.018,w-h*.036,h-h*.036);};
// wide murals (512 x 256)
const HWIDE={
 wolves:(g,w,h)=>{HBG.cedar(g,w,h);hlIn(g,w*.01,h*.16,w*.35,h*.7,200,100,hlWolf);g.save();g.translate(w,0);g.scale(-1,1);hlIn(g,w*.01,h*.16,w*.35,h*.7,200,100,hlWolf);g.restore();hlIn(g,w/2-h*.34,h*.16,h*.68,h*.68,100,100,hlTriskele);hlFrame(g,w,h);},
 cats:(g,w,h)=>{HBG.white(g,w,h);hlIn(g,w*.02,h*.14,h*.76,h*.76,100,100,hlCat);g.save();g.translate(w,0);g.scale(-1,1);hlIn(g,w*.02,h*.14,h*.76,h*.76,100,100,hlCat);g.restore();hlIn(g,w/2-h*.4,h*.1,h*.8,h*.8,100,100,hlTreeOfLife);hlFrame(g,w,h);},
 knot:(g,w,h)=>{HBG.dark(g,w,h);hlPlait(g,w*.04,h*.1,12,3,w*.92/12,w*.022,HFORM.ochre);hlFrame(g,w,h);},
 knotRed:(g,w,h)=>{HBG.white(g,w,h);hlPlait(g,w*.05,h*.12,10,3,w*.9/10,w*.026,HFORM.red);hlFrame(g,w,h);},
 heavens:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);const f=[hlSun,hlMoon,hlStar8,hlGasGiant];f.forEach((fn,i)=>hlIn(g,w*(.02+i*.245),h*.14,w*.225,h*.72,100,100,fn));hlFrame(g,w,h);},
 grain:(g,w,h)=>{HBG.pale(g,w,h);hlIn(g,w*.04,h*.1,h*.8,h*.8,100,100,hlGrain);hlIn(g,w-w*.04-h*.8,h*.1,h*.8,h*.8,100,100,hlGrain);hlIn(g,w/2-h*.42,h*.08,h*.84,h*.84,100,100,hlSun);hlFrame(g,w,h);},
 rocket:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);hlIn(g,w*.04,h*.1,h*.8,h*.8,100,100,hlGasGiant);hlIn(g,w/2-h*.45,h*.05,h*.9,h*.9,100,100,hlRocket);hlIn(g,w-w*.04-h*.8,h*.1,h*.8,h*.8,100,100,hlMoon);hlFrame(g,w,h);},
 warriors:(g,w,h)=>{HBG.cedar(g,w,h);hlIn(g,w*.1,h*.06,h*.9,h*.9,100,100,g=>hlWarrior(g,false));hlIn(g,w-w*.1-h*.9,h*.06,h*.9,h*.9,100,100,g=>hlWarrior(g,true));hlIn(g,w/2-h*.4,h*.1,h*.8,h*.8,100,100,hlHammer);hlFrame(g,w,h);},
 moth:(g,w,h)=>{HBG.white(g,w,h);hlIn(g,w/2-h*.5,h*.02,h,h*.96,100,100,hlMoth);for(const x of[.03,.83])hlPlait(g,w*x,h*.2,2,4,w*.07,w*.018,HFORM.red);hlFrame(g,w,h);},
 hammer:(g,w,h)=>{HBG.pale(g,w,h);hlPlait(g,w*.04,h*.28,4,1,w*.065,w*.02,HFORM.red);hlPlait(g,w*.7,h*.28,4,1,w*.065,w*.02,HFORM.red);hlPlait(g,w*.04,h*.56,4,1,w*.065,w*.02,HFORM.teal);hlPlait(g,w*.7,h*.56,4,1,w*.065,w*.02,HFORM.teal);
  hlIn(g,w/2-h*.45,h*.05,h*.9,h*.9,100,100,hlHammer);hlFrame(g,w,h);},
};
// gable crests (512 x 256, meant for the triangle of a gable end)
const HGABLE={
 risingSun:(g,w,h)=>{HBG.cedar(g,w,h);g.save();g.beginPath();g.rect(0,0,w,h*.8);g.clip();hlIn(g,w/2-h*.8,h*.02,h*1.6,h*1.6,100,100,hlSun);g.restore();hlPlait(g,0,h*.8,16,1,w/16,w*.014,HFORM.red);},
 moth:(g,w,h)=>{HBG.cedar(g,w,h);hlIn(g,w/2-h*.52,h*.02,h*1.04,h*.96,100,100,hlMoth);},
 tree:(g,w,h)=>{HBG.pale(g,w,h);hlIn(g,w/2-h*.48,h*.02,h*.96,h*.96,100,100,hlTreeOfLife);for(const s of[-1,1])hlIn(g,w/2+s*h*.62-h*.3,h*.3,h*.6,h*.6,100,100,s<0?hlStar8:hlMoon);},
 triskele:(g,w,h)=>{HBG.dark(g,w,h);hlIn(g,w/2-h*.46,h*.04,h*.92,h*.92,100,100,hlTriskele);hlIn(g,w*.02,h*.35,w*.3,h*.6,200,100,hlWolf);g.save();g.translate(w,0);g.scale(-1,1);hlIn(g,w*.02,h*.35,w*.3,h*.6,200,100,hlWolf);g.restore();},
 giant:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);hlIn(g,w/2-h*.46,h*.04,h*.92,h*.92,100,100,hlGasGiant);hlIn(g,w*.16,h*.4,h*.5,h*.5,100,100,hlStar8);hlIn(g,w*.84-h*.5,h*.4,h*.5,h*.5,100,100,hlMoon);},
};
// tall boards (128 x 512)
const HTALL={
 knot:(g,w,h)=>{HBG.dark(g,w,h);hlPlait(g,w*.1,h*.03,2,8,w*.4,w*.1,HFORM.ochre);},
 knotTeal:(g,w,h)=>{HBG.cedarV(g,w,h);hlPlait(g,w*.1,h*.03,2,8,w*.4,w*.1,HFORM.teal);},
 heavens:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);[hlSun,hlStar8,hlMoon,hlGasGiant].forEach((fn,i)=>hlIn(g,w*.06,h*(.01+i*.25),w*.88,w*.88,100,100,fn));},
 tree:(g,w,h)=>{HBG.pale(g,w,h);hlIn(g,w*.04,h*.02,w*.92,w*.92,100,100,hlTreeOfLife);hlPlait(g,w*.1,h*.26,2,4,w*.4,w*.1,HFORM.red);hlIn(g,w*.04,h*.64,w*.92,w*.92,100,100,hlTriskele);},
};
// roundels (256, alpha outside the disc) — the medallion versions of every motif, for bosses and pillar tops
const HDISC={triskele:hlTriskele,tree:hlTreeOfLife,cat:hlCat,hammer:hlHammer,grain:hlGrain,rocket:hlRocket,moth:hlMoth,sun:hlSun,moon:hlMoon,star:hlStar8,giant:hlGasGiant,wolf:g=>hlIn(g,4,24,92,52,200,100,hlWolf),warrior:g=>hlWarrior(g,false)};
function hlRoundel(g,W,fn,bg,ring){const c=W/2;g.save();g.beginPath();g.arc(c,c,c*.98,0,TAU);g.clip();g.fillStyle=bg;g.fillRect(0,0,W,W);g.restore();
 hlIn(g,W*.16,W*.16,W*.68,W*.68,100,100,fn);hlIn(g,0,0,W,W,100,100,g=>hlBraidRing(g,50,50,44,2.4,ring||10,3,HFORM.red,HFORM.teal));hlCircle(g,c,c,c*.97,null,HFORM.black,W*.03);}
// carved pillars (256 x 1024 per face): four motifs stacked like a totem, with plaited bands between
function hlPillarTex(motifs,bgKind){return canvasTex(256,1024,(g,w,h)=>{(bgKind==='dark'?HBG.dark:HBG.cedarV)(g,w,h);const cell=h/4;
 motifs.forEach((fn,i)=>{const y=i*cell;hlIn(g,w*.08,y+cell*.14,w*.84,w*.84,100,100,fn);hlPlait(g,w*.02,y+cell-cell*.14,6,1,w*.96/6,w*.028,i%2?HFORM.red:HFORM.ochre);});
 g.fillStyle=HFORM.black;g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);});}

// ---------------------------------------------------------------- the textures and kit items
for(const n in HWIDE){HMOTIF.wide.push(hlMotifItem('w',n,hlMakeTex(512,256,HWIDE[n])));}
for(const n in HGABLE){HMOTIF.gable.push(hlMotifItem('g',n,hlMakeTex(512,256,HGABLE[n])));}
for(const n in HTALL){HMOTIF.tall.push(hlMotifItem('t',n,hlMakeTex(128,512,HTALL[n])));}
{const bgs=[HFORM.white,HFORM.cedar,'#bfd9d2',HFORM.ochre];let i=0;for(const n in HDISC){const b=bgs[i++%bgs.length];HMOTIF.disc.push(hlMotifItem('d',n,hlMakeTex(256,256,(g,W)=>hlRoundel(g,W,HDISC[n],b),true),true));}}
{const bgs=[HFORM.white,'#e6c98e','#bfd9d2',HFORM.cedar];let i=0;for(const n in HSIGN){const b=bgs[i++%bgs.length];HMOTIF.sign[n]=hlMotifItem('sign',n,hlMakeTex(256,256,(g,W)=>hlRoundel(g,W,HSIGN[n],b,8),true),true);}}
HMOTIF.emblem=hlMotifItem('d','emblem',hlMakeTex(256,256,(g,W)=>hlIn(g,0,0,W,W,100,100,hlEmblem),true),true);
// the wide crest version of the emblem: the arms on a red field between knot panels (over civic doors)
HMOTIF.emblemWide=hlMotifItem('w','emblem',hlMakeTex(512,256,(g,w,h)=>{g.fillStyle=HFORM.red;g.fillRect(0,0,w,h);hlPlait(g,w*.03,h*.14,3,3,h*.24,h*.07,HFORM.ochre);hlPlait(g,w-w*.03-h*.72,h*.14,3,3,h*.24,h*.07,HFORM.ochre);
 hlIn(g,w/2-h*.47,h*.03,h*.94,h*.94,100,100,hlEmblem);hlFrame(g,w,h);}));
HMOTIF.banner=hlMotifItem('b','republic',hlMakeTex(128,384,(g,w,h)=>{g.fillStyle=HFORM.red;g.fillRect(0,0,w,h);g.fillStyle=HFORM.teal;g.fillRect(0,0,w,h*.06);g.fillRect(0,h*.94,w,h*.06);
 hlIn(g,w*.08,h*.14,w*.84,w*.84,100,100,hlEmblem);hlPlait(g,w*.1,h*.52,2,5,w*.4,w*.1,HFORM.ochre);
 g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(0,h);g.lineTo(w/2,h*.9);g.lineTo(w,h);g.fill();g.globalCompositeOperation='source-over';},true));
MAT[HMOTIF.banner].side=DS;
HMOTIF.pillar=[[hlWolf2,hlHammer,hlTriskele,hlGrain],[hlTreeOfLife,hlCat,hlMoth,hlStar8],[hlSun,hlMoon,hlStar8,hlGasGiant],[hlTriskele,hlRocket,hlWolf2,hlMoon]].map((ms,i)=>hlMotifItem('p',''+i,hlPillarTex(ms,i===2?'dark':'cedar'),false,true));
function hlWolf2(g){hlIn(g,0,22,100,56,200,100,hlWolf);}
