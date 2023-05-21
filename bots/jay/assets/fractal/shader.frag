precision highp float;

#define COORDS_LENGTH 1

uniform int iterations;
uniform float size;
uniform ivec2 coords[COORDS_LENGTH];
uniform sampler2D tex;

varying vec2 texCoord;

bool fillUV(vec2 uv) {
	for (int i = 0; i < COORDS_LENGTH; i++) {
		ivec2 coord = coords[i];
		if (ivec2(uv) == coord) return true;
	}
	return false;
}

vec4 fractal(vec2 uv) {
	for (int i = 0; i < iterations; i++) {
		if (fillUV(uv)) return texture2D(tex, uv, -float(i) * (size / 2.0));
		uv = fract(uv) * size;
	}
	discard;
}

void main() {
	vec2 uv = texCoord * size;
	gl_FragColor = fractal(uv);
}