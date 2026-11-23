// ================================================================= GODSTEP — the kit: its ground classes, its items, its materials
// Godstep valley (PLAN.md): the god's stair of ponded titanium-basalt flows. Every flow is old (the owner, 2026-11-03), so the
// ground is a weathered skin, not fresh glass. The kit's species at station 1 are THE LAVA PIONEERS (PLAN.md section 3): crusts,
// cushions and the glass-loving lichens of a cold steppe on weathered rock, and the MOSS SKINS on the old cones in step 2's black
// sand; its loose stuff the talus under every riser (whole fallen columns among the blocks), the plains' stones and the
// procession's cairns. The ground's own colours are GSTEP.GROUND, which the host's painter reads (84-host-ground.js) through
// GSTEP.groundAt. Engine-independent: everything through BIO (BIOME-API.md); placement in 60, the order in 70.
const GSTEP={};
BIO.kit('godstep');
GSTEP.TAGS={climate:'cold-steppe',aridity:'arid',abyssal:false,riparian:'no',koppen:['BSk','Dsb','Dsc']};
// ---------------------------------------------------------------- the ground classes (sRGB; PLAN.md sections 2 and 4)
GSTEP.GROUND={
 basalt:{col:0x2c2824,name:'Old titanium-basalt flow: its weathered skin, dark brown-black'},
 skin:{col:0x1e1c1c,name:'A younger lobe\'s skin (still black where the ilmenite holds)'},
 palag:{col:0x9a6430,name:'Palagonite rinds (the flow\'s glass gone orange)'},
 soil:{col:0x6a5a48,name:'Wind-blown soil in the joints and hollows'},
 lichen:{col:0x4a4a36,name:'Lichen crusts (black, grey-green and orange) on the old rock'},
 sand:{col:0x161516,name:'Black sand (step 2\'s floor, in dunes)'},
 moss:{col:0x56683a,name:'Moss skins (bright, on the old cones\' north faces)'},
 snow:{col:0xeef1f4,name:'Late winter\'s snow'},
 playa:{col:0xb8aa94,name:'The playa\'s pale silt (a pan behind a lobe)'},
 path:{col:0x5e5244,name:'The procession\'s way (worn, cairned)'},
 cone:{col:0x4a2a22,name:'Old scoria (a cone\'s red-brown cinders)'}};
GSTEP.CLASSES=['skin','palag','soil','lichen','sand','moss','snow','playa','path','cone'];
// the ground's weights at a point, from the host's fields (BIO.host.fields), 0..1 each; the old basalt is what shows where none does
GSTEP.groundAt=function(x,z,o){const F=BIO.host.fields;o=o||{};for(const q of GSTEP.CLASSES)o[q]=F[q]?F[q](x,z):0;
 o.sand*=1-o.cone*.8;o.cone*=1-o.moss*.6;return o;};
// ---------------------------------------------------------------- the items
// tints (sRGB): the basalt's blacks, an orange-rinded block now and then, the pioneers' greens and the crusts' colours
GSTEP.PAL={basalt:[0x4a4541,0x423e3d,0x504a45,0x544d47],rind:[0x6e4a30,0x7a5434],column:[0x46424a,0x4c4849,0x403c40],
 cushion:[0x5d6b38,0x6a7440,0x4f5e33,0x7a7a48],crust:[0x2a2a24,0x3c4030,0x8a5a24,0xa0702c,0x585a48],
 moss:[0x6e8a34,0x7f9a3c,0x5f7a2e,0x8aa040],cairn:[0x4c4844,0x5a534c,0x524c47]};
(function(){const T3=BIO.host.THREE,K=KRAND,S=0x6057;
 // a block: an icosahedron with its vertices pushed in and out by a hash of the vertex (a weathered angular fragment of a flow)
 const block=(det,seed,flat)=>{const g=new T3.IcosahedronGeometry(1,det),p=g.attributes.position,key=new Map();
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*1e3)+','+Math.round(y*1e3)+','+Math.round(z*1e3);
   let f=key.get(k);if(f==null){f=.78+.4*K.unit(K.hash(seed,key.size,0xB10C));key.set(k,f);}
   p.setXYZ(i,x*f,y*f*(flat==null?.78:flat),z*f);}
  g.computeVertexNormals();return g;};
 // a fallen column: a hexagonal prism (the colonnade's joints), its ends a little out of square, lying along x, 1 long, ~.32 across
 const column=()=>{const g=new T3.CylinderGeometry(.16,.17,1,6,1,false);g.rotateZ(Math.PI/2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i);if(Math.abs(x)>.49)p.setX(i,x+(K.unit(K.hash(S,Math.round(p.getY(i)*1e3),Math.round(p.getZ(i)*1e3)))-.5)*.05);}
  g.computeVertexNormals();return g;};
 // a cairn: five stones stacked, the broadest at the foot (the procession's marks down the stair)
 const cairn=()=>{const parts=[];let y=0;for(let k=0;k<5;k++){const r=.55-.08*k,g=block(0,S+40+k,.7);g.scale(r,r*.55,r*(.9+.15*K.unit(K.hash(S,k,0xCA))));
   g.rotateY(K.unit(K.hash(S,k,0xCB))*6.28);g.translate((K.unit(K.hash(S,k,0xCC))-.5)*.06,y+r*.42,(K.unit(K.hash(S,k,0xCD))-.5)*.06);y+=r*.62;parts.push(g.toNonIndexed());}
  const pos=[],nor=[],uv=[];for(const g of parts){const P=g.attributes.position.array,N=g.attributes.normal.array,U=g.attributes.uv?g.attributes.uv.array:null;
   for(let i=0;i<P.length/3;i++){pos.push(P[i*3],P[i*3+1],P[i*3+2]);nor.push(N[i*3],N[i*3+1],N[i*3+2]);uv.push(U?U[i*2]:0,U?U[i*2+1]:0);}}
  return BIO.geo._make(pos,nor,uv);};
 const M=GSTEP.MAT={rock:BIO.solidMat(null),cushion:BIO.solidMat(null),crust:BIO.solidMat(null)};
 M.rock.userData.gstep='rock';M.cushion.userData.gstep='cushion';M.crust.userData.gstep='crust';
 if(BIO.fung){M.cushion.vertexColors=true;M.crust.vertexColors=true;}
 BIO.def('boulder',block(1,S+1),M.rock,{label:'Talus blocks (titanium basalt, fallen from the colonnades)',cls:'feature',kind:'rock'});
 BIO.def('column',column(),M.rock,{label:'Fallen columns (whole hexagonal prisms from a front\'s colonnade)',cls:'feature',kind:'rock'});
 BIO.def('stone',block(0,S+2,.7),M.rock,{label:'Stones on the plain (weathered, soil between them)',cls:'feature',kind:'rock'});
 BIO.def('cairn',cairn(),M.rock,{label:'A cairn (the procession\'s way down the god\'s stair: Godostera)',cls:'feature',kind:'structure'});
 /* THE LAVA PIONEERS (PLAN.md section 3; BIO.fung, core/biome/33): cushion plants (low domes, lumpy, in the joints and the lee of
    blocks) and crusts (flat lobed patches on the old rock); a cold steppe's pioneers on weathered rock */
 if(BIO.fung){
  BIO.def('cushion',BIO.fung.cap({form:'dome',h:.42,seg:12,rings:3,lump:.22,under:'none',seed:S+11}),M.cushion,{label:'Cushion plants (the lava pioneers: tight domes in the joints)',cls:'flora',kind:'pioneer'});
  BIO.def('crust',BIO.fung.crust({lobes:6,lobeA:.34,seg:16,rings:2,seed:S+12}),M.crust,{label:'Crusts and glass-loving lichens (black, grey-green and orange)',cls:'flora',kind:'pioneer'});
  BIO.def('mossmat',BIO.fung.crust({lobes:7,lobeA:.28,seg:16,rings:2,seed:S+13}),M.crust,{label:'Moss skins on an old cone (bright green on its north face)',cls:'flora',kind:'moss'});}
 GSTEP.LIB=BIO.libSwap('godstep',M);   /* the library's maps (materials.json): the basalt's grain on the blocks, the pioneers' detail */
})();
GSTEP.SPECIES=[{key:'cushion',name:'Cushion plants',where:'the old plains\' joints and the lee of blocks'},{key:'crust',name:'Crusts and lichens',where:'old rock, stable blocks'},
 {key:'mossmat',name:'Moss skins',where:'the old cones\' north faces in the black sand (refs/08)'}];
