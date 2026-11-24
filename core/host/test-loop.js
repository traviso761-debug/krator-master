// node core/host/test-loop.js: the frame loop's WebGL context-loss handling (91-host-loop.js; S3-76a, D26). No browser: a fake
// canvas (an EventTarget), a fake renderer that counts its draws, a queued requestAnimationFrame and a stub camera. Three r128
// itself prevents the default, skips render() and rebuilds its programs and textures on restore; the host must pause its loop
// while the context is gone and resume it once it is back. The negative runs the same scenario on the loop with its listeners
// switched off (as it was before the fix: a loop that never hears the loss).
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const T=require('../../tools/ktest.js')(__filename);
const CLOCK=fs.readFileSync(path.join(__dirname,'..','clock','20-core-clock.js'),'utf8');
const LOOP=fs.readFileSync(path.join(__dirname,'91-host-loop.js'),'utf8');

/* one page: load the clock and the loop in a fresh context, take, run frames, lose the context, run frames, restore it */
function scenario(loopSrc){
 const q=new Map();let id=0,draws=0,ticks=0,restores=0;const warns=[];
 const box={EventTarget,Event,performance,console:{log(){},warn(m){warns.push(m);},error(){}},location:{search:'',hash:''},
  requestAnimationFrame(f){q.set(++id,f);return id;},cancelAnimationFrame(i){q.delete(i);}};
 box.globalThis=box;vm.createContext(box);
 vm.runInContext(CLOCK,box);
 vm.runInContext('globalThis.KHOST={camera(){return {setView(){},move(){},apply(){},ctl:{}};}};',box);
 vm.runInContext(loopSrc,box);
 const K=box.KHOST,canvas=new EventTarget();
 K.on(()=>{ticks++;});K.on(()=>{restores++;},'restore');
 const pump=n=>{for(let k=0;k<n;k++){const e=q.entries().next();if(e.done)return;q.delete(e.value[0]);e.value[1]();}};
 K.take({scene:{},camera:{},renderer:{domElement:canvas,render(){draws++;}}});
 pump(3);
 const s={before:draws,ticksBefore:ticks};
 const lostEv=new Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(lostEv);
 s.prevented=lostEv.defaultPrevented;s.lostFlag=K.host.contextLost;
 pump(5);s.whileLost=draws-s.before;s.ticksWhileLost=ticks-s.ticksBefore;s.queuedWhileLost=q.size;
 canvas.dispatchEvent(new Event('webglcontextrestored'));
 s.restores=restores;s.lostAfter=K.host.contextLost;
 const d0=draws;pump(4);s.afterRestore=draws-d0;s.queuedAfter=q.size;
 canvas.dispatchEvent(new Event('webglcontextrestored'));s.restoresTwice=restores;
 s.warns=warns.length;s.counts=[K.host.glLost,K.host.glRestored];
 return s;}

const off=LOOP.split("'webglcontextlost'").join("'x-never-lost'").split("'webglcontextrestored'").join("'x-never-restored'");
const s=scenario(LOOP);
T.ok('the loop draws a frame per animation frame before any loss',s.before===4,'draws '+s.before);
T.ok('the loss is default-prevented (so the browser may restore the context)',s.prevented===true);
T.ok('while the context is gone the loop is paused: no draw, no tick, nothing queued',s.whileLost===0&&s.ticksWhileLost===0&&s.queuedWhileLost===0,
 JSON.stringify(s));
T.ok('H.contextLost is true while it is gone and false after',s.lostFlag===true&&s.lostAfter===false);
T.ok('on restore the restore subscribers run once and the loop resumes, a draw a frame',s.restores===1&&s.afterRestore===4&&s.queuedAfter===1,JSON.stringify(s));
T.ok('a second restored event with no loss before it changes nothing',s.restoresTwice===1);
T.ok('the host counts the loss and the restore and says so once',s.counts.join()==='1,1'&&s.warns===1,JSON.stringify(s));
T.neg('a loop that never hears the loss keeps drawing and ticking into the dead context',
 r=>r.whileLost===0&&r.ticksWhileLost===0&&r.restores===1,scenario(off),s);
T.done();
