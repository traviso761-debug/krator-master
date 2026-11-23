// prefix: et
// ================================================================= THE COAST'S WORKS (Farside's backport; the owner, 2026-10-26)
// biomes/farside/src/86-host-works.js drew the coast's works as Eternian furniture (core/tags class furniture, culture
// eternian, keys farside_<kind>, tag backport: kits/eternian) until the kit drew them; these are the kit's: the kelp kiln,
// the lime kiln, the wrack heap and cart, the walled terraces, the goat fold and the drying rack, on the kit's materials
// (the library's stone, lime, timber, planks, earth). Farside's page places its own until it is moved onto these (its
// KNOWN_ISSUES). The goats are not drawn: the kit keeps no beasts.

/* vertex colours on the untextured 'plain' read far paler than their hex under the sun: the wrack's are dark to read as wet
   weed; a hole's dark is drawn on 'glow' (unlit) so it stays black */
const ET_KELP=0x120e03,ET_WEED=0x1a160a,ET_WINE=0x4a0a12,ET_ASH=0x1c1a18,ET_DARK=0x060504,ET_DRYSTONE=0xb8b0a0;
/* a heap of wrack, rx x rz across, h high: lumps half sunk in the ground */
function etWrackHeap(x,z,rx,rz,h){ellip('plain',x,0,z,rx,h,rz,new THREE.Color(ET_KELP),0,10);
 ellip('plain',x+rx*.5,0,z+rz*.45,rx*.6,h*.7,rz*.7,new THREE.Color(ET_WEED),.7,9);}

/* the kelp kiln: a long shallow trench lined with stone a course above the ground, the ash of the burning in it, a heap of
   kelp drying beside it, a rake; it burns (the potash and soda the glassmakers and soapmakers buy) */
defBuilding({key:'et_kelp_kiln',name:'Kelp kiln',seed:7440,w:10,d:9,h:3,budget:20000,front:{x:0,z:4.5,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'poor',job:'salt'},
 note:'a Hebridean kelp kiln: a stone-lined trench where dried kelp is burned to ash, a heap drying beside it, its smoke',
 build(o){const st=new THREE.Color(ET_DRYSTONE);
  for(const s of [-1,1])box('stone',0,0,s*.85,7,.55,.45,st);for(const s of [-1,1])box('stone',s*3.3,0,0,.45,.55,1.25,st);
  box('plain',0,0,0,6.15,.22,1.25,new THREE.Color(ET_ASH));box('glow',-1.2,.22,0,2.6,.04,.5,new THREE.Color(0xd9762c));
  smokeAt(-1.2,.6,0,{r:.6});
  etWrackHeap(0,-3,3,1.3,1.1);
  beam('timber',[3.9,0,1.9],[2.6,1.5,.9],.06,P('timber'));box('timber',2.45,1.45,.8,.6,.06,.08,P('timber'));}});

/* the lime kiln: a squat round kiln whitewashed with its own lime, a draw-arch at its foot, the coral rubble it burns
   heaped about it (the mortar and the whitewash) */
defBuilding({key:'et_lime_kiln',name:'Lime kiln',seed:7441,w:10,d:10,h:6.4,budget:30000,front:{x:0,z:3.4,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'poor',job:'quarrying'},
 note:'a squat round kiln, whitewashed, a draw-arch at its foot, coral rubble heaped about it',
 build(o){const sd=P('stoneD');
  lathe('lime',0,0,[[3.1,0],[3.0,1.8],[2.6,4.4],[2.35,5.2]],16,P('lime'));
  ring('stone',0,5.2,0,2.2,.22,new THREE.Color(ET_DRYSTONE));cyl('glow',0,5.05,0,1.9,.18,new THREE.Color(ET_DARK),16);
  box('glow',0,0,2.95,1.1,1.5,.3,new THREE.Color(ET_DARK));
  for(const s of [-1,1])box('stone',s*.78,0,3.05,.36,1.8,.4,sd);box('stone',0,1.7,3.05,1.92,.36,.4,sd);
  for(let k=0;k<6;k++){const a=.5+k*1.05,r=3.7+(k%2)*.4;ellip('white',Math.sin(a)*r,0,Math.cos(a)*r*.85,.7+.15*(k%3),.5,.7,new THREE.Color(0xf0ece2),a,8);}
  smokeAt(0,5.6,0,{r:.5});}});

/* the wrack heap: wrack carted off the strand, heaped to rot for the fields; a fork in it */
defBuilding({key:'et_wrack_heap',name:'Wrack heap',seed:7442,w:7,d:5,h:2,budget:8000,front:{x:0,z:2.5,yaw:0},
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'wrack carted off the strand, heaped to rot for the fields',
 build(o){etWrackHeap(-.6,-.2,2.6,1.6,1.4);beam('timber',[1.9,0,1.4],[1.2,1.6,.4],.05,P('timber'));}});

/* the wrack cart: a two-wheeled cart, its shafts to the front (+x), its load of wrack */
defBuilding({key:'et_wrack_cart',name:'Wrack cart',seed:7443,w:4.2,d:2.2,h:1.8,budget:8000,front:{x:0,z:1.1,yaw:0},
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'a two-wheeled cart with its load of wrack',
 build(o){const tb=P('timber');
  box('planks',-.3,.72,0,2.4,.08,1.5,P('timberL'));for(const s of [-1,1])box('planks',-.3,.8,s*.72,2.4,.36,.06,P('timberL'));box('planks',-1.47,.8,0,.06,.36,1.38,P('timberL'));
  box('timber',0,.5,0,.1,.1,1.95,tb);
  for(const s of [-1,1]){ring('timber',0,.55,s*.92,.5,.05,tb,0,PI/2);box('timber',0,.05,s*.92,.07,1,.07,tb);box('timber',0,.05,s*.92,.07,1,.07,tb,0,0,PI/2);}
  for(const s of [-1,1])beam('timber',[.9,.76,s*.55],[2.1,.5,s*.5],.07,tb);
  ellip('plain',-.3,.8,0,1.05,.6,.62,new THREE.Color(ET_KELP),0,10);}});

/* the walled terraces: fields stepped up a slope, each held by a dry-stone wall along the contour, manured with wrack */
defBuilding({key:'et_terraces',name:'Walled terraces',seed:7444,w:24,d:20,h:4,budget:20000,front:{x:0,z:10,yaw:0},
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'fields stepped up a slope, each held by a dry-stone wall along the contour, manured with wrack',
 build(o){const st=new THREE.Color(ET_DRYSTONE),earth=new THREE.Color(P('earth')).multiplyScalar(.9);
  for(let k=0;k<4;k++){const zc=7.5-k*4.5,hk=.3+k*.9;box('earth',0,0,zc,22,hk,4.5,earth);
   box('stone',0,0,zc+2.25,22.4,hk+.35,.45,st);
   for(let r=0;r<4;r++)box('plain',0,hk,zc-1.5+r*.95,21,.22,.36,new THREE.Color(r%2?0x56762e:0x4a6a2a));}
  etWrackHeap(-9.6,4.6,1.1,.8,.6);}});

/* the goat fold: a ring of dry-stone wall with a gap for the gate at the front, a lean-to and a trough at the back (the
   goats are the coast's wealth: milk, meat, hair and hides) */
defBuilding({key:'et_goat_fold',name:'Goat fold',seed:7445,w:20,d:20,h:3.2,budget:20000,front:{x:0,z:9.6,yaw:0},
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'herding'},
 note:'a ring of dry-stone wall with a gate gap, a lean-to and a trough',
 build(o){const st=new THREE.Color(ET_DRYSTONE),R=8.9,n=26;
  for(let k=1;k<n;k++){const a=k/n*TAU;box('stone',Math.sin(a)*R,0,Math.cos(a)*R,2.25,1.3,.7,st,a);}
  for(const s of [-1,1]){const a=s*.5/n*TAU;box('timber',Math.sin(a)*R,0,Math.cos(a)*R,.2,1.6,.2,P('timber'));}
  pushM(TF(0,0,-6));for(const x of [-1.8,1.8])for(const z of [-1.1,1.1])box('timber',x,0,z,.15,2.4,.15,P('timber'));
   etPent(4,2.8,2.4,2.8,{mk:'reed',col:P('reed'),ov:.2});popM();
  box('stone',3.4,0,-6.4,2.2,.5,.6,P('stoneD'));}});

/* the drying rack: kelp and wine weed hung on poles to dry (as kombu, as nori) */
defBuilding({key:'et_kelp_rack',name:'Kelp drying rack',seed:7446,w:6.4,d:2.4,h:2.5,budget:8000,front:{x:0,z:1.2,yaw:0},
 tags:{types:['farm'],wealth:'poor',style:'poor',job:'farming'},
 note:'kelp and wine weed hung on poles to dry',
 build(o){const tb=P('timber');
  for(const e of [-2.8,2.8])for(const s of [-1,1])box('timber',e,0,s*.45,.12,2.3,.12,tb);
  for(const s of [-1,1]){box('timber',0,2.2,s*.45,5.9,.1,.1,tb);
   for(let k=0;k<14;k++)box('plain',-2.3+k*.354,.95+.15*(k%2),s*.45,.26,1.25-.15*(k%2),.03,new THREE.Color(k%3===0?ET_WINE:ET_WEED));}}});
