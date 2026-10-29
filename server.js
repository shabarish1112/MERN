import "dotenv/config"
import express from "express"
import mongoose from "mongoose"
import path from "path"
import { fileURLToPath } from "url"
import Movie from "./models/Movie.js"

const app = express()
const port = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mern_routes"

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

const starterMovies = [
  { id: 1, title: "The Matrix", genre: "Sci-Fi" },
  { id: 2, title: "Inception", genre: "Sci-Fi" },
  { id: 3, title: "Interstellar", genre: "Sci-Fi" },
  { id: 4, title: "Macbeth", genre: "Tragedy" },
  { id: 5, title: "Hamlet", genre: "Tragedy" },
  { id: 6, title: "Requiem for a Dream", genre: "Tragedy" },
  { id: 7, title: "The Godfather", genre: "Crime" },
  { id: 8, title: "Goodfellas", genre: "Crime" },
  { id: 9, title: "Pulp Fiction", genre: "Crime" },
  { id: 10, title: "Titanic", genre: "Romance" },
  { id: 11, title: "The Notebook", genre: "Romance" },
  { id: 12, title: "Pride and Prejudice", genre: "Romance" },
]

function validateMovie(req, res, next) {
  const { title, genre } = req.body
  if (!title?.trim() || !genre?.trim()) {
    return res.status(400).json({ message: "title and genre are both required" })
  }
  next()
}

async function getNextMovieId() {
  const latestMovie = await Movie.findOne().sort({ id: -1 }).select("id").lean()
  return latestMovie ? latestMovie.id + 1 : 1
}

async function seedMoviesIfEmpty() {
  const count = await Movie.countDocuments()
  if (count === 0) {
    await Movie.insertMany(starterMovies)
    console.log("Inserted starter movies into MongoDB")
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"))
})

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/about.html"))
})

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/contact.html"))
})

app.get("/newmovie", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/newmovie.html"))
})

app.get("/search", async (req, res, next) => {
  try {
    const genre = String(req.query.genre || "").trim()
    const results = genre
      ? await Movie.find({ genre: { $regex: `^${genre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } })
          .sort({ id: 1 })
          .lean()
      : []

    const rows = results.map(movie => `<li>${movie.title} (${movie.genre})</li>`).join("")

    res.status(200).send(`
      <h1>Results for "${genre}"</h1>
      <ul>${rows || "<li>No movies found</li>"}</ul>
      <a href="/">Back home</a>
    `)
  } catch (error) {
    next(error)
  }
})

app.post("/addmovie", validateMovie, async (req, res, next) => {
  try {
    const movie = await Movie.create({
      id: await getNextMovieId(),
      title: req.body.title.trim(),
      genre: req.body.genre.trim(),
    })

    console.log("CREATED:", movie)
    res.redirect("/")
  } catch (error) {
    next(error)
  }
})

app.get("/movie/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ id: Number(req.params.id) }).lean()
    if (!movie) return res.status(404).json({ message: "Movie not found" })
    res.status(200).json(movie)
  } catch (error) {
    next(error)
  }
})

app.put("/movie/:id", validateMovie, async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { id: Number(req.params.id) },
      { title: req.body.title.trim(), genre: req.body.genre.trim() },
      { new: true, runValidators: true }
    )

    if (!movie) return res.status(404).json({ message: "Movie not found" })

    res.status(200).json({
      message: `Updated movie ${movie.id} to "${movie.title}"`,
      movie,
    })
  } catch (error) {
    next(error)
  }
})

app.delete("/movie/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndDelete({ id: Number(req.params.id) })
    if (!movie) return res.status(404).json({ message: "Movie not found" })

    res.status(200).json({ message: `Deleted "${movie.title}"`, movie })
  } catch (error) {
    next(error)
  }
})

app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: "Something went wrong on the server" })
})

async function startServer() {
  try {
    await mongoose.connect(mongoUri)
    console.log(`MongoDB connected: ${mongoose.connection.name}`)
    await seedMoviesIfEmpty()

    app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error.message)
    console.error("Make sure MongoDB is running, or set MONGODB_URI in a .env file.")
    process.exit(1)
  }
}

startServer()
