const mongoose = require('mongoose')
// const pino = require('pino');
// const logger = pino({
//     prettyPrint:  { colorize: true }
//   });
const DbConnection = () => {
     mongoose.connect(process.env.DATABASE_URL, { 
        useNewUrlParser: true , 
        useUnifiedTopology:true , 
        useFindAndModify:false , 
        useCreateIndex:true}).then(()=>{
            const db = mongoose.connection
            db.on('error', error =>{
                console.error("MongoDB error",error)
            })
            db.once('open', () => {
                console.info('MongoDB is Connected')
            })
            console.info('MongoDB is Connected')
        }).catch(error=>{
            console.log(error)
            console.error("MongoDB Connection Error",error)
    })
}

module.exports = DbConnection