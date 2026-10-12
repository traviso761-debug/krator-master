// prefix: ie
// ================================================================= KAUTOA'S HARBOUR: the fishing dock and the great dockyard
// Harbour defs stand on the shore row (89-rows.js 'Harbours', 90h-is-shore.js): land at local z > 0, piers over z < 0, the
// water at IS_SEA.level, every pile driven down to the sea floor (ieSeaFloor). Kautoa was the Ring Sea's great naval power:
// its dockyard is large and elaborate in the East's manner, after the owner's "islander port" sketch (ring piers round
// sheltered basins under great roofs, a landmark figure in the basin): two slipways, a long boat shed under a skirt of
// golden thatch with two spires, a great double-hulled voyaging canoe half built on the open slip under shear legs, the
// timber yard and the carpenters' shed, a main pier, two ring piers under ring roofs of thatch with a carved moon post in
// the first basin, a finished voyaging canoe and outrigger canoes moored.
//   ieSeaFloor(z)   the sea floor under local z (the shoreline at z = 0)
//   iePile(x,z,y,r) a tarred pile from the floor (driven .3 in) up to y
//   ieWalk(a,b,w,y) a plank walk from [x, z] a to b, w wide, its deck at y, on pile pairs
//   ieRing(...)     a ring pier round a basin, a gap for the boats, a ring roof of thatch on posts
//   ieHull(L,B,dp,o) a Kautoan plank-built hull along z; o.stage 'ribs' | 'half' | 'done'
//   ieCanoe, ieDouble an outrigger canoe; the double-hulled voyaging canoe (built or on the slip)
//   ieSlip(xs,z0,z1) the timber ways of a slipway from the yard (z0) down into the sea (z1)
function ieSeaFloor(z){return z>=1.5?0:IS_SEA.floor*smooth(0,IS_SEA.slope,1.5-z);}
function iePile(x,z,y,r){const fl=ieSeaFloor(z)-.3;cyl('tarred',x,fl,z,r||.13,y-fl,P('tarred'),8);}
/* o.step (the pile spacing), o.bollards, o.rail (a rail on both edges) */
function ieWalk(a,b,w,y,o){o=o||{};const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,ax=Math.cos(ry),az=-Math.sin(ry);
 W(cx,0,cz,ry,()=>{box('planks',0,y-.1,0,w,.1,L,P('planks'));for(const s of [-1,1])box('wood',s*(w/2-.07),y-.34,0,.14,.24,L,P('woodD'));
  if(o.bollards)for(const z of isSpan(-L/2+.8,L/2-.8,Math.max(2,Math.round(L/4))))for(const s of [-1,1])cyl('wood',s*(w/2-.16),y,z,.11,.45,P('woodD'),8);});
 const n=Math.max(2,Math.round(L/(o.step||2.4))+1);
 for(let i=0;i<n;i++){const t=i/(n-1),x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);for(const s of [-1,1])iePile(x+s*ax*(w/2-.12),z+s*az*(w/2-.12),y-.1);}
 if(o.rail)for(const s of [-1,1]){const ox=s*ax*(w/2-.05),oz=s*az*(w/2-.05);isRail([a[0]+ox,a[1]+oz],[b[0]+ox,b[1]+oz],y,{h:.9});}}
/* a ring pier about (cx, cz): its deck from r0 to r1 at y, a gap gw radians wide centred on angle o.ga (default -PI/2: the open
   sea, -z) for the boats into the basin, piles round both edges, posts carrying a ring roof of golden thatch (o.roof false: none) */
function ieRing(cx,cz,r0,r1,y,o){o=o||{};const ga=o.ga===undefined?-PI/2:o.ga,gw=o.gw||.55,a0=ga+gw/2,a1=ga+TAU-gw/2,seg=48;
 sector('planks',cx,cz,r0,r1,a0,a1,y-.12,y,P('planks'),seg);
 sector('wood',cx,cz,r1-.14,r1+.04,a0,a1,y-.42,y-.12,P('woodD'),seg);sector('wood',cx,cz,r0-.04,r0+.14,a0,a1,y-.42,y-.12,P('woodD'),seg);
 const np=Math.round((a1-a0)*r1/2.6),at=(i,r)=>{const a=lerp(a0,a1,i/np);return [cx+Math.cos(a)*r,cz+Math.sin(a)*r];};
 for(let i=0;i<=np;i++)for(const r of [r0+.18,r1-.18]){const p=at(i,r);iePile(p[0],p[1],y-.12,.14);}
 if(o.roof===false)return;const ph=o.postH||2.6,rm=(r0+r1)/2,ro=r1+.7,ri=r0-.5,yr=y+ph,rh=o.rise||1.9;
 for(let i=0;i<=np;i+=2)for(const r of [r0+.3,r1-.3]){const p=at(i,r);cyl('wood',p[0],y,p[1],.11,ph+.1,P('wood'),8);}
 for(const r of [r0+.3,r1-.3])sector('wood',cx,cz,r-.1,r+.1,a0,a1,yr-.12,yr+.08,P('woodD'),seg);
 const f=(u,v)=>{const a=lerp(a0,a1,u);let r,yy;if(v<.5){const t=v*2;r=lerp(ro,rm,t);yy=lerp(yr,yr+rh,t);}else{const t=(v-.5)*2;r=lerp(rm,ri,t);yy=lerp(yr+rh,yr+.25,t);}return [cx+Math.cos(a)*r,yy,cz+Math.sin(a)*r];};
 isShell('thatchR',f,seg,6,P('thatchE'),.22,{edges:['v0','v1','u0','u1']});}
/* a hull along local z, L long, half-beam B, depth dp (the keel at y = 0), its ends rising to carved posts. o.stage: 'ribs' (the
   keel, the frames and the garboards), 'half' (planked to half its height, the frames standing above), 'done' (planked, the
   gunwales, a painted band when o.band); o.prow a carved post at each end */
function ieHull(L,B,dp,o){o=o||{};const st=o.stage||'done',hb=t=>B*Math.pow(Math.sin(PI*clamp(t,.002,.998)),.55),rise=t=>.9*dp*Math.pow(Math.abs(2*t-1),4);
 const S=(t,ph)=>{const c=1-Math.cos(ph);return [hb(t)*Math.sin(ph),dp*c+rise(t)*(.4+.6*c),(t-.5)*L];};
 const ph1=st==='done'?PI/2:st==='half'?PI*.3:PI*.09,col=o.col||P('woodD');
 tube('wood',t=>{const p=S(t,0);return [0,p[1]-.02,p[2]];},()=>[.07,.07],16,5,P('woodD'));
 psurf('hull',(u,v)=>S(u,lerp(-ph1,ph1,v)),24,8,col,{flip:true});
 psurf('hull',(u,v)=>{const p=S(u,lerp(-ph1,ph1,v));return [p[0]*.93,p[1]+.05,p[2]];},24,8,P('planks'),{flip:false});
 if(st!=='done'){for(let k=1;k<12;k++){const t=k/12;tube('wood',s=>{const p=S(t,lerp(-PI/2,PI/2,s));return [p[0]*.97,p[1]+.03,p[2]];},()=>[.045,.06],10,4,P('wood'));}}
 else{for(const s of [-1,1])tube('wood',t=>{const p=S(t,s*PI/2);return [p[0]*1.01,p[1]+.02,p[2]];},()=>[.06,.06],16,5,P('woodD'));
  if(o.band)psurf('patGableE',(u,v)=>{const p=S(.08+u*.84,lerp(-PI*.47,-PI*.36,v));return [p[0]*1.015,p[1],p[2]];},16,2,WHITE,{flip:true}),
   psurf('patGableE',(u,v)=>{const p=S(.08+u*.84,lerp(PI*.36,PI*.47,v));return [p[0]*1.015,p[1],p[2]];},16,2,WHITE,{flip:true});}
 if(o.prow!==false)for(const e of [-1,1]){const zt=e*(L/2-.06),yt=dp+rise(e>0?1:0)-.25;tube('carved',s=>[0,yt+s*(.7+dp*.5),zt+e*s*.3],s=>[.05,.1*(1-.4*s)],5,6,P('carvN'),{caps:true});}}
/* an outrigger canoe at (x, y, z) heading ry (y: IS_SEA.level - .25 afloat, a little above the sand when beached) */
function ieCanoe(x,y,z,ry,o){o=o||{};const L=o.L||6.4;W(x,y,z,ry,()=>{ieHull(L,.42,.55,{stage:'done'});
 for(const z2 of [-L*.18,L*.18]){beam('wood',[0,.6,z2],[2.1,.45,z2],.05,P('wood'),true,5);pole('wood',[2.1,.12,z2],[2.1,.45,z2],.03,P('woodD'),4);}
 tube('wood',t=>[2.1,.12,(t-.5)*L*.6],t=>{const r=.11*Math.pow(Math.sin(PI*clamp(t,.03,.97)),.4);return [r,r];},8,6,P('wood'),{caps:true});
 isMoonDisc(0,.95,L/2-.05,0,.16);beam('wood',[-.3,.75,-.8],[.35,.55,1.6],.03,P('woodL'),true,4);});}
/* the double-hulled voyaging canoe along local z: two hulls sp apart, crossbeams lashed over them; done: a deck, a deckhouse
   under a little hip of thatch, the mast with the crab-claw sail furled along its yard, a steering paddle. o.stage / o.stage2
   the two hulls' stages, o.beams how many crossbeams are in place */
function ieDouble(o){const L=o.L||16,sp=o.sp||4.4,B=.78,dp=1.15,st=o.stage||'done';
 for(const s of [-1,1])W(s*sp/2,0,0,0,()=>ieHull(L,B,dp,{stage:s<0?st:(o.stage2||st),band:st==='done'}));
 const nb=o.beams===undefined?7:o.beams;for(let i=0;i<nb;i++){const z=lerp(-L*.3,L*.3,nb<2?.5:i/(nb-1));box('wood',0,dp+.02,z,sp+2*B+.3,.18,.22,P('woodD'));
  for(const s of [-1,1])cyl('rope',s*sp/2,dp-.02,z,.17,.26,P('rope'),8);}
 if(st!=='done')return;
 box('planks',0,dp+.2,0,sp-.2,.08,L*.62,P('planks'));
 W(0,dp+.28,-1.2,0,()=>{box('mat',0,0,0,2.0,1.2,2.4,P('bamboo'));isHip({hw:1.45,hd:1.75,eaveY:1.15,topY:2.3,topS:.3,topS2:.05,mk:'thatchR',col:P('thatchE'),th:.12,nu:16});});
 pole('wood',[0,dp+.28,2.4],[0,dp+8.2,2.4],.13,P('woodD'),8);
 pole('wood',[0,dp+.6,L*.42],[0,dp+7.6,1.0],.08,P('wood'),6);
 tube('mat',t=>{const p=[0,lerp(dp+.6,dp+7.6,t),lerp(L*.42,1.0,t)];return [p[0]+.18,p[1],p[2]];},t=>{const r=.08+.16*Math.sin(PI*t);return [r,r];},10,6,P('bamboo'),{caps:true});
 for(const s of [-1,1])sagRope('rope',[0,dp+8.1,2.4],[s*(sp/2+B),dp+.1,1.2],.3,.02,P('rope'),6);
 beam('wood',[sp/2-.2,dp+.9,-L*.36],[sp/2+.4,-.3,-L*.5-.6],.07,P('woodD'),true,5);}
/* a slipway: timber ways at each x of xs from z0 on the land (y .3) down to z1 in the sea, on sleepers and piles */
function ieSlip(xs,z0,z1){const yOf=z=>z>=1.5?.3:lerp(.3,IS_SEA.level-.9,(1.5-z)/(1.5-z1));
 for(const x of xs){beam('wood',[x,.3+.12,z0],[x,.3+.12,1.5],.24,P('woodD'));beam('wood',[x,.3+.12,1.5],[x,yOf(z1)+.12,z1],.24,P('woodD'));}
 const x0=Math.min(...xs)-.4,x1=Math.max(...xs)+.4;
 for(let z=z0-.6;z>1.5;z-=1.6)box('wood',(x0+x1)/2,0,z,x1-x0,.3,.3,P('wood'));
 for(let z=1;z>=z1;z-=3){const y=yOf(z);box('wood',(x0+x1)/2,y-.25,z,x1-x0,.25,.3,P('woodD'));for(const x of [x0+.2,x1-.2])iePile(x,z,y-.25,.15);}}
/* ---------------------------------------------------------------- the fishing dock */
defBuilding({key:'ie-fishdock',name:'Fishing dock (Kautoa)',seed:6301,w:17,d:31,h:12,budget:150000,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'east',job:'fishing',role:'fishing dock'},
 note:'the Kautoan fishers\' dock: a pier on tarred piles out to a T-head and a side finger, outrigger canoes moored and one hauled up on rollers, a fish shed under a spire of golden thatch on the beach, net frames, the pole rack and the salt',
 build(o){const y=.5;
  ieWalk([0,2.6],[0,-14.9],2.4,y,{bollards:true});ieWalk([-5.2,-15.7],[5.2,-15.7],3.2,y,{step:2.6});ieWalk([-.9,-8.2],[-5.6,-8.2],1.6,y);
  ieCanoe(2.4,IS_SEA.level-.25,-6.2,.04,{});ieCanoe(-3.0,IS_SEA.level-.25,-12.2,PI*.97,{L:5.8});ieCanoe(6.4,IS_SEA.level-.25,-11.0,.1,{});
  /* one hauled up on the sand on log rollers */
  for(const z of [3.4,5.2,7])beam('wood',[-6.3,.12,z],[-4.1,.12,z],.12,P('wood'),true,7);ieCanoe(-5.6,.26,5.3,0,{L:5.6});
  /* the fish shed: an open shed under the East's roof, the trays and the salt under it */
  W(3,0,9.2,0,()=>{ieShed({w:6,d:4,postH:2.4,step:3,roof:{skirtH:1.1,skirtS:.5,towerH:3.2,towerS:.42,topSx:.22,topSz:.06,th:.24,finial:'horns'}});
   ieFurn([['job_fish_tray',-1.4,0,-.6,0,{setting:'outdoor'}],['job_fish_tray',1.2,0,-.6,0,{setting:'outdoor'}],['job_salt_tub',-2,0,1.2,0,{setting:'outdoor'}],['generic_barrel',2.2,0,1.2,0,{setting:'outdoor'}]]);});
  ieFurn([['job_net_frame',-8.4,0,8,PI/2,{setting:'outdoor'}],['job_net_frame',-8.4,0,11.2,PI/2,{setting:'outdoor'}],['job_pole_rack',-2.6,0,13.4,0,{setting:'outdoor'}],
   ['job_salt_heap',9,0,9.6,0,{setting:'outdoor'}],['job_fish_tray',.9,y,-15.4,0,{setting:'outdoor'}]]);
  isFlag(4.6,-16.6,6.5,{});isPou(-1.6,0,3.4,2.4,.15,{mk:'carved',top:'moon'});
  door(0,0,12.5,0,2.4);}});
/* ---------------------------------------------------------------- the dockyard */
defBuilding({key:'ie-dockyard',name:'Dockyard (Kautoa)',seed:6302,w:58,d:56,h:18.5,budget:400000,
 tags:{types:['industry','infrastructure'],wealth:'rich',style:'east',job:'carpentry',role:'dockyard'},
 note:'the royal dockyard of Kautoa (the owner\'s "islander port" sketch, in the East\'s manner): two slipways, a long boat shed under golden thatch with two spires, a great double-hulled voyaging canoe half built on the open slip under shear legs, the timber yard and the carpenters\' shed; a coral quay, a main pier and two ring piers round sheltered basins under ring roofs of thatch, a great carved moon post in the first basin, a finished voyaging canoe and outrigger canoes moored',
 build(o){const y=.6,cv=P('carvN');
  /* the coral quay along the shore (gaps for the slips) */
  for(const [x0,x1] of [[-28,-20.4],[-15.6,-7],[3,28]])box('coral',(x0+x1)/2,-1.6,1.3,x1-x0,2.0,1.2,P('coral'));
  /* slip A and the boat shed over it: a hull on its stocks */
  ieSlip([-19.4,-16.6],19.5,-12);
  W(-18,0,10.2,0,()=>{ieShed({w:11,d:19,postH:4.2,step:3.2,carved:true,roof:{skirtH:2.0,skirtS:.6,towerH:7,towerS:.3,topSx:.14,topSz:.05,sq:8,th:.28,
    towers:[[0,-4.6,1],[0,4.6,1]],finial:'horns',facade:'patGableE'}});
   for(const z of [-4.5,-1.5,1.5,4.5])box('wood',0,.42,z,1.6,.4,.5,P('woodD'));W(0,.8,0,0,()=>ieHull(13,.8,1.2,{stage:'half'}));
   for(const s of [-1,1])for(const z of [-3,3])beam('wood',[s*1.0,.4,z],[s*.85,1.6,z],.08,P('wood'),true,5);
   ieFurn([['job_saw_bench',-3.6,0,6.4,PI/2],['islander_common_workbench',4.3,0,6.8,-PI/2],['job_plank_stack',-3.7,0,-5.6,PI/2],['pa_tool_rack',4.9,0,1.2,-PI/2],['generic_crate',4.4,0,-4.6,0]]);});
  /* slip B in the open: the great voyaging canoe half built on it, scaffolds along it, two shear legs over it */
  ieSlip([-5.2,-3.4,-.6,1.2],19.5,-12);
  W(-2.1,.82,9.6,0,()=>ieDouble({L:16,sp:4.6,stage:'half',stage2:'ribs',beams:3}));
  for(const z of [3.6,7.6,11.6,15.6])for(const x of [-4.4,.2])box('wood',x,.42,z,.5,.4,.9,P('woodD'));
  for(const s of [-1,1]){const x=s>0?3.6:-7.8;for(const z of isSpan(2.5,16.5,6))for(const dx of [-.5,.5])box('wood',x+dx,0,z,.12,1.5,.12,P('wood'));box('planks',x,1.5,9.5,1.3,.08,14.6,P('planks'));}
  for(const zf of [5.2,13.4]){const ap=[-2.1,11,zf-1.2];for(const xf of [-9.6,5.4])pole('wood',[xf,0,zf],ap,.16,P('wood'),8);
   cyl('rope',ap[0],ap[1]-.5,ap[2],.32,.5,P('rope'),8);sagRope('rope',ap,[-2.1,0,zf+6.6],.4,.03,P('rope'),8);beam('wood',[-2.1,-.3,zf+6.6],[-2.1,.6,zf+6.6],.12,P('woodD'));
   pole('rope',ap,[-2.1,4.0,zf-1.2],.03,P('rope'),5);box('wood',-2.1,3.6,zf-1.2,.3,.4,.2,P('woodD'));beam('planks',[-3.9,3.2,zf-1.2],[-.3,3.2,zf-1.2],.3,P('planks'),false,undefined,.1);}
  /* the timber yard: plank stacks, saw benches, a log pile; the carpenters' shed */
  for(let row=0;row<3;row++)for(let k=0;k<4-row;k++){const zz=8.2+row*.27+k*.62+row*.31;beam('wood',[20.2,.3+row*.52,zz],[27,.3+row*.52,zz],.3,P('wood'),true,9);}
  W(16,0,5.4,0,()=>{ieShed({w:6.4,d:3.4,postH:2.5,step:3.2,walls:{back:'planks'},wallH:2.5,roof:{skirtH:1.1,skirtS:.5,towerH:2.8,towerS:.42,topSx:.22,topSz:.06,th:.22,finial:'none'}});
   ieFurn([['islander_common_workbench',-1.6,0,-1.1,0],['generic_trade_lathe',1.4,0,-1.2,0],['generic_crate',2.7,0,.6,0],['generic_crate',2.7,0,1.1,.2]]);});
  ieFurn([['job_plank_stack',12.4,0,18.4,0,{setting:'outdoor'}],['job_plank_stack',18.6,0,18.4,0,{setting:'outdoor'}],['job_plank_stack',12.4,0,15.8,0,{setting:'outdoor'}],
   ['job_saw_bench',19.6,0,14.4,.2,{setting:'outdoor'}],['job_saw_bench',13.4,0,11.8,0,{setting:'outdoor'}],['pa_tool_rack',24.5,0,13,-PI/2,{setting:'outdoor'}]]);
  /* the yard's front: a bamboo fence with a gate between carved posts, the moon's flags */
  for(const [x0,x1] of [[-26,5.6],[10.4,26]])W((x0+x1)/2,0,21.4,0,()=>isFenceRun(x1-x0,1.2));
  for(const x of [5.8,10.2])isPou(x,0,21.4,3.6,.24,{mk:'carved',top:'horns',col:cv});door(8,0,21.4,0,4.2);
  for(const x of [3.6,12.4])isFlag(x,20.6,9,{});
  /* the main pier, the ring piers and the walks between them */
  ieWalk([12,1],[12,-14],3,y,{bollards:true});ieWalk([-10,.8],[-10,-16.7],2.4,y);
  ieRing(12,-22,4.6,8,y,{});ieRing(-10,-24,4.2,7.2,y,{});ieWalk([4.1,-22.1],[-2.9,-23.8],2.2,y);
  /* the great carved moon post in the first basin, on its pile platform */
  for(const [a,b] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])iePile(12+a,-22+b,y-.1,.16);
  W(12,0,-22,0,()=>{box('planks',0,y-.12,0,2.2,.12,2.2,P('planks'));
   isPou(0,y,0,8.4,.38,{mk:'carved',n:6,top:'moon',col:cv});});
  /* the boats: the finished voyaging canoe at the main pier, outrigger canoes in the basins */
  W(7.3,IS_SEA.level-.5,-8.5,0,()=>ieDouble({L:14,sp:4.2,stage:'done'}));
  ieCanoe(9.4,IS_SEA.level-.25,-20.6,.5,{});ieCanoe(14.6,IS_SEA.level-.25,-24.2,-.7,{});ieCanoe(-12,IS_SEA.level-.25,-22.8,1.3,{L:5.6});ieCanoe(-13.4,IS_SEA.level-.25,-6,PI,{});ieCanoe(16.2,IS_SEA.level-.25,-7,.1,{});
  /* the rings' furniture: the fish market under the first roof, cargo under the second */
  const rp=(cx,cz,a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r];
  for(const [k,cx,cz,a,r] of [['job_fish_tray',12,-22,PI*.1,6.3],['job_fish_tray',12,-22,PI*.3,6.3],['generic_barrel',12,-22,PI*.65,6.4],['job_net_frame',12,-22,PI*.8,6.3],['generic_barrel',12,-22,PI*1.25,6.4],
   ['generic_crate',-10,-24,PI*.15,5.7],['generic_crate',-10,-24,PI*.32,5.7],['job_bales',-10,-24,PI*.7,5.7],['job_bales',-10,-24,PI*.9,5.7],['generic_barrel',-10,-24,PI*1.15,5.7]]){
   const p=rp(cx,cz,a,r);FURNISH(k,p[0],y,p[1],Math.atan2(cx-p[0],cz-p[1]));}}});
