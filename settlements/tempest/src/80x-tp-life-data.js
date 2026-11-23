// ================================================================= THE HOUSE OF THE TEMPEST — life on the crest, as data (step 4b)  [G data]
// What lives on the crest that needs no people (BLUEPRINT.md "Horses", tempest_plan.json horses and fodder): the herds, where each
// beast stands by day and by night, and the chain of fires and mirrors the House is one link of (BLUEPRINT.md item 6). Records
// only; 90qt draws them. The riders, the companies at drill and the horse-archery track ridden wait on core/charactermodels'
// figures and the riding work (KNOWN_ISSUES.md).
//   TP_LIFE.herds         [{id, key, n, looks, day, night, space, proposed, note}]  key a kits/fauna key; day and night a TP_GROUNDS field
//   TP_LIFE.place(G, when) [{herd, i, x, z, ry, look, pose}]  every beast of every herd in the plan's frame (x north, z east from the
//                         House's middle), when 'day' or 'night'; each beast seeded from a hash of (the House, herd, index, try, when)
//                         through core/rand (KRAND.hash), never from how many draws came before it
//   TP_LIFE.signals       the chain: the brow lookout (page metres from the pin, x east, z south), the relay (sited by step 5), the
//                         Storm Tower's mirror and fire basket, the utse's beacon; the mirror's code (a pattern of flashes)
//   TP_LIFE.check(G, P)   the rules (TP_LIFE.RULES): {ok, fails:[...]}; G is TP_GROUNDS, P the House's plan (TEMPEST.plan())
// Units metres, seconds. A numeric default is x == null ? d : x.
const TP_LIFE=(function(){
 const SEED=32811,TRIES=60,MARGIN=2;
 /* The herds (tempest_plan.json "horses": 300 remounts; the fodder rota: four companies' horses at grass with them, the other four
    and the gate stable stabled). 146 is half of the 292 flank stalls. The milking herd's size is not in the blueprint: 40 dri, *proposed* */
 const herds=[
  {id:'remounts',key:'horse',n:300,looks:4,day:'commons',night:'paddock',space:3,note:'the remounts: on the crest by day, in the walled paddock by night'},
  {id:'companies',key:'horse',n:146,looks:4,day:'commons',night:'paddock',space:3,note:'four companies\' horses at grass on the duty rota (the rota proposed)'},
  {id:'milk',key:'yak',n:40,looks:3,day:'byres',night:'byres',space:2.6,proposed:true,note:'the milking herd at the byres (40 dri, proposed)'}];
 const POSES=[['graze',.6],['idle',.3],['rest',.1]];
 const H=(...a)=>KRAND.unit(KRAND.hash(SEED,...a));
 /* the footprint a piece of the crest keeps clear (TP_GROUNDS.pieces): a box [x0,z0,x1,z1] in the plan's frame */
 function foot(p){if(p.kind==='walls')return null;const r=p.kind==='shed'||p.kind==='tank'?null:(p.r==null?1:p.r);
  if(r!=null)return[p.at[0]-r,p.at[1]-r,p.at[0]+r,p.at[1]+r];const w=p.w/2,d=p.d/2;   /* a shed's and the tank's w along x, d along z (90p) */
  return[p.at[0]-w,p.at[1]-d,p.at[0]+w,p.at[1]+d];}
 const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
 const inB=(x,z,b,m)=>x>=b[0]+m&&x<=b[2]-m&&z>=b[1]+m&&z<=b[3]-m;
 const clearOf=(x,z,G,m)=>!G.pieces.some(p=>{const b=foot(p);return b&&x>=b[0]-m&&x<=b[2]+m&&z>=b[1]-m&&z<=b[3]+m;})&&
  !G.tracks.some(T=>{for(let i=0;i+1<T.pts.length;i++)if(segD(x,z,T.pts[i],T.pts[i+1])<T.w/2+m)return true;return false;});
 function place(G,when){const out=[],byField={};
  herds.forEach((h,hi)=>{const f=G.fields.find(q=>q.id===h[when]);if(!f)return;const b=f.box,mine=byField[f.id]||(byField[f.id]=[]);
   for(let i=0;i<h.n;i++){let got=null;
    for(let t=0;t<TRIES&&!got;t++){const w=when==='night'?1:0,x=b[0]+(b[2]-b[0])*H(hi,i,t,w,1),z=b[1]+(b[3]-b[1])*H(hi,i,t,w,2);
     if(!inB(x,z,b,MARGIN)||!clearOf(x,z,G,1.5))continue;
     if(mine.some(q=>Math.hypot(q.x-x,q.z-z)<Math.max(q.space,h.space)))continue;got={x,z};}
    if(!got)continue;   /* a field too full shows as a short count (the rules' first) */
    const u=H(hi,i,0,0,3);let pose='graze',acc=0;for(const[p,k]of POSES){acc+=k;if(u<acc){pose=p;break;}}
    const rec={herd:h.id,key:h.key,i,x:got.x,z:got.z,ry:H(hi,i,0,0,4)*Math.PI*2,look:Math.floor(H(hi,i,0,0,5)*h.looks),pose,field:f.id,space:h.space};
    mine.push(rec);out.push(rec);}});
  return out;}
 /* ---------------------------------------------------------------- the chain of fires and mirrors (BLUEPRINT.md item 6)
    The brow lookout stempestlk01 (scale model px 879,1618, 153 m) is 7 px west and 1 px north of the pin at 2 km a pixel. The Storm
    Tower reads the brow relay's mirrors by day and its fires by night and passes them to the utse, whose beacon sends them east to
    Strongwall and the watch line. The relay is not sited: on the model's ground no single site sees both the brow and the Storm
    Tower's roof (the best misses by 21 m), and the best pair of sites misses by 4 m on the 500 m grid; it is sited at 1:1 on the
    world's ground (PLAN.md step 5). */
 const signals={
  lookout:{id:'lookout',pin:[879,1618],at:[(879-886)*2000,(1618-1619)*2000],def:'xa_fort_post',fort:'xan.tempest',note:'the brow lookout: sees Komodo and the trough, not the crest'},
  relay:{id:'relay',at:null,waits:'step 5: sited at 1:1 on the world ground (no site on the model ground sees both ends)'},
  storm:{id:'storm',tower:'storm',mirror:{w:1.2,h:1.2},basket:{h:1.4},note:'reads the brow, sends to the utse'},
  utse:{id:'utse',beacon:true,note:'sends east to Strongwall and the watch line'},
  /* the mirror's message: "all quiet", the House answering the brow's hourly call; on 0.4 s, off 0.4 s, a 2.4 s gap; a 6 s round */
  code:{unit:.4,pattern:[1,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,0,0],note:'all quiet (proposed)'}};
 const lit=(code,t)=>{const n=code.pattern.length,k=Math.floor(t/code.unit)%n;return code.pattern[(k+n)%n]===1;};
 /* ---------------------------------------------------------------- the rules */
 const RULES={
  'every herd is at its count by day and by night':(G)=>{const out=[];for(const when of['day','night']){const all=place(G,when);
   for(const h of herds){const n=all.filter(a=>a.herd===h.id).length;if(n!==h.n)out.push(h.id+' '+when+' '+n+' of '+h.n);}}return out;},
  'every beast stands inside its field, clear of the pieces and the tracks':(G,P,hs,A)=>{const out=[];for(const a of(A||place(G,'day').concat(place(G,'night')))){
   const f=G.fields.find(q=>q.id===a.field);if(!inB(a.x,a.z,f.box,MARGIN-.01))out.push(a.herd+'.'+a.i+' out of '+f.id);
   else if(!clearOf(a.x,a.z,G,1.5-.01))out.push(a.herd+'.'+a.i+' on a piece or a track');}return out;},
  'no two beasts of a field stand closer than their room':(G)=>{const out=[];for(const when of['day','night']){const all=place(G,when);
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const p=all[i],q=all[j];if(p.field!==q.field)continue;
    if(Math.hypot(p.x-q.x,p.z-q.z)<Math.max(p.space,q.space)-1e-6)out.push(when+' '+p.herd+'.'+p.i+' and '+q.herd+'.'+q.i);}}return out.slice(0,5);},
  'the horses come into the walled paddock by night':(G,P,hs)=>(hs||herds).filter(h=>h.key==='horse'&&h.night!=='paddock').map(h=>h.id+' sleeps in '+h.night),
  'the herds are out of the House':(G,P)=>{const O=P.wards.find(w=>w.id==='outer').poly,xs=O.map(p=>p[0]),zs=O.map(p=>p[1]),ob=[Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs)],out=[];for(const h of herds)for(const when of['day','night']){const f=G.fields.find(q=>q.id===h[when]);
   if(f&&Math.min(f.box[2],ob[2])>Math.max(f.box[0],ob[0])&&Math.min(f.box[3],ob[3])>Math.max(f.box[1],ob[1]))out.push(h.id+' '+when+' in '+f.id+' inside the curtain');}return out;},
  'the mirror\'s code has a flash and a gap':()=>{const p=signals.code.pattern;return p.includes(1)&&p.includes(0)?[]:['the code never changes'];},
  'the lookout stands on its pin, the relay waits on step 5':()=>{const L=signals.lookout,out=[];
   if(L.at[0]!==(L.pin[0]-886)*2000||L.at[1]!==(L.pin[1]-1619)*2000)out.push('the lookout is off its pin');
   if(signals.relay.at&&!signals.relay.sited)out.push('a relay placed without a siting');return out;}};
 function check(G,P){const fails=[];for(const k in RULES)for(const f of RULES[k](G,P))fails.push(k+': '+f);return{ok:!fails.length,fails};}
 return{herds,place,signals,lit,check,RULES,foot,SEED};})();
if(typeof module!=='undefined')module.exports=TP_LIFE;
