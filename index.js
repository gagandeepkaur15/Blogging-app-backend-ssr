require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose =require("mongoose");
const cookieParser = require("cookie-parser");
 
const userRoute = require('./routes/user');
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require('./models/blog');

const blogRoute = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 8000;

// mongoose.connect('mongodb://127.0.0.1:27017/heyBlog').then((e)=>console.log("MongoDB Connected"));
mongoose.connect(process.env.MONGO_URI).then((e)=>console.log("MongoDB Connected"));

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public"))); //To get the image from public folder and get it displayed

app.get("/", async (req, res)=>{
    const allBlogs = await Blog.find({}); 
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, ()=>console.log(`Server started at PORT: ${PORT}`));