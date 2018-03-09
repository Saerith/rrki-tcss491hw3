define([
    "asset-manager",
    "entity"
], function (
    AssetManager,
    Entity
){

     /***************
    GameEngine class
    ****************/
    class GameEngine {

        constructor () {
            this.entities = [];
            this.ctx = null;
            this.click = null;
            this.mouse = null;
            this.wheel = null;
            this.surfaceWidth = null;
            this.surfaceHeight = null;
            this.gameTime = 0;
            this.spawnTime = 1;
            this.mouseDown = false;

            this.cursor = {x:0,y:0};
            this.bubbleRadius = 30;
            this.numBubblesToSpawn = 3;
        }

        /*
        Initializes the game engine
        */
        init (ctx) {
            this.ctx = ctx;
            this.pause = false;
            this.surfaceWidth = this.ctx.canvas.width;
            this.surfaceHeight = this.ctx.canvas.height;
            this.startInput();

            console.log('game initialized');
        }

        /*
        Starts the game engine
        */
        start () {
            console.log("starting game");
            let that = this;
            (function gameLoop() {
                that.loop();
                requestAnimFrame(gameLoop, that.ctx.canvas);
            })();
        }


        /*
        Input handling, initializes listeners
        */
        startInput () {
            console.log('Starting input');

            this.ctx.canvas.tabIndex = 0;;

            let getXandY = function (e) {
                let x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
                let y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

                if (x < 1024) {
                    x = Math.floor(x / 32);
                    y = Math.floor(y / 32);
                }

                return { x: x, y: y };
            }

            let that = this;

            // control event listeners go here
            let map = {};

            this.ctx.canvas.addEventListener("mousemove", function (e) {
                // e.preventDefault();
                that.cursor = that.getCursorPos(e);
                // console.log(`${e.code} is ${that.controls[e.code].active}`);

            }, false);

            this.ctx.canvas.addEventListener("mousedown", function (e) {
                that.mouseDown = true;
            }, false);

            this.ctx.canvas.addEventListener("mouseup", function (e) {
                that.mouseDown = false;
            }, false);

            this.ctx.canvas.addEventListener("keypress", function (e) {
                if (String.fromCharCode(e.which) === ' ') that.pause = !that.pause;
                e.preventDefault();
            }, false);

            console.log('Input started');
        }

        getCursorPos(e) {
            let rect = this.ctx.canvas.getBoundingClientRect();
            return {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            }
        }

        /*
        Adds an entity to the game
        */
        addEntity (entity) {
            this.entities.push(entity);
        }

        addBackgroundLayer (layer) {
            this.backgroundLayers.push(layer);
        }


        /*
        Draws all entities in the list
        */
        draw (drawCallback) {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.save();

            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(this.ctx);
            }
            
            if (drawCallback) {
                drawCallback(this);
            }

            this.ctx.restore();
        }


        /*
        Updates all entities, calls their update methods
        */
        update () {
            let entitiesCount = this.entities.length;
            let that = this;

            // remove if marked for removal and update
            for (let i = 0; i < entitiesCount; i++) {
                let entity = this.entities[i];
                if (!entity.removeFromWorld) {
                    entity.update();
                }
            }

            // splice after removal
            for (let i = this.entities.length - 1; i >= 0; --i) {
                if (this.entities[i].removeFromWorld) {
                    this.entities.splice(i, 1);
                }
            }

            // check for collision between ALL entities
            for (let i = 0; i < this.entities.length; i++) {
                let entity = this.entities[i];
                for (let j = 0; j < this.entities.length; j++) {
                    let other = this.entities[j];
                    if (entity != other && entity.isColliding(other)) {
                        entity.collided(other);
                    }
                }
                
            }

            // spawn more bubbles
            if (this.mouseDown) {
                for (let i = 0; i < this.numBubblesToSpawn; i++) {
                    if (this.gameTime % this.spawnTime == 0) {
                        this.addEntity(new Entity.Bubble(that, that.cursor.x, that.cursor.y));
                    }
                }
            }
            
        }


        /*
        Defines the game loop
        */
        loop () {
            this.ctx.width = window.innerWidth;
            this.ctx.height = window.innerHeight;
            if (!this.pause) {
                this.gameTime += 1;
                this.update();
            }
            this.draw();
        }

    } // end of GameEngine
    
    return GameEngine;

});