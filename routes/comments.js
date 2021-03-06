const express = require('express')
const router = express.Router({mergeParams: true})
const Boat = require('../models/boat')
const Comment = require('../models/comment')
const middleware = require('../middleware')



//===========================================
// COMMENTS ROUTES
//===========================================


//comments new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    Boat.findById(req.params.id, (err, boat) => {
        if (err) {
            console.log(err)
        } else {
            res.render('comments/new.ejs', {boat: boat})
        }
    })
})

//comments create
router.post('/', middleware.isLoggedIn, (req, res) => {
    //lookup boat using id
    Boat.findById(req.params.id, (err, boat) => {
        if (err) {
            console.log(err)
            res.redirect('/boats')
        } else {
            //create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash('error', 'something went wrong')
                    console.log(err)
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id
                    comment.author.username = req.user.username
                    comment.save()
                    //connect new comment to boat
                    boat.comments.push(comment)
                    boat.save()
                    req.flash('success', 'Succesfully added comment')
                    //redirect
                    res.redirect(`/boats/${boat._id}`)
                }
            })
        }
    })
})

//comments edit route
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect('back')
        } else {
            res.render('comments/edit.ejs', {boat_id: req.params.id, comment: foundComment})
        }
    })
})

//comment update
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect('back')
        } else {
            res.redirect(`/boats/${req.params.id}`)
        }
    })
})

//comment destroy route
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            req.flash('info', 'Comment deleted')
            res.redirect(`/boats/${req.params.id}`)
        }
    })
})

module.exports = router