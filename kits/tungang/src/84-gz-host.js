// ================================================================= THE GLAZIERS' SET'S HOST API: TG.gz.draw, TG.gz.carve and their kin (API.md)
// What a world calls to lay a Glazier hold on its own scarp: it carves the rock from the void plans (TG.gz.carve into its own
// KCAVERN, or reads TG.gz.voids for another carver), registers its sites in core/tags, then draws the fronts and the rooms'
// fittings (TG.gz.draw: DRY into buckets of its own, as TG.fg.draw; the lamps come back as light records). The same code runs on
// the kit's sheet (the rows' rock and the sample scarp, 91z-gz-sheet.js) and in the sealed bundle (tungang_bundle.py: TG).
//   TG.gz.draw(sites, o)    sites [{key, x, y, z, ry, v?, state?, id?}] (the FRONT's foot on the face, the front toward +z
//                           turned by ry); o {scene, seed, state, label}: each site's def drawn there; returns the meshes with
//                           .group, .recs, .missing (keys the kit lacks), .tris, .lights (TG.gz.LIGHTS: core/cavelight's shape),
//                           .smokes, .furniture (in a bundle with furniture=True)
//   TG.gz.voids(sites, o)   every site's void plan in the world frame, as KCAVERN primitives ({prim 'room' | 'stair', id, owner,
//                           poly, y, h, ceil, rise, r, finish | a, b, w, h}) and the doorways through the face ({door: {c, y, r, h}})
//   TG.gz.carve(C, sites)   the same into a world's KCAVERN (C.room, C.stair, C.opening kind 'door'), before C.build(); returns
//                           the primitives added
//   TG.gz.proto(key, o)     one def alone at the origin (dry, its own group): o {v, state}
//   TG.gz.dims(key)         a key's box {w, d, h, out}; TG.gz.BOX the boxes; TG.gz.plan(key, o) a def's void plan (the one source)
//   TG.gz.check             the checks verify.py runs, for a world's --assert too: box(recs), plans(), lights(draw), carved(C, sites)
TG.gz.dims=k=>TG.gz.BOX[k]?{w:TG.gz.BOX[k].w,d:TG.gz.BOX[k].d,h:TG.gz.BOX[k].h,out:TG.gz.BOX[k].out}:null;
TG.gz.draw=function(sites,o){o=o||{};const missing={};TG.gz.LIGHTS=[];GZ_COLLECT=1;let out;
 try{out=fgDrawInto(Object.assign({name:'glazier',label:o.label||'A Glazier hold'},o,{scene:null}),()=>(sites||[]).map((r,i)=>{
  if(!DEFS[r.key]||!TG.gz.BOX[r.key]){missing[r.key]=(missing[r.key]==null?0:missing[r.key])+1;return null;}
  /* a site's look varies by a hash of the world seed and its index (core/rand), never by what was drawn before it */
  const v=r.v!=null?r.v|0:KRAND.hash(o.seed==null?9400:o.seed,i,0x6a1)%97;
  const rec=place(r.key,r.x,r.z,r.ry==null?0:r.ry,{y:r.y==null?0:r.y,v,state:r.state||o.state});if(rec){rec.id=r.id;rec.site=r;}return rec;}));}
 finally{GZ_COLLECT=0;}
 out.lights=TG.gz.LIGHTS.slice();out.missing=missing;if(o.scene)o.scene.add(out.group);return out;};
TG.gz.voids=function(sites,o){o=o||{};const out=[];(sites||[]).forEach((s,i)=>{const v=s.v!=null?s.v|0:KRAND.hash(o.seed==null?9400:o.seed,i,0x6a1)%97,PL=TG.gz.plan(s.key,{v,state:s.state});if(!PL)return;
 const site=Object.assign({},s,{id:s.id||(s.key+'@'+i)}),W=gzWorldVoids(PL,site);
 /* the doorways through the face: each pass that reaches past z 0 opens on the air there */
 const c=Math.cos((s.ry==null?0:s.ry)),sn=Math.sin((s.ry==null?0:s.ry));PL.voids.forEach((V,j)=>{if(V.kind!=='room')return;const zmax=V.z+V.d/2;if(zmax<=.05)return;
  W[j].door={c:[+(s.x+V.x*c).toFixed(4),+(s.z-V.x*sn).toFixed(4)],y:((s.y==null?0:s.y))+V.y,r:Math.max(V.w,.6)/2+.2,h:V.h};});
 out.push(...W);});return out;};
TG.gz.carve=function(C,sites,o){const P=TG.gz.voids(sites,o);P.forEach(p=>{if(p.prim==='stair')C.stair({id:p.id,owner:p.owner,a:p.a,b:p.b,w:p.w,h:p.h});
 else{C.room({id:p.id,owner:p.owner,poly:p.poly,y:p.y,h:p.h,ceil:p.ceil,rise:p.rise,r:p.r,finish:p.finish});if(p.door)C.opening({id:p.id+':door',kind:'door',c:p.door.c,y:p.door.y,r:p.door.r,h:p.door.h});}});return P;};
TG.gz.proto=function(key,o){TG.gz.LIGHTS=[];GZ_COLLECT=1;try{const out=fgDrawInto({name:key,probe:false,label:DEFS[key]?DEFS[key].name:key},()=>[place(key,0,0,0,Object.assign({y:0},o||{}))]);out.lights=TG.gz.LIGHTS.slice();return out;}
 finally{GZ_COLLECT=0;}};
/* ---------------------------------------------------------------- the checks (verify.py --assert; a world's too) */
TG.gz.check={
 /* every drawn record's measured box against its key's (a record at ry 0): x within +-w/2, z within [out - d, out], y within h, each
    by tol; and filling fill.w of w, fill.h of h, fill.d of d (the box is an upper bound: the tiers and the seeds vary) */
 box(recs,tol,fill){tol=tol==null?.5:tol;fill=fill||{w:.6,d:.45,h:.6};const bad=[],rows=[];for(const r of recs){const B=TG.gz.BOX[r.key];if(!B||!r.bbox)continue;
  const b=r.bbox,x0=b.mn[0]-r.x,x1=b.mx[0]-r.x,z0=b.mn[2]-r.z,z1=b.mx[2]-r.z,bh=b.mx[1]-r.y,bw=x1-x0,bd=z1-z0;
  const over=x0<-B.w/2-tol||x1>B.w/2+tol||z1>B.out+tol||z0<B.out-B.d-tol||bh>B.h+tol,under=bw<B.w*fill.w||bh<B.h*fill.h||bd<B.d*fill.d;
  const s=r.key+'#'+r.v+' x '+x0.toFixed(1)+'..'+x1.toFixed(1)+' z '+z0.toFixed(1)+'..'+z1.toFixed(1)+' h '+bh.toFixed(1);rows.push(s);
  if(over||under)bad.push(s+(over?' past ':' under ')+B.w+'x'+B.d+'x'+B.h+' (out '+B.out+')');}
  return {ok:!bad.length&&rows.length>0,bad,rows};},
 /* every def's plan for seeds 0-7: each void inside its box (x within +-w/2, z within [out - d, out + .5], its crown under h), and
    every two rooms that are not joined by a passage kept apart by rock (minRock m) where their heights overlap */
 plans(minRock){minRock=minRock==null?.6:minRock;const bad=[];let n=0;
  for(const key in TG.gz.PLANS){const B=TG.gz.BOX[key];if(!B){bad.push(key+': no box');continue;}
   for(let v=0;v<8;v++){const PL=TG.gz.plan(key,{v}),R=PL.voids.filter(V=>V.kind==='room');n+=PL.voids.length;
    for(const V of PL.voids){const xs=V.kind==='stair'?[V.a[0],V.b[0]]:[V.x-V.w/2,V.x+V.w/2],zs=V.kind==='stair'?[V.a[2],V.b[2]]:[V.z-V.d/2,V.z+V.d/2],top=V.kind==='stair'?Math.max(V.a[1],V.b[1])+V.h:V.y+V.h+((V.rise==null?0:V.rise));
     if(Math.min(...xs)<-B.w/2-.01||Math.max(...xs)>B.w/2+.01||Math.min(...zs)<B.out-B.d-.01||Math.max(...zs)>B.out+.51||top>B.h+.01)bad.push(key+'#'+v+' '+V.id+' outside its box');}
    const rooms=R.filter(V=>!V.pass&&!V.join);for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++){const a=rooms[i],b=rooms[j];
     if(a.y+a.h+((a.rise==null?0:a.rise))<=b.y||b.y+b.h+((b.rise==null?0:b.rise))<=a.y)continue;
     const gx=Math.max(a.x-a.w/2,b.x-b.w/2)-Math.min(a.x+a.w/2,b.x+b.w/2),gz=Math.max(a.z-a.d/2,b.z-b.d/2)-Math.min(a.z+a.d/2,b.z+b.d/2);
     if(Math.max(gx,gz)<minRock)bad.push(key+'#'+v+' '+a.id+' and '+b.id+' '+Math.max(gx,gz).toFixed(2)+' m apart');}}}
  return {ok:!bad.length&&n>0,bad,voids:n};},
 /* the lamps by state: a kept draw lights every lamp it hangs, an abandoned one none */
 lights(draw){const L=draw&&draw.lights||[];return {n:L.length,kinds:[...new Set(L.map(l=>l.kind))]};},
 /* the rock was carved from the plans: at each site's first room the cavern is open (sdf > 0) at the room's centre and solid
    (sdf < 0) half a metre behind its back wall */
 carved(C,sites){const bad=[];let n=0;for(const s of sites){const PL=TG.gz.plan(s.key,{v:s.v|0});if(!PL)continue;const V=PL.voids.find(q=>q.kind==='room'&&!q.pass&&!q.noFloor);if(!V)continue;
  const c=Math.cos((s.ry==null?0:s.ry)),sn=Math.sin((s.ry==null?0:s.ry)),X=(lx,lz)=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c],y=((s.y==null?0:s.y))+V.y+1,inn=X(V.x,V.z);n++;
  /* behind the back wall at its two ends and its middle: a passage may lead on from one of them, never from all three */
  const a=C.sdf(inn[0],y,inn[1]),b=Math.min(...[-1,0,1].map(k=>{const q=X(V.x+k*(V.w/2-.35),V.z-V.d/2-.45);return C.sdf(q[0],y,q[1]);}));
  if(!(a>0)||!(b<0))bad.push((s.id||s.key)+': open '+a.toFixed(2)+', behind '+b.toFixed(2));}
  return {ok:!bad.length&&n>0,bad,n};}};
