// ================================================================= HOST — a later station's views and checks (read by src/99-host-take.js)
// The views are the stage's (STAGE.views: found on the map from what was placed, OUTL.INST, never typed). The checks are the colony rule's
// (PLAN.md section 4) for whatever types the station holds, station 1's (src/98-host-views.js) generalised: every form of the station's
// types placed and tagged; every colony form inside its own colony's territory; wardens on seams and nothing else on one; miners on the
// ore; runners on the reach; nurses by the nests; floating forms on the water; seams between the stage's unlike pairs; the ground within
// 16 texture units; the cameras on the DRAWN ground. Then the stage's own (STAGE.checks). Each has a negative control that must fail.
const STATION_TITLE=STAGE.title;
const STATION_HINT=STAGE.hint;
function STATION_VIEWS(){return STAGE.views();}
const COLCHK={
 placed(C,keys){const zero=keys.filter(k=>!(C[k]>0));return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):keys.length+' forms placed, the scarcest '+keys.map(k=>k+' '+C[k]).sort((a,b)=>+a.split(' ')[1]-+b.split(' ')[1])[0]};},
 tagged(L){const bad=[];for(const S of L){const t=S.tags||{},k=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||(S.type&&t.colony!==S.type)||OUTL.ROLES.indexOf(t.role)<0||!t.harvest||!k.length||k.some(c=>OUTL.REGION_KOPPEN.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged, without a colony or role, or tagged outside the region: '+bad.join(', '):L.length+' forms tagged with their colony type (or none: the decay layer) and role'};},
 owned(I){const A={},C=I.filter(f=>f.colony),bad=C.filter(f=>{OUTL.COLONY.at(f.x,f.z,A);return !A.c||A.c.id!==f.colony||A.c.type!==f.type;});
  return{ok:C.length>0&&!bad.length,detail:bad.length?bad.length+' forms outside their colony\'s territory (first '+bad[0].key+' of '+bad[0].colony+')':C.length+' colony forms, each inside its own colony\'s territory'};},
 seams(I){const A={},C=I.filter(f=>f.colony),bad=C.filter(f=>{OUTL.COLONY.at(f.x,f.z,A);return f.role==='warden'?!A.seam:A.seam;});
  return{ok:!bad.length,detail:bad.length?bad.length+' wrong (first a '+bad[0].key+(bad[0].role==='warden'?' off a seam':' on a seam')+')':C.filter(f=>f.role==='warden').length+' wardens on seams, '+C.filter(f=>f.role!=='warden').length+' other forms off them'};},
 ore(I){const m=I.filter(f=>f.role==='miner'),bad=m.filter(f=>!(FIELD.oreX(f.x,f.z)>.2));return{ok:m.length>0&&!bad.length,detail:bad.length?bad.length+' of '+m.length+' miners off the ore':m.length+' miners, every one on a copper or turquoise bed, a pit or its spoil'};},
 reach(I){const A={},r=I.filter(f=>f.role==='runner'),bad=r.filter(f=>{OUTL.COLONY.at(f.x,f.z,A);return f.type==='wadi'?!(OUTL.allow('wadi',f.x,f.z)===1||(FIELD.wadiX(f.x,f.z)>=.5&&FIELD.wadiX(f.x,f.z)<.99)):A.level!==1;});
  return{ok:r.length>0&&!bad.length,detail:bad.length?bad.length+' of '+r.length+' runners on their colony\'s core':r.length+' runners, each on its colony\'s reach (cords only)'};},
 nurse(I){const n=I.filter(f=>f.role==='nurse'),near=n.filter(f=>(f.nest==null?0:f.nest)>.05);return{ok:n.length>0&&near.length/n.length>.6,detail:near.length+' of '+n.length+' brood pads within a nest\'s ground (over 60% must be)'};},
 floats(I){const fl=I.filter(f=>f.float),bad=fl.filter(f=>!(waterH(f.x,f.z)-terrainH(f.x,f.z)>.2)||Math.abs(f.y-waterH(f.x,f.z))>.05);
  return{ok:fl.length>0&&!bad.length,detail:bad.length?bad.length+' of '+fl.length+' floating forms off the water':fl.length+' mire pads afloat, each on water over .2 m deep at its level'};},
 unlike(W,pairs){const got=new Set();W.forEach(f=>{if(f.c2type&&f.c2type!==f.type)got.add([f.type,f.c2type].sort().join('|'));});const miss=pairs.map(p=>p.slice().sort().join('|')).filter(p=>!got.has(p));
  return{ok:!miss.length&&(got.size>0||!pairs.length),detail:miss.length?'no warden on a seam between '+miss.join(', ')+(got.size?' (found '+[...got].join(', ')+')':''):got.size?'wardens stand on seams between '+[...got].join(', '):'no unlike seam asked'};},
 units(n,max){return{ok:n<=max,detail:n+' of '+max+' texture units on the ground (its map, '+KGL.length+' library layers, the horizon, the rain cover, the height fog; +1 for the shadow map)'};},
 drawn(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),drawnH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the drawn ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras over the drawn ground (the mesh\'s triangles)'};},
};
const STATION_FORMS=STAGE.types.reduce((a,t)=>a.concat(Object.values(OUTL.byType[t].forms)),[]).filter((k,i,a)=>a.indexOf(k)===i)
 .concat(STAGE.build&&STAGE.build.decay?(STAGE.decayForms||[]):[]);
const groundUnits=()=>(typeof KSHADOW!=='undefined'&&KSHADOW.units?KSHADOW.units(MAT_GROUND,renderer):0)+1;
function STATION_CHECKS(add){const I=OUTL.INST,R=I.map(f=>f.role);
 add('every form of the station\'s colonies placed',COLCHK.placed(OUTL.PLACED,STATION_FORMS));
 add('every form tagged with its colony type and role',COLCHK.tagged(STATION_FORMS.map(k=>OUTL.byKey[k])));
 add('every form inside its own colony\'s territory',COLCHK.owned(I));
 add('wardens only on seams, nothing else on one',COLCHK.seams(I));
 if(R.indexOf('miner')>=0)add('miners only on the ore',COLCHK.ore(I));
 if(R.indexOf('runner')>=0)add('runners on the reach, not the core',COLCHK.reach(I));
 if(R.indexOf('nurse')>=0)add('nurses by the nests',COLCHK.nurse(I));
 if(I.some(f=>f.float))add('floating forms on the water',COLCHK.floats(I));
 if(STAGE.unlike)add('seams between colonies of different types ('+STAGE.unlike.map(p=>p.join('|')).join(', ')+')',COLCHK.unlike(I.filter(f=>f.role==='warden'),STAGE.unlike));
 add('the ground within 16 texture units (counted)',COLCHK.units(groundUnits(),16));
 add('preset cameras over the drawn ground',COLCHK.drawn(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(STAGE.checks)STAGE.checks(add);}
function STATION_NEGATIVES(add){const I=OUTL.INST,A={},C=I.filter(f=>f.colony);
 const v=C.find(f=>f.role!=='warden'),w=C.find(f=>f.role==='warden'),m=C.find(f=>f.role==='miner'),r=C.find(f=>f.role==='runner'&&f.type!=='wadi'),nu=C.find(f=>f.role==='nurse'),fl=C.find(f=>f.float);
 const P=Object.assign({},OUTL.PLACED);P[STATION_FORMS[0]]=0;add('a form never placed',COLCHK.placed(P,STATION_FORMS));
 const S0=OUTL.byKey[STATION_FORMS[0]];add('a form with no role',COLCHK.tagged([Object.assign({},S0,{tags:Object.assign({},S0.tags,{role:'gardener'})})]));
 add('a form tagged outside the region',COLCHK.tagged([Object.assign({},S0,{tags:Object.assign({},S0.tags,{koppen:['Af']})})]));
 if(v){const o=OUTL.COLONY.colonies.find(c=>c.id!==v.colony);add('a form credited to another colony',COLCHK.owned([Object.assign({},v,{colony:o.id})]));}
 if(w){let p=null;for(let k=1;k<80&&!p;k++)for(const [dx,dz] of [[3,0],[0,3],[-3,0],[0,-3]]){const x=w.x+k*dx,z=w.z+k*dz;OUTL.COLONY.at(x,z,A);if(A.c&&!A.seam){p={x,z};break;}}
  if(p)add('a warden moved off its seam',COLCHK.seams([Object.assign({},w,p)]));}
 if(v&&w)add('a form on a seam',COLCHK.seams([Object.assign({},v,{x:w.x,z:w.z})]));
 if(m){let p=null;for(let k=0;k<2000&&!p;k++){const x=-3000+(k%50)*120,z=-3000+Math.floor(k/50)*150;if(!(FIELD.oreX(x,z)>.2))p={x,z};}if(p)add('a miner on bare ground',COLCHK.ore([Object.assign({},m,p)]));}
 if(r){const c=OUTL.COLONY.colonies.find(c=>c.id===r.colony);add('a runner at its colony\'s seed (the core)',COLCHK.reach([Object.assign({},r,{x:c.x,z:c.z})]));}
 if(nu)add('brood pads far from any nest',COLCHK.nurse([Object.assign({},nu,{nest:0})]));
 if(fl)add('a mire pad on dry ground',COLCHK.floats([Object.assign({},fl,{x:0,z:0,y:terrainH(0,0)})]));
 if(STAGE.unlike&&STAGE.unlike.length)add('wardens only between colonies of one type',COLCHK.unlike([{type:STAGE.unlike[0][0],c2type:STAGE.unlike[0][0]}],STAGE.unlike));
 add('a ground reading 17 texture units',COLCHK.units(17,16));
 add('a camera under the drawn ground',COLCHK.drawn([{view:'under',x:100,y:Math.min(terrainH(100,100),drawnH(100,100))-3,z:100}]));
 if(STAGE.negatives)STAGE.negatives(add);}
