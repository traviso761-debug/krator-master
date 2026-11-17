// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 7: Silkhead Gorge)
// THE VERTIGO VIEW: from inside the lip's alcove (45: LIP), its eye 1.7 m over the alcove's floor at the mouth, looking east-south-east and
// down 42 degrees: the hood overhead, the carvings on the cap to the left, the Silkhead's face and its veils to the right, the trench 4.7 km
// below with the dome steaming in the haze.
const VIEWS=(function(){const V={},L=LIP,e=L.eye,dx=DOME.x-e[0],dz=DOME.z-e[2],dh=Math.hypot(dx,dz),dep=Math.atan2(e[1]-DOMEB.top,dh)-9*Math.PI/180,D=1000;
 /* from the lip's mouth, 0.6 m in from the drop: the dome's bearing, 9 degrees over it (the ledge's edge across the foot of the frame) */
 V['Vertigo (under the lip at +3580 m)']=[e[0],e[1],e[2],e[0]+dx/dh*D,e[1]-D*Math.tan(dep),e[2]+dz/dh*D];
 // the gorge and its spans, from the spur's ledge further in, looking along the cleft
 {const u=470,s=380,x=S0[0]+u*AX[0]+s*PP[0],z=S0[1]+u*AX[1]+s*PP[1];V['Silkhead Gorge (the silk spans over 180 m)']=[x,RIM_Y+30,z,S0[0]+1050*AX[0]+330*PP[0],RIM_Y-90,S0[1]+1050*AX[1]+330*PP[1]];}
 // the veils from the air north of the Silkhead's face
 {const f=VEIL.foot,n=VEIL.n;V['The mist-veils (4.8 km of falling water)']=[f[0]+n[0]*2600-AX[0]*700,2600,f[1]+n[1]*2600-AX[1]*700,f[0],2300,f[1]];}
 V['The pancake dome (obsidian and steaming)']=[DOME.x-900,DOME.H+420,DOME.z-760,DOME.x,DOME.H*.5,DOME.z];
 {const p=POOLS.find(q=>q.bed);if(p)V['A black pitcher pool (on the dome apron)']=[p.x+p.r*1.6,14,p.z+p.r*1.3,p.x,2,p.z];}
 V['From the trench floor (4.8 km of wall)']=[LAKE.x+380,8,LAKE.z+520,VEIL.foot[0]-200,2600,VEIL.foot[1]-200];
 V['The skarn foot (contact marble)']=[VEIL.foot[0]+VEIL.n[0]*160+AX[0]*260,60,VEIL.foot[1]+VEIL.n[1]*160+AX[1]*260,VEIL.foot[0]+AX[0]*120,240,VEIL.foot[1]+AX[1]*120];
 {const u=-300,x=S0[0]+u*AX[0],z=S0[1]+u*AX[1];V['The hoar table (the spur pavement)']=[x-AX[0]*260,RIM_Y+40,z-AX[1]*260,x+AX[0]*200,RIM_Y,z+AX[1]*200];}
 V['From afar (the scarp over the trench)']=[1700,1500,1900,-1900,2600,-600];
 return V;})();
(function(){const cv=CARVINGS[0];if(cv){const B=SPUR,a=Math.atan2(cv.z-B.z,cv.x-B.x);VIEWS['The carvings (the Hum in the bedding recess)']=[cv.x+Math.cos(a)*14+AX[0]*4,cv.y+cv.h*.5+1,cv.z+Math.sin(a)*14+AX[1]*4,cv.x,cv.y+cv.h*.5,cv.z];}
 const KO=typeof KORONA!=='undefined'?KORONA:null,TR=(KO&&KO.TRAPPED)||[],m=TR.filter(t=>t.key==='maneater')[0];if(m)VIEWS['A man-eater (the trench floor)']=[m.x+5,m.y+3,m.z+4,m.x,m.y+1,m.z];
 const ft=TR.filter(t=>t.key==='frosttank')[0];if(ft)VIEWS['A frost tank (the summit pavement)']=[ft.x+3,ft.y+1.6,ft.z+2.2,ft.x,ft.y+.6,ft.z];})();

function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const KO=typeof KORONA!=='undefined'?KORONA:null,EH=typeof EHIGH!=='undefined'?EHIGH:null;
 const PLT=item&&((KO&&KO.plantOfItem(item))||NECANYONS.plantOfItem(item)||(EH&&EH.plantOfItem&&EH.plantOfItem(item))),SPx=item&&EH&&EH.speciesOfItem&&EH.speciesOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&(NECANYONS.SPECIES.find(s=>best.key===s.key)||(KO&&KO.SPECIES.find(s=>best.key===s.key))||(EH&&EH.SPECIES&&EH.SPECIES.find(s=>best.key===s.key)));
 const F=PLT||SPx||SB||(NM&&NM.plant?((KO&&KO.PLANTS[NM.plant])||NECANYONS.PLANTS[NM.plant]):null),hv=F&&F.tags?F.tags.harvest:null,tr=F&&F.tags?F.tags.trap:null;
 const Z=NECANYONS.at(p.x,p.z),hell=hellAt(p.x,p.z);
 /* the bed the point is in (KSTRATA: the wall's formation, recipe and kind) */
 const st=ROCK_STRATA&&ROCK_STRATA.at&&o.userData&&o.userData.rock?ROCK_STRATA.at(p.x,p.y,p.z):null;
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+((hv.edible||[]).join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (tr?'\ntrap: '+tr.kind+' · mouth '+tr.mouth+' m · prey up to '+tr.preyMax+(tr.lure?' · lure '+tr.lure:'')+' · danger '+tr.danger+(tr.danger>0?' (HAZARD)':''):'')+
  (st?'\nrock: '+st.recipe+' · '+String(st.kind).replace(/^[^.]*\./,''):'')+
  '\nzone '+Z.zone+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · warm '+BIO.field('warm',p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+Math.round(p.y+ELEV0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m'+hazardWords(p);}
/* the hazards at the point (core/hazard, KTAGS.hazardAt): each one's kind, danger and state now */
function hazardWords(p){const w=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';return w?'\n'+w:'';}

const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:2400000},
 type:{'korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass','ehigh/trees':'pass','ehigh/floor':'pass','hyperjungle/trees':'pass','hyperjungle/floor':'pass','hyperjungle/fauna':'pass','necanyons/trees':'pass','necanyons/floor':'pass','necanyons/carnivores':'pass','host':'host'},
};
// THE STATION'S CHECKS, each with a negative (a broken input it must fail)
const HCHK={
 // the relief: the rim 4,800 m over the trench floor (the spec's +3,620 over -1,180)
 drop(rimY,floorY){const d=rimY-floorY;return{ok:Math.abs(d-4800)<120,detail:'rim '+Math.round(rimY+ELEV0)+' m over the floor at '+Math.round(floorY+ELEV0)+' m: '+Math.round(d)+' m of wall (the spec: 4,800)'};},
 // the lip covers the vertigo camera: the alcove's ceiling over the eye, the eye over the alcove's floor, the hood's rock above it
 lip(eye){const Q=LIP.Q,L=KCARVE.local(Q,eye[0],eye[2]),inPlan=KCARVE.planSD(Q,eye[0],eye[2])<0,cov=inPlan?Q.K.ceil(Q,L.u,Math.max(0,L.q)):null,fl=terrainH(eye[0],eye[2]);
  return{ok:inPlan&&cov>eye[1]+1&&eye[1]>fl+1&&eye[1]<fl+2.5&&KCARVE.rockAt(eye[0],cov+1,eye[2]),detail:'eye at '+eye[1].toFixed(1)+', floor '+fl.toFixed(1)+', ceiling '+(cov==null?'none':cov.toFixed(1))+' (+'+Math.round((eye[1]||0)+ELEV0)+' m), '+(2.5-1.9).toFixed(1)+' m from the drop'};},
 // the gorge: 160-220 m at its narrows; every span's anchors on drawn rock (within 1.5 m of the rock's top or face), its low point over the col
 gorge(spans){const W=[];for(let u=600;u<=1100;u+=20){let a=null,b=null;for(let s=0;s<=900;s+=1){const x=S0[0]+u*AX[0]+s*PP[0],z=S0[1]+u*AX[1]+s*PP[1],t=NECANYONS.top(x,z);if(!(t>RIM_Y-20)){if(a==null)a=s;}else if(a!=null&&b==null)b=s;}if(a!=null&&b!=null)W.push(b-a);}
  const narrows=W.length?Math.min(...W):0;let off=0,low=0;
  /* an anchor on a top or a ledge: within 1.5 m over the ground there; a peg on a face: within 1.5 m of its bed's drawn wall */
  const onRock=(p,k)=>{if(k!=='face')return Math.abs(p[1]-terrainH(p[0],p[2]))<1.5;
   for(const B of [SPUR,TOWER]){const b=B.beds.find(q=>p[1]>=q.y&&p[1]<=q.y+q.h);if(!b)continue;const a=Math.atan2(p[2]-b.cz,p[0]-b.cx),u=(p[1]-b.y)/b.h,d=Math.hypot(p[0]-b.cx,p[2]-b.cz)-KSTACKS.footR(b,a)*KSTACKS.prof(b,u);if(Math.abs(d)<1.5)return true;}return false;};
  spans.forEach(S=>{if(!onRock(S.a,S.ka))off++;if(!onRock(S.b,S.kb))off++;if(!(S.low[1]>COL_Y+20))low++;});
  return{ok:spans.length>=3&&narrows>=160&&narrows<=220&&off===0&&low===0,detail:'narrows '+narrows+' m rim to rim; '+spans.length+' spans, '+off+' anchors off the rock, '+low+' sagging to the col'};},
 // the veils: each lip on its tier's drawn top edge, each foot on the bench below or in the lake, the drops summing to the wall
 veils(F){let bad=0,sum=0;F.forEach((f,i)=>{sum+=f.drop;const t=terrainH(f.lip[0]-VEIL.n[0]*2,f.lip[1]-VEIL.n[1]*2);if(Math.abs(t-f.lip[2])>2.5)bad++;
   const g=i===F.length-1?(LAKE.y!=null?LAKE.y:terrainH(f.foot[0],f.foot[1])):terrainH(f.foot[0],f.foot[1]);if(Math.abs(g-f.foot[2])>3||!(f.speed>0&&f.speed<6))bad++;});
  return{ok:F.length===4&&bad===0&&Math.abs(sum-(RIM_Y-(LAKE.y||0)))<40,detail:F.length+' falls, '+Math.round(sum)+' m of water, '+bad+' off their lip or foot; first '+(F[0]?Math.round(F[0].drop):0)+' m free fall at '+(F[0]?F[0].speed.toFixed(2):0)+' m/s'};},
 // the rock: contact-marble at the walls' foot, the tepui's quartzite up the wall, obsidian-pancake on the dome
 strata(S){if(!S||!S.at)return{ok:false,detail:'no strata'};const at=(x,y,z)=>S.at(x,y,z).recipe;
  const lo=at(VEIL.foot[0],180,VEIL.foot[1]),hi=at(VEIL.foot[0],3400,VEIL.foot[1]),dm=at(DOME.x,DOMEB.y0+DOME.H*.5,DOME.z);
  return{ok:lo==='contact-marble'&&hi==='tepui'&&dm==='obsidian-pancake',detail:'wall foot '+lo+', wall '+hi+', dome '+dm};},
 // the cold up, the heat down: no trap of danger .5 or more above the col; the cold traps only on the summit; man-eaters only on the floor
 traps(TRP){const hot=TRP.filter(t=>t.trap&&t.trap.danger>=.5&&(t.y||0)>COL_Y-100),cold=TRP.filter(t=>t.key==='frosttank'||t.key==='butterwort'),low=cold.filter(t=>(t.y||0)<COL_Y-100);
  return{ok:hot.length===0&&low.length===0&&cold.length>=10,detail:hot.length+' dangerous traps above the col, '+cold.length+' cold traps ('+low.length+' below the col)'};},
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5&&c.body==='spur',detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};},
 // the steam is the trench's: every vent below the col (no fumarolic sulfur on the hoar table: PLAN.md, "Purge summit sulfur")
 vents(V){const up=V.filter(v=>v[1]>COL_Y-100);return{ok:V.length>=4&&up.length===0,detail:V.length+' vents, '+up.length+' above the col'};},
 // the layout's bed index holds 64 beds a body (NECANYONS: 6 bits)
 beds(L){const over=L.filter(B=>B.beds.length>64);return{ok:over.length===0,detail:L.map(B=>B.id+' '+B.beds.length).join(', ')};}};
const EYE=()=>LIP.eye.slice();
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),KO=KORONA;
 add('the drop of 4800 m from the rim to the trench',HCHK.drop(SPUR.top,terrainH(DOME.x-DOME.r-200,DOME.z-300)));
 add('the lip over the vertigo camera',HCHK.lip(EYE()));
 add('the gorge and its spans',HCHK.gorge(SILK.spans));
 add('the veils stacked down the Silkhead',HCHK.veils(SILK.falls));
 add('the rock is marble then quartzite and glass on the dome',HCHK.strata(ROCK_STRATA));
 add('the cold up and the heat down',HCHK.traps(KO.TRAPPED||[]));
 add('the carvings in the bedding recess',HCHK.carvings(CARVINGS));
 add('the steam is in the trench',HCHK.vents(SILK.vents));
 add('every body fits the layout bed index',HCHK.beds(STAGE.bodies));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),KO=KORONA;
 add('a rim 1000 m too low',HCHK.drop(SPUR.top-1000,terrainH(DOME.x-DOME.r-200,DOME.z-300)));
 add('the camera out in the open',HCHK.lip([LIP.c[0]+LIP.n[0]*40,LIP.floorY+1.7,LIP.c[1]+LIP.n[1]*40]));
 add('the camera behind the lip in the rock',HCHK.lip([LIP.c[0]-LIP.n[0]*(LIP.Q.depth+8),LIP.floorY+1.7,LIP.c[1]-LIP.n[1]*(LIP.Q.depth+8)]));
 add('a span anchored in the air',HCHK.gorge(SILK.spans.concat([{a:[0,RIM_Y,0],b:[60,RIM_Y,0],low:[30,RIM_Y-5,0]}])));
 add('a veil lifted 30 m off its lip',HCHK.veils(SILK.falls.map((f,i)=>i?f:Object.assign({},f,{lip:[f.lip[0],f.lip[1],f.lip[2]+30]}))));
 add('quartzite on the dome',HCHK.strata({at:(x,y,z)=>({recipe:'tepui'})}));
 add('a man-eater on the hoar table',HCHK.traps((KO.TRAPPED||[]).concat([{key:'maneater',x:S0[0],z:S0[1],y:RIM_Y,trap:KO.TRAPS.maneater}])));
 add('no carvings',HCHK.carvings([]));
 add('a fumarole on the summit',HCHK.vents(SILK.vents.concat([[S0[0],RIM_Y,S0[1]]])));
 add('a body of 70 beds',HCHK.beds([{id:'x',beds:new Array(70)}]));
 return R;}

window._registered=REG.length;
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'korona',title:'Krator biome — Korona: Silkhead Gorge and the hoar-table rim',
 hint:'Korona, station 7 (Gemini 5.1 showcase #7): under a carved lip at +3,580 m on the hoar table\'s spur, 4.8 km of tiered tepui wall over the ring trench: the silk spans over Silkhead Gorge, the mist-veils down the Silkhead, the obsidian pancake dome steaming by its black pitcher pools 4.7 km below',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:HOST_DRAW,   /* the reflections switch (98z), the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'hazards':KTAGS.hazardLayer(),'carnivores':{match:o=>{if(!(o.isInstancedMesh&&o.userData&&o.userData.biome))return false;const it=(o.name||'').replace(/^biome:/,''),P=KORONA.plantOfItem(it)||NECANYONS.plantOfItem(it);return !!(P&&P.tags.trap);}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'silk and liana':{match:o=>!!(o.userData&&o.userData.silk)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),layout:()=>Object.assign(NECANYONS.records(),{carvings:CARVINGS,pools:STAGE.pools,air:STAGE.air,lip:{c:LIP.c,n:LIP.n,floorY:LIP.floorY,top:LIP.top},
  falls:SILK.falls,spans:SILK.spans,ladders:SILK.ladders,winch:SILK.winch,vents:SILK.vents})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  high:()=>window._high,korona:()=>window._korona,hell:hellAt,silk:()=>SILK}});
