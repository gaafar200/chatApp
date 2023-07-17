import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [userId,setUserId] = useState(null);
    const [username,setUsername] = useState(null);
    useEffect(()=>{
        const url = "http://localhost:4040/profile";
        fetch(url,{credentials : 'include'}).then(response =>{
            if(response.ok){
                response.json().then(data=>{
                    setUserId(data.userId);
                    setUsername(data.username);
                })
            }
        })
    },[])
    return (
        <UserContext.Provider value={{userId,setUserId,username,setUsername}} >
            {children}
        </UserContext.Provider>
    )    
} 