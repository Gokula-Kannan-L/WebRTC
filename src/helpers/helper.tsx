
export const getMediaStream = async(options: MediaStreamConstraints) => {
    const stream = await navigator.mediaDevices.getUserMedia({video: {
        width: { max: 640 },
        height: { max: 480 },
        frameRate: { max: 15 }
    },audio: options.audio});
    return stream;
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