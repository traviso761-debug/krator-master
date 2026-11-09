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
 {id:'cinder-cushion',name:'Cinder-cushion',where:'the warm collars and the periglacial ring of the oases: hemispheric cushions in the warm rock cracks',habit:'a dense dome 0.2-0.8 m across',kin:'PLAN.md sections 5 and 5.2'}];
// ---------------------------------------------------------------- the ground classes (sRGB; PLAN.md sections 1, 3 and 5)
TWINS.GROUND={
 basalt:{col:0x252326,name:'Titanium basalt (black, an ilmenite sheen)'},
 scree:{col:0x3a3532,name:'Frost-shattered scree (cinder and blocks of the old flows)'},
 obsidian:{col:0x111114,name:'Obsidian rubble (the coulees\' black glass, frost-shattered)'},
 snow:{col:0xe9eef3,name:'Snow (lying in the hollows and on the shaded lee)'},
 rime:{col:0xd3dce4,name:'Rime feathers (the wind\'s fog frozen on the stones, grown into the wind)'},
 path:{col:0x5b544c,name:'The caravans\' trodden line (cinder ground to grit, dusted with the stones\' lichens)'},
 moss:{col:0x3e6a2c,name:'Steam-moss (the warm collar: green in the black scree, no snow on it)'},
 lichen:{col:0x6d5a2c,name:'Rock lichens (orange, ochre and black crusts on the stable stones)'}};
TWINS.KEYS=['scree','obsidian','snow','rime','path','moss','lichen'];
// the ground's weights at a point, from the host's fields (BIO.host.fields): {scree, obsidian, snow, rime, path, moss, lichen} (0..1 each; the
// basalt is what shows where none of them does)
TWINS.groundAt=function(x,z,o){const F=BIO.host.fields,{smooth,clamp}=BIO.fn;o=o||{};
 const w=F.warm(x,z),p=F.path(x,z);
 o.obsidian=F.obsidian(x,z)*(1-.6*p);o.scree=F.scree(x,z)*(1-o.obsidian*.8);o.path=p;
 o.moss=clamp(smooth(.15,.7,w),0,1);o.snow=F.snow(x,z)*(1-.85*p);o.rime=F.rime(x,z)*(1-o.snow)*(1-.7*p)*.8;
 o.lichen=F.lichen(x,z)*(1-o.snow)*(1-o.moss);return o;};
// ---------------------------------------------------------------- the items
// tints (sRGB): the basalt's blacks, a rusty block now and then (an oxidised flow top), the obsidian's glass, the cairns' sulphur
TWINS.PAL={basalt:[0x4a4744,0x403e40,0x3a3839,0x524c48],rubble:[0x5e5650,0x534d48,0x665c52],oxid:[0x6e3a2a,0x7a4230],
 obsidian:[0x17171c,0x1d1c22,0x222028,0x1a1920],sulphur:[0xd8b928,0xe2c534,0xc9a81e],rime:[0xc9d3dc,0xb8c4ce],
 fern:[0x5f9a3a,0x6aa63e,0x4e8a32,0x78b048],cushion:[0x3c6a2a,0x4a7a30,0x58843a,0x2f5a24,0x6e8e3c]};
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
 TWINS.LIB=BIO.libSwap('twins',M);   /* the library's maps (materials.json): the basalt's grain, the obsidian's glass, the fern card */
})();
