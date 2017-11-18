import * as Assets from '../../assets';
import {Item} from './Item';

export class Flint extends Item {

    public constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, Assets.Images.ImagesItemsFlint.getName());
        this.name = 'Flint';
        this.description = 'A flint rock';

        this.anchor.setTo(0.5);
    }
}