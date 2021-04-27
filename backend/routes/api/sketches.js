const express = require('express');
const asyncHandler = require('express-async-handler');

const { Sketch } = require('../../db/models');

const router = express.Router();

// Get all sketches
router.get('/', asyncHandler(async function(_req, res) {
    const sketches = await Sketch.getAllSketches();
    return res.json(sketches);
}));

// Get a sketch by id
router.get('/:id', asyncHandler(async function(req, res) {
    const sketch = await Sketch.getSketchById(req.params.id);
    return res.json(sketch);
}));

// Create a new sketch
router.post('/', asyncHandler(async function(req, res) {
    const { userId, sketchBookId, points, flagged, nsfw } = req.body;
    const sketch = await Sketch.createNewSketch({ userId, sketchBookId, points, flagged, nsfw });
    return res.json(sketch);
}));

// Update a sketch
router.patch('/:id', asyncHandler(async function(req, res) {
    const sketch = await Sketch.updateSketch(req.params.id, req.body);
    return res.json(sketch);
}));


module.exports = router;
