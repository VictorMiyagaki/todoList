//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://victormiyagaki19:0Kwq20mgSFO9dSh2@cluster0.kpqlrc4.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.deleteMany({ name: "Welcome to your todolist!" })
//   .then(function (result) {
//     console.log(result);
//   })
//   .catch(function (err) {
//     console.log(err);
//   });

app.get("/", function (req, res) {

  Item.find({})
    .then(function (result) {
      console.log("Sua lista: " + result);
      if (result.length === 0) {
        Item.insertMany(defaultItems)
          .then(function (result) {
            console.log("Resetando a lista: " + result);
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: result });
      }
    })
    .catch(function (err) {
      console.log(err);
    });

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (result) {
      console.log("Achei na lista: " + result);
      if (!result) {
        // Create a new list
        console.log("Doesn't exist!");

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        // Show an existing list
        res.render("list", { listTitle: result.name, newListItems: result.items });

        console.log("Exists!");
      }
    })
    .catch(function (err) {
      console.log(err);
    });


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(function (result) {
        result.items.push(item);
        result.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }


});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
 
    Item.findByIdAndRemove(checkedItemId)
    .then(function (result) {
      console.log("Removendo da lista:" + result);
      res.redirect("/");
    })
    .catch(function (err) {
      console.log(err);
    });

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(function (result) {
      console.log("Removendo da lista:" + result);
      res.redirect("/" + listName);
    })
    .catch(function (err) {
      console.log(err);
    });
  }


});



app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
