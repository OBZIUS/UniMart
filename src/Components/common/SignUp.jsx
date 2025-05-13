import React from "react";
export const SignUp = () =>{
    return(
       
  <div className="container">
    <div className="form-card">
      <div className="form-wrapper">
        <div className="form-toggle">
          <span>Sign up!</span>
          <div className="toggle-dot"></div>
          <div className="toggle-fill"></div>
          <div className="toggle-dot"></div>
          <span>Login!</span>
        </div>

        <div className="form-fields">
          <label>Name</label>
          <div className="input-box">Name</div>

          <label>Contact</label>
          <div className="input-box">+91</div>

          <label>Email*</label>
          <div className="input-box">Email</div>

          <label>Room Number</label>
          <div className="input-box">Room No.</div>

          <label>Year</label>
          <div className="input-box">Year</div>
        </div>

        <div className="submit-button">Lemme buy now!!</div>
      </div>
    </div>

    <div className="right-decoration"></div>
    <div className="black-box"></div>
    <div className="small-rotate"></div>
    <div className="large-rotate"></div>
  </div>

    )
}