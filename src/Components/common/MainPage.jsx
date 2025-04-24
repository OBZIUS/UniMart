import React from "react";
import ShoppingCart from "../../assets/images/Cart.png";
import Arrow from "../../assets/images/Arrow.png"
export const MainPage = () => {
    return (<>
        <div className="MainPage">
            <div class="frame">
                <p class="text-wrapper">Your go-to marketplace for grabbing the cheapest deals-right inside your uni!</p>
                <button class="button">
                    <button class="label-wrapper"><div class="label">Sign up!</div></button>
                </button>
                <button class="div-wrapper"><div class="div">Buy Now</div></button>
                <p class="save-big-shop-smart">
                    Save big &amp; shop smart! Get everyday essentials inside your uni at unbeatable prices—cheaper than the market
                    and just a doorstep away!
                </p>
            </div>
            <img className="ShoppingCart" src={ShoppingCart} />
        </div>
        <div class="heading-subheading">
      <div class="heading">
        <div class="WhatWeOffer"><div class="text-wrapper">What we offer!</div></div>
      </div>
      <img className="Arrow" src={Arrow}  />
      <p class="Tagline">Everything you need—sold by students, for students. At your Uni.</p>
    </div>
    </>

    )
}