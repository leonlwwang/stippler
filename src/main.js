import './global.css'

const fileBtn = document.getElementById('file-btn');
const imgForm = document.getElementById('image-form');
fileBtn.addEventListener('change', function() {
    imgForm.remove();

    const image = new Image();
    const file = fileBtn.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        image.src = reader.result;
    }

    const handle = document.getElementById('handle');

    const loader = document.createElement('div');
    loader.className = 'loader';
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.appendChild(loader);
    document.body.insertBefore(wrapper, handle);

    const stippler = document.createElement("canvas");
    stippler.id = "stippler";
    stippler.style.display = 'none';
    document.body.insertBefore(stippler, handle);
    const canvas = document.getElementById("stippler");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    image.onload = function() {
        const { width, height } = resize(context, image, 500);
        const blankImageData = context.getImageData(0, 0, width, height);
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);

        const passiveWorker = new Worker('src/worker.js', { type: 'module' });
        const activeWorker = new Worker('src/worker.js', { type: 'module' });

        let passivePoints = null;
        let activePoints = null;

        const start = new Date();
        passiveWorker.postMessage({ imageData: blankImageData, density: 10, sharpness: 100 });
        activeWorker.postMessage({ imageData, density: 10, sharpness: 100 });

        passiveWorker.onmessage = function(event) {
            passivePoints = event.data;
            checkCompletion();
        };

        activeWorker.onmessage = function(event) {
            activePoints = event.data;
            checkCompletion();
        };

        function checkCompletion() {
            if (passivePoints && activePoints) {
                const end = new Date();
                wrapper.remove();

                const report = document.createElement('p');
                report.textContent = (activePoints.length + passivePoints.length) + " points generated in " + (end - start) / 1000 + " sec";
                document.body.insertBefore(report, handle);

                stippler.style.display = 'block';

                // draw & animate
                drawStipplingByPoint(passivePoints);
                animate(performance.now(), 0);
            }
        }

        function drawStipplingByPoint(points) {
            context.clearRect(0, 0, width, height);
            context.fillStyle = "black";
            for (let i = 0, n = points.length; i < n; i += 2) {
                const x = points[i], y = points[i + 1];
                context.fillRect(x, y, 1.1, 1.1);
            }
        }

        const duration = 20000;
        function animate(startTime, frameCount) {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
        
            for (let i = 0, n = passivePoints.length; i < n; i += 2) {
                passivePoints[i] = passivePoints[i] + (activePoints[i] - passivePoints[i]) * progress;
                passivePoints[i + 1] = passivePoints[i + 1] + (activePoints[i + 1] - passivePoints[i + 1]) * progress;
            }
            drawStipplingByPoint(passivePoints);
        
            if (progress < 1) {
                requestAnimationFrame(() => animate(startTime, frameCount + 1));
            } else {
                console.log("animation complete");
            }
        }
    }
});

function resize(context, image, width) {
    const height = Math.round(width * image.height / image.width);
    context.canvas.width = width;
    context.canvas.height = height;
    return { width: width, height: height }
}
