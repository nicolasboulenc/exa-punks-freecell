"use strict";
function create_game(data) {
    let stacks = create_stacks(data);
    return { stacks: stacks, freecell: null, states: [], moves: [] };
}
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
                else
                    rank = 999;
            }
            let s = c.substring(c.length - 1);
            let suit = 's';
            if (s === 's')
                suit = 's';
            else if (s === 'c')
                suit = 'c';
            else if (s === 'h')
                suit = 'h';
            else if (s === 'd')
                suit = 'd';
            let color = (suit === 'h' || suit === 'd' ? 'r' : 'b');
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
        else
            rank = '?';
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
        const is_full_stack = (from.length === stack.length);
        // add the stacks - 1 possibility, to use the one left with the free cell
        if (from.length > 0) {
            valid_froms.push({ src: from, src_idx: from_idx, is_full_stack: is_full_stack });
        }
        from_idx++;
    }
    if (game.freecell !== null) {
        valid_froms.push({ src: [game.freecell], src_idx: 9, is_full_stack: false });
    }
    // look for valid destinations
    const valid_moves = [];
    for (const pseudo_move of valid_froms) {
        let dst_idx = 0;
        while (dst_idx < game.stacks.length) {
            if (dst_idx !== pseudo_move.src_idx) {
                // prevent moving a full stack to an empty stack
                if (pseudo_move.is_full_stack && game.stacks[dst_idx].length === 0) {
                    dst_idx++;
                    continue;
                }
                let card = pseudo_move.src[0];
                let is_valid = check_valid_to(card, game.stacks[dst_idx]);
                if (is_valid === true) {
                    let dst = null;
                    if (game.stacks[dst_idx].length > 0) {
                        dst = game.stacks[dst_idx][game.stacks[dst_idx].length - 1];
                    }
                    valid_moves.push({ src: pseudo_move.src, src_idx: pseudo_move.src_idx, dst: dst, dst_idx: dst_idx });
                }
            }
            dst_idx++;
        }
        if (pseudo_move.src.length === 1 && game.freecell === null) {
            valid_moves.push({ src: pseudo_move.src, src_idx: pseudo_move.src_idx, dst: null, dst_idx: 9 });
        }
    }
    return valid_moves;
}
function get_valid_from(stack) {
    if (stack.length === 0) {
        return [];
    }
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
        while ((i > -1) && ((stack[i].face === false && stack[i + 1].face === false && stack[i].color !== stack[i + 1].color && stack[i].rank === stack[i + 1].rank + 1) ||
            (stack[i].face === true && stack[i + 1].face === true && stack[i].suit === stack[i + 1].suit))) {
            i--;
        }
        i++;
        let group = [];
        for (let j = i; j < stack.length; j++) {
            group.push(stack[j]);
        }
        return group;
    }
    return [];
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
        const stack = game.stacks[idx];
        // 10 down
        success = (stack.length === 0) ||
            (stack.length === 5 &&
                (stack[0].rank === 10 && stack[1].rank === 9 && stack[2].rank === 8 && stack[3].rank === 7 && stack[4].rank === 6) &&
                (stack[0].color !== stack[1].color && stack[1].color !== stack[2].color && stack[2].color !== stack[3].color && stack[3].color !== stack[4].color)) ||
            (stack.length === 4 &&
                (stack[0].face === true && stack[1].face === true && stack[2].face === true && stack[3].face === true) &&
                (stack[0].suit === stack[1].suit && stack[1].suit === stack[2].suit && stack[2].suit === stack[3].suit));
        idx++;
    }
    return success;
}
function execute(move, game) {
    // link cards to dst
    if (move.dst_idx < 9) {
        let dst_stack = game.stacks[move.dst_idx];
        for (const card of move.src) {
            dst_stack.push(card);
        }
    }
    else if (move.dst_idx === 9) {
        game.freecell = move.src[0];
    }
    // dettach from src
    if (move.src_idx < 9) {
        let src_stack = game.stacks[move.src_idx];
        for (const _ of move.src) {
            src_stack.pop();
        }
    }
    else if (move.src_idx === 9) {
        game.freecell = null;
    }
}
function cancel(move, game) {
    const dst = null;
    const rev = { src: move.src, src_idx: move.dst_idx, dst: dst, dst_idx: move.src_idx };
    execute(rev, game);
}
function solve(game) {
    // test for success
    let success = check_success(game);
    if (success === true) {
        return true;
    }
    // get next moves
    let valid_moves = get_valid_moves(game);
    // if no more moves
    if (valid_moves.length === 0) {
        // console.log('no further valid move');
        return false;
    }
    // execute moves
    for (const move of valid_moves) {
        execute(move, game);
        // if recuring states cancel
        let state = serialise_game(game);
        if (game.states.includes(state) === true) {
            cancel(move, game);
            continue;
        }
        game.states.push(state);
        // print_game(game);
        game.moves.push(move);
        // else call solve
        const res = solve(game);
        if (res === true) {
            return true;
        }
        else {
            cancel(move, game);
            game.moves.pop();
        }
    }
    return false;
}
function solve_all(game, callback, start_index = 0) {
    // forward(game, start_index);
    // test for success
    let success = check_success(game);
    if (success === true) {
        callback(game);
        return false;
    }
    // get next moves
    let valid_moves = get_valid_moves(game);
    // if no more moves
    if (valid_moves.length === 0) {
        // console.log('no further valid move');
        return false;
    }
    // execute moves
    for (const move of valid_moves) {
        execute(move, game);
        // if recuring states cancel
        let state = serialise_game(game);
        if (game.states.includes(state) === true) {
            cancel(move, game);
            continue;
        }
        game.states.push(state);
        // print_game(game);
        game.moves.push(move);
        // else call solve
        const res = solve_all(game, callback);
        if (res === true) {
            return true;
        }
        else {
            cancel(move, game);
            game.moves.pop();
        }
    }
    return false;
}
function forward(game, move_count, move_index = 0) {
    // this only moves forward on the first level of valid_moves
    // ideally this should go down the tree of valid moves breadth first
    // the solve algorithm is depth first
    // test for success
    if (move_index === move_count) {
        return true;
    }
    // get next moves
    let valid_moves = get_valid_moves(game);
    // if no more moves
    if (valid_moves.length === 0) {
        // console.log('no further valid move');
        return false;
    }
    if (move_index + valid_moves.length < move_count) {
        // move_index += valid_moves.length;
        // return forward(game, move_count, move_index);
        return false;
    }
    // execute moves
    let i = 0;
    while (move_index + i < move_count) {
        i++;
    }
    const move = valid_moves[i];
    execute(move, game);
    // if recuring states cancel
    let state = serialise_game(game);
    if (game.states.includes(state) === true) {
        cancel(move, game);
        return false;
    }
    game.states.push(state);
    // print_game(game);
    game.moves.push(move);
    return true;
}
export { create_game, solve, solve_all, print_game, print_move };
//# sourceMappingURL=solver.js.map