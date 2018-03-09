define([
    "animation",
],function(
    Animation,
){

    /***********
    Entity class

    game - a reference to the game in which this entity exists
    x, y - entity's coordinates
    removeFromWorld - a flag that denotes when to remove this entity from the game
    ************/
    class Entity {

        constructor (game, x, y) {
            this.name = this.constructor.name;
            this.game = game;

            this.x = x;
            this.y = y;

            this.yVel = 0;
            this.xVel = 0;

            this.xAccel = 0;
            this.yAccel = 0;

            this.terminalVel = 10;

            this.removeFromWorld = false;

            // used for simple rect hitbox
            this.boundX = null;
            this.boundY = null;
            this.lastBoundY = null;
            this.boundWidth = null;
            this.boundHeight = null;
        }


        update () { 

        }


        draw (ctx) {
            if (this.game.showOutlines && this.boundX) {
                drawOutline(ctx);
            }
            if (this.img) {
                this.animation.drawFrame(this.clockTick, ctx, this.x, this.y, true);
            }
        }


        /*
        Collision detection, rectangle
        */
        isColliding(other) {
            let rect1 = {
                "x" : this.boundX,
                "y" : this.boundY,
                "lastY" : this.lastBoundY,
                "width" : this.boundWidth,
                "height": this.boundHeight
            }

            let rect2 = {
                "x" : other.boundX,
                "y" : other.boundY,
                "width" : other.boundWidth,
                "height": other.boundHeight
            }
            
            // This is the same as Mariott's method, just formatted differently
            let collision = 'none';
            var dx = (rect1.x + rect1.width/2) - (rect2.x + rect2.width/2);
            var dy = (rect1.y + rect1.height/2) - (rect2.y + rect2.height/2);
            var lastdy = (rect1.lastY + rect1.height/2) - (rect2.y + rect2.height/2);
            var width = (rect1.width + rect2.width) / 2;
            var height = (rect1.height + rect2.height) / 2;
            var crossWidth = width * dy;
            var lastCrossWidth = width * lastdy;
            var crossHeight = height * dx;
            
            if(Math.abs(dx) <= width && Math.abs(dy) <= height) {

                if (crossWidth > crossHeight && lastCrossWidth > crossHeight) {
                    (crossWidth < -(crossHeight)) && 
                    lastCrossWidth < -(crossHeight) ? collision = 'right' : collision = 'top';

                } else {
                    crossWidth > (-crossHeight) && 
                    lastCrossWidth > (-crossHeight) ? collision = 'left' : collision = 'bottom';
                }

            }
        return collision;
        }

        collided(other, direction) {
        }
    } // end of Entity class


    /*
        A bubble that shrinks over time and eventually pops
    */
    class Bubble extends Entity {

        constructor(game, x, y) {
            super(game, x, y)
            this.name = "bubble";
            this.game = game;
            this.shrinkTime = 50;
            this.gravity = .6;

            let maxDistanceFromCursor = 50;
            let xPosNeg = Math.random() < 0.5 ? -1 : 1;
            let yPosNeg = Math.random() < 0.5 ? -1 : 1;

            this.x = x + xPosNeg*(Math.random()*maxDistanceFromCursor);
            this.y = y + yPosNeg*(Math.random()*maxDistanceFromCursor); 
            this.radius = Math.floor(Math.random() * 20) + 10;
            this.rgb = [Math.floor(Math.random() * 200) + 55,
            Math.floor(Math.random() * 200) + 55, 
            Math.floor(Math.random() * 200) + 55];
            this.mass = this.radius;

            // bubble pops at it's min size of 1-10, and can shrink by up to that much each update
            this.minSize = Math.random() * 10 + 1;
            // this.shrink = Math.floor(Math.random() * this.minSize) + 1;
            this.shrink = 1;
            this.removeFromWorld = false;
        }

        
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
            ctx.strokeStyle = "rgb(" + this.rgb[0] + "," + this.rgb[1] + "," + this.rgb[2] + ")";
            ctx.stroke();
            ctx.closePath();
        }


        update() {
            // bubbles get smaller over time
            if (this.game.gameTime % this.shrinkTime == 0) {
                this.radius -= this.shrink;
                this.radius = Math.max(this.radius, 0);
            }

            this.terminalVel = this.radius/3;
            this.mass = this.radius;

            this.yVel += this.gravity*this.gravity;

            if (Math.abs(this.yVel) > this.terminalVel) {
                if (this.yVel > 0) {
                    this.yVel = Math.min(this.yVel, this.terminalVel);
                } else {
                    this.yVel = Math.max(this.yVel, -1 * this.terminalVel);
                }
            }
            
            if (Math.abs(this.xVel) > this.terminalVel) {
                if (this.xVel > 0 ) {
                    this.xVel = Math.min(this.xVel, this.terminalVel);
                } else {
                    this.xVel = Math.max(this.xVel, -1 * this.terminalVel);
                }
            }
            
            this.y += this.yVel;
            this.x += this.xVel;
            // and pop if they're too small
            if (this.radius <= this.shrink) {
                this.removeFromWorld = true;
            }
        }


        isColliding(other) {
            if (other.name === "bubble") {
                let dx = this.x - other.x;
                let dy = this.y - other.y;
                let distance = Math.sqrt(dx*dx + dy*dy);

                if (distance < (this.radius + other.radius)) {  
                    return true;
                }
            } 

            // does not handle corner cases
            else if (other.name === "terrain") {
                let top = other.y
                let bottom = other.y + other.height
                let left = other.x
                let right = other.x + other.width

                let topLeft = [other.x, other.y];
                let topRight = [other.x + other.width, other.y];
                let bottomleft = [other.x, other.y + other.height];
                let bottomRight = [other.x + other.width, other.y + other.height]; 

                if ( 
                ((this.x+this.radius >= left && this.x < left) || (this.x-this.radius <= right && this.x > right)) 
                || 
                ((this.y+this.radius >= top && this.y < top) || (this.y-this.radius <= bottom && this.y > bottom))
                ) {
                    return true;    
                } 
            }

            else { return false; }
        }


        collided(other) {
            if (other.name === "bubble") {
                let dx = this.x - other.x;
                let dy = this.y - other.y;
                let distance = Math.sqrt(dx*dx + dy*dy);

                let ratio = this.mass/(this.mass + other.mass)

                this.xVel += (1-ratio) * dx;
                this.yVel += (1-ratio) * dy;

                // this.xVel += (1-ratio) * other.xVel;
                // this.yVel += (1-ratio) * other.yVel;

                this.color 
            }

            if (other.name === "terrain") {
                let top = other.y
                let bottom = other.y + other.height
                let left = other.x
                let right = other.x + other.width

                if (this.x-this.radius >= left && this.x+this.radius <= right) {
                    // floor
                    if (this.y+this.radius >= top && this.y < top) {
                        this.yVel = -1 * this.yVel;
                        this.y = top - this.radius;
                    }

                    // ceiling
                    else if (this.y-this.radius <= bottom && this.y > bottom) {
                        this.yVel = -1 * this.yVel;
                        this.y = bottom + this.radius;
                    }
                }

                else if (this.y-this.radius >= top && this.y+this.radius <= bottom) {
                    // left
                    if (this.x+this.radius >= left && this.x < left) {
                        this.xVel = -1 * this.xVel;
                        this.x = left - this.radius;
                    }

                    // right
                    if (this.x-this.radius <= right && this.x > right) {
                        this.xVel = -1 * this.xVel;
                        this.x = right + this.radius;
                    }
                }
            }
        }

    }


    class Terrain extends Entity {

        constructor(game, x, y, width, height) {
            super(game, x, y);
            this.name = "terrain";
            this.width = width;
            this.height = height;
        }


        draw(ctx) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fill();
            ctx.closePath();
        }

        update() {}
        isColliding() {}
        collided() {}
    }

    return {
        "Entity": Entity,
        "Bubble": Bubble,
        "Terrain": Terrain
    };
});
