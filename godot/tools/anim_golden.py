#!/usr/bin/env python3
"""Golden vectors for the animated fauna (godot/tests/anim/golden.json): BIO.animHook's own GLSL, run on a GPU.

    python3 godot/tools/anim_golden.py

core/biome/10-core-head.js and 35-core-anim.js load into a blank page (headless Chromium, software GL); for each case
BIO.animHook(o) writes its vertex code exactly as a page compiles it, and a WebGL2 program built from that text returns,
by transform feedback, the pose offset P, the turn M (columns) and the flapped or swung vertex T. So the golden values
are the page's shader, not a second reading of it: godot/krator/kanim.gd (the twin of shaders/lib/anim.gdshaderinc)
is tested against them (godot/tests/anim/anim_test.gd). Inputs are stored as float32, as the GPU read them.

Needs: pip install playwright.
"""
import asyncio, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT)
OUT = os.path.join(GODOT, "tests", "anim", "golden.json")
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]

RUN = r"""() => {
const OPTS=[{mode:'orbit',flap:{rate:1.1,amp:0.09,root:0.14}},{mode:'flit',flap:{rate:11,amp:0.32,root:0.06}},
 {mode:'walk',legs:{top:0.62,amp:0.16}},{mode:'walk',flap:{rate:7,amp:0.6,root:0.02}},{mode:'orbit'},{mode:'flit'}];
const f=Math.fround,r9=x=>+x.toPrecision(9);let s=12345;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
const cases=[];
for(let oi=0;oi<OPTS.length;oi++)for(let k=0;k<12;k++){const rad=[0.5,3,12,40][k%4]*(0.7+r()*0.6);
 const p1=[(r()<0.3?-1:1)*(0.05+r()*1.5),r()*6.28,r()*4,0.1+r()*1.2];
 const pos=[(r()-0.5)*2,(r()-0.2)*1.2,(r()-0.5)*2];if(k%3===0)pos[2]=0.0;
 cases.push({o:oi,rad:f(rad),p1:p1.map(f),t:f(r()*500),pos:pos.map(f)});}
if(!BIO.WIND)BIO.WIND={t:{value:0}};   // the clock's uniform object; the GLSL reads uWindT, set per case below
function hookSrc(o){const sh={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>\n#include <project_vertex>\n#include <defaultnormal_vertex>',fragmentShader:''};BIO.animHook(o)(sh);return sh.vertexShader;}
const gl=document.createElement('canvas').getContext('webgl2');if(!gl)throw new Error('no WebGL2');
const mk=(t,x)=>{const h=gl.createShader(t);gl.shaderSource(h,x);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(h)+'\n'+x);return h;};
const out=[];
for(let oi=0;oi<OPTS.length;oi++){
 const src=hookSrc(OPTS[oi]);
 const common=src.split('#include <common>\n')[1].split('\nvec3 transformed = vec3( position );')[0];
 const begin=src.split('vec3 transformed = vec3( position );')[1].split('mat3 _M; vec3 _P; _anim(_M,_P);')[0];
 const vs='#version 300 es\n#define attribute in\nin vec3 position;\n'+common+'\nout vec3 oP; out vec3 oM0; out vec3 oM1; out vec3 oM2; out vec3 oT;\n'+
  'void main(){ vec3 transformed = vec3(position);\n'+begin+'\n mat3 M; vec3 P; _anim(M,P); oP=P; oM0=M[0]; oM1=M[1]; oM2=M[2]; oT=transformed; gl_Position=vec4(0.0);}';
 const pr=gl.createProgram();gl.attachShader(pr,mk(gl.VERTEX_SHADER,vs));
 gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float; out vec4 c; void main(){c=vec4(1.0);}'));
 gl.transformFeedbackVaryings(pr,['oP','oM0','oM1','oM2','oT'],gl.INTERLEAVED_ATTRIBS);gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));gl.useProgram(pr);
 for(const c of cases.filter(c=>c.o===oi)){
  const buf=(name,size,data)=>{const loc=gl.getAttribLocation(pr,name);if(loc<0)return;const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);};
  buf('position',3,c.pos);buf('aP0',4,[0,0,0,c.rad]);buf('aP1',4,c.p1);gl.uniform1f(gl.getUniformLocation(pr,'uWindT'),c.t);
  const tb=gl.createBuffer();gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER,tb);gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER,60,gl.STATIC_READ);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,tb);gl.enable(gl.RASTERIZER_DISCARD);gl.beginTransformFeedback(gl.POINTS);gl.drawArrays(gl.POINTS,0,1);
  gl.endTransformFeedback();gl.disable(gl.RASTERIZER_DISCARD);const res=new Float32Array(15);gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER,0,res);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,null);
  out.push({opts:OPTS[oi],rad:r9(c.rad),p1:c.p1.map(r9),t:r9(c.t),pos:c.pos.map(r9),P:[...res.slice(0,3)].map(r9),M:[...res.slice(3,12)].map(r9),T:[...res.slice(12,15)].map(r9)});}}
return out;}"""


async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=GL_ARGS)
        page = await browser.new_page()
        await page.set_content("<!doctype html><html><body></body></html>")
        for f in ("10-core-head.js", "35-core-anim.js"):
            await page.add_script_tag(path=os.path.join(REPO, "core", "biome", f))
        cases = await page.evaluate(RUN)
        await browser.close()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        json.dump({"note": "BIO.animHook (core/biome/35-core-anim.js) run as GLSL (WebGL2 transform feedback, "
                           "godot/tools/anim_golden.py): per case the pose offset P, the turn M (columns), the flapped or "
                           "swung vertex T. Inputs as the GPU read them (float32).", "cases": cases}, fh, indent=0)
    print("wrote %s: %d cases" % (os.path.relpath(OUT, REPO), len(cases)))


if __name__ == "__main__":
    asyncio.run(main())
