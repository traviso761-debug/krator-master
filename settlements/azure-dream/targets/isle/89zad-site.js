// ================================================================= GRĒṬ-ĀIL — the isle's site: the cove, the terraces, the places
// settlements/azure-dream/PLAN.md sections 1 and 4. The page's origin is the cove's head on the 1:1 waterline, scale-model px
// 846.075, 1508.493 (AD_SITE, 89z-rows.js; tools/scale-model/edit_517_azure.report.json); x east, z south (the lake), y 0 the
// lake's level (-520 m). The plan's frame (u up the slope from the cove's head, due north; v east along the shore) is
// AD_P(u, v) = [v, -u]. At 1:1 the isle's south shore here is a flat half drowned, about 400 m wide, under a steep scarp;
// the cove's head is the scarp's toe. The ground, the pads and the placement are src/89zaa-ad-ground.js's.
//   the terraces the upper precinct's four on the slope above the scarp (the gate court, the monastery, the Lotus Garden, the
//                Hall), each one level, and a pad under every building of the ward and the wharf
//   the places   AD_PLACE: every building as a record {key, x, z, ry, o: {v, y, ...}, kind, id}, placed by 90ae
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34151);
// the upper precinct: four terraces across v -170..170 above the scarp, each a level of its own
const AD_TERR={};
for(const [id,u0,u1] of[['court',160,222],['monastery',222,284],['lotus',284,348],['hall',348,484]]){const a=AD_P(u0,-170),b=AD_P(u1,170);AD_TERR[id]=adPad('terrace:'+id,a[0],a[1],b[0],b[1],null,4);}
// ---------------------------------------------------------------- the places
// the wharf, in the cove at the scarp's toe: the pilgrims' side west of the mole, the fishermonks' east of it
adPut('qb_ad_mole',-27,0,0,{y:0,len:54},'wharf','mole');
adPut('qb_ad_barge',-28,6.8,0,{y:0},'boat','barge');
adPut('qb_ghats',7,-41,0,{y:.05},'wharf','lustral-steps');
for(const [v,len,n] of[[33,42,0],[53,38,1],[73,34,2]])adPut('qb_ad_jetty',-len/2+2,v,0,{y:0,len,v:n},'wharf','jetty:'+n);
adPut('qb_ad_boathouse',11,123,0,{y:1.2},'wharf','boathouse');
adPut('qb_ad_racks',25,200,0,{v:0,w:64,d:30},'wharf','net-racks',true);
adPut('qb_ad_racks',25,262,0,{v:1,w:48,d:24},'wharf','fish-racks',true);
adPut('qb_ad_smokehouse',52,175,0,{v:0},'wharf','smokehouse:0',true);
adPut('qb_ad_smokehouse',52,189,0,{v:1},'wharf','smokehouse:1',true);
adPut('xa_warehouse',60,215,-Math.PI/2,{v:0},'wharf','net-loft',true);
adPut('qb_ad_ropewalk',85,210,0,{len:180},'wharf','ropewalk',true);
adPut('qb_workshop',30,156,0,{v:1},'wharf','boatwrights:0',true);
adPut('qb_workshop',45,160,0,{v:2},'wharf','boatwrights:1',true);
adPut('qb_ad_fishermonks',55,110,0,{},'wharf','fishermonks',true);
adPut('qb_chorten',20,0,0,{v:0},'sacred','threshold-chorten',true);
// the dugouts: drawn up on the beach in rows, and on the water by the jetties
for(let i=0;i<14;i++){const v=41+i*3.8,u=2.5+(i%2)*3.2;adPut('qb_ad_dugout',u,v,0,{v:i%3},'boat','dugout:beach:'+i);}   /* on the beach as it lies: no pad (90ae sets o.y from the ground) */
for(const [v,k] of[[30.6,0],[35.4,1],[50.6,2],[55.4,3],[70.6,4],[75.4,5]])adPut('qb_ad_dugout',-14-k*3,v,0,{v:k%3,y:-.18},'boat','dugout:water:'+k);
// the lower ward, on the slope under the scarp: the ferry house, the pilgrims' hostels (the men's and the women's ranges), the
// Hall of Fasting (the grammarians' college as its stand-in: a hall round a court), the waiting garden; east, the Order's farm
// and the lay servants' houses
adPut('qb_hostel',40,-45,Math.PI/2,{v:1},'pilgrims','ferry-house',true);
for(const [u,v,side] of[[42,-90,'men'],[70,-90,'men'],[42,-150,'women'],[70,-150,'women']])adPut('qb_hostel',u,v,Math.PI/2,{v:side==='men'?0:2},'pilgrims','hostel:'+side+':'+u,true);
adPut('qb_college',100,-112,Math.PI/2,{v:1},'pilgrims','hall-of-fasting',true);
adPut('xa_garden',100,-45,Math.PI/2,{v:1},'pilgrims','waiting-garden',true);
adPut('qb_granary',100,40,-Math.PI/2,{v:0},'farm','granary',true);
for(const v of[62,80])adPut('qb_workshop',100,v,-Math.PI/2,{v:0},'farm','dairy:'+v,true);
for(let i=0;i<6;i++)for(const u of[95,113])adPut('qb_row_poor',u,150+i*7.4,0,{v:i%3,ends:i===0?'l':i===5?'r':''},'lay','lay:'+u+':'+i,true);
// the processional way: the Stair of Lowered Eyes, a zigzag up the scarp's face (the Potala's way: the face is steeper than a
// terrace stair, which would run out into the lake): six runs across the face, each a qb_terrace_stair along v, turning on a
// landing pad at each foot, from the court terrace's front edge (u 160) down to the scarp's foot; the Lower Gate below it
const AD_COURT=AD_TERR.court;
// the terrace above's edge at uEdge: the first run 10 m out, clear of its 7 m retaining face (90ae)
const AD_STAIR=(function(){
 const n=6,SP=7.2,u0=150,fu=u0-SP*n,fy=Math.round(adBase(0,-fu)*2)/2,Z=adZigzag('stair',u0,0,AD_COURT.y,fy,n,SP);Z.fy=fy;Z.gy=AD_COURT.y;return Z;})();
// the terraces' own stairs: a zigzag down each terrace's face into the terrace below it, clear of the buildings on the axis
const AD_TSTAIRS=[['court-monastery',AD_TERR.monastery,AD_TERR.court,-62],['monastery-lotus',AD_TERR.lotus,AD_TERR.monastery,62],['lotus-hall',AD_TERR.hall,AD_TERR.lotus,72]]
 .map(([id,up,lo,vc])=>{const n=Math.max(1,Math.ceil((up.y-lo.y)/7.5)),uTop=-up.z1-10;return adZigzag(id,uTop,vc,up.y,lo.y,n,7.2);});
adPut('qb_gate_temple',AD_STAIR.footU-16,0,0,{v:0},'way','lower-gate',true);
for(const s of[-1,1])adPut('qb_chorten',AD_STAIR.footU-6,s*(AD_STAIR.len/2+9),0,{v:0},'way','stair-chorten:'+s,true);
// the upper precinct (the plan's u less 120: the slope above the scarp)
adPut('qb_gate_temple',171,0,0,{v:1,y:AD_COURT.y},'sacred','blue-gate');
adPut('qb_chorten',198,0,0,{v:2,y:AD_COURT.y},'sacred','court-chorten');
adPut('qb_monastery',252,0,0,{v:5,y:AD_TERR.monastery.y},'sacred','great-monastery');
adPut('qb_court_house',252,-80,Math.PI/2,{v:0,sp:5,y:AD_TERR.monastery.y},'sacred','prismarch-house');
for(const u of[298,312])adPut('qb_row_mid',u,-92,Math.PI/2,{v:1,sp:5,y:AD_TERR.lotus.y},'sacred','prior-house:'+u);
adPut('qb_college',252,80,-Math.PI/2,{v:0,y:AD_TERR.monastery.y},'sacred','novices-college');
adPut('qb_hostel',305,92,-Math.PI/2,{v:2,y:AD_TERR.lotus.y},'sacred','refectory');
for(const s of[-1,1])for(let i=0;i<16;i++){const u=178+i*9.4,t=u<222?'court':u<284?'monastery':'lotus';
 adPut('qb_row_mid',u,s*150,s<0?Math.PI/2:-Math.PI/2,{v:i%3,sp:5,ends:i===0?(s<0?'r':'l'):i===15?(s<0?'l':'r'):'',y:AD_TERR[t].y},'cells','cells:'+(s<0?'west':'east')+':'+i);}
for(const s of[-1,1])adPut('xa_garden',316,s*30,0,{v:s<0?0:2,y:AD_TERR.lotus.y},'garden','lotus-garden:'+(s<0?'west':'east'));   /* the Lotus Garden's two halves either side of the axis */
// its four still ponds of blue lotus, beyond the gardens either side (clear of the prior's houses, the refectory and the
// lotus-hall stair); 90ag draws their water on core/water
const AD_PONDS=[];
for(const [u,v] of[[296,-72],[312,-72],[296,72],[312,72]])AD_PONDS.push(adPut('qb_ad_lotus_pond',u,v,0,{v:AD_PONDS.length,y:AD_TERR.lotus.y},'garden','lotus-pond:'+u+','+v));
adPut('qb_ad_dream_hall',416,0,0,{y:AD_TERR.hall.y},'sacred','hall-of-dreaming');
adPut('qb_bath',385,48,-Math.PI/2,{v:0,y:AD_TERR.hall.y},'sacred','lustral-bath');
adPut('qb_ad_cup_house',408,48,-Math.PI/2,{y:AD_TERR.hall.y},'sacred','cup-house');
adPut('qb_ad_waking',400,-56,0,{y:AD_TERR.hall.y},'sacred','waking-range');
adPut('xa_garden',372,-112,Math.PI/2,{v:2,y:AD_TERR.hall.y},'garden','readers-court');
adPut('qb_hostel',446,-114,Math.PI/2,{v:1,y:AD_TERR.hall.y},'sacred','dream-keepers-house');
for(const [u,i] of[[446,0],[456,1],[466,2]])adPut('qb_row_mid',u,58,-Math.PI/2,{v:i,sp:5,ends:i===0?'l':i===2?'r':'',y:AD_TERR.hall.y},'sacred','seven-nights:'+i);
// the precinct's wall: the south front either side of the Blue Gate, the sides stepping with the terraces, the back with its gate
const AD_WALLS=[];
{const T=[AD_TERR.court,AD_TERR.monastery,AD_TERR.lotus,AD_TERR.hall];
 for(const s of[-1,1])AD_WALLS.push({a:AD_P(160,s*14),b:AD_P(160,s*170),y:AD_COURT.y,face:0});
 for(const t of T)for(const s of[-1,1])AD_WALLS.push({a:[s*170,t.z1],b:[s*170,t.z0],y:t.y,face:s*Math.PI/2});
 for(const s of[-1,1])AD_WALLS.push({a:AD_P(484,s*8),b:AD_P(484,s*170),y:AD_TERR.hall.y,face:Math.PI});}
for(const W of AD_WALLS){const L=Math.hypot(W.b[0]-W.a[0],W.b[1]-W.a[1]),m=[(W.a[0]+W.b[0])/2,(W.a[1]+W.b[1])/2];
 AD_PLACE.push({key:'qb_wall',x:m[0],z:m[1],ry:W.face,o:{v:1,len:L,y:W.y},kind:'wall',id:'wall:'+m[0].toFixed(0)+','+m[1].toFixed(0),h:5});}
// the Dream Road: out of the back gate and straight up the isle to the summit (AD_SIGNAL, 89zaa), to the near ground's edge;
// its first chorten 1 km up, and opposite it the relay lamp that answers the Station Watch (PLAN.md Q15)
const AD_DREAM=(function(){const s1=(-AD.BOX[1]-30-484)/-AD_SIGNAL.dir[1];
 const c=adPx(AD_SIGNAL.chorten),r=adPx(AD_SIGNAL.relay);
 adAt('qb_chorten',c[0],c[1],AD_SIGNAL.ry+Math.PI,{v:1},'way','dream-road-chorten:1',true);
 const R=adAt('qb_ad_relay_lamp',r[0],r[1],AD_SIGNAL.ry,{},'sacred','relay-lamp',true);
 return{a:adPx(AD_SIGNAL.gate),b:adPx(AD_SIGNAL.on(s1,0)),len:s1,relay:R};})();
// the ways (painted on the ground; 90ad): [kind, width, points (page)]
const AD_WAYS=[['way',8,[AD_P(0,0),AD_P(AD_STAIR.footU,0)]],['wharf',6,[AD_P(4,-70),AD_P(4,300)]],['way',5,[AD_DREAM.a,AD_DREAM.b]]];
// the paved courts in the precinct (page boxes)
const AD_PAVED=[[AD_P(168,-140),AD_P(222,140)],[AD_P(348,-30),AD_P(484,30)],[AD_P(284,-10),AD_P(348,10)]];
window._adSite={pads:AD_PADS.length,places:AD_PLACE.length,terraces:Object.fromEntries(Object.entries(AD_TERR).map(([k,t])=>[k,t.y])),stair:{rise:+AD_STAIR.rise.toFixed(2),len:+AD_STAIR.len.toFixed(1),footU:+AD_STAIR.footU.toFixed(1)}};
