// TARGET: house - camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the house's budget. No apostrophe or colon in a
// view's name (tools/check_views.py, VIEW-NAME). The lamp at 0,0 on the knoll's crown (BC.F); north is -z: the fort's gate,
// the lamp ward and the precinct on the saddle lie north of it, the Rift falls away south.
const bcEye=(x,z,tx,ty,tz,dy)=>[x,terrainH(x,z)+1.7+bcD(dy,0),z,tx,ty,tz];
const VIEWS=(function(){const V={},F=BC.F,lv=BC.level;
 V['Overview']=[190,F+150,-300,0,F-8,-110];
 V['The lamp and the fort gate']=[10,F+9,-70,0,F+15,-6];   /* over the Lamp Stair's foot: the line to the lamp clears the gatehouse (14 m at 41 m along) */
 V['The Lamp Stair from the Gate of the Lamp']=bcEye(3,-73,0,F+8,-20);
 V['The Yellow Monastery gate']=bcEye(-14,-70.5,0,lv(-80)+7,-82);
 V['The kora garden and the Labrang']=bcEye(14,-140,0,lv(-180)+10,-182);
 V['The precinct from the road']=bcEye(30,-330,0,F-4,-190);
 V['Over the Rift from above the fort']=[-60,F+180,-40,300,F-1700,14000];   /* above the lamp, south down the spur to the Rift floor 2,500 m below (at 2 km a pixel the spur falls gently for its first 4 km: from the walk it reads flat) */
 V['The house from the spur']=[-70,F+40,260,0,F+6,-80];
 V['The terraces and the carters yard']=[160,F+55,-560,-20,F-14,-270];   /* from the rising ground north: the North Terraces, the byres, the yard, the road */
 return V;})();
// the house as one budget (as Strongwall's): every type in the class 'city'
BUDGET.showcase={tris:6000000,calls:1500};BUDGET.cls.city=6000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
