import Routes from "./Routes"
import { UserContextProvider } from "./UserContext"

function App() {
    return (
        <div>
            <UserContextProvider>
                <Routes />
            </UserContextProvider>
        </div>
    )
}

export default App
