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
 snag:[0xcac6be,0xb8b4ac,0xd4d0c8]};
// ---------------------------------------------------------------- harvest (kits/crops: the crop each yield is filed as)
const HV=(edible,uses,crop,notes)=>({wood:'none',edible:edible||[],medicinal:false,uses:uses||[],crop:crop||null,notes:notes||'',fruit:null});
// ---------------------------------------------------------------- the species
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
  what:'small rubbery palm-shaped kelps on the surf rocks, bending flat to each gust and springing back',tags:TG('tropic..temperate','strand',{harvest:HV()})},
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
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV(),hazard:'they sting'})},
 // THE KELP FOREST'S OTHER FLORA (the owner, 2026-10-26: "more species diversity to the kelp forests"): an understorey, a
 // sprawling layer and a ground layer under the land kelp's canopy, as a real kelp forest has (the land kelp itself now also
 // grows in a third form, the elk kelp: 55-biome-farside-trees.js)
 /*9*/{key:'oarweed',name:'Oarweed',model:'oarweed, tangle (Laminaria)',habit:'fan',H:[1.2,3],
  what:'the understorey: a stiff stipe a man high, a broad blade split into straps fanned at its top and streaming inland, in thickets under the land kelp',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV(['blade'],['kelp ash'],'kelp','cut with the land kelp, dried the same')})},
 /*10*/{key:'boakelp',name:'Boa kelp',model:'feather boa kelp (Egregia)',habit:'strap',H:[.3,1],
  what:'long sprawling straps lined with small blades and floats, arching out of a holdfast and lying along the floor and over the rocks, downwind',
  tags:TG('tropic..temperate','kelpcoast',{harvest:HV([],['fodder'],null,'the goats take it first')})},
 /*11*/{key:'seagrapes',name:'Sea grapes',model:'sea grapes (Caulerpa lentillifera)',habit:'runner',H:[.05,.2],
  what:'green runners on the kelp forest\'s floor, each upright stalk a chain of glossy beads like a bunch of grapes',
  tags:TG('tropic','kelpcoast',{harvest:HV(['beads'],[],'sea-grapes','eaten fresh: the beads burst salt')})}];
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
// (2026-10-26, the owner: the first one read as yellow stakes) a thick rubbery stalk, a little bowed, and a MOP of thirteen
// narrow blades from its crown, each rising a little then drooping all round it to below the crown, darker toward the tips
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
G.bladder=new T3.SphereGeometry(1,7,5);   /* smooth (the owner, 2026-10-26: the 20-face bladders read as blocky polygons) */
G.bulb=new T3.SphereGeometry(1,12,8);   /* the bull and elk kelp's big floats: rounder still */
G.lobe=BIO.geo.lobe();
G.dome=new T3.SphereGeometry(1,7,3,0,TAU,0,Math.PI*.5);
// OARWEED: a stiff stipe (unit height to the fan's foot at .5) and a fan of seven straps from its top, rising then bowing over
// downwind (+x) so the host turns it into the wind; tips paler
G.oarweed=function(){const parts=[[new T3.CylinderGeometry(.018,.03,.5,5,1,true).translate(0,.25,0),.65]];
 for(let k=0;k<6;k++){const sp=(k-2.5)*.18,g=new T3.PlaneGeometry(.1,1,1,4),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const t=.5-p.getY(i),w=p.getX(i)*(1-.4*t);p.setX(i,.55*t*Math.cos(sp)+0*w);p.setY(i,.5+.45*Math.sin(t*1.9)-.35*t*t);p.setZ(i,.55*t*Math.sin(sp)+w);}
  g.computeVertexNormals();parts.push([g,(x,y)=>.75+.25*Math.min(1,x/.5)]);}
 return merge(parts);};
// BOA KELP: one long strap (unit length along +x) arching up from the holdfast and lying out along the floor, lined both sides
// with small blades and the odd float
G.boa=function(){const parts=[],P=[];for(let i=0;i<=10;i++){const t=i/10;P.push([t,.22*Math.sin(t*Math.PI*.9)*(1-t*.5),.04*Math.sin(t*9)]);}
 for(let i=0;i<10;i++){const a=P[i],b=P[i+1],g=new T3.PlaneGeometry(1,.035,1,1),L=Math.hypot(b[0]-a[0],b[1]-a[1]);g.scale(L,1,1);g.rotateX(-Math.PI/2);
  g.rotateZ(Math.atan2(b[1]-a[1],b[0]-a[0]));g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);parts.push([g,.7]);
  for(const sd of [-1,1]){const f=new T3.PlaneGeometry(.05,.09,1,1);f.rotateX(-Math.PI/2+sd*.5);f.translate(a[0],a[1]+.01,a[2]+sd*.05);parts.push([f,.95]);}
  if(i%3===1)parts.push([new T3.SphereGeometry(.018,4,3).translate(a[0],a[1]+.02,a[2]),1]);}
 return merge(parts);};
// SEA GRAPES: a runner along the floor (x) with upright stalks, each a short chain of beads
G.grapes=function(){const parts=[[new T3.CylinderGeometry(.006,.006,1,3,1,true).rotateZ(Math.PI/2).translate(.5,.01,0),.6]],B=new T3.OctahedronGeometry(.016,0);
 for(let k=0;k<3;k++){const x=.15+k*.3;for(let j=0;j<4;j++){const b=B.clone();b.translate(x+.008*Math.sin(j*2),.02+j*.024,.008*Math.cos(j*3));parts.push([b,.85+.03*j]);}}
 return merge(parts);};
// THE SPRAY CORAL IN 3D (the owner, 2026-10-26: the cards alone read samey on the terraces). Three colony shapes, each built
// once from its own core/rand stream into one vertex-coloured mesh (unit height, origin at the foot), in three variants:
//   staghorn  a short trunk forking twice into upturned, tapering branches with rounded tips (Acropora)
//   plate     a stem carrying stacked, offset shelves, each a flattened disc a little dished (table and plate corals: the terraces in small)
//   rim       a lumpy ridge along x, lying on the ground: the coral lip along a terrace's riser, as rimstone dams are
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
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);p.setY(i,p.getY(i)+.06*(px*px+pz*pz)/(r*r));}   /* dished up at the rim */
  g.computeVertexNormals();g.translate(Math.cos(a)*o,y,Math.sin(a)*o);parts.push([g,.85+.15*s.next()]);}
 return merge(parts);};
G.rim=function(seed){const s=KRAND.stream(seed),parts=[];for(let k=0;k<7;k++){const x=-.5+k/6,r=.11+.08*s.next(),g=new T3.SphereGeometry(1,7,4,0,TAU,0,Math.PI*.55);
  g.scale(r*1.5,r*(1+.6*s.next()),r);g.translate(x,-.02,(s.next()-.5)*.06);parts.push([g,(px,py)=>.8+.2*Math.min(1,py/.15)]);}
 return merge(parts);};
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
 heap:BIO.solidMat(grey(150,70)),crust:BIO.solidMat(grey(170,80)),brain:BIO.solidMat(grey(200,60)),coralstem:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,emissive:0x1a1614,map:grey(205,70)}),weed:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,side:T3.DoubleSide}),
 seapalm:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff,side:T3.DoubleSide}),
 anemone:new T3.MeshLambertMaterial({vertexColors:true,color:0xffffff}),
 bladder:new T3.MeshLambertMaterial({color:0xffffff,emissive:0x0c0a02})};
M.anemone.userData.bio={kind:'solid'};M.seapalm.userData.bio={kind:'solid'};M.coralstem.userData.bio={kind:'solid'};M.weed.userData.bio={kind:'solid'};M.bladder.userData.bio={kind:'solid'};
FARSIDE.LIB=BIO.libSwap('farside',M);
// ---------------------------------------------------------------- the buckets and the instanced items
BIO.bucket('stipe',M.stipe,{uvScale:[1.2,1.2],label:'Land kelp stipes'});
BIO.bucket('snag',M.snag,{uvScale:[3,3],label:'Dead native trees'});
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
IT('spongetower',G.tuft(),M.spongecard,'Fog sponge (towers)','fogsponge');IT('crust',G.lobe,M.crust,'Fog sponge (a crust)','fogsponge');
IT('anemone',G.anemone(),M.anemone,'Strand anemone','strandanemone');
IT('oarweed',G.oarweed(),M.weed,'Oarweed','oarweed');IT('boa',G.boa(),M.weed,'Boa kelp','boakelp');IT('grapes',G.grapes(),M.weed,'Sea grapes','seagrapes');
const ITEM_SPECIES={blade0:'landkelp',blade1:'landkelp',blade2:'landkelp',bladder:'landkelp',bulb:'landkelp',kelpfar:'landkelp',wrackdrape:'stormwrack',heap:'stormwrack',
 coral0:'spraycoral',coral1:'spraycoral',brain:'spraycoral',staghorn0:'spraycoral',staghorn1:'spraycoral',staghorn2:'spraycoral',plate0:'spraycoral',plate1:'spraycoral',plate2:'spraycoral',rim:'spraycoral',eelgrass:'eelgrass',seapalm:'seapalm',wine0:'wineweed',wine1:'wineweed',lettuce:'emeraldweed',
 spongetower:'fogsponge',crust:'fogsponge',anemone:'strandanemone',oarweed:'oarweed',boa:'boakelp',grapes:'seagrapes'};
FARSIDE.speciesOfItem=it=>FARSIDE.byKey[ITEM_SPECIES[it]]||null;
FARSIDE.FRUIT_KEYS=[];   /* no fruit: what is eaten here is weed, filed as crops (kits/crops: kelp, wine weed, sea lettuce) */
})();
