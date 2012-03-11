#!/bin/bash

PLAYER=$1

mkdir players/$PLAYER

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}DOWN{1..4}.png
mv SBS1/$PLAYER/${PLAYER}DOWN1.png.out.png players/$PLAYER/${PLAYER}DOWN.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}UP{1..4}.png
mv SBS1/$PLAYER/${PLAYER}UP1.png.out.png players/$PLAYER/${PLAYER}UP.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}L{1..4}.png
mv SBS1/$PLAYER/${PLAYER}L1.png.out.png players/$PLAYER/${PLAYER}L.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}R{1..4}.png
mv SBS1/$PLAYER/${PLAYER}R1.png.out.png players/$PLAYER/${PLAYER}R.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}FDOWN{1..4}.png
mv SBS1/$PLAYER/${PLAYER}FDOWN1.png.out.png players/$PLAYER/${PLAYER}FDOWN.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}FUP{1..4}.png
mv SBS1/$PLAYER/${PLAYER}FUP1.png.out.png players/$PLAYER/${PLAYER}FUP.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}FL{1..4}.png
mv SBS1/$PLAYER/${PLAYER}FL1.png.out.png players/$PLAYER/${PLAYER}FL.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -v SBS1/$PLAYER/${PLAYER}FR{1..4}.png
mv SBS1/$PLAYER/${PLAYER}FR1.png.out.png players/$PLAYER/${PLAYER}FR.png

/home/ondras/www/svn/v8cgi/v8cgi merge-sprite.js -h players/${PLAYER}/${PLAYER}UP.png players/${PLAYER}/${PLAYER}R.png players/${PLAYER}/${PLAYER}DOWN.png players/${PLAYER}/${PLAYER}L.png players/${PLAYER}/${PLAYER}FUP.png players/${PLAYER}/${PLAYER}FR.png players/${PLAYER}/${PLAYER}FDOWN.png players/${PLAYER}/${PLAYER}FL.png 
