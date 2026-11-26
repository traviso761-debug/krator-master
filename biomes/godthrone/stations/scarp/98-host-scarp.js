// ================================================================= HOST — the basal escarpment's views and checks (station 4)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail).
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},P=(d,a)=>xzDA(d,a),F=SC.d+SC.run;
 // the wall from out on the lower slope: the whole 600 m of stacked flows, the stripes, the colonnades in its lower half
 {const c=P(F+1900,300),t=P(SC.d+120,-200);add('The escarpment',[c[0],G(c[0],c[1])+40,c[1],t[0],G(t[0],t[1])+180,t[1]]);}
 // under the face (the 2 m inset): the colonnade standing over the talus
 {const c=P(F+60,-600),t=P(F-120,-640);add('The colonnade',[c[0],G(c[0],c[1])+2.5,c[1],t[0],G(t[0],t[1])+90,t[1]]);}
 // along the face from a bench, the ledges receding
 {let best=null;for(let d=SC.d+40;d<F-40&&!best;d+=4){const p=P(d,1500),c=KRELIEF.at(SCARP,p[0],p[1],slopeH(p[0],p[1]));if(c&&c.part==='bench')best=d;}
  if(best!=null){const c=P(best,1500),t=P(best+30,-400);add('Along a bench',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+20,t[1]]);}}
 // from the rim, down the wall to the bay's country
 {const c=P(SC.d-60,800),t=P(F+2600,600);add('From the rim',[c[0],G(c[0],c[1])+3,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // up a ravine to its head
 {const R=SCARP.ravines&&SCARP.ravines[1];if(R){const c=[R.x+R.nx*(SC.run+260),R.z+R.nz*(SC.run+260)];add('A ravine',[c[0],G(c[0],c[1])+6,c[1],R.x,G(R.x,R.z),R.z]);}}
 {const c=P(F+3200,-3400),t=P(SC.d,0);add('Overview',[c[0],G(c[0],c[1])+1400,c[1],t[0],SC.y0,t[1]]);}
 {const c=P(F+900,-1200),t=P(SC.d+200,-800);add('Dawn, the wall',[c[0],G(c[0],c[1])+20,c[1],t[0],G(t[0],t[1])+150,t[1]],'dawn');}
 {const c=P(F+1200,0),t=P(SC.d,0);add('Night, the wall',[c[0],G(c[0],c[1])+30,c[1],t[0],G(t[0],t[1])+100,t[1]],'night');}}
// ---- the checks
const SCHK={
 // the wall: over 450 m from rim to foot within ~1.3 km across it, at every sampled section
 wall(S){const bad=S.filter(s=>s<450);return{ok:S.length>=5&&!bad.length,detail:'drops '+S.map(v=>v.toFixed(0)).join(', ')+' m'};},
 // the stack: the face's beds are flows with ochre partings (the bead horizons altered: palagonite, no fresh orange bead under the line)
 // and its lower half the ponded flows (the colonnades)
 stack(S){const k={},r={};S.forEach(q=>{k[q.kind]=(k[q.kind]||0)+1;if(q.low)r[q.recipe]=(r[q.recipe]||0)+1;});const low=S.filter(q=>q.low).length;
  return{ok:S.length>150&&(k.palagonite||0)>=S.length*.015&&!k.bead&&!k.beadblack&&(r['tibasalt-ponded']||0)>=low*.7&&(k.flow||0)>S.length*.4,detail:S.length+' face samples '+JSON.stringify(k)+'; lower half '+JSON.stringify(r)};},
 air(p){const ok=Math.abs(p-.66)<.03;return{ok,detail:p.toFixed(3)+' atm at the site (map 5.1: 0.66)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const wallDrops=()=>{const o=[];for(let a=-3600;a<=3600;a+=900){let hi=-1e9,lo=1e9;for(let d=SC.d-300;d<=SC.d+SC.run+500;d+=10){const p=xzDA(d,a);if(!inMap(p[0],p[1]))continue;const y=terrainH(p[0],p[1])+SC.slope*d;hi=Math.max(hi,y);lo=Math.min(lo,y);}if(hi>lo)o.push(hi-lo);}return o;};
const faceSamples=()=>{const o=[];for(let a=-3800;a<3800;a+=60)for(let d=SC.d;d<SC.d+SC.run;d+=6){const p=xzDA(d,a),c=KRELIEF.at(SCARP,p[0],p[1],slopeH(p[0],p[1]));if(!c||c.part!=='face')continue;
 const y=terrainH(p[0],p[1]),r=STRATA.at(p[0],y,p[1]);o.push({kind:r.kind,recipe:r.recipe,low:y<6850});}return o;};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 add('the escarpment: a wall over 450 m',SCHK.wall(wallDrops()));
 add('the stack: flows, ochre partings, colonnades below',SCHK.stack(faceSamples()));
 add('the air at 7 km',SCHK.air(presAt(SC.y0)));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('a slope, not a wall',SCHK.wall(wallDrops().map(v=>v*.4)));
 add('fresh orange beads under the line',SCHK.stack(faceSamples().map((q,i)=>q.kind==='palagonite'?Object.assign({},q,{kind:'bead'}):q)));
 add('the summit\'s air on the scarp',SCHK.air(presAt(25000)));
 return R;}
