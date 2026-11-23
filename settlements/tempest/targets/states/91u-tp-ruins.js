// TARGET: states — the damaged and ruined wards watched by core/ruins (the owner, 2026-11-10: every ruined structure is watched),
// as the fort asset's sheet watches its forts (kits/xanadu/targets/sheet/91u-xasheet-ruins.js): after the bake, each House site
// in a damaged or ruined state (o.v 1, 2) is watched as the scene within its lot; the verify harness asserts nothing floats and
// every fallen piece lies on its lowest points. The rubble heaps are decoration (KRUBBLE's, userData.decor). The page's record
// (window._tempestStates) is the verify's: every ward at every state placed, the damage each drew.
const TP_STATES=[];
for(const SG of SITE_GROUPS){const S=SG.S,D=VERN.defs[S.key];if(!D||!D.tpState)continue;const v=(S.o&&S.o.v)|0;TP_STATES.push({key:S.key,v,state:XF_STATES[v]});
 if(typeof KRUINS!=='undefined'&&v){const hw=D.w/2,hd=D.d/2;KRUINS.watch(scene,{name:D.name+' — '+XF_STATES[v],inside:(x,z)=>Math.abs(x-S.x)<hw&&Math.abs(z-S.z)<hd,ground:()=>0});}}
window._tempestStates={sites:TP_STATES,watched:typeof KRUINS!=='undefined'?KRUINS.watched.length:0,
 damage:['xa_tempest_outer','xa_tempest_inner'].map(k=>{const Q=k==='xa_tempest_outer'?TP_OUTER:TP_INNER,b=k==='xa_tempest_outer'?TP_SEED:TP_SEED+100;
  return{key:k,damaged:XFORT.damage(Q,'damaged',b+1),ruined:XFORT.damage(Q,'ruined',b+2)};}).map(d=>({key:d.key,breaches:d.damaged.breaches.length,fallen:Object.keys(d.damaged.towers).length,
  burnt:Object.values(d.damaged.gates).filter(x=>x==='burnt').length,stubs:Object.keys(d.ruined.stubs).length,heaps:d.ruined.heaps.length}))};
