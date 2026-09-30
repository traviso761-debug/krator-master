// ---------------------------------------------------------------- vessel: Xanadu Swan Barge (Hamsa royal barge)
// The Sultan's progress barge: a 44 m gilded shell hardly wider than two oarsmen, rising at the bow
// into a swan's neck and head crowned with a flame crest, and at the stern into a curling tail. Thirty-two
// paddlers in crimson with gilt paddles; amidships the throne pavilion on its dais, a four-tiered
// gilded roof on red columns; tiered white parasols fore and aft. (Ref: Suphannahong, Karaweik.)
function buildRsXanaduSwan(){reseed(71200);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const GOLD=0xd8a534,DGOLD=0xa87a22,RED=0x9a1c1c,BLK=0x1c1410;
 const H=rsHull({L:44,B:3.2,fb:.95,dr:.6,sheerF:2.2,sheerA:2.8,sp:3.5,pb:2.4,pa:2.4,q:.55,n:2.2,flare:.1,rakeF:.6,rakeA:.6,keelEnd:.1});
 rsHullMesh(B,H,'metal',(u,h,s)=>{if(h>.92)return RED;if(h<.34)return BLK;const row=Math.floor(h*9),k=(Math.floor(u*90+row*.5))%2;return k?GOLD:DGOLD;});rsFoam(B,H,.5);
 const dY=rsDeck(B,H,{bw:.3,col:0x7a1a18,mk:'cloth'});rsWale(B,H,.93,.07,'metal',GOLD);rsWale(B,H,.62,.05,'metal',0xf0cc60);
 // the swan: neck rising from the stem, head, beak, the flame crest; the tail at the stern
 const pb=H.pt(1,0,1);const neck=[[pb[0]-.6,pb[1]-.2,0],[pb[0]+.6,pb[1]+1.2,0],[pb[0]+.9,pb[1]+3.6,0],[pb[0]+.2,pb[1]+6.2,0],[pb[0]+.6,pb[1]+8.4,0],[pb[0]+1.6,pb[1]+9.2,0]];
 rsTube(B,'metal',neck,t=>.62*(1-.55*t),GOLD,60,12);
 const hd=[pb[0]+1.9,pb[1]+9.3,0];rsSphere(B,'metal',.5,hd,[1.25,.9,.8],GOLD,14,10);
 rsCone(B,'metal',.2,1.3,[hd[0]+1.05,hd[1]-.1,0],[0,0,-Math.PI/2+.25],0xe0a020,8);
 for(const s of[-1,1]){rsSphere(B,'paint',.1,[hd[0]+.3,hd[1]+.12,s*.34],null,RED,8,6);}
 for(let i=0;i<7;i++){const a=.2+i*.32;rsCone(B,'metal',.1,1.4-i*.08,[hd[0]-.3-Math.cos(a)*.6,hd[1]+.3+Math.sin(a)*.5,0],[0,0,a-.2],GOLD,5);}
 for(let i=0;i<9;i++){const p=neck[Math.min(5,1+Math.floor(i/2))];rsCone(B,'metal',.08,.9,[p[0]-.5,p[1]+(i%2)*.4,0],[0,0,1.1],0xf0cc60,5);}
 rsSpine(B,H,.18,GOLD,null,null,'metal');
 const pS=H.pt(0,0,1);rsScroll(B,[pS[0]+.2,pS[1],0],1.8,1.3,.4,GOLD,-1,'metal');
 for(let i=0;i<5;i++)rsScroll(B,[pS[0]+.5,pS[1]-.1,(i-2)*.22],1.1-i*.05,1,.1,0xf0cc60,-1,'metal');
 // the paddlers: 25 a side, crimson and gilt, paddles on a quick shared stroke
 const pts=[];for(let i=0;i<25;i++){const x=lerp(-15,15,i/24);if(Math.abs(x)<5.5)continue;pts.push([x,dY(H.uAt(x))+.55,H.halfAt(H.uAt(x),dY(H.uAt(x)))*.55]);}
 for(const P of pts)for(const s of[-1,1])rsFigure(B,[P[0]-.3,P[1]-.55,s*P[2]],0,RED,true);
 rsOars(V,H,{name:'paddles',points:pts.map(p=>[p[0],p[1]+.35,p[2]+.3]),len:2.2,inb:.3,r:.035,bladeL:.6,bladeW:.22,col:GOLD,sweep:.5,lift:.25,rate:.7,pitch:1.05,immerse:.2});
 // the throne pavilion: dais, red columns, four gilded tiers and a spire
 const cy=dY(.5);rsBox(B,'paint',[9,.7,2.8],[0,cy+.35,0],null,RED);rsBox(B,'metal',[9.2,.12,2.95],[0,cy+.72,0],null,GOLD);
 for(const x of[-3.6,-1.2,1.2,3.6])for(const s of[-1,1])rsCyl(B,'paint',.1,.12,2.8,[x,cy+2.15,s*1.2],null,RED,8);
 rsBox(B,'cloth',[2.2,1.1,1.2],[0,cy+1.3,0],null,0xe8c050);
 let y=cy+3.55;[[9.4,3.6,1.2],[7.4,3,1],[5.4,2.4,.9],[3.6,1.8,.8]].forEach(([w,d,h],i)=>{rsRoof(B,'metal',w,d,h,[0,y,0],null,i%2?RED:GOLD,.25,.55);y+=h*.62;});
 rsCone(B,'metal',.35,3.6,[0,y+1.7,0],null,GOLD,10);rsSphere(B,'metal',.22,[0,y+3.6,0],null,0xffe070,8,6);
 // tiered parasols fore and aft, and a steersman
 for(const x of[-10,-7,7,10]){const u=H.uAt(x),yy=dY(u);rsLink(B,'metal',[x,yy,0],[x,yy+4.6,0],.05,GOLD,6);for(let k=0;k<4;k++)rsCone(B,'cloth',.95-k*.18,.35,[x,yy+3+k*.45,0],null,0xf4f0e6,14);}
 rsFigure(B,[-18.5,dY(.08),0],0,RED);{const p=H.pt(.06,1,.8);rsLink(B,'metal',[p[0]+.6,p[1]+.9,p[2]],[p[0]-2.4,-.6,p[2]+.5],.07,GOLD,6);}
 rsPennant(B,[0,y+3.9,0],3,.5,[RED,GOLD]);
 rsBake(B,V.group,'xanaduSwan');V.deckY=cy;return V;}
RS_VESSEL({key:'xanaduSwan',name:'Xanadu Swan Barge',culture:'xanadu',L:48,B:9,H:16,
 tags:{type:['ceremonial','royal barge'],propulsion:['paddles'],hull:'monohull',wealth:'royal',crew:56,role:'progress barge of the Sultan'},
 blurb:'A gilded swan-necked barge, thirty-two crimson paddlers, a four-tiered throne pavilion and tiered parasols.',build:buildRsXanaduSwan});
