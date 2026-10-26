// prefix: res
// ================================================================= THE SCARCITY LEDGER: what each polity holds, and the fairness audit
// kits/resources/PLACEMENT-RESEARCH.md feature 4. [G data]: no three.js, no DOM. It reads the node field (45r-res-field.js,
// RES_GEO) and the baked polities and settlements (geology.json), and sums, per polity (the scale model's political
// regions) and per settlement (its catchment: a day's travel round it), the nodes by kind and grade. core/simulation's
// trade takes it as an input: what a town may send, and what it must buy (RES_LEDGER.tradeGoods: SIM.trade's `goods`).
//   RES_LEDGER.build(o) -> {polities: {name: {...}}, settlements: {name: {...}}, world: {kind: n}, audit}
//     o: {dayKm (30: a day's travel), families (the node kinds), basics (BASIC), fields ([{kind, poly (map px), cap}]),
//         surplus (2: see exports)}
//     a polity: {area_km2, cells, settlements: [names], nodes: {kind: {low, medium, high, n, yield}} (its whole territory),
//                reach: {kind: n} (the nodes its towns reach: their catchments summed, or its centroid's when it has no
//                town), imports: [kinds no town of it reaches: it must buy them], exports: [kinds its towns reach `surplus`
//                times the mean polity's, 3 at least], basics: {ok, missing: [{settlement, lack: [...]}]}}
//     a settlement: {polity, px, py, catchment: {kind: n}, basics: {stone, wood, water, salt}, ok}
//     audit: {ok, failures: [text]}: every polity's settlements have the basics within a day's travel; every polity has at
//            least one kind it must import (no polity has everything: Anno's rule); a polity with no settlement is audited
//            at its centroid
//   RES_LEDGER.BASIC                 the basics and the rule for each (a family byte over a threshold in reach; salt also
//                                    the sea, or any evaporite node in reach)
//   RES_LEDGER.items(kinds)          the goods (RES_ORE item names) of a list of kinds
//   RES_LEDGER.tradeGoods(L, towns, also)  towns {settlement id: polity name}, also {settlement id: [its own goods: crops,
//                                    wares]} -> {settlement id: [goods it may send]}, SIM.trade's `goods` (77-sim-6-trade.js,
//                                    which then sends nothing else): a town's own list plus its polity's surplus kinds
//   RES_LEDGER.wants(L, polity)      the goods the polity must import
const RES_LEDGER=(function(){
 const B={dayKm:30,surplus:2,
  basics:{stone:{family:'stone',min:120},wood:{family:'wood',min:80},water:{family:'water',min:80},
   salt:{family:'halite',min:1,sea:true,kinds:['halite','potash','alkali','gypsum']}}};
 function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
 function bbox(P){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}return [x0,y0,x1,y1];}
 function blank(kinds){const o={};for(const k of kinds)o[k]={low:0,medium:0,high:0,n:0,yield:0};return o;}
 function count(o,n){const r=o[n.kind];if(!r)return;r[n.grade]++;r.n++;r.yield+=RES_ORE.grades[n.grade].yield;}
 /* the basics within r km of a point in map px: a family's byte over its threshold in some cell in reach */
 function basicsAt(px,py,dayKm,nodes,bs){const D=RES_GEO.data(),cs=D.grid.cell_km,su=(D.grid.w-1)/(D.grid.fullW-1),sv=(D.grid.h-1)/(D.grid.fullH-1);
  const ci=Math.floor(px*su+.5),cj=Math.floor(py*sv+.5),R=Math.ceil(dayKm/cs),out={};
  for(const k in bs)out[k]=false;
  for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){if(Math.hypot(di,dj)*cs>dayKm)continue;const i=ci+di,j=cj+dj;if(i<0||j<0||i>=D.grid.w||j>=D.grid.h)continue;
   const gx=i/su*D.grid.px_m,gz=j/sv*D.grid.px_m,c=RES_GEO.at(gx,gz);
   for(const k in bs){if(out[k])continue;const b=bs[k];if(c.p[b.family]>=b.min&&!(c.mask&1&&b.family!=='water'))out[k]=true;
    else if(b.sea&&(c.mask&8))out[k]=true;}}
  for(const k in bs){const b=bs[k];if(!out[k]&&b.kinds)for(const n of nodes){if(b.kinds.indexOf(n.kind)>=0){out[k]=true;break;}}}
  return out;}
 const L={BASIC:B.basics};
 L.items=function(kinds){const s=[];for(const k of kinds){const K=RES_ORE.kinds[k];if(K&&s.indexOf(K.item)<0)s.push(K.item);}return s;};
 L.build=function(o){o=o||{};const D=RES_GEO.data(),dayKm=o.dayKm==null?B.dayKm:o.dayKm,sur=o.surplus==null?B.surplus:o.surplus,bs=o.basics||B.basics;
  const kinds=(o.families||D.field.families).filter(k=>RES_ORE.kinds[k]),pm=D.grid.px_m,cs=D.grid.cell_km;
  const out={dayKm:dayKm,kinds:kinds,polities:{},settlements:{},world:{},audit:{ok:true,failures:[]}};
  for(const k of kinds)out.world[k]=0;let landCells=0;
  const su=(D.grid.w-1)/(D.grid.fullW-1),sv=(D.grid.h-1)/(D.grid.fullH-1);
  for(const P of D.polities){const bb=bbox(P.points);
   const nodes=RES_GEO.nodesIn({x0:bb[0]*pm,z0:bb[1]*pm,x1:bb[2]*pm,z1:bb[3]*pm},{families:kinds}).filter(n=>inPoly(P.points,n.gx/pm,n.gz/pm));
   let cells=0;for(let j=Math.floor(bb[1]*sv);j<=Math.ceil(bb[3]*sv);j++)for(let i=Math.floor(bb[0]*su);i<=Math.ceil(bb[2]*su);i++){
    if(!inPoly(P.points,i/su,j/sv))continue;const c=RES_GEO.at(i/su*pm,j/sv*pm);if(c&&!(c.mask&1))cells++;}
   const R={area_km2:Math.round(cells*cs*cs),cells:cells,settlements:[],nodes:blank(kinds),imports:[],exports:[],basics:{ok:true,missing:[]}};
   for(const n of nodes){count(R.nodes,n);out.world[n.kind]++;}
   if(o.fields)for(const f of o.fields){const c=f.poly.reduce((a,p)=>[a[0]+p[0]/f.poly.length,a[1]+p[1]/f.poly.length],[0,0]);
    if(inPoly(P.points,c[0],c[1])){R.fields=R.fields||{};R.fields[f.kind]=(R.fields[f.kind]||0)+(f.cap||0);}}
   landCells+=cells;out.polities[P.name]=R;}
  for(const S of D.settlements){let pol=null;for(const P of D.polities)if(inPoly(P.points,S.px,S.py)){pol=P.name;break;}
   const r=dayKm*1000,gx=S.px*pm,gz=S.py*pm;
   const nodes=RES_GEO.nodesIn({x0:gx-r,z0:gz-r,x1:gx+r,z1:gz+r},{families:kinds}).filter(n=>Math.hypot(n.gx-gx,n.gz-gz)<=r);
   const cat={};for(const n of nodes)cat[n.kind]=(cat[n.kind]||0)+1;
   const bas=basicsAt(S.px,S.py,dayKm,nodes,bs),ok=Object.keys(bas).every(k=>bas[k]);
   let nm=S.name;if(out.settlements[nm])nm=S.name+' @'+S.px+','+S.py;
   out.settlements[nm]={polity:pol,px:S.px,py:S.py,type:S.type,catchment:cat,basics:bas,ok:ok};
   if(pol){const R=out.polities[pol];R.settlements.push(nm);if(!ok){R.basics.ok=false;R.basics.missing.push({settlement:nm,lack:Object.keys(bas).filter(k=>!bas[k])});}}}
  for(const P of D.polities){const R=out.polities[P.name];R.reach={};for(const k of kinds)R.reach[k]=0;
   if(!R.settlements.length){let cx=0,cy=0;for(const p of P.points){cx+=p[0]/P.points.length;cy+=p[1]/P.points.length;}
    const r=dayKm*1000;const nodes=RES_GEO.nodesIn({x0:cx*pm-r,z0:cy*pm-r,x1:cx*pm+r,z1:cy*pm+r},{families:kinds}).filter(n=>Math.hypot(n.gx-cx*pm,n.gz-cy*pm)<=r);
    for(const n of nodes)R.reach[n.kind]++;
    const bas=basicsAt(cx,cy,dayKm,nodes,bs);R.centroid=[Math.round(cx*10)/10,Math.round(cy*10)/10];
    if(!Object.keys(bas).every(k=>bas[k])){R.basics.ok=false;R.basics.missing.push({settlement:null,lack:Object.keys(bas).filter(k=>!bas[k])});}}
   else for(const nm of R.settlements){const c=out.settlements[nm].catchment;for(const k in c)R.reach[k]+=c[k];}}
  /* what its towns reach: a kind no town of it reaches it must buy; a kind its towns reach `surplus` times the mean polity's
     (and at least 3 nodes) it can sell */
  const pn=D.polities.map(P=>P.name),avg={};for(const k of kinds)avg[k]=pn.reduce((a,p)=>a+out.polities[p].reach[k],0)/Math.max(1,pn.length);
  for(const p of pn){const R=out.polities[p];
   for(const k of kinds){const n=R.reach[k];if(!n)R.imports.push(k);else if(n>=3&&n>=sur*avg[k])R.exports.push(k);}
   if(!R.basics.ok)R.basics.missing.forEach(m=>out.audit.failures.push(p+': '+(m.settlement||'(no settlement; its centroid)')+' lacks '+m.lack.join(', ')+' within '+dayKm+' km'));
   if(!R.imports.length)out.audit.failures.push(p+': its towns reach every kind, it imports nothing');}
  out.audit.ok=!out.audit.failures.length;return out;};
 L.wants=function(Lg,pol){const R=Lg.polities[pol];return R?L.items(R.imports):[];};
 L.tradeGoods=function(Lg,towns,also){const g={};for(const id in towns){const R=Lg.polities[towns[id]],s=(also&&also[id]||[]).slice();
  if(R)for(const it of L.items(R.exports))if(s.indexOf(it)<0)s.push(it);g[id]=s;}return g;};
 return L;})();
globalThis.RES_LEDGER=RES_LEDGER;
