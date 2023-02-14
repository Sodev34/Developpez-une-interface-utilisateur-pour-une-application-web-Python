const apiUrl = "http://localhost:8000/api/v1/titles/"

// récupération des ressources

async function get_request(apiUrl){
    let response = await fetch(apiUrl)
    if (response.ok){
        return response.json();
    } else{
        return false;
    }

}

// Meilleur film

function collectBestMovie() {
    let bestTitle = document.getElementById('high-title');
    let bestImg = document.getElementsByClassName('best-img')[0].getElementsByTagName("img")[0];
    let bestDesc = document.getElementsByClassName('best-desc')[0];
    let bestButton = document.getElementsByClassName('button')[1];

    get_request(apiUrl + "?sort_by=-imdb_score")
        .then(data => {
            bestTitle.innerHTML = data["results"][3]["title"];
            bestImg.src = data["results"][3]["image_url"];
            bestButton.setAttribute("onclick", `openModal("${data["results"][3]["id"]}")`)
            get_request(data["results"][3]["url"])
                .then(data => {
                    bestDesc.innerHTML = data["description"];
                })
        })
}

// Modale

function openModal(id) {
    let modal = document.getElementById("modal");
    let close = document.getElementsByClassName("close")[0];

    collectModalData(id)

    modal.style.display = "block";

    close.onclick = function () {
        modal.style.display = "none";
    }
}

function collectModalData(id) {
    get_request(apiUrl + id)
        .then(data => {

            document.getElementById('modal-image').src = data["image_url"];
            document.getElementById('modal-title').innerHTML = data["title"];

            document.getElementById('modal-year').innerHTML = data["year"];
            document.getElementById('modal-duration').innerHTML = data["duration"] + " min";
            document.getElementById('modal-genres').innerHTML = data["genres"];
            document.getElementById('modal-imdb').innerHTML = data["imdb_score"] + " / 10";

            document.getElementById('modal-directors').innerHTML = data["directors"];
            document.getElementById('modal-cast').innerHTML = data["actors"];
            document.getElementById('modal-country').innerHTML = data["countries"];
            document.getElementById('modal-rating').innerHTML = "Rated: " + data["rated"].substr(0, 9);

            let modalBoxOffice = document.getElementById('modal-box-office');
            if (data["worldwide_gross_income"] == null)
                modalBoxOffice.innerHTML = "Non disponible";  
            else
                modalBoxOffice.innerHTML = data["worldwide_gross_income"] + " " + data["budget_currency"];

            let modalDescription = document.getElementById('modal-desc')
            if (data["long_description"] == "|")
                modalDescription.innerHTML = " Non disponible";
            else
                modalDescription.innerHTML = data["long_description"];

        })
}

// Catégorie

async function collectCategories(name){
        let moviesData = []
        let response = await get_request(apiUrl + "?sort_by=-imdb_score&genre=" + name);
        for(let movie of response.results){
            moviesData.push(movie)
        }
    
        var response_page2 = await get_request(apiUrl + "?genre=" + name + "&page=2&sort_by=-imdb_score")
    
        if (response_page2){
        for(let i = 0; i<2 ; i++){
            moviesData.push(response_page2.results[i])
            }
        }
        console.log(moviesData)
        return moviesData
    }


function carouselGoLeft(category) {
    let carrouselContent = document.querySelector("#" + category + "-movies");
    let carrouselLeft= document.querySelector("#" + category + "-left");
    let carrouselRight = document.querySelector("#" + category + "-right");

    carrouselContent.style.left = "-630px";
    carrouselRight.classList.remove("show");
    carrouselLeft.classList.add("show");
}

function carouselGoRight(category) {
    let carrouselContent = document.querySelector("#" + category + "-movies");
    let carrouselLeft = document.querySelector("#" + category + "-left");
    let carrouselRight = document.querySelector("#" + category + "-right");

    carrouselContent.style.left = "0px";
    carrouselRight.classList.add("show");
    carrouselLeft.classList.remove("show");
}

async function constructorCarousel(category, name) {
    let category_name = name;
    if (name === "top-movies")
        category_name = "";

    const section = document.createElement("section")
    section.classList.add("categories")

    const carousel = document.createElement('div');
    carousel.classList.add('zone');

    const categoryTitle = document.createElement('h2');
    categoryTitle.innerHTML = `${category}`;
    carousel.append(categoryTitle);

    const carouselZone = document.createElement('div');
    carouselZone.classList.add('carousel-zone');

    const carouselContent = document.createElement('div');
    carouselContent.classList.add('carousel-content');
    carouselContent.setAttribute("id", `${name}-movies`)

    document.querySelector('.carousels').appendChild(section);

    const movies = await collectCategories(category_name); 

    let i = 0;
    for (const movie of movies) {
        const box = document.createElement('div');
        box.classList.add("box");
        box.setAttribute("id", `${category_name}${i + 1}`);

        const movieImage = document.createElement("img");
        movieImage.setAttribute("alt", movie.title);
        movieImage.src = movie.image_url;
        box.appendChild(movieImage);

        const mask = document.createElement("div");
        mask.classList.add("mask");

        const movieTitle = document.createElement("p");
        movieTitle.innerHTML = movie.title;
        mask.appendChild(movieTitle);

        const playButton = document.createElement("button");
        playButton.classList.add("mask-button");
        playButton.innerHTML = '<i class="fa-brands fa-youtube" style="font-size: 1.5rem;"></i>';
        mask.appendChild(playButton);

        const modalButton = document.createElement("button");
        modalButton.classList.add("mask-button");
        modalButton.setAttribute("onclick", `openModal("${movie.id}")`);
        modalButton.innerHTML = '<i class="fa-solid fa-circle-info" style="font-size: 1.5rem;"></i>';
        mask.appendChild(modalButton);

        box.appendChild(mask);
        carouselContent.appendChild(box);

        i++;
    }

    const move = document.createElement("div");
    move.classList.add("move");

    const leftBtn = document.createElement('button');
    leftBtn.classList.add('btn');
    leftBtn.classList.add('left');
    leftBtn.setAttribute('aria-label', `${name} slide left`);
    leftBtn.setAttribute('id', `${name}-left`);
    leftBtn.setAttribute('onclick', `carouselGoRight("${name}")`);
    leftBtn.innerHTML = '<i class="fa-solid fa-circle-left"></i>';
    move.appendChild(leftBtn);

    const rightBtn = document.createElement('button');
    rightBtn.classList.add('btn');
    rightBtn.classList.add('right');
    rightBtn.classList.add('show');
    rightBtn.setAttribute('id', `${name}-right`);
    rightBtn.setAttribute('aria-label', `${name} slide right`);
    rightBtn.setAttribute('onclick', `carouselGoLeft("${name}")`);
    rightBtn.innerHTML = '<i class="fa-solid fa-circle-right"></i>';
    move.appendChild(rightBtn);

    carouselZone.appendChild(carouselContent);
    carouselZone.appendChild(move);

    carousel.appendChild(carouselZone);
    section.appendChild(carousel);
}

// Récupération du meilleur film et des 4 catégories

window.addEventListener('load', () => {
    collectBestMovie();
    constructorCarousel("Film les mieux notés", "top-movies");
    constructorCarousel("Action", "Action");
    constructorCarousel("Animation", "Animation");
    constructorCarousel("Science fiction", "Sci-Fi");

    
});
