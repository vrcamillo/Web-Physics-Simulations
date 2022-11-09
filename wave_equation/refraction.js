"use strict"

let wave;

let min_density = 0.2, max_density = 1;
let density0 = min_density, density1 = min_density;

function get_velocity(x) {
	let tension = 0.05;
	return Math.sqrt(tension / get_density(x));
}

function get_density(x) {
	return (x < 0.5) ? density0 : density1;
}

function density0_changed(t) {
	density0 = lerp(min_density, max_density, t);
}

function density1_changed(t) {
	density1 = lerp(min_density, max_density, t);
}

function initialize() {
	aspect_ratio = 2;
	simulation_dt = 0.001;
	
	wave = new Wave(400);
	wave.damping = 0.3;
	wave.oscilator_frequency = 1;
	wave.oscilator_amplitude = 0.7;
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
	
	gc.fillStyle = "black";
	gc.fillRect(0, 0, canvas.width, canvas.height);
	
	gc.fillStyle = "#b59a51";
	
	let point_radius = (canvas.width / wave.N) * 0.5;
	
	for (let i = 0; i < wave.N; i += 1) {
		let x = (i + 0.5) * point_radius * 2;
		let y = (wave.y[i] + 1) * canvas.height * 0.5;
		
		let density = get_density(i / wave.N);
		let t = map(density, min_density, max_density, 0, 1);
		let radius = 2 * lerp(1, 4, t) * point_radius;
		
		gc.beginPath();
		gc.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
		gc.closePath();
		gc.fill();
	}
	
	gc.restore();
}