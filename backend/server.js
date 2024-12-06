import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";

import storeRoutes from "./routes/store.route.js"
import salesRoutes from "./routes/sales.route.js"
import usersRoutes from "./routes/users.route.js"
import materialsRoutes from "./routes/materials.route.js"
import { app, server } from "./socket/socket.js";
import db_listeners from "./socket/listeners.js"
import authRoutes from "./routes/auth.route.js"



dotenv.config();



const PORT = process.env.PORT || 3001;

app.use(express.json()); // allows you to parse json from req.body

// ROUTES
app.use("/api/productstore", storeRoutes)
app.use("/api/sales", salesRoutes)
app.use("/api/materialstore", materialsRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/auth", authRoutes)

// LISTENER
server.listen(PORT, () => {
  console.log("Server started on port", PORT);

  connectDB();

  // start listeners
  db_listeners();
});
