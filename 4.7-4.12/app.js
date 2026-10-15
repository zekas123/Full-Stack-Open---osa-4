const config = require('./utils/config')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const { favoriteBlog } = require('./utils/list_helper')

console.log('connecting to MongoDB...')

mongoose.connect(config.mongoUrl, { family: 4, serverSelectionTimeoutMS: 5000, bufferTimeoutMS: 5000 })
  .then(() => {
    console.log('connected to MongoDB Atlas')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

app.use(express.json())
app.use('/api/blogs', blogsRouter)


module.exports = app