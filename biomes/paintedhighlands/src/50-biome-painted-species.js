// ================================================================= PAINTED HIGHLANDS — species (data + kit items; PLAN.md section 4)
// A cold steppe (BSk, Dsb) on bare banded clay and sandstone: almost nothing on the clay hills and the scarps (the beds show), bunchgrass, sage and
// rabbitbrush on the gentle ground, and every spring after the melt the bloom in drifts on the washes' floors, the playas and the gentle dip slopes,
// each drift's flower favoured by the clay bed under it (41: PAINTED_BLOOM). Junipers and pinyons on the scarps' rims and the canyon's ledges are the
// eastern badlands' (EBADLANDS, read in place: BIO.kin, 70). Earth models renamed as each kit does; working names, proposed (PLAN.md section 4).
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `zone` (the kit's zones), `edible` and `harvest`.
// Everything here is DATA and kit definitions; placement is 60-biome-painted-place.js.
BIO.kit('paintedhighlands');   // this kit's own registry of items and buckets (core/biome: kits)
var PAINTED={SITES:PAINTED_SITES,BLOOM:PAINTED_BLOOM,HAZ:PAINTED_HAZ,FAUNA:PAINTED_FAUNA};
(function(){const {TAU,clamp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);PAINTED.C=C;
const KP=['BSk','Dsb','Dsc','Dfb','BWk'];
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:false,native:true},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex; the colour maths is the core's)
const PAL=PAINTED.PAL={
 grass:[0xb4b07a,0xa8a46e,0xc0b882,0x9c9a66],grassStraw:0xc8b47a,
 sage:[0x9aa892,0xa4b09a,0x8e9c86,0xb0b8a4],rabbit:[0xa8b48a,0x9eac80,0xb4bc94],
 boulder:[0xb2452c,0xc8642e,0xd8a050,0x9a4a36,0xe6d8c0]};
// ---------------------------------------------------------------- the species
const FL=PAINTED_BLOOM.FLOWERS;
const SPECIES=PAINTED.SPECIES=[
 {key:'bunchgrass',name:'Stripe bunchgrass',how:'tufts of a cold steppe bunchgrass spaced out on the gentle ground, green in the melt, straw by midsummer; the one plant everywhere off the bare clay',
  items:['phgrass'],tags:K('cold-temperate','semiarid','no',KP,{zone:['steppe','bloom','rim'],harvest:HV('thatch and bedding; fodder')})},
 {key:'sage',name:'Plateau sage',how:'a grey-green aromatic shrub to a metre, the sagebrush of the gentle ground and the washes\' banks',
  items:['phsage'],tags:K('cold-temperate','arid','no',KP,{zone:['steppe','rim'],harvest:HV('fuel (kindling); incense (a smudge)',[],true,'Burnt as a smudge in the shamans\' stone circles.')})},
 {key:'rabbitbrush',name:'Gold rabbitbrush',how:'a pale shrub of the washes\' banks and the disturbed clay, golden in late summer: the yellow dye (PLAN.md section 4)',
  items:['phrabbit'],tags:K('cold-temperate','arid','both',KP,{zone:['steppe','bloom'],harvest:HV('dye (yellow and gold: the flowers)',[],false,'Its flowers dye wool and hide yellow to gold.')})}]
 .concat(FL.map(f=>({key:f.key,name:f.name,how:'a flower of the spring bloom ('+f.model+'): in drifts after the melt, its drift on the clay bed it favours (PAINTED_BLOOM.DRIFT)',
  items:['phfl'+f.i],bloom:true,tags:K('cold-temperate','semiarid',f.key==='skylupin'||f.key==='snowprimrose'?'both':'no',KP,{zone:['bloom','steppe'],season:'spring (the melt)',
   harvest:f.key==='paintbrush'?HV('none',[],true,'The Painted Men\'s medicine (PLAN.md section 4: a new crops record, `paintbrush`).'):HV('none',[],false,'')})})));
SPECIES.forEach((S,i)=>{S.i=i;});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);PAINTED.byKey=byKey;
PAINTED.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return it==='phboulder'?{name:'A fallen block of danxia sandstone',tags:null}:it==='phstone'?{name:'A standing stone (a stone circle)',tags:null}:null;};
// ---------------------------------------------------------------- textures and materials (the procedural map is the fallback when the pack is absent;
// the library swaps in by slot, BIO.libSwap, materials.json: grass -> card.grass.dry, sage -> card.sage, rabbit -> card.sage's flowering cell,
// fl0..fl8 -> card.flower.bloom.highland's nine cells)
const TX={};
TX.grass=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<60;k++){const x0=S*(.3+.4*((k*37)%100)/100),a=-.9+1.8*((k*53)%100)/100;g.strokeStyle='rgba(200,190,150,1)';g.lineWidth=2;
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+a*S*.15,S*.5,x0+a*S*.3,S*(.05+.3*((k*17)%100)/100));g.stroke();}},[200,190,150]);
TX.bush=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<240;k++){const x=S*(.1+.8*((k*61)%100)/100),y=S*(.15+.8*((k*29+7)%100)/100),r=2+(k%4);g.fillStyle='rgba(150,165,140,1)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}},[150,165,140]);
TX.flower=BIO.alphaTex(128,(g,S)=>{g.strokeStyle='rgba(110,140,90,1)';g.lineWidth=3;for(let k=0;k<5;k++){const x=S*(.25+.12*k);g.beginPath();g.moveTo(S/2,S);g.lineTo(x,S*.3);g.stroke();
 g.fillStyle='rgba(240,240,240,1)';g.beginPath();g.arc(x,S*.26,S*.07,0,TAU);g.fill();}},[220,220,220]);
const SEASON_GRASS={colour:PAL.grassStraw,k:.85,stagger:.5};
const M=PAINTED.M={
 grass:BIO.leafMat(TX.grass,'ph-grass',{swayW:'1.0',swayA:.1,season:SEASON_GRASS}),
 sage:BIO.leafMat(TX.bush,'ph-sage',{swayW:'.4',swayA:.03}),
 rabbit:BIO.leafMat(TX.bush,'ph-rabbit',{swayW:'.4',swayA:.03}),
 /* the flowers: gone at full dry (BIO.SEASON = 1 - the bloom's green: 41), an instance at a time, so a drift thins rather than pops */
 fl:FL.map(f=>BIO.leafMat(TX.flower,'ph-fl'+f.i,{swayW:'(position.y)',swayA:.07,alphaTest:.4,season:{drop:1,colour:0x9a8a60,k:.5,stagger:.6}})),
 solid:(()=>{const m=BIO.solidMat?BIO.solidMat(null):new T3.MeshLambertMaterial({color:0xffffff});m.vertexColors=false;return m;})()};   /* the instance colour alone: the stones carry no vertex colours */
PAINTED.SWAP=BIO.libSwap('paintedhighlands',M);
// ---------------------------------------------------------------- the items
// a TUFT: three crossed upright quads, base at the origin, up to y = 1, v running down the card (an unflipped library sheet)
const tuft=()=>{const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.35,ca);});}
 return BIO.geo._make(pos,nor,uv);};
BIO.def('phgrass',tuft(),M.grass,{label:'Stripe bunchgrass'});
BIO.def('phsage',tuft(),M.sage,{label:'Plateau sage'});
BIO.def('phrabbit',tuft(),M.rabbit,{label:'Gold rabbitbrush'});
FL.forEach(f=>BIO.def('phfl'+f.i,tuft(),M.fl[f.i],{label:f.name}));
// a fallen block of sandstone (the rockfall's sign: PLAN.md section 6) and a standing stone of the circles, low-poly, coloured by the instance
{const g=new T3.IcosahedronGeometry(1,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x*1.2,y*.7,z*.95);}g.computeVertexNormals();
 BIO.def('phboulder',g,M.solid,{label:'Fallen danxia block'});}
{const g=new T3.CylinderGeometry(.28,.36,1,6,1);g.translate(0,.5,0);BIO.def('phstone',g,M.solid,{label:'Standing stone'});}
})();
