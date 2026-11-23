// ================================================================= WOW — the bench's own species (data + kit items)
// PLAN.md section 4: two native species. The rest of the bench's flora is the NW outer wall's, read in place (48a-48d).
//   PUYA SPIKE (refs/02)   a giant rosette of grey spears on the dry bench at 4-5 km, under a flower spike 8-12 m tall that blooms once
//                          in a century: the dry high Andes' habit (Puya raimondii), spiral like the southern highlands' rosettes. The
//                          library's card.puya (a nine-cell sheet: a rosette cell of the top row; the flower spike cut from the bottom
//                          rows), placed by 60
//   DUST TOWER (refs/01)   the loess tablelands' colonies that trap the wind-blown dust and cement it into towers 5-30 m tall: rock-like
//                          bodies, so they are core/terrain KSTACKS mounds (46: WOW.dustTowers), drawn by the host on organic.dusttower
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal / riparian /
// koppen) plus `zone` (46).
BIO.kit('wouterwall');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU}=BIO.fn;const T3=BIO.host.THREE;
const HV=(wood,edible,med,note)=>({wood,edible,medicinal:med,note});
const PK=(name,climate,aridity,koppen,zone,hv,extra)=>Object.assign({name,tags:{climate,aridity,abyssal:false,riparian:'no',koppen,zone,harvest:hv}},extra||{});
WOW.SPECIES=[
 Object.assign({key:'puya'},PK('Puya spike','cold','semiarid',['Dsc','Dfc','ET'],['steppe','tundra','scarp','hummock'],
  HV('none',[],false,'The century spike\'s dry stalk is a roof beam; its spears a thatch the Hayrant cut only from the dead.'),{native:true,ref:'refs/02'})),
 Object.assign({key:'dusttower'},PK('Dust tower','cold','semiarid',['Dsb','Dsc'],['yuan','steppe'],
  HV('none',[],false,'Colonies that cement the wind\'s dust into towers: the plateau\'s own builders. Not cut: a broken tower is a bad omen.'),{native:true,ref:'refs/01',body:'KSTACKS mound'}))];
WOW.byKeyS={};WOW.SPECIES.forEach(S=>WOW.byKeyS[S.key]=S);
WOW.PLANTS={puya:{name:'Puya spike',items:['puya','puyaspike'],tags:WOW.SPECIES[0].tags}};
WOW.plantOfItem=item=>{for(const k in WOW.PLANTS)if(WOW.PLANTS[k].items.indexOf(item)>=0)return WOW.PLANTS[k];return null;};

// ---------------------------------------------------------------- textures (procedural, the fallback without the pack)
// the rosette: grey-green spears radiating from a dark heart, the dead skirt brown below; the spike: a column of pale green bracts
const TX={
 puya:BIO.canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.lineCap='round';
  for(let k=0;k<70;k++){const a=Math.PI*(1.05+.9*k/69),r=w*(.32+.16*((k*37)%11)/11),dead=k%3===0;g.strokeStyle=dead?'rgba(150,120,90,1)':'rgba(170,184,168,1)';
   g.lineWidth=dead?2:3;g.beginPath();g.moveTo(w/2,h*.92);g.lineTo(w/2+Math.cos(a)*r,h*.92+Math.sin(a)*r*(dead?-.45:1));g.stroke();}}),
 spike:BIO.canvasTex(32,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let y=4;y<h;y+=4){const s=1-y/h*.4;g.fillStyle=y%8?'rgba(200,210,150,1)':'rgba(170,186,120,1)';
  g.beginPath();g.ellipse(w/2,y,w*.42*s+1,3,0,0,TAU);g.fill();}})};
WOW.TX=TX;

// ---------------------------------------------------------------- geometries and materials
/* a tuft: three crossed upright quads, base at y=0, top at y=1 (v 1 at the foot), as the NW outer wall's */
const tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
const M=WOW.MAT={puya:BIO.leafMat(TX.puya,'puya',{swayW:'(position.y)',swayA:.012,alphaTest:.4}),
 puyaspike:BIO.leafMat(TX.spike,'puyaspike',{swayW:'(position.y)',swayA:.02,alphaTest:.4})};
// THE LIBRARY (core/materials/PLAN.md): materials.json's puya and puyaspike take card.puya's cells
WOW.LIB=BIO.libSwap('wouterwall',M);
BIO.def('puya',tuft(),M.puya,{label:'Puya spike (a giant rosette of grey spears; the dead ones a brown skirt)'});
BIO.def('puyaspike',tuft(),M.puyaspike,{label:'A puya\'s century spike (8-12 m of pale green bracts: it blooms once and dies)'});

// ---------------------------------------------------------------- the terraces' crops (kits/crops: the wouterwall records, 2026-11-10)
// The Hayrant's terraced fields (station 1), each field one crop (60: WOW.buildCrops; the host gives the fields). A crop's item is
// 'crop.<id>' on the library's crop cards (materials.json: a cell each); the season sets each one's look (WOW.CROP_LOOK): the millet green
// in summer and gold in autumn, the buckwheat's stems red as it ripens, the garlic sown in autumn and lifted in summer
WOW.CROP_IDS=['dustmillet','redstem','dust-lentil','bench-garlic','wallhemp'];
{const SK=typeof SEASON==='string'?SEASON:'autumn';
 // per crop and season: {h: the plant's height (m; 0 not in the field), w: its width, c: the colour (a greyscale card's tint; a coloured
 // card's near-white)}. Winter: stubble and bare silt (the ground's own terrace tint)
 const L={dustmillet:{summer:{h:1.0,w:.9,c:0x9ab070},autumn:{h:1.15,w:.95,c:0xe0c070},spring:{h:.25,w:.3,c:0x8aa860}},
  redstem:{summer:{h:.8,w:.8,c:0xf4f0ec},autumn:{h:.9,w:.85,c:0xffe8e0},spring:{h:.2,w:.3,c:0xe8f0e0}},
  'dust-lentil':{summer:{h:.45,w:.6,c:0xf2f4ee},autumn:{h:.35,w:.55,c:0xe8dcc0},spring:{h:.15,w:.3,c:0xf2f4ee}},
  'bench-garlic':{summer:{h:.45,w:.45,c:0xe8f0e8},autumn:{h:.15,w:.2,c:0xf0f4ee},spring:{h:.35,w:.4,c:0xeef4ee},winter:{h:.08,w:.12,c:0xd8e0d8}},
  wallhemp:{summer:{h:2.2,w:1,c:0xf2f4ee},autumn:{h:2.4,w:1,c:0xeee6cc},spring:{h:.4,w:.4,c:0xf0f4ee}}};
 WOW.CROP_LOOK={};WOW.CROP_IDS.forEach(id=>{WOW.CROP_LOOK[id]=L[id][SK]||null;});}
const TXC=BIO.canvasTex(64,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(180,180,170,1)';g.lineWidth=2;
 for(let k=0;k<9;k++){const x=w*(.2+.6*k/8);g.beginPath();g.moveTo(w/2,h);g.quadraticCurveTo(x,h*.5,x+(k-4)*2,h*.08);g.stroke();}});
WOW.CROP_IDS.forEach(id=>{M['crop.'+id]=BIO.leafMat(TXC,'crop.'+id,{swayW:'(position.y)',swayA:id==='wallhemp'?.05:.08,alphaTest:.4});});
Object.assign(WOW.LIB,BIO.libSwap('wouterwall',Object.fromEntries(WOW.CROP_IDS.map(id=>['crop.'+id,M['crop.'+id]]))));
WOW.CROP_IDS.forEach(id=>{const C=typeof CROPS!=='undefined'&&CROPS.BY_ID[id];
 BIO.def('crop.'+id,tuft(),M['crop.'+id],{label:(C?C.name:id)+' (the Hayrant\'s terraced fields)',cap:120000,capWhy:'a terraced field\'s plants, a card every ~2.4 m on the treads of station 1\'s five field systems'});
 WOW.PLANTS['crop.'+id]={name:C?C.name:id,items:['crop.'+id],tags:{crop:id,harvest:{wood:'none',edible:C&&C.bucket!=='cordage'?[C.name]:[],medicinal:!!(C&&C.also.indexOf('medicine')>=0),note:C?C.note:''}}};});
})();
