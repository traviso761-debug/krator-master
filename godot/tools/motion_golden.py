#!/usr/bin/env python3
"""Golden data for the baked fauna motion (godot/tests/motion/golden.json): the page's own ticks at pinned clocks.

    python3 godot/tools/motion_golden.py

Each case opens a built biome page (headless Chromium, tools/harness.py), exports its moving items over a box with
their baked tracks (BIO.export: BIO.motionBake, core/biome/42-core-export.js; biomes/GODOT.md, "Motion"), and keeps a
few animals, sliced out of the export record for record (so the file stays small and is still a krator-biome export
the importer reads whole). Then, for each clock in CLOCKS, it pins the page's clock there (BIO._pinT, BIO.WIND.t, the
ticks' t), calls every tick the kits registered, and records each kept instance's matrix (12 floats: basis x, y, z,
origin) and moving channels: the truth, from the page's own code. godot/tests/motion/motion_test.gd imports the
export with krator/biome_import.gd, replays it with krator/kmotion.gd and compares.

Cases: sedesert's pond tile (the spike's box): one buck (body, head on its neck, antlers, four legs; its loop's period)
and four swifts (a loop); swbay: four birds of a soaring flock (anim-phase, a loop); swbay-herd: three grazers and the
stalker (walkers on one loop, its period; anim-phase mode grazer); hyperjungle: three striders (walkers with grazing
stops, their periods; kind anim, the gait in aP1).
Needs: pip install playwright; the pages built (python3 build.py in biomes/sedesert, biomes/swbay, biomes/hyperjungle).
"""
import asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT)
sys.path.insert(0, os.path.join(REPO, "tools"))
import harness  # noqa: E402

OUT = os.path.join(GODOT, "tests", "motion", "golden.json")
# inside the loop's exact window (0 to 118 s: t0 -2, loop 120, fade 2), on and off the 10 Hz grid; then far past it,
# where only a declared period still matches the page (the deer), and inside the fade (-1 s), where the loop blends
CLOCKS = [0.0, 3.3, 47.25, 100.0, 103.0, 117.9, 250.7, 1000.05, -1.0]

CASES = [
    dict(name="sedesert", page="biomes/sedesert/dist/sedesert.html", box=[80, 490, 380, 790],
         pick="""(items)=>{const by=n=>items.find(r=>r.name===n);const D=by('deer'),A=by('deerantler'),H=by('deerhead');
          const M=unpack(H.matrices),AM=unpack(A.matrices);let d=-1,a=-1;   // the buck: his antlers share his head's matrix
          for(let j=0;j<A.count&&d<0;j++)for(let i=0;i<H.count;i++)if([12,13,14].every(q=>Math.abs(M[i*16+q]-AM[j*16+q])<1e-4)){d=i;a=j;break;}
          return {deer:[d],deerhead:[d],deerantler:[a],deerleg:[4*d,4*d+1,4*d+2,4*d+3],swift:[0,19,38,57]};}"""),
    dict(name="swbay", page="biomes/swbay/dist/swbay.html", box=None,
         pick="""(items)=>{const f=items.filter(r=>/^fauna:/.test(r.name)&&r.motion&&!r.motion.error)[0];const o={};o[f.name]=[0,1,2,3];return o;}"""),
    # swbay's herd (a walker's loop, period declared) and its stalker on the same loop: grazers, anim-phase mode grazer
    dict(name="swbay-herd", page="biomes/swbay/dist/swbay.html", box={"near": "fauna:herd", "half": 200},
         pick="""(items)=>({'fauna:herd':[0,1,2],'fauna:stalker':[0]})"""),
    # hyperjungle's striders: walkers with grazing stops, kind anim (mode walk), the gait in the aP1 channel
    dict(name="hyperjungle", page="biomes/hyperjungle/dist/hyperjungle.html", box={"near": "strider", "half": 150},
         pick="""(items)=>({strider:[0,1,2]})"""),
]

JS = r"""async ([box, pickSrc, clocks]) => {
const unpack=r=>{const s=atob(r.b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new ({Float32Array,Uint32Array,Uint16Array})[r.type](u.buffer);};
const pack=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return {type:a.constructor.name,n:a.length,b64:btoa(s)};};
let opt={textures:false,stage:false,ground:false};if(Array.isArray(box))opt.box=box;else{   // a box round the first instance of `near` (else the first moving flock's first bird)
 const nm=box&&box.near,h=box&&box.half||150,m=BIO.baked.find(m=>m.isInstancedMesh&&(nm?m.name==='biome:'+nm:/^biome:fauna:/.test(m.name))),A=m.instanceMatrix.array;opt.box=[A[12]-h,A[14]-h,A[12]+h,A[14]+h];}
const ex=BIO.export(opt),pick=eval(pickSrc)(ex.items);
// the export's moving items kept index by index; the record's per-instance arrays sliced to them
const slice=(arr,size,keep)=>{const a=unpack(arr),o=new a.constructor(keep.length*size);keep.forEach((i,j)=>{for(let q=0;q<size;q++)o[j*size+q]=a[i*size+q];});return pack(o);};
const items=[],mats=new Set(),keepOf={};
// the export keeps the instances whose origin lies in the box, in mesh order: its index j is the mesh's index glob[j]
const inBox=(x,z)=>x>=opt.box[0]&&z>=opt.box[1]&&x<opt.box[2]&&z<opt.box[3],globOf={};
for(const name in pick){const mesh=BIO.baked.find(m=>m.name==='biome:'+name),A=mesh.instanceMatrix.array,g=[];
 for(let i=0;i<mesh.count;i++)if(inBox(A[i*16+12],A[i*16+14]))g.push(i);globOf[name]=g;}
for(const name in pick){const r=ex.items.find(x=>x.name===name),keep=pick[name];keepOf[name]=keep;
 if(globOf[name].length!==r.count)throw new Error(name+': the box keeps '+globOf[name].length+', the export '+r.count);
 const o=Object.assign({},r,{count:keep.length,matrices:slice(r.matrices,16,keep),colours:r.colours?slice(r.colours,3,keep):null,extras:{}});
 for(const k in r.extras)o.extras[k]={size:r.extras[k].size,data:slice(r.extras[k].data,r.extras[k].size,keep)};
 delete o.records;delete o.recordIndex;
 const m=r.motion,st=unpack(m.start),fr=unpack(m.frames),D=unpack(m.data),S=m.stride;
 const start=new Uint32Array(keep.length),frames=new Uint32Array(keep.length);let tot=0;keep.forEach((i,j)=>{start[j]=tot;frames[j]=fr[i];tot+=fr[i];});
 const data=new Float32Array(tot*S);keep.forEach((i,j)=>data.set(D.subarray(st[i]*S,(st[i]+fr[i])*S),start[j]*S));
 o.motion=Object.assign({},m,{period:slice(m.period,1,keep),start:pack(start),frames:pack(frames),data:pack(data)});
 items.push(o);mats.add(r.material);}
const out=Object.assign({},ex,{items,buckets:[],materials:ex.materials.filter(m=>mats.has(m.id)),textures:[]});delete out.ground;
delete out.stage;delete out.tags;
// the truth: every kept instance at each clock, by the page's own ticks
const MC=[0,1,2,4,5,6,8,9,10,12,13,14],W=BIO.WIND,t00=W.t.value,truth={};
for(const T of clocks){BIO._pinT=T;W.t.value=T;BIO._ticks.forEach(f=>f(0,T));const row={};
 for(const name in keepOf){const mesh=BIO.baked.find(m=>m.name==='biome:'+name),A=mesh.instanceMatrix.array,r=items.find(x=>x.name===name);
  row[name]=keepOf[name].map(j=>{const i=globOf[name][j];const v=MC.map(c=>A[i*16+c]);for(const ch of r.motion.channels.slice(1)){const at=mesh.geometry.attributes[ch];for(let q=0;q<at.itemSize;q++)v.push(at.array[i*at.itemSize+q]);}return v;});}
 truth[String(T)]=row;}
BIO._pinT=t00;W.t.value=t00;BIO._ticks.forEach(f=>f(0,t00));BIO._pinT=null;
return {export:out,truth,keep:keepOf,box:opt.box};}"""


async def main():
    from playwright.async_api import async_playwright
    res = {"format": "krator-motion-golden", "clocks": CLOCKS, "cases": []}
    async with async_playwright() as p:
        b = await harness.launch_chromium(p)
        with harness.serve(REPO) as port:
            for c in CASES:
                pg, errs, ready = await harness.open_page(b, os.path.join(REPO, c["page"]), port, root=REPO)
                if not ready or errs:
                    raise SystemExit("%s: not ready (%s)" % (c["page"], errs[:3]))
                r = await pg.evaluate(JS, [c["box"], c["pick"], CLOCKS])
                r.update(name=c["name"], page=c["page"])
                res["cases"].append(r)
                print("%s: %s" % (c["name"], ", ".join("%s %d" % (k, len(v)) for k, v in r["keep"].items())), flush=True)
                await pg.close()
        await b.close()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(res, f, separators=(",", ":"))
    print("wrote %s (%d KB)" % (os.path.relpath(OUT, REPO).replace(os.sep, "/"), os.path.getsize(OUT) // 1024))


if __name__ == "__main__":
    asyncio.run(main())
