// prefix: yt
// ================================================================= THE WINTER STREET (PLAN.md section 9, Y3)
// A street of the High Country in winter: houses of every tier facing each other across a line of tunnels, each house's
// passage ending on the covered way (its covered variant), the network laid by core/city (KCITY.covered, through
// ytDoorNetPlan): junction domes where branches meet, warming domes on the long runs. Nobody walks outside in winter.
// The north row faces south and the south row north, so every node lies on the street's line.
const YT_STREET=(()=>{const north=[['yt_dome','n1'],['yt_composite_house','n2'],['yt_family_cluster','n3'],['yt_dome','n4']],
 south=[['yt_stone_dome','s1'],['yt_clan_compound','s2'],['yt_travel_dome','s3'],['yt_dome','s4']],gap=3,lane=2.6;   /* the two rows' junction domes (r 1.9 and a 0.3 m wall) stand clear of each other across the lane */
 const row=(L,side)=>{const ws=L.map(([k])=>DEFS[k].w),tot=ws.reduce((a,b)=>a+b,0)+gap*(L.length-1);let x=-tot/2;
  return L.map(([key,id],i)=>{const D=DEFS[key],cx=x+ws[i]/2;x+=ws[i]+gap;const zc=side*(D.mouth+2.4+lane);return {id,key,x:cx,z:zc,ry:side>0?PI:0,d:D.d,w:D.w};});};
 const houses=row(north,-1).concat(row(south,1));
 const ex=Math.max(...houses.map(h=>Math.abs(h.x)+h.w/2)),ez=Math.max(...houses.map(h=>Math.abs(h.z)+h.d/2));
 const plan=ytDoorNetPlan(houses,{warmEvery:22});return Object.assign(plan,{w:2*ex+2,d:2*ez+2});})();
defBuilding({key:'yt_winter_street',name:'A winter street (every tier on the covered way)',seed:9301,cls:'feature',kind:'street',w:YT_STREET.w,d:YT_STREET.d,h:7,cut:true,budget:1400000,
 front:{x:0,z:YT_STREET.d/2,yaw:0},tags:{style:'common'},
 note:'houses of every tier across a line of tunnels: each passage ends on the covered way laid by core/city; junction and warming domes',
 holes:o=>ytDoorNetHoles(YT_STREET),
 build(o){CURREC.network=ytDoorNetBuild(YT_STREET,o.v|0);}});
