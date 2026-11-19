let books = JSON.parse(localStorage.getItem("books")) || [];
const overdueBookList = document.getElementById("overdue-book-list");

function getDaysOverdue(book){
    if (!book.dueDate){
        return 0;
    }
    const today = new Date();
    const dueDate = new Date(book.dueDate);

    if (today<=dueDate){
        return 0;
    }

    const difference = today - dueDate;
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function renderOverdueBooks(){
    const overdueBooks = books
        .filter(book => !book.available && getDaysOverdue(book)>0)
        .sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a));

    overdueBookList.innerHTML = "";

    if (overdueBooks.length===0){
        overdueBookList.innerHTML = '<p class="welcome-text">There are no overdue books.</p>';
        return;
    }

    overdueBooks.forEach(book => {
        const daysOverdue = getDaysOverdue(book);
        const charge = daysOverdue * 1; //can change 1 for any daily fee

        const card = document.createElement("div");
        card.className = "dashboard-card book-card";

        card.innerHTML = `<span class="book-category">${book.category}</span>
        <h3>${book.title}</h3>
        <p>by ${book.author}</p>
        <p><strong>Borrowed By:</strong> ${book.borrowedBy}</p>
        <p><strong>Due Date:</strong> ${book.dueDate}</p>
        <p><strong>Overdue Charge:</strong> $${charge}</p>
        <p class="book-status unavailable">${daysOverdue} ${daysOverdue===1 ? "day" : "days"} overdue</p>`;

        overdueBookList.appendChild(card);
    });
}

renderOverdueBooks();
