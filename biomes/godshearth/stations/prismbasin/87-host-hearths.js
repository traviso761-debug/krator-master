// ================================================================= HOST — Godshearth's hearth grove and ghost rings (biomes/hearths, read in place; PLAN.md section 4)
// Placed before the one bake (the field stage's 88 calls STATION_BUILD after the geyser kit has drawn the field):
//   THE GROVE   HEARTH.layout on 47b's bake along the vent line: the hearth trees on 25-60 degC (spaced by the heat, so the discs merge into a grove along
//               the line), the ember mat on 60-95, coal moss on 20-40, stokers on 10-25, tallow beads on some stalks. The RIM dress (broad, few, high
//               fans): the plan's caldera dress (8-18 m, fans 2-3 m) is the Hearths kit's own work and the owner's to scale (PLAN.md section 4)
//   THE TURF    the floor's frost turf between (75b: GHTURF.place on the meadow's ground, ghMeadow)
//   THE DEAD    rings of dead stalks round the dead spring (GH_DEAD), standing (the rim dress's dead are broken, not fallen): the plan's ghost rings
// Nothing of the grove in a spring, on the sinter, in the run-off or in the lake: the mask keeps the geyser kit's ground (GEYSER.at) and the water.
function STATION_BUILD(){if(typeof HEARTH==='undefined'||!HEARTH.layout)return null;const q=new URLSearchParams(location.search),Q=q.has('q')?+q.get('q'):1;
 const mask=(x,z)=>{const g=GEYSER.at(x,z);if(g.spring>0||g.sinter>.25||g.terr>.2||g.acid>.2||g.film>.3||g.mud>.1)return 0;
  if(GEYSER.blocked&&GEYSER.blocked(x,z,2))return 0;return BIO.mask(x,z);};
 const mid=GH_VLINE.reduce((a,p)=>[a[0]+p[0]/GH_VLINE.length,a[1]+p[1]/GH_VLINE.length],[0,0]),R=Math.max(...GH_VLINE.map(p=>Math.hypot(p[0]-mid[0],p[1]-mid[1])))+190;
 HEARTH.parts('rim');
 let F=null,D=null;BIO.cur='hearths/field';
 try{F=HEARTH.layout({therm:THERM_F,at:mid,R,dress:'rim',seed:KRAND.hash(8130,842,1394),toward:{az:0,alt:55},ground:terrainH,mask,q:Q});
  D=HEARTH.layout({therm:THERM_F,at:[GH_DEAD.x,GH_DEAD.z],R:90,dress:'rim',seed:KRAND.hash(8131,842,1394),ground:terrainH,mask,deadRings:[30,85],q:Q});}
 catch(e){reportErr('hearths: '+e.stack);}
 BIO.cur='godshearth/turf';try{window._turf=GHTURF.place({at:[STATION_SITE.field.x,STATION_SITE.field.z],R:1250,cell:3.2,accept:(x,z)=>ghMeadow(x,z)*.45,q:Q});}catch(e){reportErr('turf: '+e.stack);}
 BIO.cur=null;
 if(D)REGISTER({name:GH_DEAD.name,x:GH_DEAD.x,z:GH_DEAD.z,y:terrainH(GH_DEAD.x,GH_DEAD.z)-2,r:90,h:20});
 if(F)F.trees.forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.r+.6,y0:T.y-1,y1:T.y+T.H+2}));
 window._field=F?{trees:F.trees,counts:Object.assign({},F.counts,{dead:(F.counts.dead||0)+(D?D.counts.dead:0)})}:null;
 return window._field;}
// the grove's checks (44s: STATION_SITE.take), each with its negative control (oidong's Cold Hearths' HC, on this field's heat and ground)
const GHC={field:c=>{const need=['hearth','fans','ember','coal','stoker','tallow','dead'],zero=need.filter(k=>!(c&&c[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+c[k]).join(', ')};},
 trees:T=>{const bad=T.filter(t=>{const v=t.heat!=null?t.heat:GH_HEAT(t.x,t.z);return v<25||v>60;});return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' trees off 25-60 degC (first '+(bad[0].heat==null?GH_HEAT(bad[0].x,bad[0].z):bad[0].heat).toFixed(1)+')':T.length+' hearth trees, all on 25-60 degC'};},
 ember:P=>{const E=P.filter(p=>p[3]==='biome:hember'),bad=E.filter(p=>{const v=GH_HEAT(p[0],p[2]);return v<58||v>97;});return{ok:E.length>0&&!bad.length,detail:bad.length?bad.length+' mats off the hottest ground':E.length+' mats on 60-95 degC'};},
 wet:T=>{const bad=T.filter(t=>{const g=GEYSER.at(t.x,t.z);return g.spring>0||g.sinter>.25||waterH(t.x,t.z)>terrainH(t.x,t.z)-.1;});return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' in a spring, on the sinter or in the water':T.length+' trees, none in the wet'};},
 work:f=>{const w=f||((t,o)=>HEARTH.work(t,o)),night=w(0,{sunAlt:-20}),noon=w(0,{sunAlt:50}),ecl=w(0,{sunAlt:50,hidden:1}),cloud=w(0,{sunAlt:-20,W:{cloud:1}});
  return{ok:night>.95&&noon<.05&&ecl>.95&&cloud<.5,detail:'night '+night.toFixed(2)+', noon '+noon.toFixed(2)+', eclipse '+ecl.toFixed(2)+', overcast night '+cloud.toFixed(2)};}};
// the meadow and the air (44s's take): the cushions off the warm and wet ground; the air's day and night (89x: GH_AIR)
GHC.meadow=P=>{const M=P.filter(p=>p[3]==='biome:gturf'||p[3]==='biome:fcushion'),bad=M.filter(p=>ghMeadow(p[0],p[2])<=0);
 return{ok:M.length>0&&!bad.length,detail:bad.length?bad.length+' of '+M.length+' on warm, wet or bare ground':M.length+' tufts of turf and cushions, all on the cool floor'};};
GHC.air=f=>{const A=f||((x,y,z,s,h)=>GH_AIR.air(x,y,z,s,h)),x=shoreX(-1100)+60,Z=-1100,
 pool=A(x,1,Z,-1,3),wd=A(800,15,600,-1,15),wn=A(800,15,600,-1,3),sd=A(800,15,600,1,15),sn=A(800,15,600,1,3),spool=A(x,1,Z,1,3);
 return{ok:wn<-8&&wd>3&&sd>20&&sn>3&&pool<wn-3&&spool<sn,detail:'the open floor: winter '+wd.toFixed(0)+' / '+wn.toFixed(0)+' degC, summer '+sd.toFixed(0)+' / '+sn.toFixed(0)+'; the shore\'s cold-air pool on a night: winter '+pool.toFixed(0)+', summer '+spool.toFixed(0)};};
// the terraces (44s: GH_TER; 89w draws them): each tread's water at its level and over its own bed, each lower than the one above; up (m) lifts the
// water for the negative control
GHC.terr=up=>{const T=GH_TER,u=up||0,bad=[];for(let i=0;i<T.levels.length;i++){const s=i*(T.tl+T.riser)+T.tl/2,x=T.A[0]+(T.B[0]-T.A[0])*s/T.L,z=T.A[1]+(T.B[1]-T.A[1])*s/T.L;
  const y=T.lv(s).y+u,bed=terrainH(x,z),rimL=terrainH(x+(T.B[1]-T.A[1])/T.L*(T.w/2+1.5),z-(T.B[0]-T.A[0])/T.L*(T.w/2+1.5));
  if(!(y>bed+.2&&y<rimL+.05)||(i&&T.levels[i]>=T.levels[i-1]))bad.push(i);}
 return{ok:!bad.length,detail:bad.length?'treads '+bad.join(', ')+' off their beds or over their rims':T.levels.length+' pools, '+T.levels[0]+' m down to '+T.levels[T.levels.length-1]+' m'};};
// the model's vents, the lake's vents, the night wind, the frost, the walls (44s's take)
GHC.vents=V=>{const L=V||GH_MODEL.vents,need=['fumarole','geyser','spring'],miss=need.filter(k=>!L.some(v=>v.kind===k&&/^Godshearth/.test(v.name)));
 return{ok:!miss.length&&GH_VLINE===GH_LINE_V.pts&&STATION_SITE.field.x===GH_FIELD_V.x,detail:miss.length?'none on the model: '+miss.join(', '):L.length+' of the model\'s records near the site: '+L.map(v=>v.kind+' at '+Math.round(v.x)+','+Math.round(v.z)).join('; ')};};
GHC.lake=t=>{const T=t==null?GH_HEAT(GH_SHORE_V.x,GH_SHORE_V.z):t;return{ok:T>60&&waterH(GH_SHORE_V.x,GH_SHORE_V.z)>terrainH(GH_SHORE_V.x,GH_SHORE_V.z)&&!!(GH_AIR.steam&&GH_AIR.steam.meshes&&GH_AIR.steam.meshes.lakevents),
 detail:'the shore vents '+T.toFixed(0)+' degC under '+(waterH(GH_SHORE_V.x,GH_SHORE_V.z)-terrainH(GH_SHORE_V.x,GH_SHORE_V.z)).toFixed(1)+' m of water, steaming'};};
GHC.wind=f=>{const W=f||((h,c)=>ATMOS.katabaticWind(h,c,{down:[-1,0],speed:1.6,daySpeed:.7})),n=W(4,0),d=W(14,0),o=W(4,1);
 return{ok:!!GH_AIR.kat&&n[0]<-1.2&&d[0]>.4&&Math.abs(o[0])<.6,detail:'04:00 clear '+n[0].toFixed(2)+' (downslope, west to the lake), 14:00 '+d[0].toFixed(2)+' (the lake breeze), 04:00 overcast '+o[0].toFixed(2)};};
GHC.frost=f=>{const F=f||GH_AIR.frostK,dawn=F(GH_AIR.air(800,1,600,-1,5),0,0),day=F(GH_AIR.air(800,1,600,-1,14),0,0),cloud=F(GH_AIR.air(800,1,600,-1,5),1,0);
 return{ok:GH_AIR.frostOn&&dawn>.25&&day<.01&&cloud<.05,detail:'a clear winter dawn '+dawn.toFixed(2)+', the afternoon '+day.toFixed(2)+', an overcast dawn '+cloud.toFixed(2)};};
GHC.walls=W=>{const w=W||window._walls;if(!w)return{ok:false,detail:'no walls'};const hi=w.top.filter(t=>t.abs>5500).length;
 return{ok:w.tris>1000&&hi>=3&&w.top.every(t=>t.deg<15),detail:w.top.map((t,i)=>['E-S','S-W','W-N','N-E'][i]+' '+t.abs+' m at '+t.km+' km ('+t.deg+' deg)').join('; ')+', '+w.tris+' triangles'};};
