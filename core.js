define([
    "asset-manager",
    "game-engine",
    "entity"
], function (
    AssetManager,
    GameEngine,
    Entity
) {



let init = function() {
        console.log("init")
    };

    toload = [
    ];


    let ASSET_MANAGER = new AssetManager(toload);
    let boundsWidth = 10;
    ASSET_MANAGER.downloadAll(function () {
        console.log("starting up da sheild");
        let canvas = document.getElementById('gameWorld');
        let ctx = canvas.getContext('2d');
        let gameEngine = new GameEngine();

        // floor
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            0, ctx.canvas.height - boundsWidth, 
            ctx.canvas.width, boundsWidth));

        // left wall
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            0, 0, 
            boundsWidth, ctx.canvas.height));

        // right wall
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            ctx.canvas.width - boundsWidth, 0, 
            boundsWidth, ctx.canvas.height));

        // ceiling
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            0, 0, 
            ctx.canvas.width, boundsWidth))

        // other platforms
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            0, ctx.canvas.height*.2, 
            ctx.canvas.width*.8, boundsWidth))

        // other platforms
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            ctx.canvas.width*.2, ctx.canvas.height*.4, 
            ctx.canvas.width*.8, boundsWidth))

        // other platforms
        gameEngine.addEntity(new Entity.Terrain(gameEngine, 
            0, ctx.canvas.height*.6, 
            ctx.canvas.width*.8, boundsWidth))


        gameEngine.init(ctx);
        gameEngine.start();
    });


    return {
        init: init
    };
});

