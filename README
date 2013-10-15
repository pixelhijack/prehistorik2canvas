Prehistorik 2 with HTML5 Canvas
===============================

Revival of the original Prehistorik 2 Titus 1993 DOS game in the browser with HTML5 Canvas. 

Tiles, sprites, assets
-----------------------

All the tilesets are 320x... with 16x16 tiles, /img contains all. 

Canvas game - basic functionalities, todos
-----------------------------------------

* pre2.js is still draft, not yet divided into modules
* resource caching: preload all assets before init in resources.load([...]), then get with resources.get("..."). (via http://jlongster.com/Making-Sprite-based-Games-with-Canvas)
* keyboard input
* worldmap holds shortcuts to tiles in a 2d array. Numbers are row+col nums: i.e. 1508 is the tile of row 15th and col 8th in the tileset. Function drawTiles loop through the worldmap and put the properly offset tile from the tileset
* collisionmap shows which tiles should collide
* there are a vast number of 16x16 tile types, need to describe behaviours later
* animating the man's sprite is still todo
* jumping and falling is a real bitch, trust me. Tried to separate in a module but still having lots of issues. Experimenting with linear vs sinus jump movements. (Sinus curve is better for jumping and falling)
* collision is even worse, still very primitive code yet, very-very hard to separate
* collision detection basic methods: get the surrounding tile coords, get tile centers, calculate overlapping, guess left-right-up-down blocking collision-tiles
* parallax effect background and panning / camera handling is a different project
* created seamless tiles with photoshop for the seamless continuous backgrounds
* msg used for easier bug finding along with console.log

