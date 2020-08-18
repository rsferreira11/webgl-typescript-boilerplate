import testImage from '../images/test_image.jpg';

export function imageImportTest() {
  const image = new Image();

  image.src = testImage;
  image.onload = () => {
    image.style.position = "absolute";
    image.style.top = "0";
    document.body.appendChild(image);
    console.log("image added");
  };
}
