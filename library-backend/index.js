// https://github.com/fullstack-hy2020/misc/blob/master/library-backend.js
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const { GraphQLError } = require('graphql')

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
      // rakennetaan query json
      let query = author ? { author: authorId._id } : {}
      query = genre ? { ...query, genres: { $all: [genre] } } : query
      const result = await Book.find(query).populate('author', {
        name: 1,
        born: 1,
      })
      return result
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
    addBook: async (root, args) => {
      const { author, ...newBookObject } = args
      let authorId = await Author.findOne({ name: author }, '_id')
      if (!authorId) {
        const newAuthor = await addAuthorOperation(root, { name: author })
        authorId = newAuthor._id
      }
      const newBook = new Book({
        ...newBookObject,
        author: authorId._id,
      })
      try {
        await newBook.save()
      } catch (error) {
        throw new GraphQLError('Saving new book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error,
          },
        })
      }
      return newBook
    },
    editAuthor: async (root, { name, setBornTo }) => {
      const author = await Author.findOne({ name: name })
      if (author) {
        // if (Author.where(name).exists()) {
        //   console.log('myös Author.where(name).exists() löytää', name)
        // }

        author.born = setBornTo
        // tämä virheenkäsittely ei ainakaan nyt tee paljon mitään,
        // sillä syntymävuodelle ei anneta mitään vaatimuksia ja
        // huonot ei lukuarvoiset mutation kyselyt GraphQL:n validaatio
        // nappaa itse kiinni
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Editing author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: { name, setBornTo },
              error,
            },
          })
        }

        return author
      }
      return null
    },
  },
}

// jollakulla toisella sama ongelma?:
// https://stackoverflow.com/questions/74089885/call-graphql-mutation-from-another-mutation
const addAuthorOperation = async (root, args) => {
  const author = new Author({ ...args })
  try {
    await author.save()
  } catch (error) {
    throw new GraphQLError('Adding new author failed', {
      extensions: {
        code: 'BAD_USER_INPUT',
        invalidArgs: args,
        error,
      },
    })
  }
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
