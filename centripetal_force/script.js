"use strict"

// Our global variables, used for rendering the simulation.
let canvas;
let graphics;

// The quantities that can be tweaked by the user in this simulation, as well as some information about them.
let quantities = {
	force:  {variable: "F", unit: "N",   value: 0},
	speed:  {variable: "v", unit: "m/s", value: 1}, 
	radius: {variable: "r", unit: "m",   value: 1},
	mass:   {variable: "m", unit: "kg",  value: 1},
};

// This is the structure that will hold the particle state for each frame of the simulation.
function ParticleState() {
	// Position.
	this.x = 0;
	this.y = 0;
	
	// Velocity.
	this.vx = 0;
	this.vy = 0;
	
	this.mass = 0;
	
	// The magnitude of the centripetal force over the particle, at a given time.
	this.force_magnitude = 0;
}

// Simulation variables.
let simulation_time = 0;
let trajectory = []; // Array of ParticleStates
let index_within_trajectory = 0;

function initialize() {
	for (let [quantity_name, quantity_info] of Object.entries(quantities)) {
		// Make it so that every time a slider is changed, the labels and the 'quantities' object are updated as well..
		let slider = document.getElementById(quantity_name + "-slider");
		slider.addEventListener("input", e => update_value(quantity_name)); 
		
		// Update the quantities during the first frame too.
		update_value(quantity_name);
	}
	
	canvas = document.getElementById("simulation-canvas");
	graphics = canvas.getContext("2d");

	update_canvas_size();
	
	do_frame();
}
window.addEventListener("load", initialize);

function recalculate_trajectory() {
	
	let particle = new ParticleState();
	{
		// Set up the particle's initial state.
		particle.x = -quantities.radius.value;
		particle.y = 0;
		
		particle.vx = 0;
		particle.vy = quantities.speed.value;
		
		particle.mass = quantities.mass.value;
		
		particle.force = quantities.force.value;
	}
	
	// Clear current trajectory.
	trajectory.length = 0;
	
	
	// Simulate the new trajectory.
	let completed_one_turn = false;
	for (let t = 0.0; t < 1; t += 0.001 /* #hardcoded */) {
		
		trajectory.push(Object.assign({}, particle)); // Copy the current state into the 'trajectory' array.
		
		completed_one_turn = completed_one_turn || (particle.vy < 0 && particle.vx < 0);
		if (completed_one_turn) {
			if (particle.vx > 0 && particle.vy > 0) break; // If the particle has completed one turn, stop the simulation.
		}
		
		if (Math.abs(particle.y) > 10 || Math.abs(particle.x) > 10) break; // If the particle has gone off the screen, stop the simulation.
		
		simulate_particle(particle, 0.05 /*#hardcoded*/);
	}
	
	// Reset our current animation index.
	index_within_trajectory = 0;
}

function do_frame() {
	{
		// Draw the background
		graphics.fillStyle = "black";
		graphics.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	graphics.save();
	graphics.translate(0, canvas.height);
	graphics.scale(1, -1);
	graphics.scale(canvas.height, canvas.height);
	graphics.translate(0.5, 0.5);
	graphics.scale(1/10, 1/10);
	
	{
		// Draw the x and y axis
		graphics.strokeStyle = "#222222";
		graphics.lineWidth = 0.03;
		// graphics.setLineDash([0.1, 0.1]);
		graphics.beginPath();
		graphics.moveTo(-5, 0)
		graphics.lineTo(+5, 0)
		graphics.moveTo(0, -5)
		graphics.lineTo(0, +5)
		
		graphics.stroke();
	}
	
	let initial_state = trajectory[0];
	{
		// Always draw the initial state.
		console.assert(trajectory.length != 0);
		draw_particle(initial_state);
	}
	
	{
		// Draw the trajectory 
		graphics.strokeStyle = "gray";
		graphics.lineWidth = 0.05;
		graphics.setLineDash([0.1, 0.1]);
		graphics.beginPath();
		graphics.moveTo(initial_state.x, initial_state.y);
		for (let state of trajectory) {
			graphics.lineTo(state.x, state.y);
		}
		graphics.stroke();
		graphics.setLineDash([]);
	}
	
	if (!mouse_down) { // Draw the simulation if the user is not using the mouse.
		
		// Draw an animation of the particle trajectory.
		if (index_within_trajectory < trajectory.length) {
			let alpha = 0.75 * Math.pow((1 - index_within_trajectory / trajectory.length), 1.5); // Fade the particles as they move.
			let current_state = trajectory[index_within_trajectory];
			draw_particle(current_state, alpha);
			index_within_trajectory += 1; // Advance the cursor within the trajectory array.
		} else {
			simulation_time += 1/60.0; // #hardcoded: Assuming 60 FPS here.
			if (simulation_time > 0.5) { // #hardcoded
				// Restart the animation
				simulation_time = 0;
				index_within_trajectory = 0; 
			}
		}
	}
	
	graphics.restore();
	
	// Keep calling do_frame() forever.
	requestAnimationFrame(do_frame);
}

function simulate_particle(particle, dt) {	
	// Simple first-order Euler integration.
	
	let r = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
	let Fx = -particle.force * particle.x / r;
	let Fy = -particle.force * particle.y / r;
	
	particle.vx += Fx / particle.mass * dt;
	particle.vy += Fy / particle.mass * dt;
	
	particle.x += particle.vx * dt;
	particle.y += particle.vy * dt;
}

function draw_particle(particle, alpha = 1) {
	
	{
		// Draw a circle at our particle's position
		let radius = 0.1 + 0.2 * (particle.mass / 5); // The size of the particle depends on its mass.
		graphics.fillStyle = `rgba(255, 255, 255, ${alpha})`;
		graphics.strokeStyle = "";
		graphics.beginPath()
		graphics.ellipse(particle.x, particle.y, radius, radius, 0, 0, Math.PI * 2);
		graphics.fill();
	}
	
	{
		// Draw the centripetal force
		let r = Math.sqrt(particle.x * particle.x + particle.y * particle.y)
		let rx = particle.x / r;
		let ry = particle.y / r;
		
		if (particle.force) {
			let force_length = particle.force / 5.0;
			graphics.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
			graphics.fillStyle = `rgba(255, 0, 0, ${alpha})`;
			graphics.lineWidth = 0.03;
			draw_arrow(particle.x, particle.y, particle.x -force_length * rx, particle.y -force_length * ry, 0.2);
		}
	}
	
	{
		// Draw the particle's velocity.
		let speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
		let tx = particle.vx / speed;
		let ty = particle.vy / speed;
		
		let speed_vector_size = speed * 1.0; // Here we can scale up or down the velocity vector.
		graphics.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
		graphics.fillStyle = `rgba(0, 255, 255, ${alpha})`;
		graphics.lineWidth = 0.03;
		draw_arrow(particle.x, particle.y, particle.x + speed_vector_size * tx, particle.y + speed_vector_size * ty, 0.2);
	}
}

function draw_arrow(x0, y0, x1, y1, tip_size = 10) {
	graphics.beginPath();
	graphics.moveTo(x0, y0);
	graphics.lineTo(x1, y1);
	graphics.stroke();
	
	var dx = x1 - x0;
	var dy = y1 - y0;
	var angle = Math.atan2(dy, dx);
	
	let ax = x1 - tip_size * Math.cos(angle - Math.PI / 6);
	let ay = y1 - tip_size * Math.sin(angle - Math.PI / 6);
	
	let bx = x1 - tip_size * Math.cos(angle + Math.PI / 6);
	let by = y1 - tip_size * Math.sin(angle + Math.PI / 6);
	
	graphics.beginPath();
	graphics.moveTo(ax, ay);
	graphics.lineTo(bx, by);
	graphics.lineTo(x1, y1);
	graphics.closePath();
	graphics.fill();
}

function update_value(quantity_name) {	
	let label = document.getElementById(quantity_name + "-label");
	let slider = document.getElementById(quantity_name + "-slider");
	let value = parseFloat(slider.value);
	
	let quantity = quantities[quantity_name];
	quantity.value = value;
	
	label.innerHTML = quantity.variable + " = " + value.toFixed(2) + " " + quantity.unit; 
	
	recalculate_trajectory();
}

function update_canvas_size() {
	let size = window.innerWidth * 0.45;
	canvas.width = size;
	canvas.height = size;
}
window.addEventListener("resize", update_canvas_size);

let mouse_down = false;
window.onmousedown = function() { mouse_down = true;}
window.onmouseup   = function() { mouse_down = false; }