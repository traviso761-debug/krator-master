// node core/biome/test-fungoid.js: the fungoid parts (33-core-fungoid.js), each check with a negative.
const path=require('path'),vm=require('vm'),fs=require('fs');
const F=require('./test-foliage.js');   /* its loader: three r128, the biome head, 30-core-foliage */
const D=__dirname;
function load(){const B=F.load(fs.readFileSync(path.join(D,'30-core-foliage.js'),'utf8')),ctx=B.__ctx;
 vm.runInContext(fs.readFileSync(path.join(D,'..','rand','08-core-rand.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(D,'33-core-fungoid.js'),'utf8'),ctx);return B;}
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
const B=load(),G=B.fung,T=B.host.THREE;
const arr=g=>Array.from(g.attributes.position.array),tris=g=>g.attributes.position.count/3;
const bounds=g=>{const P=g.attributes.position,b=[1e9,1e9,1e9,-1e9,-1e9,-1e9];for(let i=0;i<P.count;i++){const v=[P.getX(i),P.getY(i),P.getZ(i)];for(let a=0;a<3;a++){b[a]=Math.min(b[a],v[a]);b[a+3]=Math.max(b[a+3],v[a]);}}return b;};
// every triangle wound to face its own vertex normals (a FrontSide material shows it from outside), every normal unit
function sound(g){const P=g.attributes.position.array,N=g.attributes.normal.array,C=g.attributes.color,U=g.attributes.uv;let bad=0,badN=0;
 if(!C||!U)return 'no colour or uv';
 for(let t=0;t<P.length;t+=9){const a=[P[t],P[t+1],P[t+2]],e1=[P[t+3]-a[0],P[t+4]-a[1],P[t+5]-a[2]],e2=[P[t+6]-a[0],P[t+7]-a[1],P[t+8]-a[2]],
  g3=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],n=[N[t]+N[t+3]+N[t+6],N[t+1]+N[t+4]+N[t+7],N[t+2]+N[t+5]+N[t+8]];
  if(g3[0]*n[0]+g3[1]*n[1]+g3[2]*n[2]<0)bad++;}
 for(let i=0;i<N.length;i+=3)if(Math.abs(Math.hypot(N[i],N[i+1],N[i+2])-1)>1e-4||!isFinite(N[i]))badN++;
 for(const v of P)if(!isFinite(v))return 'a non-finite position';
 return bad||badN?bad+' backward triangles, '+badN+' bad normals':'';}
// ---------------------------------------------------------------- the parts
const PARTS={cap:{},capDisc:{form:'disc',ribs:12,under:'none'},capFunnel:{form:'funnel',under:'pores'},capStem:{stem:{}},bracket:{},bladder:{},pod:{},podHang:{hang:true},
 stalk:{bend:.3,ribs:5},fringe:{},comb:{},tube:{seed:9},crust:{seed:4}};
for(const k of Object.keys(PARTS)){const fn=G[k.replace(/(Disc|Funnel|Stem|Hang)$/,'')],o=PARTS[k],g=fn(o),s=sound(g);
 check(k+': a geometry, every triangle facing out, unit normals, a colour and a uv',tris(g)>0&&!s,tris(g)+' triangles'+(s?', '+s:''));}
{const g=G.cap({}),b=bounds(g);check('cap: radius 1, the top at h (.35), above the origin',Math.abs(b[3]-1)<.02&&Math.abs(b[4]-.35)<1e-6&&b[1]>-.2,b.map(v=>v.toFixed(3)).join(' '));
 const s=G.cap({stem:{h:.6}}),bs=bounds(s);check('cap on a stem: the foot at the origin, the cap atop the stem',Math.abs(bs[1])<1e-9&&Math.abs(bs[4]-.95)<1e-6,bs[1].toFixed(3)+'..'+bs[4].toFixed(3));
 const n=G.cap({under:'none'}),gl=G.cap({under:'gills'}),pr=G.cap({under:'pores'});check('  the underside is optional: none < pores < gills in triangles',tris(n)<tris(pr)&&tris(pr)<tris(gl),tris(n)+' '+tris(pr)+' '+tris(gl));}
{const b=bounds(G.bracket({}));check('bracket: on one side of its wall (z >= 0), out to 1',b[2]>-1e-6&&Math.abs(b[5]-1)<.01,'z '+b[2].toFixed(4)+'..'+b[5].toFixed(3));
 const w=bounds(G.bracket({arc:Math.PI*1.6}));check('  negative: an arc past PI wraps behind the wall',w[2]<-.1);}
{const b=bounds(G.pod({hang:true,h:1.6}));check('pod hung: from the origin down to -h',Math.abs(b[4])<1e-6&&Math.abs(b[1]+1.6)<1e-6);}
{const b=bounds(G.stalk({bend:.3}));check('stalk: 1 high from the origin, the tip bowed along +x by bend',Math.abs(b[1])<1e-9&&Math.abs(b[4]-1)<1e-9&&b[3]>.3);}
{const b=bounds(G.crust({}));check('crust: flat on the ground at y .01',Math.abs(b[1]-.01)<1e-9&&Math.abs(b[4]-.01)<1e-9);}
{const b=bounds(G.tube({n:5,seed:3}));check('tube: the tallest is 1 high',Math.abs(b[4]-1)<1e-9);}
// ---------------------------------------------------------------- determinism and the seed
{const a=arr(G.cap({lump:.1,seed:7})),b=arr(G.cap({lump:.1,seed:7})),c=arr(G.cap({lump:.1,seed:8})),d=arr(G.cap({seed:8})),e=arr(G.cap({seed:7}));
 check('the same o gives the same vertices',a.length===b.length&&a.every((v,i)=>v===b[i]));
 check('  negative: another seed moves a lumped cap',a.some((v,i)=>v!==c[i]));
 check('  without a lump or waves the seed moves nothing',d.every((v,i)=>v===e[i]));
 const z0=arr(G.cap({h:0})),zd=arr(G.cap({}));check('a numeric 0 is a value, not the default (h:0 is flat)',z0.some((v,i)=>v!==zd[i])&&bounds(G.cap({h:0,under:'none'}))[4]<1e-9);}
// the budget the kits held before (nhighlands' disc: 36 triangles; its mushroom about 35)
check('nhighlands\' disc as a cap (disc, 12 ribs, no underside, 2 rings): 36 triangles',tris(G.cap({form:'disc',seg:12,rings:2,ribs:12,under:'none'}))===36,tris(G.cap({form:'disc',seg:12,rings:2,ribs:12,under:'none'}))+'');
// ---------------------------------------------------------------- layouts
const qlen=q=>Math.hypot(q[0],q[1],q[2],q[3]),rot=(q,v)=>{const V=new T.Vector3(v[0],v[1],v[2]).applyQuaternion(new T.Quaternion(q[0],q[1],q[2],q[3]));return[V.x,V.y,V.z];};
{const a=G.troop({n:5,seed:11}),b=G.troop({n:9,seed:11}),c=G.troop({n:5,seed:12});
 check('troop: n records, unit quaternions, inside the radius',a.length===5&&a.every(r=>Math.abs(qlen(r.q)-1)<1e-12&&Math.hypot(r.p[0],r.p[2])<=1+1e-9));
 check('troop: an item is drawn by its index, not by draw order (a bigger troop keeps the first five)',a.every((r,i)=>JSON.stringify(r)===JSON.stringify(b[i])));
 check('  negative: another seed moves them',a.some((r,i)=>r.p[0]!==c[i].p[0]));
 const f=G.troop({n:4,seed:2,tilt:0});check('tilt 0 is no tilt (each cap upright)',f.every(r=>Math.abs(rot(r.q,[0,1,0])[1]-1)<1e-12));
 const g=G.troop({n:3,seed:2,at:[5,0,5],ground:(x,z)=>x+z});check('troop: the ground function sets y',g.every(r=>Math.abs(r.p[1]-(r.p[0]+r.p[2]))<1e-12));}
{const n=[1,0,0],s=G.shelves({at:[0,2,0],n,rows:3,per:2,seed:5});
 check('shelves: rows x per brackets, each turned out along the face normal (its +z within 20 degrees)',s.length===6&&s.every(r=>{const z=rot(r.q,[0,0,1]);return z[0]>Math.cos(.35);}));
 check('  rows climb by dy',s[4].p[1]>s[0].p[1]);}
{const p=G.pods({n:6,seed:3,tilt:0});check('pods: tilt 0 stands every pod upright',p.length===6&&p.every(r=>Math.abs(rot(r.q,[0,1,0])[1]-1)<1e-9));
 const q=G.pods({n:6,seed:3,tilt:.6});check('  negative: a tilt leans them',q.some(r=>rot(r.q,[0,1,0])[1]<.99));}
{const c=G.combs({a:[0,0,0],b:[0,2,0],n:4,seed:1});check('combs: up the mast between t0 and t1, shrinking',c.length===4&&Math.abs(c[0].p[1]-.6)<1e-9&&Math.abs(c[3].p[1]-1.9)<1e-9&&c[3].s[0]<c[0].s[0]);
 const t=G.combs({a:[0,0,0],b:[2,0,0],n:2});check('combs: a leaning mast turns each node\'s +y along it',t.every(r=>rot(r.q,[0,1,0])[0]>.999));}
// ---------------------------------------------------------------- the host side
{const puts=[];B.put=(name,p,q,s,c)=>puts.push({name,p,q,s,c});const n=G.put('cap',G.troop({n:3,seed:1}),[0xff0000,0x00ff00],[10,0,0]);
 check('put: one BIO.put a record, offset by at, a colour picked by u',n===3&&puts.length===3&&puts.every(r=>r.p[0]>8&&r.c&&r.c.isColor&&r.q.isQuaternion));}
if(fails){console.log(fails+' FAILED');process.exit(1);}console.log('all fungoid checks pass');
