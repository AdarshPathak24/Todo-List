//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {                             // Creation of SCHEMA
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({                           // adding item to schema.
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add the new item."
});

const item3 = new Item({
  name: "<==  Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];      // Creating an array of all items.

const listSchema = {             // Cresting a schema for every new tab.
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){     // insertMany to insert many items in db.
        if (err) {
          console.log(err);
        } else {
          //console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });

  const day = date.getDate();

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        // Create a new list
        // console.log("Doesn't exist!");
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        // console.log("Exists!");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();

  const item = new Item({
    name: itemName
  });

  if(listName === day){
    if (item.name==="") {
      res.redirect("/");
    } else {
      item.save();
      res.redirect("/");
    }

  } else {
    List.findOne({name: listName}, function(err, foundList){
      if (item.name === "") {
        res.redirect("/" + listName);
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }

    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();


  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err){
          console.log(err)
      }
      else{
          //console.log("Successfully deleted checked item");
          res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
