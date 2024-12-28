const express = require("express");
const router = express.Router();

// INDEX ROUTE
router.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// New route:
router.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// adding to the database: CREATE ROUTE
router.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { title, description, image, price, country, location } = req.body;
    let newL = new Listing({
      title: title,
      description: description,
      image: image,
      price: price,
      country: country,
      location: location,
    });
    await newL.save();
    res.redirect("/listings");
  })
);

// SHOW ROUTE
router.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
});

// Edit ROUTE
router.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

// UPDATE ROUTE:
router.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let update = req.body;
  await Listing.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  res.redirect(`/listings/${id}`);
});

// DESTROY ROUTE:
router.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  // let update = req.body;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

module.exports = router;
