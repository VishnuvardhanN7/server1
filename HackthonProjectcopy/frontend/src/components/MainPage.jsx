import { useState } from "react";
import "../App.css";
import Image1Click from "./Image1Click";
import Image2Click from "./Image2Click";
import Image3Click from "./Image3Click";
import Image4Click from "./Image4Click";
import Image5Click from "./Image5Click";
import Image6Click from "./Image6Click";
import Image7Click from "./Image7Click";
import Image8Click from "./Image8Click";
import Image9Click from "./Image9Click";
import bgImage from "./images/original.jpg";
import oneImage from "./images/i8.jpg";
import twoImage from "./images/i12.jpg";
import threeImage from "./images/i3.jpg";
import fourImage from "./images/i4.jpg";
import fiveImage from "./images/i6.jpg";
import sixImage from "./images/i5.jpg";
import sevenImage from "./images/i7.jpg";
import eightImage from "./images/i2.jpg";
import nineImage from "./images/i9.jpg";

function MainPage() {
  const [openPopup, setOpenPopup] = useState(null); // stores which image popup is open

  return (
    <div
      className="main-section"
      style={{
        backgroundImage: `url(${bgImage})`, // optional, keep image if needed
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        
      }}
    >
      {/* Main Section */}
      <img className="one" src={oneImage} alt="photo1" onClick={() => setOpenPopup(1)} />
      <img className="two" src={twoImage} alt="photo2" onClick={() => setOpenPopup(2)} />
      <img className="three" src={threeImage} alt="photo3" onClick={() => setOpenPopup(3)} />
      <img className="four" src={fourImage} alt="photo4" onClick={() => setOpenPopup(4)} />
      <img className="five" src={fiveImage} alt="photo5" onClick={() => setOpenPopup(5)} />
      <img className="six" src={sixImage} alt="photo6" onClick={() => setOpenPopup(6)} />
      <img className="seven" src={sevenImage} alt="photo7" onClick={() => setOpenPopup(7)} />
      <img className="eight" src={eightImage} alt="photo8" onClick={() => setOpenPopup(8)} />
      <img className="nine" src={nineImage} alt="photo9" onClick={() => setOpenPopup(9)} />

      {/* Render popups conditionally */}
      {openPopup === 1 && <Image1Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 2 && <Image2Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 3 && <Image3Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 4 && <Image4Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 5 && <Image5Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 6 && <Image6Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 7 && <Image7Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 8 && <Image8Click onClose={() => setOpenPopup(null)} />}
      {openPopup === 9 && <Image9Click onClose={() => setOpenPopup(null)} />}
    </div>
  );
}

export default MainPage;
