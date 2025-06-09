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
const roleRoutes = require("./routes/roleRoutes");

// Create default admin user if not exists
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require("./utils/bcrypt");

async function setupDefaultAdmin() {
  try {
    let admin = await prisma.user.findUnique({ where: { username: "admin" } });
    const hashedPassword = await hashPassword("admin123"); // Hash password once

    if (admin) {
      // If admin exists, update password
      await prisma.user.update({
        where: { username: "admin" },
        data: {
          password: hashedPassword
        }
      });
      console.log("Default admin user password updated");
    } else {
      // If admin does not exist, create it
      await prisma.user.create({
        data: {
          username: "admin",
          password: hashedPassword,
          email: "admin@busticketpro.com",
          role: "admin"
        }
      });
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error setting up default admin:", error);
  }
}

setupDefaultAdmin();

// Auth endpoints
app.post("/register", register); 
app.post("/login", login);       

// New: Endpoint to get user role
app.get("/api/user/role", authMiddleware, (req, res) => {
  if (req.user && req.user.role) {
    res.json({ role: req.user.role });
  } else {
    res.status(401).json({ message: "User not authenticated or role not found." });
  }
});

// Protected routes
app.use("/users", authMiddleware, checkAdminMiddleware, userRoutes);
app.use("/roles", authMiddleware, roleRoutes);   
app.use("/tikets", authMiddleware, checkAdminMiddleware, tiketRoutes);                         
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