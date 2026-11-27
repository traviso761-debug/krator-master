// ================================================================= XANADU'S WORKS — the plan: four camps from two tune records
// [G data] settlements/xanadu/WORKS-PLAN.md sections 1, 2 and 7 (W3). The records are the tune's (XAN_TUNE.valley: Kōlḍ-Lōḍ,
// smgxtultfq, 950 people; Opal Valley Mines, sjuarjbku0, 850), read from core/region/data/xan-tune.js in place (gen/69w-works-
// core.js seals it at every build; never a copy of its numbers). Each record is laid as two camps on core/hamlet's Xanadu row in
// its camp form (KHAMLET.xanaduRow({camp: true, mineHead: true, shrine: true})) with core/hamlet/camp's census: spec.share deals
// the record's people over the two camps by the largest remainder, so they add up to the tune's. The ground is a flat sheet
// (the six province regions wait for the vertical stack: W4 puts the camps on their ground). Placement is core/hamlet's
// (core/rand streams by the camp's id, core/space for overlap); this file only chooses each camp's point on the sheet, its
// link, its resource and its shore, and turns the records into placements. A builder draws a record; it decides nothing.
//   XW.CAMPS        the four camps: {id, rec (the tune's id), i (its part), parts, focus, name, site, link, resource, box
//                   [x0, z0, x1, z1] (its ground on the sheet), shore? (the landing's water line: z beyond it is the lake),
//                   glazier? (a share of the houses the Glaziers')}
//   XW.LAKE         the lake's level (y) beyond the landing's shore
//   XW_PLAN         {records: {smgxtultfq, sjuarjbku0} (the tune's), camps: [{id, rec, census, records, lanes, landing, error}],
//                   place: XW_PLACE, heaps: XW_HEAPS, vessels, err}
//   XW_PLACE        every placement: {id, camp, key, role, x, z, ry, w, d, h, o: {v, y, drop}, kit: 'xanadu' | 'glazier' | null
//                   (a stand-in: a key no kit on the page has), out (the Glaziers' front's depth)}
//   XW_HEAPS        the tailings and the potch spoil (core/terrain KRUBBLE records), off every footprint
const xwD=(x,d)=>x==null?d:x;   /* a numeric default: 0 is a value */
const XW={SEED:34900,LAKE:-1.2,
 CAMPS:[
  {id:'kold-lod.adit',rec:'smgxtultfq',i:0,parts:[500,450],focus:'mine',name:'Kōlḍ-Lōḍ: the adit camp on the lode',
   site:[-900,-640],link:[-900,640],resource:[-1160,-900],box:[-1500,-1300,-300,-120]},
  {id:'kold-lod.mill',rec:'smgxtultfq',i:1,parts:[500,450],focus:'mill',name:'Kōlḍ-Lōḍ: the mill camp down the valley',
   site:[-900,640],link:[-900,-640],resource:[-660,900],box:[-1500,120,-300,1300],stream:-640},
  {id:'opal.diggings',rec:'sjuarjbku0',i:0,parts:[500,350],focus:'diggings',name:'Opal Valley Mines: the diggings on the potch line',
   site:[900,-640],link:[900,600],resource:[1160,-900],box:[300,-1300,1500,-120],glazier:.2},
  {id:'opal.landing',rec:'sjuarjbku0',i:1,parts:[500,350],focus:'landing',name:'Opal Valley Mines: the factor\'s landing',
   site:[900,520],link:[900,-640],resource:null,box:[300,120,1500,880],shore:880}]};
const XW_PLACE=[],XW_HEAPS=[];let XW_PLAN=null,XW_ERR=null;
/* the boxes a camp lays with: the Xanadu kit's defs (VERN.defs: its src and the opt-in 88d, 88g, 88h), the Glaziers' (TG.gz);
   a key neither has takes the row's pending box (KHAMLET.box) and is drawn as a stand-in */
const xwKit=key=>VERN.defs[key]?'xanadu':(typeof TG!=='undefined'&&TG.gz&&TG.gz.BOX&&TG.gz.BOX[key])?'glazier':null;
const xwDims=key=>{const D=VERN.defs[key];if(D)return{w:D.w,d:D.d,h:xwD(D.h,8)};
 if(xwKit(key)==='glazier'){const B=TG.gz.dims(key);return{w:B.w,d:B.d,h:B.h};}return null;};
/* the Glaziers' houses among the diggers' (Lāiṭwāl mixes them so: the owner's plan, settlements/lightwall): the camp's houses
   with gz-front and gz-cell beside the bunkhouses, by weight so about `glazier` of the houses are theirs */
function xwCampHouses(g){const w=Math.round(4*g/(1-g)*10)/10;   /* bunkhouses 4 : Glaziers' w */
 return{poor:[['xa_poor_b',3,2],['xa_mid_c',4,2],['gz-front',2,w*.6],['gz-cell',1,w*.4]],middling:[['xa_mid_c',4,1]],head:[['xa_rich_a',1,1]],middlingShare:0};}
const xwInBox=(B,x,z,m)=>x>B[0]+m&&x<B[2]-m&&z>B[1]+m&&z<B[3]-m;
try{
 const V=XAN_TUNE.valley({sites:[]},{}),rec={};
 for(const id of['smgxtultfq','sjuarjbku0']){const s=V.settlements.find(q=>q.id===id);if(!s)throw new Error('the tune has no record '+id);
  rec[id]={id,name:s.name,people:s.people,parent:s.parent,works:s.works.map(w=>({id:w.id,kind:w.kind,crew:w.crew,out:w.out.slice()}))};}
 const row=KHAMLET.xanaduRow({camp:true,mineHead:true,shrine:true});
 const camps=[];
 for(const C of XW.CAMPS){const B=C.box,R=rec[C.rec];
  const spec={id:C.id,world:KRAND.hash(XW.SEED,KHAMLET.idHash(C.rec)),culture:row,focus:C.focus,site:{x:C.site[0],z:C.site[1]},link:{x:C.link[0],z:C.link[1]},
   resource:C.resource?{x:C.resource[0],z:C.resource[1]}:undefined,dims:xwDims,siteReach:400,
   ground:{ok:(x,z)=>xwInBox(B,x,z,4)&&(C.shore==null||z<C.shore-4)},
   camp:C.glazier?{houses:xwCampHouses(C.glazier)}:true,share:{pop:R.people,parts:C.parts,i:C.i}};
  if(C.shore!=null)spec.landing={x:C.site[0],z:C.shore,ux:0,uz:1};
  const v=KHAMLET.village(spec);
  camps.push({id:C.id,rec:C.rec,name:C.name,focus:C.focus,census:v.census,records:v.records||[],lanes:v.lanes||[],green:v.green||null,landing:v.landing||null,error:v.error||null,site:v.site||null});
  for(const r of v.records||[]){const kit=xwKit(r.key),D=kit==='xanadu'?VERN.defs[r.key]:null,nv=D?xwD(D.nv,1):1;
   /* the look: a hash of the camp and the record's id (no draw order); the opal diggings' mine heads take the opal variant */
   let vv=nv>1?KRAND.hash(XW.SEED,KHAMLET.idHash(r.id),7)%nv:0;if(r.key==='xa_mine_head')vv=C.focus==='diggings'?1:0;
   XW_PLACE.push({id:r.id,camp:C.id,key:r.key,role:r.role,x:r.x,z:r.z,ry:r.ry,w:r.w,d:r.d,h:r.h,head:!!r.head,kit,o:{v:vv,y:0,drop:0},
    out:kit==='glazier'?TG.gz.dims(r.key).out:0});}}
 /* the lake craft at the landing's quay: the cargo barge (the ferry to Lāiṭwāl, 27 km over the middle terrace's lake) and a
    launch, moored off its face, broadside to it */
 const vessels=[];const L=camps.find(c=>c.landing);
 if(L){const q=L.landing,sx=q.seaward[0],sz=q.seaward[1],ax=-sz,az=sx,ry=Math.atan2(ax,az);
  vessels.push({id:L.id+':barge',camp:L.id,key:'xa_lake_barge',x:q.x+sx*15+ax*4,z:q.z+sz*15+az*4,ry,o:{v:0,y:XW.LAKE,drop:0}});
  vessels.push({id:L.id+':launch',camp:L.id,key:'xa_launch',x:q.x+sx*13-ax*15,z:q.z+sz*13-az*15,ry,o:{v:1,y:XW.LAKE,drop:0}});}
 /* the heaps: the mill camp's tailings below the stamp mills (by its stream), the diggings' potch spoil by the potch line; each
    tried on a ring round its point until it clears every footprint by 6 m (a fixed order of tries, no draw) */
 const rects=XW_PLACE.map(p=>KHAMLET.rect(p.x,p.z,Math.cos(p.ry),-Math.sin(p.ry),p.w,p.d));
 const heap=(C,n,at,rx,rz,h,dress)=>{for(let k=0;k<n;k++)for(let t=0;t<48;t++){const a=(k*2.399+t*.5236),r=40+t*9,x=at[0]+Math.cos(a)*r,z=at[1]+Math.sin(a)*r,
   me=KHAMLET.rect(x,z,1,0,rx*2,rz*2);if(!xwInBox(C.box,x,z,Math.max(rx,rz)+4))continue;if(C.stream!=null&&Math.abs(x-C.stream)<rx+12)continue;
   if(rects.some(R=>KHAMLET.overlap(R,me,6)))continue;if(XW_HEAPS.some(H=>Math.hypot(H.x-x,H.z-z)<H.rx+rx+6))continue;
   XW_HEAPS.push(Object.assign(KRUBBLE.heap({id:C.id+':heap:'+k,x,z,y0:0,rx,rz,ry:a,h,lumps:4,blocks:10,size:[.4,1.4],seed:KRAND.hash(XW.SEED,KHAMLET.idHash(C.id),k)}),{camp:C.id,dress}));break;}};
 if(typeof KRUBBLE!=='undefined'){heap(XW.CAMPS[1],3,XW.CAMPS[1].resource,14,10,4.5,'tailings');heap(XW.CAMPS[0],3,XW.CAMPS[0].resource,12,9,5,'spoil');
  heap(XW.CAMPS[2],4,XW.CAMPS[2].resource,11,8,3.5,'potch');}
 /* the census the sheet holds against the tune: each record's camps add up to its people */
 const sums={};for(const c of camps)sums[c.rec]=xwD(sums[c.rec],0)+(c.census?c.census.pop:0);
 XW_PLAN={records:rec,camps,place:XW_PLACE,heaps:XW_HEAPS,vessels,sums,
  glazier:{houses:XW_PLACE.filter(p=>p.kit==='glazier').length,of:XW_PLACE.filter(p=>p.role==='house'&&p.camp==='opal.diggings').length}};
}catch(e){XW_ERR=e;}
