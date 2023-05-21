precision highp float;

varying vec2 pass_uv;

uniform sampler2D tex;

void main() {
	gl_FragColor = texture2D(tex, pass_uv);
}