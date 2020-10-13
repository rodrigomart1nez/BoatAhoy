const express  = require('express')
const    app        = express()
const    bodyParser = require('body-parser')
const    mongoose   = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const LocalStrategy  = require('passport-local')
const    Boat = require('./models/boat')
const User  = require('./models/user')
const    seedDB     = require('./seeds')
const  Comment   = require('./models/comment')
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)

//requiring routes
const commentRoutes = require('./routes/comments')
const boatRoutes = require('./routes/boats')
const authRoutes = require('./routes/auth')

//console.log(process.env.DATABASEURL)

// seedDB() //
const url = process.env.DATABASEURL || 'mongodb://localhost:27017/yelp_camp_v12D'

mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false
 }).then(() => {
     console.log('connected to de DB')
 }).catch(err => {
     console.log(`ERROR: ${err.message}`)
 })
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname+'/public'))
app.use(methodOverride('_method'))
app.use(flash())


//Pasport config
app.use(session({
    secret: 'kuloz',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 } // 180 minutes session expiration
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    res.locals.info = req.flash('info')
    next()
})


app.use(authRoutes)
app.use('/boats', boatRoutes)
app.use('/boats/:id/comments', commentRoutes)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server started...')
})
