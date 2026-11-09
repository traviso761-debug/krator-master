// TARGET: east - station 3 of the dam basins (biomes/dambasins/PLAN.md, section 3; the site: 79-db-site.js). No port on this shore:
// the layout is the hulks alone, every one a free vessel of the Ancient Port kit, grounded by 81-db-hulks.js.
// THE TRAPPED HULKS (the third population, nsemiarid/PLAN.md section 5): ships that were out on the lake below the sill when the
// dams went, afloat on the shrinking water for years and grounded one by one on its strandlines as it fell, so each lies on a
// strandline, its bow anywhere (they drifted), the higher ones longest in the forest. Each is tried at a KRAND-hashed spot and turn
// and kept where a strandline runs under it, below the sill, clear of every one placed before it.
const TITLE='Krator — the dam basins: the east bed inside Korona';
const PORT_LAYOUT_DEF=(()=>{const VR=PORT_REG.vessel,ku=KRAND.unit,H=KRAND.hash,S={};
 const MIX=[['vsFeeder',5],['vsPanamax',2],['slSub',.6]].filter(m=>VR[m[0]]);
 const tot=MIX.reduce((s,m)=>s+m[1],0),pickV=r=>{let t=r*tot;for(const m of MIX){if(t<m[1])return m[0];t-=m[1];}return MIX[0][0];};
 const disks=(x,z,h,L,B)=>{const n=Math.max(3,Math.ceil(L/(B*.9))),o=[],fx=Math.sin(h),fz=Math.cos(h);
  for(let k=0;k<n;k++){const t=(k+.5)/n-.5;o.push([x+fx*L*t*.94,z+fz*L*t*.94,B*.5+8]);}return o;};
 const placed=[],items=[];
 for(let i=0;i<24&&placed.length<6;i++){const key=pickV(ku(H(7303,i,1))),V=VR[key],L=V.length,B=V.hullBeam||V.beam;
  for(let tr=0;tr<60;tr++){const s=H(7303,i,tr+11),x=(ku(H(s,2))*2-1)*2000,z=dbShore(x)+DB.drainZ+300+ku(H(s,3))*2800,h=ku(H(s,4))*TAU;
   const g=DB_NAT(x,z),b=DB_BASIN.sample(x,z,g,S);if(b.band!==KBASIN.BAND.recession||b.strand<.35||g>DB.sill)continue;
   const D=disks(x,z,h,L,B);if(placed.some(P=>P.D.some(a=>D.some(c=>Math.hypot(a[0]-c[0],a[1]-c[1])<a[2]+c[2]))))continue;
   const d=ku(H(s,7))<.4?3:1;placed.push({key,x,z,h,L,B,D});EB_HULKS.push({x,z,L});items.push({vessel:true,key,d,gx:x,gz:z,heading:h,run:0});break;}}
 return {items,runs:[],stamps:[],vessels:[],harbour:null,db:{trapped:placed,at:()=>null}};})();
