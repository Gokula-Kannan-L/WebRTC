export const getMediaStream = async() => {
    
    try {
       const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 400, ideal: 1080 },
                frameRate: { max: 30 }
            },
            audio: { echoCancellation: true }
        });

        return stream;

    } catch (error) {
        console.error("Error checking media capabilities or getting media stream", error);
        throw error;
    }
}  

export const getDisplayMedia = async(options: DisplayMediaStreamOptions) => {
    return await navigator.mediaDevices.getDisplayMedia(options);
}

export const getRandomColor = () => {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
}

function pad(number: Number) {
    return number.toString().padStart(2, '0');
}

const updateTimer = (startTime: number) => {
    const elapsedTime = Date.now() - startTime;

    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const startTimer = (date: Date) => {
    const startTime = date.getMilliseconds();
    const timeInterval = setInterval(() => updateTimer(startTime), 1000);

    return timeInterval;
}