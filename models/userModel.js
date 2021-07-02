const mongoose = require('mongoose'),
    Schema     = mongoose.Schema;

const Joi = require('joi');

const userSchema = new mongoose.Schema({
    firstName  : {
        type: String,
        trim: true,
        lowercase : true
    },
    lastName  : {
        type: String,
        trim: true,
        lowercase : true
    },
    email  : {
        type: String,
        trim: true,
        lowercase : true
    },
    password  : {
        type: String,
        trim: true
    }
},    
{
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

//@ mongoose pre hook(middleware)

const User =  mongoose.model('users' , userSchema)

function validateUser(user) {
    const schema = {
        firstName    : Joi.string().required(),
        lastName     : Joi.string().required(),
        email        : Joi.string().required(),
        password     : Joi.string().required(),
        organization : Joi.string().required()
    };
  
    return Joi.validate(user, schema);
  }

  function validateLoginUser(user) {
    const schema = {
        email    : Joi.string().required(),
        password : Joi.string().required()
    };
  
    return Joi.validate(user, schema);
  }

  function sortAndFilter(user) {
    const schema = {
        page    : Joi.number().required(),
        limit   : Joi.number().required(),
        firstName   : Joi.string(),
        lastName   : Joi.string(),
        employeeID   : Joi.string(),
        email   : Joi.string()
    };
  
    return Joi.validate(user, schema);
  }

  function sort(user) {
    const schema = {
        page    : Joi.number().required(),
        limit   : Joi.number().required(),
        firstName   : Joi.number(),
        lastName   : Joi.number(),
        employeeID   : Joi.number(),
        email   : Joi.number()
    };
  
    return Joi.validate(user, schema);
  }

module.exports.User = User
module.exports.validate = validateUser
module.exports.validateLogin = validateLoginUser
module.exports.sortAndFilter = sortAndFilter
module.exports.sort = sort

