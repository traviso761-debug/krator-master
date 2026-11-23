// node core/terrain/test-golden-stacks.js [--write] — KSTACKS' golden vectors (core/world/PLAN-RELIEF.md P15): every kind's
// record (mesa, butte with its shoulder, a mesa's columns, spire, fin, balanced, plates, mound, dome, tor, arch, pillar,
// every chimney form and state, tower), the layouts (row, cluster, mounds, pillars), the queries (at, surface, surface as
// drawn, foot, ledge, topAt, ring, wall, bore) at points round each body, and the meshes (every kind; a gridded top, more
// rings, an open bore, a fallen chimney, ice) with weather (37) and contour and archRound (37b), kept in golden-stacks.json,
// so core/terrain/kstacks.gd proves it gives the same rock (kstacks_test.gd, in Godot). Values to 1e-6, strings and
// integers exactly; a mesh by its counts, its KSTACKS.hash, its index sum and samples. --write takes a new snapshot. The
// negative: one value nudged by 1e-5 is caught.
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of [['..','rand','08-core-rand.js'],['37-core-stacks.js'],['37b-core-stacks-contour.js']])eval(fs.readFileSync(path.join(__dirname,...f),'utf8'));
const K=KSTACKS,TAU=Math.PI*2;
const r6=v=>typeof v==='number'?(isFinite(v)?Math.round(v*1e6)/1e6:(v>0?1e300:-1e300)):v;
// a value made plain: numbers to 1e-6, the infinities to +-1e300, functions dropped
function plain(v){if(typeof v==='number')return r6(v);if(Array.isArray(v)||ArrayBuffer.isView(v))return Array.from(v,plain);
 if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort()){if(typeof v[k]==='function'||v[k]===undefined||k[0]==='_')continue;o[k]=plain(v[k]);}return o;}return v;}
const gr=(x,z)=>3+.02*x+4*KRAND.vnoise(x/40,z/40,.5,5);
const strata=(x,y,z)=>{const k=Math.floor(y/7);return {h:4+3*KRAND.unit(KRAND.hash(9,k)),hard:KRAND.unit(KRAND.hash(9,k,1))};};
const SPECS=[
 {id:'mesa',kind:'mesa',x:10,z:-20,y0:0,seed:101,tiers:[{h:120,r:150,e:1.3,ry:.3},{h:60,r:70,e:1.1,dx:10,dz:-5}],lobes:.16,weather:.6},
 {id:'butte',kind:'butte',x:0,z:0,y0:5,seed:102,lobes:.18,weather:.8,tiers:[{h:100,r:120,e:1.4,ry:1}],shoulder:{h:15,back:12,bed:[3,6]}},
 {id:'flow',kind:'mesa',x:0,z:0,y0:0,seed:103,tiers:[{h:40,r:80}],columns:{w:[1.2,2.4]}},
 {id:'spire',kind:'spire',x:5,z:5,y0:0,seed:104,H:60,r:12},
 {id:'fin',kind:'fin',x:0,z:0,y0:0,seed:105,H:40,r:10},
 {id:'bal',kind:'balanced',x:0,z:0,y0:0,seed:106,H:20,r:5},
 {id:'plates',kind:'spire',x:0,z:0,y0:0,seed:107,H:50,r:20,plates:[3,8]},
 {id:'mound',kind:'mound',x:3,z:4,H:8,seed:108,ground:gr},
 {id:'mound2',kind:'mound',x:0,z:0,H:6,y0:2,seed:109,spires:4,soil:[.5,.4,.3]},
 {id:'dome',kind:'dome',x:10,z:-5,H:60,seed:110,ground:gr},
 {id:'pagoda',kind:'dome',x:0,z:0,H:50,seed:111,y0:0,pagoda:.8,strata},
 {id:'tor',kind:'tor',x:0,z:0,H:8,seed:112,ground:gr,logan:true},
 {id:'arch',kind:'arch',x:0,z:0,span:14,seed:113,ground:gr},
 {id:'pillar',kind:'pillar',x:0,z:0,H:120,w:30,l:24,seed:114,ground:gr,strata},
 {id:'pipe',kind:'chimney',x:0,z:0,seed:115,ground:gr,ledges:[.3,.6]},
 {id:'bell',kind:'chimney',form:'bell',x:0,z:0,seed:116,y0:0,ice:{from:.3}},
 {id:'stalk',kind:'chimney',form:'stalk',x:0,z:0,seed:117,y0:0},
 {id:'siphon',kind:'chimney',form:'siphon',mouths:3,x:0,z:0,seed:118,y0:0},
 {id:'rubble',kind:'chimney',state:'rubble',x:0,z:0,seed:119,ground:gr},
 {id:'fallen',kind:'chimney',state:'fallen',toward:[1,.5],x:0,z:0,seed:120,ground:gr}];
function bodies(){const B=SPECS.map(o=>K.make(o));
 B.push(K.tower({id:'tower',seed:121,x:0,z:0,H:100,R:40,y0:0}));
 B.push(K.tower({id:'tower2',seed:122,x:0,z:0,H:80,R:30,foot:(x,z,r)=>gr(x,z)-1-r*.01}));
 return B;}
// the points a body is asked at: 24 round it, out to 1.1 of its radius
function points(B){const P=[];for(let k=0;k<24;k++){const a=k*TAU/24+.1,f=((k%4)+.5)/4*1.1;P.push([B.x+Math.cos(a)*B.R*f,B.z+Math.sin(a)*B.R*f]);}return P;}
const atRec=a=>a?[a.S.id,a.b.k,a.top,a.d]:null;
function queries(B){const L=[B];return points(B).map(([x,z])=>{const s=K.surface(L,x,z),sd=K.surface(L,x,z,null,{drawn:true}),f=K.foot(L,x,z),l=K.ledge(L,x,z);
 return [x,z,atRec(K.at(L,x,z)),s?[s.S.id,s.b.k,s.top,s.d,s.wall,s.steep]:null,sd?[sd.S.id,sd.b.k,sd.top,sd.d,sd.wall,sd.steep]:null,f?[f.S.id,f.d]:null,l?[l.S.id,l.b.k,l.w,l.out]:null,K.topAt(L,x,z)];});}
function meshSum(m){const s=(A,k)=>{const o=[],st=Math.max(1,Math.ceil(A.length/60))+k;for(let i=0;i<A.length;i+=st)o.push(A[i]);return o;};let isum=0;for(let i=0;i<m.idx.length;i++)isum+=m.idx[i];
 const r={n:[m.pos.length,m.uv.length,m.idx.length,m.part.length,m.bed.length,m.occ.length],hash:K.hash(m),isum,idx:s(m.idx,29),pos:s(m.pos,37),uv:s(m.uv,41),
  part:Array.from(m.part).reduce((a,v)=>a+v,0),bed:Array.from(m.bed).reduce((a,v)=>a+v,0),occ:s(m.occ,31)};if(m.ice)r.ice=s(m.ice,23);return r;}
function snapshot(){const G={},B=bodies(),by={};B.forEach(b=>by[b.id]=b);
 G.kinds=K.kinds();
 G.records=B;
 G.queries={};B.forEach(b=>G.queries[b.id]=queries(b));
 G.rings={};B.forEach(b=>{G.rings[b.id]=K.ring(b,(b.y0+b.top)/2,24);});
 G.walls={};B.forEach(b=>{const bb=b.beds[Math.floor(b.beds.length/2)];G.walls[b.id]=[0,.3,.5,.9].map(u=>K.wall(b,bb,u*5.1,u));});
 G.bores={};B.filter(b=>b.kind==='chimney').forEach(b=>G.bores[b.id]=K.bore(b,{depth:12}));
 G.meshes={};B.forEach(b=>G.meshes[b.id]=meshSum(K.mesh(b)));
 G.meshes['mesa:grid']=meshSum(K.mesh(by.mesa,{top:{grid:5}}));
 G.meshes['butte:grid-cull']=meshSum(K.mesh(by.butte,{step:7,segMax:600,top:{grid:6,cull:false}}));
 G.meshes['mesa:rings']=meshSum(K.mesh(by.mesa,{step:7,topRings:9,segMax:300}));
 G.meshes['pipe:open']=meshSum(K.mesh(by.pipe,{bore:'open'}));
 G.meshes['flow:columns']=meshSum(K.mesh(by.flow,{perColumn:3,colMax:900}));
 G.meshes['mound:flutes']=meshSum(K.mesh(by.mound,{perFlute:4}));
 G.meshes['arch:weather']=meshSum(K.weather(by.arch,K.mesh(by.arch),{ground:gr}));
 G.meshes['mesa:weather']=meshSum(K.weather(by.butte,K.mesh(by.butte),{amp:1.5,pit:.4,seed:5}));
 G.meshes['pillar:contour']=meshSum(K.contour(by.pillar,K.mesh(by.pillar)));
 G.meshes['pillar:contour-keep']=meshSum(K.contour(by.pillar,K.mesh(by.pillar),{keep:10,cleft:false,joints:[2,3]}));
 G.meshes['arch:round']=meshSum(K.weather(by.arch,K.archRound(by.arch,K.mesh(by.arch),{band:.5}),{ground:gr}));
 // the layouts
 G.row=K.row({id:'row',seed:130,n:5,a:[0,0],b:[200,50],H:[20,40],r:[6,10],ground:gr,taper:[.2,.4],plates:[3,6],platesShare:.5,lift:(x,z,r)=>r*.1});
 G.cluster=K.cluster({id:'cl',seed:131,n:8,c:[0,0],rad:80,r:[5,10],H:[15,40],ground:gr,accept:(x,z)=>x>-70,lean:[0,.05]});
 G.mounds=K.mounds({x0:0,z0:0,x1:120,z1:120,cell:40,world:7,ground:gr,p:.4,per:2}).map(M=>[M.id,M.x,M.z,M.top,M.R,M.beds.length,M.clay]);
 const blocks=[];for(let j=0;j<3;j++)for(let i=0;i<4;i++)blocks.push({id:'b'+i+'-'+j,i,j,cx:i*60,cz:j*55,w:40+5*i,l:30+4*j,ry:.1*i});
 G.pillars=K.pillars({id:'pr',blocks,zone:(x,z)=>.2+x/250,top:(x,z)=>140+.1*z,ground:gr,world:9,strata,minW:8});
 G.layoutMesh=meshSum(K.mesh(G.row[2]));
 return plain(G);}
const file=path.join(__dirname,'golden-stacks.json'),G=snapshot();
if(process.argv.includes('--write')){fs.writeFileSync(file,JSON.stringify(G)+'\n');console.log('wrote '+file+' ('+Math.round(fs.statSync(file).size/1024)+' KB)');process.exit(0);}
const GOLD=JSON.parse(fs.readFileSync(file,'utf8'));
function diff(a,b,at){if(typeof a==='number'&&typeof b==='number')return Math.abs(a-b)<=1e-6?null:at+': '+a+' against '+b;
 if(Array.isArray(a)&&Array.isArray(b)){if(a.length!==b.length)return at+': '+a.length+' values against '+b.length;for(let i=0;i<a.length;i++){const d=diff(a[i],b[i],at+'['+i+']');if(d)return d;}return null;}
 if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const d=diff(a[k],b[k],at+'.'+k);if(d)return d;}return null;}
 return a===b?null:at+': '+JSON.stringify(a)+' against '+JSON.stringify(b);}
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
for(const k of Object.keys(GOLD)){const d=diff(G[k],GOLD[k],k);ok(k+(d?': '+d:': as the golden'),!d,false);}
{const N=JSON.parse(JSON.stringify(G));N.records[3].beds[1].rx+=1e-5;ok('negative: a value nudged by 1e-5 is caught',diff(N,GOLD,'')!==null,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
