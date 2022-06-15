precision highp float;

uniform float offset;
uniform float scale;

#pragma glslify: noise = require('glsl-noise/classic/3d')

void main() {
    vec3 coord = (vec3(gl_FragCoord.xy, 0.0) + offset) / scale;
    float value = noise(coord) * 0.5 + 0.5;
    gl_FragColor = vec4(vec3(value), 1.0);
}