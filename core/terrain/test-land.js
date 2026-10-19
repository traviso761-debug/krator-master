// node core/terrain/test-land.js [--write] — KLAND's contract (core/terrain/40-core-land.js), each check with a negative,
// and its golden: the land sampled on openworld/little-demo/data (the region the rule was written on) must match
// golden-land.json to a micrometre. --write rewrites the golden (only after a change that is MEANT to move the land;
// openworld/little-demo's page moves with it). Needs no browser and no npm: node-png.js reads the rasters.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'40-core-land.js'),'utf8'));
const {readRegion}=require('./node-png.js');
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};

// ---------------------------------------------------------------- a synthetic region: a plateau at 1,000 m north, a floor at 0 m south
// 12 x 12 height cells (4 km), the map at twice that; a scarp band marked across the middle rows; one channel down the
// middle column; two overlays (a desert west, a jungle east) and the sea in the last column
function synth(scarp){const nx=12,ny=12,MW=24,MH=24,n=nx*ny,m=MW*MH;
 const R={elev:new Float32Array(n),wlev:new Float32Array(n),whas:new Uint8Array(n),wflag:new Uint8Array(n),scarpL:new Float32Array(n),scarpU:new Float32Array(n),scarpW:new Float32Array(n),
  clim:new Uint8Array(m),rain:new Uint8Array(m).fill(60),temp:new Uint8Array(m).fill(110),biome:new Uint8Array(m),mask:new Uint8Array(m).fill(255)};
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i,t=Math.min(1,Math.max(0,(j-3)/5));R.elev[k]=1000*(1-t);
  R.scarpL[k]=0;R.scarpU[k]=1000;R.scarpW[k]=scarp&&j>=4&&j<=7?255:0;
  if(i===nx-1){R.whas[k]=1;R.wflag[k]=1;R.wlev[k]=-20;R.elev[k]=-60;}else R.wlev[k]=-2600;}
 for(let j=0;j<MH;j++)for(let i=0;i<MW;i++)R.biome[j*MW+i]=i>=MW-2?2:i<MW/2?0:1;
 const meta={frame:{origin_px:[100,100],box_px:[88,88,111,111],size_px:[MW,MH]},heights:{grid:[nx,ny],origin_cell:[44,44],su:.5,sv:.5,lo:-2600,hi:17100},
  rain:{scale_mm:4000/255},temp:{offset:-90},pressure:{atm0:1.6,scale_m:8000},classes:[],
  biomes:[{id:0,name:'sedesert'},{id:1,name:'hyperjungle'},{id:2,name:'Ring Sea'}],
  drainage:{min_accum:3e4,lines:[[[0,-20000,6e4,1000],[0,-12000,9e4,800],[0,-4000,2e5,300],[0,4000,4e5,0]]]},rivers:[]};
 return {meta,R};}
const S=synth(true),L=KLAND.create(S.meta,S.R),Ln=KLAND.create(synth(false).meta,synth(false).R);
ok('the base follows the cells (the plateau north, the floor south)',Math.abs(L.baseH(-10000,-24000)-1000)<1&&Math.abs(L.baseH(-10000,22000))<1,Math.abs(L.baseH(-10000,-24000))<1);
// the escarpment rule gathers the 20 km ramp into a cliff: on the band the plateau stays near 1,000 m and the floor near 0
const ramp=L.H(-16000,-2000,2000),rampN=Ln.H(-16000,-2000,2000);
ok('the scarp sharpens the rise (the point on the ramp is pulled to a level, not left half way)',Math.abs(ramp-500)>150&&Math.abs(rampN-500)<200,Math.abs(ramp-500)<150);
// the channel: the ground at its line is lower than beside it (the carve), and the cut has a width
// (the channels are carved in warped space, so the bed lies within a few hundred metres of the line, not on it)
const CH={};let at=1e9,ax=0;for(let x=-500;x<=500;x+=10){const h=L.H(x,-6000,0);if(h<at){at=h;ax=x;}}
const beside=L.H(1300,-6000,0);L.carveAt(ax,-6000,L.H(ax,-6000,500),.5,CH);
ok('a channel carves its bed (the lowest ground within 500 m of its line is well under the ground 1.3 km off) and reports its cut',at<beside-8&&CH.k>0&&CH.hw>0,CH.k<=0);
// minWave: coarser asks leave out the finer terms, and the coarsest is the base plus the hills only
const fine=L.H(-7000,13000,0),mid=L.H(-7000,13000,500),coarse=L.H(-7000,13000,5000);
ok('minWave leaves out detail (three different answers, the coarse one within 50 m of the base)',fine!==mid&&mid!==coarse&&Math.abs(coarse-L.baseH(-7000,13000))<60,fine===coarse);
// the styles blend across the overlay border: a desert point and a jungle point read their own tables
const sd=L.styleAt(-20000,10000).terr,sj=L.styleAt(14000,10000).terr;
ok('the style follows the overlay (desert terraces west, none east)',Math.abs(sd-.75)<.02&&sj<.02,sd===sj);
ok('an overlay not in the table takes desert; a listed one its own; sw bay is jungle',KLAND.BIOME_STYLE['sw bay']==='jungle'&&L.SID[0]==='desert'&&L.SID[1]==='jungle'&&L.SID[2]==='sea',L.SID[1]==='desert');
ok('the sea: lakeWater gives the level over its cells and -1e9 inland',Math.abs(L.lakeWater(22000,0)+20)<.01&&L.lakeWater(-20000,0)<-1e8,L.lakeWater(-20000,0)>-1e8);
ok('a world\'s own style table is taken',KLAND.create(S.meta,S.R,{biomeStyle:{'sedesert':'jungle'}}).SID[0]==='jungle',false);
ok('deterministic: a second instance gives the same land',KLAND.create(S.meta,S.R).H(-7000,13000,0)===fine,false);
ok('the frame: px <-> m',L.px(2000)===101&&L.fromPx(100,101)[1]===2000,false);

// ---------------------------------------------------------------- the golden: little-demo's region
const DATA=path.join(__dirname,'..','..','openworld','little-demo','data'),G=path.join(__dirname,'golden-land.json');
if(fs.existsSync(path.join(DATA,'elev.png'))&&fs.statSync(path.join(DATA,'elev.png')).size>200){
 const {meta,R}=readRegion(DATA),W=KLAND.create(meta,R),B=W.box();
 let s=12345;const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
 const P=[];for(let i=0;i<300;i++)P.push([B[0]+(B[2]-B[0])*rnd(),B[1]+(B[3]-B[1])*rnd()]);
 for(const l of meta.drainage.lines.slice(0,8)){const v=l[Math.floor(l.length/2)];for(let k=0;k<15;k++)P.push([v[0]+(rnd()-.5)*3000,v[1]+(rnd()-.5)*3000]);}
 const rows=P.map(([x,z])=>{const Q={},h=W.H(x,z,0,Q);return [Math.round(x),Math.round(z),h,W.H(x,z,40),W.H(x,z,300),W.H(x,z,2000),W.lakeWater(x,z),W.riverWater(x,z),Q.base,Q.rel,Q.cd,Q.cut,Q.hills,Q.wallK];});
 const lines=W.riverLines(200).map(r=>[r.name,r.width,r.pts.length].concat(r.pts[0],r.pts[r.pts.length-1]));
 const cur={source:'openworld/little-demo/data',channels:W.channelCount,segments:W.segmentCount,rows,lines};
 if(process.argv.includes('--write')){fs.writeFileSync(G,JSON.stringify(cur));console.log('wrote '+path.relative(process.cwd(),G)+' ('+rows.length+' points)');}
 else if(!fs.existsSync(G)){console.log('skip  golden (no golden-land.json: run with --write)');}
 else{const g=JSON.parse(fs.readFileSync(G,'utf8'));let n=0,diff=0,worst=0;
  const cmp=(a,b)=>{if(typeof a==='number'){n++;const d=Math.abs(a-b);if(!(d<=1e-6)){diff++;if(d>worst)worst=d;}}else if(Array.isArray(a))a.forEach((v,i)=>cmp(v,b&&b[i]));
   else if(a&&typeof a==='object'){for(const k in a)cmp(a[k],b&&b[k]);}else if(a!==b){n++;diff++;}};
  cmp(cur,g);
  ok('golden: little-demo\'s land unchanged ('+n+' numbers, '+rows.length+' points)',diff===0,false);
  if(diff)console.log('      '+diff+' differ, worst '+worst+' m. If the land was MEANT to move: --write, then rebuild openworld/little-demo and its baseline row');}}
else console.log('skip  golden (openworld/little-demo/data rasters are not here)');
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
