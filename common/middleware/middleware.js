/* eslint-disable indent,semi,quotes,no-unused-vars */
const path      = require('path'),
    jwtToken    = require('jsonwebtoken'),
    mongoose    = require('mongoose'),
    {User}   = require('../../models/userModel');


class Middleware {
    checkAuthorization(req, res, next) {
        if (!req.headers.authorization) {
            return res.status(401).send({error: 'Missing Authorization Header'})
        } else {
            jwtToken.verify(req.headers.authorization , process.env.JWT_KEY , async function(error , decodedToken){
                if(error){
                    return res.send({error: "Token not valid"})
                }else{
                    await User.findOne({_id : decodedToken._id} , {email: 1})
                        .then(async(user_data) => {
                            if(!user_data){
                                return res.send({error: "You are not a valid user"})
                            }else{
                                req.token = user_data
                                next()
                            }
                        }).catch((err) => {
                            return res.send({error: "You are not a valid user"})
                        })
                }
            })

        }
    }
    
// all end    
}


module.exports = Middleware;
