const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const countdown = document.getElementById("countdown");

const takePhotoButton = document.getElementById("takePhoto");
const switchCameraButton = document.getElementById("switchCamera");

const resultSection = document.getElementById("resultSection");
const photoResult = document.getElementById("photoResult");

const retakeButton = document.getElementById("retake");
const downloadButton = document.getElementById("download");

const filterButtons = document.querySelectorAll(".filter-button");

let currentStream = null;
let currentFilter = "normal";
let usingFrontCamera = true;


/* =========================
   CAMERA
========================= */

async function startCamera() {

    try {

        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            alert(
                "Your browser does not support camera access."
            );
            return;
        }

        const constraints = {
            video: {
                facingMode: usingFrontCamera
                    ? "user"
                    : "environment",

                width: {
                    ideal: 1920
                },

                height: {
                    ideal: 1080
                }
            },

            audio: false
        };

        currentStream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );

        video.srcObject = currentStream;

        video.muted = true;
        video.playsInline = true;

        await video.play();

        updateCameraFilter();

    }

    catch (error) {

        console.error("Camera error:", error);

        if (error.name === "NotAllowedError") {

            alert(
                "Camera permission was denied. Please allow camera access and refresh the page."
            );

        }

        else if (error.name === "NotFoundError") {

            alert(
                "No camera was found on this device."
            );

        }

        else {

            alert(
                "We could not access your camera. Please check your browser permissions."
            );

        }

    }

}


/* =========================
   START
========================= */

startCamera();


/* =========================
   SWITCH CAMERA
========================= */

switchCameraButton.addEventListener(
    "click",
    async () => {

        usingFrontCamera = !usingFrontCamera;

        await startCamera();

    }
);


/* =========================
   FILTER BUTTONS
========================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.dataset.filter;

            updateCameraFilter();

        }
    );

});


/* =========================
   PREVIEW FILTER
========================= */

function updateCameraFilter() {

    switch (currentFilter) {

        case "retro":

            video.style.filter =
                "grayscale(1) contrast(1.35) brightness(1.05)";

            break;


        case "y2k":

            video.style.filter =
                "saturate(1.5) contrast(1.05) brightness(1.08)";

            break;


        case "film":

            video.style.filter =
                "contrast(1.12) saturate(0.82) brightness(1.03)";

            break;


        case "glow":

            video.style.filter =
                "brightness(1.12) contrast(0.9) saturate(1.08)";

            break;


        default:

            video.style.filter = "none";

    }

}


/* =========================
   GET CANVAS FILTER
========================= */

function getCanvasFilter() {

    switch (currentFilter) {

        case "retro":

            return "grayscale(1) contrast(1.35) brightness(1.05)";


        case "y2k":

            return "saturate(1.5) contrast(1.05) brightness(1.08)";


        case "film":

            return "contrast(1.12) saturate(0.82) brightness(1.03)";


        case "glow":

            return "brightness(1.12) contrast(0.9) saturate(1.08)";


        default:

            return "none";

    }

}


/* =========================
   TAKE PHOTO
========================= */

takePhotoButton.addEventListener(
    "click",
    startCountdown
);


function startCountdown() {

    let number = 3;

    countdown.classList.remove("hidden");

    countdown.textContent = number;


    const timer = setInterval(() => {

        number--;

        if (number > 0) {

            countdown.textContent = number;

        }

        else {

            clearInterval(timer);

            countdown.textContent = "♥";

            setTimeout(() => {

                countdown.classList.add("hidden");

                capturePhoto();

            }, 300);

        }

    }, 1000);

}


/* =========================
   CAPTURE PHOTO
========================= */

function capturePhoto() {

    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        alert(
            "The camera is not ready yet. Please wait a moment and try again."
        );

        return;

    }


    const width =
        video.videoWidth;

    const height =
        video.videoHeight;


    canvas.width = width;
    canvas.height = height;


    const context =
        canvas.getContext("2d");


    /*
       IMPORTANT:

       We apply the filter directly
       to the canvas BEFORE drawing
       the video.
    */

    context.filter =
        getCanvasFilter();


    context.save();


    /* =========================
       MIRROR FRONT CAMERA
    ========================= */

    if (usingFrontCamera) {

        context.translate(width, 0);

        context.scale(-1, 1);

    }


    /* =========================
       DRAW FILTERED PHOTO
    ========================= */

    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    context.restore();


    /*
       Reset canvas filter
       after capturing.
    */

    context.filter = "none";


    /* =========================
       CREATE IMAGE
    ========================= */

    const image =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    photoResult.src = image;


    /* =========================
       SHOW RESULT
    ========================= */

    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================
   RETAKE
========================= */

retakeButton.addEventListener(
    "click",
    () => {

        resultSection.classList.add(
            "hidden"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================
   DOWNLOAD
========================= */

downloadButton.addEventListener(
    "click",
    () => {

        const link =
            document.createElement("a");

        link.download =
            "my-photobooth-photo.jpg";

        link.href =
            photoResult.src;

        link.click();

    }
);