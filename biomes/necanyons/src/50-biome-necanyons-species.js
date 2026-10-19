// ================================================================= NECANYONS — species (data + kit items)
// The north-eastern canyons: the hyperjungle's transition to Korona (biomes/necanyons/PLAN.md section 3). Quartz sandstone
// weathers to a sand with almost nothing in it and the rain leaches the rest away, so what grows on the rock eats what it
// catches: large carnivorous plants begin here (none can hold a person), on the seep lines under each cap rock, the bogs of
// the benches and the bare caps. The caps are dry under jungle rain: the jointed rock drains at once.
//   TREES AND WOODY PLANTS: the gorge fan palm (Livistona of the gorges), the stack fig (a rock fig whose roots lace the
//     walls), the flametip (Bonnetia: scarlet new leaves), the ember plum (the Kakadu plum), the stilt lily (Vellozia) and
//     the rock bottle (Adenium, Pachypodium)
//   GROUND PLANTS: sandpan fonio (the staple), ringgrass (spinifex), seep curtains (maidenhair and moss)
//   CARNIVORES (57 places them; each carries a trap record, core/biome/37-core-traps.js): rimdew (the sundews: the medicinal
//     plant), the sun pitcher (Heliamphora), the monkeycup vine (Nepenthes), the clapjaw (Dionaea, Krator-sized), the yellow
//     tube (Brocchinia), the turncoat liana (Triphyophyllum) and potholewort (Utricularia)
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal /
// riparian / koppen) plus `zone` (floor, foot, ledge, bench, cap, stack: 46) and, on a carnivore, `trap`.
BIO.kit('necanyons');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);NECANYONS.C=C;
NECANYONS.TAGS={climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'no',koppen:['XA','Af','Aw']};

// ---------------------------------------------------------------- palettes (sRGB; a library card carries its own colour)
const PAL=NECANYONS.PAL={
 palm:[0x4a7a3a,0x568a40,0x3e6e34,0x62904a],palmBark:[0x8a7a66,0x7a6c5a,0x968a76],
 fig:[0x2e5a2a,0x386a30,0x264e24,0x427434],figRoot:[0xc8c2b4,0xb8b2a4,0xd6d0c2],figFruit:[0x7a2a4a,0x8a3450,0x6a2240,0x9a4a3a],
 flame:[0x3e5230,0x46603a,0x36482a],flameFlush:[0xc8321e,0xe0602a,0xd04a24,0xb82a1a],flameBark:[0x7a5a48,0x6a4c3c,0x86685a],
 plum:[0x8aa060,0x9ab06a,0x7a9054],plumBark:[0xd8d0c0,0xccc4b2,0xe0d8ca],plumFruit:[0xc8c040,0xb8b030,0xd8c858],
 lily:[0x7a8a6a,0x8a9a78,0x6a7a5c],lilyBark:[0x2a2420,0x342c26,0x221e1a],lilyFlower:[0xb8a8d8,0xa898d0,0xc8b8e0],
 bottle:[0x9a948a,0x8a847a,0xa8a296],bottleFlower:[0xe87a98,0xf08aa8,0xd86a88],bottleLeaf:[0x5a7a3a,0x668a44],
 fonio:[0xb8a860,0xc8b870,0xa89850,0x9a9a54],ring:[0x8a9a8a,0x9aa898,0x7a8a7c,0xa8a888],
 fern:[0x4a7a2e,0x568a36,0x3e6e28,0x62903e],moss:[0x6a8a2a,0x7a9a30,0x8aa038,0x5a7a24],
 dew:[0xc8282a,0xd84a2a,0xb82a24],sunpit:[0x7a9a3a,0x8aa040,0xa04a2a,0x6a8a34],cup:[0x8ab83a,0x7a1e2a,0xc8d070,0x5a1420],
 lobe:[0xa8202a,0xc83a30,0xb8c050],petiole:[0x6a9a3a,0x78a840,0x5e8a34],tube:[0xd8d070,0xc8c860,0xe0d880],
 vine:[0x3e6a2e,0x4a7a34,0x36602a],sticky:[0xb04a2a,0xc05a30,0x9a3a24],wort:[0xf0d030,0xf8e040,0xe8c020]};

// ---------------------------------------------------------------- the trap records (core/biome/37-core-traps.js)
const TR=KTRAPS.make;
NECANYONS.TRAPS={
 rimdew:TR({kind:'flypaper',mouth:.04,preyMax:'insect',lure:'dew'}),
 sunpitcher:TR({kind:'pitfall',mouth:.16,preyMax:'small',lure:'nectar'}),
 monkeycup:TR({kind:'pitfall',mouth:.2,preyMax:'small',lure:'glow'}),
 clapjaw:TR({kind:'snap',mouth:.35,preyMax:'small',lure:'nectar'}),
 yellowtube:TR({kind:'tank',mouth:.12,preyMax:'insect',lure:'uv'}),
 turncoat:TR({kind:'flypaper',mouth:.03,preyMax:'insect',lure:'dew'}),
 potholewort:TR({kind:'suction',mouth:.003,preyMax:'insect',lure:null})};

// ---------------------------------------------------------------- the tree-scale species
// H height band, rb bole radius, crownR (metres); far the impostor recipe (blobs [y of H, rx of crownR, ry of H, colour A, B])
const K=(climate,aridity,riparian,koppen,zone)=>Object.assign({},NECANYONS.TAGS,{climate,aridity,riparian,koppen,zone});
NECANYONS.SPECIES=[
 {key:'fanpalm',name:'Gorge fan palm',H:[25,40],rb:[.35,.5],crownR:[4.5,6.5],leaf:PAL.palm,barkC:PAL.palmBark,
  far:{blobs:[[.95,.7,.12,0x4a7a3a,0x3e6e34]]},tags:K('hypertropic','humid','both',['XA','Af'],'foot')},
 {key:'stackfig',name:'Stack fig',H:[12,24],rb:[.5,.9],crownR:[7,12],leaf:PAL.fig,barkC:PAL.figRoot,
  far:{blobs:[[.75,.85,.4,0x2e5a2a,0x386a30]]},tags:K('tropic','subhumid','no',['XA','Af','Aw'],'ledge')},
 {key:'flametip',name:'Flametip',H:[8,20],rb:[.2,.42],crownR:[3.2,6],leaf:PAL.flame,barkC:PAL.flameBark,
  far:{blobs:[[.7,.85,.45,0x46603a,0xc8321e]]},tags:K('tropic','subhumid','no',['Af','Aw'],'bench')},
 {key:'emberplum',name:'Ember plum',H:[5,11],rb:[.14,.28],crownR:[2.4,4.2],leaf:PAL.plum,barkC:PAL.plumBark,
  far:{blobs:[[.68,.8,.42,0x8aa060,0x9ab06a]]},tags:K('tropic','semiarid','no',['Aw','BSh'],'bench')},
 {key:'treelily',name:'Stilt lily',H:[2,6],rb:[.12,.22],crownR:[.9,1.8],leaf:PAL.lily,barkC:PAL.lilyBark,
  far:{blobs:[[.85,.7,.2,0x7a8a6a,0x2a2420]]},tags:K('tropic','arid','no',['BSh','Aw'],'cap')},
 {key:'rockbottle',name:'Rock bottle',H:[1.5,4],rb:[.35,.8],crownR:[.8,1.6],leaf:PAL.bottleLeaf,barkC:PAL.bottle,
  far:{blobs:[[.5,.6,.5,0x9a948a,0xe87a98]]},tags:K('tropic','arid','no',['BSh','BWh'],'cap')},
];
NECANYONS.SPECIES.forEach((S,i)=>S.i=i);
NECANYONS.byKeyS={};NECANYONS.SPECIES.forEach(S=>NECANYONS.byKeyS[S.key]=S);

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md; kits/crops)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
NECANYONS.HV=HV;
NECANYONS.HARVEST={
 fanpalm:HV('trunks (posts), fronds (thatch, weaving)',['palm heart (a vegetable)'],false,'The heart is cut from one stem of a clump, which the clump replaces; the fronds thatch and weave. Lines the wet feet of the walls.'),
 stackfig:HV('none (the roots are the rock\'s)',['stack figs (fresh, dried in strings)'],false,'A rock fig: its crown on a ledge, its pale roots laced down the wall to the ground; the figs come in clusters on the roots and the old wood, the canyons\' fruit and the flyers\' food.','generic_fruit_stack_fig'),
 flametip:HV('firewood (dense, burns long), tanbark',[],false,'Every new flush scarlet, so a bench in leaf looks lit; the bark tans hides.'),
 emberplum:HV('none',['ember plums (fresh, dried and pounded)'],true,'Small, green-gold and very sour, with more vitamin C than any other fruit: dried and pounded to a powder the Wings carry against scurvy.','generic_fruit_ember_plum'),
 treelily:HV('fuel (the resinous trunk fibre: torches that burn wet)',[],false,'Forked black trunks shaggy with old leaf bases, a fountain of grey-green leaves at each tip, lilac flowers after rain.'),
 rockbottle:HV('none',[],false,'A swollen grey bottle wedged in the joints, pink trumpets in the dry. The milky sap is a heart poison: on arrows, and to stun fish. Hazard: poison.'),
};
NECANYONS.SPECIES.forEach(S=>{S.tags.harvest=NECANYONS.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants and the carnivores, tagged
// Placed by 57 (the carnivores) and 60 (the floor). `items` names the instanced items that draw each, for the inspector.
const PK=(name,c,a,r,kp,zone,items,hv,trap)=>({name,tags:Object.assign(K(c,a,r,kp,zone),{harvest:hv||HV('none')},trap?{trap:NECANYONS.TRAPS[trap]}:{}),items});
NECANYONS.PLANTS={
 fonio:PK('Sandpan fonio','tropic','semiarid','no',['Aw','BSh'],'cap',['fonio'],HV('none',['grain (cooked like couscous, steamed)'],false,'A fonio of poor sand: fine tufts with thread-thin seed racemes, ripe eight weeks after the rains fill the pans. Wild on the pans; sown on the sand terraces round Pinnacle Rock\'s foot.')),
 ringgrass:PK('Ringgrass','tropic','arid','no',['BSh','BWh'],'cap',['ringgrass'],HV('fuel (dry hummocks)',[],false,'Spinifex: blue-grey spiky hummocks that die out in the middle and grow outward as rings. The resin, melted from threshed leaves, is a glue: hafting points, sealing.')),
 seepfern:PK('Seep curtains','tropic','humid','yes',['XA','Af'],'ledge',['seepfern'],HV('none',[],false,'Maidenhair ferns and moss in curtains under each cap rock, where the water comes out of the parting: the hanging gardens.')),
 rimdew:PK('Rimdew','tropic','humid','yes',['XA','Af'],'ledge',['sundewR','sundewF','sundewB'],HV('none',[],true,'The sundews: red rosettes and forked strap-leaved plants beaded with sticky dew. Steeped in honey or spirit the leaves make a cough and chest syrup that eases cramps; the fresh dew is dabbed on warts.'),'rimdew'),
 sunpitcher:PK('Sun pitcher','tropic','humid','yes',['XA','Af'],'ledge',['sunpit','sunpitB'],HV('none',['nectar (from the spoon)'],false,'Clumps of green and red trumpets, 0.8 to 1.8 m, each with a red nectar spoon at the rim; insects and frogs drown in them.'),'sunpitcher'),
 monkeycup:PK('Monkeycup vine','hypertropic','humid','both',['XA','Af'],'foot',['cupLow','cupUp','cupWine'],HV('none',[],false,'A liana with squat ground pitchers to 45 cm and slim upper funnels whose rims glow faintly blue at night. Its unopened pitchers are cut for cookpots: fonio or rice packed in and steamed in the pitcher.'),'monkeycup'),
 clapjaw:PK('Clapjaw','tropic','humid','yes',['XA','Af'],'foot',['lobe','petiole'],HV('none',[],false,'A Venus flytrap of Krator\'s air: rosettes of traps up to 35 cm across that shut in a third of a second on frogs, large insects and small lizards. It pinches a careless hand and lets it go.'),'clapjaw'),
 yellowtube:PK('Yellow tube','tropic','semiarid','no',['Aw','BSh'],'cap',['tube'],HV('none',[],false,'The tepui bromeliad that turned carnivore: upright yellow-green tubes of waxy leaves, 1 to 2.5 m, bright in the ultraviolet and sweet-smelling; folds shut in the dry.'),'yellowtube'),
 turncoat:PK('Turncoat liana','hypertropic','humid','both',['XA','Af'],'foot',['sticky','vine'],HV('none',[],false,'Carnivorous only as a young plant, with sticky glandular leaves for a season; then a plain liana climbing the walls and the trees. The jungle\'s own plants turn carnivore here.'),'turncoat'),
 potholewort:PK('Potholewort','tropic','semiarid','yes',['Aw','BSh'],'cap',['wort'],HV('none',[],false,'The bladderworts of the rain pools: yellow flowers on stalks above the water, suction bladders under it that take larvae and tadpoles.'),'potholewort'),
};
NECANYONS.plantOfItem=item=>{for(const k in NECANYONS.PLANTS)if(NECANYONS.PLANTS[k].items.indexOf(item)>=0)return NECANYONS.PLANTS[k];return null;};
NECANYONS.CARNIVORES=Object.keys(NECANYONS.PLANTS).filter(k=>NECANYONS.PLANTS[k].tags.trap);
NECANYONS.FRUIT_KEYS=[...new Set(NECANYONS.SPECIES.map(S=>S.tags.harvest.fruit).filter(Boolean))];
NECANYONS.FRUIT_ITEMS={generic_fruit_stack_fig:'fig',generic_fruit_ember_plum:'plum'};

// ---------------------------------------------------------------- leaf textures (procedural, greyscale: the fallback when the
// page carries no library pack). A sheet the library shows by cells (the owner's 3 x 3 cards) is painted 3 x 3 here too, so
// an item's cell-mapped uv reads a plant either way.
reseed(500083);
const TX={},G2=BIO.tex.grey,S9=fn=>(g,S)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++){g.save();g.translate(i*S/3,j*S/3);g.scale(1/3,1/3);fn(g,S,i+3*j);g.restore();}};
/* a sundew: a rosette of round leaves on stalks, fringed (from above) */
TX.sundew=BIO.alphaTex(256,S9((g,S)=>{const c=S/2;for(let k=0;k<9;k++){const a=k/9*TAU,L=S*.36;g.strokeStyle=G2(150);g.lineWidth=S*.03;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*L*.7,c+Math.sin(a)*L*.7);g.stroke();
  g.fillStyle=G2(rr(150,210));g.beginPath();g.arc(c+Math.cos(a)*L,c+Math.sin(a)*L,S*.08,0,TAU);g.fill();g.strokeStyle=G2(235);g.lineWidth=2;for(let h=0;h<14;h++){const b=h/14*TAU;g.beginPath();g.moveTo(c+Math.cos(a)*L+Math.cos(b)*S*.08,c+Math.sin(a)*L+Math.sin(b)*S*.08);g.lineTo(c+Math.cos(a)*L+Math.cos(b)*S*.12,c+Math.sin(a)*L+Math.sin(b)*S*.12);g.stroke();}}}),[160,60,50]);
/* a pitcher on its tendril, hanging from the top of its cell */
TX.cup=BIO.alphaTex(256,S9((g,S)=>{g.strokeStyle=G2(140);g.lineWidth=S*.02;g.beginPath();g.moveTo(S*.3,0);g.quadraticCurveTo(S*.2,S*.3,S*.38,S*.32);g.stroke();
  g.fillStyle=G2(rr(150,210));g.beginPath();g.moveTo(S*.36,S*.34);g.quadraticCurveTo(S*.2,S*.7,S*.5,S*.92);g.quadraticCurveTo(S*.8,S*.7,S*.66,S*.34);g.closePath();g.fill();
  g.fillStyle=G2(235);g.beginPath();g.ellipse(S*.51,S*.34,S*.16,S*.05,0,0,TAU);g.fill();g.fillStyle=G2(170);g.beginPath();g.ellipse(S*.56,S*.22,S*.13,S*.06,.4,0,TAU);g.fill();}),[120,90,60]);
/* a snap trap's lobe: a half moon, hinge at the bottom, teeth round the arc */
TX.lobe=BIO.alphaTex(256,S9((g,S)=>{const cx=S/2,cy=S*.95,R=S*.4;g.fillStyle=G2(180);g.beginPath();g.arc(cx,cy,R,Math.PI,TAU);g.closePath();g.fill();
  g.strokeStyle=G2(230);g.lineWidth=S*.02;for(let k=1;k<18;k++){const a=Math.PI+k/18*Math.PI;g.beginPath();g.moveTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.lineTo(cx+Math.cos(a)*R*1.22,cy+Math.sin(a)*R*1.22);g.stroke();}}),[150,60,50]);
/* trumpet pitchers in a clump, standing on the cell's foot */
TX.trumpet=BIO.alphaTex(256,S9((g,S)=>{for(let k=0;k<5;k++){const x=S*(.25+k*.12),h=S*rr(.5,.85);g.fillStyle=G2(rr(150,215));g.beginPath();g.moveTo(x-S*.03,S);g.lineTo(x-S*.06,S-h);g.lineTo(x+S*.06,S-h);g.lineTo(x+S*.03,S);g.closePath();g.fill();
  g.fillStyle=G2(110);g.beginPath();g.ellipse(x,S-h,S*.06,S*.02,0,0,TAU);g.fill();}}),[110,120,60]);
/* hanging moss strands with a few small pitchers */
TX.moss=BIO.alphaTex(256,S9((g,S)=>{g.lineCap='round';for(let i=0;i<90;i++){const x=S*rr(.15,.85),L=S*rr(.4,.95);g.strokeStyle=G2(rr(120,220));g.lineWidth=rr(1.5,3);g.beginPath();g.moveTo(x,0);let px=x;for(let y=0;y<=L;y+=S/12){px+=rr(-5,5);g.lineTo(px,y);}g.stroke();}}),[90,110,50]);
/* a fan-palm leaf: ribbons radiating from the hub at the foot */
TX.fan=BIO.alphaTex(256,S9((g,S)=>{const c=S/2,y0=S*.95;for(let k=0;k<44;k++){const a=-Math.PI*.95+k/43*Math.PI*.9,L=S*rr(.72,.9);g.strokeStyle=G2(rr(150,230));g.lineWidth=S*.022;g.beginPath();g.moveTo(c,y0);g.quadraticCurveTo(c+Math.cos(a)*L*.5,y0+Math.sin(a)*L*.55,c+Math.cos(a)*L*.62,y0+Math.sin(a)*L*.8+S*.06);g.stroke();}}),[70,100,50]);
/* a fern frond, base at the bottom, tip at the top */
TX.fern=BIO.alphaTex(256,S9((g,S)=>{const a=-Math.PI/2,L=S*.94,x0=S/2,y0=S;for(let t=0;t<1;t+=.045){const x=x0,y=y0+Math.sin(a)*L*t,pl=S*.13*Math.sin(Math.PI*Math.min(1,t*1.1+.08));for(const sd of[-1,1])BIO.tex.leaf(g,x,y,pl,pl*.24,a+sd*1.25,rr(140,220),false);}}),[60,90,40]);
/* broad leaves in sprays (fig, plum), and the flametip's thick spiral clusters */
TX.broad=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,6,.6);for(let i=0;i<150;i++){const p=BIO.tex.clPt(S,.1,.6);BIO.tex.leaf(g,p[0],p[1],rr(18,30),rr(7,12),p[2]+rr(-.6,.6),rr(110,230),true);}},[60,80,40]);
TX.thick=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.6);for(let i=0;i<180;i++){const p=BIO.tex.clPt(S,.07,.6);BIO.tex.leaf(g,p[0],p[1],rr(14,22),rr(6,9),p[2]+rr(-.6,.6),rr(120,235),true);}},[70,70,40]);
/* grass tufts: fine blades (fonio, ringgrass, the stilt lily's tufts) */
TX.grass=BIO.alphaTex(256,S9((g,S)=>{g.lineCap='round';for(let i=0;i<80;i++){const x=S/2+rr(-.22,.22)*S,a=-Math.PI/2+rr(-.6,.6),L=S*rr(.45,.98);g.strokeStyle=G2(rr(120,235));g.lineWidth=rr(1.6,3);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-10,10),S+Math.sin(a)*L);g.stroke();}}),[100,110,60]);
/* blooms: petals round a centre */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<6;k++){const a=k/6*TAU;BIO.tex.leaf(g,c,c,S*.44,S*.16,a,rr(200,250),false);}g.fillStyle=G2(150);g.beginPath();g.arc(c,c,S*.09,0,TAU);g.fill();},[200,200,200]);
/* a strap leaf along the frond strip (the yellow tube's) */
TX.strap=BIO.alphaTex(256,(g,S)=>{const x=S/2,w=S*.2;g.fillStyle=G2(200);g.beginPath();g.moveTo(x-w,0);g.lineTo(x-w*.8,S);g.lineTo(x+w*.8,S);g.lineTo(x+w,0);g.closePath();g.fill();g.strokeStyle=G2(150);g.lineWidth=3;g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke();},[150,150,80]);
/* vine leaves; the turncoat's young sticky leaves (glands on narrow blades, from above) */
TX.vine=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<60;i++){BIO.tex.leaf(g,S*rr(.2,.8),S*rr(.1,.9),rr(16,26),rr(8,12),rr(0,TAU),rr(110,220),true);}},[60,80,40]);
TX.sticky=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<7;k++){const a=k/7*TAU;g.save();g.translate(c,c);g.rotate(a);g.fillStyle=G2(190);g.fillRect(0,-S*.035,S*.46,S*.07);
  g.fillStyle=G2(250);for(let d=S*.08;d<S*.46;d+=S*.04){g.beginPath();g.arc(d,-S*.05,S*.014,0,TAU);g.arc(d,S*.05,S*.014,0,TAU);g.fill();}g.restore();}},[150,70,50]);
NECANYONS.TX=TX;

// ---------------------------------------------------------------- bark textures (grey, mean ~.6)
const barkTex=(fn,w,h)=>BIO.canvasTex(w||256,h||256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(fn(x,y,W,H),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
NECANYONS.BARKTEX={
 palm:barkTex((x,y,W,H)=>150-40*Math.pow(Math.abs(Math.sin(y/H*TAU*8+fbm(x*.05,y*.02,61,2))),6)+18*(fbm(x*.04,y*.12,62,2)-.5)+10*(h3(x,y,63)-.5)+20),
 fig:barkTex((x,y,W,H)=>170+30*(fbm(x*.03,y*.01,64,3)-.5)-30*Math.pow(fbm(x*.1,y*.02,65,2),4)+10*(h3(x,y,66)-.5)),
 wood:barkTex((x,y,W,H)=>150+40*(fbm(x*.15,y*.012,67,3)-.5)+12*(h3(x,y,68)-.5)),
 lily:barkTex((x,y,W,H)=>110+60*(fbm(x*.3,y*.02,69,2)-.5)+30*(h3(x,y,70)-.5)),
 caudex:barkTex((x,y,W,H)=>165+25*(fbm(x*.02,y*.05,71,3)-.5)-20*Math.pow(fbm(x*.08,y*.08,72,2),3)+8*(h3(x,y,73)-.5))};

// ---------------------------------------------------------------- geometries (kit-local), and cell mapping
const G={};
const cellUV=(geo,cell)=>{if(!cell)return geo;const u=geo.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,cell[0]+u.getX(i)*(cell[2]-cell[0]),cell[1]+u.getY(i)*(cell[3]-cell[1]));return geo;};
const CELL=(i,j)=>[i/3,j/3,(i+1)/3,(j+1)/3];
// card.strap.pandan's one leaf, flipped so a frond's v runs from its base (geyser's cell)
const STRAP=[.418,.329,.518,.009];
/* a tuft: three crossed upright quads, base at y=0, top at y=1 (v 1 at the foot: the card's plant stands on its cell's foot) */
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a pad: a flat disc in xz, face up, uv from above */
G.pad=function(){const pos=[],uv=[],nor=[],N=10;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
  [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(q=>{pos.push(q[0]*.5,0,q[1]*.5);uv.push(.5+q[0]*.5,.5+q[1]*.5);nor.push(0,1,0);});}return BIO.geo._make(pos,nor,uv);};
/* a fan: one upright quad, its hub at the origin (the texture's foot) */
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]];
  [0,1,2,0,2,3].forEach(i=>{const q=P[i];pos.push(q[0],q[1],0);uv.push(q[0]+.5,1-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
/* a hung card: two crossed quads from y=0 (the tendril's end, the card's top) down to y=-1 */
G.hung=function(){const pos=[],uv=[],nor=[];for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.3),sa=Math.sin(k*Math.PI/2+.3);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a fern's frond, arching along +x from the origin, its texture's top at the tip */
G.frond=function(){const pos=[],uv=[],nor=[],n=4,P=[];for(let i=0;i<=n;i++){const t=i/n,w=.5*(.35+.65*Math.sin(Math.min(1,t*1.15+.08)*Math.PI)),y=.42*Math.sin(t*2.0)-.3*t*t;P.push([t,y,-w,t],[t,y,w,t]);}
  for(let i=0;i<n;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];[[a,0],[b,1],[c,0],[b,1],[d,1],[c,0]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],1-q[0][3]);nor.push(0,1,0);});}
  return BIO.geo._make(pos,nor,uv);};
/* a snap trap's lobe: one quad hinged along x at y=0, the blade up +y (v 1 at the hinge) */
G.lobe=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]];
  [0,1,2,0,2,3].forEach(i=>{const q=P[i];pos.push(q[0],q[1],0);uv.push(q[0]+.5,1-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
NECANYONS.G=G;

// ---------------------------------------------------------------- materials
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const M=NECANYONS.MAT={
 bark:{palm:BIO.barkMat(NECANYONS.BARKTEX.palm),fig:BIO.barkMat(NECANYONS.BARKTEX.fig),wood:BIO.barkMat(NECANYONS.BARKTEX.wood),lily:BIO.barkMat(NECANYONS.BARKTEX.lily),caudex:BIO.barkMat(NECANYONS.BARKTEX.caudex)},
 sundew:leaf(TX.sundew,'sundew',{swayA:.02}),cup:leaf(TX.cup,'cup',{swayW:'(-position.y)',swayA:.05}),
 sunpit:leaf(TX.trumpet,'sunpit',{swayA:.03}),carnmoss:leaf(TX.moss,'carnmoss',{swayW:'(-position.y)',swayA:.08}),
 fan:leaf(TX.fan,'fan',{swayW:'(position.y)',swayA:.08}),fern:leaf(TX.fern,'fern',{swayW:'(position.x)',swayA:.06}),
 figleaf:BIO.leafMat(TX.broad,'figleaf',{aN:true,swayW:'1.0',swayA:.05}),flametip:BIO.leafMat(TX.thick,'flametip',{aN:true,swayW:'1.0',swayA:.04}),
 plumleaf:BIO.leafMat(TX.broad,'plumleaf',{aN:true,swayW:'1.0',swayA:.05}),
 fonio:leaf(TX.grass,'fonio',{swayA:.1}),ringgrass:leaf(TX.grass,'ringgrass',{swayA:.05}),lilytuft:leaf(TX.grass,'lilytuft',{swayA:.06}),
 bloom:leaf(TX.bloom,'bloom',{swayW:'1.0',swayA:.03}),lilybloom:leaf(TX.bloom,'lilybloom',{swayW:'1.0',swayA:.03}),
 strap:leaf(TX.strap,'strap',{swayW:'(position.x)',swayA:.03}),vine:BIO.leafMat(TX.vine,'vine',{aN:true,swayW:'1.0',swayA:.05}),
 sticky:leaf(TX.sticky,'sticky',{swayW:'0.0',swayA:0}),petiole:leaf(TX.strap,'petiole',{swayW:'0.0',swayA:0}),
 solid:BIO.solidMat(null),
 lobe:leaf(TX.lobe,'lobe',{swayW:'0.0',swayA:0,alphaTest:.45})};
// THE LIBRARY (core/materials/PLAN.md): the slots materials.json names take the library's maps; the procedural ones stay
// without the pack. A sheet's cell is the item's uv (cellUV, below), not the pack's: one texture per sheet, many cells
NECANYONS.LIB=BIO.libSwap('necanyons',M);
const LIBWHITE=C(0xf4f2ec);
// a full-colour card carries its own colour: its instances take a near-white, a sixth of the procedural colour kept
// (a grey card, tint.keep 0, takes the procedural colour as before)
const FULL=slot=>{if(!NECANYONS.LIB[slot]||typeof KMAT==='undefined'||!KMAT.packed)return false;const L=KMAT.packed('necanyons',slot);return !!(L&&L.tint&&L.tint.keep>=.99);};
NECANYONS.libCol=(slot,c)=>FULL(slot)?LIBWHITE.clone().lerp(c&&c.isColor?c:C(c),.16):c;
NECANYONS.LIBMEAN={};
{const P=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('necanyons',n):null;
 ['bark.palm','bark.fig','bark.wood','bark.lily','bark.caudex'].forEach(k=>{const L=P(k);if(L&&L.tint&&L.tint.mean>0)NECANYONS.LIBMEAN[k]=L.tint.mean;});}

// the snap trap's motion (core/biome/37-core-traps.js, KTRAPS.GLSL): each lobe turns about its hinge by its trap's k, from
// the wind clock and a phase hashed from the trap's id; the slow phases of the cycle compressed for a page (SPEED)
NECANYONS.SPEED=20000;
{const c=NECANYONS.TRAPS.clapjaw.cycle,sp=NECANYONS.SPEED,base=M.lobe.onBeforeCompile;
 const U={value:new T3.Vector4(c.wait/sp,c.shut,c.digest/sp,c.reopen/sp)};
 M.lobe.onBeforeCompile=sh=>{sh.uniforms.uCyc=U;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aTrap;\nuniform vec4 uCyc;\nuniform float uWindT;\n'+KTRAPS.GLSL)
   .replace('#include <begin_vertex>','vec3 transformed=vec3(position);\n{float k=ktrapK(uWindT,uCyc,aTrap.x);float th=aTrap.y*mix(aTrap.z,0.06,k);float c=cos(th),s=sin(th);'+
    'transformed=vec3(position.x,position.y*c-position.z*s,position.y*s+position.z*c);}');
  base(sh);
  // the foliage hook declares uWindT again: keep one
  sh.vertexShader=sh.vertexShader.replace(/uniform float uWindT;\n(?=[\s\S]*uniform float uWindT;)/,'');};
 M.lobe.userData.bio.trap='snap';}

['Fan-palm trunks','Stack-fig roots and limbs','Flametip, ember-plum and liana wood','Stilt-lily trunks (black leaf bases)','Rock-bottle stems'].forEach((lab,i)=>{const k=['palm','fig','wood','lily','caudex'][i];
 BIO.bucket('bark.'+k,M.bark[k],{label:lab,uvScale:[[2,3],[3,5],[3,4],[2,2],[2,2]][i]});});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
// the owner's 3 x 3 sheets, by cell: rimdew's rosette, forked and flowering; the monkeycup's lower, upper and wine pitchers;
// the trap lobe; card.carnivore.plants' trumpets (the sun pitcher) in two cells; the carnivorous moss's middle cell
BIO.def('sundewR',cellUV(G.pad(),CELL(0,0)),M.sundew,{label:'Rimdew (sundew rosettes)'});
BIO.def('sundewF',cellUV(G.tuft(),CELL(1,0)),M.sundew,{label:'Rimdew (forked sundews)'});
BIO.def('sundewB',cellUV(G.tuft(),CELL(0,1)),M.sundew,{label:'Rimdew in flower'});
BIO.def('cupLow',cellUV(G.hung(),CELL(0,0)),M.cup,{label:'Monkeycup pitchers (lower)'});
BIO.def('cupUp',cellUV(G.hung(),CELL(1,0)),M.cup,{label:'Monkeycup pitchers (upper funnels)'});
BIO.def('cupWine',cellUV(G.hung(),CELL(2,2)),M.cup,{label:'Monkeycup pitchers (wine-red)'});
BIO.def('lobe',cellUV(G.lobe(),CELL(0,0)),M.lobe,{attrs:['aTrap'],label:'Clapjaw traps'});
BIO.def('petiole',cellUV(G.frond(),STRAP),M.petiole,{label:'Clapjaw leaf stalks'});
BIO.def('sunpit',cellUV(G.tuft(),CELL(0,0)),M.sunpit,{label:'Sun pitchers'});
BIO.def('sunpitB',cellUV(G.tuft(),CELL(2,1)),M.sunpit,{label:'Sun pitchers (red)'});
BIO.def('carnmoss',cellUV(BIO.geo.hang(),CELL(1,1)),M.carnmoss,{label:'Carnivorous moss (hanging gardens)'});
BIO.def('seepfern',cellUV(G.frond(),[.333,0,.667,.333]),M.fern,{label:'Seep curtains (maidenhair)'});
BIO.def('fan',cellUV(G.fan(),[.34,.34,.66,.66]),M.fan,{label:'Fan-palm leaves'});
BIO.def('figleaf',BIO.geo.clump(),M.figleaf,{attrs:['aN'],label:'Stack-fig foliage'});
BIO.def('flametip',BIO.geo.clump(),M.flametip,{attrs:['aN'],label:'Flametip foliage'});
BIO.def('plumleaf',BIO.geo.clump(),M.plumleaf,{attrs:['aN'],label:'Ember-plum foliage'});
BIO.def('fonio',cellUV(G.tuft(),CELL(1,1)),M.fonio,{label:'Sandpan fonio'});
BIO.def('ringgrass',cellUV(G.tuft(),CELL(1,1)),M.ringgrass,{label:'Ringgrass (spinifex hummocks)'});
BIO.def('lilytuft',cellUV(G.tuft(),CELL(1,1)),M.lilytuft,{label:'Stilt-lily leaf tufts'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Rock-bottle flowers'});
BIO.def('lilyflower',BIO.geo.bloom(),M.lilybloom,{label:'Stilt-lily flowers'});
BIO.def('tube',cellUV(BIO.geo.frond(4),STRAP),M.strap,{label:'Yellow tubes'});
BIO.def('vine',BIO.geo.clump(),M.vine,{attrs:['aN'],label:'Liana leaves (turncoat, monkeycup)'});
BIO.def('sticky',G.pad(),M.sticky,{label:'Turncoat liana (young: sticky leaves)'});
BIO.def('wort',BIO.geo.bloom(),M.bloom,{label:'Potholewort flowers'});
BIO.def('fig',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Fruit: stack figs'});
BIO.def('plum',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Fruit: ember plums'});
BIO.def('rod',BIO.geo.rod(5),M.solid,{label:'Stems and stalks'});
})();
