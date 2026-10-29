import express from "express"
import path from "path"

const app = express()
const port = 3000
const __dirname = import.meta.dirname

app.use(express.static("public"))
app.use(express.urlencoded({ extended : true}))
app.use(express.json())

const movies = [
    // Sci-Fi
    { id: 1, title: "The Matrix", genre: "Sci-Fi" },
    { id: 2, title: "Inception", genre: "Sci-Fi" },
    { id: 3, title: "Interstellar", genre: "Sci-Fi" },
    
    // Tragedy
    { id: 4, title: "Macbeth", genre: "Tragedy" },
    { id: 5, title: "Hamlet", genre: "Tragedy" },
    { id: 6, title: "Requiem for a Dream", genre: "Tragedy" },
    
    // Crime
    { id: 7, title: "The Godfather", genre: "Crime" },
    { id: 8, title: "Goodfellas", genre: "Crime" },
    { id: 9, title: "Pulp Fiction", genre: "Crime" },
    
    // Romance
    { id: 10, title: "Titanic", genre: "Romance" },
    { id: 11, title: "The Notebook", genre: "Romance" },
    { id: 12, title: "Pride and Prejudice", genre: "Romance" },
]

// Add code here.




app.listen(port, (req, res) => {
    console.log(`Listening on http://localhost:${port}`)
})
