// ---------------------------------------------------------------- vessel: Hykkousoi Scroll-Sail Galley
// The Hykkousoi long-range trader-explorer, sister to their trireme: a 28 m red hull with a
// long spoon bow, a blue-and-cream wale, a cream tarp on blue hoops over the forward hold, a hooped
// stern gallery, and two tall navy sails on sweeping curved bamboo yards, embroidered with cream
// scrolls, a sawtooth border and the Hykkousoi sun-and-jar roundel. (Ref: Dragons 2 concept ship.)
function rsHykScroll(g,W,H,P){rsCloth(g,W,H,'#1f3a68',9,'v');g.save();rsPolyPath(g,P);g.clip();
 const I=rsInset(P,W*.07),I2=rsInset(P,W*.11);g.strokeStyle='#e8dcb8';g.lineWidth=W*.05;rsPolyPath(g,I);g.stroke();
 // sawtooth border along the inset outline
 g.fillStyle='#b8321e';for(let i=0;i<I.length;i++){const a=I[i],b=I[(i+1)%I.length];const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.floor(L/(W*.035)));
  for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,x0=lerp(a[0],b[0],t0),y0=lerp(a[1],b[1],t0),x1=lerp(a[0],b[0],t1),y1=lerp(a[1],b[1],t1);const nx=-(b[1]-a[1])/L,ny=(b[0]-a[0])/L;
   g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo((x0+x1)/2+nx*W*.02,(y0+y1)/2+ny*W*.02);g.closePath();g.fill();}}
 g.strokeStyle='#e8dcb8';g.lineWidth=W*.012;rsPolyPath(g,I2);g.stroke();
 // the scrolls: square-cornered spirals in rows
 g.strokeStyle='#e8dcb8';g.lineWidth=W*.018;g.lineCap='square';const sc=W*.07;
 for(let r=0;r<14;r++)for(let c=0;c<7;c++){const x=W*.12+c*W*.13+(r%2)*W*.06,y=H*.12+r*H*.062;const f=(r+c)%2?1:-1;
  g.beginPath();g.moveTo(x-sc*.6*f,y+sc*.5);g.lineTo(x-sc*.6*f,y-sc*.4);g.lineTo(x+sc*.5*f,y-sc*.4);g.lineTo(x+sc*.5*f,y+sc*.25);g.lineTo(x-sc*.2*f,y+sc*.25);g.lineTo(x-sc*.2*f,y-sc*.08);g.lineTo(x+sc*.15*f,y-sc*.08);g.stroke();}
 // the sun-and-jar roundel of the Hykkousoi, low in the sail
 const [cx]=rsCentroid(P),my=H*.72,R=W*.13;g.fillStyle='#e8dcb8';g.beginPath();g.arc(cx,my,R*1.15,0,TAU);g.fill();g.strokeStyle='#8a3418';g.lineWidth=R*.12;g.beginPath();g.arc(cx,my,R,0,TAU);g.stroke();
 g.fillStyle='#1f3a68';for(let i=0;i<14;i++){const a=i/14*TAU;g.beginPath();g.arc(cx+Math.cos(a)*R*.8,my+Math.sin(a)*R*.8,R*.07,0,TAU);g.fill();}
 g.beginPath();g.ellipse(cx,my+R*.12,R*.24,R*.3,0,0,TAU);g.fill();g.fillRect(cx-R*.1,my-R*.3,R*.2,R*.16);
 g.restore();}
function buildRsHykGalley(){reseed(71500);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const RED=0x8e3418,BLUE=0x3a7ab8,CREAM=0xe8dcb0,DK=0x3a2014;
 const H=rsHull({L:28,B:5.6,fb:1.7,dr:1.1,sheerF:1.3,sheerA:1.2,sp:2.4,pb:2.2,pa:2,q:.62,n:2.5,flare:.15,rakeF:2.6,rakeA:.9,keelEnd:.35});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?BLUE:h>.89?CREAM:h>.84?BLUE:h<.33?0x2a1a14:RED);rsFoam(B,H,.9);
 const dY=rsDeck(B,H,{bw:.45,col:0xb0906a});rsWale(B,H,.94,.08,'wood',DK);rsWale(B,H,.83,.07,'paint',CREAM);rsSpine(B,H,.16,DK,[[H.xAt(1,1)+.5,H.ys(1)+.6],[H.xAt(1,1)+.3,H.ys(1)+1.2]]);
 for(const a of rsAlong(H,.3,.9,16,.86))rsBox(B,'paint',[.35,.35,.05],[a.p[0]+a.n.x*.05,a.p[1],a.p[2]+a.n.z*.05],[0,0,Math.PI/4],CREAM);
 // the tarp over the forward hold, on blue hoops
 const x0=2,x1=10.5,cy=dY(.6),hw=H.halfAt(H.uAt(6),cy)*.82;rsVault(B,'cloth',x0,x1,cy+.3,hw,1.8,0xd8d4a4,12,12,2);
 for(let i=0;i<=6;i++){const x=lerp(x0,x1,i/6),pts=[];for(let j=0;j<=12;j++){const a=j/12*Math.PI;pts.push([x,cy+.3+Math.sin(a)*1.84,Math.cos(a)*(hw+.04)]);}rsTube(B,'paint',pts,.07,BLUE,24,6);}
 for(const s of[-1,1])for(let i=0;i<8;i++){const x=lerp(x0,x1,i/7);rsRope(B,[x,cy+.3,s*hw],[x+.3,cy-.1,s*(hw+.4)],.03,0x6a5a40);}
 // the hooped stern gallery
 const xs=H.xAt(.06,1);for(let i=0;i<3;i++){const pts=[];for(let j=0;j<=16;j++){const a=j/16*Math.PI;pts.push([xs+i*1.2-Math.sin(a)*.8,dY(.1)+Math.sin(a)*2.4,Math.cos(a)*2.2]);}rsTube(B,'paint',pts,.1,i%2?CREAM:BLUE,32,6);}
 rsCabin(B,{x:-8.5,y:dY(.2),w:4,d:3.4,h:1.9,wall:0x6a3a1e,win:3,roof:'vault',roofMk:'wood',roofCol:0x7a4a28,rh:.7,over:.25});
 // two tall sails on curved bamboo yards
 [[-1.5,15],[-8,12]].forEach(([mx,mh],i)=>{const base=dY(H.uAt(mx));rsBamboo(B,[mx,base-.3,0],[mx,base+mh*.62+2,0],.16,0x9a7a44,1.2);
  const S=rsSail(B,{key:'hyk-scroll',O:[mx+.3,base+3.3,.35],U:[-1,0,0],V:[0,1,0],belly:-.8,nu:22,nv:12,
   A:t=>[t*.9,t*mh],Bf:t=>[lerp(mh*.62,.9,t)+Math.sin(Math.PI*t)*mh*.12,lerp(.1,mh,Math.pow(t,1.1))],draw:rsHykScroll});
  // the curved yard runs past the head and the clew; the boom along the foot
  const yd=[];for(let k=0;k<=18;k++)yd.push(S.at(k/18,1));const e0=yd[0],e1=yd[yd.length-1];yd.unshift([e0[0]+1.2,e0[1]-.6,e0[2]]);yd.push([e1[0]+.4,e1[1]+1.6,e1[2]]);
  rsTube(B,'wood',yd,t=>.17*(1-.5*t),0x9a7a44,60,8);for(let k=1;k<yd.length-1;k+=2)rsSphere(B,'rope',.19,yd[k],[1,.5,1],0x5a4128,8,4);
  rsLink(B,'wood',S.at(0,0),S.at(0,1),.1,0x9a7a44,6);rsRope(B,e1,[H.xAt(1,1),H.ys(1)+.4,0]);rsRope(B,S.at(1,0),[mx+.3,base,0]);});
 // the paddle-rudder and the stern sweep; cargo; crew
 {const p=H.pt(.92,1,1);rsLink(B,'wood',[p[0],p[1]+1.6,p[2]+.2],[p[0]+.6,-2.2,p[2]+.5],.12,0x6a4a2c,6);rsBox(B,'wood',[1,2.2,.12],[p[0]+.5,-1.5,p[2]+.5],null,0x6a4a2c);}
 for(let i=0;i<8;i++){const x=rr(-6,-3),z=rr(-1.8,1.8);rsCyl(B,'wood',.35,.35,.9,[x,dY(H.uAt(x))+.45,z],null,0x7a5a36,10);}
 for(const [x,z] of[[-11,.3],[-4.5,1.4],[-2,-1.5],[1.2,.9]])rsFigure(B,[x,dY(H.uAt(x)),z],rr(-.6,.6),[0x3a5a8a,0xd8c8a0,0x8a3a1c][Math.floor(rng()*3)]);
 rsBake(B,V.group,'hykGalley');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'hykGalley',name:'Hykkousoi Scroll-Sail Galley',culture:'hykkousoi',L:32,B:8,H:19,
 tags:{type:['explorer','merchant'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:24,role:'long-range trader and survey ship'},
 blurb:'Two navy sails on sweeping bamboo yards, cream scrolls and the sun-and-jar roundel, a tarp over the hold.',build:buildRsHykGalley});
