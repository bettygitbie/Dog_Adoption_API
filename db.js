const mongoose = require("mongoose");

const connectToDb = async () => {
try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);  // Exit the process on error
  }
};

module.exports = connectToDb;

// module.exports = {
//   connectToDb: async (callBack) => {
//     await MongoClient.connect(process.env.MONGODB_URI)
//       .then((client) => {
//         dbConnection = client.db(process.env.DB_NAME);
//         console.log("Connected to database");
//         return callBack();
//       })
//       .catch((err) => {
//         console.log(err);
//         return callBack(err);
//       });
//   },
//   getDb: () => dbConnection,
// };
