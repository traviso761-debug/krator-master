// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the sites this region plans (openworld/SITES.json): their markers say so
//   goOrder   the sites first in "Go to"
//   goViews   the region's own views: the cut from above, each site, each village and house
//   start     the first view: over Longsong's ring, looking at the monastery
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SS=M.sites||[],P=WORLD_DATA.sites,by=n=>SS.find(s=>s.name===n)||{x:0,z:0,name:n};
const views=[{label:'Overview: the region from 500 km up',pos:[0,500000,300000],look:[0,0,0]}];
SS.forEach(S=>views.push({label:S.name+' and its villages from 6 km up',view:[S.x+4000,S.z+9000,6000,.4,-.6]}));
if(P)P.sites.forEach(St=>(St.hamlets||[]).forEach(V=>views.push({label:V.name+' ('+St.name+')',view:[V.site.x-260,V.site.z+320,140,-.7,-.3]})));
/* each bridge (core/world 42b, 88b), from beside it, looking at its middle */
if(P)(P.bridges||[]).forEach(B=>{const m=B.deck[Math.floor(B.deck.length/2)],a=B.deck[0],b=B.deck[B.deck.length-1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,
 nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L,d=Math.max(90,B.len*.9);
 views.push({label:'Bridge: '+B.kind+' of '+Math.round(B.len)+' m ('+B.road.split('/link/').join(' to ')+')',pos:[m[0]+nx*d,m[2]+B.len*.12+6,m[1]+nz*d],look:[m[0],m[2]-6,m[1]]});});
const L=by('Longsong');
return{built:{'Longsong':'openworld/oidong-highrift (its ring of 15 villages and roads); the monastery is settlements/longsong',
  'The Singing Gjar':'openworld/oidong-highrift (the Order\'s house, the Beck Fields and the Vein Camp)',
  'The Mirror Grange':'openworld/oidong-highrift (the Order\'s grange, its growers and herders)',
  'The Caldron House':'openworld/oidong-highrift (the Order\'s hospice at the staircase foot, its shelf village)'},
 goOrder:['Longsong','The Caldron House','The Mirror Grange','The Singing Gjar'],goViews:views,
 start:{view:[L.x+6000,L.z+6000,900,.78,-.18],look:[L.x,L.z,80]}};})();
