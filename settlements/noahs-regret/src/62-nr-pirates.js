// prefix: nr
// ================================================================= THE PIRATES' TIMBER: the ways down to the beach and the water, awnings, flags
// What Ruephus's crews built on the Ancients' hull, in salvaged timber, rope and sheet: switchback stair TOWERS from the
// outer promenade (D1) up the starboard hull to the top deck; flights of STEPS from the promenade down the dune to the
// beach (the shanty town that will grow there comes with the settlement); FLOATS, timber pontoons on barrels at the
// water off the inner quay with a stair down to each, for the boats; sailcloth AWNINGS over the promenade by the
// barracks; flags on the mouth's beacons. Each is a child def (class feature) placed in the hull frame by the arcology.
// Frame of each: origin on the ledge (y 0 = D1), +z outboard (away from the main block), x along the ring.
const NR_PT_COL={post:0x6a5038,plank:0xa08058,rail:0x5a4632};
/* a timber post from y0 to y1 at (x, z), a plank deck at y, a flight of steps from (x0, y0) to (x1, y1) at z0..z1 */
function nrPost(x,z,y0,y1){box('tarred',x,y0,z,.22,y1-y0,.22,hc(NR_PT_COL.post));}
function nrDeck(x0,x1,z0,z1,y){const n=Math.max(1,Math.round((x1-x0)/.32));for(let i=0;i<n;i++)if(rng()<.96)box('timber',lerp(x0,x1,(i+.5)/n),y-.06,(z0+z1)/2,(x1-x0)/n*.92,.06,z1-z0,P('timber'));
 for(const z of [z0+.1,z1-.1])box('tarred',(x0+x1)/2,y-.22,z,x1-x0,.16,.12,hc(NR_PT_COL.post));}
function nrSteps(x0,y0,x1,y1,z0,z1,rails){const rise=y1-y0,n=Math.max(2,Math.round(Math.abs(rise)/.19)),dx=(x1-x0)/n,dy=rise/n;
 for(let i=0;i<n;i++){const x=x0+dx*(i+.5),y=y0+dy*(i+1);box('timber',x,y-.05,(z0+z1)/2,Math.abs(dx)*.95,.05,z1-z0,P('timber'));}
 for(const z of [z0+.05,z1-.05])beam('tarred',[x0,y0-.1,z],[x1,y1-.1,z],.08,hc(NR_PT_COL.post),false,0,.28);
 if(rails)for(const z of [z0-.02,z1+.02].slice(rails===1?1:0)){beam('tarred',[x0,y0+.95,z],[x1,y1+.95,z],.05,hc(NR_PT_COL.rail),true,6);
  for(let i=0;i<=n;i+=3){const x=x0+dx*i,y=y0+dy*i;beam('tarred',[x,y,z],[x,y+.95,z],.05,hc(NR_PT_COL.rail),true,5);}}}
/* the switchback tower: six flights of 2.4 m against the hull (z -2.6..0), landings at the ends, posts, the gangway over the
   parapet at the top */
function nrPirateTower(){const H=NR.L.TOP-NR.L.D[0],n=6,rise=H/n,XA=-2.4,XB=2.4;reseed(6100);
 for(const x of [-3.6,-2.4,2.4,3.6])for(const z of [-2.65,-.05])nrPost(x,z,0,H+1.2);
 for(let k=0;k<n;k++){const y0=k*rise,y1=y0+rise,even=k%2===0,z0=even?-2.6:-1.3,z1=even?-1.4:-.1;
  nrSteps(even?XA:XB,y0,even?XB:XA,y1,z0,z1,even?0:1);
  const lx=even?XB:XA;nrDeck(lx<0?-3.6:2.4,lx<0?-2.4:3.6,-2.6,-.05,y1);
  /* bracing: an X of timber on each bay */
  beam('tarred',[-3.6,y0,-.05],[3.6,y1,-.05],.08,hc(NR_PT_COL.post));}
 /* the stile at the top: from the last landing (x -3.6..-2.4) up over the parapet (local z -3.1..-2.8) and down onto the deck */
 const st=(z0,z1,y0,y1)=>{const n=Math.max(2,Math.round(Math.abs(y1-y0)/.2));for(let i=0;i<n;i++){const z=lerp(z0,z1,(i+.5)/n),y=lerp(y0,y1,(i+1)/n);box('timber',-3,y-.05,z,1.2,.06,Math.abs(z1-z0)/n*.95,P('timber'));}};
 st(-.6,-2.5,H,H+1.3);nrDeck(-3.6,-2.4,-3.5,-2.5,H+1.32);st(-3.5,-5.6,H+1.3,H);
 for(const z of [-3.5,-2.5])nrPost(-3.62,z,H,H+2.3);box('tarred',0,H+1.0,-.05,7.2,.08,.08,hc(NR_PT_COL.rail));}
defBuilding({key:'nr-pirate-tower',name:'Pirate stair tower (to the top deck)',seed:6100,cls:'feature',kind:'stair',
 tags:{culture:'post-apoc',style:'pirate-built: salvaged timber',state:'salvage'},w:8,d:7,h:NR.L.TOP-NR.L.D[0]+1.5,budget:60000,
 note:'a switchback of six timber flights up the starboard hull from the outer promenade to the top deck',build(){nrPirateTower();}});
/* steps from the outer promenade down to the sand: o.drop the height to fall, run outboard (+z) */
function nrPirateSteps(o){reseed(6200+(o.v|0));const drop=Math.max(.6,o.drop||3),run=drop/.62,w=2.2;
 const n=Math.max(2,Math.round(drop/.2));
 for(let i=0;i<n;i++){const z=(i+.5)/n*run+.2,y=-(i+1)/n*drop;box('timber',0,y-.05,z,w,.06,run/n*.95,P('timber'));}
 for(const x of [-w/2+.08,w/2-.08]){beam('tarred',[x,-.1,0],[x,-drop-.1,run+.2],.1,hc(NR_PT_COL.post),false,0,.3);
  for(let i=1;i<4;i++){const f=i/4;nrPost(x,f*run,-drop*f-2,-drop*f+.9);}
  beam('tarred',[x,.95,0],[x,-drop+.95,run],.05,hc(NR_PT_COL.rail),true,6);}}
defBuilding({key:'nr-pirate-steps',name:'Pirate steps (to the beach)',seed:6200,cls:'feature',kind:'stair',
 tags:{culture:'post-apoc',style:'pirate-built: salvaged timber',state:'salvage'},w:3,d:12,h:8,budget:30000,
 note:'a flight of timber steps from the outer promenade down the dune to the beach',build(o){nrPirateSteps(o);}});
/* a float: a timber pontoon on barrels at the water, a stair down the quay wall to it. o.drop: quay to float deck */
function nrPirateFloat(o){reseed(6300);const drop=o.drop||3.5,L=14,Wd=5.5,z0=1.2;
 for(let i=0;i<10;i++){const x=-L/2+.7+(i%5)*((L-1.4)/4),z=z0+(i<5?.9:Wd-.9);cyl('rust',x,-drop-.9,z,.45,.9,WHITE,10);}
 nrDeck(-L/2,L/2,z0,z0+Wd,-drop+.05);
 for(const x of [-L/2+.3,L/2-.3])for(const z of [z0+.2,z0+Wd-.2])nrPost(x,z,-drop-.4,-drop+1.0);
 /* the stair down the quay wall, along it */
 nrSteps(4.5,0,-1.5,-drop+.05,-.05,1.1,1);
 for(const x of [4.5,-1.5])nrPost(x,1.1,-drop-.5,.2);}
defBuilding({key:'nr-pirate-float',name:'Pirate float (a boat landing)',seed:6300,cls:'feature',kind:'pier',
 tags:{culture:'post-apoc',style:'pirate-built: salvaged timber on oil drums',state:'salvage'},w:15,d:8,h:8,budget:30000,
 note:'a timber pontoon on drums at the water off the inner quay, for boats; a stair down to it',build(o){nrPirateFloat(o);}});
/* an awning: sailcloth on four poles over the promenade */
function nrAwning(o){reseed(6400+(o.v|0));const L=o.L||9,D=4.2,h=3.1;
 for(const x of [-L/2,L/2])for(const z of [-D/2,D/2])beam('tarred',[x,0,z],[x,h+(z<0?.4:0),z],.07,hc(NR_PT_COL.post),true,6);
 psurf('sail',(u,v)=>[lerp(-L/2,L/2,u),h+.4*(1-v)-.25*Math.sin(PI*u)*Math.sin(PI*v),lerp(-D/2,D/2,v)],8,4,P(o.v%2?'sailR':'sail'),{up:true});}
defBuilding({key:'nr-pirate-awning',name:'Pirate awning (sailcloth)',seed:6400,cls:'feature',kind:'awning',
 tags:{culture:'post-apoc',style:'pirate-built: an old sail on poles',state:'salvage'},w:10,d:5,h:3.8,budget:8000,
 note:'an old sail stretched on four poles over the promenade',build(o){nrAwning(o);}});
nrAfter('pirates',function(){const L=NR.L,W=NR.W;
 const at=(t,s,face)=>{const p=NR.at(t,s),n=NR.nrm(t),dz=face==='in'?-1:1;return {x:p[0],z:p[1],ry:Math.atan2(n[0]*dz,n[1]*dz)};};
 for(const T of NR.TOWERS){const q=at(T.t,W.MAIN+2.8,'out');place('nr-pirate-tower',q.x,q.z,q.ry,{y:L.D[0]});}
 for(const [i,S] of NR.STEPS.entries()){const q=at(S.t,W.PONT,'out');const w=nrH2W(q.x,L.D[0],q.z),n=NR.nrm(S.t);
  /* the sand where the steps come down (about 3.5 m out): the drop is the ledge's height above it, in the hull frame */
  const foot=NR.at(S.t,W.PONT+3.5),fw=nrH2W(foot[0],0,foot[1]),g=terrainH(fw[0],fw[2]),gh=nrW2H(fw[0],g,fw[2])[1];
  place('nr-pirate-steps',q.x,q.z,q.ry,{y:L.D[0],v:i,drop:clamp(L.D[0]-gh,.6,8)});}
 for(const F of NR.FLOATS){const q=at(F.t,-W.PONT,'in'),sea=nrSeaHullY(q.x,q.z);place('nr-pirate-float',q.x,q.z,q.ry,{y:L.D[0],drop:L.D[0]-sea-.45});}
 let v=0;for(const Lt of NR.LOTS){if(Lt.use!=='barracks')continue;const q=at(Lt.t+(Lt.key==='nr-anc-apt-drum'?-14:-21),Lt.face==='in'?-16.5:16.5,Lt.face==='in'?'in':'out');place('nr-pirate-awning',q.x,q.z,q.ry,{y:L.TOP,v:v++,L:8});}
 /* flags on the beacons at the breakwater piers' heads (41) */
 for(const B of NR.BEACONS)nrPirateFlag(B.x,L.D[0]+17.5,B.z,4.5,3.2,2.1,0);});
