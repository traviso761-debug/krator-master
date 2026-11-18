// ================================================================= HOST — the heat (PLAN.md sections 3 and 6). Before the kit (50) and the ground (84): they read HEAT_AT
// THE HEAT (core/terrain 47, KTHERM): station 3's vents (the diatreme's geyser and its fumaroles) as point vents over its soil, baked once on an 8 m
// lattice: the one temperature field the felt, the groves, the sinter, the snow and the hazards read. The cold stations have no vent: their soil is their
// record's (SITE.soil), so FIELD.geo is 0 there.
const VENTS=SKEY==='pitfloor'?[{x:SITE.geyser.x,z:SITE.geyser.z,T:SITE.geyser.T,reach:SITE.geyser.reach,decay:2.0}].concat(SITE.fumaroles.map(f=>({x:f[0],z:f[1],T:f[2],reach:f[3],decay:2.3}))):[]
/* station 14: the fault springs under the bay (on the bed, d past the waterline), the hot springs on the beach and the qanats' outflows (12 degC
   springwater); the lake's own water is the soil (2 degC) */
if(SKEY==='polynya'){SITE.vents.forEach(v=>{const c=L.xz(L.shoreD(v[0])+v[1],v[0]);VENTS.push({x:c[0],z:c[1],T:v[2],reach:v[3],decay:1.6,under:true});});
 L.SP.forEach(p=>VENTS.push({x:p.x,z:p.z,T:p.T,reach:p.r*2.2,decay:2.3,spring:true}));
 L.QL.forEach(Q=>{const p=Q.P[Q.P.length-1];VENTS.push({x:p[0],z:p[1],T:12,reach:45,decay:1.5,spring:true});});}
const THERM=VENTS.length?KTHERM.create({soil:SITE.soil,vents:VENTS.map((v,i)=>({id:SKEY+'-vent'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay})),
 detail:{amp:1.5,scale:.02,seed:9860+SITE.zone},world:'siphon-'+SKEY}):null;
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM?THERM.bake({box:THERM_BOX,cell:8}):null;
if(THERM_F)HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// the vents as records with their hazard (core/hazard reads the tags): the warm ring, the scalding core
if(SKEY!=='polynya')VENTS.forEach((v,i)=>{const r=Math.min(140,v.reach*.6);REGISTER({name:(i?'A fumarole':'The vent well\'s geyser')+' ('+v.T+' degC at the vent; the ground over 45 degC scalds)',x:v.x,z:v.z,y:terrainH(v.x,v.z)-6,r,h:30,
 tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:Math.min(30,v.reach*.2),h:6},radiant:{reach:8,dose:.4}}}});});
// THE SHORE ICE (station 14): the lake is open at the winter dawn (the model's climate); ice forms only in the shallows, where the water is under
// SITE.shoreIce.depth m (jittered by a step's hash, so the edge is ragged) and the whole strip from the waterline out is under SITE.shoreIce.open degrees
// on KTHERM's field (the fault springs, the beach springs and the qanats' outflows leave leads). Per `step` m along the shore: the waterline and the
// ice's outer edge; the cold runs become the ice's polygons (89wp draws them). Plain data
const SHORE_ICE=(function(){if(SKEY!=='polynya'||!THERM_F)return null;const I=SITE.shoreIce,LV=SITE.lake.level,R1=TERR.R*1.1,st=I.step,rows=[],runs=[];let cur=null;
 const depthAt=(x,z)=>LV-terrainH(x,z);
 for(let a=-R1-2*st;a<=R1+2*st;a+=st){const s=L.shoreD(a),k=Math.round(a/st),thr=I.depth*(.7+.6*KRAND.unit(KRAND.hash(9896,k,0)));let edge=null,warm=false;
  for(let e=s;e<s+400;e+=2){const p=L.xz(e,a);if(HEAT_AT(p[0],p[1])>=I.open){warm=true;break;}if(depthAt(p[0],p[1])>thr){edge=e;break;}}
  const r={a,s,edge,warm,thr};rows.push(r);
  if(edge!=null&&!warm&&edge-s>6){if(!cur){cur=[];runs.push(cur);}cur.push(r);}else cur=null;}
 const polys=runs.filter(R=>R.length>=3).map(R=>R.map(r=>L.xz(r.s-2,r.a)).concat(R.slice().reverse().map(r=>L.xz(r.edge,r.a))));
 const inside=(pts,x,z)=>{let k=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++)if((pts[i][1]>z)!==(pts[j][1]>z)&&x<(pts[j][0]-pts[i][0])*(z-pts[i][1])/(pts[j][1]-pts[i][1])+pts[i][0])k=!k;return k;};
 const c=L.xz(L.shoreD(SITE.bay.a)+SITE.bay.d,SITE.bay.a);
 return{rows,runs:runs.filter(R=>R.length>=3),polys,depth:I.depth,open:I.open,c,leads:rows.filter(r=>r.warm).length,iceAt:(x,z)=>polys.some(P=>inside(P,x,z)),depthAt};})();
