// ================================================================= XANADU — sacred (package X-D)
// The valley's faith builds in the Tibetan manner and gilds it with Xanadu's gold: a white battered base, a red
// upper sanctum under the maroon band, gold roundels, a painted-column portico, a gilded roof pavilion; the Persian
// dome crowns only the Grand Temple. The temple, the monastery on its terrace with the monks' cells below, and the
// Grand Temple of the capital — a tiered white mountain with the red palace on top and three gold roofs round a
// gold dome. All lit (civic). Seeds 30800–30999.

// the row of turning drums along a wall base (the pilgrims' circuit): painted cylinders in a timber rack
function xnXDDrums(x,y,z,ry,w,n){const c=xC(xPick(XPAL.dark));for(const yy of[y+.35,y+1.65]){const a=xnOn(x,yy,z,ry,-w/2,.45),b=xnOn(x,yy,z,ry,w/2,.45);vBeam(a,b,.08,c);}
 for(let i=0;i<n;i++){const u=-w/2+w*(i+.5)/n;const p=loc(x,z,u,.45,ry);vPst('xCol',p[0],y+.5,p[1],.24,1.0,xC(xPick([XPAL.red,XPAL.saffron,XPAL.gold[0]])));vB('xPaint',p[0],y+.85,p[1],.52,.28,.52,ry,xC(XPAL.turquoise));}
 const n2=Math.max(1,Math.round(w/2.2));for(let i=0;i<=n2;i++){const p=loc(x,z,-w/2+w*i/n2,.45,ry);vPst('vPost',p[0],y,p[1],.06,1.8,c);}}
// a sanctum block: whitewash storeys hs on a dressed plinth, then a red upper block (rw x rd, rh high) with the band,
// gold roundels and a corbel eave, a gilt roof on top. Returns {top, red:{x,z,w,d,y}}.
function xnXDSanctum(x,z,w,d,hs,rw,rd,rh,o){o=o||{};const wash=o.wash||xC(xPick(XPAL.wash)),red=o.red||xC(xPick(XPAL.redwall)),tim=xC(xPick(XPAL.dark)),lit=xLit()?'lit':'glass',trim=xC(xPick(XPAL.trim));
 const S=xnStack(x,o.y||0,z,w,d,0,hs,wash,'wash');
 // small trapezoid windows in rows on every face of the white base
 let yy=o.y||0;for(let k=0;k<hs.length;k++){const f=Math.pow(.96,k);const nx=Math.max(2,Math.round(w*f/3)),nz=Math.max(2,Math.round(d*f/3));
  const skip=u=>Math.abs(u)<(o.doorGap||0)||(o.frontSkip||[]).some(r=>u>r[0]&&u<r[1]);
  for(let i=0;i<nx;i++)for(const s of[-1,1]){const u=-w*f/2+w*f*(i+.5)/nx;if(s>0&&k===0&&skip(u))continue;xnTibWin(x+u,yy+hs[k]*.38,z+s*(d*f/2-.06),s>0?0:Math.PI,.8,1.1,lit,trim,{noVal:k>0});}
  for(let j=0;j<nz;j++)for(const s of[-1,1]){const v=-d*f/2+d*f*(j+.5)/nz;xnTibWin(x+s*(w*f/2-.06),yy+hs[k]*.38,z+v,s*Math.PI/2,.8,1.1,lit,trim,{noVal:true});}
  yy+=hs[k];}
 const top1=xnFlatRoof(x,S.y,z,S.w,S.d,0,wash,{parapet:.6,corner:'gold'});
 // the red sanctum on the roof
 const ry0=S.y+.3;const R=xnStack(x,ry0,z,rw,rd,0,[rh],red,'wash');
 const nx=Math.max(2,Math.round(rw/3));for(let i=0;i<nx;i++)for(const s of[-1,1]){const u=-rw/2+rw*(i+.5)/nx;xnTibWin(x+u,ry0+rh*.4,z+s*(rd/2-.06),s>0?0:Math.PI,.85,1.2,lit,xC(XPAL.saffron),{valC:xC(XPAL.saffron)});}
 const rt=xnFlatRoof(x,ry0+rh,z,R.w,R.d,0,red,{band:true,gold:true,eave:true,eaveC:tim,parapet:.5,corner:'gold'});
 const gw=o.gw||Math.min(rw*.55,10),gd=o.gd||Math.min(rd*.55,8);
 if(o.crown==='dome')xnDome(x,rt-.5,z,Math.min(rw,rd)*.32,'G',{drum:1.6,drumItem:'xDrumM',fin:1.4});else xnGiltRoof(x,rt-.5,z,gw,gd,0,{frame:o.frame||1.8,over:1.1});
 return{top:rt,base:S,red:R,ry0};}

// ---------------------------------------------------------------- the temple
function buildXaTemple(G,o){reseed(30801+(o.v|0));const V=xV(o),W=19,D=14,P=1.2;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),red=xC(xPick(V===1?XPAL.ochre:XPAL.redwall));
 vnReg('Temple',0,0,12,P+8.2+3.8+4.5);
 xnWall(0,0,0,W+1.2,P,D+1.2,0,stone,'dressed');vB('vStone',0,P-.14,0,W+1.5,.14,D+1.5,0,stone.clone().multiplyScalar(1.08));
 const K=xnXDSanctum(0,0,W,D,V===2?[4.4,3.8,3.4]:[4.4,3.8],12,8.5,3.8,{y:P,wash,red,doorGap:4.2,crown:V===1?'dome':null});
 // the portico and the great door with its mosaic panels and the sun-and-moon
 xnPortico(0,P,D/2,0,V===2?13:9,3.2,4.2,wash,{band:true,valC:xC(XPAL.saffron)});vnDoor(0,P,D/2+.02,0,2.2,3.0,'xPaint',xC(XPAL.red),xC(xPick(XPAL.dark)),false);
 for(const s of[-1,1])xnMural('xMosA',s*3.1,P+.6,D/2+.02,0,1.6,2.4);xnRoundel(0,P+3.55,D/2+.02,0,.9);
 xnFlight(0,0,D/2+3.2+2.4,0,5,P,'vStone',stone);
 // the drums along the base, shrines flanking the stair, pennant lines from the roof corners
 for(const s of[-1,1])xnXDDrums(s*(W/2*.5+.5),P,D/2+.02,0,W/2-6,5);if(V===2)for(const s of[-1,1])xnXDDrums(s*(W/2+.02),P,0,s*Math.PI/2,D-3,6);
 for(const s of[-1,1])xnShrine(s*8.5,0,D/2+5,1.1);
 for(const s of[-1,1]){xnPennants([s*(K.base.w/2-.5),K.top+.4,K.base.d/2-.5],[s*(W/2+7),3,D/2+8],11);vPst('vPost',s*(W/2+7),0,D/2+8,.06,3,xC(0x5a4632));}
 if(xLit())for(const s of[-1,1])vnLampPost(s*4.5,0,D/2+6.5,3.4);
 vnFolk(0,D/2+8,4,3);}
// ---------------------------------------------------------------- the monastery on its terrace
function buildXaMonastery(G,o){reseed(30811+(o.v|0));const V=xV(o),T=4.5,TW=44,TD=26,TZ=-8;
 const rub=xC(xPick(XPAL.rubble)),stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.dark)),lit=xLit()?'lit':'glass';
 vnReg('Monastery — assembly hall',0,TZ,12,T+15);vnReg('Monastery — cells',0,10,16,8);vnReg('Monastery — gate',0,20,4,7);
 // the terrace and its great stair; the hall on top
 xnTerrace(0,0,TZ,TW,TD,0,T,rub);xnFlight(0,0,TZ+TD/2+9.2,0,6,T,'vStone',stone);for(const s of[-1,1])vB('xRubB',s*3.4,0,TZ+TD/2+4.6,.7,T*.55+1,9.2,0,rub);
 const K=xnXDSanctum(0,TZ-2,16,12,[4.2,3.6],10,7.5,3.6,{y:T,wash,red,doorGap:3.6,crown:V===2?'dome':null});
 xnPortico(0,T,TZ-2+6,0,7,3,4,wash,{band:true,valC:xC(XPAL.saffron)});vnDoor(0,T,TZ-2+6.02,0,2,2.8,'xPaint',xC(XPAL.red),tim,false);xnRoundel(0,T+3.3,TZ-2+6.02,0,.8);
 for(const s of[-1,1])xnShrine(s*12,T,TZ+6,1.0);xnShrine(0,T,TZ-12,1.4);
 // the monks' cells: two long low blocks flanking the court below the terrace, one door and window per cell
 if(V===1)xnShrine(13.5,0,10,2.6);
 for(const s of(V===1?[-1]:[-1,1])){const X=s*13.5,Z=10,W=13,D=7;const S=xnStack(X,0,Z,W,D,0,V===2?[2.8,2.6,2.4]:[2.8,2.6],wash,'wash');
  for(let k=0;k<3;k++){const v=-D/2+D*(k+.5)/3,fx=X-s*W/2;vnDoor(fx,0,Z+v-.9,-s*Math.PI/2,.8,1.8,'vWood',tim,tim,true);xnTibWin(fx,1.1,Z+v+.9,-s*Math.PI/2,.6,.8,lit,trim,{noVal:true});}   // cells open on the court
  for(let k=0;k<6;k++){const u=-W/2+W*(k+.5)/6;xnTibWin(X+u,3.9,Z+D/2*.96-.04,0,.7,.9,lit,trim);xnTibWin(X+u,3.9,Z-D/2*.96+.04,Math.PI,.7,.9,lit,trim,{noVal:true});}
  xnFlatRoof(X,S.y,Z,S.w,S.d,0,wash,{eave:true,eaveC:tim,parapet:.6,corner:'pinnacle'});}
 // the gate house with a small iwan (v2: an open arcade instead), the court between the cells with a stupa and a well
 if(V===2){xnArcade(0,0,21.6,0,12,3.4,5,'xArchW',wash,.8,{open:true});vB('xTilesB',0,3.6,21.6,12.4,.2,1.2,0,xC(xPick(XPAL.tile)));}
 else{xnWall(0,0,20,9,5,4,0,wash,'wash');xnIwan(0,0,22,0,4.4,4.6,.7,wash,{guldasta:true});xnFlatRoof(0,5,20,8.6,3.8,0,wash,{parapet:.5,corner:'gold'});}
 for(const s of[-1,1]){vB('xWashB',s*(4.5+3.5),0,21.5,7,2.6,.6,0,wash);vB('xTilesB',s*8,2.6,21.5,7.3,.2,.9,0,xC(xPick(XPAL.tile)));}
 xnPave(0,11,12,14,0,stone,2.2);xnShrine(0,0,8,1.6);vPst('vPostS',-3.5,0,15,.8,.8,rub);vB('vDarkB',-3.5,.8,15,1,.03,1,0);xnTree(4,15,4.5);
 // pennant lines everywhere, the pilgrims' drums along the terrace wall
 for(const s of[-1,1]){xnPennants([s*(K.base.w/2-.4),K.top+.4,TZ-2+K.base.d/2],[s*20,T+3,TZ+TD/2-.5],12);vPst('vPost',s*20,T,TZ+TD/2-.5,.06,3,xC(0x5a4632));
  xnPennants([s*20,T+3,TZ+TD/2-.5],[s*17,7,10-3.5],9);}
 xnXDDrums(-11,0,TZ+TD/2+.02,0,14,7);xnXDDrums(11,0,TZ+TD/2+.02,0,14,7);
 if(xLit()){for(const s of[-1,1])vnLampPost(s*4.2,T,TZ+TD/2-1.5,3.2);}
 vnFolk(0,17,3,2.5);xnFolk(0,T,TZ+8,3,3);}
// ---------------------------------------------------------------- the Grand Temple of the capital
// A podium (the lower town's height) carries a forecourt; the great stair climbs its front; the tiered white
// sanctum with the red palace and the gold dome stands at the back of the podium.
function buildXaGrandTemple(G,o){reseed(30821+(o.v|0));const V=xV(o),W=44,D=26,SZ=-6,PH=6,P=1.2,Y0=PH+P;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),tim=xC(xPick(XPAL.dark)),gold=xC(xPick(XPAL.gold)),tile=xC(xPick(XPAL.tile));
 vnReg('Grand Temple',0,SZ,25,Y0+15+8+12);vnReg('Grand Temple — forecourt',0,14,12,3);vnReg('Grand Temple — great stair',0,26,5,7);
 // the podium: a battered dressed-stone mass, the forecourt on it in front of the sanctum, drums and murals on its face
 const PW=W+8,PD=D+16,PZ=SZ+3;xnWall(0,0,PZ,PW,PH,PD,0,stone,'dressed');vB('vStone',0,PH-.14,PZ,PW*.96+.3,.14,PD*.96+.3,0,stone.clone().multiplyScalar(1.08));
 const pf=PZ+PD/2*.99;for(const s of[-1,1]){xnXDDrums(s*(PW/4+1),0,pf+.02,0,PW/2-9,8);xnMural('xMosA',s*(PW/2*.96-4),1.2,pf+.02,0,3.2,3.2);}
 // the great stair up the podium front between parapets, shrines at its foot
 {const run=Math.max(2,Math.round(PH/.17))*.34;xnFlight(0,0,pf+run+.1,0,8,PH,'vStone',stone);
  for(const s of[-1,1]){vB('vStone',s*4.4,0,pf+run/2+.1,.8,PH*.5+.6,run,0,stone);xnShrine(s*6.6,0,pf+run+2.6,1.4);xnCypress(s*10,pf+run+1,7);}}
 // the sanctum: plinth, three white storeys, the red palace, the gilt roof — on the podium
 xnWall(0,PH,SZ,W+2,P,D+2,0,stone,'dressed');vB('vStone',0,Y0-.14,SZ,W+2.4,.14,D+2.4,0,stone.clone().multiplyScalar(1.08));
 const K=xnXDSanctum(0,SZ,W,D,V===2?[5.4,4.8,4.4,4.0]:[5.4,4.8,4.4],24,15,4.6,{y:Y0,wash,red:V===1?xC(xPick(XPAL.ochre)):red,doorGap:4.5,frontSkip:[[-17.5,-10.5],[10.5,17.5]],gw:V===2?16:12,gd:V===2?11:9,frame:2.2});
 const zf=SZ+D/2*.995;xnPortico(0,Y0,zf,0,9,3.2,4.4,wash,{band:true,valC:xC(XPAL.saffron)});vnDoor(0,Y0,zf+.02,0,2.4,3.2,'xPaint',xC(XPAL.red),tim,false);xnRoundel(0,Y0+3.8,zf+.02,0,1.0);
 for(const s of[-1,1])xnIwan(s*14,Y0,zf,0,6,8.5,1.2,wash,{guldasta:true});
 for(const s of[-1,1])xnXDDrums(s*8,Y0,zf+.02,0,6,4);
 xnFlight(0,PH,zf+3.2+2.6,0,W-6,P,'vStone',stone);
 // the crown: the gold dome over the red palace, two lesser gilt roofs, tiled bulbs on the corner turrets
 if(V!==2)xnDome(0,K.top-.5,SZ-1,5.2,V===1?'T':'G',{drum:3.2,drumItem:'xDrumM',drumC:null,fin:2.4});
 if(V===1)for(const s of[-1,1])xnDome(s*8.5,K.top-.5,SZ-3,2.6,'T',{drum:1.4,fin:1.2});else for(const s of[-1,1])xnGiltRoof(s*8.5,K.top-.5,SZ-3,V===2?6:5,V===2?4.8:4,0,{frame:1.6,over:.9});
 for(const s of[-1,1]){const tx=s*(K.base.w/2-3.2),tz=SZ-K.base.d/2+3.2;xnWall(tx,K.base.y+.3,tz,4.2,4,4.2,0,wash,'wash');kput('xBulbT',[tx,K.base.y+4.4,tz],null,[2.2,2.6,2.2],tile);vBall('xGold',tx,K.base.y+7.2,tz,.2,gold);}
 // the forecourt on the podium: paving, a fountain, flag poles, lamps; pennant lines down to the stair foot
 const CZ=zf+6;xnPave(0,CZ+.5,30,8,0,stone,2.4);xnFountain(0,PH,CZ+.5,2.6,stone);
 for(const s of[-1,1]){xnFlagpole(s*7,PH,CZ+3,7,xC(XPAL.saffron));xnShrine(s*16,PH,CZ,1.2);}
 for(const s of[-1,1]){xnPennants([s*(K.base.w/2-.5),K.top+.4,SZ+K.base.d/2],[s*13,PH+4.5,CZ+3.5],14);vPst('vPost',s*13,PH,CZ+3.5,.07,4.5,xC(0x5a4632));}
 if(xLit())for(const s of[-1,1]){vnLampPost(s*4,PH,CZ+3.6,3.6);vnLampPost(s*5.4,0,pf+13.5,3.6);}
 xnFolk(0,PH,CZ+2,5,4);vnFolk(0,pf+14.5,4,3);}

const XTAG_SAC=(more)=>({type:['religious'].concat(more||[]),wealth:'civic',lit:true});
XA.def({key:'xa_temple',name:'Temple',family:'Sacred',tags:XTAG_SAC(),w:34,d:32,h:19,build:buildXaTemple});
XA.def({key:'xa_monastery',name:'Monastery',family:'Sacred',tags:XTAG_SAC(['multi-family dwelling']),w:50,d:50,h:22,fw:44,fd:44,build:buildXaMonastery});
XA.def({key:'xa_grand_temple',name:'Grand Temple',family:'Sacred',tags:XTAG_SAC(['civic']),w:60,d:64,h:42,fw:52,fd:42,build:buildXaGrandTemple});
