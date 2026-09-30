// ---------------------------------------------------------------- vessel: Voth Chitin Bireme
// The Voth build their fast raiders the old way, on the shell of something that lived: a 30 m hull
// of lacquered chitin, its deck roofed by seven overlapping carapace segments like a beetle's back,
// an insect prow of compound eyes and hooked mandibles, the abdomen's sting curling up at the stern.
// Two banks of oars; two ribbed fan sails of ochre silk on bone ribs, the black Voth sigil on each.
// (Ref: the ribbed fan sails of the Dragons 2 sketches; Dunmer chitin; the turtle ship's idea of a roof.)
function rsFanOchre(g,W,H,P){rsCloth(g,W,H,'#c8923a',1,'v');g.save();rsPolyPath(g,P);g.clip();
 const gr=g.createLinearGradient(0,H,0,0);gr.addColorStop(0,'rgba(120,50,10,.35)');gr.addColorStop(1,'rgba(255,220,150,.15)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 const [cx,cy]=rsCentroid(P);g.strokeStyle='#1a1410';g.fillStyle='#1a1410';g.lineWidth=W*.025;g.beginPath();g.arc(cx,cy,W*.12,0,TAU);g.stroke();
 g.beginPath();g.moveTo(cx,cy-W*.2);g.lineTo(cx,cy+W*.2);g.moveTo(cx-W*.16,cy-W*.06);g.lineTo(cx+W*.16,cy-W*.06);g.stroke();g.beginPath();g.arc(cx,cy+W*.05,W*.04,0,TAU);g.fill();
 g.strokeStyle='#4a2a10';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();g.restore();}
function buildRsVothChitin(){reseed(72100);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();const CH=lin(0x2e2016),CH2=lin(0x2a1c14),DK=lin(0x120c08);   // the Voth lacquer: the same brown-black as the Ordinator Flagship (RS_VOTH_HULL)
 const H=rsHull({L:30,B:5.8,fb:2.1,dr:1.2,sheerF:1.1,sheerA:1.6,sp:2.2,pb:2,pa:2.4,q:.55,n:2.2,flare:.2,rakeF:1.2,rakeA:.8,keelEnd:.3,tile:3});
 rsHullMesh(B,H,'chitin',(u,h,s)=>h<.32?lin(0x1a120c):h>.9?CH2:CH);rsFoam(B,H,.9);const dY=rsDeck(B,H,{bw:.35,col:0x3a2a1c,mk:'chitin'});
 rsWale(B,H,.9,.1,'metal',0x8a6a30);rsWale(B,H,.6,.08,'chitin',0x140c08);
 // seven overlapping carapace segments, each a little higher than the one ahead of it
 const cy=dY(.5);for(let i=0;i<7;i++){const x0=lerp(-10,7,i/7),x1=x0+3.2,hw=H.halfAt(H.uAt(x0+1.6),cy)*.9+.15,r=1.3+Math.sin(Math.PI*(i+.5)/7)*.6;
  const g=rsGrid((u,v)=>{const a=v*Math.PI,x=lerp(x0,x1,u),k=1+.12*u;return[x,cy+.2+Math.sin(a)*r*k-u*.15,Math.cos(a)*hw*k];},6,12,(u,v,p)=>[p[0]/3,v*2]);rsPut(B,'chitin',g,null,null,null,i%2?CH:lin(0x3a2a1c));
  const rim=[];for(let j=0;j<=12;j++){const a=j/12*Math.PI;rim.push([x1,cy+.2+Math.sin(a)*r*1.12-.15,Math.cos(a)*hw*1.12]);}rsTube(B,'chitin',rim,.07,DK,24,5);}
 // the insect prow: compound eyes, hooked mandibles, feelers; the sting at the stern
 const pb=H.pt(1,0,1);rsSphere(B,'chitin',1.1,[pb[0]-.6,pb[1]+.3,0],[1.3,.8,1],CH2,14,10);
 for(const s of[-1,1]){rsSphere(B,'metal',.55,[pb[0]-.2,pb[1]+.55,s*.75],[1,1,1],0x101c14,12,10);
  rsTube(B,'chitin',[[pb[0]-.2,pb[1]-.1,s*.5],[pb[0]+1.4,pb[1]-.2,s*1],[pb[0]+2.6,pb[1]-.1,s*.6],[pb[0]+2.9,pb[1],s*.05]],t=>.2*(1-.8*t),DK,24,8);
  rsTube(B,'chitin',[[pb[0]-.2,pb[1]+.9,s*.4],[pb[0]+.8,pb[1]+2.6,s*.9],[pb[0]+2.4,pb[1]+3.4,s*1.4]],t=>.05*(1-.6*t),DK,16,5);}
 const pa=H.pt(0,0,1);rsTube(B,'chitin',[[pa[0]+.6,pa[1]-.3,0],[pa[0]-.6,pa[1]+.6,0],[pa[0]-1,pa[1]+2.2,0],[pa[0]-.2,pa[1]+3.4,0],[pa[0]+.8,pa[1]+3.3,0]],t=>.45*(1-.85*t),CH2,40,10);
 // two banks of oars
 rsOars(V,H,{name:'lower bank',uA:.2,uB:.8,n:16,hF:.5,len:5.4,inb:1.3,r:.045,col:0x3a2a1a,phase:0});
 rsOars(V,H,{name:'upper bank',uA:.22,uB:.78,n:14,hF:.76,len:6.5,inb:1.6,r:.05,col:0x3a2a1a,phase:.2});
 // two ribbed fan sails: bone ribs radiating from a boss at the mast foot
 [[2,12.5,1],[-7,9.5,.85]].forEach(([mx,mh,k])=>{const base=cy+2.2;rsLink(B,'paint',[mx,base-1.5,0],[mx,base+mh,0],.18,0xe8dcc0,8,.12);
  const R=mh*.95,a0=.1,a1=1.25,A0=[0,0];
  const S=rsSail(B,{key:'voth-fan',O:[mx,base+.6,.3],U:[-1,0,0],V:[0,1,0],belly:.6,nu:24,nv:10,
   A:t=>A0,Bf:t=>{const a=lerp(Math.PI/2-a0,Math.PI/2-a1,t);const rr0=R*(1-.07*Math.sin(t*Math.PI*6)**2);return[Math.cos(a)*rr0,Math.sin(a)*rr0];},draw:rsFanOchre});
  for(let i=0;i<=6;i++){const t=i/6,pts=[];for(let j=0;j<=6;j++)pts.push(S.at(t,j/6));rsTube(B,'paint',pts,t=>.07*(1-.5*t),0xe8dcc0,12,5);}
  rsRope(B,[mx,base+mh,0],[H.xAt(1,1),H.ys(1),0]);rsRope(B,S.at(1,1),[mx-7*k,cy+.5,0]);});
 for(const x of[-12,-1,6])rsFigure(B,[x,x<-11?dY(H.uAt(x)):cy+2.1,rr(-.4,.4)],rr(0,TAU),[0x4a3a5a,0x8a3a1c,0x2a2a2a][Math.floor(rng()*3)],false,0x8a8aa0);
 rsBake(B,V.group,'vothChitin');V.deckY=cy;return V;}
RS_VESSEL({key:'vothChitin',name:'Voth Chitin Bireme',culture:'voth',L:34,B:17,H:16,
 tags:{type:['warship','bireme','turtle ship'],propulsion:['oars','sail'],hull:'monohull',wealth:'state',crew:80,role:'fast raider'},
 blurb:'A lacquered chitin hull roofed by seven carapace segments, an insect prow, two banks of oars, ribbed fan sails.',build:buildRsVothChitin});
