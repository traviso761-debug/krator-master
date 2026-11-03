// ================================================================= HOST - the views of THE DESCENT (station 4; replaces src/98-host-views.js)
// Each from the land's own records (45b: the axis s, t, the river RIV, the pool, the shores), so they follow the ground if it moves.
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),at=(s,t,up)=>{const p=xzOf(s,t);return[p[0],Math.max(G(p[0],p[1]),0)+up,p[1]];},V=(name,a,b)=>{VIEWS[name]=[a[0],a[1],a[2],b[0],b[1],b[2]];};
 const sc=RIV.cliffS,P=RIV.pool,pool=[P.x,P.y+40,P.z],lip=[RIV.lip[0],LAKE_Y+2,RIV.lip[1]];
 V('The cataract from below',at(sc+520,-90,14),[lip[0],LAKE_Y-90,lip[2]]);
 V('The plunge pool',at(sc+200,140,6),[P.x,P.y+25,P.z]);
 V('The lip',at(sc-170,45,4),at(sc+900,TR(sc+900),-200));
 V('The amphitheatre',at(sc+60,-520,120),[lip[0],LAKE_Y-120,lip[2]]);
 V('The lake at its outlet',at(-2120,-260,10),at(-2900,200,0));
 V('Down the descent',at(sc-120,-700,90),at(900,TR(900),-150));
 V('The lower falls',at(320,TR(320)+70,10),at(140,TR(140),-20));
 V('Ālph\'s valley',at(-700,TR(-700)+180,40),at(400,TR(400),-30));
 V('Ālph onto the floor',at(1500,TR(1500)-260,24),at(2300,TR(2300),0));
 V('The sunless sea',at(1950,TR(1950)-250,12),at(3200,0,0));
 V('Ālph\'s mouth',at(2250,TR(2250)+160,14),at(seaShore(TR(2300)),TR(2300),0));
 V('From the floor up',at(1500,-300,30),[lip[0],LAKE_Y+40,lip[2]]);
 V('Over the descent',at(-3000,-2400,900),at(600,0,-400));
})();
