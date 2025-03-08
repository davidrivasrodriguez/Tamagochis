import { ConnectionHandler } from "./services/ConnectionHandler.js";
import { GameService } from "./services/GameService.js";

export class GameController {
    #states = {
        RIGHT: 0,
        BAD: 1,
    };
    #state = null;
    #gameService = null;

    constructor(url, ui) {
        ui.initUI();
        this.#gameService = new GameService(ui);
        this.gameService = this.#gameService;
        ui.setGameService(this.#gameService);
        
        ConnectionHandler.init(url, this, () => {
            this.#state = this.#states.RIGHT;
        }, () => {
            this.#state = this.#states.BAD;
        });
    }

    actionController(payload) {
        if (this.#state === this.#states.RIGHT)
            this.#gameService.do(payload);
    }
}