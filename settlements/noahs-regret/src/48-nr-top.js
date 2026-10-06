// prefix: nr
// ================================================================= THE TOP DECK: parks, the twin funnels, the Ancient lamp standards
// The platform on the ring: promenades along both parapets, the deck buildings on their lots (5x), lawns in raised white
// beds between them (gone to meadow in a thousand years; the trees are placeholder flora placed as their own records, 64),
// the stair kiosks (42), the atrium's dome (44), the greenhouse's glass vault (46), the garden with its dry fountain over
// the grand dining room, and at the stern of each hull its twin raked funnels over its engine room.
function nrBed(t0,t1,s0,s1,y,h){nrBand('white',t0,t1,s0,s1,y,y+h,P('white'),'oise');
 nrBand('turf',t0+.25,t1-.25,s0+.25,s1-.25,y+h-.12,y+h-.02,P('turf'),'t');}
function nrTop(){const L=NR.L,W=NR.W,y=L.TOP;reseed(4800);
 /* the parks: two beds either side of a central path, a path across the middle */
 for(const K of NR.PARKS){if(K.garden)continue;const m=(K.t0+K.t1)/2;
  for(const [s0,s1] of [[-12.5,-1.6],[1.6,12.5]]){if(K.t1-K.t0>16){nrBed(K.t0+1,m-1.2,s0,s1,y,.5);nrBed(m+1.2,K.t1-1,s0,s1,y,.5);}else nrBed(K.t0+1,K.t1-1,s0,s1,y,.5);}}
 /* the garden over the dining room: a long lawn, a dry Ancient fountain (a ring of white, rainwater in it) */
 {const K=NR.PARKS.find(k=>k.garden),m=(K.t0+K.t1)/2;
  for(const [a,b] of [[K.t0+8,m-6],[m+6,K.t1-8]])for(const [s0,s1] of [[-13,-2],[2,13]])nrBed(a,b,s0,s1,y,.45);
  const c=NR.at(m,0);lathe('white',c[0],c[1],[[5,y],[5.3,y+.2],[5.3,y+.7],[4.9,y+.75],[4.7,y+.3]],40,P('white'));
  cyl('water',c[0],y+.3,c[1],4.75,.18,hc(0x4a5a4a),40);cyl('white',c[0],y,c[1],.6,2.2,P('white'),16,.3);sph('white',c[0],y+2.3,c[1],.55,P('white'),.6,16);}
 /* the funnels: elliptical, raked aft, white with a dark crown, soot down their lee side */
 for(const tf of NR.FUNNELS){const C=NR.at(tf,0),T=NR.tan(tf),N=NR.nrm(tf),H=15,ra=4.4,rb=2.7;
  /* raked aft: toward the hull's stern, +t on the starboard hull, -t on the port */
  const ag=tf>0?1:-1,fp=(u,v,k)=>{const a=u*TAU,rk=k||1,r=1-.12*v,rake=v*H*.22*ag;return [C[0]+T[0]*(Math.cos(a)*ra*r*rk+rake)+N[0]*Math.sin(a)*rb*r*rk,y+v*H,C[1]+T[1]*(Math.cos(a)*ra*r*rk+rake)+N[1]*Math.sin(a)*rb*r*rk];};
  psurf('white',(u,v)=>fp(u,v*.82),32,6,P('white'));psurf('dark',(u,v)=>fp(u,.82+v*.18),32,2,hc(0x2a2c2e));
  psurf('dark',(u,v)=>{const p=fp(u,1,1-v*.9);return [p[0],y+H-.6,p[2]];},32,2,hc(0x161616),{up:true});
  smokeAt(...((p)=>[p[0],p[1]+.5,p[2]])(fp(0,1,0)),{r:.6,kind:'soot'});}
 /* the Ancient lamp standards along both promenades: slim white stems, round heads (dead; the pirates hang lanterns) */
 for(let t=NR.T0+8;t<NR.T1-6;t+=16)for(const s of [-16.8,16.8]){if(Math.abs(t-NR.ATRIUM.tc)<23)continue;const p=nrP(t,s,y);cyl('white',p[0],y,p[2],.12,4.2,P('white'),8,.07);sph('white',p[0],y+4.4,p[2],.32,P('white'),1,12);}
 /* ventilators: mushroom vents over the service core, between the lots */
 for(let t=NR.T0+20;t<NR.T1-10;t+=27){if(NR.LOTS.some(l=>Math.abs(l.t-t)<26)||NR.CORES.some(c=>Math.abs(c.t-t)<6)||Math.abs(t-NR.ATRIUM.tc)<26||NR.FUNNELS.some(f=>Math.abs(t-f)<9)||NR.PARKS.some(k=>k.garden&&t>k.t0-4&&t<k.t1+4)||NR.ZONES.some(z=>z.roof==='glass'&&t>z.t0-3&&t<z.t1+3))continue;
  const p=nrP(t,0,y);cyl('white',p[0],y,p[2],.7,1.4,P('white'),16);sph('white',p[0],y+1.4,p[2],1.0,P('white'),.45,16);}}
nrPart('top',nrTop);
