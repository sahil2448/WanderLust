const express = require("express");
const app = express();
const path = require("path");

const mongoose = require("mongoose");
const Listing = require("../WanderLust/models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then((res) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("err");
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("I am a root");
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "BangBang",
//     description: "My bangalo",
//     price: 119911991,
//     location: "Kolhapur",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("saved");
//   res.send("Response success");
// });

// INDEX ROUTE
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

app.listen(8080, () => {
  console.log("Server is listening to port:", 8080);
});

// New route:
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// adding to the database: CREATE ROUTE
app.post("/listings", (req, res) => {
  let { title, description, image, price, country, location } = req.body;
  let newL = new Listing({
    title: title,
    description: description,
    image: image,
    price: price,
    country: country,
    location: location,
  });

  newL.save().then(() => {
    res.redirect("/listings");
  });
});

// SHOW ROUTE
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
});

// Edit ROUTE
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

// UPDATE ROUTE:
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let update = req.body;
  await Listing.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  res.redirect(`/listings/${id}`);
});

// DESTROY ROUTE:
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  // let update = req.body;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});
