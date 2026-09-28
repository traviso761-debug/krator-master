// ================================================================= HIGHLANDS — the carved and painted vocabulary (prefix hn)
// Shared by all three branches; what varies is how much of it a building carries and in which material:
//   Republican — nalichnik window surrounds, keel gables, onion/tent/spire roofs, dougong under civic eaves,
//                formline boards at doors and gables, guild totems at the entrance;
//   Rustic     — carved bargeboards with crossed horns/dragon heads, alpine balconies with cut-out boards,
//                painted gable crests, a totem or two at the hall;
//   Tribal     — totems everywhere, whole painted house-fronts, wings, bamboo, raw logs.

// ---------------------------------------------------------------- totems and painted posts
// Totem pole: carved column (the crest map faces the building's front when ry is the front direction), an
// optional pair of spread wings (thunderbird crossarm) and a carved beak at the top figure.
function hnTotem(x,y,z,r,h,ry,o){o=o||{};if(hlNonTribal())return hnPillar(x,y,z,Math.max(.2,r*1.1),h,ry,{free:true});   // outside the tribes: a carved column
 kput(o.painted?'hTotemP':'hTotem',[x,y,z],qEuler(0,ry+Math.PI,0),[r,h,r],null);
 const f=loc(x,z,0,r*.9,ry);kput('vConeI',[f[0],y+h*.86,f[1]],vQ(ry,Math.PI/2,0),[r*.34,r*1.3,r*.34],hC(HPAL.black));   // the top figure's beak
 if(o.wings){const wy=y+h*(o.wingAt||.8);for(const s of[-1,1]){const p=loc(x,z,s*(r+o.wings*.5),r*.2,ry);kput('hWing',[p[0],wy,p[1]],vQ(ry,0,s*-.12),[s*o.wings,o.wings*.5,1],null);}}
 if(o.hat){for(let k=0;k<3;k++)vPst('hPaint',x,y+h+k*.16,z,r*(1-.12*k),.14,hC(k%2?HPAL.red:HPAL.black));}}
// A porch post carved as a short totem (the colonnades of civic fronts, the tribal houses).
function hnTotemPost(x,y,z,r,h,ry,painted){if(hlNonTribal())return hnPillar(x,y,z,Math.max(.16,r),h,ry,{});
 kput(painted?'hTotemP':'hTotem',[x,y,z],qEuler(0,ry+Math.PI,0),[r,h,r],null);
 vB('hPaint',x,y+h-.02,z,r*2.6,.2,r*2.6,ry,hC(HPAL.black));vB('vStone',x,y-.1,z,r*2.4,.22,r*2.4,ry,hC(vPick(HPAL.rubble)));}
// Formline board on a face: item hFormA (crest, 2:1) | hFormW (on white) | hFormV (tall board) | hFormT (gable bird).
// Republican and Rustic builders get the wider repertoire (round 2): the item is swapped for a pick from HMOTIF of the
// same shape — formline animals stay in the pool — and the first wide crest on a Republican CIVIC building is the
// Republic's emblem.
function hnForm(item,x,y,z,ry,w,h){if(hlNonTribal()){const C=VERN.cur;(C.murals||(C.murals=[])).push({item:hnMotifPick(item),x,y,z,ry,w,h});return;}   // fitted after the building (hlFlush)
 const p=loc(x,z,0,.07,ry);kput(item,[p[0],y+h/2,p[1]],qEuler(0,ry,0),[w,h,1],null);}
// Frieze band (hFormF) along a face — eave boards, lintels, the belt between storeys.
function hnFrieze(x,y,z,ry,w,h){const p=loc(x,z,0,.05,ry);vB('hFormF',p[0],y,p[1],w,h||.5,.1,ry);}

// ---------------------------------------------------------------- round 2: branch rules, pillars, signs, emblem
// Totems belong to the tribes only; the Republic and the Rustic villages carve PILLARS with the same stacked motifs.
const hlNonTribal=()=>{const c=VERN.cur;return !!(c&&c.D.branch&&c.D.branch!=='tribal');};
const hlRepCivic=()=>{const c=VERN.cur;return !!(c&&c.D.branch==='republican'&&c.D.tags.wealth==='civic');};
function hnMotifPick(item){const c=VERN.cur,rus=c.D.branch==='rustic';
 if(item==='hFormT')return vPick(HMOTIF.gable.concat(['hFormT']));
 if(item==='hFormV')return vPick(HMOTIF.tall.concat(['hFormV']));
 if(hlRepCivic()&&!c.emblemDone){c.emblemDone=true;return HMOTIF.emblemWide;}
 return vPick(HMOTIF.wide.filter(k=>!(rus&&k==='hM_w_rocket')).concat(['hFormA','hFormW','hFormB']));}
// Carved pillar: a square timber shaft whose four faces carry a stacked motif column (like a totem, but a column),
// on a stone plinth, under a painted capital (necking, echinus, abacus). {free:true} stands it alone with a painted
// roundel as finial; {item} forces a pillar map (hM_p_0..3). r = half the shaft width.
function hnPillar(x,y,z,r,h,ry,o){o=o||{};const s=r*2,stone=hC(vPick(HPAL.ashlar)),wood=hC(vPick(HPAL.tar));
 const bh=Math.min(.42,h*.1),ch=Math.min(.55,h*.13),sh=h-bh-.1-ch;
 vB('vStone',x,y,z,s*1.55,bh,s*1.55,ry,stone);vB('vStone',x,y+bh,z,s*1.25,.1,s*1.25,ry,stone);
 kput(o.item||vPick(HMOTIF.pillar),[x,y+bh+.1+sh/2,z],qEuler(0,ry,0),[s,sh,s],null);
 const cy=y+h-ch;vB('hPaint',x,cy,z,s*1.08,ch*.28,s*1.08,ry,hC(HPAL.black));vB('hPaint',x,cy+ch*.28,z,s*1.3,ch*.34,s*1.3,ry,hC(vPick([HPAL.red,HPAL.teal])));
 vB('vWood',x,cy+ch*.62,z,s*1.6,ch*.38,s*1.6,ry,wood);
 if(o.free){const k=o.disc||vPick(HMOTIF.disc),R=Math.max(.7,s*1.6);vPst('vIron',x,y+h,z,.04,R*.35,hC(0x2e2a26));
  kput(k,[x,y+h+R*.35+R/2,z],qEuler(0,ry,0),[R,R,1],null);vB('hGoldB',x,y+h+R*.35-.04,z,R*.36,.08,.12,ry,hC(HPAL.gold[0]));}}
// The Republic's emblem (three arms, three swords) as a painted roundel on a face, d across.
function hnEmblem(x,y,z,ry,d){const p=loc(x,z,0,.09,ry);kput(HMOTIF.emblem,[p[0],y,p[1]],qEuler(0,ry,0),[d,d,1],null);}
// Banners: on a Republican civic building every banner pole flies the Republic's banner.
const _hlBannerPole=vnBannerPole;
vnBannerPole=function(x,y,z,ry,h,c){if(!hlRepCivic())return _hlBannerPole(x,y,z,ry,h,c);
 vPst('vPost',x,y,z,.08,h,hC(0x5a4632));const p=loc(x,z,.55,0,ry);vB('vWood',p[0],y+h-.2,p[1],1.1,.08,.08,ry,hC(0x5a4632));vBall('hGold',x,y+h+.08,z,.12,hC(HPAL.gold[0]));
 kput(HMOTIF.banner,[p[0],y+h-1.62,p[1]],vQ(ry+Math.PI/2,0,0),[.9,2.7,1]);};
// Trade signs. Each shop-like def names its symbol here (a list = one per call, in order: a row of shops).
const HTRADE={hl_rep_tavern_a:'tankard',hl_rep_tavern_b:'tankard',hl_rep_tavern_c:'tankard',hl_rep_inn:'bed',hl_rep_shops:['bread','boot','shears','candle'],
 hl_rep_market_hall:'scales',hl_rep_workshop_a:'wheel',hl_rep_workshop_b:'barrel',hl_rep_smithy_small:'anvil',hl_rep_smithy_large:'anvil',hl_rep_stables:'horse',
 hl_rep_warehouse_a:'sack',hl_rep_warehouse_b:'sack',hl_rep_guild_merc:'swords',hl_rep_guild_alch:'flask',hl_rep_guild_farm:'sheaf',hl_rep_guild_smith:'hammer',
 hl_rep_guild_mech:'gear',hl_rep_guild_astro:'star',hl_rep_guild_scav:'salvage',hl_rep_hospital:'mortar',hl_rep_school:'book',hl_rep_forgehouse:'anvil',hl_rep_granary:'sheaf',hl_rep_windmill:'sheaf',hl_rep_watermill:'sheaf',
 hl_rus_shops:['bread','scales','fish'],hl_rus_tavern:'tankard',hl_rus_smithy:'anvil',hl_rus_mill:'sheaf',hl_rus_granary:'sheaf'};
function hlTradeSym(sym){if(sym)return sym;const c=VERN.cur;const t=c&&HTRADE[c.D.baseKey||c.D.key];if(!t)return 'scales';if(!Array.isArray(t))return t;c.signN=(c.signN||0);return t[c.signN++%t.length];}
// Hanging sign: an iron bracket out of the wall at (x,y,z) (ry = outward), a painted roundel hung across it.
function hnSign(x,y,z,ry,sym,s){s=s||1;const I=hC(0x2e2a26),k=HMOTIF.sign[hlTradeSym(sym)]||HMOTIF.sign.scales;const a=loc(x,z,0,.04,ry),b=loc(x,z,0,1.25*s,ry),m=loc(x,z,0,.62*s,ry);
 beam('vIron',[a[0],y,a[1]],[b[0],y,b[1]],.06,.06,I);beam('vIron',[a[0],y-.62*s,a[1]],[m[0],y,m[1]],.04,.04,I);vBall('hGold',b[0],y,b[1],.06,hC(HPAL.gold[0]));
 const p=loc(x,z,0,.72*s,ry),R=.9*s;for(const u of[-.25,.25]){const q=loc(x,z,0,(.72+u)*s,ry);vB('vIron',q[0],y-.14,q[1],.02,.14,.02,0,I);}
 kput(k,[p[0],y-.14-R/2,p[1]],qEuler(0,ry+Math.PI/2,0),[R,R,1],null);}
// Flat sign on a wall: a painted board with the trade roundel between two knotwork panels (y = bottom).
function hnSignBoard(x,y,z,ry,w,h,sym,bgC){const f=loc(x,z,0,.04,ry);vB('hPaint',f[0],y,f[1],w+.14,h+.14,.08,ry,hC(HPAL.black));const b=loc(x,z,0,.09,ry);vB('hPaint',b[0],y+.07,b[1],w,h,.03,ry,bgC||hC(HPAL.ochre));
 const d=Math.min(h*1.35,w*.5),c=loc(x,z,0,.12,ry);kput(HMOTIF.sign[hlTradeSym(sym)]||HMOTIF.sign.scales,[c[0],y+.07+h/2,c[1]],qEuler(0,ry,0),[d,d,1],null);
 const kw=(w-d)/2-.12;if(kw>.25)for(const s2 of[-1,1]){const p=loc(x,z,s2*(d/2+.06+kw/2),.115,ry);kput(vPick(['hM_w_knot','hM_w_knotRed']),[p[0],y+.07+h/2,p[1]],qEuler(0,ry,0),[kw,Math.min(h*.8,kw/2),1],null);}}

// ---------------------------------------------------------------- dougong (painted bracket sets under eaves)
// One set on a post head at (x,y,z): a dou block, a crossed pair of arms (one along the face, one projecting
// out toward ry), smaller blocks at the arm ends, a second longer arm and a purlin block. `s` scales the set
// (1 ≈ a 1.6 m-wide set for a civic eave). Teal arms, red blocks, white arrises — the East-Asian note in the kit.
function hnDougong(x,y,z,ry,s,armC,blockC){s=s||1;armC=armC||hC(HPAL.teal);blockC=blockC||hC(HPAL.red);const W=hC(HPAL.white);
 const P=(u,yy,o)=>{const p=loc(x,z,u*s,o*s,ry);return[p[0],y+yy*s,p[1]];};const q=qEuler(0,ry,0),qo=qEuler(0,ry+Math.PI/2,0);
 let p=P(0,.13,0);kput('hPaint',p,q,[.38*s,.26*s,.38*s],blockC);
 p=P(0,.36,0);kput('hPaint',p,q,[1.0*s,.2*s,.22*s],armC);kput('hPaint',P(0,.36,.12),q,[1.0*s,.03*s,.02*s],W);           // arm along the face
 p=P(0,.36,.3);kput('hArm',p,qo,[.2*s,.2*s,.95*s],armC);                                                                // projecting arm, curved nose
 for(const u of[-.44,.44,0])kput('hPaint',P(u,.54,0),q,[.22*s,.16*s,.24*s],blockC);kput('hPaint',P(0,.54,.66),q,[.22*s,.16*s,.24*s],blockC);
 kput('hPaint',P(0,.72,0),q,[1.6*s,.2*s,.22*s],armC);kput('hPaint',P(0,.72,.12),q,[1.6*s,.03*s,.02*s],W);
 p=P(0,.72,.55);kput('hArm',p,qo,[.2*s,.2*s,1.3*s],armC);
 kput('hPaint',P(0,.9,.4),q,[1.8*s,.16*s,1.2*s],blockC);}
// A row of sets along a face (between x0..x1 in the face frame), each on a painted post head / wall plate.
function hnBracketRow(x,y,z,ry,w,n,s,armC,blockC){const C=VERN.cur;if(C&&!C.flushing){(C.brows||(C.brows=[])).push([x,y,z,ry,w,n,s,armC,blockC]);return;}   // laid out round the windows after the building (hlFlush)
 hnBracketRowNow(x,y,z,ry,w,n,s,armC,blockC,[]);}
function hnBracketRowNow(x,y,z,ry,w,n,s,armC,blockC,gaps){const inGap=u=>gaps.some(g=>u>g[0]&&u<g[1]);for(let i=0;i<n;i++){const u=-w/2+w*(i+.5)/n;if(inGap(u))continue;const p=loc(x,z,u,0,ry);hnDougong(p[0],y,p[1],ry,s,armC,blockC);}
 const cuts=[-w/2];for(const g of gaps.slice().sort((a,b)=>a[0]-b[0])){cuts.push(Math.max(-w/2,g[0]),Math.min(w/2,g[1]));}cuts.push(w/2);
 for(let i=0;i+1<cuts.length;i+=2){const a=cuts[i],b=cuts[i+1];if(b-a<.25)continue;const p=loc(x,z,(a+b)/2,.08,ry);vB('hPaint',p[0],y-.18,p[1],b-a,.18,.3,ry,armC||hC(HPAL.teal));}}                                  // painted wall plate

// ---------------------------------------------------------------- bargeboards, gable finials, horns
// For a gable roof laid with vnGableRoof/hnGable at (x,y,z,w,d,rise,ry,over): carved lace bargeboards down both
// rakes at both gable ends, a hanging "towel" board at the apex, and a finial by style:
//   'lace'   Russian: lace bargeboards + towel + small spike
//   'horns'  Norse: the rake boards run on past the ridge and cross, ending in curled horns
//   'dragon' Norse, grander: crossed boards ending in carved heads with open jaws
//   'bird'   Tribal: a thunderbird (wing plane + beak) standing on the apex
function hnBarge(x,y,z,w,d,rise,ry,over,c,style,endOver){over=over===undefined?.9:over;c=c||hC(HPAL.white);style=style||'lace';const eo=endOver===undefined?over:endOver;
 const run=d/2+over,drop=over*rise/(d/2);
 for(const sx of[-1,1]){const gx=sx*(w/2+eo+.04);const N=hRot(ry,[sx,0,0]);
  const apex=[...loc(x,z,gx,0,ry)];const A=[apex[0],y+rise+.05,apex[1]];
  for(const sz of[-1,1]){const e=loc(x,z,gx,sz*run,ry);const E=[e[0],y-drop,e[1]];
   const mid=[(A[0]+E[0])/2,(A[1]+E[1])/2-.26,(A[2]+E[2])/2];const L=Math.hypot(E[0]-A[0],E[1]-A[1],E[2]-A[2]);
   if(style==='lace'||style==='bird'){let X=[E[0]-A[0],E[1]-A[1],E[2]-A[2]];if(hCross(N,hNorm(X))[1]<0)X=X.map(v=>-v);hnOri('hLaceV',mid,X,N,[L,.55,1],c);}   // keep the scallops hanging DOWN on both rakes
   else hnMember('hPaint',[A[0],A[1]-.12,A[2]],[E[0],E[1]-.12,E[2]],.34,.08,N,c);
   if(style==='horns'||style==='dragon'){   // the board carries on past the apex, crossing its twin
    const dir=hNorm([A[0]-E[0],A[1]-E[1],A[2]-E[2]]);const T=hAdd(A,dir,1.1);hnMember('hPaint',[A[0],A[1]-.12,A[2]],T,.3,.08,N,c);
    const up=hAdd(T,[dir[0]*.25,.6,dir[2]*.25]);hnMember('hPaint',T,up,.24,.08,N,c);
    if(style==='dragon'){const H=hAdd(up,[dir[0]*.3,.1,dir[2]*.3]);hnOri('hPaint',H,[dir[0],.3,dir[2]],N,[.7,.34,.14],c);
     kput('vConeI',hAdd(H,[dir[0]*.35,-.04,dir[2]*.35]),qFacing([dir[0],0,dir[2]]).multiply(qEuler(Math.PI/2,0,0)),[.1,.3,.1],hC(HPAL.red));}}}
  if(style==='lace'){hnOri('hPaint',[A[0],A[1]-.7,A[2]],hRot(ry,[0,0,1]),N,[.28,1.2,.08],c);hnOri('hLaceV',[A[0],A[1]-1.45,A[2]],hRot(ry,[0,0,1]),N,[.5,.3,1],c);
   vPst('vIron',A[0],A[1],A[2],.03,.9,hC(0x2e2a26));vBall('hGold',A[0],A[1]+.9,A[2],.1,hC(HPAL.gold[0]));}
  if(style==='bird'){const p=[A[0],A[1]+.55,A[2]];for(const s of[-1,1]){const q=loc(A[0],A[2],0,s*.8,ry);kput('hWing',[q[0],A[1]+.6,q[1]],qEuler(0,ry+sx*Math.PI/2,0),[s*1.6,.8,1],null);}
   kput('hPaintBall',p,null,[.22,.26,.22],hC(HPAL.black));kput('vConeI',hAdd(p,N,.28),qFacing(N).multiply(qEuler(Math.PI/2,0,0)),[.07,.3,.07],hC(HPAL.red));}}}

// ---------------------------------------------------------------- windows, porches, balconies
// Nalichnik: a window in a wide painted surround — side boards, a pediment (keel or small gable), a lace
// valance under the sill and painted shutters. The Russian/Republican window; the Rustic uses it plainer.
function hnNal(x,y,z,ry,w,h,kind,trimC,o){o=o||{};trimC=trimC||hC(HPAL.white);vnWin(x,y,z,ry,w,h,kind||'glass','hPaint',trimC,o.shutters?true:false);
 const f=(u,oo)=>loc(x,z,u,oo,ry);
 for(const s of[-1,1]){const p=f(s*(w/2+.2),.12);vB('hPaint',p[0],y-.2,p[1],.22,h+.45,.06,ry,trimC);}
 const pe=f(0,.14);if(o.keel)kput('hKeelW',[pe[0],y+h+.1,pe[1]],qEuler(0,ry,0),[w+.7,.7,.12],trimC);
 else{for(const s of[-1,1]){const a=hnOn(x,y+h+.12,z,ry,s*(w/2+.35),.14),b=hnOn(x,y+h+.52,z,ry,0,.14);hnMember('hPaint',a,b,.16,.08,hRot(ry,[0,0,1]),trimC);}
  vB('hPaint',pe[0],y+h+.08,pe[1],w+.7,.1,.14,ry,trimC);}
 const v=f(0,.12);kput('hLaceV',[v[0],y-.42,v[1]],qEuler(0,ry,0),[w+.4,.4,1],trimC);
 if(o.accent){const a=f(0,.16);vB('hPaint',a[0],y+h+.2,a[1],.3,.18,.04,ry,o.accent);}}
// Russian porch (kryltso): a stair to a raised door under a bochka roof on bulbous posts.
function hnKryltso(x,y,z,ry,w,rise,roofItem,roofC,postC){const run=Math.max(1.6,rise*1.3);const steps=Math.max(3,Math.round(rise/.2));
 const s=loc(x,z,0,run/2,ry);vnStairs(s[0],y,s[1],ry,w,rise,steps,'vWood',postC);
 const pl=loc(x,z,0,.5,ry);vB('vWood',pl[0],y+rise-.18,pl[1],w+.6,.18,1.2,ry,postC);
 for(const sx of[-1,1])for(const sz of[0,1]){const p=loc(x,z,sx*(w/2+.15),.1+sz*(run+.6),ry);const base=sz?y:y+rise;const H=(y+rise+2.4)-base;
  vPst('vPostB',p[0],base,p[1],.1,H,postC);kput('hPaintBall',[p[0],base+H*.45,p[1]],null,[.2,.3,.2],postC);}
 const rc=loc(x,z,0,(run+.6)/2+.1,ry);hnBochka(rc[0],y+rise+2.4,rc[1],run+1.3,w+.9,1.7,ry+Math.PI/2,roofItem||'hKeelSc',roofC);   // ridge runs down the stair
 vB('vWood',rc[0],y+rise+2.3,rc[1],w+.9,.14,run+1.3,ry,postC);}
// Alpine balcony: deck on angled brackets, cut-out-board balustrade on three sides, top rail, flower boxes.
function hnBalcony(x,y,z,ry,w,d,c,railC,flowers){c=c||hC(vPick(HPAL.tar));railC=railC||c;const N=hRot(ry,[0,0,1]);
 const dc=loc(x,z,0,d/2,ry);vB('vWood',dc[0],y-.14,dc[1],w,.14,d,ry,c);
 const n=Math.max(2,Math.round(w/1.4));for(let i=0;i<=n;i++){const u=-w/2+w*i/n;hnMember('vWood',hnOn(x,y-1.1,z,ry,u,.05),hnOn(x,y-.16,z,ry,u,d*.9),.14,.12,hRot(ry,[1,0,0]),c);}
 const fr=loc(x,z,0,d-.03,ry);kput('hLaceB',[fr[0],y+.5,fr[1]],qEuler(0,ry,0),[w-.1,.95,1],railC);vB('vWood',fr[0],y+.98,fr[1],w+.06,.1,.14,ry,c);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.03),d/2,ry);kput('hLaceB',[p[0],y+.5,p[1]],qEuler(0,ry+Math.PI/2,0),[d,.95,1],railC);vB('vWood',p[0],y+.98,p[1],.14,.1,d,ry,c);}
 if(flowers!==false){const fb=loc(x,z,0,d+.12,ry);vB('vWood',fb[0],y+.9,fb[1],w-.4,.22,.22,ry,c);
  for(let k=0;k<Math.round(w*2.2);k++){const p=loc(x,z,rr(-w/2+.3,w/2-.3),d+.14,ry);kput('vLeaf',[p[0],y+1.14,p[1]],null,[rr(.14,.22),.14,.16],hC(0x3f7a34));
   kput('hPaintBall',[p[0]+rr(-.08,.08),y+1.24,p[1]+rr(-.05,.05)],null,[.08,.07,.08],hC(vPick([0xd0302a,0xe04a3a,0xc02848,0xf0f0f0])));}}}
// A plain wooden gallery (external stair landing / walkway): plank deck with post-and-rail balustrade.
function hnDeckRail(a,b,y,c,railH){railH=railH||1;const L=Math.hypot(b[0]-a[0],b[2]-a[2]);const n=Math.max(1,Math.round(L/1.4));
 for(let i=0;i<=n;i++){const t=i/n;vPst('vPost',lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t),.05,railH,c);}
 beam('vWood',[a[0],a[1]+railH,a[2]],[b[0],b[1]+railH,b[2]],.07,.07,c);beam('vWood',[a[0],a[1]+railH*.5,a[2]],[b[0],b[1]+railH*.5,b[2]],.05,.05,c);}

// ---------------------------------------------------------------- towers (Peles, clocktowers, wall towers)
// o: {shaft:'stucco'|'rubble'|'logs'|'oct', roof:'spire'|'tent'|'onion'|'helm'|'pyr', loggia:true, clock:true,
//     c (shaft colour), roofC, trimC, beamC, lit}
// Returns the y of the roof tip. The loggia is the Peles signature: a timber belt of arched openings and
// balustrade under the roof, in red-brown timber, on a stone shaft.
function hnTower(x,y,z,w,h,ry,o){o=o||{};const trimC=o.trimC||hC(HPAL.white),beamC=o.beamC||hC(vPick(HPAL.redwood));let top=y+h;
 if(o.shaft==='oct'){kput('hOctP',[x,y,z],qEuler(0,ry,0),[w*.54,h,w*.54],o.c||hC(vPick(HPAL.stucco)));}
 else if(o.shaft==='rubble')vB('hRubB',x,y,z,w,h,w,ry,o.c||hC(vPick(HPAL.rubble)));
 else if(o.shaft==='logs')hnLogBox(x,y,z,w,h,w,ry,o.c||hC(vPick(HPAL.pine)));
 else hnStucco(x,y,z,w,h,w,ry,o.c,o.qC);
 // string courses and a window per face per ~4 m
 for(let yy=y+4;yy<y+h-1;yy+=4)vB('vStone',x,yy,z,w+.14,.16,w+.14,ry,hC(vPick(HPAL.ashlar)));
 for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;for(let yy=y+2;yy<y+h-2.5;yy+=4){const p=loc(x,z,0,w/2,a);vnWin(p[0],yy,p[1],a,.7,1.5,o.lit?'lit':'glass','vStone',hC(vPick(HPAL.ashlar)));}}
 if(o.clock){for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const p=loc(x,z,0,w/2+.08,a);kput('hClock',[p[0],y+h-w*.42,p[1]],qEuler(0,a,0),[w*.62,w*.62,1],null);}}
 if(o.loggia){const LH=2.6;vB('vWood',x,top,z,w+.8,.25,w+.8,ry,beamC);
  for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const f=loc(x,z,0,(w+.8)/2,a);kput('hLaceB',[f[0],top+.7,f[1]],qEuler(0,a,0),[w+.7,.9,1],beamC);
   const n=Math.max(2,Math.round(w/1.4));for(let i=0;i<=n;i++){const p=loc(x,z,-(w+.8)/2+(w+.8)*i/n,(w+.8)/2-.08,a);vPst('vPost',p[0],top+.25,p[1],.09,LH,beamC);}
   for(let i=0;i<n;i++){const p=loc(x,z,-(w+.8)/2+(w+.8)*(i+.5)/n,(w+.8)/2-.08,a);kput('hKeelW',[p[0],top+LH-.55,p[1]],qEuler(0,a,0),[(w+.8)/n-.18,.6,.1],beamC);}}
  vB('vDarkB',x,top+.25,z,w-.3,LH,w-.3,ry);top+=LH+.25;vB('vWood',x,top,z,w+1.1,.2,w+1.1,ry,beamC);top+=.2;}
 const roof=o.roof||'spire',rc=o.roofC||hC(vPick(HPAL.slate));
 if(roof==='spire'){kput('hPyrSc',[x,top-.2,z],qEuler(0,ry,0),[w+1.2,w*2.1,w+1.2],rc);
  for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const p=loc(x,z,0,w*.42,a);vB('vPlaster',p[0],top+w*.35,p[1],w*.28,w*.3,.5,a,trimC);vnGableRoof(p[0],top+w*.35+w*.3,p[1],w*.28,.5,w*.22,a+Math.PI/2,'hGableSc',rc,.08);}
  const t=top-.2+w*2.1;vPst('vIron',x,t-.4,z,.07,w*.9,hC(0x2e2a26));vBall('hGold',x,t+w*.3,z,.16,hC(HPAL.gold[0]));top=t+w*.9;}
 else if(roof==='tent'){top=hnTent(x,top,z,w*.78,w*1.9,'hTentSc',rc);vPst('vIron',x,top-.3,z,.05,1.2,hC(0x2e2a26));vBall('hGold',x,top+.3,z,.14,hC(HPAL.gold[0]));top+=1;}
 else if(roof==='onion'){top=hnOnion(x,top,z,w*.4,o.onion||'G',o.onionC,w*.5,'hOctP',hC(vPick(HPAL.stucco)));}
 else if(roof==='helm'){kput('hBulbSc',[x,top-.1,z],null,[w*.62,w*.9,w*.62],rc);top+=w*.9;vPst('vIron',x,top-.1,z,.05,1.4,hC(0x2e2a26));top+=1.3;}
 else{vnPyrRoof('hPyrSc',x,top,z,w,w,w*.8,ry,rc,.5);top+=w*.8;}
 return top;}

// ---------------------------------------------------------------- bamboo (tribal and the poorest Republican/Rustic)
// Bamboo-frame wall: woven mat panels between culm posts and rails.
function hnBambooBox(x,y,z,w,h,d,ry,c,matC){vB('hBMatB',x,y,z,w,h,d,ry,matC||hC(vPick(HPAL.bamboo)));c=c||hC(vPick(HPAL.bamboo));
 const nx=Math.max(1,Math.round(w/1.2)),nz=Math.max(1,Math.round(d/1.2));
 for(let i=0;i<=nx;i++)for(const s of[-1,1]){const p=loc(x,z,-w/2+w*i/nx,s*(d/2+.04),ry);vPst('hBamboo',p[0],y,p[1],.07,h+.25,c);}
 for(let j=1;j<nz;j++)for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.04),-d/2+d*j/nz,ry);vPst('hBamboo',p[0],y,p[1],.07,h+.25,c);}
 for(const yy of[y+.1,y+h*.55,y+h-.1])for(const s of[-1,1]){const a=loc(x,z,-w/2-.1,s*(d/2+.1),ry),b=loc(x,z,w/2+.1,s*(d/2+.1),ry);beam('hBambooC',[a[0],yy,a[1]],[b[0],yy,b[1]],.12,.12,c);
  const e=loc(x,z,s*(w/2+.1),-d/2-.1,ry),f=loc(x,z,s*(w/2+.1),d/2+.1,ry);beam('hBambooC',[e[0],yy,e[1]],[f[0],yy,f[1]],.12,.12,c);}}
// Bamboo lashed railing between two points.
function hnBambooRail(a,b,c,h){h=h||1;const L=Math.hypot(b[0]-a[0],b[2]-a[2]);const n=Math.max(1,Math.round(L/1.1));c=c||hC(vPick(HPAL.bamboo));
 for(let i=0;i<=n;i++){const t=i/n;vPst('hBamboo',lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t),.045,h,c);}
 for(const yy of[h,h*.55])beam('hBambooC',[a[0],a[1]+yy,a[2]],[b[0],b[1]+yy,b[2]],.1,.1,c);}

// ---------------------------------------------------------------- cliff walkways (tribal cliff settlements)
// A walkway along a polyline of local points [x,y,z] (deck level) with the cliff face toward `back` (a local unit
// vector, usually [0,0,-1]): plank deck, bamboo rail on the open side, and raking struts from under the deck
// back and down into the rock. Consecutive points at different heights become flights of steps.
function hnCliffWalk(pts,w,back,c,railC){c=c||hC(vPick(HPAL.aged));back=back||[0,0,-1];
 for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dz);const yaw=Math.atan2(dx,dz);
  const out=[-back[0],0,-back[2]];const side=(dx*out[2]-dz*out[0])>0?1:-1;
  if(Math.abs(dy)<.3){beam('vWood',[a[0],a[1]-.08,a[2]],[b[0],b[1]-.08,b[2]],w,.14,c);}
  else{const n=Math.max(2,Math.round(Math.abs(dy)/.22));for(let k=0;k<n;k++){const t=(k+.5)/n;kput('vWood',[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.05,lerp(a[2],b[2],t)],qEuler(0,yaw,0),[w,.08,L/n+.06],c);}
   for(const s of[-1,1]){const o=[Math.cos(yaw)*w/2*s,0,-Math.sin(yaw)*w/2*s];beam('vWood',hAdd([a[0],a[1]-.2,a[2]],o),hAdd([b[0],b[1]-.2,b[2]],o),.08,.2,c);}}
  // rail on the open side
  const o=[out[0]*w/2,0,out[2]*w/2];hnBambooRail(hAdd(a,o),hAdd(b,o),railC,1.05);
  // struts: every ~2.5 m, from the deck's outer edge back and down to the rock
  const ns=Math.max(1,Math.round(L/2.5));for(let k=0;k<=ns;k++){const t=k/ns;const p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.14,lerp(a[2],b[2],t)];
   const edge=hAdd(p,o,.9);const foot=hAdd(hAdd(p,back,1.6),[0,-2.4,0]);beam('vWood',edge,foot,.12,.12,c);
   const under=hAdd(p,back,.1);beam('vWood',edge,hAdd(under,back,.6),.1,.1,c);}}}
// A plain rock face for the showcase cliff (a real settlement uses the terrain): a gridSurface with fbm relief,
// standing along local x at z=zc, facing +z, from y0 up to y1.
function hnCliffFace(G,x0,x1,zc,y0,y1,seed){const W=x1-x0,H=y1-y0;const geo=gridSurface((u,v)=>{const X=x0+u*W,Y=y0+v*H;
  const bulge=(fbm(u*3+seed,v*2.2,seed*.3,4)-.5)*6+(fbm(u*12,v*9,seed,2)-.5)*2.2;
  const ledge=Math.pow(Math.abs(Math.sin((v*H/9.5+fbm(u*2,v,seed,2)*1.5)*Math.PI)),6)*2.2;   // strata: shelves every ~9 m
  return[X,Y,zc+bulge+ledge-(1-v)*2.5];},Math.round(W/1.2),Math.round(H/1.2),{uS:W/8,vS:H/8});
 const m=mesh(geo,MAT.rock,G);m.material=MAT.rock.clone();m.material.color=hC(0x8a8680);return m;}

// ---------------------------------------------------------------- yard furniture of the highlands
function hnWoodpile(x,y,z,ry,w,h){const n=Math.round(h/.2);for(let k=0;k<n;k++)for(let i=0;i<Math.round(w/.2);i++){const p=loc(x,z,-w/2+.1+i*.2,0,ry);kput('hLogEnd',[p[0],y+.1+k*.19,p[1]],qEuler(0,ry+Math.PI/2,0),[.9,.09,.09],hC(vPick(HPAL.pine)));}
 vnShedRoof(x,y+h+.1,z,w+.2,1.1,.25,ry,'vShingleB',hC(vPick(HPAL.shingle)),.2,.08);}
function hnStoneChimney(x,y,z,h,w){vB('hRubB',x,y,z,w,h,w,0,hC(vPick(HPAL.rubble)));vB('vStone',x,y+h,z,w+.16,.14,w+.16,0,hC(vPick(HPAL.ashlar)));vB('vDarkB',x,y+h+.12,z,w*.5,.04,w*.5,0);}
function hnFirepit(x,y,z,r){for(let k=0;k<9;k++){const a=k/9*TAU;kput('vRock',[x+Math.cos(a)*r,y+.1,z+Math.sin(a)*r],null,[.25,.18,.22],hC(vPick(HPAL.rubble)));}
 for(let k=0;k<4;k++)kput('hLogEnd',[x,y+.12,z],qEuler(0,k*.8,0),[r*1.4,.07,.07],hC(0x3a2a20));vBall('vEmber',x,y+.14,z,r*.3,null,.12);}
// A standing stone (circles, boundary marks, the tribal sacred sites); `carved` paints a face on it.
function hnMenhir(x,y,z,ry,h,c,carved){kput('vRock',[x,y+h*.45,z],qEuler(rr(-.06,.06),ry,rr(-.06,.06)),[h*.24,h*.55,h*.16],c||hC(vPick(HPAL.rubble)));
 if(carved){const p=loc(x,z,0,h*.15,ry);kput('hFormV',[p[0],y+h*.55,p[1]],qEuler(0,ry,0),[h*.26,h*.6,1],null);}}

// ---------------------------------------------------------------- round 4: fitting murals and bracket rows (hlFlush)
// Travis: murals over entrances cut into the architecture (jetties, consoles, lintels — the Saxon buildings worst)
// and dougong wall-plates ran across windows (the Hall of the Republic). Both are now placed AFTER the building is
// complete, against a record of every instance it placed:
//   * a bracket row keeps its sets only between windows, and its painted wall-plate breaks at each opening;
//   * a Rustic/Republican mural is fitted into the clear space in front of its wall: it is tested (oriented-box
//     SAT) against everything that pokes through a thin slab just in front of the wall, and shrinks / slides
//     within its original rectangle until it is clear — or is left out.
const _hlKputRec=kput;
kput=function(name,p,q,s,c){const C=VERN.cur;if(C&&!C.noRec)(C.inst||(C.inst=[])).push([name,[p[0],p[1],p[2]],q?q.clone():null,s]);return _hlKputRec(name,p,q,s,c);};
const _HLBB={};function hlItemBB(name){let b=_HLBB[name];if(!b){const g=KIT.defs[name].geo;if(!g.boundingBox)g.computeBoundingBox();b=_HLBB[name]={c:g.boundingBox.getCenter(new THREE.Vector3()),e:g.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(.5)};}return b;}
function hlOBB(rec){const [name,p,q,s]=rec,b=hlItemBB(name),S=typeof s==='number'?[s,s,s]:s,Q=q||new THREE.Quaternion();
 const c=new THREE.Vector3(b.c.x*S[0],b.c.y*S[1],b.c.z*S[2]).applyQuaternion(Q).add(new THREE.Vector3(p[0],p[1],p[2]));
 return{c,a:[new THREE.Vector3(1,0,0).applyQuaternion(Q),new THREE.Vector3(0,1,0).applyQuaternion(Q),new THREE.Vector3(0,0,1).applyQuaternion(Q)],e:[Math.abs(b.e.x*S[0]),Math.abs(b.e.y*S[1]),Math.abs(b.e.z*S[2])]};}
function hlSAT(A,B){const T=B.c.clone().sub(A.c);const ax=[...A.a,...B.a];for(const u of A.a)for(const v of B.a){const w=u.clone().cross(v);if(w.lengthSq()>1e-8)ax.push(w.normalize());}
 for(const L of ax){const rA=A.e[0]*Math.abs(A.a[0].dot(L))+A.e[1]*Math.abs(A.a[1].dot(L))+A.e[2]*Math.abs(A.a[2].dot(L));
  const rB=B.e[0]*Math.abs(B.a[0].dot(L))+B.e[1]*Math.abs(B.a[1].dot(L))+B.e[2]*Math.abs(B.a[2].dot(L));if(Math.abs(T.dot(L))>rA+rB)return false;}return true;}
const HLWINS=new Set(['vWinGlass','vWinLit','vDarkB','winSmD','hRAVoid']);
function hlFlush(){const C=VERN.cur;if(!C)return;const inst=C.inst||[];C.flushing=true;
 const near=(x,y,z,R)=>inst.filter(r=>{const p=r[1];return Math.abs(p[0]-x)<R&&Math.abs(p[2]-z)<R&&Math.abs(p[1]-y)<R+6;});
 for(const [x,y,z,ry,w,n,s,armC,blockC] of C.brows||[]){const U=hRot(ry,[1,0,0]),N=hRot(ry,[0,0,1]),gaps=[];
  for(const r of near(x,y,z,w/2+2)){if(!HLWINS.has(r[0]))continue;const B=hlOBB(r);const d=[B.c.x-x,B.c.y-y,B.c.z-z];
   const nd=d[0]*N[0]+d[2]*N[2],vd=d[1];if(Math.abs(nd)>1.2)continue;let hu=0,hv=0;for(let k=0;k<3;k++){hu+=B.e[k]*Math.abs(B.a[k].x*U[0]+B.a[k].z*U[2]);hv+=B.e[k]*Math.abs(B.a[k].y);}
   if(vd+hv<-.4||vd-hv>(s||1)*1.0)continue;const ud=d[0]*U[0]+d[2]*U[2];gaps.push([ud-hu-.14,ud+hu+.14]);}
  hnBracketRowNow(x,y,z,ry,w,n,s,armC,blockC,gaps);}
 let owed=false;const wide=it=>/^hM_[wg]_|^hForm[AWBT]$/.test(it);
 for(const m of C.murals||[]){if(owed&&wide(m.item)){m.item=HMOTIF.emblemWide;}const U=new THREE.Vector3(...hRot(m.ry,[1,0,0])),N=new THREE.Vector3(...hRot(m.ry,[0,0,1])),V=new THREE.Vector3(0,1,0);
  const candR=near(m.x,m.y+m.h/2,m.z,Math.max(m.w,m.h)+3),cand=candR.map(hlOBB);let placed=false;
  // search: biggest first, then nearest to where the builder put it — slide down (off a jetty/lintel) or sideways
  const tries=[];for(const k of[1,.86,.74,.62,.52])for(const fy of[0,-.25,.25,-.5,-.75,-1])for(const fx of[0,-.3,.3,-.6,.6])tries.push([k,fx,fy]);
  for(const [k,fx,fy] of tries){const w=m.w*k,h=m.h*k,cy=m.y+m.h/2+fy*m.h*.8,cu=fx*m.w*.8;const c=loc(m.x,m.z,cu,0,m.ry);
   const slab={c:new THREE.Vector3(c[0],cy,c[1]).addScaledVector(N,.18),a:[U,V,N],e:[w/2,h/2,.075]};   // n .105–.255: clears beams, quoins, friezes on the wall
   if(cand.some(B=>hlSAT(slab,B)))continue;const p=loc(m.x,m.z,cu,.095,m.ry);kput(m.item,[p[0],cy,p[1]],qEuler(0,m.ry,0),[w,h,1],null);placed=true;break;}
  const st=window._muralStats||(window._muralStats={placed:0,dropped:[]});if(placed){st.placed++;if(m.item===HMOTIF.emblemWide)owed=false;}else{st.dropped.push(C.D.key);if(m.item===HMOTIF.emblemWide)owed=true;}}   // a crowded emblem moves to the next wide mural
 C.flushing=false;C.inst=null;C.murals=null;C.brows=null;}
// VERN.place with the flush before the group transform closes (the vendored body, plus hlFlush()).
VERN.place=function(scene,key,x,z,ry,o){const D=VERN.defs[key];if(!D){reportErr('VERN.place: no such key '+key);return null;}
 o=Object.assign({w:1,v:0,scale:1,y:0},o||{});const G=new THREE.Group();G.position.set(x,o.y,z);G.rotation.y=ry||0;if(o.scale!==1)G.scale.setScalar(o.scale);scene.add(G);G.updateMatrix();
 KOFF=[0,0,0];useGroupXF(G);if(o.scale!==1)KXF.s=o.scale;VERN.cur={D,G,x,z,ry:ry||0,o,r0:REG.length};
 try{D.build(G,o);hlFlush();}catch(e){reportErr(key+' '+e.stack);}
 endGroupXF();VERN.cur=null;return G;};
