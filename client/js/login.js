const form=document.getElementById("loginform");
const email=document.getElementById("email");
const password=document.getElementById("password");
const errorbox=document.getElementById("errorbox");
form.addEventListener("submit",function(event){
   
    event.preventDefault();
    const errors=[];
    errorbox.textContent="";
    const emailval=email.value;
    if(emailval.trim()===""){
        errors.push("Email is required");
    }
    const pass=password.value;
     if(pass.length<8){
        errors.push("Password must be at least 8 characters");
    }
    if(errors.length>0){
        errorbox.textContent=errors.join("\n");
        return;
    }
    const storedusers=localStorage.getItem("users");
     let users = storedusers ? JSON.parse(storedusers) : [];
     const matcheduser = users.find(function(user) {
    return user.email === emailval && user.password === pass;
});
    if(matcheduser){
        localStorage.setItem("currentUser", JSON.stringify(matcheduser));
        window.location.href = "dashboard.html";
    }
    else{
        errorbox.textContent="Invalid email or password";
    }

    

})