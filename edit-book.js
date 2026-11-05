let books = JSON.parse(localStorage.getItem("books")) || [];

const bookSelect = document.getElementById("book-select");
const saveBookButton = document.getElementById("save-book-button");
const message = document.getElementById("message");

bookSelect.addEventListener("change", showBook);
saveBookButton.addEventListener("click", saveBook);

function loadBookList(){
    bookSelect.innerHTML = "";

    if (books.length === 0){
        message.textContent = "There are no books to edit.";
        saveBookButton.disabled = true;
        return;
    }

    books.forEach(book => {
        const option = document.createElement("option");
        option.value = book.id;
        option.textContent = book.title;
        bookSelect.appendChild(option);
    });

    showBook();
}

function showBook(){
    const book = books.find(book => book.id === Number(bookSelect.value));

    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("category").value = book.category;
    message.textContent = "";
}

function saveBook(){
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const category = document.getElementById("category").value;

    if (title==="" || author==="" || category===""){
        message.textContent = "Please fill in all fields";
        return;
    }

    const book = books.find(book => book.id === Number(bookSelect.value));

    book.title = title;
    book.author = author;
    book.category = category;

    localStorage.setItem("books", JSON.stringify(books));

    const selectedId = bookSelect.value;
    loadBookList();
    bookSelect.value = selectedId;
    showBook();

    message.textContent = `"${title}" was updated successfully`;
}

function assertEqual(actual,expected,name){
    if (actual===expected){
        console.log("PASS", name);
    }else{
        console.log("FAIL", name);

    }
}




function testEditBook(){
    const originalBooks=books;
    books = [{ id:1,title:"Old Title",author:"Author",category:"Math"}
];

bookSelect.innerHTML = '<option value="1">Old Title</option>';
bookSelect.value="1";

document.getElementById("title").value="New Title";
document.getElementById("author").value="New Author";
document.getElementById("category").value="Science";


saveBook();
assertEqual(books[0].title,"New Title","Edit Book Title works");
assertEqual(books[0].author,"New Author","Edit Book Author works");
assertEqual(books[0].category,"Science","Edit Book Category works");
books=originalBooks;
localStorage.setItem("books",JSON.stringify(books));
loadBookList();

}





loadBookList();
testEditBook();
