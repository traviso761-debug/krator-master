// ================================================================= LONGSONG — the people dressed (PLAN.md P5b)
// [draw] The nearest people to the eye drawn as core/charactermodels figures (KCharFigure, read in place) in their own
// records (40e: LSK.record, KCHAR.stranger on each one's seed: the Order's robes by standing, Xanadu's dress, a face, a
// build and an ancestry of their own); everyone further off stays the placeholder (68). A figure stands where 68's pose
// put its person (POS) and plays the clip its activity wants. The pieces come from the sidecars beside the page
// (dist/kchar/<body>__<piece>.js), each loaded the first time a figure needs it. ?dressed=N sets how many (0: none).
// Past them, out to 170 m, the crowd: each person in one of the commonest outfits baked still and drawn instanced
// (core/charactermodels KCharCrowd: below).
const LSFIG=(function(){const O={on:false,ready:0,want:0,err:null,slots:[],loads:0};
 if(typeof KCharFigure==='undefined'||typeof LS_KCHAR==='undefined'||!THREE.GLTFLoader)return O;
 const D=LS_KCHAR,Q=new URLSearchParams(location.search),MAX=Q.has('dressed')?Math.max(0,+Q.get('dressed')||0):24,R=48;
 if(!MAX)return O;
 KCharFigure.posture=(D.posture&&D.posture.bodies)||{};KCharFigure.props={};
 // ---------------------------------------------------------------- the pieces, from the sidecars
 const side={},wait={};
 window.KCHAR_SIDE=function(k,t){side[k]=t;const w=wait[k];delete wait[k];if(w)w.forEach(f=>f[0](t));};
 function text(base){if(side[base]!=null)return Promise.resolve(side[base]);
  return new Promise((ok,no)=>{const first=!wait[base];(wait[base]=wait[base]||[]).push([ok,no]);if(!first)return;O.loads++;
   const s=document.createElement('script');s.src='kchar/'+base.replace('/','__')+'.js';
   s.onerror=()=>{const w=wait[base];delete wait[base];(w||[]).forEach(f=>f[1](new Error('no piece '+base)));};document.head.appendChild(s);});}
 const b64=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
 const gunzip=buf=>{const u=new Uint8Array(buf);if(u[0]!==0x1f||u[1]!==0x8b)return Promise.resolve(buf);
  return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();};
 // a piece's sidecar holds its GLB and, on a second line, its morph deltas (key + '.morph')
 const raw=key=>{const base=key.replace(/\.morph$/,''),line=base===key?0:1;
  return text(base).then(t=>{const s=t.split('\n')[line];if(!s)throw new Error(key+': no such line');return gunzip(b64(s));});};
 const cache={};
 function load(key){if(!cache[key])cache[key]=raw(key).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no)));return cache[key];}
 load.raw=raw;
 // ---------------------------------------------------------------- the records (40e), made when first wanted
 const REC=new Array(LS.PEOPLE.length);
 const recOf=i=>REC[i]||(REC[i]=LSK.record(LS.PEOPLE[i],D));
 // the clip each activity wants (data/clips.json's names: the body's anims.glb; 2026-10-20: the library's own for each,
 // no longer idle for most): the walkers walk; the forms, the debate, the wheel as before; prayer, study and the camp sit
 // cross-legged, tea is drunk sitting, a meal eaten; the wardens stand with their arms folded, the keepers and the
 // watch hold a lantern; work is at a bench, trade is talk; at rest or on the festival's forecourt each person keeps
 // one of three (arms folded, talking, sitting), by their seed
 const pick=(i,salt,L)=>L[Math.floor(KRAND.unit(KRAND.hash(LS.PEOPLE[i].seed,salt))*L.length)];
 const CLIP=(i,act)=>act==='MOVE'||act==='KORA'||act==='WALK'||act==='CHAM'?'walk':act==='DRILL'?(LS.PEOPLE[i].role==='master'?'combat_idle':'ual_punch'):
  act==='DEBATE'?(KRAND.unit(KRAND.hash(LS.PEOPLE[i].seed,7))<.5?'ual_talk':'sit_floor'):act==='TURN_WHEEL'?'ual_push':
  act==='GUARD'?(LS.PEOPLE[i].role==='operative'?'combat_idle':'ual_arms_folded'):act==='FARM'?pick(i,17,['ual_harvest','ual_harvest','ual_water','ual_plant']):
  act==='PRAY'||act==='STUDY'||act==='STUDY_IN'||act==='CAMP'||act==='LODGE'?'sit_floor':act==='TEA'?'sit_drink':act==='EAT'?'ual_consume':
  act==='WATCH'||act==='KEEP'?'ual_lantern':act==='WORK'?'ual_interact':act==='TRADE'||act==='PILGRIM'?'ual_talk':
  /^REST/.test(act||'')||act==='FESTIVAL'?pick(i,19,['ual_arms_folded','ual_talk','sit_floor']):'idle';
 const SITS={sit_floor:1,sit_drink:1,ual_sit_talk:1};O.CLIP=CLIP;
 // ---------------------------------------------------------------- the slots: a figure each, given to the nearest people
 function slot(body){const fig=new KCharFigure(D.bodies[body],D.sliders,load);fig.group.visible=false;fig.group.userData.probeSkip=true;
  fig.group.traverse(m=>{m.userData.inspectLabel='A person of Longsong';m.frustumCulled=false;});scene.add(fig.group);
  const s={body,fig,who:-1,ready:false,clip:null,gen:0};O.slots.push(s);return s;}
 let last=-1;const PD=PEOPLE_DRAWN,cam=camera.position;
 function assign(){const S=PD.S,P=PD.POS,near=[];
  for(let i=0;i<S.length;i++){if(!S[i].shown)continue;const d=Math.hypot(P[i*4]-cam.x,P[i*4+1]-cam.y,P[i*4+2]-cam.z);if(d<R)near.push([d,i]);}
  near.sort((a,b)=>a[0]-b[0]);const want=new Set(near.slice(0,MAX).map(x=>x[1]));O.want=want.size;
  // let go of those no longer wanted; give the free slots (of the right body) to the wanted who have none
  for(const s of O.slots)if(s.who>=0&&!want.has(s.who)){PD.dressed.delete(s.who);s.who=-1;s.ready=false;s.fig.group.visible=false;}
  const held=new Set(O.slots.filter(s=>s.who>=0).map(s=>s.who));
  for(const i of want){if(held.has(i))continue;const r=recOf(i),b=r.body;let s=O.slots.find(q=>q.who<0&&q.body===b);
   if(!s){if(O.slots.filter(q=>q.body===b).length>=MAX)continue;s=slot(b);}
   s.who=i;s.ready=false;s.clip=null;const g=++s.gen;
   s.fig.apply(r).then(()=>{if(s.gen!==g||s.who!==i)return;s.ready=true;O.ready++;PD.dressed.add(i);s.fig.group.visible=true;},
    e=>{O.err=e;reportErr('people dressed: '+(e&&e.message||e));});}}
 TICKS.push(function(dt){if(!PD.sim||!PD.sim.on)return;O.on=true;const now=performance.now();if(now-last>500){last=now;assign();}
  const P=PD.POS,S=PD.S;
  for(const s of O.slots){if(!s.ready||s.who<0)continue;const i=s.who;if(!S[i].shown){s.fig.group.visible=false;continue;}s.fig.group.visible=true;
   s.fig.group.position.set(P[i*4],P[i*4+1],P[i*4+2]);s.fig.group.rotation.y=P[i*4+3];
   const c=CLIP(i,S[i].act);if(c!==s.clip){s.clip=c;s.fig.play(c);}s.fig.update(dt);}});
 // ---------------------------------------------------------------- the crowd past them (core/charactermodels KCharCrowd, 2026-10-20)
 // Everyone not dressed as a figure, out to FAR, is drawn in a LOOK: the commonest outfits (body, robe, legs) each worn
 // by the first person who wears it, that figure baked still (standing, at WALKN frames of the walk, sitting) and drawn
 // instanced; a person whose outfit is not among them takes the commonest look of their body and their side (the Order
 // or the valley). The looks are baked one at a time after the page is up, on one figure per body kept off the scene;
 // till a person's look is ready they stay the placeholder (68). ?crowd=N sets FAR (0: none), ?looks=N how many.
 const WALKN=4,FAR=Q.has('crowd')?Math.max(0,+Q.get('crowd')||0):170,NL=Q.has('looks')?Math.max(1,+Q.get('looks')||1):16,N=LS.PEOPLE.length;
 const CR=O.crowd={looks:[],of:new Int16Array(N).fill(-1),ready:0,shown:0,err:null,tris:0};PD.crowd=new Set();
 if(FAR>0&&typeof KCharCrowd!=='undefined'){
  const side=r=>(r.armour.torso||'').indexOf('order_')===0?'order':'valley',key=r=>r.body+'|'+(r.armour.torso||'')+'|'+(r.armour.legs||'');
  const count=new Map(),first=new Map();for(let i=0;i<N;i++){const k=key(recOf(i));count.set(k,(count.get(k)||0)+1);if(!first.has(k))first.set(k,i);}
  const top=[...count.keys()].sort((a,b)=>count.get(b)-count.get(a)||(a<b?-1:1)).slice(0,NL);
  top.forEach(k=>{const i=first.get(k),r=recOf(i);CR.looks.push({key:k,who:i,body:r.body,side:side(r),n:0,sets:null});});
  for(let i=0;i<N;i++){const r=recOf(i);let L=CR.looks.findIndex(l=>l.key===key(r));
   if(L<0)L=CR.looks.findIndex(l=>l.body===r.body&&l.side===side(r));if(L<0)L=CR.looks.findIndex(l=>l.body===r.body);
   CR.of[i]=L;if(L>=0)CR.looks[L].n++;}
  const FIG={},figFor=b=>FIG[b]||(FIG[b]=new KCharFigure(D.bodies[b],D.sliders,load));
  const bakeLook=L=>{const f=figFor(L.body);return f.apply(recOf(L.who)).then(()=>KCharCrowd.bake(f,'idle',.5)).then(a=>{
    const w=f.clips.walk?f.clips.walk.duration:1;let ch=Promise.resolve([a]);
    for(let k=0;k<WALKN;k++)ch=ch.then(G=>KCharCrowd.bake(f,'walk',w*(k+.25)/WALKN).then(b=>G.concat([b])));return ch;})
   .then(G=>KCharCrowd.bake(figFor(L.body),'sit_floor',.6).then(d=>G.concat([d])))
   .then(G=>{L.sets=G.map(g=>{const im=KCharCrowd.set(g.geo,L.n);im.userData.people=true;im.userData.probeSkip=true;im.userData.inspectLabel='A person of Longsong';scene.add(im);CR.tris+=g.tris;CR.from=(CR.from||0)+g.from;return im;});CR.ready++;});};
  let chain=Promise.resolve();
  const startBake=()=>{CR.looks.forEach(L=>{chain=chain.then(()=>bakeLook(L)).catch(e=>{CR.err=String(e&&e.message||e);});});};
  // after the page is up (the figures' own loads first)
  setTimeout(startBake,1500);
  // the walk played as WALKN frames, each walker at its own point of the cycle (a stride about every 0.6 s)
  const STRIDE=(i,t)=>1+Math.floor(((t*.85+KRAND.unit(KRAND.hash(LS.PEOPLE[i].seed,11)))%1)*WALKN)%WALKN,SIT=1+WALKN,NS=2+WALKN;
  TICKS.push(function(dt){const P=PD.POS,S=PD.S,t=performance.now()/1000,use=CR.looks.map(()=>new Array(NS).fill(0));PD.crowd.clear();let shown=0;
   for(let i=0;i<N;i++){const L=CR.looks[CR.of[i]];if(!L||!L.sets||!S[i].shown||PD.dressed.has(i))continue;
    const d=Math.hypot(P[i*4]-cam.x,P[i*4+1]-cam.y,P[i*4+2]-cam.z);if(d>FAR)continue;
    const a=S[i].act,k=a==='MOVE'||a==='KORA'||a==='CHAM'||a==='WALK'?STRIDE(i,t):SITS[CLIP(i,a)]?SIT:0,j=use[CR.of[i]][k]++;
    L.sets[k].put(j,P[i*4],P[i*4+1],P[i*4+2],P[i*4+3]);PD.crowd.add(i);shown++;}
   CR.looks.forEach((L,l)=>{if(!L.sets)return;for(let k=0;k<NS;k++)L.sets[k].flush(use[l][k]);});
   CR.shown=shown;});}
 O.recOf=recOf;O.load=load;O.max=MAX;
 return O;})();
// the checks (64): every person's record dresses them from the page's kit, the Order in its clothes and the rest in
// Xanadu's; the negative is a record wearing what the kit does not hold
const FIGCHK={dress(recs){const ids={};['mpfb_male','mpfb_female'].forEach(b=>LS_KCHAR.bodies[b].kit.items.forEach(it=>{ids[b+'/'+it.id]=1;}));
  let bad=[],order=0,turbans=0,faces=new Set();recs.forEach(([P,r])=>{for(const sl in r.armour){const id=r.armour[sl];if(id&&!ids[r.body+'/'+id])bad.push(P.id+' '+id);}
   const t=r.armour.torso||'';if(LSK.ORDER[P.role]?t.indexOf('order_')!==0:t.indexOf('xan_')!==0)bad.push(P.id+' in '+(t||'nothing'));
   if(LSK.ORDER[P.role])order++;if((r.armour.head||'').indexOf('turban')>=0)turbans++;faces.add(JSON.stringify(r.morph));});
  return{ok:!bad.length&&faces.size===recs.length,detail:recs.length+' records ('+order+' of the Order, '+turbans+' turbans), '+faces.size+' faces of their own; '+(bad.length?bad.length+' wrong: '+bad.slice(0,3).join('; '):'all dressed from the kit')};}};
window.figureChecks=function(add){if(typeof LS_KCHAR==='undefined'){add('the people dressed from core/charactermodels',{ok:false,detail:'no data'});return;}
 add('the people dressed from core/charactermodels',FIGCHK.dress(LS.PEOPLE.map(P=>[P,LSK.record(P,LS_KCHAR)])));};
window.figureNegatives=function(add){const P=LS.PEOPLE[0],r=LSK.record(P,LS_KCHAR);r.armour=Object.assign({},r.armour,{torso:'rep_m_noble_greatcoat'});
 add('a monk in a coat the kit does not hold',FIGCHK.dress([[P,r]]));};
_mark('figures');
