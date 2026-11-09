// ================================================================= HOST — the views: the hold's active storey (station 2)
// Replaces the crystals' 98v (this station's base) and uses its 98u (eyeAt, vol, midOf).
const VIEWS=(function(){const V={},ch=id=>CAVE.chambers.find(c=>c.id===id),T=CAVE.water.level;
 /* the hold's active storey: from the way down's landing over the pool it comes into, from the east pool's shelf, the scalding feeder pool under
    the Cave of Crystals, the chandeliers, the fumarole, the hold's lower storey, and the massing from above */
 {const L=vol('hold:down:landing'),m=midOf(L),c=ch('ch:n0:-14,-5'),e=eyeAt(m[0],L.floor+1.7,m[1]);V['The landing pool']=[e[0],e[1],e[2],c.c[0],T+1.5,c.c[2]];}
 {const S=vol('hold:shelf:ch:n0:-9,-3'),m=midOf(S),c=ch('ch:n0:-9,-3'),e=eyeAt(m[0],S.floor+1.7,m[1]);V['The east pool, from its shelf']=[e[0],e[1],e[2],c.c[0],T+2,c.c[2]];}
 {const c=ch('ch:n0:-11,-3'),u=unit([c.c[0],c.c[2]],[ch('ch:n0:-9,-3').c[0],ch('ch:n0:-9,-3').c[2]]),e=eyeAt(c.c[0]+u[0]*c.rx*.8,T+2.2,c.c[2]+u[1]*c.rz*.8);
  V['Scalding water under the Cave of Crystals']=[e[0],e[1],e[2],c.c[0],T+4,c.c[2]];}
 {const by={};CAVE.hypo.forEach(r=>{if(r.kind==='chandelier')by[r.chamber]=(by[r.chamber]||0)+1;});const id=Object.keys(by).sort((a,b)=>by[b]-by[a])[0];
  if(id){const c=ch(id),e=eyeAt(c.c[0]+c.rx*.35,T+2.5,c.c[2]+c.rz*.2);V['Gypsum chandeliers']=[e[0],e[1],e[2],c.c[0]-c.rx*.2,c.c[1]+c.h*.8,c.c[2]];}}
 if(CAVE.fumarole){const Fm=CAVE.fumarole,e=eyeAt(Fm.c[0]+7,T+2,Fm.c[1]+5);V['The fumarole']=[e[0],e[1],e[2],Fm.c[0],T+14,Fm.c[1]];}
 {const S=vol('hold:field:ch:n0:-15,-5:1')||vol('hold:shelf:ch:n0:-15,-5'),m=midOf(S),c=ch('ch:n0:-15,-5'),e=eyeAt(m[0],S.floor+1.7,m[1]);
  V['The hold\'s lower storey (reserved, empty)']=[e[0],e[1],e[2],c.c[0],T+1,c.c[2]];}
 V['The hold\'s massing (from above)']=[FX+40,SITE.ground(FX,FZ)+150,FZ+170,FX-40,SITE.net.level,FZ-30];
 return V;})();
