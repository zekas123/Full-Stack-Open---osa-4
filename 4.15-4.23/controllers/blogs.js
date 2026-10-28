const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { title, url } = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'user not found' })
  }

  if (!title || !url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const blog = new Blog({
    ...request.body,
    user: user._id,
  })

  const result = await blog.save()

  if (user) {
    user.blogs = user.blogs.concat(result._id)
    await user.save()
  }

  await result.populate('user', { username: 1, name: 1 })
  response.status(201).json(result)
})
blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deletedBlog = await Blog.findByIdAndDelete(id)

  if (!deletedBlog) {
    return response.status(404).json({ error: 'blog not found' })
  }
  response.status(204).end()
})

blogsRouter.patch('/:id', async (req, res) => {
  const { likes } = req.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { likes }, 
    { returnDocument: 'after', runValidators: true, context: 'query' }
  )

  if (!updatedBlog) {
    return res.status(404).end()
  }

  res.json(updatedBlog)
})

module.exports = blogsRouter
