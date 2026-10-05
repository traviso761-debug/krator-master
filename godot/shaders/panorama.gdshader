// The stage's sky panorama (krator/stage.gd), read at full resolution: PanoramaSkyMaterial sampled a low mip level
// under the Compatibility renderer, which blurred and paled the page's sky. The PNG is already what the page shows.
shader_type sky;

uniform sampler2D pano : source_color, filter_linear, repeat_enable;
uniform float energy = 1.0;

void sky() {
	COLOR = textureLod(pano, SKY_COORDS, 0.0).rgb * energy;
}
