// ================================================================= INTERIORS: the cut-away and the selector
// Open one building to look inside: everything above a storey's cut height, within that building's footprint, is
// clipped away (a box of five clipping planes with clipIntersection, set on every material once; no geometry is
// rebuilt), and the building's furniture is drawn (8zz-interiors.js aikDraw: its records into one batch).
//   the select "Interior"   a building by type and state; `[` `]` a storey down / up; `x` closes it
//   a VIEWS preset may carry an EIGHTH element, { site: 'police/0', storey: 1 }, so a view opens a building
//   _api.interiors()          the summary: sites, rooms, furnished buildings, pieces, walls, the core/tags audit
//   _api.interiors.open(id, storey), .close(), .site(id)
// Does nothing in a target without the interior bundle (AIK.on false).
const AIK_CLIP={planes:null,applied:new WeakSet(),site:null,storey:-1};
function aikClipAll(){if(!AIK_CLIP.planes)return;renderer.localClippingEnabled=true;
 scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
  for(const m of ms){if(!m||AIK_CLIP.applied.has(m))continue;m.clippingPlanes=AIK_CLIP.planes;m.clipIntersection=true;m.needsUpdate=true;AIK_CLIP.applied.add(m);}});}
function aikOpen(id,storey){const S=AIK.byId[id];if(!S||!S.box)return aikClose();
 if(!AIK_CLIP.planes){AIK_CLIP.planes=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(-1,0,0),0),new THREE.Plane(new THREE.Vector3(1,0,0),0),
  new THREE.Plane(new THREE.Vector3(0,0,-1),0),new THREE.Plane(new THREE.Vector3(0,0,1),0)];}
 const sts=S.storeys.slice().sort((a,b)=>a.y-b.y),k=Math.max(0,Math.min(sts.length-1,storey==null?0:storey)),st=sts[k];
 const P=AIK_CLIP.planes,pad=2,x0=S.gx+S.box[0]-pad,x1=S.gx+S.box[1]+pad,z0=S.gz+S.box[2]-pad,z1=S.gz+S.box[3]+pad;
 /* clipped where ALL hold: y above the cut, x0<x<x1, z0<z<z1 (each plane's negative side is the clipped side) */
 P[0].constant=st.y+Math.min(2.6,st.h*.6);P[1].constant=x0;P[2].constant=-x1;P[3].constant=z0;P[4].constant=-z1;
 /* the other storeys of a tall building stay drawn below; a building's storeys of the same height share the cut */
 AIK_CLIP.site=S;AIK_CLIP.storey=k;
 for(const T of AIK.sites)if(T.group)T.group.visible=T===S;
 aikDraw(S);if(S.group)S.group.visible=true;aikClipAll();
 aikSel.value=id;aikLab.textContent=S.name+' ('+S.state+') — storey '+(k+1)+' of '+sts.length+(S.furniture?' · '+S.furniture.pieces+' pieces':' · not furnished (a socket)');}
function aikClose(){if(AIK_CLIP.planes){AIK_CLIP.planes[0].constant=1e6;}AIK_CLIP.site=null;for(const T of AIK.sites)if(T.group)T.group.visible=false;
 if(typeof aikSel!=='undefined'){aikSel.value='';aikLab.textContent='';}}
const aikSel=document.createElement('select'),aikLab=document.createElement('span');
if(AIK.on){aikSel.id='aiksel';const o0=document.createElement('option');o0.value='';o0.textContent='Interior: none';aikSel.appendChild(o0);
 for(const S of AIK.sites){const o=document.createElement('option');o.value=S.id;o.textContent=S.name+' · '+S.state;aikSel.appendChild(o);}
 aikSel.onchange=()=>{if(!aikSel.value)return aikClose();const S=AIK.byId[aikSel.value];setView(S.gx+S.box[1]*.9+40,Math.max(60,(S.box[1]-S.box[0])*.9),S.gz+S.box[3]*1.4+60,S.gx,6,S.gz);aikOpen(aikSel.value,0);};
 aikLab.style.cssText='margin-left:8px;font:12px sans-serif;color:#eee';ui.appendChild(aikSel);ui.appendChild(aikLab);
 addEventListener('keydown',e=>{const k=e.key;if(!AIK_CLIP.site)return;if(k===']')aikOpen(AIK_CLIP.site.id,AIK_CLIP.storey+1);else if(k==='[')aikOpen(AIK_CLIP.site.id,AIK_CLIP.storey-1);else if(k==='x'||k==='X')aikClose();});
 /* a preset's eighth element opens a building: wrap setView (every route into a view goes through it) */
 const _aikSV=setView;setView=function(){_aikSV.apply(null,arguments);const c=arguments[7];if(c&&c.site)aikOpen(c.site,c.storey);else if(AIK_CLIP.site&&arguments.length<8)aikClose();};
 const v0=VIEWS[Object.keys(VIEWS)[0]];if(v0&&v0[7]&&v0[7].site)aikOpen(v0[7].site,v0[7].storey);
 window._api.interiors=function(){const a=AIK.T.audit();return{sites:AIK.sites.length,rooms:AIK.sites.reduce((n,S)=>n+S.rooms,0),furnished:AIK.furnished,
  pieces:AIK.pieces,records:AIK.F.placed.length,missing:Object.assign({},AIK.F.missing),walls:AIK.walls,stubs:AIK.stubs,floors:AIK.floors,cleared:AIK.cleared,errors:AIK.errors.slice(),
  tagUnknown:a.unknown,tagMissingCulture:a.missingCulture,tagMissingTypes:a.missingTypes,records_tags:AIK.T.query({}).length,
  bySite:AIK.sites.map(S=>({id:S.id,state:S.state,rooms:S.rooms,storeys:S.storeys.length,pieces:S.furniture?S.furniture.pieces:0,templates:S.furniture?S.furniture.templates:0}))};};
 window._api.interiors.open=aikOpen;window._api.interiors.close=aikClose;window._api.interiors.socket=aikSocket;window._api.interiors.site=id=>AIK.byId[id];}
