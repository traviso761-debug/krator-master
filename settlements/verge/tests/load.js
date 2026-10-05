// Load Verge's [G data] fragments into a bare node context (no THREE, no DOM): the Godot-portable half of the build.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..','..');
module.exports=function load(extra){
 const ctx={console,Math,Date:undefined};ctx.globalThis=ctx;vm.createContext(ctx);
 const files=[path.join(ROOT,'core/rand/08-core-rand.js'),path.join(ROOT,'core/walk/20-core-walk.js'),path.join(ROOT,'core/sched/20-core-sched.js'),
  path.join(ROOT,'core/clock/20-core-clock.js')].concat((extra||[]).map(f=>path.join(__dirname,'..','src',f)));
 let src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n;\n');
 vm.runInContext(src+'\n;globalThis.__=(n)=>eval(n);',ctx,{filename:'verge-data.js'});
 return ctx;};
