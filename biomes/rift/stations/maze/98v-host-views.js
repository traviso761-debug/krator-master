// ================================================================= HOST — the views: the gypsum maze (station 5)
// Written from the cave's own records (48), each eye moved into the open: out of the rock by .7 m and over the water by .6 (eyeAt, searched on
// rings out to 8 m). From the bench up the scarp's face and its mouths, a spring at its foot, a collapse doline from the table and from the
// chamber under it, through a crossroads of the middle storey, a chamber, the wet lowest storey, the Ancients' cut gallery to its breach, the
// walled chamber, the scarp's lip from over the table, and THE MAZE IN PLAN: the table lifted off (the ground hidden, the sky's share lifted
// to 1 so the voids' outsides are lit) and the three storeys seen from above. onView restores the rest.
const WL=CAVE.water.level;
function eyeAt(x,y,z){const ok=(a,b,c)=>CAVE.fast.sdf(a,b,c)>.7&&!(waterH(a,c)>-1e8&&b<WL+.6);if(ok(x,y,z))return[x,y,z];
 for(let r=.5;r<=8;r+=.5)for(let k=0;k<12;k++){const a=k/12*TAU,px=x+r*Math.cos(a),pz=z+r*Math.sin(a);for(const dy of[0,.6,-.5,1.2])if(ok(px,y+dy,pz))return[px,y+dy,pz];}return[x,y,z];}
const PLAN_VIEW='The maze in plan (the table lifted off)';
const VIEWS=(function(){const V={},M=CAVE.M,P=CAVE.passages,B=CAVE.box,cx=CAVE.centre[0],cz=CAVE.centre[1];
 const both=p=>CAVE.covered(M[p.a])&&CAVE.covered(M[p.b])&&CAVE.inB(M[p.a].x,M[p.a].z,-20)&&CAVE.inB(M[p.b].x,M[p.b].z,-20);
 const byNear=(L,x,z,f)=>L.slice().sort((u,v)=>Math.hypot(f(u)[0]-x,f(u)[1]-z)-Math.hypot(f(v)[0]-x,f(v)[1]-z));
 /* the face from the bench: its mouths in the middle of the view */
 {const ms=CAVE.mouths.filter(m=>m.storey>0),mz=ms.length?ms.reduce((a,m)=>a+m.at[2],0)/ms.length:0,x=-236,g=CAVE.ground(x,mz);
  V['The scarp and its mouths (from the bench)']=[x,g+7,mz-30,-158,-17,mz+10];}
 {const S=WATERS.springs[0];if(S){const sp=CAVE.water.springs.find(q=>q.id===S.id),d=sp.dir,x=S.at[0]+d[0]*9-d[1]*4,z=S.at[2]+d[1]*9+d[0]*4;
  V['A spring at the scarp foot']=[x,CAVE.ground(x,z)+2.2,z,sp.at[0],sp.y+1,sp.at[1]];}}
 {const D=CAVE.dolines.slice().sort((a,b)=>b.r-a.r)[0];if(D){const g=SITE.ground(D.x,D.z),fl=D.floor==null?g-D.depth:D.floor,a=.7;
  V['A collapse doline (from the table)']=[D.x+Math.cos(a)*(D.r+7),g+5,D.z+Math.sin(a)*(D.r+7),D.x-Math.cos(a)*D.r*.3,fl+1,D.z-Math.sin(a)*D.r*.3];
  /* from under the overhang at the chamber's far end along its long axis, looking up and out of the pit */
  const c=CAVE.chambers.find(q=>q.id===D.over);if(c){const ax=c.rx>=c.rz,ux=ax?1:0,uz=ax?0:1,R=(ax?c.rx:c.rz)*.86,e=eyeAt(c.c[0]+ux*R,c.c[1]+1.7,c.c[2]+uz*R);
   V['Under the doline (the chamber its roof fell into)']=[e[0],e[1],e[2],D.x-ux*D.r*.6,g+3,D.z-uz*D.r*.6];}}}
 /* a crossroads of the middle storey near the page's middle: the eye 5 m back in one passage, looking straight through the crossing into the
    passage opposite, the side passages opening left and right */
 {const opp=(n,p)=>{const o=M[p.a===n.id?p.b:p.a],u=[o.x-n.x,o.z-n.z],l=Math.hypot(u[0],u[1]);return {o,u:[u[0]/l,u[1]/l]};};
  const ns=CAVE.N2.nodes.filter(n=>n.level===1&&CAVE.covered(n)&&!CAVE.chambers.some(c=>c.node===n.id)).map(n=>({n,P:P.filter(p=>(p.a===n.id||p.b===n.id)&&both(p)).map(p=>opp(n,p))}))
   .filter(q=>q.P.length>=3&&q.P.some(a=>q.P.some(b=>a.u[0]*b.u[0]+a.u[1]*b.u[1]<-.9)));
  const q=byNear(ns,cx-40,cz,q=>[q.n.x,q.n.z])[0];if(q){const a=q.P.find(a=>q.P.some(b=>a.u[0]*b.u[0]+a.u[1]*b.u[1]<-.9)),b=q.P.find(b=>a.u[0]*b.u[0]+a.u[1]*b.u[1]<-.9),n=q.n;
   const e=eyeAt(n.x+a.u[0]*5,n.y+1.6,n.z+a.u[1]*5);V['A crossroads in the maze (the middle storey)']=[e[0],e[1],e[2],b.o.x,b.o.y+1.2,b.o.z];}}
 /* the largest chamber under cover (not the walled one), seen from its wall */
 {const cs=CAVE.chambers.filter(c=>!CAVE.dolines.some(D=>D.over===c.id)&&!(CAVE.loj&&CAVE.loj.chamber===c.id)&&CAVE.inB(c.c[0],c.c[2],-20)).sort((a,b)=>b.rx*b.rz-a.rx*a.rz);const c=cs[0];
  if(c){const e=eyeAt(c.c[0]+c.rx*.7,c.c[1]+1.7,c.c[2]+c.rz*.2);V['A chamber of the maze']=[e[0],e[1],e[2],c.c[0]-c.rx*.5,c.c[1]+c.h*.35,c.c[2]];}}
 /* the wet storey: along a flooded passage near the scarp, the eye over the water */
 {const ws=P.filter(p=>p.level===0&&both(p)&&Math.min(M[p.a].y,M[p.b].y)<WL);const p=byNear(ws,-120,40,p=>[(M[p.a].x+M[p.b].x)/2,(M[p.a].z+M[p.b].z)/2])[0];
  if(p){const a=M[p.a],b=M[p.b],e=eyeAt(a.x,WL+1.25,a.z);V['The wet storey (the perched water)']=[e[0],e[1],e[2],b.x,WL+.9,b.z];}}
 if(CAVE.ancients){const A=CAVE.ancients,e=eyeAt(A.end[0]+18,A.at[1]+1.7,A.end[2]);V['The Ancient cut gallery (its breach into the maze)']=[e[0],e[1],e[2],A.at[0]-2,A.at[1]+1.4,A.at[2]];}
 if(CAVE.loj){const W=CAVE.loj.walls[0],e=eyeAt(W.at[0]+W.dir[0]*6,W.at[1]+1.6,W.at[2]+W.dir[1]*6);V['The walled chamber']=[e[0],e[1],e[2],W.at[0],W.at[1]+1.3,W.at[2]];}
 /* the scarp's lip from the air off the face: the face and its mouths running away north */
 V['The scarp lip (from the air off the face)']=[-185,4,-110,-152,-18,20];
 V[PLAN_VIEW]=[cx-20,300,cz+40,cx-20,-20,cz];
 return V;})();
function onView(name){const p=name===PLAN_VIEW;VIEW.plan=p;GROUND.mesh.visible=!p;SKY_ALL.value=p?1:0;}
