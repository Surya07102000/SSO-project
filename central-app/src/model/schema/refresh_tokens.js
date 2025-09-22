const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('refresh_tokens', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'refresh_tokens',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "refresh_tokens_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "refresh_tokens_token_key",
        unique: true,
        fields: [
          { name: "token" },
        ]
      },
      {
        name: "refresh_tokens_user_id_idx",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
}; 