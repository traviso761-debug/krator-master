// prefix: yt
// ================================================================= HEAT: the mass heater, its stoking chamber, the flued platform, the chimney
// PLAN.md section 4, from the survey of 2026-10-25: burn hot once or twice a day into a tonne or more of stone and let it
// give the heat back; the flue under a suspended sleeping platform (the kang and ondol pattern), insulated beneath; the
// fire stoked from a chamber off the entry passage with its own air duct, never from the passage (which must stay cold)
// nor the room; a chimney standing inside the room, a quarter taller than at sea level for the thin air, through a stone
// collar where it passes ice, with a damper.
//   ytPlatformFlued(h)   the suspended platform: a soapstone-topped slab on stone sleepers over an insulation bed; the
//                        spaces between the sleepers are the flue's runs
//   ytStokeChamber(h)    the side chamber off the entry passage: its corbelled stone roof, the firebox with its larch
//                        stoking door, the air duct from the porch
//   ytChimney(h)         the stack from the platform's back up through the shell, its collar and its damper
//   ytHeart(h)           all three, and the heat record they make
// h: the room and its entry, in the dome's frame: {Rr, Ri, Ro, Hi, Ho, yFl, zPlat, yPlat, hw, yF, t, z1, side (+1 the
// chamber on the passage's right, -1 its left), collar (true where the shell is pycrete)}
const YT_MOSS_BED=.25;   /* the insulation under the flues: birch bark over moss, metres */
function ytPlatformFlued(h){const r=h.Rr-.03,yTop=h.yPlat,yBed=h.yFl+YT_MOSS_BED,nS=5,runs=nS-1;
 /* the insulation bed on the pit floor, and the top slab of soapstone over flags */
 prism('earth',ytSegment(r,h.zPlat,24),h.yFl,yBed,jc(0x6a6648,.04));
 prism('flag',ytSegment(r,h.zPlat,24),yTop-.14,yTop-.04,P('flag'));prism('soap',ytSegment(r-.04,h.zPlat-.04,24),yTop-.04,yTop,P('ice'));
 /* the sleepers, front to back, each cut to the circle; between them the flue runs */
 const xw=Math.sqrt(Math.max(0,r*r-h.zPlat*h.zPlat))*.92;
 for(let i=0;i<nS;i++){const x=-xw+2*xw*i/(nS-1),zb=-Math.sqrt(Math.max(0,r*r-x*x))+.1,zf=h.zPlat-.05;if(zf-zb<.3)continue;
  box('slab',x,yBed,(zb+zf)/2,.22,yTop-.14-yBed,zf-zb,P('slab'));}
 /* the front wall of the platform, closing the flue runs (the flue turns at the back and front: a serpentine) */
 box('slab',0,yBed,h.zPlat-.06,xw*2+.3,yTop-.14-yBed,.14,P('slab'));
 return {runs,run_m:+(runs*(h.zPlat+r)).toFixed(1),bed_m:YT_MOSS_BED};}
function ytStokeChamber(h){const sd=h.side||1,rc=.75,cx=sd*(h.hw+.3+rc+.15),cz=h.Ro+1.0,ga=sd>0?PI:0,g=.42;
 /* the chamber: a dry slab drum from the passage floor, open toward the passage, roofed with a small corbelled dome
    banked over with turf */
 sector('slab',cx,cz,rc,rc+.3,ga+g,ga-g+TAU,h.yF,YT_KERB,P('slab'),20);
 W(cx,0,cz,0,()=>{ytShell('slab',ytCorbelProf(rc+.3,.9,0,.22,.08),P('slab'),{seg:20});
  ytDome('turfCap',rc+.55,1.25,P('ice'),{seg:20});if(h.season==='winter')ytDome('snowCap',rc+.68,1.36,P('ice'),{seg:20});});
 cyl('flag',cx,h.yF-.12,cz,rc,.12,P('flag'),16);ytWalkDisc(cx,cz,rc-.05,h.yF);ytWalkTarget('stoking chamber',cx,h.yF,cz);
 /* the doorway from the passage: an opening in the passage wall (drawn by the caller leaving the gap), a lintel over it */
 box('slab',sd*(h.hw+.15),h.ys-.05,cz,.32,.18,1.0,P('slab'));
 /* the firebox: a stone box at the chamber's back, its larch stoking door facing the chamber */
 const fx=cx+sd*.3;box('slab',fx,h.yF,cz-.35,.8,.9,.7,P('slab'));box('larch',fx,h.yF+.25,cz+.02,.42,.36,.05,P('larch'));
 box('glow',fx,h.yF+.28,cz+.035,.3,.06,.01,P('ember'));haloAt(fx,h.yF+.45,cz+.2,0xff8a30,true);
 /* the air duct: a slab-lined channel from the porch to the firebox's front, buried beside the passage wall */
 const dx=sd*(h.hw+.3+.18);box('slab',dx,h.yF+.1,(cz+h.z1)/2+.1,.28,.28,h.z1-cz+.2,P('slab'));
 box('slab',dx,-.05,h.z1+.2,.34,.2,.34,P('slab'));
 return {cx,cz,r:rc+.3,airDuct:+(h.z1-cz).toFixed(1)};}
function ytChimney(h){const cz=-(h.Rr-.4),w=.56,y0=h.yPlat,top=h.Ho*1.25+.4;
 box('slab',0,y0,cz,w,top-y0,w,P('slab'));box('slab',0,top-.12,cz,w+.16,.16,w+.16,P('slab'));
 /* where it passes the shell: a soapstone collar standing off it (an air gap) on a pycrete shell */
 const rr=Math.abs(cz),yOut=ytCatY(h.Ro,h.Ho,rr);
 if(h.collar){ring('soap',0,ytCatY(h.Ri,h.Hi,rr),cz,w*.85,.07,P('ice'));ring('soap',0,yOut,cz,w*.85,.08,P('ice'));}
 /* the damper: a soapstone plate on an antler rod, at reach above the platform */
 box('soap',w*.5+.02,y0+1.5,cz,.03,.36,.42,P('ice'));pole('horn',[w*.5+.05,y0+1.5,cz],[w*.5+.45,y0+1.45,cz],.018,P('bone'));
 smokeAt(0,top+.1,cz,{r:.18,kind:'chimney'});
 return {h:+(top-h.yFl).toFixed(2),seaLevel:+((top-h.yFl)/1.25).toFixed(2),damper:true,collar:!!h.collar};}
function ytHeart(h){const pl=ytPlatformFlued(h),ch=ytStokeChamber(h),cm=ytChimney(h);
 return {stove:{kind:'mass',mass_t:+(1.6+pl.runs*.25).toFixed(1),burns:'once a day, twice in the coldest months',flueRuns:pl.runs,flue_m:pl.run_m,
  underBed:{k:'birch bark over moss',m:pl.bed_m},pit:'side chamber off the entry',airDuct_m:ch.airDuct,chimney:cm},chamber:ch,fuel:['larch','dung','coal where a node is near']};}
