'use strict';

import { create_game, solve, solve_all, forward } from '../solver.js'

onmessage = (e) => {

	if(e.data.action === 'init') {

		const game = create_game(e.data.board);
		forward(game, e.data.start_index);
		solve_all(game, on_success);
	}
}

function on_success(game) {
	postMessage({ action: 'solved', game: game });
	return true;
}