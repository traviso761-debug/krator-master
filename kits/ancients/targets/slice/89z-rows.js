// TARGET: slice — Slice (after Paolo Soleri's 26. Theology), the cliff-slice arcology, intact (d=0) and ruined (d=1).
// Unites the 720 m horizontal lenticular cliff eye and coffered geodesic apse dome, the front semicircular radial-buttressed
// park fan, the excavated plateau skylight courts and twin diagonal transit portals, the 36-storey vertical Learning &
// Collection shaft with four horizontal specimen caverns, and the deep sunken park canyon, battered dwellings wall, and
// subterranean Automated Industries hall, with a full [G data] Work/Live/Recreation/Civic blueprint (~13 000 citizens).
const TITLE='Slice — the cliff-slice arcology';
const GROUND_C=-80;
const DECAYS=[0,1];
/* Each columnar escarpment spans 2 160 m (-1 080 to +1 080); s = 1 550 places 3 100 m between axes (940 m clear gap) */
const ROWS={
 slice:{z:0,s:1550,r:1050}
};
const RUINS=[
 [-ROWS.slice.s,80,ROWS.slice.r*0.48],
 [ ROWS.slice.s,80,ROWS.slice.r*0.62]
];
const EXTRA_BUILDERS={slice:buildSlice};
