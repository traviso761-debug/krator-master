// ================================================================= HOST — the Narrows' views and checks (read by 99-host-take.js)
// The views are found on the map from what was placed (OGATE.TREES, the works' records), not typed. The checks: the Gate's works recorded
// and kept clear; the woods by their ground (cottonwoods on the banks and bars, oaks off them); the river graded; the far field the model's;
// the ground within 16 texture units; the cameras on the drawn ground; the gap's wind (down the gap by night, up it by day) and the banners on
// it; the river's drowning and the outburst flood's cycle (core/hazard); the heat provided; the fauna recorded, off the water and the works,
// the runner birds on the god's road, the flyers aloft. Each has a negative control that must fail.
const STATION_TITLE='the Narrows and the Gate';
const STATION_HINT='The Outland Gate, station 1: the Narrows, the gap\'s warm floor at 1.4 km (Cfa, 1.34 atm) where Hau-Gel braids down to Spider Lake between walls that climb to 10-14 km of airless rock (the far field is the scale model\'s own heights). The Tierhounds close the floor with a long wall: the toll fort on the east bank, the water gate over the river, the gatehouse on the god\'s road with the trickster\'s shrine south of it; caravans wait outside. Cottonwoods on the banks and bars, oaks and maples on the floor (read in place from the eastern badlands), reed beds on the channels\' lips';
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
function nearTree(key,x,z){let b=null,bd=1e18;for(const T of OGATE.TREES||[]){if(T.key!==key)continue;const d=(T.x-x)**2+(T.z-z)**2;if(d<bd){bd=d;b=T;}}return b||{x,z,y:gh(x,z),H:12,crownR:5};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,dy),T.y+dy),cz,T.x,T.y+(ty==null?T.H*.45:ty),T.z];}
function STATION_VIEWS(){const F=GATE.fort,RX=roadX(ZW),C=nearTree('gatecottonwood',rivX(1600)+90,1600),B=nearTree('barcottonwood',rivX(-1500),-1500),
  O=nearTree('gateoak',-2400,1800),Mp=nearTree('gatemaple',1800,-1800);
 return{
  'The Narrows from the long wall':[RX-40,gh(RX-40,ZW,24),ZW+4,rivX(-2600),LVL(-2600)+30,-2600],
  'Up the gap to the walls':look(rivX(-3000)+150,-3000,40,rivX(2400),2400,300),
  'Down the gap to Spider Lake':look(rivX(3000)-120,3000,60,rivX(-3000),-3000,400),
  'The long wall across the floor':look(-1600,ZW+420,14,600,ZW,6),
  'The toll fort':look(F.x+F.w*1.6,F.z+F.d*1.5,22,F.x,F.z,8),
  'The water gate':look(GATE.water.x+30,ZW-260,8,GATE.water.x,ZW,6),
  'The gatehouse on the god\'s road':look(RX+6,ZW-160,3.5,RX,ZW,7),
  'The trickster\'s shrine':look(SHRINE.x+16,SHRINE.z+12,2.2,SHRINE.x+3,SHRINE.z,3),
  'The caravan camp':look(CAMP.x+150,CAMP.z-90,14,CAMP.x,CAMP.z,1),
  'The braids from above':look(rivX(1600)+700,1100,260,rivX(1500),1500,0),
  'Cottonwoods on the bank':atTree(C,30,2.4,3,C.H*.5),
  'Bar cottonwoods':atTree(B,14,.6,2,B.H*.5),
  'Oaks on the floor':atTree(O,26,2.1,2.5,O.H*.45),
  'Reed beds':(function(){const x=rivX(2200)+MAIN_W/2+14,z=2200;return[x,gh(x,z,2.2),z,x-MAIN_W*.4,LVL(z)+1.2,z-40];})(),
 };}
const GCHK={
 works(R){const need=['long wall','gatehouse','toll fort','water gate','shrine','caravan camp'],miss=need.filter(n=>!R.some(r=>(r.name||'').toLowerCase().indexOf(n)>=0));
  return{ok:!miss.length,detail:miss.length?'no record for: '+miss.join(', '):need.length+' works recorded (core/tags), '+WORKS.pieces+' stones drawn, '+WORKS.towers+' towers'};},
 clear(T){const bad=T.filter(t=>inWorks(t.x,t.z,1));return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' trees inside the Gate\'s works (first '+bad[0].key+')':T.length+' trees, none in the works, the road or the camp'};},
 woods(T){const c=T.filter(t=>t.key==='gatecottonwood'),bc=c.filter(t=>!(FIELD.bankX(t.x,t.z)>.1||FIELD.bar(t.x,t.z)>.25)),o=T.filter(t=>t.key==='gateoak'),bo=o.filter(t=>FIELD.bankX(t.x,t.z)>.5);
  return{ok:c.length>0&&o.length>0&&!bc.length&&!bo.length,detail:(bc.length?bc.length+' cottonwoods off the banks and bars; ':'')+(bo.length?bo.length+' oaks on a bank; ':'')+c.length+' cottonwoods on the banks and bars, '+o.length+' oaks off the banks'};},
 graded(P){let up=0;for(let i=1;i<P.length;i++)if(P[i][2]>P[i-1][2]+.001)up++;return{ok:P.length>2&&!up,detail:up?up+' steps that climb':P.length+' points of the main channel, every step level or down (to Spider Lake)'};},
 far(G){const ok=!!G&&G.map==='5.1'&&G.h.length===2*G.r+1&&Math.abs(G.h[G.r][G.r]-1423)<60;return{ok,detail:ok?'the far field on the model\'s heights (5.1, '+G.h.length+' x '+G.h.length+' cells of 2 km; at the station '+G.h[G.r][G.r]+' m)':'the far field is not the model\'s'};},
 flat(D){const bad=D.filter(f=>{f.d.mesh.geometry.computeBoundingBox();const b=f.d.mesh.geometry.boundingBox;return b.max.y-b.min.y>6||b.min.y<1400||b.max.y>1440;});
  return{ok:D.length>0&&!bad.length,detail:bad.length?bad.length+' water ribbons not lying on their level (first '+bad[0].F.name+')':D.length+' water ribbons, each lying within 6 m of the river\'s level'};},
 wind(fn){const d=GAP_DOWN,n=fn(3),dd=fn(14),a=n[0]*d[0]+n[1]*d[1],b=dd[0]*d[0]+dd[1]*d[1];
  return{ok:a>1&&b<-.5,detail:'down the gap '+a.toFixed(2)+' at 3 h (the Outland Bore: over 1 asked), '+b.toFixed(2)+' at 14 h (the Silk-Draught, up it: under -.5)'};},
 banners(L,w){const bad=L.filter(B=>{const a=B.rotation.y;return Math.cos(a)*w[0]-Math.sin(a)*w[1]<=0;});
  return{ok:L.length>0&&!bad.length,detail:bad.length?bad.length+' of '+L.length+' banners streaming into the wind':L.length+' banners, each streaming downwind ('+w.map(v=>v.toFixed(2)).join(', ')+')'};},
 drown(P){const bad=P.filter(p=>{const L=KHAZ.at(p.x,p.z,0,p.y);return p.wet!==L.some(e=>e.kind==='drown'&&e.rec&&e.rec!==HAZ.flood);});
  return{ok:P.length>0&&!bad.length,detail:bad.length?bad.length+' points wrong (first '+(bad[0].wet?'in the river and no drowning':'on the dry floor and drowning')+' at '+bad[0].x.toFixed(0)+', '+bad[0].z.toFixed(0)+')':P.filter(p=>p.wet).length+' points in Hau-Gel drown, '+P.filter(p=>!p.wet).length+' on the floor do not'};},
 flood(rec,c){if(!rec)return{ok:false,detail:'no flood record'};const o=c.offset==null?0:c.offset,on=KHAZ.state(rec,c.warn+c.ramp+c.on/2-o).k,idle=KHAZ.state(rec,c.period-10-o).k,warn=KHAZ.state(rec,c.warn/2-o).k;
  return{ok:on>.95&&idle<.01&&warn<.01,detail:'k '+warn.toFixed(2)+' in the warning (the tell), '+on.toFixed(2)+' at the flood, '+idle.toFixed(2)+' idle; the cycle '+c.period+' s'};},
 heat(F){const ok=F.indexOf('temperature')>=0,t=ok?KHAZ.ambient(0,1424,0,0).length:0;return{ok,detail:ok?'the temperature provided (fields: '+F.join(', ')+')':'no temperature field'};},
 fauna(A,n){const camp=a=>a.role==='people'&&Math.hypot(a.at[0]-CAMP.x,a.at[2]-CAMP.z)<CAMP.r*1.15;   /* the caravans' beasts stand in their camp */
  const bad=A.filter(a=>a.role!=='flyer'&&((inWorks(a.at[0],a.at[2],-2)&&!camp(a))||waterH(a.at[0],a.at[2])>-1e8||terrainH(a.at[0],a.at[2])-LVL(a.at[2])<.3)),fly=A.filter(a=>a.role==='flyer'&&a.at[1]<terrainH(a.at[0],a.at[2])+40);
  return{ok:A.length>0&&n>=A.length&&!bad.length&&!fly.length,detail:(bad.length?bad.length+' animals in the water or the works (first '+bad[0].key+'); ':'')+(fly.length?fly.length+' flyers on the ground; ':'')+A.length+' animals ('+A.filter(a=>a.role==='flyer').length+' aloft), '+n+' fauna records'};},
 road(A){const r=A.filter(a=>a.key==='runner-bird'),bad=r.filter(a=>Math.abs(a.at[0]-roadX(a.at[2]))>20);
  return{ok:r.length>0&&!bad.length,detail:bad.length?bad.length+' runner birds off the god\'s road':r.length+' runner birds, each within 20 m of the god\'s road'};},
 units(n,max){return{ok:n<=max,detail:n+' of '+max+' texture units on the ground (its map, '+KGL.length+' library layers, the horizon, the rain cover, the height fog; +1 for the shadow map)'};},
 drawn(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),drawnH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the drawn ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras over the drawn ground (the mesh\'s triangles)'};},
};
const groundUnits=()=>(typeof KSHADOW!=='undefined'&&KSHADOW.units?KSHADOW.units(MAT_GROUND,renderer):0)+1;
function STATION_CHECKS(add){const T=OGATE.TREES||[];
 add('the Gate\'s works recorded',GCHK.works(REG));
 add('nothing grows in the Gate\'s works',GCHK.clear(T));
 add('the woods by their ground (cottonwoods on the banks and bars, oaks off them)',GCHK.woods(T));
 add('the river graded to Spider Lake',GCHK.graded(RIVER_PTS));
 add('the river\'s water lies on its level (a ribbon, not a wall)',GCHK.flat(FLOW_DRAWS));
 add('the far field on the scale model\'s heights',GCHK.far(OG_FAR));
 add('the ground within 16 texture units (counted)',GCHK.units(groundUnits(),16));
 add('preset cameras over the drawn ground',GCHK.drawn(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(WIND){add('the gap\'s wind: down it by night, up it by day',GCHK.wind(h=>ATMOS.katabaticWind(h,0,WIND_O)));add('the banners stream downwind',GCHK.banners(BANNERS,WIND.wind));}
 const DP=[];for(let z=-2800;z<=2800;z+=700){DP.push({x:rivX(z),z,y:LVL(z)-1,wet:true});const x=rivX(z)+(z%1400?1:-1)*900;if(waterH(x,z)<-1e8)DP.push({x,z,y:terrainH(x,z)+1,wet:false});}
 add('Hau-Gel drowns, the floor does not (core/hazard)',GCHK.drown(DP));
 if(HAZ.flood)add('the outburst flood on its cycle (a tell, the flood, idle)',GCHK.flood(HAZ.flood,HAZ.cycle));
 add('the floor\'s heat provided (ambient)',GCHK.heat(KHAZ.provided()));
 if(FAUNA.plan){const A=FAUNA.plan.animals.concat(OUTLANDGATE_FAUNA||[]),T=BIO.tagReg(),n=T?T.query({'class':'life'}).filter(r=>r.kind!=='herd').length:0;
  add('the fauna recorded, off the water and the works, the flyers aloft',GCHK.fauna(A,n));add('the runner birds on the god\'s road',GCHK.road(OUTLANDGATE_FAUNA||[]));}}
function STATION_NEGATIVES(add){
 add('no record for the fort',GCHK.works(REG.filter(r=>(r.name||'').toLowerCase().indexOf('toll fort')<0)));
 add('a tree in the fort',GCHK.clear([{key:'gateoak',x:GATE.fort.x,z:GATE.fort.z}]));
 add('a cottonwood on the dry floor',GCHK.woods([{key:'gatecottonwood',x:-3000,z:-3000},{key:'gateoak',x:-3000,z:3000}]));
 add('a river that climbs',GCHK.graded([[0,0,1423],[0,30,1424],[0,60,1423]]));
 {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,1423,0,0,3900,0,1,1423,0],3));add('a water ribbon stood on end',GCHK.flat([{F:{name:'test'},d:{mesh:{geometry:g}}}]));}
 add('a far field not the model\'s',GCHK.far({map:'4.22',r:1,h:[[0]]}));
 add('a ground reading 17 texture units',GCHK.units(17,16));
 add('a camera under the drawn ground',GCHK.drawn([{view:'under',x:100,y:Math.min(terrainH(100,100),drawnH(100,100))-3,z:100}]));
 if(WIND){add('a wind blowing up the gap by night',GCHK.wind(h=>ATMOS.katabaticWind(h,0,Object.assign({},WIND_O,{down:[-GAP_DOWN[0],-GAP_DOWN[1]]}))));
  const B=BANNERS[0],a=B.rotation.y;B.rotation.y=a+Math.PI;const r=GCHK.banners([B],WIND.wind);B.rotation.y=a;add('a banner streaming into the wind',r);}
 add('a point on the dry floor claimed as the river',GCHK.drown([{x:-3000,z:3000,y:terrainH(-3000,3000)+1,wet:true}]));
 if(HAZ.flood)add('a flood with no cycle (always on)',GCHK.flood({tags:{hazard:{kind:'drown',shape:{type:'box',w:10,d:10,h:5}}},x:0,y:0,z:0},HAZ.cycle));
 add('no temperature provided',GCHK.heat([]));
 if(FAUNA.plan){const a=FAUNA.plan.animals.find(a=>a.role!=='flyer');if(a)add('an animal in the toll fort',GCHK.fauna([Object.assign({},a,{at:[GATE.fort.x,terrainH(GATE.fort.x,GATE.fort.z),GATE.fort.z]})],1e9));
  add('a runner bird 300 m off the road',GCHK.road([{key:'runner-bird',at:[roadX(0)+300,0,0]}]));}}
