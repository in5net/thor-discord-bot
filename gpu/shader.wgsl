struct VertexOutput {
    [[builtin(position)]] position: vec4<f32>;
    [[location(0)]] uv: vec2<f32>;
};

[[stage(vertex)]]
fn vs_main([[location(0)]] position: vec2<f32>, [[location(1)]] uv: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(position, 0.0, 1.0);
    out.uv = uv;
    return out;
}

[[group(0), binding(0)]] var texture: texture_2d<f32>;
[[group(0), binding(1)]] var f_sampler: sampler;

fn fillUV(uv: vec2<f32>) -> bool {
	let f = floor(uv);
	if ((f.x == 0.0 && f.y == 0.0) || (f.x == 1.0 && f.y == 1.0)) {
		return true;
	}
	return false;
}

fn fractal(uv: vec2<f32>) -> vec4<f32> {
	var scaledUV = uv;
	var i: i32 = 0;
	loop {
		if (i == ITERATIONS) {
			break;
		}
		if (fillUV(scaledUV)) {
			// return textureSample(texture, f_sampler, scaledUV);
			return vec4<f32>(1.0);
		}
		scaledUV = fract(scaledUV) * SIZE;

		i = i + 1;
	}
	return vec4<f32>(vec3<f32>(0.0), 1.0);
}

[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
	return fractal(in.uv * SIZE);
}