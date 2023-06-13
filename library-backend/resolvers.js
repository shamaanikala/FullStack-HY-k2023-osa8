const { GraphQLError } = require('graphql')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

// Author.where(name).exists()

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
    allAuthors: async () => await Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    },
    allGenres: async () => {
      const result = await Book.distinct('genres')
      // console.log('allGenres', result)
      return result
    },
  },
  Author: {
    bookCount: async ({ name }) => {
      const authorId = await Author.findOne({ name: name }, '_id')
      const bookCount = await Book.countDocuments({ author: authorId._id })
      return bookCount
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      checkAuthentication(context)

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
      // populate ennen return, koska fronend ei muuten saa Author.name
      await newBook.populate('author', { name: 1 })

      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })

      return newBook
    },
    editAuthor: async (root, { name, setBornTo }, context) => {
      checkAuthentication(context)

      const author = await Author.findOne({ name: name })
      if (author) {
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

    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre })

      return user.save().catch(error => {
        throw new GraphQLError('Creating a new user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: { username, favoriteGenre },
            error,
          },
        })
      })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'salainen') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
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

const checkAuthentication = context => {
  const currentUser = context.currentUser
  if (!currentUser) {
    throw new GraphQLError('not authenticated', {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    })
  }
  return true
}

module.exports = resolvers
