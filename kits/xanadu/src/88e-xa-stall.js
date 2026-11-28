// ================================================================= XANADU — the market stall (the fairs of the lake towns)
// A trestle stall under a cloth awning on four poles, its goods laid out by trade: v0 cloth and dyed silk, v1 cacao, fruit and
// honey, v2 pots and baskets, v3 fish and salt. 4 x 3 m. Phēr's fair ground fills with them (settlements/pher). Seeds
// 32950-32959. In src/ and FILES since Stage 8 B9 (2026-11-24); before that OPT-IN in extra/ (kits/xanadu/README.md, "Opt-in pieces").
function buildXaStall(G,o){reseed(32951+(o.v|0));const V=xV(o)%4,W=3.6,D=2.4,cloth=xC(xPick(XPAL.cloth)),wood=xC(xPick(XPAL.timber)),dark=xC(0x5a4632);
 vnReg('Market stall',0,0,2.5,3);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.1),0,sz*(D/2-.1),.05,2.5,dark);
 vnAwning(0,2.5,0,0,W+.4,D+.6,cloth);
 vB('vWood',0,.8,.3,W-.3,.08,1.1,0,wood);for(const sx of[-1,1])vB('vWood',sx*(W/2-.4),0,.3,.08,.8,1,0,dark);   // the trestle table
 const G2=[[0xb83a3a,0x2a5aa8,0xe8a030,0x8a3aa8],[0x5a3418,0xd8783a,0xe0b030,0x6a8a2a],[0xb8683a,0x9a7a48,0x7a5a38,0xc8a070],[0x9aa8b0,0xf0ece4,0x7a8a90,0xe8e4dc]][V];
 for(let i=0;i<6;i++){const x=-W/2+.5+i*(W-1)/5,c=xC(G2[i%4]);
  if(V===0)vB('xPaint',x,.88,.3,.45,.12+(i%2)*.06,.8,0,c);
  else if(V===1)vBall('xPaint',x,.98,.3,.17,c);
  else if(V===2)kput('vBarrel',[x,.88,.3],null,[.2,.36,.2],c);
  else vB('xPaint',x,.88,.3,.4,.1,.6,0,c);}
 vnSacks(-W/2+.4,0,-D/2+.3,2);xnFolk(0,0,-.6,1,.3);}
XA.def({key:'xa_stall',name:'Market stall',family:'Trade',tags:{type:['market/shop'],wealth:'poor',lit:false},w:5,d:4,h:3,fw:3.6,fd:2.4,nv:4,build:buildXaStall});
