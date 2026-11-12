// ================================================================= NEOW — the Epidote Cave round the Marble Hall: the network, the hall, the dress, the air  [G data]
// PLAN.md section 2a, station 5b. Records on the core, no THREE and no DOM; the host fragments (84 on) draw them. Forked from biomes/hearths'
// Cave of Crystals (its 48), without the hold's massing and the selenite (the Marble Hall is dry: its dress is the replacement gypsum).
//   THE CAVE     SITE.net's KKARST.network (hypogene), whole (1.8 km), cropped to SITE.half round the upper storey's chamber nearest the page's
//                middle (the hall's site): on both storeys the chambers in the box, every passage with an end in it, the cupolas in their roofs;
//                the feeder and level shafts under the feeder chambers (the HOT chambers). KKARST.build carves them in one KCAVERN; then the
//                MARBLE HALL (the tube record's cavern, SITE.hall: 240 x 150 m, 55 m) is carved over that chamber with its own cupolas
//   THE DRESS    the dry storey: KSPELEO's gypsum blades and blocks over the box's floors (SITE.crystals.floor); both storeys: KSPELEO.HYPOGENE
//                over each of KKARST's crust records (the replacement gypsum's blisters and chandeliers on the old storey, the sulphuric
//                crust round the active storey's table)
//   THE AIR      KTHERM over the feeders (cool rock: the crest's meltwater down the fault), the hazards (KKARST's: falls down the wells,
//                bad air pooled over the active storey's water, the acid's drips in the crust band; the scalding pools near the feeders), the
//                water (the active storey's table: core/water's arguments)
const CAVE=(function(S){
 const d=(v,x)=>v==null?x:v,TOP=Math.max(...S.storeys);
 const N=KKARST.network(Object.assign({ground:S.ground,world:S.world},S.net));
 const M={};N.nodes.forEach(n=>{M[n.id]=n;});
 // the hall's site: the upper storey's chamber nearest the page's middle (the tube record's px is the page's origin)
 const up=N.chambers.filter(c=>c.storey===TOP);if(!up.length)throw new Error('CAVE: the network has no upper-storey chamber');
 const F0=up.reduce((a,c)=>Math.hypot(c.c[0],c.c[2])<Math.hypot(a.c[0],a.c[2])?c:a,up[0]);
 const cx=F0.c[0],cz=F0.c[2],hb=S.half,box=[cx-hb,cz-hb,cx+hb,cz+hb];
 const inB=(x,z,m)=>{m=d(m,0);return x>box[0]-m&&x<box[2]+m&&z>box[1]-m&&z<box[3]+m;};
 // ---------------------------------------------------------------- the crop (KKARST's records, never edited)
 const onS=s=>S.storeys.indexOf(s)>=0;
 const chambers=N.chambers.filter(c=>onS(c.storey)&&inB(c.c[0],c.c[2]));
 const passages=N.passages.filter(p=>onS(p.level)&&(inB(M[p.a].x,M[p.a].z)||inB(M[p.b].x,M[p.b].z)));
 const nid=new Set();passages.forEach(p=>{nid.add(p.a);nid.add(p.b);});chambers.forEach(c=>nid.add(c.node));
 const cupolas=N.cupolas.filter(u=>chambers.some(c=>c.id===u.chamber));
 const hot=chambers.filter(c=>c.feeder),hotOf=s=>hot.filter(c=>c.storey===s);
 const shafts=N.shafts.filter(s=>(s.kind==='feeder'||s.kind==='level')&&hot.some(c=>s.feeder===c.feeder));
 const keepOn=r=>chambers.some(c=>c.id===r.on);
 const N2=Object.assign({},N,{nodes:N.nodes.filter(n=>nid.has(n.id)),passages,chambers,cupolas,shafts,outlets:[],sinks:[],dolines:[],
  crusts:N.crusts.filter(keepOn),blocks:N.blocks.filter(keepOn),box:box.slice()});
 const C=KCAVERN.create({ground:S.ground,cell:S.cell,chunk:S.chunk,seed:S.world});
 KKARST.build(C,N2,{rock:'marble'});
 // ---------------------------------------------------------------- the Marble Hall (the tube record's cavern) and its cupolas
 const Hh=S.hall,hy=F0.c[1];
 C.hall({id:Hh.id,owner:'neouterwall',c:[cx,hy,cz],rx:Hh.rx,rz:Hh.rz,h:Hh.h,belly:Hh.belly});
 const hallCupolas=Hh.cupolas.map((q,i)=>{const x=cx+q[0],z=cz+q[1],e=Math.hypot(q[0]/Hh.rx,q[1]/Hh.rz),top=hy+Hh.h*Math.sqrt(Math.max(0,1-e*e))-2;
  C.hall({id:Hh.id+':cupola:'+i,owner:'neouterwall',c:[x,top,z],rx:q[2],rz:q[2],h:q[3],belly:.1});return {id:Hh.id+':cupola:'+i,c:[x,top,z],r:q[2],h:q[3]};});
 C.build();   /* every primitive is in: write the floors and list the chunks (without it the rock has no chunk and none is drawn) */
 const focus={id:Hh.id,c:[cx,hy,cz],rx:Hh.rx,rz:Hh.rz,h:Hh.h,storey:TOP,name:Hh.name,net:F0.id};
 // ---------------------------------------------------------------- the warmth (KTHERM over the hot chambers' feeders: one field)
 const feeders=[...new Set(hot.map(c=>c.feeder))].map(id=>N.feeders.find(q=>q.id===id)).filter(Boolean);
 const TH=KTHERM.create({soil:S.therm.soil,world:S.world,vents:feeders.map(f=>({id:f.id,kind:'point',x:f.x,z:f.z,T:S.therm.T,reach:S.therm.reach,decay:S.therm.decay}))});
 // ---------------------------------------------------------------- the dress
 const tag=(L,pre)=>L.map(r=>Object.assign(r,{id:pre+':'+r.id}));
 const beams=[],floor=[],hypo=[],yS=S.net.levels[TOP-1].y;
 /* the dry storey's floor: gypsum blades and blocks over the whole box (the hall's floor the most of it) */
 const FL=S.crystals.floor;tag(KSPELEO.place(C,{box,y:yS+2,cell:FL.cell,world:S.world+1,kinds:FL.kinds,accept:r=>r.y>yS-4&&r.y<yS+8}),'floor').forEach(r=>floor.push(r));
 /* the hypogene dress over each crust record of both storeys (the old storey's replacement gypsum, the active storey's crust band) */
 N2.crusts.forEach(cr=>{const ch=chambers.find(c=>c.id===cr.on);if(!ch)return;const yl=ch.storey===0?S.net.level:S.net.levels[ch.storey-1].y;
  tag(KSPELEO.place(C,{box:cr.box,y:(cr.y0+cr.y1)/2,cell:S.hypogene.cell,world:S.world+2+ch.storey,kinds:KSPELEO[cr.speleo],accept:r=>r.y<yl+ch.h+2}),'hypo:'+ch.id)
   .forEach(r=>{r.chamber=ch.id;r.storey=ch.storey;hypo.push(r);});});
 // ---------------------------------------------------------------- the air: the hazards and the water
 const hazards=[];
 const W0=KKARST.water(N2);
 KKARST.hazards(N2).forEach(z=>{if(z.tags.hazard.kind==='heat')return;
  hazards.push(Object.assign({name:z.tags.hazard.kind==='fall'?'A feeder well: a fall to the hot water':z.tags.hazard.kind==='gas'?'Bad air (H2S and CO2) pooled on the lower storey\'s water':
   z.tags.hazard.kind==='acid'?'The acid\'s drips (snottites) in the crust band':z.tags.hazard.kind==='drown'?'Warm water over the lower storey\'s floor':'The cave ('+z.tags.hazard.kind+')'},z));});
 const pools=W0.pools.filter(p=>inB(p.c[0],p.c[1])).map(p=>Object.assign({},p,{temp:Math.round(TH.heatAt(p.c[0],p.c[1]))}));
 pools.forEach(p=>{if(p.temp<S.therm.scald)return;
  hazards.push({id:p.id+':heat',name:'Scalding water ('+p.temp+' degC, over a feeder)',at:[p.c[0],p.level-1,p.c[1]],r:p.r,h:2,
   tags:{hazard:{kind:'heat',danger:Math.min(1,.5+(p.temp-S.therm.scald)/20),shape:{type:'cyl',r:p.r,h:2.5},tell:{sign:'steam off the water; the gypsum crust white and crumbling'}}}});});
 const wells=shafts.filter(s=>s.kind==='level').map(s=>({id:'well:'+s.id,name:'A feeder well (down to the lower storey\'s hot water)',c:s.c.slice(),r:s.r,level:N.table,temp:Math.round(TH.heatAt(s.c[0],s.c[1])),sulphur:true,mouth:s.y1}));
 const water=onS(0)?{level:N.table,seeds:pools.map(p=>p.c.slice()),pools,box:box.slice()}:null;
 return {N,N2,M,box,centre:[cx,cz],focus,hall:focus,hallCupolas,hot,hotOf,chambers,passages,cupolas,throats:[],fumarole:null,shafts,C,TH,beams,floor,hypo,hazards,wells,water,inB,
  temp:(x,z)=>TH.heatAt(x,z),
  export:()=>({format:'neouterwall-cave',version:1,tube:'tube_epidote_16',cavern:S.hall.id,box,karst:N2,hall:focus,cupolas:hallCupolas,cave:C.export(),
   speleo:KSPELEO.export(floor.concat(hypo)),therm:TH.export({box,cell:8}),hazards:hazards.map(z=>({id:z.id,at:z.at,tags:z.tags})),wells,water})};
})(SITE);
