// Presets for targets/quintagon, derived from QN_SITE populated by buildQuintagon.
const QNDEF={x:0,z:0,RB0:460,RB1:415,YWALL:68,YPAR:76,Y_COL0:138,Y_COL1:228,Y_CR0:512,Y_TOP:566};
const QNA=Object.assign({},QNDEF,{x:-2400},QN_SITE[0]||{});
const QNB=Object.assign({},QNDEF,{x:2400},QN_SITE[1]||{});
const QNAZ=a=>a*Math.PI/180;
const QNP=(S,a,r,y)=>[S.x+Math.cos(QNAZ(a))*r,y,S.z+Math.sin(QNAZ(a))*r];

// Hero aerial view (Reference Image 1): looking over the foreground triangular
// garden court (sector 1, phi=126 deg SW, sunlit) framed by its perimeter wall
// and two converging star arms, up the sloped green garden and white pavilions
// to the central podium, splayed 5-legged collar, and 566 m 5-fluted spire.
const QNHERO=S=>QNP(S,126,880,340).concat([S.x,195,S.z]);

const VIEWS={
 'Quintagon':                    QNHERO(QNA),
 // Reference Image 2: low-angle coastal view off the battered white pentagonal
 // perimeter walls, terraced corner bastions, splayed 5-legged collar & spire
 'Coastal bastion (low view)':   QNP(QNA,62,860,64).concat([QNA.x+40,210,QNA.z+20]),
 // High oblique plan view showing the pentagon, 5 star arms to corners & 5 triangular gardens
 'From above (star & pentagon)': QNP(QNA,126,620,1180).concat([QNA.x,80,QNA.z]),
 // Inside a sloping triangular garden court looking up to the star podium & collar
 'Triangular garden court':      QNP(QNA,126,305,78).concat([QNA.x,165,QNA.z]),
 // Close-up of the central stepped star podium & splayed 5-legged buttress collar
 'Splayed 5-legged collar':      QNP(QNA,112,245,175).concat([QNA.x,182,QNA.z]),
 // The tall 5-fluted central spire and flared 5-winged observation crown
 'The 5-fluted spire & crown':   QNP(QNA,108,260,485).concat([QNA.x,445,QNA.z]),
 // The eastern breakwater pier, hooked jetty & marine canal court
 'Seaward harbour pier':         QNP(QNA,355,890,155).concat(QNP(QNA,14,460,45)),
 // Night view
 'Quintagon at night':           QNHERO(QNA).concat([1]),
 // Ruined state (d = 1)
 'Ruined':                       QNHERO(QNB),
 'The fallen spire':             QNP(QNB,18,520,210).concat(QNP(QNB,54,180,95)),
};
