const { gql } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;


const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Tiket {
    id: ID!
    nama: String!
    harga: Int!
  }

  type Order {
    id: ID!
    userId: ID!
    tiketId: ID!
    status: String!
  }

  type Pembayaran {
    id: ID!
    orderId: ID!
    jumlah: Int!
    status: String!
  }

  type Reward {
    id: ID!
    userId: ID!
    poin: Int!
  }

  type Query {
    login(email: String!, password: String!): String

    users: [User]
    user(id: ID!): User

    tikets: [Tiket]
    tiket(id: ID!): Tiket

    orders: [Order]
    order(id: ID!): Order

    pembayarans: [Pembayaran]
    pembayaran(id: ID!): Pembayaran

    rewards: [Reward]
    reward(id: ID!): Reward

    hello: String
  }

  type Mutation {
    # Login
    login(email: String!, password: String!): String

    # User
    createUser(username: String!, email: String!, password: String!): User
    updateUser(id: ID!, username: String, email: String, password: String): User
    deleteUser(id: ID!): User

    # Tiket
    createTiket(nama: String!, harga: Int!): Tiket
    updateTiket(id: ID!, nama: String, harga: Int): Tiket
    deleteTiket(id: ID!): Tiket

    # Order
    createOrder(userId: ID!, tiketId: ID!, status: String!): Order
    updateOrder(id: ID!, userId: ID, tiketId: ID, status: String): Order
    deleteOrder(id: ID!): Order

    # Pembayaran
    createPembayaran(orderId: ID!, jumlah: Int!, status: String!): Pembayaran
    updatePembayaran(id: ID!, orderId: ID, jumlah: Int, status: String): Pembayaran
    deletePembayaran(id: ID!): Pembayaran

    # Reward
    createReward(userId: ID!, poin: Int!): Reward
    updateReward(id: ID!, userId: ID, poin: Int): Reward
    deleteReward(id: ID!): Reward
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL!",

    users: async () => prisma.user.findMany(),
    user: async (_, { id }) => prisma.user.findUnique({ where: { id: Number(id) } }),

    tikets: async () => prisma.tiket.findMany(),
    tiket: async (_, { id }) => prisma.tiket.findUnique({ where: { id: Number(id) } }),

    orders: async () => prisma.order.findMany(),
    order: async (_, { id }) => prisma.order.findUnique({ where: { id: Number(id) } }),

    pembayarans: async () => prisma.pembayaran.findMany(),
    pembayaran: async (_, { id }) => prisma.pembayaran.findUnique({ where: { id: Number(id) } }),

    rewards: async () => prisma.reward.findMany(),
    reward: async (_, { id }) => prisma.reward.findUnique({ where: { id: Number(id) } }),
  },
  Mutation: {
    // Login
    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("Email tidak terdaftar");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Password salah");
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      return token;
    },

    // User
    createUser: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.user.create({ data: { username, email, password: hashedPassword } });
    },
    updateUser: async (_, { id, username, email, password }) =>
      prisma.user.update({ where: { id: Number(id) }, data: { username, email, password } }),
    deleteUser: async (_, { id }) =>
      prisma.user.delete({ where: { id: Number(id) } }),

    // Tiket
    createTiket: async (_, { nama, harga }) =>
      prisma.tiket.create({ data: { nama, harga } }),
    updateTiket: async (_, { id, nama, harga }) =>
      prisma.tiket.update({ where: { id: Number(id) }, data: { nama, harga } }),
    deleteTiket: async (_, { id }) =>
      prisma.tiket.delete({ where: { id: Number(id) } }),

    // Order
    createOrder: async (_, { userId, tiketId, status }) =>
      prisma.order.create({ data: { userId: Number(userId), tiketId: Number(tiketId), status } }),
    updateOrder: async (_, { id, userId, tiketId, status }) =>
      prisma.order.update({
        where: { id: Number(id) },
        data: {
          userId: userId && Number(userId),
          tiketId: tiketId && Number(tiketId),
          status,
        },
      }),
    deleteOrder: async (_, { id }) =>
      prisma.order.delete({ where: { id: Number(id) } }),

    // Pembayaran
    createPembayaran: async (_, { orderId, jumlah, status }) =>
      prisma.pembayaran.create({ data: { orderId: Number(orderId), jumlah, status } }),
    updatePembayaran: async (_, { id, orderId, jumlah, status }) =>
      prisma.pembayaran.update({
        where: { id: Number(id) },
        data: {
          orderId: orderId && Number(orderId),
          jumlah,
          status,
        },
      }),
    deletePembayaran: async (_, { id }) =>
      prisma.pembayaran.delete({ where: { id: Number(id) } }),

    // Reward
    createReward: async (_, { userId, poin }) =>
      prisma.reward.create({ data: { userId: Number(userId), poin } }),
    updateReward: async (_, { id, userId, poin }) =>
      prisma.reward.update({
        where: { id: Number(id) },
        data: {
          userId: userId && Number(userId),
          poin,
        },
      }),
    deleteReward: async (_, { id }) =>
      prisma.reward.delete({ where: { id: Number(id) } }),
  }
};

module.exports = { typeDefs, resolvers };