// ================================================================= HOST — a later station's views and checks (read by src/99-host-take.js)
// The views are the stage's (STAGE.views: found on the map from what was placed, OGATE.TREES and the works, never typed). The checks every
// station shares: the far field the model's at the station's own pixel; the ground within 16 texture units; the cameras on the DRAWN ground;
// the flows lying on their levels; the works recorded and kept clear; the gap's wind down it by night and up it by day, the banners on it;
// the water drowning and the dry ground not; the outburst flood on its cycle; the heat provided; the fauna recorded, off the water and the
// works, the flyers aloft. Then the stage's own (STAGE.checks). Each has a negative control that must fail.
const STATION_TITLE=STAGE.title;
const STATION_HINT=STAGE.hint;
function STATION_VIEWS(){return STAGE.views();}
const GCHK={
 far(G){const ok=!!G&&G.map==='5.1'&&G.cx===STAGE.px[0]&&G.cy===STAGE.px[1]&&G.h.length===2*G.r+1;
  return{ok,detail:ok?'the far field on the model\'s heights (5.1, '+G.h.length+' x '+G.h.length+' cells of 2 km round px '+G.cx+','+G.cy+'; there '+G.h[G.r][G.r]+' m)':'the far field is not the model\'s at this station'};},
 units(n,max){return{ok:n<=max,detail:n+' of '+max+' texture units on the ground (its map, '+KGL.length+' library layers, the horizon, the rain cover, the height fog; +1 for the shadow map)'};},
 drawn(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),drawnH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the drawn ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras over the drawn ground (the mesh\'s triangles)'};},
 flat(D){const bad=D.filter(f=>{f.d.mesh.geometry.computeBoundingBox();const b=f.d.mesh.geometry.boundingBox,lo=Math.min(...f.F.pts.map(p=>p[2])),hi=Math.max(...f.F.pts.map(p=>p[2]));return b.min.y<lo-6||b.max.y>hi+6;});
  return{ok:!bad.length,detail:bad.length?bad.length+' water ribbons not lying on their line\'s levels (first '+bad[0].F.name+')':D.length+' water ribbons, each within 6 m of its line\'s levels'};},
 works(R,need){const miss=need.filter(n=>!R.some(r=>(r.name||'').toLowerCase().indexOf(n)>=0));
  return{ok:!miss.length,detail:miss.length?'no record for: '+miss.join(', '):need.length+' works recorded (core/tags), '+WORKS.pieces+' pieces drawn'};},
 clear(T,inW){const bad=T.filter(t=>inW(t.x,t.z,1));return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' trees inside the works (first '+bad[0].key+')':T.length+' trees, none in the works'};},
 wind(fn){const d=GAP_DOWN,n=fn(3),dd=fn(14),a=n[0]*d[0]+n[1]*d[1],b=dd[0]*d[0]+dd[1]*d[1];
  return{ok:a>1&&b<-.5,detail:'down the gap '+a.toFixed(2)+' at 3 h (the Outland Bore: over 1 asked), '+b.toFixed(2)+' at 14 h (the Silk-Draught, up it: under -.5)'};},
 banners(L,w){const bad=L.filter(B=>{const a=B.rotation.y;return Math.cos(a)*w[0]-Math.sin(a)*w[1]<=0;});
  return{ok:L.length>0&&!bad.length,detail:bad.length?bad.length+' of '+L.length+' banners streaming into the wind':L.length+' banners, each streaming downwind ('+w.map(v=>v.toFixed(2)).join(', ')+')'};},
 drown(P){const bad=P.filter(p=>{const L=KHAZ.at(p.x,p.z,0,p.y);return p.wet!==L.some(e=>e.kind==='drown'&&e.rec&&e.rec!==HAZ.flood);});
  return{ok:P.length>0&&!bad.length,detail:bad.length?bad.length+' points wrong (first '+(bad[0].wet?'in the water and no drowning':'on dry ground and drowning')+' at '+bad[0].x.toFixed(0)+', '+bad[0].z.toFixed(0)+')':P.filter(p=>p.wet).length+' points in the water drown, '+P.filter(p=>!p.wet).length+' on the dry ground do not'};},
 flood(rec,c){if(!rec)return{ok:false,detail:'no flood record'};const o=c.offset==null?0:c.offset,on=KHAZ.state(rec,c.warn+c.ramp+c.on/2-o).k,idle=KHAZ.state(rec,c.period-10-o).k,warn=KHAZ.state(rec,c.warn/2-o).k;
  return{ok:on>.95&&idle<.01&&warn<.01,detail:'k '+warn.toFixed(2)+' in the warning (the tell), '+on.toFixed(2)+' at the flood, '+idle.toFixed(2)+' idle; the cycle '+c.period+' s'};},
 heat(F){const ok=F.indexOf('temperature')>=0;return{ok,detail:ok?'the temperature provided (fields: '+F.join(', ')+')':'no temperature field'};},
 fauna(A,n,ok){const land=A.filter(a=>a.role!=='flyer'&&a.role!=='water'),bad=land.filter(a=>!ok(a)),fly=A.filter(a=>a.role==='flyer'&&a.at[1]<terrainH(a.at[0],a.at[2])+40),
   sw=A.filter(a=>a.role==='water'&&!(waterH(a.at[0],a.at[2])>-1e8));
  return{ok:A.length>0&&n>=A.length&&!bad.length&&!fly.length&&!sw.length,detail:(bad.length?bad.length+' animals in the water or the works (first '+bad[0].key+'); ':'')+(fly.length?fly.length+' flyers on the ground; ':'')+
   (sw.length?sw.length+' swimmers out of the water; ':'')+A.length+' animals ('+A.filter(a=>a.role==='flyer').length+' aloft, '+A.filter(a=>a.role==='water').length+' swimming), '+n+' fauna records'};},
};
const groundUnits=()=>(typeof KSHADOW!=='undefined'&&KSHADOW.units?KSHADOW.units(MAT_GROUND,renderer):0)+1;
const animalOk=a=>a.role==='people'?STAGE.fauna.ok(a.at[0],a.at[2],true):STAGE.fauna.ok(a.at[0],a.at[2]);
function STATION_CHECKS(add){
 add('the far field on the scale model\'s heights at this station',GCHK.far(OG_FAR));
 add('the ground within 16 texture units (counted)',GCHK.units(groundUnits(),16));
 add('preset cameras over the drawn ground',GCHK.drawn(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(FLOW_DRAWS.length)add('the water lies on its line (a ribbon, not a wall)',GCHK.flat(FLOW_DRAWS));
 if(STAGE.worksNeed)add('the works recorded',GCHK.works(REG,STAGE.worksNeed));
 if(STAGE.inWorks)add('nothing grows in the works',GCHK.clear(OGATE.TREES||[],STAGE.inWorks));
 if(WIND)add('the gap\'s wind: down it by night, up it by day',GCHK.wind(h=>ATMOS.katabaticWind(h,0,WIND_O)));
 if(WIND&&BANNERS.length)add('the banners stream downwind',GCHK.banners(BANNERS,WIND.wind));
 if(STAGE.wetPts)add('the water drowns, the dry ground does not (core/hazard)',GCHK.drown(STAGE.wetPts()));
 if(HAZ.flood)add('the outburst flood on its cycle (a tell, the flood, idle)',GCHK.flood(HAZ.flood,HAZ.cycle));
 if(STAGE.heat)add('the heat provided (ambient)',GCHK.heat(KHAZ.provided()));
 if(FAUNA.plan){const A=FAUNA.plan.animals.concat(STATION_FAUNA||[]),T=BIO.tagReg(),n=T?T.query({'class':'life'}).filter(r=>r.kind!=='herd').length:0;
  add('the fauna recorded, off the water and the works, the flyers aloft',GCHK.fauna(A,n,animalOk));}
 if(STAGE.checks)STAGE.checks(add);}
function STATION_NEGATIVES(add){
 add('a far field not the model\'s',GCHK.far({map:'5.1',cx:0,cy:0,r:1,h:[[0]]}));
 add('a ground reading 17 texture units',GCHK.units(17,16));
 add('a camera under the drawn ground',GCHK.drawn([{view:'under',x:100,y:Math.min(terrainH(100,100),drawnH(100,100))-3,z:100}]));
 if(FLOW_DRAWS.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,3900,0,1,0,0],3));add('a water ribbon stood on end',GCHK.flat([{F:{name:'test',pts:[[0,0,0],[1,0,0]]},d:{mesh:{geometry:g}}}]));}
 if(STAGE.worksNeed)add('a work with no record',GCHK.works([],STAGE.worksNeed.slice(0,1)));
 if(STAGE.inWorks&&STAGE.worksAt)add('a tree in the works',GCHK.clear([{key:'test',x:STAGE.worksAt[0],z:STAGE.worksAt[1]}],STAGE.inWorks));
 if(WIND)add('a wind blowing up the gap by night',GCHK.wind(h=>ATMOS.katabaticWind(h,0,Object.assign({},WIND_O,{down:[-GAP_DOWN[0],-GAP_DOWN[1]]}))));
 if(WIND&&BANNERS.length){const B=BANNERS[0],a=B.rotation.y;B.rotation.y=a+Math.PI;const r=GCHK.banners([B],WIND.wind);B.rotation.y=a;add('a banner streaming into the wind',r);}
 if(STAGE.wetPts){const d=STAGE.wetPts().find(p=>!p.wet);if(d)add('a dry point claimed as water',GCHK.drown([Object.assign({},d,{wet:true})]));}
 if(HAZ.flood)add('a flood with no cycle (always on)',GCHK.flood({tags:{hazard:{kind:'drown',shape:{type:'box',w:10,d:10,h:5}}},x:0,y:0,z:0},HAZ.cycle));
 if(STAGE.heat)add('no temperature provided',GCHK.heat([]));
 if(FAUNA.plan&&STAGE.fauna.badAt){const a=FAUNA.plan.animals.find(a=>a.role!=='flyer'&&a.role!=='water'),p=STAGE.fauna.badAt;
  if(a)add('an animal where none may stand ('+p[2]+')',GCHK.fauna([Object.assign({},a,{at:[p[0],terrainH(p[0],p[1]),p[1]]})],1e9,animalOk));}
 if(STAGE.negatives)STAGE.negatives(add);}
