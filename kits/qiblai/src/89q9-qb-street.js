// ================================================================= QIBLAI — the mixed street (VASSAL-KITS.md, "The mixed-street check")
// A street at each wealth tier where Qiblai's houses stand between Xanadu ones, fronts on one street line, plot to plot
// with no gap: Qiblai's row houses in runs on party walls (o.ends closes each run), a Xanadu house's plot (its yard
// included) between runs. Each street is one def of its own (as the Xanadu kit's xa_hillside and xa_lane are), so the
// sheet shows it as a row and an eye-level view looks down it. Each house placed is recorded in QB_STREETS, and
// QB_streetAudit() (verify.py --assert, kits/qiblai/verify.py) measures what each one actually drew, from the kit's
// instances, and fails on two neighbours whose drawn footprints overlap. Seeds 33900-33999.
const QB_STREETS=[];   // [{key, name, subs:[{key, n0:{item: first index}, n1:{item: end index}}]}]
// a run spec: [key, n] for n Qiblai row houses on party walls, a key alone for one house (a Xanadu plot), or a number for an
// alley that wide (where a Xanadu house draws past its plot's w: the merchant's konak's cumba, 3.3 m)
function qnStreet(name,spec,o){const V=xV(o),runs=[],gaps=[];let gap=0;
 for(const s of spec){if(typeof s==='number'){gap+=s;continue;}if(Array.isArray(s))for(let i=0;i<s[1];i++){runs.push({key:s[0],ends:(i===0?'l':'')+(i===s[1]-1?'r':'')});gaps.push(i?0:gap);gap=0;}else{runs.push({key:s});gaps.push(gap);gap=0;}}
 const ws=runs.map(r=>VERN.defs[r.key].w),W=ws.reduce((a,b)=>a+b,0)+gaps.reduce((a,b)=>a+b,0),Dm=Math.max(...runs.map(r=>VERN.defs[r.key].d)),Zf=Dm/2-4;   // the street line; the street in front of it
 const rec={key:VERN.cur.D.key,name:name+(V?' v'+V:''),subs:[]};QB_STREETS.push(rec);
 vnReg(name,0,0,W/2,Math.max(...runs.map(r=>(VERN.defs[r.key].h==null?8:VERN.defs[r.key].h))));
 let x=-W/2;runs.forEach((r,i)=>{x+=gaps[i];const D=VERN.defs[r.key],n0={};for(const k of KIT.order)n0[k]=KIT.items[k].length;
  const opt={v:(i+V)%Math.min(3,(D.nv==null?3:D.nv))};if(r.ends!=null)opt.ends=r.ends;
  xnSub(r.key,x+ws[i]/2,0,Zf-D.d/2,0,opt);
  const n1={};for(const k of KIT.order)if(KIT.items[k].length>n0[k])n1[k]=KIT.items[k].length;rec.subs.push({key:r.key,n0,n1});x+=ws[i];});
 // the street: paving, a gutter, a wayside prayer-flag line across it, a few people
 qnPave(0,Zf+4,W,8,0);vB('vStone',0,0,Zf+.15,W,.12,.3,0,xC(xPick(QSTONE)));
 for(let i=0;i<Math.floor(W/16);i++)vnFolk(-W/2+8+i*16+rr(-2,2),Zf+4+rr(-2,2),2,1.2);}
const QB_STREET_SPEC={
 poor:[['qb_row_poor',3],'xa_poor_a',['qb_row_poor',2],'xa_poor_c',['qb_row_poor',2],'xa_poor_b'],
 mid:[['qb_row_mid',2],'xa_mid_a',['qb_row_mid',3],'xa_mid_c','qb_corner_house'],
 rich:[['qb_row_rich',2],'xa_rich_a','qb_court_house','xa_rich_c',4,['qb_row_rich',1]],
};
function buildQbStreetPoor(G,o){reseed(33901+(o.v|0));qnStreet('Mixed street (poor)',QB_STREET_SPEC.poor,o);}
function buildQbStreetMid(G,o){reseed(33911+(o.v|0));qnStreet('Mixed street (middle)',QB_STREET_SPEC.mid,o);}
function buildQbStreetRich(G,o){reseed(33921+(o.v|0));qnStreet('Mixed street (rich)',QB_STREET_SPEC.rich,o);}
// a street def's plot from its spec: w the plots end to end, d the deepest plot and the 8 m street, h the tallest; its eye-level
// stance stands in the street near the left end and looks along the fronts
function qnStreetDef(key,name,spec,wealth,build){const ks=[];let al=0;for(const s of spec){if(typeof s==='number')al+=s;else if(Array.isArray(s))for(let i=0;i<s[1];i++)ks.push(s[0]);else ks.push(s);}
 const W=ks.reduce((a,k)=>a+VERN.defs[k].w,0)+al,Dm=Math.max(...ks.map(k=>VERN.defs[k].d)),H=Math.max(...ks.map(k=>(VERN.defs[k].h==null?8:VERN.defs[k].h)));
 QB.def({key,name,family:'Mixed street',tags:QTAG(wealth,['single-family dwelling','infrastructure']),w:W,d:Dm+8,h:H,nv:3,eye:[-W/2+5,Dm/2,-W/2+32,Dm/2-7],build});}

// the audit: each house's drawn footprint (every instance it put, its geometry's box turned and scaled, on the ground plan)
// against its neighbour's; an overlap deeper than TOL in x, where the two also share depth, is a house drawn into the next
// plot. Returns [{name, ok, detail}] in the shape of verify.py's invariants.
function QB_streetAudit(){const TOL=.3,out=[],v=new THREE.Vector3(),bb={};
 const box=k=>{if(!bb[k]){const g=KIT.defs[k].geo;if(!g.boundingBox)g.computeBoundingBox();bb[k]=g.boundingBox;}return bb[k];};
 for(const S of QB_STREETS){const fp=S.subs.map(u=>{const a=[1e9,1e9,-1e9,-1e9];
   for(const k in u.n1){const B=box(k);for(let i=u.n0[k];i<u.n1[k];i++){const it=KIT.items[k][i],s=typeof it.s==='number'?[it.s,it.s,it.s]:it.s;
    for(const cx of[B.min.x,B.max.x])for(const cz of[B.min.z,B.max.z]){v.set(cx*s[0],0,cz*s[2]);if(it.q)v.applyQuaternion(it.q);
     a[0]=Math.min(a[0],it.p[0]+v.x);a[1]=Math.min(a[1],it.p[2]+v.z);a[2]=Math.max(a[2],it.p[0]+v.x);a[3]=Math.max(a[3],it.p[2]+v.z);}}}
   return{key:u.key,a};});
  let worst=null;for(let i=0;i+1<fp.length;i++){const A=fp[i].a,B=fp[i+1].a,ox=Math.min(A[2],B[2])-Math.max(A[0],B[0]),oz=Math.min(A[3],B[3])-Math.max(A[1],B[1]);
   if(oz>0&&(!worst||ox>worst.ox))worst={ox,a:fp[i].key,b:fp[i+1].key};}
  out.push({name:'mixed-street '+S.name,ok:!worst||worst.ox<=TOL,detail:fp.length+' houses; '+(worst?'deepest neighbour overlap '+worst.ox.toFixed(2)+' m ('+worst.a+' | '+worst.b+')':'no neighbours')});}
 return out;}
window.QB_streetAudit=QB_streetAudit;

qnStreetDef('qb_street_poor','Mixed street (poor)',QB_STREET_SPEC.poor,'poor',buildQbStreetPoor);
qnStreetDef('qb_street_mid','Mixed street (middle)',QB_STREET_SPEC.mid,'middle',buildQbStreetMid);
qnStreetDef('qb_street_rich','Mixed street (rich)',QB_STREET_SPEC.rich,'rich',buildQbStreetRich);
