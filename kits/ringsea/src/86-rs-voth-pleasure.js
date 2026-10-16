// ---------------------------------------------------------------- vessel: Voth Pleasure Barge
// The pleasure barge that cruises the Voth bay (settlements/voth/src/78d-life-ferries-barges.js, lifePBargeHull: 26 m
// x 10 m): a broad, low, gilded hull; a pavilion amidships-aft under a sweeping oxblood roof with lit windows; a canopied
// foredeck with cushions; a single 10 m mast with a long Voth-purple pennant and a small square sail; gilded rails,
// lanterns, guests and an oarsman crew.
function rsVothPleasureSail(g,W,H,P){rsCloth(g,W,H,'#4b2a6e',5,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#d4a83a';g.lineWidth=W*.05;rsPolyPath(g,P);g.stroke();
 const [cx,cy]=rsCentroid(P);rsSymDiamond(g,cx,cy,Math.min(W,H)*.22,'#d8cdb4');g.restore();}
function buildRsVothPleasure(){reseed(73600);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=lin(0x2a1c14),DARK=lin(0x160f0a),GOLD=0xd4a83a,RED=lin(0x6a1e14),TILE=lin(0x4a1c12),WALL=lin(0xd8cdb4),DECK=lin(0x7a6044),PURP=lin(0x4b2a6e);
 const H=rsHull({L:26,B:10,fb:2.2,dr:1.3,sheerF:1.8,sheerA:1.4,sp:2.4,pb:2.2,pa:2.4,q:.4,n:3.8,flare:.06,rakeF:2,rakeA:1.2,transom:.5,keelEnd:.5,kp:3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.92?GOLD:h>.86?RED:h<.4?DARK:HULL);rsFoam(B,H,1);
 const dY=rsDeck(B,H,{bw:.6,col:DECK});rsWale(B,H,.8,.1,'metal',GOLD);rsSpine(B,H,.18,DARK);
 for(const a of rsAlong(H,.08,.96,32,1))rsLink(B,'metal',a.p,[a.p[0],a.p[1]+.8,a.p[2]],.05,GOLD,5);
 for(const s of[-1,1]){const pts=[];for(let i=0;i<=24;i++){const p=H.pt(lerp(.08,.96,i/24),s,1);pts.push([p[0],p[1]+.8,p[2]]);}rsTube(B,'paint',pts,.07,RED,48,6);}
 // the pavilion: Voth's 0.7 beam x 0.36 length, under a sweeping hip roof, lit windows
 const px=-4.7,top=rsCabin(B,{x:px,y:dY(H.uAt(px)),w:9.4,d:7,h:2.6,wall:WALL,win:6,winCol:0xe8a040,roof:'hip',roofMk:'tile',roofCol:TILE,rh:1.6,over:.7,flare:.45});
 rsCone(B,'metal',.25,1.2,[px,top+.6,0],null,GOLD,6);
 // the canopied foredeck with cushions
 const fx=5.5,fy=dY(H.uAt(fx));for(const [x,z] of[[3,-2.6],[3,2.6],[8,-2.2],[8,2.2]])rsLink(B,'metal',[x,dY(H.uAt(x)),z],[x,fy+2.6,z],.06,GOLD,5);
 rsBox(B,'cloth',[5.6,.1,5.8],[5.5,fy+2.65,0],null,PURP);rsSolid(B,[2.6,fy+2.4,-2.9],[8.4,fy+2.8,2.9]);
 for(let i=0;i<8;i++)rsBox(B,'cloth',[.9,.35,.9],[rr(3.6,7.6),fy+.18,rr(-2,2)],[0,rr(0,1),0],[RED,PURP,lin(0xd8cdb4)][i%3]);
 // the mast, a small square sail, the long pennant
 const mx=2.4,base=dY(H.uAt(mx)),mh=10,tp=[mx,base+mh,0];rsLink(B,'wood',[mx,base-.3,0],tp,.18,DARK,6,.12);
 rsRig(B,[mx,0]);const w=3.6,foot=fy+2.9-base+.4;
 const S=rsSail(B,{key:'voth-pleasure',O:[mx+.2,base+foot,0],U:[0,0,1],V:[0,1,0],belly:-.4,A:t=>[(t-.5)*w,mh-foot-.6],Bf:t=>[(t-.5)*w*.94,0],draw:rsVothPleasureSail});
 rsSailEdge(B,S,1,.06,GOLD);rsSailEdge(B,S,0,.05,GOLD);rsPennant(B,[mx,base+mh+.2,0],6,.8,[PURP,lin(0xd8cdb4)]);rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[H.xAt(0,1)+1,H.ys(0),0]);rsRigEnd(B);
 // stern lanterns, the steersman, guests and oarsmen
 for(const s of[-1,1])rsSphere(B,'glow',.3,[H.xAt(0,1)+.6,H.ys(0)+1.2,s*2.6],[1,1.3,1],0xff8a3a,10,8);
 rsFigure(B,[H.xAt(0,1)+1.6,dY(.05),0],Math.PI,PURP,false,0x8a8aa0);
 for(const [x,z] of[[4,-1],[5.5,1.2],[7,-.4],[-4,-2.4]])rsFigure(B,[x,dY(H.uAt(x))+(x>0?.35:0),z],rr(0,TAU),[GOLD,RED,PURP][Math.floor(rng()*3)],x>0,0x8a8aa0);
 rsBake(B,V.group,'vothPleasure');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothPleasure',name:'Voth Pleasure Barge',culture:'voth',L:30,B:12,H:14,
 tags:{type:['pleasure','barge','state'],propulsion:['sail','oar'],hull:'monohull',wealth:'wealthy',crew:10,role:'pleasure barge of the bay'},
 blurb:'The Voth pleasure barge: a broad gilded hull, a pavilion under a sweeping oxblood roof, a canopied foredeck of cushions, a purple sail and pennant.',build:buildRsVothPleasure});
