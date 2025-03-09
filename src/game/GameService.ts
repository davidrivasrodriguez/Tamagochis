import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room, RoomConfig } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates, Messages } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService";

export class GameService {
  private games: Game[];

  private static instance: GameService;
  private constructor() {
    this.games = [];
  }

  static getInstance(): GameService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new GameService();
    return this.instance;
  }

  public buildPlayer(socket: Socket): Player {
    return {
      id: socket.id,
      socket: socket,
      name: socket.data.playerName,
      x: 0,
      y: 0,
      state: PlayerStates.Idle,
      direction: Directions.Right,
      visibility: true,
    };
  }

  public updatePlayerPosition(
    playerId: string,
    roomName: string,
    updates: any
  ): boolean {
    const room = RoomService.getInstance().findRoomByName(roomName);
    if (!room) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return false;

    if (updates.action === "ROTATE") {
      const directions = ["UP", "RIGHT", "DOWN", "LEFT"];
      const currentIndex = directions.indexOf(player.direction);
      const newIndex = (currentIndex + 1) % directions.length;
      player.direction = directions[newIndex];
    } else if (updates.action === "FORWARD") {
      let newX = player.x;
      let newY = player.y;

      const board = room.game?.board;
      const boardSize = board?.size || 10;
      const maxX = boardSize - 1;
      const maxY = boardSize - 1;

      switch (player.direction) {
        case "UP":
          newY = player.y - 1;
          break;
        case "RIGHT":
          newX = player.x + 1;
          break;
        case "DOWN":
          newY = player.y + 1;
          break;
        case "LEFT":
          newX = player.x - 1;
          break;
      }

      if (newX >= 0 && newX <= maxX && newY >= 0 && newY <= maxY) {
        player.x = newX;
        player.y = newY;
      }
    } else if (updates.direction) {
      player.direction = updates.direction;
    }

    const isPlayerInBush = room.game?.board.elements.some(
      (element) =>
        element.x === player.x && element.y === player.y && element.bush
    );
    if (isPlayerInBush) {
      player.visibility = false;
    } else {
      player.visibility = true;
    }

    ServerService.getInstance().sendMessage(
      roomName,
      Messages.UPDATE_POSITIONS,
      {
        players: [
          {
            id: player.id,
            x: player.x,
            y: player.y,
            direction: player.direction,
            visibility: player.visibility,
          },
        ],
      }
    );

    return true;
  }

  public shoot(
    shooterId: string,
    shootedId: string,
    roomName: string
  ): boolean {
    console.log("Shoot in GameService", shooterId, shootedId, roomName);

    ServerService.getInstance().sendMessage(roomName, Messages.SHOOT, {});
    return true;
  }

  // public addPlayer(player: Player): boolean {
  //     const room: Room = RoomService.getInstance().addPlayer(player);
  //     //ServerService.getInstance().sendMessage(room.name,ServerService.messages.out.new_player,"new player");
  //     ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, 'new_Player');
  //     const genRanHex = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  //     if (room.players.length == 2) {
  //         const game: Game = {
  //             id: "game" + genRanHex(128),
  //             state: GameStates.WAITING,
  //             room: room,
  //             board: new BoardBuilder().getBoard()
  //         }
  //         room.game = game;
  //         this.games.push(game);
  //     }

  //     if (room.occupied) {
  //         if (room.game) {
  //             room.game.state = GameStates.PLAYING;
  //             if (ServerService.getInstance().isActive()) {
  //                 ServerService.getInstance().sendMessage(room.name, Messages.BOARD, room.game.board);
  //             }
  //         }
  //         return true;
  //     }

  //     return false;
  // }

  public addPlayer(player: Player): boolean {
    const room: Room = RoomService.getInstance().addPlayer(player);
    const genRanHex = (size: Number) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");

    if (room.players.length === 1) {
      const game: Game = {
        id: "game" + genRanHex(128),
        state: GameStates.WAITING,
        room: room,
        board: new BoardBuilder().getBoard(),
      };
      room.game = game;
      this.games.push(game);
    }

    const boardSize = room.game!.board.size;
    const maxX = boardSize - 1;
    const maxY = boardSize - 1;

    const corners = [
      { x: 0, y: 0 },
      { x: maxX, y: maxY },
      { x: maxX, y: 0 },
      { x: 0, y: maxY },
    ];
    const takenCorners = room.players
      .filter((p) => p.id !== player.id)
      .map((p) => ({ x: p.x, y: p.y }));
    const availableCorners = corners.filter(
      (corner) =>
        !takenCorners.some(
          (taken) => taken.x === corner.x && taken.y === corner.y
        )
    );

    const randomIndex = Math.floor(Math.random() * availableCorners.length);
    player.x = availableCorners[randomIndex].x;
    player.y = availableCorners[randomIndex].y;

    ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, {
      id: player.id,
      x: player.x,
      y: player.y,
      direction: player.direction,
      visibility: player.visibility,
    });

    if (room.players.length === RoomConfig.maxRoomPlayers) {
      if (room.game) {
        room.game.state = GameStates.PLAYING;
        ServerService.getInstance().sendMessage(
          room.name,
          Messages.BOARD,
          room.game.board
        );
      }
    }

    room.players.forEach((existingPlayer) => {
      if (existingPlayer !== player) {
        player.socket.emit("message", {
          type: Messages.NEW_PLAYER,
          content: {
            id: existingPlayer.id,
            x: existingPlayer.x,
            y: existingPlayer.y,
            direction: existingPlayer.direction,
          },
        });
      }
    });

    return room.occupied;
  }

  public getPlayersForRoom(roomName: string): Player[] {
    const room = RoomService.getInstance().findRoomByName(roomName);
    // console.log("Room:", room);
    if (!room) return [];

    return room.players;
  }
}
