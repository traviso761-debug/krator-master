// ---------------------------------------------------------------- probe (window._api): everything a headless check needs
window._api={REG,DEFS,CULT,SOCK_ALL,SITES,ROWS,
 // footprint: measured world-space bbox of each placed site against its declared w x d (rec.decl: the def, or its o.size variant; a site turned a quarter swaps w and d)
 footprints(){return REG.map(r=>{const D0=r.decl||DEFS[r.key];const q=Math.abs(Math.sin(r.ry||0))>.7;const D=q?Object.assign({},D0,{w:D0.d,d:D0.w}):D0;   /* a quarter-turned site (a compound slot) swaps w and d */const bw=r.bbox.mx[0]-r.bbox.mn[0],bd=r.bbox.mx[2]-r.bbox.mn[2],bh=r.bbox.mx[1]-r.bbox.mn[1];
  const cx=(r.bbox.mx[0]+r.bbox.mn[0])/2-r.x,cz=(r.bbox.mx[2]+r.bbox.mn[2])/2-r.z;
  const ex=Math.max(0,bw-D.w),ez=Math.max(0,bd-D.d),eh=Math.max(0,bh-D.h);return {key:r.key,name:r.name,w:D.w,d:D.d,h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+ex.toFixed(2),ez:+ez.toFixed(2),eh:+eh.toFixed(2),cx:+cx.toFixed(2),cz:+cz.toFixed(2),tris:r.tris,size:r.size,budget:D.budget};});},
 socketCounts(){const o={};for(const s of SOCK_ALL){(o[s.key]||(o[s.key]={}))[s.type]=((o[s.key]||{})[s.type]||0)+1;}return o;},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 setCulture(k){buildWorld(k);},
 setNight(v){nightSet(v);},
 doors(){return REG.map(r=>({key:r.key,front:r.front,doorCount:r.doorCount}));},
 // collision and path data (36-def.js): colliders(i) = REG[i].coll; colliders() = per-building counts. nav() = the scene's nav grid summary + doors;
 // navGrid() = the live grid object (at(x,z), levels, flags); showNav(on) draws it (green reachable, orange cut off, red blocked, cyan door / approach)
 colliders(i){if(i!==undefined)return REG[i]&&REG[i].coll;return REG.map((r,i)=>({i,key:r.key,solids:r.coll.solids.length,floors:r.coll.floors.length,ramps:r.coll.ramps.length,links:r.coll.links.length,water:r.coll.water.length}));},
 nav(opt){const N=navGet(opt);return Object.assign(N.summary(),{doorList:N.doors});},
 navGrid(opt){return navGet(opt);},
 navAt(x,z){return navGet().at(x,z);},
 showNav(on){const old=scene.getObjectByName('navViz');if(old){scene.remove(old);old.geometry.dispose();}if(on===false)return 0;const N=navGet();const P=[],Cc=[],h=N.cell*.46;
  const col=(v,k,li)=>(N.flag[k]?[0,.9,1]:v.b?[.85,.15,.1]:N.reach[k*N.opt.maxLv+li]?[.2,.75,.3]:[1,.55,.1]);
  for(let k=0;k<N.levels.length;k++){const L=N.levels[k];if(!L)continue;const cx=N.x0+(k%N.nx+.5)*N.cell,cz=N.z0+(((k/N.nx)|0)+.5)*N.cell;
   L.forEach((v,li)=>{const y=v.h+.06,c=col(v,k,li);for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]]){P.push(cx+a*h,y,cz+b*h);Cc.push(...c);}});}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.name='navViz';m.renderOrder=8;m.userData.probeSkip=true;scene.add(m);return P.length/18;},
 frontOf,placeFacing,
 plants(){const by={};for(const p of PLANTS.list){const k=(p.key||'?')+' '+p.kind;by[k]=(by[k]||0)+1;}return {total:PLANTS.list.length,by};},
 tags(){return REG.map(r=>({key:r.key,cls:r.cls,tags:r.tags}));},
 kitCoverage(){const placed=new Set(REG.map(r=>r.key));return Object.keys(DEFS).filter(k=>!placed.has(k));}};
