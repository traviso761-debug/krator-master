// ================================================================= THEODIGA TODAY — the arcology's interiors on the kit's interiors pass
// T-arc-1 (the owner, 2026-11-16: "bring in theodiga arcology interiors"). The Ancients kit's pass (src/8zz-interiors.js) draws
// a row's plan from kits/ancients-interiors' AI.KIT[row key]; Theodiga's inhabited levels are the plan TH_ARC builds from the
// sheets (src/43-th-arc.js), registered here as AI.KIT.dam, so the pass draws the dam's storeys (floors, partitions with their
// doors on core/door, rooms in core/tags), furnishes them in the Xanadu culture (core/furnish records, the catalog's pieces drawn
// when the arcology is opened) and the cut-away (92z-interior-ui.js) opens them: the select "Interior", `[` `]` a level down
// and up, `x` closes it.
// THE DAM IS THE RUIN, ITS INHABITED LEVELS ARE NOT: the pass would take a decay-1 plan broken (AI.kitPlan breaks 45 % of a
// ruin's partitions) and furnish only an intact one. For the dam it takes the plan whole (decay 5), furnished, its state
// 'intact', and the pass draws it so (white partitions, leaves in the doorways): the clergy keep these levels whole. Every
// other row is untouched.
// THE PARTS AND THEIR LEVELS: the one site becomes ten (below), each opened alone; a part's storeys are its distinct floor
// heights, so `[` `]` step a level of that part (a fin head's eleven, the crest's four and four, the Dome's one).
// Loaded after 8zz-interiors.js (its name sorts after it) and before 90-scene.js runs the rows; nothing without the bundle.
if(typeof KratorAncientsInteriors!=='undefined'&&typeof TH_ARC!=='undefined'&&typeof interiorBegin==='function'){
 (function(){const AI=KratorAncientsInteriors;AI.KIT.dam=TH_ARC.entry(AI);
  /* the Xanadu dress the Dome's hall recipes are laid out in (TH_ARC.DRESS over the Ancients'): the dam's plan is the only
     one furnished in the culture xanadu on this page */
  if(AI.DRESS&&!AI.DRESS.xanadu)AI.DRESS.xanadu=Object.assign({},AI.DRESS.ancient,TH_ARC.DRESS);
  const kp=AI.kitPlan;AI.kitPlan=function(t,d,o){if(t!=='dam')return kp.call(AI,t,d,o);const P=kp.call(AI,t,5,o);P.furnish=true;P.state='intact';return P;};
  const ib=interiorBegin,ip=interiorPass;
  interiorBegin=function(k,d,gx,gz){const m=ib(k,d,gx,gz);if(m&&k==='dam')m.d=5;return m;};
  /* SPLIT INTO PARTS: the pass makes one site of a row (the whole arcology: 2,700 rooms, 15,000 pieces drawn on one opening);
     here it becomes ten that open apart, each with its own levels, box and furniture: the Dome, the crest east and west of the
     centre, the gallery, and each standing fin head (ids 'dam/dome', 'dam/crest-e', 'dam/crest-w', 'dam/gallery', 'dam/fin+46'...) */
  interiorPass=function(m,G){ip(m,G);if(!m||m.k!=='dam')return;const S=AIK.byId['dam/5'];if(!S)return;
   const B=S.plan.buildings,part=b=>b.area==='dome'?'dome':b.area==='gallery'?'gallery':b.area==='crest'?(/crest\.-/.test(b.id)?'crest-w':'crest-e'):'fin'+b.id.slice('th.arc.fin.'.length);
   const NAME={dome:'the Dome\'s deck',gallery:'the gallery in the dam','crest-e':'the crest, east','crest-w':'the crest, west'};
   const parts=new Map();for(const b of B){const p=part(b);if(!parts.has(p))parts.set(p,[]);parts.get(p).push(b);}
   const subs=[];
   for(const [p,bs] of parts){const ids=new Set(bs.map(b=>b.id)),ys=new Map();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    for(const b of bs)for(const st of b.storeys){if(!ys.has(st.y))ys.set(st.y,{id:st.id,y:st.y,h:st.h,b:b.id});for(const q of st.outline){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}}
    /* each part keeps its own share of the plan, of the furniture's rooms (so the kit's checks audit each part's templates)
       and of the records */
    const recs=S.recs.filter(r=>ids.has(String(r.building).slice(4)));
    const F=S.furniture?Object.assign({},S.furniture,{pieces:recs.length,rooms:S.furniture.rooms.filter(r=>ids.has(r.R.building))}):null;
    subs.push(Object.assign({},S,{id:'dam/'+p,name:'Theodiga, '+(NAME[p]||bs[0].name),box:[x0,x1,z0,z1],storeys:[...ys.values()].sort((a,b)=>a.y-b.y),
     plan:Object.assign({},S.plan,{buildings:bs}),recs,furniture:F,group:null,
     rooms:bs.reduce((n,b)=>n+b.storeys.reduce((k,st)=>k+st.rooms.length,0),0)}));}
   AIK.sites.splice(AIK.sites.indexOf(S),1,...subs);delete AIK.byId['dam/5'];for(const T of subs)AIK.byId[T.id]=T;};})();}
