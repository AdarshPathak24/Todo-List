const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

let items = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs'); // to make ejs use and ejs is used for making a template so that we need not to write the code again and again.

app.get("/", function(req, res) {
  let day = date.getDate();
  res.render("list", {
    listTitle: day,
    newListItems: items
  }) // we are rendering a process in list.ejs file so that it can give the day with help of key value pair.

});

app.post("/", function(req, res) {

  let item = req.body.newItem;

  if (req.body.list === "Work") {
    if (item !== "") {
      workItems.push(item);
    }
    res.redirect("/work");
  } else if (item !== "") {
    items.push(item);

  }
  res.redirect("/"); // as the res.render is already called in app.get therefore we need to redirect it to home
});



app.post("/work", function(req, res) {
  let item = req.body.newItem;
  if (item !== "") {
    workItems.push(item);
  }
  res.redirect("/work"); // as the res.render is already called in app.get therefore we need to redirect it to home
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
