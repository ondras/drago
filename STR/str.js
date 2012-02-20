/*
Analyza radku souboru .STR (graf ma 700 uzlu)

05 05 FF FF  08 00 01 00  FF FF 01 00  00 00 00 00 - modry vlevo nahore, zaznam #0
05 0B 00 00  09 00 02 00  FF FF 01 00  00 00 04 00 - modry pod predchozim, zaznam #1; ma dolu auto-letadlo
0A 0B FF FF  FF FF 0A 00  01 00 01 00  00 00 00 00 - modry vpravo od predchoziho, zaznam #9
0A 0F 09 00  12 00 FF FF  FF FF 01 00  00 00 00 00 - modry pod predchozim, zaznam #10
0A 05 FF FF  10 00 FF FF  00 00 02 00  00 00 00 00 - cerveny vpravo od prvniho, zaznam #8
20 0B FF FF  55 00 FF FF  24 00 02 00  00 00 1A 00 - cerveny vpravo od predchoziho; doleva i doprava letadlo
0F 0B 10 00  24 00 12 00  FF FF 05 00  DC 2B 00 00 - fialovy nad mestem na islandu, zaznam #17
15 0B 23 00  3E 00 FF FF  11 00 03 00  00 00 02 00 - zluty vpravo od fialoveho, zaznam #36 (0x24); ma vpravo auto-letadlo
0F 0F 11 00  FF FF 13 00  0A 00 06 00  DC 2B 04 00 - mesto na islandu, zaznam #18 (0x12); ma dolu auto-letadlo
0F 14 12 00  28 00 FF FF  FF FF 02 00  00 00 13 00 - cervena pod islandem; ma letadlo nahoru a doprava
19 14 FF FF  3F 00 29 00  13 00 02 00  00 00 1E 00 - cervena vpravo od predchozi; ma letadlo doleva, doprava a dolu

X  Y  UP     RIGHT DOWN   LEFT  TYPE   O1 O2 PP QQ - O1+O2 offset v ramci souboru na info o meste, PP typ dopr. prostredku, QQ?

TYPE:
  01 modry
  02 cerveny
  03 zluty
  04
  05 fialovy
  06 mesto

PP (DOPRAVNI PROSTREDKY):
02: 0000 0010 vpravo auto-letadlo
04: 0000 0100 dolu auto-letadlo
13: 0001 0011 nahoru letadlo-auto, doprava letadlo
1A: 0001 1010 doleva letadlo, doprava letadlo
1E: 0001 1110 doleva letadlo, doprava letadlo, dolu letadlo
            | nahoru letet
           | vpravo letet
          | dolu letet
         | vlevo letet
       | na zemi (0), ve vzduchu (1)
      | vzdy 0
     | vzdy 0 
    | vzdy 0

QQ: pouze hodnoty 00 a 40 
*/
