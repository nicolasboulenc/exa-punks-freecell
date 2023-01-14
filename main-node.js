'use strict';

import { create_game, solve, solve_all, print_game, print_move } from './solver.js'

const DATA = [
	[ "as", "10h", "ks", "qc" ],
	[ "ah", "jd", "7c", "6h" ],
	[ "9h", "qh", "10c", "kd" ],
	[ "10d", "10s", "jc", "8s" ],
	[ "kc", "qd", "6d", "qs" ],
	[ "ac", "8c", "9c", "jh" ],
	[ "9d", "7h", "7d", "8h" ],
	[ "kh", "9s", "js", "8d" ],
	[ "6s", "ad", "6c", "7s" ]
];

const game = create_game(DATA);
print_game(game);

// single solution
// let res = solve(game);
// print_solution(game);


// multiple solutions
solve_all(game, print_solution);


function print_solution(game) {

	console.log(`Solution found in ${game.moves.length} moves.`);
    for(const move of game.moves) {
        print_move(move);
    }
	print_game(game);
}

