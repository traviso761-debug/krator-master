// ================================================================= HOST — the Fog Wall's views and checks (read by 99-host-take.js)
// The views are found on the map from what was placed (OUTL.INST: each form's colony, role and place), not typed. The checks are the
// colony rule's (PLAN.md section 4): every form inside its own colony's territory, wardens only on seams and nothing else on one,
// miners only on the ore, runners on the colony's reach, seams between colonies of different types; each has a negative control.
const STATION_TITLE='the Fog Wall';
const STATION_HINT='The Outlands, station 1: the Fog Wall, one slope from the fog belt (3.5-4.4 km) down to the gem shoulder (2.3 km). The flora is COLONIAL: each patch of one colour is one organism, a buried mycelium raising three or four forms; the dark lines between them are the seams where two colonies wall each other off. Veil colonies in the fog (veil caps, lantern stalks, fog pelt) with their pleat columns on the dry ledges below; mast colonies on the wet band with comb masts standing on their seams; copper colonies on the shoulder, their lace crust on the copper beds; wadi colonies in the dry channels';
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
// the placed form of a key nearest a point (with a filter), or a stand-in at the point
function nearForm(key,x,z,f){let b=null,bd=1e18;for(const I of OUTL.INST){if(I.key!==key||(f&&!f(I)))continue;const d=(I.x-x)**2+(I.z-z)**2;if(d<bd){bd=d;b=I;}}return b||{x,z,y:gh(x,z),H:6,cr:3};}
function atForm(I,d,az,dy,ty){const cx=I.x+Math.cos(az)*d,cz=I.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),I.y+(dy==null?2:dy)),cz,I.x,I.y+(ty==null?(I.H==null?2:I.H)*.5:ty),I.z];}
function STATION_VIEWS(){
 const V=nearForm('veilcap',0,-1700,I=>I.H>12),L=nearForm('lantern',V.x,V.z),P=nearForm('pleatcol',0,-300),D=nearForm('deckcap',0,200),
  W=nearForm('combmast',0,300),W2=nearForm('combmast',W.x,W.z,I=>I!==W&&I.colony===W.colony&&Math.hypot(I.x-W.x,I.z-W.z)>25),
  Lc=nearForm('lacecrust',-1000,2200),Dr=nearForm('drums',600,1800),St=nearForm('stilt',ravX(RAV[1],2000),2000),Cu=nearForm('curtain',0,-600);
 const dx=W2.x-W.x,dz=W2.z-W.z,dl=Math.hypot(dx,dz)||1;
 return{
  'The fog wall from the shoulder':look(200,2900,30,0,-1400,150),
  'The mosaic from the crest':look(-300,-3000,420,200,1200,0),
  'A veil cap':atForm(V,V.H*1.1,.7,V.H*.35,V.H*.75),
  'Under the veil caps':(function(){const a=.4;return[V.x+Math.cos(a)*6,gh(V.x+Math.cos(a)*6,V.z+Math.sin(a)*6,1.7),V.z+Math.sin(a)*6,V.x-Math.cos(a)*60,gh(V.x-Math.cos(a)*60,V.z-Math.sin(a)*60,8),V.z-Math.sin(a)*60];})(),
  'Lantern stalks':atForm(L,9,2.1,2.5,(L.H==null?5:L.H)*.9),
  'A line of comb masts on a seam':(function(){const cx=W.x-dx/dl*30+dz/dl*8,cz=W.z-dz/dl*30-dx/dl*8;return[cx,gh(cx,cz,3),cz,W2.x,gh(W2.x,W2.z,6),W2.z];})(),
  'Deck caps on the wet band':atForm(D,24,2.6,3,(D.H==null?8:D.H)*.6),
  'Pleat columns on the dry ledges':atForm(P,18,1.2,3,(P.H==null?5:P.H)*.5),
  'Curtain weed on a seep':atForm(Cu,8,1.9,1.5,1.5),
  'Lace crust on the copper beds':atForm(Lc,16,.9,4,.5),
  'Drums and green fans':atForm(Dr,9,2.4,2.2,.5),
  'The open-cast pit':look(PIT.c[0]+PIT.r*2.2,PIT.c[1]+PIT.r*1.2,35,PIT.c[0],PIT.c[1],-PIT.depth*.6),
  'A wadi and its stilt mounds':atForm(St,14,.3,2.5,.8),
  'The seams from above':(function(){const x=W.x,z=W.z;return[x+40,gh(x+40,z+60,180),z+60,x,gh(x,z),z];})(),
 };}
// ---------------------------------------------------------------- the colony rule's checks
const COLCHK={
 placed(C,keys){const zero=keys.filter(k=>!(C[k]>0));return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):keys.length+' forms placed, the scarcest '+keys.map(k=>k+' '+C[k]).sort((a,b)=>+a.split(' ')[1]-+b.split(' ')[1])[0]};},
 tagged(L){const bad=[];for(const S of L){const t=S.tags||{},k=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!t.colony||OUTL.ROLES.indexOf(t.role)<0||!t.harvest||!k.length||k.some(c=>!(c in OUTL.KOPPEN)))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged, without a colony or role, or tagged outside the region: '+bad.join(', '):L.length+' forms tagged with their colony type and role'};},
 owned(I){const A={},bad=I.filter(f=>{OUTL.COLONY.at(f.x,f.z,A);return !A.c||A.c.id!==f.colony||A.c.type!==f.type;});
  return{ok:!bad.length,detail:bad.length?bad.length+' forms outside their colony\'s territory (first '+bad[0].key+' of '+bad[0].colony+')':I.length+' forms, each inside its own colony\'s territory'};},
 seams(I){const A={},bad=I.filter(f=>{OUTL.COLONY.at(f.x,f.z,A);return f.role==='warden'?!A.seam:A.seam;});
  return{ok:!bad.length,detail:bad.length?bad.length+' wrong (first a '+bad[0].key+(bad[0].role==='warden'?' off a seam':' on a seam')+')':I.filter(f=>f.role==='warden').length+' wardens on seams, '+I.filter(f=>f.role!=='warden').length+' other forms off them'};},
 ore(I){const m=I.filter(f=>f.role==='miner'),bad=m.filter(f=>!(FIELD.oreX(f.x,f.z)>.2));return{ok:m.length>0&&!bad.length,detail:bad.length?bad.length+' of '+m.length+' miners off the ore':m.length+' miners, every one on a copper or turquoise bed, the pit or its spoil'};},
 reach(I){const A={},r=I.filter(f=>f.role==='runner'),bad=r.filter(f=>{OUTL.COLONY.at(f.x,f.z,A);return f.type==='wadi'?!(FIELD.wadiX(f.x,f.z)>=.5&&FIELD.wadiX(f.x,f.z)<.99):A.level!==1;});
  return{ok:r.length>0&&!bad.length,detail:bad.length?bad.length+' of '+r.length+' runners on their colony\'s core':r.length+' runners, each on its colony\'s reach (cords only)'};},
 unlike(W){const pairs=new Set();W.forEach(f=>{if(f.c2type&&f.c2type!==f.type)pairs.add([f.type,f.c2type].sort().join('|'));});
  return{ok:pairs.has('mast|veil')&&pairs.has('copper|mast'),detail:pairs.size?'wardens stand on seams between '+[...pairs].join(', '):'no seam between unlike colonies'};},
 units(n,max){return{ok:n<=max,detail:n+' of '+max+' texture units on the ground (its map, the library layers, the horizon, the rain cover, the height fog; +1 for the shadow map)'};}};
function STATION_CHECKS(add){const I=OUTL.INST;
 add('every form of the station\'s colonies placed',COLCHK.placed(OUTL.PLACED,STATION_FORMS));
 add('every form tagged with its colony type and role',COLCHK.tagged(STATION_FORMS.map(k=>OUTL.byKey[k])));
 add('every form inside its own colony\'s territory',COLCHK.owned(I));
 add('wardens only on seams, nothing else on one',COLCHK.seams(I));
 add('miners only on the ore',COLCHK.ore(I));
 add('runners on the reach, not the core',COLCHK.reach(I));
 add('seams between colonies of different types (veil|mast, mast|copper)',COLCHK.unlike(I.filter(f=>f.role==='warden')));
 /* the ground's texture units, counted (KSHADOW.units: its map, the three library layers, the horizon, the rain cover, the height fog), +1 the shadow map */
 add('the ground within 16 texture units (counted)',COLCHK.units((typeof KSHADOW!=='undefined'&&KSHADOW.units?KSHADOW.units(MAT_GROUND,renderer):0)+1,16));}
function STATION_NEGATIVES(add){const I=OUTL.INST,A={};
 const v=I.find(f=>f.key==='veilcap'),w=I.find(f=>f.role==='warden'),m=I.find(f=>f.role==='miner'),r=I.find(f=>f.key==='pleatcol');
 const C=Object.assign({},OUTL.PLACED);C[STATION_FORMS[0]]=0;add('a form never placed',COLCHK.placed(C,STATION_FORMS));
 add('a form with no role',COLCHK.tagged([Object.assign({},OUTL.byKey.veilcap,{tags:Object.assign({},OUTL.byKey.veilcap.tags,{role:'gardener'})})]));
 if(v){const o=OUTL.COLONY.colonies.find(c=>c.id!==v.colony);add('a veil cap credited to another colony',COLCHK.owned([Object.assign({},v,{colony:o.id})]));}
 if(w){let p=null;for(let k=1;k<60&&!p;k++){const x=w.x+k*3,z=w.z;OUTL.COLONY.at(x,z,A);if(A.c&&!A.seam)p={x,z};}if(p)add('a warden moved off its seam',COLCHK.seams([Object.assign({},w,p)]));}
 if(v){let p=null;for(const f of I)if(f.role==='warden'){p={x:f.x,z:f.z};break;}if(p)add('a veil cap on a seam',COLCHK.seams([Object.assign({},v,p)]));}
 if(m)add('a miner on bare gravel',(function(){for(let k=0;k<400;k++){const x=-2400+k*12,z=1800;if(!(FIELD.oreX(x,z)>.2)&&FIELD.wadiX(x,z)===0)return COLCHK.ore([Object.assign({},m,{x,z})]);}return{ok:true,detail:'no bare gravel found'};})());
 if(r){const c=OUTL.COLONY.colonies.find(c=>c.id===r.colony);add('a pleat column at its colony\'s seed (the core)',COLCHK.reach([Object.assign({},r,{x:c.x,z:c.z})]));}
 add('wardens only between veil colonies',COLCHK.unlike([{type:'veil',c2type:'veil'}]));
 add('a ground reading 17 texture units',COLCHK.units(17,16));}
const STATION_FORMS=OUTL.TYPES.filter(T=>T.station).reduce((a,T)=>a.concat(Object.values(T.forms)),[]).filter((k,i,a)=>a.indexOf(k)===i);
