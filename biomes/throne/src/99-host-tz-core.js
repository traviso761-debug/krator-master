// ================================================================= HOST — the universal set's checks (2026-11-02, the final rebuild; every page)
// After KHOST.take (99-host-take.js: window._api is made), before the tail: the environmental fields' checks join the page's own (verify.py --assert
// runs hostChecks and hostNegatives), each with a broken input that must fail:
//   the fields     BIO.envCheck: every value of ENV (89x) inside the contract's range at the map's middle and three points round it
//   the water's edge   WATER.edgeAudit on the trees (THRONE.TREES, and the hyperjungle's where the page has it): none in the water the eye sees,
//                  the ones that stand in it on purpose (the brimstone candelabras in the marsh, the mangroves in the lagoon) excepted; and the wet
//                  field reaching the real edge (wet-short). A page with no water has the fields' check alone
(function(){const api=window._api;if(!api)return;
 const P0=[[0,0],[TERR.R*.5,0],[0,-TERR.R*.5],[-TERR.R*.45,TERR.R*.3]];
 const AQUA=['brimstone','mangrove'];
 const trees=()=>{const o=[];(THRONE.TREES||[]).forEach(T=>{const S=THRONE.SPECIES[T.sp];o.push({x:T.x,z:T.z,r:Math.max(.3,(T.rb==null?.3:T.rb)),name:S.key,aquatic:AQUA.indexOf(S.key)>=0});});
  if(typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE.TREES)HYPERJUNGLE.TREES.forEach(T=>{if(T&&T.lv>0)o.push({x:T.x,z:T.z,r:Math.max(.3,(T.rb==null?.3:T.rb)),name:'hyperjungle'});});return o;};
 const envCk=(E,pts)=>{const bad=BIO.envCheck(E,pts);return{ok:!bad.length,detail:bad.length?bad.length+' out of range (first '+bad[0].name+' '+bad[0].value+' at '+[bad[0].x|0,bad[0].z|0]+')':
  Object.keys(E).length+' fields in range at '+pts.length+' points ('+Object.keys(E).join(', ')+')'};};
 const edgeCk=(plants)=>{if(!WATER_F)return null;const F=WATER.edgeAudit({field:WATER_F,plants,wet:(x,z)=>FIELD.wet(x,z),band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]==null?0:N[f.rule])+1;});
  return{ok:!F.length,detail:F.length?Object.keys(N).map(k=>k+' '+N[k]).join(', ')+' (first '+(F[0].name||F[0].rule)+' at '+[F[0].x|0,F[0].z|0]+')':plants.length+' trees clear of the water, the wet field at its edge'};};
 const hc=api.hostChecks,hn=api.hostNegatives;
 api.hostChecks=function(){const R=hc?hc.apply(this,arguments):[];
  R.push(Object.assign({name:'the environmental fields in the contract (BIO.envCheck)'},envCk(ENV,P0)));
  const e=edgeCk(trees());if(e)R.push(Object.assign({name:'the trees and the wet field read the water\'s own shore (WATER.edgeAudit)'},e));return R;};
 api.hostNegatives=function(){const R=hn?hn.apply(this,arguments):[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
  add('a field out of its range',envCk(Object.assign({},ENV,{temp:()=>5000}),P0));
  if(WATER_F){let w=null;for(let k=0;k<4000&&!w;k++){const x=ENV_BOX[0]+(k%63+.5)/63*(ENV_BOX[2]-ENV_BOX[0]),z=ENV_BOX[1]+(Math.floor(k/63)+.5)/63*(ENV_BOX[3]-ENV_BOX[1]);if(shoreAt(x,z)<-2)w=[x,z];}
   if(w)add('a tree in the water',edgeCk([{x:w[0],z:w[1],r:1,name:'test'}]));}
  return R;};})();
