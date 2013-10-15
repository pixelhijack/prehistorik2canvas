/*
    make requestAnimFrame work in every browser hack
*/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();



/*
    RESOURCE CACHING
    via 
    http://jlongster.com/Making-Sprite-based-Games-with-Canvas

*/
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    // Load an image url or an array of image urls
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    window.resources = { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();


/*
    handle keyboard inputs
*/
var inputKeys = (function() {
    var pressedKeys = {};

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32:
            key = 'SPACE'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        default:
            // Convert ASCII codes to letters
            key = String.fromCharCode(code);
        }

        pressedKeys[key] = status;
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();


////////////////////////
//    statics
////////////////////////
var lastTime = Date.now(),
    canvas = document.getElementById("pre2canvas"),
    context = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 304;

var sprites = {
    STANDLEFT : "https://dl.dropboxusercontent.com/u/267716/sprites/standleft.png",
    STANDRIGHT : "https://dl.dropboxusercontent.com/u/267716/sprites/standright.png",
    IDLE : "https://dl.dropboxusercontent.com/u/267716/sprites/idle.gif"
};


var counter = 0,
    speed = 1,
    maxspeed = 3,
    minspeed = 1,
    acceleration = 0.03,
    lastActive,
    idle = 3000,
    tileHeight = 16,
    tileWidth = 16,
    spriteWidth = 32,
    spriteHeight = 35,
    x = 7*16,
    y = 10*16+spriteHeight / 2,
    panX = 0,
    panY = 0,
    sprite = resources.get(sprites.STANDRIGHT);


var theMan = resources.get(sprites.STANDRIGHT);


var init = function(){
    gemeloop();         
};


var worldmap = [
    ['','','','','','',''],
    ['','','','','','','','','','','',''],
    ['','','','','','','','','','','',''],
    ['','','','','','','','','','','0500','0500'],
    ['','','','','','','','','',''],
    ['','','','','','0500','0500','','','','',''],
    ['','','','','','','','','',''],
    ['0500','0500','','','','','','','',''],
    ['','','','','','','','','',''],
    ['','','0500','0500','','','','','',''],
    ['','','0500','0500','','','','','','','','','','','','','','0500','0500','',''],
    ['0307','','0500','0500','','','','','','','','','','','','','','0500','0500','','',''],
    ['1408','1508','1608','1708','1608','1508','1408','0500','0500','','','0500','0500','','','0500','0500','1408','1508','1608','1708','1608','1508','1608','1708','1608'],
    ['0310','0410','0510','0610','0510','0410','0310','0210','','','','','','','','','','0310','0410','0510','0410','0310','0410','0510','0610','0510'],
    ['0000','0100','0200','0300','0400','','','','',''],
    ['','','','','','','','','',''],
    ['','','1408','1508','1608','1708','1608','0500','0500','0500','0500','']
];
    
/*
    had to use +t. 
    rules for unquoted object literal keys: http://stackoverflow.com/questions/9367572/rules-for-unquoted-javascript-object-literal-keys
    obj literal pointer validator:
    http://mothereff.in/js-properties#12e34
*/
var collisionmap = {
    t0500 : 1,
    t0310 : 1,
    t0410 : 1,
    t0510 : 1,
    t1408 : 1,
    t1508 : 1,
    t1608 : 1,
    t1708 : 1
};



////////////////////////////////
// image resource preloader //
///////////////////////////////

resources.load([
    "http://www.w3schools.com/tags/img_lamp.jpg",
   "https://dl.dropboxusercontent.com/u/267716/sprites/bg/tileset2.png",
    "https://dl.dropboxusercontent.com/u/267716/sprites/bg_06.png",
    "https://dl.dropboxusercontent.com/u/267716/sprites/bg_04.png",
    "https://dl.dropboxusercontent.com/u/267716/sprites/standleft.png",
    "https://dl.dropboxusercontent.com/u/267716/sprites/standright.png",
    "https://dl.dropboxusercontent.com/u/267716/sprites/idle.gif", 
    "https://dl.dropboxusercontent.com/u/267716/sprites/dinoleft.png",
    "https://dl.dropboxusercontent.com/u/267716/sprites/5.png"
    
]);
resources.onReady(init);



////////////////////////
//    game loop
////////////////////////
function gemeloop(){
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();
    
    lastTime = now;
    requestAnimFrame(gemeloop);
    
};


/////////////////////////////////
// DRAW THE TILESET
// context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
/////////////////////////////////

function drawTiles(){
    for(var i=0;i<worldmap.length;i++){
        var row = worldmap[i];
        for(var j=0;j<row.length;j++){
            var tile = row[j],
                tilex = tile.slice(0,2),
                tiley = tile.slice(2);
            if(tile){    
                context.drawImage(
                    resources.get("https://dl.dropboxusercontent.com/u/267716/sprites/bg/tileset2.png"),
                    tilex*tileWidth,
                    tiley*tileHeight,
                    tileWidth,tileHeight,
                    j*tileWidth,i*tileHeight,
                    tileWidth,tileHeight
                );  
            };
        };
    };   
};

function setSprite(){
    context.save();
    //context.translate(x, y);
    context.drawImage(
        resources.get("https://dl.dropboxusercontent.com/u/267716/sprites/standright.png"),
        x - spriteWidth/2,
        y - spriteHeight/2);
    context.restore();
    
};

function checkEdge(){
    if(x < 0) {
        x = 0;
    };
    if(x > canvas.width){
        x = canvas.width;
    };

    if(y < 0) {
        y = 0;
    };
    if(y > canvas.height){
        y = canvas.height;
    };
};


//http://www.brighthub.com/internet/web-development/articles/40516.aspx#imgn_0
var JumpFall = (function(dt){
    var jumping = false,
        jumpSinWavePos = 0,
        jumpHangTime = 0.5,
        jumpHeight = 64,
        halfPI = Math.PI / 2,
        ground = y,
        jumpSinWaveSpeed = halfPI / jumpHangTime;
        return {
            jumping : jumping,
            jump : function(dt){
                if(this.jumping){
                    // the last position on the sine wave
                    var lastHeight = jumpSinWavePos;
                    // the new position on the sine wave
                    jumpSinWavePos += jumpSinWaveSpeed * dt;
                        
                    //prev: if(jumpSinWavePos >= Math.PI || y > ground) 
                    // => vs bug: jumping from high platform w/ upcollide
                    // => || y > ground had to be changed due to jump-fall y cache bug :( 
                    if(jumpSinWavePos >= Math.PI){
                        msg(" END.");
                        this.jumping = false;
                        jumpSinWavePos = 0;
                        y = ground;
                        //y += jumpHeight / jumpHangTime * 1.5 * dt;
                    // otherwise move along the sine wave
                    }else{
                        y -= (Math.sin(jumpSinWavePos) - Math.sin(lastHeight)) * jumpHeight;
                        msg("still jumping...");
                        
                        if( collisionmap["t"+getTile(x,y,0,1)] &&
                            overlap(x,y,16,
                                    tileCenter(x,y,0,1)[0],
                                    tileCenter(x,y,0,1)[1],8) ){
                            ground = y;
                            this.jumping = false;
                            jumpSinWavePos = 0;
                            return false;
                       };
                  };
             };
        }
    };
})();    


  /////////////////////
 //    COLLISION    //
/////////////////////

/*
    GET TILE CENTER COORDS (w/ modifiers)
    return [center x, center y]
*/
function tileCenter(x,y,cellmod,rowmod){
    var rowmod = rowmod || 0,
        cellmod = cellmod || 0,
        row = Math.floor(y / tileHeight),
        cell = Math.floor(x / tileWidth);
    return [(cell+cellmod)*tileHeight+tileHeight/2,(row+rowmod)*tileWidth+tileWidth/2]; 
};

/*
    GET TILE TYPE based on x,y coords (w/ modifiers)
    returns a worldmap type i.e."0500" or "1701"
*/
function getTile(x,y,cellmod,rowmod){
    var rowmod = rowmod || 0,
        cellmod = cellmod || 0,
        row = Math.floor(y / tileHeight),
        cell = Math.floor(x / tileWidth);
    return worldmap[row+rowmod][cell+cellmod]; 
};


function overlap(x1, y1, size1, x2, y2, size2) {
  var bottom1, bottom2, left1, left2, right1, right2, top1, top2;
  left1 = x1 - size1;
  right1 = x1 + size1;
  top1 = y1 - size1;
  bottom1 = y1 + size1;
  left2 = x2 - size2;
  right2 = x2 + size2;
  top2 = y2 - size2;
  bottom2 = y2 + size2;
  return !(left1 > right2 || left2 > right1 || top1 > bottom2 || top2 > bottom1);
};

function leftBlock(){
    if( collisionmap["t"+getTile(x,y,-1,0)] &&
        overlap(x,y,16,tileCenter(x,y,-1,0)[0],tileCenter(x,y,-1,0)[1],8) ){
            x += speed;       
    };
};
function rightBlock(){
    if( collisionmap["t"+getTile(x,y,1,0)] &&
        overlap(x,y,16,tileCenter(x,y,1,0)[0],tileCenter(x,y,1,0)[1],8) ){
            x -= speed;       
    };
};



function handleInput(dt){
    
    if(input.isDown('RIGHT')){ 
        sprite = resources.get(sprites.STANDRIGHT);
        if( collisionmap["t"+getTile(x,y,1,0)] &&
            overlap(x,y,16,tileCenter(x,y,1,0)[0],tileCenter(x,y,1,0)[1],8) ){
                x -= speed;       
        }else{
                speed = speed < maxspeed ? speed += acceleration : maxspeed; 
                x += speed;        
                panX -= speed / maxspeed*0.1;
            };
    };
    if(input.isDown('LEFT')){ 
        sprite = resources.get(sprites.STANDLEFT);
        if( collisionmap["t"+getTile(x,y,-1,0)] &&
            overlap(x,y,16,tileCenter(x,y,-1,0)[0],tileCenter(x,y,-1,0)[1],8) ){
                x += speed;
         }else{   
            speed = speed < maxspeed ? speed += acceleration : maxspeed; 
            x -= speed;        
            panX += speed / maxspeed*0.1;
         };
    };
    if(input.isDown('UP')){  
        JumpFall.jumping = true; 
    };
    if(JumpFall.jumping){ JumpFall.jump(dt); };
    if(!JumpFall.jumping &&
       !collisionmap["t"+getTile(x,y,0,1)] &&
       overlap(x,y,16,tileCenter(x,y,0,1)[0],tileCenter(x,y,0,1)[1],8)
      ){
        y += speed;
    };
    
};



function update(dt){
    checkEdge();
    handleInput(dt);
};


function render(){
    context.drawImage(
        resources.get("https://dl.dropboxusercontent.com/u/267716/sprites/bg_04.png"),
        panX,panY);
    drawTiles();
    setSprite();
};


function msg(text, logical){
    var msgdiv = document.getElementById('msg'),
        text = String(text);
    if(logical == true || logical == undefined){
        msgdiv.innerHTML = text;
    }else{
        msgdiv.innerHTML = "";
    };
};