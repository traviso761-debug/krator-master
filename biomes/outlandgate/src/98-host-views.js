// ================================================================= HOST — the Narrows' views and checks (read by 99-host-take.js)
// The views are found on the map from what was placed (OGATE.TREES, the works' records), not typed. The checks: the Gate's works recorded
// and kept clear; the woods by their ground (cottonwoods on the banks and bars, oaks off them); the river graded; the far field the model's;
// the ground within 16 texture units; the cameras on the drawn ground. Each has a negative control that must fail.
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
 add('preset cameras over the drawn ground',GCHK.drawn(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));}
function STATION_NEGATIVES(add){
 add('no record for the fort',GCHK.works(REG.filter(r=>(r.name||'').toLowerCase().indexOf('toll fort')<0)));
 add('a tree in the fort',GCHK.clear([{key:'gateoak',x:GATE.fort.x,z:GATE.fort.z}]));
 add('a cottonwood on the dry floor',GCHK.woods([{key:'gatecottonwood',x:-3000,z:-3000},{key:'gateoak',x:-3000,z:3000}]));
 add('a river that climbs',GCHK.graded([[0,0,1423],[0,30,1424],[0,60,1423]]));
 {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,1423,0,0,3900,0,1,1423,0],3));add('a water ribbon stood on end',GCHK.flat([{F:{name:'test'},d:{mesh:{geometry:g}}}]));}
 add('a far field not the model\'s',GCHK.far({map:'4.22',r:1,h:[[0]]}));
 add('a ground reading 17 texture units',GCHK.units(17,16));
 add('a camera under the drawn ground',GCHK.drawn([{view:'under',x:100,y:Math.min(terrainH(100,100),drawnH(100,100))-3,z:100}]));}
