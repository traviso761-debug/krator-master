// prefix: res
// ================================================================= THE MINED GOODS' NODES (2): the gems, rock crystal, opal, diamond, jade, amber
// The kinds are 42s-res-ore-mined.js (Gemini's trade model, 2026-11-16). Emeralds and turquoise are the Coyote Men kit's
// (kits/coyote). The crystals, the opal's flash, the garnets, the jade's sawn face and the amber are the engine's glass key
// (translucent); rock.opal.matrix, rock.serpentinite, stone.nephrite and rock.amber.blueearth are owed (core/materials/
// PROMPTS-NEEDED.md sections 46, 52 and 53), vertex colours until they come.
//   quartz      a reef of white vein-quartz blocks along a strike, druzy pockets in their faces with clear hexagonal points
//               growing out of them, a cluster at the foot (High Rift's and Singing Gjar's optical quartz)
//   opal        Opal Valley's boulder opal: an outcrop of rust ironstone and a dark basalt dike (the Rift Black Opal's host,
//               biomes/opalvalley/PLAN.md section 2), milky potch seams with precious opal flashing blue, green, orange and
//               violet in them, the diggers' pale mullock heap before it
//   diamond     the Korona Hoar-Table's paleoplacer: a stepped bench of pale quartzite conglomerate, its pebbles standing proud
//               of the face, the washed gravel heaped before it with garnets and a few diamond glints, a rocker cradle
//   jade        a serpentinite contact (the Arch): a low green-black outcrop with white magnesite veinlets and a jade lens,
//               a stream below it with jade boulders rounded by the water, one sawn open to show the stone (pounamu)
//   amber       a cut bank: blue-grey glauconitic clay (the blue earth) under a lignite band and sand, amber nodules in the
//               face, the dug clay heaped before it with amber picked from it
RES_LOOK.quartz={vein:[0xf0eee8,0xe4e0d8,0xf6f4f0],lump:0xe8e2ea,pile:0xf4f6f8};
RES_LOOK.opal={vein:[0x2e8ac8,0x3ac88a,0xe86a2a,0x8a4ad8],lump:0xd8d4cc,pile:0xe4dfd4,host:[0x9a5a2e,0x7e4a26,0x2e2c30]};
RES_LOOK.diamond={vein:[0xd8c8c0,0xc8b4aa,0xe0d6cc],lump:0xf4f8fc,pile:0x9a8a7a,garnet:0x8a1e22};
RES_LOOK.jade={vein:[0x2a4a30,0x34583a,0x24402a],lump:0x5a9a5e,pile:0x4a5a48,host:[0x1e2a22,0x2c3a2e,0x3e5040]};
RES_LOOK.amber={vein:[0xc87a1e,0xb8661a,0xd8962e],lump:0x6a7a80,pile:0x5a646a,lignite:0x2a2420};
/* a cluster of quartz points: hexagonal prisms with their tips, leaning every way, in the frame it is drawn in (up is out) */
function resCrystals(n,s,col){for(let k=0;k<n;k++){const h=rr(.5,1)*s,r=h*rr(.12,.2);
 WX(rr(-.3,.3)*s,0,rr(-.3,.3)*s,rr(0,TAU),rr(-.5,.5),rr(-.5,.5),()=>{cyl('glass',0,0,0,r,h*.75,col,6);cone('glass',0,h*.75,0,r,h*.25,col,6);});}}
function resQuartz(S,rich){const L=RES_LOOK.quartz,qk=resK('quartz','stone'),dk=resK('druze','plain'),n=4+rich*2,strike=rr(0,PI);
 for(let i=0;i<n;i++){const t=n<2?0:i/(n-1)-.5,x=Math.cos(strike)*t*S*.75,z=Math.sin(strike)*t*S*.75,bw=rr(.2,.3)*S,bd=rr(.16,.24)*S,bh=(.42-Math.abs(t)*.4)*S*rr(.8,1.05);
  WX(x,-bh*.15,z,strike+rr(-.2,.2),rr(-.12,.12),rr(-.15,.15),()=>{box(qk,0,0,0,bw,bh,bd,resC(qk,L.vein[i%3]));
   if(i%2===0||rich===2){const side=i%4<2?1:-1,py=bh*rr(.35,.6);
    box(dk,0,py,side*(bd/2+.004),bw*.5,bh*.25,.012,resC(dk,L.lump));
    W(0,py+bh*.08,side*(bd/2+.01),0,()=>WX(0,0,0,0,side*1.2,0,()=>resCrystals(3+rich*3,.07*S*(1+rich*.3),L.pile)));}});}
 if(rich)W(rr(-.2,.2)*S,0,S*.45,0,()=>resCrystals(3+rich*3,.1*S,L.pile));
 resLoose(S,rich*6,[L.vein[0],L.vein[2]],'plain');}
function resOpal(S,rich){const L=RES_LOOK.opal;
 resOutcrop(S*.95,rich,(i,bw,bh,bd)=>{const nb=1+rich;for(let k=0;k<nb;k++){const side=k%2?1:-1,y=bh*rr(.2,.75),th=.02*S*(1+rich*.3);
   box('plain',0,y,side*(bd/2+.006),bw*rr(.6,.95),th,.012,L.lump);
   for(let f=0;f<2+rich*3;f++){const q=rr(.01,.024)*S;box('glass',rr(-.42,.42)*bw,y+th*rr(.1,.7),side*(bd/2+.014),q*1.6,q*.7,.008,L.vein[(i+f)%4]);}}},
  {col:i=>L.host[i%3]});
 const mr=(.16+.05*rich)*S;cone('earth',S*.05,0,S*.55,mr,mr*.6,L.pile,10);
 resLoose(S,3+rich*5,[L.lump,L.pile,L.vein[0]],'plain');}
function resDiamond(S,rich){const L=RES_LOOK.diamond,tk=resK('tepui','stone'),steps=2+rich,W0=S*1.05,D0=S*.3;
 W(0,0,0,rr(-.3,.3),()=>{
  for(let s=0;s<steps;s++){const h=S*(.1+.02*rich),y=s*h,back=-S*.1-s*D0*.6,sw=W0*(1-s*.15);
   box(tk,0,y,back,sw,h,D0,resC(tk,L.vein[s%3]));
   for(let p=0;p<4+rich*3;p++)sph('stone',rr(-.45,.45)*sw,y+h*rr(.25,.75),back+D0/2,rr(.012,.03)*S,pick([0x9a948a,0x6a6460,0xc8c0b0,0x8a5a4a]),.8,6);}
  const gr=(.14+.05*rich)*S,gx=-S*.2,gz=S*.35,gh=gr*.55,on=r=>gh*(1-r/gr);cone('sand',gx,0,gz,gr,gh,L.pile,10);
  for(let g=0;g<3+rich*4;g++){const a=rr(0,TAU),r=rr(.2,.8)*gr;sph('glass',gx+Math.cos(a)*r,on(r)+.003*S,gz+Math.sin(a)*r,.008*S,L.garnet,1,5);}
  for(let g=0;g<1+rich*2;g++){const a=rr(0,TAU),r=rr(.1,.6)*gr;sph('glass',gx+Math.cos(a)*r,on(r)+.004*S,gz+Math.sin(a)*r,.006*S,L.lump,1,4);}
  if(rich)W(S*.28,0,S*.32,rr(-.4,.4),()=>{box('wood',0,0,0,.05*S,.05*S,.18*S,P('woodD'));box('wood',0,.05*S,0,.22*S,.06*S,.16*S,P('wood'));box('wood',.12*S,.05*S,0,.02*S,.1*S,.16*S,P('wood'));});});
 resLoose(S,rich*5,[L.pile,L.vein[0]],'stone');}
function resJade(S,rich){const L=RES_LOOK.jade;
 resOutcrop(S*.8,rich,(i,bw,bh,bd)=>{const side=i%2?1:-1;box('plain',0,bh*rr(.3,.7),side*(bd/2+.006),bw*rr(.5,.9),.006*S,.01,0xd8dcd0);
   if(rich&&i%2===0)box('bone',rr(-.2,.2)*bw,bh*rr(.2,.5),-side*(bd/2+.006),bw*.35,bh*.22,.012,L.vein[i%3]);},
  {col:i=>L.host[i%3]});
 const sz=S*.5;ellip('water',0,0,sz,S*.62,.006*S,S*.12,0x4a6a68,0,14);
 const nb=1+rich*2;for(let b=0;b<nb;b++){const x=b?rr(-.5,.5)*S:0,r=(b?rr(.03,.05):.06)*S*(1+rich*.15),y=r*.3,z=sz+(b?rr(-.08,.08)*S:0);
  ellip('bone',x,y,z,r*1.3,r*rr(.55,.7),r,L.vein[b%3],b?rr(0,TAU):0,10);
  if(b===0)box('glass',x,y-r*.22,z+r*.8,r*.9,r*.45,.012*S,L.lump);}
 for(let p=0;p<6+rich*4;p++)sph('stone',rr(-.55,.55)*S,0,sz+rr(-.1,.1)*S,rr(.012,.03)*S,pick([0x5a6a5a,0x7a7a70,0x3a4a3e]),.6,6);}
function resAmber(S,rich){const L=RES_LOOK.amber,len=S*1.1,H=S*(.22+.05*rich),fz=S*.03;
 W(0,0,0,rr(-.35,.35),()=>{ellip('earth',0,0,-S*.45,len*.58,H*.85,S*.34,0x5e6a6e,0,14);
  box('earth',0,0,-S*.12,len,H*.55,S*.3,0x6a7a80);
  {const ck=resK('coal','plain');box(ck,0,H*.55,-S*.14,len*.97,H*.08,S*.27,resC(ck,L.lignite));}
  box('earth',0,H*.63,-S*.16,len*.94,H*.3,S*.24,0x8a7a62);
  for(let k=0;k<3+rich*3;k++){const q=rr(.007,.016)*S*(1+rich*.15);sph('glass',rr(-.46,.46)*len,H*rr(.08,.48),fz-q*.4,q*rr(.8,1.3),L.vein[k%3],rr(.5,.8),6);}
  ellip('earth',rr(-.2,.2)*len,0,S*.3,S*(.14+.04*rich),S*.06,S*.12,L.pile,rr(0,TAU),10);
  if(rich)for(let k=0;k<2+rich*3;k++){const a=rr(0,TAU),r=rr(0,.1)*S;sph('glass',Math.cos(a)*r,S*.05,S*.3+Math.sin(a)*r,rr(.012,.02)*S,L.vein[k%3],.7,6);}});}
{const node0=resNode;resNode=function(kind,grade){const G=RES_ORE.grades[grade],S=G.size,rich=G.rank;
 if(kind==='quartz')return resQuartz(S,rich);if(kind==='opal')return resOpal(S,rich);if(kind==='diamond')return resDiamond(S,rich);
 if(kind==='jade')return resJade(S,rich);if(kind==='amber')return resAmber(S,rich);return node0(kind,grade);};}
Object.assign(RES_NAME,{quartz:'Rock crystal',opal:'Opal',diamond:'Diamond gravel',jade:'Jade',amber:'Amber'});
Object.assign(RES_H,{quartz:.5,opal:.72,diamond:.62,jade:.6,amber:.4});
defBuilding({key:'node-quartz-low',seed:6740,...resNodeDef('quartz','low')});
defBuilding({key:'node-quartz-medium',seed:6741,...resNodeDef('quartz','medium')});
defBuilding({key:'node-quartz-high',seed:6742,...resNodeDef('quartz','high')});
defBuilding({key:'node-opal-low',seed:6770,...resNodeDef('opal','low')});
defBuilding({key:'node-opal-medium',seed:6771,...resNodeDef('opal','medium')});
defBuilding({key:'node-opal-high',seed:6772,...resNodeDef('opal','high')});
defBuilding({key:'node-diamond-low',seed:6780,...resNodeDef('diamond','low')});
defBuilding({key:'node-diamond-medium',seed:6781,...resNodeDef('diamond','medium')});
defBuilding({key:'node-diamond-high',seed:6782,...resNodeDef('diamond','high')});
defBuilding({key:'node-jade-low',seed:6790,...resNodeDef('jade','low')});
defBuilding({key:'node-jade-medium',seed:6791,...resNodeDef('jade','medium')});
defBuilding({key:'node-jade-high',seed:6792,...resNodeDef('jade','high')});
defBuilding({key:'node-amber-low',seed:6795,...resNodeDef('amber','low')});
defBuilding({key:'node-amber-medium',seed:6796,...resNodeDef('amber','medium')});
defBuilding({key:'node-amber-high',seed:6797,...resNodeDef('amber','high')});
