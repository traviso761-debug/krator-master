// node core/biome/test-fungoid.js: the fungoid parts (33-core-fungoid.js), each check with a negative.
const path=require('path'),vm=require('vm'),fs=require('fs');
const F=require('./test-foliage.js');   /* its loader: three r128, the biome head, 30-core-foliage */
const D=__dirname;
function load(){const B=F.load(fs.readFileSync(path.join(D,'30-core-foliage.js'),'utf8')),ctx=B.__ctx;
 vm.runInContext(fs.readFileSync(path.join(D,'..','rand','08-core-rand.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(D,'33-core-fungoid.js'),'utf8'),ctx);return B;}
let fails=0;const check=(name,pass,detail)=>{console.log((pass?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!pass)fails++;};
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
// ---------------------------------------------------------------- the ring colours, the cap's halves (2026-11-24)
const KT=require('../../tools/ktest.js')(__filename),crypto=require('crypto');
// every attribute's bytes (position, normal, uv, color, and the index if any) of a part: the fingerprint of a geometry
const hashOf=g=>{const h=crypto.createHash('sha1');for(const k of ['position','normal','uv','color']){const a=g.attributes[k];h.update(k+':');if(a)h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(g.index)h.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));return h.digest('hex').slice(0,16);};
// the parts every kit draws today, with the options they pass: their hashes as the 33 before the ring colours drew them
const HASHED={cap:['cap',{}],capDisc:['cap',{form:'disc',ribs:12,under:'none'}],capFunnel:['cap',{form:'funnel',under:'pores'}],capStem:['cap',{stem:{}}],
 capPlanar:['cap',{uv:'planar',wav:7,wavA:.025,lump:.08,seed:5}],capNh:['cap',{form:'disc',seg:12,rings:2,ribs:12,under:'none'}],capGills:['cap',{gillN:40,gillD:.1,rIn:.06,seed:3,wav:5}],
 bracket:['bracket',{}],bracketWav:['bracket',{seg:12,wav:5,wavA:.04,lump:.06,seed:2,arc:Math.PI*.8}],bladder:['bladder',{}],bladderLump:['bladder',{lump:.05,seed:4}],
 pod:['pod',{}],podHang:['pod',{hang:true}],stalk:['stalk',{bend:.3,ribs:5}],fringe:['fringe',{}],comb:['comb',{}],tube:['tube',{seed:9}],crust:['crust',{seed:4}]};
const HASH0={"cap":"6ccbd3f56cc63a39","capDisc":"0570ff93e5612f85","capFunnel":"4fa922811edd20ea","capStem":"2b5c666fbfced1e0","capPlanar":"04a04d830eb58816","capNh":"6d635f9a9a14758f",
 "capGills":"e68dcb4e4449aeb3","bracket":"bf75c1574ee504d7","bracketWav":"5d8a27c8aee5cd13","bladder":"960fc188dbcc775a","bladderLump":"36dcba825d65ac94","pod":"9c373fdf6be7289f",
 "podHang":"79163cbeea9c79d2","stalk":"59b2f60e29aca8b1","fringe":"1cc8a604ee4b8a42","comb":"a4c3022c1a9f7c8f","tube":"572d2bc7b964fef6","crust":"d46c4535263b1208"};
const hashes={};for(const k of Object.keys(HASHED))hashes[k]=hashOf(G[HASHED[k][0]](HASHED[k][1]));
if(process.argv.includes('--print-hashes'))console.log(JSON.stringify(hashes));
{const bad=Object.keys(HASHED).filter(k=>hashes[k]!==HASH0[k]);
 KT.ok('without the new options every part is byte-identical to the 33 before them ('+Object.keys(HASHED).length+' parts)',!bad.length,bad.join(' '));
 /* every literal BIO.fung call the kits made on 2026-11-24 (extracted from their src/, hashed with the 33 before the ring colours) */
 const calls=JSON.parse(fs.readFileSync(path.join(D,'test-fungoid-calls.json'),'utf8')),moved=calls.filter(([p,o,h])=>hashOf(G[p](o))!==h);
 KT.ok('every kit\'s own BIO.fung call ('+calls.length+') draws the same bytes',!moved.length,moved.slice(0,4).map(c=>c[0]+JSON.stringify(c[1])).join(' | '));
 KT.neg('the hash sees a changed part (a bracket given ring colours)',o=>hashOf(G.bracket(o))===HASH0.bracket,{ringCol:[[0,[1,0,0]],[1,[0,0,1]]]},{});}
// RING COLOURS: each top vertex's colour is the rings' RGB blended by its radius, the underside the one colour given
const RC=[[0,[.7,.6,.4]],[.3,[1,1,1]],[.5,[.5,.7,.9]],[.66,[1.1,.9,.5]],[.8,[.6,.9,.8]],[.9,[1,1,1]],[1,[1.1,1.05,.95]]],UC=[.95,.9,.8];
const blend=(rc,r)=>{if(r<=rc[0][0])return rc[0][1];for(let i=0;i<rc.length-1;i++)if(r<=rc[i+1][0]){const t=(r-rc[i][0])/(rc[i+1][0]-rc[i][0]),a=rc[i][1],b=rc[i+1][1];return a.map((v,k)=>v+(b[k]-v)*t);}return rc[rc.length-1][1];};
function ringsFollow(g,rc,uc){const P=g.attributes.position.array,C=g.attributes.color.array,near=(c,e)=>Math.abs(c[0]-e[0])<1e-5&&Math.abs(c[1]-e[1])<1e-5&&Math.abs(c[2]-e[2])<1e-5;let top=0;
 for(let i=0;i<P.length;i+=3){const r=Math.hypot(P[i],P[i+2]),c=[C[i],C[i+1],C[i+2]];if(near(c,blend(rc,r)))top++;else if(!(uc&&near(c,uc)))return false;}
 /* and every ring's own colour stands at its radius (the blend passes through each ring, not only its ends) */
 return top>0&&rc.every(([r,col])=>{for(let i=0;i<P.length;i+=3)if(Math.abs(Math.hypot(P[i],P[i+2])-r)<1e-6&&near([C[i],C[i+1],C[i+2]],col))return true;return false;});}
KT.neg('bracket: with o.ringCol the vertex colours follow the given rings, root to rim, the underside o.underCol (negative: the grey-only part)',
 g=>ringsFollow(g,RC,UC),G.bracket({seg:14}),G.bracket({seg:14,ringCol:RC,underCol:UC}));
KT.ok('  the same with Oidong\'s shape options (a wave on the lip)',ringsFollow(G.bracket({seg:14,thick:.22,droop:.04,wav:3,wavA:.025,ringCol:RC,underCol:UC}),RC,UC));
KT.neg('cap: o.ringCol colours the top by ring (o.only top; negative: the grey top)',g=>ringsFollow(g,RC,null),G.cap({only:'top',under:'none'}),G.cap({only:'top',under:'none',ringCol:RC}));
// THE CAP'S HALVES: every vertex of the underside (gill plates, their roof) lies below the top's lowest surface straight
// above it. The negative is the Throne's old pair before 2026-11-24 (its G.lathe disc with its own underside, and the gill
// lathe under it, rebuilt here from 50-biome-throne-species.js): the gills ran inside the disc's underside, so they drew
// only as two dark rings.
function oldLathe(prof,seg,wavN,wavA){const n=prof.length,P=[],out=[];
 for(let i=0;i<n;i++){const [y,r]=prof[i],t=n>1?i/(n-1):0,row=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;row.push([Math.cos(a)*r,y+(wavA||0)*Math.sin(a*(wavN||0))*t*t,Math.sin(a)*r]);}P.push(row);}
 for(let i=0;i<n-1;i++)for(let s=0;s<seg;s++)for(const v of [P[i][s],P[i+1][s+1],P[i+1][s],P[i][s],P[i][s+1],P[i+1][s+1]])out.push(...v);return out;}
const TAU=Math.PI*2;
function belowTop(pair){const T=pair.top,U=pair.under;let worst=Infinity,miss=0;
 for(let i=0;i<U.length;i+=3){const x=U[i],y=U[i+1],z=U[i+2];let lo=Infinity;
  for(let t=0;t<T.length;t+=9){const ax=T[t],az=T[t+2],bx=T[t+3],bz=T[t+5],cx=T[t+6],cz=T[t+8],d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-14)continue;
   const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;if(l1<-1e-9||l2<-1e-9||l3<-1e-9)continue;
   lo=Math.min(lo,l1*T[t+1]+l2*T[t+4]+l3*T[t+7]);}
  if(lo===Infinity){miss++;continue;}worst=Math.min(worst,lo-y);}
 return !miss&&worst>1e-6;}
const pos=g=>Array.from(g.attributes.position.array);
const THRONE_CAP={form:'dome',h:.16,seg:28,rings:4,wav:7,wavA:.025,under:'gills',gillN:40,gillD:.1,rIn:.06,gillRoof:true,uv:'planar'};
const oldPair={top:oldLathe([[-.02,.06],[-.06,.5],[-.04,.92],[0,1.0],[.07,.86],[.13,.55],[.16,.0]],28,7,.025),under:oldLathe([[-.05,.07],[-.055,.55],[-.03,.97]],56)};
KT.neg('cap: o.only top and o.only under split one cap, every gill and roof vertex below the top above it (negative: the Throne\'s old disc and gill lathe)',
 belowTop,oldPair,{top:pos(G.cap(Object.assign({},THRONE_CAP,{only:'top'}))),under:pos(G.cap(Object.assign({},THRONE_CAP,{only:'under'})))});
/* (seg 24: at the default 10 the plates' corners at .97 reach past the top's ten-sided rim, inscribed at .95) */
KT.ok('  and so for the plain cap\'s shape (dome and disc, with a wave)',['dome','disc'].every(form=>belowTop({top:pos(G.cap({form,seg:24,wav:5,only:'top'})),under:pos(G.cap({form,seg:24,wav:5,only:'under',gillRoof:true}))})));
{const all=tris(G.cap(THRONE_CAP)),t=tris(G.cap(Object.assign({},THRONE_CAP,{only:'top'}))),u=tris(G.cap(Object.assign({},THRONE_CAP,{only:'under'}))),
  noRoof=tris(G.cap(Object.assign({},THRONE_CAP,{only:'under',gillRoof:false})));
 KT.ok('  the halves add up to the whole cap; the roof is one ring of seg quads',t+u===all&&u-noRoof===2*28,t+' + '+u+' = '+all+'; roof '+(u-noRoof));
 KT.ok('  the Throne\'s parasol as two halves is lighter than its old disc and gill lathe (336 + 224 triangles)',t+u<560,(t+u)+' triangles');
 const s=[G.cap(Object.assign({},THRONE_CAP,{only:'under'})),G.cap(Object.assign({},THRONE_CAP,{only:'top'})),G.bracket({seg:14,wav:3,ringCol:RC,underCol:UC})].map(sound).filter(Boolean);
 KT.ok('  both halves and the ringed bracket face out, unit normals',!s.length,s.join('; '));}
if(fails){console.log(fails+' FAILED');process.exit(1);}console.log('all fungoid checks pass');
KT.done();
