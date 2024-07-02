const { useState } = React

import { userService } from '../services/user.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { LoginForm } from './LoginForm.jsx'

export function LoginSignup({ onSetUser }) {
    const [isSignup, setIsSignUp] = useState(false)

    function onLogin(credentials) {
        isSignup ? signup(credentials) : login(credentials)
    }

    function login(credentials) {
        userService.login(credentials)
            .then(user => onSetUser(user))
            .then(() => showSuccessMsg('Logged in successfully'))
            .catch(err => {
                console.log('err', err)
                showErrorMsg('Oops try again')
            })
    }

    function signup(credentials) {
        userService.signup(credentials)
            .then(onSetUser)
            .then(() => showSuccessMsg('Signed in successfully'))
            .catch(err => {
                console.log('err', err)
                showErrorMsg('Oops try again')
            })
    }

    return (
        <section className="login">
            <LoginForm onLogin={onLogin} isSignup={isSignup} />
            <div className="btns">
                <a onClick={() => setIsSignUp(prev => !prev)}>
                    {isSignup ? 'Already a member? Login' : 'New user? Signup here'}
                </a>
            </div>
        </section>
    )
}
