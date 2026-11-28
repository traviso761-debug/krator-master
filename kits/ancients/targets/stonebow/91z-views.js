// Presets for Stonebow: refurbished centerpiece at (0, 0), intact at (-2600, +3600), cataclysm ruin at (+2600, +3600).
// Note: view names avoid apostrophes, colons, and slashes per tools/check_views.py.
BUDGET.type.stonebow='mega';
BUDGET.type.stonebowRefurb='mega';

const SB_REF={gx:0,gz:0};
const SB_INT={gx:-2600,gz:3600};
const SB_RUN={gx:2600,gz:3600};
const SBV=(S,cx,cy,cz,tx,ty,tz)=>[S.gx+cx,cy,S.gz+cz,S.gx+tx,ty,S.gz+tz];

const VIEWS={
 // 1. Hero 3/4 rim overlook across the 900 m Ching-Ma Porphyry Shut-In
 'Stonebow refurbished':       SBV(SB_REF,610,565,680,0,380,0),
 // 2. Axial canyon elevation matching Soleri plate 36 (eye-shaped gorge void, Tourist Center, Arch & Skylight Crown)
 'Canyon elevation':           SBV(SB_REF,0,285,660,0,350,-20),
 // 3. Overhead ground-plan view matching Soleri plate 35 (twin highways, U-loops, 4 wings & 9 spine light wells)
 'Plan from above':            SBV(SB_REF,30,1460,240,0,410,0),
 // 4. Cable-stabilized lower Tourist Center panorama bridge 170 m above the Ching-Ma River
 'Suspended Tourist Center':   SBV(SB_REF,185,216,190,0,182,0),
 // 5. Driving east along the North Outland Gate Highway into the North-West Twin-Shaft Gate Pylon
 'Outland Gate Highway':       SBV(SB_REF,-555,434,-118,-310,442,-112),
 // 6. Canyon-floor park looking upstream to the 33 m porphyry cataract, plunge pool & bridge overhead
 'Ching-Ma cataract and park': SBV(SB_REF,52,26,-385,-12,16,-548),
 // 7. Night vista: warm lit refurbished spine contrasted with dark sealed delving rim vaults
 'Stonebow at night':          SBV(SB_REF,610,565,680,0,380,0).concat([1]),
 // 8. Intact peak Stonebow (~200,000 residents) as built by the Ancients
 'Stonebow as built':          SBV(SB_INT,610,565,680,0,380,0),
 // 9. Cataclysm ruin from open canyon throat: collapsed eastern Tourist Center, bay 4 breach & seated canyon-floor wreckage
 'Stonebow in ruin':           SBV(SB_RUN,0,228,625,18,245,-10),
 // 10-11. Steep overhead cut-away interior views into furnished Cultural Center & broken delving West Vaults
 'Inside Cultural Center':     SBV(SB_REF,22,598,42,0,497,0).concat([0,{site:'refurb/crown',storey:0}]),
 'Inside delving vaults':      SBV(SB_REF,-535,468,52,-555,343,-12).concat([0,{site:'refurb/vaults-w',storey:0}])
};
