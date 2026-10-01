// ---------------------------------------------------------------- vessel: Hykkousoi Siege Hexareme
// The Hykkousoi's siege ship, the heaviest thing on the Ring Sea that still rows: a 48 m hull with
// three banks of great oars pulled two men to the oar, a bronze triple ram, shields along the rails,
// two crenellated fighting towers fore and aft, a torsion stone-thrower amidships, a boarding bridge
// raised on its post at the bow, one great square sail with the Hykkousoi wave-sun and a small
// artemon on a raked foremast. The blue aphlaston of the trireme curls over the stern.
function rsHykWaveSun(g,W,H,P){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#e6eff0');gr.addColorStop(1,'#bcd2d8');g.fillStyle=gr;g.fillRect(0,0,W,H);
 rsCloth(g,W,H,'rgba(0,0,0,0)',8,'v');g.save();rsPolyPath(g,P);g.clip();g.lineWidth=W*.06;g.strokeStyle='#3f6a82';rsPolyPath(g,P);g.stroke();
 const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.26;g.fillStyle='#d8a640';g.beginPath();g.arc(cx,cy-R*.15,R*.55,Math.PI,0);g.fill();
 for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;g.strokeStyle='#d8a640';g.lineWidth=R*.07;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.65,cy-R*.15+Math.sin(a)*R*.65);g.lineTo(cx+Math.cos(a)*R*.95,cy-R*.15+Math.sin(a)*R*.95);g.stroke();}
 g.strokeStyle='#2c5a74';g.lineWidth=R*.1;for(let k=0;k<3;k++){g.beginPath();for(let x=-R;x<=R;x+=4){const y=cy+k*R*.22+Math.sin(x/R*Math.PI*2)*R*.08;x===-R?g.moveTo(cx+x,y):g.lineTo(cx+x,y);}g.stroke();}g.restore();}
function buildRsHykHexareme(){reseed(72200);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BLUE=0x3f86a6,TEAL=0x5fb4c0,WOOD=0x7a5030,GOLD=0xd8a640,DARK=0x3a2a1e;
 const H=rsHull({L:48,B:8,fb:2.8,dr:1.6,sheerF:1.4,sheerA:2.4,sp:2.6,pb:2.5,pa:2,q:.55,n:2.8,flare:.12,rakeF:1.2,rakeA:1.6,keelEnd:.3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?BLUE:h>.85?GOLD:h<.3?0x3a3a30:(u>.9&&h>.35?GOLD:WOOD),80,14);rsFoam(B,H,1.1);
 const dY=rsDeck(B,H,{bw:.7,col:0xa88a64});rsWale(B,H,.86,.1,'paint',GOLD);rsWale(B,H,.66,.12,'wood',0x5a3822);rsWale(B,H,.46,.1,'wood',0x5a3822);rsSpine(B,H,.26,DARK);
 // outrigger box for the top bank, the three banks of great oars
 for(const s of[-1,1]){const x0=H.xAt(.18,1),x1=H.xAt(.82,1),hw=H.hb(.5)+.6;rsBox(B,'paint',[x1-x0,.6,.4],[(x0+x1)/2,H.ys(.5)-.05,s*hw],null,BLUE);}
 rsOars(V,H,{name:'lower bank',uA:.2,uB:.8,n:24,hF:.5,len:7,inb:2,r:.06,bladeW:.24,col:0x8a6a48,rate:.36,phase:0});
 rsOars(V,H,{name:'middle bank',uA:.21,uB:.79,n:23,hF:.72,len:8.2,inb:2.4,r:.065,bladeW:.26,col:0x8a6a48,rate:.36,phase:.15});
 rsOars(V,H,{name:'upper bank',points:Array.from({length:22},(_,i)=>[lerp(H.xAt(.22,1),H.xAt(.78,1),i/21),H.ys(.5)+.15,H.hb(.5)+.75]),len:9.5,inb:2.8,r:.07,bladeW:.28,col:0x8a6a48,rate:.36,phase:.3});
 // shields along both rails
 for(const a of rsAlong(H,.22,.8,20,1)){const aa={p:[a.p[0],a.p[1]+.5,a.p[2]],n:a.n};rsShield(B,aa,.45,[BLUE,0xe8e0cc,GOLD][Math.floor(a.u*40)%3],GOLD);}
 // stern: aphlaston; bow: ram, gilded forefoot, eyes
 const pS=H.pt(0,0,1);rsScroll(B,[pS[0]-.1,pS[1]-.2,0],2.8,1.15,.5,BLUE,1);for(let i=0;i<5;i++)rsScroll(B,[pS[0]-.3,pS[1]-.1,(i-2)*.38],1.5,.9,.14,TEAL,1);
 const pW=H.pt(1,0,.3);rsRam(B,pW[0]-.5,pW[1],3.8,3,GOLD,'bronze');
 for(const s of[-1,1]){rsDecal(B,H,.94,s,.72,.65,BLUE,'paint',20,.12);rsDecal(B,H,.94,s,.72,.42,0xf0e8d8,'paint',20,.16);rsDecal(B,H,.94,s,.72,.22,0xa02818,'paint',16,.2);}
 // the fighting towers, fore and aft, crenellated, with banners
 const tower=(x,h)=>{const y=dY(H.uAt(x)),w=4.2,d=5;const top=rsCabin(B,{x,y,w,d,h,wall:0x8a6a44,win:2,winCol:0x1a1410,roof:'flat',roofCol:0x6a4a30,over:.3});
  for(let i=0;i<5;i++)for(const s of[-1,1]){rsBox(B,'wood',[.5,.7,.3],[x-w/2+.2+i*(w-.4)/4,top+.35,s*(d/2+.15)],null,0x8a6a44);rsBox(B,'wood',[.3,.7,.5],[x+s*(w/2+.15),top+.35,-d/2+.2+i*(d-.4)/4],null,0x8a6a44);}
  rsLink(B,'wood',[x,top,0],[x,top+4,0],.05,DARK,5);rsPennant(B,[x,top+4,0],3,.9,[BLUE,GOLD]);rsFigure(B,[x+1,top,1],0,BLUE);rsFigure(B,[x-1,top,-1.2],Math.PI,0xe8e0cc);return top;};
 tower(15.5,5);tower(-15,5.5);
 // the torsion stone-thrower amidships
 {const x=6,y=dY(H.uAt(x));rsBox(B,'wood',[3.4,.4,2.4],[x,y+.2,0],null,0x6a4a2c);for(const s of[-1,1])rsBox(B,'wood',[.35,2.2,.35],[x+.6,y+1.3,s*.8],null,0x6a4a2c);
  rsLink(B,'wood',[x+.6,y+2.4,-1],[x+.6,y+2.4,1],.12,0x6a4a2c,6);rsCyl(B,'rope',.3,.3,1.4,[x+.6,y+1.1,0],[Math.PI/2,0,0],0x8a7a5a,10);
  rsLink(B,'wood',[x+.6,y+1.1,0],[x-1.8,y+3.4,0],.1,0x5a3a24,6);rsSphere(B,'rope',.35,[x-1.9,y+3.5,0],null,0x6a6058,8,6);for(let i=0;i<4;i++)rsSphere(B,'paint',.3,[x-1.2+i*.3,y+.5,1.4],null,0x8a8278,8,6);}
 // the boarding bridge raised on its post at the bow
 {const x=20,y=dY(H.uAt(x));rsLink(B,'wood',[x,y,0],[x,y+7,0],.18,DARK,8);const a=[x-.3,y+2,0],b=[x+3.5,y+8.6,0];
  for(const s of[-1,1])rsLink(B,'wood',[a[0],a[1],s*.6],[b[0],b[1],s*.6],.08,0x6a4a2c,5);for(let i=0;i<9;i++){const t=i/8;rsBox(B,'wood',[.35,.08,1.3],[lerp(a[0],b[0],t),lerp(a[1],b[1],t),0],[0,0,Math.atan2(b[1]-a[1],b[0]-a[0])],0x8a6a44);}
  rsCone(B,'metal',.15,1.2,[b[0]+.2,b[1]-.6,0],[0,0,Math.PI*.8],0x6a6a6a,6);rsRope(B,[x,y+7,0],[b[0],b[1],0]);}
 // the great square sail on the mainmast, braced; the artemon on its raked foremast
 const base=dY(.5),mx=-1,mh=24;rsLink(B,'wood',[mx,base-1,0],[mx,base+mh,0],.3,0x7a5634,8,.18);
 const w=17,a=.95,U=[Math.sin(a),0,Math.cos(a)];
 const S=rsSail(B,{key:'hyk-wavesun',O:[mx+.4,base+6,0],U,V:[0,1,0],belly:-1.4,A:t=>[(t-.5)*w,mh-6.8+Math.abs(t-.5)*1.2],Bf:t=>[(t-.5)*w*.92,0],draw:rsHykWaveSun});
 rsSailEdge(B,S,0,.2,0x6a4a2c);rsSailEdge(B,S,1,.1,0x6a4a2c);const tp=[mx,base+mh,0];rsRope(B,tp,S.at(0,0));rsRope(B,tp,S.at(1,0));rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[H.xAt(0,1)+1,H.ys(0),0]);
 rsPennant(B,[mx,base+mh+.2,0],5,.9,[BLUE,0xf0e8d8]);
 {const fx=18.5,fy=dY(H.uAt(fx)),ft=[fx+4.5,fy+9,0];rsLink(B,'wood',[fx,fy,0],ft,.14,0x7a5634,8,.1);const w2=5.5;
  const S2=rsSail(B,{key:'hyk-wavesun',O:[ft[0]-2.4,fy+3.6,0],U:[Math.sin(.9),0,Math.cos(.9)],V:[.25,1,0],belly:-.6,A:t=>[(t-.5)*w2,4.6],Bf:t=>[(t-.5)*w2*.9,0],draw:rsHykWaveSun});rsSailEdge(B,S2,0,.09,0x6a4a2c);}
 for(const x of[-8,-4,2,9])rsFigure(B,[x,dY(H.uAt(x)),rr(-2,2)],rr(0,TAU),[0x3a5a78,0xe0d8c8,0x8a3020][Math.floor(rng()*3)]);
 for(const s of[-1,1]){const p=H.pt(.07,s,.9);rsLink(B,'wood',[p[0]+1,p[1]+.6,p[2]*1.05],[p[0]-3,-1.6,p[2]*1.25],.12,0x7a5634,6);rsBox(B,'wood',[2,1.1,.1],[p[0]-2.6,-1.3,p[2]*1.24],[0,0,.55],0x7a5634);}
 rsBake(B,V.group,'hykHexareme');V.deckY=base;return V;}
RS_VESSEL({key:'hykHexareme',name:'Hykkousoi Siege Hexareme',culture:'hykkousoi',L:55,B:30,H:29,
 tags:{type:['warship','hexareme','siege ship'],propulsion:['oars','sail'],hull:'monohull',wealth:'state',crew:420,role:'siege and line-breaking'},
 blurb:'Three banks of great oars, twin crenellated towers, a stone-thrower, a raised boarding bridge and a wave-sun square sail.',build:buildRsHykHexareme});
