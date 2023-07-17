export default function Avatar({username,userId,isOnline}){
    const colors = ['bg-red-200','bg-green-200','bg-purple-200','bg-blue-200','bg-yellow-200','bg-teal-200'];
    const userIdBase10 = parseInt(userId,16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
        return (
        <div className={"w-10 h-10 relative rounded-full flex items-center " + color}>
            <div className="text-center w-full opacity-70">{username[0]}</div>
            {isOnline && (
                <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
            {!isOnline && (
                <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
        </div>
    )
}