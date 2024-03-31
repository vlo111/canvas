const ShapeType = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    TRIANGLE: 'triangle',
    HEXAGON: 'hexagon'
};

/**
 * Base class for all shapes
 */
class Shape {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size; // Size of the shape (e.g., radius, side length)
        this.color = color;
    }

    draw(context) {
        // Base draw method, to be overridden by subclasses
    }

    drawFrame(context, frameX, frameY, frameWidth, frameHeight) {
        // Draw frame
        context.strokeStyle = '#5900EB';
        context.lineWidth = 1;
        context.strokeRect(frameX, frameY, frameWidth, frameHeight);

        // Draw control points for manipulation
        const controlSize = 10; // Size of control points
        context.fillStyle = '#5900EB';

        // Draw control points at corners of the frame
        context.fillRect(frameX - controlSize / 2, frameY - controlSize / 2, controlSize, controlSize); // Top-left
        context.fillRect(frameX + frameWidth - controlSize / 2, frameY - controlSize / 2, controlSize, controlSize); // Top-right
        context.fillRect(frameX - controlSize / 2, frameY + frameHeight - controlSize / 2, controlSize, controlSize); // Bottom-left
        context.fillRect(frameX + frameWidth - controlSize / 2, frameY + frameHeight - controlSize / 2, controlSize, controlSize); // Bottom-right
    }
}

class Circle extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    draw(context) {
        context.fillStyle = this.color;
        const radius = this.size / 2;
        context.beginPath();
        context.arc(this.x, this.y, radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }

    drawFrame(context) {
        const {x, y, size, type} = this;

        let frameX, frameY, frameWidth, frameHeight;

        // Calculate frames for Circle
        frameX = x - size / 2;
        frameY = y - size / 2;
        frameWidth = frameHeight = size;
        super.drawFrame(context, frameX, frameY, frameWidth, frameHeight);
    }
}

class Square extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    draw(context) {
        context.fillStyle = this.color;
        const halfSize = this.size / 2;
        context.fillRect(this.x - halfSize, this.y - halfSize, this.size, this.size);
    }

    drawFrame(context) {
        const {x, y, size, type} = this;

        let frameX, frameY, frameWidth, frameHeight;

        // Calculate frame for Square
        frameX = x - size / 2;
        frameY = y - size / 2;
        frameWidth = frameHeight = size;
        super.drawFrame(context, frameX, frameY, frameWidth, frameHeight);
    }
}

class Triangle extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    draw(context) {
        context.fillStyle = this.color;

        const height = Math.sqrt(3) * this.size / 2;
        context.beginPath();
        context.moveTo(this.x, this.y - height / 2);
        context.lineTo(this.x - this.size / 2, this.y + height / 2);
        context.lineTo(this.x + this.size / 2, this.y + height / 2);
        context.closePath();
        context.fill();
    }

    drawFrame(context) {

        const { x, y, size, type } = this;

        let frameX, frameY, frameWidth, frameHeight;

        // Calculate frame for Circle
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

        super.drawFrame(context, frameX, frameY, frameWidth, frameHeight);
    }
}

class Hexagon extends Shape {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    draw(context) {
        context.fillStyle = this.color;
        const angleStep = Math.PI / 3;
        context.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = i * angleStep;
            const px = this.x + this.size * Math.cos(angle);
            const py = this.y + this.size * Math.sin(angle);
            if (i === 0) {
                context.moveTo(px, py);
            } else {
                context.lineTo(px, py);
            }
        }
        context.closePath();
        context.fill();
    }

    drawFrame(context) {
        const { x, y, size, type } = this;

        let frameX, frameY, frameWidth, frameHeight;

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

        super.drawFrame(context, frameX, frameY, frameWidth, frameHeight);
    }
}

class Canvas {
    constructor(canvasId) {
        this.canvasElement = document.getElementById(canvasId);
        this.context = this.canvasElement.getContext('2d');
        this.shapes = [];
        this.selectedShape = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.drawingColor = '#6A6A9F';
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

    // Method to handle mouse move event during dragging
    onMouseMove(event) {
        if (this.selectedShape) {
            const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
            const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;
            // Update shape coordinates based on mouse position and drag offsets
            this.selectedShape.x = mouseX - this.dragStartX;
            this.selectedShape.y = mouseY - this.dragStartY;
            this.drawShapes(); // Redraw canvas with updated shapes
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

    // Method to add a shape to the canvas
    addShape(shape) {
        this.shapes.push(shape);
        this.drawShapes();
    }

    drawShapes() {
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.shapes.forEach(shape => {
            shape.draw(this.context);
            shape.drawFrame(this.context);
        });
    }

    isPointInsideShape(x, y, shape) {
        const halfSize = shape.size / 2;

        if (shape instanceof Hexagon) {
            const height = Math.sqrt(3) * halfSize;
            const minX = shape.x + shape.size * Math.cos(3 * 2 * Math.PI / 6);
            const maxX = shape.x + shape.size * Math.cos(6 * 2 * Math.PI / 6);
            const minY = shape.y - height;
            const maxY = shape.y + height;

            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }

        return x >= shape.x - halfSize && x <= shape.x + halfSize && y >= shape.y - halfSize && y <= shape.y + halfSize;
    }

    setDrawingColor(color) {
        this.drawingColor = color;
    }
}

/**
 * // Class for managing user interface interactions
 */
class UI {
    constructor(canvasId) {
        this.canvas = new Canvas(canvasId);
        this.bindShapeHandlers();
        this.bindColorPicker();
        this.bindColorOptions();
        this.shapeConstructors = {
            [ShapeType.CIRCLE]: Circle,
            [ShapeType.SQUARE]: Square,
            [ShapeType.TRIANGLE]: Triangle,
            [ShapeType.HEXAGON]: Hexagon
        };
    }

    bindShapeHandlers() {
        const shapeHandles = document.querySelectorAll('.thumbnail');
        shapeHandles.forEach(handle => {
            handle.addEventListener('click', this.handleShapeClick.bind(this));
        });
    }

    bindColorPicker() {
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', this.handleColorChange.bind(this));
    }

    bindColorOptions() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', this.handleColorOptionClick.bind(this));
        });
    }

    handleShapeClick(event) {
        const { shape, sizeScale } = event.currentTarget.dataset;
        const { canvasElement: { width, height }, drawingColor } = this.canvas;
        const ShapeConstructor = this.shapeConstructors[shape];
        if (ShapeConstructor) {
            const newShape = new ShapeConstructor(width / 2, height / 2, Math.min(width, height) / parseInt(sizeScale), drawingColor);
            this.canvas.addShape(newShape);
        }
    }

    handleColorChange(event) {
        const color = event.target.value;
        this.handleSetCanvasDrawingColor(color);
    }

    handleColorOptionClick(event) {
        const { color } = event.currentTarget.dataset;
        this.handleSetCanvasDrawingColor(color);
    }

    handleSetCanvasDrawingColor(color) {
        this.canvas.setDrawingColor(color);

        // Set Toolbar icons color
        const icons = document.querySelectorAll("path, circle");

        icons.forEach(i => {
            i.style.fill = color
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new UI('canvas');
});
