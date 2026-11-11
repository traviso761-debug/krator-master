// ================================================================= WILDCAT'S HOST API: TG.fg.pueblo and its kin (API.md, "Wildcat")
// What a world calls to draw a scrap pueblo from core/pueblo's plan, as TG.fg.draw draws a village from core/hamlet's:
//   TG.fg.wildcat()              the great house's plan (KPUEBLO.house(FG_WC.GREAT), built once); TG.fg.wildcatHamlets() the two
//                                hamlets'; TG.fg.wcSpec the specs (FG_WC), so a world can build its own plan
//   TG.fg.puebloRegister(P, T, o) the house's record and every room, kiva, ladder, plaza and piece of dress in core/tags
//                                registry T, before the draw (o {x, z, ry, ground, key, name}); returns {house, count}
//   TG.fg.pueblo(P, o)           draws it, DRY, at o.x, o.z, o.ry on o.ground: the floor at the highest ground under the
//                                footprint's hull (a knoll's flattened top), each column's footing down to its own ground;
//                                and its stockade on P.enclosure's ring unless o.stockade === false. Returns the meshes
//                                (fgDrawInto's: .group, .recs, .tris, .lights, .smokes) with .plan and .dress
//   TG.fg.check.pueblo(P, recs)  the plan's invariants (KPUEBLO.check) and the draw's counts, for a world's --assert
function fgWcSeat(P,o){const G=o.ground||terrainH,x=o.x==null?0:o.x,z=o.z==null?0:o.z,ry=o.ry==null?0:o.ry,c=Math.cos(ry),s=Math.sin(ry);
 const wx=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];let top=G(x,z),low=top;
 for(const p of P.hull){const q=wx(p[0],p[1]),g=G(q[0],q[1]);top=Math.max(top,g);low=Math.min(low,g);}
 return {x,z,ry,y:top,low,lo:low-top-.5,wx,gl:(lx,lz)=>{const q=wx(lx,lz);return G(q[0],q[1])-top;}};}
function fgWcKey(P,o){return o.key||(P.cells.length>150?'fg-wc-greathouse':'fg-wc-hamlet');}
TG.fg.wcSpec=FG_WC;
TG.fg.wildcat=()=>fgWcPlan(FG_WC.GREAT);
TG.fg.wildcatHamlets=()=>FG_WC.HAMLETS.map(fgWcPlan);
TG.fg.puebloRegister=function(P,T,o){o=o||{};const S=fgWcSeat(P,o),key=fgWcKey(P,o),D=DEFS[key],name=o.name||D.name;
 const house=T.add({'class':D.cls,kind:key,key,name,at:[S.x,S.y,S.z],ry:S.ry,size:[P.bounds.w,P.bounds.d,P.bounds.h],tags:Object.assign({},D.tags),
  note:'a scrap pueblo drawn by TG.fg.pueblo from core/pueblo\'s plan '+P.id+' ('+P.census.pop+' people in '+P.census.rooms+' rooms)',frag:KIT.frag});
 const at=(lx,ly,lz)=>{const q=S.wx(lx,lz);return [+q[0].toFixed(4),+(S.y+ly).toFixed(4),+q[1].toFixed(4)];};
 let n=fgWcRegister(P,o.dress||fgWcDress(P),T,house.id,at,S.ry,name);
 if(P.enclosure&&o.stockade!==false){const D2=DEFS['fg-wc-stockade'];T.child(house.id,{'class':D2.cls,kind:'fg-wc-stockade',key:'fg-wc-stockade',name:name+': the stockade',at:[S.x,S.y,S.z],ry:S.ry,
  size:[P.bounds.w+2*P.enclosure.margin,P.bounds.d+2*P.enclosure.margin,3],tags:Object.assign({},D2.tags),frag:KIT.frag});n++;}
 return {house,count:n};};
TG.fg.pueblo=function(P,o){o=o||{};const S=fgWcSeat(P,o),key=fgWcKey(P,o),dress=o.dress||fgWcDress(P);
 const out=fgDrawInto(Object.assign({name:'fellgang:'+P.id,label:o.label||DEFS[key].name+' (a Fellgang scrap pueblo, core/pueblo)'},o),()=>{
  const recs=[place(key,S.x,S.z,S.ry,{y:S.y,lo:S.lo,gl:S.gl,plan:P,dress,state:o.state})];
  if(P.enclosure&&o.stockade!==false)recs.push(place('fg-wc-stockade',S.x,S.z,S.ry,{y:S.y,lo:S.lo,gl:S.gl,ring:P.enclosure,state:o.state}));
  recs.forEach(r=>{if(r){r.id=P.id+(r.key==='fg-wc-stockade'?':stockade':'');r.top=S.y;r.low=S.low;}});return recs;});
 out.plan=P;out.dress=dress;return out;};
TG.fg.check.pueblo=function(P,recs){const C=KPUEBLO.checkAll(P),bad=Object.keys(C).filter(k=>!C[k].ok).map(k=>k+': '+C[k].bad.slice(0,3).join('|'));
 const r=(recs||[]).find(q=>q&&q.fg&&q.fg.plan===P.id),S=r&&r.fg||{};
 if(!r)bad.push('not drawn');else{if(S.cells!==P.cells.length)bad.push('cells drawn '+S.cells+' of '+P.cells.length);
  if(S.kivas!==P.kivas.length)bad.push('kivas drawn '+S.kivas+' of '+P.kivas.length);
  if(S.doors!==P.rooms.filter(q=>q.face==='door').length)bad.push('doors drawn '+S.doors);
  if(S.hatches!==P.hatches.length)bad.push('hatches drawn '+S.hatches);}
 return {ok:!bad.length&&!P.errors.length,bad:bad.concat(P.errors),census:P.census,drawn:S};};
