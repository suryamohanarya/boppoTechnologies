
ResGen = (status , error , message , data) =>{

    try {
        data = {
            status : status,
            error  : error,
            message : message,
            data:data
        }
        return data
    } catch (error) {
        return error
    }

}

module.exports = ResGen