// TARGET: quintagon — Quintagon, the pentagonal star arcology: a monumental
// battered regular pentagonal base enclosing five sloping triangular garden
// courts between the five arms of a 5-pointed star superstructure whose tips
// point to the five corners of the pentagon, surmounted by a stepped star
// podium, a splayed 5-legged flying-buttress collar, and a 566 m 5-fluted
// central spire with a flared 5-winged crown. Intact (west) and ruined (east).
const TITLE='Quintagon — the pentagonal star arcology';
const GROUND_C=0;
const DECAYS=[0,1];
// The star spurs reach 568 m and the harbour pier 765 m; s = 2 400 puts 4 800 m
// between intact (-2400) and ruined (+2400).
const ROWS={
 quintagon:{z:0,s:2400,r:980},
};
const RUINS=[[-ROWS.quintagon.s,0,ROWS.quintagon.r*.75],
             [ROWS.quintagon.s,0,ROWS.quintagon.r*1.08]];
const EXTRA_BUILDERS={quintagon:buildQuintagon};
