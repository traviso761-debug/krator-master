// ================================================================= TWINS — the Red Cistern's leavings (station 3: placed in the kit's registry)
// TWINS.putLeavings(list): the abandoned strongboxes and the wreck planks a station lays on the amphitheatre's rim, each [name, [x, y, z], q, s,
// colour] as BIO.put takes it, under the station's own pass ('twins/sump', its budget type). The items are the kit's own (50: 'strongbox',
// 'plank', 'wheel'); this runs inside the kit's registry (BIO.kitEnd wraps it), so a host fragment can lay them. Records are the caller's.
TWINS.putLeavings=function(list){const cur=BIO.cur;BIO.cur='twins/sump';let n=0;
 for(const p of list){BIO.range=p[5]==null?600:p[5];BIO.put(p[0],p[1],p[2],p[3],p[4]);n++;}
 BIO.range=null;BIO.cur=cur;return n;};
