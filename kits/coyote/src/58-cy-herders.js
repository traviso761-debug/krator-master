// prefix: cy
// ================================================================= THE HERDERS (Tong-Hau and Si-Hau): the tipi and the goat-and-ostrich camp
// PLAN.md sections 2 and 3; the owner (2026-11-16): the herders get a new tipi model (this kit's, not the Tents kit's generic
// cone). A cone of poles crossing above a cover of sewn goat and ostrich hide, its smoke flaps on their own poles, the door a
// hide flap (core/door), a dew lining inside; the cover painted with the tribe's contour line round it (32-cy-contour.js) and
// a runner bird at the back. In winter (v 1) the tipi stands on a low ring of stone banked with earth (cy_winter_base). The
// camp is core/camp's (KCAMP.census, KCAMP.pitch) on the kit's draft row 'coyote-herder' (34-cy-rows.js).
//   cyTipi(R,H,o)        a tipi of radius R and pole height H. o: role ('family' | 'sleep' | 'chief' | 'council' | 'shrine'),
//                        tribe ('sunrise' | 'sunset': the band's colour and name), v (1: winter, on its stone base)
//   cy_tipi_s, cy_tipi_m, cy_tipi_l   the three sizes; the role and the tribe are placement options (o.role, o.tribe)
//   cy_ostrich_pen, cy_feather_rack, cy_saddle_rack, cy_egg_cache, cy_winter_base   the camp's pens and works
//   cy_camp_summer, cy_camp_winter    a Sunrise band of about fifty pitched by core/camp: summer on the treads, winter low
const CY_TRIBE_COL={sunrise:0xd8a024,sunset:0x6a2e5c};
const CY_TIPI={s:{R:2.2,H:5.0},m:{R:3.0,H:6.4},l:{R:3.8,H:7.6}};
function cyTipi(R,H,o){o=o||{};const role=o.role||'family',tribe=o.tribe||'sunrise',band=CY_TRIBE_COL[tribe]||CY_TRIBE_COL.sunrise,Hc=H*.84,g=.24;
 const rAt=y=>R*(1-y/Hc),n=R>3.4?16:R>2.6?14:12,hide=P('hide'),lt=new THREE.Color(.86,.8,.68);
 /* the winter base: a low ring of stone banked with earth, its gap at the door */
 if(o.v===1)cyRingBase(R);
 /* the poles: from a ring at the foot, crossing below the top, running on past the crossing */
 svNoWalk(()=>{for(let i=0;i<n;i++){const a=i/n*TAU+.13,fx=Math.cos(a)*R*.95,fz=Math.sin(a)*R*.95,c=[0,Hc*1.02,0],L=H/Hc;
   pole('timber',[fx,0,fz],[fx+(c[0]-fx)*L,c[1]*L*.98,fz+(c[2]-fz)*L],.045,P('timber'),5);}
  /* the cover: the lower band left open at the door, the rest whole; a smoke hole at the top */
  const yb=1.45,Rb=rAt(yb);
  lathe('hide',0,0,[[R,0],[Rb,yb]],22,hide,{a0:PI/2+g,a1:PI/2-g+TAU});
  lathe('hide',0,0,[[Rb,yb],[R*.06,Hc*.94]],22,hide);
  /* the dew lining inside, to shoulder height */
  lathe('hide',0,0,[[R*.9,0],[rAt(1.5)-.1,1.5]],20,lt,{a0:PI/2+g,a1:PI/2-g+TAU,inward:true});   /* inside the cover all the way up */
  /* the smoke flaps on their poles, either side of the front over the hole */
  for(const s of [-1,1]){const a=PI/2+s*.42,y=Hc*.78,r=rAt(y)+.05,x=Math.cos(a)*r,z=Math.sin(a)*r;
   WX(x,y,z,-(a-PI/2),-.35,0,()=>box('hide',0,0,0,.55,H*.17,.02,hide));
   pole('timber',[Math.cos(a)*R*1.25,0,Math.sin(a)*R*1.25],[x*1.05,Hc*.96,z*1.05],.03,P('timber'),5);}
  /* the paint: a band in the tribe's colour, the band's name as a contour line round the cover, the runner bird at the back */
  lathe('plain',0,0,[[rAt(.55)+.012,.55],[rAt(.8)+.012,.8]],22,new THREE.Color(band),{a0:PI/2+g,a1:PI/2-g+TAU});
  const C=cyContour((CY_TRIBES[tribe]||CY_TRIBES.sunrise).hum+(role==='chief'?' '+CY_TRIBES[tribe].hum:'')+'.'),y0=.95,hh=.5;
  const k=(TAU-2*g-.4)/Math.max(1,C.length),col=new THREE.Color(.9,.84,.68);let segs=0;   /* cream on the dark hide */
  for(const S of C.strokes)for(let i=1;i<S.pts.length;i++){const P0=S.pts[i-1],P1=S.pts[i];
   const pt=q=>{const a=PI/2+g+.2+q[0]*k,y=y0+q[1]*hh,r=rAt(y)+.016;return [Math.cos(a)*r,y,Math.sin(a)*r];};
   beam('plain',pt(P0),pt(P1),.012,col,false,0,.03);segs++;}
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};
  const yb2=role==='chief'||role==='shrine'?1.9:1.7,tilt=Math.atan(R/Hc);
  WX(0,yb2,-(rAt(yb2)+.02),PI,-tilt,0,()=>cyBird(0,0,0,role==='shrine'?1.3:.9,new THREE.Color(band).multiplyScalar(.7)));
  if(role==='chief')for(const s of [-1,1])WX(Math.cos(PI/2+s*1.1)*(rAt(1.6)+.02),1.6,Math.sin(PI/2+s*1.1)*(rAt(1.6)+.02),-(s*1.1),-tilt,0,()=>cyBird(0,0,0,.6,P('red')));});
 /* the floor, the fire and what the role keeps inside */
 box('floor',0,0,0,R*1.3,.04,R*1.3,P('floor'));
 cyHearth(0,0,{r:Math.min(.4,R*.14)});
 const beds=role==='sleep'?3:role==='council'?0:2;
 for(let i=0;i<beds;i++){const a=-PI/2+(i-(beds-1)/2)*.75,r=R*.62;W(Math.cos(a)*r,0,Math.sin(a)*r,-a+PI/2,()=>{box('hide',0,.04,0,1.6,.08,.8,P('hide'));box('plain',0,.12,0,1.5,.04,.7,lt);});}
 if(role==='council'||role==='chief')for(let i=0;i<8;i++){const a=i/8*TAU+.3;if(Math.abs(((a-PI/2+PI)%TAU)-PI)<.5)continue;const r=R*.7;
  W(Math.cos(a)*r,0,Math.sin(a)*r,-a+PI/2,()=>{box('hide',0,.04,0,.7,.05,.6,P('hide'));pole('timber',[-.25,0,-.3],[0,.9,-.55],.02,P('timber'),4);pole('timber',[.25,0,-.3],[0,.9,-.55],.02,P('timber'),4);
   box('reed',0,.25,-.38,.55,.7,.03,P('reed'),0,-.35);});}
 if(role==='shrine'){pole('timber',[0,0,-R*.55],[0,2.2,-R*.55],.04,P('timber'),6);
  for(let i=0;i<4;i++)box('plain',-.15+i*.1,1.75,-R*.55+.03,.05,.42,.008,i%2?new THREE.Color(.42,.36,.3):new THREE.Color(.92,.9,.86));}
 for(let i=0;i<2;i++){const a=-PI/2+(i?.9:-.9);box('hide',Math.cos(a)*R*.72,.04,Math.sin(a)*R*.72,.55,.32,.38,new THREE.Color(.78,.62,.42),-a);}
 /* the door: a hide flap in the gap, hung from the cover */
 const zd=rAt(.7)-.06;svLeaf(0,.03,zd,0,.8,1.3,{mk:'hide',col:hide,t:.03,name:'the tipi door'});door(0,0,zd,0,.8,1.3);
 cyTarget(.4,.04,-R*.3,'tipi floor');}
/* the winter base: a ring of dry stone 0.6 m high round the cover's foot, banked with earth outside, its gap at the door */
function cyRingBase(R){svNoWalk(()=>{sector('stone',0,0,R-.02,R+.38,PI/2+.3,PI/2-.3+TAU,0,.6,P('stone'),28);
 sector('render',0,0,R+.38,R+.9,PI/2+.34,PI/2-.34+TAU,0,.3,P('mudD'),28);});}
const CY_HERD_TAGS=(type,role,job)=>({types:[type],wealth:'poor',style:'sunrise',role,job});
for(const sz of ['s','m','l']){const T=CY_TIPI[sz];
 defBuilding({key:'cy_tipi_'+sz,seed:9801+'sml'.indexOf(sz),name:'Herder tipi ('+({s:'small',m:'family',l:'large'})[sz]+')',cls:'building',kind:'tent',frag:'kits/coyote',
  tags:CY_HERD_TAGS('dwelling-single',sz==='s'?'sleep':'family'),w:2*T.R+2.0,d:2*T.R+2.0,h:T.H+.2,budget:40000,cut:true,
  note:'the herders\' tipi (the owner, 2026-11-16: a new tipi model): poles, a hide cover painted with the band\'s colour, its Hum name as a contour line and the runner bird; the role (family, sleep, chief, council, shrine), the tribe and the season (v 1: winter, on its stone base) are placement options',
  build(o){o=o||{};cyTipi(T.R,T.H,{role:o.role||(sz==='s'?'sleep':'family'),tribe:o.tribe,v:o.v});}});}
defBuilding({key:'cy_winter_base',name:'Winter tipi base (stone ring)',seed:9804,cls:'building',kind:'tent-base',frag:'kits/coyote',
 tags:CY_HERD_TAGS('dwelling-single','family'),w:7.8,d:7.8,h:1.0,budget:10000,front:{x:0,z:3.6,yaw:0},
 note:'the stone ring a family tipi stands on in the winter camp, left standing when the band moves up the stair in spring',
 build(o){cyRingBase(3.0);box('floor',0,0,0,3.9,.04,3.9,P('floor'));cyHearth(0,0,{r:.36});}});
defBuilding({key:'cy_ostrich_pen',name:'Ostrich pen (high brush walls)',seed:9805,cls:'building',kind:'pen',frag:'kits/coyote',
 tags:CY_HERD_TAGS('farm','pen','herding'),w:16,d:12,h:2.6,budget:40000,front:{x:0,z:6,yaw:0},
 note:'the riding and feather birds\' pen: walls of brush packed between stakes, too high for a bird to clear, a gate of poles, a shade, a trough, nest scrapes with eggs (the birds themselves wait for kits/fauna)',
 build(o){const x0=-7.6,x1=7.6,z0=-5.6,z1=5.6,hh=2.3;
  const run=(ax,az,bx,bz,gap)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/.5);for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
    if(gap&&Math.abs(x)<1.0&&Math.abs(z-z1)<.1)continue;pole('wood',[x,0,z],[x+rr(-.08,.08),hh+rr(-.15,.2),z+rr(-.08,.08)],.04,P('wood'),4);}
   const yaw=Math.atan2(az-bz,bx-ax);
   const seg=(s0,s1)=>W(ax+(bx-ax)*(s0+s1)/2,0,az+(bz-az)*(s0+s1)/2,yaw,()=>box('reed',0,0,0,L*(s1-s0),hh-.2,.3,new THREE.Color(.52,.42,.28)));
   if(gap){const sg=(L/2-1.0)/L;seg(0,sg);seg(1-sg,1);}else seg(0,1);};
  run(x0,z1,x1,z1,true);run(x1,z1,x1,z0);run(x1,z0,x0,z0);run(x0,z0,x0,z1);
  for(let i=0;i<4;i++)pole('timber',[-1.0,.4+i*.5,z1+.1],[1.0,.4+i*.5,z1+.1],.035,P('timber'),5);
  cyShade(x0+.6,z0+.6,x0+5.6,z0+4.2,2.4);
  box('stone',4.2,0,-4.4,2.6,.4,.6,P('stone'));box('water',4.2,.36,-4.4,2.4,.02,.45,new THREE.Color(.3,.36,.38));
  for(const p of [[2.5,1.5],[-2.6,2.4],[4.6,2.2]]){cyl('gravel',p[0],0,p[1],.75,.03,P('gravel'),12);for(let e=0;e<3;e++)sph('bone',p[0]+rr(-.2,.2),.08,p[1]+rr(-.2,.2),.08,new THREE.Color(.96,.93,.84),1.25,8);}
  door(0,0,z1,0,2.0,2.0);}});
defBuilding({key:'cy_feather_rack',name:'Feather rack (plumes drying)',seed:9806,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_HERD_TAGS('industry','works','trading'),w:5,d:2.4,h:2.4,budget:15000,front:{x:0,z:1.2,yaw:0},
 note:'the feather workers\' rack: plucked ostrich plumes, white and black, hung by their quills to dry and sorted by length; a bench and baskets (the plume texture is owed: card.feather.ostrich)',
 build(o){for(const x of [-2.2,2.2])cyPost(x,0,2.2,.05);for(const y of [1.3,1.8,2.15])pole('timber',[-2.3,y,0],[2.3,y,0],.03,P('timber'),5);
  for(let r=0;r<3;r++)for(let i=0;i<12;i++){const x=-2.0+i*.36+(r%2)*.12,y=[1.3,1.8,2.15][r],white=(i+r)%3!==0,c=white?new THREE.Color(.95,.93,.88):new THREE.Color(.12,.11,.1);
   WX(x,y,0,0,rr(-.1,.1),rr(-.15,.15),()=>{box('plain',0,-.36,0,.12,.36,.012,c);box('plain',0,-.6,.01,.16,.18,.012,c);});}
  box('wood',0,0,.9,2.2,.45,.4,P('wood'));for(let i=0;i<2;i++)cyBasket(-1.6+i*3.2,.9,{});}});
defBuilding({key:'cy_saddle_rack',name:'Saddle rack (ostrich saddles and pack frames)',seed:9807,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_HERD_TAGS('industry','works','tanning'),w:5,d:2.6,h:1.8,budget:15000,front:{x:0,z:1.3,yaw:0},
 note:'the saddler\'s rack: the ostrich riding saddles (a padded hide seat with a high cantle, set forward over the wings) and the pack frames, on a pole rack under a hide awning',
 build(o){for(const x of [-2.2,2.2])for(const z of [-.5,.5])cyPost(x,z,1.1,.04);for(const z of [-.5,.5])pole('timber',[-2.3,1.0,z],[2.3,1.0,z],.04,P('timber'),5);
  for(let i=0;i<3;i++){const x=-1.4+i*1.4;W(x,1.04,0,0,()=>{box('hide',0,0,0,.55,.14,.8,P('hide'));box('hide',0,.12,-.32,.5,.32,.08,P('hide'),0,-.25);box('plain',0,.14,.05,.46,.04,.5,new THREE.Color(.82,.6,.16));
   for(const s of [-1,1])box('hide',s*.3,-.35,.05,.04,.7,.08,P('hide'));});}
  for(let i=0;i<2;i++)W(-1.0+i*2.0,0,-1.0,0,()=>{for(const s of [-1,1])pole('wood',[s*.3,0,0],[0,1.2,0],.03,P('wood'),5);pole('wood',[-.35,.5,0],[.35,.5,0],.025,P('wood'),5);});}});
defBuilding({key:'cy_egg_cache',name:'Ostrich egg cache (buried, marked)',seed:9808,cls:'building',kind:'store',frag:'kits/coyote',
 tags:CY_HERD_TAGS('industry','store','herding'),w:2.6,d:2.6,h:1.6,budget:8000,front:{x:0,z:1.3,yaw:0},
 note:'a cache of ostrich eggs (food and water flasks) buried in sand under a stone ring, a slab lid half off, a cairn with a painted egg on it to find it again',
 build(o){sector('stone',0,0,.7,1.0,0,TAU,0,.3,P('stone'),16);cyl('gravel',0,0,0,.72,.22,P('gravel'),14);
  for(let i=0;i<5;i++)sph('bone',rr(-.35,.35),.2,rr(-.35,.35),.09,new THREE.Color(.96,.93,.84),1.25,8);
  box('slab',.35,.3,0,.9,.08,.8,P('stone'),.3);for(let i=0;i<4;i++)box('stone',-.9,i*.22,-.9,.42-i*.06,.22,.4-i*.06,P('stone'),i*.7);
  sph('bone',-.9,.98,-.9,.1,new THREE.Color(.96,.93,.84),1.25,8);cyBird(-.9,.98,-.79,.12,P('red'));}});
/* ---------------------------------------------------------------- the camp (core/camp: KCAMP.census, KCAMP.pitch) */
/* the program: the chief's large tipi, the council's, the shrine, five family tipis and a large one for two households, two
   sleeping tipis for the young riders, the feather and saddle racks; the ostrich pen, the goat fold and the egg cache downwind.
   A program key is the def's key with the role after '@' (cy_tipi_l@chief); the camp row's kind() reads it */
const CY_CAMP_PROGRAM=v=>KCAMP.coyoteProgram(v);
function cyCampDims(k,v){const D=DEFS[String(k).split('@')[0]];return D?{w:D.w,d:D.d,h:D.h}:null;}
function cyCamp(id,v){const P0=CY_CAMP_PROGRAM(v),ground={ok:()=>true};
 const camp=KCAMP.pitch({id,world:11,culture:'coyote-herder',program:P0,site:{x:0,z:0},dims:cyCampDims,ground,way:[0,1],formation:'horseshoe'});
 camp.census=KCAMP.census({id,world:11,culture:'coyote-herder',program:P0});camp.check=KCAMP.check(camp,ground);return camp;}
const CY_CAMPS={summer:cyCamp('sunrise-summer',0),winter:cyCamp('sunrise-winter',1)};
function cyCampBox(camp){let x=0,z=0;for(const r of camp.records)for(const q of KCAMP.box(r))x=Math.max(x,Math.abs(q[0])),z=Math.max(z,Math.abs(q[1]));return {w:2*x+4,d:2*z+4};}
for(const id of ['summer','winter']){const camp=CY_CAMPS[id],B=cyCampBox(camp);
 defBuilding({key:'cy_camp_'+id,seed:9811+(id==='summer'?0:1),name:'Herders camp ('+id+', KCAMP horseshoe)',cls:'building',kind:'camp',frag:'kits/coyote',
  tags:{types:['dwelling-multi'],wealth:'poor',style:'sunrise',role:'camp'},w:+B.w.toFixed(1),d:+B.d.toFixed(1),h:9,budget:1500000,
  front:{x:+camp.gate.x.toFixed(2),z:+camp.gate.z.toFixed(2),yaw:0},
  note:'a Sunrise band (Tong-Hau) of about fifty, pitched by core/camp on the coyote-herder row: the chief\'s tipi opposite the way in, the council and the shrine by it, the families round, the racks by the way in, the ostrich pen, the fold and the egg cache downwind'+(id==='winter'?'; the winter camp: the tipis on their stone bases':''),
  build(o){camp.records.forEach(r=>{const q=String(r.key).split('@'),role=q[1]||null;
    place(q[0],r.x,r.z,r.ry,{v:r.v|0,role:role||undefined,tribe:'sunrise',name:r.id});});
   cyHearth(camp.hearth.x,camp.hearth.z,{r:.6});
   if(CURREC){CURREC.camp={id:camp.id,formation:camp.formation,records:camp.records.length,short:camp.short.slice(),check:camp.check,
     pop:camp.census.pop,households:camp.census.households.length,staffed:camp.census.people.filter(p=>p.work).length,error:camp.census.error||null};
    const ch=camp.records.find(r=>/@chief/.test(r.key)),fm=camp.records.find(r=>r.key==='cy_tipi_m');
    if(ch)cyTarget(ch.x,.04,ch.z,'the chief\'s tipi');if(fm)cyTarget(fm.x,.04,fm.z,'a family tipi');}}});}
