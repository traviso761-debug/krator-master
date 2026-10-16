// ================================================================= ATMOS — export: everything the module placed, as plain JSON for a game engine
// ATMOS.export() returns one object (core/atmos/GODOT.md is its contract): the coordinate convention, the shared
// uniforms, the presets, the clock and wind, every effect record (A.fx), every light's glow, every lamp, and every
// instanced prop set (geometry kind, material, instances). ATMOS.download(name) (89-atmos-9-host.js) saves it.
// Numbers are rounded to 3 decimals. Nothing here changes the scene.
(function(){const A=ATMOS;
 const r3=v=>typeof v==='number'?Math.round(v*1000)/1000:Array.isArray(v)?v.map(r3):v&&typeof v==='object'&&!v.isColor?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,r3(x)])):v;
 const hex=c=>c&&c.isColor?'#'+c.getHexString():null;
 A.export=()=>{const T=A.T,q=new T.Quaternion(),e=new T.Euler(),props={};
  for(const name in A.sets){const S=A.sets[name];if(!S.items.length)continue;const m=S.mat||{},g=S.geo,kind=Object.keys(A.geoKinds()).find(k=>A.geoKinds()[k]===g)||(g.parameters?g.type:'custom');
   props[name]={geometry:kind,size:g.parameters||null,material:{color:hex(m.color),roughness:m.roughness,metalness:m.metalness,transparent:!!m.transparent,opacity:m.opacity,emissive:m.isMeshBasicMaterial?'unlit':undefined,shader:name==='bannerFlag'?'flag':undefined},
    instances:S.items.map(o=>{let ry=o[6];if(ry&&ry.isQuaternion){e.setFromQuaternion(q.copy(ry),'YXZ');ry=[e.x,e.y,e.z];}
     const c=o[7]==null?null:o[7].isColor?'#'+o[7].getHexString():'#'+new T.Color(o[7]).getHexString();return[o[0],o[1],o[2],o[3],o[4],o[5],ry==null?0:ry,c];})};}
  return r3({format:'krator-atmos',version:1,
   convention:{units:'metres',up:'+y',x:'east',z:'south',handed:'right (glTF)',ry:'radians about +y; local +z turns to (sin ry, cos ry)',bearing:'angle from +x toward +z',
    hours:'0..24; a light [on,off] is lit from on in the evening to off next morning (off may be past 24; on<0 follows the night; on=0 always)',
    colors:'hex or [r,g,b] in display (sRGB) space',colour:'srgb',instance:'[x,y,z, sx,sy,sz, ry | [rx,ry,rz] YXZ euler, color|null]; geometry is unit-sized, posts and cones stand on y=0'},
   uniforms:{atm_hour:'0..24',atm_night:'0 day .. 1 night',atm_time:'module clock, s',atm_rain:'0..1',atm_fog:'0..1',atm_flash:'lightning 0..1',atm_wind:'vec2 m/s-ish, base x weather',atm_gust_amp:'gust depth',atm_wind_off:'vec2, wind integrated over time',atm_light:'1 day .. 0.18 night',atm_ash:'0..1 the opt-in ash weather (ashfall .35, the storm 1)',atm_snow:'0..1 the opt-in snow weather (snowfall .4, the blizzard 1)',atm_px:'pixels per metre at 1 m (sprite sizing)',atm_wave_t:'module clock wrapped at presets.waves.period, s (atmos_waves)',atm_wave_amp:'wave half-height scale, m'},
   presets:A.PRESETS,clock:{t:A.clock.t,scale:A.clock.scale},wind:{base:[A.windBase.x,A.windBase.y]},
   fx:A.fx,lamps:A.lamps.map((l,i)=>{const g=A.glow[A.lampGlow[i]];return{at:[l[0],l[1],l[2]],hours:[l[3],l[4]],glow:A.lampGlow[i],color:g?[g[3],g[4],g[5]]:null,
    light:'none in three.js: the lamp is its halo (glow) and its moths; a game engine may give the nearest an OmniLight3D of this colour'};}),
   glow:A.glow.map(g=>({at:[g[0],g[1],g[2]],color:[g[3],g[4],g[5]],size:g[6],hours:[g[7],g[8]]})),
   props,stats:A.stats});};
})();
