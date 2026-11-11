// Presets for the ship graveyard (biomes/dambasins/PLAN.md, section 3; the site: 79-db-site.js). First = opening. y = 0 is the
// old full level; the notch is at z = 0, the old lake upstream (-z).
const VIEWS=(()=>{const V={},gh=(x,z)=>DB_NAT(x,z),P=(PORT_LAYOUT.db&&PORT_LAYOUT.db.pile)||[];
 const eye=(x,z,up)=>[x,gh(x,z)+up,z];
 // the pile from up the channel, looking down it to the gap and the broken dam
 const ax=gyAxis(-2400);V['The pile from up the channel']=eye(ax+120,-2400,70).concat([gyAxis(-500),gh(gyAxis(-500),-500)+30,-500]);
 // the whole station from high over the west flank: the valley converging on the dam, the ring white on both flanks
 V['Overview']=[-1900,520,-3200,0,-260,-600];
 // the throat: low on the channel floor beside the first broadside hulks
 if(P.length){const p=P[0],z=p.z-p.L*.6-90,x=gyAxis(z)+gyChan(z).w*.35*(p.x>gyAxis(p.z)?-1:1);V['In the throat']=eye(x,z,3).concat([p.x,gh(p.x,p.z)+18,p.z]);
  // over the pile from the channel's east rim, high enough to see down into it
  {const z=(P[0].z+P[P.length-1].z)/2,x=gyAxis(z)+gyChan(z).w*1.25;V['Over the pile']=eye(x,z-500,160).concat([gyAxis(z+150),gh(gyAxis(z+150),z+150),z+150]);}
  // along the pile: from the channel's side wall, the hulls one behind another down to the gap
  const q=P[P.length-1],wx=gyAxis(q.z)+gyChan(q.z).w*1.05;V['Along the pile']=eye(wx,q.z-300,12).concat([gyAxis(-300),gh(gyAxis(-300),-300)+20,-300]);}
 // from the breach, in the gap between the dam's broken ends, looking back up the lake over the pile
 V['From the breach']=eye(gyAxis(120),120,8).concat([gyAxis(-1400),gh(gyAxis(-1400),-1400)+20,-1400]);
 // the bathtub ring on the east flank, from the old floor below it
 {const z=-2200,W=gyW(z),x=gyAxis(z)+W*.94;V['The bathtub ring']=eye(gyAxis(z)+W*.5,z-420,22).concat([x,-14,z+80]);}
 // the dam's broken end on the west abutment, from the channel floor under it
 V['The broken dam']=eye(gyAxis(-40)-30,-260,4).concat([gyAxis(0)-GY.gap*1.4,GY.crest-10,40]);
 // the wrecks among the hulks (91a-db-wrecks.js): the nearest of each state to the pile, from a little way off and low
 if(typeof DB_WRECKS!=='undefined'){const cx=P.length?P[0].x:0,cz=P.length?P[0].z:-600;
  const near=st=>{let b=null,bd=1e9;for(const w of DB_WRECKS){if(w.state!==st)continue;const d=Math.hypot(w.x-cx,w.z-cz);if(d<bd){bd=d;b=w;}}return b;};
  for(const [st,nm] of [['whole','A stranded trawler'],['snapped','Snapped in two']]){const w=near(st);if(!w)continue;
   const a=w.heading+1.1,d=w.L*1.1+25,x=w.x+Math.sin(a)*d,z=w.z+Math.cos(a)*d;V[nm]=[x,gh(x,z)+4+w.H*.4,z,w.x,w.h+w.H*.3,w.z];}}
 V['From above']=[gyAxis(-900),1700,-900,gyAxis(-850),-300,-850];
 return V;})();
