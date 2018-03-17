var express = require('express');
var fs = require('fs');
const path = require('path')
var bodyParser = require('body-parser');

const markdownPath = '/Users/henry/Projects/docs/docusaurus/docs'
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const isDirectory = (name, source) => fs.lstatSync(path.join(source, name)).isDirectory()
const getDirectories = source => fs.readdirSync(source).filter(name => isDirectory(name, source))

// recursively walk through a directory and build object of the filestructure
function walk(dir) {
  const files = fs.readdirSync(dir) // dir shouldn't be a file
  var dirObject = {type: 'folder', contents: {}}
  files.forEach(file => {
    if (isDirectory(file, dir)) {
      dirObject.contents[file] = walk(path.join(dir, file))
    } else {
      dirObject.contents[file] =  {type: 'file', path: path.join(dir, file)} // fs.readFileSync(path.join(dir, file))
    }
  })
  return dirObject
}

// GET EVERYTHING
router.get('/everything', function(req, res, next) {
  const everything = walk(markdownPath)
  res.send(everything)
})

// GET all projects
router.get('/projects', function(req, res, next) {
  const projects = getDirectories(markdownPath)
  res.send(projects)  
})

// GET all documents
router.get('/docs/all', function(req, res, next) {
  res.send(fs.readdirSync(markdownPath));
});

// GET specific document by passing in a ?path=whatever/you/want
// doesn't match /docs/all because that came first
router.get('/docs', function(req, res, next) {
  const queryPath = req.query.path
  const docString = fs.readFileSync(queryPath) // this query path is currently the full absolute path, would be nice if we could just expose the relative path within docs
  res.send(docString);
});


router.post('/docs', bodyParser.text(), function(req, res, next) {
  const queryPath = req.query.path
  const newValue = req.body
  fs.writeFileSync(queryPath, newValue)
  res.json({
    success: true,
  })
})

module.exports = router;
