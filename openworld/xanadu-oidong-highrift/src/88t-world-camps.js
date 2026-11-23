// ================================================================= XANADU'S REGIONS — the pitched camps drawn: the Tears' ring, the caravan's halt
// [web] Draws KWCAMPS' plan (48t, from the region's WORLD_CAMPS); it decides nothing (a builder draws a record). Read in place
// by openworld/xanadu-lake-shore too. At load (LATE, after the sites): every record registered in core/tags (build
// '<region>:camps': each camp a landmark, its tents its children, its hedge infrastructure, its works industry), the world's
// flora and floor kept off the camp's ground (WORLD.clearHook, chained), then drawn. THE TENTS ARE MASSING, NOT THE KIT'S: the
// Tents kit (kits/tents) is not sealed for another world yet (KNOWN_ISSUES.md: a tents bundle is owed, as XAK is the Xanadu
// kit's), so each tent is its form's mass at its box in its dress's colours (a drum and cone for the round forms, walls and a
// hip roof for the long ones, a sheet on poles for a fly); the zariba a ring of thorn clumps with its ditch, one gate; the
// placer sluices, pits and tailings stand-ins at core/hamlet's pending boxes (the region's XAK lacks kits/xanadu/extra 88g).
// Each camp is drawn twice, PITCHED and STRUCK (the hedge's low ring and the pits left), and the world clock's year day picks
// one every frame (KWCAMPS.inSeason). window._worldCamps holds the plan, the counts and the checks verify.py reads.
var WORLD_CAMPS_DRAW;LATE.push(()=>{WORLD_CAMPS_DRAW=(function(){'use strict';
const scene=HOST.scene,H=(x,z)=>WORLD.H(x,z),t0=performance.now();
const SPEC=typeof WORLD_CAMPS!=='undefined'?WORLD_CAMPS:{camps:[]};
const dims=KCAMP.tentDims(k=>tnDims(k)),ground={ok:KSITES.groundOk};
const PLAN=KWCAMPS.plan(SPEC,{dims,ground,sites:WORLD_DATA.meta.sites||[],inside:(x,z)=>WORLD.inside(x,z)});
const S={camps:PLAN.camps.length,uncut:PLAN.uncut.map(u=>u.id+': '+u.why),records:0,works:0,errors:PLAN.errors.slice(),drawn:0,ms:0};
const TAGS=KTAGS.create({build:((WORLD_DATA.meta.cut||{}).region||'region')+':camps'});
const CULT=c=>KTAGS.VOCAB.cultures.indexOf(c)>=0?c:'generic';
/* ---------------------------------------------------------------- the records into core/tags, before anything is drawn */
const tagCamp=(C,cult)=>{const base=TAGS.add({class:'landmark',kind:'camp',key:C.id,name:C.name,at:[C.site.x,H(C.site.x,C.site.z),C.site.z],r:(C.R||60)+40,h:10,
  tags:{culture:CULT(cult),types:['civic'],role:'camp'},note:(C.people?C.people+' people, ':'')+C.records.length+' tents; pitched '+C.season.days.map(d=>d.join('-')).join(', ')+' (year days)'});
 for(const r of C.records){S.records++;TAGS.child(base.id,{class:'building',key:r.def||r.key,at:[r.x,H(r.x,r.z),r.z],ry:r.ry,size:[r.w,r.d,r.h],
   tags:{culture:CULT(cult),types:r.goldRoom?['industry']:['residential'],role:r.goldRoom?'the gold room':(r.role||undefined)}});}
 if(C.hedge)TAGS.child(base.id,{class:'infrastructure',kind:'hedge',key:C.hedge.key,at:[C.site.x,H(C.site.x,C.site.z),C.site.z],size:[C.R*2,C.R*2,2],tags:{culture:CULT(cult)}});
 for(const w of C.works){S.works++;TAGS.child(base.id,{class:'building',key:w.key,at:[w.x,H(w.x,w.z),w.z],ry:w.ry,size:[w.w,w.d,w.h],tags:{culture:CULT(cult),types:['industry'],role:w.kind}});}
 return base;};
for(const C of PLAN.camps){const cult=C.kind==='halt'?(SPEC.camps.find(s=>s.id===C.id)||{}).culture:'xanadu';tagCamp(C,cult);
 if(C.escort)tagCamp(Object.assign({season:C.season,works:[],kind:'ring'},C.escort),'xanadu');}
/* the camps' ground kept clear of the world's flora and floor (as 88s keeps its camps'): a disc of the camp's reach */
const DISCS=[];for(const C of PLAN.camps){DISCS.push([C.site.x,C.site.z,(C.R||60)+30]);if(C.escort)DISCS.push([C.escort.site.x,C.escort.site.z,C.escort.R+25]);}
const prevClear=WORLD.clearHook;
/* clearOff: the ground rule as the plan read it (WORLD.townW counts what the clear hook keeps clear: 88s's note) */
let clearOff=false;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(clearOff)return false;for(const d of DISCS)if(Math.abs(x-d[0])<d[2]&&Math.abs(z-d[1])<d[2]&&Math.hypot(x-d[0],z-d[1])<d[2])return true;return false;};
/* ---------------------------------------------------------------- the pieces: instanced by shape and colour */
const T3=THREE,GEO={drum:new T3.CylinderGeometry(1,1,1,14),cone:new T3.ConeGeometry(1,1,14),box:new T3.BoxGeometry(1,1,1),hip:new T3.ConeGeometry(Math.SQRT1_2,1,4),
 clump:new T3.DodecahedronGeometry(1,0),disc:new T3.CylinderGeometry(1,1,1,10),mound:new T3.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2)};
GEO.hip.rotateY(Math.PI/4);
const lin=h=>new T3.Color(h).convertSRGBToLinear();
/* the dresses' colours (kits/tents/src/41-tn-dress.js names them: the Xanadu silk's white with its saffron and maroon, the
   generic undyed canvas the Dalab caravan falls back to: the Tents kit has no Dalab dress yet) */
const DRESS={xanadu:{wall:0xeee6d4,roof:0xd89a2a,trim:0x7a2430},generic:{wall:0xcbbfa5,roof:0xb0a184,trim:0x6a5a48}};
const dress=r=>DRESS[r.dress]||DRESS.generic;
function Batch(){const by={};return{add(g,c,x,y,z,sx,sy,sz,ry){const k=g+':'+c;(by[k]=by[k]||{g,c,m:[]}).m.push([x,y,z,sx,sy,sz,ry||0]);},
 build(name){const G=new T3.Group();G.name=name;const m4=new T3.Matrix4(),q=new T3.Quaternion(),e=new T3.Euler(),v=new T3.Vector3(),s=new T3.Vector3();
  for(const k in by){const B=by[k],M=new T3.InstancedMesh(GEO[B.g],new T3.MeshStandardMaterial({color:lin(B.c),roughness:.9,metalness:0}),B.m.length);
   B.m.forEach((a,i)=>{q.setFromEuler(e.set(0,a[6],0));m4.compose(v.set(a[0],a[1],a[2]),q,s.set(a[3],a[4],a[5]));M.setMatrixAt(i,m4);});
   M.instanceMatrix.needsUpdate=true;M.castShadow=M.receiveShadow=true;M.name=name+':'+k;
   M.userData.probePoints=[].concat(...B.m.map(a=>[a[0],a[1],a[2]]));G.add(M);}
  return G;}};}
const ROUND={bell:1,cone:1,yurt:1};
function tent(B,r){const p=KCAMP.tentParse(r.key),f=(/^tn-([a-z]+)-/.exec(p.key||r.def||'')||[])[1]||'ridge',D=dress(r),y=H(r.x,r.z),h=r.h||3,c=Math.cos(r.ry),s=Math.sin(r.ry);
 /* the tent's own box (KCAMP.tentDims grew it by the role's yard): the mass stands in the box less its yard */
 const yd=KCAMP.TENTS.YARD[r.role]||0,w=Math.max(1.6,r.w-yd),d=Math.max(1.6,r.d-yd);
 if(ROUND[f]){const R=Math.min(w,d)/2*.92;B.add('drum',D.wall,r.x,y+h*.22,r.z,R,h*.44,R);B.add('cone',r.goldRoom?D.trim:D.roof,r.x,y+h*.44+h*.28,r.z,R*1.05,h*.56,R*1.05);}
 else if(f==='fly'||f==='awning'){B.add('box',D.roof,r.x,y+h*.85,r.z,w*.95,.08,d*.95,r.ry);for(const a of[-1,1])for(const b of[-1,1])B.add('box',0x5a4632,r.x+c*a*w*.42+s*b*d*.42,y+h*.42,r.z-s*a*w*.42+c*b*d*.42,.1,h*.85,.1);}
 else if(f==='screen'){B.add('box',D.wall,r.x,y+.9,r.z,w*.9,1.8,.08,r.ry);}
 else if(f==='wagon'){B.add('box',0x6a5038,r.x,y+.8,r.z,w*.8,.9,d*.9,r.ry);B.add('hip',D.wall,r.x,y+1.25+.6,r.z,w*.82,1.2,d*.9,r.ry);
  for(const a of[-1,1])for(const b of[-1,1])B.add('disc',0x3a2e22,r.x+c*a*w*.45+s*b*d*.32,y+.45,r.z-s*a*w*.45+c*b*d*.32,.45,.12,.45,r.ry+Math.PI/2);}
 else{B.add('box',D.wall,r.x,y+h*.25,r.z,w*.92,h*.5,d*.92,r.ry);B.add('hip',r.role==='chief'||r.goldRoom?D.trim:D.roof,r.x,y+h*.5+h*.25,r.z,w*.98,h*.5,d*.98,r.ry);}}
function hedge(B,L,site,gateD,low){if(!L)return 0;let n=0,acc=0;const P=L.pts,GAP=7,step=low?5:2.6;
 for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],seg=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let t=0;t<seg;t+=step){const d=acc+t;if(L.gates.some(g=>Math.abs(g-d)<GAP/2))continue;const x=a[0]+(b[0]-a[0])*t/seg,z=a[1]+(b[1]-a[1])*t/seg,
    k=KRAND.unit(KRAND.hash(7123,Math.round(x*10),Math.round(z*10))),sc=(low?.5:1)*(1.1+.5*k);
   B.add('clump',low?0x6a5a40:0x4f4230,x,H(x,z)+sc*.45,z,sc*1.3,sc*.85,sc*1.3,k*6);n++;
   /* the ditch outside the hedge */
   if(!low){const ox=x-site.x,oz=z-site.z,o=Math.hypot(ox,oz)||1;B.add('box',0x3e352a,x+ox/o*3.2,H(x+ox/o*3.2,z+oz/o*3.2)+.02,z+oz/o*3.2,2.2,.06,step+.2,Math.atan2(ox,oz)+Math.PI/2);}}
  acc+=seg;}
 return n;}
function works(B,C,only){for(const w of C.works){if(only&&only.indexOf(w.kind)<0)continue;const y=H(w.x,w.z);
  if(w.kind==='sluice'){B.add('box',0x8a7458,w.x,y+.6,w.z,w.w*.25,1.2,w.d*.9,w.ry);B.add('box',0x4a7f8a,w.x,y+1.22,w.z,w.w*.18,.05,w.d*.85,w.ry);}
  else if(w.kind==='pit'){B.add('disc',0x3a3026,w.x,y+.03,w.z,w.w/2,.06,w.d/2,w.ry);B.add('mound',0x8a7e68,w.x+2.6,y,w.z+1.2,2.2,1.0,1.8);}
  else B.add('mound',0x9a907c,w.x,y,w.z,w.w/2,w.h,w.d/2);}}
const GROUPS=[];
for(const C of PLAN.camps){const pB=Batch(),sB=Batch();
 for(const r of C.records){tent(pB,r);S.drawn++;}
 if(C.escort)for(const r of C.escort.records){tent(pB,r);S.drawn++;}
 const nh=hedge(pB,C.hedge,C.site,C.gate,false);if(C.escort&&C.escort.hedge)hedge(pB,C.escort.hedge,C.escort.site,null,false);
 works(pB,C);
 if(C.struck&&C.struck.hedge)hedge(sB,C.hedge,C.site,C.gate,true);works(sB,C,C.struck?C.struck.works:[]);
 const gp=pB.build('camp:'+C.id+':pitched'),gs=sB.build('camp:'+C.id+':struck');scene.add(gp);scene.add(gs);
 GROUPS.push({C,pitched:gp,struck:gs,hedge:nh});}
/* ---------------------------------------------------------------- the season: the world clock's year day picks pitched or struck */
const today=()=>{const c=typeof CLOCK!=='undefined'&&CLOCK?CLOCK:null;return KWCAMPS.yearDay(c?c.day:0);};
function season(){const d=today();for(const g of GROUPS){const on=KWCAMPS.inSeason(g.C,d);g.pitched.visible=on;g.struck.visible=!on;}return d;}
season();if(typeof TICKS!=='undefined')TICKS.push(()=>season());
S.ms=Math.round(performance.now()-t0);
/* ---------------------------------------------------------------- the checks verify.py reads (each with a negative) */
function checks(neg){clearOff=true;try{return checks0(neg);}finally{clearOff=false;}}
function checks0(neg){const R=[],P=neg==='plan'?JSON.parse(JSON.stringify(PLAN)):PLAN;
 if(neg==='plan'&&P.camps[0]&&P.camps[0].records[1]){P.camps[0].records[0].x=P.camps[0].records[1].x;P.camps[0].records[0].z=P.camps[0].records[1].z;}
 for(const C of P.camps){const all=C.records.concat(C.escort?C.escort.records:[]);let ov=0,off=0;
  for(let i=0;i<all.length;i++){for(let j=i+1;j<all.length;j++)if(KCAMP.overlaps(all[i],all[j],.5))ov++;
   if(!KCAMP.box(all[i],0).every(q=>ground.ok(q[0],q[1])))off++;}
  R.push({name:'the camp '+C.id+': pitched whole on the world\'s ground, no two tents within half a metre',ok:!ov&&!off&&!C.short.length&&all.length>=8,
   detail:all.length+' tents, '+ov+' overlapping, '+off+' off good ground, '+C.short.length+' not pitched'});
  if(C.kind==='ring'){const gold=C.records.filter(r=>r.goldRoom).length,gates=C.hedge?C.hedge.gates.length:0,sl=C.works.filter(w=>w.kind==='sluice').length,
    pop=C.census?C.census.pop:0,want=C.people;
   R.push({name:'the camp '+C.id+': a fortified ring (its zariba with one gate), the captain\'s pavilion and the gold room, the sluices in the wadi\'s bed, about its people',
    ok:gates===1&&gold===1&&C.records.some(r=>r.role==='chief')&&sl>=2&&Math.abs(pop-want)<=want*.25,
    detail:'gates '+gates+', gold room '+gold+', sluices '+sl+(sl?' (the bed\'s flow '+(C.works.find(w=>w.kind==='sluice').flow||0).toFixed(2)+')':'')+', people '+pop+' / '+want+' (XAN_TUNE.tears.camp)'});}
  else{const wag=C.records.filter(r=>/wagon/.test(r.def||r.key)).length;
   R.push({name:'the halt '+C.id+': a laager of '+C.wagons+' wagons round the house\'s pavilion, the gate on the road, the escort\'s ring beside it',
    ok:C.formation==='laager'&&wag===C.wagons&&C.records.some(r=>r.role==='chief')&&!!(C.escort&&C.escort.records.length>=4),
    detail:wag+' wagons, '+C.records.length+' pieces, escort '+(C.escort?C.escort.records.length+' tents':'none')+(C.records[0]&&C.records[0].fallback?' (the dress: '+C.records[0].fallback+' falls back to generic)':'')});}
  /* the season: pitched inside its window, struck outside it (the negative reads the window backwards) */
  const W=C.season.days[0],inD=W[0],outD=(W[1]+40)%365,f=neg==='season'?(d=>!KWCAMPS.inSeason(C,d)):(d=>KWCAMPS.inSeason(C,d));
  R.push({name:'the camp '+C.id+': pitched in its season (year day '+inD+'), struck out of it (year day '+outD+')',ok:f(inD)&&!f(outD),
   detail:'window '+C.season.days.map(d=>d.join('-')).join(', ')+(C.season.name?' ('+C.season.name+')':'')+'; today year day '+today()});}
 for(const u of P.uncut)R.push({name:'the camp '+u.id+': awaiting the region\'s recut (not drawn)',ok:true,na:true,detail:u.why});
 R.push({name:'the pitched camps: planned with no error, every one drawn in its season\'s state',ok:!P.errors.length&&P.camps.length+P.uncut.length===SPEC.camps.length&&
   GROUPS.every(g=>g.pitched.visible===KWCAMPS.inSeason(g.C,today())&&g.struck.visible!==g.pitched.visible),
  detail:P.camps.length+' of '+SPEC.camps.length+' camps drawn'+(P.uncut.length?', '+P.uncut.length+' awaiting the recut':'')+(P.errors.length?'; errors: '+P.errors.join('; '):'')});
 return R;}
window._worldCamps={plan:PLAN,stats:S,checks,season,today};
return{plan:PLAN,stats:S};})();});
