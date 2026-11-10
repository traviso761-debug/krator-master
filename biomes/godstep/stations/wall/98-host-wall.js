// ================================================================= HOST — the north wall's records, views and checks (station 5)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail); 88-host-build.js
// calls stationRecords before the kit builds.
// a marker the probe samples (core/water's meshes and the ground are probeSkip): a site's own point
function probeMark(x,y,z){const m=new THREE.Object3D();m.userData.probePoints=[x,y,z];scene.add(m);}
// ---- the records (core/tags through REGISTER): the wall, the springs, the streams and their falls, the terraces, the way, the forest (as groups)
function stationRecords(){const G=(x,z)=>terrainH(x,z);
 {const p=xzDA(ST.lip+300,0);REGISTER({name:'The north wall (Toutouallos): a stair of ponded flows under forest, living laterite in its colonnades',x:p[0],z:p[1],y:ST.y2-40,r:2600,h:ST.y1-ST.y2+120});}
 WSTREAMS.forEach((S,i)=>{const L=S.line,m=L[Math.floor(L.length/2)];let lo=1e9,hi=-1e9,r=0;L.forEach(p=>{lo=Math.min(lo,p[2]);hi=Math.max(hi,p[2]);r=Math.max(r,Math.hypot(p[0]-m[0],p[1]-m[1]));});
  REGISTER({name:S.name,x:m[0],z:m[1],y:lo-20,r:r+20,h:hi-lo+40,kind:'water'});
  if(S.key!=='blaca'){const y=G(S.spring[0],S.spring[1]);probeMark(S.spring[0],y+.5,S.spring[1]);
   REGISTER({name:(i===1?'The springs of Rrivar Cistal\'s head':'A spring')+': water out of a palagonite parting at '+Math.round(S.top)+' m (the aquitard under the flow above)',x:S.spring[0],z:S.spring[1],y:y-6,r:40,h:20,kind:'water'});}});
 {const F=WFALLS;if(F.length){let x=0,z=0;F.forEach(f=>{x+=f.lip[0][0];z+=f.lip[0][1];});x/=F.length;z/=F.length;const r=Math.max(...F.map(f=>Math.hypot(f.lip[0][0]-x,f.lip[0][1]-z)))+40;
  const lo=Math.min(...F.map(f=>f.lip[0][2]-f.drop)),hi=Math.max(...F.map(f=>f.lip[0][2]));
  REGISTER({name:F.length+' falls off the wall\'s benches (Guli Blaca and the springs\' threads, through the banded flows: refs/09)',x,z,y:lo-10,r,h:hi-lo+20,kind:'water'});}}
 {let x=0,z=0;const P=TERRACES.polys;P.forEach(q=>{x+=q[0][0];z+=q[0][1];});x/=P.length;z/=P.length;const r=Math.max(...P.map(q=>Math.hypot(q[0][0]-x,q[0][1]-z)))+80;
  REGISTER({name:TERRACES.name+': '+TERRACES.rows.length+' rows',x,z,y:ST.y2-40,r,h:80});}
 {const P=PATH.pts,m=P[Math.floor(P.length/2)];REGISTER({name:PATH.name,x:m[0],z:m[1],y:ST.y2-60,r:5200,h:ST.y1-ST.y2+200,path:true});}
 /* the forest as three groups (each tree's own record is core/tags', 87): the plateau, the wall's benches, the foot */
 [['The spiral forest on the plateau above the wall (the southern highlands\' species, read in place)',-2600,ST.y1],['The spiral forest on the wall\'s benches',ST.lip+300,(ST.y1+ST.y2)/2],
  ['The forest at the wall\'s foot, thinning south into the dry country',1600,ST.y2]].forEach(([name,d,y])=>{const p=xzDA(d,0);REGISTER({name,x:p[0],z:p[1],y:y-120,r:2400,h:260});});}
// ---- the views, found in the built scene
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},P=(d,a)=>xzDA(d,a),FV=WALLV.falls,fa=aOf(FV.x,FV.z),fd=dOf(FV.x,FV.z);
 // THE STATION'S VIEW (PLAN.md 7.5): from the foot's floor up at the wall: Guli Blaca falling off bench after bench, the forest on the benches
 /* the eye in a clearing: the first place back from the wall with no tree within 30 m */
 {const sp=frontSpan(fa),clearAt=p=>!WALL_FLORA.trees.some(T=>Math.hypot(T.x-p[0],T.z-p[1])<30);let c=P(sp[1]+700,fa+260);
  for(let k=0;k<60;k++){const q=P(sp[1]+700+(k%6)*40,fa+260+Math.floor(k/6)*35);if(clearAt(q)){c=q;break;}}
  const t=P((sp[0]+sp[1])/2,fa);add('The wall from the foot',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+20,t[1]]);}
 // Guli Blaca's tallest fall, close
 {const c=P(fd+55,fa+38),t=[FV.x,FV.y-6,FV.z];add('Guli Blaca\'s falls',[c[0],G(c[0],c[1])+1.8,c[1],t[0],t[1],t[2]]);}
 // the springs of Rrivar Cistal's head: water out of a parting
 {const S=WSTREAMS[1],sd=dOf(S.spring[0],S.spring[1]),sa=aOf(S.spring[0],S.spring[1]),c=P(sd+40,sa+22);add('The springs of Rrivar Cistal',[c[0],G(c[0],c[1])+1.7,c[1],S.spring[0],G(S.spring[0],S.spring[1])+1,S.spring[1]]);}
 // in the forest on the plateau, near the lip
 {const c=P(ST.lip-600,1500),t=P(ST.lip-200,1300);add('The spiral forest',[c[0],G(c[0],c[1])+1.7,c[1],t[0],G(t[0],t[1])+6,t[1]]);}
 // the terraces and their walls, the stalks in rows
 {const R=TERRACES.rows.filter(r=>r.b===2),r0=R[0],r1=R[R.length-1],am=(r0.a0+r0.a1)/2,c=P(r1.d1+60,am+120),t=P(r0.d0,am);add('The terraces on the red soil',[c[0],G(c[0],c[1])+4,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // from the rim south over the valley: the steps' dry country below, the stair beyond
 {const sp=frontSpan(1300),c=P(sp[0]-30,1300),t=P(4500,800);add('From the rim over the valley',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])-60,t[1]]);}
 {const c=P(5200,-4800),t=P(ST.lip+300,0);add('Overview',[c[0],G(c[0],c[1])+1300,c[1],t[0],ST.y2+60,t[1]]);}
 {const sp=frontSpan(fa+400),c=P(sp[1]+300,fa+500),t=P(sp[0],fa+100);add('Dawn on the wall',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+10,t[1]],'dawn');}}
// ---- the checks (each a pure function of its samples)
const SCHK={
 heights(rows){const bad=rows.filter(r=>Math.abs(r.page-r.model)>50);return{ok:rows.length>=4&&!bad.length,detail:rows.map(r=>r.name+' '+r.page.toFixed(0)+' m (5.1: '+r.model.toFixed(0)+')').join('; ')};},
 // the benches step monotonically down toward the valley, ~230 m in all, in many benches
 stair(S){let up=0,benches=0,last=null;for(let i=1;i<S.length;i++){if(S[i].y>S[i-1].y+1.5)up++;}
  for(const s of S){if(s.bench&&(last==null||last-s.y>8)){benches++;last=s.y;}}
  const drop=S[0].y-S[S.length-1].y;return{ok:up===0&&drop>190&&drop<280&&benches>=6,detail:'drop '+drop.toFixed(0)+' m in '+benches+' benches; '+up+' rises toward the valley'};},
 // no tree on a face (the no-trees-on-cliffs rule, by the face field and the slope at the bole)
 trees(T){const bad=T.filter(t=>t.face>.3||t.slope>.65).length;return{ok:T.length>500&&bad<=Math.max(1,T.length*.002),detail:T.length+' trees: '+bad+' on a face'};},
 // the stalks only where the springs' or streams' water keeps the ground wet
 stalks(P){const bad=P.filter(p=>p.wet<.45).length;return{ok:P.length>100&&bad<=Math.max(1,P.length*.01),detail:P.length+' stalks sampled: '+bad+' on dry ground'};},
 // the water on the benches agrees with its core/water records: each fall's lip on the ground at its lip, its foot on the ground under it; the
 // streams' level on their beds (not buried under the ground as drawn, not floating over it)
 water(F,L){const bl=F.filter(f=>Math.abs(f.lip-f.gLip)>4).length,bf=F.filter(f=>Math.abs(f.foot-f.gFoot)>6).length,bur=L.filter(p=>p.y<p.g-.9).length,flo=L.filter(p=>p.y>p.g+2.5).length;
  const off=F.filter(f=>Math.abs(f.lip-f.gLip)>4||Math.abs(f.foot-f.gFoot)>6).slice(0,4).map(f=>'['+(f.lip-f.gLip).toFixed(1)+', '+(f.foot-f.gFoot).toFixed(1)+' of '+f.drop.toFixed(0)+' m]').join(' ');
  return{ok:F.length>=6&&!bl&&!bf&&bur<=L.length*.04&&flo<=L.length*.02,detail:F.length+' falls: '+bl+' lips off the ground, '+bf+' feet off it'+(off?' '+off:'')+'; '+L.length+' stream points: '+bur+' under the ground, '+flo+' floating'};},
 // core/water's land side (ext/60, WATER.edgeAudit): no plant in the water
 edge(fs){const n=fs.filter(f=>f.rule==='plant-in-water').length;return{ok:!n,detail:n+' plants in the water (WATER.edgeAudit over the falls\' and the springs\' ground)'+(n?': '+fs.slice(0,3).map(f=>f.surface+' by '+f.by+' m').join(', '):'')};},
 air(p){const ok=p>1.18&&p<1.24;return{ok,detail:p.toFixed(3)+' atm at the springs (PLAN.md: 1.21)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const modelAt=(x,z)=>REGION?REGION.y0+REGION.h(x,z):NaN;
// the model's ramp is ~22 km; the station compresses it into ~1 km of stair, so each floor is read where the model's is: the plateau far up the
// same axis, the dry country far down it
const heightRows=()=>{const R=[];for(const a of [-2400,0,2400]){const h=xzDA(-3800,a),m=xzDA(-11000,a),s=xzDA(3800,a),ms=xzDA(9000,a);
 R.push({name:'the wall\'s top a='+a,page:terrainH(h[0],h[1]),model:modelAt(m[0],m[1])});R.push({name:'its foot a='+a,page:terrainH(s[0],s[1]),model:modelAt(ms[0],ms[1])});}return R;};
const stairSamples=a=>{const o=[],sp=frontSpan(a);for(let d=sp[0]-400;d<sp[1]+400;d+=4){const p=xzDA(d,a);const n=streamNear(p[0],p[1]);if(n&&n.d<n.hw+16)continue;
 if(TERRACES.at(p[0],p[1])>0||FIELD.path(p[0],p[1])>.2)continue;o.push({d,y:localH(p[0],p[1]),bench:slopeAt(p[0],p[1])<.15});}return o;};
const treeSamples=()=>WALL_FLORA.trees.map(t=>({face:FIELD.face(t.x,t.z),slope:slopeAt(t.x,t.z)}));
const faceTrees=n=>{const o=[];for(let a=-4000;a<4000&&o.length<n;a+=37)for(let d=ST.lip-100;d<ST.lip+900&&o.length<n;d+=9){const p=xzDA(d,a);if(FIELD.face(p[0],p[1])>.7)o.push({face:FIELD.face(p[0],p[1]),slope:slopeAt(p[0],p[1])});}return o;};
const stalkSamples=(dx,dz)=>itemPositions('redstalk',3).map(p=>({wet:FIELD.spring(p[0]+(dx||0),p[2]+(dz||0))}));
const waterSamples=lift=>{lift=lift||0;const F=WFALLS.map(f=>{const m=[(f.lip[0][0]+f.lip[f.lip.length-1][0])/2,(f.lip[0][1]+f.lip[f.lip.length-1][1])/2],ft=f.foot||[m[0],m[1],f.lip[0][2]-f.drop];
  /* each against the bench it leaves and the bench it lands on, 6 m either side (the 10 m lattice smears a riser's brink and its foot
    over a cell: the riser itself is not where the water stands) */
  const dx=f.dir[0],dz=f.dir[1];return{lip:f.lip[0][2]+lift,gLip:terrainH(m[0]-dx*6,m[1]-dz*6),foot:ft[2]+lift,gFoot:terrainH(ft[0]+dx*6,ft[1]+dz*6),drop:f.drop};});
 const L=[];WFLOWS.forEach(Fl=>Fl.pts.forEach((p,i)=>{if(i%3)return;const sl=i>0?Math.abs(Fl.pts[i-1].y-p.y)/Math.max(.1,Math.hypot(Fl.pts[i-1].x-p.x,Fl.pts[i-1].z-p.z)):0;
  if(sl>.4||!inMap(p.x,p.z))return;L.push({y:p.y+lift,g:terrainH(p.x,p.z)});}));return{F,L};};
// core/water's fields (ext/60) over the falls' and the springs' ground, once (a 600 m box each at 3 m)
let _wf=null;const waterFields=()=>_wf||(_wf=[WALLV.falls,WALLV.spring].map(c=>{const box=[c.x-300,c.z-300,c.x+300,c.z+300];return{box,F:WATER.fields({box,cell:3,ground:terrainH,surfaces:WFLOWS})};}));
/* the plants inside each box only (off its box a field reads its nearest edge node, where a stream leaves it) */
const edgeFindings=extra=>{const out=[];waterFields().forEach(({box,F})=>{const inB=p=>p.x>box[0]+3&&p.x<box[2]-3&&p.z>box[1]+3&&p.z<box[3]-3;
 const plants=itemPositions('redstalk',1).map(p=>({x:p[0],z:p[2],r:.25,name:'red stalk'})).concat(WALL_FLORA.trees.map(t=>({x:t.x,z:t.z,r:t.r*.5,name:t.key}))).concat(extra||[]).filter(inB);
 out.push(...WATER.edgeAudit({field:F,plants}).filter(f=>f.rule==='plant-in-water'));});return out;};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),ws=waterSamples();
 add('the wall\'s top and foot against scale model 5.1',SCHK.heights(heightRows()));
 add('the wall\'s benches step down (west)',SCHK.stair(stairSamples(-1800)));
 add('the wall\'s benches step down (east)',SCHK.stair(stairSamples(1500)));
 add('no tree on a face',SCHK.trees(treeSamples()));
 add('the red stalk only where the water keeps the ground wet',SCHK.stalks(stalkSamples()));
 add('the falls and the streams on their benches agree with core/water\'s records',SCHK.water(ws.F,ws.L));
 add('no plant in the water (WATER.edgeAudit)',SCHK.edge(edgeFindings()));
 add('the air at the springs',SCHK.air(presAt(terrainH(WALLV.spring.x,WALLV.spring.z))));
 add('BIO.envCheck over the probe\'s points',(()=>{const pts=[];for(let k=0;k<200;k++)pts.push([TERR.X0+((k*37)%200+.5)*48,TERR.Z0+((k*91)%200+.5)*48]);const b=BIO.envCheck(ENV,pts);return{ok:!b.length,detail:b.length?JSON.stringify(b.slice(0,3)):Object.keys(ENV).length+' fields in range at '+pts.length+' points'};})());
 add('the terraces on core/mask',{ok:TERRACES.rows.length>=20&&(window._biome||{}).walls>200,detail:TERRACES.rows.length+' rows, mask '+TERRACES.hash+', '+((window._biome||{}).walls)+' wall stones'});
 add('the spiral forest read in place',{ok:WALL_FLORA.trees.length>800&&!(window._biome||{}).missing,detail:JSON.stringify({trees:WALL_FLORA.trees.length,heroes:(window._biome||{}).heroes,mirrored:(window._biome||{}).mirrored,missing:(window._biome||{}).missing})});
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the floors 300 m off the model',SCHK.heights(heightRows().map(r=>Object.assign({},r,{page:r.page+300}))));
 add('a smooth ramp, not a stair',SCHK.stair(stairSamples(-1800).map(s=>Object.assign({},s,{bench:false}))));
 add('a bench that climbs',SCHK.stair(stairSamples(-1800).map((s,i)=>i===60?Object.assign({},s,{y:s.y+30}):s)));
 add('trees on the faces',SCHK.trees(treeSamples().concat(faceTrees(400))));
 add('the stalks moved 400 m onto dry ground',SCHK.stalks(stalkSamples(400*DOWN[0]+300*ALONG[0],400*DOWN[1]+300*ALONG[1])));
 {const ws=waterSamples(30);add('the falls lifted 30 m off the benches',SCHK.water(ws.F,ws.L));}
 add('a stalk in Guli Blaca\'s channel',SCHK.edge(edgeFindings((()=>{const L=WSTREAMS[0].line,p=L[Math.min(L.length-1,WALLV.falls.i+14)];return[{x:p[0],z:p[1],r:.25,name:'a stalk in the stream'}];})())));
 add('the plateau\'s air at the springs',SCHK.air(presAt(9000)));
 return R;}
