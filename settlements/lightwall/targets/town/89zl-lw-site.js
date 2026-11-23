// ================================================================= LĀIṬWĀL — the site, the ground and the plan (PLAN.md sections 1-3, 8)
// Runs after every kit def is registered (the Xanadu and Qiblai kits' VERN.defs, the Tungang kit's TG) and before the scene.
// This fragment makes records only; 90l draws the ground and the lake, 90m the wall, 90r the bench's buildings.
// THE FRAME (PLAN.md 8): metres; x east along the shore, z south toward the lake; the origin is the Stair Foot on the bench;
// heights are the open world's less LW.Y_W (1,345.05 m): the lake at -30 (the world's water), the bench from the shore (-28) to the
// wall's foot (+90). The ground is the world's (LW_WORLD, baked from the region), the town's own seated on it (terrainH below).
//   LW            the site's numbers: the lake, the shore, the wall's line, its four bands (each a gz-stair of three flights
//                 high, 10.2 m, set back 9 m), each band's reach along the shore, the carved quarter
//   terrainH      the ground every builder and the camera read: the lake bed, the bench's profile, the wall's foot and the
//                 north wall rising behind the bands to the far field
//   LW_WALL       the Glaziers' sites: {id, key, x, y, z, ry, v, band, carve (its rooms cut: the central quarter), facade
//                 (the front alone: the outer wall), people}; the specials first (the main stair, the tea hall, the Register,
//                 the monks' house, the wheel walks, the glass shops, the adits on the Great Potch Line, the vein galleries,
//                 the dark adits), then each band filled poor to rich by its place (rich mid-height at the centre)
//   LW_BENCH      the bench's streets and blocks as records, laid on a core/city instance (the bench's own site steps, then
//                 frontage-courts on the built blocks with the Xanadu kit's houses), and the landmarks placed by hand: the
//                 Stair Foot bazaar, the assay house, the factor's house, the garrison, the quays, the caravanserai, the
//                 Decree's monastery
//   LW_PLACE      what 90r places on the bench: {key, x, z, ry, o: {v, y}, kind, cls, id, drop}
// [G data] records, no drawing.
const LW={SEED:9450,LAKE:-30,SHORE:430,FOOT:-270,WALL:-280,Y0:90,BAND_H:10.2,BAND_SET:9,BANDS:4,HALF:[700,600,480,340],CARVE:230};
const lwD=(x,d)=>x==null?d:x;   /* a numeric default: 0 is a value */
/* THE OPEN WORLD UNDER THE PAGE (the owner, 2026-11-23: "change the world"; KNOWN_ISSUES.md, "two grounds"). The page's x, z are
   the open world's, moved to the pin (slaitwal0001, px 1028,1653: x east, z south, no turn); its y is the world's less Y_W, set
   so the world's lake (WORLD.water, 1,315 m) is the page's LAKE. LW_WORLD (gen/41w-lw-world-ground.js, core/world/bake_ground.py)
   is the region's own WORLD.H, baked round the pin */
LW.Y_W=LW_WORLD.water[0].level-LW.LAKE;
const lwWorld=(x,z)=>LW_WORLD.H(x,z)-LW.Y_W;
/* THE MODEL EDIT OWED (PLAN.md, step L6): the scale model has the lake's north shore 4-5 km south of the pin and no cliff north
   of it (the ground climbs ~15 % for 3 km and steepens only 6-9 km north). Until the edit brings the shore up to the bench and
   stamps the fault's scarp behind the bands, the page carries both as one layer over the world's ground, written as a min (the
   bay) and a max (the scarp) so that once the world holds them the layer changes nothing:
     bay    the lake's bed (the bench's 9 % shelf to 16 m deep) cut into the world in front of the town, x +-1,800 m eased to
            2,500, from a 25 % bank above the shore out to the world's own lake (eased out from 5.2 to 6 km south)
     scarp  behind the wall's line: the bands' toe (1.2 down from their top's lip), then the fault's face as the page drew it
            (1.1, its gullies and buttresses), its top at 2,600 m (PLAN.md 2) easing into a block rising 6 % that the world's
            range takes over 6-7 km north; full over x +-4,000 m, gone by 6,500, and the block's lift gone 6 to 8.2 km north of
            the wall's line (where a valley of the range lies under the block's 6 %, the block slopes down into it) */
const LW_PEND={bayX:1800,bayEase:700,bayZ:5200,bayZEase:800,scarpX:4000,scarpEase:2500,top:2600,blockD:6000,blockEase:2200};
const lwSmin=(a,b,k)=>{const h=Math.max(0,Math.min(1,.5+.5*(b-a)/k));return b+(a-b)*h-k*h*(1-h);};
const lwSmax=(a,b,k)=>-lwSmin(-a,-b,k);
function lwBayBed(z){return z>=LW.SHORE?Math.max(-46,-28-(z-LW.SHORE)*.09):-28+(LW.SHORE-z)*.25;}
function lwScarp(x,z){const e=LW.WALL-z-40;if(e<=0)return LW_TOP+6+1.2*e;
 const rise=LW_TOP+6+1.1*e-.00006*e*e+40*Math.sin(x/310+e/520)*Math.min(1,e/200)+lwFace(x,e);
 return lwSmin(rise,LW_PEND.top-LW.Y_W+.06*Math.max(0,e-1000),80);}
function lwPending(x,z,h){const ax=Math.abs(x);
 const bw=lwSm((LW_PEND.bayX+LW_PEND.bayEase-ax)/LW_PEND.bayEase)*lwSm((LW_PEND.bayZ+LW_PEND.bayZEase-z)/LW_PEND.bayZEase)*lwSm((z-LW.WALL)/60);
 if(bw>0)h+=bw*(Math.min(h,lwBayBed(z))-h);
 const sw=lwSm((LW_PEND.scarpX+LW_PEND.scarpEase-ax)/LW_PEND.scarpEase)*lwSm((LW_PEND.blockD+LW_PEND.blockEase-(LW.WALL-z))/LW_PEND.blockEase);
 if(sw>0&&z<LW.WALL+120)h+=sw*(lwSmax(h,lwScarp(x,z),30)-h);
 return h;}
/* the town's own ground (the bench, the foot street, the band block) is the page's inside x +-1,150 m from the wall's line to
   300 m out on the lake, eased into the world over 550 m east and west and 400 m south */
const LW_PATCH={x:1150,ease:550,z1:LW.SHORE+300,zEase:400};
function lwPatchW(x,z){return lwSm((LW_PATCH.x+LW_PATCH.ease-Math.abs(x))/LW_PATCH.ease)*lwSm((LW_PATCH.z1+LW_PATCH.zEase-z)/LW_PATCH.zEase);}
const lwU=(a,b,c)=>KRAND.unit(KRAND.hash(LW.SEED,a|0,b|0,c|0));
const lwSm=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/* the bench: gentle by the shore (9 %), steeper toward the wall (24 %), a little roll along the shore; the east spur the
   Decree's monastery stands on (x > 820) */
function lwBench(x,z){const t=Math.max(0,Math.min(1,(LW.SHORE-z)/(LW.SHORE-LW.FOOT)));
 return -28+118*(.55*t+.45*t*t)+3*Math.sin(x/170)*t+16*lwSm((x-820)/140)*lwSm((z+40)/80)*lwSm((380-z)/120);}
const LW_TOP=LW.Y0+LW.BANDS*LW.BAND_H;
/* the foot street (the owner, 2026-11-22: "the street in front of the glazier entrances is weirdly raised and blocks off the
   entrances partly"): the bench's roll along the shore made the wall's foot 3 m above the first band's floor in the east and 3 m
   under it in the west. The street along the foot is level with that floor (the band's y, less 4 cm) from the face out to the
   dirt's edge (FOOT + 4), then eases down into the bench over 24 m, never above the floor (where the roll is highest the bench
   is still over it 10 m out); the ramp behind the wall's line starts at the same height */
function lwFootH(x,z){const f=LW.Y0-.04,b=Math.min(f,lwBench(x,Math.max(z,LW.FOOT)));return f+(b-f)*lwSm((z-LW.FOOT-4)/24);}
/* terrainH: the world's ground with the model edit owed (lwPending), the town's own ground over it in the patch (lwNear: NaN
   where the page draws none of its own, north of the band block, where the scarp is the layer's) */
terrainH=function(x,z){const g=lwPending(x,z,lwWorld(x,z)),w=lwPatchW(x,z);if(!(w>0))return g;
 const n=lwNear(x,z);return n===n?g+w*(n-g):g;};
function lwNear(x,z){
 if(z>LW.SHORE)return Math.max(-46,lwBench(x,LW.SHORE)-(z-LW.SHORE)*.09);
 if(z>=LW.WALL)return lwFootH(x,z);
 /* behind the wall's line: a ramp under the bands (their blocks stand on it); the north wall beyond is the scarp's (lwPending) */
 const d=LW.WALL-z;
 /* across the carved quarter the ramp stays a metre under the floor of every band whose rooms run over it (19 m back from its
    face: the rooms' 13 m and a 6 m ground cell), so the bench's mesh never shows inside a carved room; the step it makes at the
    quarter's ends is inside the bands' rock */
 if(Math.abs(x)<LW.CARVE+12&&d<LW.BANDS*LW.BAND_SET+19){let lo=1e9;for(let k=0;k<LW.BANDS;k++){const dk=d-k*LW.BAND_SET;if(dk>-1&&dk<19)lo=Math.min(lo,LW.Y0+k*LW.BAND_H-1);}
  if(lo<1e9)return Math.min(lo,d<40?LW.Y0+(LW_TOP+6-LW.Y0)*lwSm(d/40):1e9);}
 if(d<40)return LW.Y0+(LW_TOP+6-LW.Y0)*lwSm(d/40);
 return NaN;}
/* the north fault's face (KNOWN_ISSUES.md: "ridges, buttresses and gullies"): gullies cut down it (a ridged value noise across x,
   stretched along the slope, the ridges between them the buttresses), a rougher grain over it, both growing in from the band
   top's lip (0 at the lip, whole 300 m up); core/rand's KRAND.vnoise, so every machine draws the same face */
function lwFace(x,e){const k=Math.min(1,e/300),g=1-Math.abs(2*KRAND.vnoise(x/170+e/2600,e/1400,0,LW.SEED+35)-1),s=KRAND.vnoise(x/55,e/210,0,LW.SEED+36);
 return k*(70*(g*g-.35)+18*(s-.5));}
// ---------------------------------------------------------------- the wall: four bands of fronts
const LW_BANDS=[...Array(LW.BANDS).keys()].map(k=>({k,z:LW.WALL-k*LW.BAND_SET,y:LW.Y0+k*LW.BAND_H,half:LW.HALF[k]}));
/* a gz-stair of three flights (10.2 m: one band) and of two */
const lwStairV=n=>{for(let v=0;v<60;v++)if(TG.gz.plan('gz-stair',{v}).n===n)return v;return 0;};
const LW_STAIR3=lwStairV(3);
/* the people a site keeps (PLAN.md 2: about 2,500 in the wall) */
const LW_PEOPLE={'gz-cell':5,'gz-front':10,'gz-house':24,'gz-monks-house':6};
/* the specials, band by band: [key, x] (the main stair climbs the first three bands at x 0; the fourth band is the top) */
const LW_SPECIAL=[
 [['gz-stair',0],['gz-glass-shop',-24],['gz-glass-shop',26],['gz-adit',-92],['gz-adit',96],['gz-adit',-214],['gz-adit',220],['gz-adit',-338],['gz-adit',344],
  ['gz-adit',-462],['gz-adit',468],['gz-dark-adit',-566],['gz-dark-adit',572],['gz-dark-adit',-664]],
 [['gz-stair',0],['gz-register-room',-12.4],['gz-tea-hall',16],['gz-wheel-walk',-31],['gz-glass-shop',-70],['gz-glass-shop',74]],
 [['gz-stair',0],['gz-monks-house',14],['gz-wheel-walk',-15],['gz-adit',152],['gz-vein-gallery',-206],['gz-vein-gallery',210]],
 [['gz-wheel-walk',0],['gz-adit',-150],['gz-vein-gallery',-250],['gz-vein-gallery',254],['gz-adit',168]]];
/* the fill's mix by band and place (rich mid-height at the centre, the poor low and at the ends) */
function lwMix(k,x){const a=Math.abs(x);
 if(k===0)return a<300?[['gz-front',.6],['gz-cell',.4]]:[['gz-cell',.8],['gz-front',.2]];
 if(k===1)return a<220?[['gz-house',.45],['gz-front',.45],['gz-cell',.1]]:[['gz-front',.5],['gz-cell',.5]];
 if(k===2)return a<200?[['gz-house',.35],['gz-front',.45],['gz-cell',.2]]:[['gz-cell',.6],['gz-front',.4]];
 return [['gz-cell',.7],['gz-front',.3]];}
const lwPick=(mix,u)=>{let t=u;for(const [k,w] of mix){t-=w;if(t<=0)return k;}return mix[mix.length-1][0];};
const LW_WALL=[];
for(const B of LW_BANDS){const taken=[];
 const add=(key,x,v)=>{const W=TG.gz.BOX[key].w;taken.push([x-W/2,x+W/2]);const id='wall.'+B.k+'.'+LW_WALL.length;
  LW_WALL.push({id,key,x,y:B.y,z:B.z,ry:0,v,band:B.k,carve:Math.abs(x)<LW.CARVE,facade:Math.abs(x)>=LW.CARVE,people:lwD(LW_PEOPLE[key],0)});};
 LW_SPECIAL[B.k].forEach(([key,x],i)=>add(key,x,key==='gz-stair'?LW_STAIR3:Math.floor(lwU(B.k,i,7)*97)));
 /* the fill: a cursor east from the band's west end, a gap of 2.5-5 m after each front, skipping what the specials took */
 let x=-B.half+2,n=0;while(x<B.half-2&&n<400){n++;const key=lwPick(lwMix(B.k,x),lwU(B.k,n,11)),W=TG.gz.BOX[key].w,c=x+W/2;
  if(c+W/2>B.half-2)break;const hit=taken.find(t=>c+W/2>t[0]-2.5&&c-W/2<t[1]+2.5);
  if(hit){x=hit[1]+2.5;continue;}
  add(key,c,Math.floor(lwU(B.k,n,13)*97));x=c+W/2+2.5+2.5*lwU(B.k,n,17);}}
/* the lotus ponds, stepped down to the shore (their origin on the shingle, the basins out over the water's edge) */
for(const [i,x] of [[0,-300],[1,-210],[2,236],[3,330]].entries())LW_WALL.push({id:'pond.'+i,key:'gz-lotus-pond',x:x[1],y:terrainH(x[1],446),z:446,ry:0,v:i,band:-1,carve:false,facade:false,people:0});
LW.people={wall:LW_WALL.reduce((a,s)=>a+s.people,0),bench:0};
// ---------------------------------------------------------------- the bench: its streets, its blocks, its landmarks (records)
/* the streets: the shore road, four contour streets and the top street under the Stair Foot, the bazaar avenue up from the
   quay, cross streets every 190 m. Built blocks within 380 m of the avenue; the rest the bench terraces' fields (PLAN.md 4:
   grain toward a quarter of the town's need), a farmhouse in each */
const LW_ROWS=[400,270,140,10,-120,-196],LW_COLS=[-940,-760,-570,-380,-190,0,190,380,570,760,940];
const LW_PLAZA={x0:-84,x1:84,z0:-268,z1:-204};
const LW_STREETS=[];
LW_STREETS.push({id:'shore',cls:'main',pts:[[-1000,LW_ROWS[0]],[1000,LW_ROWS[0]]]});
for(let r=1;r<LW_ROWS.length-1;r++)LW_STREETS.push({id:'terrace.'+r,cls:'main',pts:[[-940,LW_ROWS[r]],[940,LW_ROWS[r]]]});
LW_STREETS.push({id:'top',cls:'side',pts:[[-380,LW_ROWS[5]],[380,LW_ROWS[5]]]});
LW_STREETS.push({id:'bazaar',cls:'avenue',pts:[[0,LW.SHORE+10],[0,LW_PLAZA.z1]]});
for(const x of LW_COLS)if(x!==0&&Math.abs(x)<940)LW_STREETS.push({id:'cross.'+x,cls:'side',pts:[[x,LW_ROWS[0]],[x,Math.abs(x)<=380?LW_ROWS[5]:LW_ROWS[4]]]});
const LW_W={avenue:12,main:8,side:6};
/* a block between two rows and two columns, inset by the streets' half widths and a metre */
const LW_BLOCKS=[];
for(let r=0;r<LW_ROWS.length-1;r++)for(let c=0;c<LW_COLS.length-1;c++){const xa=LW_COLS[c],xb=LW_COLS[c+1],za=LW_ROWS[r+1],zb=LW_ROWS[r];
 if(r===LW_ROWS.length-2&&(xa<-380||xb>380))continue;   /* the top row only under the Stair Foot */
 const wOf=x=>x===0?LW_W.avenue:Math.abs(x)>=940?0:LW_W.side,i0=xa+wOf(xa)/2+1,i1=xb-wOf(xb)/2-1,j0=za+(r===LW_ROWS.length-2?LW_W.side:LW_W.main)/2+1,j1=zb-LW_W.main/2-1;
 const centre=Math.max(Math.abs(xa),Math.abs(xb))<=380,kind=!centre?'field':r===LW_ROWS.length-2||r===LW_ROWS.length-3?'rich':r===0?'shore':r===1?'poor':'middle';
 LW_BLOCKS.push({id:'block.'+r+'.'+c,i:c,j:r,poly:[[i0,j0],[i1,j0],[i1,j1],[i0,j1]],kind,wealth:{rich:.85,middle:.55,poor:.3,shore:.25,field:.2}[kind],lanes:false});}
/* the landmarks, placed by hand: [key, x, z, ry, kind] (the bazaar round the Stair Foot; the factor's quarter beside it; the
   quays on the shore; the caravanserai west on the road down the valley; the Decree's monastery east on its spur) */
const LW_MARKS=[
 ['xa_guild_gold',-66,-238,Math.PI/2,'assay'],['xa_rich_b',66,-238,-Math.PI/2,'factor'],['xa_warehouse',58,-180,-Math.PI/2,'strongroom'],
 ['xa_shops',-30,-246,Math.PI/2,'bazaar'],['xa_shops',30,-246,-Math.PI/2,'bazaar'],['xa_shop_turk_a',-30,-222,Math.PI/2,'bazaar'],['xa_shop_turk_b',30,-222,-Math.PI/2,'bazaar'],
 ['xa_teahouse',-58,-182,Math.PI/2,'bazaar'],['xa_barracks',150,-166,Math.PI,'garrison'],['xa_watch',-370,-150,Math.PI,'garrison'],['xa_watch',370,-150,Math.PI,'garrison'],
 ['xa_quay',-48,452,0,'quay'],['xa_quay',48,452,0,'quay'],['xa_boatshed',-118,442,0,'quay'],['xa_boatshed',118,442,0,'quay'],['xa_warehouse',-64,416,0,'quay'],['xa_warehouse',64,416,0,'quay'],
 ['qb_caravanserai',-940,330,Math.PI/2,'caravanserai'],['xa_corral',-940,250,Math.PI/2,'caravanserai'],
 /* the Iridescent Order's house (the owner, 2026-11-16): a daughter of Qiblai's Teal great monastery, the Qiblai kit's spoke 4
    (QSPOKE 'Turquoise', its teal walls), on the east spur */
 ['qb_monastery',930,150,-Math.PI/2,'monastery',4]]
 .filter(m=>VERN.defs[m[0]]).map(([key,x,z,ry,kind,v],i)=>{const D=VERN.defs[key];return {key,x,z,ry,kind,v:lwD(v,0),id:'mark.'+i,w:D.w,d:D.d,h:lwD(D.h,10),name:kind==='monastery'?'The Iridescent Order (a house of the Teal great monastery of Qiblai)':null};});
// ---------------------------------------------------------------- the bench on core/city: its site steps, then frontage-courts
const LW_POOLS={
 rich:[['xa_rich_a',2],['xa_rich_c',2],['xa_house_turk_a',2],['xa_house_turk_b',1],['xa_andean_rich',1]],
 middle:[['xa_mid_a',3],['xa_mid_b',2],['xa_mid_c',3],['xa_andean_mid',2],['xa_shop_turk_a',1],['xa_workshop',1]],
 poor:[['xa_poor_a',3],['xa_poor_b',2],['xa_poor_c',3],['xa_andean_poor',2],['xa_workshop',1]],
 shore:[['xa_poor_a',3],['xa_poor_c',2],['xa_andean_poor',2],['xa_warehouse',1],['xa_workshop',1]]};
for(const k in LW_POOLS)LW_POOLS[k]=LW_POOLS[k].filter(p=>VERN.defs[p[0]]);
const LW_SMALL={rich:[['xa_mid_a',1]],middle:[['xa_poor_a',1]],poor:[['xa_poor_c',1]],shore:[['xa_poor_c',1]]};
const LW_GAPS={rich:[10,18],middle:[7,13],poor:[5,10],shore:[6,12]};
const lwDims=(key,v)=>{const D=VERN.defs[key];return D?{key,v:v==null?0:v,w:D.w,d:D.d,h:D.h==null?8:D.h}:null;};
const LW_TUNE={cell:2.5,rasterHalf:1100,maxSlope:.42,exact:true,width:{avenue:LW_W.avenue,main:LW_W.main,side:LW_W.side,alley:3,highway:10,lane:4.5},
 lot:{side:1.6,setback:1.4,rear:3,inset:1.0,step:3},classes:{middle:[['xa_mid_a',0]],poor:[['xa_poor_a',0]]},fallback:{middle:'poor',poor:null},
 stance:'high',stanceOpt:{maxDrop:7}};
function lwRect(x,z,w,d,ry){const co=Math.cos(ry),si=Math.sin(ry);return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>[x+a*co+b*si,z-a*si+b*co]);}
let LW_PLAN=null,LW_ERR=null;
try{
 const L=KCITY.lib,steps=[
  {name:'the bench and its ground',run(){const T=L.tune(),R=L.SL.R=new L.Raster(T.rasterHalf,T.cell),P=L.plan();R.occ.fill(L.OCC.OUT);
   for(const b of LW_BLOCKS)if(b.kind!=='field')KCITY.site.zoneRaster(R,b.poly,{dry:LW.LAKE+1.5,maxSlope:T.maxSlope});
   P.site=LW_BLOCKS.map((b,i)=>({id:i,name:b.id,type:b.kind,role:b.kind,poly:b.poly}));L.SL.minSpacing=6;}},
  {name:'the landmarks and the bazaar',run(){const R=L.SL.R;R.stampPoly([[LW_PLAZA.x0,LW_PLAZA.z0],[LW_PLAZA.x1,LW_PLAZA.z0],[LW_PLAZA.x1,LW_PLAZA.z1],[LW_PLAZA.x0,LW_PLAZA.z1]],L.OCC.HARD,-1);
   for(const m of LW_MARKS)R.stampPoly(lwRect(m.x,m.z,m.w+4,m.d+4,m.ry),L.OCC.HARD,-1);}},
  {name:'districts',run(){}},
  {name:'the streets',run(){for(const w of LW_STREETS){const way=L.SL.addWay(w.cls,w.pts,3,{tag:w.id});way.kind=w.id;}}},
  {name:'highways',run(){}},{name:'no wall',run(){}},
  {name:'the blocks: frontage and courts',run(){L.plan().courts=KCITY.strategies['frontage-courts'].run(LW_BLOCKS.filter(b=>b.kind!=='field'),
   {focus:[0,LW_PLAZA.z1],sides:4,step:6,pools:LW_POOLS,small:LW_SMALL,gaps:LW_GAPS,setback:2.2,margin:1.2,infill:{step:22,yard:.45,reach:30}});}}];
 const C=KCITY.create({name:'lightwall',tune:LW_TUNE,seed:LW.SEED,rand:'krand',index:{order:'insertion'},ground:{h:(x,z)=>terrainH(x,z)},kit:{dims:lwDims},steps});
 LW_PLAN=C.run();LW.instance=C;
}catch(e){LW_ERR=e;reportErr('lightwall: the bench did not lay: '+(e&&e.stack||e));}
// ---------------------------------------------------------------- what 90r places on the bench
const lwHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;};
const lwV=(key,id)=>lwHash(String(id)+key)%Math.min(lwD(VERN.defs[key]&&VERN.defs[key].nv,3),3);
const LW_PLACE=[];
/* the residents a building holds, by key (Qiblai's table for the Xanadu kit's houses, settlements/qiblai 89zq QC_PEOPLE; the
   Andean and Turkish houses as their class's), else by its block's class */
const LW_KEY_PEOPLE={xa_poor_a:6,xa_poor_b:12,xa_poor_c:4,xa_mid_a:7,xa_mid_b:9,xa_mid_c:16,xa_rich_a:12,xa_rich_c:11,xa_andean_poor:6,xa_andean_mid:8,xa_andean_rich:12,
 xa_house_turk_a:10,xa_house_turk_b:12,xa_shop_turk_a:5};
const LW_HOUSE_PEOPLE={rich:9,middle:6,poor:5,shore:5};
if(LW_PLAN&&LW_PLAN.courts)for(const Lt of LW_PLAN.courts.lots){if(!VERN.defs[Lt.key])continue;
 const people=/^xa_(warehouse|workshop|shops$)/.test(Lt.key)?0:lwD(LW_KEY_PEOPLE[Lt.key],lwD(LW_HOUSE_PEOPLE[Lt.cls],5));LW.people.bench+=people;
 LW_PLACE.push({key:Lt.key,x:Lt.x,z:Lt.z,ry:Lt.ry,o:{v:lwV(Lt.key,Lt.id),y:Lt.y},kind:'lot',cls:Lt.cls,id:'lot:'+Lt.id,drop:Lt.drop,h:lwD(VERN.defs[Lt.key].h,10),people});}
for(const m of LW_MARKS){const y=Math.max(...lwRect(m.x,m.z,m.w,m.d,m.ry).map(p=>terrainH(p[0],p[1])))+.05,lo=Math.min(...lwRect(m.x,m.z,m.w,m.d,m.ry).map(p=>terrainH(p[0],p[1])));
 LW_PLACE.push({key:m.key,x:m.x,z:m.z,ry:m.ry,name:m.name,o:{v:m.v,y:m.kind==='quay'?Math.max(y,LW.LAKE+1.2):y},kind:m.kind,id:m.id,drop:{lo:lo-.6},h:m.h,people:m.kind==='factor'?12:m.kind==='garrison'?(m.key==='xa_barracks'?60:0):m.kind==='monastery'?40:0});
 LW.people.bench+=LW_PLACE[LW_PLACE.length-1].people;}
/* a farmhouse in each field block, at its middle, if its ground takes it */
for(const b of LW_BLOCKS)if(b.kind==='field'&&VERN.defs.xa_farmhouse){const xs=b.poly.map(p=>p[0]),zs=b.poly.map(p=>p[1]),x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
 if(Math.abs(x)>900)continue;const D=VERN.defs.xa_farmhouse,ry=z<0?Math.PI:0,F=lwRect(x,z,D.w,D.d,ry).map(p=>terrainH(p[0],p[1]));
 LW_PLACE.push({key:'xa_farmhouse',x,z,ry,o:{v:lwV('xa_farmhouse',b.id),y:Math.max(...F)+.05},kind:'farm',id:'farm:'+b.id,drop:{lo:Math.min(...F)-.6},h:lwD(D.h,8),people:6});LW.people.bench+=6;}
LW.people.total=LW.people.wall+LW.people.bench;
window._lightwallPlan={err:LW_ERR?String(LW_ERR):null,wall:LW_WALL.length,carved:LW_WALL.filter(s=>s.carve).length,facade:LW_WALL.filter(s=>s.facade).length,
 bench:LW_PLACE.length,lots:LW_PLACE.filter(p=>p.kind==='lot').length,people:LW.people,blocks:LW_BLOCKS.length,fields:LW_BLOCKS.filter(b=>b.kind==='field').length};
KTAGS.page=KTAGS.page||KTAGS.create({build:'lightwall'});
// ---------------------------------------------------------------- the flora's mask (the Vale of Xanadu biome on Xanadu's page, as Qiblai's:
// a stand-in for the middle terrace's own Opal Valley flora, KNOWN_ISSUES.md). From the plan's records, never from pixels: none
// in the lake, on the wall, on a street, in a field or within a building's footprint (core/space's index of what is placed);
// the odd tree in a built block (.05), the bench's open ground between and round the town wild (.5)
const lwSpace=KCITY.lib.KSPACE.create({cell:40});
for(const p of LW_PLACE){const D=VERN.defs[p.key];if(D)lwSpace.insert(p,p.x,p.z,Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5);}
for(const s of LW_WALL){const B=TG.gz.BOX[s.key];lwSpace.insert(s,s.x,s.z+B.out/2,Math.hypot(B.w,B.out+2)/2+2);}
function lwInPoly(P,x,z){const xs=P.map(p=>p[0]),zs=P.map(p=>p[1]);return x>Math.min(...xs)&&x<Math.max(...xs)&&z>Math.min(...zs)&&z<Math.max(...zs);}
function lwSegD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L0=dx*dx+dz*dz,L=L0>0?L0:1;let t=((x-a[0])*dx+(z-a[1])*dz)/L;t=Math.max(0,Math.min(1,t));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
/* THE BLOCKS' OPEN GROUND (the owner, 2026-11-16: "a lot of empty space between the buildings ... more plants or fields"): every
   built block's ground not under a building or a street, in 12 m plots, each a kitchen garden (beds in rows), an orchard (trees
   on grass) or a yard (grass, the odd tree) by a hash of its cell (core/rand); the plot nearest a house is its dooryard (made
   ground). From the records only: 90l paints them, the flora mask plants the orchards and yards */
const LW_PLOT=12;
function lwBlockAt(x,z){for(const b of LW_BLOCKS)if(lwInPoly(b.poly,x,z))return b;return null;}
function lwNearBuilding(x,z,m){for(const p of lwSpace.query(x,z,1)){const D=VERN.defs[p.key]||TG.gz.BOX[p.key];if(!D)continue;const r=Math.hypot(D.fw||D.w,D.fd||D.d||D.out)/2;if(Math.hypot(x-p.x,z-p.z)<r+m)return true;}return false;}
function lwPlot(x,z){const b=lwBlockAt(x,z);if(!b||b.kind==='field')return null;
 for(const w of LW_STREETS)if(lwSegD(x,z,w.pts[0],w.pts[1])<LW_W[w.cls]/2+1)return null;
 if(lwNearBuilding(x,z,1.5))return null;if(lwNearBuilding(x,z,5))return 'dooryard';
 const i=Math.floor(x/LW_PLOT),j=Math.floor(z/LW_PLOT),u=KRAND.unit(KRAND.hash(LW.SEED,i,j,0x91)),rich=b.kind==='rich';
 return u<(rich?.25:.45)?'garden':u<(rich?.7:.72)?'orchard':'yard';}
function lwBioMask(x,z){if(z>LW.SHORE+12||z<LW.WALL+4)return 0;
 if(x>LW_PLAZA.x0-6&&x<LW_PLAZA.x1+6&&z>LW_PLAZA.z0-16&&z<LW_PLAZA.z1+6)return 0;
 for(const w of LW_STREETS)if(lwSegD(x,z,w.pts[0],w.pts[1])<LW_W[w.cls]/2+1.5)return 0;
 for(const p of lwSpace.query(x,z,1)){const D=VERN.defs[p.key]||TG.gz.BOX[p.key],r=Math.hypot(D.fw||D.w,D.fd||D.d||D.out)/2+1.5;if(Math.hypot(x-p.x,z-p.z)<r)return 0;}
 const b=lwBlockAt(x,z);if(b){if(b.kind==='field')return 0;const pl=lwPlot(x,z);return pl==='orchard'?.75:pl==='yard'?.3:pl==='dooryard'?.04:0;}
 return .5;}
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:lwBioMask,origin:[[0,0],[-700,200],[700,200]],center:[0,100],
 fields:{wet:(x,z)=>Math.min(1,.6+Math.max(0,1-(LW.SHORE+20-z)/200)*.3),salt:()=>0,upland:()=>0,flow:()=>0,mist:()=>0}});}
