// ================================================================= HOST — the rille's records, views and checks (station 2)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail);
// 88-host-build.js calls stationRecords before the kit builds and stationBuild (87) after it.
// ---- the records (core/tags through REGISTER): the rille, the spring and its stream, the fields, the roofed tube, its pits, the collapse, the way
function stationRecords(){const G=(x,z)=>terrainH(x,z);
 {const P=RILLE.pts,m=P[Math.floor(P.length/2)],y0=Math.min(...P.map(p=>p.y));
  REGISTER({name:'The rille (Tubodubnos): tube_god_07 fallen in, a colonnaded canyon ~1 km wide and ~120 m deep',x:m.x,z:m.z,y:y0-10,r:3400,h:200,kind:'feature'});}
 REGISTER({name:SPRING.name,x:SPRING.x,z:SPRING.z,y:SPRING.y-30,r:40,h:60,kind:'feature',tags:{water:'spring'}});
 {const P=STREAM.pts,m=P[Math.floor(P.length/2)];REGISTER({name:STREAM.name,x:m[0],z:m[1],y:Math.min(...P.map(p=>p[2]))-4,r:900,h:SPRING.y-m[2]+40,kind:'water'});}
 {const b=FIELDS.box;REGISTER({name:FIELDS.name+' ('+FIELDS.polys.length+')',x:(b[0]+b[2])/2,z:(b[1]+b[3])/2,y:Math.min(...RILLE.pts.map(p=>p.y))-6,r:Math.hypot(b[2]-b[0],b[3]-b[1])/2,h:40,kind:'site',tags:{culture:'talovolci',crop:'red guyed stalk'}});}
 {const m=TLINE.at(TLINE.L/2);REGISTER({name:TUBE_REC.name+', roofed past the rille\'s end',x:m.x,z:m.z,y:m.y-4,r:TLINE.L/2+40,h:TUBE_REC.h+70,kind:'cavern'});}
 TUBE.pits.forEach((q,k)=>{if(!q||q.kind!=='collapse'||!inMap(q.x,q.z))return;REGISTER({name:'A collapse pit in the tube\'s roof (the pit chain)',x:q.x,z:q.z,y:q.y-6,r:q.r+4,h:G(q.x,q.z)-q.y+14,kind:'feature'});});
 TRIL.spans.forEach(S=>{const m=TLINE.at((S.s0+S.s1)/2);REGISTER({name:'A fresh collapse: the roof fallen to the bore\'s floor (the rille beginning again)',x:m.x,z:m.z,y:m.y-4,r:(S.s1-S.s0)/2+TRIL.w,h:G(m.x,m.z)-m.y+10,kind:'feature'});});
 {const P=PATH.pts,m=P[Math.floor(P.length/2)];REGISTER({name:PATH.name,x:m[0],z:m[1],y:Math.min(...RILLE.pts.map(p=>p.y))-20,r:2600,h:260,path:true});}}
// ---- the views, found in the built scene
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},P=(d,a)=>xzDA(d,a);
 // THE STATION'S VIEW (PLAN.md 7.2): from the south-east rim down the rille to the spring's wall and the green fields under it
 {const c0=rilleFloorAt(-2100),a0=aOf(c0.x,c0.z);let e=a0+520;for(let a=a0+150;a<a0+700;a+=2){const p=P(-2100,a);if(G(p[0],p[1])>plainH(p[0],p[1])-1.5){e=a;break;}}
  const c=P(-2100,e+2),F=FIELDS.polys[2]||FIELDS.polys[0],t=F[0];add('The rille from its rim',[c[0],G(c[0],c[1])+4,c[1],t[0],G(t[0],t[1])+20,t[1]]);}
 // on the floor among the stalks, looking up at the spring's wall
 {const F=FIELDS.polys[1]||FIELDS.polys[0],c=F[0];add('The spring and the stalk fields',[c[0],G(c[0],c[1])+1.7,c[1],SPRING.x,SPRING.y-10,SPRING.z]);}
 // the colonnade wall close: on the talus under the spring's wall, looking along it
 {const c1=rilleFloorAt(-900),a1=aOf(c1.x,c1.z);let e=a1-150;for(let a=a1-60;a>a1-520;a-=2){const p=P(-900,a);if(slopeAt(p[0],p[1])>1.2){e=a;break;}}
  const c=P(-860,e+40),t=P(-940,e-6);add('A colonnade wall close',[c[0],G(c[0],c[1])+1.7,c[1],t[0],G(t[0],t[1])+22,t[1]]);}
 // the rille's head: the end wall where the roof stands, from the floor
 {const c=rilleFloorAt(-700),t=P(LINE.end+380,LINE.a);add('The rille\'s head wall',[c.x,G(c.x,c.z)+1.7,c.z,t[0],G(t[0],t[1])-30,t[1]]);}
 // into the walked skylight from its rim
 {const c=[WALK.x-WALK.d[0]*(WALK.r+8),WALK.z-WALK.d[1]*(WALK.r+8)];add('Into the walked skylight',[c[0],G(c[0],c[1])+1.7,c[1],WALK.x+WALK.d[0]*6,WALK.floor+8,WALK.z+WALK.d[1]*6]);}
 // in the tube: the gathered caves (the fungus beds' cave), lit by the lamps and the skylight
 {const K=CAVES[0],p=TLINE.at(K[1]+40),q=TLINE.at(K[1]),n=[-q.dz,q.dx],t=[q.x+n[0]*K[2]*36,q.y+2,q.z+n[1]*K[2]*36];add('The gathered caves',[p.x,p.y+2.2,p.z,t[0],t[1],t[2]]);}
 // down the tube road from the breakdown, toward the dark
 {const p=TLINE.at(WALK.s+30),t=TLINE.at(WALK.s+300);add('The tube road',[p.x,p.y+2.5,p.z,t.x,t.y+6,t.z]);}
 // the pit chain and the hornitos over the roofed tube
 {const p=TLINE.at(1300),t=TLINE.at(2400),n=[-p.dz,p.dx];add('The pit chain and hornitos',[p.x+n[0]*90,G(p.x+n[0]*90,p.z+n[1]*90)+6,p.z+n[1]*90,t.x,G(t.x,t.z),t.z]);}
 // the fresh collapse
 {const S=TRIL.spans[0];if(S){const p=TLINE.at(S.s0-90),t=TLINE.at((S.s0+S.s1)/2);add('The fresh collapse',[p.x,G(p.x,p.z)+3,p.z,t.x,t.y+20,t.z]);}}
 {const c=P(-5200,LINE.a-4200),t=P(-600,LINE.a);add('Overview',[c[0],G(c[0],c[1])+1400,c[1],t[0],2900,t[1]]);}
 {const c=P(-2300,LINE.a-700),t=P(-1200,LINE.a);add('Dawn in the rille',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+10,t[1]],'dawn');}}
// ---- the checks (each a pure function of its inputs; STATION_NEGATIVES hands each a broken one that must fail)
const RCHK={
 // the plain against scale model 5.1 at the same place (within 50 m), the rille's floor in the plan's 2,850-2,930 m
 heights(rows,floors){const bad=rows.filter(r=>Math.abs(r.page-r.model)>50),fb=floors.filter(y=>y<2850||y>2930);
  return{ok:rows.length>=6&&!bad.length&&floors.length>=10&&!fb.length,detail:rows.slice(0,6).map(r=>r.name+' '+r.page.toFixed(0)+' (5.1: '+r.model.toFixed(0)+')').join('; ')+'; floor '+Math.min(...floors).toFixed(0)+'-'+Math.max(...floors).toFixed(0)+' m'+(fb.length?' ('+fb.length+' out of 2,850-2,930)':'')};},
 // the rille and the tube follow tube_god_07's mapped path (5.1 px 893,1145 -> 910,1134 -> 928,1122): within the rille's half-width, the tube's within 200 m
 path(rille,tube,mapped,w){const dl=(x,z)=>{let b=1e9;for(let i=0;i<mapped.length-1;i++){const a=mapped[i],c=mapped[i+1],dx=c[0]-a[0],dz=c[1]-a[1],l2=dx*dx+dz*dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);b=Math.min(b,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return b;};
  const r=Math.max(...rille.map(p=>dl(p[0],p[1]))),t=Math.max(...tube.map(p=>dl(p[0],p[1])));return{ok:rille.length>5&&tube.length>5&&r<w&&t<200,detail:'the rille\'s line at most '+r.toFixed(0)+' m off the mapped tube (half-width '+w+'), the tube '+t.toFixed(0)+' m'};},
 // every pit and skylight stands over the tube (within its half-width of its line)
 pits(P,line,r){const off=P.map(q=>line(q.x,q.z)),bad=off.filter(d=>d>r);return{ok:P.length>=4&&!bad.length,detail:P.length+' pits and skylights, the farthest '+Math.max(...off).toFixed(1)+' m off the tube\'s line (r '+r+')'};},
 // the walked tube: the KCAVERN bore is open along KRELIEF.tube's floor (a sample a metre over the floor in the void, the rock under it), its
 // crown ~55 m under the plain, the caves open off it
 walked(S){const open=S.filter(s=>s.mid>0&&s.under<=0).length,cr=S.map(s=>s.roof),bad=cr.filter(r=>r<45||r>65).length;
  return{ok:S.length>=20&&open>=S.length*.9&&!bad,detail:open+'/'+S.length+' samples open on the floor, roof '+Math.min(...cr).toFixed(0)+'-'+Math.max(...cr).toFixed(0)+' m (the record: 55)'};},
 // the stalks: none outside the stream's wet field or off the fields
 stalks(P,wet,field){const bad=P.filter(p=>wet(p[0],p[2])<.5||!field(p[0],p[2])).length;return{ok:P.length>200&&!bad,detail:P.length+' stalks sampled, '+bad+' outside the spring\'s wet field or the fields'};},
 // the flora: no pioneer on a face or a field
 flora(P){const bad=P.filter(p=>p.face>.45||p.field>.5).length;return{ok:P.length>200&&bad<=Math.max(2,P.length*.003),detail:P.length+' pioneers sampled: '+bad+' on a face or a field'};},
 // the rock in the rille's walls: the ponded flows, their partings palagonite, no fresh bead
 rock(S){const k={},r={};S.forEach(q=>{k[q.kind]=(k[q.kind]||0)+1;r[q.recipe]=(r[q.recipe]||0)+1;});
  return{ok:S.length>150&&!k.bead&&(r['godstep-ponded']||0)>=S.length*.8,detail:S.length+' wall samples '+JSON.stringify(k)+' '+JSON.stringify(r)};},
 air(p){const ok=p>1.07&&p>0&&p<1.13;return{ok,detail:p.toFixed(3)+' atm on the plain (PLAN.md: 1.10)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const modelAt=(x,z)=>REGION?REGION.y0+REGION.h(x,z):NaN;
const pxXZ=(px,py)=>[(px-STN.site.px)*2000,(py-STN.site.py)*2000];
const MAPPED=[pxXZ(893,1145),pxXZ(910,1134),pxXZ(928,1122)];
const heightRows=()=>{const R=[];for(const d of [-3500,0,3500])for(const a of [LINE.a-1600,LINE.a+1600]){const p=xzDA(d,a);R.push({name:'plain d='+d+' a='+a,page:terrainH(p[0],p[1]),model:modelAt(p[0],p[1])});}return R;};
const floorYs=()=>RILLE.pts.filter(p=>inMap(p.x,p.z)).map(p=>terrainH(p.x,p.z));
const tubeLineD=(x,z)=>{let b=1e9;const P=TUBE.pts;for(let i=0;i<P.length-1;i++){const a=P[i],c=P[i+1],dx=c.x-a.x,dz=c.z-a.z,l2=dx*dx+dz*dz,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/l2,0,1);b=Math.min(b,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}return b;};
const allPits=()=>{const o=[];TUBE.pits.forEach(q=>{if(q)o.push({x:q.x,z:q.z});});TRIL.skylights.forEach(q=>o.push({x:q.x,z:q.z}));o.push({x:WALK.x,z:WALK.z});return o;};
const walkedSamples=dx=>{const C=CAVE.C,o=[];if(!C)return o;dx=dx||0;for(let s=WALKED.from+20;s<WALKED.to-20;s+=25){const p=TLINE.at(s),n=[-p.dz,p.dx],x=p.x+n[0]*dx,z=p.z+n[1]*dx;
 o.push({mid:C.sdf(x,p.y+1.5,z),under:C.sdf(x,p.y-2,z),roof:plainH(x,z)-(p.y+TUBE_REC.h)});}return o;};
const wallSamples=()=>{const o=[];for(const P of RILLE.pts){if(!inMap(P.x,P.z))continue;for(let a=-560;a<560;a+=3){const p=[P.x+ACROSS[0]*a,P.z+ACROSS[1]*a];if(!inMap(p[0],p[1])||slopeAt(p[0],p[1])<1.2)continue;
 const y=terrainH(p[0],p[1]),r=STRATA.at(p[0],y,p[1]);o.push({kind:r.kind,recipe:r.recipe});}}return o;};
const floraSamples=n=>itemPositions(n,4).map(p=>({face:FIELD.face(p[0],p[2]),field:FIELD.field(p[0],p[2])}));
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 add('the plain against scale model 5.1, the rille\'s floor in the plan\'s band',RCHK.heights(heightRows(),floorYs()));
 add('the rille and the tube follow tube_god_07\'s mapped path',RCHK.path(RILLE.pts.map(p=>[p.x,p.z]),TUBE.pts.map(p=>[p.x,p.z]),MAPPED,RILLE.w));
 add('every pit and skylight over the tube',RCHK.pits(allPits(),tubeLineD,TUBE.r));
 add('the walked tube agrees with the KCAVERN records',RCHK.walked(walkedSamples()));
 add('the red stalks only in the fields, in the spring\'s wet field',RCHK.stalks(itemPositions('redstalk',3),GSTEP.RILLE_WET||(()=>0),FIELDS.at));
 add('the pioneers off the faces and the fields',RCHK.flora(floraSamples('cushion').concat(floraSamples('crust'))));
 add('the rille\'s walls: ponded flows, palagonite partings',RCHK.rock(wallSamples()));
 add('the air on the plain',RCHK.air(presAt(plainH(0,0))));
 add('BIO.envCheck over the probe\'s points',(()=>{const pts=[];for(let k=0;k<200;k++)pts.push([TERR.X0+((k*37)%200+.5)*48,TERR.Z0+((k*91)%200+.5)*48]);const b=BIO.envCheck(ENV,pts);return{ok:!b.length,detail:b.length?JSON.stringify(b.slice(0,3)):Object.keys(ENV).length+' fields in range at '+pts.length+' points'};})());
 add('the gathered caves and the hornitos drawn',{ok:!!window._cavern&&window._cavern.caves===4&&window._cavern.beds>20&&window._cavern.hornitos>=4&&window._cavern.tris>1000,detail:JSON.stringify(window._cavern)});
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the plain 300 m off the model',RCHK.heights(heightRows().map(r=>Object.assign({},r,{page:r.page+300})),floorYs()));
 add('the rille\'s floor at the plain',RCHK.heights(heightRows(),floorYs().map(y=>y+110)));
 add('the rille 2 km off the tube\'s path',RCHK.path(RILLE.pts.map(p=>[p.x+ACROSS[0]*2000,p.z+ACROSS[1]*2000]),TUBE.pts.map(p=>[p.x,p.z]),MAPPED,RILLE.w));
 add('a pit 80 m off the tube',RCHK.pits(allPits().map((q,i)=>i?q:{x:q.x+ACROSS[0]*80,z:q.z+ACROSS[1]*80}),tubeLineD,TUBE.r));
 add('the walked samples 70 m into the rock',RCHK.walked(walkedSamples(70)));
 add('a stalk 400 m from the stream',RCHK.stalks(itemPositions('redstalk',3).map((p,i)=>i?p:[p[0]+ACROSS[0]*400,p[1],p[2]+ACROSS[1]*400,p[3]]),GSTEP.RILLE_WET||(()=>0),FIELDS.at));
 add('pioneers on the faces',RCHK.flora(floraSamples('cushion').map(p=>Object.assign({},p,{face:1}))));
 add('fresh orange beads in the walls',RCHK.rock(wallSamples().map(q=>q.kind==='palagonite'||q.kind==='rubble'?Object.assign({},q,{kind:'bead'}):q)));
 add('the summit\'s air on the plain',RCHK.air(presAt(22000)));
 return R;}
