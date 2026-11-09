// ================================================================= THE FOREST-STEPPE ROW'S FLORA: the host binding (Y6)
// biomes/nwouterwall's kit (NWOW: its zones, larch, stone pine, silverthorn and the floor's plants) is read IN PLACE by build.py
// (the 93b-bio- band, with core/space and core/biome); this fragment and 93b-bio-80-yt-flora.js are the only local parts.
// BIO.init runs here, after the scene (90) and before the kit's fragments (which build their materials against BIO.host.THREE at
// load). The flora dresses only the forest-steppe row (89-rows.js): its mask is that row's box, less each building's plot; the
// fields are Leng's forest-steppe (BIOME-API.md, "The fields record F"): an annual mean of +2 C, a slope that faces the shade
// behind the row (larch: the shaded slopes hold the snow) and the sun in front of it (the steppe's feather grass), a little
// permafrost. The ground is the sheet's plane (terrainH 0). The kit keeps its own stream (core/biome's), seeded from KRAND.
// Every item it places is a core/tags record in its own registry (YT_FLORA.tags), not the buildings' (rebuilt per world build).
const YT_FLORA=(function(){if(typeof BIO==='undefined')return null;const row=ROWS.find(r=>/^The forest-steppe \(Y6\)/.test(r.family));if(!row)return null;
 const sites=SITES.filter(S=>row.keys.indexOf(S.key)>=0&&Math.abs(S.z-row.z)<.5);
 const x0=-row.w/2-18,x1=row.w/2+18,z0=row.z-row.d/2-22,z1=row.z+row.d/2+6;
 const R=Math.ceil(Math.hypot(Math.max(-x0,x1),Math.max(-z0,-z1)))+8;
 const keep=sites.map(S=>{const D=DEFS[S.key];return [S.x-D.w/2-1.5,S.z-D.d/2-1.5,S.x+D.w/2+1.5,S.z+D.d/2+1.5];});
 const mask=(x,z)=>{if(x<x0||x>x1||z<z0||z>z1)return 0;for(const b of keep)if(x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])return 0;return 1;};
 const T=typeof KTAGS!=='undefined'&&KTAGS.VOCAB?KTAGS.create({build:'yeti-flora'}):null;
 return {row,sites,box:[x0,z0,x1,z1],R,mask,tags:T,seed:KRAND.hash(0x7f10,4700)};})();
/* the fields at a point: the slope shaded behind the row, sunny in front, a patch noise between (core/rand's fbm) */
function ytFloraFields(x,z){const Y=YT_FLORA,dz=(z-Y.row.z)/14,n=KRAND.fbm(x*.035+3,z*.035-2,0,2,4711)-.5;
 const sunny=clamp(dz*.9+n*1.6,-1,1);
 return {y:0,g:0,slope:.24,sunny,mean:2,perma:.25,water:0,streamD:99,floor:0,aufeis:0,alas:0,lake:0,meadow:0,pingo:0,poly:0,lobe:0,front:0,rockG:0,
  gully:0,burn:0,burnK:0,field:0,pocket:0,rock:0};}
if(YT_FLORA)BIO.init({THREE:THREE,scene:scene,terrainH:(x,z)=>0,mask:YT_FLORA.mask,obstacles:[],ticks:fn=>FRAME_HOOKS.push((dt,now)=>fn(dt,now/1000)),
 seed:YT_FLORA.seed,origin:[[0,YT_FLORA.row.z]],center:[0,YT_FLORA.row.z],tags:YT_FLORA.tags,err:m=>reportErr('flora: '+m),
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],lod:{hero:400,mid:900,far:YT_FLORA.R*1.2,floor:[90,160]}});
