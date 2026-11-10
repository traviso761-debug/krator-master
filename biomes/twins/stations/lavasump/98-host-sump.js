// ================================================================= HOST — the Red Cistern's views and checks (station 3)
// The views are found in the built scene (the arch, the tube's floor, the bench, the rim, a strongbox), never aimed at arithmetic alone. The checks
// (verify.py --assert) are pure functions of their inputs, each with a negative that must fail.
const pAt=(s,l)=>[PORT.x+PORT.d[0]*s-PORT.d[1]*(l||0),PORT.z+PORT.d[1]*s+PORT.d[0]*(l||0)];
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v&&v.every(isFinite))VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});};
 // the decoy portal from its trench: the wide arch, the counterfeit tallies over it, the warm air steaming out
 {const c=pAt(-110,3),t=pAt(4,0);add('The decoy portal',[c[0],G(c[0],c[1])+2,c[1],t[0],PORT.floor+7,t[1]]);}
 // inside, toward the red glow at the bottom
 {const c=sAt(TUBE.s1-120,1.5),t=sAt(120,0);add('In the decoy tube, toward the red glow',[c[0],floorT(TUBE.s1-120)+1.7,c[1],t[0],floorT(120)+3,t[1]]);}
 // the fork and the guide's bench
 {const c=sAt(FORK.s+40,2),t=sAt(FORK.s,-TUBE.w/2+1);add('The fork and the guide\'s bench',[c[0],floorT(FORK.s+40)+1.7,c[1],t[0],FORK.bench.top,t[1]]);}
 // the tube's mouth into the amphitheatre: the ash ramp down onto the crust, the pond beyond
 {const c=sAt(96,0),t=sAt(10,0);add('Where the tube ends',[c[0],floorT(96)+1.7,c[1],t[0],POND.level+.5,t[1]]);}
 // the pond from the rim across from the tube
 {const c=sAt(-(PIT.rim+10),0);add('The Red Cistern from the rim',[c[0],G(c[0],c[1])+14,c[1],0,POND.level,0]);}   /* over a knoll's height: the lip hides the floor from a standing eye at the edge */
 // the blister crust, close (from the ramp's foot)
 {const c=sAt(POND.crust[1]+4,1),t=sAt(POND.r-2,-14);add('The blister crust',[c[0],G(c[0],c[1])+1.6,c[1],t[0],POND.level,t[1]]);}
 // a strongbox on the rim
 {const B=CAVE.boxes||[];if(B.length){const b=B[0],dx=b[0],dz=b[2],l=Math.hypot(dx,dz)||1;add('Strongboxes on the rim',[b[0]+dx/l*5,G(b[0]+dx/l*5,b[2]+dz/l*5)+1.6,b[2]+dz/l*5,b[0],b[1]+.4,b[2]]);}}
 // night: the glow out of the bowl
 {const c=sAt(-650,120);add('Night: the glow in the bowl',[c[0],G(c[0],c[1])+6,c[1],0,POND.level+20,0],'night');}
 // the NW Twin over the bowl's rim
 {const T=TWIN_CONES.cones[0],c=sAt(-300,0);add('The NW Twin',[c[0],G(c[0],c[1])+2,c[1],T.x,T.peak,T.z]);}
 {const c=sAt(-1300,-700);add('Overview',[c[0],G(c[0],c[1])+700,c[1],PORT.x*.5,SITE_Y+40,PORT.z*.5]);}}
// THE COLD PROBE (99-host-take.js): a point on the shelf 1.2 km south-east, one in the decoy tube 300 m in
STN.coldProbe=()=>{const o=sAt(-1200,0),t=sAt(TUBE.s1-300,0);return{out:[o[0],terrainH(o[0],o[1])+1.6,o[1]],inn:[t[0],floorT(TUBE.s1-300)+1.6,t[1]]};};
STN.counts=B=>B.stones>1000&&B.blocks>150&&B.blocks+B.stones+B.obsidian<320000;
const LCHK={
 // the tube: open 3 m over its floor along its line, under rock all the way (the amphitheatre is its only sky)
 tubes(open,roofed,n){return{ok:open===n&&roofed===n,detail:open+' of '+n+' points along the decoy open 3 m over the floor; '+roofed+' under rock'};},
 // the downgrade: ~6 degrees (5-7) over 500-1,200 m (PLAN.md section 4.3: "600-1,200 m down the gentle downgrade", "the floor slopes at 6 degrees")
 grade(deg,len){const ok=deg>5&&deg<7&&len>500&&len<1200;return{ok,detail:deg.toFixed(2)+' degrees over '+len.toFixed(0)+' m'};},
 // the pond: 70-110 m across (the plan's 90 m), 1,100 C or more, open to the sky, in walls 50-80 m high
 pond(w,T,sky,walls){const ok=w>70&&w<110&&T>=1100&&sky&&walls>50&&walls<80;return{ok,detail:w.toFixed(0)+' m across, '+T+' C, the sky '+(sky?'over it':'NOT over it')+', its walls '+walls.toFixed(0)+' m'};},
 // the crust (core/hazard's, 89c's twinsCrustTest): a hand over the lava (under 1 m); a walker (80 kg) crosses, the lava held; a laden beast (400 kg) breaks it, the lava open
 crust(T,over){const ok=over>0&&over<1&&T.walker===false&&T.heldK===0&&T.beast===true&&T.openK>=1;
  return{ok,detail:over.toFixed(2)+' m over the lava; a walker '+(T.walker?'BREAKS IT':'crosses')+' (the lava under it k '+T.heldK+'), a laden beast '+(T.beast?'breaks it':'does not')+' (k '+T.openK+')'};},
 // the gas pools in the amphitheatre at night in still air, gone by noon (core/hazard's night air: twinsNightK asks it); the tube's lower end always gassed
 gas(night,noon,tube){const ok=night>.9&&noon<.02&&tube>0;return{ok,detail:'the amphitheatre\'s CO2 at 23:00 '+night.toFixed(2)+', at noon '+noon.toFixed(2)+'; the tube\'s lower end '+tube.toFixed(2)};},
 // the portal: its trench open to the sky, the mouth open, the tube roofed 60 m in; its lower mouth open into the amphitheatre
 portal(trenchSky,mouthOpen,inRoof,lowOpen){const ok=trenchSky&&mouthOpen&&inRoof&&lowOpen;return{ok,detail:'the trench '+(trenchSky?'open':'roofed')+', the mouth '+(mouthOpen?'open':'shut')+', 60 m in '+(inRoof?'under rock':'OPEN TO THE SKY')+', the lower mouth '+(lowOpen?'open':'shut')};},
 // the strongboxes: on the rim (100-125 m from the pond's middle)
 boxes(B){const bad=B.filter(b=>{const r=Math.hypot(b[0],b[2]);return r<PIT.rim||r>PIT.rim+25;});return{ok:B.length>=6&&!bad.length,detail:B.length+' strongboxes, '+bad.length+' off the rim'};},
 // the NW Twin: 14-18 km north-north-west (scale model 5.1: (988, 1458) from (992, 1465)), its crater 5,980 m
 twin(d,brg,floor){const ok=d>14000&&d<18000&&brg>315&&brg<345&&Math.abs(floor-5980)<1;return{ok,detail:(d/1000).toFixed(1)+' km at '+brg.toFixed(0)+' deg, crater '+floor+' m'};}};
function sumpTubeSamples(){const C=CAVE.C;let open=0,roof=0,n=0;for(let s=110;s<TUBE.s1-10;s+=10){const p=sAt(s,0),y=floorT(s)+3;n++;if(C.sdf(p[0],y,p[1])>0)open++;if(C.ceilingAt(p[0],p[1],y)!==null)roof++;}return{open,roof,n};}
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),C=CAVE.C;if(!C){add('the cavern built',{ok:false,detail:'no cavern'});return R;}
 {const t=sumpTubeSamples();add('the decoy tube: open, roofed',LCHK.tubes(t.open,t.roof,t.n));}
 {const L=TUBE.s1-80,deg=Math.atan((floorT(TUBE.s1)-floorT(80))/L)*180/Math.PI;add('the downgrade: 6 degrees, 500-1,200 m',LCHK.grade(deg,L));}
 add('the pond: 90 m of lava open to the sky in its walls',LCHK.pond(POND.r*2,POND.T,C.ceilingAt(0,0,POND.level+2)===null,PIT.rimY-POND.level));
 add('the blister crust: thin, a walker crosses, a laden beast breaks it (core/hazard)',LCHK.crust(twinsCrustTest(CAVE.crust),PIT.apronY-POND.level));
 add('the gas: pooling at night in the amphitheatre, always in the tube\'s end (core/hazard)',LCHK.gas(twinsNightK(CAVE.poolRec,23),twinsNightK(CAVE.poolRec,12),(KHAZ.of(CAVE.tubeGas)||{}).danger||0));
 {const a=pAt(-30,0),b=pAt(4,0),c=pAt(60,0),d=sAt(70,0);
  add('the portal and the lower mouth',LCHK.portal(C.ceilingAt(a[0],a[1],terrainH(a[0],a[1])+1)===null,C.sdf(b[0],PORT.floor+3,b[1])>0,C.ceilingAt(c[0],c[1],floorT(TUBE.s1-60)+3)!==null,C.sdf(d[0],floorT(70)+3,d[1])>0));}
 add('the strongboxes on the rim',LCHK.boxes(CAVE.boxes||[]));
 {const T=TWIN_CONES.cones[0];add('the NW Twin over the bowl',LCHK.twin(Math.hypot(T.x,T.z),(Math.atan2(T.x,-T.z)*180/Math.PI+360)%360,T.floor));}
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});if(!CAVE.C)return R;const t=sumpTubeSamples();
 add('the decoy choked',LCHK.tubes(t.open-4,t.roof,t.n));
 add('a 20-degree chute',LCHK.grade(20,600));
 add('a pond 300 m across',LCHK.pond(300,POND.T,true,66));
 add('a crust a metre and a half thick that never breaks',LCHK.crust(twinsCrustTest(CAVE.crust,80,100),1.5));
 add('a crust that breaks under a walker',LCHK.crust(twinsCrustTest(CAVE.crust,130,400),PIT.apronY-POND.level));
 add('the gas there at noon',LCHK.gas(twinsNightK(CAVE.poolRec,23),twinsNightK(CAVE.poolRec,22),.5));
 add('the tube open to the sky 60 m in',LCHK.portal(true,true,false,true));
 add('the strongboxes in the pond',LCHK.boxes((CAVE.boxes||[]).map(b=>[b[0]*.2,b[1],b[2]*.2])));
 add('the NW Twin due east',LCHK.twin(16000,90,5980));
 return R;}
