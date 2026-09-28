// TARGET: set — the Dalab building kit laid out in rows by family, front (+z) toward the camera.
const TITLE='Dalab Building Kit';
const GROUND_C=700;          // z centre of the ground plane
const ROWDEF=[
 ['dalab_hut_a','dalab_hut_b','dalab_hut_c'],
 ['dalab_compound','dalab_granaries','dalab_shrine'],
 ['dalab_noble_a','dalab_noble_b','dalab_noble_c'],
 ['dalab_tavern','dalab_market_small','dalab_shops'],
 ['dalab_warehouse','dalab_smithy','dalab_workshop'],
 ['dalab_potter','dalab_weaver','dalab_dyer','dalab_windmill'],
 ['dalab_market_large'],
 ['dalab_barracks','dalab_priest_house','dalab_temple','dalab_healers'],
 ['dalab_embassy_iziz','dalab_embassy_voth','dalab_embassy_yuni','dalab_embassy_republic'],
 ['dalab_chapterhouse','dalab_priest_compound'],
 ['dalab_ranch'],
 ['dalab_halls'],
 ['dalab_mound'],
 ['dalab_palace_mound'],
 ['dalab_high_mound'],
];
const ROWZ=[0,40,90,150,210,270,350,430,500,580,700,880,1060,1240,1480];
const SITES=[];
ROWDEF.forEach((row,ri)=>{const ws=row.map(k=>VERN.defs[k].w+10);const total=ws.reduce((a,b)=>a+b,0);let x=-total/2;
 row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:ROWZ[ri],ry:0,o:{v:0}});x+=ws[i];});});
