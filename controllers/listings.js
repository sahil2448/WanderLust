const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  // console.log(listing);
  if (!listing) {
    req.flash(
      "error",
      "Listing which you are trying to access, doesn't exists...!"
    );
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let { title, description, image, price, country, location } = req.body;
  let newL = new Listing(req.body.listing);
  console.log(req.body.listing);
  newL.owner = req.user._id;
  await newL.save();
  req.flash("success", "New listing created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash(
      "error",
      "Listing which you are trying to access, doesn't exists...!"
    );
    res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let update = req.body;

  // Ensure image is updated properly
  if (req.body.image && req.body.image.url) {
    update.image = { url: req.body.image.url }; // Update only the URL part of the image object
  }

  await Listing.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  req.flash("success", "Listing updated");

  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  // let update = req.body;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};
