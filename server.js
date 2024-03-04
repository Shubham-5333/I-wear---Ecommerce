if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}



const express = require('express');
const app = express()
const bodyParser = require("body-parser");
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan');
const connectDB = require('./server/database/connection');
const session = require('express-session')




app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true 
}))





const PORT =process.env.PORT || 4000


app.set('view engine','ejs')



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
    res.setHeader("Pragma", "no-cache");  
    next()
})




app.use("/css",express.static(path.join(__dirname,"Assets/css")))
app.use("/images",express.static(path.join(__dirname,"Assets/images")))
app.use("/js",express.static(path.join(__dirname,"Assets/js")))

connectDB()


app.use('/',require('./server/router/UserRouter'))
app.use('/admin',require('./server/router/AdminRouter'))


app.listen(PORT,()=>console.log(`server running on http://localhost:${PORT}`));    