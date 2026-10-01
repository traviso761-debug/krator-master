// ---------------------------------------------------------------- CULTURE PACKS (shared: core/sockets/)
// A building never names a culture. It declares sockets (36-def.js); the ACTIVE pack draws into them. To add a culture, add one cultDef() here
// (or in its own fragment 8x-*.js): {key,name,paint:[hex..],paintShare,signBg,signFg, fill:{awning,banner,flag,emblem,sign,paint}}. Any fill a pack
// omits falls back to the generic one. Fills run in the socket frame: origin at the anchor, +z out of the surface, +x along it, y up.
// canvas-carried materials (own colours, never tinted): emblems, striped cloth, sign boards
function cvMat(key,w,h,fn,o){o=o||{};const t=canvasTex(w,h,fn,0,true);   // eager: the painters reseed() and draw from rng()t.wrapS=t.wrapT=o.repeat?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;
 const m=new THREE.MeshStandardMaterial({map:t,vertexColors:true,roughness:o.rough||.95,side:THREE.DoubleSide,transparent:!!o.alpha,alphaTest:o.alpha?.5:0});MAT[key]=m;TILE[key]=o.tile||1;return m;}
function stripeTex(key,cols,n,tile){cvMat(key,128,64,(g,w,h)=>{const sw=w/n;for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];g.fillRect(i*sw,0,sw+1,h);}
 reseed(9700+key.length);for(let i=0;i<140;i++){g.fillStyle=`rgba(${rng()<.5?0:255},${rng()<.5?0:255},${rng()<.5?0:255},${rr(.03,.1)})`;g.fillRect(rng()*w,rng()*h,rr(1,4),rr(1,6));}
 for(let i=0;i<5;i++){const x=rng()*w;g.fillStyle='rgba(50,30,20,.14)';g.fillRect(x,0,rr(1,3),h);}},{repeat:true,tile:tile||1.2});}
function drawTriskele(g,cx,cy,R,cols,lw){g.lineCap='round';g.lineWidth=lw;for(let k=0;k<3;k++){g.strokeStyle=cols[k%cols.length];g.beginPath();const a0=k*TAU/3-PI/2;
 for(let i=0;i<=24;i++){const t=i/24;const a=a0+t*2.5;const r=R*(.12+.86*t);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  const ae=a0+2.5;g.fillStyle=cols[k%cols.length];g.beginPath();g.arc(cx+Math.cos(ae)*R*.98,cy+Math.sin(ae)*R*.98,lw*.75,0,TAU);g.fill();}}
// banners and flags are drawn at THEIR OWN aspect ratio (canvas px map 1:1 to world metres), so an emblem stays round on a tall banner and a wide flag alike
function banDecal(base,draw,x,y,z,w,h,ry){const k=base+':'+w.toFixed(2)+'x'+h.toFixed(2);if(!MAT[k]){const pw=128,ph=Math.max(24,Math.round(128*h/w));cvMat(k,pw,ph,(g)=>draw(g,pw,ph));}decal(k,x,y,z,w,h,ry||0);}
function banDisc(W,H){return {R:Math.min(W*.4,H*.32),cx:W/2,cy:H>W*1.25?H*.38:H*.5};}
// ------------------------------------------------------------------ generic: faded tarp, rag, plain iron
function awnGeneric(o){const w=o.w||2.4,d=o.d||1.4,drop=o.drop===undefined?.5:o.drop;const c=P('cloth');const ca=pick([P('cloth'),P('tarp'),c]);
 plane4('cloth',[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.02,ca);box('cloth',0,-drop-.16,d,w,.16,.02,jc(ca,.05));
 for(const sx of [-1,1])beam('wood',[sx*(w/2-.05),-drop-.02,d-.05],[sx*(w/2-.05),-drop-(o.h||2.2)+.02,d-.05],.07,jc(0x5c4630,.06),true,6);}
function bannerGeneric(o){const w=o.w||.8,h=o.h||2;beam('wood',[-w/2-.1,0,.14],[w/2+.1,0,.14],.05,jc(0x5c4630,.06),true,5);quad('cloth',0,-h/2,.16,w,h,P('cloth'));
 for(let k=0;k<4;k++)box('cloth',-w/2+w*(k+.5)/4,-h-.08,.16,w/4-.02,.16,.01,P('cloth'));}
function flagGeneric(o){const w=o.w||1,h=o.h||.6;beam('wood',[0,-1.6,0],[0,.3,0],.04,jc(0x4a4038,.05),true,5);quad('cloth',w/2,-h/2+.1,0,w,h,P('cloth'),0);}
function emblemGeneric(o){const w=o.w||.9,h=o.h||.9;box('iron',0,-h/2,0,w,h,.04,P('rust'));for(const sx of [-1,1])for(const sy of [-1,1])box('iron',sx*(w/2-.07),sy*(h/2-.07),.03,.04,.04,.03,jc(0x3a3430,.04));}
// shop signs carry a pictograph, not English: the trade text picks an icon, drawn on the board's canvas in the culture's ink colour
const SIGN_ICONS={
 FOOD:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.ellipse(cx-s*.05,cy,s*.42,s*.24,0,0,TAU);g.fill();g.beginPath();g.moveTo(cx+s*.34,cy);g.lineTo(cx+s*.62,cy-s*.26);g.lineTo(cx+s*.62,cy+s*.26);g.fill();g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.arc(cx-s*.28,cy-s*.05,s*.05,0,TAU);g.fill();g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=s*.03;for(let k=0;k<3;k++){g.beginPath();g.arc(cx+s*.05+k*s*.1,cy,s*.15,-.9,.9);g.stroke();}},
 ARMOR:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.moveTo(cx-s*.4,cy-s*.42);g.lineTo(cx+s*.4,cy-s*.42);g.lineTo(cx+s*.4,cy+s*.02);g.quadraticCurveTo(cx+s*.36,cy+s*.34,cx,cy+s*.5);g.quadraticCurveTo(cx-s*.36,cy+s*.34,cx-s*.4,cy+s*.02);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=s*.06;g.beginPath();g.moveTo(cx,cy-s*.36);g.lineTo(cx,cy+s*.42);g.moveTo(cx-s*.34,cy-s*.08);g.lineTo(cx+s*.34,cy-s*.08);g.stroke();},
 WEAPONS:(g,cx,cy,s,fg)=>{g.strokeStyle=fg;g.lineCap='round';for(const d of [-1,1]){g.lineWidth=s*.09;g.beginPath();g.moveTo(cx-d*s*.42,cy-s*.42);g.lineTo(cx+d*s*.36,cy+s*.36);g.stroke();g.lineWidth=s*.13;g.beginPath();g.moveTo(cx+d*s*.22,cy+s*.1);g.lineTo(cx+d*s*.44,cy+s*.32);g.stroke();}g.fillStyle=fg;g.beginPath();g.arc(cx,cy,s*.07,0,TAU);g.fill();},
 TINKER:(g,cx,cy,s,fg)=>{g.fillStyle=fg;const R=s*.3,r=s*.16;g.beginPath();for(let k=0;k<16;k++){const a=k*TAU/16,rr_=k%2?R*.8:R;g.lineTo(cx-s*.14+Math.cos(a)*rr_,cy+Math.sin(a)*rr_);}g.closePath();g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(cx-s*.14,cy,r,0,TAU);g.fill();g.globalCompositeOperation='source-over';
  g.strokeStyle=fg;g.lineWidth=s*.1;g.lineCap='round';g.beginPath();g.moveTo(cx+s*.05,cy+s*.42);g.lineTo(cx+s*.42,cy-s*.32);g.stroke();g.beginPath();g.arc(cx+s*.45,cy-s*.38,s*.1,.4,5.2);g.stroke();},
 GENERAL:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.fillRect(cx-s*.42,cy-s*.05,s*.44,s*.4);g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=s*.04;g.strokeRect(cx-s*.42,cy-s*.05,s*.44,s*.4);g.beginPath();g.moveTo(cx-s*.42,cy+s*.15);g.lineTo(cx+.02*s,cy+s*.15);g.stroke();
  g.fillStyle=fg;g.beginPath();g.moveTo(cx+s*.3,cy-s*.4);g.quadraticCurveTo(cx+s*.62,cy,cx+s*.4,cy+s*.36);g.lineTo(cx+s*.12,cy+s*.36);g.quadraticCurveTo(cx-s*.02,cy,cx+s*.3,cy-s*.4);g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.beginPath();g.moveTo(cx+s*.22,cy-s*.4);g.lineTo(cx+s*.38,cy-s*.4);g.stroke();},
 HARBOUR:(g,cx,cy,s,fg)=>{g.strokeStyle=fg;g.lineCap='round';g.lineWidth=s*.09;g.beginPath();g.arc(cx,cy-s*.36,s*.09,0,TAU);g.stroke();g.beginPath();g.moveTo(cx,cy-s*.27);g.lineTo(cx,cy+s*.42);g.moveTo(cx-s*.24,cy-s*.12);g.lineTo(cx+s*.24,cy-s*.12);g.stroke();g.beginPath();g.arc(cx,cy+s*.08,s*.4,.15*PI,.85*PI);g.stroke();
  g.fillStyle=fg;for(const d of [-1,1]){g.beginPath();g.moveTo(cx+d*s*.38,cy+s*.2);g.lineTo(cx+d*s*.5,cy+s*.02);g.lineTo(cx+d*s*.22,cy+s*.06);g.fill();}},
 TICKETS:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.moveTo(cx-s*.5,cy-s*.26);g.lineTo(cx+s*.5,cy-s*.26);g.lineTo(cx+s*.5,cy-s*.09);g.arc(cx+s*.5,cy,s*.09,-PI/2,PI/2,true);g.lineTo(cx+s*.5,cy+s*.26);g.lineTo(cx-s*.5,cy+s*.26);g.lineTo(cx-s*.5,cy+s*.09);g.arc(cx-s*.5,cy,s*.09,PI/2,-PI/2,true);g.closePath();g.fill();
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=s*.035;g.setLineDash([s*.06,s*.05]);g.beginPath();g.moveTo(cx+s*.16,cy-s*.22);g.lineTo(cx+s*.16,cy+s*.22);g.stroke();g.setLineDash([]);g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(cx-s*.14,cy,s*.11,0,TAU);g.fill();},
 MESS:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.moveTo(cx-s*.42,cy);g.lineTo(cx+s*.42,cy);g.quadraticCurveTo(cx+s*.4,cy+s*.42,cx,cy+s*.42);g.quadraticCurveTo(cx-s*.4,cy+s*.42,cx-s*.42,cy);g.fill();g.strokeStyle=fg;g.lineWidth=s*.05;g.lineCap='round';for(const d of [-1,0,1]){g.beginPath();g.moveTo(cx+d*s*.2,cy-s*.08);g.bezierCurveTo(cx+d*s*.2-s*.08,cy-s*.2,cx+d*s*.2+s*.08,cy-s*.3,cx+d*s*.2,cy-s*.42);g.stroke();}}
};
function signBoard(o,bg,fg,frame){const w=o.w||2,h=o.h||.7,t=(o.trade||'').toUpperCase();const key='sign:'+t+bg+fg;if(!MAT[key])cvMat(key,256,96,(g,W_,H_)=>{g.fillStyle=bg;g.fillRect(0,0,W_,H_);reseed(9800+t.length);for(let i=0;i<180;i++){g.fillStyle=`rgba(0,0,0,${rr(.03,.12)})`;g.fillRect(rng()*W_,rng()*H_,rr(1,5),rr(1,3));}
  g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(6,6,W_-12,H_-12);const ic=SIGN_ICONS[t];if(ic)ic(g,W_/2,H_/2,64,fg);else{g.fillStyle=fg;g.beginPath();g.arc(W_/2,H_/2,22,0,TAU);g.fill();}});
 box('plank',0,-h/2-.06,-.02,w+.12,h+.12,.06,jc(frame||0x4a3a2c,.05));decal(key,0,0,.02,w,h,0);}
cultDef({key:'generic',name:'Generic (unmarked)',paint:null,signBg:'#9a7a52',signFg:'#2a1c10',
 fill:{awning:awnGeneric,banner:bannerGeneric,flag:flagGeneric,emblem:emblemGeneric,sign:o=>signBoard(o,'#8a6c48','#e8dcc0','#4a3a2c'),paint:o=>{}}});
// ------------------------------------------------------------------ symbols: each draws in the box (cx,cy,R) with two ink colours
const SYMBOLS={
 sun:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.92,0,TAU);g.fill();g.fillStyle=c2;g.beginPath();g.arc(cx,cy,R*.54,0,TAU);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.24,0,TAU);g.fill();
  for(let k=0;k<12;k++){const a=k*TAU/12;g.fillStyle=c1;g.beginPath();g.moveTo(cx+Math.cos(a-.11)*R*.98,cy+Math.sin(a-.11)*R*.98);g.lineTo(cx+Math.cos(a)*R*1.18,cy+Math.sin(a)*R*1.18);g.lineTo(cx+Math.cos(a+.11)*R*.98,cy+Math.sin(a+.11)*R*.98);g.fill();}},
 triskele:(g,cx,cy,R,c1,c2)=>{drawTriskele(g,cx,cy,R*.82,[c1,c2,'#c9963a'],Math.max(3,R*.27));},
 diamond:(g,cx,cy,R,c1,c2)=>{g.strokeStyle=c1;g.lineWidth=Math.max(2,R*.11);g.lineJoin='round';g.beginPath();g.moveTo(cx,cy-R);g.lineTo(cx+R*.75,cy);g.lineTo(cx,cy+R);g.lineTo(cx-R*.75,cy);g.closePath();g.stroke();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,R*.16,0,TAU);g.fill();},
 // hyperboloid of one sheet: the cooling-tower profile with its ruling lines (Yuni)
 hyperboloid:(g,cx,cy,R,c1,c2)=>{const a=R*.4,hh=R*.92,b=hh*.55;const xw=t=>a*Math.sqrt(1+(t*hh/b)*(t*hh/b));const rx=xw(1),ry=R*.13;
  g.strokeStyle=c1;g.lineCap='round';g.lineWidth=Math.max(2,R*.05);
  for(let k=0;k<7;k++){const th=k*TAU/7;g.beginPath();g.moveTo(cx+Math.cos(th)*rx,cy-hh+Math.sin(th)*ry);g.lineTo(cx+Math.cos(th+1.05)*rx,cy+hh+Math.sin(th+1.05)*ry);g.stroke();}
  g.lineWidth=Math.max(2.5,R*.1);for(const sx of [-1,1]){g.beginPath();for(let i=0;i<=28;i++){const t=-1+2*i/28;const x=cx+sx*xw(t),y=cy+t*hh;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}
  for(const [yy,r_x] of [[cy-hh,rx],[cy,a],[cy+hh,rx]]){g.beginPath();g.ellipse(cx,yy,r_x,ry*(r_x===a?.8:1),0,0,TAU);g.stroke();}},
 // three parallel talon slashes (Beast Riders)
 claw:(g,cx,cy,R,c1,c2)=>{g.fillStyle=c1;for(let k=-1;k<=1;k++){const x0=cx+k*R*.5;g.beginPath();g.moveTo(x0-R*.2,cy-R*.95);g.quadraticCurveTo(x0+R*.62,cy-R*.15,x0+R*.08,cy+R*1.0);g.quadraticCurveTo(x0+R*.2,cy-R*.05,x0-R*.2,cy-R*.95);g.closePath();g.fill();}},
};
// ------------------------------------------------------------------ the factory: a culture is a palette, a symbol and two cloth styles
// mkCulture({key,name,field,edge,band,disc,ink,ink2,sym,awn:{mode:'stripes'|'cloth',cols,n},paint,pole,signBg,signFg,signFrame,flagStyle:'rect'|'pennant'})
//   field/edge/band: banner cloth, its side edges and its end bands; disc: a round ground behind the symbol (optional); ink/ink2: symbol colours
function mkCulture(o){const K=o.key,pole=jc(o.pole||0x7a5a38,0);
 const drawBan=(g,W,H)=>{g.fillStyle=o.field;g.fillRect(0,0,W,H);g.fillStyle=o.edge;const e=Math.min(W,H)*.09;if(H>W){g.fillRect(0,0,e,H);g.fillRect(W-e,0,e,H);g.fillStyle=o.band;g.fillRect(0,0,W,e*.8);g.fillRect(0,H-e*.8,W,e*.8);}else{g.fillRect(0,0,W,e);g.fillRect(0,H-e,W,e);g.fillStyle=o.band;g.fillRect(0,0,e*.8,H);g.fillRect(W-e*.8,0,e*.8,H);}
  const d=banDisc(W,H);if(o.disc){g.fillStyle=o.disc;g.beginPath();g.arc(d.cx,d.cy,d.R*1.06,0,TAU);g.fill();}SYMBOLS[o.sym](g,d.cx,d.cy,d.R*.94,o.ink,o.ink2||o.ink);
  if(H>W*1.25){g.fillStyle=o.band;for(let k=0;k<3;k++)g.fillRect(W*.24,H*.66+k*H*.06,W*.52,H*.025);}
  reseed(9700+K.length);for(let i=0;i<120;i++){g.fillStyle=`rgba(0,0,0,${rr(.03,.11)})`;g.fillRect(rng()*W,rng()*H,rr(1,3),rr(2,8));}};
 const drawPlate=(g,W,H)=>{g.fillStyle=o.edge;g.fillRect(0,0,W,H);g.fillStyle=o.field;g.fillRect(W*.06,H*.06,W*.88,H*.88);const d=banDisc(W,H);if(o.disc){g.fillStyle=o.disc;g.beginPath();g.arc(W/2,H/2,W*.36,0,TAU);g.fill();}SYMBOLS[o.sym](g,W/2,H/2,W*.3,o.ink,o.ink2||o.ink);};
 const cloth=o.awn.mode==='cloth';if(!cloth)stripeTex('awn:'+K,o.awn.cols,o.awn.n||8);
 const awning=q=>{const w=q.w||2.4,d=q.d||1.4,drop=q.drop===undefined?.5:q.drop,ph=q.h||2.2;
  if(cloth){const c=jc(pick(o.awn.cols),.06);plane4('cloth',[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.03,c);for(let k=0;k<Math.round(w/.4);k++)box('cloth',-w/2+.2+k*.4,-drop-.24-(k%2?.08:0),d,.34,.24+(k%2?.08:0),.02,jc(c,.08));}
  else{plane4('awn:'+K,[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.03);for(let k=0;k<Math.round(w/.3);k++){const sc=k%2;box('awn:'+K,-w/2+.15+k*.3,-drop-.2+(sc?.03:0),d,.3,.2-(sc?.03:0),.02);}}
  for(const sx of [-1,1])beam('wood',[sx*(w/2-.05),-drop-.2,d-.05],[sx*(w/2-.05),-drop-ph,d-.05],.07,pole,true,6);};
 // a banner hangs from a rod that stands proud of its pole (z=.14 clears a pole up to ~0.12 m radius), so the pole never pierces the cloth
 const banner=q=>{const w=q.w||.8,h=q.h||2;beam('wood',[-w/2-.1,0,.14],[w/2+.1,0,.14],.05,pole,true,5);banDecal('ban:'+K,drawBan,0,-h/2,.16,w,h,0);};
 const flag=q=>{const w=q.w||1,h=q.h||.65;beam('wood',[0,-1.6,0],[0,.3,0],.04,pole,true,5);
  if(o.flagStyle==='pennant'){const c=jc(o.field,.04);poly('cloth',[[0,.35,0],[w*1.5,.1,0],[w*1.15,-.04,0],[w*1.5,-.2,0],[0,-.1,0]],c,true);}else banDecal('ban:'+K,drawBan,w/2,-h/2+.1,0,w,h,0);};
 const emblem=q=>{const w=q.w||.9;banDecal('em:'+K,drawPlate,0,-(q.h||w)/2,.03,w,q.h||w,0);};
 return cultDef({key:K,name:o.name,paint:o.paint,paintShare:o.paintShare||.55,fill:{awning,banner,flag,emblem,sign:q=>signBoard(q,o.signBg,o.signFg,o.signFrame),paint:q=>{}}});}
// ------------------------------------------------------------------ the packs (add a culture = one mkCulture call)
mkCulture({key:'iziz',name:'Iziz',field:'#e07a2a',edge:'#2f8f8a',band:'#f2a24a',disc:null,ink:'#f3e2c0',ink2:'#e07a2a',sym:'sun',pole:0xe8dcc0,
 awn:{mode:'stripes',cols:['#e07a2a','#f3e2c0','#f2a24a','#f3e2c0','#e07a2a','#f3e2c0','#d8893c','#f3e2c0','#2f8f8a','#f3e2c0'],n:10},
 paint:[0xe07a2a,0x2f8f8a,0xf2a24a,0xd8893c,0xe8dcc0,0xc9442a],signBg:'#e07a2a',signFg:'#f3e2c0',signFrame:0x2f8f8a});
// Republic: the triskelion, on Voth's deep red
mkCulture({key:'republic',name:'Republic',field:'#7a2028',edge:'#4a3220',band:'#c9963a',disc:'#f0e6cc',ink:'#7a2028',ink2:'#2a8a86',sym:'triskele',pole:0x7a5a38,
 awn:{mode:'stripes',cols:['#7a2028','#f0e6cc','#c9963a','#f0e6cc'],n:8},
 paint:[0x7a2028,0x8a2f2a,0xc9963a,0xf0e6cc,0x5c4028],signBg:'#7a2028',signFg:'#f0e6cc',signFrame:0x4a3220});
// Voth: deep blue, ash-white glyph, ragged cloth
mkCulture({key:'voth',name:'Voth',field:'#24487a',edge:'#182e4d',band:'#3a5f8f',disc:null,ink:'#d8cdb4',sym:'diamond',pole:0x3a2a1c,flagStyle:'pennant',
 awn:{mode:'cloth',cols:[0x24487a,0x1f3a5f,0x3a5f8f,0x2a3a4a]},
 paint:[0x24487a,0x1f3a5f,0x3a5f8f,0x2a3a4a,0xd8cdb4],signBg:'#1f3a5f',signFg:'#d8cdb4',signFrame:0x182e4d});
// Yuni: yellow, the hyperboloid
mkCulture({key:'yuni',name:'Yuni',field:'#dcb42c',edge:'#5a4410',band:'#f4ecc8',disc:'#f6efd0',ink:'#4a3a12',sym:'hyperboloid',pole:0x5a4410,
 awn:{mode:'stripes',cols:['#e0b52a','#f4ecc8','#c99a1e','#f4ecc8'],n:8},
 paint:[0xd9b12a,0xe8c84a,0x8a6a1a,0xf4ecc8,0x4a3a12],signBg:'#dcb42c',signFg:'#3a2c08',signFrame:0x5a4410});
// Beast Riders: green, the claw
mkCulture({key:'beastriders',name:'Beast Riders',field:'#3f7a3a',edge:'#2e5a2c',band:'#6a9a4a',disc:null,ink:'#e6dcc2',sym:'claw',pole:0x4a3a22,flagStyle:'pennant',
 awn:{mode:'cloth',cols:[0x58924a,0x4a8240,0x6aa050,0x7f8a48]},
 paint:[0x3f7a3a,0x2e5a2c,0x5a8a3e,0xe0d6c0,0x4a3a22],signBg:'#2e5a2c',signFg:'#e6dcc2',signFrame:0x4a3a22});
