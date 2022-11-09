"use strict"

let wave;

let min_tension = 0.05, max_tension = 0.25, tension = min_tension;
let min_density = 0.2, max_density = 1, density = min_density;

function get_velocity(x) {
	return Math.sqrt(tension / density);
}

function tension_changed(t) {
	tension = lerp(min_tension, max_tension, t);
}

function density_changed(t) {
	density = lerp(min_density, max_density, t);
}

function initialize() {
	simulation_dt = 0.001;
	aspect_ratio = 2;
	
	wave = new Wave(500);
	wave.damping = 0.2;
	wave.oscilator_amplitude = 0.5;
	wave.oscilator_frequency = 1;
	
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
	gc.strokeStyle = "white";
	
	let wave_size = canvas.width * 0.8;
	let arrow_size = canvas.width - wave_size;
	
	let point_radius = (wave_size / wave.N) * 0.5;
	
	for (let i = 0; i < wave.N; i += 1) {
		let x = arrow_size + (i + 0.5) * point_radius * 2;
		let y = (wave.y[i] + 1) * canvas.height * 0.5;
		
		let radius = lerp(1, 4, map(density, min_density, max_density, 0, 1)) * point_radius * 2;
		
		gc.beginPath();
		gc.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
		gc.closePath();
		gc.fill();
		
	}
	
	{
		let t = map(tension, min_tension, max_tension, 0, 1);
		let w = arrow_size * lerp(0.5, 1, t);
		
		let y = (wave.y[0] + 1) * 0.5 * canvas.height;
		let x0 = arrow_size;
		let x1 = arrow_size - w;
		
		gc.fillStyle = "white";
		gc.beginPath();
		gc.ellipse(x0, y, 10, 10, 0, 0, Math.PI * 2);
		gc.closePath();
		gc.fill();
		
		gc.lineWidth = 2;
		gc.fillStyle = "white";
		gc.strokeStyle = "white";
		draw_arrow(gc, x0, y, x1, y, w * 0.1);
	}
	gc.restore();
	
}