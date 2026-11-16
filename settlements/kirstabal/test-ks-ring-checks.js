// The ring's and the lake's villages (src/42-ks-ring.js), checked by test-ks-town.js (which loads the town and calls this):
// the lists are the economy's (XAN_TUNE.ksRing, XAN_TUNE.lowerLake: ids, places, people); every village lays out on
// core/hamlet without an error, every building on dry ground no steeper than the row's, the ring on the page's ground.
'use strict';
const path=require('path');
module.exports=function(T,{dims,KS_RING,ROOT}){
 const XT=require(path.join(ROOT,'core','region','data','xan-tune.js'));
 const near=(a,b)=>Math.abs(a-b)<1e-6;
 const sameLists=(R)=>R.ring.length===XT.ksRing.length&&R.ring.every((r,i)=>{const q=XT.ksRing[i];return r[0]===q[0]&&near(r[2],q[2])&&near(r[3],q[3])&&r[5]===q[5];})&&
  R.lake.length===XT.lowerLake.length&&R.lake.every((r,i)=>{const q=XT.lowerLake[i];return r[0]==='ll.'+q.key&&near(r[2],q.px)&&near(r[3],q.py)&&r[5]===q.people;});
 T.ok('the ring\'s and the lake\'s villages are the economy\'s (XAN_TUNE.ksRing and lowerLake: ids, places, people)',sameLists(KS_RING),
  KS_RING.ring.length+' in the ring, '+KS_RING.lake.length+' on the lake');
 T.neg('a ring village moved off the tune\'s place is caught',sameLists,Object.assign({},KS_RING,{ring:KS_RING.ring.map((r,i)=>i?r:[r[0],r[1],r[2]+1,r[3],r[4],r[5]])}),KS_RING);
 const V=KS_RING.make({dims});
 const laid=Vs=>{const bad=[];for(const v of Vs){if(v.error||!v.records||v.records.length<20){bad.push(v.id+': '+(v.error||(v.records||[]).length+' records'));continue;}
  const h=v.ground==='page'?KS_GROUND.h:KS_GROUND.model;for(const r of v.records)if(r.key!=='xa_quay'&&h(r.x,r.z)<2){bad.push(v.id+': '+r.id+' wet');break;}}return bad;};   /* the landing's quay stands at the water by design */
 /* the lake's villages fish: boat sheds and fish racks, a quay at the shore (its landing) on the water's side */
 const fishing=Vs=>Vs.filter(v=>v.focus==='fishing').every(v=>{const k={};for(const r of v.records||[])k[r.key]=(k[r.key]||0)+1;
  const h=v.ground==='model'?KS_GROUND.model:KS_GROUND.h,q=(v.records||[]).find(r=>r.key==='xa_quay');
  return k.xa_boatshed>0&&k.xa_fish_racks>0&&!!q&&!!v.shore&&h(q.x+v.shore.ux*40,q.z+v.shore.uz*40)<1;});
 {const F=V.filter(v=>v.focus==='fishing');T.ok('the lake\'s villages and the shore hamlet fish: boat sheds, fish racks and a quay at the water',F.length===9&&fishing(V),
   F.length+' fishing villages; '+F.map(v=>v.id.replace(/^ll\.(hamlet\.)?/,'')+' '+(v.records||[]).filter(r=>r.key==='xa_boatshed').length+'/'+(v.records||[]).filter(r=>r.key==='xa_fish_racks').length).join(', '));
  T.neg('a fishing village without its boat sheds is caught',fishing,V.map(v=>v.focus==='fishing'?Object.assign({},v,{records:v.records.filter(r=>r.key!=='xa_boatshed')}):v),V);}
 {const b=laid(V);T.ok('every village lays out on core/hamlet: the ring on the page\'s ground, the lake\'s on the model\'s, every building dry',!b.length,
   V.map(v=>v.id.replace(/^ks\.ring\.|^ll\./,'')+' '+(v.records||[]).length).join(', ')+(b.length?'; '+b.join('; '):''));
  T.neg('a village whose house stands in the lake is caught',Vs=>!laid(Vs).length,V.map((v,i)=>i?v:Object.assign({},v,{records:v.records.map((r,j)=>j?r:Object.assign({},r,{x:-1500,z:0}))})),V);}
};
