// ================================================================= HOST — the stair's records, views and checks (station 1)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail);
// 88-host-build.js calls stationRecords before the kit builds.
// ---- the records (core/tags through REGISTER): the front, the cones, the tumuli, the procession's way, the frozen falls
function stationRecords(){const G=(x,z)=>terrainH(x,z);
 {const p=xzDA(ST.lip+1500,0);REGISTER({name:'Front 1, the trap stair (Virstolipos): the head step\'s lip falling ~700 m in benches of ponded flows',x:p[0],z:p[1],y:ST.y2-40,r:2600,h:ST.y1-ST.y2+120});}
 CONES.forEach(C=>REGISTER({name:C.name,x:C.x,z:C.z,y:G(C.x,C.z)-C.h-20,r:C.r,h:C.h+60}));
 STAIR.steps[0].tongues.forEach((T,i)=>{let n=0,sx=0,sz=0;for(let d=ST.lip-600;d<ST.lip+4000;d+=20){const p=xzDA(d,T.q),c=KRELIEF.at(STAIR,p[0],p[1],-1e9);if(c&&c.part==='tongue'&&inMap(p[0],p[1])){n++;sx+=p[0];sz+=p[1];}}
  if(!n)return;const x=sx/n,z=sz/n;REGISTER({name:'An old frozen lava fall (a flow poured over the lip and down the stair)',x,z,y:G(x,z)-200,r:Math.max(150,T.w),h:400});});
 /* the tumuli as two group records, one a step (each tumulus is too small for the probe's 4,000 samples to land on; its record is data) */
 let nt=0;[0,1].forEach(st=>{const T=TUMULI.filter(T=>inMap(T.x,T.z)&&(dOf(T.x,T.z)<ST.lip)===(st===0));nt+=T.length;if(!T.length)return;
  let x=0,z=0;T.forEach(t=>{x+=t.x;z+=t.z;});x/=T.length;z/=T.length;const r=Math.max(...T.map(t=>Math.hypot(t.x-x,t.z-z)))+40;
  REGISTER({name:T.length+' tumuli and pressure ridges on '+(st?'step 2\'s':'the head step\'s')+' baked lobes (each cracked along its crest)',x,z,y:(st?ST.y2:ST.y1)-80,r,h:200});});
 window._tumuli={all:TUMULI.length,inMap:nt};
 {const P=PATH.pts,m=P[Math.floor(P.length/2)];REGISTER({name:PATH.name,x:m[0],z:m[1],y:ST.y2-50,r:5200,h:ST.y1-ST.y2+200,path:true});}
 REGISTER({name:PLAYA.name,x:PLAYA.x,z:PLAYA.z,y:PLAYA.floor-4,r:PLAYA.r,h:14});}
// ---- the views, found in the built scene
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},P=(d,a)=>xzDA(d,a);
 // THE STATION'S VIEW (PLAN.md 7.1): on the head step's lip, the trap stair falling away to step 2's dark floor, the cones and dunes on it
 {let e=LIP.d+100;for(let d=LIP.d;d<LIP.d+900;d+=2){const p=P(d,-120);if(slopeAt(p[0],p[1])>1.1){e=d;break;}}   /* the lip's first steep riser: stand at its edge */
  const c=P(e-6,-120),t=P(e+1600,300);add('The stair from the lip',[c[0],G(c[0],c[1])+2.5,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // from step 2's floor back up at the front: the benches and colonnades, the frozen fall
 {const T=STAIR.steps[0].tongues.slice().sort((p,q)=>Math.abs(p.q-600)-Math.abs(q.q-600))[0],q=T?T.q+700:600,sp=frontSpan(q);
  const c=P((sp[1]||ST.lip+3000)+900,q-500),t=P(((sp[0]||ST.lip)+(sp[1]||ST.lip+3000))/2,q+100);add('The trap stair from below',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+60,t[1]]);}
 // a riser close: the colonnade over its talus of fallen columns
 {let best=null;for(let d=ST.lip+200;d<ST.lip+2600&&!best;d+=3){const p=P(d,-900),c=KRELIEF.at(STAIR,p[0],p[1],-1e9);if(c&&c.part==='front'&&slopeAt(p[0],p[1])>1.5)best=d;}
  if(best!=null){const c=P(best+70,-860),t=P(best-10,-930);add('A colonnade close',[c[0],G(c[0],c[1])+1.7,c[1],t[0],G(t[0],t[1])+14,t[1]]);}}
 // the black sand and a moss-skinned cone, from its north (the moss faces this way)
 {const C=CONES[0],c=[C.x+C.r*.4,C.z-C.r*1.7],t=[C.x,C.z];add('Moss cones in black sand',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])-C.h*.2,t[1]]);}
 // a tumulus on the head step's plain
 {const T=TUMULI.filter(T=>inMap(T.x,T.z)&&dOf(T.x,T.z)<ST.lip-200).sort((a,b)=>b.H-a.H)[0];if(T){const c=[T.x+T.L*1.4,T.z+T.L*.7];add('A tumulus',[c[0],G(c[0],c[1])+1.7,c[1],T.x,G(T.x,T.z)+T.H*.5,T.z]);}}
 // the playa behind its lobe
 {const c=P(dOf(PLAYA.x,PLAYA.z)+PLAYA.r*1.6,aOf(PLAYA.x,PLAYA.z)-PLAYA.r*.6);add('The playa',[c[0],G(c[0],c[1])+6,c[1],PLAYA.x,PLAYA.floor,PLAYA.z]);}
 // the procession's way at the lip: its cairns going over
 {const c=PATH.pts[1],t=PATH.pts[3];add('The procession\'s way',[c[0],G(c[0],c[1])+1.7,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // the Godthrone's mass to the south-west, from the head step
 {const c=P(-3800,-400),t=[c[0]-30000,c[1]+30000];add('The Godthrone to the south-west',[c[0],G(c[0],c[1])+2,c[1],t[0],REGION?REGION.y0+REGION.h(t[0],t[1])+1500:6000,t[1]]);}
 {const c=P(-6500,-5200),t=P(ST.lip+1000,0);add('Overview',[c[0],G(c[0],c[1])+1600,c[1],t[0],ST.y2+300,t[1]]);}
 {const c=P(LIP.d-40,300),t=P(LIP.d+2000,-600);add('Dawn on the stair',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1]),t[1]],'dawn');}}
// ---- the checks
// the model's heights: the head step's floor and step 2's, each against scale model 5.1 at the same place (the region's raster: its
// floors as drawn, PLAN.md section 1, "The kit follows the ground as drawn"), within 50 m
const SCHK={
 heights(rows){const bad=rows.filter(r=>Math.abs(r.page-r.model)>50);return{ok:rows.length>=4&&!bad.length,detail:rows.map(r=>r.name+' '+r.page.toFixed(0)+' m (5.1: '+r.model.toFixed(0)+')').join('; ')};},
 // the stair: along the axis the benches step down monotonically (no bench above the one before it), ~700 m in all, in many benches
 stair(S){let up=0,benches=0,last=null;for(let i=1;i<S.length;i++){if(S[i].y>S[i-1].y+1.5)up++;}
  for(const s of S){if(s.bench&&(last==null||last-s.y>8)){benches++;last=s.y;}}
  const drop=S[0].y-S[S.length-1].y;return{ok:up===0&&drop>620&&drop<780&&benches>=8,detail:'drop '+drop.toFixed(0)+' m in '+benches+' benches; '+up+' rises downstream'};},
 // the rock: the front's faces are the ponded flows (colonnades), their bead partings palagonite under the dry-cold line, no fresh bead
 rock(S){const k={},r={};S.forEach(q=>{k[q.kind]=(k[q.kind]||0)+1;r[q.recipe]=(r[q.recipe]||0)+1;});
  return{ok:S.length>150&&!k.bead&&(r['godstep-ponded']||0)>=S.length*.8&&(k.flow||0)>S.length*.5,detail:S.length+' face samples '+JSON.stringify(k)+' '+JSON.stringify(r)};},
 // the flora: no pioneer on a face (the no-trees-on-cliffs rule, by slope), none on the sand or the pan, moss only on the cones
 flora(P,M){const bad=P.filter(p=>p.face>.45||p.sand>.6||p.playa>.4).length,mb=M.filter(p=>p.cone<.2).length;
  return{ok:P.length>200&&bad<=Math.max(2,P.length*.003)&&mb<=Math.max(1,M.length*.01),detail:P.length+' pioneers sampled: '+bad+' on a face, the sand or the pan; '+M.length+' moss mats: '+mb+' off the cones'};},
 // the season: snow on the upper benches, none below ~2,850 m
 snow(hi,lo){return{ok:hi>.08&&lo<.02,detail:'snow share above 3,000 m '+hi.toFixed(2)+', below 2,800 m '+lo.toFixed(3)};},
 air(p){const ok=p>1.06&&p<1.12;return{ok,detail:p.toFixed(3)+' atm on the lip (PLAN.md: 1.08-1.10 on the head step)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const modelAt=(x,z)=>REGION?REGION.y0+REGION.h(x,z):NaN;
// the model's flat floors: the head step a few km upstream of the front, step 2 a few km down (the station compresses the model's 12 km ramp
// into ~3 km, so each floor is read where the model's is flat too: the raster's upstream and downstream plains on the same axis)
const heightRows=()=>{const R=[];for(const a of [-2400,0,2400]){const h=xzDA(-4200,a),m=xzDA(-8500,a),s=xzDA(4300,a),ms=xzDA(8000,a);
 R.push({name:'head step a='+a,page:terrainH(h[0],h[1]),model:modelAt(m[0],m[1])});R.push({name:'step 2 a='+a,page:terrainH(s[0],s[1]),model:modelAt(ms[0],ms[1])});}return R;};
const stairSamples=a=>{const o=[];a=a==null?-1800:a;for(let d=ST.lip-500;d<ST.lip+3600;d+=5){const p=xzDA(d,a);if(FIELD.cone(p[0],p[1])>.05||FIELD.sand(p[0],p[1])>.05)continue;const y=localH(p[0],p[1]);
 o.push({d,y,bench:slopeAt(p[0],p[1])<.15});}return o;};
const faceSamples=()=>{const o=[];for(let a=-4000;a<4000;a+=80)for(let d=ST.lip-200;d<ST.lip+3400;d+=8){const p=xzDA(d,a);if(!inMap(p[0],p[1])||FIELD.face(p[0],p[1])<.6)continue;
 const y=terrainH(p[0],p[1]),r=STRATA.at(p[0],y,p[1]);o.push({kind:r.kind,recipe:r.recipe});}return o;};
const floraSamples=n=>itemPositions(n,4).map(p=>({face:FIELD.face(p[0],p[2]),sand:FIELD.sand(p[0],p[2]),playa:FIELD.playa(p[0],p[2]),cone:FIELD.cone(p[0],p[2])}));
const snowShares=()=>{let hi=0,nh=0,lo=0,nl=0;for(let i=0;i<120;i++)for(let j=0;j<120;j++){const x=TERR.X0+(i+.5)*80,z=TERR.Z0+(j+.5)*80,y=terrainH(x,z),s=FIELD.snow(x,z);
 if(y>3000){hi+=s;nh++;}else if(y<2800){lo+=s;nl++;}}return[nh?hi/nh:0,nl?lo/nl:0];};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),sn=snowShares();
 add('the floors against scale model 5.1',SCHK.heights(heightRows()));
 add('the trap stair steps down',SCHK.stair(stairSamples()));
 add('the front\'s rock: ponded flows, palagonite partings',SCHK.rock(faceSamples()));
 add('the pioneers off the faces, the sand and the pan; moss on the cones',SCHK.flora(floraSamples('cushion').concat(floraSamples('crust')),floraSamples('mossmat')));
 add('late winter: snow above, none below',SCHK.snow(sn[0],sn[1]));
 add('the air on the lip',SCHK.air(presAt(terrainH(LIP.x,LIP.z))));
 add('BIO.envCheck over the probe\'s points',(()=>{const pts=[];for(let k=0;k<200;k++)pts.push([TERR.X0+((k*37)%200+.5)*48,TERR.Z0+((k*91)%200+.5)*48]);const b=BIO.envCheck(ENV,pts);return{ok:!b.length,detail:b.length?JSON.stringify(b.slice(0,3)):Object.keys(ENV).length+' fields in range at '+pts.length+' points'};})());
 add('the tumuli on the plains',{ok:(window._tumuli||{}).inMap>=20,detail:JSON.stringify(window._tumuli)});
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the floors 300 m off the model',SCHK.heights(heightRows().map(r=>Object.assign({},r,{page:r.page+300}))));
 add('a smooth ramp, not a stair',SCHK.stair(stairSamples().map(s=>Object.assign({},s,{bench:false}))));
 add('a bench that climbs',SCHK.stair(stairSamples().map((s,i)=>i===40?Object.assign({},s,{y:s.y+30}):s)));
 add('fresh orange beads in the front',SCHK.rock(faceSamples().map(q=>q.kind==='palagonite'||q.kind==='rubble'?Object.assign({},q,{kind:'bead'}):q)));
 add('pioneers on the faces',SCHK.flora(floraSamples('cushion').map(p=>Object.assign({},p,{face:1})),[]));
 add('snow down to the floor',SCHK.snow(.3,.3));
 add('the summit\'s air on the lip',SCHK.air(presAt(22000)));
 return R;}
