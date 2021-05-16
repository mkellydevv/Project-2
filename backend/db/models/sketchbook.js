'use strict';
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const SketchBook = sequelize.define('SketchBook', {}, {});
    SketchBook.associate = function (models) {
        SketchBook.hasMany(models.Sketch, {
            foreignKey: 'sketchBookId'
        })
    };
    SketchBook.createNewSketchBook = async function () {
        const sketchBook = await SketchBook.create();
        return sketchBook.id;
    };
    SketchBook.getSketchBookCovers = async function () {
        const sketchBooks = await SketchBook.findAll({
            include: {
                model: sequelize.models.Sketch,
                limit: 1,
                attributes: ['points'],
            }
        });
        return { sketchBooks, sketchType: 'cover' };
    };
    SketchBook.getLatestSketchBookCovers = async function (newestId) {
        const sketchBooks = await SketchBook.findAll({
            where: {
                id: {
                    [Op.gt]: Number(newestId)
                }
            },
            include: {
                model: sequelize.models.Sketch,
                limit: 1,
                attributes: ['points'],
            }
        });
        return { sketchBooks, sketchType: 'cover' };
    };
    SketchBook.getSketchBookSketches = async function (sketchBookId) {
        const sketches = await SketchBook.findAll({
            include: {
                model: sequelize.models.Sketch,
                where: {
                    sketchBookId: Number(sketchBookId)
                },
                include: {
                    model: sequelize.models.User,
                    attributes: ['username']
                },
            },
        });
        return { sketches, sketchType: 'sketch' };
    }
    return SketchBook;
};
