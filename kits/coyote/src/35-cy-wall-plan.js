/* ==================== kits/coyote 35: the Gate's long-wall planner (plain data, [G data]) ==================== */
/* PLAN.md sections 4, 5 and 9 (C6); biomes/outlandgate/PLAN.md section 5. The Tierhounds close the Outland Gate's Narrows
   from wall foot to wall foot with a long wall after Derbent and Hattusa: towers along the line, a toll gate where a road
   crosses, a water gate of corbelled culverts where a river crosses, a postern tunnel under the curtain, and slumped older
   stretches. Nothing here touches three.js or the DOM; core/city's site wall (KCITY.site.wall and KCITY.site.wallSegs, read
   in place and never edited) lays the nodes and the standing runs, and this planner maps them onto the Coyote kit's defs so
   both the kit's sheet (72-cy-gate-wall.js) and the Outland Gate's station 1 read the same records.
     cyWallPlan(spec) -> {id, line, footA, footB, nodes, segs, records, gates, waterGates, error?}
   spec: {id, world, chain [[x, z]...] (foot to foot), ways [{id?, name?, kind: 'road' | 'river', pts [[x, z]...]}],
          towerGap (default 35), clear (default 8), gateFind (default 30), named?, side (default 1: +z outward on a W->E
          chain), gateInset?, towerInset?, posternSeg (segment index for cy_postern, or null), slumpedSegs [seg index...],
          slumpedTowers [tower ordinal...], dims?(key)} */
const CY_WALL_BOX={
 cy_wall_run:{w:16,d:5.6,h:6.4},
 cy_postern:{w:14,d:7.6,h:6.4},
 cy_wall_tower:{w:7.6,d:8.4,h:9.2},
 cy_toll_gate:{w:18,d:22,h:9.6},
 cy_water_gate:{w:18,d:8.4,h:6.8}
};
function cyWallPlan(spec){
 spec=spec||{};
 const id=spec.id||'gate-wall',chain=spec.chain;
 if(!chain||chain.length<2)return {id,error:'a wall needs a chain of at least two points',nodes:[],segs:[],records:[],gates:[],waterGates:[]};
 const boxOf=k=>(spec.dims&&spec.dims(k))||CY_WALL_BOX[k]||{w:8,d:6,h:6};
 const plFrame=KCITY.lib.plFrame;
 const ways=(spec.ways||[]).map((w,i)=>Object.assign({},w,{id:w.id==null?'way-'+i:w.id,kind:w.kind||'road',F:w.F||plFrame(w.pts)}));
 const towerGap=spec.towerGap==null?35:spec.towerGap;
 const W=KCITY.site.wall(chain,ways,{
  towerGap,
  clear:spec.clear==null?8:spec.clear,
  gateFind:spec.gateFind==null?30:spec.gateFind,
  named:spec.named||[],
  side:spec.side==null?1:spec.side,
  health:2
 });
 const F=plFrame(W.line),footA=W.line[0].slice(),footB=W.line[W.line.length-1].slice();
 /* ensure both wall feet are anchored if a nearby gate suppressed an end vertex in KCITY.site.wall */
 const endNear=(s0)=>W.nodes.some(n=>Math.abs(n.s-s0)<boxOf(n.kind==='gate'?'cy_toll_gate':'cy_wall_tower').w*.6);
 const raw=W.nodes.slice();
 if(!endNear(0)){const t=F.tan(0,2);raw.unshift({kind:'tower',x:footA[0],z:footA[1],s:0,ry:Math.atan2(t[0],t[1]),health:2});}
 if(!endNear(F.len)){const t=F.tan(F.len,2);raw.push({kind:'tower',x:footB[0],z:footB[1],s:F.len,ry:Math.atan2(t[0],t[1]),health:2});}
 raw.sort((a,b)=>a.s-b.s);
 const slT=new Set(spec.slumpedTowers||[]),slS=new Set(spec.slumpedSegs||[]);
 let ti=0;
 /* KCITY.site.wall sets nd.ry along the wall (local x across the passage in Voth's convention); in core/engine local +x runs
    along the wall and local +z faces outward (side = +1 turns W->E's +z south), so ry = nd.ry - PI/2 */
 const side=spec.side==null?1:spec.side,turn=side>=0?-Math.PI/2:Math.PI/2;
 const nodes=raw.map((nd,k)=>{
  const isRiver=nd.kind==='gate'&&nd.way&&nd.way.kind==='river';
  const key=nd.kind==='gate'?(isRiver?'cy_water_gate':'cy_toll_gate'):'cy_wall_tower';
  const role=nd.kind==='gate'?(isRiver?'water_gate':'toll_gate'):'tower';
  const slumped=role==='tower'&&slT.has(ti++);
  const B=boxOf(key),ry=nd.ry+turn;
  return {id:id+':node:'+k,key,role,kind:nd.kind,gx:nd.x,gz:nd.z,x:nd.x,z:nd.z,ry,s:nd.s,w:B.w,d:B.d,h:B.h,
   v:slumped?1:0,state:slumped?'ruined':'intact',health:2,way:nd.way?{id:nd.way.id,kind:nd.way.kind,name:nd.way.name||null}:null};
 });
 /* socket each curtain run 0.2 m into its end towers and gates so no seam opens between masonry blocks */
 const tBox=boxOf('cy_wall_tower'),gBox=boxOf('cy_toll_gate');
 const towerInset=spec.towerInset==null?tBox.w/2-.2:spec.towerInset;
 const gateInset=spec.gateInset==null?gBox.w/2-.2:spec.gateInset;
 const rawSegs=KCITY.site.wallSegs(nodes,{gateInset,towerInset});
 const segs=rawSegs.map((sg,k)=>{
  const dx=sg.bx-sg.ax,dz=sg.bz-sg.az,len=Math.hypot(dx,dz),ry=Math.atan2(dx,dz)+turn;
  const postern=spec.posternSeg===k,slumped=!postern&&slS.has(k);
  const key=postern?'cy_postern':'cy_wall_run',B=boxOf(key);
  return {id:id+':seg:'+k,key,role:postern?'postern':'curtain',ax:sg.ax,az:sg.az,bx:sg.bx,bz:sg.bz,
   x:(sg.ax+sg.bx)/2,z:(sg.az+sg.bz)/2,ry,w:len,d:B.d,h:B.h,v:slumped?1:0,state:slumped?'ruined':'intact'};
 });
 const records=nodes.concat(segs);
 return {
  id,line:W.line,len:F.len,footA,footB,nodes,segs,records,
  gates:nodes.filter(n=>n.role==='toll_gate'),
  waterGates:nodes.filter(n=>n.role==='water_gate')
 };
}
