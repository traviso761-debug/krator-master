// Colour space across Godot's renderers, for shaders that mix a texture with linear data (vertex and instance colours,
// linear colour uniforms). Measured in Godot 4.5 (godot/README.md, "Colour space in the Compatibility renderer"):
// Forward+ and Mobile decode a source_color texture when it is sampled and take ALBEDO as linear; Compatibility reads
// the texture raw and decodes ALBEDO itself (sRGB to linear) before lighting. So a shader decodes its samples with
// k_tex, does its maths in linear, and writes ALBEDO through k_albedo: correct in every renderer, a no-op in Forward+.
vec3 k_s2l(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
vec3 k_l2s(vec3 c) { c = max(c, vec3(0.0)); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
#if CURRENT_RENDERER == RENDERER_COMPATIBILITY
vec3 k_tex(vec3 s) { return k_s2l(s); }
vec3 k_albedo(vec3 c) { return k_l2s(c); }
#else
vec3 k_tex(vec3 s) { return s; }
vec3 k_albedo(vec3 c) { return c; }
#endif
