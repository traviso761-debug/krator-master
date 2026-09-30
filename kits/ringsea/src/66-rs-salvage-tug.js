// ---------------------------------------------------------------- vessel: Salvagers' Sailing Tug
// An Ancient harbour tug the wreck-pickers refloated and turned into a sailer: a short, beamy steel
// hull with a high flared bow, black topsides over red oxide, a fat pudding fender round the stem and
// tyre fenders down both sides. Its engines are long dead, so the funnel is cut down and full of
// herbs; two salvaged pipe masts carry patched gaff sails (the fore sail's foot rides above the
// wheelhouse), a jib runs out to a pipe bowsprit, and the old towing arch now holds the main sheet.
// A dinghy is lashed upside down aft, laundry hangs on the rigging, one cyan strip still glows.
function rsTugPatch(g,W,H,P){g.fillStyle='#b4a282';g.fillRect(0,0,W,H);const C=['#a89878','#8a7a5e','#c8b898','#6a7a78','#9a6a48','#b8a070','#7a8a6a','#a8543a','#d8ccb0'];
 for(let r=0;r<7;r++)for(let c=0;c<6;c++){const x=c*W/6+(h3(r,c,1)-.5)*14,y=r*H/7+(h3(r,c,5)-.5)*12,w=W/6+h3(r,c,3)*26,h=H/7+h3(r,c,4)*20;g.fillStyle=C[Math.floor(h3(r,c,2)*C.length)];g.fillRect(x,y,w,h);
  g.strokeStyle='rgba(40,30,20,.55)';g.setLineDash([5,4]);g.lineWidth=2;g.strokeRect(x+3,y+3,w-6,h-6);g.setLineDash([]);}
 for(let i=0;i<5;i++){g.fillStyle='rgba(60,40,20,.25)';g.fillRect(0,H*(i+.5)/5,W,3);}
 g.strokeStyle='rgba(40,30,20,.75)';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();}
function buildRsSalvageTug(){reseed(71600);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BLK=0x1e1f22,OX=0x6a2a1e,WHITE=0xd6d2c6,RUST=0x8a4a2a,TYRE=0x141414;
 const H=rsHull({L:24,B:8,fb:2.2,dr:2,sheerF:2.6,sheerA:.3,sp:1.7,pb:1.7,pa:1.5,q:.42,n:2.8,flare:.22,rakeF:1.4,rakeA:.3,transom:.3,keelEnd:.8,kp:3});
 rsHullMesh(B,H,'paint',(u,h,s)=>h<.46?OX:h<.5?0x0e0e10:h>.94?WHITE:(h3(Math.floor(u*30),Math.floor(h*12),s)>.9?RUST:BLK),72,14);rsFoam(B,H,1.2);
 const dY=rsDeck(B,H,{bw:.9,col:0x6a6258});rsWale(B,H,.94,.1,'metal',0x3a3a3c);rsSpine(B,H,.12,BLK);
 // rust bleeding from the hawse pipes and scuppers
 for(let i=0;i<12;i++){const u=rr(.15,.95),s=rng()<.5?-1:1,h=rr(.6,.9);const p=H.pt(u,s,h),N=H.nrm(u,s,h);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N);
  rsPut(B,'rust',rsUV(new THREE.BoxGeometry(rr(.2,.5),rr(.8,1.8),.03),2),[p[0]+N.x*.04,p[1]-.4+N.y*.04,p[2]+N.z*.04],q,null,0xffffff);}
 // the pudding fender round the stem, tyres down the sides
 {const pts=[];for(let i=0;i<=20;i++){const t=i/20,s=t<.5?-1:1,u=lerp(.84,1,1-Math.abs(t*2-1));const p=H.pt(u,s,.84),N=H.nrm(u,s,.84);pts.push([p[0]+N.x*.3+(u>.99?.3:0),p[1],p[2]+N.z*.3]);}rsTube(B,'rope',pts,.38,0x2a2622,60,10);}
 for(const a of rsAlong(H,.2,.78,7,.74)){const g=new THREE.TorusGeometry(.42,.16,8,16);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),a.n);rsPut(B,'rope',g,[a.p[0]+a.n.x*.2,a.p[1],a.p[2]+a.n.z*.2],q,null,TYRE);
  rsRope(B,[a.p[0],H.ys(a.u)+.1,a.p[2]],[a.p[0]+a.n.x*.2,a.p[1]+.4,a.p[2]+a.n.z*.2],.03);}
 // deckhouse and wheelhouse (white, streaked), the cut-down funnel full of herbs, the glowing strip
 const yd=dY(.5);rsCabin(B,{x:1.5,y:yd,w:8,d:5.4,h:2.3,mk:'paint',wall:WHITE,win:5,winCol:0x101418,roof:'flat',roofMk:'paint',roofCol:0x8a8a86,over:.15});
 rsCabin(B,{x:3,y:yd+2.44,w:4,d:4.6,h:2.1,mk:'paint',wall:WHITE,win:3,winCol:0x101418,roof:'flat',roofMk:'paint',roofCol:0x8a8a86,over:.25});
 rsBox(B,'paint',[4.05,.6,4.65],[3,yd+3.85,0],null,0x101418);rsBox(B,'glow',[3.6,.06,.04],[3,yd+2.6,2.33],null,0x7ff4ff);
 rsCyl(B,'paint',1,1.1,2.2,[-1.2,yd+3.5,0],null,0xc8b060,16);rsCyl(B,'paint',1.02,1.02,.4,[-1.2,yd+4.2,0],null,0xa02a1e,16);
 for(let i=0;i<6;i++)rsSphere(B,'cloth',rr(.25,.45),[-1.2+rr(-.6,.6),yd+4.6+rr(0,.3),rr(-.6,.6)],null,0x4a7a3a,8,6);
 // towing arch aft, H-bitts, the dinghy upside down
 const xa=-7.5;for(const s of[-1,1])rsLink(B,'metal',[xa,dY(H.uAt(xa)),s*3.1],[xa,dY(H.uAt(xa))+3.2,s*2.6],.13,0x3a3a3c,8);rsLink(B,'metal',[xa,dY(H.uAt(xa))+3.2,-2.6],[xa,dY(H.uAt(xa))+3.2,2.6],.13,0x3a3a3c,8);
 rsBox(B,'metal',[.5,.9,.5],[-9.5,dY(.1)+.45,-1],null,0x2a2a2c);rsBox(B,'metal',[.5,.9,.5],[-9.5,dY(.1)+.45,1],null,0x2a2a2c);rsLink(B,'metal',[-9.5,dY(.1)+.7,-1.2],[-9.5,dY(.1)+.7,1.2],.12,0x2a2a2c,6);
 {const D=rsHull({L:4,B:1.5,fb:.5,dr:.1,sheerF:.2,sheerA:.15,pb:2,pa:1.6,q:.5,n:2.4,transom:.4});const DB=rsBucket();rsHullMesh(DB,D,'paint',()=>0x3a6a8a,24,6);
  const dg=rsBake(DB,null,'dinghy');dg.rotation.x=Math.PI;dg.position.set(-4.6,dY(H.uAt(-4.6))+.62,0);V.group.add(dg);}
 // the pipe masts, gaffs, booms and patched gaff sails; the pipe bowsprit and the jib
 const gaff=(mx,mh,foot,boomL,gaffL,key)=>{const base=dY(H.uAt(mx));rsCyl(B,'metal',.16,.2,mh,[mx,base+mh/2,0],null,0x5a5a5c,10);
  const lu=mh-foot-1.2;const S=rsSail(B,{key,O:[mx-.2,base+foot,.18],U:[-1,0,0],V:[0,1,0],belly:.7,nu:14,nv:10,
   A:t=>[0,t*lu],Bf:t=>[lerp(boomL,gaffL*.86,t),lerp(0,lu+gaffL*.5,t)],draw:rsTugPatch});
  rsLink(B,'wood',S.at(0,0),S.at(0,1),.1,0x5a4a3a,6);rsLink(B,'wood',S.at(1,0),S.at(1,1),.09,0x5a4a3a,6);rsRope(B,[mx,base+mh,0],S.at(1,1));rsRope(B,[mx,base+mh,0],S.at(1,.5));return[mx,base+mh,0];};
 const topF=gaff(7,14.5,5.2,6.2,6,'tug-patch'),topM=gaff(-5.5,14,3.5,6.8,6.2,'tug-patch');   // main boom rides on the old towing arch, the gallows
 const bs=[H.xAt(1,1)+5,H.ys(1)+.5,0];rsLink(B,'metal',[H.xAt(1,1)-1,H.ys(1)-.2,0],bs,.1,0x5a5a5c,8);
 rsSail(B,{key:'tug-patch',O:[0,0,.05],U:[1,0,0],V:[0,1,0],belly:-.5,nu:10,nv:8,A:t=>[lerp(bs[0]-.2,topF[0]+.3,t),lerp(bs[1]+.3,topF[1]-1.2,t)],Bf:t=>[lerp(H.xAt(1,1)-2.5,topF[0]+.3,t),lerp(H.ys(1)+1.2,topF[1]-1.2,t)],draw:rsTugPatch});
 rsRope(B,topF,bs);rsRope(B,topF,topM);rsRope(B,topM,[H.xAt(0,1)+.4,H.ys(0)+.4,0]);for(const s of[-1,1]){rsRope(B,topF,[7,H.ys(H.uAt(7)),s*3.6]);rsRope(B,topM,[-5.5,H.ys(H.uAt(-5.5)),s*3.8]);}
 // laundry on a line between the masts, the crew
 {const a=[topF[0]-.2,yd+6.6,-.3],b=[topM[0]+.2,yd+5.2,-.3];rsRope(B,a,b,.015);for(let i=1;i<7;i++){const t=i/7;rsBox(B,'cloth',[.5,.7,.03],[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.4,-.3],null,[0xc84a3a,0xe8e0c8,0x3a6a9a,0xd8b048][i%4]);}}
 for(const [x,z] of[[9,1.2],[-3.5,-2.4],[-8.5,1],[3,1.2]])rsFigure(B,[x,x===3?yd+2.44:dY(H.uAt(x)),z],rr(0,TAU),[0x5a4a3a,0x3a4a4a,0x7a3a2a,0x2a2a2a][Math.floor(rng()*4)]);
 rsBake(B,V.group,'salvageTug');V.deckY=yd;return V;}
RS_VESSEL({key:'salvageTug',name:"Salvagers' Sailing Tug",culture:'ancients-salvage',L:32,B:10,H:20,
 tags:{type:['merchant','tug','sailing conversion'],propulsion:['sail'],hull:'monohull',wealth:'poor',crew:9,role:'salvage hauler and tow'},
 blurb:'A refloated Ancient steel tug with tyre fenders, a funnel full of herbs, pipe masts and patched gaff sails.',build:buildRsSalvageTug});
