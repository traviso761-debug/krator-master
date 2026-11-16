// ================================================================= HOST — the heat (PLAN.md sections 3 and 6). Before the kit (50) and the ground (84): they read HEAT_AT
// THE HEAT (core/terrain 47, KTHERM): station 3's vents (the diatreme's geyser and its fumaroles) as point vents over its soil, baked once on an 8 m
// lattice: the one temperature field the felt, the groves, the sinter, the snow and the hazards read. The cold stations have no vent: their soil is their
// record's (SITE.soil), so FIELD.geo is 0 there.
const VENTS=SKEY==='pitfloor'?[{x:SITE.geyser.x,z:SITE.geyser.z,T:SITE.geyser.T,reach:SITE.geyser.reach,decay:2.0}].concat(SITE.fumaroles.map(f=>({x:f[0],z:f[1],T:f[2],reach:f[3],decay:2.3}))):[]
/* station 14: the fault springs under the bay (on the bed, d past the waterline) and the hot springs on the beach; the lake's own water is the soil (2 degC) */
if(SKEY==='polynya'){SITE.vents.forEach(v=>{const c=L.xz(L.shoreD(v[0])+v[1],v[0]);VENTS.push({x:c[0],z:c[1],T:v[2],reach:v[3],decay:1.6,under:true});});
 L.SP.forEach(p=>VENTS.push({x:p.x,z:p.z,T:p.T,reach:p.r*2.2,decay:2.3,spring:true}));}
const THERM=VENTS.length?KTHERM.create({soil:SITE.soil,vents:VENTS.map((v,i)=>({id:SKEY+'-vent'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay})),
 detail:{amp:1.5,scale:.02,seed:9860+SITE.zone},world:'siphon-'+SKEY}):null;
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM?THERM.bake({box:THERM_BOX,cell:8}):null;
if(THERM_F)HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// the vents as records with their hazard (core/hazard reads the tags): the warm ring, the scalding core
if(SKEY!=='polynya')VENTS.forEach((v,i)=>{const r=Math.min(140,v.reach*.6);REGISTER({name:(i?'A fumarole':'The vent well\'s geyser')+' ('+v.T+' degC at the vent; the ground over 45 degC scalds)',x:v.x,z:v.z,y:terrainH(v.x,v.z)-6,r,h:30,
 tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:Math.min(30,v.reach*.2),h:6},radiant:{reach:8,dose:.4}}}});});
// THE POLYNYA (station 14): where the fault springs keep the bay open. The ice holds where the field is under SITE.polynya.open degrees; the open water is
// KTHERM's own contour at that temperature (marching squares on the bake), the closed line round the polynya's middle. Plain data: 89w draws it
const POLYNYA=(function(){if(SKEY!=='polynya'||!THERM_F)return null;const P=SITE.polynya,c=L.xz(L.shoreD(P.a)+P.d,P.a);
 const inside=(pts,x,z)=>{let k=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++)if((pts[i][1]>z)!==(pts[j][1]>z)&&x<(pts[j][0]-pts[i][0])*(z-pts[i][1])/(pts[j][1]-pts[i][1])+pts[i][0])k=!k;return k;};
 const C=KTHERM.contourOf(THERM_F,P.open).filter(l=>l.closed&&l.pts.length>8&&inside(l.pts,c[0],c[1]));if(!C.length)return{missing:true,c};
 const pts=C.sort((p,q)=>q.pts.length-p.pts.length)[0].pts;let area=0,w=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)area+=(pts[j][0]-pts[i][0])*(pts[j][1]+pts[i][1])/2;
 for(const p of pts)for(const q of pts)w=Math.max(w,Math.abs(L.aOf(p[0],p[1])-L.aOf(q[0],q[1])));
 return{pts,c,open:P.open,area:Math.abs(area),width:w,inside:(x,z)=>inside(pts,x,z)};})();
