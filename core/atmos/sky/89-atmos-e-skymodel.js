// ================================================================= ATMOS — sky model: where everything in Krator's sky is, at any site and hour
// [G data] The ephemeris of the shared sky (core/atmos/SKY-PLAN.md, 3.1), lifted from Voth's 21-sky.js and made whole:
// the sun from latitude, tilt, day of year and hour; the gas giant FIXED per site (Krator is tidally locked: its
// position follows from the site's latitude and its longitude from the sub-giant point). THE GIANT IS ON THE EQUATOR (the owner, 2026-10-25,
// after a spell lifted to declination -39 for rarer eclipses): where a tidally locked moon's giant hangs, so the sun passes behind it
// ~2 h a day for ~2.5 months round each equinox, the realistic count. decDeg would lift it again. Its ring plane is Krator's
// equatorial plane (giant.axis 'equator', 2026-10-26), through the line of sight, so the rings stay a hairline and the sun lights
// the giant along them; giant.axis 'sky' is the old canon (tilted axisTiltDeg from the sky's up). The giant's moons orbit in its equator, the plane of its rings, so from
// Krator they ride along the ring line (the owner, 2026-10-25): the Companion, Vesta-like and lumpy, a Trojan sharing Krator's own
// orbit 60 degrees ahead, so it hangs fixed beside the giant and waxes and wanes once a day; the Week (6.87 d, two-faced,
// Iapetus-like) and the Thirteen (12.55 d, a carbon world with tar seas) orbit outside Krator, so their phases,
// 7 and 13 days as seen from Krator, and the Double Dark every 91 days come out of the geometry, not a table; the stars
// turn at the sidereal rate, so the Pleiades' season follows the year.
// No THREE, no DOM. Directions are world unit vectors [x,y,z]: x east, y up, z south. Angles in degrees unless named.
//   ATMOS.SKY                       the constants (LORE section 2); ATMOS.SKY.stars the bright stars, made once
//   ATMOS.siteAt(px, py)            a site from the scale model's pixel: {px, py, latitude, subGiantLon}
//   ATMOS.skyState(site, hour, dayCount)   everything one frame needs (below); dayCount 0 is game start's date
//   ATMOS.skyDate(dayCount, hour)  the date: day of year, month and day, Jimjam's counts
//   ATMOS.ridgeProfile(layer, n)    a far ridge's elevation by azimuth (degrees), n samples round the compass
// Godot: the same functions in krator/sky.gd (the sky's own twin of this file), test vectors from core/atmos/test-sky.js.
(function(){const A=ATMOS,D=Math.PI/180;
 const S=A.SKY={
  dayH:24, yearD:365, tilt:23, solsticeDay:350,      // southern summer solstice (LORE); the spring equinox is day 258.75
  startDay:259, startHour:6,                         // game start: the southern spring equinox, sunrise (the owner, 2026-10-25)
  // the site frame on the scale model (2 km/px, x east, y south): Voth at 40 S, 84 km a degree (radius ~4,800 km), and
  // the point under the giant 57 degrees east of Voth (21-sky.js): Voth sees it NE, 24.7 degrees up (the canon)
  frame:{mPerPx:2000, refPx:[446,690], refLat:-40, kmPerDeg:84, refSubLon:57},
  giant:{diaDeg:30, decDeg:0, axis:'equator', axisTiltDeg:23, spinH:10, ringIn:1.30, ringOut:2.12, ringOpenDeg:1.6, orbitKm:194000,
   // the daily libration (the owner, 2026-10-25): Krator's orbit is tilted incDeg to the giant's equator, so once an orbit the
   // giant nods north and south by it and the rings open and close through edge-on (turning their lit face to Krator, then
   // their unlit one); the Laplace chain keeps the orbit a little eccentric (ecc), so the giant also swings east and west by
   // 2*ecc radians (~1.1 degrees). phase offsets the nod from the swing
   libration:{incDeg:1.6, ecc:0.01, phase:4.04}},   // orbitKm: Krator's (a 24 h orbit, Kepler from the Week's)
  sunDiaDeg:0.53,
  // the giant's moons (the owner, 2026-10-25). kind: 0 Io-like (sulfur, volcanoes: Day), 1 Callisto-like (dark, cratered),
  // 2 Venus-like (clouded), 3 Ceres- or Vesta-like (grey, cratered; lump > 0 makes it irregular), 5 Mimas-like (icy, grooved, one huge crater on its
  // leading face), 6 vitriolic (sulfuric-acid seas, dark red land, bright brownish cloud, a pale green limb), 7 a carbon world (rust and
  // ochre crusts, tar seas over a quarter of it, pale haze: the Thirteen, the owner 2026-10-25), 4 Iapetus-like
  // (its leading hemisphere coal-dark, its trailing one bright, an equatorial ridge). The Companion is a Trojan (trojanDeg ahead of Krator on its orbit); the others' phase0 makes
  // both new at the Double Dark the day before game start, solved below. 'Companion' is a working name
  moons:[{name:'Companion', kind:3, trojanDeg:60, radiusKm:470, albedo:[1,1,1], lump:0.24},   // lump: Vesta's lopsided, squashed shape (the owner, 2026-10-25)
         {name:'Week', kind:4, periodD:6.87, orbitKm:700000, radiusKm:4000, albedo:[1,1,1]},
         {name:'Thirteen', kind:7, periodD:12.55, orbitKm:1050000, radiusKm:4600, albedo:[1,1,1]},
         // Day (the owner, 2026-10-25): Io-like, inside Krator's orbit in a 2:1 resonance (12 h, Kepler from Krator's 24 h and
         // 194,000 km), just outside the rings; Krator keeps its orbit eccentric, so it is tidally torn into volcanoes. It laps
         // Krator once a day: it swings ~39 degrees either side of the giant, crosses its face (~3 degrees across) and hides behind it
         {name:'Day', kind:0, periodD:0.5, orbitKm:122200, radiusKm:1820, albedo:[1,1,1], laplace:0},
         // the rest of the Laplace chain (the owner, 2026-10-25): Day 1/2 day, Krator 1, the 2-day moon, the 4-day moon
         // (1:2:4:8). Their longitudes at the Double Dark keep each link's Laplace relation, l1 - 3 l2 + 2 l3 = 180, so three
         // neighbours never line up: laplace is the moon's lead on Krator then (Day 0: it transits). Working names
         {name:'Two-Day', kind:5, periodD:2, orbitKm:307950, radiusKm:1500, albedo:[1,1,1], laplace:90},      // Mimas-like: grooves, one huge crater
         {name:'Four-Day', kind:6, periodD:4, orbitKm:488840, radiusKm:3400, albedo:[1,1,1], laplace:225}],  // vitriolic: sulfuric-acid seas under bright cloud
  // the broken station (the owner, 2026-10-26): a torus 24 km across (sized so its ring just reads at a 50 degree view) round Krator itself, 2,200 km up (radius 7,000 km, a
  // third of Krator's Hill sphere in the giant's pull, so the orbit holds; far above any air, so it has not decayed in a
  // thousand years). 2.48 h a lap, west to east, inclined 52 degrees so it passes over the crater's latitudes; Krator's
  // bulge turns its orbit's node backward 1.57 degrees a day. Dead, it hangs by the gravity gradient, its axis across
  // the track rocking slowly (lib); a sector is torn out and its wreckage trails behind it along the orbit (trailKm)
  station:{orbitKm:7000, incDeg:52, node0:40, u0:0, nodeDegPerDay:-1.57, radiusKm:12, tubeKm:1.4, trailKm:260,
   lib:{deg:25, swingDeg:10, periodD:3.1}},
  doubleDark:-0.5,                                   // world days from game start's midnight: noon of the day before
  // the Pleiades (3.4): Krator's sun sits on the cluster's edge; its centre at RA 18 h, dec -30, so the cluster owns
  // the southern winter nights (the owner, 2026-10-25)
  // An OLD cluster, M67's kind (the owner, 2026-10-25: old enough for complex life, colour welcome): its brightest members
  // golden and orange giants, a few white stars and blue stragglers; the dust it drifts through lit in their colours; one
  // planetary nebula (pn: RA, dec, radius in degrees), a dying member's shell
  cluster:{ra:270, dec:-30, core:25, reach:60, dust:100, pn:[255,-36,3.0]},
  // Jimjam's calendar for display (3.1): Earth's months, Jimjam-ized; Jimjam's weekdays and number words (LORE 6.14)
  months:['Janavari','Pepravari','Mārccu','Ēpral','Mē','Jūn','Julai','Ākasṭu','Ceppaṭampar','Akṭōpar','Navampar','Ṭicampar'],
  monthDays:[31,28,31,30,31,30,31,31,30,31,30,31],
  weekdays:['Sanḍē','Manḍē','Ṭyūsḍē','Vensḍē','Tarsḍē','Firaiḍē',"Sa'arḍē"],
  numbers:['Van','Ṭū','Tirī','Fōr','Faiv','Siks','Cevan','Eyiṭ','Nain','Ṭen','Ilevan','Ṭvelv','Tarṭīn']};
 // lowbias32: the same bits as the cloud deck's and the GLSL sky's hash
 const hash=A.skyHash=(x,y,s)=>{let h=(Math.imul(x,1597334677)^Math.imul(y,-482951495)^Math.imul(s,-1640531527))>>>0;
  h=(h^(h>>>16))>>>0;h=Math.imul(h,2146121005)>>>0;h=(h^(h>>>15))>>>0;h=Math.imul(h,-2073254261)>>>0;return(h^(h>>>16))>>>0;};
 const u01=(x,y,s)=>hash(x,y,s)/4294967296;
 const wrap360=a=>(a%360+360)%360;
 const norm=v=>{const l=Math.hypot(v[0],v[1],v[2]);return[v[0]/l,v[1]/l,v[2]/l];};
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 A.skyVec={dot,norm,altAz:v=>({alt:Math.asin(Math.max(-1,Math.min(1,v[1])))/D,az:wrap360(Math.atan2(v[0],-v[2])/D)}),
  fromAltAz:(alt,az)=>[Math.sin(az*D)*Math.cos(alt*D),Math.sin(alt*D),-Math.cos(az*D)*Math.cos(alt*D)]};

 // ---- the site
 A.siteAt=(px,py,o)=>{const F=S.frame,lat=F.refLat-(py-F.refPx[1])*F.mPerPx/1000/F.kmPerDeg;
  const sub=F.refSubLon-(px-F.refPx[0])*F.mPerPx/1000/(F.kmPerDeg*Math.cos(lat*D));
  return Object.assign({px,py,latitude:lat,subGiantLon:sub},o||{});};

 // ---- the frames. An equatorial direction (hour angle H, declination d) at latitude phi, as a world vector: the
 // horizontal-coordinate transform of 21-sky.js (its sign table is core/atmos/test-sky.js's first check)
 const worldHD=(H,d,phi)=>{const sa=Math.sin(phi)*Math.sin(d)+Math.cos(phi)*Math.cos(d)*Math.cos(H),alt=Math.asin(Math.max(-1,Math.min(1,sa)));
  const az=Math.atan2(-Math.cos(d)*Math.sin(H),Math.cos(phi)*Math.sin(d)-Math.sin(phi)*Math.cos(d)*Math.cos(H));
  return[Math.sin(az)*Math.cos(alt),Math.sin(alt),-Math.cos(az)*Math.cos(alt)];};
 // q(H,d) = (cos d cos H, -cos d sin H, sin d) maps linearly to the world: M's columns are q's basis vectors' images
 const local=phi=>{const c1=worldHD(0,0,phi),c2=worldHD(-Math.PI/2,0,phi),c3=worldHD(0,Math.PI/2,phi);return[c1,c2,c3];};
 // the sun's ecliptic longitude: 270 at the southern summer solstice (declination -tilt), 180 at the spring equinox
 const sunLon=t=>(270+360*(t-S.solsticeDay)/S.yearD)*D;
 const sunRaDec=t=>{const l=sunLon(t),e=S.tilt*D;return[Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l)),Math.asin(Math.sin(e)*Math.sin(l))];};
 const eq=(ra,dec)=>[Math.cos(dec)*Math.cos(ra),Math.cos(dec)*Math.sin(ra),Math.sin(dec)];

 // ---- the moons' epoch: both new (each between Krator and the sun's direction, in the equatorial plane) at S.doubleDark
 const kratorAt=(lst,Hg)=>{const rag=lst-Hg;return[-S.giant.orbitKm*Math.cos(rag),-S.giant.orbitKm*Math.sin(rag)];};
 const lstOf=(t)=>{const yd=S.startDay+t,ra=sunRaDec(yd)[0],h=((t%1)+1)%1*24;return 15*(h-12)*D+ra;};
 S.moons.forEach(m=>{if(!m.periodD)return;const t=S.doubleDark,lst=lstOf(t),K=kratorAt(lst,0),ra=sunRaDec(S.startDay+t)[0],s=[Math.cos(ra),Math.sin(ra)];
  if(m.laplace!=null){m.theta0=Math.atan2(K[1],K[0])+m.laplace*D-2*Math.PI*t/m.periodD;return;}
  // Hg drops out: the sub-giant longitude only turns the site, not the orbits; K is Krator's position for Hg=0
  const ks=K[0]*s[0]+K[1]*s[1],kk=K[0]*K[0]+K[1]*K[1],d=-ks+Math.sqrt(ks*ks-kk+m.orbitKm*m.orbitKm);
  m.theta0=Math.atan2(K[1]+d*s[1],K[0]+d*s[0])-2*Math.PI*t/m.periodD;});

 // ---- the bright stars (3.4), made once from the hash so they are canon: [ra, dec, intensity, r, g, b]
 S.stars=(function(){const C=S.cluster,out=[],c0=eq(C.ra*D,C.dec*D);
  // a point within `r` degrees of the cluster's centre, its density falling off outward
  const nearC=(i,r,s)=>{const a=Math.acos(1-(1-Math.cos(r*D))*Math.pow(u01(i,1,s),1.6)),b=2*Math.PI*u01(i,2,s);
   const up=Math.abs(c0[2])<.9?[0,0,1]:[1,0,0],e1=norm([c0[1]*up[2]-c0[2]*up[1],c0[2]*up[0]-c0[0]*up[2],c0[0]*up[1]-c0[1]*up[0]]),
    e2=[c0[1]*e1[2]-c0[2]*e1[1],c0[2]*e1[0]-c0[0]*e1[2],c0[0]*e1[1]-c0[1]*e1[0]];
   const v=[0,1,2].map(k=>c0[k]*Math.cos(a)+(e1[k]*Math.cos(b)+e2[k]*Math.sin(b))*Math.sin(a));
   return[Math.atan2(v[1],v[0])/D,Math.asin(v[2])/D];};
  // an old cluster's colours: most bright members are giants, golden to orange; one in five a blue straggler
  const blue=(i,s)=>{const k=u01(i,3,s),j=u01(i,5,s);return j<.2?[.70+.12*k,.80+.08*k,1]:j<.35?[1,.97,.92]:[1,.80-.16*k,.52-.22*k];};
  for(let i=0;i<14;i++){const p=nearC(i,C.core,11);out.push([p[0],p[1],2.2+3.4*Math.pow(u01(i,4,11),2)].concat(blue(i,11)));}   // the core's bright members
  for(let i=0;i<26;i++){const p=nearC(i,C.reach,12);out.push([p[0],p[1],.7+1.2*u01(i,4,12)].concat(blue(i,12)));}
  for(let i=0;i<24;i++){const z=2*u01(i,1,13)-1,ra=360*u01(i,2,13),k=u01(i,3,13);   // field stars all over the sky, some warm
   out.push([ra,Math.asin(z)/D,.45+.8*u01(i,4,13),k<.4?1:k<.7?.92:.78,k<.4?.82:k<.7?.92:.86,k<.4?.62:k<.7?.88:1]);}
  return out;})();

 // ---- the state at a site, a world hour and a day count. Returns plain numbers (the shader's uniforms come from it)
 A.skyState=function(site,hour,dayCount){
  const t=(dayCount||0)+hour/24,yd=S.startDay+t,phi=site.latitude*D,Hg=-site.subGiantLon*D;
  const [ra,dec]=sunRaDec(yd),H=15*(hour-12)*D,lst=H+ra;
  const M=local(phi);
  // W = M * Rz(-lst): world = W e for an inertial equatorial vector e. Rows of W^T take the world back to e (the shader's uEq)
  const cl=Math.cos(lst),sl=Math.sin(lst),W=[0,1,2].map(r=>[M[0][r]*cl-M[1][r]*sl,M[0][r]*sl+M[1][r]*cl,M[2][r]]);   // W[row][col]
  const toWorld=e=>[0,1,2].map(r=>W[r][0]*e[0]+W[r][1]*e[1]+W[r][2]*e[2]);
  const sunDir=norm(worldHD(H,dec,phi)),giantDir=norm(worldHD(Hg,S.giant.decDeg*D,phi)),pole=norm(M[2]);
  // libration: the giant's mean place nudged north-south (along Krator's meridian at the giant) and east-west, once a
  // sidereal orbit; the ring opening follows the nod
  const LB=S.giant.libration,ph=2*Math.PI*t*1.0027379,dN=LB.incDeg*D*Math.sin(ph+LB.phase),dE=2*LB.ecc*Math.sin(ph);
  {const g0=giantDir.slice(),pg=dot(pole,g0),nd=norm(pole.map((v,k)=>v-g0[k]*pg)),ew=norm([nd[1]*g0[2]-nd[2]*g0[1],nd[2]*g0[0]-nd[0]*g0[2],nd[0]*g0[1]-nd[1]*g0[0]]);
   const gl=norm([0,1,2].map(k=>g0[k]+nd[k]*Math.tan(dN)+ew[k]*dE));giantDir[0]=gl[0];giantDir[1]=gl[1];giantDir[2]=gl[2];}
  const ringOpen=S.giant.ringOpenDeg*Math.sin(ph+LB.phase);
  const gE1=norm([giantDir[2],0,-giantDir[0]]),gUp=[giantDir[1]*gE1[2]-giantDir[2]*gE1[1],giantDir[2]*gE1[0]-giantDir[0]*gE1[2],giantDir[0]*gE1[1]-giantDir[1]*gE1[0]],ta=S.giant.axisTiltDeg*D;
  /* the giant's spin axis. 'equator' (the default since the owner's look pass, 2026-10-26): Krator orbits in the giant's equator and
     the giant hangs on Krator's celestial equator, so the ring plane is Krator's equatorial plane: the axis is Krator's pole, taken
     square to the line of sight. The sun, within its declination of that plane all year, lights the giant along its rings (the
     sky-up tilt put the sun over a pole whenever it stood high, a Uranus look). 'sky': the old canon, axisTiltDeg from the sky's up */
  let giantAxis;if(S.giant.axis==='sky')giantAxis=norm([0,1,2].map(k=>gUp[k]*Math.cos(ta)+gE1[k]*Math.sin(ta)));
  else{const pg=dot(pole,giantDir);giantAxis=norm(pole.map((v,k)=>v-giantDir[k]*pg));}
  // the moons: Krator and each moon in the giant's equatorial plane (km, inertial), then laid on the sky's ring line:
  // the angle b from the giant as Krator sees it becomes cos b along the giant's direction plus sin b along the ring line,
  // and the sun's direction is carried into the same frame (L) so each moon's lit side matches its phase
  const K=kratorAt(lst,Hg),sunE=eq(ra,dec),kr=Math.hypot(K[0],K[1]),xh=[-K[0]/kr,-K[1]/kr],yh=[-xh[1],xh[0]];
  const rn=A.skyRingNormal({giantAxis,giantDir,ringOpen}),rt=norm([rn[1]*giantDir[2]-rn[2]*giantDir[1],rn[2]*giantDir[0]-rn[0]*giantDir[2],rn[0]*giantDir[1]-rn[1]*giantDir[0]]);
  const sx=sunE[0]*xh[0]+sunE[1]*xh[1],sy=sunE[0]*yh[0]+sunE[1]*yh[1],L=norm([0,1,2].map(k=>sx*giantDir[k]+sy*rt[k]+sunE[2]*rn[k]));
  const moons=S.moons.map(m=>{let mx,my;
   let th;if(m.periodD){th=m.theta0+2*Math.PI*t/m.periodD;mx=m.orbitKm*Math.cos(th);my=m.orbitKm*Math.sin(th);}
   else{th=Math.atan2(K[1],K[0])+m.trojanDeg*D;mx=kr*Math.cos(th);my=kr*Math.sin(th);}
   const vx=-Math.sin(th),vy=Math.cos(th),lx=vx*xh[0]+vy*xh[1],ly=vx*yh[0]+vy*yh[1];
   mx-=K[0];my-=K[1];const dist=Math.hypot(mx,my),b=Math.atan2(mx*yh[0]+my*yh[1],mx*xh[0]+my*xh[1]);
   const e=[mx/dist,my/dist,0],cosPsi=-(sunE[0]*e[0]+sunE[1]*e[1]+sunE[2]*e[2]);
   const md=norm([0,1,2].map(k=>Math.cos(b)*giantDir[k]+Math.sin(b)*rt[k])),gw=norm([0,1,2].map(k=>giantDir[k]*kr-md[k]*dist));   // gw: from the moon to the giant
   // its light: toward the real sun on the sky (so its lit limb faces the same sun as the giant's), at the angle that keeps
   // its phase (cosPsi, from the orbits: the Week's 7 days, the Double Dark)
   const sp=sunDir.map((v,k)=>v-md[k]*dot(sunDir,md)),spl=Math.hypot(sp[0],sp[1],sp[2]),sn=Math.sqrt(Math.max(0,1-cosPsi*cosPsi));
   const Lm=spl>1e-6?norm([0,1,2].map(k=>-md[k]*cosPsi+sp[k]/spl*sn)):L;
   return{name:m.name,kind:m.kind,toGiant:gw,dir:norm([0,1,2].map(k=>Math.cos(b)*giantDir[k]+Math.sin(b)*rt[k])),along:b/D,light:Lm,lead:norm([0,1,2].map(k=>lx*giantDir[k]+ly*rt[k])),
    radiusDeg:Math.atan(m.radiusKm/dist)/D,lump:m.lump==null?0:m.lump,distKm:dist,front:dist<kr*0.98?1:0,lit:(1+cosPsi)/2,albedo:m.albedo};});   // front: nearer than the giant (Day in transit)
  // the eclipse: the sun's disc behind the giant's (soft over the sun's own width)
  const sep=Math.acos(Math.max(-1,Math.min(1,dot(sunDir,giantDir))))/D,rg=S.giant.diaDeg/2,rs=S.sunDiaDeg/2;
  const eclipse=sep>=rg+rs?0:sep<=rg-rs?1:(rg+rs-sep)/(2*rs);
  const sunAlt=Math.asin(Math.max(-1,Math.min(1,sunDir[1])))/D,giantAlt=Math.asin(giantDir[1])/D;
  const station=A.skyStation(t,lst,phi,toWorld,sunE,eclipse);
  return{site,hour,dayCount:dayCount||0,t,yearDay:((yd%S.yearD)+S.yearD)%S.yearD,lst,sunDir,giantDir,giantAxis,ringOpen,ringLine:rt,pole,eq:W,toWorld,
   moons,station,eclipse,sunAlt,giantAlt,giantLit:(1-dot(sunDir,giantDir))/2,spin:2*Math.PI*((t*24/S.giant.spinH)%1),
   clusterDir:norm(toWorld(eq(S.cluster.ra*D,S.cluster.dec*D)))};};

 // ---- the station: its place in Krator's inertial equatorial frame (km from Krator's centre), then as the site sees it.
 // dir and dist from the site; axis the torus's axis and vel its motion (world unit vectors); radiusDeg its ring's angular
 // radius; lit 0 in Krator's shadow (or the giant's: the eclipse), 1 in sunlight; up when it is over the horizon
 A.skyStation=function(t,lst,phi,toWorld,sunE,eclipse){const O=S.station,R=S.frame.kmPerDeg*180/Math.PI;
  const GM=7.4e-3*R*R,per=2*Math.PI*Math.sqrt(O.orbitKm*O.orbitKm*O.orbitKm/GM)/86400;   // g = 7.4 m/s^2 at the surface: km^3/s^2, period in days
  const u=O.u0*D+2*Math.PI*t/per,om=(O.node0+O.nodeDegPerDay*t)*D,i=O.incDeg*D,co=Math.cos(om),so=Math.sin(om),ci=Math.cos(i),si=Math.sin(i);
  const ax=[co,so,0],ay=[-so*ci,co*ci,si],nrm=[so*si,-co*si,ci];   // the node line, 90 degrees on along the orbit, the orbit's pole
  const rad=[0,1,2].map(k=>ax[k]*Math.cos(u)+ay[k]*Math.sin(u)),vel=[0,1,2].map(k=>-ax[k]*Math.sin(u)+ay[k]*Math.cos(u));
  const p=rad.map(v=>v*O.orbitKm),zen=eq(lst,phi),rel=p.map((v,k)=>v-zen[k]*R),dist=Math.hypot(rel[0],rel[1],rel[2]);
  const lb=(O.lib.deg+O.lib.swingDeg*Math.sin(2*Math.PI*t/O.lib.periodD))*D,axis=nrm.map((v,k)=>v*Math.cos(lb)+vel[k]*Math.sin(lb));
  // Krator's shadow: a cylinder behind it, soft over the penumbra's few km
  const ps=dot(p,sunE),perp=Math.sqrt(Math.max(0,O.orbitKm*O.orbitKm-ps*ps)),lit=(ps>0?1:Math.min(1,Math.max(0,(perp-R)/60)))*(1-eclipse);
  const dir=norm(toWorld(rel));
  return{dir,dist,axis:norm(toWorld(axis)),vel:norm(toWorld(vel)),radiusDeg:Math.atan(O.radiusKm/dist)/D,lit,up:dir[1]>0?1:0,periodH:per*24};};

 // ---- the giant and its ring as the shader draws them (its CPU twin, for checks). The giant is a sphere at unit
 // distance. Its spin axis lies in the plane of the sky: Krator's pole projected there (axis 'equator'), or tilted axisTiltDeg
 // from the sky's up (axis 'sky', the domes' old canon); the ring lies in its equator, opened
 // ringOpenDeg toward us (exactly edge-on it would cover no pixel)
 A.skyRingNormal=s=>{const i=(s.ringOpen==null?S.giant.ringOpenDeg:s.ringOpen)*D,p=s.giantAxis,g=s.giantDir;return norm([0,1,2].map(k=>p[k]*Math.cos(i)-g[k]*Math.sin(i)));};   // opened so Krator looks down onto the face the sun lights by day
 A.skyBodyHit=(s,d)=>{const c=s.giantDir,r=Math.sin(S.giant.diaDeg/2*D),n=A.skyRingNormal(s),b=dot(d,c),h=b*b-(1-r*r);
  const giant=h>0&&b>0,giantT=giant?b-Math.sqrt(h):Infinity,dn=dot(d,n),tR=Math.abs(dn)>1e-9?dot(c,n)/dn:-1;
  let ring=false,rr=0;if(tR>0){const p=d.map((v,k)=>v*tR-c[k]);rr=Math.hypot(p[0],p[1],p[2])/r;ring=rr>=S.giant.ringIn&&rr<=S.giant.ringOut;}
  return{giant,giantT,ring,ringT:tR,ringR:rr,ringShown:ring&&!(giant&&tR>giantT)};};

 // ---- the noise volume every sky noise reads (SKY-PLAN.md, section 10): tileable gradient noise, 4 samples to a lattice
 // cell, period 16 cells, four seeds in R, G, B, A. A texture read instead of eight hashes per call is what keeps the
 // sky shader compiling in a second or two under ANGLE/Direct3D (it took 16 s with the noise inlined). Made from the
 // same lowbias32 hash, so every engine bakes the same bytes. ATMOS.skyNoiseVolume(n) -> Uint8Array n*n*n*4
 A.skyNoiseVolume=function(n){n=n==null?64:n;const P=16,k=n/P,out=new Uint8Array(n*n*n*4),G=[];
  for(let c=0;c<4;c++){const g=new Float32Array(P*P*P*3);for(let z=0;z<P;z++)for(let y=0;y<P;y++)for(let x=0;x<P;x++){const h=hash(x+P*y,z,500+c),j=3*(x+P*(y+P*z));
   g[j]=(h&1023)/511.5-1;g[j+1]=((h>>>10)&1023)/511.5-1;g[j+2]=((h>>>20)&1023)/511.5-1;}G.push(g);}
  const f5=t=>t*t*t*(t*(t*6-15)+10);
  for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const px=x/k,py=y/k,pz=z/k,ix=Math.floor(px),iy=Math.floor(py),iz=Math.floor(pz),fx=px-ix,fy=py-iy,fz=pz-iz,u=f5(fx),v=f5(fy),w=f5(fz);
   for(let c=0;c<4;c++){const g=G[c];let r=0;
    for(let a=0;a<8;a++){const ox=a&1,oy=(a>>1)&1,oz=a>>2,j=3*(((ix+ox)&15)+P*(((iy+oy)&15)+P*((iz+oz)&15)));
     const d=g[j]*(fx-ox)+g[j+1]*(fy-oy)+g[j+2]*(fz-oz);r+=d*(ox?u:1-u)*(oy?v:1-v)*(oz?w:1-w);}
    out[4*(x+n*(y+n*z))+c]=Math.max(0,Math.min(255,Math.round((r*0.5+0.5)*255)));}}
  return out;};

 // ---- the date, for display
 A.skyDate=function(dayCount,hour){const t=(dayCount||0)+(hour||0)/24,yd=Math.floor(((S.startDay+t)%S.yearD+S.yearD)%S.yearD);
  let m=0,d=yd;while(d>=S.monthDays[m]){d-=S.monthDays[m];m++;}
  // Jimjam's count: the day of the Count of 91, from the Double Dark (Van Sanda, the Count's first day)
  const dd=Math.floor(t-Math.floor(S.doubleDark)),c=((dd%91)+91)%91;
  return{yearDay:yd,month:S.months[m],day:d+1,count:c+1,week:S.weekdays[c%7],thirteen:c%13+1,
   name:S.numbers[c%13]+' '+S.weekdays[c%7],text:(d+1)+' '+S.months[m]};};

 // ---- a far ridge's profile: elevation (degrees) at n azimuths round the compass (sample i is azimuth 360 i/n).
 // layer: {base, amp, cycles, octaves, peaks, peakAmp, win:[az, width, power] or null, floor, seed}. Periodic 1D gradient
 // noise on the hash, so the profile closes on itself at 360 and is the same in every engine.
 const grad1=(i,c,s)=>{const k=((i%c)+c)%c;return u01(k,7,s)*2-1;};
 const noise1=(x,c,s)=>{const i=Math.floor(x),f=x-i,g0=grad1(i,c,s),g1=grad1(i+1,c,s),u=f*f*f*(f*(f*6-15)+10);return(g0*f+u*(g1*(f-1)-g0*f))*2;};
 // ---- the landmarks (SKY-PLAN.md 4, layer 8): what a far ridge cannot draw, in the page's own sky. preset.landmarks, at most
 // SKY_MAX_LANDMARKS, drawn in order over the air and the bodies, under the clouds and the ridges. Angles in degrees,
 // azimuth from north clockwise, elevation above the true horizon; colours display [r,g,b]:
 //   {kind:'plume', from:[az,el], via:[az,el], to:[az,el], width:[w0,w1], lit, belly, alpha, haze, drift}  smoke or steam along a
 //        curve (a quadratic through via's pull), widening from w0 to w1, puffs drifting at `drift`, lit on its sun side
 //   {kind:'ceiling', el, soft, gap:[az, halfWidth, elMax], lit, belly, alpha, lump}  an overcast underside over the whole sky
 //        above el (a plume's spread: the ash desert), open in a gap low toward gap's azimuth
 //   {kind:'sea', top, win:[az, halfWidth, power], bump, lit, shade, alpha}  a cloud sea from top down to the foot, billowing,
 //        in an azimuth window (halfWidth 180 or more: all round)
 //   {kind:'band', win:[az, halfWidth, power], el:[lo, hi], lit, alpha, noise}  a strip on the horizon: water's glint, a far lake,
 //        a cataract (a narrow window and a tall strip), a cloud belt on a slope (noise: billows)
 // A.skyLandmarks(list) packs them for the shader: {n, kind[SKY_MAX_LANDMARKS], v[SKY_MAX_LANDMARKS*5*4]} (five vec4 a landmark)
 A.SKY_MAX_LANDMARKS=6;
 A.skyLandmarks=function(list){const N=A.SKY_MAX_LANDMARKS,L=(list||[]).slice(0,N),kind=new Float32Array(N),v=new Float32Array(N*20);
  const dir=(az,el)=>A.skyVec.fromAltAz(el,az),R=x=>x*D,K={plume:0,ceiling:1,sea:2,band:3};
  const put=(i,k,a)=>{for(let j=0;j<4;j++)v[i*20+k*4+j]=a[j]==null?0:a[j];};
  L.forEach((m,i)=>{const k=K[m.kind];kind[i]=k==null?-1:k;const lit=m.lit||[1,1,1],dk=m.belly||m.shade||lit;
   if(k===0){const w=m.width||[1,4],a=dir(m.from[0],m.from[1]),b=dir((m.via||m.from)[0],(m.via||m.from)[1]),c=dir(m.to[0],m.to[1]);
    put(i,0,[a[0],a[1],a[2],R(w[0])]);put(i,1,[b[0],b[1],b[2],R(w[1])]);put(i,2,[c[0],c[1],c[2],m.alpha==null?.5:m.alpha]);
    put(i,3,[lit[0],lit[1],lit[2],m.haze==null?.3:m.haze]);put(i,4,[dk[0],dk[1],dk[2],m.drift==null?.02:m.drift]);}
   else if(k===1){const g=m.gap||[0,0,-90],h=dir(g[0],0);put(i,0,[h[0],0,h[2],R(g[1])]);
    put(i,1,[Math.sin(R(m.el==null?6:m.el)),R(m.soft==null?8:m.soft),Math.sin(R(g[2])),m.alpha==null?.9:m.alpha]);
    put(i,2,[m.lump==null?.35:m.lump,0,0,0]);put(i,3,[lit[0],lit[1],lit[2],m.haze==null?.2:m.haze]);put(i,4,[dk[0],dk[1],dk[2],0]);}
   else if(k===2||k===3){const w=m.win||[0,360,1],h=dir(w[0],0);put(i,0,[h[0],0,h[2],R(Math.min(w[1],720))]);
    if(k===2)put(i,1,[Math.sin(R(m.top==null?-1:m.top)),R(m.bump==null?.4:m.bump),w[2]==null?1:w[2],m.alpha==null?.95:m.alpha]);
    else{const e=m.el||[-1,0];put(i,1,[R(e[0]),R(e[1]),w[2]==null?1:w[2],m.alpha==null?.6:m.alpha]);}
    put(i,2,[m.noise==null?(k===2?1:0):m.noise,0,0,0]);put(i,3,[lit[0],lit[1],lit[2],m.haze==null?.25:m.haze]);put(i,4,[dk[0],dk[1],dk[2],0]);}});
  return{n:L.length,kind,v};};

 // win: [azimuth, half-width, power], or an array of them (a ridge in two lobes: the larger wins); notch: [azimuth, inner, outer
 // half-widths, depth] lowers it by depth (0..1) inside inner, easing out by outer (a gap in the ranges: Xanadu's cataract)
 A.ridgeProfile=function(L,n){n=n==null?1024:n;const out=new Float32Array(n),c0=L.cycles==null?12:L.cycles,oct=L.octaves==null?5:L.octaves,sd=L.seed==null?1:L.seed;
  for(let i=0;i<n;i++){const az=360*i/n,x=i/n;let v=0,a=1,c=c0,an=0;
   for(let o=0;o<oct;o++){v+=a*noise1(x*c,c,sd+o);an+=a;a*=.5;c*=2;}v/=an;
   let p=0;if(L.peaks){const r=1-Math.abs(noise1(x*L.peaks,L.peaks,sd+40));p=Math.pow(r,4)*(L.peakAmp==null?1:L.peakAmp);}
   let w=1;if(L.win){const W=Array.isArray(L.win[0])?L.win:[L.win];w=0;for(const q of W){const dz=Math.abs(((az-q[0])%360+540)%360-180);w=Math.max(w,Math.pow(Math.max(0,Math.cos(Math.min(90,dz*90/q[1])*D)),q[2]==null?1:q[2]));}}
   let e=(L.base==null?1:L.base)+(L.amp==null?1:L.amp)*(.5+.5*v)+p;
   if(L.notch){const q=L.notch,dz=Math.abs(((az-q[0])%360+540)%360-180),t=Math.max(0,Math.min(1,(q[2]-dz)/(q[2]-q[1])));e*=1-q[3]*t*t*(3-2*t);}
   out[i]=L.win?(L.floor==null?-1:L.floor)+(e-(L.floor==null?-1:L.floor))*w:e;}
  return out;};
})();
