const addBookButton = document.getElementById("add-book-button");
addBookButton.addEventListener("click", addBook);

function addBook(){
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const category = document.getElementById("category").value;
    const message = document.getElementById("message");

    if (title==="" || author==="" || category===""){
        message.textContent = "Please fill in all fields";
        return;
    }

    let books = JSON.parse(localStorage.getItem("books")) || [];


    const newBook = {
        id: books.length + 1,
        title: title,
        author: author,
        category: category,
        available: true,
        borrowedBy: null,
        dueDate: null
    };


    books.push(newBook);

    localStorage.setItem("books", JSON.stringify(books));
    message.textContent =  `"${title}" was added successfully`;

    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("category").value = "";




}


