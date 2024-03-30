class Shape {
    constructor(type, x, y, size) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw(context) {
        switch (this.type) {
            case 'circle':
                this.drawCircle(context);
                break;
            case 'square':
                this.drawSquare(context);
                break;
            case 'triangle':
                this.drawTriangle(context);
                break;
            case 'hexagon':
                this.drawHexagon(context);
                break;
        }
    }

    drawCircle(context) {
        const radius = this.size / 2;
        context.beginPath();
        context.arc(this.x, this.y, radius, 0, Math.PI * 2);
        context.fillStyle = '#a8b6fb';
        context.fill();
        context.closePath();
    }

    drawSquare(context) {
        const halfSize = this.size / 2;
        context.fillStyle = '#a8b6fb';
        context.fillRect(this.x - halfSize, this.y - halfSize, this.size, this.size);
    }

    drawTriangle(context) {
        const height = Math.sqrt(3) * this.size / 2;
        context.beginPath();
        context.moveTo(this.x, this.y - height / 2);
        context.lineTo(this.x - this.size / 2, this.y + height / 2);
        context.lineTo(this.x + this.size / 2, this.y + height / 2);
        context.closePath();
        context.fillStyle = '#a8b6fb';
        context.fill();
    }

    drawHexagon(context) {
        context.beginPath();
        context.moveTo(this.x + this.size * Math.cos(0), this.y + this.size * Math.sin(0));
        for (let i = 1; i <= 6; i++) {
            context.lineTo(this.x + this.size * Math.cos(i * 2 * Math.PI / 6), this.y + this.size * Math.sin(i * 2 * Math.PI / 6));
        }
        context.closePath();
        context.fillStyle = '#a8b6fb';
        context.fill();
    }
}

// Canvas Module
class Canvas {
    constructor(canvasId) {
        this.canvasElement = document.getElementById(canvasId);
        this.context = this.canvasElement.getContext('2d');
        this.shapes = [];
        this.selectedShape = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initCanvasSize();
        this.bindEvents();
    }

    initCanvasSize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvasElement.width = w / (w < 1200 ? 2.5 : 1.5);
        this.canvasElement.height = h / (h < 800 ? 1.5 : 1.2);
    }

    bindEvents() {
        this.canvasElement.addEventListener("mousedown", this.onMouseDown.bind(this));
    }

    onMouseDown(event) {
        const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
        const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;
        this.shapes.forEach(shape => {
            if (this.isPointInsideShape(mouseX, mouseY, shape)) {
                this.selectedShape = shape;
                this.dragStartX = mouseX - shape.x;
                this.dragStartY = mouseY - shape.y;
                this.canvasElement.addEventListener("mousemove", this.onMouseMove.bind(this));
                this.canvasElement.addEventListener("mouseup", this.onMouseUp.bind(this));
            }
        });
    }

    onMouseMove(event) {
        if (this.selectedShape) {
            const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
            const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;
            this.selectedShape.x = mouseX - this.dragStartX;
            this.selectedShape.y = mouseY - this.dragStartY;
            this.drawShapes();
        }
    }

    onMouseUp() {
        if (this.selectedShape) {
            this.canvasElement.removeEventListener("mousemove", this.onMouseMove.bind(this));
            this.canvasElement.removeEventListener("mouseup", this.onMouseUp.bind(this));
            this.selectedShape = null;
            this.drawShapes();
        }
    }

    addShape(shape) {
        this.shapes.push(shape);
        this.drawShapes();
    }

    drawShapes() {
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.shapes.forEach(shape => {
            shape.draw(this.context);
            this.drawFrame(shape);
        });
    }

    drawFrame(shape) {
        const { x, y, size, type } = shape;
        let frameX, frameY, frameWidth, frameHeight;

        if (type === 'circle' || type === 'square') {
            frameX = x - size / 2;
            frameY = y - size / 2;
            frameWidth = frameHeight = size;
        } else if (type === 'triangle') {
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
        } else if (type === 'hexagon') {
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

        this.context.strokeStyle = '#5900EB';
        this.context.lineWidth = 1;
        this.context.strokeRect(frameX, frameY, frameWidth, frameHeight);
    }

    isPointInsideShape(x, y, shape) {
        const halfSize = shape.size / 2;
        return x >= shape.x - halfSize && x <= shape.x + halfSize && y >= shape.y - halfSize && y <= shape.y + halfSize;
    }
}

// UI Module
class UI {
    constructor(canvasId) {
        this.canvas = new Canvas(canvasId);
        this.bindShapeHandlers();
    }

    bindShapeHandlers() {
        const shapeHandles = document.querySelectorAll('.thumbnail');
        shapeHandles.forEach(handle => {
            handle.addEventListener('click', this.handleShapeClick.bind(this));
        });
    }

    handleShapeClick(event) {
        const { shape, sizeScale } = event.currentTarget.dataset;
        const { width, height } = this.canvas.canvasElement;

        this.canvas.addShape(new Shape(shape, width / 2, height / 2, Math.min(width, height) / parseInt(sizeScale)));
    }
}

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    new UI('canvas');
});
