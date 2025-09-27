require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskify'

;(async function start() {
  await connectDB(MONGODB_URI)
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
})()
