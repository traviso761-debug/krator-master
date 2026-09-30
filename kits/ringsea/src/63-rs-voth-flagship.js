// ---------------------------------------------------------------- vessel: Voth Ordinator Flagship
// The flagship of the Ordinators' fleet: a 50 m, square-sectioned, flat-transomed junk-built hull,
// lacquered brown-black, with a raked bow and a three-storey stern castle under dark red tile, a
// tiled deckhouse amidships, and three masts of green battened sails, the main bearing the gold
// wave. The mizzen is stepped on the castle so its sail rides clear of the roofs. Bolt-throwers
// on the foredeck, gilded Ordinators at the rails, lanterns, a great stern rudder.
// (Ref: the fantasy junk sheet; the dark hull matches the Voth Chitin Bireme.)
// the Voth lacquer, shared with 71-rs-voth-chitin.js. Vertex colours are read as LINEAR, so a hex picked by eye
// has to be converted or a brown-black comes out mid-brown (that is what the first pass did).
const RS_VOTH_HULL=new THREE.Color(0x2a1c14).convertSRGBToLinear(),RS_VOTH_HULL2=new THREE.Color(0x160f0a).convertSRGBToLinear();
// the sails: green battened cloth, the main with the gold wave (Travis kept these from the first pass)
function rsVothGreen(g,W,H,P){rsCloth(g,W,H,'#2f6a52',8,'h');g.save();rsPolyPath(g,P);g.clip();for(let i=0;i<8;i++){g.fillStyle=`rgba(0,0,0,${.05+.04*(i%2)})`;g.fillRect(0,H*i/8,W,H/8);}
 g.strokeStyle='#183a2c';g.lineWidth=W*.025;rsPolyPath(g,P);g.stroke();g.restore();}
function rsVothWave(g,W,H,P){rsVothGreen(g,W,H,P);g.save();rsPolyPath(g,P);g.clip();const [cx,cy]=rsCentroid(P);g.strokeStyle='#e4b83a';g.lineCap='round';
 for(let r=0;r<4;r++){g.lineWidth=W*.045;g.beginPath();const R=W*(.1+r*.06);g.arc(cx+W*.05,cy+H*.02,R,Math.PI*.95,Math.PI*1.95);g.stroke();}
 for(let k=0;k<3;k++){g.lineWidth=W*.04;g.beginPath();g.arc(cx-W*.14+k*W*.1,cy+H*.12,W*.06,Math.PI,Math.PI*1.9);g.stroke();}g.restore();}
function buildRsVothFlagship(){reseed(71300);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=RS_VOTH_HULL,BLK=RS_VOTH_HULL2,BONE=lin(0xb89a5a),RED=lin(0x6a1e14),GOLD=0xd4a83a,TILE=lin(0x4a1c12),WALL=lin(0x2e1c12);
 const H=rsHull({L:50,B:12,fb:4,dr:3,sheerF:2.6,sheerA:5.2,sp:2.2,pb:1.8,pa:2.6,q:.5,n:4.5,flare:.14,rakeF:4,rakeA:1,transom:.62,keelEnd:1.2,kp:4});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?RED:h>.88?GOLD:h>.8?HULL:h>.77?BONE:h<.42?BLK:HULL);rsFoam(B,H,1.4);
 const dY=rsDeck(B,H,{bw:.9,col:new THREE.Color(0x4a3828).convertSRGBToLinear()});rsWale(B,H,.9,.16,'wood',0x140c08);rsWale(B,H,.7,.14,'wood',0x140c08);rsWale(B,H,.55,.12,'wood',0x140c08);rsSpine(B,H,.3,BLK);
 // bulwark rail: gold posts, oxblood rail
 for(const a of rsAlong(H,.1,.96,40,1))rsLink(B,'paint',a.p,[a.p[0],a.p[1]+.9,a.p[2]],.06,GOLD,5);
 for(const s of[-1,1]){const pts=[];for(let i=0;i<=30;i++){const p=H.pt(lerp(.1,.96,i/30),s,1);pts.push([p[0],p[1]+.9,p[2]]);}rsTube(B,'paint',pts,.08,RED,60,6);}
 // gold roundels at the bow and the transom's sigil disc
 for(const s of[-1,1]){rsDecal(B,H,.93,s,.8,.9,GOLD,'metal',22,.08);rsDecal(B,H,.93,s,.8,.6,BLK,'paint',18,.12);rsDecal(B,H,.93,s,.8,.22,GOLD,'metal',12,.16);}
 {const p=H.pt(0,0,.8);rsPut(B,'metal',new THREE.CircleGeometry(2.2,28),[p[0]-.1,p[1],0],[0,-Math.PI/2,0],null,GOLD);rsPut(B,'paint',new THREE.CircleGeometry(1.8,28),[p[0]-.14,p[1],0],[0,-Math.PI/2,0],null,RED);}
 // the stern castle: three storeys stepping up, dark red tiled hip roofs
 const uS=.13;let top=dY(uS);[[11,10,2.6],[8,8.4,2.4],[5,6,2.2]].forEach(([w,d,h],i)=>{const x=H.xAt(uS,1)+w/2-2+i*.8;
  rsCabin(B,{x,y:top,w,d,h,wall:WALL,win:Math.round(w/1.4),winCol:0xe8a040,roof:'hip',roofMk:'tile',roofCol:TILE,rh:1.1+i*.2,over:.5,flare:.3});top+=h+.25;});
 const castleTop=top-.25+1.5;
 // the deckhouse amidships
 rsCabin(B,{x:-2,y:dY(.5),w:9,d:7,h:2.4,wall:WALL,win:6,winCol:0xe8a040,roof:'hip',roofMk:'tile',roofCol:TILE,rh:1.6,over:.6,flare:.35});
 // masts and sails: fore (raked forward), main (its foot clears the castle roofs), mizzen stepped on the castle
 [[15,26,-.12,'voth-green',5.2],[2,36,0,'voth-wave',castleTop-dY(H.uAt(2))+1.2],[-17,13,.05,'voth-green',castleTop-dY(H.uAt(-17))+.6]].forEach(([mx,mh,lean,key,foot],i)=>{
  const base=dY(H.uAt(mx));const tp=[mx+Math.sin(-lean)*mh,base+mh,0];rsLink(B,'wood',[mx,base-.5,0],tp,.32,0x2a1a10,8,.2);
  const sh=mh-foot-1,w=Math.min(sh*.72,i===2?8.5:20);
  const S=rsSail(B,{key,O:[mx+.4,base+foot,-.5],U:[-1,0,-.18],V:[Math.sin(-lean),1,0],belly:.9,scallop:7,
   A:t=>[-w*.12,t*sh],Bf:t=>[w*(.74+.2*Math.sin(t*Math.PI*.9)),t*sh*.95+sh*.03],draw:key==='voth-wave'?rsVothWave:rsVothGreen});
  for(let k=0;k<=7;k++){const pts=[];for(let j=0;j<=8;j++)pts.push(S.at(k/7,j/8));rsTube(B,'wood',pts,.06,0x140c08,16,5);}
  rsRope(B,tp,[H.xAt(1,1)+.5,H.ys(1),0]);rsPennant(B,[tp[0],tp[1]+.3,0],4,.9,[RED,GOLD]);});
 // the great rudder, lanterns, the windlass, two bolt-throwers, the Ordinators
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[3,4.4,.4],[p[0]-1.4,p[1]-.4,0],null,BLK);rsLink(B,'wood',[p[0]-.2,H.ys(0)+1,0],[p[0]-.4,p[1]-2,0],.28,BLK);}
 for(const s of[-1,1])for(const x of[-22,-17])rsSphere(B,'glow',.35,[x,H.ys(H.uAt(x))+1.4,s*4.2],[1,1.3,1],0xff8a3a,10,8);
 rsCyl(B,'wood',.5,.5,3,[21,dY(.92)+.7,0],[Math.PI/2,0,0],0x3a2418,10);
 for(const s of[-1,1]){const x=10,y=dY(H.uAt(x));rsBox(B,'wood',[1.2,.8,1],[x,y+.4,s*2.6],null,0x3a2418);rsBox(B,'wood',[3.2,.25,.3],[x+.4,y+1,s*2.6],[0,s*.25,.08],0x4a3020);
  rsLink(B,'metal',[x+1.6,y+1,s*2.6-1.4],[x+1.6,y+1,s*2.6+1.4],.05,GOLD,5);rsLink(B,'metal',[x-.8,y+1.1,s*2.6],[x+2.4,y+1.15,s*2.6+s*.8],.04,0x8a8a8a,4);}
 for(const [x,z] of[[-8,3],[6,-3],[13,2.5],[18,-1.5],[-4,-3.2],[8,3.4]])rsFigure(B,[x,dY(H.uAt(x)),z],rr(0,TAU),0xc89a3a,false,0x8a8aa0);
 rsBake(B,V.group,'vothFlagship');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothFlagship',name:'Voth Ordinator Flagship',culture:'voth',L:56,B:16,H:43,
 tags:{type:['warship','flagship','junk'],propulsion:['sail'],hull:'monohull',wealth:'state',crew:120,role:'flagship of the Ordinators'},
 blurb:'A brown-black junk-built flagship: green battened sails with the gold wave, a stepped stern castle under red tile.',build:buildRsVothFlagship});
