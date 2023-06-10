const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Author = require('./models/author')
const Book = require('./models/book')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
// console.log('mongoose-populate.js: connecting to', MONGODB_URI)

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => {
//     console.log('mongoose-populate.js: connected to MongoDB')
//   })
//   .catch(error => {
//     console.log(
//       'mongoose-populate.js: error connecting to MongoDB:',
//       error.message
//     )
//   })

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

const addAuthor = author => {
  console.log('adding author', author.name)
}

const addBook = book => {
  console.log('adding book', book.title)
}

const saveAuthor = async author => {
  const { id, ...newAuthorObject } = author // discard the id
  const newAuthor = new Author(newAuthorObject)
  await newAuthor.save()
}

const saveBook = async book => {
  const { id, author, ...newBookObject } = book
  const authorId = await Author.findOne({ name: author }, '_id')
  const newBook = new Book({ ...newBookObject, author: authorId._id })
  //console.log({ ...newBookObject, author: authorId._id })
  await newBook.save()
}

//console.log(process.argv, process.argv.length)
// run the script with populate command line argument to actually save data
// node mongoose-populate.js populate
//
let dryrun = true
if (process.argv.length < 3) {
  console.log('mongoose-populate.js: No command line arguments given')
  console.log('=>  initiating dry run.')
} else if (process.argv[2] === 'populate') {
  console.log('mongoose-populate.js: populating MongoDB database...')
  dryrun = false
} else {
  console.log('mongoose-populate.js: Unknown command line arguments given')
  console.log('=>  initiating dry run.')
}

const populateAuthors = async (authors, dryrun) => {
  console.log('mongoose-populate.js: adding authors...')
  for (const author of authors) {
    addAuthor(author)
    const { id, ...newAuthorObject } = author // discard the id
    console.log('newAuthor:', newAuthorObject)
    if (!dryrun) {
      await saveAuthor(author)
    }
  }
  console.log('mongoose-populate.js: authors added')
}

const populateBooks = async (books, dryrun) => {
  console.log('mongoose-populate.js: adding books...')
  for (const book of books) {
    addBook(book)
    const { id, ...newBookObject } = book
    console.log('newBook:', newBookObject)
    if (!dryrun) {
      await saveBook(book)
    }
  }
  console.log('mongoose-populate.js: books added')
}

const mongooseConnect = async uri => {
  try {
    await mongoose.connect(uri)
    console.log('mongoose-populate.js: connected to MongoDB')
  } catch (error) {
    console.log(
      'mongoose-populate.js: error connecting to MongoDB:',
      error.message
    )
  }
}

const populate = async (uri, authors, books, dryrun) => {
  await mongooseConnect(uri)

  await populateAuthors(authors, dryrun)
  await populateBooks(books, dryrun)

  mongoose.connection.close()
}

populate(MONGODB_URI, authors, books, dryrun)
