// lisätään tietokantaan kirjailijoille kirjalistat
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Author = require('./models/author')
const Book = require('./models/book')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
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

const getAuthors = async () => await Author.find({})

const getBooksByAuthor = async author =>
  await Book.find({ author: author._id }, '_id')
const addBooksLists = async uri => {
  await mongooseConnect(uri)
  const authors = await getAuthors()
  for (const author of authors) {
    console.log(author.name)
    const books = await getBooksByAuthor(author)
    // let dummyList = []
    for (const book of books) {
      console.log('adding to list book._id', book._id)
      // dummyList = dummyList.concat(book._id)
      author.books = author.books.concat(book._id)
    }
    // toimisiko tallennus tässä kohtaa?
    // toimi, nyt korjattu ja save() kommentoitu pois
    // await author.save()
    // console.log(dummyList)
  }
  mongoose.connection.close()
}

addBooksLists(MONGODB_URI)
