// // // import mongoose from 'mongoose';

// // // const MONGODB_URI = process.env.MONGODB_URI;

// // // if (!MONGODB_URI) {
// // //   throw new Error('Please define the MONGODB_URI environment variable inside .env');
// // // }

// // // let cached = global.mongoose;

// // // if (!cached) {
// // //   cached = global.mongoose = { conn: null, promise: null };
// // // }

// // // async function dbConnect() {
// // //   if (cached.conn) {
// // //     return cached.conn;
// // //   }

// // //   if (!cached.promise) {
// // //     const opts = {
// // //       bufferCommands: false,
// // //     };

// // //     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
// // //       return mongoose;
// // //     });
// // //   }

// // //   try {
// // //     cached.conn = await cached.promise;
// // //   } catch (e) {
// // //     cached.promise = null;
// // //     throw e;
// // //   }

// // //   return cached.conn;
// // // }

// // // export default dbConnect;

// // // /////////////////////////////////////////////////////
// // import mongoose from 'mongoose';

// // // ✅ Mongoose deprecation warning fix
// // mongoose.set('returnDocument', 'after');
// // mongoose.set('strictQuery', true);

// // const MONGODB_URI = process.env.MONGODB_URI;

// // if (!MONGODB_URI) {
// //   throw new Error('Please define the MONGODB_URI environment variable inside .env');
// // }

// // let cached = global.mongoose;

// // if (!cached) {
// //   cached = global.mongoose = { conn: null, promise: null };
// // }

// // async function dbConnect() {
// //   if (cached.conn) {
// //     return cached.conn;
// //   }

// //   if (!cached.promise) {
// //     const opts = {
// //       bufferCommands: false,
// //     };

// //     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
// //       return mongoose;
// //     });
// //   }

// //   try {
// //     cached.conn = await cached.promise;
// //   } catch (e) {
// //     cached.promise = null;
// //     throw e;
// //   }

// //   return cached.conn;
// // }

// // export default dbConnect;

// // //////////////////////////////////////////
// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error(
//     "Please define the MONGODB_URI environment variable inside .env",
//   );
// }

// /**
//  * Global is used here to maintain a cached connection across hot reloads
//  * in development. This prevents connections growing exponentially
//  * during API Route usage.
//  */
// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//       serverSelectionTimeoutMS: 5000, // 🆕 ৫ সেকেন্ড পর টাইমআউট হবে
//     };

//     // 🆕 সঠিকভাবে কানেক্ট করা
//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
// }

// export default dbConnect;
// //////////////////////////////////
import mongoose from "mongoose";

mongoose.set("returnDocument", "after");
mongoose.set("strictQuery", true);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing at runtime. Add it to the Docker environment.",
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;