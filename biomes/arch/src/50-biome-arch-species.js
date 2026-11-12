// ================================================================= ARCH — species (data + kit items; PLAN.md section 7)
// Two floras by the ground's chemistry (ARCH.lifeAt, ARCH.earthOk: 40). EARTH, New Caledonia's ultramafic maquis on the laterite: the candelabra
// araucaria, the she-oak that fixes its own nitrogen (Gymnostoma), the blue-sap hoarder (Pycnandra) and its kin, the maquis sedge, the pitcher plant on
// the seeps (Nepenthes vieillardii, with a trap record). NATIVE, fungoid hosts with three partners: the curtain and its young hem in the confluences (a
// proton-gradient partner), the lime shelf on the aprons and the verdigris cap on the richest nickel (photosynthetic), the seep comb by the flames
// (hydrogen-eating), the acid felt on the acid ground (iron-oxidising), the steam fan in the solfatara's steam. Working names (PLAN.md section 16).
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `ph` (the ground's band), `native` and `nickel` (ARCH.NI's role).
// Everything here is DATA and kit definitions; placement is 60-biome-arch-place.js.
BIO.kit('arch');   // this kit's own registry of items and buckets (core/biome: kits)
var ARCHB={SITES:ARCH_SITES};
(function(){const {TAU,clamp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);ARCHB.C=C;
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:true,native:true},o||{});
const E=(c,a,r,kp,o)=>Object.assign(K(c,a,r,kp,o),{alien:false,native:false});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex)
const PAL=ARCHB.PAL={
 curtainHem:[0x9ab88a,0xa8c49a,0x8aac7e],hem:[0xdfe6da,0xcfdccc,0xb8cca8],lime:[0xeef0ea,0xe2e8e4,0xd8e2e2],limeUnder:[0xb8c8b0,0xa8bca4],
 verd:[0x5a9a7a,0x4a8a72,0x6aa886,0x3f7f6a],verdFlesh:[0xe8e0cc,0xdcd4c0],comb:[0xe6dcc0,0xf0e6cc,0xd8ccb0],felt:[0xc06a2a,0xb85a24,0xd0843a,0xa84e1e],
 fan:[0x8a9a7a,0x7a8a6e,0x96a486],
 trunk:[0x7a6a5a,0x6a5c4e,0x84746a],needles:[0x2e4a32,0x36553a,0x284430,0x3a5a3e],casuar:[0x4a5e40,0x56684a,0x405438],
 glossy:[0x2e5a34,0x3a6a3e,0x2a5030,0x46743e],sedge:[0x8a8a52,0x7a7c48,0x9a9660,0x6e7044],pitcher:[0x9a3a2a,0x8a4a2a,0x6a8a3a,0xb8562e]};
// ---------------------------------------------------------------- the species
const SPECIES=ARCHB.SPECIES=[
 // NATIVE
 {key:'curtain',name:'Curtain',how:'a living wall standing in a confluence where alkaline water from the mantle meets acid water from the vents: a ribbed sheet 0.5-4 m tall, glossy black-green on its acid face (iron-nickel sulphide), chalk white on its alkaline face (brucite and aragonite), a pale-green living hem along its top. It keeps the two waters apart and lives on the difference: protons through the wall (PLAN.md 2.1)',
  items:['arcurtain','arcurtainhem'],tags:K('tropical','humid','yes',['Am','Aw'],{ph:[2,11.9],partner:'proton-gradient chemolithotroph'})},
 {key:'hem',name:'Hem frill (young curtain)',how:'low mineral frills along a meeting line where a curtain could stand and none has yet: the curtain\'s young, a hand high',
  items:['arhem'],tags:K('tropical','humid','yes',['Am','Aw'],{ph:[2,11.9],partner:'proton-gradient chemolithotroph'})},
 {key:'limeshelf',name:'Lime shelf',how:'white-crusted fungoid shelves on the travertine rims (pH 9.5-11): the alkaline water\'s carbonate laid on its own skin, a photosynthetic partner under it',
  items:['arlime'],tags:K('tropical','humid','both',['Am','Aw'],{ph:[9.5,12],partner:'photosynthetic, alkaliphile'})},
 {key:'verdigris',name:'Verdigris cap',how:'a fungoid cap 0.3-2 m on the richest nickel, beside the Earth hoarders: a green nickel crust over pale flesh, bleeding blue-green where it is cut; nothing grazes it but the verdigris browser',
  items:['arverd','arverdstalk'],tags:K('tropical','humid','no',['Am','Aw'],{ph:[4.5,8],partner:'photosynthetic',nickel:'hyper'})},
 {key:'seepcomb',name:'Seep comb',how:'cream combs round the hydrogen seeps outside the flames, a thin-film sheen where the hydrogen wets them: their partner eats hydrogen with the air\'s oxygen (knallgas)',
  items:['arcomb'],tags:K('tropical','humid','no',['Am','Aw'],{ph:[6,10],partner:'hydrogen-oxidising'})},
 {key:'acidfelt',name:'Acid felt',how:'rust-orange and ochre mats and streamers on the acid stream\'s banks and the solfatara\'s ground (pH 1-4): an iron-oxidising partner, Rio Tinto\'s colours',
  items:['arfelt'],tags:K('tropical','humid','yes',['Am','Aw'],{ph:[1,4],partner:'iron-oxidising acidophile'})},
 {key:'steamfan',name:'Steam fan',how:'low grey-green fans in the steam on ground at 45-90 degC',
  items:['arfan'],tags:K('tropical','humid','no',['Am','Aw'],{ph:[2,8],heat:[45,90],partner:'photosynthetic, thermophile'})},
 // EARTH (New Caledonia's maquis minier)
 {key:'araucaria',name:'Candelabra araucaria (Araucaria rulei / muelleri)',how:'the ultramafic maquis\'s emblem: a straight grey trunk and stiff upturned arms of scale-leaved rope, a candelabra 8-20 m, scattered over the low scrub',
  items:['artrunk','arbough'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'gymnostoma',name:'Maquis she-oak (Gymnostoma deplancheanum)',how:'a dark, wiry she-oak 1.5-6 m whose root nodules (Frankia) fix the nitrogen the laterite lacks: the maquis\'s commonest shrub',
  items:['argymno'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'indicator',fixer:'nitrogen'})},
 {key:'pycnandra',name:'Sève bleue (Pycnandra acuminata)',how:'a glossy-leaved shrub to small tree 3-8 m in the wetter hollows whose latex is a quarter nickel: cut, it bleeds blue-green',
  items:['arpycn','arpycntrunk'],tags:E('tropical','humid','both',['Am'],{ph:[4.5,7.5],nickel:'hyper'})},
 {key:'costularia',name:'Maquis sedge (Costularia)',how:'stiff tussocks of sedge between the shrubs on the bare laterite',
  items:['arsedge'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'nepenthes',name:'Pitcher plant (Nepenthes vieillardii)',how:'red-green pitchers on the seeps of the laterite, where the ground is poorest and wettest: it eats what drowns in it (a trap record)',
  items:['arpitch'],tags:E('tropical','humid','both',['Am'],{ph:[4.5,7],nickel:'excluder'})}];
SPECIES.forEach((S,i)=>{S.i=i;});
ARCHB.HARVEST={curtain:HV('none',[],false,'Nothing eats a curtain but the seam wader, which grazes its hem. Its black face, dried, is an iron-nickel sulphide.'),
 hem:HV('none',[],false,''),limeshelf:HV('none',[],false,'Burnt, lime.'),verdigris:HV('none',[],false,'Poisonous: its crust is nickel. Burnt, its ash is nickel ore (bio-ore, 10-20% Ni).'),
 seepcomb:HV('none',[],false,'Where the combs stand, the gas burns.'),acidfelt:HV('none',[],false,'Dried, an ochre pigment.'),steamfan:HV('none',[],false,''),
 araucaria:HV('timber (straight, resinous)',[],false,''),gymnostoma:HV('fuel (hard, hot)',[],false,'It feeds the ground: the maquis is thicker round it.'),
 pycnandra:HV('none',[],false,'Its latex is a quarter nickel: tapped and burnt, the richest nickel ore there is (agromining).'),costularia:HV('thatch',[],false,''),
 nepenthes:HV('none',['the pitchers\' fluid is drunk in need, filtered'],false,'')};
SPECIES.forEach(S=>{S.tags.harvest=ARCHB.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);ARCHB.byKey=byKey;
ARCHB.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};
// the pitcher's trap record (core/biome 37: KTRAPS): a pitfall for insect-sized prey, harmless to a person
ARCHB.TRAP=typeof KTRAPS!=='undefined'?KTRAPS.make({kind:'pitfall',mouth:.06,preyMax:'insect',cycle:{wait:86400,shut:0,digest:0,reopen:0},lure:'nectar',danger:0}):null;
// ---------------------------------------------------------------- textures and materials (procedural cards; the pack's library maps swap in by slot)
const TX={};
TX.needles=BIO.alphaTex(256,(g,S)=>{g.strokeStyle='rgba(225,235,220,1)';g.lineWidth=2.5;for(let k=0;k<220;k++){const x0=S*(.1+.8*((k*37)%100)/100),y0=S*(.1+.8*((k*53)%100)/100),a=((k*29)%100)/100*TAU,l=S*(.08+.1*((k*17)%100)/100);
 g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+Math.cos(a)*l,y0+Math.sin(a)*l);g.stroke();}},[225,235,220]);
TX.glossy=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<46;k++){const x=S*(.12+.76*((k*61)%100)/100),y=S*(.12+.76*((k*29+7)%100)/100),r=S*.07,a=((k*41)%100)/100*TAU;
 g.fillStyle='rgba(225,240,220,1)';g.beginPath();g.ellipse(x,y,r,r*.45,a,0,TAU);g.fill();}},[225,240,220]);
TX.sedge=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<60;k++){const x0=S*(.3+.4*((k*37)%100)/100),a=-1+2*((k*53)%100)/100;g.strokeStyle='rgba(235,235,215,1)';g.lineWidth=2.5;
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+a*S*.1,S*.5,x0+a*S*.3,S*(.05+.2*((k*17)%100)/100));g.stroke();}},[235,235,215]);
const vcol=(o)=>new T3.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.8,metalness:0,vertexColors:true},o||{}));
const M=ARCHB.M={
 needles:BIO.leafMat(TX.needles,'ar-needles',{aN:false,swayW:'.6',swayA:.04}),
 glossy:BIO.leafMat(TX.glossy,'ar-glossy',{aN:false,swayW:'.6',swayA:.05}),
 sedge:BIO.leafMat(TX.sedge,'ar-sedge',{aN:false,swayW:'1.0',swayA:.08}),
 curtain:vcol({roughness:.32}),lime:vcol({roughness:.7}),flesh:vcol({roughness:.6}),comb:vcol({roughness:.25,metalness:.15}),felt:vcol({roughness:.95}),
 bark:vcol({roughness:.9}),rope:vcol({roughness:.85})};
ARCHB.SWAP=BIO.libSwap('arch',M);
// ---------------------------------------------------------------- the items
// THE CURTAIN: a unit wall 1 long (+x) and 1 tall (+y), two sheets 3 cm apart with a wave through them; the +z sheet white (the alkaline face), the -z
// sheet black-green (the acid face); ribs up the sheet; a row of blisters near the foot. The kit turns +z toward the alkaline water (60)
{const nx=16,ny=8,pos=[],col=[],nor=[],idx=[];const W=(x,y)=>.07*Math.sin(x*TAU*1.3+y*1.1)+.03*Math.sin(x*TAU*4.1+1.7);
 for(const side of [1,-1]){const b=pos.length/3;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=i/nx,y=j/ny,rib=.012*Math.cos(x*TAU*9),z=W(x,y)+side*(.015+rib);
   pos.push(x,y*(1-.06*Math.sin(x*TAU)),z);nor.push(0,0,side);
   const t=y,k=.85+.15*Math.cos(x*TAU*9);if(side>0)col.push(.92*k,.93*k,.9*k);else col.push((.08+.06*t)*k,(.12+.08*t)*k,(.1+.05*t)*k);}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=b+j*(nx+1)+i,c=a+nx+1;if(side>0)idx.push(a,a+1,c,a+1,c+1,c);else idx.push(a,c,a+1,a+1,c,c+1);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 BIO.def('arcurtain',g,M.curtain,{label:'Curtain (acid face black-green, alkaline face white)'});}
// the hem: a rolled lip along the curtain's top, 1 long (+x)
{const g=new T3.CylinderGeometry(.5,.5,1,7,1,true);g.rotateZ(Math.PI/2);g.translate(.5,0,0);const c=[],p=g.attributes.position;for(let i=0;i<p.count;i++)c.push(1,1,1);
 g.setAttribute('color',new T3.Float32BufferAttribute(c,3));BIO.def('arcurtainhem',g,M.flesh,{label:'Curtain (its living hem)'});}
BIO.def('arhem',BIO.fung.comb({w:1,d:.25,tilt:.1,lobes:4,seg:6}),M.lime,{label:'Hem frill (young curtain)'});
BIO.def('arlime',BIO.fung.bracket({arc:Math.PI*.9,seg:8,thick:.25,droop:.08,wav:4,wavA:.08}),M.lime,{label:'Lime shelf'});
BIO.def('arverd',BIO.fung.cap({form:'dome',h:.42,seg:12,rings:3,lump:.25,wav:6,wavA:.05,under:'gills',seed:20201}),M.flesh,{label:'Verdigris cap'});
BIO.def('arverdstalk',BIO.fung.stalk({r0:.16,r1:.11,seg:7,rings:3}),M.flesh,{label:'Verdigris cap (stalk)'});
BIO.def('arcomb',BIO.fung.comb({w:1,d:.45,tilt:.3,lobes:3,seg:6}),M.comb,{label:'Seep comb'});
BIO.def('arfelt',BIO.fung.cap({form:'disc',h:.08,seg:10,rings:2,lump:.5,wav:7,wavA:.15,under:'none',uv:'planar',seed:20202}),M.felt,{label:'Acid felt'});
BIO.def('arfan',BIO.fung.cap({form:'funnel',h:.3,seg:9,rings:2,wav:5,wavA:.2,under:'none',seed:20203}),M.flesh,{label:'Steam fan'});
// EARTH: the araucaria's trunk and its arms (a rope of scale leaves, a stalk with a bow up at its tip), the she-oak and the hoarder as crossed cards on a stem
BIO.def('artrunk',BIO.fung.stalk({r0:.05,r1:.025,seg:7,rings:6}),M.bark,{label:'Candelabra araucaria (trunk)'});
BIO.def('arbough',BIO.fung.stalk({r0:.11,r1:.08,seg:6,rings:6,bend:.35}),M.rope,{label:'Candelabra araucaria (arm)'});
BIO.def('argymno',BIO.geo.clump(),M.needles,{label:'Maquis she-oak'});
BIO.def('arpycn',BIO.geo.clump(),M.glossy,{label:'Sève bleue'});
BIO.def('arpycntrunk',BIO.fung.stalk({r0:.06,r1:.04,seg:6,rings:3}),M.bark,{label:'Sève bleue (stem)'});
BIO.def('arsedge',BIO.geo.clump(),M.sedge,{label:'Maquis sedge'});
BIO.def('arpitch',BIO.fung.bladder({swell:.55,neck:.42,pleats:0,seg:9,rings:5,h:1.6}),M.flesh,{label:'Pitcher plant'});
})();
