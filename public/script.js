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
   CAMERA SETUP
========================= */

async function startCamera() {

    try {

        // Stop previous camera stream
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        // Check browser camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

            alert(
                "Your browser does not support camera access. Please use a modern browser such as Chrome, Safari or Edge."
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

        console.log("Requesting camera...");

        currentStream =
            await navigator.mediaDevices.getUserMedia(constraints);

        console.log("Camera permission granted!");

        // Attach camera stream to video
        video.srcObject = currentStream;

        // Make sure the video plays
        video.muted = true;
        video.playsInline = true;

        await video.play();

        console.log("Camera is now playing!");

    }

    catch (error) {

        console.error("Camera error:", error);

        if (error.name === "NotAllowedError") {

            alert(
                "Camera permission was denied. Please allow camera access in your browser settings and refresh the page."
            );

        }

        else if (error.name === "NotFoundError") {

            alert(
                "No camera was found on this device."
            );

        }

        else {

            alert(
                "We could not access your camera. Please check your browser camera permissions and try again."
            );

        }

    }

}


/* =========================
   START CAMERA
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

            // Remove active state
            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            // Add active state
            button.classList.add("active");

            // Get selected filter
            currentFilter = button.dataset.filter;

            // Apply filter
            updateCameraFilter();

        }
    );

});


/* =========================
   CAMERA PREVIEW FILTER
========================= */

function updateCameraFilter() {

    switch (currentFilter) {

        case "retro":

            video.style.filter =
                "grayscale(1) contrast(1.25) brightness(1.05)";

            break;


        case "y2k":

            video.style.filter =
                "saturate(1.35) contrast(1.05) brightness(1.08)";

            break;


        case "film":

            video.style.filter =
                "contrast(1.08) saturate(0.9) brightness(1.04)";

            break;


        case "glow":

            video.style.filter =
                "brightness(1.12) contrast(0.92) saturate(1.05)";

            break;


        default:

            video.style.filter = "none";

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

    // Make sure camera has loaded
    if (!video.videoWidth || !video.videoHeight) {

        alert(
            "The camera is not ready yet. Please wait a moment and try again."
        );

        return;

    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.save();


    /* =========================
       MIRROR FRONT CAMERA
    ========================= */

    if (usingFrontCamera) {

        context.translate(width, 0);
        context.scale(-1, 1);

    }


    /* =========================
       APPLY FILTER TO PHOTO
    ========================= */

    switch (currentFilter) {

        case "retro":

            context.filter =
                "grayscale(1) contrast(1.25) brightness(1.05)";

            break;


        case "y2k":

            context.filter =
                "saturate(1.35) contrast(1.05) brightness(1.08)";

            break;


        case "film":

            context.filter =
                "contrast(1.08) saturate(0.9) brightness(1.04)";

            break;


        case "glow":

            context.filter =
                "brightness(1.12) contrast(0.92) saturate(1.05)";

            break;


        default:

            context.filter = "none";

    }


    /* =========================
       DRAW PHOTO
    ========================= */

    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );

    context.restore();


    /* =========================
       CREATE IMAGE
    ========================= */

    const image = canvas.toDataURL(
        "image/jpeg",
        0.95
    );


    photoResult.src = image;


    /* =========================
       SHOW RESULT
    ========================= */

    resultSection.classList.remove("hidden");

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

        resultSection.classList.add("hidden");

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

        const link = document.createElement("a");

        link.download =
            "my-photobooth-photo.jpg";

        link.href =
            photoResult.src;

        link.click();

    }
);