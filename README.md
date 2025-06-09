
# 📘 API Documentation

## Base URL

```
http://localhost:4000/{resource}
```

---

## 🧑 User Service

### **GET** `/users`
Get all users  
**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "password": "$2b$10$0QDcf1e.Bn9fqgF5QOM6zOWYWKQJ8yGMa5SZfet70npN8l3.Pr11K",
    "role": "admin"
  }
]
```

### **GET** `/users/:id`
Get user by ID  
**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2b$10$0QDcf1e.Bn9fqgF5QOM6zOWYWKQJ8yGMa5SZfet70npN8l3.Pr11K",
  "role": "admin"
  }
}
```

### **POST** `/users`  
Create new user  
**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "user"
}
```

### **PUT** `/users/:id`  
Update user by ID  
**Request:**
```json
{
  "id": 1,
  "username": "john_updated",
  "email": "john_updated@example.com",
  "password": "newsecure123",
  "role": "admin"
}
```

### **DELETE** `/users/:id`  
Delete user by ID

---

## 🎫 Tiket Service

### **GET** `/tikets`  
Get all tickets  
**Response:**
```json
[
  {
    "id": 1,
    "nama": "Tiket Konser",
    "harga": 150000,
    "stok": 100
  }
]
```

### **GET** `/tikets/:id`  
Get ticket by ID
**Response:**
```json
[
  {
    "id": 1,
    "nama": "Tiket Konser",
    "harga": 150000,
    "stok": 100
  }
]
```

### **POST** `/tikets`  
Create new ticket  
**Request:**
```json
{
  "nama": "Jakarta to Solo",
  "harga": 150000,
  "stok": 100
}
```

### **PUT** `/tikets/:id`  
Update ticket by ID  
**Request:**
```json
{
  "id": 1,
  "nama": "Jakarta to Surabaya",
  "harga": 200000,
  "stok": 50
}
```

### **DELETE** `/tikets/:id`  
Delete ticket by ID

---

## 📦 Order Service

### **GET** `/orders`  
Get all orders  
**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "tiketId": 2,
    "jumlah": 3,
    "createdAt": "2025-06-07T09:00:00.000Z",
    "status": "pending",
    "total": 500000
  }
]
```

### **GET** `/orders/:id`  
Get order by ID
**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "tiketId": 2,
    "jumlah": 3,
    "createdAt": "2025-06-07T09:00:00.000Z",
    "status": "pending",
    "total": 500000
  }
]
```

### **POST** `/orders`  
Create new order  
**Request:**
```json
{
  "userId": 1,
  "tiketId": 2,
  "jumlah": 3
}
```

### **PUT** `/orders/:id`  
Update order by ID  
**Request:**
```json
{
  "Id": 1,   
  "userId": 1,
  "tiketId": 3,
  "jumlah": 2
}
```

### **DELETE** `/orders/:id`  
Delete order by ID

---

## 💳 Pembayaran Service

### **GET** `/pembayaran`  
Get all payments  
**Response:**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "status": "paid",
    "metode": "transfer",
    "total": 600000
  }
]
```

### **GET** `/pembayaran/:id`  
Get payment by ID
```json
[
  {
    "id": 1,
    "orderId": 1,
    "status": "paid",
    "metode": "transfer",
    "total": 600000
  }
]
```

### **POST** `/pembayaran`  
Create new payment  
**Request:**
```json
{
  "orderId": 1
}
```
---

## 🎁 Reward Service

### **GET** `/rewards`  
Get all rewards  
**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "orderId": 1,
    "poin": 100
  }
]
```

### **GET** `/rewards/:id`  
Get reward by ID
```json
[
  {
    "id": 1,
    "userId": 1,
    "orderId": 1,
    "poin": 100
  }
]
```

### **POST** `/rewards`  
Create new reward  
**Request:**
```json
{
  "userId": 1,
  "orderId": 1
}
```

### **PUT** `/rewards/:id`  
Update reward by ID  
**Request:**
```json
{
  "id": 1,
  "userId": 1,
  "orderId": 1
}
```

### **DELETE** `/rewards/:id`  
Delete reward by ID

---


