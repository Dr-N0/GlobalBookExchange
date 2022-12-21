const express = require('express');
const router = express.Router();

const BookModel = require('../models/book');

const authMiddleware = require('../middleware/authMiddleware');
const book = require('../models/book');

router.get('/', (req, res) => {
    res.render('books/index');
});

router.get('/add', authMiddleware, (req, res) => {
    res.render('books/add', { layout: 'layouts/formPageLayout', errorISBN: '', errorTitle: '', });
});

router.post('/add', authMiddleware, (req, res) => {
    const url = 'https://googleapis.com/v1/volumes/' + req.body.bookID;
    fetch(url, {
        method: 'GET',
    })
        .then(resp => resp.json())
        .then(async data => {
            try {
                const bookInfo = data.volumeInfo;
                const userID = res.locals.userID;
                const update = { $push: { sourceUsers: userID } };
                let book = await BookModel.findOneAndUpdate({
                    bookDetails: {
                        isbn: bookInfo.isbn,
                        title: bookInfo.title,
                        authors: bookInfo.authors,
                        publisher: bookInfo.publisher,
                        publishedDate: bookInfo.publishedDate,
                    },
                }, update, {
                    new: true,
                });
                if (!book) {
                    newBook = new BookModel({
                        sourceUsers: userID,
                        bookDetails: {
                            isbn: bookInfo.isbn,
                            title: bookInfo.title,
                            authors: bookInfo.authors,
                            publisher: bookInfo.publisher,
                            publishedDate: bookInfo.publishedDate,
                            description: bookInfo.description
                        }
                    });
                    await newBook.save();
                }
                res.status(200).redirect('/profile/');
            }
            catch (e) {

            }
        })
    res.send('Book Added');
});

router.get('/add-by-isbn', authMiddleware, (req, res) => {
    const url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + req.query['addBookISBN'] + '&printType=books';
    fetch(url, {
        method: 'GET',
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.totalItems > 0) {
                bookListData = {
                    totalBooks: data.totalItems,
                    bookData: [],
                };
                for (let bookIndex in data.items) {
                    const bookInfo = data.items[bookIndex].volumeInfo;
                    const params = {
                        title: bookInfo.title,
                        author: bookInfo.authors,
                        publisher: bookInfo.publisher,
                        publishedDate: bookInfo.publishedDate,
                        description: bookInfo.description,
                        thumbnailLink: bookInfo.imageLinks.thumbnail,
                        identifier: data.items[bookIndex].id,
                    };
                    bookListData.bookData.push(params);
                }
                res.render('books/add-by-search', { layout: 'layouts/interiorPageLayout', bookList: bookListData });
            } else {
                res.render('books/add', { layout: 'layouts/formPageLayout', errorISBN: 'No Books Found', errorTitle: '', });
            }
        })
        .catch(error => console.log(error));
});

router.get('/add-by-title', authMiddleware, (req, res) => {
    const url = 'https://www.googleapis.com/books/v1/volumes?q=inauthor:' + req.query['addBookAuthor'] + '+intitle:' + req.query['addBookTitle'] + '&printType=books';
    fetch(url, {
        method: 'GET',
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.totalItems > 0) {
                bookListData = {
                    totalBooks: data.totalItems,
                    bookData: [],
                };
                for (let bookIndex in data.items) {
                    const bookInfo = data.items[bookIndex].volumeInfo;
                    if (!bookInfo.authors.includes(req.query['addBookAuthor'])) continue;
                    const params = {
                        title: bookInfo.title,
                        authors: bookInfo.authors,
                        publisher: (bookInfo.publisher ? bookInfo.publisher : 'Unavailable'),
                        publishedDate: (bookInfo.publishedDate ? bookInfo.publishedDate : 'Unavailable'),
                        description: (bookInfo.description ? bookInfo.description : 'Unavailable'),
                        thumbnailLink: (bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : ''),
                        identifier: data.items[bookIndex].id,
                    };
                    bookListData.bookData.push(params);
                }
                res.render('books/add-by-search', { layout: 'layouts/interiorPageLayout', bookList: bookListData, });
            } else {
                res.render('books/add', { layout: 'layouts/formPageLayout', errorISBN: '', errorTitle: 'No Books Found', });
            }
        })
        .catch(error => console.log(error));
});

router.get('/search', (req, res) => {
    res.send('Book Search');
});

module.exports = router;
