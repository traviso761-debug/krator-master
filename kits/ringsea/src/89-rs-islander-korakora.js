// ---------------------------------------------------------------- vessel: Islander Kora-kora (royal war galley of the western isles)
// The rajas of the western isles go to war, and to collect their tribute, in a 24 m plank hull whose prow and
// stern sweep up five metres into carved posts (a frigate-bird head on the prow, a curl at the stern). Long booms
// carry a double outrigger each side; on them sit three rows of paddlers a side, 54 in all, kept in time by the
// drum. Amidships a raised fighting deck, ringed with shields, runs under a canopy of mats where the raja sits
// beneath the white moon, a royal parasol behind him; forward of the canopy a tripod mast carries a canted
// rectangular tanja sail in sea teal and sand. Banners on every post. (Ref: the Moluccan kora-kora, the tanja.)
function rsKoraTanja(g,W,H,P){const C=['#2a6a6a','#c8b080'];for(let i=0;i<14;i++){g.fillStyle=C[i%2];g.fillRect(i*W/14,0,W/14+1,H);}
 rsCloth(g,W,H,'rgba(0,0,0,0)',7,'h');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#4a2a14';g.lineWidth=W*.05;rsPolyPath(g,P);g.stroke();
 const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.22;g.fillStyle='#1e3a3a';g.beginPath();g.arc(cx,cy,R*1.2,0,TAU);g.fill();g.fillStyle='#f0e8d4';g.beginPath();g.arc(cx,cy,R,0,TAU);g.fill();
 g.strokeStyle='#f0e8d4';g.lineWidth=R*.08;for(let k=0;k<16;k++){const a=k*TAU/16;g.beginPath();g.moveTo(cx+Math.cos(a)*R*1.3,cy+Math.sin(a)*R*1.3);g.lineTo(cx+Math.cos(a)*R*1.55,cy+Math.sin(a)*R*1.55);g.stroke();}g.restore();}
function buildRsIslanderKorakora(){reseed(73900);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BARK=0x4a2e1c,DK=0x1e1612,SAND=0xc8b080,TEAL=0x2a6a6a,MOON=0xf0e8d4,BAM=0xc8b070,RUST=0x8a3a1c,GOLD=0xd8b048;
 const H=rsHull({L:24,B:2.9,fb:1.15,dr:.75,sheerF:1.4,sheerA:1.3,sp:2.4,pb:2.6,pa:2.6,q:.6,n:2.4,flare:.15,rakeF:.9,rakeA:.9,keelEnd:.3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?DK:h>.83?TEAL:h>.78?GOLD:h<.3?0x221810:BARK,72,10);rsFoam(B,H,.6);
 const dY=rsDeck(B,H,{bw:.25,col:0x7a5a38});rsWale(B,H,.8,.05,'paint',GOLD);rsWale(B,H,.6,.04,'rope',SAND);
 for(const s of[-1,1])for(const u of[.12,.88]){rsDecal(B,H,u,s,.62,.42,TEAL,'paint',20,.04);rsDecal(B,H,u,s,.62,.33,MOON,'paint',20,.07);}
 // the prow and stern sweep up into tall carved posts
 const pb=H.pt(1,0,1),pa=H.pt(0,0,1);
 rsSpine(B,H,.18,DK,[[pb[0]+.5,pb[1]+.8],[pb[0]+.9,pb[1]+2.1],[pb[0]+1,pb[1]+3.4],[pb[0]+1.3,pb[1]+4.5],[pb[0]+1.8,pb[1]+5.2]],
  [[pa[0]-.5,pa[1]+.8],[pa[0]-.9,pa[1]+2],[pa[0]-1,pa[1]+3.2],[pa[0]-.7,pa[1]+4.2],[pa[0]-.1,pa[1]+4.7],[pa[0]+.3,pa[1]+4.5]]);
 // the frigate bird on the prow: head, hooked beak, white moon eyes, a crest of plumes
 {const hp=[pb[0]+2,pb[1]+5.35,0];rsSphere(B,'paint',.32,hp,[1.4,1,.85],TEAL,10,8);rsCone(B,'paint',.13,1.1,[hp[0]+.85,hp[1]-.08,0],[0,0,-Math.PI/2-.12],GOLD,6);
  rsCone(B,'paint',.06,.3,[hp[0]+1.38,hp[1]-.26,0],[0,0,-Math.PI*.95],GOLD,5);for(const s of[-1,1])rsSphere(B,'paint',.09,[hp[0]+.25,hp[1]+.1,s*.24],null,MOON,8,6);
  for(let i=0;i<4;i++)rsPennant(B,[hp[0]-.25,hp[1]+.25,(i-1.5)*.08],1.6-i*.15,.18,[MOON,RUST,TEAL]);
  for(let i=0;i<5;i++){const y=pb[1]+1+i*.8;rsCone(B,'paint',.08,.5,[pb[0]+.6+i*.2+.35,y,0],[0,0,-Math.PI/2],i%2?MOON:GOLD,5);}}
 {const tp=[pa[0]+.3,pa[1]+4.5,0];for(let i=0;i<3;i++)rsPennant(B,[tp[0]-.1,tp[1]+.2,(i-1)*.1],2.4,.24,[TEAL,MOON,SAND]);rsSphere(B,'paint',.2,tp,null,GOLD,8,6);}
 // the breakwater board at the bow with the white moon
 {const x=9.3,y=dY(H.uAt(x)),hw=H.halfAt(H.uAt(x),y)*.98;rsBox(B,'paint',[.1,1.1,hw*2],[x,y+.5,0],null,TEAL);rsCyl(B,'paint',.4,.4,.05,[x+.07,y+.6,0],[0,0,Math.PI/2],MOON,18);}
 // double outriggers: seven booms, struts down to the floats, three bamboo stringers a side for the paddlers
 const yB=H.ys(.5)+.15,zF=8.6;
 for(let i=0;i<7;i++){const x=lerp(-7.5,7.5,i/6);rsLink(B,'wood',[x,yB,-zF-.3],[x,yB,zF+.3],.09,BAM,6);for(const s of[-1,1]){rsLink(B,'wood',[x,yB,s*zF],[x,.2,s*zF],.06,BAM,5);rsBox(B,'rope',[.22,.2,.22],[x,yB,s*zF],null,SAND);}}
 for(const s of[-1,1]){const F=rsHull({L:19,B:.5,fb:.22,dr:.2,sheerF:.25,sheerA:.25,pb:2,pa:2,q:.5,n:2,z0:s*zF,keelEnd:0});rsHullMesh(B,F,'wood',()=>0x6a5030,28,6);rsFoam(B,F,.25);
  for(const z of[3.4,4.6,5.8])rsBamboo(B,[-8.6,yB+.12,s*z],[8.6,yB+.12,s*z],.07,BAM,1.2,0x8a7040);}
 // the paddlers, three rows a side, and their paddles
 const pts=[];for(let j=0;j<3;j++)for(let i=0;i<9;i++)pts.push([lerp(-7,7,i/8)+(j%2)*.45,yB+.12+.62,3.4+1.2*j]);
 for(const P of pts)for(const s of[-1,1])rsFigure(B,[P[0]-.2,P[1]-.62,s*P[2]],0,[SAND,TEAL,0x8a5a32][Math.floor(h3(P[0],P[2],s)*3)],true,0x6a4028);
 rsOars(V,H,{name:'paddles',points:pts.map(p=>[p[0],p[1]+.3,p[2]+.3]),len:3.1,inb:.25,r:.03,bladeL:.6,bladeW:.2,col:0x8a6a44,sweep:.5,lift:.3,rate:.7,pitch:1.1,immerse:.2,ripple:.3});
 // the raised fighting deck amidships, on splayed posts; shields round its edge
 const fx0=-7.2,fx1=6.6,fy=yB+1.2;
 rsBox(B,'wood',[fx1-fx0,.12,5],[(fx0+fx1)/2,fy-.13,0],null,0x5a4028);for(const z of[-2.45,0,2.45])rsBox(B,'wood',[fx1-fx0+.2,.16,.16],[(fx0+fx1)/2,fy-.02,z],null,0x6a4a2c);
 for(let i=0;i<30;i++){const x=lerp(fx0+.23,fx1-.23,i/29);rsBox(B,'wood',[.44,.06,4.9],[x,fy+.03,0],null,new THREE.Color(0x9a7a50).offsetHSL(0,0,rr(-.04,.03)));}
 for(const x of[fx0+.3,-3.5,0,3.5,fx1-.3])for(const s of[-1,1])rsLink(B,'wood',[x,dY(H.uAt(x)),s*.9],[x,fy-.15,s*2.2],.08,0x6a4a2c,5);
 for(let i=0;i<11;i++){const x=lerp(fx0+.5,fx1-.5,i/10);for(const s of[-1,1])rsShield(B,{p:[x,fy+.5,s*2.47],n:new THREE.Vector3(0,0,s)},.4,[MOON,TEAL,SAND][i%3],0x8a7a60);}
 // the canopy of mats aft on the fighting deck: posts, a barrel vault, a teal valance with the white moon
 const cx0=-7.4,cx1=-2,cy=fy+2.1;for(const x of[-7.1,-4.6,-2.3])for(const s of[-1,1])rsLink(B,'wood',[x,fy,s*2.3],[x,cy,s*2.3],.07,0x5a3a24,5);
 rsVault(B,'thatch',cx0,cx1,cy,2.6,.9,0xc8a868,8,10,2);rsSolid(B,[cx0,fy,-2.6],[cx1,cy+.9,2.6]);
 rsBox(B,'paint',[.08,.45,5.1],[cx1+.02,cy-.1,0],null,TEAL);rsCyl(B,'paint',.34,.34,.05,[cx1+.08,cy+.25,0],[0,0,Math.PI/2],MOON,18);
 rsBox(B,'cloth',[1.1,.5,1.3],[-5.2,fy+.25,0],null,RUST);rsFigure(B,[-5.2,fy+.5,0],0,MOON,true,0x6a4028);rsFigure(B,[-4.2,fy,1.4],Math.PI/2,TEAL,false,0x6a4028);rsFigure(B,[-4.2,fy,-1.4],-Math.PI/2,TEAL,false,0x6a4028);
 // the drum that keeps the paddlers' time, at the canopy's mouth
 rsCyl(B,'paint',.33,.3,.7,[-1,fy+.35,.95],null,RUST,12);rsCyl(B,'rope',.34,.34,.05,[-1,fy+.72,.95],null,0xd8c8a0,12);rsFigure(B,[-1.1,fy,.2],-Math.PI/2,SAND,true,0x6a4028);
 // the royal parasol behind the canopy
 rsLink(B,'wood',[-7.9,fy,0],[-7.9,fy+5.6,0],.06,DK,5);rsCone(B,'cloth',1.25,.55,[-7.9,fy+5.05,0],null,MOON,16);rsCone(B,'cloth',.8,.45,[-7.9,fy+5.55,0],null,TEAL,14);rsSphere(B,'paint',.1,[-7.9,fy+5.85,0],null,GOLD,8,6);
 // the tripod mast (two side legs and a centre leg, all raking aft), a halyard bitt at its foot
 const mx=0,top=fy+8.6,ap=[mx,top,0];for(const [x,z] of[[mx-1.5,-1.8],[mx-1.5,1.8],[mx-2.1,0]])rsLink(B,'wood',[x,fy,z],ap,.11,0x5a3a24,6);
 rsSphere(B,'rope',.2,ap,[1,1.4,1],SAND,8,6);rsLink(B,'wood',[mx,fy,0],[mx,fy+1.9,0],.13,0x5a3a24,6);
 // the tanja: a canted rectangle slung forward of the tripod, its foot running down toward the bow
 rsRig(B,[mx,0]);const S=rsSail(B,{key:'korakora-tanja',O:[mx+.3,fy+2.6,.3],U:[-.97,.26,0],V:[.3,1,0],belly:-.6,nu:12,nv:10,
  A:t=>[lerp(-8.2,-.2,t),5.4],Bf:t=>[lerp(-7.2,-.9,t),0],draw:rsKoraTanja});
 rsSailEdge(B,S,0,.08,0x5a3a24,-.03,1.03);rsSailEdge(B,S,1,.07,0x5a3a24,-.03,1.03);rsRope(B,ap,S.at(.85,0));rsRope(B,ap,S.at(.35,0));rsRope(B,S.at(0,1),[pb[0]-1.4,dY(.92),0]);rsRigEnd(B);
 rsLink(B,'wood',[mx,top,0],[mx,top+1.6,0],.04,DK,4);rsPennant(B,[mx,top+1.6,0],3.4,.7,[TEAL,MOON,TEAL,SAND]);
 rsRope(B,ap,[pb[0]+1.8,pb[1]+5.2,0]);for(const s of[-1,1])rsRope(B,ap,[mx-1.2,fy,s*2.45]);
 // banners on poles along the fighting deck
 for(const x of[fx1-.2,-1])for(const s of[-1,1]){rsLink(B,'wood',[x,fy,s*2.5],[x,fy+4.2,s*2.5],.035,DK,4);rsPennant(B,[x,fy+4.2,s*2.5],2.4,.5,[[RUST,MOON],[TEAL,SAND]][(x>4)|0]);}
 // warriors with spears on the fighting deck, clear of the sail's plane
 for(let i=0;i<8;i++){const x=rr(.6,5.8),z=(i%2?1:-1)*rr(1.3,2.1);rsFigure(B,[x,fy,z],rr(0,TAU),[RUST,TEAL,SAND,0x3a2a1c][i%4],false,0x6a4028);rsLink(B,'wood',[x+.2,fy+.3,z],[x+.35,fy+3,z],.025,0x5a4028,4);rsCone(B,'paint',.05,.3,[x+.36,fy+3.15,z],null,0xb0b4b8,4);}
 // quarter rudders at the stern
 for(const s of[-1,1]){const p=H.pt(.08,s,.9);rsLink(B,'wood',[p[0]+.8,p[1]+.5,p[2]*1.1],[p[0]-2.4,-1.2,p[2]*1.4],.09,0x6a4a30,6);rsBox(B,'wood',[1.6,.8,.08],[p[0]-2,-.95,p[2]*1.38],[0,0,.6],0x6a4a30);}
 rsBake(B,V.group,'islanderKorakora');V.deckY=fy+.06;return V;}
RS_VESSEL({key:'islanderKorakora',name:'Islander Kora-kora',culture:'ringsea-islander',L:28,B:18,H:13,
 tags:{type:['warship','royal galley','outrigger'],propulsion:['paddles','sail'],hull:'outrigger',wealth:'royal',crew:90,role:'the raja\'s war and tribute fleet of the western isles'},
 blurb:'Royal war galley: tall carved prow and stern, double outriggers with three rows of paddlers a side, a canopied fighting deck and a teal tanja.',build:buildRsIslanderKorakora});
