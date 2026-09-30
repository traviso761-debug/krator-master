// ---------------------------------------------------------------- probe (window._api): everything a headless check needs
window._api={REG,DEFS,CULT,SOCK_ALL,SITES,ROWS,
 // footprint: measured world-space bbox of each placed site against its declared w x d (sites with ry 0; sub-buildings excluded by key check)
 footprints(){return REG.map(r=>{const D=DEFS[r.key];const bw=r.bbox.mx[0]-r.bbox.mn[0],bd=r.bbox.mx[2]-r.bbox.mn[2],bh=r.bbox.mx[1]-r.bbox.mn[1];
  const cx=(r.bbox.mx[0]+r.bbox.mn[0])/2-r.x,cz=(r.bbox.mx[2]+r.bbox.mn[2])/2-r.z;
  const ex=Math.max(0,bw-D.w),ez=Math.max(0,bd-D.d),eh=Math.max(0,bh-D.h);return {key:r.key,name:r.name,w:D.w,d:D.d,h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+ex.toFixed(2),ez:+ez.toFixed(2),eh:+eh.toFixed(2),cx:+cx.toFixed(2),cz:+cz.toFixed(2),tris:r.tris};});},
 socketCounts(){const o={};for(const s of SOCK_ALL){(o[s.key]||(o[s.key]={}))[s.type]=((o[s.key]||{})[s.type]||0)+1;}return o;},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 setCulture(k){buildWorld(k);},
 setNight(v){nightSet(v);},
 doors(){return REG.map(r=>({key:r.key,front:r.front,doorCount:r.doorCount}));},
 frontOf,placeFacing,
 plants(){const by={};for(const p of PLANTS.list){const k=(p.key||'?')+' '+p.kind;by[k]=(by[k]||0)+1;}return {total:PLANTS.list.length,by};},
 tags(){return REG.map(r=>({key:r.key,cls:r.cls,tags:r.tags}));},
 kitCoverage(){const placed=new Set(REG.map(r=>r.key));return Object.keys(DEFS).filter(k=>!placed.has(k));}};
