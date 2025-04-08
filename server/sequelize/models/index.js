// models/index.js
const sequelize = require('../config/sequelize');

// все модели
const User = require('./user');
const UserProfile = require('./userProfile');
const Section = require('./section');
const File = require('./file');
const Ticket = require('./ticket');
const TicketTopic = require('./ticketTopic');

const models = {
  User,
  UserProfile,
  Section,
  File,
  Ticket,
  TicketTopic,
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
