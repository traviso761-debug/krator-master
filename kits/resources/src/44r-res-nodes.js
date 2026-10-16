// prefix: res
// ================================================================= RESOURCE NODES: ten kinds in three grades
// The nodes the works draw on (owner, 2026-10-15; the kinds, the rule and the numbers are 42r-res-ore.js). Larger and richer
// with the grade; a richer node has loose stuff round its foot. Each is a def `node-<kind>-<grade>` (class prop, kind
// res-node, culture generic: world content), placeable anywhere with place(); its tags carry the kind (rock), the grade
// (level) and harvest {item, efficiency, works}. Drawn with the Scyvoi engine's toolkit (box, WX, P), so any kit on that
// engine reads this file in place.
//   iron, copper, gold  an outcrop of angular dark rock tilted along a strike, its veins flush on the blocks' faces: iron a
//                       rust-red gossan crust, copper green malachite and blue azurite stains, gold a white quartz reef
//                       flecked with gold
//   tin                 pale granite blocks with white quartz stringers studded with dark brown-black cassiterite
//   silver              the dark outcrop with bright metallic grey galena streaks in white veins, black tarnish on them
//   rare-earth          the same dark outcrop speckled with pink, violet and red-brown grains (monazite, bastnaesite)
//   coal                a cut bank in a low rise: pale sandstone beds stepping back, black coal seams between them
//   sulfur              a low warm mound crusted yellow round a fuming vent, sulfur crystals at its lip
//   saltpeter           a weathered outcrop of dark earth, white saltpeter blooming on its faces and crusting the ground
//   oil                 a seep: a black pool of oil in a tar-crusted stain, bubbles on it, dead ground round it (a derrick's, not a mine's)
//   RES_LOOK                    per kind: its colours
//   resOutcrop(S, rich, fn)     the angular outcrop; fn(i, bw, bh, bd) draws a block's dressing in the block's frame
//   resNode(kind, grade)        draw a node at the origin
const RES_LOOK={iron:{vein:[0x8a3e1e,0xa4521e,0x6e2e16],lump:0x2a2624,pile:0x6a3a24},
 copper:{vein:[0x3e8a5a,0x2e7a6a,0x2e5a9a],lump:0x4a5a4a,pile:0x4e6a52},
 gold:{vein:[0xe8e4da,0xdcd6c8,0xf0ece2],lump:0xe0b030,pile:0x9a8a6a},
 tin:{vein:[0x2a201c,0x3a2c24,0xe4e0d6],lump:0x1e1814,pile:0x4a3e36,host:[0xa8a49a,0x9a968c]},
 silver:{vein:[0xb8bcc4,0x9ca0a8,0xeeeae0],lump:0x1a1a1e,pile:0x6a6c72},
 'rare-earth':{vein:[0xc87890,0x8a5aa8,0xa85a3a],lump:0x3e3836,pile:0x5a4a50},
 coal:{vein:[0x16161a,0x1e1c1e],lump:0x121214,pile:0x1a1a1c,bed:[0xb09a78,0xa48c6c,0xbca684]},
 sulfur:{vein:[0xd6c23a,0xe8d84a,0xc8a828],lump:0xf0e060,pile:0xd0b838},
 saltpeter:{vein:[0xf2efe6,0xe8e4d8,0xfaf8f2],lump:0xf6f4ee,pile:0xe0dccf},
 oil:{vein:[0x0e0c0a,0x1a1614],lump:0x141210,pile:0x2a2420}};
function resOutcrop(S,rich,fn,o){o=o||{};const nb=4+rich*3,strike=rr(0,PI);
 for(let i=0;i<nb;i++){const t=nb<2?0:i/(nb-1)-.5,x=Math.cos(strike)*t*S*.7+rr(-.12,.12)*S,z=Math.sin(strike)*t*S*.7+rr(-.12,.12)*S;
  const bw=rr(.22,.34)*S,bd=rr(.18,.28)*S,bh=(.55-Math.abs(t)*.6)*S*rr(.75,1.05),sink=bh*.18;
  WX(x,-sink,z,strike+rr(-.25,.25),rr(-.18,.18),rr(-.22,.22),()=>{box('stone',0,0,0,bw,bh,bd,o.col?o.col(i):(i%3?P('stoneD'):P('stone')));fn(i,bw,bh,bd);});}}
function resLoose(S,n,cols,mk){for(let i=0;i<n;i++){const a=rr(0,TAU),r=rr(.45,.75)*S,q=rr(.04,.09)*S;box(mk||'plain',Math.cos(a)*r,0,Math.sin(a)*r,q,q*.7,q*.9,cols[i%cols.length],rr(0,TAU));}}
function resNode(kind,grade){const L=RES_LOOK[kind],G=RES_ORE.grades[grade],S=G.size,rich=G.rank;
 if(kind==='iron'||kind==='copper'||kind==='gold'||kind==='silver'){
  resOutcrop(S,rich,(i,bw,bh,bd)=>{const nv=1+rich+(i%2);for(let k=0;k<nv;k++){const c=L.vein[(i+k)%L.vein.length],y=bh*rr(.25,.85),th=(kind==='gold'?.06:.035)*S*(1+rich*.35),side=k%2?1:-1;
    box(kind==='gold'?'stone':kind==='silver'?'iron':'plain',0,y,side*(bd/2+.006),bw*rr(.7,1.0),th,.012,c);
    if(kind==='silver'){box('plain',0,y+th,side*(bd/2+.007),bw*rr(.5,.8),th*.5,.012,L.vein[2]);for(let f=0;f<2+rich;f++)box('plain',rr(-.4,.4)*bw,y-th*.3,side*(bd/2+.012),.03*S,.012*S,.008,L.lump);}
    if(kind==='gold')for(let f=0;f<2+rich*2;f++)box('brass',rr(-.4,.4)*bw,y+th*.3,side*(bd/2+.014),.022*S,.018*S,.01,L.lump);}
   if(kind==='iron')box('plain',0,bh,0,bw*.92,.012,bd*.92,L.vein[i%3]);
   if(kind==='copper')box('plain',0,bh,0,bw*rr(.5,.85),.012,bd*rr(.5,.85),L.vein[i%3]);});
  resLoose(S,rich*7,kind==='gold'?[L.pile,L.vein[0]]:[L.pile,L.lump],kind==='gold'?'stone':'plain');return;}
 if(kind==='tin'){
  /* pale granite, white quartz stringers across the blocks, dark cassiterite grains studding them */
  resOutcrop(S,rich,(i,bw,bh,bd)=>{const nv=1+rich;for(let k=0;k<nv;k++){const y=bh*rr(.2,.8),side=k%2?1:-1,th=.03*S*(1+rich*.3);
    box('stone',0,y,side*(bd/2+.006),bw*rr(.6,1),th,.012,L.vein[2]);
    for(let f=0;f<3+rich*3;f++){const q=rr(.015,.035)*S;box('plain',rr(-.42,.42)*bw,y+rr(-.3,.8)*th,side*(bd/2+.012),q,q,.01,L.vein[f%2]);}}},{col:i=>L.host[i%2]});
  resLoose(S,rich*6,[L.pile,L.lump]);return;}
 if(kind==='rare-earth'){
  resOutcrop(S,rich,(i,bw,bh,bd)=>{const n=6+rich*8;for(let k=0;k<n;k++){const side=k%2?1:-1,q=rr(.012,.03)*S;
    box('plain',rr(-.42,.42)*bw,bh*rr(.1,.9),side*(bd/2+.006),q,q,.01,L.vein[k%3]);}
   for(let k=0;k<2+rich*2;k++){const q=rr(.015,.03)*S;box('plain',rr(-.4,.4)*bw,bh,rr(-.4,.4)*bd,q,.008,q,L.vein[k%3]);}},{col:i=>i%2?L.lump:P('stoneD')});
  resLoose(S,rich*6,[L.pile,L.vein[0],L.vein[1]]);return;}
 if(kind==='coal'){
  /* a cut bank in a low rise: pale sandstone beds stepping back up the slope, black coal seams between them (thicker with
     the grade), earth heaped behind, broken coal at the foot */
  const strike=rr(-.35,.35),len=S*1.2,H=S*(.26+.06*rich),beds=3+rich,seamF=.16+.06*rich,unit=H/(beds+(beds-1)*seamF);let y=0;
  W(0,0,0,strike,()=>{ellip('earth',0,0,-S*.5,len*.6,H*.85,S*.36,P('earth'),0,14);
   for(let b=0;b<beds;b++){const bh=unit*rr(.85,1.15),back=-b*.1*S,dz=S*.42-b*.06*S;
    box('stone',0,y,back,len*(1-b*.07),bh,dz,L.bed[b%3]);y+=bh;
    if(b<beds-1){const sh=unit*seamF*(b===1?1.5:1);box('plain',0,y,back-.05*S,len*(1-b*.07)*.97,sh,dz-.02,L.vein[b%2]);y+=sh;}}
   for(let i=0;i<4+rich*6;i++){const q=rr(.03,.07)*S;box('plain',rr(-.45,.45)*len,0,S*rr(.22,.4),q,q*.8,q,L.lump,rr(0,TAU));}});return;}
 if(kind==='sulfur'){
  /* a low mound stained by the vapour, yellow crusts laid on its surface, the fuming vent on top ringed with crystals */
  const R=.66*S,hm=.12*S*(1+rich*.3),surf=r=>hm*Math.sqrt(Math.max(0,1-(r/R)*(r/R)));
  /* the crusts take the library's ground.sulphur where the page has it (this kit); a page without it (a building kit
     reading this file in place) draws them as tinted stone */
  const sm=MAT.sulphur?'sulphur':'stone',sc=c=>MAT.sulphur?0xf6f2e4:c;
  ellip(sm,0,0,0,R,hm,R*.9,MAT.sulphur?0x9a8c62:0x8a7e5a,0,16);   /* the mound, stained by the vapour */
  ellip(sm,0,0,0,R*.78,hm*1.06,R*.7,sc(L.vein[0]),rr(0,TAU),16);   /* the crusted crown, rising through the mound */
  for(let i=0;i<3+rich*3;i++){const a=rr(0,TAU),r=rr(.72,.95)*R,pr=rr(.06,.12)*S;ellip(sm,Math.cos(a)*r,surf(r)-.004*S,Math.sin(a)*r*.9,pr,.012*S,pr*rr(.6,1),sc(L.vein[i%3]),rr(0,TAU),8);}
  ellip(sm,0,hm-.01*S,0,.16*S,.02*S,.14*S,sc(L.vein[1]),0,12);cyl('plain',0,hm,0,.05*S,.012*S,0x1a1610,10);
  for(let i=0;i<6+rich*6;i++){const a=rr(0,TAU),r=rr(.06,.13)*S;cone('plain',Math.cos(a)*r,hm-.005*S,Math.sin(a)*r,.01*S,rr(.025,.05)*S,L.lump,5);}
  for(let i=0;i<rich*5;i++){const a=rr(0,TAU),r=rr(1.05,1.3)*R;ellip(sm,Math.cos(a)*r,0,Math.sin(a)*r,rr(.05,.1)*S,.01*S,rr(.04,.08)*S,sc(L.vein[i%3]),rr(0,TAU),6);}
  smokeAt(0,hm+.04*S,0,{r:.05*S*(1+rich*.5)});return;}
 if(kind==='saltpeter'){
  /* a weathered outcrop of dark earth and soft rock, the white bloom flush on its faces and tops, crusting the ground before it */
  const EC=[0x5a4632,0x4e3c2a,0x665038];
  resOutcrop(S*.9,rich,(i,bw,bh,bd)=>{const n=4+rich*5;for(let k=0;k<n;k++){const side=k%2?1:-1,q=rr(.03,.07)*S;
    box('plain',rr(-.4,.4)*bw,bh*rr(.05,.85),side*(bd/2+.006),q*1.6,q*.6,.01,L.vein[k%3]);}
   box('plain',0,bh,0,bw*rr(.6,.9),.012,bd*rr(.6,.9),L.vein[i%3]);},{col:i=>EC[i%3]});
  for(let i=0;i<5+rich*6;i++){const a=rr(-.5,.5)+PI/2,r=rr(.4,.7)*S;ellip('sand',Math.cos(a)*r,0,Math.sin(a)*r,rr(.06,.14)*S,.008*S,rr(.05,.12)*S,L.vein[i%3],rr(0,TAU),8);}
  return;}
 if(kind==='oil'){
  /* the seep: an irregular stain of tar-crusted dead ground, the pool (or pools) of oil with its sheen, tar humps and
     bubbles, a few bleached stones */
  for(let i=0;i<4+rich*2;i++){const a=rr(0,TAU),r=rr(0,.3)*S;ellip('earth',Math.cos(a)*r,0,Math.sin(a)*r,rr(.35,.5)*S,.01*S,rr(.3,.45)*S,i%2?0x2a2420:0x3a3026,rr(0,TAU),14);}
  const np=1+rich;for(let p=0;p<np;p++){const a=p/np*TAU+rr(-.3,.3),r=np>1?rr(.16,.28)*S:0,pr=rr(.14,.22)*S*(1+rich*.15);
   W(Math.cos(a)*r,0,Math.sin(a)*r,rr(0,TAU),()=>{ellip('plain',0,0,0,pr*1.2,.03*S,pr*.95,L.vein[1],0,16);ellip('water',0,.022*S,0,pr,.006*S,pr*.78,L.vein[0],0,16);
    for(let k=0;k<3+rich*2;k++){const b=rr(0,TAU),br=rr(0,.6)*pr;sph('plain',Math.cos(b)*br,.026*S,Math.sin(b)*br*.78,rr(.008,.018)*S,L.lump,.5,6);}});}
  for(let i=0;i<3+rich*3;i++){const a=rr(0,TAU),r=rr(.35,.6)*S;ellip('plain',Math.cos(a)*r,0,Math.sin(a)*r,rr(.04,.08)*S,rr(.02,.04)*S,rr(.04,.07)*S,L.vein[1],rr(0,TAU),8);}
  for(let i=0;i<2+rich*2;i++){const a=rr(0,TAU),r=rr(.6,.8)*S;sph('stone',Math.cos(a)*r,0,Math.sin(a)*r,rr(.03,.06)*S,0xb8b0a0,.6,6);}
  return;}}
/* a node def's body (its key and seed are written out below, one def each, so the build's seed check sees them) */
const RES_NAME={iron:'Iron ore',copper:'Copper ore',gold:'Gold ore',tin:'Tin ore',silver:'Silver ore','rare-earth':'Rare earth',coal:'Coal seam',sulfur:'Sulfur',saltpeter:'Saltpeter',oil:'Oil seep'};
const RES_H={iron:.72,copper:.72,gold:.72,tin:.72,silver:.72,'rare-earth':.72,coal:.82,sulfur:.3,saltpeter:.66,oil:.12};
function resNodeDef(kind,grade){const G=RES_ORE.grades[grade],S=G.size,K=RES_ORE.kinds[kind],W=RES_ORE.works[K.works];
 return {name:RES_NAME[kind]+', '+grade+' grade',cls:'prop',kind:'res-node',w:S*1.7,d:S*1.7,h:S*RES_H[kind],budget:20000,front:{x:0,z:S*.6,yaw:0},
  tags:{culture:'generic',role:'resource node',rock:kind,level:grade,harvest:{item:K.item,efficiency:G.yield,works:K.works}},
  note:RES_NAME[kind]+', '+grade+' grade: a '+K.works+' within '+W.radius+' m takes '+K.item+' from it at '+G.yield+'x the base yield',
  build(o){resNode(kind,grade);}};}
defBuilding({key:'node-iron-low',seed:5800,...resNodeDef('iron','low')});
defBuilding({key:'node-iron-medium',seed:5801,...resNodeDef('iron','medium')});
defBuilding({key:'node-iron-high',seed:5802,...resNodeDef('iron','high')});
defBuilding({key:'node-copper-low',seed:5810,...resNodeDef('copper','low')});
defBuilding({key:'node-copper-medium',seed:5811,...resNodeDef('copper','medium')});
defBuilding({key:'node-copper-high',seed:5812,...resNodeDef('copper','high')});
defBuilding({key:'node-gold-low',seed:5820,...resNodeDef('gold','low')});
defBuilding({key:'node-gold-medium',seed:5821,...resNodeDef('gold','medium')});
defBuilding({key:'node-gold-high',seed:5822,...resNodeDef('gold','high')});
defBuilding({key:'node-tin-low',seed:5880,...resNodeDef('tin','low')});
defBuilding({key:'node-tin-medium',seed:5881,...resNodeDef('tin','medium')});
defBuilding({key:'node-tin-high',seed:5882,...resNodeDef('tin','high')});
defBuilding({key:'node-silver-low',seed:5890,...resNodeDef('silver','low')});
defBuilding({key:'node-silver-medium',seed:5891,...resNodeDef('silver','medium')});
defBuilding({key:'node-silver-high',seed:5892,...resNodeDef('silver','high')});
defBuilding({key:'node-rare-earth-low',seed:5830,...resNodeDef('rare-earth','low')});
defBuilding({key:'node-rare-earth-medium',seed:5831,...resNodeDef('rare-earth','medium')});
defBuilding({key:'node-rare-earth-high',seed:5832,...resNodeDef('rare-earth','high')});
defBuilding({key:'node-coal-low',seed:5840,...resNodeDef('coal','low')});
defBuilding({key:'node-coal-medium',seed:5841,...resNodeDef('coal','medium')});
defBuilding({key:'node-coal-high',seed:5842,...resNodeDef('coal','high')});
defBuilding({key:'node-sulfur-low',seed:5850,...resNodeDef('sulfur','low')});
defBuilding({key:'node-sulfur-medium',seed:5851,...resNodeDef('sulfur','medium')});
defBuilding({key:'node-sulfur-high',seed:5852,...resNodeDef('sulfur','high')});
defBuilding({key:'node-saltpeter-low',seed:5860,...resNodeDef('saltpeter','low')});
defBuilding({key:'node-saltpeter-medium',seed:5861,...resNodeDef('saltpeter','medium')});
defBuilding({key:'node-saltpeter-high',seed:5862,...resNodeDef('saltpeter','high')});
defBuilding({key:'node-oil-low',seed:5870,...resNodeDef('oil','low')});
defBuilding({key:'node-oil-medium',seed:5871,...resNodeDef('oil','medium')});
defBuilding({key:'node-oil-high',seed:5872,...resNodeDef('oil','high')});
