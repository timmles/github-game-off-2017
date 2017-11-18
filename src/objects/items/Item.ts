export class Item extends Phaser.Sprite {

    private _id: string;
    private _name: string;
    private _description: string;

    public constructor(game: Phaser.Game, x: number, y: number, sprite: string) {
        super(game, x, y, sprite);
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get description(): string {
        return this._description;
    }

    public set description(description: string) {
        this._description = description;
    }
}