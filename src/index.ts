import './main.css';
import testImage from './images/test_image.jpg';

const image = new Image();

image.src = testImage;
image.onload = () => {
  document.body.appendChild(image);
  console.log("image added");
};
