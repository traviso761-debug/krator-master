// ---------------------------------------------------------------- vessel: Yuni Treasure Junk
// Yuni's deep-water merchant: a 50 m, square-sectioned, flat-transomed junk with a raked bow and a
// three-storey stern castle under green glazed roofs, a tiled deckhouse amidships, painted eyes at
// the bow, and three masts of green battened sails, the main bearing the gold wave of the Yuni
// merchant houses. A great stern rudder, lanterns, a windlass and a deck of cargo. (Ref: the junk sketch.)
function rsYuniGreen(g,W,H,P){rsCloth(g,W,H,'#2f6a52',8,'h');g.save();rsPolyPath(g,P);g.clip();for(let i=0;i<8;i++){g.fillStyle=`rgba(0,0,0,${.05+.04*(i%2)})`;g.fillRect(0,H*i/8,W,H/8);}
 g.strokeStyle='#183a2c';g.lineWidth=W*.025;rsPolyPath(g,P);g.stroke();g.restore();}
function rsYuniWave(g,W,H,P){rsYuniGreen(g,W,H,P);g.save();rsPolyPath(g,P);g.clip();const [cx,cy]=rsCentroid(P);g.strokeStyle='#e4b83a';g.lineCap='round';
 for(let r=0;r<4;r++){g.lineWidth=W*.045;g.beginPath();const R=W*(.1+r*.06);g.arc(cx+W*.05,cy+H*.02,R,Math.PI*.95,Math.PI*1.95);g.stroke();}
 for(let k=0;k<3;k++){g.lineWidth=W*.04;g.beginPath();g.arc(cx-W*.14+k*W*.1,cy+H*.12,W*.06,Math.PI,Math.PI*1.9);g.stroke();}g.restore();}
function buildRsYuniJunk(){reseed(71300);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const HULL=0x6e2a18,BLK=0x1e1612,CREAM=0xe8d8a8,GRN=0x2e6a4e,GOLD=0xd4a83a,TILE=0x3e8a66;
 const H=rsHull({L:50,B:12,fb:4,dr:3,sheerF:2.6,sheerA:5.2,sp:2.2,pb:1.8,pa:2.6,q:.5,n:4.5,flare:.14,rakeF:4,rakeA:1,transom:.62,keelEnd:1.2,kp:4});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?GRN:h>.88?GOLD:h>.8?HULL:h>.76?CREAM:h<.42?BLK:HULL);rsFoam(B,H,1.4);
 const dY=rsDeck(B,H,{bw:.9,col:0xa08462});rsWale(B,H,.9,.16,'wood',0x2a1a10);rsWale(B,H,.7,.14,'wood',0x2a1a10);rsWale(B,H,.55,.12,'wood',0x2a1a10);rsSpine(B,H,.3,BLK);
 // bulwark rail: green and gold posts
 for(const a of rsAlong(H,.1,.96,40,1))rsLink(B,'paint',a.p,[a.p[0],a.p[1]+.9,a.p[2]],.06,GOLD,5);
 for(const s of[-1,1]){const pts=[];for(let i=0;i<=30;i++){const p=H.pt(lerp(.1,.96,i/30),s,1);pts.push([p[0],p[1]+.9,p[2]]);}rsTube(B,'paint',pts,.08,GRN,60,6);}
 // painted eyes at the bow and the transom's gold wave
 for(const s of[-1,1]){rsDecal(B,H,.93,s,.8,.9,0xf4eee0,'paint',22,.08);rsDecal(B,H,.93,s,.8,.5,0x111111,'paint',18,.12);rsDecal(B,H,.93,s,.8,.18,0xc02a1a,'paint',12,.16);}
 {const p=H.pt(0,0,.8);rsPut(B,'paint',new THREE.CircleGeometry(2.2,28),[p[0]-.1,p[1],0],[0,-Math.PI/2,0],null,GOLD);rsPut(B,'paint',new THREE.CircleGeometry(1.8,28),[p[0]-.14,p[1],0],[0,-Math.PI/2,0],null,GRN);}
 // the stern castle: three storeys stepping up, green tiled hip roofs, balcony
 const uS=.13;let top=dY(uS);[[11,10,2.6],[8,8.4,2.4],[5,6,2.2]].forEach(([w,d,h],i)=>{const x=H.xAt(uS,1)+w/2-2+i*.8;
  rsCabin(B,{x,y:top,w,d,h,wall:i?0x8a3a22:0x7a3020,win:Math.round(w/1.4),winCol:0x2a1a10,roof:'hip',roofMk:'tile',roofCol:TILE,rh:1.1+i*.2,over:.5,flare:.3});top+=h+.25;});
 // the deckhouse amidships
 rsCabin(B,{x:-2,y:dY(.5),w:9,d:7,h:2.4,wall:0x8a5a34,win:6,roof:'hip',roofMk:'tile',roofCol:TILE,rh:1.6,over:.6,flare:.35});
 // masts and sails: fore (raked forward), main, mizzen
 [[15,24,-.12,'yuni-green'],[2,31,0,'yuni-wave'],[-13,21,.05,'yuni-green']].forEach(([mx,mh,lean,key],i)=>{const base=dY(H.uAt(mx));const tp=[mx+Math.sin(-lean)*mh,base+mh,0];
  rsLink(B,'wood',[mx,base-.5,0],tp,.32,0x6a4a2c,8,.2);const w=mh*.62;
  const S=rsSail(B,{key,O:[mx+.4,base+mh*.1,-.5],U:[-1,0,-.18],V:[Math.sin(-lean),1,0],belly:.9,scallop:7,
   A:t=>[-w*.12,t*mh*.84],Bf:t=>[w*(.74+.2*Math.sin(t*Math.PI*.9)),t*mh*.8+mh*.05],draw:key==='yuni-wave'?rsYuniWave:rsYuniGreen});
  for(let k=0;k<=7;k++){const pts=[];for(let j=0;j<=8;j++)pts.push(S.at(k/7,j/8));rsTube(B,'wood',pts,.06,0x3a2a1a,16,5);rsRope(B,S.at(k/7,1),[mx-w*.5,base+1,0],.02);}
  rsRope(B,tp,[H.xAt(1,1)+.5,H.ys(1),0]);rsPennant(B,[tp[0],tp[1]+.3,0],4,.9,[0xc02a1a,GOLD]);});
 // the great rudder, lanterns, the windlass, cargo
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[3,4.4,.4],[p[0]-1.4,p[1]-.4,0],null,0x4a3020);rsLink(B,'wood',[p[0]-.2,H.ys(0)+1,0],[p[0]-.4,p[1]-2,0],.28,0x3a2a1a);}
 for(const s of[-1,1])for(const x of[-22,-17])rsSphere(B,'glow',.35,[x,H.ys(H.uAt(x))+1.4,s*4.2],[1,1.3,1],0xff6a3a,10,8);
 rsCyl(B,'wood',.5,.5,3,[21,dY(.92)+.7,0],[Math.PI/2,0,0],0x5a3a24,10);
 for(let i=0;i<14;i++){const x=rr(5,12),z=rr(-3.6,3.6);rsBox(B,i%3?'wood':'cloth',[rr(.8,1.4),rr(.6,1),rr(.8,1.2)],[x,dY(H.uAt(x))+.4,z],[0,rr(0,1),0],i%3?0x9a7a50:0xd8c8a0);}
 for(const x of[-8,6,13,18])rsFigure(B,[x,dY(H.uAt(x)),rr(-3,3)],rr(0,TAU),[0x2a4a6a,0xd8c8a0,0x6a2a1a][Math.floor(rng()*3)]);
 rsBake(B,V.group,'yuniJunk');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'yuniJunk',name:'Yuni Treasure Junk',culture:'yuni-common',L:56,B:16,H:43,
 tags:{type:['merchant','junk'],propulsion:['sail'],hull:'monohull',wealth:'rich',crew:60,role:'deep-water trader'},
 blurb:'A three-masted junk: green battened sails with the gold Yuni wave, a stepped stern castle under glazed tiles.',build:buildRsYuniJunk});
