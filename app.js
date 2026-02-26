import express from "express"
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import { authMiddleware } from "./middlewares/authMiddleware.js";
import diaryRoutes from "./routes/diaryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import errorHandler from "./middlewares/errorhandler.js";
import notFound from "./middlewares/NotFound.js";


dotenv.config()

const app = express()
const port = process.env.PORT || 3000;

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/diary", diaryRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Diario attivo");
});

app.get("/api/private", authMiddleware, (req, res) => {
  res.json({ message: `Ciao ${req.user.username}, sei autenticato`});
});

app.use(notFound)
app.use(errorHandler)

app.listen(port, (err) => {
  if(err){
      console.log("Impossibile collegarsi alla porta" ,err)
  }
    console.log(`Collegato alla porta ${port}`)
})