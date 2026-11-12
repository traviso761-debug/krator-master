// ================================================================= HOST — the page's parts (every station)
// [web] THE PAGE LOADS IN PARTS (the owner, 2026-11-11: station 0 and the Yards "still seem to get stuck on 'building the valley'"). Before the
// build's own stages (88) the page ran 47 (the land) and everything after it as one task: its colour paint is the first reader of the ground's
// lattice (46z, AV.lattice) and filled all of it, 12 s on software GL and nearly 40 s in a slow browser, with nothing on the screen. build.py now
// splits the page before 47: the fragments from 47 to 88 are a text block (data-av-part) that this runs after the first script ends
// (`AV_PARTS.run()`, which build.py writes after the blocks). Before a part runs, its prep, if any, runs in slices with a note and a paint between
// them: for 47, the ground's lattice filled tile by tile with the share done. A tile's values are fn's at its nodes whatever the order of filling, so
// the page is the same. Classic scripts share the page's globals, so a part runs as if it had followed in place.
const AV_PARTS={prep:{},t0:performance.now(),   /* the seconds the notes give count from here, the page's first script (not the navigation: a tab still busy with the page before may hold that for minutes) */
 note(t){let el=document.getElementById('av-loading');if(!el){el=document.createElement('div');el.id='av-loading';el.style.cssText='position:fixed;left:50%;top:46%;transform:translate(-50%,-50%);z-index:50;background:rgba(24,21,15,.88);color:#f3ecd8;font:13px Georgia,serif;padding:10px 16px;border-radius:8px;pointer-events:none';document.body.appendChild(el);}
  el.textContent='Building the valley: '+t+' ('+Math.round((performance.now()-AV_PARTS.t0)/1000)+' s so far)…';},
 /* a turn that includes a paint: a frame, then a task after it. A hidden tab takes no turn at all: it draws no frames, and the browser holds its
    timers to a second each (a minute each after five minutes hidden), so the slices would take an age, and no one is there to read the note */
 turn(){if(document.hidden)return Promise.resolve();return new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;r();}};requestAnimationFrame(()=>setTimeout(go,0));setTimeout(go,150);});},
 /* fill a lattice's every tile in slices of about a quarter second, a note with the share done between them */
 async fill(L,label){const n=L.nt*L.nt;let t=performance.now();for(let k=0;k<n;k++){L.fill(k);if(performance.now()-t>250){AV_PARTS.note(label+', '+Math.floor(100*k/n)+'%');await AV_PARTS.turn();t=performance.now();}}},
 run(){const P=[...document.querySelectorAll('script[type="text/plain"][data-av-part]')];
  (async()=>{for(const el of P){const k=el.getAttribute('data-av-part');AV_PARTS.note('laying out the land');await AV_PARTS.turn();
    if(AV_PARTS.prep[k])await AV_PARTS.prep[k]();
    const s=document.createElement('script');s.textContent=el.textContent;el.remove();document.body.appendChild(s);}})().catch(e=>reportErr('parts: '+(e&&e.stack||e)));}};
/* 47's prep: the whole ground's lattice (46z, STAGE.groundLattice), which the land's paint and then the kits read */
AV_PARTS.prep['47-host-land.js']=()=>STAGE.groundLattice?AV_PARTS.fill(STAGE.groundLattice,'laying out the ground'):null;
