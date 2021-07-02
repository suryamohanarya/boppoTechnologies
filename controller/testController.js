let JWT                = require('jsonwebtoken')
const mongoose         = require('mongoose')
const SendResponse     = require('../common/errors/response')
const {User, validate, validateLogin, sortAndFilter, sort} = require('../models/userModel');
const {Employee} = require('../models/employeeModel');

class Test {

    createUser = async (req , res) => {
        try{
            // validating req.body
            const { error } = validate(req.body); 
            if (error) return res.status(400).send({"err": 1 , "msg" : error.details[0].message});

            const user_obj = {
                firstName     : req.body.firstName,
                lastName      : req.body.lastName,
                email         : req.body.email.toLowerCase(),
                password      : req.body.password
            }
            let employee_obj = {
                organization : req.body.organization
            }
            // check for email already exist or not
            await User.findOne({email : user_obj.email} , {email : 1})
                .then(async(check_user) => { // if success
                    if(check_user){ // if already exist
                        const response = SendResponse(400 , true , "Email already exist", null)
                        return res.status(response.status).send(response)
                    }
                    // creating user
                    await User.create(user_obj)
                        .then((data) => {
                            employee_obj.employeeID = data._id

                            Employee.create(employee_obj)
                                .then((employe_data) => {
                                    const response = SendResponse(200 , false , "User created successfully", null)
                                    return res.status(response.status).send(response)
                                }).catch((err) => {
                                    const delete_user = User.deleteOne({email : user_obj.email})
                                    const response = SendResponse(400 , true , "Error in employee creation", null)
                                    return res.status(response.status).send(response)
                                })

                        }).catch((err) => {
                            const response = SendResponse(400 , true , "Error in user creation", null)
                            return res.status(response.status).send(response)
                        })
                }).catch((err) => { // if error
                    const response = SendResponse(400 , true , "Error in user check", null)
                    return res.status(response.status).send(response)
                })

        }catch(e){
            const response = SendResponse(500 , true , "Internal Server Error", null)
            return res.status(response.status).send(response)
        }
    }

    loginUser =  async (req , res) => {
        try{
            const { error } = validateLogin(req.body); 
            if (error) return res.status(400).send({"err": 1 , "msg" : error.details[0].message});

            let user_obj = {
                email    : req.body.email.toLowerCase(),
                password : req.body.password
            }

            await User.findOne({email : user_obj.email} , {email : 1 , password : 1 , firstName : 1 , lastName : 1})
                .then(async(check_user) => {
                    if(!check_user){
                        const response = SendResponse(400 , true , "Email not exist", null)
                        return res.status(response.status).send(response)
                    }
                    if(user_obj.password !== check_user.password){
                        const response = SendResponse(400 , true , "Password didn't matched", null)
                        return res.status(response.status).send(response)
                    }

                    const _token = JWT.sign({
                        _id       : check_user._id,
                        email     : check_user.email,
                        firstName : check_user.firstName,
                        lastName  : check_user.lastName
                    },
                    process.env.JWT_KEY,
                    { expiresIn: '365d' })

                    const response = SendResponse(200 , false , "Log in successfully", _token)
                    return res.status(response.status).send(response)

                }).catch((err) => {
                    const response = SendResponse(400 , true , "Error in user check", null)
                    return res.status(response.status).send(response)
                })
        }catch(e){
            const response = SendResponse(500 , true , "Internal Server Error", null)
            return res.status(response.status).send(response)
        }
    }

    listUser =  async (req , res) => {
        try{
            const { error } = sortAndFilter(req.body); 
            if (error) return res.status(400).send({"err": 1 , "msg" : error.details[0].message});
            if(req.body.limit <= 0 || req.body.page <= 0){
                const response = SendResponse(400 , true , "page or limit should be greater than 0", null)
                return res.status(response.status).send(response) 
            }
            let limit  = parseInt(req.body.limit)
            let skip = (parseInt(req.body.page)-1)*parseInt(limit)

            await User.aggregate([
                { $skip : skip },
                { $limit: limit },
                {
                    $lookup : {
                      from         : "employees",
                      localField   : "_id",
                      foreignField : "employeeID",
                      as           : "employee"
                    }
                },
                {
                    $project : {
                        firstName    : "$firstName",
                        lastName     : "$lastName",
                        email        : "$email",
                        employeeID   : { $arrayElemAt : ["$employee.employeeID", 0]},
                        organization : { $arrayElemAt : ["$employee.organization", 0]}
                    }
                }
            ])
                .then((user_data) => {
                    const response = SendResponse(200 , false , "filter data", user_data)
                    return res.status(response.status).send(response) 

                }).catch((err) => {
                    console.log(err)
                    const response = SendResponse(500 , true , "Issue in user list", null)
                    return res.status(response.status).send(response)
                })


        }catch(e){
            const response = SendResponse(500 , true , "Internal Server Error", null)
            return res.status(response.status).send(response)
        }
    }

    filterUser =  async (req , res) => {
        try{
            const { error } = sortAndFilter(req.body); 
            if (error) return res.status(400).send({"err": 1 , "msg" : error.details[0].message});
            if(req.body.limit <= 0 || req.body.page <= 0){
                const response = SendResponse(400 , true , "page or limit should be greater than 0", null)
                return res.status(response.status).send(response) 
            }
            let limit  = parseInt(req.body.limit)
            let skip = (parseInt(req.body.page)-1)*parseInt(limit)

            const json = req.body
            let query_obj = {}
            
            if(json.firstName !== undefined && json.firstName !== ""){
                query_obj.firstName = json.firstName.toLowerCase()
            }
            if(json.lastName !== undefined && json.lastName !== ""){
                query_obj.lastName = json.lastName.toLowerCase()
            }
            if(json.email !== undefined && json.email !== ""){
                query_obj.email = json.email.toLowerCase()
            }
            if(json.employeeID !== undefined && json.employeeID !== ""){
                query_obj._id = json.employeeID
            }

            await User.aggregate([
                {
                    $match : query_obj
                },
                { $skip : skip },
                { $limit: limit },
                {
                    $lookup : {
                      from         : "employees",
                      localField   : "_id",
                      foreignField : "employeeID",
                      as           : "employee"
                    }
                },
                {
                    $project : {
                        firstName    : "$firstName",
                        lastName     : "$lastName",
                        email        : "$email",
                        employeeID   : { $arrayElemAt : ["$employee.employeeID", 0]},
                        organization : { $arrayElemAt : ["$employee.organization", 0]}
                    }
                }
            ])
                .then((user_data) => {
                    const response = SendResponse(200 , false , "filter data", user_data)
                    return res.status(response.status).send(response) 

                }).catch((err) => {
                    const response = SendResponse(500 , true , "Issue in user filter", null)
                    return res.status(response.status).send(response)
                })


        }catch(e){
            const response = SendResponse(500 , true , "Internal Server Error", null)
            return res.status(response.status).send(response)
        }
    }

    sortUser =  async (req , res) => {
        try{
            const { error } = sort(req.body); 
            if (error) return res.status(400).send({"err": 1 , "msg" : error.details[0].message});

            if(req.body.limit <= 0 || req.body.page <= 0){
                const response = SendResponse(400 , true , "page or limit should be greater than 0", null)
                return res.status(response.status).send(response) 
            }

            let limit  = parseInt(req.body.limit)
            let skip = (parseInt(req.body.page)-1)*parseInt(limit)

            const json = req.body
            let query_obj = {}
            
            if(json.firstName !== undefined && json.firstName !== ""){
                query_obj.firstName = 1
            }
            if(json.lastName !== undefined && json.lastName !== ""){
                query_obj.lastName = 1
            }
            if(json.email !== undefined && json.email !== ""){
                query_obj.email = 1
            }
            if(json.employeeID !== undefined && json.employeeID !== ""){
                query_obj._id = 1
            }

            console.log(query_obj)

            await User.aggregate([
                { $skip : skip },
                { $limit: limit },
                { $sort : query_obj },
                {
                    $lookup : {
                      from         : "employees",
                      localField   : "_id",
                      foreignField : "employeeID",
                      as           : "employee"
                    }
                },
                {
                    $project : {
                        firstName    : "$firstName",
                        lastName     : "$lastName",
                        email        : "$email",
                        employeeID   : { $arrayElemAt : ["$employee.employeeID", 0]},
                        organization : { $arrayElemAt : ["$employee.organization", 0]}
                    }
                }
            ])
                .then((user_data) => {
                    const response = SendResponse(200 , false , "filter data", user_data)
                    return res.status(response.status).send(response) 

                }).catch((err) => {
                    const response = SendResponse(500 , true , "Issue in user filter", null)
                    return res.status(response.status).send(response)
                })


        }catch(e){
            const response = SendResponse(500 , true , "Internal Server Error", null)
            return res.status(response.status).send(response)
        }
    }

}

module.exports = Test
