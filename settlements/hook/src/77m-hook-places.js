/* ============================== HOOK: THE HAMLETS AND CAMPS OF THE ENVIRONS (S5, [G data]) ============================== */
/* The thirteen places of the owner's site plan (77-hook-ruin.js `places`: the Hukoa's, the Iziz settlers', the salvagers'
   and the Hykkousoi's hamlets, posts and camps) laid out as buildings by core/hamlet (KHAMLET.village; a camp through its
   work-camp option, core/hamlet/camp 26), each on its culture's row: the Hukoa on the Islanders' (islander_east: the
   Islanders kit), the settlers on the Iziz Vernacular's (iziz), the salvagers on a row of the post-apoc kit's pieces
   (HOOK_PLACES.SALVAGE, below: no core/hamlet row has them). Plain records: 90b draws them as it draws the town's lots (in
   full near the camera, massing beyond), 89z registers them in core/tags, 90e keeps the jungle off them.
   - THE GROUND a building may take: dry (0.4 m over the sea), not steep, outside Port Hook's zone and clear of every
     ruin footprint, heap, standing span and the wall (the plan's records, in a core/space grid).
   - A coastal hamlet's landing (the Islanders' quay) on the nearest shore of its point, facing the water; a works hamlet's
     resource there (fishing, salt) or at its point (lumber).
   - Not laid here: the Drowned Spire's village (C1: the Hykkousoi live in pods on the Spire, 77's pods, drawn by 90c)
     and the deck camp (C3: on a standing freeway span, its deck 14 m up). KNOWN_ISSUES.md.
   HOOK_PLACES.lots: the buildings as the town's drawing takes them; .villages: KHAMLET's results by place; .skipped. */
const HOOK_PLACES=(function(){
 if(typeof KHAMLET==='undefined'||typeof HOOK_RUIN==='undefined'||!HOOK_RUIN.places)return null;
 const R=HOOK_RUIN,W=HOOK_WORLD,DIMS=typeof HOOK_DIMS!=='undefined'?HOOK_DIMS:{};
 const ZONE=((typeof HOOK_SITE!=='undefined'&&HOOK_SITE.districts||[]).find(d=>d.type==='zone')||{}).poly||null;
 const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 /* the ground read once a metre (the layout asks the same spots many times) */
 const NAT=new Map(),natH=(x,z)=>{const k=Math.round(x)+','+Math.round(z);let v=NAT.get(k);if(v===undefined){v=W.natH(Math.round(x),Math.round(z));NAT.set(k,v);}return v;};
 /* ---- the ruin's footprints in a core/space grid */
 const S=KSPACE.create({cell:40});
 const line=(x0,z0,x1,z1,r,step)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/step));for(let a=0;a<=n;a++)S.insert({r},x0+(x1-x0)*a/n,z0+(z1-z0)*a/n,r);};
 for(const t of R.towers){let x=t.x,z=t.z,w=t.w,d=t.d,yaw=t.yaw;
  if(t.state==='fallen'){const L=t.roof*.75,dir=t.leanDir;x=t.x+Math.sin(dir)*L/2;z=t.z+Math.cos(dir)*L/2;w=Math.min(t.w,t.d);d=L;yaw=dir;}
  const s=Math.min(w,d),L=Math.max(w,d),r=s/2*1.15+4,ax=w>=d?[Math.cos(yaw),-Math.sin(yaw)]:[Math.sin(yaw),Math.cos(yaw)],h=Math.max(0,(L-s)/2);
  line(x-ax[0]*h,z-ax[1]*h,x+ax[0]*h,z+ax[1]*h,r,Math.max(4,s*.6));}
 for(const h of R.heaps)S.insert({r:(h.r==null?10:h.r)+3},h.x,h.z,(h.r==null?10:h.r)+3);
 for(const s of R.spans)if(s.state!=='fallen')line(s.p0[0],s.p0[1],s.p1[0],s.p1[1],16,10);
 line(R.ramp.p0[0],R.ramp.p0[1],R.ramp.p1[0],R.ramp.p1[1],14,10);line(R.wall.p0[0],R.wall.p0[1],R.wall.p1[0],R.wall.p1[1],9,8);
 for(const g of R.gates)S.insert({r:24},g.x,g.z,24);
 const _q=[],ruinAt=(x,z)=>{const L=S.query(x,z,0,_q);for(const o of L)if(Math.abs(o.r)>0)return true;return false;};
 const ground={ok:(x,z)=>{if(ZONE&&inPoly(x,z,ZONE))return false;if(ruinAt(x,z))return false;const h=natH(x,z);if(!(h>.4))return false;
  return Math.hypot(natH(x+5,z)-h,natH(x,z+5)-h)/5<.3;}};
 /* ---- the salvagers' row: the post-apoc kit's scrap houses, longhouse, mess, shops and works (kits/post-apoc) */
 const SALVAGE={kit:'post-apoc',household:4.5,workShare:.45,slopeMax:.3,
  religious:'shaman',civic:'longhouse',general:'shop-general',food:'mess',warehouse:'warehouse',
  services:{religious:1,civic:3,general:2,food:3,warehouse:4},
  houses:{poor:[['dw-box',1,3],['dw-tire',1,2],['dw-bus',1,2],['dw-tank',1,1],['dw-stilt',1,1]],
   middling:[['lg-stack',3,2],['lg-twinsilo',3,1],['lg-bulkhead',4,1]],head:[['chief',1,1]],middlingShare:.3},
  works:{salvage:[{key:'smithy',jobs:10,share:.45},{key:'shop-tinker',jobs:4,share:.2},{key:'warehouse',jobs:8,share:.25},{key:'watchtower',jobs:3,share:.1}]},
  focusJobs:{salvage:90},reach:{salvage:300},pending:{}};
 /* ---- each place's spec: its row and focus (the plan's `work`), its people; a camp by core/hamlet's work-camp option */
 const PLAN={H1:{row:'islander_east',focus:'fishing',landing:true},H2:{row:'iziz',focus:'farming'},H3:{row:SALVAGE,focus:'salvage'},
  H4:{row:'iziz',focus:'farming',workers:0},P1:{row:'iziz',focus:'farming',workers:0},
  C1:{skip:'the Hykkousoi village is the Drowned Spire\'s pods (77, drawn by 90c)'},C2:{row:'islander_east',focus:'fishing',camp:true,shore:true},
  C3:{skip:'the deck camp stands on a standing freeway span, 14 m up'},C4:{row:'iziz',focus:'farming',workers:0},
  C5:{row:'islander_east',focus:'lumber',camp:true},C6:{row:'islander_east',focus:'salt',shore:true,landing:true},
  C7:{row:'iziz',focus:'lumber',camp:true},C8:{row:'iziz',focus:'farming',workers:0,camp:true}};
 /* the nearest shore off the ruin: the first point under the sea along 24 bearings, every 10 m out to 600 */
 function shore(x,z){let best=null;for(let k=0;k<24;k++){const a=k/24*Math.PI*2,ux=Math.cos(a),uz=Math.sin(a);
  for(let r=10;r<=600;r+=10){if(natH(x+ux*r,z+uz*r)<0){const qx=x+ux*(r-12),qz=z+uz*(r-12);   /* the quay's spot: off the ruin */
   if(!ruinAt(qx,qz)&&!ruinAt(qx-ux*12,qz-uz*12)&&(!best||r<best.r))best={r,x:qx,z:qz,ux,uz};break;}}}return best;}
 /* the roomiest dry ground near a point: the most of the ground's good spots (every 30 m) within 120 m, searched every
    `step` m out to `reach` (a layout that cannot place its houses, or a point in the water, moves there) */
 function roomiest(x,z,reach,step){let best=null;for(let j=-reach;j<=reach;j+=step)for(let i=-reach;i<=reach;i+=step){if(i*i+j*j>reach*reach)continue;
  const cx=x+i,cz=z+j;if(!ground.ok(cx,cz))continue;let n=0;for(let b=-120;b<=120;b+=30)for(let a=-120;a<=120;a+=30)if(a*a+b*b<=14400&&ground.ok(cx+a,cz+b))n++;
  const sc=n-Math.hypot(i,j)/200;if(!best||sc>best.sc)best={x:cx,z:cz,sc,n};}return best;}
 /* a works village's resource out in its land, not on its point: core/hamlet faces its works from the point to the
    resource, and a resource on the point leaves them no facing (a zero box the houses then overlap) */
 function outward(x,z,r){let best=null;for(let k=0;k<16;k++){const a=k/16*Math.PI*2,qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(ground.ok(qx,qz)){best=[qx,qz];break;}}return best||[x+r,z];}
 const villages={},lots=[],skipped=[];
 for(const p of R.places){const id=String(p.id).split('.').pop().toUpperCase(),Q=PLAN[id];
  if(!Q||Q.skip){skipped.push({id:p.id,why:Q?Q.skip:'no plan'});continue;}
  const row=typeof Q.row==='string'?KHAMLET.CULTURES[Q.row]:Q.row,sh=(Q.shore||Q.landing)?shore(p.x,p.z):null;
  const spec={id:p.id,world:0x48554b41,culture:row,focus:Q.focus,site:{x:p.x,z:p.z},popMax:p.people,
   dims:k=>{const B=DIMS[k];return B?{w:B.w,d:B.d,h:B.h}:null;},ground,siteReach:400};
  if(Q.camp)spec.camp=true;
  if(Q.workers!=null)spec.resource={x:p.x,z:p.z,workers:Q.workers};
  else if(sh)spec.resource={x:sh.x,z:sh.z};else{const o=outward(p.x,p.z,150);spec.resource={x:o[0],z:o[1]};}
  if(Q.landing&&sh)spec.landing={x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz};
  const lay=()=>{try{return KHAMLET.village(spec);}catch(e){return {error:String(e&&e.message||e)};}};
  let V=lay();
  /* no ground, or no room for its houses: once more at the roomiest dry ground within 1.5 km (moved: `moved` says how far) */
  if(!V||V.error||!V.records){const r=roomiest(p.x,p.z,1500,60);
   if(r){const dx=r.x-p.x,dz=r.z-p.z;spec.site={x:r.x,z:r.z};if(spec.resource&&Q.workers==null&&!sh){const o=outward(r.x,r.z,150);spec.resource={x:o[0],z:o[1]};}
    if(spec.resource&&Q.workers!=null){spec.resource.x+=dx;spec.resource.z+=dz;}
    if(Q.shore||Q.landing){const s2=shore(r.x,r.z);if(s2){spec.resource=Q.workers!=null?spec.resource:{x:s2.x,z:s2.z};if(Q.landing)spec.landing={x:s2.x,z:s2.z,ux:s2.ux,uz:s2.uz};}}
    const W2=lay();if(W2&&!W2.error&&W2.records){V=W2;V.moved=Math.round(Math.hypot(dx,dz));}}}
  villages[p.id]=V;if(!V||V.error||!V.records){skipped.push({id:p.id,why:V&&V.error||'no records'});continue;}
  const kitOf=k=>{const B=DIMS[k];return B?B.kit:null;};
  V.records.forEach(r=>{if(!r)return;const c=Math.cos(r.ry),s=Math.sin(r.ry),hw=r.w/2,hd=r.d/2;let lo=1e9,hi=-1e9;
   for(const q of [[0,0],[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]){const h=natH(r.x+q[0]*c+q[1]*s,r.z-q[0]*s+q[1]*c);lo=Math.min(lo,h);hi=Math.max(hi,h);}
   const kit=r.pending?null:kitOf(r.key);
   lots.push({id:r.id,kit,key:r.key,v:0,x:r.x,z:r.z,y:Math.max(hi,.3),ry:r.ry,w:r.w,d:r.d,h:r.h,drop:Math.max(0,Math.max(hi,.3)-lo)+.3,
    place:p.id,culture:p.culture,role:r.role,cls:'hamlet',pending:!kit,rubble:false,landing:r.role==='landing'});});}
 function register(T){let n=0;for(const L of lots){T.add({id:L.id,class:'building',kind:L.role==='house'?'house':'hamlet',key:L.key,parent:L.place,
  name:L.key+' ('+L.place+')',at:[L.x,L.y,L.z],ry:L.ry,size:[L.w,L.d,L.h],tags:{culture:L.culture==='ancients-salvage'?'post-apoc':L.culture,state:'intact'}});n++;}return n;}
 return {lots,villages,skipped,register,SALVAGE,ground,ruinAt,
  report:{places:Object.keys(villages).length,lots:lots.length,pending:lots.filter(L=>L.pending).length,skipped:skipped.map(s=>s.id),
   moved:Object.fromEntries(Object.keys(villages).filter(k=>villages[k]&&villages[k].moved).map(k=>[k,villages[k].moved]))}};})();
