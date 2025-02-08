// if (process.env.NODE_ENV != "production") {
//   require("dotenv").config();
// }

const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl = process.env.ATLASDB_URL;

main()
  .then((res) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("err");
  });
async function main() {
  await mongoose.connect(MONGO_URL);
  // await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6778c2923d4a16e5e85110b4",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

initDB();
