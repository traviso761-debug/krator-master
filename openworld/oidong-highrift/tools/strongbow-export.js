/* Strongbow's page as a place of the oidong-highrift Godot case (GODOT-PLAN.md M7; the owner, 2026-11-16: "Yes, far
   detail"). Injected into kits/ancients' strongbow-today page (settlements/strongbow's page, built on its own branch) by
   tools/harness.py export --inject, after core/export 07, 09 and 10; godot_case.py places the camera far off first
   (setView), so the export takes what the page draws from afar:
     items, buckets, materials, textures   EXPORT.sceneReader over the page's scene: every mesh the page shows, less the
       hidden ones (the town's skin and detail and the rooms, drawn near the eye; THREE.LOD's other levels) and the sky and
       the far ground (a mesh over 6 km across: the region's ground stands there)
   The page's frame faces +z, the site faces west: the meshes are written about the anchor, the lip at the bay's centre
   (STRONGBOW.frame: x 0, y lipY, z the face's line there), which world.json gives as `origin`, and `frame` says how the
   region turns them (ry, radians about +Y: -pi/2 turns the page's +z to the region's -x). The page has no core/tags
   registry yet, so its pieces name no records. */
(function(){'use strict';
const E=window.EXPORT;
if(!E||!E.sceneReader||typeof STRONGBOW==='undefined')throw new Error('strongbow-export: needs core/export 07 and 10 and the strongbow page');
const F=STRONGBOW.frame(),ANCHOR=[0,F.lipY,F.faceZ(0,F.lipY)];
const up=(m,f)=>{for(let p=m;p;p=p.parent)if(f(p))return true;return false;};
const hidden=m=>up(m,p=>p.visible===false);
const huge=m=>{const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const s=m.getWorldScale(new THREE.Vector3());
 return !!g.boundingSphere&&g.boundingSphere.radius*Math.max(s.x,s.y,s.z)>3000;};
const read=ctx=>ctx.memo('strongbow',()=>{
 ctx.out.origin=ANCHOR.slice();
 ctx.out.frame={anchor:ANCHOR.slice(),faces:'+z',lip:F.LIP,floor:F.FL,lipY:F.lipY,
  note:'the page\'s own frame: the face at z = 0 at its foot, battered back to the lip; the plateau to -z. The region places the anchor on the site and turns the page by the place\'s ry'};
 /* core/lod draws a copy of each mesh it manages under LOD.root (a chunk, or from afar a clustered proxy; an instanced
    copy holds only the instances still drawn) and moves the original to a layer the camera does not draw. The reader
    skips core/lod copies; here they are what the page draws from afar, so for this read they are the meshes and the
    originals they stand in for are skipped */
 const managed=m=>(m.layers.mask&(1<<30))!==0,flagged=[];
 if(typeof LOD!=='undefined'&&LOD&&LOD.root)LOD.root.traverse(c=>{if(c.userData&&c.userData.lodCopy){flagged.push(c);c.userData.lodCopy=false;}});
 try{
  return E.sceneReader({name:'strongbow',source:'kits/ancients strongbow-today (settlements/strongbow)',scene,tags:null,origin:ANCHOR,
   skipInstanced:m=>managed(m)?'a core/lod original (its drawn copy stands in)':hidden(m)?'hidden (drawn near the eye)':null,
   skipMesh:m=>managed(m)?'a core/lod original (its drawn copy stands in)':hidden(m)?'hidden (drawn near the eye)':
    huge(m)?'the sky or the far ground (the region\'s ground stands there)':null}).assemble(ctx);
 }finally{flagged.forEach(c=>{c.userData.lodCopy=true;});}});
['items','buckets','materials','textures'].forEach(s=>E.register(s,ctx=>read(ctx)[s],{by:'strongbow'}));
window._sbExport={anchor:ANCHOR,lipY:F.lipY};
})();
