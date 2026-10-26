// prefix: yt
// ================================================================= CLUSTERS (PLAN.md section 2): domes joined into rosettes
// A big household is a cluster, not one big dome (the Inuit multi-dome houses): the family's room in the middle and small
// domes off it through short arched passages at floor level, each its own record (place() nests them, so each is tagged
// with the cluster as its parent):
//   yt_sleep_dome   a lined sleeping dome, its own platform, robes and lamp
//   yt_store_dome   an unlined pycrete cold room (meat, roots, the frostroot): its walls are the refrigerator, it is never
//                   heated (PLAN.md section 1), so its air touches the ice
//   ytSidePass      the passage between two domes: floor at the rooms' level, slab walls, a pycrete vault
//   yt_family_cluster  the common household: the family dome, a sleeping dome on its right, a store on its left
const YT_SIDE={hw:.5,hv:.7,ys:.35,t:.4};   /* ys: the vault's springing above the ground (the rooms' floors are 0.6 m below it) */
/* a satellite dome's measures (its door faces +z, toward the room it opens from) */
function ytSatDims(Rr,Ho,lined){const t=.45,gap=lined?.18:0,Ri=Rr+gap+(lined?.03:0),Ro=Ri+t,Hi=Ho-t*.9;return {Rr,Ri,Ro,Ho,Hi,Hl:Hi-.2,t,gap,lined,yFl:-.6,rVent:.1*YT_S};}
function ytSatellite(D,season){const S=YT_SIDE,AE={hw:S.hw+S.t,hv:S.hv+S.t,ys:S.ys},AD=(d,g)=>({ga:PI/2,arch:{hw:AE.hw+d,hv:AE.hv+d,ys:AE.ys},grow:g}),sw=AD(0,-.03),sl=AD(0,-.03);
 CURREC.season=season;CURREC.layers=ytLayers(D.lined?'pycrete':'store',season,{t:D.t,gap:D.gap});
 CURREC.frost=D.lined&&season!=='summer'?ytFrost(CURREC.layers):{ok:true,unheated:!D.lined||season==='summer'};
 CURREC.heat=D.lined?{stove:null,lamps:1,fuel:'fat',crownVent:+(D.rVent*2).toFixed(2),inlet:'the family room',heated:season!=='summer'}:{stove:null,lamps:0,heated:false,cold:'store'};
 ytDome('course',D.Ro,D.Ho,P('ice'),{door:sw,rTop:D.rVent+.02,spiral:.5,seg:36});
 ytDome('pycrete',D.Ri,D.Hi,P('ice'),{door:sw,rTop:D.rVent+.02,inward:true,seg:36});
 if(D.lined)ytDome('hideCap',D.Rr,D.Hl,P('ice'),{door:sl,rTop:D.rVent+.01,inward:true,seg:36});
 ytCrownVent(D.rVent,(D.lined?D.Hl:D.Hi)-.02,D.Ho+.05);
 ytPitWall(D.Rr,D.Ri,D.yFl,[{ga:PI/2,w:2*(YT_SIDE.hw+.3)}]);cyl('earth',0,D.yFl-.12,0,D.Rr,.12,P('earth'),28);
 if(season==='winter'){const r1=ytCatR(D.Ro,D.Ho,.9);ytShell('snow',[[D.Ro+.9,0],[D.Ro+.45,.35],[r1+.2,.85],[r1+.02,1.0]],P('snow'),{doors:[AD(.25,-.2)],seg:32});}
 if(season==='summer')ytDome('turfCap',D.Ro+.3,D.Ho+.3,P('ice'),{doors:[AD(.25,-.2)],rTop:D.rVent+.22,seg:36});
 ytWalkDisc(0,0,D.Rr-.05,D.yFl);ytWalkTarget('satellite',0,D.yFl,0);
 if(D.lined){const zP=.1;prism('slab',ytSegment(D.Rr-.02,zP,18),D.yFl,D.yFl+.6,P('slab'));prism('caribou',ytSegment(D.Rr-.2,zP-.1,18),D.yFl+.6,D.yFl+.66,P('ice'));
  ytLamp(.5,D.yFl+.66,zP-.25,0);FURNISH('generic_chest',-.8,D.yFl+.66,-.8,.6);}
 else{FURNISH('generic_cured_meat',-.7,D.yFl,-.5,.8);FURNISH('generic_sack',.7,D.yFl,-.6,-.6);FURNISH('generic_storage_jar',0,D.yFl,-1.0,0);FURNISH('generic_hanging_larder',-.2,D.yFl,.4,0);}}
const YT_SLEEP=ytSatDims(1.55*YT_S,2.45,true),YT_STORE=ytSatDims(1.45*YT_S,2.3,false);
defBuilding({key:'yt_sleep_dome',name:'Sleeping dome',seed:9111,w:YT_SLEEP.Ro*2+2,d:YT_SLEEP.Ro*2+2,h:YT_SLEEP.Ho+1.2,cut:true,budget:40000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'sleeping'},note:'a lined satellite dome off a family room: platform, robes, a lamp',
 build(o){ytSatellite(YT_SLEEP,YT_SEASONS[(o.v|0)%3]);}});
defBuilding({key:'yt_store_dome',name:'Cold store dome',seed:9113,w:YT_STORE.Ro*2+2,d:YT_STORE.Ro*2+2,h:YT_STORE.Ho+1.2,cut:true,budget:40000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'store'},note:'an unlined pycrete cold room: meat, roots, the frostroot; never heated',
 build(o){ytSatellite(YT_STORE,YT_SEASONS[(o.v|0)%3]);}});
/* the passage from (ax,az) to (bx,bz) at floor level yFl, both ends inside a room's wall; the season's coat over it */
function ytSidePass(ax,az,bx,bz,yFl,season){const S=YT_SIDE,dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),ys=S.ys;
 W(ax,0,az,Math.atan2(dx,dz),()=>{box('flag',0,yFl-.115,L/2,S.hw*2+.3,.1,L,P('flag'));   /* 1.5 cm under the rooms' floors where it runs into them (no z-fighting) */
  /* the walls run out to the vault's outer face (the shells' doorways are cut to it); the vault's ends are closed */
  for(const s of [-1,1])box('slab',s*(S.hw+S.t/2),yFl,L/2,S.t,ys-yFl,L,P('slab'));
  ytVault('pycrete',S.hw,S.hv,ys,0,L,P('ice'),{inward:true});ytVault('course',S.hw+S.t,S.hv+S.t,ys,0,L,P('ice'));
  ytArchFace('pycrete',S.hw,S.hv,S.t,ys,0,-1,P('ice'));ytArchFace('pycrete',S.hw,S.hv,S.t,ys,L,1,P('ice'));
  /* the coat, its ends closed (where a dome's cap curves in faster than the coat reaches, its end would show the vault) */
  if(season!=='autumn'){const c=season==='winter'?'snow':'turf';ytVault(c,S.hw+S.t+.25,S.hv+S.t+.25,ys,.3,L-.3,P(c));
   ytArchFace(c,S.hw+S.t,S.hv+S.t,.25,ys,.3,-1,P(c));ytArchFace(c,S.hw+S.t,S.hv+S.t,.25,ys,L-.3,1,P(c));}});
 return {run:[ax,az,bx,bz,S.hw+.15]};}
/* a cluster's plan: the centre's measures D, satellites [[key, measures, angle]] off its front floor; each satellite
   stands 1.3 m beyond the centre's shell, turned to face it */
function ytClusterPlan(D,sats){const SL=YT_SIDE,lay=[],yC=SL.ys+SL.hv+SL.t,rA=ytRoomReach(D.stone?D.Ri:D.Rr,D.stone?D.Hi:D.Hl,yC,D.Rr-.1);
 for(const [key,Sd,a] of sats){const d=D.Ro+1.3+Sd.Ro,sx=Math.cos(a)*d,sz=D.cz+Math.sin(a)*d,rB=ytRoomReach(Sd.lined?Sd.Rr:Sd.Ri,Sd.lined?Sd.Hl:Sd.Hi,yC,Sd.Rr-.1);
  lay.push({key,Sd,a,sx,sz,ry:Math.atan2(-Math.cos(a),-Math.sin(a)),ax:Math.cos(a)*rA,az:D.cz+Math.sin(a)*rA,bx:Math.cos(a)*(d-rB),bz:D.cz+Math.sin(a)*(d-rB)});}
 const sides=lay.map(L=>({ga:L.a,arch:{hw:SL.hw+SL.t,hv:SL.hv+SL.t,ys:SL.ys},wp:2*(SL.hw+.3)}));
 const xs=lay.map(L=>Math.abs(L.sx)+L.Sd.Ro+1.0),zs=lay.map(L=>Math.abs(L.sz)+L.Sd.Ro+1.0);
 return {D,lay,sides,w:2*Math.max(D.Ro+1.1,...xs),d:Math.max(D.d,2*Math.max(...zs))};}
function ytClusterHoles(C,covered){return ytDwellHoles(C.D,covered).concat(C.lay.map(L=>({circle:[L.sx,L.sz,(L.Sd.Rr+L.Sd.Ri)/2]})),C.lay.map(L=>({run:[L.ax,L.az,L.bx,L.bz,YT_SIDE.hw+.15]})));}
function ytClusterBuild(C,o){const season=YT_SEASONS[(o.v|0)%3];
 ytDwellDome(C.D,season,{sides:C.sides,covered:!!o.covered});
 for(const L of C.lay){ytSidePass(L.ax,L.az,L.bx,L.bz,-.6,season);place(L.key,L.sx,L.sz,L.ry,{y:0,v:o.v|0});}
 CURREC.cluster=C.lay.map(L=>L.key);}
/* the common household's cluster: the family dome (its entry to the south), a sleeping dome to its right, a store to its
   left, each through a side passage leaving the family room's front floor */
const YT_FAM_SATS=[['yt_sleep_dome',YT_SLEEP,.32],['yt_store_dome',YT_STORE,PI-.32]];
const [YT_FAM,YT_FAM_C]=ytDwellPair({Rr:2.3*YT_S,Ho:3.35,zPlat:-.25}).map(D=>ytClusterPlan(D,YT_FAM_SATS));
defBuilding({key:'yt_family_cluster',name:'Family cluster (common household)',seed:9121,w:YT_FAM.w,d:YT_FAM.d,h:YT_FAM.D.h,cut:true,budget:160000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'dwelling'},mouth:YT_FAM_C.D.cz+YT_FAM_C.D.z1,
 note:'the family dome with a sleeping dome and a cold store off its front floor, joined by short arched passages',
 holes:o=>o.covered?ytClusterHoles(YT_FAM_C,true):ytClusterHoles(YT_FAM,false),
 build(o){ytClusterBuild(o.covered?YT_FAM_C:YT_FAM,o);}});
/* the composite house (PLAN.md section 1): a stone heart, the heated room with its mass heater, inside a ring of pycrete
   domes: warm core, cold ring. The satellites open off the front floor (the platform fills the back) and keep clear of the
   stoking chamber on the entry's right */
const [YT_COMP,YT_COMP_C]=ytDwellPair({Rr:2.4*YT_S,Ho:3.6,kind:'stone',pass:2.8,zPlat:-.25}).map(D=>ytClusterPlan(D,[['yt_sleep_dome',YT_SLEEP,PI-.3],['yt_store_dome',YT_STORE,.2],['yt_store_dome',YT_STORE,PI-1.0]]));
defBuilding({key:'yt_composite_house',name:'Composite house (stone heart, pycrete ring)',seed:9123,w:YT_COMP.w,d:YT_COMP.d,h:YT_COMP.D.h,cut:true,budget:200000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'dwelling'},mouth:YT_COMP_C.D.cz+YT_COMP_C.D.z1,
 note:"the stone heart with its mass heater, and round it the pycrete ring: a sleeping dome and two cold stores",
 holes:o=>o.covered?ytClusterHoles(YT_COMP_C,true):ytClusterHoles(YT_COMP,false),
 build(o){ytClusterBuild(o.covered?YT_COMP_C:YT_COMP,o);}});
