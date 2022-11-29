"use strict";

// suits can be a = spade, b = earts, c = clubs, d = diamonds
// ranks can be 6 to 10 = s to w, r(ed), b(lack)

// suits can be s(pade), c(lubs), d(iamonds), h(earts)
// ranks can be 6 to 10, a(ce), k(ing), q(ueen), j(ack)

const data = [
	[ "as", "10h", "ks", "qc" ],
	[ "ah", "jd", "8s", "6h" ],
	[ "9h", "qh", "10c", "kd" ],
	[ "10d", "10s", "jc", "7c" ],
	[ "kc", "qd", "6d", "qs" ],
	[ "ac", "8c", "9c", "jh" ],
	[ "9d", "7h", "7d", "8h" ],
	[ "kh", "9s", "js", "8d" ],
	[ "6s", "ad", "6c", "7s" ]
]

let stacks = [];
let free = null;


function create_stacks(data) {

	let stacks = [];

	for(const s of data) {
		let stack = []
		for(const c of s) {
			// get rank
			let rank = c.substring(0, c.length-1);
			let suit = c.substring(c.length-1);
			let color = (suit === "h" || suit === "d" ? "r" : "b");
			rank = parseInt(rank);
			if(isNaN(rank) === true) {
				rank = 0;
			}
			let card = { rank: rank, suit: suit, color: color };
			stack.push(card);
		}
		stacks.push(stack);
	}
	return stacks;
}


function search(stacks) {

	let from_idx = 1;
	for(const stack of stacks) {

		let from = get_valid_from(stack);
		if(from !== false) {

			// console.log(i, from);

			let dest_idx = 1;
			for(const dst_stack of stacks) {
				if(dst_stack !== stack) {
					let is_valid = check_valid_to(from, dst_stack);
					if(is_valid === true) {
						const from_str = format_card(from);
						const dest_str = format_card(dst_stack[dst_stack.length - 1]);
						const line = `${from_str}(${from_idx}) => ${dest_str}(${dest_idx})`;  
						console.log(line);
					}
				}
				dest_idx++;
			}
		}
		from_idx++;
	}
}


function get_valid_from( stack ) {

	if(stack.length === 0) 
		return false;

	if(stack.length === 1) {
		return stack[0];
	}

	if(	stack.length === 4 && 
		stack[0].suit === stack[1].suit === stack[2].suit === stack[3].suit && 
		stack[0].rank === stack[1].rank === stack[2].rank === stack[3].rank === 0) {
		return false;
	}

	if(stack.length > 1) {

		let i = stack.length - 2;
		while(	( i > -1 ) && (
				( stack[i].color !== stack[i+1].color && stack[i].rank === stack[i+1].rank + 1 ) || 
				( stack[i].suit === stack[i+1].suit && stack[i].rank === stack[i+1].rank === 0 ) ) ) {
			i--;
		}
		i++;
		// single card
		if(i === stack.length - 1) {
			return stack[stack.length - 1];
		}
		// sub stack of cards
		else {
			let group = [];
			for(let j=stack.length - 1; j >= i; j--) {
				group.push(stack[j]);
			}
			return group;
		}
	}
}


function check_valid_to( card, stack ) {

	if(stack.length === 0) return true;

	let stack_card = stack[stack.length - 1];
	let is_valid = (card.rank === stack_card.rank - 1 && card.suit !== stack_card.suit) ||
					( card.rank === stack_card.rank === 0 && card.suit === stack_card.suit );

	return is_valid;
}


function move_execute() {

}


function move_cancel() {

}


function print_stacks(stacks) {

	// get max stack size
	let row_count = 0;
	for(const stack of stacks) {
		if(stack.length > row_count) {
			row_count = stack.length;
		}
	}

	for(let i=0; i<row_count; i++) {
		let line = "";
		for(const stack of stacks) {
			if(stack.length > i) {
				line += format_card(stack[i]) + " ";
			}
			else {
				line += "   ";
			}
		}
		console.log(line);
	}
}

function format_card(card) {

	const suit_map = { 
		s: "\u2660",
		c: "\u2663",
		h: "\u2665",
		d: "\u2666"
	}

	let rank = card.rank < 10 ? " " + card.rank : card.rank;
	let suit = suit_map[card.suit];
	return rank + suit;
}

stacks = create_stacks(data);
print_stacks(stacks);
search(stacks);
