// ================================================================= HOST — stage (the Ancient's Valley, station 0: THE OVERLOOK)
// [web] Each station's say about its ground (STAGE); 47-host-land.js draws it, the same for every station. It sorts after the metropolis kit's records (40-46d), whose footprints size the plinths.
// WHERE (PLAN.md section 12): the ridge east of city1 (px 457,907 on 5.1: 84 m, 1.58 atm, Af, +24 degC, ~2,980 mm), the shelf's edge
// over a drowned inlet, looking south-west across city1's floor to the lake. No anomaly: the city on a normal day.
// THE PAGE (x east, z south, y up from the model's height at the pixel; R 2,800 m):
//   THE RIDGE         the eye's ground (y 0..50): residential under B, midrises on a lattice, the parks gone feral
//   THE FLOOR         south-west, down to y ~ -30 toward city1 (its centre at the page's south-west corner): the core's towers
//   THE INLETS        north and south of the ridge: the lake's drowned river trenches (y -66 and under), the lake beyond to the south
//   THE VIADUCT       a transit line along the ridge's north flank and out over the inlet on tall piers
//   THE DEAD LOBE     a scar on the ridge's east end: glass and bare ground, nothing grows
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {mix,smooth}=BIO.fn;   /* TAU, clamp and lerp are the Ancients kit's (10-core.js, read in place for the engines; the same definitions) */
const AVQ=new URLSearchParams(location.search),AVQ_ON=k=>AVQ.get(k)!=='0';
/* the north-west kit's new look (its 45-host-stage.js sets these on its own page; a reader sets none and gets the old look): the backlit
   leaves, the culms' texture, the fungoid caps, the lobes' material; not the season (BIO.bindSeason) nor the root colour (BIO.setGround) */
window.NWLOW_LOOK={backlit:true,culm:true,fung:true,lobes:true};
const STAGE=(function(){const RG=AV_REGION,BASE=RG.site.base,LAKE_Y=RG.lake.y,R=2800,SEED=KRAND.hash(1104,457,907),M=AV.model(RG.grid);
 // the model's ground in page metres (y from BASE), and the page's own relief on it: ridged noise scaled by the model's slope (a steep
 // flank gets crags, the floor stays level), finer where the city stands (built ground), none under the lake's level
 const modelY=(x,z)=>M.at(x,z)-BASE;
 const slopeK=(x,z)=>{const s=(M.at(x+600,z)-M.at(x-600,z))/1200,t=(M.at(x,z+600)-M.at(x,z-600))/1200;return Math.hypot(s,t);};
 function landGround(x,z){const m=modelY(x,z),st=slopeK(x,z),r=1-Math.abs(2*KRAND.fbm(x*.0013+3.7,z*.0013-9.1,0,4,SEED+1)-1),f=KRAND.fbm(x*.011+1.3,z*.011+2.2,0,3,SEED+2);
  return m+(14+260*Math.min(.5,st))*(r-.45)*smooth(LAKE_Y-30,LAKE_Y+6,m)+2.2*(f-.5);}
 // THE CRATERS (the owner, 2026-11-04: war damage): fourteen strikes on the dry land, bowls with raised rims, each a scar of melt glass
 const CRATERS=AV.craters({R:R+200,n:14,seed:SEED+13,rMin:35,rMax:120,ok:(x,z,r)=>landGround(x,z)>LAKE_Y+r*.2+4&&Math.hypot(x-300,z+150)>r+260});
 function rawGround(x,z){return landGround(x,z)+AV.craterH(CRATERS,x,z);}
 // the fields (41-av-field.js) on the raw ground: the cities and basins from the record, one dead lobe on the ridge's east end, the craters
 const cities=RG.cities.map(c=>({n:c.n,x:c.x,z:c.z,h:c.h,theme:c.theme})),basins=RG.basins.map(b=>({n:b.n,x:b.x,z:b.z,r:b.r,kind:b.kind}));
 const scars=[{x:1500,z:-200,rx:520,rz:330,yaw:.5}].concat(CRATERS.map(c=>({x:c.x,z:c.z,rx:c.r*1.25,rz:c.r*1.25,yaw:0,k:.85})));
 const F=AV.fields({ground:rawGround,base:BASE,lakeY:LAKE_Y,cities,basins,scars,seed:SEED});
 // THE VIADUCT: along the ridge's north flank from the east edge, west and out over the north inlet; its deck 16 m over the ridge, level over the water
 const VIA=[[2900,-520],[1400,-560],[300,-700],[-900,-1300],[-2900,-2300]];
 const viaDeckY=(x,z,s)=>Math.max(rawGround(x,z)+16,LAKE_Y+38,-2);
 const viaD=(x,z)=>{let d=1e9;for(let k=0;k+1<VIA.length;k++){const a=VIA[k],b=VIA[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),px=a[0]+dx*t,pz=a[1]+dz*t;d=Math.min(d,Math.hypot(x-px,z-pz));}return d;};
 // THE PLAN: the towers on a lattice turned 17 degrees, the skyscrapers on the floor (the Spindle three in ten, the Ledger, and the designs: the
 // Wedge, the Reed, the Telescope, the Stalk, the Swell, the Organ, the Yoke), the midrises on the shelf (the Ledger three in ten, the Terrace,
 // the Long Curve, the Cupola, the Arcades, the Pods, the Spiral, the Terrarium); nothing in the viaduct's corridor or at the eye's start
 const NEAR={x:300,z:-150,r:420,keys:[]};
 // THE ENGINES (the owner, 2026-11-04: sparingly, for the sense of scale): the Gyre, a 430 m ring on edge, on the floor to the north-west where the
 // Overlook looks past it to city1; the Strider, a four-legged walker halted mid-stride, on the shelf to the south-east. Each on a pad of its own
 const ENGINES=[{key:'gyre',x:-1500,z:-650,yaw:.6},{key:'strider',x:1450,z:1350,yaw:-2.2}].map(e=>Object.assign({},AV.ENGINES[e.key],e,{y:rawGround(e.x,e.z)}));
 const engineD=(x,z)=>{let d=1e9;for(const E of ENGINES)d=Math.min(d,Math.hypot(x-E.x,z-E.z)-E.r);return d;};
 const PLAN=AV.plan({R:R+400,pitch:165,theta:17*Math.PI/180,seed:SEED+5,ground:rawGround,lakeY:LAKE_Y,F,
  coreKeys:['spindle','spindle','spindle','ledger','wedge','reed','telescope','stalk','swell','organ','yoke'],
  shelfKeys:['ledger','ledger','ledger','spindle','terrace','crescent','cupola','arcades','pods','spiral','terrarium'],
  skip:(x,z)=>viaD(x,z)<34||Math.hypot(x-NEAR.x,z-NEAR.z)<70||engineD(x,z)<90||CRATERS.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+30)});
 // the towers' plinths: each stands on a level pad at its own height (a disc round a round tower, a slab round a slab, turned with it), eased
 // into the ground over 14 m (core/space finds the ones in reach). padD: the distance from a pad's edge in metres (negative inside). The
 // engines take pads too, wide and eased over 60 m
 const PADS=KSPACE.create({cell:300});PLAN.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family]||{},fp=F.footprint||{};
  if(fp.r){T.rx=T.rz=fp.r+6;}else{T.rx=(fp.w||60)/2+6;T.rz=(fp.d||60)/2+6;}T.padR=Math.max(T.rx,T.rz);T.c=Math.cos(T.yaw);T.s=Math.sin(T.yaw);T.ease=14;PADS.insert(T,T.x,T.z,T.padR+16);});
 ENGINES.forEach(E=>{E.rx=E.rz=E.padR=E.r+20;E.c=1;E.s=0;E.ease=60;E.family='engine';PADS.insert(E,E.x,E.z,E.padR+64);});
 const padD=(T,x,z)=>{const dx=x-T.x,dz=z-T.z,u=dx*T.c+dz*T.s,v=-dx*T.s+dz*T.c,mn=Math.min(T.rx,T.rz);return Math.hypot(u*mn/T.rx,v*mn/T.rz)-mn;};
 const _q=[];
 function ground(x,z){let h=rawGround(x,z);_q.length=0;PADS.query(x,z,0,_q);for(let i=0;i<_q.length;i++){const T=_q[i],d=padD(T,x,z);if(d<T.ease)h=mix(T.y,h,smooth(0,T.ease,d));}return h;}
 const yOf=ground;
 // the streets: the lattice's lines (asphalt), 9 m wide, where the city is dense enough to have them
 const th=PLAN.theta,ct=Math.cos(th),snt=Math.sin(th);
 const streetD=(x,z)=>{const lx=x*ct+z*snt,lz=-x*snt+z*ct,p=PLAN.pitch,a=Math.abs(((lx+p/2)%p+p)%p-p/2),b=Math.abs(((lz+p/2)%p+p)%p-p/2);return Math.min(a,b);};
 const street=(x,z)=>smooth(7,4,streetD(x,z))*smooth(.15,.45,F.density(x,z));
 // the kits' masks (zones): the south-west lowlands' forest wherever the ground is dry land and not built or dead, thick in the parks, thin on the
 // core's cracked plazas; the north-west's trees mixed in at a third (PLAN.md section 5: a mix of the two). 0 on a street or a plinth
 const built=(x,z)=>{_q.length=0;PADS.query(x,z,0,_q);let k=0;for(let i=0;i<_q.length;i++){k=Math.max(k,smooth(10,-6,padD(_q[i],x,z)));}return k;};
 /* the overgrowth is the rule, not the exception (PLAN.md section 5: wild overgrowth wherever the ground is not scarred): the forest takes
    every lot between the towers, thinner only where the core's pavement is thickest */
 const forest=(x,z)=>{const y=yOf(x,z);if(y<LAKE_Y+.6)return 0;const zn=F.zone(x,z),pk=F.park(x,z),sc=F.scar(x,z);
  const open=zn==='floor'?.8+.2*pk:zn==='shelf'?.95+.05*pk:1;return clamp(open*(1-sc),0,1)*(1-street(x,z))*(1-built(x,z));};
 return{key:'overlook',name:'The Ancient\'s Valley: the Overlook',title:'Krator biome — the Ancient\'s Valley: the Overlook',
  hint:'The ridge east of city1 over its drowned inlet (84 m, 1.58 atm, Af): the city on a normal day, no anomaly. Fly (W A S D, Q E, Shift), F to walk.',
  R,px:[RG.site.px,RG.site.py],base:BASE,lakeY:LAKE_Y,air:{pressure:RG.site.atm,humidity:.82},seed:SEED,model:M,region:RG,
  ground,rawGround,modelY,F,plan:PLAN,pads:PADS,engines:ENGINES,craters:CRATERS,viaduct:{pts:VIA,deckY:viaDeckY,d:viaD},near:NEAR,street,streetD,built,forest,scars,cities,basins,
  water:{level:LAKE_Y,shallow:0x4f7a74,deep:0x1a3440,name:'The valley lake (17.4 m: brackish, the drowned city under it)'},
  floorLabel:(x,z,y)=>{if(F.scar(x,z)>.5)return 'dead ground: melt glass (the scar)';if(street(x,z)>.5)return 'a street';if(built(x,z)>.5)return 'a tower\'s plinth';const zn=F.zone(x,z);return zn==='floor'?'the floor: the core\'s plazas':zn==='shelf'?(F.park(x,z)>.5?'a park gone feral':'the shelf: the residential rings'):'the terraces';},
  // what the kits read: the lowlands' fields. Af and 2,980 mm: tropic everywhere, wet at the water and in the hollows, dry on the pavement
  // and the ridge's crest, brackish salt at the shore, upland by the height over the lake; no river on this page
  /* wet high everywhere: the kits' rainforest zone (swlowlands' `rain` needs wet over .86 and tropic over .86) is the valley's overgrowth; drier only on the pavement's edge */
  fields:{wet:(x,z)=>clamp(.8+.12*smooth(12,2,yOf(x,z)-LAKE_Y)+.1*F.park(x,z)-.12*F.density(x,z)*(1-F.park(x,z)),0,.98),tropic:(x,z)=>.92,dry:(x,z)=>clamp(.1*F.density(x,z)+.5*F.scar(x,z)+.1*smooth(25,50,yOf(x,z)),0,1),
   flow:(x,z)=>0,upland:(x,z)=>clamp((yOf(x,z)-LAKE_Y)/300,0,1),salt:(x,z)=>.35*smooth(6,1,yOf(x,z)-LAKE_Y)},
  zone:(x,z)=>{const f=forest(x,z);return{sw:f,nw:f*.33,city:F.density(x,z)};},
  /* the north-west's species kept: the wet country's tall trees and the bamboo; not the grass tree (its lance cards are drawn apart from its
     trunk, so a grown tree left them floating: the core attach audit) nor the dry foothills' banksia */
  swAllow:null,swKeep:['gum'],nwAllow:['kauri','towerash','skybamboo','treefern','ginkgo','glowwillow','meranti','mistpalm','pandan','paperbark'],swQ:1.5,nwQ:.9,
  // the ground's layers (materials.json; KGROUND in 47): a pave, b asphalt, c rubble, d glass; e rainfloor, f oak litter, g mud
  layers:['ground.pave','ground.asphalt','ground.rubble','ground.glass','ground.rainfloor','ground.oaklitter','ground.mud'],
  weights:(x,z)=>{const y=yOf(x,z),d=F.density(x,z),sc=F.scar(x,z),pk=F.park(x,z),st=street(x,z),b=built(x,z),wet=smooth(10,1.5,y-LAKE_Y),zn=F.zone(x,z),fo=forest(x,z);
   const pave=clamp(Math.max(b,(zn==='floor'?.3:.1)*d*(1-pk)*(1-.8*fo)*smooth(.3,.7,KRAND.fbm(x*.004+5,z*.004,0,2,SEED+8))),0,1)*(1-sc)*(1-st),rub=clamp(.45*d*(1-pk)*(1-.6*fo)*smooth(.3,.65,KRAND.fbm(x*.02,z*.02,0,2,SEED+9)),0,1)*(1-sc)*(1-b);
   const soilNW=clamp(.5*pk+.25,0,1)*(1-pave)*(1-sc),soilSW=clamp(.9-.5*pk,0,1)*(1-pave)*(1-sc);
   return[pave,st*(1-sc),rub,sc,soilNW*(1-wet),soilSW*(1-wet),wet*(1-sc)];},
  /* the paint is also the canopy seen from afar (the kits' trees stop at their LOD range): the forest's dark green where the mask is high */
  paint:(x,z)=>{const y=yOf(x,z),d=F.density(x,z),sc=F.scar(x,z),pk=F.park(x,z),wet=smooth(10,1.5,y-LAKE_Y),t=F.taint(x,z),fo=forest(x,z);let c=[.30,.33,.22];
   c=c.map((v,i)=>mix(v,[.44,.42,.38][i],.35*d*(1-pk)));c=c.map((v,i)=>mix(v,[.15,.24,.12][i],.75*fo));c=c.map((v,i)=>mix(v,[.22,.20,.16][i],wet));c=c.map((v,i)=>mix(v,[.13,.12,.14][i],sc));
   c=c.map((v,i)=>mix(v,[.30,.24,.30][i],.35*t*(1-sc)));return c;},
  views:()=>{const Y=(x,z)=>Math.max(ground(x,z),LAKE_Y),V=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const c1=cities.find(c=>c.n===1)||{x:-2000,z:2000};
   /* a spot to stand: near (cx, cz), on dry ground, no tower's plinth within `clear`, and the fewest towers filling a 70-degree cone toward
      (tx, tz) out to `ahead` metres (each weighted by its nearness and its width in the view) */
   /* a spot to stand: on the EDGE OF A PLINTH near (cx, cz) (the plaza's rim: paved, nothing grows there, the ground falls away), the pad's own
      tower behind the eye, and the fewest other towers filling a 70-degree cone toward (tx, tz) out to `ahead` metres */
   /* the trees registered so far (the views are made after the build): no eye within 12 m of one */
   const TR=KSPACE.create({cell:120});if(typeof REG!=='undefined')REG.forEach(rc=>{if(rc.kind==='tree')TR.insert(rc,rc.x,rc.z,Math.max(rc.r||4,4));});const tq=[];
   const openSpot=(cx,cz,r,clear,tx,tz,ahead)=>{let best=null,bs=1e9;const near=[];PADS.query(cx,cz,r,near);const q=[];
    for(const P of near){if(P.family==='engine')continue;for(let k=0;k<24;k++){const a=k/24*TAU,x=P.x+Math.cos(a)*(P.padR-3),z=P.z+Math.sin(a)*(P.padR-3);if(ground(x,z)<LAKE_Y+3||padD(P,x,z)>0)continue;
      tq.length=0;TR.query(x,z,2,tq);if(tq.some(t=>Math.hypot(t.x-x,t.z-z)<12))continue;
      const dx=tx-x,dz=tz-z,l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;if(((P.x-x)*fx+(P.z-z)*fz)>-P.padR*.5)continue;   /* the pad's tower behind the eye */
      q.length=0;PADS.query(x,z,ahead,q);let ok=true,score=Math.hypot(x-cx,z-cz)/r;
      for(const T of q){if(T===P)continue;const ex=T.x-x,ez=T.z-z,d=Math.hypot(ex,ez);if(padD(T,x,z)<clear){ok=false;break;}if(d>ahead)continue;const c=(ex*fx+ez*fz)/d;if(c<Math.cos(35*Math.PI/180))continue;score+=(T.padR*2/d)*(1-d/ahead)*6;}
      if(!ok)continue;if(score<bs){bs=score;best=[x,z];}}}return best||[cx,cz];};
   const o1=openSpot(140,460,400,18,c1.x*.6,c1.z*.6,420),o2=openSpot(NEAR.x-60,NEAR.z+170,300,14,NEAR.x-900,NEAR.z+620,120);
   return{
    'The Overlook: city1 and the lake':V(o1,9,[c1.x*.6,c1.z*.6],60),
    'A residential street':V(o2,1.8,[NEAR.x-900,NEAR.z+620],28),
    'Among the towers':V(openSpot(NEAR.x+40,NEAR.z-20,200,10,NEAR.x-500,NEAR.z+300,60),1.8,[NEAR.x-500,NEAR.z+300],90),
    'The viaduct over the inlet':V([-400,-900],22,[-1500,-1700],30),
    'The core from the water':V([-600,2300],6,[-1800,1500],120),
    'The dead lobe':V([900,-100],9,[1600,-250],4),
    'A crater':(function(){const c=CRATERS.slice().sort((a,b)=>b.r-a.r)[0];return V([c.x+c.r*1.9,c.z+c.r*1.4],5,[c.x,c.z],-c.depth*.5);})(),
    'The Gyre':(function(){const E=ENGINES[0];return V([E.x+E.r*1.6,E.z+E.r*1.1],6,[E.x,E.z],E.h*.35);})(),
    'The Strider':(function(){const E=ENGINES[1];return V([E.x-E.r*1.5,E.z-E.r*1.3],4,[E.x,E.z],E.h*.4);})(),
    'A park gone feral':(function(){let best=null,bw=0;for(let x=-2400;x<=2400;x+=60)for(let z=-2400;z<=2400;z+=60){const w=F.park(x,z)*(ground(x,z)>LAKE_Y+3?1:0)*(1-Math.hypot(x,z)/5000);if(w>bw){bw=w;best=[x,z];}}best=best||[0,0];return V([best[0]+120,best[1]+90],3,best,14);})(),
    'From the air':V([600,-300],520,[c1.x*.5,c1.z*.5],0)};},
  start:'The Overlook: city1 and the lake',
  /* the LOD spine: a lattice over the whole page (the kits drop a species past its mid range from the spine unless it has an impostor; the
     overgrowth is everywhere, so the spine is), plus the eye's start */
  spine:(function(){const S=[[NEAR.x,NEAR.z]];for(let x=-2400;x<=2400;x+=800)for(let z=-2400;z<=2400;z+=800)S.push([x,z]);return S;})(),
  budgetTris:9500000};})();
