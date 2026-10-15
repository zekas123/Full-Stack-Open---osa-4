const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog') 
const listHelper = require('../utils/list_helper')
const { favoriteBlog } = require('../utils/list_helper')

const api = supertest(app)

const lol_blog = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  }
]

describe('unit tests (list helper)', () => {
  test('dummy returns one', () => {
    const blogs = []
    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  })

  describe('total likes', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
      }
    ]

    test('when list has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      assert.strictEqual(result, 5)
    })
  })

  describe('favorite blog', () => {
    const listWithMultipleBlogs = [
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12
      },
      {
        title: 'First class tests',
        author: 'Robert C. Martin',
        likes: 10
      }
    ]

    test('finds the blog with most likes', () => {
      const result = favoriteBlog(listWithMultipleBlogs)
      assert.deepStrictEqual(result, listWithMultipleBlogs[0])
    })

    test('when list is empty returns null', () => {
      const result = favoriteBlog([])
      assert.strictEqual(result, null)
    })
  })
})







describe('api tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(lol_blog)
  })

  test('how many blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)

    assert.strictEqual(response.body.length, lol_blog.length)
  })

  test('check ID', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)

    for (const blog of response.body) {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    }
  })

  test('if likes parameter is missing, it defaults to 0', async () => {
  const newBlogWithoutLikes = {
    title: 'Blog without likes',
    author: 'Some Author',
    url: 'https://example.com'

  }


  const response = await api
    .post('/api/blogs')
    .send(newBlogWithoutLikes)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})


test('blog without title is not added', async () => {
  const newBlogWithoutTitle = {
    author: 'Author Name',
    url: 'https://example.com',
    likes: 2

  }

  await api
    .post('/api/blogs')
    .send(newBlogWithoutTitle)
    .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, lol_blog.length)
})


test('blog without url is not added', async () => {
  const newBlogWithoutUrl = {
    title: 'Blog without url',
    author: 'Author Name',
    likes: 2
  }

  await api
    .post('/api/blogs')
    .send(newBlogWithoutUrl)
    .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, lol_blog.length)
})


  after(async () => {
    await mongoose.connection.close()
  })
})

