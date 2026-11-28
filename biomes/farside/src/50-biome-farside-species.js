// ================================================================= FARSIDE — species (data + kit items)
// The crater's one true ocean shore (PLAN.md), where the sea's plants have come ashore: carried on the traders' hulls and in
// their ballast, held on land by a wind that never dries (3,500 mm, a sea fog most mornings), by stipes stiffened with lime and
// bladders that hold water, and by the salt the spray brings. The invasion holds a steady front (the owner, 2026-10-23): the
// goats graze it, the front is burned back, the kelp is cut for ash and food faster than it grows near the towns.
//   THE LOOK.   A seabed in air: olive-brown and gold (the kelps), wine-red and crimson (the red weeds), emerald (the green
//               weeds), bone-white and coral pink (the lime-builders), against the land forest's ordinary green. Everything
//               drips; the blades STREAM INLAND on the onshore wind, as kelp streams in a current.
//   THE ZONES.  strand (the shore and its spray), kelpcoast (the kelp forest on land), front (the dead belt where the spray
//               fades), cloud (the native wet forest with the sea's outriders on it), lee (the land holds). FARSIDE.zones.
// Nine species of its own (PLAN.md section 5, the owner: as planned, 2026-10-26), and three more for the kelp forest's understorey
// and floor (the owner, 2026-10-26: more diversity); the land's own forest is biomes/nwlowlands,
// read in place by the host, and the dead of it at the front are FARSIDE.DEAD (drawn here: no other kit draws a dead tree).
// Everything here is DATA and kit definitions; no placement.
BIO.kit('farside');   // this kit's own registry of items and buckets (core/biome: kits)
var FARSIDE={};
(function(){const {TAU,clamp,lerp,mix,smooth,rr,ri,pick,fbm}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
FARSIDE.TAGS={climate:'tropic..temperate',aridity:'humid',abyssal:false,riparian:'no',koppen:'Af',setting:'coast'};
// ---------------------------------------------------------------- palettes (sRGB; a library card carries its own colour)
const PAL=FARSIDE.PAL={
 stipe:[0x8c7c36,0x9a873a,0x7c6c2e,0xa6923e],stipeBase:[0xb8b294,0xaaa486,0xc4bea2],          /* olive-gold; the base pale with its lime */
 bladder:[0x6e5e26,0x7c6a2a,0x5e5020,0x8a7630],blade:[0xffffff,0xf4e8c4,0xe8e0b8],
 wrack:[0x6c5c28,0x5c4c20,0x7a6a2c,0x846c30],wrackDry:[0x8a7a54,0x9a8a60],
 coral:[0xf4f0e8,0xf0c4c0,0xf0aca0,0xd2bce0,0xece4d8],
 eelgrass:[0x8a9a50,0x7a8c46,0x9aa858],eelDry:[0xc0b080,0xb4a474],
 seapalm:[0x5a4a20,0x4e4220,0x625024,0x4a3c1a],
 wine:[0xffffff,0xf0d0d8,0xffe4e4],lettuce:[0xa8f0b0,0x98e8a4,0xb8f8b8],
 sponge:[0xd0a454,0xe48c3c,0xa09a8e,0xc87838,0xb8b4a0],
 oarweed:[0x7a6428,0x8a7030,0x6a5a24,0x94782e],boa:[0x5e4a1e,0x6a5420,0x54441a],grapes:[0x5aa040,0x68b048,0x4c9038],
 anemone:[0xe8789a,0x7cc888,0xa47ad0,0xf09a8a,0xd6d070],anemoneCol:[0xc8b8a0],
 snag:[0xcac6be,0xb8b4ac,0xd4d0c8],
 palm:[0x4c7832,0x58863a,0x426c2c,0x649042],palmOld:[0x7e7838,0x8c8240],palmTrunk:[0x94846c,0x867862,0x9e8e74],coconutNut:[0x6c7a36,0x867238,0x5e6e30],
 pandan:[0x4a7a34,0x56883e,0x3f6c2e,0x629046],pandanFruit:[0xd86e24,0xe4802c,0xc85e1e],
 casuarina:[0x526c4c,0x5e7856,0x486244,0x68825e],casBark:[0x6e645a,0x60564e,0x7a7066],
 myrtle:[0x385e3c,0x426a44,0x2f5234,0x4c744c],
 naupaka:[0x569646,0x64a452,0x4a8a3e],naupakaBloom:[0xf6f4ec,0xeeeae0],
 glory:[0x488838,0x569644,0x3e7c30],gloryBloom:[0xd466b0,0xe078be,0xc2569e],
 samphire:[0x5c9448,0x789c44,0xb8483c,0x4e863e],
 sandwort:[0x4c8c42,0x5a984c,0x427e38],
 crimsonfan:[0x9e2848,0xb43256,0x7e2040,0xc43e62],
 coralline:[0xe8b8c4,0xdca8bc,0xf0ccd4,0xd4b2cc],
 cordgrass:[0x8c964c,0x9aa256,0x7c8842,0xb2a866]};
// ---------------------------------------------------------------- harvest (kits/crops: the crop each yield is filed as)
const HV=(edible,uses,crop,notes,med)=>({wood:uses&&uses.length?uses.join(', '):'none',edible:edible||[],medicinal:!!med,uses:uses||[],crop:crop||null,notes:notes||'',fruit:null});
// ---------------------------------------------------------------- the species (24 built 3D species + drowned front snags)
const TG=(climate,zone,o)=>Object.assign({climate,aridity:'humid',abyssal:false,riparian:'no',zone},o||{});
FARSIDE.SPECIES=[
 /*0*/{key:'landkelp',name:'Land kelp',model:'giant kelp (Macrocystis), bull kelp (Nereocystis)',habit:'kelp',H:[20,40],
  what:'olive-gold stipes stiffened with lime, leaning together in stands from a tangle of holdfast roots; blades streaming inland; water bladders a fist to a head',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV(['blade'],['kelp ash: potash and soda','iodine'],'kelp','the blades dried as kombu; the stipes burned for ash')})},
 /*1*/{key:'stormwrack',name:'Storm wrack',model:'bladderwrack (Fucus), knotted wrack (Ascophyllum)',habit:'drape',H:[.3,1.5],
  what:'brown-olive straps with paired bladders, draped over rocks, trunks and walls in the spray, piling into wet heaps',
  tags:TG('tropic..temperate','strand',{harvest:HV([],['fertiliser','fodder'],'wrack','carted off the strand to the walled fields')})},
 /*2*/{key:'spraycoral',name:'Spray coral',model:'coralline algae, reef corals',habit:'coral',H:[.4,2.2],
  what:'colonial lime-builders above the waterline: branching white, pink and lilac thickets and terraces of rough limestone',
  tags:TG('tropic','strand',{harvest:HV([],['lime: mortar, the whitewash'],'coral-lime','burned in the lime kilns on the terraces')})},
 /*3*/{key:'eelgrass',name:'Strand eelgrass',model:'seagrasses (Zostera, Posidonia)',habit:'meadow',H:[.4,1.1],
  what:'long ribbon leaves in dense meadows on the dunes, lying flat inland in the wind, banking into windrows of dead leaf',
  tags:TG('tropic..temperate','strand',{harvest:HV([],['thatch','packing','mattresses'],'eelgrass')})},
 /*4*/{key:'seapalm',name:'Sea palm',model:'Postelsia',habit:'palm',H:[.5,1],
  what:'small rubbery palm-shaped kelps on the surf rocks, bending flat to each gust and springing back',tags:TG('tropic..temperate','strand',{harvest:HV(['rubbery stipe'],[],'kelp','cut sparingly on surf ledges at spring ebb')})},
 /*5*/{key:'wineweed',name:'Wine weed',model:'red algae (Porphyra, Gracilaria)',habit:'hang',H:[.6,2.4],
  what:'crimson and wine-red sheets and branching fronds hung from the native trees at the front and in the fog belt: the advance guard',
  tags:TG('temperate','front',{harvest:HV(['sheet'],['agar: glue, sizing'],'wineweed','dried as nori')})},
 /*6*/{key:'emeraldweed',name:'Sea lettuce',model:'green algae (Ulva)',habit:'sheet',H:[.05,.3],
  what:'emerald sheets on every wet surface of the kelp coast, wrinkled and translucent',tags:TG('tropic..temperate','kelpcoast',{harvest:HV(['sheet'],[],'sea-lettuce')})},
 /*7*/{key:'fogsponge',name:'Fog sponge',model:'sponges',habit:'crust',H:[.1,1.4],
  what:'ochre, orange and grey crusts and lumpy towers on bark and rock in the fog belt, drinking the fog; plant or animal, nobody is sure',
  tags:TG('temperate','cloud',{harvest:HV([],['bath sponges','stuffing'],null,'cut from the bark; not a crop')})},
 /*8*/{key:'strandanemone',name:'Strand anemone',model:'sea anemones',habit:'anemone',H:[.15,.4],
  what:'low clumps of thick stalks crowned with soft tentacles, rose, green and violet, on the kelp forest\'s floor; they close at a touch and catch insects',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV([],['sting-venom bait'],null,'avoided by barefoot gatherers; crushed as crab-pot bait'),hazard:'they sting'})},
 /*9*/{key:'oarweed',name:'Oarweed',model:'oarweed, tangle (Laminaria)',habit:'fan',H:[1.2,3],
  what:'the understorey: a stiff stipe a man high, a broad blade split into straps fanned at its top and streaming inland, in thickets under the land kelp',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV(['blade'],['kelp ash'],'kelp','cut with the land kelp, dried the same')})},
 /*10*/{key:'boakelp',name:'Boa kelp',model:'feather boa kelp (Egregia)',habit:'strap',H:[.3,1],
  what:'long sprawling straps lined with small blades and floats, arching out of a holdfast and lying along the floor and over the rocks, downwind',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV([],['fodder'],null,'the goats take it first')})},
 /*11*/{key:'seagrapes',name:'Sea grapes',model:'sea grapes (Caulerpa lentillifera)',habit:'runner',H:[.05,.2],
  what:'green runners on the kelp forest\'s floor, each upright stalk a chain of glossy beads like a bunch of grapes',
  tags:TG('tropic','kelpcoast',{harvest:HV(['beads'],[],'sea-grapes','eaten fresh: the beads burst salt')})},
 /*12*/{key:'coconut',name:'Coconut palm (drift-sown)',model:'coconut palm (Cocos nucifera), drift-sown',habit:'palm',H:[8,16],
  what:'ringed leaning palms drift-sown along the warm back-beach dunes and sheltered coastal benches above wave-wash, crowned with V-cambered pinnate fronds and hanging nut clusters',
  tags:TG('tropic','strand',{harvest:HV(['coconuts'],['timber','thatch','coir cordage'],'coconut','drift-sown nuts along the strand; posts from old trunks, plaited frond thatch and twisted coir mooring warps')})},
 /*13*/{key:'farsidepandan',name:'Strand salt-screwpine',model:'screwpine (Pandanus tectorius)',habit:'palm',H:[3.5,8.0],
  what:'prop-rooted ringed screw-palms leaning into the salt spray on dune crests and raised benches, crowned with spiral rosettes of keeled strap leaves and orange fruit keys',
  tags:TG('tropic','strand',{harvest:HV(['cooked pandan keys'],['plaited boat-mats','thatch','fenders'],'pandan','strap leaves cured and plaited into salt-proof sails, mats and fenders')})},
 /*14*/{key:'strandcasuarina',name:'Wind-sheared strand she-oak',model:'beach she-oak (Casuarina equisetifolia)',habit:'tree',H:[6,15],
  what:'wiry nitrogen-fixing coastal ironwood sheared inland by the onshore gale behind the sand dunes, trailing grey-green needle curtains',
  tags:TG('tropic..temperate','strand',{harvest:HV([],['kelp-kiln fuelwood','charcoal','windbreak'],null,'hot slow-burning ironwood charcoal for the lime and kelp kilns')})},
 /*15*/{key:'strandnaupaka',name:'Salt-cushion naupaka',model:'beach naupaka (Scaevola taccada)',habit:'shrub',H:[.6,1.8],
  what:'rounded wind-clipped cushions of glossy fleshy green leaves along the foredune crest, dotted with white fan half-flowers',
  tags:TG('tropic','strand',{harvest:HV([],['salt-burn poultice','foredune binder'],null,'crushed succulent leaves medicinal poultice for salt-spray burns',true)})},
 /*16*/{key:'beachglory',name:'Beach morning-glory',model:'railroad vine (Ipomoea pes-caprae)',habit:'runner',H:[.08,.35],
  what:'long salt-succulent runners stitching warm back-beach sand above the wrack line, bearing notched bilobed leaves and rose-violet funnel blooms',
  tags:TG('tropic','strand',{harvest:HV([],['sand binder','poultice'],null,'steamed leaves medicinal remedy for strand-anemone stings',true)})},
 /*17*/{key:'rocksali',name:'Spray-rock samphire',model:'rock samphire and glasswort (Crithmum, Salicornia)',habit:'succulent',H:[.15,.45],
  what:'jointed succulent jade-and-crimson tufts wedged into salt-drenched basalt cracks and limestone risers, gleaming wet with spray',
  tags:TG('tropic..temperate','strand',{harvest:HV(['pickled shoots'],['soda ash for glass'],'glasswort','crisp aromatic shoots pickled in brine; autumn stems burned for soda flux')})},
 /*18*/{key:'seasandwort',name:'Shingle sea-sandwort',model:'sea sandwort (Honckenya peploides)',habit:'mat',H:[.08,.25],
  what:'fleshy four-ranked star-leaf mats colonizing storm-thrown shingle berms and upper wrack lines',
  tags:TG('tropic..temperate','strand',{harvest:HV(['fermented greens'],[],'tidewort','pickled sour as antiscorbutic sea-greens by coastal crews')})},
 /*19*/{key:'bladderstipe',name:'Flute-stipe bladder-kelp',model:'antler and tree kelps (Lessonia, Pelagophycus)',habit:'kelp',H:[3.5,9.0],
  what:'stout lime-ribbed mid-story stipes forked into paired arms hung with golden water-bladders and wide ribbed blades streaming inland',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV(['blade'],['kelp ash','cured bladder flasks'],'kelp','cured hollow bladders store oil and vinegar; stipes burned for potash')})},
 /*20*/{key:'crimsonfan',name:'Iridescent bench dulse-fan',model:'dulse and Irish moss (Palmaria, Chondrus)',habit:'fan',H:[.25,.85],
  what:'leathery wine-crimson dichotomous fans with a blue-violet wet sheen clustering in shaded kelp-coast hollows and spray ledges',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV(['dried dulse'],['carrageenan sizing','crimson dye'],'wineweed','chewed dried or boiled into thick broth and cloth sizing')})},
 /*21*/{key:'corallinecrust',name:'Calcareous coralline rim-crust',model:'crustose coralline algae (Lithothamnion, Mesophyllum)',habit:'crust',H:[.06,.32],
  what:'knobby rose-pink and chalk-lilac calcareous rhodolith rosettes armouring surf-washed rock shelves and coral terrace steps',
  tags:TG('tropic..temperate','strand',{harvest:HV([],['kiln lime','acid-soil dressing'],'coral-lime','prized sweetening grit for walled coastal garden beds')})},
 /*22*/{key:'tidalsedge',name:'Salt-marsh cordgrass',model:'cordgrass (Spartina, Bolboschoenus)',habit:'meadow',H:[.55,1.45],
  what:'stiff golden-olive salt-marsh cordgrass stands with plumed seed spikes fringing saline lagoon margins and brackish strand swales',
  tags:TG('tropic..temperate','strand',{harvest:HV([],['thatch','salt-hay fodder','woven mats'],'eelgrass','mown at low water for winter goat-hay and ridge thatch')})},
 /*23*/{key:'waxmyrtle',name:'Fog-catching coastal wax-myrtle',model:'bayberry and podocarp scrub (Morella, Podocarpus)',habit:'shrub',H:[2.5,6.5],
  what:'gnarled aromatic evergreen shrub-tree on high fog-belt benches above tsunami scour, combing mist onto waxy grey-blue berries',
  tags:TG('temperate','cloud',{harvest:HV([],['aromatic lantern wax','tanbark','fuel'],null,'waxy berry rinds boiled for smokeless ship candles and medicinal balm',true)})}];
// THE DEAD (not one of the nine): the native forest's trees killed at the front, drawn by this kit (the native kit draws
// only the living); hung with wine weed and wrack, kelp seedlings coming up under them
FARSIDE.DEAD={key:'snag',name:'Drowned kauri (dead at the front)',model:'biomes/nwlowlands: column kauri, sky meranti, killed by the salt',habit:'snag',H:[24,50],
 tags:TG('temperate','front',{harvest:{wood:'firewood',edible:[],medicinal:false,uses:['firewood for the kilns'],crop:null,notes:'cut for the kelp kilns',fruit:null},dead:true})};
FARSIDE.byKey={};FARSIDE.SPECIES.concat([FARSIDE.DEAD]).forEach(S=>{FARSIDE.byKey[S.key]=S;});
// the animals (PLAN.md section 5): PLACEHOLDERS, data only (the owner, 2026-10-26: the lung octopus's chain builder in
// kits/fauna later). Nothing here is drawn; kits/fauna takes them when it builds them.
FARSIDE.FAUNA_PLACEHOLDERS=[
 {key:'kelpgoat',name:'Farside goat',build:'kits/fauna goat, a breed: shaggier, darker, a kelp-stained muzzle',zone:['strand','front'],herd:true},
 {key:'mudfish',name:'Mudfish',build:'faWdFish with pectoral legs (a crawl on the swimmer gait)',zone:['strand','kelpcoast']},
 {key:'lungoctopus',name:'Lung octopus',build:'a new segment-chain builder and gait in kits/fauna (the owner, 2026-10-26)',zone:['kelpcoast','strand']},
 {key:'strandwhelk',name:'Strand whelk',build:'the slug chain (faWdSerpent, kind slug) with a spired shell',zone:['strand','kelpcoast']},
 {key:'seahare',name:'Sea hare',build:'the slug chain with two flaps and two ear-like tentacles',zone:['kelpcoast']},
 {key:'bloomslug',name:'Bloom slug',build:'the slug chain with cerata',zone:['kelpcoast','cloud']},
 {key:'rockchiton',name:'Rock chiton',build:'a shell part on a low slug chain',zone:['strand']}];

// ---------------------------------------------------------------- procedural fallbacks (the cards and maps the library replaces)
// greyscale or plain-coloured: without the pack (the open world carries none) the instance colours carry the look
const ATX=(draw,fill)=>BIO.alphaTex(128,draw,fill||[120,110,60]);
const cardTex=(S,draw,fill)=>{const t=BIO.alphaTex(S,draw,fill||[120,140,90]);t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;return t;};
const bladeTex=lum=>ATX((g,S)=>{g.fillStyle=BIO.tex.grey(lum);for(let k=0;k<3;k++){g.beginPath();const x0=S*(.3+k*.2);g.moveTo(S*.5,0);
 g.quadraticCurveTo(x0-S*.18,S*.5,x0,S*.98);g.quadraticCurveTo(x0+S*.12,S*.5,S*.5,0);g.fill();}});
const sheetTex=lum=>ATX((g,S)=>{g.fillStyle=BIO.tex.grey(lum);g.beginPath();for(let k=0;k<=24;k++){const a=k/24*TAU,r=S*(.36+.08*Math.sin(a*7));g.lineTo(S/2+Math.cos(a)*r*.8,S*.55+Math.sin(a)*r);}g.fill();});
const fanTex=lum=>ATX((g,S)=>{g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=3;for(let k=0;k<9;k++){g.beginPath();g.moveTo(S/2,S);g.quadraticCurveTo(S/2+(k-4)*S*.04,S*.5,S/2+(k-4)*S*.1,S*.08);g.stroke();}});
const grey=(lum,n)=>BIO.canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(lum+n*(fbm(x/6,y/6,lum,2)-.5),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
// ---------------------------------------------------------------- geometries
const G=FARSIDE.G={};
// a STREAMER: a strip hung from its origin, running down local -y to -1 in n tapering segments, the card's v over its whole
// length (0 at the top: the library cards hang from the top of their cell), u across; a slight twist so a bundle is not a plank
G.streamer=function(n,taper,twist){const pos=[],uv=[],nor=[];const P=[];
 for(let i=0;i<=n;i++){const t=i/n,w=.5*lerp(1,taper,t),a=t*twist,c=Math.cos(a),s=Math.sin(a),zc=Math.sin(t*2.6)*.06;P.push([-w*c,-t,-w*s+zc,0,t],[w*c,-t,w*s+zc,1,t]);}
 for(let i=0;i<n;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];[a,c,b,b,c,d].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(0,0,1);});}
 return BIO.geo._make(pos,nor,uv);};
// a TUFT: three upright cards at 60 degrees round the origin, standing on it, height and width 1 (the card's foot at v 1)
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k*Math.PI/3+.2,c=Math.cos(a),s=Math.sin(a);
 const P=[[-.5*c,0,-.5*s,0,1],[.5*c,0,.5*s,1,1],[.5*c,1,.5*s,1,0],[-.5*c,1,-.5*s,0,0]];[0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-s,0,c);});}
 return BIO.geo._make(pos,nor,uv);};
// a SHEET lying on the ground: a card folded once along its length, cupped a little (sea lettuce), centred on the origin
G.sheet=function(){const pos=[],uv=[],nor=[];const P=[[-.5,.02,-.5,0,0],[0,.10,-.5,.5,0],[.5,.04,-.5,1,0],[-.5,.04,.5,0,1],[0,.12,.5,.5,1],[.5,.02,.5,1,1]];
 [[0,3,1],[1,3,4],[1,4,2],[2,4,5]].forEach(t=>t.forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);}));return BIO.geo._make(pos,nor,uv);};
// merge helper: a list of [geometry, grey] into one vertex-coloured geometry
function merge(parts){const pos=[],nor=[],uv=[],col=[];parts.forEach(p=>{const g=p[0].index?p[0].toNonIndexed():p[0],a=g.attributes.position.array,b=g.attributes.normal.array,u=g.attributes.uv?g.attributes.uv.array:null;
 for(let i=0;i<a.length/3;i++){pos.push(a[i*3],a[i*3+1],a[i*3+2]);nor.push(b[i*3],b[i*3+1],b[i*3+2]);uv.push(u?u[i*2]:0,u?u[i*2+1]:0);const v=typeof p[1]==='function'?p[1](a[i*3],a[i*3+1],a[i*3+2]):p[1];col.push(v,v,v);}});
 return BIO.geo._make(pos,nor,uv,col);}
// a SEA PALM: a rubbery stalk and a mop of blades drooping from its top (origin at the foot, height 1)
G.seapalm=function(){const st=new T3.CylinderGeometry(.03,.055,.74,5,3,true).translate(0,.37,0),sp=st.attributes.position;
 for(let i=0;i<sp.count;i++){const y=sp.getY(i);sp.setX(i,sp.getX(i)+.05*Math.sin(y/.74*Math.PI));}st.computeVertexNormals();const parts=[[st,.62]];
 for(let k=0;k<13;k++){const a=k/13*TAU+(k%3)*.11,L=.85+.25*((k*7)%5)/4,g=new T3.PlaneGeometry(.055,1,1,3);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const t=.5-p.getY(i),w=p.getX(i)*(1-.6*t);p.setX(i,w);p.setY(i,.74+L*(.1*Math.sin(t*Math.PI)-.36*t*t));p.setZ(i,.035+L*.26*t);}
  g.rotateY(-a);g.translate(.05,0,0);g.computeVertexNormals();parts.push([g,(x,y,z)=>.62+.38*Math.min(1,Math.max(0,(y-.4)/.4))]);}
 return merge(parts);};
// a STRAND ANEMONE: a fat column crowned with soft tentacles (origin at the foot, unit height)
G.anemone=function(){const parts=[[new T3.CylinderGeometry(.16,.2,.55,6,1,true).translate(0,.275,0),.5],[new T3.CircleGeometry(.16,6).rotateX(-Math.PI/2).translate(0,.55,0),.6]];
 for(let r=0;r<1;r++)for(let k=0;k<11;k++){const a=k/11*TAU+r*.22,g=new T3.ConeGeometry(.032,.42-.1*r,3,1,true);g.translate(0,.21-.05*r,0);g.rotateX(.5+.5*r);g.rotateY(-a);g.translate(Math.cos(a)*.1*(1-r*.4),.55,Math.sin(a)*.1*(1-r*.4));parts.push([g,1]);}
 return merge(parts);};
G.bladder=new T3.SphereGeometry(1,7,5);
G.bulb=new T3.SphereGeometry(1,12,8);
G.lobe=BIO.geo.lobe();
G.collar=function(seed,arc){const s=KRAND.stream(seed),P=[[.96,0],[1.1,.06],[1.2,.22],[1.24,.45],[1.2,.7],[1.12,.86],[1.02,.96],[.96,1],[.94,.5],[.96,0]].map(p=>new T3.Vector2(p[0],p[1]));
 const g=new T3.LatheGeometry(P,14,0,arc),p=g.attributes.position,bump=[];for(let k=0;k<24;k++)bump.push(s.next());
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),r=Math.hypot(x,z),ph=Math.atan2(x,z),t=Math.min(1,Math.max(0,ph/arc));
  const end=Math.sin(Math.PI*t),out=Math.max(0,r-.96),lump=1+.35*(bump[Math.floor(t*11)%24]-.5)+.25*(bump[12+Math.floor(y*5)%12]-.5);
  const nr=.96+out*end*lump;if(r>1e-6){p.setX(i,x/r*nr);p.setZ(i,z/r*nr);}p.setY(i,.5+(y-.5)*(.55+.45*end));}
 g.computeVertexNormals();return g;};
G.dome=new T3.SphereGeometry(1,7,3,0,TAU,0,Math.PI*.5);
G.oarweed=function(){const parts=[[new T3.CylinderGeometry(.018,.03,.5,5,1,true).translate(0,.25,0),.65]];
 for(let k=0;k<6;k++){const sp=(k-2.5)*.18,g=new T3.PlaneGeometry(.1,1,1,4),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const t=.5-p.getY(i),w=p.getX(i)*(1-.4*t);p.setX(i,.55*t*Math.cos(sp)+0*w);p.setY(i,.5+.45*Math.sin(t*1.9)-.35*t*t);p.setZ(i,.55*t*Math.sin(sp)+w);}
  g.computeVertexNormals();parts.push([g,(x,y)=>.75+.25*Math.min(1,x/.5)]);}
 return merge(parts);};
G.boa=function(){const parts=[],P=[];for(let i=0;i<=10;i++){const t=i/10;P.push([t,.22*Math.sin(t*Math.PI*.9)*(1-t*.5),.04*Math.sin(t*9)]);}
 for(let i=0;i<10;i++){const a=P[i],b=P[i+1],g=new T3.PlaneGeometry(1,.035,1,1),L=Math.hypot(b[0]-a[0],b[1]-a[1]);g.scale(L,1,1);g.rotateX(-Math.PI/2);
  g.rotateZ(Math.atan2(b[1]-a[1],b[0]-a[0]));g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);parts.push([g,.7]);
  for(const sd of [-1,1]){const f=new T3.PlaneGeometry(.05,.09,1,1);f.rotateX(-Math.PI/2+sd*.5);f.translate(a[0],a[1]+.01,a[2]+sd*.05);parts.push([f,.95]);}
  if(i%3===1)parts.push([new T3.SphereGeometry(.018,4,3).translate(a[0],a[1]+.02,a[2]),1]);}
 return merge(parts);};
G.grapes=function(){const parts=[[new T3.CylinderGeometry(.006,.006,1,3,1,true).rotateZ(Math.PI/2).translate(.5,.01,0),.6]],B=new T3.OctahedronGeometry(.016,0);
 for(let k=0;k<3;k++){const x=.15+k*.3;for(let j=0;j<4;j++){const b=B.clone();b.translate(x+.008*Math.sin(j*2),.02+j*.024,.008*Math.cos(j*3));parts.push([b,.85+.03*j]);}}
 return merge(parts);};
function rod(a,b,r0,r1,seg){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),g=new T3.CylinderGeometry(r1,r0,L,seg||5,1,true);
 g.translate(0,L/2,0);g.applyMatrix4(new T3.Matrix4().makeRotationFromQuaternion(new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,1,0),new T3.Vector3(dx/L,dy/L,dz/L))));g.translate(a[0],a[1],a[2]);return g;}
G.staghorn=function(seed){const s=KRAND.stream(seed),parts=[],tip=(p,r)=>parts.push([new T3.SphereGeometry(r,4,2).translate(p[0],p[1],p[2]),1]);
 const grow=(p,d,L,r,depth)=>{const q=[p[0]+d[0]*L,p[1]+d[1]*L,p[2]+d[2]*L];parts.push([rod(p,q,r,r*.8,5),(x,y)=>.9+.1*Math.min(1,y)]);
  if(depth===0){tip(q,r*.8);return;}const n=2;
  for(let k=0;k<n;k++){const a=s.next()*TAU,sp=.35+s.next()*.45,nd=[d[0]*.6+Math.cos(a)*sp,d[1]*.6+.55,d[2]*.6+Math.sin(a)*sp],m=Math.hypot(nd[0],nd[1],nd[2]);
   grow(q,[nd[0]/m,nd[1]/m,nd[2]/m],L*(.62+.2*s.next()),r*.8,depth-1);}};
 for(let t=0;t<1+Math.floor(s.next()*2);t++){const a=s.next()*TAU;grow([Math.cos(a)*.08,0,Math.sin(a)*.08],[Math.cos(a)*.25,1,Math.sin(a)*.25].map((v,i,A)=>v/Math.hypot(A[0],A[1],A[2])),.3,.11,2);}
 return merge(parts);};
G.plate=function(seed){const s=KRAND.stream(seed),parts=[[rod([0,0,0],[0,.35,0],.07,.05,6),.7]];
 for(let k=0;k<3+Math.floor(s.next()*2);k++){const r=.22+.3*s.next(),y=.12+k*.17+.05*s.next(),a=s.next()*TAU,o=.08+.12*s.next(),g=new T3.CylinderGeometry(r,r*.82,.05,9,1,false);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);p.setY(i,p.getY(i)+.06*(px*px+pz*pz)/(r*r));}
  g.computeVertexNormals();g.translate(Math.cos(a)*o,y,Math.sin(a)*o);parts.push([g,.85+.15*s.next()]);}
 return merge(parts);};
G.rim=function(seed){const s=KRAND.stream(seed),parts=[];for(let k=0;k<7;k++){const x=-.5+k/6,r=.11+.08*s.next(),g=new T3.SphereGeometry(1,7,4,0,TAU,0,Math.PI*.55);
  g.scale(r*1.5,r*(1+.6*s.next()),r);g.translate(x,-.02,(s.next()-.5)*.06);parts.push([g,(px,py)=>.8+.2*Math.min(1,py/.15)]);}
 return merge(parts);};
G.palmFrond=function(nSeg,arch,droop,halfW,vFold){const pos=[],nor=[],uv=[],L=[],C0=[],R0=[];
 for(let i=0;i<=nSeg;i++){const t=i/nSeg,x=t*(1-.14*t*t),y=arch*Math.sin(t*1.95)-droop*t*t*t;
  const env=Math.sin(Math.pow(t,.62)*Math.PI*.96)*(.88+.12*(1-t)),w=halfW*(.08+.92*env),vf=vFold*env;
  L.push([x,y-vf,-w,0,t]);C0.push([x,y,0,.5,t]);R0.push([x,y-vf,w,1,t]);}
 for(let i=0;i<nSeg;i++){[[L[i],C0[i],L[i+1],C0[i+1],-.28],[C0[i],R0[i],C0[i+1],R0[i+1],.28]].forEach(s=>{
  const a=s[0],b=s[1],c=s[2],d=s[3],nz=s[4],nl=Math.hypot(.15,.94,nz);
  [a,b,c,b,d,c].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(.15/nl,.94/nl,nz/nl);});});}
 return BIO.geo._make(pos,nor,uv);};
G.coconutCluster=function(){const pos=[],nor=[],uv=[],col=[],idx=[],offs=[[.14,-.10,0],[-.12,-.12,.09],[.02,-.14,-.13],[0,-.24,.02]];
 offs.forEach(o=>{const s=new T3.IcosahedronGeometry(.13,1),p=s.attributes.position,n=s.attributes.normal,u=s.attributes.uv,b=pos.length/3;
  for(let i=0;i<p.count;i++){pos.push(p.getX(i)+o[0],p.getY(i)*1.22+o[1],p.getZ(i)+o[2]);nor.push(n.getX(i),n.getY(i),n.getZ(i));
   uv.push(u?u.getX(i):.5,u?u.getY(i):.5);const sh=.76+.24*clamp(p.getY(i)/.13*.5+.5,0,1);col.push(sh,sh,sh*.92);}
  if(s.index){const ix=s.index.array;for(let i=0;i<ix.length;i++)idx.push(b+ix[i]);}else for(let i=0;i<p.count;i++)idx.push(b+i);});
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);return g;};
// PANDANUS keeled M-fold strap leaf + compound syncarp fruit
G.pandanStrap=function(){return G.palmFrond(4,.22,.46,.085,.035);};
G.pandanFruit=function(){const g=new T3.IcosahedronGeometry(1,1);g.scale(1,1.28,1);return g;};
// SAMPHIRE jointed succulent stems (3D vertex-coloured clump)
G.samphire=function(){const parts=[];for(let k=0;k<7;k++){const a=k/7*TAU+.3,r=.04+.12*(k%3)/2,lean=.18+.15*(k%2),h=.55+.45*((k*3)%4)/3;
 let px=Math.cos(a)*r,pz=Math.sin(a)*r,py=0;
 for(let j=0;j<4;j++){const nx=px+Math.cos(a)*lean*.18,nz=pz+Math.sin(a)*lean*.18,ny=py+h/4;
  parts.push([rod([px,py,pz],[nx,ny,nz],.036*(1-j*.12),.028*(1-j*.12),5),.72+.08*j]);px=nx;py=ny;pz=nz;}}
 return merge(parts);};
// SEA-SANDWORT fleshy 4-ranked star-leaf mat
G.sandwort=function(){const parts=[];for(let k=0;k<9;k++){const a=k/9*TAU,r=(k===0?0:.14+.16*(k%2)),cx=Math.cos(a)*r,cz=Math.sin(a)*r;
 for(let j=0;j<4;j++){const la=j*Math.PI/2+k*.35,f=new T3.PlaneGeometry(.11,.18,1,1);f.rotateX(-Math.PI/2+.28);f.rotateY(la);
  f.translate(cx+Math.cos(la)*.06,.04+.03*(k%2),cz+Math.sin(la)*.06);parts.push([f,.82+.05*j]);}}
 return merge(parts);};
// BEACH MORNING-GLORY runner with bilobed leaves & upright trumpet flower cup
G.gloryRunner=function(){const parts=[[new T3.CylinderGeometry(.009,.009,1,4,1,true).rotateZ(Math.PI/2).translate(.5,.018,0),.58]];
 for(let k=0;k<5;k++){const x=.12+k*.2,sd=k%2?1:-1,lf=new T3.CircleGeometry(.075,6);lf.rotateX(-Math.PI/2+.22*sd);
  lf.translate(x,.035,sd*.085);parts.push([lf,.88]);}
 return merge(parts);};
G.gloryBloom=function(){const c=new T3.ConeGeometry(.09,.14,7,1,true);c.rotateX(Math.PI);c.translate(0,.11,0);return merge([[c,.96]]);};
// DULSE-FAN dichotomous marine red-alga fan clump
G.dulseFan=function(){const parts=[];for(let k=0;k<5;k++){const sp=(k-2)*.26,g=new T3.PlaneGeometry(.24,.88,2,3),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const y=p.getY(i)+.44,t=clamp(y/.88,0,1);p.setX(i,p.getX(i)*(.25+1.05*t)+Math.sin(sp)*t*.22);
  p.setY(i,y*(1-.18*t));p.setZ(i,Math.cos(sp)*t*.26+.04*Math.sin(t*5+k));}
 g.computeVertexNormals();parts.push([g,(x,y)=>.72+.28*clamp(y/.8,0,1)]);}
 return merge(parts);};
// CORALLINE RIM-CRUST ruffled calcareous rosette dome
G.corallineCrust=function(){const parts=[];for(let k=0;k<6;k++){const a=k/6*TAU,r=k===0?0:.22,d=new T3.CylinderGeometry(.22,.26,.06,8,1,false);
 const p=d.attributes.position;for(let i=0;i<p.count;i++){const ang=Math.atan2(p.getZ(i),p.getX(i));p.setY(i,p.getY(i)+.022*Math.sin(ang*5+k));}
 d.computeVertexNormals();d.translate(Math.cos(a)*r,.03+.018*(k%2),Math.sin(a)*r);parts.push([d,.84+.03*k]);}
 return merge(parts);};

const H01=(a,b,c)=>KRAND.unit(KRAND.hash(0x5a3c29,a|0,b|0,c|0));
const palmFrondTex=cardTex(512,(g,S)=>{g.lineCap='round';const nPairs=38;
 for(let i=1;i<=nPairs;i++){const f=i/(nPairs+1),ry=S*(.05+.88*f),env=Math.sin(Math.pow(f,.68)*Math.PI)*(1-.12*f),pLen=S*.40*env;
  if(pLen<4)continue;for(const side of [-1,1]){const sweep=.34+.26*f,ang=side*(Math.PI*.5-sweep)+(H01(i,side+2,95)-.5)*.05;
   const mx=S*.5+Math.cos(ang)*pLen*.56,my=ry+Math.sin(Math.abs(sweep))*pLen*.42;
   const tx=clamp(S*.5+Math.cos(ang)*pLen,.04*S,.96*S),ty=clamp(ry+Math.sin(Math.abs(sweep))*pLen*.88,.04*S,.96*S),hw=S*.0078*(.6+.5*env);
   const lum=Math.round(168+64*env+22*(H01(i,side+5,95)-.5));
   g.fillStyle='rgb('+Math.round(lum*.92)+','+Math.min(255,Math.round(lum*1.05))+','+Math.round(lum*.74)+')';
   g.beginPath();g.moveTo(S*.5,ry-hw);g.quadraticCurveTo(mx,my-hw*.7,tx,ty);g.quadraticCurveTo(mx,my+hw*.9,S*.5,ry+hw);g.closePath();g.fill();}}
 g.strokeStyle='rgba(168,176,112,0.96)';g.lineWidth=S*.012;g.beginPath();g.moveTo(S*.5,S*.03);g.lineTo(S*.5,S*.94);g.stroke();},[154,182,112]);
const pandanStrapTex=cardTex(256,(g,S)=>{
 const grd=g.createLinearGradient(0,S*.04,0,S*.96);grd.addColorStop(0,'rgb(154,182,112)');grd.addColorStop(.55,'rgb(184,210,132)');grd.addColorStop(1,'rgb(142,166,96)');
 g.fillStyle=grd;g.beginPath();g.moveTo(S*.34,S*.04);g.quadraticCurveTo(S*.26,S*.48,S*.48,S*.96);g.quadraticCurveTo(S*.74,S*.48,S*.66,S*.04);g.closePath();g.fill();
 g.strokeStyle='rgba(220,232,168,0.75)';g.lineWidth=2.2;g.beginPath();g.moveTo(S*.5,S*.04);g.lineTo(S*.49,S*.94);g.stroke();},[158,186,114]);
const casSprayTex=cardTex(256,(g,S)=>{g.lineCap='round';
 for(let i=0;i<54;i++){const f=i/54,ang=(H01(i,1,41)-.5)*1.65,L=S*(.28+.54*H01(i,2,41));
  const x0=S*.5+(H01(i,3,41)-.5)*S*.14,y0=S*(.06+.22*f),x1=clamp(x0+Math.sin(ang)*L,.06*S,.94*S),y1=clamp(y0+Math.cos(ang*.6)*L,.06*S,.94*S);
  const v=Math.round(150+65*H01(i,4,41));g.strokeStyle='rgba('+Math.round(v*.86)+','+Math.min(255,Math.round(v*1.04))+','+Math.round(v*.80)+',0.92)';
  g.lineWidth=2.1;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)*.5,(y0+y1)*.5+S*.04,x1,y1);g.stroke();}},[142,168,128]);
const shrubLeafTex=cardTex(256,(g,S)=>{
 for(let i=0;i<34;i++){const r=S*(.08+.34*Math.sqrt(H01(i,1,52))),a=H01(i,2,52)*TAU,cx=S*.5+Math.cos(a)*r*.85,cy=S*.48+Math.sin(a)*r;
  const rx=S*(.05+.04*H01(i,3,52)),ry=rx*1.65,v=Math.round(156+68*H01(i,4,52));
  g.save();g.translate(cx,cy);g.rotate(a+Math.PI*.5);g.fillStyle='rgb('+Math.round(v*.86)+','+Math.min(255,Math.round(v*1.06))+','+Math.round(v*.78)+')';
  g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();g.restore();}},[148,182,126]);
const cordgrassTex=cardTex(256,(g,S)=>{g.lineCap='round';
 for(let i=0;i<19;i++){const x0=S*(.26+.48*(i/18)),lean=(i-9)*S*.024+(H01(i,1,63)-.5)*S*.06,h=S*(.58+.34*H01(i,2,63));
  const v=Math.round(166+58*H01(i,3,63));g.strokeStyle='rgb('+v+','+Math.min(255,v+8)+','+Math.round(v*.74)+')';g.lineWidth=3.4;
  g.beginPath();g.moveTo(x0,S*.95);g.quadraticCurveTo(x0+lean*.45,S*.95-h*.55,clamp(x0+lean,.06*S,.94*S),clamp(S*.95-h,.06*S,.94*S));g.stroke();}},[172,180,118]);

// ---------------------------------------------------------------- materials (the library swaps their maps: BIO.libSwap)
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({alphaTest:.4},o||{}));
const M=FARSIDE.MAT={
 stipe:BIO.barkMat(grey(170,60)),snag:BIO.barkMat(grey(190,50)),
 blade0:leaf(bladeTex(150),'blade0',{swayW:'(-position.y)',swayA:.22,axis:1}),blade1:leaf(bladeTex(140),'blade1',{swayW:'(-position.y)',swayA:.22,axis:1}),
 blade2:leaf(bladeTex(160),'blade2',{swayW:'(-position.y)',swayA:.22,axis:1}),
 lettuce:leaf(sheetTex(170),'lettuce',{swayA:.004}),
 wine0:leaf(sheetTex(150),'wine0',{swayW:'(-position.y)',swayA:.12,axis:1}),wine1:leaf(fanTex(150),'wine1',{swayW:'(-position.y)',swayA:.12,axis:1}),
 wrack:leaf(bladeTex(130),'wrack',{swayW:'(-position.y)',swayA:.06,axis:1}),
 eelgrass:leaf(fanTex(170),'eelgrass',{swayW:'(position.y)',swayA:.09}),
 coral0:leaf(fanTex(220),'coral0',{swayA:0}),coral1:leaf(fanTex(220),'coral1',{swayA:0}),spongecard:leaf(sheetTex(190),'spongecard',{swayA:0}),
 palmfrond:leaf(palmFrondTex,'fs-palmfrond',{aN:false,swayW:'(position.x)',swayA:.085,alphaTest:.36}),
 pandanstrap:leaf(pandanStrapTex,'fs-pandan',{aN:false,swayW:'(position.x)',swayA:.065,alphaTest:.36}),
 casspray:leaf(casSprayTex,'fs-casspray',{aN:false,swayA:.07,alphaTest:.36}),
 shrubleaf:leaf(shrubLeafTex,'fs-shrubleaf',{aN:false,swayA:.045,alphaTest:.36}),
 cordgrass:leaf(cordgrassTex,'fs-cordgrass',{aN:false,swayW:'(position.y)',swayA:.09,alphaTest:.36}),
 heap:BIO.solidMat(grey(150,70)),crust:BIO.solidMat(grey(170,80)),brain:BIO.solidMat(grey(200,60)),coralstem:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,emissive:0x1a1614,map:grey(205,70)}),weed:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,side:T3.DoubleSide}),
 seapalm:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,side:T3.DoubleSide}),
 anemone:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff}),
 coconutnut:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,map:grey(185,45)}),
 bladder:new T3.MeshLambertMaterial({color:0xffffff,emissive:0x0c0a02})};
M.anemone.userData.bio={kind:'solid'};M.seapalm.userData.bio={kind:'solid'};M.coralstem.userData.bio={kind:'solid'};M.weed.userData.bio={kind:'solid'};M.coconutnut.userData.bio={kind:'solid'};M.bladder.userData.bio={kind:'solid'};
FARSIDE.LIB=BIO.libSwap('farside',M);
// ---------------------------------------------------------------- the buckets and the instanced items
BIO.bucket('stipe',M.stipe,{uvScale:[1.2,1.2],label:'Land kelp stipes'});
BIO.bucket('snag',M.snag,{uvScale:[3,3],label:'Dead native trees and coastal hardwoods'});
BIO.bucket('palm',M.snag,{uvScale:[1.8,3.2],label:'Drift-sown coconut and pandanus trunks'});
const IT=(name,geo,mat,label,species,o)=>BIO.def(name,geo,mat,Object.assign({label,tags:species?{species}:null},o||{}));
IT('blade0',G.streamer(6,.55,.5),M.blade0,'Land kelp blades','landkelp');IT('blade1',G.streamer(6,.55,-.4),M.blade1,'Land kelp blades','landkelp');
IT('blade2',G.streamer(6,.5,.3),M.blade2,'Land kelp blades','landkelp');
IT('bladder',G.bladder,M.bladder,'Land kelp bladders (they hold water)','landkelp');IT('bulb',G.bulb,M.bladder,'Land kelp float (a bull or elk kelp)','landkelp');
IT('kelpfar',G.tuft(),M.blade0,'Land kelp (far)','landkelp');
IT('wrackdrape',G.streamer(4,.6,.6),M.wrack,'Storm wrack','stormwrack');
IT('heap',G.lobe,M.heap,'Storm wrack (a wet heap)','stormwrack');
IT('coral0',G.tuft(),M.coral0,'Spray coral (a branching thicket)','spraycoral');IT('coral1',G.tuft(),M.coral1,'Spray coral (tubes)','spraycoral');
IT('brain',G.dome,M.brain,'Spray coral (a head)','spraycoral');
const CS=KRAND.child(BIO.host.seed>>>0,'farside-coral');
[0,1,2].forEach(v=>{IT('staghorn'+v,G.staghorn(KRAND.hash(CS,1,v)),M.coralstem,'Spray coral (a staghorn colony)','spraycoral');
 IT('plate'+v,G.plate(KRAND.hash(CS,2,v)),M.coralstem,'Spray coral (plate shelves)','spraycoral');});
IT('rim',G.rim(KRAND.hash(CS,3,0)),M.coralstem,'Spray coral (a terrace lip)','spraycoral');
IT('eelgrass',G.tuft(),M.eelgrass,'Strand eelgrass','eelgrass');
IT('seapalm',G.seapalm(),M.seapalm,'Sea palm','seapalm');
IT('wine0',G.streamer(4,.7,.5),M.wine0,'Wine weed (sheets)','wineweed');IT('wine1',G.streamer(4,.8,-.5),M.wine1,'Wine weed (fronds)','wineweed');
IT('lettuce',G.sheet(),M.lettuce,'Sea lettuce','emeraldweed');
IT('spongetower',G.tuft(),M.spongecard,'Fog sponge (towers)','fogsponge');[0,1,2].forEach(v=>IT('crust'+v,G.collar(KRAND.hash(KRAND.child(BIO.host.seed>>>0,'farside-sponge'),v),[1.1,1.7,2.4][v]),M.crust,'Fog sponge (a collar on the bark)','fogsponge'));
IT('anemone',G.anemone(),M.anemone,'Strand anemone','strandanemone');
IT('oarweed',G.oarweed(),M.weed,'Oarweed','oarweed');IT('boa',G.boa(),M.weed,'Boa kelp','boakelp');IT('grapes',G.grapes(),M.weed,'Sea grapes','seagrapes');
IT('palmfrond',G.palmFrond(5,.34,.42,.28,.075),M.palmfrond,'Coconut palm (drooping pinnate frond)','coconut');
IT('coconutnut',G.coconutCluster(),M.coconutnut,'Coconut palm (nut cluster)','coconut');
IT('pandanstrap',G.pandanStrap(),M.pandanstrap,'Strand salt-screwpine (keeled strap leaf)','farsidepandan');
IT('pandanfruit',G.pandanFruit(),M.coconutnut,'Strand salt-screwpine (compound fruit key)','farsidepandan');
IT('casspray',BIO.geo.clump(7,701),M.casspray,'Wind-sheared strand she-oak (needle crown)','strandcasuarina');
IT('casdrape',G.streamer(4,.65,.35),M.casspray,'Wind-sheared strand she-oak (weeping needles)','strandcasuarina');
IT('myrtlefol',BIO.geo.clump(8,702),M.shrubleaf,'Fog-catching coastal wax-myrtle (foliage)','waxmyrtle');
IT('fluteblade',G.streamer(5,.52,.45),M.blade1,'Flute-stipe bladder-kelp (ribbed blade)','bladderstipe');
IT('naupaka',BIO.geo.clump(7,703),M.shrubleaf,'Salt-cushion naupaka (fleshy cushion)','strandnaupaka');
IT('naupakabloom',G.gloryBloom(),M.coconutnut,'Salt-cushion naupaka (white half-flowers)','strandnaupaka');
IT('beachglory',G.gloryRunner(),M.weed,'Beach morning-glory (sand-binding runner)','beachglory');
IT('glorybloom',G.gloryBloom(),M.weed,'Beach morning-glory (funnel flower)','beachglory');
IT('rocksali',G.samphire(),M.weed,'Spray-rock samphire (succulent clump)','rocksali');
IT('seasandwort',G.sandwort(),M.weed,'Shingle sea-sandwort (fleshy star-leaf mat)','seasandwort');
IT('crimsonfan',G.dulseFan(),M.weed,'Iridescent bench dulse-fan','crimsonfan');
IT('corallinecrust',G.corallineCrust(),M.coralstem,'Calcareous coralline rim-crust','corallinecrust');
IT('tidalsedge',G.tuft(),M.cordgrass,'Salt-marsh cordgrass','tidalsedge');
const ITEM_SPECIES={blade0:'landkelp',blade1:'landkelp',blade2:'landkelp',bladder:'landkelp',bulb:'landkelp',kelpfar:'landkelp',wrackdrape:'stormwrack',heap:'stormwrack',
 coral0:'spraycoral',coral1:'spraycoral',brain:'spraycoral',staghorn0:'spraycoral',staghorn1:'spraycoral',staghorn2:'spraycoral',plate0:'spraycoral',plate1:'spraycoral',plate2:'spraycoral',rim:'spraycoral',eelgrass:'eelgrass',seapalm:'seapalm',wine0:'wineweed',wine1:'wineweed',lettuce:'emeraldweed',
 spongetower:'fogsponge',crust0:'fogsponge',crust1:'fogsponge',crust2:'fogsponge',anemone:'strandanemone',oarweed:'oarweed',boa:'boakelp',grapes:'seagrapes',palmfrond:'coconut',coconutnut:'coconut',
 pandanstrap:'farsidepandan',pandanfruit:'farsidepandan',casspray:'strandcasuarina',casdrape:'strandcasuarina',myrtlefol:'waxmyrtle',fluteblade:'bladderstipe',
 naupaka:'strandnaupaka',naupakabloom:'strandnaupaka',beachglory:'beachglory',glorybloom:'beachglory',rocksali:'rocksali',seasandwort:'seasandwort',
 crimsonfan:'crimsonfan',corallinecrust:'corallinecrust',tidalsedge:'tidalsedge'};
FARSIDE.speciesOfItem=it=>FARSIDE.byKey[ITEM_SPECIES[it]]||null;
FARSIDE.FRUIT_KEYS=[];
})();
