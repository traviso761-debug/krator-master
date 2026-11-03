// ================================================================= HIGHLANDS / TRIBAL — the salvage villages (round 10)
// Travis: "give the Rustic and Tribal sets some post-apoc and reclaimed buildings". The tribes lift the wreck off the
// ground like everything else they build: tanks, containers, silos and hull panels go up on stilts and bamboo, under
// thatch, and get painted — formline on white, teal and red on black — with trophy horns, totems, gourds and fire
// cages. No electric light. All born reclaimed (tags.salvage): no `_reclaimed` twins. Seeds 26000–26099.

// ---------------------------------------------------------------- 1. the tank roundhouse
// An Ancient tank stood on end on a stilted log deck: a door cut in it, a painted band round it at eye height, a
// steep thatch cone set on its rim with a carved bird on the peak; a bamboo rail round the deck, a ladder, gourds and
// a fire cage from the eaves, a winged totem at the foot.
function buildHlTriTankRound(G,o){reseed(26001+(o.v|0));const R=2,H=3.6,FL=1.5,Y=FL;
 const rust=hC(vPick(HSV.rust)),log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch));
 vnReg('Tank roundhouse',0,0,5,Y+H+5.5);
 vnStilts(0,0,0,2*R+1.6,2*R+1.6,FL,0,log);vB('vWood',0,Y-.2,.4,2*R+2.2,.2,2*R+3,0,log);
 kput('hTankC',[0,Y+H/2,0],null,[R,H,R],rust);
 for(const yy of[Y+.3,Y+H-.3])kput('vHoop',[0,yy,0],qEuler(Math.PI/2,0,0),[R+.02,R+.02,1.4],rust.clone().multiplyScalar(.6));
 kput('hTRBandCyl',[0,Y+1.9,0],null,[R+.05,.7,R+.05],null);
 vnPatch(-1.2,Y+.4,-R+.05,Math.PI,1.4,1.2,3);
 vnDoor(0,Y,R+.03,0,.9,1.8,'vWood',bam,hC(0x5a4a3a),false);
 for(const s of[-1,1])hnForm('hFormV',s*.95,Y+.15,R-.12,s*-.45,.5,1.6);
 vnThatchCone(0,Y+H,0,R+.6,3.8,th);
 vPst('vPost',0,Y+H+3.4,0,.07,1,log);kput('hPaintBall',[0,Y+H+4.4,0],null,[.18,.22,.18],hC(HPAL.black));
 for(const s of[-1,1])kput('hWing',[s*.55,Y+H+4.45,0],qEuler(0,0,s*-.2),[s*1.1,.55,1],null);
 const rz=R+1.8;hnBambooRail([-R-1,Y,rz],[-.7,Y,rz],bam,.95);hnBambooRail([.7,Y,rz],[R+1,Y,rz],bam,.95);
 for(let k=0;k<5;k++){const a=(k+.5)/5*Math.PI-Math.PI/2;(k===2?hnTRCage:hnTRGourd)(Math.sin(a)*(R+.45),Y+H+.1,Math.cos(a)*(R+.45));}
 vnLadder(0,0,rz+.5,0,FL+.3,log);hnTotem(-2.6,0,rz+.8,.28,5,0,{wings:1.3,painted:true});
 hnFirepit(2.6,0,rz+2.2,.6);vnFolk(0,rz+3.2,2,1.5);}

// ---------------------------------------------------------------- 2. the container longhouse
// Two containers end to end on a log stilt frame are the family rooms; a great thatch gable on bamboo posts spans
// them and a veranda along the front; the container flank facing the veranda painted over in formline boards, black
// thunderbird bargeboards, trophy horns at both apexes, ladders at the ends, drying racks and gourds.
function buildHlTriContLong(G,o){reseed(26011+(o.v|0));const L=12.2,FL=1.8,Y=FL,CH=2.6,D=2.44,V=2.2;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch)),blk=hC(HPAL.black);
 vnReg('Container longhouse',0,.6,8,Y+CH+5.5);
 vnStilts(0,0,.6,L,D+V,FL,0,log);vB('vWood',0,Y-.2,.6,L+.6,.2,D+V+.4,0,log);
 hnCont(-L/4,Y,-.5,0,L/2-.05,hContC(),{});hnCont(L/4,Y,-.5,0,L/2-.05,hContC(),{});
 const fz=-.5+D/2+.05;for(const u of[-4.5,-1.5,1.5,4.5])hnForm('hFormW',u,Y+.2,fz,0,2.5,2.1);
 for(const u of[-3,3])vnDoor(u,Y,fz+.08,0,.9,1.9,'vWood',bam,hC(0x5a4a3a),false);
 // the thatch gable on bamboo posts, over the containers and the veranda
 const GD=D+V+1.2,gz=.6,y0=Y+CH+.5;for(let i=0;i<=5;i++)for(const s of[-1,1]){const x=-L/2-.2+(L+.4)*i/5;vPst('hBamboo',x,Y,gz+s*(GD/2-.2),.1,CH+.5,bam);}
 for(const s of[-1,1])kput('hLogX',[0,y0-.1,gz+s*(GD/2-.2)],null,[L+.8,.12,.12],bam);
 const pitch=1.1,rise=pitch*GD/2;hnGable(0,y0,gz,L+.4,GD,pitch,0,'vGableT',th,.8,null,null);hnBarge(0,y0,gz,L+.4,GD,rise,0,.8,blk,'bird');
 for(const e of[-1,1])hnTRHorns(e*(L/2+.9),y0+rise+.2,gz,e>0?Math.PI/2:-Math.PI/2,1.1);
 const vz=gz+GD/2-.25;hnBambooRail([-L/2,Y,vz],[-1,Y,vz],bam,.95);hnBambooRail([1,Y,vz],[L/2,Y,vz],bam,.95);
 for(let k=0;k<6;k++)hnTRGourd(-L/2+1+k*2,y0-.15,vz+.1);
 vnLadder(0,0,vz+.55,0,FL+.3,log);vnLadder(-L/2-.7,0,.6,Math.PI/2,FL+.3,log);
 hnDryingRack(0,0,vz+3,0,6);hnTotem(4,0,vz+1.4,.26,5,0,{wings:1.4});hnFirepit(-3.5,0,vz+3.2,.6);vnFolk(2,vz+4,3,2.5);}

// ---------------------------------------------------------------- 3. the hull meeting house
// A curved panel of rocket hull, laid on two rows of carved house-posts, is the roof of a meeting house; the back is
// walled in split planks under the arc, the front open on a painted threshold under a formline crest, trophy horns
// on the crown, a brazier on each side of the way in, antler poles, benches round the hearth inside.
function buildHlTriHullHall(G,o){reseed(26021+(o.v|0));const L=14,R=5.2,arc=Math.PI*.84,he=Math.cos(arc/2)*R,hw=Math.sin(arc/2)*R,eave=2.6,yc=eave-he;
 const hull=hC(vPick([0x9a968c,0x8e8a80,0xa49e90])),rust=hC(vPick(HSV.rust)),log=hC(vPick(HPAL.aged)),rub=hC(vPick(HPAL.rubble));
 vnReg('Hull meeting house',0,0,10,yc+R+2);
 vB('vStone',0,0,0,2*hw+.6,.3,L+.6,0,rub);
 kput('hVault',[0,.3+yc,0],qEuler(0,Math.PI/2,0),[L,R,R],hull);
 for(let k=0;k<=6;k++)kput('hVaultR',[0,.3+yc,-L/2+L*k/6],qEuler(0,Math.PI/2,0),[.3,R+.06,R+.06],rust);
 for(let k=0;k<5;k++)for(const s of[-1,1]){const z=-L/2+.8+(L-1.6)*k/4;hnTotemPost(s*(hw-.3),.3,z,.2,eave-.3,s>0?-Math.PI/2:Math.PI/2,k%2===0);}
 for(let u=-hw+.4;u<hw;u+=.8){const h=yc+Math.sqrt(Math.max(0,R*R-u*u))-.1;vB('vWood',u,.3,-L/2+.1,.82,h,.14,0,log);}
 hnForm('hFormA',0,eave+.4,L/2-.1,0,5.4,2);
 hnTRHorns(0,.3+yc+R+.1,L/2-1,0,1.4);hnTRHorns(0,.3+yc+R+.1,-L/2+1,Math.PI,1.1);
 for(const s of[-1,1]){hnTRBrazier(s*2.4,.3,L/2+1.2,1);hnFurn('hl_tri_antler_pole',s*(hw+1.4),0,L/2+.8,0,{},0,-.18);}
 hnFirepit(0,.3,0,.9);for(const s of[-1,1])for(const z of[-3,3])FURNISH('hl_tri_hearth_bench',s*2.2,.3,z,Math.PI/2);
 hnTotem(-hw-2.2,0,L/2-1,.3,6,0,{wings:1.6,painted:true,hat:true});vnFolk(0,L/2+3.5,4,3);}

// ---------------------------------------------------------------- 4. the silo drum-house
// A corrugated silo cut down to a drum on a fieldstone ring is the house wall: a painted band round it, a door and two
// window holes sawn through, a deep thatch cone on a ring of bamboo rafters oversailing it as a veranda roof on
// posts, a carved bird at the peak, gourds and a fire cage under the eaves, a stilted granary basket beside it.
function buildHlTriSiloDrum(G,o){reseed(26031+(o.v|0));const R=3,H=3,RO=R+1.3;
 const corr=hC(vPick(HSV.corr)).lerp(hC(vPick(HSV.rust)),rr(.2,.55)),log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch)),rub=hC(vPick(HPAL.rubble));
 vnReg('Silo drum-house',0,0,5.5,H+6);
 vPst('hTRDisc',0,0,0,RO+.2,.3,rub);kput('hSiloC',[0,.3,0],null,[R,H,R],corr);
 kput('hTRBandCyl',[0,1.5,0],null,[R+.05,.7,R+.05],null);kput('vHoop',[0,H+.2,0],qEuler(Math.PI/2,0,0),[R+.03,R+.03,1.4],hC(vPick(HSV.rust)));
 vnDoor(0,.3,R+.03,0,1,1.9,'vWood',bam,hC(0x5a4a3a),false);
 for(const a of[1.1,-1.1]){const x=Math.sin(a)*(R+.02),z=Math.cos(a)*(R+.02);vB('vDarkB',x,1.6,z,.7,.6,.06,a);}
 for(let k=0;k<12;k++){const a=k/12*TAU+.13;vPst('hBamboo',Math.sin(a)*RO,.3,Math.cos(a)*RO,.08,H-.1,bam);}
 vnThatchCone(0,H+.3,0,RO+.3,4.4,th);
 vPst('vPost',0,H+4.2,0,.07,1,log);kput('hPaintBall',[0,H+5.2,0],null,[.18,.22,.18],hC(HPAL.black));
 for(const s of[-1,1])kput('hWing',[s*.55,H+5.25,0],qEuler(0,0,s*-.2),[s*1.1,.55,1],null);
 for(let k=0;k<7;k++){const a=(k+.5)/7*TAU;(k%3===0?hnTRCage:hnTRGourd)(Math.sin(a)*(RO+.2),H+.1,Math.cos(a)*(RO+.2));}
 const gx=RO+3.2;vnStilts(gx,0,-1,2.2,2.2,1.6,0,log);vB('vWood',gx,1.6,-1,2.8,.16,2.8,0,log);kput('hTRMatCyl',[gx,1.76,-1],null,[1.1,1.4,1.1],bam);vnThatchCone(gx,3.16,-1,1.5,2,th);
 hnTotemPole(-RO-1.2,0,1.5,.16,3,0,true);hnFirepit(-1.5,0,RO+2.4,.6);hnDryingRack(1.5,0,RO+3.4,0,3.4);vnFolk(0,RO+2.2,2,1.8);}

// ---------------------------------------------------------------- 5. the scrap forge and trading shelter
// A long open shelter under a thatch gable on painted posts, where scrap is beaten into blades and hoes and traded:
// a forge of stacked plate with its bellows and anvil, a quench trough, racks of sheet and wheels; a container store
// behind with its doors painted over in formline, trophy horns on the apex, braziers, a hide-drum under the eaves.
function buildHlTriScrapForge(G,o){reseed(26041+(o.v|0));const W=12,D=6,H=2.8;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch)),rub=hC(vPick(HPAL.rubble)),iron=hC(0x3a3430),blk=hC(HPAL.black);
 vnReg('Scrap forge',0,0,8,H+5);
 vB('vStone',0,0,0,W+.4,.2,D+.4,0,rub);
 for(let i=0;i<=4;i++)for(const s of[-1,1])hnTotemPost(-W/2+.2+(W-.4)*i/4,.2,s*(D/2-.2),.15,H-.2,0,i%2===0);
 for(const s of[-1,1])kput('hLogX',[0,H,s*(D/2-.2)],null,[W+.4,.14,.14],log);
 const pitch=1.05,rise=pitch*D/2;hnGable(0,H+.1,0,W,D,pitch,0,'vGableT',th,.8,'hGableBM',bam);hnBarge(0,H+.1,0,W,D,rise,0,.8,blk,'bird');
 hnTRHorns(W/2+.9,H+.1+rise+.2,0,Math.PI/2,1);hnTRHorns(-W/2-.9,H+.1+rise+.2,0,-Math.PI/2,1);
 // the forge
 // the stacked-plate forge with its bellows, the anvil and the quench trough are furniture from the catalog (the plates
 // drew 4 numbers); the flue on up through the thatch from the forge's own stovepipe is the shelter's
 hlRngSkip(4);hnFurn('hl_tri_forge',-3.5,.2,-.8,0,{v:1},-.6,0);vnChimney(-3.5,3.4,-1.3,H+rise+.6-1.9,.18,true);
 FURNISH('hl_tri_scrap_anvil',-1.8,0,-.4,0,{v:1});FURNISH('hl_tri_quench_tub',-1.2,.2,1.3,0,{v:1});
 for(let k=0;k<5;k++)kput(vPick(['vPlate','vSheet','vPlateW']),[1+k*.9,1.1,-D/2+.5],qEuler(-.25,0,rr(-.1,.1)),[.8,1.6,1],null);
 for(let k=0;k<3;k++)kput('vHoop',[4.8,.7+k*.05,.6+k*.4],qEuler(0,Math.PI/2+rr(-.3,.3),0),[.6,.6,1.5],iron);
 hnTRBrazier(W/2-1,.2,D/2+1.2,.9);hnTRBrazier(-W/2+1,.2,D/2+1.2,.9);
 // the store behind: a container, its doors painted over
 hnCont(1,0,-D/2-2.2,0,6,hContC(),{});hnForm('hFormW',1,.25,-D/2-2.2+1.26,0,5,2.1);
 for(let k=0;k<5;k++)hnTRGourd(-4+k*2,H-.05,D/2+.3);
 vnFolk(0,D/2+2.8,4,3);hnTRBeast(-W/2-2,0,2,.4,'goat');}

HL.def({key:'hl_tri_tank_round',name:'Tank roundhouse',branch:'tribal',family:'Salvage',tags:HTAG_SALV('poor',['single-family dwelling']),w:11,d:16,h:11,build:buildHlTriTankRound});
HL.def({key:'hl_tri_cont_long',name:'Container longhouse',branch:'tribal',family:'Salvage',tags:HTAG_SALV('middle',['multi-family dwelling']),w:18,d:16,h:11,build:buildHlTriContLong});
HL.def({key:'hl_tri_hull_hall',name:'Hull meeting house',branch:'tribal',family:'Salvage',tags:HTAG_SALV('middle',['civic']),w:18,d:24,h:11,build:buildHlTriHullHall});
HL.def({key:'hl_tri_silo_drum',name:'Silo drum-house',branch:'tribal',family:'Salvage',tags:HTAG_SALV('poor',['single-family dwelling','farm']),w:20,d:18,h:10,build:buildHlTriSiloDrum});
HL.def({key:'hl_tri_scrap_forge',name:'Scrap forge',branch:'tribal',family:'Salvage',tags:HTAG_SALV('poor',['industry','market/shop']),w:18,d:16,h:8,build:buildHlTriScrapForge});
