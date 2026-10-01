// TARGET: canyon — view presets. First entry is the opening shot.
const CV=(x,dx,dy,dz,ty)=>[x+dx,dy,dz,x,ty||520,0];
const VIEWS={
 'The Span':CV(-2900,900,600,2000,520),
 'Down the gorge':[-2900,260,-1600,-2900,520,700],
 'The prison':[-2900+430,420,430,-2900,330,40],
 'Prison beneath':[-2900+170,120,300,-2900,300,40],
 'Pod cluster':[-2900+330,560,-120,-2900,560,-430],
 'The lift':[-2900+470,280,780,-2900+180,250,470],
 'Canyon floor':[-2900+60,30,980,-2900,420,0],
 'Rusted span':CV(2900,900,600,2000,520),
 'Rusted close':[2900+380,400,380,2900,330,40],
 'Fallen':CV(8700,900,560,2000,420),
 'Fallen floor':[8700+90,40,760,8700,200,60],
 'Both':[0,1900,3900,0,480,0],
};
