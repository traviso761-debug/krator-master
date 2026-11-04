// ================================================================= HOST — stage (the Cut, station 3: THE CUT FACE, the west lip)
// [web] The same host as station 1's (src/47 and the rest) with another STAGE, and the face's own polished mesh (48z).
// WHERE (PLAN.md section 8): the west lip, px 427,302 (CUT.SITES.face), ~4,800 m, about -2 degC, ~0.9 atm. The bowl's sweep
// comes up to the lip here as one bare, mirror-smooth curved face (nothing has had time to weather it: the Wall's beds in clean
// section, rock.cut.polished), circle lichen the only growth on it; past the lip the old broken mountain the sphere did not
// take, with nhighlands' forest on it, normal (the warp is ~0 here); below, the bowl to its far walls.
// THE PAGE (x east, z south, y up from the site; R 1,800 m):
//   THE FACE        the sweep's last ~1.5 km to the lip, at 25-31 degrees, bare, polished (48z), lichen circles over it
//   THE LIP         the line where the sphere's cut meets the old ground: KRELIEF's range (core/terrain) holds the broken crest
//                   just outside it, its toe eased into the lip so the smooth sweep and the broken mountain meet without a crease
//   ABOVE           the broken mountain: nhighlands' boreal forest and krummholz (cold), a snowmelt tarn in a hollow
//   BELOW           the sweep going down to the walls: nwlowlands' lip conifers (spire cedars, needle cypress, crag pines)
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {TAU,clamp,lerp,mix,smooth,fbm}=BIO.fn;
/* exchange 5's check: rowans in the plan's ring (64-72 km from the bowl's centre), their fruit with the bowl's stuck share */
const rowanCheck=(R,W)=>{const inL=R.filter(r=>r.name==='Rowan'&&STAGE.ringKm(r.x,r.z)>=64&&STAGE.ringKm(r.x,r.z)<=72),st=(W.stuckOf||{}).rowan||0,fr=(W.fruitOf||{}).rowan||0,sh=fr?st/fr:0;
 return{ok:inL.length>0&&st>0&&sh<.4,detail:inL.length+' rowans in the ring (64-72 km); '+st+' of '+fr+' rowan berries stuck ('+(sh*100).toFixed(0)+'%, the bowl\'s share by cluster '+(CUT.STUCK*100).toFixed(0)+'%)'};};
const STAGE=(function(){const site=CUT.SITES.face,yRef=CUT.bowl.h(site.x,site.z),R=1800;
 const toBowl=(x,z)=>[x+site.x,z+site.z];
 const rOf=(x,z)=>{const b=toBowl(x,z);return Math.hypot(b[0],b[1]);},lipR=CUT.lipR(270);
 /* out: metres past the lip (negative inside the bowl) */
 const out=(x,z)=>{const b=toBowl(x,z);return Math.hypot(b[0],b[1])-CUT.lipR(CUT.bearing(b[0],b[1]));};
 const bowlY=(x,z)=>{const b=toBowl(x,z);return CUT.bowl.h(b[0],b[1])-yRef;};
 // the broken crest past the lip: a KRELIEF range along the lip's line 700 m out, serrated, its toe eased in to the lip
 const LIPX=-(lipR-Math.hypot(site.x,site.z));   /* the lip's line on the page: x ~ -500 (the bowl's centre lies to the east, the old mountain west) */
 const CREST=KRELIEF.range({a:[LIPX-700,-2600],b:[LIPX-700,2600],h:520,w:760,crest:.3,toe:.3,serr:.14,seed:CUT.SEED+21});
 const N=KRELIEF.noise(CUT.SEED+23);
 // the tarn: a hollow in the broken ground 900 m past the lip
 const TARN={x:LIPX-900,z:-420,r:46};
 function ground(x,z){const h=bowlY(x,z),o=out(x,z);if(o<=0)return h;   /* inside the lip: the sweep alone, smooth */
  const k=smooth(0,140,o);let g=h+k*(CREST(x,z)+60*(N.fbm(x*.004,z*.004,4)-.5)+12*(N.fbm(x*.03,z*.03,2)-.5));
  const td=Math.hypot(x-TARN.x,z-TARN.z);g-=9*smooth(TARN.r*1.6,TARN.r*.4,td);return g;}
 const grade=(x,z)=>{const e=3,a=ground(x+e,z)-ground(x-e,z),b=ground(x,z+e)-ground(x,z-e);return Math.hypot(a,b)/(2*e);};
 const normal=(x,z)=>{const e=1.5,a=ground(x+e,z)-ground(x-e,z),b=ground(x,z+e)-ground(x,z-e),n=[-a/(2*e),1,-b/(2*e)],l=Math.hypot(...n);return n.map(v=>v/l);};
 // the face: inside the lip where the sweep is steep (the cut's bare section); the lichen on it
 const faceK=(x,z)=>{const o=out(x,z);return smooth(0,-30,o)*smooth(.34,.44,grade(x,z));};
 const above=(x,z)=>smooth(20,160,out(x,z));
 const pc=(x,z)=>{const b=toBowl(x,z);return KRAND.fbm(b[0]*.004+3.3,b[1]*.004-6.1,0,3,CUT.SEED+31);};
 const lichenK=(x,z)=>faceK(x,z)*smooth(.38,.6,pc(x,z));
 const ringKm=(x,z)=>rOf(x,z)/1000;
 const cold=(x,z)=>clamp(.6+(ground(x,z)+yRef-4600)/2200,.45,.95);
 const tarnLevel=ground(TARN.x,TARN.z)+6.2;
 const up=[-1,0],ac=[0,1],P=(u,v)=>[-u,v];   /* u: up the face (west), v: along it (south) */
 return{key:'face',name:'The Cut: the cut face, the west lip',title:'Krator biome — the Cut: the cut face',
  hint:'The west lip of the Cut (~4,800 m): the bare curved face the sphere left, polished, its beds in clean section, circle lichen on it; the old mountain above with its forest; the whole bowl below',
  site,yRef,R,px:[CUT.PX0[0]+site.x/CUT.PXM,CUT.PX0[1]+site.z/CUT.PXM],air:{pressure:.9,humidity:.5},toBowl,alt:y=>y+yRef,ground,bowlY,up,across:ac,
  water:null,cold:true,lipX:LIPX,faceK,normal,grade,out,
  pool:{name:'A snowmelt tarn on the old mountain',level:tarnLevel,poly:Array.from({length:20},(_,i)=>{const a=i/20*TAU;return[TARN.x+Math.cos(a)*TARN.r*1.25,TARN.z+Math.sin(a)*TARN.r*1.25];}),color:0x2e4a5a},
  floorLabel:y=>'The cut face (the bowl\'s last sweep to the lip, or the old mountain past it)',
  fields:{cold,wet:(x,z)=>.62,mist:(x,z)=>.2,rock:(x,z)=>clamp(smooth(.5,.9,grade(x,z))+.4*faceK(x,z),0,1),flow:(x,z)=>0,upland:(x,z)=>.9,dry:(x,z)=>.3,tropic:(x,z)=>0},
  zone:(x,z)=>{const f=faceK(x,z),a=above(x,z),o=out(x,z),gr=grade(x,z);return{grove:0,reed:0,rank:0,melon:0,
   nw:(1-f)*smooth(-60,-400,o)*smooth(.5,.3,gr),nhl:a*(1-smooth(.75,1,gr))*(1-smooth(TARN.r*1.3,TARN.r*.9,Math.hypot(x-TARN.x,z-TARN.z)))};},
  /* exchange 5 (PLAN.md section 12: the rowan 64-72 km out): the lip here stands at 66 km, so the rowans nhighlands grows just past it are in the plan's
     ring, and they take the bowl's stuck fruit (a share of clusters small and green). Inside the lip there is no ground but the face (its grade is ~.5 to
     the page's edge), so none grows there; they are few (the lip is boreal at 4.9 km: the rowan's boreal share). KNOWN_ISSUES.md */
  nhlStuck:{rowan:{item:'berry',where:(x,z)=>ringKm(x,z)>=64&&ringKm(x,z)<=72}},ringKm:(x,z)=>ringKm(x,z),
  nwAllow:['spire','needlecypress','cragpine'],nwQ:1.2,nhlQ:.8,nhlOpt:{flora:false},nhlDeny:['burnsnag'],   /* the plan's 'normal forest': no burn above the lip */
  groves:false,reeds:false,rank:false,
  lichen:P=>CUT.planLichen({spine:STAGE.spine,r:260,bare:lichenK,normal,ground}),
  layers:['ground.face','ground.lichen','ground.litter','ground.efflor'],layerMul:[0,0,1,1],
  weights:(x,z)=>{const f=faceK(x,z),l=lichenK(x,z),a=above(x,z);return[f*.95,l*.75,a*.6*(1-smooth(.6,.9,grade(x,z))),0];},
  paint:(x,z)=>{const a=above(x,z),gr=grade(x,z);let c=[.42,.40,.36];c=c.map((v,i)=>mix(v,[.30,.34,.24][i],a*(1-smooth(.5,.8,gr))));return c.map((v,i)=>mix(v,[.5,.47,.43][i],smooth(.6,.9,gr)*a));},
  spine:[[0,0],[LIPX-400,0],[LIPX+200,300],[LIPX+200,-300],[600,0],[LIPX-900,-420]],
  views:()=>{const Y=(x,z)=>ground(x,z),Vw=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const Lc=(CUT.PLANTS&&CUT.PLANTS.lichen||[]).slice().sort((a,b)=>b.r-a.r)[0]||{x:LIPX+150,z:0,n:[1,0,0]};
   return{
    'The cut face (polished, the beds in section)':Vw([LIPX+620,120],40,[LIPX+60,-60],-20),
    'Circle lichen (nesting, never touching)':Vw([Lc.x+Lc.n[0]*7,Lc.z+Lc.n[2]*7],6,[Lc.x,Lc.z],0),
    'Along the lip (the smooth meets the broken)':Vw([LIPX+40,700],12,[LIPX-60,-500],30),
    'The whole bowl below':Vw([LIPX-120,0],40,[30000,0],-4500),
    'The old mountain\'s forest':Vw([LIPX-260,520],14,[LIPX-700,0],60),
    'The snowmelt tarn':Vw([TARN.x+120,TARN.z+80],14,[TARN.x,TARN.z],0),
    'The face from below':Vw([900,0],20,[LIPX,0],60),
    'The face from the air':Vw([1400,-900],600,[LIPX,0],0)};},
  checks:add=>{add('circle lichen: nesting, never touching',CUT.checkLichen(CUT.PLANTS.lichen));add('rowans in the plan\'s ring, with stuck fruit (exchange 5)',rowanCheck(REG,CUT.WARPED));},
  negatives:add=>{add('no rowan in the ring',rowanCheck(REG.filter(r=>r.name!=='Rowan'),CUT.WARPED));add('rowans with no stuck fruit',rowanCheck(REG,Object.assign({},CUT.WARPED,{stuckOf:{}})));add('two thalli touching',CUT.checkLichen(CUT.PLANTS.lichen.slice(0,600).concat([Object.assign({},CUT.PLANTS.lichen[0],{x:CUT.PLANTS.lichen[0].x+.1,nest:null})])));},
  start:'The cut face (polished, the beds in section)',horizon:'scene',budgetTris:10500000,hour:14,forestLine:3800,seed:13};})();
