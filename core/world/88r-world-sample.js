// ================================================================= OPEN WORLD: the countryside sample laid (48v), handed to 88s
// settlements/xanadu/HAMLETS-PLAN.md section 3. A region that sets WORLD_SAMPLE (its src/48-world-site.js) gets its province's
// sample of villages laid once the land is up (a LATE step, before 88s's, which sorts after this file and draws, tags, clears
// and checks every village of WORLD_DATA.sites): the cells of 48v WSAMPLE, each kept or not by its own seed and its farmland,
// refused on the region's places (every site and its villages and camps, the towns' grounds), its roads and its water, then
// laid by core/hamlet and added to the plan as one more site ('sample.<prov>') whose hamlets are the sample. The sim never
// counts them (the owner). window._sample reports; its check (verify.py "the countryside sample") holds: every village off the
// places and roads, laid whole, and the sample's people under the province's bulk (XAN_TUNE provinces' rural). Laid at load,
// not streamed: 88s already draws a village in full only near the camera and as massing beyond.
// [web] only in that it runs on the page's LATE list; the laying is 48v's [G data].
if(typeof WORLD_SAMPLE!=='undefined'&&typeof WSAMPLE!=='undefined')LATE.push(()=>{const t0=performance.now(),R={on:false,prov:WORLD_SAMPLE.prov,cells:0,laid:0,people:0,errors:[],refused:{}};
 try{
  if(typeof KHAMLET==='undefined'||typeof KSITES==='undefined')throw new Error('core/hamlet or KSITES is not on the page');
  const PLAN=WORLD_DATA.sites||(WORLD_DATA.sites={sites:[],errors:[]}),SP=WSAMPLE.cfg(WORLD_SAMPLE,{world:(typeof SITE_SPEC!=='undefined'&&SITE_SPEC.world)||1});
  /* the places: every site, its villages and camps; the towns' grounds */
  const C=SP.clear,avoid=[];
  for(const S of PLAN.sites){avoid.push({x:S.x,z:S.z,r:C.site,why:'a site'});
   for(const V of S.hamlets||[])avoid.push({x:V.site.x,z:V.site.z,r:C.village,why:'a village'});
   for(const K of S.camps||[])avoid.push({x:K.site.x,z:K.site.z,r:C.village,why:'a camp'});}
  for(const T of(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[])if(T.x!=null)avoid.push({x:T.x,z:T.z,r:Math.max(C.site,(T.R||0)+1500),why:'a town'});   /* core/world/bake_towns.py record: its pin, its footprint R */
  const roads=((WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[]).map(r=>r.pts.map(p=>[p[0],p[1]])).concat((PLAN.links||[]).map(L=>L.pts.map(p=>[p[0],p[1]])));
  SP.avoid=avoid;SP.roads=roads;
  /* the cells; the refused ones counted by why */
  const B=WSAMPLE.regionBox(),keep=[];
  for(let i=Math.floor(B[0]/SP.cell);i<=Math.floor(B[2]/SP.cell);i++)for(let j=Math.floor(B[1]/SP.cell);j<=Math.floor(B[3]/SP.cell);j++){R.cells++;const c=WSAMPLE.at(SP,i,j);if(!c)continue;
   const w=WSAMPLE.why(SP,c);if(w){R.refused[w]=(R.refused[w]|0)+1;continue;}keep.push(c);}
  /* laid by core/hamlet on the Xanadu kit's boxes (XAK, as 88s and the bake read them) */
  const KD=typeof XAK!=='undefined'?XAK.dims():{},kit={dims:(k,v)=>{const D=KD[k];return D?{w:D.w,d:D.d,h:D.h}:null;}};
  const hamlets=[];for(const c of keep){const V=WSAMPLE.lay(SP,c,kit);if(V.error){R.errors.push(c.id+': '+V.error);if(!V.records)continue;}hamlets.push(V);R.people+=V.census?V.census.pop:0;}
  R.laid=hamlets.length;R.villages=hamlets.map(V=>({id:V.id,focus:V.focus,x:V.site.x,z:V.site.z,pop:V.census.pop,records:V.records.length,error:V.error}));
  const M=WORLD_DATA.meta,c0=[0,0];
  PLAN.sites.push({id:'sample.'+SP.prov,name:'the countryside of '+SP.prov,x:c0[0],z:c0[1],sample:true,camps:[],hamlets,roads:[]});
  /* the province's bulk (the tune's rural people): the sample stays under it */
  const P=typeof XAN_TUNE!=='undefined'&&XAN_TUNE.provinces&&XAN_TUNE.provinces.find(p=>p.id===SP.prov);R.bulk=P?P.rural:(WORLD_SAMPLE.bulk==null?null:WORLD_SAMPLE.bulk);   /* the spec's own (the tune's number) where the page has no tune */
  R.avoid=avoid.length;R.roads=roads.length;R.on=true;
 }catch(e){R.errors.push(String(e&&e.stack||e));}
 R.ms=Math.round(performance.now()-t0);window._sample=R;
 /* the check verify.py reads: the sample laid, every village whole and off the places and the roads, its people under the bulk */
 R.check=function(neg){const bad=[],S=WSAMPLE.cfg(WORLD_SAMPLE,{world:(typeof SITE_SPEC!=='undefined'&&SITE_SPEC.world)||1}),Q=WORLD_DATA.sites;
  const site=Q.sites.find(s=>s.id==='sample.'+R.prov),H=site?site.hamlets:[];
  S.avoid=[];for(const s of Q.sites){if(s.sample)continue;S.avoid.push({x:s.x,z:s.z,r:S.clear.site*.9,why:'a site'});for(const V of s.hamlets||[])S.avoid.push({x:V.site.x,z:V.site.z,r:S.clear.village*.9,why:'a village'});}
  for(const V of H){const p=neg?{x:Q.sites[0].x,z:Q.sites[0].z}:V.site,w=WSAMPLE.why(S,p);if(w)bad.push(V.id+' on '+w);if(V.error)bad.push(V.id+': '+V.error);}
  if(R.bulk!=null&&R.people>R.bulk)bad.push('the sample\'s '+R.people+' people over the province\'s '+R.bulk);
  return{ok:R.on&&H.length>0&&!bad.length,detail:R.on?(H.length+' villages of '+R.cells+' cells ('+JSON.stringify(R.refused)+' refused), '+R.people+' people (the province\'s bulk '+R.bulk+')'+(bad.length?'; '+bad.slice(0,4).join('; '):'')):R.errors.join('; ')};};});
