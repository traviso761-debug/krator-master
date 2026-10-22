// TARGET: port - station 1 of the dam basins (biomes/dambasins/PLAN.md, section 3): the old port on the west lake's
// 900 m line. One coastal run of the Ancient Port kit's segments along the old full line, ruined (decay 1) where the
// port was abandoned as the water fell away, salvage (3) where the salvagers live now; land blocks behind. The kit's y = 0
// is the old full level (80-db-bed.js), so every deck stands at its freeboard over water that is gone, and the bed falls
// away in front: the ring, then the fast-drain slope. No ship in any berth (vessels: []); the moored hulks are placed
// as free vessels and grounded (81-db-hulks.js).
const TITLE='Krator — the dam basins: the old port on the 900 m line (D1)';
const PORT_LAYOUT_DEF=(()=>{const ok=k=>!!PORT_REG.seg[k];
 // the old shore, west to east: [key, decay, set-back]
 const plan=[
  ['hbHaven',1,0],      // the point: the light on its knoll, an island once
  ['tmPass',1,0],       // the ferry terminal: its ramps run down into dust
  ['cgStore',1,-10],
  ['cgCrane',1,-10],
  ['pier',1,0],         // the great pier, standing out over the falling slope on its piles
  ['quay',1,0],
  ['cgBox',1,10],
  ['quay110',3,10],     // the salvagers' end
  ['quay110',3,0]].filter(p=>ok(p[0]));
 const R=portRun(plan.map(p=>p[0]),0,0,plan.map(p=>p[2]),{run:0});
 R.items.forEach((it,i)=>{it.d=plan[i][1];it.fleet=[null,null,null,null];});   // no ship in any berth (D1 grounds them)
 const mid=(R.x0+R.x1)/2;R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;
 const items=R.items.slice(),back=[];
 const at=(k,n)=>{let c=0;for(const it of items)if(it.key===k&&c++===(n||0))return it;return null;};
 const push=(b)=>{if(b)back.push(b);return b;};
 const pier=at('pier'),q3=at('quay110',1);
 if(pier)push(portBehind(pier,'lbStores',{d:1}));
 if(q3)push(portBehind(q3,'chStack',{d:3}));
 // THE MOORED HULKS (D1): ships tied up at the quays when the dam broke; the water fell under them in days and they
 // grounded where they lay, in their dredged berths at the quay's foot, heeled toward the falling slope (81-db-hulks.js
 // grounds every vessel). [vessel, decay, the quay it lay at, which of that key, bow east (1) or west (-1)]
 const moored=[],VR=PORT_REG.vessel;
 for(const [vk,vd,qk,qn,dir] of [['vsFeeder',1,'quay',0,1],['vsPanamax',1,'cgStore',0,-1],['vsFeeder',3,'quay110',0,1]]){
  const q=at(qk,qn),V=VR[vk];if(!q||!V)continue;const f=portFoot(q);
  moored.push({vessel:true,key:vk,d:vd,gx:q.gx+(qk==='cgStore'?60:0),gz:f.z1+V.beam/2+6,heading:dir*Math.PI/2,run:0});}
 const run=Object.assign({d:1,back,sea:[],moored},R);
 return {items:items.concat(back,moored),runs:[run],stamps:[],vessels:[],harbour:{pier,back,sea:[]},db:{at,pier,moored}};})();
