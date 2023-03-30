//TODO Blogging app "WIUT CATCH_UP"(CRUD+validation)
const express = require('express')
const app = express()
const port = 8000


app.set('view engine','pug')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/assets', express.static(process.cwd() + '/assets'));
app.use('/static', express.static('public'))



app.get('/', (req, res) => {
  res.render('home',{})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})