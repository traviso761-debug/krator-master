// ---------------------------------------------------------------- vessel: Voth Fishing Dhow
// The fishing dhow of the Voth bay (settlements/voth/src/78e-life-dhows.js: 12 m x 3 m at 1.35 scale, so 16 m x 4 m,
// hull 0x8a6b45): a light wooden hull, a mast raked forward (0.26 rad) under a lateen, the fish bin aft of the mast
// (its walls 0.26 darker than the hull), nets and floats, two fishers.
function rsVothDhowSail(g,W,H,P){rsCloth(g,W,H,'#e2d4b0',7,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#7a5a3a';g.lineWidth=W*.03;rsPolyPath(g,P);g.stroke();g.restore();}
function buildRsVothDhow(){reseed(73700);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=lin(0x8a6b45),BIN=lin(0x5e4a30),DARK=lin(0x3a2c1e),NET=lin(0x7a7060);
 const H=rsHull({L:16.2,B:4,fb:1.3,dr:.9,sheerF:1.4,sheerA:.9,sp:2.2,pb:1.6,pa:1.7,q:.5,n:2.8,flare:.1,rakeF:2,rakeA:.8,keelEnd:.3,kp:3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?DARK:h<.35?DARK:HULL);rsFoam(B,H,.6);
 const dY=rsDeck(B,H,{bw:.35,col:lin(0x9a7a50)});rsWale(B,H,.85,.07,'wood',DARK);rsSpine(B,H,.12,DARK);
 // the fish bin: four plank walls aft of the mast, a catch inside
 const bx=-3.2,by=dY(H.uAt(bx)),bl=5.2,bw=1.7,bh=.8;
 for(const s of[-1,1]){rsBox(B,'wood',[bl,bh,.12],[bx,by+bh/2,s*bw/2],null,BIN);rsBox(B,'wood',[.12,bh,bw],[bx+s*bl/2,by+bh/2,0],null,BIN);}
 for(let i=0;i<14;i++)rsSphere(B,'paint',.18,[bx+rr(-2.2,2.2),by+.3,rr(-.6,.6)],[2.2,.5,.7],lin(0x9aa4a8),6,4);
 // the mast raked forward under the lateen, its yard slanting aft
 const mx=2.2,base=dY(H.uAt(mx)),rk=.26,mh=9.4,tp=[mx+Math.sin(rk)*mh,base+mh*Math.cos(rk),0];rsLink(B,'wood',[mx,base-.2,0],tp,.13,DARK,6,.09);
 rsRig(B,[[mx,base-.2,0],tp]);
 const S=rsSail(B,{key:'voth-dhow',O:[0,base,.3],U:[1,0,0],V:[0,1,0],belly:.6,nu:18,nv:9,
  A:t=>[lerp(mx+3.8,mx-1.2,t),lerp(1.2,mh+1,t)+Math.sin(Math.PI*t)*.4],Bf:t=>[lerp(mx-4.8,mx-1.2,t)+Math.sin(Math.PI*t)*.4,lerp(.9,mh+1,t)],draw:rsVothDhowSail});
 rsSailEdge(B,S,0,.08,DARK);rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,S.at(0,0),[H.xAt(.15,1),H.ys(.15),.8]);rsRigEnd(B);
 // the nets heaped forward, cork floats, the tiller and two fishers
 for(let i=0;i<5;i++)rsSphere(B,'rope',.5,[5.2+rr(-.6,.6),dY(H.uAt(5.2))+.2,rr(-.6,.6)],[1.3,.5,1],NET,8,5);
 for(let i=0;i<6;i++)rsSphere(B,'paint',.12,[5+rr(-.8,.8),dY(H.uAt(5))+.45,rr(-.7,.7)],[1,1,1],lin(0xc89a5a),6,4);
 {const p=H.pt(0,0,.3);rsBox(B,'wood',[1,1.5,.14],[p[0]-.3,p[1]-.3,0],null,DARK);}
 for(const [x,z] of[[-6.4,0],[0,.8]])rsFigure(B,[x,dY(H.uAt(x)),z],rr(0,TAU),lin(0x6a5a48),false,0x8a8aa0);
 rsBake(B,V.group,'vothDhow');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothDhow',name:'Voth Fishing Dhow',culture:'voth',L:20,B:6,H:13,
 tags:{type:['fishing'],propulsion:['sail'],hull:'monohull',wealth:'poor',crew:2,role:'bay fishing boat'},
 blurb:'The Voth fishing dhow: a light wooden hull, a forward-raked mast under a cream lateen, a fish bin aft of the mast, nets and floats.',build:buildRsVothDhow});
