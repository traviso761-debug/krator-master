// TARGET: forts — the damaged and ruined forts and posts watched by core/ruins (the owner, 2026-11-10: every ruined structure is
// watched; settlements/strongwall/PLAN.md 5.6). After the showcase's bake (90-scene: SITE_GROUPS), each site of a def with `xfort`
// (the watch fort, the relay post) in a damaged or ruined state is watched as the scene within its lot; the verify harness then
// asserts nothing floats and every fallen piece lies on its lowest points. The rubble heaps (KRUBBLE, drawn by 80g) are decoration.
// Then the page's record of what was drawn, for the verify (verify.py: marches-laid, marches-states, marches-works-clear).
const MR_WATCHED=[];
if(typeof KRUINS!=='undefined')for(const SG of SITE_GROUPS){const S=SG.S,D=VERN.defs[S.key];if(!D||!D.xfort||!((S.o&&S.o.v)|0))continue;
 const hw=D.w/2,hd=D.d/2,name=(S.fort||'')+' '+D.name+' — '+XF_STATES[S.o.v];MR_WATCHED.push(name);
 KRUINS.watch(scene,{name,inside:(x,z)=>Math.abs(x-S.x)<hw&&Math.abs(z-S.z)<hd,ground:()=>0});}
/* each site's lot (its def's w x d about its centre, turned by ry: every site here has ry 0), for the works' clearance check, and
   the registered volumes (core/tags' records, REG) its builder left in it: the proof it drew (its instances are baked into the scene) */
window._marches=Object.assign(window._marches||{},{watched:MR_WATCHED,
 placed:SITE_GROUPS.map(({S,G})=>{const D=VERN.defs[S.key];return{key:S.key,fort:S.fort,state:S.state,v:(S.o&&S.o.v)|0,x:S.x,z:S.z,w:D.w,d:D.d,
  fw:D.fw==null?D.w:D.fw,fd:D.fd==null?D.d:D.fd,work:!!S.work,
  regs:REG.filter(r=>r.key===S.key&&Math.abs(r.x-S.x)<=D.w/2+.5&&Math.abs(r.z-S.z)<=D.d/2+.5).length};}),
 forts:(window._xaForts||[]).length});
