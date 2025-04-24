import React from "react";
import Logo from "../../assets/images/logo.png";
import User from "../../assets/images/user.png";

export const NavigationBar = () => {
    return (
        <div className="navigation-bar">
            <img className="logo" alt="Newlogo" src={Logo} />
            <img className="user" alt="Newuser" src={User} />
        </div>
    );
};