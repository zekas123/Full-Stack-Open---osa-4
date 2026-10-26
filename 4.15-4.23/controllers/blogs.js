const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { title, url } = request.body

  if (!title || !url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const blog = new Blog(request.body)

  const result = await blog.save()
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
    { new: true, runValidators: true, context: 'query' }
  )

  if (!updatedBlog) {
    return res.status(404).end()
  }

  res.json(updatedBlog)
})


blogsRouter.use((error, request, response, next) => {
  console.error(error.message)
  response.status(500).json({ error: error.message })
})

module.exports = blogsRouter
