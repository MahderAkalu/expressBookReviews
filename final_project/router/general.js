const express = require('express');
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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/:id',function (req, res) {
    const id = req.params.id; // Extract the ID from the request parameters

    // Check if the book exists using the ID
    const book = books[id];

    if (book) {
        return res.status(200).json(book); // Return the book details if found
    } else {
        return res.status(404).json({ message: "Book not found" }); // Return 404 if not found
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author; // Extract the author name from the request parameters

    // Filter books to find those by the specified author
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === authorName.toLowerCase());

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor); // Return the list of books if found
    } else {
        return res.status(404).json({ message: "No books found for this author" }); // Return 404 if none found
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title; // Extract the title from the request parameters

    // Filter books to find those by the specified title
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle); // Return the list of books if found
    } else {
        return res.status(404).json({ message: "No books found for this author" }); // Return 404 if none found
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
