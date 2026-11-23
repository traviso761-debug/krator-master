// ================================================================= FLUMI-BRIDZI GRAVITY LOG-FLUME CONFLUENCE HAMLET (--village)
// Assembles Flumi-Bridzi ("Confluence Flume-Bridge"), a terraced Dzagh-Vardzi gorge hamlet of 13 kit buildings unified by ONE
// physically coherent, strictly monotonic end-to-end gravity log flume (6.0-7.2 deg grade, zero air-gaps, zero uphill kinks):
//   1. Upper Mountain Timber-Landing & Stone Intake-Weir Pond (`dv-village-headpond`, y_water = 14.00 m)
//   2. 10-Segment Elevated Red-Cypress V-Flume Viaduct (`dv-village-flume`, P[0]..P[10], 89.1 m run, y = 13.68 -> 3.36 m)
//      with iron-strapped V-collars at every joint, timber/stone trestle bents planted into sculpted gorge rock, and twin
//      gravity splitter launders feeding the 3 cascading overshot waterwheels of `dv-flume-forge` + the wheel of `dv-sawmill-jade`
//   3. Live Animated Peeled Red-Cypress Logs (5 logs spaced along arc-length s(t) sliding down the exact 3D trough tangent)
//   4. Lower Log-Boom Sorting Pond & Overflow Waterfall (`dv-village-boompond`, y_pond = 2.67 m) beside the Joiner & Customs Bridge
//   5. Rushing Crookwash Confluence Canyon Torrent (#include <atmos_waves>) spanned by the Duel Sky-Bridge (`dv-bridge-duel`).

const DV_FLUME_VILLAGE=(function(){
 /* ---- 1. Continuous Monotonic Gravity V-Flume Centerline (P[0] .. P[10]) ---- */
 const PTS=[
  [8.00,13.68,-49.50],
  [8.00,12.73,-40.50],
  [7.40,11.73,-31.50],
  [6.50,10.70,-22.50],
  [5.80, 9.66,-13.50],
  [5.45, 8.70, -5.00],
  [5.65, 7.72,  3.50],
  [6.10, 6.70, 12.50],
  [6.40, 5.62, 21.50],
  [6.50, 4.50, 30.50],
  [6.50, 3.36, 39.50]
 ];
 const FW=1.44,Y_HEAD=14.00,Y_POND=2.67,Y_RIVER=-0.95;

 /* precompute exact arc-length table & segment slopes */
 const SEGS=[],CUM=[0];
 let totalLen=0;
 for(let i=0;i<PTS.length-1;i++){
  const a=PTS[i],b=PTS[i+1];
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
  const Lh=Math.hypot(dx,dz),L3=Math.hypot(dx,dy,dz);
  const deg=Math.atan2(-dy,Lh)*180/PI;
  totalLen+=L3;
  CUM.push(totalLen);
  SEGS.push({i,p0:a,p1:b,dx,dy,dz,Lh,L3,deg,yaw:Math.atan2(dx,dz),pitch:-Math.atan2(dy,Lh)});
 }

 function sampleFlume(s){
  const sc=clamp(s,0,totalLen);
  let k=0;
  while(k<SEGS.length-1&&CUM[k+1]<sc)k++;
  const sg=SEGS[k],u=sg.L3>1e-6?(sc-CUM[k])/sg.L3:0;
  /* smooth tangent blend near joints so sliding logs pivot silkily across the <= 3.8 deg plan bends */
  let yaw=sg.yaw,pitch=sg.pitch;
  if(u<.18&&k>0){
   const w=(.18-u)/.18*.5,prev=SEGS[k-1];
   yaw=lerp(sg.yaw,prev.yaw,w);pitch=lerp(sg.pitch,prev.pitch,w);
  }else if(u>.82&&k<SEGS.length-1){
   const w=(u-.82)/.18*.5,next=SEGS[k+1];
   yaw=lerp(sg.yaw,next.yaw,w);pitch=lerp(sg.pitch,next.pitch,w);
  }
  return {
   x:lerp(sg.p0[0],sg.p1[0],u),
   y:lerp(sg.p0[1],sg.p1[1],u),
   z:lerp(sg.p0[2],sg.p1[2],u),
   yaw,pitch,seg:k,u
  };
 }

 /* ---- 2. Settlement Building Sites & Flat Rock-Cut Terrace Pads ---- */
 const BLDG_PLAN=[
  {key:'dv-tower-vovnashki',   x:-8.5, y:12.20,z:-52.0,ry:0,    pad:[6.4,5.4]},
  {key:'dv-aul-house-koshki',  x:-24.5,y:11.40,z:-46.0,ry:0,    pad:[7.0,6.2]},
  {key:'dv-manor-gumbat',      x:-23.0,y: 8.60,z:-27.5,ry:0,    pad:[8.4,7.4]},
  {key:'dv-aul-house-terrace', x: -6.5,y: 8.20,z:-26.5,ry:0,    pad:[6.4,6.2]},
  {key:'dv-orchard-terrace',   x: 22.5,y: 9.20,z:-28.0,ry:0,    pad:[8.6,7.4]},
  {key:'dv-potter-qvevri',     x: 21.5,y: 6.20,z: -8.0,ry:-PI/2,pad:[6.2,7.0]},
  {key:'dv-tavern-qvevri',     x:-24.5,y: 5.20,z: -7.5,ry:0,    pad:[7.8,6.8]},
  {key:'dv-flume-forge',       x: -2.2,y: 0.15,z:  0.0,ry:0,    pad:[9.2,7.6]},
  {key:'dv-market-confluence', x:-24.5,y: 3.20,z: 13.5,ry:0,    pad:[9.0,7.8]},
  {key:'dv-sawmill-jade',      x:  0.1,y: 1.45,z: 16.0,ry:0,    pad:[8.0,6.4]},
  {key:'dv-customs-bridgehead',x:-10.5,y: 2.85,z: 32.5,ry:0,    pad:[6.8,6.0]},
  {key:'dv-joiner-cypress',    x: 22.5,y: 2.85,z: 42.0,ry:-PI/2,pad:[6.4,7.8]},
  {key:'dv-bridge-duel',       x:-28.5,y: 2.85,z: 35.0,ry:0,    pad:null}
 ];

 const INFRA_PLAN=[
  {key:'dv-village-headpond',x: 8.0,y:12.20,z:-55.0,ry:0,pad:[7.8,7.2]},
  {key:'dv-village-flume',   x: 6.5,y: 0.00,z: -5.0,ry:0,pad:null},
  {key:'dv-village-boompond',x: 6.5,y: 2.65,z: 44.5,ry:0,pad:[8.8,7.8]},
  {key:'dv-village-streets', x:-12.0,y:0.00,z: -6.0,ry:0,pad:null}
 ];

 const FLORA_LIFE=[
  {key:'dvb-red-cypress', x: 19.5,z:-59.5,ry:.4},
  {key:'dvb-red-cypress', x:-17.0,z:-55.0,ry:1.9},
  {key:'dvb-red-cypress', x: 26.5,z:-42.0,ry:2.5},
  {key:'dvb-apricot-tree',x: 29.0,z:-35.5,ry:.8},
  {key:'dvb-apricot-tree',x:-16.5,z:-18.5,ry:2.1},
  {key:'dvb-apricot-tree',x:-16.5,z: 23.5,ry:1.2},
  {key:'dvb-sheep',       x: 28.5,z:-19.5,ry:.6, o:{sub:'flume'}},
  {key:'dvb-goat',        x: 18.5,z:-36.5,ry:-.8,o:{sub:'flume'}},
  {key:'dvb-horse',       x:-16.5,z: 31.0,ry:.3, o:{sub:'aul'}}
 ];

 /* ---- 3. Registered Village Infrastructure Definitions (`cls: 'infrastructure'`) ---- */

 /* 3a. Upper Mountain Timber-Landing & Stone Intake-Weir Pond (`dv-village-headpond`) */
 defBuilding({key:'dv-village-headpond',name:'Khe-Satave Mountain Timber-Landing & Flume Intake-Weir Pond',seed:7501,
  cls:'infrastructure',w:18.6,d:13.8,h:5.6,cut:false,front:{x:-5.6,z:5.8,yaw:0},
  tags:{types:['infrastructure','industry'],wealth:'middle',style:'flume',role:'flume intake weir'},
  note:'Basalt-and-skarn mountain snowmelt weir pond (`y = 14.00 m`), bronze screw-sluice headgate, and timber skid-landing feeding peeled red-cypress logs into the Flumi-Bridzi gravity log flume.',
  build(){
   const bsCol=P('colBasalt'),tfCol=P('tuff'),skCol=P('skarn'),cyCol=P('cypress'),wdCol=P('wood'),wtCol=P('flumeWater'),bzCol=P('bronze');
   dvRootSkirt(1.4,0,11.6,11.6,5.2,{mk:'colBasalt',plinthH:.28});
   dvNoCut(()=>svNoWalk(()=>{
    /* hollow 4-sided ablaq & basalt weir-basin walls (clean 8 mm step between north/south walls and east/west walls so 0 coplanarity) */
    box('colBasalt',1.4,0,-5.25,11.2,2.02,.7,bsCol);
    box('colBasalt',-3.85,0,-.05,.68,2.0,9.62,bsCol);
    box('colBasalt',6.65,0,-.05,.68,2.0,9.62,bsCol);
    /* south dam wall split cleanly round the x = 0.0 V-flume sluice notch (`local x = 0` == `world x = 8.0`!) */
    box('tuff',-2.35,0,5.15,3.7,2.02,.72,tfCol);
    box('tuff', 3.85,0,5.15,6.3,2.02,.72,tfCol);
    box('colBasalt',0,0,5.15,0.98,1.26,.7,bsCol);
    /* golden-skarn coping stones stepped +8 mm proud above basin walls */
    box('skarn',1.4,2.028,-5.25,11.36,.12,.82,skCol);
    box('skarn',-2.35,2.028,5.15,3.78,.12,.84,skCol);
    box('skarn', 3.85,2.028,5.15,6.38,.12,.84,skCol);
    /* submerged flagstone basin bed + calm opaque mountain headpond water (`world y = 12.20 + 1.80 = 14.00 m`) */
    box('flagstone',1.4,.02,0,10.0,.18,9.4,P('flagstone'));
    box('flumeWater',1.4,1.72,-.05,9.8,.08,9.4,wtCol);
    /* water tongue flowing smoothly through the sluice notch directly into P[0] (`local [0, 1.48, 5.50]`) */
    box('flumeWater',0,1.71,5.08,.76,.09,1.02,wtCol);

    /* heavy red-cypress & bronze screw-wheel sluice headgate straddling the intake notch */
    for(const sx of [-.68,.68])box('cypress',sx,1.28,5.15,.22,2.45,.24,cyCol);
    box('cypress',0,3.74,5.15,1.76,.22,.28,cyCol);
    cyl('bronze',0,3.97,5.15,.32,.07,bzCol,10);
    cyl('iron',0,2.15,5.15,.04,1.8,P('iron'),8);

    /* west timber skid-landing & stacked peeled red-cypress logs ready to roll into the pond (`local x = -8.6..-4.6`) */
    box('floor',-6.6,.01,.2,3.8,.14,8.6,P('floor'));
    for(const sz of [-2.4,2.2])box('wood',-6.5,.158,sz,3.5,.14,.22,wdCol);
    dvCypressLog([-7.6,.56,-3.2],[-7.6,.56,3.2],.26);
    dvCypressLog([-6.95,.56,-3.1],[-6.95,.56,3.3],.26);
    dvCypressLog([-6.3,.56,-3.2],[-6.3,.56,3.1],.26);
    dvCypressLog([-7.28,1.02,-2.9],[-7.28,1.02,2.9],.25);
    dvCypressLog([-6.62,1.02,-2.8],[-6.62,1.02,3.0],.25);
   }));
   dvLampBracket(-.68,3.15,5.32,0,.9);
  }});

 /* 3b. Continuous 10-Segment Elevated Red-Cypress Gravity Log Flume & Waterwheel Splitters (`dv-village-flume`) */
 defBuilding({key:'dv-village-flume',name:'Flumi-Khazi Continuous Gravity V-Flume Viaduct & Mill-Races',seed:7502,
  cls:'infrastructure',w:11.6,d:91.8,h:15.4,cut:false,front:{x:-1.0,z:0,yaw:-PI/2},
  tags:{types:['infrastructure','industry'],wealth:'rich',style:'flume',role:'gravity log flume',landmark:true},
  note:'Unbroken 89.1 m elevated red-cypress V-flume viaduct descending at a strict 6.0-7.2 deg monotonic grade on cross-braced trestle bents, tapping two overshot mill-race launders into the Forge and Sawmill before plunging into the lower Log-Boom Pond.',
  build(){
   const ox=6.5,oz=-5.0;
   const pkCol=SVPAL.planks[0],wdCol=SVPAL.wood[0],cyCol=SVPAL.cypress[0],wtCol=SVPAL.flumeWater[0];
   const irCol=P('iron'),bsCol=P('colBasalt'),fmCol=P('flumeFoam');
   const yGroundLocal=(lx,lz)=>terrainH(lx+ox,lz+oz);

   for(let i=0;i<SEGS.length;i++){
    const sg=SEGS[i];
    const lp0=[sg.p0[0]-ox,sg.p0[1],sg.p0[2]-oz];
    const lp1=[sg.p1[0]-ox,sg.p1[1],sg.p1[2]-oz];
    dvLogFlumeSeg(lp0,lp1,FW,{
     seamless:true,log:false,bents:3,skipFirstBent:i>0,
     pkCol,wdCol,cyCol,wtCol,yGroundFn:yGroundLocal
    });
   }

   dvNoCut(()=>svNoWalk(()=>{
    /* seamless iron-strapped cypress joint cradles + continuous water bridges at every interior node P[1]..P[9] */
    for(let i=1;i<PTS.length-1;i++){
     const p=PTS[i],sg0=SEGS[i-1],sg1=SEGS[i];
     const lx=p[0]-ox,ly=p[1],lz=p[2]-oz;
     const yaw=(sg0.yaw+sg1.yaw)*.5,pitch=(sg0.pitch+sg1.pitch)*.5;
     WX(lx,ly,lz,yaw,pitch,0,()=>{
      /* stepped +14 mm proud outside the 85 mm V-plank walls so zero coplanar faces */
      box('iron',0,-.295,0,.28,.035,.26,irCol);
      for(const s of [-1,1]){
       box('iron',s*(FW*.27+.042),FW*.17-.052,0,FW*.65,.028,.22,irCol,0,0,s*.64);
       box('cypress',s*(FW*.51+.065),FW*.39+.018,0,.12,.11,.26,cyCol);
      }
      box('flumeWater',0,FW*.19,0,FW*.48,.095,.12,wtCol);
     });
     /* battered basalt pier footings anchoring high trestle bents into the gorge slope */
     const yg=terrainH(p[0],p[2]);
     if(ly-yg>3.2){
      const px=Math.cos(yaw),pz=-Math.sin(yaw),sp=.55+(ly-.22-yg)*.13;
      for(const s of [-1,1]){
       const fx=lx+s*px*sp,fz=lz+s*pz*sp,fg=terrainH(fx+ox,fz+oz);
       dvBelowGrade(()=>dvFrustum4('colBasalt',fx,fz,.82,.82,.52,.52,fg-1.8,fg+.38,bsCol,{caps:true}));
      }
     }
    }

    /* Splitter 1 at P[5] (`world [5.45, 8.70, -5.00]`): gravity timber mill-launder feeding `dv-flume-forge`'s
       3 cascading overshot waterwheels (`world [3.25, 8.63, -4.94]`), stopping 60 mm clear of wheel spout */
    dvLogFlumeSeg([5.02-ox,8.68,-4.95-oz],[3.32-ox,8.46,-5.02-oz],.86,{
     seamless:true,log:false,bents:false,pkCol,wdCol,cyCol,wtCol
    });
    box('flumeWater',3.26-ox,8.64,-4.96-oz,.34,.085,.32,fmCol);

    /* Splitter 2 just south of P[7] (`world [6.15, 6.52, +13.95]`): gravity timber mill-launder feeding
       `dv-sawmill-jade`'s overshot waterwheel (`world [4.65, 6.03, +14.26]`), stopping 60 mm clear of wheel spout */
    dvLogFlumeSeg([5.72-ox,6.48,13.92-oz],[4.72-ox,6.12,14.18-oz],.84,{
     seamless:true,log:false,bents:false,pkCol,wdCol,cyCol,wtCol
    });
    box('flumeWater',4.66-ox,6.18,14.24-oz,.34,.085,.32,fmCol);

    /* Outfall crest at P[10] (`world [6.50, 3.36, +39.50]`): parabolic whitewater plume plunging into Lower Boom-Pond */
    WX(PTS[10][0]-ox,3.12,PTS[10][2]-oz+.95,0,.42,0,()=>{
     box('flumeWater',0,0,0,.64,.11,2.05,fmCol);
    });
   }));
  }});

 /* 3c. Lower Log-Boom Sorting Pond & Confluence Waterfall Weir (`dv-village-boompond`) */
 defBuilding({key:'dv-village-boompond',name:'Tivi-Auzi Lower Log-Boom Sorting Pond & Overflow Weir',seed:7503,
  cls:'infrastructure',w:17.2,d:15.4,h:4.2,cut:false,front:{x:-7.2,z:-6.6,yaw:PI},
  tags:{types:['infrastructure','industry'],wealth:'middle',style:'flume',role:'log-boom sorting pond'},
  note:'Basalt-and-skarn quay basin (`y_pond = 2.67 m`) catching peeled red-cypress logs from the tailrace chute behind chained floating boom-logs beside the Joiner yard, spilling over a south weir cascade into the Crookwash canyon.',
  build(){
   const bsCol=P('colBasalt'),tfCol=P('tuff'),skCol=P('skarn'),wtCol=P('flumeWater'),fmCol=P('flumeFoam'),cyCol=P('cypress'),irCol=P('iron');
   dvRootSkirt(0,0,15.6,13.6,5.8,{mk:'colBasalt',plinthH:.24});
   dvNoCut(()=>svNoWalk(()=>{
    /* 4-sided stone quay curb framing the 14 x 12 m sorting pond (clean step between north/south and east/west walls so 0 coplanarity) */
    box('colBasalt',0,-.65,-6.45,15.6,1.12,.7,bsCol);
    box('colBasalt',-7.45,-.65,0,.68,1.1,12.04,bsCol);
    box('colBasalt', 7.45,-.65,0,.68,1.1,12.04,bsCol);
    /* south weir dam with central 4.4 m overflow waterfall spillway at z = +6.45 */
    box('tuff',-5.1,-.65,6.45,5.4,1.12,.72,tfCol);
    box('tuff', 5.1,-.65,6.45,5.4,1.12,.72,tfCol);
    box('skarn',0,-.65,6.45,4.3,0.64,.7,skCol);
    box('skarn',-7.45,.458,0,.82,.1,12.02,skCol);
    box('skarn', 7.45,.458,0,.82,.1,12.02,skCol);

    /* pond bed, main `flumeWater` sorting sheet, and foaming splash rings at chute impact (`local z = -3.8`) */
    box('rivercobble',0,-.68,0,14.0,.14,11.9,P('rivercobble'));
    box('flumeWater',0,-.04,0,13.9,.06,11.9,wtCol);
    cyl('flumeWater',0,-.02,-3.6,1.65,.09,fmCol,14);
    cyl('flumeWater',0,.08,-3.9,.95,.14,fmCol,12);

    /* chained floating red-cypress log-boom ring + 4 sorted floating cypress logs corralled for the Joiner */
    const boom=[[-5.4,-4.8],[-5.4,4.6],[-2.2,5.1],[2.2,5.1],[5.4,4.6],[5.4,-4.8]];
    for(let i=0;i<boom.length-1;i++){
     const a=boom[i],b=boom[i+1];
     dvCypressLog([a[0],.03,a[1]],[b[0],.03,b[1]],.16);
     ring('iron',(a[0]+b[0])*.5,.05,(a[1]+b[1])*.5,.19,.028,irCol,0,PI/2,0,8);
    }
    dvCypressLog([-3.6,.04,-.8],[.2,.04,-1.4],.25);
    dvCypressLog([ 1.1,.04, .6],[4.6,.04, .2],.26);
    dvCypressLog([-2.8,.04, 1.9],[1.4,.04, 2.4],.24);
    dvCypressLog([ 1.6,.04, 3.4],[4.8,.04, 3.1],.25);

    /* east timber sorting-hook catwalk facing `dv-joiner-cypress` */
    box('planks',6.45,.49,0,1.15,.09,10.4,P('planks'));
    for(const sz of [-4.6,0,4.6])cyl('cypress',5.95,.58,sz,.08,.92,cyCol,8);

    /* foaming waterfall cascade plunging strictly downward from the south skarn spillway (`local y = -0.02`) into the Crookwash River (`local y = -3.60`) */
    dvBelowGrade(()=>{
     box('colBasalt',0,-4.2,6.46,4.5,3.54,.64,bsCol);
     WX(0,-3.62,7.42,0,-.18,0,()=>{
      box('flumeWater',0,0,0,3.85,3.62,.22,fmCol);
     });
     box('flumeWater',0,-.05,6.46,3.95,.08,.76,fmCol);
     cyl('flumeWater',0,-3.66,7.65,2.05,.14,fmCol,14);
    });
   }));
   dvLampBracket(-7.45,1.45,-5.8,PI/2,.9);
   dvLampBracket( 7.45,1.45,-5.8,-PI/2,.9);
  }});

 /* 3d. Stepped Gorge Flagstone Stair-Streets, Retaining Walls & Basalt Crag Ribs (`dv-village-streets`) */
 defBuilding({key:'dv-village-streets',name:'Dzagh-Kucha Stepped Flagstone Gorge Streets & Retaining Walls',seed:7504,
  cls:'infrastructure',w:38.0,d:86.0,h:13.8,cut:false,front:{x:-2.0,z:31.0,yaw:0},
  tags:{types:['infrastructure'],wealth:'middle',style:'aul',role:'stepped gorge street'},
  note:'Rock-cut flagstone stair flights, apricot-tuff & columnar-basalt terrace retaining scarps, and gorge lantern posts linking the four stepped benches of Flumi-Bridzi.',
  build(){
   const ox=-12.0,oz=-6.0,fgCol=P('flagstone'),cbCol=P('cobble'),bsCol=P('colBasalt'),tfCol=P('tuff');
   /* walkable rock-cut flagstone stair flights linking every terrace level */
   dvExtStair(-14.5-ox,-36.2-oz, 8.60,11.40,PI,2.2,4.2);
   dvExtStair(-14.5-ox,-17.0-oz, 5.20, 8.60,PI,2.3,4.8);
   dvExtStair(-14.5-ox,  2.5-oz, 3.20, 5.20,PI,2.4,3.4);
   dvExtStair(-14.5-ox, 23.5-oz, 2.85, 3.20,PI,2.4,1.6);
   /* flagstone plaza landings (kept >= 1.5 m clear of `dv-bridge-duel` east stair at x = -18.85) + gorge retaining ribs */
   dvNoCut(()=>svNoWalk(()=>{
    box('flagstone',-14.5-ox,8.56,-26.5-oz,3.2,.07,13.5,fgCol);
    box('flagstone',-14.5-ox,5.16, -7.5-oz,3.4,.07,13.0,fgCol);
    box('flagstone',-14.5-ox,3.16, 13.5-oz,3.4,.07,13.5,fgCol);
    box('cobble',   -14.8-ox,2.81, 35.0-oz,4.2,.07, 4.2,cbCol);
    /* stepped apricot-tuff & columnar-basalt terrace retaining walls anchoring the bench scarps */
    dvBelowGrade(()=>{
     box('colBasalt',-23.5-ox,5.0,-38.2-oz,12.0,6.1,.75,bsCol);
     box('tuff',     -23.5-ox,11.12,-38.2-oz,12.1,.28,.82,tfCol);
     box('colBasalt',-23.5-ox,2.0,-18.8-oz,13.0,6.3,.75,bsCol);
     box('tuff',     -23.5-ox,8.32,-18.8-oz,13.1,.28,.82,tfCol);
    });
   }));
   dvLampBracket(-12.8-ox,10.6,-24.0-oz,PI/2,.95);
   dvLampBracket(-12.8-ox, 7.2, -5.5-oz,PI/2,.95);
   dvLampBracket(-12.8-ox, 5.2, 15.5-oz,PI/2,.95);
  }});

 /* ---- 4. Populate SITES & ROWS ---- */
 SITES.length=0;ROWS.length=0;
 for(const B of BLDG_PLAN)if(!ONLYSET||ONLYSET.has(B.key))SITES.push({key:B.key,x:B.x,z:B.z,ry:B.ry,o:{v:0,y:B.y}});
 for(const I of INFRA_PLAN)if(!ONLYSET||ONLYSET.has(I.key))SITES.push({key:I.key,x:I.x,z:I.z,ry:I.ry,o:{v:0,y:I.y}});
 for(const L of FLORA_LIFE)if(!ONLYSET||ONLYSET.has(L.key))SITES.push({key:L.key,x:L.x,z:L.z,ry:L.ry,o:L.o||{v:0}});
 ROWS.push({family:'Flumi-Bridzi Confluence Hamlet',z:0,d:110,w:80,h:20,keys:SITES.map(s=>s.key)});

 /* ---- 5. Sculpted Terraced Gorge Confluence Terrain (`terrainH`) ---- */
 const ALL_PADS=BLDG_PLAN.concat(INFRA_PLAN).filter(p=>p.pad);

 function baseGorgeH(x,z){
  /* North-to-South stepped volcanic gorge bench profile */
  let h=2.85;
  if(z<-38){
   h=lerp(8.8,12.2,smooth(-38,-46,z));
  }else if(z<-17){
   h=lerp(5.4,8.6,smooth(-17,-24,z));
  }else if(z<4){
   const eastDrop=smooth(-12,2,x);
   h=lerp(lerp(3.4,5.2,smooth(4,-4,z)),0.15,eastDrop);
  }else if(z<24){
   const millDrop=smooth(-13,-4,x)*(1-smooth(12,18,x));
   h=lerp(3.2,1.45,millDrop);
  }else{
   h=2.85;
  }

  /* Steep flanking apricot-tuff & basalt canyon walls framing the settlement (`|x| > 35` or `z < -63`) */
  const wx=smooth(35,62,Math.abs(x));
  const wz=smooth(-62,-88,z);
  const crag=18.5*Math.max(wx,wz)+3.2*Math.sin(x*.06)*Math.cos(z*.05)*Math.max(wx,wz);
  h+=crag;

  /* 1. Main East-West Crookwash Canyon Chasm along the south front (`z = 51.5 .. 69.0`) */
  if(z>49.5&&z<74.0){
   const uIn=smooth(49.5,54.5,z),uOut=1-smooth(64.5,71.5,z);
   const cut=uIn*uOut;
   h=lerp(h,-3.85+.25*Math.sin(x*.09),cut);
   if(z>=68.0){
    const farWall=smooth(68.0,78.0,z)*(1-smooth(92.0,120.0,z));
    h+=14.5*farWall;
   }
  }

  /* 2. West Confluence Tributary Gorge flowing north-to-south right under `dv-bridge-duel` (`x = -28.5, z = 24..56`)!
     Bridge abutments stand on solid `y = 2.85` rock at `|x - (-28.5)| >= 4.6`, while the chasm cuts `|x + 28.5| < 4.2`! */
  if(z>22.0&&z<56.0&&Math.abs(x+28.5)<4.4){
   const ux=1-smooth(2.7,4.35,Math.abs(x+28.5));
   const uz=smooth(22.0,27.5,z);
   h=lerp(h,-3.65,ux*uz);
  }
  return h;
 }

 terrainH=function(x,z){
  let h=baseGorgeH(x,z);
  /* rock-cut building ledges: flat under each building footprint & doorway, blending smoothly into steep gorge scarps */
  for(let i=0;i<ALL_PADS.length;i++){
   const P0=ALL_PADS[i];
   const dx=Math.max(0,Math.abs(x-P0.x)-P0.pad[0]),dz=Math.max(0,Math.abs(z-P0.z)-P0.pad[1]);
   const d=Math.hypot(dx,dz);
   if(d<5.2){
    const w=1-smooth(0,5.2,d);
    h=lerp(h,P0.y,w);
   }
  }
  return h;
 };

 /* ---- 6. Rebuild Gorge Terrain Mesh & Rushing Crookwash Confluence Water ---- */
 {
  const NX=112,NZ=120;
  const g=new THREE.PlaneGeometry(GROUND_SIZE,GROUND_SIZE,NX,NZ);
  g.rotateX(-PI/2);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const vx=p.getX(i),vz=p.getZ(i);
   /* concentrate grid resolution tightly across the [-95, +95] gorge confluence zone */
   const mapCoord=v=>{
    const s=Math.sign(v),a=Math.abs(v)/(GROUND_SIZE*.5);
    return s*(a<.68?(a/.68)*105:105+((a-.68)/.32)*(GROUND_SIZE*.5-105));
   };
   const wx=mapCoord(vx),wz=mapCoord(vz);
   p.setXYZ(i,wx,terrainH(wx,wz),wz);
  }
  g.computeVertexNormals();
  groundM.geometry.dispose();
  groundM.rotation.set(0,0,0);
  groundM.geometry=g;
  groundM.updateMatrixWorld(true);

  /* Crookwash Confluence Canyon Torrent (#include <atmos_waves>) */
  const U={
   uSun:{value:new THREE.Vector3(.4,.7,.3)},uShallow:{value:new THREE.Color(0x4ba09c)},uDeep:{value:new THREE.Color(0x185262)},
   uSky:{value:new THREE.Color(0xbcd0da)},uFogCol:{value:new THREE.Color(0xcad3d8)},uFogDen:{value:.0004},
   uCam:{value:new THREE.Vector3()},uBodyK:{value:1},uSpecCol:{value:new THREE.Color(1,.96,.88)}
  };
  ATMOS.waveUniforms(U);
  const NXW=90,NZW=56,pos=[],dep=[],idx=[];
  for(let j=0;j<=NZW;j++)for(let i=0;i<=NXW;i++){
   const x=lerp(-95,95,i/NXW),z=lerp(20,73,j/NZW);
   const d0=Y_RIVER-terrainH(x,z);
   pos.push(x,Y_RIVER,z);dep.push(Math.max(0,d0));
  }
  for(let j=0;j<NZW;j++)for(let i=0;i<NXW;i++){
   const a=j*(NXW+1)+i,b=a+1,d=a+NXW+1,e=d+1;
   if(dep[a]>.02||dep[b]>.02||dep[d]>.02||dep[e]>.02)idx.push(a,b,d,b,e,d);
  }
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  sg.setAttribute('aDepth',new THREE.Float32BufferAttribute(dep,1));
  sg.setIndex(new THREE.Uint32BufferAttribute(idx,1));
  const sm=new THREE.ShaderMaterial({
   uniforms:U,transparent:true,side:THREE.DoubleSide,depthWrite:false,
   vertexShader:[
    '#include <atmos_waves>','attribute float aDepth;','varying vec3 vW; varying float vD; varying vec2 vP;',
    'void main(){ vec3 pos=position; vP=pos.xz; vD=aDepth; float att=clamp(aDepth/3.0,0.0,1.0); pos.y+=atmWaveHeight(pos.xz,0.0)*att*0.35;',
    ' vec4 wp=modelMatrix*vec4(pos,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'
   ].join('\n'),
   fragmentShader:[
    'precision highp float;','#include <atmos_waves>',
    'uniform float uFogDen; uniform vec3 uSun,uShallow,uDeep,uSky,uFogCol,uCam,uSpecCol; uniform float uBodyK;',
    'varying vec3 vW; varying float vD; varying vec2 vP;',
    'void main(){ float att=clamp(vD/3.0,0.0,1.0); float vdist=length(uCam-vW); float lod=1.0-smoothstep(240.0,1400.0,vdist);',
    ' vec3 N=atmWaveNormal(vP,vdist,3.4*(0.15+0.85*att)); vec3 V=normalize(uCam-vW); if(uCam.y<vW.y)N=-N;',
    ' float fres=pow(1.0-clamp(abs(dot(N,V)),0.0,1.0),3.2); float deepT=smoothstep(0.3,3.0,vD); vec3 body=mix(uShallow,uDeep,deepT);',
    ' float foam=smoothstep(0.65,0.05,vD)*0.32; body=mix(body,vec3(0.86,0.95,0.96),foam);',
    ' float diff=clamp(dot(N,uSun),0.0,1.0); body*=(0.68+0.44*diff)*uBodyK; vec3 H=normalize(uSun+V);',
    ' float spec=pow(clamp(dot(N,H),0.0,1.0),170.0)*1.35*lod; vec3 col=mix(body,uSky,clamp(fres*0.8,0.0,0.78))+uSpecCol*spec;',
    ' float alpha=mix(0.76,0.95,deepT); float fd=vdist*uFogDen; float fog=1.0-exp(-fd*fd); col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
    ' gl_FragColor=vec4(col,alpha); }'
   ].join('\n')
  });
  const M=new THREE.Mesh(sg,sm);M.renderOrder=1;M.name='sea';M.userData.probeSkip=true;M.frustumCulled=false;scene.add(M);
  const keepSky=skyApply;
  skyApply=function(){
   keepSky();const L=KratorSky.lighting();
   U.uSun.value.copy(LIGHTDIR);U.uFogCol.value.copy(L.fog);
   U.uSky.value.copy(L.fog).lerp(new THREE.Color(.74,.84,.92),.4);U.uBodyK.value=L.sunDir.y>.02?1:.35;
  };
  skyApply();
  FRAME_HOOKS.push(()=>U.uCam.value.copy(camera.position));
 }

 /* ---- 7. Live Animated Peeled Red-Cypress Logs Sliding Down the Gravity V-Flume (`ANIM_LOGS`) ---- */
 const ANIM_LOGS=[];
 const LOG_CYCLE=totalLen+7.5,LOG_SPEED=4.2,N_LOGS=5;

 function updateAnimLogs(t){
  for(let i=0;i<ANIM_LOGS.length;i++){
   const L=ANIM_LOGS[i];
   if(!L.group)continue;
   const dist=((L.phase+t*LOG_SPEED)%LOG_CYCLE+LOG_CYCLE)%LOG_CYCLE;
   if(dist<=totalLen){
    const st=sampleFlume(dist);
    L.group.position.set(st.x,st.y+L.r+.25,st.z);
    L.group.rotation.set(0,0,0,'YXZ');
    L.group.rotation.y=st.yaw;
    L.group.rotation.x=st.pitch;
    L.inner.rotation.z=dist*.22+i;
   }else{
    /* smooth splash-out glide into the Lower Log-Boom Sorting Pond (`z = 39.5 -> 43.2`, settling onto `Y_POND = 2.67 m`) */
    const u=(dist-totalLen)/7.5;
    const endP=PTS[PTS.length-1];
    const zOut=endP[2]+u*3.9;
    const yChute=endP[1]+L.r+.25;
    const yFloat=Y_POND+.04-Math.sin(u*PI)*.14;
    L.group.position.set(endP[0]+(i%2?1:-1)*u*.55,lerp(yChute,yFloat,smooth(0,.55,u)),zOut);
    L.group.rotation.set(lerp(SEGS[SEGS.length-1].pitch,0,smooth(0,.5,u)),lerp(0,(i%2?.18:-.18),u),0,'YXZ');
    L.inner.rotation.z=totalLen*.22+u*1.2;
   }
  }
 }

 {
  const prevBW=buildWorld;
  buildWorld=function(){
   ANIM_LOGS.length=0;
   const W0=prevBW();
   /* build 5 textured red-cypress logs (bark + endgrain) via core/engine bucket flush so UVs, vertex colors & MAT maps match 100% */
   for(let i=0;i<N_LOGS;i++){
    const B={},keepT=GTARGET,keepCMS=CMS.slice(),keepCM=CM,keepSB=SB;
    const len=3.8+(i%3)*.35,r=.24+(i%2)*.02;
    GTARGET=B;SB=null;resetCM();
    try{
     dvNoCut(()=>dvCypressLog([0,0,-len*.5],[0,0,len*.5],r));
    }finally{
     GTARGET=keepT;CMS.length=0;for(const m of keepCMS)CMS.push(m);CM=keepCM;SB=keepSB;
    }
    const wrap=new THREE.Group(),inner=new THREE.Group();
    wrap.name='flume-anim-log-'+i;
    flushBuckets(B,inner,true);
    wrap.add(inner);W0.add(wrap);
    ANIM_LOGS.push({group:wrap,inner,len,r,phase:(i/N_LOGS)*LOG_CYCLE});
   }
   updateAnimLogs(ANIMU.uTime.value);
   return W0;
  };
  FRAME_HOOKS.push(()=>updateAnimLogs(ANIMU.uTime.value));
 }

 /* ---- 8. Required Settlement Camera Presets (`overview`, `headpond`, `trestle`, `waterwheel`, `splashpond`, `street`) ---- */
 autoViews=function(){
  return {
   overview:   [ 52.0, 38.0,  74.0,  -3.0,  5.5,  -1.0],
   headpond:   [  0.5, 19.2, -36.5,   6.0, 13.5, -53.0],
   trestle:    [ 15.8, 11.4, -15.5,   6.2,  9.8, -28.0],
   waterwheel: [ 16.5,  8.6,   7.5,   2.8,  5.2,   1.5],
   splashpond: [ 23.5, 11.5,  62.0,   5.5,  2.2,  44.5],
   street:     [-14.5,  7.4,  24.0, -14.5,  6.8,  -8.0]
  };
 };

 /* ---- 9. Physical & Geometric Continuity Audit (`DV_FLUME_VILLAGE.audit()`) ---- */
 function audit(){
  let maxGapMm=0,uphill=0,minDeg=90,maxDeg=0;
  for(let i=0;i<SEGS.length;i++){
   const sg=SEGS[i];
   if(sg.dy>=0)uphill++;
   if(sg.deg<minDeg)minDeg=sg.deg;
   if(sg.deg>maxDeg)maxDeg=sg.deg;
   if(i>0){
    const prev=SEGS[i-1];
    const gap=Math.hypot(sg.p0[0]-prev.p1[0],sg.p0[1]-prev.p1[1],sg.p0[2]-prev.p1[2])*1000;
    if(gap>maxGapMm)maxGapMm=gap;
   }
  }
  const headOk=Y_HEAD>PTS[0][1]&&Math.abs((PTS[0][1]+.32)-Y_HEAD)<.08;
  const pondOk=PTS[PTS.length-1][1]>Y_POND;
  const gradeOk=minDeg>=4.0&&maxDeg<=8.0;
  const logsOk=ANIM_LOGS.length===N_LOGS&&ANIM_LOGS.every(l=>l.group&&isFinite(l.group.position.y));
  const wheelsOk=DV_SPINNERS.length>=4;
  const ok=uphill===0&&maxGapMm<0.01&&headOk&&pondOk&&gradeOk&&logsOk&&wheelsOk;
  return {
   ok,segments:SEGS.length,totalLenM:+totalLen.toFixed(2),
   yStart:PTS[0][1],yEnd:PTS[PTS.length-1][1],yHead:Y_HEAD,yPond:Y_POND,
   minDeg:+minDeg.toFixed(2),maxDeg:+maxDeg.toFixed(2),maxGapMm:+maxGapMm.toFixed(3),
   uphill,animLogs:ANIM_LOGS.length,spinners:DV_SPINNERS.length,
   detail:`${SEGS.length} seamless segments (${totalLen.toFixed(1)} m, y ${PTS[0][1]}->${PTS[PTS.length-1][1]} m, grade ${minDeg.toFixed(2)}..${maxDeg.toFixed(2)} deg, gap ${maxGapMm.toFixed(3)} mm, uphill ${uphill}), ${ANIM_LOGS.length} live logs, ${DV_SPINNERS.length} rotating waterwheels`
  };
 }

 return {PTS,SEGS,totalLen,sampleFlume,audit,ANIM_LOGS};
})();
globalThis.DV_FLUME_VILLAGE=DV_FLUME_VILLAGE;
