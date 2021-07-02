const Joi = require('joi')

class validation {

    create_user = (obj) => {
        return new Promise((resolve, reject) => {
            const schema = {
                firstName : Joi.string().required(),
                lastName  : Joi.string().required(),
                email: Joi.string().required(),
                password : Joi.string().required(),
                organization : Joi.string().required()
            };
          
            return resolve(Joi.validate(obj, schema));
        })
    }
}


module.exports = {
    validation : validation
}
