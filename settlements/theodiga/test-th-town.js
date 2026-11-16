/* node settlements/theodiga/test-th-town.js: Theodiga's town (src/40-th-town.js) on core/city, with the scrap Xanadu set's boxes
   (the kit's defs, kits/xanadu/src/87u-xs-build.js and 87v-xs-poor.js, when this checkout has them; else scrap-dims.json, a
   copy of them until the set is on main): no two buildings overlap, none stands on a street, in Gate Square, the Warden's
   House, a road head or off the rim's plateau; every quarter holds about PLAN.md's people and the town about 4,100; the farms
   stand beyond the kora with their fields; the layout reruns the same. Each check with a negative (tools/ktest.js). */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host/.test(f)).sort().forEach(f=>load('core/city/'+f));
['kits/crops/src/10-crop-core.js','kits/crops/src/20-crop-records.js','kits/crops/src/40-crop-query.js','settlements/theodiga/src/40-th-town.js'].forEach(load);
/* the kit's boxes, from its defs (XA.def({key, ..., w, d, h, ...})), or the copy */
const DIMS={};let from='the kit';
for(const f of ['kits/xanadu/src/87u-xs-build.js','kits/xanadu/src/87v-xs-poor.js']){const p=path.join(ROOT,f);if(!fs.existsSync(p))continue;
 for(const m of fs.readFileSync(p,'utf8').matchAll(/XA\.def\(\{key:'(xa_scrap_[a-z_]+)'.*?,w:([\d.]+),d:([\d.]+),h:([\d.]+)/g))DIMS[m[1]]={w:+m[2],d:+m[3],h:+m[4]};}
if(!Object.keys(DIMS).length){Object.assign(DIMS,JSON.parse(fs.readFileSync(path.join(__dirname,'scrap-dims.json'),'utf8')).dims);from='scrap-dims.json';}
const dims=(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h}:null;
const make=seed=>TH_TOWN.make({dims,seed});
const TOWN=make();
module.exports={TOWN,DIMS};
if(require.main!==module)return;
console.log('boxes from '+from+'; census '+JSON.stringify(TOWN.census));
/* the checks, each a function of a town's records (so a broken copy can be fed to it) */
const box=L=>{const c=Math.cos(L.ry),s=Math.sin(L.ry);return {c:[L.x,L.z],u:[c,-s],v:[s,c],hw:L.w/2,hd:L.d/2};};
const corners=o=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[o.c[0]+a*o.hw*o.u[0]+b*o.hd*o.v[0],o.c[1]+a*o.hw*o.u[1]+b*o.hd*o.v[1]]);
const pen=(A,B)=>{let m=1e9;for(const ax of [A.u,A.v,B.u,B.v]){const pr=F=>Math.abs(F.u[0]*ax[0]+F.u[1]*ax[1])*F.hw+Math.abs(F.v[0]*ax[0]+F.v[1]*ax[1])*F.hd;
 const d=Math.abs((A.c[0]-B.c[0])*ax[0]+(A.c[1]-B.c[1])*ax[1]);m=Math.min(m,pr(A)+pr(B)-d);}return m;};
const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const inside=(p,K)=>{let c=false;for(let i=0,j=3;i<4;j=i++){const a=K[i],b=K[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const Z=TH_TOWN.ZONE,K=TH_TOWN.KORA,inBox=(p,Q,m)=>p[0]>Q.x0-m&&p[0]<Q.x1+m&&p[1]>Q.z0-m&&p[1]<Q.z1+m;
const WANT={square:500,bazaar:500,gate:280,salvage:1250,farmers:950,poor:550,farms:130};
const CHECKS={
 'no two buildings overlap':X=>{let n=0;const B=X.lots.map(box);for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++)if(Math.hypot(B[i].c[0]-B[j].c[0],B[i].c[1]-B[j].c[1])<70&&pen(B[i],B[j])>.3)n++;return [n===0,n+' pairs'];},
 'no building on a street':X=>{let n=0;for(const L of X.lots){const Q=corners(box(L));for(const w of X.ways){
   for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];if(Math.min(...Q.map(p=>segD(p,a,b)))<w.w/2-.6||inside(a,Q)){n++;break;}}}}return [n===0,n+' on a street'];},
 'none in Gate Square, the Warden\'s House, a road head or off the plateau':X=>{let n=0;for(const L of X.lots){const Q=corners(box(L));
   if(Q.some(p=>p[0]<Z.x0||p[0]>Z.x1||Math.abs(p[1])>Z.z1||inBox(p,TH_TOWN.SQUARE,2)||inBox(p,TH_TOWN.WARDEN,2)||TH_TOWN.HEADS.some(H=>Math.hypot(p[0]-H.x,p[1]-H.z)<H.r)))n++;}return [n===0,n+' misplaced'];},
 'every quarter holds about PLAN.md\'s people, the town about 4,100':X=>{const by={};let t=0;for(const q of TH_TOWN.QUARTERS)by[q]=0;for(const L of X.lots){by[L.quarter]+=L.people;t+=L.people;}
   const good=TH_TOWN.QUARTERS.every(q=>Math.abs(by[q]-WANT[q])<=WANT[q]*.35)&&t>3700&&t<4500;return [good,TH_TOWN.QUARTERS.map(q=>q+' '+by[q]).join(', ')+' = '+t];},
 'the farms stand beyond the kora, each with its fields':X=>{const farms=X.lots.filter(L=>L.key==='xa_scrap_farm');const bad=farms.filter(L=>L.x<K.x1).length;
   const fed=new Set(X.fields.map(f=>f.farm));return [farms.length>=8&&bad===0&&fed.size>=farms.length*.6,farms.length+' farms, '+bad+' inside the kora, '+fed.size+' with fields'];},
 'the town has its civic buildings: the serai, the gate, the salvagers\' guildhall, the bath, two granaries, the kora\'s shrines':X=>{const n=k=>X.lots.filter(L=>L.civic&&L.key===k).length;
   const good=n('xa_scrap_serai')===1&&n('xa_scrap_gate')===1&&n('xa_scrap_guild_salvage')===1&&n('xa_scrap_bath')===1&&n('xa_scrap_granary')===2&&n('xa_scrap_shrine')>=4;
   return [good,['serai','gate','guild_salvage','bath','granary','shrine'].map(k=>k+' '+n('xa_scrap_'+k)).join(', ')];},
 'every lot is a key of the scrap set, its id unique':X=>{const ids=new Set(X.lots.map(L=>L.id));return [ids.size===X.lots.length&&X.lots.every(L=>DIMS[L.key]),X.lots.length+' lots'];}};
const hash=X=>{let h=2166136261;const s=JSON.stringify(X.lots.map(L=>[L.key,L.v,+L.x.toFixed(3),+L.z.toFixed(3),+L.ry.toFixed(4)]));for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;};
const clone=()=>JSON.parse(JSON.stringify(TOWN));
const fault=f=>{const X=clone();f(X);return X;};
const NEG={
 'no two buildings overlap':X=>{const L=Object.assign({},X.lots[5]);L.id='x';L.x+=1;X.lots.push(L);},
 'no building on a street':X=>{const w=X.ways[0],p=w.pts[Math.floor(w.pts.length/2)];X.lots[3].x=p[0];X.lots[3].z=p[1];},
 'none in Gate Square, the Warden\'s House, a road head or off the plateau':X=>{X.lots[2].x=392;X.lots[2].z=-30;},
 'every quarter holds about PLAN.md\'s people, the town about 4,100':X=>{X.lots=X.lots.filter(L=>L.quarter!=='salvage');},
 'the farms stand beyond the kora, each with its fields':X=>{X.lots.find(L=>L.key==='xa_scrap_farm').x=600;},
 'the town has its civic buildings: the serai, the gate, the salvagers\' guildhall, the bath, two granaries, the kora\'s shrines':X=>{X.lots=X.lots.filter(L=>L.key!=='xa_scrap_serai');},
 'every lot is a key of the scrap set, its id unique':X=>{X.lots[1].id=X.lots[0].id;}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](TOWN);T.ok(name+' ('+detail+')',pass,detail);T.neg('negative: '+name,X=>CHECKS[name](X)[0],fault(NEG[name]),clone());}
T.ok('the plateau\'s landmarks are records (Gate Square, the Warden\'s House, the two road heads)',TOWN.landmarks.length===4&&TOWN.landmarks.every(m=>/^th\.town\./.test(m.id)),TOWN.landmarks.length);
const T2=make();T.ok('the town reruns the same ('+hash(TOWN).toString(16)+')',hash(T2)===hash(TOWN));
T.neg('negative: another seed gives another town',X=>hash(X)===hash(TOWN),make(2208),T2);
/* --svg <file>: the plan (floors/town-layout.svg): fields, streets, buildings by quarter (civic black), the landmarks in red */
const at=process.argv.indexOf('--svg');
if(at>0){const col={square:'#c9a227',bazaar:'#d0643b',gate:'#8a4fb0',salvage:'#5c7f99',farmers:'#6f9a4a',poor:'#9a8a7a',farms:'#b8a050'};
 let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="330 -340 920 680" width="920" height="680" style="background:#efe8da">\n';
 for(const f of TOWN.fields)s+='<polygon points="'+f.corners.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')+'" fill="#cfdc9a" stroke="#8a9a5a" stroke-width=".5"/>\n';
 for(const w of TOWN.ways)s+='<polyline points="'+w.pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'" fill="none" stroke="'+(w.cls==='avenue'?'#7a6a55':w.cls==='main'?'#9a8a75':'#bbb0a0')+'" stroke-width="'+w.w+'" stroke-linejoin="round"/>\n';
 for(const L of TOWN.lots)s+='<polygon points="'+corners(box(L)).map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')+'" fill="'+(L.civic?'#222':col[L.quarter])+'" stroke="#333" stroke-width=".4"/>\n';
 for(const M of TOWN.landmarks)s+=(M.r?'<circle cx="'+M.x+'" cy="'+M.z+'" r="'+M.r+'"':'<rect x="'+M.x0+'" y="'+M.z0+'" width="'+(M.x1-M.x0)+'" height="'+(M.z1-M.z0)+'"')+' fill="'+(M.r?'none':'#e8d9a8')+'" stroke="#a33" stroke-width="2"/>\n';
 s+='<line x1="'+Z.x0+'" y1="-340" x2="'+Z.x0+'" y2="340" stroke="#a33" stroke-dasharray="6 4"/>\n</svg>\n';
 fs.writeFileSync(process.argv[at+1],s,'utf8');console.log('wrote '+process.argv[at+1]);}
T.done();
