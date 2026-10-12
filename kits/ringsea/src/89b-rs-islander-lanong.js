// ---------------------------------------------------------------- vessel: Islander Lanong (pirate raider)
// The islands' voyagers have lately turned pirate, and this is what they hunt in: a beamy 25 m hull with a
// beak, outriggers each side for two rows of paddlers, two tripod masts under tanja sails patched from whatever
// was taken (salvaged canvas, sackcloth, a square of Voth purple, a Hykkousoi blue), a raised fighting platform
// at the bow behind scrap-iron plates with a captured Republic iron gun and bronze swivel guns (lantaka) on
// the rails. The planking is every colour it was stolen in, the bulwarks are hung with iron plates, the
// captain's hut aft is hung with other peoples' shields, a gilded Xanadu swan head is lashed under the beak,
// and the white moon flies over a captured Voth flag. (Ref: the Iranun lanong, the lantaka.)
function rsLanongPatched(k){return(g,W,H,P)=>{rsCloth(g,W,H,'#9a8462',9,'h');g.save();rsPolyPath(g,P);g.clip();
 const C=['#d8d0bc','#7a6448','#5a3a72','#b8a888','#c83a24','#3f6a82','#d8d0bc','#6a5a3a'];
 for(let i=0;i<9;i++){const w=W*(.1+.15*h3(i,k,1)),h=H*(.08+.17*h3(i,k,2)),x=h3(i,k,3)*(W-w),y=h3(i,k,4)*(H-h);g.fillStyle=C[Math.floor(h3(i,k,5)*C.length)];g.fillRect(x,y,w,h);
  g.strokeStyle='rgba(30,20,10,.55)';g.setLineDash([W*.012,W*.01]);g.lineWidth=W*.006;g.strokeRect(x+3,y+3,w-6,h-6);g.setLineDash([]);}
 // the crude white moon, daubed on over the patches
 const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.2;g.fillStyle='rgba(236,228,210,.92)';g.beginPath();g.ellipse(cx+W*.03,cy,R*1.05,R*.94,.2,0,TAU);g.fill();
 for(let i=0;i<5;i++){g.fillRect(cx-R*.6+i*R*.3,cy+R*.85,R*.06,R*(.3+.4*h3(i,k,7)));}
 g.strokeStyle='#3a2a18';g.lineWidth=W*.03;rsPolyPath(g,P);g.stroke();g.restore();
 // a ragged hole the shot went through
 g.globalCompositeOperation='destination-out';g.beginPath();const hx=W*(.25+.4*h3(k,1,9)),hy=H*(.25+.3*h3(k,2,9));for(let i=0;i<9;i++){const a=i/9*TAU,r=W*.025*(.6+.8*h3(i,k,8));i?g.lineTo(hx+Math.cos(a)*r,hy+Math.sin(a)*r):g.moveTo(hx+r,hy);}g.fill();g.globalCompositeOperation='source-over';};}
function rsLanongFlag(g,W,H,P){rsCloth(g,W,H,'#2a1e18',4,'v');g.fillStyle='#ece4d2';g.beginPath();g.arc(W*.42,H*.5,Math.min(W,H)*.3,0,TAU);g.fill();
 g.globalCompositeOperation='destination-out';for(let i=0;i<4;i++){g.beginPath();g.moveTo(W,H*i/4);g.lineTo(W*.86,H*(i+.5)/4);g.lineTo(W,H*(i+1)/4);g.fill();}g.globalCompositeOperation='source-over';}
function rsLanongVothFlag(g,W,H,P){const C=RS_CULT.voth;rsCloth(g,W,H,C.field,4,'v');g.fillStyle=C.edge;g.fillRect(0,0,W,H*.12);g.fillRect(0,H*.88,W,H*.12);
 rsSymDiamond(g,W*.4,H*.5,Math.min(W,H)*.3,C.ink);g.fillStyle='rgba(20,10,4,.35)';g.fillRect(W*.6,H*.3,W*.2,H*.25);   // scorched
 g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(W,0);for(let i=0;i<=8;i++)g.lineTo(W*(.78+.12*h3(i,3,3)),H*i/8);g.lineTo(W,H);g.fill();g.globalCompositeOperation='source-over';}
// one hoist: their own flag, and the Voth flag lashed on beneath it (one sail material for both)
function rsLanongHoist(g,W,H,P){const h1=H*.44,h2=H*.49;g.save();g.beginPath();g.rect(0,0,W,h1);g.clip();rsLanongFlag(g,W,h1,P);g.restore();
 g.save();g.translate(0,h2);g.beginPath();g.rect(0,0,W*.92,H-h2);g.clip();rsLanongVothFlag(g,W*.92,H-h2,P);g.restore();g.fillStyle='#8a7a5a';g.fillRect(0,h1,W*.05,h2-h1);}
function buildRsIslanderLanong(){reseed(74000);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BARK=0x4a2e1c,DK=0x1e1612,SAND=0xc8b080,TEAL=0x2a6a6a,MOON=0xf0e8d4,BAM=0xb8a068,IRON=0x3a3836,BRASS=0xb08a40;
 const RED=rsLin(0x8a2a1c),PURP=rsLin(0x4b2a6e),HYK=0x3f86a6,GOLD=0xd8a640;
 // the hull: beamy, every plank run the colour it was taken in
 const PATCH=[BARK,BARK,BARK,0x5a3a24,RED,TEAL,PURP,0x9a948a,0x5a4a2c];
 const H=rsHull({L:25,B:5.2,fb:1.7,dr:1.2,sheerF:1.4,sheerA:1.7,sp:2.5,pb:2.3,pa:2,q:.55,n:2.6,flare:.18,rakeF:1.3,rakeA:.8,keelEnd:.35});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?DK:h<.32?0x221810:PATCH[Math.floor(h3(Math.floor(u*11),Math.floor(h*6),s>0?1:2)*PATCH.length)],72,12);rsFoam(B,H,.8);
 const dY=rsDeck(B,H,{bw:.6,col:0x8a7050}),D0=dY(.5);rsWale(B,H,.93,.07,'wood',0x3a2a1c);rsWale(B,H,.7,.05,'rope',SAND);
 const pb=H.pt(1,0,1),pa=H.pt(0,0,1);
 rsSpine(B,H,.17,DK,[[pb[0]+.7,pb[1]+.3],[pb[0]+1.5,pb[1]+.8],[pb[0]+2.3,pb[1]+1.1]],[[pa[0]-.4,pa[1]+.9],[pa[0]-.5,pa[1]+2.2],[pa[0]-.2,pa[1]+3]]);
 for(const s of[-1,1]){rsDecal(B,H,.93,s,.75,.38,MOON,'paint',16,.05);rsDecal(B,H,.93,s,.75,.14,DK,'paint',12,.08);}
 // scrap iron plates hung on the bulwarks, any size, any angle
 for(const s of[-1,1])for(let i=0;i<9;i++){const u=lerp(.2,.84,(i+rr(-.3,.3))/8),hF=rr(.8,.9),p=H.pt(u,s,hF),N=H.nrm(u,s,hF);
  rsBox(B,'rust',[rr(.7,1.3),rr(.45,.7),.05],[p[0]+N.x*.06,p[1]+N.y*.06,p[2]+N.z*.06],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N).multiply(qEuler(0,0,rr(-.12,.12))),null,1);}
 // the trophy under the beak: a gilded Xanadu swan head, lashed upside down
 rsTube(B,'paint',[[pb[0]+1.4,pb[1]+.75,0],[pb[0]+1.8,pb[1]+.1,0],[pb[0]+1.6,pb[1]-.6,0],[pb[0]+2.1,pb[1]-.9,0]],.09,GOLD,16,6);rsSphere(B,'paint',.17,[pb[0]+2.2,pb[1]-.95,0],[1.3,1,.9],GOLD,8,6);
 rsCone(B,'paint',.06,.3,[pb[0]+2.45,pb[1]-1.05,0],[0,0,-Math.PI*.6],0xc84a20,5);rsRope(B,[pb[0]+1.5,pb[1]+.7,0],[pb[0]+2.1,pb[1]+.98,0],.03,SAND);
 // outriggers: four booms, floats, two bamboo stringers a side, the paddlers
 const yB=H.ys(.5)+.15,zF=7.6;
 for(const x of[-6.5,-2.2,2.2,6.5]){rsLink(B,'wood',[x,yB,-zF-.3],[x,yB,zF+.3],.1,BAM,6);for(const s of[-1,1]){rsLink(B,'wood',[x,yB,s*zF],[x,.22,s*zF],.07,BAM,5);rsBox(B,'rope',[.24,.22,.24],[x,yB,s*zF],null,SAND);}}
 for(const s of[-1,1]){const F=rsHull({L:15,B:.55,fb:.24,dr:.22,sheerF:.25,sheerA:.25,pb:2,pa:2,q:.5,n:2,z0:s*zF,keelEnd:0});rsHullMesh(B,F,'wood',()=>0x5a4630,24,6);rsFoam(B,F,.3);
  for(const z of[3.7,4.9])rsBamboo(B,[-7,yB+.12,s*z],[7,yB+.12,s*z],.07,BAM,1.2,0x7a6040);}
 const pts=[];for(let j=0;j<2;j++)for(let i=0;i<6;i++)pts.push([lerp(-5.5,5.5,i/5)+j*.5,yB+.12+.62,3.7+1.2*j]);
 for(const P of pts)for(const s of[-1,1])rsFigure(B,[P[0]-.2,P[1]-.62,s*P[2]],0,[RED,TEAL,0x7a6448,PURP,0x9a948a][Math.floor(h3(P[0],P[2],s)*5)],true,0x6a4028);
 rsOars(V,H,{name:'paddles',points:pts.map(p=>[p[0],p[1]+.3,p[2]+.3]),len:3.6,inb:.25,r:.032,bladeL:.6,bladeW:.2,col:0x7a5a3a,sweep:.5,lift:.3,rate:.8,pitch:1.1,immerse:.2,ripple:.45});
 // a swivel gun (lantaka) on its fork at p, pointing along d
 const swivel=(p,d,col,mk)=>{const D=new THREE.Vector3(d[0],d[1],d[2]).normalize(),q=[p[0],p[1]+.45,p[2]];rsLink(B,'wood',p,[p[0],p[1]+.32,p[2]],.06,0x3a2a1c,5);
  for(const s of[-1,1])rsLink(B,'metal',[p[0],p[1]+.3,p[2]],[q[0]-D.z*s*.1,q[1],q[2]+D.x*s*.1],.025,IRON,4);
  const a=[q[0]-D.x*.45,q[1]-D.y*.45,q[2]-D.z*.45],b=[q[0]+D.x*.75,q[1]+D.y*.75,q[2]+D.z*.75];rsLink(B,mk,a,b,.085,col,8,.06);
  rsLink(B,mk,[b[0]-D.x*.06,b[1]-D.y*.06,b[2]-D.z*.06],[b[0]+D.x*.04,b[1]+D.y*.04,b[2]+D.z*.04],.085,col,8);rsSphere(B,mk,.08,a,null,col,6,4);
  rsLink(B,'wood',a,[a[0]-D.x*.5,a[1]-D.y*.5-.15,a[2]-D.z*.5],.025,0x5a3a24,4);};
 for(const x of[-3,1,5.3])for(const s of[-1,1]){const u=H.uAt(x),p=H.pt(u,s,1),N=H.nrm(u,s,1);swivel(p,[N.x+.2,.12,N.z],x>0?BRASS:0x5a8a70,'metal');}
 // the raised fighting platform at the bow, breastworked with iron plates, the captured Republic gun
 const fx0=9.4,fx1=11.4,fyy=dY(H.uAt(10.4))+1.1;
 rsBox(B,'wood',[fx1-fx0+.2,.14,3.6],[(fx0+fx1)/2,fyy-.07,0],null,0x6a4a2c);
 for(const x of[fx0+.15,fx1-.15])for(const s of[-1,1])rsLink(B,'wood',[x,dY(H.uAt(x)),s*1.2],[x,fyy-.1,s*1.6],.09,0x5a3a24,5);
 rsBox(B,'rust',[.05,.6,3.4],[fx1+.1,fyy+.3,0],null,1);for(const s of[-1,1])rsBox(B,'rust',[fx1-fx0+.2,.6,.05],[(fx0+fx1)/2,fyy+.3,s*1.8],null,1);
 rsBox(B,'wood',[1,.3,.7],[10.3,fyy+.25,0],null,0x4a3a2a);for(const s of[-1,1])rsCyl(B,'wood',.22,.22,.08,[10.3,fyy+.22,s*.38],[Math.PI/2,0,0],0x3a2a1c,10);
 rsLink(B,'metal',[9.7,fyy+.62,0],[12.1,fyy+.66,0],.17,IRON,10,.12);rsLink(B,'metal',[12,fyy+.66,0],[12.15,fyy+.66,0],.16,IRON,10);rsSphere(B,'metal',.15,[9.65,fyy+.62,0],null,IRON,8,6);
 for(const s of[-1,1])swivel([fx1,fyy+.2,s*1.6],[1,.08,s*.5],BRASS,'metal');
 rsFigure(B,[9.9,fyy,1],0,RED,false,0x6a4028);rsFigure(B,[9.9,fyy,-1],0,TEAL,false,0x6a4028);
 for(let i=0;i<5;i++)rsSphere(B,'metal',.09,[9.8+i*.2,fyy+.09,-1.45],null,IRON,6,4);
 // a tripod mast (side legs and a centre leg raking aft) and a tanja slung forward of it, patched
 const tanja=(mx,oy)=>{const base=dY(H.uAt(mx)),top=oy+5.6,ap=[mx,top,0];
  for(const [x,z] of[[mx-1.5,-1.8],[mx-1.5,1.8],[mx-2.1,0]])rsLink(B,'wood',[x,dY(H.uAt(x)),z],ap,.11,0x4a3420,6);
  rsSphere(B,'rope',.2,ap,[1,1.4,1],SAND,8,6);rsLink(B,'wood',[mx,base,0],[mx,base+1.9,0],.13,0x4a3420,6);
  rsRig(B,[mx,0]);const S=rsSail(B,{key:'lanong-tanja',O:[mx+.3,oy,.3],U:[-.97,.26,0],V:[.3,1,0],belly:-.55,nu:12,nv:10,
   A:t=>[lerp(-5.4,-.2,t),4.6],Bf:t=>[lerp(-4.6,-.9,t),0],draw:rsLanongPatched(3)});
  rsSailEdge(B,S,0,.08,0x4a3420,-.03,1.03);rsSailEdge(B,S,1,.07,0x4a3420,-.03,1.03);rsRope(B,ap,S.at(.8,0));rsRope(B,ap,S.at(.3,0));
  const tk=S.at(0,1);rsRope(B,tk,[tk[0]+.8,dY(H.uAt(tk[0]+.8)),0]);rsRigEnd(B);
  rsLink(B,'wood',ap,[mx,top+1.5,0],.035,DK,4);for(const s of[-1,1])rsRope(B,ap,[mx-1.2,dY(H.uAt(mx-1.2)),s*2.6]);return ap;};
 const apF=tanja(3.2,D0+3.2),apM=tanja(-5,D0+3);
 rsPennant(B,[apF[0],apF[1]+1.5,0],2.6,.4,[HYK,GOLD]);rsPennant(B,[apM[0],apM[1]+1.5,0],3,.45,[rsLin(0xe07a2a),rsLin(0x2f8f8a)]);
 rsRope(B,apF,apM);
 // the captain's hut aft: gable of old thatch, other peoples' shields on its walls, a stolen bell
 const hx=-9.9,hy=dY(H.uAt(hx));rsCabin(B,{x:hx,y:hy,w:3,d:2.8,h:1.8,mk:'wood',wall:0x5a4a3a,roof:'gable',roofMk:'thatch',roofCol:0x9a8458,rh:1.1,over:.3,win:1,winCol:0x1a1410});
 [[HYK,GOLD],[rsLin(0xe07a2a),rsLin(0x2f8f8a)],[PURP,0xd8cdb4],[0xe8e0cc,GOLD]].forEach(([c,b],i)=>{const s=i%2?1:-1;rsShield(B,{p:[hx-.7+(i>>1)*1.3,hy+1.05,s*1.42],n:new THREE.Vector3(0,0,s)},.38,c,b);});
 rsPut(B,'paint',new THREE.TorusGeometry(.32,.05,4,12,Math.PI),[hx+1.53,hy+1.5,0],[0,Math.PI/2,Math.PI],null,0xf0ead8);
 rsCone(B,'metal',.2,.32,[hx+1.75,hy+1.62,.9],null,GOLD,10);rsRope(B,[hx+1.75,hy+2.05,.9],[hx+1.75,hy+1.78,.9],.015);
 // the flagstaff on the sternpost: the white moon over a captured Voth flag, scorched and torn
 const fs=[pa[0]-.2,pa[1]+3],ft=fs[1]+4.2;rsLink(B,'wood',[fs[0],fs[1],0],[fs[0],ft,0],.05,DK,5);
 rsSail(B,{key:'lanong-flags',O:[fs[0]-.05,ft-3.4,0],U:[-1,0,0],V:[0,1,0],belly:0,nu:6,nv:6,A:t=>[t*2.4,3.3],Bf:t=>[t*2.4,0],draw:rsLanongHoist});
 // the steering oar, the crew in what they took
 rsLink(B,'wood',[-11,hy+1.1,2.2],[-15.2,-1.3,2.9],.1,0x5a3a24,6);rsBox(B,'wood',[2,.9,.1],[-14.7,-1,2.85],[0,0,.65],0x5a3a24);
 for(const [x,z] of[[-2.6,1.6],[-1.2,-1.7],[.6,1.9],[2.6,-1],[6.4,1.4],[7.2,-1.3],[-7.4,-1.2],[-8,1]]){rsFigure(B,[x,dY(H.uAt(x)),z],rr(0,TAU),[RED,PURP,0x7a6448,TEAL,0x9a948a,HYK][Math.floor(rng()*6)],false,0x6a4028);
  rsLink(B,'wood',[x+.2,dY(H.uAt(x))+.3,z],[x+.3,dY(H.uAt(x))+2.6,z],.025,0x5a4028,4);rsCone(B,'metal',.05,.3,[x+.31,dY(H.uAt(x))+2.75,z],null,0xb0b4b8,4);}
 for(let i=0;i<6;i++){const x=rr(-3.5,-1.5),z=rr(-1.2,1.2);(i%2?rsBox(B,'wood',[.6,.45,.45],[x,D0+.23,z],[0,rr(0,1),0],0x6a5038):rsSphere(B,'cloth',.3,[x,D0+.26,z],[1,.85,1],0x9a8462,8,6));}
 rsBake(B,V.group,'islanderLanong');V.deckY=D0;return V;}
RS_VESSEL({key:'islanderLanong',name:'Islander Lanong',culture:'ringsea-islander',L:27,B:16,H:11,
 tags:{type:['warship','raider','pirate','outrigger'],propulsion:['paddles','sail'],hull:'outrigger',wealth:'common',crew:60,role:'piracy: taking what they can'},
 blurb:'Pirate raider: a beamy patchwork hull under scrap iron, swivel guns and a captured gun, two tripod masts with patched tanja sails, trophies of every fleet.',build:buildRsIslanderLanong});
