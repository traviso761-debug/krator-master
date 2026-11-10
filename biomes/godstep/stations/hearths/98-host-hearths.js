// ================================================================= HOST — the stair's hearth: records, views and checks (station 3)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check a pure function with a broken input that must fail);
// 88-host-build.js calls stationRecords before the kit builds (the walls' edges are handed to the kit's pass here).
function stationRecords(){const G=(x,z)=>terrainH(x,z);
 REGISTER({name:PIT.name,x:0,z:0,y:PIT.floor-30,r:3400,h:420});
 REGISTER({name:SPRING.name.replace(': iron-red at its eye, a moss lawn round it','')+' and its moss lawn (the nemetos, a sacred place of the Talovolci)',x:SPRING.x,z:SPRING.z,y:G(SPRING.x,SPRING.z)-6,r:170,h:24});
 MOUTHS.forEach(M=>REGISTER({name:M.name[0].toUpperCase()+M.name.slice(1)+', drawn to its first bend (KCAVERN)',x:M.wx,z:M.wz,y:M.floorY-4,r:70,h:M.h+20,kind:'cavern'}));
 REGISTER({name:OLD.name,x:OLD.x,z:OLD.z,y:OLD.level-40,r:640,h:140});
 {let x=0,z=0;FARMS.forEach(F=>{x+=F.P[0][0];z+=F.P[0][1];});x/=FARMS.length;z/=FARMS.length;const r=Math.max(...FARMS.map(F=>Math.hypot(F.P[0][0]-x,F.P[0][1]-z)))+90;
  REGISTER({name:FARMS.length+' walled fields of the Talovolci in the older crater (their plots painted on core/mask: '+FARM_MASK.hash+')',x,z,y:OLD.level-4,r,h:50});}
 REGISTER({name:PATH.name,x:PATH.ravine.x,z:PATH.ravine.z,y:PIT.floor-20,r:4200,h:500,path:true});
 REGISTER({name:STREAM.name,x:(STREAM.pts[0][0]+MOUTHS[0].wx)/2,z:(STREAM.pts[0][1]+MOUTHS[0].wz)/2,y:PIT.floor-20,r:2000,h:60,path:true});
 /* the plots' edges, for the kit's wall pass (55): each plot's four, the first with a gate; keyed by the plot's lattice place */
 const E=[];FARMS.forEach(F=>{for(let k=0;k<4;k++)E.push({a:F.P[k],b:F.P[(k+1)%4],key:((F.i+40)*97+(F.j+40))*4+k,gate:k===0});});GSTEP.FARM_EDGES=E;}
// ---- the views, found in the built scene
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};};
 const T=(window._field&&window._field.trees)||[];
 // THE STATION'S VIEW (PLAN.md 7.3): a winter night at the disc's edge, the fans open black over the warm ground, the wall dark beyond
 {const c=[VENT.x+125,VENT.z+85],t=[VENT.x-20,VENT.z-10];add('The hearth on a winter night',[c[0],G(c[0],c[1])+2.5,c[1],t[0],G(t[0],t[1])+5,t[1]],'night');}
 {const c=[VENT.x+125,VENT.z+85],t=[VENT.x-20,VENT.z-10];add('Noon: the field shut and silver',[c[0],G(c[0],c[1])+2.5,c[1],t[0],G(t[0],t[1])+5,t[1]],'day');}
 {const n=T.slice().sort((a,b)=>Math.hypot(a.x-VENT.x-60,a.z-VENT.z-40)-Math.hypot(b.x-VENT.x-60,b.z-VENT.z-40))[0];
  if(n)add('A hearth tree',[n.x+9,G(n.x+9,n.z+6)+1.8,n.z+6,n.x,n.y+n.H*.8,n.z],'night');}
 {const c=[SPRING.x-60,SPRING.z+70],t=[SPRING.x,SPRING.z];add('The spring and its moss lawn',[c[0],G(c[0],c[1])+1.8,c[1],t[0],G(t[0],t[1]),t[1]],'dawn');}
 {/* stand on the lip's crest on the WNW (its highest), found along the ray, with a clear sightline down to the floor's centre */
  const a=PIT.aW,ca=Math.cos(a),sa=Math.sin(a),R0=PIT.Rr(a);let rc=R0,hc=-1e9;for(let r=R0-400;r<R0+700;r+=5){const h=G(ca*r,sa*r);if(h>hc){hc=h;rc=r;}}
  const c=[ca*(rc-6),sa*(rc-6)],tx=ca*Math.min(rc*.35,1200),tz=sa*Math.min(rc*.35,1200),ty=G(tx,tz);let ey=G(c[0],c[1])+3;
  for(let k=0;k<40;k++){let ok=true;for(let f=.02;f<1;f+=.02){const x=c[0]+(tx-c[0])*f,z=c[1]+(tz-c[1])*f;if(G(x,z)>ey+(ty-ey)*f-1){ok=false;break;}}if(ok)break;ey+=3;}
  add('The pit from its rim',[c[0],ey,c[1],tx,ty,tz]);}
 MOUTHS.forEach((M,i)=>{const s=M.s-120,c=[M.dir[0]*s-M.dir[1]*8,M.dir[1]*s+M.dir[0]*8];add(i?'The cross-conduit\'s mouth':'The mouth of tube_god_07',[c[0],G(c[0],c[1])+1.8,c[1],M.wx,M.floorY+M.h*.4,M.wz]);});
 {const c=[OLD.x-OLD.r*.95,OLD.z+OLD.r*.5];add('The older crater and its fields',[c[0],G(c[0],c[1])+40,c[1],OLD.x+OLD.r*.2,OLD.level,OLD.z-OLD.r*.1]);}
 {const P=PATH.pts,c=P[2],t=P[5];add('The procession\'s way down',[c[0],G(c[0],c[1])+1.7,c[1],t[0],G(t[0],t[1]),t[1]]);}
 {const c=[-5200,4600],t=[0,0];add('Overview',[c[0],G(c[0],c[1])+1500,c[1],t[0],PIT.floor,t[1]]);}}
// ---- the checks (pure functions of their samples)
const SCHK={
 // the pit's floor against 5.1's (the raster at the vent: 2,708 m) and the plain round it against 5.1's own relief, within 50 m; the rim 2,790-2,870
 heights(rows){const bad=rows.filter(r=>Math.abs(r.page-r.model)>50);return{ok:rows.length>=6&&!bad.length,detail:rows.map(r=>r.name+' '+r.page.toFixed(0)+' m (5.1: '+r.model.toFixed(0)+')').join('; ')};},
 rim(R){const lo=Math.min(...R.map(r=>r.y)),hi=Math.max(...R.map(r=>r.y)),top=R.slice().sort((a,b)=>b.y-a.y)[0];let d=Math.abs(top.a-PIT.aW);d=Math.min(d,TAU-d);
  return{ok:lo>2780&&hi<2880&&d<1.2,detail:'the lip '+lo.toFixed(0)+'-'+hi.toFixed(0)+' m, highest at '+(top.a*180/Math.PI).toFixed(0)+' deg (WNW is '+(PIT.aW*180/Math.PI).toFixed(0)+')'};},
 air(p){return{ok:p>1.12&&p<1.16,detail:p.toFixed(3)+' atm on the floor (PLAN.md: 1.14)'};},
 // the hearth trees on 25-60 C ground only (KTHERM), and there are trees
 trees(T){const bad=T.filter(t=>t.heat<25||t.heat>60);return{ok:T.length>=20&&!bad.length,detail:bad.length?bad.length+' trees off 25-60 C (first '+bad[0].heat.toFixed(1)+')':T.length+' hearth trees, all on 25-60 C'};},
 ember(P,heat){const bad=P.filter(p=>{const v=heat(p[0],p[2]);return v<58||v>97;});return{ok:P.length>0&&!bad.length,detail:bad.length?bad.length+' mats off the hottest ground':P.length+' ember mats on 60-95 C'};},
 // no snow on ground over 0 C (KTHERM's snow mask), and snow lies in the cold country round it
 snow(S){const warm=S.filter(s=>s.heat>.5),cold=S.filter(s=>s.heat<-3.5),bad=warm.filter(s=>s.snow>.03).length,mean=cold.reduce((a,s)=>a+s.snow,0)/Math.max(1,cold.length);
  return{ok:warm.length>50&&!bad&&mean>.1,detail:warm.length+' points over 0 C: '+bad+' with snow; the cold ground\'s mean snow '+mean.toFixed(2)};},
 // the tube mouths: 30 m past each face, at the tube's mid-height, the point is in the cavern's void and under the wall's rock; 15 m in front of
 // it the ground is under the bore's middle (the fallen roof's cut: open air); the record's opening is where the mouth is
 mouths(rows){const bad=rows.filter(r=>!(r.inVoid&&r.under&&r.open&&r.opening<6));return{ok:rows.length===2&&!bad.length,detail:rows.map(r=>r.key+': void '+r.sd.toFixed(1)+' m, rock over '+r.over.toFixed(0)+' m, open air in front '+(r.open?'yes':'NO')+', opening off '+r.opening.toFixed(1)+' m').join('; ')};},
 // nothing grows on a face: the hearth trees, the pioneers
 flora(P){const bad=P.filter(p=>p.face>.45).length;return{ok:P.length>100&&bad<=Math.max(2,P.length*.003),detail:P.length+' plants sampled: '+bad+' on a face'};},
 work(f){const w=f||((t,o)=>HEARTH.work(t,o)),night=w(0,{sunAlt:-20}),noon=w(0,{sunAlt:50}),ecl=w(0,{sunAlt:50,hidden:1});
  return{ok:night>.95&&noon<.05&&ecl>.95,detail:'night '+night.toFixed(2)+', noon '+noon.toFixed(2)+', eclipse '+ecl.toFixed(2)};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const heightRows=()=>{const R=[],m0=modelAt(0,0);[[0,0],[VENT.x,VENT.z],[900,-600],[-900,900]].forEach((p,i)=>R.push({name:'the floor '+i,page:terrainH(p[0],p[1]),model:m0}));
 [[0,-4500,'N'],[-4500,0,'W'],[0,4500,'S'],[-3180,3180,'SW']].forEach(p=>R.push({name:'the plain '+p[2],page:terrainH(p[0],p[1]),model:modelAt(p[0],p[1])}));return R;};
const rimRows=()=>{const R=[];for(let k=0;k<72;k++){const a=-Math.PI+k/72*TAU;let y=-1e9;for(let r=PIT.Rr(a)-60;r<PIT.Rr(a)+140;r+=10)y=Math.max(y,terrainH(Math.cos(a)*r,Math.sin(a)*r));R.push({a,y});}return R;};
const snowRows=()=>{const S=[];for(let i=0;i<80;i++)for(let j=0;j<80;j++){const x=THERM_BOX[0]+(i+.5)*(THERM_BOX[2]-THERM_BOX[0])/80,z=THERM_BOX[1]+(j+.5)*(THERM_BOX[3]-THERM_BOX[1])/80;S.push({heat:heatAt(x,z),snow:FIELD.snow(x,z)});}
 for(let k=0;k<200;k++){const x=TERR.X0+((k*37)%100+.5)*96,z=TERR.Z0+((k*61)%100+.5)*96;S.push({heat:heatAt(x,z),snow:FIELD.snow(x,z)});}return S;};
const mouthRows=sh=>{const C=CAV.C;if(!C)return[];return MOUTHS.map(M=>{const s=M.s+30,x=M.dir[0]*s-M.dir[1]*(sh||0),z=M.dir[1]*s+M.dir[0]*(sh||0),y=M.floorY+M.grade*30+M.h*.4,sd=C.voidSD(x,y,z),over=terrainH(x,z)-(M.floorY+M.h);
 const fx=M.dir[0]*(M.s-15)-M.dir[1]*(sh||0),fz=M.dir[1]*(M.s-15)+M.dir[0]*(sh||0),open=terrainH(fx,fz)<M.floorY+M.h*.4;
 const Q=C.openings.find(o=>o.id==='face-'+M.key);return{key:M.key,sd,inVoid:sd<0,over,under:over>1,open,opening:Q?Math.hypot(Q.c[0]-M.wx,Q.c[1]-M.wz):1e9};});};
const floraRows=()=>itemPositions('hstalk',2).concat(itemPositions('cushion',3),itemPositions('crust',4)).map(p=>({face:FIELD.face(p[0],p[2])}));
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),F=window._field||{trees:[]};
 add('the pit\'s floor and the plain against scale model 5.1',SCHK.heights(heightRows()));
 add('the pit\'s lip at 2,810-2,850 m, highest WNW',SCHK.rim(rimRows()));
 add('the air on the floor',SCHK.air(presAt(terrainH(VENT.x,VENT.z))));
 add('hearth trees on 25-60 C ground only (KTHERM)',SCHK.trees(F.trees));
 add('the ember mat on 60-95 C ground only',SCHK.ember(itemPositions('hember',1),heatAt));
 add('no snow on ground over 0 C (KTHERM\'s snow mask); snow on the cold ground',SCHK.snow(snowRows()));
 add('the tube mouths in the pit\'s wall agree with the KCAVERN records',SCHK.mouths(mouthRows(0)));
 add('the hearth trees and the pioneers off the faces',SCHK.flora(floraRows()));
 add('the engine: open at night, shut at noon, open in an eclipse (HEARTH.work)',SCHK.work());
 add('BIO.envCheck over the probe\'s points',(()=>{const pts=[];for(let k=0;k<200;k++)pts.push([TERR.X0+((k*37)%200+.5)*48,TERR.Z0+((k*91)%200+.5)*48]);const b=BIO.envCheck(ENV,pts);return{ok:!b.length,detail:b.length?JSON.stringify(b.slice(0,3)):Object.keys(ENV).length+' fields in range at '+pts.length+' points'};})());
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the floor 300 m off the model',SCHK.heights(heightRows().map(r=>Object.assign({},r,{page:r.page+300}))));
 add('a lip at the plain\'s height',SCHK.rim(rimRows().map(r=>Object.assign({},r,{y:r.y+200}))));
 add('the summit\'s air on the floor',SCHK.air(presAt(9000)));
 add('a hearth tree on cold ground',SCHK.trees(((window._field||{}).trees||[]).concat([{x:2000,z:2000,heat:-4}])));
 add('an ember mat on cool ground',SCHK.ember([[2000,0,2000]],heatAt));
 add('snow on the warm ground',SCHK.snow(snowRows().map(s=>Object.assign({},s,{snow:.4}))));
 add('the mouths 300 m along the wall',SCHK.mouths(mouthRows(300)));
 add('trees on the wall\'s face',SCHK.flora(floraRows().map(p=>({face:1}))));
 add('an engine open at noon',SCHK.work(()=>1));
 return R;}
