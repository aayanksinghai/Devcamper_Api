const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const morgan = require('morgan')
const fileupload = require('express-fileupload') 
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const errorHandler = require('./middleware/error')
const mongoSanitize = require('express-mongo-sanitize')
const { mongo } = require('mongoose')

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

// Sanitize data
app.use(mongoSanitize())

// Set Security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100
})

app.use(limiter)

// Prevent HTTP param pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// Set Static folder
app.use(express.static(path.join(__dirname,'public')))

// Mount Routers
app.use('/api/v1/bootcamps', require('./routes/bootcamp'))
app.use('/api/v1/courses', require('./routes/courses'))
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/users', require('./routes/users'))
app.use('/api/v1/reviews', require('./routes/reviews'))




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