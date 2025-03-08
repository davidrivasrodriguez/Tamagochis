import { Board } from "../entities/Board.js";
import { Queue } from "../Queue.js";
import { RoomConfig } from "../entities/Board.js";
import { ConnectionHandler } from "./ConnectionHandler.js";

export class GameService {
    #states = {
        WAITING: 'WAITING',
        PLAYING: 'PLAYING',
        ENDED: 'ENDED'
    };
    #ui = null;
    #players = [];
    #board = null;
    #queue = null;
    #state = null;
    #parallel = null;

    #actionsList = {
        "NEW_PLAYER": this.do_newPlayer.bind(this),
        "BOARD": this.do_newBoard.bind(this),
        "MOVE": this.do_move.bind(this),
        "UPDATE_POSITIONS": this.do_updatePositions.bind(this),
        "SHOOT": this.do_shoot.bind(this)
    };

    constructor(ui) {
        this.#state = this.#states.WAITING;
        this.#board = new Board();
        this.#queue = new Queue();
        this.#parallel = null;
        this.checkScheduler();
        this.#ui = ui;
    }

    checkScheduler() {
        if (!this.#queue.isEmpty()) {
            if (this.#parallel == null) {
                this.#parallel = setInterval(
                    async () => {
                        const action = this.#queue.getMessage();
                        if (action != undefined) {
                            await this.#actionsList[action.type](action.content);
                        } else {
                            this.stopScheduler();
                        }
                    }
                );
            }
        }
    }

    stopScheduler() {
        clearInterval(this.#parallel);
        this.#parallel = null;
    }

    do(data) {
        this.#queue.addMessage(data);
        this.checkScheduler();
    };

    // async do_newPlayer(payload) {
    //     console.log("ha llegado un jugador nuevo");
    //     this.#players.push(payload);
    //     if (this.#players.length == 2) {
    //         this.#ui.drawPlayer(this.#players);
    //     }

    // };

    // async do_newBoard(payload) {
    //     this.#board.build(payload);
    //     this.#ui.drawBoard(this.#board.map);
    // }

    async do_newPlayer(payload) {
        console.log("Received new player:", payload);
        console.log("Content:", payload.content);

        const playerData = payload.content || payload;
        const existingPlayer = this.#players.find(p => p.id === playerData.id);

        if (!existingPlayer) {
            const player = {
                id: playerData.id,
                name: ConnectionHandler.playerName,
                x: playerData.x,
                y: playerData.y,
                direction: playerData.direction,
            };
            this.#players.push(player);
            console.log("Players after adding new one:", this.#players);

            if (this.#board) {
                console.log("Drawing board and players...");
                this.#ui.drawBoard(this.#board);
                this.#ui.drawPlayer(this.#board, this.#players);
            }
        }
    }

    async do_newBoard(payload) {
        this.#board = payload;
        console.log("Processed board data:", this.#board);

        this.#ui.drawBoard(this.#board);

        if (this.#players.length > 0) {
            console.log("Drawing players on new board:", this.#players);
            this.#ui.drawPlayer(this.#board, this.#players);
            this.#ui.manageControllers();
        }
    }
    async do_move(payload) {
        if (this.#state === this.#states.PLAYING) {
            const player = this.findCurrentPlayer();
            if (player) {

                ConnectionHandler.socket.emit("message", {
                    type: "MOVE",
                    content: { playerId: player.id, action: payload.action }
                });

                // if (payload.action === 'ROTATE') {
                //     ConnectionHandler.socket.emit("message", {
                //         type: "ROTATE",
                //         content: { playerId: player.id, action: 'ROTATE' }
                //     });
                // } else if (payload.action === 'FORWARD') {
                //     ConnectionHandler.socket.emit("message", {
                //         type: "MOVE",
                //         content: { playerId: player.id, action: 'FORWARD' }
                //     });
                // }
            }
        }
    }


    async do_updatePositions(payload) {
        console.log("Updating positions:", payload);
        if (payload.players) {
            payload.players.forEach(updatedPlayer => {
                const existingPlayer = this.#players.find(p => p.id === updatedPlayer.id);
                if (existingPlayer) {
                    existingPlayer.prevDirection = existingPlayer.direction;
                    Object.assign(existingPlayer, updatedPlayer);
                }
            });
            this.#ui.drawPlayer(this.#board, this.#players);
        }
    }

    async do_shoot(payload) {
        console.log("Shooting action triggered");
        const player = this.findCurrentPlayer();
        if (player) {
            ConnectionHandler.socket.emit("message", {
                type: "SHOOT",
                content: { playerId: player.id }
            });
        }
    }

    findCurrentPlayer() {
        console.log("All players:", this.#players);
        console.log("Looking for name:", ConnectionHandler.playerName);
        const player = this.#players.find(player => player.name === ConnectionHandler.playerName);
        console.log("Found player:", player);
        return player;
    }

    async setState(state) {
        if (Object.values(this.#states).includes(state)) {
            this.#state = state;
            console.log(`Game state set to: ${state}`);
        }
    }

}