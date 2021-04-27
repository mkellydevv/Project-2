const SKETCH_VERSION = 1;

'use strict';
module.exports = (sequelize, DataTypes) => {
    const Sketch = sequelize.define('Sketch', {
        points: {
            type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.SMALLINT))
        },
        flagged: {
            allowNull: false,
            type: DataTypes.SMALLINT,
            validate: {
                min: 0
            }
        },
        nsfw: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        },
        version: {
            allowNull: false,
            type: DataTypes.SMALLINT
        },
        userId: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        sketchBookId: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, {});
    Sketch.associate = function (models) {
        // associations can be defined here
    };
    Sketch.getAllSketches = async function () {
        return await Sketch.findAll();
    }
    Sketch.getSketchById = async function (id) {
        return await Sketch.findByPk(id);
    }
    Sketch.createNewSketch = async function({ userId, sketchBookId, points, flagged, nsfw }) {
        const sketch = await Sketch.create({
            userId,
            sketchBookId,
            points,
            flagged,
            nsfw,
            version: SKETCH_VERSION
        });
        return sketch;
    }
    return Sketch;
};
