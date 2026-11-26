// ================================================================= HOST — the station: THE CALDERA WALL (station 1b)
// The summit's second page (the owner, 2026-10-26): the main wall's stretch north-east of the vent, its six collapse
// terraces of titanium basalt, the floor at its foot and the rim at 25,000 m with the sealed portal; the pit and its vent
// 23 km off in the far country. The fields (45-host-stage.js src/44a-host-station.js) are the same; the field is finer (8 m)
// for the scarps.
const STN={key:'wall',title:'Krator Godthrone: the caldera wall',
 hint:'The Godthrone\'s caldera wall (station 1b): 3 km of titanium-basalt flows in six collapse terraces, the caldera\'s floor at 22 km at its foot, the rim at 25 km and the Ancients\' sealed portal on it; the summit vent fuming 23 km off. N for night',
 centre:[0,0],R:4800,step:8,vent:false,summit:true,
 /* the scarps the close views stand under, at 2 m: the first foot of scarp 2 on the line t=600 and a bench of scarp 3's on
    t=-1400 (99-host-take.js finds its views by the same search), each box 520 m square */
 insets:()=>{const o=[],find=(t,ok)=>{for(let s=1000;s<4200;s+=10){const p=xzOf(s,t),w=wallAt(p[0],p[1],{});if(ok(w))return p;}return null;};
  const a=find(600,w=>!w.onScarp&&w.scarp===2&&w.toFoot<60&&w.toFoot>30),b=find(-1400,w=>!w.onScarp&&w.scarp===3&&w.u>.3&&w.u<.7);
  if(a)o.push({x:a[0]+120,z:a[1]-120,r:260,st:2,name:'scarp'});if(b)o.push({x:b[0]+60,z:b[1]+60,r:260,st:2,name:'bench'});return o;},portal:true,site:{px:585.95,py:924.5},
 spine:()=>[xzOf(0,0),xzOf(1500,0),xzOf(2800,-900),xzOf(-600,-1300),xzOf(3600,1500),[PORTAL.x,PORTAL.z]]};
