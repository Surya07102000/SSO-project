const { DataTypes } = require('sequelize');
const applicationSchema = require('./schema/application.js');
const userSchema = require('./schema/user.js');
const invitationTokenSchema = require('./schema/invitation_tokens.js');
const refreshTokenSchema = require('./schema/refresh_tokens.js')
const { sequelize } = require('../config/db_conn');

const applications = applicationSchema(sequelize)
const users = userSchema(sequelize, DataTypes);
const invitation_tokens = invitationTokenSchema(sequelize, DataTypes);
const refresh_tokens = refreshTokenSchema(sequelize, DataTypes);

refresh_tokens.belongsTo(users, { as: "user", foreignKey: "user_id"});
users.hasMany(refresh_tokens, { as: "refresh_tokens", foreignKey: "user_id"});

module.exports = {
  applications,
  users,
  invitation_tokens,
  refresh_tokens,
  sequelize
}; 