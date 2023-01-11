"use strict";
// suits can be a = spade, b = earts, c = clubs, d = diamonds
// ranks can be 6 to 10 = s to w, r(ed), b(lack)
// suits can be s(pade), c(lubs), d(iamonds), h(earts)
// ranks can be 6 to 10, a(ce), k(ing), q(ueen), j(ack)
const FACE = 0;
// const DATA = [
// 	[ "as", "10h", "ks", "qc" ],
// 	[ "ah", "jd", "8s", "6h" ],
// 	[ "9h", "qh", "10c", "kd" ],
// 	[ "10d", "10s", "jc", "7c" ],
// 	[ "kc", "qd", "6d", "qs" ],
// 	[ "ac", "8c", "9c", "jh" ],
// 	[ "9d", "7h", "7d", "8h" ],
// 	[ "kh", "9s", "js", "8d" ],
// 	[ "6s", "ad", "6c", "7s" ]
// ];
const DATA = [
    ["7c", "7s", "ks", "js"],
    ["ah", "jd", "10h", "6h"],
    ["9h", "qh", "10c", "kd"],
    ["10d", "10s", "jc", "8s"],
    ["kc", "qd", "6d", "qs"],
    ["ac", "8c", "9c", "jh"],
    ["9d", "7h", "7d", "8h"],
    ["kh", "9s", "qc", "8d"],
    ["6s", "ad", "6c", "as"]
];
const DATA_SUCCESS = [
    ["as", "js", "ks", "qs"],
    ["ac", "qc", "kc", "jc"],
    ["kh", "jh", "ah", "qh"],
    ["qd", "jd", "kd", "ad"],
    ["10d", "9s", "8h", "7c"],
    ["10h", "9c", "8d", "7s"],
    ["10s", "9h", "8c", "7h"],
    ["10c", "9d", "8s", "7d"]
];
function create_stacks(data) {
    let stacks = [];
    for (const s of data) {
        let stack = [];
        for (const c of s) {
            // get rank
            let r = c.substring(0, c.length - 1);
            let rank;
            if (isNaN(parseInt(r)) === false) {
                rank = parseInt(r);
            }
            else {
                if (r === 'j')
                    rank = 11;
                else if (r === 'q')
                    rank = 12;
                else if (r === 'k')
                    rank = 13;
                else if (r === 'a')
                    rank = 14;
            }
            let suit = c.substring(c.length - 1);
            let color = (suit === "h" || suit === "d" ? "r" : "b");
            if (isNaN(rank) === true) {
                rank = FACE;
            }
            let card = { rank: rank, suit: suit, color: color, face: rank > 10 };
            stack.push(card);
        }
        stacks.push(stack);
    }
    return stacks;
}
function print_game(game) {
    let line;
    line = format_card(game.freecell).padStart(3, ' ');
    console.log(line);
    // get max stack size
    let row_count = 0;
    for (const stack of game.stacks) {
        if (stack.length > row_count) {
            row_count = stack.length;
        }
    }
    for (let i = 0; i < row_count; i++) {
        let line = "";
        for (const stack of game.stacks) {
            if (stack.length > i) {
                line += format_card(stack[i]).padStart(3, ' ') + " ";
            }
            else {
                line += "    ";
            }
        }
        console.log(line);
    }
    console.log('');
}
function format_card(card) {
    // in case it is the freecell destination
    if (card === null)
        return " __";
    const suit_map = { s: "\u2660", c: "\u2663", h: "\u2665", d: "\u2666" };
    let rank;
    if (card.rank < 11) {
        rank = card.rank.toString();
    }
    else {
        if (card.rank === 11)
            rank = 'J';
        else if (card.rank === 12)
            rank = 'Q';
        else if (card.rank === 13)
            rank = 'K';
        else if (card.rank === 14)
            rank = 'A';
    }
    let suit = suit_map[card.suit];
    return rank + suit;
}
function print_move(move) {
    let from = [];
    for (let card of move.src) {
        from.push(format_card(card));
    }
    let src = from.join(', ');
    if (move.src.length > 1) {
        src = `[${src}]`;
    }
    let line = `${src}(${move.src_idx}) -> ${format_card(move.dst)}(${move.dst_idx})`;
    console.log(line);
}
function serialise_game(game) {
    let state = format_card(game.freecell);
    for (const stack of game.stacks) {
        for (const card of stack) {
            state += format_card(card);
        }
    }
    return state;
}
function get_valid_moves(game) {
    // get valid froms
    const valid_froms = [];
    let from_idx = 0;
    for (const stack of game.stacks) {
        let from = get_valid_from(stack);
        // add the stacks - 1 possibility, to use the one left with the free cell
        if (from.length > 0) {
            valid_froms.push({ src: from, src_idx: from_idx });
        }
        from_idx++;
    }
    if (game.freecell !== null) {
        valid_froms.push({ src: game.freecell, src_idx: 9 });
    }
    // look for valid destinations
    const valid_moves = [];
    for (const from of valid_froms) {
        let dst_idx = 0;
        while (dst_idx < game.stacks.length) {
            if (dst_idx !== from.src_idx) {
                let card = from.src[0];
                let is_valid = check_valid_to(card, game.stacks[dst_idx]);
                if (is_valid === true) {
                    if (game.stacks[dst_idx].length > 0) {
                        valid_moves.push({ src: from.src, src_idx: from.src_idx, dst: game.stacks[dst_idx][game.stacks[dst_idx].length - 1], dst_idx: dst_idx });
                    }
                    else {
                        valid_moves.push({ src: from.src, src_idx: from.src_idx, dst: null, dst_idx: dst_idx });
                    }
                }
            }
            dst_idx++;
        }
        if (Array.isArray(from.src) === false && game.freecell === null) {
            valid_moves.push({ src: from.src, src_idx: from.src_idx, dst: null, dst_idx: 9 });
        }
    }
    return valid_moves;
}
function get_valid_from(stack) {
    if (stack.length === 0)
        return [];
    if (stack.length === 1) {
        return [stack[0]];
    }
    // if 4 faces, this cannot be moved
    if (stack.length === 4 &&
        stack[0].suit === stack[1].suit && stack[1].suit === stack[2].suit && stack[2].suit === stack[3].suit &&
        stack[0].face === true && stack[1].face === true && stack[2].face === true && stack[3].face === true) {
        return [];
    }
    if (stack.length > 1) {
        let i = stack.length - 2;
        while ((i > -1) && ((stack[i].color !== stack[i + 1].color && stack[i].rank === stack[i + 1].rank + 1) ||
            (stack[i].suit === stack[i + 1].suit && stack[i].face === true && stack[i + 1].face === true))) {
            i--;
        }
        i++;
        let group = [];
        for (let j = i; j < stack.length; j++) {
            group.push(stack[j]);
        }
        return group;
    }
}
function check_valid_to(card, stack) {
    if (stack.length === 0)
        return true;
    let stack_card = stack[stack.length - 1];
    let is_valid = (card.rank === stack_card.rank - 1 && card.face === false && stack_card.face === false && card.color !== stack_card.color);
    is_valid = is_valid || (card.face === true && stack_card.face === true && card.suit === stack_card.suit);
    return is_valid;
}
function check_success(game) {
    if (game.freecell !== null) {
        return false;
    }
    // each stack is 4 identical suits or alternating 10 to 6 black/red or red black
    let success = true;
    let idx = 0;
    while (idx < game.stacks.length && success === true) {
        let stack = game.stacks[idx];
        if (stack.length !== 4) {
            success = false;
            break;
        }
        success = ((stack[0].rank === 10 && stack[1].rank === 9 && stack[2].rank === 8 && stack[3].rank === 7) &&
            (stack[0].color !== stack[1].color && stack[1].color !== stack[2].color && stack[2].color !== stack[3].color)) ||
            ((stack[0].face === true && stack[1].face === true && stack[2].face === true && stack[3].face === true) &&
                (stack[0].suit === stack[1].suit && stack[1].suit === stack[2].suit && stack[2].suit === stack[3].suit));
        idx++;
    }
    return success;
}
function execute(move, game) {
    // link cards to dst
    if (move.dst_idx === 9) {
        game.freecell = move.src[0];
    }
    else {
        let dst_stack = game.stacks[move.dst_idx];
        for (const card of move.src) {
            dst_stack.push(card);
        }
    }
    // dettach from src
    if (move.src_idx === 9) {
        game.freecell = null;
    }
    else {
        let src_stack = game.stacks[move.src_idx];
        if (Array.isArray(move.src) === false) {
            src_stack.pop();
        }
        else {
            for (const card of move.src) {
                src_stack.pop();
            }
        }
    }
}
function cancel(move, game) {
    // reverse move
    const dst = game.stacks[move.src_idx][game.stacks[move.src_idx].length];
    const rev = { src: move.src, src_idx: move.dst_idx, dst: dst, dst_idx: move.src_idx };
    execute(rev, game);
}
function solve(game) {
    // test for victory
    let success = check_success(game);
    if (success === true) {
        // stop
        console.log('solved!');
    }
    // get next moves
    let valid_moves = get_valid_moves(game);
    // need to check moves to make sure we dont end up in a loop, moving freecell card back and forth for example!!!
    // if no more moves
    if (valid_moves.length === 0) {
        console.log('no further valid move');
        return;
    }
    // execute moves
    for (const move of valid_moves) {
        let new_game = Object.assign({}, game);
        execute(move, new_game);
        // if recuring states cancel
        let state = serialise_game(new_game);
        if (new_game.states.includes(state) === true) {
            cancel(move, new_game);
            return;
        }
        new_game.states.push(state);
        print_game(new_game);
        // else call solve
        solve(new_game);
    }
}
const game = { stacks: [], freecell: null, states: [] };
// 1. test check_success
// game.stacks = create_stacks(DATA_SUCCESS);
// console.log(check_success(game));
// print_game(game);
// 2. test execute / cancel
// game.stacks = create_stacks(DATA);
// console.log(check_success(game));
// print_game(game);
// let moves = get_valid_moves(game);
// for(let move of moves) {
// 	print_move(move);
// }
// execute(moves[0], game);
// print_game(game);
// cancel(moves[0], game);
// print_game(game);
// moves = get_valid_moves(game);
// for(let move of moves) {
// 	print_move(move);
// }
// execute(moves[0], game);
// print_game(game);
// moves = get_valid_moves(game);
// for(let move of moves) {
// 	print_move(move);
// }
// execute(moves[0], game);
// print_game(game);
// moves = get_valid_moves(game);
// for(let move of moves) {
// 	print_move(move);
// }
// execute(moves[6], game);
// print_game(game);
// moves = get_valid_moves(game);
// for(let move of moves) {
// 	print_move(move);
// }
// execute(moves[11], game);
// print_game(game);
// moves = get_valid_moves(game);
// for(let move of moves) {
// 	print_move(move);
// }
// console.log(serialise_game(game));
// 3
game.stacks = create_stacks(DATA);
print_game(game);
solve(game);
//# sourceMappingURL=main.js.map