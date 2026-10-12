// prefix: iw
// ================================================================= THE WEST'S HARBOUR: the fishing dock (the dockyard and the warehouse follow)
// Harbour defs stand on the shore row (89-rows.js shore:true, 90h-is-shore.js): land at local z > 0, piers over z < 0,
// the water at IS_SEA.level, piles down to IS_SEA.floor. iwCanoe is a small outrigger canoe moored at a pier (the Ring
// Sea kit's oruwa is the full vessel; this is its harbour stand-in).
/* the sea floor's height at local z (the shore line at z = 0, the floor from 9 m out) */
function iwFloorAt(z){return z>=1.5?0:IS_SEA.floor*smooth(0,IS_SEA.slope,1.5-z);}
/* a pier from (x, z0) out to (x, z1) (z1 < z0), w wide, its deck at y: plank deck, pile pairs every `step` down to the floor */
function iwPier(x,z0,z1,w,y,o){o=o||{};const step=o.step||2.2,L=z0-z1;box('planks',x,y-.1,(z0+z1)/2,w,.1,L,P('planks'));
 for(const z of isSpan(z0-.2,z1+.2,Math.max(2,Math.round(L/step)+1)))for(const s of [-1,1]){const fl=iwFloorAt(z)-.3;cyl('tarred',x+s*(w/2-.1),fl,z,.13,y-.1-fl,P('tarred'),8);}
 for(const s of [-1,1])box('wood',x+s*(w/2-.06),y-.32,(z0+z1)/2,.14,.22,L,P('woodD'));
 if(o.bollards)for(const z of isSpan(z0-1,z1+.4,Math.max(2,Math.round(L/4))))for(const s of [-1,1])cyl('wood',x+s*(w/2-.15),y,z,.1,.45,P('woodD'),8);}
/* a small outrigger canoe afloat at (x,z) heading ry: a dugout hull, booms, the float, a paddle */
function iwCanoe(x,z,ry,o){o=o||{};const L=o.L||6,y=IS_SEA.level;W(x,y,z,ry,()=>{
 tube('hull',t=>[0,.05,(t-.5)*L],t=>{const r=.36*Math.pow(Math.sin(PI*clamp(t,.02,.98)),.5);return [r,r*.75];},12,8,P('woodD'),{caps:true});
 for(const k of [-1,1])tube('carvedR',t=>[0,.25+t*t*.5,k*(L/2-.2+t*.4)],t=>[.06*(1-t*.5),.06*(1-t*.5)],4,5,P('carvR'));
 for(const z2 of [-L*.18,L*.18])beam('wood',[0,.32,z2],[2.0,.18,z2],.05,P('wood'),true,5);
 tube('wood',t=>[2.0,.0,(t-.5)*L*.6],t=>{const r=.1*Math.pow(Math.sin(PI*clamp(t,.03,.97)),.4);return [r,r];},8,6,P('wood'),{caps:true});
 beam('wood',[-.5,.35,-.6],[.3,.3,1.6],.03,P('woodL'),true,4);});}
defBuilding({key:'iw-fishdock',name:'Fishing dock (West)',seed:5201,w:22,d:30,h:11,budget:120000,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'west',job:'fishing'},
 note:'the fishers\' dock: a pier on tarred piles out into the bay with a finger at its head, outrigger canoes moored, a horned fish shed on the beach with drying racks, nets and fish trays',
 build(o){isNoCut(()=>{const y=.5;iwPier(0,4,-13,2.4,y,{bollards:true});iwPier(-3.8,-10.6,-12.4,5.4,y,{step:2.6});
  iwCanoe(2.4,-6,PI*.02,{});iwCanoe(-2.6,-4.5,-.05,{L:5.4});iwCanoe(3.0,-11.5,.1,{});
  /* the fish shed: an open horned roof on posts, the racks and trays under it */
  W(0,0,9.2,0,()=>{for(const x of [-3,0,3])for(const z of [-1.8,1.8])cyl('tarred',x,0,z,.13,2.4,P('tarred'),8);
   const rf=isSaddle({L:6.2,W:3.6,eaveY:2.35,ridgeY:4.6,sag:.5,hornRise:1.8,hornOut:.8,taper:.8,over:.6,mk:'thatch',col:P('thatchW'),th:.22,nu:20});rf.gable(3.1,2.35,1.8,'patGableW',{});rf.gable(-3.1,2.35,1.8,'patGableW',{});
   FURNISH('job_fish_tray',-1.5,0,0,0,{setting:'outdoor'});FURNISH('job_fish_tray',1.5,0,0,0,{setting:'outdoor'});FURNISH('generic_barrel',2.6,0,-1.2,0,{setting:'outdoor'});});
  for(const x of [-7,7])FURNISH('job_net_frame',x,0,7.5,0,{setting:'outdoor'});FURNISH('job_pole_rack',-7,0,11.5,0,{setting:'outdoor'});FURNISH('job_salt_tub',6.5,0,11.5,0,{setting:'outdoor'});
  door(0,0,13,0,2);});}});
/* ---------------------------------------------------------------- the dockyard and the harbour warehouse */
/* a hull along local z with its keel at y = 0: L long, half-beam o.B, depth o.D (deeper at the ends: the sheer). o.ribs
   [s0, s1, n] the stations framed (s 0 the -z end), o.plank [s0, s1, f] the length planked and how far up the sides
   (f 0..1 of the half-section), o.posts false: no carved stem and stern posts. Returns the gunwale's height at s. */
function iwHull(o){const L=o.L,B=o.B,Dh=o.D,bw=s=>B*Math.pow(Math.max(0,Math.sin(PI*clamp(s,0,1))),.55),dh=s=>Dh*(1+.5*Math.pow(Math.abs(2*s-1),3));
 const at=(s,a)=>[bw(s)*Math.sin(a),dh(s)*(1-Math.cos(a)),(s-.5)*L],cw=o.col||P('woodL');
 beam('wood',[0,-.1,-L/2-.05],[0,-.1,L/2+.05],.2,P('wood'),false,undefined,.26);
 if(o.ribs){const [r0,r1,n]=o.ribs;for(let i=0;i<n;i++){const s=lerp(r0,r1,n<2?.5:i/(n-1));tube('wood',t=>at(s,(t-.5)*PI),()=>[.05,.06],10,4,cw);}
  for(const k of [-1,1])cord('wood',isSpan(r0,r1,8).map(s=>{const p=at(s,k*PI/2);return [p[0],p[1]-.04,p[2]];}),.05,cw);}
 if(o.plank){const [p0,p1,f]=o.plank,g=(u,v)=>at(lerp(p0,p1,u),lerp(-f,f,v)*PI/2),nu=Math.max(6,Math.round((p1-p0)*28)),nv=Math.max(3,Math.round(f*10));
  psurf('wood',g,nu,nv,o.plankCol||P('wood'));psurf('wood',g,nu,nv,o.plankCol||P('wood'),{flip:true});
  if(f>.95)for(const k of [-1,1])cord('wood',isSpan(p0+.01,p1-.01,10).map(s=>at(s,k*PI/2)),.06,P('woodD'));}
 if(o.posts!==false)for(const k of [0,1]){const sg=k?1:-1,z0=(k-.5)*L,h0=dh(k);
  tube('carvedR',t=>[0,t*(h0+1.5),z0+sg*(t*.35+t*t*.75)],t=>[.08*(1-t*.4),.13*(1-t*.4)],8,5,P('carvR'),{caps:true});}
 return s=>dh(s);}
/* a slipway along z from (x, z0) (on land, deck height y0) down to z1 at `slope` per metre: two rails on sleepers, cribbed
   on land and piled out over the water; returns the rails' top height at z */
function iwSlip(x,z0,z1,y0,slope){const y=z=>y0-(z0-z)*slope;
 for(const s of [-1,1])beam('wood',[x+s*1.3,y(z0),z0],[x+s*1.3,y(z1),z1],.22,P('woodD'),false,undefined,.22);
 for(let z=z0-.3;z>z1;z-=1.2){const yy=y(z)-.11;box('wood',x,yy-.16,z,3.4,.16,.24,P('wood'));const g=iwFloorAt(z);
  if(yy-.16>g+.05)for(const s of [-1,1]){if(z>=1.5)box('wood',x+s*1.3,0,z,.3,yy-.16,.3,P('woodD'));else cyl('tarred',x+s*1.5,g-.3,z,.13,yy-.16-g+.3,P('tarred'),8);}}
 return z=>y(z)+.11;}
/* a pair of shear legs: feet at a and b, the apex at c, a back-stay to the stake d, a tackle hanging to height yH */
function iwShearLegs(a,b,c,d,yH){for(const p of [a,b])pole('wood',p,c,.11,P('wood'),7);beam('rope',[c[0]-.25,c[1]-.1,c[2]],[c[0]+.25,c[1]-.1,c[2]],.05,P('rope'));
 cord('rope',[c,d],.022,P('rope'));box('wood',d[0],d[1],d[2],.14,.5,.14,P('woodD'));pole('rope',[c[0],c[1]-.15,c[2]],[c[0],yH+.25,c[2]],.02,P('rope'),4);sph('wood',c[0],yH+.25,c[2],.12,P('woodD'),1.4,6);}
/* a ring pier: an annular deck round (cx, cz), radii r0..r1, its top at y, on piles to the sea floor; bollards and lamps */
function iwRingPier(cx,cz,r0,r1,y){sector('planks',cx,cz,r0,r1,0,TAU,y-.12,y,P('planks'),40);
 for(let i=0;i<16;i++){const a=i/16*TAU;for(const r of [r0+.2,r1-.2]){const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,fl=iwFloorAt(z)-.3;cyl('tarred',x,fl,z,.14,y-.12-fl,P('tarred'),8);}
  if(i%4===0)cyl('wood',cx+Math.cos(a)*(r1-.25),y,cz+Math.sin(a)*(r1-.25),.11,.45,P('woodD'),8);}
 for(const r of [r0+.06,r1-.06])ring('wood',cx,y+.02,cz,r,.06,P('woodD'),0,0,0,48);
 for(const a of [PI*.25,PI*1.25])isLamp(cx+Math.cos(a)*(r1-.3),2.6,cz+Math.sin(a)*(r1-.3),{post:true});}
defBuilding({key:'iw-dockyard',name:'Dockyard (West)',seed:5202,cut:true,w:60,d:56,h:23,budget:400000,
 tags:{types:['industry','infrastructure'],wealth:'rich',style:'west',role:'shipyard',job:'carpentry'},
 note:'the great dockyard where the raiding fleet is built (after the owner\'s islander port.jpg): two slipways under towering horned sheds, a double canoe and a great outrigger hull on them half-planked over their ribs, shear-leg cranes, log and plank stacks, a sail-cloth canopy over the saw benches and the lathe, the shipwrights\' workshop, a quay with a pier to a ring pier and a second ring, a finished double canoe and canoes moored',
 build(o){const SL=.1,Q=.6;
  isNoCut(()=>{
   /* the slips and their hulls: a double canoe on the first, a great outrigger hull on the second */
   for(const xs of [-15,-3]){const top=iwSlip(xs,16,-9.5,1.6,SL),zc=4.6,yk=top(zc)+.5;
    for(const z of [-1.5,2.5,6.5,10.5])for(const hx of (xs<-10?[-2.4,2.4]:[0]))box('wood',xs+hx,top(z),z,.5,yk-top(z)+(z-zc)*SL,.4,P('woodD'));
    WX(xs,yk,zc,0,-Math.atan(SL),0,()=>{
     if(xs<-10){W(-2.4,0,0,0,()=>iwHull({L:18,B:.85,D:1.35,ribs:[.04,.96,22],plank:[.06,.94,.5]}));W(2.4,0,0,0,()=>iwHull({L:18,B:.85,D:1.35,ribs:[.04,.96,22],plank:[.04,.96,.86]}));
      for(const z of [-3.2,0,3.2])box('wood',0,1.38,z,7.4,.18,.22,P('woodL'));box('planks',0,1.56,-1.6,3.8,.06,3.2,P('planks'));}
     else{iwHull({L:20,B:1.0,D:1.6,ribs:[.04,.62,16],plank:[.45,.97,.9]});for(let k=0;k<5;k++)box('planks',.8+k*.04,1.9+k*.07,-6+k*.3,.25,.05,4.2,P('planks'));}});
    /* the shed: tall posts, eave and tie beams, the horned roof turned to face the sea, its gables painted */
    for(const z of isSpan(-4,14,5))for(const s of [-1,1]){const g=Math.min(0,iwFloorAt(z)),x=xs+s*4.7,sea=z<1.5;
     if(!sea)sph('stone',x,.06,z,.4,P('stone'),.42,8);cyl('tarred',x,g-(sea?.3:0),z,.22,6.5-g+(sea?.3:0),P('tarred'),10);}
    for(const s of [-1,1])box('wood',xs+s*4.7,6.2,5,.3,.3,18.6,P('woodD'));for(const z of isSpan(-4,14,5))box('wood',xs,5.9,z,9.7,.26,.26,P('woodD'));
    W(xs,0,5,PI/2,()=>{const rf=isSaddle({L:19,W:9.4,eaveY:6.5,ridgeY:12.2,sag:1.2,hornRise:3.6,hornOut:2.4,taper:1,over:1.2,p:4,th:.35,nu:40,mk:'thatch',col:P('thatchW')});
     for(const s of [-1,1]){rf.gable(s*9.5,8.0,4.7,'patGableW',{});box('carvedR',s*9.5,7.75,0,.32,.32,9.6,P('carvR'));}iwSpikes(rf,1.2);isMoonDisc(-9.85,9.6,0,-PI/2,.75);});}
   /* the outrigger's float on trestles beside the second slip */
   for(const z of [4,9])for(const s of [-1,1])beam('wood',[3.6+s*.4,0,z],[3.6,.6,z],.07,P('woodD'));
   tube('wood',t=>[3.6,.75,2+t*9],t=>{const r=.24*Math.pow(Math.sin(PI*clamp(t,.03,.97)),.4);return [r,r];},10,7,P('woodL'),{caps:true});
   /* the logs and the shear legs lifting one */
   for(let r=0;r<4;r++)for(let i=0;i<4-r;i++){const x=-26.6+(i+r/2)*.74,y=.36+r*.62;beam('wood',[x,y,7.6],[x,y,16.4],.36,P('bark'),true,10);}
   for(const x of [-27.4,-23.0])box('wood',x,0,12,.18,1.4,.18,P('woodD'));
   iwShearLegs([-26.6,0,3.0],[-23.6,0,3.0],[-25.1,8.0,5.6],[-25.1,0,-.2],2.6);beam('wood',[-27.0,2.3,5.6],[-23.2,2.3,5.6],.3,P('bark'),true,10);
   cord('rope',[[-26.6,2.5,5.6],[-25.1,2.85,5.6],[-23.6,2.5,5.6]],.02,P('rope'));
   /* the quay, its pier, the T-head and the crane; the ring piers */
   box('planks',17.5,Q-.12,.1,22,.12,3,P('planks'));for(const x of isSpan(6.8,28.2,11)){const fl=iwFloorAt(-1.2)-.3;cyl('tarred',x,fl,-1.2,.14,Q-.12-fl,P('tarred'),8);box('wood',x,0,1.4,.3,Q-.12,.3,P('woodD'));}
   box('wood',17.5,Q-.34,-1.35,22,.22,.16,P('woodD'));
   iwPier(11,-1.4,-14,5,Q,{bollards:true});iwPier(11,-14,-17,10,Q,{step:2.2});iwPier(11,-16.9,-18.0,3,Q,{});
   iwShearLegs([9.6,Q,-15.4],[12.4,Q,-15.4],[11,8.4,-18.4],[11,Q,-11.2],3.2);box('planks',11,2.7,-18.4,2.6,.36,.7,P('planks'));
   iwRingPier(11,-23,3.2,5.4,Q);cyl('tarred',11,iwFloorAt(-23)-.3,-23,.26,IS_SEA.level+.2-iwFloorAt(-23)+.3,P('tarred'),10);isPou(11,IS_SEA.level+.2,-23,3.6,.24,{top:'moon',n:3});
   iwPier(25.6,-1.4,-4.4,2.4,Q,{});iwRingPier(25.6,-7.6,1.8,3.2,Q);
   iwCanoe(9.4,-23.2,.3,{L:4.2});iwCanoe(16.6,-14.5,.1,{});iwCanoe(5.4,-20.5,-.25,{L:5});iwCanoe(25.0,-7.8,PI*.5,{L:3.0});
   /* the finished double canoe moored along the quay: two hulls, a deck, a horned deck house, the mast and the furled sail */
   W(19.0,IS_SEA.level-.5,-8.7,0,()=>{for(const x of [-2.2,2.2])W(x,0,0,0,()=>iwHull({L:12,B:.72,D:1.05,plank:[0,1,1],plankCol:P('woodD')}));
    for(const z of [-3.3,-1.1,1.1,3.3])box('wood',0,1.08,z,5.8,.16,.2,P('woodD'));box('planks',0,1.24,0,3.6,.08,7.2,P('planks'));
    isRail([-1.8,-3.6],[-1.8,3.6],1.32,{h:.5});isRail([1.8,-3.6],[1.8,3.6],1.32,{h:.5});
    W(0,0,1.6,0,()=>{isWalls(2.2,2.0,1.32,1.2,'mat',P('bamboo'),{front:[{x:0,w:.7,h:1.1,door:true}],back:[],left:[],right:[],shut:false});
     const rf=isSaddle({L:2.6,W:2.2,eaveY:2.5,ridgeY:3.6,sag:.25,hornRise:.9,hornOut:.5,taper:1,over:.35,th:.15,nu:14,mk:'thatch',col:P('thatchW')});for(const s of [-1,1])rf.gable(s*1.3,2.52,1.0,'patGableW',{});});
    pole('wood',[0,1.32,-1.4],[0,9.0,-1.4],.12,P('wood'),8);beam('wood',[0,1.6,-1.4],[0,8.6,-5.2],.08,P('woodL'),true,6);beam('wood',[0,1.6,-1.4],[0,7.2,2.4],.08,P('woodL'),true,6);
    tube('mat',t=>[0,lerp(1.9,8.3,t),lerp(-1.6,-4.9,t)],t=>[.16*(1-t*.5),.16*(1-t*.5)],8,6,P('bamboo'));
    for(const s of [-1,1])cord('rope',[[0,8.9,-1.4],[s*2.9,1.2,-1.4]],.02,P('rope'));});
   /* the canopy over the saw benches: a woven sail-cloth hypar on two masts and two posts, guyed out */
   const A=[8,3.4,3.6],Bc=[26,9.6,3.6],C=[26,3.4,14],D=[8,9.6,14];
   psurf('mat',(u,v)=>{const p=[0,1,2].map(k=>(1-u)*(1-v)*A[k]+u*(1-v)*Bc[k]+u*v*C[k]+(1-u)*v*D[k]);p[1]-=.5*16*u*(1-u)*v*(1-v);return p;},14,10,P('bamboo'));
   for(const [p,q] of [[A,Bc],[Bc,C],[C,D],[D,A]])sagRope('rope',p,q,.15,.03,P('rope'),10);
   for(const p of [A,C])pole('tarred',[p[0],0,p[2]],[p[0],p[1]+.1,p[2]],.12,P('tarred'),8);
   for(const [p,st] of [[Bc,[29.2,0,1.6]],[D,[4.8,0,17.4]]]){pole('tarred',[p[0],0,p[2]],[p[0],p[1]+.9,p[2]],.17,P('tarred'),8);cord('rope',[[p[0],p[1]+.8,p[2]],st],.02,P('rope'));box('wood',st[0],st[1],st[2],.14,.5,.14,P('woodD'));
    W(p[0],p[1]+.9,p[2],0,()=>isFlag(0,0,1.6,{len:1.6}));}
   const S={setting:'outdoor'};
   FURNISH('generic_trade_lathe',11.6,0,7.2,0,S);FURNISH('job_saw_bench',16.4,0,5.9,0,S);FURNISH('job_saw_bench',21.6,0,10.4,PI/2,S);
   FURNISH('job_plank_stack',14.2,0,11.6,0,S);FURNISH('job_plank_stack',-20.6,0,19.2,PI/2,S);FURNISH('job_plank_stack',-9.4,0,19.6,0,S);
   FURNISH('islander_common_workbench',9.4,0,10.6,PI/2,S);FURNISH('generic_barrel',24.4,0,12.6,0,S);FURNISH('generic_barrel',23.6,0,13.2,.6,S);FURNISH('generic_trade_bin',18.4,0,12.8,0,S);
   /* the tar cauldron on its fire */
   cyl('iron',6.2,.35,9.0,.45,.6,P('iron'),12);for(const a of [0,2.1,4.2])beam('iron',[6.2+Math.cos(a)*.5,0,9+Math.sin(a)*.5],[6.2+Math.cos(a)*.38,.4,9+Math.sin(a)*.38],.04,P('iron'));
   sph('glow',6.2,.12,9.0,.3,0xff7a2a,.4,8);smokeAt(6.2,1.1,9.0,{r:.3});haloAt(6.2,.4,9.0,0xff8a30,true);isDrum(7.2,0,9.8,{});isDrum(7.0,0,8.2,{lie:true,ry:.4});});
  /* the shipwrights' workshop: the one enclosed building (the cut-away opens it) */
  W(16,0,20,0,()=>iwHouse({L:9,D:5,floorY:1.0,wallH:2.4,roof:{ridgeH:3,sag:.8,hornRise:2.4,hornOut:1.1,taper:1,over:.7,th:.28},band:'patBand',bandH:.32,
   front:iwOpen(9,3),back:iwOpen(9,2,false),stair:'stair',finial:'spike',
   extra:()=>{const F=(k,x,z,ry)=>FURNISH(k,x,1.0,z,ry||0);F('islander_common_workbench',-2.4,-1.85,0);F('islander_common_workbench',.6,-1.85,0);
    F('generic_trade_lathe',3.85,-.6,-PI/2);F('islander_common_rack',-4.05,0,PI/2);F('islander_common_chest',-2.6,1.75,PI);F('generic_trade_bin',2.2,1.85,PI);}}));}});
defBuilding({key:'iw-godown',name:'Harbour warehouse (West)',seed:5203,cut:true,w:18,d:24,h:15.5,budget:150000,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'west',role:'harbour warehouse',job:'warehousing'},
 note:'the harbour warehouse: a long store on tarred piles at the water\'s edge, its land door up a stair and its sea door onto a loading pier with shear legs at its head, the roof patched with iron; a canoe moored',
 build(o){const fy=1.5,L=12,D=7,zc=.5,wh=3.0,top=fy+wh;
  isNoCut(()=>{for(const x of isSpan(-L/2+.2,L/2-.2,6))for(const z of isSpan(zc-D/2+.2,zc+D/2-.2,4)){const fl=z>=1.5?0:iwFloorAt(z)-.3;
    if(z>=1.5)sph('stone',x,.06,z,.32,P('stone'),.42,8);cyl('tarred',x,fl,z,.16,fy-IS_T-fl,P('tarred'),8);}
   for(const z of isSpan(zc-D/2+.2,zc+D/2-.2,4))box('wood',0,fy-IS_T-.3,z,L,.26,.24,P('woodD'));
   iwPier(0,zc-D/2-.05,-13.5,3.2,1.2,{bollards:true});isStair(0,zc+D/2,0,0,fy,2.2);
   iwShearLegs([-1.3,1.2,-12.4],[1.3,1.2,-12.4],[0,7.4,-15.2],[0,1.2,-8.6],2.6);box('tarp',0,2.0,-15.2,.9,.8,.9,P('tarpB'));
   iwCanoe(3.4,-9.5,.08,{L:6.4});FURNISH('generic_barrel',-.8,1.2,-6.2,0,{setting:'outdoor'});FURNISH('generic_crate',.8,1.2,-6.6,.3,{setting:'outdoor'});});
  isCutFloor(fy);isDeck(L,D,fy,{z:zc,beam:false});
  W(0,0,zc,0,()=>{isWalls(L,D,fy,wh,'planks',P('tarred'),{mkf:s=>s==='left'?'corrW':'planks',colf:s=>s==='left'?P('rust'):P('tarred'),
    front:[{x:0,w:2.4,h:2.5,door:true},{x:-4,w:.7,y:2.0,h:.5},{x:4,w:.7,y:2.0,h:.5}],back:[{x:0,w:2.6,h:2.5,door:true}],left:[],right:[{x:0,w:.7,y:2,h:.5}]});
   const rf=isSaddle({L,W:D,eaveY:top-.05,ridgeY:top+3.2,sag:.8,hornRise:2.2,hornOut:1.2,taper:.6,over:.9,patch:.35,th:.28,nu:30,mk:'thatch',col:P('thatchW')});
   for(const s of [-1,1])rf.gable(s*L/2,top,D/2,'patGableW',{});iwSpikes(rf);
   const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   [-5.2,-4.4,-3.6,-2.8].forEach((x,i)=>{F('generic_crate',x,-2.95,0);if(i%2===0)F('generic_crate',x+.1,-2.95,.15,.42);});
   for(let i=0;i<4;i++)F('generic_sack',-5.3+i*.5,2.95,PI+i*.4);for(const x of [3.6,4.4,5.2])F('generic_barrel',x,-2.85,0);
   F('job_bales',3.0,2.6,0);F('job_bales',4.4,2.6,0);F('generic_trade_bin',-5.4,0,PI/2);});}});
