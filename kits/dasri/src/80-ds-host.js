// ================================================================= DASRI HOST API: DASRI / DS ([draw])
// Consumed both by the kit sheet's cliffside compositions (91z-ds-sheet.js) and by external settlements/openworld builds
// through dasri_bundle.py (`var DASRI = ...; var DS = DASRI;`).
//   DASRI.draw(V, o)     draws V.records [{key, x, z, ry?, y?, cliff?, v?, lo?}] onto o.scene using dsCliffSeat(r, B, o.ground)
//   DASRI.proto(key, o)  draws one def dry at the origin into its own THREE.Group (used by verify.py to audit cliff & variant modes)
//   DASRI.dims(key)      returns {w, d, h} from DS_BOX
//   DASRI.BOX            DS_BOX metadata table
//   DASRI.ROWS           DS_HAMLET_ROWS (dasri_village, dasri_oasis) for core/hamlet
//   DASRI.check          reusable geometry & cliff-lock invariant checks (with negative-test support)

function dsDrawInto(o,fn){
 o=o||{};
 const T={},keep={
  GB,GTARGET,CMS:CMS.slice(),CM,dry:PLACE_DRY,rec:CURREC,key:CURKEY,
  doors:DOORS_CUR,win:WINDOWS_CUR,cut:CUTC,sbs:SBS.slice(),sb:SB
 };
 GB=T;GTARGET=T;resetCM();PLACE_DRY=1;CURREC=null;CURKEY=null;DOORS_CUR=null;WINDOWS_CUR=null;
 SBS.length=0;SB=null;
 const t0=GSTAT.tris,h0=HALOS.length,s0=SMOKES.length;
 let recs=[];
 try{recs=fn();}catch(err){reportErr('DASRI.draw: '+(err.stack||err));}
 finally{
  GB=keep.GB;GTARGET=keep.GTARGET;CMS.length=0;keep.CMS.forEach(m=>CMS.push(m));CM=keep.CM;
  PLACE_DRY=keep.dry;CURREC=keep.rec;CURKEY=keep.key;DOORS_CUR=keep.doors;WINDOWS_CUR=keep.win;CUTC=keep.cut;
  SBS.length=0;keep.sbs.forEach(b=>SBS.push(b));SB=keep.sb;
 }
 const G=new THREE.Group();G.name=o.name||'dasri';
 flushBuckets(T,G,o.shadow!==false);
 if(typeof DS_FURN_PENDING!=='undefined'&&DS_FURN_PENDING.length){
  const FB=KratorFurniture.batch({indexed:true});
  for(const p of DS_FURN_PENDING)FB.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.v,setting:p.setting||'indoor'});
  const fg=FB.flush(G);fg.userData.furniture=true;
  fg.traverse(m=>{
   const c=m.geometry&&m.geometry.attributes.color;if(!c)return;
   const A=c.array;
   for(let i=0;i<A.length;i++){const v=A[i];A[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}
   c.needsUpdate=true;
  });
  G.userData.furniture=DS_FURN_PENDING.length;DS_FURN_PENDING.length=0;
 }
 const out=G.children.slice();
 out.forEach(m=>{m.userData.host=true;m.userData.inspectLabel=o.label||'Dasri settlement';});
 if(out.length&&o.probe!==false)out[0].userData.probePoints=[].concat(...recs.filter(Boolean).map(r=>[r.x,r.y+1.2,r.z]));
 if(o.scene)o.scene.add(G);
 out.group=G;out.recs=recs.filter(Boolean);out.tris=Math.round(GSTAT.tris-t0);
 out.lights=HALOS.slice(h0);out.smokes=SMOKES.slice(s0);
 return out;
}

const DASRI={
 id:'dasri',
 culture:'dasri',
 BOX:DS_BOX,
 ROWS:DS_HAMLET_ROWS,
 dims:dsDims,
 stepPlan:dsStepPlan,
 cliffSeat:dsCliffSeat,
 draw(V,o){
  o=o||{};
  const G=o.ground||terrainH,seed=o.seed==null?8810:o.seed,missing={},recs=(V&&V.records)||[];
  const out=dsDrawInto(o,()=>recs.map((r,i)=>{
   if(!DEFS[r.key]){missing[r.key]=(missing[r.key]==null?0:missing[r.key])+1;return null;}
   const B=DS_BOX[r.key]||{w:DEFS[r.key].w,d:DEFS[r.key].d,h:DEFS[r.key].h};
   const S=dsCliffSeat(r,B,G,o);
   const v=r.v!=null?r.v|0:(o.v!=null?o.v|0:KRAND.hash(seed,i,0x6d5)%2);
   const lo=r.lo!=null?r.lo:S.lo;
   const rec=place(r.key,r.x,r.z,r.ry==null?0:r.ry,{
    y:S.y,lo,gl:S.gl,cliff:S.cliff,v,shibam:r.shibam
   });
   if(rec){
    rec.id=r.id||('ds:'+i);
    rec.seat=S;
   }
   return rec;
  }));
  out.missing=missing;
  return out;
 },
 proto(key,o){
  o=o||{};
  return dsDrawInto({name:key,probe:false,label:DEFS[key]?DEFS[key].name:key},()=>[
   place(key,0,0,0,Object.assign({y:0},o))
  ]);
 },
 check:{
  /* Verifies every record stays within declared w, d, and height above floor y */
  box(recs,tol){
   tol=tol==null?.9:tol;
   const bad=[],rows=[];
   for(const r of recs){
    const B=DS_BOX[r.key]||(DEFS[r.key]&&{w:DEFS[r.key].w,d:DEFS[r.key].d,h:DEFS[r.key].h});
    if(!B||!r.bbox)continue;
    const b=r.bbox,bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-r.y;
    const over=bw>B.w+tol||bd>B.d+tol||bh>B.h+tol;
    const s=r.key+' '+bw.toFixed(2)+'x'+bd.toFixed(2)+'x'+bh.toFixed(2)+' vs '+B.w+'x'+B.d+'x'+B.h;
    rows.push(s);
    if(over)bad.push(s);
   }
   return {ok:!bad.length&&rows.length>0,bad,rows};
  },
  /* Verifies cliff-locked records:
     1. Zero rear overhang past -d/2 - tolRear in local coordinates (when ry == 0, b.mn[2] >= r.z - B.d/2 - tolRear)
     2. Stone cliffSkirt reaches at or below the lowest ledge corner S.low (zero floating foundations!) */
  cliff(recs,tolRear){
   tolRear=tolRear==null?.14:tolRear;
   const bad=[];
   for(const r of recs){
    const B=DS_BOX[r.key];if(!B||!r.bbox)continue;
    if(!r.ds||!r.ds.cliff){bad.push(r.key+' missing ds.cliff flag');continue;}
    /* Check rear plane on ry=0 prototypes or axis-aligned cliff sites */
    if(Math.abs(r.ry||0)<1e-3){
     const rearMin=r.z-B.d/2-tolRear;
     if(r.bbox.mn[2]<rearMin){
      bad.push(r.key+' rear protrudes to '+(r.bbox.mn[2]-r.z).toFixed(2)+' past '+(-B.d/2).toFixed(2));
     }
    }
    if(r.seat&&r.bbox.mn[1]>r.seat.low+.05){
     bad.push(r.key+' floats: foot '+r.bbox.mn[1].toFixed(2)+' above ledge low '+r.seat.low.toFixed(2));
    }
    if((r.ds.skirtDepth||0)<3.5){
     bad.push(r.key+' shallow cliff skirt '+(r.ds.skirtDepth||0).toFixed(2));
    }
   }
   return {ok:!bad.length&&recs.length>0,bad,count:recs.length};
  }
 }
};
const DS=DASRI;
