/* ================================================================= IGUANA: overrides the Lizardmen kit sheet's showcase rows */
/* [G data] On Iguana's settlement page FAMILIES is empty so 90-scene.js lays no showcase rows; SITES is populated from LZV_SITE
   in 90w-lzv-world.js before 92-world.js calls buildWorld(). */
KIT.id = 'iguana';
KIT.title = 'Iguana — the Lizardmen\'s granary town';
KIT.band = 'Iguana on the Pile\'s plateau';
KIT.frag = 'settlements/iguana';
const TITLE = KIT.title;
const FAMILIES = [];
