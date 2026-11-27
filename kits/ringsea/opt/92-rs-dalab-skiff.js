// ---------------------------------------------------------------- vessel: Dalab Fishing Boat
// Works the warm shallow shelf of the West Rift's great lake and the 70 km level reach of the Chimes Riba (settlements/nulab/PLAN.md
// sections 5.2 and 7, step N4): a 13.5 m double-ended wooden skiff with a turquoise sheer rail and small curled stem scroll, a
// forward-raked mast under a rust-ochre dipping lug sail, central catch bin, willow creels, cork-float nets and two fishers.
function rsDalabSkiffSail(g,W,H,P){rsCloth(g,W,H,'#c96a42',6,'v');g.save();rsPolyPath(g,P);g.clip();
 g.strokeStyle='#2f9a8a';g.lineWidth=W*.045;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#e8dcc0';g.lineWidth=W*.018;rsPolyPath(g,rsInset(P,W*.042));g.stroke();g.restore();}
function buildRsDalabSkiff(){reseed(74300);
 const V={group:new THREE.Group(),anims:[]},B=rsBucket(),lin=rsLin;
 const HULL=lin(0x8c6c46),TQ=lin(0x2f9a8a),RED=lin(0xa8382a),DARK=lin(0x3a2b1c),NET=lin(0x746b58);
 const H=rsHull({L:13.6,B:3.5,fb:1.15,dr:.78,sheerF:1.1,sheerA:.85,sp:2.2,pb:1.65,pa:1.65,q:.52,n:2.6,flare:.11,rakeF:1.6,rakeA:1.1,keelEnd:.28,kp:3});
 rsHullMesh(B,H,'wood',(u,h)=>h>.86?TQ:h<.34?DARK:HULL);rsFoam(B,H,.55);
 const dY=rsDeck(B,H,{bw:.32,col:lin(0x9a7b52)});rsWale(B,H,.85,.065,'paint',lin(0xe4d6b8));
 const bow=H.pt(1,0,1);rsSpine(B,H,.11,DARK,[[bow[0]+.32,bow[1]+.55]]);rsScroll(B,[bow[0]+.32,bow[1]+.55,0],.34,1.1,.08,RED,1,'paint');
 /* central plank fish well with silver lake catch, plus woven willow creels */
 const bx=-1.8,by=dY(H.uAt(bx)),bl=3.8,bw=1.45,bh=.68;
 for(const s of[-1,1]){rsBox(B,'wood',[bl,bh,.1],[bx,by+bh/2,s*bw/2],null,DARK);rsBox(B,'wood',[.1,bh,bw],[bx+s*bl/2,by+bh/2,0],null,DARK);}
 for(let i=0;i<12;i++)rsSphere(B,'paint',.16,[bx+rr(-1.6,1.6),by+.26,rr(-.5,.5)],[2.1,.48,.68],lin(0xa4aeb2),6,4);
 for(const [cx,cz] of[[-4.3,-.55],[-4.1,.52]])rsCyl(B,'thatch',.32,.26,.58,[cx,dY(H.uAt(cx))+.29,cz],null,lin(0xb2985c),8);
 /* forward-raked mast under a rust-ochre dipping lug sail */
 const mx=1.9,base=dY(H.uAt(mx)),rk=.18,mh=7.8,tp=[mx+Math.sin(rk)*mh,base+mh*Math.cos(rk),0];
 rsLink(B,'wood',[mx,base-.2,0],tp,.11,DARK,6,.075);
 rsRig(B,[[mx,base-.2,0],tp]);
 const S=rsSail(B,{key:'dalab-skiff',O:[0,base,.24],U:[1,0,0],V:[0,1,0],belly:.48,nu:16,nv:9,
  A:t=>[lerp(mx+2.8,mx-1.4,t),lerp(1.1,mh+.6,t)],Bf:t=>[lerp(mx-3.9,mx-1.4,t),lerp(.85,mh+.6,t)],draw:rsDalabSkiffSail});
 rsSailEdge(B,S,0,.07,DARK);rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,S.at(0,0),[H.xAt(.18,1),H.ys(.18),.65]);rsRigEnd(B);
 /* heaped nets & cork floats forward, steering oar aft, two green-skinned Dalabite fishers */
 for(let i=0;i<4;i++)rsSphere(B,'rope',.44,[4.2+rr(-.5,.5),dY(H.uAt(4.2))+.18,rr(-.5,.5)],[1.25,.48,.95],NET,8,5);
 for(let i=0;i<6;i++)rsSphere(B,'paint',.11,[4.1+rr(-.7,.7),dY(H.uAt(4.1))+.4,rr(-.6,.6)],[1,1,1],lin(0xc89a56),6,4);
 {const p=H.pt(.04,1,.85);rsLink(B,'wood',[p[0]+.4,p[1]+.35,p[2]*.7],[p[0]-2.8,-.32,p[2]*1.2],.055,DARK,6);}
 rsFigure(B,[-5.1,dY(H.uAt(-5.1)),.15],0,RED,false,0x6a9a4a);
 rsFigure(B,[.6,dY(H.uAt(.6)),-.55],1.2,lin(0xe0d2b4),false,0x6a9a4a);
 rsBake(B,V.group,'dalabFishingBoat');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'dalabFishingBoat',name:'Dalab Fishing Boat',culture:'dalab',L:14.5,B:3.8,H:10,
 tags:{type:['fishing','river'],propulsion:['sail','oar'],hull:'monohull',wealth:'peasant',crew:2,role:'lake and Chimes Riba fishing boat'},
 blurb:'Dalab\'s 13.6 m lake and river skiff: turquoise sheer, curled stem, rust-ochre dipping lug sail, catch bin, willow creels and cork nets.',build:buildRsDalabSkiff});
