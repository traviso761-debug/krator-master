// ================================================================= GRĒṬ-ĀIL — the fishing villages (core/hamlet), every village page's
// PLAN.md section 8 (the owner, 2026-11-16: "300 people in monastery and 600 in villages"). West End, North Shore and East End
// are the isle's lay people: core/hamlet's KHAMLET.village (read in place) lays each out, a fishing village of Xanadu's
// vernacular (lay houses: no blue), and this hosts it on the 1:1 ground as the monastery's pages host their places.
//   the row      AD_VILLAGE_ROW, passed to KHAMLET.village as its culture (core/hamlet 20's rows are the kits'; this one is the
//                page's own): the Xanadu kit's poor and middle houses, its shops, teahouse and warehouse (the net loft), the
//                Farmers' Guild's hall as the fishers' (a stand-in), the Qiblai kit's wayside shrine; the works of the
//                fishing focus are the boat shed and the wharf's racks and smokehouse (89qb)
//   the site     the target's AD_SITE: its origin the village point (probed on the 1:1 shore), village {id, name, pop}; the
//                shore is the nearest water from it (the resource: the fish), and the main lane points along the coast
//                toward the monastery (the footpath round the isle)
//   the landing  a jetty from the shore into the water, dugouts drawn up either side of its root and moored beside it
// adVillage(V) places it all through adPut (each building on its own pad) and returns {v (KHAMLET's result), shore, ways}.
// [G data]: no THREE, no DOM.
reseed(34161);
const AD_VILLAGE_ROW={kit:'xanadu',household:5,workShare:.45,slopeMax:.2,
 religious:'qb_shrine',civic:'xa_guild_farm',general:'xa_shops',food:'xa_teahouse',warehouse:'xa_warehouse',
 services:{religious:1,civic:2,general:2,food:3,warehouse:3},
 houses:{poor:[['xa_poor_c',1,3],['xa_poor_a',2,2],['xa_poor_b',3,1]],middling:[['xa_mid_b',2,2],['xa_mid_a',2,1],['xa_mid_c',4,1]],
  head:[['xa_mid_c',1,1]],middlingShare:.3},
 works:{fishing:[{key:'xa_boatshed',jobs:8,share:.35},{key:'qb_ad_racks',jobs:6,share:.4},{key:'qb_ad_smokehouse',jobs:5,share:.25}]},
 focusJobs:{fishing:100},reach:{fishing:240}};
const AD_VILLAGE_SIZE={qb_ad_racks:{w:24,d:12}};   /* a village's racks: a third of the wharf's (64 x 30) */
function adDims(k){const D=VERN.defs[k],sz=AD_VILLAGE_SIZE[k];return D?{w:sz?sz.w:D.fw==null?D.w:D.fw,d:sz?sz.d:D.fd==null?D.d:D.fd,h:D.h==null?8:D.h}:null;}
// the shore: the nearest water from (x, z) along 32 rays (10 m steps, 600 m), the last dry point and the way out
function adShore(x,z){let best=null;for(let i=0;i<32;i++){const a=i/32*2*Math.PI,dx=Math.sin(a),dz=Math.cos(a);
  for(let d=10;d<=600;d+=10)if(adBase(x+dx*d,z+dz*d)<-.3){if(!best||d<best.d)best={d,x:x+dx*(d-10),z:z+dz*(d-10),dx,dz};break;}}
 return best;}
function adVillage(V){const B=AD.BOX,sh=adShore(0,0);if(!sh)return{error:'no water within 600 m of '+V.id};
 /* the coast's run toward the monastery: of the two along the shore, the one nearer the cove's head */
 const m=adPx([846.075,1508.493]),px=-sh.dz,pz=sh.dx,s=(m[0]*px+m[1]*pz)>0?1:-1,link={x:px*s*260,z:pz*s*260};
 const ok=(x,z)=>{if(x<B[0]+60||x>B[2]-60||z<B[1]+60||z>B[3]-60)return false;const h=adBase(x,z);if(h<1.5)return false;
  return Math.max(Math.abs(adBase(x+3,z)-adBase(x-3,z)),Math.abs(adBase(x,z+3)-adBase(x,z-3)))/6<=AD_VILLAGE_ROW.slopeMax;};
 const v=KHAMLET.village({id:V.id,world:34160,culture:AD_VILLAGE_ROW,focus:'fishing',site:{x:0,z:0},link,resource:{x:sh.x,z:sh.z,workers:999},
  popMax:V.pop,dims:adDims,ground:{ok},siteReach:500});
 if(!v.records)return{v,error:v.error};
 {const g=v.green,b=adPadBox(g.w,g.d,g.ry);AD_CLEAR.push({x:g.x,z:g.z,hw:b[0]+1,hd:b[1]+1});}   /* the green stays open grass */
 v.records.forEach((r,i)=>{const D=VERN.defs[r.key],o=Object.assign({v:D&&D.nv?i%D.nv:i%3},AD_VILLAGE_SIZE[r.key]||{});adAt(r.key,r.x,r.z,r.ry,o,'village:'+r.role,r.id,true);});
 /* the landing: a jetty from the shore out, dugouts drawn up either side of its root (no pad: on the beach as it lies) and
    three moored beside it */
 /* the jetty runs out until the water is 1.2 m deep (the 1:1 shore is often a drowned flat), 30-150 m */
 let L=30;while(L<150&&adBase(sh.x+sh.dx*(L-4),sh.z+sh.dz*(L-4))>-1.2)L+=6;
 const ry=Math.atan2(sh.dx,sh.dz),jx=sh.x+sh.dx*(L/2-4),jz=sh.z+sh.dz*(L/2-4);
 adAt('qb_ad_jetty',jx,jz,ry,{y:0,len:L,v:0},'landing',V.id+':jetty');
 for(let k=0;k<8;k++){const side=k%2?1:-1,o=8+(k>>1)*3.8,x=sh.x-sh.dx*5+px*side*o,z=sh.z-sh.dz*5+pz*side*o;if(adBase(x,z)<.2)continue;
  adAt('qb_ad_dugout',x,z,ry,{v:k%3},'boat',V.id+':dugout:beach:'+k);}
for(let k=0;k<3;k++){const t=L-8-k*7,x=jx+sh.dx*(t-L/2)+px*3.4,z=jz+sh.dz*(t-L/2)+pz*3.4;adAt('qb_ad_dugout',x,z,ry,{v:k,y:-.18},'boat',V.id+':dugout:water:'+k);}
 /* the Order's herds (PLAN.md section 8: East End's meadows; V.herds): inland of the village, on a meadow kept open (AD_CLEAR), a
    corral and a pen either side of it, where the ground is dry and gentle 72 x 52 m and clear of the village */
 let herds=null;if(V.herds){const ix=-sh.dx,iz=-sh.dz;
  for(let d=140;d<=440&&!herds;d+=20)for(const t of[0,-.35,.35,-.7,.7]){const c=Math.cos(t),sn=Math.sin(t),x=v.site.x+(ix*c-iz*sn)*d,z=v.site.z+(iz*c+ix*sn)*d;let good=true;
   for(let a=-36;a<=36&&good;a+=12)for(let b=-26;b<=26&&good;b+=13)good=ok(x+a,z+b)&&!AD_PLACE.some(p=>Math.hypot(p.x-x-a,p.z-z-b)<Math.max(p.w,p.d)/2+6);
   if(good){herds={x,z};break;}}
  if(herds){const hry=Math.atan2(sh.dx,sh.dz);adAt('xa_corral',herds.x,herds.z,hry,{v:0},'herds',V.id+':corral',true);
   for(const e of[-1,1])adAt('xa_pens',herds.x+px*e*24,herds.z+pz*e*24,hry,{v:0},'herds',V.id+':pen:'+(e>0?'east':'west'),true);
   AD_CLEAR.push({x:herds.x,z:herds.z,hw:62,hd:62});}}
 /* the ways: the lanes (dirt), and the footpath on from the main lane's end along the coast to the near ground's edge */
 const ways=v.lanes.map(l=>['lane',l.w,l.pts]),main=v.lanes.find(l=>l.main);
 if(main){const e=main.pts[1],dx=link.x-v.site.x,dz=link.z-v.site.z,dl=Math.hypot(dx,dz),f=[e[0]+dx/dl*900,e[1]+dz/dl*900];ways.push(['lane',2.5,[e,f]]);}
 ways.push(['lane',3,[[v.site.x,v.site.z],[sh.x,sh.z]]]);   /* down to the landing */
 return{v,shore:sh,link,ways,herds,jetty:{x:jx,z:jz,ry,len:L}};}
// the views of a village page
function adVillageViews(AV){const V={},v=AV.v,s=v&&v.site?v.site:{x:0,z:0},sh=AV.shore,j=AV.jetty,eye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+(dy==null?0:dy),z,tx,terrainH(tx,tz)+4,tz];
 const gy=terrainH(s.x,s.z);
 V['Overview']=[s.x-sh.dx*260+120,gy+150,s.z-sh.dz*260+80,s.x,gy,s.z];
 V['From the water']=[j.x+sh.dx*(j.len/2+90)+30,3.5,j.z+sh.dz*(j.len/2+90)+30,s.x,gy+4,s.z];
 V['The landing']=[sh.x-sh.dx*24+(-sh.dz)*30,terrainH(sh.x-sh.dx*24,sh.z-sh.dz*24)+12,sh.z-sh.dz*24+sh.dx*30,j.x,1,j.z];
 V['The green']=eye(s.x+v.frame.u[0]*16,s.z+v.frame.u[1]*16,s.x-v.frame.u[0]*20,s.z-v.frame.u[1]*20,0);   /* on the green (46 m along the main lane), looking back down it */
 return V;}
