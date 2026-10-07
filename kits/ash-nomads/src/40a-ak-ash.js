// prefix: ak
// ================================================================= ASH TENT SHAPES: what the Ash Nomads add to the tent kit (40-tk-tentkit.js)
// Peaked tents of every kind (the owner's brief and the ashnomad reference folder): tall concave spires like a cloth pulled
// up by a high mast, petal-lobed great tents, the Ashlander hide dome, ridge tents. Black to grey outside, with ORNATE
// yellow and red patterns: a cross of Nazca line figures (the spiral, the hummingbird, the beetle) and Dunmer key-frets.
// Until the owner's sheets come (patFret, patNazca: 26k-kit.js) the patterns are drawn here, procedurally: frets and figures
// as thin sewn-on geometry on the walls, sawtooth and fret bands as vertex colour on the curved roofs.
//   akMotif(m, cx, y0, y1, hw, col, z)   one figure in the local x-y plane (fret, spiral, bird, beetle, tooth, eye)
//   akBand(L, y, h, col, o)              a band of figures between two edge strips on a flat wall (outer face +z)
//   akBandRing(r, y, h, o)               the same round a circular wall of radius r (gap at the door)
//   akRoofColf(bands, N)                 a lathe colf: black cloth with sawtooth and step bands at given heights (v)
//   akConcave(o)                         a concave spire tent on a round wall; returns roofY(r)
//   akChief(o)                           the great five-spired tent ("nomad chief" massing); returns roofY(r) of the centre
//   akDome(o)                            the Ashlander hide dome on bent ribs
//   akRidge(o)                           a ridge tent with sagging slopes; returns H(x,z)
//   akBanner(x, z, h, o)                 a banner pole: crossbar, a long red banner, a yellow disc (the assembly's)
//   akSunDisc(y, z, R)                   the great sun disc on its frame (no longer the assembly's emblem: kept for whatever wants a sun)
//   akSpire(y, h)                        the bone and gold finial on a mast top
const AK_LIN={};function akC(hex){return AK_LIN[hex]||(AK_LIN[hex]=hc(hex));}
const AK_Y=0xe0b02a,AK_R=0xa8281c,AK_K=0x2a2826,AK_G=0x4e4a45,AK_O=0xc8401e;
/* the blue trim (2026-10-07): the slate blue and cream of the gas giant emblem (the sky's giant), as piping round the bands,
   a line in the roofs, the eaves, the banners' borders and a ring in every finial */
const AK_B=0x6f80a6,AK_BL=0x8a98b8,AK_CR=0xd8cfbb;
/* a thick line segment in the local x-y plane at depth z */
function akSeg(x0,y0,x1,y1,t,col,z){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*t/2,ny=dx/L*t/2;poly('plain',[[x0+nx,y0+ny,z],[x1+nx,y1+ny,z],[x1-nx,y1-ny,z],[x0-nx,y0-ny,z]],col,true);}
function akLine(pts,t,col,z){for(let i=0;i<pts.length-1;i++)akSeg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],t,col,z);}
/* one figure centred at cx between y0 and y1, half-width hw */
function akMotif(m,cx,y0,y1,hw,col,z){const h=y1-y0,t=Math.max(.02,h*.09),X=u=>cx+u*hw,Y=v=>y0+v*h;
 if(m==='fret')akLine([[X(-1),Y(.1)],[X(1),Y(.1)],[X(1),Y(.9)],[X(-.6),Y(.9)],[X(-.6),Y(.4)],[X(.4),Y(.4)],[X(.4),Y(.62)]],t,col,z);   // the Dunmer key
 else if(m==='spiral'){const P_=[];for(let i=0;i<=30;i++){const a=i/30*TAU*2.2,r=.92*(1-i/34);P_.push([X(Math.cos(a)*r),Y(.5+Math.sin(a)*r*.45)]);}akLine(P_,t*.9,col,z);}
 else if(m==='bird'){akLine([[X(-1),Y(.55)],[X(-.15),Y(.5)]],t*.8,col,z);   // the Nazca hummingbird: the long beak, the body, wings, the tail fan
  akLine([[X(-.15),Y(.5)],[X(.35),Y(.45)],[X(.7),Y(.55)]],t*1.3,col,z);for(const s of [-1,1])akLine([[X(.15),Y(.5)],[X(.05),Y(.5+s*.42)],[X(.35),Y(.5+s*.4)],[X(.3),Y(.5)]],t*.8,col,z);
  for(const s of [-1,0,1])akLine([[X(.7),Y(.55)],[X(.98),Y(.55+s*.2)]],t*.7,col,z);}
 else if(m==='beetle'){const B=[];for(let i=0;i<=16;i++){const a=i/16*TAU;B.push([X(Math.cos(a)*.45),Y(.45+Math.sin(a)*.32)]);}akLine(B,t*.9,col,z);akSeg(X(0),Y(.13),X(0),Y(.77),t*.6,col,z);
  for(const s of [-1,1]){akLine([[X(s*.15),Y(.77)],[X(s*.3),Y(.95)],[X(s*.12),Y(.98)]],t*.7,col,z);for(const v of [.3,.45,.6])akSeg(X(s*.42),Y(v),X(s*.8),Y(v-.12),t*.6,col,z);}}
 else if(m==='tooth')poly('plain',[[X(-1),Y(0),z],[X(1),Y(0),z],[X(0),Y(1),z]],col,true);
 else if(m==='eye'){const E=[];for(let i=0;i<=16;i++){const a=i/16*TAU;E.push([X(Math.cos(a)*.9),Y(.5+Math.sin(a)*.3)]);}akLine(E,t*.8,col,z);const D=[];for(let i=0;i<=10;i++){const a=i/10*TAU;D.push([X(Math.cos(a)*.22),Y(.5+Math.sin(a)*.2)]);}akLine(D,t,col,z);}}
/* a band of figures on a flat wall (x from -L/2 to L/2, outer face +z): yellow edge strips, the figures alternating red
   and yellow on a black ground. o: {figs, z, skip(x), bg (false: no ground strip)} */
/* a band of a sheet (patFret 2:1, patNazca 1:1) mapped once top to bottom and repeating along, its aspect kept for any height h:
   the strip from x0 to x1 in the local x-y plane at depth z */
function akSheetStrip(mk,x0,x1,y,h,z){const tl=TILE[mk]||1;
 psurf(mk,(u,v)=>[lerp(x0,x1,u),y+v*h,z],Math.max(1,Math.round((x1-x0)/.4)),1,null,{uvf:(u,v)=>[u*tl,v*tl]});
 for(const yy of [y-.012,y+h+.012])beam('plain',[x0,yy,z+.006],[x1,yy,z+.006],.022,akC(AK_B),true,5);}   /* the blue piping */
/* the sheet round a circular wall of radius r from angle a0 to a1 (the door gap left out), whole repeats of aspect asp */
function akSheetRing(mk,r,y,h,asp,a0,a1){const tl=TILE[mk]||1,L=r*(a1-a0),reps=Math.max(1,Math.round(L/(h*asp)));
 psurf(mk,(u,v)=>{const a=lerp(a0,a1,u);return [Math.cos(a)*r,y+v*h,Math.sin(a)*r];},Math.max(2,Math.round(L/.35)),1,null,{uvf:(u,v)=>[u*reps*tl,v*tl]});
 const n=Math.max(8,Math.round(L/.3));for(const yy of [y-.012,y+h+.012]){const pts=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);pts.push([Math.cos(a)*(r+.008),yy,Math.sin(a)*(r+.008)]);}cord('plain',pts,.022,akC(AK_B));}}   /* the blue piping */
function akBand(L,y,h,o){o=o||{};const z=o.z===undefined?.014:o.z,figs=o.figs||['fret','bird','fret','spiral'],e=Math.max(.025,h*.08),pitch=h*1.25;
 {const mk=o.sheet||'patFret';if(KIT_HAS(mk)){const asp=mk==='patFret'?2:1,n2=Math.max(1,Math.round(L/(h*asp))),step=L/n2;   /* the owner's sheet, whole repeats */
  for(let i=0;i<n2;i++){const x0=-L/2+i*step,x1=x0+step;if(o.skip&&(o.skip(x0+.02)||o.skip(x1-.02)||o.skip((x0+x1)/2)))continue;akSheetStrip(mk,x0,x1,y,h,z);}return;}}
 const ok=x=>!(o.skip&&o.skip(x));const strip=(x0,x1,y0,y1,c,dz)=>poly('plain',[[x0,y0,z+dz],[x1,y0,z+dz],[x1,y1,z+dz],[x0,y1,z+dz]],c,true);
 const n=Math.max(1,Math.floor(L/pitch)),p=L/n;
 for(let i=0;i<n;i++){const x0=-L/2+i*p,x1=x0+p,cx=(x0+x1)/2;if(!ok(cx)||!ok(x0+.02)||!ok(x1-.02))continue;
  if(o.bg!==false)strip(x0,x1,y,y+h,akC(AK_K),-.004);strip(x0,x1,y,y+e,akC(AK_Y),0);strip(x0,x1,y+h-e,y+h,akC(AK_Y),0);
  akMotif(figs[i%figs.length],cx,y+e*1.8,y+h-e*1.8,p*.4,akC(i%2?AK_Y:AK_R),z+.002);}}
/* the band round a circular wall of radius r (outer face out), keeping clear of the door (+z) by `gap` radians */
function akBandRing(r,y,h,o){o=o||{};const figs=o.figs||['fret','bird','fret','spiral','fret','beetle'],pitch=h*1.25,n=Math.max(6,Math.round(TAU*r/pitch)),p=TAU*r/n;
 {const mk=o.sheet||'patFret';if(KIT_HAS(mk)){const g=o.gap||0;akSheetRing(mk,r+.014,y,h,mk==='patFret'?2:1,PI/2+g,PI/2+TAU-g);return;}}   /* the owner's sheet */
 for(let i=0;i<n;i++){const a=(i+.5)/n*TAU;if(o.gap&&tkNearDoor(a,o.gap))continue;
  W(Math.cos(a)*(r+.012),0,Math.sin(a)*(r+.012),Math.atan2(Math.cos(a),Math.sin(a)),()=>{const L=p*1.02,e=Math.max(.025,h*.08);
   poly('plain',[[-L/2,y,-.004],[L/2,y,-.004],[L/2,y+h,-.004],[-L/2,y+h,-.004]],akC(AK_K),true);
   for(const [y0,y1] of [[y,y+e],[y+h-e,y+h]])poly('plain',[[-L/2,y0,0],[L/2,y0,0],[L/2,y1,0],[-L/2,y1,0]],akC(AK_Y),true);
   akMotif(figs[i%figs.length],0,y+e*1.8,y+h-e*1.8,p*.4,akC(i%2?AK_Y:AK_R),.003);});}}
/* a roof's vertex colours: black cloth (cloth k), and at each band [v0, v1, kind] a pattern: 'saw' (red teeth on yellow),
   'step' (a stepped fret in yellow on red), 'line' (a yellow stripe). N teeth round the roof. */
function akRoofColf(bands,N,base){const K=akC(base||AK_K),Yc=akC(AK_Y),Rc=akC(AK_R),O=akC(AK_O);
 return (u,v)=>{for(const b of bands){if(v<b[0]||v>b[1])continue;const t=(v-b[0])/(b[1]-b[0]),f=((u*N)%1+1)%1;
  if(t<.12||t>.88)return Yc;
  if(b[2]==='saw')return (t-.12)/.76<1-Math.abs(2*f-1)?Rc:Yc;
  if(b[2]==='step'){const s=Math.floor(f*4),q=Math.floor((t-.12)/.76*4);return (s===q||s===3-q)?Yc:Rc;}
  if(b[2]==='line')return t<.3||t>.7?Yc:akC(AK_B);}   /* a blue line edged in yellow */
  return K;};}
/* the bone-and-gold finial on a mast */
function akSpire(y,h){h=h||1;cone('brass',0,y,0,.07*h,.7*h,0xc89a3a,8);sph('bone',0,y+.12*h,0,.11*h,0xe2d6bc);for(let k=0;k<3;k++)ring(k===1?'plain':'brass',0,y+.28*h+k*.12*h,0,.06*h*(1-k*.2),k===1?.02:.012,k===1?akC(AK_B):0xc89a3a,0,0,0,10);}
/* ---------------------------------------------------------------- the concave spire tent
   o: R (the wall radius), wallH, peakH, k (the curve: 2 a deep concave sweep), doorW, cover (key), lining, floor, floorCol,
   bands (akRoofColf bands), figs, guys, valance (colour or false), mast (true) */
function akConcave(o){const R=o.R,wH=o.wallH,pH=o.peakH,k=o.k||2.1,dW=o.doorW||1.2,g=(dW/2+.1)/R,A0=PI/2+g,A1=PI/2+TAU-g,seg=Math.max(40,Math.round(R*16));
 const RE=R+.3,roofY=r=>wH+(pH-wH)*Math.pow(1-clamp(r/RE,0,1),k);
 const prof=[];for(let i=0;i<=16;i++){const r=RE*(1-i/16)+.04*i/16;prof.push([r,roofY(r)+(i===0?-.06:0)]);}
 const cov=o.cover||'ashCloth',W1=WHITE;
 lathe(cov,0,0,[[R,0],[R,wH]],seg,P('ash'),{a0:A0,a1:A1});
 akBandRing(R,o.bandY||wH*.42,o.bandH||Math.min(.55,wH*.32),{gap:g+.05,figs:o.figs,sheet:o.bandSheet});
 const bands=o.bands||[[.0,.12,'saw'],[.42,.5,'step'],[.78,.82,'line']];
 lathe(cov,0,0,prof,seg,W1,{colf:akRoofColf(bands,o.teeth||Math.round(seg/3))});
 // the sawtooth bands as sewn-on red teeth (vertex colour alone smears them into a stripe): a row of triangles on the roof
 for(const b of bands){if(b[2]!=='saw')continue;const r0=RE*(1-b[0])+.04*b[0],r1=RE*(1-b[1])+.04*b[1],ra=lerp(r0,r1,.14),rb=lerp(r0,r1,.86),n=Math.max(8,Math.round(TAU*ra/.42));
  const at=(r,a)=>{const lift=.03;return [Math.cos(a)*(r+lift*.3),roofY(r)+lift,Math.sin(a)*(r+lift*.3)];};
  for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;poly('plain',[at(ra,a0),at(ra,a1),at(rb,(a0+a1)/2)],akC(AK_R),true);}}
 if(o.lining!==false)lathe(o.lining||'patEmber',0,0,prof.map(q=>[q[0]-.1,q[1]-.1]).filter(q=>q[0]>.15),seg,null,{inward:true});
 if(o.lining!==false)lathe(o.lining||'patEmber',0,0,[[R-.06,.05],[R-.06,wH-.05]],seg,null,{a0:A0,a1:A1,inward:true});
 if(o.mast!==false){pole('wood',[0,0,0],[0,pH+.15,0],.08,P('woodD'),8);akSpire(pH+.1,o.spire||1);}
 if(o.valance!==false){const vp=[];for(let i=0;i<=72;i++){const a=i/72*TAU;vp.push([Math.cos(a)*(RE+.02),roofY(RE)-.02,Math.sin(a)*(RE+.02)]);}tkValance(vp,.3,'flag',o.valance||P('red'),{per:1.6,tassels:0xe0b02a});cord('plain',vp.map(q=>[q[0]*1.004,q[1]+.02,q[2]*1.004]),.03,akC(AK_B));}   /* the blue eave cord */
 for(let i=0;i<(o.guys||10);i++){const a=(i+.5)/(o.guys||10)*TAU;if(tkNearDoor(a,g+.2))continue;const p=tkAt(RE,a),q=tkAt(RE+1.5,a);tkGuy([p[0],roofY(RE),p[1]],q[0],q[1]);}
 // the door: a pointed arch frame of chitin, the flaps tied back
 W(0,0,R,0,()=>{const pts=[];for(let i=0;i<=12;i++){const t=i/12,a=PI*t;pts.push([-Math.cos(a)*dW/2,Math.min(wH-.05,1.75)*(.72+.28*Math.sin(a))+(t>.5?0:0)]);}
  for(const s of [-1,1])pole('chitin',[s*dW/2,0,.03],[s*dW/2,Math.min(wH-.05,1.75)*.72,.03],.05,P('chitin'),6);
  cord('chitin',pts.map(q=>[q[0],q[1],.03]),.05,P('chitin'));
  for(const s of [-1,1])poly(cov,[[s*dW/2,0,.02],[s*(dW/2+.35),0,.1],[s*dW/2,Math.min(wH,1.7),.02]],P('ash'),true);});
 tkFloor(o.floor||'rug',o.floorCol||(o.floor&&o.floor.startsWith('pat')?null:P('redD')),R-.03);
 door(0,0,R,0,dW);
 return roofY;}
/* ---------------------------------------------------------------- the great five-spired tent ("nomad chief")
   A central spire on a high mast, four lobes round it (each its own concave spire over an arched gable), a round wall under
   all. o: R (the wall), wallH, peakH (the centre), lobeR, lobeH, lobeD (how far out the lobes stand), doorW. */
function akChief(o){const R=o.R,wH=o.wallH,cR=o.cR||R*.55;
 const cY=akConcave({R:cR,wallH:o.drumH||wH+2.2,peakH:o.peakH,k:2.6,doorW:o.doorW,lining:'patEmber',floor:'patKilim',valance:false,guys:0,teeth:48,
  bands:[[.0,.06,'line'],[.3,.38,'saw'],[.62,.68,'step']],figs:['beetle','fret','bird','fret'],spire:1.6,mast:true});
 // the round outer wall with the door gap; the band of figures
 const dW=o.doorW||2.2,g=(dW/2+.1)/R;lathe('ashCloth',0,0,[[R,0],[R,wH]],96,P('ash'),{a0:PI/2+g,a1:PI/2+TAU-g});
 lathe(o.lining||'patEmber',0,0,[[R-.06,.05],[R-.06,wH-.05]],96,null,{a0:PI/2+g,a1:PI/2+TAU-g,inward:true});
 akBandRing(R,o.band==='patNazca'?wH*.2:wH*.45,o.band==='patNazca'?Math.min(2.2,wH*.62):.55,{gap:g+.04,sheet:o.band,figs:['fret','beetle','fret','spiral','fret','bird']});
 // the ring roof from the wall top up to the drum (a shallow concave skirt), between the lobes
 const ringProf=[];for(let i=0;i<=8;i++){const t=i/8;ringProf.push([lerp(R+.3,cR,t),lerp(wH,o.drumH||wH+2.2,Math.pow(t,1.6))]);}
 lathe('ashCloth',0,0,ringProf,96,WHITE,{colf:akRoofColf([[.0,.1,'saw'],[.55,.62,'line']],40)});
 lathe(o.lining||'patEmber',0,0,ringProf.map(q=>[q[0],q[1]-.08]),96,null,{inward:true});
 // the four lobes: each a concave spire standing out over an arched gable, its arch edged in yellow and red
 const lobes=o.lobes||4;for(let i=0;i<lobes;i++){const a=PI/2+PI/lobes+i*TAU/lobes,lx=Math.cos(a)*o.lobeD,lz=Math.sin(a)*o.lobeD;
  W(lx,0,lz,Math.atan2(Math.cos(a),Math.sin(a)),()=>{const lr=o.lobeR,lh=o.lobeH,base=wH-.1;
   const prof=[];for(let k=0;k<=12;k++){const r=lr*(1-k/12)+.03;prof.push([r,base+(lh-base)*Math.pow(k/12,1.9)]);}
   lathe('ashCloth',0,0,prof,40,WHITE,{a0:-PI*.05,a1:PI*1.05,colf:akRoofColf([[.0,.1,'saw'],[.5,.56,'line']],14)});
   lathe('patEmber',0,0,prof.map(q=>[q[0]-.08,q[1]-.06]),40,null,{a0:-PI*.05,a1:PI*1.05,inward:true});
   pole('wood',[0,0,0],[0,lh+.1,0],.06,P('woodD'),7);akSpire(lh+.05,1.1);
   // the gable arch: a pointed arch of cloth over the lobe's face, edged
   const aw=lr*.85,ah=base+.7;const arc=[];for(let k=0;k<=14;k++){const t=k/14,an=PI*t;arc.push([-Math.cos(an)*aw,base*.25+(ah-base*.25)*Math.pow(Math.sin(an),.6),lr*.98]);}
   cord('plain',arc,.06,akC(AK_Y));cord('plain',arc.map(q=>[q[0]*.9,q[1]-.12,q[2]+.01]),.04,akC(AK_R));
   psurf('ashCloth',(u,v)=>{const q=arc[Math.min(14,Math.round(u*14))];return [q[0],lerp(q[1],base+1.1,v),lr*.98-.02];},14,2,P('ash'));});}
 const roofC=r=>r<cR?cY(r):lerp(wH,o.drumH||wH+2.2,Math.pow(clamp((R+.3-r)/(R+.3-cR),0,1),1.6));
 for(let i=0;i<16;i++){const a=(i+.5)/16*TAU;if(tkNearDoor(a,g+.25))continue;const p=tkAt(R+.3,a),q=tkAt(R+2,a);tkGuy([p[0],wH,p[1]],q[0],q[1]);}
 tkFloor('patKilim',null,R-.05);door(0,0,R,0,dW);
 return roofC;}
/* ---------------------------------------------------------------- the Ashlander hide dome on bent ribs
   o: r, h, doorW, col (the hides), ribs */
function akDome(o){const r=o.r,h=o.h,dW=o.doorW||.95,g=(dW/2+.12)/r,A0=PI/2+g,A1=PI/2+TAU-g,sc=new THREE.Color();
 const prof=[];for(let i=0;i<=10;i++){const t=i/10,a=t*PI/2;prof.push([Math.cos(a)*r*(1-.05*t)+.02,Math.sin(a)*h]);}prof[10][0]=.35;
 const base=o.col||P('hide');
 lathe('hide',0,0,prof,44,base,{a0:A0,a1:A1,colf:(u,v)=>{const pa=h3(Math.floor(u*11),Math.floor(v*6),5),soot=smooth(.7,1,v);const k=(pa<.3?.75:pa>.8?1.15:1)*(1-.6*soot);return sc.setRGB(k,k,k);}});
 // the ribs over the hides, a band of figures low on the wall, the smoke hole's ring
 for(let i=0;i<10;i++){const a=A0+(A1-A0)*(i+.5)/10;cord('wood',prof.slice(0,10).map(q=>[Math.cos(a)*(q[0]+.04),q[1]+.02,Math.sin(a)*(q[0]+.04)]),.05,P('woodD'));}
 ring('wood',0,h-.02,0,.38,.06,P('woodD'),0,0,0,16);
 akBandRing(r+.01,.35,.42,{gap:g+.1,figs:['fret','spiral','fret','beetle']});
 W(0,0,r,0,()=>{for(const s of [-1,1])pole('chitin',[s*dW/2,0,.02],[s*dW/2*.7,1.55,.02],.05,P('chitin'),6);beam('chitin',[-dW/2,1.55,.02],[dW/2,1.55,.02],.05,P('chitin'),true,6);
  psurf('hide',(u,v)=>[dW/2-u*.5,1.5-v*1.45,.05+u*.2],3,4,P('hideD'));});
 tkFloor('rug',P('redD'),r-.1);door(0,0,r,0,dW);}
/* ---------------------------------------------------------------- the ridge tent: two sagging slopes on a ridge pole
   o: w (along the ridge, x), d, ridge, eave, cover, bands, open (-1 or 1: that gable left open). Returns H(x,z). */
function akRidge(o){const w2=o.w/2,d2=o.d/2;const H=(x,z)=>{const t=Math.abs(z)/d2;return o.eave+(o.ridge-o.eave)*(1-t)-.18*Math.sin(PI*t)*(1-Math.pow(Math.abs(x)/w2,4));};
 psurf(o.cover||'ashCloth',(u,v)=>{const x=-w2+u*o.w,z=-d2-.1+v*(o.d+.2);return [x,H(x,clamp(z,-d2,d2)),z];},Math.round(o.w*3),12,WHITE,{colf:(u,v)=>{const t=Math.abs(v-.5)*2;
  return akRoofColf(o.bands||[[.82,.94,'saw'],[.4,.46,'line']],Math.round(o.w*3),AK_K)(u,t);}});
 for(const s of [-1,1]){if(o.open===s)continue;poly(o.cover||'ashCloth',[[s*w2,0,-d2],[s*w2,0,d2],[s*w2,o.ridge,0]],P('ash'),true);}
 for(const x of [-w2,w2])pole('wood',[x,0,0],[x,o.ridge+.25,0],.06,P('woodD'),7);beam('wood',[-w2-.2,o.ridge,0],[w2+.2,o.ridge,0],.07,P('woodD'),true,7);
 for(const x of [-w2,w2])W(x,0,0,0,()=>akSpire(o.ridge+.2,.7));
 for(let i=0;i<4;i++){const x=-w2+(i+.5)*o.w/4;for(const s of [-1,1])tkGuy([x,o.eave,s*(d2+.1)],x,s*(d2+1.3));}
 return H;}
/* ---------------------------------------------------------------- a banner pole: a long red banner with the gas giant on it */
function akBanner(x,z,h,o){o=o||{};pole('wood',[x,0,z],[x,h,z],.07,P('woodD'),8);W(x,0,z,o.ry||0,()=>{beam('wood',[-.5,h-.25,0],[.5,h-.25,0],.04,P('woodD'),true,6);akSpire(h,.8);
 for(const s of [-1,1]){cone('bone',s*.5,h-.25,0,.05,.18,0xe2d6bc,6);}
 withCloth(clothHang(o.len||2.6,.04),()=>{psurf('flag',(u,v)=>[-.5+u*1.0,h-.28-v*((o.len||2.6)+.08)-(v>.95?Math.abs(u-.5)*.34:0),.012],3,8,akC(AK_B));   /* the blue border */
  psurf('flag',(u,v)=>[-.42+u*.84,h-.3-v*(o.len||2.6)-(v>.95?Math.abs(u-.5)*.3:0),.022],3,8,P('red'));
  psurf('flag',(u,v)=>[-.42+u*.84,h-.3-v*(o.len||2.6)-(v>.95?Math.abs(u-.5)*.3:0),.002],3,8,P('red'));});   /* red on the back too */
 akGiant(h-1.0,.1,.34);});}   /* the emblem: the ringed giant */
/* ---------------------------------------------------------------- the gas giant (the Ash Nomads' emblem: the ringed giant in their sky)
   standing in the current frame at height y, facing +z, radius R: a black disc in a ring of frets, the banded planet, its
   tilted ring passing behind and in front, four moons. The owner's sheet (medAshGiant) replaces the drawing when it is packed. */
const AK_GIANT=[0x7d8fb0,0xc7c2b6,0x8a98b8,0xdcd4c2,0x6f80a6,0xd8cfbb,0x8896b6,0xc4bdb0,0x7688aa];   /* the giant's own bands, as the Krator sky draws it (81-sky.js) */
function akGiant(y,z,R){W(0,y,z,0,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('plain',0,-.08,0,R,.08,akC(AK_K),48));
 ring('brass',0,0,.02,R,.05*Math.min(1,R),0xc89a3a,0,PI/2,0,48);
 if(KIT_HAS('medAshGiant')){WX(0,0,.03,0,PI/2,0,()=>medallion('medAshGiant',0,0,0,R*2,{round:true}));return;}
 if(R>.6)for(let k=0;k<20;k++){const a=(k+.5)/20*TAU;W(Math.cos(a)*R*.86,Math.sin(a)*R*.86,.01,0,()=>WX(0,0,0,0,0,a-PI/2,()=>akMotif('fret',0,-R*.06,R*.06,R*.1,akC(k%2?AK_Y:AK_R),0)));}
 const pr=R*.48,cw=yy=>Math.sqrt(Math.max(0,pr*pr-yy*yy)),nb=AK_GIANT.length;
 for(let b=0;b<nb;b++){const y0=-pr+b*2*pr/nb,y1=y0+2*pr/nb,pts=[];for(let k=0;k<=6;k++){const yy=lerp(y0,y1,k/6);pts.push([-cw(yy),yy,.04]);}
  for(let k=6;k>=0;k--){const yy=lerp(y0,y1,k/6);pts.push([cw(yy),yy,.04]);}poly('plain',pts,akC(AK_GIANT[b]),true);}
 const ra=R*.84,rb=R*.2,tilt=-.32,th=R*.1,E=(t,rr2)=>{const x=Math.cos(t)*rr2,yy=Math.sin(t)*rr2*rb/ra;return [x*Math.cos(tilt)-yy*Math.sin(tilt),x*Math.sin(tilt)+yy*Math.cos(tilt)];};
 for(const half of [0,1])for(let k=0;k<24;k++){const t0=PI*(half+k/24),t1=PI*(half+(k+1)/24),zz=half?.02:.065;   /* the far half (upper) behind the planet, the near half in front */
  const a=E(t0,ra),b=E(t1,ra),c=E(t1,ra-th),d=E(t0,ra-th);poly('plain',[[a[0],a[1],zz],[b[0],b[1],zz],[c[0],c[1],zz],[d[0],d[1],zz]],akC(k%3?0xd9d1c7:0xbcb4a8),true);}
 for(const [mx,my,mr] of [[-.7,.5,.07],[.64,.56,.05],[.72,-.46,.06],[-.58,-.6,.045]]){const pts=[];for(let k=0;k<12;k++){const a=k/12*TAU;pts.push([R*mx+Math.cos(a)*R*mr,R*my+Math.sin(a)*R*mr,.04]);}poly('plain',pts,akC(0xe2d6bc),true);}});}
/* ---------------------------------------------------------------- the great sun disc on its frame (the assembly's emblem)
   standing in the current frame at height y, facing +z, radius R: rays, rings, the medallion at its heart */
function akSunDisc(y,z,R){W(0,y,z,0,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('plain',0,-.08,0,R,.08,akC(AK_K),48));
 for(let k=0;k<24;k++){const a=k/24*TAU,r0=R*.62,r1=R*(k%2?.9:.98);poly('plain',[[Math.cos(a-.08)*r0,Math.sin(a-.08)*r0,.05],[Math.cos(a+.08)*r0,Math.sin(a+.08)*r0,.05],[Math.cos(a)*r1,Math.sin(a)*r1,.05]],akC(k%2?AK_R:AK_Y),true);}
 ring('brass',0,0,.06,R*.6,.04,0xc89a3a,0,PI/2,0,40);ring('brass',0,0,.06,R,.05,0xc89a3a,0,PI/2,0,48);
 WX(0,0,.07,0,PI/2,0,()=>medallion('medAshSun',0,0,0,R*1.1,{round:true}));});}
