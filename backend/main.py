#uvicorn main:app
#uvicorn main:app --reload

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
import openai

#custom function imports
from functions.openai_requests import convert_audio_to_text, get_chat_response
from functions.database import store_messages, reset_messages
from functions.text_to_speech import convert_text_to_speech

#init
app = FastAPI()

#CORS - Origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
]

#CORS - middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def check_health():
    return {"message": "healthy"}

# Reset messages
@app.get("/reset")
async def reset_conversation():
    reset_messages()
    return {"message": "Coversation reset"}

# post bot response
# note: Not playing in browser when uusing post request
@app.get("/post-audio-get")
async def get_audio():
    
    # Get saved audio
    audio_input = open("voice.mp3", "rb") #read bytes
    
    # Decode audo
    message_decoded = convert_audio_to_text(audio_input)
    
    # Guard: exsure message decoded
    if not message_decoded:
        return HTTPException(status_code=400, detail="Failed to decode audio")

    # Get ChatGPT response
    chat_response = get_chat_response(message_decoded)

    # Guard: exsure message decoded
    if not chat_response:
        return HTTPException(status_code=400, detail="Failed to get chat response")

    # Store messages
    store_messages(message_decoded, chat_response)

    # convert chat res to audio
    audio_output = convert_audio_to_text(chat_response)

    # Guard: exsure audio output
    if not audio_output:
        return HTTPException(status_code=400, detail="Failed to get audio output")
    
    # create a generator that yields chunks of data
    def iterfile():
        yield audio_input

        return StreamingResponse(iterfile(), media_type="audio/mpeg")

    return "Done"