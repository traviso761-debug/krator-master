// ================================================================= BIOME CORE — a limb's joint to its parent (2026-11-03, opt-in)  [G data]
// The owner (ebadlands' ember crown, 2026-11-03): "branch junction needs quality pass". A limb grown as a polyline and drawn by BIO.tube starts
// at a point on (or in) its parent and is as thin there as one step up: two pipes pushed together, a hard seam, no collar. Real wood swells
// where a branch leaves its parent (the branch collar) and its root runs into the parent's wood. BIO.flareJoin takes the limb's points as a kit
// grew them ({x,y,z,r}, the first at the junction) and returns new points for BIO.tube (or BIO.beam's spans):
//   - a ROOT point sunk back along the limb's first direction into the parent by o.sink x the parent's radius (so no seam or gap shows at
//     the surface, whatever the angle), at o.k x the limb's own first radius, capped at o.cap x the parent's radius (never under the limb's own);
//   - a COLLAR point o.len x the limb's first radius out from the junction, eased between the flare and the limb;
//   - then the limb's own points from its second on, unchanged (the first stays where it was, its radius eased toward the flare).
// No random numbers: a kit's stream does not move, only the drawn tube. Every option is x == null ? d : x.
//   BIO.flareJoin(pts, {parentR, k (1.7), sink (.7), cap (.9), len (2.4)}) -> pts'   (pts with fewer than 2 points comes back as it was)
// A builder that wants the facets gone at the joint gives BIO.tube more sides there (seg 6-8 for a limb over ~.15 m); that is its own call.
// GODOT: the same function on the record's points before the tube is meshed (plain arithmetic).
(function(){
BIO.flareJoin=function(pts,o){o=o||{};if(!pts||pts.length<2)return pts;
 const k=o.k==null?1.7:o.k,sink=o.sink==null?.7:o.sink,cap=o.cap==null?.9:o.cap,len=o.len==null?2.4:o.len,pR=o.parentR==null?pts[0].r*2:o.parentR;
 const a=pts[0],b=pts[1],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,L=Math.hypot(dx,dy,dz)||1,ux=dx/L,uy=dy/L,uz=dz/L,r0=a.r;
 const rf=Math.max(r0,Math.min(r0*k,pR*cap)),back=pR*sink,cl=Math.min(r0*len,L*.6);
 const out=[{x:a.x-ux*back,y:a.y-uy*back,z:a.z-uz*back,r:rf},
  {x:a.x,y:a.y,z:a.z,r:r0+(rf-r0)*.55},
  {x:a.x+ux*cl,y:a.y+uy*cl,z:a.z+uz*cl,r:r0+(rf-r0)*.12}];
 for(let i=1;i<pts.length;i++){const p=pts[i];if(i===1&&Math.hypot(p.x-a.x,p.y-a.y,p.z-a.z)<=cl*1.05)continue;out.push(Object.assign({},p));}
 return out;};
})();
