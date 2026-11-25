// Presets, DERIVED from A3_SITE records populated by buildArcoindian3.
// View names contain no colons and no apostrophes (tools/check_views.py rule VIEW-NAME).
BUDGET.type.arcoindian3='mega';

const A3DEF={x:0,z:0};
const A3I=Object.assign({},A3DEF,{x:-1550},A3_SITE[0]||{});
const A3R=Object.assign({},A3DEF,{x: 1550},A3_SITE[1]||{});
const A3W=(S,x,y,z)=>[S.x+x,y,S.z+z];

/* Acceptance Frame 2 (Vista): three-quarter canyon view across the gorge river showing all 3 motifs united in the cliff */
const A3HERO=S=>A3W(S,390,278,495).concat(A3W(S,-10,235,-55));

const VIEWS={
 'Arcoindian III':                       A3HERO(A3I),
 /* Acceptance Frame 1 (Ground/Court level): inside East Oculus Sanctuary Court 3 looking across the paired emerald-mosaic
    pools toward the stacked circular moon-gates, ground arches, cantilevered skylight oculus, and glowing sconces (Ref 3) */
 'The emerald pool court':               A3W(A3I,114,200,32).concat(A3W(A3I,98,198,-26)),
 /* Square-on elevation across the gorge river: sheer sandstone cliff, barrel vault, stepped arches, fluted towers & bridges */
 'The sheer cliff elevation':            A3W(A3I,0,248,505).concat(A3W(A3I,0,240,-60)),
 /* Reference 1 focus: the Crown Barrel Vault, recessed dark-glazed arch, tall round-headed flank arcades & stepped arches */
 'The barrel vault and flank arcades':   A3W(A3I,168,426,125).concat(A3W(A3I,-8,412,-125)),
 /* Reference 2 focus: clustered vertically-fluted chalice towers, curved glass scoops, circular forest crowns & arch bridges */
 'The fluted towers and skybridges':     A3W(A3I,345,338,245).concat(A3W(A3I,175,275,-65)),
 /* Reference 1 mid-spine focus: nested post-and-lintel pavilions inside semicircular arches + grand cascading flank stair */
 'The stepped arch pavilions and stair': A3W(A3I,-138,186,198).concat(A3W(A3I,6,152,18)),
 /* Reference 3 close court view: cantilevered skylight oculus slab, circular moon-gate sills with vines & mosaic pools */
 'The oculus loggia and skylight':       A3W(A3I,-94,142,68).concat(A3W(A3I,-118,144,12)),
 /* High rim vista over the High Forest Arch skybridge, twin crown drums W4/E4, and rooftop woodland groves */
 'The high forest arch and crowns':      A3W(A3I,265,578,85).concat(A3W(A3I,0,475,-155)),
 /* Inside the Barrel-Vault threshold looking into the multi-storey conservatory galleries */
 'Inside the barrel vault loggia':       A3W(A3I,22,382,-52).concat(A3W(A3I,-6,404,-148)),
 /* Cliff foot: gorge river, mooring piers, boats, water-gate cascade, and lower sentinel bastions */
 'The river quay and water gate':        A3W(A3I,155,48,295).concat(A3W(A3I,-12,34,125)),
 /* Night colour script: glowing terracotta court sconces, warm circular oculi, glazed tower scoops & conservatory */
 'Arcoindian III at night':              A3HERO(A3I).concat([1]),
 /* Ruined state (d=1): West Brow rockfall, sheared W3 stump, broken neck bridges, wild cascade & surviving East Sanctuary */
 'The ruined cliff city':                A3HERO(A3R),
 /* Close view of the West Brow collapse, the 238 m wild cascade, and seated fluted-drum wrecks on the west shore */
 'The west rockfall and wild cascade':   A3W(A3R,-345,168,310).concat(A3R.x-175,115,A3R.z+45),
 /* The Kept Upper Sanctuary above the y=188 m Neck: surviving East Spring pools, upper terraces, and intact Barrel Vault */
 'The kept upper sanctuary':             A3W(A3R,285,365,180).concat(A3W(A3R,48,315,-95))
};
