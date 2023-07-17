import { useContext, useState } from "react"
import { UserContext } from "./UserContext";

export default function Register(){
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [isLoginOrRegister,setIsLoginOrRegister] = useState('login');
    const {setUsername:setLoggedInUsername,setUserId} = useContext(UserContext);
    const register = async (e)=>{
        e.preventDefault();
        const payload = {username,password};
        const endUrl = isLoginOrRegister === 'login' ? 'login' : 'register';
        const url = `http://localhost:4040/${endUrl}`;
        const response = await fetch(url,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload),
            credentials : 'include'
        });
        if(response.ok){
            const data = await response.json();
            setLoggedInUsername(username);
            setUserId(data.id);
        }
    }
    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={register}>
                <input type="text"
                value={username} onChange={ev => setUsername(ev.target.value)} placeholder="username" className="block w-full rounded-sm p-2 mb-2 border" />
                <input type="password"
                value={password} onChange={ev => setPassword(ev.target.value)} placeholder="password" className="block w-full rounded-sm p-2 mb-2 border" />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                {isLoginOrRegister === 'register' ? "Register" : "Login"}    
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member? <button className="ml-1"  onClick={ev => setIsLoginOrRegister('login')}>Login here</button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Don't hava an account? <button className="ml-1" onClick={ev => setIsLoginOrRegister('register')}>Register here</button>
                        </div>
                    )}
                </div>
            </form>

        </div>
    )
}