/* ================================================================= SKINK: overrides the Lizardmen kit sheet's showcase rows */
/* [G data] On Skink's settlement page FAMILIES is empty so 90-scene.js lays no showcase rows; SITES is populated from LZV_SITE
   in 90w-lzv-world.js before 92-world.js calls buildWorld(). */
KIT.id = 'skink';
KIT.title = 'Skink — the Lizardmen\'s salt village';
KIT.band = 'Skink on the halite flat under the Pile';
KIT.frag = 'settlements/skink';
const TITLE = KIT.title;
const FAMILIES = [];
