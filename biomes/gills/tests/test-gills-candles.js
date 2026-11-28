// node biomes/gills/tests/test-gills-candles.js - the candles (Qãḍal) and the pipe field's sites (biomes/gills/PLAN.md sections 3, 9, 11 item 4).
// On tools/ktest.js (CLAUDE.md: T.ok, T.neg with a fault and a fix, T.done; never a local ok). No browser: the fragment is [G data].
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..','..','..');
const T=require(path.join(ROOT,'tools','ktest.js'))(__filename);
global.window=global;
eval(fs.readFileSync(path.join(ROOT,'core','rand','08-core-rand.js'),'utf8')+';global.KRAND=KRAND;');
eval(fs.readFileSync(path.join(ROOT,'core','space','20-core-space.js'),'utf8')+';global.KSPACE=KSPACE;');   /* GILLS.life keeps its pipes clear on KSPACE (PLAN.md section 13), so the test loads it as a page does */
eval(fs.readFileSync(path.join(__dirname,'..','src','44-gills-life.js'),'utf8')+';global.GILLS=GILLS;');
eval(fs.readFileSync(path.join(__dirname,'..','src','45-gills-candles.js'),'utf8'));
const G=GILLS;

// the ground of a plain flank, falling to the south-east, so a candle's y can be held against it
const ground=(x,z)=>3746+x*.04-z*.06;
const SW=G.layout({centre:[0,0],band:[600,2100],arc:[-0.9,0.9],n:5,dead:4,seed:0x6111,w:[14,44],d:[38,86],len:[500,2000]});
const OPT={ground,seed:0x6113,dry:.5};
const C=G.candles(SW,OPT);
const LIFE=G.life(SW,{ground,iceH:1e9,treeH:1e9,lip:[3,9],step:18,wind:[.6,.8],seed:0x6112});
const SITE=G.sites(SW,LIFE,Object.assign({},OPT,{country:'white'}));

// ---- the candles stand only where they can burn
const dryIds=SW.gills.filter(g=>G.isDry(SW,g,OPT)).map(g=>g.id);
T.ok('the swarm has both breathing and dry gills to tell apart ('+SW.gills.filter(g=>g.alive).length+' breathing, '+dryIds.length+' dry)',
 SW.gills.some(g=>g.alive)&&dryIds.length>0&&C.length>0,C.length+' candles on '+dryIds.length+' dry gills');
const onDry=cs=>cs.every(c=>dryIds.indexOf(c.gill)>=0);
T.neg('a candle never stands on a breathing gill (it steams, it does not burn)',onDry,
 C.concat([{gill:(SW.gills.find(g=>g.alive)||{}).id}]),C);
const aliveBurn=ids=>ids.every(id=>!(SW.gills.find(g=>g.id===id)||{}).alive);
T.neg('GILLS.isDry refuses a breathing gill',aliveBurn,
 dryIds.concat([(SW.gills.find(g=>g.alive)||{}).id]),dryIds);

// ---- the flame: a metre tall at the throats (section 11 item 4)
const tall=cs=>cs.every(c=>c.h>=.4&&c.h<=1.6);
T.ok('every flame stands between 0.4 and 1.6 m (tallest '+Math.max(...C.map(c=>c.h)).toFixed(2)+' m)',tall(C),C.length+' candles');
T.neg('a flame of 4 m is caught',tall,C.concat([{h:4}]),C);
const crust=cs=>cs.every(c=>c.crust>=1.4&&c.crust<=4.2&&c.crust>c.r);
T.ok('every candle carries a black heat crust wider than its flame',crust(C),'crust 1.4 to 4.2 m');
T.neg('a crust narrower than its flame is caught',crust,[{r:2,crust:1.5}],[{r:.2,crust:1.5}]);

// ---- on the ground, and deterministic
const seated=cs=>cs.every(c=>Math.abs(c.y-ground(c.x,c.z))<1e-9);
T.ok('every candle sits on the host\'s ground',seated(C),C.length+' candles seated');
T.neg('a candle a metre off the ground is caught',seated,C.concat([{x:0,z:0,y:ground(0,0)+1}]),C);
const same=JSON.stringify(G.candles(SW,OPT))===JSON.stringify(C);
const other=JSON.stringify(G.candles(SW,Object.assign({},OPT,{seed:0x7777})))!==JSON.stringify(C);
T.ok('the candles are deterministic from their seed, and a different seed moves them',same&&other,
 same?'the same seed repeats':'THE SAME SEED DIFFERED');
const uniq=cs=>new Set(cs.map(c=>c.id)).size===cs.length;
T.ok('every candle has its own stable id',uniq(C)&&C.every(c=>/^gill\d+\.candle\.\d+$/.test(c.id)),C.length+' ids');
T.neg('two candles with one id are caught',uniq,[{id:'a'},{id:'a'}],[{id:'a'},{id:'b'}]);

// ---- the sites: published data, the Monks in the silent field and not among the flames
T.ok('the site record names the field, the hermitage, the stop, the gas-house and the hearths',
 SITE.format==='gills-field-site'&&!!SITE.hermitage&&!!SITE.caravanStop&&!!SITE.gasHouse&&SITE.hearths.length>0,
 SITE.hearths.length+' hearths, '+SITE.candleGills.length+' candle gills, '+SITE.pipeFieldGills.length+' silent');
const apart=S=>S.candleGills.every(id=>S.pipeFieldGills.indexOf(id)<0);
T.ok('a gill is either a candle gill or a silent pipe field, never both',apart(SITE),'disjoint');
T.neg('a gill in both lists is caught',apart,{candleGills:['gill1'],pipeFieldGills:['gill1']},
 {candleGills:['gill1'],pipeFieldGills:['gill2']});
const quiet=S=>S.candleGills.indexOf(S.field)<0;
T.ok('the Monks\' field is a silent one (they count rings, they do not camp in the flames)',quiet(SITE),'field '+SITE.field);
T.neg('a hermitage sited on a burning gill is caught',quiet,
 {field:'gill1',candleGills:['gill1']},{field:'gill1',candleGills:['gill2']});
const cutBore=S=>{const p=LIFE.pipes.find(q=>q.id===S.hermitage.pipe);return !!p&&(p.state==='fallen'||p.state==='broken'||p.state==='standing')&&p.gill===S.field;};
T.ok('the cells are cut into a pipe of that field, so the ring count stands in its bore',cutBore(SITE),'pipe '+SITE.hermitage.pipe);
T.neg('a hermitage cut into a pipe of another gill is caught',cutBore,
 {field:'gill0',hermitage:{pipe:LIFE.pipes.find(p=>p.gill!=='gill0').id}},{field:SITE.field,hermitage:{pipe:SITE.hermitage.pipe}});
const throat=S=>S.candleGills.indexOf(S.gasHouse.throat)>=0;
T.ok('the Geomancers cap a dry throat (the gas they work is the dry, strong one)',throat(SITE),'throat '+SITE.gasHouse.throat);
T.neg('a gas-house on a gill that does not burn is caught',throat,
 {gasHouse:{throat:'gill9'},candleGills:['gill1']},{gasHouse:{throat:'gill1'},candleGills:['gill1']});

// ---- the Monks' number is the region's, not the kit's (PLAN.md section 9 says two or three; the Catch bowl's record says fifteen)
T.ok('the hermitage keeps two cells and takes its number of Monks from the host ('+SITE.hermitage.monks+' by default)',
 SITE.hermitage.cells===2&&SITE.hermitage.monks===3&&G.sites(SW,LIFE,Object.assign({},OPT,{monks:15})).hermitage.monks===15,
 'cells 2, monks 3 by the plan, 15 when the region says so');
T.ok('every published site sits on the host\'s ground',
 [SITE.hermitage,SITE.caravanStop,SITE.gasHouse].concat(SITE.hearths).every(s=>Math.abs(s.y-+ground(s.x,s.z).toFixed(2))<.02),
 'hermitage, stop, gas-house and hearths seated');
T.ok('GILLS.candles refuses a swarm with no ground function',
 (()=>{try{G.candles(SW,{seed:1});return false;}catch(e){return /o\.ground/.test(e.message);}})(),'it throws');
// ---- the keep-clear between pipes (PLAN.md section 13, core/space): nothing grows into its neighbour, and a fallen pipe lies clear
const footOf=p=>{if(p.state!=='fallen')return [p.x,p.z,p.r];
 const d=p.toward,l=Math.hypot(d[0],d[1])||1;return [p.x+d[0]/l*p.H/2,p.z+d[1]/l*p.H/2,p.H/2+p.r];};
const noOverlap=P=>{const F=P.map(footOf);
 for(let i=0;i<F.length;i++)for(let j=i+1;j<F.length;j++)
  if(Math.hypot(F[i][0]-F[j][0],F[i][1]-F[j][1])<F[i][2]+F[j][2])return false;
 return true;};
T.ok('no pipe grows into another, and no fallen pipe lies through one ('+LIFE.pipes.length+' pipes, '+LIFE.pipes.filter(p=>p.state==='fallen').length+' fallen)',
 noOverlap(LIFE.pipes),'every footprint clear');
T.neg('two pipes in the same place are caught',noOverlap,
 [{state:'standing',x:0,z:0,r:4},{state:'standing',x:1,z:0,r:4}],
 [{state:'standing',x:0,z:0,r:4},{state:'standing',x:40,z:0,r:4}]);
// a bearing, not a place: the pipes of one gill must not all lean the same way
const bearings=g=>{const B=LIFE.pipes.filter(p=>p.gill===g).map(p=>Math.round(Math.atan2(p.toward[1],p.toward[0])*100)/100);
 return new Set(B).size;};
const gid=LIFE.pipes[0].gill;
T.ok('the pipes of a gill lean on their own bearings, not one shared heading ('+bearings(gid)+' distinct on '+gid+')',bearings(gid)>3,'varied');
T.done();
