require("dotenv").config();

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 4000;

// Import controller untuk auth
const { register, login } = require("./controllers/auth.js");

// Import routes utama (CRUD service)
const userRoutes = require("./routes/userRoutes");
const tiketRoutes = require("./routes/tiketRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pembayaranRoutes = require("./routes/pembayaranRoutes");
const rewardRoutes = require("./routes/rewardRoutes");

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

const { authMiddleware, checkAdminMiddleware } = require("./middleware/auth");

// Auth endpoints
app.post("/register", register); 
app.post("/login", login);       

// Protected routes
app.use("/users", authMiddleware, checkAdminMiddleware, userRoutes);   
app.use("/tikets", authMiddleware, tiketRoutes);                         
app.use("/orders", authMiddleware, orderRoutes);                         
app.use("/pembayaran", authMiddleware, pembayaranRoutes);               
app.use("/rewards", authMiddleware, rewardRoutes);                     

const { typeDefs, resolvers } = require("./graphql/schema");
async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`Akses REST: http://localhost:${PORT}`);
    console.log(`GraphQL siap di: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`UI tersedia di: http://localhost:${PORT}`);
  });
}

startApolloServer();