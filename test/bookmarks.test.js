const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const {makeBookmarksArray} = require('./bookmarks.fixtures')


describe('bookmarks endpoints', () => {

    let db;

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
    
    // afterEach('clean the table', () => db('bookmarks').truncate());
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('bookmarks').truncate())
    afterEach('cleanup', () => db('bookmarks').truncate())
    

  describe('GET /bookmarks', () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('GET /bookmarks',()=>{
        return supertest(app)
            .get('/bookmarks')
            .expect(200, testBookmarks)
      })
      })
    })
    
  
      describe('GET /bookmarks/:bookmark_id', () => {
        context('Given there are bookmarks in the database', () => {
          const testBookmarks = makeBookmarksArray()
      
          beforeEach('insert bookmarks', () => {
            return db 
              .into('bookmarks')
              .insert(testBookmarks)
          })
      
          it('responds with 200 and the specified bookmark', () => {
            const bookmarkId = 1
            const expectedBookmark = testBookmarks[bookmarkId - 1]
            return supertest(app)
              .get(`/bookmarks/${bookmarkId}`)
              .expect(200, expectedBookmark)
          })
        })
      })
  
  describe(`POST /bookmarks`, () => {
    it('creates a bookmarks, responding with 201 and the new bookmark', function() {
      this.retries(3)
      const newBookmark = {
          title: 'Test new bookmark',
          url: 'some url',
          description: 'some desc',
          rating: 5
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
      
        })
        .then(postRes => 
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
          )
    })
    const requiredFields = ['title', 'url', 'rating']

    requiredFields.forEach(field => {
      const newBookmark = {
        title: 'Test new bookmark',
        url: 'some url',
        rating: 5
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookmark[field]

        return supertest(app)
          .post('/bookmarks')
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })


  })

  describe(`DELETE /bookmarks/:bookmark_id`, () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db 
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 204 and removes the artilce', () => {
        const idToRemove = 2
        const expectedBookmark = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/bookmarks`)
              .expect(expectedBookmark)
            )
      })
    })

    context(`Given no bookmarks`, () => {
      it('responds with 404', () => {
        const bookmarkId = 12345
        return supertest(app)
          .delete(`/bookmarks/${bookmarkId}`)
          .expect(404, {error: {message: `Bookmark doesn't exist` }})
      })
    })
  })
  
  describe('GET /bookmarks', () => {
    context('Given no bookmarks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, [])
          })
        })
  })
  
  describe.only(`GET /bookmarks/:bookmark_id`, () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 12345
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, {
            error: { message: `Bookmark Not Found` }
          })
      })
    })
  })


})

