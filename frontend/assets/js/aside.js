// funcion del sidebar

let arrow = document.querySelectorAll(".arrow");

for (let i = 0; i < arrow.length; i++){
    arrow[i].addEventListener("click", (e)=>{
        let arrowParent = e.target.parentElement.parentElement;
        arrowParent.classList.toggle("showMenu");
    })
}

let slidebar = document.querySelector(".menu-slide");
let slidebarBtn = document.querySelector(".ri-menu-line");
slidebarBtn.addEventListener("click",(e)=>{
    slidebar.classList.toggle("close");
})