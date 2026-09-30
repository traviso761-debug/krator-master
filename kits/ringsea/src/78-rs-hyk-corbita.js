// ---------------------------------------------------------------- vessel: Hykkousoi Amphora Corbita
// The Hykkousoi round-ship for oil, wine and fish sauce: a deep, rounded 26 m hull, its sternpost
// rising into a gilded swan's neck bent forward over the deck, a small artemon on a raked foremast,
// a square mainsail with a triangular topsail above the yard, a vaulted cabin aft, and the deck and
// open hold packed with amphorae in their racks. (Ref: the Roman corbita.)
function rsHykCorbitaSail(g,W,H,P){rsCloth(g,W,H,'#ece6d6',8,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#3f86a6';g.lineWidth=W*.06;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#d8a640';g.lineWidth=W*.015;rsPolyPath(g,rsInset(P,W*.06));g.stroke();const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.2;
 g.fillStyle='#3f86a6';for(let i=0;i<14;i++){const a=i/14*TAU;g.beginPath();g.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,R*.08,0,TAU);g.fill();}
 g.fillStyle='#34495a';g.beginPath();g.ellipse(cx,cy+R*.1,R*.28,R*.4,0,0,TAU);g.fill();g.fillRect(cx-R*.12,cy-R*.5,R*.24,R*.2);
 g.strokeStyle='#34495a';g.lineWidth=R*.07;for(const s of[-1,1]){g.beginPath();g.arc(cx+s*R*.28,cy-R*.18,R*.14,s>0?-1.2:1.2+Math.PI*.2,s>0?1.2:Math.PI*1.8);g.stroke();}g.restore();}
function rsAmphora(B,p,k,col,tilt){const q=qEuler(tilt||0,0,0);const P=(x,y,z)=>{const v=new THREE.Vector3(x*k,y*k,z*k).applyQuaternion(q);return[p[0]+v.x,p[1]+v.y,p[2]+v.z];};
 rsSphere(B,'paint',.28*k,P(0,.62,0),[1,1.5,1],col,8,6);rsCone(B,'paint',.16*k,.35*k,P(0,.12,0),[Math.PI,0,0],col,6);rsCyl(B,'paint',.07*k,.1*k,.35*k,P(0,1.18,0),q,col,6);
 for(const s of[-1,1])rsTube(B,'paint',[P(s*.08,1.3,0),P(s*.2,1.28,0),P(s*.22,1.08,0)],.025*k,col,4,4);}
function buildRsHykCorbita(){reseed(72800);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BLUE=0x3f86a6,GOLD=0xd8a640,WOOD=0x7a5030,DARK=0x3a2a1e,TERR=0xb8683a;
 const H=rsHull({L:26,B:7.5,fb:2.6,dr:2,sheerF:1.1,sheerA:2.6,sp:2.2,pb:1.9,pa:1.8,q:.45,n:2.4,flare:.08,rakeF:-.6,rakeA:1.2,keelEnd:.5});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?BLUE:h>.86?GOLD:h<.36?0x3a3a30:WOOD);rsFoam(B,H,1);
 const dY=rsDeck(B,H,{bw:.8,col:0xa88a64});rsWale(B,H,.86,.08,'paint',GOLD);rsWale(B,H,.66,.1,'wood',DARK);rsWale(B,H,.5,.1,'wood',DARK);
 // the swan's neck sternpost, rising out of the hull and bending forward over the deck
 const pS=H.pt(0,0,1),uS=H.uAt(pS[0]+2);rsSpine(B,H,.2,DARK);
 const neck=[[pS[0]+2,H.ys(uS)-.4,0],[pS[0]+.3,pS[1]-.1,0],[pS[0]-.4,pS[1]+1.6,0],[pS[0]+.1,pS[1]+3.1,0],[pS[0]+1.1,pS[1]+3.6,0]];rsTube(B,'metal',neck,t=>.34*(1-.5*t),GOLD,40,10);
 rsSphere(B,'metal',.3,[pS[0]+1.3,pS[1]+3.55,0],[1.3,.9,.8],GOLD,10,8);rsCone(B,'metal',.1,.6,[pS[0]+1.8,pS[1]+3.45,0],[0,0,-Math.PI/2+.3],0xe0a020,6);
 // the aft cabin, vaulted
 rsCabin(B,{x:-8.6,y:dY(.14),w:4.2,d:4.6,h:1.9,wall:0x8a6038,win:2,roof:'vault',roofMk:'wood',roofCol:BLUE,rh:.8,over:.2});
 // amphorae: an open hold of them upright, racks on deck lying down
 const hy=dY(.5);rsBox(B,'paint',[7,.05,4.6],[1,hy+.03,0],null,0x0a0806);
 for(let i=0;i<5;i++)for(let j=0;j<4;j++)rsAmphora(B,[-2+i*1.35,hy-.7,-1.6+j*1.05],.95,[TERR,0xa85a30,0xc8784a][(i+j)%3]);
 for(const s of[-1,1])for(let i=0;i<7;i++)rsAmphora(B,[5.5+i*.55,dY(H.uAt(6))+.35,s*2.2],.7,[TERR,0xa85a30][i%2],s*Math.PI/2);
 // the mainmast: square course and a triangular topsail above the yard; the artemon forward
 const mx=0,mh=17;rsLink(B,'wood',[mx,hy-1,0],[mx,hy+mh,0],.3,0x7a5634,8,.18);const w=13,a=.95,U=[Math.sin(a),0,Math.cos(a)];const foot=3.2,yard=mh-4.6;
 const S=rsSail(B,{key:'hyk-corbita',O:[mx+.4,hy+foot,0],U,V:[0,1,0],belly:-1.3,A:t=>[(t-.5)*w,yard-foot],Bf:t=>[(t-.5)*w*.9,0],draw:rsHykCorbitaSail});
 rsSailEdge(B,S,0,.18,0x6a4a2c);rsSailEdge(B,S,1,.1,0x6a4a2c);
 for(const s of[-1,1]){const T=rsSail(B,{key:'hyk-corbita-top',O:[mx+.4,hy+yard+.7,0],U,V:[0,1,0],belly:-.3,nu:6,nv:6,A:t=>[s*lerp(.3,w*.45,t),lerp(3.6,0,t)],Bf:t=>[s*.3,lerp(3.6,0,t)],draw:(g,W,H2,P)=>{rsCloth(g,W,H2,'#ece6d6',3,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#3f86a6';g.lineWidth=W*.08;rsPolyPath(g,P);g.stroke();g.restore();}});}
 const tp=[mx,hy+mh,0];rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[pS[0]+1,pS[1]+3.3,0]);for(const s of[-1,1])rsRope(B,S.at(s<0?0:1,1),[mx-4,dY(.35)+.4,s*3.6]);
 {const fx=H.xAt(.94,1),fy=H.ys(.94),ft=[fx+4,fy+6.5,0];rsLink(B,'wood',[fx-1,fy-.4,0],ft,.13,0x7a5634,8,.09);
  const S2=rsSail(B,{key:'hyk-corbita',O:[ft[0]-1.6,fy+2.6,0],U:[Math.sin(.9),0,Math.cos(.9)],V:[.3,1,0],belly:-.5,A:t=>[(t-.5)*4,3.4],Bf:t=>[(t-.5)*3.6,0],draw:rsHykCorbitaSail});rsSailEdge(B,S2,0,.08,0x6a4a2c);}
 rsPennant(B,[mx,hy+mh+.2,0],3.4,.7,[BLUE,0xf0e8d8]);
 for(const s of[-1,1]){const p=H.pt(.08,s,.9);rsLink(B,'wood',[p[0]+1,p[1]+.6,p[2]*1.05],[p[0]-2.2,-1.5,p[2]*1.2],.11,0x7a5634,6);rsBox(B,'wood',[1.5,1,.1],[p[0]-1.9,-1.2,p[2]*1.2],[0,0,.5],0x7a5634);}
 for(const [x,z] of[[-8.8,1.5],[3,2.6],[-4,-2.6]])rsFigure(B,[x,x<-7?dY(.14)+2.7:dY(H.uAt(x)),z],rr(0,TAU),[0x3a5a78,0xe0d8c8][Math.floor(rng()*2)]);
 rsBake(B,V.group,'hykCorbita');V.deckY=hy;return V;}
RS_VESSEL({key:'hykCorbita',name:'Hykkousoi Amphora Corbita',culture:'hykkousoi',L:32,B:14,H:22,
 tags:{type:['cargo','merchant','round ship'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:14,role:'oil, wine and fish-sauce carrier'},
 blurb:'A deep round-ship under a gilded swan sternpost, square course and topsail, and a hold and deck racked with amphorae.',build:buildRsHykCorbita});
