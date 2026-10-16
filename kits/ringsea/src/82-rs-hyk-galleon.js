// ---------------------------------------------------------------- vessel: Hykkousoi Sea Galleon
// The second of the Voth life layer's ship kinds was a galleon (settlements/voth/src/78c-life-ships.js, lifeGalleonHull:
// 58 m x 14 m, two masts). Its European silhouette never fitted the Voth (the owner: it "doesn't fit dark elves"), so in
// the kit it is a Hykkousoi ship (owner, 2026-10-09): a 58 m deep-sea galleon in the Hykkousoi colours, timber banded in
// blue and gold, a gilded beakhead and figurehead, a three-tier aftcastle with gallery windows, round gun ports in two
// rows, square courses and topsails on the fore and main in cream edged blue, the main course bearing the Hykkousoi ring,
// a lateen on the mizzen.
function rsHykGalleonSail(ring){return function(g,W,H,P){rsCloth(g,W,H,'#ece6d6',8,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#3f86a6';g.lineWidth=W*.05;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#d8a640';g.lineWidth=W*.012;rsPolyPath(g,rsInset(P,W*.05));g.stroke();
 if(ring){const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.22;g.fillStyle='#3f86a6';for(let i=0;i<16;i++){const a=i/16*TAU;g.beginPath();g.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,R*.08,0,TAU);g.fill();}
  g.fillStyle='#d8a640';g.beginPath();g.arc(cx,cy,R*.42,0,TAU);g.fill();g.fillStyle='#34495a';g.beginPath();g.arc(cx,cy,R*.24,0,TAU);g.fill();}g.restore();};}
function buildRsHykGalleon(){reseed(73200);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BLUE=0x3f86a6,GOLD=0xd8a640,WOOD=0x7a5030,DARK=0x3a2a1e,SLATE=0x34495a,DECK=0x9a7a54;
 const H=rsHull({L:58,B:14,fb:4.4,dr:3.4,sheerF:3.2,sheerA:5.6,sp:2.2,pb:1.9,pa:2.4,q:.5,n:3.6,flare:.1,rakeF:3.6,rakeA:.8,transom:.62,keelEnd:1.2,kp:4});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?BLUE:h>.9?GOLD:h>.62&&h<.66?BLUE:h<.38?0x3a3a30:WOOD);rsFoam(B,H,1.5);
 const dY=rsDeck(B,H,{bw:.95,col:DECK});for(const hF of[.88,.76,.58])rsWale(B,H,hF,.15,'wood',DARK);rsSpine(B,H,.32,DARK);
 // round gun ports, two rows a side, gilded rims
 for(const s of[-1,1])for(const hF of[.7,.52])for(let i=0;i<12;i++){const u=.24+i*.052;rsDecal(B,H,u,s,hF,.42,GOLD,'metal',12,.06);rsDecal(B,H,u,s,hF,.32,0x120c08,'paint',12,.09);}
 // rails: gold posts, a blue rail
 for(const a of rsAlong(H,.12,.94,46,1))rsLink(B,'paint',a.p,[a.p[0],a.p[1]+.9,a.p[2]],.06,GOLD,5);
 for(const s of[-1,1]){const pts=[];for(let i=0;i<=30;i++){const p=H.pt(lerp(.12,.94,i/30),s,1);pts.push([p[0],p[1]+.9,p[2]]);}rsTube(B,'paint',pts,.08,BLUE,60,6);}
 // the beakhead: a gilded spur under the bowsprit, a scroll figurehead at its tip
 {const p=H.pt(1,0,.75);rsBox(B,'wood',[5,.6,2.2],[p[0]+2.2,p[1],0],[0,0,.12],WOOD);rsBox(B,'metal',[5.2,.18,2.4],[p[0]+2.2,p[1]+.38,0],[0,0,.12],GOLD);
  rsScroll(B,[p[0]+4.8,p[1]+.6,0],.9,1.6,.18,GOLD,1,'metal');}
 // the forecastle
 const fc=rsCabin(B,{x:H.xAt(.87,1)-3,y:dY(.87),w:7,d:9,h:2.4,wall:WOOD,win:4,winCol:0x1a1410,roof:'flat',roofMk:'paint',roofCol:BLUE,over:.3});
 for(const s of[-1,1])rsBox(B,'metal',[7.4,.16,.14],[H.xAt(.87,1)-3,fc+.5,s*4.6],null,GOLD);
 // the aftcastle: three tiers stepping up, gallery windows lit, blue roofs and gilded rails; stern lanterns
 const uS=.11;let top=dY(uS);[[13,12,2.8],[9,9.6,2.5],[5.4,7,2.3]].forEach(([w,d,h],i)=>{const x=H.xAt(uS,1)+w/2-1.4+i*.6;
  rsCabin(B,{x,y:top,w,d,h,wall:WOOD,win:Math.round(w/1.3),winCol:0xe8c070,roof:'flat',roofMk:'paint',roofCol:BLUE,over:.4});top+=h+.2;
  for(const s of[-1,1])rsBox(B,'metal',[w+.6,.16,.14],[x,top+.4,s*(d/2+.3)],null,GOLD);});
 const castleTop=top+1.2;
 {const p=H.pt(0,0,.85);for(let i=0;i<5;i++)rsBox(B,'paint',[.08,1.6,1],[p[0]-.2,p[1]-.2,(i-2)*1.7],null,0xe8c070);rsBox(B,'metal',[.12,.2,9],[p[0]-.2,p[1]+1.5,0],null,GOLD);}
 for(const s of[-1,0,1])rsSphere(B,'glow',.4,[H.xAt(0,1)-.3,castleTop+.4,s*2.8],[1,1.3,1],0xffc060,10,8);
 // the bowsprit
 const bs0=[H.xAt(1,1)-1,H.ys(1)+.8,0],bs1=[H.xAt(1,1)+12,H.ys(1)+5,0];rsLink(B,'wood',bs0,bs1,.26,DARK,8,.14);
 // fore and main: square course and topsail, braced a little round; the main course bears the ring
 const square=(mx,mh,courseW,key)=>{const base=dY(H.uAt(mx)),tp=[mx,base+mh,0];rsLink(B,'wood',[mx,base-.5,0],tp,.4,DARK,10,.22);
  rsCyl(B,'wood',1,.9,1.2,[mx,base+mh*.6,0],null,DARK,12);rsRig(B,[mx,0]);const a=1.25,U=[Math.sin(a),0,Math.cos(a)];
  const foot=Math.max(fc,castleTop)-base+1.4,yard=mh*.6-.6;
  const S=rsSail(B,{key:key+'-course',O:[mx+.6,base+foot,0],U,V:[0,1,0],belly:-1.8,A:t=>[(t-.5)*courseW,yard-foot],Bf:t=>[(t-.5)*courseW*.94,0],draw:rsHykGalleonSail(key==='hyk-galleon-main')});
  rsSailEdge(B,S,1,.2,DARK);rsSailEdge(B,S,0,.12,DARK);
  const T=rsSail(B,{key:key+'-top',O:[mx+.6,base+yard+1.4,0],U,V:[0,1,0],belly:-1,A:t=>[(t-.5)*courseW*.7,mh-yard-2.6],Bf:t=>[(t-.5)*courseW*.86,0],draw:rsHykGalleonSail(false)});
  rsSailEdge(B,T,1,.14,DARK);rsSailEdge(B,T,0,.12,DARK);
  for(const s of[-1,1]){rsRope(B,S.at(s<0?0:1,0),[mx-4,dY(H.uAt(mx-4))+.5,s*6.4]);rsRope(B,tp,[mx-2,H.ys(H.uAt(mx-2)),s*6.8]);}
  rsPennant(B,[mx,base+mh+.3,0],5.5,1,[BLUE,GOLD]);rsRigEnd(B);return tp;};
 const foreTop=square(16,30,16,'hyk-galleon-fore');const mainTop=square(-1,37,19,'hyk-galleon-main');
 rsRope(B,foreTop,bs1);rsRope(B,mainTop,foreTop);
 // the mizzen: a lateen on a mast raked aft, clear of the main
 {const mx=-17,base=castleTop,rk=-.08,mh=16,tp=[mx+Math.sin(rk)*mh,base+mh,0];rsLink(B,'wood',[mx,dY(H.uAt(mx))-.3,0],tp,.26,DARK,8,.16);
  rsRig(B,[[mx,base,0],tp]);const S=rsSail(B,{key:'hyk-galleon-mizzen',O:[0,base,.45],U:[1,0,0],V:[0,1,0],belly:1,nu:20,nv:10,
   A:t=>[lerp(mx+2,mx-3,t),lerp(1.4,mh+2,t)+Math.sin(Math.PI*t)*.8],Bf:t=>[lerp(mx-7,mx-3,t)+Math.sin(Math.PI*t)*.6,lerp(1,mh+2,t)],draw:rsHykGalleonSail(false)});
  rsSailEdge(B,S,0,.12,DARK);rsPennant(B,[tp[0],tp[1]+.3,0],3.4,.8,[BLUE,GOLD]);rsRigEnd(B);}
 // the rudder, the capstan, the crew
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[3,4.6,.4],[p[0]-1.4,p[1]-.4,0],null,DARK);}
 rsCyl(B,'wood',.9,.9,1.2,[5,dY(H.uAt(5))+.6,0],null,DARK,12);
 for(const [x,z] of[[-23,3],[-20,-3],[-8,3.6],[2,-3.6],[8,3.4],[16,-2.6],[22,2],[-12,-3.4],[11,0],[-2,3.8]])rsFigure(B,[x,x<-18?top:dY(H.uAt(x)),z],rr(0,TAU),[BLUE,0xece6d6,SLATE][Math.floor(rng()*3)],false,0xb08a6a);
 rsBake(B,V.group,'hykGalleon');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'hykGalleon',name:'Hykkousoi Sea Galleon',culture:'hykkousoi',L:78,B:24,H:48,
 tags:{type:['warship','cargo','galleon'],propulsion:['sail'],hull:'monohull',wealth:'wealthy',crew:140,role:'deep-sea trader and escort'},
 blurb:'A 58 m Hykkousoi galleon banded blue and gold: a gilded beakhead, a three-tier aftcastle with lit gallery windows, two rows of round ports, square courses and topsails edged blue, the main bearing the Hykkousoi ring, a lateen mizzen.',build:buildRsHykGalleon});
