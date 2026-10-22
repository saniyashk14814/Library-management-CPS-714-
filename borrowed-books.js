const books = JSON.parse(localStorage.getItem("books")) || [];
const borrowedBookList = document.getElementById("borrowed-book-list");
const checkButton = document.getElementById("check-borrowed-books");

checkButton.addEventListener("click", showBorrowedBooks);

function showBorrowedBooks(){
    const memberEmail = document.getElementById("member-email").value.toLowerCase();
    borrowedBookList.innerHTML = "";

    if (memberEmail===""){
        borrowedBookList.innerHTML = '<p class="welcome-text">Please enter your email.</p>';
        return;
    }

    const borrowedBooks = books.filter(book => book.borrowedBy === memberEmail);

    if (borrowedBooks.length===0){
        borrowedBookList.innerHTML = '<p class="welcome-text">You currently have no borrowed books.</p>';
        return;
    }

    borrowedBooks.forEach(book => {
        const card = document.createElement("div");
        card.className = "dashboard-card book-card";

        card.innerHTML = `<span class="book-category">${book.category}</span>
        <h3>${book.title}</h3>
        <p>by ${book.author}</p>
        <p><strong>Due Date:</strong> ${book.dueDate}</p>`;

        const button = document.createElement("button");
        button.className = "book-button";
        button.textContent = "Return";
        button.onclick = () => returnBook(book);

        card.appendChild(button);
        borrowedBookList.appendChild(card);
    });
}

function returnBook(book){
    book.available = true;
    book.borrowedBy = null;
    book.dueDate = null;

    localStorage.setItem("books", JSON.stringify(books));

    alert(`"${book.title}" has been returned.`);
    showBorrowedBooks();
}
