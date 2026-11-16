/* ================================================================= THEODIGA TODAY: the town's interiors (records; draws nothing)
   [G data] T-town-7 (the owner, 2026-11-16: "Town interiors"; kits/ancients KNOWN_ISSUES "The town has no interiors"). Every scrap
   building the town placed (thTownDraw.placed: its key, variant, plot centre, turn and base height) takes its rooms from the
   Scrap Xanadu interior set (kits/interiors sets/xanadu-scrap.js; Lantern House, Panel Row, Hull House ...) through
   IX.sets.instantiate. Each (key, variant) is planned ONCE at the origin, unturned, and furnished once (o.furnish, a room ->
   its placer plan, or null); every placement then turns and moves that plan onto its plot (three.js's rotation.y by its ry,
   raised by its base), so 440 buildings cost the planner and the placer their few dozen distinct kinds. The Qiblai buildings
   and the scrap set's skipped defs (the Cistern Pavilion, the Granary) have no rooms here.
   The buildings are gathered into one SITE a quarter (the cut-away opens a quarter), each in the shape kits/ancients-interiors'
   plans have (AI.planRooms, AI.storeyAudit read it): {id, name, key, culture, wealth, types, storeys:[{id, level, y, h, outline,
   rooms, walls:[]}], inside(x, z, y), outer}, with what the host draws on opening beside it (walls with their openings, floors).
   TH_TOWN_ROOMS.make(o) -> {sites:[{id, quarter, buildings, box:[x0,x1,z0,z1], storeys:[{id, y, h}], furniture:{rooms, pieces,
     templates}}], skipped:{key: n}, kinds}
     o.placed  thTownDraw.placed; o.IX KratorInteriors (with the set); o.furnish(room) -> plan | null; o.name(quarter) */
var TH_TOWN_ROOMS=(function(){
 const R3=v=>Math.round(v*1000)/1000;
 /* a point of the building's frame turned by ry (three.js rotation.y) and moved to its plot */
 const at=(P,q)=>[R3(P.x+q[0]*P.c+q[1]*P.s),R3(P.z-q[0]*P.s+q[1]*P.c)];
 const inPoly=(p,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
 const nearEdge=(p,P,m)=>{for(let i=0,j=P.length-1;i<P.length;j=i++)if(segD(p,P[j],P[i])<=m)return true;return false;};
 function make(o){const IX=o.IX,SET=IX&&IX.sets&&IX.sets.byName[o.set||'xanadu-scrap'],cache=new Map(),sites=new Map(),skipped={};let kinds=0;
  if(!SET)return {sites:[],skipped,kinds};
  for(const r of o.placed){if(!/^xa_scrap_/.test(r.key))continue;
   const it=SET.forDef(r.key,r.v);if(!it||it.skip){skipped[r.key]=(skipped[r.key]||0)+1;continue;}
   const ck=it.key+'|'+(r.v|0);let T=cache.get(ck);
   if(!T){const inst=IX.sets.instantiate(it,0,0,0,{baseY:0,register:false,seed:0});T={item:it,inst,plans:{},tpl:ck};kinds++;
    for(const B of inst.buildings)for(const R of B.rooms)T.plans[R.id]=o.furnish&&R.kind!=='corridor'?o.furnish(R):null;cache.set(ck,T);}
   const P={x:r.x,z:r.z,c:Math.cos(r.ry),s:Math.sin(r.ry)},q=r.quarter||'works',y0=r.y;
   if(!sites.has(q))sites.set(q,{id:'town/'+q,quarter:q,name:o.name?o.name(q):q,buildings:[],furniture:{rooms:[],pieces:0,templates:0},tpls:new Set()});
   const S=sites.get(q);
   T.inst.buildings.forEach((B,bi)=>{const id=r.id+(T.inst.buildings.length>1?'.'+bi:'');
    const room=R=>Object.assign({},R,{id:id+'.'+R.id,building:id,poly:R.poly.map(p=>at(P,p)),doors:(R.doors||[]).map(d=>Object.assign({},d,{at:at(P,d.at)})),
     y:R3(y0+(R.y||0)),fixtures:(R.fixtures||[]).map(f=>Object.assign({},f,f.x==null?{}:(()=>{const w=at(P,[f.x,f.z]);return {x:w[0],z:w[1],ry:(f.ry||0)+r.ry};})())),
     furnish:R.kind!=='corridor',origin:R.id});
    const rooms=B.rooms.map(room),outer=B.outer.map(p=>at(P,p)),yTop=y0+Math.max(...B.levels.map(L=>L.y+L.h))+.5;
    const storeys=B.levels.map(L=>({id:id+'.L'+L.k,level:L.k,y:R3(y0+L.y),h:L.h,outline:(L.outer||B.outer).map(p=>at(P,p)),rooms:rooms.filter(R=>R.level===L.k),walls:[]}));
    S.buildings.push({id,name:r.name,key:r.key,v:r.v|0,culture:B.culture||it.culture,wealth:B.wealth==null?it.wealth:B.wealth,types:it.types||r.types||['dwelling'],
     storeys,outer,floors:true,
     inside:(x,z,y)=>y>=y0-.5&&y<=yTop&&(inPoly([x,z],outer)||nearEdge([x,z],outer,.3)),
     walls:B.walls.map(W=>({kind:W.kind,a:at(P,W.a),b:at(P,W.b),thick:W.thick,y:R3(y0+W.y),h:W.h,openings:W.openings||[]})),
     floorPolys:(B.floors||[]).map(F=>({y:R3(y0+F.y),poly:F.poly.map(p=>at(P,p)),holes:(F.holes||[]).map(h=>h.map(p=>at(P,p)))}))});
    /* the furniture: the template's plan turned onto this plot */
    for(const R of rooms){const pl=T.plans[R.origin];if(!pl||!pl.placements||!pl.placements.length)continue;
     const places=pl.placements.map(p=>{const w=at(P,[p.x,p.z]);return Object.assign({},p,{x:w[0],z:w[1],y:R3(y0+(p.y||0)),ry:(p.ry||0)+r.ry,room:R.id});});
     const tk=T.tpl+'|'+R.origin,proto=T.inst.buildings[bi].rooms.find(Q=>Q.id===R.origin);
     S.furniture.rooms.push({R,template:tk,room:proto,plan:pl,recipe:null,placements:places});S.furniture.pieces+=places.length;S.tpls.add(tk);}});}
  /* each site's box and its storeys: the k-th storey at the median height of every building's k-th */
  const out=[];
  for(const S of sites.values()){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;const lv=[];
   for(const B of S.buildings){for(const p of B.outer){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
    B.storeys.forEach((st,k)=>{(lv[k]||(lv[k]=[])).push(st);});}
   const med=a=>{const s=a.slice().sort((p,q)=>p-q);return s[s.length>>1];};
   S.box=[x0,x1,z0,z1];S.storeys=lv.map((L,k)=>({id:S.id+'.L'+k,y:R3(med(L.map(st=>st.y))),h:R3(med(L.map(st=>st.h)))}));
   S.furniture.templates=S.tpls.size;delete S.tpls;out.push(S);}
  out.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  return {sites:out,skipped,kinds};}
 return {make,at,inPoly};
})();
