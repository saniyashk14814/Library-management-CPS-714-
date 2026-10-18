const books = JSON.parse(localStorage.getItem("books")) || [];
const dueDateList = document.getElementById("due-date-list");
const checkButton = document.getElementById("check-due-dates");

checkButton.addEventListener("click", showDueDates);



function showDueDates(){

    const memberEmail = document.getElementById("member-email").value.toLowerCase();
    dueDateList.innerHTML = "";


    if (memberEmail===""){
        dueDateList.innerHTML = '<p class="welcome-text">Please enter your email.</p>';
        return;
    }


    const borrowedBooks = books.filter(book => book.borrowedBy === memberEmail);





    if (borrowedBooks.length===0){
        dueDateList.innerHTML='<p class="welcome-text">You currently have no borrowed books.</p>';
        
    }else {
        borrowedBooks.forEach(book => {
            const card=document.createElement("div");
            card.className="dashboard-card book-card";

            card.innerHTML = `<span class="book-category">${book.category}</span>
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>
            <p><strong>Due Date:</strong> ${book.dueDate}</p>`;

            dueDateList.appendChild(card);
        });
    }
}