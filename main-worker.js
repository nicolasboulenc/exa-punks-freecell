'use strict';

import { create_game, solve, solve_all } from './solver.js'

onmessage = (e) => {

    if(e.data.action === 'init') {

        const game = create_game(e.data.board);
        let res = solve_all(game, on_success, e.data.start_index);
    }
}


function on_success(game) {
    postMessage({ action: 'solved', data: null });
}