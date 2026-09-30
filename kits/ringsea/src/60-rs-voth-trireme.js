// ---------------------------------------------------------------- vessel: Voth Brackwater Trireme
// The Voth battle line: a 38 m three-banked galley, 162 oars, the top bank through an outrigger
// box. Gilded triple ram and a bronze-sheathed forefoot; a barrel-vaulted, rivet-studded deckhouse
// the length of the waist; three braced masts carrying pale roundel sails (the Voth sun-and-jar,
// fish at the corners); the blue aphlaston curling forward over the stern. (Ref: the Atlantis galley.)
function rsVothRoundel(g,W,H,P){const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#aec8d0');gr.addColorStop(.5,'#e4eff0');gr.addColorStop(1,'#a8c2cc');g.fillStyle=gr;g.fillRect(0,0,W,H);
 rsCloth(g,W,H,'rgba(0,0,0,0)',9,'v');g.save();rsPolyPath(g,P);g.clip();
 g.lineWidth=W*.07;g.strokeStyle='#44606e';rsPolyPath(g,P);g.stroke();
 const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.3;g.fillStyle='#e8f2f2';g.beginPath();g.arc(cx,cy,R*1.12,0,TAU);g.fill();
 g.strokeStyle='#44606e';g.lineWidth=R*.1;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
 g.fillStyle='#3a5260';for(let i=0;i<18;i++){const a=i/18*TAU;g.beginPath();g.arc(cx+Math.cos(a)*R*.82,cy+Math.sin(a)*R*.82,R*.07,0,TAU);g.fill();}
 // the jar and the bearer
 g.fillStyle='#34495a';g.beginPath();g.ellipse(cx-R*.12,cy+R*.2,R*.2,R*.26,0,0,TAU);g.fill();g.fillRect(cx-R*.2,cy-R*.12,R*.16,R*.1);
 g.beginPath();g.arc(cx+R*.28,cy-R*.4,R*.08,0,TAU);g.fill();g.beginPath();g.moveTo(cx+R*.2,cy-R*.3);g.lineTo(cx+R*.4,cy-R*.3);g.lineTo(cx+R*.45,cy+R*.45);g.lineTo(cx+R*.12,cy+R*.45);g.closePath();g.fill();
 // fish at the corners
 const fish=(x,y,s,f)=>{g.save();g.translate(x,y);g.scale(f*s,s);g.beginPath();g.ellipse(0,0,30,11,0,0,TAU);g.moveTo(26,0);g.lineTo(44,-12);g.lineTo(44,12);g.closePath();g.fill();g.restore();};
 g.fillStyle='#4a6674';fish(W*.2,H*.12,1.4,1);fish(W*.8,H*.12,1.4,-1);g.restore();}
function buildRsVothTrireme(){reseed(71000);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BLUE=0x3f86a6,TEAL=0x5fb4c0,WOOD=0x8a5a36,GOLD=0xd8a640,DARK=0x3a2a1e;
 const H=rsHull({L:38,B:5.4,fb:2.2,dr:1.2,sheerF:1.3,sheerA:2.2,sp:2.6,pb:2.6,pa:2.0,q:.62,n:2.6,flare:.12,rakeF:1.0,rakeA:1.4,keelEnd:.2});
 const col=(u,h,s)=>h>.9?BLUE:h>.84?GOLD:h<.32?0x3a3a30:(u>.9&&h>.35?GOLD:WOOD);
 rsHullMesh(B,H,'wood',col);rsFoam(B,H,.9);
 const dY=rsDeck(B,H,{bw:.55,col:0xb49670});
 rsWale(B,H,.86,.09,'paint',GOLD);rsWale(B,H,.62,.11,'wood',0x6a4228);rsWale(B,H,.4,.08,'wood',0x5a3822);
 // outrigger box for the thranite bank
 for(const s of[-1,1]){const x0=H.xAt(.2,1),x1=H.xAt(.8,1);const hw=H.hb(.5)+.55;rsBox(B,'paint',[x1-x0,.5,.35],[(x0+x1)/2,H.ys(.5)-.05,s*hw],null,BLUE);
  for(let i=0;i<=10;i++){const u=lerp(.22,.78,i/10);const p=H.pt(u,s,.8);rsLink(B,'wood',p,[p[0],H.ys(.5)-.2,s*hw],.06,WOOD,5);}}
 // stern: the aphlaston curling forward, and the bow: stem, gilded forefoot, the ram, the eye
 rsSpine(B,H,.22,DARK);
 const pS=H.pt(0,0,1);rsScroll(B,[pS[0]-.1,pS[1]-.2,0],2.4,1.15,.42,BLUE,1);
 for(let i=0;i<5;i++)rsScroll(B,[pS[0]-.3+i*.04,pS[1]-.1,(i-2)*.32],1.3,.9,.12,TEAL,1);
 const pB=H.pt(1,0,1);rsTube(B,'paint',[[pB[0],pB[1],0],[pB[0]+.5,pB[1]+.9,0],[pB[0]+.2,pB[1]+1.7,0],[pB[0]-.4,pB[1]+2.0,0]],t=>.28*(1-.6*t),BLUE,20,8);
 const pW=H.pt(1,0,.28);rsRam(B,pW[0]-.4,pW[1],3.2,3,GOLD);
 for(let i=0;i<6;i++){const u=.9+i*.016;for(const s of[-1,1])rsWale(B,H,.32+i*.09,.07,'metal',GOLD,.9,.995,[s]);}
 for(const s of[-1,1]){rsDecal(B,H,.935,s,.72,.55,BLUE,'paint',20,.12);rsDecal(B,H,.935,s,.72,.36,0xf0e8d8,'paint',20,.16);rsDecal(B,H,.935,s,.72,.2,0xa02818,'paint',16,.2);}
 // the deckhouse: rivet-studded barrel vault over the waist, with a row of windows
 const cy=dY(.5),hw=H.halfAt(.5,cy)*.86,x0=H.xAt(.24,1),x1=H.xAt(.8,1);
 rsBox(B,'wood',[x1-x0,1.1,hw*2],[(x0+x1)/2,cy+.55,0],null,0x8a6038,2);
 for(let i=0;i<14;i++){const x=lerp(x0+.8,x1-.8,i/13);for(const s of[-1,1])rsBox(B,'paint',[.9,.5,.06],[x,cy+.72,s*(hw+.02)],null,0x1c1610);}
 rsVault(B,'wood',x0-.2,x1+.2,cy+1.1,hw+.2,1.35,0xa8743e,16,14,2.5);
 for(let i=0;i<22;i++)for(let j=1;j<10;j++){const a=j/10*Math.PI;rsSphere(B,'metal',.07,[lerp(x0+.2,x1-.2,i/21),cy+1.1+Math.sin(a)*1.37,Math.cos(a)*(hw+.22)],null,GOLD,5,4);}
 // oars: thalamites low, zygites mid, thranites from the outrigger
 rsOars(V,H,{name:'thalamites',uA:.23,uB:.77,n:29,hF:.5,len:5.2,inb:1.2,r:.04,col:0x9a7a54,phase:0});
 rsOars(V,H,{name:'zygites',uA:.22,uB:.78,n:27,hF:.72,len:6.2,inb:1.6,r:.045,col:0x9a7a54,phase:.15});
 rsOars(V,H,{name:'thranites',points:Array.from({length:25},(_,i)=>[lerp(H.xAt(.24,1),H.xAt(.76,1),i/24),H.ys(.5)+.1,H.hb(.5)+.65]),len:7.4,inb:2,r:.05,col:0x9a7a54,phase:.3});
 // three masts, braced yards, roundel sails
 const masts=[[-9.5,13],[1,16.5],[10.5,12]];masts.forEach(([mx,mh],i)=>{const base=cy+1.1+1.35;rsLink(B,'wood',[mx,base-1.5,0],[mx,base+mh,0],.2,0x7a5634,8,.13);
  const w=mh*.8,a=.95,U=[Math.sin(a),0,Math.cos(a)];
  const S=rsSail(B,{key:'voth-roundel',O:[mx+.35,base+mh*.12,0],U,V:[0,1,0],belly:-1.1,
   A:t=>{const s=(t-.5)*w;return[s,mh*.84+Math.pow(Math.abs(s)/(w/2),1.6)*mh*.12];},Bf:t=>{const s=(t-.5)*w*.55;return[s,mh*.05*Math.abs(t-.5)];},draw:rsVothRoundel});
  rsSailEdge(B,S,0,.13,0x6a4a2c);rsSailEdge(B,S,1,.05,0x6a4a2c);
  const top=[mx,base+mh,0];rsRope(B,top,S.at(0,0));rsRope(B,top,S.at(1,0));rsRope(B,S.at(0,1),[mx-2.5,cy+1.2,-hw]);
  rsRope(B,top,[H.xAt(1,1),H.ys(1),0]);rsRope(B,top,[H.xAt(0,1)+1,H.ys(0)-.5,0]);
  rsPennant(B,[mx,base+mh+.2,0],4,.7,[BLUE,0xf0e8d8]);});
 // crew on the vault walk and the steersman aft; two steering oars
 for(const x of[-14,-6,4,9,14])rsFigure(B,[x,x>-10&&x<12?cy+2.45:dY(H.uAt(x)),rr(-.5,.5)],rr(-.6,.6),[0x3a5a78,0xe0d8c8,0x8a3020][Math.floor(rng()*3)]);
 for(const s of[-1,1]){const p=H.pt(.08,s,.9);rsLink(B,'wood',[p[0]+1,p[1]+.6,p[2]*1.05],[p[0]-2.4,-1.4,p[2]*1.25],.1,0x7a5634,6);rsBox(B,'wood',[1.6,.9,.08],[p[0]-2.1,-1.1,p[2]*1.24],[0,0,.55],0x7a5634);}
 rsBake(B,V.group,'vothTrireme');V.deckY=cy;return V;}
RS_VESSEL({key:'vothTrireme',name:'Voth Brackwater Trireme',culture:'voth',L:44,B:13,H:20,
 tags:{type:['warship','trireme'],propulsion:['oars','sail'],hull:'monohull',wealth:'state',crew:200,role:'ship of the line'},
 blurb:'Three banks of oars, a gilded triple ram, a riveted barrel-vault deckhouse and three roundel sails.',build:buildRsVothTrireme});
