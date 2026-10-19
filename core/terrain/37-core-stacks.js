// ================================================================= CORE — stacks (rock standing on a heightfield: mesas, buttes, spires, fins)  [G data]
// Bedded rock bodies for any heightfield world: the necanyons' benches, caps and stacks (biomes/necanyons), Pinnacle Rock's
// mesa and its North Fins and Garden (settlements/pinnacle-rock/PLAN.md section 2), and any desert's hoodoo country. Grown
// from nwbay's karst stacks (biomes/nwbay/src/45-host-stage.js: one footprint function and one top function make the field,
// the height and the mesh agree, so a plant's foot is on the drawn rock), generalised to BEDS: a body is a pile of beds,
// each an irregular disc with its own centre, radii, strike, a notch at its foot (the soft parting weathers back) and a
// chamfer at its top edge. A bed narrower than the one below leaves a LEDGE; a cap wider than its neck is a balanced rock.
//
// No THREE, no DOM: plain maths, node-tested (test-stacks.js). Every draw is integer-hashed from core/rand (KRAND), by the
// body's seed and its bed's index, never by how many draws came before it. Axes: y up, metres, x east, z south.
//
//   KSTACKS.make({id, kind:'mesa'|'butte'|'spire'|'fin'|'balanced', x, z, y0 (the ground at the foot), seed, ...})
//        mesa/butte: tiers:[{h (the tier's rise), r (radius), e (elongation, 1 round), ry (strike, radians), dx, dz (the
//                    tier's centre from the body's)}], bed:[lo,hi] (bed thickness, m), lobes (.16: how ragged the outline)
//        spire/balanced/fin: H (height), r (radius at the foot), e (fin: 3..6), ry (strike), lean (radians), taper (.45)
//        -> a record {id, kind, x, z, y0, seed, beds:[{k, y, h, cx, cz, rx, rz, ry, ch (chamfer), nt (notch), lob, ns, tier}],
//           top, R (bounding radius about x,z)}
//   KSTACKS.footR(b, ang)      the bed's footprint radius at an angle about its own centre (the one footprint function)
//   KSTACKS.topH(b, x, z)      the bed's top surface at x,z (flat, a little rough: the one top function)
//   KSTACKS.at(list, x, z)     {S, b, top, d} the highest bed top over (x,z) (d its signed distance to that top's edge,
//                              negative inside), or null; KSTACKS.topAt(list,x,z) the height alone (-Infinity off the rock)
//   KSTACKS.foot(list, x, z)   {S, d} the nearest body's foot: d the signed distance to its lowest bed's footprint
//   KSTACKS.ledge(list, x, z)  {S, b, w} when (x,z) is on a ledge (a bed's top out from under the bed above), else null
//   KSTACKS.ring(S, y, n)      the outline at height y: n [x,z] points (the roost placer fits a deck to it), or null
//   KSTACKS.mesh(S, opt)       {pos, uv, idx, part, bed, occ}: walls, tops and an overhang's underside; CCW from outside.
//                              part 0 wall, 1 top, 2 underside; occ 0..1 (the notch and the underside dark); uv in metres
//                              (walls: arc length and y; tops: x and z). opt.step (5 m: the wall's segment length)
//   KSTACKS.row({id, seed, a:[x,z], b:[x,z], n, kind:'fin', H:[lo,hi], r:[lo,hi], e:[lo,hi], ground})   fins along a
//                              strike: one line, one lean
//   KSTACKS.cluster({id, seed, c:[x,z], rad, n, kinds:{spire,balanced,fin}, H, r, gap, ground, accept})   a garden of stacks
//   KSTACKS.export(list) / KSTACKS.load(json)   {format:'krator-stacks', version:1, bodies}
//   KSTACKS.hash(mesh)         a fingerprint of a mesh's arrays (determinism)
(function(root){
  'use strict';
  var KR=root.KRAND;
  if(!KR) throw new Error('37-core-stacks: load core/rand/08-core-rand.js first');
  var TAU=Math.PI*2;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function S(seed){return KR.stream(seed>>>0);}

  // ---------------------------------------------------------------- the one footprint function
  // an ellipse (rx along the strike ry, rz across), its radius moved by two octaves of noise round the angle: coarse lobes
  // (the mesa's alcoves and points) and a fine fret. A bed's own noise seed ns; beds of one tier share it (the wall is one wall)
  function footR(b,ang){var a=ang-b.ry,c=Math.cos(a)/b.rx,s=Math.sin(a)/b.rz,R=1/Math.sqrt(c*c+s*s);
    var ca=Math.cos(ang),sa=Math.sin(ang);
    var n=KR.fbm(ca*1.6+40,sa*1.6+40,b.tier*3.1,2,b.ns)-.5,f=KR.fbm(ca*5.5+80,sa*5.5+80,b.k*.73,1,b.ns+7)-.5;
    return R*(1+b.lob*2*n+b.lob*.35*f);}
  // the bed's top: flat, with a little roughness (rock pans and knobs); the mesh's top vertices are on it exactly
  function topH(b,x,z){return b.y+b.h+.7*(KR.fbm(x*.045+b.ns%97,z*.045,b.k,2,b.ns+11)-.5);}
  // the wall's radius factor up a bed (u 0 at its foot, 1 at its top): the notch weathered back at the parting, the chamfer
  function prof(b,u){var n=u<.2?1-b.nt*Math.pow(1-u/.2,2):1,c=u>.78?1-b.ch*Math.pow((u-.78)/.22,1.6):1;return n*c;}

  // ---------------------------------------------------------------- the bodies
  var KINDS={mesa:1,butte:1,spire:1,fin:1,balanced:1};
  function bed(k,y,h,cx,cz,rx,rz,ry,ch,nt,lob,ns,tier){return {k:k,y:y,h:h,cx:cx,cz:cz,rx:rx,rz:rz,ry:ry,ch:ch,nt:nt,lob:lob,ns:ns>>>0,tier:tier};}
  function make(o){
    if(!o||!KINDS[o.kind]) throw new Error('KSTACKS.make: kind must be mesa, butte, spire, fin or balanced');
    if(o.id==null) throw new Error('KSTACKS.make: a body needs an id');
    var seed=(o.seed==null?KR.child(1,String(o.id)):o.seed)>>>0,x=o.x||0,z=o.z||0,y0=o.y0==null?0:o.y0,beds=[];
    if(o.kind==='mesa'||o.kind==='butte'){
      var tiers=o.tiers||[{h:o.H==null?120:o.H,r:o.r==null?150:o.r,e:o.e==null?1.3:o.e,ry:o.ry||0}];
      var bl=o.bed||[14,34],lob=o.lobes==null?.16:o.lobes,y=y0,k=0;
      for(var t=0;t<tiers.length;t++){var T=tiers[t],rs=S(KR.hash(seed,t,101)),ns=KR.hash(seed,t,7),top=y+T.h,e=T.e==null?1.3:T.e;
        var cx=x+(T.dx||0),cz=z+(T.dz||0),rx=T.r*Math.sqrt(e),rz=T.r/Math.sqrt(e),ry=T.ry==null?(o.ry||0):T.ry;
        while(y<top-1){var h=Math.min(rs.range(bl[0],bl[1]),top-y);if(top-y-h<bl[0]*.6)h=top-y;
          var last=y+h>=top-.01,j=1+rs.range(-.035,.035)+(last?.03:0);             // the cap rock stands a little proud: harder
          beds.push(bed(k++,y,h,cx,cz,rx*j,rz*j,ry,last?.05:rs.range(.01,.03),last?.05:rs.range(.03,.09),lob,ns,t));y+=h;}}
    }else{
      var r=S(KR.hash(seed,0,202)),H=o.H==null?60:o.H,r0=o.r==null?12:o.r,e2=o.kind==='fin'?(o.e==null?4:o.e):(o.e==null?1.15:o.e);
      var ry2=o.ry==null?r.range(0,TAU):o.ry,lean=o.lean==null?r.range(0,.06):o.lean,la=o.kind==='fin'?ry2+(r.chance(.5)?0:Math.PI):r.range(0,TAU);
      var taper=o.taper==null?(o.kind==='fin'?.35:.45):o.taper,n=Math.max(3,Math.round(H/r.range(6,11))),yy=y0,hs=[],sum=0,i;
      for(i=0;i<n;i++){var w=r.range(.7,1.3);hs.push(w);sum+=w;}
      var neck=o.kind==='balanced'?n-2:-1,lobS=o.kind==='fin'?.07:.1;
      for(i=0;i<n;i++){var hh=H*hs[i]/sum,u=(yy-y0)/H,rr=r0*(1-taper*u)*r.range(.9,1.1),off=Math.tan(lean)*(yy-y0);
        var ccx=x+Math.cos(la)*off,ccz=z+Math.sin(la)*off,cap=i===n-1;
        if(i===neck)rr*=r.range(.45,.6);
        if(cap&&o.kind==='balanced'){rr=r0*r.range(.95,1.25);hh=Math.max(hh,rr*r.range(.7,1.1));}
        beds.push(bed(i,yy,hh,ccx,ccz,rr*Math.sqrt(e2),rr/Math.sqrt(e2),ry2+r.range(-.05,.05),r.range(.04,.12),r.range(.03,.1),lobS,KR.hash(seed,i,9),i));yy+=hh;}
    }
    var R=0;beds.forEach(function(b){var m=Math.max(b.rx,b.rz)*(1+2.5*b.lob)+Math.hypot(b.cx-x,b.cz-z);if(m>R)R=m;});
    var tp=beds[beds.length-1];
    return {id:String(o.id),kind:o.kind,x:x,z:z,y0:y0,seed:seed,beds:beds,top:tp.y+tp.h,R:R+2};
  }

  // ---------------------------------------------------------------- queries
  function inBed(b,x,z,shrink){var dx=x-b.cx,dz=z-b.cz,dist=Math.hypot(dx,dz),R=footR(b,Math.atan2(dz,dx))*shrink;return dist-R;}
  function at(list,x,z){var best=null;
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R||Math.abs(z-B.z)>B.R)continue;
      for(var k=B.beds.length-1;k>=0;k--){var b=B.beds[k],d=inBed(b,x,z,1-b.ch);if(d<0){var t=topH(b,x,z);if(!best||t>best.top)best={S:B,b:b,top:t,d:d};break;}}}
    return best;}
  function topAt(list,x,z){var a=at(list,x,z);return a?a.top:-Infinity;}
  function foot(list,x,z){var best=null;
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R+400||Math.abs(z-B.z)>B.R+400)continue;
      var d=inBed(B.beds[0],x,z,1);if(!best||d<best.d)best={S:B,d:d};}
    return best;}
  // on a ledge: on bed k's top and outside the foot of bed k+1 (its notch counted), w the distance in from the ledge's lip
  function ledge(list,x,z){var a=at(list,x,z);if(!a)return null;var B=a.S,k=a.b.k;if(k>=B.beds.length-1)return null;
    var up=B.beds[k+1],dUp=inBed(up,x,z,1-up.nt);if(dUp<=0)return null;return {S:B,b:a.b,w:-a.d,out:dUp};}
  function ring(B,y,n){n=n||48;var b=null;for(var k=0;k<B.beds.length;k++){var q=B.beds[k];if(y>=q.y&&y<=q.y+q.h){b=q;break;}}
    if(!b)return null;var u=(y-b.y)/b.h,f=prof(b,u),out=[];
    for(var i=0;i<n;i++){var a=i/n*TAU,R=footR(b,a)*f;out.push([b.cx+Math.cos(a)*R,b.cz+Math.sin(a)*R]);}return out;}

  // ---------------------------------------------------------------- the mesh
  // Rows of `seg` vertices round a bed (the angle runs clockwise seen from above, rows rising or closing in, so the quads (a, a+1, b) are CCW from
  // outside: test-stacks.js checks the outward share); a seam column is duplicated so the arc-length uv does not wrap.
  function mesh(B,opt){opt=opt||{};var step=opt.step||5,pos=[],uv=[],idx=[],part=[],bedA=[],occ=[];
    function grid(rows,seg,p,bk,flip){var base=pos.length/3;
      for(var r=0;r<rows.length;r++)for(var s=0;s<=seg;s++){var q=rows[r](s);pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);part.push(p);bedA.push(bk);occ.push(q[5]);}
      for(r=0;r<rows.length-1;r++)for(s=0;s<seg;s++){var a=base+r*(seg+1)+s,c=a+seg+1;
        if(flip)idx.push(a,c,a+1,a+1,c,c+1);else idx.push(a,a+1,c,a+1,c+1,c);}}
    for(var k=0;k<B.beds.length;k++){var b=B.beds[k],per=TAU*Math.max(b.rx,b.rz)*(1+b.lob),seg=Math.max(16,Math.min(160,Math.round(per/step)));
      var ang=function(s){return -s/seg*TAU;};                                        // clockwise from above
      var arc=[0];for(var s=1;s<=seg;s++){var a0=ang(s-1),a1=ang(s),r0=footR(b,a0),r1=footR(b,a1);arc.push(arc[s-1]+Math.hypot(Math.cos(a1)*r1-Math.cos(a0)*r0,Math.sin(a1)*r1-Math.sin(a0)*r0));}
      var us=[0,.06,.2,.5,.78,.9,1],wall=us.map(function(u){return function(s){var a=ang(s),R=footR(b,a)*prof(b,u),y=b.y+u*b.h;
        return [b.cx+Math.cos(a)*R,y,b.cz+Math.sin(a)*R,arc[s],y,u<.2?.55+.45*(u/.2):1];};});
      wall[wall.length-1]=(function(){return function(s){var a=ang(s),R=footR(b,a)*(1-b.ch),x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;return [x,topH(b,x,z),z,arc[s],b.y+b.h,1];};})();
      grid(wall,seg,0,k,false);
      // the top: rings in from the chamfer's edge to the centre, on topH exactly
      var tops=[1,.8,.55,.3,.08].map(function(rho){return function(s){var a=ang(s),R=footR(b,a)*(1-b.ch)*rho,x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;return [x,topH(b,x,z),z,x,z,1];};});
      grid(tops,seg,1,k,false);
      // an overhang's underside (a balanced cap, a bed wider than the top below it): a disc facing down at its foot
      var below=k>0?B.beds[k-1]:null,over=false;
      if(below)for(s=0;s<seg&&!over;s+=4){var aa=ang(s);if(footR(b,aa)*(1-b.nt)>footR(below,aa)*(1-below.ch)*1.08)over=true;}
      if(over){var und=[1,.6,.25].map(function(rho){return function(s){var a=ang(s),R=footR(b,a)*(1-b.nt)*rho,x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;return [x,b.y,z,x,z,.35];};});
        grid(und,seg,2,k,true);}
    }
    return {pos:new Float32Array(pos),uv:new Float32Array(uv),idx:new Uint32Array(idx),part:new Uint8Array(part),bed:new Uint8Array(bedA),occ:new Float32Array(occ)};}

  // ---------------------------------------------------------------- layouts
  function row(o){var n=o.n||5,a=o.a,b=o.b,out=[],str=Math.atan2(b[1]-a[1],b[0]-a[0]),g=o.ground||function(){return 0;};
    var lean=S(KR.hash(o.seed,0,303)).range(0,.07);
    for(var i=0;i<n;i++){var r=S(KR.hash(o.seed,i,304)),t=(i+.5+r.range(-.3,.3))/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
      x+=Math.cos(str+Math.PI/2)*r.range(-1,1)*(o.jitter||8);z+=Math.sin(str+Math.PI/2)*r.range(-1,1)*(o.jitter||8);
      out.push(make({id:o.id+'-'+i,kind:o.kind||'fin',x:x,z:z,y0:g(x,z)-1,seed:KR.hash(o.seed,i,305),H:r.range(o.H[0],o.H[1]),
        r:r.range(o.r[0],o.r[1]),e:o.e?r.range(o.e[0],o.e[1]):4,ry:str+r.range(-.08,.08),lean:lean}));}
    return out;}
  function cluster(o){var n=o.n||8,out=[],g=o.ground||function(){return 0;},K=o.kinds||{spire:.6,balanced:.25,fin:.15},keys=Object.keys(K),tot=0;
    keys.forEach(function(k){tot+=K[k];});
    for(var i=0;i<n;i++){for(var tr=0;tr<24;tr++){var r=S(KR.hash(o.seed,i,tr,404)),ang=r.range(0,TAU),d=o.rad*Math.sqrt(r.next()),x=o.c[0]+Math.cos(ang)*d,z=o.c[1]+Math.sin(ang)*d;
        var rad=r.range(o.r[0],o.r[1]),ok=!o.accept||o.accept(x,z,rad);
        for(var j=0;j<out.length&&ok;j++)if(Math.hypot(out[j].x-x,out[j].z-z)<rad+out[j]._r+(o.gap==null?6:o.gap))ok=false;
        if(!ok)continue;var u=r.next()*tot,kind=keys[0];for(var q=0;q<keys.length;q++){u-=K[keys[q]];if(u<=0){kind=keys[q];break;}}
        var B=make({id:o.id+'-'+i,kind:kind,x:x,z:z,y0:g(x,z)-1,seed:KR.hash(o.seed,i,405),H:r.range(o.H[0],o.H[1]),r:rad});B._r=rad;out.push(B);break;}}
    out.forEach(function(B){delete B._r;});return out;}

  function exp(list){return {format:'krator-stacks',version:1,bodies:list.map(function(B){return JSON.parse(JSON.stringify(B));})};}
  function load(j){if(!j||j.format!=='krator-stacks')throw new Error('KSTACKS.load: not a krator-stacks export');return j.bodies.map(function(B){return JSON.parse(JSON.stringify(B));});}
  function hash(m){var h=KR.hash(1,m.pos.length,m.idx.length);
    for(var i=0;i<m.pos.length;i+=7)h=KR.hash(h,Math.round(m.pos[i]*1000));for(i=0;i<m.idx.length;i+=11)h=KR.hash(h,m.idx[i]);return h>>>0;}

  root.KSTACKS={make:make,footR:footR,topH:topH,prof:prof,at:at,topAt:topAt,foot:foot,ledge:ledge,ring:ring,mesh:mesh,row:row,cluster:cluster,
    export:exp,load:load,hash:hash};
})(typeof globalThis!=='undefined'?globalThis:this);
