import { Board } from "./entities/Board";

export class BoardBuilder {
    private board: Board;
    
    constructor() {
        this.board = {
            size: 10,
            elements: [],
            maxBushes: 7
        }

        const maxX = this.board.size - 1;
        const maxY = this.board.size - 1;

        const corners = [
            {x: 0, y: 0},
            {x: maxX, y: 0},
            {x: 0, y: maxY},
            {x: maxX, y: maxY}
        ];

        let bushes = 0;
        while (bushes < this.board.maxBushes) {
            const x = Math.floor(Math.random() * this.board.size);
            const y = Math.floor(Math.random() * this.board.size);

            if (this.isValidBush(x, y, corners)) {
                this.board.elements.push({
                    x: x,
                    y: y,
                    occupied: false,
                    player: null,
                    bush: true
                });
                bushes++;
            }
        }


        // const map : Array<number[]> = [
        //     [0,0,0,0,0,0,0,0,0,0],
        //     [0,0,5,0,5,0,5,0,0,0],
        //     [0,5,0,0,0,0,0,0,0,0],
        //     [0,0,0,0,0,0,0,0,0,0],
        //     [0,0,0,0,0,0,5,0,0,0],
        //     [0,0,0,5,0,0,0,0,0,0],
        //     [0,0,0,0,0,0,0,0,5,0],
        //     [0,0,5,0,0,0,0,0,0,0],
        //     [0,0,0,0,0,0,0,5,0,0],
        //     [0,0,0,0,5,0,0,0,0,0]
        // ]
        // for(let i = 0; i < this.board.size; i++) {
        //     for(let j = 0; j < this.board.size; j++) {
        //         if(map[i][j] != 0) {
        //             this.board.elements.push({x : i, y : j, ocupied : false, player : null, bush : true});
        //         }
        //     }
        // }
        
    }

            
    private isValidBush(x: number, y: number, corners: {x: number, y: number}[]): boolean {
        if (corners.some(corner => corner.x === x && corner.y === y)) {
            return false;
        }

        if (this.board.elements.some(element => element.x === x && element.y === y)) {
            return false;
        }

        return !this.board.elements.some(element => 
            Math.abs(element.x - x) <= 1 && 
            Math.abs(element.y - y) <= 1
        );
    }

    public getBoard() : Board {
        return this.board;
    }
}