const { Sequelize, Model, DataTypes } = require("sequelize");

// @ts-ignore
module.exports = class Terms extends Model {
    /**
     * @param {any} sequelize
     */
    static init(sequelize) {
        // @ts-ignore
        return super.init({
            type: {
                type: DataTypes.STRING,
                allowNull: false
            }, term: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: "term",
        });
    }
};