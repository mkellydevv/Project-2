'use strict';
module.exports = (sequelize, DataTypes) => {
    const JoinSketchTag = sequelize.define('JoinSketchTag', {
        sketchId: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        tagId: {
            allowNull: false,
            type: DataTypes.INTEGER,
        }
    }, {});
    JoinSketchTag.associate = function (models) {
        JoinSketchTag.belongsTo(models.Sketch, {
            foreignKey: 'sketchId'
        });
        JoinSketchTag.belongsTo(models.Tag, {
            foreignKey: 'tagId'
        });
    };
    return JoinSketchTag;
};
