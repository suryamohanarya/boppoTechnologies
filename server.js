const express  = require('express')
const app = express()
const bodyParser= require('body-parser')
const cors = require('cors');
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

app.set('view engine' , 'ejs')
app.set('views' , __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

//Database
const mongo = require('./database/mongodb'); 
mongo()

const testRouter = require('./routes/testRouter')

app.get('/',(req,res)=>{
    res.render('test')
})

app.use('/assignment' , testRouter)

  
app.listen(process.env.PORT || 3000 , () =>{
    console.info("Server is Running On (Updated Version:- V.0.0.0.3)" + process.env.BASE_URL + ":" + process.env.PORT )
})