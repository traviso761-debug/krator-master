// ---------------------------------------------------------------- cultural marker packs
// A building never names a culture. It declares sockets (36-def.js); the ACTIVE pack draws into them. To add a culture, add one cultDef() here
// (or in its own fragment 8x-*.js): {key,name,paint:[hex..],paintShare,signBg,signFg, fill:{awning,banner,flag,emblem,sign,paint}}. Any fill a pack
// omits falls back to the generic one. Fills run in the socket frame: origin at the anchor, +z out of the surface, +x along it, y up.
// canvas-carried materials (own colours, never tinted): emblems, striped cloth, sign boards
function cvMat(key,w,h,fn,o){o=o||{};const t=canvasTex(w,h,fn);t.wrapS=t.wrapT=o.repeat?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;
 const m=new THREE.MeshStandardMaterial({map:t,vertexColors:true,roughness:o.rough||.95,side:THREE.DoubleSide,transparent:!!o.alpha,alphaTest:o.alpha?.5:0});MAT[key]=m;TILE[key]=o.tile||1;return m;}
function stripeTex(key,cols,n,tile){cvMat(key,128,64,(g,w,h)=>{const sw=w/n;for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];g.fillRect(i*sw,0,sw+1,h);}
 reseed(9700+key.length);for(let i=0;i<140;i++){g.fillStyle=`rgba(${rng()<.5?0:255},${rng()<.5?0:255},${rng()<.5?0:255},${rr(.03,.1)})`;g.fillRect(rng()*w,rng()*h,rr(1,4),rr(1,6));}
 for(let i=0;i<5;i++){const x=rng()*w;g.fillStyle='rgba(50,30,20,.14)';g.fillRect(x,0,rr(1,3),h);}},{repeat:true,tile:tile||1.2});}
function drawTriskele(g,cx,cy,R,cols,lw){g.lineCap='round';g.lineWidth=lw;for(let k=0;k<3;k++){g.strokeStyle=cols[k%cols.length];g.beginPath();const a0=k*TAU/3-PI/2;
 for(let i=0;i<=24;i++){const t=i/24;const a=a0+t*2.5;const r=R*(.12+.86*t);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  const ae=a0+2.5;g.fillStyle=cols[k%cols.length];g.beginPath();g.arc(cx+Math.cos(ae)*R*.98,cy+Math.sin(ae)*R*.98,lw*.75,0,TAU);g.fill();}}
// ------------------------------------------------------------------ generic: faded tarp, rag, plain iron
function awnGeneric(o){const w=o.w||2.4,d=o.d||1.4,drop=o.drop===undefined?.5:o.drop;const c=P('cloth');const ca=pick([P('cloth'),P('tarp'),c]);
 plane4('cloth',[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.02,ca);box('cloth',0,-drop-.16,d,w,.16,.02,jc(ca,.05));
 for(const sx of [-1,1])beam('wood',[sx*(w/2-.05),-drop-.02,d-.05],[sx*(w/2-.05),-drop-(o.h||2.2)+.02,d-.05],.07,jc(0x5c4630,.06),true,6);}
function bannerGeneric(o){const w=o.w||.8,h=o.h||2;beam('wood',[-w/2-.1,0,0],[w/2+.1,0,0],.05,jc(0x5c4630,.06),true,5);quad('cloth',0,-h/2,.03,w,h,P('cloth'));
 for(let k=0;k<4;k++)box('cloth',-w/2+w*(k+.5)/4,-h-.08,.03,w/4-.02,.16,.01,P('cloth'));}
function flagGeneric(o){const w=o.w||1,h=o.h||.6;beam('wood',[0,-1.6,0],[0,.3,0],.04,jc(0x4a4038,.05),true,5);quad('cloth',w/2,-h/2+.1,0,w,h,P('cloth'),0);}
function emblemGeneric(o){const w=o.w||.9,h=o.h||.9;box('iron',0,-h/2,0,w,h,.04,P('rust'));for(const sx of [-1,1])for(const sy of [-1,1])box('iron',sx*(w/2-.07),sy*(h/2-.07),.03,.04,.04,.03,jc(0x3a3430,.04));}
function signBoard(o,bg,fg,frame){const w=o.w||2,h=o.h||.7,t=(o.trade||'').toUpperCase();const key='sign:'+t+bg+fg;if(!MAT[key])cvMat(key,256,96,(g,W_,H_)=>{g.fillStyle=bg;g.fillRect(0,0,W_,H_);reseed(9800+t.length);for(let i=0;i<180;i++){g.fillStyle=`rgba(0,0,0,${rr(.03,.12)})`;g.fillRect(rng()*W_,rng()*H_,rr(1,5),rr(1,3));}
  g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(6,6,W_-12,H_-12);g.fillStyle=fg;g.font='bold 46px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,W_/2,H_/2+3);});
 box('plank',0,-h/2-.06,-.02,w+.12,h+.12,.06,jc(frame||0x4a3a2c,.05));decal(key,0,0,.02,w,h,0);}
cultDef({key:'generic',name:'Generic (unmarked)',paint:null,signBg:'#9a7a52',signFg:'#2a1c10',
 fill:{awning:awnGeneric,banner:bannerGeneric,flag:flagGeneric,emblem:emblemGeneric,sign:o=>signBoard(o,'#8a6c48','#e8dcc0','#4a3a2c'),paint:o=>{}}});
// ------------------------------------------------------------------ Iziz: orange-led striped awnings, teal accent (Iziz Vernacular palette)
stripeTex('awn:iziz',['#e07a2a','#f3e2c0','#f2a24a','#f3e2c0','#e07a2a','#f3e2c0','#d8893c','#f3e2c0','#2f8f8a','#f3e2c0'],10);
cvMat('em:iziz',128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#2f8f8a';g.beginPath();g.arc(64,64,60,0,TAU);g.fill();g.fillStyle='#e07a2a';g.beginPath();g.arc(64,64,44,0,TAU);g.fill();
 g.fillStyle='#f3e2c0';g.beginPath();g.arc(64,64,22,0,TAU);g.fill();for(let k=0;k<12;k++){const a=k*TAU/12;g.fillStyle='#f3e2c0';g.beginPath();g.moveTo(64+Math.cos(a-.11)*46,64+Math.sin(a-.11)*46);g.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58);g.lineTo(64+Math.cos(a+.11)*46,64+Math.sin(a+.11)*46);g.fill();}},{alpha:true});
cvMat('ban:iziz',64,192,(g,w,h)=>{g.fillStyle='#e07a2a';g.fillRect(0,0,w,h);g.fillStyle='#2f8f8a';g.fillRect(0,0,7,h);g.fillRect(w-7,0,7,h);g.fillStyle='#f3e2c0';g.beginPath();g.arc(32,64,17,0,TAU);g.fill();g.fillStyle='#e07a2a';g.beginPath();g.arc(32,64,10,0,TAU);g.fill();
 g.fillStyle='#f2a24a';for(let k=0;k<3;k++)g.fillRect(14,110+k*16,36,7);});
function awnIziz(o){const w=o.w||2.4,d=o.d||1.4,drop=o.drop===undefined?.5:o.drop;plane4('awn:iziz',[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.03);
 for(let k=0;k<Math.round(w/.3);k++){const x=-w/2+.15+k*.3;const sc=k%2;box('awn:iziz',x,-drop-.2+(sc?.03:0),d,.3,.2-(sc?.03:0),.02);}
 for(const sx of [-1,1])beam('wood',[sx*(w/2-.05),-drop-.2,d-.05],[sx*(w/2-.05),-drop-(o.h||2.2),d-.05],.07,jc(0xe8dcc0,.04),true,6);}
cultDef({key:'iziz',name:'Iziz',paint:[0xe07a2a,0x2f8f8a,0xf2a24a,0xd8893c,0xe8dcc0,0xc9442a],paintShare:.6,
 fill:{awning:awnIziz,banner:o=>{const w=o.w||.8,h=o.h||2;beam('wood',[-w/2-.1,0,0],[w/2+.1,0,0],.05,jc(0xe8dcc0,.04),true,5);decal('ban:iziz',0,-h/2,.03,w,h,0);},
  flag:o=>{const w=o.w||1,h=o.h||.6;beam('wood',[0,-1.6,0],[0,.3,0],.04,jc(0xe8dcc0,.04),true,5);quad('awn:iziz',w/2,-h/2+.1,0,w,h,null,0);},
  emblem:o=>{const w=o.w||.9;decal('em:iziz',0,-(o.h||w)/2,.03,w,w,0);},
  sign:o=>signBoard(o,'#e07a2a','#f3e2c0','#2f8f8a')}});
// ------------------------------------------------------------------ Voth: deep red and brown banners, ash-white glyph, ragged cloth
cvMat('ban:voth',64,224,(g,w,h)=>{g.fillStyle='#7a2028';g.fillRect(0,0,w,h);g.fillStyle='#4a3220';g.fillRect(0,0,6,h);g.fillRect(w-6,0,6,h);g.fillStyle='#5c4028';g.fillRect(0,h-40,w,8);
 g.strokeStyle='#d8cdb4';g.lineWidth=3;g.beginPath();g.moveTo(32,30);g.lineTo(52,70);g.lineTo(32,110);g.lineTo(12,70);g.closePath();g.stroke();g.fillStyle='#d8cdb4';g.beginPath();g.arc(32,70,7,0,TAU);g.fill();
 g.beginPath();g.moveTo(32,124);g.lineTo(38,150);g.lineTo(26,150);g.fill();reseed(9710);for(let i=0;i<200;i++){g.fillStyle=`rgba(0,0,0,${rr(.04,.14)})`;g.fillRect(rng()*w,rng()*h,rr(1,3),rr(2,9));}},{alpha:false});
cvMat('em:voth',128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#4a3220';g.beginPath();g.arc(64,64,60,0,TAU);g.fill();g.fillStyle='#7a2028';g.beginPath();g.arc(64,64,50,0,TAU);g.fill();
 g.strokeStyle='#d8cdb4';g.lineWidth=5;g.beginPath();g.moveTo(64,20);g.lineTo(100,64);g.lineTo(64,108);g.lineTo(28,64);g.closePath();g.stroke();g.fillStyle='#d8cdb4';g.beginPath();g.arc(64,64,10,0,TAU);g.fill();},{alpha:true});
function bannerVoth(o){const w=o.w||.9,h=o.h||3;beam('wood',[-w/2-.12,0,0],[w/2+.12,0,0],.06,jc(0x3a2a1c,.05),true,5);
 decal('ban:voth',0,-h/2,.03,w,h,0);}
function awnVoth(o){const w=o.w||2.4,d=o.d||1.4,drop=o.drop===undefined?.5:o.drop;const c=jc(pick([0x7a2028,0x8a2f2a,0x5c4028,0x4a3220]),.06);
 plane4('cloth',[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.03,c);for(let k=0;k<Math.round(w/.4);k++)box('cloth',-w/2+.2+k*.4,-drop-.24-(k%2?.08:0),d,.34,.24+(k%2?.08:0),.02,jc(c,.08));
 for(const sx of [-1,1])beam('wood',[sx*(w/2-.05),-drop-.2,d-.05],[sx*(w/2-.05),-drop-(o.h||2.2),d-.05],.08,jc(0x3a2a1c,.05),true,6);}
cultDef({key:'voth',name:'Voth',paint:[0x7a2028,0x8a2f2a,0x5c4028,0x4a3220,0xd8cdb4],paintShare:.5,
 fill:{awning:awnVoth,banner:bannerVoth,flag:o=>{const w=o.w||1.6,h=o.h||.5;beam('wood',[0,-1.8,0],[0,.4,0],.05,jc(0x3a2a1c,.05),true,5);
   poly('cloth',[[0,.35,0],[w,.1,0],[w*.75,-.02,0],[w,-.16,0],[0,-.1,0]],jc(0x7a2028,.05),true);},
  emblem:o=>{const w=o.w||.9;decal('em:voth',0,-(o.h||w)/2,.03,w,w,0);},sign:o=>signBoard(o,'#5c4028','#d8cdb4','#3a2a1c')}});
// ------------------------------------------------------------------ Republic: the triskelion (red, teal, ochre), teal and ochre stripes
stripeTex('awn:rep',['#2a8a86','#f0e6cc','#c9773a','#f0e6cc'],8);
cvMat('em:rep',128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#1c5a58';g.beginPath();g.arc(64,64,62,0,TAU);g.fill();g.fillStyle='#f0e6cc';g.beginPath();g.arc(64,64,54,0,TAU);g.fill();
 drawTriskele(g,64,64,44,['#c23a2a','#2a8a86','#c9963a'],9);},{alpha:true});
cvMat('ban:rep',64,192,(g,w,h)=>{g.fillStyle='#2a8a86';g.fillRect(0,0,w,h);g.fillStyle='#c9963a';g.fillRect(0,0,w,8);g.fillRect(0,h-8,w,8);g.fillStyle='#f0e6cc';g.beginPath();g.arc(32,72,25,0,TAU);g.fill();drawTriskele(g,32,72,20,['#c23a2a','#2a8a86','#c9963a'],5);
 for(let k=0;k<3;k++){g.fillStyle='#c9963a';g.fillRect(12,120+k*14,40,5);}},{alpha:false});
function awnRep(o){const w=o.w||2.4,d=o.d||1.4,drop=o.drop===undefined?.5:o.drop;plane4('awn:rep',[-w/2,0,0],[w/2,0,0],[-w/2,-drop,d],[w/2,-drop,d],.03);box('awn:rep',0,-drop-.18,d,w,.18,.02);
 for(const sx of [-1,1])beam('wood',[sx*(w/2-.05),-drop-.18,d-.05],[sx*(w/2-.05),-drop-(o.h||2.2),d-.05],.07,jc(0x7a5a38,.05),true,6);}
cultDef({key:'republic',name:'Republic',paint:[0x2a8a86,0xc23a2a,0xc9963a,0xf0e6cc,0x1c5a58],paintShare:.55,
 fill:{awning:awnRep,banner:o=>{const w=o.w||.8,h=o.h||2;beam('wood',[-w/2-.1,0,0],[w/2+.1,0,0],.05,jc(0x7a5a38,.05),true,5);decal('ban:rep',0,-h/2,.03,w,h,0);},
  flag:o=>{const w=o.w||1,h=o.h||.7;beam('wood',[0,-1.6,0],[0,.3,0],.04,jc(0x7a5a38,.05),true,5);decal('ban:rep',w/2,-h/2+.1,0,w,h,0);},
  emblem:o=>{const w=o.w||.9;decal('em:rep',0,-(o.h||w)/2,.03,w,w,0);},sign:o=>signBoard(o,'#2a8a86','#f0e6cc','#7a5a38')}});
