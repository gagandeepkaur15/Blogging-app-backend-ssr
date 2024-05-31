const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const Blog = require('../models/blog'); 
const Comment = require('../models/comment'); 

const router = Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, path.resolve("./public/uploads/")); 
    },
    filename: function(req, file, cb){
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({storage: storage});

router.get("/add-new", (req, res)=>{
    return res.render("addBlog", {
        user: req.user, //As this page also contains navbar which needs the user info
    });
});

router.get('/:id', async (req, res)=>{
    const blog = await Blog.findById(req.params.id).populate('createdBy'); //By using populate the entire user data will be fetched by the user id given in createdBy field
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    })
});

router.post("/", upload.single('coverImage'), async (req,res)=>{
    // console.log(req.body);
    // console.log(req.file);
    try {
        const { title, body } = req.body;
        const blog = await Blog.create({
            title,
            body,
            coverImageURL: `/public/uploads/${req.file.filename}`,
            createdBy: req.user._id,
        });
        console.log(blog);
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.log('Error creating blog:', error);
        return res.status(500).send('Server Error');
    }
});

router.post("/comment/:blogId", async (req, res)=>{
    const comment = await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;