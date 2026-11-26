// ================================================================= XANADU — the lake craft (core/simulation/PROPOSAL-XANADU.md section 2a: owed)
// Erewhon's lake is Atitlán's pattern (the owner, 2026-11-16): dugouts out at dawn, launches on the runs, cargo boats between
// the towns. The kit had only the Sultan's pleasure barge and the quay's skiffs (87c). Three craft, each a def whose plot is
// its hull (+z the bow), drawn at the water's level (y 0 of the def = the waterline):
//   xa_dugout       the fishing dugout (cayuco): one log hollowed, 7 m, a paddle, a net and the catch; v0 empty, v1 a fisher
//                   at the paddle (out on the water), v2 drawn up on a beach (heeled a little, the paddle across it)
//   xa_launch       the passenger launch (lancha) of the scheduled runs and the market rounds: 13 m, a painted hull, an awning
//                   over benches, a lateen sail; v0 under sail, v1 the sail furled (moored)
//   xa_lake_barge   the cargo barge: 18 m, a square sail on a stub mast, sweeps, the load (bales, sacks, jars, timber)
// Painted in the lake towns' colours (the market boats' blues, reds and greens). Seeds 32960-32989.
// OPT-IN until the kit's next all-builds rebuild (kits/xanadu/README.md, "Opt-in pieces"): settlements/pher takes it.
const XLAKE_PAINT=[0x2a5aa8,0xc9442a,0x2f7a4a,0xe8a030,0x1d8a8a,0x8a3aa8,0xf4efe4];
function buildXaDugout(G,o){reseed(32961+(o.v|0));const V=xV(o),L=7,W=.9,c=xC(xPick(XLAKE_PAINT)),wood=xC(0x6a4a2a),beach=V===2,lean=beach?.08:0;
 vnReg('Dugout',0,0,4,1.5);
 vB('vWood',0,-.25,0,W,.55,L*.82,lean,wood);for(const s of[-1,1])kput('xConeP',[0,-.05,s*L*.43],qEuler(s*Math.PI/2,0,0),[W*.55,1.0,.45],wood);   // the log: the hull and its two tapered ends
 vB('xPaint',0,.04,0,W+.02,.09,L*.8,lean,c);vB('vDarkB',0,.06,0,W*.62,.06,L*.7,lean);   // the painted gunwale band and the dark hollow
 for(const z of[-1.6,1.4])vB('vWood',0,.05,z,W*.7,.06,.3,0,wood);   // the thwarts
 const pad=beach?[0,.18,0]:[.55,.12,-.6];xnMember('vWood',[pad[0]-.2,pad[1],pad[2]-1.1],[pad[0]+.2,pad[1]+.1,pad[2]+1.1],.06,.04,[0,1,0],xC(0x8a6a48));   // the paddle
 if(V!==0)kput('xLeaf',[0,.18,2.2],null,[.5,.25,.8],xC(0x8a7a48));   // the net in the bow
 if(V===1){vB('xPaint',0,.12,-.4,.4,.2,.6,0,xC(0x7a8a90));xnFolk(0,.05,-2.2,1,.2);}}   // the catch; the fisher
XA.def({key:'xa_dugout',name:'Dugout (cayuco)',family:'Lake craft',tags:{type:['industry'],wealth:'poor',lit:false},w:2,d:8,h:1.6,fw:1,fd:7,nv:3,build:buildXaDugout});
function buildXaLaunch(G,o){reseed(32971+(o.v|0));const V=xV(o),L=13,W=3.2,c=xC(xPick(XLAKE_PAINT)),c2=xC(xPick(XLAKE_PAINT)),wood=xC(0xa87848),dark=xC(0x5a4632),cloth=xC(xPick(XPAL.cloth));
 vnReg('Launch',0,0,7,6);
 vB('xPaint',0,-.5,0,W,1.0,L*.86,0,c);for(const s of[-1,1])kput('xConeP',[0,-.2,s*L*.45],qEuler(s*Math.PI/2,0,0),[W*.7,1.6,.9],c);   // the hull, its bow and stern
 vB('xPaint',0,.5,0,W+.06,.14,L*.86+.06,0,c2);vB('vWood',0,.42,0,W-.4,.08,L*.8,0,wood);   // the painted rubbing strake, the deck
 for(let k=0;k<4;k++){const z=-3.6+k*2;vB('vWood',0,.85,z,W-.7,.1,.5,0,wood);vB('vWood',0,.6,z-.25,W-.7,.45,.06,0,dark);}   // the benches
 // the awning on posts over the benches, the lateen sail on its mast forward
 for(const s of[-1,1])for(const z of[-4.4,.6])vPst('vPost',s*(W/2-.25),.5,z,.05,2.2,dark);vB('xPaint',0,2.75,-1.9,W-.1,.08,5.6,0,cloth);
 vPst('vPost',0,.5,3.4,.08,V===0?6.4:3.2,dark);
 if(V===0){xnMember('vWood',[0,2.0,5.6],[0,6.8,.4],.07,.05,[1,0,0],dark);kput('xLeaf',[.05,4.2,2.6],qEuler(0,Math.PI/2,0),[.05,3.8,4.2],xC(0xf0e6d0));}   // the yard and the sail
 else{vB('xPaint',0,1.6,1.8,.4,.4,3.6,0,xC(0xf0e6d0));}   // furled along the yard
 vB('vWood',0,.4,-L*.42,.18,.9,.4,0,dark);   // the rudder
 xnFolk(0,.45,-1.5,V===0?6:2,1.2);}
XA.def({key:'xa_launch',name:'Launch (lancha)',family:'Lake craft',tags:{type:['infrastructure'],wealth:'middle',lit:false},w:5,d:15,h:7.5,fw:3.2,fd:13,nv:2,build:buildXaLaunch});
function buildXaLakeBarge(G,o){reseed(32981+(o.v|0));const V=xV(o),L=18,W=5,c=xC(xPick(XLAKE_PAINT)),wood=xC(0x8a6a48),dark=xC(0x4a3a28);
 vnReg('Cargo barge',0,0,10,8);
 vB('vWood',0,-.6,0,W,1.2,L*.9,0,wood);for(const s of[-1,1])vB('vWood',0,-.3,s*L*.47,W*.8,.9,1.4,0,wood);   // the flat hull, its blunt ends
 vB('xPaint',0,.6,0,W+.08,.2,L*.9+.08,0,c);vB('vWood',0,.5,0,W-.5,.08,L*.84,0,dark);
 // the stub mast and its square sail (set or brailed up), the sweeps
 vPst('vPost',0,.5,2,.14,7,dark);vB('vWood',0,6.8,2,5.4,.14,.14,0,dark);
 if(V===0)kput('xLeaf',[0,4.6,2.05],null,[5,4.2,.06],xC(0xd8c8a0));else vB('xPaint',0,6.5,2.05,5.2,.45,.4,0,xC(0xd8c8a0));
 for(const s of[-1,1])for(const z of[-5,-2]){xnMember('vWood',[s*(W/2),.8,z],[s*(W/2+4.5),-.1,z+.6],.1,.07,[0,0,1],wood);}
 // the load: bales and sacks amidships, jars forward, a timber stack aft
 for(let i=0;i<6;i++)kput('vThatchB',[-1.2+(i%3)*1.2,.95,-1+Math.floor(i/3)*1.2],null,[1.1,.8,1],xC(xPick(VPAL.thatch)));
 vnSacks(1.2,.6,-4.5,5);for(let i=0;i<4;i++)vnBarrel(-1.4+i*.9,.6,5.5,.3,.8,xC(0xb8783a));
 for(let i=0;i<4;i++)vB('vWood',0,.7+i*.22,-7,3.6,.2,.3+(i%2)*.05,0,xC(0xa87848));
 xnFolk(0,.55,-6.5,3,1.5);}
XA.def({key:'xa_lake_barge',name:'Cargo barge',family:'Lake craft',tags:{type:['industry','infrastructure'],wealth:'poor',lit:false},w:15,d:20,h:8,fw:5,fd:18,nv:2,build:buildXaLakeBarge});
