export function randomNum() {
    const rand = () => Math.floor(Math.random() * 10);
  
    return `${rand()}${rand()}${rand()}${rand()}`;
}