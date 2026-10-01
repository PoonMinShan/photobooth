javascript
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

const cameraWrapper = document.querySelector(".camera-wrapper");

let currentStream = null;
let currentFilter = "normal";
let usingFrontCamera = true;
let capturedImage = null;


/* =========================
   FILTER SETTINGS
========================= */

const filters = {

    normal: {
        css:
            "none",

        canvas:
            "none"
    },


    retro: {
        css:
            "grayscale(1) contrast(1.18) brightness(1.06)",

        canvas:
            "grayscale(1) contrast(1.18) brightness(1.06)"
    },


    y2k: {
        css:
            "saturate(1.35) contrast(1.03) brightness(1.08) sepia(0.08)",

        canvas:
            "saturate(1.35) contrast(1.03) brightness(1.08) sepia(0.08)"
    },


    film: {
        css:
            "contrast(0.96) saturate(0.86) brightness(1.05) sepia(0.08)",

        canvas:
            "contrast(0.96) saturate(0.86) brightness(1.05) sepia(0.08)"
    },


    glow: {
        css:
            "brightness(1.10) contrast(0.88) saturate(1.08)",

        canvas:
            "brightness(1.10) contrast(0.88) saturate(1.08)"
    }

};


/* =========================
   CAMERA SETUP
========================= */

async function startCamera() {

    try {

        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(track => track.stop());

        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Your browser does not support camera access. Please use Chrome, Safari or Edge."
            );

            return;

        }


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


        currentStream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );


        video.srcObject = currentStream;

        video.muted = true;
        video.playsInline = true;


        await video.play();


        /*
           MIRROR FRONT CAMERA
        */

        if (usingFrontCamera) {

            video.classList.add("mirrored");

        }

        else {

            video.classList.remove("mirrored");

        }


        /*
           Reapply current filter
        */

        updateCameraFilter();

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
                "Camera permission was denied. Please allow camera access in your browser settings and refresh the page."
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

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter;


            updateCameraFilter();

        }
    );

});


/* =========================
   LIVE CAMERA FILTER
========================= */

function updateCameraFilter() {

    const selected =
        filters[currentFilter];


    if (!selected) {

        video.style.filter = "none";

        return;

    }


    video.style.filter =
        selected.css;


    /*
       Remove previous overlay classes
    */

    cameraWrapper.classList.remove(
        "filter-retro",
        "filter-y2k",
        "filter-film",
        "filter-glow"
    );


    /*
       Add current overlay
    */

    if (
        currentFilter !==
        "normal"
    ) {

        cameraWrapper.classList.add(
            `filter-$,{currentFilter}`
        );

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

    /*
       Prevent multiple countdowns
    */

    takePhotoButton.disabled = true;


    let number = 3;


    countdown.classList.remove(
        "hidden"
    );


    countdown.textContent =
        number;


    const timer =
        setInterval(() => {

            number--;


            if (number > 0) {

                countdown.textContent =
                    number;

            }


            else {

                clearInterval(timer);


                countdown.textContent =
                    "♥";


                setTimeout(() => {

                    countdown.classList.add(
                        "hidden"
                    );


                    capturePhoto();


                    takePhotoButton.disabled =
                        false;

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

        takePhotoButton.disabled =
            false;

        return;

    }


    const width =
        video.videoWidth;

    const height =
        video.videoHeight;


    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
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
       APPLY FILTER
    ========================= */

    const selected =
        filters[currentFilter];


    context.filter =
        selected
            ? selected.canvas
            : "none";


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


    /*
       Reset canvas filter
    */

    context.filter =
        "none";


    /* =========================
       ADD EFFECTS
    ========================= */

    addPhotoEffects(
        context,
        width,
        height
    );


    /* =========================
       CREATE JPEG
    ========================= */

    capturedImage =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    photoResult.src =
        capturedImage;


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
   PHOTO EFFECTS
========================= */

function addPhotoEffects(
    context,
    width,
    height
) {


    /* =========================
       VIGNETTE
    ========================= */

    if (
        currentFilter ===
        "retro" ||
        currentFilter ===
        "film"
    ) {

        const gradient =
            context.createRadialGradient(
                width / 2,
                height / 2,
                width * 0.25,
                width / 2,
                height / 2,
                width * 0.75
            );


        gradient.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );


        gradient.addColorStop(
            0.7,
            "rgba(0,0,0,0.03)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0.28)"
        );


        context.fillStyle =
            gradient;


        context.fillRect(
            0,
            0,
            width,
            height
        );

    }


    /* =========================
       GLOW
    ========================= */

    if (
        currentFilter ===
        "glow"
    ) {

        /*
           Create a soft bright overlay
        */

        const glow =
            context.createRadialGradient(
                width / 2,
                height / 2,
                width * 0.1,
                width / 2,
                height / 2,
                width * 0.7
            );


        glow.addColorStop(
            0,
            "rgba(255,245,235,0.14)"
        );


        glow.addColorStop(
            0.65,
            "rgba(255,235,220,0.05)"
        );


        glow.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );


        context.fillStyle =
            glow;


        context.fillRect(
            0,
            0,
            width,
            height
        );

    }


    /* =========================
       FILM GRAIN
    ========================= */

    if (
        currentFilter ===
        "retro" ||
        currentFilter ===
        "y2k" ||
        currentFilter ===
        "film"
    ) {

        addFilmGrain(
            context,
            width,
            height
        );

    }

}


/* =========================
   FILM GRAIN
========================= */

function addFilmGrain(
    context,
    width,
    height
) {

    /*
       Grain density
    */

    const amount =
        currentFilter === "retro"
            ? 0.10
            : currentFilter === "film"
                ? 0.075
                : 0.045;


    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );


    const pixels =
        imageData.data;


    /*
       Process every few pixels
       rather than creating extremely
       heavy grain.
    */

    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        if (
            Math.random() >
            amount
        ) {

            continue;

        }


        const noise =
            (Math.random() - 0.5)
            * 45;


        pixels[i] =
            clamp(
                pixels[i] + noise
            );


        pixels[i + 1] =
            clamp(
                pixels[i + 1] + noise
            );


        pixels[i + 2] =
            clamp(
                pixels[i + 2] + noise
            );

    }


    context.putImageData(
        imageData,
        0,
        0
    );

}


/* =========================
   CLAMP
========================= */

function clamp(value) {

    return Math.max(
        0,
        Math.min(
            255,
            value
        )
    );

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


        photoResult.src =
            "";


        capturedImage =
            null;


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

        if (!capturedImage) {

            return;

        }


        const link =
            document.createElement(
                "a"
            );


        link.download =
            `;photobooth-$,{currentFilter}.jpg`;


        link.href =
            capturedImage;


        link.click();

    }
);
