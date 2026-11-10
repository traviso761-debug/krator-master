// ================================================================= TWINS — the kit: its ground classes, its items, its materials
// The Twins (PLAN.md): a tall, cold, black range between Xanadu and the Catch with two small active volcanoes on it. Away from the vents
// and the tube mouths nothing grows (PLAN.md section 5, zone 5: "zero vascular plants"), so most of the kit is what lies on the ground:
// the titanium-basalt blocks and the frost-shattered scree, the obsidian coulees' black glass, the stones; the guides' cairns along the
// sprints; and where a tube breathes warm air out into the frost, a collar of life (section 5.2): fumarole-ferns and cinder-cushions.
// The ground's own colours (the basalt, the scree, the obsidian, snow, rime, the trodden route, the warm collars' moss, lichens) are
// TWINS.GROUND, which the host's painter reads (84-host-ground.js) through TWINS.groundAt.
// Engine-independent: everything through BIO (BIOME-API.md); placement in 60, the order in 70. Started from the Godthrone's kit (the
// same rock: biomes/godthrone/src/50-biome-godthrone-species.js), its block and stone made the same way.
const TWINS={};
BIO.kit('twins');
TWINS.TAGS={climate:'cold..polar',aridity:'semiarid',abyssal:false,riparian:'no',koppen:['ET','EF']};
// ---------------------------------------------------------------- the species (PLAN.md section 5): the warm collars' life
TWINS.SPECIES=[
 {id:'fumarole-fern',name:'Fumarole-fern',where:'the warm, humid collars round the tube skylights and mouths (+12 to +16 C air in a -4 C scree)',habit:'a clump of bright green fronds 0.4-0.9 m',kin:'PLAN.md section 5.2'},
 {id:'cinder-cushion',name:'Cinder-cushion',where:'the warm collars and the periglacial ring of the oases: hemispheric cushions in the warm rock cracks',habit:'a dense dome 0.2-0.8 m across',kin:'PLAN.md sections 5 and 5.2'},
 /* THE OASES' LIFE (PLAN.md sections 5 and 5.1; stations 2 and 6): the kit's endemic variants of its neighbours' plants. The pocket-hearths are
    the Hearths' own (biomes/hearths, read in place by a station's "kin": the cold dress, 1.2-3.2 m stalks) */
 {id:'bobby-sock-sedge',name:'Bobby-sock sedge',where:'the oases\' warm turf on 15-35 C ground along the runoff rills: the mules\' and yaks\' night grazing',habit:'a tussock of grey-green blades 0.3-0.6 m, white silica cuffs at the root',kin:'biomes/geyser puna (PLAN.md section 5.1, 3)'},
 {id:'dwarf-agate-pine',name:'Dwarf agate-pine (krummholz)',where:'the drier warm-soil margins of the oases (8-18 C ground), wind-flagged',habit:'a twisted bole with banded agate bark under a flat flagged crown, 2-4 m',kin:'biomes/xanadu ranges, the agate tree (PLAN.md section 5.1, 2)'},
 {id:'brimstone-needles',name:'Brimstone needles',where:'the lips of the fumaroles and the sulphur vents (70 C and over)',habit:'yellow sulphur crystals in sprays 5-25 cm',kin:'mineral (PLAN.md section 4.2: the Brimstone-Tarn\'s yellow needles)'}];
// ---------------------------------------------------------------- the ground classes (sRGB; PLAN.md sections 1, 3 and 5)
TWINS.GROUND={
 basalt:{col:0x252326,name:'Titanium basalt (black, an ilmenite sheen)'},
 scree:{col:0x3a3532,name:'Frost-shattered scree (cinder and blocks of the old flows)'},
 obsidian:{col:0x111114,name:'Obsidian rubble (the coulees\' black glass, frost-shattered)'},
 snow:{col:0xe9eef3,name:'Snow (lying in the hollows and on the shaded lee)'},
 rime:{col:0xd3dce4,name:'Rime feathers (the wind\'s fog frozen on the stones, grown into the wind)'},
 path:{col:0x5b544c,name:'The caravans\' trodden line (cinder ground to grit, dusted with the stones\' lichens)'},
 moss:{col:0x3e6a2c,name:'Steam-moss (the warm collar: green in the black scree, no snow on it)'},
 lichen:{col:0x6d5a2c,name:'Rock lichens (orange, ochre and black crusts on the stable stones)'},
 /* a station's own classes (stations 2-6: BIO.host.fields.cls, the station's MODEL.classAt) */
 sinter:{col:0xd9d2c0,name:'Silica sinter (the oases\' white aprons, laid down by the hot water)'},
 mat:{col:0xc8762a,name:'Thermophile mats (orange, ochre and black cyanobacteria on the warm runoff: geyser puna kin)'},
 mud:{col:0x9a8580,name:'Kaolinite mud (grey-rose clay round the mud pots, acid-altered basalt)'},
 turf:{col:0x56803a,name:'Warm turf (bobby-sock sedge and emerald steam-moss on 15-35 C ground)'},
 ice:{col:0x9fbfd2,name:'Glacier ice (blue, rimed: the summit ice and the hanging snouts)'},
 sulph:{col:0xd6bd3a,name:'Sulphur (yellow crusts and needles round the fumaroles)'},
 crust:{col:0x2c2b30,name:'Lava crust (silvery-black pahoehoe: thin over the molten, it breaks underfoot)'},
 ash:{col:0x6e6a66,name:'Ash (grey, wind-laid: it hides what it lies on)'}};
TWINS.KEYS=['scree','obsidian','snow','rime','path','moss','lichen','sinter','mat','mud','turf','ice','sulph','crust','ash'];
TWINS.XKEYS=['sinter','mat','mud','turf','ice','sulph','crust','ash'];
// the ground's weights at a point, from the host's fields (BIO.host.fields): {scree, obsidian, snow, rime, path, moss, lichen} (0..1 each; the
// basalt is what shows where none of them does)
const _X={};
TWINS.groundAt=function(x,z,o){const F=BIO.host.fields,{smooth,clamp}=BIO.fn;o=o||{};
 const w=F.warm(x,z),p=F.path(x,z);
 o.obsidian=F.obsidian(x,z)*(1-.6*p);o.scree=F.scree(x,z)*(1-o.obsidian*.8);o.path=p;
 o.moss=clamp(smooth(.15,.7,w),0,1);o.snow=F.snow(x,z)*(1-.85*p);o.rime=F.rime(x,z)*(1-o.snow)*(1-.7*p)*.8;
 o.lichen=F.lichen(x,z)*(1-o.snow)*(1-o.moss);
 /* a station's own classes (none on station 1: all 0, the weights above unchanged): each covers the scree, the obsidian and the lichens;
    the warm ones (all but ice and ash) melt the snow and the rime off */
 for(const k of TWINS.XKEYS)_X[k]=0;if(F.cls)F.cls(x,z,_X);for(const k of TWINS.XKEYS)o[k]=clamp(_X[k]||0,0,1);
 const cover=Math.max(o.sinter,o.mat,o.mud,o.turf,o.ice,o.sulph,o.crust,o.ash),warmC=Math.max(o.sinter,o.mat,o.mud,o.turf,o.sulph,o.crust);
 if(cover>0){o.scree*=1-cover;o.obsidian*=1-cover;o.lichen*=1-cover;o.moss*=1-Math.max(o.sinter,o.mat,o.mud,o.ice,o.crust);o.snow*=1-warmC;o.rime*=1-cover;}
 return o;};
// ---------------------------------------------------------------- the items
// tints (sRGB): the basalt's blacks, a rusty block now and then (an oxidised flow top), the obsidian's glass, the cairns' sulphur
TWINS.PAL={basalt:[0x4a4744,0x403e40,0x3a3839,0x524c48],rubble:[0x5e5650,0x534d48,0x665c52],oxid:[0x6e3a2a,0x7a4230],
 obsidian:[0x17171c,0x1d1c22,0x222028,0x1a1920],sulphur:[0xd8b928,0xe2c534,0xc9a81e],rime:[0xc9d3dc,0xb8c4ce],
 fern:[0x5f9a3a,0x6aa63e,0x4e8a32,0x78b048],cushion:[0x3c6a2a,0x4a7a30,0x58843a,0x2f5a24,0x6e8e3c],
 sedge:[0x8aa86a,0x9ab478,0x7a9a5c,0xa4b884],agate:[0xa0522d,0xc8843c,0x7a5a8a,0x8a3a2a,0xd0a050],needle:[0x2f4a26,0x3a5a2c,0x445e30],
 brim:[0xe8cf3a,0xf2dc50,0xd4b62a],sinter:[0xe2dccc,0xd8d0bc,0xcfc6b0],ice:[0xb8d4e4,0xa6c6da,0xc8dee8],wood:[0x5a4a3a,0x6a5844,0x4a3c30],iron:[0x3a3634,0x2e2a28]};
(function(){const T3=BIO.host.THREE,K=KRAND,S=0x7A15;
 // a block: an icosahedron with its vertices pushed in and out by a hash of the vertex (a fresh angular fragment of a flow)
 const block=(det,seed,flat)=>{const g=new T3.IcosahedronGeometry(1,det),p=g.attributes.position,key=new Map();
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*1e3)+','+Math.round(y*1e3)+','+Math.round(z*1e3);
   let f=key.get(k);if(f==null){f=.72+.5*K.unit(K.hash(seed,key.size,0xB10C));key.set(k,f);}
   p.setXYZ(i,x*f,y*f*(flat==null?.78:flat),z*f);}
  g.computeVertexNormals();return g;};
 // obsidian: a conchoidal block, its faces flat and its edges sharp (no smoothing across: the glass breaks clean)
 const glassBlock=seed=>{const g=block(0,seed,.82).toNonIndexed();g.computeVertexNormals();return g;};
 const M=TWINS.MAT={rock:BIO.solidMat(null),glass:BIO.solidMat(null),fern:BIO.leafMat(null,'twins-fern',{}),cushion:BIO.solidMat(null)};
 M.rock.userData.twins='rock';M.glass.userData.twins='obsidian';M.cushion.userData.twins='cushion';
 BIO.def('boulder',block(1,S+1),M.rock,{label:'Scree blocks (titanium basalt, frost-shattered from the old flows)',cls:'feature',kind:'rock'});
 BIO.def('stone',block(0,S+2,.7),M.rock,{label:'Stones (frost-shattered basalt and cinder)',cls:'feature',kind:'rock'});
 /* the boulder field's blocks: the scree block's shape at the stone's detail (20 triangles: there are tens of thousands of them) */
 BIO.def('block',block(0,S+5,.8),M.rock,{label:'A boulder field (frost-shattered basalt blocks)',cls:'feature',kind:'rock'});
 BIO.def('obsidian',glassBlock(S+3),M.glass,{label:'Obsidian blocks (black volcanic glass, shed by the coulee\'s front)',cls:'feature',kind:'glass'});
 /* the guides' cairns (PLAN.md section 3.1: "ancient basalt cairns painted with yellow sulfur mark the dive-ramp"): stacked stones, the
    top one daubed with sulphur; each stone its own instance (its own record), the cairn's place a record of the kit's pass (60) */
 BIO.def('cairnstone',block(0,S+4,.62),M.rock,{label:'A guide\'s cairn (stacked basalt, its cap daubed with sulphur: the Dark-Tube Road\'s marks)',cls:'landmark',kind:'cairn'});
 /* THE WARM COLLARS' LIFE (PLAN.md section 5.2): fumarole-ferns (a clump of fronds: the library's fern card, the sheet's middle cell,
    greened by the instance) and cinder-cushions (a squat dome, lumpy) */
 BIO.def('fern',BIO.geo.clump(),M.fern,{label:'Fumarole-ferns (bright green in the skylight\'s warm breath)',cls:'flora',kind:'fern'});
 const cushion=(function(){const g=new T3.SphereGeometry(1,9,5,0,Math.PI*2,0,Math.PI*.5),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),b=1+.08*Math.sin(x*9+z*7)*Math.sin(z*8-x*5);p.setXYZ(i,x*b,y*.6*b,z*b);}
  g.computeVertexNormals();return g;})();
 BIO.def('cushion',cushion,M.cushion,{label:'Cinder-cushions (dense green domes in the warm rock cracks)',cls:'flora',kind:'cushion'});
 /* ---- THE OASES' ITEMS (stations 2 and 6; 60's oasis pass places them on the station's heat): the sedge (the library's sedge card,
    greened by the instance), the dwarf agate-pine's bole and its flagged crown (two items: the bark's agate bands are the instance colour),
    the brimstone needles, a sinter cone (a low geyser cone or a spring's lip: 1 high, its vent a dimple) */
 const merge=geos=>{const pos=[];geos.forEach(g=>{const G=g.index?g.toNonIndexed():g;pos.push(...G.attributes.position.array);});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;};
 M.sedge=BIO.leafMat(null,'twins-sedge',{});M.wood=BIO.solidMat(null);M.wood.userData.twins='wood';M.ice=BIO.solidMat(null);M.ice.userData.twins='ice';
 M.sinter=BIO.solidMat(null);M.sinter.userData.twins='sinter';
 BIO.def('sedge',BIO.geo.clump(),M.sedge,{label:'Bobby-sock sedge (grey-green tussocks on the warm turf, white silica at the root)',cls:'flora',kind:'sedge'});
 BIO.def('kbole',(function(){const g=new T3.CylinderGeometry(.09,.2,1,6,4),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i)+.5;p.setX(i,p.getX(i)+.18*Math.sin(y*2.6)*y);p.setZ(i,p.getZ(i)+.08*Math.sin(y*4.1));p.setY(i,y);}g.computeVertexNormals();return g;})(),M.rock,
  {label:'Dwarf agate-pine (krummholz: its bole banded like agate)',cls:'flora',kind:'tree'});
 BIO.def('kcrown',(function(){const L=[];[[0,0,0,1,.42],[.55,.05,.1,.8,.36],[1.0,-.02,-.08,.6,.3],[-.35,.04,-.12,.6,.3]].forEach((c,i)=>{const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position;
   for(let k=0;k<p.count;k++){const b=1+.14*K.unit(K.hash(S+60+i,k,0x9C1));p.setXYZ(k,c[0]+p.getX(k)*c[3]*b,c[1]+p.getY(k)*c[4]*b,c[2]+p.getZ(k)*c[3]*.8*b);}L.push(g);});return merge(L);})(),M.cushion,
  {label:'Dwarf agate-pine (its flat crown flagged downwind)',cls:'flora',kind:'tree'});
 BIO.def('needles',(function(){const L=[];for(let i=0;i<7;i++){const g=new T3.ConeGeometry(.07,1,4);g.translate(0,.5,0);const a=K.unit(K.hash(S+70,i,1))*Math.PI*2,t=.25+.5*K.unit(K.hash(S+70,i,2)),h=.5+.5*K.unit(K.hash(S+70,i,3));
   g.scale(1,h,1);g.rotateZ(t);g.rotateY(a);L.push(g);}return merge(L);})(),M.cushion,{label:'Brimstone needles (sulphur crystals on a fumarole\'s lip)',cls:'feature',kind:'mineral'});
 BIO.def('cone',new T3.LatheGeometry([[1,0],[.86,.22],[.5,.8],[.38,1],[.22,.96],[.1,.8],[0,.76]].map(q=>new T3.Vector2(q[0],q[1])),14),M.sinter,
  {label:'A sinter cone (geyserite laid down by a spouting spring)',cls:'feature',kind:'sinter'});
 /* ---- THE TRAPS' LEAVINGS (stations 3 and 4: the betrayed caravans): planks and wheels of rimed wagon frames, the merchants' strongboxes;
    ice blocks (the seracs' spall) */
 BIO.def('plank',new T3.BoxGeometry(1,.09,.2),M.wood,{label:'Wreckage of a betrayed caravan (a wagon\'s frame, rimed)',cls:'feature',kind:'wreck'});
 BIO.def('wheel',(function(){const g=new T3.CylinderGeometry(.5,.5,.09,12,1,true);g.rotateX(Math.PI/2);const h=new T3.CylinderGeometry(.1,.1,.2,6);h.rotateX(Math.PI/2);return merge([g,h]);})(),M.wood,
  {label:'Wreckage of a betrayed caravan (a wagon wheel)',cls:'feature',kind:'wreck'});
 BIO.def('strongbox',(function(){const b=new T3.BoxGeometry(1,.62,.64);b.translate(0,.31,0);const l=new T3.BoxGeometry(1.04,.12,.68);l.translate(0,.66,0);return merge([b,l]);})(),M.wood,
  {label:'A merchant\'s strongbox (iron-bound, abandoned)',cls:'feature',kind:'wreck'});
 BIO.def('iceblock',block(0,S+8,.85),M.ice,{label:'Ice blocks (spall of the hanging seracs, rimed)',cls:'feature',kind:'ice'});
 TWINS.LIB=BIO.libSwap('twins',M);   /* the library's maps (materials.json): the basalt's grain, the obsidian's glass, the fern card */
})();
