// ---------------------------------------------------------------- vessel: Islander Karakoa (war outrigger)
// The raiding fleet of the island confederacy: a 25 m hull whose ends sweep up into tall crescent
// horns, double outriggers of bamboo on seven booms carrying two rows of paddlers a side, a raised
// fighting deck of split bamboo amidships crowded with shields and spears, a bipod mast carrying a
// tilted rectangular tanja sail in the confederacy's stripes, and banners on every horn and pole.
// (Ref: karakoa, balangay; the striped sail of the balangay.)
function rsTanjaStripes(g,W,H,P){const C=['#c83a24','#e8b83a','#2a4a9a','#e8b83a'];for(let i=0;i<12;i++){g.fillStyle=C[i%4];g.fillRect(i*W/12,0,W/12+1,H);}
 rsCloth(g,W,H,'rgba(0,0,0,0)',6,'h');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#3a1a10';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();g.restore();}
function buildRsIslanderKarakoa(){reseed(72000);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const HULL=0x4a2e1c,BLK=0x1a1210,BAM=0xc8b070,RED=0xc83a24,YEL=0xe8b83a;
 const H=rsHull({L:25,B:2.8,fb:1.2,dr:.8,sheerF:1.1,sheerA:1.1,sp:3,pb:2.6,pa:2.6,q:.6,n:2.4,flare:.12,rakeF:.8,rakeA:.8,keelEnd:.3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.88?BLK:h>.8?RED:h<.3?0x221810:HULL,72,10);rsFoam(B,H,.6);
 const dY=rsDeck(B,H,{bw:.2,col:0x7a5a38});rsWale(B,H,.8,.05,'paint',YEL);
 // the horns: stem and sternpost sweep up and outward into tall crescents
 const pb=H.pt(1,0,1),pa=H.pt(0,0,1);rsSpine(B,H,.16,BLK,[[pb[0]+.6,pb[1]+.9],[pb[0]+.8,pb[1]+2.4],[pb[0]+.3,pb[1]+4.2],[pb[0]-.6,pb[1]+5.4]],
  [[pa[0]-.6,pa[1]+.9],[pa[0]-.8,pa[1]+2.4],[pa[0]-.3,pa[1]+4.2],[pa[0]+.6,pa[1]+5.4]]);
 for(const e of[[pb[0]-.6,pb[1]+5.4],[pa[0]+.6,pa[1]+5.4]]){rsLink(B,'wood',[e[0],e[1],0],[e[0],e[1]+1.6,0],.03,BLK,4);rsPennant(B,[e[0],e[1]+1.6,0],2.6,.7,[RED,YEL,0x2a4a9a]);}
 // double outriggers: seven booms, bamboo floats, paddler rails
 const yB=H.ys(.5)+.15,zF=6.2;for(let i=0;i<7;i++){const x=lerp(-8,8,i/6);rsLink(B,'wood',[x,yB,-zF-.3],[x,yB,zF+.3],.09,BAM,6);for(const s of[-1,1])rsLink(B,'wood',[x,yB,s*zF],[x,.15,s*zF],.06,BAM,5);}
 for(const s of[-1,1]){for(const dz of[-.18,.18])rsBamboo(B,[-10.5,.15,s*zF+dz],[10.5,.15,s*zF+dz],.14,BAM,1.4,0x8a7040);rsBamboo(B,[-9,yB+.12,s*3.2],[9,yB+.12,s*3.2],.07,BAM,1.2,0x8a7040);rsBamboo(B,[-9,yB+.12,s*4.6],[9,yB+.12,s*4.6],.07,BAM,1.2,0x8a7040);}
 // paddlers on the outrigger rails, two rows a side
 const pts=[];for(let i=0;i<8;i++){const x=lerp(-7.5,7.5,i/7);pts.push([x,yB+.12+.62,3.9]);pts.push([x+.9,yB+.12+.62,5.2]);}
 for(const P of pts)for(const s of[-1,1])rsFigure(B,[P[0]-.2,P[1]-.62,s*P[2]],0,[0xc8a870,RED][Math.floor(h3(P[0],P[2],s)*2)],true,0x6a4028);
 rsOars(V,H,{name:'paddles',points:pts.map(p=>[p[0],p[1]+.3,p[2]+.3]),len:3.1,inb:.25,r:.03,bladeL:.6,bladeW:.2,col:0x8a6a44,sweep:.5,lift:.3,rate:.75,pitch:1.1,immerse:.2,ripple:.3});
 // the fighting deck amidships, shields, spears, warriors
 const fx0=-5,fx1=5,fy=yB+1.1;for(let i=0;i<24;i++){const x=lerp(fx0,fx1,i/23);rsLink(B,'wood',[x,fy,-2.4],[x,fy,2.4],.06,BAM,5);}
 for(const x of[fx0,0,fx1])for(const s of[-1,1])rsLink(B,'wood',[x,dY(.5),s*1],[x,fy,s*2.2],.08,0x6a4a2c,5);
 for(let i=0;i<9;i++){const x=lerp(fx0+.5,fx1-.5,i/8);for(const s of[-1,1]){const a={p:[x,fy+.55,s*2.45],n:new THREE.Vector3(0,0,s)};rsShield(B,a,.42,[RED,YEL,0xe8dcc0][i%3],0x8a7a60);}}
 for(let i=0;i<9;i++){const x=rr(fx0+.5,fx1-.5),z=rr(-1.8,1.8);rsFigure(B,[x,fy,z],rr(0,TAU),[RED,0x3a2a1c,YEL][Math.floor(rng()*3)],false,0x6a4028);rsLink(B,'wood',[x+.2,fy+.3,z],[x+.4,fy+3,z],.025,0x5a4028,4);rsCone(B,'metal',.05,.3,[x+.41,fy+3.15,z],null,0xb0b4b8,4);}
 // bipod mast and the tilted tanja sail
 const mx=1.5,mh=9.5;for(const s of[-1,1])rsLink(B,'wood',[mx,fy,s*1.6],[mx+.4,fy+mh,0],.1,0x6a4a2c,6);
 const S=rsSail(B,{key:'islander-tanja',O:[mx+.2,fy+1.6,.2],U:[-.97,.26,0],V:[.3,1,0],belly:.7,nu:12,nv:10,
  A:t=>[lerp(-2.8,7.4,t),6.6],Bf:t=>[lerp(-2,6.6,t),0],draw:rsTanjaStripes});
 rsSailEdge(B,S,0,.08,0x6a4a2c,-.04,1.04);rsSailEdge(B,S,1,.07,0x6a4a2c,-.04,1.04);rsRope(B,[mx+.4,fy+mh,0],S.at(.3,0));rsRope(B,[mx+.4,fy+mh,0],[pb[0],pb[1],0]);rsRope(B,S.at(1,1),[-9,yB,0]);
 for(const x of[-10,10])rsFigure(B,[x,dY(H.uAt(x)),0],x>0?0:Math.PI,0x2a2a2a,false,0x6a4028);
 rsLink(B,'wood',[-10.5,dY(.05)+1,.4],[-13.5,-.6,.8],.06,0x6a4a2c,5);
 rsBake(B,V.group,'islanderKarakoa');V.deckY=fy;return V;}
RS_VESSEL({key:'islanderKarakoa',name:'Islander Karakoa',culture:'ringsea-islander',L:28,B:14,H:16,
 tags:{type:['warship','raider','outrigger'],propulsion:['paddles','sail'],hull:'outrigger',wealth:'common',crew:70,role:'raiding and war'},
 blurb:'Crescent-horned war canoe with double outriggers, rows of paddlers, a fighting deck and a striped tanja sail.',build:buildRsIslanderKarakoa});
