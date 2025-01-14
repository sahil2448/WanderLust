const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); // automatically creates upload folder

// INDEX ROUTE
// router.get("/", wrapAsync(listingController.index));

// New route:

// adding to the database: CREATE ROUTE
// router.post(
//   "/",
//   isLoggedIn,
//   validateListing,
//   wrapAsync(listingController.createListing)
// );

// SHOW ROUTE
// router.get("/:id", listingController.showListing);

// UPDATE ROUTE:
// router.put("/:id", isLoggedIn, isOwner, listingController.updateListing);

// DESTROY ROUTE:
// router.delete("/:id", isLoggedIn, isOwner, listingController.destroyListing);

// JUST IMPLEMENTING ROUTER.ROUTE...FOR BETTER READABILITY(ITS THE SAME CODE AS IN COMMENTED PART )

// INDEX + CREATE ROUTE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW + UPDATE + DESTROY (ROUTES)
router
  .route("/:id")
  .get(listingController.showListing)
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    listingController.updateListing
  )
  .delete(isLoggedIn, isOwner, listingController.destroyListing);

// Edit ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

module.exports = router;
