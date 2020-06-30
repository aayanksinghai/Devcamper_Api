const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const morgan = require('morgan')
const fileupload = require('express-fileupload') 
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')
//Load env vars
dotenv.config({ path: './config/config.env'})

//Connect to Database
connectDB()

const app = express()

// Body Parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Dev logging middleware
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'))
}

//File Uploading
app.use(fileupload())

// Set Static folder
app.use(express.static(path.join(__dirname,'public')))

// Mount Routers
app.use('/api/v1/bootcamps', require('./routes/bootcamp'))
app.use('/api/v1/courses', require('./routes/courses'))
app.use('/api/v1/auth', require('./routes/auth'))


app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)) 


// Handle Unhandle promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`)
    //Close server & exit process
    server.close(() => process.exit(1))
 })