// node settlements/dhelv/tests/test-layout.js — Dhelv's layout (src/41-dhelv-layout.js, [G data]) against kits/zeijani/PLAN.md
// section 12, each check with a negative control: a broken copy of the layout the same check must FAIL. It reads the kit's
// defs (kits/zeijani/src) for their footprints, types and wealth, so a site can only name a def that exists and the layout's
// footprints are the kit's. No node here: python3 tools/node_in_chromium.py settlements/dhelv/tests/test-layout.js
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..','..');
const SRC=fs.readFileSync(path.join(__dirname,'..','src','41-dhelv-layout.js'),'utf8');
const fresh=()=>new Function(SRC+'\n;return DH;')();
const DH=fresh(),R=DH.RULES,PI=Math.PI;
let fail=0;const ok=(c,name,detail)=>{console.log((c?'  ok   ':'  FAIL ')+name+(detail?'  ('+detail+')':''));if(!c)fail++;};
const neg=(c,name,detail)=>ok(!c,'  negative: '+name,detail);

/* ---- the kit's defs: key -> {w, d, front, types, wealth} (the shops are made from their items: 47-zj-shops.js) */
const KIT={};
{const dir=path.join(ROOT,'kits','zeijani','src');for(const f of fs.readdirSync(dir)){if(!/^\d.*\.js$/.test(f))continue;const s=fs.readFileSync(path.join(dir,f),'utf8');
  const re=/defBuilding\(\{key:'(zj_\w+)'/g;let m;while((m=re.exec(s))){const head=s.slice(m.index,s.indexOf('build(',m.index));
   const w=/[,{]w:([\d.]+),d:([\d.]+)/.exec(head),t=/types:\[([^\]]*)\]/.exec(head),wl=/wealth:'(\w+)'/.exec(head);
   KIT[m[1]]={w:w?+w[1]:null,d:w?+w[2]:null,front:/originFront:true/.test(head),types:t?t[1].replace(/'/g,'').split(','):[],wealth:wl?wl[1]:null};}}
 const sets=fs.readFileSync(path.join(ROOT,'kits','interiors','sets','zeijani.js'),'utf8'),T=[];const re=/\{ t: '(\w+)'/g;let m;while((m=re.exec(sets)))T.push(m[1]);
 for(const t of T){KIT['zj_shop_'+t+'_carved']={w:13,d:15,front:true,types:['shop'],wealth:'middle'};KIT['zj_shop_'+t+'_built']={w:11,d:10,front:false,types:['shop'],wealth:'middle'};}}
const WEALTH={poor:.25,middle:.55,rich:.9};

/* ---- geometry: a site's footprint as a quad in the plan (its def's w across, d deep: behind its front, or centred) */
function quad(D,s){const F=D.FOOT[s.key];if(!F)return null;const [w,d,o]=F;if(o==='round')return [0,1,2,3,4,5,6,7].map(k=>[s.x+Math.cos(k*PI/4)*w/2/Math.cos(PI/8),s.z+Math.sin(k*PI/4)*w/2/Math.cos(PI/8)]);const z0=o==='front'?-d:-d/2,z1=o==='front'?.5:d/2,c=Math.cos(s.ry),sn=Math.sin(s.ry);
 return [[-w/2,z0],[w/2,z0],[w/2,z1],[-w/2,z1]].map(([lx,lz])=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]);}
const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2));return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);};
function overlap(A,B){for(const P of [A,B])for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=[b[1]-a[1],a[0]-b[0]];
  const pa=A.map(p=>p[0]*n[0]+p[1]*n[1]),pb=B.map(p=>p[0]*n[0]+p[1]*n[1]);if(Math.max(...pa)<Math.min(...pb)||Math.max(...pb)<Math.min(...pa))return false;}return true;}
function gap(A,B){if(overlap(A,B))return 0;let g=1e9;for(const [P,Q] of [[A,B],[B,A]])for(const p of P)for(let i=0;i<Q.length;i++)g=Math.min(g,segD(p,Q[i],Q[(i+1)%Q.length]));return g;}
const inEllipse=(p,rx,rz,c)=>((p[0]-c[0])/rx)**2+((p[1]-c[1])/rz)**2<=1;
function cross(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;
 const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;return t>.02&&t<.98&&u>.02&&u<.98?[t,u]:null;}

/* ---- 1. the graph is connected (every node from the outpost's gate, secret ways included) */
const reach=(D,from,okE)=>{const seen={[from]:1},q=[from];while(q.length){const u=q.pop();for(const [v,i] of D.adj[u]){if(okE&&!okE(D.EDGES[i]))continue;if(!seen[v]){seen[v]=1;q.push(v);}}}return seen;};
const connected=D=>{const s=reach(D,'o.gate');return D.NODES.filter(n=>!s[n.id]).map(n=>n.id);};
{const miss=connected(DH);ok(!miss.length,'the graph is connected',DH.NODES.length+' nodes, '+DH.EDGES.length+' edges'+(miss.length?'; unreached '+miss.join(' '):''));
 const D=fresh();const i=D.EDGES.findIndex(e=>e.a==='o.portal'&&e.b==='o.tube0');D.adj['o.portal']=D.adj['o.portal'].filter(x=>x[1]!==i);D.adj['o.tube0']=D.adj['o.tube0'].filter(x=>x[1]!==i);
 neg(!connected(D).length,'the portal\'s tunnel cut leaves the city unreached',connected(D).length+' nodes unreached');}

/* ---- 2. every edge within its kind's grade; the outer tube 2 km at 1 to 3%, 8 to 12 m wide */
const steep=D=>D.EDGES.filter(e=>D.grade(e)>R.grade[e.kind]+1e-9).map(e=>e.a+'-'+e.b+' '+e.kind+' '+(D.grade(e)*100).toFixed(1)+'%');
{const s=steep(DH);ok(!s.length,'every edge within its kind\'s grade',s.join(', ')||'steepest ramp '+(Math.max(...DH.EDGES.filter(e=>e.kind==='ramp').map(DH.grade))*100).toFixed(1)+'%');
 const D=fresh();D.byId.k2.y-=40;neg(!steep(D).length,'the processional way dropped 40 m at a step');}
const tube=D=>{const E=D.EDGES.filter(e=>e.kind==='tube'&&/^(o\.tube0|t\d|t\.door)$/.test(e.a)&&/^(t\d|t\.door)$/.test(e.b));const L=E.reduce((a,e)=>a+D.len(e),0);
 return {L,ok:L>=R.tube.len[0]&&L<=R.tube.len[1]&&E.every(e=>{const g=D.grade(e);return g>=R.tube.grade[0]-1e-9&&g<=R.tube.grade[1]+1e-9&&e.w>=R.tube.w[0]&&e.w<=R.tube.w[1];})};};
{const t=tube(DH);ok(t.ok,'the outer tube: '+R.tube.len.join(' to ')+' m, 1 to 3%, 8 to 12 m wide',t.L.toFixed(0)+' m');
 const D=fresh();D.byId.t2.y+=2.5;neg(tube(D).ok,'a 5% stretch in the outer tube');}

/* ---- 3. the braid: climbs 20 to 40 m over 400 to 600 m; tubes cross at two levels or more, never at one */
function crossings(D){const out=[],E=D.EDGES.filter(e=>e.kind!=='square');for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++){const e=E[i],f=E[j];
  if(e.a===f.a||e.a===f.b||e.b===f.a||e.b===f.b)continue;const A=D.byId[e.a],B=D.byId[e.b],C=D.byId[f.a],Dd=D.byId[f.b];const x=cross([A.x,A.z],[B.x,B.z],[C.x,C.z],[Dd.x,Dd.z]);if(!x)continue;
  const y1=A.y+(B.y-A.y)*x[0],y2=C.y+(Dd.y-C.y)*x[1];out.push({e:e.a+'-'+e.b,f:f.a+'-'+f.b,sep:Math.abs(y1-y2)});}return out;}
{const b0=DH.byId.b0,hw=DH.byId['h.w'],d=DH.dist('b0',e=>e.zone!=='secret'&&!/^(l[\d.-]|l1|l2|l4|u\.w)/.test(e.a)&&e.kind!=='stair')['h.w'],rise=hw.y-b0.y;
 ok(rise>=R.braid.rise[0]&&rise<=R.braid.rise[1]&&d>=R.braid.len[0]&&d<=R.braid.len[1],'the braid climbs '+R.braid.rise.join(' to ')+' m over '+R.braid.len.join(' to ')+' m',rise.toFixed(1)+' m over '+d.toFixed(0)+' m');
 const X=crossings(DH),bad=X.filter(c=>c.sep<R.braid.sep);ok(X.length>=R.braid.crossings&&!bad.length,'tubes cross on two levels, at least '+R.braid.sep+' m apart',X.map(c=>c.e+' over '+c.f+' '+c.sep.toFixed(1)+' m').join('; '));
 const D=fresh();D.byId['u.w'].y=-12;D.byId.l1.y=-12;const B=crossings(D).filter(c=>c.sep<R.braid.sep);neg(!B.length,'the ledge\'s west tunnel brought down to the braid\'s level',B.map(c=>c.e+'/'+c.f).join(', '));}

/* ---- 4. the ways stay under the rock: 4 m of it over an 8 m passage (but in the hall, the pits, and the portal's tunnel at the west face) */
function cover(D){const out=[],H=D.HALL;for(const e of D.EDGES){if(!/^(tube|braid|ramp|stair|door)$/.test(e.kind))continue;const A=D.byId[e.a],B=D.byId[e.b];
  for(let t=0;t<=1;t+=.05){const x=A.x+(B.x-A.x)*t,z=A.z+(B.z-A.z)*t,y=A.y+(B.y-A.y)*t;
   if(inEllipse([x,z],H.rx+6,H.rz+6,H.c)||D.PITS.some(P=>Math.hypot(x-P.c[0],z-P.c[1])<P.r+6)||(x<D.PLAT.cliffX+45&&D.plateauD(x,z)<45))continue;
   const c=D.groundY(x,z)-(y+8);if(c<4)out.push(e.a+'-'+e.b+' @'+t.toFixed(2)+' '+c.toFixed(1)+' m');}}return out;}
{const c=cover(DH);ok(!c.length,'every way under 4 m of rock or more',c.slice(0,4).join(', '));
 const D=fresh();D.byId.t2.y+=80;neg(!cover(D).length,'the outer tube raised 80 m into the open');}

/* ---- 5. the square holds its list with room to walk: inside its edge, 3 m apart, half of it free, the lanes to the mouths open,
   the stalls in the pool of daylight; the wall's sites on the wall, facing in, apart, clear of the mouths */
function square(D){const H=D.HALL,S=D.SITES.filter(s=>s.district==='hub'),F=S.filter(s=>s.at==='floor'),W=S.filter(s=>s.at==='wall'),bad=[];let area=0;
 for(const s of F){const q=quad(D,s);area+=D.FOOT[s.key][2]==='round'?PI*(D.FOOT[s.key][0]/2)**2:D.FOOT[s.key][0]*D.FOOT[s.key][1];if(!q.every(p=>inEllipse(p,H.rx-R.square.margin,H.rz-R.square.margin,H.c)))bad.push(s.key+' past the edge');
  if(s.key==='zj_stall_b'&&Math.hypot(s.x-H.c[0],s.z-H.c[1])>H.pool+8)bad.push('a stall far from the daylight');}
 for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const g=gap(quad(D,S[i]),quad(D,S[j]));if(g<R.square.gap-1e-6)bad.push(S[i].key+'/'+S[j].key+' '+g.toFixed(1)+' m');}
 const free=1-area/(PI*H.rx*H.rz);if(free<R.square.free)bad.push('free '+(free*100).toFixed(0)+'%');
 for(const m of ['h.w','h.e','h.n','h.s']){const a=[D.byId['h.sq'].x,D.byId['h.sq'].z],b=[D.byId[m].x,D.byId[m].z];
  for(const s of F){if(s.park)continue;const q=quad(D,s);const d=Math.min(...q.map(p=>segD(p,a,b)));   /* the park's paths are the lanes */if(d<3||overlap(q,[a,b,[b[0]+.01,b[1]+.01],[a[0]+.01,a[1]+.01]]))bad.push(s.key+' in the lane to '+m);}}
 for(const s of W){const th=Math.atan2((s.z-H.c[1])/H.rz,(s.x-H.c[0])/H.rx),p=[H.c[0]+Math.cos(th)*H.rx,H.c[1]+Math.sin(th)*H.rz];
  if(Math.hypot(s.x-p[0],s.z-p[1])>R.wallFit.off)bad.push(s.key+' off the wall');const nn=D.hallNormal(s.x,s.z),f=Math.atan2(nn[0],nn[1]);   /* square to the wall */if(Math.abs(Math.atan2(Math.sin(s.ry-f),Math.cos(s.ry-f)))>R.wallFit.face)bad.push(s.key+' not facing in');
  for(const m of ['h.w','h.e','h.n','h.s']){const n=D.byId[m];if(Math.hypot(s.x-n.x,s.z-n.z)<D.FOOT[s.key][0]/2+10+R.wallFit.gap)bad.push(s.key+' in the mouth '+m);}}
 return {bad,free,n:S.length};}
{const q=square(DH);ok(!q.bad.length,'the square holds its list with room to walk',q.bad.join(', ')||q.n+' sites, '+(q.free*100).toFixed(0)+'% of the square free');
 const D=fresh();const g=D.SITES.find(s=>s.key==='zj_guard_hq');g.x-=14;neg(!square(D).bad.length,'the guard headquarters pushed into a shop',square(D).bad.slice(0,2).join(', '));
 const D2=fresh();D2.SITES.find(s=>s.key==='zj_kiva'&&s.district==='hub').z=4;neg(!square(D2).bad.length,'the kiva set in the west lane',square(D2).bad.slice(0,2).join(', '));}

/* ---- 6. every site names a def of the kit, and the layout's footprint is the def's */
function kitMatch(D){const bad=[];for(const s of D.SITES){const K=KIT[s.key],F=D.FOOT[s.key];if(!K){bad.push(s.key+' is no def');continue;}
  if(!F||F[0]!==K.w||F[1]!==K.d||(F[2]==='front')!==K.front)bad.push(s.key+' footprint '+JSON.stringify(F)+' vs '+K.w+'x'+K.d+(K.front?' front':''));}return [...new Set(bad)];}
{const b=kitMatch(DH);ok(!b.length,'every site is a kit def, its footprint the def\'s',b.join(', ')||Object.keys(DH.FOOT).length+' keys');
 const D=fresh();D.FOOT.zj_temple=[40,52,'front'];neg(!kitMatch(D).length,'the temple 8 m too narrow');}

/* ---- 7. the districts' lists: the hub's, each satellite's (and its pit: 250 to 450 m out, 60 to 90 m across, 25 to 40 m deep),
   the outpost's; the cistern near the hub; the catacombs far and deep */
const count=(S,pat)=>pat==='dwelling'?S.filter(s=>KIT[s.key]&&KIT[s.key].types.some(t=>/^dwelling/.test(t))).length:
 S.filter(s=>pat.split('|').some(p=>new RegExp('^'+p.replace(/\*/g,'\\w+')+'$').test(s.key))).length;
function lists(D){const bad=[];for(const Di of D.DISTRICTS){const S=D.SITES.filter(s=>s.district===Di.id);
  for(const k in Di.needs||{}){const need=Di.needs[k],n=count(S,k),[lo,hi]=Array.isArray(need)?need:[need,1e9];if(n<lo||n>hi)bad.push(Di.id+' '+k+' '+n);}
  if(Di.kind==='satellite'){const P=D.PITS.find(p=>p.id===Di.pit),r=R.satellite;if(Di.dist<r.dist[0]||Di.dist>r.dist[1])bad.push(Di.id+' at '+Di.dist+' m');
   if(2*P.r<r.across[0]||2*P.r>r.across[1])bad.push(Di.id+' '+2*P.r+' m across');if(P.depth<r.depth[0]||P.depth>r.depth[1])bad.push(Di.id+' '+P.depth+' m deep');
   for(const s of S){if(Math.hypot(s.x-P.c[0],s.z-P.c[1])>P.r+R.wallFit.off+.01)bad.push(s.key+' outside '+Di.id);}}
  if(Di.kind==='cistern'&&Di.dist>R.cistern.dist[1])bad.push('the cistern '+Di.dist+' m out');
  if(Di.kind==='catacombs'){const n=D.byId[Di.anchor],dp=D.HALL.y-n.y;if(Di.dist<R.catacombs.dist[0]||Di.dist>R.catacombs.dist[1]||dp<R.catacombs.depth[0]||dp>R.catacombs.depth[1])bad.push('the catacombs '+Di.dist+' m out, '+dp+' m down');}}
 const cara=D.SITES.find(s=>s.key==='zj_caravanserai');if(cara&&Math.min(...D.STREAM.slice(1).map((p,i)=>segD([cara.x,cara.z],D.STREAM[i],p)))>30)bad.push('the caravanserai off the stream');
 return bad;}
{const b=lists(DH);ok(!b.length,'each district holds its list; the pits, the cistern and the catacombs where they should be',b.join(', ')||DH.DISTRICTS.map(d=>d.id+' '+d.dist+' m').join(', '));
 const D=fresh();D.SITES=D.SITES.filter(s=>!(s.key==='zj_smithy'&&s.district==='s2'));neg(!lists(D).length,'the south well without its smithy',lists(D).join(', '));
 const D2=fresh();D2.SITES=D2.SITES.filter(s=>s.key!=='zj_caravanserai');neg(!lists(D2).length,'the outpost without its caravanserai',lists(D2).join(', '));
 const D3=fresh();D3.DISTRICTS.find(d=>d.id==='catacombs').dist=320;neg(!lists(D3).length,'the catacombs 320 m out',lists(D3).join(', '));}

/* ---- 8. wealth falls with the distance from the square: the rule's wealth by district, and the mean of each district's
   dwellings (their defs' wealth) never rising outward */
function wealth(D){const bad=[],Ds=D.DISTRICTS.filter(d=>/hub|satellite|outpost/.test(d.kind)).sort((a,b)=>a.dist-b.dist);
 for(const d of Ds)if(Math.abs(d.wealth-D.wealthAt(d.dist))>.02)bad.push(d.id+' wealth '+d.wealth+' vs the rule '+D.wealthAt(d.dist));
 const mean=d=>{const S=D.SITES.filter(s=>s.district===d.id&&KIT[s.key]&&KIT[s.key].types.some(t=>/^dwelling/.test(t)));return S.length?S.reduce((a,s)=>a+WEALTH[KIT[s.key].wealth],0)/S.length:null;};
 let pw=1e9,pm=1e9;for(const d of Ds){if(d.wealth>pw+1e-9)bad.push(d.id+' richer than nearer');pw=d.wealth;const m=mean(d);if(m!==null){if(m>pm+1e-9)bad.push(d.id+'\'s homes richer than nearer ('+m.toFixed(2)+')');pm=m;}}
 return {bad,Ds,mean};}
{const w=wealth(DH);ok(!w.bad.length,'wealth falls with the distance from the square',w.bad.join(', ')||w.Ds.map(d=>d.id+' '+d.wealth+(w.mean(d)!==null?'/'+w.mean(d).toFixed(2):'')).join(', '));
 const D=fresh();D.SITES.push({key:'zj_estate_a',district:'s3',x:0,z:0,ry:0,y:0,at:'wall'});neg(!wealth(D).bad.length,'an estate in the east well',wealth(D).bad.join(', '));}

/* ---- 9. the foreigners' zone ends at the stone door: the outer ways from the gate reach the stone door and nothing past it, and the
   only way on is the door, which closes */
function outer(D){const s=reach(D,'o.gate',e=>e.zone==='outer'),bad=[];if(!s['t.door'])bad.push('the stone door not reached');
 for(const id in s)if(!/^(o\.|t\d|t\.)/.test(id))bad.push(id+' inside the outer zone');
 const leave=D.EDGES.filter(e=>(s[e.a]?1:0)+(s[e.b]?1:0)===1&&e.zone!=='secret');if(leave.length!==1||leave[0].door!=='stonedoor')bad.push('ways on: '+leave.map(e=>e.a+'-'+e.b).join(' '));
 return {bad,n:Object.keys(s).length};}
{const o=outer(DH);ok(!o.bad.length,'the foreigners\' zone ends at the stone door',o.bad.join(', ')||o.n+' nodes outside it');
 const D=fresh();D.EDGES.push({a:'t2',b:'a1',kind:'tube',w:4,zone:'outer'});D.adj.t2.push(['a1',D.EDGES.length-1]);D.adj.a1.push(['t2',D.EDGES.length-1]);
 neg(!outer(D).bad.length,'a side passage round the stone door',outer(D).bad.slice(0,3).join(', '));}

/* ---- 10. the outpost's sites apart (the palisade's runs join end to end), the wall sites on the cliff and facing west */
function outpost(D){const S=D.SITES.filter(s=>s.district==='outpost'),bad=[];
 for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const a=S[i],b=S[j];if(/zj_palisade|zj_gate/.test(a.key)&&/zj_palisade|zj_gate/.test(b.key))continue;
  const g=gap(quad(D,a),quad(D,b));if(g<1)bad.push(a.key+'/'+b.key+' '+g.toFixed(1)+' m');}
 for(const s of S.filter(s=>s.at==='wall'))if(s.x<D.PLAT.cliffX-7||s.x>D.PLAT.cliffX+1||Math.abs(s.ry+PI/2)>R.wallFit.face)bad.push(s.key+' off the cliff');return bad;}
{const b=outpost(DH);ok(!b.length,'the outpost\'s sites apart, the cliff\'s on the cliff',b.join(', ')||DH.SITES.filter(s=>s.district==='outpost').length+' sites');
 const D=fresh();Object.assign(D.SITES.find(s=>s.key==='zj_barracks_outpost'),(h=>({x:h.x,z:h.z}))(D.SITES.find(s=>s.key==='zj_house_wood')));neg(!outpost(D).length,'the barracks moved onto the timber house',outpost(D).slice(0,2).join(', '));}
/* ---- 11. the palisade's runs lie tangent to their ring with the bank (each run's front) facing out */
function palisade(D){const P=D.PAL,bad=[];
 /* the straight runs from the ring's ends to the cliff: their last one reaches the cliff, and they face out of the clearing */
 for(const sz of [-1,1]){const L=D.SITES.filter(s=>s.line&&Math.sign(s.z)===sz);if(!L.length||Math.max(...L.map(s=>s.x))+6.5<D.PLAT.cliffX)bad.push('the '+(sz<0?'north':'south')+' run stops short of the cliff');
  for(const s of L)if(Math.cos(s.ry)*sz<.98)bad.push('a straight run facing in');}for(const s of D.SITES.filter(s=>s.key==='zj_palisade'&&!s.line)){const r=Math.hypot(s.x-P.c[0],s.z-P.c[1]),ox=(s.x-P.c[0])/r,oz=(s.z-P.c[1])/r;
  if(Math.sin(s.ry)*ox+Math.cos(s.ry)*oz<.98)bad.push(s.x.toFixed(0)+','+s.z.toFixed(0));}return bad;}
{const b=palisade(DH);ok(!b.length,'the palisade\'s runs tangent, their bank outward',b.length?b.length+' turned wrong, first at '+b[0]:DH.SITES.filter(s=>s.key==='zj_palisade').length+' runs');
 const D=fresh();D.SITES.filter(s=>s.key==='zj_palisade').forEach(s=>s.ry+=PI/2);neg(!palisade(D).length,'every run turned a quarter',palisade(D).length+' turned wrong');}
/* ---- 12. each well's sites apart and inside it, and its ways (the street from each entrance to its middle) clear of them */
function wells(D){const bad=[];for(const P of D.PITS){const S=D.SITES.filter(s=>s.district===P.id);
  for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const g=gap(quad(D,S[i]),quad(D,S[j]));if(g<2)bad.push(P.id+' '+S[i].key+'/'+S[j].key+' '+g.toFixed(1)+' m');}
  const F=S.filter(s=>s.at!=='wall');for(const s of F)if(quad(D,s).some(p=>Math.hypot(p[0]-P.c[0],p[1]-P.c[1])>P.r-3))bad.push(P.id+' '+s.key+' against the wall');
  for(const e of D.EDGES){const a=D.byId[e.a],b=D.byId[e.b];if(e.kind!=='street'||Math.hypot(a.x-P.c[0],a.z-P.c[1])>P.r+1||Math.hypot(b.x-P.c[0],b.z-P.c[1])>P.r+1)continue;
   for(const s of F){const q=quad(D,s),d=Math.min(...q.map(p=>segD(p,[a.x,a.z],[b.x,b.z])));if(d<2||overlap(q,[[a.x,a.z],[b.x,b.z],[b.x+.01,b.z+.01],[a.x+.01,a.z+.01]]))bad.push(P.id+' '+s.key+' on the way '+e.a+'-'+e.b);}}}
 return bad;}
{const b=wells(DH);ok(!b.length,'each well\'s sites apart and inside it, its ways clear',b.join(', ')||DH.PITS.map(P=>P.id+' '+DH.SITES.filter(s=>s.district===P.id).length+' sites').join(', '));
 const D=fresh();const h=D.SITES.find(s=>s.key==='zj_house_built_mid'&&s.district==='s2'),f=D.SITES.find(s=>s.key==='zj_farm_veg'&&s.district==='s2');Object.assign(h,{x:f.x+3,z:f.z});
 neg(!wells(D).length,'the south well\'s homes moved onto its field',wells(D).slice(0,2).join(', '));}

/* ---- the layout's digest: a change that moves a node or a site is seen (rewrite: --write; through tools/node_in_chromium.py pass
   it twice, `--write --write`: the shim takes the first to allow the file write, the test reads the second) */
let h=0x811C9DC5;const feed=v=>{const s=String(v);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);};
DH.NODES.forEach(n=>[n.id,n.x,n.y,n.z].forEach(feed));DH.SITES.forEach(s=>[s.key,s.x,s.z,s.ry,s.y].forEach(feed));const dig=(h>>>0).toString(16);
const GOLD=path.join(__dirname,'golden.json');
if(process.argv.includes('--write')){fs.writeFileSync(GOLD,JSON.stringify({digest:dig},null,1)+'\n');console.log('  wrote '+dig);}
else if(fs.existsSync(GOLD)){const g=JSON.parse(fs.readFileSync(GOLD,'utf8'));ok(g.digest===dig,'the layout matches its golden digest',dig+(g.digest===dig?'':' vs '+g.digest+' (rewrite with --write if the move is meant)'));}
console.log(fail?'\n'+fail+' FAILED':'\nall passed');process.exit(fail?1:0);
