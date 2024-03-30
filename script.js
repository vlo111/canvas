document.addEventListener("DOMContentLoaded", () => {
    const { canvas, context: ctx } = getCanvas2DContext();
    let shapes = [];
    let selectedShape = null;
    let dragStartX = 0, dragStartY = 0;

    const drawShapes = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => {
            switch (shape.type) {
                case 'circle':
                    drawCircle(ctx, shape.x, shape.y, shape.size / 2);
                    break;
                case 'square':
                    drawSquare(ctx, shape.x, shape.y, shape.size);
                    break;
                case 'triangle':
                    drawTriangle(ctx, shape.x, shape.y, shape.size);
                    break;
                case 'hexagon':
                    drawHexagon(ctx, shape.x, shape.y, shape.size);
                    break;
            }
            drawFrame(ctx, shape.x, shape.y, shape.size);
        });
    };

    const drawCircleInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 5;
        shapes.push({ type: 'circle', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    const drawSquareInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 4;
        shapes.push({ type: 'square', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    const drawTriangleInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 3;
        shapes.push({ type: 'triangle', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    const drawHexagonInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 4;
        shapes.push({ type: 'hexagon', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    document.getElementById("drawCircleButton").addEventListener("click", drawCircleInCentre);
    document.getElementById("drawSquareButton").addEventListener("click", drawSquareInCentre);
    document.getElementById("drawTriangleButton").addEventListener("click", drawTriangleInCentre);
    document.getElementById("drawHexagonButton").addEventListener("click", drawHexagonInCentre);

    const onMouseMove = (event) => {
        if (selectedShape) {
            const mouseX = event.clientX - canvas.getBoundingClientRect().left;
            const mouseY = event.clientY - canvas.getBoundingClientRect().top;
            selectedShape.x = mouseX - dragStartX;
            selectedShape.y = mouseY - dragStartY;
            drawShapes();
        }
    };

    const onMouseUp = () => {
        if (selectedShape) {
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseup", onMouseUp);
            selectedShape = null;
            drawShapes();
        }
    };

    canvas.addEventListener("mousedown", (event) => {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
        shapes.forEach(shape => {
            if (isPointInsideShape(mouseX, mouseY, shape)) {
                selectedShape = shape;
                dragStartX = mouseX - shape.x;
                dragStartY = mouseY - shape.y;
                canvas.addEventListener("mousemove", onMouseMove);
                canvas.addEventListener("mouseup", onMouseUp);
            }
        });
    });
});

const getCanvas2DContext = () => {
    const canvas = document.getElementById("canvas");
    initCanvasSize(canvas);
    return { canvas, context: canvas.getContext("2d") };
};

const drawCircle = (ctx, x, y, radius, color = '#a8b6fb') => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
};

const drawSquare = (ctx, x, y, side, color = '#a8b6fb') => {
    const halfSide = side / 2;
    ctx.fillStyle = color;
    ctx.fillRect(x - halfSide, y - halfSide, side, side);
};

const initCanvasSize = (canvas) => {
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w / (w < 1200 ? 2.5 : 1.5);
    canvas.height = h / (h < 800 ? 1.5 : 1.2);
};

const drawTriangle = (ctx, x, y, side, color = '#a8b6fb') => {
    const height = Math.sqrt(3) * side / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x - side / 2, y + height / 2);
    ctx.lineTo(x + side / 2, y + height / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
};

const drawHexagon = (ctx, x, y, side, color = '#a8b6fb') => {
    ctx.beginPath();
    ctx.moveTo(x + side * Math.cos(0), y + side * Math.sin(0));
    for (let i = 1; i <= 6; i++) {
        ctx.lineTo(x + side * Math.cos(i * 2 * Math.PI / 6), y + side * Math.sin(i * 2 * Math.PI / 6));
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
};

const drawFrame = (ctx, x, y, size) => {
    const halfSize = size / 2;
    ctx.strokeStyle = '#5900EB';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - halfSize, y - halfSize, size, size);
};

const isPointInsideShape = (x, y, shape) => {
    const halfSize = shape.size / 2;
    return x >= shape.x - halfSize && x <= shape.x + halfSize && y >= shape.y - halfSize && y <= shape.y + halfSize;
};
