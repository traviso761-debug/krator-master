// ---------------------------------------------------------------- vessel: Hykkousoi Pearl Baghlah
// The Hykkousoi pearling ship, mother to a season of divers: a 36 m teak hull with a long raked stem
// and a high square stern, the stern a carved and gilded gallery of arched windows under a blue
// rosette, two masts raked forward under great white lateens edged in Hykkousoi blue with a ring of
// pearls round a gold sun. Along the starboard side the diving booms hang their stone-weighted lines,
// divers in the water between dives; on deck the oyster baskets and the opening mats.
function rsHykPearlLateen(g,W,H,P){rsCloth(g,W,H,'#f0ebe0',11,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#3f86a6';g.lineWidth=W*.035;rsPolyPath(g,rsInset(P,W*.03));g.stroke();
 g.strokeStyle='#d8a838';g.lineWidth=W*.01;rsPolyPath(g,rsInset(P,W*.06));g.stroke();const [cx,cy]=rsCentroid(P),R=W*.11;
 g.fillStyle='#d8a838';g.beginPath();g.arc(cx,cy,R*.42,0,TAU);g.fill();for(let i=0;i<16;i++){const a=i/16*TAU;g.fillStyle='#f8f4ec';g.beginPath();g.arc(cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8,R*.11,0,TAU);g.fill();
  g.strokeStyle='#3f86a6';g.lineWidth=1.5;g.stroke();}g.restore();}
function buildRsHykPearl(){reseed(72300);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const TEAK=0x8a5a30,DK=0x3a2414,TURQ=0x3f86a6,GOLD=0xd8a838,WHITE=0xece6d8;   // TURQ is the Hykkousoi blue
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
 const lateen=(mx,mh,tack,peak,clew,key,zs)=>{const base=dY(H.uAt(mx)),rk=.14,top=[mx+Math.sin(rk)*mh,base+mh,0];rsLink(B,'wood',[mx,base-.3,0],top,.34,0x6a4a2c,8,.2);
  // the two lateens hang on opposite sides of their masts and belly apart, so they never touch (sails-clear-sails)
  rsRig(B,[[mx,base-.3,0],top]);const S=rsSail(B,{key,O:[0,base,.45*zs],U:[1,0,0],V:[0,1,0],belly:1.2*zs,nu:22,nv:12,A:t=>[lerp(tack[0],peak[0],t),lerp(tack[1],peak[1],t)+Math.sin(Math.PI*t)*.9],Bf:t=>[lerp(clew[0],peak[0],t)+Math.sin(Math.PI*t)*.8,lerp(clew[1],peak[1],t)],draw:rsHykPearlLateen});
  const yd=[];for(let k=0;k<=16;k++)yd.push(S.at(k/16,0));yd.unshift([yd[0][0]+1.4,yd[0][1]-.5,yd[0][2]]);rsTube(B,'wood',yd,t=>.24*(1-.5*Math.abs(t-.35)),0x7a5634,40,6);
  rsRope(B,top,S.at(.45,0));rsRope(B,top,[mx-6,H.ys(H.uAt(mx-6)),-3.6]);rsRope(B,top,[mx-6,H.ys(H.uAt(mx-6)),3.6]);rsPennant(B,[top[0],top[1]+.3,0],4,.8,[TURQ,GOLD]);rsRigEnd(B);};
 lateen(3,24,[18,2.6],[-13,30],[-7,2.4],'hyk-pearl',1);lateen(-9.5,15,[-3.5,4.6],[-19,19],[-14.5,4.4],'hyk-pearl',-1);
 // the diving booms: six spars out over the starboard side, each with a stone-weighted line; divers
 // in the water between dives; the hauling crew at the rail
 for(let i=0;i<6;i++){const x=lerp(-6,12,i/5),u=H.uAt(x),yr=H.ys(u),zr=H.hb(u);rsLink(B,'wood',[x,yr+.2,zr-.4],[x+.3,yr+1.4,zr+2.6],.07,0x7a5634,5);
  const tip=[x+.3,yr+1.4,zr+2.6];rsRope(B,tip,[x+.3,-3.2,zr+2.6],.015,0xd8cca8);rsSphere(B,'paint',.22,[x+.3,-3.3,zr+2.6],[1,.8,1],0x6a6660,8,6);rsRope(B,tip,[x,yr+.3,zr-.6],.015,0xd8cca8);
  if(i%2===0){rsSphere(B,'paint',.13,[x+.9,.05,zr+2.4],null,0x6a4028,8,6);rsCyl(B,'cloth',.16,.18,.4,[x+.9,-.2,zr+2.4],null,0x2a4a6a,6);}
  if(i%2)rsFigure(B,[x-.4,dY(u),zr-1],Math.PI/2,[0xece6d8,0x3f86a6][i%3?0:1]);}
 // on deck: oyster baskets, the opening mats with their pearls
 for(let i=0;i<9;i++){const x=rr(5,14),z=rr(-3,1);rsCyl(B,'thatch',.4,.32,.55,[x,dY(H.uAt(x))+.28,z],null,0xb89a60,10);for(let k=0;k<3;k++)rsSphere(B,'paint',.1,[x+rr(-.2,.2),dY(H.uAt(x))+.58,z+rr(-.2,.2)],[1.4,.5,1],0x8a8a7a,6,4);}
 for(const x of[-2,0]){const y=dY(H.uAt(x));rsBox(B,'cloth',[1.6,.03,1.2],[x,y+.02,-2.2],null,0xd8c8a0);for(let k=0;k<8;k++)rsSphere(B,'metal',.05,[x+rr(-.6,.6),y+.07,-2.2+rr(-.4,.4)],null,0xf4f0ea,6,4);}
 for(let i=0;i<5;i++){const x=rr(-4,2),z=rr(-3,3);rsBox(B,'wood',[1.1,.8,.8],[x,dY(H.uAt(x))+.4,z],[0,rr(0,1),0],0x5a3a22);rsBox(B,'metal',[1.15,.1,.85],[x,dY(H.uAt(x))+.75,z],[0,0,0],GOLD);}
 for(let i=0;i<6;i++){const x=rr(15,17),z=rr(-2,2);rsSphere(B,'paint',.35,[x,dY(H.uAt(x))+.35,z],[1,1.3,1],0xb86a3a,10,8);}
 for(const [x,z] of[[-14,0],[10,1.5],[-3,-2.8],[17,-1]])rsFigure(B,[x,x<-12?pd:dY(H.uAt(x)),z],rr(0,TAU),[0xece6d8,0x7a1a24,0x1f8a9a][Math.floor(rng()*3)]);
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[2.4,4.6,.35],[p[0]-1,p[1]+.6,0],null,DK);}
 rsBake(B,V.group,'hykPearl');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'hykPearl',name:'Hykkousoi Pearl Baghlah',culture:'hykkousoi',L:44,B:17,H:36,
 tags:{type:['pearler','baghlah'],propulsion:['sail'],hull:'monohull',wealth:'rich',crew:60,role:'pearl-diving mother ship'},
 blurb:'A teak baghlah with a gilded, arch-windowed stern, pearling booms and divers over the side, two white lateens ringed with pearls.',build:buildRsHykPearl});
