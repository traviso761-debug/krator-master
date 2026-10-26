// prefix: yt
// ================================================================= SAMPLES (Y2): the toolkit's pieces on a test row
//   yt_sample_ribbed     a great hall's dome in construction terms: pycrete webs between stone ribs on piers, a crown ring
//   yt_sample_slump      the seasonal shell: a fresh pycrete dome beside one in spring, sagging, its courses opening on
//                        the weathered set, meltwater fanning at its foot (PLAN.md section 1)
//   yt_tunnel_sections   the tunnel's three roofs side by side: full, slab, open (v: the season)
//   yt_tunnel_net        four travel domes joined by a covered-way network laid by core/city (KCITY.covered): runs,
//                        junction domes, a warming dome where a run is long, a portal where each house's passage meets it
defBuilding({key:'yt_sample_ribbed',name:"Sample: a great hall's ribbed dome",seed:9201,cls:'feature',kind:'sample',w:17,d:17,h:9.2,cut:true,budget:90000,
 front:{x:0,z:8,yaw:0},tags:{style:'state'},
 note:'pycrete webs coursed in a spiral between eight slab ribs on piers, a crown ring round the vent: the igloo grown into a hall',
 build(o){const R=7,H=7.6,t=.5,dr={w:2.4,h:2.7};
  ytDome('course',R+t,H+t*.9,P('ice'),{door:dr,rTop:.45,spiral:.5,seg:64});ytDome('pycrete',R,H,P('ice'),{door:dr,rTop:.45,inward:true,seg:64});
  ytRibs('slab',R-.8,H-.8,8,.45,P('slab'),{rTop:.4});
  cyl('flag',0,0,0,R,.06,P('flag'),48);ytCrownVent(.42,H-.1,H+t+.05);
  for(let i=0;i<4;i++){const a=PI*(.65+i*.24);FURNISH('generic_poor_log_seat',Math.cos(a)*3.2,0,Math.sin(a)*3.2,-a-PI/2);}
  ytLamp(0,0,0,0);door(0,0,R+t,0,2.4);}});
defBuilding({key:'yt_sample_slump',name:'Sample: pycrete fresh and in spring',seed:9203,cls:'feature',kind:'sample',w:12,d:7,h:3.2,budget:50000,
 front:{x:0,z:3.4,yaw:0},tags:{style:'poor'},
 note:'the same seasonal shell re-skinned in autumn (left) and slumping in spring (right): the crown sinks, the foot spreads, the courses open on the weathered pycrete, meltwater fans out',
 build(o){const R=2.1,H=2.5,dr={w:.9,h:1.1};
  W(-3,0,0,0,()=>{ytDome('course',R,H,P('ice'),{door:dr,rTop:.1,spiral:.5,seg:40});ytDome('pycrete',R-.4,H-.36,P('ice'),{door:dr,rTop:.1,inward:true,seg:40});});
  W(3,0,0,0,()=>{ytDome('pycreteOld',R,H,P('ice'),{door:dr,rTop:.1,slump:.85,seg:40});ytDome('pycreteOld',R-.4,H-.36,P('ice'),{door:dr,rTop:.1,inward:true,slump:.85,seg:40});
   ellip('ice',.2,.03,.3,R+1.3,.015,R+.9,P('ice'),.3,24);});
  door(-3,0,R,0,.9);}});
defBuilding({key:'yt_tunnel_sections',name:'Tunnel sections: full, slab, open',seed:9205,cls:'building',w:13,d:12.4,h:3.2,cut:true,budget:90000,
 tags:{types:['infrastructure'],style:'common',role:'tunnel'},
 note:'the covered way in its three roofs, left to right: full (pycrete, an ice skylight every 10 m), removable slabs on stone ribs, the ribs alone (summer, where pycrete is seasonal)',
 holes:o=>[-4.2,0,4.2].map(x=>({run:[x,-6,x,6,YT_TUN.hw+YT_TUN.wt/2]})),
 build(o){const season=YT_SEASONS[(o.v|0)%3];CURREC.season=season;CURREC.layers=ytLayers('store',season);CURREC.heat={stove:null,heated:false,crownVent:0,inlet:'the ways',buffer:'about -5 to 0 C'};
  [['full',-4.2],['slab',0],['open',4.2]].forEach(([sec,x])=>ytTunnelPiece(x,-6,x,6,sec,season,{capA:'wall',capB:'wall'}));
  for(const x of [-4.2,0,4.2]){FURNISH('generic_sack',x+.3,YT_TUN.yF,4.6,0);}FURNISH('generic_crate',-4.2,YT_TUN.yF,-4.4,0);
  door(0,YT_TUN.yF,6,0,1.6);}});
/* the network sample: four travel domes facing in, their passages ending on the covered way */
const YT_NET=ytDoorNetPlan([['a',-9,-7.5,0],['b',9,-7.5,0],['c',-9,9.5,PI],['d',9,9.5,PI]].map(([id,x,z,ry])=>({id,key:'yt_travel_dome',x,z,ry})),{warmEvery:14});
defBuilding({key:'yt_tunnel_net',name:'A covered-way network (four travel domes)',seed:9207,cls:'feature',kind:'sample',w:28,d:28,h:5,cut:true,budget:260000,
 front:{x:0,z:13,yaw:0},tags:{style:'poor'},
 note:"four herders' domes joined by core/city's covered ways (KCITY.covered): straight runs from each passage, junction domes where branches meet, a warming dome on a long run",
 holes:o=>ytDoorNetHoles(YT_NET),
 build(o){CURREC.network=ytDoorNetBuild(YT_NET,o.v|0);}});
