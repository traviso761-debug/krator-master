// TARGET: graveyard - station 2 of the dam basins (biomes/dambasins/PLAN.md, section 3; the site: 79-db-site.js).
// No port: the layout is the pile alone, every hulk a free vessel of the Ancient Port kit, grounded by 81-db-hulks.js.
// THE PILE (the hulks' second population, nsemiarid/PLAN.md section 5: "drawn by the outflow toward the breach and piled
// in the notch approach"): the outflow carried the ships down the channel bow first and the throat stopped them. The first
// to arrive jammed broadside across it just above the gap; the next drove onto them and swung, so the pile is thickest and
// most crosswise at the throat and loosens upstream into ships lying along the flow, bows downstream. Each hulk is tried at
// a KRAND-hashed spot and turn (the place and a salt: no stream is drawn) and kept only where its hull clears every one
// placed before it; the burial and the list are the grounding's (81). Decay 1 (abandoned) and 3 (salvage: the scrappers
// work the pile).
const TITLE='Krator — the dam basins: the ship graveyard at the west notch';
const PORT_LAYOUT_DEF=(()=>{const VR=PORT_REG.vessel,ku=KRAND.unit,H=KRAND.hash;
 // what the lake carried, by weight: its working fleet (feeders, Panamaxes), a few giants, the navy's (a drone carrier, a submarine)
 const MIX=[['vsFeeder',5],['vsPanamax',4],['vsGiant',1.2],['slCarrier',.6],['slSub',.8]].filter(m=>VR[m[0]]);
 const tot=MIX.reduce((s,m)=>s+m[1],0),pickV=r=>{let t=r*tot;for(const m of MIX){if(t<m[1])return m[0];t-=m[1];}return MIX[0][0];};
 // a hull's footprint as circles down its keel (beam/2 + a margin), for the clearance test
 const disks=(x,z,h,L,B)=>{const n=Math.max(3,Math.ceil(L/(B*.9))),o=[],fx=Math.sin(h),fz=Math.cos(h);
  for(let k=0;k<n;k++){const t=(k+.5)/n-.5;o.push([x+fx*L*t*.94,z+fz*L*t*.94,B*.5+5]);}return o;};
 const placed=[],items=[];
 for(let i=0;i<34&&placed.length<13;i++){
  const key=pickV(ku(H(7301,i,1))),V=VR[key],L=V.length,B=V.hullBeam||V.beam;
  for(let tr=0;tr<30;tr++){const s=H(7301,i,tr+11);
   // down the pile: the throat first (z near its foot), each later ship a little further up the channel
   const z=GY_PILE.z1-L*.45-(GY_PILE.z1-GY_PILE.z0)*Math.pow(ku(H(s,2)),1.4)*Math.min(1,.25+i/16),C=gyChan(z),ax=gyAxis(z);
   const x=ax+(ku(H(s,3))*2-1)*Math.max(0,C.w*.95-B*.6);
   // broadside at the throat, along the flow upstream (bow downstream, +z: heading 0)
   const across=ku(H(s,4))<.75*gySm(GY_PILE.z0+600,GY_PILE.z1,z);
   const h=across?(ku(H(s,5))<.5?1:-1)*(Math.PI/2+(ku(H(s,6))-.5)*.6):(ku(H(s,6))-.5)*.7;
   const D=disks(x,z,h,L,B);
   if(placed.some(P=>P.D.some(a=>D.some(b=>Math.hypot(a[0]-b[0],a[1]-b[1])<a[2]+b[2]))))continue;
   // it must lie on the channel's flat floor (its hull within it, a little over at the turn of the bilge): none up the walls
   if(D.some(b=>!gyOnFloor(b[0],b[1],b[2]*.6)))continue;
   const d=ku(H(s,7))<.3?3:1;placed.push({key,x,z,h,L,B,D});GY_PILE.hulls.push({x,z,L});
   items.push({vessel:true,key,d,gx:x,gz:z,heading:h,run:0});break;}}
 return {items,runs:[],stamps:[],vessels:[],harbour:null,db:{pile:placed,at:()=>null}};})();
