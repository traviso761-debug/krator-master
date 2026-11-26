// ================================================================= ATMOS — fx: steam and smoke in groups, each with its own strength (ATMOS.smokeGroups)
// The Gills' and the Hearths' section 12 (2026-11-03): the gills' steam follows the breath, a fumarole's is steady, a disc's
// follows the night's work, all on one page. ATMOS.smoke (89-atmos-3-particles.js) makes one cloud whose kinds' alpha are
// uniforms; nothing scaled a cloud as a whole. This makes one ATMOS.smoke cloud a group and keeps each group's strength, so
// a kit sets a scalar a frame and no particle is touched. Opt-in (core/atmos/fx/, listed by path); needs 89-atmos-3-particles.js.
//   const G = ATMOS.smokeGroups({breath: {emitters: [[x, y, z, 'steam'], ...], n, k (1)}, vents: {emitters, k: .6}, ...})
//   G.set(name, k)   k 0..1 (above 1 thickens) times every kind's preset alpha in that group's cloud, now
//   G.k(name)        its strength;  G.meshes[name]  its cloud (null for a group with no emitters);  G.names
// ATMOS.export() lists each group's emitters as ATMOS.smoke records them, plus a 'smokeGroups' record {groups: {name: {n, k}}}
// whose k is the strength the group was made with: Godot scales the group's GPUParticles3D alpha by the same scalar.
(function(){
 'use strict';
 const A=typeof ATMOS!=='undefined'?ATMOS:null;
 if(!A||!A.smoke)throw new Error('core/atmos fx/89-atmos-fx-smokegroups.js: load 89-atmos-3-particles.js first (ATMOS.smoke)');
 A.smokeGroups=(groups,o)=>{o=o||{};if(!groups||typeof groups!=='object'||Array.isArray(groups))throw new Error('ATMOS.smokeGroups: groups is {name: {emitters, n, k}}');
  const names=Object.keys(groups).sort(),meshes={},base={},K={},rec={};
  const fin=(v,w)=>{if(typeof v!=='number'||!isFinite(v)||v<0)throw new Error('ATMOS.smokeGroups: '+w+' must be a number 0 or more');return v;};
  const apply=name=>{const m=meshes[name];if(!m)return;const SA=m.material.uniforms.SA.value;for(let i=0;i<SA.length;i++)SA[i].w=base[name][i]*K[name];};
  for(const name of names){const g=groups[name];if(!g||!Array.isArray(g.emitters))throw new Error('ATMOS.smokeGroups: group '+name+' needs emitters [[x, y, z, kind], ...]');
   K[name]=fin(g.k==null?1:g.k,'group '+name+' k');
   const m=g.emitters.length?A.smoke(g.emitters,g.n==null?{}:{n:fin(g.n,'group '+name+' n')}):null;
   meshes[name]=m;base[name]=m?m.material.uniforms.SA.value.map(v=>v.w):[];if(m)m.name='atmos:smoke:'+name;apply(name);
   rec[name]={n:g.emitters.length,k:K[name]};}
  A.rec('smokeGroups',{groups:rec});
  const known=name=>{if(!(name in K))throw new Error('ATMOS.smokeGroups: no group '+name);};
  return {names,meshes,set:(name,k)=>{known(name);K[name]=fin(k,'k');apply(name);return K[name];},k:name=>{known(name);return K[name];}};};
})();
