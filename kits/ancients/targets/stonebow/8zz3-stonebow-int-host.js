// ================================================================= STONEBOW — interiors host & zone cut-away split
// Wires STONEBOW_INT (8av1) into the Ancients interiors pass (src/8zz-interiors.js, 92z-interior-ui.js):
//   - Intact Stonebow (stonebow/0) splits into 7 furnished zone sub-sites ('stonebow/crown' .. 'stonebow/vaults-e')
//   - Ruined Stonebow (stonebow/1) remains a ruined site ('stonebow/1', broken partitions, unfurnished socket)
//   - Refurbished Centerpiece (stonebowRefurb at 0,0) draws BOTH:
//       * 5 kept, whole, furnished zones ('refurb/crown', 'refurb/bow', 'refurb/city', 'refurb/tourist', 'refurb/pylons')
//         at d = 5, state = 'intact', with whole white partitions, core/door leaves & Ancient/goods furniture
//       * 2 sealed deep delving-ruin zones ('refurb/vaults-w', 'refurb/vaults-e') at d = 1, state = 'ruined',
//         with broken concrete partitions, rubble & empty socket records ready for dungeon delving or future expansion.
if(typeof KratorAncientsInteriors!=='undefined'&&typeof STONEBOW_INT!=='undefined'&&typeof interiorBegin==='function'){
 (function(){
  const AI=KratorAncientsInteriors;
  AI.KIT.stonebow=STONEBOW_INT.entryIntact(AI);
  AI.KIT.stonebowRefurb=STONEBOW_INT.entryRefurbKept(AI);
  AI.KIT.stonebowRefurbDelve=STONEBOW_INT.entryRefurbDelve(AI);

  const origKitPlan=AI.kitPlan;
  AI.kitPlan=function(t,d,o){
   if(t!=='stonebowRefurb')return origKitPlan.call(AI,t,d,o);
   const P=origKitPlan.call(AI,t,5,o);
   P.furnish=true;
   P.state='intact';
   return P;
  };

  const origBegin=interiorBegin,origPass=interiorPass;
  interiorBegin=function(k,d,gx,gz){
   const m=origBegin(k,d,gx,gz);
   if(m&&k==='stonebowRefurb')m.d=5;
   return m;
  };

  function splitByZone(siteId,idPrefix,labelPrefix){
   const S=AIK.byId[siteId];
   if(!S)return;
   const byArea=new Map();
   for(const b of S.plan.buildings){
    const key=b.area||b.id;
    if(!byArea.has(key))byArea.set(key,[]);
    byArea.get(key).push(b);
   }
   const subs=[],stripLen=S.type.length+1;
   for(const [area,bs] of byArea){
    const ids=new Set(bs.map(b=>b.id)),ys=new Map();
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    for(const b of bs){
     for(const st of b.storeys){
      if(!ys.has(st.y))ys.set(st.y,{id:st.id,y:st.y,h:st.h,b:b.id});
      for(const q of st.outline){
       x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);
       z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);
      }
     }
    }
    const recs=S.recs.filter(r=>ids.has(String(r.building).slice(stripLen)));
    const F=S.furniture?Object.assign({},S.furniture,{
     pieces:recs.length,
     rooms:S.furniture.rooms.filter(r=>ids.has(r.R.building))
    }):null;
    const zName=STONEBOW_INT.ZONE_NAMES[area]||bs[0].name||area;
    subs.push(Object.assign({},S,{
     id:idPrefix+'/'+area,
     name:labelPrefix+' — '+zName,
     box:[x0-22,x1+22,z0-22,z1+22],
     storeys:[...ys.values()].sort((a,b)=>a.y-b.y),
     plan:Object.assign({},S.plan,{buildings:bs}),
     recs:recs,
     furniture:F,
     group:null,
     rooms:bs.reduce((n,b)=>n+b.storeys.reduce((k,st)=>k+st.rooms.length,0),0)
    }));
   }
   const idx=AIK.sites.indexOf(S);
   if(idx>=0)AIK.sites.splice(idx,1,...subs);
   delete AIK.byId[siteId];
   for(const sub of subs)AIK.byId[sub.id]=sub;
   AIK.furnished=AIK.sites.filter(s=>s.furniture&&s.furniture.pieces>0).length;
  }

  interiorPass=function(m,G){
   origPass(m,G);
   if(!m)return;
   if(m.k==='stonebow'&&m.d===0){
    splitByZone('stonebow/0','stonebow','Stonebow intact');
   }else if(m.k==='stonebow'&&m.d===1){
    const SR=AIK.byId['stonebow/1'];
    if(SR)SR.name='Stonebow (cataclysm ruin)';
   }else if(m.k==='stonebowRefurb'){
    splitByZone('stonebowRefurb/5','refurb','Stonebow refurb');
    // Now draw the 2 sealed deep delving-ruin vault zones into the same refurbished centerpiece group at d = 1
    origPass({k:'stonebowRefurbDelve',d:1,gx:m.gx,gz:m.gz,mark:{}},G);
    splitByZone('stonebowRefurbDelve/1','refurb','Stonebow delving');
   }
  };
 })();
}
