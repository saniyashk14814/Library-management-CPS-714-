const defaultBooks = [
    { id: 1, title: "Calculus: Early Transcendentals", author: "James Stewart", category: "Math", available: true, borrowedBy: null, dueDate: null },
    { id: 2, title: "Linear Algebra Done Right", author: "Sheldon Axler", category: "Math", available: true, borrowedBy: null, dueDate: null  },
    { id: 3, title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", available: true, borrowedBy: null, dueDate: null  },
    { id: 4, title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", available: false , borrowedBy: "peter.griffin@yahoo.com", dueDate: "2026-10-31" },
    { id: 5, title: "Prisoners of Geography", author: "Tim Marshall", category: "Geography", available: true, borrowedBy: null, dueDate: null  },
    { id: 6, title: "Guns, Germs, and Steel", author: "Jared Diamond", category: "Geography", available: true, borrowedBy: null, dueDate: null  },
    { id: 7, title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: true, borrowedBy: null, dueDate: null  },
    { id: 8, title: "The Silk Roads", author: "Peter Frankopan", category: "History", available: false, borrowedBy: "louisgriffin@gmail.com", dueDate: "2026-10-31"  },
    { id: 9, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Literature", available: true, borrowedBy: null, dueDate: null  },
    { id: 10, title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", available: true, borrowedBy: null, dueDate: null  }
];

let books = JSON.parse(localStorage.getItem("books"));

if (!books) {
    books=defaultBooks;
    localStorage.setItem("books", JSON.stringify(books));


}

function saveBooks(){
    localStorage.setItem("books", JSON.stringify(books));
}

const role = new URLSearchParams(window.location.search).get("role") === "admin" ? "admin" : "member";

const bookList = document.getElementById("book-list");
const searchInput = document.getElementById("search");

document.getElementById("back-link").href = role === "admin" ? "admin.html" : "member.html";

function renderBooks() {
    const search = searchInput.value.toLowerCase();

    const results = books.filter(book =>
        book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)
    );

    bookList.innerHTML = "";

    if (results.length === 0) {
        bookList.innerHTML = '<p class="welcome-text">No books found.</p>';
        return;
    }

    results.forEach(book => {
        const card = document.createElement("div");
        card.className = "dashboard-card book-card";

        const status = book.available ? "Available" : "Checked Out";
        const statusClass = book.available ? "available" : "unavailable";

        card.innerHTML = `
            <span class="book-category">${book.category}</span>
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>
            <p class="book-status ${statusClass}">${status}</p>
        `;

        const button = document.createElement("button");
        button.className = "book-button";

        if (role === "admin") {
            button.textContent = "Lend";
            button.disabled = !book.available;
            button.onclick = () => lendBook(book);
        } else {
            button.textContent = book.available ? "Borrow" : "Request";
            button.onclick = () => requestBook(book);
        }

        card.appendChild(button);
        bookList.appendChild(card);
    });
}


function lendBook(book) {
    const member = prompt(`Lend "${book.title}" to which member? (enter email)`);
    if (!member) return;

    const dueDate = prompt("Enter due date (YYYY-MM-DD)");
    if (!dueDate) return;

    book.available = false;
    book.borrowedBy = member.toLowerCase();
    book.dueDate = dueDate;

    saveBooks();

    alert(`"${book.title}" has been lent to ${member}.`);
    renderBooks();
    
}


function requestBook(book) {
    if (book.available) {
        alert(`Borrow request sent for "${book.title}". Pick it up at the front desk.`);
    } else {
        alert(`"${book.title}" is checked out. You'll be notified when it's available.`);
    }
}


searchInput.addEventListener("input", renderBooks);

renderBooks();
