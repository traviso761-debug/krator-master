const ROWV=(k,dist,h,ty,dx)=>{const R=ROWS[k];return[dx||0,h,R.z+dist,dx||0,ty,R.z];};
const VIEWS={
 'Overview':[0,1400,ROWS.lab.z+2600,0,150,5000],
 'Skyscraper A':ROWV('skyA',900,300,210),'Skyscraper B':ROWV('skyB',800,260,160),'Skyscraper C':ROWV('skyC',900,300,200),
 'Toppled A':[0-200,120,ROWS.skyA.z+420,0+120,40,ROWS.skyA.z],'Toppled B':[0-200,110,ROWS.skyB.z+380,0+100,30,ROWS.skyB.z],'Toppled C':[0-200,120,ROWS.skyC.z+420,0+120,40,ROWS.skyC.z],
 'Megastructure':ROWV('mega',1300,330,140),'Megastructure foot':[0-320,4,ROWS.mega.z+330,40-0,120,ROWS.mega.z],
 'Factory':ROWV('fac',760,280,40),'Factory silo':[330-0,8,ROWS.fac.z+120,110-0,60,ROWS.fac.z-60],
 'Starport':ROWV('port',1250,560,20),'Government':ROWV('gov',480,170,40),'Government portico':[0-140,5,ROWS.gov.z+240,0,40,ROWS.gov.z],'Government ruin':[0-140,5,ROWS.gov.z+240,0,40,ROWS.gov.z],
 'Library':ROWV('lib',330,100,25),'Bunker':ROWV('bunk',330,110,15),'Bunker battery':[60-0,30,ROWS.bunk.z+120,0,40,ROWS.bunk.z],
 'Offices':ROWV('off',430,110,25),'Apartments intact':[170-0,150,ROWS.apt.z+480,170-0,25,ROWS.apt.z],'Apartments ruined':[170-0,150,ROWS.apt.z+480,170-0,25,ROWS.apt.z],'Apartments close':[60-0,8,ROWS.apt.z+200,150-0,30,ROWS.apt.z],
 'Amphitheater':[0,220,ROWS.amph.z-330,0,10,ROWS.amph.z],'Amphitheater stage':[40-0,30,ROWS.amph.z-140,0,12,ROWS.amph.z],
 'Fuel station':[90-0,26,ROWS.fuel.z+110,0,8,ROWS.fuel.z],'Fuel station ruin':[90-0,26,ROWS.fuel.z+110,0,8,ROWS.fuel.z],
 'Radar tower':[100-0,40,ROWS.radar.z+150,0,40,ROWS.radar.z],'Radar tower ruin':[100-0,40,ROWS.radar.z+150,0,30,ROWS.radar.z],
 'Satellite dish':[120-0,50,ROWS.dish.z+150,0,35,ROWS.dish.z],'Satellite dish ruin':[120-0,50,ROWS.dish.z+150,0,30,ROWS.dish.z],
 'Houses intact':[70-0,22,ROWS.house.z+120,70-0,6,ROWS.house.z],'Houses ruined':[70-0,22,ROWS.house.z+120,70-0,6,ROWS.house.z],'Lab':ROWV('lab',820,190,55),
 // The Laboratory sites sit at x=+/-420, wider apart than most rows, so the
 // 520 m row shot used to push both of them off the edges of the frame and
 // show the empty middle. Three views: the pair, then each one close.
 'Lab intact':[110-0,30,ROWS.lab.z+170,0,45,ROWS.lab.z],
 'Lab ruined':[110-0,30,ROWS.lab.z+170,0,45,ROWS.lab.z],
 'Houses DEF intact':[65-0,22,ROWS.house2.z+120,65-0,6,ROWS.house2.z],'Houses DEF ruined':[65-0,22,ROWS.house2.z+120,65-0,6,ROWS.house2.z],
 'Skyscraper D':ROWV('skyD',900,300,180),'Skyscraper E':ROWV('skyE',900,300,190),'Skyscraper F':ROWV('skyF',900,300,160),
 'Toppled D':[0-200,120,ROWS.skyD.z+420,0+120,40,ROWS.skyD.z],'Toppled E':[0-200,120,ROWS.skyE.z+420,0+120,40,ROWS.skyE.z],'Toppled F':[0-200,120,ROWS.skyF.z+420,0+120,40,ROWS.skyF.z],
 'The Gate':[0,300,ROWS.arc.z+1500,0,150,ROWS.arc.z],'The Gate ruin':[0-500,20,ROWS.arc.z+560,0,160,ROWS.arc.z],
 'Robotics factory':ROWV('robo',600,220,30),'Robotics yard':[0-60,6,ROWS.robo.z+230,60-0,25,ROWS.robo.z-30],
 'Campus':[0,420,ROWS.campus.z+900,0,40,ROWS.campus.z],'Campus intact':[40-0,90,ROWS.campus.z+560,0-40,40,ROWS.campus.z+60],'Campus ruined':[40-0,90,ROWS.campus.z+560,0-40,40,ROWS.campus.z+60],'Campus lawn':[0-60,14,ROWS.campus.z+400,0-60,30,ROWS.campus.z+200],'Campus courtyard':[0-70,60,ROWS.campus.z+250,0-70,15,ROWS.campus.z+170],
 'Skyscraper G':ROWV('skyG',800,200,110),'Skyscraper H':ROWV('skyH',900,300,170),'Toppled G':[0-250,120,ROWS.skyG.z+450,0+60,40,ROWS.skyG.z],'Toppled H':[0-200,120,ROWS.skyH.z+420,0+120,40,ROWS.skyH.z],
 'Data center':[260-0,150,ROWS.dc.z+420,0,30,ROWS.dc.z],'Data center ruin':[260-0,150,ROWS.dc.z+420,0,30,ROWS.dc.z],'Data center close':[60-0,12,ROWS.dc.z+220,0,40,ROWS.dc.z],
 'Police station':[120-0,60,ROWS.police.z+170,0,15,ROWS.police.z],'Police ruin':[120-0,60,ROWS.police.z+170,0,15,ROWS.police.z],
 'Hospital':[160-0,80,ROWS.hosp.z+260,0,35,ROWS.hosp.z],'Hospital ruin':[160-0,80,ROWS.hosp.z+260,0,35,ROWS.hosp.z],
 'Hotel':[120-0,60,ROWS.hotel.z+260,0,30,ROWS.hotel.z],'Hotel ruin':[120-0,60,ROWS.hotel.z+260,0,30,ROWS.hotel.z],
 // Theodiga's views moved to targets/theodiga/91z-views.js with the site.
 'Office C':[330-0,20,ROWS.off.z+120,330-0,10,ROWS.off.z-20],
};
