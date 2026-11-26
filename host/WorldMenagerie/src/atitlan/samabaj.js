// ---------- Lake Atitlán: Samabaj, the drowned island ----------
// A Late Preclassic island town (about 300 BC to AD 300) off the lake's south shore by the Cerro de Oro, found by the
// diver Roberto Samayoa in 1996 and drowned when the lake rose some 20 m round the end of the Preclassic. The island
// itself is in the bed (terrain.lakeBed.knolls: 477 m north to south, 340 east to west, its north-east height 13.5 m
// down, the west 17.5 to 21 m, a channel cutting off a small island to the north); this draws what stands on it, from
// the dive surveys (Benítez and Samayoa 2000, Medrano and Samayoa 2010):
//   Grupo 3      the long platform of two levels, 25.8 by 9.2 m, a stair begun at the middle of its long side, and the
//                small platforms north-east of it; a basalt stela 4.30 m to its east (1.20 by 0.60 m, three cuts in
//                its face like an obsidian blade's)
//   Grupo Estela the terrace of big squared stones (18.23 m, a projection 1.76 by 1.94 m from its middle); on it
//                Monument 1, a basalt column 0.92 m high, with its altar (1.05 by 1.11 m); Monument 3, a smooth stela
//                fallen 3.16 m west; Monument 4, a round altar 1.14 m across
//   Estela Sisa  24 m north-west: an arc of five tall stones, Monument 5 (a notched stela, 1.25 m) fallen in front of
//                it, two more standing stones, and 16.10 m west a square room (walls 5.85 and 6.31 m, the north gone)
//   Grupo Roca   a natural rock 3 m high and 10 m long built round with a base wall, four squared steps on its east,
//                and a square platform (4.82 by 4.62 m) 7 m north
//   the houses   on the lower west, square outlines of squared stones: Grupo 1 and Grupo 2's eight (1 and 2
//                side by side), and the smaller groups across the island: 11 groups, about 28 structures in all
//   the jetties  three, out from the island's old shore 28 m under today's water (the lake stood 27 to 30 m lower)
// Everything is weathered stone under silt: walls with stones gone and some fallen out of line. One model (landkit),
// placed at the island's centre (L.at), built east-and-south in metres from it. Not in the layout fingerprint.
import {hash3} from '../core/rng.js';

export function samabaj(api,{Model}){
  const {THREE,gh}=api;
  return (L,x,z)=>{
    const WY=(api.ctx&&api.ctx.waterLevel)||0.05,OLD=L.oldLevel||28,g0=gh(x,z),M=Model();
    let seq=0;const R=()=>hash3(seq++,17,L.seed||96);
    const yAt=(e,n)=>gh(x+e,z-n)-g0;   // local ground: e metres east, n north of the centre
    const ub=M.cached('ub',()=>new THREE.BoxGeometry(1,1,1).translate(0,0.5,0));
    const rock=M.cached('rock',()=>new THREE.DodecahedronGeometry(1,0));
    const KS=['basalt','basalt','mossStone','siltStone'],pick=()=>KS[Math.floor(R()*KS.length)];
    const P=(k,g,e,n,y,ry,rx,rz,s)=>M.put(k,g,e,y,-n,ry,rx,rz,s);
    // one squared stone, its base on the ground (or `y`), a little out of true
    const stone=(e,n,l,h,w,ry,y,k)=>P(k||pick(),ub,e,n,(y==null?yAt(e,n):y)-0.06,ry,(R()-0.5)*0.1,(R()-0.5)*0.1,[l,h,w]);
    // a wall of squared stones from one point to another: courses of stones 0.40 to 1.06 m long (Grupo Estela's), some
    // gone, a few fallen out of the line
    function wall(e1,n1,e2,n2,h=0.5,t=0.45,keep=0.86){const len=Math.hypot(e2-e1,n2-n1);if(len<0.2)return;const ue=(e2-e1)/len,un=(n2-n1)/len,ry=Math.atan2(n2-n1,e2-e1);
      const courses=Math.max(1,Math.round(h/0.28)),ch=h/courses;
      for(let c=0;c<courses;c++){let s=c%2?0.3:0;while(s<len-0.15){const l=Math.min(len-s,0.4+R()*0.66),m=s+l/2;s+=l+0.03;if(R()>keep-c*0.12)continue;
        let e=e1+ue*m,n=n1+un*m;const base=yAt(e1+ue*m,n1+un*m);
        if(c===courses-1&&R()<0.07){const o=(R()<0.5?-1:1)*(0.7+R()*0.8);e+=-un*o;n+=ue*o;P(pick(),ub,e,n,yAt(e,n)-0.1,ry+(R()-0.5)*1.2,(R()-0.5)*0.9,(R()-0.5)*0.9,[l*0.95,ch*0.95,t]);continue;}
        stone(e,n,l*0.97,ch*0.96,t*(0.85+R()*0.3),ry,base+c*ch);}}}
    // the four walls of a rectangle turned by `rot` (radians, counter-clockwise from east); `open` drops a side's
    // stones ('n', 'e', 's', 'w') or half of it ('n/2')
    function rect(e,n,w,d,rot=0,h=0.5,open=''){const c=Math.cos(rot),s=Math.sin(rot),C=(a,b)=>[e+a*c-b*s,n+a*s+b*c],
        p=[C(-w/2,-d/2),C(w/2,-d/2),C(w/2,d/2),C(-w/2,d/2)],sides={s:[0,1],e:[1,2],n:[2,3],w:[3,0]};
      for(const k in sides){if(open.includes(k+'/2')){const [a,b]=sides[k];wall(p[a][0],p[a][1],(p[a][0]+p[b][0])/2,(p[a][1]+p[b][1])/2,h);continue;}
        if(open.includes(k))continue;const [a,b]=sides[k];wall(p[a][0],p[a][1],p[b][0],p[b][1],h);}}
    // a platform: its fill of earth and rubble under silt, walled round
    function platform(e,n,w,d,rot=0,h=0.7,y){const base=y==null?Math.min(yAt(e,n),yAt(e+w/2,n),yAt(e-w/2,n),yAt(e,n+d/2),yAt(e,n-d/2)):y;
      P('siltTop',ub,e,n,base-0.3,rot,0,0,[w-0.3,h+0.25,d-0.3]);rect(e,n,w,d,rot,h);return base+h;}
    const stela=(e,n,h,w,t,ry,k='basalt')=>P(k,ub,e,n,yAt(e,n)-0.15,ry,(R()-0.5)*0.12,(R()-0.5)*0.12,[w,h+0.15,t]);
    const fallen=(e,n,len,w,t,ry)=>P('basalt',ub,e,n,yAt(e,n)-0.04,ry,Math.PI/2,0,[w,len,t]);
    const altar=(e,n,r,h)=>M.cyl('basalt',e,yAt(e,n)-0.05,-n,r,r*0.96,h+0.05,14);

    // ---- Grupo 3: the long platform of two levels, the stair begun at its middle, its small platforms ----
    {const e=52,n=58,top=platform(e,n,9.2,25.8,0,0.9);P('siltTop',ub,e+0.4,n,top-0.2,0,0,0,[6.2,0.75,18.5]);rect(e+0.4,n,6.6,19,0,0.6);
      for(let k=0;k<3;k++)stone(e-4.6-0.45-k*0.45,n,0.45,0.3*(3-k),2.2,0,yAt(e-4.6,n)+0.0,'basalt');   // the step out at the middle of the west side
      platform(70,82,5,5,0.1,0.5);platform(80,70,4,6,-0.05,0.45);platform(66,94,4,4,0.2,0.4);
      // the stela 4.30 m east of the long platform, its three cuts
      const se=e+4.6+4.3;stela(se,n+2,1.2,0.6,0.22,0.05);for(let k=0;k<3;k++)P('dark',ub,se-0.115,n+2-0.15+k*0.15,yAt(se,n+2)+0.35,0.05,0,0,[0.02,0.55,0.04]);}

    // ---- Grupo Estela: the terrace of big stones and the column, its altar, the fallen stela, the round altar ----
    {const e=100,n=34,hw=18.23/2;
      for(let a=-hw;a<hw;){const l=0.4+R()*0.66;stone(e+a+l/2,n,l,0.85,0.17+R()*0.67,(R()-0.5)*0.08);a+=l+0.04;}   // the face: one course of big stones
      P('siltTop',ub,e,n+3.2,yAt(e,n+3.2)-0.2,0,0,0,[18.2,0.95,6]);wall(e-hw,n+6.2,e+hw,n+6.2,0.5);wall(e-hw,n,e-hw,n+6.2,0.6);wall(e+hw,n,e+hw,n+6.2,0.6);
      stone(e,n-0.97,1.76,0.7,1.94,0,null,'basalt');   // the projection from its middle
      const ty=yAt(e,n+2)+0.7;
      P('basalt',M.cached('col1',()=>new THREE.CylinderGeometry(0.165,0.08,0.92,6).translate(0,0.46,0)),e,n+2,ty,0.3,0.04,0.02,[1,1,0.6]);   // Monument 1: the basalt column, 0.33 m across at the top and 0.16 at the foot
      stone(e,n+0.9,1.05,0.42,1.11,0.04,ty,'basalt');                                        // its altar
      P('basalt',ub,e-3.16,n+2.2,ty,0.4,Math.PI/2,0,[0.3,0.66,0.2]);                          // Monument 3: the smooth stela, fallen
      M.cyl('basalt',e+2.6,ty,-(n+1.6),0.57,0.55,0.38,16);}                                  // Monument 4: the round altar

    // ---- Grupo Estela Sisa, 24 m north-west: the arc of five, Monument 5 fallen before it, the square room ----
    {const e=83,n=51;for(let k=0;k<5;k++){const a=Math.PI*(0.1+0.8*k/4);stela(e+Math.cos(a)*1.1,n+Math.sin(a)*1.1,1.05+R()*0.35,0.42,0.32,-a);}
      fallen(e+0.2,n-1.5,1.25,0.44,0.18,0.2);P('dark',ub,e+0.2,n-1.5,yAt(e,n-1.5)+0.17,0.2,0,0,[0.46,0.03,0.12]);   // the notch across its middle
      stela(e+3.1,n+0.8,0.9,0.38,0.26,0.3);stela(e+2.6,n+2.9,0.8,0.36,0.24,-0.4);
      rect(e-16.1,n,5.85,6.31,0,0.55,'n/2');}

    // ---- Grupo Roca: the rock built round, its steps, the platform to the north ----
    {const e=26,n=96,y=yAt(e,n);P('basalt',rock,e,n,y+1.2,0.35,0.15,0,[5.2,1.75,2.6]);P('mossStone',rock,e+2.5,n+0.6,y+0.6,1.2,0.3,0.2,[2.2,1.1,1.6]);
      const q=[[e-6.5,n-2.6],[e+6.5,n-2.6],[e+5.2,n+3.0],[e-1.3,n+3.8]];for(let k=0;k<4;k++){const a=q[k],b=q[(k+1)%4];wall(a[0],a[1],b[0],b[1],0.65,0.5);}
      for(let k=0;k<4;k++)stone(e+6.9,n-1.2+k*0.65,0.6,0.25+k*0.12,0.6,0,null,'basalt');   // four squared stones up its east side
      platform(e,n+7+3.8+2.3,4.82,4.62,0.08,0.45);}

    // ---- the houses on the lower west: Grupo 1, Grupo 2's eight, and the small groups across the island ----
    for(const [e,n,r] of [[-38,12,0.1],[-30,22,0.12],[-46,24,0.05]])rect(e,n,5,5,r,0.45);                       // Grupo 1
    {const e=-104,n=30,r=0.18,at=(a,b)=>[e+a*Math.cos(r)-b*Math.sin(r),n+a*Math.sin(r)+b*Math.cos(r)];
      for(const [a,b,w,d,o] of [[0,0,8,4.5,''],[0,7.5,8,4.5,''],[9.5,2,4,4,''],[9.5,8,4,4,''],[-2,15,8.5,5.5,''],[-12,4,5,5,''],[2,23,5,4.5,''],[-11,14,4.5,4,'e n']]){
        const [pe,pn]=at(a,b);rect(pe,pn,w,d,r,0.45,o);}}
    for(const [e,n,w,d,r] of [[-72,-58,6,5,0.3],[-62,-70,5,5,0.32],[-82,-74,4.5,4.5,0.28],[-18,-92,6,5,-0.1],[-6,-100,4.5,4,-0.12],
      [22,-36,6,6,0.05],[33,-46,5,4.5,0.08],[-122,-28,5,5,0.2],[-128,-18,4.5,4.5,0.22],[4,282,5,4,0.15],[-6,290,4,4,0.1]])rect(e,n,w,d,r,0.45);

    // ---- the jetties: out from the old shore, where the ground is OLD m under today's water ----
    const oldY=WY-OLD-g0;let jetties=0;
    for(const b of L.jetties||[170,205,128]){const se=Math.sin(b*Math.PI/180),sn=Math.cos(b*Math.PI/180);let d0=0;
      for(let d=60;d<400;d+=2)if(yAt(se*d,sn*d)<=oldY+0.3){d0=d;break;}if(!d0)continue;jetties++;
      const ry=Math.atan2(sn,se),top=oldY+0.6;
      for(let d=d0-6;d<d0+16;d+=1.15){const e=se*d,n=sn*d,base=yAt(e,n)-0.2;if(base>top-0.3){stone(e,n,1.1,0.4,2.6,ry);continue;}
        if(R()<0.12)continue;P(pick(),ub,e,n,base,ry,(R()-0.5)*0.06,(R()-0.5)*0.06,[1.12,top-base-(R()<0.2?0.4:0),2.6]);}}

    // ---- loose stones and rubble over the island, under the silt ----
    for(let k=0;k<260;k++){const a=R()*Math.PI*2,r=Math.sqrt(R()),e=Math.cos(a)*r*150,n=Math.sin(a)*r*175;stone(e,n,0.3+R()*0.6,0.2+R()*0.3,0.3+R()*0.5,R()*3);}
    api.ctx.details=Object.assign(api.ctx.details||{},{samabaj:{jetties}});
    return M.finish(L,x,g0,z,0);};
}
