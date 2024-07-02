const { useState } = React
const { NavLink, useNavigate } = ReactRouterDOM

import { userService } from '../services/user.service.js'

import { LoginSignup } from './LoginSignup.jsx'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader() {

    const navigate = useNavigate()
    const [user, setUser] = useState()

    function onSetUser(user) {
        setUser(user)
    }

    function onSignOut() {
        setUser(null)
        navigate('/')
    }

    return (
        <header className="main-header">
            <nav className="app-nav">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/bug">Bugs</NavLink>
                {user && <NavLink to="/user">Profile</NavLink>}
                {user && user.isAdmin && <NavLink to="/admin">Admin</NavLink>}
                <NavLink to="/about">About</NavLink>
            </nav>
            {user
                ? <React.Fragment>
                    <h2>Welcome {user.fullname}</h2>
                    <button className="btn" onClick={onSignOut}>Sign out</button>
                </React.Fragment>
                : <LoginSignup onSetUser={onSetUser} />}
            <h1>Bugs are Forever</h1>
            <UserMsg />
        </header>
    )
}
