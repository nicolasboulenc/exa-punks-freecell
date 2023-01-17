'use strict';

import { create_game, get_valid_from,  check_valid_to } from './src/solver.js';

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
	is_transition: false,
	stack_from: null,
	stack_to: null
}

let game = null;

function window_onload(evt) {

	game = create_game(DATA);
	init();
	load(app.stacks, game.stacks);
}


function init() {

	for(let i=0; i<9; i++) {
		const stack = document.getElementById(`stack${i}`);
		app.stacks.push(stack);
	}
}


function load(dom_stacks, game_stacks) {

	const rank_map = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a' ];
	let index = 0;
	for(const stack of game_stacks) {

		let cont = null;
		let i = 0;
		for(const card of stack) {

			if(cont === null) cont = dom_stacks[index];

			const card_div = document.createElement("div");
			card_div.dataset["card"] = `${rank_map[card.rank]}${card.suit}`;
			const cont_div = document.createElement("div");
			cont_div.appendChild(card_div);
			cont_div.id = `s${i++}`;
			cont_div.addEventListener('mousedown', card_onmousedown);

			cont.appendChild(cont_div);
			cont = cont_div;
		}
		index++;
	}
}


function card_onmousedown(evt) {

	evt.stopPropagation();
	if(app.is_transition === true) return;

	app.card = evt.currentTarget;

	let elem = app.card;
	while(elem.classList.contains('stack') !== true) {
		elem = elem.parentElement;
	}
	app.stack_from = elem;

	app.off_x = evt.clientX - app.card.offsetLeft;
	app.off_y = evt.clientY - app.card.offsetTop;

	app.card.style.left = `${evt.clientX - app.off_x}px`;
	app.card.style.top = `${evt.clientY - app.off_y}px`;
	app.card.classList.add('moving');

	document.body.appendChild(app.card);

}


function card_ontransitionend(evt) {

	app.is_transition = false;
	const card = evt.target;
	card.removeEventListener('transitionend', card_ontransitionend);
	card.classList.remove('moving');
	card.classList.remove('transit');
	document.body.appendChild(document.getElementById('blank-card').parentElement);
	app.stack_to.appendChild(app.card);

	app.card = null;
	app.stack_to = null;
	app.stack_from = null;
}


function window_onmouseup(evt) {

	if(app.card === null) return;

	let elems = document.elementsFromPoint(evt.clientX, evt.clientY);

	for(const elem of elems) {
		if(elem.classList.contains('stack') === true) {
			app.stack_to = elem;
			break;
		}
	}

	if(app.stack_to === null) {
		app.stack_to = app.stack_from;
	}

	const blank = document.getElementById('blank-card').parentElement;

	// moves to the top of the stack
	if(app.stack_to.children.length > 0) {
		app.stack_to = app.stack_to.children[0];
		while(app.stack_to.children.length > 1) {
			app.stack_to = app.stack_to.children[1];
		}
	}
	app.stack_to.appendChild(blank);

	app.is_transition = true;
	app.card.addEventListener('transitionend', card_ontransitionend);
	app.card.classList.add('transit');
	const bbox = blank.getBoundingClientRect();
	app.card.style.top = Math.floor(bbox.top) + 'px';
	app.card.style.left = Math.floor(bbox.left) + 'px';
}


function window_onmousemove(evt) {

	if(app.card !== null && app.is_transition !== true) {
		app.card.style.left = `${evt.clientX - app.off_x}px`;
		app.card.style.top = `${evt.clientY - app.off_y}px`;
	}
}

