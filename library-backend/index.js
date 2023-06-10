// https://github.com/fullstack-hy2020/misc/blob/master/library-backend.js
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const { v1: uuid } = require('uuid')

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

let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963,
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821,
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime'],
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution'],
  },
]

/*
  you can remove the placeholder query once your first own has been implemented 
*/

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
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      const author = args.author
      const genre = args.genre
      const result = !author ? books : books.filter(b => b.author === author)
      return !genre
        ? result
        : result.filter(b => b.genres.some(g => g === genre))
    },
    allAuthors: () => authors,
  },
  Author: {
    bookCount: ({ name }) => {
      return books.filter(b => b.author === name).length
    },
  },
  Mutation: {
    addAuthor: (root, args) => addAuthorMutation(root, args),
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      const author = args.author
      if (!authors.map(a => a.name).includes(author)) {
        addAuthorMutation(root, { name: author })
      }
      return book
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
const addAuthorMutation = (root, args) => {
  const author = { ...args, id: uuid() }
  authors = authors.concat(author)
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
