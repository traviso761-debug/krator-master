/* ============================== STAGE 5 M1 MATERIAL PACKING & SHADER MATH (core/materials/record) ==============================
   GRAPHICS-TERRAIN-PROPOSAL.md Section 6 (M1, M2, M3) and Section 9.2 (Gate 1, Gate 3).
   [G data]: pure contract, octahedral normal math, M2 mip-variance specular anti-aliasing, M3 planar POM ray march,
   Gate 3 handedness probe, and GLSL ES 3.00 / Godot twin snippets. No THREE, no DOM.

     KMAT_M1.octEncode(nx, ny, nz)               -> [u8_x, u8_y] (Cigolle et al. JCGT 2014 8-bit octahedral normal)
     KMAT_M1.octDecode(u8_x, u8_y)               -> [nx, ny, nz] unit float vector
     KMAT_M1.roughnessWithVariance(r, mip, vars) -> M2 roughness widened by normal mip variance
     KMAT_M1.pomStepPlanar(uv, viewTS, depth, heightAt) -> 8-step + 1 linear refinement planar POM (M3)
     KMAT_M1.handednessProbe(sampleNormal, sampleHeight, opt) -> Gate 3 emboss + parallax sign audit
     KMAT_M1.GLSL_COMMON                         -> shared WebGL2 GLSL functions (octDecode, mipVariance, planar POM)
*/
var KMAT_M1 = (function(){
  'use strict';

  function clamp(x, lo, hi){ return x < lo ? lo : (x > hi ? hi : x); }

  function octEncode(nx, ny, nz){
    var zc = nz > 0 ? nz : 0;
    var l1 = Math.abs(nx) + Math.abs(ny) + zc;
    if(l1 < 1e-8) return [128, 128];
    var px = nx / l1, py = ny / l1;
    var eu = px + py, ev = px - py;
    var u = clamp(Math.round((eu * 0.5 + 0.5) * 255), 0, 255);
    var v = clamp(Math.round((ev * 0.5 + 0.5) * 255), 0, 255);
    return [u, v];
  }

  function octDecode(u8x, u8y){
    var ex = (u8x / 255) * 2 - 1;
    var ey = (u8y / 255) * 2 - 1;
    var vx = (ex + ey) * 0.5;
    var vy = (ex - ey) * 0.5;
    var vz = Math.max(0, 1 - Math.abs(vx) - Math.abs(vy));
    var len = Math.hypot(vx, vy, vz);
    return len > 1e-8 ? [vx / len, vy / len, vz / len] : [0, 0, 1];
  }

  /* M2 Specular AA: adds Toksvig/Kaplanyan mip normal variance sigma^2 to base roughness^2: r' = sqrt(clamp(r^2 + min(2*var, 0.5), 0, 1)) */
  function roughnessWithVariance(baseRough, mipLevel, mipVars){
    var r = clamp(baseRough == null ? 0.5 : baseRough, 0.02, 1.0);
    if(!Array.isArray(mipVars) || mipVars.length === 0) return r;
    var m = clamp(mipLevel == null ? 0 : mipLevel, 0, mipVars.length - 1);
    var i0 = Math.floor(m), i1 = Math.min(mipVars.length - 1, i0 + 1), f = m - i0;
    var v = mipVars[i0] * (1 - f) + mipVars[i1] * f;
    return Math.sqrt(clamp(r * r + Math.min(v * 1.5, 0.45), 0.0004, 1.0));
  }

  /* M3 Planar POM: 8 linear steps + 1 secant refinement along tangent-space view ray (viewTS points from surface to eye, +Z up) */
  function pomStepPlanar(uv, viewTS, depthScale, heightAt){
    var d = depthScale == null ? 0.03 : depthScale;
    if(!(d > 0) || !viewTS || viewTS[2] <= 0.08) return [uv[0], uv[1]];
    var steps = 8;
    var stepLayer = 1 / steps;
    var vz = Math.max(viewTS[2], 0.18);
    var pMaxX = (viewTS[0] / vz) * d;
    var pMaxY = (viewTS[1] / vz) * d;
    var dUvX = pMaxX / steps;
    var dUvY = pMaxY / steps;
    var curX = uv[0], curY = uv[1];
    var curLayer = 0;
    var curDepth = 1 - heightAt(curX, curY);
    var prevX = curX, prevY = curY, prevDepth = curDepth, prevLayer = 0;
    for(var s = 0; s < steps; s++){
      if(curLayer >= curDepth) break;
      prevX = curX; prevY = curY; prevDepth = curDepth; prevLayer = curLayer;
      curX -= dUvX;
      curY -= dUvY;
      curLayer += stepLayer;
      curDepth = 1 - heightAt(curX, curY);
    }
    var after = curDepth - curLayer;
    var before = prevDepth - prevLayer;
    var denom = after - before;
    var w = Math.abs(denom) > 1e-6 ? clamp(after / denom, 0, 1) : 0;
    return [prevX * w + curX * (1 - w), prevY * w + curY * (1 - w)];
  }

  /* Section 9.2 Gate 3 Handedness Probe */
  function handednessProbe(sampleNormal, sampleHeight){
    var nRight = sampleNormal(0.68, 0.50);
    var nLeft  = sampleNormal(0.32, 0.50);
    var nTop   = sampleNormal(0.50, 0.68);
    var nBot   = sampleNormal(0.50, 0.32);
    var xOk = nRight[0] > 0.08 && nLeft[0] < -0.08;
    var yOk = nTop[1] > 0.08 && nBot[1] < -0.08;
    var uv0 = [0.50, 0.50];
    var uvShift = pomStepPlanar(uv0, [0.7, 0.0, 0.714], 0.04, sampleHeight);
    var pomOk = uvShift[0] < uv0[0] - 0.001;
    return { ok: !!(xOk && yOk && pomOk), xOk: xOk, yOk: yOk, pomOk: pomOk, nRight: nRight, nTop: nTop, uvShift: uvShift };
  }

  var GLSL_COMMON = [
    'vec3 km1OctDecode(vec2 enc01){',
    '  vec2 e = enc01 * 2.0 - 1.0;',
    '  vec2 p = vec2(e.x + e.y, e.x - e.y) * 0.5;',
    '  return normalize(vec3(p.x, p.y, max(0.0, 1.0 - abs(p.x) - abs(p.y))));',
    '}',
    'float km1RoughAA(float baseR, vec2 dxUv, vec2 dyUv, float texSz, vec4 varLo, vec4 varHi){',
    '  float px = max(dot(dxUv, dxUv), dot(dyUv, dyUv)) * (texSz * texSz);',
    '  float mip = clamp(0.5 * log2(max(px, 1.0)), 0.0, 7.0);',
    '  int kmI0 = int(floor(mip));',
    '  float f = mip - float(kmI0);',
    '  float kmV0 = kmI0 < 4 ? varLo[kmI0] : varHi[kmI0 - 4];',
    '  int kmI1 = min(kmI0 + 1, 7);',
    '  float kmV1 = kmI1 < 4 ? varLo[kmI1] : varHi[kmI1 - 4];',
    '  float vr = mix(kmV0, kmV1, f);',
    '  return sqrt(clamp(baseR * baseR + min(vr * 1.5, 0.45), 0.0004, 1.0));',
    '}'
  ].join('\n');

  return {
    version: 2,
    octEncode: octEncode,
    octDecode: octDecode,
    roughnessWithVariance: roughnessWithVariance,
    pomStepPlanar: pomStepPlanar,
    handednessProbe: handednessProbe,
    GLSL_COMMON: GLSL_COMMON
  };
})();
if(typeof window !== 'undefined') window.KMAT_M1 = KMAT_M1;
if(typeof module !== 'undefined' && module.exports) module.exports = KMAT_M1;
