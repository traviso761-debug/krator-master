// node settlements/strongbow/test-sb-town.js — Strongbow's town (src/40-sb-town.js) on core/city, with the scrap Xanadu set's
// boxes (the kit's defs, kits/xanadu/src/87u-xs-build.js and 87v-xs-poor.js, read here as a table): no two buildings overlap, none
// stands on a street, in the foot, the quarry or the scree; every ring holds people and the town's total is PLAN.md's (about
// 3,500); the farms stand beyond the rings with their fields; the layout reruns the same. Each check with a negative.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host/.test(f)).sort().forEach(f=>load('core/city/'+f));
['kits/ancients/targets/strongbow/8aw0-strongbow-plan.js','settlements/strongbow/src/20-sb-census.js','settlements/strongbow/src/30-sb-layout.js',
 'settlements/strongbow/src/31-sb-rules.js','kits/crops/src/10-crop-core.js','kits/crops/src/20-crop-records.js','kits/crops/src/40-crop-query.js','settlements/strongbow/src/40-sb-town.js'].forEach(load);
/* the kit's boxes, from its defs (XA.def({key, ..., w, d, h, ...})) */
const DIMS={};
for(const f of ['kits/xanadu/src/87u-xs-build.js','kits/xanadu/src/87v-xs-poor.js']){const s=fs.readFileSync(path.join(ROOT,f),'utf8');
 for(const m of s.matchAll(/XA\.def\(\{key:'(xa_scrap_[a-z_]+)'.*?,w:([\d.]+),d:([\d.]+),h:([\d.]+)/g))DIMS[m[1]]={w:+m[2],d:+m[3],h:+m[4]};}
const dims=(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h}:null;
const make=()=>SB_TOWN.make({layout:sbLayout(),plan:STRONGBOW.plan({seed:1647}),dims});
const T=make();
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
module.exports={T,DIMS};
if(require.main!==module)return;
console.log('census '+JSON.stringify(T.census));
/* the checks, each a function of a town's records (so a broken copy can be fed to it) */
const box=L=>{const c=Math.cos(L.ry),s=Math.sin(L.ry);return {c:[L.x,L.z],u:[c,-s],v:[s,c],hw:L.w/2,hd:L.d/2};};
const corners=o=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[o.c[0]+a*o.hw*o.u[0]+b*o.hd*o.v[0],o.c[1]+a*o.hw*o.u[1]+b*o.hd*o.v[1]]);
const pen=(A,B)=>{let m=1e9;for(const ax of [A.u,A.v,B.u,B.v]){const pr=F=>Math.abs(F.u[0]*ax[0]+F.u[1]*ax[1])*F.hw+Math.abs(F.v[0]*ax[0]+F.v[1]*ax[1])*F.hd;
 const d=Math.abs((A.c[0]-B.c[0])*ax[0]+(A.c[1]-B.c[1])*ax[1]);m=Math.min(m,pr(A)+pr(B)-d);}return m;};
const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const inside=(p,K)=>{let c=false;for(let i=0,j=3;i<4;j=i++){const a=K[i],b=K[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const HEAPS=STRONGBOW.ruin(STRONGBOW.plan({seed:1647})).heaps.filter(H=>H.y0<STRONGBOW.plan({seed:1647}).frame.FL+40);
const LY=sbLayout(),C=T.centre,quarry=LY.parts.filter(q=>/^sb\.quiver\.p\d/.test(q.id)).map(q=>q.shape),scree=LY.parts.find(p=>p.id==='sb.scree.w').shape;
const CHECKS={
 'no two buildings overlap':X=>{let n=0;const B=X.lots.map(box);for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++)if(Math.hypot(B[i].c[0]-B[j].c[0],B[i].c[1]-B[j].c[1])<60&&pen(B[i],B[j])>.3)n++;return [n===0,n+' pairs'];},
 'no building on a street':X=>{let n=0;for(const L of X.lots){const K=corners(box(L));for(const w of X.ways){
   for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];if(Math.min(...K.map(p=>segD(p,a,b)))<w.w/2-.6||inside(a,K)){n++;break;}}}}return [n===0,n+' on a street'];},
 'none in the foot, the quarry, the scree or on the face':X=>{let n=0;for(const L of X.lots){const r=Math.hypot(L.x-C[0],L.z-C[1]);
   if(r<196||L.z<30||quarry.some(q=>Math.hypot(L.x-q[1],L.z-q[2])<q[3]+4)||(L.x>scree[1]&&L.x<scree[2]&&L.z>scree[3]&&L.z<scree[4]))n++;}return [n===0,n+' misplaced'];},
 "every ring holds about PLAN.md's people (900, 1,400, 900, 300; the town about 3,500)":X=>{const by=[0,0,0,0];let t=0;for(const L of X.lots){by[L.ring]+=L.people;t+=L.people;}
   const want=[900,1400,900,300],good=by.every((b,i)=>Math.abs(b-want[i])<=want[i]*.3)&&t>3000&&t<4000;return [good,by.join(' / ')+' = '+t];},
 'the farms stand beyond the rings, each with its fields':X=>{const farms=X.lots.filter(L=>L.key==='xa_scrap_farm');const bad=farms.filter(L=>L.ring!==3).length;
   const fed=new Set(X.fields.map(f=>f.farm));return [farms.length>=10&&bad===0&&fed.size>=farms.length*.5,farms.length+' farms, '+bad+' inside the rings, '+fed.size+' with fields'];},
 'every lot is a key of the scrap set, its id unique':X=>{const ids=new Set(X.lots.map(L=>L.id));return [ids.size===X.lots.length&&X.lots.every(L=>DIMS[L.key]),X.lots.length+' lots'];},
 /* the owner, 2026-11-15: "make sure buildings are not clipping into ruin rubble piles": no corner, edge middle or centre of a lot
    inside a ground heap's footprint (STRONGBOW.ruin, KRUBBLE's frame) grown by 2 m */
 'none in the ruin\'s rubble heaps':X=>{let n=0;for(const L of X.lots){const B=box(L),pts=corners(B).concat([[L.x,L.z]]);for(let i=0;i<4;i++){const a=pts[i],b=pts[(i+1)%4];pts.push([(a[0]+b[0])/2,(a[1]+b[1])/2]);}
   if(HEAPS.some(H=>pts.some(p=>{const dx=p[0]-H.x,dz=p[1]-H.z,c=Math.cos(H.ry||0),s=Math.sin(H.ry||0),u=(dx*c+dz*s)/(H.rx+2),v=(-dx*s+dz*c)/(H.rz+2);return u*u+v*v<1;})))n++;}
   return [n===0,n+' in a heap, '+HEAPS.length+' heaps on the ground'];}};
const hash=X=>{let h=2166136261;const s=JSON.stringify(X.lots.map(L=>[L.key,L.v,+L.x.toFixed(3),+L.z.toFixed(3),+L.ry.toFixed(4)]));for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;};
const clone=()=>JSON.parse(JSON.stringify(T));
const NEG=[X=>{const L=Object.assign({},X.lots[5]);L.id='x';L.x+=1;X.lots.push(L);},
 X=>{const w=X.ways[0],p=w.pts[Math.floor(w.pts.length/2)];X.lots[3].x=p[0];X.lots[3].z=p[1];},
 X=>{X.lots[2].x=C[0];X.lots[2].z=C[1]+100;},
 X=>{X.lots=X.lots.filter(L=>L.ring!==0);},
 X=>{X.lots.find(L=>L.key==='xa_scrap_farm').ring=1;},
 X=>{X.lots[1].id=X.lots[0].id;},
 X=>{const H=HEAPS.find(q=>!/hall/.test(q.id));X.lots[4].x=H.x;X.lots[4].z=H.z;}];
Object.keys(CHECKS).forEach((name,i)=>{const [pass,detail]=CHECKS[name](T);ok(pass,name+' ('+detail+')');const X=clone();NEG[i](X);ok(!CHECKS[name](X)[0],'negative: '+name);});
const T2=make();ok(hash(T2)===hash(T),'the town reruns the same ('+hash(T).toString(16)+')');
const T3=SB_TOWN.make({layout:sbLayout(),plan:STRONGBOW.plan({seed:1647}),dims,seed:1648});ok(hash(T3)!==hash(T),'negative: another seed gives another town');
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
