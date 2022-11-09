"use strict"

// These determine the external changes to the wave over time.
const INPUT_NONE = 0;
const INPUT_PULSE = 1;
const INPUT_OSCILATOR = 2;

// These determine the constraints of the wave's limits.
const END_FREE = 1;
const END_FIXED = 2;
const END_INFINITE = 3;

function Wave(N) {
	this.N = N; // N is the number of discrete points of the wave.
	
	this.y = []; // Array of N floats, representing the vertical position of the wave.
	this.vy = []; // Array of N floats, representing the speed of each wave point.
	
	{
		// These simulation parameters  be freely changed in a wave instance to change its behavior.
		this.damping = 0;
		
		this.end_type = END_INFINITE;
		
		this.input_type = INPUT_NONE;
		this.pulse_cutoff = Math.PI;
		this.oscilator_frequency = 1;
		this.oscilator_amplitude = 0.4;
		this.oscilator_time = 10000;
	}
	
	this.simulate = function() {
		let dx = 1 / this.N;
		this.oscilator_time += simulation_dt;
		
		let angle = Math.PI * 2 * this.oscilator_time * this.oscilator_frequency;
		
		// Apply input to the left end.
		if (this.input_type == INPUT_OSCILATOR) {
			this.y[0] = Math.sin(angle) * this.oscilator_amplitude;
		} else if (this.input_type == INPUT_PULSE) {
			if (angle < this.pulse_cutoff) {
				this.y[0] = Math.sin(angle) * this.oscilator_amplitude;
			} else {
				angle = Math.PI;
			}
		} else if (this.input_type == INPUT_NONE) {
			this.y[0] = 0;
			this.vy[0] = 0;
		}
		
		for (let i = 0; i < this.N; i += 1) {
			let x = i * dx;
			
			let d2y_dx2 = 0;
			if (i > 0 && i < N - 1) {
				d2y_dx2 = (this.y[i + 1] - 2 * this.y[i] + this.y[i - 1]) / (dx * dx);
			}
			
			let v = this.get_velocity(x);
			this.vy[i] += ((v * v) * d2y_dx2 - this.damping * this.vy[i]) * simulation_dt;
		}
		
		// Apply constraints to the right end.
		if (this.end_type == END_FIXED) {
			this.vy[N - 1] = 0;
		} else if (this.end_type == END_INFINITE) {
			this.vy[0] = get_velocity(0) * ((this.y[1] - this.y[0]) / dx);
			this.vy[N - 1] = -get_velocity((N - 1) * dx) * ((this.y[N-1] - this.y[N-2]) / dx);
		}
		
		for (let i = 0; i < N; i += 1) {
			this.y[i] += this.vy[i] * simulation_dt;
		}
		
		if (this.end_type == END_FIXED) {
			this.y[N - 1] = 0;
		} else if (this.end_type == END_FREE) {
			this.y[N - 1] = this.y[N - 2];
		}
		
	};
	
	// Override this function to determine the propagation velocity of the wave at a point x (between 0 to 1).
	this.get_velocity = function(x) { // x ranges from 0 to 1
		return 1;
	};
	
	// Call this function to apply a pulse at the left end of the wave.
	this.pulse = function() {
		this.input_type = INPUT_PULSE;
		
		let period = 1 / this.oscilator_frequency;
		if (this.oscilator_time > period * this.pulse_cutoff / (2 * Math.PI)) {
			this.oscilator_time = 0;
		}
	};
	
	// Initialize our position and velocity arrays.
	for (let i = 0; i < N; i += 1) {
		let y = 0;
		this.y.push(y);
		this.vy.push(0);
	}
}