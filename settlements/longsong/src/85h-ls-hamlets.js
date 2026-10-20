// ================================================================= LONGSONG — the valley's lay villages (the drawing)
// [draw] core/hamlet's villages (40h: LS.HAMLETS.make, here on the page's terrainH and waterH), drawn from their records:
// each building registered in core/tags first, then built in the Oidong Valley's way: whitewashed stone under a flat
// roof, a maroon band under the parapet, a dark-framed door and windows on its front (its front faces the lane: the
// record's ry); the granaries on a stone footing, the byres long and low, the pens and the corral drystone rings, the
// shrine a chorten in its walled yard; the lanes laid as packed earth. The hall flies Xanadu's banner, the trader and the
// tea house hang their signs (core/sockets, LSSOCK). The walker cannot walk through them (core/walk blocks).
const LSHAMLETS=(function(){const O={villages:[],buildings:0,people:0,errors:[]};if(!LS.HAMLETS||typeof KHAMLET==='undefined')return O;
 const H=LS.HAMLETS.make(terrainH,waterH),BOX=LS.HAMLETS.BOX;
 const WHITE=0xf0ebe0,BAND=LSP.maroon,STONE=0xb8b0a0,EARTH=0x9a8a6c;
 const footY=r=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);let m=1e9;for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const x=r.x+u*r.w/2*c+v*r.d/2*s,z=r.z-u*r.w/2*s+v*r.d/2*c;m=Math.min(m,terrainH(x,z));}return m;};
 // a point on the record's front face (u along it, v up from y), and the front's normal
 const front=(r,u)=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);return [r.x+u*c+s*(r.d/2+.04),r.z-u*s+c*(r.d/2+.04)];};
 function house(r,y,o){o=o||{};const h=r.h,ry=r.ry,s=Math.sin(ry),c=Math.cos(ry);
  ARCH.box('ashlar',r.x,y-1.2,r.z,r.w+.4,1.2+(o.foot||.35),r.d+.4,{ry,col:STONE,top:false});
  const yb=y+(o.foot||.35);ARCH.box('wall',r.x,yb,r.z,r.w,h-(o.foot||.35),r.d,{ry,col:WHITE,batter:.25,topCol:0x8a8070});
  ARCH.box('twig',r.x,yb+h-(o.foot||.35)-.75,r.z,r.w+.06,.5,r.d+.06,{ry,col:BAND,top:false,bottom:false});
  const [dx,dz]=front(r,0);lsDoor(dx,yb,dz,s,c,o.door||1.2,2.1,{curtain:o.curtain||LSP.saffron});
  for(const u of [-r.w/4-.4,r.w/4+.4]){if(r.w<8&&u<0)continue;const [wx,wz]=front(r,u);ARCH.box('dark',wx,yb+Math.min(2.6,h*.42),wz,.9,1.1,.12,{ry,col:0x1e1a18});}}
 function ring(r,y,hgt){const c=Math.cos(r.ry),s=Math.sin(r.ry),P=(u,v)=>[r.x+u*c+v*s,r.z-u*s+v*c];
  for(const [u0,v0,u1,v1] of [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){const n=Math.max(1,Math.round(Math.hypot((u1-u0)*r.w/2,(v1-v0)*r.d/2)/4));
   for(let k=0;k<n;k++){const a=P((u0+(u1-u0)*(k+.5)/n)*r.w/2,(v0+(v1-v0)*(k+.5)/n)*r.d/2),len=Math.hypot((u1-u0)*r.w/2,(v1-v0)*r.d/2)/n,along=u0!==u1;
    if(k===Math.floor(n/2)&&v0===1&&v1===1)continue;   // the gate in its front
    ARCH.box('drystone',a[0],terrainH(a[0],a[1])-.3,a[1],along?len+.1:.6,hgt+.3,along?.6:len+.1,{ry:r.ry,col:0xd2cdbf,topCol:0x6a5a44});}}}
 H.forEach(({spec,v})=>{if(v.error){O.errors.push(spec.id+': '+v.error);return;}const V={id:spec.id,name:spec.name,focus:spec.focus,pop:v.census.pop,buildings:v.records.length,site:v.site};
  O.villages.push(V);O.people+=v.census.pop;
  // the lanes: packed earth along each lane's points, laid on the ground
  v.lanes.forEach(L=>{for(let i=1;i<L.pts.length;i++){const a=L.pts[i-1],b=L.pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(len/4)),tx=(b[0]-a[0])/len,tz=(b[1]-a[1])/len,hw=L.w/2;
    for(let k=0;k<n;k++){const p=[a[0]+tx*len*k/n,a[1]+tz*len*k/n],q=[a[0]+tx*len*(k+1)/n,a[1]+tz*len*(k+1)/n];
     const A=[p[0]-tz*hw,p[1]+tx*hw],B=[p[0]+tz*hw,p[1]-tx*hw],C=[q[0]+tz*hw,q[1]-tx*hw],D=[q[0]-tz*hw,q[1]+tx*hw],Y=(x,z)=>terrainH(x,z)+.07;
     ARCH.face('paving',[A[0],Y(A[0],A[1]),A[1]],[B[0],Y(B[0],B[1]),B[1]],[C[0],Y(C[0],C[1]),C[1]],[D[0],Y(D[0],D[1]),D[1]],[0,1,0],EARTH);}}});
  v.records.forEach(r=>{const y=footY(r),B=BOX[r.key]||{},nm=(B.what||r.key)+' ('+spec.name.split(',')[0]+')';
   REGISTER({name:nm,cls:'building',kind:r.key,key:'longsong_'+r.id,x:r.x,z:r.z,y:y-.5,r:Math.max(r.w,r.d)/2,h:r.h+1,tags:{culture:'xanadu',types:[r.role==='house'?'dwelling-single':r.role==='works'?(spec.focus==='ranch'?'farm':'farm'):r.role]},
    note:'core/hamlet ('+spec.id+')'});
   O.buildings++;const k=r.key;
   if(k==='xv-shrine'){ring(r,y,1.1);lsChorten(r.x,y,r.z,.32);}
   else if(k==='xv-pens'||k==='xv-corral')ring(r,y,k==='xv-corral'?1.3:1.5);
   else if(k==='xv-granary')house(r,y,{foot:1.2,door:1});
   else if(k==='xv-byre'){house(r,y,{foot:.2,door:2.2,curtain:0x4a3a2a});}
   else house(r,y,{door:k==='xv-hall'?1.8:1.2,curtain:k==='xv-house-poor'?0x7a5a3a:LSP.saffron});
   // the marks (core/sockets, Xanadu's pack): the hall's banner, the trader's and the tea house's signs
   const [fx,fz]=front(r,0),F={x:fx,y:y+.35,z:fz,ry:r.ry};
   if(k==='xv-hall')LSSOCK.mark('xanadu',F,[['banner',-2.4,4.6,0,0,{w:1.1,h:3}],['banner',2.4,4.6,0,0,{w:1.1,h:3}]],r.id);
   if(k==='xv-trader')LSSOCK.mark('xanadu',F,[['sign',1.9,2,0,0,{w:1.5,h:.55,trade:'GENERAL'}]],r.id);
   if(k==='xv-tea')LSSOCK.mark('xanadu',F,[['awning',0,2.9,0,0,{w:3.6,d:1.2,drop:.3,h:2.5}],['sign',2.6,2,0,0,{w:1.5,h:.55,trade:'TAVERN'}]],r.id);
   // the walker goes round them (the footprint's box, turned)
   if(k!=='xv-pens'&&k!=='xv-corral'){const c=Math.abs(Math.cos(r.ry)),s=Math.abs(Math.sin(r.ry)),hx=(r.w*c+r.d*s)/2,hz=(r.w*s+r.d*c)/2;KWALK.block([r.x-hx,r.x+hx,r.z-hz,r.z+hz,y-1,y+r.h],'house');}});
  REGISTER({name:spec.name,cls:'settlement',kind:'village',key:'longsong_'+spec.id,x:v.site.x,z:v.site.z,y:terrainH(v.site.x,v.site.z)-2,r:120,h:14,
   tags:{culture:'xanadu',types:['dwelling-multi','farm']},note:'core/hamlet: '+v.census.pop+' people, '+v.census.households+' households'});});
 window._hamlets={get villages(){return O.villages.map(V=>Object.assign({},V));},get errors(){return O.errors.slice();},buildings:O.buildings,people:O.people};
 return O;})();
_mark('hamlets');
