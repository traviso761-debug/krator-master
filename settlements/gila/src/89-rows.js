// ================================================================= GILA: overrides the Lizardmen kit sheet's showcase rows
// [G data] On Gila's settlement page FAMILIES is empty so 90-scene.js lays no showcase rows; SITES is populated from GL_SITE
// in 90g-gl-world.js before 92-world.js calls buildWorld().
KIT.id = 'gila';
KIT.title = 'Gila — the Lizardmen\'s salt village';
KIT.band = 'Gila on the salt lake';
KIT.frag = 'settlements/gila';
const TITLE = KIT.title;
const FAMILIES = [];
