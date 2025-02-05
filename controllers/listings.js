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
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let { title, description, image, price, country, location } = req.body;
  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, "....", filename);
  let newL = new Listing(req.body.listing);
  newL.owner = req.user._id;
  newL.image = { url, filename };
  await newL.save();
  console.log(newL);
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
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // let update = req.body;

  // Ensure image is updated properly
  // if (req.body.image && req.body.image.url) {
  //   update.image = { url: req.body.image.url }; // Update only the URL part of the image object
  // }

  // let listing = await Listing.findByIdAndUpdate(id, update, {
  //   new: true,
  //   runValidators: true,
  // });
  if (typeof req.file !== undefined) {
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

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

module.exports.filterByType = async (req, res) => {
  // console.log("this is requestbody", req.query);
  let category = req.query.category || "";
  console.log("category: ", category);

  let allListings = await Listing.find({});

  let typeFilteredArray = allListings.filter((list) => {
    return list.list_type.toLowerCase() === category;
  });

  // console.log(typeFilteredArray);

  res.render("listings/typeFiltered.ejs", {
    category,
    typeFilteredArray,
  });

  // res.render("listings/typeFiltered.ejs", { category });
  // res.render("/listings", { category });
};
