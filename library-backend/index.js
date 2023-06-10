// https://github.com/fullstack-hy2020/misc/blob/master/library-backend.js
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Author = require('./models/author')
const Book = require('./models/book')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addAuthor(
      name: String!
      born: Int
    ): Author
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    // materiaalissa käytetään MongoDB:n collection, jolloin
    // tämä voisi olla Book.collection.countDocuments()
    // mutta en löytänyt mitään syytä tai perustelua tuon käyttöön
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (root, args) => {
      const author = args.author
      const authorId = await Author.findOne({ name: author }, '_id')
      const genre = args.genre
      const result = !author
        ? await Book.find({}).populate('author', { name: 1, born: 1 })
        : await Book.find({ author: authorId._id }).populate('author', {
            name: 1,
            born: 1,
          })
      return !genre // TOODO muuta mongodb
        ? result
        : result.filter(b => b.genres.some(g => g === genre))
    },
    allAuthors: async () => Author.find({}),
  },
  Author: {
    bookCount: async ({ name }) => {
      const authorId = await Author.findOne({ name: name }, '_id')
      const bookCount = await Book.countDocuments({ author: authorId._id })
      return bookCount
    },
  },
  Mutation: {
    addAuthor: async (root, args) => await addAuthorOperation(root, args),
    addBook: async (root, args) => {
      const { author, ...newBookObject } = args
      //console.log(newBookObject)
      const authorId = await Author.findOne({ name: author }, '_id')
      if (!authorId) {
        const newAuthor = await addAuthorOperation(root, { name: author })
        //console.log(newAuthor)
        const newBook = new Book({
          ...newBookObject,
          author: newAuthor._id,
        })
        await newBook.save()
        return newBook
      }
      const newBook = new Book({
        ...newBookObject,
        author: authorId._id,
      })
      await newBook.save()
      return newBook
    },
    editAuthor: (root, { name, setBornTo }) => {
      //const { name: author, setBornTo: born } = args // tällä saa author ja born destrukturoitua
      if (authors.map(a => a.name).includes(name)) {
        // oletetaan, että kaimoja ei löydy
        const author = authors.find(a => a.name === name)
        const updatedAuthor = {
          ...author,
          name,
          born: setBornTo,
        }
        authors = authors.map(a => (a.name !== name ? a : updatedAuthor))
        return updatedAuthor
      }
      return null
    },
  },
}

// jollakulla toisella sama ongelma?:
// https://stackoverflow.com/questions/74089885/call-graphql-mutation-from-another-mutation
const addAuthorOperation = async (root, args) => {
  const author = new Author({ ...args })
  await author.save()
  return author
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
