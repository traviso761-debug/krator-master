// ================================================================= HOST — station 6, the Tiguantin cloud-terraces: the SITE and the land's own forms (read by station 2's 45-host-stage.js, the base)
// PLAN-STATIONS.md, "Showcase Station #6" (Gemini's 5.1 geology, openworld/GEOLOGY-STATIONS-5.1.md station 6). Scale model 5.1 px 1138,858: the
// exact spot of tube_lesser_06 ("Lesser Throne Buried Archive Tube") and its cavern cav_monks_archive ("Entombed First Monastery Lava-Tube Vaults",
// 140 x 90 x 22 m; LORE.md 6.15), on the Lesser Throne's cloud-belt shoulder (region rmucd8b2jn3d6) at about +2,480 m, 1.17 atm, Cfb/Cwb. HEIGHTS ARE
// THE REAL ONES here (2,320-2,680 m: the plan's bench window), not station 1's page scale; nothing in the kit reads an absolute height but the sky's air.
// THE LAND (x east, z south; s runs down-axis to the SE, up the shoulder; t across it to the NE: the base's axes):
//   THE OLD VALLEY   the shoulder's ramp (+5.5% to the SE) cut by an old valley along the stream (34 m deep, 100 m wide: the base's valley, SITE.stream
//                    Vd/Wv), its SW flank the TIGUANTIN TERRACES: drystone cloud-terraces on carbonate-shelf spring benches, a 3 m riser each, four
//                    walls below a bench at the contact
//   THE SHEET        the Lesser Throne's burial: a 36 m sheet over the ramp (outland-tuff welded ignimbrite on a baked red paleosol, then tibasalt
//                    pahoehoe), upslope of a lobate front (TIG.edge) across the map; a flat-ish top, its pahoehoe hummocked
//   THE GULLY        the stream re-cut the old valley through the sheet: the fill is gone within G of its axis, the walls a cliff of tuff and basalt
//                    whose foot stands on the highest exhumed terrace (the contact, TIG.C: the red paleosol line), so the KSTRATA stack's contacts
//                    are planes dipping with the ramp and every exposure in the walls reads the same column
//   THE SPUR         a megabreccia ridge of the Inner Wall's slump blocks on the NE side, standing above the sheet (the camera's spur)
//   THE TUBE         tube_lesser_06 in the tibasalt, ESE (the scale model's line), the archive vault on it, a 16 m skylight through its roof
// The base's baseH (a function declaration in stations/montane/45-host-stage.js, so hoisted) offers no shaping hook: this station wraps it at the end
// of this file, before the stage runs, so the stream, the fields and terrainH all see the shaped land. No byte of the base changes (KNOWN_ISSUES.md:
// a SITE.shape hook in the base is the clean form, owed at the next rebuild of stations 2-4).
const TIG=(function(){const F=BIO.fn,sm=F.smooth,cl=F.clamp,R=Math.SQRT1_2;
 const T={ramp0:2480,rampK:.055,vd:34,wv:100,G:78,bench:8,cw:13,sheet:36,riser:3.0,nTer:4};
 T.ramp=s=>T.ramp0+T.rampK*s;
 T.sOf=(x,z)=>(x+z)*R;T.tOf=(x,z)=>(x-z)*R;T.xzOf=(s,t)=>[(s+t)*R,(s-t)*R];
 T.C=s=>T.ramp(s)-T.vd*Math.exp(-((T.G-T.bench)**2)/(T.wv*T.wv));   // the contact: the top exhumed tread (a bench 8 m wide at the cliff's foot), the paleosol's base
 T.edge=t=>-950+110*Math.sin(t*.0021+.4)+40*Math.sin(t*.0067+1.3);   // the sheet's lobate front (s), across the whole map
 T.WIN={s0:-380,s1:420,t0:-330,t1:260};                         // the terraces' reach along and across (s, t): the station's showcase stretch
 return T;})();
const SITE={
 name:'The Tiguantin cloud-terraces (station 6)',R:2400,breccia:false,
 ramp:s=>TIG.ramp(s),
 farNW:d=>-d*.07-260*smooth(0,9000,d),farSE:d=>d*.14+900*smooth(1500,14000,d),   /* down to the Ring Sea's cauldron, up the Lesser Throne */
 relief:{spur:[0,0],swell:0,grain:0},   /* the relief is this file's own (TIG.shape), kept off the gully so the contacts stay planes */
 domes:[],
 knolls:[{x:TIG.xzOf(-120,135)[0],z:TIG.xzOf(-120,135)[1],R:95,h:80},{x:TIG.xzOf(-300,200)[0],z:TIG.xzOf(-300,200)[1],R:90,h:50}],   /* the megabreccia spur, two humps: its crest on the gully's NE lip, clear of the terraces' flank */
 // a carbonate ledge far down the shoulder: the stream plunges over it toward the Ring Sea trough
 scarps:[{s0:-1650,amp:28,a:90,f:.0016,ph:.3,seed:76}],
 stream:{name:'The gully stream',src:3150,end:-3300,t0:0,a1:24,f1:.0016,p1:.6,a2:8,f2:.0041,p2:1.1,halfW:[1.0,2.6],dep:[.3,.6],Wv:[100,0],Vd:[34,0]},
 tarn:{name:'The spring pool at the gully head',r:14,depth:2.2,gradient:{centre:0x1c2c2a,rim:0x4a6052,power:1.5}},
 // the cloud forest: the montane band (cold .3-.45) and wet through (fog-drip: wet .75-.95), the mist highest on the sheet's top and in the gully
 climate:F=>({cold:.33+.1*smooth(2380,2640,F.h)+.04*F.n2-.03*Math.max(0,F.north),
  wet:.78+.12*F.valley+.1*F.flow+.06*F.n1,rock:Math.max(smooth(.7,1.25,F.slope),.0),
  mist:.45+.3*smooth(2440,2540,F.h)+.25*F.valley}),
 // the station's own fields: TERRACE (the exhumed treads), CLIFF (the gully's walls and the sheet's front), SHEET (on the sheet's top), SPUR (the
 // megabreccia above the sheet), KEEP (the skylight and the monks' winch camp: kept clear), SPRING (the contact springs' wet band at the cliff foot)
 extra:{names:['terrace','cliff','sheet','spur','keep','spring'],at:(F,c)=>TIG.zone(F.x,F.z,F.h)},
 spine:[[-150,210],[60,-150],[200,-60],[-900,0],[1600,0],[-2200,-200]]};
SITE.sky={px:1138,py:858,pressure:1.17,humidity:.82,clouds:{cover:.55,cumulus:.45,cirrus:.25}};
(function(T){const F=BIO.fn,sm=F.smooth,cl=F.clamp,fbm=F.fbm,ST=SITE.stream;
 T.TS=s=>ST.t0+ST.a1*Math.sin(s*ST.f1+ST.p1)+ST.a2*Math.sin(s*ST.f2+ST.p2);
 T.dv=(x,z)=>T.tOf(x,z)-T.TS(T.sOf(x,z));
 // the terraces' window: 1 in the showcase stretch, fading over 60 m
 T.win=(s,t)=>sm(T.WIN.s0,T.WIN.s0+60,s)*sm(T.WIN.s1,T.WIN.s1-60,s)*sm(T.WIN.t0,T.WIN.t0+60,t)*sm(T.WIN.t1,T.WIN.t1-60,t);
 // the old flank's distance from the axis at a height (the base's valley inverted: h = ramp - vd exp(-(dv/wv)^2))
 T.dvAt=(s,h)=>{const k=(T.ramp(s)-h)/T.vd;return k>=1?0:k<=1e-6?1e9:T.wv*Math.sqrt(-Math.log(k));};
 // the sheet's region: inside when d > 0 (outside the gully and upslope of the front), and its cliff profile (steep, a talus toe, a rounded lip)
 T.d=(x,z)=>{const s=T.sOf(x,z),t=T.tOf(x,z);return Math.min(Math.abs(t-T.TS(s))-T.G,s-T.edge(t));};
 T.prof=d=>d<=0?0:sm(0,T.cw,d)*.93+.07*sm(0,T.cw*.35,d);
 T.top=(x,z)=>{const s=T.sOf(x,z);return T.ramp(s)+T.sheet+1.4*(fbm(x*.021+3,z*.021-7,6611,2)-.5)+2.6*(fbm(x*.0052-2,z*.0052+9,6612,2)-.5);};   /* pahoehoe hummocks */
 // the relief away from the gully (the forms the base's relief would make, but kept off the exposures)
 T.rel=(x,z,dvv)=>sm(240,460,Math.abs(dvv))*(26*(fbm(x*.0011+7,z*.0011-5,6613,3)-.5)+6*(fbm(x*.0048-1,z*.0048+4,6614,2)-.5));
 // the terraces: the SW flank between the stream's banks and the contact, quantized to treads (a 3 m riser over the last 22% of each step); above
 // the contact the bench, flat at C under the cliff's foot (the tread the tuff ran over)
 T.terraceK=(s,t,dvv)=>dvv<0?T.win(s,t)*sm(-16,-28,dvv):0;
 T.quant=(h,C)=>{const u=(h-C)/T.riser;if(u>=0||u<-T.nTer-.2)return h;const k=Math.floor(u),f=u-k;return C+T.riser*(k+sm(.78,1,f));};
 T.shape=(x,z,h0)=>{const s=T.sOf(x,z),t=T.tOf(x,z),dvv=t-T.TS(s),C=T.C(s);
  let h=h0+T.rel(x,z,dvv);
  const tk=T.terraceK(s,t,dvv);if(tk>0)h=F.mix(h,h>=C?C:T.quant(h,C),tk);
  const d=Math.min(Math.abs(dvv)-T.G,s-T.edge(t));
  if(d>0){const hs=T.top(x,z);h=Math.max(h,h+(hs-h)*T.prof(d));}
  return h;};
 // ---- the tube and its archive (scale model 5.1 tubes.json: tube_lesser_06 runs ESE, 15 x 10 m, depth_m 65; cav_monks_archive 140 x 90 x 22 m)
 // The vault on the tube's line under the sheet SW of the gully; the tube in the tibasalt, its floor eroded a little into the tuff (ramp + 3.5).
 // The skylight: the roof fallen through where it is thinnest, on the vault's side nearest the gully (KNOWN_ISSUES.md: the map's depth_m 65 is
 // read as the tube's run under the Lesser Throne's flank; here, at its skylight, the roof is ~9 m)
 const dir=[18,9.5],dl=Math.hypot(dir[0],dir[1]);T.D=[dir[0]/dl,dir[1]/dl];
 {const v=T.xzOf(110,-150);T.V={x:v[0],z:v[1]};T.V.floor=T.ramp(T.sOf(T.V.x,T.V.z))+3.5;}
 T.VAULT={id:'cav_monks_archive',name:'Entombed First Monastery Lava-Tube Vaults',rx:70,rz:45,h:22};
 {const n=[-T.D[1],T.D[0]],q=[T.V.x+n[0]*-24-T.D[0]*30,T.V.z+n[1]*-24-T.D[1]*30];   /* toward the gully (NE of the vault's axis) and toward its NW end */
  T.SKY={id:'tiguantin-skylight',x:q[0],z:q[1],r:8,rim:3,name:'The skylight (a 16 m collapse through the tibasalt roof of tube_lesser_06)'};}
 T.TUBE={id:'tube_lesser_06',name:'Lesser Throne Buried Archive Tube',w:15,h:10,from:-300,to:150};
 // the winch camp round the skylight's lip, and its keep-clear
 T.keep=(x,z)=>sm(T.SKY.r+34,T.SKY.r+16,Math.hypot(x-T.SKY.x,z-T.SKY.z));
 // the spur's own rise (the base's knolls, as its baseH adds them): the megabreccia wherever it stands proud of the old surface
 T.knollH=(x,z)=>{let k=0;for(const K of SITE.knolls){const r=Math.hypot(x-K.x,z-K.z)/K.R;if(r<1.6)k+=K.h*Math.exp(-r*r*2.2);}return k;};
 // the station's fields (SITE.extra): terrace treads, cliffs, the sheet's top, the spur above the sheet, the camp, the springs at the contact
 T.zone=(x,z,h)=>{const s=T.sOf(x,z),t=T.tOf(x,z),dvv=t-T.TS(s),d=Math.min(Math.abs(dvv)-T.G,s-T.edge(t)),tk=T.terraceK(s,t,dvv);
  const C=T.C(s),top=T.ramp(s)+T.sheet;
  return{terrace:tk*sm(T.G+2,T.G-4,Math.abs(dvv))*sm(C-T.riser*T.nTer-2,C-T.riser*T.nTer+1,h),cliff:d>0?sm(0,2,d)*sm(T.cw+3,T.cw-1,d):0,sheet:d>0?sm(T.cw-2,T.cw+6,d):0,
   spur:sm(10,24,T.knollH(x,z)),keep:T.keep(x,z),spring:dvv<0?T.win(s,t)*sm(T.G-9,T.G-2,Math.abs(dvv))*sm(T.G+2,T.G,Math.abs(dvv)):0};};
 // ---- THE ROCK: the KSTRATA stack (core/terrain/35-core-strata.js; STRATA-PLAN.md section 11) with its contacts dipping with the ramp (beds rise
 // .055 per metre to the SE: KSTRATA's yy = y + slope (x dx + z dz), so the slope is negative), placed so the paleosol's base is TIG.C (yy = ramp0 - 18.5)
 const C0=T.C(0);
 T.STACK={seed:61138,range:[2000,3000],dip:[Math.SQRT1_2,Math.SQRT1_2,-T.rampK],warp:[1.1,.35],warpF:[.012,.05],formations:[
  {recipe:'megabreccia',top:C0-26},{recipe:'carbonate-shelf',top:C0},{recipe:'tig-paleosol',th:1.5},{recipe:'tig-ignimbrite',th:22},{recipe:'tibasalt'}]};
 T.ZONES={paleosol:C0,tuff:C0+1.5,basalt:C0+23.5};   /* the contacts at s = 0 (yy) */
 // the page recipes (KSTRATA.add, as station 1's crag breccia): the baked red paleosol at the terrace contact, and the welded tuff with its fiamme
 if(typeof KSTRATA!=='undefined'){
  if(!KSTRATA.RECIPES['tig-paleosol'])KSTRATA.add({name:'tig-paleosol',main:'bole',kinds:{
   bole:{p:.62,th:[.3,.8],col:[0xa4422a,0xb04c30,0x983c26],hard:.25,xbed:0,varnish:.1},
   baked:{p:.26,th:[.15,.45],col:[0x7a2a1c,0x862f1e,0x6e2618],hard:.4,xbed:0,varnish:.15},
   root:{p:.12,th:[.05,.2],col:[0xc8a68a,0xd2b294],hard:.2,xbed:0,varnish:0,between:true}},fx:{varnish:.2}});
  if(!KSTRATA.RECIPES['tig-ignimbrite']){const B=KSTRATA.recipe('outland-tuff'),K=Object.assign({},B.kinds);
   K.fiamme={p:.1,th:[.08,.3],col:[0x2a2622,0x34302a,0x221e1c],hard:.6,xbed:0,varnish:.3,between:true};   /* black glass lenses, flattened in the welding */
   K.welded=Object.assign({},K.welded,{p:.26});
   KSTRATA.add(Object.assign({},B,{name:'tig-ignimbrite',kinds:K}));}}
})(TIG);
// the land's forms, before the base's stage runs (see the header): the base's baseH is a hoisted declaration, wrapped here
baseH=(function(b0){return function(x,z){return TIG.shape(x,z,b0(x,z));};})(baseH);
