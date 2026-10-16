// ================================================================= PROBE (window._api): everything a headless check needs
window._api={REG,DEFS,SITES,NR,
 /* the measured world-space box of each placed def against its declared w x d x h (deck buildings: hull-levelled boxes) */
 footprints(){return REG.filter(r=>r.cls==='building').map(r=>{const D=r.decl,b=r.bbox;const bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-b.mn[1];
  return {key:r.key,name:r.name,w:D.w,d:D.d,h:D.h,bh:+bh.toFixed(2),eh:+Math.max(0,bh-D.h).toFixed(2),tris:r.tris,budget:D.budget,top:!r.parent};});},
 nanSweep(list){let bad=0;const L=[];WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;L.push((m.name||'')+' '+(m.userData.mk||m.userData.template||'')+' @'+Math.floor(i/3)+'/'+a.length/3);break;}}});return list?L:bad;},
 doors(){return REG.filter(r=>r.cls==='building').map(r=>({key:r.key,cls:r.cls,front:r.front,doorCount:r.doorCount}));},
 kitCoverage(){const placed=new Set(REG.map(r=>r.key));return Object.keys(DEFS).filter(k=>!placed.has(k));},
 furniture(all){const s=SVF.summary();const out={placed:s.placed,keys:s.keys,missing:s.missing,tris:Math.round(SVF.batch.tris),lights:SVF.lightCount,
  byRoomKind:(window._interiors&&window._interiors.byKind)||null};if(all)out.records=SVF.placed;return out;},
 interiors(){return window._interiors||null;},
 tags(){return {audit:SVTAGS.audit(),records:SVTAGS.export().records.length};},
 tagExport(){return SVTAGS.export();},
 materials(){return window._materials;},
 faction(){return NR_FACTION;},
 setNight(v){nightSet(v);},
 setCut(v){cutSet(v);},
 setView(...v){setView(...v);}};
