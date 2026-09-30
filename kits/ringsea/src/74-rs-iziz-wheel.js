// ---------------------------------------------------------------- vessel: Iziz Wheel Galley
// The second ship of the Iziz harbour guard, built by settlers who found gearwheels in the Ancient
// towers and put them to work: a 30 m flat-floored galley driven by four paddle wheels a side, turned
// by treadmill crews below deck on axles of reclaimed Ancient steel. Wheel boxes painted in the Iziz
// teal and ochre, a long lime-washed deckhouse with crossbow ports and a white composite roof, a
// lookout platform, a small lateen for running before the wind. The wheels turn.
function buildRsIzizWheel(){reseed(72400);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const WHITE=0xe6e0d0,TEAL=0x2a8a8a,OCHRE=0xc88a3a,DK=0x3a2a1c,STEEL=0x8a8e94;
 const H=rsHull({L:30,B:7,fb:2,dr:1.2,sheerF:1.1,sheerA:1.3,sp:2.4,pb:2,pa:1.8,q:.45,n:3.6,flare:.1,rakeF:1.6,rakeA:.4,transom:.45,keelEnd:.4,kp:4});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?TEAL:h>.84?OCHRE:h<.35?0x6a2a1c:WHITE);rsFoam(B,H,1);
 const dY=rsDeck(B,H,{bw:.5,col:0xa88a62});rsWale(B,H,.84,.08,'wood',DK);rsSpine(B,H,.18,DK);
 // the wheels: four a side, each its own group so it can turn; wheel boxes over them
 const R=1.7,wx=[-8.5,-3,2.5,8];
 for(const x of wx)for(const s of[-1,1]){const u=H.uAt(x),hw=H.hb(u)*.98,z=s*(hw+.55);const WB=rsBucket();
  for(const dz of[-.3,.3]){const g=new THREE.TorusGeometry(R,.07,6,24);rsPut(WB,'wood',g,[0,0,dz],null,null,OCHRE);}
  for(let i=0;i<8;i++){const a=i/8*TAU;rsBox(WB,'wood',[.08,.95,.72],[Math.cos(a)*(R-.3),Math.sin(a)*(R-.3),0],[0,0,a+Math.PI/2],0x7a5634);rsLink(WB,'wood',[0,0,0],[Math.cos(a)*R,Math.sin(a)*R,0],.05,DK,4);}
  rsCyl(WB,'metal',.22,.22,.9,[0,0,0],[Math.PI/2,0,0],STEEL,10);
  const G=rsBake(WB,null,'wheel');G.position.set(x,.35,z);V.group.add(G);const ph=h3(x,s,2);V.anims.push(t=>{G.rotation.z=-(t*1.2+ph);});
  // the housing: a half-drum over the top of the wheel, its outer face a painted half-ring
  const Rh=R+.3;rsPut(B,'paint',rsGrid((u,v)=>{const a=v*Math.PI;return[x+Math.cos(a)*Rh,.35+Math.sin(a)*Rh,z+(u-.5)*1.2];},2,14),null,null,null,TEAL);
  rsPut(B,'paint',new THREE.RingGeometry(R-.35,Rh,20,1,0,Math.PI),[x,.35,z+s*.6],s>0?null:[0,Math.PI,0],null,OCHRE);
  rsPut(B,'paint',new THREE.RingGeometry(R-.6,R-.35,20,1,0,Math.PI),[x,.35,z+s*.61],s>0?null:[0,Math.PI,0],null,TEAL);
  rsLink(B,'metal',[x,.35,s*(hw-.3)],[x,.35,z],.14,STEEL,8);}
 // the deckhouse: lime-washed, crossbow ports, a white composite roof reclaimed from the towers
 const yd=dY(.5);rsCabin(B,{x:0,y:yd,w:20,d:5.2,h:2.2,wall:WHITE,win:10,winCol:0x1a1410,roof:'vault',roofMk:'ancient',roofCol:0xffffff,rh:.9,over:.3});
 for(let i=0;i<10;i++){const x=-9+i*2;for(const s of[-1,1])rsBox(B,'paint',[.9,.12,.1],[x,yd+1.2,s*2.64],null,OCHRE);}
 // the lookout platform and its ladder, the stern cabin
 {const x=6,y=yd+3.1;for(const a of[-1,1])for(const b of[-1,1])rsLink(B,'wood',[x+a*.9,y,b*.9],[x+a*.9,y+2.2,b*.9],.07,DK,5);rsBox(B,'wood',[2.2,.15,2.2],[x,y+2.2,0],null,0x8a6a44);
  for(const a of[-1,1])rsLink(B,'wood',[x+a*1.1,y+2.3,-1.1],[x+a*1.1,y+2.9,1.1],.03,DK,4);rsFigure(B,[x,y+2.28,0],0,TEAL);}
 rsCabin(B,{x:-12.5,y:dY(.1),w:3.4,d:4.4,h:2,wall:WHITE,win:2,roof:'gable',roofMk:'wood',roofCol:OCHRE,rh:.9,over:.25});
 // the small lateen forward, its foot above the deckhouse roof
 const mx=11.5,base=dY(H.uAt(mx)),mh=13;rsLink(B,'wood',[mx,base-.2,0],[mx+1,base+mh,0],.16,0x6a4a2c,8,.1);
 const S=rsSail(B,{key:'iziz-lateen',O:[0,base,.3],U:[1,0,0],V:[0,1,0],belly:-.8,nu:18,nv:10,A:t=>[lerp(16.5,1,t),lerp(1.6,14.5,t)],Bf:t=>[lerp(6,1,t),lerp(4.4,14.5,t)],draw:typeof rsLateenCream==='function'?rsLateenCream:rsIzizWheelSail});
 const yd2=[];for(let k=0;k<=12;k++)yd2.push(S.at(k/12,0));rsTube(B,'wood',yd2,.1,0x7a5634,30,6);rsRope(B,[mx+1,base+mh,0],S.at(.5,0));
 rsLink(B,'wood',[-14,dY(.04)+.9,0],[-17,-.8,0],.08,DK,5);rsBox(B,'wood',[1.3,1.5,.12],[-16.8,-.9,0],null,DK);
 for(const [x,z] of[[-13,1.8],[12,-1.5],[14,1.2]])rsFigure(B,[x,dY(H.uAt(x)),z],rr(0,TAU),[WHITE,TEAL,OCHRE][Math.floor(rng()*3)]);
 rsBake(B,V.group,'izizWheel');V.deckY=yd;return V;}
// the lateen painter, for when this fragment is taken without the dhoni's (68-rs-iziz-dhoni.js)
function rsIzizWheelSail(g,W,H,P){rsCloth(g,W,H,'#ece2c8',10,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#a89468';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();g.restore();}
RS_VESSEL({key:'izizWheel',name:'Iziz Wheel Galley',culture:'iziz-vernacular',L:34,B:12,H:18,
 tags:{type:['warship','wheel boat'],propulsion:['paddle wheels','sail'],hull:'monohull',wealth:'state',crew:60,role:'harbour guard and river patrol'},
 blurb:'Four treadmill paddle wheels a side on Ancient-steel axles, a lime-washed deckhouse with crossbow ports, a lookout and a small lateen.',build:buildRsIzizWheel});
