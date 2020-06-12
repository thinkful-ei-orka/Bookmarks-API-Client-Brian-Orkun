const { v4: uuid } = require('uuid');
const express = require('express')
const bookmarksRouter = require('express').Router();
const BookmarksService = require('./bookmark-service')
const logger = require('./logger');
const jsonParser = express.json();




bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {

        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                res.json(bookmarks);
            })
            .catch(next)

    })
    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const newBookmark = { title, url, description, rating }
        if (!title) {
            return res.status(400).json({
                error: {message: `Missing 'title' in request body`}
            })
        }

        if (!url) {
            return res.status(400).json({
                error: {message: `Missing 'url' in request body`}
            })
        }

        if (!rating) {
            return res.status(400).json({
                error: {message: `Missing 'rating' in request body`}
            })
        }


        BookmarksService.insertBookmarks(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                res
                    .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(bookmark)
            })
            .catch(next)

   
    })

bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .all((req, res, next) => {
        const { bookmark_id } = req.params
        BookmarksService.getById(
            req.app.get('db'),
            bookmark_id
        )
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${bookmark_id} not found`)
                    return res.status(404).json({
                        error: { message: `Bookmark Not Found` }
                      })
                }
                res.bookmark = bookmark
                next()
        })
        .catch(next)
    })


    .get((req, res) => {
        res.json({
            id: res.bookmark.id,
            title: res.bookmark.title,
            url: res.bookmark.url,
            description: res.bookmark.description,
            rating: res.bookmark.rating
        })
    })



    .delete((req, res, next) => {
        const {bookmark_id} = req.params
        BookmarksService.deleteBookmarks(
            req.app.get('db'),
            bookmark_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    });

module.exports = bookmarksRouter;
