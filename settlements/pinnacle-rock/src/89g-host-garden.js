// ================================================================= HOST — the Garden's great-houses (P3e): the houses, the paths
// Draws GARDEN_TOWN's records (58b): the Beast Riders' houses (CAT, instanced through the town's helpers, 89c) and the paths
// round the Heart and in from the ways up, as ribbons of trodden earth on the Garden's top. The ways up themselves (the
// Garden's stair and ramp, the stair up the Heart) are the roost plan's ascents, drawn with the climbs (89).
const GARDEN_MESH={};
const GARDEN_DRAW=(function(){if(!GARDEN_TOWN)return null;try{
 const t0=performance.now(),grp=new THREE.Group();grp.name='the Garden\'s great-houses';grp.userData.garden=true;
 const R=townInstances(GARDEN_TOWN.houses.concat(GARDEN_TOWN.stores||[]),grp,'garden');   // and the storerooms cut in its wall
 const top=(x,z)=>{const t=KSTACKS.topAt([GARDEN_B],x,z);return t>-1e8?t:GARDEN_B.top;},G=townGroundMat('yard','The Garden\'s paths (trodden earth)'),col=townLin(0x806a58);
 const me=townRibbons(GARDEN_TOWN.ways,G,top,()=>col,.12);me.userData.garden=true;grp.add(me);
 scene.add(grp);GARDEN_MESH.group=grp;
 GARDEN_TOWN.houses.concat(GARDEN_TOWN.stores||[]).forEach(L=>REG.push({name:L.name,key:'garden.'+L.key,x:L.x,z:L.z,y:L.y,r:Math.hypot(L.w,L.d)/2,h:L.h}));
 (ROOST.ascents||[]).forEach(A=>{const P=A.pts,m=P[P.length>>1];REG.push({name:A.name,key:'roost.ascent',x:m[0],z:m[2],y:P[0][1],r:30,h:P[P.length-1][1]-P[0][1]});});
 return {houses:GARDEN_TOWN.houses.length,tris:Math.round(R.tris),ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('garden: '+(e&&e.stack||e));return null;}})();
_mark('garden');
