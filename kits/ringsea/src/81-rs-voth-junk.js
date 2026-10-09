// ---------------------------------------------------------------- vessel: Voth Merchant Junk
// The merchant junk of the Voth bay (settlements/voth/src/78c-life-ships.js, the life layer's own ships: 34 m x 11 m at
// its 1.18 scale, so 40 m x 13 m): a dark tarred hull (0x2c2116, the owner's ask), a raked bow and a flat transom, a
// poop cabin, two masts (the fore raked forward, the main raked aft) under lavender battened sails (0xa494c9, the
// battens 0x4d4058), a deck of cargo and five hands.
function rsVothLavender(g,W,H,P){rsCloth(g,W,H,'#a494c9',9,'h');g.save();rsPolyPath(g,P);g.clip();for(let i=0;i<9;i++){g.fillStyle=`rgba(40,28,60,${.05+.04*(i%2)})`;g.fillRect(0,H*i/9,W,H/9);}
 g.strokeStyle='#4d4058';g.lineWidth=W*.022;rsPolyPath(g,P);g.stroke();g.restore();}
function buildRsVothJunk(){reseed(73100);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=lin(0x2c2116),DARK=lin(0x1a130c),DECK=lin(0x5a4632),WALL=lin(0x3a2a1c),BATT=0x2a2030,RED=lin(0x5a1e16);
 const H=rsHull({L:40,B:13,fb:3.4,dr:2.8,sheerF:2.2,sheerA:3.6,sp:2.2,pb:1.7,pa:2.4,q:.5,n:4.2,flare:.12,rakeF:3.4,rakeA:.8,transom:.6,keelEnd:1,kp:4});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?RED:h>.82?HULL:h<.42?DARK:HULL);rsFoam(B,H,1.3);
 const dY=rsDeck(B,H,{bw:.9,col:DECK});rsWale(B,H,.88,.14,'wood',DARK);rsWale(B,H,.66,.12,'wood',DARK);rsSpine(B,H,.28,DARK);
 for(const a of rsAlong(H,.12,.95,30,1))rsLink(B,'wood',a.p,[a.p[0],a.p[1]+.8,a.p[2]],.05,DARK,5);
 for(const s of[-1,1]){const pts=[];for(let i=0;i<=24;i++){const p=H.pt(lerp(.12,.95,i/24),s,1);pts.push([p[0],p[1]+.8,p[2]]);}rsTube(B,'wood',pts,.07,WALL,48,5);}
 // the poop cabin over the transom, and its stern lanterns
 const pc=H.xAt(.12,1)+4.2,top=rsCabin(B,{x:pc,y:dY(.12),w:8,d:8.4,h:2.6,wall:WALL,win:5,winCol:0xe8a040,roof:'hip',roofMk:'tile',roofCol:lin(0x4a1c12),rh:1.2,over:.45,flare:.3});
 for(const s of[-1,1])rsSphere(B,'glow',.32,[H.xAt(0,1)+.6,H.ys(0)+1.4,s*3],[1,1.3,1],0xff8a3a,10,8);
 // two masts: the fore raked forward (0.10), the main raked aft (-0.07), as Voth rakes them; battened lavender sails
 [[8,15.3,.10,5.0],[-2.4,21.2,-.07,top-dY(H.uAt(-2.4))+1.0]].forEach(([mx,mh,lean,foot],i)=>{
  const base=dY(H.uAt(mx)),tp=[mx+Math.sin(lean)*mh,base+mh,0];rsLink(B,'wood',[mx,base-.5,0],tp,.28,0x241810,8,.18);
  rsRig(B,[[mx,base-.5,0],tp]);const sh=mh-foot-1,w=Math.min(sh*.74,i?15:11);
  const S=rsSail(B,{key:'voth-junk-'+i,O:[mx+.4,base+foot,-.5],U:[-1,0,-.18],V:[Math.sin(lean),1,0],belly:.9,scallop:6,
   A:t=>[-w*.12,t*sh],Bf:t=>[w*(.74+.2*Math.sin(t*Math.PI*.9)),t*sh*.95+sh*.03],draw:rsVothLavender});
  for(let k=0;k<=6;k++){const pts=[];for(let j=0;j<=8;j++)pts.push(S.at(k/6,j/8));rsTube(B,'wood',pts,.055,BATT,16,5);}
  rsRope(B,tp,[H.xAt(1,1)+.4,H.ys(1),0]);rsPennant(B,[tp[0],tp[1]+.3,0],3.4,.8,[lin(0x4b2a6e),lin(0xd8cdb4)]);});rsRigEnd(B);
 // the rudder, the windlass, deck cargo and the hands
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[2.6,3.6,.36],[p[0]-1.2,p[1]-.3,0],null,DARK);}
 rsCyl(B,'wood',.42,.42,2.6,[15.5,dY(.89)+.6,0],[Math.PI/2,0,0],0x3a2418,10);
 for(let i=0;i<10;i++){const x=rr(1,6),z=rr(-3.4,3.4),y=dY(H.uAt(x))+.5;if(i%3)rsBox(B,'wood',[1,1,1],[x,y,z],[0,rr(0,1),0],WALL);else rsCyl(B,'wood',.45,.45,1,[x,y,z],null,lin(0x6a4a30),10);}
 for(const [x,z] of[[-12,2.6],[-6,-3],[4,3.4],[11,-2],[15,1.5]])rsFigure(B,[x,x<-9?top:dY(H.uAt(x)),z],rr(0,TAU),lin(0x6a5a48),false,0x8a8aa0);
 rsBake(B,V.group,'vothJunk');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothJunk',name:'Voth Merchant Junk',culture:'voth',L:46,B:16,H:30,
 tags:{type:['cargo','merchant','junk'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:12,role:'bay and coastal trader'},
 blurb:'The Voth bay junk: a dark tarred hull, a poop cabin, two raked masts under lavender battened sails, a deck of cargo.',build:buildRsVothJunk});
