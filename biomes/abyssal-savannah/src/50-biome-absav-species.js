// ================================================================= ABYSSAL SAVANNAH — species (data + kit items)
// The dry grassland of the eastern abyss (PLAN.md): the floor's savanna belt (XV, 2 atm) and the rim slope above it (Aw,
// BSh, 1.6-1.75 atm), a fire mosaic in dense air. Four species kept from the eastern abyss's sketch and grown (the
// shelf umbrella-tree, the Vain fronds, the rosettes, the dry grass), seven of its own on a Permian-upland theme beside the
// Carboniferous swamp (tongue tree, stub lycopsid, ember cycad, kopje fig, blue pan-grass, pan saltbush, ember lily).
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule: climate / aridity / abyssal /
// riparian, and the harvest (biomes/FRUIT.md).
BIO.kit('abyssal-savannah');   // this kit's own registry of items and buckets (core/biome: kits)
var ABSAV={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
ABSAV.TAGS={climate:'tropic',aridity:'arid..subhumid',abyssal:true,riparian:'both'};

// ---------------------------------------------------------------- palettes
// The Vain fronds are purple (canon: LORE.md, the Rift's and the abyss's Vain fronds). The rest is the savannah's own:
// straw and gold in the old grass, a green flush on the young burns, the corky pale of the umbrella trees.
const PAL=ABSAV.PAL={
 vain:[0x6a3aa0,0x7a48b8,0x5a2e8a,0x8858c0,0x4e2a7a],
 thatch:[0xc8b070,0xb89c5a,0xd4bc7c,0xa88c4c,0xbfa868],
 thatchGreen:[0x8a9a4a,0x7a8c40,0x9aaa58,0x6e8238],
 bunch:[0xc4b488,0xb0a070,0xd0c49a,0xa89a6c],
 pangrass:[0x8a9aa8,0x9aa8b0,0x7a8c98,0xa0aab4],
 saltbush:[0x8a9a88,0x9aaa96,0x7c8c7a,0xa4b0a0],
 umbrellaLeaf:[0x5a7a3a,0x6a8a44,0x4e6a34,0x7a9440],
 tongueLeaf:[0x2e5a30,0x386a36,0x24502a,0x426a32],
 tongueAutumn:[0xc06a28,0xd08a30,0xa85424,0xb87a2a],
 figLeaf:[0x2a4a2a,0x34582e,0x22422a,0x3c6034],
 cycadLeaf:[0x5a8a8a,0x6a9a92,0x4e7a7c,0x7aa49a],
 cycadBurnt:[0x8a6a40,0x7a5a36,0x9a7a4a],
 stubLeaf:[0x5a8a3a,0x6a9a44,0x4e7a34,0x7aa84a],
 rosette:[0x8aa07a,0x7a9a8a,0x9ab088,0x6a8a6a,0xa0b090],
 rosetteTip:[0xc04a30,0xd06a3a,0xa83a2a],
 lily:[0xd82a2a,0xe0443a,0xc42424],
 forb:[0xe8d070,0xd8a0c8,0xf0f0e0,0xa8b8e8,0xe89a50,0xffffff],
 charred:[0x2a2622,0x34302a,0x221e1a],
 cone:[0xc8501e,0xd8702a,0xa8401a],
 rock:[0xb4a89c,0xa89c90,0xc0b4a8,0x9c9084],
 cap:[0x9a6a54,0x8a5e4a,0xa8786a,0x7e5444]};

// ---------------------------------------------------------------- the species
// H height band, rb bole radius, crownR, the bark family, the habit the builder reads.
ABSAV.SPECIES=[
 /*0*/{key:'umbrella',name:'Shelf umbrella-tree',H:[9,24],rb:[.35,.8],crownR:[6,14],bark:[0xc8bca6,0xb8ac96,0xd4c8b2],fam:'barkU',
  leaf:PAL.umbrellaLeaf,tiers:[1,3],kept:'eastabyss (the sketch)',
  note:'the flat-topped thorn of the parkland: one to three flat crown plates, more with age, on a pale corky bark a grass fire scorches black at the foot and never kills',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*1*/{key:'tongue',name:'Tongue tree',H:[10,26],rb:[.4,.9],crownR:[5,11],bark:[0x6a6052,0x5e5448,0x766c5c],fam:'barkT',
  leaf:PAL.tongueLeaf,boughs:[4,6],model:'Glossopteris',
  note:'a rounded tree of the gullies and the damp hollows, its tongue-shaped leaves in whorled rosettes; deciduous: a share bare or orange in the dry season',
  tags:{climate:'tropic',aridity:'subhumid',abyssal:true,riparian:'both'}},
 /*2*/{key:'stub',name:'Stub lycopsid',H:[1.4,3.6],rb:[.08,.16],crownR:[.5,.9],bark:[0x6a7050,0x5c6446,0x767c5a],fam:null,
  leaf:PAL.stubLeaf,model:'Pleuromeia',
  note:'an unbranched scaly pole with a tuft of grass-like leaves and one cone, in colonies of dozens on the bench',
  tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'no'}},
 /*3*/{key:'embercycad',name:'Ember cycad',H:[1,4],rb:[.25,.5],crownR:[1.4,2.6],bark:[0x5a4a3a,0x4e4032,0x665646],fam:null,
  leaf:PAL.cycadLeaf,fronds:[10,18],model:'Encephalartos',
  note:'a squat armoured trunk, stiff blue-green fronds and a red-orange cone; the armour of old leaf bases is fire-proof',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*4*/{key:'kopjefig',name:'Kopje fig',H:[6,14],rb:[.4,.8],crownR:[5,9],bark:[0xb8b0a0,0xaaa290,0xc4bcac],fam:'barkT',
  leaf:PAL.figLeaf,model:'Ficus abutilifolia (a rock fig)',
  note:'a broad dark crown on a pale trunk whose roots pour over the granite of a kopje; only on the tors',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}}];
// the ground plants: their records too (the floor places them; each names its item)
ABSAV.PLANTS=[
 {key:'thatch',name:'Thatch grass',H:[1.8,3.2],item:'thatch',kept:'eastabyss (the dry grass)',note:'golden tufts to 3.2 m on the parkland (the dense air: Earth\'s tallest grasses), stubble on a fresh burn, green on a young one',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 {key:'bunch',name:'Bench bunchgrass',H:[.5,1.1],item:'bunch',note:'the bench\'s short tussocks (BSh)',tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'no'}},
 {key:'vain',name:'Vain fronds',H:[.8,2.2],item:'vain',kept:'eastabyss',note:'purple fans (canon), a fire-follower: thickest on burns one to three years old',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 {key:'rosette',name:'Ember rosette',H:[.2,.6],item:'rosette',kept:'eastabyss (the rosettes)',note:'fleshy rosettes on the risers, the rim and the kopjes\' joints, the tips flushed red',
  tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'no'}},
 {key:'pangrass',name:'Blue pan-grass',H:[.4,.8],item:'pangrass',model:'Sporobolus',note:'low blue-grey tussocks round the pan',tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'no'}},
 {key:'saltbush',name:'Pan saltbush',H:[.6,1.4],item:'saltbush',model:'Atriplex',note:'grey-green mounds on the pan\'s rim',tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'no'}},
 {key:'emberlily',name:'Ember lily',H:[.4,.8],item:'lily',model:'Cyrtanthus (the fire lily)',note:'scarlet trumpets up out of the ash within weeks of a fire',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 {key:'forbs',name:'Bench forbs',H:[.2,.6],item:'forb0',note:'patches of flowers on the bench\'s young burns',tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}}];

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
ABSAV.HARVEST={
 umbrella:HV('light timber, fuel, thorn fencing',['gum'],true,'A bark tea for the gut (as in the eastern abyss); the gum that weeps from the bark is a glue and a paint binder (kits/crops umbrella-gum).'),
 tongue:HV('timber',['seed-tongues (roasted, famine)'],false,'The flat seed-bearing tongues are roasted in hard years.'),
 stub:HV('fencing poles',['cone starch (pounded)'],false,'The single cone is pounded for its starch (kits/crops stub-cone).'),
 embercycad:HV('none',['cone kernels (steeped)'],false,'Poisonous raw, like the salt cycad: the kernels are steeped and baked.'),
 kopjefig:HV('none',['figs'],false,'Small figs in the dry season; the birds and the herders both take them. No catalog piece yet.'),
 thatch:HV('thatch, mats',[],false,'The grass the abyssal people thatch with (kits/crops thatch-grass).'),
 bunch:HV('none',[],false,'Grazing.'),vain:HV('none',[],false,''),rosette:HV('none',[],true,'The sap soothes burns.'),
 pangrass:HV('none',[],false,'Grazing.'),saltbush:HV('none',['leaves (a salty green)'],false,'Grazing; the leaves eaten as a green.'),
 emberlily:HV('none',[],false,''),forbs:HV('none',[],false,'')};
ABSAV.SPECIES.concat(ABSAV.PLANTS).forEach(S=>{S.tags.harvest=ABSAV.HARVEST[S.key]||HV('none');});
ABSAV.FRUIT_KEYS=[...new Set(ABSAV.SPECIES.concat(ABSAV.PLANTS).map(S=>S.tags.harvest.fruit).filter(Boolean))];
ABSAV.byKey={};ABSAV.SPECIES.concat(ABSAV.PLANTS).forEach(S=>{ABSAV.byKey[S.key]=S;});

// ---------------------------------------------------------------- procedural fallbacks (no pack: the open world)
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them. With the library pack every one of
// these slots takes its card (materials.json; BIO.libSwap below). Drawn from the core's stream on a fixed seed.
reseed(500021);
const TX={};
const tuftTex=(n,wMin,wMax,spread)=>BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<n;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-spread,spread),L=S*rr(.5,.97),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(wMin,wMax);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.grass=tuftTex(46,1.4,2.6,.5);TX.bunch=tuftTex(38,1.2,2.2,.7);TX.tuft=tuftTex(26,2.6,4.2,.35);
TX.leaves=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.6);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.10,.72),lum=lerp(110,238,i/60)+rr(-15,12),n=ri(3,6),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(30,52),rr(10,16),a0+(k-(n-1)/2)*.8,lum*rr(.9,1.05),true);}},[160,160,160]);
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const bx=S/2,by=S*.96,n=30;
 for(let k=0;k<n;k++){const a=-Math.PI*.5+(k/(n-1)-.5)*Math.PI*.92,L=S*.86*(.82+.18*Math.sin(k/(n-1)*Math.PI));
  g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=rr(4,6.5);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3.6;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=12;x<S-4;x+=5.5){const t=x/S,L=lerp(26,9,t);for(let sd=-1;sd<=1;sd+=2){g.strokeStyle=BIO.tex.grey(lerp(125,230,rng()));g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.55,y+sd*L);g.stroke();}}}},[150,150,150]);
TX.flower=BIO.alphaTex(128,(g,S)=>{g.lineCap='round';g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(S/2,S);g.lineTo(S/2,S*.35);g.stroke();
 for(let p=0;p<6;p++){const a=p/6*TAU;g.fillStyle=BIO.tex.grey(lerp(180,240,rng()));g.beginPath();g.ellipse(S/2+Math.cos(a)*S*.12,S*.3+Math.sin(a)*S*.1,S*.13,S*.07,a,0,TAU);g.fill();}},[200,200,200]);
TX.twigs=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const br=(x,y,a,L,w,d)=>{const nx=x+Math.cos(a)*L,ny=y+Math.sin(a)*L;g.strokeStyle=BIO.tex.grey(lerp(60,120,rng()));g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();
 if(d<4){br(nx,ny,a+rr(.2,.6),L*.7,w*.7,d+1);br(nx,ny,a-rr(.2,.6),L*.7,w*.7,d+1);}};for(let k=0;k<4;k++)br(S/2+rr(-30,30),S,-Math.PI/2+rr(-.4,.4),S*.25,4,0);},[90,90,90]);
// bark: near-grey, tinted from the species' bark colours by the builders. 0 corky (umbrella), 1 smooth (tongue, fig),
// 2 scaly lycopsid (stub), 3 armoured (cycad)
ABSAV.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){for(let i=0;i<260;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'70,70,70':'175,175,175')+','+(.25+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(8,30),rr(4,14));}
  for(let i=0;i<70;i++){const x=rng()*w;g.strokeStyle='rgba(60,60,60,.45)';g.lineWidth=rr(1,2.5);g.beginPath();g.moveTo(x,rng()*h);g.lineTo(x+rr(-6,6),rng()*h);g.stroke();}}
 else if(kind===1){for(let k=0;k<24;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.3)';g.fillRect(0,y,w,rr(4,22));}
  for(let i=0;i<90;i++){g.fillStyle='rgba(70,70,70,.4)';g.fillRect(rng()*w,rng()*h,rr(5,20),rr(1.5,3));}}
 else if(kind===2){const dx=18,dy=26;for(let j=-1;j<h/dy+1;j++)for(let i=-1;i<w/dx+1;i++){const x=i*dx+(j%2?dx/2:0),y=j*dy;
   g.fillStyle='rgba(175,175,175,.55)';g.beginPath();g.moveTo(x,y-dy*.4);g.lineTo(x+dx*.4,y);g.lineTo(x,y+dy*.4);g.lineTo(x-dx*.4,y);g.closePath();g.fill();
   g.fillStyle='rgba(60,60,60,.6)';g.beginPath();g.ellipse(x,y+2,dx*.12,dy*.08,0,0,TAU);g.fill();}}
 else{for(let j=0;j<h/20+1;j++)for(let i=0;i<w/24+1;i++){const x=i*24+(j%2?12:0),y=j*20;g.fillStyle='rgba('+(rng()<.5?'70,70,70':'150,150,150')+',.6)';
   g.beginPath();g.moveTo(x-11,y+8);g.lineTo(x,y-9);g.lineTo(x+11,y+8);g.closePath();g.fill();}}});};
ABSAV.BARKTEX=[0,1,2,3].map(k=>ABSAV.barkTex(k));
ABSAV.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=140+(KRAND.fbm(x/22,y/22,3.3,3,91)-.5)*70+(KRAND.h3(x,y,9,92)-.5)*30;d[i]=v;d[i+1]=v*.96;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this kit
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1 (the grasses, the lilies, the charred stems)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.35,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FAN: one vertical quad, base at the origin, up to y=1 (the Vain fronds)
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a ROSETTE: three tiers of fleshy bent leaves, vertex-coloured pale at the base, unit radius (the eastern abyss's)
G.rosette=function(){const pos=[],nor=[],uv=[],col=[];
 [[10,1.0,.30,.55],[8,.70,.55,.40],[6,.42,.85,.28]].forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3],a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R,Math.sin(el)*R*.9+.05,sa*R],mid=[ca*R*.5,Math.sin(el)*R*.35+.04,sa*R*.5],base=[ca*.08,.02,sa*.08],W=wd*R;
   const q=[[base[0]-px*W*.25,base[1],base[2]-pz*W*.25],[base[0]+px*W*.25,base[1],base[2]+pz*W*.25],[mid[0]+px*W*.5,mid[1],mid[2]+pz*W*.5],[mid[0]-px*W*.5,mid[1],mid[2]-pz*W*.5],tip];
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.55);push(q[1],.55);push(q[2],.85);push(q[0],.55);push(q[2],.85);push(q[3],.85);push(q[3],.85);push(q[2],.85);push(q[4],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a PLATE: the umbrella tree's flat crown plate, a low lumpy disc of five clumps' worth as one card ring (cheap at range)
G.plate=function(){const pos=[],uv=[],nor=[];const n=7;
 for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU;
  [[0,.12,0,.5,.5],[Math.cos(a1),0,Math.sin(a1),.5+Math.cos(a1)*.5,.5+Math.sin(a1)*.5],[Math.cos(a0),0,Math.sin(a0),.5+Math.cos(a0)*.5,.5+Math.sin(a0)*.5]].forEach(p=>{pos.push(p[0],p[1],p[2]);uv.push(p[3],p[4]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
// a SLAB: the caprock's blocks, a box with its base at the origin
G.slab=function(){const g=new T3.BoxGeometry(1,1,1);g.translate(0,.5,0);return g;};
ABSAV.G=G;

// ---------------------------------------------------------------- materials
ABSAV.MAT={
 bark:ABSAV.BARKTEX.map(t=>BIO.barkMat(t)),
 rock:BIO.solidMat(ABSAV.ROCKTEX),
 cap:BIO.solidMat(ABSAV.ROCKTEX),
 thatch:BIO.leafMat(TX.grass,'thatch',{swayW:'(position.y*position.y)',swayA:.16,alphaTest:.4}),
 bunch:BIO.leafMat(TX.bunch,'bunch',{swayW:'(position.y)',swayA:.10,alphaTest:.4}),
 pangrass:BIO.leafMat(TX.bunch,'pangrass',{swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 stubtuft:BIO.leafMat(TX.bunch,'stubtuft',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 charred:BIO.leafMat(TX.twigs,'charred',{swayW:'0.0',swayA:0,alphaTest:.4}),
 lily:BIO.leafMat(TX.flower,'lily',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 forb0:BIO.leafMat(TX.flower,'forb0',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 forb1:BIO.leafMat(TX.flower,'forb1',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 forb2:BIO.leafMat(TX.flower,'forb2',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 vain:BIO.leafMat(TX.fan,'vain',{swayW:'(position.y)',swayA:.08,alphaTest:.45}),
 cycfrond:BIO.leafMat(TX.frond,'cycfrond',{swayW:'(position.x)',swayA:.03}),
 leaflet:BIO.leafMat(TX.leaves,'leaflet',{aN:true,swayW:'1.0',swayA:.08}),
 plate:BIO.leafMat(TX.leaves,'plate',{swayW:'1.0',swayA:.04}),
 tongue:BIO.leafMat(TX.leaves,'tongue',{aN:true,swayW:'1.0',swayA:.10}),
 fig:BIO.leafMat(TX.leaves,'fig',{aN:true,swayW:'1.0',swayA:.06}),
 saltbush:BIO.leafMat(TX.leaves,'saltbush',{aN:true,swayW:'1.0',swayA:.04}),
 rosette:BIO.leafMat(null,'rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff)};
// the material library (core/materials/PLAN.md): with the 'abyssal-savannah' pack on the page, the slots it names take library maps
ABSAV.LIB=BIO.libSwap('abyssal-savannah',ABSAV.MAT);
const M=ABSAV.MAT;
BIO.bucket('barkU',M.bark[0],{label:'Umbrella-tree bark (corky)',uvScale:[3,5]});
BIO.bucket('barkT',M.bark[1],{label:'Tongue-tree and fig bark',uvScale:[3,5]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});
// ---------------------------------------------------------------- instanced items
BIO.def('thatch',G.tuft(),M.thatch,{label:'Thatch grass'});
BIO.def('bunch',G.tuft(),M.bunch,{label:'Bench bunchgrass'});
BIO.def('pangrass',G.tuft(),M.pangrass,{label:'Blue pan-grass'});
BIO.def('stubtuft',G.tuft(),M.stubtuft,{label:'Stub lycopsid leaves'});
BIO.def('charred',G.tuft(),M.charred,{label:'Charred stems (a fresh burn)'});
BIO.def('lily',G.tuft(),M.lily,{label:'Ember lilies'});
BIO.def('forb0',G.tuft(),M.forb0,{label:'Bench forbs'});
BIO.def('forb1',G.tuft(),M.forb1,{label:'Bench forbs'});
BIO.def('forb2',G.tuft(),M.forb2,{label:'Bench forbs'});
BIO.def('vain',G.fan(),M.vain,{label:'Vain fronds'});
BIO.def('cycfrond',BIO.geo.frond(2),M.cycfrond,{label:'Ember-cycad fronds'});
BIO.def('leaflet',BIO.geo.clump(),M.leaflet,{attrs:['aN'],label:'Umbrella-tree foliage'});
BIO.def('plate',G.plate(),M.plate,{label:'Umbrella-tree crown plates'});
BIO.def('tongue',BIO.geo.clump(),M.tongue,{attrs:['aN'],label:'Tongue-tree foliage'});
BIO.def('fig',BIO.geo.clump(),M.fig,{attrs:['aN'],label:'Kopje-fig foliage'});
BIO.def('saltbush',BIO.geo.clump(),M.saltbush,{attrs:['aN'],label:'Pan saltbush'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Ember rosettes'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones'});
BIO.def('rod',BIO.geo.rod(6),M.solid,{label:'Boughs and roots'});
BIO.def('stubpole',BIO.geo.trunk(6),BIO.solidMat(ABSAV.BARKTEX[2]),{label:'Stub-lycopsid poles'});
BIO.def('cycadtrunk',BIO.geo.trunk(8),BIO.solidMat(ABSAV.BARKTEX[3]),{label:'Ember-cycad trunks'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Kopje boulders',kind:'mineral'});
BIO.def('slab',G.slab(),M.cap,{label:'Caprock blocks',kind:'mineral'});
// the twigs that carry the crown clumps (55, twigTo; the final rebuild 2026-11-03): three sides, open ends, 6 triangles (a bough's rod is 24); defined last,
// so every item before it keeps its index
BIO.def('twig',new T3.CylinderGeometry(.5,.5,1,3,1,true),M.solid,{label:'Twigs (to the crown clumps)'});
// the library maps for the solid-textured items (stubpole, cycadtrunk take their bark slots by name)
(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib'||!KMAT.packed)return;
 const tbl={stubbark:BIO.defs.stubpole.mat,cycadbark:BIO.defs.cycadtrunk.mat};Object.assign(ABSAV.LIB,BIO.libSwap('abyssal-savannah',tbl));})();
})();
