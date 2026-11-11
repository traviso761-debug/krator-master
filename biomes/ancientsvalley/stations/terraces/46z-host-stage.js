// ================================================================= HOST — stage (the Ancient's Valley, the Terraces: the Soleri farm belt)
// [web] The station's say about its ground (STAGE), read by the shared fragments as station 0's is (47 the land, 70 the buildings' tiers, 71 the
// creepers, 88 the forest, 89 the air, 99 the views and checks). PLAN.md section 12, 2b.
// WHERE: px 455,899 on 5.1 (region/site.py 'terraces'): 330 m, 1.53 atm, Cfa, +23 degC, 1,694 mm, on the south face of the ridge north of city1;
// the page falls about 180 m from its north edge to its south, the shelf and the drowned inlet below it, city1 and the Overlook's ridge 16-18 km
// due south. The terraces band (300-600 m): PLAN.md section 3's farmland.
// THE PAGE (x east, z south, y up from the model's height at the pixel; R 2,800 m):
//   THE HUB         a civic hub town on the flattest ground south-west of the middle: the hall, the market, the ring road
//   THE AQUEDUCT    a contour line 320 m upslope of the hub, three arches a module, the pump house and the water tower beside it
//   THE CLUSTERS    honeycombs of growing pods, rows of vault houses, growing stacks on the steeper ground, a road to each
//   THE LINES       two pylon lines down the slope, the trunk road to the shelf
//   THE FIELDS      parcels along the contour round the buildings: crops and orchards gone to thicket (87t), terraced into the slope
//   BELOW           the city's skyline on the shelf and the floor toward the lake (70t: the far city)
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {mix,smooth}=BIO.fn;
const AVQ=new URLSearchParams(location.search),AVQ_ON=k=>AVQ.get(k)!=='0';
window.NWLOW_LOOK={backlit:true,culm:true,fung:true,lobes:true};
const STAGE=(function(){const RG=AV_REGION,BASE=RG.site.base,LAKE_Y=RG.lake.y,R=2800,SEED=KRAND.hash(1110,455,899),M=AV.model(RG.grid);
 const modelY=(x,z)=>M.at(x,z)-BASE;
 const rawGround=AV.farmLand({model:M,base:BASE,lakeY:LAKE_Y,seed:SEED});
 const cities=RG.cities.map(c=>({n:c.n,x:c.x,z:c.z,h:c.h,theme:c.theme})),basins=RG.basins.map(b=>({n:b.n,x:b.x,z:b.z,r:b.r,kind:b.kind}));
 const F=AV.fields({ground:rawGround,base:BASE,lakeY:LAKE_Y,cities,basins,scars:[],seed:SEED,R});
 /* THE PLAN (41d, AV.farm): the farm families' footprints from the metropolis kit's records (46f), the aqueduct's joint, the crops the fields grew
    (kits/crops: AV.farmCrops, what the south-west lowlands' zones grow rain-fed, with a card) */
 const extent=fam=>{const R0=MP.FAMILY[fam],fp=R0.footprint;return fp.r!=null&&fam!=='aqueduct'?[fp.r,fp.r]:[fp.w/2,fp.d/2];};
 /* only the crops whose card the crops kit's pack holds (the measure melon's card.crop.melon is in the library, not in the pack: drawn, it was a
    solid quad; KNOWN_ISSUES.md) */
 const CROPLIST=AV.farmCrops(typeof CROPS!=='undefined'?CROPS:null).filter(c=>!(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)||!!KMAT.packed('crops',c.fam));
 const PLAN=AV.farm({R,seed:SEED+5,ground:rawGround,lakeY:LAKE_Y,extent,joint:MP.aqueductJoin,crops:CROPLIST,hubNear:[0,500]});
 PLAN.pitch=200;   /* 99's kerb check reads a lattice's pitch; the farm has none (AV.farm sets theta, the contour's direction) */
 const PADS=PLAN.pads,_q=[];
 /* the ground: the raw land, the fields terraced into the slope (2.5 m risers along the contour, fading out at each field's hedge), every
    building's plinth eased in over 14 m (an aqueduct module's over 20 m: a bed under its arches) */
 const ST=2.5,terraced=h=>{const k=Math.floor(h/ST),f=h/ST-k;return(k+smooth(.78,1,f))*ST;};
 function relief(x,z){let h=rawGround(x,z);const fk=PLAN.fieldK(x,z);if(fk>0)h=mix(h,terraced(h),.85*fk);
  _q.length=0;PADS.query(x,z,0,_q);for(let i=0;i<_q.length;i++){const T=_q[i],e=T.family==='aqueduct'?20:T.ease,d=AV.farmBoxD(T,x,z);if(d<e)h=mix(T.y,h,smooth(0,e,d));}return h;}
 const ground=relief,yOf=ground;
 /* the masks: a road's carriageway, a plinth, a field (how deep inside it), the hub's paved ground */
 const roadK=(x,z)=>{const d=PLAN.roadD(x,z);return smooth(1.2,-.8,d);};
 const built=(x,z)=>{_q.length=0;PADS.query(x,z,0,_q);let k=0;for(let i=0;i<_q.length;i++)k=Math.max(k,smooth(4,-6,AV.farmBoxD(_q[i],x,z)));return k;};
 const hubK=(x,z)=>smooth(PLAN.hub.ring+20,PLAN.hub.ring-10,Math.hypot(x-PLAN.hub.x,z-PLAN.hub.z));
 const street=(x,z)=>roadK(x,z);
 /* the wild wood: everywhere the farm is not (the hedges, the copses, the parcels the wood took back, the ridge above), thin in the fields (an oak
    in a hedge's gap), none on a road, a plinth or the hub's paving */
 const forest=(x,z)=>{const y=yOf(x,z);if(y<LAKE_Y+.6)return 0;const fk=PLAN.fieldK(x,z);return clamp((1-.88*fk)*(1-.9*roadK(x,z))*(1-built(x,z))*(1-.85*hubK(x,z))*(.4+.4*F.wild(x,z)),0,1);};
 /* the far city below (70t): the towers' heights by the model's band, read where it stands */
 return{key:'terraces',name:'The Ancient\'s Valley: the Terraces',title:'Krator biome — the Ancient\'s Valley: the Terraces',
  hint:'The Soleri farm belt on the terraces north of city1 (330 m, 1.53 atm, Cfa): growing pods, vault houses and stacks round a hub town, an aqueduct on arches, pylon lines, the fields and orchards gone to thicket; the city below toward the lake. Fly (W A S D, Q E, Shift), F to walk.',
  R,px:[RG.site.px,RG.site.py],base:BASE,lakeY:LAKE_Y,air:{pressure:RG.site.atm,humidity:.74},
  /* the terraces' air (core/atmos's smog additions, as station 0's but thinner: PLAN.md section 3, the mist's density a field of F.density, thin
     on the terraces): a broken sky, the city's haze pooled below, the far towers readable through it */
  clouds:{cover:.58,cumulus:1.15,cirrus:.35,bank:.55,height:1200,scale:1700,drift:.018,dark:.5,tint:[.42,.36,.33],turbulence:.45,turbKind:'violent',glow:.3,glowColour:[1,.55,.2]},
  cloudMood:{period:360,glowColour:[1,.55,.2]},airLook:{turbidity:2.4,dust:[.56,.48,.50]},fogDensity:.00013,
  /* the mist pooled over the shelf and the inlet below (full under the lake's level + 150 m, page y -163, gone 140 m higher, so it laps the
     page's south edge and lies over the city); no band of cloud (station 0's sits at the towers' height, here it would lie on the fields) */
  smog:{colour:[.40,.35,.38],mix:.7,mist:{density:.0007,above:150,depth:140,noise:.85,day:1,field:true},band:{density:0,y:[0,1],cover:0,noise:0}},seed:SEED,model:M,region:RG,
  ground,rawGround,modelY,F,plan:PLAN,pads:PADS,engines:[],craters:[],debris:[],scorch:(x,z)=>0,viaduct:{pts:[],deckY:()=>0,d:()=>1e9},relief,railD:()=>1e9,
  near:{x:PLAN.hub.x,z:PLAN.hub.z,r:300,keys:[]},street,streetK:street,streetD:PLAN.roadD,avenueLines:()=>[],lattice:{c:1,s:0,pitch:200,AW:14,SW:6},built,forest,scars:[],cities,basins,crops:CROPLIST,
  water:{level:LAKE_Y,shallow:0x4f7a74,deep:0x1a3440,name:'The valley lake (17.4 m: brackish, the drowned city under it)'},
  floorLabel:(x,z,y)=>{if(roadK(x,z)>.5)return 'a farm road';if(built(x,z)>.5)return 'a plinth';const f=PLAN.fieldAt(x,z);if(f)return(f.orchard?'an orchard':'a field')+' gone to thicket ('+f.crop+')';if(hubK(x,z)>.5)return 'the hub town\'s paving';return 'the terraces: the wild wood';},
  /* what the kits read: Cfa and 1,694 mm, moist; the rainforest zone where the wood is, a drier scrub in the fields and on the ridge */
  fields:{wet:(x,z)=>clamp(.84-.08*smooth(60,200,yOf(x,z))+.08*F.wild(x,z)-.1*F.foul(x,z)-.2*PLAN.fieldK(x,z),0,.96),tropic:(x,z)=>.88,dry:(x,z)=>clamp(.12+.3*F.foul(x,z)+.2*PLAN.fieldK(x,z),0,1),
   flow:(x,z)=>0,upland:(x,z)=>clamp((yOf(x,z)-LAKE_Y)/600,0,1),salt:(x,z)=>0},
  zone:(x,z)=>{const f=forest(x,z);return{sw:f,nw:f*.45,city:0};},
  swAllow:null,swKeep:['gum'],nwAllow:['kauri','towerash','skybamboo','treefern','ginkgo','glowwillow','meranti','mistpalm','pandan','paperbark'],swQ:.9,nwQ:.7,   /* the wood covers most of this page (the Overlook's is half paved): at 1.6 and 1.1 the trees were 13.9 M and the floor 10.6 M against 8 M, the palm fronds 313k against the 250k cap (2026-11-10, the first GPU run) */
  // the ground's layers (the valley's pack, as station 0's): a pave, b asphalt, c rubble, d glass; e rainfloor, f oak litter, g mud
  layers:['ground.pave','ground.asphalt','ground.rubble','ground.glass','ground.rainfloor','ground.oaklitter','ground.mud'],
  weights:(x,z)=>{const b=built(x,z),rd=roadK(x,z),hk=hubK(x,z),fk=PLAN.fieldK(x,z),fo=forest(x,z);
   const pave=clamp(Math.max(b,.8*hk*smooth(.35,.6,KRAND.fbm(x*.01,z*.01,0,2,SEED+8))),0,1)*(1-rd);
   const rub=clamp(.5*smooth(.15,.5,rd)*(1-smooth(.6,.9,rd))+.35*hk*smooth(.45,.7,KRAND.fbm(x*.02,z*.02,0,2,SEED+9)),0,1)*(1-b);
   const tilled=clamp(fk*(1-b)*(1-rd),0,1);
   return[pave,rd,rub,0,clamp(fo*(1-pave)*(1-tilled)*.8,0,1),clamp((.35+.5*tilled)*(1-pave)*(1-rd),0,1),clamp(.25*tilled*smooth(.4,.7,KRAND.fbm(x*.004,z*.004,0,2,SEED+11)),0,1)];},
  /* the paint is the canopy and the fields seen from afar: the wood's dark green, the thicket's yellower green in its rows, the roads' grey */
  paint:(x,z)=>{const fk=PLAN.fieldK(x,z),fo=forest(x,z),rd=roadK(x,z),b=built(x,z),hk=hubK(x,z),t=F.taint(x,z);let c=[.30,.33,.22];
   c=c.map((v,i)=>mix(v,[.15,.24,.12][i],.8*fo));c=c.map((v,i)=>mix(v,[.34,.38,.20][i],.75*fk));c=c.map((v,i)=>mix(v,[.38,.37,.34][i],Math.max(b,.6*hk)));
   c=c.map((v,i)=>mix(v,[.22,.22,.21][i],.8*rd));c=c.map((v,i)=>mix(v,[.20,.24,.26][i],.25*fo*F.wild(x,z)*t));return c;},
  views:()=>{const Y=(x,z)=>Math.max(ground(x,z),LAKE_Y),V=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const H=PLAN.hub,T=PLAN.towers,fam=f=>T.filter(t=>t.family===f),A=PLAN.aqueduct.modules;
   /* a spot to stand near (x, z): off every plinth by `clear`, off the roads, outside the trees (none within 8 m), the nearest such */
   const TR=KSPACE.create({cell:120});if(typeof REG!=='undefined')REG.forEach(rc=>{if(rc.kind==='tree')TR.insert(rc,rc.x,rc.z,Math.max(rc.r==null?4:rc.r,4));});const tq=[],pq=[];
   const spot=(x,z,clear)=>{for(let r=0;r<=240;r+=12)for(let k=0;k<(r?12:1);k++){const a=k/12*TAU,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(Math.hypot(px,pz)>R-80||ground(px,pz)<LAKE_Y+3)continue;
     pq.length=0;PADS.query(px,pz,clear+80,pq);if(pq.some(P=>AV.farmBoxD(P,px,pz)<clear))continue;if(PLAN.roadD(px,pz)<2)continue;if(PLAN.fieldAt(px,pz))continue;   /* not in a field: an orchard's crowns (records of the field, not trees) hid the pods from the first eye */tq.length=0;TR.query(px,pz,2,tq);if(tq.some(t=>Math.hypot(t.x-px,t.z-pz)<8))continue;return[px,pz];}return[x,z];};
   const pods=fam('pod'),stacks=fam('stack'),mid=A[Math.floor(A.length/2)]||A[0],cl=PLAN.clusters.filter(c=>c.kind==='pods'&&c.members.length>=4).sort((a,b)=>Math.hypot(a.x-H.x,a.z-H.z)-Math.hypot(b.x-H.x,b.z-H.z))[0]||PLAN.clusters[0];
   const st=stacks[0]||pods[0],dn=[-H.up[0],-H.up[1]],orch=PLAN.fields.filter(f=>f.orchard).sort((a,b)=>Math.hypot(a.x-H.x,a.z-H.z)-Math.hypot(b.x-H.x,b.z-H.z))[3]||PLAN.fields[0];
   const py=(PLAN.pylons[0]||{list:[]}).list,p0=py[Math.floor(py.length*.45)]||{x:0,z:0},p1=py[Math.floor(py.length*.45)+2]||{x:0,z:600};
   const eHub=spot(H.x+H.up[0]*240,H.z+H.up[1]*240,20);
   return{
    'The Terraces: the hub and the city below':V(eHub,26,[H.x+dn[0]*6000,H.z+dn[1]*6000],-150),
    /* from the turning place at the end of the cluster's own road (100 m out, clear of trees and fields by the plan): from the fields round it the
       orchards hid the pods (the GPU runs of 2026-11-10) */
    'A honeycomb of growing pods':(()=>{const C=PLAN.clusters.filter(c=>c.kind==='pods'&&c.members.length>=4&&PLAN.roads.some(r=>r.id==='av.f.r.c'+c.id.split('.c')[1])).sort((a,b)=>Math.hypot(a.x-H.x,a.z-H.z)-Math.hypot(b.x-H.x,b.z-H.z))[0];
     if(!C)return V(spot(cl.x+dn[0]*150,cl.z+dn[1]*150,12),18,[cl.x,cl.z],8);   /* no pods' cluster keeps a road: from 18 m, over the orchards */const r=PLAN.roads.find(q=>q.id==='av.f.r.c'+C.id.split('.c')[1]),e=r.pts[r.pts.length-1];return V(e,18,[C.x,C.z],8);})(),   /* 18 m up: over the orchards' crowns (to 14 m) that close round the road's end */
    'The aqueduct on its arches':V(spot(mid.x-mid.dir[1]*70+mid.dir[0]*90,mid.z+mid.dir[0]*70+mid.dir[1]*90,14),3,[mid.x-mid.dir[0]*200,mid.z-mid.dir[1]*200],14),
    'The growing stacks':V(spot(st.x+Math.sin(st.yaw3)*170,st.z+Math.cos(st.yaw3)*170,14),3,[st.x,st.z],14),
    'The hub town':V(spot(H.x+H.along[0]*230+dn[0]*60,H.z+H.along[1]*230+dn[1]*60,10),1.8,[H.x,H.z],10),
    'An orchard gone to thicket':V(spot(orch.x,orch.z,8),1.8,[orch.x+Math.cos(orch.yaw)*80,orch.z+Math.sin(orch.yaw)*80],3),
    'A pylon line down the slope':V(spot(p0.x+30,p0.z,10),2,[p1.x,p1.z],20),
    'The pump house and the water tower':(()=>{const P=fam('pumphouse')[0],W=fam('watertower')[0],c=[(P.x+W.x)/2,(P.z+W.z)/2];return V(spot(c[0]+dn[0]*130,c[1]+dn[1]*130,12),2,c,16);})(),
    'From the air':V([H.x+H.up[0]*1400,H.z+H.up[1]*1400],520,[H.x+dn[0]*600,H.z+dn[1]*600],0)};},
  start:'The Terraces: the hub and the city below',
  spine:(function(){const S=[[PLAN.hub.x,PLAN.hub.z]];for(let x=-2400;x<=2400;x+=800)for(let z=-2400;z<=2400;z+=800)S.push([x,z]);return S;})(),
  /* the shared checks this station runs (99: STAGE.shared), and its own (70t: STAGE.checks, STAGE.negatives) */
  shared:['handOfMan','standing','impHidden','feral','clear','cardsCut','cardsUp','floraHeld'],
  budgetTris:20000000,budgetCalls:1200};})();
