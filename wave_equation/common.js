"use strict"

// User must define the following functions:
// - initialize
// - simulate
// - render

// The user can also modify the following variables:
// - max_frame_dt
// - simulation_dt
// - aspect_ratio

let canvas;
let gc;
let canvas_x = 0, canvas_y = 0;
let mouse_x = 0, mouse_y = 0;
let mouse_just_pressed = false, mouse_down = false;
let paused = false;
let frame_dt = 0;
let max_frame_dt = 1;

let just_resumed = false;

let last_frame_time = 0;
let accumulated_time = 0;

let aspect_ratio = 16.0 / 9.0;
let simulation_dt = 1.0 / 60.0;

window.addEventListener("mousemove",
	(e) => {
		mouse_x = e.clientX - canvas_x;
		mouse_y = e.clientY - canvas_y;
	}
);

window.addEventListener("mouseup",
	(e) => {
		mouse_down = false;
	}
);

window.addEventListener("mousedown",
	(e) => {
		mouse_just_pressed = true;
		mouse_down = true;
	}
);

window.addEventListener("load",
	() => {
		canvas = document.getElementById("canvas");
		
		// Pause when window is not visible.
		document.addEventListener("visibilitychange",
			(e) => {
				if (document.hidden) {
					pause();
				} else {
					resume();
				}
			}
		);
		
		// Pause when window is not focused.
		// window.addEventListener("blur", (e) => { pause() });
		// window.addEventListener("focus", (e) => { resume() });
		
		gc = canvas.getContext("2d");
		
		initialize();
		update_dimensions();
		
		do_frame(0);
	}
);


function pause() {
	paused = true;
}

function resume() {
	just_resumed = true;
	paused = false;
}

function do_frame(time) {
	frame_dt = (time - last_frame_time) / 1000;
	last_frame_time = time;
	
	if (frame_dt > max_frame_dt) {
		frame_dt = max_frame_dt;
	}
	
	if (just_resumed) {
		frame_dt = 0;
		just_resumed = false;
	}
	
	if (!paused) {
		accumulated_time += frame_dt;
		
		let iteration_count = Math.floor(accumulated_time / simulation_dt);
		for (let it = 0; it < iteration_count; it += 1) {
			simulate();
			accumulated_time -= simulation_dt;
		}
	}
	
	render();
	
	mouse_just_pressed = false;
	requestAnimationFrame(do_frame);
}

window.addEventListener("resize", update_dimensions);

function update_dimensions() {
	
	let container = canvas.parentNode;
	
	let container_w = container.clientWidth;
	let container_h = container.clientHeight;
	
	let canvas_w = container_w;
	let canvas_h = container_h;
	
	let window_aspect_ratio = container_w / container_h;
	
	if (window_aspect_ratio > aspect_ratio) {
		canvas_w = container_h * aspect_ratio;
	} else {
		canvas_h = container_w / aspect_ratio;
	}
	
	canvas_x = (container_w - canvas_w) * 0.5;
	canvas_y = (container_h - canvas_h) * 0.5;
	
	canvas.style.position = 'absolute';
	canvas.style.left = canvas_x + 'px';
	canvas.style.top  = canvas_y + 'px';
	canvas.width  = canvas_w;
	canvas.height = canvas_h;
}


//// Utility functions

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function map(x, a, b, new_a, new_b) {
	let t = (x - a) / (b - a);
	return lerp(new_a, new_b, t);
}

function distance(x1, y1, x2, y2) {
	let dx = x2 - x1;
	let dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

function smoothstep2(t) {
	return Math.pow(t, 3) * (10 + t * (t * 6 - 15));
}

function draw_arrow(gc, x0, y0, x1, y1, tip_size = 10) {
	gc.moveTo(x0, y0);
	gc.lineTo(x1, y1);
	gc.stroke();
	
	var dx = x1 - x0;
	var dy = y1 - y0;
	var angle = Math.atan2(dy, dx);
	
	let ax = x1 - tip_size * Math.cos(angle - Math.PI / 6);
	let ay = y1 - tip_size * Math.sin(angle - Math.PI / 6);
	
	let bx = x1 - tip_size * Math.cos(angle + Math.PI / 6);
	let by = y1 - tip_size * Math.sin(angle + Math.PI / 6);
	
	gc.beginPath();
	gc.moveTo(ax, ay);
	gc.lineTo(bx, by);
	gc.lineTo(x1, y1);
	gc.closePath();
	gc.fill();
}

function toggle_fullscreen() {
	var doc = window.document;
	var docEl = doc.documentElement;
	
	var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
	var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
	
	if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl);
		screen.orientation.lock("landscape");
	} else {
		cancelFullScreen.call(doc);
		screen.orientation.unlock();
	}
}