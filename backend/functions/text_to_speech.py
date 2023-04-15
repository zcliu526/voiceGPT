import requests

from decouple import config

ELEVENT_LABS_API_KEY  = config("ELEVENT_LABS_API_KEY")

# Eleven labs
# Covert Text to Speech

def convert_text_to_speech(message):

    # Define request body
    body = {
        "text": message,
        "voice_settings": {
            "stability": 0,
            "similarity_boost": 0,
        }
    }

    # Defind voice person
    voice_rachel = "21m00Tcm4TlvDq8ikWAM"

    #  Set headers and endpoints
    headers = {
        "xi-api-key": ELEVENT_LABS_API_KEY,
        "Content-Type": "application/json",
        "accept": "audio/mpeg"
    }
    endpoint = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_rachel}"

    # send request
    try:
        response = requests.post(endpoint, json=body, headers=headers)
    except Exception as e:
        return

    # handle response
    if response.status_code == 200:
        return response.content
    else:
        return