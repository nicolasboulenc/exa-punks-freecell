"use strict";
// suits can be a = spade, b = earts, c = clubs, d = diamonds
// ranks can be 6 to 10 = s to w, r(ed), b(lack)
// suits can be s(pade), c(lubs), d(iamonds), h(earts)
// ranks can be 6 to 10, a(ce), k(ing), q(ueen), j(ack)
const FACE = "@";
const DATA = [
    ["as", "10h", "ks", "qc"],
    ["ah", "jd", "8s", "6h"],
    ["9h", "qh", "10c", "kd"],
    ["10d", "10s", "jc", "7c"],
    ["kc", "qd", "6d", "qs"],
    ["ac", "8c", "9c", "jh"],
    ["9d", "7h", "7d", "8h"],
    ["kh", "9s", "js", "8d"],
    ["6s", "ad", "6c", "7s"]
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
            let rank = c.substring(0, c.length - 1);
            let suit = c.substring(c.length - 1);
            let color = (suit === "h" || suit === "d" ? "r" : "b");
            rank = parseInt(rank);
            if (isNaN(rank) === true) {
                rank = FACE;
            }
            let card = { rank: rank, suit: suit, color: color };
            stack.push(card);
        }
        stacks.push(stack);
    }
    return stacks;
}
function print_game(game) {
    let line = " __";
    if (game.freecell !== null) {
        line = format_card(game.freecell);
    }
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
                line += format_card(stack[i]) + " ";
            }
            else {
                line += "    ";
            }
        }
        console.log(line);
    }
}
function serialise_game(game) {
    // this function is for state test, so we're only interrested in b/r and f cards
    let state = "";
    if (game.freecell === null) {
        state += "__";
    }
    else {
        state += game.freecell.rank + game.freecell.color;
    }
    for (const stack of game.stacks) {
        for (const card of stack) {
            state += card.rank + card.color;
        }
    }
    return state;
}
function format_card(card) {
    // in case it is the freecell destination
    if (card === null)
        return " __";
    const suit_map = {
        s: "\u2660",
        c: "\u2663",
        h: "\u2665",
        d: "\u2666"
    };
    let rank = card.rank < 10 || card.rank === FACE ? " " + card.rank : card.rank;
    let suit = suit_map[card.suit];
    return rank + suit;
}
function get_valid_moves(game) {
    // get valid froms
    const valid_froms = [];
    let from_idx = 0;
    for (const stack of game.stacks) {
        let from = get_valid_from(stack);
        if (from !== false) {
            if (Array.isArray(from) === true) {
                // add the stacks - 1 possibility, to use the one left with the free cell
                let from_m1 = [];
                if (from.length > 2) {
                    for (let i = 1; i < from.length; i++) {
                        from_m1.push(from[i]);
                    }
                }
                else {
                    from_m1 = from[from.length - 1];
                }
                valid_froms.push({ src: from_m1, idx: from_idx });
            }
            valid_froms.push({ src: from, stack_idx: from_idx });
        }
        from_idx++;
    }
    if (game.freecell !== null) {
        valid_froms.push({ src: game.freecell, stack_idx: 9 });
    }
    // look for valid destinations
    const valid_moves = [];
    for (const from of valid_froms) {
        let dst_idx = 0;
        while (dst_idx < game.stacks.length) {
            if (dst_idx !== from.stack_idx) {
                let card = from.src;
                if (Array.isArray(card) === true) {
                    card = card[0];
                }
                let is_valid = check_valid_to(card, game.stacks[dst_idx]);
                if (is_valid === true) {
                    valid_moves.push({ src: from.src, src_idx: from.stack_idx, dst: game.stacks[dst_idx][game.stacks[dst_idx].length - 1], dst_idx: dst_idx });
                }
            }
            dst_idx++;
        }
        if (Array.isArray(from.src) === false && game.freecell === null) {
            valid_moves.push({ src: from.src, src_idx: from.stack_idx, dst: null, dst_idx: 9 });
        }
    }
    return valid_moves;
}
function get_valid_from(stack) {
    if (stack.length === 0)
        return false;
    if (stack.length === 1) {
        return stack[0];
    }
    if (stack.length === 4 &&
        stack[0].suit === stack[1].suit === stack[2].suit === stack[3].suit &&
        stack[0].rank === stack[1].rank === stack[2].rank === stack[3].rank === FACE) {
        return false;
    }
    if (stack.length > 1) {
        let i = stack.length - 2;
        while ((i > -1) && ((stack[i].color !== stack[i + 1].color && stack[i].rank === stack[i + 1].rank + 1) ||
            (stack[i].suit === stack[i + 1].suit && stack[i].rank === stack[i + 1].rank === FACE))) {
            i--;
        }
        i++;
        // single card
        if (i === stack.length - 1) {
            return stack[stack.length - 1];
        }
        // sub stack of cards
        else {
            let group = [];
            for (let j = stack.length - 1; j >= i; j--) {
                group.push(stack[j]);
            }
            return group;
        }
    }
}
function check_valid_to(card, stack) {
    if (stack.length === 0)
        return true;
    let stack_card = stack[stack.length - 1];
    let is_valid = (card.rank === stack_card.rank - 1 && card.suit !== stack_card.suit) ||
        (card.rank === stack_card.rank === FACE && card.suit === stack_card.suit);
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
            ((stack[0].rank === stack[1].rank === stack[2].rank === stack[3].rank === FACE) &&
                (stack[0].suit === stack[1].suit === stack[2].suit === stack[3].suit));
        idx++;
    }
    return success;
}
function execute(move, game) {
    // link cards to dst
    if (move.dst_idx === 9) {
        game.freecell = move.src;
    }
    else {
        let dst_stack = game.stacks[move.dst_idx];
        if (Array.isArray(move.src) === false) {
            dst_stack.push(move.src);
        }
        else {
            for (const card of move.src) {
                dst_stack.push(card);
            }
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
    const rev = { src: move.dst, src_idx: move.dst_idx, dst: move.src, dst_idx: move.src_idx };
    execute(rev, game);
}
function solve(game) {
    // test for victory
    let success = check_success(game);
    if (success === true) {
        // stop
    }
    let valid_moves = get_valid_moves(game);
    // need to check moves to make sure we dont end up in a loop, moving freecell card back and forth for example!!!
    for (const move of valid_moves) {
        execute(move, game);
        solve(game);
    }
}
const game = {
    stacks: [],
    freecell: null
};
game.stacks = create_stacks(DATA_SUCCESS);
console.log(check_success(game));
print_game(game);
