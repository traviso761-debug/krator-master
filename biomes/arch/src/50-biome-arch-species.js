// ================================================================= ARCH — species (data + kit items; PLAN.md section 7)
// Two floras by the ground's chemistry (ARCH.lifeAt, ARCH.earthOk: 40). EARTH, New Caledonia's ultramafic maquis on the laterite: the candelabra
// araucaria, the she-oak that fixes its own nitrogen (Gymnostoma), the blue-sap hoarder (Pycnandra) and its kin, the maquis sedge, the pitcher plant on
// the seeps (Nepenthes vieillardii, with a trap record), plus Hawaiian / Indo-Pacific pioneers and strand trees (Ohia lehua, Uluhe staghorn fern, Beach
// she-oak Casuarina, Naupaka, Coconut, Red mangrove). NATIVE, fungoid hosts with three partners: the curtain and its young hem in the confluences (a
// proton-gradient partner), the lime shelf on the aprons and the verdigris cap on the richest nickel (photosynthetic), the seep comb by the flames
// (hydrogen-eating), the acid felt on the acid ground (iron-oxidising), the steam fan in the solfatara's steam. Working names (PLAN.md section 16).
// Everything here is DATA, procedural botanical textures, and kit definitions; placement is 60-biome-arch-place.js.
BIO.kit('arch');   // this kit's own registry of items and buckets (core/biome: kits)
var ARCHB={SITES:ARCH_SITES};
(function(){const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);ARCHB.C=C;
const H01=(a,b,c)=>KRAND.unit(KRAND.hash(0x4a2c19,a|0,b|0,c|0));
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:true,native:true},o||{});
const E=(c,a,r,kp,o)=>Object.assign(K(c,a,r,kp,o),{alien:false,native:false});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex)
const PAL=ARCHB.PAL={
 curtainHem:[0x9ab88a,0xa8c49a,0x8aac7e],hem:[0xdfe6da,0xcfdccc,0xb8cca8],lime:[0xeef0ea,0xe2e8e4,0xd8e2e2],limeUnder:[0xb8c8b0,0xa8bca4],
 verd:[0x5a9a7a,0x4a8a72,0x6aa886,0x3f7f6a],verdFlesh:[0xe8e0cc,0xdcd4c0],comb:[0xe6dcc0,0xf0e6cc,0xd8ccb0],felt:[0xc06a2a,0xb85a24,0xd0843a,0xa84e1e],
 fan:[0x8a9a7a,0x7a8a6e,0x96a486],
 trunk:[0x827668,0x74685c,0x8c8072],ohiaBark:[0x8e867c,0x7e766c,0x989086],casBark:[0x6c6258,0x5e544c,0x786e64],
 needles:[0x2e4a32,0x36553a,0x284430,0x3a5a3e],casuar:[0x465e3e,0x526a46,0x3d5436],
 casuar2:[0x5a7456,0x668060,0x506a4c,0x6e8868],naupaka:[0x589848,0x66a654,0x4c8c40],ipomoea:[0x4a8a3a,0x5a9846],palm:[0x5a7a3a,0x668844,0x4e6e34],palmtrunk:[0x8a7a62,0x7e705a],
 ohia:[0x5c784e,0x688458,0x526e46,0x728a5e],ohiaFlush:[0x84764a,0x768252],ohiaFlower:[0xdc2e24,0xe83e2c,0xc8241e,0xf05228],
 uluhe:[0x8eb83c,0x9cc446,0x7ea834,0xa6cc50],mangrove:[0x2a4a2a,0x30522e,0x26442a],prop:[0x6a5a48,0x5e5040],
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
 // EARTH (New Caledonia's maquis minier & Indo-Pacific / Hawaiian pioneers)
 {key:'araucaria',name:'Candelabra araucaria (Araucaria rulei / muelleri)',how:'the ultramafic maquis\'s emblem: a straight grey trunk and stiff upturned arms of scale-leaved rope, a candelabra 8-20 m, scattered over the low scrub',
  items:['artrunk','arbough'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'gymnostoma',name:'Maquis she-oak (Gymnostoma deplancheanum)',how:'a dark, wiry she-oak 1.5-6 m whose root nodules (Frankia) fix the nitrogen the laterite lacks: the maquis\'s commonest shrub',
  items:['argymno'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'indicator',fixer:'nitrogen'})},
 {key:'pycnandra',name:'Sève bleue (Pycnandra acuminata)',how:'a glossy-leaved shrub to small tree 3-8 m in the wetter hollows whose latex is a quarter nickel: cut, it bleeds blue-green',
  items:['arpycn','arpycntrunk'],tags:E('tropical','humid','both',['Am'],{ph:[4.5,7.5],nickel:'hyper'})},
 {key:'costularia',name:'Maquis sedge (Costularia)',how:'stiff tussocks of sedge between the shrubs on the bare laterite',
  items:['arsedge'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'ohia',name:'Ohia lehua (Metrosideros polymorpha)',how:'the first tree on new lava in the wet tropics (Hawaii): a crooked grey-barked tree 3-11 m, leathery grey-green leaves, scarlet brush flowers; it roots in the flow\'s cracks once the lava is a few decades old',
  items:['arohia','arohiatrunk','arohia_bloom'],tags:E('tropical','humid','no',['Am'],{ph:[4.5,8],lava:'pioneer'})},
 {key:'uluhe',name:'Uluhe (Dicranopteris linearis)',how:'a dichotomously forking staghorn fern that scrambles over lava and coastal bluffs in thickets, bright yellow-green: with the ohia, the lava\'s first cover',
  items:['aruluhe'],tags:E('tropical','humid','no',['Am'],{ph:[4.5,8],lava:'pioneer'})},
 {key:'mangrove',name:'Red mangrove (Rhizophora)',how:'the sound\'s sheltered shores: a dense dark crown on arching prop roots, standing in the tidal mud',
  items:['armangrove','armangroveprop'],tags:E('tropical','humid','yes',['Am'],{ph:[6,8.5],tidal:true})},
 {key:'casuarina',name:'Beach she-oak (Casuarina equisetifolia)',how:'a drooping, wiry, grey-green she-oak 6-18 m on coastal headlands and dunes behind black sand; it fixes its own nitrogen and holds the shore',
  items:['arcastrunk','arcas','arcas_drape'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'naupaka',name:'Beach naupaka (Scaevola taccada)',how:'a rounded shrub of fleshy bright-green leaves on the dune\'s front, white half-flowers',
  items:['arnaupaka'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'ipomoea',name:'Beach morning glory (Ipomoea pes-caprae)',how:'a creeping vine of round leaves running over the black sand toward the tide line, pink flowers',
  items:['aripomoea'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'coconut',name:'Coconut palm (Cocos nucifera), drift-sown',how:'leaning palms along the back of the beach, sown by the sea (default taken, owner to confirm: PLAN.md section 16)',
  items:['arpalmtrunk','arpalm'],tags:E('tropical','humid','both',['Am'],{ph:[5,9],strand:true})},
 {key:'nepenthes',name:'Pitcher plant (Nepenthes vieillardii)',how:'red-green pitchers on the seeps of the laterite, where the ground is poorest and wettest: it eats what drowns in it (a trap record)',
  items:['arpitch'],tags:E('tropical','humid','both',['Am'],{ph:[4.5,7],nickel:'excluder'})}];
SPECIES.forEach((S,i)=>{S.i=i;});
ARCHB.HARVEST={curtain:HV('none',[],false,'Nothing eats a curtain but the seam wader, which grazes its hem. Its black face, dried, is an iron-nickel sulphide.'),
 hem:HV('none',[],false,''),limeshelf:HV('none',[],false,'Burnt, lime.'),verdigris:HV('none',[],false,'Poisonous: its crust is nickel. Burnt, its ash is nickel ore (bio-ore, 10-20% Ni).'),
 seepcomb:HV('none',[],false,'Where the combs stand, the gas burns.'),acidfelt:HV('none',[],false,'Dried, an ochre pigment.'),steamfan:HV('none',[],false,''),
 araucaria:HV('timber (straight, resinous)',[],false,''),gymnostoma:HV('fuel (hard, hot)',[],false,'It feeds the ground: the maquis is thicker round it.'),
 pycnandra:HV('none',[],false,'Its latex is a quarter nickel: tapped and burnt, the richest nickel ore there is (agromining).'),costularia:HV('thatch',[],false,''),
 nepenthes:HV('none',['the pitchers\' fluid is drunk in need, filtered'],false,''),
 casuarina:HV('fuel (the best: hot and slow)',[],false,''),naupaka:HV('none',[],true,'Its leaves are a poultice.'),ipomoea:HV('none',[],true,''),coconut:HV('timber, thatch, coir',['coconuts'],false,''),
 ohia:HV('fuel, carving',[],false,'Its red flowers are the first colour on a new flow.'),uluhe:HV('thatch (and mulch)',[],false,''),mangrove:HV('timber (dense, rot-proof), tannin',[],false,'The bark is a tannin for nets and hides.')};
SPECIES.forEach(S=>{S.tags.harvest=ARCHB.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);ARCHB.byKey=byKey;
ARCHB.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};
ARCHB.TRAP=typeof KTRAPS!=='undefined'?KTRAPS.make({kind:'pitfall',mouth:.06,preyMax:'insect',cycle:{wait:86400,shut:0,digest:0,reopen:0},lure:'nectar',danger:0}):null;

// ---------------------------------------------------------------- High-detail procedural bark & unclipped botanical foliage cards
// NOTE on DataTexture UV convention (30-core-foliage.js): canvas row y = 0 is v = 0 (the low/stem edge of clump(), hang(), and
// custom fronds); canvas row y = S is v = 1 (the outer/tip edge). Every card keeps a strict transparent perimeter margin so zero
// clipped straight quad edges can ever appear, and clamps to edge so mipmaps never wrap across borders.
function cardTex(S,draw,fillRGB){const t=BIO.alphaTex(S,draw,fillRGB);t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;return t;}

const TX={};
/* 1. Fissured silvery-ash & warm inner-bark texture for 'Ōhi'a Lehua */
TX.ohiaBark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#8c857c';g.fillRect(0,0,W,H);
 for(let i=0;i<180;i++){const x=H01(i,1,11)*W,y=H01(i,2,11)*H,w=3+9*H01(i,3,11),h=28+70*H01(i,4,11);
  const v=Math.round(112+56*H01(i,5,11));g.fillStyle='rgb('+(v+6)+','+(v+2)+','+(v-4)+')';g.fillRect(x,y,w,h);
  if(y+h>H)g.fillRect(x,y-H,w,h);}
 for(let i=0;i<110;i++){const x=H01(i,6,12)*W,y=H01(i,7,12)*H,h=22+58*H01(i,8,12);
  g.strokeStyle=i%3===0?'rgba(58,48,40,0.68)':'rgba(74,66,58,0.52)';g.lineWidth=1.2+2.0*H01(i,9,12);
  g.beginPath();g.moveTo(x,y);g.lineTo(x+(H01(i,10,12)-.5)*6,y+h);g.stroke();}
 /* Subtle pale crustose lava-lichen flecks */
 for(let i=0;i<36;i++){const x=H01(i,1,13)*W,y=H01(i,2,13)*H,r=2.5+5.5*H01(i,3,13);
  g.fillStyle='rgba(196,202,186,0.34)';g.beginPath();g.ellipse(x,y,r,r*.65,H01(i,4,13)*TAU,0,TAU);g.fill();}
},[1,1]);

/* 2. Deeply furrowed coastal ironwood bark for Casuarina & Gymnostoma she-oaks */
TX.casBark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#766c62';g.fillRect(0,0,W,H);
 for(let i=0;i<32;i++){const x=(i+.5)*(W/32);
  g.fillStyle=i%2?'rgba(142,134,124,0.55)':'rgba(64,54,46,0.65)';g.fillRect(x-2.2,0,4.4,H);}
 for(let i=0;i<150;i++){const x=H01(i,1,14)*W,y=H01(i,2,14)*H,h=18+44*H01(i,3,14);
  g.strokeStyle=i%2?'rgba(46,38,32,0.62)':'rgba(164,156,146,0.38)';g.lineWidth=1.4+1.6*H01(i,4,14);
  g.beginPath();g.moveTo(x,y);g.lineTo(x+(H01(i,5,14)-.5)*4,y+h);g.stroke();}
},[1,1]);

/* 3. Ringed & scaly tropical bark for Araucaria, Palm, Pycnandra & Mangrove */
TX.bark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#84786a';g.fillRect(0,0,W,H);
 for(let j=0;j<28;j++){const y=(j+.5)*(H/28);
  g.fillStyle=j%2?'rgba(62,54,46,0.42)':'rgba(156,146,132,0.36)';g.fillRect(0,y-1.6,W,3.2);}
 for(let i=0;i<95;i++){const x=H01(i,1,15)*W,y=H01(i,2,15)*H,w=6+14*H01(i,3,15),h=8+16*H01(i,4,15);
  const v=Math.round(108+48*H01(i,5,15));g.fillStyle='rgba('+v+','+(v-6)+','+(v-12)+',0.45)';g.fillRect(x,y,w,h);}
},[1,1]);

/* 4. Imbricated scale-leaf rope texture for Candelabra Araucaria boughs */
TX.rope=BIO.canvasTex(128,128,(g,W,H)=>{
 g.fillStyle='#6c7c64';g.fillRect(0,0,W,H);
 for(let row=0;row<16;row++)for(let col=0;col<10;col++){
  const cx=((col+(row%2)*.5)/10)*W,cy=(row/16)*H;
  const v=Math.round(138+54*H01(row,col,16));
  g.fillStyle='rgb('+(v-12)+','+(v+12)+','+(v-16)+')';
  g.beginPath();g.moveTo(cx,cy+9);g.lineTo(cx-6.5,cy);g.lineTo(cx+6.5,cy);g.closePath();g.fill();
 }
},[1,1]);

/* 5. 'Ōhi'a Lehua (Metrosideros polymorpha) branching leathery elliptic-leaf spray (512px, unclipped) */
TX.ohiaLeaf=cardTex(512,(g,S)=>{
 const drawLeaf=(cx,cy,rx,ry,ang,lum)=>{
  g.save();g.translate(cx,cy);g.rotate(ang);
  const v0=Math.round(clamp(lum,110,248)),vEdge=Math.round(clamp(lum+22,130,255));
  const grd=g.createLinearGradient(0,-ry,0,ry);
  grd.addColorStop(0,'rgb('+vEdge+','+Math.min(255,vEdge+6)+','+Math.max(95,vEdge-12)+')');
  grd.addColorStop(.5,'rgb('+v0+','+Math.min(255,v0+8)+','+Math.max(90,v0-14)+')');
  grd.addColorStop(1,'rgb('+Math.max(95,v0-24)+','+Math.max(100,v0-16)+','+Math.max(80,v0-28)+')');
  g.fillStyle=grd;
  g.beginPath();g.moveTo(-rx,0);g.quadraticCurveTo(0,-ry*1.12,rx,0);g.quadraticCurveTo(0,ry*1.12,-rx,0);g.closePath();g.fill();
  g.strokeStyle='rgba(236,244,216,0.55)';g.lineWidth=1.3;
  g.beginPath();g.moveTo(-rx*.88,0);g.lineTo(rx*.82,0);g.stroke();
  g.restore();
 };
 /* Woody branchlets radiating from (0.5S, 0.08S) out into 7 twigs inside [0.10S..0.90S] */
 const twigs=[
  [.50,.07,.50,.80],[.50,.14,.23,.68],[.50,.14,.77,.68],
  [.36,.38,.16,.48],[.64,.38,.84,.48],[.42,.46,.31,.83],[.58,.46,.69,.83]
 ];
 g.lineCap='round';
 twigs.forEach((tw,ti)=>{
  g.strokeStyle='rgba(116,104,92,0.94)';g.lineWidth=S*(ti===0?.013:.009);
  g.beginPath();g.moveTo(tw[0]*S,tw[1]*S);g.quadraticCurveTo((tw[0]+tw[2])*.5*S+(ti%2?8:-8),(tw[1]+tw[3])*.5*S,tw[2]*S,tw[3]*S);g.stroke();
 });
 /* Under-layer shaded leaves first, then sunlit upper-layer opposite pairs + terminal rosettes */
 for(let layer=0;layer<2;layer++){
  twigs.forEach((tw,ti)=>{
   const nNodes=layer===0?5:6;
   for(let k=1;k<=nNodes;k++){
    const f=k/(nNodes+.6),bx=lerp(tw[0],tw[2],f)*S,by=lerp(tw[1],tw[3],f)*S;
    const dir=Math.atan2((tw[3]-tw[1]),(tw[2]-tw[0]));
    const sz=S*(.044+.018*(1-f*.45))*(layer?1.0:.92);
    for(const side of [-1,1]){
     const j=H01(ti*17+k,layer*3+(side>0?1:2),21);
     const la=dir+side*(.68+.28*j)+(layer?.08:-.08);
     const lx=bx+Math.cos(la)*sz*.88,ly=by+Math.sin(la)*sz*.88;
     if(lx<S*.09||lx>S*.91||ly<S*.07||ly>S*.91)continue;
     const lum=(layer===0?148:206)+34*H01(ti*13+k,side+5,22);
     drawLeaf(lx,ly,sz,sz*.54,la,lum);
    }
   }
   /* Terminal 4-leaf rosette at twig tip */
   if(layer===1){
    const tx=tw[2]*S,ty=tw[3]*S,dir=Math.atan2(tw[3]-tw[1],tw[2]-tw[0]);
    for(let r=0;r<4;r++){
     const ra=dir+(r-1.5)*.62,sz=S*.040;
     const lx=tx+Math.cos(ra)*sz*.75,ly=ty+Math.sin(ra)*sz*.75;
     if(lx>=S*.09&&lx<=S*.91&&ly>=S*.08&&ly<=S*.91)drawLeaf(lx,ly,sz,sz*.52,ra,224+20*H01(ti,r,23));
    }
   }
  });
 }
},[178,194,162]);

/* 6. Lehua scarlet stamen-brush pom-pom blossom cluster (256px, unclipped) */
TX.ohiaBloom=cardTex(256,(g,S)=>{
 const puffs=[[.50,.52,.32],[.31,.44,.22],[.69,.46,.22]];
 puffs.forEach((pf,pi)=>{
  const cx=pf[0]*S,cy=pf[1]*S,rad=pf[2]*S;
  /* Small pale-green tomentose calyx cup at base */
  g.fillStyle='rgba(128,136,112,0.92)';
  g.beginPath();g.arc(cx,cy+rad*.18,rad*.22,0,TAU);g.fill();
  /* 44 glowing stamen filaments radiating in a brush hemisphere + bright pollen tips */
  for(let k=0;k<44;k++){
   const a=-Math.PI*.12+Math.PI*1.24*(k/43)+(H01(pi,k,31)-.5)*.14;
   const len=rad*(.68+.34*H01(pi,k,32));
   const ex=cx+Math.cos(a)*len,ey=cy+Math.sin(a)*len;
   const lum=Math.round(198+54*H01(pi,k,33));
   g.strokeStyle='rgba('+lum+','+Math.round(lum*.88)+','+Math.round(lum*.84)+',0.95)';
   g.lineWidth=2.1;
   g.beginPath();g.moveTo(cx+Math.cos(a)*rad*.12,cy+Math.sin(a)*rad*.12);
   g.quadraticCurveTo((cx+ex)*.5,(cy+ey)*.5+3,ex,ey);g.stroke();
   g.fillStyle='rgba(255,246,196,0.98)';
   g.beginPath();g.arc(ex,ey,1.8,0,TAU);g.fill();
  }
 });
},[216,64,52]);

/* 7. Uluhe / Eluhe (Dicranopteris linearis) dichotomously Y-forked pectinate staghorn fern frond (512px, razor-sharp cutout!) */
TX.uluhe=cardTex(512,(g,S)=>{
 /* Draws one comb-like pectinate pinna blade from (x0,y0) to (x1,y1) with acute tapering segments and zero border clip */
 const drawPectinateBlade=(x0,y0,x1,y1,maxPinnaL,lumBase,seedSalt)=>{
  const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
  const nPairs=Math.max(12,Math.round(L/(S*.016)));
  for(let i=1;i<nPairs;i++){
   const t=i/nPairs;
   /* Smooth envelope: rises rapidly from fork, stays lush across mid-blade, tapers cleanly to pointed apex at t->1 */
   const env=Math.sin(Math.pow(t,.72)*Math.PI)*(1-.18*t);
   const pLen=maxPinnaL*env;
   if(pLen<2.2)continue;
   const bx=x0+dx*t,by=y0+dy*t;
   const halfW=S*.0068*(.65+.45*env);
   for(const side of [-1,1]){
    /* Pinnae angle slightly forward (~74 deg from rachis) like true Dicranopteris linearis */
    const sweep=.26,pxDir=nx*side*Math.cos(sweep)+ux*Math.sin(sweep),pyDir=ny*side*Math.cos(sweep)+uy*Math.sin(sweep);
    const tx=bx+pxDir*pLen,ty=by+pyDir*pLen;
    if(tx<S*.05||tx>S*.95||ty<S*.04||ty>S*.95)continue;
    const lum=Math.round(clamp(lumBase+26*t+14*(side>0?1:0)+12*(H01(i,side+2,seedSalt)-.5),138,248));
    g.fillStyle='rgb('+Math.round(lum*.94)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.66)+')';
    g.beginPath();
    g.moveTo(bx-ux*halfW,by-uy*halfW);
    g.quadraticCurveTo(bx+pxDir*pLen*.55+ux*halfW*.4,by+pyDir*pLen*.55+uy*halfW*.4,tx,ty);
    g.quadraticCurveTo(bx+pxDir*pLen*.52-ux*halfW*.5,by+pyDir*pLen*.52-uy*halfW*.5,bx+ux*halfW,by+uy*halfW);
    g.closePath();
    g.fill();
    /* Fine pale midvein down each comb pinna */
    g.strokeStyle='rgba(238,248,196,0.42)';g.lineWidth=.9;
    g.beginPath();g.moveTo(bx,by);g.lineTo(bx+pxDir*pLen*.82,by+pyDir*pLen*.82);g.stroke();
   }
  }
  /* Wiry russet-olive rachis stem */
  g.strokeStyle='rgba(128,118,68,0.96)';g.lineWidth=S*.0075;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
 };

 /* Main stipe from (0.50S, 0.04S) up to primary Y-fork at (0.50S, 0.25S) */
 g.lineCap='round';
 g.strokeStyle='rgba(114,96,56,0.98)';g.lineWidth=S*.011;
 g.beginPath();g.moveTo(.50*S,.04*S);g.lineTo(.50*S,.25*S);g.stroke();

 /* Characteristic reflexed basal accessory pinnae at the primary fork */
 drawPectinateBlade(.50*S,.24*S,.20*S,.20*S,S*.048,176,41);
 drawPectinateBlade(.50*S,.24*S,.80*S,.20*S,S*.048,176,42);

 /* Primary Y-arms to secondary forks at (0.33S, 0.44S) and (0.67S, 0.44S) */
 g.strokeStyle='rgba(120,106,60,0.96)';g.lineWidth=S*.009;
 g.beginPath();g.moveTo(.50*S,.25*S);g.lineTo(.34*S,.43*S);g.moveTo(.50*S,.25*S);g.lineTo(.66*S,.43*S);g.stroke();
 /* Dormant fiddlehead bud in the primary fork axil */
 g.fillStyle='rgba(156,142,74,0.95)';g.beginPath();g.arc(.50*S,.27*S,S*.012,0,TAU);g.fill();

 /* Four lush terminal forked pectinate staghorn blades fanning cleanly inside [0.10S..0.90S, 0.43S..0.91S] */
 drawPectinateBlade(.34*S,.43*S,.16*S,.83*S,S*.074,192,43);
 drawPectinateBlade(.34*S,.43*S,.43*S,.90*S,S*.078,206,44);
 drawPectinateBlade(.66*S,.43*S,.57*S,.90*S,S*.078,206,45);
 drawPectinateBlade(.66*S,.43*S,.84*S,.83*S,S*.074,192,46);
},[176,198,104]);

/* 8. Beach She-Oak (Casuarina equisetifolia) feathery jointed cladode-needle spray (512px, unclipped) */
TX.casuarina=cardTex(512,(g,S)=>{
 g.lineCap='round';
 const subBranches=[
  [.50,.06,.50,.56],[.50,.12,.26,.48],[.50,.12,.74,.48],[.38,.30,.18,.68],[.62,.30,.82,.68],[.46,.42,.36,.78],[.54,.42,.64,.78]
 ];
 subBranches.forEach((sb,si)=>{
  g.strokeStyle='rgba(104,94,82,0.92)';g.lineWidth=S*(si===0?.010:.0065);
  g.beginPath();g.moveTo(sb[0]*S,sb[1]*S);g.lineTo(sb[2]*S,sb[3]*S);g.stroke();
  /* Feathery, sweeping/drooping jointed Casuarina needle-branchlets along every woody twig */
  for(let k=0;k<28;k++){
   const f=.18+.82*(k/27),bx=lerp(sb[0],sb[2],f)*S,by=lerp(sb[1],sb[3],f)*S;
   const side=k%2===0?-1:1;
   const baseAng=Math.atan2(sb[3]-sb[1],sb[2]-sb[0])+side*(.35+.52*H01(si,k,51));
   const nLen=S*(.095+.075*H01(si,k,52))*(1-.18*f);
   const mx=bx+Math.cos(baseAng)*nLen*.55,my=by+Math.sin(baseAng)*nLen*.55+S*.018;
   const ex=bx+Math.cos(baseAng+side*.18)*nLen*.92,ey=by+Math.sin(baseAng)*nLen*.85+S*.045;
   if(ex<S*.07||ex>S*.93||ey<S*.06||ey>S*.93)continue;
   const lum=Math.round(166+68*H01(si,k,53));
   g.strokeStyle='rgba('+Math.round(lum*.92)+','+Math.min(255,Math.round(lum*1.02))+','+Math.round(lum*.88)+',0.90)';
   g.lineWidth=1.85;
   g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();
   /* Pale whorled scale-node dot mid-cladode */
   g.fillStyle='rgba(226,236,214,0.65)';g.fillRect((bx+mx)*.5-.8,(by+my)*.5-.8,1.6,1.6);
  }
 });
},[148,168,138]);

/* 9. Weeping pendulous Casuarina needle curtain for BIO.geo.hang() (v=0 at top twig -> v=0.91 at hanging tips) */
TX.casDrape=cardTex(512,(g,S)=>{
 g.lineCap='round';
 /* Short woody twig collar at top center (0.50S, 0.03S) */
 g.strokeStyle='rgba(102,92,80,0.92)';g.lineWidth=S*.010;
 g.beginPath();g.moveTo(.34*S,.03*S);g.quadraticCurveTo(.50*S,.07*S,.66*S,.03*S);g.stroke();
 for(let k=0;k<46;k++){
  const x0=S*(.22+.56*H01(k,1,61)),y0=S*(.03+.08*H01(k,2,61));
  const len=S*(.52+.36*H01(k,3,61));
  const sway=(H01(k,4,61)-.5)*S*.14;
  const ex=clamp(x0+sway,S*.09,S*.91),ey=Math.min(S*.92,y0+len);
  const lum=Math.round(168+68*H01(k,5,61));
  g.strokeStyle='rgba('+Math.round(lum*.92)+','+Math.min(255,Math.round(lum*1.02))+','+Math.round(lum*.88)+',0.88)';
  g.lineWidth=1.75+.6*H01(k,6,61);
  g.beginPath();g.moveTo(x0,y0);g.bezierCurveTo(x0+sway*.35,y0+len*.35,x0+sway*.85,y0+len*.68,ex,ey);g.stroke();
 }
},[148,168,138]);

/* 10. Maquis She-Oak (Gymnostoma deplancheanum) upturned candelabrum needle-whorl spray (512px, unclipped) */
TX.gymno=cardTex(512,(g,S)=>{
 g.lineCap='round';
 const stems=[[.50,.06,.50,.62],[.50,.14,.28,.56],[.50,.14,.72,.56],[.38,.34,.22,.72],[.62,.34,.78,.72]];
 stems.forEach((st,si)=>{
  g.strokeStyle='rgba(92,82,72,0.94)';g.lineWidth=S*.009;
  g.beginPath();g.moveTo(st[0]*S,st[1]*S);g.lineTo(st[2]*S,st[3]*S);g.stroke();
  /* Upturned brush-like photosynthetic branchlet tufts at stem tips */
  const tx=st[2]*S,ty=st[3]*S;
  for(let k=0;k<22;k++){
   const ang=Math.PI*.5+(H01(si,k,71)-.5)*1.65;
   const len=S*(.08+.085*H01(si,k,72));
   const ex=tx+Math.cos(ang)*len,ey=ty+Math.sin(ang)*len;
   if(ex<S*.08||ex>S*.92||ey<S*.08||ey>S*.92)continue;
   const lum=Math.round(160+72*H01(si,k,73));
   g.strokeStyle='rgba('+Math.round(lum*.90)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.84)+',0.92)';
   g.lineWidth=2.0;
   g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo((tx+ex)*.5,ty+len*.35,ex,ey);g.stroke();
  }
 });
},[136,156,120]);

/* 11. Broad glossy tropical leaf rosette for Sève bleue, Naupaka & Red Mangrove (512px, unclipped) */
TX.glossy=cardTex(512,(g,S)=>{
 const twigs=[[.50,.07,.50,.76],[.50,.16,.24,.64],[.50,.16,.76,.64],[.38,.42,.26,.82],[.62,.42,.74,.82]];
 twigs.forEach(tw=>{
  g.strokeStyle='rgba(108,96,82,0.92)';g.lineWidth=S*.010;
  g.beginPath();g.moveTo(tw[0]*S,tw[1]*S);g.lineTo(tw[2]*S,tw[3]*S);g.stroke();
 });
 for(let layer=0;layer<2;layer++){
  for(let k=0;k<34;k++){
   const tw=twigs[k%twigs.length],f=.22+.74*H01(k,layer+1,81);
   const bx=lerp(tw[0],tw[2],f)*S,by=lerp(tw[1],tw[3],f)*S;
   const ang=Math.atan2(tw[3]-tw[1],tw[2]-tw[0])+((k%2?1:-1)*(.55+.45*H01(k,layer+3,81)));
   const rx=S*(.062+.026*H01(k,5,81)),ry=rx*.48;
   const cx=bx+Math.cos(ang)*rx*.78,cy=by+Math.sin(ang)*rx*.78;
   if(cx<S*.10||cx>S*.90||cy<S*.09||cy>S*.90)continue;
   const lum=Math.round((layer?208:156)+36*H01(k,layer+7,81));
   g.save();g.translate(cx,cy);g.rotate(ang);
   g.fillStyle='rgb('+Math.round(lum*.94)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.90)+')';
   g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();
   g.strokeStyle='rgba(242,248,228,0.52)';g.lineWidth=1.4;
   g.beginPath();g.moveTo(-rx*.82,0);g.lineTo(rx*.82,0);g.stroke();
   g.restore();
  }
 }
},[182,202,174]);

/* 12. Upright arching Costularia sedge tussock blades (rooted at v=0.04 -> arching tips at v=0.90) */
TX.sedge=cardTex(256,(g,S)=>{
 g.lineCap='round';
 for(let k=0;k<64;k++){
  const x0=S*(.34+.32*H01(k,1,91)),spread=(H01(k,2,91)-.5)*2;
  const h=S*(.62+.28*H01(k,3,91));
  const lum=Math.round(176+64*H01(k,4,91));
  g.strokeStyle='rgba('+lum+','+lum+','+Math.round(lum*.86)+',0.94)';g.lineWidth=2.3;
  g.beginPath();g.moveTo(x0,S*.04);
  g.quadraticCurveTo(x0+spread*S*.12,S*.04+h*.58,clamp(x0+spread*S*.34,S*.06,S*.94),S*.04+h);
  g.stroke();
 }
},[208,208,184]);

const vcol=(o)=>new T3.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.8,metalness:0,vertexColors:true},o||{}));
const M=ARCHB.M={
 needles:BIO.leafMat(TX.gymno,'ar-needles',{aN:true,swayW:'.65',swayA:.045,alphaTest:.38}),
 casuarina:BIO.leafMat(TX.casuarina,'ar-casuarina',{aN:true,swayW:'.70',swayA:.06,alphaTest:.36}),
 casDrape:BIO.leafMat(TX.casDrape,'ar-casdrape',{aN:false,swayW:'(-position.y)',swayA:.11,axis:1,alphaTest:.34}),
 ohiaLeaf:BIO.leafMat(TX.ohiaLeaf,'ar-ohialeaf',{aN:true,swayW:'.55',swayA:.045,alphaTest:.40}),
 ohiaBloom:BIO.leafMat(TX.ohiaBloom,'ar-ohiabloom',{aN:false,swayW:'.60',swayA:.05,alphaTest:.42}),
 uluhe:BIO.leafMat(TX.uluhe,'ar-uluhe',{aN:false,swayW:'(position.y)',swayA:.055,alphaTest:.44}),
 glossy:BIO.leafMat(TX.glossy,'ar-glossy',{aN:true,swayW:'.55',swayA:.045,alphaTest:.40}),
 sedge:BIO.leafMat(TX.sedge,'ar-sedge',{aN:false,swayW:'(position.y+.5)',swayA:.07,alphaTest:.36}),
 curtain:vcol({roughness:.38,envMapIntensity:.35}),lime:vcol({roughness:.7}),flesh:vcol({roughness:.6}),comb:vcol({roughness:.25,metalness:.15}),felt:vcol({roughness:.95}),
 bark:BIO.barkMat(TX.bark),ohiaBark:BIO.barkMat(TX.ohiaBark),casBark:BIO.barkMat(TX.casBark),rope:BIO.barkMat(TX.rope)};
ARCHB.SWAP=BIO.libSwap('arch',M);

/* Merged bark buckets for sinuous multi-limbed Ohia lehua, Beach she-oak & Maquis she-oak */
BIO.bucket('ar_ohia_bark',M.ohiaBark,{label:'Ohia lehua gnarled trunks & limbs',uvScale:[0.85,1.35]});
BIO.bucket('ar_cas_bark',M.casBark,{label:'Beach she-oak furrowed trunks & boughs',uvScale:[1.05,1.55]});
BIO.bucket('ar_gymno_bark',M.casBark,{label:'Maquis she-oak wiry stems',uvScale:[0.55,1.05]});

/* Custom 7-frond arching 3D rosette geometry for scrambling Uluhe staghorn fern thickets (single-span v=0..1 per forked frond!) */
function makeUluheThicketGeo(){
 const pos=[],nor=[],uv=[];
 const rings=[
  {n:5,tilt:.62,len:1.00,w:.54,arch:.42,droop:.18,az0:.15},
  {n:3,tilt:.34,len:.82,w:.46,arch:.48,droop:.08,az0:.78}
 ];
 const nSeg=4;
 rings.forEach(R=>{
  for(let f=0;f<R.n;f++){
   const az=R.az0+(f/R.n)*TAU,ca=Math.cos(az),sa=Math.sin(az);
   const P=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const rad=R.len*t*Math.sin(R.tilt+.28*t);
    const yy=R.arch*Math.sin(t*1.85)+R.len*t*Math.cos(R.tilt)*.42-R.droop*t*t;
    const hw=R.w*(.22+.78*Math.sin(Math.pow(t,.65)*Math.PI*.88));
    const cx=ca*rad,cz=sa*rad,tx=-sa*hw,tz=ca*hw;
    P.push([cx-tx,yy,cz-tz,0,t],[cx+tx,yy,cz+tz,1,t]);
   }
   for(let i=0;i<nSeg;i++){
    const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
    const nx=ca*.28,ny=.92,nz=sa*.28,nl=Math.hypot(nx,ny,nz);
    [a,b,c,b,d,c].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(nx/nl,ny/nl,nz/nl);});
   }
  }
 });
 return BIO.geo._make(pos,nor,uv);
}

// ---------------------------------------------------------------- the items
// THE CURTAIN: a unit wall 1 long (+x) and 1 tall (+y), two sheets 3 cm apart with a wave through them; the +z sheet white (the alkaline face), the -z
// sheet black-green (the acid face); ribs up the sheet; a row of blisters near the foot. The kit turns +z toward the alkaline water (60)
{const nx=16,ny=8,pos=[],col=[],nor=[],idx=[];const W=(x,y)=>.07*Math.sin(x*TAU*1.3+y*1.1)+.03*Math.sin(x*TAU*4.1+1.7);
 for(const side of [1,-1]){const b=pos.length/3;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=i/nx,y=j/ny,rib=.012*Math.cos(x*TAU*9),z=W(x,y)+side*(.015+rib);
   pos.push(x,y*(1-.06*Math.sin(x*TAU)),z);nor.push(0,0,side);
   const t=y,k=.85+.15*Math.cos(x*TAU*9);if(side>0)col.push(.92*k,.93*k,.9*k);else col.push((.025+.03*t)*k,(.045+.05*t)*k,(.035+.03*t)*k);}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=b+j*(nx+1)+i,c=a+nx+1;if(side>0)idx.push(a,a+1,c,a+1,c+1,c);else idx.push(a,c,a+1,a+1,c,c+1);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 BIO.def('arcurtain',g,M.curtain,{label:'Curtain (acid face black-green, alkaline face white)'});}
{const g=new T3.CylinderGeometry(.5,.5,1,7,1,true);g.rotateZ(Math.PI/2);g.translate(.5,0,0);const c=[],p=g.attributes.position;for(let i=0;i<p.count;i++)c.push(1,1,1);
 g.setAttribute('color',new T3.Float32BufferAttribute(c,3));BIO.def('arcurtainhem',g,M.flesh,{label:'Curtain (its living hem)'});}
BIO.def('arhem',BIO.fung.comb({w:1,d:.25,tilt:.1,lobes:4,seg:6}),M.lime,{label:'Hem frill (young curtain)'});
BIO.def('arlime',BIO.fung.bracket({arc:Math.PI*.9,seg:8,thick:.25,droop:.08,wav:4,wavA:.08}),M.lime,{label:'Lime shelf'});
BIO.def('arverd',BIO.fung.cap({form:'dome',h:.42,seg:12,rings:3,lump:.25,wav:6,wavA:.05,under:'gills',seed:20201}),M.flesh,{label:'Verdigris cap'});
BIO.def('arverdstalk',BIO.fung.stalk({r0:.16,r1:.11,seg:7,rings:3}),M.flesh,{label:'Verdigris cap (stalk)'});
BIO.def('arcomb',BIO.fung.comb({w:1,d:.45,tilt:.3,lobes:3,seg:6}),M.comb,{label:'Seep comb'});
BIO.def('arfelt',BIO.fung.cap({form:'disc',h:.08,seg:10,rings:2,lump:.5,wav:7,wavA:.15,under:'none',uv:'planar',seed:20202}),M.felt,{label:'Acid felt'});
BIO.def('arfan',BIO.fung.cap({form:'funnel',h:.3,seg:9,rings:2,wav:5,wavA:.2,under:'none',seed:20203}),M.flesh,{label:'Steam fan'});
// EARTH items (single-line BIO.def for check_cells.py)
BIO.def('artrunk',BIO.fung.stalk({r0:.05,r1:.025,seg:7,rings:6}),M.bark,{label:'Candelabra araucaria (trunk)'});
BIO.def('arbough',BIO.fung.stalk({r0:.11,r1:.08,seg:6,rings:6,bend:.35}),M.rope,{label:'Candelabra araucaria (arm)'});
BIO.def('argymno',BIO.geo.clump(),M.needles,{attrs:['aN'],label:'Maquis she-oak'});
BIO.def('arpycn',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Sève bleue'});
BIO.def('arpycntrunk',BIO.fung.stalk({r0:.06,r1:.04,seg:6,rings:3}),M.bark,{label:'Sève bleue (stem)'});
BIO.def('arsedge',BIO.geo.clump(),M.sedge,{label:'Maquis sedge'});
BIO.def('arcastrunk',BIO.fung.stalk({r0:.14,r1:.09,seg:7,rings:4,bend:.05}),M.casBark,{label:'Beach she-oak (trunk)'});
BIO.def('arcas',BIO.geo.clump(),M.casuarina,{attrs:['aN'],label:'Beach she-oak'});
BIO.def('arcas_drape',BIO.geo.hang(),M.casDrape,{label:'Beach she-oak (weeping cladodes)'});
BIO.def('arnaupaka',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Beach naupaka'});
BIO.def('aripomoea',BIO.fung.cap({form:'disc',h:.05,seg:8,rings:2,lump:.6,wav:6,wavA:.2,under:'none',uv:'planar',seed:20204}),M.flesh,{label:'Beach morning glory'});
BIO.def('arpalmtrunk',BIO.fung.stalk({r0:.05,r1:.035,seg:7,rings:8,bend:.25,ribs:18,ribA:.08}),M.bark,{label:'Coconut palm (trunk)'});
BIO.def('arpalm',BIO.fung.comb({w:1,d:.22,tilt:-.35,lobes:5,seg:8}),M.flesh,{label:'Coconut palm (fronds)'});
BIO.def('arohiatrunk',BIO.fung.stalk({r0:.13,r1:.08,seg:7,rings:4,bend:.08}),M.ohiaBark,{label:'Ohia lehua (trunk)'});
BIO.def('arohia',BIO.geo.clump(),M.ohiaLeaf,{attrs:['aN'],label:'Ohia lehua'});
BIO.def('arohia_bloom',BIO.geo.bloom(),M.ohiaBloom,{onLeaf:true,label:'Ohia lehua (scarlet brush flower)'});
BIO.def('aruluhe',makeUluheThicketGeo(),M.uluhe,{label:'Uluhe fern'});
BIO.def('armangroveprop',BIO.fung.stalk({r0:.05,r1:.04,seg:5,rings:5,bend:.45}),M.bark,{label:'Red mangrove (prop roots)'});
BIO.def('armangrove',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Red mangrove'});
BIO.def('arpitch',BIO.fung.bladder({swell:.55,neck:.42,pleats:0,seg:9,rings:5,h:1.6}),M.flesh,{label:'Pitcher plant'});

// ---------------------------------------------------------------- Structural multi-limbed tree builders (BIO.tree + BIO.tube + BIO.flareJoin)
/* 1. 'Ōhi'a Lehua (Metrosideros polymorpha): gnarled multi-stemmed silvery-barked pioneer tree, spreading cloud-tiers & scarlet brush blossoms */
ARCHB.growOhia=function(x,y,z,H,tSeed,flw){
 const h= (i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.ohiaBark[(tSeed>>>0)%PAL.ohiaBark.length];
 const yaw=h(1,1)*TAU;
 const rBase=clamp(H*.024*(.85+.3*h(2,1)),.08,.22);

 BIO.tree(x,z,()=>{
  /* Root-collar bole instance keeps 'arohiatrunk' registered for SPECIES & Arcoforte tall-trunk audit */
  BIO.put('arohiatrunk',[x,y-.22,z],qEuler(0,yaw,0),[rBase/.13,Math.min(1.35,H*.22),rBase/.13],C(barkHex));

  /* 3 lava-gripping surface buttress roots */
  for(let rt=0;rt<3;rt++){
   const ra=yaw+(rt/3)*TAU+.4*(h(rt+10,2)-.5),rSpan=rBase*(2.4+1.2*h(rt+10,3));
   const rPts=BIO.flareJoin([
    {x:x+Math.cos(ra)*rBase*.4,y:y+rBase*1.1,z:z+Math.sin(ra)*rBase*.4,r:rBase*.46},
    {x:x+Math.cos(ra)*rSpan*.6,y:y+rBase*.22,z:z+Math.sin(ra)*rSpan*.6,r:rBase*.28},
    {x:x+Math.cos(ra)*rSpan,y:y-.45,z:z+Math.sin(ra)*rSpan,r:rBase*.12}
   ],{parentR:rBase,k:1.4,sink:.45,len:1.4});
   BIO.tube('ar_ohia_bark',rPts,barkHex,{seg:5});
  }

  /* 2 or 3 crooked ascending main stems splitting low above the root collar */
  const nStems=H>4.6?3:2;
  for(let s=0;s<nStems;s++){
   const az=yaw+(s/nStems)*TAU+.45*(h(20+s,1)-.5);
   const spread=H*(.22+.14*h(20+s,2));
   const stemH=H*(.76+.22*h(20+s,3));
   const wob=(h(20+s,4)-.5)*H*.10;
   const m1x=x+Math.cos(az)*spread*.38-Math.sin(az)*wob,m1y=y+stemH*.38,m1z=z+Math.sin(az)*spread*.38+Math.cos(az)*wob;
   const m2x=x+Math.cos(az)*spread*.78+Math.sin(az)*wob*.6,m2y=y+stemH*.72,m2z=z+Math.sin(az)*spread*.78-Math.cos(az)*wob*.6;
   const tx=x+Math.cos(az)*spread,ty=y+stemH,tz=z+Math.sin(az)*spread;
   const sr0=rBase*(s===0?.78:.64);
   const stemPts=BIO.flareJoin([
    {x:x,y:y-.25,z:z,r:rBase},
    {x:m1x,y:m1y,z:m1z,r:sr0*.72},
    {x:m2x,y:m2y,z:m2z,r:sr0*.46},
    {x:tx,y:ty,z:tz,r:Math.max(.028,sr0*.24)}
   ],{parentR:rBase*1.05,k:1.35,sink:.35,len:1.5});
   BIO.tube('ar_ohia_bark',stemPts,barkHex,{seg:6});

   /* 3 spreading crooked lateral boughs per main stem, each socketed directly into dome foliage pads */
   const nBranches=3;
   for(let b=0;b<nBranches;b++){
    const bf=.46+.44*(b/(nBranches-1));
    const bx=lerp(m1x,tx,bf),by=lerp(m1y,ty,bf),bz=lerp(m1z,tz,bf);
    const baz=az+(b-1)*1.25+.35*(h(40+s*4+b,1)-.5);
    const bSpan=H*(.18+.11*h(40+s*4+b,2));
    const bRise=bSpan*(.32+.24*h(40+s*4+b,3));
    const bmx=bx+Math.cos(baz)*bSpan*.55,bmy=by+bRise*.45,bmz=bz+Math.sin(baz)*bSpan*.55;
    const bex=bx+Math.cos(baz)*bSpan,bey=by+bRise,bez=bz+Math.sin(baz)*bSpan;
    const br0=Math.max(.032,sr0*.38);
    const bPts=BIO.flareJoin([
     {x:bx,y:by,z:bz,r:br0},
     {x:bmx,y:bmy,z:bmz,r:br0*.62},
     {x:bex,y:bey,z:bez,r:Math.max(.02,br0*.32)}
    ],{parentR:sr0*.55,k:1.45,sink:.5,len:1.5});
    BIO.tube('ar_ohia_bark',bPts,barkHex,{seg:5});

    const padS=clamp(H*(.26+.08*h(40+s*4+b,4)),1.15,2.85);
    const lHex=PAL.ohia[(s*3+b+(tSeed>>>0))%PAL.ohia.length];
    const nx=Math.cos(baz)*.42,nz=Math.sin(baz)*.42;
    BIO.put('arohia',[bex,bey,bez],qEuler(0,baz+h(40+s*4+b,5)*.8,0),[padS,padS*.58,padS],C(lHex),{n:[nx,.88,nz]});
    if(flw&&h(40+s*4+b,6)<.68){
     const blS=.42+.28*h(40+s*4+b,7);
     const flHex=PAL.ohiaFlower[(s+b+(tSeed>>>0))%PAL.ohiaFlower.length];
     BIO.put('arohia_bloom',[bex+nx*.22,bey+padS*.24,bez+nz*.22],qEuler(0,baz*1.3,0),[blS,blS*.88,blS],C(flHex));
    }
   }

   /* Stem apex crown pad + optional scarlet lehua blossom */
   const topS=clamp(H*(.30+.07*h(60+s,1)),1.3,3.1);
   const topHex=PAL.ohia[(s+(tSeed>>>0))%PAL.ohia.length];
   BIO.put('arohia',[tx,ty,tz],qEuler(0,az,0),[topS,topS*.56,topS],C(topHex),{n:[Math.cos(az)*.25,.94,Math.sin(az)*.25]});
   if(flw){
    const blS=.48+.30*h(60+s,2);
    const flHex=PAL.ohiaFlower[(s*2+(tSeed>>>0))%PAL.ohiaFlower.length];
    BIO.put('arohia_bloom',[tx,ty+topS*.25,tz],qEuler(0,az+.7,0),[blS,blS*.9,blS],C(flHex));
   }
  }
 });
};

/* 2. Beach She-Oak (Casuarina equisetifolia): furrowed wind-swept trunk, sweeping scaffold limbs & weeping cladode-needle curtains */
ARCHB.growCasuarina=function(x,y,z,H,tSeed){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.casBark[(tSeed>>>0)%PAL.casBark.length];
 const yaw=h(1,1)*TAU;
 const lean=(.05+.08*h(2,1));
 const rBase=clamp(H*.019*(.88+.26*h(3,1)),.11,.29);

 BIO.tree(x,z,()=>{
  BIO.put('arcastrunk',[x,y-.24,z],qEuler(0,yaw,0),[rBase/.14,Math.min(1.6,H*.18),rBase/.14],C(barkHex));

  /* Flared coastal root buttresses anchoring into dune/headland */
  for(let rt=0;rt<3;rt++){
   const ra=yaw+(rt/3)*TAU+.3*(h(rt+5,1)-.5),rSpan=rBase*(2.2+.9*h(rt+5,2));
   const rPts=BIO.flareJoin([
    {x:x+Math.cos(ra)*rBase*.4,y:y+rBase*1.2,z:z+Math.sin(ra)*rBase*.4,r:rBase*.44},
    {x:x+Math.cos(ra)*rSpan*.65,y:y+rBase*.25,z:z+Math.sin(ra)*rSpan*.65,r:rBase*.24},
    {x:x+Math.cos(ra)*rSpan,y:y-.5,z:z+Math.sin(ra)*rSpan,r:rBase*.11}
   ],{parentR:rBase,k:1.4,sink:.5,len:1.5});
   BIO.tube('ar_cas_bark',rPts,barkHex,{seg:5});
  }

  /* Gently leaning main bole up to 0.94 H */
  const ldx=Math.cos(yaw)*lean*H,ldz=Math.sin(yaw)*lean*H;
  const nSeg=6,bole=[];
  for(let i=0;i<=nSeg;i++){
   const t=i/nSeg,curve=t*t;
   const wob=Math.sin(t*3.6+(tSeed%11))*H*.018;
   const bx=x+ldx*curve-Math.sin(yaw)*wob,by=y-.3+(H*.94+.3)*t,bz=z+ldz*curve+Math.cos(yaw)*wob;
   const flare=1+.34*Math.pow(Math.max(0,1-t/.15),2);
   bole.push({x:bx,y:by,z:bz,r:Math.max(.032,rBase*(1-.82*Math.pow(t,.86))*flare)});
  }
  BIO.tube('ar_cas_bark',bole,barkHex,{seg:7});

  /* 5 tiers of slender, gracefully sweeping & slightly drooping lateral Casuarina limbs + socketed sprays + weeping drapes */
  const nTiers=5;
  for(let ti=0;ti<nTiers;ti++){
   const f=.32+.60*(ti/(nTiers-1));
   const idx=Math.min(nSeg-1,Math.floor(f*nSeg)),tf=f*nSeg-idx;
   const ox=lerp(bole[idx].x,bole[idx+1].x,tf);
   const oy=lerp(bole[idx].y,bole[idx+1].y,tf);
   const oz=lerp(bole[idx].z,bole[idx+1].z,tf);
   const pR=lerp(bole[idx].r,bole[idx+1].r,tf);
   const nB=ti<3?3:2;

   for(let b=0;b<nB;b++){
    const sIdx=ti*6+b;
    const az=yaw+(b/nB)*TAU+ti*1.32+.42*(h(30+sIdx,1)-.5);
    const span=H*(.22+.11*h(30+sIdx,2))*(1.08-.44*(ti/nTiers));
    const midRise=span*(.24+.14*(ti/nTiers));
    const tipRise=midRise-span*.12; /* Graceful outward arch with drooping outer tip */
    const mx=ox+Math.cos(az)*span*.56,my=oy+midRise,mz=oz+Math.sin(az)*span*.56;
    const ex=ox+Math.cos(az)*span,ey=oy+tipRise,ez=oz+Math.sin(az)*span;
    const br0=Math.max(.028,pR*.45);
    const bPts=BIO.flareJoin([
     {x:ox,y:oy,z:oz,r:br0},
     {x:mx,y:my,z:mz,r:br0*.62},
     {x:ex,y:ey,z:ez,r:Math.max(.018,br0*.28)}
    ],{parentR:pR,k:1.5,sink:.55,len:1.7});
    BIO.tube('ar_cas_bark',bPts,barkHex,{seg:5});

    const cHex1=PAL.casuar2[(sIdx+(tSeed>>>0))%PAL.casuar2.length];
    const cHex2=PAL.casuar2[(sIdx+1+(tSeed>>>0))%PAL.casuar2.length];
    const padS=clamp(span*.82,1.35,3.4);
    const nx=Math.cos(az)*.4,nz=Math.sin(az)*.4;
    /* Feathery crown sprays socketed directly onto mid-bough and tip (zero floating!) */
    BIO.put('arcas',[mx,my,mz],qEuler(0,az+.9,0),[padS*.82,padS*.56,padS*.82],C(cHex1),{n:[nx*.6,.92,nz*.6]});
    BIO.put('arcas',[ex,ey,ez],qEuler(0,az,0),[padS,padS*.54,padS],C(cHex2),{n:[nx,.86,nz]});

    /* Pendulous weeping Casuarina needle curtains hanging directly from the bough & tip */
    const drW=clamp(span*.44,.85,1.85),drL=clamp(H*(.14+.06*h(30+sIdx,3)),1.1,2.35);
    BIO.put('arcas_drape',[ex,ey+.12,ez],qEuler(0,az*1.3,0),[drW,drL,drW],C(cHex2));
    if(ti<3){
     BIO.put('arcas_drape',[mx,my+.10,mz],qEuler(0,az+1.1,0),[drW*.85,drL*.88,drW*.85],C(cHex1));
    }
   }
  }

  /* Feathery crown leader spray at bole apex */
  const top=bole[bole.length-1],topS=clamp(H*.22,1.5,3.2);
  const topHex=PAL.casuar2[(tSeed>>>0)%PAL.casuar2.length];
  BIO.put('arcas',[top.x,top.y,top.z],qEuler(0,yaw,0),[topS,topS*.62,topS],C(topHex),{n:[0,1,0]});
 });
};

/* 3. Maquis She-Oak (Gymnostoma deplancheanum): wiry candelabrum stems on near/mid shrubs, grounded tuft afar */
ARCHB.growGymnostoma=function(x,y,z,s,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const cHex=PAL.casuar[(tSeed>>>0)%PAL.casuar.length];
 if(lv<1||s<1.3){
  BIO.put('argymno',[x,y-.08,z],qEuler(0,h(1,1)*TAU,0),[s*.85,s*.82,s*.85],C(cHex),{n:[0,1,0]});
  return;
 }
 const barkHex=PAL.casBark[(tSeed>>>0)%PAL.casBark.length];
 const nSt=2+(tSeed%2);
 BIO.tree(x,z,()=>{
  for(let k=0;k<nSt;k++){
   const az=(k/nSt)*TAU+.5*(h(k+2,1)-.5);
   const sp=s*(.22+.14*h(k+2,2)),sh=s*(.62+.24*h(k+2,3));
   const mx=x+Math.cos(az)*sp*.55,my=y+sh*.52,mz=z+Math.sin(az)*sp*.55;
   const ex=x+Math.cos(az)*sp,ey=y+sh,ez=z+Math.sin(az)*sp;
   const r0=clamp(s*.022,.025,.075);
   BIO.tube('ar_gymno_bark',[
    {x:x,y:y-.15,z:z,r:r0},
    {x:mx,y:my,z:mz,r:r0*.68},
    {x:ex,y:ey,z:ez,r:Math.max(.015,r0*.38)}
   ],barkHex,{seg:5});
   const ts=s*(.48+.14*h(k+2,4));
   BIO.put('argymno',[ex,ey-.05,ez],qEuler(0,az,0),[ts,ts*.68,ts],C(cHex),{n:[Math.cos(az)*.3,.92,Math.sin(az)*.3]});
  }
 });
};
})();
