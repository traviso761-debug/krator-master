// A row shot stands on the row's centre line, `dist` down +z. Since decay 3 was
// folded in, that centre line is where every rehabilitated building stands, so a
// camera deeper than the row spacing stood inside the NEXT row's building: the
// Skyscraper A shot was a wall of rusted drums 100 m off the lens. The distance
// is capped to stop 90 m short of the next row, which leaves it behind the camera.
const ROWV=(k,dist,h,ty,dx)=>{const R=ROWS[k];
 const nz=Math.min(...Object.values(ROWS).map(o=>o.z).filter(z=>z>R.z),Infinity);
 const d=Math.min(dist,nz-R.z-90);
 return[dx||0,h,R.z+d,dx||0,ty,R.z];};
const VIEWS={
 'Overview':[0,1400,ROWS.lab.z+2600,0,150,5000],
 'Skyscraper A':ROWV('skyA',900,300,210),'Skyscraper B':ROWV('skyB',800,260,160),'Skyscraper C':ROWV('skyC',900,300,200),
 // THE PROJECT. A seventh element on a preset means "night" — see setNight in
 // src/92-camera.js. Day first, because you have to see the patched fabric
 // before the fires mean anything.
 'The Project':[ROWS.skyA.j,300,ROWS.skyA.z+780,ROWS.skyA.j,210,ROWS.skyA.z],
 'The Project at night':[ROWS.skyA.j,300,ROWS.skyA.z+780,ROWS.skyA.j,210,ROWS.skyA.z,1],
 'The Project close':[ROWS.skyA.j+150,120,ROWS.skyA.z+260,ROWS.skyA.j,150,ROWS.skyA.z,1],
 'The Project foot':[ROWS.skyA.j+130,14,ROWS.skyA.z+150,ROWS.skyA.j,70,ROWS.skyA.z,1],
 // PROJECTS D AND H, the Monolith and the Warden reoccupied whole, lit by fire.
 // Same stations as The Project, off each row's own j.
 'Project D':[ROWS.skyD.j,300,ROWS.skyD.z+780,ROWS.skyD.j,180,ROWS.skyD.z],
 'Project D at night':[ROWS.skyD.j,300,ROWS.skyD.z+780,ROWS.skyD.j,180,ROWS.skyD.z,1],
 'Project D close':[ROWS.skyD.j+150,120,ROWS.skyD.z+260,ROWS.skyD.j,150,ROWS.skyD.z,1],
 'Project H':[ROWS.skyH.j,300,ROWS.skyH.z+780,ROWS.skyH.j,170,ROWS.skyH.z],
 'Project H at night':[ROWS.skyH.j,300,ROWS.skyH.z+780,ROWS.skyH.j,170,ROWS.skyH.z,1],
 'Project H close':[ROWS.skyH.j+150,120,ROWS.skyH.z+260,ROWS.skyH.j,150,ROWS.skyH.z,1],
 // REHABILITATED (decay 3), folded in from the retired `repaired` target. It
 // stands at x=0, the middle of each row, so the row shots above already frame
 // it; these are the close stations that used to be that target's own.
 'Rehabilitated A':[0-150,140,ROWS.skyA.z+420,0,160,ROWS.skyA.z],
 'Rehabilitated D':[0-150,140,ROWS.skyD.z+420,0,160,ROWS.skyD.z],
 'Rehabilitated factory':[0+330,8,ROWS.fac.z+120,0+110,60,ROWS.fac.z-60],
 'Rehabilitated government':[0-140,5,ROWS.gov.z+240,0,40,ROWS.gov.z],
 'Rehabilitated apartments':[0+170,150,ROWS.apt.z+480,0+170,25,ROWS.apt.z],
 'Rehabilitated lab':[0+110,30,ROWS.lab.z+170,0,45,ROWS.lab.z],
 'Rehabilitated data center':[0+260,150,ROWS.dc.z+420,0,30,ROWS.dc.z],
 'Rehabilitated hotel':[0+120,60,ROWS.hotel.z+260,0,30,ROWS.hotel.z],
 'Toppled A':[ROWS.skyA.t-200,120,ROWS.skyA.z+420,ROWS.skyA.t+120,40,ROWS.skyA.z],'Toppled B':[ROWS.skyB.t-200,110,ROWS.skyB.z+380,ROWS.skyB.t+100,30,ROWS.skyB.z],'Toppled C':[ROWS.skyC.t-200,120,ROWS.skyC.z+420,ROWS.skyC.t+120,40,ROWS.skyC.z],
 'Megastructure':ROWV('mega',1300,330,140),'Megastructure foot':[ROWS.mega.s-320,4,ROWS.mega.z+330,ROWS.mega.s+40,120,ROWS.mega.z],
 'Factory':ROWV('fac',760,280,40),'Factory silo':[ROWS.fac.s+330,8,ROWS.fac.z+120,ROWS.fac.s+110,60,ROWS.fac.z-60],
 'Starport':ROWV('port',1250,560,20),'Government':ROWV('gov',480,170,40),'Government portico':[-ROWS.gov.s-140,5,ROWS.gov.z+240,-ROWS.gov.s,40,ROWS.gov.z],'Government ruin':[ROWS.gov.s-140,5,ROWS.gov.z+240,ROWS.gov.s,40,ROWS.gov.z],
 'Library':ROWV('lib',330,100,25),'Bunker':ROWV('bunk',330,110,15),'Bunker battery':[ROWS.bunk.s+60,30,ROWS.bunk.z+120,ROWS.bunk.s,40,ROWS.bunk.z],
 'Offices':ROWV('off',430,110,25),'Apartments intact':[-ROWS.apt.s+170,150,ROWS.apt.z+480,-ROWS.apt.s+170,25,ROWS.apt.z],'Apartments ruined':[ROWS.apt.s+170,150,ROWS.apt.z+480,ROWS.apt.s+170,25,ROWS.apt.z],'Apartments close':[-ROWS.apt.s+60,8,ROWS.apt.z+200,-ROWS.apt.s+150,30,ROWS.apt.z],
 'Amphitheater':[0,220,ROWS.amph.z-330,0,10,ROWS.amph.z],'Amphitheater stage':[-ROWS.amph.s+40,30,ROWS.amph.z-140,-ROWS.amph.s,12,ROWS.amph.z],
 'Fuel station':[-ROWS.fuel.s+90,26,ROWS.fuel.z+110,-ROWS.fuel.s,8,ROWS.fuel.z],'Fuel station ruin':[ROWS.fuel.s+90,26,ROWS.fuel.z+110,ROWS.fuel.s,8,ROWS.fuel.z],
 'Radar tower':[-ROWS.radar.s+100,40,ROWS.radar.z+150,-ROWS.radar.s,40,ROWS.radar.z],'Radar tower ruin':[ROWS.radar.s+100,40,ROWS.radar.z+150,ROWS.radar.s,30,ROWS.radar.z],
 'Satellite dish':[-ROWS.dish.s+120,50,ROWS.dish.z+150,-ROWS.dish.s,35,ROWS.dish.z],'Satellite dish ruin':[ROWS.dish.s+120,50,ROWS.dish.z+150,ROWS.dish.s,30,ROWS.dish.z],
 'Houses intact':[-ROWS.house.s+70,22,ROWS.house.z+120,-ROWS.house.s+70,6,ROWS.house.z],'Houses ruined':[ROWS.house.s+70,22,ROWS.house.z+120,ROWS.house.s+70,6,ROWS.house.z],'Lab':ROWV('lab',820,190,55),
 // The Laboratory sites sit at x=+/-420, wider apart than most rows, so the
 // 520 m row shot used to push both of them off the edges of the frame and
 // show the empty middle. Three views: the pair, then each one close.
 'Lab intact':[-ROWS.lab.s+110,30,ROWS.lab.z+170,-ROWS.lab.s,45,ROWS.lab.z],
 'Lab ruined':[ROWS.lab.s+110,30,ROWS.lab.z+170,ROWS.lab.s,45,ROWS.lab.z],
 'Houses DEF intact':[-ROWS.house2.s+65,22,ROWS.house2.z+120,-ROWS.house2.s+65,6,ROWS.house2.z],'Houses DEF ruined':[ROWS.house2.s+65,22,ROWS.house2.z+120,ROWS.house2.s+65,6,ROWS.house2.z],
 'Skyscraper D':ROWV('skyD',900,300,180),'Skyscraper E':ROWV('skyE',900,300,190),'Skyscraper F':ROWV('skyF',900,300,160),
 'Toppled D':[ROWS.skyD.t-200,120,ROWS.skyD.z+420,ROWS.skyD.t+120,40,ROWS.skyD.z],'Toppled E':[ROWS.skyE.t-200,120,ROWS.skyE.z+420,ROWS.skyE.t+120,40,ROWS.skyE.z],'Toppled F':[ROWS.skyF.t-200,120,ROWS.skyF.z+420,ROWS.skyF.t+120,40,ROWS.skyF.z],
 'The Gate':[0,300,ROWS.arc.z+1500,0,150,ROWS.arc.z],'The Gate ruin':[ROWS.arc.s-500,20,ROWS.arc.z+560,ROWS.arc.s,160,ROWS.arc.z],
 'Robotics factory':ROWV('robo',600,220,30),'Robotics yard':[-ROWS.robo.s-60,6,ROWS.robo.z+230,-ROWS.robo.s+60,25,ROWS.robo.z-30],
 'Campus':[0,420,ROWS.campus.z+900,0,40,ROWS.campus.z],'Campus intact':[-ROWS.campus.s+40,90,ROWS.campus.z+560,-ROWS.campus.s-40,40,ROWS.campus.z+60],'Campus ruined':[ROWS.campus.s+40,90,ROWS.campus.z+560,ROWS.campus.s-40,40,ROWS.campus.z+60],'Campus lawn':[-ROWS.campus.s-60,14,ROWS.campus.z+400,-ROWS.campus.s-60,30,ROWS.campus.z+200],'Campus courtyard':[-ROWS.campus.s-70,60,ROWS.campus.z+250,-ROWS.campus.s-70,15,ROWS.campus.z+170],
 'Skyscraper G':ROWV('skyG',800,200,110),'Skyscraper H':ROWV('skyH',900,300,170),'Toppled G':[ROWS.skyG.t-250,120,ROWS.skyG.z+450,ROWS.skyG.t+60,40,ROWS.skyG.z],'Toppled H':[ROWS.skyH.t-200,120,ROWS.skyH.z+420,ROWS.skyH.t+120,40,ROWS.skyH.z],
 'Data center':[-ROWS.dc.s+260,150,ROWS.dc.z+420,-ROWS.dc.s,30,ROWS.dc.z],'Data center ruin':[ROWS.dc.s+260,150,ROWS.dc.z+420,ROWS.dc.s,30,ROWS.dc.z],'Data center close':[-ROWS.dc.s+60,12,ROWS.dc.z+220,-ROWS.dc.s,40,ROWS.dc.z],
 'Police station':[-ROWS.police.s+120,60,ROWS.police.z+170,-ROWS.police.s,15,ROWS.police.z],'Police ruin':[ROWS.police.s+120,60,ROWS.police.z+170,ROWS.police.s,15,ROWS.police.z],
 'Hospital':[-ROWS.hosp.s+160,80,ROWS.hosp.z+260,-ROWS.hosp.s,35,ROWS.hosp.z],'Hospital ruin':[ROWS.hosp.s+160,80,ROWS.hosp.z+260,ROWS.hosp.s,35,ROWS.hosp.z],
 'Hotel':[-ROWS.hotel.s+120,60,ROWS.hotel.z+260,-ROWS.hotel.s,30,ROWS.hotel.z],'Hotel ruin':[ROWS.hotel.s+120,60,ROWS.hotel.z+260,ROWS.hotel.s,30,ROWS.hotel.z],
 // Both presets looked at the CONVEX face, which is a plain curtain wall at a
 // constant radius. Everything this type is about — the stepped terraces, and
 // the planters that used to hang off them in mid-air — is on the concave side,
 // and nothing had ever been pointed at it.
 'Hotel court':[-ROWS.hotel.s,95,ROWS.hotel.z-190,-ROWS.hotel.s,34,ROWS.hotel.z+10],
 'Hotel terraces':[-ROWS.hotel.s+30,52,ROWS.hotel.z-60,-ROWS.hotel.s+10,30,ROWS.hotel.z+18],
 'Hotel ruin court':[ROWS.hotel.s,95,ROWS.hotel.z-190,ROWS.hotel.s,34,ROWS.hotel.z+10],
 'Cultural centre':[-ROWS.cult.s,240,ROWS.cult.z+620,-ROWS.cult.s,40,ROWS.cult.z],
 'Cultural centre ruin':[ROWS.cult.s,240,ROWS.cult.z+620,ROWS.cult.s,40,ROWS.cult.z],
 'The Flatiron':[-ROWS.flat.s,180,ROWS.flat.z+620,-ROWS.flat.s,140,ROWS.flat.z],
 'Flatiron prow':[-ROWS.flat.s+130,30,ROWS.flat.z+200,-ROWS.flat.s,60,ROWS.flat.z],
 'Flatiron ruin':[ROWS.flat.s,180,ROWS.flat.z+620,ROWS.flat.s,140,ROWS.flat.z],
 'Toppled Flatiron':[ROWS.flat.t-260,110,ROWS.flat.z+380,ROWS.flat.t+20,40,ROWS.flat.z+90],
 'The Perch':[-ROWS.perch.s,300,ROWS.perch.z+900,-ROWS.perch.s,200,ROWS.perch.z],
 'Perch podium':[-ROWS.perch.s+250,120,ROWS.perch.z+320,-ROWS.perch.s,95,ROWS.perch.z],
 'Wheel core':[-ROWS.cult.s+130,90,ROWS.cult.z+230,-ROWS.cult.s,50,ROWS.cult.z],
 'Skyscraper I':ROWV('skyI',900,300,210),'Skyscraper J':ROWV('skyJ',900,300,200),'Skyscraper K':ROWV('skyK',900,300,200),
 'Toppled I':[ROWS.skyI.t-200,120,ROWS.skyI.z+420,ROWS.skyI.t+120,40,ROWS.skyI.z],'Toppled J':[ROWS.skyJ.t-200,120,ROWS.skyJ.z+420,ROWS.skyJ.t+120,40,ROWS.skyJ.z],'Toppled K':[ROWS.skyK.t-200,120,ROWS.skyK.z+420,ROWS.skyK.t+120,40,ROWS.skyK.z],
 // Theodiga's views moved to targets/theodiga/91z-views.js with the site.
 'Office C':[-ROWS.off.s+330,20,ROWS.off.z+120,-ROWS.off.s+330,10,ROWS.off.z-20],
};
