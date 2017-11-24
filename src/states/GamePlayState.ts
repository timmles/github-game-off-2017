import {CavemanPlayer} from '../objects/CavemanPlayer';
import {Cobblestone} from '../objects/items/Cobblestone';
import {Flint} from '../objects/items/Flint';
import {Item} from '../objects/items/Item';
import {GlobalGameObjects} from '../objects/GlobalGameObjects';
import {Images, JSON} from '../assets';
import TilemapsHome = JSON.TilemapsHome;
import TilemapsGrass = Images.TilemapsGrass;
import TilemapsWatergrass = Images.TilemapsWatergrass;
import TilemapsForestTiles = Images.TilemapsForestTiles;
import TilemapsWater = Images.TilemapsWater;
import TilemapsRock = Images.TilemapsRock;
import * as Assets from '../assets';

export class GamePlayState extends Phaser.State {

    private player: CavemanPlayer;
    private collectibles: Phaser.Group;

    private bar_sprite: Phaser.TileSprite;

    public constructor() {
        super();
    }

    public create() {
        this.createMap();

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

        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);

        // health bar
        let health: Phaser.Sprite = this.game.add.sprite(60, 20, Assets.Images.ImagesHudHealthBarBackgound.getName());
        health.addChild(this.game.make.sprite(-12, -10, Assets.Images.ImagesHudHealthBarTop.getName()));
        health.fixedToCamera = true;

        this.bar_sprite = new Phaser.TileSprite(this.game, 0, 0, health.width, health.height, Assets.Images.ImagesHudBarMiddle.getName());
        health.addChild(this.bar_sprite);

        console.log(JSON.stringify(this.player.health));
        console.log(health.width);
    }

    public update() {
        this.bar_sprite.width = this.player.health;
    }

    private createMap() {
        let map = this.game.add.tilemap(TilemapsHome.getName(), 32, 32, 64, 64);
        map.addTilesetImage(TilemapsGrass.getName(), TilemapsGrass.getName());
        map.addTilesetImage(TilemapsWatergrass.getName(), TilemapsWatergrass.getName());
        map.addTilesetImage(TilemapsForestTiles.getName(), TilemapsForestTiles.getName());
        map.addTilesetImage(TilemapsWater.getName(), TilemapsWater.getName());
        map.addTilesetImage(TilemapsRock.getName(), TilemapsRock.getName());

        map.createLayer('Grass').resizeWorld();
        map.createLayer('Water');
        map.createLayer('Trees');
    }
}