"use strict"

let wave;

let water_level_rel_pos = 0.7;
let shallowest_land_rel_pos = 0.6;
let deepest_land_rel_pos = 0.1;

let max_depth = 1;
let min_depth = 0.1;
let depth = min_depth;

function depth_changed(t) {
	depth = lerp(min_depth, max_depth, t);
}

function get_velocity(x) {
	return 1 * Math.sqrt(depth);
}

function initialize() {
	aspect_ratio = 2;
	simulation_dt = 0.001;
	
	wave = new Wave(300);
	wave.damping = 0;
	wave.pulse_cutoff = Math.PI * 2;
	wave.oscilator_frequency = 1;
	wave.oscilator_amplitude = 1;
	wave.input_type = INPUT_PULSE;
	wave.end_type = END_INFINITE;
	wave.get_velocity = get_velocity;
}


function simulate() {
	wave.simulate();
}

function render() {
	
	gc.save();
	gc.translate(0, canvas.height);
	gc.scale(1, -1);
	
	gc.fillStyle = "white";
	gc.fillRect(0, 0, canvas.width, canvas.height);
	
	gc.fillStyle = "#49bad1";
	gc.strokeStyle = "#49bad1";
	
	let point_radius = (canvas.width / wave.N) * 0.5;
	
	let real_water_level = canvas.height * (water_level_rel_pos);
	let real_water_max_amplitude = canvas.height * (water_level_rel_pos - shallowest_land_rel_pos);
	
	gc.beginPath();
	for (let i = 0; i < wave.N; i += 1) {
		let x = (i + 0.5) / wave.N * canvas.width;
		let y = real_water_level + (wave.y[i] + 1) * real_water_max_amplitude;
		
		if (i == 0) gc.moveTo(x, y);
		else gc.lineTo(x, y);
	}
	gc.lineTo(canvas.width, 0);
	gc.lineTo(0, 0);
	gc.closePath();
	gc.fill();
	
	
	let depth_y = map(depth, max_depth, min_depth, deepest_land_rel_pos, shallowest_land_rel_pos) * canvas.height;
	
	gc.fillStyle = "#e6bd5e";
	gc.beginPath();
	gc.moveTo(0, 0);
	gc.lineTo(0, depth_y);
	gc.lineTo(canvas.width, depth_y);
	gc.lineTo(canvas.width, 0);
	gc.closePath();
	gc.fill();
	
	gc.restore();
}
