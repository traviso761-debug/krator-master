// TARGET: city — Ys. No site table: the layout (phase 3) places everything. TITLE is read by build.py for <title>.
const TITLE='Ys';
const GROUND_C=0;
const SITES=[];
// the port kit's layout: the harbour segments and vessels the city places (phase 3); empty in phase 0
const PORT_LAYOUT_DEF={items:[],stamps:CITY_STAMPS,runs:[],fine:{x0:-1600,x1:1550,z0:-1600,z1:1550}};   // 10 m cells over the city core
CITY.LAYOUT_DEBUG=false;   // phase 3 prep: the layout overlay and its labels; off once the placer builds
