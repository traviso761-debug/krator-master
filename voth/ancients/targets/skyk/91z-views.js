// Presets for Skyscraper K. The sail's broad faces look north (flat) and south
// (bellied); the rose, the porch and the hall's glass all face south, the rib
// stands on the east. So the heroes look north from the south-south-east.
// Rose, hall and fallen-sail positions come from SK_SITE, which the builder
// fills (this file loads after 90-scene.js has run every builder).
const SKV=(function(){const R=ROWS.skyK,S=d=>SK_SITE[d]||{};
 const xi=-R.s,xr=R.s,xh=0,xt=R.t,z=R.z;
 const hero=(x,n)=>[x-150,140,z+790,x+5,215,z].concat(n?[1]:[]);
 const s0=S(0),s1=S(1),s2=S(2);const RX=s0.RX||10.9,RY=s0.RY||250,UX=s2.UX||135,UZ=s2.UZ||-8;
 const hall=s0.hall||[-86,20],hang=s1.ribHang||[-6,308,-24];
 return{
 'Skyscraper K':            hero(xi),
 'The row':                 [450,430,z+2300,450,150,z],
 'Ruined K':                hero(xr),
 'Rehabilitated K':         hero(xh),
 'Toppled K':               [xt+40,190,z+600,xt+190,30,z-10],
 'The rose':                [xi+RX+70,RY+14,z+165,xi+RX,RY,z],
 'The crown':               [xi+130,475,z+200,xi-2,385,z],
 'The hall at eye level':   [xi-14,4.2,z+98,xi+hall[0]-6,22,z+hall[1]+14],
 'Looking up':              [xi-10,4.2,z+48,xi+12,330,z],
 'The fallen sail':         [xt+UX+440,48,z+UZ+90,xt+UX+120,8,z+UZ],
 'By night':                [xi-70,200,z+540,xi+5,225,z,1],
 'The shattered rose':      [xr+RX+70,RY+14,z+165,xr+RX,RY,z],
 'The hanging rib':         [xr+360,190,z+170,xr+hang[0]+60,210,z+hang[2]],
 'The hoop from the north': [xi+260,170,z-560,xi+30,200,z]};})();
const VIEWS=SKV;
