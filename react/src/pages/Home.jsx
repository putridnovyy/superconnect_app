import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import useAuthContext from "../context/AuthContext";

const API_KEY = "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";

const systemMessage = {
    role: "system",
    content:
        "Explain things like you're talking to someone with mental illness and help them to feel better. make the answer you give in the style of language like a close friend.",
};

function Home() {
    const { user } = useAuthContext();

    const [messages, setMessages] = useState([
        {
            message: `Halo ${user?.name}👋 Aku Super Connect, aku akan menjadi teman terbaikmu🦸`,
            sentTime: "just now",
            sender: "ChatGPT",
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (message) => {
        const newMessage = {
            message,
            direction: "outgoing",
            sender: "user",
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);

        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
    };

    async function processMessageToChatGPT(chatMessages) {
        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant";
            } else {
                role = "user";
            }
            return { role: role, content: messageObject.message };
        });

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [systemMessage, ...apiMessages],
        };

        await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(apiRequestBody),
        })
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                console.log(data);
                setMessages([
                    ...chatMessages,
                    {
                        message: data.choices[0].message.content,
                        sender: "ChatGPT",
                    },
                ]);
                setIsTyping(false);
            });
    }

    return (
        <div className="max-w-7xl mx-auto mt-12">
            <div className="w-full h-full chat-container">
                <MainContainer>
                    <ChatContainer>
                        <MessageList
                            scrollBehavior="smooth"
                            typingIndicator={
                                isTyping ? (
                                    <TypingIndicator content="Sebentar ya, aku sedang mengetik🌝" />
                                ) : null
                            }
                        >
                            {messages.map((message, i) => {
                                console.log(message);
                                return <Message key={i} model={message} />;
                            })}
                        </MessageList>
                        <MessageInput
                            placeholder="Type message here"
                            onSend={handleSend}
                        />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default Home;
