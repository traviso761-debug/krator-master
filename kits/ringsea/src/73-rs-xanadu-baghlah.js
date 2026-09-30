// ---------------------------------------------------------------- vessel: Xanadu Pearl Baghlah
// The Sultanate's deep-water trader, carrying the valley's gold out and pearls, carpets and spice
// back: a 36 m teak hull with a long raked stem and a high square stern, the stern a carved and
// gilded gallery of arched windows under a turquoise tile rosette (the Persian hand in Xanadu), two
// masts raked forward under great white lateens edged in turquoise with a gold rosette, a poop
// rail, and a deck of rolled carpets, chests and water jars.
function rsXanaduLateen(g,W,H,P){rsCloth(g,W,H,'#f0ebe0',11,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#1f8a9a';g.lineWidth=W*.035;rsPolyPath(g,rsInset(P,W*.03));g.stroke();
 g.strokeStyle='#d8a838';g.lineWidth=W*.01;rsPolyPath(g,rsInset(P,W*.06));g.stroke();const [cx,cy]=rsCentroid(P),R=W*.1;
 for(let i=0;i<8;i++){const a=i/8*TAU;g.fillStyle=i%2?'#1f8a9a':'#d8a838';g.beginPath();g.ellipse(cx+Math.cos(a)*R*.7,cy+Math.sin(a)*R*.7,R*.45,R*.2,a,0,TAU);g.fill();}
 g.fillStyle='#d8a838';g.beginPath();g.arc(cx,cy,R*.35,0,TAU);g.fill();g.restore();}
function buildRsXanaduBaghlah(){reseed(72300);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const TEAK=0x8a5a30,DK=0x3a2414,TURQ=0x1f9aa8,GOLD=0xd8a838,WHITE=0xece6d8;
 const H=rsHull({L:36,B:9,fb:3,dr:2.4,sheerF:1.6,sheerA:3.6,sp:2.4,pb:2.4,pa:3,q:.5,n:2.8,flare:.1,rakeF:4.2,rakeA:.6,transom:.55,keelEnd:.8});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?TURQ:h>.89?GOLD:h<.4?WHITE:u<.12&&h>.6?TURQ:TEAK);rsFoam(B,H,1.2);
 const dY=rsDeck(B,H,{bw:.8,col:0xb0906a});rsWale(B,H,.89,.1,'metal',GOLD);rsWale(B,H,.7,.12,'wood',DK);rsSpine(B,H,.22,DK,[[H.xAt(1,1)+.8,H.ys(1)+.5],[H.xAt(1,1)+1.2,H.ys(1)+1.1]]);
 {const p=H.pt(1,0,1);rsSphere(B,'metal',.35,[p[0]+1.3,p[1]+1.3,0],null,GOLD,10,8);}
 // the stern: poop deck, a carved gallery of arched windows across the transom, quarter galleries
 const xT=H.xAt(0,1),yP=H.ys(0);const pd=dY(.1)+1.8;rsBox(B,'wood',[6,.25,H.halfAt(.08,pd)*2],[xT+3.2,pd,0],null,0xa88460);rsSolid(B,[xT,dY(.1),-3],[xT+6.2,pd+.1,3]);
 for(let i=0;i<5;i++){const z=(i-2)*1.2;rsPut(B,'paint',rsArchGeo(.7,1.3),[xT-.12,yP-1.6,z],[0,-Math.PI/2,0],null,0x1a1410);rsPut(B,'metal',rsArchGeo(.9,1.5),[xT-.08,yP-1.6,z],[0,-Math.PI/2,0],null,GOLD);}
 rsPut(B,'paint',new THREE.CircleGeometry(.9,24),[xT-.1,yP-3.4,0],[0,-Math.PI/2,0],null,TURQ);for(let i=0;i<8;i++){const a=i/8*TAU;rsPut(B,'metal',new THREE.CircleGeometry(.22,10),[xT-.14,yP-3.4+Math.sin(a)*.55,Math.cos(a)*.55],[0,-Math.PI/2,0],null,GOLD);}
 for(const s of[-1,1]){const p=H.pt(.04,s,.85);rsBox(B,'wood',[2.6,2.2,.8],[p[0]+1.2,p[1]-.6,p[2]+s*.25],null,TEAK);for(let k=0;k<2;k++)rsPut(B,'paint',rsArchGeo(.5,1),[p[0]+.7+k*1,p[1]-.5,p[2]+s*.66],[0,s>0?0:Math.PI,0],null,0x1a1410);
  rsRoof(B,'tile',2.8,1,.6,[p[0]+1.2,p[1]+.5,p[2]+s*.25],null,TURQ,.1,.3);}
 for(const a of rsAlong(H,.02,.2,8,1)){rsLink(B,'metal',[a.p[0],pd,a.p[2]*.95],[a.p[0],pd+1,a.p[2]*.95],.04,GOLD,5);}
 // two masts raked forward, great lateens
 const lateen=(mx,mh,tack,peak,clew,key)=>{const base=dY(H.uAt(mx)),rk=.14,top=[mx+Math.sin(rk)*mh,base+mh,0];rsLink(B,'wood',[mx,base-.3,0],top,.34,0x6a4a2c,8,.2);
  const S=rsSail(B,{key,O:[0,base,.45],U:[1,0,0],V:[0,1,0],belly:-1.4,nu:22,nv:12,A:t=>[lerp(tack[0],peak[0],t),lerp(tack[1],peak[1],t)+Math.sin(Math.PI*t)*.9],Bf:t=>[lerp(clew[0],peak[0],t)+Math.sin(Math.PI*t)*.8,lerp(clew[1],peak[1],t)],draw:rsXanaduLateen});
  const yd=[];for(let k=0;k<=16;k++)yd.push(S.at(k/16,0));yd.unshift([yd[0][0]+1.4,yd[0][1]-.5,yd[0][2]]);rsTube(B,'wood',yd,t=>.24*(1-.5*Math.abs(t-.35)),0x7a5634,40,6);
  rsRope(B,top,S.at(.45,0));rsRope(B,top,[mx-6,H.ys(H.uAt(mx-6)),-3.6]);rsRope(B,top,[mx-6,H.ys(H.uAt(mx-6)),3.6]);rsPennant(B,[top[0],top[1]+.3,0],4,.8,[TURQ,GOLD]);};
 lateen(3,24,[18,2.6],[-13,30],[-7,2.4],'xanadu-lateen');lateen(-9.5,15,[-3.5,4.6],[-19,19],[-14.5,4.4],'xanadu-lateen');
 // the cargo: rolled carpets, chests, water jars; the crew; the helmsman on the poop
 for(let i=0;i<10;i++){const x=rr(6,14),z=rr(-3,3);rsCyl(B,'cloth',.28,.28,2.4,[x,dY(H.uAt(x))+.3+(i%3)*.5,z],[0,rr(-.3,.3),Math.PI/2],[0xa02a2a,0x2a4a8a,0xc88a3a,0x1f8a7a][i%4],10);}
 for(let i=0;i<5;i++){const x=rr(-4,2),z=rr(-3,3);rsBox(B,'wood',[1.1,.8,.8],[x,dY(H.uAt(x))+.4,z],[0,rr(0,1),0],0x5a3a22);rsBox(B,'metal',[1.15,.1,.85],[x,dY(H.uAt(x))+.75,z],[0,0,0],GOLD);}
 for(let i=0;i<6;i++){const x=rr(15,17),z=rr(-2,2);rsSphere(B,'paint',.35,[x,dY(H.uAt(x))+.35,z],[1,1.3,1],0xb86a3a,10,8);}
 for(const [x,z] of[[-14,0],[10,1.5],[-3,-2.8],[17,-1]])rsFigure(B,[x,x<-12?pd:dY(H.uAt(x)),z],rr(0,TAU),[0xece6d8,0x7a1a24,0x1f8a9a][Math.floor(rng()*3)]);
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[2.4,4.6,.35],[p[0]-1,p[1]+.6,0],null,DK);}
 rsBake(B,V.group,'xanaduBaghlah');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'xanaduBaghlah',name:'Xanadu Pearl Baghlah',culture:'xanadu',L:44,B:12,H:36,
 tags:{type:['merchant','baghlah'],propulsion:['sail'],hull:'monohull',wealth:'rich',crew:40,role:'deep-water trader: gold out, pearls and spice home'},
 blurb:'A teak baghlah with a gilded, arch-windowed stern under a turquoise rosette, and two great white lateens edged in turquoise.',build:buildRsXanaduBaghlah});
