// ---------------------------------------------------------------- vessel: Salvagers' Bireme (on an Ancient hull)
// Built by the wreck-picking crews of the Ring Sea's ruined coasts on a hull that is not theirs: the
// white composite fuselage of some Ancient craft, still seamed with a few dead cyan strips. They cut
// two ragged banks of oar ports into it, bolted rust plate over the breaches, decked it in timber,
// raised a plank forecastle and a lashed scrap tower aft, stepped an Ancient pylon as the mast under
// a patchwork square sail, and hung a salvaged machine-cone at the bow for a ram.
function rsPatchwork(g,W,H,P){g.fillStyle='#b8a888';g.fillRect(0,0,W,H);const C=['#a89878','#8a7a5e','#c8b898','#6a7a78','#9a6a48','#b8a070','#7a8a6a','#a8543a','#d8ccb0'];
 for(let r=0;r<8;r++)for(let c=0;c<7;c++){const x=c*W/7+rr(-6,6),y=r*H/8+rr(-6,6),w=W/7+rr(-10,24),h=H/8+rr(-8,18);g.fillStyle=C[Math.floor(h3(r,c,2)*C.length)];g.fillRect(x,y,w,h);
  g.strokeStyle='rgba(40,30,20,.6)';g.setLineDash([5,4]);g.lineWidth=2;g.strokeRect(x+3,y+3,w-6,h-6);g.setLineDash([]);}
 g.fillStyle='rgba(20,14,10,.8)';g.beginPath();g.arc(W*.5,H*.42,W*.14,0,TAU);g.fill();g.fillStyle='#d8ccb0';g.beginPath();g.arc(W*.5,H*.42,W*.1,0,TAU);g.fill();
 g.fillStyle='rgba(20,14,10,.9)';g.fillRect(W*.47,H*.36,W*.06,H*.12);g.fillRect(W*.44,H*.39,W*.12,H*.05);
 g.strokeStyle='rgba(40,30,20,.7)';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();}
function buildRsSalvageBireme(){reseed(71600);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const H=rsHull({L:32,B:6.2,fb:2.4,dr:1.4,sheerF:.8,sheerA:.9,sp:2,pb:2.4,pa:1.8,q:.5,n:3,flare:.05,rakeF:.6,rakeA:.3,keelEnd:.4,tile:8});
 rsHullMesh(B,H,'ancient',null,72,14);rsFoam(B,H,1);
 const dY=rsDeck(B,H,{bw:-.1,col:0x8a7458});
 // what is left of the Ancient skin: seams, dead and living light strips
 rsWale(B,H,.9,.06,'metal',0xb8bcc0);rsWale(B,H,.45,.05,'metal',0x9a9ea4);
 for(const s of[-1,1]){rsWale(B,H,.72,.045,'glow',0x7ff4ff,.62,.86,[s]);rsWale(B,H,.72,.045,'paint',0x0a0c0e,.2,.6,[s]);}
 // ragged oar ports and bolted rust plate over the breaches
 const ports=rsAlong(H,.22,.78,16,.55).concat(rsAlong(H,.25,.75,15,.78));
 for(const a of ports){const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),a.n);rsBox(B,'paint',[.5,.42,.06],[a.p[0]+a.n.x*.02,a.p[1],a.p[2]+a.n.z*.02],q,0x0c0a08);}
 for(let i=0;i<14;i++){const u=rr(.12,.9),s=rng()<.5?-1:1,h=rr(.3,.9);const p=H.pt(u,s,h),N=H.nrm(u,s,h);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N);
  rsPut(B,'rust',rsUV(new THREE.BoxGeometry(rr(.8,2),rr(.5,1.2),.07),2),[p[0]+N.x*.05,p[1]+N.y*.05,p[2]+N.z*.05],q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),rr(-.3,.3))),null,0xffffff);}
 rsOars(V,H,{name:'lower bank',uA:.22,uB:.78,n:16,hF:.55,len:6,inb:1.5,r:.05,col:0x7a6a50,phase:0,ripple:.4});
 rsOars(V,H,{name:'upper bank',uA:.25,uB:.75,n:15,hF:.78,len:7.2,inb:1.8,r:.055,col:0x5a4a38,phase:.2,ripple:.4});
 // the bow: a salvaged machine-cone ram and the dead sensor dome
 {const p=H.pt(1,0,.35);const g=new THREE.ConeGeometry(.9,3.4,12,1);g.rotateZ(-Math.PI/2);rsPut(B,'rust',rsUV(g,2),[p[0]+1.2,p[1],0],null,null,0xffffff);
  const q=H.pt(1,0,1);rsSphere(B,'metal',.8,[q[0]-.4,q[1]+.5,0],null,0x10161c,16,12);rsCyl(B,'ancient',.9,1,.4,[q[0]-.4,q[1]+.05,0],null,0xffffff,16);}
 // forecastle of weathered plank, a scrap tower aft
 rsCabin(B,{x:10,y:dY(.82),w:5,d:4.4,h:2,wall:0x7a6a54,win:2,roof:'gable',roofCol:0x5a4a3a,rh:1,over:.3});
 {let y=dY(.18);for(let i=0;i<4;i++){const w=rr(2.6,3.6),d=rr(2.6,3.8),h=rr(1.1,1.6);rsBox(B,i%2?'rust':'wood',[w,h,d],[-11+rr(-.4,.4),y+h/2,rr(-.3,.3)],[0,rr(-.15,.15),rr(-.04,.04)],i%2?0xffffff:0x6a5a44,2);y+=h;}
  rsLink(B,'wood',[-11,y,0],[-11,y+3.2,0],.08,0x5a4a3a,5);rsPennant(B,[-11,y+3.2,0],2.4,.9,[0x121212]);}
 // the Ancient pylon mast, collared, and the patchwork square sail
 const mx=-.5,base=dY(.5),mh=17;rsCyl(B,'ancient',.36,.46,mh,[mx,base+mh/2,0],null,0xffffff,12);for(let i=1;i<6;i++)rsCyl(B,'metal',.52,.52,.3,[mx,base+i*mh/6,0],null,0x6a6e74,12);
 const w=11,a=1.1;const S=rsSail(B,{key:'salvage-patch',O:[mx+.6,base+2.2,0],U:[Math.sin(a),0,Math.cos(a)],V:[0,1,0],belly:-1,
  A:t=>[(t-.5)*w,mh*.78],Bf:t=>[(t-.5)*w*.9,.2*Math.abs(t-.5)],draw:rsPatchwork});
 rsSailEdge(B,S,0,.14,0x5a4a3a);rsRope(B,[mx,base+mh,0],[H.xAt(1,1),H.ys(1),0]);rsRope(B,[mx,base+mh,0],[H.xAt(.02,1),H.ys(0),0]);rsRope(B,S.at(0,1),[-6,base,-2.6]);rsRope(B,S.at(1,1),[-6,base,2.6]);
 for(const [x,z] of[[-3,1.6],[4,-1.8],[7,1],[-8,-1.2],[-11.2,.5]])rsFigure(B,[x,x<-9?dY(.18)+5.5:dY(H.uAt(x)),z],rr(0,TAU),[0x5a4a3a,0x3a4a4a,0x7a3a2a,0x2a2a2a][Math.floor(rng()*4)]);
 rsBake(B,V.group,'salvageBireme');V.deckY=base;return V;}
RS_VESSEL({key:'salvageBireme',name:"Salvagers' Bireme",culture:'ancients-salvage',L:36,B:21,H:20,
 tags:{type:['warship','bireme','raider'],propulsion:['oars','sail'],hull:'monohull',wealth:'poor',crew:90,role:'wreck-picker and raider'},
 blurb:'Two ragged oar banks cut into a white Ancient fuselage, rust patches, a pylon mast and a patchwork sail.',build:buildRsSalvageBireme});
