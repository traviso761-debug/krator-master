// TARGET: city — camera presets. [camX,camY,camZ, targetX,targetY,targetZ, hour?]; the first entry is the opening shot.
const _ysEye=(x,z,tx,tz,h)=>[x,Math.max(terrainH(x,z),0)+1.7,z,tx,Math.max(terrainH(tx,tz),0)+(h||3),tz];
const VIEWS={
 'Opening — the bay from the head of the shore':[CITY.HEAD[0]-240,48,CITY.HEAD[1]-170,CITY.HEAD[0]+520,0,CITY.HEAD[1]+440],
 'Overview':[-900,1500,1500,400,0,-100],
 'The bay from the sea':[1300,220,700,350,10,-150],
 'The shore at eye level':_ysEye(120,-380,600,-100,3),
 'Night on the water':[1000,60,500,200,8,-200,22.2],
 'The layout from above':[820,1500,101,820,0,100],
 'The drowned grid from the south-east':[1500,260,900,850,0,100],
 'The head of the bay — compass':[CITY.HEAD[0]+260,140,CITY.HEAD[1]+260,CITY.HEAD[0],4,CITY.HEAD[1],null,true],
};
