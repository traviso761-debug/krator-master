// ================================================================= INTERIORS — room-graph daylight, lamp ambience & corner AO
// [G data] Stage 7 (GRAPHICS-TERRAIN-PROPOSAL.md section 8, I1-I4): pure data and deterministic functions with no THREE,
// no DOM and no Math.random, shared by web pages (settlements/longsong) and Godot (godot/krator/kinteriors_light.gd).
//
//   KROOMLIGHT.buildTable(o) -> {version:1, order:[id...], byId:{id: row}}
//     A multi-source walk over the room graph from exterior windows, skylights and open exterior doors: a room's own sky
//     sets its hop-0 daylight, then each portal passes on 0.35..0.52 of it (by its width), relaxed until nothing rises (at
//     most 32 passes). Subterranean vault rooms receive zero sky daylight. Light never crosses a solid wall.
//     o: {rooms, windowsOf(room), lampsOf(room), skylightsOf(room), shut(room, door)}. A room: {id, box | x0 y0 z0..,
//     doors: [{to | room, w, out, shut}], windows: [{w, h | u0 u1 v0 v1, aperture}], skylights: [{w, d | r, aperture}],
//     skylight (a flag: at least 0.66), outdoor, vault, lamps}. A window's or a skylight's aperture (default 1) is the
//     open share of it: a jali, a pierced screen. A door with shut: true, or one o.shut(room, door) calls shut (core/door's
//     live state), is no portal: rebuild the table when a leaf opens. Every new field is optional: without one, a table is
//     what it was (2026-11-23, XS2: Erewhon's citadel).
//   KROOMLIGHT.pickPool(o)   -> [{kind:'window'|'lamp', at:[x,y,z], color, amp, range, room, heroShadow}]
//     Room-gated near-light pool selector (I3): picks windows and lamps strictly from the eye's room (priority 1, top
//     heroShadows lamps flagged for native dynamic shadows in Godot) and 1-hop open doorway neighbours (priority 2).
//     o.windows [{room, x, y, z, aperture, sky}]: a window's amp is scaled by its aperture; a sky: true one (a skylight,
//     an oculus) is a column of light down from its opening at y: measured from the eye across, and up only where the eye
//     stands above the opening, its light set o.skyFill (default 6) m over the eye and never above the opening, so a
//     skylight 40 m over a hall's floor lights the floor. Godot's twin: kinteriors_light.gd pick_pool.
//   KROOMLIGHT.vertexCornerAO(px, py, pz, nx, ny, nz, box, reach) -> 0.44 .. 1.0
//     Analytic per-vertex dihedral & trihedral concavity darkening (I4: floor-wall, ceiling-wall and wall-wall joints).
var KROOMLIGHT=(function(){'use strict';
 var clamp=function(x,a,b){return x<a?a:x>b?b:x;};
 var smooth=function(a,b,x){var t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
 var R4=function(v){return Math.round(v*10000)/10000;};

 function buildTable(o){
  o=o||{};
  var rooms=o.rooms||[],winFn=o.windowsOf,lampFn=o.lampsOf,skyFn=o.skylightsOf,shutFn=o.shut;
  var byRoom={},order=[];
  for(var i=0;i<rooms.length;i++){
   var r=rooms[i];if(!r||!r.id)continue;
   byRoom[r.id]=r;order.push(r.id);
  }
  var adj={},extPortals={};
  for(var j=0;j<order.length;j++){adj[order[j]]=[];extPortals[order[j]]=0;}
  for(var k=0;k<order.length;k++){
   var rm=byRoom[order[k]],doors=rm.doors||[];
   for(var d=0;d<doors.length;d++){
    var dr=doors[d],dw=dr.w==null?1.2:dr.w;
    if(dr.shut||(shutFn&&shutFn(rm,dr)))continue;   /* a shut leaf is a wall to the light */
    if(dr.out){
     if(!rm.vault)extPortals[rm.id]+=dw;
     if(dr.room&&byRoom[dr.room]&&!byRoom[dr.room].vault){
      adj[rm.id].push({to:dr.room,w:dw});
      adj[dr.room].push({to:rm.id,w:dw});
     }
     continue;
    }
    var to=dr.to||dr.room;
    if(to&&byRoom[to]){
     var has=false,list=adj[rm.id];
     for(var m=0;m<list.length;m++){if(list[m].to===to){has=true;break;}}
     if(!has)list.push({to:to,w:dw});
     var rlist=adj[to],rhas=false;
     for(var m2=0;m2<rlist.length;m2++){if(rlist[m2].to===rm.id){rhas=true;break;}}
     if(!rhas)rlist.push({to:rm.id,w:dw});
    }
   }
  }

  var day={},hop={};
  for(var a=0;a<order.length;a++){
   var id=order[a],rc=byRoom[id];
   day[id]=0;hop[id]=-1;
   if(rc.vault)continue;
   if(rc.outdoor){day[id]=1;hop[id]=0;continue;}
   var wins=winFn?winFn(rc):(rc.windows||[]),wArea=0,wCnt=wins?wins.length:0;
   for(var wi=0;wi<wCnt;wi++){
    var w=wins[wi],ww=w.u1!=null&&w.u0!=null?Math.abs(w.u1-w.u0):(w.w==null?1.2:w.w),wh=w.v1!=null&&w.v0!=null?Math.abs(w.v1-w.v0):(w.h==null?1.6:w.h);
    wArea+=ww*wh*(w.aperture==null?1:w.aperture);
   }
   var sks=skyFn?skyFn(rc):(rc.skylights||[]),skArea=0;
   for(var si=0;si<(sks?sks.length:0);si++){
    var sk=sks[si],sa=sk.r!=null?Math.PI*sk.r*sk.r:(sk.w==null?1:sk.w)*(sk.d==null?1:sk.d);
    skArea+=sa*(sk.aperture==null?1:sk.aperture);
   }
   var s0=0;
   if(wCnt>0)s0=Math.max(s0,clamp(.34+.15*Math.sqrt(wArea),.36,.92));
   if(extPortals[id]>0)s0=Math.max(s0,clamp(.30+.09*extPortals[id],.34,.62));
   if(rc.skylight)s0=Math.max(s0,.66);
   /* light from overhead: the sky seen straight up, so more for its area than a window's */
   if(skArea>0)s0=Math.max(s0,clamp(.40+.14*Math.sqrt(skArea),.46,.95));
   if(s0>0){day[id]=s0;hop[id]=0;}
  }

  /* Relax portal attenuation over the doorway graph (monotone decay per hop; zero across solid unlinked walls, zero into vaults) */
  var changed=true,guard=0;
  while(changed&&guard<32){
   changed=false;guard++;
   for(var p=0;p<order.length;p++){
    var u=order[p],du=day[u];if(!(du>.002))continue;
    var edges=adj[u];
    for(var e=0;e<edges.length;e++){
     var ed=edges[e],v=ed.to,rv=byRoom[v];
     if(!rv||rv.vault||rv.outdoor)continue;
     var atten=clamp(.32+.075*Math.min(ed.w,2.6),.35,.52);
     var cand=du*atten;
     if(cand>day[v]+1e-4){
      day[v]=cand;
      hop[v]=hop[u]>=0?hop[u]+1:1;
      changed=true;
     }
    }
   }
  }

  var byId={};
  for(var idx=0;idx<order.length;idx++){
   var rid=order[idx],r0=byRoom[rid];
   var bx=r0.box||[r0.x0==null?0:r0.x0,r0.y==null?0:r0.y,r0.z0==null?0:r0.z0,r0.x1==null?4:r0.x1,(r0.y==null?0:r0.y)+(r0.h==null?4:r0.h),r0.z1==null?4:r0.z1];
   var area=Math.max(4,Math.abs(bx[3]-bx[0])*Math.abs(bx[5]-bx[2]));
   var lamps=lampFn?lampFn(r0):(r0.lamps||[]),lCnt=lamps?lamps.length:0,lFlux=0;
   for(var li=0;li<lCnt;li++){
    var lp=lamps[li],amp=Array.isArray(lp)?(lp[3]==null?1:lp[3]):(lp.amp==null?1:lp.amp),rad=Array.isArray(lp)?(lp[4]==null?8:lp[4]):(lp.r==null?8:lp.r);
    lFlux+=amp*Math.max(4,rad);
   }
   var baseLamp=r0.vault?.14:(lCnt>0?clamp(.06+lFlux/(area*1.6),.07,.38):(r0.outdoor?0:.045));
   var tint=r0.vault?[0.56,0.64,0.82]:(hop[rid]===0?[0.85,0.91,1.0]:[0.78,0.85,0.96]);
   var lcol=r0.vault?[0.92,0.72,0.46]:[1.0,0.75,0.43];
   var plist=[], seenP={};
   var es=adj[rid];
   for(var pe=0;pe<es.length;pe++){var toId=es[pe].to;if(!seenP[toId]){seenP[toId]=1;plist.push(toId);}}
   var wns=winFn?winFn(r0):(r0.windows||[]);
   var sks0=skyFn?skyFn(r0):(r0.skylights||[]);
   byId[rid]={
    index:idx,
    id:rid,
    interior:!r0.outdoor,
    vault:!!r0.vault,
    hop:hop[rid],
    daylight:R4(day[rid]),
    daylightTint:tint,
    lampAmbience:R4(baseLamp),
    lampColor:lcol,
    windowCount:wns?wns.length:0,
    lampCount:lCnt,
    portals:plist
   };
   if(sks0&&sks0.length)byId[rid].skylightCount=sks0.length;
  }
  return{version:1,order:order,byId:byId};
 }

 function vertexCornerAO(px,py,pz,nx,ny,nz,box,reach){
  if(!box||box.length<6)return 1;
  var r=reach==null?.85:reach;if(!(r>0))return 1;
  var df=Math.max(0,py-box[1]),dc=Math.max(0,box[4]-py);
  var dw=Math.max(0,px-box[0]),de=Math.max(0,box[3]-px);
  var dn=Math.max(0,pz-box[2]),ds=Math.max(0,box[5]-pz);
  /* Ignore distance to the wall/floor/ceiling plane this vertex itself lies on (inward normal points away from that plane) */
  var fFloor=ny>.65?1:(.62+.38*smooth(0,r,df));
  var fCeil=ny<-.65?1:(.68+.32*smooth(0,r,dc));
  var fW=nx>.65?1:(.68+.32*smooth(0,r,dw));
  var fE=nx<-.65?1:(.68+.32*smooth(0,r,de));
  var fN=nz>.65?1:(.68+.32*smooth(0,r,dn));
  var fS=nz<-.65?1:(.68+.32*smooth(0,r,ds));
  return clamp(fFloor*fCeil*Math.min(fW,fE)*Math.min(fN,fS),.44,1);
 }

 function pickPool(o){
  o=o||{};
  var eye=o.eye||[0,0,0],eyeRoom=o.eyeRoom||'',table=o.table,byId=table&&table.byId||{};
  var maxTotal=o.count==null?8:o.count,maxWins=o.maxWindows==null?4:o.maxWindows,heroShadows=o.heroShadows==null?2:o.heroShadows;
  var sunUp=o.sunUp==null?1:clamp(o.sunUp,0,1),nightK=1-sunUp;
  var row=byId[eyeRoom];if(!row)return[];
  var allowed={};allowed[eyeRoom]=1;
  var portals=row.portals||[];
  for(var p=0;p<portals.length;p++)allowed[portals[p]]=2;

  var wCand=[];
  if(sunUp>.06&&!row.vault){
   var wins=o.windows||[],skyFill=o.skyFill==null?6:o.skyFill;
   for(var i=0;i<wins.length;i++){
    var w=wins[i],wr=w.room||'';
    var tier=allowed[wr];if(!tier)continue;
    var wy=w.sky?Math.min(w.y,eye[1]+skyFill):w.y,up=w.sky?Math.max(0,eye[1]-w.y):0;
    var dx=w.x-eye[0],dy=w.sky?up:wy-eye[1],dz=w.z-eye[2],d2=dx*dx+dy*dy+dz*dz;
    if(d2>26*26)continue;
    var pen=tier===1?1:3.2,ap=w.aperture==null?1:w.aperture;
    wCand.push({score:d2*pen,kind:'window',at:[w.x,wy,w.z],color:[0.88,0.93,1.0],amp:1.35*sunUp*(tier===1?1:.55)*ap,range:15,room:wr,heroShadow:false});
   }
   wCand.sort(function(a,b){return a.score-b.score;});
  }
  var chosen=wCand.slice(0,maxWins);

  var lCand=[],lamps=o.lamps||[];
  for(var j=0;j<lamps.length;j++){
   var l=lamps[j],lr=l.room||'';
   var ltier=allowed[lr];if(!ltier)continue;
   var ldx=l.x-eye[0],ldy=l.y-eye[1],ldz=l.z-eye[2],ld2=ldx*ldx+ldy*ldy+ldz*ldz;
   if(ld2>28*28)continue;
   var lpen=ltier===1?.5:2.8,baseAmp=l.amp==null?1:l.amp,rng=Math.max(7.5,(l.r==null?8:l.r)*1.15);
   lCand.push({score:ld2*lpen/Math.max(.35,baseAmp),inEyeRoom:ltier===1,kind:'lamp',at:[l.x,l.y,l.z],color:l.color||[1.0,0.76,0.44],amp:baseAmp*(.72+1.15*nightK)*(ltier===1?1:.6),range:rng,room:lr,heroShadow:false});
  }
  lCand.sort(function(a,b){return a.score-b.score;});
  var rem=Math.max(0,maxTotal-chosen.length),shadLeft=heroShadows;
  for(var q=0;q<Math.min(rem,lCand.length);q++){
   var pick=lCand[q];
   if(pick.inEyeRoom&&shadLeft>0){pick.heroShadow=true;shadLeft--;}
   chosen.push(pick);
  }
  return chosen;
 }

 return{buildTable:buildTable,vertexCornerAO:vertexCornerAO,pickPool:pickPool};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KROOMLIGHT;
