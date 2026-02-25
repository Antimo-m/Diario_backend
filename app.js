import express from "express"
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import { authMiddleware } from "./middlewares/authMiddleware.js";



dotenv.config()

const app = express()
const port = process.env.PORT || 3000;

app.use(express.json())

app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Diario attivo");
});

app.get("/api/private", authMiddleware, (req, res) => {
  res.json({ message: `Ciao ${req.user.username}, sei autenticato`});
});


app.listen(port, (err) => {
  if(err){
      console.log("Impossibile collegarsi alla porta" ,err)
  }
    console.log(`Collegato alla porta ${port}`)
})