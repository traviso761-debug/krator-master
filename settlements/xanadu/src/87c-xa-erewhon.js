// ================================================================= XANADU — the pieces of Erewhon (package X-Q, round 9)
// What the city of Erewhon needed that the kit did not have: a lighthouse with a turning beacon for the promontory, a
// quay and a boat shed and a warehouse for the dockyard, the Sultan's pleasure barge, the Pleasure Dome of the Bay
// (the biome's ruined dome on the island, whole again and clad in the Xanadu manner) with its dock, a garden
// teahouse on the rill grid, the prison cut into the cliff, the mouth of the Caves of Ice, and the palace gate.
// Seeds 32850–32999.

// ---------------------------------------------------------------- a small boat and the pleasure barge
function xnXQBoat(x,z,ry,L,c){const P=(u,v)=>loc(x,z,u,v,ry);c=c||xC(xPick([0x2a5aa8,0xc9442a,0xf4efe4,0x2f7a4a,0xe8a030]));const p=P(0,0);
 vB('xPaint',p[0],-.1,p[1],L*.32,.5,L,ry,c);for(const s of[-1,1]){const q=P(0,s*L/2);kput('xConeP',[q[0],.15,q[1]],qEuler(s*Math.PI/2,ry,0),[L*.32,.9,.5],c);}
 vB('vWood',p[0],.4,p[1],L*.3,.06,L*.9,ry,xC(0xa87848));vPst('vPost',p[0],.4,p[1],.05,L*.4,xC(0x5a4632));}
function buildXaBarge(G,o){reseed(32851+(o.v|0));const V=xV(o),L=22,W=6.5,gold=xC(xPick(XPAL.gold)),red=xC(xPick(XPAL.red)),lit=xLit();
 vnReg("Sultan's pleasure barge",0,0,L/2+1,7);
 vB('xPaint',0,-.4,0,W,1.2,L,0,red);vB('xGoldB',0,.7,0,W+.2,.2,L+.2,0,gold);for(const s of[-1,1])kput('xConeG',[0,.2,s*(L/2+1.2)],qEuler(s*Math.PI/2,0,0),[W*.9,2.6,1.2],gold);   // the hull and its gilt prows
 kput('xBulbG',[0,1.0,L/2+1.6],null,[.8,1.1,.8],gold);vB('vWood',0,.8,0,W-.6,.1,L-1,0,xC(0xa87848));
 // the pavilion amidships: gilt-capped columns, a valance, a gilt roof; cushions and a low table under it
 for(const s of[-1,1])for(const z of[-4,0,4]){xnCol(s*(W/2-.8),.9,z,3.2,.14,0,red,gold);}vB('vWood',0,3.9,0,W-.4,.2,10.4,0,red);
 xnGiltRoof(0,4.1,0,W-.6,10,0,{frame:0,rise:2.0,over:.8});for(const s of[-1,1])kput('xValance',[s*(W/2-.6),3.6,0],qEuler(0,s*Math.PI/2,0),[10,.5,1],red);
 for(let k=0;k<6;k++)vB('xPaint',rr(-2,2),.9,rr(-4,4),.8,.3,.8,rng()*TAU,xC(xPick([0xd04a8a,0xf2c12e,0x2a9ad8,0x8a3aa8])));vB('vWood',0,.9,0,1.6,.4,1.6,0,xC(0x5a3a1a));
 // oars, lanterns, the folk of the barge
 for(const s of[-1,1])for(let k=0;k<6;k++){const z=-8+k*3;xnMember('vWood',[s*(W/2),1.0,z],[s*(W/2+4),-.2,z+.4],.12,.08,[0,0,1],xC(0xa87848));}
 for(const s of[-1,1])for(const z of[-5.5,5.5]){vPst('vPost',s*(W/2-.4),.8,z,.05,2.4,xC(0x5a4632));kput('vBarrel',[s*(W/2-.4),3.1,z],qEuler(Math.PI,0,0),[.3,.5,.3],xC(0xd8b070));if(lit)vBall('vBulb',s*(W/2-.4),2.75,z,.07);}
 vnFolk(0,-6,3,1.5);vnFolk(0,7,2,1);}
XA.def({key:'xa_barge',name:"Sultan's pleasure barge",family:'The Sultan',tags:{type:['civic'],wealth:'civic',lit:true},w:36,d:14,h:8,fw:8,fd:24,build:buildXaBarge});

// ---------------------------------------------------------------- the quay, the boat shed, the warehouse
function buildXaQuay(G,o){reseed(32861+(o.v|0));const V=xV(o),L=V===2?32:24,stone=xC(xPick(XPAL.stone)),tim=xC(0x5a4632);
 vnReg('Quay',0,0,L/2+1,6);
 vB('vStone',0,-1.5,0,L,2.3,7,0,stone.clone().multiplyScalar(.85));vB('vStone',0,.8,0,L+.4,.3,7.4,0,stone);xnPave(0,-.6,L,5.6,0,stone,2,1.1);
 for(let k=0;k<Math.round(L/4);k++){const x=-L/2+2+k*4;vPst('vIron',x,1.1,2.9,.16,.6,xC(0x2e2a26));vPst('vPost',x,-.2,3.9,.14,2.4,tim);}
 for(let k=0;k<4;k++)vB('vStone',L/2-2.6,1.1-k*.4,-1.8+k*.6,3,.4,.6,0,stone);   // steps down to the water
 // the derrick: a mast, a boom, a hook and a bale
 {const x=-L/2+4;vPst('vPost',x,1.1,-1.5,.2,7,tim);xnMember('vWood',[x,7.6,-1.5],[x+2.5,5.2,3.5],.18,.14,[0,1,0],tim);vBeam([x+2.5,5.2,3.5],[x+2.5,2.4,3.5],.03,xC(0x2e2a26),'vRope');vnCrate(x+2.5,1.8,3.5,1.0,.2);}
 for(let k=0;k<4;k++)vnBarrel(-L/2+8+k*1.1,1.1,-1.8,.34,.9,xC(0x8a6a48));vnSacks(2,1.1,-1.5,5);vnCrate(6,1.1,-1.2,1.1,.3);vnCrate(6,2.0,-1.2,.9,.5);
 for(let k=0;k<3;k++)xnXQBoat(-L/2+5+k*7,5.5,rr(-.15,.15),rr(4.5,6.5));
 if(V===1){vnAwning(4,3.2,-1,0,6,2.4,xC(xPick([0xa8382a,0x2f7a4a,0xe8a030])));}
 vnFolk(0,-1,4,4);}
XA.def({key:'xa_quay',name:'Quay',family:'Dockyard',tags:{type:['infrastructure','industry'],wealth:'poor',lit:false},w:34,d:16,h:8,fw:24,fd:7,build:buildXaQuay});
function buildXaBoatshed(G,o){reseed(32871+(o.v|0));const V=xV(o),W=12,D=14,tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),stone=xC(xPick(XPAL.stone));
 vnReg('Boat shed',0,0,7.5,7);
 for(const s of[-1,1])vB('vStone',s*(W/2-.6),-1.5,0,1.2,2.3,D,0,stone);vB('vStone',0,-1.5,-D/2+.6,W,2.3,1.2,0,stone);   // the shed's walls stand in the water: two piers and a back wall
 for(const s of[-1,1])for(let k=0;k<4;k++)vPst('vPost',s*(W/2-.6),.8,-D/2+1+k*4,.14,4.2,timD);vB('vWood',0,.8,-D/2+.6,W,4.2,.6,0,tim);
 for(const s of[-1,1])vB('vWood',s*(W/2-.6),.8,0,.4,3.6,D,0,tim);vnGableRoof(0,5,0,W+.8,D+1,2.6,0,'xGableT',xC(V===1?0x2f6a4a:0xb8563a),.6);
 vB('xWaterB',0,-.02,1,W-2.6,.16,D-2,0,xC(XPAL.water));for(const x of[-2.8,2.8])xnXQBoat(x,0,0,rr(5,6.5));
 vB('vWood',0,.8,-D/2+2,W-2.4,.12,2,0,tim);vnBarrel(-3,.9,-D/2+2,.3,.8,xC(0x8a6a48));vnCrate(3,.9,-D/2+2,.9,.4);
 for(let k=0;k<3;k++)vB('vWood',W/2+.3,1.0+k*1.1,-D/2+3,.1,.08,4,0,timD);kput('xLeaf',[W/2+.3,2.2,-D/2+3],null,[.3,1.2,3.6],xC(0x8a7a48));   // nets drying
 vnFolk(0,D/2+2,2,1.5);}
XA.def({key:'xa_boatshed',name:'Boat shed',family:'Dockyard',tags:{type:['industry'],wealth:'poor',lit:false},w:18,d:20,h:9,fw:13,fd:15,build:buildXaBoatshed});
function buildXaWarehouse(G,o){reseed(32881+(o.v|0));const V=xV(o),W=V===2?26:20,D=12,H=6,stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),lit=xLit();
 vnReg('Warehouse',0,0,W/2+2,H+5);
 vB('vStone',0,0,0,W+.4,.4,D+.4,0,stone);xnWall(0,.4,0,W,H,D,0,xC(xPick(XPAL.earth)),V===1?'stone':'earth');vB('xTilesB',0,.4+H-.5,D/2+.06,W,.5,.1,0,xC(xPick(XPAL.tile)));
 for(let k=0;k<3;k++){const x=-W/2+W*(k+.5)/3;vnDoor(x,.4,D/2,0,2.8,3.4,'vWood',tim,timD,false);vB('vWood',x,3.9,D/2+.1,3.2,.2,.3,0,timD);}
 for(let k=0;k<4;k++)xnTibWin(-W/2+W*(k+.5)/4,4.4,D/2,0,1.0,1.0,lit?'lit':'glass',xC(xPick(XPAL.trim)),{noVal:true});
 vnGableRoof(0,.4+H,0,W+1.2,D+1.2,3.2,0,'xGableT',xC(0xb8563a),.7);vB('vWood',0,.4,D/2+1.2,W,.9,2.4,0,tim);for(let k=0;k<Math.round(W/3);k++)vPst('vPost',-W/2+1.5+k*3,0,D/2+2.4,.12,1.3,timD);   // the loading platform
 vnSacks(-W/2+4,1.3,D/2+1.2,5);vnCrate(W/2-4,1.3,D/2+1.2,1.1,.2);vnBarrel(0,1.3,D/2+1.2,.36,.9,xC(0x8a6a48));vnBarrel(1,1.3,D/2+1.2,.36,.9,xC(0x8a6a48));
 for(let k=0;k<4;k++)xnXNSpiceCone(-W/2+6+k*1.1,1.3,D/2+1.6,.32,xC(XSPICES[k*2+1]));   // spice sacks out for the tally
 vnFolk(0,D/2+5,3,3);}
XA.def({key:'xa_warehouse',name:'Warehouse',family:'Dockyard',tags:{type:['industry','market/shop'],wealth:'poor',lit:false},w:30,d:20,h:11,fw:21,fd:13,build:buildXaWarehouse});

// ---------------------------------------------------------------- the lighthouse: an octagonal stone tower on a rock, a gallery, a lantern, a turning beam
function buildXaLighthouse(G,o){reseed(32891+(o.v|0));const V=xV(o),H=V===2?20:26,stone=xC(xPick([0xefe6d2,0xe8dfc8,0xd8d0b8])),band=xC(xPick([XPAL.red,XPAL.lapis,XPAL.turquoise])),gold=xC(xPick(XPAL.gold)),iron=xC(0x2e2a26);
 vnReg('Lighthouse',0,0,5,H+8);
 kput('xBoulder',[0,-1,0],null,[9,3,9],xC(0x8a7a66));vB('vStone',0,1.4,0,7,.6,7,0,stone);xnFlight(0,0,3.5+1.4,0,3,1.8,'vStone',stone);
 const q=qEuler(0,Math.PI/8,0);kput('xOctS',[0,2,0],q,[2.8,H,2.8],stone);kput('xOctP',[0,2,0],q,[2.85,H*.14,2.85],band);kput('xOctP',[0,2+H*.5,0],q,[2.7,H*.14,2.7],band);   // the tower and its two bands
 vnDoor(0,2,2.55,0,1.2,2.4,'vStone',stone,xC(0x2a1a10),false);for(let k=0;k<4;k++)xnTibWin(0,4.5+k*H/5,2.6-k*.03,0,.7,1.0,'glass',iron,{noVal:true});
 // the gallery: a wider octagon with a rail, then the lantern room: iron columns, glass, a domed cap with a gold finial
 const YG=2+H;kput('xOctS',[0,YG,0],q,[3.6,.5,3.6],stone);for(let k=0;k<16;k++){const a=k/16*TAU;vPst('vPipe',Math.sin(a)*3.4,YG+.5,Math.cos(a)*3.4,.03,1.0,iron);}
 for(let k=0;k<16;k++){const a=k/16*TAU,b=(k+1)/16*TAU;vBeam([Math.sin(a)*3.4,YG+1.5,Math.cos(a)*3.4],[Math.sin(b)*3.4,YG+1.5,Math.cos(b)*3.4],.03,iron,'vIron');}
 kput('xOctS',[0,YG+.5,0],q,[2.4,.3,2.4],iron);for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;vPst('vPipe',Math.sin(a)*2.1,YG+.8,Math.cos(a)*2.1,.06,3.0,iron);}
 vPst('vTankW',0,YG+.8,0,2.1,3.0,xC(0xd8f0f8));vB('xGoldB',0,YG+3.8,0,4.8,.3,4.8,0,gold);kput('xBulbG',[0,YG+4.1,0],null,[2.4,2.0,2.4],xC(xPick([XPAL.turquoise,XPAL.lapis])));vBall('xGold',0,YG+6.3,0,.24,gold);
 // THE BEACON: a real mesh (the kit is instanced and cannot turn): a warm globe and two long translucent beams,
 // turned by a frame hook. Registered on the group so it moves with the site.
 {const lamp=new THREE.Mesh(new THREE.SphereGeometry(.45,12,10),new THREE.MeshBasicMaterial({color:0xfff0c0}));lamp.position.set(0,YG+2.3,0);lamp.userData.inspectLabel='Lighthouse — the lamp';G.add(lamp);
  const beam=new THREE.Group();beam.position.set(0,YG+2.3,0);for(const s of[0,Math.PI]){const g=new THREE.ConeGeometry(9,140,14,1,true);g.rotateX(-Math.PI/2);g.translate(0,0,70);
   const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xfff4d0,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false,fog:false}));m.rotation.y=s;m.userData.probeSkip=true;beam.add(m);}
  beam.userData.probeSkip=true;G.add(beam);const rate=.5;FRAME_HOOKS.push(dt=>{beam.rotation.y+=dt*rate;});}
 vnFolk(0,6,1,1);}
XA.def({key:'xa_lighthouse',name:'Lighthouse',family:'Dockyard',tags:{type:['infrastructure','civic'],wealth:'civic',lit:true,landmark:true},w:16,d:16,h:36,fw:9,fd:9,build:buildXaLighthouse});

// ---------------------------------------------------------------- the garden teahouse: on a double rill plot (16 m), the water runs through under it
function buildXaTeahouse(G,o){reseed(32901+(o.v|0));const V=xV(o),stone=xC(xPick(XPAL.stone)),red=xC(xPick(XPAL.red)),gold=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.timber)),lit=xLit();
 vnReg('Teahouse',0,0,8,8);xnPave(0,0,16,16,0,stone,2);xnRill(0,0,0,0,16,{c:stone,curb:V===1?'xCheckerB':'vStone'});
 // the pavilion: a raised timber floor either side of the rill, a colonnade, a tiled hip roof with a gilt ridge
 for(const s of[-1,1])vB('vWood',s*3.6,.1,0,5.6,.4,11,0,tim);vB('vWood',0,.5,0,1.6,.12,11,0,tim);   // a little bridge over the rill
 for(const s of[-1,1])for(const z of[-5,-1.7,1.7,5])xnCol(s*6.2,.5,z,3.2,.16,0,red,gold);for(const z of[-5,5])for(const x of[-3,3])xnCol(x,.5,z,3.2,.16,0,red,gold);
 vB('vWood',0,3.7,0,13.2,.3,11.4,0,red);vnHipRoof('xHipT',0,4.0,0,13,11,2.6,0,xC(V===2?0x2f6a4a:0xb8563a),1.2);vB('xGoldB',0,6.6,0,3,.3,.4,0,gold);vBall('xGold',0,6.9,0,.2,gold);
 for(const s of[-1,1])kput('xValance',[s*6.2,3.4,0],qEuler(0,s*Math.PI/2,0),[11,.5,1],red);
 // cushions, low tables, samovars, hanging lanterns
 for(const s of[-1,1])for(const z of[-3.2,0,3.2]){vB('vWood',s*3.6,.5,z,1.4,.35,1.0,0,xC(0x5a3a1a));for(const q of[-1,1])vB('xPaint',s*3.6+q*1.2,.5,z,.7,.25,.7,0,xC(xPick([0xd04a8a,0xf2c12e,0x2a9ad8,0x8a3aa8,0xc9442a])));
  vPst('xDrumS',s*3.6,.85,z,.12,.4,xC(0xd8b070));vPst('xGold',s*3.6,1.25,z,.05,.2,gold);}
 for(const s of[-1,1])for(const z of[-3.5,3.5]){vBeam([s*3.6,3.7,z],[s*3.6,3.1,z],.012,xC(0x2e2a26),'vRope');kput('vBarrel',[s*3.6,2.8,z],qEuler(Math.PI,0,0),[.28,.5,.28],xC(0xd8b070));if(lit)vBall('vBulb',s*3.6,2.55,z,.07);}
 for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]])xnXPPot(s[0]*7,0,s[1]*7,.34,XGP.turq);for(const s of[-1,1])xnTree(s*7.2,-7,3.6);
 vnFolk(-3.6,0,3,2);vnFolk(3.6,0,2,2);}
XA.def({key:'xa_teahouse',name:'Teahouse',family:'Garden tiles',tags:{type:['tavern/inn'],wealth:'middle',lit:true},w:16,d:16,h:8,fw:16,fd:16,snap:8,build:buildXaTeahouse});

// ---------------------------------------------------------------- the prison, cut into the cliff
function buildXaPrison(G,o){reseed(32911+(o.v|0));const V=xV(o),W=26,H=16,rock=xC(xPick([0x6a6258,0x5c5448,0x7a7064])),stone=xC(xPick(XPAL.stone)),iron=xC(0x2e2a26),lit=xLit();
 vnReg('The prison',0,-4,W/2+2,H+6);
 // the cliff mass, the cut face, the ledge before it
 kput('xBatS92',[0,0,-12],null,[W+10,H+8,12],rock);vB('xRockB',0,0,-4,W,H,6,0,rock.clone().multiplyScalar(.9));for(const s of[-1,1])vB('xRockB',s*(W/2+4),0,-3,6,H+3,8,0,rock);vB('vStone',0,0,2,W+4,.6,8,0,stone.clone().multiplyScalar(.8));
 // the facade: rows of barred windows in dressed surrounds, a gate with a portcullis, a watch platform with a brazier
 for(let r=0;r<3;r++)for(let k=0;k<7;k++){const x=-W/2+2+k*(W-4)/6,y=2.2+r*4.2;if(r===0&&(k===3))continue;vB('vStone',x,y-.2,-1.05,1.4,1.6,.3,0,stone.clone().multiplyScalar(.9));vB('vDarkB',x,y,-.95,1.0,1.2,.1,0);
  for(let b=0;b<4;b++)vPst('vPipe',x-.4+b*.27,y,-.9,.025,1.2,iron);}
 vB('vStone',0,0,-1.1,4.6,5.2,.4,0,stone);kput('xArcDark',[0,.6,-.85],null,[3,3.8,.2]);for(let b=0;b<7;b++)vPst('vPipe',-1.3+b*.43,.6,-.8,.04,3.4,iron);for(let b=0;b<4;b++)vB('vIron',0,1.2+b*.8,-.8,3,.06,.06,0,iron);
 vB('vStone',0,H-.6,-1.5,W-2,.6,4,0,stone);xnCrenel(0,H,-1.5,W-2,4,0,1.0,stone,{item:'vStone'});for(const s of[-1,1]){vPst('xDrumS',s*(W/2-1.8),H-.6,-1.5,.6,.9,iron);if(lit)vBall('vBulb',s*(W/2-1.8),H+.5,-1.5,.2);}
 for(const s of[-1,1]){vB('vStone',s*(W/2+1),0,-2,2.4,H+2,4,0,stone.clone().multiplyScalar(.85));kput('xConeW',[s*(W/2+1),H+2,-2],null,[1.6,2.4,1.6],stone);}   // the two flanking turrets
 for(const s of[-1,1])xnXGSpears(s*3,3.5,0,3);vnFolk(0,4,3,2);}
XA.def({key:'xa_prison',name:'The prison',family:'Military',tags:{type:['military','civic'],wealth:'civic',lit:true,landmark:true},w:40,d:30,h:26,fw:36,fd:14,build:buildXaPrison});

// ---------------------------------------------------------------- the Caves of Ice (round 9c): a small ice cavern
// A chamber dug into the hill on its level floor (local +z is the mouth): an ice shell seen from within (glassy,
// faintly lit), a rock shell over it that meets the hillside, a tall opening at the front;
// icicles from the roof, ice columns and crystal clusters, the spring's pool at the back and the stream running out
// through the mouth; boulders and two votive pillars outside. The world levels the floor and lays the stream's head in it
// a library material's maps (materials.json -> tex/ -> KMAT.pack, 88x-matlib-pack.js), repeated rx × ry times; cached
const XA_TEXCACHE={};
function xaTexMaps(fam,rx,ry){const P=typeof KMAT!=='undefined'&&KMAT.packed&&KMAT.packed('xanadu',fam);if(!P||!P.map)return{};const key=fam+'/'+rx+'/'+ry;if(XA_TEXCACHE[key])return XA_TEXCACHE[key];
 const L=new THREE.TextureLoader(),t={};for(const k of['map','normalMap','roughnessMap']){if(!P[k])continue;const tx=L.load(P[k]);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(rx,ry);tx.anisotropy=4;if(k==='map')tx.encoding=THREE.sRGBEncoding;t[k]=tx;}
 return XA_TEXCACHE[key]=t;}
function buildXaIceCave(G,o){reseed(32921+(o.v|0));const V=xV(o),rock=xC(xPick([0x9a948a,0x8e877c,0xa39d92])),ice=xC(0xcfe6f0),water=xC(0x8fd0e0);
 const RX=9,RY=7,RZ=11,GAP=.55;
 // a dome shell with the mouth's wedge left out (three.js puts phi = PI/2 on +z), its radius roughened
 const shell=(rx,ry,rz,mat,amp)=>{const g=new THREE.SphereGeometry(1,40,14,Math.PI/2+GAP,TAU-2*GAP,0,Math.PI/2);const P=g.attributes.position;
  for(let i=0;i<P.count;i++){const y=P.getY(i),h=Math.sin(Math.round(P.getX(i)*500)*12.9898+Math.round(y*500)*78.233+Math.round(P.getZ(i)*500)*37.719)*43758.5453,k=1+(y>.02?amp*(h-Math.floor(h)-.5):0);/* roughened by position, so the seam's twin vertices stay together */P.setXYZ(i,P.getX(i)*rx*k,y*ry*k,P.getZ(i)*rz*k);}g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.userData.probeSkip=true;G.add(m);return m;};
 // the vault: the library's clear blue ice (ice.clear) from within, faintly lit by its own map; the crust over it the
 // glacier ice (ice.glacier), a shade greyed toward the hill's rock
 {const W=xaTexMaps('icewall',14,3);shell(RX,RY,RZ,new THREE.MeshStandardMaterial(Object.assign({color:W.map?0xffffff:0xbfe3f0,roughness:W.roughnessMap?1:.18,metalness:.05,emissive:0x2a5a70,emissiveIntensity:.5,emissiveMap:W.map||null,side:THREE.BackSide,flatShading:true},W)),.12).userData.inspectLabel='The Caves of Ice (the cavern)';
  const C=xaTexMaps('icefloor',12,3);shell(RX+1.6,RY+1.7,RZ+1.6,new THREE.MeshStandardMaterial(Object.assign({color:C.map?0xc8ccd0:rock.getHex(),roughness:C.roughnessMap?1:.95,flatShading:true},C)),.16);}
 vnReg('The Caves of Ice',0,0,RX,RZ);vnReg('The Caves of Ice — the spring',0,-6,3,3);
 // the floor
 const zm=Math.cos(GAP)*RZ;
 {const F=xaTexMaps('icefloor',6,7),g=new THREE.CircleGeometry(1,48);g.rotateX(-Math.PI/2);g.scale(RX-.3,1,RZ-.3);const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial(Object.assign({color:F.map?0xffffff:0xcfe6f0,roughness:F.roughnessMap?1:.3},F)));m.position.y=.04;m.userData.probeSkip=true;G.add(m);}   // the floor: glacier ice
 kput('xDiscS',[0,.08,-6],null,[3,.06,2.4],water);vB('xWaterB',0,.1,2.5,2.2,.06,15,0,water);for(let k=0;k<10;k++)vBall('vBallW',rr(-.9,.9),.15,rr(-5,9),rr(.08,.18),xC(0xe8f4f8));
 // icicles from the roof, columns where they meet the floor, crystal clusters round the walls
 for(let k=0;k<46;k++){const a=rng()*TAU,r=Math.sqrt(rng())*.85,x=Math.cos(a)*r*RX,z=Math.sin(a)*r*RZ,yr=RY*Math.sqrt(Math.max(0,1-(x/RX)**2-(z/RZ)**2))-.15;
  kput('xConeW',[x,yr,z],qEuler(Math.PI,0,0),[rr(.15,.38),rr(.6,2.6),rr(.15,.38)],ice);}
 for(const [x,z] of[[-4.5,-3],[4.2,-5],[-3.5,4],[5,2.5]]){const yr=RY*Math.sqrt(Math.max(0,1-(x/RX)**2-(z/RZ)**2));kput('xConeW',[x,0,z],null,[.55,yr*.55,.55],ice);kput('xConeW',[x,yr,z],qEuler(Math.PI,0,0),[.5,yr*.5,.5],ice);}
 for(let k=0;k<14;k++){const a=rng()*TAU,x=Math.cos(a)*RX*.82,z=Math.sin(a)*RZ*.82;if(z>zm-3)continue;for(let j=0;j<4;j++)kput('xConeW',[x+rr(-.6,.6),0,z+rr(-.6,.6)],qEuler(rr(-.4,.4),0,rr(-.4,.4)),[rr(.12,.3),rr(.6,1.8),rr(.12,.3)],ice.clone().multiplyScalar(rr(.95,1.05)));}
 // outside: icicles from the lip, boulders, the votive pillars
 // icicles hung along the opening's own edges (the wedge's two sides), not in the air before it
 for(const sg of[-1,1])for(const th of[.2,.4,.6,.8,1,1.2]){const ph=Math.PI/2+sg*GAP;kput('xConeW',[-Math.cos(ph)*Math.sin(th)*RX,RY*Math.cos(th),Math.sin(ph)*Math.sin(th)*RZ],qEuler(Math.PI,0,0),[rr(.18,.3),rr(.5,1.4),rr(.18,.3)],ice);}
 for(let k=0;k<10;k++){const a=rr(-1.2,1.2)+Math.PI/2,r=rr(RZ+1,RZ+5);kput('xBoulder',[Math.cos(a)*r*.9,rr(-.5,.5),Math.sin(a)*r],qEuler(rng(),rng(),0),[rr(1.5,3.5),rr(1,2.5),rr(1.5,3)],rock.clone().multiplyScalar(rr(.85,1.05)));}
 if(V!==2)for(const s of[-1,1]){vPst('xColS',s*6.4,0,zm+3,.5,4,xC(xPick(XPAL.stone)));kput('xBulbT',[s*6.4,4,zm+3],null,[.8,1,.8],xC(xPick(XPAL.tile)));}
 vnFolk(0,3,2,2);}
XA.def({key:'xa_ice_cave',name:'The Caves of Ice',family:'Sacred',tags:{type:['religious','infrastructure'],wealth:'civic',lit:false,landmark:true},w:30,d:32,h:12,fw:24,fd:26,build:buildXaIceCave});

// ---------------------------------------------------------------- the palace gate: a mosaic iwan between two gilt-roofed drums, the Sultan's crest over the arch
function buildXaPalaceGate(G,o){reseed(32931+(o.v|0));const V=xV(o),W=22,D=10,H=13,wash=xC(xPick(XPAL.wash)),gold=xC(xPick(XPAL.gold)),stone=xC(xPick(XPAL.stone)),lit=xLit();
 vnReg('Palace gate',0,0,W/2+3,H+12);
 vB('vStone',0,0,0,W+2,.6,D+2,0,stone);for(const s of[-1,1]){vPst('xDrumW',s*(W/2-3),.6,0,3.2,H,wash);xnBand(s*(W/2-3),.6+H-1.0,0,6.4,6.4,0,.8);vPst('xDrumS',s*(W/2-3),.6+H,0,3.5,.5,stone);
  xnGiltRoof(s*(W/2-3),.6+H+.5,0,6.2,6.2,0,{frame:.9,rise:2.6,over:.9});for(let k=0;k<3;k++)xnTibWin(s*(W/2-3),3+k*3.4,3.2,0,1.0,1.4,lit?'lit':'glass',xC(xPick(XPAL.trim)),{});}
 vB('xWashB',0,.6,0,W-8,H-2,D,0,wash);xnIwanOpen(0,.6,D/2,0,W-8.4,H-2,D,wash,{through:true,lamps:lit,guldasta:false});
 xnRoundel(0,.6+H-3.6,D/2+.3,0,2.6);vB('xGoldB',0,.6+H-2,0,W-7.6,.4,D+.4,0,gold);xnCrenel(0,.6+H-1.6,0,W-8,D,0,1.2,wash,{});
 for(const s of[-1,1])xnPennants([s*(W/2-3),.6+H+4.2,-2.6],[s*(W/2-3),.6+H+4.2,2.6],4);
 for(const s of[-1,1])xnXGSpears(s*7,D/2+2,0,3);vnFolk(0,D/2+5,3,3);}
XA.def({key:'xa_palace_gate',name:'Palace gate',family:'Military',tags:{type:['military','civic'],wealth:'civic',lit:true,landmark:true},w:30,d:22,h:26,fw:24,fd:12,build:buildXaPalaceGate});

// ---------------------------------------------------------------- the Pleasure Dome of the Bay: the biome's ruin on the island made whole and clad in the Xanadu manner
// a round podium of three step rings, a ring of twenty gilt-capped columns under an architrave of pointed arches, a
// drum pierced by twelve arched windows in mosaic surrounds, a turquoise tiled dome under a gold finial; inside, the
// pale glaze of the caves of ice; a terrace, a dock and the barge
function buildXaPleasureDomeBay(G,o){reseed(32941+(o.v|0));const V=xV(o),R=22,lit=xLit(),stone=xC(xPick([0xefe6d2,0xe8dfc8,0xf2ece0])),gold=xC(xPick(XPAL.gold)),turq=xC(V===1?XPAL.gold[0]:V===2?XPAL.lapis:0x2aa5a0);
 vnReg('Pleasure Dome of the Bay',0,0,R+8,R+20);vnReg('Pleasure Dome of the Bay — dock',0,R+14,10,4);
 for(const [r,y] of[[R+6,-.8],[R+4,0],[R+2,.8]])kput('xDiscS',[0,y,0],null,[r,.8,r],stone);kput('xDiscS',[0,1.6,0],null,[R+1,.4,R+1],stone);const y0=2.0;
 const NC=20,CR=R-1.2,CH=11;for(let i=0;i<NC;i++){const a=i/NC*TAU,x=Math.cos(a)*CR,z=Math.sin(a)*CR;xnCol(x,y0,z,CH,.36,-a,stone,gold);}
 for(let i=0;i<NC;i++){const a=(i+.5)/NC*TAU,x=Math.cos(a)*CR,z=Math.sin(a)*CR;xnArch('xArchP',x,y0+CH-3.6,z,Math.atan2(x,z),TAU*CR/NC-.4,4.2,.6,stone,{open:true});}
 kput('xDiscG',[0,y0+CH+.5,0],null,[CR+1.4,.4,CR+1.4],gold);vB('xFriezeB',0,y0+CH+.1,0,.1,.1,.1,0);   // the gilt architrave ring
 const DR=R*.62,DH=8;kput('xDrumW',[0,y0,0],null,[DR,DH,DR],xC(xPick(XPAL.wash)));for(let i=0;i<12;i++){const a=i/12*TAU,x=Math.cos(a)*DR,z=Math.sin(a)*DR;xnXTArchWin(x,y0+1.4,z,Math.atan2(x,z),2.2,4.8,xC(XPAL.lapis),'xMosAB',lit);}
 vB('xBandB',0,y0+DH-.9,0,DR*2+.4,.7,DR*2+.4,0,xC(xPick(XPAL.maroon)));kput('xDiscS',[0,y0+DH,0],null,[DR+.6,.4,DR+.6],stone);
 xnDome(0,y0+DH+.4,0,DR-.6,'T',{c:turq,fin:2.6});for(let k=0;k<12;k++){const a=k/12*TAU;vB('xGoldB',Math.cos(a)*(DR-.4),y0+DH+.4,Math.sin(a)*(DR-.4),.5,.5,.5,-a,gold);}
 {const g=new THREE.Mesh(new THREE.SphereGeometry(DR-1.6,32,16,0,TAU,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xcfe6f0,side:THREE.BackSide,fog:false}));g.position.set(0,y0+DH+.4,0);g.userData.inspectLabel='The caves of ice (the dome, inside)';g.userData.probeSkip=true;G.add(g);}
 vnDoor(0,y0,DR-.2,0,3,5,'xPaint',xC(XPAL.maroon[0]),xC(0x2a1a10),false);xnFlight(0,0,R+7+.9,0,8,2.0,'vStone',stone);
 for(let k=0;k<10;k++){const a=k/10*TAU+.3;xnXPPot(Math.cos(a)*(R-4),y0,Math.sin(a)*(R-4),.4,XGP.turq);}for(let k=0;k<6;k++){const a=k/6*TAU;xnTree(Math.cos(a)*(R+9),Math.sin(a)*(R+9),rr(3.5,5));}
 if(lit)for(let k=0;k<8;k++){const a=k/8*TAU+.2;vnLampPost(Math.cos(a)*(R+4.5),0,Math.sin(a)*(R+4.5),3.4);}
 xnXTQuay(0,R+12,24,8);xnSub('xa_barge',0,0,R+22,Math.PI/2,{v:V});vnFolk(0,R+9,4,4);}
XA.def({key:'xa_pleasure_dome_bay',name:'Pleasure Dome of the Bay',family:'The Sultan',tags:{type:['civic'],wealth:'civic',lit:true,landmark:true},w:76,d:90,h:44,fw:56,fd:56,eye:[6,44,0,10],build:buildXaPleasureDomeBay});

// ---------------------------------------------------------------- a street bridge over the stream (round 9c): the deck's top at
// y 0 (the street's level), running along local z; one stone arch over the channel, abutments sunk into the banks,
// parapets with gilt caps. Variants are the street widths: 0 a lane (6 m), 1 an avenue (10 m), 2 the highway (13 m)
function buildXaBridge(G,o){reseed(32951+(o.v|0));const V=xV(o)%3,W=[6,10,13][V],L=20,stone=xC(xPick(XPAL.stone)),dark=xC(0x6a5e50),gold=xC(xPick(XPAL.gold));
 vnReg('Bridge',0,0,W/2,L/2);
 vB('vStone',0,-.8,0,W,.8,L,0,stone);                                                   // the deck
 for(const s of[-1,1])vB('vStone',0,-6,s*7,W,5.2,6,0,dark);                              // the abutments, into the banks
 for(let k=0;k<8;k++){const z=-4+(k+.5),t=Math.abs(z)/4,ys=-1.4-2.4*t*t;vB('vStone',0,ys,z,W,-.8-ys,1,0,stone);}   // the arch's spandrel, stepping down to the springers
 for(const s of[-1,1]){const x=s*(W/2-.25);vB('vStone',x,0,0,.5,1.0,L,0,stone);vB('xGoldB',x,1.0,0,.6,.12,L,0,gold);
  for(const z of[-L/2+.4,L/2-.4]){vB('vStone',x,0,z,.8,1.3,.8,0,stone);vBall('xGold',x,1.5,z,.22,gold);}}}
XA.def({key:'xa_bridge',name:'Street bridge',family:'Public',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:13,d:20,h:3,fw:13,fd:20,build:buildXaBridge});
