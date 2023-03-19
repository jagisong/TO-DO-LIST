const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const app = express();
// var items = [];
var workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const itemSchema = {
    name: String
};
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: "welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit + button to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];


const listSchema ={
    name: String,
    items: [itemSchema]
}

const List = mongoose.model('List', listSchema);



app.get("/", async function (req, res) {

    let temp = await Item.find({});
    // console.log(temp);

    if (temp.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect('/');
    } else {
        res.render("list", {
            listTitle: "Today",
            newListItems: temp
        });
    }
});

app.get("/:customListName", async function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    let temp1 = await List.findOne({name: customListName});
    if(!temp1) {
        // console.log("not found");
        const list = new List({
            name : customListName,
            items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
    }else{
        // console.log("found");
        res.render("list", {listTitle: customListName, newListItems: temp1.items});
    }


    

});

app.post("/", async function (req, res) {

    // console.log(req.body);
    let itemName = req.body.newItem;
    let listName = req.body.list;
    const item = new Item({
        name : itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        let temp2 = await List.findOne({name: listName});
        temp2.items.push(item);
        temp2.save();
        res.redirect("/" + listName); 
    }
    // if (req.body.list === "Work") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else {
    //     items.push(item);
    //     res.redirect("/")
    // }
    // app.get("")
});

app.post("/delete",async function(req, res){
    let checkItemId = req.body.checkbox;
    let listName = req.body.listName;
    if(listName === "Today"){
        await Item.findByIdAndRemove(checkItemId);
        res.redirect("/");
    } else {
        await List.findOneAndUpdate({name : listName},{$pull:{items : {_id:checkItemId}}});
        res.redirect("/" + listName);
    }

});

// app.get("/work", function (req, res) {
//     res.render("list", {
//         listTitle: "Work list",
//         newListItems: workItems
//     })
// });

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("listening on");
});