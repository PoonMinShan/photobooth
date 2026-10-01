const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const countdown = document.getElementById("countdown");

const takePhotoButton = document.getElementById("takePhoto");
const switchCameraButton = document.getElementById("switchCamera");

const resultSection = document.getElementById("resultSection");
const photoResult = document.getElementById("photoResult");

const retakeButton = document.getElementById("retake");
const downloadButton = document.getElementById("download");

const filterButtons =
    document.querySelectorAll(".filter-button");


let currentStream = null;
let currentFilter = "normal";
let usingFrontCamera = true;


/* =====================================================
   CAMERA
===================================================== */

async function startCamera() {

    try {

        /* Stop old camera */

        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(track => track.stop());

        }


        /* Check camera support */

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Your browser does not support camera access."
            );

            return;

        }


        /* Camera settings */

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


        /* Request camera */

        currentStream =
            await navigator.mediaDevices
                .getUserMedia(constraints);


        /* Attach camera */

        video.srcObject =
            currentStream;


        video.muted = true;
        video.playsInline = true;


        await video.play();


        /* Apply preview */

        updateCameraPreview();

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
                "Camera permission was denied. Please allow camera access in Safari Settings."
            );

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "No camera was found."
            );

        }

        else {

            alert(
                "We could not access your camera."
            );

        }

    }

}


/* =====================================================
   START CAMERA
===================================================== */

startCamera();


/* =====================================================
   SWITCH CAMERA
===================================================== */

switchCameraButton.addEventListener(
    "click",
    async () => {

        usingFrontCamera =
            !usingFrontCamera;


        await startCamera();

    }
);


/* =====================================================
   UPDATE CAMERA PREVIEW
===================================================== */

function updateCameraPreview() {

    /*
       Mirror ONLY the front camera.
    */

    if (usingFrontCamera) {

        video.style.transform =
            "scaleX(-1)";

    }

    else {

        video.style.transform =
            "scaleX(1)";

    }


    /*
       Apply visual filter to preview.
    */

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

            video.style.filter =
                "none";

    }

}


/* =====================================================
   FILTER BUTTONS
===================================================== */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            /*
               Remove active
            */

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            /*
               Add active
            */

            button.classList.add(
                "active"
            );


            /*
               Save filter
            */

            currentFilter =
                button.dataset.filter;


            /*
               Update preview
            */

            updateCameraPreview();

        }
    );

});


/* =====================================================
   TAKE PHOTO
===================================================== */

takePhotoButton.addEventListener(
    "click",
    startCountdown
);


/* =====================================================
   COUNTDOWN
===================================================== */

function startCountdown() {

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

                }, 300);

            }

        }, 1000);

}


/* =====================================================
   CAPTURE PHOTO
===================================================== */

function capturePhoto() {

    /*
       Make sure camera is ready.
    */

    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        alert(
            "Camera is not ready yet. Please wait a moment."
        );

        return;

    }


    const width =
        video.videoWidth;

    const height =
        video.videoHeight;


    /*
       Set canvas size.
    */

    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext("2d");


    /*
       Clear canvas.
    */

    context.clearRect(
        0,
        0,
        width,
        height
    );


    /*
       Mirror front camera.
    */

    context.save();


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


    /*
       Draw camera image.
    */

    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    context.restore();


    /*
       Get image pixels.

       This is important because
       Safari can be inconsistent
       with canvas.filter.
    */

    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );


    /*
       Apply the selected filter
       directly to the pixels.
    */

    applyPixelFilter(
        imageData
    );


    /*
       Put filtered pixels
       back onto canvas.
    */

    context.putImageData(
        imageData,
        0,
        0
    );


    /*
       Create final JPEG.
    */

    const image =
        canvas.toDataURL(
            "image/jpeg",
            0.92
        );


    /*
       Display photo.
    */

    photoResult.src =
        image;


    /*
       Show result.
    */

    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   PIXEL FILTERS
===================================================== */

function applyPixelFilter(imageData) {

    const data =
        imageData.data;


    /*
       NORMAL
    */

    if (
        currentFilter ===
        "normal"
    ) {

        return;

    }


    /*
       Loop through pixels.

       Every pixel has:

       R
       G
       B
       A
    */

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        let r =
            data[i];

        let g =
            data[i + 1];

        let b =
            data[i + 2];


        /* =========================================
           RETRO BLACK & WHITE
        ========================================= */

        if (
            currentFilter ===
            "retro"
        ) {

            /*
               Convert to grayscale.
            */

            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;


            /*
               Increase contrast.
            */

            const contrast =
                1.35;


            r =
                ((gray - 128) *
                    contrast) + 128;

            g =
                ((gray - 128) *
                    contrast) + 128;

            b =
                ((gray - 128) *
                    contrast) + 128;


            /*
               Slight brightness.
            */

            r *= 1.05;
            g *= 1.05;
            b *= 1.05;

        }


        /* =========================================
           Y2K
        ========================================= */

        else if (
            currentFilter ===
            "y2k"
        ) {

            /*
               Increase saturation.
            */

            const avg =
                (r + g + b) / 3;


            const saturation =
                1.5;


            r =
                avg +
                (r - avg) *
                saturation;

            g =
                avg +
                (g - avg) *
                saturation;

            b =
                avg +
                (b - avg) *
                saturation;


            /*
               Slight brightness.
            */

            r *= 1.08;
            g *= 1.08;
            b *= 1.08;

        }


        /* =========================================
           FUJIFILM / FILM
        ========================================= */

        else if (
            currentFilter ===
            "film"
        ) {

            /*
               Slightly reduce saturation.
            */

            const avg =
                (r + g + b) / 3;


            const saturation =
                0.82;


            r =
                avg +
                (r - avg) *
                saturation;

            g =
                avg +
                (g - avg) *
                saturation;

            b =
                avg +
                (b - avg) *
                saturation;


            /*
               Slight contrast.
            */

            const contrast =
                1.12;


            r =
                ((r - 128) *
                    contrast) + 128;

            g =
                ((g - 128) *
                    contrast) + 128;

            b =
                ((b - 128) *
                    contrast) + 128;


            /*
               Slight brightness.
            */

            r *= 1.03;
            g *= 1.03;
            b *= 1.03;

        }


        /* =========================================
           GLOW
        ========================================= */

        else if (
            currentFilter ===
            "glow"
        ) {

            /*
               Lower contrast.
            */

            const contrast =
                0.90;


            r =
                ((r - 128) *
                    contrast) + 128;

            g =
                ((g - 128) *
                    contrast) + 128;

            b =
                ((b - 128) *
                    contrast) + 128;


            /*
               Increase brightness.
            */

            r *= 1.12;
            g *= 1.12;
            b *= 1.12;

        }


        /*
           Prevent values outside
           0 - 255.
        */

        data[i] =
            Math.max(
                0,
                Math.min(255, r)
            );

        data[i + 1] =
            Math.max(
                0,
                Math.min(255, g)
            );

        data[i + 2] =
            Math.max(
                0,
                Math.min(255, b)
            );

    }

}


/* =====================================================
   RETAKE
===================================================== */

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


/* =====================================================
   DOWNLOAD
===================================================== */

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