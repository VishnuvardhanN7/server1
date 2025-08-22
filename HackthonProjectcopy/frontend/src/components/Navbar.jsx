import '../App.css';

export default function Navbar() {
    return (
        <div className="navbar">
            <div className="nav-left">AMMA.in</div>
            <div className="nav-right">
                <button className="login-btn">Login</button>
                <button className="signup-btn">Signup</button>
            </div>
        </div>
    );
}
