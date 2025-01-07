const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

// INDEX ROUTE
router.get("/", wrapAsync(listingController.index));

// New route:
router.get("/new", isLoggedIn, listingController.renderNewForm);

// adding to the database: CREATE ROUTE
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createListing)
);

// SHOW ROUTE
router.get("/:id", listingController.showListing);

// Edit ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

// UPDATE ROUTE:
router.put("/:id", isLoggedIn, isOwner, listingController.updateListing);

// DESTROY ROUTE:
router.delete("/:id", isLoggedIn, isOwner, listingController.destroyListing);

module.exports = router;
