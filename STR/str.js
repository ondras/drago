/*
Analysis of a row of a .STR file (graph has 700 nodes)

05 05 FF FF  08 00 01 00  FF FF 01 00  00 00 00 00 - blue top left, record #0
05 0B 00 00  09 00 02 00  FF FF 01 00  00 00 04 00 - blue under previous, entry #1; has a car-plane downwards
0A 0B FF FF  FF FF 0A 00  01 00 01 00  00 00 00 00 - blue to the right of the previous one, entry #9
0A 0F 09 00  12 00 FF FF  FF FF 01 00  00 00 00 00 - blue under the previous one, entry #10
0A 05 FF FF  10 00 FF FF  00 00 02 00  00 00 00 00 - red one to the right of the first one, record #8
20 0B FF FF  55 00 FF FF  24 00 02 00  00 00 1A 00 - red to the right of the previous one; left and right plane
0F 0B 10 00  24 00 12 00  FF FF 05 00  DC 2B 00 00 - purples over a city in Iceland, entry #17
15 0B 23 00  3E 00 FF FF  11 00 03 00  00 00 02 00 - yellow to right of purple, entry #36 (0x24); it has car-plane to the right
0F 0F 11 00  FF FF 13 00  0A 00 06 00  DC 2B 04 00 - city in Iceland, record #18 (0x12); it has a car-plane downwards
0F 14 12 00  28 00 FF FF  FF FF 02 00  00 00 13 00 - red under Iceland; has plane upwards and to the right
19 14 FF FF  3F 00 29 00  13 00 02 00  00 00 1E 00 - red to the right of the previous one; has plane to the left, right and downwards

X  Y  UP     RIGHT DOWN   LEFT  TYPE   O1 O2 PP QQ - O1+O2 offset within the file on city info, PP transport type, QQ?

TYPE:
  01 blue
  02 red
  03 golden
  04
  05 purple
  06 city

PP (MEANS OF TRANSPORTATION):
02: 0000 0010 right car-plane
04: 0000 0100 car-plane down
13: 0001 0011 up plane-car, right plane
1A: 0001 1010 left plane, right plane
1E: 0001 1110 left plane, right plane, down plane
            | fly up
           | fly right
          | fly down
         | fly left
       | on the ground (0), in the air (1)
      | always 0
     | always 0
    | always 0

QQ: only values 00 and 40
*/
