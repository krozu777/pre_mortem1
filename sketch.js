// Estas variables globales se asumen disponibles en el entorno de Canvas,
// aunque no se usan directamente en este sketch.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebaseConfig) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let phoneScreenImg; // Variable para almacenar la imagen de la pantalla del celular
let counter = 0; // Contador de toques
const MAX_TOUCHES = 100; // Número máximo de toques antes de la "muerte"
let glitches = []; // Array para almacenar los glitches individuales
let isDead = false; // Estado de la aplicación: ¿el celular ha "muerto"?

let currentMessage = "Toca la pantalla para iniciar el ciclo..."; // Mensaje que se mostrará en el canvas

// La función 'sketch' contiene el código p5.js y se pasa a la instancia de p5.
const sketch = (p) => {
    // p.preload se ejecuta antes de que inicie el sketch.
    // Es el lugar ideal para cargar assets como imágenes.
    p.preload = () => {
        // Se carga tu propia imagen 'smartphone_screen.PNG'.
        // Asegúrate de haber subido la imagen al editor de p5.js primero.
        phoneScreenImg = p.loadImage('smartphone_screen.PNG');
    };

    // p.setup se ejecuta una vez al inicio del sketch, después de p.preload.
    // Aquí se configura el canvas y las condiciones iniciales.
    p.setup = () => {
        // Ajusta el tamaño del canvas para que simule un celular y sea responsivo.
        // El ancho máximo es de 400px o el 80% del ancho de la ventana, el que sea menor.
        p.createCanvas(p.windowWidth, p.windowHeight);
 // Crea el canvas. No se necesita .parent() en el editor web.

        p.noStroke(); // No dibujar bordes para las formas (glitches, contador).
        p.pixelDensity(1); // Asegura que los píxeles se dibujen uno a uno en pantallas de alta densidad.
        p.textAlign(p.CENTER, p.CENTER); // Configura la alineación de texto por defecto.
    };

    // p.draw se ejecuta continuamente, creando el bucle de animación.
    p.draw = () => {
        if (isDead) {
            // Si el celular está "muerto", la pantalla se pone completamente negra.
            p.background(0); // Fondo negro.
            p.fill(255, 0, 0); // Color rojo para el mensaje de MORTEM.
            p.textSize(p.width * 0.15); // Tamaño de texto responsivo basado en el ancho del canvas.
            p.text("MORTEM", p.width / 2, p.height / 2); // Dibuja el mensaje MORTEM.

            // Mensaje final en la parte inferior del canvas
            p.fill(255); // Color blanco para el mensaje de estado
            p.textSize(p.width * 0.05); // Tamaño más pequeño para el mensaje de estado
            p.text("El dispositivo ha cumplido su ciclo.", p.width / 2, p.height * 0.7);
            p.text("Descansa en paz digital.", p.width / 2, p.height * 0.75);

            p.noLoop(); // Detiene el bucle draw() de p5.js, la animación se detiene.
            return; // Sale de la función draw, no dibuja más nada.
        }

        // Dibuja la imagen de la pantalla del celular como fondo.
        p.image(phoneScreenImg, 0, 0, p.width, p.height);

        // Dibuja todos los glitches acumulados.
        for (let i = 0; i < glitches.length; i++) {
            let g = glitches[i];
            p.fill(g.color); // Establece el color del glitch (ya incluye la transparencia).
            p.rect(g.x, g.y, g.w, g.h); // Dibuja el rectángulo del glitch.
        }

        // Dibuja el contador en el centro de la pantalla.
        p.fill(255); // Color blanco para el contador.
        p.textSize(p.width * 0.1); // Tamaño de texto responsivo.
        p.text(counter, p.width / 2, p.height / 2); // Muestra el valor actual del contador.

        // Dibuja el mensaje de estado en la parte inferior del canvas.
        p.fill(255); // Color blanco para el mensaje.
        p.textSize(p.width * 0.03); // Tamaño de texto responsivo para el mensaje.
        p.text(currentMessage, p.width / 2, p.height * 0.9); // Posiciona el mensaje.
    };

    // p.touchStarted se ejecuta cuando se detecta un toque o clic en la pantalla.
    p.touchStarted = () => {
        if (isDead) {
            return false; // Si el celular ya está "muerto", no hay interacción.
        }

        // Incrementar el contador si no ha llegado al máximo.
        if (counter < MAX_TOUCHES) {
            counter++;

            // Generar un número de glitches basado en el progreso del contador.
            // Aumenta la cantidad de glitches generados con cada toque a medida que se acerca al MAX_TOUCHES.
            const numNewGlitches = p.floor(p.map(counter, 0, MAX_TOUCHES, 1, 15));

            for (let i = 0; i < numNewGlitches; i++) {
                // Colores fuertes y aleatorios para los glitches con transparencia.
                let glitchColor = p.color(
                    p.random(0, 255), // Componente Rojo
                    p.random(0, 255), // Componente Verde
                    p.random(0, 255), // Componente Azul
                    p.random(100, 200) // Componente Alfa (transparencia)
                );

                // Posición y tamaño aleatorio de los glitches dentro del canvas.
                let gx = p.random(p.width);
                let gy = p.random(p.height);
                let gw = p.random(5, p.width * 0.2); // Ancho variable del glitch.
                let gh = p.random(5, p.height * 0.05); // Alto variable del glitch.

                glitches.push({ x: gx, y: gy, w: gw, h: gh, color: glitchColor }); // Añade el nuevo glitch al array.
            }

            // Limitar el número total de glitches para evitar sobrecarga de rendimiento.
            // Esto asegura que el array de glitches no crezca indefinidamente.
            const maxGlischesToKeep = MAX_TOUCHES * 15; // Un valor aproximado para mantener la fluidez.
            if (glitches.length > maxGlitchesToKeep) {
                glitches.splice(0, glitches.length - maxGlitchesToKeep); // Elimina los glitches más antiguos.
            }

            // Actualizar el mensaje de estado.
            if (counter === 0) {
                currentMessage = "Toca la pantalla para iniciar el ciclo...";
            } else if (counter < MAX_TOUCHES * 0.3) {
                currentMessage = `Integridad del sistema: ${counter}% - Todo parece estable, por ahora.`;
            } else if (counter < MAX_TOUCHES * 0.7) {
                currentMessage = `Integridad del sistema: ${counter}% - Se detectan anomalías.`;
            } else if (counter < MAX_TOUCHES) {
                currentMessage = `Integridad del sistema: ${counter}% - ¡Deterioro crítico!`;
            }

            // Si el contador llega al máximo, el celular "muere".
            if (counter >= MAX_TOUCHES) {
                isDead = true;
                currentMessage = "El dispositivo ha cumplido su ciclo."; // Este mensaje será reemplazado por MORTEM y el mensaje final en draw
            }
        }
        return false; // Evita el comportamiento predeterminado del navegador para eventos táctiles (como el scroll).
    };

    // p.windowResized se ejecuta automáticamente cuando la ventana del navegador cambia de tamaño.
    p.windowResized = () => {
        // Recalcula el tamaño del canvas para mantener la proporción de celular y la responsividad.
        p.resizeCanvas(p.windowWidth, p.windowHeight);

        // Si el sketch estaba detenido (muerto), se reanuda temporalmente para asegurar un redibujo correcto
        // después del redimensionamiento, pero luego p.draw lo volverá a detener si 'isDead' sigue siendo true.
        if (isDead) {
            p.loop();
        }
    };
};

// Crea una nueva instancia de p5.js y pasa el objeto 'sketch' a ella.
// Esto inicializa y ejecuta tu sketch de p5.js.
new p5(sketch);

