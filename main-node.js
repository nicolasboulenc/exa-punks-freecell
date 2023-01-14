'use strict';

import { create_game, solve, solve_all, format_game, format_move } from './solver.js'


const DATA = [
	'as',  'ah', '9h',	'10d', 'kc', 'ac', '9d', 'kh', '6s',
	'10h', 'jd', 'qh',	'10s', 'qd', '8c', '7h', '9s', 'ad',
	'ks',  '7c', '10c',	'jc',  '6d', '9c', '7d', 'js', '6c',
	'qc',  '6h', 'kd',	'8s',  'qs', 'jh', '8h', '8d', '7s'
];

let solutions = 0;

const game = create_game(DATA);
console.log(format_game(game));

// single solution
// let res = solve(game);
// print_solution(game);


const t0 = performance.now();

// multiple solutions
solve_all(game, success_callback);

function success_callback(game) {

	solutions++;
	if(solutions === 3000) {
		const t1 = performance.now();
		console.log(`Time it takes to run the function: ${((t1 - t0)/1000).toFixed(3)} ms`);
	}

	return solutions < 3000;
}

