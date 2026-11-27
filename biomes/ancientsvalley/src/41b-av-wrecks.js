// ================================================================= THE ANCIENT'S VALLEY — the data side: the ruined vehicles on the streets
// [G data] Plain data and pure functions on core/rand (KRAND): no THREE, no DOM (tests/test-av.js). The owner, 2026-11-07: ruined vehicles in
// the streets. The Motor Vehicles kit's Ancients culture (kits/motor-vehicles krator-vehicles-ancient.js) has the machines and their ruin
// states ('weathered' | 'burnt' | 'wreck'); this fragment says WHERE each stands, as a record, and 73-host-wrecks.js draws the records.
//   AV.wrecks(o) -> [{id, key, variant, state, seed, x, z, yaw, axis, line, step, lane, av, form}]
//     along every street line of the lattice (46z: the streets run on the half lines (k + 1/2) pitch, every third an avenue), a wreck every so
//     many metres by a hash of (seed, axis, line, step), more on the avenues, in a lane (a lateral offset inside the roadway), facing along the
//     street with a jitter, a share skewed or crosswise; the key by weights (pods and saloons common; vans, utilities, haulers, the watch's
//     police saloons; a tank or two near the craters), the variant by hash, the state by the scorch field (burnt near the burns and the craters,
//     else wreck or weathered by hash); none within a crossing's width of the crossing line (the junctions stay clear for what the transit kit
//     puts there), none where o.ok says no, none inside an o.avoid disc (the transit kit's blockades); o.max caps the count. The owner,
//     2026-11-09: wrecks and the signs of violence increase toward the lake: the chance climbs with o.lake (0.4 x at the far edge, 1.6 x at the
//     shore), and the tanks and the helicopters stand only in the lakeward half, more the nearer.
//   o: {R, lattice:{c, s, pitch, AW, SW}, seed, scorch(x,z) 0..1, density(x,z) 0..1, lake(x,z) 0..1 (nearness to the lake: 1 at the shore, 0 at
//       the page's far edge; without it every place counts as the middle), ok(x,z) (true where one may stand; the record's nose and
//       tail are asked too), craters:[{x,z,r}], avoid:[{x,z,r}], max (700), formOf(state, seed, key) -> the kit's ruin form (the host passes
//       KratorVehicles.ruinOf; without it `form` is null), air:{jet:true, helis:2, plazas:[{x,z}]} (an airliner skidded down an avenue, helicopters
//       on the plazas; off by default), sizes:{key:{w,d,h}} (the kit's boxes; AV.WRECK_KEYS' defaults otherwise)}
//   AV.WRECK_KEYS   the Ancients' keys with their weights on a street (wt) and an avenue (av), their variant counts and boxes
//   AV.wreckState(seed, h, sc)   the state by the scorch value sc and a hash h: burnt where the ground is burnt, else wreck or weathered
AV.WRECK_KEYS=[{key:'anc_pod',name:'pod',w:2.3,d:3.3,h:1.7,v:2,wt:30,av:28},{key:'anc_saloon',name:'saloon',w:2.6,d:6,h:1.5,v:2,wt:26,av:24},
 {key:'anc_police',name:'police saloon',w:2.6,d:6,h:1.8,v:2,wt:5,av:7},{key:'anc_van',name:'van',w:2.7,d:6,h:2.5,v:2,wt:12,av:12},
 {key:'anc_utility',name:'utility',w:2.8,d:6.2,h:2.6,v:2,wt:7,av:9},{key:'anc_hauler',name:'hauler',w:2.75,d:9.2,h:3.3,v:4,wt:3,av:9},
 {key:'anc_tank',name:'tank',w:3.6,d:11.6,h:3.2,v:2,wt:0,av:0,crater:3},
 {key:'anc_heli',name:'helicopter',w:10.6,d:14.2,h:4.5,v:2,wt:0,av:0,air:true},{key:'anc_jet',name:'airliner',w:26,d:32,h:9,v:1,wt:0,av:0,air:true}];
AV.wreckState=function(seed,h,sc){var u=KRAND.unit(KRAND.hash(h,seed,61));if(u<AV.smooth(.2,.7,sc)*.92)return 'burnt';var v=KRAND.unit(KRAND.hash(h,seed,62));return v<.58?'wreck':v<.84?'weathered':'burnt';};
AV.wrecks=function(o){var out=[],seed=o.seed|0,LT=o.lattice,p=LT.pitch,c=LT.c,s=LT.s,R=o.R,max=o.max==null?700:o.max,K=AV.WRECK_KEYS,C=o.craters||[],AVOID=o.avoid||[],SZ=o.sizes||{};
 var n=Math.ceil((R+p)/p)+1,toW=function(lx,lz){return[lx*c-lz*s,lx*s+lz*c];},isAv=function(k){return((k%3)+3)%3===1;};
 var size=function(k){var d=SZ[k.key];return d?{w:d.w,d:d.d,h:d.h}:{w:k.w,d:k.d,h:k.h};};
 var okAt=function(x,z){return Math.hypot(x,z)<=R&&(!o.ok||o.ok(x,z));};
 var avoided=function(x,z,r){for(var i=0;i<AVOID.length;i++)if(Math.hypot(x-AVOID[i].x,z-AVOID[i].z)<AVOID[i].r+r)return true;return false;};
 var craterD=function(x,z){var d=1e9;for(var i=0;i<C.length;i++){var e=Math.hypot(x-C[i].x,z-C[i].z)/C[i].r;if(e<d)d=e;}return d;};
 var lakeAt=function(x,z){return o.lake?AV.clamp(o.lake(x,z),0,1):.5;};
 /* the key by weights: a street's or an avenue's column; a tank's weight only in the lakeward half, more the nearer the lake, and three times
    that within 3 r of a crater (the war came up the roads to the strikes) */
 var pickKey=function(u,av,x,z){var cd=craterD(x,z),lk=Math.max(0,(lakeAt(x,z)-.5)*2),tot=0,w=[],i;for(i=0;i<K.length;i++){var k=K[i],wt=k.air?0:(av?k.av:k.wt)+(k.crater?k.crater*lk*(cd<3?3:1):0);w.push(wt);tot+=wt;}
  var t=u*tot;for(i=0;i<K.length;i++){t-=w[i];if(t<0)return K[i];}return K[0];};
 /* fits: the nose and the tail stand where one may, off every avoid disc */
 var fits=function(x,z,yaw,d,w){var hx=Math.sin(yaw)*d/2,hz=Math.cos(yaw)*d/2;return okAt(x,z)&&okAt(x+hx,z+hz)&&okAt(x-hx,z-hz)&&!avoided(x,z,Math.max(w,d)/2);};
 var yawOf=function(a){return a===0?Math.atan2(-s,c):Math.atan2(c,s);};   /* the world heading of a line of constant lx (a = 0) or constant lz (a = 1) */
 for(var a=0;a<2;a++)for(var k=-n;k<=n;k++){var v=(k+.5)*p,av=isAv(k),hw=av?LT.AW:LT.SW,step=av?30:40,chance=av?.26:.1,ns=Math.ceil((R+p)/step);
  for(var si=-ns;si<=ns;si++){var h=KRAND.hash(seed,a,k+40000,si+40000),u=function(salt){return KRAND.unit(KRAND.hash(h,salt));};
   var along=si*step+(u(1)-.5)*step*.7;
   /* the junctions stay clear: nothing within the crossing line's half width plus 7 m of a crossing */
   var kc=Math.round(along/p-.5),dc=Math.abs(along-(kc+.5)*p),hwc=isAv(kc)?LT.AW:LT.SW;if(dc<hwc+7)continue;
   var lane=(u(2)*2-1)*(hw-2.2),W=a===0?toW(v+lane,along):toW(along,v+lane),x=W[0],z=W[1];
   var dens=o.density?o.density(x,z):1;if(dens<.25||u(3)>chance*AV.smooth(.25,.6,dens)*(.4+1.2*lakeAt(x,z)))continue;
   var key=pickKey(u(4),av,x,z),sz=size(key);
   /* facing: along the street, the side of the road deciding the way (one in seven against it); a jitter; a fifth skewed, a twelfth crosswise */
   var yaw=yawOf(a)+(lane>0?0:Math.PI)+(u(5)<.14?Math.PI:0)+(u(6)-.5)*.3,f=u(7);if(f<.08)yaw+=Math.PI/2+(u(8)-.5)*.5;else if(f<.28)yaw+=(u(8)-.5)*1.3;
   if(!fits(x,z,yaw,sz.d,sz.w))continue;
   var sc=o.scorch?o.scorch(x,z):0,state=AV.wreckState(seed,h,sc),vseed=1+Math.floor(u(9)*4),variant=Math.floor(u(10)*key.v);
   out.push({id:'av.w.'+a+'.'+k+'.'+si,key:key.key,name:key.name,variant:variant,state:state,seed:vseed,x:x,z:z,yaw:yaw,axis:a,line:k,step:si,lane:lane,av:av,w:sz.w,d:sz.d,h:sz.h,
    form:o.formOf?(o.formOf(state,vseed,key.key)||{}).form||null:null,prio:u(11)});}}
 /* the cap: the records with the lowest priority hash stay, so a cap thins the page evenly and the same records survive every build */
 if(out.length>max){out.sort(function(A,B){return A.prio-B.prio;});out.length=max;}
 out.sort(function(A,B){return A.id<B.id?-1:A.id>B.id?1:0;});out.forEach(function(r){delete r.prio;});
 /* THE AIRCRAFT (if the host asks): an airliner that came down an avenue and skidded along it (the kit's 'skidded' form trails a 30 m furrow back
    from the tail: flat open roadway there), and helicopters on the plazas, each in the first wreck form the hash finds among the forms asked */
 var air=o.air;if(air){var J=K[8],H=K[7],pickForm=function(key,want,salt,tries){for(var t=0;t<tries;t++){var sd=1+t+salt*7;if(!o.formOf)return{seed:sd,form:null};var fm=(o.formOf('wreck',sd,key)||{}).form;if(want.indexOf(fm)>=0)return{seed:sd,form:fm};}return null;};
  if(air.jet){var lines=[];for(var kk=-n;kk<=n;kk++)if(isAv(kk))lines.push(kk);var hj=KRAND.hash(seed,9,1),placed=false;
   for(var tj=0;tj<40&&!placed;tj++){var aj=tj&1,kj=lines[Math.floor(KRAND.unit(KRAND.hash(hj,tj,1))*lines.length)],vj=(kj+.5)*p,sj=(KRAND.unit(KRAND.hash(hj,tj,2))*2-1)*R*.7;
    var yj=yawOf(aj)+(KRAND.unit(KRAND.hash(hj,tj,3))<.5?Math.PI:0),Wj=aj===0?toW(vj,sj):toW(sj,vj),xj=Wj[0],zj=Wj[1],fx=Math.sin(yj),fz=Math.cos(yj),good=true;
    for(var q=-J.d/2-32;q<=J.d/2&&good;q+=8)if(!okAt(xj+fx*q,zj+fz*q)||(o.density&&o.density(xj+fx*q,zj+fz*q)<.3))good=false;
    if(!good||avoided(xj,zj,J.d/2+32))continue;var pf=pickForm(J.key,['skidded'],1,24);if(!pf)break;var szj=size(J);
    out.push({id:'av.w.jet',key:J.key,name:J.name,variant:0,state:'wreck',seed:pf.seed,x:xj,z:zj,yaw:yj,axis:aj,line:kj,step:null,lane:0,av:true,w:szj.w,d:szj.d,h:szj.h,form:pf.form,air:true});placed=true;}}
  /* the helicopters' plazas: the lakeward half only, sorted nearest the lake first, the draw skewed toward the near end */
  var P=(air.plazas||[]).filter(function(pl){return lakeAt(pl.x,pl.z)>.5;}).sort(function(A,B){return lakeAt(B.x,B.z)-lakeAt(A.x,A.z)||A.x-B.x||A.z-B.z;}),nh=air.helis==null?0:air.helis,hh=KRAND.hash(seed,9,2);
  for(var th=0;th<P.length*3&&nh>0;th++){var uh=KRAND.unit(KRAND.hash(hh,th,1)),pl=P[Math.floor(uh*uh*P.length)],yh=KRAND.unit(KRAND.hash(hh,th,2))*Math.PI*2,szh=size(H);
   if(!okAt(pl.x,pl.z)||avoided(pl.x,pl.z,szh.d/2)||out.some(function(r){return r.air&&Math.hypot(r.x-pl.x,r.z-pl.z)<60;}))continue;
   var ph=pickForm(H.key,['nosedived','overturned','gutted','broken'],2+th,24);if(!ph)break;
   out.push({id:'av.w.heli.'+th,key:H.key,name:H.name,variant:Math.floor(KRAND.unit(KRAND.hash(hh,th,3))*H.v),state:'wreck',seed:ph.seed,x:pl.x,z:pl.z,yaw:yh,axis:null,line:null,step:null,lane:0,av:false,w:szh.w,d:szh.d,h:szh.h,form:ph.form,air:true});nh--;}}
 return out;};
