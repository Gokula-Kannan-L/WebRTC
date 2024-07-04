
export const getMediaStream = async(options: MediaStreamConstraints) => {
    return await navigator.mediaDevices.getUserMedia(options);
}  

export const getRandomColor = () => {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
}