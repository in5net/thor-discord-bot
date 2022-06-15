precision highp float;

#define COORDS_LENGTH 1
#define ITERATIONS 1

uniform vec2 resolution;
uniform int size;
uniform ivec2 coords[COORDS_LENGTH];
uniform sampler2D tex;

bool fillUV(vec2 uv) {
	for (int i = 0; i < COORDS_LENGTH; i++) {
		ivec2 coord = coords[i];
		if (ivec2(uv) == coord) return true;
	}
	return false;
}

vec4 fractal(vec2 uv) {
	for (int i = 0; i < ITERATIONS; i++) {
		if (fillUV(uv)) return texture2D(tex, uv);
		uv = fract(uv) * float(size);
	}
	discard;
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution * float(size);
	gl_FragColor = fractal(uv);
}