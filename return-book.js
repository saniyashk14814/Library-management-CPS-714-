const books = JSON.parse(localStorage.getItem("books")) || [];
const lentBookList = document.getElementById("lent-book-list");

function renderLentBooks(){
    const lentBooks = books.filter(book => !book.available);

    lentBookList.innerHTML = "";

    if (lentBooks.length===0){
        lentBookList.innerHTML = '<p class="welcome-text">There are no lent out books.</p>';
        return;
    }

    lentBooks.forEach(book => {
        const card = document.createElement("div");
        card.className = "dashboard-card book-card";

        card.innerHTML = `<span class="book-category">${book.category}</span>
        <h3>${book.title}</h3>
        <p>by ${book.author}</p>
        <p><strong>Borrowed By:</strong> ${book.borrowedBy}</p>
        <p><strong>Due Date:</strong> ${book.dueDate}</p>`;

        const button = document.createElement("button");
        button.className = "book-button";
        button.textContent = "Process Return";
        button.onclick = () => returnBook(book);

        card.appendChild(button);
        lentBookList.appendChild(card);
    });
}

function returnBook(book){
    book.available = true;
    book.borrowedBy = null;
    book.dueDate = null;

    localStorage.setItem("books", JSON.stringify(books));

    alert(`"${book.title}" has been returned.`);
    renderLentBooks();
}

renderLentBooks();
