import * as Assets from '../assets';
import {TypeState} from 'typestate';
import {GlobalGameObjects} from './GlobalGameObjects';

enum PlayerState {
    IDLE,
    WALK,
    MOUSE_WALK,
    ROLL,
    PICKUP,
    ATTACK
}

const PLAYER_WALKING_SPEED: number = 200;
const PLAYER_RUNNING_SPEED: number = 300;
const ANIMATION_WALKING_SPEED: number = 10;

export class CavemanPlayer extends Phaser.Sprite {

    private cursors: Phaser.CursorKeys;
    private speed: number = PLAYER_WALKING_SPEED;

    private fsm: any;
    private rollAnimation: Phaser.Animation;
    private pickupAnimation: Phaser.Animation;
    private attackAnimation: Phaser.Animation;

    private ctrlKey: Phaser.Key; // for running
    private altKey: Phaser.Key; // for rolling
    private spaceKey: Phaser.Key; // for attacking
    private zKey: Phaser.Key; // for interaction (talking / picking items up)

    private isTapped: boolean;
    private mouseX: number;
    private mouseY: number;

    public constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, Assets.Spritesheets.SpritesheetsEggShell1077137.getName(), 0);

        this.anchor.setTo(0.5);
        this.health = this.maxHealth = 128;
        this.alive = true;

        this.fsm = new TypeState.FiniteStateMachine<PlayerState>(PlayerState.IDLE);
        this.fsm.from(PlayerState.IDLE).to(PlayerState.WALK);
        this.fsm.from(PlayerState.IDLE).to(PlayerState.PICKUP);
        this.fsm.from(PlayerState.IDLE).to(PlayerState.ATTACK);
        this.fsm.from(PlayerState.PICKUP).to(PlayerState.IDLE);
        this.fsm.from(PlayerState.ATTACK).to(PlayerState.IDLE);
        this.fsm.from(PlayerState.PICKUP).to(PlayerState.WALK);
        this.fsm.from(PlayerState.ATTACK).to(PlayerState.WALK);
        this.fsm.from(PlayerState.PICKUP).to(PlayerState.MOUSE_WALK);
        this.fsm.from(PlayerState.ATTACK).to(PlayerState.MOUSE_WALK);
        this.fsm.from(PlayerState.WALK).to(PlayerState.IDLE);
        this.fsm.from(PlayerState.WALK).to(PlayerState.PICKUP);
        this.fsm.from(PlayerState.WALK).to(PlayerState.ATTACK);
        this.fsm.from(PlayerState.IDLE).to(PlayerState.MOUSE_WALK);
        this.fsm.from(PlayerState.MOUSE_WALK).to(PlayerState.IDLE);
        this.fsm.from(PlayerState.MOUSE_WALK).to(PlayerState.PICKUP);
        this.fsm.from(PlayerState.MOUSE_WALK).to(PlayerState.ATTACK);
        this.fsm.from(PlayerState.WALK).to(PlayerState.MOUSE_WALK);
        this.fsm.from(PlayerState.MOUSE_WALK).to(PlayerState.WALK);
        this.fsm.from(PlayerState.WALK).to(PlayerState.ROLL);
        this.fsm.from(PlayerState.MOUSE_WALK).to(PlayerState.ROLL);
        this.fsm.from(PlayerState.ROLL).to(PlayerState.WALK);
        this.fsm.from(PlayerState.ROLL).to(PlayerState.MOUSE_WALK);
        this.fsm.from(PlayerState.ROLL).to(PlayerState.IDLE);

        this.animations.add('idle', [0, 1, 2, 3, 4, 5], ANIMATION_WALKING_SPEED, true);
        this.animations.add('move', [5, 6, 7, 8, 9, 10], ANIMATION_WALKING_SPEED, true);
        this.rollAnimation = this.animations.add('roll', [17, 18, 19, 20, 21], ANIMATION_WALKING_SPEED, false);
        this.pickupAnimation = this.animations.add('pickup', [21, 0], 5, false);
        this.attackAnimation = this.animations.add('attack', [22, 23, 24, 25, 0], ANIMATION_WALKING_SPEED, false);
        this.animations.play('idle');

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.ctrlKey = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        this.altKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ALT);
        this.altKey.onDown.add(this.rollAttack, this);
        this.zKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.zKey.onDown.add(this.doAction, this);
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.doAttack, this);

        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.collideWorldBounds = true;
    }

    public update() {

        this.game.input.update();

        if (this.fsm.is(PlayerState.ROLL)) {
            if (this.rollAnimation.isFinished) {
                this.body.velocity.setTo(0, 0);
                this.fsm.go(PlayerState.IDLE);
            } else {
                return;
            }
        }

        if (this.fsm.is(PlayerState.PICKUP)) {
            if (this.pickupAnimation.isFinished) {
                this.fsm.go(PlayerState.IDLE);
            } else {
                return;
            }
        }

        if (this.fsm.is(PlayerState.ATTACK)) {
            if (this.attackAnimation.isFinished) {
                this.fsm.go(PlayerState.IDLE);
            } else {
                return;
            }
        }

        if (!this.isTapped) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }

        this.mobileUpdate();
        this.desktopUpdate();

        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            if (this.fsm.canGo(PlayerState.IDLE)) {
                this.fsm.go(PlayerState.IDLE);
                this.animations.play('idle', ANIMATION_WALKING_SPEED);
            }
        }
    }

    private mobileUpdate() {

        this.game.input.onTap.add(this.onTap, this);

        if (this.game.input.activePointer.isDown) {
            this.isTapped = false;
            this.processMouseOrTouch();
        }

        if (Phaser.Rectangle.contains(this.body, this.mouseX, this.mouseY)) {
            if (this.fsm.canGo(PlayerState.IDLE)) {
                this.fsm.go(PlayerState.IDLE);
                this.body.velocity.setTo(0, 0);
            }
        }
    }
    private desktopUpdate() {

        if (this.ctrlKey.isDown) {
            this.speed = PLAYER_RUNNING_SPEED;
        } else {
            this.speed = PLAYER_WALKING_SPEED;
        }

        if (this.cursors.up.isDown) {
            this.isTapped = false;
            if (!this.fsm.is(PlayerState.WALK)) {
                this.fsm.go(PlayerState.WALK);
            }
            this.animations.play('move');
            this.body.velocity.y = -this.speed;
        }
        if (this.cursors.down.isDown) {
            this.isTapped = false;
            if (!this.fsm.is(PlayerState.WALK)) {
                this.fsm.go(PlayerState.WALK);
            }
            this.animations.play('move');
            this.body.velocity.y = this.speed;
        }
        if (this.cursors.left.isDown) {
            this.isTapped = false;
            this.scale.setTo(-1, 1);
            if (!this.fsm.is(PlayerState.WALK)) {
                this.fsm.go(PlayerState.WALK);
            }
            this.animations.play('move');
            this.body.velocity.x = -this.speed;
        }
        if (this.cursors.right.isDown) {
            this.isTapped = false;
            this.scale.setTo(1, 1);
            if (!this.fsm.is(PlayerState.WALK)) {
                this.fsm.go(PlayerState.WALK);
            }
            this.animations.play('move');
            this.body.velocity.x = this.speed;
        }
    }

    private onTap(pointer: Phaser.Pointer, doubleTap: boolean) {
        this.isTapped = true;
        this.processMouseOrTouch();

        if (doubleTap) {
            this.rollAttack();
        }
    }

    private rollAttack() {
        this.isTapped = false;
        if (this.fsm.canGo(PlayerState.ROLL)) {
            this.fsm.go(PlayerState.ROLL);
            this.animations.play('roll');
        }
    }

    private doAction() {
        this.isTapped = false;
        if (this.fsm.canGo(PlayerState.PICKUP)) {
            this.fsm.go(PlayerState.PICKUP);
            this.body.velocity.setTo(0, 0);
            this.animations.play('pickup');
        }
        this.game.physics.arcade.overlap(this, GlobalGameObjects.collectibles, this.collect, null, this);
    }

    private doAttack() {
        this.isTapped = false;
        if (this.fsm.canGo(PlayerState.ATTACK)) {
            this.fsm.go(PlayerState.ATTACK);
            this.body.velocity.setTo(0, 0);
            this.animations.play('attack');
        }
    }

    private collect(player, collectible) {
        console.log(player + ' collect ' + collectible);
    }

    private processMouseOrTouch() {
        if (!this.fsm.is(PlayerState.MOUSE_WALK)) {
            this.fsm.go(PlayerState.MOUSE_WALK);
        }
        this.mouseX = this.game.input.x;
        this.mouseY = this.game.input.y;

        if (this.x > this.mouseX) {
            this.scale.setTo(-1, 1);
        }
        if (this.x < this.mouseX) {
            this.scale.setTo(1, 1);
        }

        this.animations.play('move');
        this.game.physics.arcade.moveToPointer(this, this.speed);
    }
}