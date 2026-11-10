// ================================================================= HOST — the redlands' records, views, reflections and checks (station 4)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check a pure function of its samples, with a broken input
// that must fail); 88-host-build.js calls stationRecords before the kit builds.
// ---- the records (core/tags through REGISTER): front 3, the breakaways, the mesas, the pan and its sheet, the old shores
function stationRecords(){const G=(x,z)=>terrainH(x,z);
 {const p=xzDA(-2900,0);REGISTER({name:'Front 3, the trap stair (Dirdolipos): step 3\'s floor at ~1,613 m falling ~713 m in benches of ponded flows to step 4',x:p[0],z:p[1],y:ST.y0-60,r:2600,h:ST.y3-ST.y0+160});}
 {const p=xzDA(2200,250);REGISTER({name:BRK.name,x:p[0],z:p[1],y:plane(p[0],p[1])-ST.brkH-12,r:2000,h:ST.brkH+30});}
 MESAS.forEach((M,i)=>REGISTER({name:'A laterite mesa (the breakaway\'s cap, cut off on the slope: '+M.id+')',x:M.x,z:M.z,y:M.y0-4,r:M.R+20,h:M.top-M.y0+10}));
 REGISTER({name:PAN.name+' (dead flat at '+PAN.level.toFixed(1)+' m; its crust in polygons)',x:PAN.x,z:PAN.z,y:PAN.level-3,r:PAN.A*1.15,h:6});
 REGISTER({name:'The old lake\'s strandlines (it stood 16 m over the pan and fell back to it: core/terrain KBASIN)',x:PAN.x,z:PAN.z,y:PAN.level-2,r:PAN.A+900,h:22});}
// ---- THE REFLECTIONS (core/water/ext/58, WATER.mirrorSwitch): the sheet water reflects the land only when asked (the panel's button,
// ?mirror=probe|live); off at page load, so nothing is built and the tri counts do not rise. Run once a frame ahead of the sky's draw
const MIRROR=WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[SHEET_W.D.mesh.material],level:SHEET_W.level,center:[SHEET.x,SHEET.z],
 radius:SHEET.r*1.6,far:4200,tree:o=>false,hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;
window.MIRROR=MIRROR;
if(MIRROR){const d0=SKY.draw;SKY.draw=function(){MIRROR.update();return d0.apply(this,arguments);};}
// ---- the views, found in the built scene
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},P=(d,a)=>xzDA(d,a);
 const pd=dOf(PAN.x,PAN.z),pa=aOf(PAN.x,PAN.z);
 // THE STATION'S VIEW (PLAN.md 7.4): from the pan's east shore, across the white crust and the breakaways to front 3's black stair
 {const c=P(pd+PAN.A*1.25+260,pa-160),t=P(-3300,-200);add('The playa and the stair',[c[0],G(c[0],c[1])+2,c[1],t[0],1250,t[1]]);}
 // a breakaway close: its red cap over the pale kaolin, from its foot (the inset)
 {const v=BRK.view;add('A breakaway close',[v.x,G(v.x,v.z)+1.7,v.z,v.fx,G(v.fx,v.fz)-4,v.fz]);}
 // from the rim: down the gullied slopes to the pan
 {const c=P(2150,-90),t=[PAN.x,PAN.z];add('The pan from the breakaway',[c[0],G(c[0],c[1])+1.8,c[1],t[0],PAN.level,t[1]]);}
 // on the crust: its polygons
 {const c=P(pd-PAN.A*.55,pa-80),t=P(pd-PAN.A*.55+90,pa+40);add('The salt crust',[c[0],PAN.level+1.6,c[1],t[0],PAN.level,t[1]]);}
 // a mesa from the slope below it
 {const M=MESAS[1],c=[M.x+ACROSS[0]*240,M.z+ACROSS[1]*240];add('A laterite mesa',[c[0],G(c[0],c[1])+1.7,c[1],M.x,M.top-8,M.z]);}
 // front 3 from step 4's floor: the benches and colonnades, its frozen falls
 {const c=P(-700,-900),t=P(-3200,-700);add('Front 3 from the floor',[c[0],G(c[0],c[1])+2,c[1],t[0],1280,t[1]]);}
 // the storm's sheet on the pan
 {const c=[SHEET.x+DOWN[0]*(SHEET.r+160),SHEET.z+DOWN[1]*(SHEET.r+160)];add('Sheet water on the pan',[c[0],G(c[0],c[1])+2.5,c[1],SHEET.x,SHEET.level,SHEET.z]);}
 {const c=P(5200,5600),t=P(600,600);add('Overview',[c[0],G(c[0],c[1])+1500,c[1],t[0],900,t[1]]);}
 {const c=P(pd+PAN.A+120,pa+300),t=P(pd-400,pa-500);add('Dawn on the pan',[c[0],G(c[0],c[1])+2,c[1],t[0],PAN.level+20,t[1]],'dawn');}}
// ---- the checks
const SCHK={
 // the floors against scale model 5.1: step 4's plain at four places, step 3's (the stair's head) against the model's own step 3 floor, within 50 m
 heights(rows){const bad=rows.filter(r=>Math.abs(r.page-r.model)>50);return{ok:rows.length>=6&&!bad.length,detail:rows.map(r=>r.name+' '+r.page.toFixed(0)+' m (5.1: '+r.model.toFixed(0)+')').join('; ')};},
 // front 3: along the axis the benches step down monotonically, ~713 m in all, in many benches
 stair(S){let up=0,benches=0,last=null;for(let i=1;i<S.length;i++){if(S[i].y>S[i-1].y+1.5)up++;}
  for(const s of S){if(s.bench&&(last==null||last-s.y>8)){benches++;last=s.y;}}
  const drop=S[0].y-S[S.length-1].y;return{ok:up===0&&drop>620&&drop<780&&benches>=8,detail:'drop '+drop.toFixed(0)+' m in '+benches+' benches; '+up+' rises downstream'};},
 // the pan: dead flat (bar the sheet's hollow) and white (the crust class over it)
 pan(P){if(P.length<100)return{ok:false,detail:P.length+' samples'};let lo=1e9,hi=-1e9,w=0;for(const p of P){lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);w+=p.white;}w/=P.length;
  return{ok:hi-lo<.3&&w>.9,detail:P.length+' samples: relief '+(hi-lo).toFixed(2)+' m, crust '+w.toFixed(2)};},
 // nothing on the pan but its crust: no item in it; its salt-tolerant plants in a ring round its edge
 bare(onPan,edge){return{ok:onPan===0&&edge>=20,detail:onPan+' items on the pan, '+edge+' salt-edge plants round it'};},
 // the laterite only on the caps: the faces' upper band (yy over 895) hardpan, the lower (under 891) kaolin; no hardpan below the cap
 caps(S){const up=S.filter(s=>s.yy>895&&s.yy<906),lo=S.filter(s=>s.yy<891&&s.yy>860),hu=up.filter(s=>s.cap).length,kl=lo.filter(s=>s.kao).length,bad=S.filter(s=>s.cap&&s.yy<893).length;
  return{ok:S.length>60&&up.length>=8&&lo.length>=10&&hu>=up.length*.8&&kl>=lo.length*.8&&bad===0,detail:S.length+' breakaway faces: '+hu+'/'+up.length+' hardpan in the cap, '+kl+'/'+lo.length+' kaolin under it, '+bad+' hardpan below the cap'};},
 // the breakaways stand 10-30 m over the slopes below them
 relief(D){const bad=D.filter(d=>d<10||d>30);return{ok:D.length>=5&&!bad.length,detail:'rim over foot: '+D.map(d=>d.toFixed(1)).join(', ')+' m'};},
 air(p){const ok=p>1.40&&p<1.45;return{ok,detail:p.toFixed(3)+' atm on the pan (PLAN.md: 1.41-1.43 on step 4)'};},
 mirror(M){const ok=!!M&&M.mode()==='off'&&M.M()===null;return{ok,detail:M?'reflections '+M.mode()+(M.M()?' (built)':' (nothing built)'):'no mirror switch'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const modelAt=(x,z)=>REGION?REGION.y0+REGION.h(x,z):NaN;
const heightRows=()=>{const R=[];for(const [d,a] of [[3500,-2500],[0,-3500],[4000,3000],[-800,3800]]){const p=xzDA(d,a);R.push({name:'step 4 at '+d+','+a,page:terrainH(p[0],p[1]),model:modelAt(p[0],p[1])});}
 /* step 3: the model's own floor, west of its front (5.1 px 947-955 by 1089-1099), its median */
 const v=[];for(let x=-56000;x<=-40000;x+=2000)for(let z=8000;z<=28000;z+=2000)v.push(modelAt(x,z));v.sort((a,b)=>a-b);const m3=v[v.length>>1];
 for(const a of [-2000,0,2000]){const p=xzDA(-4700,a);R.push({name:'step 3 a='+a,page:terrainH(p[0],p[1]),model:m3});}return R;};
const stairSamples=()=>{const o=[];for(let d=-5600;d<-400;d+=5){const p=xzDA(d,-1500);o.push({d,y:localH(p[0],p[1])-plane(p[0],p[1]),bench:slopeAt(p[0],p[1])<.15});}return o;};
const panSamples=()=>{const o=[];for(let i=0;i<60;i++)for(let j=0;j<60;j++){const x=PAN.x+(i/59-.5)*PAN.A*2,z=PAN.z+(j/59-.5)*PAN.A*2;
 if(PAN.sd(x,z)>-40||Math.hypot(x-SHEET.x,z-SHEET.z)<SHEET.r+10)continue;o.push({y:terrainH(x,z),white:GSTEP.groundAt(x,z,{}).pan});}return o;};
function allItems(every){const out=[],m=new THREE.Matrix4();every=every||1;BIO.baked.forEach(o=>{if(!o.isInstancedMesh)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);const e=m.elements;out.push([e[12],e[13],e[14],o.name]);}});return out;}
const onPanCount=P=>P.filter(p=>PAN.sd(p[0],p[2])<-15).length;
const capSamples=()=>{const o=[];for(let a=-300;a<700;a+=3)for(let d=200;d<4300;d+=15){const p=xzDA(d,a);if(!inMap(p[0],p[1])||slopeAt(p[0],p[1])<.6)continue;
 const y=terrainH(p[0],p[1]),r=STRATA.at(p[0],y,p[1]);o.push({yy:r.yy,cap:r.recipe==='godstep-hardpan',kao:r.recipe==='godstep-kaolin'});}return o;};
const reliefSamples=()=>{const o=[];for(const d of [700,1300,1650,2400,2900,3500]){const p=xzDA(d,0);let best=null;for(let a=-300;a<500;a+=4){const q=xzDA(d,a),c=KRELIEF.at(BRK.rec,q[0],q[1]);if(c&&c.part==='face'){best=a;break;}}
 if(best==null)continue;const t=xzDA(d,best-60),f=xzDA(d,best+170);o.push(terrainH(t[0],t[1])-terrainH(f[0],f[1]));}return o;};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),I=allItems(1);
 add('the floors against scale model 5.1',SCHK.heights(heightRows()));
 add('front 3 steps down',SCHK.stair(stairSamples()));
 add('the pan: flat and white',SCHK.pan(panSamples()));
 add('nothing on the pan but its crust; salt-edge plants round it',SCHK.bare(onPanCount(I),(window._biome||{}).edge||0));
 add('the laterite only on the breakaways\' caps',SCHK.caps(capSamples()));
 add('the breakaways stand 10-30 m',SCHK.relief(reliefSamples()));
 add('the air on the pan',SCHK.air(presAt(terrainH(PAN.x,PAN.z))));
 add('the reflections off at load',SCHK.mirror(MIRROR));
 add('BIO.envCheck over the probe\'s points',(()=>{const pts=[];for(let k=0;k<200;k++)pts.push([TERR.X0+((k*37)%200+.5)*48,TERR.Z0+((k*91)%200+.5)*48]);const b=BIO.envCheck(ENV,pts);return{ok:!b.length,detail:b.length?JSON.stringify(b.slice(0,3)):Object.keys(ENV).length+' fields in range at '+pts.length+' points'};})());
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the floors 300 m off the model',SCHK.heights(heightRows().map(r=>Object.assign({},r,{page:r.page+300}))));
 add('a smooth ramp, not a stair',SCHK.stair(stairSamples().map(s=>Object.assign({},s,{bench:false}))));
 add('a bench that climbs',SCHK.stair(stairSamples().map((s,i)=>i===300?Object.assign({},s,{y:s.y+30}):s)));
 add('a mound on the pan',SCHK.pan(panSamples().map((p,i)=>i===50?Object.assign({},p,{y:p.y+2}):p)));
 add('a pan of bare silt',SCHK.pan(panSamples().map(p=>Object.assign({},p,{white:.2}))));
 add('a shrub on the pan',SCHK.bare(onPanCount([[PAN.x,PAN.level,PAN.z,'x']].concat(allItems(50))),(window._biome||{}).edge||0));
 add('hardpan down the kaolin',SCHK.caps(capSamples().map(s=>s.kao?Object.assign({},s,{cap:true,kao:false}):s)));
 add('a breakaway 60 m high',SCHK.relief(reliefSamples().map(d=>d+40)));
 add('the summit\'s air on the pan',SCHK.air(presAt(22000)));
 add('the reflections on at load',SCHK.mirror({mode:()=>'probe',M:()=>({})}));
 return R;}
