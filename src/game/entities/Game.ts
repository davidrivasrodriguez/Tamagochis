import { Room } from "../../room/entities/Room";
import { Board } from "./Board";

export enum GameStates {
    WAITING, PLAYING
}

export enum Messages {
    BOARD = "BOARD",
    NEW_PLAYER = "NEW_PLAYER",
    UPDATE_POSITIONS = "UPDATE_POSITIONS",
    SHOOT = "SHOOT",
}

export interface Game {
    id : String,
    state: GameStates,
    room: Room,
    board: Board
}