import {CavemanPlayer} from '../objects/CavemanPlayer';
import {Cobblestone} from '../objects/items/Cobblestone';
import {Flint} from '../objects/items/Flint';
import {Item} from '../objects/items/Item';
import {GlobalGameObjects} from '../objects/GlobalGameObjects';

export class GamePlayState extends Phaser.State {

    private player: CavemanPlayer;
    private collectibles: Phaser.Group;

    public constructor() {
        super();
    }

    public create() {

        // create items
        this.collectibles = this.game.add.group();
        this.collectibles.enableBody = true;
        this.collectibles.physicsBodyType = Phaser.Physics.ARCADE;

        let cobblestone: Item = this.game.add.existing(new Cobblestone(this.game, 200, 300));
        // cobblestone.body.immovable = true;
        // cobblestone.body.collideWorldBounds = true;
        this.collectibles.add(cobblestone);

        let flint: Item = this.game.add.existing(new Flint(this.game, 150, 250));
        // flint.body.immovable = true;
        // flint.body.collideWorldBounds = true;
        this.collectibles.add(flint);

        GlobalGameObjects.collectibles = this.collectibles;

        // create player
        this.player = new CavemanPlayer(this.game, 100, this.game.height - 100);
        this.game.add.existing(this.player);

        this.game.camera.follow(this.player);
    }
}