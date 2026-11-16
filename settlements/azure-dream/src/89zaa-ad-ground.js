// ================================================================= GRĒṬ-ĀIL — the ground at 1:1 and the placement, every page's
// Every target of the build (the isle's cove and precinct; the summit and its High Kora) stands on the scale model's cut through
// the open world's fields, with the cove's headlands stamped and its own pads and terraces cut and filled. A target sets
// AD_SITE in its 89z-rows.js before this runs: {id, PX: the page's origin in scale-model px, BOX: the near ground (whole 400 m
// cells of the far ground's grid), bio: {origin, center} for the flora}. Its own 89zad-site.js then places its records with
// adPut / adPad / adZigzag and gives AD_WAYS and AD_PAVED (the flora's mask reads them when the biome grows, in 90ae).
//   the ground   the scale model's cut (region/data, gen/39ad-world-data.js) through the open world's fields (WORLD.H,
//                openworld/isle-demo 41-world-fields.js, read in place), in world metres x = (px - origin)*2000, z likewise
//   the cove     the two headland records of edit_517_azure.py (lf_azure_cove_west, lf_azure_cove_east), stamped through
//                WORLD.landHook with core/world's island profile (41l-world-landforms.js, which this branch does not have: the
//                same records, the same profile, without the waterline's noise wobble; KNOWN_ISSUES.md)
//   the pads     AD_PADS: a level each (the mean of the ground under it, cut and filled), blended over a skirt by terrainH;
//                90ae draws the retaining faces where one stands off the ground
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34156);
// the region's frame: world metres x = (px - origin)*2000, z likewise (WORLD_DATA.meta.frame.origin_px, the cut's own centre)
const AD_O=WORLD_DATA.meta.frame.origin_px,adWx=px=>(px-AD_O[0])*2000,adWz=py=>(py-AD_O[1])*2000;
const AD={PX:AD_SITE.PX,LAKE:-520,BOX:AD_SITE.BOX};   /* the near ground: whole 400 m cells of the far ground's grid (90ad) */
AD.WX=adWx(AD.PX[0]);AD.WZ=adWz(AD.PX[1]);   /* the page's origin in world metres */
const AD_P=(u,v)=>[v,-u];
const adSm=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// ---------------------------------------------------------------- the cove's headlands (world metres)
const AD_ARMS=[{id:'lf_azure_cove_west',x:adWx(845.91),z:adWz(1508.568),r:220,crest:-490},
 {id:'lf_azure_cove_east',x:adWx(846.24),z:adWz(1508.568),r:220,crest:-486}];
WORLD.landHook=(x,z,h)=>{for(const L of AD_ARMS){const d=Math.hypot(x-L.x,z-L.z);if(d>=L.r*1.8*1.15)continue;   /* 41l: the first record in reach stamps */
  const u=d/L.r;if(u>=1.8)return h;const rise=L.crest-AD.LAKE,cap=1-adSm(.15,1,u),t=AD.LAKE+rise*cap-8*adSm(1,1.6,u);return Math.max(h,h+(t-h)*(1-adSm(1.3,1.8,u)));}
 return h;};
WORLD.init(WORLD_R);
const adBase=(x,z,mw)=>WORLD.H(x+AD.WX,z+AD.WZ,mw||0)-AD.LAKE;
// ---------------------------------------------------------------- the pads and terraces
const AD_PADS=[];
function adLevel(x0,z0,x1,z1){let s=0,n=0;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){s+=adBase(x0+(x1-x0)*i/4,z0+(z1-z0)*j/4);n++;}return Math.round(s/n*2)/2;}
function adPad(id,x0,z0,x1,z1,y,skirt){const P={id,x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),skirt:skirt==null?5:skirt};P.y=y==null?adLevel(P.x0,P.z0,P.x1,P.z1):y;AD_PADS.push(P);return P;}
function adPadAt(x,z){for(let i=AD_PADS.length-1;i>=0;i--){const p=AD_PADS[i];if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p;}return null;}
const _adT={x:NaN,z:NaN,h:0};
terrainH=function(x,z){if(x===_adT.x&&z===_adT.z)return _adT.h;let h=adBase(x,z);
 for(const p of AD_PADS){const dx=Math.max(p.x0-x,0,x-p.x1),dz=Math.max(p.z0-z,0,z-p.z1);if(dx>=p.skirt||dz>=p.skirt)continue;const d=Math.hypot(dx,dz);if(d>=p.skirt)continue;h+=(p.y-h)*(1-adSm(0,p.skirt,d));}
 _adT.x=x;_adT.z=z;_adT.h=h;return h;};

const AD_PLACE=[];
// a building at the plan's (u, v), its front turned by ry (0: toward the lake, south; PI/2: east; -PI/2: west; PI: uphill), o its
// options; pad: its own pad (its footprint turned, plus 3 m, at the mean under it) unless it stands on a terrace or the water
function adPut(key,u,v,ry,o,kind,id,pad){const c=AD_P(u,v),D=VERN.defs[key];if(!D)throw new Error('azure-dream: no def '+key);
 const q={key,x:c[0],z:c[1],ry,o:Object.assign({v:0},o||{}),kind,id:id||kind+':'+key+':'+u+','+v,h:D.h==null?10:D.h,w:D.fw==null?D.w:D.fw,d:D.fd==null?D.d:D.fd};
 if(pad&&q.o.y==null){const side=Math.abs(Math.sin(ry))>.5,hw=(side?q.d:q.w)/2+3,hd=(side?q.w:q.d)/2+3;q.pad=adPad('pad:'+q.id,q.x-hw,q.z-hd,q.x+hw,q.z+hd,null,6);q.o.y=q.pad.y;}
 AD_PLACE.push(q);return q;}

// a zigzag stair: n runs across a slope or a terrace's face, each a qb_terrace_stair along v centred on vc, turning on a landing
// pad at each foot, from (uTop, yTop) down to yFoot, each run S m further down the slope (south) than the last
function adZigzag(id,uTop,vc,yTop,yFoot,n,S){const r=(yTop-yFoot)/n,L=qnStairPlan(r).len,runs=[];let y=yTop;
 for(let k=0;k<n;k++){const u=uTop-S*k,east=k%2===0;runs.push({u,v0:vc+(east?-L/2:L/2),v1:vc+(east?L/2:-L/2),ry:east?Math.PI/2:-Math.PI/2,y,r});y-=r;}
 for(const R of runs){adPut('qb_terrace_stair',R.u,R.v0,R.ry,{v:0,rise:R.r,w:5.6,y:R.y},'way',id+':'+R.u.toFixed(1));
  const c=AD_P(R.u-3.6,R.v1);adPad('landing:'+id+':'+R.u.toFixed(1),c[0]-4.5,c[1]-6.2,c[0]+4.5,c[1]+6.2,R.y-R.r,2);}   /* the landing: under this run's foot and the next run's head */
 const h=AD_P(uTop+11,runs[0].v0-3.6),g=AD_P(uTop-1.5,runs[0].v0+3.6);adPad('landing:'+id+':head',h[0],h[1],g[0],g[1],yTop,1.5);   /* the head: from the edge above, over its face, to the first run */
 return{yTop,yFoot,rise:yTop-yFoot,r,len:L,n,runs,footU:uTop-S*n};}

// ---------------------------------------------------------------- the flora's mask and fields (the Vale of Xanadu's biome, the page's own)
// the isle's woods on the open slopes (1), the shore zone by the water (.8: the dawn redwoods, frost willows and reeds stand
// there), the odd tree on a terrace's open ground; nothing on the water, a pad, a way or a building's footprint, or off the near
// ground (the far ground is coarser and dropped under it). The biome zones itself from the fields: wet near the lake, upland by
// height. Bound as Qiblai's city binds it (Object.assign on BIO.host); grown and baked in 90ae.
const adSegD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l?((x-a[0])*dx+(z-a[1])*dz)/l:0;t=t<0?0:t>1?1:t;return Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z);};
function adBioMask(x,z){const B=AD.BOX;if(x<B[0]+20||x>B[2]-20||z<B[1]+20||z>B[3]-20)return 0;const h=terrainH(x,z);if(h<1.4)return 0;
 for(const p of AD_PLACE){if(p.kind==='wall'){if(adSegD(x,z,loc(p.x,p.z,-p.o.len/2,0,p.ry),loc(p.x,p.z,p.o.len/2,0,p.ry))<6)return 0;continue;}
  const r=Math.hypot(p.w==null?10:p.w,p.d==null?10:p.d)/2+2;if(Math.abs(x-p.x)<r&&Math.abs(z-p.z)<r&&Math.hypot(x-p.x,z-p.z)<r)return 0;}
 for(const b of AD_PAVED)if(x>=Math.min(b[0][0],b[1][0])-2&&x<=Math.max(b[0][0],b[1][0])+2&&z>=Math.min(b[0][1],b[1][1])-2&&z<=Math.max(b[0][1],b[1][1])+2)return 0;
 const pd=adPadAt(x,z);if(pd)return pd.id.startsWith('terrace:')?.22:0;   /* the terraces' grass: trees here and there between the buildings */
 for(const [k,w,P] of AD_WAYS)for(let i=0;i+1<P.length;i++)if(adSegD(x,z,P[i],P[i+1])<w/2+2)return 0;
 return h<12?.8:1;}
if(typeof BIO!=='undefined'&&BIO.host)Object.assign(BIO.host,{mask:adBioMask,origin:AD_SITE.bio.origin,center:AD_SITE.bio.center,
 fields:{wet:(x,z)=>Math.min(1,.62+.3*adSm(14,1.5,terrainH(x,z))),salt:()=>0,upland:(x,z)=>Math.max(0,Math.min(1,terrainH(x,z)/520)),flow:()=>0,mist:(x,z)=>Math.max(0,Math.min(.4,(terrainH(x,z)-90)/200))}});
