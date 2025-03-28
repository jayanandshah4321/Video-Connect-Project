import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Video Connect</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => router("/aljk23")} className="nav-link">
                        Join as Guest
                    </p>
                    <p onClick={() => router("/auth")} className="nav-link">
                        Register
                    </p>
                    <div onClick={() => router("/auth")} role='button' className="login-btn">
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="hero-content">
                    <h1>
                        <span className="highlight">Connect</span> with your loved ones anywhere
                    </h1>
                    <p>Professional video meetings for everyone, anytime, anywhere</p>
                    <div className="cta-buttons">
                        <div role='button' className="primary-btn">
                            <Link to={"/auth"}>Get Started</Link>
                        </div>
                        <div role='button' className="secondary-btn">
                            <Link to={"/aljk23"}>Join Meeting</Link>
                        </div>
                    </div>
                    <div className="features">
                        <div className="feature">
                            <div className="feature-icon">🔒</div>
                            <span>Secure Calls</span>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">👥</div>
                            <span>Group Meetings</span>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">🌍</div>
                            <span>Connect Globally</span>
                        </div>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/mobile.png" alt="Video conference illustration" />
                </div>
            </div>
        </div>
    )
}