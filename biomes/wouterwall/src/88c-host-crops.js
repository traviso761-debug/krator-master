// ================================================================= HOST — the terraces' crops (kits/crops, read in place; PLAN.md section 4)
// The Hayrant's terraced fields (44s: SITE.terraces' patches, each a KRELIEF.terraces record; its at() names each field 'level:i,j'), each
// field one crop of the rotation (SITE.crops: the made-up loess crops, kits/crops' wouterwall records, 2026-11-10), drawn by the kit
// (60: WOW.buildCrops) as a card every SITE.crops.step m on the field's treads. The rotation is a seeded draw per field (KRAND.hash of the
// patch and the field id), so the same field grows the same crop on every machine. Each crop must fit the crops kit's terrace zone
// (CROPS.forBiome('wouterwall'): rain-fed, irrigated or wild there), else it is left out and the check says so. ?crops=0 none.
function cropRotation(){const R=SITE.crops&&SITE.crops.rotation;if(!R||typeof CROPS==='undefined')return [];
 const fit=new Set(CROPS.forBiome('wouterwall').filter(r=>r.zone==='terrace').map(r=>r.crop.id));
 return R.filter(e=>e[0]==='fallow'||fit.has(e[0]));}
function cropFieldOf(i,field){const R=cropRotation(),tot=R.reduce((a,e)=>a+e[1],0);if(!tot)return 'fallow';
 let u=KRAND.unit(KRAND.hash(SITE.seed,0xF1E1D,i,KRAND.hash(...field.split(/[:,]/).map(v=>+v+4096))))*tot;for(const e of R){u-=e[1];if(u<0)return e[0];}return R[R.length-1][0];}
function growCrops(){const Q=new URLSearchParams(location.search);if(Q.get('crops')==='0'||!SITE.crops||!SITE_RECS||!SITE_RECS.terr||!WOW.buildCrops)return null;
 const st=SITE.crops.step==null?2.4:SITE.crops.step,fields={};
 BIO.cur='wouterwall/crops';
 const out=WOW.buildCrops({fields:fn=>{SITE_RECS.terr.forEach((T,i)=>{const c=T.zone.c,r=T.zone.r;
   for(let z=c[1]-r;z<=c[1]+r;z+=st)for(let x=c[0]-r;x<=c[0]+r;x+=st){const jx=x+(KRAND.unit(KRAND.hash(SITE.seed,0xC41,Math.round(x*2),Math.round(z*2)))-.5)*st*.5;
    const P=sitePoint(jx,z);if(!P.terrace||P.part!=='tread'||P.rec!=='terr')continue;const A=KRELIEF.at(T,jx,z,P.g2);if(!A||A.part!=='tread'||A.w<.8)continue;
    const F=WOW.FIELDS(jx,z);if(F.water||F.g>.45||!BIO.clearOf(jx,z,.3))continue;
    const key=i+'|'+A.field,id=fields[key]||(fields[key]=cropFieldOf(i,A.field));if(id==='fallow')continue;fn(jx,terrainH(jx,z),z,id);}});}});
 BIO.cur=null;const ids=Object.values(fields);out.fields=ids.length;out.fallow=ids.filter(v=>v==='fallow').length;out.rotation=cropRotation().map(e=>e[0]);
 WOW.FIELD_CROPS=fields;return out;}
