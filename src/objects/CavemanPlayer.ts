import * as Assets from '../assets';
import {TypeState} from 'typestate';

enum PlayerState {
    IDLE,
    WALKING,
    RUNNING,
    ROLLING
}

const PLAYER_WALKING_SPEED: number = 200;
const PLAYER_RUNNING_SPEED: number = 320;
const ANIMATION_WALKING_SPEED: number = 10;
const ANIMATION_RUNNING_SPEED: number = 16;

export class CavemanPlayer extends Phaser.Sprite {

    private cursors: Phaser.CursorKeys;
    private speed: number = PLAYER_WALKING_SPEED;
    private animationFrameRate: number = ANIMATION_WALKING_SPEED;

    private fsm: any;
    private rollAnimation: Phaser.Animation;

    private ctrlKey: Phaser.Key; // for running
    private altKey: Phaser.Key; // for rolling

    public constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, Assets.Spritesheets.SpritesheetsEggShell1077137.getName(), 0);

        this.anchor.set(0.5, 0.5);

        this.fsm = new TypeState.FiniteStateMachine<PlayerState>(PlayerState.IDLE);
        this.fsm.from(PlayerState.IDLE).to(PlayerState.WALKING);
        this.fsm.from(PlayerState.WALKING).to(PlayerState.IDLE);
        this.fsm.from(PlayerState.IDLE).to(PlayerState.RUNNING);
        this.fsm.from(PlayerState.RUNNING).to(PlayerState.IDLE);
        this.fsm.from(PlayerState.WALKING).to(PlayerState.RUNNING);
        this.fsm.from(PlayerState.RUNNING).to(PlayerState.WALKING);
        this.fsm.from(PlayerState.WALKING).to(PlayerState.ROLLING);
        this.fsm.from(PlayerState.RUNNING).to(PlayerState.ROLLING);
        this.fsm.from(PlayerState.ROLLING).to(PlayerState.WALKING);
        this.fsm.from(PlayerState.ROLLING).to(PlayerState.RUNNING);
        this.fsm.from(PlayerState.ROLLING).to(PlayerState.IDLE);

        this.animations.add('idle', [0, 1, 2, 3, 4, 5]);
        this.animations.add('move', [5, 6, 7, 8, 9, 10]);
        this.rollAnimation = this.animations.add('roll', [17, 18, 19, 20, 21]);
        this.animations.play('idle', ANIMATION_WALKING_SPEED);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.ctrlKey = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        this.altKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ALT);
        this.altKey.onDown.add(this.rollAttack, this);

        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.collideWorldBounds = true;
    }

    public update() {
        if (this.fsm.is(PlayerState.ROLLING)) {
            if (this.rollAnimation.isFinished) {
                this.fsm.go(PlayerState.IDLE);
            } else {
                return;
            }
        }

        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        this.game.input.update();

        if (this.ctrlKey.isDown) {
            this.speed = PLAYER_RUNNING_SPEED;
            this.animationFrameRate = ANIMATION_RUNNING_SPEED;
        } else {
            this.speed = PLAYER_WALKING_SPEED;
            this.animationFrameRate = ANIMATION_WALKING_SPEED;
        }

        if (this.cursors.up.isDown) {
            if (!this.fsm.is(PlayerState.WALKING)) {
                this.fsm.go(PlayerState.WALKING);
            }
            this.animations.play('move', this.animationFrameRate);
            this.body.velocity.y = -this.speed;
        }
        if (this.cursors.down.isDown) {
            if (!this.fsm.is(PlayerState.WALKING)) {
                this.fsm.go(PlayerState.WALKING);
            }
            this.animations.play('move', this.animationFrameRate);
            this.body.velocity.y = this.speed;
        }
        if (this.cursors.left.isDown) {
            this.scale.setTo(-1, 1);
            if (!this.fsm.is(PlayerState.WALKING)) {
                this.fsm.go(PlayerState.WALKING);
            }
            this.animations.play('move', this.animationFrameRate);
            this.body.velocity.x = -this.speed;
        }
        if (this.cursors.right.isDown) {
            this.scale.setTo(1, 1);
            if (!this.fsm.is(PlayerState.WALKING)) {
                this.fsm.go(PlayerState.WALKING);
            }
            this.animations.play('move', this.animationFrameRate);
            this.body.velocity.x = this.speed;
        }

        if (this.cursors.up.isUp && this.cursors.down.isUp && this.cursors.left.isUp && this.cursors.right.isUp) {
            if (this.fsm.canGo(PlayerState.IDLE)) {
                this.fsm.go(PlayerState.IDLE);
                this.animations.play('idle', ANIMATION_WALKING_SPEED);
            }
        }
    }

    private rollAttack() {
        if (this.fsm.canGo(PlayerState.ROLLING)) {

            this.fsm.go(PlayerState.ROLLING);
            this.animations.play('roll', ANIMATION_WALKING_SPEED, false);
        }
    }
}