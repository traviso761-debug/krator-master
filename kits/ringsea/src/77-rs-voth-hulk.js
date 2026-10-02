// ---------------------------------------------------------------- vessel: Voth Cargo Hulk
// The workhorse of the Voth grain and ash-salt trade: a bluff, round-ended 30 m hulk, tarred dark with
// the Voth purple along the sheer, crenellated castles fore and aft, one big square sail in the Voth
// livery (deep purple, dark edge, the ash-white diamond, from core/sockets), an open hatch with the hold
// full of sacks, and a cargo derrick off the mast swinging a net of them aboard.
function rsVothHulkSail(g,W,H,P){rsFactionSail(g,W,H,P,RS_CULT.voth,'diamond',.22);g.save();rsPolyPath(g,P);g.clip();g.fillStyle='rgba(0,0,0,.1)';for(let i=1;i<7;i++)g.fillRect(W*i/7,0,3,H);g.restore();}
function buildRsVothHulk(){reseed(72700);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const TAR=rsLin(0x2e2218),TAR2=rsLin(0x1c140e),LIV=rsLin(RS_CULT.voth.field),LIV2=rsLin(RS_CULT.voth.band),ASH=rsLin(RS_CULT.voth.ink),WOOD=rsLin(0x5a4430);
 const H=rsHull({L:30,B:10,fb:3.4,dr:2.6,sheerF:2.4,sheerA:2.8,sp:2,pb:1.5,pa:1.5,q:.38,n:3.2,flare:.08,rakeF:2,rakeA:1.4,keelEnd:1,kp:3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.93?LIV:h>.89?ASH:h<.4?TAR2:TAR);rsFoam(B,H,1.3);
 const dY=rsDeck(B,H,{bw:1,col:rsLin(0x6a5a44)});for(const hF of[.8,.68,.56,.46])rsWale(B,H,hF,.1,'wood',TAR2);rsSpine(B,H,.26,TAR2);
 for(const s of[-1,1])for(let i=0;i<3;i++)rsDecal(B,H,.3+i*.2,s,.91,.35,LIV2,'paint',4,.05);
 // castles: crenellated boxes fore and aft
 const castle=(x,w,h)=>{const y=dY(H.uAt(x)),d=H.halfAt(H.uAt(x),y)*2+.4;const top=rsCabin(B,{x,y,w,d,h,mk:'wood',wall:WOOD,win:2,winCol:0x120c08,roof:'flat',roofMk:'wood',roofCol:TAR,over:.2});
  for(let i=0;i<Math.round(w/1);i++)for(const s of[-1,1])rsBox(B,'wood',[.5,.6,.25],[x-w/2+.4+i*(w-.8)/Math.max(1,Math.round(w/1)-1),top+.3,s*(d/2+.1)],null,WOOD);
  for(let i=0;i<Math.round(d/1);i++)for(const s of[-1,1])rsBox(B,'wood',[.25,.6,.5],[x+s*(w/2+.1),top+.3,-d/2+.4+i*(d-.8)/Math.max(1,Math.round(d/1)-1)],null,WOOD);
  rsSolid(B,[x-w/2,top,-d/2],[x+w/2,top+.6,d/2]);return top;};
 const fT=castle(11.5,5,2),aT=castle(-11,7,2.6);
 rsLink(B,'wood',[-11,aT,0],[-11,aT+3,0],.05,TAR2,5);rsPennant(B,[-11,aT+3,0],3,.8,[LIV,ASH]);
 // the open hatch and the sacks in the hold, the derrick and its netted load
 const hy=dY(.5);rsBox(B,'wood',[7,.4,4.6],[1.5,hy+.2,0],null,TAR);rsBox(B,'paint',[6.4,.05,4],[1.5,hy+.42,0],null,0x0a0806);
 for(let i=0;i<18;i++)rsSphere(B,'cloth',.4,[rr(-1.4,4.4),hy+.2+rr(0,.3),rr(-1.6,1.6)],[1.2,.6,.8],0xc8b890,8,6);
 const mx=-2.5,mh=21;rsLink(B,'wood',[mx,hy-1,0],[mx,hy+mh,0],.36,WOOD,10,.22);rsCyl(B,'wood',.8,.7,1,[mx,hy+mh-2,0],null,WOOD,12);
 const boomTip=[5,hy+6.5,3.8];rsLink(B,'wood',[mx,hy+1.4,.3],boomTip,.13,WOOD,6);rsRope(B,[mx,hy+10,0],boomTip,.03);rsRope(B,boomTip,[5,hy+3.2,3.8],.03);
 for(let i=0;i<6;i++)rsSphere(B,'cloth',.32,[5+rr(-.4,.4),hy+2.6+rr(-.3,.3),3.8+rr(-.4,.4)],[1.2,.6,.8],0xc8b890,8,6);rsSphere(B,'rope',.9,[5,hy+2.7,3.8],[1,.9,1],0x3a3026,8,6);
 // the square sail, braced round, its foot above the castle rails
 rsRig(B,[mx,0]);const w=15,a=.95,foot=Math.max(fT,aT)-hy+1.2;const S=rsSail(B,{key:'voth-hulk',O:[mx+.5,hy+foot,0],U:[Math.sin(a),0,Math.cos(a)],V:[0,1,0],belly:-1.6,
  A:t=>[(t-.5)*w,mh-foot-2.6],Bf:t=>[(t-.5)*w*.94,0],draw:rsVothHulkSail});
 rsSailEdge(B,S,0,.2,WOOD);rsSailEdge(B,S,1,.12,WOOD);const tp=[mx,hy+mh,0];rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[H.xAt(0,1),H.ys(0),0]);
 for(const s of[-1,1]){rsRope(B,S.at(s<0?0:1,1),[mx-5,dY(.35)+.4,s*4.6]);rsRope(B,tp,[mx,H.ys(.46),s*4.9]);}
 rsPennant(B,[mx,hy+mh+.2,0],5,.9,[LIV,ASH]);rsRigEnd(B);
 {const p=H.pt(0,0,.3);rsBox(B,'wood',[2.8,4.8,.4],[p[0]-1.2,p[1]+.8,0],null,TAR2);}
 for(let i=0;i<8;i++){const x=rr(6,9),z=rr(-3,3),y=dY(H.uAt(x))+.5;if(i%2)rsBox(B,'wood',[1,1,1],[x,y,z],[0,rr(0,1),0],WOOD);else rsCyl(B,'wood',.45,.45,1,[x,y,z],null,WOOD,10);}
 for(const [x,z] of[[-11,1.5],[1,3],[4.2,2.6],[8,-2]])rsFigure(B,[x,x<-9?aT:dY(H.uAt(x)),z],rr(0,TAU),[LIV,rsLin(0x6a5a44),ASH][Math.floor(rng()*3)],false,0x8a8aa0);
 rsBake(B,V.group,'vothHulk');V.deckY=hy;return V;}
RS_VESSEL({key:'vothHulk',name:'Voth Cargo Hulk',culture:'voth',L:36,B:16,H:24,
 tags:{type:['cargo','merchant','hulk'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:22,role:'grain and ash-salt carrier'},
 blurb:'A bluff tarred hulk with crenellated castles, a hold of sacks and a working derrick, one square sail in Voth purple with the ash diamond.',build:buildRsVothHulk});
