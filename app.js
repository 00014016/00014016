//TODO Blogging app "WIUT CATCH_UP"(CRUD+validation)
const fs = require('fs')
const express = require('express')
const app = express()
const port = 8000
const id = require('uniqid')
const { get } = require('http')
const { response } = require('express')
const multer = require("multer");
const path = require("path");
const e = require('express')


app.set('view engine','pug')
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use('/assets', express.static(process.cwd() + '/assets'));
app.use('/static', express.static('public'))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

let upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }

    cb(undefined, true);
  },
  storage: storage,
});



app.get('/', (req, res) => {
  let created =req.query.created
  let blogs = getAll('blogs')
  if(created){
    res.render('home',{created:true,blogs:blogs})

  }else{
    res.render('home',{created:false,blogs:blogs})
  }
})



app.get('/blog/:id',(req,res) => {
  const id =req.params.id

  fs.readFile('./data/blogs.json',(err,data)=>{
    if(err) throw err

    const blogs = JSON.parse(data)

    const blog = blogs.filter(blog=>blog.id==id)[0]
    res.render('detail',{blog:blog})
  })
})

app.get('/update/:id',(req,res) => {
  const id =req.params.id

  fs.readFile('./data/blogs.json',(err,data)=>{
    if(err) throw err

    const blogs = JSON.parse(data)

    const blog = blogs.find(blog=>blog.id==id)
    console.log(blog);
    
    res.render('update',{ blog })
  })
})

app.post('/update/:id',upload.single("image"), (req, res) => {
  const id = req.params.id;
  const { title, name, news } = req.body;
  const image = req?.file?.filename; 

  console.log(req.body);
  fs.readFile('./data/blogs.json',(err,data)=>{
    if(err) throw err

    const blogs = JSON.parse(data)

    const foundBlog = blogs.find(blog => blog.id === id)
    const otherBlogs = blogs.filter(blog=>blog.id !== id)
    
    const updatedBlog = {
      id,
      title,
      name,
      news,
      image: image ? image : foundBlog.image
    }
    console.log('updatedBlog',updatedBlog)
    const updatedBlogs = [...otherBlogs, updatedBlog]
    fs.writeFile('./data/blogs.json', JSON.stringify(updatedBlogs), err=>{
      if (err) throw err
  
      res.render('update',{success:true, blog: foundBlog})// res.render('create', { success: true })
    })
  })
})
// app.post("/:id/update")







app.get('/create', (req, res) => {
  res.render('create',{})
})

app.get('/allblogs', (req, res)=>{

  fs.readFile('./data/blogs.json', (err, data)=>{
    const blogs = JSON.parse(data)
    res.render('allblogs', { blogs: blogs })
  })
 
})



app.get("/:id/delete", (req,res)=>{
  const id = req.params.id
  fs.readFile('./data/blogs.json', (error, data)=>{
    if (error)throw error
    const blogs = JSON.parse(data)
    const filteredBlogs = blogs.filter(blog=>blog.id !=id)
    fs.writeFile('./data/blogs.json',JSON.stringify(filteredBlogs),(error)=>{
      if(error) throw error
      res.render('allblogs',{blogs:filteredBlogs,deleted:true})
    })
  })
})
 
app.post('/create',upload.single("image"), (req, res)=>{
  const title = req.body.title
  const name = req.body.name
  const news = req.body.news
  const image = req?.file?.filename || ""; 
  // following piece for date and time 
  const timestamp = new Date();
  const year = timestamp.getFullYear();
  const month = (timestamp.getMonth() + 1).toString().padStart(2, "0");
  const day = timestamp.getDate().toString().padStart(2, "0");
  const date = `${year}/${month}/${day}`;
  // const options = { year: 'numeric', month: 'long', day: 'numeric' };
 
  const hours = timestamp.getHours().toString().padStart(2, "0");
  const minutes = timestamp.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;


  console.log('req', req.file)
  console.log('image', image)
  if (title.trim() === ''){
    res.render('create', { invalidtitle: true })
  }
  else if (name.trim() === ''){
    res.render('create', { invalidname: true })
  }
  else if (news.trim() === ''){
    res.render('create', { invalidnews: true})
  }
  else{
    fs.readFile('./data/blogs.json', (err, data) =>{
      if (err) throw err

      const blogs = JSON.parse(data)

      const blog = {
          id: id(),
          title: title,
          name: name,
          news: news,
          image,
          date,
          time
      }

      blogs.push(blog)
      fs.writeFile('./data/blogs.json', JSON.stringify(blogs), err=>{
        if (err) throw err

        res.render('create',{success:true})// res.render('create', { success: true })
      })
    })
  }

  
    

// image uploading 





  
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



function getAll(filename){
  return JSON.parse(fs.readFileSync(`./data/${filename}.json`))
}
function writeAll(filename, data){
  return fs.writeFileSync(`./data/${filename}.json`,JSON.stringify(data))
}