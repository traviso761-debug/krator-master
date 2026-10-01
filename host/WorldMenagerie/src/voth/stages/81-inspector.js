/* ==== 27. DEV INSPECTOR ==== */

var FAM_LABEL = { stone:'Stone masonry', plaster:'Plaster wall', roof:'Roof',
  wood:'Timber', dome:'Dome', leaf:'Foliage', trunk:'Tree trunk',
  fungus:'Fungus growth', metal:'Metalwork', cloth:'Banner' };
function inspectMatLabel(shape, fam){
  if(fam==='leaf'   && shape==='blob') return 'Tree canopy';
  if(fam==='trunk') return 'Tree trunk';
  if(fam==='fungus' && shape==='blob') return 'Giant fungus cap';
  if(fam==='fungus' && shape==='stk')  return 'Giant fungus stalk';
  if(fam==='roof')  return 'Roof';
  if(fam==='dome')  return 'Dome';
  if(fam==='cloth') return 'Banner';
  return FAM_LABEL[fam] || (shape+' / '+fam);
}
var TAG_LABEL = { barn:'Barn', compound:'Walled compound', customs:'Customs house',
  farm:'Farmstead', field:'Farm field', fixed:'Structure', gate:'Gate', manor:'Manor house',
  prop:'Roadside structure', rdock:'River dock', rshed:'River-pier shed',
  shed:'Shed', shop:'Shop', shrine:'Shrine', stall:'Market stall',
  temple:'Funerary temple', tower:'Watchtower', town:'Town building', warehouse:'Warehouse',

  tavern:'Tavern', houseOfHealing:'House of Healing', fishdock:"Fisherman's dock",
  industry:'Industrial site', grave:'Grave', tomb:'Family tomb',
  monument:'Monument', exotic:'Ornamental tree' };

function prettyTag(tag){
  if(!tag) return null;
  if(TAG_LABEL[tag]) return TAG_LABEL[tag];
  var s = String(tag).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_\-]+/g, ' ').trim();
  if(!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

var NAMED_SITES = [];
(function(){
  CANTONS.forEach(function(c){
    var cc = CIDX[c.n]; if(!cc || cc.x===undefined) return;
    NAMED_SITES.push({ name: cc.n+' canton', x:cc.x, z:cc.z, r:(cc.r||90) });
  });
  if(typeof TEMPLE_ALTAR !== 'undefined' && TEMPLE_ALTAR){
    NAMED_SITES.push({ name:'Sacrifice altar', x:TEMPLE_ALTAR.x, z:TEMPLE_ALTAR.z, r:16 });
  }
  (window._newGates||[]).forEach(function(g){ NAMED_SITES.push({ name:g.name, x:g.x, z:g.z, r:18 }); });
  (window._standaloneShrineDebug||[]).forEach(function(s){
    if(s.ok) NAMED_SITES.push({ name:s.name, x:s.x, z:s.z, r:16 });
  });
  NAMED_SITES.push({ name:'Abbey compound', x:-1289.5, z:-429.7, r:150 });
})();
function nearestNamedSite(x,z){
  var best=null, bestD=Infinity;
  for(var i=0;i<NAMED_SITES.length;i++){
    var s=NAMED_SITES[i], d=Math.hypot(x-s.x, z-s.z);
    if(d<=s.r && d<bestD){ best=s; bestD=d; }
  }
  return best;
}
/* ==== the inspect-only footprint registry ==== */
function inspectClaim(x, z, fx, fz, ry, tag, label){
  var A = window._inspectFP || (window._inspectFP = []);
  A.push({ x:x, z:z, fx:fx, fz:fz, ry:ry||0, rad:Math.hypot(fx,fz), tag:tag, label:label||null });
}

/* ==== per-INSTANCE identity on a SHARED InstancedMesh ==== */
function inspectInstance(spec){
  var A = window._inspectInst || (window._inspectInst = []);
  for(var i=0;i<A.length;i++){ if(A[i].key === spec.key){ A[i] = spec; return spec; } }
  A.push(spec);
  return spec;
}
function inspectInstanceAt(mesh, instanceId){
  var A = window._inspectInst;
  if(!A || instanceId === undefined || instanceId === null) return null;
  for(var i=0;i<A.length;i++){
    var s = A[i];
    var m = (typeof s.mesh === 'function') ? s.mesh() : s.mesh;
    if(m !== mesh) continue;
    var ix = (typeof s.index === 'function') ? s.index() : s.index;
    if(ix !== instanceId) continue;
    return s;
  }
  return null;
}

function placedTagAt(x,z){
  var best=null, bestArea=Infinity;
  var lists=[PLACED, window._inspectFP || []];
  for(var L=0;L<lists.length;L++){
    var list=lists[L];
    for(var i=0;i<list.length;i++){
      var o=list[i], dx=x-o.x, dz=z-o.z;
      if(dx*dx+dz*dz > o.rad*o.rad) continue;
      var c=Math.cos(o.ry||0), s=Math.sin(o.ry||0);
      var lx=dx*c-dz*s, lz=dx*s+dz*c;
      if(Math.abs(lx)<=o.fx && Math.abs(lz)<=o.fz){
        var area=o.fx*o.fz;
        if(area<bestArea){ bestArea=area; best=o; }
      }
    }
  }
  return best;
}

function describeHit(mesh, point, instanceId){
  var site = nearestNamedSite(point.x, point.z);

  var inst = inspectInstanceAt(mesh, instanceId);
  if(inst){
    var instLabel = (typeof inst.label === 'function') ? inst.label() : inst.label;
    var instSite = site ? site.name : (inst.site || null);
    return instLabel + (instSite ? '  —  '+instSite : '');
  }
  if(mesh.userData.inspectLabel){
    return mesh.userData.inspectLabel + (site ? '  —  '+site.name : '');
  }
  var matLabel = inspectMatLabel(mesh.userData.shape, mesh.userData.fam);
  var pl = placedTagAt(point.x, point.z);

  var tagName = pl ? (pl.label || prettyTag(pl.tag)) : null;
  var parts = [];
  if(tagName) parts.push(tagName);
  if(site) parts.push(site.name);
  parts.push(matLabel);
  return parts.join('  —  ');
}

var INSPECT_ON = false;
var inspectRay = new THREE.Raycaster();
var inspectNdc = new THREE.Vector2();
var inspectTargets = null;
function inspectBuildTargets(){
  inspectTargets = scene.children.filter(function(o){
    return o.isInstancedMesh && (o.userData.shape || o.userData.inspectLabel);
  });
}
var inspectPending = false, inspectClientX = 0, inspectClientY = 0;
function inspectFrame(){
  inspectPending = false;
  if(!INSPECT_ON) return;
  if(!inspectTargets) inspectBuildTargets();
  inspectRay.setFromCamera(inspectNdc, camera);
  var hits = inspectRay.intersectObjects(inspectTargets, false);
  var tip = document.getElementById('inspectTip');
  if(!hits.length){ tip.style.display='none'; return; }

  tip.innerHTML = '<b>'+describeHit(hits[0].object, hits[0].point, hits[0].instanceId)+'</b>';
  tip.style.left = (inspectClientX+14)+'px';
  tip.style.top  = (inspectClientY+14)+'px';
  tip.style.display = 'block';
}
(function(){
  var host = renderer.domElement;
  host.addEventListener('pointermove', function(e){
    if(!INSPECT_ON) return;
    var r = host.getBoundingClientRect();
    inspectNdc.x = ((e.clientX-r.left)/r.width)*2-1;
    inspectNdc.y = -((e.clientY-r.top)/r.height)*2+1;
    inspectClientX = e.clientX; inspectClientY = e.clientY;
    if(inspectPending) return;
    inspectPending = true;
    requestAnimationFrame(inspectFrame);
  });
  var btn = document.getElementById('inspectToggle');
  if(btn) btn.onclick = function(){
    INSPECT_ON = !INSPECT_ON;
    btn.textContent = 'Inspector: '+(INSPECT_ON?'On':'Off');
    btn.classList.toggle('on', INSPECT_ON);
    if(!INSPECT_ON) document.getElementById('inspectTip').style.display='none';
  };
})();
window._inspect = { get:function(){ return INSPECT_ON; }, set:function(v){ INSPECT_ON=!!v; },
                     describeHit:describeHit, nearestNamedSite:nearestNamedSite, placedTagAt:placedTagAt,
                     instanceAt:inspectInstanceAt,
                     namedInstances:(window._inspectInst||[]).length,   /* diagnostic: bespoke instances of pooled meshes */
                     footprints:(window._inspectFP||[]).length };   /* diagnostic: canton-top records registered */
