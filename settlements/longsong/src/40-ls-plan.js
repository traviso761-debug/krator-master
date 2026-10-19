// ================================================================= LONGSONG — the plan as data
// [G data] Plain numbers and pure functions: no THREE, no DOM, no Math.random. Everything the page draws is read from
// here (the builders draw records; they never decide where a thing goes), and everything here exists whether or not it
// is drawn (the Vault, the people indoors). PLAN.md says why each number is what it is; BLUEPRINT.md is the programme.
//
// THE FRAME. Page metres: x east, z south, y up. The page's origin is the monastery's: the foot of Longsong's rock on
// its north face, at the head of the avenue, which is the scale model's ground at LS.SITE (world metres of the region
// cut, region/data: x = (px - 955) * 2000, z = (py - 1295) * 2000). y 0 is the model's height there (WORLD_H0).
// The blueprint's frame maps straight onto it: u (from the Great Gate uphill) is +z, v (across) is +x; the grounds are
// x -200..200, z -200..200, the Great Gate in the north wall. The monastery faces NORTH: Krator's settlements lie near
// 40 degrees south, so the sun stands in the north and lights the White Palace's face all day (as the Potala's south
// face is lit at Lhasa), the Longsong stream runs east-west 90 m in front of the gate, the valley's southern wall rises
// behind: the mountain at the back, the water in front.
var LS=(function(){'use strict';
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const P={};

// ---------------------------------------------------------------- the site (PLAN.md section 1)
// px 954, 1296 on the scale model (4.21): the gentle apron south of the Longsong stream (Lõsõ-bi Siṭrīm, r105, ~40 m3/s
// here, its bed ~2,050 m), 7 km west-south-west of the model's Longsong marker (957,1294), which sits on the medial swell
// between the valley's two streams 8 km from either. The apron rises ~3 % to the southern wall's foot 4 km south; the
// lake the stream feeds (2,000 m) is 40 km west.
P.SITE={wx:-2000,wz:2080,px:954,py:1296,name:'Longsong',marker:{px:957,py:1294}};
// the Longsong stream runs WEST here (to the highland lake at 2,000 m, 40 km west): the page's stream takes its level from
// the east end down (45: STREAM). The model's 4 km levels inside the page cannot say which way it runs (both ends stand
// higher than the dip at the site), so the plan does
P.STREAM_FLOW=[-1,0];
// what stands round the sky from here (the Oidong kit's sky takes it: OIDONG_SKY), read off the scale model's regions on
// 2026-10-19 (region/source/regions.json): the Throne ('Throne/Volcano', centroid px 571,514) bears 334 degrees, 1,740 km
// off; the Oidong Valley (px 725-1035 by 1234-1350) runs west-north-west, so the pass toward Xanadu is down-valley at
// about 292 and the head wall up-valley at 112; the model has no cataract at the valley's head (the showcase's own)
P.SKY={head:112,pass:292,throne:334,cataract:false};
P.toWorld=(x,z)=>[x+P.SITE.wx,z+P.SITE.wz];

// ---------------------------------------------------------------- the rock: Longsong's hill
// A granite knoll on the apron, authored finer than the model's 4 km cells (as Pinnacle Rock's gorge is): a level top
// at y TOP over the ward, a steep north face (the Great Stair climbs it, the White Palace's base masks its middle), a
// cliff on the east (the hermits' cells), a terraced west flank (the physic terraces), a slope south to the rear
// gardens. Its outline is a superellipse with a radius per side.
P.ROCK={cx:0,cz:95,top:40,p:2.6,aE:160,aW:210,bN:95,bS:118,plateau:.8,name:"Longsong's rock (granite)",seed:3301};
// r: 0 at the centre, 1 at the foot; dir: which side
P.rockR=function(x,z){const R=P.ROCK,dx=x-R.cx,dz=z-R.cz,a=dx>0?R.aE:R.aW,b=dz<0?R.bN:R.bS;
 return Math.pow(Math.pow(Math.abs(dx)/a,R.p)+Math.pow(Math.abs(dz)/b,R.p),1/R.p);};
// the rock's surface over the datum (no noise: the host adds its texture). -1e9 off the rock.
P.rockY=function(x,z){const R=P.ROCK,r=P.rockR(x,z);if(r>=1.18)return -1e9;
 const dx=x-R.cx,dz=z-R.cz,ang=Math.atan2(dz,dx);   // 0 east, +pi/2 south, -pi/2 north, pi west
 const east=Math.max(0,Math.cos(ang)),west=Math.max(0,-Math.cos(ang)),north=Math.max(0,-Math.sin(ang));
 const t=clamp((r-R.plateau)/(1-R.plateau),0,1.6);
 // the face's profile: a convex shoulder then the face; the east is a cliff, the west steps down in terraces
 const f0=1-Math.pow(clamp(t,0,1),lerp(1.6,3.6,Math.max(east,north*.8)));
 // the west flank in five terraces (treads level, risers steep), blended in by how far west the point faces
 const lin=1-clamp(t,0,1),q=(1-lin)*5,fl=Math.floor(q),fq=1-(fl+smooth(.72,1,q-fl))/5;
 let f=lerp(f0,fq,smooth(.25,.75,west));
 if(t>=1)f=0;
 return R.top*clamp(f,0,1);};

// ---------------------------------------------------------------- the ward and the grounds
// The ward (the Potala's Shöl): the walled town at the rock's north foot, graded in three terraces stepping up from the
// gate to the rock (the model's ground falls ~10 m to the stream across it).
P.GROUNDS={x0:-200,x1:200,z0:-200,z1:200};
P.WARD={x0:-196,x1:196,z0:-196,z1:2,terraces:[{z0:-200,z1:-130,y:-7.5},{z0:-130,z1:-60,y:-4.5},{z0:-60,z1:4,y:-1.5}]};
P.wardY=function(z){const T=P.WARD.terraces;for(let i=0;i<T.length;i++)if(z<T[i].z1)return T[i].y;return T[T.length-1].y;};
P.inGrounds=(x,z,m)=>{m=m||0;const G=P.GROUNDS;return x>G.x0-m&&x<G.x1+m&&z>G.z0-m&&z<G.z1+m;};
P.inWard=(x,z)=>{const W=P.WARD;return x>W.x0&&x<W.x1&&z>W.z0&&z<W.z1;};
// the outer wall: 7 m of whitewashed stone on a granite plinth, a red band under its merlons; corner towers; the Great
// Gate in the north side, three posterns (west, east, south); it climbs over the rock's south shoulder
P.WALL={h:7,t:3.2,towers:[[-200,-200],[200,-200],[200,200],[-200,200],[-200,0],[200,0]],
 gates:[{id:'gate-great',side:'n',x:0,w:14,name:'The Great Gate'},{id:'gate-west',side:'w',z:-95,w:4,name:'The west postern'},
  {id:'gate-east',side:'e',z:-95,w:4,name:'The east postern'},{id:'gate-south',side:'s',x:-120,w:4,name:'The south postern (the rear gardens, the mountain)'}]};

// ---------------------------------------------------------------- the ways
// the avenue from the gate to the Great Stair's foot, the pilgrims' square inside the gate; the outer kora round the
// rock's foot (the pilgrims walk it without entering); the Great Stair: three ramps up the north face to the Lower Gate
P.AVENUE={x0:-9,x1:9,z0:-196,z1:-2};
P.SQUARE={x0:-48,x1:48,z0:-196,z1:-160,name:"The Chapterhouse Court (the pilgrims' square)"};
// the Chapterhouse Court (ROOMS.md 2.2): the chapter house's circular forecourt inside the gate: the curved wall of
// carved glyph panels on its west and east arcs (the axis open), two blue mosaic reflecting pools either side of the
// path, the tea rotunda (eight posts under a terracotta cone) and the stele of the Order's vow
P.COURT={x:0,z:-176,r:21,wallH:3.4,arcs:[[2.0,4.28],[-1.14,1.14]],pools:[{x:-11,z:-176,r:6.5},{x:11,z:-176,r:6.5}],
 rotunda:{x:34,z:-180,r:4.6,name:'The tea rotunda (eight posts under a tile cone)'},stele:{x:-34,z:-180,name:'The stele of the Order\'s vow: seen, said, inferred; held, not hidden'}};
// the mani wall along the road to the bridge (ROOMS.md 2.1): carved stones, prayers and the containment's glyphs ("what
// is written here is held here"); the pilgrims keep it on their right as they walk to the gate; a chorten at each end
P.MANI={pts:[[-178,-217],[-148,-219],[-118,-220]],h:1.5,w:1.8,name:'The mani wall (prayers, and the containment\'s glyphs: what is written here is held here)'};
// the chorten garden outside the east postern (ROOMS.md 2.1): the Order's dead who are not founders, small chortens in
// rows among juniper and incense cedar; the sang burner
P.CHORTEN_GARDEN={x0:240,x1:330,z0:-140,z1:-62,rows:4,per:6,s:.32,burner:{x:250,z:-100},name:'The chorten garden (the Order\'s dead)'};
// the Garden of Held Water behind the masters' cells (ROOMS.md 2.3): moss and stone, a fountain whose jets hang in the
// air, the held cherry (in flower two hundred years, its petals stopped as they fall)
P.HELD={x0:-94,x1:-46,z0:176,z1:198,fountain:{x:-70,z:187,r:3.2},cherry:{x:-56,z:192},name:'The Garden of Held Water'};
// the Great Stair (the Potala's): three ramps zigzag across the White Palace's base, each a solid masonry wedge with
// white parapets, from the forecourt at the avenue's head to the base's top, where the Lower Gate stands
// Each ramp has its own band, stepping back toward the wall as it climbs (the Potala's: the lower runs stand in front of
// the upper, whose masonry rises behind them; 2026-10-19: they had shared one band and cut through one another); a
// landing joins each turn across the two bands, and the top landing reaches back to the base's top (z 8)
P.STAIR=[{x0:-6,x1:-66,y0:-1.5,y1:12,z0:-9.5,z1:-3.5},{x0:-66,x1:64,y0:12,y1:26,z0:-3.5,z1:2.5},{x0:64,x1:-34,y0:26,y1:40,z0:2.5,z1:8.5}];
P.STAIR_Z=[-9.5,8.5];   // the stair's whole band in front of the base's face (z)
P.LANDING=8;           // a landing's length along the face (m)
P.KORA={cx:0,cz:95,a:235,b:150,w:5,name:'The outer kora (the pilgrims\' circuit of the rock)'};
// outside the wall: the track from the west (the valley road to the pass and Xanadu) along the stream's south bank to
// the bridge before the gate; the lotus pond between the wall and the stream
// (2026-10-19: it bends south round the Mirror, between the pond and the wall's north-west tower; it had run through the water)
P.TRACK=[[-1500,-240],[-900,-250],[-560,-240],[-420,-200],[-330,-172],[-262,-170],[-228,-186],[-220,-214],[-170,-226],[-60,-227],[0,-225],[0,-200]];
P.BRIDGE={x:0,z:-290,w:8,L:70,y:3,name:'The bridge of the Longsong stream'};
P.TRACK_N=[[0,-330],[0,-420],[-200,-700],[-600,-1400]];   // north of the bridge, toward the valley's floor
P.POND={x:-290,z:-235,r:52,y:-9.4,depth:3.2,name:'The Mirror of Longsong (the lotus pond)'};

// ---------------------------------------------------------------- the buildings (BLUEPRINT.md L0, L1-L4, R1-R3, LR)
// kind: what the kit draws (house, court, mass, red, drum, gate, tower, spire, chorten, wheels, gallery, cell, roofhall)
// base: 'ward' (the ward's terrace under it), 'rock' (the top, y 40), or a number; floors x storey (m); types: core/tags'.
// Every one is a core/tags record (class building, culture order) registered before it is drawn.
const B=[];
const b=(o)=>{o.storey=o.storey==null?4.2:o.storey;o.floors=o.floors==null?2:o.floors;B.push(o);return o;};
// --- the ward, west rows (L0): the presses, the stores, the workshops, the wardens
b({id:'paper-mill',name:'The paper mill',kind:'house',x:-150,z:-178,w:62,d:22,floors:2,base:'ward',types:['industry'],sheet:'L0',note:'the Order\'s copies go to the chapterhouses on this paper'});
b({id:'printing-house',name:'The printing house (the Order\'s press: a small Archive, brick fins under a wavy roof)',kind:'archive',x:-150,z:-138,w:70,d:34,a:31,b:14,floors:2,base:'ward',types:['industry','civic'],sheet:'L0',
 note:'ROOMS.md 2.2: the press hall, the woodblock store, the composing room, the drying loft, the bindery, the dispatch room'});
b({id:'granary-w',name:'The granaries',kind:'house',x:-160,z:-98,w:46,d:24,floors:3,base:'ward',types:['infrastructure','farm'],sheet:'L0'});
b({id:'smithy',name:'The smiths and the lens workshop',kind:'court',x:-150,z:-62,w:70,d:30,floors:1,storey:5,base:'ward',types:['industry'],sheet:'L0'});
b({id:'barracks',name:"The wardens' barracks",kind:'court',x:-90,z:-110,w:44,d:52,floors:2,base:'ward',types:['civic','military','dwelling-multi'],sheet:'L0'});
b({id:'carpenters',name:'The carpenters',kind:'house',x:-82,z:-62,w:30,d:16,floors:1,storey:5,base:'ward',types:['industry'],sheet:'L0'});
// --- the ward, east rows: the travellers, the Geomancers, the lay servants, the market, the infirmary, the dairy
b({id:'caravanserai',name:'The caravanserai',kind:'court',x:150,z:-170,w:72,d:46,floors:2,base:'ward',types:['inn','market'],sheet:'L0'});
b({id:'hostel',name:"The pilgrims' hostel",kind:'house',x:82,z:-178,w:44,d:20,floors:3,base:'ward',types:['inn','religious'],sheet:'L0'});
b({id:'geomancers',name:"The Geomancers' lodge (walled; Yuni's friends)",kind:'court',x:152,z:-112,w:62,d:44,floors:2,base:'ward',types:['civic','inn'],sheet:'L0',wealth:'rich'});
b({id:'servants',name:"The lay servants' houses",kind:'house',x:82,z:-128,w:46,d:18,floors:2,base:'ward',types:['dwelling-multi'],sheet:'L0',wealth:'middle'});
b({id:'market',name:'The market hall and the tea houses',kind:'house',x:86,z:-96,w:40,d:16,floors:1,storey:5,base:'ward',types:['market','tavern'],sheet:'L0'});
b({id:'infirmary',name:"The ward's infirmary (for travellers)",kind:'house',x:150,z:-62,w:56,d:22,floors:2,base:'ward',types:['civic'],sheet:'L0'});
// the Order's own in the ward (ROOMS.md 2.2, 5.2): the operatives' drill hall in the School's form (undulating brick on a
// white dado, parabolic heads, a warped conoid roof), across the avenue from the drill ground; the dye house by the dye garden
b({id:'hall-of-forms',name:'The Hall of Forms (the operatives\' drill hall; the Room of Slow Water)',kind:'school',x:40,z:-88,w:34,d:22,floors:1,storey:7,base:'ward',types:['military','civic'],sheet:'L0',
 note:'ROOMS.md 2.2: the sprung floor, the weapons racks, the Room of Slow Water (a basin whose falling water is held), the masters\' room'});
b({id:'dye-house',name:'The dye house (the vats; the robes\' saffron and the Order\'s blue)',kind:'house',x:-45,z:-111,w:22,d:9,floors:1,storey:4.2,base:'ward',types:['industry'],sheet:'L0'});
b({id:'dairy',name:'The dairy',kind:'house',x:86,z:-56,w:34,d:16,floors:1,storey:4.5,base:'ward',types:['farm','industry'],sheet:'L0'});
// --- the gate, the corner towers are drawn from P.WALL; the gate's house over the parabolic arch
b({id:'gatehouse',name:'The Great Gate: the parabolic arch between two pylons (the Order\'s), the gatehouse over it',kind:'gate',x:0,z:-200,w:46,d:16,floors:2,storey:5,base:'ward',types:['civic','infrastructure'],sheet:'L0'});
// --- the Lower Gate at the head of the Great Stair, flanked by the paired drums (the chapterhouses' form)
b({id:'lower-gate',name:'The Lower Gate and the hall of pillars (the paired drums)',kind:'lowergate',x:-30,z:25,w:40,d:12,floors:2,storey:4.5,base:'rock',types:['civic','religious'],sheet:'L1'});
// --- the White Palace: the living Order (L1 base, L2 the School, L3 and L4), a hollow square round the Debate Court
b({id:'white-palace',name:'The White Palace (the School, the cells, the refectory, Testimony, the Restoration Halls, the library)',kind:'mass',
 x:0,z:58,w:190,d:74,floors:5,storey:4.5,base:'rock',types:['religious','civic','dwelling-multi'],sheet:'L1-L4',
 court:{x0:-34,x1:34,z0:30,z1:72},ranges:{front:4,outer:4,inner:5,back:4},
 base0:{x0:-95,x1:95,z0:8,z1:21,y0:-1.5,y1:40,name:'The White Palace\'s base (the storerooms, the granary, the cisterns: L1)'}});
b({id:'debate-court',name:'The Debate Court (open from the School to the sky, curved arcaded galleries)',kind:'gallery',x:0,z:51,w:68,d:42,floors:2,storey:4.5,base:'rock',types:['religious','civic'],sheet:'L2'});
b({id:'assembly',name:'The Great Assembly Hall (a drum under a tile cone and lantern, the skylight columns inside)',kind:'drum',x:0,z:82,r:14,floors:6,storey:4.5,base:'rock',types:['religious','civic'],sheet:'L3',cone:13,lantern:true,winFrom:4});
// --- the Red Palace: what the Order is for (R1 the Founders and the inner kora, R2 the Archive, R3 the Chronicle,
// the Council, the Abbot, the Hall of Stillness), stepping up behind and over the White Palace
b({id:'red-palace',name:'The Red Palace (the Founders\' tombs, the Great Archive, the Chronicle Hall, the Council, the Abbot)',kind:'red',
 x:0,z:122,w:120,d:56,floors:9,storey:4.5,base:'rock',types:['religious','funerary','civic'],sheet:'R1-R3',wealth:'rich',roundWindows:true});
b({id:'red-wings',name:'The Red Palace\'s wings (the conservators, the map room, the chroniclers)',kind:'red',x:0,z:128,w:170,d:40,floors:6,storey:4.5,base:'rock',types:['civic'],sheet:'R2',wealth:'rich'});
// --- the roof (LR): the gilded roofs over the Chronicle Hall and the two Founders' halls, the Hall of Hours, the
// Observatory, the Eastern Watch, the masters' meditation cells
b({id:'gilt-chronicle',name:'The gilded roof over the Chronicle Hall',kind:'roofhall',x:0,z:120,w:22,d:16,floors:1,storey:5,base:40+9*4.5,types:['religious'],sheet:'LR',gilt:true});
b({id:'gilt-founders-w',name:"The gilded roof over the West Founders' hall",kind:'roofhall',x:-36,z:126,w:14,d:12,floors:1,storey:4.5,base:40+9*4.5,types:['funerary','religious'],sheet:'LR',gilt:true});
b({id:'gilt-founders-e',name:"The gilded roof over the East Founders' hall",kind:'roofhall',x:36,z:126,w:14,d:12,floors:1,storey:4.5,base:40+9*4.5,types:['funerary','religious'],sheet:'LR',gilt:true});
b({id:'hall-of-hours',name:'The Hall of Hours (the water, sand and Ancient clocks; its dial faces the valley)',kind:'drum',x:-62,z:118,r:8,floors:2,storey:4.5,base:40+6*4.5,types:['civic'],sheet:'LR',cone:7,lantern:false,clock:true});
b({id:'observatory',name:'The Observatory',kind:'drum',x:66,z:120,r:6.5,floors:2,storey:4.5,base:40+6*4.5,types:['civic'],sheet:'LR',cone:0,dome:true});
b({id:'eastern-watch',name:"The Eastern Watch (the Order's bell; instruments that read the Lizardmen's strangeness)",kind:'louvre',r:5.4,x:96,z:118,w:11,d:11,floors:11,storey:4.5,base:'rock',types:['civic','religious'],sheet:'LR'});
b({id:'meditation',name:"The masters' meditation cells (the rear terrace)",kind:'house',x:-70,z:168,w:44,d:12,floors:1,storey:3.6,base:'rock',types:['religious','dwelling-single'],sheet:'LR'});
b({id:'rear-shrine',name:'The rear shrine and the spring house',kind:'house',x:52,z:170,w:24,d:14,floors:1,storey:4.5,base:'rock',types:['religious'],sheet:'R1'});
// --- the Closed Ward (L1: the people held, kindly) and the specimen hall beside it, on the rock's west shoulder
b({id:'closed-ward',name:'The Closed Ward (one door, one warden; a garden open to the sky)',kind:'court',x:-130,z:70,w:56,d:46,floors:2,storey:4.2,base:'rock',types:['civic','dwelling-multi'],sheet:'L1',contain:'LS-P'});
b({id:'specimen-hall',name:'The specimen hall',kind:'house',x:-132,z:120,w:40,d:18,floors:2,storey:4.2,base:'rock',types:['civic'],sheet:'L1',contain:'LS-S'});
// the hermits' cells on the east cliff (reached by ladders)
P.HERMITS=[[160,30,14],[163,52,22],[158,74,9],[162,96,26],[157,118,16],[160,140,30]].map((c,i)=>({id:'hermit-'+i,x:c[0],z:c[1],y:c[2]}));
P.BUILDINGS=B;
P.building=id=>B.find(o=>o.id===id)||null;
P.baseY=o=>typeof o.base==='number'?o.base:o.base==='rock'?P.ROCK.top:P.wardY(o.z);
P.topY=o=>P.baseY(o)+o.floors*o.storey;

// ---------------------------------------------------------------- the sacred furniture of the grounds
// chortens (white stupas, gilt finials): at the gate, at the stair's foot, at the kora's corners
P.CHORTENS=[{x:-26,z:-185,s:1},{x:26,z:-185,s:1},{x:-20,z:-17,s:1.4},{x:20,z:-17,s:1.4},{x:-215,z:-160,s:.9},{x:215,z:-160,s:.9},{x:-232,z:240,s:1.1},{x:150,z:255,s:1.1},{x:0,z:-150,s:2.2,name:'The Great Chorten (the Order\'s founders\' first relics)'}];
// prayer-wheel galleries: the drum rows along the avenue and round the rock's foot (the kora's inner edge)
// each wheel's turning (rad/s; 0: nobody has passed it lately): a third stand still, the rest turn clockwise seen from
// above (as the pilgrims walk) at their own pace; seeded per wheel (core/rand), so a row built alone turns the same
P.wheelSpin=i=>{const u=KRAND.unit(KRAND.hash(97,i));return u<.34?0:(u<.67?1.6:-2.4)*(.6+u);};
P.WHEELS=[{x0:-13,z0:-150,x1:-13,z1:-20},{x0:13,z0:-150,x1:13,z1:-20},{x0:-195,z0:212,x1:195,z1:212},{x0:-222,z0:-25,x1:-222,z1:180},{x0:222,z0:-25,x1:222,z1:180}];
// prayer flags: lines from the roofs and the Watch to the ground, and across the stream
// a: [x, y, z] (y over the datum), or [x, h, z, 'pole']: a pole h m over the ground there
P.FLAGS=[{a:[96,40+11*4.5+1,118],b:[124,40+8,96,'pole']},{a:[96,40+11*4.5+1,118],b:[120,40+8,150,'pole']},{a:[96,40+11*4.5+1,118],b:[70,40+6*4.5+2,140]},
 {a:[-30,10,-258,'pole'],b:[30,10,-318,'pole']},{a:[30,10,-258,'pole'],b:[-30,10,-318,'pole']},
 {a:[-26,9,-196,'pole'],b:[26,9,-196,'pole']},{a:[-22,40+12,24,'pole'],b:[-70,40+4*4.5+1,21]},{a:[22,40+10,24,'pole'],b:[70,40+4*4.5+1,21]},
 {a:[-40,9,-150,'pole'],b:[40,9,-150,'pole']},{a:[-24,9,-110,'pole'],b:[24,9,-110,'pole']}];
// the Order's electric lamps: posts along the avenue (the salvaged generator reaches the avenue, the Vault, the
// Restoration Halls, the Hall of Hours: BLUEPRINT.md, "Finishes")
P.LAMPS=[];for(let z=-180;z<=-20;z+=20){P.LAMPS.push({x:-17,z},{x:17,z});}

// ---------------------------------------------------------------- the planted ground (the kit grows only here inside the wall)
// gardens, orchards and terraces the Oidong kit plants; everything else inside the wall is built, paved or raked
P.GARDENS=[{id:'orchard-w',x0:-196,x1:-112,z0:-40,z1:2,name:"The ward's orchard and the beehives"},
 {id:'kitchen-e',x0:112,x1:196,z0:-40,z1:2,name:'The kitchen gardens'},
 {id:'physic',x0:-200,x1:-150,z0:20,z1:190,name:'The physic terraces (the monks\' medicinal plants)'},
 {id:'rear',x0:-40,x1:150,z0:182,z1:200,name:'The upper orchards'},
 {id:'spring',x0:100,x1:150,z0:150,z1:182,name:'The spring garden'},
 {id:'dye',x0:-66,x1:-24,z0:-104,z1:-66,name:'The dye garden'}];
P.RESERVOIR={x:-120,z:188,w:46,d:18,y:P.ROCK.top-6,name:'The reservoir'};
// the raked court: the zen garden of the Order inside the west postern (the stones in threes)
P.RAKED={x0:-60,x1:-24,z0:-150,z1:-120,name:'The raked court (the stones in threes)'};
P.DRILL={x:-50,z:-30,w:44,d:30,name:"The wardens' and operatives' drill ground"};

// ---------------------------------------------------------------- the Vault (BLUEPRINT.md LV; LORE.md 6.15)
// Reached by one stair from the Red Palace (the Deep Stair, from R1 behind the kora) through the Warden's gate, under
// the rock. y is page metres. The rooms are boxes (x0,x1,z0,z1,y0,h); the Procrastinator's hall is a drum far under them.
P.VAULT_Y=-14;
P.VAULT=[
 {id:'deep-stair',name:'The Deep Stair (one stair down, no other way)',x0:40,x1:48,z0:96,z1:150,y0:-14,h:58,shaft:true,cls:'bare'},
 {id:'wardens-gate',name:"The Warden's gate and the keepers' vestibule (the register)",x0:24,x1:56,z0:80,z1:96,y0:-14,h:7,cls:'plain'},
 {id:'open-vault',name:'The open vault (the relics on their shelves, each under its card)',x0:-56,x1:24,z0:74,z1:102,y0:-14,h:9,cls:'plain',shelves:true},
 {id:'closed-vault',name:'The closed vault (the cells behind the seals)',x0:-56,x1:-8,z0:102,z1:126,y0:-14,h:7,cls:'plain',cells:8},
 {id:'quiet-cells',name:'The three quiet cells (the time relics: lead-lined, a bell at each door, no clocks in the passage)',x0:-82,x1:-56,z0:84,z1:120,y0:-14,h:5,cls:'bare',quiet:3},
 {id:'unmaking',name:'The Unmaking Room (for what must not exist)',x0:56,x1:76,z0:100,z1:116,y0:-14,h:6,cls:'bare'},
 {id:'oath-room',name:'The Oath Room',x0:-30,x1:-6,z0:56,z1:74,y0:-14,h:6,cls:'rich'},
 {id:'sealed-library',name:'The Sealed Library (the quarantine of knowledge: one reading room, one desk)',x0:-6,x1:30,z0:46,z1:74,y0:-14,h:8,cls:'rich',stacks:true},
 {id:'spiral',name:'The Long Stair down to the Procrastinator (the eldest keepers only)',x0:-8,x1:8,z0:114,z1:130,y0:-62,h:55,shaft:true,cls:'bare'},
 // the two passages where rooms do not meet (2026-10-19)
 {id:'unmaking-passage',name:'The passage to the Unmaking Room',x0:48,x1:56,z0:100,z1:104,y0:-14,h:3.4,cls:'bare'},
 {id:'stair-foot',name:'The foot of the Long Stair (the last passage before the hall)',x0:-2.2,x1:2.2,z0:130,z1:134,y0:-62,h:4.6,cls:'bare'}];
// THE DOORS between the rooms (2026-10-19: the rooms had been separate boxes): each in a wall two rooms share, on axis
// 'x' (the wall at x = at, the opening from s0 to s1 along z) or 'z' (at z, from s0 to s1 along x), from the floor y0,
// h high. The rooms all join, from the Deep Stair down to the Procrastinator's hall (VCHK.joined)
P.VAULT_DOORS=[
 {a:'deep-stair',b:'wardens-gate',axis:'z',at:96,s0:41.6,s1:46.4,y0:-14,h:3.2},
 {a:'wardens-gate',b:'open-vault',axis:'x',at:24,s0:85.6,s1:90.4,y0:-14,h:3.4},
 {a:'open-vault',b:'closed-vault',axis:'z',at:102,s0:-34,s1:-30,y0:-14,h:3.2},
 {a:'open-vault',b:'quiet-cells',axis:'x',at:-56,s0:88,s1:91.2,y0:-14,h:3},
 {a:'open-vault',b:'oath-room',axis:'z',at:74,s0:-20,s1:-16.4,y0:-14,h:3.2},
 {a:'open-vault',b:'sealed-library',axis:'z',at:74,s0:4,s1:7.6,y0:-14,h:3.2},
 {a:'deep-stair',b:'unmaking-passage',axis:'x',at:48,s0:100.4,s1:103.6,y0:-14,h:3},
 {a:'unmaking-passage',b:'unmaking',axis:'x',at:56,s0:100.4,s1:103.6,y0:-14,h:3},
 {a:'closed-vault',b:'spiral',axis:'x',at:-8,s0:116,s1:119.6,y0:-14,h:3.2},
 {a:'spiral',b:'stair-foot',axis:'z',at:130,s0:-1.7,s1:1.7,y0:-62,h:4.2},
 {a:'stair-foot',b:'procrastinator-hall',axis:'z',at:134,s0:-1.7,s1:1.7,y0:-62,h:4.6}];
// THE PROCRASTINATOR: a prayer wheel the size of a tower, turning on its axle in a drum-shaped hall cut far under the
// rock. Its glyphs burn; the keepers turn it at every bell and it is never let stop. Its field slows time inside the
// eight seals round the hall's wall to a near standstill (LORE.md 6.15: the Monks are said to speed time and slow it;
// they cannot travel in it). Only the eldest monks know the full extent of what it holds back.
P.PROCRASTINATOR={id:'procrastinator',name:'The Procrastinator',x:0,z:160,y0:-62,hallR:26,hallH:34,wheelR:7.2,wheelH:19,
 turn:.035,   // rad/s: one turn in three minutes
 slow:1e-4,   // the time inside the seals runs at a ten-thousandth of the keepers'
 note:'A prayer wheel the size of a tower, its drum cast with bands of glyphs that burn; turned by three keepers at every bell, never stopped. Its field holds the sealed things round it at a ten-thousandth of our time.'};
// the sealed things (the Order's register: designation, what it is, its class in the keepers' words, the procedure)
// class: STILL (inert while the wheel turns), SLOWED (moves, a hair a year), HELD (would act at once if the wheel stopped),
// UNWRITTEN (the register leaves it blank)
P.SEALED=[
 {id:'LS-001',name:'The Hungry Hour',kind:'entity',cls:'HELD',form:'shade',
  what:'A tall shape of many arms, caught in the middle of a lunge; its nearest hand is an arm\'s length from the lattice. It has been moving toward it for four hundred years.',
  proc:'Turn the wheel. Never stop the wheel. Do not stand in front of the seal while the bell is ringing.'},
 {id:'LS-002',name:'The Bell That Rings Backward',kind:'object',cls:'SLOWED',form:'bell',
  what:'A cracked bronze bell in mid-swing. The ring of its last stroke hangs round it, visible, a ripple in the air; when it reaches the walls, every bell in the valley will have rung before it was struck.',
  proc:'No bell is rung within the hall. The keepers count the hours by the Hall of Hours\' water clock.'},
 {id:'LS-003',name:'The Unfinished Fire',kind:'object',cls:'SLOWED',form:'fire',
  what:'A brazier of black flame, each tongue still as glass. What it burns is not on the register; the ash under it is the colour of old paper.',
  proc:'No paper, no book and no copy of the register enters the hall. The keepers recite.'},
 {id:'LS-004',name:'The Moth of Many Eyes',kind:'entity',cls:'HELD',form:'moth',
  what:'A moth the width of a cart, its wings half raised, an eye on every scale. Pilgrims who have dreamed of it describe it accurately.',
  proc:'Keepers who dream of it are relieved of the wheel for one season and walk the outer kora daily.'},
 {id:'LS-005',name:'The Falling Drop',kind:'object',cls:'STILL',form:'drop',
  what:'One drop of black water a hand above a stone basin. The Chronicle says that when it lands the valley floods; the Chronicle does not say from where.',
  proc:'The basin is kept dry. The drop is measured each year against the scribed line; it has fallen the width of a hair in a century.'},
 {id:'LS-006',name:'The Second Sun',kind:'entity',cls:'HELD',form:'sun',
  what:'A small sun, stopped in the middle of a flare, its arcs frozen in loops round it. Brought down from the eastern highlands when the old monastery burned; it may be why it burned.',
  proc:'The keepers wear the blue glass. No one looks at it for longer than one breath.'},
 {id:'LS-007',name:'The Smiling Door',kind:'object',cls:'HELD',form:'door',
  what:'A door with no wall, a finger\'s width ajar. Something on the other side is pushing, and has been since before the Cataclysm.',
  proc:'Its seal is renewed at every bell. It is never addressed by name inside the hall.'},
 {id:'LS-008',name:'(left blank)',kind:'unknown',cls:'UNWRITTEN',form:'empty',
  what:'An empty seal. The lattice is open and the dust inside it moves at our speed.',
  proc:'Do not inquire. Ask the eldest keepers, who will not answer.'}];
// the relics on the open vault's shelves and in the closed vault's cells (a few named; the rest are the register's)
P.RELICS=['LS-011 a clock that runs at its owner\'s pace','LS-014 the abacus that counts what is missing','LS-019 a glass of air from before the Cataclysm',
 'LS-023 the Ancient lamp that lights only the past','LS-031 a map that is always of tomorrow','LS-037 a cup that cannot be emptied of the same tea',
 'LS-042 a mask of the first Abbot (it speaks at the change of the year)','LS-055 a sealed letter addressed to the reader','LS-061 a pair of sandals worn by a monk who ran too fast'];

// ---------------------------------------------------------------- the people (the life layer's scaffold; README.md, "Life")
// faction, sub-faction, job and a schedule of 24 hourly activities. An activity names a kind of place (P.PLACES), never
// a coordinate: a person goes to a place of that activity (the README's rule). Who is where at an hour is plain data
// (P.whereAt): the host only draws it.
P.PLACES=[
 {id:'debate',activity:'DEBATE',x:0,z:51,y:'rock',r:26,cap:60,name:'The Debate Court'},
 {id:'drill',activity:'DRILL',x:P.DRILL.x,z:P.DRILL.z,y:'ward',r:16,cap:30,name:P.DRILL.name},
 {id:'kora',activity:'KORA',ring:P.KORA,cap:80,name:P.KORA.name},
 {id:'market',activity:'TRADE',x:86,z:-80,y:'ward',r:14,cap:30,name:'The market'},
 {id:'square',activity:'PILGRIM',x:0,z:-176,y:'ward',r:30,cap:60,name:"The pilgrims' square"},
 {id:'avenue',activity:'WALK',line:[[0,-160],[0,-10]],y:'ward',r:5,cap:40,name:'The avenue'},
 {id:'gardens',activity:'FARM',x:150,z:-20,y:'ward',r:28,cap:20,name:'The kitchen gardens'},
 {id:'orchard',activity:'FARM',x:-150,z:-20,y:'ward',r:28,cap:20,name:"The ward's orchard"},
 {id:'gate',activity:'GUARD',x:0,z:-188,y:'ward',r:9,cap:8,name:'The Great Gate'},
 {id:'stair-guard',activity:'GUARD',x:-28,z:16,y:28,r:4,cap:4,name:'The Lower Gate'},
 {id:'roof',activity:'STUDY',x:-58,z:60,y:40+5*4.5,r:14,cap:20,name:'The White Palace\'s roof terraces (reading in the sun)'},
 {id:'wheel',activity:'TURN_WHEEL',x:0,z:160,y:-62,r:11,cap:3,name:'The Procrastinator (the keepers at the wheel)'},
 {id:'vault',activity:'KEEP',x:-16,z:88,y:-14,r:12,cap:6,name:'The open vault'},
 {id:'assembly',activity:'PRAY',x:0,z:84,y:'rock',r:15,cap:300,indoor:true,name:'The Great Assembly Hall'},
 {id:'cells',activity:'SLEEP',x:-60,z:58,y:'rock',r:30,cap:300,indoor:true,name:'The cells'},
 {id:'library',activity:'STUDY_IN',x:60,z:58,y:'rock',r:20,cap:80,indoor:true,name:'The library and the scriptorium'},
 {id:'refectory',activity:'EAT',x:40,z:40,y:'rock',r:20,cap:300,indoor:true,name:'The refectory'},
 {id:'workshops',activity:'WORK',x:-150,z:-100,y:'ward',r:30,cap:60,indoor:true,name:'The workshops'},
 {id:'hostel',activity:'REST',x:82,z:-178,y:'ward',r:15,cap:60,indoor:true,name:"The pilgrims' hostel"},
 {id:'barracks',activity:'REST_W',x:-90,z:-110,y:'ward',r:15,cap:60,indoor:true,name:"The wardens' barracks"}];
// the schedules by role: 24 entries, hour 0..23
const S=(spec)=>{const a=new Array(24);let cur=null;for(let h=0;h<24;h++){if(spec[h]!=null)cur=spec[h];a[h]=cur;}return a;};
P.SCHEDULES={
 monk:S({0:'SLEEP',4:'PRAY',6:'EAT',7:'STUDY_IN',10:'DEBATE',13:'EAT',14:'STUDY',16:'KORA',17:'PRAY',19:'EAT',20:'STUDY_IN',22:'SLEEP'}),
 novice:S({0:'SLEEP',4:'PRAY',6:'EAT',7:'DEBATE',12:'EAT',13:'FARM',16:'PRAY',18:'EAT',19:'STUDY_IN',21:'SLEEP'}),
 operative:S({0:'SLEEP',4:'DRILL',7:'EAT',8:'STUDY_IN',11:'DRILL',14:'EAT',15:'DRILL',18:'PRAY',19:'EAT',20:'SLEEP'}),
 master:S({0:'SLEEP',3:'PRAY',6:'DRILL',13:'STUDY',16:'DRILL',19:'PRAY',21:'SLEEP'}),
 keeper:S({0:'TURN_WHEEL',3:'KEEP',6:'SLEEP',12:'TURN_WHEEL',15:'KEEP',18:'PRAY',20:'TURN_WHEEL'}),
 warden:S({0:'GUARD',6:'REST_W',12:'GUARD',18:'EAT',19:'REST_W',22:'GUARD'}),
 servant:S({0:'REST',5:'WORK',8:'FARM',11:'TRADE',14:'WORK',18:'EAT',19:'REST'}),
 pilgrim:S({0:'REST',6:'KORA',9:'PILGRIM',11:'KORA',13:'PILGRIM',15:'WALK',17:'KORA',19:'REST'})};
// the roll: who lives here (BLUEPRINT.md's numbers, a fifth of each drawn: the rest are in the books)
P.ROLES=[
 {role:'monk',n:48,faction:'The Order of Historians',sub:'Longsong',job:'scholar',dress:'monk'},
 {role:'novice',n:20,faction:'The Order of Historians',sub:'Longsong novices',job:'student',dress:'novice'},
 {role:'operative',n:24,faction:'The Order of Historians',sub:'Keepwell operatives (in training)',job:'operative',dress:'operative'},
 {role:'master',n:4,faction:'The Order of Historians',sub:'The masters of arms',job:'master of arms',dress:'master'},
 {role:'keeper',n:6,faction:'The Order of Historians',sub:'The keepers of the Vault',job:'keeper',dress:'keeper'},
 {role:'warden',n:20,faction:'The Order of Historians',sub:'The Wardens',job:'warden',dress:'warden'},
 {role:'servant',n:24,faction:'Oidong',sub:'The lay servants of Longsong',job:'servant',dress:'servant'},
 {role:'pilgrim',n:16,faction:'Xanadu Sultanate',sub:'Pilgrims',job:'pilgrim',dress:'pilgrim'}];
P.PEOPLE=(function(){const out=[];let k=0;
 P.ROLES.forEach(R=>{for(let i=0;i<R.n;i++){const seed=KRAND.hash(7401,k,i);
  out.push({id:'ls-'+R.role+'-'+String(i).padStart(2,'0'),role:R.role,faction:R.faction,sub:R.sub,job:R.job,dress:R.dress,seed,
   schedule:P.SCHEDULES[R.role]});k++;}});
 return out;})();
P.placeOf=function(activity,seed){const L=P.PLACES.filter(p=>p.activity===activity);return L.length?L[seed%L.length]:null;};
// where a person is at an hour: the place and a spot in it (a stable offset by the person's seed), or null indoors
P.whereAt=function(person,hour){const act=person.schedule[((Math.floor(hour)%24)+24)%24],pl=P.placeOf(act,person.seed);
 if(!pl)return {activity:act,place:null,indoor:true};
 const u=KRAND.unit(KRAND.hash(person.seed,1)),v=KRAND.unit(KRAND.hash(person.seed,2));
 let x,z;
 if(pl.ring){const a=u*Math.PI*2;x=pl.ring.cx+Math.cos(a)*pl.ring.a;z=pl.ring.cz+Math.sin(a)*pl.ring.b;}
 else if(pl.line){const A=pl.line[0],Bq=pl.line[1];x=lerp(A[0],Bq[0],u)+(v-.5)*pl.r*2;z=lerp(A[1],Bq[1],u);}
 else{const a=u*Math.PI*2,r=Math.sqrt(v)*pl.r;x=pl.x+Math.cos(a)*r;z=pl.z+Math.sin(a)*r;}
 return {activity:act,place:pl,indoor:!!pl.indoor,x,z};};

// ---------------------------------------------------------------- zones (the inspector's words, the kit's mask)
P.zoneAt=function(x,z){
 const Fm=P.FARMS&&P.FARMS.groupAt(x,z);
 if(!P.inGrounds(x,z))return Fm?{zone:Fm.kind==='pasture'?'valley':'farm',name:Fm.name,id:Fm.id}:{zone:'valley',name:'The Oidong Valley'};
 if(Fm&&Fm.inside)return {zone:'garden',name:Fm.name,id:Fm.id};
 for(const G of P.GARDENS)if(x>G.x0&&x<G.x1&&z>G.z0&&z<G.z1)return {zone:'garden',name:G.name,id:G.id};
 if(x>P.RAKED.x0&&x<P.RAKED.x1&&z>P.RAKED.z0&&z<P.RAKED.z1)return {zone:'raked',name:P.RAKED.name};
 if(x>P.SQUARE.x0&&x<P.SQUARE.x1&&z>P.SQUARE.z0&&z<P.SQUARE.z1)return {zone:'square',name:P.SQUARE.name};
 if(x>P.AVENUE.x0-6&&x<P.AVENUE.x1+6&&z>P.AVENUE.z0&&z<P.AVENUE.z1)return {zone:'avenue',name:'The avenue'};
 if(P.inWard(x,z))return {zone:'ward',name:'The lower ward'};
 if(P.rockR(x,z)<P.ROCK.plateau)return {zone:'top',name:'The top of the rock'};
 return {zone:'rock',name:P.ROCK.name};};
// what the Oidong kit may plant at (x,z): 1 outside the grounds (but off the track and the bridge), in the gardens; 0 on
// everything built, paved or raked
// (the rock's faces and its top away from the buildings hold the kit's crag pines and terrace plants; pads: P.nearPad)
P.nearPad=null;   // the host sets it: (x, z, m) -> true within m of a building's pad
P.plantable=function(x,z){
 // the farms first (40b-ls-farms.js): nothing wild on a field, a pool or a bed; a little at an orchard's edges
 const Fp=P.FARMS&&P.FARMS.plant(x,z);if(Fp!=null)return Fp;
 if(P.inGrounds(x,z,8)){const Z=P.zoneAt(x,z);if(Z.zone==='garden')return 1;
  if((Z.zone==='rock'||Z.zone==='top')&&!(P.nearPad&&P.nearPad(x,z,10))){
   // keep the Great Stair's face, the hermits' ladders and the kora's inner edge clear
   if(z<26&&Math.abs(x)<80)return 0;for(const H of P.HERMITS){const hx=H.drawn?H.drawn.x:H.x;if(Math.abs(x-hx)<12&&Math.abs(z-H.z)<6)return 0;}return Z.zone==='top'?.35:1;}
  return 0;}
 if(P.trackD(x,z)<9)return 0;
 if(Math.hypot(x-P.POND.x,z-P.POND.z)<P.POND.r+4)return 0;
 if(Math.abs(x-P.BRIDGE.x)<P.BRIDGE.w&&Math.abs(z-P.BRIDGE.z)<P.BRIDGE.L/2+6)return 0;
 // the kora outside the wall: a band clear round the rock (the pilgrims' path)
 const kd=Math.abs(Math.hypot((x-P.KORA.cx)/P.KORA.a,(z-P.KORA.cz)/P.KORA.b)-1)*Math.min(P.KORA.a,P.KORA.b);
 if(kd<P.KORA.w+3&&!P.inGrounds(x,z,-2))return 0;
 return 1;};
const segD=(x,z,L)=>{let d=1e9;for(let i=1;i<L.length;i++){const a=L[i-1],c=L[i],dx=c[0]-a[0],dz=c[1]-a[1],l=Math.max(1e-9,dx*dx+dz*dz),t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l,0,1);
 d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;};
P.trackD=(x,z)=>Math.min(segD(x,z,P.TRACK),segD(x,z,P.TRACK_N));
P.segD=segD;
return P;})();
