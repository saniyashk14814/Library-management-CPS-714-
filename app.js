const accounts = [
    {
    email: "admin@library.ca",
    password: "Libraryadmin!",
    },

    {
        email: "member@library.ca",
        password: "Librarymember!",
    }
]


    function login() {
        const email = document.getElementById("email").value.toLowerCase();
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        if (email === "admin@library.ca" && password === "Libraryadmin!"){
            window.location.href="admin.html";
        }else if (email === "member@library.ca" && password === "Librarymember!"){
            window.location.href="member.html";

        }else{
            message.innerHTML = "Incorrect email or password. Please try again"
        }
    }




