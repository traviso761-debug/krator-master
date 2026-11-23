// prefix: fg
// ================================================================= BARRICADE: the wall across the pass, its plan and its dress, as records (PLAN.md 1.3.2)
// The owner (2026-11-11): a second great house, unique, for the new village of Barricade: "wall across the road, except
// instead of the road it's one of the major passes into Firebliss". Proposed from there (PLAN.md 1.3.2): Barricade walls the
// Weyt Warra's gorge, the hunters' usual way up from the Labyrinth into East Bliss Vale (biomes/firebliss station 3): the
// union's picket line made stone. Nobody crosses uncounted; the Kimr pay their toll in meat and hides or turn back.
// The plan is core/pueblo's 'bar' (one long block four rows deep across the gorge, terraced down to a long plaza open
// upstream toward Firebliss, its outer face sheer, bastions where it meets the gorge's walls, two wings up the walls; a gate
// tunnel for the trail and a culvert for the river under its rooms). The dress, placed here from the plan's ids by KRAND:
//   wrecks    the barricade itself: the Ancients' wrecked cars and carriages stacked two high along the outer face
//   gates     the gate's portcullis of rail and its plate leaves; the culvert's grates of rail at both mouths
//   lookouts  crow's nests on the bastions' roofs, a horn to blow
//   pickets   red hide banners on poles along the outer parapet (the picket line's)
//   slogans   NOBODY CROSSES, THE LINE HOLDS, PAY OR GO BACK on the outer face over the wrecks
//   and Wildcat's crest (the captain's rooms), trophies round the count room (what the gate took), shells
// Plain data ([G data]): KRAND and core/pueblo only.
const FG_BC={
 GREAT:{id:'barricade',world:15510,shape:'bar',L:176,rows:4,maxStoreys:5,wallBase:2,endRise:1,wingLen:46,wingRows:2,wingMax:3,ragged:.1,people:2.4,popMax:2000,
  passages:[{x:22,w:8.4,clear:2,kind:'gate'},{x:-4,w:12.6,clear:1,kind:'culvert'}],kivas:{great:[0],small:3}},
 SLOGANS:['NOBODY CROSSES','THE LINE HOLDS','PAY OR GO BACK','NOBODY CROSSES'],
 /* the count room (the great kiva): the count boards round its wall (every crossing tallied), the toll chests, a brazier */
 KIVA:{great:[{key:'fellgang_common_count_board',w:1.8,d:.25,h:1.8,n:[3,3]},{key:'fellgang_common_chest',w:1,d:.55,h:.72,n:[2,2]},
   {key:'fellgang_common_bench',w:1.8,d:.45,h:.62,n:[2,2]},{key:'fellgang_common_brazier',w:.7,d:.7,h:1.25,n:[1,1]}],
  small:[{key:'fellgang_poor_water_jar',w:.5,d:.5,h:.8,n:[1,1]},{key:'fellgang_poor_stool',w:.5,d:.5,h:.5,n:[2,3],v:2}]}};
FG_BC.GREAT.kivaFurn=FG_BC.KIVA;
function fgBcPlan(){return fgWcPlan(FG_BC.GREAT);}
/* ---------------------------------------------------------------- the dress */
function fgBcDress(P){const D=fgWcDress(P),h=P.storey,byId=P.byId;D.slogans=[];D.deeds=[];D.wrecks=[];D.gates=[];D.lookouts=[];D.pickets=[];D.fixtures=[];
 const wall=P.cells.filter(c=>c.block==='wall'),rows=Math.max(...wall.map(c=>c.row)),outer=wall.filter(c=>c.row===rows&&!c.nb.back).sort((a,b)=>a.seg-b.seg);
 const fix=(kind,name,x,y,z,size,role)=>D.fixtures.push({kind,name,x,y,z,size,role});
 /* the wrecks: one or two hulks against each outer face, none before a passage's mouth */
 for(const c of outer){if(c.passage)continue;const E=fgWcEdge(c,'back'),n=fgWcU(P,c.seg,1,121)<.7?2:1;
  for(let k=0;k<n;k++){const len=3.6+fgWcU(P,c.seg,k,122)*1.2,kind=['car','car','van','carriage'][Math.floor(fgWcU(P,c.seg,k,123)*4)],t=(k+.5)/n-.5,along=t*E.L*.6;
   const ax=(E.b[0]-E.a[0])/E.L,az=(E.b[1]-E.a[1])/E.L,x=E.m[0]+ax*along+E.n[0]*1.0,z=E.m[1]+az*along+E.n[1]*1.0,yaw=Math.atan2(ax,az)+(fgWcU(P,c.seg,k,124)-.5)*.25;
   D.wrecks.push({id:c.id+':wreck:'+k,x,z,y:0,ry:yaw,len:Math.min(len,E.L*.95),kind,tier:0,paint:Math.floor(fgWcU(P,c.seg,k,125)*6)});
   if(fgWcU(P,c.seg,k,126)<.55)D.wrecks.push({id:c.id+':wreck:'+k+'u',x:x+E.n[0]*.1,z:z+E.n[1]*.1,y:1.45,ry:yaw+(fgWcU(P,c.seg,k,127)-.5)*.5,len:Math.min(len*.9,E.L*.9),kind:'car',tier:1,paint:Math.floor(fgWcU(P,c.seg,k,128)*6)});}}
 D.wrecks.forEach(w=>fix('wreck','a wreck of the Ancients stacked in the barricade ('+w.kind+')',w.x,w.y,w.z,[w.len,1.9,1.6],'defence'));
 /* the passages' gear: the gate's portcullis and leaves, the culvert's grates */
 for(const p of (P.passages||[]))D.gates.push({id:p.id,kind:p.kind,x0:p.x0,x1:p.x1,z0:p.z0,z1:p.z1,h:p.h,ry:p.ry});
 D.gates.forEach(g=>fix(g.kind==='gate'?'gate':'grate',g.kind==='gate'?'the gate: its portcullis of rail, its plate leaves':'the culvert\'s grates of rail',(g.x0+g.x1)/2,0,g.z1,[g.x1-g.x0,.4,g.h],'defence'));
 /* the lookouts on the bastions' roofs (the outer row's end columns) */
 for(const c of [outer[0],outer[outer.length-1]]){if(!c)continue;D.lookouts.push({id:c.id+':lookout',x:c.cx,z:c.cz,y:c.storeys*h+.14});fix('lookout','a crow\'s nest on the bastion',c.cx,c.storeys*h,c.cz,[2.4,2.4,5],'watch');}
 /* the pickets: a red banner every third cell along the outer parapet */
 outer.forEach((c,i)=>{if(i%3!==1)return;const E=fgWcEdge(c,'back');D.pickets.push({id:c.id+':picket',x:E.m[0]-E.n[0]*.17,z:E.m[1]-E.n[1]*.17,y:c.storeys*h+.5,ry:E.ry});});
 D.pickets.forEach(q=>fix('picket','a picket\'s banner on the parapet',q.x,q.y,q.z,[1.2,.1,3],'sign'));
 /* the words over the wrecks, spread along the outer face, each fitted to the run of wall each side of it */
 {const used=[];let i=0;for(const c of outer.slice().sort((a,b)=>fgWcU(P,a.seg,0,129)-fgWcU(P,b.seg,0,129))){if(D.slogans.length>=4)break;
  if(c.passage||used.some(u=>Math.abs(u.seg-c.seg)<9))continue;const text=FG_BC.SLOGANS[i%FG_BC.SLOGANS.length],half=Math.min(c.t,c.len-c.t)*.92,ch=Math.min(1.6,2*half/((text.length*4-1)/5));
  if(ch<.8)continue;used.push(c);i++;const E=fgWcEdge(c,'back');D.slogans.push({id:c.id+':slogan',text,x:E.m[0]+E.n[0]*.05,z:E.m[1]+E.n[1]*.05,y:2.2*h/2.6+1.05,ry:E.ry,ch:+ch.toFixed(2),aurochs:false});}}
 return D;}
