const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const userExtractor = require('../middleware/userExtractor')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, url } = request.body
  const user = request.user

  if (!title || !url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const blog = new Blog({
    ...request.body,
    user: user._id,
  })

  const result = await blog.save()

  user.blogs = user.blogs.concat(result._id)
  await user.save()

  await result.populate('user', { username: 1, name: 1 })
  response.status(201).json(result)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params
  const user = request.user

  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  }

  await blog.deleteOne()

  user.blogs = user.blogs.filter(blogId => blogId.toString() !== id)
  await user.save()

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
