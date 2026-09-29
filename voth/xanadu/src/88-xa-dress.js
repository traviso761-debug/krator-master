// ================================================================= XANADU — the Palopó paint (dress pass, round 4)
// Travis: variants of the shops, the residences, the bathhouse and the neighbourhood temple painted like Santa
// Catarina Palopó on Lake Atitlán — whole houses in saturated turquoise and cobalt with orange or yellow trim, and
// the motifs of the local huipil painted across the walls: lozenge chains, zigzag bands, pink birds, green deer,
// hooked X stars.
//
// Mechanism (as the reclaimed twins in the Highlands kit): every listed def gets a twin `<key>_palopo` in the row
// "Palopó paint", running the SAME builder and seed under a paint filter on kput — every wall item is tinted the
// building's base colour and painted trim goes orange/yellow (black window surrounds stay black) — and the big
// wall instances are recorded so that, after the building, a band and a motif can be hung on each face.
// Seeds 31901–31999.

// ---------------------------------------------------------------- the palette and the painted motifs (colour-carrying, alpha-cut)
const XPALOPO={
 base:[0x1fb5c8,0x1d3fbf,0x2846c8,0x139aa0,0x38b6d6,0x2a5fd0,0x17a4b8],       // the walls: turquoise, cobalt, royal, teal, sky
 trim:[0xe8632a,0xf2c12e,0xf4efe4,0xe8632a,0xd94a2a],                       // painted trim: orange leads, yellow, white
 motifs:['xPalBird','xPalDeer','xPalStar','xPalBird2'],
 pink:'#f07aa8',green:'#3fbf4a',yellow:'#f2c12e',sky:'#66c8f0',white:'#f4efe4',
};
function xpLozenge(g,cx,cy,w,h,fill,line,lw){g.beginPath();g.moveTo(cx,cy-h/2);g.lineTo(cx+w/2,cy);g.lineTo(cx,cy+h/2);g.lineTo(cx-w/2,cy);g.closePath();
 if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=lw||6;g.strokeStyle=line;g.lineJoin='round';g.stroke();}}
// lozenge chain band: 1 m x 0.5 m tile, green lozenges outlined yellow with a pink heart, small yellow lozenges between
TEX.xPalBand=canvasTex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);const n=4,c=w/n;
 for(let k=0;k<n;k++){const cx=(k+.5)*c,cy=h/2;xpLozenge(g,cx,cy,c*.78,h*.8,XPALOPO.green,XPALOPO.yellow,7);xpLozenge(g,cx,cy,c*.3,h*.32,XPALOPO.pink,null);
  xpLozenge(g,k*c,cy,c*.2,h*.26,XPALOPO.yellow,null);}});
// zigzag band: 1 m x 0.5 m tile, a pink chevron line over a yellow one
TEX.xPalZig=canvasTex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);const n=4,c=w/n;g.lineJoin='round';g.lineCap='round';
 for(const [col,dy,lw] of[[XPALOPO.yellow,18,12],[XPALOPO.pink,-14,12]]){g.beginPath();for(let k=0;k<=n*2;k++){const x=k*c/2,y=h/2+dy+(k%2?-h*.26:h*.26);if(k)g.lineTo(x,y);else g.moveTo(x,y);}
  g.lineWidth=lw;g.strokeStyle=col;g.stroke();}});
// the bird (the huipil's quetzal): a pink body, a fringed wing of five feathers, a crest, a long forked tail; facing right
function xpBird(g,w,h,body,wing,acc){g.clearRect(0,0,w,h);const cx=w*.5,cy=h*.5;g.lineCap='round';
 g.fillStyle=body;g.beginPath();g.ellipse(cx,cy+h*.02,w*.13,h*.2,0,0,TAU);g.fill();                                           // body
 g.beginPath();g.arc(cx+w*.06,cy-h*.26,w*.08,0,TAU);g.fill();                                                                 // head
 g.strokeStyle=acc;g.lineWidth=w*.03;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(cx+w*.06,cy-h*.32);g.lineTo(cx+w*.06+k*w*.07,cy-h*.46);g.stroke();}   // crest
 g.fillStyle=acc;g.beginPath();g.moveTo(cx+w*.13,cy-h*.26);g.lineTo(cx+w*.24,cy-h*.22);g.lineTo(cx+w*.13,cy-h*.2);g.closePath();g.fill();               // beak
 g.strokeStyle=wing;g.lineWidth=w*.045;for(let k=0;k<5;k++){const a=-.15+k*.24;g.beginPath();g.moveTo(cx-w*.04,cy-h*.02);g.lineTo(cx-w*.04-Math.cos(a)*w*.34,cy-h*.02+Math.sin(a)*h*.3);g.stroke();}   // wing fringe
 g.strokeStyle=body;g.lineWidth=w*.035;for(const s of[-1,1]){g.beginPath();g.moveTo(cx+w*.02,cy+h*.18);g.lineTo(cx+w*.02+s*w*.06,cy+h*.46);g.stroke();}                      // tail
 g.fillStyle='#1a1614';g.beginPath();g.arc(cx+w*.08,cy-h*.27,w*.015,0,TAU);g.fill();}
TEX.xPalBird=canvasTex(256,256,(g,w,h)=>xpBird(g,w,h,XPALOPO.pink,XPALOPO.pink,XPALOPO.green));
TEX.xPalBird2=canvasTex(256,256,(g,w,h)=>xpBird(g,w,h,XPALOPO.sky,XPALOPO.yellow,XPALOPO.pink));
// the deer: a green stepped silhouette with branching antlers, outlined yellow; facing left
TEX.xPalDeer=canvasTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.lineJoin='round';g.lineCap='round';
 const P=[[.2,.62],[.2,.42],[.34,.4],[.34,.28],[.44,.28],[.5,.4],[.7,.4],[.74,.62],[.66,.62],[.64,.48],[.58,.48],[.58,.62],[.5,.62],[.5,.48],[.36,.48],[.36,.62]];
 g.beginPath();P.forEach((p,i)=>{if(i)g.lineTo(p[0]*w,p[1]*h);else g.moveTo(p[0]*w,p[1]*h);});g.closePath();g.fillStyle=XPALOPO.green;g.fill();g.lineWidth=5;g.strokeStyle=XPALOPO.yellow;g.stroke();
 g.strokeStyle=XPALOPO.green;g.lineWidth=7;for(const [x0,y0,x1,y1] of[[.4,.28,.36,.12],[.4,.28,.46,.12],[.36,.12,.3,.08],[.36,.12,.38,.04],[.46,.12,.52,.08],[.46,.12,.44,.04]]){g.beginPath();g.moveTo(x0*w,y0*h);g.lineTo(x1*w,y1*h);g.stroke();}
 g.fillStyle=XPALOPO.yellow;g.beginPath();g.arc(w*.3,h*.34,w*.025,0,TAU);g.fill();});
// the hooked X star: a blue lozenge heart, four green arms ending in hooks, yellow dots
TEX.xPalStar=canvasTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);const c=w/2;g.lineJoin='round';g.lineCap='square';
 g.strokeStyle=XPALOPO.green;g.lineWidth=w*.06;for(const [sx,sy] of[[1,1],[-1,1],[1,-1],[-1,-1]]){g.beginPath();g.moveTo(c+sx*w*.08,c+sy*w*.08);g.lineTo(c+sx*w*.36,c+sy*w*.36);g.lineTo(c+sx*w*.36,c+sy*w*.2);g.stroke();}
 xpLozenge(g,c,c,w*.34,w*.34,XPALOPO.sky,XPALOPO.yellow,7);xpLozenge(g,c,c,w*.12,w*.12,XPALOPO.pink,null);
 g.fillStyle=XPALOPO.yellow;for(const [sx,sy] of[[1,0],[-1,0],[0,1],[0,-1]]){g.beginPath();g.arc(c+sx*w*.4,c+sy*w*.4,w*.035,0,TAU);g.fill();}});
MAT.xPalBand=xStd({map:TEX.xPalBand,alphaTest:.5,roughness:.85});MAT.xPalZig=xStd({map:TEX.xPalZig,alphaTest:.5,roughness:.85});
xWorldUV(MAT.xPalBand,1,2);xWorldUV(MAT.xPalZig,1,2);
MAT.xPalBird=xStd({map:TEX.xPalBird,alphaTest:.5,roughness:.85});MAT.xPalBird2=xStd({map:TEX.xPalBird2,alphaTest:.5,roughness:.85});
MAT.xPalDeer=xStd({map:TEX.xPalDeer,alphaTest:.5,roughness:.85});MAT.xPalStar=xStd({map:TEX.xPalStar,alphaTest:.5,roughness:.85});
kdef('xPalBand',VPLANE,MAT.xPalBand);kdef('xPalZig',VPLANE,MAT.xPalZig);kdef('xPalBird',VPLANE,MAT.xPalBird);kdef('xPalBird2',VPLANE,MAT.xPalBird2);kdef('xPalDeer',VPLANE,MAT.xPalDeer);kdef('xPalStar',VPLANE,MAT.xPalStar);

// ---------------------------------------------------------------- the paint filter on kput
const XPALOPO_WALL=new Set(['xWashB','xEarthB','vPlaster','vWood@wall','vStone@wall','xWallW','xWallE','xBatW96','xBatW92','xBatW86','xBatW80','xBatE96','xBatE92','xBatE86','xBatE80']);
const _xaKputPalopo=kput;
kput=function(name,p,q,s,c){const C=VERN.cur;if(!C||!C.o.palopo||C.palBusy)return _xaKputPalopo(name,p,q,s,c);const P=C.pal;
 const bigBox=(name==='vWood'||name==='vStone')&&Array.isArray(s)&&s[0]>=6&&s[1]>=2.6&&s[2]>=6;   // the board and brick storeys of the Turkish houses
 if(XPALOPO_WALL.has(name)||bigBox){const S=Array.isArray(s)?s:[s,s,s];if(S[0]>=2.4&&S[1]>=2.0&&S[2]>=1.2)C.walls.push({name,p,q,s:S});return _xaKputPalopo(name,p,q,s,P.base);}
 if((name==='vWinLit'||name==='vWinGlass'||name==='vDarkB')&&Array.isArray(s)&&s[0]>.35&&s[1]>.35)C.opens.push({p,q,s});   // an opening: the mural fitting avoids it
 if(name==='xPaint'&&c&&(c.r>.03||c.g>.03||c.b>.03))return _xaKputPalopo(name,p,q,s,P.trim);          // painted trim goes orange / yellow; the black surrounds stay black
 if(name==='vWood'&&Array.isArray(s)&&s[1]<.4&&Math.max(s[0],s[2])>1)return _xaKputPalopo(name,p,q,s,P.trim);   // lintels, sills, head beams
 if(name==='xValance')return _xaKputPalopo(name,p,q,s,P.trim2);
 return _xaKputPalopo(name,p,q,s,c);};
// after the building: on every recorded wall face, a lozenge or zigzag band under the top and, on the tall faces,
// one of the motifs in the middle. Battered blocks get the plane leaned with the wall.
function xaPalopoPaint(C){C.palBusy=true;const P=C.pal;let i=0;
 for(const wl of C.walls){const S=wl.s,q=wl.q||new THREE.Quaternion(),H=S[1];const km=/Bat.(\d\d)/.exec(wl.name);const kk=km?+km[1]/100:(wl.name.startsWith('xWall')?.9:1);
  const cy=(wl.name.startsWith('xBat')||wl.name.startsWith('xWall'))?wl.p[1]+H/2:wl.p[1];
  for(const f of[[0,0,1],[0,0,-1],[1,0,0],[-1,0,0]]){const half=(f[2]?S[2]:S[0])/2,len=f[2]?S[0]:S[2];if(len<2.4)continue;
   const kz=wl.name.startsWith('xWall')?(f[2]?kk:1):kk;                                        // the curtain wedge leans across its thickness only
   const tilt=Math.atan2((1-kz)*half,H);const qf=q.clone().multiply(qEuler(0,Math.atan2(f[0],f[2]),0)).multiply(qEuler(-tilt,0,0));
   const n=new THREE.Vector3(f[0],0,f[2]).applyQuaternion(q);const off=half*(1+kz)/2+.07;
   const c=[wl.p[0]+n.x*off,cy,wl.p[2]+n.z*off];
   const up=new THREE.Vector3(0,1,0).applyQuaternion(qf);const at=(dy,dz)=>[c[0]+up.x*dy+n.x*dz,c[1]+up.y*dy,c[2]+up.z*dy+n.z*dz];
   _xaKputPalopo(i%2?'xPalBand':'xPalZig',at(H*.5-.55,0),qf,[len-.5,.6,1],null);
   if(H>2.6)_xaKputPalopo(i%2?'xPalZig':'xPalBand',at(-H*.5+.7,0),qf,[len-.5,.6,1],null);
   if(H>2.6&&len>3.2){const m0=Math.min(len*.62,H*.86);const right=new THREE.Vector3(1,0,0).applyQuaternion(qf);
    // FITTING: obstacles are the openings on or near this face and anything standing in front of it (a cumba, a
    // jharokha, a portico), projected into the face frame (u along, v up); a motif is placed at the clear spot
    // nearest its preferred position, shrinking through four sizes before giving up.
    const obs=[];const proj=(o,front)=>{const d=[o.p[0]-c[0],o.p[1]-c[1],o.p[2]-c[2]];const dep=d[0]*n.x+d[2]*n.z;if(dep<-.6||dep>(front?3.5:1.6))return;
     obs.push({u:d[0]*right.x+d[2]*right.z,v:d[1],hu:Math.max(o.s[0],o.s[2])/2+.1,hv:o.s[1]/2+.1});};
    for(const o of C.opens)proj(o,false);for(const o of C.walls)if(o!==wl){const dd=[o.p[0]-c[0],o.p[2]-c[2]];if(dd[0]*n.x+dd[1]*n.z>.3)proj({p:[o.p[0],o.p[1]+(o.name.startsWith('xBat')||o.name.startsWith('xWall')?o.s[1]/2:0),o.p[2]],s:o.s},true);}
    const clear=(u,v,h)=>!obs.some(o=>Math.abs(o.u-u)<o.hu+h&&Math.abs(o.v-v)<o.hv+h);
    const want=len>9?[-len/4,len/4]:[0];let placed=0;
    for(let j=0;j<want.length;j++){let best=null;
     for(const m of[m0,m0*.82,m0*.66,m0*.5,m0*.38]){const h=m/2,v0=-H/2+1.05+h,v1=H/2-.9-h;if(v1<v0)continue;
      for(let u=-len/2+.35+h;u<=len/2-.35-h+1e-6;u+=.4)for(let v=v0;v<=v1+1e-6;v+=.35){if(!clear(u,v,h))continue;
       const sc=Math.hypot(u-want[j],(v-H*.02)*.6)-m*1.5;if(!best||sc<best.sc)best={u,v,m,sc};}
      if(best)break;}
     if(!best)continue;const a=at(best.v,.01);_xaKputPalopo(P.motifs[(i+j)%P.motifs.length],[a[0]+right.x*best.u,a[1],a[2]+right.z*best.u],qf,[best.m,best.m,1],null);
     obs.push({u:best.u,v:best.v,hu:best.m/2,hv:best.m/2});placed++;}
    C.palStats.faces++;C.palStats.placed+=placed;C.palStats.wanted+=want.length;}
   i++;}}
 C.palBusy=false;}

// ---------------------------------------------------------------- the twins
const XPALOPO_KEYS=['xa_poor_a','xa_poor_b','xa_poor_c','xa_mid_a','xa_mid_b','xa_mid_c','xa_rich_a','xa_rich_b','xa_rich_c','xa_shops','xa_bath','xa_temple','xa_house_turk_a','xa_house_turk_b','xa_shop_turk_a','xa_shop_turk_b'];
for(const k of XPALOPO_KEYS){const D=VERN.defs[k];if(!D)continue;const T=Object.assign({},D.tags,{paint:'palopo'});delete T.culture;delete T.kit;
 XA.def({key:k+'_palopo',baseKey:k,name:D.name+' (Palopó paint)',family:'Palopó paint',tags:T,w:D.w,d:D.d,h:D.h,fw:D.fw,fd:D.fd,nv:D.nv,
  build:function(G,o){reseed(31901+(o.v|0));const C=VERN.cur;o.palopo=true;C.walls=[];C.opens=[];C.palStats=(window._palopo=window._palopo||{faces:0,placed:0,wanted:0});const v=(o.v|0);
   C.pal={base:xC(XPALOPO.base[(v*2+XPALOPO_KEYS.indexOf(k))%XPALOPO.base.length]),trim:xC(XPALOPO.trim[(v+XPALOPO_KEYS.indexOf(k))%XPALOPO.trim.length]),trim2:xC(xPick(XPALOPO.trim)),
    motifs:XPALOPO.motifs.slice(v%4).concat(XPALOPO.motifs.slice(0,v%4))};
   D.build(G,o);reseed(31951+(o.v|0));xaPalopoPaint(C);
   for(let i=C.r0;i<REG.length;i++)if(!/Palopó/.test(REG[i].name))REG[i].name+=' — Palopó';}});}
