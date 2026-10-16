/* ======================================================================
   Hykkousoi furniture: the culture's palette and its fourteen shell-grown pieces, ported from the Ys settlement
   (settlements/ys/src/66-hyk-furniture.js): a cradle bed, two chests, a larder, a net rack, a fish rack, a pearl table,
   a chart table, a stool, a jar lamp, a tide niche, a hearth basin, a cushion ring and a scroll rack. Nacre and
   mother-of-pearl throughout, pale sea-linen and slate blue from the Hykkousoi pack (core/sockets/80-cultures.js),
   olive wood, bronze. Influences: Greek, Polynesian, organic. The bodies are lathes and the ribs, horns and cords are
   tubes (F.lathe, F.tube, F.ell in krator-furniture-core.js). Still to build: HYK_COMMON / HYK_COURT style sheets
   (accent 'nacre', accentFam 'nacre', motif 'wave', tapestry 'waves' or 'sun', statue 'figure') and the FK.set() tiers.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('hykkousoi', { name: 'Hykkousoi', pack: 'hykkousoi', influences: 'Greek; Polynesian; organic',
  materials: 'nacre and mother-of-pearl, shell, bone, olive wood, sea-linen, bronze, white marble',
  palette: {
    nacre: 0xe8e4ec, nacreRose: 0xe8d8dc, nacreSea: 0xd0e0e4, timberOlive: 0x9a8a5a, timberOliveDark: 0x6a5e3a, timberOliveLight: 0xb8a878,
    clothLinen: 0xe4eff0, clothSlate: 0x3f6a82, clothSlateDeep: 0x2c5a74, clothGoldSun: 0xd8a640, clothSeaGreen: 0x4a9a8a,
    bronze: 0x8a6a3a, gold: 0xd8a640, marbleWhite: 0xeae6de, stoneSea: 0x6a8a90, clayWhite: 0xe0dcd0, ropeFlax: 0xc8b888,
    flame: 0xffc861, ember: 0xd9762c,
    /* the Ys kit's shell palette (HPAL in settlements/ys/src/60-hyk-mat.js): the sea-city's white, cream and warm shell, coral, teal, barnacle grey, weed and crust */
    shellWhite: 0xf3ece0, shellCream: 0xeee5d6, shellWarm: 0xe9d9c2, shellWarmDeep: 0xdcc9ad, coralPink: 0xe8a08c, tealSea: 0x3e9c96, seaGreen: 0x6aa892,
    barnacle: 0xcdc8bd, barnacleDark: 0xb3aea3, boneIvory: 0xf1e9d8, boneCream: 0xe4dac6, weedGreen: 0x3c5a3a, crustBlack: 0x2a2622, lensTeal: 0x9fe0d8,
    pearlCool: 0x8ff0e0, coalWarm: 0xffd9a0
  } });
/* END PALETTE */

/* Hykkousoi's pieces were written for the Ys settlement (settlements/ys/src/66-hyk-furniture.js) against its own F: a lathe
   and a tube take the Ys material names, an ellipsoid takes three radii. These wrappers map them onto the catalog F
   (F.lathe, F.tube, F.ell in krator-furniture-core.js): shell -> family 'shell', nacre -> 'nacre', bone -> 'bone', weed ->
   'cloth' (drawn double-sided), lens -> 'glass', barn and dark -> 'stone'. */
const HYK_FAM = { shell: 'shell', nacre: 'nacre', bone: 'bone', weed: 'cloth', lens: 'glass', barn: 'stone', dark: 'stone' };
function hykFurnLathe(F, x, z, prof, col, m, o) { o = o || {}; F.lathe(x, 0, z, prof, 0, col, HYK_FAM[m || 'shell'], { nu: o.nu, nv: o.nv, lobes: o.lobes, flute: o.flute, double: m === 'weed' || m === 'lens' }); }
function hykFurnTube(F, pts, r, col, m, o) { o = o || {}; F.tube(pts, r, col, HYK_FAM[m || 'shell'], { seg: o.seg || 8 }); }
function hykFurnEll(F, x, y, z, rx, ry, rz, col, m, rot) { F.ell(x, y, z, rx, ry, rz, rot || 0, col, HYK_FAM[m || 'shell']); }
/* a lit pearl or coal: a glowing ball (no point light, a sheet of a thousand pieces would not compile), on a bone bracket when o.bracket is given */
function hykFurnLight(F, x, y, z, o) { o = o || {};
  if (o.bracket) hykFurnTube(F, [o.bracket, [x, y - o.r * 0.7, z]], 0.012, F.pick(['boneIvory', 'boneCream']), 'bone', { seg: 6 });
  F.ball(x, y, z, o.r, F.col(o.cool ? 'pearlCool' : 'coalWarm'), 'glow'); }

// ---------------------------------------------------------------- the helpers (all through F)
// an oval for a lathe or a ring. F.lathe modulates r by `lobes` (cos nθ) and `flute` (a raised cosine; plain cos nθ at
// sharp 1), and r = R(1 + a cos2θ) alone is not an ellipse: once a > .2 its minor extent bulges past R(1 - a). Fitting
// both, the flute at n 4, puts r(0) at rx, r(90°) at rz and r(45°) on the ellipse, and the extents then peak on the axes.
// Returns {R, rx, rz, lobes, flute, at(θ)}: draw the body with radii as multiples of R and pass lobes and flute on.
function hykFurnOval(rx,rz){const k=rx/rz,p=(k-1)/(k+1),b=rz/rx;const R=rx*b/Math.sqrt(.5*b*b+.5);const A=rx/(R*(1+p))-1;
 return {R,rx,rz,lobes:{n:2,amp:p},flute:{n:4,amp:A,sharp:1},at:a=>R*(1+p*Math.cos(2*a))*(1+A*.5+A*.5*Math.cos(4*a))};}
// an ellipsoid of revolution about a vertical axis: r across, ry up, centre (x,yc,z); o:{lobes,flute,n,nu} (an oval's lobes and flute make it an oval)
function hykFurnBlob(F,x,yc,z,r,ry,col,m,o){o=o||{};const n=o.n||8;const prof=[];
 for(let i=0;i<=n;i++){const a=-Math.PI/2+Math.PI*i/n;prof.push([Math.max(0,r*Math.cos(a)),yc+ry*Math.sin(a)]);}
 hykFurnLathe(F,x,z,prof,col,m,{nu:o.nu||18,nv:o.nv||n*2,lobes:o.lobes,flute:o.flute,inside:true});}
// a body about a vertical axis at (x,z) from a profile [[r,y],...] (y increasing), into the interior bucket
function hykFurnBody(F,x,z,prof,col,m,o){o=o||{};hykFurnLathe(F,x,z,prof,col,m,{nu:o.nu||24,nv:o.nv||Math.max(6,prof.length*2),lobes:o.lobes,flute:o.flute,inside:true});}
// a lip: a tube round a horizontal ring at height y, ring radius R modulated like a lathe (o.lobes, o.flute), tube radius r
function hykFurnRing(F,x,y,z,R,r,col,m,o){o=o||{};const n=o.n||28;const pts=[];
 for(let i=0;i<=n;i++){const a=i/n*F.TAU;let R1=R;if(o.lobes)R1*=1+o.lobes.amp*Math.cos(o.lobes.n*a+(o.lobes.ph||0));
  if(o.flute)R1*=1+o.flute.amp*Math.pow(.5+.5*Math.cos(o.flute.n*a),o.flute.sharp||2);
  pts.push([x+R1*Math.cos(a),y+(o.wave?o.wave*Math.sin(a*(o.waveN||3)):0),z+R1*Math.sin(a)]);}
 hykFurnTube(F,pts,r,col,m,{seg:o.seg||7});}
// the same ring stood up about the z axis (a scroll's tie, a loupe's rim seen edge-on)
function hykFurnRingZ(F,x,y,z,R,r,col,m,o){o=o||{};const n=o.n||16;const pts=[];
 for(let i=0;i<=n;i++){const a=i/n*F.TAU;pts.push([x+R*Math.cos(a),y+R*Math.sin(a),z]);}hykFurnTube(F,pts,r,col,m,{seg:o.seg||5});}
// a knuckle: the ball that closes a tube's end
function hykFurnKnob(F,x,y,z,r,col,m){hykFurnBlob(F,x,y,z,r,r*.92,col,m,{n:5,nu:10});}
// a stalk from a to b, bowed sideways along o.dir by o.bow, radius r0 at a tapering to r1 at b, knuckled at each end
// that is not buried (o.noA, o.noB)
function hykFurnStalk(F,a,b,r0,r1,col,m,o){o=o||{};const n=o.n||6;const pts=[];const bow=o.bow||0;const dir=o.dir||[1,0,0];
 for(let i=0;i<=n;i++){const t=i/n;const s=Math.sin(t*Math.PI)*bow;pts.push([a[0]+(b[0]-a[0])*t+dir[0]*s,a[1]+(b[1]-a[1])*t+dir[1]*s,a[2]+(b[2]-a[2])*t+dir[2]*s]);}
 hykFurnTube(F,pts,t=>r0+(r1-r0)*t,col,m,{seg:o.seg||7});
 if(!o.noA)hykFurnKnob(F,a[0],a[1],a[2],r0*1.25,col,m);if(!o.noB)hykFurnKnob(F,b[0],b[1],b[2],r1*1.25,col,m);}
// a sealed shell jar: a fluted belly drawn in to a neck, a nacre lid dished over the mouth, a weed binding at the seal
function hykFurnJar(F,x,y,z,r,h,col,lid,o){o=o||{};
 hykFurnBody(F,x,z,[[r*.45,y],[r*.8,y+h*.06],[r,y+h*.3],[r*.95,y+h*.55],[r*.6,y+h*.74],[r*.5,y+h*.8],[r*.55,y+h*.84]],col,'shell',{nu:16,nv:14,flute:{n:o.fl||9,amp:.06,sharp:1.5}});
 hykFurnBody(F,x,z,[[r*.5,y+h*.84],[r*.68,y+h*.86],[r*.6,y+h*.93],[r*.2,y+h*.98],[0,y+h]],lid,'nacre',{nu:14,nv:6});
 hykFurnRing(F,x,y+h*.845,z,r*.6,r*.05,F.col('weedGreen'),'weed',{n:16,seg:5});}
// a dish: the wall climbs to the rim at (R, yr) and caps flush over it (F.lathe winds outward only, so a hollow has no
// visible inside); a dark fill a finger proud inside the lip reads as the shadowed hollow; a lip ring stands on the rim.
// o.prof replaces the default wall; o.oval (hykFurnOval, with R = oval.R) makes it an oval; o.flute ribs a round one;
// o.lip the lip's tube radius; o.fill its colour
function hykFurnDish(F,x,z,R,yr,col,m,o){o=o||{};const y0=o.y0||0;const H=yr-y0;const O=o.oval;const lob=O?O.lobes:o.lobes,fl=O?O.flute:o.flute;
 const prof=o.prof||[[R*.3,y0],[R*.55,y0+H*.2],[R*.85,y0+H*.55],[R,y0+H*.9],[R*.98,yr],[R*.9,yr+.012],[0,yr+.02]];
 hykFurnBody(F,x,z,prof,col,m,{nu:o.nu||28,nv:o.nv||16,lobes:lob,flute:fl});
 const fx=O?O.rx*.9:R*.9*(1+(fl?fl.amp*.5:0)),fz=O?O.rz*.9:fx;
 hykFurnEll(F,x,yr+.02,z,fx,.012,fz,o.fill||F.col('crustBlack'),'dark');
 hykFurnRing(F,x,yr+.01,z,R*.97,o.lip||R*.06,o.lipCol||col,o.lipM||m,{lobes:lob,flute:fl,n:O?40:28});}
// a bone upright for a rack: a flattened shell pad for a foot, the stalk bowed outward, knuckled at the head
function hykFurnUpright(F,x,z,hx,hy,hz,r,col,o){o=o||{};
 hykFurnBlob(F,x,.05,z,r*2.6,.05,F.pick(['shellWarm','shellWarmDeep']),'shell',{n:4,nu:12,lobes:{n:3,amp:.06}});
 hykFurnStalk(F,[x,.03,z],[hx,hy,hz],r,r*.7,col,'bone',{bow:o.bow||.05,dir:o.dir||[1,0,0],noA:true,n:7});}
// a salt fish hung by the tail: a flat lathe (lobes n 2) from the snout at y up to the tail fan at y+L, flat side to +z
function hykFurnFish(F,x,y,z,L,col){const r=L*.17;
 hykFurnBody(F,x,z,[[r*.15,y],[r*.7,y+L*.12],[r,y+L*.4],[r*.8,y+L*.62],[r*.3,y+L*.78],[r*.65,y+L*.92],[0,y+L]],col,'shell',{nu:12,nv:12,lobes:{n:2,amp:.55}});}

// ---------------------------------------------------------------- the pieces
// the bed: a hammock slung in a half-shell cradle. The cradle is an oval saddle closed over its back; two bone horns
// rise from its ends and the cloth sling hangs between them, dipping to rest on the shell.
FURN({key:'hykkousoi_shell_cradle_bed',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_shell_cradle_bed',name:'Shell cradle bed',culture:'hykkousoi',type:'bed',setting:'indoor',rooms:['bedroom'],w:2.1,d:1.0,h:.9,anchor:'floor',tier:'common',clearance:{left:.6,right:.6},materials:['bone','cloth'],
 build(F){const cs=F.pick(['shellWarm','shellWarmDeep']),cb=F.pick(['boneIvory','boneCream']),cw=F.col('tealSea'),cc=F.pick(['boneIvory','boneCream']),cg=F.col('seaGreen');
  const O=hykFurnOval(.95,.46),R=O.R;
  hykFurnBody(F,0,0,[[R*.4,0],[R*.78,.07],[R*.94,.18],[R,.33],[R*.9,.42],[R*.45,.46],[0,.48]],cs,'shell',{nu:44,nv:16,lobes:O.lobes,flute:O.flute});
  hykFurnRing(F,0,.36,0,R,.03,cs,'shell',{lobes:O.lobes,flute:O.flute,n:44});
  for(const s of [-1,1])hykFurnStalk(F,[s*.85,.3,0],[s*.70,.84,0],.07,.035,cb,'bone',{bow:.05,dir:[s,0,0],noA:true,n:7});
  const S=hykFurnOval(.82,.42);
  hykFurnLathe(F,0,0,[[S.R*.13,.50],[S.R*.68,.555],[S.R*.9,.60],[S.R,.635]],cw,'weed',{nu:30,nv:8,lobes:S.lobes,flute:S.flute,inside:true});   // the sling, open: cloth is two-sided
  for(const s of [-1,1])hykFurnTube(F,[[s*.78,.635,0],[s*.76,.72,0],[s*.70,.82,0]],.015,cc,'weed',{seg:5});
  const B=hykFurnOval(.26,.14);hykFurnBlob(F,-.5,.60,0,B.R,.085,F.col('coralPink'),'weed',{n:6,nu:14,lobes:B.lobes,flute:B.flute});   // the bolster
  hykFurnBlob(F,.35,.585,.05,.22,.045,cg,'weed',{n:5,nu:14,lobes:{n:3,amp:.08}});}});                                           // a folded cover

// the item container: a clam drum on a flared skirt under a nacre lid with a teal seam, a pearl clasp at the front and
// two bone hinges behind
FURN({key:'hykkousoi_nacre_chest',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_nacre_chest',name:'Nacre chest',culture:'hykkousoi',type:'storage',setting:'indoor',rooms:['bedroom','hall','store'],w:1.2,d:.7,h:.7,anchor:'floor',tier:'common',clearance:{front:.6},materials:['bone','nacre'],
 build(F){const cs=F.pick(['shellWhite','shellCream']),cn=F.col('nacre'),cb=F.pick(['boneIvory','boneCream']),ct=F.col('tealSea');
  const O=hykFurnOval(.565,.325),R=O.R;
  hykFurnBody(F,0,0,[[R*.86,0],[R*.98,.03],[R*.94,.1],[R*.97,.26],[R,.42],[R*.96,.5],[R*.6,.515],[0,.52]],cs,'shell',{nu:40,nv:18,lobes:O.lobes,flute:O.flute});
  hykFurnBody(F,0,0,[[R*.98,.5],[R*1.03,.53],[R*.99,.58],[R*.84,.64],[R*.5,.675],[0,.69]],cn,'nacre',{nu:40,nv:12,lobes:O.lobes,flute:O.flute});
  hykFurnRing(F,0,.515,0,R,.018,ct,'nacre',{lobes:O.lobes,flute:O.flute,n:40});
  hykFurnKnob(F,0,.55,.30,.03,cn,'nacre');
  for(const s of [-1,1])hykFurnKnob(F,s*R*.5,.52,-.31,.028,cb,'bone');}});

// the food container: sealed oyster-shell jars on a bone tripod stand, three on the dish and two on the shelf, the
// stalks drawn in to a crown ring and a nacre finial
FURN({key:'hykkousoi_oyster_larder',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_oyster_larder',name:'Oyster larder',culture:'hykkousoi',type:'storage',setting:'indoor',rooms:['bedroom','hall','kitchen','store'],w:.8,d:.8,h:1.1,anchor:'floor',tier:'common',clearance:{front:.5},materials:['bone','cloth','nacre'],
 build(F){const cb=F.pick(['boneIvory','boneCream']),cs=F.pick(['shellWhite','shellCream']),cn=F.col('nacre');
  hykFurnBody(F,0,0,[[.22,0],[.34,.025],[.36,.05],[.3,.065],[0,.07]],cs,'shell',{nu:30,nv:6,lobes:{n:3,amp:.05}});
  hykFurnBody(F,0,0,[[.2,.48],[.29,.5],[.28,.53],[0,.54]],cs,'shell',{nu:28,nv:5,lobes:{n:3,amp:.05,ph:Math.PI/3}});
  for(let k=0;k<3;k++){const a=k/3*F.TAU+.4;const c=Math.cos(a),s=Math.sin(a);
   hykFurnStalk(F,[.33*c,.04,.33*s],[.2*c,1.0,.2*s],.028,.02,cb,'bone',{bow:.03,dir:[c,0,s],noA:true,n:7});}
  hykFurnRing(F,0,1.0,0,.2,.016,cb,'bone',{n:20,seg:6});
  for(let k=0;k<3;k++){const a=k/3*F.TAU+.4+Math.PI/3;hykFurnTube(F,[[.2*Math.cos(a),1.0,.2*Math.sin(a)],[.1*Math.cos(a),1.04,.1*Math.sin(a)],[0,1.06,0]],.012,cb,'bone',{seg:5});}
  hykFurnKnob(F,0,1.06,0,.03,cn,'nacre');
  for(let k=0;k<3;k++){const a=k/3*F.TAU+.4+Math.PI/3;hykFurnJar(F,.19*Math.cos(a),.065,.19*Math.sin(a),F.rr(.12,.135),F.rr(.36,.41),F.pick(['shellWarm','shellWarmDeep']),cn,{fl:7+k});}
  for(const k of [0,1]){const a=k*Math.PI+.4;hykFurnJar(F,.13*Math.cos(a),.535,.13*Math.sin(a),F.rr(.085,.1),F.rr(.26,.3),F.pick(['shellWhite','shellCream']),cn,{fl:9});}}});

// nets and floats on a bone rack: two bowed uprights on pad feet, a sagging top bar and a mid bar, twine draped from
// bar to bar, two rolled nets bound with cord, glass floats hung from the mid bar
FURN({key:'hykkousoi_net_rack',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_net_rack',name:'Net rack',culture:'hykkousoi',type:'rack',setting:'both',rooms:['hall','workshop','store'],w:1.8,d:.5,h:2.0,anchor:'floor',tier:'common',task:['storage'],clearance:{front:.6},materials:['bone','cloth','glass'],
 build(F){const cb=F.pick(['boneIvory','boneCream']),ct=F.pick(['shellWarm','shellWarmDeep']),cl=F.col('lensTeal');
  for(const s of [-1,1])hykFurnUpright(F,s*.76,0,s*.80,1.9,0,.05,cb,{bow:.04,dir:[s,0,0]});
  hykFurnTube(F,[[-.80,1.9,0],[-.4,1.87,0],[0,1.86,0],[.4,1.87,0],[.80,1.9,0]],.035,cb,'bone',{seg:7});
  hykFurnTube(F,[[-.78,1.05,0],[0,1.02,0],[.78,1.05,0]],.03,cb,'bone',{seg:6});
  const N=9;for(let i=0;i<N;i++){const x0=-.62+1.24*i/(N-1);const x1=x0+F.rr(-.25,.25);const x2=x1+F.rr(-.15,.15);const yb=F.rr(.25,.6);
   hykFurnTube(F,[[x0,1.88,.03],[x0*.9+x1*.1,1.5,.09],[x1,1.03,.04],[x2,yb,F.rr(-.06,.06)],[x2+F.rr(-.05,.05),yb-.1,0]],.011,F.pick(['boneIvory','boneCream']),'weed',{seg:4});}
  for(const k of [0,1]){const x=k?.42:-.38;hykFurnBlob(F,x,1.42,.02,.11,.42,F.col('seaGreen'),'weed',{n:7,nu:14,lobes:{n:5,amp:.06}});
   hykFurnRing(F,x,1.3,.02,.1,.012,ct,'weed',{n:14,seg:5});hykFurnRing(F,x,1.58,.02,.1,.012,ct,'weed',{n:14,seg:5});}
  for(let i=0;i<4;i++){const x=-.55+1.1*i/3+F.rr(-.05,.05);const y=F.rr(.72,.86);hykFurnTube(F,[[x,1.03,0],[x,y+.06,0]],.009,ct,'weed',{seg:4});hykFurnBlob(F,x,y,0,.065,.065,cl,'lens',{n:6,nu:12});}}});

// the pearl-sorting table: one lathe from the foot through the stem to an oval top with a raised edge; three lipped
// trays of graded pearls on it, and the sorter's loupe laid at the near edge
FURN({key:'hykkousoi_pearl_table',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_pearl_table',name:'Pearl table',culture:'hykkousoi',type:'table',setting:'indoor',rooms:['workshop','hall'],w:1.6,d:.9,h:.8,anchor:'floor',tier:'common',task:[],clearance:{front:.7},materials:['bone','glass','nacre','stone'],
 build(F){const cs=F.pick(['shellWhite','shellCream']),cw=F.pick(['shellWarm','shellWarmDeep']),cb=F.pick(['boneIvory','boneCream']),cl=F.col('lensTeal');
  const O=hykFurnOval(.74,.42),R=O.R;
  hykFurnBody(F,0,0,[[.3,0],[.26,.04],[.14,.14],[.11,.36],[.16,.52],[R*.55,.6],[R*.92,.645],[R,.67],[R*.98,.69],[R*.6,.70],[0,.705]],cw,'shell',{nu:44,nv:26,lobes:O.lobes,flute:O.flute});
  hykFurnRing(F,0,.695,0,R*.99,.02,cs,'shell',{lobes:O.lobes,flute:O.flute,n:44});
  const T=[[-.4,-.08,.16,.012],[.05,.12,.14,.018],[.4,-.1,.13,.024]];
  for(const t of T){const x=t[0],z=t[1],r=t[2],pr=t[3];hykFurnBody(F,x,z,[[r*.8,.70],[r,.715],[r*.95,.73],[0,.735]],cs,'shell',{nu:20,nv:4});
   hykFurnEll(F,x,.735,z,r*.86,.006,r*.86,F.col('crustBlack'),'dark');hykFurnRing(F,x,.73,z,r*.97,.01,cs,'shell',{n:20,seg:5});
   const n=5+Math.floor(F.rr(0,5));for(let i=0;i<n;i++){const a=F.rr(0,F.TAU),d=F.rr(0,r*.6);hykFurnBlob(F,x+d*Math.cos(a),.742+pr,z+d*Math.sin(a),pr,pr,F.col('nacre'),'nacre',{n:4,nu:8});}}
  hykFurnBlob(F,.5,.717,.3,.05,.012,cl,'lens',{n:3,nu:14});hykFurnRing(F,.5,.717,.3,.052,.007,cb,'bone',{n:16,seg:5});
  hykFurnTube(F,[[.55,.717,.33],[.66,.717,.39]],.009,cb,'bone',{seg:5});hykFurnKnob(F,.66,.717,.39,.012,cb,'bone');}});

// the low shell stool, two variants: a waisted limpet with a domed seat, or a barnacle drum in grey with a cushion
FURN({key:'hykkousoi_shell_stool',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_shell_stool',name:'Shell stool',culture:'hykkousoi',type:'chair',setting:'indoor',rooms:['hall','tavern','bedroom','workshop'],w:.5,d:.5,h:.45,variants:2,variantNames:['limpet','barnacle'],anchor:'floor',tier:'common',clearance:{front:.4},materials:['bone','cloth','stone'],
 build(F){if(F.variant%2===0){
   hykFurnBody(F,0,0,[[.2,0],[.21,.02],[.15,.1],[.12,.2],[.14,.3],[.22,.38],[.23,.405],[.2,.43],[.1,.44],[0,.445]],F.pick(['shellWarm','shellWarmDeep']),'shell',{nu:30,nv:16,flute:{n:12,amp:.05,sharp:1.5}});
   hykFurnRing(F,0,.405,0,.225,.012,F.pick(['shellWhite','shellCream']),'shell',{n:28,seg:5});}
  else{
   hykFurnBody(F,0,0,[[.225,0],[.23,.03],[.21,.2],[.195,.35],[.165,.38],[0,.39]],F.pick(['barnacle','barnacleDark']),'barn',{nu:28,nv:10,flute:{n:8,amp:.07,sharp:2.5}});
   hykFurnBlob(F,0,.40,0,.2,.04,F.col('tealSea'),'weed',{n:5,nu:18,lobes:{n:6,amp:.04}});hykFurnKnob(F,0,.43,0,.015,F.pick(['boneIvory','boneCream']),'bone');}}});

// the bioluminescent jar lamp: a limpet foot drawn up into a stalk, the cool pearl in its socket on a bracket from the
// stalk's head, a lens-glass jar round it stoppered in shell and corded at the neck
FURN({key:'hykkousoi_jar_lamp',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_jar_lamp',name:'Jar lamp',culture:'hykkousoi',type:'lamp',setting:'both',rooms:['hall','bedroom','tavern','workshop','library'],w:.4,d:.4,h:.6,anchor:'floor',tier:'common',task:[],clearance:{},materials:['bone','cloth','emissive','glass'],
 build(F){const cs=F.pick(['shellWhite','shellCream']),cw=F.col('weedGreen');
  hykFurnBody(F,0,0,[[.17,0],[.18,.015],[.12,.05],[.055,.1],[.04,.2],[.05,.25],[.035,.27]],cs,'shell',{nu:22,nv:12,flute:{n:9,amp:.05,sharp:1.5}});
  hykFurnLight(F,0,.40,0,{cool:true,r:.085,bracket:[0,.26,0]});   // the bracket is in the piece's frame (F.light transforms it)
  hykFurnLathe(F,0,0,[[.055,.30],[.12,.33],[.14,.40],[.125,.47],[.08,.52],[.065,.545],[.075,.56]],F.col('lensTeal'),'lens',{nu:20,nv:12,inside:true});
  hykFurnBody(F,0,0,[[.065,.555],[.075,.565],[.05,.585],[0,.595]],cs,'shell',{nu:14,nv:4});
  hykFurnRing(F,0,.55,0,.07,.01,cw,'weed',{n:16,seg:5});}});

// the plainer sea chest in barnacle grey: a long oval drum, a shallow lid, a bone seam and hasp, barnacles grown on
// the lower body, rope handles at the ends
FURN({key:'hykkousoi_sea_chest',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_sea_chest',name:'Sea chest',culture:'hykkousoi',type:'storage',setting:'indoor',rooms:['bedroom','store','hall'],w:1.4,d:.6,h:.6,anchor:'floor',tier:'common',clearance:{front:.6},materials:['bone','cloth','stone'],
 build(F){const cg=F.pick(['barnacle','barnacleDark']),cg2=F.pick(['barnacle','barnacleDark']),cb=F.pick(['boneIvory','boneCream']),cw=F.pick(['barnacle','barnacleDark']);
  const O=hykFurnOval(.66,.285),R=O.R;
  hykFurnBody(F,0,0,[[R*.8,0],[R*.96,.03],[R*.98,.2],[R,.38],[R*.97,.42],[R*.5,.435],[0,.44]],cg,'barn',{nu:40,nv:14,lobes:O.lobes,flute:O.flute});
  hykFurnBody(F,0,0,[[R*.97,.43],[R*1.02,.46],[R*.98,.5],[R*.8,.55],[R*.4,.58],[0,.59]],cg2,'barn',{nu:40,nv:10,lobes:O.lobes,flute:O.flute});
  hykFurnRing(F,0,.445,0,R*.98,.014,cb,'bone',{lobes:O.lobes,flute:O.flute,n:40});
  for(let i=0;i<10;i++){if(!F.chance(.75))continue;const a=F.rr(0,F.TAU);const rr1=O.at(a)*.97;const s=F.rr(.012,.022);hykFurnBlob(F,rr1*Math.cos(a),F.rr(.04,.3),rr1*Math.sin(a),s,s*.6,F.pick(['barnacle','barnacleDark']),'barn',{n:3,nu:8});}
  hykFurnKnob(F,0,.45,O.rz*.93,.025,cb,'bone');
  for(const s of [-1,1]){const x=s*O.rx*.95;hykFurnTube(F,[[x-s*.12,.3,0],[x+s*.03,.33,0],[x+s*.05,.24,0],[x-s*.12,.2,0]],.013,cw,'weed',{seg:5});}}});

// the tide-shrine niche (wall-anchored, its back at -z): a stem rising to an oval basin whose pool is a dark hollow under
// a lens skin; a fluted nacre crest and two lesser spires grown from the back of the rim, the pearl held before the crest
// on a bracket, offerings on the rim and weed hanging from it
FURN({key:'hykkousoi_tide_niche',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_tide_niche',name:'Tide niche',culture:'hykkousoi',type:'shrine',setting:'indoor',rooms:['hall','shrine','bedroom'],w:.9,d:.4,h:1.2,anchor:'wall',tier:'common',clearance:{front:.6},materials:['bone','cloth','emissive','glass','nacre','stone'],
 build(F){const cs=F.pick(['shellWhite','shellCream']),cn=F.col('nacre'),cw=F.col('weedGreen'),ct=F.col('tealSea');
  const O=hykFurnOval(.33,.17),R=O.R;
  hykFurnDish(F,0,0,R,.70,cs,'shell',{oval:O,nu:36,nv:22,lip:.016,lipCol:cn,lipM:'nacre',prof:[[.16,0],[.19,.03],[.1,.1],[.08,.3],[.1,.5],[R*.7,.6],[R*.95,.67],[R,.70],[R*.9,.712],[0,.72]]});
  hykFurnLathe(F,0,0,[[R*.86,.722],[R*.6,.728],[0,.73]],ct,'lens',{nu:28,nv:3,lobes:O.lobes,flute:O.flute,inside:true});
  hykFurnBody(F,0,-.085,[[.07,.69],[.1,.78],[.1,.92],[.065,1.06],[.02,1.16],[0,1.18]],cn,'nacre',{nu:20,nv:12,flute:{n:10,amp:.1,sharp:2}});
  for(const s of [-1,1])hykFurnBody(F,s*.26,-.1,[[.05,.68],[.065,.76],[.055,.86],[.02,.95],[0,.97]],cn,'nacre',{nu:14,nv:8,flute:{n:8,amp:.1,sharp:2}});
  hykFurnLight(F,0,.94,.03,{cool:true,r:.07,nacre:true,bracket:[0,.9,-.085]});
  for(let i=0;i<4;i++){const a=F.rr(.3,2.8);const rr1=O.at(a)*.95;hykFurnBlob(F,rr1*Math.cos(a),.735,rr1*Math.sin(a),.014,.014,F.col('nacre'),'nacre',{n:4,nu:8});}
  hykFurnTube(F,[[.2,.71,.12],[.26,.6,.17],[.24,.45,.15]],.01,cw,'weed',{seg:4});}});

// the salt-fish rack: two bowed uprights, a top bar and a mid bar, flat fish hung by the tail from both, a salt tub at
// the foot with a drift of salt in it
FURN({key:'hykkousoi_fish_rack',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_fish_rack',name:'Fish rack',culture:'hykkousoi',type:'rack',setting:'both',rooms:['kitchen','workshop','store'],w:1.6,d:.6,h:2.1,anchor:'floor',tier:'common',task:['storage'],clearance:{front:.6},materials:['bone','cloth','stone'],
 build(F){const cb=F.pick(['boneIvory','boneCream']),cw=F.pick(['shellWarm','shellWarmDeep']);
  for(const s of [-1,1])hykFurnUpright(F,s*.66,0,s*.70,2.0,0,.045,cb,{bow:.035,dir:[s,0,0]});
  hykFurnTube(F,[[-.70,2.0,0],[-.35,1.97,0],[0,1.96,0],[.35,1.97,0],[.70,2.0,0]],.03,cb,'bone',{seg:7});
  hykFurnTube(F,[[-.69,1.25,0],[0,1.22,0],[.69,1.25,0]],.025,cb,'bone',{seg:6});
  const hang=(x,yb,z)=>{const L=F.rr(.36,.5);const y0=yb-.06-L;hykFurnTube(F,[[x,yb,z],[x,y0+L-.02,z]],.008,cw,'weed',{seg:4});hykFurnFish(F,x,y0,z,L,(F.chance(.6)?F.col('boneIvory'):F.col('barnacle')));};
  for(let i=0;i<6;i++)hang(-.55+1.1*i/5+F.rr(-.03,.03),1.95,F.rr(-.1,.1));
  for(let i=0;i<5;i++)hang(-.5+1.0*i/4+F.rr(-.03,.03),1.22,F.rr(-.08,.08));
  hykFurnDish(F,.15,.05,.2,.26,F.pick(['barnacle','barnacleDark']),'barn',{nu:24,nv:12,lip:.014,prof:[[.1,0],[.18,.04],[.2,.18],[.2,.26],[.18,.272],[0,.28]]});
  for(let i=0;i<5;i++){const a=F.rr(0,F.TAU),d=F.rr(0,.1);hykFurnBlob(F,.15+d*Math.cos(a),.29,.05+d*Math.sin(a),F.rr(.02,.035),.012,F.pick(['shellWhite','shellCream']),'shell',{n:3,nu:8});}}});

// the hearth basin: three bone feet carry a ring, the wide fluted basin rests in it, its hollow a bed of ash and charcoal
// with three coals glowing bare in it (warm lights), and a pot set on the coals
FURN({key:'hykkousoi_hearth_basin',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_hearth_basin',name:'Hearth basin',culture:'hykkousoi',type:'stove',setting:'indoor',rooms:['hall','kitchen','tavern'],w:1.0,d:1.0,h:.5,anchor:'floor',tier:'common',task:['cooking','socializing'],clearance:{front:.8},materials:['bone','emissive','stone'],
 build(F){const cs=F.pick(['shellWarm','shellWarmDeep']),cb=F.pick(['boneIvory','boneCream']),cc=F.col('crustBlack');
  for(let k=0;k<3;k++){const a=k/3*F.TAU+.6;const c=Math.cos(a),s=Math.sin(a);hykFurnBlob(F,.36*c,.035,.36*s,.055,.035,F.pick(['shellWhite','shellCream']),'shell',{n:4,nu:10});
   hykFurnStalk(F,[.36*c,.03,.36*s],[.3*c,.12,.3*s],.035,.03,cb,'bone',{n:3,noA:true});}
  hykFurnRing(F,0,.12,0,.3,.025,cb,'bone',{n:30,seg:7});
  const R=.455;hykFurnDish(F,0,0,R,.37,cs,'shell',{nu:40,nv:14,flute:{n:14,amp:.04,sharp:1.5},lip:.022,fill:cc,prof:[[.12,.08],[.3,.14],[R*.9,.26],[R,.37],[R*.93,.382],[0,.39]]});
  for(let i=0;i<6;i++){const a=F.rr(0,F.TAU),d=F.rr(.05,.3);hykFurnEll(F,d*Math.cos(a),.395,d*Math.sin(a),F.rr(.03,.05),.02,F.rr(.02,.035),cc,'dark',F.rr(0,3));}
  for(let i=0;i<3;i++){const a=i/3*F.TAU+F.rr(0,1),d=F.rr(.04,.22);hykFurnLight(F,d*Math.cos(a),.40,d*Math.sin(a),{r:F.rr(.035,.05),bare:true});}
  hykFurnBody(F,-.16,.08,[[.06,.39],[.1,.41],[.11,.45],[.09,.475],[.1,.485],[.04,.49],[0,.495]],F.pick(['barnacle','barnacleDark']),'barn',{nu:16,nv:8});}});

// the cushion ring: seven cushions in sea colours (teal, undyed, sea-green, pale: the weed cloth's green cast turns
// coral to mud) round a low nacre-lipped dish with three cups set in its hollow
FURN({key:'hykkousoi_cushion_ring',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_cushion_ring',name:'Cushion ring',culture:'hykkousoi',type:'bench',setting:'indoor',rooms:['hall','tavern'],w:2.4,d:2.4,h:.4,anchor:'floor',tier:'common',task:['resting','socializing'],clearance:{},materials:['bone','cloth','nacre','stone'],
 build(F){const cs=F.pick(['shellWhite','shellCream']),cn=F.col('nacre');
  hykFurnDish(F,0,0,.42,.27,cs,'shell',{nu:36,nv:14,flute:{n:10,amp:.05,sharp:1.6},lip:.02,lipCol:cn,lipM:'nacre',prof:[[.22,0],[.24,.03],[.13,.1],[.12,.17],[.3,.22],[.42,.27],[.39,.282],[0,.29]]});
  for(let k=0;k<3;k++){const a=k/3*F.TAU+.5;hykFurnBody(F,.2*Math.cos(a),.2*Math.sin(a),[[.03,.29],[.05,.31],[.055,.35],[.045,.37],[0,.375]],F.pick(['shellWarm','shellWarmDeep']),'shell',{nu:12,nv:6});}
  const n=7,dye=[F.col('tealSea'),F.col('shellWarm'),F.col('seaGreen'),F.col('lensTeal')];for(let k=0;k<n;k++){const a=k/n*F.TAU+F.rr(-.08,.08);const d=F.rr(.80,.84);const x=d*Math.cos(a),z=d*Math.sin(a);const r=F.rr(.28,.32),ry=F.rr(.085,.1);
   hykFurnBlob(F,x,ry,z,r,ry,dye[k%4],'weed',{n:6,nu:20,lobes:{n:5,amp:.05,ph:F.rr(0,F.TAU)}});
   hykFurnKnob(F,x,ry*2-.01,z,.018,F.pick(['boneIvory','boneCream']),'bone');}}});

// the Navigator's chart table: two fluted pedestals under an oval top with a nacre chart inlaid in it, a bone rail on
// posts round the far edge, two lenses on stalks, a loupe laid on the chart, pearl markers and dividers
FURN({key:'hykkousoi_chart_table',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_chart_table',name:'Chart table',culture:'hykkousoi',type:'table',setting:'indoor',rooms:['hall','library'],w:2.0,d:1.2,h:.9,anchor:'floor',tier:'common',task:['reading','writing'],clearance:{front:.8},materials:['bone','glass','nacre'],
 build(F){const cs=F.pick(['shellWarm','shellWarmDeep']),cb=F.pick(['boneIvory','boneCream']),cn=F.col('nacre'),cl=F.col('lensTeal');
  const O=hykFurnOval(.94,.52),R=O.R;
  for(const s of [-1,1])hykFurnBody(F,s*.48,0,[[.24,0],[.25,.03],[.14,.12],[.1,.4],[.13,.62],[.22,.72],[.26,.745]],cs,'shell',{nu:24,nv:14,flute:{n:10,amp:.05,sharp:1.6},lobes:{n:2,amp:.15}});
  hykFurnBody(F,0,0,[[R*.5,.74],[R*.9,.755],[R,.78],[R*.99,.8],[R*.6,.812],[0,.815]],cs,'shell',{nu:48,nv:8,lobes:O.lobes,flute:O.flute});
  const C=hykFurnOval(.65,.36);hykFurnLathe(F,0,0,[[C.R,.815],[C.R*.96,.82],[0,.822]],cn,'nacre',{nu:40,nv:3,lobes:C.lobes,flute:C.flute,inside:true});
  const posts=10,rp=[];for(let k=0;k<=posts;k++){const a=Math.PI/2+.35+k/posts*(F.TAU-.7);const rr1=O.at(a)*.96;rp.push([rr1*Math.cos(a),rr1*Math.sin(a)]);}
  hykFurnTube(F,rp.map(p=>[p[0],.875,p[1]]),.014,cb,'bone',{seg:6});
  for(let k=0;k<=posts;k+=2){const p=rp[k];hykFurnStalk(F,[p[0],.8,p[1]],[p[0],.875,p[1]],.012,.012,cb,'bone',{n:2,noA:true});}
  for(const s of [-1,1]){hykFurnStalk(F,[s*.55,.81,-.3],[s*.5,.845,-.26],.012,.009,cb,'bone',{n:3,noA:true});hykFurnBlob(F,s*.5,.845,-.26,.042,.042,cl,'lens',{n:5,nu:12});}
  hykFurnBlob(F,.25,.83,.2,.055,.008,cl,'lens',{n:3,nu:14});hykFurnRing(F,.25,.83,.2,.055,.007,cb,'bone',{n:16,seg:5});
  for(let i=0;i<5;i++)hykFurnBlob(F,F.rr(-.4,.4),.835,F.rr(-.2,.2),.013,.013,F.col('nacre'),'nacre',{n:4,nu:8});
  hykFurnTube(F,[[-.3,.83,.25],[-.1,.86,.18],[.08,.83,.1]],.006,cb,'bone',{seg:4});}});

// the Library's scroll-cell rack (wall-anchored, its back at -z): an oval honeycomb of six-sided shell cells, each a short
// open tube along z, scrolls in most of them capped in bone and tied in nacre, the comb's back dark, a bone rim round
// it, three pad feet under it
FURN({key:'hykkousoi_scroll_rack',source:'settlements/ys/src/66-hyk-furniture.js hykkousoi_scroll_rack',name:'Scroll rack',culture:'hykkousoi',type:'shelf',setting:'indoor',rooms:['library','study'],w:2.4,d:.6,h:2.2,anchor:'wall',tier:'common',task:['storage','reading'],clearance:{front:.8},materials:['bone','nacre','stone'],
 build(F){const cb=F.pick(['boneIvory','boneCream']),cn=F.col('nacre');
  const RX=1.08,RY=.95,CY=1.13,cr=.128,dx=.225,dy=.195;
  hykFurnEll(F,0,CY,-.27,RX*1.0,RY*1.0,.02,F.col('crustBlack'),'dark');
  for(let j=-5;j<=5;j++){const y=CY+j*dy;const off=(j&1)?dx/2:0;for(let i=-5;i<=5;i++){const x=i*dx+off;
    const ex=x/(RX-cr),ey=(y-CY)/(RY-cr);if(ex*ex+ey*ey>1)continue;
    hykFurnTube(F,[[x,y,-.24],[x,y,.24]],cr,F.pick(['shellWhite','shellCream']),'shell',{seg:6});
    if(F.chance(.62)){const r=F.rr(.06,.08);const z1=F.rr(.1,.2);hykFurnTube(F,[[x,y-.02,-.2],[x,y-.02,z1]],r,(F.chance(.5)?F.col('boneIvory'):F.col('shellWarm')),'bone',{seg:9});
     hykFurnBlob(F,x,y-.02,z1,r,r,cb,'bone',{n:4,nu:9});hykFurnRingZ(F,x,y-.02,z1-.04,r*1.05,.008,cn,'nacre',{n:12,seg:4});}}}
  const rim=[];for(let k=0;k<=40;k++){const a=k/40*F.TAU;rim.push([RX*1.06*Math.cos(a),CY+RY*1.06*Math.sin(a),-.05]);}hykFurnTube(F,rim,.03,cb,'bone',{seg:7});
  for(const x of [-.65,0,.65])hykFurnBlob(F,x,.06,-.05,.17,.06,F.pick(['shellWarm','shellWarmDeep']),'shell',{n:4,nu:14,lobes:{n:3,amp:.06}});}});
