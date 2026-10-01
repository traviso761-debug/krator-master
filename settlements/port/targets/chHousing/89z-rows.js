// TARGET: chHousing - dev view of the container-housing LAND blocks (chStack,
// chCourt, chTank). Until the shared layout places `place:'land'` blocks,
// this target lays them out itself: per decay, three plain 110 m quays on
// the coast with one land block behind each (its z=0 edge on the quay's
// -LAND edge), blocks abutting each other E/W, natural land beyond; the
// intact run also has a second row (a chStack behind the chCourt) so a
// land-land N/S joint is on show. nb carries all four sides (N = inland -z).
const TITLE='Krator Ancient Port — container housing (land blocks)';
const CH_DEV_KEYS=['chStack','chCourt','chTank'].filter(k=>PORT_REG.seg[k]);
function chDevLayout(){const runs=[],items=[],gap=440,Q='quay110',QL=PORT_REG.seg[Q].LAND;let x=0;
 [0,1,3].forEach((d,r)=>{const n=CH_DEV_KEYS.length,x0=x,its=[];
  const qs=portRun(new Array(n).fill(Q),d,x0,new Array(n).fill(0),{run:r,ctx:new Array(n).fill(1)});
  qs.items.forEach(it=>its.push(it));
  CH_DEV_KEYS.forEach((k,i)=>{const q=qs.items[i];
   its.push({key:k,d,gx:q.gx,gz:-QL,slot:i,run:r,ctx:false,
    nb:{W:i?{kind:'seg',dz:0,key:CH_DEV_KEYS[i-1]}:{kind:'land',dz:0},E:i<n-1?{kind:'seg',dz:0,key:CH_DEV_KEYS[i+1]}:{kind:'land',dz:0},
        S:{kind:'seg',key:Q},N:(d===0&&i===1)?{kind:'seg',key:'chStack'}:{kind:'land'}}});});
  if(d===0&&n>1&&PORT_REG.seg.chStack){const m=its.find(it=>it.key===CH_DEV_KEYS[1]&&it.d===0);
   its.push({key:'chStack',d,gx:m.gx,gz:m.gz-110,slot:9,run:r,nb:{W:{kind:'land'},E:{kind:'land'},S:{kind:'seg',key:m.key},N:{kind:'land'}}});}
  runs.push({d,x0,x1:qs.x1,items:its});x=qs.x1+gap;});
 const mid=(runs[0].x0+runs[runs.length-1].x1)/2;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items){it.gx-=mid;items.push(it);}}
 return {items,runs,stamps:[],vessels:[]};}
const PORT_LAYOUT_DEF=chDevLayout();
