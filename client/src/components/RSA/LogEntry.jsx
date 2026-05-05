export default function LogEntry({ content, color }) {

    const colorMap = {
        "yellow": "bg-yellow-900 bg-opacity-30 text-yellow-300",
        "white": "bg-white bg-opacity-5 text-white text-opacity-50",
        "green": "bg-green-900 bg-opacity-25 text-green-400",
        "red": "bg-red-900 bg-opacity-20 text-red-400",
        "purple": "bg-indigo-900 bg-opacity-25 text-indigo-300"
    }

    return(
        <div className={`font-mono ${colorMap[color]} text-[9px] px-1.5 py-0.5 inline-flex items-center rounded-md w-fit
            transition-all duration-500 ease-out
            translate-y-2 animate-[fadeIn_0.4s_forwards]"
        `}>
            {content}
        </div>
    );
}