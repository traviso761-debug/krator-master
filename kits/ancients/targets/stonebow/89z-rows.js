// TARGET: stonebow — Paolo Soleri's "21. Stonebow" canyon-bridge arcology across the Ching-Ma Porphyry Shut-In
// (Scale Model 5.1 px 1196, 179 in Neo-Ozarks / upper Ria Valley, on the Ancient Outland Gate Highway).
//
// Shows the refurbished settlement centerpiece (~18,000 residents) at the origin (0, 0), and the peak intact (~200,000)
// and cataclysm-ruined states at (-2600, +3600) and (+2600, +3600) behind the south-facing hero camera so all -z views
// enjoy an unobstructed horizon behind the Cultural Center Crown.
const TITLE='Stonebow — canyon-bridge arcology in the Ching-Ma Shut-In';
const GROUND_S=16000;
const GROUND_C=1400;
const DECAYS=[0,1];
const ROWS={
 stonebowRefurb:{z:0,s:0,r:920,ds:[0]},
 stonebow:{z:3600,s:2600,r:920,ds:[0,1]}
};
const RUINS=[
 [0,0,920*0.95],
 [-2600,3600,920*0.75],
 [2600,3600,920*1.08]
];
const EXTRA_BUILDERS={
 stonebow:buildStonebow,
 stonebowRefurb:buildStonebowRefurb
};
