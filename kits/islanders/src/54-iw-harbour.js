// prefix: iw
// ================================================================= THE WEST'S HARBOUR: the fishing dock (the dockyard and the warehouse follow)
// Harbour defs stand on the shore row (89-rows.js shore:true, 90h-is-shore.js): land at local z > 0, piers over z < 0,
// the water at IS_SEA.level, piles down to IS_SEA.floor. iwCanoe is a small outrigger canoe moored at a pier (the Ring
// Sea kit's oruwa is the full vessel; this is its harbour stand-in).
/* the sea floor's height at local z (the shore line at z = 0, the floor from 9 m out) */
function iwFloorAt(z){return z>=1.5?0:IS_SEA.floor*smooth(0,IS_SEA.slope,1.5-z);}
/* a pier from (x, z0) out to (x, z1) (z1 < z0), w wide, its deck at y: plank deck, pile pairs every `step` down to the floor */
function iwPier(x,z0,z1,w,y,o){o=o||{};const step=o.step||2.2,L=z0-z1;box('planks',x,y-.1,(z0+z1)/2,w,.1,L,P('planks'));
 for(const z of isSpan(z0-.2,z1+.2,Math.max(2,Math.round(L/step)+1)))for(const s of [-1,1]){const fl=iwFloorAt(z)-.3;cyl('tarred',x+s*(w/2-.1),fl,z,.13,y-.1-fl,P('tarred'),8);}
 for(const s of [-1,1])box('wood',x+s*(w/2-.06),y-.32,(z0+z1)/2,.14,.22,L,P('woodD'));
 if(o.bollards)for(const z of isSpan(z0-1,z1+.4,Math.max(2,Math.round(L/4))))for(const s of [-1,1])cyl('wood',x+s*(w/2-.15),y,z,.1,.45,P('woodD'),8);}
/* a small outrigger canoe afloat at (x,z) heading ry: a dugout hull, booms, the float, a paddle */
function iwCanoe(x,z,ry,o){o=o||{};const L=o.L||6,y=IS_SEA.level;W(x,y,z,ry,()=>{
 tube('hull',t=>[0,.05,(t-.5)*L],t=>{const r=.36*Math.pow(Math.sin(PI*clamp(t,.02,.98)),.5);return [r,r*.75];},12,8,P('woodD'),{caps:true});
 for(const k of [-1,1])tube('carvedR',t=>[0,.25+t*t*.5,k*(L/2-.2+t*.4)],t=>[.06*(1-t*.5),.06*(1-t*.5)],4,5,P('carvR'));
 for(const z2 of [-L*.18,L*.18])beam('wood',[0,.32,z2],[2.0,.18,z2],.05,P('wood'),true,5);
 tube('wood',t=>[2.0,.0,(t-.5)*L*.6],t=>{const r=.1*Math.pow(Math.sin(PI*clamp(t,.03,.97)),.4);return [r,r];},8,6,P('wood'),{caps:true});
 beam('wood',[-.5,.35,-.6],[.3,.3,1.6],.03,P('woodL'),true,4);});}
defBuilding({key:'iw-fishdock',name:'Fishing dock (West)',seed:5201,w:22,d:30,h:11,budget:120000,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'west',job:'fishing'},
 note:'the fishers\' dock: a pier on tarred piles out into the bay with a finger at its head, outrigger canoes moored, a horned fish shed on the beach with drying racks, nets and fish trays',
 build(o){isNoCut(()=>{const y=.5;iwPier(0,4,-13,2.4,y,{bollards:true});iwPier(-3.8,-10.6,-12.4,5.4,y,{step:2.6});
  iwCanoe(2.4,-6,PI*.02,{});iwCanoe(-2.6,-4.5,-.05,{L:5.4});iwCanoe(3.0,-11.5,.1,{});
  /* the fish shed: an open horned roof on posts, the racks and trays under it */
  W(0,0,9.2,0,()=>{for(const x of [-3,0,3])for(const z of [-1.8,1.8])cyl('tarred',x,0,z,.13,2.4,P('tarred'),8);
   const rf=isSaddle({L:6.2,W:3.6,eaveY:2.35,ridgeY:4.6,sag:.5,hornRise:1.8,hornOut:.8,taper:.8,over:.6,mk:'thatch',col:P('thatchW'),th:.22,nu:20});rf.gable(3.1,2.35,1.8,'patGableW',{});rf.gable(-3.1,2.35,1.8,'patGableW',{});
   FURNISH('job_fish_tray',-1.5,0,0,0,{setting:'outdoor'});FURNISH('job_fish_tray',1.5,0,0,0,{setting:'outdoor'});FURNISH('generic_barrel',2.6,0,-1.2,0,{setting:'outdoor'});});
  for(const x of [-7,7])FURNISH('job_net_frame',x,0,7.5,0,{setting:'outdoor'});FURNISH('job_pole_rack',-7,0,11.5,0,{setting:'outdoor'});FURNISH('job_salt_tub',6.5,0,11.5,0,{setting:'outdoor'});
  door(0,0,13,0,2);});}});
