// ================================================================= the Pylon culture pack for the Post-Apoc set (PLAN.md section 4)
// Read INTO the KratorPostApoc closure by settlements/iziz/build.py (kit.json "postApoc": its "extra"; apoc_bundle.bundle(defs,
// extra)), after core/sockets' cultures, so no shared file changes: the mark (the Monolith under the Salvagers' gantry crane)
// joins the closure's SYMBOLS, and the pack its CULT.packs as 'pylon'. White and Iziz orange, the gunmetal of the yards; striped
// awnings in orange and white; signs white on orange. KratorPostApoc.build(sites, {culture: 'pylon'}) dresses the set in it.
SYMBOLS.monolith=(g,cx,cy,R,c1,c2)=>{
 // the Monolith: a tall slab, its round-headed arch and the great oculus cut through it
 const w=R*.62,h=R*1.7,x0=cx-w/2,y0=cy-h*.42;g.fillStyle=c1;g.fillRect(x0,y0,w,h);
 g.fillStyle=c2;g.beginPath();g.arc(cx-w*.12,y0+h*.78,w*.2,Math.PI,0);g.fill();g.fillRect(cx-w*.32,y0+h*.78,w*.4,h*.22);
 g.beginPath();g.arc(cx+w*.08,y0+h*.3,w*.17,0,SYM_TAU);g.fill();
 // the gantry crane over it: two legs and a beam, the hook hanging on the slab's flank
 g.fillStyle=c1;const gy=y0-R*.12;g.fillRect(cx-R*.95,gy,R*1.9,R*.1);g.fillRect(cx-R*.95,gy,R*.09,h*.75);g.fillRect(cx+R*.86,gy,R*.09,h*.75);
 g.fillRect(cx+R*.5,gy+R*.1,R*.03,R*.42);g.fillRect(cx+R*.44,gy+R*.5,R*.15,R*.06);};
mkCulture({key:'pylon',name:'Pylon',field:'#e07a2a',edge:'#eeebe5',band:'#4a5058',disc:'#eeebe5',ink:'#4a5058',ink2:'#eeebe5',sym:'monolith',pole:0xe3d9c8,
 awn:{mode:'stripes',cols:['#e07a2a','#eeebe5','#e07a2a','#eeebe5','#e3a02e','#eeebe5'],n:6},
 paint:[0xeeebe5,0xe07a2a,0xe3d9c8,0x4a5058,0xe3a02e,0xb8652a],signBg:'#e07a2a',signFg:'#eeebe5',signFrame:0x4a5058});
