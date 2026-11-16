// ================================================================= GRĒṬ-ĀIL — the site: the ground at 1:1, the cove, the terraces, the places
// settlements/azure-dream/PLAN.md sections 1 and 4. The page's origin is the cove's head on the 1:1 waterline, scale-model px
// 846.075, 1508.493 (world metres 150, 2986: tools/scale-model/edit_517_azure.report.json); x east, z south (the lake), y 0 the
// lake's level (-520 m). The plan's frame (u up the slope from the cove's head, due north; v east along the shore) is
// AD_P(u, v) = [v, -u].
//   the ground   the scale model's cut round the cove (region/data, gen/39ad-world-data.js) through the open world's fields
//                (WORLD.H, openworld/isle-demo 41-world-fields.js, read in place), in world metres x = (px-846)*2000,
//                z = (py-1507)*2000: the page is world - (150, 2986). At 1:1 the isle's south shore here is a flat half drowned,
//                about 400 m wide, under a steep scarp; the cove's head is the scarp's toe, where the flat is under water
//   the cove     the two headland records of edit_517_azure.py (lf_azure_cove_west, lf_azure_cove_east), stamped through
//                WORLD.landHook with core/world's island profile (41l-world-landforms.js, which this branch does not have: the
//                same records, the same profile, without the waterline's noise wobble; KNOWN_ISSUES.md)
//   the terraces the upper precinct's four on the slope above the scarp (the gate court, the monastery, the Lotus Garden, the
//                Hall), each one level (the mean of the ground under it, cut and filled), and a pad under every building of the
//                ward and the wharf (its footprint and 3 m); terrainH blends each over a 4-6 m skirt; 90ae draws the retaining
//                faces where one stands off the ground
//   the places   AD_PLACE: every building as a record {key, x, z, ry, o: {v, y, ...}, kind, id}, placed by 90ae
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34151);
// the region's frame: world metres x = (px - origin)*2000, z likewise (WORLD_DATA.meta.frame.origin_px, the cut's own centre)
const AD_O=WORLD_DATA.meta.frame.origin_px,adWx=px=>(px-AD_O[0])*2000,adWz=py=>(py-AD_O[1])*2000;
const AD={PX:[846.075,1508.493],LAKE:-520,BOX:[-800,-600,800,600]};   /* the near ground: x -800..800, z -600 (uphill) .. 600 (the cove and out): whole 400 m cells of the far ground's grid (90ad) */
AD.WX=adWx(AD.PX[0]);AD.WZ=adWz(AD.PX[1]);   /* the page's origin, the cove's head, in world metres */
const AD_P=(u,v)=>[v,-u];
const adSm=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// ---------------------------------------------------------------- the cove's headlands (world metres)
const AD_ARMS=[{id:'lf_azure_cove_west',x:adWx(845.91),z:adWz(1508.568),r:220,crest:-490},
 {id:'lf_azure_cove_east',x:adWx(846.24),z:adWz(1508.568),r:220,crest:-486}];
WORLD.landHook=(x,z,h)=>{for(const L of AD_ARMS){const d=Math.hypot(x-L.x,z-L.z);if(d>=L.r*1.8*1.15)continue;   /* 41l: the first record in reach stamps */
  const u=d/L.r;if(u>=1.8)return h;const rise=L.crest-AD.LAKE,cap=1-adSm(.15,1,u),t=AD.LAKE+rise*cap-8*adSm(1,1.6,u);return Math.max(h,h+(t-h)*(1-adSm(1.3,1.8,u)));}
 return h;};
WORLD.init(WORLD_R);
const adBase=(x,z,mw)=>WORLD.H(x+AD.WX,z+AD.WZ,mw||0)-AD.LAKE;
// ---------------------------------------------------------------- the pads and terraces
const AD_PADS=[];
function adLevel(x0,z0,x1,z1){let s=0,n=0;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){s+=adBase(x0+(x1-x0)*i/4,z0+(z1-z0)*j/4);n++;}return Math.round(s/n*2)/2;}
function adPad(id,x0,z0,x1,z1,y,skirt){const P={id,x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),skirt:skirt==null?5:skirt};P.y=y==null?adLevel(P.x0,P.z0,P.x1,P.z1):y;AD_PADS.push(P);return P;}
function adPadAt(x,z){for(let i=AD_PADS.length-1;i>=0;i--){const p=AD_PADS[i];if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p;}return null;}
const _adT={x:NaN,z:NaN,h:0};
terrainH=function(x,z){if(x===_adT.x&&z===_adT.z)return _adT.h;let h=adBase(x,z);
 for(const p of AD_PADS){const dx=Math.max(p.x0-x,0,x-p.x1),dz=Math.max(p.z0-z,0,z-p.z1);if(dx>=p.skirt||dz>=p.skirt)continue;const d=Math.hypot(dx,dz);if(d>=p.skirt)continue;h+=(p.y-h)*(1-adSm(0,p.skirt,d));}
 _adT.x=x;_adT.z=z;_adT.h=h;return h;};
// the upper precinct: four terraces across v -170..170 above the scarp, each a level of its own
const AD_TERR={};
for(const [id,u0,u1] of[['court',160,222],['monastery',222,284],['lotus',284,348],['hall',348,484]]){const a=AD_P(u0,-170),b=AD_P(u1,170);AD_TERR[id]=adPad('terrace:'+id,a[0],a[1],b[0],b[1],null,4);}
// ---------------------------------------------------------------- the places
const AD_PLACE=[];
// a building at the plan's (u, v), its front turned by ry (0: toward the lake, south; PI/2: east; -PI/2: west; PI: uphill), o its
// options; pad: its own pad (its footprint turned, plus 3 m, at the mean under it) unless it stands on a terrace or the water
function adPut(key,u,v,ry,o,kind,id,pad){const c=AD_P(u,v),D=VERN.defs[key];if(!D)throw new Error('azure-dream: no def '+key);
 const q={key,x:c[0],z:c[1],ry,o:Object.assign({v:0},o||{}),kind,id:id||kind+':'+key+':'+u+','+v,h:D.h==null?10:D.h,w:D.fw==null?D.w:D.fw,d:D.fd==null?D.d:D.fd};
 if(pad&&q.o.y==null){const side=Math.abs(Math.sin(ry))>.5,hw=(side?q.d:q.w)/2+3,hd=(side?q.w:q.d)/2+3;q.pad=adPad('pad:'+q.id,q.x-hw,q.z-hd,q.x+hw,q.z+hd,null,6);q.o.y=q.pad.y;}
 AD_PLACE.push(q);return q;}
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
// a zigzag stair: n runs across a slope or a terrace's face, each a qb_terrace_stair along v centred on vc, turning on a landing
// pad at each foot, from (uTop, yTop) down to yFoot, each run S m further down the slope (south) than the last
function adZigzag(id,uTop,vc,yTop,yFoot,n,S){const r=(yTop-yFoot)/n,L=qnStairPlan(r).len,runs=[];let y=yTop;
 for(let k=0;k<n;k++){const u=uTop-S*k,east=k%2===0;runs.push({u,v0:vc+(east?-L/2:L/2),v1:vc+(east?L/2:-L/2),ry:east?Math.PI/2:-Math.PI/2,y,r});y-=r;}
 for(const R of runs){adPut('qb_terrace_stair',R.u,R.v0,R.ry,{v:0,rise:R.r,w:5.6,y:R.y},'way',id+':'+R.u.toFixed(1));
  const c=AD_P(R.u-3.6,R.v1);adPad('landing:'+id+':'+R.u.toFixed(1),c[0]-4.5,c[1]-6.2,c[0]+4.5,c[1]+6.2,R.y-R.r,2);}   /* the landing: under this run's foot and the next run's head */
 const h=AD_P(uTop+11,runs[0].v0-3.6),g=AD_P(uTop-1.5,runs[0].v0+3.6);adPad('landing:'+id+':head',h[0],h[1],g[0],g[1],yTop,1.5);   /* the head: from the edge above, over its face, to the first run */
 return{yTop,yFoot,rise:yTop-yFoot,r,len:L,n,runs,footU:uTop-S*n};}
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
// the ways (painted on the ground; 90ad): [kind, width, points (page)]
const AD_WAYS=[['way',8,[AD_P(0,0),AD_P(AD_STAIR.footU,0)]],['wharf',6,[AD_P(4,-70),AD_P(4,300)]]];
// the paved courts in the precinct (page boxes)
const AD_PAVED=[[AD_P(168,-140),AD_P(222,140)],[AD_P(348,-30),AD_P(484,30)],[AD_P(284,-10),AD_P(348,10)]];
// ---------------------------------------------------------------- the flora's mask and fields (the Vale of Xanadu's biome, the page's own)
// the isle's woods on the open slopes (1), the shore zone by the water (.8: the dawn redwoods, frost willows and reeds stand
// there), the odd tree on a terrace's open ground; nothing on the water, a pad, a way or a building's footprint, or off the near
// ground (the far ground is coarser and dropped under it). The biome zones itself from the fields: wet near the lake, upland by
// height. Bound as Qiblai's city binds it (Object.assign on BIO.host); grown and baked in 90ae.
const adSegD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l?((x-a[0])*dx+(z-a[1])*dz)/l:0;t=t<0?0:t>1?1:t;return Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z);};
function adBioMask(x,z){const B=AD.BOX;if(x<B[0]+20||x>B[2]-20||z<B[1]+20||z>B[3]-20)return 0;const h=terrainH(x,z);if(h<1.4)return 0;
 for(const p of AD_PLACE){if(p.kind==='wall'){if(adSegD(x,z,loc(p.x,p.z,-p.o.len/2,0,p.ry),loc(p.x,p.z,p.o.len/2,0,p.ry))<6)return 0;continue;}
  const r=Math.hypot(p.w==null?10:p.w,p.d==null?10:p.d)/2+2;if(Math.abs(x-p.x)<r&&Math.abs(z-p.z)<r&&Math.hypot(x-p.x,z-p.z)<r)return 0;}
 for(const b of AD_PAVED)if(x>=Math.min(b[0][0],b[1][0])-2&&x<=Math.max(b[0][0],b[1][0])+2&&z>=Math.min(b[0][1],b[1][1])-2&&z<=Math.max(b[0][1],b[1][1])+2)return 0;
 const pd=adPadAt(x,z);if(pd)return pd.id.startsWith('terrace:')?.22:0;   /* the terraces' grass: trees here and there between the buildings */
 for(const [k,w,P] of AD_WAYS)for(let i=0;i+1<P.length;i++)if(adSegD(x,z,P[i],P[i+1])<w/2+2)return 0;
 return h<12?.8:1;}
if(typeof BIO!=='undefined'&&BIO.host)Object.assign(BIO.host,{mask:adBioMask,origin:[[0,-60],[0,-300],[-420,-120],[420,-120]],center:[0,-200],
 fields:{wet:(x,z)=>Math.min(1,.62+.3*adSm(14,1.5,terrainH(x,z))),salt:()=>0,upland:(x,z)=>Math.max(0,Math.min(1,terrainH(x,z)/520)),flow:()=>0,mist:(x,z)=>Math.max(0,Math.min(.4,(terrainH(x,z)-90)/200))}});
window._adSite={pads:AD_PADS.length,places:AD_PLACE.length,terraces:Object.fromEntries(Object.entries(AD_TERR).map(([k,t])=>[k,t.y])),stair:{rise:+AD_STAIR.rise.toFixed(2),len:+AD_STAIR.len.toFixed(1),footU:+AD_STAIR.footU.toFixed(1)}};
