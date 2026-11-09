// ================================================================= HOST — a field station's words, views and checks (99-host-take.js reads STATION_TAKE)
// From the site's `take` ({build, title, hint, views(), erupt, checks(add, P), negatives(add, P)}), with what every field shares: its own views only
// (no Old Kettle, Prism or Stair here), the showcase's checks that hold on any field (nothing on the scalding ground, the geysers on their cycles, the
// springs at their rims, the tags, the cameras), the flora's pass, and an export box over the field's middle.
const STATION_TAKE=Object.assign({ownViews:true,
 baseChecks:['nothing lives on the scalding ground','every geyser erupts on its own cycle','the springs brim at their rims','every species and plant tagged','preset cameras clear of the ground'],
 baseNegatives:['a fern in the Great Prism','a geyser with no column','a spring 2 m over its rim','a species with no origin','a camera under the ground'],
 types:{'field/flora':'pass'},exportBox:[BASIN.x-150,BASIN.z-150,BASIN.x+150,BASIN.z+150],
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water']},SITE.take||{});
// a view toward a point from a bearing: [cx, cy, cz, tx, ty, tz], the eye over the ground
const fieldView=(tx,tz,az,d,h,th)=>{const cx=tx+Math.cos(az)*d,cz=tz+Math.sin(az)*d;return[cx,Math.max(terrainH(cx,cz),waterH(cx,cz))+h,cz,tx,terrainH(tx,tz)+(th==null?1:th),tz];};
const biggest=(L,k)=>L.slice().sort((a,b)=>b[k]-a[k])[0];
