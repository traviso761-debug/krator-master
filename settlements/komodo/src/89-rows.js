/* ================================================================= KOMODO: overrides the Lizardmen kit sheet's showcase rows */
/* [G data] On Komodo's settlement page FAMILIES is empty so 90-scene.js lays no showcase rows; SITES is populated from LZV_SITE
   in 90w-lzv-world.js before 92-world.js calls buildWorld(). */
KIT.id = 'komodo';
KIT.title = 'Komodo — the Lizardmen\'s tin and fishing town';
KIT.band = 'Komodo at the eastern sea\'s far end';
KIT.frag = 'settlements/komodo';
const TITLE = KIT.title;
const FAMILIES = [];
