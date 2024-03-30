document.addEventListener("DOMContentLoaded", () => {
    const { canvas, context } = getCanvas2DContext();
    let shapes = [];
    let selectedShape = null;
    let dragStartX = 0, dragStartY = 0;

    const drawShapes = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => {
            switch (shape.type) {
                case 'circle':
                    drawCircle(context, shape.x, shape.y, shape.size / 2);
                    break;
                case 'square':
                    drawSquare(context, shape.x, shape.y, shape.size);
                    break;
                case 'triangle':
                    drawTriangle(context, shape.x, shape.y, shape.size);
                    break;
                case 'hexagon':
                    drawHexagon(context, shape.x, shape.y, shape.size);
                    break;
            }
            drawFrame(context, shape.x, shape.y, shape.size, shape.type);
        });
    };

    const drawCircleInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 5;
        shapes.push({ type: 'circle', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    const drawSquareInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 5;
        shapes.push({ type: 'square', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    const drawTriangleInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 5;
        shapes.push({ type: 'triangle', x: canvas.width / 2, y: canvas.height / 2, size });

        drawShapes();
    };

    const drawHexagonInCentre = () => {
        const size = Math.min(canvas.width, canvas.height) / 9;
        shapes.push({ type: 'hexagon', x: canvas.width / 2, y: canvas.height / 2, size });
        drawShapes();
    };

    const handleShapeHandleClick = (drawFunction) => drawFunction();

    document.getElementById("drawCircleHandle").addEventListener("click", () => handleShapeHandleClick(drawCircleInCentre));
    document.getElementById("drawSquareHandle").addEventListener("click", () => handleShapeHandleClick(drawSquareInCentre));
    document.getElementById("drawTriangleHandle").addEventListener("click", () => handleShapeHandleClick(drawTriangleInCentre));
    document.getElementById("drawHexagonHandle").addEventListener("click", () => handleShapeHandleClick(drawHexagonInCentre));

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

const drawCircle = (context, x, y, radius, color = '#a8b6fb') => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
};

const drawSquare = (context, x, y, side, color = '#a8b6fb') => {
    const halfSide = side / 2;
    context.fillStyle = color;
    context.fillRect(x - halfSide, y - halfSide, side, side);
};

const initCanvasSize = (canvas) => {
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w / (w < 1200 ? 2.5 : 1.5);
    canvas.height = h / (h < 800 ? 1.5 : 1.2);
};

const drawTriangle = (context, x, y, side, color = '#a8b6fb') => {
    const height = Math.sqrt(3) * side / 2;
    context.beginPath();
    context.moveTo(x, y - height / 2);
    context.lineTo(x - side / 2, y + height / 2);
    context.lineTo(x + side / 2, y + height / 2);
    context.closePath();
    context.fillStyle = color;
    context.fill();
};

const drawHexagon = (context, x, y, side, color = '#a8b6fb') => {
    context.beginPath();
    context.moveTo(x + side * Math.cos(0), y + side * Math.sin(0));
    for (let i = 1; i <= 6; i++) {
        context.lineTo(x + side * Math.cos(i * 2 * Math.PI / 6), y + side * Math.sin(i * 2 * Math.PI / 6));
    }
    context.closePath();
    context.fillStyle = color;
    context.fill();
};

const drawFrame = (context, x, y, size, shapeType) => {
    let frameX, frameY, frameWidth, frameHeight;

    if (shapeType === 'circle') {
        frameX = x - size / 2;
        frameY = y - size / 2;
        frameWidth = size;
        frameHeight = size;
    } else if (shapeType === 'square') {
        frameX = x - size / 2;
        frameY = y - size / 2;
        frameWidth = size;
        frameHeight = size;
    } else if (shapeType === 'triangle') {
        const halfSide = size / 2;
        const height = Math.sqrt(3) * halfSide;
        const minX = x - halfSide;
        const maxX = x + halfSide;
        const minY = y - height / 2;
        const maxY = y;
        frameX = minX;
        frameY = minY;
        frameWidth = maxX - minX;
        frameHeight = maxY - minY + height / 2;
    } else if (shapeType === 'hexagon') {
        const halfSide = size / 2;
        const height = Math.sqrt(3) * halfSide;
        const minX = x + size * Math.cos(3 * 2 * Math.PI / 6);
        const maxX = x + size * Math.cos(6 * 2 * Math.PI / 6);
        const minY = y - height;
        const maxY = y + height / 2;
        frameX = minX;
        frameY = minY;
        frameWidth = maxX - minX;
        frameHeight = maxY - minY + height / 2;
    }

    context.strokeStyle = '#5900EB';
    context.lineWidth = 1;
    context.strokeRect(frameX, frameY, frameWidth, frameHeight);
};


const isPointInsideShape = (x, y, shape) => {
    const halfSize = shape.size / 2;
    return x >= shape.x - halfSize && x <= shape.x + halfSize && y >= shape.y - halfSize && y <= shape.y + halfSize;
};
