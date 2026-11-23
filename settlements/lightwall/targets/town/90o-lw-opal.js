// ================================================================= LĀIṬWĀL — the Great Potch Line's opal (PLAN.md section 6, step L0's lode)
// The lode (kits/resources/data/lodes.json lode:great-potch-line: px 1028,1652, 8 km, the Opal Valley field's peak) runs along the
// north fault's foot behind the town. On the page it is the Resources kit's opal nodes (kits/resources 44t, node-opal-<grade>,
// sealed in TG by tungang_bundle.py res=True): an outcrop beside the mouth of every adit at the wall's foot (band 0's gz-adit and
// gz-dark-adit), and one in each wide gap between them, on the bench a few metres out from the face; high over the lode's peak
// (the carved quarter), medium along the town's length, low at its thinning ends, the grade nudged by a hash of the slot
// (core/rand). Each working of the wall (every gz-adit, gz-dark-adit and gz-vein-gallery, up the bands too) takes the nearest
// node by the kit's rule (TG.res.source: a mine, 400 m), its yield by the node's grade. Records first (registered in core/tags),
// then drawn; nothing on a street, a building, a scree or the water. [web]: three.js.
const LW_OPAL=[],LW_OPAL_LINKS=[];
if(typeof TG!=='undefined'&&TG.res){
 const B0=LW_BANDS[0],gradeOf=(x,k)=>{const a=Math.abs(x),u=KRAND.unit(KRAND.hash(LW.SEED,k,0x0a1));
  const g=a<LW.CARVE?2:a<B0.half*.7?1:0;return ['low','medium','high'][Math.max(0,Math.min(2,g+(u<.15?-1:u>.9?1:0)))];};
 const clear=(x,z)=>{if(!(terrainH(x,z)>LW.LAKE+1))return false;if(lwNearBuilding(x,z,4))return false;
  for(const w of LW_STREETS)if(lwSegD(x,z,w.pts[0],w.pts[1])<LW_W[w.cls]/2+2)return false;
  for(const H of (typeof LW_SCREE!=='undefined'?LW_SCREE:[]))if(Math.hypot((x-H.x)/(H.rx+3),(z-H.z)/(H.rz+3))<1)return false;
  for(const s of LW_WALL)if(s.band===0){const Bx=TG.gz.BOX[s.key];if(Bx&&Math.abs(x-s.x)<Bx.w/2+2&&z<s.z+Bx.out+3)return false;}
  return true;};
 const add=(x,z,k,why)=>{for(let t=0;t<4;t++){const zz=z+t*3;if(clear(x,zz)){const g=gradeOf(x,k),id='opal.'+LW_OPAL.length;
   LW_OPAL.push({id,kind:'opal',grade:g,x,z:zz,y:terrainH(x,zz),ry:KRAND.unit(KRAND.hash(LW.SEED,k,0x0a2))*Math.PI*2,why});return true;}}return false;};
 /* beside each adit's mouth at the wall's foot, then in the wide gaps between the band's fronts */
 const foot=LW_WALL.filter(s=>s.band===0).sort((a,b)=>a.x-b.x);let k=0;
 for(const s of foot)if(/^gz-(adit|dark-adit)$/.test(s.key)){const Bx=TG.gz.BOX[s.key],side=(k%2)?1:-1;add(s.x+side*(Bx.w/2+5),B0.z+Bx.out+6,k++,'an adit\'s mouth');}
 for(let i=0;i+1<foot.length;i++){const a=foot[i],b=foot[i+1],ea=a.x+TG.gz.BOX[a.key].w/2,eb=b.x-TG.gz.BOX[b.key].w/2;
  if(eb-ea>22)add((ea+eb)/2,B0.z+8,100+i,'a gap in the foot');}
 /* the records in core/tags before they are drawn (as KRES.register makes them: class prop, kind res-node) */
 for(const n of LW_OPAL)KTAGS.page.add({'class':'prop',kind:'res-node',key:'node-opal-'+n.grade,id:n.id,name:'The Great Potch Line: an opal outcrop ('+n.grade+')',
  at:[n.x,n.y,n.z],ry:n.ry,tags:{resource:{kind:'opal',grade:n.grade},mining:'opal',harvest:{item:'rough_opal',works:'mine'},culture:'generic',lode:'lode:great-potch-line'},
  note:n.why,frag:'settlements/lightwall'});
 /* every working of the wall takes its nearest node (the kit's rule) */
 for(const s of LW_WALL)if(/^gz-(adit|dark-adit|vein-gallery)$/.test(s.key)){const L=TG.res.source({x:s.x,z:s.z,works:'mine'},LW_OPAL);LW_OPAL_LINKS.push({site:s.id,key:s.key,band:s.band,link:L});}
 try{const D=TG.res.draw(LW_OPAL,{scene,label:'The Great Potch Line: opal outcrops (kits/resources)'});window._lightwallOpalDraw={recs:D.recs.length,missing:D.missing,tris:D.tris};}
 catch(e){reportErr('lightwall opal: '+(e&&e.stack||e));}
}
window._lightwallOpal={nodes:LW_OPAL.length,by:LW_OPAL.reduce((a,n)=>{a[n.grade]=(a[n.grade]||0)+1;return a;},{}),workings:LW_OPAL_LINKS.length,linked:LW_OPAL_LINKS.filter(w=>w.link).length};
