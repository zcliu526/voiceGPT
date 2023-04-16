import { useState } from "react";
import Title from "./Title";
import Recorder from "./Recorder";
import axios from "axios";

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const [blob, setBlob] = useState("");

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    // Append recorded message to messages
    const myMessage = { sender: "me", blobUrl };
    const messagesArr = [...messages, myMessage];

    // Convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // make audio a file to send
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");

        // Send from data to API endpoint
        await axios
          .post("http://localhost:8000/post-audio", formData, {
            headers: {
              "Content-Type": "audio/mpeg",
            },
            responseType: "arraybuffer",
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            // Append to audio
            const gptMessage = { sender: "VoiceGPT", blobUrl: audio.src };
            messagesArr.push(gptMessage);
            setMessages(messagesArr);

            // play audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err) => console.error(err.message));
        setIsLoading(false);
      });
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={messages} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* Conversation */}
        <div className="mt-5 px-5">
          {messages.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={
                  "flex flex-col " + (audio.sender == "VoiceGPT" ? "flex items-start" : "flex items-end")
                }
              >
                {/* Sender */}
                <div className="mt-4">
                  <p
                    className={
                      audio.sender == "VoiceGPT"
                        ? "text-left mr-2 italic text-green-500 pl-2"
                        : "text-right ml-2 italic text-blue-500 pr-3"
                    }
                  >
                    {audio.sender}
                  </p>

                  {/* Audio Message */}
                  <audio
                    src={audio.blobUrl}
                    className="appearance-none"
                    controls
                  />
                </div>
              </div>
            );
          })}

          {messages.length == 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">Send a message</div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
                Generating audio...
            </div>
          )}
        </div>

        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-green-500 to-orange-300">
          <div className="flex justify-center items-center w-full">
            <Recorder handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
