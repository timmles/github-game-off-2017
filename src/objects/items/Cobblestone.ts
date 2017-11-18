import * as Assets from '../../assets';
import {Item} from './Item';

export class Cobblestone extends Item {

    public constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, Assets.Images.ImagesItemsCobblestone.getName());
        this.name = 'Cobblestone';
        this.description = 'An ordinary rock';

        this.anchor.setTo(0.5);
    }
}