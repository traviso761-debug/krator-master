// TARGET: city — Ys. No site table: the layout (phase 3) places everything. TITLE is read by build.py for <title>.
const TITLE='Ys';
const GROUND_C=0;
const SITES=[];
// the port kit's layout: the harbour segments and vessels the city places (phase 3); empty in phase 0
const PORT_LAYOUT_DEF={items:[],stamps:[],runs:[],fine:{x0:150,x1:1450,z0:-750,z1:950}};   // 10 m cells over the city core
CITY.LAYOUT_DEBUG=false;   // the layout overlay (87) is built always; this shows it at start, the Layout button toggles it
