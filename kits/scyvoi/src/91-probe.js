// ================================================================= PROBE (window._api): everything a headless check needs
window._api={REG,DEFS,SITES,ROWS,SV_LIFE,
 // the measured world-space box of each top-level site against its declared w x d x h
 footprints(){return REG.filter(r=>!r.parent).map(r=>{const D=r.decl,b=r.bbox;const bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-b.mn[1];
  return {key:r.key,name:r.name,w:D.w,d:D.d,h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+Math.max(0,bw-D.w).toFixed(2),ez:+Math.max(0,bd-D.d).toFixed(2),eh:+Math.max(0,bh-D.h).toFixed(2),tris:r.tris,budget:D.budget};});},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 doors(){return REG.filter(r=>!r.parent).map(r=>({key:r.key,cls:r.cls,front:r.front,doorCount:r.doorCount}));},
 kitCoverage(){const placed=new Set(REG.map(r=>r.key));return Object.keys(DEFS).filter(k=>!placed.has(k));},
 furniture(all){const s=SVF.summary();const out={placed:s.placed,keys:s.keys,missing:s.missing,tris:Math.round(SVF.batch.tris),
  perSite:REG.filter(r=>!r.parent).map(r=>({key:r.key,pieces:r.furniture.length+r.children.reduce((a,c)=>a+c.furniture.length,0)}))};if(all)out.records=SVF.placed;return out;},
 tags(){return {audit:SVTAGS.audit(),records:SVTAGS.export().records.length};},
 tagExport(){return SVTAGS.export();},
 materials(){return window._materials;},
 life(){return SV_LIFE;},
 setNight(v){nightSet(v);},
 setCut(v){cutSet(v);},
 setView(...v){setView(...v);}};
