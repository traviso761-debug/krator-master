// TARGET: veladiga — view presets. First entry is the opening shot.
const VV=(x,dx,dy,dz,tx,ty,tz)=>[x+dx,dy,dz,x+tx,ty,tz];
const VIEWS={
 'Veladiga':VV(-1800,0,330,1750,0,150,200),
 'The face':VV(-1800,0,150,900,0,160,240),
 'One bay':VV(-1800,60,170,560,0,170,290),
 'Bay mouth':VV(-1800,30,150,430,0,155,300),
 'The piers':VV(-1800,420,120,700,300,120,300),
 'From the park':VV(-1800,0,60,1250,0,180,240),
 'City centre':VV(-1800,0,150,1150,0,20,690),
 'The crest':VV(-1800,0,400,760,0,255,120),
 'The pads':VV(-1800,-380,330,120,-300,280,-200),
 'Breached':VV(5400,0,300,1500,0,140,200),
 'The breach':VV(5400,-230,160,700,-260,130,260),
 'Breach section':VV(5400,-330,140,430,-270,130,280),
 'Breached park':VV(5400,0,70,1150,-150,120,250),
 'Both':[1800,900,3200,1800,200,300],
};
