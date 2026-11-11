// ================================================================= FIREBLISS — species and pieces (data + kit items)
// The Firebliss Range (PLAN.md): a volcanic arc on the Labyrinth's northern rim, its warm valleys lush pockets in ice and ash. Most of its life is read
// in place from the kits that have it (PLAN.md section 4): the geyser kit's thermal trees and floor (its own build, 89z), Copper Glacier's cushions,
// lichen, moss, sedge, boulders and frost coral (COPPERG.build on this page's fields, 89z), and the Throne's ash pine and tree fern as this kit's kin
// (BIO.kin: grown by the Throne's own builders, 60). What no kit has, this one keeps:
//   MEADOW        the warm floor's grass, ferns, highland flowers and fireweed (it follows the ash and the burn)
//   REEDS         the tarns' warm margins
//   ASH PLANTS    tussock on the ash slopes
//   STONES        pumice, obsidian and scoria on the ash; sulphur crusts at the fumaroles
//   SIGNS         the dead birds in the gas hollows (PLAN.md section 5: "dead birds and bare ground for gas")
//   THE HUNTERS'  hide shelters on poles, drying racks with their hides, hearths, caches, cairns, the Kimr's aurochs-horn markers, the Fellgangs'
//                 stone signs, a butchery site's bones (PLAN.md section 3); placed by 65 on core/camp's pitch
// Everything here is DATA and kit definitions; no placement (60, 65). Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen).
BIO.kit('firebliss');   // this kit's own registry of items and buckets (core/biome: kits)
var FIREBLISS={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);FIREBLISS.C=C;
FIREBLISS.TAGS={climate:'temperate',aridity:'humid',abyssal:false,riparian:'both',koppen:['Cfb','Cfa','Dfc','ET','EF']};
// the classes of the range on scale model 5.1 (PLAN.md section 1): the valleys temperate, the arc tundra and ice
FIREBLISS.KOPPEN={ET:.34,EF:.22,HT:.14,HF:.1,Dfc:.08,Cfb:.08,Cfa:.04};

// ---------------------------------------------------------------- palettes
const PAL=FIREBLISS.PAL={
 grass:[0x6e9a3a,0x7aa644,0x628c34,0x86ac4c],grassAsh:[0x8a9460,0x96a06a,0x7e8858],fern:[0x4e8a34,0x5a963c,0x467c2e],
 flower:[0xe8c040,0xd85a4a,0xf0e0c8,0x9a7ad0],fireweed:[0xd04a8a,0xc84080,0xe060a0],reed:[0x8a9a52,0x96a45c,0x7e8e4a],ashgrass:[0xb0a070,0xbcac7a,0xa49464],
 pumice:[0xd8d2c4,0xe2dccf,0xcac4b6],obsidian:[0x2a2a30,0x24242a,0x323238],scoria:[0x6a4a3e,0x5e4236,0x74523e],sulphur:[0xe8d040,0xf0dc58,0xdcc430],
 bird:[0x3a342e,0x4a4036,0x2e2a26],hide:[0xa88a64,0xb4966e,0x9a7c58],wood:[0x8a7a66,0x7a6a58,0x96866e],stone:[0x7a766e,0x6e6a64,0x86827a],
 horn:[0xe8dcc0,0xd8ccae,0xf0e4cc],bone:[0xe4dcc8,0xd8d0bc,0xece4d2],ash:[0x5a5650,0x4e4a46]};
FIREBLISS.vary=(c,h,s,l)=>{const o=c.clone?c.clone():C(c);o.offsetHSL(rr(-h,h),rr(-s,s),rr(-l,l));return o;};

// ---------------------------------------------------------------- the plants and pieces, tagged (60 and 65 place them; the inspector reads `items`)
const HV=(use,food,med,note)=>({use:use||'none',food:food||[],medicinal:!!med,note:note||''});
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp},o||{});
const PK=(name,c,a,r,kp,items,hv,o)=>({name,tags:Object.assign(K(c,a,r,kp,o),{harvest:hv||HV()}),items});
FIREBLISS.PLANTS={
 grass:PK('Warm meadow grass','temperate','humid','no',['Cfb','Cfa'],['grass'],HV('fodder',[],false,'The valleys\' grass: green all year where the ground is warm, the hunters\' horses and the strays both graze it.')),
 fern:PK('Bliss fern','temperate','humid','both',['Cfb','Cfa'],['fern'],HV('none',['fiddleheads (spring)'],false,'Bracken-like fronds on the warm floor and under the pines; thickest by the springs.')),
 flower:PK('Highland flowers','temperate','humid','no',['Cfb','Dfc'],['flower'],HV()),
 fireweed:PK('Fireweed','temperate','humid','no',['Cfb','Dfc','ET'],['fireweed'],HV('food',['shoots'],true,'Magenta spikes on new ash and burnt ground: the first plant back after a fall of ash.')),
 reed:PK('Warm reed','temperate','humid','yes',['Cfb','Cfa'],['reed'],HV('thatch',[],false,'Tall reeds round the tarns\' warm margins, where the springs run in.')),
 ashgrass:PK('Ash tussock','polar','semiarid','no',['ET','Dfc'],['ashgrass'],HV('fuel (dried)',[],false,'Hard tussocks that hold the ash slopes.')),
 stones:PK('Ash-slope stones','polar','semiarid','no',['ET','EF','HT'],['pumice','obsidian','scoria'],HV('tools',[],false,'Pumice, glassy black obsidian (the hunters knap it) and red scoria on the ash.')),
 sulphur:PK('Sulphur crusts','temperate','humid','no',['Cfb','ET'],['sulphur'],HV('resource',[],false,'Yellow sulphur grown round the fumaroles\' throats: the gatherers break it off.')),
 birds:PK('Dead birds (the gas)','temperate','humid','no',['Cfb'],['bird'],HV('none',[],false,'Small birds dead in a hollow: the sign of the gas that pooled there in the night. Do not camp in a hollow.'),{sign:'gas'}),
 camp:PK('A hunters\' camp','temperate','humid','no',['Cfb','Cfa'],['shelter','pole','rack','hide','hearthstone','hearthash','cache'],HV('none',[],false,'A hunting camp, struck and pitched by the season: hide shelters on poles, drying racks, a hearth, a cache.'),{kind:'camp'}),
 marks:PK('The hunters\' marks','temperate','humid','no',['Cfb','Cfa','ET'],['cairnstone','horn','signstone'],HV('none',[],false,'Cairns along the trails; the Kimr\'s aurochs-horn markers; the Fellgangs\' stone signs.'),{kind:'mark'}),
 butchery:PK('A butchery site','temperate','humid','no',['Cfb','Cfa'],['bone'],HV('none',[],false,'Where a kill was dressed: the bones left, the rack struck.'),{kind:'site'}),
};
FIREBLISS.plantOfItem=item=>{for(const k in FIREBLISS.PLANTS)if(FIREBLISS.PLANTS[k].items.indexOf(item)>=0)return FIREBLISS.PLANTS[k];return null;};

// ---------------------------------------------------------------- textures (the procedural fallbacks: a page with the kit's pack takes the library's)
const card=(S,fn)=>BIO.alphaTex(S,g=>fn(g,S,S),[255,255,255]);
const blades=(n,lw)=>card(128,(g,w,h)=>{g.strokeStyle='#fff';for(let i=0;i<n;i++){g.lineWidth=rr(lw[0],lw[1]);const x=rr(24,w-24);g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rr(-14,14),h*.5,x+rr(-28,28),rr(4,26));g.stroke();}});
const TX={grass:blades(30,[1,2.4]),reed:blades(14,[1.6,3]),ashgrass:blades(22,[1,2]),
 fern:card(128,(g,w,h)=>{g.strokeStyle='#fff';g.fillStyle='#fff';for(let f=0;f<5;f++){const x0=rr(30,w-30),a=rr(-.6,.6);g.lineWidth=2;g.beginPath();g.moveTo(x0,h);const ex=x0+Math.sin(a)*h*.8,ey=h-Math.cos(a)*h*.85;g.lineTo(ex,ey);g.stroke();
  for(let k=1;k<12;k++){const t=k/12,px=x0+(ex-x0)*t,py=h+(ey-h)*t,l=(1-t)*16+3;g.beginPath();g.ellipse(px-l*.6,py,l*.7,2.2,-.3,0,TAU);g.ellipse(px+l*.6,py,l*.7,2.2,.3,0,TAU);g.fill();}}}),
 flower:card(128,(g,w,h)=>{g.fillStyle='#fff';for(let i=0;i<9;i++){const x=rr(20,w-20),y=rr(10,h*.6);g.fillRect(x-1,y,2,h-y);g.beginPath();g.arc(x,y,rr(4,8),0,TAU);g.fill();}}),
 spike:card(128,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(w/2-1.5,h*.3,3,h*.7);for(let i=0;i<34;i++){const y=rr(6,h*.6);g.beginPath();g.arc(w/2+rr(-8,8)*(1-y/h),y,rr(3,5),0,TAU);g.fill();}})};
const grey=(n,seed,base)=>BIO.canvasTex(n,n,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let i=0;i<w*h;i++){const v=(base==null?200:base)+(h3(i%w,(i/w)|0,seed)-.5)*60;d[i*4]=d[i*4+1]=d[i*4+2]=clamp(v,0,255);d[i*4+3]=255;}g.putImageData(id,0,0);});

// ---------------------------------------------------------------- materials (BIO.libSwap gives each slot its library map: materials.json)
const M=FIREBLISS.MAT={
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 fern:BIO.leafMat(TX.fern,'fern',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 flower:BIO.leafMat(TX.flower,'flower',{swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 fireweed:BIO.leafMat(TX.spike,'fireweed',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.14,alphaTest:.4}),
 ashgrass:BIO.leafMat(TX.ashgrass,'ashgrass',{swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 'stone.pumice':BIO.solidMat(grey(128,21,220)),'stone.obsidian':BIO.solidMat(grey(128,22,60)),'rock.scoria':BIO.solidMat(grey(128,23,150)),
 sulphur:BIO.solidMat(grey(128,24,210)),bird:BIO.solidMat(grey(64,25,120)),
 hide:BIO.solidMat(grey(128,26,190)),wood:BIO.solidMat(grey(128,27,170)),'rock.cairn':BIO.solidMat(grey(128,28,160)),
 horn:BIO.solidMat(grey(64,29,230)),bone:BIO.solidMat(grey(64,30,230)),ash:BIO.solidMat(null,0x4e4a46),
};
M.hide.side=T3.DoubleSide;
FIREBLISS.SWAP=BIO.libSwap('firebliss',M);

// ---------------------------------------------------------------- geometries local to this kit
const G=FIREBLISS.G={
 // n crossed vertical quads, base at y 0, 1 tall and 1 wide: the floor cards
 cross(n){const pos=[],uv=[],nor=[];for(let k=0;k<n;k++){const a=k/n*Math.PI,c=Math.cos(a)*.5,s=Math.sin(a)*.5;
  pos.push(-c,0,-s, c,0,s, c,1,s, -c,0,-s, c,1,s, -c,1,-s);uv.push(0,1,1,1,1,0,0,1,1,0,0,0);for(let i=0;i<6;i++)nor.push(0,1,0);}return BIO.geo._make(pos,nor,uv);},
 // a stone: an icosahedron, each vertex pushed in or out together (the faces stay closed), flattened a little
 rock(seed,flat){const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position,J={};reseed(seed);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);if(!J[k])J[k]=rr(.78,1.12);const s=J[k];p.setXYZ(i,x*s,y*s*(flat||.72),z*s);}
  g.computeVertexNormals();return g;},
 // a sulphur crust round a vent's throat: a squat open-topped cone, its foot at y 0
 crust(){const g=new T3.CylinderGeometry(.35,1,1,9,1,true);g.translate(0,.5,0);return g;},
 // a dead bird on its back or side: a body and two spread wings, 1 long
 bird(){const b=new T3.SphereGeometry(.22,6,4).toNonIndexed();b.scale(1,.55,.6);b.translate(0,.06,0);
  const pos=Array.from(b.attributes.position.array),nor=Array.from(b.attributes.normal.array),uv=Array.from(b.attributes.uv.array);
  pos.push(0,.05,0, -.1,.03,.55, .25,.03,.45, 0,.05,0, .25,.03,-.45, -.1,.03,-.55);for(let i=0;i<6;i++)nor.push(0,1,0);uv.push(0,0,1,0,1,1,0,0,1,1,0,1);
  return BIO.geo._make(pos,nor,uv);},
 // a hide shelter: an open cone, 1 across at its foot and 1 tall (65 scales it), poles through its top (separate items)
 shelter(){const g=new T3.ConeGeometry(.5,1,10,1,true);g.translate(0,.5,0);return g;},
 // a pole: 1 long, its foot at y 0
 pole(){const g=new T3.CylinderGeometry(.03,.04,1,5);g.translate(0,.5,0);return g;},
 // a hide stretched flat (on a rack): a unit quad in the xy plane, its foot at y 0
 hide(){const g=new T3.PlaneGeometry(1,1,1,1);g.translate(0,.5,0);return g;},
 // the hearth's bed of ash: a flat disc
 disc(){const g=new T3.CircleGeometry(1,12);g.rotateX(-Math.PI/2);return g;},
 // an aurochs horn: a curve swept up and out, 1 long, its root at the origin
 horn(){const P=[];for(let i=0;i<=6;i++){const t=i/6;P.push(new T3.Vector3(t*.55,Math.sin(t*1.6)*.5+t*.25,Math.sin(t*2.4)*.12));}
  return new T3.TubeGeometry(new T3.CatmullRomCurve3(P),10,.06,6,false);},
 // a standing slab (the Fellgangs' sign), 1 tall
 slab(){const g=new T3.BoxGeometry(.5,1,.16);g.translate(0,.5,0);return g;},
};

// ---------------------------------------------------------------- instanced items
BIO.def('grass',G.cross(3),M.grass,{label:'Warm meadow grass'});
BIO.def('fern',G.cross(3),M.fern,{label:'Bliss fern'});
BIO.def('flower',G.cross(2),M.flower,{label:'Highland flowers'});
BIO.def('fireweed',G.cross(2),M.fireweed,{label:'Fireweed'});
BIO.def('reed',G.cross(4),M.reed,{label:'Warm reeds'});
BIO.def('ashgrass',G.cross(3),M.ashgrass,{label:'Ash tussock'});
BIO.def('pumice',G.rock(8301),M['stone.pumice'],{label:'Pumice'});
BIO.def('obsidian',G.rock(8302,.6),M['stone.obsidian'],{label:'Obsidian'});
BIO.def('scoria',G.rock(8303),M['rock.scoria'],{label:'Scoria'});
BIO.def('sulphur',G.crust(),M.sulphur,{label:'Sulphur crusts (round the fumaroles)'});
BIO.def('bird',G.bird(),M.bird,{label:'Dead birds (the gas pooled here)'});
BIO.def('shelter',G.shelter(),M.hide,{label:'Hide shelters'});
BIO.def('pole',G.pole(),M.wood,{label:'Poles (shelters and racks)'});
BIO.def('hide',G.hide(),M.hide,{label:'Hides on the drying racks'});
BIO.def('hearthstone',G.rock(8304),M['rock.cairn'],{label:'Hearth stones'});
BIO.def('hearthash',G.disc(),M.ash,{label:'A hearth\'s ash'});
BIO.def('cache',G.rock(8305,.55),M['rock.cairn'],{label:'A cache (gear under stones)'});
BIO.def('cairnstone',G.rock(8306,.5),M['rock.cairn'],{label:'Cairns'});
BIO.def('horn',G.horn(),M.horn,{label:'Aurochs-horn markers (the Kimr)'});
BIO.def('signstone',G.slab(),M['rock.cairn'],{label:'Stone signs (the Fellgangs)'});
BIO.def('bone',G.rock(8307,.35),M.bone,{label:'Bones (a butchery site)'});

// ---------------------------------------------------------------- the kin (core/biome 32: grown by the Throne's own builders, read in place)
// The valleys' pine is the Throne's ash pine, a little smaller in the thin air (x.8); the tree fern the Throne's, by the springs. The Throne's build is
// never called: its page does not change.
FIREBLISS.KIN={
 pine:BIO.kin?BIO.kin('throne.ashpine',{key:'blisspine',name:'Firebliss pine (a cousin of the Throne\'s ash pine)',scale:{H:.8,rb:.9,crownR:.85},
  tags:{climate:'temperate',aridity:'humid',koppen:['Cfb','Dfc'],riparian:'no'}}):null,
 fern:BIO.kin?BIO.kin('throne.treefern',{key:'blisstreefern',name:'Bliss tree fern (a cousin of the Throne\'s tree fern)',scale:.85,
  tags:{climate:'temperate',aridity:'humid',koppen:['Cfb','Cfa'],riparian:'both'}}):null};
FIREBLISS.SPECIES=[FIREBLISS.KIN.pine,FIREBLISS.KIN.fern].filter(Boolean).map(k=>k.record);

// ---------------------------------------------------------------- the hunters' culture rows (core/camp, KCAMP.CULTURES: section 3 of its PLAN)
// Registered here, as this kit's data, until core/camp/10 takes them (KNOWN_ISSUES.md). A hunting party pitches a handful of hide shelters round a
// hearth, a drying rack or two and a cache; no hedge, no pens, no pasture. The Fellgangs come over the fells from the north and east; the Kimr up the
// Warras' gorges from the Labyrinth.
if(typeof KCAMP!=='undefined'){
 const WIND_TO=[.7071,.7071];   /* the plume's wind blows to the south-east (PLAN.md section 1) */
 const row=(prefix,formation)=>({kind:k=>new RegExp('^'+prefix+'_shelter').test(k)?'dwelling':new RegExp('^'+prefix+'_(rack|cache)').test(k)?'trade':null,
  households:{[prefix+'_shelter']:1},household:[2,4],chiefHousehold:[3,4],sleepers:[2,3],
  work:{[prefix+'_rack']:{role:'skinner',n:1},[prefix+'_cache']:{role:'hunter',n:1}},
  elderShare:.1,mountsPer:0,wind:WIND_TO,formation});
 KCAMP.CULTURES['fellgang-hunt']=row('fb_fellgang','horseshoe');
 KCAMP.CULTURES['kimr-hunt']=row('fb_kimr','ring');}
FIREBLISS.PROGRAM={   /* what a party pitches (core/camp's program shape: tents, no pens, hedge or pasture) */
 'fellgang-hunt':{tents:[{key:'fb_fellgang_shelter',n:5,v:0},{key:'fb_fellgang_rack',n:2,v:0},{key:'fb_fellgang_cache',n:1,v:0}],pens:[],hedge:null,pasture:null},
 'kimr-hunt':{tents:[{key:'fb_kimr_shelter',n:6,v:0},{key:'fb_kimr_rack',n:2,v:0},{key:'fb_kimr_cache',n:1,v:0}],pens:[],hedge:null,pasture:null}};
FIREBLISS.DIMS=(key,v)=>/_shelter/.test(key)?{w:4.2,d:4.2,h:3.4}:/_rack/.test(key)?{w:4,d:1.6,h:2.2}:{w:2,d:2,h:1};
})();
