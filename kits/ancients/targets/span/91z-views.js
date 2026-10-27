// TARGET: span — view presets. First entry is the opening shot. [cx,cy,cz, tx,ty,tz]
Object.assign(BUDGET.type,{spGal:'medium',spRange:'medium',spDome:'medium',spPad:'small',spCross:'mega',spWeir:'medium',spSluice:'medium',spPortal:'medium'});
const VIEWS={
 'Every piece':[1500,700,-500,250,20,1100],
 'Gallery - intact':[-240,26,95,-280,9,0],
 'Gallery - ruined':[320,26,95,280,9,0],
 'Gallery - toppled':[600,30,110,560,6,0],
 'Range - intact, over the edge':[-240,30,370,-280,34,300],
 'Range - ruined':[280,22,425,280,30,300],
 'Domes - every state':[170,110,780,170,10,600],
 'Pads - every state':[170,90,960,170,8,800],
 'Cross - intact, from below':[-300+150,40,1300+40,-300,95,1300],
 'Cross - on the road':[-300,116,1300+300,-300,110,1300],
 'Cross - toppled':[600+190,70,1300+60,600,80,1300],
 'Cross - rehabilitated':[0+160,120,1300-200,0,100,1300],
 'Weirs - every state':[300,90,1720+190,300,5,1720],
 'Sluice stair':[-300,100,1960+250,-300,30,1990],
 'Portal - intact':[-220+10,9,2260+60,-220,6,2250],
 'Portals - ruined, toppled, worn':[440,50,2260+170,440,8,2260],
};
