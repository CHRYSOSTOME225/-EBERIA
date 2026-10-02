/* =========================================================
   EBERIA — QUÊTE 1
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

const mapContainer = document.getElementById("map-container");
const adam = document.getElementById("adam");

const enterScreen = document.getElementById("enter-screen");
const gameScreen = document.getElementById("game-screen");
const enterButton = document.getElementById("enter-button");

const objectiveText = document.getElementById("objective-text");
const menuObjective = document.getElementById("menu-objective");

const interactionBox = document.getElementById("interaction-box");
const interactionTitle = document.getElementById("interaction-title");
const interactionDescription = document.getElementById("interaction-description");

const examineButton = document.getElementById("examine-button");
const closeInteraction = document.getElementById("close-interaction");

const npcDialogue = document.getElementById("npc-dialogue");
const dialoguePortrait = document.getElementById("dialogue-portrait");
const dialogueName = document.getElementById("dialogue-name");
const dialogueText = document.getElementById("dialogue-text");
const closeDialogue = document.getElementById("close-dialogue");

const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");

/* CURSEUR DE DESTINATION */
const destinationCursor = document.getElementById("destination-cursor");


/* =========================================================
   MENU
========================================================= */

const menuButton = document.getElementById("menu-button");
const playerMenu = document.getElementById("player-menu");
const closeMenu = document.getElementById("close-menu");

const menuTabs = document.querySelectorAll(".menu-tab");
const menuPages = document.querySelectorAll(".menu-page");


/* =========================================================
   QUÊTE
========================================================= */

let questStep = 1;


/* =========================================================
   DÉPLACEMENT
========================================================= */

const ADAM_SPEED = 180;

let adamX = 50;
let adamY = 55;

let currentDestination = null;
let lastTime = 0;

let movementAnimation = null;


/* =========================================================
   DISTANCES
========================================================= */

const NPC_INTERACTION_DISTANCE = 120;


/* =========================================================
   OBSTACLES
========================================================= */

const obstacles = [

    {
        x1: 8,
        y1: 12,
        x2: 37,
        y2: 34
    },

    {
        x1: 51,
        y1: 9,
        x2: 74,
        y2: 34
    },

    {
        x1: 64,
        y1: 58,
        x2: 79,
        y2: 84
    },

    {
        x1: 8,
        y1: 82,
        x2: 27,
        y2: 94
    },

    {
        x1: 91,
        y1: 0,
        x2: 100,
        y2: 40
    },

    {
        x1: 94,
        y1: 43,
        x2: 100,
        y2: 60
    },

    {
        x1: 88,
        y1: 70,
        x2: 100,
        y2: 100
    }

];


/* =========================================================
   PNJ
========================================================= */

const npcs = {

    ancien: {

        element: document.getElementById("npc-ancien"),

        name: "Elyan — l'ancien",

        image: "img/ancien.png",

        text:
            "Tu cherches des réponses, étranger ? " +
            "Alors sache que certaines vérités auraient dû rester oubliées."
    },

    marchande: {

        element: document.getElementById("npc-marchande"),

        name: "Naïa — la marchande",

        image: "img/marchande.png",

        text:
            "Les voyageurs racontent que les ruines du sud " +
            "cachent quelque chose que personne n'ose toucher."
    },

    voyageur: {

        element: document.getElementById("npc-voyageur"),

        name: "Kael — le voyageur",

        image: "img/voyageur.png",

        text:
            "J'ai vu des hommes partir vers les ruines. " +
            "Aucun ne parlait de ce qu'il avait découvert."
    }

};


/* =========================================================
   POSITIONS PNJ
========================================================= */

function positionNPCs() {

    npcs.ancien.element.style.left = "62%";
    npcs.ancien.element.style.top = "40%";

    npcs.marchande.element.style.left = "15%";
    npcs.marchande.element.style.top = "41%";

    npcs.voyageur.element.style.left = "20%";
    npcs.voyageur.element.style.top = "73%";

    updateCoveredLocations();

}


/* =========================================================
   POSITION ADAM
========================================================= */

function updateAdamPosition() {

    if (!adam) {
        return;
    }

    adam.style.left = `${adamX}%`;
    adam.style.top = `${adamY}%`;

}


/* =========================================================
   POSITION RÉELLE D'ADAM
========================================================= */

function getAdamPosition() {

    if (!adam || !mapContainer) {
        return null;
    }

    const mapRect =
        mapContainer.getBoundingClientRect();

    const adamRect =
        adam.getBoundingClientRect();

    if (
        mapRect.width <= 0 ||
        mapRect.height <= 0
    ) {
        return null;
    }

    return {

        x:
            adamRect.left +
            adamRect.width / 2 -
            mapRect.left,

        y:
            adamRect.top +
            adamRect.height / 2 -
            mapRect.top

    };

}


/* =========================================================
   POSITION D'UN ÉLÉMENT
========================================================= */

function getElementPosition(element) {

    if (!element || !mapContainer) {
        return null;
    }

    const mapRect =
        mapContainer.getBoundingClientRect();

    const elementRect =
        element.getBoundingClientRect();

    return {

        x:
            elementRect.left +
            elementRect.width / 2 -
            mapRect.left,

        y:
            elementRect.top +
            elementRect.height / 2 -
            mapRect.top

    };

}


/* =========================================================
   OBSTACLE
========================================================= */

function isInsideObstacle(x, y) {

    const width =
        mapContainer.clientWidth;

    const height =
        mapContainer.clientHeight;

    const percentX =
        (x / width) * 100;

    const percentY =
        (y / height) * 100;

    return obstacles.some(obstacle => {

        return (
            percentX >= obstacle.x1 &&
            percentX <= obstacle.x2 &&
            percentY >= obstacle.y1 &&
            percentY <= obstacle.y2
        );

    });

}


/* =========================================================
   DISTANCE
========================================================= */

function distanceBetween(
    x1,
    y1,
    x2,
    y2
) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx + dy * dy
    );

}


/* =========================================================
   CURSEUR DE DESTINATION
========================================================= */

function showDestinationCursor(x, y) {

    if (!destinationCursor) {
        return;
    }

    destinationCursor.style.left = `${x}px`;
    destinationCursor.style.top = `${y}px`;
    destinationCursor.style.display = "block";

}


/* =========================================================
   DÉPLACEMENT
========================================================= */

function moveAdamTo(x, y) {

    if (!mapContainer) {
        return;
    }

    /* Afficher l'effet exactement à l'endroit du clic */
    showDestinationCursor(x, y);

    const width =
        mapContainer.clientWidth;

    const height =
        mapContainer.clientHeight;

    const destinationX =
        Math.max(
            2,
            Math.min(98, (x / width) * 100)
        );

    const destinationY =
        Math.max(
            5,
            Math.min(95, (y / height) * 100)
        );

    currentDestination = {
        x: destinationX,
        y: destinationY
    };

    if (!movementAnimation) {

        lastTime = performance.now();

        movementAnimation =
            requestAnimationFrame(moveAdam);

    }

}


/* =========================================================
   ANIMATION D'ADAM
========================================================= */

function moveAdam(timestamp) {

    if (!currentDestination) {

        movementAnimation = null;

        return;
    }

    const delta =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );

    lastTime = timestamp;


    const dx =
        currentDestination.x - adamX;

    const dy =
        currentDestination.y - adamY;

    const distance =
        Math.sqrt(
            dx * dx + dy * dy
        );


    if (distance < 0.5) {

        adamX =
            currentDestination.x;

        adamY =
            currentDestination.y;

        currentDestination = null;

        updateAdamPosition();
        updateInteraction();

        movementAnimation = null;

        return;
    }


    const speedPercent =
        (ADAM_SPEED * delta) /
        mapContainer.clientWidth *
        100;


    const ratio =
        Math.min(
            speedPercent / distance,
            1
        );


    const newX =
        adamX + dx * ratio;

    const newY =
        adamY + dy * ratio;


    const pixelX =
        (newX / 100) *
        mapContainer.clientWidth;

    const pixelY =
        (newY / 100) *
        mapContainer.clientHeight;


    if (
        !isInsideObstacle(
            pixelX,
            pixelY
        )
    ) {

        adamX = newX;
        adamY = newY;

    } else {

        currentDestination = null;

    }


    updateAdamPosition();

    updateInteraction();


    movementAnimation =
        requestAnimationFrame(moveAdam);

}


/* =========================================================
   CLIC SUR LA CARTE
========================================================= */

mapContainer.addEventListener(
    "click",
    function(event) {

        if (
            event.target.closest(".npc") ||
            event.target.closest(".location") ||
            event.target.closest("button") ||
            event.target.closest("#interaction-box") ||
            event.target.closest("#npc-dialogue") ||
            event.target.closest("#player-menu")
        ) {
            return;
        }


        const rect =
            mapContainer.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;

        const y =
            event.clientY -
            rect.top;


        moveAdamTo(x, y);

    }
);


/* =========================================================
   PNJ PROCHE
========================================================= */

function getNearbyNPC() {

    const adamPosition =
        getAdamPosition();

    if (!adamPosition) {
        return null;
    }


    for (const key in npcs) {

        const npc =
            npcs[key];

        const position =
            getElementPosition(
                npc.element
            );

        if (!position) {
            continue;
        }


        const distance =
            distanceBetween(
                adamPosition.x,
                adamPosition.y,
                position.x,
                position.y
            );


        if (
            distance <=
            NPC_INTERACTION_DISTANCE
        ) {

            return npc;

        }

    }


    return null;

}


/* =========================================================
   ICÔNES PNJ
========================================================= */

function updateNPCIcons() {

    const nearbyNPC =
        getNearbyNPC();


    Object.values(npcs).forEach(npc => {

        npc.element.classList.remove(
            "nearby-npc"
        );

    });


    if (nearbyNPC) {

        nearbyNPC.element.classList.add(
            "nearby-npc"
        );

    }

}


/* =========================================================
   ZONE DE LIEU PROCHE
========================================================= */

function getNearbyLocation() {

    const adamPosition =
        getAdamPosition();

    if (!adamPosition) {
        return null;
    }


    const zones =
        document.querySelectorAll(
            ".location-zone"
        );


    for (const zone of zones) {

        const position =
            getElementPosition(zone);

        if (!position) {
            continue;
        }


        const radius =
            zone.offsetWidth / 2;


        const distance =
            distanceBetween(
                adamPosition.x,
                adamPosition.y,
                position.x,
                position.y
            );


        if (distance <= radius) {

            return zone.dataset.location;

        }

    }


    return null;

}


/* =========================================================
   ZONES ACTIVES
========================================================= */

function updateLocationZones() {

    const nearbyLocation =
        getNearbyLocation();


    const zones =
        document.querySelectorAll(
            ".location-zone"
        );


    zones.forEach(zone => {

        if (
            zone.dataset.location ===
            nearbyLocation
        ) {

            zone.classList.add(
                "nearby-location"
            );

        } else {

            zone.classList.remove(
                "nearby-location"
            );

        }

    });

}


/* =========================================================
   INTERACTION GÉNÉRALE
========================================================= */

function updateInteraction() {

    updateNPCIcons();

    updateLocationZones();


    const nearbyNPC =
        getNearbyNPC();


    if (nearbyNPC) {

        interactionBox.classList.remove(
            "show"
        );

        return;
    }


    const location =
        getNearbyLocation();


    if (location) {

        prepareLocationInteraction(
            location
        );

    } else {

        interactionBox.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   INTERACTION LIEU
========================================================= */

function prepareLocationInteraction(location) {

    let title = "";
    let description = "";


    switch (location) {

        case "western":

            title =
                "Ruines occidentales";

            description =
                "Des ruines anciennes se dressent " +
                "à l'ouest de Néiris. " +
                "Quelque chose semble avoir été caché ici.";

            break;


        case "sanctuary":

            title =
                "Sanctuaire oublié";

            description =
                "Un ancien sanctuaire abandonné " +
                "semble lié à une histoire que les habitants " +
                "préfèrent oublier.";

            break;


        case "well":

            title =
                "Ancien puits";

            description =
                "Le vieux puits semble ne plus être utilisé " +
                "depuis des années.";

            break;


        case "southern":

            title =
                "Ruines du sud";

            description =
                "Les pierres portent des marques étranges. " +
                "Peut-être qu'un objet y a été dissimulé.";

            break;


        case "camp":

            title =
                "Camp abandonné";

            description =
                "Quelqu'un vivait ici récemment. " +
                "Quelques traces subsistent encore.";

            break;


        case "bridge":

            title =
                "Pont oriental";

            description =
                "Le vieux pont permet de rejoindre " +
                "l'est de la ville.";

            break;

    }


    interactionTitle.textContent =
        title;

    interactionDescription.textContent =
        description;


    interactionBox.classList.add(
        "show"
    );


    examineButton.dataset.location =
        location;

}


/* =========================================================
   EXAMINER UN LIEU
========================================================= */

examineButton.addEventListener(
    "click",
    function() {

        const location =
            examineButton.dataset.location;


        interactWithLocation(
            location
        );

    }
);


/* =========================================================
   PROGRESSION DE QUÊTE
========================================================= */

function interactWithLocation(location) {

    switch (location) {


        case "western":

            if (questStep === 1) {

                showMessage(
                    "Adam découvre un symbole ancien gravé dans la pierre."
                );

                questStep = 2;

                updateQuestUI();

                interactionBox.classList.remove(
                    "show"
                );

            } else {

                showMessage(
                    "Les ruines ne révèlent rien de nouveau."
                );

            }

            break;


        case "sanctuary":

            if (questStep === 2) {

                showMessage(
                    "Une inscription évoque une ancienne secte et des documents capables de révéler l'avenir."
                );

                questStep = 3;

                updateQuestUI();

                interactionBox.classList.remove(
                    "show"
                );

            } else {

                showMessage(
                    "Le sanctuaire reste silencieux."
                );

            }

            break;


        case "well":

            showMessage(
                "Le vieux puits est vide."
            );

            break;


        case "southern":

            if (questStep === 3) {

                showMessage(
                    "Adam découvre une boîte contenant d'anciens documents."
                );

                questStep = 4;

                updateQuestUI();

                interactionBox.classList.remove(
                    "show"
                );

            } else if (questStep === 4) {

                showMessage(
                    "Les documents décrivent des événements qui ne se sont pas encore produits."
                );

                questStep = 5;

                updateQuestUI();

                interactionBox.classList.remove(
                    "show"
                );

            } else {

                showMessage(
                    "Les ruines semblent avoir livré leur secret."
                );

            }

            break;


        case "camp":

            showMessage(
                "Le camp semble avoir été abandonné précipitamment."
            );

            break;


        case "bridge":

            showMessage(
                "Le pont mène vers les territoires orientaux."
            );

            break;

    }

}


/* =========================================================
   INTERFACE DE QUÊTE
========================================================= */

function updateQuestUI() {

    let objective = "";


    switch (questStep) {

        case 1:

            objective =
                "Explorer les ruines occidentales.";

            break;


        case 2:

            objective =
                "Rejoindre le sanctuaire oublié.";

            break;


        case 3:

            objective =
                "Explorer les ruines du sud.";

            break;


        case 4:

            objective =
                "Examiner les anciens documents.";

            break;


        case 5:

            objective =
                "Découvrir ce que les documents cachent.";

            break;

    }


    objectiveText.textContent =
        objective;

    menuObjective.textContent =
        objective;

}


/* =========================================================
   DIALOGUE PNJ
========================================================= */

function openNPCDialogue(npc) {

    dialogueName.textContent =
        npc.name;

    dialogueText.textContent =
        npc.text;

    dialoguePortrait.src =
        npc.image;


    npcDialogue.classList.add(
        "show"
    );

}


function closeNPCDialogue() {

    npcDialogue.classList.remove(
        "show"
    );

}


/* =========================================================
   CLIC SUR PNJ
========================================================= */

Object.values(npcs).forEach(npc => {

    npc.element.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            const adamPosition =
                getAdamPosition();

            const npcPosition =
                getElementPosition(
                    npc.element
                );


            if (
                !adamPosition ||
                !npcPosition
            ) {
                return;
            }


            const distance =
                distanceBetween(
                    adamPosition.x,
                    adamPosition.y,
                    npcPosition.x,
                    npcPosition.y
                );


            if (
                distance <=
                NPC_INTERACTION_DISTANCE
            ) {

                openNPCDialogue(npc);

            } else {

                showMessage(
                    "Approche-toi davantage."
                );

            }

        }
    );

});


/* =========================================================
   FERMER DIALOGUE
========================================================= */

closeDialogue.addEventListener(
    "click",
    function() {

        closeNPCDialogue();

    }
);


/* =========================================================
   FERMER INTERACTION
========================================================= */

closeInteraction.addEventListener(
    "click",
    function() {

        interactionBox.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   MESSAGE
========================================================= */

let messageTimeout = null;

function showMessage(message) {

    messageText.textContent =
        message;


    messageBox.classList.add(
        "show"
    );


    clearTimeout(
        messageTimeout
    );


    messageTimeout =
        setTimeout(
            function() {

                messageBox.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   MENU — OUVRIR
========================================================= */

function openPlayerMenu() {

    playerMenu.classList.add(
        "open"
    );

}


/* =========================================================
   MENU — FERMER
========================================================= */

function closePlayerMenu() {

    playerMenu.classList.remove(
        "open"
    );

}


/* =========================================================
   BOUTON MENU
========================================================= */

menuButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        openPlayerMenu();

    }
);


/* =========================================================
   BOUTON FERMER MENU
========================================================= */

closeMenu.addEventListener(
    "click",
    function() {

        closePlayerMenu();

    }
);


/* =========================================================
   CLIC EN DEHORS DU PANNEAU
========================================================= */

playerMenu.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            playerMenu
        ) {

            closePlayerMenu();

        }

    }
);


/* =========================================================
   ONGLETS DU MENU
========================================================= */

menuTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        function() {

            const target =
                tab.dataset.tab;


            menuTabs.forEach(
                otherTab => {

                    otherTab.classList.remove(
                        "active"
                    );

                }
            );


            menuPages.forEach(
                page => {

                    page.classList.remove(
                        "active"
                    );

                }
            );


            tab.classList.add(
                "active"
            );


            const selectedPage =
                document.getElementById(
                    `tab-${target}`
                );


            if (selectedPage) {

                selectedPage.classList.add(
                    "active"
                );

            }

        }
    );

});


/* =========================================================
   NPC DEVANT CERTAINS LIEUX
========================================================= */

function updateCoveredLocations() {

    const sanctuary =
        document.getElementById(
            "sanctuary"
        );

    const camp =
        document.getElementById(
            "abandoned-camp"
        );


    if (sanctuary) {

        sanctuary.classList.add(
            "npc-covered"
        );

    }


    if (camp) {

        camp.classList.add(
            "npc-covered"
        );

    }

}


/* =========================================================
   INITIALISATION
========================================================= */

function initializeQuest() {

    adamX = 50;
    adamY = 55;

    updateAdamPosition();

    positionNPCs();

    updateQuestUI();

    updateInteraction();

}


/* =========================================================
   ENTRER DANS LE JEU
========================================================= */

enterButton.addEventListener(
    "click",
    function() {

        enterScreen.style.display =
            "none";

        gameScreen.style.display =
            "block";


        initializeQuest();

    }
);


/* =========================================================
   REDIMENSIONNEMENT
========================================================= */

window.addEventListener(
    "resize",
    function() {

        positionNPCs();

        updateAdamPosition();

        updateInteraction();

    }
);


/* =========================================================
   INITIALISATION AUTOMATIQUE
========================================================= */

gameScreen.style.display =
    "none";