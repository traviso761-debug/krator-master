// Presets for the east bed inside Korona (biomes/dambasins/PLAN.md, section 3; the site: 79-db-site.js). First = opening. y = 0 is the
// east lake's old full level (1,050 m); -z the land (Korona's western ring), +z the old bed.
const VIEWS=(()=>{const V={},gh=(x,z)=>DB_NAT(x,z),T=(PORT_LAYOUT.db&&PORT_LAYOUT.db.trapped)||[],zs=x=>dbShore(x);
 const eye=(x,z,up)=>[x,gh(x,z)+up,z];
 // from out on the old bed, looking back at the shore: the ring white along the foot of Korona's wall, the forest over both
 V['The old shore from the bed']=eye(300,zs(300)+1300,40).concat([0,120,zs(0)-1200]);
 // the whole station, high over the bed: the forest on the old lake floor, the ring's line, the wall rising behind
 V['Overview']=[1800,900,zs(1800)+3600,-200,0,zs(-200)-600];
 // on the old line, looking out over where the lake was
 V['From the old line']=eye(-400,zs(-400)-8,6).concat([200,-160,zs(200)+3200]);
 // the bathtub ring close: the calcite band under the old line, from its foot
 V['The bathtub ring']=eye(-900,zs(-900)+330,5).concat([-700,-14,zs(-700)+30]);
 // a trapped hulk in the forest, and the highest of them from the strandline above it
 if(T.length){const t=T[0],a=t.h+1.2,d=t.L*.9+40,x=t.x+Math.sin(a)*d,z=t.z+Math.cos(a)*d;V['A hulk in the forest']=eye(x,z,6).concat([t.x,gh(t.x,t.z)+12,t.z]);
  const u=T.reduce((m,q)=>gh(q.x,q.z)>gh(m.x,m.z)?q:m,T[0]);V['The highest hulk']=eye(u.x-220,u.z-260,30).concat([u.x,gh(u.x,u.z)+10,u.z]);}
 // up the wall: from a spur 900 m over the line, down over the shore and the bed
 V['From Korona\'s wall']=eye(600,zs(600)-2600,30).concat([0,-100,zs(0)+1600]);
 V['From above']=[0,2400,zs(0)+1500,0,-120,zs(0)+1520];
 return V;})();
