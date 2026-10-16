// prefix: nr
// ================================================================= PARK FLORA: PLACEHOLDERS (to be replaced by the shore's biome kit)
// The top deck's beds went to meadow and scrub in a thousand years; a few trees seeded themselves. No biome kit is named
// for the Ring Sea's south shore yet, so these are PLACEHOLDERS (README.md: a separate plant, tagged, placed; expect it
// to be replaced): two species as their own defs (class flora), never part of a building, tagged by climate and use.
const NR_FLORA_TAGS={biome:'placeholder: Ring Sea south shore (mild, temperate, non-abyssal, non-riparian)',koppen:'Csa'};
function nrShadeTree(o){reseed(6500+(o.v|0));const h=rr(5.5,8),r=rr(2.2,3.2);
 const lean=rr(-.25,.25);beam('tarred',[0,0,0],[lean,h*.62,lean*.5],.22,hc(0x5a4632),true,8,.14);
 for(let i=0;i<5;i++){const a=i/5*TAU+rr(0,1),d=r*rr(.2,.7);sph('turf',lean+Math.cos(a)*d,h*rr(.62,.92),lean*.5+Math.sin(a)*d,r*rr(.55,.85),hc(pick([0x5a7a3a,0x4e6e32,0x668642])),rr(.6,.8),10);}}
defBuilding({key:'nr-flora-shade-tree',name:'Shade tree (placeholder)',seed:6500,cls:'flora',kind:'tree',
 tags:Object.assign({harvest:{edible:false,wood:true}},NR_FLORA_TAGS),w:7,d:7,h:9,budget:4000,
 note:'a placeholder broadleaf for the parks: replace with the south shore biome kit\'s',build(o){nrShadeTree(o);}});
function nrFanPalm(o){reseed(6600+(o.v|0));const h=rr(5,8),bend=rr(-.6,.6),top=[bend,h,bend*.4];
 tube('tarred',t=>[bend*t*t,h*t,bend*.4*t*t],t=>[.22-.08*t,.22-.08*t],10,6,hc(0x6a5a44));
 for(let i=0;i<9;i++){const a=i/9*TAU,l=rr(2,2.8),tip=[top[0]+Math.cos(a)*l,top[1]-rr(.3,1.2),top[2]+Math.sin(a)*l];
  plane4('turf',top,tip,[top[0]+Math.cos(a+.35)*l*.6,top[1]-.2,top[2]+Math.sin(a+.35)*l*.6],.04,hc(0x5e8040));}}
defBuilding({key:'nr-flora-fan-palm',name:'Fan palm (placeholder)',seed:6600,cls:'flora',kind:'tree',
 tags:Object.assign({harvest:{edible:false,fibre:true}},NR_FLORA_TAGS),w:6,d:6,h:9,budget:3000,
 note:'a placeholder palm for the stern garden: replace with the south shore biome kit\'s',build(o){nrFanPalm(o);}});
nrAfter('flora',function(){const L=NR.L;reseed(6700);let v=0;
 for(const K of NR.PARKS){const stern=!!K.garden,n=stern?6:Math.max(1,Math.round((K.t1-K.t0)/12));
  for(let i=0;i<n;i++){const t=lerp(K.t0+4,K.t1-4,n>1?i/(n-1):.5),s=(i%2?1:-1)*rr(5,10);
   if(stern&&Math.abs(t-(K.t0+K.t1)/2)<8)continue;
   const p=NR.at(t,s);place(stern?'nr-flora-fan-palm':'nr-flora-shade-tree',p[0],p[1],rr(0,TAU),{y:L.TOP+.38,v:v++});}}});
