const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  //write code to check is the username is valid
  // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
     return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token including the username
        let accessToken = jwt.sign({
            username: username, // Include the username here
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken,
            username // Store username in the session
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:id", (req, res) => {
    const { id } = req.params; // Get the book ID from the URL parameters
    const username = req.user.username; // Get the logged-in user's username
    const review = req.body.reviews ? req.body.reviews[username] : null; // Extract review

    // Check if the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    // Find the book by ID
    const book = books[id];
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    
// Check if the user has already reviewed this book
if (book.reviews[username]) {
    // Modify the existing review
    book.reviews[username] = review;
    return res.status(200).json({
        message: "Review updated successfully.",
        book: {
            id: book.id,
            author: book.author,
            title: book.title,
            reviews: book.reviews
        }
    });
} else {
    // Add a new review
    book.reviews[username] = review;
    return res.status(201).json({
        message: "Review added successfully.",
        book: {
            id: book.id,
            author: book.author,
            title: book.title,
            reviews: book.reviews
        }
    });
}});

// Delete a book review
regd_users.delete("/auth/review/:id", (req, res) => {
    const { id } = req.params; // Get the book ID from the URL parameters
    const username = req.user.username; // Get the logged-in user's username

    // Find the book by ID
    const book = books[id]; // Assuming books is an object with IDs as keys

    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has a review for this book
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found." });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully.",
        book: {
            id: book.id,
            author: book.author,
            title: book.title,
            reviews: book.reviews
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
