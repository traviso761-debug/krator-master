// Every preset is in BUILDER coordinates plus the site offset, so the numbers
// can be read against the builder's own constants:
//   spine foot   ( 60,   0)   bulb at y=57, section 211 x 269
//   apex / tip   (-116, 300)  section 13 x 17
//   podium       r=208, three terraces at y=26 / 20 / 14
//   aperture A1  u=0, v=.27 -> surface point (145, 117, 0)
//   the gill at  u=.5, v=.44 -> surface point (-12, 144, 0)
//   plain skin   u=.30, v=.50 -> surface point (16, 181, 58)
//   fallen horn  (-318, 104) on the ruined site only
// The opening shot looks straight down +z so the x/y bend plane is the frame:
// that is the one view in which the sweep reads for what it is.
const DKX=-ROWS.darco.s, DKR=ROWS.darco.s;
const VIEWS={
 'Darco':                 [DKX+20,175,830,   DKX+20,150,0],
 'The sweep':             [DKX+540,430,570,  DKX-10,175,0],
 'The prow from below':   [DKX-148,34,56,    DKX-60,252,0],
 'The horn':              [DKX-235,335,195,  DKX-95,288,0],
 'The skin':              [DKX-1,173,126,    DKX+16,181,58],
 'An aperture':           [DKX+296,132,62,   DKX+146,117,0],
 'The gills':             [DKX-132,152,58,   DKX-14,145,0],
 'The foot':              [DKX+250,52,164,   DKX+130,46,66],
 'The plaza':             [DKX-252,56,252,   DKX+25,95,0],
 'Plaza from above':      [DKX+10,560,360,   DKX+10,26,0],
 'Darco ruined':          [DKR+20,175,830,   DKR+20,150,0],
 'The break':             [DKR-187,352,90,   DKR-56,282,0],
 'The fallen horn':       [DKR-236,58,214,   DKR-318,16,104],
 'Both':                  [0,600,1750,       0,150,0],
};
