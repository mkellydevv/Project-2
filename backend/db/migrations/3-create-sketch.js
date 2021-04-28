'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Sketches', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            points: {
                type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.SMALLINT))
            },
            flagged: {
                allowNull: false,
                defaultValue: 0,
                type: Sequelize.SMALLINT
            },
            nsfw: {
                allowNull: false,
                defaultValue: false,
                type: Sequelize.BOOLEAN
            },
            version: {
                allowNull: false,
                type: Sequelize.SMALLINT
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'Users'
                    }
                }
            },
            sketchBookId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'SketchBooks'
                    }
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('now')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('now')
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Sketches');
    }
};
