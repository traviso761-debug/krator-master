// prefix: cy
// ================================================================= THE PEAK (Kam-Hau): miners and gem tappers of the fog wall and the gem hills
// PLAN.md sections 2 and 3: dry-stone huts and walls of slabby stone laid without mortar; cliff houses in the fog wall's alcoves
// (Mesa Verde's shape: the owner, 2026-11-16), laid by KHAMLET.platform's alcove mode on the kit's draft Peak row
// (34-cy-rows.js CY_ROW_PEAK); the mine works (adit, open-cast benches, sorting shed, tappers' shelter, washing troughs).
// Emerald and turquoise nodes are kits/resources' (node-emerald-*, node-turquoise-*, 2026-11-16): the sheet's sample stands on no
// map, so it passes its node; a host on the map lets KHAMLET.resourceFor take the nearest.
//   cyStoneRoom(IW,ID,H,o)   a dry-stone room entered by a stone ear door in its south face: flat beamed roof, a sleeping
//                            platform, a hearth, hides; o.porch a lean-to before the door
//   cy_stone_hut, cy_stone_house, cy_stone_store   the Peak's houses and its corbelled store (the row's houses and stores)
//   cy_cliff_house          one room of an alcove village (the platform row's room and store: 4.6 m square, flush roofs)
//   cy_round_room           the round room sunk in the alcove's yard (the platform row's kivas): a cribbed roof, a bench ring,
//                           the fire pit and its deflector
//   cy_fold                 a dry-stone goat fold
//   cy_adit, cy_ore_bench, cy_sorting_shed, cy_tappers_camp, cy_wash   the mine's works
//   cy_village_peak         the sample alcove village: thirty people on a ledge under an overhang in a stand-in cliff of tuff
function cyStoneRoom(IW,ID,H,o){o=o||{};const t=CY.WALL,x0=-IW/2-t/2,x1=IW/2+t/2,z0=-ID/2-t/2,z1=ID/2+t/2;
 cyRing(x0,z0,x1,z1,0,H,{mk:'stone',socle:0,plaster:false,holes:{s:cyEarHoles(IW/2+t/2+(o.doorX||0),.85,1.95)}});
 box('floor',0,0,0,IW,.06,ID,P('floor'));
 cyEarDoor(o.doorX||0,z1,0,.85,1.95,{stone:true,name:'the house door'});
 cyRoof(x0-t/2,z0-t/2,x1+t/2,z1+t/2,H,{});
 cyPlatform(-IW/2,-ID/2,IW/2,-ID/2+.9,.32,{col:P('mudL')});
 for(let i=0;i<Math.max(1,Math.floor(IW/1.4));i++)box('hide',-IW/2+.7+i*1.4,.33,-ID/2+.45,1.1,.04,.7,P('hide'));
 cyHearth(-IW/4,.35,{r:.34});
 if(o.porch)cyShade(-IW/2-.1,z1+.2,IW/2+.1,z1+1.8,2.1,{posts:[[-IW/2-.1,z1+1.8],[IW/2+.1,z1+1.8]]});
 cyTarget(IW/4,.06,0,'floor');}
const CY_PEAK_TAGS=(w,type,role,job)=>({types:[type||'dwelling-single'],wealth:w,style:'peak',role:role||'house',job});
defBuilding({key:'cy_stone_hut',name:'Peak hut (dry stone)',seed:9501,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_PEAK_TAGS('poor'),w:4.7,d:4.3,h:2.9,budget:20000,cut:true,
 note:'a miner\'s hut of slabby stone laid dry, its door the ear door in stone (a slab lintel, two ear stones on it); a sleeping platform under hides, a hearth',
 build(o){cyStoneRoom(3.6,3.2,2.3);}});
defBuilding({key:'cy_stone_house',name:'Peak house (dry stone, a porch)',seed:9502,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_PEAK_TAGS('middle'),w:6.2,d:7.0,h:3.0,budget:25000,cut:true,
 note:'a larger dry-stone house with a reed porch before its ear door, turquoise beads drying on a cord',
 build(o){cyStoneRoom(5.0,4.0,2.4,{porch:true});
  pole('rope',[-1.6,2.0,3.2],[1.6,2.0,3.2],.008,P('rope'),4);for(let i=0;i<9;i++)sph('turq',-1.4+i*.35,1.96,3.2,.035,P('turq'),1,6);}});
defBuilding({key:'cy_stone_store',name:'Peak store (corbelled stone)',seed:9503,cls:'building',kind:'store',frag:'kits/coyote',
 tags:CY_PEAK_TAGS('poor','industry','store'),w:3.4,d:3.4,h:2.6,budget:10000,front:{x:0,z:1.7,yaw:0},
 note:'a beehive store of stone courses stepped in to a capstone, its low door shut with a slab',
 build(o){svNoWalk(()=>{lathe('stone',0,0,[[1.6,0],[1.55,.8],[1.3,1.6],[.8,2.25],[.25,2.5],[0,2.55]],14,P('stone'));
  box('slab',0,0,1.5,.7,1.0,.12,P('stone'));box('slab',0,1.0,1.48,.95,.16,.3,P('stone'));});}});
/* the alcove's rooms, as KHAMLET.platform's records give them (o.rec), as cyCell does on the tell */
const CY_CLIFF={W:4.6,IW:4.6-2*.42,H:2.46};
function cyCliff(o){const r=o.rec||{},store=r.role&&r.role!=='house';
 const M=cyMainRoom(0,{IW:CY_CLIFF.IW,ID:CY_CLIFF.IW,H:CY_CLIFF.H,store,flush:true,mk:'stone',plaster:true,socle:0,covered:!!o.covered,floorHole:!!o.floorHole,
  door:r.entry==='door'?{x:.12}:null});
 if(!o.rec)cyOutLadder(-1.2,M.top,CY_CLIFF.IW);}
defBuilding({key:'cy_cliff_house',name:'Peak cliff room (an alcove cell)',seed:9504,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_PEAK_TAGS('poor'),w:CY_CLIFF.W,d:CY_CLIFF.W,h:2.7,budget:30000,cut:true,front:{x:-1.2,z:3.75,yaw:0},
 note:'a dry-stone room of an alcove village, plastered inside, entered by its roof or by an ear door onto the terrace before an upper room; a store when the record says so',
 build(o){cyCliff(o||{});}});
defBuilding({key:'cy_round_room',name:'Peak round room (sunk, cribbed roof)',seed:9505,cls:'building',kind:'hall',frag:'kits/coyote',
 tags:CY_PEAK_TAGS('middle','civic','council'),w:5.2,d:6.2,h:3.0,budget:30000,cut:true,front:{x:-1.0,z:3.6,yaw:0},
 note:'the alcove village\'s round room, sunk in the ledge (the platform row\'s kivas): dry-stone walls, a bench ring, the fire pit and its deflector slab, a roof cribbed of logs under earth, entered by its hatch',
 build(o){const R=2.2,T=.4,Hh=2.36;
  sector('stone',0,0,R,R+T,0,TAU,0,Hh,P('stone'),28);box('floor',0,0,0,2*R,.06,2*R,P('floor'));
  sector('lime',0,0,R-.45,R,0,TAU,0,.5,P('lime'),28);
  cyl('ash',0,.06,-.3,.45,.03,P('ash'),14);box('slab',0,0,.55,.7,.75,.12,P('stone'));
  svNoWalk(()=>{for(let k=0;k<3;k++){const r=R+.1-k*.45,y=Hh-.1+k*.1;for(let i=0;i<6;i++){const a=i/6*TAU+k*.26,b=a+TAU/6;
   pole('timber',[Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y,Math.sin(b)*r],.09,P('timber'),6);}}});
  const W0=2*(R+T),zf=R-.4,run=(Hh+.24-.06)/CY.LEAN,zt=zf-run,hole={x0:.5,x1:1.3,z0:zt-.08,z1:zt+1.0};
  cyLadder(.9,zf,.06,Hh+.24,PI);
  const top=cyRoof(-W0/2,-W0/2,W0/2,W0/2,Hh,{hole,flush:true});cyHatchFrame(hole,top,'n');
  const yard=top-.84,hs=.42,zo=W0/2;
  box('stone',-1.0,yard+hs,zo+.2,1.6,hs,.4,P('stone'));box('stone',-1.0,yard,zo+.2,1.6,hs,.4,P('stone'));box('stone',-1.0,yard,zo+.6,1.6,hs,.4,P('stone'));
  cyTarget(-.8,.06,-.6,'round room floor');cyTarget(-1.6,top,-1.4,'roof');}});
defBuilding({key:'cy_fold',name:'Goat fold (dry stone)',seed:9506,cls:'building',kind:'pen',frag:'kits/coyote',
 tags:CY_PEAK_TAGS('poor','farm','pen','herding'),w:10,d:8,h:1.8,budget:12000,front:{x:0,z:4,yaw:0},
 note:'a dry-stone fold, its gap closed with a hurdle of poles',
 build(o){cyRing(-4.8,-3.8,4.8,3.8,0,1.3,{t:.45,mk:'stone',socle:0,plaster:false,holes:{s:[{at:4.8,w:1.4,y:0,h:1.3}]}});
  for(let i=0;i<3;i++)pole('timber',[-.75,.35+i*.35,3.9],[.75,.35+i*.35,3.9],.035,P('timber'),5);door(0,0,3.8,0,1.4,1.3);}});
/* ---------------------------------------------------------------- the mine's works */
const CY_MINE=(role,job)=>CY_PEAK_TAGS('poor','industry',role||'works',job||'mining');
function cyPile(x,z,r,col,mk){svNoWalk(()=>lathe(mk||'gravel',x,z,[[r,0],[r*.7,r*.35],[r*.25,r*.6],[0,r*.66]],12,col==null?P('gravel'):col));}
function cyGems(x,y,z,n,key){for(let i=0;i<n;i++)sph(key==='emerald'?'plain':'turq',x+rr(-.2,.2),y+.03,z+rr(-.14,.14),rr(.02,.045),key==='emerald'?P('emerald'):P('turq'),.8,5);}
function cyBasket(x,z,o){o=o||{};svNoWalk(()=>lathe('reed',x,z,[[.18,0],[.26,.12],[.28,.36],[.27,.4]],10,P('reed')));if(o.ore)cyPile(x,z+.0,.22,o.ore==='emerald'?P('schist'):P('turq'),o.ore==='emerald'?'schist':'turq');}
defBuilding({key:'cy_adit',name:'Mine adit (timbered portal)',seed:9601,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_MINE('works','mining'),w:8,d:6,h:6,budget:25000,front:{x:0,z:1.9,yaw:0},
 note:'a timbered drift into a rock face: posts and caps every metre, a fire-setting hearth inside, baskets of ore, the spoil heap beside it (the rock face a stand-in for the hill the host gives)',
 build(o){const pw=1.5,ph=2.0;box('rock',-2.4,0,-2.0,3.2,6,4,P('rock'));box('rock',2.4,0,-2.0,3.2,6,4,P('rock'));box('rock',0,ph,-2.0,pw+.2,6-ph,4,P('rock'));
  for(let i=0;i<4;i++){const z=-.2-i*1.2;for(const s of [-1,1])cyPost(s*pw/2,z,ph,.08);pole('timber',[-pw/2-.15,ph,z],[pw/2+.15,ph,z],.09,P('timber'),6);}
  box('floor',0,0,-2.0,pw,.04,4,P('gravel'));svRoom(0,0,-3.95,0,pw,ph);cyl('ash',0,.04,-3.2,.35,.03,P('ash'),10);
  cyPile(3.2,1.8,1.4);cyBasket(-1.2,.9,{ore:'emerald'});cyBasket(-1.7,1.3,{ore:'emerald'});
  door(0,0,0,0,pw,ph);}});
defBuilding({key:'cy_ore_bench',name:'Open-cast benches (emerald schist)',seed:9602,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_MINE('works','quarrying'),w:12,d:10,h:4.2,budget:20000,front:{x:0,z:5,yaw:0},
 note:'three benches cut into a schist hill, green pockets in their faces, a ladder between them, baskets and the spoil cone',
 build(o){for(let k=0;k<3;k++){const zb=-1.2-k*1.8,h=1.3*(k+1),zc=zb-(4-k*1.8)/2+.9;box('schist',0,0,zc,10-k*1.5,h,1.8,P('schist'));
   wkPad(0,zc,10-k*1.5,1.8,h);   /* a bench is a tall box (a block to the walk): its top a floor */
   for(let i=0;i<5;i++)box('plain',-3.5+i*1.6+rr(-.3,.3),h-.6+rr(-.2,.2),zb+.92,.12,.09,.02,P('emerald'));}
  svStair(-3.2,-1.4+.55,0,1.3,PI,{style:'ladder',w:.45,run:.5,mk:'timber',col:P('timber')});   /* foot before the first bench's face (z -1.4), top on its edge */
  cyPile(4.2,3.2,1.6);cyBasket(-1,1.2,{ore:'emerald'});cyBasket(.2,1.5,{ore:'emerald'});cyTarget(0,1.3,-1.8,'first bench');}});
defBuilding({key:'cy_sorting_shed',name:'Gem sorting shed',seed:9603,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_MINE('works','mining'),w:6,d:4,h:2.8,budget:15000,front:{x:0,z:2,yaw:0},
 note:'a reed shade over the sorters\' benches: ore broken with hammerstones, emeralds and turquoise picked out into bowls, the waste swept to a heap',
 build(o){cyShade(-2.6,-1.6,2.6,1.6,2.4);
  for(const z of [-.7,.6]){box('slab',0,0,z,4.2,.55,.6,P('stone'));cyGems(-1.2,.55,z,10,'emerald');cyGems(1.0,.55,z,10,'turq');
   for(let i=0;i<3;i++)sph('slab',-.2+i*.3,.6,z,.07,P('stone'),.8,6);}
  cyPile(-2.2,1.3,.6);}});
defBuilding({key:'cy_tappers_camp',name:'Turquoise tappers shelter',seed:9604,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_MINE('works','mining'),w:5,d:4,h:2.4,budget:12000,front:{x:0,z:2,yaw:0},
 note:'a ledge shelter of the turquoise tappers: a dry-stone windbreak, a hide awning, sleeping hides, the vein face they work with bronze picks',
 build(o){cyWall(-2.2,-1.4,2.2,-1.4,0,1.2,{t:.4,mk:'stone',socle:0});cyWall(-2.2,1.2,-2.2,-1.4,0,1.0,{t:.4,mk:'stone',socle:0});
  box('turq',.8,0,-1.75,2.4,2.2,.3,P('turq'));
  W(0,0,0,0,()=>{box('hide',-.4,1.9,-.3,3.2,.04,2.4,P('hide'),0,.25);});for(const x of [-1.8,1.2])cyPost(x,.8,1.6,.05);
  box('hide',-1.2,.02,-.6,1.4,.04,.8,P('hide'));cyHearth(.6,.6,{r:.25});
  pole('wood',[1.6,0,-1.3],[1.4,.9,-1.45],.025,P('wood'),5);box('plain',1.38,.9,-1.47,.08,.04,.22,new THREE.Color(.62,.42,.2));
  cyPile(1.5,.8,.35,P('turq'),'turq');}});
defBuilding({key:'cy_wash',name:'Emerald washing troughs',seed:9605,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_MINE('works','mining'),w:7,d:3,h:1.4,budget:12000,front:{x:0,z:1.5,yaw:0},
 note:'a stone channel fed from a cistern jar, the gravel rocked in reed sieves over it, the green caught in the riffles',
 build(o){for(const z of [-.45,.45])box('slab',0,0,z,5.6,.45,.18,P('stone'));box('stone',0,0,0,5.6,.12,.72,P('stone'));
  box('water',0,.3,0,5.5,.02,.7,new THREE.Color(.36,.5,.48));for(let i=0;i<6;i++)box('slab',-2.4+i*.95,.12,0,.06,.08,.7,P('stone'));
  cyJar(-3.0,0,{h:1.1,r:.4});for(let i=0;i<2;i++)W(-.8+i*1.8,.5,0,0,()=>{box('reed',0,0,0,.7,.06,.5,P('reed'));});
  cyPile(2.9,.9,.5);cyGems(.6,.47,.62,6,'emerald');}});
/* ---------------------------------------------------------------- the alcove village (KHAMLET.platform's alcove mode) */
function cyAlcoveLine(L,dz){const line=[];for(let i=0;i<=12;i++){const a=(i/12-.5)*1.2;line.push([Math.sin(a)*L*.8,-Math.cos(a)*L*.45+dz]);}return line;}
defBuilding({key:'cy_village_peak',name:'Peak alcove village (KHAMLET.platform)',seed:9701,cls:'building',kind:'village',frag:'kits/coyote',
 tags:{types:['dwelling-multi'],wealth:'poor',style:'peak',role:'village'},w:106,d:62,h:22,budget:1600000,front:{x:0,z:20,yaw:0},
 note:'a Peak village of thirty in an alcove of the fog wall: dry-stone rooms on the ledge under the overhang, the round rooms sunk in its yard, a ladder up the ledge, the mine\'s works at the foot (its emerald node passed: the sheet stands on no map)',
 build(o){o=o||{};const floor=6,height=9,depth=20,line=cyAlcoveLine(90,22),world=o.world==null?9:o.world;
  const V=KHAMLET.platform({id:o.id||'peak-1',world,culture:CY_ROW_PEAK,focus:'mine',popMax:o.pop==null?30:o.pop,dims:cyDims,
   ground:{ok:()=>true,h:()=>0},link:{x:0,z:120},resource:{kind:'emerald',x:30,z:62,workers:24},
   alcove:{line,depth,floor,height,foot:0,side:1}});
  if(V.error){reportErr('cy_village_peak: '+V.error);return;}
  /* the stand-in cliff: the ledge (its top the yard and the walk), the rock behind the back wall, the overhang, the two ends */
  const n=line.length,tan=i=>{const a=line[Math.max(0,i-1)],b=line[Math.min(n-1,i+1)],L=Math.hypot(b[0]-a[0],b[1]-a[1]);return [(b[0]-a[0])/L,(b[1]-a[1])/L];};
  const off=(i,d)=>{const t=tan(i);return [line[i][0]-t[1]*d,line[i][1]+t[0]*d];};
  const front=line.map((p,i)=>off(i,depth)),back=line.map((p,i)=>off(i,-4)),ledge=line.concat(front.slice().reverse());
  const sunk=V.records.filter(r=>r.sunk),topY=floor+height;
  cyMound(ledge,0,floor,{mkSide:'rock',colSide:P('rock'),mkTop:'floor',colTop:P('gravel'),holes:sunk.map(r=>({x:r.x,z:r.z,w:r.w,d:r.d,ry:r.ry})),walk:true});
  cyMound(line.concat(back.slice().reverse()),0,topY+4,{mkSide:'rock',mkTop:'rock',colSide:P('rock'),colTop:P('rock')});
  cyMound(back.concat(front.slice().reverse()),topY,topY+4,{mkSide:'rock',mkTop:'rock',colSide:P('rock'),colTop:P('rock'),bottom:true});
  for(const e of [[0,1],[n-1,n-2]]){const p=line[e[0]],q=front[e[0]],d=[p[0]-line[e[1]][0],p[1]-line[e[1]][1]],L=Math.hypot(d[0],d[1]),u=[d[0]/L*3,d[1]/L*3];
   cyMound([p,q,[q[0]+u[0],q[1]+u[1]],[p[0]+u[0],p[1]+u[1]]],0,topY+4,{mkSide:'rock',mkTop:'rock',colSide:P('rock'),colTop:P('rock')});}
  const rooms=V.records.filter(r=>r.storey!=null),byCell={};
  for(const r of rooms)byCell[r.cell.join(':')+':'+r.storey]=r;
  for(const r of rooms)place(r.key,r.x,r.z,r.ry,{y:r.y,rec:r,covered:!!byCell[r.cell.join(':')+':'+(r.storey+1)],floorHole:r.storey>0});
  for(const r of V.records)if(r.storey==null)place(r.key,r.x,r.z,r.ry,{y:r.y});
  for(const L of V.ladders){const dx=L.top.x-L.foot.x,dz=L.top.z-L.foot.z,run=Math.hypot(dx,dz);
   svStair(L.foot.x,L.foot.z,L.foot.y,L.top.y,Math.atan2(dx,dz),{style:'ladder',w:.55,riser:CY.RUNG,run:Math.max(run,.3),mk:'timber',col:P('timber')});}
  if(CURREC){CURREC.village={id:V.id,pop:V.census.pop,households:V.census.households,records:V.records.length,rooms:rooms.length,
   upper:rooms.filter(r=>r.storey>0).length,ladders:V.ladders.length,pending:V.pendingKeys.slice(),resource:V.resource||null};
   const g0=rooms.find(r=>r.storey===0&&r.role==='house'&&!byCell[r.cell.join(':')+':1']),sr=sunk[0];
   cyTarget(V.plaza.x,floor,V.plaza.z,'the ledge');
   if(g0)cyTarget(g0.x,g0.y+.06,g0.z,'a room');
   if(sr)cyTarget(sr.x,sr.y+.06,sr.z,'the round room');}}});
