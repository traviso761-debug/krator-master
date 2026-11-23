// ================================================================= N SEMIARID (read in place) — the high line station's one change to the kit's zones
// [G data] The flood lake's bed is fresh-water slackwater silt with no salt (the plan: its salt rises only toward today's trough, off this map), so the
// kit's lowland desert there is thinner than on the dam beds: its crawler fields (the kit's floor: at home on the salt flats and the dam beds' silt)
// and its desert planters at two fifths, the steppe's taking the rest. The kit's hook (55-biome-nsemiarid-trees.js, NSEMIARID.ZONE_HOOK); the floor's
// class was 22.8 M triangles without it, over its 16 M budget.
NSEMIARID.ZONE_HOOK=(Z,x,z)=>{const b=Z.bed;if(b>0){Z.desert*=1-.6*b;}};
