const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
   const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Function to get books
const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (books && typeof books === 'object') {
            resolve(Object.values(books)); // Convert to array
        } else {
            reject(new Error("Books data is not available.")); // Handle case where books is undefined
        }
    });
};

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBooks(); 
        res.json(bookList); // Neatly format JSON output
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving book list" });
    }
});

const getByISBN = (id) => {
    return new Promise((resolve, reject) => {
        // Assuming 'id' is the key to access the 'books' object
        if (books[id]) {
            resolve(books[id]);
        } else {
            reject({ status: 404, message: `Book with ID ${id} not found` });
        }
    });
};

// Get book details based on ID
public_users.get('/:id', function (req, res) {
    getByISBN(req.params.id)
        .then(result => res.status(200).json(result)) // Return the book details if found
        .catch(error => res.status(error.status).json({ 
            message: error.message })); // Handle errors
});
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorName = req.params.author; // Extract the author name from the request parameters

    try {
        const allBooks = await getBooks(); // Use getBooks to retrieve all books
        console.log("All Books:", allBooks); // Log the books to check their structure
        const booksByAuthor = allBooks.filter(book => book.author.toLowerCase() 
        === authorName.toLowerCase());if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor); // Return the list of books if found
        } else {
            return res.status(404).json({ message: "No books found for this author" });
             // Return 404 if none found
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error retrieving books" }); // Handle any errors
    }
});

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title; // Extract the title from the request parameters

    console.log("Fetching books for title:", title); // Debugging log

    try {
        const allBooks = await getBooks(); // Use getBooks to retrieve all books
        console.log("All Books:", allBooks); // Log the books to check their structure

        if (!Array.isArray(allBooks)) {
            throw new Error("Expected an array of books");
        }

        const booksByTitle = allBooks.filter(book => book.title.toLowerCase() === title.toLowerCase());

        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle); // Return the list of books if found
        } else {
            return res.status(404).json({ message: "No books found for this title" }); // Return 404 if none found
        }
    } catch (error) {
        console.error("Error details:", error); // Log the error details
        return res.status(500).json({ message: "Error retrieving books" }); // Handle any errors
    }
});

//  Get book review
public_users.get('/reviews/:id', function (req, res) {
    const id = req.params.id; // Extract the book ID from the request parameters

    // Check if the book exists
    const book = books[id];

    if (book) {
        // Return the reviews for the book
        return res.status(200).json(books.id);
    } else {
        return res.status(404).json({ message: "Book not found" }); // Return 404 if the book does not exist
    }
});

module.exports.general = public_users;
