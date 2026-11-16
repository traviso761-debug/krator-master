// ================================================================= THALABA — the site, the ground and the plan (PLAN.md section 3; step T3)
// Runs after every kit def is registered and before the scene (90-scene). The ground is the scale model's at 1:1 (gen/
// 69u-tb-ground.js: bicubic round the pin, as core/world reads the same cells), with the town's own work cut into it: the
// Siṭēps (the terraces on the riser, 1.5-6.6 km north of the spring line), the leat that waters them, the spring line's basins
// and the stepped tank. The town is a core/city instance: its own steps lay the raster, the two roads that meet at the market
// square (the Phēr road from the west, the expedition road north up the riser to the gorge's mouth), the contour streets and
// the cross streets; the frontage-courts strategy fills the house blocks with the Xanadu kit's keys; the civic buildings
// stand on their own blocks round the square. This fragment makes the plan only (records); 90r draws it.
// Metres; x east, z south (north is -z); the origin is the pin, px 840,1463 (2 km a pixel). [G data] records, no drawing.
const TB={SEED:34210,STREET:5.5,MAIN:8,SPRING_Z:-600,TERR:{z0:-6600,z1:-1400,x0:-1500,x1:1500,step:1.8}};
const tbD=(x,d)=>x==null?d:x;   // a numeric default: 0 is a value
function tbHash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;}
function tbSmooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}

// ---------------------------------------------------------------- the model's ground (gen/69u-tb-ground.js)
function tbDec(o){const s=atob(o.b64),n=s.length>>1,a=new Float32Array(n);
 for(let i=0;i<n;i++){let v=s.charCodeAt(2*i)|(s.charCodeAt(2*i+1)<<8);if(v>32767)v-=65536;a[i]=o.base+v*o.unit;}return a;}
const TB_NEAR=tbDec(TB_GROUND.near),TB_FAR=tbDec(TB_GROUND.far);
function tbBil(G,a,x,z){const u=Math.min(G.nx-1.0001,Math.max(0,(x-G.x0)/G.step)),v=Math.min(G.nz-1.0001,Math.max(0,(z-G.z0)/G.step));
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*G.nx+i;return(a[k]*(1-fu)+a[k+1]*fu)*(1-fv)+(a[k+G.nx]*(1-fu)+a[k+G.nx+1]*fu)*fv;}
// the near grid inside its box (the town to the gorge's mouth), blended over its last 300 m into the far grid, the far grid beyond
function tbModel(x,z){const N=TB_GROUND.near,f=tbBil(TB_GROUND.far,TB_FAR,x,z),e=Math.min(x-N.x0,N.x1-x,z-N.z0,N.z1-z);
 if(e<=0)return f;const n=tbBil(N,TB_NEAR,x,z),t=Math.max(0,1-e/300);return n*(1-t)+f*t;}

// ---------------------------------------------------------------- the ways (core/city lays them below; the ground reads them too)
// the main roads: the Phēr road from the west (up the Qol Siṭrīm's valley to its head, then east onto the bench), the road east
// to the Bēnch's farms, the expedition road north up the riser to Briḍj and the gorge's mouth; then the contour streets and the
// cross streets of the town's grid, and the mule path south across the bench and down the scarp to Phēr (the owner's)
const TB_X=[-650,-480,-240,0,240,480,650],TB_Z=[-560,-360,-180,0,170,330];
const TB_WAYS=[
 {id:'pher',name:'the Phēr road',cls:'main',pts:[[-2380,250],[-1700,190],[-1100,110],[-650,0],[0,0]]},
 {id:'east',name:'the Bēnch road',cls:'main',pts:[[0,0],[650,0],[1200,30],[2380,110]]},
 {id:'exped',name:'the expedition road',cls:'main',pts:[[0,0],[0,-560],[30,-800],[110,-1250],[230,-1800],[300,-2600],[380,-4000],[420,-6000],[380,-8000],[250,-10300]]},
 {id:'mule',name:'the mule path to Phēr',cls:'lane',pts:[[0,330],[0,1000],[0,2380]]}];   /* the owner, 2026-11-16: "Yes, a mule path": the short way down the scarp (PLAN.md section 3), on x 840 to the bench's edge */
for(const z of[-560,-360,-180,170,330])TB_WAYS.push({id:'street z'+z,name:z===-560?'the spring street':'a contour street',cls:'side',pts:[[-650,z],[650,z]]});
for(const x of[-650,-480,-240,240,480,650])TB_WAYS.push({id:'street x'+x,name:'a cross street',cls:'side',pts:[[x,-560],[x,330]]});
const TB_W={main:TB.MAIN,side:TB.STREET,lane:4.5};
// distance from (x, z) to a polyline
function tbSegD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L2=Math.max(1e-9,dx*dx+dz*dz),t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
function tbLineD(x,z,P){let d=1e9;for(let i=0;i+1<P.length;i++)d=Math.min(d,tbSegD(x,z,P[i],P[i+1]));return d;}
const TB_EXPED=TB_WAYS.find(w=>w.id==='exped').pts;
// a polyline cut to the square |x|, |z| <= h (core/city's raster holds the town, not the roads' far ends)
function tbClip(P,h){const inside=p=>Math.abs(p[0])<=h&&Math.abs(p[1])<=h,out=[];
 const cut=(a,b)=>{let lo=0,hi=1;for(let k=0;k<40;k++){const m=(lo+hi)/2,q=[a[0]+(b[0]-a[0])*m,a[1]+(b[1]-a[1])*m];if(inside(q)===inside(a))lo=m;else hi=m;}return[a[0]+(b[0]-a[0])*lo,a[1]+(b[1]-a[1])*lo];};
 for(let i=0;i<P.length;i++){const p=P[i],a=i?P[i-1]:null;
  if(a&&inside(a)!==inside(p))out.push(cut(a,p));if(inside(p))out.push(p);}
 return out;}

// ---------------------------------------------------------------- the leat (PLAN.md section 3: off the Solṭ Siṭrīm at the mouth, down
// the riser beside the expedition road, then west along the terraces' top on a falling contour). Its line: from the mouth
// down the road's east side to the terraces' top, then west across them, each point a little lower than the last; its water
// sits in a cut
const TB_LEAT=(function(){const P=[],side=16;
 for(let z=-10300;z<=-6500;z+=46){let x=0;for(let i=0;i+1<TB_EXPED.length;i++){const a=TB_EXPED[i],b=TB_EXPED[i+1];if((z-a[1])*(z-b[1])<=0&&a[1]!==b[1]){x=a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1]);break;}}P.push([x+side,z]);}
 // then west along the top of the terraces: each step 40 m, the line moved north or south until the ground is just above the water
 let [x,z]=P[P.length-1],y=tbModel(x,z)-.6;
 for(let k=0;k<70&&x>TB.TERR.x0-150;k++){x-=40;y-=.12;let best=z,bd=1e9;for(let dz=-90;dz<=90;dz+=6){const d=Math.abs(tbModel(x,z+dz)-(y+.6));if(d<bd){bd=d;best=z+dz;}}z=best;P.push([x,z]);}
 const out=[];let yl=1e9;for(const p of P){yl=Math.min(yl-.05,tbModel(p[0],p[1])-.55);out.push([p[0],p[1],yl]);}return out;})();
const TB_LEAT_BOX=[Math.min(...TB_LEAT.map(p=>p[0]))-10,Math.min(...TB_LEAT.map(p=>p[1]))-10,Math.max(...TB_LEAT.map(p=>p[0]))+10,Math.max(...TB_LEAT.map(p=>p[1]))+10];
const tbLeatD=(x,z)=>(x<TB_LEAT_BOX[0]||x>TB_LEAT_BOX[2]||z<TB_LEAT_BOX[1]||z>TB_LEAT_BOX[3])?1e9:tbLineD(x,z,TB_LEAT);

// ---------------------------------------------------------------- the spring line's basins and the stepped tank (Siprīngz)
// Seven springs along the town's back, each a stone basin, and the tank (a stepped well, a baoli) the town's water is drawn from
const TB_SPRINGS=[];for(let k=0;k<7;k++){const x=-540+k*180,z=TB.SPRING_Z+((k*37)%11)-5;TB_SPRINGS.push({id:'spring '+(k+1),x,z,r:3.2,y:tbModel(x,z)});}
const TB_TANK={x:-120,z:-470,half:13,depth:4.2,steps:5};TB_TANK.rim=tbModel(TB_TANK.x,TB_TANK.z);TB_TANK.water=TB_TANK.rim-TB_TANK.depth+1.1;

// ---------------------------------------------------------------- the ground every builder and the camera read
// the model's ground, the Siṭēps' treads stepped into it (not under the expedition road or the leat), the leat's cut, the
// springs' basins and the tank's steps
// the leat's westward run (after its descent beside the road): the terraces lie below it, so its line is the belt's top
const TB_LEAT_W=TB_LEAT.filter(p=>p[1]>-6500||p[0]<TB_LEAT[0][0]-40).slice().sort((p,q)=>q[0]-p[0]);
function tbLeatZ(x){const W=TB_LEAT_W;if(!W.length)return TB.TERR.z0;if(x>=W[0][0])return W[0][1];
 for(let i=0;i+1<W.length;i++){const a=W[i],b=W[i+1];if(x<=a[0]&&x>=b[0]){const t=(a[0]-x)/Math.max(1e-6,a[0]-b[0]);return a[1]+(b[1]-a[1])*t;}}return W[W.length-1][1];}
function tbTerraceW(x,z){const T=TB.TERR,top=tbLeatZ(x)+30;
 const w=tbSmooth(top,top+60,z)*(1-tbSmooth(T.z1-60,T.z1,z))*tbSmooth(T.x0,T.x0+60,x)*(1-tbSmooth(T.x1-60,T.x1,x));if(w<=0)return 0;
 return w*tbSmooth(10,22,tbLineD(x,z,TB_EXPED));}
function tbGround(x,z){let h=tbModel(x,z);
 const w=tbTerraceW(x,z);if(w>0){const s=TB.TERR.step,q=h/s,f=q-Math.floor(q),st=(Math.floor(q)+tbSmooth(.86,1,f))*s;h+=w*(st-h);}
 const dl=tbLeatD(x,z);if(dl<4)h-=1.0*(1-tbSmooth(1.2,4,dl));
 for(const S of TB_SPRINGS){const d=Math.hypot(x-S.x,z-S.z);if(d<S.r+1.5)h=Math.min(h,S.y-.7*(1-tbSmooth(S.r-.5,S.r+1.5,d)));}
 const K=TB_TANK,ax=Math.abs(x-K.x),az=Math.abs(z-K.z),m=Math.max(ax,az);
 if(m<K.half+1){const t=Math.max(0,Math.min(1,(K.half+1-m)/(K.half+1))),k=Math.min(K.steps,Math.floor(t*K.steps*1.6));h=Math.min(h,K.rim-k*(K.depth/K.steps));}
 return h;}
terrainH=function(x,z){return tbGround(x,z);};
// the core/tags registry under this town's name (91t-xanadu-tags.js takes it up rather than making Erewhon's)
KTAGS.page=KTAGS.page||KTAGS.create({build:'thalaba'});

// ---------------------------------------------------------------- the blocks: the town's grid between its streets
// i west to east (TB_X), j north to south (TB_Z). The civic buildings take the blocks round the square (PLAN.md section 3);
// the corners are orchards; the rest are house blocks, the richest uphill toward the spring line and the view north
const TB_LAND={'2,2':'temple','3,2':'devisers','2,3':'horns','3,3':'granary','0,2':'yard','0,3':'stables','5,1':'dalab','2,0':'tank',
 '0,0':'orchard','5,0':'orchard','0,4':'orchard','5,4':'orchard','1,4':'orchard','4,4':'orchard','3,0':'garden'};
const tbHalfW=v=>v===0?TB.MAIN/2+1:TB.STREET/2+1;
const TB_BLOCKS=[];
for(let i=0;i+1<TB_X.length;i++)for(let j=0;j+1<TB_Z.length;j++){
 const x0=TB_X[i]+tbHalfW(TB_X[i]),x1=TB_X[i+1]-tbHalfW(TB_X[i+1]),z0=TB_Z[j]+tbHalfW(TB_Z[j]),z1=TB_Z[j+1]-tbHalfW(TB_Z[j+1]);
 const use=TB_LAND[i+','+j]||'houses',kind=j<=1&&i>=1&&i<=4?'rich':(j>=4||i===5&&j===3||i===0&&j===1)?'poor':'middle';
 TB_BLOCKS.push({id:'b'+i+'.'+j,i,j,use,kind,wealth:kind==='rich'?.85:kind==='middle'?.5:.2,box:[x0,z0,x1,z1],poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]});}
const TB_ZONE=[[TB_X[0],TB_Z[0]],[TB_X[6],TB_Z[0]],[TB_X[6],TB_Z[5]],[TB_X[0],TB_Z[5]]];
const TB_SQUARE={x0:-56,z0:-40,x1:56,z1:40};

// ---------------------------------------------------------------- the kit's keys for each kind of block (frontage-courts' pools)
const TB_POOLS={
 rich:[['xa_rich_a',3],['xa_rich_b',1],['xa_rich_c',2],['xa_mid_c',2],['xa_andean_rich',1]],
 middle:[['xa_mid_a',3],['xa_mid_b',2],['xa_mid_c',1],['xa_house_turk_a',2],['xa_house_turk_b',2],['xa_shops',2],['xa_shop_turk_a',1],['xa_teahouse',1],['xa_workshop',1]],
 poor:[['xa_poor_a',3],['xa_poor_b',1],['xa_poor_c',4],['xa_andean_poor',2],['xa_workshop',1],['xa_smithy',1]]};
const TB_SMALL={rich:[['xa_mid_a',1]],middle:[['xa_poor_a',1],['xa_mid_a',1]],poor:[['xa_poor_c',1]]};
const TB_GAPS={rich:[12,22],middle:[7,14],poor:[6,12]};
function tbDims(key,v){const D=VERN.defs[key];return D?{key,v:v==null?0:v,w:D.w,d:D.d,h:D.h==null?8:D.h}:null;}

// ---------------------------------------------------------------- the instance: the town's steps, then the house blocks filled
const TB_TUNE={cell:2.5,rasterHalf:1000,maxSlope:.35,exact:true,width:{avenue:10,main:TB.MAIN,side:TB.STREET,alley:3,highway:10,lane:4.5},
 lot:{side:1.6,setback:1.4,rear:3,inset:1.0,step:3},classes:{middle:[['xa_mid_a',0]],poor:[['xa_poor_a',0]]},fallback:{middle:'poor',poor:null}};
let TB_PLAN=null,TB_ERR=null;
try{
 const L=KCITY.lib;
 const steps=[
  {name:'the site and its ground',run(){const SL=L.SL,P=L.plan(),R=SL.R=new L.Raster(TB_TUNE.rasterHalf,TB_TUNE.cell);let land=0;
   R.occ.fill(L.OCC.OUT);
   for(const b of TB_BLOCKS)if(b.use==='houses')land+=KCITY.site.zoneRaster(R,b.poly,{dry:-1e9,maxSlope:TB_TUNE.maxSlope,h:tbGround});
   P.zone=TB_ZONE;P.site=[{id:0,name:'Thalaba',type:'town',role:'town',poly:TB_ZONE}];
   try{SL.minSpacing=KCITY.site.minSpacing();}catch(e){SL.minSpacing=TB.STREET;}if(!(SL.minSpacing>0))SL.minSpacing=TB.STREET;
   SL.note(0,'Thalaba: '+TB_BLOCKS.length+' blocks, '+land+' cells of ground for houses');}},
  {name:'the roads and the streets',run(){const SL=L.SL;
   for(const w of TB_WAYS){const P=tbClip(w.pts,TB_TUNE.rasterHalf-20);if(P.length<2)continue;const way=SL.addWay(w.cls,P,3,{tag:w.id});way.kind=w.id;}
   SL.note(3,TB_WAYS.length+' ways');}},
  {name:'the house blocks: frontage and courts',run(){const P=L.plan();
   P.courts=KCITY.strategies['frontage-courts'].run(TB_BLOCKS.filter(b=>b.use==='houses'),
    {step:6,focus:[0,-200],sides:4,pools:TB_POOLS,small:TB_SMALL,gaps:TB_GAPS,garden:{rich:.5,middle:.42,poor:.36},
     infill:{step:10,yard:.75,yardR:10,reach:22}});}}];
 const C=KCITY.create({name:'thalaba',tune:TB_TUNE,seed:TB.SEED,rand:'krand',index:{order:'insertion'},ground:{h:tbGround},kit:{dims:tbDims},steps});
 TB_PLAN=C.run();TB.instance=C;
}catch(e){TB_ERR=e;reportErr('thalaba: the site did not lay: '+(e&&e.stack||e));}

// ---------------------------------------------------------------- what 90r places: one record per building
// {key, x, z, ry, o: {v, y}, h, kind}; the lots from the infill, then the civic buildings on their blocks
const TB_PLACE=[];
function tbV(key,id){const n=tbD(VERN.defs[key]&&VERN.defs[key].nv,3);return tbHash(String(id)+key)%Math.min(n,3);}
// a building's floor: the lowest ground under its footprint (core/city's foot), so no corner floats
function tbFoot(x,z,w,d,ry){const c=Math.cos(ry),s=Math.sin(ry);let y=tbGround(x,z);
 for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const lx=a*w/2,lz=b*d/2;y=Math.min(y,tbGround(x+lx*c+lz*s,z-lx*s+lz*c));}return y-.15;}
if(TB_PLAN&&TB_PLAN.courts){
 for(const Lt of TB_PLAN.courts.lots)if(VERN.defs[Lt.key])TB_PLACE.push({key:Lt.key,x:Lt.x,z:Lt.z,ry:Lt.ry,o:{v:tbV(Lt.key,Lt.id),y:Lt.y},kind:'house',cls:Lt.cls,id:'lot:'+Lt.id,w:VERN.defs[Lt.key].w,h:tbD(VERN.defs[Lt.key].h,10)});}
const tbBlock=(i,j)=>TB_BLOCKS.find(b=>b.i===i&&b.j===j);
// a civic piece at (u, v) of its block's box (0..1 each), facing f (radians: 0 faces +z, south)
function tbCivic(key,kind,i,j,u,v,ry,extra){const b=tbBlock(i,j),D=VERN.defs[key];if(!b||!D)return null;
 const x=b.box[0]+(b.box[2]-b.box[0])*u,z=b.box[1]+(b.box[3]-b.box[1])*v,p=Object.assign({key,x,z,ry,o:{v:0,y:tbFoot(x,z,D.w,D.d,ry)},kind,id:kind+':'+key+':'+i+','+j+':'+u+','+v,w:D.w,h:tbD(D.h,10)},extra||{});
 TB_PLACE.push(p);return p;}
const TB_FS=0,TB_FN=Math.PI,TB_FE=Math.PI/2,TB_FW=-Math.PI/2;   // a front toward the south, north, east, west
// the temple of the Decree and the baths, north-west of the square (their fronts on the square's streets)
tbCivic('xa_temple','temple',2,2,.62,.62,TB_FS);tbCivic('xa_bath','bath',2,2,.24,.38,TB_FN);
// the Rare Devisers' house (PLAN.md section 2; Thalaba's own piece, src/89t1-tb-pieces.js): the hall over the counting room, the
// strongroom, the sulfur shed and the wax store round the yard where the expedition outfits, its gate on the Bēnch road
tbCivic('tb_devisers','devisers',3,2,.42,.6,TB_FS,{name:'The Rare Devisers\' house at Thalaba'});
// the Two Horns' factor and the inn, south-west of the square, on the Phēr road
tbCivic('xa_rich_c','horns',2,3,.70,.30,TB_FN,{name:'The Two Horns\' factor house'});tbCivic('xa_warehouse','horns',2,3,.70,.75,TB_FN);
tbCivic('xa_teahouse','inn',2,3,.22,.26,TB_FN,{name:'The inn on the square'});tbCivic('xa_teahouse','inn',2,3,.22,.62,TB_FE);
// the granary, the threshing floors' sheds and the smithy, south-east of the square, toward the Bēnch
tbCivic('xa_granary','granary',3,3,.28,.30,TB_FN);tbCivic('xa_granary','granary',3,3,.52,.30,TB_FN);tbCivic('xa_granary','granary',3,3,.76,.30,TB_FN);tbCivic('xa_smithy','granary',3,3,.30,.78,TB_FN);
// the road's quarter at the west gate: the caravan yard (the muster ground's walls), the stables' pens, the farrier
tbCivic('xa_muster','yard',0,2,.5,.5,TB_FE,{name:'The caravan yard'});tbCivic('xa_smithy','stables',0,3,.5,.25,TB_FE,{name:'The farrier'});
tbCivic('xa_pens','stables',0,3,.3,.7,0);tbCivic('xa_pens','stables',0,3,.7,.7,0);
// the spring garden at the tank (the rill running down from the springs), and the town's garden beside the expedition road
tbCivic('xa_rill_hill','tank',2,0,.80,.55,TB_FS,{name:'The spring garden'});tbCivic('xa_garden','garden',3,0,.5,.5,TB_FW,{name:'The garden by the spring street'});
// the orchards at the town's four corners: the kit's public garden (a chahar-bagh) at each, the rest of the block trees
for(const[i,j]of[[0,0],[5,0],[0,4],[5,4],[1,4],[4,4]])tbCivic('xa_garden','orchard',i,j,.5,.5,j===0?TB_FS:TB_FN);
// the Dalab mission (the owner, 2026-11-16: "a small Dalab mission here of about 30 people", "dalab style"), on the town's east
// edge: the Dalab set's own pieces, read in place from settlements/dalab/src (kit.json `external`): the healers' hall for the
// genepriests' house, the granaries for the seed and specimen stores, a family compound for the hired men's lodging; their
// fronts to the town (west)
const TB_DALAB=[tbCivic('dalab_healers','dalab',5,1,.5,.3,TB_FW,{name:'The Dalab mission: the genepriests\' house'}),
 tbCivic('dalab_granaries','dalab',5,1,.3,.8,TB_FW,{name:'The Dalab mission: the seed and specimen stores'}),
 tbCivic('dalab_compound','dalab',5,1,.74,.8,TB_FW,{name:'The Dalab mission: the lodging for the hired men'})].filter(Boolean);

// ---------------------------------------------------------------- the fields (PLAN.md section 3): the Siṭēps' terraces north of the
// spring line, on the treads, each a crop or fallow; the Bēnch's fields east and south of the town, tilled, in crop, fallow or
// meadow; none on the roads, the leat, the orchards' ground or inside the town
const TB_FIELDS=[];
{const P=[150,64];const inTown=(x0,z0,x1,z1)=>x1>TB_X[0]-30&&x0<TB_X[6]+30&&z1>TB_Z[0]-60&&z0<TB_Z[5]+30;
 for(let i=Math.floor(-2300/P[0]);i<=Math.ceil(2300/P[0]);i++)for(let j=Math.floor(-10300/P[1]);j<=Math.ceil(2300/P[1]);j++){
  const x0=i*P[0]+3,x1=(i+1)*P[0]-3,z0=j*P[1]+2,z1=(j+1)*P[1]-2,cx=(x0+x1)/2,cz=(z0+z1)/2;
  if(inTown(x0,z0,x1,z1))continue;
  if(TB_WAYS.some(w=>tbLineD(cx,cz,w.pts)<Math.max(P[0],P[1])/2+6))continue;   // the roads and the streets
  if(tbLeatD(cx,cz)<P[1]/2+4)continue;                                            // the leat
  const terr=tbTerraceW(cx,cz)>.5,h=tbHash('field:'+i+':'+j)%100;
  if(!terr&&h<18)continue;                                                       // a meadow left between
  TB_FIELDS.push({box:[x0,z0,x1,z1],kind:terr?(h<70?'terrace':'terrace-fallow'):h<46?'tilled':h<80?'crop':'fallow',id:'field:'+i+':'+j});}}
// the threshing floors: three paved discs east of the granary
const TB_THRESH=(function(){const b=tbBlock(3,3);return[0,1,2].map(k=>({x:b.box[2]+60,z:b.box[1]+40+k*44,r:11}));})();

// ---------------------------------------------------------------- the flora's mask and climate (the Vale of Xanadu biome, Xanadu's
// page carries it; the bench at 1,500 m is in the Sultanate's `xanadu` biome polygon). From the plan's records, never from
// pixels: the country wild (1) but for the fields, the roads and the leat; the orchards planted (.8); the odd tree in a yard
// (.05), never within a building's footprint (core/space's index of what the plan places) or on a way
const tbSpace=KCITY.lib.KSPACE.create({cell:40});
for(const p of TB_PLACE){const D=VERN.defs[p.key];if(D)tbSpace.insert(p,p.x,p.z,Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5);}

const tbInBox=(B,x,z,m)=>x>B[0]-tbD(m,0)&&x<B[2]+tbD(m,0)&&z>B[1]-tbD(m,0)&&z<B[3]+tbD(m,0);
function tbFieldAt(x,z){for(const f of TB_FIELDS)if(tbInBox(f.box,x,z,2))return f;return null;}
function tbBlockAt(x,z){for(const b of TB_BLOCKS)if(tbInBox(b.box,x,z,-1))return b;return null;}
function tbBioMask(x,z){
 for(const w of TB_WAYS)if(tbLineD(x,z,w.pts)<tbD(TB_W[w.cls],5)/2+3)return 0;
 if(tbLeatD(x,z)<4)return 0;
 if(x>TB_X[0]-20&&x<TB_X[6]+20&&z>TB_Z[0]-60&&z<TB_Z[5]+20){
  const b=tbBlockAt(x,z);if(!b)return 0;
  for(const p of tbSpace.query(x,z,1)){const D=VERN.defs[p.key],r=D?Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5:Math.hypot(p.w,p.d)/2+1.5;if(Math.hypot(x-p.x,z-p.z)<r)return 0;}
  return b.use==='orchard'||b.use==='garden'?.8:.05;}
 return tbFieldAt(x,z)?0:1;}
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:tbBioMask,origin:[[0,0],[0,-1400],[1400,0]],center:[0,-300],
 fields:{wet:(x,z)=>Math.min(1,.6+Math.max(0,1-tbLeatD(x,z)/40)*.2),salt:()=>0,upland:()=>.1,   /* the biome's open vale (parkland, orchards): the bench's Cfb at 1,500 m; its uplands zone is the dry Mediterranean */
  flow:(x,z)=>Math.max(0,1-tbLeatD(x,z)/12),mist:()=>0}});}

// ---------------------------------------------------------------- the people (PLAN.md section 2: about 2,400; the Devisers' house, the
// Two Horns' factor and the Dalab mission beside them). Residents a building holds, by key (est.: a household of 5-7, servants
// in the rich houses; the shops and workshops with their families over them); checked against the plan in verify
const TB_PEOPLE={xa_poor_a:6,xa_poor_b:11,xa_poor_c:4,xa_andean_poor:6,xa_mid_a:7,xa_mid_b:9,xa_mid_c:14,xa_house_turk_a:7,xa_house_turk_b:8,
 xa_rich_a:12,xa_rich_b:14,xa_rich_c:11,xa_andean_rich:12,xa_shops:6,xa_shop_turk_a:6,xa_teahouse:4,xa_workshop:5,xa_smithy:5};
const TB_HOUSE={devisers:40,horns:20,dalab:30};   // the houses beside the town (the tune: devisers.thalaba, horns.thalaba, dalab.thalaba)
const TB_POP={town:0,houses:TB_HOUSE.devisers+TB_HOUSE.horns+TB_HOUSE.dalab};
for(const p of TB_PLACE)if(p.kind==='house'||p.kind==='inn')TB_POP.town+=tbD(TB_PEOPLE[p.key],0);
window._thalabaPlan={err:TB_ERR?String(TB_ERR):null,place:TB_PLACE.length,lots:TB_PLAN&&TB_PLAN.courts?TB_PLAN.courts.lots.length:0,people:TB_POP,
 blocks:TB_BLOCKS.length,houseBlocks:TB_BLOCKS.filter(b=>b.use==='houses').length,ways:TB_WAYS.length,fields:TB_FIELDS.length,leat:TB_LEAT.length,springs:TB_SPRINGS.length,
 pin:{model:+tbModel(0,0).toFixed(1),drawn:+tbGround(0,0).toFixed(1)}};
