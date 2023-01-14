'use strict';

import { create_game, solve_all, } from '../solver.js'
const {	Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

// main thread
if (isMainThread) {

	let t0;
	const workers = [];
	const solution_map = {};
	let solution_count = 0;

	const DATA = [
		'as',  'ah', '9h',	'10d', 'kc', 'ac', '9d', 'kh', '6s',
		'10h', 'jd', 'qh',	'10s', 'qd', '8c', '7h', '9s', 'ad',
		'ks',  '7c', '10c',	'jc',  '6d', '9c', '7d', 'js', '6c',
		'qc',  '6h', 'kd',	'8s',  'qs', 'jh', '8h', '8d', '7s'
	];

	const game = create_game(DATA);
	const moves = get_valid_moves(game);

	for(let i=0; i < moves.length; i++) {

		console.log(`Creating worker ${i}.`);
		const worker = new Worker(__filename, { workerData: null });
		// const worker = new Worker('main-worker.js', { type: "module" });
		worker.on('message', (e) => { message_callback(e.data.game); });
		workers.push(worker);
	}

	t0 = performance.now();
	let i = 0;
	for(const worker of workers) {
		worker.postMessage({ action: 'init', board: DATA, start_index: i++ });
	}
}
// worker thread
else {
	parentPort.on('message', (e) => {

		if(e.data.action === 'init') {

			const game = create_game(e.data.board);
			forward(game, e.data.start_index);
			solve_all(game, on_success);
		}
	});

}

function message_callback(game) {

	// const str = serialise_game(game);
	const str = game.states[game.states.length - 1];
	if(solution_map[str] === undefined) {
		solution_map[str] = 1;
		solution_count++;
		console.log(Math.floor(solution_count/100));

		if(solution_count === 3000) {
			const t1 = performance.now();
			console.log(`Found ${solution_count} solutions in ${((t1 - t0)/1000).toFixed(3)} s`);
			for(const worker of workers) {
				worker.terminate();
			}
		}
	}
}

function on_success(game) {
	parentPort.postMessage({ action: 'solved', game: game });
	return true;
}
