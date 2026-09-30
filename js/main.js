/* =========================
   EBERIA
   INTRODUCTION
========================= */

const blackScreen =
    document.getElementById("blackScreen");

const scene =
    document.getElementById("scene");

const sceneImage =
    document.getElementById("sceneImage");

const storyText =
    document.getElementById("storyText");

const gameCursor =
    document.getElementById("gameCursor");

const music =
    document.getElementById("music");


/* =========================
   HISTOIRE
========================= */

const scenes = [

    {
        image: "img/img1.png",

        text:
        "Il existait autrefois un monde où la nature semblait ne connaître aucune limite."
    },

    {
        image: "img/img2.png",

        text:
        "Mais derrière cette beauté se cachait une histoire que le temps avait tenté d'effacer."
    },

    {
        image: "img/img3.png",

        text:
        "Depuis des siècles, un homme parcourait ce monde sans jamais trouver de véritable refuge."
    },

    {
        image: "img/img4.png",

        text:
        "Son nom était Adam."
    },

    {
        image: "img/img5.png",

        text:
        "Pendant ce temps, les hommes avaient oublié ce qui leur avait été donné."
    },

    {
        image: "img/img6.png",

        text:
        "Le désir, le pouvoir et la richesse avaient fini par devenir leurs seules lois."
    },

    {
        image: "img/img7.png",

        text:
        "Alors, quelque chose qui les observait depuis bien plus longtemps qu'ils ne pouvaient l'imaginer se réveilla."
    },

    {
        image: "img/img8.png",

        text:
        "Et cette fois, le monde entier allait payer le prix de leurs choix."
    },

    {
        image: "img/img9.png",

        text:
        "Au milieu des ruines, Adam ouvrit les yeux."
    }

];


let currentScene = -1;

let changing = false;


/* =========================
   AFFICHER UNE SCÈNE
========================= */

function showScene(index) {

    if (index >= scenes.length) {

        finishIntroduction();

        return;
    }

    changing = true;

    const current =
        scenes[index];


    /* Cacher le texte */

    storyText.classList.remove("show");


    /* Cacher l'image */

    sceneImage.classList.remove("show");


    setTimeout(() => {

        sceneImage.src =
            current.image;

        storyText.textContent =
            current.text;


        sceneImage.onload = () => {

            sceneImage.classList.add("show");

        };


        setTimeout(() => {

            storyText.classList.add("show");

            changing = false;

        }, 700);

    }, 700);
}


/* =========================
   COMMENCER
========================= */

function startIntroduction() {

    blackScreen.classList.remove("active");

    scene.classList.add("active");

    currentScene = 0;


    /* MUSIQUE */

    music.volume = 0.4;

    music.play();


    showScene(currentScene);
}


/* =========================
   SCÈNE SUIVANTE
========================= */

function nextScene() {

    if (changing) {
        return;
    }

    currentScene++;

    showScene(currentScene);
}


/* =========================
   FIN DE L'INTRODUCTION
========================= */

function finishIntroduction() {

    scene.classList.remove("active");


    setTimeout(() => {

        blackScreen.classList.add("active");

        document.getElementById(
            "openingText"
        ).textContent = "EBERIA";

    }, 1500);
}


/* =========================
   CLIQUER / TOUCHER
========================= */

document.addEventListener(
    "click",
    () => {

        if (currentScene === -1) {

            startIntroduction();

        } else {

            nextScene();

        }

    }
);


/* =========================
   CURSEUR BLEU
========================= */

document.addEventListener(
    "mousemove",
    (event) => {

        gameCursor.style.display =
            "block";

        gameCursor.style.left =
            event.clientX + "px";

        gameCursor.style.top =
            event.clientY + "px";

    }
);


/* =========================
   CLIC DU CURSEUR
========================= */

document.addEventListener(
    "mousedown",
    () => {

        gameCursor.classList.add(
            "touch"
        );

    }
);


/* =========================
   RELÂCHER LE CLIC
========================= */

document.addEventListener(
    "mouseup",
    () => {

        gameCursor.classList.remove(
            "touch"
        );

    }
);