# Integrantes del proyecto  
- Cesca Martina Luciana
- Dingevan Juan Ignacio  

# Sobre la Solución:  

## Front end  
Se da a continuación una breve descripción del front-end:
- Se implementó usando únicamente HTML/CSS/JavaScript.
- El diseño es sencillo, y mayormente responsive. Presenta un 100 en accesibilidad tras un analisis de Lighthouse.
- Se sirve desde un sencillo servidor express.
- Se accede en ``http://localhost:8000/``.
- Consta de una grilla de posters de 2 filas y 4 columnas.
- Al abrirse la página N de estos posters se llenan con películas aleatorias de la base de datos, con N entre 1 y 8.
- Al clickear cada poster, en la parte inferior de la página aparece el título de la película, así como un resumen de su trama.
- En la parte derecha de la página.
- Cuando una película recomendada se clickea, esta se agrega a la grilla de posters. Si quedan espacios vacíos, se agrega al primero de estos. Sino, reemplaza el N-ésimo lugar, donde N-1 es el último lugar reemplazado (entonces, si se reemplazó la primera película y se "mira" otra recomendación, el poster de esta se agregará en el poster 2).
- Se hace una recomendación cada floor(N/2) películas de la grilla de posters "miradas" (clickeadas), donde N es el número de películas presentes en la grilla de posters. Si hay 3 películas, la recomendación se hace cada 1 click. Si hay 8, cada 4 clicks, etc.

## Recomendador  
Se decidió implementar un sistema de recomendación de películas basado en el análisis del género de las películas previamente seleccionadas por el usuario.

## RabbitMQ y Microservicios Que lo Usan
Se encontrará en el archivo .yaml la directiva ``restart: on-failure`` los microservicios que usan a RabbitMQ. Su adición no es casual, y sin la misma, el proyecto no funcionaría. Se la agrega como una "segunda capa" de la directiva ``depends_on``. Si bien con ``depends_on`` los microservicios no se iniciarán hasta que rabbit se haya iniciado, RabbitMQ se toma unos momentos después de ser inicializado hasta estar funcional. Si los microservicios clientes de RabbitMQ son iniciados previo a que rabbit esté funcional, estos fallan. Al agregar la directiva ``restart: on-failure``, nos aseguramos que estos microservicios logren conectarse de manera apropiada a RabbitMQ.

La solución implementada causa que el proyecto tarde unos segundos extra en iniciarse. Sin embargo, dado que el costo en tiempo se paga una única vez, al inicio, se juzgó que las ventajas sobrepasaban a las desventajas y se optó por dicha implementación.

# Build:

Ejecutar ``docker-compose up -d`` en el directorio raíz del proyecto. 

Mantener la calma si algunos microservicios tardan en iniciarse por primera vez. Se debe al proceso de creación de imágenes. Como referencia, en una computadora Lenovo 81WE (Intel core i5 10ma generación, 12GB RAM, Windows 11) el proyecto tarda entre 3 y 5 minutos en iniciarse si se crean todas las imagenes por primera vez. Las veces subsiguientes (asumiendo que no se elimina ninguna imagen), tarda unos segundos.