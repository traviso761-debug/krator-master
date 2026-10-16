// prefix: nr
// ================================================================= ANCIENT OFFICES: the Lens office (barracks, and one the mess hall)
// Five office floors behind bowed glass curtain walls, with deep white fins in a vertical rhythm (the counterpoint to the
// apartments' horizontal ribbons), solid white ends, a floating roof canopy on slim columns. The plan is the 24 x 15
// rectangle inside the bows (kits/interiors/sets/noahs-regret.js: the barracks item, or the mess hall's on its lot).
const NR_OFF={L:24,D:15,NS:5,PL:.3,SH:3.65,BOW:1.3};
function nrOfficeLens(o){const C=NR_OFF,mess=o.lot&&o.lot.use==='mess',item=mess?'nr-anc-office-lens-mess':'nr-anc-office-lens',inst=nrPlanOf(item);
 const top=C.PL+C.NS*C.SH,hx=C.L/2,hz=C.D/2,bow=x=>hz+C.BOW*Math.cos(PI*x/C.L);
 nrBuilt(o,'nr-anc-office-lens',item,C.L+3,C.D+2*C.BOW+2);
 /* a bow's floor strip: the bow curve from corner to corner, closed by the rectangle's edge */
 const bowPoly=sg=>{const out=[];for(let i=0;i<=16;i++){const x=-hx+i/16*C.L;out.push([x,sg*bow(x)]);}return out;};
 const all=[];for(let i=0;i<=16;i++){const x=-hx+i/16*C.L;all.push([x,-bow(x)]);}for(let i=16;i>=0;i--){const x=-hx+i/16*C.L;all.push([x,bow(x)]);}
 nrPlanSlab('white',all.map(p=>[p[0]*1.06,p[1]*1.12]),null,C.PL,C.PL,P('white'));
 nrDrawPlan(inst,{floor:['conc',hc(0xb8b2a6)],part:['plaster',hc(0xe6e0d4)]});
 nrPlanSlab('deck',all,null,C.PL+.02,.02,hc(0xc8beb0));
 /* the bows' floor strips between the planned rectangle and the glass, every storey above the ground */
 for(let k=1;k<=C.NS;k++){const y=C.PL+k*C.SH;for(const sg of [1,-1])nrPlanSlab('conc',bowPoly(sg),null,y,.25,P('conc'));}
 /* the bowed glass, storey by storey (a door on the front bow and the back one at the ground), the floors' white edges */
 for(let k=0;k<C.NS;k++){const y=C.PL+k*C.SH,h=C.SH-.25;
  for(const sg of [1,-1]){const nb=15,bw=C.L/nb;
   for(let i=0;i<nb;i++){const x0=-hx+i*bw,x1=x0+bw,xm=(x0+x1)/2;
    if(k===0&&((sg>0&&Math.abs(xm)<1.2)||(sg<0&&Math.abs(xm-6)<.9)))continue;
    if(nrDamaged(0,.04)){const z=sg*bow(xm),dz=-C.BOW*PI/C.L*Math.sin(PI*xm/C.L)*sg;nrBoard(xm,y,z+sg*.05,bw,h,Math.atan2(-dz,1),rng()<.5);continue;}
    psurf('glass',(u,v)=>{const x=lerp(x0,x1,u);return [x,y+v*h,sg*bow(x)];},2,1,hc(0x5a7a88),{flip:sg<0});}
   psurf('white',(u,v)=>{const x=lerp(-hx,hx,u);return [x,y+h+v*.25,sg*(bow(x)+.06)];},16,1,P('white'),{flip:sg<0});}}
 /* the fins: deep white blades on the bows, full height */
 for(const sg of [1,-1])for(let x=-hx+.8;x<hx;x+=1.6){const z=sg*bow(x),dz=-C.BOW*PI/C.L*Math.sin(PI*x/C.L)*sg,ry=Math.atan2(-dz,1);
  box('white',x,0,z+sg*.3*Math.cos(ry),.14,top+.4,.6,P('white'),ry);}
 /* the ends: solid white, a slot of glass up the middle */
 for(const sx of [1,-1]){box('white',sx*(hx+.15),0,0,.3,top+.4,C.D+.3,P('white'));box('glass',sx*(hx+.31),C.PL+.4,0,.04,top-C.PL-.8,1.2,hc(0x2a3a40));}
 /* the roof: a slab, a low glyph parapet, the canopy floating on eight slim columns, a meadow under it */
 nrPlanSlab('conc',all,null,top,.3,P('conc'));
 nrRibbon('glyph',all,top,top+.9,WHITE,.18);
 for(const x of [-9,-3,3,9])for(const z of [-5.5,5.5])cyl('white',x,top,z,.14,2.8,P('white'),10);
 nrPlanSlab('white',[[-hx-1.5,-hz-2.4],[hx+1.5,-hz-2.4],[hx+1.5,hz+2.4],[-hx-1.5,hz+2.4]],null,top+3.1,.32,P('white'));
 nrPlanSlab('turf',[[-hx+1.5,-hz+1.5],[hx-1.5,-hz+1.5],[hx-1.5,hz-1.5],[-hx+1.5,hz-1.5]],null,top+.42,.12,P('turf'));
 /* the entrance canopy over the front door */
 nrPlanSlab('white',[[-3.5,bow(0)-.2],[3.5,bow(0)-.2],[3.5,bow(0)+3.2],[-3.5,bow(0)+3.2]],null,C.PL+3.2,.25,P('white'));
 if(mess){/* the mess hall's sign: a board the pirates painted, over the door */box('timber',0,C.PL+3.5,bow(0)+3.1,5,1.0,.08,hc(0x6a3a22));}}
defBuilding({key:'nr-anc-office-lens',name:'Lens office (Ancient offices)',seed:5300,cls:'building',kind:'offices',
 tags:{types:['civic'],wealth:'middle',style:'Ancient streamline: bowed glass and fins, a floating roof'},
 w:NR_OFF.L+3.5,d:NR_OFF.D+2*NR_OFF.BOW+7,h:NR_OFF.PL+NR_OFF.NS*NR_OFF.SH+3.6,budget:300000,
 front:{x:0,z:NR_OFF.D/2,yaw:0},note:'five floors of Ancient offices, now barracks; one is the crew\'s mess hall (set noahs-regret)',
 build(o){nrOfficeLens(o);}});
