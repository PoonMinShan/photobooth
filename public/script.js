/* =========================
   ELEMENTS
========================= */

const video =
    document.getElementById("camera");

const canvas =
    document.getElementById("canvas");

const countdown =
    document.getElementById("countdown");

const takePhotoButton =
    document.getElementById("takePhoto");

const switchCameraButton =
    document.getElementById("switchCamera");

const resultSection =
    document.getElementById("resultSection");

const photoResult =
    document.getElementById("photoResult");

const retakeButton =
    document.getElementById("retake");

const downloadButton =
    document.getElementById("download");

const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );


/* =========================
   VARIABLES
========================= */

let currentStream = null;

let currentFilter = "normal";

let usingFrontCamera = true;


/* =========================
   CAMERA
========================= */

async function startCamera() {

    try {

        /* STOP PREVIOUS CAMERA */

        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(track => {
                    track.stop();
                });

        }


        /* CHECK CAMERA SUPPORT */

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Your browser does not support camera access. Please use Chrome, Safari or Edge."
            );

            return;

        }


        /* CAMERA SETTINGS */

        const constraints = {

            video: {

                facingMode:
                    usingFrontCamera
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


        /* REQUEST CAMERA */

        currentStream =
            await navigator
                .mediaDevices
                .getUserMedia(
                    constraints
                );


        /* CONNECT CAMERA */

        video.srcObject =
            currentStream;


        /* MOBILE SETTINGS */

        video.muted = true;

        video.playsInline = true;


        /* PLAY VIDEO */

        await video.play();


        /* UPDATE MIRROR */

        updateMirror();


        console.log(
            "Camera started successfully."
        );

    }


    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        if (
            error.name ===
            "NotAllowedError"
        ) {

            alert(
                "Camera permission was denied. Please allow camera access and refresh the page."
            );

        }


        else if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "No camera was found on this device."
            );

        }


        else {

            alert(
                "We could not access your camera. Please check your camera permissions."
            );

        }

    }

}


/* =========================
   MIRROR FRONT CAMERA
========================= */

function updateMirror() {

    if (usingFrontCamera) {

        video.style.transform =
            "scaleX(-1)";

    }

    else {

        video.style.transform =
            "scaleX(1)";

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

        usingFrontCamera =
            !usingFrontCamera;

        await startCamera();

    }
);


/* =========================
   FILTER BUTTONS
========================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                /* REMOVE ACTIVE */

                filterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                /* ACTIVATE BUTTON */

                button.classList.add(
                    "active"
                );


                /* GET FILTER */

                currentFilter =
                    button.dataset.filter;


                /* APPLY FILTER */

                updateCameraFilter();

            }
        );

    }
);


/* =========================
   LIVE CAMERA FILTERS
========================= */

function updateCameraFilter() {

    switch (currentFilter) {


        /* NORMAL */

        case "normal":

            video.style.filter =
                "none";

            break;


        /* RETRO B&W */

        case "retro":

            video.style.filter =
                `
                grayscale(1)
                contrast(1.18)
                brightness(1.05)
                sepia(0.08)
                `;

            break;


        /* Y2K */

        case "y2k":

            video.style.filter =
                `
                saturate(1.35)
                contrast(1.05)
                brightness(1.08)
                sepia(0.08)
                `;

            break;


        /* FUJIFILM */

        case "film":

            video.style.filter =
                `
                saturate(0.88)
                contrast(1.08)
                brightness(1.04)
                sepia(0.04)
                `;

            break;


        /* GLOW */

        case "glow":

            video.style.filter =
                `
                brightness(1.12)
                contrast(0.92)
                saturate(1.08)
                `;

            break;


        default:

            video.style.filter =
                "none";

    }

}


/* =========================
   TAKE PHOTO
========================= */

takePhotoButton.addEventListener(
    "click",
    startCountdown
);


/* =========================
   COUNTDOWN
========================= */

function startCountdown() {

    let number = 3;


    countdown.classList.remove(
        "hidden"
    );


    countdown.textContent =
        number;


    const timer =
        setInterval(
            () => {

                number--;


                if (number > 0) {

                    countdown.textContent =
                        number;

                }


                else {

                    clearInterval(
                        timer
                    );


                    countdown.textContent =
                        "♥";


                    setTimeout(
                        () => {

                            countdown.classList.add(
                                "hidden"
                            );


                            capturePhoto();

                        },
                        300
                    );

                }

            },
            1000
        );

}


/* =========================
   PHOTO FILTER
========================= */

function getPhotoFilter() {

    switch (currentFilter) {


        case "retro":

            return `
                grayscale(1)
                contrast(1.18)
                brightness(1.05)
                sepia(0.08)
            `;


        case "y2k":

            return `
                saturate(1.35)
                contrast(1.05)
                brightness(1.08)
                sepia(0.08)
            `;


        case "film":

            return `
                saturate(0.88)
                contrast(1.08)
                brightness(1.04)
                sepia(0.04)
            `;


        case "glow":

            return `
                brightness(1.12)
                contrast(0.92)
                saturate(1.08)
            `;


        default:

            return "none";

    }

}


/* =========================
   CAPTURE PHOTO
========================= */

function capturePhoto() {


    /* CAMERA READY? */

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


    /* CANVAS SIZE */

    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d"
        );


    context.save();


    /* =========================
       MIRROR FRONT CAMERA
    ========================= */

    if (usingFrontCamera) {

        context.translate(
            width,
            0
        );

        context.scale(
            -1,
            1
        );

    }


    /* =========================
       PHOTO FILTER
    ========================= */

    context.filter =
        getPhotoFilter();


    /* =========================
       DRAW IMAGE
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
       CREATE JPEG
    ========================= */

    const image =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    /* =========================
       SHOW PHOTO
    ========================= */

    photoResult.src =
        image;


    resultSection.classList.remove(
        "hidden"
    );


    /* SCROLL TO RESULT */

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

        if (!photoResult.src) {

            return;

        }


        const link =
            document.createElement(
                "a"
            );


        link.download =
            "my-photobooth-photo.jpg";


        link.href =
            photoResult.src;


        link.click();

    }
);