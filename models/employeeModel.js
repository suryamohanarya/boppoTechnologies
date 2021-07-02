const mongoose = require('mongoose'),
    Schema     = mongoose.Schema;

const Joi = require('joi');

const employeeSchema = new mongoose.Schema({
    employeeID : {
        type: Schema.Types.ObjectId,
        trim: true
    },
    organization  : {
        type: String,
        trim: true,
        lowercase : true
    }
},    
{
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

//@ mongoose pre hook(middleware)

const Employee =  mongoose.model('employees' , employeeSchema)



module.exports.Employee = Employee