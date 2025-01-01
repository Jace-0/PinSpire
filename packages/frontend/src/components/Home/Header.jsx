import { Link } from 'react-router-dom'
const Header = () => {
  return (
    <header class="home-header">
      <img alt="Pinterest logo" height="40" src="https://storage.googleapis.com/a1aa/image/oTArvftIj81AKag8b0znEMwFfxn8v6YOwBvGcBLowRbYTMAUA.jpg" width="40"/>
      <nav>
        <Link to="/explore">Explore</Link>
        <Link to="/about">About</Link>
        <Link to="/business">Business</Link>
        <Link to="/blog">Blog</Link>
      </nav>
      <div className="auth-buttons">
        <Link to="/login" className="login">Log in</Link>
        <Link to="/signup" className="signup">Sign up</Link>
      </div>
    </header>
  )
}

export default Header