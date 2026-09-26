// ---------- wireframe: the model as a drawing of itself ----------
// Iziz has had this since the beginning and it is the most useful thing on that page: every surface drawn as
// its own edges, over the solid, or instead of it. You can see what a building actually is, where the
// triangles went, which bits are one mesh and which are a thousand, and how much of what you are looking at
// is geometry and how much is a texture pretending.
//
// This is the shared version, used by the engine (every OSM city) and by the habitat page, which has no
// engine. It is built the first time it is switched on, because for a city like Chicago that is two million
// triangles' worth of edges and there is no reason to pay for it unless it is asked for.
//
// Three modes, and three ways of showing what is behind:
//
//   off / edges / triangles        the mesh's own edges, or every triangle in it
//   solid / hidden / xray          the solid under the wire, the solid drawn but invisible so it still hides
//                                  what is behind it (a hidden-line drawing), or no solid at all
//
// The trick for "hidden" and "xray" is one pair of material flags rather than layers: colorWrite off with
// depthWrite on gives a solid that occludes and does not draw, which is exactly a hidden-line view.

const CAT={ground:0x6f8f5a,water:0x3d8fd0,road:0xb0a894,building:0xe8a85a,
           landmark:0xf2d9a8,veg:0x62d68a,life:0xff7ab8,light:0xffe36a,structure:0xcfd4da};

export function createWire(opts){
  const {THREE,scene,animHooks}=opts;
  const mats={};
  for(const k in CAT)mats[k]=new THREE.MeshBasicMaterial({color:CAT[k],wireframe:true,toneMapped:false});
  const S={mode:'off',under:'solid',built:false,items:[],inst:[],solids:new Set(),n:0};

  // An edge geometry drawn with a wireframe material would draw each edge twice over; three.js wants
  // triangles, so every edge becomes a degenerate one (a, b, b) and the wireframe pass draws the one side
  // of it that has any length. Cached per source geometry: a city has one window box and 80,000 copies.
  const cache=new Map();
  function edgeGeo(g){
    if(cache.has(g.uuid))return cache.get(g.uuid);
    let out=null;
    // Edges on a merged tile of a million triangles cost more than they are worth, and at that size the
    // difference between edges and triangles is invisible anyway - so those fall back to their own geometry.
    const heavy=(g.attributes.position?g.attributes.position.count:0)>40000;
    if(!heavy){
      const eg=new THREE.EdgesGeometry(g,22),a=eg.attributes.position.array;
      if(a.length){const arr=new Float32Array(a.length/6*9);
        for(let i=0,j=0;i<a.length;i+=6,j+=9){
          arr[j]=a[i];arr[j+1]=a[i+1];arr[j+2]=a[i+2];
          arr[j+3]=a[i+3];arr[j+4]=a[i+4];arr[j+5]=a[i+5];
          arr[j+6]=a[i+3];arr[j+7]=a[i+4];arr[j+8]=a[i+5];}
        out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(arr,3));}
      eg.dispose();
    }
    cache.set(g.uuid,out);return out;
  }

  // what colour a thing is drawn in: whatever the page tagged it, or a guess from what it is made of
  function catOf(o){
    for(let q=o;q;q=q.parent)if(q.userData&&q.userData.wireCat)return q.userData.wireCat;
    const m=o.material;
    if(m&&m.isMeshBasicMaterial)return 'light';
    const n=(o.name||'').toLowerCase();
    if(/terrain|ground|land/.test(n))return 'ground';
    if(/water|river|lake|sea/.test(n))return 'water';
    if(/street|road|walk|trail|bridge|rail|deck/.test(n))return 'road';
    if(/tree|wood|veg/.test(n))return 'veg';
    return 'structure';
  }

  function build(){
    const list=[];
    scene.traverse(o=>{
      if(!o.isMesh&&!o.isInstancedMesh)return;
      if(o.userData.isWire||o.userData.noWire)return;
      // A mesh with geometry groups carries an array of materials (a sign: one face printed, five plain).
      const mm=Array.isArray(o.material)?o.material:[o.material];
      // Glows, beams, smoke, cloud and spray are not geometry - they are a way of drawing air - and the
      // signature they all share is that they do not write depth. Wireframing them fills the drawing
      // with spheres that are not there.
      if(mm.every(m=>m&&(m.blending===THREE.AdditiveBlending||(m.transparent&&m.depthWrite===false))))return;
      if(o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)list.push(o);
    });
    for(const o of list){
      const cat=catOf(o),eg=edgeGeo(o.geometry)||o.geometry;
      let w;
      if(o.isInstancedMesh){
        w=new THREE.InstancedMesh(eg,mats[cat]||mats.structure,o.instanceMatrix.count||o.count);
        w.instanceMatrix=o.instanceMatrix;w.count=o.count;w.frustumCulled=false;S.inst.push([w,o]);
      }else{
        w=new THREE.Mesh(eg,mats[cat]||mats.structure);w.frustumCulled=o.frustumCulled;
      }
      w.userData.isWire=true;w.userData.geo={edges:eg,tris:o.geometry};
      w.castShadow=w.receiveShadow=false;w.visible=false;
      o.add(w);S.items.push(w);
      for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&m.isMaterial)S.solids.add(m);
    }
    S.built=true;S.n=S.items.length;
    // an instanced mesh whose count changes - traffic, people, trains - has to carry its wire with it
    animHooks&&animHooks.push(()=>{if(S.mode==='off')return;for(const [w,o] of S.inst)w.count=o.count;});
  }

  function apply(){
    const on=S.mode!=='off';
    if(on&&!S.built)build();
    for(const w of S.items){
      w.visible=on;
      if(on)w.geometry=S.mode==='triangles'?w.userData.geo.tris:w.userData.geo.edges;
    }
    for(const m of S.solids){
      if(!on){m.colorWrite=true;m.depthWrite=m.userData._dw===undefined?true:m.userData._dw;
        if(m.userData._po!==undefined){m.polygonOffset=m.userData._po;}continue;}
      if(m.userData._dw===undefined)m.userData._dw=m.depthWrite;
      if(m.userData._po===undefined)m.userData._po=m.polygonOffset;
      // the solid sits a shade behind the wire so the two do not fight for the same pixels
      m.polygonOffset=true;m.polygonOffsetFactor=Math.max(1,m.polygonOffsetFactor||1);
      m.polygonOffsetUnits=Math.max(1,m.polygonOffsetUnits||1);
      m.colorWrite=S.under==='solid';
      m.depthWrite=S.under!=='xray';
    }
  }

  return {
    state:S,
    set(mode){S.mode=mode;apply();return S.mode;},
    cycle(){S.mode=S.mode==='off'?'edges':S.mode==='edges'?'triangles':'off';apply();return S.mode;},
    under(u){S.under=u;apply();return S.under;},
    cycleUnder(){S.under=S.under==='solid'?'hidden':S.under==='hidden'?'xray':'solid';apply();return S.under;},
  };
}

// The two buttons, in whatever button bar the page has. The second only appears once the wire is on,
// because "what is behind it" means nothing until there is a wire in front of something.
export function installWireUI({ui,mkBtn,wire,hash}){
  // The first press has to build the thing - every mesh in the city gets a twin made of its own edges - and
  // on a page the size of Mega-City One that is a second or two with the frame stopped. So the button says
  // what it is doing and the work waits two frames, which is long enough for the label to be painted.
  const label=m=>m==='off'?'Wire':m==='edges'?'Wire: edges':'Wire: triangles';
  let busy=false;
  const b=mkBtn('Wire',ui,()=>{
    if(busy)return;
    const next=wire.state.mode==='off'?'edges':wire.state.mode==='edges'?'triangles':'off';
    if(next!=='off'&&!wire.state.built){
      busy=true;b.textContent='Wire: building…';b.disabled=true;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        try{
          wire.set(next);
          b.textContent=label(next)+' ('+wire.state.n+')';
          b.setAttribute('aria-pressed','true');u.style.display='';
        }catch(e){
          // a failed build must not leave the button stuck on "building" with the frame's error unexplained
          b.textContent='Wire: failed';b.title=String(e&&e.message||e);throw e;
        }finally{b.disabled=false;busy=false;}
      }));
      return;
    }
    const m=wire.set(next);
    b.textContent=label(m);
    b.setAttribute('aria-pressed',String(m!=='off'));
    u.style.display=m==='off'?'none':'';});
  b.setAttribute('aria-pressed','false');
  b.title='Draw the model as its own edges, or as every triangle in it';
  const u=mkBtn('Under: solid',ui,()=>{const s=wire.cycleUnder();
    u.textContent='Under: '+s;});
  u.style.display='none';
  u.title='The solid under the wire: draw it, hide it but let it block what is behind, or drop it entirely';
  // #wire=edges&under=xray opens straight into it
  const m=/(^|&)wire=(off|edges|triangles)/.exec(hash||''),n=/(^|&)under=(solid|hidden|xray)/.exec(hash||'');
  if(n)u.textContent='Under: '+wire.under(n[2]);
  if(m&&m[2]!=='off'){wire.set(m[2]);
    b.textContent=m[2]==='edges'?'Wire: edges':'Wire: triangles';
    b.setAttribute('aria-pressed','true');u.style.display='';}
  return {wireBtn:b,underBtn:u};
}
