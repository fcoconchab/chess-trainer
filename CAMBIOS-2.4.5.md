# Cambios 2.4.5 · Mazos y finales verificados, app sin excepciones, analizador al doble de velocidad

Incluye todo lo de la 2.4.1 a la 2.4.4. Si no subiste alguna, sube directamente esta.

Regla de esta versión: nada de lo que la app enseña puede ser falso o inferior. Cada posición de cada mazo pasó por python-chess (mates, jaques, capturas, ataques, legalidad) y por Stockfish 17.1 completo a profundidad 22 o más. Lo que no tenía arreglo limpio se quitó.

## 1. Mazos de táctica

**Exactos (python-chess), sin cambios necesarios**
- MATE1 (31): la solución es mate y no hay otro mate en 1 que se marque como incorrecto.
- MATE2 (6): cada réplica del rival tiene su mate; no hay otra primera jugada que fuerce mate en 2.
- ESCANEO (36): jaques, capturas y piezas atacadas coinciden exactamente.
- CONTAR (41): atacantes y defensores exactos; "sí/no" coincide con el motor en las 41.
- RADAR (ahora 76): las casillas de atacantes son exactas; las respuestas "atacado y mal defendido" y "gratis" coinciden con el motor.

**Verificados con Stockfish a profundidad 22 (con repaso a 26 a 30 en los dudosos)**
- MOTIVOS (ahora 27): las 28 soluciones eran la mejor jugada. Se quitó una posición (tjm7kv25) porque su explicación de "ataque doble" era falsa (el rival simplemente recaptura) y el motivo real no es ningún tema del mazo. Tres posiciones cambian de tema a "Pieza colgada" porque el texto describía un motivo que no estaba en el tablero (tcrwtbiz, t876kzof, to279s9k). Tres textos corregidos (dos "no lo defendía nadie" que en realidad era "atacado dos veces, defendido una"; un descubierto mal descrito). Todas las líneas "Sigue:" se regeneraron con la variante principal del motor.
- CASTIGA (ahora 19): se quitó cas_b246a15d (ya ibas con pieza de más y tres jugadas valían lo mismo). Tres jugadas alternativas igual de buenas ahora se aceptan (Kxd1, bxa3, dxc4). "Qxf7# gana peón" ahora dice que es mate.
- REMONTAR (ahora 19): se quitó rem_14dc557c ("defensa única" en una posición perdida haga lo que haga: mate en contra a profundidad 30). En la torre loca se acepta también Rg1+.
- DEFEND (20): se dejaron como correctas solo las defensas a menos de 0,5 peones de la mejor (profundidad 26). Se quitaron Qf6 y Nh6 contra el mate del pastor con Qh5; Qe7, Nh6 y f6 contra Qf3; h6 y f5 contra dama y alfil en h7. Se añadió Qc7 contra Bxa5. Los textos dicen cuál es la mejor.
- CONVERTIR (ahora 19, antes 30): el mazo tenía más posiciones falsas que verdaderas.
  - Las dos de "cambiar damas" no eran un cambio: la dama rival estaba colgada. Quitadas.
  - Siete de nueve "evitar el perpetuo" decían que comer el peón daba perpetuo, y comer el peón también ganaba por fuerza. Quitadas. En la que sí era cierta se quitó una tercera opción que también ganaba.
  - Dos de "¿rey o peón?" tenían todas las opciones ganadoras. Quitadas.
  - Las once de "¿esta jugada ahoga?" tenían tres opciones de las que dos ganaban: la tercera se marcaba como error sin serlo. Ahora son dos opciones, la que ahoga y la buena. La jugada que "ahoga" ahoga de verdad en las once.
- NADA (34): en ninguna hay golpe (ni captura, ni jaque, ni mate a más de 0,8 de la mejor jugada tranquila) y la jugada tranquila propuesta está a menos de 0,6 de la mejor.
- SEGURA (72): las 39 "seguras" están a menos de 0,6 de la mejor; en las 33 que regalan, la jugada pierde al menos 1 peón y la jugada que castiga es la mejor réplica del motor. Dos textos ajustados (Bxd5 exd5 Nxd5 pierde un peón, no el caballo).
- CONCEPTOS (6): las jugadas pedidas están dentro de 0,1 de la mejor; la oposición se comprobó con la tabla exacta (solo Kf6 aguanta); el cuadrado también.

**Mazos que no existen**: TORRE (finales de torre), PLANES, MATESN, REYSEG, CANDIDATAS, CAMBIOS y VISUAL aparecen en el código pero no tienen posiciones (la app ya los ocultaba). No hay nada que verificar ahí.

## 2. Finales
- **Rey y peón contra rey**: la tabla de la app se comparó con una tabla exacta calculada aparte (python-chess, 331.352 posiciones legales). Coincidía en todas menos 6: posiciones donde coronar dama ahoga pero coronar torre gana. Ahora la tabla cuenta la torre y la app corona torre sola cuando la dama ahogaría (te lo dice). Las 10 posiciones de inicio tienen el resultado correcto; se corrigieron tres textos ("con la oposición" en una posición donde no la tenías: ganas por tener el rey en la sexta; y dos de tablas que sugerían que se podía ganar).
- **Rey y dama / rey y torre contra rey**: lógica de mate, ahogado, captura y límite de jugadas revisada; textos correctos. El rival defiende con una regla simple (huir al centro), no perfecto: se declara, no se cambió.
- **Finales de torre**: el mazo no existe (ver arriba).

## 3. Funcionamiento
- **5 excepciones al abrir pantallas sin su estado** (drill, deckdone, line, endgame, compose): ahora vuelven a su pestaña en vez de fallar. Se protegieron también sessiondone, linecard y partidadet.
- **Modo sin internet**: probado con Playwright en pantalla de iPhone. Con la red cortada la app carga, el motor arranca desde su caché y evalúa. Caché de la app renombrada a 2.4.5; el motor (7 MB) no se vuelve a descargar.
- **Analizador de partidas, el doble de rápido**: la reconfirmación de cada error baja de profundidad 16 a 14 y ya no hace una segunda búsqueda cuando la jugada hecha aparece en las líneas de la primera. Medido en 30 partidas sintéticas de nivel principiante (899 jugadas tuyas) contra Stockfish completo a profundidad 20:
  - antes: 3,98 s por partida, 91 % de los errores marcados son errores, detecta el 86 %, la respuesta de la tarjeta es tan buena como la del motor completo en 138 de 138;
  - ahora: 2,05 s por partida, 91 %, 85 %, 137 de 138.
  - Opciones más rápidas (1,3 a 1,6 s) bajaban la calidad de las respuestas a 98 %: se descartaron.
- Recorrido completo con Playwright (iPhone 13): 70 pantallas y flujos, los 20 mazos jugados hasta el final, aperturas, finales, sesión del día, importación con motor, revisión guiada, repaso de tarjetas y posición a mano. Cero errores de consola.

## 4. Caro-Kann y Española (para más adelante)
Mismo estándar que las otras aperturas: todas tus jugadas están dentro de 0,15 de la mejor a profundidad 30. Los "errores" del modo guiado que en realidad estaban a 0,30 o menos de la mejor (24) pasan a "también buena"; los que están entre 0,3 y 0,5 (6) se aceptan sin contar como fallo y el texto dice cuánto pierden. Textos falsos corregidos: "Bg4 h3" (es Qxg4 y pierdes el alfil, dos veces), "Nf3 deja que gane espacio con d5", "f4 pierde material", "d4 complica" en 8.c3, "Bxh7 Rxh7" tras Ngf6 (recapturas con el caballo). Cada jugada que se quedó sin opción incorrecta recibió distractores nuevos verificados (al menos 0,5 peor).

## Lo que no está comprobado
- Velocidad y comportamiento en un iPhone real (todo se probó en Chromium con pantalla de iPhone).
- El rival de rey y dama / rey y torre no defiende de forma perfecta.
- Las aperturas "extra" para blancas (Siciliana, Francesa, Caro-Kann, Escandinava y otras desde blancas, y "otras" desde negras) no se revisaron con el estándar de aperturas; solo se comprobó que todas sus jugadas y opciones son legales.
- Los textos "why" de CONTAR, SEGURA (seguras), RADAR y ESCANEO son plantillas generadas: se verificó el dato que contienen (pieza, casilla, cuenta), no cada frase a mano.
- En DEFEND, el umbral de 0,5 es una decisión: las defensas quitadas sí paran el mate, pero son peores.

## Tu progreso
No se pierde nada. Las posiciones quitadas simplemente dejan de aparecer.

## Cómo subirlo
Sube `index.html`, `sw.js` y la carpeta `sf/` completa (4 archivos) a la raíz del repo. Si prefieres, aprueba el pull request de la rama `v2.4.5` desde el celular.
