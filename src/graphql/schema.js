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
    role: String!
  }

  type Tiket {
    id: ID!
    nama: String!
    harga: Int!
    stok: Int!
  }

  type Order {
    id: ID!
    userId: ID!
    tiketId: ID!
    jumlah: Int!
    status: String!
    total: Int!
  }

  type Pembayaran {
    id: ID!
    orderId: ID!
    status: String!
    metode: String!
    total: Int!
  }

  type Reward {
    id: ID!
    userId: ID!
    orderId: ID!
    poin: Int!
  }

  type Query {
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
    createUser(username: String!, email: String!, password: String!, role: String!): User
    updateUser(id: ID!, username: String, email: String, password: String, role: String): User
    deleteUser(id: ID!): User

    # Tiket
    createTiket(nama: String!, harga: Int!, stok: Int!): Tiket
    updateTiket(id: ID!, nama: String, harga: Int, stok: Int): Tiket
    deleteTiket(id: ID!): Tiket

    # Order
    createOrder(userId: ID!, tiketId: ID!, jumlah: Int!): Order
    updateOrder(id: ID!, userId: ID, tiketId: ID, jumlah: Int): Order
    deleteOrder(id: ID!): Order

    # Pembayaran
    createPembayaran(orderId: ID!): Pembayaran

    # Reward
    createReward(userId: ID!, orderId: ID!): Reward
    updateReward(id: ID!, userId: ID, orderId: ID): Reward
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
    createUser: async (_, { username, email, password, role }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.user.create({ data: { username, email, password: hashedPassword, role } });
    },
    updateUser: async (_, { id, username, email, password, role }) => {
      const data = {};
      if (username !== undefined) data.username = username;
      if (email !== undefined) data.email = email;
      if (role !== undefined) data.role = role;
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }

      return prisma.user.update({
        where: { id: Number(id) },
        data
      });
    },
    deleteUser: async (_, { id }) =>
      prisma.user.delete({ where: { id: Number(id) } }),

    // Tiket
    createTiket: async (_, { nama, harga, stok }) =>
      prisma.tiket.create({ data: { nama, harga, stok } }),
    updateTiket: async (_, { id, nama, harga, stok }) =>
      prisma.tiket.update({ where: { id: Number(id) }, data: { nama, harga, stok } }),
    deleteTiket: async (_, { id }) =>
      prisma.tiket.delete({ where: { id: Number(id) } }),

    // Order
    createOrder: async (_, { userId, tiketId, jumlah }) => {
      const tiket = await prisma.tiket.findUnique({ where: { id: Number(tiketId) } });
      if (!tiket) {
        throw new Error('Tiket not found');
      }

      if (tiket.stok < jumlah) {
        throw new Error('Stok tiket tidak cukup');
      }

      const total = tiket.harga * jumlah;

      const order = await prisma.order.create({
        data: {
          userId: Number(userId),
          tiketId: Number(tiketId),
          jumlah: Number(jumlah),
          total: total,
          status: "pending"
        }
      });

      await prisma.tiket.update({
        where: { id: Number(tiketId) },
        data: { stok: tiket.stok - jumlah }
      });

      return order;
    },
    updateOrder: async (_, { id, userId, tiketId, jumlah, status }) => {
      return await prisma.$transaction(async (tx) => {
        const orderLama = await tx.order.findUnique({ where: { id: Number(id) } });
        if (!orderLama) throw new Error('Order not found');

        const tiketLamaId = orderLama.tiketId;
        const jumlahLama = orderLama.jumlah;

        const tiketBaruId = tiketId !== undefined ? Number(tiketId) : tiketLamaId;
        const jumlahBaru = jumlah !== undefined ? Number(jumlah) : jumlahLama;

        // Update stok tiket
        if (tiketBaruId !== tiketLamaId) {
          await tx.tiket.update({
            where: { id: tiketLamaId },
            data: { stok: { increment: jumlahLama } },
          });
          const tiketBaru = await tx.tiket.findUnique({ where: { id: tiketBaruId } });
          if (!tiketBaru) throw new Error('Tiket baru tidak ditemukan');
          if (tiketBaru.stok < jumlahBaru) throw new Error('Stok tiket tidak cukup');
          await tx.tiket.update({
            where: { id: tiketBaruId },
            data: { stok: { decrement: jumlahBaru } },
          });
        } else if (jumlahBaru !== jumlahLama) {
          const selisih = jumlahBaru - jumlahLama;
          if (selisih > 0) {
            const tiket = await tx.tiket.findUnique({ where: { id: tiketBaruId } });
            if (tiket.stok < selisih) throw new Error('Stok tiket tidak cukup');
            await tx.tiket.update({
              where: { id: tiketBaruId },
              data: { stok: { decrement: selisih } },
            });
          } else if (selisih < 0) {
            await tx.tiket.update({
              where: { id: tiketBaruId },
              data: { stok: { increment: -selisih } },
            });
          }
        }

        const tiketBaru = await tx.tiket.findUnique({ where: { id: tiketBaruId } });
        if (!tiketBaru) throw new Error('Tiket tidak ditemukan');
        const totalBaru = jumlahBaru * tiketBaru.harga;

        const updateData = {};
        if (userId !== undefined) updateData.userId = Number(userId);
        if (tiketId !== undefined) updateData.tiketId = tiketBaruId;
        if (jumlah !== undefined) updateData.jumlah = jumlahBaru;
        if (status !== undefined) updateData.status = status;
        updateData.total = totalBaru;

        return tx.order.update({
          where: { id: Number(id) },
          data: updateData,
        });
      });
    },
    deleteOrder: async (_, { id }) => {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: Number(id) } });
        if (!order) throw new Error('Order not found');

        await tx.tiket.update({
          where: { id: order.tiketId },
          data: { stok: { increment: order.jumlah } },
        });

        await tx.pembayaran.deleteMany({ where: { orderId: Number(id) } });
        await tx.reward.deleteMany({ where: { orderId: Number(id) } });

        return tx.order.delete({ where: { id: Number(id) } });
      });
    },

    // Pembayaran
    createPembayaran: async (_, { orderId }) => {
      const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
      if (!order) {
        throw new Error("Order not found");
      }

      const existingPembayaran = await prisma.pembayaran.findUnique({ where: { orderId: Number(orderId) } });
      if (existingPembayaran) {
        throw new Error("Pembayaran untuk order ini sudah ada.");
      }

      const pembayaran = await prisma.pembayaran.create({
        data: {
          orderId: Number(orderId),
          status: "paid",
          metode: "transfer",
          total: order.total
        }
      });
      return pembayaran;
    },

    // Reward
    createReward: async (_, { userId, orderId }) => {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      if (!user) {
        throw new Error("User not found");
      }
      const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
      if (!order) {
        throw new Error("Order not found");
      }

      // Calculate points (e.g., 10% of order total)
      const poin = Math.floor(order.total * 0.1); // You can adjust the calculation as needed

      return prisma.reward.create({ data: { userId: Number(userId), orderId: Number(orderId), poin } });
    },
    updateReward: async (_, { id, userId, orderId, poin }) =>
      prisma.reward.update({ where: { id: Number(id) }, data: { userId: Number(userId), orderId: Number(orderId), poin: Number(poin) } }),
    deleteReward: async (_, { id }) =>
      prisma.reward.delete({ where: { id: Number(id) } }),
  },
};

module.exports = { typeDefs, resolvers };