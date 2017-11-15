import {CavemanPlayer} from '../objects/CavemanPlayer';

export class GamePlayState extends Phaser.State {

    private player: CavemanPlayer;

    public constructor() {
        super();
    }

    public create() {
        this.player = new CavemanPlayer(this.game, 100, this.game.height - 100);
        this.game.add.existing(this.player);

        this.game.camera.follow(this.player);
    }
}