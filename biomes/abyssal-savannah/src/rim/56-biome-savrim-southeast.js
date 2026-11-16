// ================================================================= SAVANNARIM — the se rim, the incense country (PLAN-LANDS.md section 5.2; J6, 2026-11-08)
// Where the Socotran lineage meets the rains: the Bowl's dwarfs grow into trees here and Talia gets rich on their resins (proposed). Its
// neighbours: the Bowl (the sedesert's Socotran flora) to the south-east, the e highlands' wet face to the east (cloud forest at its foot,
// where everything grows toward the giant), Godstep to the south (red laterite, the red guyed stalk), hyperjungle S to the north.
//   raindragon    sedesert.dragon's cousin: 25-40 m, branched many times into a candelabra of tufted crowns, greener (dragon's blood)
//   rainrose      sedesert.rose's cousin: a swollen-trunked tree 8-15 m on the kopjes, pink at the dry season's end (arrow poison)
//   rainbottle    sedesert.bottle's cousin at the gate baobab's bulk, 30-60 m: the rim's middle lineage (fruit pulp, bark fibre)
//   incense       Socotra's own Boswellia (not the Bowl's kit): a crooked 6-15 m tree with papery peeling bark on the dry rocky slopes
//                 (frankincense: Talia's caravan trade, proposed); bark.paperbark (`incensebark`)
//   cloudavocado  the wet face's laurel forest: a 40-60 m evergreen heavy with moss, its epiphytes thickest on the giant's side (H4)
//   leanfern      a 10-20 m tree fern in the Cfa ravines, its crown tipped toward the giant (H4: BIO.leanTo)
//   rustmiombo    DEFINED HERE, read by Godstep's redlands station (SAVRIM.builders.rustmiombo): a 20-30 m woodland tree on laterite;
//                 at the start of the rains the whole woodland flushes copper-red for a few weeks, then turns green (H7: the copper
//                 flush, core/biome 30s and core/clock's flush), and drops in the dry season
//   guyedstalk    the red guyed stalk is Godstep's (defined once there, biomes/godstep/PLAN.md section 3): not built yet; this land's
//                 gullies read it in place when Godstep's kit carries it (its row here is a reference only)
// Records at load (appended to SAVRIM.SPECIES), items and cousins on first use (SAVRIM.LANDS.southeast.def(), .cousins()).
SAVRIM.LANDS=SAVRIM.LANDS||{};
{const HV=SAVRIM.HV,T=o=>Object.assign({},SAVRIM.TAGS,{land:'southeast'},o),TH=()=>BIO.host.THREE;
 const R=[
  {key:'raindragon',name:'Rain dragon',from:'sedesert.dragon',kind:'tree',tags:T({koppen:['Aw','Am'],harvest:HV('timber',['none'],true,'Dragon\'s blood: a red resin, dye and varnish (proposed: Talia\'s trade).'),dye:'red',earth:'Dracaena steudneri; D. draco in moist sites'})},
  {key:'rainrose',name:'Rain rose',from:'sedesert.rose',kind:'tree',tags:T({koppen:['Aw'],harvest:HV('none',[],true,'Pink in flower at the end of the dry season. The sap is an arrow poison (a reagent).'),toxic:true,earth:'Adenium obesum, tall in wetter East Africa'})},
  {key:'rainbottle',name:'Rain bottle',from:'sedesert.bottle',kind:'tree',tags:T({koppen:['Aw','Am'],harvest:HV('bark fibre',['fruit pulp'],false,'The gate baobab\'s bulk with the Bowl\'s bottle-tree bark and flowers: the rim\'s middle lineage.'),earth:'Adansonia, between the Socotran cucumber tree and the gate baobab'})},
  {key:'incense',name:'Incense tree',kind:'tree',H:[6,15],tags:T({koppen:['Aw','BSh'],aridity:'semiarid',harvest:HV('none',['frankincense (a resin; burnt)'],true,'Crooked, its papery bark peeling, on the dry rocky slopes. Frankincense: Talia\'s caravan trade (proposed).'),earth:'Boswellia (Socotra\'s own)'})},
  {key:'cloudavocado',name:'Cloud avocado',kind:'tree',H:[40,60],tags:T({koppen:['Cfa'],aridity:'humid',harvest:HV('timber',['the fruit (an avocado)','a bay-like spice leaf'],false,'An evergreen laurel heavy with moss; its epiphytes grow thickest on the side facing the giant (the e highlands\' rule).'),earth:'Ocotea, Persea (the laurel forest)'})},
  {key:'leanfern',name:'Leaning tree fern',kind:'tree',H:[10,20],tags:T({koppen:['Cfa'],aridity:'humid',riparian:'yes',harvest:HV('the fibrous trunk (orchid posts, filters)',['croziers (cooked)'],false,'Its crown tipped toward the giant, in the Cfa ravines.'),earth:'Cyathea'})},
  {key:'rustmiombo',name:'Rust miombo',kind:'tree',H:[20,30],shared:'godstep',tags:T({koppen:['Aw','Cwa'],pheno:'flush',harvest:HV('timber',['honey','edible caterpillars (the mopane-worm kind, proposed)'],false,'At the start of the rains the whole woodland flushes copper-red for a few weeks, then turns green.'),earth:'Brachystegia spiciformis'})},
  {key:'guyedstalk',name:'Red guyed stalk',kind:'ref',ref:'godstep.guyedstalk',tags:T({harvest:HV('red fibre',[],false,'Godstep\'s (biomes/godstep/PLAN.md section 3): tall thin stems held up by guy-roots under red cup-crowns, on the wet floors of the laterite gullies. Not built: read in place when Godstep\'s kit carries it.'),earth:'the painting (refs/01)'})}];
 R.forEach(S=>{if(!SAVRIM.byKey[S.key]){SAVRIM.SPECIES.push(S);SAVRIM.byKey[S.key]=S;}});
 const L=SAVRIM.LANDS.southeast={land:'southeast',keys:R.map(S=>S.key),_k:null,_d:null};
 L.cousins=function(){if(L._k)return L._k;const K=L._k={},kin=(from,d)=>BIO.kin&&BIO.kitBuilder(from.split('.')[0],from.split('.')[1])?BIO.kin(from,d):null;
  K.raindragon=kin('sedesert.dragon',{key:'raindragon',name:'Rain dragon',scale:{H:1.85,rb:1.4,crownR:1.6},tags:SAVRIM.byKey.raindragon.tags,colour:{leaf:[0x3a7a3a,0x2e6a30,0x4a8a40]}});
  K.rainrose=kin('sedesert.rose',{key:'rainrose',name:'Rain rose',scale:{H:3,rb:2.2,crownR:2.6},tags:SAVRIM.byKey.rainrose.tags});
  K.rainbottle=kin('sedesert.bottle',{key:'rainbottle',name:'Rain bottle',scale:{H:4.2,rb:4,crownR:3.2},tags:SAVRIM.byKey.rainbottle.tags});
  return K;};
 // the own species' items (lazily, in this kit's registry): the rust miombo's crown on its own leaf material with the season and the
 // copper flush (H7), the incense tree's bark (the library's paperbark) and leaves, the cloud avocado's crown and its moss, the leaning
 // tree fern's trunk and fronds. Leaf cards painted here are stand-ins (card.leaf.miombo owed; PROMPTS-NEEDED.md section 37)
 L.def=SAVRIM.inKit(function(){if(L._d)return L._d;const D=L._d={},LIB=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('savannarim',n):null;
  const LQ=typeof location!=='undefined'?new URLSearchParams(location.search):null,noSeason=LQ&&LQ.get('season')==='0';
  // a CLUSTER of pinnate leaves fanning out from the card's centre (the clump is three tilted quads crossed about it): 7 leaves, each a rachis
  // with 7 pairs of leaflets shrinking to its tip, gaps between them so the crown reads as leaves, not as a panel. 2026-11-09 (crater-drylands'
  // south, the owner: "incense tree looks like texture glitch"): it was five parallel leaves filling the square, a flat grid on a 2.5-4 m card.
  // Fixed angles, no draw from the page's stream. Still a stand-in for a library card (PROMPTS-NEEDED: card.leaf.miombo)
  const pinnate=(cols,w)=>BIO.alphaTex(256,(g,S)=>{const c=S/2;
   for(let k=0;k<7;k++){const a=k/7*TAU+.35*Math.sin(k*2.3),L=S*(.34+.08*((k*5)%3)/2),ca=Math.cos(a),sa=Math.sin(a),nx=-sa,nz=ca;
    g.strokeStyle='#4a4a2a';g.lineWidth=S*.006;g.beginPath();g.moveTo(c+ca*S*.04,c+sa*S*.04);g.lineTo(c+ca*L,c+sa*L);g.stroke();
    for(let j=0;j<7;j++){const t=.22+.74*j/6,x=c+ca*L*t,y=c+sa*L*t,lw=S*w*(1.15-.55*t),ll=S*.026*(1.1-.4*t);g.fillStyle=cols[(j+k)%cols.length];
     for(const sd of [-1,1]){g.beginPath();g.ellipse(x+nx*sd*lw*1.1,y+nz*sd*lw*1.1,lw,ll,a+sd*1.1,0,TAU);g.fill();}}
    g.fillStyle=cols[k%cols.length];g.beginPath();g.ellipse(c+ca*L*1.02,c+sa*L*1.02,S*w*.5,S*.022,a,0,TAU);g.fill();}},[100,96,60]);
  D.miomboMat=BIO.leafMat(pinnate(['#7a8a44','#6a7a3a','#8a9a50'],.05),'rustmiombo',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4,
   season:noSeason?null:{drop:.6,colour:0x9a7040,k:.5,stagger:.5,flush:{colour:0xb0502a,k:.9,stagger:.4}}});
  BIO.def('miomboclump',BIO.geo.clump(),D.miomboMat,{attrs:['aN'],label:'Rust miombo leaves (copper-red in the flush)',kind:'rustmiombo'});
  BIO.bucket('miombobark',BIO.barkMat(null),{label:'Rust miombo bark (vertex colour)',uvScale:[3,4]});
  const IB=LIB('incensebark');D.incenseTex=!!IB;BIO.bucket('incensebark',BIO.barkMat(IB?KMAT.textures(IB,{aniso:8}).map:null),{label:'Incense tree bark (papery, peeling)',uvScale:IB&&IB.scale?IB.scale:[1.5,2]});
  BIO.def('incenseclump',BIO.geo.clump(),BIO.leafMat(pinnate(['#5a6a34','#6a7a3c','#4e5e2e'],.035),'incense',{aN:true,swayW:'1.0',swayA:.06,alphaTest:.4}),{attrs:['aN'],label:'Incense tree leaves',kind:'incense'});
  const HM=typeof HYPERJUNGLE!=='undefined'?HYPERJUNGLE.MAT:null;
  BIO.bucket('avobark',BIO.barkMat(HM&&HM.bark[4]?HM.bark[4].map:null),{label:'Cloud avocado bark',uvScale:[6,8]});
  BIO.def('avoclump',BIO.geo.clump(),HM?HM.leaf[4]:BIO.leafMat(null,'avoclump',{aN:true}),{attrs:['aN'],label:'Cloud avocado foliage (evergreen laurel)',kind:'cloudavocado'});
  BIO.def('avomoss',BIO.geo.clump(),HM?HM.moss:BIO.leafMat(null,'avomoss',{}),{label:'Moss and epiphytes on the giant\'s side',kind:'cloudavocado',onLeaf:true});
  BIO.bucket('fernbark',BIO.barkMat(null),{label:'Leaning tree fern trunks (vertex colour)',uvScale:[2,3]});
  BIO.def('leanfrond',BIO.geo.frond(3),HM?HM.frond:BIO.leafMat(null,'leanfrond',{}),{label:'Leaning tree fern fronds',kind:'leanfern'});
  return D;});
 const uOf=SAVRIM.uOf,G=()=>HYPERJUNGLE.LANDS.G;
 // THE RUST MIOMBO: a short bole, a broad flat-topped crown of ascending limbs (the miombo's habit); the shared tree (the hyperjungle's 54)
 L.rustmiombo={make(x,y,z,seed){const T={key:'rustmiombo',x,z,y0:y-.3,seed:seed>>>0};T.H=20+10*uOf(T,1);T.rb=T.H*.022*(.85+.3*uOf(T,2));T.crownR=T.H*(.4+.12*uOf(T,3));return T;},
  grow:SAVRIM.inKit(function(T,lv){L.def();T.lv=lv==null?2:lv;return G().tree(T,{fam:'miombobark',col0:0x4a3a2e,bole:.45,from:.35,limbs:6,el:[.45,.85],len:[.7,1],droop:.04,forks:2,flare:.3,
   lean:[.03*(uOf(T,4)-.5),.03*(uOf(T,5)-.5)],item:'miomboclump',per:5,size:[4.5,7],flat:.55,col:(r,i)=>[0x8a9a50,0x7a8a44,0x9aa858][i%3]});})};
 // THE INCENSE TREE: crooked, low-branched, a thin open crown
 L.incense={make(x,y,z,seed){const T={key:'incense',x,z,y0:y-.2,seed:seed>>>0};T.H=6+9*uOf(T,1);T.rb=.25+.25*uOf(T,2);T.crownR=T.H*(.35+.15*uOf(T,3));return T;},
  grow:SAVRIM.inKit(function(T,lv){L.def();T.lv=lv==null?2:lv;return G().tree(T,{fam:'incensebark',col0:0xc8b8a0,bole:.3,from:.18,limbs:5,el:[.35,.9],len:[.7,1],droop:.08,forks:2,flare:.2,
   lean:[.12*(uOf(T,4)-.5),.12*(uOf(T,5)-.5)],item:'incenseclump',per:3,size:[2.5,4],flat:.6,col:(r,i)=>[0x6a7a3c,0x5a6a34,0x7a8a44][i%3]});})};
 // THE CLOUD AVOCADO: a tall laurel; its moss and epiphytes on the limbs' giant side (H4: BIO.GIANT, the ground vector toward the giant)
 L.cloudavocado={make(x,y,z,seed){const T={key:'cloudavocado',x,z,y0:y-.4,seed:seed>>>0};T.H=40+20*uOf(T,1);T.rb=T.H*.024*(.85+.3*uOf(T,2));T.crownR=T.H*(.3+.1*uOf(T,3));return T;},
  grow:SAVRIM.inKit(function(T,lv){L.def();T.lv=lv==null?2:lv;const r=G().tree(T,{fam:'avobark',col0:0x8a8a7a,bole:.55,from:.4,limbs:7,el:[.5,.95],len:[.6,1],droop:.05,forks:2,flare:.35,
    item:'avoclump',per:4,size:[6,10],flat:.7,col:(q,i)=>[0x2a5a2e,0x245030,0x305e34][i%3]});
   let moss=0;if(T.lv>=1&&r&&r.segs){const g=BIO.GIANT||[.914,-.407],own=BIO.owner;BIO.owner=[T.x,T.z];
    try{r.segs.forEach((s,i)=>{const ax=(s.a[0]+s.b[0])/2-T.x,az=(s.a[2]+s.b[2])/2-T.z,l=Math.hypot(ax,az),side=l>.5?(ax*g[0]+az*g[1])/l:0,h=KRAND.hash(T.seed>>>0,i,0,0x5e1);
     if(s.r0<.2||KRAND.unit(h)>.25+.65*smooth(-.2,.6,side))return;const t=.2+.6*KRAND.unit(KRAND.hash(h,1)),p=[s.a[0]+(s.b[0]-s.a[0])*t+g[0]*s.r0*.7,s.a[1]+(s.b[1]-s.a[1])*t+s.r0*.5,s.a[2]+(s.b[2]-s.a[2])*t+g[1]*s.r0*.7],sz=s.r0*(1.6+1.4*KRAND.unit(KRAND.hash(h,2)));
     BIO.put('avomoss',p,qEuler(.3*(KRAND.unit(KRAND.hash(h,3))-.5),KRAND.unit(KRAND.hash(h,4))*TAU,0),[sz,sz*.6,sz],[0x5a7a2c,0x4f6a2c,0x6a8a3a][i%3]);moss++;});}finally{BIO.owner=own;}}
   if(r)r.moss=moss;return r;})};
 // THE LEANING TREE FERN: a fibrous trunk tipped toward the giant (BIO.leanTo, its tilt from the caller's u), a crown of fronds tipped with it
 L.leanfern={make(x,y,z,seed){const T={key:'leanfern',x,z,y0:y-.2,seed:seed>>>0};T.H=10+10*uOf(T,1);T.rb=.22+.12*uOf(T,2);T.k=T.k==null?.28:T.k;return T;},
  grow:SAVRIM.inKit(function(T,lv){L.def();const up=BIO.leanTo?BIO.leanTo(null,T.k,{jit:.25,u:uOf(T,3)}):[0,1,0],n=lv>=2?8:4,P=[];
   for(let i=0;i<=n;i++){const t=i/n,bow=t*t;P.push({x:T.x+up[0]*T.H*bow,y:T.y0+T.H*(t*(1-.5*bow)+bow*up[1]*.5),z:T.z+up[2]*T.H*bow,r:T.rb*(1.3-.4*t)});}
   const top=P[P.length-1],own=BIO.owner;BIO.owner=[T.x,T.z];
   try{BIO.tube('fernbark',P,0x4a3a2a,{seg:lv>=2?7:5});const nf=lv>=2?12:7,a0=uOf(T,4)*TAU,Lf=3+2*uOf(T,5),tip=Math.atan2(up[2],up[0]);
    for(let k=0;k<nf;k++){const a=a0+k/nf*TAU,toward=Math.cos(a+tip),pitch=-.25-.35*uOf(T,10+k)+.35*toward*T.k/.3;
     BIO.put('leanfrond',[top.x,top.y,top.z],qEuler(.1*(uOf(T,30+k)-.5),-a,pitch),[Lf,Lf,Lf*1.2],[0x2f6a30,0x3a7a38,0x2a5a2c][k%3]);}}
   finally{BIO.owner=own;}T.up=up;return{up};})};
 ['rustmiombo','incense','cloudavocado','leanfern'].forEach(k=>{SAVRIM.builders[k]={species:SAVRIM.byKey[k],make:L[k].make,grow:L[k].grow};});}
