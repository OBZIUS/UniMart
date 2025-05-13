import React from "react";
import { useNavigate } from "react-router-dom";
import ShoppingCart from "../../assets/images/Cart.png";
import Arrow from "../../assets/images/Arrow.png";
export const MainPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="MainPage">
        <div className="frame">
          <p className="text-wrapper">
            Your go-to marketplace for grabbing the cheapest deals-right inside
            your uni!
          </p>
          <button className="button" onClick={() => navigate("/SignUp")}>
            <div className="label-wrapper">
              <div className="label">Sign up!</div>
            </div>
          </button>

          <button className="div-wrapper">
            <div className="div">Buy Now</div>
          </button>
          <p className="save-big-shop-smart">
            Save big &amp; shop smart! Get everyday essentials inside your uni
            at unbeatable prices—cheaper than the market and just a doorstep
            away!
          </p>
        </div>
        <img className="ShoppingCart" src={ShoppingCart} />
      </div>
      <div className="BottomSection">
      <div className="heading-subheading">
        <div className="heading">
          <div className="WhatWeOffer">
            <div className="text-wrapper">What we offer!</div>
          </div>
        </div>
        <img className="Arrow" src={Arrow} />
        <p className="Tagline">
          Everything you need—sold by students, for students. At your Uni.
        </p>
      </div>
      </div>
      
    </>
  );
};
