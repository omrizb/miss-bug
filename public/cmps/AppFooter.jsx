import { showSuccessMsg } from '../services/event-bus.service.js'
const { useEffect } = React

export function AppFooter() {

    useEffect(() => {
        // component did mount when dependency array is empty
    }, [])

    return (
        <footer className="main-footer main-layout full">
            <p>
                coffeerights to all
            </p>
        </footer>
    )

}