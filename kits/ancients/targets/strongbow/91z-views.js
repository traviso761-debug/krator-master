// Presets, DERIVED from what the builder left in SB_SITE (8aw2): the lip, the hull, the Nock, the crown, the Spine, the pad.
// The face is 900 m tall and the mast stands to 1 076 m, facing south (+z), so a whole view stands about 2 400 m off.
BUDGET.type.strongbow='mega';
const SBDEF={x:0,z:0,lip:900,floor:0,top:960,tip:498,back:-50,prow:120,bayW:190,nock:{y:520,zc:250,wx:215},crown:{y:910},
 mast:{foot:[0,910,-66],head:[0,1076,-31]},spine:[[0,458,-53],[0,410,-53],[30,350,-11],[30,290,-11],[-26,230,33],[-26,170,33],[0,108,77],[0,36,77]],pad:[300,900,-140],term:{z1:60,y1:36},
 quiver:{x:-380,top:390,tip:150},galleries:[]};
const SBA=Object.assign({},SBDEF,{x:-1100},SB_SITE[0]||{});
const SBB=Object.assign({},SBDEF,{x:1100},SB_SITE[1]||{});
const SBW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const SBHERO=S=>SBW(S,-560,600,1650).concat(SBW(S,0,520,0));
const VIEWS={
 'Strongbow':                    SBHERO(SBA),
 // square on from the valley floor: the tower in its bay, the Spine coming down under it, the strata
 'From the valley':              SBW(SBA,0,180,2600).concat(SBW(SBA,0,460,0)),
 // over the lip from the plateau's edge: the crown, its pool, the mast, the arc ramp, the heliostats
 'The crown':                    (function(S){return SBW(S,260,S.crown.y+160,330).concat(SBW(S,0,S.crown.y,S.back+60));})(SBA),
 // the landing pad on the Nock's deck before the tower's prow, the stays fanning down to the deck's wings (the owner's reference)
 'The landing pad':              (function(S){const L=S.landing||[0,520,120];return SBW(S,L[0]-160,L[1]+90,L[2]+190).concat(SBW(S,L[0]+10,L[1]+60,L[2]-60));})(SBA),
 // the Nock from the east: the string fans coming down to its wing tips, the pads
 'The Nock':                     (function(S){return SBW(S,520,S.nock.y+120,420).concat(SBW(S,0,S.nock.y,60));})(SBA),
 // up the east flank from under the Nock: the stays fanning to the rock, the teal fin
 'The stays':                    (function(S){return SBW(S,330,S.nock.y-180,300).concat(SBW(S,60,S.nock.y+180,40));})(SBA),
 // the Spine from the south-east: drums on necks, stepping out from the rock run by run, a terrace at every turn
 'The Spine':                    (function(S){const n=S.spine;return SBW(S,330,260,520).concat(SBW(S,0,250,n[3][2]));})(SBA),
 // on a terrace: the glazed pavilion ring and its garden, a rotor outrigger, the next drums stepping down
 'A terrace':                    (function(S){const n=S.spine[2];return SBW(S,n[0]+120,n[1]+40,n[2]+150).concat(SBW(S,n[0],n[1],n[2]));})(SBA),
 // the pad on the plateau and its craft, the heliostats beyond
 'The pad':                      (function(S){return SBW(S,S.pad[0]+150,S.pad[1]+70,S.pad[2]+160).concat(SBW(S,S.pad[0],S.pad[1]+15,S.pad[2]));})(SBA),
 // the foot: the terminus in the bay, the guideway and the road arriving from the west
 'The terminus':                 (function(S){return SBW(S,-420,60,420).concat(SBW(S,0,40,0));})(SBA),
 'Strongbow at night':           SBHERO(SBA).concat([1]),
 'The ruin':                     SBHERO(SBB),
 'The ruin from the valley':     SBW(SBB,0,180,2600).concat(SBW(SBB,0,460,0)),
 // the east side: the anchor fans snapped, the cables hanging, the Bow leaning off the face, the east wing gone
 'The snapped stays':            (function(S){return SBW(S,700,520,700).concat(SBW(S,40,420,40));})(SBB),
 // the lean from the side: the gap opening behind the Bow toward its tip
 'The lean':                     (function(S){return SBW(S,700,420,260).concat(SBW(S,0,440,-20));})(SBB),
 // the Spine's broken head under the leaning keel: the gap between the town below and the Order above
 'The broken Spine':             (function(S){const n=S.spine;return SBW(S,260,470,330).concat(SBW(S,0,420,n[1][2]));})(SBB),
 // the town at the foot: the han where the road ends, the garrison, the lamps in the Spine's lower drums
 'The town at the foot':         (function(S){return SBW(S,-380,90,620).concat(SBW(S,0,40,120));})(SBB),
 // the fallen lower hull in the scree
 'The fallen hull':              (function(S){return SBW(S,S.quiver.x-60,160,560).concat(SBW(S,S.quiver.x,40,120));})(SBB),
 // the crown: the Order's banners, the bent mast
 "The Order's crown":            (function(S){return SBW(S,-240,S.crown.y+140,360).concat(SBW(S,0,S.crown.y+40,S.back+60));})(SBB),
 'The ruin at night':            SBHERO(SBB).concat([1]),
};
