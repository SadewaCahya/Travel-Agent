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
    createUser(username: String!, email: String!, password: String!): User
    updateUser(id: ID!, username: String, email: String, password: String): User
    deleteUser(id: ID!): User

    # Tiket
    createTiket(nama: String!, harga: Int!, stok: Int!): Tiket
    updateTiket(id: ID!, nama: String, harga: Int, stok: Int): Tiket
    deleteTiket(id: ID!): Tiket

    # Order
    createOrder(userId: ID!, tiketId: ID!, jumlah: Int!): Order
    updateOrder(id: ID!, userId: ID, tiketId: ID, jumlah: Int, status: String, total: Int): Order
    deleteOrder(id: ID!): Order

    # Pembayaran
    createPembayaran(orderId: ID!): Pembayaran

    # Reward
    createReward(userId: ID!, orderId: ID!): Reward
    updateReward(id: ID!, userId: ID, orderId: ID, poin: Int): Reward
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
    updateUser: async (_, { id, username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.user.update({ where: { id: Number(id) }, data: { username, email, password: hashedPassword } });
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
    updateOrder: async (_, { id, userId, tiketId, jumlah, status, total }) => {
      return await prisma.$transaction(async (tx) => {
        const orderLama = await tx.order.findUnique({ where: { id: Number(id) } });
        if (!orderLama) throw new Error('Order not found');

        const usedTiketId = tiketId ? Number(tiketId) : orderLama.tiketId;
        const usedJumlah = jumlah ? Number(jumlah) : orderLama.jumlah;

        if (usedTiketId !== orderLama.tiketId) {
          await tx.tiket.update({
            where: { id: orderLama.tiketId },
            data: { stok: { increment: orderLama.jumlah } },
          });
          const tiketBaru = await tx.tiket.findUnique({ where: { id: usedTiketId } });
          if (!tiketBaru) throw new Error('Tiket baru tidak ditemukan');
          if (tiketBaru.stok < usedJumlah) throw new Error('Stok tiket tidak cukup');
          await tx.tiket.update({
            where: { id: usedTiketId },
            data: { stok: { decrement: usedJumlah } },
          });
        } else {
          const selisih = usedJumlah - orderLama.jumlah;
          if (selisih > 0) {
            const tiket = await tx.tiket.findUnique({ where: { id: usedTiketId } });
            if (tiket.stok < selisih) throw new Error('Stok tiket tidak cukup');
            await tx.tiket.update({
              where: { id: usedTiketId },
              data: { stok: { decrement: selisih } },
            });
          } else if (selisih < 0) {
            await tx.tiket.update({
              where: { id: usedTiketId },
              data: { stok: { increment: -selisih } },
            });
          }
        }

        const updateData = {};
        if (userId) updateData.userId = Number(userId);
        if (tiketId) updateData.tiketId = Number(tiketId);
        if (jumlah) updateData.jumlah = Number(jumlah);
        if (status) updateData.status = status;
        if (total) updateData.total = Number(total);

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