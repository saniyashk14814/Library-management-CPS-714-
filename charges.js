let books = JSON.parse(localStorage.getItem("books")) || [];

const emailInput = document.getElementById("member-email");
const checkButton = document.getElementById("check-charges-button");
const chargesList = document.getElementById("charges-list");

checkButton.addEventListener("click", () => {
    const email = emailInput.value.toLowerCase().trim();
    const borrowBooks = books.filter(book =>
        book.borrowedBy === email
    );
    
    const overdueBooks = borrowBooks.filter(book => calculateOverdueCharge(book)>0);
    chargesList.innerHTML = "";

    if (overdueBooks.length===0){
        chargesList.innerHTML= `<p class="welcome-text">No overdue charges found.</p>`;
        return;
    }
    overdueBooks.forEach(book=>{
        const charge = calculateOverdueCharge(book);
    

    chargesList.innerHTML += `
        <div class="dashboard-card">
            <h3>${book.title}</h3>
            <p>Due Date: ${book.dueDate}</p>
            <p>Overdue Charge: $${charge}</p>
        </div>
    `;
    })
    
});



function calculateOverdueCharge(book) {
    if (!book.dueDate){
        return 0;
    }
    const today = new Date();
    const dueDate = new Date(book.dueDate);

    if (today<=dueDate){
        return 0;
    }

    const difference = today - dueDate;

    const daysOverdue = Math.ceil (difference / (1000 * 60 * 60 * 24));
    const charge = daysOverdue * 1; //can change 1 for any daily fee
    return charge;
}