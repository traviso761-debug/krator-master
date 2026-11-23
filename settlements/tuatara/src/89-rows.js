/* ================================================================= TUATARA: overrides the Lizardmen kit sheet's showcase rows */
/* [G data] On Tuatara's settlement page FAMILIES is empty so 90-scene.js lays no showcase rows; SITES is populated from LZV_SITE
   in 90w-lzv-world.js before 92-world.js calls buildWorld(). */
KIT.id = 'tuatara';
KIT.title = 'Tuatara — the Lizardmen\'s copper village';
KIT.band = 'Tuatara on the volcanic savanna';
KIT.frag = 'settlements/tuatara';
const TITLE = KIT.title;
const FAMILIES = [];
