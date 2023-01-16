'use strict';

import { create_game, get_valid_moves } from './src/solver.js';

const DATA = [
	'as',  'ah', '9h',	'10d', 'kc', 'ac', '9d', 'kh', '6s',
	'10h', 'jd', 'qh',	'10s', 'qd', '8c', '7h', '9s', 'ad',
	'ks',  '7c', '10c',	'jc',  '6d', '9c', '7d', 'js', '6c',
	'qc',  '6h', 'kd',	'8s',  'qs', 'jh', '8h', '8d', '7s'
];


window.addEventListener('load', window_onload)
window.addEventListener('mousemove', window_onmousemove);
window.addEventListener('mouseup', window_onmouseup);

const app = {
	stacks: [],
	card: null,
	x: 0,
	y: 0,
	off_x: 0,
	off_y: 0,
	stack: null
}


function window_onload(evt) {

	const game = create_game(DATA);
	const moves = get_valid_moves(game);

	for(let i=0; i<9; i++) {
		const stack = document.getElementById(`stack${i}`);
		app.stacks.push(stack);
	}

	display(app.stacks, game);
}


function display(stacks, game) {

	const rank_map = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a' ];
	let index = 0;
	for(const stack of game.stacks) {
		for(const card of stack) {
			const div = document.createElement("div");
			div.dataset["card"] = `${rank_map[card.rank]}${card.suit}`;
			div.addEventListener('mousedown', card_onmousedown);
			div.ondragstart = function() { return false; };
			stacks[index].appendChild(div);
		}
		index++;
	}
}


function card_onmousedown(evt) {

	app.card = evt.currentTarget;
	app.off_x = evt.offsetX;
	app.off_y = evt.offsetY;
}


function window_onmouseup(evt) {

	app.card.hidden = true;
	let elemBelow = document.elementFromPoint(evt.clientX, evt.clientY);
	app.card.hidden = false;

	if(elemBelow.classList.contains('stack') === true) {
		app.stack = elemBelow;
	}
	else if(elemBelow.parentElement.classList.contains('stack') === true) {
		app.stack = elemBelow.parentElement;
	}

	app.card.classList.remove('moving');
	app.stack.appendChild(app.card);

	app.card = null;
	app.stack = null;
}


function window_onmousemove(evt) {

	if(app.card !== null) {
		app.card.classList.add('moving');
		app.card.style.left = `${evt.clientX - app.off_x}px`;
		app.card.style.top = `${evt.clientY - app.off_y}px`;
	}
}

