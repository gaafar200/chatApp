import { useContext, useEffect, useRef, useState } from "react";
import Contact from "./Contact";
import Logo from './Logo';
import { UserContext } from "./UserContext"
import {uniqBy} from "lodash"; 
export default function Chat(){
    const [ws,setws] = useState(null);
    const [selectedUserId,setSelectedUserId] = useState(null);
    const [onlineUsers,setOnlineUsers] = useState({});
    const [newMessage,setNewMessage] = useState("");
    const [chatMessages,setChatMessages] = useState([]);
    const [offlineUsers,setOfflineUsers] = useState({});
    const {userId:id,username,setUserId,setUsername} = useContext(UserContext);
    const divUnderMessages = useRef();
    function connectToWs(){
        const ws = new WebSocket('ws://localhost:4040');
        setws(ws);
        ws.addEventListener("message",handleIncomingMessage);
        ws.addEventListener("close",()=>{
            console.log("Disconnected!. trying to reconnect");
            setTimeout(()=>{
                connectToWs();
            },1000);
        })
    }
    useEffect(()=>{
        connectToWs();
    },[]);

    useEffect(()=>{
        fetch("http://localhost:4040/users").then(response =>{
            response.json().then(data => {
                const offlineUsersArr = data.filter(user => user._id !== id)
                .filter(p => !Object.keys(onlineUsers).includes(p._id));
                const offlineUsersobj = {};
                offlineUsersArr.forEach(u =>{
                    offlineUsersobj[u._id] = u;
                });
                setOfflineUsers(offlineUsersobj);
            })
        })
    },[onlineUsers])

    useEffect(()=>{
        if(selectedUserId){
            fetch(`http://localhost:4040/messages/${selectedUserId}`,{
                credentials: 'include'
            }).then(response => {
                response.json().then(data=>{
                    console.log(data)
                    setChatMessages(data);
                })
            })
        }
    },[selectedUserId])

    const showOnlineUsers = (onLineUsers)=>{
        const users = {};
        onLineUsers.forEach(({userId,username}) =>{
            users[userId] = username;
        });
        setOnlineUsers(users);
    }
    const handleIncomingMessage = (ev)=>{
        const messageData = JSON.parse(ev.data);
        console.log({ev,messageData});
        if('online' in messageData){
            showOnlineUsers(messageData.online);
        }
        else if('text' in messageData){
            console.log("Sender: " + messageData.sender);
            console.log("Reciver-side: " + selectedUserId);
            setChatMessages(prev =>{
                return [...prev,{...messageData}]
            });
        }
    }
    const onlineUsersWithoutMe = {...onlineUsers};
    delete onlineUsersWithoutMe[id];

    const logout = ()=>{
        fetch("http://localhost:4040/logout").then(response =>{
            if(response){
                setws(null);
                setUserId(null);
                setUsername(null);
            }
        })
    }

    const sendMessage = (ev,file = null)=>{ 
        if (ev) ev.preventDefault();
        ws.send(JSON.stringify({
            message:{
                recipient: selectedUserId,
                text: newMessage,
                file
            }
        }));
        setChatMessages(prev =>{
            return [...prev,{
                text:  newMessage,
                sender: id,
                recipient: selectedUserId,
                _id: Date.now()
            }]
        });
        setNewMessage('');
        if(file){
            console.log("Ya");
            fetch(`http://localhost:4040/messages/${selectedUserId}`,{
                credentials: 'include'
            }).then(response => {
                response.json().then(data=>{
                    setChatMessages(data);
                })
            });
        }
    }

    useEffect(()=>{
        const div = divUnderMessages.current;
        if(div){
            div.scrollIntoView({behaviour: 'smooth'});
        }
    },[chatMessages])

    const messagesWithoutDupes = uniqBy(chatMessages,'_id');

    const handleFileUpload = (ev)=>{
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () =>{
            sendMessage(null,{
                name:ev.target.files[0].name,
                data: reader.result
            })
        }
    }

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo />
                    {Object.keys(onlineUsersWithoutMe).map(userId =>(
                        <Contact id={userId}
                        key={userId}
                        username={onlineUsersWithoutMe[userId]}
                        onClick={()=>setSelectedUserId(userId)}
                        selected={userId === selectedUserId}
                        onLine={true}/>
                    ))}
                
                    {Object.keys(offlineUsers).map(userId =>(
                        <Contact id={userId}
                        key={userId}
                        username={offlineUsers[userId].username}
                        onClick={()=>setSelectedUserId(userId)}
                        selected={userId === selectedUserId}
                        onLine={false}/>
                    ))}
                </div>    
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text-sm text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                        {username}
                    </span>
                    <button className="text-sm bg-blue-200 py-1 px-2 border rounded-sm text-gray-500" onClick={logout}>Logout</button>
                </div>
                
            </div>
            <div className="bg-blue-50 w-2/3 p-2 flex flex-col">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-gray-300">&larr; Select a chat to start chating</div>
                        </div>

                    )}
                    {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messagesWithoutDupes.map(chat=>(
                                    <div key={chat.id} className={(chat.sender == id ? 'text-right' : 'text-left')}>
                                        <div className={"inline-block p-2 my-2 rounded-md text-sm " + (chat.sender === id ? 'bg-blue-500 text-white': 'bg-white text-gray-500')}>
                                            {chat.text}
                                            {chat.file &&(
                                                <div>
                                                    <a className="flex items-center gap-1" href={"http://localhost:4040/uploads/" + chat.file}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                                                        {chat.file}
                                                        </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>    
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>    
                    )}
                </div>
                {!!selectedUserId && (
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <input value={newMessage} onChange={(ev)=> setNewMessage(ev.target.value)} type="text" placeholder="Enter your message" 
                        className="bg-white border p-2 flex-grow rounded-sm"/>
                        <label className="bg-blue-200 p-2 text-gray-600 border border-blue-200 rounded-sm cursor-pointer">
                            <input type="file" className="hidden" onChange={handleFileUpload}/>  
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}