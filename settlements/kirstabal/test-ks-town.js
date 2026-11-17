// node settlements/kirstabal/test-ks-town.js — Kirstabal's town (src/41-ks-town.js) on core/city and its ring and lake villages
// (src/42-ks-ring.js) on core/hamlet, with the Xanadu kit's boxes (its defs in kits/xanadu/src, read here as a table): no two
// buildings overlap, none stands on a street or in the lake but the harbour's own, the town holds PLAN.md's 3,000, the
// landmarks and the harbour stand, the bridge spans Keb Riwa, the ring's villages are the tune's (XAN_TUNE.ksRing) and lay out
// on dry ground, the layout reruns the same. Each check with a negative (tools/ktest.js).
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require(path.join(ROOT,'tools','ktest.js'))(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host|squares|radial|covered/.test(f)).sort().forEach(f=>load('core/city/'+f));
fs.readdirSync(path.join(ROOT,'core','hamlet')).filter(f=>/^(10|12|14|16|18|20|30)-hamlet-.*\.js$/.test(f)).sort().forEach(f=>load('core/hamlet/'+f));
/* the page's KCITY.lib (settlements/kirstabal/build.py's bundle names the same things from inside its closure) */
KCITY.lib={SL,plan:()=>PLAN,tune:()=>TUNE,KSPACE,Raster,OCC,obb,obbCorners,segDist,polySegDist,resample,clamp,inPoly,cg:()=>CG};
['settlements/kirstabal/src/39k-ks-model.js','settlements/kirstabal/src/40-ks-ground.js','settlements/kirstabal/src/41-ks-town.js'].forEach(load);
if(fs.existsSync(path.join(__dirname,'src','42-ks-ring.js')))load('settlements/kirstabal/src/42-ks-ring.js');
/* the kit's boxes, from its defs (XA.def({key, ..., w, d, h, fw, fd, ...})) */
const DIMS={};
for(const f of fs.readdirSync(path.join(ROOT,'kits','xanadu','src')).filter(f=>/\.js$/.test(f))){const s=fs.readFileSync(path.join(ROOT,'kits','xanadu','src',f),'utf8');
 for(const m of s.matchAll(/key:'(xa_[a-z0-9_]+)'/g)){const seg=s.slice(m.index,m.index+900),g=k=>{const q=seg.match(new RegExp('[,{]'+k+':([0-9.]+)'));return q?+q[1]:null;};
  if(!DIMS[m[1]]&&g('w'))DIMS[m[1]]={w:g('w'),d:g('d'),h:g('h')||8,fw:g('fw')||g('w'),fd:g('fd')||g('d')};}}
const dims=(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h,fw:DIMS[k].fw,fd:DIMS[k].fd}:null;
const t0=Date.now(),K=KS_TOWN.make({dims}),ms=Date.now()-t0;
module.exports={K,DIMS,dims};
if(require.main!==module)return;
console.log('the town in '+ms+' ms: '+JSON.stringify(K.census.byCls)+'; '+K.census.buildings+' buildings, '+K.census.people+' people; '+K.ways.length+' ways');
/* the checks, each a function of the records (so a broken copy can be fed to it) */
/* a building's own footprint (fw x fd: what is drawn, not its plot's yard) */
const box=L=>{const c=Math.cos(L.ry),s=Math.sin(L.ry);return {c:[L.x,L.z],u:[c,-s],v:[s,c],hw:(L.fw||L.w)/2,hd:(L.fd||L.d)/2};};
const corners=o=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[o.c[0]+a*o.hw*o.u[0]+b*o.hd*o.v[0],o.c[1]+a*o.hw*o.u[1]+b*o.hd*o.v[1]]);
const pen=(A,B)=>{let m=1e9;for(const ax of [A.u,A.v,B.u,B.v]){const pr=F=>Math.abs(F.u[0]*ax[0]+F.u[1]*ax[1])*F.hw+Math.abs(F.v[0]*ax[0]+F.v[1]*ax[1])*F.hd;
 const d=Math.abs((A.c[0]-B.c[0])*ax[0]+(A.c[1]-B.c[1])*ax[1]);m=Math.min(m,pr(A)+pr(B)-d);}return m;};
const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
const RUNS=new Set(['quay','mole','wall','bridge']);   /* the pieces laid end to end in a run touch by design */
const overlaps=X=>{const all=X.lots.concat(X.extra),B=all.map(box),out=[];
 for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){if(Math.hypot(B[i].c[0]-B[j].c[0],B[i].c[1]-B[j].c[1])>90)continue;
  if(RUNS.has(all[i].kind)&&all[i].kind===all[j].kind)continue;if(pen(B[i],B[j])>.3)out.push(all[i].id+'|'+all[j].id);}return out;};
/* a street reaches a building when any point of its line (core/city resamples every 2 m) comes within half its carriageway
   (less 0.6 m) of the building's footprint */
const onStreet=X=>{const out=[];for(const L of X.lots){if(L.cls==='landmark')continue;const B=box(L);
 for(const w of X.ways){const m=w.w/2-.6;if(w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1];return Math.abs(dx*B.u[0]+dz*B.u[1])<B.hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<B.hd+m;})){out.push(L.id+'@'+w.id);break;}}}return out;};const WATERY=new Set(['quay','mole','lighthouse','boat','boatshed','bridge']);
const inLake=X=>X.lots.concat(X.extra).filter(L=>!WATERY.has(L.kind)&&KS_GROUND.h(L.x,L.z)<.8).map(L=>L.id);
{const o=overlaps(K);T.ok('no two buildings overlap (the lots, the harbour, the compound, the serai, the monastery, the bridge)',!o.length,o.length+' pairs'+(o.length?': '+o.slice(0,4).join(', '):''));
 const bad=Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[0],{id:'copy'})])});T.neg('a building set on another is caught',X=>!overlaps(X).length,bad,K);}
{const s=onStreet(K);T.ok('no building stands on a street',!s.length,s.length+' on a street'+(s.length?': '+s.slice(0,3).join(', '):''));
 const w=K.ways.find(w=>w.cls==='avenue'),p=w.pts[Math.floor(w.pts.length/2)],bad=Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots.find(l=>l.cls!=='landmark'),{id:'on-street',x:p[0],z:p[1]})])});
 T.neg('a house set on the quay street is caught',X=>!onStreet(X).length,bad,K);}
{const l=inLake(K);T.ok('nothing but the harbour\'s pieces and the bridge stands in the lake or the river',!l.length,l.length+' wet'+(l.length?': '+l.slice(0,4).join(', '):''));
 const bad=Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[0],{id:'afloat',x:-1500,z:0})])});T.neg('a house in the lake is caught',X=>!inLake(X).length,bad,K);}
const popOk=X=>Math.abs(X.census.people-3000)<=450;
T.ok('the town holds about 3,000 (PLAN.md section 2; within 15 %)',popOk(K),K.census.people+' people in '+K.census.buildings+' buildings');
T.neg('a town of 4,000 is caught',popOk,{census:{people:4000}},K);
const marks=X=>['ks.seat','ks.barracks','ks.generator','ks.horns','ks.serai','ks.latex','ks.tea','ks.ferment.a','ks.temple','ks.extra.monastery','ks.extra.lighthouse']
 .every(id=>X.lots.some(l=>l.id===id)||X.extra.some(l=>l.id===id))&&X.extra.filter(e=>e.kind==='quay').length>=8&&X.extra.filter(e=>e.kind==='mole').length>=10;
T.ok('the landmarks stand: the seat, the barracks, the generator, the Two Horns, the serai, the latex house, the tea factory, the White Monastery\'s house, the temple, the lighthouse; the quays and the mole',marks(K),
 K.extra.filter(e=>e.kind==='quay').length+' quays, '+K.extra.filter(e=>e.kind==='mole').length+' mole pieces');
T.neg('a town without its latex house is caught',marks,Object.assign({},K,{lots:K.lots.filter(l=>!/latex/.test(l.id))}),K);
/* the walled square (the owner, 2026-11-17: like Chiang Mai): four named gates, four corner bastions, wall runs all round,
   and every town lot inside the wall (only the serai and the works outside it) */
const OUTSIDE=new Set(['ks.serai','ks.tea','ks.ferment.a','ks.ferment.b','ks.latex']);
const walled=X=>{const W=X.wall;if(!W||W.nodes.filter(n=>n.kind==='gate'&&n.named).length!==4||W.corners.length!==4||W.segs.length<8)return false;
 const L=W.line.slice(0,-1),inside=(x,z)=>{let c=false;for(let i=0,j=L.length-1;i<L.length;j=i++){const a=L[i],b=L[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 return X.lots.every(l=>OUTSIDE.has(l.id)||inside(l.x,l.z));};
T.ok('the town is walled: four named gates, four corner bastions, its runs all round, every lot inside the wall',walled(K),
 K.wall?K.wall.nodes.filter(n=>n.kind==='gate').map(n=>n.name).join(', ')+'; '+K.wall.segs.length+' runs, '+K.wall.nodes.filter(n=>n.kind==='tower').length+' buttresses':'no wall');
T.neg('a house outside the wall is caught',walled,Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[5],{id:'outside',x:K.lots[5].x+3000})])}),K);
/* the moat (the owner, 2026-11-17): dug all round (the ground at its middle 2.5 m under its banks), bridged at the four gates,
   no building standing in it but its bridges */
const moated=X=>{const M=X.moat;if(!M||M.bridges.length!==4)return false;const G=KS_GROUND,L=M.line;
 for(let i=1;i<L.length;i++){const p=[(L[i-1][0]+L[i][0])/2,(L[i-1][1]+L[i][1])/2];if(G.base(p[0],p[1])-G.h(p[0],p[1])<2.5)return false;}
 return X.lots.concat(X.extra).every(r=>r.kind==='bridge'||!G.inMoat(r.x,r.z,2));};
T.ok('the moat is dug all round, bridged at the four gates, nothing standing in it',moated(K),K.moat?K.moat.bridges.map(b=>b.side+' deck '+b.deck.toFixed(1)).join(', '):'no moat');
T.neg('a house in the moat is caught',moated,Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[3],{id:'moat',x:K.moat.line[2][0],z:K.moat.line[2][1]})])}),K);
/* the bridge spans Keb Riwa: its ends on dry ground, the river's line between them, the deck over the water */
const spans=X=>{const B=X.bridge,G=KS_GROUND,mid=[(B.a[0]+B.b[0])/2,(B.a[1]+B.b[1])/2],rv=G.riverAt(mid[0],mid[1]);
 return G.h(B.a[0],B.a[1])>rv[1]+1&&G.h(B.b[0],B.b[1])>rv[1]+1&&rv[0]<G.river.width/2&&B.deck>rv[1]+3;};
T.ok('the bridge spans Keb Riwa: its ends on the banks, the river under its middle, the deck above the water',spans(K),
 'deck '+K.bridge.deck.toFixed(1)+' m, the river '+KS_GROUND.riverAt((K.bridge.a[0]+K.bridge.b[0])/2,(K.bridge.a[1]+K.bridge.b[1])/2).map(n=>n.toFixed(1)).join(' m off, surface ')+' m');
T.neg('a bridge set beside the river is caught',spans,Object.assign({},K,{bridge:Object.assign({},K.bridge,{a:[K.bridge.a[0]+600,K.bridge.a[1]+600],b:[K.bridge.b[0]+600,K.bridge.b[1]+600]})}),K);
/* reruns the same */
const hash=X=>{let h=2166136261;const s=X.lots.concat(X.extra).map(l=>l.key+l.x.toFixed(2)+l.z.toFixed(2)+(+l.ry).toFixed(3)).join();for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;};
{const K2=KS_TOWN.make({dims});T.ok('the layout reruns the same (core/rand streams)',hash(K2)===hash(K),hash(K).toString(16));
 T.neg('a layout from another seed differs',X=>hash(X)===hash(K),KS_TOWN.make({dims,seed:7}),K);}
if(typeof KS_RING!=='undefined')require('./test-ks-ring-checks.js')(T,{K,dims,KS_RING,ROOT});
T.done();
