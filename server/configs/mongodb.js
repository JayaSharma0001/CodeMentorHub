import dns from "dns";
import mongoose from "mongoose";

// Some home/router DNS servers refuse MongoDB SRV lookups (querySrv ECONNREFUSED).
// Public DNS keeps Atlas mongodb+srv:// connections working without changing app logic.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const withDatabaseName = (uri, dbName = "lms") => {
  const cleaned = String(uri || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  const [base, query] = cleaned.split("?");
  const withoutTrailingSlash = base.replace(/\/$/, "");

  // Detect existing db path after host (ignore credentials host segment).
  const afterProtocol = withoutTrailingSlash.replace(/^mongodb(\+srv)?:\/\//, "");
  const slashIndex = afterProtocol.indexOf("/");
  const hasDb =
    slashIndex !== -1 && afterProtocol.slice(slashIndex + 1).length > 0;

  const withDb = hasDb
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/${dbName}`;

  return query ? `${withDb}?${query}` : withDb;
};

// Connect to the MongoDB database
const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));

  await mongoose.connect(withDatabaseName(process.env.MONGODB_URI));
};

export default connectDB;
