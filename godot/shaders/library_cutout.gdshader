// A material-library surface with a cut-out: both faces, an alpha scissor with antialiased edges
// (library_body.gdshaderinc: the three variants and who picks).
shader_type spatial;
render_mode cull_disabled;

#define K_LIB_CUTOUT
#include "res://shaders/library_body.gdshaderinc"
