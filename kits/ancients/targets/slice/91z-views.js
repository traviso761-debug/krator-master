// Presets, DERIVED from SL_SITE records populated by buildSlice.
// View names contain no colons and no apostrophes (tools/check_views.py rule VIEW-NAME).
BUDGET.type.slice='mega';

const SLDEF={x:0,z:0};
const SLI=Object.assign({},SLDEF,{x:-1550},SL_SITE[0]||{});
const SLR=Object.assign({},SLDEF,{x: 1550},SL_SITE[1]||{});
const SLW=(S,x,y,z)=>[S.x+x,y,S.z+z];

/* Three-quarter canyon vista showing the 720 m lenticular eye, front park fan, learning shaft, caverns & sunken park slot */
const SLHERO=S=>SLW(S,385,308,545).concat(SLW(S,12,265,-15));

const VIEWS={
 'Slice':                                  SLHERO(SLI),
 /* Square-on coronal elevation matching Soleri 26. Theology sheet (image_2.png) */
 'The elevation':                          SLW(SLI,14,278,668).concat(SLW(SLI,14,268,-10)),
 /* Upper Lenticular Eye close-up: Coffered Geodesic Apse Dome, Cultural Center arches, Vaulted Living & honeycomb belly */
 'The lenticular eye and coffered dome':   SLW(SLI,118,474,205).concat(SLW(SLI,-6,468,-28)),
 /* Standing on the semicircular radial-buttressed Park & Recreation terrace fan looking into the Coffered Dome */
 'The amphitheatre park fan':              SLW(SLI,-74,458,96).concat(SLW(SLI,4,474,-26)),
 /* Vertical Learning & Collection Shaft + rock-cut Research, Museums & Anthropological Collection caverns + Bench Pavilion */
 'The learning shaft and specimen caverns':SLW(SLI,-195,318,262).concat(SLW(SLI,8,308,-12)),
 /* Inside the 192 m-deep Sunken Canyon Park looking along the reflecting canal up the Battered Dwellings Wall & Shaft */
 'The sunken park and dwellings wall':     SLW(SLI,18,44,168).concat(SLW(SLI,76,96,12)),
 /* Subterranean Automated Industries coronal machine bays, cooling sluice & park waterfall cascade */
 'Automated industries and gorge sluice':  SLW(SLI,-54,24,282).concat(SLW(SLI,52,22,158)),
 /* High plateau vista (image.png Plan 1 & 3): Hexagonal Skylight Court, circular drums, Meeting Hall & Transport Portals */
 'The plateau skylights and hex court':    SLW(SLI,225,658,-415).concat(SLW(SLI,-16,498,-205)),
 /* Midlevel look inside the six-sided Hexagonal Skylight Commercial & Promenade Court */
 'Inside the hexagonal skylight court':    SLW(SLI,26,548,-172).concat(SLW(SLI,-10,472,-216)),
 /* Twin NW diagonal Inter-City Transportation sunken guideways and portal hoods */
 'Inter-city transportation portals':      SLW(SLI,-392,592,-462).concat(SLW(SLI,-228,504,-192)),
 /* Night colour script: glowing coffered dome, lit cellular honeycomb, illuminated specimen caverns & reflecting canal */
 'Slice at night':                         SLHERO(SLI).concat([1]),
 /* Ruined state (d=1): West Brow columnar rockfall, sheared west eye tip, mid-shaft blowout & twin wild cascades */
 'The ruined slice':                       SLHERO(SLR),
 /* Close view of the mid-shaft neck blowout, the 48 m & 192 m wild cascades, and fallen honeycomb wrecks on the west bench */
 'The shaft breach and wild cascades':     SLW(SLR,-238,252,278).concat(SLW(SLR,-38,215,28)),
 /* Surviving Upper Eye & Coffered Dome sanctuary kept alive above the severed shaft neck */
 'The kept eye sanctuary':                 SLW(SLR,218,486,178).concat(SLW(SLR,16,464,-42))
};
