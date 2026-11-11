// ---------- Galaxy class: the measurements ----------
// Fan work. Star Trek belongs to Paramount; no model, image or texture from any film, series or game is used. These
// are numbers, read off published orthographic drawings by measuring their silhouettes pixel by pixel (the drawings
// themselves are not shipped): a plan view and a front view of the Enterprise-D, and the five views of the Galaxy
// class in the Star Trek Fact Files, cross-checked against photographs of the six-foot studio model.
//
// Frame: metres; x forward, y up, z to starboard; the saucer's centre is the origin and its rim's middle is y = 0.
// Read off as d (metres aft of the bow) and D (metres below the top of the bridge): x = 192 - d, y = 36 - D.
//
//   length 642.5 m (bow to the nacelles' after ends) and beam 463.7 m are the published figures, and set the scale.
//   The plan view came out 3% wider than that against its length, so its widths are scaled by 0.97.
//   Height: the published 195 m does not fit the drawings, which agree with each other (and with the studio model)
//   on about 140 m from the bridge to the keel. The drawings win: this ship is 141 m tall.
//
// The saucer: an ellipse 384 m long and 464 wide, not a circle, its centre 192 m aft of the bow; aft of x = -120 it
// pulls in to a tail 140 m wide that runs back over the neck to the impulse deck's end at x = -204.
export const SAUCER={
  a:192, b:232,
  // plan outline aft of the ellipse: [x, half-width] (plan view, scaled by 0.97)
  // (measured: [-131.6,165.8],[-140.7,151.6],[-150.7,135.9],[-161.4,104.3],[-172.1,90.6],[-182.8,70.4],[-193.5,70.6],
  // [-199.5,62],[-202.8,40]; the steps in it are the drawing's thrusters and hatches standing proud of the edge, and
  // lofted through as they are they put corners in the trailing edge. This is a smooth curve through them.)
  tail:[[-120,181.2],[-135,165],[-150,144],[-163,119],[-175,95],[-186,78],[-195,66],[-200.5,52],[-203.2,32],[-204,0]],
  // profiles against the normalised radius (0 at the centre, 1 at the rim), from the side view, y in metres
  top:[[0,29.5],[0.0625,29.4],[0.125,29.2],[0.1875,28.9],[0.25,28.2],[0.3125,27.4],[0.375,26.5],[0.4375,25.2],[0.5,23.8],
       [0.5625,22.3],[0.625,20.4],[0.6875,18.3],[0.75,15.8],[0.8125,12.6],[0.875,9.6],[0.9375,6.3],[0.975,4.3],[1,3.0]],
  bot:[[0,-22.0],[0.0625,-21.6],[0.125,-21.0],[0.1875,-20.4],[0.25,-19.6],[0.3125,-18.6],[0.375,-17.3],[0.4375,-15.6],
       [0.5,-13.6],[0.5625,-11.4],[0.625,-9.0],[0.6875,-6.9],[0.75,-5.3],[0.8125,-4.3],[0.875,-3.7],[0.9375,-3.3],[0.975,-3.1],[1,-3.0]],
  rim:3.0,                       // the rim is a band 6 m deep: the two rows of windows round Ten Forward's deck
  // the dorsal superstructure: a raised plate round the bridge with a stem aft to the main impulse engine
  bridge:{x:-13.6, r:33, stemFrom:-30, stemTo:-108, stemW0:30, stemW1:38, lift:2.6, top:35.3},
  // the bridge module on the plate: an egg in plan, longer aft (the observation lounge is its after end), a wall
  // with the bridge's windows round it and a low dome over; [fore, aft, half-width] in metres from its centre
  module:{x:-11, fore:12, aft:20, half:11.5, n:2.6, wall:2.0},
  sensor:{x:0, r:22, depth:2.4},  // the main sensor dome under the saucer
  yacht:{x0:-62, x1:-128, w:15, depth:2.0},
};
// The stardrive section: the engineering hull, as stations [d, top D, bottom D, widest-line D, half-width] (side and
// front views; the plan view's widths)
export const ENG=[
  [314, 86, 96, 92,18],[318, 85,104, 96,32],[324, 86,112,100,42],[336, 87,121,106,54],[348, 87,127,110,60],
  [365, 88,131,112,64],[390, 89,134.5,113,66],[420, 90,136.5,114,66],[460, 91,136.8,114,65],[500, 92,132,113,61],
  [530, 94,123,111,58],[560, 96,120,110,56],[590, 98,119.5,110,53],[600, 99,119,110,50],[605,100,118.5,110,46],[609,101,117.5,110,42],[611,102,116.5,110,38]];
// (the stern is a flat transom 76 m across and 14 deep, the main shuttlebay's door in it: the last station closes
// the hull in under a metre)
// The neck: an hourglass in the front view (half-width against y, at its narrowest 20 m, 44 m under the rim) leaning
// forward as it rises (its leading edge from (x -126, y -52) up to (-98, -17) under the saucer), and aft of the
// saucer its top runs down from the impulse deck to the spine along the engineering hull.
export const NECK={
  lead:[[-126,-52],[-98,-17]],
  width:[[-68,46],[-63,31],[-57,22],[-50,20],[-44,20],[-38,23],[-30,34],[-24,50],[-20,66],[-16,70],[10,70]],
  top:[[-120,10],[-190,6],[-204,-1],[-216,-12],[-228,-22],[-248,-34],[-278,-44],[-328,-54],[-370,-60],[-400,-64],[-415,-67]],
  aft:-415,
};
// The pylons: a U in the front view, out level from the engineering hull 82 m under the rim and up into the nacelle,
// 6 m thick; [x leading, x trailing] at the root and at the nacelle
// (the last fifth of the way up, the chord runs out forward along the nacelle's underside: the fairing)
export const PYLON={y:-82, z0:44, zBend:95, rBend:25, zTop:120, yTop:-46, t:6.4, root:[-343,-420], tip:[-352,-425], fair:[-318,-432]};
// The nacelles: 246.5 m long (the published 248), from x = -204 to -450.5, their centres 125 m off the centreline and
// 36 m under the rim; [d, half-width, half-height]
export const NACELLE={z:125, y:-35.9, n:2.8,
  st:[[396,13,8.5],[399,19,12],[404,22.5,14.2],[412,25,15.4],[425,26,16],[445,26.5,16.2],[600,26.5,16.2],[615,26,16],
      [625,24.5,15.4],[633,21,13.8],[639,15,11],[642.5,4,3.5]],
  bussard:{x:-221, rx:17.5, ry:7.4, rz:21.5},     // the red collector, wrapped round the nacelle's nose
  rings:[-237,-246],                               // the gold rings behind it
  grille:{x0:-447, x1:-258, y0:-35.5, y1:-27},     // the warp field grille, along both flat sides
};
// The deflector: the nose of the engineering hull is not upright but leans back at about 30 degrees (the side view's
// envelope runs from 65 m under the rim at d = 324 to 83 at d = 336), and the dish lies in it, looking forward and down.
export const DEFLECTOR={x:-137.5, y:-77, rz:34, ry:9, depth:5, tilt:0.55};
export const BAYS={main:{x:-419.8, y:-73, w:34, h:9}, upper:{y:-9, z:15, w:13, h:6.5}};
// the photon torpedo launchers: forward at the foot of the neck over the deflector, aft over the shuttlebay
export const TORPEDO={fore:{y:-47}, aft:{y:-67.5}};
