// ---------------------------------------------------------------- vessel: Yuni Court Dragon Boat
// The court races these on the canals and takes them out onto the Ring Sea for the Water Festival:
// an 18 m shell scaled green and gold, a carved dragon's head with open jaws at the bow and a
// curling gilt tail at the stern, twenty paddlers to the drum, a steersman on a long oar, a
// canopied seat for the patron, and a forest of court pennants along the gunwales.
function buildRsYuniDragon(){reseed(71700);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const G1=0x2a7a4a,G2=0x3aa060,GOLD=0xd8a838,RED=0xb02418;
 const H=rsHull({L:18,B:1.6,fb:.6,dr:.35,sheerF:.9,sheerA:.8,sp:3,pb:2.6,pa:2.4,q:.6,n:2.2,flare:.1,rakeF:.3,rakeA:.3,keelEnd:.1});
 rsHullMesh(B,H,'paint',(u,h,s)=>{if(h>.9)return GOLD;if(h<.3)return RED;const row=Math.floor(h*6);return(Math.floor(u*56+row*.5)%2)?G1:G2;},72,10);rsFoam(B,H,.4);
 const dY=rsDeck(B,H,{bw:.2,col:0x7a5a38});rsWale(B,H,.92,.04,'metal',GOLD);
 // the head, the neck rising from the stem, the tail
 const pb=H.pt(1,0,1);rsTube(B,'paint',[[pb[0]-.6,pb[1]-.1,0],[pb[0]+.2,pb[1]+.5,0],[pb[0]+.5,pb[1]+1.3,0]],.28,G1,12,10);
 rsDragonHead(B,[pb[0]+.9,pb[1]+1.6,0],.8,RED,GOLD,.25);
 for(let i=0;i<5;i++)rsCone(B,'metal',.07,.45,[pb[0]-.2+i*.15,pb[1]+.35+i*.25,0],[0,0,.6],GOLD,5);
 const pS=H.pt(0,0,1);rsScroll(B,[pS[0]+.15,pS[1]-.05,0],.9,1.3,.18,GOLD,-1,'metal');
 // twenty paddlers in pairs, the drummer and drum at the bow, the steersman, the patron's canopy
 const pts=[];for(let i=0;i<10;i++){const x=lerp(-5.5,5.5,i/9);const y=dY(H.uAt(x));pts.push([x,y+.62,H.halfAt(H.uAt(x),y)*.5]);}
 for(const P of pts)for(const s of[-1,1])rsFigure(B,[P[0]-.25,P[1]-.62,s*P[2]],0,[0xe8d8b0,0xc03020][(s+1)/2],true);
 rsOars(V,H,{name:'paddles',points:pts.map(p=>[p[0],p[1]+.3,p[2]+.25]),len:1.6,inb:.25,r:.03,bladeL:.5,bladeW:.18,col:GOLD,sweep:.55,lift:.3,rate:.9,pitch:1.1,immerse:.18});
 {const x=6.9,y=dY(H.uAt(x));rsCyl(B,'paint',.38,.38,.5,[x,y+.5,0],[0,0,Math.PI/2],RED,14);rsCyl(B,'cloth',.39,.39,.52,[x,y+.5,0],[0,0,Math.PI/2],0xf0e0c0,14);rsFigure(B,[x-.8,y,0],0,0xd8a838,true);}
 {const x=-7.8,y=dY(H.uAt(x));rsFigure(B,[x,y,0],0,0xe8d8b0);rsLink(B,'wood',[x+.4,y+1.3,.2],[x-3.6,-.3,.4],.045,0x7a5a38,5);}
 {const x=-6.4,y=dY(H.uAt(x));for(const a of[-1,1])for(const b of[-1,1])rsLink(B,'metal',[x+a*.5,y,b*.45],[x+a*.5,y+1.6,b*.45],.03,GOLD,5);rsRoof(B,'cloth',1.6,1.3,.6,[x,y+1.6,0],null,RED,.2,.1);rsFigure(B,[x,y,0],0,0x6a2a8a,true);}
 // court pennants on poles along both gunwales
 for(const a of rsAlong(H,.15,.85,8,1)){const top=[a.p[0],a.p[1]+1.8,a.p[2]];rsLink(B,'wood',a.p,top,.02,0x6a4a2c,4);rsPennant(B,top,.9,.35,[[RED,GOLD,G2,0x2a5ab8][Math.floor(rng()*4)]],.05);}
 rsBake(B,V.group,'yuniDragon');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'yuniDragon',name:'Yuni Court Dragon Boat',culture:'yuni-court',L:21,B:6,H:4.4,
 tags:{type:['ceremonial','racing'],propulsion:['paddles'],hull:'monohull',wealth:'court',crew:24,role:'festival racer'},
 blurb:'A green-and-gold scaled racing shell, a red dragon head, twenty paddlers to the drum and court pennants.',build:buildRsYuniDragon});
