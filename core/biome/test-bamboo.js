// node core/biome/test-bamboo.js: the bamboo parts (33b-core-bamboo.js), each check with a negative, and the Cut's culm
// (biomes/cut/src/50-biome-cut-species.js G.culm, read in place) reproduced from BIO.bamboo.culm's options.
const path=require('path'),vm=require('vm'),fs=require('fs');
const F=require('./test-foliage.js');   /* its loader: three r128, the biome head, 30-core-foliage */
const D=__dirname;
function load(){const B=F.load(fs.readFileSync(path.join(D,'30-core-foliage.js'),'utf8')),ctx=B.__ctx;
 vm.runInContext(fs.readFileSync(path.join(D,'..','rand','08-core-rand.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(D,'33b-core-bamboo.js'),'utf8'),ctx);return B;}
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
const B=load(),G=B.bamboo,T=B.host.THREE;
const tris=g=>g.attributes.position.count/3;
const bounds=g=>{const P=g.attributes.position,b=[1e9,1e9,1e9,-1e9,-1e9,-1e9];for(let i=0;i<P.count;i++){const v=[P.getX(i),P.getY(i),P.getZ(i)];for(let a=0;a<3;a++){b[a]=Math.min(b[a],v[a]);b[a+3]=Math.max(b[a+3],v[a]);}}return b;};
// every triangle wound to face its own vertex normals, every normal finite (unit unless the part says otherwise)
function sound(g,unit){const P=g.attributes.position.array,N=g.attributes.normal.array;let bad=0,badN=0;
 for(let t=0;t<P.length;t+=9){const a=[P[t],P[t+1],P[t+2]],e1=[P[t+3]-a[0],P[t+4]-a[1],P[t+5]-a[2]],e2=[P[t+6]-a[0],P[t+7]-a[1],P[t+8]-a[2]],
  g3=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],n=[N[t]+N[t+3]+N[t+6],N[t+1]+N[t+4]+N[t+7],N[t+2]+N[t+5]+N[t+8]];
  if(g3[0]*n[0]+g3[1]*n[1]+g3[2]*n[2]<-1e-12)bad++;}
 for(let i=0;i<N.length;i+=3)if((unit&&Math.abs(Math.hypot(N[i],N[i+1],N[i+2])-1)>1e-4)||!isFinite(N[i]))badN++;
 for(const v of P)if(!isFinite(v))return 'a non-finite position';
 return bad||badN?bad+' backward triangles, '+badN+' bad normals':'';}

// ---------------------------------------------------------------- the Cut's culm, read in place
// The function's text is lifted out of the Cut's fragment and run with the two names it closes over (make, TAU).
const CUT=fs.readFileSync(path.join(D,'..','..','biomes','cut','src','50-biome-cut-species.js'),'utf8');
const i0=CUT.indexOf('G.culm=function'),i1=CUT.indexOf('\n// a bamboo shoot',i0);
let cutCulm=null;
if(i0>=0&&i1>i0){const ctx=B.__ctx;ctx.__cutG={};
 vm.runInContext('(function(){const TAU=Math.PI*2,make=(p,n,u,c)=>BIO.geo._make(p,n,u,c),G=__cutG;'+CUT.slice(i0,i1)+'})();',ctx);cutCulm=ctx.__cutG.culm;}
check('the Cut\'s G.culm found in biomes/cut/src/50-biome-cut-species.js',!!cutCulm);
const ATTR=['position','normal','uv','color'];
function compare(a,b){const r={same:true,n:[a.attributes.position.count,b.attributes.position.count],max:0};
 if(r.n[0]!==r.n[1]){r.same=false;return r;}
 for(const k of ATTR){const x=a.attributes[k].array,y=b.attributes[k].array;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d>r.max)r.max=d;}}
 r.same=r.max===0;return r;}
if(cutCulm){
 /* the Cut's items (its 50: CUT.CULM_N's three tiers, CUT.BITTEN, the echo) and BIO.bamboo's options for each */
 const CASES=[];
 for(const n of [20,24,28]){CASES.push(['hculm'+n+' (near)',cutCulm(n,6),G.culm({n,seg:6})]);
  CASES.push(['hculmm'+n+' (mid)',cutCulm(n,5,null,[0,.5]),G.culm({n,seg:5,fs:[0,.5]})]);
  CASES.push(['hculmf'+n+' (far)',cutCulm(n,4,null,[0]),G.culm({n,seg:4,fs:[0]})]);}
 [{n:24,y:8.4,r:1.3},{n:24,y:12.5,r:1.1},{n:28,y:18.5,r:1.4}].forEach((b,i)=>CASES.push(['hculmb'+i+' (bitten)',cutCulm(b.n,10,b,[0,.02,.08,.45,.86]),G.culm({n:b.n,seg:10,bite:{y:b.y,r:b.r},fs:[0,.02,.08,.45,.86]})]));
 CASES.push(['hecho',cutCulm(24,5,null,[0]),G.culm({n:24,seg:5,fs:[0]})]);
 CASES.push(['a cut length (cut=true)',cutCulm(12,8,null,null,true),G.culm({n:12,seg:8,cut:true})]);
 let worst=0;for(const [name,a,b] of CASES){const r=compare(a,b);worst=Math.max(worst,r.same?0:(r.n[0]!==r.n[1]?Infinity:r.max));
  check('the Cut\'s '+name+' from BIO.bamboo.culm: vertex for vertex',r.same,r.n[0]+' vertices'+(r.same?', identical in position, normal, uv and colour':r.n[0]!==r.n[1]?' vs '+r.n[1]:', max difference '+r.max));}
 console.log('     the Cut\'s culm reproduced: '+CASES.length+' items, the largest difference in any attribute '+worst);
 {const r=compare(cutCulm(24,6),G.culm({n:24,seg:6,swell:.06}));check('  negative: another swell moves the vertices',!r.same);}
 {const r=compare(cutCulm(24,10,{y:8.4,r:1.3},[0,.02,.08,.45,.86]),G.culm({n:24,seg:10,bite:{y:8.4,r:1.3,a:.5},fs:[0,.02,.08,.45,.86]}));check('  negative: a bite turned to another azimuth is not the Cut\'s',!r.same);}
 {const r=compare(cutCulm(24,6),G.culm({n:24,seg:6,jit:.2,seed:3}));check('  negative: jittered internodes are not the Cut\'s',!r.same);}}

// ---------------------------------------------------------------- the parts
const PARTS={culm:[{},true],culmJit:[{jit:.25,grade:.4,seed:5},true],culmHoles:[{holes:{seed:4}},true],culmSheaths:[{sheaths:3,seed:2},true],
 culmBiteHoles:[{bite:{y:8,r:1.2},holes:[{y:14.5,r:.25,a:2}]},true],spray:[{},false],fan:[{},true],shoot:[{},true]};
for(const k of Object.keys(PARTS)){const fn=G[k.replace(/(Jit|Holes|Sheaths|BiteHoles)$/,'')],[o,unit]=PARTS[k],g=fn(o),s=sound(g,unit);
 check(k+': a geometry, every triangle facing its normals, finite normals, a uv',tris(g)>0&&!s&&!!g.attributes.uv,tris(g)+' triangles'+(s?', '+s:''));}
{const b=bounds(G.culm({}));check('culm: from the origin up 1, radius .5 (with the node swell)',Math.abs(b[1])<1e-9&&Math.abs(b[4]-1)<1e-6&&b[3]>.5&&b[3]<.53,b.map(v=>v.toFixed(3)).join(' '));
 const c=bounds(G.culm({cut:true}));check('  a cut length keeps its width to the top; the tipped culm narrows',c[3]>.5&&(()=>{const P=G.culm({}).attributes.position;let m=0;for(let i=0;i<P.count;i++)if(P.getY(i)>.999)m=Math.max(m,Math.hypot(P.getX(i),P.getZ(i)));return m<.11;})());}
{const Y=G.nodeY({n:24}),J=G.nodeY({n:24,jit:.3,seed:9}),J2=G.nodeY({n:24,jit:.3,seed:9}),J3=G.nodeY({n:24,jit:.3,seed:10});
 check('nodeY: n+1 heights from 0 to 1, rising',J.length===25&&J[0]===0&&J[24]===1&&J.every((v,i)=>!i||v>J[i-1]));
 check('nodeY: equal internodes without jit (the grove\'s levels)',Y.every((v,i)=>Math.abs(v-i/24)<1e-15));
 const L=J.slice(1).map((v,i)=>v-J[i]);check('  jit varies them, by the seed, the same for the same seed',Math.max(...L)/Math.min(...L)>1.2&&J.every((v,i)=>v===J2[i])&&J.some((v,i)=>v!==J3[i]),'longest/shortest '+(Math.max(...L)/Math.min(...L)).toFixed(2));
 const Gr=G.nodeY({n:24,grade:.6}),gl=Gr.slice(1).map((v,i)=>v-Gr[i]);check('grade: the middle internodes longer than the foot\'s and the tip\'s',gl[12]>gl[0]&&gl[12]>gl[23]);}
{const plain=G.culm({n:24,seg:10}),hs=G.holeSet({n:24,seed:4}),holed=G.culm({n:24,seg:10,holes:hs});
 check('holeSet: holes in rows inside from..to, seeded',hs.length>3&&hs.every(h=>h.y>=4&&h.y<21&&h.r>=.18&&h.r<=.3)&&JSON.stringify(hs)===JSON.stringify(G.holeSet({n:24,seed:4}))&&JSON.stringify(hs)!==JSON.stringify(G.holeSet({n:24,seed:5})),hs.length+' holes');
 /* a hole drops the wall's cells round it and sets a dark plug in */
 const C=holed.attributes.color.array;let dark=0;for(let i=0;i<C.length;i+=3)if(C[i]<.3)dark++;
 check('holes: a dark plug (shade .22) in each, the wall opened round it',dark>0&&tris(holed)!==tris(plain),dark/3+' dark vertices');
 let pale=0;for(let i=0;i<C.length;i+=3)if(C[i]>1.01&&Math.abs(C[i]-1.32)>1e-4)pale++;check('  a pale stain below the holes',pale>0);
 const C0=plain.attributes.color.array;let p0=0;for(let i=0;i<C0.length;i+=3)if(C0[i]>1.01&&Math.abs(C0[i]-1.32)>1e-4)p0++;check('  negative: an unholed culm has no stain',p0===0);}
{const s0=G.culm({n:24,seg:10}),s3=G.culm({n:24,seg:10,sheaths:3,seed:1}),b=bounds(s3);
 check('sheaths: drawn at the lowest nodes only (below the fourth node), a little proud of the culm',tris(s3)>tris(s0)&&b[3]>.55&&(()=>{const P=s3.attributes.position,C=s3.attributes.color;for(let i=0;i<P.count;i++)if(Math.abs(C.getX(i)-.78)<1e-6&&P.getY(i)>3/24+1e-9)return false;return true;})());}
{const t=G.tiers({n:24,seg:10,holes:{seed:2},sheaths:2});check('tiers: near > mid > far in triangles, no openings past near',tris(t.near)>tris(t.mid)&&tris(t.mid)>tris(t.far)&&tris(t.mid)===24*2*9*2+0,tris(t.near)+' '+tris(t.mid)+' '+tris(t.far));}
{const z0=G.culm({n:24,swell:0}),zd=G.culm({n:24});check('a numeric 0 is a value, not the default (swell:0 is a straight culm)',bounds(z0)[3]<=.5+1e-9&&bounds(zd)[3]>.5);}
{const b=bounds(G.spray({}));check('spray: hangs from y 0 to -1, out along +x',Math.abs(b[4])<1e-9&&Math.abs(b[1]+1)<1e-9&&b[0]>-.2&&b[3]>1);
 const u=G.spray({cell:4}).attributes.uv.array;check('  cell 4 of a 3x3 sheet takes the middle cell',Math.min(...u)>=1/3-1e-6&&Math.max(...u)<=2/3+1e-6);}
{const tips=G.fanTips({n:5}),b=bounds(G.fan({n:5}));check('fanTips: five tips, the middle longest and out along +x',tips.length===5&&tips[2].L===1&&tips[2].p[0]>.9&&tips[0].L<1);
 check('fan: the twigs reach their tips (the same math)',Math.abs(b[3]-tips[2].p[0])<.02);}
{const b=bounds(G.shoot({}));check('shoot: 1 high, radius about .5, to a point',Math.abs(b[1])<1e-9&&Math.abs(b[4]-1)<1e-9&&b[3]<=.52);}

// ---------------------------------------------------------------- layouts
const qlen=q=>Math.hypot(q[0],q[1],q[2],q[3]),rot=(q,v)=>{const V=new T.Vector3(v[0],v[1],v[2]).applyQuaternion(new T.Quaternion(q[0],q[1],q[2],q[3]));return[V.x,V.y,V.z];};
const ground=(x,z)=>.03*x-.02*z+Math.sin(x*.1)*.5;
{const g=G.grove({seed:77,at:[100,0,-40],ground}),g2=G.grove({seed:77,at:[100,0,-40],ground}),g3=G.grove({seed:78,at:[100,0,-40],ground});
 check('grove: 50-200 culms in clumps, inside the grove, unit quaternions',g.culms.length>=50&&g.culms.length<=200&&g.culms.every(c=>Math.hypot(c.x-100,c.z+40)<=g.r+2&&Math.abs(qlen(c.q)-1)<1e-12),g.culms.length+' culms, r '+g.r.toFixed(1)+', L '+g.L.toFixed(2));
 check('grove: the same seed, the same records',JSON.stringify(g)===JSON.stringify(g2));
 check('  negative: another seed, another grove',JSON.stringify(g.culms[0])!==JSON.stringify(g3.culms[0]));
 check('grove: one internode length for every culm',g.culms.every(c=>c.L===g.L&&Math.abs(c.h-c.n*g.L)<1e-9));
 const lv=c=>{const t=(c.y+.05-g.y0)/g.L;return Math.abs(t-Math.round(t));};check('grove: every base on the grove\'s levels, so the nodes line up across it',g.culms.every(c=>lv(c)<1e-9));
 const na=G.grove({seed:77,at:[100,0,-40],ground,align:false});check('  negative: unaligned, the bases sit on the ground',na.culms.some(c=>lv(c)>.01));
 check('grove: the internode count falls toward the rim (28 in the middle, 20 at the edge)',g.culms.some(c=>c.n===28)&&g.culms.some(c=>c.n===20)&&g.culms.filter(c=>c.n===28).every(c=>Math.hypot(c.x-100,c.z+40)<g.r*.45+2));
 const q0=G.grove({seed:77,at:[100,0,-40],ground,lean:0});check('lean 0 stands every culm upright',q0.culms.every(c=>Math.abs(rot(c.q,[0,1,0])[1]-1)<1e-12));
 const hb=G.grove({seed:77,at:[100,0,-40],ground,old:.5,holed:.6,bitten:.5});check('holed and bitten only among the old, never both',hb.culms.some(c=>c.holed)&&hb.culms.some(c=>c.bitten)&&hb.culms.every(c=>(!c.holed&&!c.bitten)||c.old)&&!hb.culms.some(c=>c.holed&&c.bitten));
 check('  negative: the default grove has none holed or bitten',!g.culms.some(c=>c.holed||c.bitten));
 /* a clump is drawn by its index: a grove with more clumps keeps the first ones' culms */
 const a=G.grove({seed:5,at:[0,0,0],clumps:8}),b=G.grove({seed:5,at:[0,0,0],clumps:12});check('grove: a culm is drawn by its index, not by draw order (more clumps keep the first)',a.culms.every((c,i)=>JSON.stringify(c)===JSON.stringify(b.culms[i])));
 const cl=G.grove({seed:5,at:[0,0,0],clumps:12,clear:(x,z)=>x<0});check('  clear() drops a clump without moving the others',cl.culms.every(c=>b.culms.some(d=>JSON.stringify(d)===JSON.stringify(c)))&&cl.culms.length<b.culms.length);
 check('grove: shoots by the clumps',g.shoots.length>0&&g.shoots.every(s=>s.h>=1&&s.h<=3));}
{const a=G.groveCells({R:1000,world:3,weight:()=>1}),b=G.groveCells({R:1000,world:3,weight:()=>.3}),c=G.groveCells({box:[0,0,500,500],world:3,weight:()=>1});
 check('groveCells: a candidate a cell, kept by the weight',a.length>10&&b.length<a.length&&b.every(x=>a.some(y=>y.seed===x.seed)));
 check('  a box planned alone keeps the full plan\'s cells there (seeded by cell)',c.every(x=>a.some(y=>y.seed===x.seed&&y.x===x.x)||Math.hypot(x.x,x.z)>1000));
 check('  negative: weight 0 keeps none',G.groveCells({R:1000,world:3,weight:()=>0}).length===0);}
{const g=G.grove({seed:77,at:[0,0,0]}),C=g.culms[0],s=G.sprays({culm:C});
 const n0=Math.ceil(C.n*.42);check('sprays: from 42% up, every node near, every 2nd mid, every 4th far',s.filter(r=>r.tier===0).length===C.n-n0&&s.filter(r=>r.tier===1).length===Math.ceil((C.n-n0)/2)&&s.every(r=>r.k>=n0&&r.k<C.n));
 check('  each at its node (base + k L)',s.every(r=>Math.abs(r.p[1]-(C.y+r.k*C.L))<1e-9));
 check('  the far sprays larger than the near',s.find(r=>r.tier===2).s[0]>s.find(r=>r.tier===0&&r.k===s.find(q=>q.tier===2).k).s[0]);
 const nodes=G.nodeY({n:C.n,jit:.3,seed:2}).map(y=>y*C.h),j=G.sprays({culm:C,nodes});check('  o.nodes puts them on a jittered culm\'s nodes',j.every(r=>Math.abs(r.p[1]-(C.y+nodes[r.k]))<1e-9));}
{const f=G.flower({seed:1,cohort:3,cycle:40}),f2=G.flower({seed:1,cohort:3,cycle:40}),f3=G.flower({seed:1,cohort:4,cycle:40});
 const g1=G.grove({seed:10,at:[0,0,0],flowerSeed:1,cohort:3,cycle:40}),g2=G.grove({seed:11,at:[500,0,0],flowerSeed:1,cohort:3,cycle:40});
 check('flowering: gregarious, every grove of a cohort flowers the same year',JSON.stringify(g1.flower)===JSON.stringify(g2.flower)&&f.phase===f2.phase);
 check('  negative: another cohort another year',f3.phase!==f.phase);
 const yr=f.phase,st=[];for(let y=yr;y<yr+40;y++)st.push(G.flowering(f,y+.5).state);
 check('flowering: once a cycle, then dead 3 years, then 8 regrowing, then green',st[0]==='flowering'&&st.filter(s=>s==='flowering').length===1&&st.filter(s=>s==='dead').length===3&&st.filter(s=>s==='regrowth').length===8&&st.filter(s=>s==='green').length===28,st.slice(0,13).join(' '));
 const r=G.flowering(f,yr+4.5+4);check('  the regrowth rises from 0 (height and leaf)',r.state==='regrowth'&&r.height>0&&r.height<1);
 check('  the cycle repeats',G.flowering(f,yr+.5+40).state==='flowering');}
// ---------------------------------------------------------------- the host side
{const puts=[];B.put=(name,p,q,s,c)=>puts.push({name,p,q,s,c});const g=G.grove({seed:3,at:[0,0,0],clumps:3});
 const n=G.put(c=>'culm'+c.n,g.culms,[0xff0000,0x00ff00],[10,0,0]);
 check('put: one BIO.put a record, the item named by a function, offset by at, a colour picked by u',n===g.culms.length&&puts.every(r=>/^culm\d+$/.test(r.name)&&r.c&&r.c.isColor&&r.q.isQuaternion)&&Math.abs(puts[0].p[0]-g.culms[0].x-10)<1e-9);}

console.log(fails?fails+' FAILED':'all bamboo checks pass');process.exit(fails?1:0);
